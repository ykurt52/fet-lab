/* 10 — Gate drivers, dead-time and layout: totem-pole buffer, driver ICs, UVLO, split R_on/R_off,
   half-bridge dead-time with shoot-through and body-diode loss, loop inductance and turn-off ringing, PCB layout. */
(function () {
  'use strict';
  App.page({
    id: 'gate-drivers',
    num: '10',
    group: { tr: 'Hızlı anahtarlama', en: 'Fast switching' },
    title: { tr: 'Gate sürücüler, dead-time ve layout', en: 'Gate drivers, dead-time and layout' },
    blurb: { tr: 'Totem-pole tampon, sürücü IC’leri, UVLO, dead-time ve shoot-through, döngü endüktansı ve ringing.', en: 'Totem-pole buffer, driver ICs, UVLO, dead-time and shoot-through, loop inductance and ringing.' },
    summary: {
      tr: 'Hızlı anahtarlama amperlerce gate akımı ister. Bu bölüm o akımı kimin vereceğini, yarım köprüde iki MOSFET’in birlikte iletmesini nasıl önleyeceğini ve layout’un neden volt ürettiğini anlatır.',
      en: 'Fast switching needs amps of gate current. This chapter covers who supplies it, how to stop both MOSFETs of a half-bridge conducting at once, and why layout creates volts.'
    },
    render(L) {
      return `
      ${App.keys([
        L('GPIO pini ne gerilim ne akım verir: araya sürücü IC koy.', 'A GPIO pin lacks both voltage and current: put a driver IC between.'),
        L('UVLO’lu sürücü seç: yarı açık MOSFET saniyeler içinde yanar.', 'Pick a driver with UVLO: a half-on MOSFET burns within seconds.'),
        L('Yarım köprüde dead-time şart; 50–200 ns çoğu zaman yeter.', 'A half-bridge needs dead-time; 50–200 ns is usually enough.'),
        L('Güç döngüsünü küçült: 1 nH/mm, 1 A/ns’de 1 V/mm aşma demek.', 'Keep the power loop small: 1 nH/mm means 1 V/mm at 1 A/ns.'),
        L('Sürücü toprağını Kelvin source ile doğrudan source pinine bağla.', 'Return driver ground to the source pin with a Kelvin connection.')
      ])}
      <style>
        [data-page="gate-drivers"] .pcb-board { fill: color-mix(in srgb, var(--mask) 14%, var(--surface)); stroke: var(--line); }
        [data-page="gate-drivers"] .pcb-tr { fill: none; stroke: var(--copper); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; opacity: .85; }
        [data-page="gate-drivers"] .pcb-gt { fill: none; stroke: var(--signal); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; opacity: .85; }
        [data-page="gate-drivers"] .pcb-gnd { fill: none; stroke: var(--muted); stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; opacity: .55; }
        [data-page="gate-drivers"] .pcb-pad { fill: var(--panel-2); stroke: var(--ink-2); stroke-width: 1.2; }
        [data-page="gate-drivers"] .loop-bad { fill: var(--bad-soft); stroke: var(--bad); stroke-dasharray: 5 4; stroke-width: 1.2; }
        [data-page="gate-drivers"] .loop-ok { fill: var(--ok-soft); stroke: var(--ok); stroke-dasharray: 5 4; stroke-width: 1.2; }
      </style>

      <h2>${L('Neden ayrı bir sürücü?', 'Why a separate driver?')}</h2>
      <p>${L('Bir GPIO pini MOSFET’i hızlı anahtarlayamaz. Hem gerilimi hem akımı yetmez.', 'A GPIO pin cannot switch a MOSFET fast. It lacks both voltage and current.')}</p>
      ${App.example({
        given: [['Q<sub>g</sub>', '30 nC'], ['t<sub>sw</sub>', '20 ns'], ['GPIO', L('3,3 V, 10–40 mA', '3.3 V, 10–40 mA')]],
        steps: [
          [L('Gereken gate akımı', 'Gate current needed'), 'I = 30 nC / 20 ns', L('1,5 A', '1.5 A')],
          [L('GPIO’nun verdiği', 'What the GPIO gives'), '', '≤ 40 mA', L('≈ 40 kat az', '≈ 40× too little')]
        ],
        result: L('<b>Pin tek başına yetmez.</b> Sürücü hem 10–12 V hem amper seviyesinde tepe akım sağlar.', '<b>The pin alone is not enough.</b> A driver supplies 10–12 V and amp-level peaks.'),
        level: 'bad'
      })}
      <p>${L('Sürücü ayrıca şunları getirir:', 'A driver also adds:')}</p>
      <ul>
        <li>${L('düşük empedanslı bir kapatma yolu,', 'a low-impedance turn-off path,')}</li>
        <li>${L('düşük besleme koruması (UVLO),', 'under-voltage lockout (UVLO),')}</li>
        <li>${L('yarım köprüde high-side için yüzen besleme.', 'a floating supply for the high side of a half-bridge.')}</li>
      </ul>

      <h2>${L('Ayrık çözüm: totem-pole (push-pull) tampon', 'Discrete option: the totem-pole (push-pull) buffer')}</h2>
      <p>${L('En basit sürücü iki emitter follower’dır: üstte NPN, altta PNP. Base’ler ve emitter’lar birleşiktir.', 'The simplest driver is two emitter followers: an NPN on top, a PNP below. Bases and emitters are tied.')}</p>
      <ul>
        <li>${L('Giriş yükselir: NPN iletir ve gate’e akım <b>verir</b> (source).', 'Input rises: the NPN conducts and <b>sources</b> current into the gate.')}</li>
        <li>${L('Giriş düşer: PNP iletir ve gate’ten akım <b>çeker</b> (sink).', 'Input falls: the PNP conducts and <b>sinks</b> current out of the gate.')}</li>
        <li>${L('Girişten β kat daha az akım çekilir.', 'The input supplies β times less current.')}</li>
      </ul>
      <p>${L('Bedeli V<sub>BE</sub> düşümüdür. Çıkış 0,7 V ile V<sub>CC</sub> − 0,7 V arasında kalır.', 'The price is the V<sub>BE</sub> drop. The output stays between 0.7 V and V<sub>CC</sub> − 0.7 V.')}</p>
      ${App.figure('fig-totem', L('Totem-pole: yükselen kenarda NPN verir, düşen kenarda PNP çeker', 'Totem-pole: NPN sources on the rising edge, PNP sinks on the falling edge'), {
        foot: L('Mavi noktalar gate akımıdır. Giriş 0/12 V, önünde seviye çevirici var. R<sub>G</sub> = 4,7 Ω, C<sub>iss</sub> ≈ 3 nF. İki transistör sırayla açılır, tamponda shoot-through olmaz.',
                'Blue dots are gate current. Input is 0/12 V, with a level shifter in front. R<sub>G</sub> = 4.7 Ω, C<sub>iss</sub> ≈ 3 nF. The transistors take turns, so the buffer has no shoot-through.')
      })}
      <div class="call warn"><strong>${L('Ayrık tamponun sınırları', 'Limits of the discrete buffer')}</strong>
        <ul>
          <li>${L('Giriş 0/12 V olmalı. 3,3 V’luk GPIO çıkışı ancak 2,6 V’a çıkarır.', 'The input must swing 0/12 V. A 3.3 V GPIO only lifts the output to 2.6 V.')}</li>
          <li>${L('Base akımı I<sub>G</sub>/β’dır: 2 A tepe, β = 50 ile 40 mA ister.', 'Base current is I<sub>G</sub>/β: a 2 A peak with β = 50 needs 40 mA.')}</li>
          <li>${L('UVLO, eşleşmiş gecikme ve koruma yoktur.', 'No UVLO, no matched delay, no protection.')}</li>
        </ul>
        ${L('1–2 euroluk bir sürücü IC çoğu zaman daha küçük, hızlı ve güvenlidir.', 'A driver IC costing a euro or two is usually smaller, faster and safer.')}</div>

      <h2>${L('Sürücü IC’leri', 'Driver ICs')}</h2>
      <p>${L('Üç ana aile vardır:', 'There are three main families:')}</p>
      <ul>
        <li>${L('<b>Low-side:</b> source’u toprağa bağlı MOSFET için.', '<b>Low-side:</b> for a MOSFET with a grounded source.')}</li>
        <li>${L('<b>Yarım köprü:</b> bootstrap ile high-side gate’i switch düğümünün üstüne çıkarır.', '<b>Half-bridge:</b> a bootstrap lifts the high-side gate above the switch node.')}</li>
        <li>${L('<b>İzole:</b> yüksek gerilim ve gürültülü ortamlar için galvanik yalıtım.', '<b>Isolated:</b> galvanic isolation for high voltage and noisy environments.')}</li>
      </ul>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Tip', 'Type')}</th><th class="num">${L('Tepe akım', 'Peak current')}</th><th class="num">${L('Besleme', 'Supply')}</th><th class="num">${L('Gecikme', 'Prop. delay')}</th><th>${L('Özellikler', 'Features')}</th></tr></thead>
        <tbody>
          <tr><td>TC4420 / TC4429</td><td>low-side</td><td class="num">6 A</td><td class="num">${L('4,5–18 V', '4.5–18 V')}</td><td class="num">~55 ns</td><td>${L('Klasik, dayanıklı, UVLO yok; TC4429 evirici', 'Classic, rugged, no UVLO; TC4429 inverting')}</td></tr>
          <tr><td>MCP1407</td><td>low-side</td><td class="num">6 A</td><td class="num">${L('4,5–18 V', '4.5–18 V')}</td><td class="num">~45 ns</td><td>${L('TTL/CMOS giriş, 3,3 V lojikten doğrudan', 'TTL/CMOS input, straight from 3.3 V logic')}</td></tr>
          <tr><td>UCC27517</td><td>low-side</td><td class="num">4 A / 4 A</td><td class="num">${L('4,5–18 V', '4.5–18 V')}</td><td class="num">~13 ns</td><td>${L('UVLO (~4,2 V), SOT-23-5, negatif girişe dayanıklı', 'UVLO (~4.2 V), SOT-23-5, tolerates negative input')}</td></tr>
          <tr><td>UCC27511</td><td>low-side</td><td class="num">4 A / 8 A</td><td class="num">${L('4,5–18 V', '4.5–18 V')}</td><td class="num">~13 ns</td><td>${L('Ayrı source/sink çıkışları: R<sub>on</sub>/R<sub>off</sub> için diyot gerekmez', 'Split source/sink outputs: no diode needed for R<sub>on</sub>/R<sub>off</sub>')}</td></tr>
          <tr><td>IR2104</td><td>${L('yarım köprü', 'half-bridge')}</td><td class="num">${L('0,13 / 0,27 A', '0.13 / 0.27 A')}</td><td class="num">10–20 V</td><td class="num">~680 ns</td><td>${L('600 V bootstrap, sabit ~520 ns dead-time, UVLO; yavaş ama basit', '600 V bootstrap, fixed ~520 ns dead-time, UVLO; slow but simple')}</td></tr>
          <tr><td>IR2110</td><td>${L('high + low', 'high + low')}</td><td class="num">2 A / 2 A</td><td class="num">10–20 V</td><td class="num">~120 ns</td><td>${L('500 V bootstrap, bağımsız girişler (dead-time MCU’dan), UVLO', '500 V bootstrap, independent inputs (dead-time from the MCU), UVLO')}</td></tr>
          <tr><td>UCC27211</td><td>${L('yarım köprü', 'half-bridge')}</td><td class="num">4 A / 4 A</td><td class="num">8–17 V</td><td class="num">~18 ns</td><td>${L('120 V, dahili bootstrap diyotu, eşleşmiş gecikme ~2 ns, UVLO', '120 V, integrated bootstrap diode, ~2 ns delay matching, UVLO')}</td></tr>
          <tr><td>Si8271</td><td>${L('izole', 'isolated')}</td><td class="num">${L('1,8 / 4 A', '1.8 / 4 A')}</td><td class="num">${L('çıkış 30 V’a kadar', 'output up to 30 V')}</td><td class="num">~60 ns</td><td>${L('2,5 kV<sub>rms</sub>, yüksek CMTI (≥ 200 kV/µs), UVLO seçenekleri', '2.5 kV<sub>rms</sub>, high CMTI (≥ 200 kV/µs), UVLO options')}</td></tr>
          <tr><td>UCC5350</td><td>${L('izole', 'isolated')}</td><td class="num">±5 A</td><td class="num">${L('çıkış 33 V’a kadar', 'output up to 33 V')}</td><td class="num">~70 ns</td><td>${L('3–5 kV<sub>rms</sub>, Miller clamp veya ayrı çıkış seçenekleri, UVLO', '3–5 kV<sub>rms</sub>, Miller-clamp or split-output variants, UVLO')}</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('Tipik datasheet değerleridir, varyanta göre değişir. Tasarımda güncel datasheet’i kullan.', 'Typical datasheet figures; they vary by variant. Design from the current datasheet.')}</p>

      <h3>${L('Bootstrap: high-side N-MOSFET’i nasıl açarız?', 'Bootstrap: how do we turn on a high-side N-MOSFET?')}</h3>
      <p>${L('Üst MOSFET açıkken source’u V<sub>DD</sub>’dedir. Açık kalması için gate V<sub>DD</sub> + 10 V olmalı.', 'With the upper MOSFET on, its source sits at V<sub>DD</sub>. Its gate must reach V<sub>DD</sub> + 10 V.')}</p>
      <ul>
        <li>${L('Alt MOSFET iletirken switch düğümü topraktadır. C<sub>boot</sub> bir diyotla 12 V’a dolar.', 'While the low side conducts, the switch node is at ground. C<sub>boot</sub> charges to 12 V through a diode.')}</li>
        <li>${L('Üst MOSFET açılınca C<sub>boot</sub> switch düğümüyle yükselir. Sürücünün high-side bölümünü besler.', 'When the high side turns on, C<sub>boot</sub> rides up with the switch node. It powers the driver’s high side.')}</li>
      </ul>
      <div class="eq">C<sub>boot</sub> ≥ (Q<sub>g</sub> + I<sub>q</sub>·t<sub>on,max</sub>) / ΔV<sub>${L('izin', 'allowed')}</sub> &nbsp;&nbsp;→ ${L('pratikte', 'in practice')} <b>C<sub>boot</sub> ≈ 10–20 × C<sub>iss</sub></b>
        <span class="note">${L('ΔV: kabul edilen düşüm, ör. 0,5 V. %100 doluluk mümkün değildir: duty’yi %95–98 ile sınırla ya da şarj pompası kullan.',
                               'ΔV: the droop you accept, e.g. 0.5 V. 100 % duty is impossible: limit duty to 95–98 % or use a charge pump.')}</span></div>

      <h2>${L('UVLO: düşük gerilimde neden kapalı kalmalı?', 'UVLO: why stay off when the supply is low?')}</h2>
      <p>${L('Yarı açık bir MOSFET, kapalı bir MOSFET’ten çok daha tehlikelidir. UVLO, besleme eşiğin altındayken çıkışı zorla düşük tutar.', 'A half-on MOSFET is far more dangerous than an off one. UVLO holds the output low while the supply is below a threshold.')}</p>
      <ul>
        <li>${L('Açılışta ya da bootstrap boşalırken gate’e yalnızca 4–6 V gidebilir.', 'At power-on, or with a drooping bootstrap, the gate may get only 4–6 V.')}</li>
        <li>${L('Standart (10 V) MOSFET bu gerilimde tam açılmaz; R<sub>DS(on)</sub> onlarca kat büyür.', 'A standard (10 V) MOSFET does not fully turn on; R<sub>DS(on)</sub> grows tens of times.')}</li>
        <li>${L('MOSFET lineer bölgede kalır ve yük akımını taşırken yanar.', 'The MOSFET sits in the linear region and burns while carrying load current.')}</li>
      </ul>
      ${App.lab('lab-uvlo', L('Sürücü beslemesi, R<sub>DS(on)</sub> ve UVLO', 'Driver supply, R<sub>DS(on)</sub> and UVLO'), {
        foot: L('Model: R<sub>DS(on)</sub> ∝ 1/(V<sub>GS</sub> − V<sub>th</sub>), doyum akımı I<sub>sat</sub> = K·(V<sub>GS</sub> − V<sub>th</sub>)<sup>2</sup> (tam sürmede 200 A). Standart: 10 V’ta 8 mΩ, V<sub>th</sub> ≈ 3 V. Logic-level: 4,5 V’ta 8 mΩ, V<sub>th</sub> ≈ 1,5 V. Yük 24 V’tan dirençsel; UVLO eşiği 8 V.',
                'Model: R<sub>DS(on)</sub> ∝ 1/(V<sub>GS</sub> − V<sub>th</sub>), saturation current I<sub>sat</sub> = K·(V<sub>GS</sub> − V<sub>th</sub>)<sup>2</sup> (200 A at full drive). Standard: 8 mΩ at 10 V, V<sub>th</sub> ≈ 3 V. Logic-level: 8 mΩ at 4.5 V, V<sub>th</sub> ≈ 1.5 V. Resistive load from 24 V; UVLO threshold 8 V.')
      })}

      <h2>${L('Ayrı açma ve kapama dirençleri', 'Separate turn-on and turn-off resistors')}</h2>
      <p>${L('Açılış biraz yavaş, kapanış hızlı olsun. Tek bir R<sub>G</sub> ikisini aynı oranda yavaşlatır.', 'Make turn-on a bit slow and turn-off fast. A single R<sub>G</sub> slows both equally.')}</p>
      <ul>
        <li>${L('Yavaş açılış: daha az EMI, daha yumuşak diyot toparlanması.', 'Slow turn-on: less EMI, gentler diode recovery.')}</li>
        <li>${L('Hızlı, sağlam kapanış: dV/dt ile istenmeyen açılmaya karşı.', 'Fast, stiff turn-off: resists dV/dt-induced turn-on.')}</li>
      </ul>
      <p>${L('Çözüm: R<sub>on</sub>’a paralel bir diyot + küçük R<sub>off</sub>. UCC27511 gibi ayrı source/sink çıkışlı sürücülerde diyot bile gerekmez.', 'The fix: a diode + small R<sub>off</sub> in parallel with R<sub>on</sub>. Drivers with split source/sink pins, like the UCC27511, need no diode.')}</p>
      ${App.figure('fig-split', L('R<sub>on</sub> = 10 Ω, R<sub>off</sub> = 2,2 Ω + diyot', 'R<sub>on</sub> = 10 Ω, R<sub>off</sub> = 2.2 Ω + diode'), {
        foot: L('Açılışta akım yalnızca R<sub>on</sub>’dan geçer. Kapanışta çoğu diyot + R<sub>off</sub>’tan geçer. Gate ~0,7 V’un altına inince diyot söner, kalanı R<sub>on</sub> boşaltır. RC modeli, C<sub>iss</sub> = 3 nF.',
                'At turn-on current flows only through R<sub>on</sub>. At turn-off most goes through the diode + R<sub>off</sub>. Below ~0.7 V the diode stops and R<sub>on</sub> drains the rest. RC model, C<sub>iss</sub> = 3 nF.')
      })}

      <h2>${L('Dead-time: iki anahtar asla birlikte iletmemeli', 'Dead-time: the two switches must never conduct together')}</h2>
      <p>${L('Yarım köprüde komutlar aynı anda değişirse iki MOSFET bir an birlikte iletir. Buna <b>shoot-through</b> denir.', 'If the commands in a half-bridge change together, both MOSFETs conduct for a moment. This is <b>shoot-through</b>.')}</p>
      <ul>
        <li>${L('Kapanma, açılmadan hep daha uzun sürer: t<sub>d(off)</sub> + t<sub>f</sub> &gt; t<sub>d(on)</sub> + t<sub>r</sub>.', 'Turn-off always takes longer than turn-on: t<sub>d(off)</sub> + t<sub>f</sub> &gt; t<sub>d(on)</sub> + t<sub>r</sub>.')}</li>
        <li>${L('İki sürücü kanalının gecikmesi birebir aynı değildir.', 'The two driver channels never have exactly equal delay.')}</li>
        <li>${L('Sonuç: V<sub>DD</sub> kısa devre olur, akımı yalnızca döngü endüktansı sınırlar.', 'Result: V<sub>DD</sub> is shorted, and only loop inductance limits the current.')}</li>
      </ul>
      <p>${L('Her olay onlarca–yüzlerce amperlik bir darbedir: ısı, EMI ve sonunda ölü MOSFET.', 'Each event is a pulse of tens to hundreds of amps: heat, EMI and finally a dead MOSFET.')}</p>
      <p>${L('Çözüm <b>dead-time</b>’dır: kapama ile diğerinin açma komutu arasına bilinçli bir boşluk. Bu sürede endüktif yük akımı bir MOSFET’in <b>body diyotundan</b> akar.', 'The fix is <b>dead-time</b>: a deliberate gap between one turn-off and the other turn-on. Meanwhile the inductive load current flows through a <b>body diode</b>.')}</p>
      <p>${L('Body diyotunun düşümü 0,7–1,2 V’tur ve toparlanması yavaştır. Bu yüzden dead-time gereğinden uzun da olmamalı.', 'The body diode drops 0.7–1.2 V and recovers slowly. So dead-time should not be longer than needed.')}</p>
      <div class="eq">t<sub>dead</sub> &gt; (t<sub>d(off)</sub> + t<sub>f</sub>)<sub>max</sub> − t<sub>d(on),min</sub> + |Δt<sub>prop</sub>|<sub>max</sub> &nbsp;&nbsp;&nbsp; P<sub>dead</sub> ≈ <b>V<sub>F</sub> · I · t<sub>dead</sub> · 2 · f<sub>sw</sub></b>
        <span class="note">${L('Δt<sub>prop</sub>: kanallar arası gecikme uyumsuzluğu (“delay matching”). Kayıp, periyot başına iki dead-time sayar.',
                               'Δt<sub>prop</sub>: delay mismatch between channels (“delay matching”). The loss counts two dead-times per period.')}</span></div>
      ${App.lab('lab-dead', L('Yarım köprü zamanlama diyagramı: dead-time, gecikme uyumsuzluğu, shoot-through', 'Half-bridge timing diagram: dead-time, delay mismatch, shoot-through'), {
        stack: true,
        foot: L('Yük akımı switch düğümünden dışarı akar; dead-time’da alt body diyotu iletir. Açılma 20 ns sabit. Düz çizgiler gerçek iletim, kesikli çizgiler komutlardır. Tepe akım ≈ V<sub>DD</sub>·t<sub>örtüşme</sub>/L<sub>döngü</sub> (48 V, 20 nH). Ters toparlanma gösterilmedi.',
                'Load current flows out of the switch node; during dead-time the low-side body diode conducts. Turn-on is fixed at 20 ns. Solid traces are real conduction, dashed are commands. Peak ≈ V<sub>DD</sub>·t<sub>overlap</sub>/L<sub>loop</sub> (48 V, 20 nH). Reverse recovery not shown.')
      })}
      <div class="call tip"><strong>${L('Pratik dead-time değerleri', 'Practical dead-time values')}</strong>
        <ul>
          <li>${L('≤ 100 V MOSFET köprüsü, iyi sürücü: 50–200 ns', '≤ 100 V MOSFET bridge, good driver: 50–200 ns')}</li>
          <li>${L('Büyük ya da yavaş sürülen MOSFET: 300 ns–1 µs', 'Large or slowly driven MOSFET: 300 ns–1 µs')}</li>
          <li>${L('IGBT: 1–3 µs', 'IGBT: 1–3 µs')}</li>
        </ul>
        ${L('STM32/ESP32 zamanlayıcıları dead-time’ı donanımda ekler. IR2104’te sabit bir dead-time vardır.', 'STM32/ESP32 timers insert dead-time in hardware. The IR2104 has a fixed one built in.')}</div>

      <h2>${L('Layout: nanohenriler volt olur', 'Layout: nanohenries become volts')}</h2>
      <p>${L('Her bakır yol bir endüktanstır. Hızlı akım değişimi onun üzerinde gerilim üretir.', 'Every copper trace is an inductor. Fast current changes create voltage across it.')}</p>
      <ul>
        <li>${L('İnce PCB yolu: <b>~1 nH/mm</b>', 'Thin PCB trace: <b>~1 nH/mm</b>')}</li>
        <li>${L('TO-220 bacağı: 5–10 nH', 'TO-220 lead: 5–10 nH')}</li>
      </ul>
      ${App.example({
        given: [['I', '10 A'], ['t<sub>f</sub>', '10 ns'], ['L', '20 nH']],
        steps: [
          ['di/dt', '10 A / 10 ns', '1 A/ns'],
          [L('Endüktif gerilim', 'Inductive voltage'), 'V = 20 nH · 1 A/ns', '20 V']
        ],
        result: L('<b>Drain’de V<sub>DD</sub>’nin üstüne 20 V eklenir.</b> Bu aşma ve ringing olarak görünür.', '<b>20 V adds on top of V<sub>DD</sub> at the drain.</b> It shows up as overshoot and ringing.'),
        level: 'warn'
      })}
      <div class="eq">V = <b>L · di/dt</b> &nbsp;&nbsp;&nbsp; f<sub>ring</sub> = 1 / (2π·√(L·C<sub>oss</sub>)) &nbsp;&nbsp;&nbsp; V<sub>${L('tepe', 'peak')}</sub> ≈ V<sub>DD</sub> + I·√(L/C<sub>oss</sub>)
        <span class="note">${L('Son formül ani kesme için üst sınırdır. Kesme yavaşsa (t<sub>f</sub> ≫ ringing periyodu) aşma ≈ L·I/t<sub>f</sub>. √(L/C) döngünün karakteristik empedansıdır.',
                               'The last formula is the bound for an instant cut. For a slow cut (t<sub>f</sub> ≫ ring period) overshoot ≈ L·I/t<sub>f</sub>. √(L/C) is the loop’s characteristic impedance.')}</span></div>
      ${App.lab('lab-ring', L('Kapanışta V<sub>DS</sub> aşması ve ringing', 'V<sub>DS</sub> overshoot and ringing at turn-off'), {
        foot: L('Model: döngü endüktansı L, C<sub>oss</sub> ve sönüm direnci R; kanal akımı doğrusal kesilir, serbest geçiş diyotu ideal. Snubber: C<sub>s</sub> = 3·C<sub>oss</sub>, R<sub>s</sub> = √(L/C<sub>oss</sub>). Kırmızı alan V<sub>(BR)DSS</sub> üstüdür: avalanche.',
                'Model: loop inductance L, C<sub>oss</sub> and damping R; channel current is cut linearly, the freewheel diode is ideal. Snubber: C<sub>s</sub> = 3·C<sub>oss</sub>, R<sub>s</sub> = √(L/C<sub>oss</sub>). The red area is above V<sub>(BR)DSS</sub>: avalanche.')
      })}

      <h3>${L('İyi ve kötü yerleşim', 'Good and bad placement')}</h3>
      ${App.figure('fig-pcb', L('Güç döngüsünün alanı = endüktans', 'Power-loop area = inductance'), {
        foot: L('Bakır: güç döngüsü (kondansatör → üst MOSFET → alt MOSFET → toprak). Mavi: gate döngüsü. Taralı alan endüktansla orantılıdır. Sağda kondansatör MOSFET’lerin yanında, dönüş yolu hemen altta. Değerler örnektir.',
                'Copper: the power loop (cap → high side → low side → ground). Blue: the gate loop. The shaded area scales with inductance. On the right the cap sits next to the MOSFETs and the return runs directly beneath. Values are illustrative.')
      })}
      <div class="cards">
        <div class="card"><h4>${L('Dekuplajı yakına koy', 'Put decoupling close')}</h4><p>${L('MOSFET’lere birkaç mm mesafede 100 nF–1 µF seramik. Hızlı akım seramikten gelir; bulk kondansatör uzakta olabilir.', 'A 100 nF–1 µF ceramic a few mm from the MOSFETs. Fast current comes from it; the bulk cap can sit further away.')}</p></div>
        <div class="card"><h4>${L('Dönüş yolu yolun altında', 'Return path under the trace')}</h4><p>${L('Yüksek frekanslı akım gidiş yolunun hemen altından döner. Kesintisiz toprak düzlemi döngüyü küçültür; düzlemi yarıklarla bölme.', 'HF current returns directly under the outgoing trace. A solid ground plane shrinks the loop; do not slot it.')}</p></div>
        <div class="card"><h4>${L('Sürücü gate’e yakın', 'Driver close to the gate')}</h4><p>${L('Gate döngüsü küçük olmalı. Uzun yol C<sub>iss</sub> ile rezonansa girer; gate’te 10–22 Ω bunu sönümler.', 'Keep the gate loop small. A long trace resonates with C<sub>iss</sub>; 10–22 Ω at the gate damps it.')}</p></div>
        <div class="card"><h4>${L('Kelvin source', 'Kelvin source')}</h4><p>${L('Sürücü GND’sini ayrı bir yolla doğrudan source pinine bağla. TO-247-4 gibi paketlerde ayrı Kelvin pini vardır.', 'Run driver GND on its own trace straight to the source pin. Packages like TO-247-4 have a dedicated Kelvin pin.')}</p></div>
      </div>
      <h3>${L('Ortak source endüktansı', 'Common-source inductance')}</h3>
      <p>${L('Source bacağı hem güç hem gate döngüsündeyse, üzerindeki L<sub>S</sub>·di/dt sürücü gerilimini <b>azaltır</b>. Anahtarlama yavaşlar, kayıp artar.', 'If the source lead is shared by the power and gate loops, L<sub>S</sub>·di/dt across it <b>subtracts</b> from the drive. Switching slows and losses rise.')}</p>
      <div class="eq">V<sub>GS,${L('etkin', 'eff')}</sub> = V<sub>drv</sub> − I<sub>G</sub>·R<sub>G</sub> − <b>L<sub>S</sub> · di<sub>D</sub>/dt</b></div>
      ${App.example({
        given: [['L<sub>S</sub>', L('5 nH (TO-220)', '5 nH (TO-220)')], ['di/dt', '2 A/ns'], ['V<sub>drv</sub>', '12 V']],
        steps: [[L('Source bacağında düşen', 'Drop on the source lead'), 'V = 5 nH · 2 A/ns', '10 V']],
        result: L('<b>Sürücünün 12 V’unun neredeyse tamamı kaybolur.</b> Kelvin source L<sub>S</sub>’yi gate döngüsünden çıkarır.', '<b>Almost all of the driver’s 12 V is lost.</b> A Kelvin source takes L<sub>S</sub> out of the gate loop.'),
        level: 'bad'
      })}

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <details class="fold"><summary>${L('48 V, 20 A, 50 kHz yarım köprüde dead-time ve aşma ne olur?', '48 V, 20 A, 50 kHz half-bridge: what dead-time and overshoot?')}</summary><div>
        <p>${L('UCC27211 ile sürülen 80 V’luk MOSFET. Önce dead-time, sonra layout kaynaklı aşma.', 'An 80 V MOSFET driven by a UCC27211. First dead-time, then layout overshoot.')}</p>
        ${App.example({
          given: [['t<sub>d(off)</sub>+t<sub>f</sub>', '60 ns max'], ['t<sub>d(on)</sub>', '15 ns min'], [L('Uyumsuzluk', 'Mismatch'), '7 ns'], ['V<sub>F</sub>', L('0,9 V', '0.9 V')], ['I', '20 A'], ['f<sub>sw</sub>', '50 kHz']],
          steps: [
            [L('Minimum dead-time', 'Minimum dead-time'), '60 − 15 + 7', '52 ns'],
            [L('Paylı seçim', 'Choice with margin'), '', '100 ns', L('sıcaklık ve parça toleransı için', 'for temperature and part spread')],
            [L('Dead-time kaybı', 'Dead-time loss'), L('0,9 · 20 · 100 ns · 2 · 50 kHz', '0.9 · 20 · 100 ns · 2 · 50 kHz'), L('0,18 W', '0.18 W')],
            [L('500 ns seçilseydi', 'If 500 ns were chosen'), '', L('0,9 W', '0.9 W'), L('5 kat fazla: dead-time’ı abartma', '5× more: do not overdo dead-time')]
          ],
          result: L('<b>100 ns dead-time yeterli ve kaybı yalnızca 0,18 W.</b>', '<b>100 ns dead-time is enough and costs only 0.18 W.</b>'),
          level: 'ok'
        })}
        ${App.example({
          given: [['L', L('30 nH (30 mm yol)', '30 nH (30 mm trace)')], ['C<sub>oss</sub>', '1 nF'], ['t<sub>f</sub>', '20 ns'], ['V<sub>(BR)DSS</sub>', '80 V']],
          steps: [
            [L('Karakteristik empedans', 'Characteristic impedance'), '√(30 nH / 1 nF)', L('5,5 Ω', '5.5 Ω')],
            [L('Ani kesme, üst sınır', 'Instant cut, upper bound'), L('48 + 20 · 5,5', '48 + 20 · 5.5'), '158 V', L('80 V’luk MOSFET avalanche’a girer', 'the 80 V MOSFET avalanches')],
            [L('Gerçek t<sub>f</sub> ile aşma', 'Overshoot with real t<sub>f</sub>'), '30 nH · 20 A / 20 ns', '30 V'],
            [L('Tepe gerilim', 'Peak voltage'), '48 + 30', '≈ 78 V', L('sınırda', 'marginal')],
            [L('Döngü 5 nH olursa', 'With a 5 nH loop'), '48 + 5 nH · 20 A / 20 ns', '53 V', L('rahat', 'comfortable')]
          ],
          result: L('<b>30 nH’lik döngü 80 V’luk MOSFET’i sınıra taşır.</b> Döngüyü 5 nH’e indir; laboratuvarda dene.', '<b>A 30 nH loop pushes the 80 V MOSFET to its limit.</b> Shrink the loop to 5 nH; try it in the lab.'),
          level: 'warn'
        })}
      </div></details>`;
    },

    mount(root, App) {
      const { Viz } = App, { Sch, UI } = Viz, L = App.L;

      /* ---------------- Figure: totem-pole buffer ---------------- */
      {
        const fig = root.querySelector('#fig-totem .lab-fig');
        const svg = Viz.schematic(fig, 600, 250, `
          ${Sch.box(10, 105, 90, 50, 'IN', '0 / 12 V')}
          ${Sch.w([[100, 130], [150, 130]], 'sigw')}${Sch.dot(150, 130)}
          ${Sch.w([[150, 90], [150, 170]], 'sigw')}
          ${Sch.w([[150, 90], [170, 90]], 'sigw')}${Sch.w([[150, 170], [170, 170]], 'sigw')}
          ${Sch.npn(200, 90, 'Q1 NPN')}
          ${Sch.pnp(200, 170, 'Q2 PNP')}
          ${Sch.vcc(220, 40, '+12 V')}${Sch.w([[220, 40], [220, 60]])}
          ${Sch.w([[220, 120], [220, 140]])}${Sch.dot(220, 130)}
          ${Sch.w([[220, 200], [220, 215]])}${Sch.gnd(220, 215)}
          ${Sch.w([[220, 130], [260, 130]], 'sigw')}
          ${Sch.res(290, 130, 90, 'R_G')}
          ${Sch.w([[320, 130], [380, 130]], 'sigw')}${Sch.dot(350, 130)}
          ${Sch.cap(350, 160, 0, '')}
          <text x="336" y="166" class="sch-t" text-anchor="end">C_iss</text>
          ${Sch.gnd(350, 190)}
          ${Sch.nmos(410, 130, '')}
          ${Sch.w([[430, 160], [430, 190]])}${Sch.gnd(430, 190)}
          ${Sch.load(430, 60, 0, '')}${Sch.w([[430, 90], [430, 100]])}
          ${Sch.vcc(430, 30, 'V_LOAD')}
          <text id="ttOut" x="236" y="152" class="sch-t sig"></text>
          <text id="ttPh" x="590" y="240" class="sch-t big" text-anchor="end"></text>
          <text x="470" y="120" class="sch-t muted">${L('Q1: source (verir)', 'Q1: sources')}</text>
          <text x="470" y="138" class="sch-t muted">${L('Q2: sink (çeker)', 'Q2: sinks')}</text>
        `);
        const fSrc = new Viz.Flow(svg, 'M220,40V130H350V158', { cls: 'flow e', spacing: 12, speed: 80 });
        const fSnk = new Viz.Flow(svg, 'M350,158V130H220V215', { cls: 'flow e', spacing: 12, speed: 80 });
        const fLd = new Viz.Flow(svg, 'M430,30V190', { spacing: 14 });
        const p = new Viz.Plot(fig, { w: 600, h: 220, x: [0, 2], y: [-0.5, 13], xLabel: L('zaman (µs)', 'time (µs)'), yLabel: 'V', xFmt: v => App.num(v, 1), yFmt: v => App.num(v, 0), yTicks: [0, 4, 8, 12] });
        const tau = 4.7 * 3e-9 * 1e6; // µs (R_G·C_iss)
        const T = 2, half = 1;
        const vin = t => ((t % T) < half ? 12 : 0);
        const vg = t => {
          const tt = t % T;
          if (tt < half) { const v0 = 0.7; return 11.3 - (11.3 - v0) * Math.exp(-tt / (tau * 6)); }
          const v0 = 11.3; return 0.7 + (v0 - 0.7) * Math.exp(-(tt - half) / (tau * 6));
        };
        // slow-motion: the RC is stretched ×6 so it is visible on a 2 µs axis
        p.line('in', Viz.sample(vin, 0, 2, 400), 'faint dash');
        p.line('g', Viz.sample(vg, 0, 2, 400), 'sig');
        p.hline('hi', 11.3, ''); p.hline('lo', 0.7, '');
        p.text('thi', 1.98, 11.3, L('12 − V_BE', '12 − V_BE'), 'muted', 'end', 0, 14);
        p.text('tlo', 1.98, 0.7, 'V_BE', 'muted', 'end', 0, -5);
        p.text('tin', 0.02, 12.4, 'V_IN', 'muted');
        p.text('tg', 0.25, 9.5, 'V_GATE', 'sig');
        let t = 0;
        App.onFrame(dt => {
          t += App.reducedMotion ? 0 : dt * 0.35;
          const tt = App.reducedMotion ? 0.1 : t % T;
          const v = vg(tt), rising = (tt % T) < half;
          const ig = rising ? (11.3 - v) : (v - 0.7);
          const r = ig > 0.15 ? 0.3 + ig / 6 : 0;
          fSrc.rate = rising ? r : 0;
          fSnk.rate = rising ? 0 : r;
          fLd.rate = App.clamp((v - 3) / 4, 0, 1);
          p.vline('cur', tt, 'sig solid');
          p.dot('d', tt, v, 'sig', 4);
          svg.querySelector('#ttOut').textContent = 'V_G = ' + App.num(v, 1) + ' V';
          const ph = svg.querySelector('#ttPh');
          ph.textContent = r === 0 ? L('kararlı: gate akımı yok', 'steady: no gate current') : rising ? L('yükselen kenar: Q1 gate’i şarj ediyor', 'rising edge: Q1 charges the gate') : L('düşen kenar: Q2 gate’i boşaltıyor', 'falling edge: Q2 discharges the gate');
          ph.setAttribute('class', 'sch-t big ' + (r === 0 ? 'muted' : 'sig'));
        });
      }

      /* ---------------- Lab: UVLO ---------------- */
      {
        const lab = root.querySelector('#lab-uvlo');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, { w: 600, h: 320, x: [0, 15], y: [1e-3, 100], logY: true, xLabel: 'V_GS (V)', yLabel: 'R_DS(on) (Ω)', xFmt: v => App.num(v, 0), yFmt: v => App.si(v, 'Ω', 2) });
        const status = App.h('div', { class: 'status ok' }); fig.appendChild(status);
        const sV = UI.slider(ctl, { label: L('Sürücü beslemesi V<sub>CC</sub>', 'Driver supply V<sub>CC</sub>'), min: 2, max: 15, step: 0.1, value: 5, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sI = UI.slider(ctl, { label: L('Nominal yük akımı', 'Nominal load current'), min: 1, max: 30, step: 0.5, value: 10, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const sT = UI.segmented(ctl, { label: 'MOSFET', options: [{ value: 'std', label: L('Standart (10 V)', 'Standard (10 V)') }, { value: 'll', label: 'Logic-level' }], value: 'std', onChange: update });
        const tU = UI.toggle(ctl, { label: L('UVLO (eşik 8 V)', 'UVLO (8 V threshold)'), value: false, onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'vgs', label: 'V<sub>GS</sub>' }, { key: 'r', label: 'R<sub>DS(on)</sub>' },
          { key: 'i', label: L('Gerçek akım', 'Actual current') }, { key: 'vds', label: 'V<sub>DS</sub>' }, { key: 'p', label: L('MOSFET kaybı', 'MOSFET loss') }
        ]);
        const Vdd = 24;
        function update() {
          const std = sT.value === 'std';
          const vth = std ? 3 : 1.5, vfull = std ? 10 : 4.5, r0 = 0.008;
          const ron = v => v <= vth + 0.05 ? 1e3 : Math.min(1e3, r0 * (vfull - vth) / (v - vth));
          p.line('c', Viz.sample(v => ron(v), 0, 15, 300), 'cu');
          p.rect('lin', 0, 1e-3, vth + (vfull - vth) * 0.35, 100, 'bad');
          p.text('lint', 0.2, 50, L('lineer bölge / kapalı', 'linear region / off'), 'bad');
          p.rect('uv', 0, 1e-3, 8, 100, 'warn'); p.hide('uv', !tU.value);
          p.text('uvt', 7.8, 0.002, 'UVLO', 'muted', 'end'); p.hide('uvt', !tU.value);
          p.vline('full', vfull, 'ok');
          p.text('fullt', vfull, 30, L('datasheet R_DS(on) koşulu', 'datasheet R_DS(on) condition'), 'ok', 'start', 4, 0);
          const Rl = Vdd / sI.value;
          const locked = tU.value && sV.value < 8;
          const vgs = locked ? 0 : sV.value;
          const R = ron(vgs);
          // channel saturation current (square law) caps the current near threshold → linear mode
          const Ksat = 200 / Math.pow(vfull - vth, 2);
          const Isat = vgs > vth ? Ksat * Math.pow(vgs - vth, 2) : 0;
          let I = Vdd / (Rl + R);
          const limited = I > Isat;
          if (limited) I = Isat;
          const Vds = limited ? Vdd - I * Rl : I * R, P = I * Vds;
          p.vline('v', Math.max(vgs, 0.05), 'sig solid');
          p.dot('d', Math.max(vgs, 0.05), Math.min(limited ? Vds / Math.max(I, 1e-9) : R, 99), P > 2 ? 'bad' : 'sig', 6);
          ro.set('vgs', App.num(vgs, 1) + ' V' + (locked ? ' (UVLO)' : ''));
          ro.set('r', limited ? L('akım sınırlı', 'current-limited') + ' (' + App.si(Vds / Math.max(I, 1e-9), 'Ω') + ')' : App.si(R, 'Ω'), limited ? 'bad' : '');
          ro.set('i', App.si(I, 'A'));
          ro.set('vds', App.num(Vds, 2) + ' V');
          ro.set('p', App.si(P, 'W'), P > 5 ? 'bad' : P > 1 ? 'warn' : 'ok');
          if (locked) { status.className = 'status ok'; status.textContent = L('UVLO çıkışı düşük tutuyor: MOSFET tamamen kapalı, kayıp yok. Besleme 8 V’u geçince açılacak.', 'UVLO holds the output low: MOSFET fully off, no loss. It will switch on once the supply exceeds 8 V.'); }
          else if (P > 5) { status.className = 'status bad'; status.textContent = L('MOSFET yarı açık (lineer bölge): yükün gerilimini kendi üzerinde tutuyor ve ', 'MOSFET is half on (linear region): it holds the load voltage itself and burns ') + App.si(P, 'W') + L(' yakıyor. Saniyeler içinde ölür.', '. It dies within seconds.'); }
          else if (P > 1) { status.className = 'status warn'; status.textContent = L('Tam açık değil: R_DS(on) datasheet değerinin çok üstünde.', 'Not fully on: R_DS(on) is far above the datasheet value.'); }
          else { status.className = 'status ok'; status.textContent = L('Tam açık: kayıp I²·R_DS(on) ile küçük.', 'Fully on: loss is a small I²·R_DS(on).'); }
        }
        update();
      }

      /* ---------------- Figure: split R_on / R_off ---------------- */
      {
        const fig = root.querySelector('#fig-split .lab-fig');
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const left = App.h('div'), right = App.h('div'); grid.append(left, right);
        const svg = Viz.schematic(left, 420, 230, `
          ${Sch.box(10, 85, 80, 50, L('Sürücü', 'Driver'), '0 / 12 V')}
          ${Sch.w([[90, 110], [120, 110]], 'sigw')}${Sch.dot(120, 110)}
          ${Sch.w([[120, 70], [120, 150]], 'sigw')}
          ${Sch.w([[120, 70], [150, 70]], 'sigw')}${Sch.res(180, 70, 90, '')}${Sch.w([[210, 70], [260, 70]], 'sigw')}
          <text x="180" y="54" class="sch-t sig" text-anchor="middle">R_on 10 Ω</text>
          ${Sch.w([[120, 150], [130, 150]], 'sigw')}${Sch.diode(160, 150, 90, '')}${Sch.w([[190, 150], [190, 150]], 'sigw')}
          ${Sch.res(220, 150, 90, '')}${Sch.w([[250, 150], [260, 150]], 'sigw')}
          <text x="205" y="182" class="sch-t sig" text-anchor="middle">D + R_off ${L('2,2', '2.2')} Ω</text>
          ${Sch.w([[260, 70], [260, 150]], 'sigw')}${Sch.dot(260, 110)}
          ${Sch.w([[260, 110], [300, 110]], 'sigw')}
          ${Sch.nmos(330, 110, '')}
          ${Sch.w([[350, 140], [350, 170]])}${Sch.gnd(350, 170)}
          ${Sch.w([[350, 80], [350, 40]])}
          <text id="spPh" x="210" y="220" class="sch-t big" text-anchor="middle"></text>
        `);
        const fOn = new Viz.Flow(svg, 'M90,110H120V70H260V110H300', { cls: 'flow e', spacing: 12, speed: 70 });
        const fOff = new Viz.Flow(svg, 'M300,110H260V150H120V110H90', { cls: 'flow e', spacing: 12, speed: 70 });
        const fOnRev = new Viz.Flow(svg, 'M300,110H260V70H120V110H90', { cls: 'flow e', spacing: 12, speed: 70 });
        const p = new Viz.Plot(right, { w: 420, h: 230, x: [0, 300], y: [0, 13], xLabel: L('zaman (ns)', 'time (ns)'), yLabel: 'V_GS (V)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0), yTicks: [0, 4, 8, 12] });
        const C = 3e-9, tOn = 10 * C * 1e9, tOff = 2.2 * C * 1e9; // ns
        // turn-on 0..150 ns, turn-off 150..300 ns. turn-off: parallel (Ron) and (D + Roff) while vg > 0.7
        const vOn = t => 12 * (1 - Math.exp(-t / tOn));
        const v150 = vOn(150);
        const tauPar = (10 * 2.2 / 12.2) * C * 1e9;
        const tSw = tauPar * Math.log(v150 / 0.7);
        const vOff = t => t < tSw ? v150 * Math.exp(-t / tauPar) : 0.7 * Math.exp(-(t - tSw) / tOn);
        const vg = t => t < 150 ? vOn(t) : vOff(t - 150);
        p.line('g', Viz.sample(vg, 0, 300, 400), 'sig');
        p.line('ref', Viz.sample(t => t < 150 ? vOn(t) : v150 * Math.exp(-(t - 150) / tOn), 0, 300, 300), 'faint dash');
        p.text('t1', 20, 12.4, L('açılış: R_on', 'turn-on: R_on'), 'muted');
        p.text('t2', 160, 12.4, L('kapanış: R_on ∥ R_off', 'turn-off: R_on ∥ R_off'), 'muted');
        p.text('t3', 296, 3, L('tek R_G = 10 Ω', 'single R_G = 10 Ω'), 'muted', 'end');
        void tOff;
        let t = 0;
        App.onFrame(dt => {
          t += App.reducedMotion ? 0 : dt * 70;
          const tt = App.reducedMotion ? 170 : t % 300;
          const v = vg(tt);
          p.vline('cur', tt, 'sig solid'); p.dot('d', tt, v, 'sig', 4);
          const ph = svg.querySelector('#spPh');
          if (tt < 150) {
            const r = (12 - v) / 12; fOn.rate = r > 0.02 ? 0.3 + r * 2 : 0; fOff.rate = 0; fOnRev.rate = 0;
            ph.textContent = L('açılış: yalnızca R_on', 'turn-on: R_on only');
          } else {
            const r = v / 12;
            fOn.rate = 0;
            fOff.rate = v > 0.7 ? 0.3 + r * 2.4 : 0;
            fOnRev.rate = r > 0.01 ? 0.2 + r * 0.6 : 0;
            ph.textContent = v > 0.7 ? L('kapanış: diyot + R_off hızlı yol', 'turn-off: diode + R_off fast path') : L('V_G < 0,7 V: diyot söndü', 'V_G < 0.7 V: diode stops');
          }
          ph.setAttribute('class', 'sch-t big sig');
        });
      }

      /* ---------------- Lab: dead-time ---------------- */
      {
        const lab = root.querySelector('#lab-dead');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const left = App.h('div'), right = App.h('div'); grid.append(left, right);
        const svg = Viz.schematic(left, 600, 290, `
          ${Sch.vcc(320, 30, 'V_DD = 48 V')}${Sch.w([[320, 30], [320, 50]])}
          ${Sch.nmos(300, 80, 'Q_H', { bd: true })}
          ${Sch.w([[320, 110], [320, 165]])}${Sch.dot(320, 135)}
          ${Sch.nmos(300, 195, 'Q_L', { bd: true })}
          ${Sch.w([[320, 225], [320, 255]])}${Sch.gnd(320, 255)}
          ${Sch.box(40, 55, 150, 165, L('Yarım köprü', 'Half-bridge'), L('sürücü', 'driver'))}
          ${Sch.w([[190, 80], [270, 80]], 'sigw')}${Sch.w([[190, 195], [270, 195]], 'sigw')}
          <text x="200" y="72" class="sch-t sig">HO</text><text x="200" y="187" class="sch-t sig">LO</text>
          ${Sch.w([[320, 135], [440, 135]], 'hot')}
          ${Sch.ind(470, 135, 90, '')}
          ${Sch.w([[500, 135], [560, 135], [560, 165]], 'hot')}
          ${Sch.load(560, 195, 0, '')}
          ${Sch.w([[560, 225], [560, 255]])}${Sch.gnd(560, 255)}
          <text x="470" y="120" class="sch-t">L</text><text x="400" y="128" class="sch-t">SW</text>
          <text id="dtSt" x="590" y="30" class="sch-t big" text-anchor="end"></text>
          <text id="dtSw" x="400" y="155" class="sch-t cu"></text>
        `);
        const fH = new Viz.Flow(svg, 'M320,30V135H560V255', { spacing: 14 });
        const fLch = new Viz.Flow(svg, 'M320,255V135H560V255', { spacing: 14 });
        const fD = new Viz.Flow(svg, 'M320,255V217H338V173H320V135H560V255', { spacing: 14 });
        const fSt = new Viz.Flow(svg, 'M320,30V255', { cls: 'flow bad', spacing: 9, speed: 140, r: 3.2 });
        const p = new Viz.Plot(right, { w: 600, h: 290, x: [0, 1100], y: [0, 8.2], yTicks: [], xLabel: L('zaman (ns)', 'time (ns)'), xFmt: v => App.num(v, 0), margin: { l: 64, r: 14, t: 12, b: 42 } });
        const sDt = UI.slider(ctl, { label: 'Dead-time', min: 0, max: 300, step: 5, value: 100, fmt: v => App.num(v, 0) + ' ns', onInput: update });
        const sMm = UI.slider(ctl, { label: L('Gecikme uyumsuzluğu (HO − LO)', 'Delay mismatch (HO − LO)'), min: -150, max: 150, step: 5, value: 0, fmt: v => App.num(v, 0) + ' ns', onInput: update });
        const sOff = UI.slider(ctl, { label: L('Kapanma t<sub>d(off)</sub> + t<sub>f</sub>', 'Turn-off t<sub>d(off)</sub> + t<sub>f</sub>'), min: 10, max: 300, step: 5, value: 60, fmt: v => App.num(v, 0) + ' ns', onInput: update });
        const sI = UI.slider(ctl, { label: L('Yük akımı I', 'Load current I'), min: 1, max: 40, step: 1, value: 20, fmt: v => App.num(v, 0) + ' A', onInput: update });
        const sF = UI.slider(ctl, { label: 'f<sub>sw</sub>', min: 5e3, max: 500e3, step: 1e3, value: 50e3, log: true, unit: 'Hz', onInput: update });
        const sVf = UI.slider(ctl, { label: L('Body diyot V<sub>F</sub>', 'Body diode V<sub>F</sub>'), min: 0.5, max: 1.3, step: 0.05, value: 0.9, fmt: v => App.num(v, 2) + ' V', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'oa', label: L('Örtüşme (H→L kenarı)', 'Overlap (H→L edge)') },
          { key: 'ob', label: L('Örtüşme (L→H kenarı)', 'Overlap (L→H edge)') },
          { key: 'st', label: 'Shoot-through' },
          { key: 'ipk', label: L('Shoot-through tepe akımı', 'Shoot-through peak') },
          { key: 'td', label: L('Diyot iletim süresi / periyot', 'Diode conduction / period') },
          { key: 'pd', label: L('Dead-time (diyot) kaybı', 'Dead-time (diode) loss') },
          { key: 'pst', label: L('Shoot-through kaybı', 'Shoot-through loss') }
        ]);
        const A = 200, B = 750, ton = 20, Vdd = 48, Lloop = 20e-9;
        let S = null, tc = 0;
        const yH = [6.4, 7.6], yL = [4.4, 5.6], ySw = [2.0, 3.7], yI = [0.25, 1.45];
        p.text('lH', 0, 7, 'Q_H', 'sig', 'end', -8, 4);
        p.text('lL', 0, 5, 'Q_L', 'sig', 'end', -8, 4);
        p.text('lS', 0, 2.85, 'V_SW', '', 'end', -8, 4);
        p.text('lI', 0, 0.8, 'I_shoot', 'bad', 'end', -8, 4);
        function update() {
          const dt = sDt.value, mm = sMm.value, toff = sOff.value;
          const dH = Math.max(mm, 0), dL = Math.max(-mm, 0);
          // commands: HO high on [-, A) and [B+dt, -); LO high on [A+dt, B)
          const hEndA = A + dH + toff, lStartA = A + dt + dL + ton;
          const lEndB = B + dL + toff, hStartB = B + dt + dH + ton;
          const ovA = hEndA - lStartA, ovB = lEndB - hStartB;
          S = { hEndA, lStartA, lEndB, hStartB, ovA, ovB };
          const hOn = t => t < hEndA || t >= hStartB;
          const lOn = t => t >= lStartA && t < lEndB;
          S.hOn = hOn; S.lOn = lOn;
          const sq = (f, y) => Viz.sample(t => f(t) ? y[1] : y[0], 0, 1100, 1100);
          p.line('cH', Viz.sample(t => (t < A || t >= B + dt) ? yH[1] : yH[0], 0, 1100, 1100), 'faint dash');
          p.line('cL', Viz.sample(t => (t >= A + dt && t < B) ? yL[1] : yL[0], 0, 1100, 1100), 'faint dash');
          p.line('H', sq(hOn, yH), 'sig');
          p.line('L', sq(lOn, yL), 'sig');
          const vsw = t => { const h = hOn(t), l = lOn(t); if (h && l) return (ySw[0] + ySw[1]) / 2; if (h) return ySw[1]; if (l) return ySw[0]; return ySw[0] - 0.35; };
          p.line('S', Viz.sample(vsw, 0, 1100, 1100), '');
          const ist = t => { const h = hOn(t), l = lOn(t); if (!(h && l)) return 0; const a = t < 475 ? [lStartA, hEndA] : [hStartB, lEndB]; const x = (t - a[0]) / Math.max(1, a[1] - a[0]); return Math.sin(Math.PI * Math.min(1, Math.max(0, x))); };
          S.ist = ist;
          const ipts = Viz.sample(t => yI[0] + (yI[1] - yI[0]) * ist(t), 0, 1100, 1100);
          p.line('I', ipts, 'bad');
          p.area('Ia', ipts, 'bad', yI[0]);
          // diode intervals
          const dA = Math.max(0, lStartA - hEndA), dB = Math.max(0, hStartB - lEndB);
          p.rect('dA', hEndA, ySw[0] - 0.55, hEndA + dA, ySw[0] + 0.05, 'warn'); p.hide('dA', dA <= 0);
          p.rect('dB', lEndB, ySw[0] - 0.55, lEndB + dB, ySw[0] + 0.05, 'warn'); p.hide('dB', dB <= 0);
          p.text('dT', A + 40, ySw[0] - 0.8, L('body diyot (−V_F)', 'body diode (−V_F)'), 'muted', 'start');
          p.hide('dT', dA <= 0 && dB <= 0);
          S.dA = dA; S.dB = dB;
          const st = ovA > 0 || ovB > 0;
          const ovMax = Math.max(ovA, ovB, 0);
          const Ipk = Vdd * ovMax * 1e-9 / Lloop;
          // E per event ≈ ½·V·I_pk·t_ov with I_pk = V·t_ov/L → ½·V²·t_ov²/L
          const Ev = ov => ov > 0 ? 0.5 * Vdd * Vdd * Math.pow(ov * 1e-9, 2) / Lloop : 0;
          const Pst = (Ev(ovA) + Ev(ovB)) * sF.value;
          const fmtO = ov => ov > 0 ? App.num(ov, 0) + ' ns' : L('yok (boşluk ', 'none (gap ') + App.num(-ov, 0) + ' ns)';
          ro.set('oa', fmtO(ovA), ovA > 0 ? 'bad' : 'ok');
          ro.set('ob', fmtO(ovB), ovB > 0 ? 'bad' : 'ok');
          ro.set('st', st ? L('EVET', 'YES') : L('hayır', 'no'), st ? 'bad' : 'ok');
          ro.set('ipk', st ? '≈ ' + App.si(Ipk, 'A') : '—', st ? 'bad' : '');
          ro.set('td', App.num(dA + dB, 0) + ' ns');
          const Pd = sVf.value * sI.value * (dA + dB) * 1e-9 * sF.value;
          ro.set('pd', App.si(Pd, 'W'), Pd > 1 ? 'warn' : '');
          ro.set('pst', st ? App.si(Pst, 'W') : '0 W', st ? 'bad' : 'ok');
          const stEl = svg.querySelector('#dtSt');
          stEl.textContent = st ? 'SHOOT-THROUGH!' : L('örtüşme yok', 'no overlap');
          stEl.setAttribute('class', 'sch-t big ' + (st ? 'bad' : 'ok'));
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!S) return;
          tc += dt;
          const t = App.reducedMotion ? 260 : ((tc / 6) % 1) * 1100;
          p.vline('cur', t, 'sig solid');
          const h = S.hOn(t), l = S.lOn(t);
          fSt.rate = h && l ? 2.2 : 0;
          fH.rate = h && !l ? 1 : 0;
          fLch.rate = l && !h ? 1 : 0;
          fD.rate = !h && !l ? 1 : 0;
          svg.querySelector('#dtSw').textContent = h && l ? L('V_DD kısa devre!', 'V_DD shorted!') : h ? 'V_SW = 48 V' : l ? 'V_SW ≈ 0 V' : 'V_SW ≈ −' + App.num(sVf.value, 1) + ' V';
          svg.querySelector('#dtSw').setAttribute('class', 'sch-t ' + (h && l ? 'bad' : 'cu'));
        });
      }

      /* ---------------- Lab: overshoot and ringing ---------------- */
      {
        const lab = root.querySelector('#lab-ring');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, { w: 600, h: 320, x: [0, 100], y: [0, 100], xLabel: L('zaman (ns)', 'time (ns)'), yLabel: 'V_DS (V)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
        const status = App.h('div', { class: 'status ok' }); fig.appendChild(status);
        const sL = UI.slider(ctl, { label: L('Döngü endüktansı L', 'Loop inductance L'), min: 1e-9, max: 100e-9, step: 0.5e-9, value: 20e-9, log: true, unit: 'H', onInput: update });
        const sI = UI.slider(ctl, { label: L('Kesilen akım I', 'Current interrupted I'), min: 1, max: 50, step: 0.5, value: 10, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const sTf = UI.slider(ctl, { label: L('Akım düşüş süresi t<sub>f</sub>', 'Current fall time t<sub>f</sub>'), min: 1e-9, max: 100e-9, step: 0.5e-9, value: 10e-9, log: true, unit: 's', onInput: update });
        const sC = UI.slider(ctl, { label: 'C<sub>oss</sub>', min: 100e-12, max: 5e-9, step: 10e-12, value: 500e-12, log: true, unit: 'F', onInput: update });
        const sV = UI.slider(ctl, { label: 'V<sub>DD</sub>', min: 12, max: 100, step: 1, value: 24, fmt: v => App.num(v, 0) + ' V', onInput: update });
        const sR = UI.slider(ctl, { label: L('Döngü direnci R (sönüm)', 'Loop resistance R (damping)'), min: 0.02, max: 3, step: 0.01, value: 0.5, log: true, fmt: v => App.si(v, 'Ω'), onInput: update });
        const sBv = UI.slider(ctl, { label: 'V<sub>(BR)DSS</sub>', min: 20, max: 150, step: 5, value: 80, fmt: v => App.num(v, 0) + ' V', onInput: update });
        const tS = UI.toggle(ctl, { label: L('RC snubber', 'RC snubber'), value: false, onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'f', label: 'f<sub>ring</sub> = 1/(2π√LC)' },
          { key: 'z', label: 'Z<sub>0</sub> = √(L/C)' },
          { key: 'e1', label: L('Ani kesme sınırı V<sub>DD</sub>+I·Z<sub>0</sub>', 'Instant-cut bound V<sub>DD</sub>+I·Z<sub>0</sub>') },
          { key: 'e2', label: 'V<sub>DD</sub> + L·I/t<sub>f</sub>' },
          { key: 'pk', label: L('Simülasyon tepe', 'Simulated peak') },
          { key: 'm', label: L('Marj', 'Margin') }
        ]);
        let wave = [], Xmax = 100, tc = 0;
        function update() {
          const Lh = sL.value, I = sI.value, tf = sTf.value, C = sC.value, Vdd = sV.value, R = sR.value, BV = sBv.value;
          const per = 2 * Math.PI * Math.sqrt(Lh * C), Z0 = Math.sqrt(Lh / C);
          const snub = tS.value, Cs = 3 * C, Rs = Z0;
          const Ttot = tf + 7 * per + 2 * C * Vdd / I, pre = 0.1 * Ttot;
          const dt = Math.min(per, tf) / 300;
          const n = Math.min(60000, Math.ceil((Ttot + pre) / dt));
          const h = (Ttot + pre) / n;
          let v = 0.05, id = 0, vs = 0, on = false, pk = 0;
          wave = [];
          const every = Math.max(1, Math.floor(n / 600));
          for (let k = 0; k <= n; k++) {
            const t = -pre + k * h;
            const ich = t < 0 ? I : I * Math.max(0, 1 - t / tf);
            if (!on && v >= Vdd) on = true;
            if (on) id += (v - Vdd - R * id) / Lh * h;
            const is = snub ? (v - vs) / Rs : 0;
            if (snub) vs += is / Cs * h;
            v += (I - ich - id - is) / C * h;
            if (v < 0) v = 0;
            if (v > pk) pk = v;
            if (k % every === 0) wave.push([t * 1e9, v]);
          }
          Xmax = Ttot * 1e9;
          const ymax = Math.max(Vdd * 1.3, pk * 1.12, BV * 1.1);
          p.setRange({ x: [-pre * 1e9, Xmax], y: [0, ymax] });
          p.line('v', wave, 'cu');
          p.hline('vdd', Vdd, '');
          p.text('vddT', Xmax, Vdd, 'V_DD', 'muted', 'end', -4, 14);
          p.hline('bv', BV, 'bad');
          p.rect('aval', -pre * 1e9, BV, Xmax, ymax, 'bad');
          p.text('bvT', Xmax, BV, 'V_(BR)DSS', 'bad', 'end', -4, -5);
          p.hline('pk', pk, 'cu');
          p.text('pkT', -pre * 1e9, pk, L('tepe ', 'peak ') + App.num(pk, 1) + ' V', 'cu', 'start', 4, -5);
          ro.set('f', App.si(1 / per, 'Hz'));
          ro.set('z', App.si(Z0, 'Ω'));
          ro.set('e1', App.num(Vdd + I * Z0, 1) + ' V');
          ro.set('e2', App.num(Vdd + Lh * I / tf, 1) + ' V');
          ro.set('pk', App.num(pk, 1) + ' V', pk > BV ? 'bad' : pk > 0.8 * BV ? 'warn' : 'ok');
          ro.set('m', App.num((1 - pk / BV) * 100, 0) + ' %', pk > BV ? 'bad' : pk > 0.8 * BV ? 'warn' : 'ok');
          if (pk > BV) { status.className = 'status bad'; status.textContent = L('Tepe gerilim V_(BR)DSS’yi aşıyor: MOSFET her kapanışta avalanche’a giriyor. Döngüyü küçült, t_f’yi yavaşlat, snubber ekle ya da daha yüksek gerilimli MOSFET seç.', 'Peak exceeds V_(BR)DSS: the MOSFET avalanches at every turn-off. Shrink the loop, slow t_f, add a snubber or pick a higher-voltage MOSFET.'); }
          else if (pk > 0.8 * BV) { status.className = 'status warn'; status.textContent = L('%20’den az marj. Genel kural: tepe gerilim V_(BR)DSS’nin %80’ini geçmesin.', 'Less than 20 % margin. Rule of thumb: keep the peak below 80 % of V_(BR)DSS.'); }
          else { status.className = 'status ok'; status.textContent = L('Marj yeterli.', 'Enough margin.'); }
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!wave.length) return;
          tc += dt;
          const ph = App.reducedMotion ? 1 : Math.min(1, (tc % 4) / 3.2);
          const k = Math.min(wave.length - 1, Math.floor(ph * (wave.length - 1)));
          p.vline('cur', wave[k][0], 'sig solid');
          p.dot('d', wave[k][0], wave[k][1], wave[k][1] > sBv.value ? 'bad' : '', 4);
        });
      }

      /* ---------------- Figure: PCB loops ---------------- */
      {
        const fig = root.querySelector('#fig-pcb .lab-fig');
        // part footprint helper: rectangle with pads
        const part = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="pcb-pad"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" class="sch-t" text-anchor="middle">${label}</text>`;
        const svg = Viz.schematic(fig, 600, 300, `
          <rect x="8" y="30" width="284" height="240" rx="8" class="pcb-board"/>
          <rect x="308" y="30" width="284" height="240" rx="8" class="pcb-board"/>
          <text x="150" y="20" class="sch-t big bad" text-anchor="middle">${L('Kötü: büyük döngü', 'Bad: large loop')}</text>
          <text x="450" y="20" class="sch-t big ok" text-anchor="middle">${L('İyi: küçük döngü', 'Good: small loop')}</text>
          <path class="loop-bad" d="M40,60H250V230H40Z"/>
          <path class="pcb-tr" d="M40,60H250V110"/>
          <path class="pcb-tr" d="M250,150V190"/>
          <path class="pcb-gnd" d="M250,230H40V100"/>
          ${part(20, 70, 40, 30, 'C')}
          ${part(230, 110, 40, 40, 'Q_H')}
          ${part(230, 190, 40, 40, 'Q_L')}
          ${part(60, 150, 56, 40, L('Sür.', 'Drv'))}
          <path class="pcb-gt" d="M116,160H170V130H230"/>
          <path class="pcb-gt" d="M116,180H200V210H230"/>
          <text x="150" y="262" class="sch-t bad" text-anchor="middle">${L('L ≈ 40 nH → 1 A/ns’de 40 V', 'L ≈ 40 nH → 40 V at 1 A/ns')}</text>
          <path class="loop-ok" d="M418,95H470V195H418Z"/>
          <path class="pcb-tr" d="M418,105V95H450"/>
          <path class="pcb-tr" d="M470,130V145"/>
          <path class="pcb-gnd" d="M470,185V195H418V145"/>
          ${part(400, 105, 36, 40, 'C')}
          ${part(450, 90, 40, 40, 'Q_H')}
          ${part(450, 145, 40, 40, 'Q_L')}
          ${part(520, 112, 50, 56, L('Sür.', 'Drv'))}
          <path class="pcb-gt" d="M520,125H490"/>
          <path class="pcb-gt" d="M520,155H505V165H490"/>
          <text x="450" y="262" class="sch-t ok" text-anchor="middle">${L('L ≈ 3 nH → 1 A/ns’de 3 V', 'L ≈ 3 nH → 3 V at 1 A/ns')}</text>
          <text x="450" y="244" class="sch-t muted" text-anchor="middle">${L('dönüş: iç katmanda, yolun altında', 'return: inner layer, under the trace')}</text>
        `);
        const f1 = new Viz.Flow(svg, 'M40,85V60H250V230H40V85', { spacing: 16, speed: 60 });
        const f2 = new Viz.Flow(svg, 'M418,125V95H470V195H418V125', { spacing: 10, speed: 30 });
        const g1 = new Viz.Flow(svg, 'M116,160H170V130H230', { cls: 'flow e', spacing: 12, speed: 50 });
        const g2 = new Viz.Flow(svg, 'M520,125H490', { cls: 'flow e', spacing: 8, speed: 30 });
        // keep part bodies and labels above the moving dots
        svg.querySelectorAll('.pcb-pad, text').forEach(n => svg.appendChild(n));
        let t = 0;
        App.onFrame(dt => {
          t += dt;
          const pulse = 0.5 + 0.5 * Math.sin(t * 2);
          f1.rate = f2.rate = 0.4 + pulse * 0.8;
          g1.rate = g2.rate = pulse > 0.8 ? 1.2 : 0;
        });
      }
    }
  });
})();
