/* ============================================================
   Supabase bootstrap + auth helpers
   Real Supabase auth only. If the config still contains placeholders,
   member areas stay locked until setup is completed.
   ============================================================ */
(function () {
  const cfg = window.APP_CONFIG || {};
  const url = String(cfg.SUPABASE_URL || '').trim();
  const key = String(cfg.SUPABASE_ANON_KEY || '').trim();

  // Site settings + social/admin values now live in Supabase (site_content),
  // with js/data.js as the local fallback. SITE_URL is configured in
  // Supabase → Authentication → URL Configuration.
  const settings = () => (window.App?.settings?.() || window.SITE_DATA?.site_settings || {});
  const siteBase = () =>
    (window.location.origin + window.location.pathname.replace(/[^/]*$/, '')).replace(/\/$/, '');

  const looksConfigured =
    /^https:\/\/[\w-]+\.supabase\.co\/?$/.test(url) &&
    key.length > 20 &&
    !key.startsWith('YOUR_');

  window.DB_READY = Boolean(looksConfigured && window.supabase);
  const ADMIN_CLAIM_FLAG = 'vayu_admin_claim_';
  const DISCORD_GATE_FLAG = 'vayu_need_discord';

  window.sb = window.DB_READY
    ? window.supabase.createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        // Always read fresh content after an admin save.
        global: {
          fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' })
        }
      })
    : null;

  const Auth = {
    // Promote the configured Discord account to owner. The RPC verifies that
    // the current user's own Discord identity matches ADMIN_DISCORD_ID.
    async ensureAdminRole(user) {
      const adminId = String(settings().ADMIN_DISCORD_ID || '').trim();
      if (!adminId || !window.sb || !user) return;
      const flag = ADMIN_CLAIM_FLAG + user.id;
      if (sessionStorage.getItem(flag) === '1') return;
      try {
        const { data, error } = await window.sb.rpc('claim_admin_by_discord', { discord_id: adminId });
        if (!error && data) sessionStorage.setItem(flag, '1');
      } catch {
        // Schema not updated yet; the metadata fallback in profile() still applies.
      }
    },

    async user() {
      if (!window.sb) return null;
      const { data } = await window.sb.auth.getUser();
      return data.user || null;
    },

    /* Discord linking gate (for email/password accounts) */
    needsDiscordGate() {
      return sessionStorage.getItem(DISCORD_GATE_FLAG) === '1';
    },

    setDiscordGate() {
      sessionStorage.setItem(DISCORD_GATE_FLAG, '1');
    },

    clearDiscordGate() {
      sessionStorage.removeItem(DISCORD_GATE_FLAG);
    },

    async hasDiscordIdentity() {
      if (!window.sb) return false;
      const user = await this.user();
      if (!user) return false;
      const linked = (list) => Array.isArray(list) &&
        list.some((i) => i && i.provider === 'discord');
      const providers = user.app_metadata?.providers;

      if (linked(user.identities) ||
          (Array.isArray(providers) && providers.includes('discord'))) return true;
      try {
        const { data } = await window.sb.auth.getUserIdentities();
        return linked(data?.identities);
      } catch {
        return false;
      }
    },

    async linkDiscord(redirectTo) {
      if (!window.sb) throw new Error('Configure Supabase before linking Discord.');
      const base = siteBase();
      const { error } = await window.sb.auth.linkIdentity({
        provider: 'discord',
        options: {
          redirectTo: redirectTo || `${base}/`,
          scopes: 'identify email'
        }
      });
      if (error) throw error;
      return true; // browser redirects to Discord
    },

    async profile() {
      if (!window.DB_READY) return null;

      const user = await this.user();
      if (!user) return null;
      await this.ensureAdminRole(user);

      let profile = null;
      if (window.sb) {
        const { data } = await window.sb
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        profile = data || null;
      }

      if (!profile) {
        const meta = user.user_metadata || {};
        const adminId = String(settings().ADMIN_DISCORD_ID || '').trim();
        const discordId = String(meta.provider_id || meta.user_id || meta.discord_id || '');
        const isOwner = Boolean(adminId && discordId && discordId === adminId);
        profile = {
          id: user.id,
          email: user.email,
          full_name: meta.full_name || meta.name || meta.user_name || user.email?.split('@')[0] || 'Member',
          role: isOwner || user.email === settings().DEFAULT_ADMIN_EMAIL
            ? 'owner'
            : meta.role || 'user',
          avatar_url: meta.avatar_url || ''
        };
      }
      return profile;
    },

    // Edit only your own display fields through a SECURITY DEFINER RPC,
    // so the `role` column can never be changed from the browser.
    async updateProfile(fullName, avatarUrl) {
      if (!window.sb) throw new Error('Supabase is not configured.');
      const user = await this.user();
      if (!user) throw new Error('You are not signed in.');
      const { error } = await window.sb.rpc('update_own_profile', {
        p_full_name: String(fullName || '').trim(),
        p_avatar_url: String(avatarUrl || '').trim()
      });
      if (error) throw error;
      return true;
    },

    async updatePassword(password) {
      if (!window.sb) throw new Error('Supabase is not configured.');
      const { error } = await window.sb.auth.updateUser({ password });
      if (error) throw error;
      return true;
    },

    isAdmin(profile) {
      return Boolean(profile && ['admin', 'owner'].includes(profile.role));
    },

    async signIn(email, password) {
      if (!window.sb) throw new Error('Supabase is not configured yet. Fill in js/config.js first.');
      const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.setDiscordGate();
      return data.user;
    },

    async signUp(email, password, fullName) {
      if (!window.sb) throw new Error('Supabase is not configured yet. Fill in js/config.js first.');
      const { data, error } = await window.sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || email.split('@')[0] } }
      });
      if (error) throw error;
      if (data?.session) this.setDiscordGate();
      return data;
    },

    /* Discord OAuth (Supabase Auth provider) */
    async signInWithDiscord(redirectTo) {
      if (!window.sb) throw new Error('Configure Supabase before using Discord login.');
      const base = siteBase();
      const { error } = await window.sb.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectTo || `${base}/`,
          scopes: 'identify email'
        }
      });
      if (error) throw error;
      return true; // the browser will redirect to Discord
    },

    async signOut() {
      if (window.sb) await window.sb.auth.signOut();
      this.clearDiscordGate();
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(ADMIN_CLAIM_FLAG))
        .forEach((k) => sessionStorage.removeItem(k));
      window.location.href = 'index';
    },

    onAuthChange(cb) {
      if (!window.sb) return () => {};
      const { data } = window.sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null));
      return () => data.subscription.unsubscribe();
    }
  };

  window.Auth = Auth;
})();
