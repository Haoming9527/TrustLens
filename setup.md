# TrustLens Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- Google Chrome browser
- Git

## Installation Steps

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start the server
npm start
```

The backend will run on `http://localhost:3000`

### 2. Chrome Extension Setup

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension/` folder from this project
6. The TrustLens extension should now appear in your extensions

### 3. Testing the Extension

1. Visit any news website (e.g., CNN, BBC, Fox News)
2. Click the TrustLens extension icon in your browser toolbar
3. You should see the popup with rating options
4. Try rating a website to test the functionality

## Troubleshooting

### Backend Issues
- Make sure port 3000 is not in use
- Check that all dependencies are installed
- Verify the database file is created (`trustlens.db`)

### Extension Issues
- Reload the extension in `chrome://extensions/`
- Check the browser console for errors
- Ensure the backend is running

### CORS Issues
- Make sure the backend is running on localhost:3000
- Check that CORS is properly configured in server.js

## Development

### Running in Development Mode

```bash
# Backend with auto-restart
npm run dev

# The extension will auto-reload when you make changes
```

### Making Changes

1. Edit files in the `extension/` folder
2. Reload the extension in Chrome
3. Test your changes

## API Testing

You can test the API endpoints using curl or Postman:

```bash
# Get rating for a domain
curl http://localhost:3000/api/rating/example.com

# Submit a rating
curl -X POST http://localhost:3000/api/rating \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "rating": 8}'
```
