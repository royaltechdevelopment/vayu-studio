/* ============================================================
   VAYU STUDIO — CONFIG
   After creating a Supabase project, paste its URL and anon key here.
   ============================================================ */
window.APP_CONFIG = {
  SITE_NAME: 'Vayu Playz',

  // 👇 Paste your Supabase project credentials here
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // Optional: production URL. Leave empty to use the current origin.
  // Used for the Discord OAuth redirect.
  SITE_URL: '',

  // Channel ID used for live Tutorials sync from the YouTube RSS feed.
  YOUTUBE_CHANNEL_ID: 'UCidFGGXE-tVCsYwnRBJ3_RQ',

  // 👇 Paste your Discord USER ID here (numbers only, e.g. 123456789012345678).
  // That Discord account gets the 'owner' role automatically on login.
  ADMIN_DISCORD_ID: '',

  // Fallback email owner (used for email signups). Discord ID above takes priority.
  DEFAULT_ADMIN_EMAIL: 'admin@vayuplayz.com',

  SOCIAL: {
    youtube: 'https://youtube.com/@vayuplayzofficial',
    instagram: 'https://www.instagram.com/vayuplayzofficial',
    discord: 'https://discord.gg/eCmwsWw3Bg',
    mc: 'https://vayumc.fun'
  },

  DISCORD_WIDGET_ID: '1504530914128953464',
  DISCORD_CHANNEL_ID: '1504802094530560010'
};
