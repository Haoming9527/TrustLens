-- TrustLens Sample Data for Supabase
-- This file contains sample data to populate the TrustLens database

-- Insert sample users
INSERT INTO users (user_id, email, total_votes) VALUES
('user_001', 'john.doe@example.com', 15),
('user_002', 'jane.smith@example.com', 23),
('user_003', 'mike.wilson@example.com', 8),
('user_004', 'sarah.jones@example.com', 31),
('user_005', 'alex.brown@example.com', 12),
('user_006', 'lisa.davis@example.com', 19),
('user_007', 'tom.miller@example.com', 7),
('user_008', 'emma.garcia@example.com', 25),
('user_009', 'david.rodriguez@example.com', 14),
('user_010', 'anna.martinez@example.com', 22);

-- Insert domain categories
INSERT INTO domain_categories (domain, category, subcategory, country_code, language_code) VALUES
('cnn.com', 'news', 'international', 'US', 'en'),
('bbc.com', 'news', 'international', 'GB', 'en'),
('reuters.com', 'news', 'international', 'US', 'en'),
('ap.org', 'news', 'international', 'US', 'en'),
('nytimes.com', 'news', 'national', 'US', 'en'),
('washingtonpost.com', 'news', 'national', 'US', 'en'),
('theguardian.com', 'news', 'international', 'GB', 'en'),
('npr.org', 'news', 'national', 'US', 'en'),
('pbs.org', 'news', 'national', 'US', 'en'),
('aljazeera.com', 'news', 'international', 'QA', 'en'),
('foxnews.com', 'news', 'national', 'US', 'en'),
('msnbc.com', 'news', 'national', 'US', 'en'),
('cbsnews.com', 'news', 'national', 'US', 'en'),
('abcnews.go.com', 'news', 'national', 'US', 'en'),
('nbcnews.com', 'news', 'national', 'US', 'en'),
('breitbart.com', 'news', 'opinion', 'US', 'en'),
('infowars.com', 'news', 'conspiracy', 'US', 'en'),
('naturalnews.com', 'news', 'alternative', 'US', 'en'),
('theonion.com', 'news', 'satire', 'US', 'en'),
('buzzfeed.com', 'news', 'entertainment', 'US', 'en'),
('huffpost.com', 'news', 'opinion', 'US', 'en'),
('vox.com', 'news', 'explanatory', 'US', 'en'),
('fivethirtyeight.com', 'news', 'data', 'US', 'en'),
('politico.com', 'news', 'political', 'US', 'en'),
('bloomberg.com', 'news', 'business', 'US', 'en'),
('wsj.com', 'news', 'business', 'US', 'en'),
('ft.com', 'news', 'business', 'GB', 'en'),
('economist.com', 'news', 'international', 'GB', 'en'),
('time.com', 'news', 'magazine', 'US', 'en'),
('newsweek.com', 'news', 'magazine', 'US', 'en'),
('usatoday.com', 'news', 'national', 'US', 'en'),
('latimes.com', 'news', 'regional', 'US', 'en'),
('chicagotribune.com', 'news', 'regional', 'US', 'en'),
('bostonglobe.com', 'news', 'regional', 'US', 'en'),
('miamiherald.com', 'news', 'regional', 'US', 'en'),
('denverpost.com', 'news', 'regional', 'US', 'en'),
('seattletimes.com', 'news', 'regional', 'US', 'en'),
('sfchronicle.com', 'news', 'regional', 'US', 'en'),
('dallasnews.com', 'news', 'regional', 'US', 'en'),
('wikipedia.org', 'academic', 'encyclopedia', 'US', 'en'),
('scholar.google.com', 'academic', 'search', 'US', 'en'),
('jstor.org', 'academic', 'database', 'US', 'en'),
('pubmed.ncbi.nlm.nih.gov', 'academic', 'medical', 'US', 'en'),
('arxiv.org', 'academic', 'research', 'US', 'en'),
('twitter.com', 'social', 'microblogging', 'US', 'en'),
('facebook.com', 'social', 'social_network', 'US', 'en'),
('reddit.com', 'social', 'discussion', 'US', 'en'),
('youtube.com', 'social', 'video', 'US', 'en'),
('tiktok.com', 'social', 'video', 'US', 'en'),
('instagram.com', 'social', 'photo_sharing', 'US', 'en'),
('linkedin.com', 'social', 'professional', 'US', 'en'),
('snapchat.com', 'social', 'messaging', 'US', 'en'),
('telegram.org', 'social', 'messaging', 'US', 'en'),
('discord.com', 'social', 'gaming', 'US', 'en'),
('twitch.tv', 'social', 'streaming', 'US', 'en'),
('medium.com', 'blog', 'publishing', 'US', 'en'),
('substack.com', 'blog', 'newsletter', 'US', 'en'),
('wordpress.com', 'blog', 'platform', 'US', 'en'),
('blogger.com', 'blog', 'platform', 'US', 'en'),
('tumblr.com', 'blog', 'microblogging', 'US', 'en'),
('ghost.org', 'blog', 'publishing', 'US', 'en'),
('gov.uk', 'government', 'national', 'GB', 'en'),
('whitehouse.gov', 'government', 'national', 'US', 'en'),
('cdc.gov', 'government', 'health', 'US', 'en'),
('nih.gov', 'government', 'health', 'US', 'en'),
('fda.gov', 'government', 'health', 'US', 'en'),
('who.int', 'government', 'international', 'CH', 'en'),
('un.org', 'government', 'international', 'US', 'en'),
('europa.eu', 'government', 'international', 'BE', 'en'),
('parliament.uk', 'government', 'national', 'GB', 'en'),
('congress.gov', 'government', 'national', 'US', 'en'),
('senate.gov', 'government', 'national', 'US', 'en'),
('house.gov', 'government', 'national', 'US', 'en');

