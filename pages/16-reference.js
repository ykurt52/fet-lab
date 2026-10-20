/* 16 — Quick reference: formulas, decision flowchart, typical parts, datasheet glossary,
   E-series calculator, term glossary. */
(function () {
  'use strict';

  /* ---------- decision tree ---------- */
  const NODES = {
    q0: { x: 340, y: 30, s: { tr: 'Endüktif yük?', en: 'Inductive load?' }, q: { tr: 'Yük endüktif mi? (motor, röle, solenoid, fan, bobin)', en: 'Is the load inductive? (motor, relay, solenoid, fan, coil)' }, yes: 'q1', no: 'q1', flag: true },
    q1: { x: 340, y: 95, s: { tr: 'Yön değişecek mi?', en: 'Must it reverse?' }, q: { tr: 'Yük iki yönde sürülecek mi (ör. motoru ileri/geri döndürmek)?', en: 'Must the load be driven in both directions (e.g. a motor forward/reverse)?' }, yes: 'rH', no: 'q2' },
    q2: { x: 340, y: 165, s: { tr: 'Low-side olur mu?', en: 'Low-side OK?' }, q: { tr: 'Yükün eksi ucunu anahtarlayabilir misin? (Yükün toprağı MCU’ya sinyal hatlarıyla bağlıysa ya da şasiye bağlıysa: hayır.)', en: 'Can you switch the load’s negative side? (If the load ground is tied to the MCU through signal lines, or to chassis: no.)' }, yes: 'q3', no: 'q6' },
    q3: { x: 190, y: 235, s: { tr: '≤ 0,2 A ve yavaş?', en: '≤ 0.2 A and slow?' }, q: { tr: 'Akım ≤ ~0,2 A ve anahtarlama ≤ ~1 kHz mi?', en: 'Is the current ≤ ~0.2 A and switching ≤ ~1 kHz?' }, yes: 'rB', no: 'q4' },
    q4: { x: 290, y: 310, s: { tr: '> 20 kHz ya da > 5 A?', en: '> 20 kHz or > 5 A?' }, q: { tr: 'PWM ~20 kHz’ten hızlı mı, ya da akım ~5 A’in üstünde mi (büyük gate yükü)?', en: 'Is PWM faster than ~20 kHz, or the current above ~5 A (large gate charge)?' }, yes: 'rD', no: 'q5' },
    q5: { x: 200, y: 385, s: { tr: 'R_DS(on) @ V_GPIO?', en: 'R_DS(on) @ V_GPIO?' }, q: { tr: 'R<sub>DS(on)</sub>’u GPIO geriliminde ya da altında (3,3 V için 2,5 V spesifikasyonu) garanti eden ve kaybı kabul edilebilir bir MOSFET var mı?', en: 'Is there a MOSFET whose R<sub>DS(on)</sub> is guaranteed at or below your GPIO voltage (a 2.5 V spec for 3.3 V) with acceptable loss?' }, yes: 'rL', no: 'rD' },
    q6: { x: 530, y: 235, s: { tr: '≤ 30 V, ≤ 3 A, yavaş?', en: '≤ 30 V, ≤ 3 A, slow?' }, q: { tr: 'Hat ≤ ~30 V, akım ≤ ~3 A ve anahtarlama yavaş mı (aç/kapa ya da birkaç kHz)?', en: 'Is the rail ≤ ~30 V, the current ≤ ~3 A and switching slow (on/off or a few kHz)?' }, yes: 'rP', no: 'rHS' },
    rH: { x: 570, y: 95, r: true, s: { tr: 'H-köprü IC', en: 'H-bridge IC' }, t: { tr: 'Entegre H-köprü: küçük motorlar için DRV8833/DRV8871, büyükler için VNH5019. Dead-time, akım sınırı ve ısıl koruma içeride. Discrete köprü ancak çok büyük akımda.', en: 'Integrated H-bridge: DRV8833/DRV8871 for small motors, VNH5019 for big ones. Dead-time, current limit and thermal protection inside. A discrete bridge only for very high current.' }, link: ['topologies', 'examples'] },
    rB: { x: 90, y: 310, r: true, s: { tr: 'NPN + R_B', en: 'NPN + R_B' }, t: { tr: 'Low-side NPN (2N3904, BC337). β<sub>zorlanmış</sub> = 10–20, R<sub>B</sub> = (V<sub>OH</sub> − V<sub>BE(sat)</sub>)/I<sub>B</sub>, base pull-down 10 kΩ.', en: 'Low-side NPN (2N3904, BC337). β<sub>forced</sub> = 10–20, R<sub>B</sub> = (V<sub>OH</sub> − V<sub>BE(sat)</sub>)/I<sub>B</sub>, 10 kΩ base pull-down.' }, link: ['bjt-drive'] },
    rL: { x: 200, y: 460, r: true, s: { tr: 'Logic-level N-MOS', en: 'Logic-level N-MOS' }, t: { tr: 'GPIO → 47–100 Ω → logic-level N-MOS (AO3400A, IRLML6344), gate–source 10–100 kΩ pull-down. Sürücü gerekmez.', en: 'GPIO → 47–100 Ω → logic-level N-MOS (AO3400A, IRLML6344), 10–100 kΩ gate–source pull-down. No driver needed.' }, link: ['mosfet-drive'] },
    rD: { x: 420, y: 385, r: true, s: { tr: 'Gate driver', en: 'Gate driver' }, t: { tr: 'Low-side gate driver (UCC27517, TC4427) 5–12 V’tan; R<sub>G</sub> 5–22 Ω; sürücü MOSFET’in dibinde, kısa gate döngüsü.', en: 'Low-side gate driver (UCC27517, TC4427) from 5–12 V; R<sub>G</sub> 5–22 Ω; driver right at the MOSFET, short gate loop.' }, link: ['gate-drivers', 'mosfet-drive'] },
    rP: { x: 450, y: 310, r: true, s: { tr: 'P-MOS + NPN', en: 'P-MOS + NPN' }, t: { tr: 'High-side P-MOS + NPN seviye çevirici. V<sub>GS(max)</sub> için R1/R2 bölücü, inrush için gate–drain Miller kapasitörü.', en: 'High-side P-MOS + NPN level shifter. R1/R2 divider for V<sub>GS(max)</sub>, gate–drain Miller capacitor against inrush.' }, link: ['topologies', 'inrush'] },
    rHS: { x: 615, y: 310, r: true, s: { tr: 'High-side sürücü', en: 'High-side driver' }, t: { tr: 'High-side N-MOS + bootstrap ya da charge-pump sürücü, veya hazır akıllı high-side anahtar / eFuse (akım sınırı ve teşhis dahil).', en: 'High-side N-MOS with a bootstrap or charge-pump driver, or a ready-made smart high-side switch / eFuse (current limit and diagnostics included).' }, link: ['gate-drivers', 'overcurrent'] }
  };
  const EDGES = [
    ['q0', 'q1', 'M340,49V76', ''], ['q1', 'rH', 'M415,95H495', 'y'], ['q1', 'q2', 'M340,114V146', 'n'],
    ['q2', 'q3', 'M340,184V200H190V216', 'y'], ['q2', 'q6', 'M340,184V200H530V216', 'n'],
    ['q3', 'rB', 'M190,254V275H90V291', 'y'], ['q3', 'q4', 'M190,254V275H290V291', 'n'],
    ['q6', 'rP', 'M530,254V275H450V291', 'y'], ['q6', 'rHS', 'M530,254V275H615V291', 'n'],
    ['q4', 'rD', 'M290,329V350H420V366', 'y'], ['q4', 'q5', 'M290,329V350H200V366', 'n'],
    ['q5', 'rL', 'M200,404V441', 'y'], ['q5', 'rD', 'M275,385H345', 'n']
  ];
  const CH = { topologies: '07', examples: '14', 'bjt-drive': '05', 'mosfet-drive': '06', 'gate-drivers': '10', inrush: '11', overcurrent: '12', inductive: '08' };

  /* ---------- E series ---------- */
  const E = {
    E6: [1.0, 1.5, 2.2, 3.3, 4.7, 6.8],
    E12: [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2],
    E24: [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1],
    E96: Array.from({ length: 96 }, (_, i) => Math.round(Math.pow(10, i / 96) * 100) / 100)
  };

  App.page({
    id: 'reference',
    num: '16',
    group: { tr: 'Uygulama', en: 'Practice' },
    title: { tr: 'Hızlı başvuru', en: 'Quick reference' },
    blurb: { tr: 'Formüller, karar akışı, tipik parçalar, datasheet sözlüğü, E-serisi hesaplayıcı.', en: 'Formulas, decision flow, typical parts, datasheet glossary, E-series calculator.' },
    summary: {
      tr: 'Tezgâhta açık duracak sayfa. Formüller, “hangi anahtar?” akışı, parçalar, datasheet terimleri, E-serisi ve sözlük.',
      en: 'The page to keep open at the bench. Formulas, a “which switch?” flow, parts, datasheet terms, E-series and a glossary.'
    },
    render(L) {
      const t = App.t;
      const grp = (title, items) => `<div class="rgrp"><h4>${title}</h4>${items.map(i => `<div class="eq">${i[0]}${i[1] ? `<span class="note">${i[1]}</span>` : ''}</div>`).join('')}</div>`;
      const html = `
        <style>
          [data-page="reference"] .rgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr)); gap: 14px; margin: 14px 0; }
          [data-page="reference"] .rgrp { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); padding: 4px 14px 8px; min-width: 0; }
          [data-page="reference"] .rgrp h4 { margin-top: 10px; color: var(--copper); }
          [data-page="reference"] .rgrp .eq { font-size: .9rem; margin: 8px 0; padding: 8px 12px; }
          [data-page="reference"] .toc { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; }
          [data-page="reference"] .toc a { text-decoration: none; }
          [data-page="reference"] .fc-node rect { fill: var(--surface); stroke: var(--line); stroke-width: 1.5; transition: fill .25s, stroke .25s; }
          [data-page="reference"] .fc-node.res rect { fill: var(--panel); stroke-dasharray: 4 3; }
          [data-page="reference"] .fc-node text { fill: var(--ink-2); font: 500 13px var(--f-body); }
          [data-page="reference"] .fc-node.on rect { stroke: var(--copper); fill: var(--copper-soft); }
          [data-page="reference"] .fc-node.cur rect { stroke: var(--signal); stroke-width: 2.6; fill: var(--signal-soft); }
          [data-page="reference"] .fc-node.res.on rect { stroke: var(--ok); stroke-width: 2.6; stroke-dasharray: none; fill: var(--ok-soft); }
          [data-page="reference"] .fc-node.cur text, [data-page="reference"] .fc-node.on text { fill: var(--ink); font-weight: 600; }
          [data-page="reference"] .fc-edge { fill: none; stroke: var(--line); stroke-width: 1.6; }
          [data-page="reference"] .fc-edge.on { stroke: var(--copper); stroke-width: 2.6; stroke-dasharray: 7 5; animation: fetlabRefDash .8s linear infinite; }
          [data-page="reference"] .fc-yn { fill: var(--muted); font: 500 11.5px var(--f-mono); }
          [data-page="reference"] .fc-arr { fill: var(--line); }
          @keyframes fetlabRefDash { to { stroke-dashoffset: -24; } }
          [data-page="reference"] .fc-q { font-size: 1rem; color: var(--ink); min-height: 4.5em; }
          [data-page="reference"] .fc-btns { display: flex; gap: 8px; flex-wrap: wrap; }
          [data-page="reference"] .fc-trail { font: 500 .78rem var(--f-mono); color: var(--muted); }
          [data-page="reference"] .fc-res { border: 1px solid color-mix(in srgb, var(--ok) 50%, var(--line)); background: var(--ok-soft); border-radius: 8px; padding: 10px 12px; font-size: .9rem; }
          [data-page="reference"] .fc-res h4 { margin: 0 0 4px; color: var(--ok); }
          [data-page="reference"] .ref-in { width: 100%; font: 500 1rem var(--f-mono); padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); }
          [data-page="reference"] .es-tick { stroke: var(--muted); stroke-width: 1; }
          [data-page="reference"] .es-tick.hit { stroke: var(--ok); stroke-width: 3; }
          [data-page="reference"] .es-lab { fill: var(--muted); font: 500 10px var(--f-mono); }
          [data-page="reference"] .es-lab.hit { fill: var(--ok); font-weight: 600; }
          [data-page="reference"] .es-mk { fill: var(--copper); }
          [data-page="reference"] .es-axis { stroke: var(--ink-2); stroke-width: 1.5; }
          [data-page="reference"] .gl { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 10px; margin: 14px 0; }
          [data-page="reference"] .gl div { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); padding: 10px 14px; font-size: .88rem; color: var(--ink-2); }
          [data-page="reference"] .gl b { display: block; color: var(--ink); font-family: var(--f-display); font-size: 1rem; margin-bottom: 2px; }
          [data-page="reference"] td.k { font-family: var(--f-mono); white-space: nowrap; color: var(--copper); font-weight: 600; }
        </style>
        ${App.keys([
          L('Hangi anahtarı seçeceğinden emin değilsen karar akışıyla başla.', 'Not sure which switch? Start with the decision flow.'),
          L('Datasheet’te tipik değil, maksimum değerleri oku.', 'Read the max values in a datasheet, not the typical ones.'),
          L('Önce kaybı (P), sonra T<sub>j</sub>’yi hesapla.', 'Compute the loss (P) first, then T<sub>j</sub>.'),
          L('Hesaplanan direnci E-serisi aracıyla standart değere yuvarla.', 'Round a computed resistor to a standard value with the E-series tool.')
        ])}
        <nav class="toc">
          <a class="pill cu" href="#reference" data-jump="r-eq">${L('Formüller', 'Formulas')}</a>
          <a class="pill cu" href="#reference" data-jump="r-flow">${L('Karar akışı', 'Decision flow')}</a>
          <a class="pill cu" href="#reference" data-jump="r-parts">${L('Parçalar', 'Parts')}</a>
          <a class="pill cu" href="#reference" data-jump="r-ds">${L('Datasheet', 'Datasheet')}</a>
          <a class="pill cu" href="#reference" data-jump="r-es">${L('E-serisi', 'E-series')}</a>
          <a class="pill cu" href="#reference" data-jump="r-gl">${L('Sözlük', 'Glossary')}</a>
        </nav>

        <h2 id="r-eq">${L('Formüller', 'Formulas')}</h2>
        <div class="rgrid">
          ${grp(L('BJT sürme', 'BJT drive'), [
            ['I<sub>B</sub> = I<sub>C</sub> / β<sub>forced</sub>, &nbsp; β<sub>forced</sub> = 10…20', L('β<sub>forced</sub> ≤ h<sub>FE(min)</sub>/2 olsun; h<sub>FE</sub>’yi gerçek I<sub>C</sub>’de oku.', 'Keep β<sub>forced</sub> ≤ h<sub>FE(min)</sub>/2; read h<sub>FE</sub> at the real I<sub>C</sub>.')],
            ['R<sub>B</sub> = (V<sub>OH</sub> − V<sub>BE(sat)</sub>) / I<sub>B</sub>', L('V<sub>BE(sat)</sub> ≈ 0,75–0,9 V; V<sub>OH</sub> yük altında (3,3 V MCU’da ~3,1–3,2 V).', 'V<sub>BE(sat)</sub> ≈ 0.75–0.9 V; V<sub>OH</sub> under load (~3.1–3.2 V on a 3.3 V MCU).')],
            ['P<sub>Q</sub> = I<sub>C</sub>·V<sub>CE(sat)</sub>·D + I<sub>B</sub>·V<sub>BE(sat)</sub>', ''],
            ['R<sub>BE</sub> ≈ 10 kΩ → I<sub>çalınan</sub> = V<sub>BE</sub>/R<sub>BE</sub>'.replace('çalınan', L('çalınan', 'stolen')), L('Kesimde kaçak akımı boşaltır, boot’ta transistörü kapalı tutar.', 'Drains leakage in cutoff and holds the transistor off at boot.')]
          ])}
          ${grp(L('MOSFET sürme', 'MOSFET drive'), [
            ['V<sub>GS(drive)</sub> ≥ ' + L('R<sub>DS(on)</sub> spesifikasyon noktası', 'R<sub>DS(on)</sub> spec point'), L('V<sub>GS(th)</sub> değil! O yalnızca 250 µA’lik noktadır.', 'Not V<sub>GS(th)</sub>! That is only the 250 µA point.')],
            ['I<sub>G,peak</sub> = V<sub>drv</sub> / (R<sub>G</sub> + R<sub>drv</sub>)', ''],
            ['I<sub>G,on</sub> = (V<sub>drv</sub> − V<sub>pl</sub>)/R<sub>tot</sub> &nbsp; I<sub>G,off</sub> = V<sub>pl</sub>/R<sub>tot</sub>', L('V<sub>pl</sub>: Miller platosu (datasheet’teki gate charge eğrisi).', 'V<sub>pl</sub>: Miller plateau (from the gate-charge curve).')],
            ['t<sub>sw</sub> ≈ Q<sub>gd</sub> / I<sub>G</sub> &nbsp; t<sub>on,total</sub> ≈ Q<sub>g</sub> / I<sub>G</sub>', ''],
            ['P<sub>gate</sub> = Q<sub>g</sub> · V<sub>drv</sub> · f', L('Sürücüde ve R<sub>G</sub>’de harcanır, MOSFET’te değil.', 'Dissipated in the driver and R<sub>G</sub>, not in the MOSFET.')],
            ['V<sub>GS</sub> = V<sub>rail</sub> · R1/(R1 + R2)', L('P-MOS bölücüsü: |V<sub>GS</sub>| ≤ V<sub>GS(max)</sub>.', 'P-MOS divider: |V<sub>GS</sub>| ≤ V<sub>GS(max)</sub>.')]
          ])}
          ${grp(L('Anahtarlama', 'Switching'), [
            ['P<sub>sw</sub> ≈ ½ · V · I · (t<sub>r</sub> + t<sub>f</sub>) · f', L('Endüktif yükte (sert anahtarlama) geçerli kaba tahmin.', 'Rough estimate for hard-switched inductive loads.')],
            ['P<sub>Qrr</sub> ≈ Q<sub>rr</sub> · V · f &nbsp; P<sub>Coss</sub> ≈ ½ · C<sub>oss</sub> · V² · f', ''],
            ['(t<sub>r</sub> + t<sub>f</sub>) · f ≤ 0,01…0,02', L('Geçişler periyodun %1–2’sini geçmesin.', 'Keep transitions below 1–2 % of the period.')],
            ['bit = ⌊log<sub>2</sub>(f<sub>clk</sub> / f<sub>PWM</sub>)⌋', L('Ör. 80 MHz / 25 kHz → 11 bit.', 'E.g. 80 MHz / 25 kHz → 11 bit.')]
          ])}
          ${grp(L('Kayıplar', 'Losses'), [
            ['P<sub>cond</sub> = I<sub>rms</sub>² · R<sub>DS(on)</sub>(T<sub>j</sub>), &nbsp; I<sub>rms</sub> = I·√D', ''],
            ['R<sub>DS(on)</sub>(T) ≈ R<sub>25</sub> · (1 + α·(T − 25)), α ≈ 0,005…0,007 /°C', L('Kabaca 100 °C’de ×1,5, 150 °C’de ×1,7–1,9.', 'Roughly ×1.5 at 100 °C, ×1.7–1.9 at 150 °C.')],
            ['P<sub>BJT</sub> = I<sub>C</sub> · V<sub>CE(sat)</sub> · D', ''],
            ['P<sub>diode</sub> = V<sub>F</sub> · I · (1 − D)', L('Serbest dolaşım diyotu, kapalı süre boyunca.', 'Freewheeling diode, during the off time.')]
          ])}
          ${grp(L('Isıl', 'Thermal'), [
            ['T<sub>j</sub> = T<sub>a</sub> + P · R<sub>θJA</sub>', ''],
            ['R<sub>θJA</sub> = R<sub>θJC</sub> + R<sub>θCS</sub> + R<sub>θSA</sub>', L('Soğutuculu durumda seri ısıl dirençler.', 'Series thermal resistances with a heatsink.')],
            ['R<sub>θSA</sub> ≤ (T<sub>j,max</sub> − T<sub>a</sub>)/P − R<sub>θJC</sub> − R<sub>θCS</sub>', L('Gereken soğutucu. T<sub>j,max</sub> yerine 110–125 °C tasarım sınırı kullan.', 'Required heatsink. Use a 110–125 °C design limit instead of T<sub>j,max</sub>.')],
            ['ΔT<sub>pulse</sub> = P · Z<sub>θJC</sub>(t<sub>p</sub>, D)', L('Kısa darbeler için geçici ısıl empedans eğrisi.', 'Transient thermal impedance curve for short pulses.')]
          ])}
          ${grp(L('Endüktif yük', 'Inductive load'), [
            ['V = L · di/dt &nbsp; E = ½ · L · I² &nbsp; τ = L / R', ''],
            ['t<sub>off</sub> = τ · ln((I<sub>0</sub> + V<sub>c</sub>/R) / (I<sub>1</sub> + V<sub>c</sub>/R))', L('V<sub>c</sub>: kenetleme gerilimi (diyot ~0,8 V, diyot + zener V<sub>Z</sub> + 0,8 V).', 'V<sub>c</sub>: clamp voltage (diode ~0.8 V, diode + zener V<sub>Z</sub> + 0.8 V).')],
            ['V<sub>DS,peak</sub> = V<sub>supply</sub> + V<sub>c</sub> ≤ 0,8 · V<sub>DSS</sub>', ''],
            ['ΔI<sub>pp</sub> = V · D · (1 − D) / (L · f)', L('PWM’de akım dalgalanması (yavaş sönüm).', 'Current ripple under PWM (slow decay).')]
          ])}
          ${grp('Inrush', [
            ['I<sub>peak</sub> = V / (R<sub>src</sub> + R<sub>sw</sub> + ESR)', L('Boş kapasitör = kısa devre.', 'An empty capacitor is a short.')],
            ['I = C · dV/dt &nbsp; t<sub>ramp</sub> = C<sub>GD</sub> · V / I<sub>G</sub>', L('Miller kapasitörüyle yumuşak açılış.', 'Soft start with a Miller capacitor.')],
            ['E<sub>switch</sub> = ½ · C · V² (+ V·I<sub>load</sub>·t/6)', L('Şarj sırasında anahtarda yanan enerji, depolanan kadardır.', 'Energy burnt in the switch while charging equals the energy stored.')],
            ['R<sub>NTC,cold</sub> ≥ V<sub>peak</sub> / I<sub>max</sub>', '']
          ])}
          ${grp(L('Akım ölçme', 'Current sensing'), [
            ['R<sub>sense</sub> = V<sub>sense,FS</sub> / I<sub>max</sub>', L('Tipik V<sub>sense,FS</sub> = 50–100 mV.', 'Typical V<sub>sense,FS</sub> = 50–100 mV.')],
            ['P<sub>R</sub> = I<sup>2</sup> · R<sub>sense</sub>', L('Direnci gücünün yarısında kullan.', 'Use the resistor at half its power rating.')],
            ['V<sub>out</sub> = I · R<sub>sense</sub> · G', L('Akım algılama yükselteci (INA180, INA240); Kelvin bağlantı.', 'Current-sense amplifier (INA180, INA240); Kelvin connection.')],
            ['t<sub>trip</sub> ≤ ' + L('MOSFET SOA darbe süresi', 'MOSFET SOA pulse time'), L('Koruma, SOA eğrisindeki süreden hızlı kesmeli.', 'Protection must trip faster than the SOA curve allows.')]
          ])}
        </div>

        <h2 id="r-flow">${L('Karar akışı: hangi anahtar?', 'Decision flow: which switch?')}</h2>
        <p>${L('Soruları yanıtla; sonunda bir öneri ve ilgili bölümün bağlantısı çıkar. Seçtiğin yol diyagramda vurgulanır. Sınırlar kaba kurallardır, kesin değildir.',
               'Answer the questions; you end with a recommendation and a link to the chapter. Your path lights up in the diagram. The thresholds are rules of thumb, not hard limits.')}</p>
        ${App.lab('ref-flow', L('BJT mi MOSFET mi? Low-side mı high-side mı? Sürücü gerekli mi?', 'BJT or MOSFET? Low-side or high-side? Need a driver?'), { tag: L('Akış', 'Flow'), stack: true })}

        <h2 id="r-parts">${L('Tipik parçalar', 'Typical parts')}</h2>
        <p class="muted small">${L('Değerler tipik datasheet değerleridir (25 °C); üretici ve versiyona göre değişir. Tasarımdan önce kendi datasheet’ini oku.', 'Values are typical datasheet figures (25 °C) and vary by vendor and revision. Read your own datasheet before designing.')}</p>
        <div class="tabs" data-tabs>
          <div class="tab-btns">
            <button data-tab="bjt">BJT</button><button data-tab="nmos">N-MOS</button><button data-tab="pmos">P-MOS</button>
            <button data-tab="drv">${L('Gate driver', 'Gate drivers')}</button><button data-tab="hb">${L('H-köprü', 'H-bridge')}</button>
            <button data-tab="dio">${L('Diyotlar', 'Diodes')}</button><button data-tab="tvs">TVS</button>
          </div>
          <section data-panel="bjt"><div class="table-wrap"><table>
            <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Tip', 'Type')}</th><th class="num">V<sub>CEO</sub></th><th class="num">I<sub>C(max)</sub></th><th class="num">h<sub>FE</sub></th><th class="num">V<sub>CE(sat)</sub></th><th>${L('Not', 'Note')}</th></tr></thead>
            <tbody>
              <tr><td>BC547B</td><td>NPN</td><td class="num">45 V</td><td class="num">100 mA</td><td class="num">200–450</td><td class="num">0,2 V @ 100 mA</td><td>${L('LED, küçük röle', 'LEDs, small relays')}</td></tr>
              <tr><td>2N3904 / MMBT3904</td><td>NPN</td><td class="num">40 V</td><td class="num">200 mA</td><td class="num">100–300</td><td class="num">0,2 V @ 10 mA</td><td>${L('Genel amaçlı, SOT-23 versiyonu', 'General purpose, SOT-23 version')}</td></tr>
              <tr><td>2N2222A</td><td>NPN</td><td class="num">40 V</td><td class="num">600 mA</td><td class="num">100–300</td><td class="num">0,3 V @ 150 mA</td><td>${L('Orta akım', 'Medium current')}</td></tr>
              <tr><td>BC337-40</td><td>NPN</td><td class="num">45 V</td><td class="num">800 mA</td><td class="num">250–630</td><td class="num">0,7 V @ 500 mA</td><td>${L('Röle, buzzer', 'Relays, buzzers')}</td></tr>
              <tr><td>2N3906</td><td>PNP</td><td class="num">40 V</td><td class="num">200 mA</td><td class="num">100–300</td><td class="num">0,25 V @ 10 mA</td><td>${L('2N3904 eşi', '2N3904 complement')}</td></tr>
              <tr><td>BC327-40</td><td>PNP</td><td class="num">45 V</td><td class="num">800 mA</td><td class="num">250–630</td><td class="num">0,7 V @ 500 mA</td><td>${L('BC337 eşi', 'BC337 complement')}</td></tr>
              <tr><td>TIP120</td><td>${L('NPN Darlington', 'NPN Darlington')}</td><td class="num">60 V</td><td class="num">5 A</td><td class="num">≥ 1000</td><td class="num">2 V @ 3 A</td><td>${L('Yüksek düşüm! MOSFET tercih et', 'High drop! Prefer a MOSFET')}</td></tr>
              <tr><td>ULN2003A</td><td>${L('7× Darlington', '7× Darlington')}</td><td class="num">50 V</td><td class="num">500 mA/ch</td><td class="num">—</td><td class="num">~1 V @ 100 mA</td><td>${L('Dahili flyback diyotları, step motor/röle', 'Built-in flyback diodes, steppers/relays')}</td></tr>
            </tbody></table></div></section>
          <section data-panel="nmos"><div class="table-wrap"><table>
            <thead><tr><th>${L('Parça', 'Part')}</th><th class="num">V<sub>DSS</sub></th><th class="num">I<sub>D</sub></th><th class="num">R<sub>DS(on)</sub></th><th class="num">V<sub>GS(max)</sub></th><th>${L('Kılıf', 'Package')}</th><th>${L('Not', 'Note')}</th></tr></thead>
            <tbody>
              <tr><td>2N7002</td><td class="num">60 V</td><td class="num">0,2–0,3 A</td><td class="num">~2–5 Ω @ 4,5 V</td><td class="num">±20 V</td><td>SOT-23</td><td>${L('Sinyal, seviye çevirme, open-drain', 'Signals, level shifting, open-drain')}</td></tr>
              <tr><td>AO3400A</td><td class="num">30 V</td><td class="num">5,7 A</td><td class="num">32 mΩ @ 4,5 V · 48 mΩ @ 2,5 V</td><td class="num">±12 V</td><td>SOT-23</td><td>${L('3,3 V GPIO için ideal', 'Ideal for 3.3 V GPIO')}</td></tr>
              <tr><td>IRLML6344</td><td class="num">30 V</td><td class="num">5 A</td><td class="num">29 mΩ @ 4,5 V · 37 mΩ @ 2,5 V</td><td class="num">±12 V</td><td>SOT-23</td><td>${L('3,3 V GPIO için ideal', 'Ideal for 3.3 V GPIO')}</td></tr>
              <tr><td>IRLZ44N</td><td class="num">55 V</td><td class="num">47 A</td><td class="num">22 mΩ @ 10 V · 25 mΩ @ 5 V</td><td class="num">±16 V</td><td>TO-220</td><td>${L('5 V lojik; 3,3 V’ta garanti yok', '5 V logic; not guaranteed at 3.3 V')}</td></tr>
              <tr><td>FQP30N06L</td><td class="num">60 V</td><td class="num">32 A</td><td class="num">35 mΩ @ 10 V · 45 mΩ @ 5 V</td><td class="num">±20 V</td><td>TO-220</td><td>${L('5 V lojik, 24 V sistemler', '5 V logic, 24 V systems')}</td></tr>
            </tbody></table></div></section>
          <section data-panel="pmos"><div class="table-wrap"><table>
            <thead><tr><th>${L('Parça', 'Part')}</th><th class="num">V<sub>DSS</sub></th><th class="num">I<sub>D</sub></th><th class="num">R<sub>DS(on)</sub></th><th class="num">V<sub>GS(max)</sub></th><th>${L('Kılıf', 'Package')}</th><th>${L('Not', 'Note')}</th></tr></thead>
            <tbody>
              <tr><td>AO3401A</td><td class="num">−30 V</td><td class="num">−4 A</td><td class="num">60 mΩ @ −4,5 V · 85 mΩ @ −2,5 V</td><td class="num">±12 V</td><td>SOT-23</td><td>${L('12 V hatta bölücü şart', 'Divider required on 12 V')}</td></tr>
              <tr><td>IRLML6402</td><td class="num">−20 V</td><td class="num">−3,7 A</td><td class="num">65 mΩ @ −4,5 V</td><td class="num">±12 V</td><td>SOT-23</td><td>${L('Pil/5 V yük anahtarı', 'Battery/5 V load switch')}</td></tr>
              <tr><td>IRF9540N</td><td class="num">−100 V</td><td class="num">−23 A</td><td class="num">117 mΩ @ −10 V</td><td class="num">±20 V</td><td>TO-220</td><td>${L('Standart seviye, 10 V gate ister', 'Standard level, needs 10 V gate')}</td></tr>
            </tbody></table></div></section>
          <section data-panel="drv"><div class="table-wrap"><table>
            <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Tip', 'Type')}</th><th class="num">${L('Tepe akım', 'Peak current')}</th><th class="num">V<sub>DD</sub></th><th>${L('Giriş', 'Input')}</th><th>${L('Not', 'Note')}</th></tr></thead>
            <tbody>
              <tr><td>UCC27517</td><td>${L('Tek low-side', 'Single low-side')}</td><td class="num">4 A</td><td class="num">4,5–18 V</td><td>${L('TTL, 3,3 V uyumlu', 'TTL, 3.3 V OK')}</td><td>SOT-23-5</td></tr>
              <tr><td>TC4427</td><td>${L('Çift low-side', 'Dual low-side')}</td><td class="num">1,5 A</td><td class="num">4,5–18 V</td><td>V<sub>IH</sub> 2,4 V</td><td>DIP/SOIC-8</td></tr>
              <tr><td>IR2104</td><td>${L('Yarım köprü, bootstrap', 'Half-bridge, bootstrap')}</td><td class="num">0,21/0,36 A</td><td class="num">10–20 V</td><td>3,3 V ${L('uyumlu', 'compatible')}</td><td>${L('Sabit dead-time ~520 ns, 600 V', 'Fixed dead-time ~520 ns, 600 V')}</td></tr>
              <tr><td>IR2110</td><td>${L('High + low-side', 'High + low-side')}</td><td class="num">2 A</td><td class="num">10–20 V</td><td>${L('Lojik besleme ayrı', 'Separate logic supply')}</td><td>${L('Dead-time dışarıdan', 'Dead-time external')}</td></tr>
            </tbody></table></div></section>
          <section data-panel="hb"><div class="table-wrap"><table>
            <thead><tr><th>${L('Parça', 'Part')}</th><th class="num">${L('Besleme', 'Supply')}</th><th class="num">${L('Akım', 'Current')}</th><th>${L('Özellik', 'Features')}</th><th>${L('Not', 'Note')}</th></tr></thead>
            <tbody>
              <tr><td>DRV8833</td><td class="num">2,7–10,8 V</td><td class="num">1,5 A rms ×2</td><td>${L('Çift köprü, akım regülasyonu', 'Dual bridge, current regulation')}</td><td>${L('Küçük DC/step motor', 'Small DC/stepper')}</td></tr>
              <tr><td>TB6612FNG</td><td class="num">2,5–13,5 V</td><td class="num">1,2 A (3,2 A ${L('tepe', 'peak')}) ×2</td><td>${L('PWM ≤ 100 kHz', 'PWM ≤ 100 kHz')}</td><td>${L('Hobi robotları', 'Hobby robots')}</td></tr>
              <tr><td>DRV8871</td><td class="num">6,5–45 V</td><td class="num">3,6 A ${L('tepe', 'peak')}</td><td>${L('R<sub>ILIM</sub> ile akım sınırı', 'Current limit via R<sub>ILIM</sub>')}</td><td>${L('Tek motor, 2 pin kontrol', 'Single motor, 2-pin control')}</td></tr>
              <tr><td>VNH5019A-E</td><td class="num">5,5–24 V</td><td class="num">12 A</td><td>${L('CS çıkışı, PWM ≤ 20 kHz', 'CS output, PWM ≤ 20 kHz')}</td><td>${L('Büyük motorlar', 'Big motors')}</td></tr>
              <tr><td>L298N</td><td class="num">≤ 46 V</td><td class="num">2 A ×2</td><td>${L('Bipolar', 'Bipolar')}</td><td>${L('2–4 V düşüm; yeni tasarımda kaçın', '2–4 V drop; avoid in new designs')}</td></tr>
            </tbody></table></div></section>
          <section data-panel="dio"><div class="table-wrap"><table>
            <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Tip', 'Type')}</th><th class="num">V<sub>RRM</sub></th><th class="num">I<sub>F</sub></th><th class="num">V<sub>F</sub></th><th class="num">t<sub>rr</sub></th><th>${L('Kullanım', 'Use')}</th></tr></thead>
            <tbody>
              <tr><td>1N4148</td><td>${L('Sinyal', 'Signal')}</td><td class="num">100 V</td><td class="num">~0,15–0,3 A</td><td class="num">1 V @ 10 mA</td><td class="num">4 ns</td><td>${L('Küçük röle flyback', 'Small relay flyback')}</td></tr>
              <tr><td>1N4007</td><td>${L('Standart', 'Standard')}</td><td class="num">1000 V</td><td class="num">1 A</td><td class="num">1,1 V</td><td class="num">~µs</td><td>${L('Yalnız yavaş aç/kapa', 'Slow on/off only')}</td></tr>
              <tr><td>UF4007</td><td>${L('Ultra hızlı', 'Ultrafast')}</td><td class="num">1000 V</td><td class="num">1 A</td><td class="num">1,7 V</td><td class="num">75 ns</td><td>${L('Yüksek gerilim PWM', 'High-voltage PWM')}</td></tr>
              <tr><td>1N5819 / SS14</td><td>Schottky</td><td class="num">40 V</td><td class="num">1 A</td><td class="num">0,6 V</td><td class="num">≈ 0</td><td>${L('PWM flyback', 'PWM flyback')}</td></tr>
              <tr><td>SS34</td><td>Schottky</td><td class="num">40 V</td><td class="num">3 A</td><td class="num">0,5 V</td><td class="num">≈ 0</td><td>${L('Motor/LED PWM flyback', 'Motor/LED PWM flyback')}</td></tr>
              <tr><td>1N5355B</td><td>${L('Zener 5 W', 'Zener 5 W')}</td><td class="num">V<sub>Z</sub> 18 V</td><td class="num">—</td><td class="num">—</td><td class="num">—</td><td>${L('Hızlı bırakma kenetlemesi', 'Fast-release clamp')}</td></tr>
            </tbody></table></div></section>
          <section data-panel="tvs"><div class="table-wrap"><table>
            <thead><tr><th>${L('Seri', 'Series')}</th><th class="num">${L('Tepe güç', 'Peak power')}</th><th>${L('Kılıf', 'Package')}</th><th>${L('Örnek', 'Example')}</th><th>${L('Not', 'Note')}</th></tr></thead>
            <tbody>
              <tr><td>SMAJ</td><td class="num">400 W</td><td>SMA</td><td>SMAJ5.0A (USB 5 V)</td><td>${L('10/1000 µs darbe', '10/1000 µs pulse')}</td></tr>
              <tr><td>SMBJ</td><td class="num">600 W</td><td>SMB</td><td>${L('SMBJ15A (12 V), SMBJ28A (24 V)', 'SMBJ15A (12 V), SMBJ28A (24 V)')}</td><td>${L('V<sub>RWM</sub> ≥ en yüksek normal gerilim', 'V<sub>RWM</sub> ≥ highest normal voltage')}</td></tr>
              <tr><td>SMCJ</td><td class="num">1500 W</td><td>SMC</td><td>SMCJ33A</td><td>${L('Otomotiv/endüstriyel giriş', 'Automotive/industrial input')}</td></tr>
              <tr><td>P6KE</td><td class="num">600 W</td><td>DO-15</td><td>P6KE33A</td><td>${L('Delikli montaj', 'Through-hole')}</td></tr>
            </tbody></table></div>
            <p class="small muted">${L('Kenetleme gerilimi V<sub>C</sub> (I<sub>PP</sub>’de) V<sub>RWM</sub>’den ~%60 yüksektir; korunan parçanın sınırının altında kalmalı.', 'The clamping voltage V<sub>C</sub> (at I<sub>PP</sub>) is ~60 % above V<sub>RWM</sub>; it must stay below the protected part’s rating.')}</p></section>
        </div>

        <h2 id="r-ds">${L('Datasheet parametre sözlüğü', 'Datasheet parameter glossary')}</h2>
        <div class="table-wrap"><table>
          <thead><tr><th>${L('Parametre', 'Parameter')}</th><th>${L('Anlamı', 'Meaning')}</th><th>${L('Neye bak?', 'What to check')}</th></tr></thead>
          <tbody>${[
            ['V<sub>DSS</sub>', L('Drain–source kırılma gerilimi (gate kısa).', 'Drain–source breakdown voltage (gate shorted).'), L('Besleme + endüktif tepe + dalgalanma ≤ %80’i.', 'Supply + inductive spike + surges ≤ 80 % of it.')],
            ['I<sub>D</sub>', L('Sürekli drain akımı; çoğunlukla T<sub>C</sub> = 25 °C ve sonsuz soğutucuyla.', 'Continuous drain current, usually at T<sub>C</sub> = 25 °C with an infinite heatsink.'), L('Pazarlama rakamı; gerçek sınır ısıldır: I²·R<sub>DS(on)</sub>·R<sub>θ</sub>.', 'A marketing number; the real limit is thermal: I²·R<sub>DS(on)</sub>·R<sub>θ</sub>.')],
            ['I<sub>DM</sub>', L('Darbe drain akımı (kısa, düşük duty).', 'Pulsed drain current (short, low duty).'), L('Inrush ve kısa devre tepeleri bunun ve SOA’nın altında mı?', 'Are inrush and short-circuit peaks below this and inside the SOA?')],
            ['R<sub>DS(on)</sub>', L('Tam açıkken drain–source direnci; belirli V<sub>GS</sub> ve T<sub>j</sub>’de.', 'Drain–source resistance when fully on, at a given V<sub>GS</sub> and T<sub>j</sub>.'), L('Senin V<sub>GS</sub>’inde <b>maks.</b> değer; sıcaklık çarpanı eğrisi.', 'The <b>max</b> value at your V<sub>GS</sub>; the temperature factor curve.')],
            ['V<sub>GS(th)</sub>', L('250 µA (tipik) drain akımı için gereken gate gerilimi.', 'Gate voltage for 250 µA (typ.) of drain current.'), L('Min değeri gürültü bağışıklığı için; tam açılma ölçüsü değil.', 'The min value for noise immunity; not a “fully on” measure.')],
            ['V<sub>GS(max)</sub>', L('Gate oksidinin dayanabileceği en yüksek gerilim.', 'Maximum voltage the gate oxide survives.'), L('Sürücü gerilimi + çınlama tepeleri bunun altında.', 'Drive voltage plus ringing peaks below it.')],
            ['Q<sub>g</sub>', L('Gate’i hedef V<sub>GS</sub>’e getirmek için toplam yük.', 'Total charge to bring the gate to the target V<sub>GS</sub>.'), L('Sürme gücü Q<sub>g</sub>·V·f ve açılma süresi Q<sub>g</sub>/I<sub>G</sub>.', 'Drive power Q<sub>g</sub>·V·f and turn-on time Q<sub>g</sub>/I<sub>G</sub>.')],
            ['Q<sub>gs</sub> / Q<sub>gd</sub>', L('Plato öncesi yük / Miller (gate–drain) yükü.', 'Charge before the plateau / Miller (gate–drain) charge.'), L('Q<sub>gd</sub> anahtarlama kaybını belirler: t<sub>sw</sub> ≈ Q<sub>gd</sub>/I<sub>G</sub>.', 'Q<sub>gd</sub> sets switching loss: t<sub>sw</sub> ≈ Q<sub>gd</sub>/I<sub>G</sub>.')],
            ['C<sub>iss</sub>', L('Giriş kapasitansı C<sub>gs</sub> + C<sub>gd</sub> (V<sub>DS</sub>’e bağlı).', 'Input capacitance C<sub>gs</sub> + C<sub>gd</sub> (depends on V<sub>DS</sub>).'), L('RC hızı için kaba ölçü; hesapta Q<sub>g</sub> daha güvenilir.', 'Rough measure for RC speed; Q<sub>g</sub> is more reliable for calculations.')],
            ['C<sub>oss</sub> / C<sub>rss</sub>', L('Çıkış kapasitansı / ters transfer (Miller) kapasitansı.', 'Output capacitance / reverse transfer (Miller) capacitance.'), L('½·C<sub>oss</sub>·V²·f kaybı; C<sub>rss</sub> dV/dt ile sahte açılma.', '½·C<sub>oss</sub>·V²·f loss; C<sub>rss</sub> causes dV/dt false turn-on.')],
            ['t<sub>d(on)</sub>, t<sub>r</sub>, t<sub>d(off)</sub>, t<sub>f</sub>', L('Gecikme ve geçiş süreleri; belirli R<sub>G</sub> ve sürücüyle ölçülmüş.', 'Delay and transition times, measured with a specific R<sub>G</sub> and driver.'), L('Test koşuluna bak; senin R<sub>G</sub>’n büyükse süreler orantılı uzar.', 'Check the test condition; with a bigger R<sub>G</sub> times scale up.')],
            ['E<sub>AS</sub> / I<sub>AR</sub>', L('Tek darbe çığ enerjisi / tekrarlı çığ akımı.', 'Single-pulse avalanche energy / repetitive avalanche current.'), L('Kenetlemesiz endüktif yükte ½LI² ≤ E<sub>AS</sub> (pay ile). Tercihen hiç dayanma.', 'For an unclamped inductive load ½LI² ≤ E<sub>AS</sub> (with margin). Better not to rely on it.')],
            ['R<sub>θJA</sub>', L('Jonksiyondan ortama ısıl direnç (belirli PCB bakırıyla).', 'Junction-to-ambient thermal resistance (with a specific PCB copper area).'), L('Test PCB’si seninkine benziyor mu? Küçük bakır = daha yüksek.', 'Does the test PCB resemble yours? Less copper = higher.')],
            ['R<sub>θJC</sub>', L('Jonksiyondan kılıfa (tab) ısıl direnç.', 'Junction-to-case (tab) thermal resistance.'), L('Soğutuculu tasarımda R<sub>θCS</sub> + R<sub>θSA</sub> ile topla.', 'Add R<sub>θCS</sub> + R<sub>θSA</sub> when heatsinking.')],
            ['SOA', L('Güvenli çalışma alanı: V<sub>DS</sub>–I<sub>D</sub> düzleminde, darbe süresine göre.', 'Safe operating area: in the V<sub>DS</sub>–I<sub>D</sub> plane, per pulse length.'), L('Lineer çalışma, yumuşak açılış, kısa devre süresi bunun içinde mi? DC eğrisi çoğu zaman yoktur.', 'Are linear operation, soft start and short-circuit time inside it? A DC curve is often missing.')],
            ['V<sub>SD</sub>, t<sub>rr</sub>, Q<sub>rr</sub>', L('Body diyotu ileri gerilimi ve ters toparlanması.', 'Body-diode forward voltage and reverse recovery.'), L('Yarım köprüde body diyotu iletiyorsa Q<sub>rr</sub> kaybı ve EMI.', 'If the body diode conducts in a half-bridge: Q<sub>rr</sub> loss and EMI.')],
            ['h<sub>FE</sub>', L('BJT DC akım kazancı I<sub>C</sub>/I<sub>B</sub>; geniş aralık.', 'BJT DC current gain I<sub>C</sub>/I<sub>B</sub>; a wide range.'), L('Gerçek I<sub>C</sub>’deki <b>minimum</b>; yüksek akımda düşer.', 'The <b>minimum</b> at your real I<sub>C</sub>; it falls at high current.')],
            ['V<sub>CE(sat)</sub>', L('Doyumda C–E gerilimi; zorlanmış β = 10 ile ölçülür.', 'C–E voltage in saturation, measured at forced β = 10.'), L('Kayıp I<sub>C</sub>·V<sub>CE(sat)</sub>; senin β’n 10’dan büyükse daha yüksek.', 'Loss I<sub>C</sub>·V<sub>CE(sat)</sub>; higher if your β is above 10.')],
            ['V<sub>BE(sat)</sub>', L('Doyumda B–E gerilimi (~0,75–0,9 V).', 'B–E voltage in saturation (~0.75–0.9 V).'), L('R<sub>B</sub> hesabında bunu kullan, 0,7 V değil.', 'Use this in the R<sub>B</sub> calculation, not 0.7 V.')],
            ['V<sub>CEO</sub>', L('Base açıkken C–E kırılma gerilimi.', 'C–E breakdown with the base open.'), L('Endüktif tepe dahil V<sub>CE</sub> bunun altında.', 'V<sub>CE</sub> including inductive spikes stays below it.')],
            ['I<sub>CBO</sub>', L('Collector–base kaçak akımı; her ~10 °C’de ikiye katlanır.', 'Collector–base leakage; doubles every ~10 °C.'), L('Sıcakta base pull-down bu akımı boşaltmalı.', 'When hot, the base pull-down must drain it.')],
            ['t<sub>s</sub>', L('Depolama zamanı: doyumdan çıkış gecikmesi.', 'Storage time: delay coming out of saturation.'), L('Aşırı base sürüşü t<sub>s</sub>’yi uzatır; PWM frekansını sınırlar.', 'Overdriving the base lengthens t<sub>s</sub>; it limits PWM frequency.')],
            ['T<sub>j(max)</sub> / P<sub>tot</sub>', L('En yüksek jonksiyon sıcaklığı / T<sub>C</sub> = 25 °C’deki kayıp sınırı.', 'Maximum junction temperature / dissipation limit at T<sub>C</sub> = 25 °C.'), L('P<sub>tot</sub> gerçekçi değildir; T<sub>j</sub>’yi kendi R<sub>θ</sub>’nla hesapla.', 'P<sub>tot</sub> is unrealistic; compute T<sub>j</sub> with your own R<sub>θ</sub>.')]
          ].map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>

        <h2 id="r-es">${L('Standart direnç değerleri', 'Standard resistor values')}</h2>
        <div class="table-wrap"><table>
          <thead><tr><th>${L('Seri', 'Series')}</th><th>${L('Tolerans', 'Tolerance')}</th><th>${L('Değerler (her dekat)', 'Values (each decade)')}</th></tr></thead>
          <tbody>
            <tr><td class="k">E6</td><td>±20 %</td><td class="mono">${E.E6.map(v => App.num(v, 1)).join(' · ')}</td></tr>
            <tr><td class="k">E12</td><td>±10 %</td><td class="mono">${E.E12.map(v => App.num(v, 1)).join(' · ')}</td></tr>
            <tr><td class="k">E24</td><td>±5 %</td><td class="mono">${E.E24.map(v => App.num(v, 1)).join(' · ')}</td></tr>
            <tr><td class="k">E96</td><td>±1 %</td><td class="small">${L('96 değer, 10<sup>i/96</sup> üç haneye yuvarlanmış (1,00 · 1,02 · 1,05 · 1,07 …)', '96 values, 10<sup>i/96</sup> rounded to three digits (1.00 · 1.02 · 1.05 · 1.07 …)')}</td></tr>
          </tbody></table></div>
        ${App.lab('ref-es', L('En yakın E-serisi değeri', 'Nearest E-series value'), {
          tag: L('Hesap', 'Calc'),
          foot: L('Giriş örnekleri: 4k7, 4,7k, 4700, 2R2, 1M, 330. Sağdaki kombinasyonlar seçilen serideki iki direnci seri ya da paralel bağlayarak hedefe daha çok yaklaşır.',
                  'Input examples: 4k7, 4.7k, 4700, 2R2, 1M, 330. The combinations use two resistors from the chosen series in series or in parallel to get closer to the target.')
        })}

        <h2 id="r-gl">${L('Terimler sözlüğü', 'Glossary of terms')}</h2>
        <div class="gl">${[
          ['Inrush', L('Açılış anındaki büyük akım darbesi, örneğin boş bir kapasitörü doldururken.', 'The large current surge at switch-on, for example into an empty capacitor.'), 'inrush'],
          [L('Aşırı akım (overcurrent)', 'Overcurrent'), L('Tasarım sınırının üstündeki akım; sigorta, eFuse ya da firmware keser.', 'Current above the design limit; a fuse, eFuse or firmware cuts it.'), 'overcurrent'],
          ['Shoot-through', L('Yarım köprüde iki anahtarın birlikte iletip beslemeyi kısa devre etmesi.', 'Both switches of a half-bridge conducting together and shorting the supply.'), 'gate-drivers'],
          ['Dead-time', L('Bir anahtar kapandıktan sonra diğeri açılmadan önceki boşluk.', 'The gap between one switch turning off and the other turning on.'), 'gate-drivers'],
          ['Bootstrap', L('High-side N-MOS gate’ini source’un üstüne çıkaran, diyotla dolan kapasitör.', 'A diode-charged capacitor that lifts a high-side N-MOS gate above its source.'), 'gate-drivers'],
          [L('Miller platosu', 'Miller plateau'), L('Geçişte V<sub>GS</sub>’in düz kaldığı, gate akımının C<sub>gd</sub>’yi doldurduğu bölge.', 'The flat V<sub>GS</sub> step where gate current charges C<sub>gd</sub> during a transition.'), 'switching'],
          [L('Çığ (avalanche)', 'Avalanche'), L('V<sub>DSS</sub> aşılınca jonksiyonun kırılıp iletmesi; sınırı E<sub>AS</sub>’dir.', 'The junction breaking down above V<sub>DSS</sub>; its limit is E<sub>AS</sub>.'), 'inductive'],
          ['SOA', L('Parçanın güvenle çalıştığı gerilim–akım–süre bölgesi.', 'The voltage–current–time region where the part operates safely.'), 'thermal'],
          ['Flyback', L('Endüktif yük kesilince oluşan gerilim sıçraması ve onu kenetleyen diyot.', 'The voltage kick when an inductive load is cut, and the diode that clamps it.'), 'inductive'],
          [L('Serbest dolaşım (freewheeling)', 'Freewheeling'), L('Anahtar kapalıyken bobin akımının bir diyot üzerinden dönmeye devam etmesi.', 'Inductor current that keeps flowing through a diode while the switch is off.'), 'inductive'],
          ['UVLO', L('Besleme düşükken sürücü çıkışını kapalı tutan kilit.', 'A lock-out that holds the driver output off while its supply is low.'), 'gate-drivers'],
          ['Slew rate (dV/dt, di/dt)', L('Gerilim ya da akımın değişim hızı; hızlısı az kayıp ama çok EMI demektir.', 'How fast voltage or current changes; faster means less loss but more EMI.'), 'switching'],
          [L('Çınlama (ringing)', 'Ringing'), L('Parazitik L ve C’nin yaptığı zayıf sönümlü salınım.', 'A lightly damped oscillation of parasitic L and C.'), 'switching'],
          ['Hot-swap', L('Canlı hatta kart takıp çıkarmayı güvenli yapan inrush denetleyicisi.', 'An inrush controller that makes plugging boards into a live rail safe.'), 'inrush'],
          ['eFuse', L('Akım sınırı ve yumuşak açılışı tek kılıfta yapan elektronik sigorta.', 'An electronic fuse with current limit and soft start in one package.'), 'overcurrent'],
          ['Kelvin source', L('Gate dönüşü için ayrı source pini; güç akımını gate döngüsünden ayırır.', 'A separate source pin for the gate return; keeps power current out of the gate loop.'), 'gate-drivers'],
          ['Body diode', L('MOSFET içindeki source→drain diyotu; ters akımı her zaman iletir.', 'The built-in source→drain diode of a MOSFET; it always conducts reverse current.'), 'mosfet'],
          ['Logic-level', L('R<sub>DS(on)</sub>’u 4,5 V ya da 2,5 V gibi düşük V<sub>GS</sub>’te garanti edilen MOSFET.', 'A MOSFET with R<sub>DS(on)</sub> guaranteed at a low V<sub>GS</sub>, such as 4.5 V or 2.5 V.'), 'mosfet-drive'],
          ['Open-drain', L('Yalnızca aşağı çeken çıkış; yüksek seviyeyi pull-up verir.', 'An output that only pulls low; a pull-up provides the high level.'), 'mcu-io'],
          [L('Seviye çevirici', 'Level shifter'), L('Kontrol sinyalini başka bir gerilim seviyesine taşıyan devre.', 'A circuit that moves a control signal to another voltage level.'), 'topologies'],
          [L('Zıt EMK (back-EMF)', 'Back-EMF'), L('Dönen motorun ürettiği, hızla orantılı gerilim; duran motorda sıfırdır.', 'The speed-proportional voltage of a spinning motor; zero at standstill.'), 'loads'],
          ['Brown-out', L('Beslemenin MCU’nun güvenli eşiğinin altına düşüp reset yaratması.', 'The supply dipping below the MCU’s safe threshold and causing a reset.'), 'mcu-io'],
          [L('Zorlanmış β', 'Forced beta'), L('Doyum için bilerek seçilen küçük I<sub>C</sub>/I<sub>B</sub> oranı, genelde 10–20.', 'The small I<sub>C</sub>/I<sub>B</sub> ratio chosen for saturation, usually 10–20.'), 'bjt-drive'],
          [L('Ters toparlanma', 'Reverse recovery'), L('Kesime geçen diyotun kısa süre ters akım iletmesi (t<sub>rr</sub>, Q<sub>rr</sub>).', 'A diode briefly conducting in reverse as it turns off (t<sub>rr</sub>, Q<sub>rr</sub>).'), 'switching'],
          ['Charge pump', L('Beslemenin üstünde gerilim üreten kapasitörlü devre; %100 duty high-side sürüş sağlar.', 'A capacitor circuit that makes a voltage above the supply; enables 100 % duty high-side drive.'), 'gate-drivers'],
          [L('Low-side / high-side', 'Low-side / high-side'), L('Anahtar yük ile toprak arasında / besleme ile yük arasında.', 'Switch between load and ground / between supply and load.'), 'topologies']
        ].map(g => `<div><b>${g[0]}</b>${g[1]} <a href="#${g[2]}">→</a></div>`).join('')}</div>`;
      return App.lang === 'en' ? html.replace(/(\d),(\d)/g, '$1.$2') : html;
    },

    mount(root, App) {
      const { Viz } = App, { UI } = Viz, L = App.L, t = App.t;

      /* in-page jumps (hash is used by the router) */
      root.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        const el = root.querySelector('#' + a.dataset.jump);
        if (el) el.scrollIntoView({ behavior: App.reducedMotion ? 'auto' : 'smooth' });
      }));

      /* ---------------- decision flow ---------------- */
      {
        const lab = root.querySelector('#ref-flow');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const W = 700, H = 490, NW = 150, NH = 38;
        const edgeSvg = EDGES.map((e, i) => {
          const [, , d, yn] = e;
          const end = d.match(/([\d.]+),?([\d.]*)$/);
          void end;
          return `<path class="fc-edge" id="fe${i}" d="${d}" marker-end="url(#fcArr)"/>`;
        }).join('');
        const ynSvg = EDGES.map(e => {
          const [, to, , yn] = e;
          if (!yn) return '';
          const N = NODES[to];
          const horiz = e[2].indexOf('V') === -1;
          const x = horiz ? (parseFloat(e[2].slice(1)) + 6) : N.x + 6;
          const y = horiz ? N.y - 6 : N.y - NH / 2 - 6;
          return `<text class="fc-yn" x="${x}" y="${y}">${yn === 'y' ? L('evet', 'yes') : L('hayır', 'no')}</text>`;
        }).join('');
        const nodeSvg = Object.keys(NODES).map(k => {
          const N = NODES[k], w = N.r ? NW : NW;
          return `<g class="fc-node${N.r ? ' res' : ''}" id="fn-${k}"><rect x="${N.x - w / 2}" y="${N.y - NH / 2}" width="${w}" height="${NH}" rx="${N.r ? 10 : 6}"/><text x="${N.x}" y="${N.y + 4}" text-anchor="middle">${t(N.s).replace('R_DS(on)', 'R DS(on)')}</text></g>`;
        }).join('');
        const svg = Viz.schematic(fig, W, H, `
          <defs><marker id="fcArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="fc-arr" d="M0,0L10,5L0,10Z"/></marker></defs>
          ${edgeSvg}${ynSvg}${nodeSvg}`);
        const qEl = App.h('div', { class: 'fc-q' });
        const btns = App.h('div', { class: 'fc-btns' });
        const trail = App.h('div', { class: 'fc-trail' });
        const nav = App.h('div', { class: 'fc-btns' });
        ctl.append(qEl, btns, trail, nav);
        let path = ['q0'], inductive = null, flows = [];
        const edgeIdx = (a, b) => EDGES.findIndex(e => e[0] === a && e[1] === b);
        function draw() {
          flows.forEach(f => { f.stop(); f.g.remove(); f.path.remove(); });
          flows = [];
          svg.querySelectorAll('.fc-node').forEach(g => g.classList.remove('on', 'cur'));
          svg.querySelectorAll('.fc-edge').forEach(g => g.classList.remove('on'));
          path.forEach((k, i) => {
            const g = svg.querySelector('#fn-' + k);
            g.classList.add(i === path.length - 1 && !NODES[k].r ? 'cur' : 'on');
            if (i > 0) {
              const ei = edgeIdx(path[i - 1], k);
              if (ei >= 0) {
                svg.querySelector('#fe' + ei).classList.add('on');
                flows.push(new Viz.Flow(svg, EDGES[ei][2], { spacing: 14, speed: 60, r: 3 }));
              }
            }
          });
          const cur = NODES[path[path.length - 1]];
          btns.innerHTML = ''; nav.innerHTML = '';
          trail.textContent = path.map(k => t(NODES[k].s)).join(' → ');
          if (!cur.r) {
            qEl.innerHTML = `<b>${L('Soru', 'Question')} ${path.length}.</b> ${t(cur.q)}`;
            UI.button(btns, { label: L('Evet', 'Yes'), kind: 'primary', onClick: () => answer(true) });
            UI.button(btns, { label: L('Hayır', 'No'), onClick: () => answer(false) });
          } else {
            const links = cur.link.map(id => `<a href="#${id}">${L('Bölüm', 'Chapter')} ${CH[id]}</a>`).join(' · ');
            let extra = '';
            if (inductive) extra = cur === NODES.rH
              ? `<p>${L('Endüktif yük: köprünün body diyotları akımı döndürür; beslemeye TVS ve yeterli kapasitör koy (frenleme enerjisi).', 'Inductive load: the bridge body diodes carry the freewheel current; add a TVS and enough capacitance on the supply (braking energy).')} <a href="#inductive">${L('Bölüm', 'Chapter')} 08</a></p>`
              : `<p>${L('<b>+ Flyback:</b> yükün uçlarına diyot (PWM’de Schottky); hızlı bırakma için diyot + zener.', '<b>+ Flyback:</b> a diode across the load (Schottky for PWM); diode + zener for fast release.')} <a href="#inductive">${L('Bölüm', 'Chapter')} 08</a></p>`;
            qEl.innerHTML = `<div class="fc-res"><h4>${t(cur.s)}</h4><p>${t(cur.t)}</p>${extra}<p>${links}</p></div>`;
          }
          if (path.length > 1) UI.button(nav, { label: '← ' + L('Geri', 'Back'), onClick: () => { const k = path.pop(); if (k === 'q1' || path.length === 1) inductive = null; draw(); } });
          UI.button(nav, { label: L('Baştan', 'Restart'), onClick: () => { path = ['q0']; inductive = null; draw(); } });
          if (App.lang === 'en') qEl.innerHTML = qEl.innerHTML.replace(/(\d),(\d)/g, '$1.$2');
        }
        function answer(yes) {
          const k = path[path.length - 1], N = NODES[k];
          if (N.flag) inductive = yes;
          path.push(yes ? N.yes : N.no);
          draw();
        }
        draw();
      }

      /* ---------------- E-series calculator ---------------- */
      {
        const lab = root.querySelector('#ref-es');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const W = 600, H = 150, X0 = 30, X1 = 570;
        const xOf = m => X0 + (X1 - X0) * Math.log10(m);
        const svg = Viz.schematic(fig, W, H, `<line class="es-axis" x1="${X0}" x2="${X1}" y1="80" y2="80"/><g id="esT"></g>
          <path id="esMk" class="es-mk" d="M0,0l-8,-14h16z"/><text id="esMkT" class="sch-t cu big" text-anchor="middle" y="40"></text>`);
        const tg = svg.querySelector('#esT'), mk = svg.querySelector('#esMk'), mkT = svg.querySelector('#esMkT');
        const comb = App.h('div');
        fig.appendChild(comb);
        const lbl = App.h('label', { class: 'ctl-label' }, `<span>${L('Hedef direnç', 'Target resistance')}</span>`);
        const inp = App.h('input', { type: 'text', class: 'ref-in', inputmode: 'decimal', value: '4k7', 'aria-label': L('Hedef direnç', 'Target resistance') });
        const wrap = App.h('div', { class: 'ctl' }); wrap.append(lbl, inp); ctl.appendChild(wrap);
        const sl = UI.slider(ctl, { label: L('ya da kaydır', 'or slide'), min: 1, max: 1e7, step: 0.01, value: 4700, log: true, unit: 'Ω', onInput: v => { inp.value = fmtR(v); calc(v); } });
        const seg = UI.segmented(ctl, { label: L('Seri', 'Series'), options: ['E6', 'E12', 'E24', 'E96'].map(s => ({ value: s, label: s })), value: 'E12', onChange: () => calc(cur) });
        const ro = UI.readouts(ctl, [
          { key: 'n', label: L('En yakın', 'Nearest') }, { key: 'lo', label: L('Alt', 'Below') }, { key: 'hi', label: L('Üst', 'Above') },
          { key: 'e', label: L('Hata', 'Error') }
        ]);
        function fmtR(v) { return App.si(v, 'Ω', 3); }
        function parse(s) {
          s = String(s).trim().replace(/\s|Ω|ohm/gi, '').replace(',', '.');
          const m = s.match(/^(\d*\.?\d*)([rRkKmM]?)(\d*)$/);
          if (!m || (m[1] === '' && m[3] === '')) return NaN;
          const mult = { '': 1, r: 1, R: 1, k: 1e3, K: 1e3, m: 1e6, M: 1e6 }[m[2]];
          const num = m[3] ? parseFloat((m[1] || '0') + '.' + m[3]) : parseFloat(m[1]);
          return num * mult;
        }
        let cur = 4700, mkX = xOf(4.7);
        function near(v, ser) {
          const dec = Math.floor(Math.log10(v)), base = Math.pow(10, dec);
          const cands = [];
          [-1, 0, 1].forEach(o => ser.forEach(m => cands.push(+(m * base * Math.pow(10, o)).toPrecision(4))));
          cands.sort((a, b) => a - b);
          let lo = cands[0], hi = cands[cands.length - 1];
          cands.forEach(c => { if (c <= v * (1 + 1e-9)) lo = c; });
          for (let i = cands.length - 1; i >= 0; i--) if (cands[i] >= v * (1 - 1e-9)) hi = cands[i];
          const n = Math.abs(Math.log(v / lo)) <= Math.abs(Math.log(hi / v)) ? lo : hi;
          return { lo, hi, n, cands };
        }
        function calc(v) {
          if (!isFinite(v) || v <= 0) { ro.set('n', L('geçersiz', 'invalid'), 'bad'); return; }
          cur = v;
          const ser = E[seg.value], r = near(v, ser);
          const err = (r.n - v) / v * 100;
          ro.set('n', fmtR(r.n), 'ok'); ro.set('lo', fmtR(r.lo)); ro.set('hi', fmtR(r.hi));
          ro.set('e', (err >= 0 ? '+' : '') + App.num(err, 2) + ' %', Math.abs(err) > 5 ? 'warn' : 'ok');
          // decade scale
          const mant = v / Math.pow(10, Math.floor(Math.log10(v)));
          const nm = r.n / Math.pow(10, Math.floor(Math.log10(v)));
          const showLab = ser.length <= 24;
          tg.innerHTML = ser.map(m => {
            const hit = Math.abs(m - nm) < 1e-6 || Math.abs(m * 10 - nm) < 1e-6;
            return `<line class="es-tick${hit ? ' hit' : ''}" x1="${xOf(m)}" x2="${xOf(m)}" y1="${hit ? 64 : 72}" y2="88"/>` + (showLab || hit ? `<text class="es-lab${hit ? ' hit' : ''}" x="${xOf(m)}" y="${hit ? 108 : 102}" text-anchor="middle">${App.num(m, m * 10 % 1 === 0 && ser.length <= 24 ? 1 : 2)}</text>` : '');
          }).join('') + `<line class="es-tick" x1="${X1}" x2="${X1}" y1="72" y2="88"/><text class="es-lab" x="${X1}" y="102" text-anchor="middle">10</text>`;
          mkT.textContent = fmtR(v);
          mk.dataset.tx = xOf(Math.min(mant, 9.999));
          // two-resistor combinations
          const cs = r.cands.concat(r.cands.map(c => c * 10));
          let bs = null, bp = null;
          for (let i = 0; i < cs.length; i++) for (let j = i; j < cs.length; j++) {
            const a = cs[i], b = cs[j];
            const s = a + b, p = a * b / (a + b);
            if (!bs || Math.abs(s - v) < Math.abs(bs[2] - v)) bs = [a, b, s];
            if (!bp || Math.abs(p - v) < Math.abs(bp[2] - v)) bp = [a, b, p];
          }
          const e1 = (bs[2] - v) / v * 100, e2 = (bp[2] - v) / v * 100;
          comb.innerHTML = `<div class="readouts">
            <div class="ro"><dt>${L('Seri çift', 'Series pair')}</dt><dd>${fmtR(bs[0])} + ${fmtR(bs[1])} = ${fmtR(bs[2])} (${(e1 >= 0 ? '+' : '') + App.num(e1, 2)} %)</dd></div>
            <div class="ro"><dt>${L('Paralel çift', 'Parallel pair')}</dt><dd>${fmtR(bp[0])} ∥ ${fmtR(bp[1])} = ${fmtR(bp[2])} (${(e2 >= 0 ? '+' : '') + App.num(e2, 2)} %)</dd></div></div>`;
        }
        inp.addEventListener('input', () => { const v = parse(inp.value); if (isFinite(v) && v > 0) { sl.set(App.clamp(v, 1, 1e7), true); } calc(v); });
        App.onFrame(dt => {
          const tx = parseFloat(mk.dataset.tx || mkX);
          mkX += (tx - mkX) * Math.min(1, dt * (App.reducedMotion ? 60 : 8));
          mk.setAttribute('transform', `translate(${mkX.toFixed(1)},62)`);
          mkT.setAttribute('x', App.clamp(mkX, 60, 540).toFixed(1));
        });
        calc(4700);
      }
    }
  });
})();
