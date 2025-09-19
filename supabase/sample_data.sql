-- TrustLens Sample Data (simple)
-- Run this against your Supabase/Postgres database after creating the simplified schema.
-- Populates news_data with example domains and ratings.

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


