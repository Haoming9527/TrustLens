# TrustLens - Community-Powered Misinformation Defense Platform

TrustLens is a browser extension that uses community collaboration to empower citizens against misinformation in real time. News websites are rated from 1-10 on reliability by the community.

## Features

- **Real-time Website Rating**: Rate news websites on a 1-10 scale
- **Community-Driven**: Crowdsourced ratings from users
- **Visual Indicators**: Clear visual feedback on website reliability
- **Chrome Extension**: Seamless integration with your browsing experience
- **REST API**: Backend API for data management

## Project Structure

```
TrustLens/
├── backend/
│   ├── server.js          # Express.js backend server
│   ├── package.json       # Node.js dependencies
│   └── env.example        # Environment variables template
├── extension/
│   ├── manifest.json      # Chrome extension manifest
│   ├── popup.html         # Extension popup interface
│   ├── popup.css          # Popup styling
│   ├── popup.js           # Popup functionality
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script for page analysis
│   └── content.css        # Content script styles
└── README.md
```

## Quick Start

### Backend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Start the backend server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

### Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. The TrustLens extension will be installed and ready to use

## API Endpoints

- `GET /api/rating/:domain` - Get rating for a domain
- `POST /api/rating` - Submit a rating for a domain
- `GET /api/domains/top` - Get top-rated domains
- `GET /api/domains/lowest` - Get lowest-rated domains
- `GET /health` - Health check endpoint

## How It Works

1. **Website Detection**: The extension automatically detects when you visit news websites
2. **Community Ratings**: Users can rate websites on a 1-10 scale
3. **Visual Feedback**: Clear indicators show website reliability
4. **Real-time Updates**: Ratings are updated in real-time as users vote

## Rating System

- **9-10**: Highly Reliable
- **7-8**: Mostly Reliable  
- **5-6**: Mixed Reliability
- **3-4**: Questionable
- **1-2**: Unreliable

## Contributing

This project was created for the HomeHack Hackathon. Feel free to contribute improvements!

## License

MIT License