-- Insert domain metadata
INSERT INTO domain_metadata (domain, title, description, first_rated_at) VALUES
('cnn.com', 'CNN - Breaking News, Latest News and Videos', 'CNN is a multinational news-based pay television channel headquartered in Atlanta, Georgia.', NOW() - INTERVAL '30 days'),
('bbc.com', 'BBC - Homepage', 'The British Broadcasting Corporation is a British public service broadcaster.', NOW() - INTERVAL '25 days'),
('reuters.com', 'Reuters - Breaking International News & Views', 'Reuters is an international news organization owned by Thomson Reuters.', NOW() - INTERVAL '28 days'),
('ap.org', 'Associated Press News', 'The Associated Press is an American not-for-profit news agency headquartered in New York City.', NOW() - INTERVAL '22 days'),
('nytimes.com', 'The New York Times - Breaking News, US News, World News and Videos', 'The New York Times is an American newspaper based in New York City.', NOW() - INTERVAL '35 days'),
('washingtonpost.com', 'The Washington Post', 'The Washington Post is an American daily newspaper published in Washington, D.C.', NOW() - INTERVAL '20 days'),
('theguardian.com', 'The Guardian', 'The Guardian is a British daily newspaper.', NOW() - INTERVAL '18 days'),
('npr.org', 'NPR: National Public Radio', 'National Public Radio is an American privately and publicly funded non-profit media organization.', NOW() - INTERVAL '15 days'),
('pbs.org', 'PBS: Public Broadcasting Service', 'PBS is an American public broadcaster and television program distributor.', NOW() - INTERVAL '12 days'),
('aljazeera.com', 'Al Jazeera English', 'Al Jazeera English is a 24-hour English-language news and current affairs channel.', NOW() - INTERVAL '10 days'),
('foxnews.com', 'Fox News - Breaking News Updates | Latest News Headlines', 'Fox News is an American multinational conservative cable news television channel.', NOW() - INTERVAL '8 days'),
('msnbc.com', 'MSNBC - Breaking News and Video', 'MSNBC is an American news-based pay television cable channel.', NOW() - INTERVAL '6 days'),
('breitbart.com', 'Breitbart News Network', 'Breitbart News is an American far-right news and opinion website.', NOW() - INTERVAL '4 days'),
('infowars.com', 'Infowars', 'Infowars is an American conspiracy theory and fake news website.', NOW() - INTERVAL '2 days'),
('naturalnews.com', 'Natural News', 'Natural News is a website that promotes alternative medicine and conspiracy theories.', NOW() - INTERVAL '1 day'),
('theonion.com', 'The Onion - America''s Finest News Source', 'The Onion is an American satirical digital media company and newspaper organization.', NOW() - INTERVAL '5 days'),
('buzzfeed.com', 'BuzzFeed', 'BuzzFeed is an American internet media, news and entertainment company.', NOW() - INTERVAL '3 days'),
('huffpost.com', 'HuffPost', 'HuffPost is an American news and opinion website and blog.', NOW() - INTERVAL '7 days'),
('vox.com', 'Vox', 'Vox is an American news and opinion website owned by Vox Media.', NOW() - INTERVAL '9 days'),
('fivethirtyeight.com', 'FiveThirtyEight', 'FiveThirtyEight is a website that focuses on opinion poll analysis, politics, economics, and sports blogging.', NOW() - INTERVAL '11 days');

