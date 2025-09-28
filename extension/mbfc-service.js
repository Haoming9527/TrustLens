// MBFC (Media Bias/Fact Check) Integration Service
class MBFCService {
    constructor() {
        this.baseUrl = 'https://mediabiasfactcheck.com';
        this.cache = new Map();
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    // MBFC Bias Ratings
    getBiasRating(bias) {
        const biasMap = {
            'left': { score: 85, color: '#28a745', label: 'Left', description: 'Left-leaning' },
            'left-center': { score: 75, color: '#6bcf7f', label: 'Left-Center', description: 'Left-center bias' },
            'center': { score: 90, color: '#28a745', label: 'Center', description: 'Least biased' },
            'right-center': { score: 75, color: '#ffc107', label: 'Right-Center', description: 'Right-center bias' },
            'right': { score: 85, color: '#28a745', label: 'Right', description: 'Right-leaning' },
            'conspiracy': { score: 25, color: '#dc3545', label: 'Conspiracy', description: 'Conspiracy theories' },
            'pseudoscience': { score: 30, color: '#dc3545', label: 'Pseudoscience', description: 'Pseudoscience' },
            'satire': { score: 50, color: '#ffc107', label: 'Satire', description: 'Satirical content' },
            'fake-news': { score: 15, color: '#dc3545', label: 'Fake News', description: 'Fake news' },
            'questionable': { score: 35, color: '#fd7e14', label: 'Questionable', description: 'Questionable source' }
        };
        return biasMap[bias.toLowerCase()] || { score: 50, color: '#666', label: 'Unknown', description: 'Unknown bias' };
    }

    // MBFC Factual Reporting Ratings
    getFactualRating(factual) {
        const factualMap = {
            'very-high': { score: 95, color: '#28a745', label: 'Very High', description: 'Very high factual reporting' },
            'high': { score: 85, color: '#28a745', label: 'High', description: 'High factual reporting' },
            'mostly-factual': { score: 75, color: '#6bcf7f', label: 'Mostly Factual', description: 'Mostly factual reporting' },
            'mixed': { score: 60, color: '#ffc107', label: 'Mixed', description: 'Mixed factual reporting' },
            'low': { score: 40, color: '#fd7e14', label: 'Low', description: 'Low factual reporting' },
            'very-low': { score: 25, color: '#dc3545', label: 'Very Low', description: 'Very low factual reporting' },
            'not-rated': { score: 50, color: '#666', label: 'Not Rated', description: 'Not rated for factual reporting' }
        };
        return factualMap[factual.toLowerCase()] || { score: 50, color: '#666', label: 'Unknown', description: 'Unknown factual rating' };
    }

    // Calculate combined score from bias and factual ratings
    calculateCombinedScore(biasRating, factualRating) {
        // Weight: 60% factual, 40% bias (factual reporting is more important)
        const factualWeight = 0.6;
        const biasWeight = 0.4;
        
        const combinedScore = (factualRating.score * factualWeight) + (biasRating.score * biasWeight);
        
        // Determine overall rating
        if (combinedScore >= 90) return { score: combinedScore, rating: 'A+', color: '#28a745', label: 'Highly Reliable' };
        if (combinedScore >= 80) return { score: combinedScore, rating: 'A', color: '#28a745', label: 'Reliable' };
        if (combinedScore >= 70) return { score: combinedScore, rating: 'B', color: '#6bcf7f', label: 'Mostly Reliable' };
        if (combinedScore >= 60) return { score: combinedScore, rating: 'C', color: '#ffc107', label: 'Mixed Reliability' };
        if (combinedScore >= 40) return { score: combinedScore, rating: 'D', color: '#fd7e14', label: 'Questionable' };
        return { score: combinedScore, rating: 'F', color: '#dc3545', label: 'Unreliable' };
    }

    // Check cache for existing data
    getCachedData(domain) {
        const cached = this.cache.get(domain);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }
        return null;
    }

