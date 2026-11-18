/* ============================================================
   Admin panel — full site CMS, roles, messages
   Every section of the public site can be edited with forms:
   add / remove / reorder items, no JSON knowledge required.
   ============================================================ */
(function () {
  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
    { id: 'content', label: 'Site content', icon: 'fa-pen-to-square' },
    { id: 'users', label: 'Users & roles', icon: 'fa-users-gear' },
    { id: 'messages', label: 'Messages', icon: 'fa-inbox' },
    { id: 'advanced', label: 'Advanced JSON', icon: 'fa-code' }
  ];

  const ACCENTS = [
    { value: 'lime', label: 'Lime' },
    { value: 'violet', label: 'Violet' },
    { value: 'red', label: 'Red' },
    { value: 'pink', label: 'Pink' },
    { value: 'cyan', label: 'Cyan' },
    { value: '', label: 'Default' }
  ];

  const LEVELS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  /* ---------------- CMS schema ----------------
     type: text | area | code | bool | select | image | group | strings | list
     A list contains `fields` (repeatable cards). `itemLabel` titles each card. */
  const SECTIONS = [
    {
      key: 'home', label: 'Home', icon: 'fa-house', page: 'index',
      desc: 'Hero headline, installer command and the live status numbers.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'badge', label: 'Status badge' },
        { k: 'title', label: 'Headline' },
        { k: 'highlight', label: 'Highlighted line' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        { k: 'command', label: 'Install command', type: 'code', hint: 'Shown in the terminal box on the home page.' },
        {
          k: 'status', label: 'Live status', type: 'group', fields: [
            { k: 'latency', label: 'Latency' },
            { k: 'uptime', label: 'Uptime' },
            { k: 'users', label: 'Users' }
          ]
        }
      ]
    },
    {
      key: 'about', label: 'About', icon: 'fa-circle-info', page: 'about',
      desc: 'Page heading, stats, mission, values, story, timeline and feature cards.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'stats', label: 'Stats', type: 'list', itemLabel: (i) => i.label || 'Stat', fields: [
            { k: 'value', label: 'Value' },
            { k: 'label', label: 'Label' }
          ]
        },
        { k: 'mission', label: 'Mission', type: 'area', rows: 4 },
        { k: 'values', label: 'Values', type: 'strings', placeholder: 'One value per line' },
        { k: 'story', label: 'Story', type: 'area', rows: 4 },
        {
          k: 'timeline', label: 'Timeline', type: 'list', itemLabel: (i) => i.year || 'Entry', fields: [
            { k: 'year', label: 'Year' },
            { k: 'text', label: 'Text', type: 'area' }
          ]
        },
        {
          k: 'features', label: 'Feature cards', type: 'list', itemLabel: (i) => i.title || 'Feature', fields: [
            { k: 'icon', label: 'Icon class', hint: 'e.g. fa-solid fa-server or fa-brands fa-discord' },
            { k: 'title', label: 'Title' },
            { k: 'text', label: 'Text', type: 'area' }
          ]
        }
      ]
    },
    {
      key: 'team', label: 'Team', icon: 'fa-users', page: 'team',
      desc: 'Team members, roles, tags and photos.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'members', label: 'Members', type: 'list', itemLabel: (i) => i.name || 'Member', fields: [
            { k: 'name', label: 'Name' },
            { k: 'role', label: 'Role' },
            { k: 'tag', label: 'Tag', hint: 'OWNER, CORE, STAFF…' },
            { k: 'image', label: 'Photo', type: 'image', hint: 'images/royal.jpg or a full https:// URL' },
            { k: 'accent', label: 'Accent', type: 'select', options: ACCENTS }
          ]
        }
      ]
    },
    {
      key: 'tutorials', label: 'Tutorials', icon: 'fa-play', page: 'tutorials',
      desc: 'Video list with level and duration. Live YouTube videos load separately.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'videos', label: 'Videos', type: 'list', itemLabel: (i) => i.title || 'Video', fields: [
            { k: 'title', label: 'Title' },
            { k: 'level', label: 'Level', type: 'select', options: LEVELS },
            { k: 'duration', label: 'Duration', hint: 'e.g. 12:40' },
            { k: 'desc', label: 'Description', type: 'area' }
          ]
        }
      ]
    },
    {
      key: 'guide', label: 'Command guide', icon: 'fa-list-check', page: 'tutorial-guide',
      desc: 'Step-by-step command guide. Sections contain command rows.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'sections', label: 'Guide sections', type: 'list', itemLabel: (i) => i.title || 'Section', fields: [
            { k: 'title', label: 'Section title' },
            { k: 'desc', label: 'Section description', type: 'area' },
            {
              k: 'items', label: 'Commands', type: 'list', itemLabel: (i) => i.cmd || 'Command', fields: [
                { k: 'cmd', label: 'Command', type: 'code' },
                { k: 'desc', label: 'Description' }
              ]
            }
          ]
        }
      ]
    },
    {
      key: 'commands', label: 'Command library', icon: 'fa-terminal', page: 'commands',
      desc: 'Every command in the searchable library. Add, edit, reorder or remove.',
      rootArray: true,
      fields: [
        {
          k: '', label: 'Commands', type: 'list', itemLabel: (i) => i.title || 'Command', fields: [
            { k: 'cat', label: 'Category', hint: 'linux, vps, docker, git, networking, system, useful, auto, review, suggestion' },
            { k: 'title', label: 'Title' },
            { k: 'code', label: 'Command', type: 'code' },
            { k: 'desc', label: 'Description' }
          ]
        }
      ]
    },
    {
      key: 'links', label: 'Quick links', icon: 'fa-link', page: 'links',
      desc: 'Official channels and destinations shown on the links page.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'items', label: 'Links', type: 'list', itemLabel: (i) => i.name || 'Link', fields: [
            { k: 'name', label: 'Name' },
            { k: 'desc', label: 'Description' },
            { k: 'cta', label: 'Button text' },
            { k: 'icon', label: 'Icon class' },
            { k: 'href', label: 'URL' },
            { k: 'accent', label: 'Accent', type: 'select', options: ACCENTS }
          ]
        }
      ]
    },
    {
      key: 'files', label: 'Files & downloads', icon: 'fa-download', page: 'files',
      desc: 'Download cards with banner, preview images, details, features and install steps.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'items', label: 'Files', type: 'list', itemLabel: (i) => i.name || 'File', fields: [
            { k: 'name', label: 'Name' },
            { k: 'version', label: 'Version' },
            { k: 'status', label: 'Status badge', hint: 'AVAILABLE, COMING SOON…' },
            { k: 'icon', label: 'Icon class' },
            { k: 'category', label: 'Category' },
            { k: 'available', label: 'Available for download', type: 'bool' },
            { k: 'banner', label: 'Banner image', type: 'image' },
            { k: 'preview', label: 'Preview images', type: 'strings', placeholder: 'images/royal.jpg' },
            { k: 'desc', label: 'Short description' },
            { k: 'description', label: 'Full description', type: 'area', rows: 4 },
            {
              k: 'details', label: 'Details table', type: 'list', itemLabel: (i) => i.label || 'Row', fields: [
                { k: 'label', label: 'Label' },
                { k: 'value', label: 'Value' }
              ]
            },
            { k: 'features', label: 'Features', type: 'strings' },
            { k: 'steps', label: 'Install steps', type: 'strings' },
            { k: 'file', label: 'Download file path', hint: 'e.g. codes/pterodash.zip or a full URL' },
            { k: 'installCode', label: 'Install command', type: 'code' }
          ]
        }
      ]
    },
    {
      key: 'faq', label: 'FAQ', icon: 'fa-circle-question', page: 'faq',
      desc: 'FAQ groups and questions.',
      fields: [
        { k: 'kicker', label: 'Kicker / label' },
        { k: 'title', label: 'Title' },
        { k: 'subtitle', label: 'Subtitle', type: 'area' },
        {
          k: 'groups', label: 'FAQ groups', type: 'list', itemLabel: (i) => i.title || 'Group', fields: [
            { k: 'title', label: 'Group title' },
            {
              k: 'items', label: 'Questions', type: 'list', itemLabel: (i) => i.q || 'Question', fields: [
                { k: 'q', label: 'Question' },
                { k: 'a', label: 'Answer', type: 'area' }
              ]
            }
          ]
        }
      ]
    },
    {
      key: 'site_settings', label: 'Site settings', icon: 'fa-sliders',
      desc: 'Global IDs and social links used across the whole site.',
      fields: [
        { k: 'ADMIN_DISCORD_ID', label: 'Owner Discord ID', hint: 'Numbers only. This account becomes owner on login.' },
        { k: 'DEFAULT_ADMIN_EMAIL', label: 'Fallback admin email' },
        { k: 'YOUTUBE_CHANNEL_ID', label: 'YouTube channel ID' },
        { k: 'DISCORD_WIDGET_ID', label: 'Discord server (widget) ID' },
        { k: 'DISCORD_CHAT_CHANNEL_ID', label: 'Discord chat channel ID' },
        {
          k: 'SOCIAL', label: 'Social links', type: 'group', fields: [
            { k: 'youtube', label: 'YouTube URL' },
            { k: 'instagram', label: 'Instagram URL' },
            { k: 'discord', label: 'Discord invite URL' },
            { k: 'mc', label: 'Minecraft site URL' }
          ]
        }
      ]
    }
  ];

  let profile = null;
  let activeTab = 'overview';
  let cms = null; // { section, draft, dirty, lists }

  /* ---------------- small helpers ---------------- */
  function tag(text, accent = '') {
    return `<span class="tag ${accent}">${App.h(text)}</span>`;
  }

  function clone(value) {
    if (value === undefined) return undefined;
    try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
  }

  function joinPath(a, b) {
    if (!a) return b;
    if (!b) return a;
    return `${a}.${b}`;
  }

  function getPath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
  }

  function setPath(obj, path, value) {
    if (!path) return;
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const k = parts[i];
      if (cur[k] == null || typeof cur[k] !== 'object') {
        cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      }
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
  }

  function deepMerge(base, over) {
    if (Array.isArray(over)) return clone(over);
    if (over && typeof over === 'object') {
      const out = (base && typeof base === 'object' && !Array.isArray(base)) ? clone(base) : {};
      Object.keys(over).forEach((k) => { out[k] = deepMerge(out[k], over[k]); });
      return out;
    }
    if (over === undefined || over === null) return base === undefined ? over : clone(base);
    return over;
  }

  function sectionByKey(key) {
    return SECTIONS.find((s) => s.key === key) || SECTIONS[0];
  }

  function fieldId(path) {
    return 'f_' + (path || 'root').replace(/[^a-zA-Z0-9]/g, '_');
  }

  /* ---------------- defaults ---------------- */
  function defaultFor(f) {
    if (f.def !== undefined) return clone(f.def);
    switch (f.type) {
      case 'bool': return false;
      case 'strings': case 'list': return [];
      case 'group': return defaultObject(f.fields || []);
      case 'select': return f.options?.[0]?.value ?? '';
      default: return '';
    }
  }

  function defaultObject(fields) {
    const out = {};
    (fields || []).forEach((f) => { if (f.k) out[f.k] = defaultFor(f); });
    return out;
  }

  function listIndex(fields, prefix = '', map = {}) {
    (fields || []).forEach((f) => {
      const path = joinPath(prefix, f.k);
      if (f.type === 'list') {
        map[path] = f.fields || [];
        listIndex(f.fields || [], path, map);
      } else if (f.type === 'group') {
        listIndex(f.fields || [], path, map);
      }
    });
    return map;
  }

  /* ---------------- form rendering ---------------- */
  function textField(f, path, value) {
    const id = fieldId(path);
    const cls = f.type === 'area' || f.type === 'code' ? 'wide' : '';
    const rows = f.rows || (f.type === 'code' ? 2 : 3);
    if (f.type === 'area' || f.type === 'code') {
      return `<div class="cms-field ${cls}">
        <label for="${id}">${App.h(f.label)}</label>
        <textarea id="${id}" data-path="${App.h(path)}" rows="${rows}" class="${f.type === 'code' ? 'mono' : ''}" placeholder="${App.h(f.placeholder || '')}">${App.h(value ?? '')}</textarea>
        ${f.hint ? `<span class="cms-hint">${App.h(f.hint)}</span>` : ''}
      </div>`;
    }
    return `<div class="cms-field">
      <label for="${id}">${App.h(f.label)}</label>
      <input type="text" id="${id}" data-path="${App.h(path)}" value="${App.h(value ?? '')}" placeholder="${App.h(f.placeholder || '')}">
      ${f.hint ? `<span class="cms-hint">${App.h(f.hint)}</span>` : ''}
    </div>`;
  }

  function imageField(f, path, value) {
    const id = fieldId(path);
    const src = String(value || '');
    return `<div class="cms-field">
      <label for="${id}">${App.h(f.label)}</label>
      <div class="cms-image-row">
        <img class="cms-thumb" data-thumb="${App.h(path)}" src="${App.h(src)}" alt="" ${src ? '' : 'hidden'} onerror="this.hidden=true">
        <input type="text" id="${id}" data-path="${App.h(path)}" data-image="1" value="${App.h(src)}" placeholder="images/royal.jpg or https://…">
      </div>
      ${f.hint ? `<span class="cms-hint">${App.h(f.hint)}</span>` : ''}
    </div>`;
  }

  function boolField(f, path, value) {
    return `<div class="cms-field">
      <label class="cms-check" for="${fieldId(path)}">
        <input type="checkbox" id="${fieldId(path)}" data-path="${App.h(path)}" ${value ? 'checked' : ''}>
        <span>${App.h(f.label)}</span>
      </label>
      ${f.hint ? `<span class="cms-hint">${App.h(f.hint)}</span>` : ''}
    </div>`;
  }

  function selectField(f, path, value) {
    const id = fieldId(path);
    return `<div class="cms-field">
      <label for="${id}">${App.h(f.label)}</label>
      <select id="${id}" data-path="${App.h(path)}">
        ${(f.options || []).map((o) => `<option value="${App.h(o.value)}" ${String(value) === String(o.value) ? 'selected' : ''}>${App.h(o.label)}</option>`).join('')}
      </select>
      ${f.hint ? `<span class="cms-hint">${App.h(f.hint)}</span>` : ''}
    </div>`;
  }

  function groupField(f, path, value) {
    const data = value && typeof value === 'object' ? value : {};
    return `<div class="cms-field wide cms-group">
      <div class="cms-group-head"><b>${App.h(f.label)}</b>${f.hint ? `<span class="cms-hint">${App.h(f.hint)}</span>` : ''}</div>
      <div class="cms-grid">
        ${(f.fields || []).map((sub) => fieldHtml(sub, joinPath(path, sub.k), data[sub.k])).join('')}
      </div>
    </div>`;
  }

  function stringsField(f, path, value) {
    const arr = Array.isArray(value) ? value : [];
    return `<div class="cms-field wide">
      <div class="cms-list-head">
        <div><b>${App.h(f.label)}</b><span class="cms-count">${arr.length}</span>
          ${f.hint ? `<div class="cms-hint">${App.h(f.hint)}</div>` : ''}
        </div>
        <button type="button" class="btn btn-ghost sm" data-act="add" data-kind="strings" data-list="${App.h(path)}"><i class="fa-solid fa-plus"></i> Add</button>
      </div>
      <div class="cms-rows">
        ${arr.length ? arr.map((item, i) => `
          <div class="cms-row">
            <input type="text" data-path="${App.h(`${path}.${i}`)}" value="${App.h(item ?? '')}" placeholder="${App.h(f.placeholder || '')}">
            <button type="button" class="cms-icon-btn danger" data-act="del" data-list="${App.h(path)}" data-index="${i}" title="Remove"><i class="fa-solid fa-xmark"></i></button>
          </div>`).join('') : '<div class="cms-empty">Nothing yet — click Add.</div>'}
      </div>
    </div>`;
  }

  function listField(f, path, value) {
    const arr = Array.isArray(value) ? value : [];
    const labelOf = typeof f.itemLabel === 'function' ? f.itemLabel : (item, i) => `Item ${i + 1}`;
    return `<div class="cms-field wide">
      <div class="cms-list-head">
        <div><b>${App.h(f.label)}</b><span class="cms-count">${arr.length}</span>
          ${f.hint ? `<div class="cms-hint">${App.h(f.hint)}</div>` : ''}
        </div>
        <button type="button" class="btn btn-primary sm" data-act="add" data-kind="list" data-list="${App.h(path)}"><i class="fa-solid fa-plus"></i> Add ${App.h(f.label.toLowerCase())}</button>
      </div>
      <div class="cms-items">
        ${arr.length ? arr.map((item, i) => {
          const base = joinPath(path, String(i));
          return `<div class="cms-item">
            <div class="cms-item-head">
              <span class="cms-item-title"><i class="fa-solid fa-grip-vertical"></i> ${App.h(labelOf(item || {}, i))}</span>
              <div class="cms-item-actions">
                <button type="button" class="cms-icon-btn" data-act="up" data-list="${App.h(path)}" data-index="${i}" title="Move up" ${i === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                <button type="button" class="cms-icon-btn" data-act="down" data-list="${App.h(path)}" data-index="${i}" title="Move down" ${i === arr.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                <button type="button" class="cms-icon-btn danger" data-act="del" data-list="${App.h(path)}" data-index="${i}" title="Remove"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
            <div class="cms-grid">
              ${(f.fields || []).map((sub) => fieldHtml(sub, joinPath(base, sub.k), (item || {})[sub.k])).join('')}
            </div>
          </div>`;
        }).join('') : '<div class="cms-empty">Nothing yet — click Add.</div>'}
      </div>
    </div>`;
  }

  function fieldHtml(f, path, value) {
    switch (f.type) {
      case 'area':
      case 'code': return textField(f, path, value);
      case 'image': return imageField(f, path, value);
      case 'bool': return boolField(f, path, value);
      case 'select': return selectField(f, path, value);
      case 'group': return groupField(f, path, value);
      case 'strings': return stringsField(f, path, value);
      case 'list': return listField(f, path, value);
      default: return textField(f, path, value);
    }
  }

  /* ---------------- content tab ---------------- */
  function updateDirty() {
    const fab = document.getElementById('cmsFab');
    if (fab) fab.classList.toggle('show', Boolean(cms && cms.dirty));
  }

  function markDirty() {
    if (!cms) return;
    cms.dirty = true;
    updateDirty();
  }

  function renderCmsForm(keepScroll) {
    const form = document.getElementById('cmsForm');
    if (!form || !cms) return;
    const y = window.scrollY;
    form.innerHTML = cms.section.fields
      .map((f) => fieldHtml(f, f.k, getPath(cms.draft, f.k)))
      .join('');
    if (keepScroll) requestAnimationFrame(() => window.scrollTo(0, y));
  }

  function onFieldInput(e) {
    const el = e.target.closest('[data-path]');
    if (!el || !cms) return;
    const path = el.dataset.path;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setPath(cms.draft, path, value);
    if (el.dataset.image === '1') {
      const img = document.querySelector(`[data-thumb="${path}"]`);
      if (img) {
        if (value) { img.src = value; img.hidden = false; } else { img.hidden = true; }
      }
    }
    markDirty();
  }

  function onFormClick(e) {
    const btn = e.target.closest('[data-act]');
    if (!btn || !cms) return;
    e.preventDefault();
    const act = btn.dataset.act;
    const listPath = btn.dataset.list || '';
    const arr = getPath(cms.draft, listPath);
    if (!Array.isArray(arr)) return;
    const i = Number(btn.dataset.index || 0);

    if (act === 'add') {
      if (btn.dataset.kind === 'strings') {
        arr.push('');
      } else {
        const fields = cms.lists[listPath] || cms.lists[listPath.replace(/\.\d+/g, '')] || [];
        arr.push(defaultObject(fields));
      }
    } else if (act === 'del') {
      if (!window.confirm('Remove this item?')) return;
      arr.splice(i, 1);
    } else if (act === 'up' && i > 0) {
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    } else if (act === 'down' && i < arr.length - 1) {
      [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
    } else {
      return;
    }
    markDirty();
    renderCmsForm(true);
  }

  async function saveCms() {
    if (!cms) return;
    const buttons = App.qsa('#cmsSave, #cmsSaveFab');
    buttons.forEach((b) => { b.disabled = true; });
    try {
      await App.saveContent(cms.section.key, cms.draft);
      cms.dirty = false;
      updateDirty();
      App.toast(`${cms.section.label} saved — live on the site`);
    } catch (err) {
      App.toast(err.message, 'err');
    } finally {
      buttons.forEach((b) => { b.disabled = false; });
    }
  }

  async function contentEditor(targetKey) {
    const view = document.getElementById('adminView');
    const key = targetKey || cms?.section?.key || SECTIONS[0].key;
    const section = sectionByKey(key);

    const loaded = await App.loadContent(section.key);
    const base = window.SITE_DATA?.[section.key];
    let draft = deepMerge(base, loaded);
    if (section.rootArray) {
      if (!Array.isArray(draft)) draft = Array.isArray(base) ? clone(base) : [];
    } else if (draft == null || typeof draft !== 'object' || Array.isArray(draft)) {
      draft = {};
    }

    cms = { section, draft, dirty: false, lists: listIndex(section.fields, '') };

    view.innerHTML = `
      <div class="cms-tabs">
        ${SECTIONS.map((s) => `<button type="button" class="cms-chip ${s.key === section.key ? 'active' : ''}" data-section="${s.key}"><i class="fa-solid ${s.icon}"></i> ${App.h(s.label)}</button>`).join('')}
      </div>
      <div class="panel cms-panel">
        <div class="cms-toolbar">
          <div>
            <h3>${App.h(section.label)}</h3>
            <p class="muted small">${App.h(section.desc || '')}</p>
          </div>
          <div class="row">
            ${section.page ? `<a class="btn btn-ghost sm" href="${section.page}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> View page</a>` : ''}
            <button class="btn btn-ghost sm" type="button" id="cmsReload"><i class="fa-solid fa-rotate"></i> Reload</button>
            <button class="btn btn-primary sm" type="button" id="cmsSave"><i class="fa-solid fa-floppy-disk"></i> Save changes</button>
          </div>
        </div>
        <div id="cmsForm" class="cms-grid"></div>
      </div>
      <div class="cms-fab" id="cmsFab">
        <span class="cms-dot"></span> Unsaved changes
        <button class="btn btn-primary sm" type="button" id="cmsSaveFab"><i class="fa-solid fa-floppy-disk"></i> Save</button>
      </div>`;

    renderCmsForm();
    updateDirty();

    const form = document.getElementById('cmsForm');
    form.addEventListener('input', onFieldInput);
    form.addEventListener('change', onFieldInput);
    form.addEventListener('click', onFormClick);

    App.qsa('[data-section]', view).forEach((b) => b.addEventListener('click', async () => {
      if (cms?.dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
      await contentEditor(b.dataset.section);
    }));

    document.getElementById('cmsSave').addEventListener('click', saveCms);
    document.getElementById('cmsSaveFab').addEventListener('click', saveCms);
    document.getElementById('cmsReload').addEventListener('click', async () => {
      if (cms?.dirty && !window.confirm('Discard unsaved changes and reload from the server?')) return;
      await contentEditor(section.key);
      App.toast('Reloaded from Supabase');
    });
  }

  /* ---------------- advanced JSON tab ---------------- */
  async function advancedEditor() {
    const view = document.getElementById('adminView');
    const keys = window.SECTION_KEYS || [];
    view.innerHTML = `
      <div class="panel">
        <div class="spread" style="margin-bottom:16px">
          <div><h3 style="font-family:var(--display);margin:0">Advanced — raw JSON</h3><p class="muted small" style="margin:2px 0 0">Full control for edge cases. Normal editing is on the Site content tab.</p></div>
          <select id="sectionSelect" class="role-select" style="min-width:180px">${keys.map((k) => `<option value="${App.h(k)}">${App.h(k)}</option>`).join('')}</select>
        </div>
        <textarea id="jsonEditor" class="json-editor" spellcheck="false"></textarea>
        <div class="row" style="margin-top:14px">
          <button class="btn btn-primary sm" type="button" id="saveContent"><i class="fa-solid fa-floppy-disk"></i> Save changes</button>
          <button class="btn btn-ghost sm" type="button" id="formatContent"><i class="fa-solid fa-wand-magic-sparkles"></i> Format JSON</button>
          <button class="btn btn-ghost sm" type="button" id="resetContent"><i class="fa-solid fa-rotate-left"></i> Reload from server</button>
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

  /* ---------------- shell ---------------- */
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
        <h3 style="font-family:var(--display);margin-top:0">Edit the site</h3>
        <p class="muted small" style="margin-top:-6px">Every page is editable with forms — add, remove and reorder items without touching JSON.</p>
        <div class="cms-overview-grid">
          ${SECTIONS.map((s) => `<button type="button" class="cms-overview-card" data-edit="${s.key}"><i class="fa-solid ${s.icon}"></i><span>${App.h(s.label)}</span></button>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="row">
          <button class="btn btn-ghost sm" type="button" data-go="users"><i class="fa-solid fa-users-gear"></i> Manage roles</button>
          <button class="btn btn-ghost sm" type="button" data-go="messages"><i class="fa-solid fa-inbox"></i> Open inbox</button>
        </div>
      </div>`;
    App.qsa('[data-go]', view).forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.go)));
    App.qsa('[data-edit]', view).forEach((b) => b.addEventListener('click', async () => {
      switchTab('content', b.dataset.edit);
    }));
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

  const tabs = { overview, content: contentEditor, users: usersTab, messages: messagesTab, advanced: advancedEditor };

  function switchTab(id, sectionKey) {
    if (cms?.dirty && activeTab === 'content' && id !== 'content'
      && !window.confirm('You have unsaved changes. Discard them?')) return;

    activeTab = id;
    cms = null;
    App.qsa('.admin-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
    const app = document.getElementById('app');
    app.innerHTML = shell();
    App.qsa('.reveal', app).forEach((el, i) => {
      el.style.animationDelay = `${i * 40}ms`;
      requestAnimationFrame(() => el.classList.add('in'));
    });
    App.qsa('.admin-tab', app).forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    tabs[id](sectionKey).catch((err) => App.toast(err.message, 'err'));
  }

  window.addEventListener('beforeunload', (e) => {
    if (!cms?.dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  document.addEventListener('DOMContentLoaded', async () => {
    const signed = await App.requireAuth();
    if (!signed) return;
    if (!window.DB_READY) {
      App.mount(`
        <div class="panel empty-state">
          <i class="fa-solid fa-shield-halved"></i>
          <h3>Admin panel — setup required</h3>
          <p>First add the Supabase URL and publishable key to <b>js/config.js</b>, then run <b>supabase/schema.sql</b>.<br>Discord login is enabled in the same setup (see README).</p>
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