-- Insert sample votes (this will trigger the rating calculation)
INSERT INTO votes (domain, rating, user_id, ip_address, user_agent) VALUES
-- CNN votes (highly reliable)
('cnn.com', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('cnn.com', 8, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('cnn.com', 9, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('cnn.com', 8, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('cnn.com', 9, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- BBC votes (highly reliable)
('bbc.com', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('bbc.com', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('bbc.com', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('bbc.com', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('bbc.com', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Reuters votes (highly reliable)
('reuters.com', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('reuters.com', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('reuters.com', 9, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('reuters.com', 8, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('reuters.com', 9, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- AP votes (highly reliable)
('ap.org', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('ap.org', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('ap.org', 9, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('ap.org', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('ap.org', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- New York Times votes (highly reliable)
('nytimes.com', 8, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('nytimes.com', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('nytimes.com', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('nytimes.com', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('nytimes.com', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Fox News votes (mixed reliability)
('foxnews.com', 6, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('foxnews.com', 5, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('foxnews.com', 7, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('foxnews.com', 4, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('foxnews.com', 6, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Breitbart votes (unreliable)
('breitbart.com', 2, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('breitbart.com', 3, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('breitbart.com', 1, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('breitbart.com', 2, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('breitbart.com', 3, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Infowars votes (unreliable)
('infowars.com', 1, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('infowars.com', 1, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('infowars.com', 2, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('infowars.com', 1, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('infowars.com', 2, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Natural News votes (unreliable)
('naturalnews.com', 2, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('naturalnews.com', 1, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('naturalnews.com', 3, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('naturalnews.com', 2, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('naturalnews.com', 1, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- The Onion votes (satire - mixed ratings)
('theonion.com', 7, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('theonion.com', 8, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('theonion.com', 6, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('theonion.com', 7, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('theonion.com', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- BuzzFeed votes (mixed reliability)
('buzzfeed.com', 6, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('buzzfeed.com', 5, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('buzzfeed.com', 7, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('buzzfeed.com', 6, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('buzzfeed.com', 5, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Vox votes (reliable)
('vox.com', 8, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('vox.com', 7, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('vox.com', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('vox.com', 7, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('vox.com', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- FiveThirtyEight votes (highly reliable)
('fivethirtyeight.com', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('fivethirtyeight.com', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('fivethirtyeight.com', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('fivethirtyeight.com', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('fivethirtyeight.com', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Wikipedia votes (highly reliable)
('wikipedia.org', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('wikipedia.org', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('wikipedia.org', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('wikipedia.org', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('wikipedia.org', 9, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Twitter votes (mixed reliability)
('twitter.com', 6, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('twitter.com', 5, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('twitter.com', 7, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('twitter.com', 6, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('twitter.com', 5, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Facebook votes (mixed reliability)
('facebook.com', 5, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('facebook.com', 4, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('facebook.com', 6, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('facebook.com', 5, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('facebook.com', 4, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Reddit votes (mixed reliability)
('reddit.com', 6, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('reddit.com', 7, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('reddit.com', 5, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('reddit.com', 6, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('reddit.com', 7, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- YouTube votes (mixed reliability)
('youtube.com', 6, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('youtube.com', 5, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('youtube.com', 7, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('youtube.com', 6, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('youtube.com', 5, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Medium votes (mixed reliability)
('medium.com', 7, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('medium.com', 6, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('medium.com', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('medium.com', 7, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('medium.com', 6, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

-- Government sites votes (highly reliable)
('gov.uk', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('gov.uk', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('gov.uk', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('gov.uk', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('gov.uk', 9, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

('whitehouse.gov', 8, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('whitehouse.gov', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('whitehouse.gov', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('whitehouse.gov', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('whitehouse.gov', 8, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

('cdc.gov', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('cdc.gov', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('cdc.gov', 9, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('cdc.gov', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('cdc.gov', 9, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'),

('who.int', 9, 'user_001', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('who.int', 9, 'user_002', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('who.int', 8, 'user_003', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('who.int', 9, 'user_004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0'),
('who.int', 9, 'user_005', '192.168.1.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15');

-- Update domain metadata with first_rated_at timestamps
UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '30 days'
WHERE domain IN ('cnn.com', 'bbc.com', 'reuters.com', 'ap.org', 'nytimes.com');

UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '25 days'
WHERE domain IN ('washingtonpost.com', 'theguardian.com', 'npr.org', 'pbs.org', 'aljazeera.com');

UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '20 days'
WHERE domain IN ('foxnews.com', 'msnbc.com', 'cbsnews.com', 'abcnews.go.com', 'nbcnews.com');

UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '15 days'
WHERE domain IN ('breitbart.com', 'infowars.com', 'naturalnews.com', 'theonion.com', 'buzzfeed.com');

UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '10 days'
WHERE domain IN ('huffpost.com', 'vox.com', 'fivethirtyeight.com', 'politico.com', 'bloomberg.com');

UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '5 days'
WHERE domain IN ('wikipedia.org', 'twitter.com', 'facebook.com', 'reddit.com', 'youtube.com');

UPDATE domain_metadata 
SET first_rated_at = NOW() - INTERVAL '3 days'
WHERE domain IN ('medium.com', 'gov.uk', 'whitehouse.gov', 'cdc.gov', 'who.int');
