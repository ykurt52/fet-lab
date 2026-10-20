# Writing a FET Lab page

FET Lab is a static, dependency-free site. Every chapter is one classic script in `pages/` that calls `App.page({...})`. Load order in `index.html` is the menu order. No build step: open `index.html` through any static server (`python -m http.server`) or GitHub Pages.

Reference implementations: `pages/00-home.js` and `pages/02-bjt.js`. Read them before writing a new page.

## Page definition

```js
App.page({
  id: 'mosfet',                       // URL hash (#mosfet), unique
  num: '03',                          // chapter number shown in menu
  group: { tr: 'Temeller', en: 'Fundamentals' },   // menu group, must match neighbours exactly
  title: { tr: '…', en: '…' },
  blurb: { tr: '…', en: '…' },        // one line, shown on the home roadmap card
  summary: { tr: '…', en: '…' },      // lead paragraph under the title
  render(L) { return `html string`; }, // static content; L(tr, en) picks the language
  mount(root, App) { … }              // build interactive parts into placeholders; optional cleanup return
});
```

* The whole page is re-rendered when the language changes, so **every visible string goes through `L('türkçe', 'english')`** (or `App.L` inside `mount`). Both languages are first-class; write natural Turkish and natural English, not literal translations.
* Turkish numbers use a decimal comma (`0,7 V`), English a point (`0.7 V`). `App.num(v, digits)` and `App.si(v, unit, sig)` format correctly for the current language. In hand-written text, write the number in each language's form.
* Animation callbacks registered with `App.onFrame(fn(dt, t))` and every `Viz.Flow` are torn down automatically when the user leaves the page.

## Building blocks (HTML strings, used in `render`)

| Helper | Output |
|---|---|
| `App.lab(id, title, {foot, stack, tag})` | Interactive panel: `.lab-fig` (left/top, figure) + `.lab-ctl` (right, controls). `stack:true` puts controls under the figure in a grid. |
| `App.figure(id, title, {foot, tag})` | Panel with only `.lab-fig` (animation without controls). |
| `<div class="eq">…<span class="note">…</span></div>` | Formula block (mono). `<b>` inside is copper-highlighted. |
| `<div class="call tip|warn|bad|info"><strong>Title</strong> text</div>` | Callout. |
| `<div class="cards"><div class="card"><h4>…</h4><p>…</p></div></div>` | Card grid. |
| `<div class="table-wrap"><table>…</table></div>` | Table (`td.num` for right-aligned numbers). |
| `<ol class="steps">` | Numbered procedure. |
| `<div class="tabs" data-tabs><div class="tab-btns"><button data-tab="a">A</button>…</div><section data-panel="a">…</section>…</div>` | In-page tabs (auto-wired). Listen to `tabchange` event on the `.tabs` element if a lab inside a hidden tab needs to know. |
| `<details class="fold"><summary>…</summary><div>…</div></details>` | Collapsible worked solution. |
| `<span class="pill ok|warn|bad|cu">` | Small status label. `.cu` / `.sig` text classes = copper / signal colour. |

## Interactive toolkit (`App.Viz`, used in `mount`)

* `Viz.UI.slider(parent, {label, min, max, step, value, unit, digits, log, fmt, onInput})` → `{el, value, set(v)}`
* `Viz.UI.segmented(parent, {label, options:[{value,label}], value, onChange})`
* `Viz.UI.toggle(parent, {label, value, onChange})`
* `Viz.UI.readouts(parent, [{key,label}])` → `{el, set(key, html, state)}` with state `'ok'|'warn'|'bad'|''`
* `Viz.UI.button(parent, {label, onClick, kind:'primary'})`
* `new Viz.Plot(container, {w, h, x:[a,b], y:[a,b], xLabel, yLabel, xTicks, yTicks, xFmt, yFmt, logX, logY})`
  * `.line(key, pts, cls)`, `.area(key, pts, cls, base)`, `.rect(key, x0,y0,x1,y1, cls)`, `.dot(key,x,y,cls,r)`, `.vline(key,x,cls)`, `.hline(key,y,cls)`, `.text(key,x,y,str,cls,anchor,dx,dy)`, `.hide(key,bool)`, `.setRange({x,y})`
  * Calling a method again with the same key updates that element (cheap enough for every frame).
  * classes: lines `cu` (load current, magenta), `sig` (control, cyan), `ch1` (yellow trace), `acc` (accent), `ok`, `bad`, `warn`, `faint`, `dash`, `thin`; areas/rects `sig`, `cu`, `ok`, `bad`, `warn`; text `cu sig bad ok warn muted big`.
  * Token names `--copper` / `--signal` are historical: the palette is pastel oscilloscope colours (CH3 magenta for load current, CH2 cyan for control).
  * Axis labels are plain text, so write `V_GS (V)` or use Unicode subscripts sparingly.
