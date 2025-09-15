const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Initialize SQLite database
const db = new sqlite3.Database('./trustlens.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Create news_data table
    db.run(`
      CREATE TABLE IF NOT EXISTS news_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT UNIQUE NOT NULL,
        rating REAL NOT NULL,
        total_votes INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create votes table for tracking individual votes
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
        user_id TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(domain, user_id, ip_address)
      )
    `);

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_domain ON news_data(domain)');
    db.run('CREATE INDEX IF NOT EXISTS idx_rating ON news_data(rating)');
    db.run('CREATE INDEX IF NOT EXISTS idx_votes_domain ON votes(domain)');
  });
}

// Validation schemas
const ratingSchema = Joi.object({
  domain: Joi.string().domain().required(),
  rating: Joi.number().integer().min(1).max(10).required(),
  user_id: Joi.string().optional()
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get rating for a domain
app.get('/api/rating/:domain', (req, res) => {
  const { domain } = req.params;
  
  if (!domain || !isValidDomain(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  db.get(
    'SELECT domain, rating, total_votes, updated_at FROM news_data WHERE domain = ?',
    [domain],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Domain not found' });
      }
      
      res.json({
        domain: row.domain,
        rating: row.rating,
        total_votes: row.total_votes,
        last_updated: row.updated_at
      });
    }
  );
});

// Submit a rating for a domain
app.post('/api/rating', (req, res) => {
  const { error, value } = ratingSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { domain, rating, user_id } = value;
  const ip_address = req.ip || req.connection.remoteAddress;

  // Check if domain already exists
  db.get('SELECT * FROM news_data WHERE domain = ?', [domain], (err, existingRow) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (existingRow) {
      // Update existing rating
      updateRating(domain, rating, user_id, ip_address, res);
    } else {
      // Insert new rating
      insertNewRating(domain, rating, user_id, ip_address, res);
    }
  });
});

// Get top rated domains
app.get('/api/domains/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const minVotes = parseInt(req.query.min_votes) || 5;

  db.all(
    `SELECT domain, rating, total_votes, updated_at 
     FROM news_data 
     WHERE total_votes >= ? 
     ORDER BY rating DESC, total_votes DESC 
     LIMIT ?`,
    [minVotes, limit],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(rows);
    }
  );
});

// Get lowest rated domains
app.get('/api/domains/lowest', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const minVotes = parseInt(req.query.min_votes) || 5;

  db.all(
    `SELECT domain, rating, total_votes, updated_at 
     FROM news_data 
     WHERE total_votes >= ? 
     ORDER BY rating ASC, total_votes DESC 
     LIMIT ?`,
    [minVotes, limit],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json(rows);
    }
  );
});

// Helper functions
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|xn--[a-zA-Z0-9-]+)$/;
  return domainRegex.test(domain);
}

function updateRating(domain, rating, user_id, ip_address, res) {
  // First, try to insert the vote
  db.run(
    'INSERT OR IGNORE INTO votes (domain, rating, user_id, ip_address) VALUES (?, ?, ?, ?)',
    [domain, rating, user_id, ip_address],
    function(err) {
      if (err) {
        console.error('Error inserting vote:', err);
        return res.status(500).json({ error: 'Failed to record vote' });
      }

      if (this.changes === 0) {
        return res.status(409).json({ error: 'Vote already recorded for this domain' });
      }

      // Recalculate average rating
      db.get(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as total_votes FROM votes WHERE domain = ?',
        [domain],
        (err, result) => {
          if (err) {
            console.error('Error calculating average:', err);
            return res.status(500).json({ error: 'Failed to update rating' });
          }

          // Update the news_data table
          db.run(
            'UPDATE news_data SET rating = ?, total_votes = ?, updated_at = CURRENT_TIMESTAMP WHERE domain = ?',
            [result.avg_rating, result.total_votes, domain],
            (err) => {
              if (err) {
                console.error('Error updating news_data:', err);
                return res.status(500).json({ error: 'Failed to update rating' });
              }

              res.json({
                message: 'Rating updated successfully',
                domain: domain,
                new_rating: result.avg_rating,
                total_votes: result.total_votes
              });
            }
          );
        }
      );
    }
  );
}

function insertNewRating(domain, rating, user_id, ip_address, res) {
  // Insert the vote
  db.run(
    'INSERT INTO votes (domain, rating, user_id, ip_address) VALUES (?, ?, ?, ?)',
    [domain, rating, user_id, ip_address],
    function(err) {
      if (err) {
        console.error('Error inserting vote:', err);
        return res.status(500).json({ error: 'Failed to record vote' });
      }

      // Insert into news_data
      db.run(
        'INSERT INTO news_data (domain, rating, total_votes) VALUES (?, ?, 1)',
        [domain, rating],
        function(err) {
          if (err) {
            console.error('Error inserting news_data:', err);
            return res.status(500).json({ error: 'Failed to create domain entry' });
          }

          res.json({
            message: 'Rating created successfully',
            domain: domain,
            rating: rating,
            total_votes: 1
          });
        }
      );
    }
  );
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
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`TrustLens backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
