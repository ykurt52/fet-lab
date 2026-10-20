/* 17 — Test yourself. Engine for the question bank in pages/17-quiz-bank.js:
   eight question types (multiple choice, numeric, true/false, pick the part, spot the mistake,
   read the scope, select all, ordering), difficulty + topic filters, all / random-20 sets,
   all / wrong / unanswered views, per-topic summary with links to weak chapters,
   best score in localStorage. Progress survives a language switch. */
(function () {
  'use strict';

  const Q = (window.App && App.quizBank) || [];

  /* state lives outside mount so a language switch (full re-render) keeps progress */
  const ST = { seed: 0, answers: {}, sel: {}, ord: {}, view: 'all', lvl: 'all', topic: 'all', mode: 'all' };
  let PC = { seed: -1, map: {} };   // generated values per question for the current seed
  const BEST_KEY = 'fetlab.quiz.best.v2';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const nn = (v, sig) => { const s = String(Number(Number(v).toPrecision(sig || 4))); return App.lang === 'tr' ? s.replace('.', ',') : s; };
  const fmtVal = (v, unit, sig) => unit === '%' ? (App.lang === 'tr' ? '%' + nn(v, sig) : nn(v, sig) + ' %') : nn(v, sig) + (unit ? ' ' + unit : '');

  const LVL = { b: { tr: 'temel', en: 'basic' }, i: { tr: 'orta', en: 'intermediate' }, a: { tr: 'ileri', en: 'advanced' } };
  const TYPE = {
    mc: [{ tr: 'çoktan seçmeli', en: 'multiple choice' }, 'quiz'],
    num: [{ tr: 'sayısal', en: 'numeric' }, 'dial'],
    tf: [{ tr: 'doğru / yanlış', en: 'true / false' }, 'toggle'],
    part: [{ tr: 'parça seç', en: 'pick the part' }, 'chip'],
    spot: [{ tr: 'hatayı bul', en: 'spot the mistake' }, 'warn'],
    scope: [{ tr: 'osiloskop oku', en: 'read the scope' }, 'scope'],
    multi: [{ tr: 'hepsini seç', en: 'select all' }, 'layers'],
    order: [{ tr: 'sıralama', en: 'ordering' }, 'arrow']
  };
  const TOPICS = ['loads', 'bjt', 'mosfet', 'mcu-io', 'outputs', 'bjt-drive', 'mosfet-drive', 'topologies', 'inductive', 'switching',
    'gate-drivers', 'inrush', 'overcurrent', 'thermal', 'examples', 'mistakes', 'reference', 'simulator', 'apps'];
  const chap = id => { const p = App.pages.find(x => x.id === id); return p ? { num: p.num, title: App.t(p.title) } : { num: '', title: id }; };
  // numeric answer kind: a scope question without options is answered with a number
  const isNum = q => q.type === 'num' || (q.type === 'scope' && !q.opts);
  const isChoice = q => q.type === 'mc' || q.type === 'spot' || (q.type === 'scope' && q.opts);

  function params(q) {
    if (PC.seed !== ST.seed) PC = { seed: ST.seed, map: {} };
    let p = PC.map[q.id];
    if (!p) {
      const r = rng(ST.seed ^ hash(q.id));
      p = q.gen ? q.gen(r) : {};
      const n = q.opts ? q.opts.length : q.parts ? q.parts.length : 0;
      if (n) p._order = shuffle([...Array(n).keys()], r);
      PC.map[q.id] = p;
    }
    return p;
  }
  function orderOf(q) {
    if (!ST.ord[q.id]) {
      const r = rng(ST.seed ^ hash(q.id + '#o'));
      let o; do { o = shuffle([...Array(q.items.length).keys()], r); } while (o.every((v, i) => v === i));
      ST.ord[q.id] = o;
    }
    return ST.ord[q.id];
  }
  function currentSet() {
    const pool = Q.filter(q => (ST.lvl === 'all' || q.lvl === ST.lvl) && (ST.topic === 'all' || q.topic === ST.topic));
    if (ST.mode !== 'r20' || pool.length <= 20) return { set: pool, pool: pool.length };
    const r = rng(ST.seed ^ hash('r20|' + ST.lvl + '|' + ST.topic));
    const keep = new Set(shuffle(pool.map(q => q.id), r).slice(0, 20));
    return { set: pool.filter(q => keep.has(q.id)), pool: pool.length };
  }

  App.page({
    id: 'quiz',
    num: '17',
    group: { tr: 'Uygulama', en: 'Practice' },
    title: { tr: 'Kendini sına', en: 'Test yourself' },
    blurb: { tr: `${Q.length} soru, 8 tip: hesap, parça seçimi, şemada hata, osiloskop okuma.`, en: `${Q.length} questions, 8 types: maths, part picking, schematic bugs, scope reading.` },
    summary: {
      tr: `Bütün bölümlerden ${Q.length} soru. Hepsini çözen FET sürmeyi öğrenmiş demektir.`,
      en: `${Q.length} questions from every chapter. Solve them all and you have mastered driving FETs.`
    },
    render(L) {
      return `
        ${App.keys([
          L('Zorluk ve konu seç; “Rastgele 20” kısa bir tur çıkarır.', 'Pick a difficulty and topic; “Random 20” makes a short round.'),
          L('Sayısal yanıtlarda tolerans var; virgül ya da nokta, k/m/µ ön ekleri olur.', 'Numeric answers have a tolerance; a comma or point and k/m/µ prefixes work.'),
          L('Her yanıttan sonra kısa açıklama ve bölüm bağlantısı çıkar.', 'Each answer shows a short explanation and a chapter link.'),
          L('Sonda konu bazında skor ve tekrar edilecek bölümler görünür.', 'At the end you get a per-topic score and chapters to review.')
        ], L('Nasıl çalışır?', 'How it works'))}
        <style>
          [data-page="quiz"] .qpanel { display: grid; gap: 12px; padding: 14px 16px; margin: 0 0 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
          [data-page="quiz"] .qprow { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: end; }
          [data-page="quiz"] .qprow > * { min-width: 0; }
          [data-page="quiz"] .qsel { display: grid; gap: 4px; font: 500 .8rem var(--f-body); color: var(--muted); flex: 1 1 220px; max-width: 360px; }
          [data-page="quiz"] .qsel select { font: 500 .92rem var(--f-body); color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; width: 100%; max-width: 100%; }
          [data-page="quiz"] .qcount { display: flex; align-items: center; gap: 8px; font: 500 .86rem var(--f-mono); color: var(--ink-2); }
          [data-page="quiz"] .qcount .ic { color: var(--accent); width: 18px; height: 18px; }
          [data-page="quiz"] .qtop { position: sticky; top: calc(var(--top) + 6px); z-index: 5; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow); padding: 10px 14px; display: grid; gap: 8px; margin: 0 0 18px; }
          [data-page="quiz"] .qbar { height: 12px; border-radius: 99px; background: var(--panel-2); overflow: hidden; display: flex; }
          [data-page="quiz"] .qbar span { display: block; height: 100%; transition: width .45s ease; }
          [data-page="quiz"] .qbar .ok, [data-page="quiz"] .tbar .ok { background: var(--ok); }
          [data-page="quiz"] .qbar .bad, [data-page="quiz"] .tbar .bad { background: var(--bad); }
          [data-page="quiz"] .qrow { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; justify-content: space-between; }
          [data-page="quiz"] .qstat { font: 500 .85rem var(--f-mono); color: var(--ink-2); }
          [data-page="quiz"] .qacts { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
          [data-page="quiz"] .qacts .ctl, [data-page="quiz"] .qprow .ctl { gap: 0; }
          [data-page="quiz"] .qlist { display: grid; gap: 18px; }
          [data-page="quiz"] .qcard { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 14px 18px 16px; transition: border-color .25s, box-shadow .25s; min-width: 0; }
          [data-page="quiz"] .qcard[data-state="ok"] { border-color: color-mix(in srgb, var(--ok) 55%, var(--line)); box-shadow: inset 4px 0 0 var(--ok); }
          [data-page="quiz"] .qcard[data-state="bad"] { border-color: color-mix(in srgb, var(--bad) 55%, var(--line)); box-shadow: inset 4px 0 0 var(--bad); }
          [data-page="quiz"] .qhead { display: flex; gap: 6px 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
          [data-page="quiz"] .qn { font: 700 .82rem var(--f-mono); color: var(--accent); margin-right: 2px; }
          [data-page="quiz"] .qhead a { text-decoration: none; }
          [data-page="quiz"] .qhead .pill { display: inline-flex; align-items: center; gap: 5px; }
          [data-page="quiz"] .pill.lv-b { background: var(--signal-soft); color: var(--signal); }
          [data-page="quiz"] .pill.lv-i { background: var(--accent-soft); color: var(--accent); }
          [data-page="quiz"] .pill.lv-a { background: var(--copper-soft); color: var(--copper); }
          [data-page="quiz"] .qtext { font-size: 1rem; color: var(--ink); max-width: 75ch; }
          [data-page="quiz"] .qfig { max-width: 600px; margin: 10px 0 4px; }
          [data-page="quiz"] .qopts { display: grid; gap: 8px; margin-top: 12px; }
          [data-page="quiz"] .qopts.tf { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 420px; }
          [data-page="quiz"] .qopt { text-align: left; border: 1px solid var(--line); background: var(--surface); color: var(--ink); padding: 9px 12px; border-radius: 10px; font: 400 .94rem var(--f-body); cursor: pointer; display: flex; gap: 10px; align-items: baseline; transition: background .2s, border-color .2s; min-width: 0; }
          [data-page="quiz"] .qopt > span { min-width: 0; overflow-wrap: anywhere; }
          [data-page="quiz"] .qopt:hover:not(:disabled) { border-color: var(--accent); }
          [data-page="quiz"] .qopt:disabled { cursor: default; }
          [data-page="quiz"] .qopt > b { font-family: var(--f-mono); color: var(--muted); flex: none; }
          [data-page="quiz"] .qopt.on { border-color: var(--accent); background: var(--accent-soft); }
          [data-page="quiz"] .qopt.right { background: var(--ok-soft); border-color: var(--ok); }
          [data-page="quiz"] .qopt.wrong { background: var(--bad-soft); border-color: var(--bad); }
          [data-page="quiz"] .qopt.missed { border: 1.5px dashed var(--ok); }
          [data-page="quiz"] .qopt .why { display: block; font-size: .84rem; color: var(--ink-2); margin-top: 3px; }
          [data-page="quiz"] .qopt .why .ic { width: 14px; height: 14px; margin-right: 4px; }
          [data-page="quiz"] .qopt.right .why .ic { color: var(--ok); } [data-page="quiz"] .qopt.wrong .why .ic, [data-page="quiz"] .qopt .why.no .ic { color: var(--bad); }
          [data-page="quiz"] .qopt .why.yes .ic { color: var(--ok); }
          [data-page="quiz"] .qbox { width: 1.05em; height: 1.05em; border: 1.6px solid var(--muted); border-radius: 4px; flex: none; align-self: center; display: grid; place-items: center; }
          [data-page="quiz"] .qopt.on .qbox { background: var(--accent); border-color: var(--accent); }
          [data-page="quiz"] .qpart { display: grid; gap: 4px; }
          [data-page="quiz"] .qpart strong { font: 700 .98rem var(--f-mono); color: var(--ink); }
          [data-page="quiz"] .qspec { display: flex; flex-wrap: wrap; gap: 4px; }
          [data-page="quiz"] .qspec span { font: 500 .76rem var(--f-mono); padding: 1px 7px; border-radius: 99px; background: var(--panel); color: var(--ink-2); }
          [data-page="quiz"] .qnum { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
          [data-page="quiz"] .qnum input { width: 160px; max-width: 100%; font: 500 1rem var(--f-mono); padding: 7px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); }
          [data-page="quiz"] .qnum .u { font: 500 .95rem var(--f-mono); color: var(--muted); }
          [data-page="quiz"] .qord { list-style: none; margin: 12px 0 0; padding: 0 !important; display: grid; gap: 6px; }
          [data-page="quiz"] .qord li { display: flex; gap: 10px; align-items: center; margin: 0 !important; max-width: none !important; padding: 7px 8px 7px 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
          [data-page="quiz"] .qord li.right { background: var(--ok-soft); border-color: var(--ok); }
          [data-page="quiz"] .qord li.wrong { background: var(--bad-soft); border-color: var(--bad); }
          [data-page="quiz"] .qord .k { font: 700 .82rem var(--f-mono); color: var(--accent); flex: none; width: 1.2em; }
          [data-page="quiz"] .qord .t { flex: 1 1 auto; min-width: 0; font-size: .93rem; overflow-wrap: anywhere; }
          [data-page="quiz"] .qord .mv { display: flex; gap: 4px; flex: none; }
          [data-page="quiz"] .qord .mv button { width: 32px; height: 30px; border: 1px solid var(--line); border-radius: 7px; background: var(--panel); color: var(--ink); cursor: pointer; display: grid; place-items: center; padding: 0; }
          [data-page="quiz"] .qord .mv button:hover:not(:disabled) { border-color: var(--accent); }
          [data-page="quiz"] .qord .mv button:disabled { opacity: .35; cursor: default; }
          [data-page="quiz"] .qord .mv .ic { width: 16px; height: 16px; }
          [data-page="quiz"] .qord .mv .up .ic { transform: rotate(-90deg); } [data-page="quiz"] .qord .mv .dn .ic { transform: rotate(90deg); }
          [data-page="quiz"] .qgo { margin-top: 10px; }
          [data-page="quiz"] .qfb { margin-top: 12px; padding: 10px 14px; border-radius: 10px; font-size: .92rem; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 10px; animation: fetlabQuizIn .35s ease; }
          [data-page="quiz"] .qfb > .ic { width: 22px; height: 22px; margin-top: 1px; }
          [data-page="quiz"] .qfb.ok { background: var(--ok-soft); } [data-page="quiz"] .qfb.ok > .ic { color: var(--ok); }
          [data-page="quiz"] .qfb.bad { background: var(--bad-soft); } [data-page="quiz"] .qfb.bad > .ic { color: var(--bad); }
          [data-page="quiz"] .qfb strong { display: block; }
          [data-page="quiz"] .qfb.ok strong { color: var(--ok); } [data-page="quiz"] .qfb.bad strong { color: var(--bad); }
          [data-page="quiz"] .qfb p { margin: 2px 0 0; max-width: 70ch; }
          [data-page="quiz"] .qfb ol { margin: 4px 0 0; padding-left: 1.3em; }
          [data-page="quiz"] .qfb ol li { margin: 0 !important; }
          [data-page="quiz"] .qfb .qlink { display: inline-flex; gap: 6px; align-items: center; margin-top: 6px; font-weight: 600; }
          [data-page="quiz"] .qfb .qlink .ic { width: 16px; height: 16px; }
          [data-page="quiz"] .qempty { padding: 20px; text-align: center; color: var(--muted); border: 1px dashed var(--line); border-radius: 12px; }
          [data-page="quiz"] .qsum { margin-top: 32px; padding: 18px 20px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); display: grid; gap: 16px; }
          [data-page="quiz"] .qsum h2 { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.3rem; }
          [data-page="quiz"] .qsum h2 .ic { color: var(--accent); }
          [data-page="quiz"] .qscore { display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: baseline; }
          [data-page="quiz"] .qscore .big { font: 700 2rem var(--f-display); color: var(--ink); }
          [data-page="quiz"] .qscore .sub { color: var(--muted); font-size: .92rem; }
          [data-page="quiz"] .ttab { display: grid; gap: 8px; }
          [data-page="quiz"] .trow { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(80px, 1fr) auto; gap: 10px; align-items: center; font-size: .9rem; }
          [data-page="quiz"] .trow a { display: flex; gap: 8px; align-items: center; text-decoration: none; color: var(--ink); min-width: 0; }
          [data-page="quiz"] .trow a span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          [data-page="quiz"] .trow a .ic { color: var(--muted); width: 18px; height: 18px; }
          [data-page="quiz"] .trow .num { font: 500 .82rem var(--f-mono); color: var(--ink-2); white-space: nowrap; }
          [data-page="quiz"] .tbar { height: 10px; border-radius: 99px; background: var(--panel-2); overflow: hidden; display: flex; }
          [data-page="quiz"] .tbar span { display: block; height: 100%; }
          [data-page="quiz"] .qweak h3 { margin: 0 0 8px; font-size: 1rem; }
          [data-page="quiz"] .qweak .cards { margin: 0; }
          [data-page="quiz"] .qweak .card-ic .tile { background: var(--bad-soft); color: var(--bad); }
          @media (max-width: 640px) {
            [data-page="quiz"] .qtop { position: static; }
            [data-page="quiz"] .qcard { padding: 12px 12px 14px; }
            [data-page="quiz"] .trow { grid-template-columns: minmax(0, 1fr) auto; }
            [data-page="quiz"] .trow .tbar { grid-column: 1 / -1; grid-row: 2; }
            [data-page="quiz"] .qsel { max-width: none; }
          }
          @keyframes fetlabQuizIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        </style>
        <div class="qpanel" id="qPanel">
          <div class="qprow" id="qF1"></div>
          <div class="qprow" id="qF2"></div>
        </div>
        <div class="qtop" id="qTop">
          <div class="qbar" aria-hidden="true"><span class="ok" id="qOk"></span><span class="bad" id="qBad"></span></div>
          <div class="qrow"><span class="qstat" id="qStat" aria-live="polite"></span><div class="qacts" id="qActs"></div></div>
        </div>
        <div class="qlist" id="qList"></div>
        <section class="qsum" id="qSum"></section>`;
    },
    mount(root, App) {
      const { Viz } = App, { UI } = Viz, L = App.L, I = App.icon;
      if (!ST.seed) ST.seed = (Date.now() % 1e9) | 1;
      const tx = (x, p) => typeof x === 'function' ? x(p, L) : Array.isArray(x) ? L(x[0], x[1]) : App.t(x);
      const fixDec = s => App.lang === 'en' ? String(s).replace(/(\d),(\d)/g, '$1.$2') : s;
      const H = { Viz, S: Viz.Sch, L, fixDec };
      const list = root.querySelector('#qList'), sum = root.querySelector('#qSum');
      let SET = [], POOL = 0;

      /* number parser: comma or point, optional SI prefix; a bare number is read in the question’s unit */
      const PRE = { k: 1e3, K: 1e3, M: 1e6, m: 1e-3, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, n: 1e-9, p: 1e-12 };
      function parseNum(s, unit) {
        s = String(s).trim().replace(/\s+/g, '').replace(',', '.').replace('−', '-');
        const m = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(.*)$/i);
        if (!m) return NaN;
        let v = parseFloat(m[1]);
        const rest = m[2].replace(/^[%°]/, '');
        if (!rest) return v;
        const up = unit && unit.length > 1 && PRE[unit[0]] ? PRE[unit[0]] : 1;   // e.g. mA → 1e-3
        const base = up !== 1 ? unit.slice(1) : (unit || '');
        const c = rest[0], after = rest.slice(1);
        if (PRE[c] && (!after || (base && after.startsWith(base)))) return v * PRE[c] / up;   // "4,7k", "20 mA"
        if (base && up !== 1 && rest.startsWith(base)) return v / up;                      // "0,02 A" for mA
        return v;
      }

      /* ---------- filter panel ---------- */
      const f1 = root.querySelector('#qF1'), f2 = root.querySelector('#qF2');
      UI.segmented(f1, {
        label: L('Zorluk', 'Difficulty'),
        options: [{ value: 'all', label: L('Hepsi', 'All') }, { value: 'b', label: App.t(LVL.b) }, { value: 'i', label: App.t(LVL.i) }, { value: 'a', label: App.t(LVL.a) }],
        value: ST.lvl, onChange: v => { ST.lvl = v; refreshTopics(); build(); }
      });
      const selWrap = App.h('label', { class: 'qsel' }, `<span>${L('Konu', 'Topic')}</span>`);
      const sel = App.h('select', { 'aria-label': L('Konu', 'Topic') });
      selWrap.appendChild(sel); f1.appendChild(selWrap);
      sel.addEventListener('change', () => { ST.topic = sel.value; build(); });
      function refreshTopics() {
        const inLvl = Q.filter(q => ST.lvl === 'all' || q.lvl === ST.lvl);
        sel.innerHTML = `<option value="all">${L('Bütün konular', 'All topics')} (${inLvl.length})</option>` +
          TOPICS.map(t => { const c = chap(t), n = inLvl.filter(q => q.topic === t).length; return `<option value="${t}"${n ? '' : ' disabled'}>${c.num} · ${c.title} (${n})</option>`; }).join('');
        if (ST.topic !== 'all' && !inLvl.some(q => q.topic === ST.topic)) ST.topic = 'all';
        sel.value = ST.topic;
      }
      refreshTopics();
      UI.segmented(f2, {
        label: L('Set', 'Set'),
        options: [{ value: 'all', label: L('Hepsi', 'All') }, { value: 'r20', label: L('Rastgele 20', 'Random 20') }],
        value: ST.mode, onChange: v => { ST.mode = v; build(); }
      });
      const count = App.h('div', { class: 'qcount' });
      f2.appendChild(count);

      /* ---------- sticky bar: score + view + actions ---------- */
      const okBar = root.querySelector('#qOk'), badBar = root.querySelector('#qBad'), stat = root.querySelector('#qStat');
      const acts = root.querySelector('#qActs');
      UI.segmented(acts, {
        options: [{ value: 'all', label: L('Hepsi', 'All') }, { value: 'wrong', label: L('Yanlışlar', 'Wrong') }, { value: 'open', label: L('Yanıtsız', 'Unanswered') }],
        value: ST.view, onChange: v => { ST.view = v; applyView(); }
      });
      UI.button(acts, { label: L('Yanlışları tekrar dene', 'Retry wrong ones'), onClick: () => {
        SET.forEach(q => { const a = ST.answers[q.id]; if (a && !a.ok) { delete ST.answers[q.id]; delete ST.sel[q.id]; } }); build();
      } });
      UI.button(acts, { label: L('Baştan (yeni sayılar)', 'Restart (new numbers)'), kind: 'primary', onClick: () => {
        ST.seed = (ST.seed * 16807 + 12345) % 2147483647 || 7; ST.answers = {}; ST.sel = {}; ST.ord = {}; build();
        window.scrollTo({ top: root.querySelector('#qPanel').getBoundingClientRect().top + window.scrollY - 70, behavior: App.reducedMotion ? 'auto' : 'smooth' });
      } });

      function readBest() { try { return JSON.parse(store.get(BEST_KEY) || 'null'); } catch (e) { return null; } }
      function tally() {
        const ans = SET.map(q => ST.answers[q.id]).filter(Boolean);
        const ok = ans.filter(a => a.ok).length;
        return { tot: SET.length, done: ans.length, ok, bad: ans.length - ok };
      }
      function score() {
        const { tot, done, ok, bad } = tally();
        okBar.style.width = (tot ? ok / tot * 100 : 0) + '%';
        badBar.style.width = (tot ? bad / tot * 100 : 0) + '%';
        const pct = done ? Math.round(ok / done * 100) : 0;
        let best = readBest();
        if (tot && done === tot) {
          const p = Math.round(ok / tot * 100);
          if (!best || p > best.pct || (p === best.pct && tot > best.n)) { best = { pct: p, n: tot }; store.set(BEST_KEY, JSON.stringify(best)); }
        }
        stat.innerHTML = L(`${done}/${tot} yanıtlandı · <span style="color:var(--ok)">${ok} doğru</span> · <span style="color:var(--bad)">${bad} yanlış</span> · %${pct}`,
                           `${done}/${tot} answered · <span style="color:var(--ok)">${ok} right</span> · <span style="color:var(--bad)">${bad} wrong</span> · ${pct} %`)
          + (best ? ' · ' + L(`en iyi %${best.pct} (${best.n} soru)`, `best ${best.pct} % (${best.n} q)`) : '');
        count.innerHTML = `${I('quiz')}<span>${L(`Bu sette ${tot} soru`, `${tot} questions in this set`)}${POOL !== tot ? L(` · filtrede ${POOL}`, ` · ${POOL} match the filter`) : ''}</span>`;
        summary();
      }

      function applyView() {
        let shown = 0;
        list.querySelectorAll('.qcard').forEach(c => {
          const a = ST.answers[c.dataset.id];
          const vis = ST.view === 'all' || (ST.view === 'wrong' && a && !a.ok) || (ST.view === 'open' && !a);
          c.hidden = !vis; if (vis) shown++;
        });
        let em = list.querySelector('.qempty');
        if (!shown) {
          if (!em) { em = App.h('div', { class: 'qempty' }); list.appendChild(em); }
          em.textContent = !SET.length ? L('Bu filtrede soru yok.', 'No questions match this filter.') : ST.view === 'wrong' ? L('Yanlış yanıt yok.', 'No wrong answers.') : L('Yanıtsız soru kalmadı.', 'No unanswered questions left.');
        } else if (em) em.remove();
      }

      /* ---------- end summary: score, per-topic bars, weakest chapters ---------- */
      function summary() {
        const { tot, done, ok } = tally();
        const by = {};
        SET.forEach(q => { const b = by[q.topic] || (by[q.topic] = { tot: 0, done: 0, ok: 0 }); b.tot++; const a = ST.answers[q.id]; if (a) { b.done++; if (a.ok) b.ok++; } });
        const topics = TOPICS.filter(t => by[t]);
        const pct = tot ? Math.round(ok / tot * 100) : 0;
        const verdict = done < tot ? L(`${tot - done} soru kaldı.`, `${tot - done} questions to go.`)
          : ok === tot ? L('Kusursuz: FET sürmeyi gerçekten biliyorsun.', 'Perfect: you really know how to drive FETs.')
          : pct >= 80 ? L('Çok iyi. Aşağıdaki bölümlere bir göz at.', 'Very good. Have a look at the chapters below.')
          : L('Yanlışları tekrar dene ve aşağıdaki bölümleri oku.', 'Retry the wrong ones and read the chapters below.');
        const rows = topics.map(t => {
          const b = by[t], c = chap(t);
          return `<div class="trow"><a href="#${t}">${I(App.pageIcon[t] || 'info')}<span>${c.num} · ${c.title}</span></a>
            <div class="tbar" aria-hidden="true"><span class="ok" style="width:${b.ok / b.tot * 100}%"></span><span class="bad" style="width:${(b.done - b.ok) / b.tot * 100}%"></span></div>
            <span class="num">${b.ok}/${b.tot}</span></div>`;
        }).join('');
        const weak = topics.filter(t => by[t].done && by[t].ok < by[t].done)
          .sort((a, b) => by[a].ok / by[a].done - by[b].ok / by[b].done || by[b].done - by[a].done).slice(0, 3);
        const weakHtml = weak.length ? `<div class="qweak"><h3>${L('Tekrar edilecek bölümler', 'Chapters to review')}</h3><div class="cards">${weak.map(t => {
          const c = chap(t), b = by[t];
          return `<a class="card card-ic" href="#${t}"><span class="tile">${I(App.pageIcon[t] || 'info')}</span><div><h4>${c.num} · ${c.title}</h4><p>${L(`${b.done} yanıttan ${b.ok} doğru`, `${b.ok} of ${b.done} answers right`)}</p></div></a>`;
        }).join('')}</div></div>` : '';
        sum.innerHTML = `<h2>${I('gauge')}${L('Özet', 'Summary')}</h2>
          <div class="qscore"><span class="big">${ok} / ${tot}</span><span class="sub">${L(`%${pct} · ${done} yanıtlandı`, `${pct} % · ${done} answered`)}</span><span class="sub"><b>${verdict}</b></span></div>
          ${done ? `<div class="ttab">${rows}</div>${weakHtml}` : `<p class="sub" style="margin:0;color:var(--muted)">${L('Soruları yanıtladıkça konu bazında sonuçlar burada görünür.', 'Per-topic results appear here as you answer.')}</p>`}`;
      }

      /* ---------- feedback ---------- */
      function feedback(card, q, p, a) {
        let fb = card.querySelector('.qfb');
        if (fb) fb.remove();
        fb = App.h('div', { class: 'qfb ' + (a.ok ? 'ok' : 'bad') });
        let head = a.ok ? L('Doğru!', 'Correct!') : L('Yanlış.', 'Not quite.');
        if (isNum(q)) {
          const v = q.ans(p);
          head += ' ' + L('Beklenen: ', 'Expected: ') + fmtVal(v, q.unit, 3) + (q.tol ? ' (±' + Math.round(q.tol * 100) + ' %)' : '')
            + (a.ok ? '' : ' · ' + L('senin yanıtın: ', 'your answer: ') + fmtVal(a.v, q.unit, 4));
        } else if (q.type === 'tf') {
          head += ' ' + L('Doğru yanıt: ', 'Answer: ') + (q.ans ? L('Doğru', 'True') : L('Yanlış', 'False')) + '.';
        }
        let extra = '';
        if (q.type === 'order' && !a.ok) extra = `<ol>${q.items.map(it => `<li>${fixDec(L(it[0], it[1]))}</li>`).join('')}</ol>`;
        const c = chap(q.topic);
        fb.innerHTML = `${I(a.ok ? 'check' : 'x')}<div><strong>${head}</strong><p>${fixDec(tx(q.ex, p))}</p>${extra}
          <a class="qlink" href="#${q.topic}">${I('book')}${L('Bölüm', 'Chapter')} ${c.num} · ${c.title}</a></div>`;
        card.appendChild(fb);
        card.dataset.state = a.ok ? 'ok' : 'bad';
      }
      function answer(card, q, p, ans) {
        ST.answers[q.id] = ans;
        feedback(card, q, p, ans); score();
        if (ST.view !== 'all') applyView();
      }

      /* ---------- answer widgets ---------- */
      function choiceWidget(card, q, p, a) {
        const box = App.h('div', { class: 'qopts' });
        const opts = q.opts;
        p._order.forEach((oi, k) => {
          const o = opts[oi];
          const b = App.h('button', { type: 'button', class: 'qopt' }, `<b>${'ABCDEF'[k]}</b><span>${fixDec(L(o[0], o[1]))}</span>`);
          b.addEventListener('click', () => {
            if (ST.answers[q.id]) return;
            mark(oi); answer(card, q, p, { v: oi, ok: !!o[2] });
          });
          box.appendChild(b);
        });
        function mark(v) {
          box.querySelectorAll('.qopt').forEach((bb, kk) => { const oi = p._order[kk]; bb.disabled = true; if (opts[oi][2]) bb.classList.add('right'); else if (oi === v) bb.classList.add('wrong'); });
        }
        if (a) mark(a.v);
        card.appendChild(box);
      }
      function tfWidget(card, q, p, a) {
        const box = App.h('div', { class: 'qopts tf' });
        [[true, L('Doğru', 'True'), 'check'], [false, L('Yanlış', 'False'), 'x']].forEach(([val, lab, ic]) => {
          const b = App.h('button', { type: 'button', class: 'qopt', 'data-v': String(val) }, `<b>${I(ic)}</b><span>${lab}</span>`);
          b.addEventListener('click', () => { if (ST.answers[q.id]) return; mark(val); answer(card, q, p, { v: val, ok: val === q.ans }); });
          box.appendChild(b);
        });
        function mark(v) { box.querySelectorAll('.qopt').forEach(bb => { const bv = bb.dataset.v === 'true'; bb.disabled = true; if (bv === q.ans) bb.classList.add('right'); else if (bv === v) bb.classList.add('wrong'); }); }
        if (a) mark(a.v);
        card.appendChild(box);
      }
      function partWidget(card, q, p, a) {
        const P = App.Parts, ms = q.parts.map(P.get);
        const res = ms.map(m => q.judge(m, P, ms));
        const box = App.h('div', { class: 'qopts' });
        p._order.forEach((oi, k) => {
          const m = ms[oi];
          const spec = q.spec ? q.spec(m, P) : [m.pkg];
          const b = App.h('button', { type: 'button', class: 'qopt' }, `<b>${'ABCDEF'[k]}</b><span class="qpart"><strong>${m.id}</strong><span class="qspec">${spec.map(s => `<span>${fixDec(s)}</span>`).join('')}</span></span>`);
          b.addEventListener('click', () => { if (ST.answers[q.id]) return; mark(oi); answer(card, q, p, { v: oi, ok: res[oi].ok }); });
          box.appendChild(b);
        });
        function mark(v) {
          box.querySelectorAll('.qopt').forEach((bb, kk) => {
            const oi = p._order[kk], r = res[oi];
            bb.disabled = true;
            if (r.ok) bb.classList.add('right'); else if (oi === v) bb.classList.add('wrong');
            bb.querySelector('.qpart').insertAdjacentHTML('beforeend', `<span class="why ${r.ok ? 'yes' : 'no'}">${I(r.ok ? 'check' : 'x')}${fixDec(App.t(r))}</span>`);
          });
        }
        if (a) mark(a.v);
        card.appendChild(box);
      }
      function multiWidget(card, q, p, a) {
        const box = App.h('div', { class: 'qopts' });
        const chosen = new Set(a ? a.v : (ST.sel[q.id] || []));
        const btns = [];
        p._order.forEach(oi => {
          const o = q.opts[oi];
          const b = App.h('button', { type: 'button', class: 'qopt', 'aria-pressed': 'false' }, `<span class="qbox" aria-hidden="true"></span><span class="qmt">${fixDec(L(o[0], o[1]))}</span>`);
          b.addEventListener('click', () => {
            if (ST.answers[q.id]) return;
            if (chosen.has(oi)) chosen.delete(oi); else chosen.add(oi);
            ST.sel[q.id] = [...chosen]; sync();
          });
          btns.push([b, oi]); box.appendChild(b);
        });
        card.appendChild(box);
        const go = App.h('div', { class: 'qgo' });
        const btn = UI.button(go, { label: L('Kontrol et', 'Check'), kind: 'primary', onClick: () => {
          if (ST.answers[q.id] || !chosen.size) return;
          const ok = q.opts.every((o, i) => !!o[2] === chosen.has(i));
          mark(); answer(card, q, p, { v: [...chosen], ok });
        } });
        card.appendChild(go);
        function sync() { btns.forEach(([b, oi]) => { b.classList.toggle('on', chosen.has(oi)); b.setAttribute('aria-pressed', String(chosen.has(oi))); }); btn.disabled = !chosen.size || !!ST.answers[q.id]; }
        function mark() {
          btns.forEach(([b, oi]) => {
            const o = q.opts[oi], c = !!o[2], s = chosen.has(oi);
            b.disabled = true;
            b.classList.toggle('on', false);
            if (s && c) b.classList.add('right'); else if (s && !c) b.classList.add('wrong'); else if (!s && c) b.classList.add('missed');
            const tag = s && c ? L('Doğru seçim', 'Right pick') : s ? L('Seçilmemeliydi', 'Should not be picked') : c ? L('Kaçırıldı', 'Missed') : L('Doğru bırakıldı', 'Rightly left out');
            const good = s === c;
            b.querySelector('.qmt').insertAdjacentHTML('beforeend', `<span class="why ${good ? 'yes' : 'no'}">${I(good ? 'check' : 'x')}<b>${tag}.</b> ${o[3] ? fixDec(L(o[3], o[4])) : ''}</span>`);
          });
          btn.disabled = true;
        }
        sync();
        if (a) mark();
      }
      function orderWidget(card, q, p, a) {
        const ol = App.h('ol', { class: 'qord' });
        card.appendChild(ol);
        const go = App.h('div', { class: 'qgo' });
        const btn = UI.button(go, { label: L('Kontrol et', 'Check'), kind: 'primary', onClick: () => {
          if (ST.answers[q.id]) return;
          const o = orderOf(q), ok = o.every((v, i) => v === i);
          answer(card, q, p, { v: o.slice(), ok }); draw();
        } });
        card.appendChild(go);
        function draw() {
          const o = a ? a.v : (ST.answers[q.id] ? ST.answers[q.id].v : orderOf(q));
          const done = !!ST.answers[q.id];
          ol.innerHTML = '';
          o.forEach((it, pos) => {
            const li = App.h('li', { class: done ? (it === pos ? 'right' : 'wrong') : '' },
              `<span class="k">${pos + 1}</span><span class="t">${fixDec(L(q.items[it][0], q.items[it][1]))}</span>` +
              (done ? '' : `<span class="mv"><button type="button" class="up" aria-label="${L('Yukarı', 'Move up')}"${pos ? '' : ' disabled'}>${I('arrow')}</button><button type="button" class="dn" aria-label="${L('Aşağı', 'Move down')}"${pos < o.length - 1 ? '' : ' disabled'}>${I('arrow')}</button></span>`));
            if (!done) {
              const mv = d => { const arr = orderOf(q); const j = pos + d; [arr[pos], arr[j]] = [arr[j], arr[pos]]; draw(); const nb = ol.children[j] && ol.children[j].querySelector(d < 0 ? '.up' : '.dn'); if (nb && !nb.disabled) nb.focus(); };
              li.querySelector('.up').addEventListener('click', () => mv(-1));
              li.querySelector('.dn').addEventListener('click', () => mv(1));
            }
            ol.appendChild(li);
          });
          btn.disabled = done;
          a = null;
        }
        draw();
      }
      function numWidget(card, q, p, a) {
        const box = App.h('div', { class: 'qnum' });
        const inp = App.h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': L('Yanıt', 'Answer') });
        box.appendChild(inp);
        if (q.unit) box.appendChild(App.h('span', { class: 'u' }, q.unit));
        const go = () => {
          if (ST.answers[q.id]) return;
          const v = parseNum(inp.value, q.unit);
          if (!isFinite(v)) { inp.style.borderColor = 'var(--warn)'; inp.focus(); return; }
          const exp = q.ans(p);
          const ok = q.tol ? Math.abs(v - exp) <= Math.abs(exp) * q.tol + 1e-12 : Math.round(v) === exp;
          inp.disabled = true; btn.disabled = true;
          answer(card, q, p, { v, ok });
        };
        const btn = UI.button(box, { label: L('Kontrol et', 'Check'), kind: 'primary', onClick: go });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        if (a) { inp.value = nn(a.v, 4); inp.disabled = true; btn.disabled = true; }
        card.appendChild(box);
      }

      /* ---------- build the list for the current set ---------- */
      function build() {
        const cs = currentSet(); SET = cs.set; POOL = cs.pool;
        list.innerHTML = '';
        SET.forEach((q, qi) => {
          const p = params(q), a = ST.answers[q.id], c = chap(q.topic), ty = TYPE[q.type];
          const card = App.h('article', { class: 'qcard', 'data-id': q.id, 'data-state': a ? (a.ok ? 'ok' : 'bad') : '' });
          card.innerHTML = `<div class="qhead"><span class="qn">${L('S', 'Q')}${qi + 1}</span>
              <a class="pill cu" href="#${q.topic}" title="${c.title}">${I(App.pageIcon[q.topic] || 'info')}${L('Bölüm', 'Ch.')} ${c.num}</a>
              <span class="pill">${I(ty[1])}${App.t(ty[0])}</span>
              <span class="pill lv-${q.lvl}">${App.t(LVL[q.lvl])}</span></div>
            <div class="qtext">${fixDec(tx(q.q, p))}</div>`;
          if (q.fig) {
            const f = App.h('div', { class: 'qfig' }); card.appendChild(f);
            try { q.fig(f, p, H); } catch (e) { console.error('quiz figure', q.id, e); }
          }
          if (isChoice(q)) choiceWidget(card, q, p, a);
          else if (q.type === 'tf') tfWidget(card, q, p, a);
          else if (q.type === 'part') partWidget(card, q, p, a);
          else if (q.type === 'multi') multiWidget(card, q, p, a);
          else if (q.type === 'order') orderWidget(card, q, p, a);
          else numWidget(card, q, p, a);
          if (a) feedback(card, q, p, a);
          list.appendChild(card);
        });
        score(); applyView();
      }
      build();
    }
  });
})();
