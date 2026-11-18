/* ============================================================
   VAYU STUDIO — CONFIG
   All public site values live in this one file: Supabase URL/key,
   SITE_URL, admin Discord ID, YouTube channel, Discord widget/chat IDs
   and social links. See SETUP.md for the annotated list.

   Discord Client ID/Secret are NOT stored here — they belong in
   Supabase → Authentication → Providers → Discord (server side).
   ============================================================ */
window.APP_CONFIG = {
  SITE_NAME: 'Vayu Pyz',

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

  // Public text channel shown in the Home page live Discord chat panel.
  DISCORD_CHAT_CHANNEL_ID: '1504798937989513307'
};
