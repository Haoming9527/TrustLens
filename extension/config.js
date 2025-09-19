// TrustLens Configuration
// Replace these with your actual Supabase credentials

const CONFIG = {
    SUPABASE_URL: 'https://vxxlcintbzgxbmocjbti.supabase.co', // Replace with your Supabase project URL
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eGxjaW50YnpneGJtb2NqYnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzYzMzgsImV4cCI6MjA3MzUxMjMzOH0.RNkpKDpVSNxhDXGil9polPJk0URLYGl0j-QMw-6d0B8' // Replace with your Supabase anon key
};

// Make config available globally
window.TRUSTLENS_CONFIG = CONFIG;
