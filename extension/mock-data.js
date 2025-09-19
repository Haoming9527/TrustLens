// Mock data for TrustLens when Supabase is not accessible
const MOCK_DATA = {
    'wikipedia.org': { domain: 'wikipedia.org', rating: 8.9, created_at: '2024-01-15T10:00:00Z' },
    'cnn.com': { domain: 'cnn.com', rating: 8.6, created_at: '2024-01-15T10:00:00Z' },
    'bbc.com': { domain: 'bbc.com', rating: 8.8, created_at: '2024-01-15T10:00:00Z' },
    'reuters.com': { domain: 'reuters.com', rating: 8.9, created_at: '2024-01-15T10:00:00Z' },
    'ap.org': { domain: 'ap.org', rating: 8.7, created_at: '2024-01-15T10:00:00Z' },
    'nytimes.com': { domain: 'nytimes.com', rating: 8.4, created_at: '2024-01-15T10:00:00Z' },
    'washingtonpost.com': { domain: 'washingtonpost.com', rating: 8.2, created_at: '2024-01-15T10:00:00Z' },
    'theguardian.com': { domain: 'theguardian.com', rating: 8.0, created_at: '2024-01-15T10:00:00Z' },
    'npr.org': { domain: 'npr.org', rating: 8.3, created_at: '2024-01-15T10:00:00Z' },
    'pbs.org': { domain: 'pbs.org', rating: 8.5, created_at: '2024-01-15T10:00:00Z' },
    'aljazeera.com': { domain: 'aljazeera.com', rating: 7.9, created_at: '2024-01-15T10:00:00Z' },
    'bloomberg.com': { domain: 'bloomberg.com', rating: 8.1, created_at: '2024-01-15T10:00:00Z' },
    'wsj.com': { domain: 'wsj.com', rating: 8.0, created_at: '2024-01-15T10:00:00Z' },
    'foxnews.com': { domain: 'foxnews.com', rating: 5.6, created_at: '2024-01-15T10:00:00Z' },
    'msnbc.com': { domain: 'msnbc.com', rating: 6.2, created_at: '2024-01-15T10:00:00Z' },
    'breitbart.com': { domain: 'breitbart.com', rating: 2.2, created_at: '2024-01-15T10:00:00Z' },
    'infowars.com': { domain: 'infowars.com', rating: 1.4, created_at: '2024-01-15T10:00:00Z' },
    'naturalnews.com': { domain: 'naturalnews.com', rating: 1.8, created_at: '2024-01-15T10:00:00Z' },
    'theonion.com': { domain: 'theonion.com', rating: 7.2, created_at: '2024-01-15T10:00:00Z' },
    'buzzfeed.com': { domain: 'buzzfeed.com', rating: 5.8, created_at: '2024-01-15T10:00:00Z' },
    'huffpost.com': { domain: 'huffpost.com', rating: 6.8, created_at: '2024-01-15T10:00:00Z' },
    'vox.com': { domain: 'vox.com', rating: 7.6, created_at: '2024-01-15T10:00:00Z' },
    'fivethirtyeight.com': { domain: 'fivethirtyeight.com', rating: 8.8, created_at: '2024-01-15T10:00:00Z' },
    'twitter.com': { domain: 'twitter.com', rating: 5.8, created_at: '2024-01-15T10:00:00Z' },
    'facebook.com': { domain: 'facebook.com', rating: 5.0, created_at: '2024-01-15T10:00:00Z' },
    'reddit.com': { domain: 'reddit.com', rating: 6.2, created_at: '2024-01-15T10:00:00Z' },
    'youtube.com': { domain: 'youtube.com', rating: 5.8, created_at: '2024-01-15T10:00:00Z' },
    'medium.com': { domain: 'medium.com', rating: 6.8, created_at: '2024-01-15T10:00:00Z' },
    'gov.uk': { domain: 'gov.uk', rating: 8.9, created_at: '2024-01-15T10:00:00Z' },
    'whitehouse.gov': { domain: 'whitehouse.gov', rating: 8.6, created_at: '2024-01-15T10:00:00Z' },
    'cdc.gov': { domain: 'cdc.gov', rating: 8.9, created_at: '2024-01-15T10:00:00Z' },
    'who.int': { domain: 'who.int', rating: 8.9, created_at: '2024-01-15T10:00:00Z' }
};

// Mock functions
function getMockRating(domain) {
    return MOCK_DATA[domain] || null;
}

function getMockStats() {
    const allData = Object.values(MOCK_DATA);
    const totalDomains = allData.length;
    const averageRating = allData.reduce((sum, item) => sum + item.rating, 0) / allData.length;
    
    return {
        totalDomains,
        averageRating: averageRating.toFixed(1)
    };
}

function getMockTopRated(limit = 10) {
    return Object.values(MOCK_DATA)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

function getMockLowestRated(limit = 10) {
    return Object.values(MOCK_DATA)
        .sort((a, b) => a.rating - b.rating)
        .slice(0, limit);
}

// Make functions available globally
window.MOCK_DATA = MOCK_DATA;
window.getMockRating = getMockRating;
window.getMockStats = getMockStats;
window.getMockTopRated = getMockTopRated;
window.getMockLowestRated = getMockLowestRated;
