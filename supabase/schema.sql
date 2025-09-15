-- TrustLens Database Schema for Supabase
-- This file contains the table definitions and indexes for the TrustLens platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news_data table for storing domain ratings
CREATE TABLE IF NOT EXISTS news_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL,
    rating DECIMAL(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
    total_votes INTEGER DEFAULT 1 CHECK (total_votes > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table for tracking individual votes
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    user_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, user_id, ip_address)
);

-- Create users table for tracking user information (optional)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_votes INTEGER DEFAULT 0
);

-- Create domain_categories table for categorizing domains
CREATE TABLE IF NOT EXISTS domain_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('news', 'blog', 'social', 'government', 'academic', 'other')),
    subcategory TEXT,
    country_code TEXT(2),
    language_code TEXT(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create domain_metadata table for additional domain information
CREATE TABLE IF NOT EXISTS domain_metadata (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    favicon_url TEXT,
    first_rated_at TIMESTAMP WITH TIME ZONE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_data_domain ON news_data(domain);
CREATE INDEX IF NOT EXISTS idx_news_data_rating ON news_data(rating);
CREATE INDEX IF NOT EXISTS idx_news_data_total_votes ON news_data(total_votes);
CREATE INDEX IF NOT EXISTS idx_news_data_updated_at ON news_data(updated_at);

CREATE INDEX IF NOT EXISTS idx_votes_domain ON votes(domain);
CREATE INDEX IF NOT EXISTS idx_votes_rating ON votes(rating);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_domain_categories_domain ON domain_categories(domain);
CREATE INDEX IF NOT EXISTS idx_domain_categories_category ON domain_categories(category);
CREATE INDEX IF NOT EXISTS idx_domain_categories_country ON domain_categories(country_code);

CREATE INDEX IF NOT EXISTS idx_domain_metadata_domain ON domain_metadata(domain);
CREATE INDEX IF NOT EXISTS idx_domain_metadata_is_active ON domain_metadata(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_news_data_updated_at 
    BEFORE UPDATE ON news_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_categories_updated_at 
    BEFORE UPDATE ON domain_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_metadata_updated_at 
    BEFORE UPDATE ON domain_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to recalculate domain rating when votes are added
CREATE OR REPLACE FUNCTION recalculate_domain_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the news_data table with new average rating and vote count
    INSERT INTO news_data (domain, rating, total_votes)
    VALUES (
        NEW.domain,
        (SELECT AVG(rating)::DECIMAL(3,1) FROM votes WHERE domain = NEW.domain),
        (SELECT COUNT(*) FROM votes WHERE domain = NEW.domain)
    )
    ON CONFLICT (domain) DO UPDATE SET
        rating = EXCLUDED.rating,
        total_votes = EXCLUDED.total_votes,
        updated_at = NOW();
    
    -- Update user vote count
    UPDATE users 
    SET total_votes = total_votes + 1,
        last_active = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to recalculate ratings when votes are added
CREATE TRIGGER recalculate_rating_after_vote
    AFTER INSERT ON votes
    FOR EACH ROW EXECUTE FUNCTION recalculate_domain_rating();

-- Create function to get domain statistics
CREATE OR REPLACE FUNCTION get_domain_stats(domain_name TEXT)
RETURNS TABLE (
    domain TEXT,
    rating DECIMAL(3,1),
    total_votes INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE,
    category TEXT,
    country_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nd.domain,
        nd.rating,
        nd.total_votes,
        nd.updated_at,
        dc.category,
        dc.country_code
    FROM news_data nd
    LEFT JOIN domain_categories dc ON nd.domain = dc.domain
    WHERE nd.domain = domain_name;
END;
$$ language 'plpgsql';

-- Create function to get top rated domains
CREATE OR REPLACE FUNCTION get_top_rated_domains(
    limit_count INTEGER DEFAULT 10,
    min_votes INTEGER DEFAULT 5
)
RETURNS TABLE (
    domain TEXT,
    rating DECIMAL(3,1),
    total_votes INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nd.domain,
        nd.rating,
        nd.total_votes,
        nd.updated_at,
        dc.category
    FROM news_data nd
    LEFT JOIN domain_categories dc ON nd.domain = dc.domain
    WHERE nd.total_votes >= min_votes
    ORDER BY nd.rating DESC, nd.total_votes DESC
    LIMIT limit_count;
END;
$$ language 'plpgsql';

-- Create function to get lowest rated domains
CREATE OR REPLACE FUNCTION get_lowest_rated_domains(
    limit_count INTEGER DEFAULT 10,
    min_votes INTEGER DEFAULT 5
)
RETURNS TABLE (
    domain TEXT,
    rating DECIMAL(3,1),
    total_votes INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        nd.domain,
        nd.rating,
        nd.total_votes,
        nd.updated_at,
        dc.category
    FROM news_data nd
    LEFT JOIN domain_categories dc ON nd.domain = dc.domain
    WHERE nd.total_votes >= min_votes
    ORDER BY nd.rating ASC, nd.total_votes DESC
    LIMIT limit_count;
END;
$$ language 'plpgsql';

-- Create RLS (Row Level Security) policies
ALTER TABLE news_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access to news_data
CREATE POLICY "Allow public read access to news_data" ON news_data
    FOR SELECT USING (true);

-- Allow public read access to domain_categories
CREATE POLICY "Allow public read access to domain_categories" ON domain_categories
    FOR SELECT USING (true);

-- Allow public read access to domain_metadata
CREATE POLICY "Allow public read access to domain_metadata" ON domain_metadata
    FOR SELECT USING (true);

-- Allow public insert/update access to votes
CREATE POLICY "Allow public insert access to votes" ON votes
    FOR INSERT WITH CHECK (true);

-- Allow public insert/update access to users
CREATE POLICY "Allow public insert access to users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to users" ON users
    FOR UPDATE USING (true);

-- Create a view for public domain ratings
CREATE OR REPLACE VIEW public_domain_ratings AS
SELECT 
    nd.domain,
    nd.rating,
    nd.total_votes,
    nd.updated_at,
    dc.category,
    dc.country_code,
    dm.title,
    dm.description
FROM news_data nd
LEFT JOIN domain_categories dc ON nd.domain = dc.domain
LEFT JOIN domain_metadata dm ON nd.domain = dm.domain
WHERE nd.total_votes >= 1;

-- Grant access to the view
GRANT SELECT ON public_domain_ratings TO anon, authenticated;
