/* 04b — Output types: push-pull, open-drain, open-collector, open-emitter; wired-AND, I²C pull-ups,
   level shifting, open-collector parts (LM393, PC817, Hall, ULN2803), industrial 24 V PNP/NPN, automotive 12 V */
App.page({
  id: 'outputs',
  num: '04b',
  group: { tr: 'Temeller', en: 'Fundamentals' },
  title: { tr: 'Çıkış tipleri: push-pull, open-drain, open-collector, open-emitter', en: 'Output types: push-pull, open-drain, open-collector, open-emitter' },
  blurb: { tr: 'Sinking/sourcing, pull-up seçimi, I²C, wired-AND, 24 V PNP/NPN sensörler, otomotiv 12 V.', en: 'Sinking/sourcing, choosing pull-ups, I²C, wired-AND, 24 V PNP/NPN sensors, automotive 12 V.' },
  summary: {
    tr: 'Normal bir çıkışta iki transistör vardır: biri yukarı, biri aşağı çeker. “Açık” (open) çıkışta yalnızca biri bulunur; eksik yarıyı bir direnç ya da yükün kendisi tamamlar. Seviye çevirme, I²C, ortak hatlar ve 24 V sensörler bu farka dayanır.',
    en: 'A normal output has two transistors: one pulls up, one pulls down. An “open” output has only one of them; a resistor or the load itself completes the missing half. Level shifting, I²C, shared lines and 24 V sensors all rely on that difference.'
  },
  render(L) {
    return `
      ${App.keys([
        L('Push-pull hem verir hem çeker; iki push-pull çıkışı asla birbirine bağlama.', 'Push-pull sources and sinks; never tie two push-pull outputs together.'),
        L('Open-drain/collector yalnızca çeker; HIGH seviyesini pull-up belirler.', 'Open-drain/collector only sinks; the pull-up sets the HIGH level.'),
        L('I²C pull-up’ını R<sub>min</sub> (akım) ile R<sub>max</sub> (yükselme süresi) arasından seç.', 'Pick I²C pull-ups between R<sub>min</sub> (current) and R<sub>max</sub> (rise time).'),
        L('5 V üstü için pini değil, harici bir transistörü pull-up yap.', 'Above 5 V, pull up an external transistor, never the pin itself.'),
        L('24 V sanayide PNP (sourcing) tercih edilir: ezilen kablo girişi OFF yapar.', 'In 24 V industry prefer PNP (sourcing): a crushed wire reads OFF.')
      ])}
      <style>
        [data-page="outputs"] .schem .frame { fill: none; stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 5 4; }
        [data-page="outputs"] .schem .pinsq { fill: var(--surface); stroke: var(--ink); stroke-width: 1.5; }
        [data-page="outputs"] .schem .shortw { stroke: var(--bad); stroke-width: 2.4; stroke-dasharray: 5 3; }
        [data-page="outputs"] .schem .ind { fill: var(--panel-2); stroke: var(--line); stroke-width: 1.5; transition: fill .15s; }
        [data-page="outputs"] .schem .ind.on { fill: var(--ok); }
        [data-page="outputs"] .schem .ind.bad { fill: var(--bad); }
        [data-page="outputs"] .schem .tgt { fill: var(--muted); stroke: var(--ink-2); stroke-width: 1; }
        [data-page="outputs"] .schem .wire.rail0 { stroke: var(--ink); }
      </style>

      <h2>${L('“Açık” ne demek?', 'What does “open” mean?')}</h2>
      <p>${L('Bir CMOS çıkışında üst üste iki MOSFET vardır. Üstteki P-MOS çıkışı V<sub>DD</sub>’ye, alttaki N-MOS GND’ye bağlar. Bu yapıya <b>push-pull</b> (BJT’li eski adıyla <b>totem-pole</b>) denir.',
             'A CMOS output has two stacked MOSFETs. The upper P-MOS connects the pin to V<sub>DD</sub>, the lower N-MOS connects it to GND. This is a <b>push-pull</b> output (the older BJT name is <b>totem-pole</b>).')}</p>
      <p>${L('Üst transistörü çıkarırsan çıkış yalnızca aşağı çekebilir. 1 yazınca pin hiçbir yere bağlı değildir (Hi-Z). Seviyeyi bir <b>pull-up</b> direnci belirler.',
             'Remove the upper transistor and the output can only pull down. Writing a 1 leaves the pin connected to nothing (Hi-Z). A <b>pull-up</b> resistor sets the level.')}</p>
      <div class="cards">
        <div class="card"><h4>Push-pull</h4><p>${L('İki transistör. Hem verir hem çeker, iki yönde de hızlı. Dış direnç gerekmez. İki çıkışı birbirine bağlamak <b>yasaktır</b>.', 'Two transistors. Sources and sinks, fast both ways. No external resistor. Two outputs must <b>never</b> be tied together.')}</p></div>
        <div class="card"><h4>Open-drain</h4><p>${L('Yalnızca alttaki N-MOS. Akım <b>çeker</b> (sinking). Pull-up gerekir. I²C, kesme ve reset hatları.', 'Only the low N-MOS. <b>Sinks</b> current. Needs a pull-up. I²C, interrupt and reset lines.')}</p></div>
        <div class="card"><h4>Open-collector</h4><p>${L('Aynı fikir, NPN ile: collector dışarıda. Akım çeker. LM393, optokuplör, Hall sensör, ULN2803.', 'Same idea with an NPN: the collector is the pin. Sinks current. LM393, optocouplers, Hall sensors, ULN2803.')}</p></div>
        <div class="card"><h4>Open-emitter</h4><p>${L('Yalnızca üstteki NPN. Akım <b>verir</b> (sourcing). Pull-down ya da topraklı yük gerekir. V<sub>BE</sub> kadar gerilim kaybeder.', 'Only the upper NPN. <b>Sources</b> current. Needs a pull-down or a grounded load. Loses one V<sub>BE</sub>.')}</p></div>
        <div class="card"><h4>Open-source <span class="pill">${L('nadir', 'rare')}</span></h4><p>${L('Üstte yalnızca bir MOSFET. Lojik çıkış olarak nadirdir; güçteki karşılığı high-side anahtardır.', 'Only an upper MOSFET. Rare as a logic output; its power-side cousin is the high-side switch.')}</p></div>
      </div>

      ${App.lab('lab-types', L('Dört çıkış tipi: hangi transistör var, akım nereye akıyor?', 'Four output types: which transistor exists, where does the current go?'), {
        foot: L('Model: push-pull R<sub>on</sub> = 30 Ω (P) / 20 Ω (N), open-drain R<sub>on</sub> = 25 Ω. Open-collector NPN: V<sub>CE</sub> ≈ 0,05 V + I·4 Ω, en fazla ~100 mA. Open-emitter: base V<sub>S</sub>’de, V<sub>BE</sub> ≈ 0,65 V @ 1 mA. Geçerli seviye: V<sub>OL</sub> ≤ 0,3·V<sub>S</sub>, V<sub>OH</sub> ≥ 0,7·V<sub>S</sub>. Bakır noktalar yük akımıdır.',
                'Model: push-pull R<sub>on</sub> = 30 Ω (P) / 20 Ω (N), open-drain R<sub>on</sub> = 25 Ω. Open-collector NPN: V<sub>CE</sub> ≈ 0.05 V + I·4 Ω, at most ~100 mA. Open-emitter: base at V<sub>S</sub>, V<sub>BE</sub> ≈ 0.65 V @ 1 mA. Valid levels: V<sub>OL</sub> ≤ 0.3·V<sub>S</sub>, V<sub>OH</sub> ≥ 0.7·V<sub>S</sub>. Copper dots are load current.')
      })}

      <div class="eq">${L('Open-drain / open-collector', 'Open-drain / open-collector')}: &nbsp; V<sub>OL</sub> = V<sub>PU</sub> · R<sub>on</sub> / (R + R<sub>on</sub>) &nbsp;&nbsp; I<sub>sink</sub> = (V<sub>PU</sub> − V<sub>OL</sub>) / R &nbsp;&nbsp; <b>P<sub>R</sub> = (V<sub>PU</sub> − V<sub>OL</sub>)² / R</b><br>
        ${L('Open-emitter', 'Open-emitter')}: &nbsp; V<sub>OH</sub> = V<sub>B</sub> − V<sub>BE</sub> ≈ V<sub>S</sub> − 0,7 V &nbsp;&nbsp; I<sub>source</sub> = V<sub>OH</sub> / R<sub>PD</sub>
        <span class="note">${L('Transistörün kenarı hızlıdır; direncin kenarı R·C ile yavaştır. Küçük direnç kenarı hızlandırır ama transistör iletimdeyken boşa akım harcar.',
                         'The transistor’s edge is fast; the resistor’s edge follows R·C and is slow. A smaller resistor speeds up that edge but wastes current while the transistor is on.')}</span></div>

      <h3>${L('Sinking ve sourcing', 'Sinking and sourcing')}</h3>
      <ul>
        <li>${L('<b>Sinking</b> (akım çekme): akım yükten pine girer ve transistörden GND’ye gider. Yükün diğer ucu artı beslemededir.', '<b>Sinking</b>: current flows from the load into the pin and through the transistor to GND. The other end of the load is at the positive supply.')}</li>
        <li>${L('<b>Sourcing</b> (akım verme): akım beslemeden transistör üzerinden pine ve yüke akar. Yükün diğer ucu GND’dedir.', '<b>Sourcing</b>: current flows from the supply through the transistor out of the pin into the load. The other end of the load is at GND.')}</li>
        <li>${L('Open-drain/collector yalnızca sink, open-emitter yalnızca source eder. Push-pull ikisini de yapar.', 'Open-drain/collector only sinks, open-emitter only sources. Push-pull does both.')}</li>
      </ul>
      <div class="call warn"><strong>${L('Push-pull çıkışı daha yüksek gerilime pull-up yapma', 'Do not pull a push-pull output up to a higher voltage')}</strong>
        ${L('3,3 V push-pull pini 5 V’a çekersen, pin 1 iken P-MOS gövde diyodu ve ESD diyodu iletir. 5 V’tan 3,3 V hattına akım akar ve regülatör geri beslenir. Başka gerilime çekmek için pini open-drain yap (5V-tolerant olmalı) ya da harici transistör kullan.',
            'Pull a 3.3 V push-pull pin up to 5 V and, with the pin high, the P-MOS body diode and the ESD diode conduct. Current flows from 5 V into the 3.3 V rail and back-feeds the regulator. To pull up to another voltage, set the pin to open-drain (it must be 5 V-tolerant) or use an external transistor.')}</div>

      <h2>${L('Wired-AND: tek hat, birçok cihaz', 'Wired-AND: one wire, many devices')}</h2>
      <p>${L('Birçok open-drain çıkış tek hatta, tek pull-up ile bağlanabilir. Hiçbiri iletimde değilse hat HIGH, <b>biri bile</b> iletimdeyse LOW olur. Hattı yukarı iten transistör olmadığı için kısa devre oluşmaz.',
             'Several open-drain outputs can share one wire and one pull-up. If none conducts, the line is HIGH; if <b>any one</b> conducts, it is LOW. No transistor pushes the line up, so nothing can short.')}</p>
      <p>${L('Pozitif mantıkta bu bir <b>AND</b>’dir. Aktif-düşük sinyallerde <b>OR</b> gibi okunur; bu yüzden iki ad da kullanılır.',
             'In positive logic this is an <b>AND</b>. With active-low signals it reads as an <b>OR</b>, which is why both names are used.')}</p>
      ${App.lab('lab-wired', L('Üç cihaz, bir hat: kim çekerse hat düşer', 'Three devices, one line: whoever pulls, the line drops'), {
        foot: L('V<sub>DD</sub> = 3,3 V, R<sub>P</sub> = 4,7 kΩ, N-MOS R<sub>on</sub> = 25 Ω, P-MOS R<sub>on</sub> = 30 Ω. Kırmızı noktalar çakışma akımıdır. Grafik son 6 saniyeyi gösterir; kesikli çizgiler V<sub>IL</sub> = 0,3·V<sub>DD</sub> ve V<sub>IH</sub> = 0,7·V<sub>DD</sub>.',
                'V<sub>DD</sub> = 3.3 V, R<sub>P</sub> = 4.7 kΩ, N-MOS R<sub>on</sub> = 25 Ω, P-MOS R<sub>on</sub> = 30 Ω. Red dots are contention current. The plot shows the last 6 seconds; dashed lines are V<sub>IL</sub> = 0.3·V<sub>DD</sub> and V<sub>IH</sub> = 0.7·V<sub>DD</sub>.')
      })}
      <ul>
        <li>${L('<b>I²C / SMBus:</b> SDA ve SCL open-drain’dir. Arbitrasyon ve <b>clock stretching</b> yalnızca wired-AND sayesinde çalışır.', '<b>I²C / SMBus:</b> SDA and SCL are open-drain. Arbitration and <b>clock stretching</b> only work because of wired-AND.')}</li>
        <li>${L('<b>Kesme hatları</b> (INT̅, ALERT̅): birçok sensör tek MCU pinini paylaşır. Hat düşünce MCU kimin istediğini sorar.', '<b>Interrupt lines</b> (INT̅, ALERT̅): many sensors share one MCU pin. When the line falls, the MCU polls who asked.')}</li>
        <li>${L('<b>Reset hatları</b> (nRST): supervisor, debugger ve buton aynı hattı güvenle çeker. Çoğu MCU’nun nRST pini zaten open-drain’dir.', '<b>Reset lines</b> (nRST): a supervisor, the debugger and a button can all pull the same line safely. Most MCUs’ nRST pin is already open-drain.')}</li>
        <li>${L('<b>Power good / fault:</b> birleşik PG hattı ancak tüm regülatörler hazırsa HIGH olur.', '<b>Power good / fault:</b> a shared PG line is HIGH only when every regulator is good.')}</li>
      </ul>

      <h2>${L('I²C pull-up seçimi: yükselme süresi ve akım', 'Choosing I²C pull-ups: rise time and current')}</h2>
      <p>${L('Pull-up’ı iki sınır belirler. Çok <b>büyük</b> direnç yükselen kenarı yavaşlatır. Çok <b>küçük</b> direnç LOW’da I<sub>OL</sub>’u aşar ve V<sub>OL</sub> 0,4 V’u geçer.',
             'Two limits set the pull-up. Too <b>large</b> a resistor slows the rising edge. Too <b>small</b> a resistor exceeds I<sub>OL</sub> when LOW, and V<sub>OL</sub> climbs above 0.4 V.')}</p>
      <p>${L('Düşen kenarı transistör hızla çeker. Yükselen kenar ise pull-up’ın hat kapasitansını doldurmasıdır: bir RC eğrisi.',
             'The transistor pulls the falling edge quickly. The rising edge is the pull-up charging the bus capacitance: an RC curve.')}</p>
      <div class="eq">t<sub>r</sub> (30 % → 70 %) = R·C·ln(0,7/0,3) = <b>0,8473 · R · C</b><br>
        R<sub>max</sub> = t<sub>r(max)</sub> / (0,8473 · C<sub>b</sub>) &nbsp;&nbsp;&nbsp; R<sub>min</sub> = (V<sub>PU</sub> − V<sub>OL(max)</sub>) / I<sub>OL</sub>
        <span class="note">${L('I²C spesifikasyonu (NXP UM10204): V<sub>OL</sub> ≤ 0,4 V @ I<sub>OL</sub> = 3 mA (Sm/Fm), 20 mA (Fm+). R, R<sub>min</sub> ile R<sub>max</sub> arasında olmalı. Pencere kapanırsa kapasitansı azalt, hızı düşür ya da bus buffer kullan.',
                         'I²C specification (NXP UM10204): V<sub>OL</sub> ≤ 0.4 V @ I<sub>OL</sub> = 3 mA (Sm/Fm), 20 mA (Fm+). R must lie between R<sub>min</sub> and R<sub>max</sub>. If the window closes, reduce capacitance, lower the speed or use a bus buffer.')}</span></div>
      ${App.lab('lab-i2c', L('I²C hattı: pull-up, kapasitans ve hız', 'I²C bus: pull-up, capacitance and speed'), {
        stack: true,
        foot: L('Sarı iz (CH1) hat gerilimi, mavi kesikli iz ideal SCL (%50 görev oranı). Alçak taraf R<sub>on</sub> = 0,4 V / I<sub>OL</sub> olarak modellendi. t<sub>r</sub>: 0,3·V<sub>PU</sub> → 0,7·V<sub>PU</sub> süresi. Alttaki grafik seçilen C için izinli direnç penceresidir.',
                'Yellow trace (CH1) is the bus voltage; the dashed blue trace is the ideal SCL (50 % duty). The low side is modelled as R<sub>on</sub> = 0.4 V / I<sub>OL</sub>. t<sub>r</sub> is the 0.3·V<sub>PU</sub> → 0.7·V<sub>PU</sub> time. The lower plot is the allowed resistor window for the chosen C.')
      })}
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Mod', 'Mode')}</th><th class="num">f<sub>SCL</sub></th><th class="num">t<sub>r(max)</sub></th><th class="num">I<sub>OL</sub> @ 0,4 V</th><th class="num">C<sub>b(max)</sub></th><th>${L('Not', 'Note')}</th></tr></thead>
        <tbody>
          <tr><td>Standard-mode (Sm)</td><td class="num">100 kHz</td><td class="num">1000 ns</td><td class="num">3 mA</td><td class="num">400 pF</td><td>${L('En toleranslı mod', 'Most forgiving mode')}</td></tr>
          <tr><td>Fast-mode (Fm)</td><td class="num">400 kHz</td><td class="num">300 ns</td><td class="num">3 mA</td><td class="num">400 pF</td><td>${L('Çoğu sensörün varsayılanı', 'Default for most sensors')}</td></tr>
          <tr><td>Fast-mode Plus (Fm+)</td><td class="num">1 MHz</td><td class="num">120 ns</td><td class="num">20 mA</td><td class="num">550 pF</td><td>${L('Tüm cihazlar Fm+ destekliyorsa', 'Only if every device supports Fm+')}</td></tr>
          <tr><td>SMBus</td><td class="num">10–100 kHz</td><td class="num">1000 ns</td><td class="num">${L('4 mA (yüksek güç)', '4 mA (high power)')}</td><td class="num">400 pF</td><td>${L('Düşük güç sınıfında 350 µA; 35 ms zaman aşımı', 'Low-power class 350 µA; 35 ms timeout')}</td></tr>
        </tbody></table></div>
      <p>${L('<b>Başlangıç değerleri</b> (kart içi kısa bus, ≤ 100 pF, 3,3 V):', '<b>Starting values</b> (short on-board bus, ≤ 100 pF, 3.3 V):')}</p>
      <ul>
        <li>${L('100 kHz: 4,7–10 kΩ', '100 kHz: 4.7–10 kΩ')}</li>
        <li>${L('400 kHz: 2,2–4,7 kΩ', '400 kHz: 2.2–4.7 kΩ')}</li>
        <li>${L('Modüllerin pull-up’ları paralel bağlanır: üç tane 4,7 kΩ = 1,57 kΩ.', 'Module pull-ups add in parallel: three 4.7 kΩ = 1.57 kΩ.')}</li>
        <li>${L('MCU’nun dahili 30–50 kΩ pull-up’ı neredeyse hiçbir zaman yetmez.', 'The MCU’s internal 30–50 kΩ pull-up is almost never enough.')}</li>
      </ul>

      <h2>${L('Seviye çevirme ve LED sürme', 'Level shifting and LED driving')}</h2>
      <p>${L('Open-drain çıkışın HIGH’ı <b>pull-up’ın bağlı olduğu gerilimdir</b>, kendi beslemesi değil. 3,3 V MCU, pull-up’ı 5 V’a bağlayarak 5 V lojik sürebilir. Harici bir transistörle aynısı 12 V ya da 24 V için yapılır.',
             'An open-drain output’s HIGH is <b>whatever the pull-up goes to</b>, not its own supply. A 3.3 V MCU can drive 5 V logic by pulling up to 5 V. With an external transistor the same works for 12 V or 24 V.')}</p>
      <ul>
        <li>${L('Mantık genelde <b>ters döner</b>: MCU 1 → transistör iletimde → çıkış LOW.', 'The logic usually <b>inverts</b>: MCU 1 → transistor on → output LOW.')}</li>
        <li>${L('Kapalı transistör tam pull-up gerilimini görür.', 'The off transistor sees the full pull-up voltage.')}</li>
      </ul>
      <div class="call bad"><strong>${L('Pinin mutlak maksimum gerilimi', 'The pin’s absolute maximum voltage')}</strong>
        ${L('Open-drain modu pini yüksek gerilime dayanıklı yapmaz. Mutlak maksimum genelde <b>V<sub>DD</sub> + 0,3 V</b>’tur; yalnızca <b>5V-tolerant</b> (STM32’de “FT”) pinler 5,5 V’a dayanır. 5 V üstü için <b>harici N-MOS (2N7002, BSS138) ya da NPN (MMBT3904)</b> kullan.',
            'Open-drain mode does not make a pin high-voltage tolerant. The absolute maximum is usually <b>V<sub>DD</sub> + 0.3 V</b>; only <b>5 V-tolerant</b> pins (“FT” on STM32) survive 5.5 V. Above 5 V use an <b>external N-MOS (2N7002, BSS138) or NPN (MMBT3904)</b>.')}</div>

      ${App.lab('lab-ls', L('3,3 V MCU → 24 V PLC girişi: open-collector seviye çevirici', '3.3 V MCU → 24 V PLC input: open-collector level shifter'), {
        foot: L('PLC girişi: 24 V’ta seçilen akımı çeken bir direnç (R<sub>in</sub> = 24 V / I<sub>in</sub>) ve optokuplör LED’i; gerçek girişlerin çoğu akım sınırlıdır. Eşikler IEC 61131-2 Type 1: ON ≥ 15 V ve ≥ 2 mA, OFF ≤ 5 V. NPN: MMBT3904, R<sub>B</sub> = 1 kΩ, β<sub>min</sub> ≈ 30. N-MOS: BSS138, R<sub>DS(on)</sub> ≈ 1,3 Ω @ 3,3 V.',
                'PLC input: a resistor drawing the chosen current at 24 V (R<sub>in</sub> = 24 V / I<sub>in</sub>) plus its optocoupler LED; many real inputs are current-limited. Thresholds IEC 61131-2 Type 1: ON ≥ 15 V and ≥ 2 mA, OFF ≤ 5 V. NPN: MMBT3904, R<sub>B</sub> = 1 kΩ, β<sub>min</sub> ≈ 30. N-MOS: BSS138, R<sub>DS(on)</sub> ≈ 1.3 Ω @ 3.3 V.')
      })}
      <p>${L('PLC girişini pull-up ile sürmek kötü bir uzlaşmadır. Pull-up ve giriş direnci bir <b>gerilim bölücü</b> oluşturur. HIGH’ı 15 V üstünde tutmak için R<sub>PU</sub> küçük olmalı, ama küçük direnç ısınır:',
             'Driving a PLC input through a pull-up is a poor compromise. The pull-up and the input resistance form a <b>voltage divider</b>. Keeping HIGH above 15 V needs a small R<sub>PU</sub>, but a small resistor gets hot:')}</p>
      ${App.example({
        given: [['V<sub>PU</sub>', '24 V'], ['R<sub>PU</sub>', L('2,2 kΩ', '2.2 kΩ')]],
        steps: [
          [L('Transistör iletimde', 'Transistor on'), L('I = 24 V / 2,2 kΩ', 'I = 24 V / 2.2 kΩ'), '11 mA'],
          [L('Dirençte kayıp', 'Resistor loss'), 'P = 24² / 2200', L('0,26 W', '0.26 W'), L('1/4 W’lık direnci aşar', 'exceeds a 1/4 W resistor')]
        ],
        result: L('<b>Pull-up ile PLC girişi sürmek verimsizdir.</b> Girişin beklediği sourcing çıkışı kullan.', '<b>Driving a PLC input through a pull-up is wasteful.</b> Use the sourcing output the input expects.'),
        level: 'warn'
      })}
      <p>${L('Temiz çözüm bir <b>sourcing</b> çıkıştır: PNP/P-MOS high-side ya da hazır bir high-side switch IC’si. Boşa akım olmaz ve mantık ters dönmez.',
             'The clean fix is a <b>sourcing</b> output: a PNP/P-MOS high-side or a ready-made high-side switch IC. No current is wasted and the logic does not invert.')}</p>

      <h3>${L('LED’i sink ederek sürmek', 'Driving an LED by sinking')}</h3>
      <p>${L('LED’in anodu dirençle artı beslemeye, katodu pine bağlanır. Pin LOW olunca LED yanar: <b>aktif-düşük</b>. Eski MCU’lar (8051, bazı AVR’ler) daha fazla sink edebildiği için klasik devreler böyledir.',
             'The LED’s anode goes through a resistor to the positive supply, its cathode to the pin. The LED lights when the pin is LOW: <b>active-low</b>. Older MCUs (8051, some AVRs) could sink more than source, so classic circuits do it this way.')}</p>
      <div class="eq">R = (V<sub>LED+</sub> − V<sub>F</sub> − V<sub>OL</sub>) / I<sub>LED</sub></div>
      ${App.example({
        given: [['V<sub>LED+</sub>', L('3,3 V', '3.3 V')], ['V<sub>F</sub>', L('2,0 V (kırmızı)', '2.0 V (red)')], ['V<sub>OL</sub>', L('0,3 V', '0.3 V')], ['I<sub>LED</sub>', '5 mA']],
        steps: [
          [L('Seri direnç', 'Series resistor'), L('R = (3,3 − 2,0 − 0,3) V / 5 mA', 'R = (3.3 − 2.0 − 0.3) V / 5 mA'), '200 Ω']
        ],
        result: L('<b>200 Ω kullan.</b> Pin yalnızca 5 mA çeker.', '<b>Use 200 Ω.</b> The pin sinks only 5 mA.')
      })}
      <p>${L('<b>Dikkat:</b> LED 5 V’ta, pin ise 3,3 V push-pull ise pin HIGH’dayken bile LED ve direnç üzerinde 1,7 V kalır. Kırmızı LED sönük yanar ve akım pinden V<sub>DD</sub>’ye akar.',
             '<b>Careful:</b> if the LED goes to 5 V but the pin is 3.3 V push-pull, 1.7 V remains across LED and resistor even with the pin HIGH. A red LED glows faintly and current flows into the pin to V<sub>DD</sub>.')}</p>

      <h2>${L('Open-collector parçalar', 'Open-collector parts')}</h2>
      <p>${L('Birçok entegre çıkışını bilerek open-collector yapar. Çıkış, alıcının istediği gerilime çekilebilir ve hatlar birleştirilebilir.',
             'Many ICs make their output open-collector on purpose. The output can be pulled up to whatever the receiver wants, and lines can be shared.')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Çıkış', 'Output')}</th><th class="num">${L('Maks. gerilim', 'Max voltage')}</th><th class="num">${L('Sink akımı', 'Sink current')}</th><th>${L('Tipik pull-up / not', 'Typical pull-up / note')}</th></tr></thead>
        <tbody>
          <tr><td>LM393 / LM339 (${L('komparatör', 'comparator')})</td><td>NPN open-collector</td><td class="num">36 V</td><td class="num">${L('≥ 6 mA (tip. 16 mA)', '≥ 6 mA (typ. 16 mA)')}</td><td>${L('3,3 V’a 4,7–10 kΩ; besleme 12 V olsa bile', '4.7–10 kΩ to 3.3 V, even with a 12 V supply')}</td></tr>
          <tr><td>PC817 (${L('optokuplör', 'optocoupler')})</td><td>${L('Fototransistör (OC)', 'Phototransistor (OC)')}</td><td class="num">V<sub>CEO</sub> 35 V</td><td class="num">CTR 50–600 %</td><td>${L('4,7–10 kΩ; yavaş (t<sub>r</sub> µs mertebesi), R büyüdükçe daha yavaş', '4.7–10 kΩ; slow (t<sub>r</sub> in µs), slower with larger R')}</td></tr>
          <tr><td>${L('Hall anahtarı, enkoder', 'Hall switch, encoder')}</td><td>${L('NPN OC / open-drain', 'NPN OC / open-drain')}</td><td class="num">24–30 V</td><td class="num">~20–25 mA</td><td>${L('Sensör 5–24 V, pull-up MCU tarafında; aktif-düşük', 'Sensor on 5–24 V, pull-up on the MCU side; active-low')}</td></tr>
          <tr><td>ULN2003A / ULN2803A</td><td>${L('Darlington OC, 7/8 kanal', 'Darlington OC, 7/8 channels')}</td><td class="num">50 V</td><td class="num">${L('500 mA/kanal', '500 mA/channel')}</td><td>${L('Röle, solenoid, step motor; dahili flyback diyotları COM’a; V<sub>CE(sat)</sub> ≈ 0,9–1,3 V', 'Relays, solenoids, steppers; internal flyback diodes to COM; V<sub>CE(sat)</sub> ≈ 0.9–1.3 V')}</td></tr>
          <tr><td>${L('Regülatör PG, şarj IC STAT', 'Regulator PG, charger STAT')}</td><td>Open-drain</td><td class="num">~6–20 V</td><td class="num">${L('birkaç mA', 'a few mA')}</td><td>${L('10–100 kΩ; STAT pini LED’i doğrudan sink edebilir', '10–100 kΩ; STAT pins can sink an LED directly')}</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('Değerler tipik datasheet değerleridir; üreticiye göre değişir.', 'Typical datasheet values; they vary by vendor.')}</p>

      ${App.figure('fig-uln', L('ULN2803A ile 24 V röle: iletim ve COM diyotu üzerinden boşalma', 'ULN2803A with a 24 V relay: on-time and decay through the COM diode'), {
        foot: L('Bobin: 24 V, 1,1 kΩ, L ≈ 1 H (τ ≈ 0,9 ms). V<sub>CE(sat)</sub> ≈ 0,8 V, COM diyotu V<sub>F</sub> ≈ 0,8 V. Kapanışta bobin akımı COM diyotundan dolaşır; çıkış 24 V + V<sub>F</sub>’de kenetlenir. COM bağlı değilse darbe 50 V sınırını aşar.',
                'Coil: 24 V, 1.1 kΩ, L ≈ 1 H (τ ≈ 0.9 ms). V<sub>CE(sat)</sub> ≈ 0.8 V, COM diode V<sub>F</sub> ≈ 0.8 V. At turn-off the coil current circulates through the COM diode; the output is clamped at 24 V + V<sub>F</sub>. Without COM connected, the spike exceeds the 50 V rating.')
      })}
      <p>${L('Endüktif yüklerin ayrıntıları için <a href="#inductive">endüktif yükler</a> bölümüne bak.', 'For more on inductive loads see the <a href="#inductive">inductive loads</a> chapter.')}</p>

      <h2>${L('Open-emitter: emitter follower, ECL ve “PNP” sensörler', 'Open-emitter: emitter follower, ECL and “PNP” sensors')}</h2>
      <p>${L('Open-emitter çıkışta yalnızca üstteki NPN vardır; emitter dışarıdadır. Transistör bir <b>emitter follower</b>’dır: çıkış base’in bir V<sub>BE</sub> (~0,7 V) altındadır ve akım verir. LOW seviyesini pull-down ya da topraklı yük sağlar.',
             'An open-emitter output has only the upper NPN; the emitter is the pin. The transistor is an <b>emitter follower</b>: the output sits one V<sub>BE</sub> (~0.7 V) below the base and sources current. A pull-down or a grounded load provides LOW.')}</p>
      <p>${L('Transistör doyuma girmediği için çok hızlıdır. Bu yüzden <b>ECL</b> ve LVPECL saat sürücüleri open-emitter kullanır: ~800 mV salınım, 50 Ω ile V<sub>CC</sub> − 2 V’a sonlandırma.',
             'The transistor never saturates, so it is very fast. That is why <b>ECL</b> and LVPECL clock drivers use open-emitter outputs: ~800 mV swing, 50 Ω termination to V<sub>CC</sub> − 2 V.')}</p>
      <h3>${L('Endüstriyel “PNP” sensör nedir?', 'What is an industrial “PNP” sensor?')}</h3>
      <p>${L('PNP sensörün çıkışı, emitter’ı +24 V’ta olan bir PNP’nin <b>collector</b>’üdür. İşlevi open-emitter ile aynıdır: yalnızca +24 V’a doğru sürer (sourcing). NPN sensör ise klasik open-collector’dır (sinking).',
             'A PNP sensor’s output is the <b>collector</b> of a PNP whose emitter sits at +24 V. It plays the open-emitter role: it only drives towards +24 V (sourcing). An NPN sensor is a classic open-collector (sinking).')}</p>
      <p>${L('PNP doyuma girdiği için düşüm bir V<sub>BE</sub> değildir; genelde ≤ 2 V olarak verilir.', 'Because the PNP saturates, the drop is not a V<sub>BE</sub>; it is usually specified as ≤ 2 V.')}</p>

      <h2>${L('Sanayi 24 V: PNP (sourcing) ve NPN (sinking)', 'Industrial 24 V: PNP (sourcing) vs NPN (sinking)')}</h2>
      <p>${L('Yaklaşım sensörleri genelde 3 tellidir:', 'Proximity sensors are usually 3-wire:')}</p>
      <ul>
        <li>${L('<b>Kahverengi (BN):</b> +24 V', '<b>Brown (BN):</b> +24 V')}</li>
        <li>${L('<b>Mavi (BU):</b> 0 V', '<b>Blue (BU):</b> 0 V')}</li>
        <li>${L('<b>Siyah (BK):</b> sinyal', '<b>Black (BK):</b> signal')}</li>
      </ul>
      <p>${L('<b>PNP sensör</b> algılayınca siyah teli +24 V’a bağlar; PLC girişi akımı 0 V’a akıtır (sink input). <b>NPN sensör</b> siyah teli 0 V’a çeker; girişin diğer ucu +24 V’tadır (source input).',
             'A <b>PNP sensor</b> connects the black wire to +24 V on detection; the PLC input carries the current to 0 V (sink input). An <b>NPN sensor</b> pulls the black wire to 0 V; the other end of the input is at +24 V (source input).')}</p>
      <p>${L('Giriş tipi sensörle eşleşmelidir. Birçok PLC’de grup ortak ucu (COM/1M) 0 V’a ya da 24 V’a bağlanarak seçilir.',
             'The input type must match the sensor. Many PLCs select it by tying the group common (COM/1M) to 0 V or to 24 V.')}</p>
      ${App.lab('lab-plc', L('3 telli sensör → PLC girişi; arızayı dene', '3-wire sensor → PLC input; try the fault'), {
        foot: L('Sensör çıkış düşümü 2 V, PLC girişi 4,7 kΩ (24 V’ta ≈ 4,7 mA). Giriş gerilimi giriş uçları arasında ölçülür (PNP: I0.0–M, NPN: L+–I0.0). Arıza: siyah tel ezilip 0 V’a bağlı gövdeye değer. Sanayi sensör çıkışları kısa devre korumalıdır.',
                'Sensor output drop 2 V, PLC input 4.7 kΩ (≈ 4.7 mA at 24 V). Input voltage is measured across the input terminals (PNP: I0.0–M, NPN: L+–I0.0). Fault: the black wire is crushed onto chassis tied to 0 V. Industrial sensor outputs are short-circuit protected.')
      })}
      <div class="call tip"><strong>${L('PNP kablo arızasında güvenli tarafta kalır', 'PNP fails safe on a wiring fault')}</strong>
        <ul>
          <li>${L('Sinyal teli topraklı gövdeye değerse PNP girişi <b>OFF</b> olur: makine güvenli tarafta durur.', 'If the signal wire touches earthed chassis, a PNP input goes <b>OFF</b>: the machine stops on the safe side.')}</li>
          <li>${L('NPN’de aynı arıza girişi <b>ON</b> yapar: PLC olmayan bir nesne görür.', 'With NPN the same fault turns the input <b>ON</b>: the PLC sees an object that is not there.')}</li>
          <li>${L('Çıkışta da aynısı geçerli: sourcing sürülen bir valfi gövdeye kaçak açamaz.', 'Outputs work the same way: a short to chassis cannot open a sourcing-driven valve.')}</li>
          <li>${L('Avrupa PNP’yi tercih eder; Japonya’da NPN hâlâ yaygındır. Sipariş ederken tip kodunu kontrol et.', 'Europe prefers PNP; NPN is still common in Japan. Check the type code when ordering.')}</li>
        </ul></div>
      <div class="table-wrap"><table>
        <thead><tr><th>IEC 61131-2 (24 V DC)</th><th class="num">ON ${L('gerilimi', 'voltage')}</th><th class="num">ON ${L('akımı', 'current')}</th><th class="num">OFF ${L('gerilimi', 'voltage')}</th><th class="num">OFF ${L('akımı', 'current')}</th><th>${L('Kullanım', 'Use')}</th></tr></thead>
        <tbody>
          <tr><td>Type 1</td><td class="num">15–30 V</td><td class="num">2–15 mA</td><td class="num">≤ 5 V</td><td class="num">${L('≤ 0,5 mA', '≤ 0.5 mA')}</td><td>${L('Mekanik kontak, 3 telli sensör', 'Mechanical contacts, 3-wire sensors')}</td></tr>
          <tr><td>Type 2</td><td class="num">11–30 V</td><td class="num">6–30 mA</td><td class="num">≤ 5 V</td><td class="num">≤ 2 mA</td><td>${L('Kaçak akımlı 2 telli sensörler', '2-wire sensors with leakage')}</td></tr>
          <tr><td>Type 3</td><td class="num">11–30 V</td><td class="num">2–15 mA</td><td class="num">≤ 5 V</td><td class="num">${L('≤ 1,5 mA', '≤ 1.5 mA')}</td><td>${L('Modern 2 ve 3 telli sensörler (en yaygın)', 'Modern 2- and 3-wire sensors (most common)')}</td></tr>
        </tbody></table></div>
      <div class="call warn"><strong>${L('“24 V” aslında 18–30 V ve üstüdür', '“24 V” really means 18–30 V and more')}</strong>
        ${L('<b>40–60 V</b> sınıfı transistör, girişte <b>TVS</b> (ör. SMBJ33A), seri direnç ve ters polarite koruması kullan. IEC 61131-2, 19,2–30 V çalışma bekler; sahada kablolar ve bobinler onlarca voltluk darbe ekler. 30 V’luk bir MOSFET ilk endüktif darbede ölür.',
            'Use <b>40–60 V</b> class transistors, a <b>TVS</b> at the input (e.g. SMBJ33A), series resistance and reverse-polarity protection. IEC 61131-2 expects 19.2–30 V operation; in the field, cables and coils add spikes of tens of volts. A 30 V MOSFET dies at the first inductive spike.')}</div>

      <h2>${L('Otomotiv 12 V: akü “12 V” değildir', 'Automotive 12 V: the battery is not “12 V”')}</h2>
      <p>${L('Araçtaki “12 V” hattı 6 V ile 35 V üstü arasında gezer. Tasarımı nominal değere değil, olaylara göre yap.',
             'A car’s “12 V” rail wanders between 6 V and over 35 V. Design for the events, not the nominal value.')}</p>
      <ul>
        <li>${L('<b>Motor çalışırken:</b> 13,5–14,4 V. Normal aralık 9–16 V.', '<b>Engine running:</b> 13.5–14.4 V. Normal range 9–16 V.')}</li>
        <li>${L('<b>Soğuk krank:</b> ~6 V’a, kötü koşulda daha aşağı iner.', '<b>Cold crank:</b> dips to ~6 V, lower in bad conditions.')}</li>
        <li>${L('<b>Load dump:</b> akü kablosu koparsa yüzlerce ms süren darbe. Korumasız 80–100 V, merkezi kenetle ~35 V (ISO 16750-2 Test B).', '<b>Load dump:</b> the battery cable comes off and a pulse lasts hundreds of ms. Unsuppressed 80–100 V, centrally clamped ~35 V (ISO 16750-2 Test B).')}</li>
        <li>${L('<b>Diğerleri:</b> ters akü (−14 V), takviye (24 V, 1 dk), ISO 7637-2 hızlı darbeleri.', '<b>Others:</b> reverse battery (−14 V), jump start (24 V, 1 min), ISO 7637-2 fast pulses.')}</li>
      </ul>
      ${App.figure('fig-auto', L('12 V araç hattında olaylar', 'Events on a 12 V vehicle rail'), {
        foot: L('Zaman ekseni temsilidir; olaylar ayrı ayrı olur. Yeşil bant: 9–16 V. Kesikli gri: kenetlenmemiş load dump (~90 V); bakır: kenetlenmiş (~35 V). 40 V MOSFET az payla geçer, 60 V güvenlidir. Ters akü için seri diyot, P-MOS ya da ideal diyot kontrolcüsü gerekir.',
                'Time axis is illustrative; the events happen separately. Green band: 9–16 V. Dashed grey: unclamped load dump (~90 V); copper: clamped (~35 V). A 40 V MOSFET survives with little margin, 60 V is safe. Reverse battery needs a series diode, a P-MOS or an ideal-diode controller.')
      })}
      <ul>
        <li>${L('<b>High-side tercih edilir.</b> Gövde eksi kutuptur. Kablo gövdeye değerse yük kendiliğinden açılmaz; kapalı yükte gerilim kalmaz ve korozyon azalır.', '<b>High-side is preferred.</b> The body is the negative return. A wire touching the body cannot switch the load on, and an off load sits at 0 V, which reduces corrosion.')}</li>
        <li>${L('<b>Akıllı high-side anahtarlar</b> (Infineon PROFET, ST VN/VNQ, TI TPS1H/TPS2H): N-MOS, şarj pompası, akım sınırı, sıcaklık kapatma ve akım algılama içerir. MCU tek pin sürer ve arızayı geri okur.', '<b>Smart high-side switches</b> (Infineon PROFET, ST VN/VNQ, TI TPS1H/TPS2H): integrate the N-MOS, charge pump, current limit, thermal shutdown and current sense. The MCU drives one pin and reads back faults.')}</li>
        <li>${L('<b>Low-side</b> hâlâ enjektörlerde, bazı solenoid ve rölelerde kullanılır. Yükün iki ucu da ECU’ya gelir.', '<b>Low-side</b> is still used for injectors and some solenoids and relays. Both ends of the load go to the ECU.')}</li>
        <li>${L('<b>Ayrık tasarım:</b> V<sub>DS</sub> ≥ 40 V (tercihen 60 V), AEC-Q101 parça, girişte TVS, ters polarite koruması. Ayrıntı: <a href="#topologies">topolojiler</a>, <a href="#overcurrent">aşırı akım</a>.', '<b>Discrete design:</b> V<sub>DS</sub> ≥ 40 V (preferably 60 V), AEC-Q101 parts, a TVS at the input, reverse-polarity protection. More in <a href="#topologies">topologies</a> and <a href="#overcurrent">overcurrent</a>.')}</li>
      </ul>

      <h2>${L('Karşılaştırma', 'Comparison')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Tip', 'Type')}</th><th>${L('Akım', 'Current')}</th><th>${L('Gerekenler', 'Needs')}</th><th>${L('Hız', 'Speed')}</th><th>${L('Tipik kullanım', 'Typical uses')}</th><th>${L('Tuzaklar', 'Pitfalls')}</th></tr></thead>
        <tbody>
          <tr><td><b>Push-pull</b></td><td>${L('Verir + çeker', 'Sources + sinks')}</td><td>${L('Hiçbir şey', 'Nothing')}</td><td>${L('İki kenar hızlı', 'Both edges fast')}</td><td>${L('GPIO, SPI, UART, gate sürme', 'GPIO, SPI, UART, gate drive')}</td><td>${L('İki çıkışı birleştirmek = kısa devre; daha yüksek gerilime pull-up = geri besleme', 'Tying two outputs = short circuit; pull-up to a higher voltage = back-feed')}</td></tr>
          <tr><td><b>Open-drain</b></td><td>${L('Çeker (sink)', 'Sinks')}</td><td>Pull-up</td><td>${L('Düşüş hızlı, yükseliş R·C', 'Fast fall, R·C rise')}</td><td>${L('I²C, INT̅, RESET̅, seviye çevirme, LED', 'I²C, INT̅, RESET̅, level shifting, LEDs')}</td><td>${L('Pinin abs-max’ı (5V-tolerant mı?), pull-up çok büyük/küçük', 'Pin abs-max (5 V-tolerant?), pull-up too large/small')}</td></tr>
          <tr><td><b>Open-collector</b></td><td>${L('Çeker (sink)', 'Sinks')}</td><td>Pull-up</td><td>${L('Düşüş hızlı, yükseliş R·C; doyumdan çıkış gecikmesi', 'Fast fall, R·C rise; saturation storage delay')}</td><td>${L('LM393, PC817, Hall, ULN2803, NPN sensörler', 'LM393, PC817, Hall, ULN2803, NPN sensors')}</td><td>${L('V<sub>CE(sat)</sub> 0,1–1,3 V; mantık ters döner', 'V<sub>CE(sat)</sub> 0.1–1.3 V; logic inverts')}</td></tr>
          <tr><td><b>Open-emitter</b></td><td>${L('Verir (source)', 'Sources')}</td><td>${L('Pull-down / topraklı yük', 'Pull-down / grounded load')}</td><td>${L('Yükseliş hızlı, düşüş R·C; doyum yok', 'Fast rise, R·C fall; no saturation')}</td><td>${L('ECL/PECL, emitter follower, PNP-tipi sensör/çıkışlar', 'ECL/PECL, emitter followers, PNP-style sensors/outputs')}</td><td>${L('V<sub>BE</sub> kadar kayıp; düşük beslemede V<sub>OH</sub> yetmez', 'Loses V<sub>BE</sub>; V<sub>OH</sub> too low at low supply')}</td></tr>
          <tr><td><b>Open-source</b></td><td>${L('Verir (source)', 'Sources')}</td><td>Pull-down</td><td>${L('Yükseliş hızlı, düşüş R·C', 'Fast rise, R·C fall')}</td><td>${L('Nadir; güçte high-side anahtar', 'Rare; high-side switches in power')}</td><td>${L('N-MOS için gate’i beslemenin üstüne sürmek gerekir', 'An N-MOS needs a gate above the supply')}</td></tr>
        </tbody></table></div>

      <h2>${L('Çözümlü örnekler', 'Worked examples')}</h2>
      <details class="fold"><summary>${L('1 · 3,3 V, 200 pF, 400 kHz I²C bus için hangi pull-up?', '1 · Which pull-up for a 3.3 V, 200 pF, 400 kHz I²C bus?')}</summary><div>
        <p>${L('Direnç, akım sınırı ile yükselme süresi sınırı arasında kalmalı.', 'The resistor must sit between the current limit and the rise-time limit.')}</p>
        ${App.example({
          given: [['V<sub>PU</sub>', L('3,3 V', '3.3 V')], ['C<sub>b</sub>', '200 pF'], ['f<sub>SCL</sub>', '400 kHz (Fm)'], ['t<sub>r(max)</sub>', '300 ns'], ['I<sub>OL</sub>', '3 mA']],
          steps: [
            [L('Alt sınır (akım)', 'Lower bound (current)'), L('R<sub>min</sub> = (3,3 − 0,4) V / 3 mA', 'R<sub>min</sub> = (3.3 − 0.4) V / 3 mA'), '967 Ω'],
            [L('Üst sınır (hız)', 'Upper bound (speed)'), L('R<sub>max</sub> = 300 ns / (0,8473 · 200 pF)', 'R<sub>max</sub> = 300 ns / (0.8473 · 200 pF)'), L('1,77 kΩ', '1.77 kΩ')],
            [L('Seçim', 'Choice'), L('pencerenin ortası', 'middle of the window'), L('1,5 kΩ', '1.5 kΩ')],
            [L('Yükselme süresi', 'Rise time'), L('t<sub>r</sub> = 0,8473 · 1,5 kΩ · 200 pF', 't<sub>r</sub> = 0.8473 · 1.5 kΩ · 200 pF'), '254 ns', L('300 ns altında; 1,8 kΩ olsaydı 305 ns olurdu', 'below 300 ns; 1.8 kΩ would give 305 ns')],
            [L('LOW akımı', 'LOW current'), L('I = 3,3 V / 1,5 kΩ', 'I = 3.3 V / 1.5 kΩ'), L('2,2 mA', '2.2 mA'), L('3 mA sınırının altında', 'below the 3 mA limit')],
            [L('Direnç kaybı', 'Resistor loss'), L('P = 3,3² / 1500', 'P = 3.3² / 1500'), L('7,3 mW', '7.3 mW')]
          ],
          result: L('<b>1,5 kΩ pull-up kullan.</b> Modüllerdeki gizli pull-up’ları sök ya da paralel değeri hesaba kat.', '<b>Use 1.5 kΩ pull-ups.</b> Remove hidden module pull-ups or include their parallel value.')
        })}
        <p class="muted small">${L('Aynı değerleri yukarıdaki I²C laboratuvarında deneyebilirsin.', 'You can dial the same values into the I²C lab above.')}</p>
      </div></details>
      <details class="fold"><summary>${L('2 · 12 V beslemeli NPN Hall sensörü 3,3 V MCU’ya nasıl bağlanır?', '2 · How to connect a 12 V-powered NPN Hall sensor to a 3.3 V MCU?')}</summary><div>
        <ol class="steps">
          <li>${L('Sensörü 12 V ve GND’den besle. <b>GND’ler ortak</b> olmalı.', 'Power the sensor from 12 V and GND. The <b>grounds must be common</b>.')}</li>
          <li>${L('Pull-up’ı <b>3,3 V’a</b> bağla, 12 V’a değil. 12 V’a çekersen MCU pini 12 V görür ve ESD diyodundan 3,3 V hattına akım basar.', 'Tie the pull-up to <b>3.3 V</b>, not 12 V. With a 12 V pull-up the MCU pin sees 12 V and pumps current through its ESD diode into the 3.3 V rail.')}</li>
        </ol>
        ${App.example({
          given: [['V<sub>PU</sub>', L('3,3 V', '3.3 V')], ['R', '10 kΩ'], [L('Sensör sink', 'Sensor sink'), '≤ 20 mA']],
          steps: [
            [L('LOW akımı', 'LOW current'), L('I = 3,3 V / 10 kΩ', 'I = 3.3 V / 10 kΩ'), L('0,33 mA', '0.33 mA'), L('sensör sınırının çok altında', 'far below the sensor limit')],
            [L('LOW eşiği', 'LOW threshold'), L('V<sub>IL</sub> = 0,3 · 3,3 V', 'V<sub>IL</sub> = 0.3 · 3.3 V'), L('0,99 V', '0.99 V'), L('V<sub>OL</sub> ≈ 0,1–0,2 V, rahatça altında', 'V<sub>OL</sub> ≈ 0.1–0.2 V, comfortably below')]
          ],
          result: L('<b>3,3 V’a 10 kΩ pull-up yeterli.</b> Çıkış aktif-düşüktür: mıknatıs gelince 0 okursun.', '<b>A 10 kΩ pull-up to 3.3 V is enough.</b> The output is active-low: you read 0 when the magnet is present.')
        })}
        <p>${L('Kablo 1 m’den uzunsa R’yi 2,2–4,7 kΩ’a indir. Pine seri 1 kΩ ve GND’ye 1 nF ekle (τ = 1 µs). Mümkünse Schmitt tetikli giriş kullan.',
               'For cables over 1 m, drop R to 2.2–4.7 kΩ. Add a series 1 kΩ and 1 nF to GND at the pin (τ = 1 µs). Use a Schmitt-trigger input if possible.')}</p>
      </div></details>
      <details class="fold"><summary>${L('3 · ULN2803A 24 V röle bobinini sürebilir mi?', '3 · Can a ULN2803A drive a 24 V relay coil?')}</summary><div>
        <p>${L('Darlington ~1 V düşürür; sekiz kanal birden açıkken paketin ısınmasını kontrol ediyoruz.', 'A Darlington drops ~1 V, so we check how hot the package gets with all eight channels on.')}</p>
        ${App.example({
          given: [['V', '24 V'], [L('Bobin', 'Coil'), L('1,1 kΩ', '1.1 kΩ')], ['V<sub>CE(sat)</sub>', L('0,8 V', '0.8 V')], ['θ<sub>JA</sub>', '65 °C/W']],
          steps: [
            [L('Bobin akımı', 'Coil current'), L('I = (24 − 0,8) V / 1100 Ω', 'I = (24 − 0.8) V / 1100 Ω'), '21 mA'],
            [L('Kanal kaybı', 'Loss per channel'), L('P = 0,8 V · 21 mA', 'P = 0.8 V · 21 mA'), '17 mW'],
            [L('8 kanal birden', 'All 8 channels'), 'P = 8 · 17 mW', L('0,135 W', '0.135 W')],
            [L('Sıcaklık artışı', 'Temperature rise'), L('ΔT = 0,135 W · 65 °C/W', 'ΔT = 0.135 W · 65 °C/W'), '≈ 9 °C', L('SOIC-18; θ<sub>JA</sub> için datasheet’e bak', 'SOIC-18; check θ<sub>JA</sub> in the datasheet')]
          ],
          result: L('<b>ULN2803A bu röleleri rahat sürer.</b> 8 kanal birden açıkken bile ısınma 9 °C.', '<b>The ULN2803A drives these relays easily.</b> Even with all 8 on, it warms by only 9 °C.')
        })}
        <ul>
          <li>${L('<b>Giriş:</b> dahili 2,7 kΩ seri direnç var; 3,3 V ≈ 0,7 mA base akımı verir. Datasheet 250 mA için bile 2,7 V istiyor, yani 3,3 V lojik yeterli.', '<b>Input:</b> there is an internal 2.7 kΩ series resistor; 3.3 V gives ≈ 0.7 mA of base current. The datasheet asks only 2.7 V even at 250 mA, so 3.3 V logic is enough.')}</li>
          <li>${L('<b>COM:</b> +24 V’a bağla. Kapanışta çıkış ≈ 25 V’ta kenetlenir, 50 V sınırının altında.', '<b>COM:</b> tie it to +24 V. At turn-off the output clamps at ≈ 25 V, below the 50 V rating.')}</li>
          <li>${L('<b>Hızlı bırakma:</b> COM ile +24 V arasına ~18 V zener ekle. Kenet ≈ 43 V olur, hâlâ 50 V altında.', '<b>Faster release:</b> add an ~18 V zener between COM and +24 V. The clamp becomes ≈ 43 V, still below 50 V.')}</li>
        </ul>
        <p>${L('Aynı hesap 24 V / 250 mA solenoid için sonucu değiştirir:', 'The same check for a 24 V / 250 mA solenoid gives a different answer:')}</p>
        ${App.example({
          given: [['I', '250 mA'], ['V<sub>CE(sat)</sub>', L('1,2 V', '1.2 V')], [L('Kanal', 'Channels'), '4'], ['θ<sub>JA</sub>', '65 °C/W']],
          steps: [
            [L('Kanal kaybı', 'Loss per channel'), L('P = 1,2 V · 0,25 A', 'P = 1.2 V · 0.25 A'), L('0,3 W', '0.3 W')],
            [L('4 kanal birden', 'All 4 channels'), L('P = 4 · 0,3 W', 'P = 4 · 0.3 W'), L('1,2 W', '1.2 W')],
            [L('Sıcaklık artışı', 'Temperature rise'), L('ΔT = 1,2 W · 65 °C/W', 'ΔT = 1.2 W · 65 °C/W'), '≈ 78 °C', L('50 °C ortamda sınırda', 'marginal at 50 °C ambient')]
          ],
          result: L('<b>Solenoidler için ULN2803A sınırda.</b> Düşük R<sub>DS(on)</sub>’lu N-MOS kullan: 50 mΩ ile kanal başına 3 mW.', '<b>The ULN2803A is marginal for these solenoids.</b> Use a low-R<sub>DS(on)</sub> N-MOS: 3 mW per channel at 50 mΩ.'),
          level: 'warn'
        })}
      </div></details>
      <p>${L('Sıradaki adım: bu çıkışların arkasındaki transistörü kendin sürmek. <a href="#bjt-drive">BJT sürme</a> ve <a href="#mosfet-drive">MOSFET sürme</a> bölümleri base direncini ve gate sürmeyi hesaplar.', 'Next: driving the transistor behind these outputs yourself. The <a href="#bjt-drive">BJT drive</a> and <a href="#mosfet-drive">MOSFET drive</a> chapters size the base resistor and the gate drive.')}</p>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const V = (v, d) => App.num(v, d == null ? 2 : d) + ' V';
    // flow speed from current: 100 µA → slow, 100 mA → fast
    const rateOf = I => (I < 2e-7 ? 0 : App.clamp(0.3 + 0.45 * Math.log10(I / 1e-4), 0.15, 2.6));
    const show = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };
    const RM = App.reducedMotion;

    /* =================== Lab 1: four output types =================== */
    {
      const lab = root.querySelector('#lab-types');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const openBox = id => `<g id="${id}"><rect class="frame" x="196" y="${id === 'upOpen' ? 66 : 186}" width="68" height="48" rx="4"/><text x="230" y="${id === 'upOpen' ? 95 : 215}" class="sch-t muted" text-anchor="middle">${L('açık', 'open')}</text></g>`;
      const svg = Viz.schematic(fig, 600, 290, `
        <rect class="frame" x="36" y="22" width="268" height="258" rx="6"/>
        <text x="44" y="38" class="sch-t muted">${L('çıkış katı (IC içi)', 'output stage (inside the IC)')}</text>
        ${Sch.box(52, 128, 76, 44, L('Mantık', 'Logic'), '')}
        ${Sch.w([[128, 150], [160, 150]], 'sigw')}
        <g id="upPP">${Sch.vcc(230, 60, 'V_S')}${Sch.pmos(210, 90, '')}${Sch.w([[160, 150], [160, 90], [180, 90]], 'sigw')}${Sch.w([[230, 120], [230, 150]])}</g>
        <g id="upOE">${Sch.vcc(230, 60, 'V_S')}${Sch.npn(210, 90, '')}${Sch.w([[160, 150], [160, 90], [180, 90]], 'sigw')}${Sch.w([[230, 120], [230, 150]])}</g>
        ${openBox('upOpen')}
        <g id="dnN">${Sch.nmos(210, 210, '')}${Sch.w([[160, 150], [160, 210], [180, 210]], 'sigw')}${Sch.w([[230, 150], [230, 180]])}${Sch.gnd(230, 240)}</g>
        <g id="dnOC">${Sch.npn(210, 210, '')}${Sch.w([[160, 150], [160, 210], [180, 210]], 'sigw')}${Sch.w([[230, 150], [230, 180]])}${Sch.gnd(230, 240)}</g>
        ${openBox('dnOpen')}
        <text id="upSt" x="252" y="94" class="sch-t"></text>
        <text id="dnSt" x="252" y="214" class="sch-t"></text>
        ${Sch.w([[230, 150], [470, 150]])}${Sch.dot(230, 150)}${Sch.dot(420, 150)}
        <rect class="pinsq" x="296" y="146" width="8" height="8"/>
        <g id="gPU">${Sch.vcc(420, 60, '')}${Sch.res(420, 90, 0, 'R')}${Sch.w([[420, 120], [420, 150]])}<text id="puT" x="420" y="46" class="sch-t rail" text-anchor="middle"></text></g>
        <g id="gPD">${Sch.w([[420, 150], [420, 180]])}${Sch.res(420, 210, 0, 'R')}${Sch.gnd(420, 240)}</g>
        ${Sch.box(470, 128, 100, 44, L('Alıcı', 'Receiver'), 'CMOS')}
        <text id="voT" x="312" y="140" class="sch-t big"></text>
        <text id="cmdT" x="90" y="194" class="sch-t sig" text-anchor="middle"></text>
        <text id="dirT" x="456" y="272" class="sch-t big" text-anchor="middle"></text>
      `);
      const fA = new Viz.Flow(svg, 'M230,60V150H420V240', { spacing: 15 });   // upper element → R to GND (sourcing)
      const fB = new Viz.Flow(svg, 'M420,60V150H230V240', { spacing: 15 });   // R from V_S → lower element (sinking)
      const $ = s => svg.querySelector(s);

      const RP = 30, RN = 20, RN_OD = 25;
      const iUp = (t, cmd, v, Vs) => {
        if (cmd !== 1) return 0;
        if (t === 'pp') return (Vs - v) / RP;
        if (t === 'oe') return 1e-3 * Math.exp(Math.min(40, (Vs - v - 0.65) / 0.026));
        return 0;
      };
      const iDn = (t, cmd, v) => {
        if (cmd !== 0) return 0;
        if (t === 'pp') return v / RN;
        if (t === 'od') return v / RN_OD;
        if (t === 'oc') return v <= 0.05 ? 0 : Math.min((v - 0.05) / 4, 0.1);
        return 0;
      };
      function solve(t, cmd, R, Vs, pull) {
        const f = v => iUp(t, cmd, v, Vs) + (pull === 'up' ? (Vs - v) / R : -v / R) - iDn(t, cmd, v);
        let a = 0, b = Vs;
        for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
        const v = (a + b) / 2;
        return { v, iR: pull === 'up' ? (Vs - v) / R : v / R, up: iUp(t, cmd, v, Vs), dn: iDn(t, cmd, v) };
      }

      const defPull = { pp: 'down', od: 'up', oc: 'up', oe: 'down' };
      const sType = UI.segmented(ctl, {
        label: L('Çıkış tipi', 'Output type'), value: 'od',
        options: [{ value: 'pp', label: 'Push-pull' }, { value: 'od', label: 'Open-drain' }, { value: 'oc', label: 'Open-collector' }, { value: 'oe', label: 'Open-emitter' }],
        onChange: v => { sPull.set(defPull[v], true); update(); }
      });
      const sPull = UI.segmented(ctl, {
        label: L('Direnç nereye?', 'Resistor goes to'), value: 'up',
        options: [{ value: 'up', label: 'Pull-up → V_S' }, { value: 'down', label: 'Pull-down → GND' }], onChange: update
      });
      const tCmd = UI.toggle(ctl, { label: L('Yazılım pine 1 yazıyor', 'Software writes 1 to the pin'), value: true, onChange: update });
      const tAuto = UI.toggle(ctl, { label: L('Otomatik değiştir (1,2 s)', 'Auto toggle (1.2 s)'), value: !RM });
      const sR = UI.slider(ctl, { label: 'R', min: 100, max: 100000, step: 10, value: 4700, unit: 'Ω', log: true, onInput: update });
      const sV = UI.slider(ctl, { label: 'V<sub>S</sub> (' + L('besleme / pull-up', 'supply / pull-up') + ')', min: 1.8, max: 24, step: 0.1, value: 3.3, fmt: v => V(v, 1), onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'vout', label: L('V<sub>OUT</sub> (şu an)', 'V<sub>OUT</sub> (now)') },
        { key: 'voh', label: L('1 yazınca V<sub>OH</sub>', 'V<sub>OH</sub> when 1') },
        { key: 'vol', label: L('0 yazınca V<sub>OL</sub>', 'V<sub>OL</sub> when 0') },
        { key: 'ir', label: L('Direnç akımı', 'Resistor current') },
        { key: 'pr', label: L('Dirençte güç', 'Power in resistor') },
        { key: 'it', label: L('Transistör', 'Transistor') },
        { key: 'note', label: L('Not', 'Note') }
      ]);

      function update() {
        const t = sType.value, pull = sPull.value, R = sR.value, Vs = sV.value, cmd = tCmd.value ? 1 : 0;
        const s1 = solve(t, 1, R, Vs, pull), s0 = solve(t, 0, R, Vs, pull), s = cmd ? s1 : s0;
        const hasUp = t === 'pp' || t === 'oe', hasDn = t !== 'oe';
        show($('#upPP'), t === 'pp'); show($('#upOE'), t === 'oe'); show($('#upOpen'), !hasUp);
        show($('#dnN'), t === 'pp' || t === 'od'); show($('#dnOC'), t === 'oc'); show($('#dnOpen'), !hasDn);
        show($('#gPU'), pull === 'up'); show($('#gPD'), pull === 'down');
        const upOn = hasUp && cmd === 1, dnOn = hasDn && cmd === 0;
        const st = (el, has, on) => { el.textContent = has ? (on ? 'ON' : 'OFF') : ''; el.setAttribute('class', 'sch-t ' + (on ? 'ok' : 'muted')); };
        st($('#upSt'), hasUp, upOn); st($('#dnSt'), hasDn, dnOn);
        $('#puT').textContent = '+' + V(Vs, 1);
        $('#voT').textContent = 'V_OUT = ' + V(s.v);
        $('#cmdT').textContent = (t === 'od' || t === 'oc') && cmd === 1 ? L('1 → Hi-Z', '1 → Hi-Z') : 'D = ' + cmd;
        fA.rate = pull === 'down' ? rateOf(s.iR) : 0;
        fB.rate = pull === 'up' ? rateOf(s.iR) : 0;
        const iT = Math.max(s.up, s.dn);
        const dirTxt = s.dn > 1e-6 ? L('SINKING: akım pine giriyor', 'SINKING: current flows into the pin')
          : s.up > 1e-6 ? L('SOURCING: akım pinden çıkıyor', 'SOURCING: current flows out of the pin') : L('akım yok', 'no current');
        const dirEl = $('#dirT');
        dirEl.textContent = dirTxt;
        dirEl.setAttribute('class', 'sch-t big ' + (s.dn > 1e-6 || s.up > 1e-6 ? 'cu' : 'muted'));

        ro.set('vout', V(s.v), '');
        const ohOk = s1.v >= 0.7 * Vs, olOk = s0.v <= 0.3 * Vs;
        ro.set('voh', V(s1.v) + (ohOk ? ' ✓' : ' ✗'), ohOk ? 'ok' : 'bad');
        ro.set('vol', V(s0.v) + (olOk ? ' ✓' : ' ✗'), olOk ? 'ok' : 'bad');
        ro.set('ir', App.si(Math.abs(s.iR), 'A'));
        const P = s.iR * s.iR * R;
        ro.set('pr', App.si(P, 'W'), P > 0.25 ? 'bad' : P > 0.1 ? 'warn' : '');
        const pinLimit = (t === 'pp' || t === 'od') ? 0.02 : 0.1;
        ro.set('it', iT > 1e-6 ? App.si(iT, 'A') + ' · ' + (s.dn > s.up ? 'sink' : 'source') : (hasUp && hasDn ? '—' : L('kapalı (Hi-Z)', 'off (Hi-Z)')),
          iT > pinLimit * 1.25 ? 'bad' : iT > pinLimit ? 'warn' : '');
        let note = '', ns = '';
        if ((t === 'od' || t === 'oc') && pull === 'down') { note = L('Hiç HIGH olamaz: pull-up gerekli', 'Can never go HIGH: needs a pull-up'); ns = 'bad'; }
        else if (t === 'oe' && pull === 'up') { note = L('Hiç LOW olamaz: pull-down gerekli', 'Can never go LOW: needs a pull-down'); ns = 'bad'; }
        else if ((t === 'pp' || t === 'od') && iT > 0.02) { note = L('MCU pin akımı ~20 mA’yı aşıyor', 'MCU pin current exceeds ~20 mA'); ns = 'bad'; }
        else if (t === 'od' && Vs > 5.5) { note = L('MCU pini dayanmaz: harici N-MOS (2N7002, 60 V)', 'An MCU pin won’t survive: external N-MOS (2N7002, 60 V)'); ns = 'warn'; }
        else if (t === 'od' && Vs > 3.6) { note = L('Yalnızca 5V-tolerant (FT) pin, ≤ 5,5 V', 'Only a 5 V-tolerant (FT) pin, ≤ 5.5 V'); ns = 'warn'; }
        else if (t === 'pp' && Vs > 5.5) { note = L('Lojik IC’ler genelde ≤ 5,5 V çalışır', 'Logic ICs usually run at ≤ 5.5 V'); ns = 'warn'; }
        else if (t === 'oe') { note = L('V<sub>OH</sub> = V<sub>S</sub> − V<sub>BE</sub> ≈ ', 'V<sub>OH</sub> = V<sub>S</sub> − V<sub>BE</sub> ≈ ') + V(Vs - s1.v) + L(' kayıp', ' lost'); ns = ohOk ? '' : 'warn'; }
        else if (t === 'oc') { note = L('V<sub>CE(sat)</sub> + R’nin gücü; V<sub>CEO</sub>’ya dikkat', 'V<sub>CE(sat)</sub> + resistor power; mind V<sub>CEO</sub>'); }
        else if (t === 'pp') { note = pull === 'up' ? L('Push-pull’a pull-up gereksiz; 0’da boşa akım', 'A pull-up is pointless on push-pull; wastes current at 0') : L('Direnç yalnızca yük', 'The resistor is just a load'); ns = pull === 'up' ? 'warn' : ''; }
        else note = L('Seviye pull-up’tan gelir', 'The level comes from the pull-up');
        ro.set('note', note, ns);
      }
      let acc = 0;
      App.onFrame(dt => { if (!tAuto.value) return; acc += dt; if (acc > 1.2) { acc = 0; tCmd.set(!tCmd.value); } });
      update();
    }

    /* =================== Lab 2: wired-AND with three devices =================== */
    {
      const lab = root.querySelector('#lab-wired');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const xs = [180, 320, 460];
      const dev = (x, i) => `
        <rect class="frame" x="${x - 95}" y="122" width="${i === 2 ? 180 : 130}" height="166" rx="5"/>
        <text x="${x - 88}" y="140" class="sch-t muted">${L('Cihaz', 'Device')} ${i + 1}</text>
        ${Sch.nmos(x - 20, 230, '')}${Sch.gnd(x, 260)}
        ${Sch.w([[x - 80, 230], [x - 50, 230]], 'sigw')}
        <text id="st${i}" x="${x + 8}" y="${i === 2 ? 246 : 226}" class="sch-t"></text>`;
      const svg = Viz.schematic(fig, 600, 300, `
        ${Sch.vcc(70, 40, '3,3 V')}${Sch.res(70, 70, 0, 'R_P')}
        ${Sch.w([[70, 100], [560, 100]])}
        <text x="120" y="92" class="sch-t">${L('ortak hat (SDA / INT̅ / RESET̅)', 'shared line (SDA / INT̅ / RESET̅)')}</text>
        <text id="lineV" x="575" y="92" class="sch-t big" text-anchor="end"></text>
        ${dev(xs[0], 0)}${Sch.w([[xs[0], 100], [xs[0], 200]])}${Sch.dot(xs[0], 100)}
        ${dev(xs[1], 1)}${Sch.w([[xs[1], 100], [xs[1], 200]])}${Sch.dot(xs[1], 100)}
        ${dev(xs[2], 2)}${Sch.w([[500, 100], [500, 190], [460, 190], [460, 200]])}${Sch.dot(500, 100)}
        <g id="d3pp">${Sch.pmos(440, 150, '')}${Sch.w([[460, 120], [460, 112]])}<path class="wire" d="M450,112H470"/>${Sch.w([[460, 180], [460, 190]])}${Sch.dot(460, 190)}
          ${Sch.w([[395, 230], [395, 150], [410, 150]], 'sigw')}<text x="404" y="118" class="sch-t" text-anchor="end">V_DD</text>
          <text id="st2p" x="468" y="150" class="sch-t"></text></g>
        <text id="conf" x="300" y="296" class="sch-t bad big" text-anchor="middle"></text>
      `);
      const $ = s => svg.querySelector(s);
      const pathTo = i => i < 2 ? `M70,40V100H${xs[i]}V260` : 'M70,40V100H500V190H460V260';
      const fPU = [0, 1, 2].map(i => new Viz.Flow(svg, pathTo(i), { spacing: 15 }));
      const fC = [0, 1].map(i => new Viz.Flow(svg, `M460,120V190H500V100H${xs[i]}V260`, { spacing: 13, cls: 'flow bad' }));
      const plotBox = App.h('div'); fig.appendChild(plotBox);
      const p = new Viz.Plot(plotBox, {
        w: 600, h: 200, x: [-6, 0], y: [0, 3.6], yTicks: [0, 1, 2, 3],
        xLabel: L('zaman (s)', 'time (s)'), yLabel: L('hat (V)', 'line (V)'), xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const Vdd = 3.3, Rp = 4700, RnOn = 25, RpOn = 30;
      p.rect('hiZ', -6, 0.7 * Vdd, 0, 3.6, 'ok'); p.rect('loZ', -6, 0, 0, 0.3 * Vdd, 'sig');
      p.hline('vih', 0.7 * Vdd, ''); p.hline('vil', 0.3 * Vdd, '');
      p.text('hT', -5.9, 3.3, 'HIGH', 'ok'); p.text('lT', -5.9, 0.15, 'LOW', 'sig'); p.text('uT', -5.9, 1.55, L('belirsiz', 'indeterminate'), 'muted');

      const tg = [0, 1, 2].map(i => UI.toggle(ctl, { label: L(`Cihaz ${i + 1} hattı LOW’a çeker`, `Device ${i + 1} pulls the line LOW`), value: false, onChange: () => { if (!byAuto) tAuto.set(false, true); update(); } }));
      const tPP = UI.toggle(ctl, { label: L('Cihaz 3 push-pull olsun (hata!)', 'Make device 3 push-pull (mistake!)'), value: false, onChange: () => { tAuto.set(false, true); update(); } });
      const tAuto = UI.toggle(ctl, { label: L('Otomatik senaryo', 'Auto scenario'), value: !RM });
      const ro = UI.readouts(ctl, [
        { key: 'v', label: L('Hat gerilimi', 'Line voltage') }, { key: 'lv', label: L('Okunan seviye', 'Level read') },
        { key: 'ip', label: L('Pull-up akımı', 'Pull-up current') }, { key: 'ic', label: L('Çakışma akımı', 'Contention current') }
      ]);
      let byAuto = false, lineV = Vdd;
      function update() {
        const low = tg.map(t => t.value), pp = tPP.value;
        const p3high = pp && !low[2];
        const n = low.filter(Boolean).length;
        const G = 1 / Rp + (p3high ? 1 / RpOn : 0) + n / RnOn;
        const v = Vdd * (1 / Rp + (p3high ? 1 / RpOn : 0)) / G;
        lineV = v;
        const ip = (Vdd - v) / Rp, ic = p3high && n ? (Vdd - v) / RpOn : 0;
        show($('#d3pp'), pp);
        for (let i = 0; i < 3; i++) {
          const el = $('#st' + i);
          el.textContent = low[i] ? 'ON' : 'OFF'; el.setAttribute('class', 'sch-t ' + (low[i] ? 'ok' : 'muted'));
          fPU[i].rate = low[i] ? rateOf(ip / n) : 0;
        }
        const s2 = $('#st2p'); s2.textContent = p3high ? 'ON' : 'OFF'; s2.setAttribute('class', 'sch-t ' + (p3high ? 'bad' : 'muted'));
        fC[0].rate = ic && low[0] ? rateOf(ic / n) : 0;
        fC[1].rate = ic && low[1] ? rateOf(ic / n) : 0;
        $('#lineV').textContent = V(v);
        $('#conf').textContent = ic ? L('ÇAKIŞMA: push-pull HIGH süren çıkış, LOW çeken cihazla kısa devre!', 'CONTENTION: a push-pull output driving HIGH is shorted by the device pulling LOW!') : '';
        const lvl = v <= 0.3 * Vdd ? 'LOW' : v >= 0.7 * Vdd ? 'HIGH' : L('BELİRSİZ', 'UNDEFINED');
        ro.set('v', V(v), ic ? 'bad' : '');
        ro.set('lv', lvl + (n && !ic ? L(' (biri çekiyor)', ' (someone pulls)') : ''), lvl === 'HIGH' || lvl === 'LOW' ? 'ok' : 'bad');
        ro.set('ip', App.si(ip, 'A'));
        ro.set('ic', ic ? App.si(ic, 'A') : '0', ic ? 'bad' : 'ok');
      }
      const seq = [[0, 0, 0], [1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 0], [0, 0, 1], [1, 0, 1]];
      let k = 0, acc = 0, tNow = 0, sampT = 0;
      const hist = [];
      App.onFrame(dt => {
        tNow += dt;
        if (tAuto.value) {
          acc += dt;
          if (acc > 1.1) {
            acc = 0; k = (k + 1) % seq.length;
            byAuto = true; seq[k].forEach((b, i) => tg[i].set(!!b, true)); byAuto = false; update();
          }
        }
        sampT += dt;
        if (sampT > 0.04) { sampT = 0; hist.push([tNow, lineV]); while (hist.length && hist[0][0] < tNow - 6.2) hist.shift(); }
        // square edges: add the previous value just before a change
        const pts = [];
        hist.forEach((h, i) => { if (i && h[1] !== hist[i - 1][1]) pts.push([h[0] - tNow, hist[i - 1][1]]); pts.push([h[0] - tNow, h[1]]); });
        if (pts.length) pts.push([0, lineV]);
        p.line('v', pts, 'ch1');
      });
      update();
    }

    /* =================== Lab 3: I²C rise time =================== */
    {
      const lab = root.querySelector('#lab-i2c');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p = new Viz.Plot(fig, {
        w: 600, h: 280, x: [0, 5], y: [0, 5.6], yTicks: [0, 1, 2, 3, 4, 5],
        xLabel: L('zaman (µs)', 'time (µs)'), yLabel: L('hat (V)', 'bus (V)'), yFmt: v => App.num(v, 0)
      });
      const p2box = App.h('div'); fig.appendChild(p2box);
      const p2 = new Viz.Plot(p2box, {
        w: 600, h: 220, x: [100, 100000], y: [10, 10000], logX: true, logY: true, yTicks: [100, 1000, 10000],
        xLabel: L('pull-up direnci R (Ω)', 'pull-up resistor R (Ω)'), yLabel: 't_r (ns)',
        xFmt: v => App.si(v, 'Ω', 2), yFmt: v => App.si(v, '', 2)
      });
      const modes = { 100000: 1000e-9, 400000: 300e-9, 1000000: 120e-9 };
      const c1 = App.h('div', { style: 'display:grid;gap:12px' }), c2 = App.h('div', { style: 'display:grid;gap:12px' }), c3 = App.h('div', { style: 'display:grid;gap:12px' });
      ctl.append(c1, c2, c3);
      const sR = UI.slider(c1, { label: L('Pull-up R', 'Pull-up R'), min: 300, max: 22000, step: 10, value: 4700, unit: 'Ω', log: true, onInput: update });
      const sC = UI.slider(c1, { label: L('Bus kapasitansı C<sub>b</sub>', 'Bus capacitance C<sub>b</sub>'), min: 10e-12, max: 400e-12, step: 5e-12, value: 200e-12, unit: 'F', onInput: update });
      const sV = UI.segmented(c2, { label: 'V<sub>PU</sub>', value: 3.3, options: [{ value: 1.8, label: App.num(1.8, 1) + ' V' }, { value: 3.3, label: App.num(3.3, 1) + ' V' }, { value: 5, label: '5 V' }], onChange: update });
      const sF = UI.segmented(c2, { label: L('SCL saati', 'SCL clock'), value: 400000, options: [{ value: 100000, label: '100 kHz' }, { value: 400000, label: '400 kHz' }, { value: 1000000, label: '1 MHz' }], onChange: update });
      const sI = UI.segmented(c2, { label: 'I<sub>OL</sub> (' + L('sink sınırı', 'sink limit') + ')', value: 0.003, options: [{ value: 0.003, label: '3 mA (Sm/Fm)' }, { value: 0.02, label: '20 mA (Fm+)' }], onChange: update });
      const ro = UI.readouts(c3, [
        { key: 'tr', label: 't<sub>r</sub> = ' + App.num(0.8473, 4) + '·R·C' }, { key: 'lim', label: L('Mod sınırı', 'Mode limit') },
        { key: 'win', label: 'R<sub>min</sub> … R<sub>max</sub>' }, { key: 'vol', label: 'V<sub>OL</sub>' },
        { key: 'pl', label: L('LOW iken akım / güç', 'Current / power while LOW') }, { key: 'ver', label: L('Sonuç', 'Verdict') }
      ]);
      let wave = [], T2 = 1;
      function update() {
        const R = sR.value, C = sC.value, Vp = sV.value, f = sF.value, Iol = sI.value;
        const T = 1 / f, half = T / 2, Ron = 0.4 / Iol;
        const tauR = R * C, tauF = (R * Ron / (R + Ron)) * C, vLow = Vp * Ron / (R + Ron);
        // warm up one period, then record two periods (µs)
        let v = vLow; const pts = [], N = 160;
        for (let per = 0; per < 3; per++) {
          for (let h = 0; h < 2; h++) {
            const high = h === 1, v0 = v;
            for (let i = 0; i <= N; i++) {
              const t = half * i / N;
              v = high ? Vp + (v0 - Vp) * Math.exp(-t / tauR) : vLow + (v0 - vLow) * Math.exp(-t / tauF);
              if (per > 0) pts.push([((per - 1) * T + h * half + t) * 1e6, v]);
            }
          }
        }
        wave = pts; T2 = 2 * T * 1e6;
        p.setRange({ x: [0, T2] });
        Object.keys(p.items).forEach(k => p.remove(k));
        const vOL = vLow;
        p.rect('band', 0, 0.3 * Vp, T2, 0.7 * Vp, 'warn');
        p.hline('vih', 0.7 * Vp, ''); p.hline('vil', 0.3 * Vp, '');
        p.text('vihT', T2, 0.7 * Vp, App.num(0.7, 1) + '·V', 'muted', 'end', -4, -4);
        p.text('vilT', T2, 0.3 * Vp, App.num(0.3, 1) + '·V', 'muted', 'end', -4, 13);
        const clk = [];
        for (let i = 0; i < 4; i++) { const a = i * half * 1e6, b = (i + 1) * half * 1e6, lv = i % 2 ? Vp : 0; clk.push([a, lv], [b, lv]); }
        p.line('clk', clk, 'sig dash thin');
        p.line('bus', pts, 'ch1');
        // first rising edge at t = half
        const vStart = pts[Math.floor(pts.length / 4) - 1][1];
        const t30 = vStart < 0.3 * Vp ? tauR * Math.log((Vp - vStart) / (0.7 * Vp)) : 0;
        const t70 = vStart < 0.7 * Vp ? tauR * Math.log((Vp - vStart) / (0.3 * Vp)) : 0;
        const reach = t70 < half;
        if (reach && t70 > t30) {
          p.vline('a', (half + t30) * 1e6, 'cu'); p.vline('b', (half + t70) * 1e6, 'cu');
          p.text('trT', (half + t70) * 1e6, Vp * 0.5, 't_r', 'cu big', 'start', 5, 0);
        }
        p.text('ttl', 0.01 * T2, Vp + 0.35 > 5.5 ? 5.35 : Vp + 0.35, 'SCL', 'muted');
        const tr = 0.8473 * R * C, lim = modes[f];
        const Rmin = (Vp - 0.4) / Iol, Rmax = lim / (0.8473 * C);
        ro.set('tr', App.si(tr, 's'), tr <= lim ? 'ok' : 'bad');
        ro.set('lim', App.si(lim, 's') + ' (' + (f === 100000 ? 'Sm' : f === 400000 ? 'Fm' : 'Fm+') + ')');
        ro.set('win', App.si(Rmin, 'Ω', 3) + ' … ' + App.si(Rmax, 'Ω', 3), Rmax >= Rmin ? 'ok' : 'bad');
        ro.set('vol', V(vOL), vOL <= 0.4 + 1e-9 ? 'ok' : 'bad');
        const iL = (Vp - vOL) / R;
        ro.set('pl', App.si(iL, 'A') + ' / ' + App.si((Vp - vOL) * iL, 'W'), iL > Iol * 1.0001 ? 'bad' : '');
        let ver, vs;
        if (!reach) { ver = L('Hat HIGH’a hiç ulaşmıyor!', 'Bus never reaches HIGH!'); vs = 'bad'; }
        else if (vOL > 0.4 + 1e-9) { ver = L('R çok küçük: V<sub>OL</sub> &gt; 0,4 V', 'R too small: V<sub>OL</sub> &gt; 0.4 V'); vs = 'bad'; }
        else if (tr > lim) { ver = L('R çok büyük: kenar yavaş', 'R too large: edge too slow'); vs = 'bad'; }
        else if (Rmax < Rmin) { ver = L('Pencere yok', 'No window'); vs = 'bad'; }
        else { ver = L('Uygun ✓', 'OK ✓'); vs = 'ok'; }
        ro.set('ver', ver, vs);
        // resistor window plot
        const Cn = C;
        p2.line('tr', Viz.sample(lr => [Math.pow(10, lr), 0.8473 * Math.pow(10, lr) * Cn * 1e9], 2, 5, 60).map(q => q[1]), 'ch1');
        p2.hline('lim', lim * 1e9, 'bad');
        p2.text('limT', 120, lim * 1e9, L('t_r sınırı', 't_r limit'), 'bad', 'start', 0, -5);
        p2.vline('rmin', Rmin, 'warn');
        p2.text('rminT', Rmin, 6500, 'R_min', 'warn', 'end', -4, 0);
        if (Rmax > Rmin) { p2.rect('win', Rmin, 10, Math.min(Rmax, 100000), lim * 1e9, 'ok'); p2.hide('win', false); }
        else p2.hide('win', true);
        p2.dot('r', R, tr * 1e9, tr <= lim && R >= Rmin ? 'ok' : 'bad');
      }
      let ph = 0;
      App.onFrame(dt => {
        if (!wave.length) return;
        if (!RM) ph = (ph + dt / 3) % 1;
        const tt = ph * T2;
        const i = Math.min(wave.length - 1, Math.max(0, wave.findIndex(q => q[0] >= tt)));
        p.dot('scope', wave[i][0], wave[i][1], 'acc', 4);
      });
      update();
    }

    /* =================== Lab 4: open-collector level shift to a 24 V PLC input =================== */
    {
      const lab = root.querySelector('#lab-ls');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 290, `
        ${Sch.box(20, 126, 94, 48, 'MCU', '3,3 V GPIO')}
        ${Sch.w([[114, 150], [150, 150]], 'sigw')}${Sch.res(180, 150, 90, 'R_B')}
        <g id="lsN">${Sch.npn(240, 150, '')}<text x="278" y="168" class="sch-t muted">MMBT3904</text></g>
        <g id="lsM">${Sch.nmos(240, 150, '')}<text x="278" y="168" class="sch-t muted">BSS138</text></g>
        ${Sch.gnd(260, 180)}
        ${Sch.vcc(260, 45, '')}<text id="vsT" x="260" y="31" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.res(260, 75, 0, 'R_PU')}${Sch.w([[260, 105], [260, 120]])}${Sch.dot(260, 112)}
        ${Sch.w([[260, 112], [520, 112], [520, 128]])}
        <rect class="frame" x="430" y="56" width="160" height="226" rx="6"/>
        <text x="440" y="74" class="sch-t muted">PLC DI (Type 1/3)</text>
        <rect class="pinsq" x="426" y="108" width="8" height="8"/><text x="440" y="104" class="sch-t">I0.0</text>
        ${Sch.res(520, 158, 0, 'R_in')}${Sch.led(520, 218, 0, '', 'lsLed')}${Sch.gnd(520, 248)}
        <text id="plcT" x="548" y="226" class="sch-t big"></text>
        <text id="vinT" x="300" y="104" class="sch-t big"></text>
        <text id="pinT" x="67" y="196" class="sch-t sig" text-anchor="middle"></text>
        <text id="logT" x="20" y="276" class="sch-t muted"></text>
      `);
      const $ = s => svg.querySelector(s);
      const fOn = new Viz.Flow(svg, 'M260,45V180', { spacing: 14 });
      const fOff = new Viz.Flow(svg, 'M260,45V112H520V248', { spacing: 14 });
      const fB = new Viz.Flow(svg, 'M114,150H210', { cls: 'flow e', spacing: 12, speed: 50 });
      const ledGlow = $('#lsLed .led-glow');
      const plotBox = App.h('div'); fig.appendChild(plotBox);
      const p = new Viz.Plot(plotBox, {
        w: 600, h: 220, x: [220, 47000], y: [0, 32], logX: true, yTicks: [0, 5, 11, 15, 24, 30],
        xLabel: 'R_PU (Ω)', yLabel: L('V_IN (V), MCU = 0', 'V_IN (V), MCU = 0'), xFmt: v => App.si(v, 'Ω', 2), yFmt: v => App.num(v, 0)
      });
      p.rect('onZ', 220, 15, 47000, 32, 'ok'); p.rect('undZ', 220, 5, 47000, 15, 'warn');
      p.text('onT', 250, 29, 'ON (Type 1 ≥ 15 V)', 'ok'); p.text('undT', 250, 9.5, L('belirsiz', 'indeterminate'), 'warn'); p.text('offT', 250, 2, 'OFF ≤ 5 V', 'muted');

      const sDev = UI.segmented(ctl, { label: L('Transistör', 'Transistor'), value: 'npn', options: [{ value: 'npn', label: 'NPN (MMBT3904)' }, { value: 'nmos', label: 'N-MOS (BSS138)' }], onChange: update });
      const tPin = UI.toggle(ctl, { label: L('MCU pini HIGH', 'MCU pin HIGH'), value: false, onChange: () => { update(); } });
      const tAuto = UI.toggle(ctl, { label: L('Otomatik değiştir', 'Auto toggle'), value: !RM });
      const sR = UI.slider(ctl, { label: 'R<sub>PU</sub>', min: 220, max: 47000, step: 10, value: 2200, unit: 'Ω', log: true, onInput: update });
      const sI = UI.slider(ctl, { label: L('PLC giriş akımı @ 24 V', 'PLC input current @ 24 V'), min: 0.002, max: 0.015, step: 0.0005, value: 0.006, unit: 'A', onInput: update });
      const sV = UI.slider(ctl, { label: 'V<sub>S</sub>', min: 18, max: 30, step: 0.5, value: 24, fmt: v => V(v, 1), onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'vin', label: L('PLC giriş gerilimi', 'PLC input voltage') }, { key: 'iin', label: L('PLC giriş akımı', 'PLC input current') },
        { key: 'plc', label: L('PLC görüyor', 'PLC sees') }, { key: 'vh', label: L('MCU = 0 iken (HIGH)', 'With MCU = 0 (HIGH)') },
        { key: 'it', label: L('MCU = 1: transistör akımı', 'MCU = 1: transistor current') }, { key: 'pr', label: L('MCU = 1: R<sub>PU</sub> gücü', 'MCU = 1: R<sub>PU</sub> power') }
      ]);
      const plcState = (v, i) => v >= 15 && i >= 0.002 ? ['ON', 'ok'] : v >= 11 && i >= 0.002 ? [L('ON yalnız Type 3', 'ON only Type 3'), 'warn'] : v <= 5 ? ['OFF', ''] : [L('BELİRSİZ', 'UNDEFINED'), 'bad'];
      function update() {
        const dev = sDev.value, R = sR.value, Vs = sV.value, Rin = 24 / sI.value, pin = tPin.value;
        show($('#lsN'), dev === 'npn'); show($('#lsM'), dev === 'nmos');
        const vHigh = Vs * Rin / (R + Rin), iHigh = vHigh / Rin;
        // transistor on
        let vce, sat = true;
        const icNeed = Vs / R;
        if (dev === 'npn') {
          const ib = (3.3 - 0.75) / 1000, icMax = 30 * ib;
          if (icNeed > icMax) { sat = false; vce = Vs - icMax * R; } else vce = 0.05 + icNeed * 2.5;
        } else vce = Vs * 1.3 / (R + 1.3);
        const ic = (Vs - vce) / R;
        const vin = pin ? vce : vHigh, iin = vin / Rin;
        const [ps, pst] = plcState(vin, iin);
        const [hs, hst] = plcState(vHigh, iHigh);
        $('#vsT').textContent = '+' + V(Vs, 1);
        $('#vinT').textContent = 'V_IN = ' + V(vin, 1);
        $('#pinT').textContent = pin ? 'HIGH' : 'LOW';
        $('#plcT').textContent = ps;
        $('#plcT').setAttribute('class', 'sch-t big ' + (pst || 'muted'));
        $('#logT').textContent = L('Mantık ters: MCU 1 → transistör ON → PLC OFF', 'Logic inverts: MCU 1 → transistor ON → PLC OFF');
        ledGlow.style.opacity = ps === 'ON' ? 0.9 : pst === 'warn' ? 0.5 : 0;
        fOn.rate = pin ? rateOf(ic) : 0;
        fOff.rate = pin ? 0 : rateOf(iHigh);
        fB.rate = pin ? 0.6 : 0;
        ro.set('vin', V(vin, 2));
        ro.set('iin', App.si(iin, 'A'));
        ro.set('plc', ps, pst);
        ro.set('vh', V(vHigh, 1) + ' → ' + hs, hst || 'bad');
        ro.set('it', App.si(ic, 'A') + (sat ? '' : L(' · doyumda değil!', ' · not saturated!')), sat ? '' : 'bad');
        const P = (Vs - vce) * ic;
        ro.set('pr', App.si(P, 'W') + (P > 0.125 ? L(' (≥ 0,25 W direnç)', ' (≥ 0.25 W resistor)') : ''), P > 0.5 ? 'bad' : P > 0.125 ? 'warn' : 'ok');
        p.line('vh', Viz.sample(lr => Vs * Rin / (Math.pow(10, lr) + Rin), Math.log10(220), Math.log10(47000), 80).map(q => [Math.pow(10, q[0]), q[1]]), 'ch1');
        p.vline('rx', R, 'cu');
        p.dot('r', R, vHigh, hst === 'ok' ? 'ok' : 'bad');
      }
      let acc = 0;
      App.onFrame(dt => { if (!tAuto.value) return; acc += dt; if (acc > 1.6) { acc = 0; tPin.set(!tPin.value); } });
      update();
    }

    /* =================== Figure: ULN2803A relay =================== */
    {
      const fig = root.querySelector('#fig-uln .lab-fig');
      const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
      const left = App.h('div'), right = App.h('div'); grid.append(left, right);
      const svg = Viz.schematic(left, 420, 260, `
        ${Sch.vcc(300, 30, '+24 V')}${Sch.w([[300, 30], [300, 50]])}${Sch.dot(300, 40)}
        ${Sch.ind(300, 80, 0, L('K1 bobin', 'K1 coil'))}
        ${Sch.w([[300, 110], [300, 150]])}${Sch.dot(300, 130)}
        ${Sch.w([[300, 130], [380, 130], [380, 120]])}
        ${Sch.diode(380, 90, 180, '')}
        ${Sch.w([[380, 60], [380, 40], [300, 40]])}
        <text x="388" y="56" class="sch-t">COM</text><text x="292" y="144" class="sch-t" text-anchor="end">OUT</text>
        ${Sch.npn(280, 180, '')}${Sch.gnd(300, 210)}
        ${Sch.res(220, 180, 90, '2,7 kΩ')}
        ${Sch.box(26, 158, 94, 44, 'MCU', '3,3 V')}
        ${Sch.w([[120, 180], [190, 180]], 'sigw')}
        <text x="210" y="250" class="sch-t muted" text-anchor="middle">ULN2803A ${L('(1 kanal, basitleştirilmiş)', '(1 channel, simplified)')}</text>
        <text id="ulnPh" x="20" y="30" class="sch-t big"></text>
      `);
      const fOn = new Viz.Flow(svg, 'M300,30V210', { spacing: 14 });
      const fLoop = new Viz.Flow(svg, 'M300,40V130H380V40H300', { spacing: 14 });
      const fB = new Viz.Flow(svg, 'M120,180H250', { cls: 'flow e', spacing: 12, speed: 50 });
      const ph = svg.querySelector('#ulnPh');
      const p = new Viz.Plot(right, {
        w: 420, h: 260, x: [0, 10], y: [0, 30], yTicks: [0, 10, 20, 24, 30],
        xLabel: L('zaman (ms)', 'time (ms)'), yLabel: 'V / mA', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const Vs = 24, Rc = 1100, tau = 1 / 1100 * 1000, Vsat = 0.8, Vf = 0.8, I0 = (Vs - Vsat) / Rc;
      const I1 = I0 * (1 - Math.exp(-5 / tau));
      const iAt = t => t < 5 ? I0 * (1 - Math.exp(-t / tau)) : Math.max(0, (I1 + Vf / Rc) * Math.exp(-(t - 5) / tau) - Vf / Rc);
      const vAt = t => t < 5 ? Vsat : (iAt(t) > 1e-5 ? Vs + Vf : Vs);
      p.rect('onR', 0, 0, 5, 30, 'sig');
      p.line('i', Viz.sample(t => iAt(t) * 1000, 0, 10, 300), 'cu');
      const vp = []; for (let i = 0; i <= 400; i++) { const t = i / 40; vp.push([t, vAt(t)]); }
      p.line('v', vp, 'ch1');
      p.text('iT', 1.2, 18, 'I_coil (mA)', 'cu'); p.text('vT', 6.2, 27.6, 'V_OUT (V)', 'warn');
      p.text('onT', 0.2, 2.6, L('MCU = 1', 'MCU = 1'), 'sig'); p.text('offT', 5.2, 2.6, L('MCU = 0', 'MCU = 0'), 'muted');
      let t = 0;
      App.onFrame(dt => {
        if (!RM) t = (t + dt * 2.5) % 10;
        const i = iAt(t), on = t < 5;
        fOn.rate = on ? rateOf(i) : 0;
        fLoop.rate = !on && i > 2e-4 ? rateOf(i) : 0;
        fB.rate = on ? 0.6 : 0;
        ph.textContent = on ? L('İLETİM: bobin akımı artıyor', 'ON: coil current builds up') : (i > 2e-4 ? L('KAPALI: akım COM diyotunda dönüyor', 'OFF: current circulates via COM diode') : L('KAPALI: enerji bitti', 'OFF: energy gone'));
        ph.setAttribute('class', 'sch-t big ' + (on ? 'cu' : i > 2e-4 ? 'warn' : 'muted'));
        p.vline('cur', t, 'cu solid');
        p.dot('id', t, i * 1000);
      });
    }

    /* =================== Lab 5: 3-wire sensors and PLC input =================== */
    {
      const lab = root.querySelector('#lab-plc');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 300, `
        <g id="tgt"><rect class="tgt" x="4" y="122" width="26" height="56" rx="2"/><text x="17" y="196" class="sch-t muted" text-anchor="middle">${L('metal', 'metal')}</text></g>
        <rect class="frame" x="40" y="40" width="160" height="230" rx="6"/>
        <text id="senT" x="48" y="58" class="sch-t big"></text>
        ${Sch.box(44, 136, 30, 28, '', '')}<text x="59" y="154" class="sch-t" text-anchor="middle">IC</text>
        ${Sch.w([[59, 136], [59, 70]])}${Sch.w([[59, 164], [59, 240]])}
        ${Sch.w([[74, 150], [80, 150]], 'sigw')}
        <g id="sPNP">${Sch.pnp(110, 150, '')}${Sch.w([[130, 120], [130, 70]])}${Sch.dot(130, 70)}${Sch.w([[130, 180], [160, 180], [160, 155], [200, 155]])}</g>
        <g id="sNPN">${Sch.npn(110, 150, '')}${Sch.w([[130, 180], [130, 240]])}${Sch.dot(130, 240)}${Sch.w([[130, 120], [160, 120], [160, 155], [200, 155]])}</g>
        <circle id="senLed" class="ind" cx="185" cy="54" r="6"/>
        ${Sch.w([[59, 70], [400, 70]], 'hot')}${Sch.w([[200, 155], [400, 155]], 'sigw')}${Sch.w([[59, 240], [400, 240]], 'rail0')}
        <text x="206" y="64" class="sch-t">BN ${L('(kahverengi)', '(brown)')}</text>
        <text x="206" y="149" class="sch-t">BK ${L('(siyah)', '(black)')}</text>
        <text x="206" y="234" class="sch-t">BU ${L('(mavi)', '(blue)')}</text>
        ${Sch.vcc(300, 70, '')}<text id="vsT" x="316" y="60" class="sch-t rail"></text>${Sch.dot(300, 70)}
        ${Sch.gnd(300, 240)}<text x="312" y="262" class="sch-t">0 V</text>
        <g id="short">${Sch.w([[340, 155], [340, 240]], 'shortw')}<text x="346" y="200" class="sch-t bad">${L('kısa devre', 'short')}</text></g>
        <rect class="frame" x="400" y="40" width="190" height="230" rx="6"/>
        <text x="410" y="58" class="sch-t muted">PLC</text>
        <circle id="plcLed" class="ind" cx="572" cy="54" r="6"/><text id="plcT" x="560" y="58" class="sch-t big" text-anchor="end"></text>
        <rect class="pinsq" x="396" y="66" width="8" height="8"/><text x="410" y="88" class="sch-t">L+</text>
        <rect class="pinsq" x="396" y="151" width="8" height="8"/><text x="410" y="149" class="sch-t">I0.0</text>
        <rect class="pinsq" x="396" y="236" width="8" height="8"/><text x="410" y="234" class="sch-t">M</text>
        <g id="inSink">${Sch.w([[400, 155], [470, 155], [470, 165]])}${Sch.res(470, 195, 0, 'R_in')}${Sch.w([[470, 225], [470, 240], [400, 240]])}<text x="484" y="226" class="sch-t muted">sink input</text></g>
        <g id="inSrc">${Sch.w([[400, 70], [470, 70], [470, 82]])}${Sch.res(470, 112, 0, 'R_in')}${Sch.w([[470, 142], [470, 155], [400, 155]])}<text x="484" y="140" class="sch-t muted">source input</text></g>
        <text id="verT" x="300" y="292" class="sch-t big" text-anchor="middle"></text>
      `);
      const $ = s => svg.querySelector(s);
      const flows = {
        pnpOn: new Viz.Flow(svg, 'M300,70H130V180H160V155H470V240H300', { spacing: 15 }),
        pnpSh: new Viz.Flow(svg, 'M300,70H130V180H160V155H340V240H300', { spacing: 13, cls: 'flow bad' }),
        npnOn: new Viz.Flow(svg, 'M300,70H470V155H160V120H130V240H300', { spacing: 15 }),
        npnSh: new Viz.Flow(svg, 'M300,70H470V155H340V240H300', { spacing: 13, cls: 'flow bad' })
      };
      const sT = UI.segmented(ctl, { label: L('Sensör tipi', 'Sensor type'), value: 'pnp', options: [{ value: 'pnp', label: 'PNP (sourcing)' }, { value: 'npn', label: 'NPN (sinking)' }], onChange: update });
      const tTg = UI.toggle(ctl, { label: L('Nesne algılanıyor', 'Object detected'), value: true, onChange: () => { if (!byAuto) tAuto.set(false, true); update(); } });
      const tF = UI.toggle(ctl, { label: L('Arıza: BK teli gövdeye (0 V) kısa devre', 'Fault: BK wire shorted to chassis (0 V)'), value: false, onChange: update });
      const tAuto = UI.toggle(ctl, { label: L('Nesne gelip gitsin', 'Object comes and goes'), value: !RM });
      const sV = UI.slider(ctl, { label: 'V<sub>S</sub> (' + L('24 V hattı', '24 V rail') + ')', min: 18, max: 30, step: 0.5, value: 24, fmt: v => V(v, 1), onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'vin', label: L('Giriş gerilimi', 'Input voltage') }, { key: 'iin', label: L('Giriş akımı', 'Input current') },
        { key: 'plc', label: L('PLC görüyor', 'PLC sees') }, { key: 'ok', label: L('Değerlendirme', 'Assessment') }
      ]);
      const Rin = 4700, Vdrop = 2;
      let byAuto = false, tgtX = 0;
      function update() {
        const pnp = sT.value === 'pnp', det = tTg.value, fault = tF.value, Vs = sV.value;
        show($('#sPNP'), pnp); show($('#sNPN'), !pnp); show($('#inSink'), pnp); show($('#inSrc'), !pnp); show($('#short'), fault);
        $('#senT').textContent = pnp ? L('PNP sensör', 'PNP sensor') : L('NPN sensör', 'NPN sensor');
        $('#vsT').textContent = '+' + V(Vs, 1);
        let vin;
        if (pnp) vin = fault ? 0 : (det ? Vs - Vdrop : 0);
        else vin = fault ? Vs : (det ? Vs - Vdrop : 0);
        const iin = vin / Rin;
        const on = vin >= 15 && iin >= 0.002, off = vin <= 5;
        const plc = on ? 'ON' : off ? 'OFF' : L('BELİRSİZ', 'UNDEFINED');
        Object.values(flows).forEach(f => { f.rate = 0; });
        if (pnp) { if (det && !fault) flows.pnpOn.rate = rateOf(iin); if (det && fault) flows.pnpSh.rate = 1.8; }
        else { if (fault) flows.npnSh.rate = rateOf(iin); else if (det) flows.npnOn.rate = rateOf(iin); }
        $('#senLed').setAttribute('class', 'ind' + (det ? ' on' : ''));
        const ghost = !pnp && fault && !det;
        $('#plcLed').setAttribute('class', 'ind' + (on ? (ghost ? ' bad' : ' on') : ''));
        $('#plcT').textContent = 'I0.0 = ' + plc;
        let msg, ms;
        if (!fault) { msg = det === on ? L('Doğru: PLC sensörü izliyor', 'Correct: the PLC follows the sensor') : L('Seviye uygun değil', 'Level not valid'); ms = det === on ? 'ok' : 'bad'; }
        else if (pnp) { msg = det ? L('Güvenli arıza: sensör kısa devrede (korumalı), PLC OFF görür', 'Safe failure: sensor sees a short (protected), PLC reads OFF') : L('Güvenli: arıza, sinyali OFF tutar', 'Safe: the fault holds the signal OFF'); ms = 'warn'; }
        else { msg = det ? L('Arıza gizli: PLC zaten ON, sensör artık önemsiz', 'Hidden fault: PLC reads ON regardless of the sensor') : L('TEHLİKELİ: nesne yok ama PLC ON görüyor!', 'DANGEROUS: no object but the PLC reads ON!'); ms = 'bad'; }
        const vt = $('#verT'); vt.textContent = msg; vt.setAttribute('class', 'sch-t big ' + ms);
        ro.set('vin', V(vin, 1)); ro.set('iin', App.si(iin, 'A'));
        ro.set('plc', plc, ghost ? 'bad' : on ? 'ok' : '');
        ro.set('ok', ms === 'ok' ? L('doğru', 'correct') : ms === 'warn' ? L('güvenli tarafta', 'fails safe') : L('tehlikeli / hatalı', 'dangerous / wrong'), ms);
      }
      let acc = 0;
      App.onFrame(dt => {
        if (tAuto.value) {
          acc += dt;
          if (acc > 1.8) { acc = 0; byAuto = true; tTg.set(!tTg.value); byAuto = false; }
        }
        const goal = tTg.value ? 0 : -40;
        tgtX += (goal - tgtX) * (RM ? 1 : Math.min(1, dt * 8));
        $('#tgt').setAttribute('transform', `translate(${tgtX.toFixed(1)},0)`);
      });
      update();
    }

    /* =================== Figure: automotive 12 V events =================== */
    {
      const fig = root.querySelector('#fig-auto .lab-fig');
      const p = new Viz.Plot(fig, {
        w: 600, h: 300, x: [0, 1000], y: [-20, 100], xTicks: [0, 250, 500, 750, 1000], yTicks: [-14, 0, 14, 40, 60, 100],
        xLabel: L('zaman (temsili)', 'time (illustrative)'), yLabel: 'V_BAT (V)', xFmt: () => '', yFmt: v => App.num(v, 0)
      });
      const vb = t => {
        if (t < 80) return 14.2;
        if (t < 100) return 14.2 - (t - 80) / 20 * 8.2;
        if (t < 300) return 6 + 2.2 * (t - 100) / 200 + 0.8 * Math.sin((t - 100) / 25 * 2 * Math.PI);
        if (t < 360) return 8.2 + (t - 300) / 60 * 6;
        if (t < 500) return 14.2;
        if (t < 505) return 14.2 + (t - 500) / 5 * (35 - 14.2);
        if (t < 820) return 14.2 + (35 - 14.2) * Math.exp(-(t - 505) / 60);
        if (t < 860) return 14.2 - (t - 820) / 40 * 28.2;
        return -14;
      };
      const vu = t => t < 500 || t >= 820 ? null : t < 505 ? 14.2 + (t - 500) / 5 * (90 - 14.2) : 14.2 + (90 - 14.2) * Math.exp(-(t - 505) / 60);
      p.rect('norm', 0, 9, 1000, 16, 'ok');
      p.hline('z', 0, '');
      p.hline('m40', 40, 'bad'); p.text('m40T', 995, 40, L('40 V MOSFET', '40 V MOSFET'), 'bad', 'end', 0, -5);
      p.hline('m60', 60, 'warn'); p.text('m60T', 995, 60, L('60 V MOSFET', '60 V MOSFET'), 'warn', 'end', 0, -5);
      const un = []; for (let t = 500; t < 820; t += 2) un.push([t, vu(t)]);
      p.line('un', un, 'faint dash');
      p.line('vb', Viz.sample(vb, 0, 1000, 500), 'cu');
      p.text('a1', 20, 22, L('motor çalışıyor 14,2 V', 'engine running 14.2 V'), 'muted');
      p.text('a2', 110, -6, L('marş: ~6 V', 'cranking: ~6 V'), 'muted');
      p.text('a3', 515, 92, L('load dump (korumasız ~90 V)', 'load dump (unclamped ~90 V)'), 'muted');
      p.text('a4', 560, 30, L('kenetli ~35 V', 'clamped ~35 V'), 'cu');
      p.text('a5', 870, -9, L('ters akü −14 V', 'reverse battery −14 V'), 'bad');
      p.text('a6', 380, 11, '9–16 V', 'ok');
      let t = 0;
      App.onFrame(dt => {
        if (!RM) t = (t + dt * 160) % 1000;
        const v = vb(t);
        p.vline('cur', t, 'cu');
        p.dot('d', t, v, v < 0 || v > 16 ? 'bad' : v < 9 ? 'acc' : 'ok');
        p.text('rd', 990, 82, 'V = ' + V(v, 1), 'big', 'end');
      });
    }
  }
});
