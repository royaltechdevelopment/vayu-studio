/* ============================================================
   Shared header + footer injection (auth-aware)
   Logged out: 5 public links. Logged in: Dashboard (dashboard.html) + 4 public + member links.
   ============================================================ */
(function () {
  const social = () => App.settings().SOCIAL || {};

  const PUBLIC = [
    { href: 'index', label: 'Home', icon: 'fa-house' },
    { href: 'team', label: 'Team', icon: 'fa-users' },
    { href: 'tutorials', label: 'Tutorials', icon: 'fa-play' },
    { href: 'about', label: 'About', icon: 'fa-circle-info' },
    { href: 'contact', label: 'Contact', icon: 'fa-envelope' }
  ];

  const MEMBERS = [
    { href: 'commands', label: 'Commands', icon: 'fa-terminal' },
    { href: 'tutorial-guide', label: 'Command Guide', icon: 'fa-book' },
    { href: 'links', label: 'Links', icon: 'fa-link' },
    { href: 'files', label: 'Files', icon: 'fa-folder' },
    { href: 'faq', label: 'FAQ', icon: 'fa-circle-question' },
    { href: 'account', label: 'Account', icon: 'fa-user-gear' }
  ];

  const current = App.pageKey();

  // The first nav slot becomes the members' dashboard after login.
  function homeItem(profile) {
    return profile
      ? { href: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' }
      : PUBLIC[0];
  }

  function navLink(item, mobile = false, active = false) {
    return `<a class="nav-link${active ? ' active' : ''}${mobile ? ' mobile-link' : ''}" href="${item.href}">
      <i class="fa-solid ${item.icon}"></i><span>${item.label}</span>
    </a>`;
  }

  function headerHTML() {
    return `
      <header class="topbar">
        <div class="topbar-top">
          <a class="brand" href="index" aria-label="Vayu Playz home">
            <span class="brand-mark">V</span>
            <span class="brand-copy"><strong>Vayu <em>Playz</em></strong><small>official ecosystem</small></span>
          </a>
          <div class="topbar-meta" id="auth-slot"></div>
          <button class="menu-btn" id="menu-btn" type="button" aria-label="Toggle menu">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>

        <nav class="nav-panel" aria-label="Main navigation">
          <div class="nav-grid" id="nav-grid"></div>
          <div class="nav-actions" id="nav-auth"></div>
        </nav>
      </header>

      <div class="mobile-nav" id="mobile-nav">
        <div id="mobile-links"></div>
        <div id="mobile-auth"></div>
      </div>`;
  }

  function footerHTML() {
    const s = App.settings().SOCIAL || {};
    return `
      <footer class="footer">
        <div class="footer-inner">
          <div>
            <div class="brand compact"><span class="brand-mark">V</span><span class="brand-copy"><strong>Vayu <em>Playz</em></strong></span></div>
            <p class="muted small">Gaming · Code · Community. Built for the Vayu ecosystem.</p>
          </div>
          <div class="footer-links">
            <a href="${s.discord}" target="_blank" rel="noopener"><i class="fa-brands fa-discord"></i> Discord</a>
            <a href="${s.youtube}" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i> YouTube</a>
            <a href="${s.instagram}" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i> Instagram</a>
            <a href="${s.mc}" target="_blank" rel="noopener"><i class="fa-solid fa-cube"></i> Vayu MC</a>
          </div>
          <div class="footer-meta">
            <span>© <span id="year"></span> Vayu Playz Official</span>
            <span class="muted small">${window.DB_READY ? 'Supabase connected' : 'Setup required'}</span>
          </div>
        </div>
      </footer>`;
  }

  function authButtons(profile) {
    if (!profile) {
      return `
        <a class="btn btn-login" href="login"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
        <a class="btn btn-register" href="register"><i class="fa-solid fa-user-plus"></i> Register</a>`;
    }
    const admin = Auth.isAdmin(profile)
      ? '<a class="btn btn-login" href="admin"><i class="fa-solid fa-shield-halved"></i> Admin</a>'
      : '';
    return `${admin}
      <button class="btn btn-logout" type="button" data-logout><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>`;
  }

  const discordCta = () => `<a class="btn btn-discord" href="${App.h(social().discord || '')}" target="_blank" rel="noopener"><i class="fa-brands fa-discord"></i> Join Vayu Empire Discord</a>`;

  // Email/password logins must link Discord before using the workspace.
  // The dialog has no close control, so it stays until the link succeeds.
  async function renderDiscordGate(profile) {
    document.getElementById('discord-gate')?.remove();
    document.body.classList.remove('gate-open');

    if (!window.DB_READY || !profile || !Auth.needsDiscordGate()) return;
    if (await Auth.hasDiscordIdentity()) {
      Auth.clearDiscordGate();
      return;
    }

    const box = document.createElement('div');
    box.id = 'discord-gate';
    box.className = 'gate-backdrop';
    box.innerHTML = `
      <div class="gate-card" role="dialog" aria-modal="true" aria-labelledby="gate-title">
        <div class="gate-icon"><i class="fa-brands fa-discord"></i></div>
        <span class="section-label">ONE LAST STEP</span>
        <h2 id="gate-title">Connect your Discord account</h2>
        <p class="muted">Your email login is ready. Link Discord once to unlock the full workspace. This step cannot be skipped.</p>
        <div class="gate-actions">
          <button class="btn btn-discord btn-block" type="button" id="gate-connect"><i class="fa-brands fa-discord"></i> Connect Discord</button>
          <button class="btn btn-ghost btn-block" type="button" id="gate-logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout instead</button>
        </div>
        <p class="gate-note"><i class="fa-solid fa-shield-halved"></i> Discord is used only to identify your account and assign your role.</p>
      </div>`;
    document.body.appendChild(box);
    document.body.classList.add('gate-open');

    box.querySelector('#gate-connect').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.classList.add('spinner-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Opening Discord…';
      try {
        await Auth.linkDiscord(`${location.origin}${location.pathname.replace(/[^/]*$/, '')}`);
      } catch (err) {
        App.toast(err.message, 'err');
        btn.classList.remove('spinner-btn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-brands fa-discord"></i> Connect Discord';
      }
    });

    box.querySelector('#gate-logout').addEventListener('click', () => Auth.signOut());
  }

  async function renderAuth() {
    const topSlot = document.getElementById('auth-slot');
    const navSlot = document.getElementById('nav-auth');
    const gridSlot = document.getElementById('nav-grid');
    const mobileLinks = document.getElementById('mobile-links');
    const mobileAuth = document.getElementById('mobile-auth');
    if (!topSlot) return;

    const configured = window.DB_READY;
    const profile = await Auth.profile();
    const links = [homeItem(profile), ...PUBLIC.slice(1), ...(profile ? MEMBERS : [])];

    // Keep only the first match active if any nav items ever share an href.
    const markedHrefs = new Set();
    const marked = links.map((i) => {
      const active = i.href === current && !markedHrefs.has(i.href);
      if (active) markedHrefs.add(i.href);
      return { ...i, active };
    });

    if (gridSlot) gridSlot.innerHTML = marked.map((i) => navLink(i, false, i.active)).join('');
    if (mobileLinks) mobileLinks.innerHTML = marked.map((i) => navLink(i, true, i.active)).join('');

    const initial = (profile?.full_name || profile?.email || 'U').trim().charAt(0).toUpperCase();
    topSlot.innerHTML = `
      <span class="config-dot" title="${configured ? 'Supabase connected' : 'Setup required — configure js/config.js'}"></span>
      ${profile ? `<a class="user-chip" href="account" title="${App.h(profile.email)} — open account">
        <span class="avatar-sm">${App.h(initial)}</span>
        <span class="user-meta"><b>${App.h(profile.full_name || 'Member')}</b><small>${App.h(profile.role)}</small></span>
      </a>
      <button class="icon-btn" type="button" data-logout title="Logout"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>` : ''}`;

    if (navSlot) navSlot.innerHTML = `<div class="auth-buttons">${discordCta()}${authButtons(profile)}</div>`;
    if (mobileAuth) mobileAuth.innerHTML = `<div class="auth-buttons">${discordCta()}${authButtons(profile)}</div>`;

    document.querySelectorAll('[data-logout]').forEach((btn) => {
      btn.addEventListener('click', () => Auth.signOut());
    });

    await renderDiscordGate(profile);
    return profile;
  }

  // A signed-in member who reopens the site (no same-site referrer) lands on
  // the Dashboard instead of Home/Login. Internal links like the brand logo
  // still open Home normally, because they arrive with our own origin as
  // referrer. replace() keeps Back from bouncing to the old landing page.
  function landOnDashboard(profile) {
    if (!profile || !window.DB_READY) return;
    if (!['index', 'login', 'register'].includes(App.pageKey())) return;
    let internal = false;
    try { internal = Boolean(document.referrer && new URL(document.referrer).origin === location.origin); } catch {}
    if (internal) return;
    location.replace('dashboard');
  }

  function initNav() {
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-nav');
    btn?.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}"></i>`;
    });
    // Event delegation keeps menu links working after renderAuth re-renders them
    menu?.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-link')) {
        menu.classList.remove('open');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await App.loadSettings();
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    if (header) header.innerHTML = headerHTML();
    if (footer) footer.innerHTML = footerHTML();

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    initNav();
    const profile = await renderAuth();
    landOnDashboard(profile);
    Auth.onAuthChange(renderAuth);
  });

  window.Layout = { renderAuth };
})();
