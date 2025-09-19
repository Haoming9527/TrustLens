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
  rating: Joi.number().min(1).max(10).required()
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
      .select('domain, rating')
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Domain not found' });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({ domain: data.domain, rating: parseFloat(data.rating) });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update rating for a domain (no voting, direct set)
app.put('/api/rating', async (req, res) => {
  const { error, value } = ratingSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { domain, rating } = value;

  try {
    const { error: upsertError } = await supabase
      .from('news_data')
      .upsert({ domain, rating }, { onConflict: 'domain' });

    if (upsertError) {
      console.error('Error upserting rating:', upsertError);
      return res.status(500).json({ error: 'Failed to save rating' });
    }

    return res.json({ message: 'Rating saved', domain, rating });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top rated domains
app.get('/api/domains/top', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { data, error } = await supabase
      .from('news_data')
      .select('domain, rating')
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

// Get lowest rated domains
app.get('/api/domains/lowest', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { data, error } = await supabase
      .from('news_data')
      .select('domain, rating')
      .order('rating', { ascending: true })
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

// Removed complex stats endpoint

// Get all domains with pagination
app.get('/api/domains', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const { data, error, count } = await supabase
      .from('news_data')
      .select('domain, rating', { count: 'exact' })
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
      .from('news_data')
      .select('domain, rating')
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

// Removed complex platform statistics endpoint

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
