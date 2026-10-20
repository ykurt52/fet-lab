/* FET Lab — core: i18n, routing, theme, frame loop, small utilities.
   Classic script (no modules) so index.html also works when opened via file://  */
(function () {
  'use strict';

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  /* URL options (for embedding in another site):
       ?embed        hide top bar and menu, report height to the parent frame
       ?nav=1        in embed mode, keep the previous/next buttons
       ?lang=tr|en   language   ?theme=light|dark   theme
       ?page=<id>    start page (same as #<id>)                                   */
  const params = new URLSearchParams(location.search);
  const embedded = params.has('embed') && params.get('embed') !== '0';

  const App = {
    pages: [],
    embedded,
    params,
    lang: (params.get('lang') || store.get('fetlab.lang') || (navigator.language || 'tr').slice(0, 2)) === 'en' ? 'en' : 'tr',
    current: null,
    _frames: [],
    _cleanups: [],
    reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /* ---------- i18n ---------- */
  // L('Türkçe', 'English') -> string in current language
  App.L = function (tr, en) { return App.lang === 'en' ? (en ?? tr) : tr; };
  // t({tr, en}) -> string
  App.t = function (o) { return o == null ? '' : (typeof o === 'string' ? o : (App.lang === 'en' ? (o.en ?? o.tr) : o.tr)); };
  window.L = App.L;

  /* ---------- page registry ---------- */
  App.page = function (def) { App.pages.push(def); };

  /* ---------- number formatting (SI) ---------- */
  const SI = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  App.si = function (v, unit, digits) {
    unit = unit || ''; digits = digits == null ? 3 : digits;
    if (!isFinite(v)) return '∞ ' + unit;
    if (v === 0) return '0 ' + unit;
    const a = Math.abs(v);
    for (const [m, p] of SI) {
      if (a >= m * 0.9995) {
        const n = v / m;
        return trimNum(n, digits) + ' ' + p + unit;
      }
    }
    return trimNum(v / 1e-12, digits) + ' p' + unit;
  };
  function trimNum(n, digits) {
    let s = Number(n.toPrecision(digits)).toString();
    if (App.lang === 'tr') s = s.replace('.', ',');
    return s;
  }
  App.num = function (v, d) {
    d = d == null ? 2 : d;
    let s = Number(v).toFixed(d);
    if (App.lang === 'tr') s = s.replace('.', ',');
    return s;
  };
  App.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  App.lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- page building blocks (HTML strings) ---------- */
  // App.lab('lab-id', 'Title', {tag:'LAB', foot:'caption', stack:true})
  // → panel with .lab-fig (figure area) and .lab-ctl (controls) for mount() to fill
  App.lab = function (id, title, o) {
    o = o || {};
    return `<section class="lab" id="${id}">
      <div class="lab-head"><span class="tag">${o.tag || App.L('Deney', 'Lab')}</span><h3>${title}</h3></div>
      <div class="lab-body${o.stack ? ' stack' : ''}"><div class="lab-fig"></div><div class="lab-ctl"></div></div>
      ${o.foot ? `<div class="lab-foot">${o.foot}</div>` : ''}
    </section>`;
  };
  // App.figure('fig-id', 'Title', {foot}) → panel with only a .lab-fig (animation, no controls)
  App.figure = function (id, title, o) {
    o = o || {};
    return `<section class="lab" id="${id}">
      <div class="lab-head"><span class="tag">${o.tag || App.L('Animasyon', 'Animation')}</span><h3>${title}</h3></div>
      <div class="lab-body stack"><div class="lab-fig"></div></div>
      ${o.foot ? `<div class="lab-foot">${o.foot}</div>` : ''}
    </section>`;
  };

  // App.keys(['…', '…']) → "In short" box with the page's practical takeaways (strings already localised)
  App.keys = function (items, title) {
    return `<aside class="keys"><div class="keys-t">${App.icon ? App.icon('bolt') : ''}${title || App.L('Kısaca', 'In short')}</div>
      <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></aside>`;
  };
  // App.example({given:[['V', '24 V'], …], steps:[['what', 'formula', 'result', 'optional note'], …], result:'…', level:'ok'|'warn'|'bad'})
  App.example = function (o) {
    const given = o.given && o.given.length ? `<div class="ex-given">${o.given.map(([k, v]) => `<span class="kv"><b>${k}</b>${v}</span>`).join('')}</div>` : '';
    const steps = o.steps && o.steps.length ? `<ol class="calc">${o.steps.map(([w, f, r, n]) =>
      `<li><span class="c-what">${w}</span><span class="c-f">${f || ''}</span><span class="c-r">${r || ''}</span>${n ? `<span class="c-n">${n}</span>` : ''}</li>`).join('')}</ol>` : '';
    const lvl = o.level || 'ok';
    const ic = { ok: 'check', warn: 'warn', bad: 'x' }[lvl];
    const res = o.result ? `<div class="ex-result ${lvl === 'ok' ? '' : lvl}">${App.icon ? App.icon(ic) : ''}<div>${o.result}</div></div>` : '';
    return `<div class="ex">${given}${steps}${res}</div>`;
  };

  /* ---------- DOM helpers ---------- */
  App.$ = (sel, root) => (root || document).querySelector(sel);
  App.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  App.h = function (tag, attrs, html) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    if (html != null) el.innerHTML = html;
    return el;
  };

  /* ---------- frame loop (only runs callbacks of the active page) ---------- */
  let last = 0, running = false;
  function loop(ts) {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
    last = ts;
    if (document.hidden) { requestAnimationFrame(loop); return; }
    for (const f of App._frames) { try { f(dt, ts / 1000); } catch (e) { console.error(e); } }
    if (App._frames.length) requestAnimationFrame(loop); else { running = false; last = 0; }
  }
  App.onFrame = function (fn) {
    App._frames.push(fn);
    if (!running) { running = true; requestAnimationFrame(loop); }
    return () => { App._frames = App._frames.filter(f => f !== fn); };
  };

  /* ---------- theme ---------- */
  function applyTheme(t) {
    const r = document.documentElement;
    if (t === 'dark' || t === 'light') r.setAttribute('data-theme', t); else r.removeAttribute('data-theme');
  }
  App.isDark = function () {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  App.toggleTheme = function () {
    const next = App.isDark() ? 'light' : 'dark';
    applyTheme(next); store.set('fetlab.theme', next);
  };
  applyTheme(params.get('theme') || store.get('fetlab.theme'));

  /* ---------- language ---------- */
  App.setLang = function (l) {
    App.lang = l === 'en' ? 'en' : 'tr';
    store.set('fetlab.lang', App.lang);
    document.documentElement.lang = App.lang;
    renderChrome();
    route(true);
  };

  /* ---------- chrome (sidebar, header labels) ---------- */
  function renderChrome() {
    document.documentElement.lang = App.lang;
    document.title = App.L('FET Lab — Transistör ve MOSFET sürme', 'FET Lab — Driving transistors and MOSFETs');
    const nav = App.$('#nav');
    let html = '', group = null;
    App.pages.forEach(p => {
      const g = App.t(p.group);
      if (g !== group) {
        if (group !== null) html += '</ol>';
        html += `<div class="nav-group">${g}</div><ol class="nav-list">`;
        group = g;
      }
      const ic = App.icon ? App.icon(App.pageIcon[p.id] || p.icon || 'info', 'nav-ic') : '';
      html += `<li><a href="#${p.id}" data-id="${p.id}">${ic}<span class="nav-t">${App.t(p.title)}</span><span class="nav-num">${p.num}</span></a></li>`;
    });
    html += '</ol>';
    nav.innerHTML = html;
    App.$$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === App.lang)));
    App.$('#themeBtn').setAttribute('aria-label', App.L('Temayı değiştir', 'Toggle theme'));
    App.$('#menuBtn').setAttribute('aria-label', App.L('Menü', 'Menu'));
    App.$('#brandSub').textContent = App.L('Transistör & MOSFET sürme laboratuvarı', 'Transistor & MOSFET driving lab');
    markActive();
  }
  function markActive() {
    App.$$('#nav a').forEach(a => a.classList.toggle('active', App.current && a.dataset.id === App.current.id));
  }

  /* ---------- router ---------- */
  function teardown() {
    App._cleanups.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    App._cleanups = [];
    App._frames = [];
  }
  App.onCleanup = fn => App._cleanups.push(fn);

  function route(keepScroll) {
    const id = (location.hash || '').replace('#', '') || App.pages[0].id;
    const idx = Math.max(0, App.pages.findIndex(p => p.id === id));
    const page = App.pages[idx];
    teardown();
    App.current = page;
    const main = App.$('#main');
    const prev = App.pages[idx - 1], next = App.pages[idx + 1];
    main.innerHTML = `
      <article class="page" data-page="${page.id}">
        <header class="page-head">
          <div class="head-ic">${App.icon ? App.icon(App.pageIcon[page.id] || page.icon || 'info') : ''}</div>
          <div class="head-txt">
            <div class="eyebrow"><span class="chip">${App.t(page.group)}</span><span class="pnum">${App.L('Bölüm', 'Chapter')} ${page.num}</span></div>
            <h1>${App.t(page.title)}</h1>
            ${page.summary ? `<p class="lead">${App.t(page.summary)}</p>` : ''}
          </div>
        </header>
        <div class="page-body">${page.render(App.L)}</div>
        <nav class="pager" aria-label="${App.L('Sayfalar', 'Pages')}">
          ${prev ? `<a class="pager-btn prev" href="#${prev.id}"><small>← ${App.L('Önceki', 'Previous')}</small><span>${App.t(prev.title)}</span></a>` : '<span></span>'}
          ${next ? `<a class="pager-btn next" href="#${next.id}"><small>${App.L('Sonraki', 'Next')} →</small><span>${App.t(next.title)}</span></a>` : '<span></span>'}
        </nav>
      </article>`;
    const art = App.$('.page', main);
    if (page.mount) {
      try { const c = page.mount(art, App); if (typeof c === 'function') App.onCleanup(c); }
      catch (e) { console.error('mount failed', page.id, e); }
    }
    App.Viz && App.Viz.enhance && App.Viz.enhance(art);
    markActive();
    document.body.classList.remove('nav-open');
    if (!keepScroll) window.scrollTo(0, 0);
    document.title = App.t(page.title) + ' · FET Lab';
    if (App._report) setTimeout(App._report, 50);
  }

  /* ---------- embedding: height reporting + parent commands ---------- */
  function setupEmbed() {
    document.documentElement.classList.add('embed');
    if (params.get('nav') === '1') document.documentElement.classList.add('embed-nav');
    // the parent resizes the frame to our height, so the frame itself never scrolls
    if (params.get('autoheight') === '1') document.documentElement.classList.add('embed-auto');
    const post = msg => { try { window.parent.postMessage(Object.assign({ source: 'fetlab' }, msg), '*'); } catch (e) { /* no parent */ } };
    let lastH = 0;
    const report = () => {
      const h = Math.ceil(document.documentElement.scrollHeight);
      if (Math.abs(h - lastH) > 2) { lastH = h; post({ type: 'height', height: h, page: App.current && App.current.id }); }
    };
    if (window.ResizeObserver) new ResizeObserver(report).observe(document.body);
    window.addEventListener('load', report);
    App._report = report;
    window.addEventListener('message', e => {
      const d = e.data || {};
      if (d.target !== 'fetlab') return;
      if (d.type === 'navigate' && d.page) location.hash = '#' + d.page;
      if (d.type === 'lang') App.setLang(d.lang);
      if (d.type === 'theme') applyTheme(d.theme);
    });
  }

  App.start = function () {
    if (embedded) setupEmbed();
    if (params.get('page') && !location.hash) history.replaceState(null, '', '#' + params.get('page'));
    renderChrome();
    App.$('#themeBtn').addEventListener('click', App.toggleTheme);
    App.$$('[data-lang]').forEach(b => b.addEventListener('click', () => App.setLang(b.dataset.lang)));
    App.$('#menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    App.$('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
    window.addEventListener('hashchange', () => route(false));
    route(false);
  };

  window.App = App;
})();