    // Cache data
    setCachedData(domain, data) {
        this.cache.set(domain, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Simulate MBFC data lookup (since we can't directly access their API)
    async getMBFCData(domain) {
        // Check cache first
        const cached = this.getCachedData(domain);
        if (cached) {
            console.log('MBFC: Using cached data for', domain);
            return cached;
        }

        try {
            // Simulate MBFC data based on known patterns
            const mbfcData = await this.simulateMBFCLookup(domain);
            
            if (mbfcData) {
                // Cache the result
                this.setCachedData(domain, mbfcData);
                console.log('MBFC: Retrieved data for', domain);
                return mbfcData;
            }
        } catch (error) {
            console.error('MBFC: Error retrieving data for', domain, error);
        }

        return null;
    }

    // Simulate MBFC lookup with realistic data
    async simulateMBFCLookup(domain) {
        // This simulates what MBFC data would look like
        // In a real implementation, you'd make API calls to MBFC
        
        const mbfcDatabase = {
            'cnn.com': {
                bias: 'left-center',
                factual: 'high',
                country: 'US',
                language: 'English',
                traffic: 'very-high',
                credibility: 'high'
            },
            'foxnews.com': {
                bias: 'right',
                factual: 'high',
                country: 'US',
                language: 'English',
                traffic: 'very-high',
                credibility: 'high'
            },
            'bbc.com': {
                bias: 'center',
                factual: 'very-high',
                country: 'UK',
                language: 'English',
                traffic: 'very-high',
                credibility: 'very-high'
            },
            'reuters.com': {
                bias: 'center',
                factual: 'very-high',
                country: 'International',
                language: 'English',
                traffic: 'high',
                credibility: 'very-high'
            },
            'infowars.com': {
                bias: 'conspiracy',
                factual: 'very-low',
                country: 'US',
                language: 'English',
                traffic: 'medium',
                credibility: 'very-low'
            },
            'breitbart.com': {
                bias: 'right',
                factual: 'low',
                country: 'US',
                language: 'English',
                traffic: 'high',
                credibility: 'low'
            },
            'huffpost.com': {
                bias: 'left',
                factual: 'mostly-factual',
                country: 'US',
                language: 'English',
                traffic: 'high',
                credibility: 'medium'
            },
            'theonion.com': {
                bias: 'satire',
                factual: 'not-rated',
                country: 'US',
                language: 'English',
                traffic: 'medium',
                credibility: 'satire'
            }
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        const domainData = mbfcDatabase[domain];
        if (!domainData) {
            return null;
        }

        const biasRating = this.getBiasRating(domainData.bias);
        const factualRating = this.getFactualRating(domainData.factual);
        const combinedRating = this.calculateCombinedScore(biasRating, factualRating);

        return {
            domain: domain,
            bias: {
                rating: domainData.bias,
                score: biasRating.score,
                label: biasRating.label,
                color: biasRating.color,
                description: biasRating.description
            },
            factual: {
                rating: domainData.factual,
                score: factualRating.score,
                label: factualRating.label,
                color: factualRating.color,
                description: factualRating.description
            },
            combined: {
                score: combinedRating.score,
                rating: combinedRating.rating,
                color: combinedRating.color,
                label: combinedRating.label
            },
            metadata: {
                country: domainData.country,
                language: domainData.language,
                traffic: domainData.traffic,
                credibility: domainData.credibility,
                source: 'MBFC',
                lastUpdated: new Date().toISOString()
            }
        };
    }

    // Get enhanced rating combining MBFC and local data
    async getEnhancedRating(domain, localRating = null) {
        const mbfcData = await this.getMBFCData(domain);
        
        if (!mbfcData && !localRating) {
            return null;
        }

        if (!mbfcData) {
            // Only local data available
            return {
                domain: domain,
                score: localRating.rating,
                rating: this.getRatingFromScore(localRating.rating),
                color: this.getColorFromScore(localRating.rating),
                label: this.getLabelFromScore(localRating.rating),
                sources: ['Local Database'],
                lastUpdated: localRating.created_at,
                details: {
                    local: localRating,
                    mbfc: null
                }
            };
        }

        if (!localRating) {
            // Only MBFC data available
            return {
                domain: domain,
                score: mbfcData.combined.score,
                rating: mbfcData.combined.rating,
                color: mbfcData.combined.color,
                label: mbfcData.combined.label,
                sources: ['MBFC'],
                lastUpdated: mbfcData.metadata.lastUpdated,
                details: {
                    local: null,
                    mbfc: mbfcData
                }
            };
        }

        // Both sources available - combine them
        const combinedScore = this.combineRatings(localRating.rating, mbfcData.combined.score);
        
        return {
            domain: domain,
            score: combinedScore,
            rating: this.getRatingFromScore(combinedScore),
            color: this.getColorFromScore(combinedScore),
            label: this.getLabelFromScore(combinedScore),
            sources: ['Local Database', 'MBFC'],
            lastUpdated: new Date().toISOString(),
            details: {
                local: localRating,
                mbfc: mbfcData
            }
        };
    }

    // Combine local and MBFC ratings
    combineRatings(localScore, mbfcScore) {
        // Weight: 70% MBFC (more reliable), 30% local (community input)
        const mbfcWeight = 0.7;
        const localWeight = 0.3;
        
        return (mbfcScore * mbfcWeight) + (localScore * localWeight);
    }

    // Helper methods for rating conversion
    getRatingFromScore(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    }

    getColorFromScore(score) {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        if (score >= 40) return '#fd7e14';
        return '#dc3545';
    }

    getLabelFromScore(score) {
        if (score >= 90) return 'Highly Reliable';
        if (score >= 80) return 'Reliable';
        if (score >= 70) return 'Mostly Reliable';
        if (score >= 60) return 'Mixed Reliability';
        if (score >= 40) return 'Questionable';
        return 'Unreliable';
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('MBFC: Cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            domains: Array.from(this.cache.keys())
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MBFCService;
} else {
    window.MBFCService = MBFCService;
}
