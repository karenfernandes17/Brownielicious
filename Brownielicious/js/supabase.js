/**
 * Brownielicious - Supabase Configuration
 * 
 * This file initializes the Supabase client for database operations.
 * The anon key is safe to use in the browser - it only allows 
 * limited operations defined in Row Level Security (RLS) policies.
 */

// Prevent re-declaration - use window.supabaseClient
if (!window.supabaseClient) {
  const SUPABASE_URL = 'https://wbntreccoqqwvgbmtcec.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibnRyZWNjb3Fxd3ZnYm10Y2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjIzNzQsImV4cCI6MjA4NjE5ODM3NH0.bjqf1lLjUszNTyK-HO2m-QsqaQGta8jFmWCH0teeSQk';

  console.log("Initializing Supabase with URL:", SUPABASE_URL);

  // Initialize Supabase client
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log("Supabase client initialized");
} else {
  console.log("Supabase already initialized");
}

// Also set a global reference for convenience (but prefer window.supabaseClient)
window.supabase = window.supabaseClient;
