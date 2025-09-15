# TrustLens Supabase Setup Guide

This guide will help you set up TrustLens with Supabase as the backend database.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js installed on your system
- Chrome browser for testing the extension

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `trustlens` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/schema.sql` into the editor
4. Click "Run" to execute the schema creation
5. Wait for all tables, functions, and triggers to be created

## Step 4: Insert Sample Data (Optional)

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `supabase/sample_data.sql` into the editor
3. Click "Run" to insert sample data
4. This will populate your database with sample domains and ratings

## Step 5: Configure Your Backend

1. Copy the environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the backend server:
   ```bash
   node server-supabase.js
   ```

## Step 6: Test the Setup

1. Open your browser and go to `http://localhost:3000/health`
2. You should see a response indicating the server is running with Supabase
3. Test the API endpoints:
   ```bash
   # Get a domain rating
   curl http://localhost:3000/api/rating/cnn.com
   
   # Submit a rating
   curl -X POST http://localhost:3000/api/rating \
     -H "Content-Type: application/json" \
     -d '{"domain": "example.com", "rating": 8}'
   ```

## Step 7: Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. The TrustLens extension should now work with your Supabase backend

## Database Schema Overview

The Supabase database includes these main tables:

- **news_data**: Stores domain ratings and vote counts
- **votes**: Individual user votes for domains
- **users**: User information and activity tracking
- **domain_categories**: Categorizes domains (news, blog, social, etc.)
- **domain_metadata**: Additional domain information

## Key Features

- **Automatic Rating Calculation**: Triggers automatically update ratings when votes are added
- **Row Level Security**: Secure access controls for data
- **Real-time Updates**: Supabase provides real-time subscriptions
- **Scalable**: Handles large numbers of domains and votes
- **Search**: Full-text search capabilities for domains

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Supabase project allows requests from your domain
2. **Authentication Errors**: Verify your Supabase URL and key are correct
3. **Database Errors**: Check that the schema was created successfully
4. **Rate Limiting**: Supabase has built-in rate limiting for free tiers

### Checking Database Status

1. Go to **Database** → **Tables** in your Supabase dashboard
2. Verify all tables are created and have data
3. Check **Logs** for any error messages

### API Testing

Use the Supabase dashboard's **API** section to test your database queries directly.

## Production Deployment

For production deployment:

1. Set up a production Supabase project
2. Configure proper CORS settings
3. Set up database backups
4. Monitor usage and performance
5. Consider upgrading to a paid plan for higher limits

## Support

- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- TrustLens GitHub Issues: [Create an issue](https://github.com/your-repo/trustlens/issues)