* `Viz.sample(f, a, b, n)` → `[[x, f(x)], …]`
* `Viz.schematic(container, w, h, svgInnerString)` → the `<svg>` element.
* `new Viz.Flow(svg, pathD, {spacing, r, speed, cls})` — moving dots along a path. Set `.rate` (0 hides, 1 normal, up to 3) and `.dir` (+1 / −1) every frame or on input. `cls: 'flow'` copper (load current), `'flow e'` blue (gate/base/control or electrons), `'flow bad'` red.
* `Viz.phys.mosId(vgs, vds, vth, k, lambda)`, `Viz.phys.bjtIc(ib, vce, beta, va)` — simple device models.

### Schematic symbols (`Viz.Sch`, return SVG strings)

Two-terminal parts are centred at `(x,y)` with pins at `(x, y−30)` and `(x, y+30)`; `rot=90` makes them horizontal with pins at `(x−30, y)` and `(x+30, y)`.

`res(x,y,rot,label,id)`, `load(x,y,rot,label,id)`, `cap`, `ind`, `diode(x,y,rot,label,kind,id)` (anode at the first pin; `kind` = `'zener'|'schottky'`), `led(x,y,rot,label,id)` (set `#id .led-glow` opacity 0–1 to light it), `sw(x,y,rot,closed,label,id)`, `motor(x,y,label,id)`, `vsrc(x,y,label)` (+ on top), `gnd(x,y)` (pin on top), `vcc(x,y,label)` (pin at bottom), `box(x,y,w,h,title,sub,id)` (IC/MCU).

Transistors at `(x,y)`: control pin `(x−30, y)`.
* `npn(x,y,label,_,id)`, `nmos(x,y,label,{bd:true},id)`: collector/drain `(x+20, y−30)`, emitter/source `(x+20, y+30)`.
* `pnp(x,y,label,id)`, `pmos(x,y,label,{bd:true},id)`: emitter/source `(x+20, y−30)`, collector/drain `(x+20, y+30)`.

Wires: `Sch.w([[x,y],[x,y],…], 'hot'|'sigw')`, junction `Sch.dot(x,y)`, label `Sch.text(x,y,str,cls,anchor)` (cls: `cu sig bad ok muted big`). Cross-section layers: `<rect class="layer n|n2|p|ox|metal|chan">`.

## Parts library (`App.Parts`, `assets/js/parts.js`)

Real parts with approximate datasheet values, used by the simulator (`pages/simulator.js`) and available to any page.

* `Parts.mos` — MOSFETs: `{id, type:'N'|'P', pkg, vds, id_, vth, vgsMax, p:[[Vgs, Rds], [Vgs, Rds]], qg, qgs, qgd, qv, ciss, rthja, rthjc, tj, note}`.
  R<sub>DS(on)</sub> is modelled as `rf + a/(Vgs − vth)` fitted through the two `p` points. Helpers: `Parts.rds(m, vgs, tj)`, `Parts.idsat(m, vgs, tj)`, `Parts.idOf(m, vgs, vds, tj)`, `Parts.vplateau(m, id)`.
* `Parts.bjt` — BJTs: `{id, type:'N'|'P', pkg, vce, ic, hmin, htyp, iref, ik, vs0, rs, vbe, rthja, rthjc, tj, tsw, ts, darl, note}`. Helpers: `Parts.hfe(b, ic, worstCase)`, `Parts.vcesat(b, ic)`.
* `Parts.get(id)`, `Parts.all`.

To add a part, append an entry with values from its datasheet (25 °C, typical where the simulator should be realistic, and put the test conditions in mind: R<sub>DS(on)</sub> points at two gate voltages, Q<sub>g</sub> at the voltage given in `qv`).

## Style rules

* Colours only through classes / CSS tokens (`var(--copper)`, `var(--signal)`, `var(--bad)`, `var(--ok)`, `var(--warn)`, `var(--ink)`, `var(--muted)`, `var(--line)`, `var(--panel)`, `var(--surface)`). Never hard-code hex colours; both light and dark themes must work.
* Copper = load/power current, blue = control (gate/base) signal, red = danger.
* Plots and schematics scale with their viewBox; design them at ~600 px wide and keep labels inside the box.
* If a page truly needs extra CSS, put a `<style>` block at the top of `render()` output with every selector prefixed by `[data-page="<id>"]`, using tokens only.
* Respect `App.reducedMotion` for anything you animate yourself (Flow already does).
* Values must be physically right. State assumptions (temperatures, typical vs max) in the foot of the lab.
