# Supabase Connection Troubleshooting Guide

## Current Status
✅ Extension is working with mock data  
❌ Supabase connection is failing with "Failed to fetch" error

## Common Causes & Solutions

### 1. **CORS (Cross-Origin Resource Sharing) Issues**

**Problem**: Chrome extensions have strict CORS policies that can block Supabase requests.

**Solutions**:
```javascript
// Try adding these headers to your Supabase requests
const response = await fetch(url, {
    method: 'GET',
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    mode: 'cors',
    cache: 'no-cache'
});
```

### 2. **Supabase Project Settings**

**Check these in your Supabase dashboard**:

1. **API Settings**:
   - Go to Settings → API
   - Verify your Project URL and anon key
   - Check if API is enabled

2. **Database Settings**:
   - Go to Settings → Database
   - Check if "Allow connections from any IP" is enabled
   - Verify your database is running

3. **RLS (Row Level Security)**:
   ```sql
   -- Check if RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'news_data';
   
   -- If RLS is enabled, ensure you have a policy
   CREATE POLICY "Allow public read access to news_data" ON news_data
       FOR SELECT USING (true);
   ```

### 3. **Network/Firewall Issues**

**Test your Supabase connection**:
1. Open `test-supabase.html` in your browser
2. Run all the test buttons
3. Check for any network errors

### 4. **Chrome Extension Permissions**

**Verify manifest.json has correct permissions**:
```json
{
  "host_permissions": [
    "https://vxxlcintbzgxbmocjbti.supabase.com/*"
  ]
}
```

### 5. **Alternative Connection Methods**

**Method 1: Use Background Script**
The extension now tries to connect via background script as a fallback.

**Method 2: Use Supabase Client Library**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey)
const { data, error } = await supabase
  .from('news_data')
  .select('*')
  .eq('domain', domain)
```

## Quick Fixes to Try

### Fix 1: Test Direct API Access
Open this URL in your browser:
```
https://vxxlcintbzgxbmocjbti.supabase.com/rest/v1/news_data?select=*&limit=5
```

You should see JSON data. If you get an error, the issue is with your Supabase setup.

### Fix 2: Check Browser Console
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for CORS or network errors
4. Check if requests are being blocked

### Fix 3: Verify Supabase Credentials
Double-check your config.js:
```javascript
const CONFIG = {
    SUPABASE_URL: 'https://vxxlcintbzgxbmocjbti.supabase.com',
    SUPABASE_ANON_KEY: 'your-actual-key-here'
};
```

### Fix 4: Test with Different Domains
Try the extension on different websites to see if it's domain-specific.

## Debugging Steps

1. **Check Extension Console**:
   - Right-click extension icon → Inspect popup
   - Look for "TrustLens Debug" messages

2. **Check Background Script Console**:
   - Go to chrome://extensions/
   - Find TrustLens → Details → Inspect views: background page

3. **Test Supabase Directly**:
   - Use the test-supabase.html file
   - Check if basic API calls work

4. **Check Network Tab**:
   - Open DevTools → Network tab
   - Look for failed requests to Supabase

## Current Workaround

The extension is now working with mock data, so you can:
- ✅ Test all functionality
- ✅ See domain ratings
- ✅ View top/lowest rated domains
- ✅ Use the extension normally

## Next Steps

1. **Use the extension** with mock data for now
2. **Debug Supabase** using the test file
3. **Fix the connection** when you have time
4. **Switch back** to real data once fixed

The mock data includes all the domains from your sample data, so the extension is fully functional!
