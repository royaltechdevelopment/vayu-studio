/* ============================================================
   Shared helpers: content loading, toast, copy, guards, misc.
   ============================================================ */
(function () {
  const App = {};

  App.h = function (value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  };

  App.qs = (sel, root = document) => root.querySelector(sel);
  App.qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  App.toast = function (message, type = 'ok') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.dataset.type = type;
    el.classList.add('show');
    clearTimeout(App._toastTimer);
    App._toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  App.copy = async function (text, btn) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    App.toast('Copied to clipboard');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        const old = icon.className;
        icon.className = 'fa-solid fa-check';
        setTimeout(() => (icon.className = old), 1400);
      }
    }
  };

  App.bindCopy = function (root = document) {
    App.qsa('[data-copy]', root).forEach((btn) => {
      btn.addEventListener('click', () => App.copy(btn.dataset.copy, btn));
    });
  };

  /* Content is stored in Supabase `site_content` (JSONB).
     Falls back to local js/data.js when Supabase is not configured. */
  App.loadContent = async function (key) {
    const fallback = window.SITE_DATA?.[key] ?? null;
    if (!window.DB_READY || !window.sb) return fallback;
    const { data, error } = await window.sb
      .from('site_content')
      .select('data')
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return fallback;
    return data.data ?? fallback;
  };

  App.saveContent = async function (key, value) {
    if (!window.DB_READY || !window.sb) throw new Error('Supabase is not configured.');
    const user = await Auth.user();
    const { error } = await window.sb.from('site_content').upsert({
      key,
      data: value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id || null
    });
    if (error) throw error;
  };

  App.mount = function (html) {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = html;
    App.bindCopy(app);
    requestAnimationFrame(() => App.qsa('.reveal', app).forEach((el, i) => {
      el.style.animationDelay = `${i * 45}ms`;
      el.classList.add('in');
    }));
  };

  App.shell = function (label, title, subtitle, inner) {
    return `
      <div class="page-head reveal">
        <span class="section-label">${App.h(label)}</span>
        <h1>${App.h(title)}</h1>
        ${subtitle ? `<p class="lead">${App.h(subtitle)}</p>` : ''}
      </div>
      ${inner}
    `;
  };

  App.error = function (message) {
    return `<div class="panel empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Something went wrong</h3><p>${App.h(message)}</p></div>`;
  };

  App.loading = function (label = 'Loading') {
    return `<div class="loading"><span class="spinner"></span> ${App.h(label)}…</div>`;
  };

  App.requireAuth = async function (redirect) {
    const profile = await Auth.profile();
    if (profile) return profile;

    const target = redirect || location.pathname.split('/').pop() || 'index.html';

    if (!window.DB_READY) {
      App.mount(App.shell('SETUP REQUIRED', 'Supabase is not configured.', 'Add your project credentials to enable login and member pages.', `
        <div class="panel locked-panel">
          <div class="locked-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div>
          <h3>Connect Supabase to continue</h3>
          <p class="muted">Open <code>js/config.js</code>, paste your Supabase URL and anon key, then run <code>supabase/schema.sql</code> in the SQL Editor. Full steps are in <code>README.md</code>.</p>
          <div class="row" style="margin-top:20px">
            <a class="btn btn-ghost" href="README.md" target="_blank" rel="noopener"><i class="fa-solid fa-book"></i> Setup guide</a>
            <a class="btn btn-primary" href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Go to login</a>
          </div>
        </div>`));
      return null;
    }

    window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
    return null;
  };

  App.requireAdmin = async function () {
    const profile = await Auth.profile();
    if (!profile) {
      window.location.href = 'login.html?redirect=admin.html';
      return null;
    }
    if (!Auth.isAdmin(profile)) {
      App.mount(App.shell('ACCESS DENIED', 'Admin only area', 'You do not have access to this page.', `
        <div class="panel empty-state">
          <i class="fa-solid fa-lock"></i>
          <h3>Restricted</h3>
          <p><code>${App.h(profile.email)}</code> is a regular member account.</p>
          <a class="btn btn-ghost" href="index.html">Back to home</a>
        </div>`));
      return null;
    }
    return profile;
  };

  App.date = function (value) {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  window.App = App;
})();
