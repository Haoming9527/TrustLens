-- This file contains the table definitions and indexes for the TrustLens platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news_data table for storing domain ratings (simple: domain, rating)
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
