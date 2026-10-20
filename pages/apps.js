/* APP — Application circuits. Each tab is a live time-domain simulation of a real driver circuit:
   LED PWM dimming, DC motor speed control (open loop / PI), heater on/off vs PI, H-bridge position control
   (+ RC servo pulses), solenoid peak-and-hold (+ single-shot pulse), and an overview of on/off, continuous and pulse control.
   Electrical states are integrated with exact exponential steps per switching interval (piecewise-linear RL circuits),
   mechanics and thermal states with small explicit Euler steps. */
App.page({
  id: 'apps',
  num: 'APP',
  group: { tr: 'Simülatör', en: 'Simulator' },
  title: { tr: 'Uygulama devreleri: motor, LED, ısıtıcı, pozisyon, darbe', en: 'Application circuits: motor, LED, heater, position, pulse' },
  blurb: {
    tr: 'Canlı zaman simülasyonları: LED karartma, PI motor hız kontrolü, ısıtıcı, H-köprü pozisyon kontrolü, solenoid peak-and-hold.',
    en: 'Live time-domain simulations: LED dimming, PI motor speed control, heater, H-bridge position control, solenoid peak-and-hold.'
  },
  summary: {
    tr: 'Gerçek ürünler anahtarı bir amaçla sürer: LED’i karartır, motoru döndürür, ısıtıcıyı sabitler, valfi çeker. Her sekmede gerçek sürücü devresi, canlı bir zaman simülasyonu ve seçtiğin parçanın kayıpları var.',
    en: 'Real products drive the switch for a purpose: dim an LED, turn a motor, hold a heater, pull a valve. Each tab has the real driver circuit, a live time simulation and the losses of the part you pick.'
  },
  render(L) {
    return `
      <style>
        [data-page="apps"] .grp { display: grid; gap: 10px; align-content: start; }
        [data-page="apps"] .grp-t { font: 600 .78rem var(--f-display); color: var(--muted); letter-spacing: .04em; border-bottom: 1px dashed var(--line); padding-bottom: 4px; }
        [data-page="apps"] .runbar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        [data-page="apps"] .runbar .btn { padding: 6px 11px; font-size: .84rem; }
        [data-page="apps"] .simclock { margin-left: auto; font: 500 .78rem var(--f-mono); color: var(--muted); font-variant-numeric: tabular-nums; }
        [data-page="apps"] .partcard { font-size: .82rem; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); padding: 7px 10px; }
        [data-page="apps"] .partcard .specs { font-family: var(--f-mono); font-size: .74rem; color: var(--muted); margin: 3px 0; line-height: 1.45; }
        [data-page="apps"] .verdicts { display: grid; gap: 5px; margin: 0; padding: 0; list-style: none; }
        [data-page="apps"] .verdicts li { display: grid; grid-template-columns: 14px 1fr; gap: 6px; font-size: .8rem; line-height: 1.35; max-width: none; margin: 0; }
        [data-page="apps"] .verdicts li::before { content: ""; width: 9px; height: 9px; border-radius: 50%; margin-top: 4px; background: var(--ok); }
        [data-page="apps"] .verdicts li.warn::before { background: var(--warn); }
        [data-page="apps"] .verdicts li.bad::before { background: var(--bad); }
        [data-page="apps"] .figrow { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 10px; align-items: center; }
        [data-page="apps"] .legend { display: flex; flex-wrap: wrap; gap: 12px; font: 500 .76rem var(--f-mono); color: var(--muted); }
        [data-page="apps"] .legend i { display: inline-block; width: 14px; height: 3px; border-radius: 2px; vertical-align: middle; margin-right: 5px; background: var(--muted); }
        [data-page="apps"] .legend i.cu { background: var(--copper); } [data-page="apps"] .legend i.sig { background: var(--signal); }
        [data-page="apps"] .legend i.acc { background: var(--accent); } [data-page="apps"] .legend i.ok { background: var(--ok); }
        [data-page="apps"] .legend i.warn { background: var(--warn); } [data-page="apps"] .legend i.ch1 { background: var(--ch1); }
        [data-page="apps"] .legend i.bad { background: var(--bad); }
        [data-page="apps"] .scope-t { font: 600 .76rem var(--f-display); color: var(--muted); margin-top: 2px; }
        [data-page="apps"] .schem .sch.on path, [data-page="apps"] .schem .sch.on circle { stroke: var(--copper); }
        [data-page="apps"] .schem .sch.on .fillink { fill: var(--copper); }
        [data-page="apps"] .schem .sch.pwm path { stroke: var(--copper); stroke-dasharray: 3 2; }
        [data-page="apps"] .schem .glowbig { fill: var(--ch1); filter: blur(9px); }
        [data-page="apps"] .schem .lampcore { fill: var(--ch1); stroke: var(--line); }
        [data-page="apps"] .schem .lampbg { fill: var(--scope); stroke: var(--line); }
        [data-page="apps"] .schem .hwarm { fill: var(--warn); filter: blur(4px); }
        [data-page="apps"] .schem .hhot { fill: var(--bad); filter: blur(5px); }
        [data-page="apps"] .schem .dialface { fill: var(--scope); stroke: var(--line); stroke-width: 1.5; }
        [data-page="apps"] .schem .dialtick { stroke: var(--muted); stroke-width: 1.2; }
        [data-page="apps"] .schem .arm { stroke: var(--accent); stroke-width: 7; stroke-linecap: round; }
        [data-page="apps"] .schem .hub { fill: var(--surface); stroke: var(--ink-2); stroke-width: 1.5; }
        [data-page="apps"] .schem .spmark { stroke: var(--copper); stroke-width: 2.5; stroke-dasharray: 5 4; stroke-linecap: round; }
        [data-page="apps"] .schem .house { fill: var(--panel); stroke: var(--ink-2); stroke-width: 1.5; }
        [data-page="apps"] .schem .wind { stroke: var(--copper); stroke-width: 2; }
        [data-page="apps"] .schem .plunger { fill: var(--surface); stroke: var(--ink); stroke-width: 1.6; }
        [data-page="apps"] .schem .springl { fill: none; stroke: var(--muted); stroke-width: 1.4; }
        [data-page="apps"] .dial-svg { cursor: crosshair; }
        [data-page="apps"] .cmp td { white-space: nowrap; }
        [data-page="apps"] .ovgrid .card h4 { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
        @media (max-width: 640px) { [data-page="apps"] .figrow { grid-template-columns: minmax(0, 1fr); } }
      </style>

      ${App.keys([
        L('Tek yönlü yüklerin çoğu: low-side N-MOS + flyback diyot.', 'Most one-direction loads: low-side N-MOSFET + flyback diode.'),
        L('Yükün zaman sabiti PWM periyodundan çok uzunsa yük ortalamayı görür.', 'If the load’s time constant ≫ PWM period, the load sees the average.'),
        L('Tipik PWM: LED ≥ 1,25 kHz, motor 16–25 kHz, ısıtıcı 0,1–1 Hz.', 'Typical PWM: LED ≥ 1.25 kHz, motor 16–25 kHz, heater 0.1–1 Hz.'),
        L('İki yön ya da frenleme gerekiyorsa H-köprü kullan.', 'Need both directions or braking? Use an H-bridge.'),
        L('Peak-and-hold, solenoidin tutma gücünü ~%85 düşürür.', 'Peak-and-hold cuts a solenoid’s holding power by ~85 %.')
      ])}

      <ul>
        <li>${L('Her sekme canlı bir zaman simülasyonudur: <b>▶ Oynat</b>, <b>❚❚ Duraklat</b>, <b>↺ Sıfırla</b>.', 'Every tab is a live time simulation: <b>▶ Play</b>, <b>❚❚ Pause</b>, <b>↺ Reset</b>.')}</li>
        <li>${L('Hız 1× = gerçek zaman. Elektrik için yavaşlat, ısı için hızlandır.', 'Speed 1× = real time. Slow down for electrical events, speed up for thermal ones.')}</li>
        <li>${L('Noktalar simüle edilen akımı izler. Kayıplar seçtiğin parçanın datasheet değerlerinden gelir.', 'Dots follow the simulated current. Losses come from the datasheet values of the part you pick.')}</li>
      </ul>

      <div class="tabs" data-tabs id="appTabs">
        <div class="tab-btns">
          <button data-tab="led">${App.icon('led')} ${L('LED karartma', 'LED dimming')}</button>
          <button data-tab="motor">${App.icon('motor')} ${L('DC motor: hız', 'DC motor: speed')}</button>
          <button data-tab="heat">${App.icon('heater')} ${L('Isıtıcı', 'Heater')}</button>
          <button data-tab="pos">${App.icon('dial')} ${L('Pozisyon', 'Position')}</button>
          <button data-tab="sol">${App.icon('valve')} ${L('Darbe: solenoid', 'Pulse: solenoid')}</button>
          <button data-tab="ov">${App.icon('layers')} ${L('Karşılaştırma', 'Overview')}</button>
        </div>

        <!-- ================= LED ================= -->
        <section data-panel="led">
          <p>${L('<b>PWM, LED’in tepe akımını sabit tutar; yalnızca süresini değiştirir.</b> Renk kaymaz. Göz ortalamayı görür, ama yalnızca frekans yeterince yüksekse.',
            '<b>PWM keeps the LED’s peak current fixed and changes only its duration.</b> The colour does not shift. The eye sees the average, but only if the frequency is high enough.')}</p>
          ${App.lab('lab-led', L('LED karartma: low-side N-MOS ile PWM', 'LED dimming: PWM with a low-side N-MOSFET'), {
            tag: L('Simülasyon', 'Simulation'),
            foot: L('Model: LED başına V<sub>F</sub> = 2,8 V + 0,8 Ω·I; 5 V’ta 1, 12 V’ta 3, 24 V’ta 6 LED seri. Işık akımla orantılı. Lamba, bir ekran karesi boyunca ortalanan ışığı gösterir; göz ve kamera da böyle toplar. P<sub>sw</sub> = ⅙·V·I·(t<sub>on</sub>+t<sub>off</sub>)·f (dirençsel). T<sub>j</sub> kararlı hal, 25 °C ortam.',
              'Model: per LED V<sub>F</sub> = 2.8 V + 0.8 Ω·I; 1 LED in series at 5 V, 3 at 12 V, 6 at 24 V. Light ∝ current. The lamp shows light averaged over one screen frame; the eye and a camera integrate the same way. P<sub>sw</sub> = ⅙·V·I·(t<sub>on</sub>+t<sub>off</sub>)·f (resistive). T<sub>j</sub> steady state, 25 °C ambient.')
          })}
          <div class="cards">
            <div class="card"><h4>${L('Neden low-side?', 'Why low-side?')}</h4><p>${L('Source toprakta, yani V<sub>GS</sub> = GPIO gerilimi. Seviye çevirici gerekmez. LED şeritler zaten ortak anotludur (+12 V ortak).',
              'The source is at ground, so V<sub>GS</sub> = the GPIO voltage. No level shifter needed. LED strips are common-anode anyway (+12 V common).')}</p></div>
            <div class="card"><h4>${L('Gama düzeltmesi', 'Gamma correction')}</h4><p>${L('Göz parlaklığı yaklaşık D<sup>1/2,2</sup> olarak algılar. %10 görev, %35 parlak görünür. Bu yüzden D = ayar<sup>2,2</sup> kullan ve en az 10 bit PWM seç.',
              'The eye perceives brightness roughly as D<sup>1/2.2</sup>. 10 % duty looks 35 % bright. So use D = setting<sup>2.2</sup> and at least 10-bit PWM.')}</p></div>
            <div class="card"><h4>${L('Frekans', 'Frequency')}</h4><p>${L('~200 Hz altında titreme görülür. IEEE 1789: %100 modülasyonda ≥ 1,25 kHz düşük risk, ≥ 3 kHz etkisiz. Üst sınırı anahtarlama kaybı ve EMI koyar.',
              'Below ~200 Hz the flicker is visible. IEEE 1789: at 100 % modulation ≥ 1.25 kHz is low-risk, ≥ 3 kHz no effect. Switching loss and EMI set the upper limit.')}</p></div>
          </div>
          <details class="fold"><summary>${L('Hesap: 12 V’ta 3 LED, 350 mA, seri direnç', 'Worked: 3 LEDs at 12 V, 350 mA, series resistor')}</summary><div>
          ${App.example({
            given: [[L('Ray', 'Rail'), '12 V'], ['LED', L('3 × (2,8 V + 0,8 Ω·I)', '3 × (2.8 V + 0.8 Ω·I)')], [L('Hedef', 'Target'), '350 mA'], ['R<sub>DS(on)</sub>', L('25 mΩ (IRLB8721, 3,3 V)', '25 mΩ (IRLB8721, 3.3 V)')]],
            steps: [
              [L('Dizi gerilimi', 'String voltage'), L('3 · (2,8 + 0,8 · 0,35)', '3 · (2.8 + 0.8 · 0.35)'), L('9,24 V', '9.24 V')],
              [L('Seri direnç', 'Series resistor'), L('(12 − 9,24) / 0,35', '(12 − 9.24) / 0.35'), L('7,9 Ω → 8,2 Ω', '7.9 Ω → 8.2 Ω')],
              [L('Gerçek akım', 'Actual current'), L('(12 − 8,4) / (8,2 + 2,4)', '(12 − 8.4) / (8.2 + 2.4)'), '340 mA'],
              [L('Direnç kaybı', 'Resistor loss'), L('0,34² · 8,2', '0.34² · 8.2'), L('0,95 W', '0.95 W'), L('2 W’lık direnç seç', 'use a 2 W resistor')],
              [L('MOSFET kaybı (D = 1)', 'MOSFET loss (D = 1)'), L('0,34² · 0,025', '0.34² · 0.025'), L('2,9 mW', '2.9 mW')],
              [L('Motor çalışırken 14,4 V', '14.4 V with the engine running'), L('(14,4 − 8,4) / 10,6', '(14.4 − 8.4) / 10.6'), '565 mA', L('+%66 akım', '+66 % current')]
            ],
            result: L('<b>MOSFET serin kalır; asıl sorun ray değişimi.</b> Otomotivde seri direnç yerine sabit akım sürücü kullan.', '<b>The MOSFET stays cool; the real problem is the rail swing.</b> In a car, use a constant-current driver instead of a resistor.'),
            level: 'warn'
          })}</div></details>
        </section>

        <!-- ================= MOTOR ================= -->
        <section data-panel="motor">
          <p>${L('<b>Tek yönlü motor için bir low-side N-MOS ve bir flyback diyot yeter.</b> Ortalama gerilim D·V hızı belirler. PI döngüsü yükten bağımsız olarak hızı tutar.',
            '<b>A one-direction motor needs one low-side N-MOSFET and one flyback diode.</b> The average voltage D·V sets the speed. A PI loop holds the speed regardless of load.')}</p>
          ${App.lab('lab-motor', L('DC motor hız kontrolü: PWM, flyback diyot, PI', 'DC motor speed control: PWM, flyback diode, PI'), {
            tag: L('Simülasyon', 'Simulation'),
            foot: L('Model: L·di/dt = V − R·i − k·ω; J·dω/dt = k·i − b·ω − T<sub>yük</sub> (k<sub>e</sub> = k<sub>t</sub>). Her PWM aralığı tam üstel çözümle ilerler; mekanik adım ≤ 0,2 ms. Schottky V<sub>F</sub> = 0,5 V. PI 1 kHz’te, integral sınırlı. P<sub>sw</sub> = ½·(V+V<sub>F</sub>)·I·t<sub>geçiş</sub> (endüktif). Rotor animasyonu yavaşlatılmıştır.',
              'Model: L·di/dt = V − R·i − k·ω; J·dω/dt = k·i − b·ω − T<sub>load</sub> (k<sub>e</sub> = k<sub>t</sub>). Each PWM interval is advanced with the exact exponential solution; mechanical step ≤ 0.2 ms. Schottky V<sub>F</sub> = 0.5 V. PI at 1 kHz, clamped integrator. P<sub>sw</sub> = ½·(V+V<sub>F</sub>)·I·t<sub>edge</sub> (inductive). Rotor animation slowed down.')
          })}
          <div class="cards">
            <div class="card"><h4>${L('Fren yok', 'No braking')}</h4><p>${L('Tek anahtar motoru yalnızca hızlandırır. Yavaşlamayı sürtünme ve yük yapar. Bu yüzden aşağı adımda aşım yavaş söner.',
              'A single switch can only accelerate the motor. Friction and load do the slowing. That is why a downward step overshoots and recovers slowly.')}</p></div>
            <div class="card"><h4>${L('PWM frekansı', 'PWM frequency')}</h4><p>${L('Periyot τ = L/R’den uzunsa akım her periyotta sıfıra iner. Tork dalgalanır, motor öter. 16–25 kHz bunu ve duyulabilir sesi önler.',
              'If the period is longer than τ = L/R, the current drops to zero each period. Torque ripples and the motor whines. 16–25 kHz avoids that and the audible tone.')}</p></div>
            <div class="card"><h4>${L('Kalkış akımı', 'Inrush at start')}</h4><p>${L('Duran motorda zıt EMK sıfırdır, yani I = V/R. PI adımda %100’e doyar ve bu akımı çeker. Anahtarı ve beslemeyi bu tepeye göre seç.',
              'A stopped motor has zero back-EMF, so I = V/R. On a step the PI saturates at 100 % and draws that current. Size the switch and supply for this peak.')}</p></div>
          </div>
          <details class="fold"><summary>${L('Hesap: 12 V motor, kalkış ve PWM frekansı', 'Worked: 12 V motor, inrush and PWM frequency')}</summary><div>
          ${App.example({
            given: [['V', '12 V'], ['R', '2 Ω'], ['L', '1 mH'], ['k', L('0,02 V·s/rad', '0.02 V·s/rad')], ['J', L('2·10⁻⁵ kg·m²', '2·10⁻⁵ kg·m²')]],
            steps: [
              [L('Kilitli rotor akımı', 'Stall current'), 'I = 12 / 2', '6 A', L('her kalkışta görülür', 'seen at every start')],
              [L('Boşta hız', 'No-load speed'), L('ω = 12 / 0,02', 'ω = 12 / 0.02'), '600 rad/s ≈ 5700 rpm'],
              [L('Elektriksel τ', 'Electrical τ'), 'τ = 1 mH / 2 Ω', L('0,5 ms', '0.5 ms')],
              [L('20 kHz periyodu', '20 kHz period'), 'T = 1 / 20 kHz', '50 µs', L('T ≪ τ → akım sürekli', 'T ≪ τ → continuous current')],
              [L('200 Hz periyodu', '200 Hz period'), 'T = 1 / 200 Hz', '5 ms', L('T ≫ τ → süreksiz, tork darbeli', 'T ≫ τ → discontinuous, pulsed torque')],
              [L('Mekanik τ', 'Mechanical τ'), L('J·R / k² = 2·10⁻⁵ · 2 / 0,02²', 'J·R / k² = 2·10⁻⁵ · 2 / 0.02²'), L('0,1 s', '0.1 s')]
            ],
            result: L('<b>Anahtar ve diyot 6 A tepeye dayanmalı; PWM ≥ 16 kHz.</b> 0,1 s’lik mekanik τ, PI ayarının hızını belirler.', '<b>Switch and diode must take 6 A peak; PWM ≥ 16 kHz.</b> The 0.1 s mechanical τ sets how fast the PI can be.'),
            level: 'ok'
          })}</div></details>
        </section>

        <!-- ================= HEATER ================= -->
        <section data-panel="heat">
          <p>${L('<b>Isıtıcı yavaştır: 1 Hz’lik PWM bile tam ortalanır.</b> Aç/kapa basittir ama sensör gecikmesi yüzünden salınır. PI gücü ortalama olarak ayarlar ve dalgalanmayı küçültür.',
            '<b>A heater is slow: even 1 Hz PWM is averaged perfectly.</b> On/off is simple but oscillates because of the sensor lag. PI sets the power on average and shrinks the ripple.')}</p>
          ${App.lab('lab-heat', L('Isıtıcı: aç/kapa (histerezis) ve PI (yavaş PWM)', 'Heater: on/off (hysteresis) vs PI (slow PWM)'), {
            tag: L('Simülasyon', 'Simulation'),
            foot: L('Model: C<sub>th</sub>·dT/dt = P − (T − T<sub>ortam</sub>)/R<sub>th</sub>; C<sub>th</sub> = 25 J/K, R<sub>th</sub> = 3 K/W (τ = 75 s), T<sub>ortam</sub> = 25 °C. Sensör 6 s gecikmeli (kılıflı NTC). P = I²·R<sub>H</sub>, R<sub>H</sub> sabit. 1 kHz PWM, ısıl kütle tarafından ortalanmış olarak hesaplanır. Dalgalanma: son 60 s tepe–tepe.',
              'Model: C<sub>th</sub>·dT/dt = P − (T − T<sub>amb</sub>)/R<sub>th</sub>; C<sub>th</sub> = 25 J/K, R<sub>th</sub> = 3 K/W (τ = 75 s), T<sub>amb</sub> = 25 °C. Sensor lags 6 s (sheathed NTC). P = I²·R<sub>H</sub>, R<sub>H</sub> constant. 1 kHz PWM is computed as averaged by the thermal mass. Ripple: peak-to-peak over the last 60 s.')
          })}
          <div class="table-wrap"><table class="cmp" id="heatCmp"></table></div>
          <div class="cards">
            <div class="card"><h4>${L('Neden yavaş PWM?', 'Why slow PWM?')}</h4><p>${L('Isıl τ saniyeler-dakikalardır. Yavaş anahtarlama EMI üretmez, anahtarlama kaybı sıfıra yakındır. AC ısıtıcılarda SSR sıfır geçişte anahtarlar.',
              'The thermal τ is seconds to minutes. Slow switching makes no EMI and almost no switching loss. AC heaters use an SSR that switches at zero crossing.')}</p></div>
            <div class="card"><h4>${L('Röle mi, MOSFET mi?', 'Relay or MOSFET?')}</h4><p>${L('Röle ~100 000 çevrim yaşar. 2 s periyotla bu 2–3 gün eder. Sık anahtarlama için MOSFET ya da SSR kullan.',
              'A relay lasts ~100 000 cycles. At a 2 s period that is 2–3 days. For frequent switching use a MOSFET or an SSR.')}</p></div>
            <div class="card"><h4>${L('Low-side mı, high-side mı?', 'Low-side or high-side?')}</h4><p>${L('İki kablolu yalıtılmış ısıtıcı: low-side N-MOS, en ucuzu. Bir ucu şasiye bağlıysa (koltuk ısıtıcı, 24 V sourcing çıkış): high-side P-MOS ya da akıllı anahtar.',
              'Two-wire isolated heater: low-side N-MOSFET, the cheapest. One end on the chassis (seat heater, 24 V sourcing output): high-side P-MOSFET or a smart switch.')}</p></div>
          </div>
          <details class="fold"><summary>${L('Hesap: 12 V, 40 W ısıtıcı, IRLZ44N', 'Worked: 12 V, 40 W heater, IRLZ44N')}</summary><div>
          ${App.example({
            given: [['V', '12 V'], ['P', '40 W'], ['R<sub>DS(on)</sub>', L('≈ 27 mΩ (5 V, sıcak)', '≈ 27 mΩ (5 V, hot)')], ['R<sub>θJA</sub>', '62 °C/W']],
            steps: [
              [L('Isıtıcı direnci', 'Heater resistance'), 'R = 12² / 40', L('3,6 Ω', '3.6 Ω')],
              [L('Akım', 'Current'), L('I = 12 / 3,6', 'I = 12 / 3.6'), L('3,33 A', '3.33 A')],
              [L('İletim kaybı (%100)', 'Conduction loss (100 %)'), L('3,33² · 0,027', '3.33² · 0.027'), L('0,30 W', '0.30 W')],
              [L('Jonksiyon', 'Junction'), L('25 + 0,30 · 62', '25 + 0.30 · 62'), '44 °C', L('soğutucu gerekmez', 'no heatsink needed')],
              [L('Ulaşılabilir en yüksek T', 'Highest reachable T'), '25 + 40 · 3', '145 °C'],
              [L('Isıl zaman sabiti', 'Thermal time constant'), 'τ = 25 · 3', '75 s', L('1 Hz PWM tamamen ortalanır', '1 Hz PWM is fully averaged')]
            ],
            result: L('<b>IRLZ44N bu ısıtıcıyı soğutucusuz sürer.</b> Kayıp yalnızca iletimdendir; PWM frekansı burada önemsizdir.', '<b>The IRLZ44N drives this heater without a heatsink.</b> The loss is conduction only; PWM frequency barely matters here.'),
            level: 'ok'
          })}</div></details>
        </section>

        <!-- ================= POSITION ================= -->
        <section data-panel="pos">
          <p>${L('<b>Konum tutmak için iki yön ve frenleme gerekir: H-köprü.</b> Enkoder açıyı ölçer, PID görev oranını hesaplar. Görev ±%100’de doyar.',
            '<b>Holding a position needs both directions and braking: an H-bridge.</b> The encoder measures the angle, the PID computes the duty. Duty saturates at ±100 %.')}</p>
          ${App.lab('lab-pos', L('Pozisyon kontrolü: H-köprü, enkoder, PID', 'Position control: H-bridge, encoder, PID'), {
            tag: L('Simülasyon', 'Simulation'),
            foot: L('Model: redüktörlü DC motor, 50:1, kilitli akım ≈ 4 A, çıkış boşta ≈ 550 °/s, mekanik τ ≈ 50 ms. İşaret–genlik PWM, senkron doğrultma: akım sürekli, uç gerilimi ortalama u·V<sub>S</sub>. Bu yüzden ortalama model, adım 50 µs. Enkoder 12 CPR × 4 × 50 = 2400 sayım/tur. PID 1 kHz; türev ölçüm üzerinden, 5 ms süzgeçli. Üst MOSFET’ler bootstrap sürücüden 10 V alır.',
              'Model: geared DC motor, 50:1, stall ≈ 4 A, output no-load ≈ 550 °/s, mechanical τ ≈ 50 ms. Sign–magnitude PWM with synchronous rectification: current stays continuous, terminal voltage averages u·V<sub>S</sub>. Hence an averaged model, step 50 µs. Encoder 12 CPR × 4 × 50 = 2400 counts/turn. PID at 1 kHz; derivative on measurement, 5 ms filter. High-side MOSFETs get 10 V from a bootstrap driver.')
          })}
          <div class="cards">
            <div class="card"><h4>${L('Çapraz çift', 'Diagonal pair')}</h4><p>${L('Q1+Q4 bir yöne, Q3+Q2 diğer yöne sürer. Aynı koldaki iki anahtar asla birlikte açılmaz. Sürücü araya ölü zaman koyar.',
              'Q1+Q4 drive one way, Q3+Q2 the other. The two switches of one leg are never on together. The driver inserts dead time.')}</p></div>
            <div class="card"><h4>${L('Neden dört N-MOS?', 'Why four N-MOSFETs?')}</h4><p>${L('N-MOS, P-MOS’tan 2–3 kat düşük R<sub>DS(on)</sub> verir. Üst gate V<sub>S</sub>’nin üstüne çıkmalıdır. Bunu bootstrap kondansatörlü yarım köprü sürücüleri yapar.',
              'An N-MOSFET has 2–3× lower R<sub>DS(on)</sub> than a P-MOSFET. The high-side gate must rise above V<sub>S</sub>. Half-bridge drivers with a bootstrap capacitor do that.')}</p></div>
            <div class="card"><h4>P · I · D</h4><p>${L('P hataya orantılı sürer. D yaklaşırken frenler, aşımı azaltır. I yük torkundan kalan hatayı sıfırlar; anti-windup şarttır.',
              'P drives in proportion to the error. D brakes on approach and reduces overshoot. I removes the error left by load torque; anti-windup is mandatory.')}</p></div>
          </div>
          <details class="fold"><summary>${L('Hesap: çözünürlük, hız ve K<sub>p</sub>', 'Worked: resolution, speed and K<sub>p</sub>')}</summary><div>
          ${App.example({
            given: [['V', '12 V'], ['R', '3 Ω'], ['k', L('0,025 V·s/rad', '0.025 V·s/rad')], [L('Dişli', 'Gear'), '50:1'], [L('Enkoder', 'Encoder'), '12 CPR']],
            steps: [
              [L('Kilitli akım', 'Stall current'), 'I = 12 / 3', '4 A'],
              [L('Çıkış boşta hız', 'Output no-load speed'), L('(12 / 0,025) / 50', '(12 / 0.025) / 50'), L('9,6 rad/s ≈ 550 °/s', '9.6 rad/s ≈ 550 °/s')],
              [L('Sayım/tur', 'Counts per turn'), '12 · 4 · 50', '2400'],
              [L('Çözünürlük', 'Resolution'), '360° / 2400', L('0,15°', '0.15°')],
              [L('Tam görev hatası', 'Error for full duty'), L('1 / K<sub>p</sub> = 1 / 0,03', '1 / K<sub>p</sub> = 1 / 0.03'), '33°', L('daha büyük adımlarda doyar', 'larger steps saturate')]
            ],
            result: L('<b>90°’lik adım önce doyar, sonra P+D ile yerleşir.</b> Çözünürlük 0,15°, yani ±1° bandı rahat tutulur.', '<b>A 90° step saturates first, then settles with P+D.</b> Resolution is 0.15°, so a ±1° band is easy to hold.'),
            level: 'ok'
          })}</div></details>

          <h3>${L('Hobi RC servo: konumu darbe genişliği söyler', 'Hobby RC servo: the pulse width sets the position')}</h3>
          <ul>
            <li>${L('Servo; motoru, dişliyi, sensörü, H-köprüyü ve denetleyiciyi bir kutuda toplar.', 'A servo packs motor, gearbox, sensor, H-bridge and controller into one box.')}</li>
            <li>${L('Komut: her ~20 ms’de 1–2 ms’lik bir darbe. Genişlik = hedef açı.', 'Command: a 1–2 ms pulse every ~20 ms. Width = target angle.')}</li>
            <li>${L('Sinyal hattı güç taşımaz. Servo gücünü kendi 5–6 V beslemesinden çeker, hareket anında amperler.', 'The signal line carries no power. The servo draws from its own 5–6 V supply, amps while moving.')}</li>
          </ul>
          ${App.lab('lab-servo', L('Servo darbesi → açı', 'Servo pulse → angle'), {
            tag: L('Mini demo', 'Mini demo'),
            foot: L('Eşleme: açı = (t<sub>darbe</sub> − 1,5 ms) · 90°/ms. 1–2 ms dışı servoya özgüdür ve dayanağa vurdurabilir. Dönüş hızı 0,15 s/60°. Dijital servolar çoğu zaman 300 Hz’e kadar kabul eder.',
              'Mapping: angle = (t<sub>pulse</sub> − 1.5 ms) · 90°/ms. Beyond 1–2 ms is servo-specific and can hit the end stop. Slew rate 0.15 s/60°. Digital servos often accept up to 300 Hz.')
          })}
        </section>

        <!-- ================= SOLENOID ================= -->
        <section data-panel="sol">
          <p>${L('<b>Çekmek için yüksek akım, tutmak için çok daha azı yeter.</b> Peak-and-hold önce tam gerilimle çeker, sonra PWM ile akımı düşürür. Güç akımın karesiyle düştüğü için tasarruf büyüktür.',
            '<b>Pulling in needs high current; holding needs far less.</b> Peak-and-hold pulls in at full voltage, then lowers the current with PWM. Power falls with current squared, so the saving is large.')}</p>
          ${App.lab('lab-sol', L('Solenoid valf: peak-and-hold ve düz DC sürme', 'Solenoid valve: peak-and-hold vs plain DC drive'), {
            tag: L('Simülasyon', 'Simulation'),
            foot: L('Model: R = V<sub>S</sub>/1 A. L<sub>açık</sub> = R·1,5 ms, L<sub>kapalı</sub> = R·5 ms, arada x² ile. Durum değişkeni akı λ = L·i: plunger hareket ederken λ korunur, akım çöker (çekme çentiği). Çekme i &gt; 0,65 A (6 ms’de kapanır), bırakma i &lt; 0,2 A (8 ms’de açılır). Komut: 300 ms çevrimin ilk 150 ms’si. Hold PWM 20 kHz, diyot V<sub>F</sub> = 0,7 V.',
              'Model: R = V<sub>S</sub>/1 A. L<sub>open</sub> = R·1.5 ms, L<sub>closed</sub> = R·5 ms, x² in between. State variable is flux λ = L·i: λ is conserved while the plunger moves, so the current dips (pull-in notch). Pull-in i &gt; 0.65 A (closes in 6 ms), drop-out i &lt; 0.2 A (opens in 8 ms). Command: first 150 ms of a 300 ms cycle. Hold PWM 20 kHz, diode V<sub>F</sub> = 0.7 V.')
          })}
          <div class="cards">
            <div class="card"><h4>${L('Yalnızca diyot', 'Diode only')}</h4><p>${L('Kapanışta akım bobinin τ = L/R’siyle yavaş söner. Valf geç bırakır. MOSFET yalnızca V<sub>S</sub> + 0,7 V görür.',
              'At turn-off the current decays slowly with the coil’s τ = L/R. The valve releases late. The MOSFET sees only V<sub>S</sub> + 0.7 V.')}</p></div>
            <div class="card"><h4>${L('Diyot + zener', 'Diode + zener')}</h4><p>${L('Zener bobine ters V<sub>Z</sub> uygular, akım birkaç kat hızlı söner. Bedeli: MOSFET V<sub>S</sub> + V<sub>Z</sub> + V<sub>F</sub> görür. V<sub>DS</sub> payını kontrol et.',
              'The zener applies V<sub>Z</sub> backwards and the current dies several times faster. The price: the MOSFET sees V<sub>S</sub> + V<sub>Z</sub> + V<sub>F</sub>. Check the V<sub>DS</sub> margin.')}</p></div>
            <div class="card"><h4>${L('En iyisi ikisi birden', 'Best of both')}</h4><p>${L('Hold sırasında Q<sub>Z</sub> zeneri kısa devre eder: düşük dalgalanma. Kapanışta Q<sub>Z</sub> açılır: hızlı bırakma. Enjektör sürücüleri böyle çalışır.',
              'During hold Q<sub>Z</sub> shorts the zener: low ripple. At turn-off Q<sub>Z</sub> opens: fast release. Injector drivers work this way.')}</p></div>
          </div>
          <details class="fold"><summary>${L('Hesap: 12 V valf, tutma gücü ve V<sub>DS</sub>', 'Worked: 12 V valve, holding power and V<sub>DS</sub>')}</summary><div>
          ${App.example({
            given: [['V', '12 V'], ['R', '12 Ω'], ['L<sub>' + L('kapalı', 'closed') + '</sub>', '60 mH'], ['I<sub>hold</sub>', L('0,34 A', '0.34 A')], ['V<sub>Z</sub>', '24 V']],
            steps: [
              [L('DC güç', 'DC power'), '12² / 12', '12 W'],
              [L('Tutma gücü', 'Holding power'), L('0,34² · 12', '0.34² · 12'), L('1,4 W', '1.4 W')],
              [L('Tasarruf', 'Saving'), L('1 − 1,4 / 12', '1 − 1.4 / 12'), L('%88', '88 %')],
              [L('Kapanışta enerji', 'Energy at turn-off'), L('½ · 0,06 · 0,34²', '½ · 0.06 · 0.34²'), L('3,5 mJ', '3.5 mJ'), L('zener yakar', 'burned in the zener')],
              [L('V<sub>DS</sub> tepe', 'Peak V<sub>DS</sub>'), L('12 + 24 + 0,7', '12 + 24 + 0.7'), L('36,7 V', '36.7 V'), L('30 V’luk parça çığa girer', 'a 30 V part avalanches')]
            ],
            result: L('<b>Peak-and-hold gücü %88 düşürür.</b> Zenerli kelepçe için en az 55–60 V’luk MOSFET seç.', '<b>Peak-and-hold cuts the power by 88 %.</b> With a zener clamp, pick a MOSFET of at least 55–60 V.'),
            level: 'ok'
          })}</div></details>

          <h3>${L('Tek darbe: darbe genişliği → enerji', 'Single pulse: pulse width → energy')}</h3>
          <ul>
            <li>${L('Bazı yükler tek darbeyle sürülür: enjektör, darbe mıknatısı, kilit bobini.', 'Some loads get a single pulse: injectors, impact magnets, lock coils.')}</li>
            <li>${L('Darbe enerjisi: direnç ısısı + manyetik alan + mekanik iş.', 'Pulse energy: resistor heat + magnetic field + mechanical work.')}</li>
            <li>${L('Çekmeye yetmeyen kısa darbe yalnızca ısı üretir.', 'A pulse too short to pull in only makes heat.')}</li>
          </ul>
          ${App.lab('lab-shot', L('Tek darbe simülasyonu', 'Single-pulse simulation'), {
            tag: L('Mini simülasyon', 'Mini simulation'),
            foot: L('Bobin modeli, ray ve kapanış kelepçesi yukarıdakiyle aynı. Mekanik iş enerji dengesinden: E<sub>kaynak</sub> − E<sub>R</sub> − E<sub>kelepçe</sub>. Anahtar düşümü ihmal edildi.',
              'Same coil model, rail and turn-off clamp as above. Mechanical work from the energy balance: E<sub>supply</sub> − E<sub>R</sub> − E<sub>clamp</sub>. Switch drop ignored.')
          })}
        </section>

        <!-- ================= OVERVIEW ================= -->
        <section data-panel="ov">
          <p>${L('<b>Aynı MOSFET üç farklı iş yapar.</b> Hangisi olduğu frekansı, kaybın kaynağını ve korumayı belirler.',
            '<b>The same MOSFET does three different jobs.</b> Which one sets the frequency, the source of loss and the protection.')}</p>
          <div class="cards ovgrid">
            <div class="card"><h4>${App.icon('toggle')} ${L('Aç/kapa', 'On/off')} <span class="pill">0 – ~1 Hz</span></h4>
              <p>${L('<b>Nerede:</b> lamba, pompa, röle yerine, histerezisli ısıtıcı.', '<b>Where:</b> lamps, pumps, relay replacement, hysteresis heater.')}</p>
              <p>${L('<b>Transistör:</b> uzun süre tam açık ya da kapalı. Kayıp ≈ I²·R<sub>DS(on)</sub>.', '<b>Transistor:</b> fully on or off for long times. Loss ≈ I²·R<sub>DS(on)</sub>.')}</p>
              <p>${L('<b>Risk:</b> kalkış akımı, kapanış darbesi, kısa devre.', '<b>Risk:</b> inrush, turn-off kick, short circuit.')}</p></div>
            <div class="card"><h4>${App.icon('square')} ${L('Sürekli: PWM', 'Continuous: PWM')} <span class="pill sig">${L('0,1 Hz – 100 kHz', '0.1 Hz – 100 kHz')}</span></h4>
              <p>${L('<b>Nerede:</b> LED, motor hız/konum, ısıtıcı, SMPS.', '<b>Where:</b> LEDs, motor speed/position, heaters, SMPS.')}</p>
              <p>${L('<b>Transistör:</b> her periyotta iki kenar. Kayıp = iletim + V·I·t<sub>geçiş</sub>·f.', '<b>Transistor:</b> two edges per period. Loss = conduction + V·I·t<sub>edge</sub>·f.')}</p>
              <p>${L('<b>Risk:</b> yavaş gate sürme, eksik flyback yolu.', '<b>Risk:</b> slow gate drive, missing freewheel path.')}</p></div>
            <div class="card"><h4>${App.icon('gauge')} ${L('Sürekli: lineer', 'Continuous: linear')} <span class="pill warn">DC</span></h4>
              <p>${L('<b>Nerede:</b> sabit akımlı LED, lineer regülatör, elektronik yük, yumuşak yolverme.', '<b>Where:</b> CC LED sinks, linear regulators, electronic loads, soft start.')}</p>
              <p>${L('<b>Transistör:</b> yarı açık, sürekli V<sub>DS</sub>·I<sub>D</sub>.', '<b>Transistor:</b> half on, continuously V<sub>DS</sub>·I<sub>D</sub>.')}</p>
              <p>${L('<b>Risk:</b> DC SOA. Anahtarlama MOSFET’leri lineer işte kolay ölür.', '<b>Risk:</b> DC SOA. Switching MOSFETs die easily in linear duty.')}</p></div>
            <div class="card"><h4>${App.icon('pulse')} ${L('Darbe', 'Pulse')} <span class="pill cu">µs – ms</span></h4>
              <p>${L('<b>Nerede:</b> peak-and-hold, servo komutu, step darbeleri, tek atım.', '<b>Where:</b> peak-and-hold, servo command, stepper pulses, one-shots.')}</p>
              <p>${L('<b>Transistör:</b> kısa, yüksek tepe; ortalama küçük. I<sub>DM</sub> ve Z<sub>θ</sub>(t) önemli.', '<b>Transistor:</b> short, high peak; small average. I<sub>DM</sub> and Z<sub>θ</sub>(t) matter.')}</p>
              <p>${L('<b>Risk:</b> darbe sonu ½·L·I² enerjisinin gideceği yer.', '<b>Risk:</b> where the ½·L·I² energy goes at the end.')}</p></div>
          </div>
          <div class="table-wrap"><table>
            <thead><tr><th>${L('Uygulama', 'Application')}</th><th>${L('Kontrol', 'Control')}</th><th>${L('Frekans', 'Frequency')}</th><th>${L('Topoloji', 'Topology')}</th><th>${L('Baskın kayıp / risk', 'Dominant loss / risk')}</th></tr></thead>
            <tbody>
              <tr><td>${L('LED şerit', 'LED strip')}</td><td>PWM</td><td class="num">${L('0,2–20 kHz', '0.2–20 kHz')}</td><td>Low-side N-MOS</td><td>${L('İletim; düşük f’de titreme', 'Conduction; flicker at low f')}</td></tr>
              <tr><td>${L('Fan / pompa', 'Fan / pump')}</td><td>PWM</td><td class="num">16–25 kHz</td><td>${L('Low-side + flyback', 'Low-side + flyback')}</td><td>${L('Kalkış akımı, anahtarlama', 'Inrush, switching')}</td></tr>
              <tr><td>${L('Pozisyon aktüatörü', 'Position actuator')}</td><td>PWM + PID</td><td class="num">16–40 kHz</td><td>${L('H-köprü', 'H-bridge')}</td><td>${L('Shoot-through, ölü zaman', 'Shoot-through, dead time')}</td></tr>
              <tr><td>${L('Isıtıcı', 'Heater')}</td><td>${L('Aç/kapa, yavaş PWM', 'On/off, slow PWM')}</td><td class="num">${L('0,05–1 Hz', '0.05–1 Hz')}</td><td>${L('Low- / high-side', 'Low- / high-side')}</td><td>${L('İletim', 'Conduction')}</td></tr>
              <tr><td>${L('Solenoid valf', 'Solenoid valve')}</td><td>${L('Darbe + hold PWM', 'Pulse + hold PWM')}</td><td class="num">${L('tek + 20 kHz', 'single + 20 kHz')}</td><td>${L('Low-side + kelepçe', 'Low-side + clamp')}</td><td>${L('Kapanış darbesi', 'Turn-off kick')}</td></tr>
              <tr><td>RC servo</td><td>${L('Darbe genişliği', 'Pulse width')}</td><td class="num">50–300 Hz</td><td>${L('Yalnızca sinyal', 'Signal only')}</td><td>${L('Besleme düşmesi', 'Supply sag')}</td></tr>
              <tr><td>${L('Step motor', 'Stepper motor')}</td><td>STEP/DIR</td><td class="num">${L('0–50 kHz adım', '0–50 kHz steps')}</td><td>${L('2× H-köprü, chopper', '2× H-bridge, chopper')}</td><td>${L('Rezonans, adım kaçırma', 'Resonance, missed steps')}</td></tr>
            </tbody></table></div>
          <div class="call tip"><strong>${L('Kural', 'Rule of thumb')}</strong>${L('Yükün zaman sabiti PWM periyodundan çok uzunsa yük ortalamayı görür. Değilse dalgalanmayı görür: LED titrer, motor akımı kesilir, ısıtıcı salınır.',
            'If the load’s time constant is much longer than the PWM period, the load sees the average. If not, it sees the ripple: the LED flickers, the motor current chops, the heater oscillates.')}</div>
        </section>
      </div>`;
  },


  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L, P = App.Parts;
    const clamp = App.clamp;
    const TA = 25;
    const TAU = Math.PI * 2;

    /* ===================================================================
       Shared helpers
       =================================================================== */
    // gate/base drive options for low-side switches. rg: total gate-loop resistance (pin/driver + R_G); rb: base resistor path
    const DRV = {
      pin33: { v: 3.3, rg: 140, rb: 260, tr: 'GPIO 3,3 V', en: 'GPIO 3.3 V' },
      pin5: { v: 5, rg: 125, rb: 355, tr: 'GPIO 5 V', en: 'GPIO 5 V' },
      drv: { v: 10, rg: 7.2, rb: 50, tr: 'Sürücü 10 V', en: 'Driver 10 V' }
    };
    const RAILS = () => [{ value: 5, label: '5 V' }, { value: 12, label: L('12 V oto', '12 V auto') }, { value: 24, label: L('24 V endüstri', '24 V industrial') }];
    const vfmt = d => v => App.num(v, d) + ' V';
    const P100 = (v, d) => App.lang === 'en' ? App.num(v, d) + ' %' : '%' + App.num(v, d); // v already in percent
    const pct = v => P100(v * 100, v < 0.1 ? 1 : 0);
    const fmtSpeed = v => (v >= 10 ? App.num(v, 0) : v >= 1 ? App.num(v, 1) : v >= 0.1 ? App.num(v, 2) : App.num(v, 3)) + '×';
    const expInt = (i0, iinf, tau, t) => iinf * t + (i0 - iinf) * tau * (1 - Math.exp(-t / tau)); // ∫ i dt

    // Switch model from a library part, a drive option and junction temperature.
    // On-state: v = v0 + i·ron, current clamps at isat (linear region). ton/toff: current/voltage transition times.
    function swModel(part, o) {
      const tj = o.tj == null ? TA : o.tj;
      const m = { part, kind: part.kind, warn: [] };
      m.vmax = part.kind === 'mos' ? part.vds : part.vce;
      m.imax = part.kind === 'mos' ? part.id_ : part.ic;
      if (part.kind === 'mos') {
        let vdrv, ron, roff;
        if (o.high) { vdrv = Math.min(o.vs, 10); ron = 220; roff = 1000; }
        else { const d = DRV[o.drv]; vdrv = d.v; ron = roff = d.rg; }
        m.vgs = vdrv;
        m.rds = P.rds(part, vdrv, tj);
        m.isat = P.idsat(part, vdrv, tj);
        m.v0 = 0; m.ron = isFinite(m.rds) ? m.rds : 1e4;
        const i = Math.max(o.i || 0.2, 1e-3);
        const vpl = Math.min(P.vplateau(part, i), vdrv * 0.97);
        const scale = clamp(Math.sqrt(Math.max(o.vs, 1) / (0.8 * part.vds)), 0.3, 1.5);
        const qsw = (0.6 * part.qgs + part.qgd * scale) * 1e-9;
        m.ton = qsw / Math.max((vdrv - vpl) / ron, 1e-6);
        m.toff = qsw / Math.max(vpl / roff, 1e-6);
        m.pgate = part.qg * 1e-9 * vdrv / part.qv * vdrv; // × f → gate-drive power (in the driver, not the FET)
        m.onTxt = `R<sub>DS(on)</sub> ${isFinite(m.rds) ? App.si(m.rds, 'Ω', 3) : '∞'} @ |V<sub>GS</sub>| ${App.num(vdrv, 1)} V`;
        if (vdrv > part.vgsMax) m.warn.push(['bad', `|V<sub>GS</sub>| ${App.num(vdrv, 1)} V &gt; V<sub>GS(max)</sub> ±${part.vgsMax} V: gate oksidi delinir.`, `|V<sub>GS</sub>| ${App.num(vdrv, 1)} V &gt; V<sub>GS(max)</sub> ±${part.vgsMax} V: the gate oxide breaks down.`]);
        if (vdrv <= part.vth + 0.05) m.warn.push(['bad', `V<sub>GS</sub> ${App.num(vdrv, 1)} V eşiğin (${App.num(part.vth, 1)} V) altında: MOSFET açılmıyor.`, `V<sub>GS</sub> ${App.num(vdrv, 1)} V is below threshold (${App.num(part.vth, 1)} V): the MOSFET does not turn on.`]);
      } else {
        const d = DRV[o.drv];
        const ib = Math.max(0, (d.v - part.vbe) / d.rb);
        const h0 = part.htyp * (1 + part.iref / part.ik);
        m.ib = ib;
        m.isat = (-1 + Math.sqrt(1 + 4 * h0 * ib / part.ik)) * part.ik / 2; // I = hFE(I)·I_B
        m.v0 = part.vs0; m.ron = part.rs;
        m.ton = m.toff = part.tsw * 1e-9 / 2;
        m.pgate = 0;
        m.onTxt = `I<sub>B</sub> ${App.si(ib, 'A', 2)} → I<sub>C</sub> ≤ ${App.si(m.isat, 'A', 2)}`;
        if (o.drv !== 'drv' && ib > 0.02) m.warn.push(['warn', `Base akımı ${App.si(ib, 'A', 2)}: GPIO pininin sınırında.`, `Base current ${App.si(ib, 'A', 2)}: at the GPIO pin’s limit.`]);
      }
      return m;
    }
    const rthOf = (part, sink) => (sink && part.rthjc) ? part.rthjc + 0.5 + 4 : part.rthja;

    // Switch selection card: part select + drive + heatsink + loss readouts + verdicts
    function switchCard(host, o) {
      const g = App.h('div', { class: 'grp' }); host.appendChild(g);
      g.innerHTML = `<div class="grp-t">${o.title || L('Anahtar', 'Switch')}</div>
        <div class="ctl"><label><span>${L('Parça', 'Part')}</span></label><select></select></div><div class="partcard"></div>`;
      const sel = g.querySelector('select'), card = g.querySelector('.partcard');
      const st = { part: o.part, drv: o.drv || 'pin5', sink: false, tj: TA, high: false };
      const changed = () => o.onChange && o.onChange();
      const drvSeg = UI.segmented(g, {
        label: L('Gate / base sürme', 'Gate / base drive'), value: st.drv,
        options: Object.keys(DRV).map(k => ({ value: k, label: App.t(DRV[k]) })), onChange: v => { st.drv = v; changed(); }
      });
      if (o.fixedDrive) { drvSeg.el.hidden = true; st.drv = o.fixedDrive; }
      UI.toggle(g, { label: L('Soğutucu (R<sub>θSA</sub> ≈ 4 °C/W)', 'Heatsink (R<sub>θSA</sub> ≈ 4 °C/W)'), value: false, onChange: v => { st.sink = v; changed(); } });
      const ro = UI.readouts(g, [
        { key: 'on', label: L('Açık durum', 'On state') },
        { key: 'pc', label: L('İletim kaybı', 'Conduction loss') },
        { key: 'ps', label: L('Anahtarlama kaybı', 'Switching loss') },
        { key: 'tj', label: (o.tjLabel || 'T<sub>j</sub>') + ' ' + L('(kararlı)', '(steady)') }
      ]);
      const ul = App.h('ul', { class: 'verdicts' }); g.appendChild(ul);
      let lastUl = '';
      function fill() {
        const list = P.all.filter(p => o.filter(p, st));
        const mosL = list.filter(p => p.kind === 'mos'), bjtL = list.filter(p => p.kind === 'bjt');
        sel.innerHTML = (mosL.length ? `<optgroup label="MOSFET">${mosL.map(p => `<option value="${p.id}">${p.id} · ${p.type === 'N' ? 'N' : 'P'} · ${p.pkg}</option>`).join('')}</optgroup>` : '') +
          (bjtL.length ? `<optgroup label="BJT">${bjtL.map(p => `<option value="${p.id}">${p.id} · ${p.type === 'N' ? 'NPN' : 'PNP'} · ${p.pkg}</option>`).join('')}</optgroup>` : '');
        if (!list.find(p => p.id === st.part)) st.part = (list.find(p => p.id === o.part) || list[0]).id;
        sel.value = st.part; showCard();
        drvSeg.el.hidden = !!o.fixedDrive || st.high;
      }
      function showCard() {
        const p = P.get(st.part);
        const spec = p.kind === 'mos'
          ? `V<sub>DS</sub> ${p.vds} V · I<sub>D</sub> ${p.id_} A · V<sub>th</sub> ${App.num(p.vth, 1)} V · Q<sub>g</sub> ${App.num(p.qg, 1)} nC · R<sub>θJA</sub> ${p.rthja} °C/W`
          : `V<sub>CE</sub> ${p.vce} V · I<sub>C</sub> ${p.ic} A · h<sub>FE</sub> ${p.hmin}–${p.htyp} · R<sub>θJA</sub> ${p.rthja} °C/W`;
        card.innerHTML = `<b>${p.id}</b> · ${p.pkg}<div class="specs">${spec}</div>${App.t(p.note)}`;
      }
      sel.addEventListener('change', () => { st.part = sel.value; st.tj = TA; showCard(); changed(); });
      fill();
      const api = {
        st, fill, el: g,
        part: () => P.get(st.part),
        model: (vs, i) => swModel(P.get(st.part), { drv: st.drv, high: st.high, vs, i, tj: st.tj }),
        // r: {m, pc, psw, vpk, ipk, extra:[[lvl,tr,en]]} → returns T_j
        report(r) {
          const part = P.get(st.part), m = r.m, rth = rthOf(part, st.sink);
          const pt = r.pc + r.psw;
          let tj = TA + pt * rth;
          st.tj = clamp(tj, TA, 400);
          ro.set('on', m.onTxt);
          ro.set('pc', App.si(r.pc, 'W', 3), r.pc * rth > 80 ? 'warn' : '');
          ro.set('ps', App.si(r.psw, 'W', 3), r.psw > r.pc && r.psw * rth > 20 ? 'warn' : '');
          ro.set('tj', tj > 300 ? '&gt; 300 °C' : App.num(tj, 0) + ' °C', tj >= part.tj ? 'bad' : tj > part.tj - 40 ? 'warn' : 'ok');
          const w = m.warn.slice().concat(r.extra || []);
          if (r.linear) w.push(['bad', `Lineer bölge: sürme ${App.si(r.ipk, 'A', 2)} taşımaya yetmiyor (sınır ≈ ${App.si(m.isat, 'A', 2)}); anahtar ısınıyor.`, `Linear region: the drive cannot carry ${App.si(r.ipk, 'A', 2)} (limit ≈ ${App.si(m.isat, 'A', 2)}); the switch heats up.`]);
          if (r.vpk > m.vmax) w.push(['bad', `Anahtar ${App.num(r.vpk, 1)} V görüyor &gt; ${m.vmax} V değeri: çığ (avalanche).`, `The switch sees ${App.num(r.vpk, 1)} V &gt; its ${m.vmax} V rating: avalanche.`]);
          else if (r.vpk > 0.8 * m.vmax) w.push(['warn', `Gerilim payı düşük: ${App.num(r.vpk, 1)} V / ${m.vmax} V.`, `Low voltage margin: ${App.num(r.vpk, 1)} V / ${m.vmax} V.`]);
          if (r.ipk > m.imax) w.push(['bad', `Tepe akım ${App.si(r.ipk, 'A', 2)} &gt; sürekli değer ${App.si(m.imax, 'A', 2)}.`, `Peak current ${App.si(r.ipk, 'A', 2)} &gt; continuous rating ${App.si(m.imax, 'A', 2)}.`]);
          if (tj >= part.tj) w.push(['bad', `T<sub>j</sub> &gt; ${part.tj} °C: parça yanar${part.rthjc && !st.sink ? '; soğutucu ekle ya da düşük R<sub>DS(on)</sub>’lu parça seç' : ''}.`, `T<sub>j</sub> &gt; ${part.tj} °C: the part burns${part.rthjc && !st.sink ? '; add a heatsink or pick a lower-R<sub>DS(on)</sub> part' : ''}.`]);
          if (!w.length) w.push(['ok', 'Bu koşullarda anahtar rahat.', 'The switch is comfortable under these conditions.']);
          const html = w.map(x => `<li class="${x[0]}">${App.lang === 'en' ? x[2] : x[1]}</li>`).join('');
          if (html !== lastUl) { ul.innerHTML = html; lastUl = html; }
          return tj;
        }
      };
      return api;
    }

    // play / pause / reset / speed
    function runner(host, o) {
      const g = App.h('div', { class: 'grp' }); host.appendChild(g);
      g.innerHTML = `<div class="grp-t">${L('Simülasyon', 'Simulation')}</div>`;
      const bar = App.h('div', { class: 'runbar' }); g.appendChild(bar);
      const st = { playing: !App.reducedMotion, speed: o.speed };
      const pb = UI.button(bar, { label: '', kind: 'primary', onClick: () => { st.playing = !st.playing; lbl(); } });
      UI.button(bar, { label: '↺ ' + L('Sıfırla', 'Reset'), onClick: () => o.onReset() });
      const clock = App.h('span', { class: 'simclock' }); bar.appendChild(clock);
      function lbl() { pb.textContent = st.playing ? '❚❚ ' + L('Duraklat', 'Pause') : '▶ ' + L('Oynat', 'Play'); }
      lbl();
      st.slider = UI.slider(g, { label: L('Simülasyon hızı', 'Simulation speed'), min: o.min, max: o.max, value: o.speed, log: true, fmt: fmtSpeed, onInput: v => { st.speed = v; } });
      st.clock = t => { clock.textContent = 't = ' + App.si(t, 's', 3); };
      st.el = g;
      return st;
    }

    // frame loop for one tab: runs only while the tab is visible; stops dots when hidden
    function tabLoop(panel, flowsFn, fn) {
      let wasHidden = false;
      App.onFrame(dt => {
        if (panel.hidden) {
          if (!wasHidden) { flowsFn().forEach(f => { f.rate = 0; }); wasHidden = true; }
          return;
        }
        wasHidden = false;
        fn(dt);
      });
    }
    function grp(host, title) {
      const g = App.h('div', { class: 'grp' }); host.appendChild(g);
      g.innerHTML = `<div class="grp-t">${title}</div>`;
      return g;
    }
    function legend(host, items) {
      const d = App.h('div', { class: 'legend' });
      d.innerHTML = items.map(([c, t]) => `<span><i class="${c}"></i>${t}</span>`).join('');
      host.appendChild(d);
      return d;
    }
    // ring buffer of samples
    function ring(n) {
      const a = [];
      return { a, push(s) { a.push(s); if (a.length > n) a.splice(0, a.length - n); }, clear() { a.length = 0; } };
    }
    const mosSym = (part, x, y, label, id) => part.kind === 'mos'
      ? (part.type === 'N' ? Sch.nmos(x, y, label, { bd: true }, id) : Sch.pmos(x, y, label, { bd: true }, id))
      : (part.type === 'N' ? Sch.npn(x, y, label, false, id) : Sch.pnp(x, y, label, id));

    /* ===================================================================
       1. LED dimming
       =================================================================== */
    {
      const panel = root.querySelector('[data-panel="led"]');
      const lab = root.querySelector('#lab-led');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const NL = { 5: 1, 12: 3, 24: 6 }, V0 = 2.8, RD = 0.8, IREF = 0.35;
      const RSDEF = { 5: 5.6, 12: 8.2, 24: 15 };
      const S = { vs: 12, mode: 'res', rs: 8.2, iset: 0.35, s: 0.35, gamma: true, f: 200, bits: 8, t: 0, ion: 0.35 };
      let R = {};
      let flows = [], glow = null, svg = null;

      const row = App.h('div', { class: 'figrow' }); fig.appendChild(row);
      const schHost = App.h('div'), eyeHost = App.h('div'); row.append(schHost, eyeHost);
      const eye = Viz.schematic(eyeHost, 200, 210, `
        <rect x="10" y="10" width="180" height="170" rx="8" class="lampbg"/>
        <circle id="ledHalo" cx="100" cy="92" r="58" class="glowbig" opacity="0"/>
        <circle id="ledCore" cx="100" cy="92" r="24" class="lampcore" fill-opacity="0.05"/>
        <text x="100" y="166" class="sch-t muted" text-anchor="middle">${L('gözün gördüğü', 'what the eye sees')}</text>
        <text id="ledFl" x="100" y="200" class="sch-t big" text-anchor="middle"></text>`);
      const halo = eye.querySelector('#ledHalo'), core = eye.querySelector('#ledCore'), flT = eye.querySelector('#ledFl');

      function buildSch() {
        flows.forEach(f => f.stop()); flows = [];
        schHost.innerHTML = '';
        const part = card.part();
        const n = NL[S.vs];
        const series = S.mode === 'res'
          ? `${Sch.res(300, 70, 0, '')}<text x="314" y="74" class="sch-t">R<tspan font-size="8">S</tspan></text>`
          : `${Sch.w([[300, 40], [300, 48]])}${Sch.box(278, 48, 44, 44, 'CC', '')}${Sch.w([[300, 92], [300, 100]])}`;
        svg = Viz.schematic(schHost, 470, 290, `
          ${Sch.vcc(300, 26, App.num(S.vs, 0) + ' V')}${Sch.w([[300, 26], [300, 40]])}
          ${series}
          ${Sch.led(300, 130, 0, n + '× LED', 'ledSym')}
          ${Sch.w([[300, 160], [300, 175]])}
          ${mosSym(part, 280, 205, part.id)}
          ${Sch.w([[300, 235], [300, 262]])}${Sch.gnd(300, 262)}
          ${Sch.box(14, 170, 96, 70, 'MCU', 'PWM')}
          ${Sch.w([[110, 205], [160, 205]], 'sigw')}${Sch.res(190, 205, 90, '')}<text x="190" y="190" class="sch-t sig" text-anchor="middle">R${part.kind === 'mos' ? 'G' : 'B'}</text>
          ${Sch.w([[220, 205], [250, 205]], 'sigw')}${Sch.dot(235, 205)}${Sch.w([[235, 205], [235, 215]])}${Sch.res(235, 245, 0, '')}${Sch.gnd(235, 275)}
          <text id="ledI" x="312" y="170" class="sch-t cu"></text>
          <text x="420" y="250" class="sch-t muted" text-anchor="middle">low-side</text>`);
        flows.push(new Viz.Flow(svg, 'M300,26V262', { spacing: 14 }));
        flows.push(new Viz.Flow(svg, 'M110,205H250', { cls: 'flow e', spacing: 12, speed: 90 }));
        glow = svg.querySelector('#ledSym .led-glow');
        if (glow) glow.style.transition = 'none';
      }

      // scope + mapping plot
      fig.appendChild(App.h('div', { class: 'scope-t' }, L('Osiloskop: LED akımı', 'Scope: LED current')));
      const sc = new Viz.Scope(fig, { w: 600, h: 260, t0: -0.02, tdiv: 0.002, trig: false, ariaLabel: L('LED akımı osiloskobu', 'LED current scope'), channels: [
        { key: 'g', name: L('sürme', 'drive'), color: 'ch2', unit: 'V', scale: 2, pos: 1 },
        { key: 'i', name: 'I_LED', color: 'ch3', unit: 'A', scale: 0.1, pos: -3.5 }] });
      let scFit = '';
      fig.appendChild(App.h('div', { class: 'scope-t' }, L('Ayar → görev oranı → algılanan parlaklık', 'Setting → duty → perceived brightness')));
      const mp = new Viz.Plot(fig, { w: 600, h: 210, x: [0, 100], y: [0, 100], xLabel: L('parlaklık ayarı (%)', 'brightness setting (%)'), yLabel: '%', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0), margin: { l: 56, r: 18, t: 12, b: 40 } });
      mp.line('pl', Viz.sample(x => 100 * Math.pow(x / 100, 1 / 2.2), 0, 100, 120), 'warn');
      mp.line('pg', Viz.sample(x => x, 0, 100, 2), 'ok');
      mp.line('dg', Viz.sample(x => 100 * Math.pow(x / 100, 2.2), 0, 100, 120), 'sig dash');
      legend(fig, [['warn', L('algılanan, doğrusal görev (D = ayar)', 'perceived, linear duty (D = setting)')], ['ok', L('algılanan, gama düzeltmeli', 'perceived, gamma-corrected')], ['sig', L('gama düzeltmeli görev D = ayar^2,2', 'gamma-corrected duty D = setting^2.2')]]);

      const run = runner(ctl, { speed: 1, min: 0.001, max: 1, onReset: () => { S.t = 0; } });
      const gL = grp(ctl, L('Devre', 'Circuit'));
      UI.segmented(gL, { label: L('Besleme', 'Supply'), value: S.vs, options: RAILS(), onChange: v => { S.vs = v; S.rs = RSDEF[v]; cRs.set(S.rs, true); buildSch(); solve(); } });
      UI.segmented(gL, { label: L('Akım ayarı', 'Current setting'), value: S.mode, options: [{ value: 'res', label: L('Seri direnç', 'Series resistor') }, { value: 'cc', label: L('Sabit akım', 'Constant current') }], onChange: v => { S.mode = v; cRs.el.hidden = v !== 'res'; cIs.el.hidden = v === 'res'; buildSch(); solve(); } });
      const cRs = UI.slider(gL, { label: 'R<sub>S</sub>', min: 0.5, max: 470, value: S.rs, log: true, step: 0.1, unit: 'Ω', onInput: v => { S.rs = v; solve(); } });
      const cIs = UI.slider(gL, { label: 'I<sub>set</sub>', min: 0.02, max: 1, value: S.iset, step: 0.01, unit: 'A', onInput: v => { S.iset = v; solve(); } });
      cIs.el.hidden = true;
      const gP = grp(ctl, 'PWM');
      UI.slider(gP, { label: L('Parlaklık ayarı', 'Brightness setting'), min: 0, max: 1, step: 0.005, value: S.s, fmt: v => P100(v * 100, 1), onInput: v => { S.s = v; solve(); } });
      UI.toggle(gP, { label: L('Gama düzeltmesi (D = ayar<sup>2,2</sup>)', 'Gamma correction (D = setting<sup>2.2</sup>)'), value: S.gamma, onChange: v => { S.gamma = v; solve(); } });
      UI.slider(gP, { label: L('PWM frekansı', 'PWM frequency'), min: 1, max: 50000, value: S.f, log: true, step: 1, unit: 'Hz', onInput: v => { S.f = v; solve(); } });
      UI.segmented(gP, { label: L('PWM çözünürlüğü', 'PWM resolution'), value: S.bits, options: [{ value: 8, label: '8 bit' }, { value: 10, label: '10 bit' }, { value: 12, label: '12 bit' }], onChange: v => { S.bits = v; solve(); } });
      const card = switchCard(ctl, { part: 'IRLB8721', drv: 'pin33', filter: p => p.type === 'N', onChange: () => { buildSch(); solve(); } });
      const ro = UI.readouts(grp(ctl, L('Ölçümler', 'Readouts')), [
        { key: 'ion', label: L('LED akımı (açıkken)', 'LED current (on)') }, { key: 'iavg', label: L('Ortalama akım', 'Average current') },
        { key: 'd', label: L('Görev oranı (sayım)', 'Duty (count)') }, { key: 'pb', label: L('Algılanan parlaklık', 'Perceived brightness') },
        { key: 'fl', label: L('Titreme', 'Flicker') }, { key: 'pl', label: L('LED gücü', 'LED power') }, { key: 'pr', label: L('R<sub>S</sub> / regülatör kaybı', 'R<sub>S</sub> / regulator loss') }
      ]);

      function solve() {
        const n = NL[S.vs];
        const m = card.model(S.vs, S.ion);
        let ion = S.mode === 'res'
          ? (S.vs - n * V0 - m.v0) / (S.rs + n * RD + m.ron)
          : Math.min(S.iset, (S.vs - n * V0 - m.v0 - 0.6) / (n * RD + m.ron));
        ion = Math.max(0, ion);
        let linear = false;
        if (ion > m.isat) { ion = m.isat; linear = ion > 0.001; }
        S.ion = ion;
        const vf = n * (V0 + RD * ion);
        const vser = S.mode === 'res' ? ion * S.rs : 0.6;
        const vsw = linear ? Math.max(0, S.vs - vf - vser) : m.v0 + ion * m.ron;
        const vreg = S.mode === 'res' ? ion * S.rs : Math.max(0, S.vs - vf - vsw);
        const dReq = S.gamma ? Math.pow(S.s, 2.2) : S.s;
        const full = Math.pow(2, S.bits) - 1, cnt = Math.round(dReq * full), D = cnt / full;
        const pwm = D > 0 && D < 1;
        const pc = D * ion * vsw;
        const voff = Math.max(0, S.vs - n * 2.5);
        const psw = pwm ? (1 / 6) * voff * ion * (m.ton + m.toff) * S.f : 0;
        R = { n, ion, D, cnt, full, vf, pwm, linear };
        ro.set('ion', App.si(ion, 'A', 3), linear ? 'bad' : ion > 0.5 ? 'warn' : '');
        ro.set('iavg', App.si(D * ion, 'A', 3));
        ro.set('d', `${P100(D * 100, D < 0.1 ? 2 : 1)} (${cnt}/${full})`, cnt > 0 && cnt < 4 ? 'warn' : '');
        const pb = Math.pow(D * ion / IREF, 1 / 2.2);
        ro.set('pb', P100(Math.min(pb, 9.99) * 100, 0) + L(' (350 mA = %100)', ' (350 mA = 100 %)'));
        let fl, fs;
        if (!pwm || ion === 0) { fl = L('modülasyon yok', 'no modulation'); fs = 'ok'; }
        else if (S.f < 90) { fl = L('doğrudan görülür', 'directly visible'); fs = 'bad'; }
        else if (S.f < 200) { fl = L('göz kenarında / kamerada', 'peripheral / on camera'); fs = 'warn'; }
        else if (S.f < 1250) { fl = L('stroboskopik etki olası', 'stroboscopic effect possible'); fs = 'warn'; }
        else if (S.f < 3000) { fl = L('düşük risk (IEEE 1789)', 'low risk (IEEE 1789)'); fs = 'ok'; }
        else { fl = L('etkisiz (IEEE 1789)', 'no effect (IEEE 1789)'); fs = 'ok'; }
        ro.set('fl', fl, fs);
        flT.textContent = fs === 'bad' ? L('TİTRİYOR', 'FLICKERING') : '';
        flT.setAttribute('class', 'sch-t big bad');
        ro.set('pl', App.si(D * ion * vf, 'W', 3));
        ro.set('pr', App.si(D * ion * vreg, 'W', 3), D * ion * vreg > 1 ? 'warn' : '');
        const extra = [];
        if (S.mode === 'res' && ion < 0.005) extra.push(['warn', `Rayda LED dizisi için pay yok (${R.n} × ~2,8 V).`, `No headroom on this rail for the LED string (${R.n} × ~2.8 V).`]);
        if (S.gamma && S.bits === 8 && S.s > 0 && S.s < 0.12) extra.push(['warn', '8 bit + gama: düşük parlaklıkta adımlar kaba (1/255 = %0,4 görev ≈ %8 algılanan). 10–12 bit kullan.', '8 bit + gamma: coarse steps at low brightness (1/255 = 0.4 % duty ≈ 8 % perceived). Use 10–12 bits.']);
        card.report({ m, pc, psw, vpk: S.vs, ipk: ion, linear, extra });
        mp.dot('cur', S.s * 100, 100 * Math.pow(D, 1 / 2.2), 'acc');
        mp.dot('curd', S.s * 100, 100 * D, 'sig', 4);
        const fk = ion.toFixed(3) + card.st.drv;
        if (fk !== scFit) { scFit = fk; sc.fit('g', 0, DRV[card.st.drv].v, 0.6, 3.6); sc.fit('i', 0, Math.max(ion, 0.01), -3.8, -0.4); }
        sc.measure([{ label: 'f', value: App.si(S.f, 'Hz', 3), color: 'ch2' }, { label: 'D', value: P100(D * 100, 1), color: 'ch2' }]);
        sc.level('avg', 'i', D * ion, 'ch3', L('ort.', 'avg') + ' ' + App.si(D * ion, 'A', 3));
        const lt = svg && svg.querySelector('#ledI');
        if (lt) lt.textContent = App.si(ion, 'A', 2);
      }

      let lastW = 0, roAcc = 0;
      // fraction of on-time between t0 and t1 for PWM with period T, duty D
      const onInt = (t, T, D) => Math.floor(t / T) * D * T + Math.min(t - Math.floor(t / T) * T, D * T);
      buildSch(); solve();
      tabLoop(panel, () => flows, dt => {
        const T = 1 / S.f, D = R.D;
        const dts = run.playing ? dt * run.speed : 0;
        const t0 = S.t; S.t += dts;
        // light averaged over this frame
        let frac;
        if (dts > 0) frac = (onInt(S.t, T, D) - onInt(t0, T, D)) / dts;
        else frac = (S.t % T) < D * T ? 1 : 0;
        if (!run.playing) frac = D; // paused: show the eye-average
        const light = clamp(frac * R.ion / IREF, 0, 1.4);
        const b = Math.pow(light, 1 / 2.2);
        halo.setAttribute('opacity', (clamp(b, 0, 1) * 0.95).toFixed(3));
        core.setAttribute('fill-opacity', (0.05 + 0.95 * clamp(b, 0, 1)).toFixed(3));
        if (glow) glow.style.opacity = clamp(b, 0, 1).toFixed(3);
        flows[0].rate = clamp(frac * R.ion / IREF * 1.2, 0, 2);
        flows[1].rate = R.pwm ? 0.5 : 0;
        // scope: roll mode, or triggered when the frame step is large compared with the window
        const W = Math.min(4 * T, 8);
        if (W !== lastW) { sc.setTime({ t0: -W, tdiv: W / 10 }); lastW = W; }
        const trig = dts > W / 10;
        const tEnd = trig ? Math.floor(S.t / T) * T : S.t;
        const pts = [];
        let k = Math.floor((tEnd - W) / T);
        const lev = v => v ? 1 : 0;
        pts.push([-W, lev(((tEnd - W) - Math.floor((tEnd - W) / T) * T) < D * T)]);
        for (; k * T < tEnd && pts.length < 400; k++) {
          const a = k * T, b2 = a + D * T;
          if (a > tEnd - W) { pts.push([a - tEnd, pts[pts.length - 1][1]]); pts.push([a - tEnd, lev(D > 0)]); }
          if (b2 > tEnd - W && b2 < tEnd && D < 1) { pts.push([b2 - tEnd, lev(D > 0)]); pts.push([b2 - tEnd, 0]); }
        }
        pts.push([0, pts[pts.length - 1][1]]);
        sc.trace('i', pts.map(([t, v]) => [t, v * R.ion]));
        sc.trace('g', pts.map(([t, v]) => [t, v * DRV[card.st.drv].v]));
        sc.status(trig ? 'TRIG' : 'ROLL');
        roAcc += dt;
        if (roAcc > 0.25) { roAcc = 0; solve(); }
        run.clock(S.t);
      });
    }

    /* ===================================================================
       2. DC motor speed control
       =================================================================== */
    {
      const panel = root.querySelector('[data-panel="motor"]');
      const lab = root.querySelector('#lab-motor');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const MDEF = { 5: { R: 1, L: 0.4e-3, k: 0.0085, J: 1e-5 }, 12: { R: 2, L: 1e-3, k: 0.02, J: 2e-5 }, 24: { R: 4, L: 2e-3, k: 0.04, J: 4e-5 } };
      const VF = 0.5, B = 1e-5, RPM = 60 / TAU, WS = 1.2;
      const M = Object.assign({ vs: 12, TL: 0, f: 20000, mode: 'pi', duty: 0.5, sp: 3000, kp: 0.4, ki: 4 }, MDEF[12]);
      const st = { t: 0, i: 0, w: 0, ang: 0, ph: 0, D: 0, integ: 0, ctlAcc: 0, ipk: 0, segs: [], Ec: 0, Es: 0, Ed: 0, Pc: 0, Ps: 0, Pd: 0, dcm: false, dcmAcc: 0,
        step: null, bin: null };
      const slow = ring(320);
      let flows = [], svg = null, rotor = null, m = null;

      const schHost = App.h('div'); fig.appendChild(schHost);
      function buildSch() {
        flows.forEach(f => f.stop()); flows = [];
        schHost.innerHTML = '';
        const part = card.part();
        svg = Viz.schematic(schHost, 470, 290, `
          ${Sch.vcc(300, 26, App.num(M.vs, 0) + ' V')}${Sch.w([[300, 26], [300, 60]])}
          ${Sch.motor(300, 90, 'M', 'motM')}
          ${Sch.w([[300, 60], [370, 60]])}${Sch.w([[300, 120], [370, 120]])}${Sch.dot(300, 60)}${Sch.dot(300, 120)}
          ${Sch.diode(370, 90, 180, '', 'schottky')}<text x="384" y="94" class="sch-t">D<tspan font-size="8">FW</tspan></text>
          ${Sch.w([[300, 120], [300, 175]])}
          ${mosSym(part, 280, 205, part.id)}
          ${Sch.w([[300, 235], [300, 262]])}${Sch.gnd(300, 262)}
          ${Sch.box(14, 170, 96, 70, 'MCU', 'PWM + PI')}
          ${Sch.w([[110, 205], [160, 205]], 'sigw')}${Sch.res(190, 205, 90, '')}<text x="190" y="190" class="sch-t sig" text-anchor="middle">R${part.kind === 'mos' ? 'G' : 'B'}</text>
          ${Sch.w([[220, 205], [250, 205]], 'sigw')}${Sch.dot(235, 205)}${Sch.w([[235, 205], [235, 215]])}${Sch.res(235, 245, 0, '')}${Sch.gnd(235, 275)}
          <path d="M60,170V90H282" class="wire sigw" stroke-dasharray="4 3"/><text x="64" y="84" class="sch-t sig">${L('hız (enkoder)', 'speed (encoder)')}</text>
          <text id="mTxt" x="312" y="160" class="sch-t cu"></text>
          <text id="mRpm" x="420" y="30" class="sch-t big" text-anchor="middle"></text>
          <text x="420" y="250" class="sch-t muted" text-anchor="middle">low-side</text>`);
        flows.push(new Viz.Flow(svg, 'M300,26V262', { spacing: 14 }));
        flows.push(new Viz.Flow(svg, 'M300,60V120H370V60H300', { spacing: 12, speed: 60 }));
        flows.push(new Viz.Flow(svg, 'M110,205H250', { cls: 'flow e', spacing: 12, speed: 90 }));
        rotor = svg.querySelector('#motM .rotor');
      }

      const two = App.h('div', { class: 'two' }); fig.appendChild(two);
      const cA = App.h('div'), cB = App.h('div'); two.append(cA, cB);
      cA.appendChild(App.h('div', { class: 'scope-t' }, L('Hız', 'Speed')));
      const pW = new Viz.Plot(cA, { w: 420, h: 210, x: [-WS, 0], y: [0, 7000], xLabel: 't − t₀ (s)', yLabel: 'rpm', yFmt: v => App.num(v, 0), margin: { l: 52, r: 12, t: 12, b: 40 } });
      legend(cA, [['cu', L('hız', 'speed')], ['acc', L('hedef', 'setpoint')], ['sig', L('görev ×7000', 'duty ×7000')]]);
      cB.appendChild(App.h('div', { class: 'scope-t' }, L('Motor akımı (bant: PWM dalgalanması)', 'Motor current (band: PWM ripple)')));
      const pI = new Viz.Plot(cB, { w: 420, h: 210, x: [-WS, 0], y: [0, 8], xLabel: 't − t₀ (s)', yLabel: 'I (A)', margin: { l: 46, r: 12, t: 12, b: 40 } });
      legend(cB, [['cu', L('ortalama', 'average')], ['bad', L('kilitli rotor V/R', 'stall V/R')]]);
      fig.appendChild(App.h('div', { class: 'scope-t' }, L('Yakın plan: son 3 PWM periyodu (gölge: gate açık)', 'Zoom: last 3 PWM periods (shade: gate on)')));
      const pF = new Viz.Scope(fig, { w: 600, h: 250, t0: -3 / M.f, tdiv: 0.3 / M.f, trig: false, ariaLabel: L('Motor akımı osiloskobu', 'Motor current scope'), channels: [
        { key: 'g', name: 'GATE', color: 'ch2', unit: 'V', scale: 5, pos: 2.4 },
        { key: 'i', name: 'I_motor', color: 'ch3', unit: 'A', scale: 1, pos: -3.6 }] });
      let pfFit = '';

      const run = runner(ctl, { speed: 0.5, min: 0.002, max: 1, onReset: reset });
      const gM = grp(ctl, L('Kontrol', 'Control'));
      UI.segmented(gM, { label: L('Mod', 'Mode'), value: M.mode, options: [{ value: 'open', label: L('Açık çevrim (görev)', 'Open loop (duty)') }, { value: 'pi', label: L('Kapalı çevrim PI', 'Closed loop PI') }], onChange: v => { M.mode = v; st.integ = st.D; vis(); markStep(); } });
      const cD = UI.slider(gM, { label: L('Görev oranı', 'Duty'), min: 0, max: 1, step: 0.01, value: M.duty, fmt: pct, onInput: v => { M.duty = v; markStep(); } });
      const cSp = UI.slider(gM, { label: L('Hedef hız', 'Setpoint'), min: 0, max: 6000, step: 50, value: M.sp, fmt: v => App.num(v, 0) + ' rpm', onInput: v => { M.sp = v; markStep(); } });
      const cKp = UI.slider(gM, { label: 'K<sub>p</sub> (1/krpm)', min: 0, max: 3, step: 0.01, value: M.kp, fmt: v => App.num(v, 2), onInput: v => { M.kp = v; } });
      const cKi = UI.slider(gM, { label: 'K<sub>i</sub> (1/(krpm·s))', min: 0, max: 40, step: 0.1, value: M.ki, fmt: v => App.num(v, 1), onInput: v => { M.ki = v; } });
      const stepRow = App.h('div', { class: 'runbar' }); gM.appendChild(stepRow);
      UI.button(stepRow, { label: L('Adım: 1500 ↔ 4000 rpm', 'Step: 1500 ↔ 4000 rpm'), onClick: () => { const v = M.sp > 2750 ? 1500 : 4000; cSp.set(v); } });
      function vis() { cD.el.hidden = M.mode !== 'open'; cSp.el.hidden = cKp.el.hidden = cKi.el.hidden = stepRow.hidden = M.mode !== 'pi'; }
      vis();
      const gE = grp(ctl, L('Motor ve PWM', 'Motor and PWM'));
      UI.segmented(gE, { label: L('Besleme', 'Supply'), value: M.vs, options: RAILS(), onChange: v => { M.vs = v; Object.assign(M, MDEF[v]); cR.set(M.R, true); cLm.set(M.L, true); cK.set(M.k, true); cJ.set(M.J, true); buildSch(); } });
      UI.slider(gE, { label: L('Yük torku', 'Load torque'), min: 0, max: 0.1, step: 0.001, value: M.TL, fmt: v => App.num(v * 1000, 0) + ' mN·m', onInput: v => { M.TL = v; } });
      UI.slider(gE, { label: L('PWM frekansı', 'PWM frequency'), min: 50, max: 40000, value: M.f, log: true, step: 1, unit: 'Hz', onInput: v => { M.f = v; st.ph = Math.min(st.ph, 1 / v * 0.999); } });
      const det = App.h('details', { class: 'fold' }); gE.appendChild(det);
      det.innerHTML = `<summary>${L('Motor parametreleri', 'Motor parameters')}</summary><div class="grp"></div>`;
      const dg = det.querySelector('div');
      const cR = UI.slider(dg, { label: 'R', min: 0.3, max: 20, value: M.R, log: true, step: 0.01, unit: 'Ω', onInput: v => { M.R = v; } });
      const cLm = UI.slider(dg, { label: 'L', min: 0.05e-3, max: 10e-3, value: M.L, log: true, step: 1e-5, unit: 'H', onInput: v => { M.L = v; } });
      const cK = UI.slider(dg, { label: 'k<sub>e</sub> = k<sub>t</sub>', min: 0.005, max: 0.1, value: M.k, log: true, step: 0.0005, fmt: v => App.num(v * 1000, 1) + ' mV·s/rad', onInput: v => { M.k = v; } });
      const cJ = UI.slider(dg, { label: 'J', min: 2e-6, max: 2e-4, value: M.J, log: true, step: 1e-7, fmt: v => App.num(v * 1e7, 0) + ' g·cm²', onInput: v => { M.J = v; } });
      dg.appendChild(App.h('p', { class: 'small muted' }, L('b = 10 µN·m·s/rad (viskoz sürtünme).', 'b = 10 µN·m·s/rad (viscous friction).')));
      const card = switchCard(ctl, { part: 'IRLZ44N', drv: 'pin5', filter: p => p.type === 'N', onChange: () => { buildSch(); } });
      const ro = UI.readouts(grp(ctl, L('Ölçümler', 'Readouts')), [
        { key: 'w', label: L('Hız', 'Speed') }, { key: 'i', label: L('Akım (ort.)', 'Current (avg)') }, { key: 'ipk', label: L('Tepe akım (sıfırlamadan beri)', 'Peak current (since reset)') },
        { key: 'cm', label: L('İletim modu', 'Conduction mode') }, { key: 'tau', label: 'τ = L/R ' + L('ve PWM periyodu', 'vs PWM period') },
        { key: 'os', label: L('Aşım', 'Overshoot') }, { key: 'ts', label: L('Yerleşme (±%2)', 'Settling (±2 %)') }, { key: 'pd', label: L('Diyot kaybı', 'Diode loss') }
      ]);

      function reset() {
        Object.assign(st, { t: 0, i: 0, w: 0, ph: 0, D: 0, integ: 0, ctlAcc: 0, ipk: 0, segs: [], Ec: 0, Es: 0, Ed: 0, Pc: 0, Ps: 0, Pd: 0, bin: null });
        slow.clear(); markStep();
      }
      function markStep() { st.step = { t0: st.t, from: st.w * RPM, to: M.mode === 'pi' ? M.sp : null, peak: st.w * RPM, last: st.t }; }

      function controller(Tc) {
        if (M.mode === 'open') { st.D = M.duty; return; }
        const e = (M.sp - st.w * RPM) / 1000;
        st.integ = clamp(st.integ + M.ki * e * Tc, 0, 1);
        st.D = clamp(M.kp * e + st.integ, 0, 1);
      }

      function advance(H) {
        const part = card.part();
        let guard = 0;
        while (H > 1e-12 && guard++ < 200000) {
          const T = 1 / M.f;
          if (st.ph <= 1e-15) {
            st.ctlAcc += T;
            if (st.ctlAcc >= 1e-3 - 1e-12 || T >= 1e-3) { controller(Math.max(st.ctlAcc, T)); st.ctlAcc = 0; }
            // turn-on edge
            if (st.D > 0 && st.D < 1 && st.i > 0) st.Es += 0.5 * (M.vs + VF) * st.i * m.ton;
          }
          const Ton = st.D * T;
          const on = st.ph < Ton - 1e-15;
          const segEnd = on ? Ton : T;
          const h = Math.max(1e-12, Math.min(H, segEnd - st.ph, 2e-4));
          const e = M.k * st.w, i0 = st.i;
          let i1, iavg, iinf, tau, tz = Infinity, lin = false;
          if (on) {
            const Rt = M.R + m.ron;
            iinf = (M.vs - m.v0 - e) / Rt; tau = M.L / Rt;
            if (iinf > m.isat) { iinf = m.isat; lin = true; }
            i1 = iinf + (i0 - iinf) * Math.exp(-h / tau);
            iavg = expInt(i0, iinf, tau, h) / h;
            if (i1 < 0) { i1 = 0; iavg = Math.max(0, iavg); }
            const vsw = lin ? Math.max(m.v0, M.vs - e - iavg * M.R) : m.v0 + iavg * m.ron;
            st.Ec += vsw * iavg * h + (lin ? 0 : m.ron * ((i0 - i1) * (i0 - i1) / 12) * h);
          } else if (i0 > 0) {
            iinf = -(VF + e) / M.R; tau = M.L / M.R;
            tz = tau * Math.log((i0 - iinf) / (-iinf));
            if (tz < h) { iavg = expInt(i0, iinf, tau, tz) / h; i1 = 0; st.dcmAcc += 1; }
            else { i1 = iinf + (i0 - iinf) * Math.exp(-h / tau); iavg = expInt(i0, iinf, tau, h) / h; }
            st.Ed += VF * iavg * h;
          } else { i1 = 0; iavg = 0; iinf = 0; tau = 1; tz = 0; if (st.D < 1) st.dcmAcc += 1; }
          // mechanics
          let acc = (M.k * iavg - B * st.w - M.TL) / M.J;
          st.w += acc * h;
          if (st.w < 0) st.w = 0;
          st.ang += st.w * h;
          st.i = i1;
          st.ipk = Math.max(st.ipk, i0, i1);
          st.segs.push({ t0: st.t, h, i0, iinf, tau, tz, on });
          if (on) st.qsw += iavg * h; else st.qfw += iavg * h;
          st.qt += h;
          // slow-scope bin
          const bdt = WS / 300;
          if (!st.bin) st.bin = { ht: 0, isum: 0, imin: Infinity, imax: -Infinity, dsum: 0 };
          const b = st.bin;
          b.ht += h; b.isum += iavg * h; b.imin = Math.min(b.imin, i0, i1); b.imax = Math.max(b.imax, i0, i1); b.dsum += st.D * h;
          if (b.ht >= bdt) { slow.push({ t: st.t + h, w: st.w * RPM, sp: M.mode === 'pi' ? M.sp : null, i: b.isum / b.ht, imin: b.imin, imax: b.imax, d: b.dsum / b.ht }); st.bin = null; }
          st.ph += h; st.t += h; H -= h;
          // turn-off edge
          if (on && st.ph >= Ton - 1e-15 && st.D < 1) st.Es += 0.5 * (M.vs + VF) * st.i * m.toff;
          if (st.ph >= T - 1e-15) { st.ph = 0; }
          // step metrics
          if (st.step && st.step.to != null) {
            const s = st.step, rpm = st.w * RPM, up = s.to >= s.from;
            s.peak = up ? Math.max(s.peak, rpm) : Math.min(s.peak, rpm);
            if (Math.abs(rpm - s.to) > 0.02 * Math.max(s.to, 300)) s.last = st.t;
          }
        }
        const keepFrom = st.t - 3 / M.f;
        let k = 0; while (k < st.segs.length - 1 && st.segs[k].t0 + st.segs[k].h < keepFrom) k++;
        if (k) st.segs.splice(0, k);
        if (st.segs.length > 4000) st.segs.splice(0, st.segs.length - 4000);
      }

      buildSch();
      reset();
      let roAcc = 0, lastF = 0, iMaxR = 8, fAcc = { sw: 0, fw: 0, t: 0 };
      tabLoop(panel, () => flows, dt => {
        m = card.model(M.vs, Math.max(st.i, 0.3));
        if (run.playing) {
          const H = dt * run.speed;
          const ec0 = st.Ec, es0 = st.Es, ed0 = st.Ed;
          const sw0 = st.t;
          st.qsw = st.qfw = st.qt = 0;
          advance(H);
          if (st.qt > 0) { fAcc.sw = st.qsw / st.qt; fAcc.fw = st.qfw / st.qt; }
          const ht = st.t - sw0;
          if (ht > 0) {
            const a = Math.min(1, ht / 0.3);
            st.Pc += ((st.Ec - ec0) / ht - st.Pc) * a; st.Ps += ((st.Es - es0) / ht - st.Ps) * a; st.Pd += ((st.Ed - ed0) / ht - st.Pd) * a;
          }
          if (rotor && !App.reducedMotion) rotor.setAttribute('transform', `rotate(${((st.ang * 180 / Math.PI) * 0.02 % 360).toFixed(1)} 300 90)`);
        }
        const istall = M.vs / M.R;
        flows[0].rate = clamp(fAcc.sw / (istall * 0.4), 0, 2.5);
        flows[1].rate = clamp(fAcc.fw / (istall * 0.4), 0, 2.5);
        flows[2].rate = st.D > 0 && st.D < 1 ? 0.5 : 0;
        // plots
        const a = slow.a, tN = st.t;
        const yI = Math.max(2, Math.ceil(istall * 1.15));
        if (yI !== iMaxR) { pI.setRange({ y: [0, yI] }); iMaxR = yI; }
        pW.line('w', a.map(s => [s.t - tN, s.w]), 'cu');
        pW.line('sp', a.filter(s => s.sp != null).map(s => [s.t - tN, s.sp]), 'acc dash');
        pW.line('d', a.map(s => [s.t - tN, s.d * 7000]), 'sig thin');
        const band = a.map(s => [s.t - tN, s.imax]).concat(a.slice().reverse().map(s => [s.t - tN, s.imin]));
        pI.area('band', band.length ? band : [], 'cu', 0);
        pI.line('i', a.map(s => [s.t - tN, s.i]), 'cu');
        pI.hline('st', istall, 'bad');
        // zoom
        const T = 1 / M.f, W = 3 * T;
        if (W !== lastF) { pF.setTime({ t0: -W, tdiv: W / 10 }); lastF = W; }
        const yF = Math.max(0.2, Math.ceil(Math.max(...st.segs.map(s => Math.max(s.i0, 0))) * 1.1 * 5) / 5);
        const vg = DRV[card.st.drv].v, fk = yF + '|' + vg;
        if (fk !== pfFit) { pfFit = fk; pF.fit('g', 0, vg, 2.2, 3.8); pF.fit('i', 0, yF, -3.8, 1.6); }
        const zp = [], gp = [];
        st.segs.forEach(s => {
          if (s.t0 + s.h < tN - W) return;
          const n = Math.max(2, Math.min(14, Math.ceil(14 * s.h / T)));
          for (let j = 0; j <= n; j++) {
            const tl = s.h * j / n;
            let iv;
            if (s.on) iv = s.iinf + (s.i0 - s.iinf) * Math.exp(-tl / s.tau);
            else if (s.i0 <= 0 || tl >= s.tz) iv = 0;
            else iv = s.iinf + (s.i0 - s.iinf) * Math.exp(-tl / s.tau);
            zp.push([s.t0 + tl - tN, Math.max(0, iv)]);
          }
          gp.push([s.t0 - tN, s.on ? vg : 0], [s.t0 + s.h - tN, s.on ? vg : 0]);
        });
        pF.trace('i', zp); pF.trace('g', gp);
        pF.status(App.si(M.f, 'Hz', 3) + ' · D ' + P100(st.D * 100, 0));
        const tx = svg.querySelector('#mTxt'); if (tx) tx.textContent = App.si(a.length ? a[a.length - 1].i : 0, 'A', 2);
        const tr = svg.querySelector('#mRpm'); if (tr) tr.textContent = App.num(st.w * RPM, 0) + ' rpm';
        roAcc += dt;
        if (roAcc > 0.2) {
          roAcc = 0;
          const last = a.length ? a[a.length - 1] : { i: 0, w: 0 };
          ro.set('w', App.num(st.w * RPM, 0) + ' rpm');
          ro.set('i', App.si(last.i, 'A', 3));
          ro.set('ipk', App.si(st.ipk, 'A', 3) + ' / ' + L('kilitli', 'stall') + ' ' + App.si(istall, 'A', 2), st.ipk > 0.8 * istall ? 'warn' : '');
          const dcm = st.dcmAcc > 0; st.dcmAcc = 0;
          ro.set('cm', st.D <= 0 ? '—' : st.D >= 1 ? L('sürekli açık', 'always on') : dcm ? L('süreksiz (akım sıfıra iniyor)', 'discontinuous (current hits zero)') : L('sürekli', 'continuous'), dcm && st.D > 0 && st.D < 1 ? 'warn' : 'ok');
          ro.set('tau', App.si(M.L / M.R, 's', 2) + ' / ' + App.si(1 / M.f, 's', 2), M.L / M.R < 1 / M.f ? 'warn' : 'ok');
          const s = st.step;
          if (M.mode === 'pi' && s && s.to != null && Math.abs(s.to - s.from) > 100) {
            const up = s.to > s.from, os = up ? (s.peak - s.to) / (s.to - s.from) : (s.to - s.peak) / (s.from - s.to);
            ro.set('os', P100(Math.max(0, os) * 100, 1), os > 0.2 ? 'warn' : 'ok');
            const settled = st.t - s.last > 0.15;
            ro.set('ts', settled ? App.si(s.last - s.t0, 's', 3) : L('yerleşmedi…', 'not settled…'), settled ? 'ok' : '');
          } else { ro.set('os', '—'); ro.set('ts', '—'); }
          ro.set('pd', App.si(st.Pd, 'W', 3));
          card.report({ m, pc: st.Pc, psw: st.Ps, vpk: M.vs + VF, ipk: Math.max(st.ipk, 0.01), linear: st.ipk > m.isat * 1.001 });
        }
        run.clock(st.t);
      });
    }

    /* ===================================================================
       3. Heater: bang-bang vs PI
       =================================================================== */
    {
      const panel = root.querySelector('[data-panel="heat"]');
      const lab = root.querySelector('#lab-heat');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const CTH = 25, RTH = 3, TS = 6, WIN = 400;
      const H = { vs: 12, pn: 40, sp: 90, mode: 'onoff', hyst: 4, kp: 0.15, ki: 0.002, tw: 2, pwm: 'slow', topo: 'low' };
      const st = { t: 0, T: TA, Tm: TA, on: false, integ: 0, u: 0, tw: 0, cyc: 0, tOnAcc: 0, Pacc: 0, Ehe: 0, max: TA, crossed: false, hist: [], bin: null, edges: 0 };
      const res = { onoff: null, pi: null };
      const buf = ring(400);
      let flows = [], svg = null, hw = null, hh = null;

      const schHost = App.h('div'); fig.appendChild(schHost);
      function buildSch() {
        flows.forEach(f => f.stop()); flows = [];
        schHost.innerHTML = '';
        const part = card.part();
        const rh = `R<tspan font-size="8">H</tspan> ${App.si(H.vs * H.vs / H.pn, 'Ω', 2)}`;
        let inner, path, gpath;
        if (H.topo === 'low') {
          inner = `
            ${Sch.vcc(300, 26, App.num(H.vs, 0) + ' V')}${Sch.w([[300, 26], [300, 60]])}
            <rect id="hW" x="281" y="66" width="38" height="48" rx="6" class="hwarm" opacity="0"/>
            <rect id="hH" x="285" y="70" width="30" height="40" rx="5" class="hhot" opacity="0"/>
            ${Sch.load(300, 90, 0, '', 'heatEl')}<text x="326" y="94" class="sch-t">${rh}</text>
            ${Sch.w([[300, 120], [300, 175]])}
            ${mosSym(part, 280, 205, part.id)}
            ${Sch.w([[300, 235], [300, 262]])}${Sch.gnd(300, 262)}
            ${Sch.box(14, 170, 96, 70, 'MCU', 'PI / ON-OFF')}
            ${Sch.w([[110, 205], [160, 205]], 'sigw')}${Sch.res(190, 205, 90, '')}
            ${Sch.w([[220, 205], [250, 205]], 'sigw')}${Sch.dot(235, 205)}${Sch.w([[235, 205], [235, 215]])}${Sch.res(235, 245, 0, '')}${Sch.gnd(235, 275)}
            <path d="M282,100H62V170" class="wire sigw" stroke-dasharray="4 3"/><text x="70" y="94" class="sch-t sig">NTC → ADC</text>
            <text x="420" y="250" class="sch-t muted" text-anchor="middle">low-side</text>`;
          path = 'M300,26V262'; gpath = 'M110,205H250';
        } else {
          inner = `
            ${Sch.vcc(300, 26, App.num(H.vs, 0) + ' V')}${Sch.w([[300, 26], [300, 70]])}${Sch.w([[300, 40], [215, 40]])}${Sch.dot(300, 40)}
            ${mosSym(part, 280, 100, part.id)}
            ${Sch.res(215, 70, 0, '')}<text x="200" y="74" class="sch-t muted" text-anchor="end">R<tspan font-size="8">PU</tspan></text>
            ${Sch.w([[250, 100], [215, 100]], 'sigw')}${Sch.dot(215, 100)}
            ${Sch.res(215, 130, 0, '')}
            ${Sch.npn(195, 190, '')}${Sch.w([[215, 220], [215, 262]])}${Sch.gnd(215, 262)}
            ${Sch.box(4, 155, 96, 70, 'MCU', 'PI / ON-OFF')}${Sch.w([[100, 190], [105, 190]], 'sigw')}${Sch.res(135, 190, 90, '')}
            ${Sch.w([[300, 130], [300, 135]])}
            <rect id="hW" x="281" y="141" width="38" height="48" rx="6" class="hwarm" opacity="0"/>
            <rect id="hH" x="285" y="145" width="30" height="40" rx="5" class="hhot" opacity="0"/>
            ${Sch.load(300, 165, 0, '', 'heatEl')}<text x="326" y="169" class="sch-t">${rh}</text>
            ${Sch.w([[300, 195], [300, 262]])}${Sch.gnd(300, 262)}
            <text x="312" y="250" class="sch-t muted">${L('şasi', 'chassis')}</text>
            <text x="420" y="60" class="sch-t muted" text-anchor="middle">high-side</text>
            <text x="420" y="132" class="sch-t muted" text-anchor="middle">${L('|V<tspan font-size="8">GS</tspan>| ≤ 10 V (zener)', '|V<tspan font-size="8">GS</tspan>| ≤ 10 V (zener)')}</text>`;
          path = 'M300,26V262'; gpath = 'M100,190H165';
        }
        svg = Viz.schematic(schHost, 470, 290, inner);
        flows.push(new Viz.Flow(svg, path, { spacing: 14 }));
        flows.push(new Viz.Flow(svg, gpath, { cls: 'flow e', spacing: 12, speed: 90 }));
        hw = svg.querySelector('#hW'); hh = svg.querySelector('#hH');
      }

      fig.appendChild(App.h('div', { class: 'scope-t' }, L('Sıcaklık', 'Temperature')));
      const pT = new Viz.Plot(fig, { w: 600, h: 230, x: [-WIN, 0], y: [20, 160], xLabel: 't − t₀ (s)', yLabel: 'T (°C)', yFmt: v => App.num(v, 0), xFmt: v => App.num(v, 0), margin: { l: 56, r: 18, t: 12, b: 40 } });
      legend(fig, [['cu', L('gerçek T', 'actual T')], ['sig', L('ölçülen T (sensör)', 'measured T (sensor)')], ['acc', L('hedef', 'setpoint')], ['warn', L('ısıtıcı açık / güç', 'heater on / power')]]);
      const pH = new Viz.Plot(fig, { w: 600, h: 120, x: [-WIN, 0], y: [0, 1], xLabel: '', yLabel: 'P/Pmax', yTicks: [0, 1], xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0), margin: { l: 56, r: 18, t: 8, b: 26 } });

      const run = runner(ctl, { speed: 20, min: 1, max: 200, onReset: reset });
      const gC = grp(ctl, L('Kontrol', 'Control'));
      UI.segmented(gC, { label: L('Mod', 'Mode'), value: H.mode, options: [{ value: 'onoff', label: L('Aç/kapa (histerezis)', 'On/off (hysteresis)') }, { value: 'pi', label: 'PI + PWM' }], onChange: v => { H.mode = v; vis(); reset(); } });
      UI.slider(gC, { label: L('Hedef sıcaklık', 'Setpoint'), min: 40, max: 130, step: 1, value: H.sp, fmt: v => App.num(v, 0) + ' °C', onInput: v => { H.sp = v; st.crossed = false; st.max = st.T; } });
      const cHy = UI.slider(gC, { label: L('Histerezis bandı', 'Hysteresis band'), min: 0.5, max: 10, step: 0.5, value: H.hyst, fmt: v => '± ' + App.num(v / 2, 2) + ' K', onInput: v => { H.hyst = v; } });
      const cKp = UI.slider(gC, { label: 'K<sub>p</sub> (1/K)', min: 0.01, max: 1, value: H.kp, log: true, step: 0.001, fmt: v => App.num(v, 3), onInput: v => { H.kp = v; } });
      const cKi = UI.slider(gC, { label: 'K<sub>i</sub> (1/(K·s))', min: 0.0001, max: 0.05, value: H.ki, log: true, step: 0.0001, fmt: v => App.num(v, 4), onInput: v => { H.ki = v; } });
      const cPw = UI.segmented(gC, { label: L('Güç çıkışı', 'Power output'), value: H.pwm, options: [{ value: 'slow', label: L('Yavaş PWM (zaman oranlama)', 'Slow PWM (time-proportioning)') }, { value: 'fast', label: L('Hızlı PWM 1 kHz', 'Fast PWM 1 kHz') }], onChange: v => { H.pwm = v; vis(); } });
      const cTw = UI.slider(gC, { label: L('Pencere periyodu', 'Window period'), min: 0.5, max: 30, step: 0.5, value: H.tw, fmt: v => App.num(v, 1) + ' s', onInput: v => { H.tw = v; } });
      function vis() { cHy.el.hidden = H.mode !== 'onoff'; cKp.el.hidden = cKi.el.hidden = cPw.el.hidden = H.mode !== 'pi'; cTw.el.hidden = H.mode !== 'pi' || H.pwm !== 'slow'; }
      vis();
      const gE = grp(ctl, L('Isıtıcı', 'Heater'));
      UI.segmented(gE, { label: L('Besleme', 'Supply'), value: H.vs, options: RAILS(), onChange: v => { H.vs = v; buildSch(); } });
      UI.slider(gE, { label: L('Nominal güç', 'Rated power'), min: 10, max: 60, step: 1, value: H.pn, fmt: v => App.num(v, 0) + ' W', onInput: v => { H.pn = v; buildSch(); } });
      UI.segmented(gE, { label: L('Topoloji', 'Topology'), value: H.topo, options: [{ value: 'low', label: L('Low-side (yalıtılmış ısıtıcı)', 'Low-side (isolated heater)') }, { value: 'high', label: L('High-side (şasiye bağlı)', 'High-side (chassis-grounded)') }], onChange: v => { H.topo = v; card.st.high = v === 'high'; card.fill(); buildSch(); } });
      const card = switchCard(ctl, { part: 'IRLZ44N', drv: 'pin5', filter: (p, s) => s.high ? (p.kind === 'mos' && p.type === 'P') : p.type === 'N', onChange: () => { buildSch(); } });
      const ro = UI.readouts(grp(ctl, L('Ölçümler', 'Readouts')), [
        { key: 'T', label: L('Sıcaklık (gerçek / ölçülen)', 'Temperature (actual / measured)') }, { key: 'os', label: L('Aşım', 'Overshoot') },
        { key: 'rp', label: L('Dalgalanma (son 60 s)', 'Ripple (last 60 s)') }, { key: 'p', label: L('Isıtıcı gücü (açık / ort.)', 'Heater power (on / avg)') },
        { key: 'cy', label: L('Anahtarlama sayısı', 'Switching cycles') }, { key: 'rl', label: L('100k çevrimlik röle ömrü', '100k-cycle relay life') }
      ]);
      const cmpT = root.querySelector('#heatCmp');

      function reset() {
        Object.assign(st, { t: 0, T: TA, Tm: TA, on: false, integ: 0, u: 0, tw: 0, cyc: 0, Ehe: 0, max: TA, crossed: false, hist: [], bin: null, edges: 0, Psw: 0, Pc: 0 });
        buf.clear();
      }
      function piUpdate(dtc) {
        const e = H.sp - st.Tm;
        st.integ = clamp(st.integ + H.ki * e * dtc, 0, 1);
        st.u = clamp(H.kp * e + st.integ, 0, 1);
      }
      function advance(Hs, Ion, Pon) {
        const hmax = 0.02;
        let guard = 0;
        while (Hs > 1e-9 && guard++ < 100000) {
          let h = Math.min(Hs, hmax);
          let p;
          if (H.mode === 'onoff') {
            const was = st.on;
            if (st.Tm < H.sp - H.hyst / 2) st.on = true;
            else if (st.Tm > H.sp + H.hyst / 2) st.on = false;
            if (st.on && !was) st.cyc++;
            if (st.on !== was) st.edges++;
            p = st.on ? Pon : 0;
            st.duty = st.on ? 1 : 0;
          } else if (H.pwm === 'slow') {
            if (st.tw <= 1e-9) piUpdate(H.tw);
            const ton = st.u * H.tw;
            const wasOn = st.on;
            st.on = st.tw < ton - 1e-9;
            h = Math.min(h, (st.on ? ton : H.tw) - st.tw);
            h = Math.max(h, 1e-6);
            if (st.on && !wasOn) st.cyc++;
            if (st.on !== wasOn) st.edges++;
            p = st.on ? Pon : 0;
            st.duty = st.on ? 1 : 0;
            st.tw += h; if (st.tw >= H.tw - 1e-9) st.tw = 0;
          } else {
            piUpdate(h);
            st.on = st.u > 0;
            p = st.u * Pon;
            st.duty = st.u;
            if (st.u > 0 && st.u < 1) { st.cyc += 1000 * h; st.edges += 2000 * h; }
          }
          st.T += (p - (st.T - TA) / RTH) / CTH * h;
          st.Tm += (st.T - st.Tm) / TS * h;
          st.Ehe += p * h;
          st.Pc += st.duty * h; // on-fraction accumulator
          st.t += h; Hs -= h;
          if (!st.crossed && st.T >= H.sp) st.crossed = true;
          if (st.crossed) st.max = Math.max(st.max, st.T);
          const bdt = WIN / 400;
          if (!st.bin) st.bin = { ht: 0, T: 0, Tm: 0, d: 0 };
          const b = st.bin; b.ht += h; b.T += st.T * h; b.Tm += st.Tm * h; b.d += (p / Pon) * h;
          if (b.ht >= bdt) { buf.push({ t: st.t, T: b.T / b.ht, Tm: b.Tm / b.ht, d: b.d / b.ht, sp: H.sp }); st.bin = null; }
          st.hist.push([st.t, st.T]);
        }
        const k = st.hist.findIndex(x => x[0] > st.t - 60);
        if (k > 0) st.hist.splice(0, k);
        if (st.hist.length > 5000) st.hist.splice(0, st.hist.length - 5000);
      }

      buildSch(); reset();
      let roAcc = 0, onAcc = { on: 0, t: 0, e: 0 };
      tabLoop(panel, () => flows, dt => {
        const RH = H.vs * H.vs / H.pn;
        const m = card.model(H.vs, H.vs / RH);
        let Ion = (H.vs - m.v0) / (RH + m.ron), lin = false;
        if (Ion > m.isat) { Ion = m.isat; lin = true; }
        Ion = Math.max(0, Ion);
        const Pon = Ion * Ion * RH;
        if (run.playing) {
          const pc0 = st.Pc, t0 = st.t, e0 = st.edges;
          advance(dt * run.speed, Ion, Math.max(Pon, 1e-9));
          const ht = st.t - t0;
          if (ht > 0) { const a = Math.min(1, ht / 20); onAcc.on += ((st.Pc - pc0) / ht - onAcc.on) * a; onAcc.e += ((st.edges - e0) / ht - onAcc.e) * a; }
        }
        // glow by temperature
        const w = clamp((st.T - 35) / 50, 0, 1), hot = clamp((st.T - 80) / 60, 0, 1);
        if (hw) hw.setAttribute('opacity', (w * 0.8).toFixed(3));
        if (hh) hh.setAttribute('opacity', (hot * 0.9).toFixed(3));
        const onNow = H.mode === 'pi' && H.pwm === 'fast' ? st.u : (st.on ? 1 : 0);
        flows[0].rate = clamp(onNow * Ion / 3, 0, 2);
        flows[1].rate = H.mode === 'pi' && H.pwm === 'fast' && st.u > 0 && st.u < 1 ? 0.5 : 0;
        const a = buf.a, tN = st.t;
        pT.line('T', a.map(s => [s.t - tN, s.T]), 'cu');
        pT.line('Tm', a.map(s => [s.t - tN, s.Tm]), 'sig thin');
        pT.hline('sp', H.sp, 'acc solid');
        if (H.mode === 'onoff') { pT.hline('h1', H.sp + H.hyst / 2, 'acc'); pT.hline('h2', H.sp - H.hyst / 2, 'acc'); pT.hide('h1', false); pT.hide('h2', false); }
        else { pT.hide('h1', true); pT.hide('h2', true); }
        pH.area('d', a.map(s => [s.t - tN, s.d]), 'warn', 0);
        pH.line('dl', a.map(s => [s.t - tN, s.d]), 'warn thin');
        roAcc += dt;
        if (roAcc > 0.25) {
          roAcc = 0;
          ro.set('T', App.num(st.T, 1) + ' / ' + App.num(st.Tm, 1) + ' °C');
          const os = st.crossed ? st.max - H.sp : null;
          ro.set('os', os == null ? L('hedefe ulaşmadı', 'not reached yet') : '+' + App.num(os, 1) + ' K', os != null && os > 5 ? 'warn' : 'ok');
          let rp = null;
          if (st.hist.length > 10 && st.t > 120) { let lo = 1e9, hi = -1e9; st.hist.forEach(x => { lo = Math.min(lo, x[1]); hi = Math.max(hi, x[1]); }); rp = hi - lo; }
          ro.set('rp', rp == null ? '—' : App.num(rp, 2) + ' K', rp != null && rp > 3 ? 'warn' : 'ok');
          ro.set('p', App.si(Pon, 'W', 3) + ' / ' + App.si(onAcc.on * Pon, 'W', 3));
          const cph = st.t > 0 ? st.cyc / st.t * 3600 : 0;
          ro.set('cy', App.num(st.cyc, 0) + ' (' + App.num(cph, 0) + ' /' + L('sa', 'h') + ')');
          ro.set('rl', cph > 0 ? (cph > 1e5 ? L('&lt; 1 saat', '&lt; 1 hour') : App.num(1e5 / cph, cph > 1e4 ? 1 : 0) + ' ' + L('saat', 'h') + (1e5 / cph > 48 ? ' (' + App.num(1e5 / cph / 24, 0) + ' ' + L('gün', 'days') + ')' : '')) : '—', cph > 2000 ? 'bad' : cph > 200 ? 'warn' : 'ok');
          const pc = onAcc.on * Ion * (lin ? Math.max(0, H.vs - Ion * RH) : m.v0 + Ion * m.ron);
          const psw = onAcc.e * (1 / 6) * H.vs * Ion * (m.ton + m.toff) / 2; // edges/s × energy per edge (resistive)
          card.report({ m, pc, psw, vpk: H.vs, ipk: Ion, linear: lin });
          // comparison table
          res[H.mode] = { os, rp, cph, mode: H.mode, pwm: H.pwm };
          const row = (k, name) => {
            const r = res[k];
            if (!r) return `<tr><td>${name}</td><td class="num">—</td><td class="num">—</td><td class="num">—</td></tr>`;
            return `<tr${k === H.mode ? ' class="sel"' : ''}><td>${name}${k === 'pi' ? ' (' + (r.pwm === 'slow' ? L('yavaş PWM', 'slow PWM') : '1 kHz') + ')' : ''}</td><td class="num">${r.os == null ? '—' : '+' + App.num(r.os, 1) + ' K'}</td><td class="num">${r.rp == null ? '—' : App.num(r.rp, 2) + ' K'}</td><td class="num">${App.num(r.cph, 0)}</td></tr>`;
          };
          cmpT.innerHTML = `<thead><tr><th>${L('Mod (son çalıştırma)', 'Mode (last run)')}</th><th class="num">${L('Aşım', 'Overshoot')}</th><th class="num">${L('Dalgalanma', 'Ripple')}</th><th class="num">${L('Çevrim/saat', 'Cycles/hour')}</th></tr></thead><tbody>${row('onoff', L('Aç/kapa', 'On/off'))}${row('pi', 'PI')}</tbody>`;
        }
        run.clock(st.t);
      });
    }

    /* ===================================================================
       4. Position control: H-bridge + encoder + PID
       =================================================================== */
    {
      const panel = root.querySelector('[data-panel="pos"]');
      const lab = root.querySelector('#lab-pos');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const NG = 50, CPR = 48, BM = 2e-6, WP = 2;
      const X = { vs: 12, sp: 90, kp: 0.03, ki: 0, kd: 0.0008, umax: 1, TL: 0 };
      const mot = vs => { const k = vs / 480, R = vs / 4; return { k, R, L: R * 0.5e-3, J: 0.05 * k * k / R }; };
      const st = { t: 0, i: 0, wm: 0, thm: 0, u: 0, integ: 0, prev: 0, dF: 0, ctlAcc: 0, step: null, bin: null, ipk: 0, Pc: 0, Pq: [0, 0, 0, 0], Ps: 0 };
      const buf = ring(320);
      let flows = [], svg = null, rotor = null, qEl = [];

      const row = App.h('div', { class: 'figrow' }); fig.appendChild(row);
      const schHost = App.h('div'), dialHost = App.h('div'); row.append(schHost, dialHost);
      svg = Viz.schematic(schHost, 470, 290, `
        ${Sch.vcc(235, 22, '')}<text id="hbV" x="235" y="9" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.w([[130, 30], [340, 30]])}${Sch.w([[235, 22], [235, 30]])}${Sch.dot(235, 30)}
        ${Sch.w([[130, 30], [130, 60]])}${Sch.w([[340, 30], [340, 60]])}
        ${Sch.nmos(110, 90, '', { bd: true }, 'q1')}${Sch.nmos(110, 190, '', { bd: true }, 'q2')}
        ${Sch.nmos(320, 90, '', { bd: true }, 'q3')}${Sch.nmos(320, 190, '', { bd: true }, 'q4')}
        ${Sch.w([[130, 120], [130, 160]])}${Sch.w([[340, 120], [340, 160]])}
        ${Sch.w([[130, 140], [205, 140]])}${Sch.w([[265, 140], [340, 140]])}${Sch.dot(130, 140)}${Sch.dot(340, 140)}
        <g transform="rotate(90 235 140)">${Sch.motor(235, 140, '', 'posM').replace(/<text[^>]*>[^<]*<\/text>/, '')}</g><text x="235" y="176" class="sch-t" text-anchor="middle">M</text>
        ${Sch.w([[130, 220], [130, 250], [340, 250], [340, 220]])}${Sch.gnd(235, 250)}${Sch.dot(235, 250)}
        <text x="70" y="94" class="sch-t" text-anchor="end">Q1</text><text x="70" y="194" class="sch-t" text-anchor="end">Q2</text>
        <text x="372" y="94" class="sch-t">Q3</text><text x="372" y="194" class="sch-t">Q4</text>
        <text id="g1" x="74" y="108" class="sch-t sig" text-anchor="end"></text><text id="g2" x="74" y="208" class="sch-t sig" text-anchor="end"></text>
        <text id="g3" x="372" y="108" class="sch-t sig"></text><text id="g4" x="372" y="208" class="sch-t sig"></text>
        <text id="hbDir" x="235" y="282" class="sch-t big" text-anchor="middle"></text>
        <text id="hbI" x="235" y="114" class="sch-t cu" text-anchor="middle"></text>`);
      qEl = ['q1', 'q2', 'q3', 'q4'].map(id => svg.querySelector('#' + id));
      rotor = svg.querySelector('#posM .rotor');
      const fA = new Viz.Flow(svg, 'M130,30V140H340V250H235', { spacing: 14 });     // Q1 → M → Q4
      const fB = new Viz.Flow(svg, 'M340,30V140H130V250H235', { spacing: 14 });     // Q3 → M → Q2
      const fRa = new Viz.Flow(svg, 'M130,140H340V250H130V140', { spacing: 14, speed: 60 }); // recirculation, + current
      const fRb = new Viz.Flow(svg, 'M340,140H130V250H340V140', { spacing: 14, speed: 60 }); // recirculation, − current
      flows = [fA, fB, fRa, fRb];
      flows.forEach(f => { f.rate = 0; });

      const dial = Viz.schematic(dialHost, 220, 220, `
        <circle cx="110" cy="110" r="96" class="dialface"/>
        ${Array.from({ length: 24 }, (_, j) => { const a = j * 15 * Math.PI / 180, r1 = j % 6 === 0 ? 80 : 88; return `<line x1="${110 + r1 * Math.sin(a)}" y1="${110 - r1 * Math.cos(a)}" x2="${110 + 96 * Math.sin(a)}" y2="${110 - 96 * Math.cos(a)}" class="dialtick"/>`; }).join('')}
        <text x="110" y="34" class="sch-t muted" text-anchor="middle">0°</text><text x="186" y="114" class="sch-t muted" text-anchor="middle">90°</text>
        <text x="110" y="196" class="sch-t muted" text-anchor="middle">±180°</text><text x="34" y="114" class="sch-t muted" text-anchor="middle">−90°</text>
        <line id="dSp" x1="110" y1="110" x2="110" y2="20" class="spmark"/>
        <line id="dArm" x1="110" y1="110" x2="110" y2="36" class="arm"/>
        <circle cx="110" cy="110" r="9" class="hub"/>
        <text id="dTxt" x="110" y="146" class="sch-t big" text-anchor="middle"></text>`);
      dial.classList.add('dial-svg');
      dial.setAttribute('aria-label', L('Hedef açıyı seçmek için kadrana tıkla', 'Click the dial to set the target angle'));
      const dArm = dial.querySelector('#dArm'), dSp = dial.querySelector('#dSp'), dTxt = dial.querySelector('#dTxt');
      dialHost.appendChild(App.h('div', { class: 'fig-cap', style: '' }, L('Kadrana tıkla: hedef açı.', 'Click the dial: target angle.')));
      dial.addEventListener('click', ev => {
        const r = dial.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width * 220 - 110, y = (ev.clientY - r.top) / r.height * 220 - 110;
        let a = Math.atan2(x, -y) * 180 / Math.PI;
        a = Math.round(a / 5) * 5;
        cSp.set(a);
      });

      const two = App.h('div', { class: 'two' }); fig.appendChild(two);
      const cA = App.h('div'), cB = App.h('div'); two.append(cA, cB);
      cA.appendChild(App.h('div', { class: 'scope-t' }, L('Açı', 'Angle')));
      const pA = new Viz.Plot(cA, { w: 420, h: 210, x: [-WP, 0], y: [-200, 200], xLabel: 't − t₀ (s)', yLabel: '°', yFmt: v => App.num(v, 0), yTicks: [-180, -90, 0, 90, 180], margin: { l: 46, r: 12, t: 12, b: 40 } });
      legend(cA, [['cu', L('açı (enkoder)', 'angle (encoder)')], ['acc', L('hedef', 'setpoint')]]);
      cB.appendChild(App.h('div', { class: 'scope-t' }, L('Görev oranı u ve akım', 'Duty u and current')));
      const pU = new Viz.Plot(cB, { w: 420, h: 210, x: [-WP, 0], y: [-1.1, 1.1], xLabel: 't − t₀ (s)', yLabel: 'u , I/I_stall', yTicks: [-1, -0.5, 0, 0.5, 1], yFmt: v => App.num(v, 1), margin: { l: 46, r: 12, t: 12, b: 40 } });
      legend(cB, [['sig', L('görev u (±%100’de doyar)', 'duty u (saturates at ±100 %)')], ['cu', 'I / I_stall']]);

      const run = runner(ctl, { speed: 0.5, min: 0.02, max: 1, onReset: reset });
      const gC = grp(ctl, 'PID');
      const cSp = UI.slider(gC, { label: L('Hedef açı', 'Target angle'), min: -180, max: 180, step: 1, value: X.sp, fmt: v => App.num(v, 0) + '°', onInput: v => { X.sp = v; markStep(); } });
      UI.slider(gC, { label: 'K<sub>p</sub> (1/°)', min: 0, max: 0.2, step: 0.001, value: X.kp, fmt: v => App.num(v, 3), onInput: v => { X.kp = v; } });
      UI.slider(gC, { label: 'K<sub>i</sub> (1/(°·s))', min: 0, max: 0.5, step: 0.005, value: X.ki, fmt: v => App.num(v, 3), onInput: v => { X.ki = v; } });
      UI.slider(gC, { label: 'K<sub>d</sub> (s/°)', min: 0, max: 0.004, step: 0.00005, value: X.kd, fmt: v => App.num(v * 1000, 2) + 'm', onInput: v => { X.kd = v; } });
      UI.slider(gC, { label: L('Görev sınırı', 'Duty limit'), min: 0.1, max: 1, step: 0.05, value: X.umax, fmt: pct, onInput: v => { X.umax = v; } });
      const sb = App.h('div', { class: 'runbar' }); gC.appendChild(sb);
      [[-90, '−90°'], [0, '0°'], [90, '90°'], [180, '180°']].forEach(([v, l]) => UI.button(sb, { label: l, onClick: () => cSp.set(v) }));
      const gE = grp(ctl, L('Motor', 'Motor'));
      UI.segmented(gE, { label: L('Besleme', 'Supply'), value: X.vs, options: RAILS(), onChange: v => { X.vs = v; } });
      UI.slider(gE, { label: L('Çıkıştaki yük torku', 'Load torque at the output'), min: 0, max: 1.5, step: 0.05, value: X.TL, fmt: v => App.num(v, 2) + ' N·m', onInput: v => { X.TL = v; } });
      const card = switchCard(ctl, { title: L('Anahtarlar (4 adet, 20 kHz)', 'Switches (4×, 20 kHz)'), tjLabel: L('En sıcak T<sub>j</sub>', 'Hottest T<sub>j</sub>'), part: 'IRLB8721', drv: 'drv', fixedDrive: 'drv', filter: p => p.kind === 'mos' && p.type === 'N', onChange: () => {} });
      const ro = UI.readouts(grp(ctl, L('Ölçümler', 'Readouts')), [
        { key: 'a', label: L('Açı / enkoder sayımı', 'Angle / encoder count') }, { key: 'e', label: L('Hata', 'Error') },
        { key: 'os', label: L('Aşım', 'Overshoot') }, { key: 'ts', label: L('Yerleşme (±1°)', 'Settling (±1°)') },
        { key: 'pair', label: L('İletimdeki çift', 'Conducting pair') }, { key: 'ipk', label: L('Tepe akım', 'Peak current') }
      ]);

      function reset() { Object.assign(st, { t: 0, i: 0, wm: 0, thm: 0, u: 0, integ: 0, prev: 0, dF: 0, ctlAcc: 0, bin: null, ipk: 0, Pc: 0, Ps: 0 }); buf.clear(); markStep(); }
      function markStep() { const a = st.thm / NG * 180 / Math.PI; st.step = { t0: st.t, from: a, to: X.sp, peak: a, last: st.t }; }
      const measDeg = () => Math.floor(st.thm / TAU * CPR) / CPR * 360 / NG;

      function advance(Hs, mm) {
        const m = mot(X.vs);
        const hS = 5e-5;
        let guard = 0;
        while (Hs > 1e-12 && guard++ < 100000) {
          const h = Math.min(hS, Hs);
          st.ctlAcc += h;
          if (st.ctlAcc >= 1e-3 - 1e-12) {
            const Tc = st.ctlAcc; st.ctlAcc = 0;
            const meas = measDeg();
            const e = X.sp - meas;
            const dRaw = -(meas - st.prev) / Tc; st.prev = meas;
            st.dF += (dRaw - st.dF) * (Tc / (Tc + 0.005));
            st.integ = clamp(st.integ + X.ki * e * Tc, -X.umax, X.umax);
            st.u = clamp(X.kp * e + st.integ + X.kd * st.dF, -X.umax, X.umax);
          }
          const Rt = m.R + 2 * mm.ron;
          const iinf = (st.u * X.vs - m.k * st.wm) / Rt, tau = m.L / Rt;
          const i0 = st.i;
          st.i = iinf + (i0 - iinf) * Math.exp(-h / tau);
          const ia = expInt(i0, iinf, tau, h) / h;
          // load torque at the output, opposing motion (or holding against stall)
          const tl = X.TL / NG / 0.8; // gearbox efficiency 80 %
          const tm = m.k * ia - BM * st.wm;
          let tnet;
          if (Math.abs(st.wm) < 1e-3 && Math.abs(tm) <= tl) { tnet = 0; st.wm = 0; }
          else tnet = tm - tl * Math.sign(st.wm || tm);
          st.wm += tnet / m.J * h;
          st.thm += st.wm * h;
          st.t += h; Hs -= h;
          st.ipk = Math.max(st.ipk, Math.abs(st.i));
          const a = st.thm / NG * 180 / Math.PI;
          if (st.step) {
            const s = st.step, up = s.to >= s.from;
            s.peak = up ? Math.max(s.peak, a) : Math.min(s.peak, a);
            if (Math.abs(a - s.to) > 1) s.last = st.t;
          }
          // losses (averaged): hottest switch is the always-on low side; PWM high side adds switching
          const d = Math.abs(st.u), i2 = ia * ia * mm.ron;
          st.Pq[0] += (d * i2) * h; st.Pq[1] += ((1 - d) * i2) * h; st.Pq[2] += i2 * h;
          st.Ps += (d > 0 && d < 1 ? 0.5 * X.vs * Math.abs(ia) * (mm.ton + mm.toff) * 20000 : 0) * h;
          if (!st.bin) st.bin = { ht: 0, a: 0, u: 0, i: 0 };
          const b = st.bin; b.ht += h; b.a += measDeg() * h; b.u += st.u * h; b.i += ia * h;
          if (b.ht >= WP / 300) { buf.push({ t: st.t, a: b.a / b.ht, u: b.u / b.ht, i: b.i / b.ht, sp: X.sp }); st.bin = null; }
        }
      }

      reset();
      let roAcc = 0, Pav = { hot: 0, sw: 0, cond: 0 };
      tabLoop(panel, () => flows, dt => {
        const m = mot(X.vs);
        const mm = card.model(X.vs, Math.max(Math.abs(st.i), 0.5));
        if (run.playing) {
          const t0 = st.t; st.Pq = [0, 0, 0, 0]; st.Ps = 0;
          advance(dt * run.speed, mm);
          const ht = st.t - t0;
          if (ht > 0) {
            const a = Math.min(1, ht / 0.3);
            const hot = Math.max(st.Pq[0] + st.Ps, st.Pq[1], st.Pq[2]) / ht;
            Pav.hot += (hot - Pav.hot) * a;
            Pav.cond += (Math.max(st.Pq[0], st.Pq[1], st.Pq[2]) / ht - Pav.cond) * a;
            Pav.sw += (st.Ps / ht - Pav.sw) * a;
          }
          if (rotor && !App.reducedMotion) rotor.setAttribute('transform', `rotate(${((st.thm * 180 / Math.PI) * 0.05 % 360).toFixed(1)} 235 140)`);
        }
        const istall = X.vs / m.R;
        const u = st.u, d = Math.abs(u), pos = u >= 0;
        const ri = clamp(Math.abs(st.i) / (istall * 0.3), 0, 2.5);
        const same = Math.sign(st.i) === Math.sign(u) || Math.abs(st.i) < 1e-3;
        fA.rate = pos ? ri * d : 0; fB.rate = pos ? 0 : ri * d;
        fA.dir = fB.dir = same ? 1 : -1;
        fRa.rate = st.i > 0 ? ri * (1 - d) : 0; fRb.rate = st.i < 0 ? ri * (1 - d) : 0;
        // switch states: sign–magnitude, synchronous: + → Q1 PWM, Q4 on, Q2 complementary; − → Q3 PWM, Q2 on, Q4 complementary
        const stt = pos ? ['pwm', 'cmp', 'off', 'on'] : ['off', 'on', 'pwm', 'cmp'];
        if (d < 0.005) { stt[0] = stt[2] = 'off'; stt[1] = stt[3] = 'on'; }
        const lblS = { pwm: 'PWM', cmp: L('senk.', 'sync'), on: L('AÇIK', 'ON'), off: L('kapalı', 'off') };
        qEl.forEach((el, j) => {
          el.classList.toggle('on', stt[j] === 'on');
          el.classList.toggle('pwm', stt[j] === 'pwm' || stt[j] === 'cmp');
          svg.querySelector('#g' + (j + 1)).textContent = lblS[stt[j]];
        });
        svg.querySelector('#hbV').textContent = App.num(X.vs, 0) + ' V';
        svg.querySelector('#hbDir').textContent = d < 0.005 ? L('fren (iki alt anahtar)', 'brake (both low sides)') : pos ? L('Q1+Q4 → saat yönü', 'Q1+Q4 → clockwise') : L('Q3+Q2 → saat yönü tersi', 'Q3+Q2 → counter-clockwise');
        svg.querySelector('#hbI').textContent = App.si(st.i, 'A', 2);
        const ang = st.thm / NG * 180 / Math.PI;
        const rad = ang * Math.PI / 180, srad = X.sp * Math.PI / 180;
        dArm.setAttribute('x2', (110 + 74 * Math.sin(rad)).toFixed(1)); dArm.setAttribute('y2', (110 - 74 * Math.cos(rad)).toFixed(1));
        dSp.setAttribute('x2', (110 + 90 * Math.sin(srad)).toFixed(1)); dSp.setAttribute('y2', (110 - 90 * Math.cos(srad)).toFixed(1));
        dTxt.textContent = App.num(ang, 1) + '°';
        const a = buf.a, tN = st.t;
        const yr = Math.max(200, Math.ceil(Math.max(...a.map(s => Math.abs(s.a)), Math.abs(X.sp)) / 90) * 90 + 20);
        if (yr !== pA.o.y[1]) pA.setRange({ y: [-yr, yr] });
        pA.line('a', a.map(s => [s.t - tN, s.a]), 'cu');
        pA.line('sp', a.map(s => [s.t - tN, s.sp]), 'acc dash');
        pU.line('u', a.map(s => [s.t - tN, s.u]), 'sig');
        pU.line('i', a.map(s => [s.t - tN, s.i / istall]), 'cu thin');
        pU.hline('z', 0, '');
        roAcc += dt;
        if (roAcc > 0.2) {
          roAcc = 0;
          const meas = measDeg();
          ro.set('a', App.num(meas, 2) + '° / ' + Math.floor(st.thm / TAU * CPR));
          ro.set('e', App.num(X.sp - meas, 2) + '°', Math.abs(X.sp - meas) > 2 ? 'warn' : 'ok');
          const s = st.step;
          if (s && Math.abs(s.to - s.from) > 5) {
            const up = s.to > s.from, os = up ? (s.peak - s.to) / (s.to - s.from) : (s.to - s.peak) / (s.from - s.to);
            ro.set('os', P100(Math.max(0, os) * 100, 1), os > 0.1 ? 'warn' : 'ok');
            const settled = st.t - s.last > 0.3;
            ro.set('ts', settled ? App.si(s.last - s.t0, 's', 3) : L('yerleşmedi…', 'not settled…'), settled ? 'ok' : '');
          } else { ro.set('os', '—'); ro.set('ts', '—'); }
          ro.set('pair', d < 0.005 ? 'Q2+Q4' : pos ? 'Q1+Q4 (' + L('kapalıda Q2+Q4', 'off-time Q2+Q4') + ')' : 'Q3+Q2 (' + L('kapalıda Q4+Q2', 'off-time Q4+Q2') + ')');
          ro.set('ipk', App.si(st.ipk, 'A', 3) + ' / ' + L('kilitli', 'stall') + ' ' + App.si(istall, 'A', 2), st.ipk > 0.8 * istall ? 'warn' : '');
          card.report({ m: mm, pc: Pav.cond, psw: Math.max(0, Pav.hot - Pav.cond), vpk: X.vs, ipk: Math.max(st.ipk, 0.01) });
        }
        run.clock(st.t);
      });
    }

    /* ---- RC servo mini demo ---- */
    {
      const panel = root.querySelector('[data-panel="pos"]');
      const lab = root.querySelector('#lab-servo');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const S = { pw: 1.5e-3, per: 20e-3, ang: 0, t: 0 };
      const row = App.h('div', { class: 'figrow' }); fig.appendChild(row);
      const pHost = App.h('div'), sHost = App.h('div'); row.append(pHost, sHost);
      const p = new Viz.Scope(pHost, { w: 440, h: 230, t0: 0, tdiv: 0.004, trig: 0, ariaLabel: L('Servo sinyali', 'Servo signal'), channels: [{ key: 's', name: L('servo sinyali', 'servo signal'), color: 'ch2', unit: 'V', scale: 1, pos: -2 }] });
      let winS = 0.04;
      const sv = Viz.schematic(sHost, 200, 200, `
        <rect x="40" y="70" width="120" height="80" rx="8" class="house"/>
        <circle cx="100" cy="100" r="12" class="hub"/>
        <g id="horn"><path d="M100,100L100,30" class="arm"/><circle cx="100" cy="36" r="5" class="hub"/></g>
        <circle cx="100" cy="100" r="5" class="hub"/>
        <text id="svA" x="100" y="180" class="sch-t big" text-anchor="middle"></text>`);
      const horn = sv.querySelector('#horn'), svA = sv.querySelector('#svA');
      UI.slider(ctl, { label: L('Darbe genişliği', 'Pulse width'), min: 0.5e-3, max: 2.5e-3, step: 0.01e-3, value: S.pw, fmt: v => App.num(v * 1000, 2) + ' ms', onInput: v => { S.pw = v; draw(); } });
      UI.segmented(ctl, { label: L('Çerçeve periyodu', 'Frame period'), value: 20, options: [{ value: 20, label: '20 ms (50 Hz)' }, { value: 3.3, label: '3,3 ms (300 Hz)' }], onChange: v => { S.per = v * 1e-3; winS = v > 10 ? 0.04 : 0.01; p.setTime({ t0: 0, tdiv: winS / 10 }); draw(); } });
      const ro = UI.readouts(ctl, [{ key: 'tg', label: L('Hedef açı', 'Target angle') }, { key: 'a', label: L('Horn açısı', 'Horn angle') }, { key: 'dc', label: L('Görev oranı', 'Duty') }]);
      const target = () => clamp((S.pw - 1.5e-3) * 90e3, -90, 90);
      function draw() {
        const pts = [[0, 0]];
        for (let k = 0; k * S.per < winS - 1e-9; k++) {
          const a = k * S.per;
          pts.push([a, 0], [a, 3.3], [Math.min(a + S.pw, winS), 3.3], [Math.min(a + S.pw, winS), 0]);
        }
        pts.push([winS, 0]);
        p.trace('s', pts);
        p.measure([{ label: L('genişlik', 'width'), value: App.num(S.pw * 1000, 2) + ' ms', color: 'ch2' }, { label: 'T', value: App.num(S.per * 1000, 1) + ' ms', color: 'ch2' }]);
        ro.set('tg', App.num(target(), 0) + '°', Math.abs(target()) > 45 ? 'warn' : 'ok');
        ro.set('dc', P100(S.pw / S.per * 100, 1));
      }
      draw();
      App.onFrame(dt => {
        if (panel.hidden) return;
        const tg = target(), step = 400 * dt; // 0.15 s / 60°
        const prevA = S.ang;
        S.ang = App.reducedMotion ? tg : (Math.abs(tg - S.ang) <= step ? tg : S.ang + Math.sign(tg - S.ang) * step);
        if (S.ang !== prevA || !horn.getAttribute('transform')) {
          horn.setAttribute('transform', `rotate(${S.ang.toFixed(1)} 100 100)`);
          svA.textContent = App.num(S.ang, 0) + '°';
          ro.set('a', App.num(S.ang, 0) + '°');
        }
      });
    }

    /* ===================================================================
       5. Solenoid: peak-and-hold vs DC, clamp choice, + single pulse
       =================================================================== */
    const SOL = { vs: 12, mode: 'pnh', tpk: 0.02, dh: 0.35, clampM: 'smart', vz: 24, ton: 0.15, per: 0.3, f: 20000 };
    const VFD = 0.7, IPULL = 0.65, IDROP = 0.2, TCL = 6e-3, TOP = 8e-3;
    const coil = vs => { const R = vs / 1; return { R, Lo: R * 1.5e-3, Lc: R * 5e-3 }; };
    const Lx = (c, x) => c.Lo + (c.Lc - c.Lo) * x * x;
    const VZDEF = { 5: 12, 12: 24, 24: 33 };
    let shotRedraw = () => {};
    {
      const panel = root.querySelector('[data-panel="sol"]');
      const lab = root.querySelector('#lab-sol');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const st = { t: 0, tc: 0, tp: 0, lam: 0, i: 0, x: 0, tgt: 0, on: false, cyc: null, last: null, Ec: 0, Es: 0, Ecl: 0, Pc: 0, Ps: 0, bin: null, ipk: 0, vpk: 0 };
      const buf = ring(400);
      let flows = [], svg = null, mech = null, plg = null, wind = null;

      const row = App.h('div', { class: 'figrow' }); fig.appendChild(row);
      const schHost = App.h('div'), mHost = App.h('div'); row.append(schHost, mHost);
      function buildSch() {
        flows.forEach(f => f.stop()); flows = [];
        schHost.innerHTML = '';
        const part = card.part();
        const z = SOL.clampM !== 'diode';
        svg = Viz.schematic(schHost, 470, 290, `
          ${Sch.vcc(300, 26, App.num(SOL.vs, 0) + ' V')}${Sch.w([[300, 26], [300, 70]])}
          ${Sch.ind(300, 100, 0, '')}<text x="250" y="104" class="sch-t" text-anchor="end">${L('bobin', 'coil')}</text>
          ${Sch.w([[300, 130], [400, 130]])}${Sch.dot(300, 130)}${Sch.dot(300, 70)}
          ${Sch.diode(400, 100, 180, '', '')}<text x="414" y="104" class="sch-t">D</text>
          ${z ? `${Sch.w([[400, 70], [380, 70]])}${Sch.diode(350, 70, 270, '', 'zener')}${Sch.w([[320, 70], [300, 70]])}<text x="350" y="94" class="sch-t" text-anchor="middle">Z ${App.num(SOL.vz, 0)} V</text>` : Sch.w([[400, 70], [300, 70]])}
          ${SOL.clampM === 'smart' ? `${Sch.w([[320, 70], [320, 45]])}${Sch.w([[380, 70], [380, 45]])}${Sch.sw(350, 45, 90, false, '', 'qz')}<text x="350" y="30" class="sch-t muted" text-anchor="middle">Q<tspan font-size="8">Z</tspan></text>` : ''}
          ${Sch.w([[300, 130], [300, 175]])}
          ${mosSym(part, 280, 205, part.id)}
          ${Sch.w([[300, 235], [300, 262]])}${Sch.gnd(300, 262)}
          ${Sch.box(14, 170, 96, 70, 'MCU', 'PEAK/HOLD')}
          ${Sch.w([[110, 205], [160, 205]], 'sigw')}${Sch.res(190, 205, 90, '')}
          ${Sch.w([[220, 205], [250, 205]], 'sigw')}${Sch.dot(235, 205)}${Sch.w([[235, 205], [235, 215]])}${Sch.res(235, 245, 0, '')}${Sch.gnd(235, 275)}
          <text id="soI" x="312" y="160" class="sch-t cu"></text>
          <text id="soV" x="330" y="222" class="sch-t"></text>
          <text x="420" y="250" class="sch-t muted" text-anchor="middle">low-side</text>`);
        flows.push(new Viz.Flow(svg, 'M300,26V262', { spacing: 14 }));
        flows.push(new Viz.Flow(svg, 'M300,70V130H400V70H300', { spacing: 12, speed: 60 }));
        flows.push(new Viz.Flow(svg, 'M110,205H250', { cls: 'flow e', spacing: 12, speed: 90 }));
      }
      mech = Viz.schematic(mHost, 230, 190, `
        <rect x="20" y="50" width="120" height="90" rx="4" class="house"/>
        <rect x="30" y="80" width="12" height="30" class="plunger"/>
        <g id="wind">${Array.from({ length: 9 }, (_, j) => `<line x1="${50 + j * 10}" y1="56" x2="${50 + j * 10}" y2="74" class="wind"/><line x1="${50 + j * 10}" y1="116" x2="${50 + j * 10}" y2="134" class="wind"/>`).join('')}</g>
        <g id="plg"><rect x="46" y="82" width="140" height="26" rx="3" class="plunger"/><path d="M186,95h10" class="springl"/></g>
        <path id="spr" class="springl" d=""/>
        <rect x="214" y="70" width="6" height="50" class="house"/>
        <text id="vState" x="115" y="30" class="sch-t big" text-anchor="middle"></text>
        <text x="115" y="170" class="sch-t muted" text-anchor="middle">${L('plunger (yay ile açılır)', 'plunger (spring opens it)')}</text>`);
      plg = mech.querySelector('#plg'); wind = mech.querySelector('#wind');
      const spr = mech.querySelector('#spr'), vState = mech.querySelector('#vState');

      const sc = new Viz.Scope(fig, { w: 600, h: 300, t0: -SOL.per, tdiv: SOL.per / 10, trig: false, ariaLabel: L('Bobin akımı osiloskobu', 'Coil current scope'), channels: [
        { key: 'i', name: 'I_coil', color: 'ch3', unit: 'A', scale: 0.2, pos: -0.6 },
        { key: 'x', name: L('plunger x', 'plunger x'), color: 'ch4', unit: '%', scale: 50, pos: -2.6 },
        { key: 'g', name: 'GATE', color: 'ch2', unit: 'V', scale: 5, pos: -3.9 }] });
      sc.fit('i', 0, 1.2, -0.6, 3.8, true); sc.fit('x', 0, 100, -2.5, -0.9, true); sc.fit('g', 0, 5, -3.9, -2.9);
      legend(fig, [['ok', L('I_çekme 0,65 A', 'I_pull-in 0.65 A')], ['bad', L('I_bırakma 0,2 A', 'I_drop-out 0.2 A')]]);

      const run = runner(ctl, { speed: 0.1, min: 0.005, max: 1, onReset: reset });
      const gC = grp(ctl, L('Sürme', 'Drive'));
      UI.segmented(gC, { label: L('Mod', 'Mode'), value: SOL.mode, options: [{ value: 'dc', label: L('Düz DC', 'Plain DC') }, { value: 'pnh', label: 'Peak-and-hold' }], onChange: v => { SOL.mode = v; vis(); } });
      const cTp = UI.slider(gC, { label: 't<sub>peak</sub>', min: 0.002, max: 0.06, step: 0.001, value: SOL.tpk, fmt: v => App.num(v * 1000, 0) + ' ms', onInput: v => { SOL.tpk = v; shotRedraw(); } });
      const cDh = UI.slider(gC, { label: L('Hold görev oranı (20 kHz)', 'Hold duty (20 kHz)'), min: 0.05, max: 1, step: 0.01, value: SOL.dh, fmt: pct, onInput: v => { SOL.dh = v; } });
      function vis() { cTp.el.hidden = cDh.el.hidden = SOL.mode !== 'pnh'; }
      vis();
      UI.segmented(gC, { label: L('Kelepçe', 'Clamp'), value: SOL.clampM, options: [{ value: 'diode', label: L('Diyot', 'Diode') }, { value: 'zener', label: L('Diyot + zener', 'Diode + zener') }, { value: 'smart', label: L('Hold: diyot, kapanış: zener', 'Hold: diode, off: zener') }], onChange: v => { SOL.clampM = v; buildSch(); shotRedraw(); } });
      const cVz = UI.slider(gC, { label: 'V<sub>Z</sub>', min: 5, max: 47, step: 1, value: SOL.vz, fmt: v => App.num(v, 0) + ' V', onInput: v => { SOL.vz = v; buildSch(); shotRedraw(); } });
      UI.segmented(gC, { label: L('Besleme', 'Supply'), value: SOL.vs, options: RAILS(), onChange: v => { SOL.vs = v; SOL.vz = VZDEF[v]; cVz.set(SOL.vz, true); buildSch(); shotRedraw(); } });
      const card = switchCard(ctl, { part: 'IRLZ44N', drv: 'pin5', filter: p => p.type === 'N', onChange: () => { buildSch(); } });
      const ro = UI.readouts(grp(ctl, L('Son çevrim', 'Last cycle')), [
        { key: 'pull', label: L('Çekme gecikmesi', 'Pull-in delay') }, { key: 'rel', label: L('Bırakma gecikmesi', 'Release delay') },
        { key: 'ipk', label: L('Tepe akım', 'Peak current') }, { key: 'ih', label: L('Tutma akımı (ort.)', 'Hold current (avg)') },
        { key: 'ph', label: L('Bobin gücü tutarken / DC', 'Coil power holding / DC') }, { key: 'sv', label: L('Tasarruf', 'Saving') },
        { key: 'vds', label: 'V<sub>DS</sub> ' + L('tepe', 'peak') }, { key: 'ecl', label: L('Kelepçede enerji / çevrim', 'Clamp energy / cycle') }
      ]);

      function newCycle() { st.cyc = { pull: null, rel: null, ipk: 0, hI: 0, hI2: 0, hT: 0, vpk: SOL.vs, ecl: 0 }; }
      function reset() { Object.assign(st, { t: 0, tc: 0, tp: 0, lam: 0, i: 0, x: 0, tgt: 0, on: false, Ec: 0, Es: 0, Ecl: 0, Pc: 0, Ps: 0, bin: null, last: null }); newCycle(); buf.clear(); }

      function advance(Hs, m) {
        const c = coil(SOL.vs), T = 1 / SOL.f;
        let guard = 0;
        while (Hs > 1e-12 && guard++ < 400000) {
          const pnh = SOL.mode === 'pnh';
          const cmd = st.tc < SOL.ton;
          const hold = cmd && pnh && st.tc >= SOL.tpk;
          if (!hold) st.tp = 0;
          const on = cmd && (!hold || st.tp < SOL.dh * T - 1e-15);
          // segment end
          const ends = [SOL.per - st.tc, 5e-5];
          if (cmd) ends.push(SOL.ton - st.tc);
          if (cmd && pnh && st.tc < SOL.tpk) ends.push(SOL.tpk - st.tc);
          if (hold) ends.push(on ? SOL.dh * T - st.tp : T - st.tp);
          let h = Hs; ends.forEach(e => { if (e > 1e-15 && e < h) h = e; });
          h = Math.max(h, 1e-12);
          // edges
          const zNow = !cmd ? SOL.clampM !== 'diode' : SOL.clampM === 'zener';
          const vcl = VFD + (zNow ? SOL.vz : 0);
          if (on !== st.on) {
            const vb = SOL.vs + vcl;
            if (st.i > 0) st.Es += 0.5 * vb * st.i * (on ? m.ton : m.toff);
            st.on = on;
          }
          const L0 = Lx(c, st.x);
          const i0 = st.lam / L0;
          let i1, iavg;
          if (on) {
            const Rt = c.R + m.ron;
            let iinf = (SOL.vs - m.v0) / Rt; if (iinf > m.isat) iinf = m.isat;
            const tau = L0 / Rt;
            i1 = iinf + (i0 - iinf) * Math.exp(-h / tau); iavg = expInt(i0, iinf, tau, h) / h;
            st.Ec += (m.v0 + iavg * m.ron) * iavg * h;
          } else if (i0 > 0) {
            const iinf = -vcl / c.R, tau = L0 / c.R;
            const tz = tau * Math.log((i0 - iinf) / (-iinf));
            if (tz < h) { i1 = 0; iavg = expInt(i0, iinf, tau, tz) / h; } else { i1 = iinf + (i0 - iinf) * Math.exp(-h / tau); iavg = expInt(i0, iinf, tau, h) / h; }
            st.Ecl += vcl * iavg * h; st.cyc.ecl += vcl * iavg * h;
            st.cyc.vpk = Math.max(st.cyc.vpk, SOL.vs + vcl);
          } else { i1 = 0; iavg = 0; }
          // plunger kinematics; flux linkage conserved through the L change
          if (i1 > IPULL) st.tgt = 1; else if (i1 < IDROP) st.tgt = 0;
          const x0 = st.x;
          st.x = clamp(st.x + (st.tgt ? h / TCL : -h / TOP), 0, 1);
          st.lam = i1 * L0;           // λ after the electrical step (L unchanged)
          st.i = st.lam / Lx(c, st.x); // i after L changed at constant λ
          st.cyc.ipk = Math.max(st.cyc.ipk, i0, i1);
          if (cmd && st.tc >= SOL.tpk && st.x >= 1) { st.cyc.hI += iavg * h; st.cyc.hI2 += iavg * iavg * h; st.cyc.hT += h; }
          if (st.cyc.pull == null && x0 < 1 && st.x >= 1 && cmd) st.cyc.pull = st.tc + h;
          if (!cmd && st.cyc.rel == null && x0 > 0 && st.x <= 0) st.cyc.rel = st.tc + h - SOL.ton;
          // bins
          if (!st.bin) st.bin = { ht: 0, imin: Infinity, imax: -Infinity, is: 0, x: 0, d: 0 };
          const b = st.bin; b.ht += h; b.imin = Math.min(b.imin, i0, i1); b.imax = Math.max(b.imax, i0, i1); b.is += iavg * h; b.x += st.x * h; b.d += (on ? 1 : 0) * h;
          if (b.ht >= SOL.per / 400) { buf.push({ t: st.t + h, imin: b.imin, imax: b.imax, i: b.is / b.ht, x: b.x / b.ht, d: b.d / b.ht }); st.bin = null; }
          st.t += h; st.tc += h; if (hold) st.tp += h; Hs -= h;
          if (st.tp >= T - 1e-15) st.tp = 0;
          if (st.tc >= SOL.per - 1e-12) { st.tc = 0; st.tp = 0; st.last = st.cyc; newCycle(); }
        }
      }

      buildSch(); reset();
      let roAcc = 0, fr = { sw: 0, fw: 0 };
      tabLoop(panel, () => flows, dt => {
        const c = coil(SOL.vs);
        const m = card.model(SOL.vs, Math.max(st.i, 0.3));
        if (run.playing) {
          const t0 = st.t, ec0 = st.Ec, es0 = st.Es;
          advance(dt * run.speed, m);
          const ht = st.t - t0;
          if (ht > 0) { const a = Math.min(1, ht / 0.6); st.Pc += ((st.Ec - ec0) / ht - st.Pc) * a; st.Ps += ((st.Es - es0) / ht - st.Ps) * a; }
        }
        const a = buf.a, tN = st.t;
        // current split for dots: average gate duty over the last bin
        const lb = a[a.length - 1] || { i: 0, d: 0, x: 0 };
        fr.sw = lb.i * lb.d; fr.fw = lb.i * (1 - lb.d);
        flows[0].rate = clamp(fr.sw / 0.4, 0, 2.5);
        flows[1].rate = clamp(fr.fw / 0.4, 0, 2.5);
        flows[2].rate = lb.d > 0.02 && lb.d < 0.98 ? 0.5 : 0;
        plg.setAttribute('transform', `translate(${(30 * (1 - st.x)).toFixed(1)},0)`);
        const px = 186 + 30 * (1 - st.x);
        let d = `M${px + 10},95`; const n = 6, wS = (214 - px - 10) / n;
        for (let j = 0; j < n; j++) d += `l${(wS / 2).toFixed(1)},${j % 2 ? 8 : -8}l${(wS / 2).toFixed(1)},${j % 2 ? -8 : 8}`;
        spr.setAttribute('d', d);
        wind.style.opacity = (0.25 + 0.75 * clamp(st.i / 1, 0, 1)).toFixed(2);
        vState.textContent = st.x >= 1 ? L('ÇEKİLİ (valf açık)', 'PULLED IN (valve open)') : st.x <= 0 ? L('bırakıldı', 'released') : L('hareket ediyor…', 'moving…');
        vState.setAttribute('class', 'sch-t big ' + (st.x >= 1 ? 'ok' : st.x <= 0 ? 'muted' : 'warn'));
        // like a real scope at a slow time base: the PWM ripple shows as a filled envelope
        const ip = [], gp = [];
        a.forEach(s => { const t = s.t - tN; ip.push([t, s.imin], [t, s.imax]); if (s.d > 0.98) gp.push([t, 5]); else if (s.d < 0.02) gp.push([t, 0]); else gp.push([t, 0], [t, 5]); });
        sc.trace('i', ip); sc.trace('g', gp); sc.trace('x', a.map(s => [s.t - tN, s.x * 100]));
        sc.level('pull', 'i', IPULL, 'ok'); sc.level('drop', 'i', IDROP, 'bad');
        const tI = svg.querySelector('#soI'); if (tI) tI.textContent = App.si(st.i, 'A', 2);
        const tV = svg.querySelector('#soV');
        if (tV) { const vds = st.on ? m.v0 + st.i * m.ron : (st.i > 0 ? SOL.vs + VFD + ((st.tc >= SOL.ton ? SOL.clampM !== 'diode' : SOL.clampM === 'zener') ? SOL.vz : 0) : SOL.vs); tV.textContent = 'V_DS ' + App.num(vds, 1) + ' V'; }
        roAcc += dt;
        if (roAcc > 0.2) {
          roAcc = 0;
          const r = st.last;
          const Idc = (SOL.vs - m.v0) / (c.R + m.ron), Pdc = Idc * Idc * c.R;
          if (r) {
            ro.set('pull', r.pull == null ? L('ÇEKMEDİ', 'DID NOT PULL IN') : App.si(r.pull, 's', 3), r.pull == null ? 'bad' : 'ok');
            ro.set('rel', r.rel == null ? (r.pull == null ? '—' : L('bırakmadı', 'did not release')) : App.si(r.rel, 's', 3), r.rel != null && r.rel > 0.03 ? 'warn' : 'ok');
            ro.set('ipk', App.si(r.ipk, 'A', 3));
            const ih = r.hT > 0 ? r.hI / r.hT : null, ph = r.hT > 0 ? r.hI2 / r.hT * c.R : null;
            ro.set('ih', ih == null ? '—' : App.si(ih, 'A', 3), ih != null && ih < IDROP * 1.3 ? 'warn' : '');
            ro.set('ph', (ph == null ? '—' : App.si(ph, 'W', 3)) + ' / ' + App.si(Pdc, 'W', 3));
            ro.set('sv', ph == null ? '—' : P100((1 - ph / Pdc) * 100, 0), ph != null && ph < Pdc * 0.5 ? 'ok' : '');
            ro.set('vds', App.num(r.vpk, 1) + ' V / ' + m.vmax + ' V', r.vpk > m.vmax ? 'bad' : r.vpk > 0.8 * m.vmax ? 'warn' : 'ok');
            ro.set('ecl', App.si(r.ecl, 'J', 3));
          } else ['pull', 'rel', 'ipk', 'ih', 'ph', 'sv', 'vds', 'ecl'].forEach(k => ro.set(k, L('ilk çevrim…', 'first cycle…')));
          card.report({ m, pc: st.Pc, psw: st.Ps, vpk: r ? r.vpk : SOL.vs + VFD + (SOL.clampM !== 'diode' ? SOL.vz : 0), ipk: Math.max(r ? r.ipk : Idc, 0.01) });
        }
        run.clock(st.t);
      });
    }

    /* ---- single-shot pulse ---- */
    {
      const lab = root.querySelector('#lab-shot');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const SH = { pw: 0.008 };
      const p = new Viz.Plot(fig, { w: 600, h: 220, x: [0, 0.05], y: [0, 1.2], xLabel: 't (ms)', yLabel: 'I (A), x', xFmt: v => App.num(v * 1000, 0), yFmt: v => App.num(v, 1), margin: { l: 56, r: 18, t: 12, b: 40 } });
      legend(fig, [['cu', L('bobin akımı', 'coil current')], ['acc', L('plunger x', 'plunger x')], ['sig', L('darbe', 'pulse')], ['ch1', L('kaynak enerjisi (ölçekli)', 'supply energy (scaled)')]]);
      UI.slider(ctl, { label: L('Darbe genişliği', 'Pulse width'), min: 0.0005, max: 0.03, step: 0.0001, value: SH.pw, fmt: v => App.num(v * 1000, 1) + ' ms', onInput: v => { SH.pw = v; draw(); } });
      const ro = UI.readouts(ctl, [
        { key: 'pull', label: L('Plunger çekildi mi?', 'Plunger pulled in?') }, { key: 'min', label: L('Çekme için en kısa darbe', 'Shortest pulse that pulls in') },
        { key: 'es', label: L('Kaynaktan enerji', 'Energy from supply') }, { key: 'er', label: L('Bobin direncinde ısı', 'Heat in coil resistance') },
        { key: 'ec', label: L('Kelepçede yakılan', 'Burned in the clamp') }, { key: 'em', label: L('Mekanik iş (denge)', 'Mechanical work (balance)') }
      ]);
      function sim(pw, rec) {
        const c = coil(SOL.vs), dt = 1e-5, tEnd = pw + 0.035;
        let lam = 0, i = 0, x = 0, tgt = 0, Es = 0, Er = 0, Ec = 0, pulled = false;
        const vcl = VFD + (SOL.clampM !== 'diode' ? SOL.vz : 0);
        const out = rec ? { i: [], x: [], e: [] } : null;
        for (let t = 0; t < tEnd; t += dt) {
          const on = t < pw, Lc = Lx(c, x);
          let i1, ia;
          if (on) { const iinf = SOL.vs / c.R, tau = Lc / c.R; i1 = iinf + (i - iinf) * Math.exp(-dt / tau); ia = expInt(i, iinf, tau, dt) / dt; Es += SOL.vs * ia * dt; }
          else if (i > 0) {
            const iinf = -vcl / c.R, tau = Lc / c.R, tz = tau * Math.log((i - iinf) / (-iinf));
            if (tz < dt) { i1 = 0; ia = expInt(i, iinf, tau, tz) / dt; } else { i1 = iinf + (i - iinf) * Math.exp(-dt / tau); ia = expInt(i, iinf, tau, dt) / dt; }
            Ec += vcl * ia * dt;
          } else { i1 = 0; ia = 0; }
          Er += ia * ia * c.R * dt;
          if (i1 > IPULL) tgt = 1; else if (i1 < IDROP) tgt = 0;
          x = clamp(x + (tgt ? dt / TCL : -dt / TOP), 0, 1);
          if (x >= 1) pulled = true;
          lam = i1 * Lc; i = lam / Lx(c, x);
          if (rec && Math.round(t / dt) % 10 === 0) { out.i.push([t, i]); out.x.push([t, x]); out.e.push([t, Es]); }
        }
        return { pulled, Es, Er, Ec, Em: Es - Er - Ec - 0.5 * Lx(c, x) * i * i, out, tEnd };
      }
      function draw() {
        const r = sim(SH.pw, true);
        p.setRange({ x: [0, r.tEnd] });
        const emax = Math.max(r.Es, 1e-6);
        p.line('i', r.out.i, 'cu'); p.line('x', r.out.x, 'acc');
        p.line('e', r.out.e.map(([t, e]) => [t, e / emax]), 'ch1 thin');
        p.line('g', [[0, 0], [0, 1.1], [SH.pw, 1.1], [SH.pw, 0], [r.tEnd, 0]], 'sig thin');
        p.hline('pl', IPULL, 'warn');
        ro.set('pull', r.pulled ? L('evet', 'yes') : L('hayır: yalnızca ısı', 'no: heat only'), r.pulled ? 'ok' : 'bad');
        let lo = 0.0002, hi = 0.05;
        if (!sim(hi, false).pulled) ro.set('min', '&gt; 50 ms');
        else {
          for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (sim(mid, false).pulled) hi = mid; else lo = mid; }
          ro.set('min', App.si(hi, 's', 3));
        }
        ro.set('es', App.si(r.Es, 'J', 3)); ro.set('er', App.si(r.Er, 'J', 3)); ro.set('ec', App.si(r.Ec, 'J', 3));
        ro.set('em', App.si(Math.max(0, r.Em), 'J', 3));
      }
      shotRedraw = draw;
      draw();
    }
  }
});
