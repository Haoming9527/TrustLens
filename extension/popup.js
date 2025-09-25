// TrustLens Popup Script
class TrustLensPopup {
    constructor() {
        this.supabaseUrl = window.TRUSTLENS_CONFIG?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
        this.supabaseKey = window.TRUSTLENS_CONFIG?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
        this.currentDomain = null;
        this.currentRating = null;
        
        this.init();
    }

    async init() {
        await this.getCurrentTab();
        this.setupEventListeners();
        await this.testSupabaseConnection();
        await this.loadCurrentSiteRating();
        await this.loadStats();
        await this.loadWeeklySummary();
        this.setupRealtimeWeeklyUpdates();
        await this.loadPrivacySettings();
    }

    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('TrustLens Debug: Current tab:', tab);
            
            if (tab && tab.url) {
                this.currentDomain = this.extractDomain(tab.url);
                console.log('TrustLens Debug: Extracted domain:', this.currentDomain);
                console.log('TrustLens Debug: Full URL:', tab.url);
                document.getElementById('currentDomain').textContent = this.currentDomain;
            } else {
                console.log('TrustLens Debug: No tab or URL found');
                this.showStatus('No active tab found', 'error');
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
        // Footer links
        document.getElementById('viewTopRated').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTopRated();
        });

        document.getElementById('viewLowestRated').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLowestRated();
        });

        // Debug toggle
        document.getElementById('debugToggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDebug();
        });

        // About modal
        document.getElementById('aboutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAboutModal();
        });

        document.getElementById('closeAboutModal').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideAboutModal();
        });

        // Close modal when clicking outside
        document.getElementById('aboutModal').addEventListener('click', (e) => {
            if (e.target.id === 'aboutModal') {
                this.hideAboutModal();
            }
        });

        // Keyboard shortcut for debug (Ctrl+D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDebug();
            }
        });

        // Privacy controls
        document.getElementById('loggingToggle').addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            await chrome.storage.local.set({ trustlens_logging_enabled: enabled });
            this.showStatus(enabled ? 'Logging enabled' : 'Logging disabled', 'info');
        });

        document.getElementById('clearEngagements').addEventListener('click', async () => {
            await chrome.storage.local.set({ trustlens_engagements: [] });
            await this.loadWeeklySummary();
            this.showStatus('Engagement history cleared', 'success');
        });
    }

    toggleDebug() {
        const debugSection = document.getElementById('debugSection');
        const debugToggle = document.getElementById('debugToggle');
        
        if (debugSection.style.display === 'none') {
            debugSection.style.display = 'block';
            debugToggle.textContent = 'Hide Debug';
        } else {
            debugSection.style.display = 'none';
            debugToggle.textContent = 'Show Debug';
        }
    }

    showAboutModal() {
        const modal = document.getElementById('aboutModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    hideAboutModal() {
        const modal = document.getElementById('aboutModal');
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }

    async testSupabaseConnection() {
        console.log('TrustLens Debug: Testing Supabase connection...');
        console.log('TrustLens Debug: Config loaded:', window.TRUSTLENS_CONFIG);
        
        // Update debug info
        this.updateDebugInfo();
        
        try {
            // Test 1: Basic table access with different approach
            console.log('TrustLens Debug: Test 1 - Basic table access');
            const testUrl = `${this.supabaseUrl}/rest/v1/news_data?select=*&limit=5`;
            console.log('TrustLens Debug: Test URL:', testUrl);
            
            // Try with different fetch options
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            };
            
            console.log('TrustLens Debug: Fetch options:', fetchOptions);
            
            const response = await fetch(testUrl, fetchOptions);
            
            console.log('TrustLens Debug: Test response status:', response.status);
            console.log('TrustLens Debug: Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const data = await response.json();
                console.log('TrustLens Debug: Test successful! Data:', data);
                console.log('TrustLens Debug: Number of records:', data.length);
                
                if (data.length > 0) {
                    console.log('TrustLens Debug: Sample record:', data[0]);
                    this.showStatus(`Supabase connected! Found ${data.length} records`, 'success');
                    document.getElementById('debugConnection').textContent = `Connected ✓ (${data.length} records)`;
                    document.getElementById('debugConnection').style.color = 'green';
                } else {
                    this.showStatus('Supabase connected but no data found', 'info');
                    document.getElementById('debugConnection').textContent = 'Connected ✓ (no data)';
                    document.getElementById('debugConnection').style.color = 'orange';
                }
            } else {
                const errorText = await response.text();
                console.error('TrustLens Debug: Test failed:', response.status, errorText);
                this.showStatus(`Supabase test failed: ${response.status} - ${errorText}`, 'error');
                document.getElementById('debugConnection').textContent = `Failed (${response.status})`;
                document.getElementById('debugConnection').style.color = 'red';
            }
        } catch (error) {
            console.error('TrustLens Debug: Connection test error:', error);
            console.error('TrustLens Debug: Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Try alternative approach
            this.tryAlternativeConnection();
        }
    }

    async tryAlternativeConnection() {
        console.log('TrustLens Debug: Trying alternative connection method...');
        
        try {
            // Use a different approach - try to access via background script
            const response = await chrome.runtime.sendMessage({
                action: 'testSupabaseConnection',
                url: this.supabaseUrl,
                key: this.supabaseKey
            });
            
            if (response && response.success) {
                this.showStatus('Supabase connected via background script!', 'success');
                document.getElementById('debugConnection').textContent = 'Connected ✓ (via background)';
                document.getElementById('debugConnection').style.color = 'green';
            } else {
                this.showStatus(`Background connection failed: ${response?.error || 'Unknown error'}`, 'error');
                document.getElementById('debugConnection').textContent = 'Failed (background)';
                document.getElementById('debugConnection').style.color = 'red';
            }
        } catch (error) {
            console.error('TrustLens Debug: Alternative connection failed:', error);
            this.showStatus(`All connection methods failed: ${error.message}`, 'error');
            document.getElementById('debugConnection').textContent = `Error: ${error.message}`;
            document.getElementById('debugConnection').style.color = 'red';
        }
    }

    updateDebugInfo() {
        document.getElementById('debugDomain').textContent = this.currentDomain || 'None';
        document.getElementById('debugUrl').textContent = this.supabaseUrl;
        document.getElementById('debugKey').textContent = this.supabaseKey.substring(0, 20) + '...';
        document.getElementById('debugConnection').textContent = 'Testing...';
        document.getElementById('debugConnection').style.color = 'orange';
    }


    async loadCurrentSiteRating() {
        if (!this.currentDomain) {
            console.log('TrustLens Debug: No current domain');
            return;
        }

        console.log('TrustLens Debug: Loading rating for domain:', this.currentDomain);
        console.log('TrustLens Debug: Supabase URL:', this.supabaseUrl);
        console.log('TrustLens Debug: Supabase Key (first 20 chars):', this.supabaseKey.substring(0, 20) + '...');

        try {
            const url = `${this.supabaseUrl}/rest/v1/news_data?domain=eq.${encodeURIComponent(this.currentDomain)}&select=*`;
            console.log('TrustLens Debug: Request URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('TrustLens Debug: Response status:', response.status);
            console.log('TrustLens Debug: Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const data = await response.json();
                console.log('TrustLens Debug: Response data:', data);
                
                if (data && data.length > 0) {
                    this.currentRating = data[0];
                    console.log('TrustLens Debug: Found rating:', data[0]);
                    this.updateRatingDisplay(data[0]);
                } else {
                    console.log('TrustLens Debug: No data found for domain');
                    this.updateRatingDisplay(null);
                }
            } else {
                const errorText = await response.text();
                console.error('TrustLens Debug: API Error Response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('TrustLens Debug: Error loading rating:', error);
            console.log('TrustLens Debug: Falling back to mock data...');
            
            // Fallback to mock data
            this.loadMockRating();
        }
    }

    loadMockRating() {
        console.log('TrustLens Debug: Using mock data for domain:', this.currentDomain);
        
        if (window.getMockRating) {
            const mockRating = window.getMockRating(this.currentDomain);
            if (mockRating) {
                this.currentRating = mockRating;
                this.updateRatingDisplay(mockRating);
                this.showStatus('Using mock data (Supabase unavailable)', 'info');
            } else {
                this.updateRatingDisplay(null);
                this.showStatus('Domain not found in mock data', 'info');
            }
        } else {
            this.updateRatingDisplay(null);
            this.showStatus('No data available', 'error');
        }
    }

    updateRatingDisplay(data) {
        const ratingValue = document.getElementById('ratingValue');
        const ratingFill = document.getElementById('ratingFill');
        const ratingText = document.getElementById('ratingText');
        const lastUpdated = document.getElementById('lastUpdated');

        if (data) {
            ratingValue.textContent = data.rating.toFixed(1);
            
            // Update rating bar
            const percentage = (data.rating / 10) * 100;
            ratingFill.style.width = `${percentage}%`;
            
            // Update rating text
            ratingText.textContent = this.getRatingText(data.rating);
            ratingText.style.color = this.getRatingColor(data.rating);
            
            // Update last updated time
            if (data.created_at) {
                const date = new Date(data.created_at);
                lastUpdated.textContent = date.toLocaleDateString();
            }
        } else {
            ratingValue.textContent = '-';
            ratingFill.style.width = '0%';
            ratingText.textContent = 'No rating available in database';
            ratingText.style.color = '#999';
            lastUpdated.textContent = '-';
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

    async loadStats() {
        console.log('TrustLens Debug: Loading stats...');
        
        try {
            // Get total domains count
            const countUrl = `${this.supabaseUrl}/rest/v1/news_data?select=count`;
            console.log('TrustLens Debug: Count URL:', countUrl);
            
            const countResponse = await fetch(countUrl, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                }
            });
            
            console.log('TrustLens Debug: Count response status:', countResponse.status);
            
            if (countResponse.ok) {
                const countData = await countResponse.json();
                console.log('TrustLens Debug: Count data:', countData);
                document.getElementById('totalDomains').textContent = countData.length || '0';
            } else {
                console.error('TrustLens Debug: Count request failed:', countResponse.status);
                this.loadMockStats();
            }

            // Get average rating
            const avgUrl = `${this.supabaseUrl}/rest/v1/news_data?select=rating`;
            console.log('TrustLens Debug: Average URL:', avgUrl);
            
            const avgResponse = await fetch(avgUrl, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('TrustLens Debug: Average response status:', avgResponse.status);
            
            if (avgResponse.ok) {
                const avgData = await avgResponse.json();
                console.log('TrustLens Debug: Average data:', avgData);
                
                if (avgData && avgData.length > 0) {
                    const average = avgData.reduce((sum, item) => sum + item.rating, 0) / avgData.length;
                    console.log('TrustLens Debug: Calculated average:', average);
                    document.getElementById('avgRating').textContent = average.toFixed(1);
                } else {
                    console.log('TrustLens Debug: No data for average calculation');
                    this.loadMockStats();
                }
            } else {
                console.error('TrustLens Debug: Average request failed:', avgResponse.status);
                this.loadMockStats();
            }
        } catch (error) {
            console.error('TrustLens Debug: Error loading stats:', error);
            this.loadMockStats();
        }
    }

    loadMockStats() {
        console.log('TrustLens Debug: Loading mock stats...');
        
        if (window.getMockStats) {
            const stats = window.getMockStats();
            document.getElementById('totalDomains').textContent = stats.totalDomains;
            document.getElementById('avgRating').textContent = stats.averageRating;
        } else {
            document.getElementById('totalDomains').textContent = '30';
            document.getElementById('avgRating').textContent = '7.2';
        }
    }

    async loadWeeklySummary() {
        try {
            const summary = await chrome.runtime.sendMessage({ action: 'getWeeklySummary' });
            if (!summary) return;

            const reliablePct = summary.reliablePct || 0;
            const unreliablePct = summary.unreliablePct || 0;
            const total = summary.total || 0;

            document.getElementById('weeklyReliable').style.width = `${reliablePct}%`;
            document.getElementById('weeklyUnreliable').style.width = `${unreliablePct}%`;

            document.getElementById('weeklyReliableText').textContent = `${reliablePct}% reliable`;
            document.getElementById('weeklyUnreliableText').textContent = `${unreliablePct}% unreliable`;
            document.getElementById('weeklyTotalText').textContent = `${total} engagements`;

            const top = (summary.topDomains || [])
                .map(d => `${d.domain} (${d.count})`)
                .join(', ');
            document.getElementById('weeklyTop').textContent = top ? `Most visited: ${top}` : '';
        } catch (e) {
            console.error('Failed to load weekly summary', e);
        }
    }

    setupRealtimeWeeklyUpdates() {
        try {
            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === 'local' && changes && changes['trustlens_engagements']) {
                    this.loadWeeklySummary();
                }
            });
        } catch (e) {
            console.error('Failed to set up realtime weekly updates', e);
        }
    }

    async loadPrivacySettings() {
        const { trustlens_logging_enabled = true } = await chrome.storage.local.get(['trustlens_logging_enabled']);
        const toggle = document.getElementById('loggingToggle');
        toggle.checked = !!trustlens_logging_enabled;
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
            const response = await fetch(`${this.supabaseUrl}/rest/v1/news_data?select=*&order=rating.desc&limit=10`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.showDomainList(data, 'Top Rated Domains');
            } else {
                throw new Error('Supabase request failed');
            }
        } catch (error) {
            console.error('Error loading top rated:', error);
            console.log('Falling back to mock data for top rated...');
            this.showMockTopRated();
        }
    }

    async showLowestRated() {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/news_data?select=*&order=rating.asc&limit=10`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.showDomainList(data, 'Lowest Rated Domains');
            } else {
                throw new Error('Supabase request failed');
            }
        } catch (error) {
            console.error('Error loading lowest rated:', error);
            console.log('Falling back to mock data for lowest rated...');
            this.showMockLowestRated();
        }
    }

    showMockTopRated() {
        if (window.getMockTopRated) {
            const data = window.getMockTopRated(10);
            this.showDomainList(data, 'Top Rated Domains (Mock Data)');
        } else {
            this.showStatus('Mock data not available', 'error');
        }
    }

    showMockLowestRated() {
        if (window.getMockLowestRated) {
            const data = window.getMockLowestRated(10);
            this.showDomainList(data, 'Lowest Rated Domains (Mock Data)');
        } else {
            this.showStatus('Mock data not available', 'error');
        }
    }

    showDomainList(domains, title) {
        // Create a simple modal-like display
        const listHtml = domains.map(domain => 
            `<div class="domain-item">
                <span class="domain-name">${domain.domain}</span>
                <span class="domain-rating">${domain.rating.toFixed(1)}</span>
                <span class="domain-date">${new Date(domain.created_at).toLocaleDateString()}</span>
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
