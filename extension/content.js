// TrustLens Content Script
class TrustLensContent {
    constructor() {
        this.supabaseUrl = window.TRUSTLENS_CONFIG?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
        this.supabaseKey = window.TRUSTLENS_CONFIG?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
        this.currentDomain = null;
        this.ratingWidget = null;
        
        this.init();
    }

    init() {
        this.currentDomain = this.extractDomain(window.location.href);
        this.setupPageAnalysis();
        this.setupMessageListener();
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return null;
        }
    }

    setupPageAnalysis() {
        // Analyze page content for potential misinformation indicators
        this.analyzePageContent();
        
        // Check if this is a news website
        if (this.isNewsWebsite()) {
            this.showNewsIndicator();
        }
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'injectWidget':
                    this.injectRatingWidget(request.domain, request.rating);
                    break;
                case 'getPageInfo':
                    sendResponse({
                        domain: this.currentDomain,
                        title: document.title,
                        url: window.location.href,
                        isNews: this.isNewsWebsite()
                    });
                    break;
                case 'loadDomainRating':
                    this.loadDomainRating(request.domain).then(sendResponse);
                    return true; // Keep message channel open for async response
            }
        });
    }

    isNewsWebsite() {
        const newsKeywords = [
            'news', 'breaking', 'report', 'journalism', 'media', 'press',
            'times', 'post', 'tribune', 'herald', 'gazette', 'chronicle',
            'observer', 'review', 'daily', 'weekly', 'monthly'
        ];
        
        const domain = this.currentDomain.toLowerCase();
        const title = document.title.toLowerCase();
        
        return newsKeywords.some(keyword => 
            domain.includes(keyword) || title.includes(keyword)
        );
    }

    analyzePageContent() {
        // Look for common misinformation indicators
        const indicators = {
            sensationalHeadlines: this.checkSensationalHeadlines(),
            excessiveCaps: this.checkExcessiveCaps(),
            clickbaitPatterns: this.checkClickbaitPatterns(),
            suspiciousLinks: this.checkSuspiciousLinks()
        };

        // Store analysis results
        this.pageAnalysis = indicators;
        
        // Send analysis to background script
        chrome.runtime.sendMessage({
            action: 'pageAnalysis',
            domain: this.currentDomain,
            indicators: indicators
        });
    }

    checkSensationalHeadlines() {
        const headlines = document.querySelectorAll('h1, h2, h3, .headline, .title');
        const sensationalWords = [
            'shocking', 'amazing', 'incredible', 'unbelievable', 'stunning',
            'you won\'t believe', 'doctors hate', 'one weird trick',
            'what happens next', 'this will blow your mind'
        ];
        
        let count = 0;
        headlines.forEach(headline => {
            const text = headline.textContent.toLowerCase();
            if (sensationalWords.some(word => text.includes(word))) {
                count++;
            }
        });
        
        return count > 0;
    }

    checkExcessiveCaps() {
        const headlines = document.querySelectorAll('h1, h2, h3, .headline, .title');
        let excessiveCapsCount = 0;
        
        headlines.forEach(headline => {
            const text = headline.textContent;
            const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
            if (capsRatio > 0.7 && text.length > 10) {
                excessiveCapsCount++;
            }
        });
        
        return excessiveCapsCount > 0;
    }

    checkClickbaitPatterns() {
        const headlines = document.querySelectorAll('h1, h2, h3, .headline, .title');
        const clickbaitPatterns = [
            /^\d+\s+(things|ways|reasons|facts)/i,
            /you won't believe/i,
            /what happens next/i,
            /doctors hate/i,
            /one weird trick/i,
            /this will blow your mind/i,
            /number \d+ will shock you/i
        ];
        
        let count = 0;
        headlines.forEach(headline => {
            const text = headline.textContent;
            if (clickbaitPatterns.some(pattern => pattern.test(text))) {
                count++;
            }
        });
        
        return count > 0;
    }

    checkSuspiciousLinks() {
        const links = document.querySelectorAll('a[href]');
        let suspiciousCount = 0;
        
        links.forEach(link => {
            const href = link.href;
            const text = link.textContent.toLowerCase();
            
            // Check for suspicious patterns
            if (
                href.includes('bit.ly') || 
                href.includes('tinyurl') ||
                href.includes('goo.gl') ||
                text.includes('click here') ||
                text.includes('read more') ||
                text.includes('find out more')
            ) {
                suspiciousCount++;
            }
        });
        
        return suspiciousCount > 5; // Threshold for suspicious links
    }

    showNewsIndicator() {
        // Add a subtle indicator that this is a news website
        const indicator = document.createElement('div');
        indicator.id = 'trustlens-news-indicator';
        indicator.innerHTML = `
            <div class="trustlens-news-badge">
                <span class="trustlens-news-icon">📰</span>
                <span class="trustlens-news-text">News Website</span>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #trustlens-news-indicator {
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 9999;
                pointer-events: none;
            }
            
            .trustlens-news-badge {
                background: rgba(102, 126, 234, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                animation: fadeIn 0.5s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .trustlens-news-icon {
                font-size: 14px;
            }
            
            .trustlens-news-text {
                font-size: 11px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(indicator);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'fadeOut 0.5s ease-in';
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.remove();
                        style.remove();
                    }
                }, 500);
            }
        }, 5000);
    }

    async loadDomainRating(domain) {
        try {
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
            console.error('Error loading domain rating:', error);
            return null;
        }
    }

    injectRatingWidget(domain, rating) {
        // Remove existing widget
        const existingWidget = document.getElementById('trustlens-widget');
        if (existingWidget) {
            existingWidget.remove();
        }

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
                    <button class="trustlens-view-btn" onclick="window.open('chrome-extension://${chrome.runtime.id}/popup.html', '_blank')">
                        View Details
                    </button>
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
                margin-bottom: 10px;
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
            
            .trustlens-view-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: background 0.2s ease;
            }
            
            .trustlens-view-btn:hover {
                background: #5a6fd8;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(widget);

        // Auto-hide after 15 seconds
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
        }, 15000);
    }
}

// Initialize content script
new TrustLensContent();
