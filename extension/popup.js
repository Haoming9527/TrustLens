// TrustLens Popup Script
class TrustLensPopup {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.currentDomain = null;
        this.selectedRating = null;
        this.currentRating = null;
        
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        this.setupEventListeners();
        await this.loadCurrentSiteRating();
        await this.loadStats();
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                this.currentDomain = this.extractDomain(tab.url);
                document.getElementById('currentDomain').textContent = this.currentDomain;
            }
        } catch (error) {
            console.error('Error getting current tab:', error);
            this.showStatus('Error getting current tab', 'error');
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return url;
        }
    }

    setupEventListeners() {
        // Rating button clicks
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectRating(parseInt(e.target.dataset.rating));
            });
        });

        // Submit button
        document.getElementById('submitRating').addEventListener('click', () => {
            this.submitRating();
        });

        // Footer links
        document.getElementById('viewTopRated').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTopRated();
        });

        document.getElementById('viewLowestRated').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLowestRated();
        });
    }

    selectRating(rating) {
        this.selectedRating = rating;
        
        // Update button states
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-rating="${rating}"]`).classList.add('selected');
        
        // Enable submit button
        document.getElementById('submitRating').disabled = false;
    }

    async loadCurrentSiteRating() {
        if (!this.currentDomain) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/rating/${encodeURIComponent(this.currentDomain)}`);
            
            if (response.ok) {
                const data = await response.json();
                this.currentRating = data.rating;
                this.updateRatingDisplay(data);
            } else if (response.status === 404) {
                this.updateRatingDisplay(null);
            } else {
                throw new Error('Failed to load rating');
            }
        } catch (error) {
            console.error('Error loading rating:', error);
            this.showStatus('Error loading rating', 'error');
            this.updateRatingDisplay(null);
        }
    }

    updateRatingDisplay(data) {
        const ratingValue = document.getElementById('ratingValue');
        const votesCount = document.getElementById('votesCount');
        const ratingFill = document.getElementById('ratingFill');
        const ratingText = document.getElementById('ratingText');

        if (data) {
            ratingValue.textContent = data.rating.toFixed(1);
            votesCount.textContent = `${data.total_votes} vote${data.total_votes !== 1 ? 's' : ''}`;
            
            // Update rating bar
            const percentage = (data.rating / 10) * 100;
            ratingFill.style.width = `${percentage}%`;
            
            // Update rating text
            ratingText.textContent = this.getRatingText(data.rating);
            ratingText.style.color = this.getRatingColor(data.rating);
        } else {
            ratingValue.textContent = '-';
            votesCount.textContent = 'No rating';
            ratingFill.style.width = '0%';
            ratingText.textContent = 'No community rating available';
            ratingText.style.color = '#999';
        }
    }

    getRatingText(rating) {
        if (rating >= 9) return 'Highly Reliable';
        if (rating >= 7) return 'Mostly Reliable';
        if (rating >= 5) return 'Mixed Reliability';
        if (rating >= 3) return 'Questionable';
        return 'Unreliable';
    }

    getRatingColor(rating) {
        if (rating >= 7) return '#28a745';
        if (rating >= 5) return '#ffc107';
        return '#dc3545';
    }

    async submitRating() {
        if (!this.selectedRating || !this.currentDomain) return;

        const submitBtn = document.getElementById('submitRating');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const response = await fetch(`${this.apiBaseUrl}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: this.currentDomain,
                    rating: this.selectedRating,
                    user_id: this.generateUserId()
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.showStatus('Rating submitted successfully!', 'success');
                await this.loadCurrentSiteRating();
                this.selectedRating = null;
                document.querySelectorAll('.rating-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.showStatus(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    generateUserId() {
        // Generate a simple user ID for tracking
        let userId = localStorage.getItem('trustlens_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('trustlens_user_id', userId);
        }
        return userId;
    }

    async loadStats() {
        try {
            // Load top rated to get some stats
            const response = await fetch(`${this.apiBaseUrl}/domains/top?limit=1`);
            if (response.ok) {
                const data = await response.json();
                // This is a simplified approach - in a real app you'd have a dedicated stats endpoint
                document.getElementById('totalDomains').textContent = 'Loading...';
                document.getElementById('totalVotes').textContent = 'Loading...';
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 3000);
    }

    async showTopRated() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/domains/top?limit=10`);
            if (response.ok) {
                const data = await response.json();
                this.showDomainList(data, 'Top Rated Domains');
            }
        } catch (error) {
            console.error('Error loading top rated:', error);
            this.showStatus('Error loading top rated domains', 'error');
        }
    }

    async showLowestRated() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/domains/lowest?limit=10`);
            if (response.ok) {
                const data = await response.json();
                this.showDomainList(data, 'Lowest Rated Domains');
            }
        } catch (error) {
            console.error('Error loading lowest rated:', error);
            this.showStatus('Error loading lowest rated domains', 'error');
        }
    }

    showDomainList(domains, title) {
        // Create a simple modal-like display
        const listHtml = domains.map(domain => 
            `<div class="domain-item">
                <span class="domain-name">${domain.domain}</span>
                <span class="domain-rating">${domain.rating.toFixed(1)}</span>
                <span class="domain-votes">${domain.total_votes} votes</span>
            </div>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'domain-list-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <div class="domain-list">${listHtml}</div>
                <button class="close-modal">Close</button>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .domain-list-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .domain-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .domain-name {
                flex: 1;
                font-weight: 500;
            }
            .domain-rating {
                color: #667eea;
                font-weight: 600;
                margin: 0 10px;
            }
            .domain-votes {
                color: #666;
                font-size: 12px;
            }
            .close-modal {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 15px;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TrustLensPopup();
});
