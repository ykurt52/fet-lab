/* FET Lab embed loader — put FET Lab chapters inside any web page.

   <div data-fetlab data-page="simulator" data-lang="tr" data-theme="light" data-nav="1"></div>
   <script src="https://YOUR-SITE/fetlab/embed.js" defer></script>

   Each [data-fetlab] element becomes an iframe that grows to fit its content.
   data-page   chapter id (home, simulator, apps, bjt, mosfet, …)   default: home
   data-lang   tr | en                                              default: visitor's language
   data-theme  light | dark                                         default: follows the visitor's system
   data-nav    1 to show previous/next buttons inside the frame
   data-full   1 to show the full app (top bar + chapter menu) at a fixed height (data-height, default 900)

   Control an embed from your page:
     FETLab.navigate(el, 'mosfet'); FETLab.setLang(el, 'en'); FETLab.setTheme(el, 'dark');  */
(function () {
  'use strict';
  const me = document.currentScript;
  const base = me ? me.src.replace(/[^/]*$/, '') : './';

  function build(host) {
    if (host.__fetlab) return;
    const d = host.dataset, full = d.full === '1';
    const q = new URLSearchParams();
    if (!full) { q.set('embed', '1'); q.set('autoheight', '1'); }
    if (d.nav === '1') q.set('nav', '1');
    if (d.lang) q.set('lang', d.lang);
    if (d.theme) q.set('theme', d.theme);
    const f = document.createElement('iframe');
    f.src = base + 'index.html?' + q.toString() + '#' + (d.page || 'home');
    f.title = d.title || 'FET Lab';
    f.loading = 'lazy';
    if (!full) f.setAttribute('scrolling', 'no');
    f.style.cssText = 'display:block;width:100%;border:0;border-radius:8px;background:transparent;height:' + (full ? (d.height || 900) : 600) + 'px';
    f.setAttribute('allow', 'clipboard-write');
    host.innerHTML = '';
    host.appendChild(f);
    host.__fetlab = f;
  }

  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.source !== 'fetlab' || m.type !== 'height') return;
    document.querySelectorAll('[data-fetlab]').forEach(h => {
      const f = h.__fetlab;
      if (f && f.contentWindow === e.source && h.dataset.full !== '1') f.style.height = m.height + 'px';
    });
  });

  const send = (el, msg) => { const f = el && el.__fetlab; if (f) f.contentWindow.postMessage(Object.assign({ target: 'fetlab' }, msg), '*'); };
  window.FETLab = {
    mount: el => build(el),
    navigate: (el, page) => send(el, { type: 'navigate', page }),
    setLang: (el, lang) => send(el, { type: 'lang', lang }),
    setTheme: (el, theme) => send(el, { type: 'theme', theme })
  };

  const init = () => document.querySelectorAll('[data-fetlab]').forEach(build);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
