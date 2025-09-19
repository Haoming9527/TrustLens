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
    // Create simplified news_data table (domain, rating)
    db.run(`
      CREATE TABLE IF NOT EXISTS news_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT UNIQUE NOT NULL,
        rating REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_domain ON news_data(domain)');
    db.run('CREATE INDEX IF NOT EXISTS idx_rating ON news_data(rating)');
  });
}

// Validation schemas
const ratingSchema = Joi.object({
  domain: Joi.string().domain().required(),
  rating: Joi.number().min(1).max(10).required()
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
    'SELECT domain, rating, updated_at FROM news_data WHERE domain = ?',
    [domain],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Domain not found' });
      }
      
      res.json({ domain: row.domain, rating: row.rating, last_updated: row.updated_at });
    }
  );
});

// Create or update rating for a domain (no voting, direct set)
app.put('/api/rating', (req, res) => {
  const { error, value } = ratingSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { domain, rating } = value;

  db.run(
    'INSERT INTO news_data (domain, rating) VALUES (?, ?) ON CONFLICT(domain) DO UPDATE SET rating = excluded.rating, updated_at = CURRENT_TIMESTAMP',
    [domain, rating],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      return res.json({ message: 'Rating saved', domain, rating });
    }
  );
});

// Get top rated domains
app.get('/api/domains/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  db.all(
    `SELECT domain, rating, updated_at 
     FROM news_data 
     ORDER BY rating DESC 
     LIMIT ?`,
    [limit],
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

  db.all(
    `SELECT domain, rating, updated_at 
     FROM news_data 
     ORDER BY rating ASC 
     LIMIT ?`,
    [limit],
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

// Removed voting helper functions

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
