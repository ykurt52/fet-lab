/* 14 — Worked designs: six complete circuits, each with an animated schematic, the calculation,
   part choice, a live "what if" lab and a BOM. */
(function () {
  'use strict';

  /* ---------- small text helpers ---------- */
  const notes = (L, items) => `<h3>${L('Tasarım notları', 'Design notes')}</h3><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const bomHead = L => `<h3>BOM</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Ref</th><th>${L('Parça', 'Part')}</th><th>${L('Değer / not', 'Value / note')}</th><th>${L('Kılıf', 'Package')}</th></tr></thead>
        <tbody>`;

  /* ---------- static text per design (render) ---------- */
  function designA(L) {
    return `
      <p>${L('<b>Küçük bir logic-level MOSFET yeter.</b> AO3400A, ESP32’nin 3,3 V pininden doğrudan sürülür ve ısınmaz.',
             '<b>A small logic-level MOSFET is enough.</b> The AO3400A runs straight from the ESP32’s 3.3 V pin and stays cool.')}</p>
      <h3>${L('Hesap', 'Calculation')}</h3>
      ${App.example({
        given: [[L('Yük', 'Load'), L('12 V fan, 0,25 A', '12 V fan, 0.25 A')], [L('Kalkış', 'Start-up'), '≈ 0,5 A'], ['PWM', '25 kHz'], ['GPIO', '3,3 V'], [L('Anahtar', 'Switch'), 'low-side']],
        steps: [
          [L('V<sub>DS</sub> payı', 'V<sub>DS</sub> margin'), 'V<sub>DS</sub> ≥ 1,5 × 12 V', '≥ 18 V', L('30 V’luk parça seç', 'pick a 30 V part')],
          [L('3,3 V’ta R<sub>DS(on)</sub>', 'R<sub>DS(on)</sub> at 3.3 V'), L('48 mΩ @ 2,5 V ile 32 mΩ @ 4,5 V arası', 'between 48 mΩ @ 2.5 V and 32 mΩ @ 4.5 V'), '≈ 42 mΩ', L('AO3400A, maks., 25 °C', 'AO3400A, max, 25 °C')],
          [L('Sıcakta R<sub>DS(on)</sub>', 'Hot R<sub>DS(on)</sub>'), '42 mΩ × 1,4', '≈ 59 mΩ'],
          [L('İletim kaybı', 'Conduction loss'), 'P = 0,25² × 0,059 × 1', '3,7 mW', L('D = 1, en kötü durum', 'D = 1, worst case')],
          [L('Gate tepe akımı', 'Peak gate current'), 'I = 3,3 V / (100 + 30) Ω', '≈ 25 mA', L('kısa darbe, pin için güvenli', 'short pulse, safe for the pin')],
          [L('Açılış gate akımı', 'Turn-on gate current'), 'I<sub>G</sub> = (3,3 − 1,7) / 130', '≈ 12 mA', L('Miller platosu ≈ 1,7 V', 'Miller plateau ≈ 1.7 V')],
          [L('Geçiş süresi', 'Transition time'), 't<sub>r</sub> = 2 nC / 12 mA', '≈ 0,16 µs', L('Q<sub>gd</sub> ≈ 2 nC; t<sub>f</sub> ≈ 0,15 µs', 'Q<sub>gd</sub> ≈ 2 nC; t<sub>f</sub> ≈ 0.15 µs')],
          [L('Anahtarlama kaybı', 'Switching loss'), 'P = ½ × 12 × 0,25 × 0,31 µs × 25 kHz', '≈ 12 mW'],
          [L('Gate sürme gücü', 'Gate drive power'), 'P = 4 nC × 3,3 V × 25 kHz', '≈ 0,3 mW', L('MOSFET’te değil, R<sub>G</sub> ve pinde harcanır', 'spent in R<sub>G</sub> and the pin, not the MOSFET')],
          [L('Isınma', 'Temperature rise'), 'ΔT = 16 mW × 125 °C/W', '≈ 2 °C', L('SOT-23, R<sub>θJA</sub>', 'SOT-23, R<sub>θJA</sub>')],
          [L('PWM çözünürlüğü', 'PWM resolution'), '80 MHz / 25 kHz = 3200', '11 bit', L('ESP32 LEDC, 2048 adım', 'ESP32 LEDC, 2048 steps')]
        ],
        result: L('<b>AO3400A soğutucusuz çalışır.</b> Toplam kayıp ≈ 16 mW, ısınma yalnızca 2 °C.',
                  '<b>The AO3400A needs no heatsink.</b> Total loss ≈ 16 mW, a rise of only 2 °C.')
      })}
      ${App.figure('exA-fig', L('Son devre: GPIO PWM üretiyor, fan akımı diyot üzerinden serbest dolaşıyor', 'Final circuit: the GPIO PWMs, fan current freewheels through the diode'), {
        foot: L('Animasyon ~40 000 kat yavaş. MOSFET kapalıyken fan akımı SS14 üzerinden dönmeye devam eder (bakır döngü). Mavi noktalar gate akımıdır.',
                'Animation slowed ~40 000×. With the MOSFET off, fan current keeps circulating through the SS14 (copper loop). Blue dots are gate current.')
      })}
      ${notes(L, [
        L('<b>Pull-down:</b> gate–source arası 10 kΩ. ESP32 açılırken pin boşta kalır; direnç fanı kapalı tutar.',
          '<b>Pull-down:</b> 10 kΩ gate to source. The pin floats while the ESP32 boots; the resistor keeps the fan off.'),
        L('<b>Pin seçimi:</b> strapping pinlerini (GPIO0, 2, 12, 15) kullanma.',
          '<b>Pin choice:</b> avoid the strapping pins (GPIO0, 2, 12, 15).'),
        L('<b>Flyback:</b> fanın uçlarına SS14 Schottky, katot +12 V’a. 25 kHz’te ters toparlanma olmamalı.',
          '<b>Flyback:</b> an SS14 Schottky across the fan, cathode to +12 V. At 25 kHz it must have no reverse recovery.')
      ])}
      <h3>${L('Parça seçimi', 'Part choice')}</h3>
      <div class="cards">
        <div class="card"><h4>AO3400A</h4><p>${L('30 V, 5,7 A. R<sub>DS(on)</sub> 2,5 V’ta bile garanti. V<sub>GS(max)</sub> ±12 V, SOT-23, çok ucuz.', '30 V, 5.7 A. R<sub>DS(on)</sub> guaranteed down to 2.5 V. V<sub>GS(max)</sub> ±12 V, SOT-23, very cheap.')}</p></div>
        <div class="card"><h4>${L('Neden BJT değil?', 'Why not a BJT?')}</h4><p>${L('0,5 A kalkış için 25–50 mA base akımı gerekir: pin için fazla. 25 kHz’te depolama zamanı da sorun.', '0.5 A start-up needs 25–50 mA of base current: too much for the pin. At 25 kHz storage time is a problem too.')}</p></div>
        <div class="card"><h4>SS14 / 1N5819</h4><p>${L('Schottky: t<sub>rr</sub> ≈ 0, V<sub>F</sub> ≈ 0,4 V. PWM’de 1N4007 yanlış seçimdir (<a href="#mistakes">Bölüm 15</a>).', 'Schottky: t<sub>rr</sub> ≈ 0, V<sub>F</sub> ≈ 0.4 V. A 1N4007 is wrong in PWM (<a href="#mistakes">Chapter 15</a>).')}</p></div>
      </div>
      <div class="call warn"><strong>${L('4 telli fan mı?', '4-wire fan?')}</strong>
        ${L('Beslemeyi kesme; fanın kendi PWM ucunu 2N7002 ile toprağa çek. 2/3 telli fanda besleme kesmek çalışır ama tach bozulur, fan ötebilir.',
            'Do not chop the supply; pull the fan’s own PWM wire low with a 2N7002. Chopping a 2/3-wire fan works, but the tach breaks and the fan may whine.')}</div>
      ${App.lab('exA-lab', L('Ya şöyle olsaydı? Frekans, R<sub>G</sub> ve kayıplar', 'What if? Frequency, R<sub>G</sub> and losses'), {
        foot: L('Model: AO3400A maks. R<sub>DS(on)</sub> (2,5/4,5/10 V noktalarından), sıcak çarpanı 1,4, Q<sub>gd</sub> = 2 nC, plato 1,6 V + 0,15 V/A, pin direnci 30 Ω, R<sub>θJA</sub> = 125 °C/W, T<sub>a</sub> = 25 °C. Grafik: kayıpların PWM frekansıyla değişimi.',
                'Model: AO3400A max R<sub>DS(on)</sub> (from the 2.5/4.5/10 V points), hot factor 1.4, Q<sub>gd</sub> = 2 nC, plateau 1.6 V + 0.15 V/A, pin resistance 30 Ω, R<sub>θJA</sub> = 125 °C/W, T<sub>a</sub> = 25 °C. Plot: losses versus PWM frequency.')
      })}
      ${bomHead(L)}
          <tr><td>Q1</td><td>AO3400A</td><td>30 V, 5,7 A, logic-level</td><td>SOT-23</td></tr>
          <tr><td>R1</td><td>${L('Gate direnci', 'Gate resistor')}</td><td>100 Ω</td><td>0603</td></tr>
          <tr><td>R2</td><td>Pull-down</td><td>10 kΩ</td><td>0603</td></tr>
          <tr><td>D1</td><td>SS14</td><td>${L('40 V 1 A Schottky, fana paralel', '40 V 1 A Schottky, across the fan')}</td><td>SMA</td></tr>
          <tr><td>C1, C2</td><td>${L('Dekuplaj', 'Decoupling')}</td><td>10 µF 25 V + 100 nF</td><td>0805</td></tr>
          <tr><td>J1</td><td>${L('Fan konnektörü', 'Fan header')}</td><td>2/3 pin</td><td>THT</td></tr>
        </tbody></table></div>`;
  }

  function designB(L) {
    return `
      <p>${L('<b>Bir 2N3904 ve iki direnç yeter.</b> 3,3 V pin, 70 mA’lik bobini rahatça doyuma sokar.',
             '<b>A 2N3904 and two resistors are enough.</b> A 3.3 V pin saturates it easily for a 70 mA coil.')}</p>
      <h3>${L('Hesap', 'Calculation')}</h3>
      ${App.example({
        given: [[L('Röle', 'Relay'), '5 V, 70 mA'], [L('Bobin', 'Coil'), '≈ 71 Ω'], ['L', L('≈ 100 mH (kabul)', '≈ 100 mH (assumed)')], ['GPIO', '3,3 V']],
        steps: [
          [L('Collector akımı', 'Collector current'), 'I<sub>C</sub> = (5 − 0,2) V / 71 Ω', '≈ 70 mA', L('BC547 (100 mA) sınırda, 2N3904 (200 mA) rahat', 'BC547 (100 mA) is marginal, 2N3904 (200 mA) is comfortable')],
          [L('Minimum kazanç', 'Minimum gain'), L('60 @ 50 mA ile 30 @ 100 mA arası', 'between 60 @ 50 mA and 30 @ 100 mA'), 'h<sub>FE(min)</sub> ≈ 40', L('2N3904 datasheet', '2N3904 datasheet')],
          [L('Base akımı', 'Base current'), 'I<sub>B</sub> = 70 mA / 20', '3,5 mA', L('zorlanmış β = 20, yani h<sub>FE(min)</sub>’in yarısı', 'forced β = 20, half of h<sub>FE(min)</sub>')],
          [L('Base direnci', 'Base resistor'), 'R<sub>B</sub> = (3,2 − 0,85) V / 3,5 mA', '≈ 670 Ω → 680 Ω', L('E12; pin akımı her MCU için rahat', 'E12; pin current is fine for any MCU')],
          [L('Pull-down’un çaldığı akım', 'Current stolen by pull-down'), '0,85 V / 10 kΩ', '85 µA', L('ihmal edilir', 'negligible')],
          [L('Transistör kaybı', 'Transistor loss'), 'P = 70 mA × 0,2 V', '14 mW'],
          [L('Bobin gerilimi', 'Coil voltage'), '5 − 0,2', '4,8 V', L('çekme için 3,75 V (%75) yeter', '3.75 V (75 %) is enough to pick up')],
          [L('Bobin enerjisi', 'Coil energy'), 'E = ½ × 0,1 × 0,07²', '≈ 0,25 mJ', L('diyotsuz V<sub>CE</sub> 40 V’u aşar', 'without a diode V<sub>CE</sub> exceeds 40 V')],
          [L('Diyotla V<sub>CE</sub> tepe', 'Peak V<sub>CE</sub> with diode'), '5 + 0,9', '5,9 V'],
          [L('Bırakma zaman sabiti', 'Release time constant'), 'τ = 100 mH / 71 Ω', '≈ 1,4 ms', L('röle birkaç ms geç bırakır', 'the relay releases a few ms late')]
        ],
        result: L('<b>2N3904 + 680 Ω + 1N4148 yeterli.</b> Transistör derin doyumda, kayıp yalnızca 14 mW.',
                  '<b>2N3904 + 680 Ω + 1N4148 is enough.</b> The transistor is deep in saturation, losing only 14 mW.')
      })}
      ${App.figure('exB-fig', L('Son devre: NPN bobini sürüyor, kapanınca akım 1N4148’den dönüyor', 'Final circuit: the NPN drives the coil, at turn-off the current loops through the 1N4148'), {
        foot: L('Kontak, bobin akımı “çekme” seviyesini geçince kapanır, “bırakma” seviyesinin altında açılır. Diyot akımı yavaş söndürür, bu yüzden bırakma gecikir.',
                'The contact closes above the pick-up current and opens below the drop-out current. The diode lets the current decay slowly, so release is delayed.')
      })}
      ${notes(L, [
        L('<b>Pull-down:</b> base–emitter arası 10 kΩ. Açılışta ve kesimde kaçak akımı boşaltır.',
          '<b>Pull-down:</b> 10 kΩ base to emitter. It drains leakage at boot and in cutoff.'),
        L('<b>Hızlı bırakma</b> gerekiyorsa diyota seri bir zener ekle (tasarım d).',
          '<b>Need faster release?</b> Add a zener in series with the diode (design d).')
      ])}
      <h3>${L('Parça seçimi', 'Part choice')}</h3>
      <div class="cards">
        <div class="card"><h4>2N3904 / MMBT3904</h4><p>${L('40 V, 200 mA. 70 mA’de hâlâ h<sub>FE</sub> ≥ 40. Ucuz, her yerde.', '40 V, 200 mA. Still h<sub>FE</sub> ≥ 40 at 70 mA. Cheap and everywhere.')}</p></div>
        <div class="card"><h4>${L('Neden MOSFET değil?', 'Why not a MOSFET?')}</h4><p>${L('Olur da (2N7002, AO3400A). Ama yavaş, 70 mA’lik bir yük için BJT yeterli.', 'It would work (2N7002, AO3400A). But for a slow 70 mA load a BJT is enough.')}</p></div>
        <div class="card"><h4>1N4148</h4><p>${L('Tepe akım bobin akımı kadar, 70 mA. Anahtarlama yavaş, 1N4007 de olur.', 'Peak current equals the coil current, 70 mA. Switching is slow, so a 1N4007 also works.')}</p></div>
      </div>
      ${App.lab('exB-lab', L('Ya şöyle olsaydı? Doyum, pin akımı ve flyback', 'What if? Saturation, pin current and flyback'), {
        foot: L('Model: V<sub>OH</sub> = 3,2 V, V<sub>BE(sat)</sub> = 0,85 V, bobin 5 V, L = 100 mH. Doyum ölçütü: zorlanmış β ≤ h<sub>FE(min)</sub>/2 (iyi), ≤ h<sub>FE(min)</sub> (sınırda). Diyotsuz durumda V<sub>CE</sub> ~60 V çığ kırılmasında kenetlenir (transistörün sınırı dışında).',
                'Model: V<sub>OH</sub> = 3.2 V, V<sub>BE(sat)</sub> = 0.85 V, 5 V coil, L = 100 mH. Saturation test: forced β ≤ h<sub>FE(min)</sub>/2 (good), ≤ h<sub>FE(min)</sub> (marginal). Without the diode V<sub>CE</sub> clamps at ~60 V avalanche (outside the transistor’s ratings).')
      })}
      ${bomHead(L)}
          <tr><td>Q1</td><td>2N3904 / MMBT3904</td><td>40 V, 200 mA</td><td>TO-92 / SOT-23</td></tr>
          <tr><td>R1</td><td>${L('Base direnci', 'Base resistor')}</td><td>680 Ω</td><td>0603</td></tr>
          <tr><td>R2</td><td>Pull-down</td><td>10 kΩ</td><td>0603</td></tr>
          <tr><td>D1</td><td>1N4148</td><td>${L('Bobine paralel, katot +5 V’a', 'Across the coil, cathode to +5 V')}</td><td>SOD-123 / DO-35</td></tr>
          <tr><td>K1</td><td>${L('Röle', 'Relay')}</td><td>5 V, 70 mA ${L('bobin', 'coil')}</td><td>—</td></tr>
        </tbody></table></div>`;
  }

  function designC(L) {
    return `
      <p>${L('<b>3,3 V GPIO bu MOSFET’i güvenle açamaz; gate driver gerekir.</b> IRLZ44N’in R<sub>DS(on)</sub>’u yalnızca 4, 5 ve 10 V için garanti. V<sub>GS(th)</sub> 2 V olan bir parça 3,3 V’ta platoyu ancak geçer.',
             '<b>A 3.3 V GPIO cannot turn this MOSFET on safely; it needs a gate driver.</b> The IRLZ44N’s R<sub>DS(on)</sub> is only guaranteed at 4, 5 and 10 V. A part with a 2 V threshold barely clears the plateau at 3.3 V.')}</p>
      <h3>${L('Hesap 1: doğrudan 3,3 V', 'Calculation 1: straight from 3.3 V')}</h3>
      ${App.example({
        given: [[L('Yük', 'Load'), L('12 V LED şerit, 5 A', '12 V LED strip, 5 A')], ['PWM', '1 kHz'], ['V<sub>GS</sub>', '3,3 V'], ['R<sub>DS(on)</sub>', L('≈ 60 mΩ, tipik', '≈ 60 mΩ, typical')], [L('Ortam', 'Ambient'), '≤ 40 °C'], ['R<sub>θJA</sub>', '62 °C/W']],
        steps: [
          [L('İletim kaybı', 'Conduction loss'), 'P = 5² × 0,060 × 1,45', '≈ 2,2 W', L('1,45 = sıcaklık çarpanı', '1.45 = temperature factor')],
          [L('Jonksiyon sıcaklığı', 'Junction temperature'), 'T<sub>j</sub> = 40 + 2,2 × 62', '≈ 176 °C']
        ],
        result: L('<b>Doğrudan sürüş çalışmaz.</b> T<sub>j</sub> 175 °C sınırını aşar ve bu değer bile garanti değil.',
                  '<b>Direct drive does not work.</b> T<sub>j</sub> exceeds the 175 °C limit, and even that figure is not guaranteed.'),
        level: 'bad'
      })}
      <h3>${L('Hesap 2: 12 V gate driver ile', 'Calculation 2: with a 12 V gate driver')}</h3>
      ${App.example({
        given: [[L('Sürücü', 'Driver'), 'UCC27517, VDD 12 V'], ['V<sub>GS</sub>', '12 V'], ['V<sub>GS(max)</sub>', '±16 V'], ['R<sub>DS(on)</sub>', '≤ 22 mΩ @ 25 °C'], ['R<sub>G</sub>', '10 Ω']],
        steps: [
          [L('Sıcakta R<sub>DS(on)</sub>', 'Hot R<sub>DS(on)</sub>'), '22 mΩ × 1,37', '≈ 30 mΩ', L('~87 °C’de', 'at ~87 °C')],
          [L('İletim kaybı', 'Conduction loss'), 'P = 5² × 0,030', '≈ 0,75 W', L('D = %100, en kötü durum', 'D = 100 %, worst case')],
          [L('T<sub>j</sub>, soğutucusuz', 'T<sub>j</sub>, no heatsink'), 'T<sub>j</sub> = 40 + 0,75 × 62', '≈ 87 °C', L('çalışır ama kılıfa dokunulmaz', 'works, but the case is too hot to touch')],
          [L('T<sub>j</sub>, klips soğutucu', 'T<sub>j</sub>, clip heatsink'), 'T<sub>j</sub> = 40 + 0,64 × 21', '≈ 53 °C', L('toplam ≈ 21 °C/W', '≈ 21 °C/W total')],
          [L('Yükselme süresi', 'Rise time'), 't<sub>r</sub> = 15 nC × 12 Ω / 9,25 V', '≈ 20 ns', L('plato ≈ 2,75 V; t<sub>f</sub> ≈ 65 ns', 'plateau ≈ 2.75 V; t<sub>f</sub> ≈ 65 ns')],
          [L('Anahtarlama kaybı', 'Switching loss'), 'P = ½ × 12 × 5 × 85 ns × 1 kHz', '≈ 2,6 mW', L('ihmal edilir', 'negligible')]
        ],
        result: L('<b>Sürücü + IRLZ44N + klips soğutucu: T<sub>j</sub> ≈ 53 °C.</b> 12 V gate, ±16 V sınırının güvenle altında.',
                  '<b>Driver + IRLZ44N + clip heatsink: T<sub>j</sub> ≈ 53 °C.</b> A 12 V gate stays safely below the ±16 V limit.')
      })}
      ${App.figure('exC-fig', L('Son devre: MCU → gate driver → IRLZ44N', 'Final circuit: MCU → gate driver → IRLZ44N'), {
        foot: L('Deneydeki “sürme” seçimi şemayı da değiştirir. Doğrudan 3,3 V’ta gate yavaş yükselir ve platoda takılır (skopta görülür).',
                'The “drive” choice in the lab also changes this schematic. From a bare 3.3 V GPIO the gate rises slowly and hangs on the plateau (see the scope).')
      })}
      ${notes(L, [
        L('<b>Gate gerilimi:</b> sürücüyü 12 V’tan besle, asla 24 V’tan.', '<b>Gate voltage:</b> power the driver from 12 V, never from 24 V.'),
        L('<b>Kondansatörler:</b> şerit girişine 470 µF + 100 nF, sürücü VDD’sine 1 µF.', '<b>Capacitors:</b> 470 µF + 100 nF at the strip feed, 1 µF at the driver VDD.'),
        L('<b>Gate:</b> 10 kΩ pull-down ve kısa bir gate döngüsü.', '<b>Gate:</b> a 10 kΩ pull-down and a short gate loop.'),
        L('<b>DPAK seçersen:</b> ~2,5 cm² bakırla R<sub>θJA</sub> ≈ 50 °C/W.', '<b>If you use a DPAK:</b> ~2.5 cm² of copper gives R<sub>θJA</sub> ≈ 50 °C/W.'),
        L('<b>Titreme:</b> 1 kHz göze görünmez ama kamerada bant yapabilir. Sürücüyle 20 kHz’te kayıp hâlâ ~50 mW.', '<b>Flicker:</b> 1 kHz is invisible to the eye but cameras may band. With the driver, 20 kHz still costs only ~50 mW.')
      ])}
      <h3>${L('Parça seçimi', 'Part choice')}</h3>
      <div class="cards">
        <div class="card"><h4>IRLZ44N</h4><p>${L('55 V, 47 A, 5 V’ta 25 mΩ garanti. TO-220: lehimlemesi ve soğutması kolay.', '55 V, 47 A, 25 mΩ guaranteed at 5 V. TO-220: easy to solder and to heatsink.')}</p></div>
        <div class="card"><h4>UCC27517</h4><p>${L('4 A tepe, VDD 4,5–18 V. TTL eşikli giriş 3,3 V ile sürülür. Alternatif: TC4427.', '4 A peak, VDD 4.5–18 V. The TTL-threshold input takes 3.3 V. Alternative: TC4427.')}</p></div>
        <div class="card"><h4>${L('Sürücüsüz seçenek', 'Driver-less option')}</h4><p>${L('R<sub>DS(on)</sub>’u 2,5 V’ta garanti eden bir MOSFET seç. Bkz. <a href="#mosfet-drive">Bölüm 06</a>.', 'Pick a MOSFET with R<sub>DS(on)</sub> guaranteed at 2.5 V. See <a href="#mosfet-drive">Chapter 06</a>.')}</p></div>
      </div>
      ${App.lab('exC-lab', L('Ya şöyle olsaydı? Sürme gerilimi, kılıf ve sıcaklık', 'What if? Drive voltage, package and temperature'), {
        foot: L('Model: IRLZ44N maks. R<sub>DS(on)</sub> (3,3 V için tipik 60 mΩ, garanti değil), R(T) = R<sub>25</sub>·(1 + 0,006·(T − 25)), Q<sub>gd</sub> = 15 nC, plato 2,6 V + 0,03 V/A. GPIO: R<sub>G</sub> 100 Ω + 30 Ω pin; sürücü: 10 Ω + 2 Ω. T<sub>j</sub> yinelemeli çözülür. Grafik: yük akımına göre T<sub>j</sub>.',
                'Model: IRLZ44N max R<sub>DS(on)</sub> (typical 60 mΩ at 3.3 V, not guaranteed), R(T) = R<sub>25</sub>·(1 + 0.006·(T − 25)), Q<sub>gd</sub> = 15 nC, plateau 2.6 V + 0.03 V/A. GPIO: R<sub>G</sub> 100 Ω + 30 Ω pin; driver: 10 Ω + 2 Ω. T<sub>j</sub> is solved iteratively. Plot: T<sub>j</sub> versus load current.')
      })}
      ${bomHead(L)}
          <tr><td>Q1</td><td>IRLZ44N</td><td>55 V, 47 A, 22 mΩ @ 10 V</td><td>TO-220 + ${L('klips soğutucu', 'clip heatsink')}</td></tr>
          <tr><td>U1</td><td>UCC27517</td><td>${L('Low-side gate driver, VDD = 12 V', 'Low-side gate driver, VDD = 12 V')}</td><td>SOT-23-5</td></tr>
          <tr><td>R1</td><td>${L('Gate direnci', 'Gate resistor')}</td><td>10 Ω</td><td>0805</td></tr>
          <tr><td>R2</td><td>Pull-down</td><td>10 kΩ</td><td>0603</td></tr>
          <tr><td>C1, C2</td><td>${L('Sürücü dekuplajı', 'Driver decoupling')}</td><td>1 µF 25 V + 100 nF</td><td>0805</td></tr>
          <tr><td>C3</td><td>${L('Şerit besleme', 'Strip feed bulk')}</td><td>470 µF 25 V</td><td>${L('Elektrolitik', 'Electrolytic')}</td></tr>
          <tr><td>F1</td><td>${L('Sigorta', 'Fuse')}</td><td>7,5 A ${L('(bkz. Bölüm 12)', '(see Chapter 12)')}</td><td>${L('Bıçak', 'Blade')}</td></tr>
        </tbody></table></div>`;
  }

  function designD(L) {
    return `
      <p>${L('<b>18 V zener, bırakmayı 2,5 kat hızlandırır.</b> Bedeli: MOSFET 43 V görür, bu yüzden 60 V’luk parça seçilir.',
             '<b>An 18 V zener makes release 2.5× faster.</b> The price: the MOSFET sees 43 V, so a 60 V part is used.')}</p>
      <h3>${L('Hesap', 'Calculation')}</h3>
      <div class="eq">t<sub>${L('bırakma', 'release')}</sub> = τ · ln((I<sub>0</sub> + V<sub>c</sub>/R) / (I<sub>drop</sub> + V<sub>c</sub>/R))
        <span class="note">${L('V<sub>c</sub> = kenetleme gerilimi. Büyük V<sub>c</sub>, akımı daha hızlı söndürür.', 'V<sub>c</sub> = clamp voltage. A larger V<sub>c</sub> kills the current faster.')}</span></div>
      ${App.example({
        given: [[L('Solenoid', 'Solenoid'), '24 V, 1,5 A'], ['R', '16 Ω'], ['L', L('≈ 50 mH (kabul)', '≈ 50 mH (assumed)')], [L('Bırakma akımı', 'Drop-out current'), L('%20 → 0,3 A', '20 % → 0.3 A')], [L('Hız', 'Rate'), L('birkaç Hz', 'a few Hz')]],
        steps: [
          [L('Zaman sabiti', 'Time constant'), 'τ = 50 mH / 16 Ω', '≈ 3,1 ms'],
          [L('Depolanan enerji', 'Stored energy'), 'E = ½ × 0,05 × 1,5²', '≈ 56 mJ'],
          [L('Bırakma, yalnız diyot', 'Release, diode only'), 't = 3,1 ms × ln(1,55 / 0,35)', '≈ 4,7 ms', L('V<sub>c</sub> ≈ 0,8 V', 'V<sub>c</sub> ≈ 0.8 V')],
          [L('Bırakma, diyot + 18 V zener', 'Release, diode + 18 V zener'), 't = 3,1 ms × ln(2,68 / 1,48)', '≈ 1,9 ms', L('V<sub>c</sub> = 18,8 V; akım 2,6 ms’de sıfır', 'V<sub>c</sub> = 18.8 V; current is zero at 2.6 ms')],
          [L('V<sub>DS</sub> tepe', 'Peak V<sub>DS</sub>'), '24 + 18,8', '42,8 V', L('60 V MOSFET’te %29 pay', '29 % margin on a 60 V MOSFET')],
          [L('Zener enerjisi, her bırakış', 'Clamp energy per release'), 'E<sub>c</sub> = 18,8 × (4,69 − 3,05) mA·s', '≈ 31 mJ', L('kalan ~25 mJ bobin direncinde ısınır', 'the other ~25 mJ heats the coil')],
          [L('Zener ortalama gücü', 'Zener average power'), '31 mJ × 2 Hz', '≈ 60 mW', L('5 W’lık 1N5355B çok rahat', 'a 5 W 1N5355B is relaxed')],
          [L('MOSFET iletim kaybı', 'MOSFET conduction loss'), 'P = 1,5² × 0,035 × 1,5', '≈ 0,12 W', L('ΔT ≈ 7 °C, soğutucusuz', 'ΔT ≈ 7 °C, no heatsink')]
        ],
        result: L('<b>FQP30N06L + 1N4007 + 18 V zener: bırakma 1,9 ms.</b> MOSFET en fazla 42,8 V görür, 60 V sınırının altında.',
                  '<b>FQP30N06L + 1N4007 + 18 V zener: release in 1.9 ms.</b> The MOSFET sees at most 42.8 V, below its 60 V rating.')
      })}
      ${App.figure('exD-fig', L('Son devre: diyot + zener kenetleme, piston hareketi', 'Final circuit: diode + zener clamp, plunger motion'), {
        foot: L('Zaman ~100 kat yavaş. Kapanışta bobin akımı D1 ve Z1 üzerinden döner; V<sub>DS</sub> = 24 V + V<sub>Z</sub> + V<sub>F</sub>. Deneydeki ayarlar bu animasyonu da sürer.',
                'Time slowed ~100×. At turn-off coil current loops through D1 and Z1; V<sub>DS</sub> = 24 V + V<sub>Z</sub> + V<sub>F</sub>. The lab settings also drive this animation.')
      })}
      ${notes(L, [
        L('<b>Gate sürme:</b> FQP30N06L 3,3 V’ta belirtilmemiş. UCC27517’yi 12 V’tan besle (24 V’tan 78L12 ile).',
          '<b>Gate drive:</b> the FQP30N06L is not specified at 3.3 V. Power a UCC27517 from 12 V (78L12 off the 24 V rail).'),
        L('<b>Besleme darbeleri:</b> 24 V girişine bir SMBJ28A TVS koy.', '<b>Supply surges:</b> put an SMBJ28A TVS on the 24 V input.'),
        L('<b>Neden çığa bırakmıyoruz?</b> Enerji MOSFET’te yanar. Yalnızca E<sub>AR</sub> 56 mJ’ü tekrar tekrar karşılıyorsa kabul edilir (<a href="#inductive">Bölüm 08</a>).',
          '<b>Why not let it avalanche?</b> The energy then burns in the MOSFET. Only acceptable if E<sub>AR</sub> covers 56 mJ repetitively (<a href="#inductive">Chapter 08</a>).')
      ])}
      <h3>${L('Parça seçimi', 'Part choice')}</h3>
      <div class="cards">
        <div class="card"><h4>FQP30N06L</h4><p>${L('60 V logic-level TO-220, 12 V gate ile 35 mΩ. ±20 V gate sınırı 12 V sürüşe pay bırakır.', '60 V logic-level TO-220, 35 mΩ with a 12 V gate. The ±20 V gate rating leaves margin for 12 V drive.')}</p></div>
        <div class="card"><h4>1N5355B (18 V 5 W)</h4><p>${L('Darbeye dayanıklı zener. Alternatif: tek yönlü TVS (SMBJ15A).', 'A surge-rated zener. Alternative: a unidirectional TVS (SMBJ15A).')}</p></div>
        <div class="card"><h4>1N4007</h4><p>${L('Seri diyot, zenerin normalde ileri yönde iletmesini engeller. PWM’de UF4007 ya da Schottky kullan.', 'The series diode stops the zener conducting forward in normal operation. In PWM use a UF4007 or a Schottky.')}</p></div>
      </div>
      ${App.lab('exD-lab', L('Ya şöyle olsaydı? Zener gerilimi, bırakma süresi, V<sub>DS</sub> payı', 'What if? Zener voltage, release time, V<sub>DS</sub> margin'), {
        foot: L('Model: kapanışta di/dt = −(V<sub>c</sub> + i·R)/L, V<sub>c</sub> = V<sub>Z</sub> + 0,8 V (V<sub>Z</sub> = 0 → yalnız diyot). R = V/I<sub>0</sub>. Bırakma %20 I<sub>0</sub>’da kabul edildi. Soluk eğri: yalnız diyot karşılaştırması.',
                'Model: at turn-off di/dt = −(V<sub>c</sub> + i·R)/L, V<sub>c</sub> = V<sub>Z</sub> + 0.8 V (V<sub>Z</sub> = 0 → diode only). R = V/I<sub>0</sub>. Drop-out assumed at 20 % of I<sub>0</sub>. Faint curve: diode-only comparison.')
      })}
      ${bomHead(L)}
          <tr><td>Q1</td><td>FQP30N06L</td><td>60 V, 32 A, 35 mΩ @ 10 V</td><td>TO-220</td></tr>
          <tr><td>U1</td><td>UCC27517</td><td>${L('Gate driver, VDD 12 V', 'Gate driver, VDD 12 V')}</td><td>SOT-23-5</td></tr>
          <tr><td>U2</td><td>78L12</td><td>24 V → 12 V, 100 mA</td><td>SOT-89 / TO-92</td></tr>
          <tr><td>D1</td><td>1N4007</td><td>${L('Seri diyot', 'Series diode')}</td><td>DO-41</td></tr>
          <tr><td>Z1</td><td>1N5355B</td><td>18 V, 5 W</td><td>${L('Eksenel', 'Axial')}</td></tr>
          <tr><td>D2</td><td>SMBJ28A</td><td>${L('24 V giriş TVS', '24 V input TVS')}</td><td>SMB</td></tr>
          <tr><td>R1, R2</td><td>R<sub>G</sub>, pull-down</td><td>10 Ω, 10 kΩ</td><td>0805</td></tr>
        </tbody></table></div>`;
  }

  function designE(L) {
    return `
      <p>${L('<b>İki yön için H-köprü gerekir; hazır bir köprü IC’si seç.</b> Ayrık köprüde dead-time, bootstrap ve koruma senin işin. Shoot-through hatası kolayca yapılır.',
             '<b>Two directions need an H-bridge; use an integrated bridge IC.</b> A discrete bridge leaves dead-time, bootstrap and protection to you. Shoot-through mistakes are easy to make.')}</p>
      <h3>${L('Hesap', 'Calculation')}</h3>
      ${App.example({
        given: [['Motor', L('12 V, 2 A çalışma', '12 V, 2 A running')], ['R<sub>m</sub>', '1,2 Ω'], ['L<sub>m</sub>', '≈ 0,5 mH'], [L('Köprü', 'Bridge'), L('VNH5019A-E, ≈ 18 mΩ/anahtar', 'VNH5019A-E, ≈ 18 mΩ/switch')], ['PWM', '20 kHz']],
        steps: [
          [L('Kalkış (stall) akımı', 'Start-up (stall) current'), 'I = 12 V / 1,2 Ω', '10 A', L('her kalkışta, zıt EMK sıfırken', 'at every start, with zero back-EMF')],
          [L('Çalışırken iletim kaybı', 'Running conduction loss'), 'P = 2² × 2 × 0,018 × 1,3', '≈ 0,19 W', L('iki anahtar, sıcaklık çarpanı 1,3', 'two switches, temperature factor 1.3')],
          [L('Anahtarlama kaybı', 'Switching loss'), 'P = ½ × 12 × 2 × 1,5 µs × 20 kHz', '≈ 0,36 W', L('köprünün kenarları yavaş, ~0,75 µs', 'the bridge has slow edges, ~0.75 µs')],
          [L('Stall kaybı', 'Stall loss'), 'P = 10² × 0,036', '≈ 3,6 W', L('yalnız kısa süre dayanır', 'survivable only briefly')],
          [L('Dalgalanma, 20 kHz', 'Ripple at 20 kHz'), 'ΔI = 12 × 0,25 / (0,5 mH × 20 kHz)', '0,3 A', L('yavaş sönüm, D = 0,5', 'slow decay, D = 0.5')],
          [L('Dalgalanma, 1 kHz', 'Ripple at 1 kHz'), 'ΔI = 12 × 0,25 / (0,5 mH × 1 kHz)', '6 A', L('duyulur ıslık ve ek bakır kaybı', 'audible whine and extra copper loss')],
          [L('Akım ölçüm çıkışı', 'Current-sense output'), '10 A × 0,14 V/A', '1,4 V', L('R<sub>CS</sub> ≈ 1 kΩ; ADC’ye uygun', 'R<sub>CS</sub> ≈ 1 kΩ; fits the ADC')],
          [L('Sıcak takma tepe akımı', 'Hot-plug peak current'), 'I = 12 V / 0,1 Ω', '≈ 120 A', L('470 µF’ı yalnız ESR + kablo sınırlar', 'only ESR + cable limit the 470 µF')]
        ],
        result: L('<b>VNH5019A-E, 20 kHz’te çalışırken ≈ 0,55 W harcar.</b> Stall ve sıcak takma akımı ayrıca sınırlanmalı.',
                  '<b>The VNH5019A-E dissipates ≈ 0.55 W running at 20 kHz.</b> Stall and hot-plug current still need limiting.'),
        level: 'warn'
      })}
      ${App.figure('exE-fig', L('Son devre: entegre H-köprü, ileri/geri ve yavaş sönüm', 'Final circuit: integrated H-bridge, forward/reverse and slow decay'), {
        foot: L('PWM açıkken akım çapraz iki anahtardan geçer (bakır). Kapalıyken iki low-side anahtar iletir, akım köprünün altında döner (“yavaş sönüm”). Yön ~3 s’de bir değişir.',
                'With PWM on, current flows through two diagonal switches (copper). With PWM off, both low-side switches conduct and current circulates at the bottom (“slow decay”). Direction flips every ~3 s.')
      })}
      ${notes(L, [
        L('<b>Firmware sınırı:</b> I &gt; 4 A, 300 ms’den uzun sürerse motor kilitlenmiştir; durdur.', '<b>Firmware limit:</b> if I &gt; 4 A for more than 300 ms, the motor is stalled; stop it.'),
        L('<b>Yumuşak kalkış:</b> duty’yi ~300 ms’de yükselt. Kalkış tepesi 10 A’den ~5 A’e iner.', '<b>Soft start:</b> ramp the duty over ~300 ms. The start-up peak drops from 10 A to ~5 A.'),
        L('<b>Bulk kapasitör:</b> köprüde 470 µF düşük ESR şart. Sıcak takmaya karşı NTC ya da eFuse ekle (<a href="#inrush">Bölüm 11</a>).', '<b>Bulk capacitor:</b> 470 µF low-ESR at the bridge is a must. Add an NTC or eFuse against hot-plug (<a href="#inrush">Chapter 11</a>).'),
        L('<b>MCU beslemesi:</b> regülatöre kendi diyotunu ve kapasitörünü ver; çökmelerde resetlenmesin.', '<b>MCU supply:</b> give its regulator its own diode and capacitor, so dips do not reset it.'),
        L('<b>Frenleme:</b> yavaşlayan motor enerjiyi beslemeye geri basar. SMBJ15A TVS ve yeterli kapasitör ekle.', '<b>Braking:</b> a decelerating motor pumps energy back into the supply. Add an SMBJ15A TVS and enough capacitance.')
      ])}
      <h3>${L('Köprü seçenekleri', 'Bridge options')}</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Seçenek', 'Option')}</th><th>${L('Artı', 'Pro')}</th><th>${L('Eksi', 'Con')}</th></tr></thead>
        <tbody>
          <tr><td><b>VNH5019A-E</b></td><td>${L('12 A, koruma, CS çıkışı, tek kılıf', '12 A, protection, CS output, single package')}</td><td>${L('PWM ≤ 20 kHz, orta fiyat', 'PWM ≤ 20 kHz, mid price')}</td></tr>
          <tr><td>DRV8871 / DRV8874</td><td>${L('Akım regülasyonu dahili, küçük', 'Built-in current regulation, small')}</td><td>${L('~3,6–6 A tepe: 10 A stall’u sınırlar, tork düşer', '~3.6–6 A peak: limits the 10 A stall, less torque')}</td></tr>
          <tr><td>L298N</td><td>${L('Ucuz, her yerde', 'Cheap, everywhere')}</td><td>${L('Bipolar: 2 A’de ~3 V düşüm, ~6 W kayıp; motora 9 V kalır', 'Bipolar: ~3 V drop at 2 A, ~6 W loss; motor gets 9 V')}</td></tr>
          <tr><td>${L('Ayrık 4×N-MOS + sürücü', 'Discrete 4×N-MOS + driver')}</td><td>${L('Her akım için ölçeklenir', 'Scales to any current')}</td><td>${L('Dead-time, bootstrap, koruma senin işin', 'Dead-time, bootstrap and protection are your job')}</td></tr>
        </tbody></table></div>
      ${App.lab('exE-lab', L('Ya şöyle olsaydı? Frekans, kalkış rampası, akım sınırı', 'What if? Frequency, start-up ramp, current limit'), {
        foot: L('Model: R<sub>m</sub> = 1,2 Ω, sabit yük torku (2 A), mekanik zaman sabiti 150 ms, endüktans kalkış için ihmal; dalgalanma yavaş sönüm formülüyle. Soluk eğri: rampasız, sınırsız kalkış.',
                'Model: R<sub>m</sub> = 1.2 Ω, constant load torque (2 A), mechanical time constant 150 ms, inductance neglected for start-up; ripple from the slow-decay formula. Faint curve: start without ramp or limit.')
      })}
      ${bomHead(L)}
          <tr><td>U1</td><td>VNH5019A-E</td><td>${L('H-köprü, 12 A, CS çıkışı', 'H-bridge, 12 A, CS output')}</td><td>MultiPowerSO-30</td></tr>
          <tr><td>C1</td><td>${L('Bulk', 'Bulk')}</td><td>470 µF 25 V ${L('düşük ESR', 'low ESR')}</td><td>${L('Elektrolitik', 'Electrolytic')}</td></tr>
          <tr><td>C2</td><td>${L('Dekuplaj', 'Decoupling')}</td><td>100 nF + 1 µF</td><td>0805</td></tr>
          <tr><td>R1, C3</td><td>${L('CS direnci + filtre', 'CS resistor + filter')}</td><td>1 kΩ, 10 nF</td><td>0603</td></tr>
          <tr><td>D1</td><td>SMBJ15A</td><td>${L('Frenleme TVS', 'Braking TVS')}</td><td>SMB</td></tr>
          <tr><td>F1</td><td>${L('Sigorta', 'Fuse')}</td><td>${L('5 A gecikmeli (stall kısa sürer)', '5 A slow-blow (stalls are brief)')}</td><td>${L('Bıçak', 'Blade')}</td></tr>
          <tr><td>RT1</td><td>NTC ${L('(opsiyon)', '(optional)')}</td><td>${L('~1 Ω soğuk, sıcak takma için', '~1 Ω cold, for hot-plug')}</td><td>${L('Disk', 'Disc')}</td></tr>
        </tbody></table></div>`;
  }

  function designF(L) {
    return `
      <p>${L('<b>Anahtar high-side olmalı; sensörün toprağı MCU’ya bağlı kalmalı.</b> Low-side kesilirse kart, sinyal hatları ve MCU pin diyotları üzerinden beslenir. Bu “fantom besleme” pinlere zarar verebilir.',
             '<b>The switch must be high-side; the sensor ground must stay tied to the MCU.</b> Cut the low side and the board feeds itself through the signal lines and the MCU pin diodes. This “phantom powering” can damage the pins.')}</p>
      <h3>${L('Hesap', 'Calculation')}</h3>
      ${App.example({
        given: [[L('Yük', 'Load'), L('sensör kartı, 12 V 0,3 A', 'sensor board, 12 V 0.3 A')], [L('Giriş kapasitesi', 'Input capacitance'), '100 µF'], ['Q1', 'AO3401A, ±12 V'], ['R1 = R2', '10 kΩ'], ['C<sub>GD</sub>', '330 nF'], ['GPIO', '3,3 V']],
        steps: [
          [L('GPIO’dan doğrudan V<sub>GS</sub>', 'V<sub>GS</sub> straight from the GPIO'), '3,3 − 12', '−8,7 V', L('P-MOS hep açık kalır; NPN seviye çevirici gerekir', 'the P-MOS stays on; an NPN level shifter is needed')],
          [L('Bölücüyle V<sub>GS</sub>', 'V<sub>GS</sub> with the divider'), '−(12 − 0,1) × 10k / 20k', '≈ −5,95 V', L('NPN gate’i 0 V’a çekseydi −12 V: tam sınırda', 'pulling the gate to 0 V would give −12 V: right at the limit')],
          ['R<sub>DS(on)</sub>', L('60 mΩ (−4,5 V) ile 50 mΩ (−10 V) arası', 'between 60 mΩ (−4.5 V) and 50 mΩ (−10 V)'), '≈ 57 mΩ'],
          [L('NPN collector akımı', 'NPN collector current'), 'I<sub>C</sub> = 12 V / 20 kΩ', '0,6 mA'],
          [L('NPN base akımı', 'NPN base current'), 'I<sub>B</sub> = (3,3 − 0,7) / 10 kΩ', '0,26 mA', L('çok derin doyum', 'very deep saturation')],
          [L('Sert açılışta inrush', 'Inrush with a hard switch-on'), 'I = 12 V / 0,15 Ω', '≈ 80 A', L('12 V hattı çöker, hattaki her şey resetlenir', 'the 12 V rail collapses and everything on it resets')],
          [L('Platoda gate akımı', 'Gate current on the plateau'), 'I<sub>G</sub> = (12 − 1,8)/R2 − 1,8/R1', '0,84 mA', L('|V<sub>GS</sub>| ≈ 1,8 V', '|V<sub>GS</sub>| ≈ 1.8 V')],
          [L('Çıkış eğimi', 'Output slew rate'), 'dV/dt = 0,84 mA / 330 nF', '≈ 2,5 V/ms', L('rampa ≈ 4,7 ms', 'ramp ≈ 4.7 ms')],
          [L('Yumuşak açılışta inrush', 'Inrush with soft start'), 'I = 100 µF × 2,5 V/ms', '≈ 0,25 A', L('yük akımına ek', 'on top of the load current')],
          [L('Rampada MOSFET enerjisi', 'MOSFET energy during the ramp'), '½CV² + V·I·t/6 = 7,2 + 2,8', '≈ 10 mJ', L('tepe ~2,4 W; 10 ms darbeyi SOA’dan kontrol et', 'peak ~2.4 W; check the 10 ms pulse in the SOA')]
        ],
        result: L('<b>Inrush 80 A yerine 0,25 A.</b> Çıkış ~5 ms’de yumuşakça yükselir, 12 V hattı çökmez.',
                  '<b>Inrush drops from 80 A to 0.25 A.</b> The output rises gently in ~5 ms and the 12 V rail holds.')
      })}
      ${App.figure('exF-fig', L('Son devre: P-MOS + NPN seviye çevirici + Miller kapasitörüyle yumuşak açılış', 'Final circuit: P-MOS + NPN level shifter + Miller-capacitor soft start'), {
        foot: L('GPIO yüksek → NPN iletir → bölücü gate’i ~6 V aşağı çeker → P-MOS açılır. C<sub>GD</sub> gate’i platoda tutar, çıkış ~5 ms’de yükselir. Sağdaki bakır yan dal, 100 µF’ı dolduran akımdır.',
                'GPIO high → NPN conducts → the divider pulls the gate ~6 V down → the P-MOS turns on. C<sub>GD</sub> holds the gate on its plateau, so the output rises in ~5 ms. The copper side branch on the right is the 100 µF charging current.')
      })}
      ${notes(L, [
        L('<b>Base pull-down:</b> 100 kΩ. Açılışta NPN’i kapalı tutar.', '<b>Base pull-down:</b> 100 kΩ. It keeps the NPN off at boot.'),
        L('<b>Kapanış</b> daha yavaştır, ~20 ms: C<sub>GD</sub>’yi yalnız R1 boşaltır. Hızlı kapanış gerekirse R1’i küçült.', '<b>Turn-off</b> is slower, ~20 ms: only R1 discharges C<sub>GD</sub>. Lower R1 if you need it faster.')
      ])}
      <h3>${L('Parça seçimi', 'Part choice')}</h3>
      <div class="cards">
        <div class="card"><h4>AO3401A</h4><p>${L('−30 V, −4 A, ≤ 60 mΩ @ −4,5 V. V<sub>GS(max)</sub> ±12 V, bu yüzden bölücü şart. 24 V hatta R2’yi büyüt ya da ±20 V’luk P-MOS seç.', '−30 V, −4 A, ≤ 60 mΩ @ −4.5 V. V<sub>GS(max)</sub> ±12 V, so the divider is required. On a 24 V rail raise R2 or pick a ±20 V P-MOS.')}</p></div>
        <div class="card"><h4>BC847 / MMBT3904</h4><p>${L('Seviye çevirici, yalnızca 0,6 mA taşır. Her küçük NPN ya da 2N7002 olur.', 'Level shifter carrying only 0.6 mA. Any small NPN or a 2N7002 works.')}</p></div>
        <div class="card"><h4>${L('Hazır çözüm', 'Ready-made')}</h4><p>${L('Yük anahtarı IC’si ya da eFuse aynı işi tek kılıfta yapar. Bkz. <a href="#inrush">Bölüm 11</a>.', 'A load-switch IC or an eFuse does the same in one package. See <a href="#inrush">Chapter 11</a>.')}</p></div>
      </div>
      ${App.lab('exF-lab', L('Ya şöyle olsaydı? Yumuşak açılış ve gate bölücüsü', 'What if? Soft start and the gate divider'), {
        foot: L('Model: |V<sub>plato</sub>| = 1,8 V, R1 gate–source, R2 gate–NPN, NPN V<sub>CE(sat)</sub> = 0,1 V; C<sub>GD</sub> = 0 iken içsel C<sub>rss</sub> ≈ 70 pF ve inrush R = 0,15 Ω ile sınırlanır. Dirençsel yük. AO3401A V<sub>GS(max)</sub> = ±12 V.',
                'Model: |V<sub>plateau</sub>| = 1.8 V, R1 gate–source, R2 gate–NPN, NPN V<sub>CE(sat)</sub> = 0.1 V; with C<sub>GD</sub> = 0 the intrinsic C<sub>rss</sub> ≈ 70 pF applies and inrush is limited by R = 0.15 Ω. Resistive load. AO3401A V<sub>GS(max)</sub> = ±12 V.')
      })}
      ${bomHead(L)}
          <tr><td>Q1</td><td>AO3401A</td><td>−30 V, −4 A, P-MOS</td><td>SOT-23</td></tr>
          <tr><td>Q2</td><td>BC847 / MMBT3904</td><td>NPN ${L('seviye çevirici', 'level shifter')}</td><td>SOT-23</td></tr>
          <tr><td>R1, R2</td><td>${L('Gate bölücü', 'Gate divider')}</td><td>10 kΩ, 10 kΩ</td><td>0603</td></tr>
          <tr><td>R3, R4</td><td>R<sub>B</sub>, pull-down</td><td>10 kΩ, 100 kΩ</td><td>0603</td></tr>
          <tr><td>C1</td><td>C<sub>GD</sub> ${L('(yumuşak açılış)', '(soft start)')}</td><td>330 nF 25 V ${L('(+ ops. 1 kΩ seri)', '(+ opt. 1 kΩ series)')}</td><td>0603</td></tr>
        </tbody></table></div>`;
  }

  /* ---------- page ---------- */
  App.page({
    id: 'examples',
    num: '14',
    group: { tr: 'Uygulama', en: 'Practice' },
    title: { tr: 'Örnek tasarımlar, adım adım', en: 'Worked designs, step by step' },
    blurb: { tr: 'Fan, röle, LED şerit, solenoid, motor ve high-side hat: hesap, parça, BOM.', en: 'Fan, relay, LED strip, solenoid, motor and a high-side rail: maths, parts, BOM.' },
    summary: {
      tr: 'Altı gerçek devre, baştan sona: gereksinim, hesap, parça seçimi ve BOM. “Ya şöyle olsaydı?” panellerinde değerleri değiştirip neyin bozulduğunu canlı görürsün.',
      en: 'Six real circuits, end to end: requirement, maths, part choice and BOM. In the “What if?” panels you change values and watch what breaks, live.'
    },
    render(L) {
      const html = `
        <style>
          [data-page="examples"] .tab-btns button small { display: block; font: 500 .7rem var(--f-mono); color: var(--muted); }
          [data-page="examples"] .status { margin: 0; }
          [data-page="examples"] .scope-cap { font: 500 .72rem var(--f-mono); color: var(--muted); text-align: right; margin-top: -6px; }
          [data-page="examples"] .plg { fill: var(--panel-2); stroke: var(--ink); stroke-width: 1.4; transition: transform .12s; }
        </style>
        ${App.keys([
          L('Önce gereksinimi yaz: gerilim, akım, frekans ve sürme gerilimi.', 'Write the requirement first: voltage, current, frequency and drive voltage.'),
          L('R<sub>DS(on)</sub>’u gerçek V<sub>GS</sub>’te ve sıcakta oku.', 'Read R<sub>DS(on)</sub> at your real V<sub>GS</sub> and when hot.'),
          L('Her endüktif yüke bir söndürme yolu ver: diyot, zener ya da TVS.', 'Give every inductive load a decay path: diode, zener or TVS.'),
          L('Kaybı hesapla, sonra T<sub>j</sub>’yi kontrol et; soğutucu kararı oradan çıkar.', 'Compute the loss, then check T<sub>j</sub>; that decides the heatsink.'),
          L('Kapasitif yükte inrush’ı sınırla: yumuşak açılış, NTC ya da eFuse.', 'Limit inrush into capacitive loads: soft start, NTC or eFuse.')
        ])}
        <p>${L('Her sekme bağımsız bir tasarımdır: hesap, animasyonlu şema, deney paneli ve BOM.', 'Each tab is a self-contained design: maths, animated schematic, lab panel and BOM.')}
           ${L('Formüllerin çıkarılışı teori bölümlerinde: <a href="#bjt-drive">05</a>, <a href="#mosfet-drive">06</a>, <a href="#inductive">08</a>, <a href="#switching">09</a>, <a href="#thermal">13</a>.',
               'The formulas are derived in the theory chapters: <a href="#bjt-drive">05</a>, <a href="#mosfet-drive">06</a>, <a href="#inductive">08</a>, <a href="#switching">09</a>, <a href="#thermal">13</a>.')}</p>
        <div class="tabs" data-tabs>
          <div class="tab-btns">
            <button data-tab="a">${L('a · PC fanı', 'a · PC fan')}<small>12 V · 25 kHz</small></button>
            <button data-tab="b">${L('b · Röle', 'b · Relay')}<small>5 V · NPN</small></button>
            <button data-tab="c">${L('c · LED şerit', 'c · LED strip')}<small>12 V 5 A</small></button>
            <button data-tab="d">${L('d · Solenoid', 'd · Solenoid')}<small>24 V · zener</small></button>
            <button data-tab="e">${L('e · DC motor', 'e · DC motor')}<small>${L('H-köprü', 'H-bridge')}</small></button>
            <button data-tab="f">${L('f · High-side hat', 'f · High-side rail')}<small>P-MOS</small></button>
          </div>
          <section data-panel="a">${designA(L)}</section>
          <section data-panel="b">${designB(L)}</section>
          <section data-panel="c">${designC(L)}</section>
          <section data-panel="d">${designD(L)}</section>
          <section data-panel="e">${designE(L)}</section>
          <section data-panel="f">${designF(L)}</section>
        </div>`;
      // shared formula strings are written with a decimal comma; switch to a point in English
      return App.lang === 'en' ? html.replace(/(\d),(\d)/g, '$1.$2') : html;
    },


    mount(root, App) {
      const { Viz } = App, { Sch, UI } = Viz, L = App.L;
      let active = 'a';
      const tabs = root.querySelector('[data-tabs]');
      tabs.addEventListener('tabchange', e => { active = e.detail; });
      const n = (v, d) => App.num(v, d);

      /* ----- helpers ----- */
      // small oscilloscope under a schematic: traces stacked in bands
      function scope(fig, traces, win) {
        win = win || 4;
        const p = new Viz.Plot(fig, { w: 600, h: 150, x: [0, win], y: [0, traces.length], xTicks: [], yTicks: [], margin: { l: 70, r: 10, t: 8, b: 10 } });
        traces.forEach((tr, i) => {
          const base = traces.length - 1 - i;
          p.hline('b' + i, base + 0.06, 'faint');
          const t = Viz.svgEl('text', { x: 64, y: p.sy(base + 0.45), class: 'pt ' + tr.cls, 'text-anchor': 'end' });
          t.textContent = tr.label; p.gTop.appendChild(t);
        });
        const hist = [];
        return {
          push(t, vals) {
            hist.push([t, vals]);
            while (hist.length && hist[0][0] < t - win) hist.shift();
            const t0 = t - win;
            traces.forEach((tr, i) => {
              const base = traces.length - 1 - i;
              p.line('t' + i, hist.map(h => [h[0] - t0, base + 0.08 + 0.8 * App.clamp(h[1][i], -0.1, 1.1)]), tr.cls);
            });
          }
        };
      }
      const status = (parent) => { const s = App.h('div', { class: 'status ok' }); parent.appendChild(s); return s; };
      const setStatus = (el, state, html) => { el.className = 'status ' + state; el.innerHTML = html; };
      const worst = arr => arr.includes('bad') ? 'bad' : arr.includes('warn') ? 'warn' : 'ok';

      /* ================= (a) PC fan ================= */
      const A = { duty: 0.6 };
      {
        const fig = root.querySelector('#exA-fig .lab-fig');
        const svg = Viz.schematic(fig, 600, 300, `
          ${Sch.vcc(420, 30, '+12 V')}${Sch.w([[420, 30], [420, 60]])}
          ${Sch.motor(420, 90, L('FAN', 'FAN'))}
          ${Sch.dot(420, 45)}${Sch.w([[420, 45], [500, 45], [500, 60]])}
          ${Sch.diode(500, 90, 180, 'SS14')}
          ${Sch.w([[420, 120], [420, 160]])}${Sch.dot(420, 140)}${Sch.w([[420, 140], [500, 140], [500, 120]])}
          ${Sch.nmos(400, 190, 'AO3400A')}
          ${Sch.w([[420, 220], [420, 250]])}${Sch.gnd(420, 250)}
          ${Sch.box(60, 150, 140, 80, 'ESP32', L('GPIO · 3,3 V', 'GPIO · 3.3 V'))}
          ${Sch.w([[200, 190], [270, 190]], 'sigw')}
          ${Sch.res(300, 190, 90, '100 Ω')}
          ${Sch.w([[330, 190], [370, 190]], 'sigw')}${Sch.dot(350, 190)}
          ${Sch.w([[350, 190], [350, 210]])}${Sch.res(350, 240, 0, '')}${Sch.gnd(350, 270)}
          ${Sch.text(338, 244, '10 kΩ', '', 'end')}
          ${Sch.text(235, 214, 'PWM 25 kHz', 'sig', 'middle')}
          <text id="exAst" x="130" y="268" class="sch-t big" text-anchor="middle"></text>
        `);
        const fMain = new Viz.Flow(svg, 'M420,30V250', { spacing: 14 });
        const fFw = new Viz.Flow(svg, 'M420,45V140H500V45Z', { spacing: 14 });
        const fG = new Viz.Flow(svg, 'M200,190H370', { cls: 'flow e', spacing: 12, speed: 120 });
        const rotor = svg.querySelector('.rotor');
        const st = svg.querySelector('#exAst');
        const sc = scope(fig, [
          { label: 'V_GS', cls: 'sig' }, { label: 'I_fan', cls: 'cu' }, { label: 'I_D1', cls: 'faint' }
        ]);
        let t = 0, il = 0, ang = 0, prevOn = false, edge = -9;
        App.onFrame(dt => {
          if (active !== 'a') { fMain.rate = fFw.rate = fG.rate = 0; return; }
          t += dt;
          const P = 1.6, on = (t % P) / P < A.duty;
          if (on !== prevOn) { edge = t; prevOn = on; }
          il += ((on ? 1 : 0) - il) * Math.min(1, dt / 0.5);
          const ig = Math.exp(-(t - edge) / 0.05) * (on ? 1 : -1);
          fMain.rate = on ? il * 1.3 : 0;
          fFw.rate = on ? 0 : il * 1.3;
          fG.rate = Math.abs(ig) > 0.05 ? Math.abs(ig) * 2 : 0; fG.dir = ig >= 0 ? 1 : -1;
          ang = (ang + dt * 400 * il) % 360;
          rotor.setAttribute('transform', `rotate(${ang.toFixed(1)} 420 90)`);
          st.textContent = on ? L('Q1 AÇIK', 'Q1 ON') : L('Q1 KAPALI → D1', 'Q1 OFF → D1');
          st.setAttribute('class', 'sch-t big ' + (on ? 'cu' : 'sig'));
          sc.push(t, [on ? 1 : 0, il, on ? 0 : il]);
        });
      }
      {
        const lab = root.querySelector('#exA-lab');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, {
          w: 600, h: 320, x: [1e3, 1e5], logX: true, y: [1e-4, 10], logY: true,
          xLabel: 'f_PWM (Hz)', yLabel: L('kayıp (W)', 'loss (W)'),
          xFmt: v => App.si(v, 'Hz', 2), yFmt: v => App.si(v, 'W', 1)
        });
        p.rect('aud', 1e3, 1e-4, 2e4, 10, 'warn');
        p.text('audT', 1.1e3, 5, L('duyulabilir', 'audible'), 'muted');
        const sF = UI.slider(ctl, { label: 'f<sub>PWM</sub>', min: 1e3, max: 1e5, step: 100, value: 25e3, log: true, unit: 'Hz', onInput: upd });
        const sR = UI.slider(ctl, { label: 'R<sub>G</sub>', min: 10, max: 4700, step: 1, value: 100, log: true, unit: 'Ω', onInput: upd });
        const sI = UI.slider(ctl, { label: L('Fan akımı', 'Fan current'), min: 0.1, max: 3, step: 0.05, value: 0.25, unit: 'A', onInput: upd });
        const sD = UI.slider(ctl, { label: 'Duty', min: 0.05, max: 1, step: 0.01, value: A.duty, fmt: v => n(v * 100, 0) + ' %', onInput: upd });
        const sV = UI.segmented(ctl, { label: L('Gate gerilimi', 'Gate voltage'), options: [{ value: 3.3, label: L('3,3 V', '3.3 V') }, { value: 5, label: '5 V' }], value: 3.3, onChange: upd });
        const ro = UI.readouts(ctl, [
          { key: 'r', label: 'R<sub>DS(on)</sub> ' + L('(sıcak)', '(hot)') }, { key: 'ts', label: 't<sub>r</sub> + t<sub>f</sub>' },
          { key: 'pc', label: 'P<sub>cond</sub>' }, { key: 'ps', label: 'P<sub>sw</sub>' }, { key: 'pg', label: L('Gate gücü (pinde)', 'Gate power (in pin)') },
          { key: 'ip', label: L('Pin tepe akımı', 'Pin peak current') }, { key: 'tj', label: 'T<sub>j</sub>' }, { key: 'bits', label: L('LEDC çözünürlük', 'LEDC resolution') }
        ]);
        const stEl = status(ctl);
        const rds = v => { // AO3400A max values, mΩ
          const pts = [[2.5, 48], [4.5, 32], [10, 26.5]];
          for (let i = 0; i < pts.length - 1; i++) if (v <= pts[i + 1][0]) return (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * (v - pts[i][0]) / (pts[i + 1][0] - pts[i][0])) * 1e-3;
          return 26.5e-3;
        };
        function calc(f, Rg, I, D, V) {
          const R = rds(V) * 1.4, Rt = Rg + 30, Vpl = 1.6 + 0.15 * I, Qgd = 2e-9;
          const ion = (V - Vpl) / Rt, ioff = Vpl / Rt;
          const tr = Qgd / ion, tf = Qgd / ioff;
          const Pc = I * I * R * D, Ps = 0.5 * 12 * I * (tr + tf) * f, Pg = 1.3e-9 * V * V * f;
          return { R, tr, tf, Pc, Ps, Pg, P: Pc + Ps, ip: V / Rt };
        }
        function upd() {
          const f = sF.value, Rg = sR.value, I = sI.value, D = sD.value, V = sV.value;
          A.duty = D;
          const c = calc(f, Rg, I, D, V);
          const xs = [];
          for (let i = 0; i <= 80; i++) xs.push(Math.pow(10, 3 + 2 * i / 80));
          p.line('cond', xs.map(x => [x, Math.max(1e-4, calc(x, Rg, I, D, V).Pc)]), 'ok dash');
          p.line('sw', xs.map(x => [x, Math.max(1e-4, calc(x, Rg, I, D, V).Ps)]), 'sig');
          p.line('tot', xs.map(x => [x, calc(x, Rg, I, D, V).P]), 'cu');
          p.dot('d', f, c.P);
          p.text('l1', 1.2e3, c.Pc * 1.4 > 1e-4 ? Math.min(c.Pc * 1.4, 6) : 1.4e-4, 'P_cond', 'ok');
          p.text('l2', 8e4, Math.max(1.4e-4, Math.min(6, calc(8e4, Rg, I, D, V).Ps * 0.45)), 'P_sw', 'sig', 'end');
          const tj = 25 + c.P * 125;
          const frac = (c.tr + c.tf) * f;
          ro.set('r', n(c.R * 1e3, 0) + ' mΩ');
          ro.set('ts', App.si(c.tr + c.tf, 's') + ' (' + n(frac * 100, 1) + ' %)', frac > 0.05 ? 'bad' : frac > 0.02 ? 'warn' : 'ok');
          ro.set('pc', App.si(c.Pc, 'W'));
          ro.set('ps', App.si(c.Ps, 'W'), c.Ps > 0.1 ? 'warn' : '');
          ro.set('pg', App.si(c.Pg, 'W'));
          ro.set('ip', App.si(c.ip, 'A'), c.ip > 0.04 ? 'bad' : c.ip > 0.025 ? 'warn' : 'ok');
          ro.set('tj', n(tj, 0) + ' °C', tj > 125 ? 'bad' : tj > 80 ? 'warn' : 'ok');
          ro.set('bits', Math.floor(Math.log2(80e6 / f)) + ' bit');
          const msgs = [], states = [];
          if (c.ip > 0.04) { msgs.push(L('R<sub>G</sub> çok küçük: pin tepe akımı 40 mA’i aşıyor.', 'R<sub>G</sub> too small: pin peak current exceeds 40 mA.')); states.push('bad'); }
          if (frac > 0.05) { msgs.push(L('Geçişler periyodun %5’inden uzun: MOSFET lineer bölgede ısınıyor. R<sub>G</sub>’yi küçült ya da sürücü kullan.', 'Transitions take over 5 % of the period: the MOSFET heats in its linear region. Lower R<sub>G</sub> or use a driver.')); states.push('bad'); }
          if (f < 2e4) { msgs.push(L('20 kHz altı: fan ve bobinler ıslık çalabilir.', 'Below 20 kHz: fan and windings may whine.')); states.push('warn'); }
          if (tj > 125) { msgs.push(L('T<sub>j</sub> çok yüksek: SOT-23 bu kaybı taşıyamaz.', 'T<sub>j</sub> too high: a SOT-23 cannot shed this loss.')); states.push('bad'); }
          if (I > 1.5) { msgs.push(L('Bu akımda daha büyük bir fan ya da DPAK MOSFET düşün.', 'At this current consider a bigger fan driver or a DPAK MOSFET.')); states.push('warn'); }
          setStatus(stEl, worst(states), msgs.length ? msgs.join(' ') : L('Tasarım rahat: toplam kayıp ', 'Design is comfortable: total loss ') + App.si(c.P, 'W') + '.');
        }
        upd();
      }

      /* ================= (b) relay ================= */
      const B = { diode: true };
      {
        const fig = root.querySelector('#exB-fig .lab-fig');
        const swHTML = c => Sch.sw(560, 90, 0, c, '');
        const svg = Viz.schematic(fig, 600, 285, `
          ${Sch.vcc(400, 30, '+5 V')}${Sch.w([[400, 30], [400, 60]])}
          ${Sch.ind(400, 90, 0, '')}${Sch.text(412, 66, 'K1', '', 'start')}
          <g id="exBd">${Sch.dot(400, 45)}${Sch.dot(400, 135)}${Sch.w([[400, 45], [330, 45], [330, 60]])}${Sch.diode(330, 90, 180, '')}${Sch.w([[400, 135], [330, 135], [330, 120]])}${Sch.text(318, 94, '1N4148', '', 'end')}</g>
          ${Sch.w([[400, 120], [400, 160]])}
          ${Sch.npn(380, 190, '2N3904')}
          ${Sch.w([[400, 220], [400, 250]])}${Sch.gnd(400, 250)}
          ${Sch.box(60, 150, 140, 80, 'MCU', L('GPIO · 3,3 V', 'GPIO · 3.3 V'))}
          ${Sch.w([[200, 190], [260, 190]], 'sigw')}${Sch.res(290, 190, 90, '680 Ω')}
          ${Sch.w([[320, 190], [350, 190]], 'sigw')}${Sch.dot(335, 190)}
          ${Sch.w([[335, 190], [335, 205]])}${Sch.res(335, 235, 0, '')}${Sch.gnd(335, 265)}${Sch.text(322, 239, '10 kΩ', '', 'end')}
          <path class="wire" d="M410,100H548" style="stroke-dasharray:4 4"/>
          ${Sch.vcc(560, 30, 'L')}${Sch.w([[560, 30], [560, 60]])}
          <g id="exBsw">${swHTML(false)}</g>
          ${Sch.w([[560, 120], [560, 150]])}${Sch.load(560, 180, 0, '')}${Sch.w([[560, 210], [560, 240]])}
          ${Sch.text(560, 256, 'N', 'muted', 'middle')}${Sch.text(548, 184, L('YÜK', 'LOAD'), 'muted', 'end')}
          <text id="exBsp" x="470" y="250" class="sch-t bad big" text-anchor="middle"></text>
          <text id="exBst" x="130" y="268" class="sch-t big" text-anchor="middle"></text>
        `);
        const fMain = new Viz.Flow(svg, 'M400,30V250', { spacing: 14 });
        const fFw = new Viz.Flow(svg, 'M400,45V135H330V45Z', { spacing: 14 });
        const fB = new Viz.Flow(svg, 'M200,190H350', { cls: 'flow e', spacing: 14, speed: 50 });
        const fAv = new Viz.Flow(svg, 'M400,135V250', { cls: 'flow bad', spacing: 9, speed: 160 });
        const fC = new Viz.Flow(svg, 'M560,30V240', { spacing: 14 });
        const swG = svg.querySelector('#exBsw'), dG = svg.querySelector('#exBd');
        const sp = svg.querySelector('#exBsp'), st = svg.querySelector('#exBst');
        const sc = scope(fig, [{ label: 'GPIO', cls: 'sig' }, { label: 'I_coil', cls: 'cu' }, { label: L('kontak', 'contact'), cls: 'ok' }]);
        let t = 0, il = 0, closed = false, prevOn = false, spike = 0;
        App.onFrame(dt => {
          if (active !== 'b') { fMain.rate = fFw.rate = fB.rate = fAv.rate = fC.rate = 0; return; }
          t += dt;
          const on = (t % 3.2) < 1.6;
          if (prevOn && !on && !B.diode && il > 0.05) spike = 0.35;
          prevOn = on;
          if (on) il += (1 - il) * Math.min(1, dt / 0.15);
          else if (B.diode) il += -il * Math.min(1, dt / 0.35);
          else il = Math.max(0, il - dt * 8);
          spike = Math.max(0, spike - dt);
          if (!closed && il > 0.7) closed = true;
          if (closed && il < 0.25) closed = false;
          if (swG.dataset.c !== String(closed)) { swG.innerHTML = swHTML(closed); swG.dataset.c = String(closed); }
          dG.style.opacity = B.diode ? 1 : 0.12;
          fMain.rate = on ? il * 1.2 : 0;
          fFw.rate = (!on && B.diode) ? il * 1.2 : 0;
          fAv.rate = spike > 0 ? 2.5 : 0;
          fB.rate = on ? 0.6 : 0;
          fC.rate = closed ? 1 : 0;
          sp.textContent = spike > 0 ? L('V_CE ≫ 40 V! çığ', 'V_CE ≫ 40 V! avalanche') : '';
          st.textContent = on ? 'GPIO = HIGH' : 'GPIO = LOW';
          st.setAttribute('class', 'sch-t big sig');
          sc.push(t, [on ? 1 : 0, il, closed ? 1 : 0]);
        });
      }
      {
        const lab = root.querySelector('#exB-lab');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const pV = new Viz.Plot(fig, { w: 600, h: 190, x: [0, 8], y: [0, 70], xLabel: L('kapanıştan sonra zaman (ms)', 'time after turn-off (ms)'), yLabel: 'V_CE (V)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
        const pI = new Viz.Plot(fig, { w: 600, h: 170, x: [0, 8], y: [0, 200], xLabel: '', yLabel: 'I_coil (mA)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
        const parts = { bc547: { name: 'BC547', icmax: 0.1 }, n3904: { name: '2N3904', icmax: 0.2 }, bc337: { name: 'BC337', icmax: 0.8 } };
        const sIc = UI.slider(ctl, { label: L('Bobin akımı', 'Coil current'), min: 0.02, max: 0.2, step: 0.005, value: 0.07, unit: 'A', onInput: upd });
        const sRb = UI.slider(ctl, { label: 'R<sub>B</sub>', min: 100, max: 10000, step: 10, value: 680, log: true, unit: 'Ω', onInput: upd });
        const sH = UI.slider(ctl, { label: 'h<sub>FE(min)</sub> ' + L('(bu akımda)', '(at this current)'), min: 20, max: 300, step: 5, value: 40, fmt: v => n(v, 0), onInput: upd });
        const sQ = UI.segmented(ctl, { label: L('Transistör', 'Transistor'), options: Object.keys(parts).map(k => ({ value: k, label: parts[k].name })), value: 'n3904', onChange: upd });
        const tD = UI.toggle(ctl, { label: L('Flyback diyotu (1N4148)', 'Flyback diode (1N4148)'), value: true, onChange: v => { B.diode = v; upd(); } });
        const ro = UI.readouts(ctl, [
          { key: 'ib', label: 'I<sub>B</sub> (= ' + L('pin akımı', 'pin current') + ')' }, { key: 'bf', label: L('Zorlanmış β', 'Forced β') },
          { key: 'ic', label: 'I<sub>C</sub> / I<sub>C(max)</sub>' }, { key: 'vc', label: L('Bobin gerilimi', 'Coil voltage') },
          { key: 'pq', label: 'P<sub>Q</sub>' }, { key: 'pk', label: 'V<sub>CE</sub> ' + L('tepe', 'peak') }
        ]);
        const stEl = status(ctl);
        void tD;
        function upd() {
          const Ic = sIc.value, Rb = sRb.value, h = sH.value, q = parts[sQ.value];
          const Rc = 5 / Ic, Ib = (3.2 - 0.85) / Rb, bf = Ic / Ib;
          const sat = bf <= h;
          const icReal = sat ? Ic : h * Ib;
          const vce = sat ? 0.05 + 1.5 * icReal : Math.max(0.2, 5 - icReal * Rc);
          const Pq = icReal * vce;
          const Lc = 0.1, tau = Lc / Rc * 1e3, Vbr = 60;
          // with diode: i(t) = (I0 + Vf/R)e^{-t/tau} - Vf/R ; Vce = 5 + Vf while i>0
          const Vf = 0.8, a = Vf / Rc, t0d = tau * Math.log((icReal + a) / a);
          const t0n = Lc * icReal / (Vbr - 5) * 1e3;
          const iD = t => Math.max(0, (icReal + a) * Math.exp(-t / tau) - a);
          const iN = t => Math.max(0, icReal * (1 - t / t0n));
          const ts = Viz.sample(x => x, 0, 8, 400).map(p => p[0]);
          pI.setRange({ y: [0, Math.max(50, Math.ceil(icReal * 1e3 / 50) * 50 + 20)] });
          pI.line('d', ts.map(x => [x, iD(x) * 1e3]), B.diode ? 'cu' : 'faint');
          pI.line('n', [[0, icReal * 1e3]].concat(ts.map(x => [x, iN(x) * 1e3])), B.diode ? 'faint' : 'bad');
          pV.line('d', [[0, 0.1], [0.001, 5 + Vf]].concat(ts.filter(x => x > 0.001).map(x => [x, iD(x) > 0 ? 5 + Vf : 5])), B.diode ? 'cu' : 'faint');
          pV.line('n', [[0, 0.1], [0.001, Vbr], [Math.max(t0n, 0.002), Vbr], [Math.max(t0n, 0.002) + 0.001, 5], [8, 5]], B.diode ? 'faint' : 'bad');
          pV.hline('vceo', 40, 'bad');
          pV.text('vceoT', 7.9, 40, 'V_CEO = 40 V', 'bad', 'end', 0, -5);
          pV.text('dT', 0.2, 5 + Vf, L('diyotla 5,8 V', 'with diode 5.8 V'), 'cu', 'start', 0, -6);
          pI.text('tauT', 7.9, icReal * 1e3 * 0.9, 'τ = L/R = ' + n(tau, 2) + ' ms', 'muted', 'end');
          ro.set('ib', App.si(Ib, 'A'), Ib > 0.02 ? 'bad' : Ib > 0.01 ? 'warn' : 'ok');
          ro.set('bf', n(bf, 1), bf <= h / 2 * 1.05 ? 'ok' : sat ? 'warn' : 'bad');
          ro.set('ic', App.si(icReal, 'A') + ' / ' + App.si(q.icmax, 'A'), icReal > q.icmax ? 'bad' : icReal > 0.8 * q.icmax ? 'warn' : 'ok');
          const vcoil = 5 - vce;
          ro.set('vc', n(vcoil, 2) + ' V', vcoil < 3.75 ? 'bad' : 'ok');
          ro.set('pq', App.si(Pq, 'W'), Pq > 0.4 ? 'bad' : Pq > 0.2 ? 'warn' : 'ok');
          ro.set('pk', B.diode ? n(5 + Vf, 1) + ' V' : '≈ ' + Vbr + ' V (' + L('çığ', 'avalanche') + ')', B.diode ? 'ok' : 'bad');
          const msgs = [], states = [];
          if (!sat) { msgs.push(L('Doyum yok: I<sub>B</sub> yetersiz, transistör aktif bölgede ısınıyor ve röle çekmeyebilir. R<sub>B</sub>’yi küçült.', 'No saturation: I<sub>B</sub> too small, the transistor heats in the active region and the relay may not pull in. Lower R<sub>B</sub>.')); states.push('bad'); }
          else if (bf > h / 2 * 1.05) { msgs.push(L('Doyum sınırda: soğukta ya da başka bir partide h<sub>FE</sub> düşükse doyumdan çıkar.', 'Saturation is marginal: a cold part or another batch with lower h<sub>FE</sub> will drop out of saturation.')); states.push('warn'); }
          if (Ib > 0.02) { msgs.push(L('Pin akımı 20 mA’i aşıyor: gereksiz yüksek.', 'Pin current above 20 mA: needlessly high.')); states.push('bad'); }
          if (icReal > q.icmax) { msgs.push(q.name + L(' için I<sub>C(max)</sub> aşıldı.', ': I<sub>C(max)</sub> exceeded.')); states.push('bad'); }
          if (!B.diode) { msgs.push(L('Diyotsuz: her kapanışta V<sub>CE</sub> çığ kırılmasına çıkar; transistör er geç ölür.', 'No diode: every turn-off drives V<sub>CE</sub> into avalanche; the transistor will die sooner or later.')); states.push('bad'); }
          setStatus(stEl, worst(states), msgs.length ? msgs.join(' ') : L('İyi: derin doyum, düşük pin akımı, kenetlenmiş flyback.', 'Good: deep saturation, low pin current, clamped flyback.'));
        }
        upd();
      }

      /* ================= (c) LED strip ================= */
      const C = { drive: 12, duty: 0.5 };
      {
        const fig = root.querySelector('#exC-fig .lab-fig');
        const svg = Viz.schematic(fig, 600, 290, `
          ${Sch.vcc(460, 30, '+12 V')}${Sch.w([[460, 30], [460, 70]])}${Sch.dot(460, 45)}
          ${Sch.led(460, 100, 0, '', 'exCled')}${Sch.text(486, 104, L('LED şerit 60 W', 'LED strip 60 W'), 'cu', 'start')}
          ${Sch.w([[460, 130], [460, 160]])}
          ${Sch.nmos(440, 190, 'IRLZ44N')}
          ${Sch.w([[460, 220], [460, 255]])}${Sch.gnd(460, 255)}
          ${Sch.w([[460, 45], [560, 45], [560, 110]])}${Sch.cap(560, 140, 0, '')}${Sch.w([[560, 170], [560, 255]])}${Sch.gnd(560, 255)}
          ${Sch.text(574, 200, '470µ', '', 'start')}
          ${Sch.box(40, 160, 110, 60, 'MCU', L('3,3 V', '3.3 V'))}
          <g id="exCdrv">
            ${Sch.w([[275, 160], [275, 45], [460, 45]])}${Sch.text(282, 70, 'VDD 12 V', 'muted', 'start')}
            ${Sch.box(230, 160, 90, 60, 'UCC27517', '')}
            ${Sch.w([[150, 190], [230, 190]], 'sigw')}${Sch.w([[320, 190], [340, 190]], 'sigw')}
          </g>
          <g id="exCdir" style="display:none">${Sch.w([[150, 190], [340, 190]], 'sigw')}</g>
          ${Sch.res(370, 190, 90, '')}<text id="exCrg" x="370" y="176" class="sch-t" text-anchor="middle">10 Ω</text>
          ${Sch.w([[400, 190], [410, 190]], 'sigw')}
          <text id="exCst" x="200" y="268" class="sch-t big" text-anchor="middle"></text>
        `);
        const fMain = new Viz.Flow(svg, 'M460,30V255', { spacing: 13 });
        const fG = new Viz.Flow(svg, 'M150,190H410', { cls: 'flow e', spacing: 12, speed: 130 });
        const glow = svg.querySelector('#exCled .led-glow');
        const drvG = svg.querySelector('#exCdrv'), dirG = svg.querySelector('#exCdir'), rgT = svg.querySelector('#exCrg'), st = svg.querySelector('#exCst');
        const sc = scope(fig, [{ label: 'V_GS', cls: 'sig' }, { label: 'I_LED', cls: 'cu' }]);
        let t = 0, vg = 0, prev = '';
        App.onFrame(dt => {
          if (active !== 'c') { fMain.rate = fG.rate = 0; return; }
          t += dt;
          const key = String(C.drive);
          if (key !== prev) {
            prev = key;
            drvG.style.display = C.drive === 3.3 ? 'none' : '';
            dirG.style.display = C.drive === 3.3 ? '' : 'none';
            rgT.textContent = C.drive === 3.3 ? '100 Ω' : '10 Ω';
          }
          const on = (t % 0.9) / 0.9 < C.duty;
          const Vd = C.drive, Vpl = 2.75, tauE = C.drive === 3.3 ? 0.06 : 0.008;
          // gate: RC charge with a Miller plateau (slope reduced around Vpl)
          const target = on ? Vd : 0;
          let dv = (target - vg) * Math.min(1, dt / tauE);
          if (Math.abs(vg - Vpl) < 0.25) dv *= (C.drive === 3.3 ? 0.12 : 0.3);
          vg += dv;
          const enh = App.clamp((vg - 2.2) / (Vd === 3.3 ? 1.1 : 1.2), 0, 1);
          const il = enh * (Vd === 3.3 ? 0.97 : 1);
          fMain.rate = il * 1.4;
          fG.rate = Math.abs(dv / dt) > 2 ? 1.5 : 0; fG.dir = dv >= 0 ? 1 : -1;
          glow.style.opacity = (il * 0.9).toFixed(2);
          st.textContent = C.drive === 3.3 ? L('GPIO doğrudan: yavaş gate!', 'Direct GPIO: slow gate!') : L('Sürücü: V_GS = ', 'Driver: V_GS = ') + C.drive + ' V';
          st.setAttribute('class', 'sch-t big ' + (C.drive === 3.3 ? 'bad' : 'ok'));
          sc.push(t, [vg / 12, il]);
        });
      }
      {
        const lab = root.querySelector('#exC-lab');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, { w: 600, h: 330, x: [0, 10], y: [20, 200], xLabel: L('LED akımı (A)', 'LED current (A)'), yLabel: 'T_j (°C)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
        p.rect('hot', 0, 150, 10, 200, 'bad');
        p.hline('l125', 125, 'warn');
        p.text('t175', 0.2, 192, L('T_j(max) 175 °C — tasarım sınırı 125 °C', 'T_j(max) 175 °C — design limit 125 °C'), 'bad');
        const pk = { bare: { r: 62, tr: L('TO-220, soğutucusuz (62 °C/W)', 'TO-220, no heatsink (62 °C/W)') }, clip: { r: 21, tr: L('TO-220 + klips soğutucu (~21 °C/W)', 'TO-220 + clip heatsink (~21 °C/W)') }, dpak: { r: 50, tr: L('DPAK, ~2,5 cm² bakır (~50 °C/W)', 'DPAK, ~2.5 cm² copper (~50 °C/W)') } };
        const sDrv = UI.segmented(ctl, { label: L('Gate sürme', 'Gate drive'), options: [{ value: 3.3, label: L('GPIO 3,3 V', 'GPIO 3.3 V') }, { value: 5, label: L('Sürücü 5 V', 'Driver 5 V') }, { value: 12, label: L('Sürücü 12 V', 'Driver 12 V') }], value: C.drive, onChange: v => { C.drive = v; upd(); } });
        const sPk = UI.segmented(ctl, { label: L('Kılıf / soğutma', 'Package / cooling'), options: [{ value: 'bare', label: 'TO-220' }, { value: 'clip', label: L('+ soğutucu', '+ heatsink') }, { value: 'dpak', label: 'DPAK' }], value: 'bare', onChange: upd });
        const sI = UI.slider(ctl, { label: L('Akım', 'Current'), min: 0.5, max: 10, step: 0.1, value: 5, unit: 'A', onInput: upd });
        const sD = UI.slider(ctl, { label: 'Duty', min: 0.05, max: 1, step: 0.01, value: 1, fmt: v => n(v * 100, 0) + ' %', onInput: v => { C.duty = Math.min(v, 0.95); upd(); } });
        const sT = UI.slider(ctl, { label: 'T<sub>a</sub>', min: 0, max: 70, step: 1, value: 40, fmt: v => n(v, 0) + ' °C', onInput: upd });
        const sF = UI.slider(ctl, { label: 'f<sub>PWM</sub>', min: 200, max: 50000, step: 100, value: 1000, log: true, unit: 'Hz', onInput: upd });
        const ro = UI.readouts(ctl, [
          { key: 'r', label: 'R<sub>DS(on)</sub> @ T<sub>j</sub>' }, { key: 'pc', label: 'P<sub>cond</sub>' }, { key: 'ps', label: 'P<sub>sw</sub>' },
          { key: 'tj', label: 'T<sub>j</sub>' }, { key: 'rth', label: 'R<sub>θ</sub>' }
        ]);
        const stEl = status(ctl);
        void sDrv;
        function solve(I, D, Ta, f, V, Rth) {
          const R25 = V === 3.3 ? 0.06 : V === 5 ? 0.025 : 0.022;
          const Rt = V === 3.3 ? 130 : 12, Vpl = 2.6 + 0.03 * I, Qgd = 15e-9;
          const ov = V - Vpl;
          const tr = ov > 0.05 ? Qgd * Rt / ov : 1e-3, tf = Qgd * Rt / Vpl;
          const Ps = Math.min(0.5 * 12 * I * (tr + tf) * f, 12 * I * 0.25);
          let T = Ta, Pc = 0, R = R25;
          for (let k = 0; k < 60; k++) {
            R = R25 * (1 + 0.006 * (T - 25)); Pc = I * I * R * D;
            const Tn = Ta + (Pc + Ps) * Rth;
            T = T + (Tn - T) * 0.6;
            if (T > 400) break;
          }
          return { T, R, Pc, Ps, lin: ov < 0.6 };
        }
        function upd() {
          const I = sI.value, D = sD.value, Ta = sT.value, f = sF.value, V = C.drive, Rth = pk[sPk.value].r;
          const c = solve(I, D, Ta, f, V, Rth);
          p.line('cur', Viz.sample(x => Math.min(220, solve(Math.max(x, 0.01), D, Ta, f, V, Rth).T), 0, 10, 100), 'cu');
          p.line('o1', Viz.sample(x => Math.min(220, solve(Math.max(x, 0.01), D, Ta, f, 12, Rth).T), 0, 10, 60), V === 12 ? 'faint' : 'ok dash thin');
          p.dot('d', I, Math.min(198, c.T), c.T > 150 ? 'bad' : '');
          p.text('lbl', 9.8, 30, pk[sPk.value].tr, 'muted', 'end');
          ro.set('r', n(c.R * 1e3, 1) + ' mΩ' + (V === 3.3 ? L(' (garanti yok!)', ' (not guaranteed!)') : ''), V === 3.3 ? 'bad' : '');
          ro.set('pc', App.si(c.Pc, 'W'));
          ro.set('ps', App.si(c.Ps, 'W'), c.Ps > 0.2 ? 'warn' : '');
          ro.set('tj', c.T > 300 ? L('kaçak!', 'runaway!') : n(c.T, 0) + ' °C', c.T > 150 ? 'bad' : c.T > 110 ? 'warn' : 'ok');
          ro.set('rth', Rth + ' °C/W');
          const msgs = [], states = [];
          if (V === 3.3) { msgs.push(L('3,3 V’ta R<sub>DS(on)</sub> datasheet’te yok; plato 3,3 V’a çok yakın, gate yavaş ve tam açılmıyor.', 'R<sub>DS(on)</sub> is not specified at 3.3 V; the plateau sits close to 3.3 V, so the gate is slow and never fully enhanced.')); states.push('bad'); }
          if (c.T > 150) { msgs.push(L('T<sub>j</sub> sınırın üstünde: soğutucu ekle, sürme gerilimini artır ya da akımı düşür.', 'T<sub>j</sub> above the limit: add a heatsink, raise the gate drive or lower the current.')); states.push('bad'); }
          else if (c.T > 110) { msgs.push(L('Sıcak: kılıf ~' + n(c.T - 5, 0) + ' °C. Ömür ve güvenlik için soğutucu öner.', 'Hot: case ~' + n(c.T - 5, 0) + ' °C. A heatsink is advisable for life and safety.')); states.push('warn'); }
          if (f > 5000 && V === 3.3) { msgs.push(L('Bu frekansta GPIO ile anahtarlama kaybı patlar.', 'At this frequency direct GPIO switching losses explode.')); states.push('bad'); }
          setStatus(stEl, worst(states), msgs.length ? msgs.join(' ') : L('Uygun: T<sub>j</sub> ≈ ', 'Fine: T<sub>j</sub> ≈ ') + n(c.T, 0) + ' °C.');
        }
        upd();
      }

      /* ================= (d) solenoid ================= */
      const Dd = { V: 24, I0: 1.5, Lh: 0.05, Vz: 18 };
      {
        const fig = root.querySelector('#exD-fig .lab-fig');
        const zHTML = z => z > 0 ? `${Sch.diode(500, 80, 0, '', 'zener')}${Sch.text(514, 84, 'Z1 ' + z + ' V', '', 'start')}` : `${Sch.w([[500, 50], [500, 110]])}${Sch.text(514, 84, L('(zener yok)', '(no zener)'), 'muted', 'start')}`;
        const svg = Viz.schematic(fig, 600, 300, `
          ${Sch.vcc(420, 30, '+24 V')}${Sch.w([[420, 30], [420, 70]])}${Sch.dot(420, 45)}
          ${Sch.ind(420, 100, 0, '')}${Sch.text(408, 104, L('L1 16 Ω', 'L1 16 Ω'), '', 'end')}
          <rect id="exDplg" class="plg" x="434" y="84" width="10" height="44" rx="2"/>
          ${Sch.w([[420, 45], [500, 45], [500, 50]])}
          <g id="exDz">${zHTML(18)}</g>
          ${Sch.diode(500, 140, 180, '')}${Sch.text(514, 144, 'D1', '', 'start')}
          ${Sch.w([[500, 170], [500, 180], [420, 180]])}${Sch.dot(420, 180)}
          ${Sch.w([[420, 130], [420, 190]])}
          ${Sch.nmos(400, 220, 'FQP30N06L')}
          ${Sch.w([[420, 250], [420, 270]])}${Sch.gnd(420, 270)}
          ${Sch.box(200, 190, 90, 60, 'UCC27517', 'VDD 12 V')}
          ${Sch.w([[290, 220], [305, 220]], 'sigw')}${Sch.res(335, 220, 90, '10 Ω')}${Sch.w([[365, 220], [370, 220]], 'sigw')}
          ${Sch.box(30, 190, 110, 60, 'MCU', L('3,3 V', '3.3 V'))}${Sch.w([[140, 220], [200, 220]], 'sigw')}
          <text id="exDv" x="200" y="120" class="sch-t big" text-anchor="middle"></text>
          <text id="exDs" x="200" y="140" class="sch-t" text-anchor="middle"></text>
        `);
        const fMain = new Viz.Flow(svg, 'M420,30V270', { spacing: 14 });
        const fCl = new Viz.Flow(svg, 'M420,45V180H500V45Z', { spacing: 14, speed: 90 });
        const fG = new Viz.Flow(svg, 'M140,220H370', { cls: 'flow e', spacing: 12, speed: 120 });
        const plg = svg.querySelector('#exDplg'), zG = svg.querySelector('#exDz');
        const vT = svg.querySelector('#exDv'), sT = svg.querySelector('#exDs');
        const sc = scope(fig, [{ label: 'V_GS', cls: 'sig' }, { label: 'I_coil', cls: 'cu' }, { label: 'V_DS', cls: 'bad' }]);
        let t = 0, i = 0, pulled = false, prevZ = 18, prevOn = false, edge = -9;
        App.onFrame(dt => {
          if (active !== 'd') { fMain.rate = fCl.rate = fG.rate = 0; return; }
          t += dt;
          if (Dd.Vz !== prevZ) { prevZ = Dd.Vz; zG.innerHTML = zHTML(Dd.Vz); }
          const on = (t % 3) < 1.5;
          if (on !== prevOn) { edge = t; prevOn = on; }
          const R = Dd.V / Dd.I0, Vc = Dd.Vz + 0.8;
          // real-time physics, 100× slowed: dtr in seconds of real time
          const dtr = dt / 100;
          for (let k = 0; k < 10; k++) {
            const h = dtr / 10;
            if (on) i += (Dd.V - i * R) / Dd.Lh * h;
            else if (i > 0) i = Math.max(0, i - (Vc + i * R) / Dd.Lh * h);
          }
          const rel = i / Dd.I0;
          if (!pulled && rel > 0.6) pulled = true;
          if (pulled && rel < 0.2) pulled = false;
          plg.style.transform = pulled ? 'translateY(-14px)' : 'translateY(0)';
          const vds = on ? i * 0.035 : (i > 0.001 ? Dd.V + Vc : Dd.V);
          const ig = Math.exp(-(t - edge) / 0.04) * (on ? 1 : -1);
          fMain.rate = on ? rel * 1.3 : 0;
          fCl.rate = !on && i > 0.001 ? rel * 1.6 : 0;
          fG.rate = Math.abs(ig) > 0.05 ? Math.abs(ig) * 2 : 0; fG.dir = ig >= 0 ? 1 : -1;
          vT.textContent = 'V_DS = ' + n(vds, 1) + ' V';
          vT.setAttribute('class', 'sch-t big ' + (vds > 0.8 * 60 ? 'bad' : vds > 30 ? 'cu' : ''));
          sT.textContent = pulled ? L('piston çekili', 'plunger pulled in') : L('piston serbest', 'plunger released');
          sc.push(t, [on ? 1 : 0, rel, vds / (Dd.V + Vc + 2)]);
        });
      }
      {
        const lab = root.querySelector('#exD-lab');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const pI = new Viz.Plot(fig, { w: 600, h: 190, x: [0, 12], y: [0, 3.2], xLabel: '', yLabel: 'I_coil (A)', xFmt: v => n(v, 0), yFmt: v => n(v, 1) });
        const pV = new Viz.Plot(fig, { w: 600, h: 200, x: [0, 12], y: [0, 110], xLabel: L('kapanıştan sonra zaman (ms)', 'time after turn-off (ms)'), yLabel: 'V_DS (V)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
        const sV = UI.slider(ctl, { label: L('Besleme', 'Supply'), min: 12, max: 48, step: 1, value: Dd.V, fmt: v => n(v, 0) + ' V', onInput: upd });
        const sI = UI.slider(ctl, { label: 'I<sub>0</sub>', min: 0.3, max: 3, step: 0.05, value: Dd.I0, unit: 'A', onInput: upd });
        const sL = UI.slider(ctl, { label: 'L', min: 0.01, max: 0.2, step: 0.001, value: Dd.Lh, log: true, unit: 'H', onInput: upd });
        const sZ = UI.slider(ctl, { label: 'V<sub>Z</sub> ' + L('(0 = yalnız diyot)', '(0 = diode only)'), min: 0, max: 36, step: 1, value: Dd.Vz, fmt: v => v === 0 ? L('yok', 'none') : n(v, 0) + ' V', onInput: upd });
        const sB = UI.segmented(ctl, { label: 'V<sub>DSS</sub>', options: [{ value: 40, label: '40 V' }, { value: 60, label: '60 V' }, { value: 100, label: '100 V' }], value: 60, onChange: upd });
        const ro = UI.readouts(ctl, [
          { key: 'tau', label: 'τ = L/R' }, { key: 'tr', label: L('Bırakma (%20)', 'Release (20 %)') }, { key: 't0', label: L('Akım sıfır', 'Current zero') },
          { key: 'vp', label: 'V<sub>DS</sub> ' + L('tepe', 'peak') }, { key: 'ec', label: L('Kenetleme enerjisi', 'Clamp energy') }, { key: 'el', label: '½LI²' }
        ]);
        const stEl = status(ctl);
        function curve(V, I0, Lh, Vc) {
          const R = V / I0, tau = Lh / R, a = Vc / R;
          const t0 = tau * Math.log((I0 + a) / a);
          return { R, tau, t0, tr: tau * Math.log((I0 + a) / (0.2 * I0 + a)), i: t => t >= t0 ? 0 : (I0 + a) * Math.exp(-t / tau) - a, E: Vc * (tau * I0 - a * t0) };
        }
        function upd() {
          const V = sV.value, I0 = sI.value, Lh = sL.value, Vz = sZ.value, Vdss = sB.value;
          Dd.V = V; Dd.I0 = I0; Dd.Lh = Lh; Dd.Vz = Vz;
          const Vc = Vz + 0.8, c = curve(V, I0, Lh, Vc), d = curve(V, I0, Lh, 0.8);
          const ms = 1e3;
          pI.line('d', Viz.sample(x => d.i(x / ms), 0, 12, 240), 'faint');
          pI.line('c', Viz.sample(x => c.i(x / ms), 0, 12, 240), 'cu');
          pI.hline('drop', 0.2 * I0, 'faint');
          pI.vline('tr', c.tr * ms, 'cu');
          pI.text('trT', Math.min(11.8, c.tr * ms), 3.0, L('bırakma ', 'release ') + n(c.tr * ms, 1) + ' ms', 'cu', c.tr * ms > 8 ? 'end' : 'start', 4);
          pI.text('dT', 11.8, Math.max(0.15, d.i(0.0115)) + 0.12, L('yalnız diyot', 'diode only'), 'muted', 'end');
          const vp = V + Vc, t0 = c.t0 * ms;
          pV.line('v', [[0, 0.5], [0.02, vp], [t0, vp], [t0 + 0.02, V], [12, V]], vp > Vdss ? 'bad' : 'cu');
          pV.hline('vdss', Vdss, 'bad');
          pV.text('vdssT', 11.8, Vdss, 'V_DSS = ' + Vdss + ' V', 'bad', 'end', 0, -5);
          pV.hline('m80', 0.8 * Vdss, 'warn');
          ro.set('tau', n(c.tau * ms, 2) + ' ms');
          ro.set('tr', n(c.tr * ms, 2) + ' ms', c.tr * ms < 2.5 ? 'ok' : c.tr * ms < 5 ? 'warn' : 'bad');
          ro.set('t0', n(c.t0 * ms, 2) + ' ms');
          ro.set('vp', n(vp, 1) + ' V (' + n(vp / Vdss * 100, 0) + ' %)', vp > Vdss ? 'bad' : vp > 0.8 * Vdss ? 'warn' : 'ok');
          ro.set('ec', App.si(c.E, 'J'));
          ro.set('el', App.si(0.5 * Lh * I0 * I0, 'J'));
          const msgs = [], states = [];
          if (vp > Vdss) { msgs.push(L('V<sub>DS</sub> tepe V<sub>DSS</sub>’i aşıyor: MOSFET her kapanışta çığa girer. Zener’i küçült ya da daha yüksek gerilimli MOSFET seç.', 'Peak V<sub>DS</sub> exceeds V<sub>DSS</sub>: the MOSFET avalanches at every turn-off. Lower the zener or pick a higher-voltage MOSFET.')); states.push('bad'); }
          else if (vp > 0.8 * Vdss) { msgs.push(L('Pay %20’nin altında: besleme dalgalanmalarına yer yok.', 'Margin below 20 %: no room for supply surges.')); states.push('warn'); }
          if (Vz === 0) { msgs.push(L('Yalnız diyot: güvenli ama yavaş bırakma.', 'Diode only: safe but slow release.')); states.push('warn'); }
          setStatus(stEl, worst(states), msgs.length ? msgs.join(' ') : L('İyi denge: hızlı bırakma ve yeterli V<sub>DS</sub> payı.', 'Good balance: fast release with enough V<sub>DS</sub> margin.'));
        }
        upd();
      }

      /* ================= (e) H-bridge motor ================= */
      const E = { duty: 0.65 };
      {
        const fig = root.querySelector('#exE-fig .lab-fig');
        const mir = (x, y) => `<g transform="translate(${2 * x + 40},0) scale(-1,1)">${Sch.nmos(x + 20, y, '')}</g>`;
        // mirrored N-MOS: drain/source at (x, y∓30), gate at (x+50, y)
        const svg = Viz.schematic(fig, 600, 320, `
          <rect x="148" y="62" width="96" height="198" rx="6" class="wire" style="stroke-dasharray:5 4;stroke:var(--line)"/>
          <rect x="336" y="62" width="96" height="198" rx="6" class="wire" style="stroke-dasharray:5 4;stroke:var(--line)"/>
          ${Sch.vcc(290, 36, '+12 V')}${Sch.w([[290, 36], [290, 50]])}${Sch.dot(290, 50)}
          ${Sch.w([[220, 70], [220, 50], [360, 50], [360, 70]])}
          ${Sch.nmos(200, 100, '')}${Sch.nmos(200, 220, '')}
          ${mir(360, 100)}${mir(360, 220)}
          ${Sch.w([[220, 130], [220, 190]])}${Sch.w([[360, 130], [360, 190]])}${Sch.dot(220, 160)}${Sch.dot(360, 160)}
          <g transform="rotate(90 290 160)">${Sch.motor(290, 160, ' ', 'exEm')}</g>
          ${Sch.w([[220, 160], [260, 160]])}${Sch.w([[320, 160], [360, 160]])}
          ${Sch.w([[220, 250], [220, 270], [360, 270], [360, 250]])}${Sch.dot(290, 270)}${Sch.gnd(290, 270)}
          ${Sch.w([[360, 50], [490, 50], [490, 70]])}${Sch.cap(490, 100, 0, '470 µF')}${Sch.w([[490, 130], [490, 270], [360, 270]])}
          ${Sch.text(196, 78, 'HS-A', 'muted', 'end')}${Sch.text(196, 256, 'LS-A', 'muted', 'end')}${Sch.text(384, 78, 'HS-B', 'muted', 'start')}${Sch.text(384, 256, 'LS-B', 'muted', 'start')}
          ${Sch.text(290, 134, 'M', 'big', 'middle')}
          ${Sch.box(10, 130, 100, 70, 'ESP32', '')}
          ${Sch.w([[110, 150], [148, 150]], 'sigw')}${Sch.w([[110, 180], [148, 180]], 'sigw')}
          ${Sch.text(129, 144, 'PWM', 'sig', 'middle')}${Sch.text(129, 194, 'INA/B', 'sig', 'middle')}
          ${Sch.w([[148, 240], [60, 240], [60, 200]], 'sigw')}${Sch.text(104, 234, 'CS → ADC', 'sig', 'middle')}
          ${Sch.text(290, 300, 'VNH5019A-E', 'muted', 'middle')}
          <text id="exEdir" x="290" y="200" class="sch-t big" text-anchor="middle"></text>
        `);
        const fF = new Viz.Flow(svg, 'M290,36V50H220V160H360V270H290', { spacing: 14 });
        const fR = new Viz.Flow(svg, 'M290,36V50H360V160H220V270H290', { spacing: 14 });
        const rF = new Viz.Flow(svg, 'M220,160H360V270H220Z', { spacing: 14 });
        const rR = new Viz.Flow(svg, 'M360,160H220V270H360Z', { spacing: 14 });
        const rotor = svg.querySelector('#exEm .rotor');
        const dirT = svg.querySelector('#exEdir');
        const sc = scope(fig, [{ label: 'PWM', cls: 'sig' }, { label: 'I_motor', cls: 'cu' }]);
        let t = 0, i = 0, ang = 0, spd = 0;
        App.onFrame(dt => {
          if (active !== 'e') { fF.rate = fR.rate = rF.rate = rR.rate = 0; return; }
          t += dt;
          const dir = (t % 7) < 3.5 ? 1 : -1;
          const on = (t % 0.6) / 0.6 < E.duty;
          const tgt = dir * (on ? 1 : 0);
          i += ((on ? dir : 0) - i) * Math.min(1, dt / (on ? 0.25 : 0.5));
          void tgt;
          spd += (dir * E.duty - spd) * Math.min(1, dt / 0.6);
          ang = (ang + spd * dt * 500) % 360;
          rotor.setAttribute('transform', `rotate(${ang.toFixed(1)} 290 160)`);
          const a = Math.abs(i) * 1.3;
          fF.rate = on && i > 0 ? a : 0;
          fR.rate = on && i < 0 ? a : 0;
          rF.rate = !on && i > 0 ? a : 0;
          rR.rate = !on && i < 0 ? a : 0;
          dirT.textContent = dir > 0 ? L('İLERİ →', 'FORWARD →') : L('← GERİ', '← REVERSE');
          dirT.setAttribute('class', 'sch-t big cu');
          sc.push(t, [on ? 1 : 0, 0.5 + i * 0.5]);
        });
      }
      {
        const lab = root.querySelector('#exE-lab');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, { w: 600, h: 320, x: [0, 1.5], y: [0, 12], xLabel: L('kalkıştan sonra zaman (s)', 'time after start (s)'), yLabel: 'I_motor (A)', xFmt: v => n(v, 1), yFmt: v => n(v, 0) });
        const sF = UI.slider(ctl, { label: 'f<sub>PWM</sub>', min: 1000, max: 40000, step: 100, value: 20000, log: true, unit: 'Hz', onInput: upd });
        const sD = UI.slider(ctl, { label: L('Hedef duty', 'Target duty'), min: 0.2, max: 1, step: 0.01, value: 0.8, fmt: v => n(v * 100, 0) + ' %', onInput: upd });
        const sL = UI.slider(ctl, { label: 'L<sub>m</sub>', min: 1e-4, max: 2e-3, step: 1e-5, value: 5e-4, log: true, unit: 'H', onInput: upd });
        const sR = UI.slider(ctl, { label: L('Rampa süresi', 'Ramp time'), min: 0, max: 1, step: 0.01, value: 0.3, fmt: v => v === 0 ? L('yok', 'none') : n(v * 1000, 0) + ' ms', onInput: upd });
        const sIl = UI.slider(ctl, { label: L('Akım sınırı', 'Current limit'), min: 2, max: 12, step: 0.5, value: 12, unit: 'A', onInput: upd });
        const ro = UI.readouts(ctl, [
          { key: 'rip', label: 'ΔI<sub>pp</sub>' }, { key: 'aud', label: L('Duyulur mu?', 'Audible?') }, { key: 'pk', label: L('Kalkış tepe akımı', 'Start-up peak') },
          { key: 'cs', label: L('CS gerilimi (tepe)', 'CS voltage (peak)') }, { key: 'pr', label: L('Köprü kaybı (2 A, iletim + anahtarlama)', 'Bridge loss (2 A, conduction + switching)') }, { key: 'ts', label: L('Hıza ulaşma', 'Time to speed') }
        ]);
        const stEl = status(ctl);
        function sim(D, ramp, Ilim) {
          const R = 1.2, V = 12, tm = 0.15, IL = 2, h = 0.001;
          let e = 0, pk = 0, tReach = null; const pts = [];
          const eTarget = D * V - IL * R;
          for (let k = 0; k <= 1500; k++) {
            const tt = k * h;
            const d = ramp > 0 ? D * Math.min(1, tt / ramp) : D;
            let i = (d * V - e) / R;
            if (i > Ilim) i = Ilim;
            if (i < 0) i = 0;
            pk = Math.max(pk, i);
            e = Math.max(0, e + (i - IL) * R / tm * h);
            if (tReach === null && e >= 0.9 * eTarget) tReach = tt;
            if (k % 5 === 0) pts.push([tt, i]);
          }
          return { pts, pk, tReach };
        }
        function upd() {
          const f = sF.value, D = sD.value, Lm = sL.value, ramp = sR.value, Ilim = sIl.value;
          const base = sim(D, 0, 99), cur = sim(D, ramp, Ilim);
          p.line('b', base.pts, 'faint');
          p.line('c', cur.pts, 'cu');
          p.hline('lim', Math.min(Ilim, 11.9), 'bad');
          p.text('limT', 1.48, Math.min(Ilim, 11.9), L('akım sınırı', 'current limit'), 'bad', 'end', 0, -5);
          p.hline('run', 2, 'faint');
          p.text('runT', 1.48, 2, L('çalışma 2 A', 'running 2 A'), 'muted', 'end', 0, -5);
          const rip = 12 * D * (1 - D) / (Lm * f);
          ro.set('rip', n(rip, 2) + ' A', rip > 1.5 ? 'bad' : rip > 0.6 ? 'warn' : 'ok');
          const aud = f < 18000;
          ro.set('aud', aud ? L('evet', 'yes') : L('hayır', 'no'), aud ? 'warn' : 'ok');
          ro.set('pk', n(cur.pk, 1) + ' A', cur.pk > 8 ? 'bad' : cur.pk > 5 ? 'warn' : 'ok');
          ro.set('cs', n(cur.pk * 0.14, 2) + ' V');
          ro.set('pr', App.si(2 * 2 * 0.036 * 1.3 + 0.5 * 12 * 2 * 1.5e-6 * f, 'W'));
          ro.set('ts', cur.tReach == null ? '—' : n(cur.tReach * 1000, 0) + ' ms');
          const msgs = [], states = [];
          if (f > 20000) { msgs.push(L('VNH5019 en fazla 20 kHz’i destekler.', 'The VNH5019 supports at most 20 kHz.')); states.push('bad'); }
          if (aud) { msgs.push(L('Duyulabilir frekans: motor ıslık çalar.', 'Audible frequency: the motor will whine.')); states.push('warn'); }
          if (rip > 1.5) { msgs.push(L('Dalgalanma büyük: ekstra I²R kaybı ve tork dalgalanması.', 'Large ripple: extra I²R loss and torque ripple.')); states.push('warn'); }
          if (cur.pk > 8) { msgs.push(L('Kalkış akımı stall’a yakın: besleme çöker, sigorta zorlanır. Rampa ya da akım sınırı ekle.', 'Start-up current near stall: supply sags, fuse is stressed. Add a ramp or a current limit.')); states.push('bad'); }
          if (cur.tReach == null) { msgs.push(L('Motor hedef hıza ulaşamıyor: akım sınırı yük torkuna çok yakın.', 'Motor never reaches speed: the current limit is too close to the load torque.')); states.push('bad'); }
          setStatus(stEl, worst(states), msgs.length ? msgs.join(' ') : L('İyi: sessiz, düşük dalgalanma, yumuşak kalkış.', 'Good: silent, low ripple, gentle start.'));
        }
        upd();
      }

      /* ================= (f) high-side P-MOS rail ================= */
      const F = { tRamp: 4.7e-3 };
      {
        const fig = root.querySelector('#exF-fig .lab-fig');
        const svg = Viz.schematic(fig, 600, 300, `
          ${Sch.vcc(400, 30, '+12 V')}${Sch.w([[400, 30], [400, 70]])}${Sch.dot(400, 40)}${Sch.w([[280, 40], [400, 40]])}
          ${Sch.res(280, 70, 0, '')}${Sch.text(266, 74, 'R1 10 kΩ', '', 'end')}
          ${Sch.w([[280, 100], [350, 100]])}${Sch.dot(280, 100)}${Sch.dot(320, 100)}
          ${Sch.pmos(380, 100, 'AO3401A')}
          ${Sch.cap(320, 130, 0, '')}${Sch.text(360, 178, 'C_GD 330 nF', 'sig', 'middle')}
          ${Sch.w([[320, 160], [400, 160]])}
          ${Sch.res(280, 130, 0, '')}${Sch.text(266, 134, 'R2 10 kΩ', '', 'end')}
          ${Sch.w([[280, 160], [280, 190]])}
          ${Sch.npn(260, 220, '')}${Sch.text(250, 256, 'Q2', '', 'end')}
          ${Sch.w([[280, 250], [280, 262]])}${Sch.gnd(280, 262)}
          ${Sch.res(190, 220, 90, '10 kΩ')}${Sch.w([[220, 220], [230, 220]], 'sigw')}
          ${Sch.box(20, 190, 110, 60, 'MCU', 'GPIO')}${Sch.w([[130, 220], [160, 220]], 'sigw')}
          ${Sch.w([[400, 130], [400, 180]])}${Sch.dot(400, 160)}${Sch.w([[400, 160], [480, 160], [480, 180]])}
          ${Sch.load(400, 210, 0, '')}${Sch.text(384, 214, L('Sensör', 'Sensor'), '', 'end')}${Sch.gnd(400, 240)}
          ${Sch.cap(480, 210, 0, '100 µF')}${Sch.gnd(480, 240)}
          <text id="exFv" x="500" y="284" class="sch-t big" text-anchor="middle"></text>
          <text id="exFg" x="75" y="284" class="sch-t sig" text-anchor="middle"></text>
        `);
        const fL = new Viz.Flow(svg, 'M400,30V240', { spacing: 14 });
        const fC = new Viz.Flow(svg, 'M400,160H480V240', { spacing: 10, speed: 90 });
        const fN = new Viz.Flow(svg, 'M280,40V250', { cls: 'flow e', spacing: 16, speed: 40 });
        const fB = new Viz.Flow(svg, 'M130,220H230', { cls: 'flow e', spacing: 14, speed: 40 });
        const vT = svg.querySelector('#exFv'), gT = svg.querySelector('#exFg');
        const sc = scope(fig, [{ label: 'GPIO', cls: 'sig' }, { label: 'V_OUT', cls: 'cu' }, { label: 'I_inrush', cls: 'bad' }]);
        let t = 0, v = 0;
        App.onFrame(dt => {
          if (active !== 'f') { fL.rate = fC.rate = fN.rate = fB.rate = 0; return; }
          t += dt;
          const on = (t % 6) < 3.5;
          const visRamp = App.clamp(F.tRamp / 4.7e-3 * 0.9, 0.04, 3);
          const v0 = v;
          if (on) v = Math.min(1, v + dt / visRamp);
          else v = Math.max(0, v - dt / 0.8);
          const dv = (v - v0) / Math.max(dt, 1e-3);
          const inr = on ? App.clamp(dv * visRamp, 0, 1) : 0;
          fL.rate = on ? Math.max(v, 0.15) * 1.1 : (v > 0.01 ? v * 0.5 : 0);
          fC.rate = inr > 0.01 ? 0.6 + inr * 1.6 : 0;
          fN.rate = on ? 0.5 : 0; fB.rate = on ? 0.5 : 0;
          vT.textContent = 'V_OUT = ' + n(v * 12, 1) + ' V';
          vT.setAttribute('class', 'sch-t big cu');
          gT.textContent = on ? 'GPIO = HIGH' : 'GPIO = LOW';
          sc.push(t, [on ? 1 : 0, v, inr]);
        });
      }
      {
        const lab = root.querySelector('#exF-lab');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const pv = new Viz.Plot(fig, { w: 600, h: 180, x: [0, 10], y: [0, 13], xLabel: '', yLabel: 'V_OUT (V)', xFmt: v => n(v, 1), yFmt: v => n(v, 0) });
        const pi = new Viz.Plot(fig, { w: 600, h: 200, x: [0, 10], y: [0.01, 200], logY: true, xLabel: L('zaman (ms)', 'time (ms)'), yLabel: 'I_in (A)', xFmt: v => n(v, 1), yFmt: v => App.si(v, '', 2) });
        const sC = UI.slider(ctl, { label: 'C<sub>load</sub>', min: 1e-5, max: 2.2e-3, step: 1e-6, value: 1e-4, log: true, unit: 'F', onInput: upd });
        const sG = UI.slider(ctl, { label: 'C<sub>GD</sub> ' + L('(0 = yok)', '(0 = none)'), min: 0, max: 1e-6, step: 1e-8, value: 3.3e-7, fmt: v => v < 1e-9 ? L('yok', 'none') : App.si(v, 'F'), onInput: upd });
        const sR1 = UI.slider(ctl, { label: 'R1 (G–S)', min: 2200, max: 47000, step: 100, value: 10000, log: true, unit: 'Ω', onInput: upd });
        const sR2 = UI.slider(ctl, { label: 'R2 (G–NPN)', min: 0, max: 47000, step: 100, value: 10000, fmt: v => v < 50 ? '0 Ω' : App.si(v, 'Ω'), onInput: upd });
        const sV = UI.segmented(ctl, { label: L('Hat gerilimi', 'Rail voltage'), options: [{ value: 12, label: '12 V' }, { value: 24, label: '24 V' }], value: 12, onChange: upd });
        const sI = UI.slider(ctl, { label: L('Yük akımı', 'Load current'), min: 0.05, max: 2, step: 0.05, value: 0.3, unit: 'A', onInput: upd });
        const ro = UI.readouts(ctl, [
          { key: 'vgs', label: 'V<sub>GS(on)</sub>' }, { key: 'ig', label: L('Plato gate akımı', 'Plateau gate current') }, { key: 'tr', label: L('Rampa süresi', 'Ramp time') },
          { key: 'pk', label: L('Inrush tepe', 'Inrush peak') }, { key: 'e', label: L('FET enerjisi', 'FET energy') }
        ]);
        const stEl = status(ctl);
        function upd() {
          const Cl = sC.value, Cg = sG.value, R1 = sR1.value, R2 = Math.max(sR2.value, 1), V = sV.value, Il = sI.value;
          const vgs = -(V - 0.1) * R1 / (R1 + R2);
          const Vpl = 1.8;
          const Ig = (V - Vpl) / R2 - Vpl / R1;
          const Ceff = Cg + 70e-12;
          const on = Ig > 0 && Math.abs(vgs) > Vpl + 0.3;
          let tr = on ? V * Ceff / Ig : Infinity;
          const Rlim = 0.15;
          // hard switch: limited by R; soft: C·dV/dt
          const iSoft = on ? Cl * V / tr + Il : 0;
          const iHard = V / Rlim;
          const pkI = Cg < 1e-9 ? iHard : Math.min(iSoft, iHard);
          const E = 0.5 * Cl * V * V + (isFinite(tr) ? V * Il * tr / 6 : 0);
          F.tRamp = Cg < 1e-9 ? 2e-5 : (isFinite(tr) ? tr : 1);
          const ms = 1e3, trm = Math.min(tr * ms, 1e4);
          const xmax = isFinite(tr) ? Math.max(1, Math.min(60, trm * 2.2)) : 10;
          pv.setRange({ x: [0, xmax], y: [0, V + 1] }); pi.setRange({ x: [0, xmax] });
          if (Cg < 1e-9) {
            const tau = Rlim * Cl * ms;
            pv.line('v', Viz.sample(x => V * (1 - Math.exp(-x / tau)), 0, xmax, 300), 'cu');
            pi.line('i', Viz.sample(x => Math.max(0.011, iHard * Math.exp(-x / tau) + Il), 0, xmax, 300), 'bad');
          } else if (on) {
            pv.line('v', Viz.sample(x => Math.min(V, V * x / trm), 0, xmax, 300), 'cu');
            pi.line('i', Viz.sample(x => x < trm ? Math.max(0.011, Cl * V / tr + Il * x / trm) : Il, 0, xmax, 300), 'bad');
          } else {
            pv.line('v', [[0, 0], [xmax, 0]], 'bad'); pi.line('i', [[0, 0.011], [xmax, 0.011]], 'faint');
          }
          pi.hline('sup', 2, 'warn');
          pi.text('supT', xmax * 0.98, 2, L('tipik adaptör sınırı ~2 A', 'typical adapter limit ~2 A'), 'warn', 'end', 0, -5);
          ro.set('vgs', n(vgs, 2) + ' V', Math.abs(vgs) > 12 ? 'bad' : Math.abs(vgs) < 4.5 ? 'warn' : 'ok');
          ro.set('ig', App.si(Math.max(Ig, 0), 'A'), Ig > 0 ? '' : 'bad');
          ro.set('tr', !on ? '∞' : App.si(tr, 's'), on ? (tr > 0.05 ? 'warn' : '') : 'bad');
          ro.set('pk', App.si(pkI, 'A'), pkI > 5 ? 'bad' : pkI > 2 ? 'warn' : 'ok');
          ro.set('e', App.si(E, 'J'), E > 0.05 ? 'warn' : '');
          const msgs = [], states = [];
          if (Math.abs(vgs) > 12) { msgs.push(L('|V<sub>GS</sub>| &gt; 12 V: AO3401A’nın gate oksidi delinir. R2’yi büyüt.', '|V<sub>GS</sub>| &gt; 12 V: the AO3401A gate oxide breaks down. Increase R2.')); states.push('bad'); }
          if (!on) { msgs.push(L('Gate platoya inemiyor: bölücü çok zayıf, P-MOS açılmaz.', 'The gate cannot reach the plateau: the divider is too weak, the P-MOS never turns on.')); states.push('bad'); }
          else if (Math.abs(vgs) < 4.5) { msgs.push(L('V<sub>GS</sub> düşük: R<sub>DS(on)</sub> belirtilen değerin üstünde.', 'Low V<sub>GS</sub>: R<sub>DS(on)</sub> above the specified value.')); states.push('warn'); }
          if (pkI > 5) { msgs.push(L('Büyük inrush: 12 V hattı çöker, aynı hattaki MCU resetlenebilir. C<sub>GD</sub> ekle/büyüt.', 'Large inrush: the 12 V rail collapses and an MCU on the same rail may reset. Add/increase C<sub>GD</sub>.')); states.push('bad'); }
          else if (pkI > 2) { msgs.push(L('Inrush adaptör sınırına yakın.', 'Inrush close to the adapter limit.')); states.push('warn'); }
          if (on && tr > 0.05) { msgs.push(L('Rampa çok yavaş: MOSFET uzun süre lineer bölgede; SOA’yı kontrol et.', 'Ramp very slow: the MOSFET spends long in its linear region; check the SOA.')); states.push('warn'); }
          setStatus(stEl, worst(states), msgs.length ? msgs.join(' ') : L('İyi: kontrollü rampa, küçük inrush, V<sub>GS</sub> sınır içinde.', 'Good: controlled ramp, small inrush, V<sub>GS</sub> within limits.'));
        }
        upd();
      }
    }
  });
})();
