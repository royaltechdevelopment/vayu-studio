/* ============================================================
   VAYU STUDIO — CONFIG (bootstrap only)

   Only the values needed to connect to Supabase live here:
   SUPABASE_URL + SUPABASE_ANON_KEY. Everything else (admin Discord ID,
   owner email, social links, YouTube/Discord IDs) lives in Supabase →
   site_content (key: site_settings) and can be edited in the admin panel.
   Discord OAuth redirect URLs are configured in Supabase → Auth → URL
   Configuration. The Discord Client ID/Secret stay in Supabase → Auth →
   Providers → Discord (server side).
   ============================================================ */
window.APP_CONFIG = {
  // 👇 Paste your Supabase project credentials here (required).
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY'
};
