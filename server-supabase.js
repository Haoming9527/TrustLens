const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['chrome-extension://*'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validation schemas
const ratingSchema = Joi.object({
  domain: Joi.string().domain().required(),
  rating: Joi.number().integer().min(1).max(10).required(),
  user_id: Joi.string().optional()
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Supabase',
    version: '1.0.0'
  });
});

// Get rating for a domain
app.get('/api/rating/:domain', async (req, res) => {
  const { domain } = req.params;
  
  if (!domain || !isValidDomain(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  try {
    const { data, error } = await supabase
      .from('news_data')
      .select('domain, rating, total_votes, updated_at')
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Domain not found' });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({
      domain: data.domain,
      rating: parseFloat(data.rating),
      total_votes: data.total_votes,
      last_updated: data.updated_at
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a rating for a domain
app.post('/api/rating', async (req, res) => {
  const { error, value } = ratingSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { domain, rating, user_id } = value;
  const ip_address = req.ip || req.connection.remoteAddress;
  const user_agent = req.get('User-Agent');

  try {
    // Check if user exists, create if not
    if (user_id) {
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          user_id: user_id,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (userError) {
        console.error('Error upserting user:', userError);
      }
    }

    // Insert the vote
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .insert({
        domain: domain,
        rating: rating,
        user_id: user_id,
        ip_address: ip_address,
        user_agent: user_agent
      })
      .select()
      .single();

    if (voteError) {
      if (voteError.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Vote already recorded for this domain' });
      }
      console.error('Error inserting vote:', voteError);
      return res.status(500).json({ error: 'Failed to record vote' });
    }

    // The trigger will automatically update news_data table
    // Let's fetch the updated rating
    const { data: updatedRating, error: ratingError } = await supabase
      .from('news_data')
      .select('domain, rating, total_votes')
      .eq('domain', domain)
      .single();

    if (ratingError) {
      console.error('Error fetching updated rating:', ratingError);
      return res.status(500).json({ error: 'Failed to update rating' });
    }

    res.json({
      message: 'Rating submitted successfully',
      domain: domain,
      new_rating: parseFloat(updatedRating.rating),
      total_votes: updatedRating.total_votes
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top rated domains
app.get('/api/domains/top', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const minVotes = parseInt(req.query.min_votes) || 5;

  try {
    const { data, error } = await supabase
      .rpc('get_top_rated_domains', {
        limit_count: limit,
        min_votes: minVotes
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lowest rated domains
app.get('/api/domains/lowest', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const minVotes = parseInt(req.query.min_votes) || 5;

  try {
    const { data, error } = await supabase
      .rpc('get_lowest_rated_domains', {
        limit_count: limit,
        min_votes: minVotes
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get domain statistics
app.get('/api/domains/:domain/stats', async (req, res) => {
  const { domain } = req.params;
  
  if (!domain || !isValidDomain(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  try {
    const { data, error } = await supabase
      .rpc('get_domain_stats', { domain_name: domain });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json(data[0]);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all domains with pagination
app.get('/api/domains', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const minVotes = parseInt(req.query.min_votes) || 1;

  try {
    const { data, error, count } = await supabase
      .from('public_domain_ratings')
      .select('*', { count: 'exact' })
      .gte('total_votes', minVotes)
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search domains
app.get('/api/domains/search', async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 10;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters long' });
  }

  try {
    const { data, error } = await supabase
      .from('public_domain_ratings')
      .select('*')
      .ilike('domain', `%${query}%`)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [
      { data: totalDomains, error: domainsError },
      { data: totalVotes, error: votesError },
      { data: totalUsers, error: usersError },
      { data: avgRating, error: ratingError }
    ] = await Promise.all([
      supabase.from('news_data').select('id', { count: 'exact', head: true }),
      supabase.from('votes').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('news_data').select('rating').not('rating', 'is', null)
    ]);

    if (domainsError || votesError || usersError) {
      console.error('Error fetching stats:', { domainsError, votesError, usersError });
      return res.status(500).json({ error: 'Internal server error' });
    }

    const averageRating = avgRating?.data ? 
      avgRating.data.reduce((sum, item) => sum + parseFloat(item.rating), 0) / avgRating.data.length : 0;

    res.json({
      total_domains: totalDomains?.length || 0,
      total_votes: totalVotes?.length || 0,
      total_users: totalUsers?.length || 0,
      average_rating: Math.round(averageRating * 10) / 10
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|xn--[a-zA-Z0-9-]+)$/;
  return domainRegex.test(domain);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`TrustLens backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database: Supabase`);
});
