# FET Lab writing style

Readers are engineering students and working engineers. They open a chapter to get an answer, not to read an essay. Every page must be **readable at a glance, stacked line by line, result-first and explanatory**.

## Rules

1. **Start every chapter with `App.keys([...])`** — 3 to 5 bullets, each one practical takeaway in one line (≤ 14 words). Put it first in `render()`.
2. **Short paragraphs.** At most 2–3 sentences per paragraph, each sentence ≤ 20 words. One idea per sentence. Prefer a bullet list over a paragraph whenever you enumerate.
3. **No formula chains in prose.** Never write "V = … → I = … = 21 mA" inside a sentence. Every calculation goes into `App.example()` as one row per step.
4. **Result first.** Each section opens with what the reader should conclude, then the why. Example: "A 3.3 V pin cannot fully turn on an IRF540N. Its R_DS(on) is only specified at 10 V."
5. **Plain words.** No filler ("it is worth noting", "fazlasıyla", "sorun yok ✓"), no stacked qualifiers, no parentheses asides inside sentences. Keep exact technical terms.
6. **Explain, do not just state.** After a number, say in one short clause what it means ("→ the pin limit is 20 mA, so this is safe").
7. **Visual structure over text.** Use: tables for comparisons, `.cards` for options, `.call` boxes only for real warnings/tips (max ~3 per page), labs/figures for mechanisms.
8. **Both languages say the same thing**, each written naturally. Turkish uses decimal commas, English decimal points.
9. **Keep all labs, figures, ids and mount() code working.** Only text changes, plus converting worked examples to `App.example`. Do not delete interactive content.

## Worked example format

```js
App.example({
  given: [['V', '24 V'], [L('Bobin', 'Coil'), '1,1 kΩ'], ['V_CE(sat)', '0,8 V']],
  steps: [
    [L('Bobin akımı', 'Coil current'), 'I = (24 − 0,8) / 1100', '21 mA'],
    [L('Kanal kaybı', 'Loss per channel'), 'P = 0,8 V · 21 mA', '17 mW'],
    [L('8 kanal birden', 'All 8 channels'), 'P = 8 · 17 mW', '0,135 W'],
    [L('Sıcaklık artışı', 'Temperature rise'), 'ΔT = 0,135 W · 65 °C/W', '≈ 9 °C', L('SOIC-18, datasheet θ_JA', 'SOIC-18, datasheet θ_JA')]
  ],
  result: L('<b>ULN2803A bu röleleri rahat sürer.</b> 8 kanal birden açıkken bile ısınma 9 °C.', '<b>The ULN2803A drives these relays easily.</b> Even with all 8 on, it warms by only 9 °C.'),
  level: 'ok'   // 'warn' or 'bad' when the conclusion is a problem
})
```

* `given`: the inputs as short chips (label, value).
* `steps`: `[what, formula, result, optional one-line note]`. The formula column holds the arithmetic with numbers substituted; the result column only the value with unit.
* `result`: one bold conclusion line plus at most one plain sentence.
* Several examples on a page: put each in its own `<details class="fold"><summary>…</summary><div>…</div></details>`, with a summary that names the question ("24 V röle bobini ULN2803A ile").

### Before (avoid)

> Röle: 24 V, R_bobin = 1,1 kΩ. V_CE(sat) bu küçük akımda ≈ 0,8 V → I = (24 − 0,8) / 1100 = 21 mA. Kanal başına kayıp P = 0,8 V · 21 mA ≈ 17 mW. Sekiz röle birden: 0,135 W. θ_JA ≈ 65 °C/W (SOIC-18, datasheet'e bak) ile ΔT ≈ 9 °C: sorun yok.

### After

The `App.example` block above, plus one sentence before it saying why we check this.

## Checklist before you finish a page

- [ ] `App.keys` at the top, ≤ 5 bullets.
- [ ] No paragraph longer than 3 sentences; no sentence with more than one "→".
- [ ] Every worked calculation is an `App.example`.
- [ ] `node --check` passes; page renders in TR and EN without console errors.
