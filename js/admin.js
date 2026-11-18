/* ============================================================
   Admin panel — content editor, roles, messages
   ============================================================ */
(function () {
  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
    { id: 'content', label: 'Site content', icon: 'fa-file-lines' },
    { id: 'users', label: 'Users & roles', icon: 'fa-users-gear' },
    { id: 'messages', label: 'Messages', icon: 'fa-inbox' }
  ];

  let profile = null;
  let activeTab = 'overview';

  function tag(text, accent = '') {
    return `<span class="tag ${accent}">${App.h(text)}</span>`;
  }

  function shell() {
    return `
      <div class="admin">
        <aside class="admin-side reveal">
          ${TABS.map((t) => `<button class="admin-tab ${t.id === activeTab ? 'active' : ''}" type="button" data-tab="${t.id}"><i class="fa-solid ${t.icon}"></i> ${t.label}</button>`).join('')}
        </aside>
        <section class="admin-main">
          <div class="admin-head reveal">
            <div><span class="section-label">ADMIN / CONTROL ROOM</span><h2>${App.h(profile.full_name || 'Admin')} <span class="tag lime">${App.h(profile.role)}</span></h2></div>
            <a class="btn btn-ghost sm" href="index"><i class="fa-solid fa-arrow-left"></i> Back to site</a>
          </div>
          <div id="adminView" class="reveal"></div>
        </section>
      </div>`;
  }

  async function count(table) {
    if (!window.DB_READY) return 0;
    const { count: n, error } = await window.sb.from(table).select('*', { count: 'exact', head: true });
    return error ? 0 : n || 0;
  }

  async function overview() {
    const [users, sections, messages] = await Promise.all([
      count('profiles'), count('site_content'), count('contact_messages')
    ]);
    const view = document.getElementById('adminView');
    view.innerHTML = `
      ${window.DB_READY ? '' : '<div class="notice">Supabase is not configured. See <b>SETUP.md</b> and <b>supabase/schema.sql</b> for setup.</div>'}
      <div class="grid g3">
        <div class="panel"><div class="stat-value">${users}</div><div class="stat-label">Registered users</div></div>
        <div class="panel"><div class="stat-value">${sections}</div><div class="stat-label">Content sections</div></div>
        <div class="panel"><div class="stat-value">${messages}</div><div class="stat-label">Messages</div></div>
      </div>
      <div class="panel" style="margin-top:18px">
        <h3 style="font-family:var(--display);margin-top:0">Quick actions</h3>
        <div class="row">
          <button class="btn btn-primary sm" type="button" data-go="content"><i class="fa-solid fa-file-lines"></i> Edit site content</button>
          <button class="btn btn-ghost sm" type="button" data-go="users"><i class="fa-solid fa-users-gear"></i> Manage roles</button>
          <button class="btn btn-ghost sm" type="button" data-go="messages"><i class="fa-solid fa-inbox"></i> Open inbox</button>
        </div>
        <div class="divider"></div>
        <p class="muted small" style="margin:0">Discord login is enabled. Users who sign in with Discord are added to the <code class="accent">profiles</code> table automatically. Use the Users &amp; roles tab to make someone an owner.</p>
      </div>`;
    App.qsa('[data-go]', view).forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.go)));
  }

  async function contentEditor() {
    const view = document.getElementById('adminView');
    const keys = window.SECTION_KEYS || [];
    view.innerHTML = `
      <div class="panel">
        <div class="spread" style="margin-bottom:16px">
          <div><h3 style="font-family:var(--display);margin:0">Edit site content</h3><p class="muted small" style="margin:2px 0 0">Edit the JSON and save — the site will load the new data immediately.</p></div>
          <select id="sectionSelect" class="role-select" style="min-width:180px">${keys.map((k) => `<option value="${App.h(k)}">${App.h(k)}</option>`).join('')}</select>
        </div>
        <textarea id="jsonEditor" class="json-editor" spellcheck="false"></textarea>
        <div class="row" style="margin-top:14px">
          <button class="btn btn-primary sm" type="button" id="saveContent"><i class="fa-solid fa-floppy-disk"></i> Save changes</button>
          <button class="btn btn-ghost sm" type="button" id="formatContent"><i class="fa-solid fa-wand-magic-sparkles"></i> Format JSON</button>
          <button class="btn btn-danger sm" type="button" id="resetContent"><i class="fa-solid fa-rotate-left"></i> Reset to default</button>
        </div>
      </div>`;

    const select = document.getElementById('sectionSelect');
    const editor = document.getElementById('jsonEditor');

    async function load(key) {
      editor.value = JSON.stringify(await App.loadContent(key), null, 2);
    }
    await load(select.value);

    select.addEventListener('change', () => load(select.value));
    document.getElementById('formatContent').addEventListener('click', () => {
      try { editor.value = JSON.stringify(JSON.parse(editor.value), null, 2); App.toast('JSON formatted'); }
      catch (err) { App.toast('Invalid JSON: ' + err.message, 'err'); }
    });
    document.getElementById('resetContent').addEventListener('click', () => load(select.value));
    document.getElementById('saveContent').addEventListener('click', async () => {
      try {
        const value = JSON.parse(editor.value);
        await App.saveContent(select.value, value);
        App.toast(`${select.value} saved`);
      } catch (err) { App.toast(err.message, 'err'); }
    });
  }

  async function usersTab() {
    const view = document.getElementById('adminView');
    view.innerHTML = `<div class="panel">${App.loading('Loading users')}</div>`;
    if (!window.DB_READY) {
      view.innerHTML = '<div class="panel"><div class="notice">Supabase is not configured. See SETUP.md for setup.</div></div>';
      return;
    }
    const { data, error } = await window.sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { view.innerHTML = App.error(error.message); return; }

    view.innerHTML = `
      <div class="panel">
        <div class="spread" style="margin-bottom:14px"><h3 style="font-family:var(--display);margin:0">Users &amp; roles</h3>${tag(`${data.length} users`, 'lime')}</div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Joined</th><th>Role</th><th></th></tr></thead>
            <tbody>
              ${data.map((u) => `
                <tr data-id="${App.h(u.id)}">
                  <td><b>${App.h(u.full_name || 'Member')}</b></td>
                  <td class="mono small">${App.h(u.email || '—')}</td>
                  <td class="small">${App.h(App.date(u.created_at))}</td>
                  <td>
                    <select class="role-select">
                      <option value="user" ${u.role === 'user' ? 'selected' : ''}>user</option>
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                      <option value="owner" ${u.role === 'owner' ? 'selected' : ''}>owner</option>
                    </select>
                  </td>
                  <td><button class="btn btn-ghost sm save-role" type="button">Save</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="dim small" style="margin-bottom:0">Role changes go through the secure RPC (<code>set_user_role</code>) — RLS is not bypassed.</p>
      </div>`;

    App.qsa('.save-role', view).forEach((btn) => btn.addEventListener('click', async () => {
      const row = btn.closest('tr');
      const role = row.querySelector('.role-select').value;
      try {
        const { error } = await window.sb.rpc('set_user_role', { target: row.dataset.id, new_role: role });
        if (error) throw error;
        App.toast('Role updated');
      } catch (err) { App.toast(err.message, 'err'); }
    }));
  }

  async function messagesTab() {
    const view = document.getElementById('adminView');
    view.innerHTML = `<div class="panel">${App.loading('Loading messages')}</div>`;
    if (!window.DB_READY) {
      view.innerHTML = '<div class="panel"><div class="notice">Supabase is not configured. See SETUP.md for setup.</div></div>';
      return;
    }
    const { data, error } = await window.sb.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) { view.innerHTML = App.error(error.message); return; }

    view.innerHTML = `
      <div class="panel">
        <div class="spread" style="margin-bottom:14px"><h3 style="font-family:var(--display);margin:0">Message inbox</h3>${tag(`${data.length} messages`, 'lime')}</div>
        ${data.length ? data.map((m) => `
          <div class="card" style="margin-bottom:12px" data-id="${App.h(m.id)}">
            <div class="spread">
              <div><h3 style="margin:0 0 3px">${App.h(m.subject || '(no subject)')}</h3><div class="dim small">${App.h(m.name)} · ${App.h(m.email)} · ${App.h(App.date(m.created_at))}</div></div>
              <button class="btn btn-danger sm del-msg" type="button"><i class="fa-solid fa-trash"></i></button>
            </div>
            <p class="muted small" style="margin:12px 0 0;white-space:pre-wrap">${App.h(m.message)}</p>
          </div>`).join('') : '<div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>Inbox empty</h3><p>There are no messages yet.</p></div>'}
      </div>`;

    App.qsa('.del-msg', view).forEach((btn) => btn.addEventListener('click', async () => {
      const id = btn.closest('[data-id]').dataset.id;
      const { error } = await window.sb.from('contact_messages').delete().eq('id', id);
      if (error) return App.toast(error.message, 'err');
      btn.closest('[data-id]').remove();
      App.toast('Message deleted');
    }));
  }

  const tabs = { overview, content: contentEditor, users: usersTab, messages: messagesTab };

  function switchTab(id) {
    activeTab = id;
    App.qsa('.admin-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
    App.mount(App.loading());
    // Re-mount shell without losing the active tab highlight
    const app = document.getElementById('app');
    app.innerHTML = shell();
    App.qsa('.reveal', app).forEach((el, i) => {
      el.style.animationDelay = `${i * 40}ms`;
      requestAnimationFrame(() => el.classList.add('in'));
    });
    App.qsa('.admin-tab', app).forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    tabs[id]().catch((err) => App.toast(err.message, 'err'));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const signed = await App.requireAuth();
    if (!signed) return;
    if (!window.DB_READY) {
      App.mount(`
        <div class="panel empty-state">
          <i class="fa-solid fa-shield-halved"></i>
          <h3>Admin panel — setup required</h3>
          <p>First add the Supabase URL and anon key to <b>js/config.js</b>, then run <b>supabase/schema.sql</b>.<br>Discord login is enabled in the same setup (see README).</p>
          <a class="btn btn-ghost" href="index"><i class="fa-solid fa-arrow-left"></i> Back to site</a>
        </div>`);
      return;
    }
    profile = await App.requireAdmin();
    if (!profile) return;
    App.mount(shell());
    App.qsa('.admin-tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    await overview();
  });
})();
