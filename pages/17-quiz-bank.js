/* 17 — Quiz question bank (data only; the engine is pages/17-quiz.js).
   Every question:
     id, topic (chapter id), lvl 'b' | 'i' | 'a' (basic / intermediate / advanced), type, q, ex
     q / ex / option texts: ['türkçe', 'english'] or a function (p, L) → string (p = generated values).
   Types:
     mc     opts: [[tr, en, correct?], …]                     (options shuffled)
     tf     ans: true | false                                  (ex = one-line justification)
     num    gen(r) → p, ans(p) → number in `unit`, tol (fraction, 0 = integer)
     part   parts: [ids from App.Parts], judge(m, Parts) → {ok, tr, en}; exactly one ok; spec(m, Parts) optional
     spot   fig(el, p, H) schematic + opts naming the elements
     scope  fig(el, p, H) Viz.Scope trace + either opts (choice) or ans/unit/tol (read a value)
     multi  opts: [[tr, en, correct?, whyTr, whyEn], …]          (all-or-nothing)
     order  items: [[tr, en], …] in the right order              (shown shuffled)
   Values are checked against the chapters and App.Parts. */
(function () {
  'use strict';
  const App = window.App;

  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  // compact number, language-aware decimal separator
  const nn = (v, sig) => { const s = String(Number(Number(v).toPrecision(sig || 3))); return App.lang === 'tr' ? s.replace('.', ',') : s; };
  const mo = v => nn(v * 1000, 3);   // Ω → mΩ text

  /* ---------- figure helpers (called at render time) ---------- */
  function sch(el, w, h, inner) { return App.Viz.schematic(el, w, h, inner); }
  function scope(el, o, traces, status) {
    const sc = new App.Viz.Scope(el, Object.assign({ w: 600, h: 260, trig: false }, o));
    Object.keys(traces).forEach(k => sc.trace(k, traces[k]));
    if (status) sc.status(status);
    return sc;
  }
  const samp = (f, a, b, n) => App.Viz.sample(f, a, b, n || 400);
  const tag = (S, x, y, s) => S.text(x, y, s, 'cu big', 'middle');

  /* ---------- part-pick helpers ---------- */
  // fail list → judge result
  function verdict(fails, okTr, okEn) {
    if (!fails.length) return { ok: true, tr: okTr, en: okEn };
    return { ok: false, tr: fails.map(f => f[0]).join(' · '), en: fails.map(f => f[1]).join(' · ') };
  }
  const specFrom = m => Math.min(m.p[0][0], m.p[1][0]);  // lowest V_GS with a datasheet R_DS(on)

  const Q = [

    /* =================== 01 · loads =================== */
    { id: 'led', topic: 'loads', lvl: 'b', type: 'num', unit: 'Ω', tol: 0.05,
      gen: r => ({ v: pick(r, [5, 12]), vf: pick(r, [2.0, 2.1, 3.0, 3.2]), i: pick(r, [10, 15, 20]) }),
      q: (p, L) => L(`${p.v} V’tan bir LED (V<sub>F</sub> = ${nn(p.vf)} V) ${p.i} mA ile sürülecek. Anahtar düşümünü ihmal et. Seri direnç kaç ohm?`, `An LED (V<sub>F</sub> = ${nn(p.vf)} V) is driven at ${p.i} mA from ${p.v} V. Ignore the switch drop. Series resistor in ohms?`),
      ans: p => (p.v - p.vf) / (p.i / 1000),
      ex: (p, L) => L(`R = (V − V<sub>F</sub>) / I = (${p.v} − ${nn(p.vf)}) / ${p.i} mA = ${nn((p.v - p.vf) / p.i * 1000)} Ω.`, `R = (V − V<sub>F</sub>) / I = (${p.v} − ${nn(p.vf)}) / ${p.i} mA = ${nn((p.v - p.vf) / p.i * 1000)} Ω.`) },
    { id: 'stall', topic: 'loads', lvl: 'b', type: 'num', unit: 'A', tol: 0.03,
      gen: r => ({ v: pick(r, [12, 24]), r: pick(r, [0.8, 1.2, 2, 4]) }),
      q: (p, L) => L(`Sargı direnci ${nn(p.r)} Ω olan ${p.v} V’luk DC motor kalkış anında (zıt EMK = 0) kaç amper çeker?`, `A ${p.v} V DC motor has ${nn(p.r)} Ω winding resistance. How many amps at start-up (back-EMF = 0)?`),
      ans: p => p.v / p.r,
      ex: (p, L) => L(`I<sub>stall</sub> = V / R = ${p.v} / ${nn(p.r)} = ${nn(p.v / p.r)} A. Bu akım her kalkışta kısa süre akar.`, `I<sub>stall</sub> = V / R = ${p.v} / ${nn(p.r)} = ${nn(p.v / p.r)} A. It flows briefly at every start.`) },
    { id: 'rms', topic: 'loads', lvl: 'i', type: 'num', unit: 'A', tol: 0.03,
      gen: r => ({ i: pick(r, [2, 4, 5, 8, 10]), d: pick(r, [0.25, 0.36, 0.49, 0.64]) }),
      q: (p, L) => L(`PWM, %${Math.round(p.d * 100)} doluluk oranıyla dirençli bir yükü anahtarlıyor. Açıkken akım ${p.i} A. MOSFET’i ısıtan RMS akım kaç amper?`, `PWM switches a resistive load at ${Math.round(p.d * 100)} % duty. The on-current is ${p.i} A. What RMS current heats the MOSFET, in amps?`),
      ans: p => p.i * Math.sqrt(p.d),
      ex: (p, L) => L(`I<sub>RMS</sub> = I · √D = ${p.i} · √${nn(p.d)} = ${nn(p.i * Math.sqrt(p.d))} A. Ortalama akım yalnızca ${nn(p.i * p.d)} A; ısınmayı RMS belirler.`, `I<sub>RMS</sub> = I · √D = ${p.i} · √${nn(p.d)} = ${nn(p.i * Math.sqrt(p.d))} A. The average is only ${nn(p.i * p.d)} A; RMS sets the heating.`) },
    { id: 'pwmloss', topic: 'loads', lvl: 'i', type: 'tf', ans: true,
      q: ['Açık akımı sabitken %50 PWM’de MOSFET’in iletim kaybı, sürekli açık durumdakinin yarısıdır.', 'With a fixed on-current, a MOSFET’s conduction loss at 50 % PWM is half of its always-on loss.'],
      ex: ['Doğru. P = I<sub>RMS</sub>² · R = I² · D · R; yani kayıp D ile orantılıdır. Anahtarlama kaybı buna ayrıca eklenir.', 'True. P = I<sub>RMS</sub>² · R = I² · D · R, so the loss scales with D. Switching loss comes on top.'] },
    { id: 'lamp', topic: 'loads', lvl: 'b', type: 'mc',
      q: ['12 V / 21 W akkor lamba. Anahtar açılış anında yaklaşık hangi tepe akıma dayanmalı?', 'A 12 V / 21 W incandescent lamp. Roughly what peak current must the switch survive at switch-on?'],
      opts: [['1,75 A', '1.75 A'], ['3,5 A', '3.5 A'], ['≈ 20 A, 10–100 ms boyunca', '≈ 20 A for 10–100 ms', 1], ['0,2 A', '0.2 A']],
      ex: ['Sürekli akım 21 W / 12 V = 1,75 A. Soğuk flaman sıcak direncinin ~1/10–1/15’i olduğundan ilk anda ~18–26 A akar.', 'Steady current is 21 W / 12 V = 1.75 A. A cold filament has ~1/10–1/15 of its hot resistance, so ~18–26 A flows at first.'] },
    { id: 'vmargin', topic: 'loads', lvl: 'b', type: 'mc',
      q: ['24 V’luk dirençli bir yük için MOSFET’in V<sub>DS</sub> değeri en az ne olmalı?', 'For a 24 V resistive load, what V<sub>DS</sub> rating should the MOSFET have at least?'],
      opts: [['25 V', '25 V'], ['30 V', '30 V'], ['40–60 V', '40–60 V', 1], ['200 V', '200 V']],
      ex: ['Gerilimde 1,5–2 kat pay bırak: 24 V × 1,5–2 = 36–48 V, yani 40 V ya da 60 V’luk parça. Endüktif yükte kenetleme gerilimine göre seç.', 'Leave 1.5–2× voltage margin: 24 V × 1.5–2 = 36–48 V, so a 40 V or 60 V part. With inductive loads, size for the clamp voltage.'] },

    /* =================== 02 · bjt =================== */
    { id: 'par', topic: 'bjt', lvl: 'i', type: 'mc',
      q: ['Paralel BJT’lerin emitter’larına neden küçük dirençler konur?', 'Why do paralleled BJTs get small emitter resistors?'],
      opts: [['Base akımını azaltmak için', 'To reduce base current'],
        ['Isınan transistörün akımı çekip ısıl kaçağa girmesini önlemek için (V<sub>BE</sub> −2 mV/°C)', 'To stop the hotter transistor hogging current and running away (V<sub>BE</sub> −2 mV/°C)', 1],
        ['Anahtarlama hızını artırmak için', 'To increase switching speed'], ['Flyback enerjisini emmek için', 'To absorb flyback energy']],
      ex: ['R<sub>E</sub> negatif geri besleme yapar. Fazla akım çeken transistörün V<sub>BE</sub>’si azalır ve akımlar dengelenir.', 'R<sub>E</sub> adds negative feedback. The transistor drawing more current loses V<sub>BE</sub>, so the currents balance.'] },
    { id: 'bjtreg', topic: 'bjt', lvl: 'b', type: 'mc',
      q: ['12 V’luk bir yükü süren NPN anahtarda yük akımı akarken V<sub>CE</sub> = 6 V ölçülüyor. Transistör hangi bölgede?', 'An NPN switch drives a 12 V load and V<sub>CE</sub> = 6 V while current flows. Which region is the transistor in?'],
      opts: [['Kesim', 'Cutoff'], ['Doyum', 'Saturation'], ['Aktif bölge: yetersiz base akımı, transistör ısınır', 'Active region: too little base current, the transistor heats', 1], ['Ters aktif', 'Reverse active']],
      ex: ['Doyumda V<sub>CE</sub> 0,05–0,3 V’a iner. 6 V düşüm aktif bölge demektir: kayıp V<sub>CE</sub> · I<sub>C</sub>, base akımını artır.', 'In saturation V<sub>CE</sub> falls to 0.05–0.3 V. A 6 V drop means the active region: loss is V<sub>CE</sub> · I<sub>C</sub>, so raise the base current.'] },
    { id: 'hfetyp', topic: 'bjt', lvl: 'b', type: 'tf', ans: false,
      q: ['Parçaların çoğu tipik değere yakın olduğu için base direncini tipik h<sub>FE</sub> ile hesaplamak yeterlidir.', 'Most parts are close to typical, so sizing the base resistor with typical h<sub>FE</sub> is fine.'],
      ex: ['Yanlış. h<sub>FE</sub> parçadan parçaya 2–3 kat, akım ve sıcaklıkla da değişir. Minimum değerle hesapla.', 'False. h<sub>FE</sub> spreads 2–3× between parts and also varies with current and temperature. Design with the minimum.'] },
    { id: 'gatedc', topic: 'bjt', lvl: 'b', type: 'tf', ans: false,
      q: ['MOSFET, BJT’nin base’i gibi açık kalmak için gate’ine sürekli akım ister.', 'Like a BJT base, a MOSFET gate needs a continuous current to stay on.'],
      ex: ['Yanlış. Gate bir kondansatördür: akım yalnızca şarj ve deşarjda akar. BJT ise açık kaldığı sürece I<sub>B</sub> ister.', 'False. The gate is a capacitor: current flows only while charging and discharging. A BJT needs I<sub>B</sub> for as long as it is on.'] },
    { id: 'bjtloss', topic: 'bjt', lvl: 'i', type: 'num', unit: 'W', tol: 0.05,
      gen: r => ({ ic: pick(r, [0.2, 0.3, 0.5]), vs: pick(r, [0.2, 0.3]) }),
      q: (p, L) => L(`Doymuş NPN: I<sub>C</sub> = ${nn(p.ic * 1000)} mA, V<sub>CE(sat)</sub> = ${nn(p.vs)} V, I<sub>B</sub> = I<sub>C</sub>/10, V<sub>BE(sat)</sub> = 0,85 V. Transistördeki toplam kayıp kaç watt?`, `Saturated NPN: I<sub>C</sub> = ${nn(p.ic * 1000)} mA, V<sub>CE(sat)</sub> = ${nn(p.vs)} V, I<sub>B</sub> = I<sub>C</sub>/10, V<sub>BE(sat)</sub> = 0.85 V. Total transistor loss in watts?`),
      ans: p => p.ic * p.vs + p.ic / 10 * 0.85,
      ex: (p, L) => L(`P = V<sub>CE</sub>·I<sub>C</sub> + V<sub>BE</sub>·I<sub>B</sub> = ${nn(p.ic * p.vs)} + ${nn(p.ic * 0.085)} = ${nn(p.ic * p.vs + p.ic * 0.085)} W. Base kaybı küçük ama sıfır değil.`, `P = V<sub>CE</sub>·I<sub>C</sub> + V<sub>BE</sub>·I<sub>B</sub> = ${nn(p.ic * p.vs)} + ${nn(p.ic * 0.085)} = ${nn(p.ic * p.vs + p.ic * 0.085)} W. The base loss is small but not zero.`) },
    { id: 'pk-buzz', topic: 'bjt', lvl: 'b', type: 'part',
      q: ['Low-side anahtar: 5 V buzzer, 30 mA. GPIO en fazla 1 mA base akımı verebilir (zorlanmış β = 30). V<sub>CE(sat)</sub> ≤ 0,3 V olmalı. Hangi transistör?', 'Low-side switch: 5 V buzzer, 30 mA. The GPIO can give at most 1 mA of base current (forced β = 30). V<sub>CE(sat)</sub> must be ≤ 0.3 V. Which transistor?'],
      parts: ['BC547B', 'BD139', 'TIP120', 'BC557B'],
      spec: (m, P) => [`${m.type === 'N' ? 'NPN' : 'PNP'}${m.darl ? ' Darlington' : ''}`, m.pkg, `I<sub>C</sub> ${nn(m.ic)} A`, `h<sub>FE(min)</sub> @ 30 mA ≈ ${Math.round(P.hfe(m, 0.03, true))}`, `V<sub>CE(sat)</sub> ≈ ${nn(P.vcesat(m, 0.03), 2)} V`],
      judge: (m, P) => {
        const f = [], h = P.hfe(m, 0.03, true), vs = P.vcesat(m, 0.03);
        if (m.type !== 'N') f.push(['PNP low-side’da çalışmaz', 'a PNP does not work low-side']);
        if (h / 2 < 30) f.push([`h<sub>FE(min)</sub>/2 = ${Math.round(h / 2)} < 30`, `h<sub>FE(min)</sub>/2 = ${Math.round(h / 2)} < 30`]);
        if (vs > 0.3) f.push([`V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`, `V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`]);
        return verdict(f, `h<sub>FE(min)</sub>/2 = ${Math.round(h / 2)} ≥ 30, V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`, `h<sub>FE(min)</sub>/2 = ${Math.round(h / 2)} ≥ 30, V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`);
      },
      ex: ['Küçük sinyal BC547B 30 mA’de bol kazançla doyar. BD139’un kazancı düşük, TIP120 Darlington olduğu için ~0,8 V düşürür.', 'The small-signal BC547B saturates at 30 mA with gain to spare. The BD139 has too little gain; the TIP120 is a Darlington and drops ~0.8 V.'] },

    /* =================== 03 · mosfet =================== */
    { id: 'logic', topic: 'mosfet', lvl: 'i', type: 'mc',
      q: ['3,3 V GPIO ile doğrudan sürülecek bir MOSFET’in datasheet’inde hangi bilgi işin garantisidir?', 'Which datasheet item guarantees that a MOSFET works driven directly by a 3.3 V GPIO?'],
      opts: [['V<sub>GS(th)</sub> &lt; 3,3 V olması', 'V<sub>GS(th)</sub> &lt; 3.3 V'],
        ['R<sub>DS(on)</sub>’un 3,3 V ya da daha düşük V<sub>GS</sub>’te (ör. 2,5 V) belirtilmiş olması', 'R<sub>DS(on)</sub> specified at V<sub>GS</sub> = 3.3 V or lower (e.g. 2.5 V)', 1],
        ['I<sub>D</sub> değerinin yük akımından büyük olması', 'I<sub>D</sub> larger than the load current'], ['V<sub>GS(max)</sub> ≥ 3,3 V olması', 'V<sub>GS(max)</sub> ≥ 3.3 V']],
      ex: ['V<sub>GS(th)</sub> yalnızca ~250 µA’in aktığı gerilimdir. Tam açılmayı ancak o gerilimde garanti edilen R<sub>DS(on)</sub> gösterir.', 'V<sub>GS(th)</sub> is only where ~250 µA flows. Only an R<sub>DS(on)</sub> guaranteed at that voltage proves the part is fully on.'] },
    { id: 'mosreg', topic: 'mosfet', lvl: 'b', type: 'mc',
      q: ['MOSFET datasheet’indeki “doyum (saturation)” bölgesi bir anahtar için ne demektir?', 'What does the MOSFET “saturation” region mean for a switch?'],
      opts: [['Tam açık, en düşük direnç', 'Fully on, lowest resistance'], ['Akım V<sub>GS</sub> ile sınırlı, V<sub>DS</sub> büyük: MOSFET ısınır', 'Current is limited by V<sub>GS</sub>, V<sub>DS</sub> is large: the MOSFET heats', 1],
        ['Gate oksidi delinmiş', 'The gate oxide has broken down'], ['Body diyot iletimde', 'The body diode conducts']],
      ex: ['BJT’nin tersine MOSFET’te “doyum” akım sınırlı bölgedir. Anahtar ohmik (lineer) bölgede çalışmalı.', 'Unlike a BJT, MOSFET “saturation” is the current-limited region. A switch must work in the ohmic (linear) region.'] },
    { id: 'body', topic: 'mosfet', lvl: 'i', type: 'mc',
      q: ['Tek bir N-MOS neden akımı iki yönde de kesemez?', 'Why can a single N-MOS not block current in both directions?'],
      opts: [['Gate iki yönde de iletir', 'The gate conducts both ways'], ['Body diyotu source’tan drain’e iletir; V<sub>DS</sub> negatif olunca akım geçer', 'Its body diode conducts from source to drain whenever V<sub>DS</sub> goes negative', 1],
        ['R<sub>DS(on)</sub> yönü değiştirir', 'R<sub>DS(on)</sub> changes direction'], ['Kesimde kanal ters iletir', 'The channel conducts backwards when off']],
      ex: ['Body ile source birbirine bağlıdır, bu yüzden source–drain arasında bir diyot oluşur. İki yönlü kesmek için iki MOSFET sırt sırta konur.', 'Body and source are tied together, which forms a diode from source to drain. Blocking both ways needs two MOSFETs back to back.'] },
    { id: 'vthdef', topic: 'mosfet', lvl: 'b', type: 'mc',
      q: ['Datasheet: V<sub>GS(th)</sub> = 1,0–2,5 V @ I<sub>D</sub> = 250 µA. Bu ne demektir?', 'Datasheet: V<sub>GS(th)</sub> = 1.0–2.5 V @ I<sub>D</sub> = 250 µA. What does it mean?'],
      opts: [['Bu gerilimde MOSFET tam açılır', 'At this voltage the MOSFET is fully on'], ['Bu gerilimde yalnızca 250 µA akar; MOSFET zar zor açıktır', 'At this voltage only 250 µA flows; the MOSFET is barely on', 1],
        ['Gate’e uygulanabilecek en yüksek gerilimdir', 'It is the highest allowed gate voltage'], ['Body diyotun ileri gerilimidir', 'It is the body diode forward voltage']],
      ex: ['Eşik, iletimin başladığı noktadır. Tam açılma için R<sub>DS(on)</sub> satırındaki V<sub>GS</sub> gerekir.', 'The threshold is where conduction starts. Fully on needs the V<sub>GS</sub> from the R<sub>DS(on)</sub> row.'] },
    { id: 'floatg', topic: 'mosfet', lvl: 'b', type: 'tf', ans: true,
      q: ['Boşta bırakılmış (bağlantısız) bir MOSFET gate’i, MOSFET’i kendiliğinden açabilir.', 'A floating (unconnected) MOSFET gate can turn the MOSFET on by itself.'],
      ex: ['Doğru. Gate kapasitansı kaçak ve C<sub>gd</sub> kuplajıyla dolar; MOSFET yarı açılıp ısınabilir. Gate–source arasına 10–100 kΩ koy.', 'True. The gate capacitance charges through leakage and C<sub>gd</sub> coupling; the MOSFET can half-open and heat. Fit 10–100 kΩ gate to source.'] },
    { id: 'm-ledreq', topic: 'mosfet', lvl: 'i', type: 'multi',
      q: ['12 V / 3 A LED şerit, 3,3 V GPIO’dan low-side N-MOS ile sürülecek. MOSFET’te hangileri <b>gerekli</b>? (hepsini seç)', 'A 12 V / 3 A LED strip is switched low-side from a 3.3 V GPIO with an N-MOS. Which are <b>required</b>? (select all)'],
      opts: [['R<sub>DS(on)</sub> ≤ 3,3 V’ta (ör. 2,5 V) belirtilmiş', 'R<sub>DS(on)</sub> specified at ≤ 3.3 V (e.g. 2.5 V)', 1, 'Tam açılmanın tek garantisi.', 'The only guarantee of full turn-on.'],
        ['V<sub>DS</sub> değeri 12 V’un üstünde, payla (20–30 V)', 'V<sub>DS</sub> rating above 12 V with margin (20–30 V)', 1, 'Besleme ve dalgalanmalar için pay.', 'Margin for the supply and transients.'],
        ['Paketin R<sub>θ</sub>’sı I²·R kaybını taşıyabiliyor', 'The package R<sub>θ</sub> can handle the I²·R loss', 1, 'T<sub>j</sub> = T<sub>a</sub> + P·R<sub>θ</sub> sınırda kalmalı.', 'T<sub>j</sub> = T<sub>a</sub> + P·R<sub>θ</sub> must stay in limits.'],
        ['V<sub>GS(max)</sub> ≥ 20 V', 'V<sub>GS(max)</sub> ≥ 20 V', 0, 'Gate yalnızca 3,3 V görür; ±12 V yeter.', 'The gate only sees 3.3 V; ±12 V is plenty.'],
        ['P-kanal olması', 'Being P-channel', 0, 'Low-side için N-kanal gerekir.', 'Low-side needs an N-channel.']],
      ex: ['Low-side’da gate yalnızca GPIO gerilimini görür. Önemli olan düşük V<sub>GS</sub>’te garanti R<sub>DS(on)</sub>, gerilim payı ve ısı.', 'Low-side, the gate only sees the GPIO voltage. What matters is R<sub>DS(on)</sub> guaranteed at low V<sub>GS</sub>, voltage margin and heat.'] },

    /* =================== 04 · mcu-io =================== */
    { id: 'ipk', topic: 'mcu-io', lvl: 'b', type: 'num', unit: 'mA', tol: 0.05,
      gen: r => ({ r: pick(r, [22, 33, 47, 68, 100, 220]) }),
      q: (p, L) => L(`3,3 V GPIO, ${p.r} Ω gate direnci üzerinden boş bir gate’i şarj ediyor. Pin direncini ihmal et: tepe akım kaç mA?`, `A 3.3 V GPIO charges an empty gate through ${p.r} Ω. Ignoring the pin resistance, what is the peak current in mA?`),
      ans: p => 3.3 / p.r * 1000,
      ex: (p, L) => L(`I = V / R = 3,3 / ${p.r} = ${nn(3300 / p.r)} mA. Pinin ~25–50 Ω iç direnci bunu biraz düşürür.`, `I = V / R = 3.3 / ${p.r} = ${nn(3300 / p.r)} mA. The pin’s ~25–50 Ω output resistance lowers it somewhat.`) },
    { id: 'bits', topic: 'mcu-io', lvl: 'i', type: 'num', unit: 'bit', tol: 0,
      gen: r => ({ f: pick(r, [1, 5, 20, 25, 40]) }),
      q: (p, L) => L(`Zamanlayıcı saati 80 MHz. ${p.f} kHz PWM’de en fazla kaç bit çözünürlük olur? (tam sayı)`, `Timer clock is 80 MHz. At ${p.f} kHz PWM, what is the maximum resolution in bits? (integer)`),
      ans: p => Math.floor(Math.log2(80e6 / (p.f * 1e3))),
      ex: (p, L) => L(`80 MHz / ${p.f} kHz = ${80000 / p.f} adım → ⌊log<sub>2</sub>⌋ = ${Math.floor(Math.log2(80000 / p.f))} bit.`, `80 MHz / ${p.f} kHz = ${80000 / p.f} counts → ⌊log<sub>2</sub>⌋ = ${Math.floor(Math.log2(80000 / p.f))} bits.`) },
    { id: 'ledpin', topic: 'mcu-io', lvl: 'i', type: 'num', unit: 'mA', tol: 0.05,
      gen: r => ({ vf: pick(r, [1.8, 2.0, 2.2]), r: pick(r, [68, 100, 150, 220]) }),
      q: (p, L) => L(`3,3 V pin (iç direnci ≈ 40 Ω) ${p.r} Ω üzerinden bir LED (V<sub>F</sub> = ${nn(p.vf)} V) sürüyor. LED akımı kaç mA?`, `A 3.3 V pin (≈ 40 Ω output resistance) drives an LED (V<sub>F</sub> = ${nn(p.vf)} V) through ${p.r} Ω. LED current in mA?`),
      ans: p => (3.3 - p.vf) / (p.r + 40) * 1000,
      ex: (p, L) => L(`I = (3,3 − ${nn(p.vf)}) / (${p.r} + 40) = ${nn((3.3 - p.vf) / (p.r + 40) * 1000)} mA. Pin direnci 3,3 V’ta küçük dirençlerle belirgin fark yaratır.`, `I = (3.3 − ${nn(p.vf)}) / (${p.r} + 40) = ${nn((3.3 - p.vf) / (p.r + 40) * 1000)} mA. At 3.3 V the pin resistance matters with small resistors.`) },
    { id: 'pd', topic: 'mcu-io', lvl: 'b', type: 'mc',
      q: ['Her gate’e neden 10–100 kΩ pull-down konur?', 'Why does every gate get a 10–100 kΩ pull-down?'],
      opts: [['Gate akımını artırmak için', 'To increase gate current'], ['Reset ve boot sırasında pin boştadır; pull-down MOSFET’i kapalı tutar', 'Pins float during reset and boot; the pull-down keeps the MOSFET off', 1],
        ['Flyback enerjisini emmek için', 'To absorb flyback energy'], ['PWM frekansını ayarlamak için', 'To set the PWM frequency']],
      ex: ['Reset’te GPIO yüksek empedanslıdır. Pull-down olmadan yük açılışta rastgele çalışabilir.', 'During reset a GPIO is high-impedance. Without a pull-down the load may switch on randomly at power-up.'] },
    { id: 'pinlim', topic: 'mcu-io', lvl: 'b', type: 'mc',
      q: ['ATmega328P (Arduino Uno) pin başına önerilen sürekli akım nedir?', 'What is the recommended continuous current per pin on an ATmega328P (Arduino Uno)?'],
      opts: [['2 mA', '2 mA'], ['20 mA (mutlak sınır 40 mA)', '20 mA (absolute limit 40 mA)', 1], ['200 mA', '200 mA'], ['1 A', '1 A']],
      ex: ['20 mA hedefle; 40 mA mutlak sınırdır. Tüm pinlerin toplamı da V<sub>CC</sub>/GND sınırını (200 mA) aşmamalı.', 'Aim for 20 mA; 40 mA is the absolute limit. All pins together must also stay below the V<sub>CC</sub>/GND limit (200 mA).'] },
    { id: 'relaypin', topic: 'mcu-io', lvl: 'b', type: 'tf', ans: false,
      q: ['5 V MCU’da 70 mA’lik 5 V röle bobini doğrudan GPIO pinine bağlanabilir.', 'On a 5 V MCU, a 70 mA 5 V relay coil can hang directly on a GPIO pin.'],
      ex: ['Yanlış. 70 mA pin sınırını (20/40 mA) aşar ve bobinin flyback yolu yoktur. Araya transistör ve diyot koy.', 'False. 70 mA exceeds the pin limit (20/40 mA) and the coil has no flyback path. Use a transistor and a diode.'] },
    { id: 'unpow', topic: 'mcu-io', lvl: 'i', type: 'mc',
      q: ['Beslemesi kapalı bir çipin girişine 3,3 V sinyal verilirse ne olur?', 'What happens if a 3.3 V signal drives an input of a chip whose supply is off?'],
      opts: [['Hiçbir şey, giriş yüksek empedanslıdır', 'Nothing, the input is high-impedance'], ['Akım ESD koruma diyotundan V<sub>DD</sub>’ye akar ve çipi yarı besler', 'Current flows through the ESD clamp diode into V<sub>DD</sub> and half-powers the chip', 1],
        ['Sinyal 0 V’a kenetlenir ve kaybolur', 'The signal clamps to 0 V and disappears'], ['Çip otomatik olarak uyanır ve normal çalışır', 'The chip wakes up and runs normally']],
      ex: ['Giriş, V<sub>DD</sub>’ye bir diyotla bağlıdır. Bu “arka besleme” latch-up’a ve garip resetlere yol açar.', 'Each input has a diode to V<sub>DD</sub>. This back-powering causes latch-up and odd resets.'] },
    { id: 'seriesr', topic: 'mcu-io', lvl: 'i', type: 'mc',
      q: ['GPIO ile gate arasındaki 47–220 Ω seri direncin görevi nedir?', 'What is the 47–220 Ω series resistor between GPIO and gate for?'],
      opts: [['Gate’i kapalı tutmak', 'To keep the gate off'], ['Tepe pin akımını sınırlamak ve gate çınlamasını sönümlemek', 'To limit peak pin current and damp gate ringing', 1],
        ['V<sub>GS</sub>’i yükseltmek', 'To raise V<sub>GS</sub>'], ['Body diyotu korumak', 'To protect the body diode']],
      ex: ['Boş gate anlık kısa devredir; seri R tepe akımı sınırlar. Ayrıca kablo endüktansıyla oluşan LC çınlamasını sönümler.', 'An empty gate is momentarily a short; the series R limits the peak. It also damps LC ringing with the wire inductance.'] },

    /* =================== 04b · outputs =================== */
    { id: 'i2cmin', topic: 'outputs', lvl: 'i', type: 'num', unit: 'Ω', tol: 0.05,
      gen: r => ({ v: pick(r, [3.3, 5]) }),
      q: (p, L) => L(`I²C (standart/hızlı mod): pull-up ${nn(p.v)} V’a, V<sub>OL(max)</sub> = 0,4 V, I<sub>OL</sub> = 3 mA. En küçük pull-up R<sub>min</sub> kaç ohm?`, `I²C (standard/fast mode): pull-up to ${nn(p.v)} V, V<sub>OL(max)</sub> = 0.4 V, I<sub>OL</sub> = 3 mA. Smallest pull-up R<sub>min</sub> in ohms?`),
      ans: p => (p.v - 0.4) / 0.003,
      ex: (p, L) => L(`R<sub>min</sub> = (${nn(p.v)} − 0,4) / 3 mA = ${nn((p.v - 0.4) / 0.003)} Ω. Daha küçük direnç, çıkışın LOW seviyesini 0,4 V’un üstüne iter.`, `R<sub>min</sub> = (${nn(p.v)} − 0.4) / 3 mA = ${nn((p.v - 0.4) / 0.003)} Ω. A smaller resistor pushes the LOW level above 0.4 V.`) },
    { id: 'i2cmax', topic: 'outputs', lvl: 'a', type: 'num', unit: 'Ω', tol: 0.05,
      gen: r => ({ fm: pick(r, [0, 1]), c: pick(r, [100, 200, 300, 400]) }),
      q: (p, L) => L(`I²C ${p.fm ? 'hızlı mod (t<sub>r(max)</sub> = 300 ns)' : 'standart mod (t<sub>r(max)</sub> = 1000 ns)'}, hat kapasitansı C<sub>b</sub> = ${p.c} pF. En büyük pull-up R<sub>max</sub> kaç ohm?`, `I²C ${p.fm ? 'fast mode (t<sub>r(max)</sub> = 300 ns)' : 'standard mode (t<sub>r(max)</sub> = 1000 ns)'}, bus capacitance C<sub>b</sub> = ${p.c} pF. Largest pull-up R<sub>max</sub> in ohms?`),
      ans: p => (p.fm ? 300e-9 : 1000e-9) / (0.8473 * p.c * 1e-12),
      ex: (p, L) => L(`R<sub>max</sub> = t<sub>r</sub> / (0,8473 · C<sub>b</sub>) = ${p.fm ? 300 : 1000} ns / (0,8473 · ${p.c} pF) = ${nn((p.fm ? 300e-9 : 1e-6) / (0.8473 * p.c * 1e-12))} Ω. 0,8473 = ln(0,7/0,3): %30’dan %70’e yükselme.`, `R<sub>max</sub> = t<sub>r</sub> / (0.8473 · C<sub>b</sub>) = ${p.fm ? 300 : 1000} ns / (0.8473 · ${p.c} pF) = ${nn((p.fm ? 300e-9 : 1e-6) / (0.8473 * p.c * 1e-12))} Ω. 0.8473 = ln(0.7/0.3): the 30 % to 70 % rise.`) },
    { id: 'odhigh', topic: 'outputs', lvl: 'b', type: 'mc',
      q: ['Open-drain bir çıkışın HIGH seviyesini ne belirler?', 'What sets the HIGH level of an open-drain output?'],
      opts: [['Çipin V<sub>DD</sub>’si', 'The chip’s V<sub>DD</sub>'], ['Pull-up direncinin bağlı olduğu gerilim', 'The voltage the pull-up resistor goes to', 1], ['Gate eşiği', 'The gate threshold'], ['Hattaki kapasitans', 'The line capacitance']],
      ex: ['Open-drain yalnızca LOW’a çeker. Kapalıyken hattı pull-up yükseltir, seviye pull-up rayıdır.', 'Open-drain only pulls LOW. When it lets go, the pull-up lifts the line to its own rail.'] },
    { id: 'ppwire', topic: 'outputs', lvl: 'b', type: 'tf', ans: true,
      q: ['Open-drain çıkışlar aynı hatta güvenle birleştirilebilir; push-pull çıkışlar birleştirilemez.', 'Open-drain outputs can share one wire safely; push-pull outputs cannot.'],
      ex: ['Doğru. Biri HIGH, diğeri LOW sürerse iki push-pull çıkış rayı kısa devre eder. Open-drain’de en kötü durum hattın LOW olmasıdır (wired-AND).', 'True. If one push-pull drives HIGH and the other LOW, they short the rail. With open-drain the worst case is a LOW line (wired-AND).'] },
    { id: 'sink', topic: 'outputs', lvl: 'b', type: 'mc',
      q: ['Yükü +V’ye bağlı, LOW olunca akımı yükten toprağa çeken çıkış nasıl adlandırılır?', 'An output whose load goes to +V and which pulls current from the load to ground when LOW is called…'],
      opts: [['Sourcing (akım veren)', 'Sourcing'], ['Sinking (akım çeken)', 'Sinking', 1], ['Tri-state', 'Tri-state'], ['Emitter follower', 'Emitter follower']],
      ex: ['Akım yükten pine girer: sinking. NPN/N-MOS çıkışlar sinking, PNP/P-MOS çıkışlar sourcing’dir.', 'Current flows from the load into the pin: sinking. NPN/N-MOS outputs sink, PNP/P-MOS outputs source.'] },
    { id: 'plcpnp', topic: 'outputs', lvl: 'i', type: 'mc',
      q: ['24 V sanayi sistemlerinde neden PNP (sourcing) çıkışlar tercih edilir?', 'Why does 24 V industry prefer PNP (sourcing) outputs?'],
      opts: [['Daha az kayıplıdırlar', 'They have lower loss'], ['Ezilip şasiye değen kablo girişi OFF yapar, yükü kendiliğinden açmaz', 'A crushed wire touching chassis reads OFF instead of switching the load on', 1],
        ['NPN 24 V’a dayanamaz', 'NPN cannot stand 24 V'], ['PNP daha hızlı anahtarlar', 'PNP switches faster']],
      ex: ['Sourcing çıkışta yük toprağa bağlıdır. Kablo şasiye kısa devre olursa sigorta atar ya da sinyal OFF olur; makine kendiliğinden çalışmaz.', 'With a sourcing output the load is grounded. A cable shorted to chassis blows a fuse or reads OFF; the machine does not start by itself.'] },
    { id: 'plcin', topic: 'outputs', lvl: 'a', type: 'mc',
      q: ['IEC 61131-2 Tip 1 dijital giriş (24 V). Hangisi güvenle ON okunur?', 'IEC 61131-2 Type 1 digital input (24 V). Which is read reliably as ON?'],
      opts: [['18 V, 3 mA', '18 V, 3 mA', 1], ['12 V, 5 mA', '12 V, 5 mA'], ['24 V, 1 mA', '24 V, 1 mA'], ['5 V, 10 mA', '5 V, 10 mA']],
      ex: ['Tip 1’de ON için ≥ 15 V <b>ve</b> ≥ 2 mA gerekir; OFF ≤ 5 V’tur. 12 V belirsiz bölgede, 1 mA ise akım şartını karşılamaz.', 'Type 1 ON needs ≥ 15 V <b>and</b> ≥ 2 mA; OFF is ≤ 5 V. 12 V falls in the transition band and 1 mA fails the current rule.'] },
    { id: 'loaddump', topic: 'outputs', lvl: 'a', type: 'mc',
      q: ['12 V araç sisteminde, merkezi load dump kenetlemesi (~35 V) varken low-side MOSFET için hangi V<sub>DS</sub> güvenlidir?', 'In a 12 V vehicle with central load-dump clamping (~35 V), which V<sub>DS</sub> rating is safe for a low-side MOSFET?'],
      opts: [['20 V', '20 V'], ['30 V', '30 V'], ['60 V', '60 V', 1], ['16 V', '16 V']],
      ex: ['Kenetlenmiş load dump ~35 V’tur, kenetlenmemiş ~90 V’a çıkar. 40 V az payla geçer; 60 V güvenli seçimdir.', 'Clamped load dump is ~35 V; unclamped it reaches ~90 V. 40 V passes with little margin; 60 V is the safe pick.'] },
    { id: 'm-wired', topic: 'outputs', lvl: 'i', type: 'multi',
      q: ['Hangi çıkışlar ortak bir hatta (wired-AND, ör. I²C, kesme hattı) birbirine bağlanabilir? (hepsini seç)', 'Which outputs can be tied together on one shared line (wired-AND, e.g. I²C, an interrupt line)? (select all)'],
      opts: [['Open-drain', 'Open-drain', 1, 'Yalnızca LOW’a çeker.', 'Only pulls LOW.'],
        ['Open-collector', 'Open-collector', 1, 'BJT’li open-drain eşdeğeri.', 'The BJT version of open-drain.'],
        ['Push-pull', 'Push-pull', 0, 'HIGH ile LOW çakışınca kısa devre.', 'HIGH against LOW is a short.'],
        ['Totem-pole TTL çıkışı', 'Totem-pole TTL output', 0, 'O da bir push-pull katıdır.', 'That is a push-pull stage too.']],
      ex: ['Ortak hatta yalnızca çekebilen çıkışlar ve tek bir pull-up olur. Hat, herhangi biri LOW çekerse LOW’dur.', 'A shared line takes only outputs that pull down, plus one pull-up. Any one pulling LOW makes the line LOW.'] },
    { id: 'pk-i2c', topic: 'outputs', lvl: 'i', type: 'part',
      q: ['Çift yönlü I²C seviye çevirici (3,3 V ↔ 5 V), gate 3,3 V’a bağlı. Şart: tipik V<sub>GS(th)</sub> ≤ 1,5 V ve hattı yüklememek için C<sub>iss</sub> ≤ 100 pF. Hangi MOSFET?', 'Bidirectional I²C level shifter (3.3 V ↔ 5 V), gate tied to 3.3 V. Needs: typical V<sub>GS(th)</sub> ≤ 1.5 V and C<sub>iss</sub> ≤ 100 pF to keep the bus light. Which MOSFET?'],
      parts: ['BSS138', '2N7002', 'AO3400A', 'IRLML6344'],
      spec: m => [`${m.type}-MOS`, m.pkg, `V<sub>DS</sub> ${m.vds} V`, `V<sub>GS(th)</sub> ${nn(m.vth)} V`, `C<sub>iss</sub> ${m.ciss} pF`],
      judge: m => {
        const f = [];
        if (m.vth > 1.5) f.push([`V<sub>GS(th)</sub> ${nn(m.vth)} V > 1,5 V`, `V<sub>GS(th)</sub> ${nn(m.vth)} V > 1.5 V`]);
        if (m.ciss > 100) f.push([`C<sub>iss</sub> ${m.ciss} pF > 100 pF`, `C<sub>iss</sub> ${m.ciss} pF > 100 pF`]);
        return verdict(f, `V<sub>GS(th)</sub> ${nn(m.vth)} V, C<sub>iss</sub> ${m.ciss} pF`, `V<sub>GS(th)</sub> ${nn(m.vth)} V, C<sub>iss</sub> ${m.ciss} pF`);
      },
      ex: ['BSS138 klasik seçimdir: düşük eşik ve çok küçük kapasitans. AO3400A ve IRLML6344 güçlüdür ama C<sub>iss</sub>’leri hattı yavaşlatır.', 'The BSS138 is the classic pick: low threshold and tiny capacitance. The AO3400A and IRLML6344 are strong but their C<sub>iss</sub> slows the bus.'] },

    /* =================== 05 · bjt-drive =================== */
    { id: 'rb', topic: 'bjt-drive', lvl: 'b', type: 'num', unit: 'Ω', tol: 0.05,
      gen: r => ({ ic: pick(r, [50, 70, 80, 100, 120, 150, 200]) }),
      q: (p, L) => L(`NPN low-side anahtar, I<sub>C</sub> = ${p.ic} mA. β<sub>zorlanmış</sub> = 10, V<sub>OH</sub> = 3,3 V, V<sub>BE(sat)</sub> = 0,8 V. Base direnci R<sub>B</sub> kaç ohm?`, `NPN low-side switch, I<sub>C</sub> = ${p.ic} mA. β<sub>forced</sub> = 10, V<sub>OH</sub> = 3.3 V, V<sub>BE(sat)</sub> = 0.8 V. Base resistor R<sub>B</sub> in ohms?`),
      ans: p => 2.5 / (p.ic / 10 / 1000),
      ex: (p, L) => L(`I<sub>B</sub> = ${p.ic}/10 = ${nn(p.ic / 10)} mA; R<sub>B</sub> = (3,3 − 0,8) / ${nn(p.ic / 10)} mA = ${nn(2.5 / (p.ic / 1e4))} Ω. Pratikte bir alt E12 değerini seç.`, `I<sub>B</sub> = ${p.ic}/10 = ${nn(p.ic / 10)} mA; R<sub>B</sub> = (3.3 − 0.8) / ${nn(p.ic / 10)} mA = ${nn(2.5 / (p.ic / 1e4))} Ω. In practice pick the next lower E12 value.`) },
    { id: 'rbe', topic: 'bjt-drive', lvl: 'b', type: 'mc',
      q: ['Base ile emitter arasına konan 10–100 kΩ direncin görevi nedir?', 'What does a 10–100 kΩ resistor from base to emitter do?'],
      opts: [['Base akımını artırır', 'It increases base current'], ['Boot sırasında ve kaçak akımda transistörü kapalı tutar', 'It keeps the transistor off during boot and against leakage', 1], ['V<sub>CE(sat)</sub>’i düşürür', 'It lowers V<sub>CE(sat)</sub>'], ['Flyback diyotunun yerini tutar', 'It replaces the flyback diode']],
      ex: ['GPIO boştayken base’i emitter seviyesine çeker. Kapanışta base yükünü de boşaltıp kapanmayı biraz hızlandırır.', 'It pulls the base to the emitter while the GPIO floats. At turn-off it also drains base charge, speeding it up slightly.'] },
    { id: 'pnp12', topic: 'bjt-drive', lvl: 'i', type: 'mc',
      q: ['12 V’luk PNP high-side anahtarın base’i bir dirençle doğrudan 3,3 V GPIO’ya bağlı. GPIO HIGH olunca ne olur?', 'A 12 V PNP high-side switch has its base tied through a resistor straight to a 3.3 V GPIO. What happens when the GPIO is HIGH?'],
      opts: [['PNP kapanır', 'The PNP turns off'], ['PNP açık kalır: base 3,3 V, emitter 12 V’ta, V<sub>EB</sub> hâlâ ≫ 0,7 V', 'The PNP stays on: base at 3.3 V, emitter at 12 V, V<sub>EB</sub> still ≫ 0.7 V', 1], ['GPIO 12 V’a yükselir', 'The GPIO rises to 12 V'], ['Transistör ters aktif bölgeye geçer', 'The transistor goes reverse-active']],
      ex: ['Kapatmak için base’in 12 V’a yakın olması gerekir. Bir NPN seviye kaydırıcı base’i aşağı çeker, bir pull-up 12 V’a.', 'Turning it off needs the base near 12 V. An NPN level shifter pulls the base down and a pull-up lifts it to 12 V.'] },
    { id: 'darl', topic: 'bjt-drive', lvl: 'i', type: 'tf', ans: false,
      q: ['TIP120 Darlington, 3 A’de doymuş bir BJT gibi yalnızca ~0,1 V düşürür.', 'At 3 A a TIP120 Darlington drops only ~0.1 V, like a saturated BJT.'],
      ex: ['Yanlış. Darlington’ın çıkış transistörü tam doyamaz: ~1–2 V düşüm. 3 A × 1,5 V ≈ 4,5 W ısı; burada MOSFET seç.', 'False. A Darlington’s output transistor cannot fully saturate: ~1–2 V drop. 3 A × 1.5 V ≈ 4.5 W of heat; use a MOSFET here.'] },
    { id: 'pk-bjt300', topic: 'bjt-drive', lvl: 'i', type: 'part',
      q: ['12 V selenoid, 300 mA, low-side NPN. GPIO en fazla 5 mA verir (zorlanmış β = 60, h<sub>FE(min)</sub>/2 ile kontrol et). V<sub>CE(sat)</sub> ≤ 0,4 V ve I<sub>C(max)</sub> ≥ 450 mA. Hangi transistör?', '12 V solenoid, 300 mA, low-side NPN. The GPIO gives at most 5 mA (forced β = 60, check against h<sub>FE(min)</sub>/2). V<sub>CE(sat)</sub> ≤ 0.4 V and I<sub>C(max)</sub> ≥ 450 mA. Which transistor?'],
      parts: ['BC547B', 'BC337-40', '2N2222A', 'TIP120'],
      spec: (m, P) => [`NPN${m.darl ? ' Darlington' : ''}`, m.pkg, `I<sub>C(max)</sub> ${nn(m.ic * 1000)} mA`, `h<sub>FE(min)</sub> @ 300 mA ≈ ${Math.round(P.hfe(m, 0.3, true))}`, `V<sub>CE(sat)</sub> @ 300 mA ≈ ${nn(P.vcesat(m, 0.3), 2)} V`],
      judge: (m, P) => {
        const f = [], h = P.hfe(m, 0.3, true), vs = P.vcesat(m, 0.3);
        if (m.ic < 0.45) f.push([`I<sub>C(max)</sub> ${nn(m.ic * 1000)} mA yetmez`, `I<sub>C(max)</sub> ${nn(m.ic * 1000)} mA is too low`]);
        if (h / 2 < 60) f.push([`h<sub>FE(min)</sub>/2 ≈ ${Math.round(h / 2)} < 60`, `h<sub>FE(min)</sub>/2 ≈ ${Math.round(h / 2)} < 60`]);
        if (vs > 0.4) f.push([`V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`, `V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`]);
        return verdict(f, `h<sub>FE(min)</sub>/2 ≈ ${Math.round(h / 2)}, V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`, `h<sub>FE(min)</sub>/2 ≈ ${Math.round(h / 2)}, V<sub>CE(sat)</sub> ≈ ${nn(vs, 2)} V`);
      },
      ex: ['BC337-40 300 mA’de bile yüksek kazancını korur. 2N2222A’nın kazancı bu akımda düşer, TIP120 ise ~0,8 V düşürür.', 'The BC337-40 keeps its high gain even at 300 mA. The 2N2222A loses gain at this current and the TIP120 drops ~0.8 V.'] },
    { id: 'o-rb', topic: 'bjt-drive', lvl: 'b', type: 'order',
      q: ['BJT low-side anahtarın base direncini hesaplama adımlarını sırala.', 'Put the steps for sizing a BJT low-side switch’s base resistor in order.'],
      items: [['Yük akımını I<sub>C</sub> bul', 'Find the load current I<sub>C</sub>'], ['Bu akımda h<sub>FE(min)</sub>’i datasheet’ten oku', 'Read h<sub>FE(min)</sub> at that current from the datasheet'],
        ['Zorlanmış β seç (≈ 10) ve I<sub>B</sub> = I<sub>C</sub> / β', 'Choose forced β (≈ 10) and I<sub>B</sub> = I<sub>C</sub> / β'], ['R<sub>B</sub> = (V<sub>OH</sub> − V<sub>BE(sat)</sub>) / I<sub>B</sub>', 'R<sub>B</sub> = (V<sub>OH</sub> − V<sub>BE(sat)</sub>) / I<sub>B</sub>'],
        ['I<sub>B</sub>’nin pin sınırının altında olduğunu kontrol et', 'Check I<sub>B</sub> is below the pin limit']],
      ex: ['Önce yük, sonra kazanç, sonra direnç. Son kontrol pin akımıdır; fazlaysa daha güçlü bir sürme katı gerekir.', 'Load first, then gain, then the resistor. The last check is the pin current; if too high, a stronger drive stage is needed.'] },

    /* =================== 06 · mosfet-drive =================== */
    { id: 'tg', topic: 'mosfet-drive', lvl: 'b', type: 'num', unit: 'ns', tol: 0.05,
      gen: r => ({ q: pick(r, [10, 20, 30, 48]), i: pick(r, [10, 20, 50, 100]) }),
      q: (p, L) => L(`Q<sub>g</sub> = ${p.q} nC olan bir gate ortalama ${p.i} mA ile şarj ediliyor. Tam açılma süresi yaklaşık kaç ns?`, `A gate with Q<sub>g</sub> = ${p.q} nC is charged with an average ${p.i} mA. Roughly how many ns to turn fully on?`),
      ans: p => p.q / p.i * 1000,
      ex: (p, L) => L(`t = Q / I = ${p.q} nC / ${p.i} mA = ${nn(p.q / p.i * 1000)} ns.`, `t = Q / I = ${p.q} nC / ${p.i} mA = ${nn(p.q / p.i * 1000)} ns.`) },
    { id: 'vgsmax', topic: 'mosfet-drive', lvl: 'i', type: 'mc',
      q: ['V<sub>GS(max)</sub> ±20 V olan bir P-MOS 24 V rayda. Gate doğrudan 0 V’a çekilirse ne olur?', 'A P-MOS with V<sub>GS(max)</sub> ±20 V sits on a 24 V rail. What happens if its gate is pulled straight to 0 V?'],
      opts: [['Tam açılır, sorun yok', 'It turns fully on, no problem'], ['V<sub>GS</sub> = −24 V sınırı aşar; gate oksidi delinebilir', 'V<sub>GS</sub> = −24 V exceeds the limit; the gate oxide can break down', 1], ['Kapanır', 'It turns off'], ['Body diyot iletir', 'The body diode conducts']],
      ex: ['Gate–source gerilimini bölücü (ör. 10 k + 10 k → 12 V) ya da 12–15 V zener ile sınırla.', 'Limit gate–source voltage with a divider (e.g. 10 k + 10 k → 12 V) or a 12–15 V zener.'] },
    { id: 'pk-led33', topic: 'mosfet-drive', lvl: 'i', type: 'part',
      q: ['12 V / 4 A LED şerit, 3,3 V GPIO’dan low-side. Şart: R<sub>DS(on)</sub> ≤ 3,3 V’ta datasheet’te tanımlı, 3,3 V’ta iletim kaybı ≤ 0,5 W (25 °C), V<sub>DS</sub> ≥ 20 V. Hangi MOSFET?', '12 V / 4 A LED strip, low-side from a 3.3 V GPIO. Needs: R<sub>DS(on)</sub> specified at ≤ 3.3 V, conduction loss ≤ 0.5 W at 3.3 V (25 °C), V<sub>DS</sub> ≥ 20 V. Which MOSFET?'],
      parts: ['2N7002', 'AO3400A', 'IRLZ44N', 'IRF540N'],
      spec: m => [`${m.type}-MOS`, m.pkg, `V<sub>DS</sub> ${m.vds} V`, `R<sub>DS(on)</sub> ${mo(m.p[0][1])} mΩ @ ${nn(m.p[0][0])} V`, `${mo(m.p[1][1])} mΩ @ ${nn(m.p[1][0])} V`],
      judge: (m, P) => {
        const f = [], r = P.rds(m, 3.3), pw = 16 * r, is = P.idsat(m, 3.3);
        if (specFrom(m) > 3.3) f.push([`R<sub>DS(on)</sub> ancak ${nn(specFrom(m))} V’tan itibaren tanımlı`, `R<sub>DS(on)</sub> only specified from ${nn(specFrom(m))} V`]);
        if (m.vds < 20) f.push([`V<sub>DS</sub> ${m.vds} V`, `V<sub>DS</sub> ${m.vds} V`]);
        if (is < 4) f.push([`3,3 V’ta yalnızca ~${nn(is, 2)} A taşır`, `carries only ~${nn(is, 2)} A at 3.3 V`]);
        else if (pw > 0.5) f.push([`3,3 V’ta P ≈ ${nn(pw, 2)} W`, `P ≈ ${nn(pw, 2)} W at 3.3 V`]);
        return verdict(f, `3,3 V’ta R ≈ ${mo(r)} mΩ → P ≈ ${nn(pw, 2)} W`, `R ≈ ${mo(r)} mΩ at 3.3 V → P ≈ ${nn(pw, 2)} W`);
      },
      ex: ['AO3400A’nın R<sub>DS(on)</sub>’u 2,5 V’ta garanti; 4 A’de ~0,4 W harcar. IRLZ44N 3,3 V’ta çalışır ama garanti dışıdır.', 'The AO3400A has R<sub>DS(on)</sub> guaranteed at 2.5 V; at 4 A it dissipates ~0.4 W. The IRLZ44N works at 3.3 V but outside its guarantee.'] },
    { id: 'sc-rg', topic: 'mosfet-drive', lvl: 'i', type: 'scope',
      q: ['20 kHz PWM’de skop böyle. MOSFET düşük akımda bile ısınıyor. En olası neden?', 'At 20 kHz PWM the scope shows this. The MOSFET heats even at low current. Most likely cause?'],
      fig: (el, p, H) => {
        const pts = []; let v = 0;
        for (let i = 0; i <= 1000; i++) { const t = i * 0.1, d = (t % 50) < 25 ? 5 : 0; v += (d - v) * (1 - Math.exp(-0.1 / 20)); pts.push([t * 1e-6, v]); }
        const sq = [[0, 5], [25e-6, 5], [25e-6, 0], [50e-6, 0], [50e-6, 5], [75e-6, 5], [75e-6, 0], [100e-6, 0]];
        scope(el, { t0: 0, tdiv: 10e-6, channels: [{ key: 'g', name: 'GPIO', color: 'ch1', unit: 'V', scale: 2, pos: 0.6 }, { key: 'v', name: 'V_GS', color: 'ch2', unit: 'V', scale: 2, pos: -3.6 }] }, { g: sq, v: pts }, '20 kHz');
      },
      opts: [['Flyback diyotu eksik', 'Missing flyback diode'], ['Gate direnci bu frekans için çok büyük (RC çok yavaş)', 'The gate resistor is far too big for this frequency (RC too slow)', 1], ['V<sub>GS(max)</sub> aşılmış', 'V<sub>GS(max)</sub> exceeded'], ['Dead-time çok uzun', 'Dead-time too long']],
      ex: ['V<sub>GS</sub> her kenarda ~20 µs’de sürünüyor: R<sub>G</sub>·C<sub>iss</sub> periyoda yakın. MOSFET lineer bölgede ısınır; R<sub>G</sub> = 10–100 Ω kullan ya da sürücü ekle.', 'V<sub>GS</sub> crawls ~20 µs at each edge: R<sub>G</sub>·C<sub>iss</sub> is close to the period. The MOSFET heats in its linear region; use R<sub>G</sub> = 10–100 Ω or add a driver.'] },
    { id: 'sp-pmos24', topic: 'mosfet-drive', lvl: 'i', type: 'spot',
      q: ['24 V ısıtıcı, P-MOS high-side (V<sub>GS(max)</sub> ±20 V). Şemadaki hata hangisi?', '24 V heater, P-MOS high-side (V<sub>GS(max)</sub> ±20 V). What is wrong in this schematic?'],
      fig: (el, p, H) => {
        const S = H.S;
        sch(el, 380, 215, `
          ${S.vcc(240, 30, '+24 V')}${S.w([[150, 30], [240, 30], [240, 60]])}${S.dot(240, 30)}
          ${S.res(150, 60, 0, '')}${S.text(138, 64, 'R1 10 kΩ', '', 'end')}
          ${S.w([[150, 90], [190, 90]], 'sigw')}${S.dot(150, 90)}${S.pmos(220, 90, '')}${S.text(270, 94, 'Q1', '', 'start')}
          ${S.w([[150, 90], [150, 120]], 'sigw')}${S.npn(130, 150, '')}${S.text(126, 182, 'Q2', '', 'end')}${S.gnd(150, 180)}
          ${S.res(70, 150, 90, '')}${S.text(70, 136, 'R2', '', 'middle')}${S.w([[20, 150], [40, 150]], 'sigw')}${S.text(18, 140, 'GPIO', 'sig', 'start')}
          ${S.load(240, 150, 0, '')}${S.text(262, 154, H.L('ısıtıcı', 'heater'), '', 'start')}${S.gnd(240, 180)}`);
      },
      opts: [['Q2 gate’i doğrudan 0 V’a çekiyor: V<sub>GS</sub> = −24 V', 'Q2 pulls the gate straight to 0 V: V<sub>GS</sub> = −24 V', 1], ['R1 kaldırılmalı', 'R1 should be removed'], ['R2 base direnci gereksiz', 'Base resistor R2 is unnecessary'], ['Isıtıcı Q1’in üstüne konmalı', 'The heater should sit above Q1']],
      ex: ['Q2 doyunca gate 0 V, source 24 V’ta: −24 V, ±20 V sınırının ötesi. Q2 ile gate arasına R1’e eşit bir direnç koy (|V<sub>GS</sub>| = 12 V) ya da zener ekle.', 'With Q2 saturated the gate is at 0 V and the source at 24 V: −24 V, beyond ±20 V. Add a resistor equal to R1 between Q2 and the gate (|V<sub>GS</sub>| = 12 V) or a zener.'] },

    /* =================== 07 · topologies =================== */
    { id: 'pmos', topic: 'topologies', lvl: 'i', type: 'mc',
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 200, `
        ${S.vcc(220, 22, '+12 V')}${S.w([[220, 22], [220, 60]])}${S.pmos(200, 90, '')}${S.load(220, 150, 0, '')}${S.gnd(220, 180)}
        ${S.box(20, 65, 80, 50, 'GPIO', H.L('3,3 V', '3.3 V'))}${S.w([[100, 90], [170, 90]], 'sigw')}
        ${S.text(260, 94, 'G → GPIO', 'sig', 'start')}${S.text(260, 64, 'S = 12 V', '', 'start')}`); },
      q: ['P-MOS’un gate’i doğrudan 3,3 V GPIO’ya bağlı, source 12 V’ta. GPIO HIGH (3,3 V) olunca ne olur?', 'The P-MOS gate is tied straight to a 3.3 V GPIO, source at 12 V. What happens when the GPIO is HIGH (3.3 V)?'],
      opts: [['MOSFET kapanır, yük durur', 'The MOSFET turns off, the load stops'], ['Açık kalır: V<sub>GS</sub> = −8,7 V', 'It stays on: V<sub>GS</sub> = −8.7 V', 1], ['Yarı açık kalır, ısınır', 'It stays half-on and heats'], ['Gate anında delinir', 'The gate breaks down instantly']],
      ex: ['Gate 3,3 V’tayken V<sub>GS</sub> = 3,3 − 12 = −8,7 V, yani tam açık. Çözüm: NPN seviye çevirici ve gate pull-up.', 'With the gate at 3.3 V, V<sub>GS</sub> = 3.3 − 12 = −8.7 V, so it is fully on. Fix: an NPN level shifter and a gate pull-up.'] },
    { id: 'hs', topic: 'topologies', lvl: 'i', type: 'mc',
      q: ['MCU’ya sinyal hatlarıyla bağlı bir sensör kartının beslemesi neden high-side anahtarlanır?', 'Why is the supply of a sensor board with signal lines to the MCU switched on the high side?'],
      opts: [['High-side daha az kayıplıdır', 'High-side has lower loss'], ['Toprak ortak kalır; low-side kesilirse sensör, sinyal hatları ve pin diyotlarından beslenir', 'Ground stays common; with a low-side cut the sensor powers itself through signal lines and pin diodes', 1],
        ['P-MOS N-MOS’tan ucuzdur', 'P-MOS is cheaper than N-MOS'], ['Inrush yalnızca low-side’da olur', 'Inrush only happens low-side']],
      ex: ['Low-side kesilince sensörün toprağı yüzer ve akım GPIO koruma diyotlarından geçer. High-side anahtar toprağı ortak tutar.', 'With a low-side cut the sensor ground floats and current flows through the GPIO clamp diodes. A high-side switch keeps ground common.'] },
    { id: 'div', topic: 'topologies', lvl: 'i', type: 'num', unit: 'V', tol: 0.03,
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 200, `
        ${S.vcc(240, 22, '+24 V')}${S.w([[240, 22], [240, 58]])}${S.dot(240, 28)}${S.w([[170, 28], [240, 28]])}
        ${S.res(170, 58, 0, '')}${S.text(158, 62, 'R1 10 kΩ', '', 'end')}
        ${S.w([[170, 88], [190, 88]])}${S.dot(170, 88)}${S.pmos(220, 88, '')}${S.load(240, 148, 0, '')}${S.gnd(240, 178)}
        ${S.w([[170, 88], [170, 100]])}${S.res(170, 130, 0, '')}${S.text(158, 134, 'R2', '', 'end')}
        ${S.w([[170, 160], [170, 165]])}${S.text(176, 182, 'NPN → 0 V', 'sig', 'start')}${S.gnd(170, 165)}`); },
      gen: r => ({ r2: pick(r, [4.7, 6.8, 10, 15, 22]) }),
      q: (p, L) => L(`24 V hatta P-MOS: R1 = 10 kΩ (gate–source), R2 = ${nn(p.r2)} kΩ (gate–NPN). NPN doyumdayken (0 V kabul) |V<sub>GS</sub>| kaç volt?`, `P-MOS on a 24 V rail: R1 = 10 kΩ (gate–source), R2 = ${nn(p.r2)} kΩ (gate–NPN). With the NPN saturated (take 0 V), what is |V<sub>GS</sub>| in volts?`),
      ans: p => 24 * 10 / (10 + p.r2),
      ex: (p, L) => L(`|V<sub>GS</sub>| = 24 · R1 / (R1 + R2) = 24 · 10 / ${nn(10 + p.r2)} = ${nn(240 / (10 + p.r2))} V. ±20 V’un altında kalmalı; ≥ 10 V tam açar.`, `|V<sub>GS</sub>| = 24 · R1 / (R1 + R2) = 24 · 10 / ${nn(10 + p.r2)} = ${nn(240 / (10 + p.r2))} V. It must stay under ±20 V; ≥ 10 V turns the part fully on.`) },
    { id: 'chassis', topic: 'topologies', lvl: 'i', type: 'mc',
      q: ['Low-side anahtarlı bir araç lambasında, yük ile anahtar arasındaki kablo yıpranıp şasiye değiyor. Ne olur?', 'A vehicle lamp is switched low-side. The wire between lamp and switch chafes through and touches chassis. What happens?'],
      opts: [['Sigorta atar', 'The fuse blows'], ['Lamba yanar ve kapatılamaz', 'The lamp turns on and cannot be turned off', 1], ['Lamba söner', 'The lamp goes off'], ['MOSFET yanar', 'The MOSFET burns']],
      ex: ['Şasi topraktır; kısa devre anahtarı köprüler ve yük sürekli çalışır. High-side’da aynı kısa devre sigortayı attırır.', 'Chassis is ground, so the short bypasses the switch and the load runs constantly. High-side, the same short blows the fuse.'] },
    { id: 'gshift', topic: 'topologies', lvl: 'i', type: 'tf', ans: false,
      q: ['Low-side anahtarlı bir yükte, yükün eksi ucu her zaman sistem toprağındadır.', 'With a low-side switch, the load’s negative terminal is always at system ground.'],
      ex: ['Yanlış. Açıkken I·(R<sub>DS(on)</sub> + kablo) kadar yukarıdadır, kapalıyken beslemeye çıkar. O uca referanslı sensörler yanlış okur.', 'False. When on it sits I·(R<sub>DS(on)</sub> + wire) above ground; when off it rises to the supply. Sensors referenced to it read wrong.'] },
    { id: 'hsgate', topic: 'topologies', lvl: 'i', type: 'mc',
      q: ['12 V rayda high-side N-MOS (standart seviye). Tam açık olması için gate’in toprağa göre gerilimi yaklaşık ne olmalı?', 'High-side N-MOS (standard level) on a 12 V rail. Roughly what gate voltage to ground keeps it fully on?'],
      opts: [['3,3 V', '3.3 V'], ['12 V', '12 V'], ['≈ 22 V (rayın ~10 V üstü)', '≈ 22 V (~10 V above the rail)', 1], ['−10 V', '−10 V']],
      ex: ['Açıkken source rayın yanındadır, V<sub>GS</sub> = 10 V için gate ~22 V olmalı. Bootstrap, charge pump ya da high-side sürücü bunu sağlar.', 'When on, the source sits near the rail, so V<sub>GS</sub> = 10 V needs ~22 V on the gate. A bootstrap, charge pump or high-side driver provides it.'] },
    { id: 'hleg', topic: 'topologies', lvl: 'b', type: 'mc',
      q: ['H-köprüde hangi iki anahtar aynı anda açılırsa besleme kısa devre olur?', 'In an H-bridge, which two switches short the supply if both are on?'],
      opts: [['Çapraz iki anahtar (üst-sol ve alt-sağ)', 'The diagonal pair (top-left and bottom-right)'], ['Aynı bacağın üst ve alt anahtarı', 'The top and bottom switch of the same leg', 1], ['İki alt anahtar', 'Both bottom switches'], ['İki üst anahtar', 'Both top switches']],
      ex: ['Aynı bacak beslemeyi doğrudan toprağa bağlar: shoot-through. Çapraz çift motoru sürer, iki alt anahtar ise frenler.', 'One leg connects the supply straight to ground: shoot-through. The diagonal pair drives the motor; both bottom switches brake it.'] },
    { id: 'hbrake', topic: 'topologies', lvl: 'i', type: 'mc',
      q: ['Dönen bir DC motorda H-köprünün iki alt anahtarı birlikte açılırsa ne olur?', 'A DC motor is spinning. What happens if both bottom switches of the H-bridge turn on together?'],
      opts: [['Motor ters döner', 'The motor reverses'], ['Motor sargısı kısa devre olur ve dinamik fren yapar', 'The winding is shorted and the motor brakes dynamically', 1], ['Besleme kısa devre olur', 'The supply is shorted'], ['Hiçbir şey olmaz', 'Nothing happens']],
      ex: ['Zıt EMK, iki alt anahtar üzerinden kendi sargısına akım sürer ve motoru yavaşlatır. Besleme bu yolda değildir.', 'The back-EMF drives current through its own winding via the two bottom switches, slowing the motor. The supply is not in that path.'] },
    { id: 'm-hside', topic: 'topologies', lvl: 'i', type: 'multi',
      q: ['Hangi durumlarda high-side anahtar seçilir? (hepsini seç)', 'Which cases call for a high-side switch? (select all)'],
      opts: [['Kablosu şasiye değebilen araç yükü', 'A vehicle load whose wire can touch chassis', 1, 'Kısa devre yükü açmaz, sigortayı attırır.', 'A short blows the fuse instead of switching the load on.'],
        ['MCU’ya sinyal hatlarıyla bağlı sensör beslemesi', 'A sensor rail with signal lines to the MCU', 1, 'Toprak ortak kalır.', 'Ground stays common.'],
        ['24 V PLC çıkışı', 'A 24 V PLC output', 1, 'Sanayi standardı sourcing’dir.', 'Industry standard is sourcing.'],
        ['Kutu içindeki 12 V LED şerit', 'A 12 V LED strip inside a box', 0, 'Low-side yeter ve daha basittir.', 'Low-side is enough and simpler.'],
        ['PC kasasında PWM fan', 'A PWM fan inside a PC case', 0, 'Low-side N-MOS ile sürülür.', 'Driven with a low-side N-MOS.']],
      ex: ['Yük toprağa bağlı kalmalıysa ya da kısa devre güvenliği önemliyse high-side seç. Kapalı kutudaki basit yükler low-side ile olur.', 'Go high-side when the load must stay grounded or short-circuit safety matters. Simple loads in a closed box work low-side.'] },
    { id: 'sp-hsn', topic: 'topologies', lvl: 'i', type: 'spot',
      q: ['3,3 V GPIO, 12 V’luk bir yükü bu devreyle anahtarlıyor. Asıl hata hangisi?', 'A 3.3 V GPIO switches a 12 V load with this circuit. What is the main mistake?'],
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 205, `
        ${S.vcc(220, 30, '+12 V')}${S.w([[220, 30], [220, 50]])}${S.nmos(200, 80, '')}${S.text(250, 84, 'Q1', '', 'start')}
        ${S.load(220, 140, 0, '')}${S.text(246, 144, H.L('yük', 'load'), '', 'start')}${S.gnd(220, 170)}
        ${S.res(140, 80, 90, '')}${S.text(140, 66, 'R1 100 Ω', '', 'middle')}${S.w([[90, 80], [110, 80]], 'sigw')}${S.w([[160, 80], [170, 80]], 'sigw')}${S.w([[160, 80], [160, 110]], 'sigw')}${S.dot(160, 80)}
        ${S.res(160, 140, 0, '')}${S.text(148, 144, 'R2 100 kΩ', '', 'end')}${S.gnd(160, 170)}
        ${S.box(10, 60, 80, 40, 'GPIO', H.L('3,3 V', '3.3 V'))}`); },
      opts: [['Q1 yükün üstünde N-MOS: source gate’i izler, yük ≤ 3,3 − V<sub>th</sub> görür', 'Q1 is an N-MOS above the load: the source follows the gate, the load sees ≤ 3.3 − V<sub>th</sub>', 1],
        ['R1 gate direnci çok küçük', 'Gate resistor R1 is too small'], ['R2 pull-down kaldırılmalı', 'Pull-down R2 should be removed'], ['12 V ray Q1 için fazla yüksek', 'The 12 V rail is too high for Q1']],
      ex: ['Yükün üstündeki N-MOS source follower olur: yük ~1–2 V görür, Q1 kalan gerilimi harcayıp ısınır. Yükü drain’e al (low-side) ya da P-MOS kullan.', 'An N-MOS above the load is a source follower: the load sees ~1–2 V and Q1 burns the rest. Move the load to the drain (low-side) or use a P-MOS.'] },
    { id: 'pk-pmos12', topic: 'topologies', lvl: 'a', type: 'part',
      q: ['12 V rayda 1,5 A high-side anahtar. Gate bir NPN ile GND’ye çekiliyor (|V<sub>GS</sub>| = 12 V). Şart: V<sub>GS(max)</sub> ≥ 15 V (pay), 25 °C’de kayıp ≤ 0,1 W. Hangi P-MOS?', '1.5 A high-side switch on a 12 V rail. An NPN pulls the gate to GND (|V<sub>GS</sub>| = 12 V). Needs: V<sub>GS(max)</sub> ≥ 15 V (margin), loss ≤ 0.1 W at 25 °C. Which P-MOS?'],
      parts: ['Si2301', 'AO3401A', 'IRF9540N', 'IRF4905'],
      spec: m => [`${m.type}-MOS`, m.pkg, `V<sub>DS</sub> ${m.vds} V`, `V<sub>GS(max)</sub> ±${m.vgsMax} V`, `R<sub>DS(on)</sub> ${mo(m.p[1][1])} mΩ @ ${nn(m.p[1][0])} V`],
      judge: (m, P) => {
        const f = [], r = P.rds(m, 12), pw = 2.25 * r;
        if (m.vgsMax < 15) f.push([`V<sub>GS(max)</sub> ±${m.vgsMax} V`, `V<sub>GS(max)</sub> ±${m.vgsMax} V`]);
        if (pw > 0.1) f.push([`P ≈ ${nn(pw, 2)} W`, `P ≈ ${nn(pw, 2)} W`]);
        return verdict(f, `±${m.vgsMax} V, R ≈ ${mo(r)} mΩ → P ≈ ${nn(pw, 2)} W`, `±${m.vgsMax} V, R ≈ ${mo(r)} mΩ → P ≈ ${nn(pw, 2)} W`);
      },
      ex: ['Si2301 (±8 V) ve AO3401A (±12 V) 12 V gate’e dayanmaz. IRF9540N dayanır ama ~0,26 W harcar; IRF4905 ~0,04 W.', 'The Si2301 (±8 V) and AO3401A (±12 V) cannot take a 12 V gate. The IRF9540N can but burns ~0.26 W; the IRF4905 ~0.04 W.'] },

    /* =================== 08 · inductive =================== */
    { id: 'fbdir', topic: 'inductive', lvl: 'b', type: 'mc',
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 200, `
        ${S.vcc(200, 26, '+12 V')}${S.w([[200, 26], [200, 40]])}${S.ind(200, 70, 0, '')}${S.text(188, 74, 'K1', '', 'end')}
        ${S.w([[200, 100], [200, 110]])}${S.nmos(180, 140, '')}${S.gnd(200, 170)}
        ${S.w([[60, 140], [150, 140]], 'sigw')}${S.text(60, 132, 'GPIO', 'sig', 'start')}
        ${S.dot(200, 34)}${S.dot(200, 105)}${S.w([[200, 34], [270, 34], [270, 52]])}${S.w([[200, 105], [270, 105], [270, 88]])}
        <rect x="254" y="52" width="32" height="36" rx="4" style="fill:none;stroke:var(--copper);stroke-dasharray:4 3"/>${S.text(270, 75, '?', 'cu big', 'middle')}
        ${S.text(296, 38, 'A', 'muted', 'start')}${S.text(296, 108, 'B', 'muted', 'start')}`); },
      q: ['Low-side MOSFET’le sürülen rölede flyback diyotunun <b>katodu</b> nereye bağlanır?', 'For a relay driven by a low-side MOSFET, where does the flyback diode’s <b>cathode</b> go?'],
      opts: [['Bobinin + besleme ucuna (A)', 'To the coil’s + supply end (A)', 1], ['Bobinin drain tarafındaki ucuna (B)', 'To the coil’s drain-side end (B)'], ['Toprağa', 'To ground'], ['MOSFET’in gate’ine', 'To the MOSFET gate']],
      ex: ['Normalde diyot ters kutuplu kalmalı, bu yüzden katot +’dadır. Kapanışta drain beslemeyi aşınca diyot iletir ve akım bobinde döner.', 'Normally the diode must stay reverse-biased, so the cathode goes to +. At turn-off the drain rises above the supply and the diode carries the coil current.'] },
    { id: 'e', topic: 'inductive', lvl: 'b', type: 'num', unit: 'mJ', tol: 0.05,
      gen: r => ({ l: pick(r, [10, 22, 47, 100]), i: pick(r, [0.5, 1, 1.5, 2]) }),
      q: (p, L) => L(`L = ${p.l} mH bir solenoid ${nn(p.i)} A taşıyor. Kapanışta boşaltılması gereken enerji kaç mJ?`, `A solenoid with L = ${p.l} mH carries ${nn(p.i)} A. How many mJ must be dumped at turn-off?`),
      ans: p => 0.5 * p.l * p.i * p.i,
      ex: (p, L) => L(`E = ½ · L · I² = ½ · ${p.l} mH · ${nn(p.i)}² = ${nn(0.5 * p.l * p.i * p.i)} mJ.`, `E = ½ · L · I² = ½ · ${p.l} mH · ${nn(p.i)}² = ${nn(0.5 * p.l * p.i * p.i)} mJ.`) },
    { id: 'zpk', topic: 'inductive', lvl: 'i', type: 'num', unit: 'V', tol: 0.03,
      gen: r => ({ v: pick(r, [12, 24]), z: pick(r, [15, 18, 24, 33]) }),
      q: (p, L) => L(`${p.v} V solenoid, diyot (V<sub>F</sub> = 0,8 V) + ${p.z} V zener ile kenetleniyor. Kapanışta V<sub>DS</sub> tepe değeri kaç volt?`, `A ${p.v} V solenoid is clamped by a diode (V<sub>F</sub> = 0.8 V) + ${p.z} V zener. Peak V<sub>DS</sub> at turn-off in volts?`),
      ans: p => p.v + p.z + 0.8,
      ex: (p, L) => L(`V<sub>DS,tepe</sub> = V + V<sub>Z</sub> + V<sub>F</sub> = ${p.v} + ${p.z} + 0,8 = ${nn(p.v + p.z + 0.8)} V. MOSFET’in V<sub>DSS</sub>’i bunun en az %25 üstünde olmalı.`, `V<sub>DS,peak</sub> = V + V<sub>Z</sub> + V<sub>F</sub> = ${p.v} + ${p.z} + 0.8 = ${nn(p.v + p.z + 0.8)} V. The MOSFET V<sub>DSS</sub> should be at least 25 % above that.`) },
    { id: 'slow', topic: 'inductive', lvl: 'i', type: 'mc',
      q: ['20 kHz PWM’li bir motorda flyback olarak 1N4007 kullanılırsa MOSFET neden ısınır?', 'Why does the MOSFET heat up when a 1N4007 is the flyback diode of a 20 kHz PWM motor?'],
      opts: [['İleri gerilimi çok düşük olduğu için', 'Its forward voltage is too low'], ['Ters toparlanma: MOSFET açılınca diyot bir süre ters iletir; akım tepesi ve kayıp', 'Reverse recovery: when the MOSFET turns on, the diode briefly conducts backwards; current spike and loss', 1],
        ['Diyot gate’i yükler', 'The diode loads the gate'], ['1000 V’luk olduğu için kapasitansı sıfırdır', 'Being a 1000 V part its capacitance is zero']],
      ex: ['Standart doğrultucunun t<sub>rr</sub>’si mikrosaniyelerdir. PWM’de Schottky (SS34) ya da ultra hızlı (UF4007) kullan.', 'A standard rectifier has a t<sub>rr</sub> of microseconds. Under PWM use a Schottky (SS34) or an ultrafast diode (UF4007).'] },
    { id: 'release', topic: 'inductive', lvl: 'i', type: 'mc',
      q: ['Düz bir flyback diyodu röleyi neden yavaş bırakır?', 'Why does a plain flyback diode make a relay release slowly?'],
      opts: [['Diyot kontakları yapıştırır', 'The diode welds the contacts'], ['Bobin akımı yalnızca ~0,7 V’a karşı söner; düşüş L/R ile yavaş olur', 'The coil current decays against only ~0.7 V, so it falls slowly with L/R', 1], ['Diyot bobine ters akım verir', 'The diode feeds reverse current into the coil'], ['MOSFET geç kapanır', 'The MOSFET turns off late']],
      ex: ['Akımın düşüş hızı di/dt = V/L’dir. Seri zener ya da TVS söndürme gerilimini artırır ve bırakmayı hızlandırır.', 'The current falls at di/dt = V/L. A series zener or TVS raises the decay voltage and speeds release.'] },
    { id: 'aval', topic: 'inductive', lvl: 'a', type: 'tf', ans: false,
      q: ['Avalanş değeri olan bir MOSFET, normal çalışmada her döngüde bobin enerjisini diyot yerine kendisi yutabilir.', 'A MOSFET with an avalanche rating can absorb the coil energy every cycle in normal operation instead of a diode.'],
      ex: ['Yanlış. Avalanş derecesi nadir arızalar içindir; her döngüdeki enerji jonksiyonu ısıtır ve parçayı yaşlandırır. Bir söndürme yolu ver.', 'False. Avalanche ratings are for rare faults; energy every cycle heats the junction and wears the part. Give it a clamp path.'] },
    { id: 'decay', topic: 'inductive', lvl: 'a', type: 'num', unit: 'ms', tol: 0.05,
      gen: r => ({ l: pick(r, [10, 47, 100]), i: pick(r, [0.5, 1, 2]), z: pick(r, [12, 24, 33]) }),
      q: (p, L) => L(`L = ${p.l} mH, I = ${nn(p.i)} A. Bobin kapanışta diyot (0,8 V) + ${p.z} V zener üzerinden sönüyor. Bobin direncini ihmal et: akım kaç ms’de sıfıra iner?`, `L = ${p.l} mH, I = ${nn(p.i)} A. At turn-off the coil decays through a diode (0.8 V) + ${p.z} V zener. Ignoring coil resistance, how many ms until the current is zero?`),
      ans: p => p.l * p.i / (p.z + 0.8),
      ex: (p, L) => L(`t = L · I / V = ${p.l} mH · ${nn(p.i)} A / ${nn(p.z + 0.8)} V = ${nn(p.l * p.i / (p.z + 0.8))} ms. Bobin direnci bunu biraz daha kısaltır.`, `t = L · I / V = ${p.l} mH · ${nn(p.i)} A / ${nn(p.z + 0.8)} V = ${nn(p.l * p.i / (p.z + 0.8))} ms. Coil resistance makes it a little shorter.`) },
    { id: 'm-fast', topic: 'inductive', lvl: 'i', type: 'multi',
      q: ['Düz flyback diyoduna göre röleyi daha hızlı bırakan çözümler hangileri? (hepsini seç)', 'Which clamps release a relay faster than a plain flyback diode? (select all)'],
      opts: [['Diyot + seri zener', 'Diode + series zener', 1, 'Söndürme gerilimi V<sub>Z</sub> kadar artar.', 'Raises the decay voltage by V<sub>Z</sub>.'],
        ['Bobine paralel iki yönlü TVS', 'Bidirectional TVS across the coil', 1, 'Yüksek ve sabit bir kenetleme gerilimi.', 'A high, fixed clamp voltage.'],
        ['Diyot + seri direnç', 'Diode + series resistor', 1, 'I·R kadar ek söndürme gerilimi.', 'Adds I·R of decay voltage.'],
        ['1N4007 yerine Schottky', 'A Schottky instead of a 1N4007', 0, 'V<sub>F</sub> daha da düşer, bırakma hızlanmaz.', 'Even lower V<sub>F</sub>, no faster release.'],
        ['Paralel iki flyback diyodu', 'Two flyback diodes in parallel', 0, 'Söndürme gerilimi aynı kalır.', 'The decay voltage stays the same.']],
      ex: ['Bırakma hızı söndürme gerilimine bağlıdır: di/dt = V/L. Gerilimi artıran her çözüm hızlandırır; MOSFET’in V<sub>DS</sub>’ini de yükselt.', 'Release speed depends on the decay voltage: di/dt = V/L. Anything that raises it is faster; raise the MOSFET V<sub>DS</sub> rating too.'] },
    { id: 'sp-diode', topic: 'inductive', lvl: 'b', type: 'spot',
      q: ['Röle sürücüsü ilk açılışta MOSFET’i yakıyor. Şemadaki hata hangisi?', 'This relay driver kills its MOSFET the first time it turns on. What is wrong?'],
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 215, `
        ${S.vcc(200, 22, '+12 V')}${S.w([[200, 22], [200, 40]])}${S.ind(200, 70, 0, '')}${S.text(188, 74, 'K1', '', 'end')}
        ${S.dot(200, 34)}${S.w([[200, 34], [270, 34], [270, 40]])}${S.diode(270, 70, 0, '')}${S.text(286, 74, 'D1', '', 'start')}${S.w([[270, 100], [270, 106], [200, 106]])}${S.dot(200, 106)}
        ${S.w([[200, 100], [200, 110]])}${S.nmos(180, 140, '')}${S.text(226, 152, 'Q1', '', 'start')}${S.gnd(200, 170)}
        ${S.res(110, 140, 90, '')}${S.text(110, 126, 'R1 100 Ω', '', 'middle')}${S.w([[140, 140], [150, 140]], 'sigw')}${S.w([[30, 140], [80, 140]], 'sigw')}${S.text(30, 132, 'GPIO', 'sig', 'start')}
        ${S.dot(145, 140)}${S.res(145, 170, 0, '')}${S.text(133, 174, 'R2', '', 'end')}${S.gnd(145, 200)}`); },
      opts: [['D1 ters takılmış: Q1 açılınca beslemeyi D1 ve Q1 üzerinden kısa devre eder', 'D1 is reversed: when Q1 turns on it shorts the supply through D1 and Q1', 1], ['R2 pull-down +12 V’a gitmeli', 'Pull-down R2 should go to +12 V'], ['K1, Q1’in altına konmalı', 'K1 should sit below Q1'], ['R1 gereksiz', 'R1 is not needed']],
      ex: ['Anot +12 V’ta, katot drain’de: Q1 açılınca diyot ileri yönde iletir ve akımı yalnızca R<sub>DS(on)</sub> sınırlar. Katot + uca gelmeli.', 'Anode at +12 V, cathode at the drain: when Q1 turns on the diode is forward-biased and only R<sub>DS(on)</sub> limits the current. The cathode belongs at +.'] },
    { id: 'sc-aval', topic: 'inductive', lvl: 'a', type: 'scope',
      q: ['12 V röle bobini, söndürme yok, 60 V’luk MOSFET. Kapanışta drain ~68 V’ta düz bir tepe yapıyor ve I<sub>D</sub> o sırada doğrusal azalıyor. Bu nedir?', '12 V relay coil, no clamp, 60 V MOSFET. At turn-off the drain sits flat near 68 V while I<sub>D</sub> ramps down. What is it?'],
      fig: (el, p, H) => {
        const toff = 40e-6, tav = 107e-6;
        const v = t => t < toff ? 0.15 : t < toff + 1e-6 ? 0.15 + 67.85 * (t - toff) / 1e-6 : t < toff + tav ? 68 : 12 + 56 * Math.exp(-(t - toff - tav) / 3e-6) * Math.cos(2 * Math.PI * (t - toff - tav) / 8e-6);
        const i = t => t < toff ? 0.03 : t < toff + tav ? 0.03 * (1 - (t - toff) / tav) : 0;
        scope(el, { t0: 0, tdiv: 20e-6, channels: [{ key: 'v', name: 'V_DS', color: 'ch1', unit: 'V', scale: 20, pos: -3 }, { key: 'i', name: 'I_D', color: 'ch3', unit: 'A', scale: 0.01, pos: -3.6 }] }, { v: samp(v, 0, 200e-6, 800), i: samp(i, 0, 200e-6, 400) });
      },
      opts: [['MOSFET avalanş kırılmasında: bobin enerjisini kendisi yutuyor', 'The MOSFET is in avalanche breakdown, absorbing the coil energy itself', 1], ['Miller platosu', 'The Miller plateau'], ['Normal çalışan bir zener kelepçe', 'A zener clamp working normally'], ['PCB çınlaması', 'PCB ringing']],
      ex: ['60 V’luk parça ~1,1–1,3 × V<sub>DSS</sub>’te avalanşa girer ve ½·L·I²’yi her kapanışta ısıya çevirir. Flyback diyodu ya da zener kelepçe ekle.', 'A 60 V part avalanches at ~1.1–1.3 × V<sub>DSS</sub> and turns ½·L·I² into heat at every turn-off. Add a flyback diode or a zener clamp.'] },
    { id: 'sc-zener', topic: 'inductive', lvl: 'i', type: 'scope', unit: 'V', tol: 0.12,
      q: ['24 V solenoid, diyot (V<sub>F</sub> = 0,8 V) + zener kelepçe. Skoptaki kelepçe seviyesini oku. Zener gerilimi V<sub>Z</sub> kaç volt?', '24 V solenoid, diode (V<sub>F</sub> = 0.8 V) + zener clamp. Read the clamp level from the scope. What is the zener voltage V<sub>Z</sub>?'],
      fig: (el, p, H) => {
        const toff = 0.4e-3, td = 0.74e-3, vc = 57.8;
        const v = t => t < toff ? 0.2 : t < toff + 5e-6 ? 0.2 + (vc - 0.2) * (t - toff) / 5e-6 : t < toff + td ? vc : 24 + (vc - 24) * Math.exp(-(t - toff - td) / 15e-6);
        const i = t => t < toff ? 0.5 : t < toff + td ? 0.5 * (1 - (t - toff) / td) : 0;
        scope(el, { t0: 0, tdiv: 0.2e-3, channels: [{ key: 'v', name: 'V_DS', color: 'ch1', unit: 'V', scale: 10, pos: -3.5 }, { key: 'i', name: 'I_L', color: 'ch3', unit: 'A', scale: 0.2, pos: -3.5 }] }, { v: samp(v, 0, 2e-3, 800), i: samp(i, 0, 2e-3, 400) });
      },
      ans: () => 33,
      ex: ['Tepe ≈ 58 V = 24 + V<sub>Z</sub> + 0,8 → V<sub>Z</sub> ≈ 33 V. Akım bu sırada doğrusal söner: di/dt = 33,8 V / L.', 'The peak ≈ 58 V = 24 + V<sub>Z</sub> + 0.8 → V<sub>Z</sub> ≈ 33 V. The current falls linearly meanwhile: di/dt = 33.8 V / L.'] },

    /* =================== 09 · switching =================== */
    { id: 'psw', topic: 'switching', lvl: 'i', type: 'num', unit: 'W', tol: 0.05,
      gen: r => ({ v: pick(r, [12, 24]), i: pick(r, [2, 3, 5]), ts: pick(r, [100, 200, 400]), f: pick(r, [20, 50, 100]) }),
      q: (p, L) => L(`Endüktif yükte sert anahtarlama: V = ${p.v} V, I = ${p.i} A, t<sub>r</sub> + t<sub>f</sub> = ${p.ts} ns, f = ${p.f} kHz. Anahtarlama kaybı kaç watt?`, `Hard switching an inductive load: V = ${p.v} V, I = ${p.i} A, t<sub>r</sub> + t<sub>f</sub> = ${p.ts} ns, f = ${p.f} kHz. Switching loss in watts?`),
      ans: p => 0.5 * p.v * p.i * p.ts * 1e-9 * p.f * 1e3,
      ex: (p, L) => L(`P ≈ ½ · V · I · (t<sub>r</sub> + t<sub>f</sub>) · f = ½ · ${p.v} · ${p.i} · ${p.ts} ns · ${p.f} kHz = ${nn(0.5 * p.v * p.i * p.ts * p.f * 1e-6)} W.`, `P ≈ ½ · V · I · (t<sub>r</sub> + t<sub>f</sub>) · f = ½ · ${p.v} · ${p.i} · ${p.ts} ns · ${p.f} kHz = ${nn(0.5 * p.v * p.i * p.ts * p.f * 1e-6)} W.`) },
    { id: 'rip', topic: 'switching', lvl: 'i', type: 'num', unit: 'A', tol: 0.05,
      gen: r => ({ l: pick(r, [0.2, 0.5, 1]), f: pick(r, [5, 10, 20]) }),
      q: (p, L) => L(`12 V, D = 0,5, motor endüktansı ${nn(p.l)} mH, PWM ${p.f} kHz. Akım dalgalanması ΔI<sub>pp</sub> = V·D·(1−D) / (L·f) kaç amper?`, `12 V, D = 0.5, motor inductance ${nn(p.l)} mH, PWM ${p.f} kHz. Current ripple ΔI<sub>pp</sub> = V·D·(1−D) / (L·f) in amps?`),
      ans: p => 12 * 0.25 / (p.l * 1e-3 * p.f * 1e3),
      ex: (p, L) => L(`ΔI = 12 · 0,25 / (${nn(p.l)} mH · ${p.f} kHz) = ${nn(3 / (p.l * p.f))} A. Frekansı artırmak dalgalanmayı orantılı azaltır.`, `ΔI = 12 · 0.25 / (${nn(p.l)} mH · ${p.f} kHz) = ${nn(3 / (p.l * p.f))} A. Raising the frequency reduces ripple proportionally.`) },
    { id: 'qgd', topic: 'switching', lvl: 'a', type: 'num', unit: 'ns', tol: 0.05,
      gen: r => ({ r: pick(r, [100, 150, 250]), q: pick(r, [8, 21, 25]) }),
      q: (p, L) => L(`5 V GPIO, gate yolunun toplam direnci ${p.r} Ω (pin dahil), Miller platosu 3 V, Q<sub>gd</sub> = ${p.q} nC. V<sub>DS</sub> geçişi kaç ns sürer?`, `5 V GPIO, total gate path resistance ${p.r} Ω (pin included), Miller plateau 3 V, Q<sub>gd</sub> = ${p.q} nC. How many ns does the V<sub>DS</sub> transition take?`),
      ans: p => p.q * p.r / 2,
      ex: (p, L) => L(`I<sub>G</sub> = (5 − 3) / ${p.r} = ${nn(2000 / p.r)} mA; t = Q<sub>gd</sub> / I<sub>G</sub> = ${nn(p.q * p.r / 2)} ns. Kapanışta sürücü (3 − 0) V ile çeker; süre farklıdır.`, `I<sub>G</sub> = (5 − 3) / ${p.r} = ${nn(2000 / p.r)} mA; t = Q<sub>gd</sub> / I<sub>G</sub> = ${nn(p.q * p.r / 2)} ns. At turn-off the pull is (3 − 0) V, so that time differs.`) },
    { id: 'fdouble', topic: 'switching', lvl: 'b', type: 'tf', ans: true,
      q: ['PWM frekansını iki katına çıkarmak anahtarlama kaybını iki katına çıkarır, iletim kaybını değiştirmez.', 'Doubling the PWM frequency doubles switching loss but leaves conduction loss unchanged.'],
      ex: ['Doğru. Her kenar sabit enerji harcar, P<sub>sw</sub> = E · f. İletim kaybı yalnızca I<sub>RMS</sub> ve R<sub>DS(on)</sub>’a bağlıdır.', 'True. Each edge costs a fixed energy, P<sub>sw</sub> = E · f. Conduction loss only depends on I<sub>RMS</sub> and R<sub>DS(on)</sub>.'] },
    { id: 'gpiopwm', topic: 'switching', lvl: 'i', type: 'mc',
      q: ['3,3 V GPIO büyük bir MOSFET’i 50 kHz’de doğrudan sürüyor ve MOSFET ısınıyor. Asıl neden?', 'A 3.3 V GPIO drives a big MOSFET directly at 50 kHz and the MOSFET heats. Main reason?'],
      opts: [['GPIO yalnızca ~20–40 mA verir; kenarlar mikrosaniyeler sürer ve anahtarlama kaybı büyür', 'The GPIO only gives ~20–40 mA; edges take microseconds and switching loss grows', 1], ['GPIO çok hızlıdır, çınlama yapar', 'The GPIO is too fast and rings'], ['Body diyot sürekli iletir', 'The body diode conducts all the time'], ['V<sub>GS(max)</sub> aşılır', 'V<sub>GS(max)</sub> is exceeded']],
      ex: ['t ≈ Q<sub>gd</sub> / I<sub>G</sub>: 25 nC / 20 mA ≈ 1,25 µs her kenarda. Hızlı PWM’de 1–2 A’lik gate sürücü kullan.', 't ≈ Q<sub>gd</sub> / I<sub>G</sub>: 25 nC / 20 mA ≈ 1.25 µs per edge. For fast PWM use a 1–2 A gate driver.'] },
    { id: 'speedup', topic: 'switching', lvl: 'i', type: 'mc',
      q: ['Doymuş bir BJT’nin kapanma gecikmesini (storage time) ne kısaltır?', 'What shortens the turn-off delay (storage time) of a saturated BJT?'],
      opts: [['R<sub>B</sub>’ye paralel hızlandırma kondansatörü ya da Baker clamp', 'A speed-up capacitor across R<sub>B</sub> or a Baker clamp', 1], ['Collector’a toprağa kondansatör', 'A capacitor from collector to ground'], ['Daha büyük bir yük', 'A bigger load'], ['Besleme gerilimini düşürmek', 'Lowering the supply voltage']],
      ex: ['Gecikme, base’de biriken fazla yükten gelir. Kondansatör bu yükü hızla boşaltır, Baker clamp ise derin doyumu önler.', 'The delay comes from excess charge stored in the base. The capacitor pulls it out fast; a Baker clamp prevents deep saturation.'] },
    { id: 'sc-miller', topic: 'switching', lvl: 'i', type: 'scope',
      q: ['Açılışta V<sub>GS</sub> ve V<sub>DS</sub> (12 V, endüktif yük). V<sub>GS</sub>’in düz kaldığı aralıkta ne olur?', 'Turn-on V<sub>GS</sub> and V<sub>DS</sub> (12 V, inductive load). What happens while V<sub>GS</sub> stays flat?'],
      fig: (el, p, H) => {
        const n = 1e-9, a = 50 * n, b = 250 * n, c = 600 * n;
        const g = t => t < a ? 0 : t < b ? 2.8 * (1 - Math.exp(-(t - a) / (120 * n))) / (1 - Math.exp(-200 / 120)) : t < c ? 2.8 : 2.8 + 2.2 * (1 - Math.exp(-(t - c) / (80 * n)));
        const d = t => t < b ? 12 : t < c ? 12 - 11.7 * Math.pow((t - b) / (c - b), 0.6) : 0.3 - 0.2 * (1 - Math.exp(-(t - c) / (80 * n)));
        scope(el, { t0: 0, tdiv: 100 * n, channels: [{ key: 'd', name: 'V_DS', color: 'ch1', unit: 'V', scale: 5, pos: 0.8 }, { key: 'g', name: 'V_GS', color: 'ch2', unit: 'V', scale: 1, pos: -3.8 }] }, { d: samp(d, 0, 1000 * n), g: samp(g, 0, 1000 * n) });
      },
      opts: [['MOSFET zaten tam açıktır', 'The MOSFET is already fully on'], ['Gate akımı sıfırdır', 'Gate current is zero'], ['Gate akımı C<sub>gd</sub>’yi şarj ederken V<sub>DS</sub> düşer (Miller platosu)', 'Gate current charges C<sub>gd</sub> while V<sub>DS</sub> falls (Miller plateau)', 1], ['V<sub>GS(th)</sub>’e yeni ulaşılmıştır, I<sub>D</sub> = 0', 'V<sub>GS(th)</sub> was just reached, I<sub>D</sub> = 0']],
      ex: ['Drain gerilimi düşerken gate akımının tamamı C<sub>gd</sub>’ye gider ve V<sub>GS</sub> düz kalır. Anahtarlama kaybının çoğu burada oluşur.', 'While the drain voltage falls, all gate current goes into C<sub>gd</sub> and V<sub>GS</sub> stays flat. Most switching loss happens here.'] },
    { id: 'pk-100k', topic: 'switching', lvl: 'a', type: 'part',
      q: ['12 V, 5 A, 100 kHz, 5 V gate sürücü (1 A). Toplam kaybı (I²·R @ 5 V + anahtarlama, t<sub>r</sub> ≈ t<sub>f</sub> ≈ Q<sub>gd</sub> / 1 A) en düşük MOSFET hangisi?', '12 V, 5 A, 100 kHz, 5 V gate driver (1 A). Which MOSFET has the lowest total loss (I²·R @ 5 V + switching, t<sub>r</sub> ≈ t<sub>f</sub> ≈ Q<sub>gd</sub> / 1 A)?'],
      parts: ['IRLB8721', 'IRF3205', 'IRLZ44N', 'IRF540N'],
      spec: (m, P) => [`${m.type}-MOS`, m.pkg, `R<sub>DS(on)</sub> @ 5 V ≈ ${mo(P.rds(m, 5))} mΩ`, `Q<sub>gd</sub> ${m.qgd} nC`, `Q<sub>g</sub> ${m.qg} nC`],
      judge: (m, P, all) => {
        const loss = x => 25 * P.rds(x, 5) + 0.5 * 12 * 5 * (2 * x.qgd * 1e-9) * 1e5;
        const best = Math.min(...all.map(loss)), l = loss(m), pc = 25 * P.rds(m, 5), ps = l - pc;
        const t = `${nn(pc, 2)} + ${nn(ps, 2)} = ${nn(l, 2)} W`;
        return { ok: Math.abs(l - best) < 1e-9, tr: t, en: t };
      },
      ex: ['IRLB8721 hem 5 V’ta düşük R<sub>DS(on)</sub> hem de çok küçük Q<sub>gd</sub> verir. IRF3205’in büyük Q<sub>gd</sub>’si 100 kHz’de pahalıya patlar.', 'The IRLB8721 has both low R<sub>DS(on)</sub> at 5 V and a tiny Q<sub>gd</sub>. The IRF3205’s large Q<sub>gd</sub> costs dearly at 100 kHz.'] },
    { id: 'o-turnon', topic: 'switching', lvl: 'a', type: 'order',
      q: ['Endüktif yükte MOSFET açılışının aşamalarını sırala.', 'Put the stages of a MOSFET turn-on into an inductive load in order.'],
      items: [['V<sub>GS</sub> eşiğe yükselir; C<sub>gs</sub> dolar, akım yok', 'V<sub>GS</sub> rises to threshold; C<sub>gs</sub> charges, no current'], ['I<sub>D</sub> yük akımına yükselir, V<sub>DS</sub> hâlâ yüksek', 'I<sub>D</sub> rises to the load current, V<sub>DS</sub> still high'],
        ['Miller platosu: V<sub>GS</sub> düz, V<sub>DS</sub> düşer', 'Miller plateau: V<sub>GS</sub> flat, V<sub>DS</sub> falls'], ['V<sub>GS</sub> sürme gerilimine çıkar, R<sub>DS(on)</sub> son değerine iner', 'V<sub>GS</sub> climbs to the drive voltage, R<sub>DS(on)</sub> reaches its final value']],
      ex: ['2. ve 3. aşamada akım ile gerilim birlikte vardır; kayıp burada oluşur. Son aşama yalnızca iletim direncini düşürür.', 'In stages 2 and 3 current and voltage coexist; that is where the loss is. The last stage only lowers on-resistance.'] },

    /* =================== 10 · gate-drivers =================== */
    { id: 'dead', topic: 'gate-drivers', lvl: 'b', type: 'mc',
      q: ['Yarım köprüde dead-time’ın amacı nedir?', 'What is dead-time for in a half-bridge?'],
      opts: [['Gate kayıplarını azaltmak', 'To reduce gate losses'], ['Üst ve alt anahtarın aynı anda iletmesini (shoot-through) önlemek', 'To stop the high and low switches conducting together (shoot-through)', 1], ['PWM frekansını düşürmek', 'To lower the PWM frequency'], ['Bootstrap kondansatörünü boşaltmak', 'To discharge the bootstrap capacitor']],
      ex: ['MOSFET açılmasından yavaş kapanır. Arada boşluk yoksa besleme bir an toprağa kısa devre olur; 50–200 ns çoğu zaman yeter.', 'A MOSFET turns off slower than it turns on. Without a gap the supply is briefly shorted; 50–200 ns is usually enough.'] },
    { id: 'boot', topic: 'gate-drivers', lvl: 'i', type: 'mc',
      q: ['Yarım köprü sürücüsündeki bootstrap kondansatörü ne işe yarar?', 'What does the bootstrap capacitor in a half-bridge driver do?'],
      opts: [['Besleme gerilimini filtreler', 'Filters the supply voltage'], ['High-side N-MOS’un gate’ini source’unun (anahtarlama düğümü) üstüne çıkaracak gerilimi sağlar', 'Provides the voltage that lifts the high-side N-MOS gate above its source (the switch node)', 1], ['Dead-time’ı belirler', 'Sets the dead-time'], ['Motorun inrush akımını sınırlar', 'Limits motor inrush']],
      ex: ['Alt anahtar iletirken kondansatör diyotla dolar, üst anahtar açılınca düğümle birlikte yükselir.', 'The capacitor charges through a diode while the low switch is on, then rides up with the switch node.'] },
    { id: 'boot100', topic: 'gate-drivers', lvl: 'i', type: 'tf', ans: false,
      q: ['Bootstrap’lı bir high-side sürücü üst MOSFET’i süresiz açık tutabilir (%100 doluluk).', 'A bootstrap high-side driver can keep the top MOSFET on indefinitely (100 % duty).'],
      ex: ['Yanlış. Kondansatör yalnızca alt anahtar iletirken dolar; kaçak ve gate akımı onu boşaltır. %100 için charge pump ya da izole besleme gerekir.', 'False. The capacitor only recharges while the low switch conducts; leakage and gate current drain it. 100 % needs a charge pump or isolated supply.'] },
    { id: 'bootc', topic: 'gate-drivers', lvl: 'a', type: 'num', unit: 'nF', tol: 0.05,
      gen: r => ({ q: pick(r, [20, 48, 71, 146]), dv: pick(r, [0.5, 1]) }),
      q: (p, L) => L(`High-side MOSFET Q<sub>g</sub> = ${p.q} nC. Her açılışta bootstrap geriliminin en fazla ${nn(p.dv)} V düşmesi isteniyor. Kaçakları ihmal et: en küçük C<sub>boot</sub> kaç nF?`, `High-side MOSFET Q<sub>g</sub> = ${p.q} nC. The bootstrap voltage may sag at most ${nn(p.dv)} V per turn-on. Ignoring leakage, smallest C<sub>boot</sub> in nF?`),
      ans: p => p.q / p.dv,
      ex: (p, L) => L(`C = Q<sub>g</sub> / ΔV = ${p.q} nC / ${nn(p.dv)} V = ${nn(p.q / p.dv)} nF. Kaçak ve tolerans için pratikte ~10 kat büyüğünü seç.`, `C = Q<sub>g</sub> / ΔV = ${p.q} nC / ${nn(p.dv)} V = ${nn(p.q / p.dv)} nF. For leakage and tolerance pick ~10× that in practice.`) },
    { id: 'uvlo', topic: 'gate-drivers', lvl: 'i', type: 'mc',
      q: ['Gate sürücüsünde UVLO (düşük gerilim kilidi) neden önemlidir?', 'Why does UVLO (under-voltage lockout) matter in a gate driver?'],
      opts: [['PWM frekansını sabitler', 'It fixes the PWM frequency'], ['Sürücü beslemesi düşünce MOSFET yarı açık kalıp yanmasın diye çıkışı kapatır', 'It turns the output off when the driver supply sags, so the MOSFET is not left half-on to burn', 1], ['Dead-time ekler', 'It adds dead-time'], ['Flyback’i kenetler', 'It clamps flyback']],
      ex: ['Düşük V<sub>GS</sub> MOSFET’i lineer bölgede bırakır ve saniyeler içinde yakar. UVLO bu durumda gate’i LOW tutar.', 'A low V<sub>GS</sub> leaves the MOSFET in its linear region and burns it in seconds. UVLO holds the gate LOW instead.'] },
    { id: 'ldidt', topic: 'gate-drivers', lvl: 'i', type: 'num', unit: 'V', tol: 0.03,
      gen: r => ({ l: pick(r, [10, 20, 40]), d: pick(r, [0.5, 1, 2]) }),
      q: (p, L) => L(`Güç döngüsü ${p.l} mm uzunluğunda (≈ 1 nH/mm). Kapanışta di/dt = ${nn(p.d)} A/ns. Döngü endüktansında kaç volt aşma oluşur?`, `The power loop is ${p.l} mm long (≈ 1 nH/mm). At turn-off di/dt = ${nn(p.d)} A/ns. How many volts of overshoot across the loop inductance?`),
      ans: p => p.l * p.d,
      ex: (p, L) => L(`V = L · di/dt = ${p.l} nH · ${nn(p.d)} A/ns = ${nn(p.l * p.d)} V. Bu gerilim V<sub>DS</sub>’e eklenir: döngüyü kısa tut.`, `V = L · di/dt = ${p.l} nH · ${nn(p.d)} A/ns = ${nn(p.l * p.d)} V. It adds on top of V<sub>DS</sub>: keep the loop short.`) },
    { id: 'kelvin', topic: 'gate-drivers', lvl: 'a', type: 'tf', ans: true,
      q: ['Sürücü toprağı güç yolundan değil, ayrı bir izle (Kelvin) doğrudan source pinine dönmelidir.', 'The driver ground should return to the source pin through its own trace (Kelvin), not through the power path.'],
      ex: ['Doğru. Ortak source endüktansındaki L·di/dt gerilimi V<sub>GS</sub>’ten düşer, anahtarlamayı yavaşlatır ve osilasyon yapar.', 'True. The L·di/dt across shared source inductance subtracts from V<sub>GS</sub>, slows switching and can oscillate.'] },
    { id: 'm-ring', topic: 'gate-drivers', lvl: 'i', type: 'multi',
      q: ['Gate çınlamasını ve V<sub>DS</sub> aşmasını hangileri azaltır? (hepsini seç)', 'Which reduce gate ringing and V<sub>DS</sub> overshoot? (select all)'],
      opts: [['Güç döngüsünün alanını küçültmek', 'Shrinking the power loop area', 1, 'Daha az L, daha az L·di/dt.', 'Less L, less L·di/dt.'],
        ['Gate direncini gate pinine yakın koymak', 'Placing the gate resistor close to the gate pin', 1, 'LC rezonansını sönümler.', 'Damps the LC resonance.'],
        ['Kelvin source bağlantısı', 'A Kelvin source connection', 1, 'Güç akımı gate döngüsünden çıkar.', 'Takes power current out of the gate loop.'],
        ['Sürücüden MOSFET’e uzun gate kabloları', 'Long gate wires from driver to MOSFET', 0, 'Endüktansı artırır, çınlamayı büyütür.', 'Adds inductance and more ringing.'],
        ['Gate pull-down’ı çıkarmak', 'Removing the gate pull-down', 0, 'Çınlamaya etkisi yok, güvenliği bozar.', 'No effect on ringing, hurts safety.']],
      ex: ['Çınlama parazit L ile kapasitanstan gelir. Endüktansı azalt ve sönümleme ekle.', 'Ringing comes from stray L and capacitance. Cut the inductance and add damping.'] },
    { id: 'sc-ring', topic: 'gate-drivers', lvl: 'a', type: 'scope', unit: 'nH', tol: 0.25,
      q: ['24 V yarım köprü, kapanışta anahtarlama düğümü çınlıyor. C<sub>oss</sub> = 500 pF. Çınlama periyodunu oku ve döngü endüktansını tahmin et (nH).', '24 V half-bridge, the switch node rings at turn-off. C<sub>oss</sub> = 500 pF. Read the ringing period and estimate the loop inductance (nH).'],
      fig: (el, p, H) => {
        const n = 1e-9, t1 = 20 * n, t2 = 25 * n;
        const v = t => t < t1 ? 0.3 : t < t2 ? 0.3 + 23.7 * (t - t1) / (5 * n) : 24 + 14 * Math.exp(-(t - t2) / (30 * n)) * Math.sin(2 * Math.PI * (t - t2) / (20 * n));
        scope(el, { t0: 0, tdiv: 10 * n, channels: [{ key: 'v', name: 'V_SW', color: 'ch1', unit: 'V', scale: 10, pos: -3 }] }, { v: samp(v, 0, 100 * n, 800) });
      },
      ans: () => 1 / (Math.pow(2 * Math.PI * 50e6, 2) * 500e-12) * 1e9,
      ex: ['Periyot ≈ 20 ns → f ≈ 50 MHz. L = 1 / ((2π·f)² · C) = 1 / ((2π · 50 MHz)² · 500 pF) ≈ 20 nH: yaklaşık 2 cm’lik döngü.', 'Period ≈ 20 ns → f ≈ 50 MHz. L = 1 / ((2π·f)² · C) = 1 / ((2π · 50 MHz)² · 500 pF) ≈ 20 nH: about a 2 cm loop.'] },
    { id: 'o-bringup', topic: 'gate-drivers', lvl: 'i', type: 'order',
      q: ['Yeni bir yarım köprüyü güvenle devreye alma adımlarını sırala.', 'Put the steps for safely bringing up a new half-bridge in order.'],
      items: [['Güç katı beslemesizken gate sinyallerini skopla kontrol et', 'Check the gate signals on a scope with the power stage unpowered'], ['Dead-time’ı ve iki gate’in asla çakışmadığını ölç', 'Measure dead-time and confirm the gates never overlap'],
        ['Güç katını akım sınırlı laboratuvar kaynağından düşük gerilimle besle', 'Power the stage from a current-limited bench supply at low voltage'], ['Yükü bağla ve gerilimi adım adım artır', 'Connect the load and raise the voltage step by step'],
        ['Tam yükte sıcaklıkları ve V<sub>DS</sub> aşmasını ölç', 'Measure temperatures and V<sub>DS</sub> overshoot at full load']],
      ex: ['Önce sinyal, sonra düşük enerji, en son tam güç. Bir hata ilk adımlarda ucuza yakalanır.', 'Signals first, then low energy, full power last. A fault is cheap to catch in the early steps.'] },

    /* =================== 11 · inrush =================== */
    { id: 'inr', topic: 'inrush', lvl: 'i', type: 'num', unit: 'A', tol: 0.05,
      gen: r => ({ c: pick(r, [100, 220, 470, 1000]), t: pick(r, [2, 5, 10]) }),
      q: (p, L) => L(`${p.c} µF’lık yük kondansatörü 12 V’a doğrusal bir rampayla ${p.t} ms’de şarj ediliyor. Şarj akımı kaç amper?`, `A ${p.c} µF load capacitor is charged to 12 V with a linear ramp in ${p.t} ms. What is the charging current in amps?`),
      ans: p => p.c * 1e-6 * 12 / (p.t * 1e-3),
      ex: (p, L) => L(`I = C · dV/dt = ${p.c} µF · 12 V / ${p.t} ms = ${nn(p.c * 12e-3 / p.t)} A.`, `I = C · dV/dt = ${p.c} µF · 12 V / ${p.t} ms = ${nn(p.c * 12e-3 / p.t)} A.`) },
    { id: 'ecap', topic: 'inrush', lvl: 'i', type: 'num', unit: 'mJ', tol: 0.03,
      gen: r => ({ c: pick(r, [470, 1000, 2200, 4700]), v: pick(r, [12, 24]) }),
      q: (p, L) => L(`${p.c} µF kondansatör 0’dan ${p.v} V’a şarj ediliyor. Şarj yolundaki dirençlerde toplam kaç mJ ısı açığa çıkar?`, `A ${p.c} µF capacitor is charged from 0 to ${p.v} V. How many mJ of heat end up in the charging path resistance?`),
      ans: p => 0.5 * p.c * 1e-6 * p.v * p.v * 1000,
      ex: (p, L) => L(`E = ½ · C · V² = ½ · ${p.c} µF · ${p.v}² = ${nn(0.5 * p.c * p.v * p.v / 1000)} mJ. Direncin değeri ne olursa olsun aynıdır.`, `E = ½ · C · V² = ½ · ${p.c} µF · ${p.v}² = ${nn(0.5 * p.c * p.v * p.v / 1000)} mJ. It is the same whatever the resistance.`) },
    { id: 'peakvr', topic: 'inrush', lvl: 'b', type: 'num', unit: 'A', tol: 0.03,
      gen: r => ({ v: pick(r, [12, 24]), r: pick(r, [0.05, 0.1, 0.2, 0.5]) }),
      q: (p, L) => L(`Boş bir bulk kondansatör ${p.v} V’a anahtarlanıyor. Kaynak + kablo + anahtar + ESR toplamı ${nn(p.r * 1000)} mΩ. Tepe akım kaç amper?`, `An empty bulk capacitor is switched onto ${p.v} V. Source + wiring + switch + ESR total ${nn(p.r * 1000)} mΩ. Peak current in amps?`),
      ans: p => p.v / p.r,
      ex: (p, L) => L(`I<sub>tepe</sub> = V / R<sub>toplam</sub> = ${p.v} / ${nn(p.r)} = ${nn(p.v / p.r)} A. Boş kondansatör ilk anda kısa devre gibidir.`, `I<sub>peak</sub> = V / R<sub>total</sub> = ${p.v} / ${nn(p.r)} = ${nn(p.v / p.r)} A. An empty capacitor starts out like a short.`) },
    { id: 'ntc', topic: 'inrush', lvl: 'b', type: 'tf', ans: false,
      q: ['NTC inrush sınırlayıcı, cihaz kapatılıp hemen yeniden açılınca da aynı korumayı sağlar.', 'An NTC inrush limiter protects just as well when the device is switched off and straight back on.'],
      ex: ['Yanlış. Çalışırken NTC ısınır ve direnci düşer; sıcak yeniden başlatmada neredeyse hiç sınırlamaz.', 'False. In operation the NTC is hot and its resistance low; on a hot restart it barely limits anything.'] },
    { id: 'softe', topic: 'inrush', lvl: 'a', type: 'mc',
      q: ['MOSFET’le yavaş rampa (soft-start) bir kondansatörü şarj ediyor. Rampayı 10 kat uzatınca MOSFET’te ne <b>değişmez</b>?', 'A MOSFET ramp (soft start) charges a capacitor. Making the ramp 10× longer leaves what <b>unchanged</b> in the MOSFET?'],
      opts: [['Tepe akım', 'Peak current'], ['Ortalama güç', 'Average power'], ['Toplam harcanan enerji (½·C·V²)', 'Total dissipated energy (½·C·V²)', 1], ['Rampa süresi', 'Ramp time']],
      ex: ['Soft-start gücü düşürür, enerjiyi değil. Uzun rampada MOSFET aynı enerjiyi daha uzun sürede harcar: DC SOA’yı kontrol et.', 'Soft start cuts power, not energy. A long ramp spreads the same energy over more time: check the DC SOA.'] },
    { id: 'sc-inrush', topic: 'inrush', lvl: 'b', type: 'scope', unit: 'A', tol: 0.1,
      q: ['12 V’a 1000 µF’lık bir kart bağlanıyor. Skoptaki tepe inrush akımını oku (A).', 'A board with 1000 µF is plugged into 12 V. Read the peak inrush current from the scope (A).'],
      fig: (el, p, H) => {
        const t0 = 1e-3, tau = 0.6e-3;
        const i = t => t < t0 ? 0 : t < t0 + 20e-6 ? 20 * (t - t0) / 20e-6 : 20 * Math.exp(-(t - t0 - 20e-6) / tau);
        const v = t => t < t0 ? 0 : 12 * (1 - Math.exp(-(t - t0) / tau));
        scope(el, { t0: 0, tdiv: 0.5e-3, channels: [{ key: 'i', name: 'I', color: 'ch3', unit: 'A', scale: 5, pos: -3 }, { key: 'v', name: 'V_C', color: 'ch1', unit: 'V', scale: 5, pos: -3 }] }, { i: samp(i, 0, 5e-3, 800), v: samp(v, 0, 5e-3, 400) });
      },
      ans: () => 20,
      ex: ['Tepe ≈ 20 A = 12 V / 0,6 Ω (kablo + ESR + anahtar). Akım τ = R·C ≈ 0,6 ms ile söner; soft-start ya da NTC ekle.', 'Peak ≈ 20 A = 12 V / 0.6 Ω (wiring + ESR + switch). It decays with τ = R·C ≈ 0.6 ms; add soft start or an NTC.'] },

    /* =================== 12 · overcurrent =================== */
    { id: 'rs', topic: 'overcurrent', lvl: 'b', type: 'num', unit: 'mΩ', tol: 0.05,
      gen: r => ({ i: pick(r, [2, 5, 10, 20]) }),
      q: (p, L) => L(`Akım ölçme direnci tam ölçekte (${p.i} A) 100 mV vermeli. Direnç kaç mΩ?`, `A current-sense resistor must give 100 mV at full scale (${p.i} A). How many mΩ?`),
      ans: p => 100 / p.i,
      ex: (p, L) => L(`R = V / I = 100 mV / ${p.i} A = ${nn(100 / p.i)} mΩ; kayıp I²·R = ${nn(p.i * 0.1)} W.`, `R = V / I = 100 mV / ${p.i} A = ${nn(100 / p.i)} mΩ; loss I²·R = ${nn(p.i * 0.1)} W.`) },
    { id: 'short', topic: 'overcurrent', lvl: 'b', type: 'num', unit: 'A', tol: 0.03,
      gen: r => ({ v: pick(r, [12, 24]), r: pick(r, [20, 30, 50]) }),
      q: (p, L) => L(`${p.v} V aküde yük kısa devre oluyor. Yolu yalnızca R<sub>DS(on)</sub> + kablo = ${p.r} mΩ sınırlıyor. Akım kaç amper?`, `On a ${p.v} V battery the load shorts out. Only R<sub>DS(on)</sub> + wiring = ${p.r} mΩ limit the path. Current in amps?`),
      ans: p => p.v / (p.r / 1000),
      ex: (p, L) => L(`I = ${p.v} V / ${p.r} mΩ = ${nn(p.v / p.r * 1000)} A. MOSFET bunu µs–ms içinde ölmeden önce yalnızca donanım koruması kesebilir.`, `I = ${p.v} V / ${p.r} mΩ = ${nn(p.v / p.r * 1000)} A. Only hardware protection can cut it within the µs–ms before the MOSFET dies.`) },
    { id: 'fuse', topic: 'overcurrent', lvl: 'b', type: 'mc',
      q: ['Kısa devrede sigorta neyi korur?', 'In a short circuit, what does a fuse protect?'],
      opts: [['MOSFET’i', 'The MOSFET'], ['Kabloyu ve yangın riskini', 'The wiring, against fire', 1], ['MCU pinini', 'The MCU pin'], ['Gate oksidini', 'The gate oxide']],
      ex: ['Sigorta milisaniyeler–saniyeler içinde atar; MOSFET mikrosaniyelerde ölür. MOSFET’i yalnızca hızlı donanım koruması kurtarır.', 'A fuse blows within milliseconds to seconds; a MOSFET dies in microseconds. Only fast hardware protection saves the MOSFET.'] },
    { id: 'spirito', topic: 'overcurrent', lvl: 'a', type: 'mc',
      q: ['Hot-swap’ta MOSFET lineer modda çalışıyor. Neden yalnızca P = V·I ile R<sub>θ</sub> hesabı yetmez, DC SOA eğrisine de bakılır?', 'In hot-swap a MOSFET runs in linear mode. Why is P = V·I against R<sub>θ</sub> not enough, so the DC SOA curve must be checked too?'],
      opts: [['SOA yalnızca darbe akımı içindir', 'SOA is only for pulse current'], ['Yüksek V<sub>DS</sub>, düşük akımda sıcak noktalar oluşur (Spirito); parça ısıl sınırdan önce ölebilir', 'At high V<sub>DS</sub> and low current hot spots form (Spirito); the part can fail below its thermal limit', 1], ['R<sub>θ</sub> lineer modda sıfırdır', 'R<sub>θ</sub> is zero in linear mode'], ['Gate oksidi bu modda delinir', 'The gate oxide breaks down in this mode']],
      ex: ['Modern trench MOSFET’lerde lineer modda pozitif ısıl geri besleme vardır. SOA eğrisi ~10 V üstünde daha dik düşer.', 'Modern trench MOSFETs have positive thermal feedback in linear mode. The SOA curve drops more steeply above ~10 V.'] },
    { id: 'schottky', topic: 'overcurrent', lvl: 'i', type: 'tf', ans: true,
      q: ['Ters polariteye karşı seri Schottky diyot V<sub>F</sub>·I kaybettirir; doğru bağlanmış bir P-MOS ise yalnızca I²·R<sub>DS(on)</sub>.', 'A series Schottky against reverse polarity costs V<sub>F</sub>·I; a correctly fitted P-MOS costs only I²·R<sub>DS(on)</sub>.'],
      ex: ['Doğru. 5 A’de Schottky ~0,4 V · 5 A = 2 W, 20 mΩ’luk P-MOS 0,5 W harcar.', 'True. At 5 A a Schottky burns ~0.4 V · 5 A = 2 W, a 20 mΩ P-MOS 0.5 W.'] },
    { id: 'm-short', topic: 'overcurrent', lvl: 'i', type: 'multi',
      q: ['Hangileri MOSFET’in kendisini sert bir kısa devreden (µs) korur? (hepsini seç)', 'Which protect the MOSFET itself from a hard short (µs)? (select all)'],
      opts: [['Shunt + hızlı karşılaştırıcı gate’i donanımla kapatıyor', 'Shunt + fast comparator turning the gate off in hardware', 1, 'µs içinde tepki verir.', 'Reacts within µs.'],
        ['Akım sınırlı eFuse ya da akıllı high-side anahtar', 'A current-limited eFuse or smart high-side switch', 1, 'Akımı içeride sınırlar ve kapanır.', 'Limits current internally and shuts down.'],
        ['Yavaş sigorta', 'A slow-blow fuse', 0, 'Kabloyu korur, MOSFET’i değil.', 'Protects wiring, not the MOSFET.'],
        ['Her 1 ms’de ADC okuyan yazılım', 'Firmware polling an ADC every 1 ms', 0, 'Çok yavaş.', 'Far too slow.'],
        ['PTC sigorta', 'A PTC resettable fuse', 0, 'Isınması saniyeler sürer.', 'Takes seconds to heat up.']],
      ex: ['Kısa devrede yalnızca µs’lik donanım tepkisi MOSFET’i kurtarır. Sigorta ve PTC kablo ve aşırı yük içindir.', 'In a short only a µs hardware response saves the MOSFET. Fuses and PTCs are for wiring and overload.'] },
    { id: 'sp-rev', topic: 'overcurrent', lvl: 'a', type: 'spot',
      q: ['Ters akü bağlantısına karşı P-MOS koruması. Akü ters takılınca yük yine besleniyor. Hata nerede?', 'P-MOS reverse-battery protection. With the battery reversed the load still gets power. Where is the mistake?'],
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 205, `
        ${S.vsrc(50, 120, '')}${S.text(68, 124, H.L('akü', 'battery'), '', 'start')}${S.w([[50, 90], [50, 40], [200, 40]], 'hot')}${S.gnd(50, 150)}
        ${S.pmos(180, 70, '', { bd: true })}${S.text(208, 38, 'S', 'muted', 'start')}${S.text(192, 98, 'D', 'muted', 'end')}${S.text(250, 74, 'Q1', '', 'start')}
        ${S.w([[200, 100], [200, 110], [300, 110]], 'hot')}${S.load(300, 140, 0, '')}${S.text(324, 144, H.L('yük', 'load'), '', 'start')}${S.gnd(300, 170)}
        ${S.w([[150, 70], [120, 70], [120, 100]])}${S.res(120, 130, 0, '')}${S.text(108, 134, 'R1', '', 'end')}${S.gnd(120, 160)}`); },
      opts: [['Q1 ters takılmış: source aküye bakıyor, body diyotu ters bağlantıda iletir', 'Q1 is fitted backwards: its source faces the battery, so the body diode conducts when reversed', 1], ['R1 toprak yerine +12 V’a gitmeli', 'R1 should go to +12 V instead of ground'], ['Yük Q1’den önce olmalı', 'The load should come before Q1'], ['R1 10 Ω olmalı', 'R1 should be 10 Ω']],
      ex: ['Drain aküye, source yüke bağlanmalı. O zaman ters akü body diyotu ters kutuplar ve V<sub>GS</sub> ≈ 0 kanalı kapalı tutar.', 'The drain belongs at the battery and the source at the load. Then a reversed battery reverse-biases the body diode and V<sub>GS</sub> ≈ 0 keeps the channel off.'] },

    /* =================== 13 · thermal =================== */
    { id: 'pcond', topic: 'thermal', lvl: 'b', type: 'num', unit: 'W', tol: 0.05,
      gen: r => ({ i: pick(r, [2, 3, 4, 5, 6, 8]), rm: pick(r, [10, 15, 20, 25, 35]) }),
      q: (p, L) => L(`MOSFET sürekli ${p.i} A taşıyor, sıcak R<sub>DS(on)</sub> = ${p.rm} mΩ. İletim kaybı kaç watt?`, `A MOSFET carries ${p.i} A continuously, hot R<sub>DS(on)</sub> = ${p.rm} mΩ. Conduction loss in watts?`),
      ans: p => p.i * p.i * p.rm / 1000,
      ex: (p, L) => L(`P = I² · R = ${p.i}² · ${nn(p.rm / 1000)} Ω = ${nn(p.i * p.i * p.rm / 1000)} W.`, `P = I² · R = ${p.i}² · ${nn(p.rm / 1000)} Ω = ${nn(p.i * p.i * p.rm / 1000)} W.`) },
    { id: 'tj', topic: 'thermal', lvl: 'b', type: 'num', unit: '°C', tol: 0.03,
      gen: r => ({ p: pick(r, [0.5, 0.8, 1, 1.2, 1.5]), ta: pick(r, [25, 30, 40]) }),
      q: (p, L) => L(`Soğutucusuz TO-220 (R<sub>θJA</sub> = 62 °C/W) ${nn(p.p)} W harcıyor, ortam ${p.ta} °C. T<sub>j</sub> kaç °C?`, `A TO-220 without heatsink (R<sub>θJA</sub> = 62 °C/W) dissipates ${nn(p.p)} W at ${p.ta} °C ambient. What is T<sub>j</sub> in °C?`),
      ans: p => p.ta + p.p * 62,
      ex: (p, L) => L(`T<sub>j</sub> = T<sub>a</sub> + P · R<sub>θJA</sub> = ${p.ta} + ${nn(p.p)} · 62 = ${nn(p.ta + p.p * 62)} °C.`, `T<sub>j</sub> = T<sub>a</sub> + P · R<sub>θJA</sub> = ${p.ta} + ${nn(p.p)} · 62 = ${nn(p.ta + p.p * 62)} °C.`) },
    { id: 'rdst', topic: 'thermal', lvl: 'i', type: 'mc',
      q: ['Tipik bir silikon MOSFET’in R<sub>DS(on)</sub>’u 100 °C’de 25 °C’deki değerin yaklaşık kaç katıdır?', 'Roughly how many times its 25 °C value is a typical silicon MOSFET’s R<sub>DS(on)</sub> at 100 °C?'],
      opts: [['×0,7', '×0.7'], ['×1,0', '×1.0'], ['×1,5', '×1.5', 1], ['×3', '×3']],
      ex: ['R<sub>DS(on)</sub> sıcaklıkla artar (~%0,7/°C), 125 °C’de ≈ 1,7 kat. Isıl hesabı sıcak değerle yap.', 'R<sub>DS(on)</sub> rises with temperature (~0.7 %/°C), ≈ 1.7× at 125 °C. Do the thermal sums with the hot value.'] },
    { id: 'hsink', topic: 'thermal', lvl: 'a', type: 'num', unit: '°C/W', tol: 0.05,
      gen: r => ({ p: pick(r, [5, 8, 10, 15]), ta: pick(r, [25, 40]) }),
      q: (p, L) => L(`TO-220 (R<sub>θJC</sub> = 1,15 °C/W, ped R<sub>θCS</sub> = 0,5 °C/W) ${p.p} W harcıyor, ortam ${p.ta} °C. T<sub>j</sub> ≤ 125 °C için soğutucunun R<sub>θSA</sub>’sı en fazla kaç °C/W?`, `A TO-220 (R<sub>θJC</sub> = 1.15 °C/W, pad R<sub>θCS</sub> = 0.5 °C/W) dissipates ${p.p} W at ${p.ta} °C ambient. For T<sub>j</sub> ≤ 125 °C, what is the largest heatsink R<sub>θSA</sub> in °C/W?`),
      ans: p => (125 - p.ta) / p.p - 1.65,
      ex: (p, L) => L(`R<sub>θ,toplam</sub> = (125 − ${p.ta}) / ${p.p} = ${nn((125 - p.ta) / p.p)} °C/W; R<sub>θSA</sub> = ${nn((125 - p.ta) / p.p)} − 1,65 = ${nn((125 - p.ta) / p.p - 1.65)} °C/W.`, `R<sub>θ,total</sub> = (125 − ${p.ta}) / ${p.p} = ${nn((125 - p.ta) / p.p)} °C/W; R<sub>θSA</sub> = ${nn((125 - p.ta) / p.p)} − 1.65 = ${nn((125 - p.ta) / p.p - 1.65)} °C/W.`) },
    { id: 'imax', topic: 'thermal', lvl: 'a', type: 'num', unit: 'A', tol: 0.05,
      gen: r => ({ th: pick(r, [100, 125]), rm: pick(r, [20, 30, 40]), ta: pick(r, [25, 50]) }),
      q: (p, L) => L(`SOT-23 MOSFET: R<sub>θJA</sub> = ${p.th} °C/W, 125 °C’deki R<sub>DS(on)</sub> = ${p.rm} mΩ. Ortam ${p.ta} °C. T<sub>j</sub> = 125 °C’yi aşmadan en fazla kaç amper sürekli taşır?`, `SOT-23 MOSFET: R<sub>θJA</sub> = ${p.th} °C/W, R<sub>DS(on)</sub> at 125 °C = ${p.rm} mΩ. Ambient ${p.ta} °C. Max continuous current in amps without exceeding T<sub>j</sub> = 125 °C?`),
      ans: p => Math.sqrt((125 - p.ta) / (p.th * p.rm / 1000)),
      ex: (p, L) => L(`P<sub>max</sub> = (125 − ${p.ta}) / ${p.th} = ${nn((125 - p.ta) / p.th)} W; I = √(P / R) = √(${nn((125 - p.ta) / p.th)} / ${nn(p.rm / 1000)}) = ${nn(Math.sqrt((125 - p.ta) / (p.th * p.rm / 1000)))} A.`, `P<sub>max</sub> = (125 − ${p.ta}) / ${p.th} = ${nn((125 - p.ta) / p.th)} W; I = √(P / R) = √(${nn((125 - p.ta) / p.th)} / ${nn(p.rm / 1000)}) = ${nn(Math.sqrt((125 - p.ta) / (p.th * p.rm / 1000)))} A.`) },
    { id: 'parmos', topic: 'thermal', lvl: 'i', type: 'tf', ans: true,
      q: ['Tam açık paralel MOSFET’ler akımı kendiliğinden paylaşır, çünkü R<sub>DS(on)</sub> sıcaklıkla artar.', 'Fully-on parallel MOSFETs share current by themselves, because R<sub>DS(on)</sub> rises with temperature.'],
      ex: ['Doğru. Isınan MOSFET’in direnci artar ve akımı komşusuna kayar. Yine de her gate’e ayrı direnç koy.', 'True. The hotter MOSFET gains resistance and pushes current to its neighbour. Still give each gate its own resistor.'] },
    { id: 'sot5a', topic: 'thermal', lvl: 'i', type: 'tf', ans: false,
      q: ['AO3400A’nın I<sub>D</sub> değeri 5,7 A olduğu için, küçük pedli SOT-23’te sürekli 5 A taşıyabilir.', 'The AO3400A is rated I<sub>D</sub> = 5.7 A, so on minimal SOT-23 pads it can carry 5 A continuously.'],
      ex: ['Yanlış. Sıcak R ≈ 30 mΩ ile P ≈ 25 · 0,03 = 0,75 W; 125 °C/W ile ΔT ≈ 94 °C. Küçük pakette sınırı R<sub>θJA</sub> koyar.', 'False. With hot R ≈ 30 mΩ, P ≈ 25 · 0.03 = 0.75 W; at 125 °C/W ΔT ≈ 94 °C. In small packages R<sub>θJA</sub> sets the limit.'] },
    { id: 'zth', topic: 'thermal', lvl: 'i', type: 'mc',
      q: ['Bir MOSFET 1 ms’lik 50 W’lık darbeye dayanıyor ama 50 W DC’ye dayanamıyor. Neden?', 'A MOSFET survives a 1 ms pulse of 50 W but not 50 W DC. Why?'],
      opts: [['Darbede R<sub>DS(on)</sub> sıfırdır', 'R<sub>DS(on)</sub> is zero during a pulse'], ['Isıl kapasitans: kısa darbede Z<sub>θ</sub>(t), R<sub>θ</sub>’dan çok küçüktür', 'Thermal capacitance: for a short pulse Z<sub>θ</sub>(t) is far below R<sub>θ</sub>', 1], ['Gate darbede kapanır', 'The gate turns off in the pulse'], ['Soğutucu darbede daha iyi çalışır', 'The heatsink works better in pulses']],
      ex: ['Kalıp ve paket ısıyı önce depolar. Datasheet’teki Z<sub>θ</sub>(t) eğrisi darbe süresine göre ısıl direnci verir.', 'The die and package store heat first. The Z<sub>θ</sub>(t) curve in the datasheet gives the thermal resistance for a pulse length.'] },
    { id: 'pk-6a', topic: 'thermal', lvl: 'a', type: 'part',
      q: ['6 A sürekli, V<sub>GS</sub> = 10 V, soğutucu yok, ortam 40 °C. T<sub>j</sub> ≤ 110 °C olmalı (R<sub>DS(on)</sub>’u 110 °C’de hesapla, %0,7/°C). Hangi MOSFET?', '6 A continuous, V<sub>GS</sub> = 10 V, no heatsink, 40 °C ambient. T<sub>j</sub> must stay ≤ 110 °C (take R<sub>DS(on)</sub> at 110 °C, 0.7 %/°C). Which MOSFET?'],
      parts: ['AO3400A', 'IRLML6344', 'IRLB8721', 'IRF540N'],
      spec: m => [m.pkg, `R<sub>DS(on)</sub> ${mo(m.p[1][1])} mΩ @ ${nn(m.p[1][0])} V`, `R<sub>θJA</sub> ${m.rthja} °C/W`, `V<sub>GS(max)</sub> ±${m.vgsMax} V`],
      judge: (m, P) => {
        const r = P.rds(m, 10, 110), pw = 36 * r, tj = 40 + pw * m.rthja;
        const t = `P ≈ ${nn(pw, 2)} W → T<sub>j</sub> ≈ ${Math.round(tj)} °C`;
        return { ok: tj <= 110 && m.vgsMax >= 10, tr: t, en: t };
      },
      ex: ['SOT-23’ler 6 A’de 1 W’ı aşar ve 150 °C’yi geçer. IRLB8721 TO-220’de ~0,5 W ile ~71 °C’de kalır; IRF540N’in R<sub>DS(on)</sub>’u fazla yüksek.', 'The SOT-23 parts exceed 1 W at 6 A and pass 150 °C. The IRLB8721 in TO-220 stays at ~71 °C with ~0.5 W; the IRF540N’s R<sub>DS(on)</sub> is too high.'] },

    /* =================== 14 · examples =================== */
    { id: 'pk-sol24', topic: 'examples', lvl: 'i', type: 'part',
      q: ['24 V / 1 A solenoid valf, 5 V Arduino pininden low-side. Zener kelepçe V<sub>DS</sub>’i 45 V’ta tutuyor (%20 payla V<sub>DS</sub> ≥ 54 V). R<sub>DS(on)</sub> ≤ 5 V’ta tanımlı olmalı, kayıp ≤ 0,25 W. Hangi MOSFET?', '24 V / 1 A solenoid valve, low-side from a 5 V Arduino pin. A zener clamp holds V<sub>DS</sub> at 45 V (V<sub>DS</sub> ≥ 54 V with 20 % margin). R<sub>DS(on)</sub> must be specified at ≤ 5 V, loss ≤ 0.25 W. Which MOSFET?'],
      parts: ['2N7002', 'AO3400A', 'IRLZ44N', 'IRF540N'],
      spec: m => [`${m.type}-MOS`, m.pkg, `V<sub>DS</sub> ${m.vds} V`, `R<sub>DS(on)</sub> ${mo(m.p[0][1])} mΩ @ ${nn(m.p[0][0])} V`, `${mo(m.p[1][1])} mΩ @ ${nn(m.p[1][0])} V`],
      judge: (m, P) => {
        const f = [], r = P.rds(m, 5), pw = r;
        if (m.vds < 54) f.push([`V<sub>DS</sub> ${m.vds} V < 54 V`, `V<sub>DS</sub> ${m.vds} V < 54 V`]);
        if (specFrom(m) > 5) f.push([`R<sub>DS(on)</sub> ancak ${nn(specFrom(m))} V’tan itibaren tanımlı`, `R<sub>DS(on)</sub> only specified from ${nn(specFrom(m))} V`]);
        if (pw > 0.25) f.push([`5 V’ta P ≈ ${nn(pw, 2)} W`, `P ≈ ${nn(pw, 2)} W at 5 V`]);
        return verdict(f, `${m.vds} V, 5 V’ta R ≈ ${mo(r)} mΩ → P ≈ ${nn(pw, 2)} W`, `${m.vds} V, R ≈ ${mo(r)} mΩ at 5 V → P ≈ ${nn(pw, 2)} W`);
      },
      ex: ['IRLZ44N 55 V’luk ve R<sub>DS(on)</sub>’u 4–5 V’ta tanımlı; 1 A’de ~25 mW harcar. IRF540N 10 V ister, 2N7002 ise 1 A için çok zayıf.', 'The IRLZ44N is 55 V and specified at 4–5 V; at 1 A it burns ~25 mW. The IRF540N wants 10 V and the 2N7002 is far too weak for 1 A.'] },
    { id: 'o-select', topic: 'examples', lvl: 'i', type: 'order',
      q: ['PWM’li bir yük için MOSFET seçme adımlarını sırala.', 'Put the steps for choosing a MOSFET for a PWM load in order.'],
      items: [['Yükün sürekli, tepe ve RMS akımını bul', 'Find the load’s steady, peak and RMS current'], ['Gerilim payıyla V<sub>DS</sub> değerini seç', 'Choose the V<sub>DS</sub> rating with margin'],
        ['R<sub>DS(on)</sub>’u gerçek V<sub>GS</sub>’inde oku', 'Read R<sub>DS(on)</sub> at your real V<sub>GS</sub>'], ['İletim + anahtarlama kaybını hesapla', 'Compute conduction + switching loss'], ['T<sub>j</sub>’yi R<sub>θ</sub> ile kontrol et; soğutucuya karar ver', 'Check T<sub>j</sub> with R<sub>θ</sub>; decide on a heatsink']],
      ex: ['Gereksinim → gerilim → sürme → kayıp → ısı. Sondaki ısı kontrolü başarısızsa daha düşük R<sub>DS(on)</sub> ya da daha iyi paketle başa dön.', 'Requirement → voltage → drive → loss → heat. If the final heat check fails, go back with a lower R<sub>DS(on)</sub> or a better package.'] },
    { id: 'fan', topic: 'examples', lvl: 'i', type: 'mc',
      q: ['12 V DC motor PWM ile sürülüyor ve 2 kHz’de vızıldıyor. Tipik çözüm nedir?', 'A 12 V DC motor on PWM whines at 2 kHz. What is the usual fix?'],
      opts: [['PWM’i 16–25 kHz’e çıkarmak (duyulabilir bandın üstü) ve hızlı flyback diyodu', 'Raise PWM to 16–25 kHz (above the audible band) with a fast flyback diode', 1], ['PWM’i 50 Hz’e düşürmek', 'Drop PWM to 50 Hz'], ['Flyback diyodunu sökmek', 'Remove the flyback diode'], ['Gate direncini 10 kΩ yapmak', 'Make the gate resistor 10 kΩ']],
      ex: ['Motor PWM’i genelde 16–25 kHz’dir. Daha yüksek frekansta anahtarlama kaybı artar, bu yüzden gate sürüşünü de kontrol et.', 'Motor PWM is usually 16–25 kHz. Higher frequency raises switching loss, so check the gate drive too.'] },

    /* =================== 15 · mistakes =================== */
    { id: 'sp-ef', topic: 'mistakes', lvl: 'b', type: 'spot',
      q: ['3,3 V GPIO bu devreyle 12 V’luk yükü anahtarlıyor; yük zayıf çalışıyor, Q1 ısınıyor. Hata hangisi?', 'A 3.3 V GPIO switches a 12 V load with this circuit; the load runs weakly and Q1 runs hot. What is wrong?'],
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 205, `
        ${S.vcc(220, 30, '+12 V')}${S.w([[220, 30], [220, 50]])}${S.npn(200, 80, '')}${S.text(250, 84, 'Q1', '', 'start')}
        ${S.res(140, 80, 90, '')}${S.text(140, 66, 'R1 1 kΩ', '', 'middle')}${S.w([[90, 80], [110, 80]], 'sigw')}
        ${S.box(10, 60, 80, 40, 'GPIO', H.L('3,3 V', '3.3 V'))}
        ${S.load(220, 140, 0, '')}${S.text(246, 144, H.L('yük', 'load'), '', 'start')}${S.gnd(220, 170)}`); },
      opts: [['Q1 yükün üstünde NPN: emitter follower olur, yük ≤ 2,6 V görür', 'Q1 is an NPN above the load: an emitter follower, the load sees ≤ 2.6 V', 1], ['R1 1 kΩ çok küçük', 'R1 at 1 kΩ is too small'], ['Yük dirençli olmamalı', 'The load must not be resistive'], ['+12 V yerine +5 V kullanılmalı', 'Use +5 V instead of +12 V']],
      ex: ['Emitter, base’in ~0,7 V altını izler: yük en fazla 3,3 − 0,7 = 2,6 V alır, Q1 kalan ~9 V’u harcar. NPN’yi yükün altına al ya da PNP/P-MOS kullan.', 'The emitter follows ~0.7 V below the base: the load gets at most 3.3 − 0.7 = 2.6 V and Q1 burns the other ~9 V. Move the NPN below the load or use a PNP/P-MOS.'] },
    { id: 'sp-nob', topic: 'mistakes', lvl: 'b', type: 'spot',
      q: ['Bu röle sürücüsünde GPIO pini ısınıyor ve MCU resetleniyor. Hata hangisi?', 'In this relay driver the GPIO pin gets hot and the MCU resets. What is wrong?'],
      fig: (el, p, H) => { const S = H.S; sch(el, 360, 200, `
        ${S.vcc(220, 22, '+5 V')}${S.w([[220, 22], [220, 30]])}${S.ind(220, 60, 0, '')}${S.text(208, 64, 'K1', '', 'end')}
        ${S.dot(220, 30)}${S.w([[220, 30], [270, 30]])}${S.diode(270, 60, 180, '')}${S.text(286, 64, 'D1', '', 'start')}${S.w([[270, 90], [220, 90]])}${S.dot(220, 90)}
        ${S.npn(200, 120, '')}${S.text(250, 124, 'Q1', '', 'start')}${S.gnd(220, 150)}
        ${S.box(10, 100, 80, 40, 'GPIO', H.L('3,3 V', '3.3 V'))}${S.w([[90, 120], [170, 120]], 'sigw')}`); },
      opts: [['Base direnci yok: GPIO doğrudan base–emitter diyotunu sürüyor', 'No base resistor: the GPIO drives the base–emitter diode directly', 1], ['D1 ters takılmış', 'D1 is reversed'], ['K1, Q1’in altına konmalı', 'K1 should sit below Q1'], ['Emitter 5 V’a bağlanmalı', 'The emitter should go to 5 V']],
      ex: ['Base–emitter bir diyottur; akımı yalnızca pinin iç direnci sınırlar. Seri 1 kΩ koy: I<sub>B</sub> ≈ 2,6 mA yeter.', 'Base–emitter is a diode; only the pin’s internal resistance limits the current. Add 1 kΩ in series: I<sub>B</sub> ≈ 2.6 mA is enough.'] },
    { id: 'gbounce', topic: 'mistakes', lvl: 'i', type: 'mc',
      q: ['Motor akımı MCU ile aynı ince toprak izinden dönüyor ve motor kalkınca MCU resetleniyor. Neden?', 'Motor current returns through the same thin ground trace as the MCU, and the MCU resets when the motor starts. Why?'],
      opts: [['Motor MCU’ya EMI yayar', 'The motor radiates EMI into the MCU'], ['Ortak toprak izindeki I·R ve L·di/dt düşümü MCU’nun toprağını kaydırır (ground bounce)', 'The I·R and L·di/dt drop in the shared trace shifts the MCU ground (ground bounce)', 1], ['Flyback diyot fazla iletir', 'The flyback diode conducts too much'], ['MCU’nun pull-up’ları zayıf', 'The MCU pull-ups are weak']],
      ex: ['Yük dönüşünü ayrı, kalın bir izle doğrudan besleme toprağına götür. Sinyal toprağı tek noktada birleşsin.', 'Route the load return on its own wide trace straight to supply ground. Join signal ground at a single point.'] },
    { id: 'irfz', topic: 'mistakes', lvl: 'b', type: 'mc',
      q: ['Bir 5 V Arduino projesinde IRLZ44N yerine yanlışlıkla IRFZ44N takılıyor. Sonuç?', 'In a 5 V Arduino project an IRFZ44N is fitted instead of an IRLZ44N by mistake. Result?'],
      opts: [['Fark yok, ikisi aynıdır', 'No difference, they are the same'], ['IRFZ44N standart seviyelidir (10 V ister); 5 V’ta direnci yüksek kalır ve yüksek akımda ısınır', 'The IRFZ44N is standard level (wants 10 V); at 5 V its resistance stays high and it heats at high current', 1], ['IRFZ44N’in gate’i 5 V’ta delinir', 'The IRFZ44N gate breaks down at 5 V'], ['IRFZ44N daha az ısınır', 'The IRFZ44N runs cooler']],
      ex: ['Tek harf: L = logic level. IRFZ44N’in R<sub>DS(on)</sub>’u 10 V’ta tanımlı; 5 V’ta yalnızca birkaç amperde doğrusal bölgeye girer.', 'One letter: L = logic level. The IRFZ44N’s R<sub>DS(on)</sub> is specified at 10 V; at 5 V it slips into its linear region at a few amps.'] },
    { id: 'ledcnt', topic: 'mistakes', lvl: 'b', type: 'num', unit: '', tol: 0,
      gen: r => ({ i: pick(r, [12, 15, 18, 25]) }),
      q: (p, L) => L(`ATmega328P’nin V<sub>CC</sub>/GND toplam sınırı 200 mA. Her biri ${p.i} mA çeken kaç LED aynı anda doğrudan pinlerden yakılabilir? (tam sayı)`, `The ATmega328P V<sub>CC</sub>/GND total limit is 200 mA. How many LEDs of ${p.i} mA each can be lit at once straight from pins? (integer)`),
      ans: p => Math.floor(200 / p.i),
      ex: (p, L) => L(`⌊200 / ${p.i}⌋ = ${Math.floor(200 / p.i)} LED. Pin başına sınır değil, toplam sınır önce dolar.`, `⌊200 / ${p.i}⌋ = ${Math.floor(200 / p.i)} LEDs. The total limit runs out before the per-pin one.`) },
    { id: 'worst', topic: 'mistakes', lvl: 'b', type: 'tf', ans: false,
      q: ['Bir tasarımı tipik datasheet değerleriyle hesaplamak yeterlidir; çoğu parça tipik değerdedir.', 'Designing with typical datasheet values is enough; most parts are typical.'],
      ex: ['Yanlış. Seri üretimde her parça tipik değildir: h<sub>FE(min)</sub>, V<sub>GS(th)(max)</sub>, R<sub>DS(on)(max)</sub> ve sıcak değerlerle hesapla.', 'False. In production not every part is typical: design with h<sub>FE(min)</sub>, V<sub>GS(th)(max)</sub>, R<sub>DS(on)(max)</sub> and hot values.'] },

    /* =================== 16 · reference =================== */
    { id: 'dsmax', topic: 'reference', lvl: 'b', type: 'mc',
      q: ['Datasheet: R<sub>DS(on)</sub> tipik 19 mΩ, maksimum 25 mΩ (V<sub>GS</sub> = 10 V, 25 °C). Kayıp hesabında hangisini kullanırsın?', 'Datasheet: R<sub>DS(on)</sub> typ 19 mΩ, max 25 mΩ (V<sub>GS</sub> = 10 V, 25 °C). Which do you use for the loss calculation?'],
      opts: [['19 mΩ', '19 mΩ'], ['25 mΩ’u sıcaklık katsayısıyla (~1,5–1,7 kat) artırarak', '25 mΩ, scaled up for temperature (~1.5–1.7×)', 1], ['İkisinin ortalaması', 'The average of both'], ['25 mΩ’un yarısı', 'Half of 25 mΩ']],
      ex: ['Maksimum değer garantidir, tipik değil. Isınınca R<sub>DS(on)</sub> daha da artar: 25 mΩ × 1,6 ≈ 40 mΩ ile hesapla.', 'The max value is the guarantee, typical is not. It rises further when hot: calculate with 25 mΩ × 1.6 ≈ 40 mΩ.'] },
    { id: 'vthmax', topic: 'reference', lvl: 'i', type: 'mc',
      q: ['V<sub>GS(th)</sub> = 1,0–2,5 V. Hangi değer, düşük gate gerilimiyle sürmenin riskini gösterir?', 'V<sub>GS(th)</sub> = 1.0–2.5 V. Which value shows the risk of driving with a low gate voltage?'],
      opts: [['1,0 V (minimum)', '1.0 V (minimum)'], ['2,5 V (maksimum)', '2.5 V (maximum)', 1], ['1,75 V (orta)', '1.75 V (middle)'], ['Hiçbiri, eşik önemsizdir', 'None, the threshold is irrelevant']],
      ex: ['En kötü parça 2,5 V’ta daha yeni iletmeye başlar. 3,3 V gate o parçada çok az aşırı sürüş bırakır.', 'The worst part only starts conducting at 2.5 V. A 3.3 V gate leaves that part very little overdrive.'] },
    { id: 'e12', topic: 'reference', lvl: 'b', type: 'mc',
      q: ['Hesaplanan base direnci 2083 Ω. Base akımını azaltmamak için hangi E12 değeri seçilir?', 'The computed base resistor is 2083 Ω. Which E12 value keeps the base current from dropping?'],
      opts: [['1,8 kΩ', '1.8 kΩ', 1], ['2,2 kΩ', '2.2 kΩ'], ['2,7 kΩ', '2.7 kΩ'], ['10 kΩ', '10 kΩ']],
      ex: ['Bir alt standart değer daha fazla base akımı verir: 1,8 kΩ. E12: 1,0 1,2 1,5 1,8 2,2 2,7 3,3 …', 'The next lower standard value gives more base current: 1.8 kΩ. E12: 1.0 1.2 1.5 1.8 2.2 2.7 3.3 …'] },
    { id: 'absmax', topic: 'reference', lvl: 'b', type: 'tf', ans: false,
      q: ['Bir parçayı sürekli olarak mutlak maksimum değerinde çalıştırmak güvenlidir.', 'Running a part continuously at its absolute maximum rating is safe.'],
      ex: ['Yanlış. Mutlak maksimum, ötesinde hasar başlayan sınırdır, çalışma noktası değildir. Önerilen çalışma koşullarında ve payla tasarla.', 'False. The absolute maximum is where damage begins, not an operating point. Design inside the recommended conditions with margin.'] },

    /* =================== simulator =================== */
    { id: 'simL', topic: 'simulator', lvl: 'i', type: 'mc',
      q: ['Simülatörde kapanış kenarına seri kablo endüktansı ekleyince V<sub>DS</sub> tepesine ne olur?', 'In the simulator, what happens to the V<sub>DS</sub> peak when you add series wire inductance at turn-off?'],
      opts: [['Azalır', 'It drops'], ['L·di/dt kadar artar', 'It rises by L·di/dt', 1], ['Değişmez', 'No change'], ['Yalnızca açılışta değişir', 'It only changes at turn-on']],
      ex: ['Kablo endüktansı da akımı sürdürmek ister ve kapanışta gerilim üretir. Hızlı kenarda birkaç nH bile volt eder.', 'Wire inductance also wants to keep current flowing and makes a voltage at turn-off. At fast edges a few nH already cost volts.'] },
    { id: 'sim540', topic: 'simulator', lvl: 'b', type: 'mc',
      q: ['Simülatörün parça tablosunda IRF540N, 3,3 V gate ile neden kırmızı çıkar?', 'Why does the IRF540N show red in the simulator’s parts table with a 3.3 V gate?'],
      opts: [['V<sub>DS</sub> değeri düşük olduğu için', 'Its V<sub>DS</sub> rating is too low'], ['Eşiği ~3 V: 3,3 V’ta zar zor iletir, lineer bölgede kalıp ısınır', 'Its threshold is ~3 V: at 3.3 V it barely conducts and heats in its linear region', 1], ['Q<sub>g</sub>’si çok küçük olduğu için', 'Its Q<sub>g</sub> is too small'], ['P-kanal olduğu için', 'It is P-channel']],
      ex: ['IRF540N standart seviyelidir: R<sub>DS(on)</sub> 10 V’ta tanımlı. 3,3 V’ta yalnızca birkaç yüz mA taşır.', 'The IRF540N is standard level: R<sub>DS(on)</sub> is specified at 10 V. At 3.3 V it carries only a few hundred mA.'] },
    { id: 'sc-storage', topic: 'bjt-drive', lvl: 'i', type: 'scope', unit: 'µs', tol: 0.15,
      q: ['BJT low-side anahtar (12 V). Base sürüşü LOW’a düştükten sonra collector’ün yükselmesine kadar geçen gecikmeyi (storage time) oku. Kaç µs?', 'BJT low-side switch (12 V). Read the delay from the base drive going LOW to the collector rising (storage time). How many µs?'],
      fig: (el, p, H) => {
        const u = 1e-6;
        const b = t => t < 1 * u ? 3.3 : 0;
        const c = t => t < 2.5 * u ? 0.2 : t < 2.75 * u ? 0.2 + 11.8 * (t - 2.5 * u) / (0.25 * u) : 12;
        scope(el, { t0: 0, tdiv: 0.5 * u, channels: [{ key: 'b', name: H.L('base sürüş', 'base drive'), color: 'ch2', unit: 'V', scale: 2, pos: 1 }, { key: 'c', name: 'V_CE', color: 'ch1', unit: 'V', scale: 5, pos: -3.5 }] }, { b: samp(b, 0, 5 * u, 1000), c: samp(c, 0, 5 * u, 1000) });
      },
      ans: () => 1.5,
      ex: ['Gecikme ≈ 3 bölme × 0,5 µs = 1,5 µs: base’deki fazla yükün boşalma süresi. 20 kHz’de bu periyodun %3’üdür ve doluluk oranını kaydırır.', 'Delay ≈ 3 divisions × 0.5 µs = 1.5 µs: the time to drain the excess base charge. At 20 kHz that is 3 % of the period and skews the duty cycle.'] },

    /* =================== apps =================== */
    { id: 'pwmf', topic: 'apps', lvl: 'b', type: 'mc',
      q: ['Hangi PWM frekansı eşleşmesi doğrudur?', 'Which PWM frequency match is right?'],
      opts: [['LED ≥ 1,25 kHz, motor 16–25 kHz, ısıtıcı 0,1–1 Hz', 'LED ≥ 1.25 kHz, motor 16–25 kHz, heater 0.1–1 Hz', 1], ['LED 50 Hz, motor 1 MHz, ısıtıcı 20 kHz', 'LED 50 Hz, motor 1 MHz, heater 20 kHz'], ['Hepsi için 490 Hz', '490 Hz for all of them'], ['LED 100 kHz, motor 100 Hz, ısıtıcı 10 kHz', 'LED 100 kHz, motor 100 Hz, heater 10 kHz']],
      ex: ['LED titreşimi görünmemeli, motor vızıltısı duyulmamalı. Isıtıcının ısıl zaman sabiti dakikalardır, çok yavaş PWM yeter.', 'LED flicker must be invisible and motor whine inaudible. A heater’s time constant is minutes, so very slow PWM is fine.'] },
    { id: 'heatpwm', topic: 'apps', lvl: 'b', type: 'tf', ans: true,
      q: ['Isıl zaman sabiti dakikalar olan bir ısıtıcı 0,5 Hz PWM ile sürülürse, ortalama gücü görür.', 'A heater with a thermal time constant of minutes, driven at 0.5 Hz PWM, sees the average power.'],
      ex: ['Doğru. Yükün zaman sabiti periyottan çok uzunsa yük ortalamayı görür. Yavaş PWM anahtarlama kaybını da sıfıra yakın tutar.', 'True. When the load’s time constant is far longer than the period, it sees the average. Slow PWM also keeps switching loss near zero.'] },
    { id: 'hold', topic: 'apps', lvl: 'i', type: 'num', unit: '%', tol: 0.05,
      gen: r => ({ k: pick(r, [30, 40, 50]) }),
      q: (p, L) => L(`Peak-and-hold: solenoid çekildikten sonra akım tepe değerinin %${p.k}’ine düşürülüyor. Tutma gücü, tam akımdaki gücün yüzde kaçıdır?`, `Peak-and-hold: after pull-in, the solenoid current drops to ${p.k} % of peak. Holding power is what percent of the full-current power?`),
      ans: p => p.k * p.k / 100,
      ex: (p, L) => L(`P ∝ I²: (${nn(p.k / 100)})² = %${nn(p.k * p.k / 100)}. Yani tutma gücü ~%${nn(100 - p.k * p.k / 100)} azalır.`, `P ∝ I²: (${nn(p.k / 100)})² = ${nn(p.k * p.k / 100)} %. So holding power falls by ~${nn(100 - p.k * p.k / 100)} %.`) },
    { id: 'servo', topic: 'apps', lvl: 'b', type: 'num', unit: 'ms', tol: 0.03,
      gen: r => ({ a: pick(r, [-45, -30, 30, 45]) }),
      q: (p, L) => L(`Hobi servo: 1,5 ms orta konum, 90°/ms. ${p.a > 0 ? '+' : '−'}${Math.abs(p.a)}° için darbe genişliği kaç ms?`, `Hobby servo: 1.5 ms is centre, 90°/ms. What pulse width in ms gives ${p.a > 0 ? '+' : '−'}${Math.abs(p.a)}°?`),
      ans: p => 1.5 + p.a / 90,
      ex: (p, L) => L(`t = 1,5 ms + (${p.a}°) / 90°/ms = ${nn(1.5 + p.a / 90)} ms. Darbe her 20 ms’de (50 Hz) tekrarlanır.`, `t = 1.5 ms + (${p.a}°) / 90°/ms = ${nn(1.5 + p.a / 90)} ms. The pulse repeats every 20 ms (50 Hz).`) },
    { id: 'hbdir', topic: 'apps', lvl: 'b', type: 'mc',
      q: ['Bir DC motoru iki yönde döndürmek ve frenlemek gerekiyor. Hangi sürme katı?', 'A DC motor must run in both directions and brake. Which drive stage?'],
      opts: [['Tek low-side N-MOS', 'A single low-side N-MOS'], ['H-köprü', 'An H-bridge', 1], ['Tek high-side P-MOS', 'A single high-side P-MOS'], ['Darlington dizisi', 'A Darlington array']],
      ex: ['Tek anahtar motoru yalnızca açıp kapatır. H-köprü gerilimi iki yönde uygular ve sargıyı kısa devre edip frenler.', 'A single switch only turns the motor on and off. An H-bridge applies voltage both ways and brakes by shorting the winding.'] }
  ];

  App.quizBank = Q;
})();
