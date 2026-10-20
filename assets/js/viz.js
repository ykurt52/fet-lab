/* FET Lab — visual toolkit: controls (UI), SVG plots (Plot), animated charge flow (Flow),
   schematic symbols (Sch). All colors come from CSS tokens, so both themes work. */
(function () {
  'use strict';
  const App = window.App;
  const NS = 'http://www.w3.org/2000/svg';
  const Viz = {};
  App.Viz = Viz;

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  Viz.svgEl = svgEl;

  /* =====================================================================
     UI controls. Each returns an object; `parent` is an element.
     ===================================================================== */
  let uid = 0;
  const UI = {};
  Viz.UI = UI;

  // slider({label, min, max, step, value, unit, digits, log, fmt, onInput})
  UI.slider = function (parent, o) {
    const id = 'ctl' + (++uid);
    const wrap = App.h('div', { class: 'ctl ctl-slider' });
    const log = !!o.log;
    const toPos = v => log ? Math.log10(v) : v;
    const fromPos = p => log ? Math.pow(10, p) : p;
    wrap.innerHTML = `<label for="${id}"><span>${o.label}</span><output></output></label>
      <input type="range" id="${id}" min="${toPos(o.min)}" max="${toPos(o.max)}" step="${log ? 0.001 : (o.step || 'any')}" value="${toPos(o.value)}">`;
    parent.appendChild(wrap);
    const input = wrap.querySelector('input'), out = wrap.querySelector('output');
    const fmt = o.fmt || (v => App.si(v, o.unit || '', o.digits || 3));
    const api = {
      el: wrap,
      get value() {
        let v = fromPos(parseFloat(input.value));
        if (log && o.step) v = Math.round(v / o.step) * o.step || o.step;
        return v;
      },
      set(v, silent) { input.value = toPos(v); show(); if (!silent && o.onInput) o.onInput(api.value); }
    };
    function show() {
      out.textContent = fmt(api.value);
      const p = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--p', p + '%');
    }
    input.addEventListener('input', () => { show(); o.onInput && o.onInput(api.value); });
    show();
    return api;
  };

  // segmented({label, options:[{value,label}], value, onChange})
  UI.segmented = function (parent, o) {
    const wrap = App.h('div', { class: 'ctl ctl-seg' });
    wrap.innerHTML = (o.label ? `<div class="ctl-label">${o.label}</div>` : '') +
      `<div class="seg" role="group">${o.options.map(op =>
        `<button type="button" data-v="${op.value}" aria-pressed="${op.value === o.value}">${op.label}</button>`).join('')}</div>`;
    parent.appendChild(wrap);
    let value = o.value;
    const api = {
      el: wrap,
      get value() { return value; },
      set(v, silent) {
        value = v;
        wrap.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
        if (!silent && o.onChange) o.onChange(v);
      }
    };
    wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const op = o.options.find(x => String(x.value) === b.dataset.v);
      api.set(op.value);
    }));
    return api;
  };

  // toggle({label, value, onChange}) — a real switch-looking button
  UI.toggle = function (parent, o) {
    const wrap = App.h('div', { class: 'ctl ctl-toggle' });
    wrap.innerHTML = `<button type="button" class="switch" role="switch" aria-checked="${!!o.value}"><span class="knob"></span></button><span>${o.label}</span>`;
    parent.appendChild(wrap);
    const btn = wrap.querySelector('button');
    let value = !!o.value;
    const api = {
      el: wrap,
      get value() { return value; },
      set(v, silent) { value = !!v; btn.setAttribute('aria-checked', String(value)); if (!silent && o.onChange) o.onChange(value); }
    };
    btn.addEventListener('click', () => api.set(!value));
    return api;
  };

  // readouts(parent, [{key, label}]) -> {set(key, text, state)}  state: 'ok'|'warn'|'bad'|''
  UI.readouts = function (parent, items) {
    const dl = App.h('dl', { class: 'readouts' });
    dl.innerHTML = items.map(i => `<div class="ro" data-k="${i.key}"><dt>${i.label}</dt><dd>—</dd></div>`).join('');
    parent.appendChild(dl);
    return {
      el: dl,
      set(key, text, state) {
        const row = dl.querySelector(`[data-k="${key}"]`);
        if (!row) return;
        row.querySelector('dd').innerHTML = text;
        row.dataset.state = state || '';
      }
    };
  };

  // button({label, onClick, kind})
  UI.button = function (parent, o) {
    const b = App.h('button', { type: 'button', class: 'btn ' + (o.kind || '') }, o.label);
    b.addEventListener('click', o.onClick);
    parent.appendChild(b);
    return b;
  };

  /* =====================================================================
     Plot — lightweight SVG chart with axes, grid, lines, dots, regions.
     new Plot(container, {w,h, x:[a,b], y:[a,b], xLabel, yLabel, xTicks, yTicks,
                          xFmt, yFmt, logX, logY, margin:{l,r,t,b}})
     ===================================================================== */
  function niceTicks(a, b, n) {
    const span = b - a; if (span <= 0) return [a];
    const step0 = span / (n || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const r = step0 / mag;
    const step = (r >= 5 ? 10 : r >= 2 ? 5 : r >= 1 ? 2 : 1) * mag;
    const out = [];
    for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-6; v += step) out.push(+v.toPrecision(12));
    return out;
  }
  function logTicks(a, b) {
    const out = [];
    for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++) {
      const v = Math.pow(10, e); if (v >= a * 0.999 && v <= b * 1.001) out.push(v);
    }
    return out;
  }

  class Plot {
    constructor(container, o) {
      this.o = Object.assign({ w: 560, h: 320, margin: { l: 56, r: 18, t: 16, b: 46 } }, o);
      const { w, h } = this.o;
      this.svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, class: 'plot', role: 'img' });
      if (o.ariaLabel) this.svg.setAttribute('aria-label', o.ariaLabel);
      this.gGrid = svgEl('g', { class: 'p-grid' });
      this.gRegion = svgEl('g', { class: 'p-region' });
      this.gData = svgEl('g', { class: 'p-data' });
      this.gTop = svgEl('g', { class: 'p-top' });
      // clip data to the plot box so out-of-range values are cut, not bent
      const cid = 'pclip' + (++uid);
      const defs = svgEl('defs');
      this.clipRect = svgEl('rect');
      const cp = svgEl('clipPath', { id: cid });
      cp.appendChild(this.clipRect); defs.appendChild(cp);
      this.gRegion.setAttribute('clip-path', `url(#${cid})`);
      this.gData.setAttribute('clip-path', `url(#${cid})`);
      this.svg.append(defs, this.gGrid, this.gRegion, this.gData, this.gTop);
      container.appendChild(this.svg);
      this.items = {};
      this.drawAxes();
    }
    get plotBox() {
      const m = this.o.margin;
      return { x0: m.l, x1: this.o.w - m.r, y0: m.t, y1: this.o.h - m.b };
    }
    sx(x) {
      const { x0, x1 } = this.plotBox, [a, b] = this.o.x;
      if (this.o.logX) return x0 + (Math.log10(Math.max(x, 1e-30)) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) * (x1 - x0);
      return x0 + (x - a) / (b - a) * (x1 - x0);
    }
    sy(y) {
      const { y0, y1 } = this.plotBox, [a, b] = this.o.y;
      if (this.o.logY) return y1 - (Math.log10(Math.max(y, 1e-30)) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) * (y1 - y0);
      return y1 - (y - a) / (b - a) * (y1 - y0);
    }
    setRange(r) { if (r.x) this.o.x = r.x; if (r.y) this.o.y = r.y; this.drawAxes(); }
    drawAxes() {
      const g = this.gGrid; g.innerHTML = '';
      const { x0, x1, y0, y1 } = this.plotBox, o = this.o;
      if (this.clipRect) {
        this.clipRect.setAttribute('x', x0 - 2); this.clipRect.setAttribute('y', y0 - 2);
        this.clipRect.setAttribute('width', x1 - x0 + 4); this.clipRect.setAttribute('height', y1 - y0 + 4);
      }
      const xt = Array.isArray(o.xTicks) ? o.xTicks : (o.logX ? logTicks(o.x[0], o.x[1]) : niceTicks(o.x[0], o.x[1], o.xTicks || 6));
      const yt = Array.isArray(o.yTicks) ? o.yTicks : (o.logY ? logTicks(o.y[0], o.y[1]) : niceTicks(o.y[0], o.y[1], o.yTicks || 5));
      const xf = o.xFmt || (v => App.si(v, '', 3).trim());
      const yf = o.yFmt || (v => App.si(v, '', 3).trim());
      g.appendChild(svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, class: 'bgbox' }));
      xt.forEach(v => {
        const X = this.sx(v);
        g.appendChild(svgEl('line', { x1: X, x2: X, y1: y0, y2: y1, class: 'gl' }));
        const t = svgEl('text', { x: X, y: y1 + 16, class: 'tick', 'text-anchor': 'middle' }); t.textContent = xf(v); g.appendChild(t);
      });
      yt.forEach(v => {
        const Y = this.sy(v);
        g.appendChild(svgEl('line', { x1: x0, x2: x1, y1: Y, y2: Y, class: 'gl' }));
        const t = svgEl('text', { x: x0 - 7, y: Y + 4, class: 'tick', 'text-anchor': 'end' }); t.textContent = yf(v); g.appendChild(t);
      });
      g.appendChild(svgEl('path', { d: `M${x0},${y0}V${y1}H${x1}`, class: 'axis' }));
      if (o.xLabel) { const t = svgEl('text', { x: (x0 + x1) / 2, y: o.h - 8, class: 'alabel', 'text-anchor': 'middle' }); t.textContent = o.xLabel; g.appendChild(t); }
      if (o.yLabel) { const t = svgEl('text', { x: 14, y: (y0 + y1) / 2, class: 'alabel', 'text-anchor': 'middle', transform: `rotate(-90 14 ${(y0 + y1) / 2})` }); t.textContent = o.yLabel; g.appendChild(t); }
    }
    _get(key, tag, layer) {
      let el = this.items[key];
      if (!el) { el = svgEl(tag); (layer || this.gData).appendChild(el); this.items[key] = el; }
      return el;
    }
    path(pts) {
      let d = '';
      const { y0, y1 } = this.plotBox;
      pts.forEach((p, i) => {
        const X = App.clamp(this.sx(p[0]), -5000, 5000), Y = App.clamp(this.sy(p[1]), y0 - 5000, y1 + 5000);
        d += (i ? 'L' : 'M') + X.toFixed(1) + ',' + Y.toFixed(1);
      });
      return d;
    }
    // line(key, [[x,y],...], cls)
    line(key, pts, cls) {
      const el = this._get(key, 'path');
      el.setAttribute('d', this.path(pts));
      el.setAttribute('class', 'pl ' + (cls || ''));
      return el;
    }
    area(key, pts, cls, base) {
      const el = this._get(key, 'path', this.gRegion);
      const b = base == null ? Math.max(this.o.y[0], 0) : base;
      if (!pts.length) { el.setAttribute('d', ''); return el; }
      el.setAttribute('d', this.path(pts) + `L${this.sx(pts[pts.length - 1][0])},${this.sy(b)}L${this.sx(pts[0][0])},${this.sy(b)}Z`);
      el.setAttribute('class', 'pa ' + (cls || ''));
      return el;
    }
    rect(key, xa, ya, xb, yb, cls) {
      const el = this._get(key, 'rect', this.gRegion);
      const X0 = this.sx(xa), X1 = this.sx(xb), Y0 = this.sy(yb), Y1 = this.sy(ya);
      el.setAttribute('x', Math.min(X0, X1)); el.setAttribute('y', Math.min(Y0, Y1));
      el.setAttribute('width', Math.abs(X1 - X0)); el.setAttribute('height', Math.abs(Y1 - Y0));
      el.setAttribute('class', 'pr ' + (cls || ''));
      return el;
    }
    dot(key, x, y, cls, r) {
      const el = this._get(key, 'circle', this.gTop);
      el.setAttribute('cx', this.sx(x)); el.setAttribute('cy', this.sy(y)); el.setAttribute('r', r || 5);
      el.setAttribute('class', 'pd ' + (cls || ''));
      return el;
    }
    vline(key, x, cls) {
      const el = this._get(key, 'line', this.gTop), { y0, y1 } = this.plotBox, X = this.sx(x);
      el.setAttribute('x1', X); el.setAttribute('x2', X); el.setAttribute('y1', y0); el.setAttribute('y2', y1);
      el.setAttribute('class', 'pv ' + (cls || ''));
      return el;
    }
    hline(key, y, cls) {
      const el = this._get(key, 'line', this.gTop), { x0, x1 } = this.plotBox, Y = this.sy(y);
      el.setAttribute('x1', x0); el.setAttribute('x2', x1); el.setAttribute('y1', Y); el.setAttribute('y2', Y);
      el.setAttribute('class', 'pv ' + (cls || ''));
      return el;
    }
    // text(key, x, y, str, cls, anchor, dx, dy) — data coordinates
    text(key, x, y, str, cls, anchor, dx, dy) {
      const el = this._get(key, 'text', this.gTop);
      el.setAttribute('x', this.sx(x) + (dx || 0)); el.setAttribute('y', this.sy(y) + (dy || 0));
      el.setAttribute('text-anchor', anchor || 'start');
      el.setAttribute('class', 'pt ' + (cls || ''));
      el.textContent = str;
      return el;
    }
    hide(key, hidden) { const el = this.items[key]; if (el) el.style.display = hidden ? 'none' : ''; }
    remove(key) { const el = this.items[key]; if (el) { el.remove(); delete this.items[key]; } }
  }
  Viz.Plot = Plot;
  // sample f over [a,b] with n points
  /* =====================================================================
     Scope — oscilloscope-style time display.
     new Scope(container, {w, h, divX:10, divY:8, t0, tdiv, tUnit?,
                           channels:[{key, name, color:'ch1'|'ch2'|'ch3'|'ch4'|'ok'|'bad', unit, scale, pos}]})
       scale = units per division, pos = divisions from screen centre where the channel's 0 sits.
       .trace(key, [[t, v], …])   .setTime({t0, tdiv})   .setChannel(key, {scale, pos, name})
       .fit(key, min, max, bandFrom, bandTo)  → pick a 1-2-5 scale/pos so [min,max] fills the band (in divisions)
       .cursor(t)   .measure([{label, value, color}])   .status(text)
     Screen colours are the instrument's own (dark glass) in both themes.
     ===================================================================== */
  function nice125(x) {
    const e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
  }
  const CHN = { ch1: 'CH1', ch2: 'CH2', ch3: 'CH3', ch4: 'CH4', ok: 'M1', bad: 'M2' };
  class Scope {
    constructor(container, o) {
      this.o = Object.assign({ w: 640, h: 380, divX: 10, divY: 8, t0: 0, tdiv: 1e-3, channels: [] }, o);
      const { w, h } = this.o;
      const head = 34, foot = 34, side = 26, pad = 12;
      this.box = { x0: pad + side, x1: w - pad - 8, y0: head + 6, y1: h - foot - 6 };
      this.svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, class: 'scope', role: 'img' });
      if (o.ariaLabel) this.svg.setAttribute('aria-label', o.ariaLabel);
      const cid = 'sclip' + (++uid);
      const B = this.box;
      this.svg.innerHTML = `
        <defs><clipPath id="${cid}"><rect x="${B.x0}" y="${B.y0}" width="${B.x1 - B.x0}" height="${B.y1 - B.y0}"/></clipPath></defs>
        <rect class="sc-bezel" x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10"/>
        <rect class="sc-screen" x="${B.x0 - side + 4}" y="${B.y0}" width="${B.x1 - B.x0 + side - 4}" height="${B.y1 - B.y0}" rx="4"/>
        <g class="sc-grid"></g><g class="sc-traces" clip-path="url(#${cid})"></g><g class="sc-marks"></g>
        <g class="sc-head"></g><g class="sc-foot"></g>`;
      container.appendChild(this.svg);
      this.gGrid = this.svg.querySelector('.sc-grid');
      this.gTr = this.svg.querySelector('.sc-traces');
      this.gMarks = this.svg.querySelector('.sc-marks');
      this.gHead = this.svg.querySelector('.sc-head');
      this.gFoot = this.svg.querySelector('.sc-foot');
      this.ch = {};
      this.o.channels.forEach(c => { this.ch[c.key] = Object.assign({ scale: 1, pos: 0, unit: 'V' }, c); });
      this.tr = {};
      this.meas = [];
      this.drawGrid();
      this.drawLabels();
    }
    get dx() { return (this.box.x1 - this.box.x0) / this.o.divX; }
    get dy() { return (this.box.y1 - this.box.y0) / this.o.divY; }
    X(t) { return this.box.x0 + (t - this.o.t0) / this.o.tdiv * this.dx; }
    Y(c, v) { const yc = (this.box.y0 + this.box.y1) / 2; return yc - (v / c.scale + c.pos) * this.dy; }
    drawGrid() {
      const B = this.box, g = this.gGrid, { divX, divY } = this.o, dx = this.dx, dy = this.dy;
      let s = '';
      for (let i = 1; i < divX; i++) s += `<line class="sc-div" x1="${B.x0 + i * dx}" x2="${B.x0 + i * dx}" y1="${B.y0}" y2="${B.y1}"/>`;
      for (let j = 1; j < divY; j++) s += `<line class="sc-div" x1="${B.x0}" x2="${B.x1}" y1="${B.y0 + j * dy}" y2="${B.y0 + j * dy}"/>`;
      const xc = B.x0 + divX / 2 * dx, yc = B.y0 + divY / 2 * dy;
      s += `<line class="sc-axis" x1="${B.x0}" x2="${B.x1}" y1="${yc}" y2="${yc}"/><line class="sc-axis" x1="${xc}" x2="${xc}" y1="${B.y0}" y2="${B.y1}"/>`;
      for (let i = 0; i <= divX * 5; i++) { const x = B.x0 + i * dx / 5; s += `<line class="sc-tick" x1="${x}" x2="${x}" y1="${yc - (i % 5 ? 2.5 : 4)}" y2="${yc + (i % 5 ? 2.5 : 4)}"/>`; }
      for (let j = 0; j <= divY * 5; j++) { const y = B.y0 + j * dy / 5; s += `<line class="sc-tick" x1="${xc - (j % 5 ? 2.5 : 4)}" x2="${xc + (j % 5 ? 2.5 : 4)}" y1="${y}" y2="${y}"/>`; }
      s += `<rect class="sc-frame" x="${B.x0}" y="${B.y0}" width="${B.x1 - B.x0}" height="${B.y1 - B.y0}"/>`;
      g.innerHTML = s;
    }
    fmtScale(c) { return App.si(c.scale, c.unit, 3).replace(' ', ' ') + '/div'; }
    drawLabels() {
      const { w, h } = this.o, B = this.box;
      // header: channel badges left, status right — all on one baseline
      let x = 14, s = '';
      Object.values(this.ch).forEach(c => {
        if (c.hidden) return;
        const tag = CHN[c.color] || 'CH';
        const name = c.name || '';
        const wTag = tag.length * 6.6 + 12, wName = name.length * 6.3 + 12;
        s += `<g class="sc-badge c-${c.color}" transform="translate(${x},9)">
          <rect class="sc-tag" width="${wTag}" height="18" rx="4"/><text class="sc-tagt" x="${wTag / 2}" y="12.5" text-anchor="middle">${tag}</text>
          <text class="sc-name" x="${wTag + 6}" y="12.5">${name}</text></g>`;
        x += wTag + wName + 10;
      });
      s += `<text class="sc-status" x="${w - 16}" y="21.5" text-anchor="end">${this._status || ''}</text>`;
      this.gHead.innerHTML = s;
      // footer: per-channel scale, then time base right-aligned
      let fx = 14, f = '';
      Object.values(this.ch).forEach(c => {
        if (c.hidden) return;
        const txt = this.fmtScale(c);
        f += `<g class="c-${c.color}" transform="translate(${fx},${h - 26})"><rect class="sc-dot" width="9" height="9" rx="2" y="1"/><text class="sc-scale" x="14" y="9.5">${txt}</text></g>`;
        fx += 22 + txt.length * 6.4;
      });
      const tb = App.si(this.o.tdiv, 's', 3).replace(' ', ' ') + '/div';
      f += `<text class="sc-scale sc-time" x="${w - 16}" y="${h - 16.5}" text-anchor="end">${tb}</text>`;
      if (this.meas.length) {
        let mx = w - 16 - tb.length * 6.4 - 18;
        this.meas.slice().reverse().forEach(m => {
          const txt = `${m.label} ${m.value}`;
          f += `<text class="sc-meas c-${m.color || 'ch4'}" x="${mx}" y="${h - 16.5}" text-anchor="end">${txt}</text>`;
          mx -= txt.length * 6.2 + 14;
        });
      }
      this.gFoot.innerHTML = f;
      // ground markers on the left edge + trigger marker on top
      let m = '';
      Object.values(this.ch).forEach(c => {
        if (c.hidden) return;
        const y = App.clamp(this.Y(c, 0), B.y0 + 6, B.y1 - 6);
        const n = (CHN[c.color] || 'C').slice(-1);
        m += `<g class="c-${c.color}"><path class="sc-gnd" d="M${B.x0 - 20},${y - 7}h12l6,7l-6,7h-12z"/><text class="sc-gndt" x="${B.x0 - 14}" y="${y + 3.5}" text-anchor="middle">${n}</text></g>`;
      });
      const tx = this.X(this.o.trig == null ? 0 : this.o.trig);
      if (this.o.trig !== false && tx >= B.x0 && tx <= B.x1) m += `<path class="sc-trig" d="M${tx - 5},${B.y0 - 7}h10l-5,6z"/><text class="sc-trigt" x="${tx + 8}" y="${B.y0 - 1.5}">T</text>`;
      this.gMarks.innerHTML = m + `<line class="sc-cursor" x1="0" x2="0" y1="${B.y0}" y2="${B.y1}" style="display:none"/>`;
      this.cursorEl = this.gMarks.querySelector('.sc-cursor');
    }
    setTime(t) { Object.assign(this.o, t); this.drawLabels(); this.redraw(); }
    setChannel(key, p) { Object.assign(this.ch[key], p); this.drawLabels(); this.redraw(key); }
    status(s) { this._status = s; const el = this.gHead.querySelector('.sc-status'); if (el) el.textContent = s; }
    measure(list) { this.meas = list || []; this.drawLabels(); }
    // choose a 1-2-5 scale so [min,max] spans at most (to − from) divisions, with 0 placed at `from` when min ≥ 0
    fit(key, min, max, from, to, silent) {
      const c = this.ch[key], span = Math.max(max - Math.min(min, 0), 1e-12);
      c.scale = nice125(span / (to - from) * 1.02);
      c.pos = from - Math.min(min, 0) / c.scale;
      if (!silent) { this.drawLabels(); this.redraw(key); }
    }
    trace(key, pts) { this.tr[key] = pts; this.redraw(key); }
    redraw(key) {
      const keys = key ? [key] : Object.keys(this.tr);
      keys.forEach(k => {
        const c = this.ch[k], pts = this.tr[k];
        if (!c || !pts) return;
        let el = this.gTr.querySelector(`[data-k="${k}"]`);
        if (!el) { el = svgEl('path', { 'data-k': k, class: `sc-trace c-${c.color}` }); this.gTr.appendChild(el); }
        el.style.display = c.hidden ? 'none' : '';
        let d = '';
        for (let i = 0; i < pts.length; i++) {
          const X = this.X(pts[i][0]), Y = App.clamp(this.Y(c, pts[i][1]), -2000, 4000);
          d += (i ? 'L' : 'M') + X.toFixed(1) + ',' + Y.toFixed(1);
        }
        el.setAttribute('d', d);
      });
    }
    // dashed horizontal marker at a channel value (e.g. a voltage rating)
    level(id, key, value, color, label) {
      const c = this.ch[key], B = this.box;
      let g = this.gMarks.querySelector(`[data-lv="${id}"]`);
      if (value == null) { if (g) g.remove(); return; }
      if (!g) { g = svgEl('g', { 'data-lv': id }); this.gMarks.appendChild(g); }
      const y = this.Y(c, value);
      if (y < B.y0 || y > B.y1) { g.innerHTML = ''; return; }
      g.setAttribute('class', `c-${color || c.color}`);
      g.innerHTML = `<line x1="${B.x0}" x2="${B.x1}" y1="${y}" y2="${y}" stroke="currentColor" stroke-dasharray="6 4" stroke-width="1.2" opacity=".85"/>` +
        (label ? `<text x="${B.x1 - 4}" y="${y - 4}" text-anchor="end" class="sc-meas">${label}</text>` : '');
    }
    cursor(t) {
      if (!this.cursorEl) return;
      if (t == null) { this.cursorEl.style.display = 'none'; return; }
      const X = this.X(t);
      this.cursorEl.style.display = '';
      this.cursorEl.setAttribute('x1', X); this.cursorEl.setAttribute('x2', X);
    }
  }
  Viz.Scope = Scope;
  Viz.nice125 = nice125;

  Viz.sample = function (f, a, b, n) {
    const out = []; n = n || 120;
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; out.push([x, f(x)]); }
    return out;
  };

  /* =====================================================================
     Flow — dots that travel along an SVG path; speed follows `rate`.
     new Flow(svg, pathElOrD, {spacing, r, speed, cls})
       .rate  (0 … 1+, multiplies speed; 0 hides the dots)
       .dir   (+1 along path, -1 reverse)
     Conventional current direction is used unless a page says otherwise.
     ===================================================================== */
  class Flow {
    constructor(svg, path, o) {
      o = Object.assign({ spacing: 16, r: 2.6, speed: 70, cls: 'flow' }, o);
      this.o = o;
      if (typeof path === 'string') {
        this.path = svgEl('path', { d: path, class: 'flow-track' });
        svg.appendChild(this.path);
      } else this.path = path;
      this.g = svgEl('g', { class: o.cls });
      svg.appendChild(this.g);
      this.len = this.path.getTotalLength();
      const n = Math.max(2, Math.floor(this.len / o.spacing));
      this.dots = [];
      for (let i = 0; i < n; i++) { const c = svgEl('circle', { r: o.r }); this.g.appendChild(c); this.dots.push(c); }
      this.off = 0; this._rate = 1; this.dir = 1;
      this.place();
      // only animate while the drawing is on screen (keeps long pages and embeds light)
      this.visible = true;
      if (window.IntersectionObserver) {
        const io = new IntersectionObserver(es => { this.visible = es[es.length - 1].isIntersecting; });
        io.observe(svg);
        App.onCleanup(() => io.disconnect());
      }
      const off = App.onFrame(dt => { if (this.visible) this.step(dt); });
      this.stop = off;
    }
    get rate() { return this._rate; }
    set rate(r) {
      this._rate = r;
      // show/hide immediately, so a page that is not animating (hidden tab, reduced motion) is still right
      this.g.style.opacity = r <= 0.001 ? 0 : App.clamp(0.35 + r, 0, 1);
    }
    setPath(d) { this.path.setAttribute('d', d); this.len = this.path.getTotalLength(); this.place(); }
    step(dt) {
      const r = this._rate;
      if (r <= 0.001) return;
      if (!App.reducedMotion) this.off = (this.off + dt * this.o.speed * Math.min(r, 3) * this.dir + this.len * 10) % this.o.spacing;
      this.place();
    }
    place() {
      const sp = this.o.spacing;
      this.dots.forEach((c, i) => {
        const s = (i * sp + this.off) % this.len;
        const p = this.path.getPointAtLength(s);
        c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
      });
    }
  }
  Viz.Flow = Flow;

  /* =====================================================================
     Sch — schematic symbols as SVG strings (IEC-style resistor box).
     Two-terminal parts: centred at (x,y), pins at (x, y±30); rot=90 → pins at (x±30, y).
     Transistors at (x,y): control pin (base/gate) at (x-30,y);
       NPN/NMOS:  collector/drain (x+20,y-30), emitter/source (x+20,y+30)
       PNP/PMOS:  emitter/source  (x+20,y-30), collector/drain (x+20,y+30)
     ===================================================================== */
  const Sch = {};
  Viz.Sch = Sch;
  const rotT = (x, y, rot) => rot ? ` transform="rotate(${rot} ${x} ${y})"` : '';
  const lab = (x, y, s, anchor, cls) => s ? `<text x="${x}" y="${y}" class="sch-t ${cls || ''}" text-anchor="${anchor || 'start'}">${s}</text>` : '';
  function labPos(x, y, rot) { return rot === 90 || rot === 270 ? [x, y - 14, 'middle'] : [x + 14, y + 4, 'start']; }

  Sch.w = function (pts, cls) { return `<path class="wire ${cls || ''}" d="M${pts.map(p => p.join(',')).join('L')}"/>`; };
  Sch.d = function (pts) { return 'M' + pts.map(p => p.join(',')).join('L'); };
  Sch.dot = (x, y) => `<circle class="jdot" cx="${x}" cy="${y}" r="3"/>`;
  Sch.text = (x, y, s, cls, anchor) => lab(x, y, s, anchor, cls);

  Sch.res = function (x, y, rot, label, id) {
    const [lx, ly, la] = labPos(x, y, rot);
    return `<g class="sch"${id ? ` id="${id}"` : ''}${rotT(x, y, rot)}><path d="M${x},${y - 30}V${y - 15}M${x},${y + 15}V${y + 30}"/><rect x="${x - 6}" y="${y - 15}" width="12" height="30" rx="1"/></g>${lab(lx, ly, label, la)}`;
  };
  Sch.load = function (x, y, rot, label, id) {
    const [lx, ly, la] = labPos(x, y, rot);
    return `<g class="sch load"${id ? ` id="${id}"` : ''}${rotT(x, y, rot)}><path d="M${x},${y - 30}V${y - 16}M${x},${y + 16}V${y + 30}"/><rect x="${x - 12}" y="${y - 16}" width="24" height="32" rx="3" class="load-body"/></g>${lab(lx + 6, ly, label, la)}`;
  };
  Sch.cap = function (x, y, rot, label) {
    const [lx, ly, la] = labPos(x, y, rot);
    return `<g class="sch"${rotT(x, y, rot)}><path d="M${x},${y - 30}V${y - 4}M${x},${y + 4}V${y + 30}M${x - 11},${y - 4}H${x + 11}M${x - 11},${y + 4}H${x + 11}"/></g>${lab(lx, ly, label, la)}`;
  };
  Sch.ind = function (x, y, rot, label) {
    const [lx, ly, la] = labPos(x, y, rot);
    let d = `M${x},${y - 30}V${y - 20}`;
    for (let i = 0; i < 4; i++) d += `a5,5 0 0 1 0,10`;
    d += `V${y + 30}`;
    return `<g class="sch"${rotT(x, y, rot)}><path d="${d}"/></g>${lab(lx, ly, label, la)}`;
  };
  // diode: anode at pin1 (y-30), cathode at pin2 (y+30)
  Sch.diode = function (x, y, rot, label, kind, id) {
    const [lx, ly, la] = labPos(x, y, rot);
    let bar = `M${x - 9},${y + 7}H${x + 9}`;
    if (kind === 'zener') bar = `M${x - 12},${y + 3}L${x - 9},${y + 7}H${x + 9}L${x + 12},${y + 11}`;
    if (kind === 'schottky') bar = `M${x - 12},${y + 3}V${y + 3}M${x - 12},${y + 3}h3v4H${x + 9}v4h3`;
    return `<g class="sch"${id ? ` id="${id}"` : ''}${rotT(x, y, rot)}><path d="M${x},${y - 30}V${y - 8}M${x},${y + 7}V${y + 30}${bar}"/><path class="fillink" d="M${x - 9},${y - 8}H${x + 9}L${x},${y + 7}Z"/></g>${lab(lx, ly, label, la)}`;
  };
  Sch.led = function (x, y, rot, label, id) {
    const [lx, ly, la] = labPos(x, y, rot);
    return `<g class="sch led"${id ? ` id="${id}"` : ''}${rotT(x, y, rot)}><circle class="led-glow" cx="${x}" cy="${y}" r="16"/><path d="M${x},${y - 30}V${y - 8}M${x},${y + 7}V${y + 30}M${x - 9},${y + 7}H${x + 9}"/><path class="fillink" d="M${x - 9},${y - 8}H${x + 9}L${x},${y + 7}Z"/><path class="thin" d="M${x + 11},${y - 2}l8,-6m-4,0h4v4M${x + 11},${y + 6}l8,-6m-4,0h4v4"/></g>${lab(lx + 12, ly, label, la)}`;
  };
  Sch.gnd = function (x, y) {
    return `<g class="sch"><path d="M${x},${y}V${y + 6}M${x - 11},${y + 6}H${x + 11}M${x - 7},${y + 10}H${x + 7}M${x - 3},${y + 14}H${x + 3}"/></g>`;
  };
  Sch.vcc = function (x, y, label) {
    return `<g class="sch"><path d="M${x},${y}V${y - 8}M${x - 10},${y - 8}H${x + 10}"/></g>${lab(x, y - 14, label, 'middle', 'rail')}`;
  };
  Sch.motor = function (x, y, label, id) {
    return `<g class="sch motor"${id ? ` id="${id}"` : ''}><path d="M${x},${y - 30}V${y - 16}M${x},${y + 16}V${y + 30}"/><circle cx="${x}" cy="${y}" r="16" class="load-body"/><g class="rotor"><path class="thin" d="M${x - 9},${y}H${x + 9}M${x},${y - 9}V${y + 9}"/></g></g>${lab(x + 22, y + 4, label || 'M')}`;
  };
  Sch.sw = function (x, y, rot, closed, label, id) {
    const [lx, ly, la] = labPos(x, y, rot);
    const tip = closed ? `L${x},${y + 12}` : `L${x + 13},${y + 9}`;
    return `<g class="sch"${id ? ` id="${id}"` : ''}${rotT(x, y, rot)}><path d="M${x},${y - 30}V${y - 12}${tip}M${x},${y + 12}V${y + 30}"/><circle cx="${x}" cy="${y - 12}" r="2.4" class="fillink"/><circle cx="${x}" cy="${y + 12}" r="2.4" class="fillink"/></g>${lab(lx, ly, label, la)}`;
  };
  Sch.npn = function (x, y, label, pnp, id) {
    const arrow = pnp
      ? `<path class="fillink" d="${arrowHead(x + 2, y - 11, x - 6, y - 6)}"/>`
      : `<path class="fillink" d="${arrowHead(x + 18, y + 21, x + 9, y + 14)}"/>`;
    // pnp: emitter on top (arrow points into the base), npn: emitter at bottom (arrow points out)
    return `<g class="sch bjt"${id ? ` id="${id}"` : ''}><circle cx="${x + 8}" cy="${y}" r="23" class="tbody"/><path d="M${x - 30},${y}H${x - 6}M${x - 6},${y - 14}V${y + 14}M${x - 6},${y - 7}L${x + 20},${y - 22}V${y - 30}M${x - 6},${y + 7}L${x + 20},${y + 22}V${y + 30}"/>${arrow}</g>${lab(x + 34, y + 4, label)}`;
  };
  Sch.pnp = (x, y, label, id) => Sch.npn(x, y, label, true, id);
  function arrowHead(tx, ty, fx, fy) {
    const a = Math.atan2(ty - fy, tx - fx), L = 8, W = 4;
    const bx = tx - L * Math.cos(a), by = ty - L * Math.sin(a);
    const nx = -Math.sin(a) * W, ny = Math.cos(a) * W;
    return `M${tx},${ty}L${(bx + nx).toFixed(1)},${(by + ny).toFixed(1)}L${(bx - nx).toFixed(1)},${(by - ny).toFixed(1)}Z`;
  }
  Sch.arrowHead = arrowHead;
  // MOSFET (enhancement). opts: {p:true for P-channel, bd:true to draw body diode}
  Sch.mos = function (x, y, label, opts, id) {
    opts = opts || {};
    const p = !!opts.p;
    const top = y - 12, bot = y + 12;
    // body connects to source: N → source at bottom, P → source at top
    const srcY = p ? top : bot;
    const arrow = p
      ? `<path class="fillink" d="${arrowHead(x + 16, y, x + 4, y)}"/>`
      : `<path class="fillink" d="${arrowHead(x - 3, y, x + 10, y)}"/>`;
    let bd = '';
    if (opts.bd) {
      // body diode: anode on source side, cathode on drain side
      const dx = x + 38;
      const yA = p ? y - 30 + 8 : y + 30 - 8, yK = p ? y + 30 - 8 : y - 30 + 8;
      // body diode: anode at the body/source side … for both N (source bottom) and P (source top) the
      // cathode ends up on the upper terminal (N: drain, P: source), so the triangle always points up
      const dir = -1;
      bd = `<g class="bd"><path d="M${x + 20},${y - 22}H${dx}V${y + 22}H${x + 20}"/>` +
        `<path class="fillink" d="M${dx - 7},${y - 5 * dir}H${dx + 7}L${dx},${y + 5 * dir}Z"/><path d="M${dx - 7},${y + 5 * dir}H${dx + 7}"/></g>`;
      void yA; void yK;
    }
    return `<g class="sch mos"${id ? ` id="${id}"` : ''}><path d="M${x - 30},${y}H${x - 11}M${x - 11},${y - 15}V${y + 15}M${x - 4},${y - 17}V${y - 7}M${x - 4},${y - 5}V${y + 5}M${x - 4},${y + 7}V${y + 17}M${x - 4},${top}H${x + 20}V${y - 30}M${x - 4},${bot}H${x + 20}V${y + 30}M${x - 4},${y}H${x + 20}V${srcY}"/>${arrow}${bd}</g>${lab(x + (opts.bd ? 50 : 30), y + 4, label)}`;
  };
  Sch.nmos = (x, y, label, opts, id) => Sch.mos(x, y, label, Object.assign({}, opts, { p: false }), id);
  Sch.pmos = (x, y, label, opts, id) => Sch.mos(x, y, label, Object.assign({}, opts, { p: true }), id);
  // generic IC / MCU block
  Sch.box = function (x, y, w, h, title, sub, id) {
    return `<g class="sch ic"${id ? ` id="${id}"` : ''}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="ic-body"/></g>${lab(x + w / 2, y + h / 2 - (sub ? 2 : -4), title, 'middle', 'ic-t')}${sub ? lab(x + w / 2, y + h / 2 + 14, sub, 'middle', 'ic-s') : ''}`;
  };
  // battery / DC source, + at top (y-30)
  Sch.vsrc = function (x, y, label) {
    return `<g class="sch"><path d="M${x},${y - 30}V${y - 5}M${x},${y + 5}V${y + 30}M${x - 13},${y - 5}H${x + 13}M${x - 7},${y + 5}H${x + 7}"/></g>${lab(x + 18, y + 4, label)}${lab(x - 18, y - 6, '+', 'middle', 'pm')}`;
  };

  // Build an <svg> inside container from a string of parts
  Viz.schematic = function (container, w, h, inner, cls) {
    const wrap = App.h('div', { class: 'sch-wrap ' + (cls || '') });
    wrap.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="schem" role="img">${inner}</svg>`;
    container.appendChild(wrap);
    return wrap.querySelector('svg');
  };

  /* =====================================================================
     enhance(root) — wires up declarative bits in page HTML:
       <div class="tabs" data-tabs> <div class="tab-btns"><button data-tab="a">…</button></div>
         <section data-panel="a">…</section> </div>
     ===================================================================== */
  Viz.enhance = function (root) {
    // callouts get a real icon instead of a letter
    const callIc = { tip: 'check', warn: 'warn', bad: 'x', info: 'info' };
    App.$$('.call', root).forEach(c => {
      if (c.querySelector(':scope > .call-ic')) return;
      const k = Object.keys(callIc).find(x => c.classList.contains(x)) || 'info';
      c.insertAdjacentHTML('afterbegin', `<span class="call-ic">${App.icon ? App.icon(callIc[k]) : ''}</span>`);
    });
    App.$$('[data-tabs]', root).forEach(t => {
      const btns = App.$$('.tab-btns > button', t);
      const panels = App.$$(':scope > [data-panel]', t);
      const show = k => {
        btns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === k)));
        panels.forEach(p => { p.hidden = p.dataset.panel !== k; });
        t.dispatchEvent(new CustomEvent('tabchange', { detail: k }));
      };
      btns.forEach(b => { b.setAttribute('role', 'tab'); b.addEventListener('click', () => show(b.dataset.tab)); });
      if (btns[0]) show(btns[0].dataset.tab);
    });
  };

  /* Common physics helpers used by several pages */
  Viz.phys = {
    // simple square-law NMOS with channel-length modulation
    mosId(vgs, vds, vth, k, lambda) {
      lambda = lambda || 0.02;
      const vov = vgs - vth;
      if (vov <= 0) return 0;
      if (vds < vov) return k * (vov * vds - vds * vds / 2) * (1 + lambda * vds);
      return 0.5 * k * vov * vov * (1 + lambda * vds);
    },
    // BJT Ic for given Ib and Vce (Early effect + soft saturation)
    bjtIc(ib, vce, beta, va) {
      va = va || 80;
      const icAct = beta * ib * (1 + vce / va);
      return icAct * (1 - Math.exp(-vce / 0.08));
    }
  };
})();
