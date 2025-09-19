# TrustLens Supabase Setup Guide

This guide will help you set up TrustLens to use your Supabase database for domain ratings.

## Prerequisites

1. A Supabase account and project
2. The TrustLens extension files

## Step 1: Set up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to create the `news_data` table:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news_data table for storing domain ratings
CREATE TABLE IF NOT EXISTS news_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL,
    rating DECIMAL(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_data_domain ON news_data(domain);
CREATE INDEX IF NOT EXISTS idx_news_data_rating ON news_data(rating);

-- RLS (Row Level Security) policies
ALTER TABLE news_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access to news_data
CREATE POLICY "Allow public read access to news_data" ON news_data
    FOR SELECT USING (true);
```

4. Insert sample data (optional):

```sql
INSERT INTO news_data (domain, rating) VALUES
('cnn.com', 8.6),
('bbc.com', 8.8),
('reuters.com', 8.9),
('ap.org', 8.7),
('nytimes.com', 8.4),
('washingtonpost.com', 8.2),
('theguardian.com', 8.0),
('npr.org', 8.3),
('pbs.org', 8.5),
('aljazeera.com', 7.9),
('bloomberg.com', 8.1),
('wsj.com', 8.0),
('foxnews.com', 5.6),
('msnbc.com', 6.2),
('breitbart.com', 2.2),
('infowars.com', 1.4),
('naturalnews.com', 1.8),
('theonion.com', 7.2),
('buzzfeed.com', 5.8),
('huffpost.com', 6.8),
('vox.com', 7.6),
('fivethirtyeight.com', 8.8),
('wikipedia.org', 8.9),
('twitter.com', 5.8),
('facebook.com', 5.0),
('reddit.com', 6.2),
('youtube.com', 5.8),
('medium.com', 6.8),
('gov.uk', 8.9),
('whitehouse.gov', 8.6),
('cdc.gov', 8.9),
('who.int', 8.9);
```

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy your Project URL
3. Copy your `anon` public key

## Step 3: Configure the Extension

1. Open `extension/config.js`
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key

Example:
```javascript
const CONFIG = {
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here'
};
```

## Step 4: Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension should now be loaded and ready to use

## Features

The updated TrustLens extension now:

- **Displays domain ratings** from your Supabase database
- **Shows domain information** including source and last updated date
- **Removes user rating functionality** - no more voting/rating by users
- **Shows statistics** from the database (total domains, average rating)
- **Displays top/lowest rated domains** from the database
- **Shows ratings on web pages** via content script injection

## Database Schema

The `news_data` table has the following structure:

- `id`: UUID primary key
- `domain`: Text field for the domain name (unique)
- `rating`: Decimal rating from 1.0 to 10.0
- `created_at`: Timestamp when the record was created

## Security

- Row Level Security (RLS) is enabled
- Public read access is allowed for the `news_data` table
- No write access is provided to the extension (read-only)

## Troubleshooting

1. **Extension not loading**: Check that all files are in the correct location
2. **No ratings showing**: Verify your Supabase credentials are correct
3. **Database errors**: Check that the table exists and has the correct schema
4. **CORS issues**: Ensure your Supabase project allows requests from Chrome extensions

## Next Steps

- Add more domains to your database
- Update ratings as needed
- Consider adding more metadata fields to the `news_data` table
- Implement additional features like domain categorization or source verification
