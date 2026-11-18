/* ============================================================
   Page renderers. The `data-page` attribute on <body> selects
   which renderer runs.
   ============================================================ */
(function () {
  const page = document.body.dataset.page;
  const social = () => App.settings().SOCIAL || {};

  const CAT_COLORS = {
    linux: 'violet', vps: 'violet', docker: 'lime', git: 'lime',
    networking: 'red', system: 'red', useful: 'lime',
    auto: 'violet', review: 'violet', suggestion: 'lime'
  };

  const param = (name) => new URLSearchParams(location.search).get(name);
  const safeRedirect = () => {
    const r = param('redirect');
    return r && !r.startsWith('http') ? r : 'index';
  };

  // Live Discord members (widget JSON) — used on Team as a member list,
  // while the iframe widget itself stays on Home only.
  async function discordWidget() {
    const id = App.settings().DISCORD_WIDGET_ID;
    if (!id) return null;
    try {
      const res = await fetch(`https://discord.com/api/guilds/${encodeURIComponent(id)}/widget.json`);
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data.members) ? data : null;
    } catch {
      return null;
    }
  }

  const statusClass = (status) =>
    ['online', 'idle', 'dnd', 'offline'].includes(status) ? status : 'online';

  // Tutorials sync: read the channel's public RSS feed through a CORS-enabled
  // JSON bridge. Falls back to local content if the feed is unavailable.
  async function youtubeVideos() {
    const channelId = App.settings().YOUTUBE_CHANNEL_ID;
    if (!channelId) return null;
    const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=12`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status !== 'ok' || !Array.isArray(data.items)) return null;

      const videos = data.items.map((item) => {
        const videoId = String(item.guid || '').replace('yt:video:', '') ||
          (String(item.link || '').match(/(?:v=|shorts\/|embed\/)([\w-]{11})/) || [])[1] || '';
        return {
          videoId,
          title: item.title || 'Untitled video',
          link: item.link || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : social().youtube),
          thumb: item.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : ''),
          date: item.pubDate || ''
        };
      }).filter((v) => v.videoId);

      return videos.length ? videos : null;
    } catch {
      return null;
    }
  }

  // Thumbnail for a manually added video link (used when live sync is off).
  const ytThumb = (url) => {
    const raw = String(url || '').trim();
    const match = raw.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
    const id = match ? match[1] : (/^[\w-]{11}$/.test(raw) ? raw : '');
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
  };

  const shortDate = (value) => {    if (!value) return 'YOUTUBE';
    const d = new Date(value.replace(' ', 'T') + 'Z');
    if (Number.isNaN(d.getTime())) return 'YOUTUBE';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  function tag(text, accent = '') {
    return `<span class="tag ${accent}">${App.h(text)}</span>`;
  }

  function socialCards() {
    return `
      <a class="card reveal" href="${social().discord}" target="_blank" rel="noopener">
        <div class="card-icon violet"><i class="fa-brands fa-discord"></i></div>
        <h3>Vayu Empire</h3><p>Community, support and updates — on Discord.</p>
        <span class="card-cta">Join server <i class="fa-solid fa-arrow-right"></i></span>
      </a>
      <a class="card reveal" href="${social().youtube}" target="_blank" rel="noopener">
        <div class="card-icon red"><i class="fa-brands fa-youtube"></i></div>
        <h3>YouTube</h3><p>Tutorials, gaming and creative experiments.</p>
        <span class="card-cta">Watch channel <i class="fa-solid fa-arrow-right"></i></span>
      </a>
      <a class="card reveal" href="${social().mc}" target="_blank" rel="noopener">
        <div class="card-icon"><i class="fa-solid fa-cube"></i></div>
        <h3>Vayu MC</h3><p>Multi-mode Minecraft network. Java + Bedrock.</p>
        <span class="card-cta">Visit network <i class="fa-solid fa-arrow-right"></i></span>
      </a>`;
  }

  /* ---------------- HOME ---------------- */
  async function home() {
    const d = await App.loadContent('home');

    App.mount(`
      <section class="hero reveal">
        <div>
          <span class="hero-badge"><span class="pulse"></span> ${App.h(d.badge)}</span>
          <h1>${App.h(d.title)}<span>${App.h(d.highlight)}</span></h1>
          <p class="lead">${App.h(d.subtitle)}</p>
          <div class="row hero-actions">
            <a class="btn btn-primary" href="commands"><i class="fa-solid fa-terminal"></i> Explore commands</a>
            <a class="btn btn-ghost" href="${social().discord}" target="_blank" rel="noopener"><i class="fa-brands fa-discord"></i> Join community</a>
          </div>
        </div>
        <div class="hero-art">
          <div class="orb one"></div><div class="orb two"></div>
          <div class="terminal">
            <div class="terminal-bar"><i class="dot a"></i><i class="dot b"></i><i class="dot c"></i><span class="mono small dim" style="margin-left:8px">vayu@studio ~</span></div>
            <div class="terminal-body">
              <div><b>$</b> initializing vayu ecosystem...</div>
              <div style="margin-top:6px">✓ core modules loaded</div>
              <div>✓ community synced</div>
              <div>✓ commands ready</div>
              <div class="command-bar">
                <code>${App.h(d.command)}</code>
                <button class="copy-mini" type="button" data-copy="${App.h(d.command)}"><i class="fa-regular fa-copy"></i> COPY</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid g4 reveal" style="margin-bottom:20px">
        <div class="stat"><div class="stat-value">${App.h(d.status.latency)}</div><div class="stat-label">Latency</div></div>
        <div class="stat"><div class="stat-value">${App.h(d.status.uptime)}</div><div class="stat-label">Uptime</div></div>
        <div class="stat"><div class="stat-value">${App.h(d.status.users)}</div><div class="stat-label">Users</div></div>
        <div class="stat"><div class="stat-value">24/7</div><div class="stat-label">Support</div></div>
      </div>

      <div class="grid g3 reveal" style="margin-bottom:26px">${socialCards()}</div>

      <div class="panel reveal" style="margin-top:26px">
        <div class="spread" style="margin-bottom:14px">
          <div>
            <h3 style="font-family:var(--display);margin:0">Live Discord chat</h3>
            <p class="muted small" style="margin:3px 0 0">Real messages from Vayu Empire's public chat.</p>
          </div>
          ${tag('LIVE', 'lime')}
        </div>
        <iframe class="live-chat-frame"
          src="https://e.widgetbot.io/channels/${encodeURIComponent(App.settings().DISCORD_WIDGET_ID)}/${encodeURIComponent(App.settings().DISCORD_CHAT_CHANNEL_ID)}?theme=dark"
          title="Vayu Empire live Discord chat" allowtransparency="true"></iframe>
        <div class="live-chat-meta">
          <span><span class="status-dot online"></span> Connected to Discord in real time</span>
          <a href="${social().discord}" target="_blank" rel="noopener">Open in Discord <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
        </div>
      </div>
    `);
  }

  /* ---------------- ABOUT ---------------- */
  async function about() {
    const d = await App.loadContent('about');
    App.mount(App.shell(d.kicker, d.title, d.subtitle, `
      <div class="grid g4 reveal" style="margin-bottom:24px">
        ${d.stats.map((s) => `<div class="stat"><div class="stat-value">${App.h(s.value)}</div><div class="stat-label">${App.h(s.label)}</div></div>`).join('')}
      </div>
      <div class="grid g2 reveal">
        <div class="panel">
          <h3 style="font-family:var(--display);margin-top:0">Our mission</h3>
          <p class="muted">${App.h(d.mission)}</p>
          <h4 style="margin-bottom:10px">What we stand for</h4>
          <ul class="feature-list">${d.values.map((v) => `<li><i class="fa-solid fa-check"></i> ${App.h(v)}</li>`).join('')}</ul>
        </div>
        <div class="panel">
          <h3 style="font-family:var(--display);margin-top:0">Our story</h3>
          <p class="muted">${App.h(d.story)}</p>
          <div class="stack" style="margin-top:16px">
            ${d.timeline.map((t) => `<div class="row"><span class="tag lime">${App.h(t.year)}</span><span class="muted small">${App.h(t.text)}</span></div>`).join('')}
          </div>
        </div>
      </div>
      <div style="margin:30px 0 14px"><h2 style="font-family:var(--display);margin:0;font-size:20px">What we offer</h2></div>
      <div class="grid g3">
        ${d.features.map((f) => `<div class="card reveal"><div class="card-icon ${f.icon.includes('youtube') ? 'red' : f.icon.includes('discord') ? 'violet' : ''}"><i class="${App.h(f.icon)}"></i></div><h3>${App.h(f.title)}</h3><p>${App.h(f.text)}</p></div>`).join('')}
      </div>
      <div class="panel reveal" style="margin-top:26px">
        <div class="spread">
          <div><h3 style="font-family:var(--display);margin:0 0 4px">Get in touch</h3><p class="muted small" style="margin:0">Questions, collaborations, or just want to say hello?</p></div>
          <div class="row">
            <a class="btn btn-violet sm" href="${social().discord}" target="_blank" rel="noopener"><i class="fa-brands fa-discord"></i> Discord</a>
            <a class="btn btn-ghost sm" href="contact"><i class="fa-solid fa-envelope"></i> Contact</a>
          </div>
        </div>
      </div>
    `));
  }

  /* ---------------- TEAM ---------------- */
  async function team() {
    const d = await App.loadContent('team');
    const live = await discordWidget();

    const onlinePanel = live ? `
      <div class="panel reveal" style="margin-top:26px">
        <div class="spread" style="margin-bottom:14px">
          <div>
            <h3 style="font-family:var(--display);margin:0">Online now</h3>
            <p class="muted small" style="margin:2px 0 0">Real members from Vayu Empire, live on Discord.</p>
          </div>
          ${tag(`${live.presence_count ?? live.members.length} ONLINE`, 'lime')}
        </div>
        <div class="online-grid">
          ${live.members.length ? live.members.map((m) => {
            const initial = (m.username || '?').trim().charAt(0).toUpperCase();
            const avatar = m.avatar_url
              ? `<img src="${App.h(m.avatar_url)}" alt="">`
              : `<div class="member-avatar">${App.h(initial)}</div>`;
            const game = m.game && m.game.name ? ` · ${App.h(m.game.name)}` : '';
            return `<div class="online-member">
              ${avatar}
              <div class="online-copy">
                <b>${App.h(m.username || 'Member')}</b>
                <small><span class="status-dot ${statusClass(m.status)}"></span> ${App.h(m.status || 'online')}${game}</small>
              </div>
            </div>`;
          }).join('') : '<p class="muted small">No members are online right now.</p>'}
        </div>
      </div>` : '';

    App.mount(App.shell(d.kicker, d.title, d.subtitle, `
      <div class="grid g4">
        ${d.members.map((m, i) => {
          const initial = (m.name || '?').trim().charAt(0).toUpperCase();
          const avatar = m.image
            ? `<img class="member-avatar" src="${App.h(m.image)}" alt="${App.h(m.name)}">`
            : `<div class="member-avatar">${App.h(initial)}</div>`;
          return `<div class="card member-card reveal">
            ${tag(m.tag, m.accent === 'violet' ? 'violet' : 'lime')}
            <div style="height:12px"></div>
            ${avatar}
            <h3>${App.h(m.name)}</h3>
            <div class="role">${App.h(m.role)}</div>
          </div>`;
        }).join('')}
      </div>
      ${onlinePanel}
    `));
  }

  /* ---------------- TUTORIALS ---------------- */
  async function tutorials() {
    const d = await App.loadContent('tutorials');
    const live = await youtubeVideos();
    const fallback = (d.videos || []).map((v) => ({
      ...v,
      link: v.link || social().youtube,
      thumb: v.thumb || ytThumb(v.link)
    }));
    const videos = live || fallback;

    App.mount(App.shell(
      d.kicker,
      d.title,
      live ? 'Latest uploads, synced directly from the Vayu YouTube channel.' : d.subtitle,
      `
        <div class="spread reveal" style="margin-bottom:18px">
          <span class="hero-badge"><span class="pulse"></span> ${live ? 'LIVE SYNC · YOUTUBE FEED' : 'CHANNEL FEED · SNAPSHOT'}</span>
          <a class="btn btn-ghost sm" href="${social().youtube}" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i> Visit channel</a>
        </div>
        <div class="grid g3">
          ${videos.map((v) => `
            <a class="card video-card reveal" href="${App.h(v.link || social().youtube)}" target="_blank" rel="noopener">
              <div class="thumb">
                ${v.thumb ? `<img src="${App.h(v.thumb)}" alt="" loading="lazy">` : ''}
                <span class="play"><i class="fa-solid fa-play"></i></span>
              </div>
              <div class="body">
                <div class="row" style="gap:6px;margin-bottom:9px">
                  ${tag(live ? 'NEW UPLOAD' : v.level, v.level === 'ADVANCED' ? 'violet' : 'lime')}
                  ${tag(live ? shortDate(v.date) : v.duration)}
                </div>
                <h3>${App.h(v.title)}</h3>
                <p>${App.h(live ? 'Watch the latest upload directly on YouTube.' : v.desc)}</p>
              </div>
            </a>`).join('')}
        </div>
      `
    ));
  }

  /* ---------------- GUIDE ---------------- */
  async function guide() {
    const d = await App.loadContent('guide');
    App.mount(App.shell(d.kicker, d.title, d.subtitle,
      d.sections.map((sec, i) => `
        <div class="panel guide-block reveal">
          <div class="guide-head"><span class="num">0${i + 1}</span><h3>${App.h(sec.title)}</h3><span class="muted small">— ${App.h(sec.desc)}</span></div>
          ${sec.items.map((it) => `
            <div class="guide-item">
              <div><div class="mono" style="color:var(--cyan);font-size:12px">${App.h(it.cmd)}</div><div class="dim small">${App.h(it.desc)}</div></div>
              <button class="copy-mini" type="button" data-copy="${App.h(it.cmd)}"><i class="fa-regular fa-copy"></i></button>
            </div>`).join('')}
        </div>`).join('')
    ));
  }

  /* ---------------- COMMANDS ---------------- */
  async function commands() {
    const list = await App.loadContent('commands');
    const cats = ['all', ...new Set(list.map((c) => c.cat))];

    App.mount(App.shell('04 / COMMAND LIBRARY', 'Command Library', `Access over ${list.length}+ system commands instantly. Search, filter and copy.`, `
      <div class="panel reveal">
        <input class="search" id="cmdSearch" type="text" placeholder="Search commands, titles, descriptions…" autocomplete="off">
        <div class="filter-row" id="catFilters">
          ${cats.map((c, i) => `<button class="chip ${i === 0 ? 'active' : ''}" type="button" data-cat="${App.h(c)}">${App.h(c)}</button>`).join('')}
        </div>
        <div class="spread small dim" style="margin-bottom:10px"><span>Showing <b class="accent" id="cmdCount">${list.length}</b> commands</span><span>click <i class="fa-regular fa-copy"></i> to copy</span></div>
        <div class="cmd-table" id="cmdTable"></div>
      </div>
    `));

    const table = document.getElementById('cmdTable');
    const count = document.getElementById('cmdCount');
    const search = document.getElementById('cmdSearch');
    let active = 'all';

    function draw() {
      const q = search.value.toLowerCase().trim();
      const filtered = list.filter((c) =>
        (active === 'all' || c.cat === active) &&
        `${c.title} ${c.code} ${c.desc} ${c.cat}`.toLowerCase().includes(q)
      );
      count.textContent = filtered.length;
      table.innerHTML = filtered.length
        ? filtered.map((c) => `
            <div class="cmd-row">
              <span class="tag ${CAT_COLORS[c.cat] || ''}">${App.h(c.cat)}</span>
              <span class="cmd-title">${App.h(c.title)}<div class="cmd-desc">${App.h(c.desc)}</div></span>
              <span class="cmd-code">${App.h(c.code)}</span>
              <button class="copy-mini" type="button" data-copy="${App.h(c.code)}"><i class="fa-regular fa-copy"></i></button>
            </div>`).join('')
        : `<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><h3>No commands found</h3><p>Try another search term.</p></div>`;
      App.bindCopy(table);
    }

    App.qsa('#catFilters .chip').forEach((btn) => btn.addEventListener('click', () => {
      App.qsa('#catFilters .chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      active = btn.dataset.cat;
      draw();
    }));
    search.addEventListener('input', draw);
    draw();
  }

  /* ---------------- LINKS ---------------- */
  async function links() {
    const d = await App.loadContent('links');
    App.mount(App.shell(d.kicker, d.title, d.subtitle, `
      <div class="grid g2">
        ${d.items.map((l) => `
          <a class="card reveal spread" href="${App.h(l.href)}" target="_blank" rel="noopener">
            <div class="row">
              <div class="card-icon ${l.accent === 'violet' ? 'violet' : l.accent === 'red' ? 'red' : l.accent === 'pink' ? 'pink' : ''}"><i class="${App.h(l.icon)}"></i></div>
              <div><h3 style="margin:0 0 3px">${App.h(l.name)}</h3><p>${App.h(l.desc)}</p></div>
            </div>
            <span class="btn btn-ghost sm">${App.h(l.cta)} <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
          </a>`).join('')}
      </div>
    `));
  }

  /* ---------------- FILES ---------------- */
  async function files() {
    const d = await App.loadContent('files');
    const items = (d.items || []).map((f) => ({
      ...f,
      available: f.available !== undefined
        ? !!f.available
        : /^(available|live)$/i.test(f.status || ''),
      preview: f.preview || (f.banner ? [f.banner] : []),
      details: f.details || [],
      features: f.features || [],
      steps: f.steps || []
    }));

    App.mount(App.shell(d.kicker, d.title, d.subtitle, `
      <div class="grid g2">
        ${items.map((f, i) => `
          <div class="card file-card reveal">
            ${f.banner ? `<div class="file-thumb"><img src="${App.h(f.banner)}" alt="${App.h(f.name)}" loading="lazy"></div>` : ''}
            <div class="spread" style="margin-top:14px"><div class="card-icon violet"><i class="fa-solid ${App.h(f.icon || 'fa-file')}"></i></div><div class="row" style="gap:6px">${tag(f.status, f.available ? 'lime' : 'red')}${tag(f.version)}</div></div>
            <h3 style="margin-top:16px">${App.h(f.name)}</h3>
            <p>${App.h(f.desc)}</p>
            <button class="btn btn-ghost sm file-detail-btn" type="button" data-file="${i}" style="margin-top:18px">
              <i class="fa-solid fa-circle-info"></i> View Details <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>`).join('')}
      </div>

      <div class="modal-backdrop" id="code-modal-backdrop" aria-hidden="true">
        <div class="modal" id="code-modal" role="dialog" aria-modal="true" aria-label="File details">
          <div class="modal-banner" id="code-modal-banner-wrap">
            <img id="code-modal-banner" src="" alt="">
            <button class="modal-x" type="button" id="modal-close-top" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-banner-copy">
              <h2 id="code-modal-title"></h2>
              <div class="row" style="gap:8px;flex-wrap:wrap">
                <span class="tag violet" id="code-modal-version"></span>
                <span class="tag" id="code-modal-category"></span>
                <span class="tag" id="code-modal-status"></span>
              </div>
            </div>
          </div>
          <div class="modal-body">
            <div class="notice" id="code-modal-alert" hidden>
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span id="code-modal-alert-text">This code file has not been uploaded yet. The download will be available soon.</span>
            </div>
            <p class="muted" id="code-modal-desc"></p>

            <div class="modal-section-title"><i class="fa-solid fa-circle-info"></i> File information</div>
            <div class="detail-grid" id="code-modal-details"></div>

            <div id="code-modal-preview-wrap">
              <div class="modal-section-title"><i class="fa-solid fa-images"></i> Preview</div>
              <div class="preview-grid" id="code-modal-preview"></div>
            </div>

            <div class="modal-section-title"><i class="fa-solid fa-star"></i> Features</div>
            <ul class="feature-list" id="code-modal-features-list"></ul>

            <div class="modal-section-title"><i class="fa-solid fa-list-ol"></i> Installation steps</div>
            <ol class="steps" id="code-modal-steps-list"></ol>

            <div class="modal-section-title"><i class="fa-solid fa-terminal"></i> Quick install</div>
            <div class="command-bar"><code id="code-modal-code"></code><button class="copy-mini" type="button" id="code-modal-copy"><i class="fa-regular fa-copy"></i></button></div>

            <div class="modal-actions">
              <a class="btn btn-register" id="code-modal-install" href="#" target="_blank" rel="noopener"><i class="fa-solid fa-download"></i> Install Code</a>
              <button class="btn btn-ghost" type="button" id="modal-close-bottom"><i class="fa-solid fa-xmark"></i> Close</button>
            </div>
          </div>
        </div>
      </div>

      <div class="lightbox" id="lightbox" aria-hidden="true">
        <button class="lightbox-close" type="button" id="lightbox-close" aria-label="Close preview"><i class="fa-solid fa-xmark"></i></button>
        <img id="lightbox-img" src="" alt="Preview">
      </div>
    `));

    const $ = (id) => document.getElementById(id);
    const backdrop = $('code-modal-backdrop');
    const modal = $('code-modal');
    const lightbox = $('lightbox');
    let current = null;

    function openFile(index) {
      const f = items[index];
      if (!f) return;
      current = f;

      const banner = $('code-modal-banner');
      if (f.banner) { banner.src = f.banner; banner.hidden = false; }
      else { banner.removeAttribute('src'); banner.hidden = true; }

      $('code-modal-title').textContent = f.name || 'File details';
      $('code-modal-version').textContent = f.version || '—';
      $('code-modal-category').textContent = f.category || 'Resource';
      const statusEl = $('code-modal-status');
      statusEl.textContent = f.status || (f.available ? 'AVAILABLE' : 'COMING SOON');
      statusEl.className = 'tag ' + (f.available ? 'lime' : 'red');

      $('code-modal-alert').hidden = !!f.available;
      $('code-modal-desc').textContent = f.description || f.desc || '';

      $('code-modal-details').innerHTML = (f.details || []).map((x) => `
        <div class="detail-item"><div class="dim small">${App.h(x.label)}</div><div class="detail-value">${App.h(x.value)}</div></div>`).join('');

      const previews = f.preview || [];
      $('code-modal-preview-wrap').hidden = previews.length === 0;
      $('code-modal-preview').innerHTML = previews.map((src) => `
        <button class="preview-item" type="button" data-preview="${App.h(src)}">
          <img src="${App.h(src)}" alt="Preview of ${App.h(f.name)}" loading="lazy">
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>`).join('');

      $('code-modal-features-list').innerHTML = (f.features || []).map((x) => `
        <li><i class="fa-solid fa-check"></i> ${App.h(x)}</li>`).join('');
      $('code-modal-steps-list').innerHTML = (f.steps || []).map((x) => `<li>${App.h(x)}</li>`).join('');

      const code = f.installCode || '';
      $('code-modal-code').textContent = code;
      $('code-modal-copy').dataset.copy = code;

      const install = $('code-modal-install');
      if (f.available && f.file) {
        install.href = f.file;
        install.classList.remove('disabled');
        install.innerHTML = '<i class="fa-solid fa-download"></i> Install Code';
      } else {
        install.removeAttribute('href');
        install.classList.add('disabled');
        install.innerHTML = '<i class="fa-solid fa-ban"></i> File Not Uploaded';
      }

      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      modal.scrollTop = 0;
      $('modal-close-top').focus();
    }

    function closeModal() {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      current = null;
    }

    function openLightbox(src) {
      if (!src) return;
      $('lightbox-img').src = src;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      $('lightbox-img').removeAttribute('src');
    }

    App.qsa('.file-detail-btn').forEach((btn) => btn.addEventListener('click', () => openFile(Number(btn.dataset.file))));
    $('modal-close-top').addEventListener('click', closeModal);
    $('modal-close-bottom').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    $('code-modal-preview').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preview]');
      if (btn) openLightbox(btn.dataset.preview);
    });
    $('lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (lightbox.classList.contains('open')) closeLightbox();
      else if (backdrop.classList.contains('open')) closeModal();
    });
  }

  /* ---------------- FAQ ---------------- */
  async function faq() {
    const d = await App.loadContent('faq');
    App.mount(App.shell(d.kicker, d.title, d.subtitle,
      d.groups.map((g, gi) => `
        <div style="margin-bottom:26px">
          <div class="spread reveal" style="margin-bottom:12px">
            <h2 style="font-family:var(--display);font-size:19px;margin:0">${App.h(g.title)}</h2>
            <span class="tag lime">${g.items.length} QUESTIONS</span>
          </div>
          <div class="accordion">
            ${g.items.map((it, i) => `
              <div class="acc-item ${gi === 0 && i === 0 ? 'open' : ''}">
                <button class="acc-q" type="button"><span>${App.h(it.q)}</span><i class="fa-solid fa-chevron-down"></i></button>
                <div class="acc-a">${App.h(it.a)}</div>
              </div>`).join('')}
          </div>
        </div>`).join('')
    ));
    App.qsa('.acc-q').forEach((btn) => btn.addEventListener('click', () => btn.closest('.acc-item').classList.toggle('open')));
  }

  /* ---------------- CONTACT ---------------- */
  async function contact() {
    App.mount(App.shell('11 / CONTACT', 'Say hello.', 'Questions, suggestions or collaborations — send a message and it will appear in the admin inbox.', `
      <div class="grid g2">
        <div class="panel reveal">
          ${window.DB_READY ? '' : '<div class="notice">Setup required: messages are saved only after Supabase is configured. See <b>SETUP.md</b>.</div>'}
          <form id="contactForm" class="stack">
            <div class="field"><label>Your name</label><input id="cName" type="text" required placeholder="Vayu fan"></div>
            <div class="field"><label>Email</label><input id="cEmail" type="email" required placeholder="you@example.com"></div>
            <div class="field"><label>Subject</label><input id="cSubject" type="text" required placeholder="Question / Collab / Bug"></div>
            <div class="field"><label>Message</label><textarea id="cMessage" rows="5" required placeholder="Write your message…"></textarea></div>
            <button class="btn btn-primary" type="submit"><i class="fa-solid fa-paper-plane"></i> Send message</button>
          </form>
        </div>
        <div class="panel reveal">
          <h3 style="font-family:var(--display);margin-top:0">Other ways to reach us</h3>
          <div class="stack">
            <a class="card" href="${social().discord}" target="_blank" rel="noopener"><div class="row"><div class="card-icon violet"><i class="fa-brands fa-discord"></i></div><div><h3>Discord</h3><p>Fastest response — Vayu Empire.</p></div></div></a>
            <a class="card" href="${social().youtube}" target="_blank" rel="noopener"><div class="row"><div class="card-icon red"><i class="fa-brands fa-youtube"></i></div><div><h3>YouTube</h3><p>Comments and community posts.</p></div></div></a>
          </div>
        </div>
      </div>
    `));

    document.getElementById('contactForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!window.DB_READY) return App.toast('Supabase is not configured. Message was not saved.', 'warn');
      try {
        const { error } = await window.sb.from('contact_messages').insert({
          name: document.getElementById('cName').value,
          email: document.getElementById('cEmail').value,
          subject: document.getElementById('cSubject').value,
          message: document.getElementById('cMessage').value
        });
        if (error) throw error;
        e.target.reset();
        App.toast('Message sent. It is now in the admin inbox.');
      } catch (err) {
        App.toast(err.message, 'err');
      }
    });
  }

  /* ---------------- LOGIN ---------------- */
  async function login() {
    const redirect = safeRedirect();
    App.mount(`
      <div class="auth-wrap">
        <div class="auth-card panel reveal">
          <div class="auth-logo">
            <div class="brand-mark">V</div>
            <h1>Welcome back.</h1>
            <p>Log in to your Vayu workspace.</p>
          </div>
          ${window.DB_READY ? '' : '<div class="notice">Supabase is not configured yet. See <a class="accent" href="SETUP.md" target="_blank" rel="noopener">the setup guide</a>.</div>'}
          <button class="oauth-btn" type="button" id="discordLogin"><i class="fa-brands fa-discord"></i> Continue with Discord</button>
          <div class="or">OR</div>
          <form id="loginForm" class="stack">
            <div class="field"><label>Email</label><input id="lEmail" type="email" required autocomplete="email"></div>
            <div class="field"><label>Password</label><input id="lPass" type="password" required autocomplete="current-password"></div>
            <button class="btn btn-primary btn-block" type="submit"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
          </form>
          <p class="center small muted" style="margin-bottom:0">New account? <a class="accent" href="register?redirect=${encodeURIComponent(redirect)}">Register here</a></p>
        </div>
      </div>
    `);

    document.getElementById('discordLogin').addEventListener('click', async () => {
      try {
        await Auth.signInWithDiscord(`${location.origin}${location.pathname.replace(/[^/]*$/, '')}${redirect}`);
      } catch (err) { App.toast(err.message, 'err'); }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await Auth.signIn(document.getElementById('lEmail').value, document.getElementById('lPass').value);
        location.href = redirect;
      } catch (err) { App.toast(err.message, 'err'); }
    });
  }

  /* ---------------- REGISTER ---------------- */
  async function register() {
    const redirect = safeRedirect();
    App.mount(`
      <div class="auth-wrap">
        <div class="auth-card panel reveal">
          <div class="auth-logo">
            <div class="brand-mark">V</div>
            <h1>Join the ecosystem.</h1>
            <p>Create a free account and unlock the tools.</p>
          </div>
          ${window.DB_READY ? '' : '<div class="notice">Supabase is not configured yet. Add your URL and anon key in <b>js/config.js</b> first. <a class="accent" href="SETUP.md" target="_blank" rel="noopener">Setup guide</a>.</div>'}
          <button class="oauth-btn" type="button" id="discordSignup"><i class="fa-brands fa-discord"></i> Continue with Discord</button>
          <div class="or">OR</div>
          <form id="registerForm" class="stack">
            <div class="field"><label>Full name</label><input id="rName" type="text" required placeholder="Your name"></div>
            <div class="field"><label>Email</label><input id="rEmail" type="email" required autocomplete="email"></div>
            <div class="field"><label>Password</label><input id="rPass" type="password" required minlength="6" autocomplete="new-password"></div>
            <div class="field"><label>Confirm password</label><input id="rPass2" type="password" required minlength="6" autocomplete="new-password"></div>
            <button class="btn btn-primary btn-block" type="submit"><i class="fa-solid fa-user-plus"></i> Create account</button>
          </form>
          <p class="center small muted" style="margin-bottom:0">Already have an account? <a class="accent" href="login?redirect=${encodeURIComponent(redirect)}">Log in</a></p>
        </div>
      </div>
    `);

    document.getElementById('discordSignup').addEventListener('click', async () => {
      try {
        await Auth.signInWithDiscord(`${location.origin}${location.pathname.replace(/[^/]*$/, '')}${redirect}`);
      } catch (err) { App.toast(err.message, 'err'); }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = document.getElementById('rPass').value;
      const pass2 = document.getElementById('rPass2').value;
      if (pass !== pass2) return App.toast('Passwords do not match', 'err');
      try {
        const data = await Auth.signUp(
          document.getElementById('rEmail').value,
          pass,
          document.getElementById('rName').value
        );
        if (data.session) location.href = redirect;
        else App.toast('Account created! Verify your email address.', 'ok');
      } catch (err) { App.toast(err.message, 'err'); }
    });
  }

  const pages = {
    home, about, team, tutorials, guide, commands, links,
    files, faq, contact, login, register
  };

  // Only these pages are public. Everything else is members-only.
  const PUBLIC_PAGES = ['home', 'about', 'team', 'tutorials', 'contact', 'login', 'register'];

  document.addEventListener('DOMContentLoaded', async () => {
    await App.loadSettings();
    const render = pages[page];
    if (!render) return;
    App.mount(App.loading());
    if (!PUBLIC_PAGES.includes(page)) {
      const profile = await App.requireAuth();
      if (!profile) return;
    }
    try { await render(); }
    catch (err) { App.mount(App.error(err.message || String(err))); }
  });
})();
