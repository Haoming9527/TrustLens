// TrustLens Background Script
class TrustLensBackground {
    constructor() {
        this.supabaseUrl = 'YOUR_SUPABASE_URL'; // Will be overridden from storage
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Will be overridden from storage
        this.reliableThreshold = 7; // rating >= 7 considered reliable
        this.loggingEnabled = true; // cached kill switch
        this.init();
    }

    init() {
        this.loadConfigFromStorage();
        this.setupConfigChangeListener();
        this.setupInstallListener();
        this.setupTabUpdateListener();
        this.setupMessageListener();
        this.setupAlarms();
        this.setupNotificationClick();
    }

    async loadConfigFromStorage() {
        try {
            const keys = ['trustlens_supabase_url', 'trustlens_supabase_key', 'trustlens_logging_enabled'];
            const data = await chrome.storage.local.get(keys);
            if (data.trustlens_supabase_url) this.supabaseUrl = data.trustlens_supabase_url;
            if (data.trustlens_supabase_key) this.supabaseKey = data.trustlens_supabase_key;
            if (typeof data.trustlens_logging_enabled === 'boolean') this.loggingEnabled = data.trustlens_logging_enabled;
        } catch (e) {
            console.warn('Failed to load Supabase config from storage', e);
        }
    }

    setupConfigChangeListener() {
        try {
            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName !== 'local') return;
                if (changes['trustlens_supabase_url']) {
                    this.supabaseUrl = changes['trustlens_supabase_url'].newValue || this.supabaseUrl;
                }
                if (changes['trustlens_supabase_key']) {
                    this.supabaseKey = changes['trustlens_supabase_key'].newValue || this.supabaseKey;
                }
                if (changes['trustlens_logging_enabled']) {
                    this.loggingEnabled = !!changes['trustlens_logging_enabled'].newValue;
                    console.log('[TrustLens] Logging enabled set to', this.loggingEnabled);
                }
            });
        } catch (e) {
            console.warn('Failed to set up config change listener', e);
        }
    }

    setupInstallListener() {
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('TrustLens extension installed');
                this.showWelcomeNotification();
            } else if (details.reason === 'update') {
                console.log('TrustLens extension updated');
            }
        });
    }

    setupTabUpdateListener() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.checkDomainReliability(tabId, tab.url);
            }
        });
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'getDomainRating':
                    this.getDomainRating(request.domain).then(sendResponse);
                    return true; // Will respond asynchronously
                
                case 'getStats':
                    this.getStats().then(sendResponse);
                    return true;
                
                case 'testSupabaseConnection':
                    this.testSupabaseConnection(request.url, request.key).then(sendResponse);
                    return true;

                case 'setConfig':
                    if (request.url) this.supabaseUrl = request.url;
                    if (request.key) this.supabaseKey = request.key;
                    sendResponse({ ok: true });
                    return true;

                case 'logEngagement':
                    this.logEngagement(request.payload).then(sendResponse);
                    return true;

                case 'getWeeklySummary':
                    this.getWeeklySummary().then(sendResponse);
                    return true;
            }
        });
    }

    setupAlarms() {
        // Create weekly alarm if not present
        chrome.alarms.create('trustlens-weekly-feedback', { periodInMinutes: 60 * 24 * 7 });

        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'trustlens-weekly-feedback') {
                this.showWeeklyFeedbackNotification();
            }
        });
    }

    setupNotificationClick() {
        chrome.notifications.onClicked.addListener((notificationId) => {
            if (notificationId === 'trustlens-weekly-summary') {
                chrome.action.openPopup();
            }
        });
    }

    async checkDomainReliability(tabId, url) {
        try {
            const domain = this.extractDomain(url);
            const rating = await this.getDomainRating(domain);
            
            if (rating) {
                this.updateBadge(tabId, rating);
                this.injectRatingWidget(tabId, domain, rating);
                // Log engagement (only if enabled)
                if (this.loggingEnabled) {
                    this.logEngagement({
                        domain,
                        rating: rating.rating,
                        reliable: rating.rating >= this.reliableThreshold,
                        ts: Date.now()
                    });
                } else {
                    console.log('[TrustLens] Skipping engagement log because logging is disabled');
                }
            } else {
                this.clearBadge(tabId);
            }
        } catch (error) {
            console.error('Error checking domain reliability:', error);
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return null;
        }
    }

    async logEngagement(event) {
        try {
            if (!this.loggingEnabled) {
                console.log('[TrustLens] logEngagement skipped (disabled)');
                return { ok: true, skipped: true };
            }
            const key = 'trustlens_engagements';
            const data = await chrome.storage.local.get([key]);
            const list = Array.isArray(data[key]) ? data[key] : [];

            // Keep only last 90 days to cap storage
            const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
            const trimmed = list.filter(item => item.ts >= ninetyDaysAgo);

            trimmed.push({
                domain: event.domain,
                rating: event.rating,
                reliable: !!event.reliable,
                ts: event.ts || Date.now()
            });

            await chrome.storage.local.set({ [key]: trimmed });
            return { ok: true };
        } catch (e) {
            console.error('Error logging engagement', e);
            return { ok: false, error: e.message };
        }
    }

    async getWeeklySummary() {
        const key = 'trustlens_engagements';
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const { [key]: list = [] } = await chrome.storage.local.get([key]);
        const recent = (list || []).filter(item => item.ts >= weekAgo);

        const total = recent.length;
        const reliable = recent.filter(i => i.reliable).length;
        const unreliable = recent.filter(i => !i.reliable).length;

        const reliablePct = total ? Math.round((reliable / total) * 100) : 0;
        const unreliablePct = total ? Math.round((unreliable / total) * 100) : 0;

        // Top domains engaged
        const counts = {};
        recent.forEach(i => { counts[i.domain] = (counts[i.domain] || 0) + 1; });
        const topDomains = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([domain, count]) => ({ domain, count }));

        return { total, reliable, unreliable, reliablePct, unreliablePct, topDomains };
    }

    async showWeeklyFeedbackNotification() {
        try {
            const summary = await this.getWeeklySummary();
            const title = 'Your Weekly TrustLens Feedback';
            const message = summary.total
                ? `This week: ${summary.reliablePct}% reliable, ${summary.unreliablePct}% unreliable across ${summary.total} engagements.`
                : 'No engagements logged this week. Browse to see insights!';

            chrome.notifications.create('trustlens-weekly-summary', {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title,
                message
            });
        } catch (e) {
            console.error('Failed to show weekly feedback notification', e);
        }
    }

    async getDomainRating(domain) {
        try {
            // Ensure config is loaded
            if (!this.supabaseUrl || this.supabaseUrl.includes('YOUR_SUPABASE_URL')) {
                await this.loadConfigFromStorage();
            }
            const response = await fetch(`${this.supabaseUrl}/rest/v1/news_data?domain=eq.${encodeURIComponent(domain)}&select=*`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data && data.length > 0 ? data[0] : null;
            }
            return null;
        } catch (error) {
            console.error('Error fetching domain rating:', error);
            return null;
        }
    }


    async testSupabaseConnection(url, key) {
        try {
            console.log('Background: Testing Supabase connection...');
            const testUrl = `${url}/rest/v1/news_data?select=*&limit=3`;
            
            const response = await fetch(testUrl, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Background: Supabase test successful!', data);
                return { success: true, data: data };
            } else {
                const errorText = await response.text();
                console.error('Background: Supabase test failed:', response.status, errorText);
                return { success: false, error: `HTTP ${response.status}: ${errorText}` };
            }
        } catch (error) {
            console.error('Background: Supabase test error:', error);
            return { success: false, error: error.message };
        }
    }

    async getStats() {
        try {
            const [topRated, lowestRated] = await Promise.all([
                fetch(`${this.supabaseUrl}/rest/v1/news_data?select=*&order=rating.desc&limit=5`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }).then(r => r.json()),
                fetch(`${this.supabaseUrl}/rest/v1/news_data?select=*&order=rating.asc&limit=5`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                }).then(r => r.json())
            ]);

            return {
                topRated,
                lowestRated
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { topRated: [], lowestRated: [] };
        }
    }

    updateBadge(tabId, rating) {
        const badgeText = rating.rating >= 7 ? '✓' : rating.rating >= 4 ? '?' : '!';
        const badgeColor = rating.rating >= 7 ? '#28a745' : rating.rating >= 4 ? '#ffc107' : '#dc3545';
        
        chrome.action.setBadgeText({
            text: badgeText,
            tabId: tabId
        });
        
        chrome.action.setBadgeBackgroundColor({
            color: badgeColor,
            tabId: tabId
        });
    }

    clearBadge(tabId) {
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    }

    async injectRatingWidget(tabId, domain, rating) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: this.injectWidget,
                args: [domain, rating]
            });
        } catch (error) {
            console.error('Error injecting rating widget:', error);
        }
    }

    injectWidget(domain, rating) {
        // This function runs in the content script context
        if (document.getElementById('trustlens-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'trustlens-widget';
        widget.innerHTML = `
            <div class="trustlens-widget-content">
                <div class="trustlens-header">
                    <span class="trustlens-logo">🔍</span>
                    <span class="trustlens-title">TrustLens</span>
                    <button class="trustlens-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="trustlens-body">
                    <div class="trustlens-domain">${domain}</div>
                    <div class="trustlens-rating">
                        <span class="trustlens-rating-value">${rating.rating.toFixed(1)}</span>
                        <span class="trustlens-rating-label">/ 10</span>
                    </div>
                    <div class="trustlens-source">Database Rating</div>
                    <div class="trustlens-reliability ${rating.rating >= 7 ? 'reliable' : rating.rating >= 4 ? 'mixed' : 'unreliable'}">
                        ${rating.rating >= 7 ? 'Reliable' : rating.rating >= 4 ? 'Mixed' : 'Unreliable'}
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #trustlens-widget {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                max-width: 250px;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .trustlens-widget-content {
                padding: 15px;
            }
            
            .trustlens-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }
            
            .trustlens-logo {
                font-size: 16px;
                margin-right: 6px;
            }
            
            .trustlens-title {
                font-weight: 600;
                color: #333;
                flex: 1;
            }
            
            .trustlens-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .trustlens-close:hover {
                color: #666;
            }
            
            .trustlens-body {
                text-align: center;
            }
            
            .trustlens-domain {
                font-weight: 500;
                color: #333;
                margin-bottom: 8px;
                word-break: break-all;
            }
            
            .trustlens-rating {
                margin-bottom: 6px;
            }
            
            .trustlens-rating-value {
                font-size: 24px;
                font-weight: 700;
                color: #667eea;
            }
            
            .trustlens-rating-label {
                color: #666;
                font-size: 14px;
            }
            
            .trustlens-source {
                color: #666;
                font-size: 12px;
                margin-bottom: 8px;
            }
            
            .trustlens-reliability {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .trustlens-reliability.reliable {
                background: #d4edda;
                color: #155724;
            }
            
            .trustlens-reliability.mixed {
                background: #fff3cd;
                color: #856404;
            }
            
            .trustlens-reliability.unreliable {
                background: #f8d7da;
                color: #721c24;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(widget);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (widget.parentNode) {
                widget.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (widget.parentNode) {
                        widget.remove();
                        style.remove();
                    }
                }, 300);
            }
        }, 10000);
    }

    showWelcomeNotification() {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'TrustLens Installed',
            message: 'Welcome to TrustLens! View domain ratings and help identify reliable news sources.'
        });
    }
}

// Initialize background script
new TrustLensBackground();
