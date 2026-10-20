/* 12 — Overcurrent, short circuit and SOA: current sensing (shunt designer), protection responses
   (fuse, PTC, comparator latch, foldback/eFuse) on a short-circuit timeline with junction temperature,
   the MOSFET safe operating area, reverse-polarity protection, ESD/TVS. */
(function () {
  'use strict';

  App.page({
    id: 'overcurrent',
    num: '12',
    group: { tr: 'Koruma', en: 'Protection' },
    title: { tr: 'Aşırı akım, kısa devre ve SOA', en: 'Overcurrent, short circuit and SOA' },
    blurb: { tr: 'Shunt ile akım ölçümü, sigorta/PTC/elektronik koruma, SOA eğrisi, ters polarite koruması.', en: 'Shunt current sensing, fuse/PTC/electronic protection, the SOA curve, reverse-polarity protection.' },
    summary: {
      tr: 'Her güç devresi bir gün kısa devre görür: sıkışan motor, ezilen kablo, ters takılan batarya. Neyin önce kopacağına sen karar vermezsen genelde MOSFET yanar. Bu bölüm akım ölçümünü, korumaların hızını ve SOA’yı anlatır.',
      en: 'Every power circuit sees a short one day: a stalled motor, a crushed cable, a reversed battery. If you do not decide what gives way first, the MOSFET usually does. This chapter covers current sensing, protection speed and the SOA.'
    },
    render(L) {
      return `
      ${App.keys([
        L('Soru “ne kadar akım” değil, “ne kadar akım, ne kadar süre”.', 'Ask not “how much current” but “how much, for how long”.'),
        L('Shunt’ı maksimum akımda 50–100 mV verecek şekilde seç.', 'Size the shunt for 50–100 mV at maximum current.'),
        L('MOSFET’i yalnızca µs’lik donanım koruması kurtarır; sigorta kabloyu korur.', 'Only µs hardware protection saves a MOSFET; a fuse protects the wiring.'),
        L('Lineer modda (hot-swap, soft-start) DC SOA’ya ve Spirito etkisine bak.', 'In linear mode (hot-swap, soft start) check DC SOA and the Spirito effect.'),
        L('Ters polariteye karşı P-MOS ya da ideal diyot kontrolcüsü kullan.', 'Use a P-MOS or ideal-diode controller against reverse polarity.')
      ])}
      <h2>${L('Aşırı yük ve kısa devre aynı şey değil', 'Overload and short circuit are not the same')}</h2>
      <div class="cards">
        <div class="card"><h4>${L('Aşırı yük (overload)', 'Overload')}</h4><p>${L('Akım nominalin 1,5–5 katı, ör. zorlanan motor. Isınma saniyeler–dakikalar sürer. Termal koruma, yavaş sigorta ya da yazılım yetebilir.', 'Current is 1.5–5× nominal, e.g. a labouring motor. Heating takes seconds to minutes. Thermal protection, a slow fuse or firmware can be enough.')}</p></div>
        <div class="card"><h4>${L('Kısa devre', 'Short circuit')}</h4><p>${L('Akımı yalnızca kaynak, kablo ve R<sub>DS(on)</sub> sınırlar: 12 V / 30 mΩ = 400 A. MOSFET µs–ms içinde ölür. Yalnızca donanım koruması bu kadar hızlıdır.', 'Only source, wiring and R<sub>DS(on)</sub> limit current: 12 V / 30 mΩ = 400 A. The MOSFET dies in µs to ms. Only hardware protection is that fast.')}</p></div>
      </div>
      <p>${L('Kısa devrede şunlar olur:', 'In a short circuit:')}</p>
      <ul>
        <li>${L('<b>Bağlantı telleri</b> (bond wire) I²t ile erir.', '<b>Bond wires</b> fuse by I²t.')}</li>
        <li>${L('<b>Jonksiyon</b> 175 °C’yi aşar; MOSFET genelde kısa devre olarak arızalanır ve yükü kapatamaz.', 'The <b>junction</b> exceeds 175 °C; the MOSFET usually fails short and cannot switch off.')}</li>
        <li>${L('MOSFET lineer bölgede akım sınırlıyorsa <b>SOA</b> aşılır.', 'If the MOSFET limits current in its linear region, the <b>SOA</b> is exceeded.')}</li>
        <li>${L('PCB yolları ve kablolar yanar.', 'PCB traces and wires burn.')}</li>
      </ul>
      <p>${L('Bu yüzden asıl soru: ne kadar akım, <b>ne kadar süre</b>?', 'So the real question is: how much current, <b>for how long</b>?')}</p>

      <h2>${L('Akımı ölçmek', 'Measuring current')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Yöntem', 'Method')}</th><th>${L('Nasıl', 'How')}</th><th>${L('Doğruluk', 'Accuracy')}</th><th>${L('Not', 'Notes')}</th></tr></thead>
        <tbody>
          <tr><td>${L('Low-side shunt', 'Low-side shunt')}</td><td>${L('Yük ile GND arasında küçük direnç; ADC veya op-amp', 'Small resistor between load and GND; ADC or op-amp')}</td><td>${L('iyi (%1)', 'good (1 %)')}</td><td>${L('En basiti; yük toprağı kayar, yükten GND’ye kısa devreyi görmez', 'Simplest; load ground shifts, a load-to-GND short is invisible')}</td></tr>
          <tr><td>${L('High-side shunt + akım algılama yükselteci', 'High-side shunt + current-sense amp')}</td><td>INA180 / INA181 (${L('analog', 'analog')}), INA240 (PWM ${L('reddi', 'rejection')}), INA219/INA226 (I²C)</td><td>${L('çok iyi (%0,1–1)', 'very good (0.1–1 %)')}</td><td>${L('Toprağa kısa devreyi de görür; standart çözüm', 'Also sees shorts to ground; the standard solution')}</td></tr>
          <tr><td>R<sub>DS(on)</sub> ${L('ile algılama', 'sensing')}</td><td>${L('MOSFET’in kendi V<sub>DS</sub>’ini ölç', 'Measure the MOSFET’s own V<sub>DS</sub>')}</td><td>${L('kötü (±%30–50)', 'poor (±30–50 %)')}</td><td>${L('Sıcaklıkla 1,5–2 kat değişir; yalnızca kısa devre tespiti için', 'Varies 1.5–2× with temperature; short detection only')}</td></tr>
          <tr><td>${L('Hall sensörü', 'Hall sensor')}</td><td>ACS712 / ACS724 / ACS37002</td><td>${L('orta (%1–3)', 'fair (1–3 %)')}</td><td>${L('Galvanik izolasyon, kayıp yok; ofset ve gürültü daha yüksek', 'Galvanic isolation, no loss; more offset and noise')}</td></tr>
        </tbody></table></div>
      <p>${L('Büyük shunt çözünürlüğü artırır ama kaybı ve toprak kaymasını da artırır. Hedef: maksimum akımda 50–100 mV, sonra yükselteçle ADC aralığına çıkar.', 'A larger shunt adds resolution, but also loss and ground shift. Target 50–100 mV at maximum current, then amplify to the ADC range.')}</p>
      <div class="eq">V<sub>shunt</sub> = I · R<sub>shunt</sub> &nbsp;&nbsp; P<sub>shunt</sub> = <b>I² · R<sub>shunt</sub></b> &nbsp;&nbsp; LSB = V<sub>FS</sub> / (2<sup>n</sup> · G · R<sub>shunt</sub>)</div>
      ${App.lab('lab-shunt', L('Shunt tasarlayıcı', 'Shunt designer'), {
        foot: L('Yükselteç ofseti ihmal edildi; INA180’de ~±150 µV, küçük gerilimlerde baskın hatadır. Önerilen kazanç ADC aralığının ~%90’ını dolduran standart değerdir. Shunt gücüne 2× pay bırak: 2512 ~1–2 W, 1206 ~0,25–0,5 W.',
                'Amplifier offset neglected; ~±150 µV on an INA180 dominates at small voltages. The suggested gain is the standard value filling ~90 % of the ADC range. Leave 2× margin on shunt power: 2512 ~1–2 W, 1206 ~0.25–0.5 W.')
      })}

      <h2>${L('Koruma tepkileri', 'Protection responses')}</h2>
      <p>${L('Korumalar hızlarına göre sıralanır. MOSFET’i yalnızca µs’lik olanlar kurtarır.', 'Protections differ mainly in speed. Only the µs-class ones save a MOSFET.')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Koruma', 'Protection')}</th><th>${L('Tepki süresi', 'Response time')}</th><th>${L('Sonra ne olur', 'What happens next')}</th><th>${L('Not', 'Notes')}</th></tr></thead>
        <tbody>
          <tr><td>${L('Sigorta', 'Fuse')}</td><td>${L('ms–s (I²t’ye bağlı)', 'ms–s (depends on I²t)')}</td><td>${L('Kalıcı açık; değiştirilmeli', 'Permanently open; must be replaced')}</td><td>${L('Kablo ve yangın koruması; MOSFET’e genelde yetişmez. Hızlı (F) ve gecikmeli (T) tipler var', 'Protects wiring and against fire; usually too slow for a MOSFET. Fast (F) and time-lag (T) types')}</td></tr>
          <tr><td>${L('PTC (resettable fuse)', 'PTC (resettable fuse)')}</td><td>${L('100 ms–s', '100 ms–s')}</td><td>${L('Isınıp yüksek dirence geçer; güç kesilip soğuyunca sıfırlanır', 'Heats into high resistance; resets once power is removed and it cools')}</td><td>${L('I<sub>hold</sub> ve I<sub>trip</sub> arasında ~2× fark; I<sub>max</sub> üstünde hasar görür', 'I<sub>hold</sub> and I<sub>trip</sub> differ by ~2×; damaged above I<sub>max</sub>')}</td></tr>
          <tr><td>${L('Komparatör + latch', 'Comparator + latch')}</td><td>${L('0,5–10 µs', '0.5–10 µs')}</td><td>${L('Gate kapanır; kilitli kalır (latch-off) ya da periyodik dener (hiccup)', 'Gate turns off; stays off (latch-off) or retries (hiccup)')}</td><td>${L('Hızlı, ucuz; yanlış tetiklemeye karşı filtre/blanking gerekir', 'Fast, cheap; needs filtering/blanking against false trips')}</td></tr>
          <tr><td>${L('Akım sınırlama / foldback', 'Current limit / foldback')}</td><td>${L('µs', 'µs')}</td><td>${L('MOSFET lineer bölgede akımı sabit tutar; foldback kısa devrede sınırı düşürür', 'MOSFET holds current constant in linear mode; foldback lowers the limit into a short')}</td><td>${L('MOSFET V<sub>DS</sub>·I harcar: SOA ve termal kapanma şart', 'MOSFET dissipates V<sub>DS</sub>·I: SOA and thermal shutdown are essential')}</td></tr>
          <tr><td>${L('eFuse / akıllı high-side anahtar', 'eFuse / smart high-side switch')}<br><span class="muted small">TPS25947, TPS259xx, BTS7002, VN7140</span></td><td>${L('µs', 'µs')}</td><td>${L('Akım sınırı, termal kapanma, hiccup/latch, teşhis çıkışı', 'Current limit, thermal shutdown, hiccup/latch, diagnostic output')}</td><td>${L('Hepsi tek pakette; otomotiv ve endüstride standart', 'All in one package; standard in automotive and industrial')}</td></tr>
          <tr><td>${L('Desaturasyon (DESAT)', 'Desaturation (DESAT)')}</td><td>${L('1–5 µs', '1–5 µs')}</td><td>${L('Yumuşak kapatma (soft turn-off)', 'Soft turn-off')}</td><td>${L('IGBT/SiC: iletimdeyken V<sub>CE</sub> &gt; 7–9 V ise kısa devre; izole sürücülerde dahili', 'IGBT/SiC: V<sub>CE</sub> &gt; 7–9 V while on means a short; built into isolated drivers')}</td></tr>
          <tr><td>${L('Cycle-by-cycle sınır', 'Cycle-by-cycle limit')}</td><td>${L('her PWM periyodunda', 'every PWM period')}</td><td>${L('Eşik geçilince o periyodun darbesi erken biter', 'Crossing the threshold ends that period’s pulse early')}</td><td>${L('Motor sürücü ve DC/DC’de standart; MCU’da “break/fault” girişi', 'Standard in motor drives and DC/DCs; “break/fault” input on MCU timers')}</td></tr>
        </tbody></table></div>
      ${App.lab('lab-short', L('Kısa devre anı: akım ve jonksiyon sıcaklığı', 'The short-circuit event: current and junction temperature'), {
        stack: true,
        foot: L('12 V batarya, kaynak + kablo 20 mΩ, 1 µH; R<sub>DS(on)</sub> = 10 mΩ, normal yük 3 A; t = 0’da yüke paralel R<sub>kısa</sub>. Isıl model: dört kademeli Foster ağı, ortam 25 °C. Sigorta I²t ≈ 1 s·I<sub>n</sub>²; PTC ∫I²dt ≈ 5 s·I<sub>trip</sub>². Foldback: kısa devrede %30, 150 °C’de kapanma, 130 °C’de yeniden deneme. 175 °C üstü kısa devre arızası. Zaman ekseni logaritmik.',
                '12 V battery, source + wiring 20 mΩ, 1 µH; R<sub>DS(on)</sub> = 10 mΩ, normal load 3 A; at t = 0 R<sub>short</sub> appears across the load. Thermal model: four-stage Foster network, ambient 25 °C. Fuse I²t ≈ 1 s·I<sub>n</sub>²; PTC ∫I²dt ≈ 5 s·I<sub>trip</sub>². Foldback: 30 % into a short, shutdown at 150 °C, retry at 130 °C. Above 175 °C the MOSFET fails short. Log time axis.')
      })}
      <div class="call warn"><strong>${L('Hiccup mı, latch-off mu?', 'Hiccup or latch-off?')}</strong>
        <ul>
          <li>${L('<b>Latch-off</b> güvenlidir, ama kullanıcı ya da MCU yeniden başlatmalı.', '<b>Latch-off</b> is safe but needs a user or MCU restart.')}</li>
          <li>${L('<b>Hiccup</b> kendiliğinden toparlanır, ama her denemede MOSFET ısınır. Kapalı süre çok uzun olmalı, ör. 1:100.', '<b>Hiccup</b> recovers on its own, but the MOSFET heats on each retry. Keep the off time long, e.g. 1:100.')}</li>
          <li>${L('Büyük kapasitif yükte hiccup açılışı kısa devre sanabilir. Blanking ya da dV/dt kontrollü açılış kullan.', 'With large capacitive loads hiccup may mistake start-up for a short. Use blanking or a dV/dt-controlled start.')}</li>
        </ul></div>

      <h2>${L('SOA: güvenli çalışma alanı', 'SOA: the safe operating area')}</h2>
      <p>${L('SOA grafiği, MOSFET’in hangi V<sub>DS</sub>–I<sub>D</sub> çiftini ne kadar süre taşıyabileceğini gösterir. Eksenler log-log’dur. Soldan sağa sınırlar:', 'The SOA chart shows which V<sub>DS</sub>–I<sub>D</sub> pairs a MOSFET survives, and for how long. Axes are log-log. Boundaries from left to right:')}</p>
      <ul>
        <li>${L('<b>R<sub>DS(on)</sub> çizgisi:</b> tam açıkken V/R<sub>DS(on)</sub>’dan fazla akım akamaz.', '<b>R<sub>DS(on)</sub> line:</b> fully on, no more than V/R<sub>DS(on)</sub> can flow.')}</li>
        <li>${L('<b>I<sub>D</sub> tavanı:</b> bağlantı telleri ve paket.', '<b>I<sub>D</sub> ceiling:</b> bond wires and package.')}</li>
        <li>${L('<b>Güç çizgileri:</b> P = V·I sabit; darbe kısaldıkça yukarı kayar.', '<b>Power lines:</b> constant P = V·I; they rise for shorter pulses.')}</li>
        <li>${L('<b>V<sub>(BR)DSS</sub> duvarı.</b>', '<b>V<sub>(BR)DSS</sub> wall.</b>')}</li>
      </ul>
      <div class="eq">ΔT<sub>j</sub> = P · Z<sub>th(j-c)</sub>(t<sub>p</sub>) &nbsp;&nbsp;⇒&nbsp;&nbsp; P<sub>${L('izin', 'allowed')}</sub>(t<sub>p</sub>) = (T<sub>j,max</sub> − T<sub>c</sub>) / Z<sub>th</sub>(t<sub>p</sub>)
        <span class="note">${L('Datasheet SOA’sı genelde T<sub>c</sub> = 25 °C ve tek darbe içindir. Gerçekte T<sub>c</sub> 80–100 °C olabilir: güç çizgilerini (175 − T<sub>c</sub>)/150 ile ölçekle.',
                               'Datasheet SOA is usually for T<sub>c</sub> = 25 °C and a single pulse. Real cases run at 80–100 °C: scale power lines by (175 − T<sub>c</sub>)/150.')}</span></div>
      ${App.lab('lab-soa', L('Etkileşimli SOA: çalışma noktanı yerleştir', 'Interactive SOA: place your operating point'), {
        foot: L('Örnek 60 V MOSFET: R<sub>DS(on)</sub> (sıcak) 10 mΩ; I<sub>D</sub> 100 A DC, 150 A 10 ms, 400 A ≤ 1 ms; Z<sub>th(j-c)</sub> DC 0,5, 10 ms 0,3, 1 ms 0,12, 100 µs 0,04 K/W; T<sub>c</sub> = 25 °C. Kesikli çizgiler: trench MOSFET’te Spirito etkisiyle ~10 V üstünde daha dik düşüş.',
                'Example 60 V MOSFET: R<sub>DS(on)</sub> (hot) 10 mΩ; I<sub>D</sub> 100 A DC, 150 A 10 ms, 400 A ≤ 1 ms; Z<sub>th(j-c)</sub> DC 0.5, 10 ms 0.3, 1 ms 0.12, 100 µs 0.04 K/W; T<sub>c</sub> = 25 °C. Dashed lines: the steeper fall above ~10 V of trench MOSFETs due to the Spirito effect.')
      })}
      <div class="call bad"><strong>${L('Lineer mod ve Spirito etkisi', 'Linear mode and the Spirito effect')}</strong>
        ${L('Düşük V<sub>GS</sub>’de eşik gerilimi sıcaklıkla düşer. Çipin sıcak bölgesi daha çok akım çeker, daha çok ısınır: sıcak nokta ve ani arıza. Modern trench MOSFET’ler bu yüzden lineer modda zayıftır. Hot-swap, eFuse ve lineer yük için “linear-mode rated” MOSFET seç.',
            'At low V<sub>GS</sub> the threshold falls with temperature. A hotter spot of the die takes more current and heats more: a hot spot and sudden failure. Modern trench MOSFETs are therefore weak in linear mode. For hot-swap, eFuse and linear loads, pick a “linear-mode rated” MOSFET.')}</div>

      <h2>${L('Ters polarite koruması', 'Reverse-polarity protection')}</h2>
      <p>${L('Ters takılan batarya, entegrelerin ESD diyotlarını ve MOSFET body diyotlarını iletime sokar. Kaynak kısa devre olur. Üç klasik çözüm:',
             'A reversed battery forward-biases IC ESD diodes and MOSFET body diodes. The source is shorted. Three classic fixes:')}</p>
      <ul>
        <li>${L('<b>Seri diyot:</b> basit, ama sürekli V<sub>F</sub>·I kaybı ve 0,3–0,7 V düşüm. Schottky kaybı yarıya indirir.', '<b>Series diode:</b> simple, but a constant V<sub>F</sub>·I loss and a 0.3–0.7 V drop. A Schottky halves the loss.')}</li>
        <li>${L('<b>Besleme yolunda P-MOS:</b> drain bataryaya, source yüke, gate dirençle GND’ye.', '<b>P-MOS in the supply path:</b> drain to battery, source to load, gate to GND through a resistor.')}
          <ul>
            <li>${L('Doğru polarite: V<sub>GS</sub> ≈ −V<sub>BAT</sub>, kanal açılır. Kayıp yalnızca I²·R<sub>DS(on)</sub>.', 'Correct polarity: V<sub>GS</sub> ≈ −V<sub>BAT</sub> and the channel turns on. Loss is only I²·R<sub>DS(on)</sub>.')}</li>
            <li>${L('Ters polarite: body diyot ters kutuplu, V<sub>GS</sub> ≈ 0, MOSFET kapalı.', 'Reversed: the body diode blocks, V<sub>GS</sub> ≈ 0, the MOSFET stays off.')}</li>
            <li>${L('V<sub>BAT</sub> &gt; ~15 V ise gate–source zener ve gate direnci şart.', 'Above ~15 V, add a gate–source zener and gate resistor.')}</li>
          </ul></li>
        <li>${L('<b>İdeal diyot kontrolcüsü</b> (LM74700, LTC4359): N-MOS’u diyot gibi sürer ve ters akımı µs’de keser. P-MOS çözümü açıkken iki yönlü iletir.', '<b>Ideal-diode controller</b> (LM74700, LTC4359): drives an N-MOS like a diode and blocks reverse current in µs. The P-MOS fix conducts both ways once on.')}</li>
      </ul>
      ${App.lab('lab-rev', L('Ters polarite: akım hangi yöne akabilir?', 'Reverse polarity: which way can current flow?'), {
        foot: L('V<sub>F</sub> = 0,8 V (Si), 0,45 V (Schottky); P-MOS R<sub>DS(on)</sub> = 20 mΩ, V<sub>GS</sub> ≥ 4,5 V’ta tam açık. Korumasız ters akım gösterge niteliğindedir.',
                'V<sub>F</sub> = 0.8 V (Si), 0.45 V (Schottky); P-MOS R<sub>DS(on)</sub> = 20 mΩ, fully on at V<sub>GS</sub> ≥ 4.5 V. Unprotected reverse current is indicative.')
      })}

      <h2>${L('ESD ve TVS: uzun kablolar, hassas gate’ler', 'ESD and TVS: long cables, sensitive gates')}</h2>
      <div class="cards">
        <div class="card"><h4>${L('Uzun kablolu girişler', 'Inputs on long cables')}</h4><p>${L('Kablolar kV mertebesinde darbeler taşır. Konnektörün hemen yanına TVS (24 V hat için SMBJ24A) ve seri direnç/ferrit koy.', 'Cables carry kV-class transients. Put a TVS (SMBJ24A for a 24 V line) right at the connector, plus series resistance/ferrite.')}</p></div>
        <div class="card"><h4>${L('Gate koruması', 'Gate protection')}</h4><p>${L('Gate oksidi ~±20 V’ta delinir. 10 kΩ pull-down, gerekirse 15–18 V zener/TVS ve uzun yolda seri 10–100 Ω kullan.', 'Gate oxide breaks down near ±20 V. Use a 10 kΩ pull-down, a 15–18 V zener/TVS if needed, and 10–100 Ω on long traces.')}</p></div>
        <div class="card"><h4>${L('Load dump', 'Load dump')}</h4><p>${L('Otomotivde 12 V hat yüzlerce ms boyunca 40–100 V görür (ISO 16750). V<sub>DSS</sub> ve TVS buna göre seçilir.', 'In vehicles the 12 V rail sees 40–100 V for hundreds of ms (ISO 16750). Choose V<sub>DSS</sub> and TVS for it.')}</p></div>
      </div>

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <p>${L('12 V motor: çalışmada 2 A, kalkışta ~150 ms boyunca 10 A çeker. Korumayı dört adımda kuralım.', '12 V motor: 2 A running, 10 A for ~150 ms at start. Build the protection in four steps.')}</p>
      <details class="fold"><summary>${L('Hangi sigorta kalkışı geçirir ama kabloyu korur?', 'Which fuse passes the start but protects the wiring?')}</summary><div>
        ${App.example({
          given: [[L('Kalkış', 'Start'), L('10 A, 150 ms', '10 A, 150 ms')], [L('Çalışma', 'Running'), '2 A']],
          steps: [
            [L('Hızlı 3 A sigorta', 'Fast 3 A fuse'), '', L('atar', 'blows'), L('kalkışta açılır', 'opens at start-up')],
            [L('Gecikmeli (T) 4 A, oran', 'Time-lag (T) 4 A, ratio'), '10 A / 4 A', L('2,5 · I<sub>n</sub>', '2.5 · I<sub>n</sub>')],
            [L('Erime süresi', 'Melting time'), '', '≈ 1–10 s', L('150 ms’den çok uzun', 'far longer than 150 ms')]
          ],
          result: L('<b>Gecikmeli 4 A sigorta seç.</b> Kalkışı geçirir; kalıcı kilitlenme ve kısa devrede kabloyu korur.', '<b>Choose a 4 A time-lag fuse.</b> It passes the start and protects the wiring from a sustained stall or short.'),
          level: 'ok'
        })}
      </div></details>
      <details class="fold"><summary>${L('Shunt ve yükselteç kazancı ne olmalı?', 'What shunt and amplifier gain?')}</summary><div>
        ${App.example({
          given: [['R<sub>shunt</sub>', '10 mΩ'], ['ADC', L('3,3 V, 12 bit', '3.3 V, 12 bit')], ['I<sub>max</sub>', '10 A']],
          steps: [
            [L('Shunt gerilimi, 2 A', 'Shunt voltage, 2 A'), '2 A · 10 mΩ', '20 mV'],
            [L('Shunt gerilimi, 10 A', 'Shunt voltage, 10 A'), '10 A · 10 mΩ', '100 mV'],
            [L('Kayıp, kilitlenmede', 'Loss, stalled'), '10² · 10 mΩ', '1 W', L('2512 kılıf, 2 W sınıfı', '2512 package, 2 W class')],
            [L('Kazanç 50 ile', 'With gain 50'), '100 mV · 50', '5 V', L('ADC aralığını aşar', 'exceeds the ADC range')],
            [L('Kazanç 20 ile', 'With gain 20'), '100 mV · 20', '2 V', L('aralığın %60’ı', '60 % of range')],
            ['LSB', L('3,3 V / (4096 · 20 · 10 mΩ)', '3.3 V / (4096 · 20 · 10 mΩ)'), '≈ 4 mA']
          ],
          result: L('<b>10 mΩ / 2 W shunt ve kazanç 20.</b> 10 A tam ölçülür, çözünürlük 4 mA.', '<b>10 mΩ / 2 W shunt with gain 20.</b> 10 A fits, with 4 mA resolution.'),
          level: 'ok'
        })}
      </div></details>
      <details class="fold"><summary>${L('Kısa devre ve kilitlenme nasıl ayrılır?', 'How to tell a short from a stall?')}</summary><div>
        ${App.example({
          given: [[L('Kalkış', 'Start'), '10 A'], ['R<sub>shunt</sub>', '10 mΩ'], ['R<sub>DS(on)</sub>', '10 mΩ']],
          steps: [
            [L('Komparatör eşiği', 'Comparator threshold'), L('kalkışın 2 katı', '2× start current'), '20 A', L('tepki &lt; 10 µs, latch-off', 'response &lt; 10 µs, latch-off')],
            [L('Shunt’ta eşik gerilimi', 'Threshold across shunt'), '20 A · 10 mΩ', '200 mV', L('kazanç 20 sonrası 4 V olurdu: ayrı hızlı komparatör kullan', 'after gain 20 it would be 4 V: use a separate fast comparator')],
            [L('Yazılım kilitlenme kuralı', 'Firmware stall rule'), 'I &gt; 6 A, t &gt; 500 ms', L('PWM kapat', 'PWM off'), L('150 ms’lik kalkış tetiklemez', 'the 150 ms start does not trigger it')],
            [L('Bu sürede MOSFET kaybı', 'MOSFET loss meanwhile'), '10² · 10 mΩ', '1 W']
          ],
          result: L('<b>Kısa devreyi donanım, kilitlenmeyi yazılım yakalar.</b> Yarım saniyelik 1 W MOSFET için sorun değil.', '<b>Hardware catches the short, firmware catches the stall.</b> Half a second at 1 W is harmless to the MOSFET.'),
          level: 'ok'
        })}
      </div></details>`;
    },

    mount(root, App) {
      const { Viz } = App, { Sch, UI } = Viz, L = App.L;

      /* ---------------- Lab: shunt designer ---------------- */
      {
        const lab = root.querySelector('#lab-shunt');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const svg = Viz.schematic(fig, 600, 270, `
          ${Sch.vcc(300, 25, 'V_LOAD')}
          ${Sch.load(300, 55, 0, L('yük', 'load'))}
          ${Sch.nmos(280, 115, '')}
          ${Sch.w([[300, 145], [300, 150]])}
          ${Sch.res(300, 180, 0, '')}
          <text x="286" y="184" class="sch-t cu" text-anchor="end">R_shunt</text>
          ${Sch.gnd(300, 210)}
          ${Sch.box(20, 95, 80, 40, 'MCU', 'PWM')}
          ${Sch.w([[100, 115], [250, 115]], 'sigw')}${Sch.dot(200, 115)}
          ${Sch.w([[300, 150], [380, 150]])}${Sch.dot(300, 150)}
          ${Sch.w([[300, 210], [360, 210], [360, 170], [380, 170]])}${Sch.dot(300, 210)}
          ${Sch.box(380, 130, 70, 50, 'INA', '')}
          <text id="shG" x="415" y="194" class="sch-t muted" text-anchor="middle"></text>
          ${Sch.w([[450, 155], [470, 155], [470, 125], [490, 125]])}${Sch.w([[470, 155], [470, 195], [490, 195]])}${Sch.dot(470, 155)}
          ${Sch.box(490, 105, 90, 40, 'ADC', '')}
          ${Sch.box(490, 175, 90, 40, 'COMP', L('eşik', 'threshold'))}
          ${Sch.w([[535, 215], [535, 245], [200, 245], [200, 115]], 'sigw')}
          <text x="360" y="257" class="sch-t sig" text-anchor="middle">${L('aşırı akım → gate kapat (latch)', 'overcurrent → kill gate (latch)')}</text>
          <text id="shV" x="320" y="92" class="sch-t cu"></text>
          <text id="shA" x="535" y="98" class="sch-t sig" text-anchor="middle"></text>
        `);
        const fL = new Viz.Flow(svg, 'M300,25V210', { spacing: 14 });
        const fS = new Viz.Flow(svg, 'M300,150H380', { cls: 'flow e', spacing: 12, speed: 30, r: 2 });
        const p = new Viz.Plot(fig, { w: 600, h: 200, x: [0, 1], y: [0, 3.3], xLabel: L('akım / I_max', 'current / I_max'), yLabel: 'V_ADC (V)', xFmt: v => Math.round(v * 100) + '%', yFmt: v => App.num(v, 1) });
        const sI = UI.slider(ctl, { label: L('Maksimum akım I<sub>max</sub>', 'Maximum current I<sub>max</sub>'), min: 0.1, max: 50, step: 0.1, value: 10, log: true, fmt: v => App.si(v, 'A'), onInput: update });
        const sR = UI.slider(ctl, { label: 'R<sub>shunt</sub>', min: 1e-3, max: 1, step: 0.5e-3, value: 10e-3, log: true, unit: 'Ω', onInput: update });
        const sFs = UI.slider(ctl, { label: L('ADC tam skala', 'ADC full scale'), min: 1, max: 5, step: 0.1, value: 3.3, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sBits = UI.segmented(ctl, { label: L('ADC çözünürlüğü', 'ADC resolution'), options: [{ value: 10, label: '10 bit' }, { value: 12, label: '12 bit' }, { value: 16, label: '16 bit' }], value: 12, onChange: update });
        const sG = UI.segmented(ctl, { label: L('Yükselteç kazancı G', 'Amplifier gain G'), options: [1, 20, 50, 100, 200].map(g => ({ value: g, label: String(g) })), value: 20, onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'vs', label: L('Shunt gerilimi (I<sub>max</sub>)', 'Shunt voltage (I<sub>max</sub>)') },
          { key: 'ps', label: L('Shunt gücü (I<sub>max</sub>)', 'Shunt power (I<sub>max</sub>)') },
          { key: 'va', label: L('ADC girişi (I<sub>max</sub>)', 'ADC input (I<sub>max</sub>)') },
          { key: 'lsb', label: L('Çözünürlük (1 LSB)', 'Resolution (1 LSB)') },
          { key: 'use', label: L('ADC aralığı kullanımı', 'ADC range used') },
          { key: 'gr', label: L('Önerilen kazanç', 'Recommended gain') }
        ]);
        let frac = 0, Vsh = 0, G = 20, FS = 3.3;
        function update() {
          const I = sI.value, R = sR.value; FS = sFs.value; G = sG.value;
          const bits = sBits.value;
          Vsh = I * R;
          const P = I * I * R, Va = Vsh * G;
          const lsb = FS / Math.pow(2, bits) / (G * R);
          const std = [20, 25, 50, 100, 200];
          const ideal = 0.9 * FS / Vsh;
          const rec = std.filter(g => g <= ideal).pop();
          p.setRange({ y: [0, FS * 1.25] });
          p.line('v', Va > FS ? [[0, 0], [FS / Va, FS], [1, FS]] : [[0, 0], [1, Va]], 'sig');
          p.line('ideal', [[0, 0], [1, Va]], 'faint dash');
          p.hline('fs', FS, 'bad');
          p.text('fst', 0.02, FS, L('ADC tam skala', 'ADC full scale'), 'bad', 'start', 0, -5);
          p.rect('clip', Va > FS ? FS / Va : 1, 0, 1, FS * 1.25, 'bad'); p.hide('clip', Va <= FS);
          ro.set('vs', App.si(Vsh, 'V'), Vsh < 0.01 ? 'warn' : Vsh > 0.2 ? 'warn' : 'ok');
          ro.set('ps', App.si(P, 'W') + (P > 1 ? ' (2512+)' : ''), P > 2 ? 'bad' : P > 0.5 ? 'warn' : 'ok');
          ro.set('va', App.num(Va, 2) + ' V' + (Va > FS ? L(' — kırpılıyor!', ' — clipping!') : ''), Va > FS ? 'bad' : '');
          ro.set('lsb', App.si(lsb, 'A'));
          ro.set('use', App.num(Math.min(100, Va / FS * 100), 0) + ' %', Va > FS ? 'bad' : Va / FS < 0.3 ? 'warn' : 'ok');
          ro.set('gr', rec ? 'G = ' + rec + ' (' + App.num(Vsh * rec, 2) + ' V)' : L('kazanç < 20: G = 1 veya bölücü', 'gain < 20: use G = 1 or a divider'));
          svg.querySelector('#shG').textContent = 'G = ' + G;
        }
        update();
        let t = 0;
        App.onFrame(dt => {
          t += App.reducedMotion ? 0 : dt;
          frac = 0.55 + 0.45 * Math.sin(t * 0.9);
          const Va = Math.min(FS, frac * Vsh * G);
          p.vline('cur', frac, 'sig solid');
          p.dot('d', frac, Va, frac * Vsh * G > FS ? 'bad' : 'sig', 4.5);
          fL.rate = frac * 1.4;
          fS.rate = 0.3;
          svg.querySelector('#shV').textContent = 'V_shunt = ' + App.si(frac * Vsh, 'V');
          svg.querySelector('#shA').textContent = App.num(Va, 2) + ' V';
        });
      }

      /* ---------------- Lab: short-circuit timeline ---------------- */
      {
        const lab = root.querySelector('#lab-short');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const svg = Viz.schematic(fig, 600, 190, `
          ${Sch.vsrc(50, 90, '')}<text x="68" y="94" class="sch-t">12 V</text>
          ${Sch.w([[50, 60], [50, 30], [110, 30]])}
          <rect x="110" y="12" width="120" height="36" rx="4" class="ic-body" style="fill:var(--panel);stroke:var(--ink);stroke-width:1.8"/>
          <text id="scBox" x="170" y="35" class="sch-t" text-anchor="middle" style="font-weight:600"></text>
          ${Sch.w([[230, 30], [500, 30]])}${Sch.dot(420, 30)}
          ${Sch.load(420, 60, 0, '')}<text x="388" y="64" class="sch-t" text-anchor="end">${L('yük', 'load')}</text>
          <g id="scSwO">${Sch.sw(500, 60, 0, false, '')}</g><g id="scSwC">${Sch.sw(500, 60, 0, true, '')}</g>
          <text x="516" y="64" class="sch-t bad">R_${L('kısa', 'short')}</text>
          ${Sch.w([[420, 90], [500, 90]])}${Sch.dot(420, 90)}
          ${Sch.nmos(400, 120, '')}
          ${Sch.w([[330, 120], [370, 120]], 'sigw')}<text x="326" y="124" class="sch-t sig" text-anchor="end">gate</text>
          ${Sch.w([[420, 150], [420, 170], [50, 170], [50, 120]])}
          <text id="scI" x="130" y="80" class="sch-t cu big"></text>
          <text id="scT" x="130" y="104" class="sch-t"></text>
          <text id="scSt" x="130" y="140" class="sch-t big"></text>
        `);
        const fN = new Viz.Flow(svg, 'M50,60V30H420V170H50V120', { spacing: 14 });
        const fS = new Viz.Flow(svg, 'M50,60V30H500V90H420V170H50V120', { cls: 'flow bad', spacing: 10, speed: 110, r: 3 });
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const bA = App.h('div'), bB = App.h('div'); grid.append(bA, bB);
        const xr = [1e-7, 10];
        const xf = v => App.si(v, 's', 1);
        const pI = new Viz.Plot(bA, { w: 420, h: 250, x: xr, y: [0, 200], logX: true, xLabel: L('zaman (kısa devreden sonra)', 'time (after the short)'), yLabel: 'I (A)', xFmt: xf, yFmt: v => App.num(v, 0) });
        const pT = new Viz.Plot(bB, { w: 420, h: 250, x: xr, y: [0, 260], logX: true, xLabel: L('zaman (kısa devreden sonra)', 'time (after the short)'), yLabel: 'T_j (°C)', xFmt: xf, yFmt: v => App.num(v, 0), yTicks: [25, 75, 125, 175, 225] });
        const mode = UI.segmented(ctl, { label: L('Koruma', 'Protection'), options: [
          { value: 'none', label: L('Yok', 'None') }, { value: 'fuse', label: L('Sigorta', 'Fuse') }, { value: 'ptc', label: 'PTC' },
          { value: 'latch', label: L('Komp. + latch', 'Comp. + latch') }, { value: 'fold', label: 'Foldback' }], value: 'latch', onChange: update });
        const sRs = UI.slider(ctl, { label: L('Kısa devre direnci R<sub>kısa</sub>', 'Short resistance R<sub>short</sub>'), min: 5e-3, max: 5, step: 1e-3, value: 50e-3, log: true, unit: 'Ω', onInput: update });
        const sTr = UI.slider(ctl, { label: L('Tepki süresi (komp./foldback)', 'Response time (comp./foldback)'), min: 0.5e-6, max: 1e-3, step: 0.1e-6, value: 5e-6, log: true, unit: 's', onInput: update });
        const sTh = UI.slider(ctl, { label: L('Eşik / sigorta değeri', 'Threshold / fuse rating'), min: 2, max: 100, step: 0.5, value: 20, log: true, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'ip', label: L('Olası kısa devre akımı', 'Prospective short current') },
          { key: 'pk', label: L('Tepe akım', 'Peak current') },
          { key: 'tc', label: L('Kesme süresi', 'Time to interrupt') },
          { key: 'i2t', label: L('Geçen I²t', 'Let-through I²t') },
          { key: 'tj', label: L('Maks. T<sub>j</sub>', 'Max T<sub>j</sub>') },
          { key: 'res', label: L('Sonuç', 'Outcome') }
        ]);
        const V = 12, Rsrc = 0.02, Rds = 0.01, Lw = 1e-6, Rload = 12 / 3 - 0.03;
        const foster = [[0.15, 1e-4], [0.35, 3e-3], [0.5, 50e-3], [30, 20]];
        let S = null, tc = 0;
        function update() {
          const m = mode.value, Rsh = sRs.value, tr = sTr.value, th = sTh.value;
          const Rext = Rload * Rsh / (Rload + Rsh);
          const Rtot = Rsrc + Rds + Rext;
          const I0 = V / (Rsrc + Rds + Rload), Iss = V / Rtot, tauL = Lw / Rtot;
          const Ilin = t => I0 + (Iss - I0) * (1 - Math.exp(-t / tauL));
          const N = 1400, l0 = Math.log10(xr[0]), l1 = Math.log10(xr[1]);
          const ts = []; for (let k = 0; k <= N; k++) ts.push(Math.pow(10, l0 + (l1 - l0) * k / N));
          const Tst = foster.map(([r]) => I0 * I0 * Rds * r); // pre-short steady state
          let Tj = 25 + Tst.reduce((a, b) => a + b, 0);
          let tPrev = 0, state = 'on', failed = false, tFail = NaN, tClear = NaN, acc = 0, i2t = 0, tTrip = NaN, Ipk = I0, TjMax = Tj, cut = false, hic = 0;
          const pts = [], tps = [];
          let I = I0;
          for (const tEnd of ts) {
           const nSub = Math.max(1, Math.ceil((tEnd - tPrev) / 2e-4)); // ≤ 0.2 ms thermal sub-steps
           const dt = (tEnd - tPrev) / nSub;
           for (let j = 1; j <= nSub; j++) {
            const t = tPrev + dt * j;
            const Ip = failed ? V / (Rsrc + Rext) : Ilin(t);
            let P;
            if (state === 'off' || state === 'tsd') { I = 0; P = 0; }
            else if (state === 'leak') { I = Math.min(Ip, 0.12); P = I * I * Rds; }
            else if (m === 'fold' && !failed && state === 'lim') {
              const Ilim = (V - th * (Rsrc + Rext)) > 6 ? 0.3 * th : th;
              I = Math.min(Ip, Ilim);
              const vds = Math.max(0, V - I * (Rsrc + Rext));
              P = vds * I + I * I * Rds;
            } else { I = Ip; P = I * I * Rds * (failed ? 0.2 : 1); }
            // thermal update (exact for constant P over dt)
            for (let k = 0; k < foster.length; k++) {
              const [r, tau] = foster[k];
              Tst[k] = P * r + (Tst[k] - P * r) * Math.exp(-dt / tau);
            }
            Tj = failed ? 255 : Math.min(255, 25 + Tst.reduce((a, b) => a + b, 0));
            if (!failed && Tj > 175) { failed = true; tFail = t; if (m === 'latch' || m === 'fold') state = 'on'; }
            i2t += I * I * dt;
            Ipk = Math.max(Ipk, I); TjMax = Math.max(TjMax, Tj);
            // protection state machine
            if (m === 'fuse' && state === 'on') {
              acc += Math.max(0, I * I - Math.pow(1.3 * th, 2)) * dt;
              if (acc >= th * th * 1) { state = 'off'; tClear = t; }
            } else if (m === 'ptc' && state === 'on') {
              acc += Math.max(0, I * I - th * th) * dt;
              if (acc >= 5 * th * th) { state = 'leak'; tClear = t; }
            } else if (m === 'latch' && state === 'on' && !failed) {
              if (isNaN(tTrip) && I >= th) tTrip = t;
              if (!isNaN(tTrip) && t >= tTrip + tr) { state = 'off'; tClear = t; }
            } else if (m === 'fold' && !failed) {
              if (state === 'on') { if (isNaN(tTrip) && I >= th) tTrip = t; if (!isNaN(tTrip) && t >= tTrip + tr) { state = 'lim'; if (isNaN(tClear)) tClear = t; } }
              else if (state === 'lim' && Tj >= 150) { state = 'tsd'; hic++; }
              else if (state === 'tsd' && Tj <= 130) state = 'lim';
            }
            if (state === 'tsd') { I = 0; }
           }
            pts.push([tEnd, I]); tps.push([tEnd, Tj]);
            tPrev = tEnd;
          }
          cut = !isNaN(tClear);
          S = { pts, tps, Ipk, failed, tFail, tClear, m, Iss };
          pI.setRange({ y: [0, Math.max(5, Ipk * 1.12)] });
          pI.line('i', pts, 'cu');
          pI.area('ia', pts, 'cu');
          pI.hline('th', th, m === 'none' ? '' : 'sig');
          pI.text('tht', 1.5e-7, th, m === 'fuse' ? L('I_n (sigorta)', 'I_n (fuse)') : m === 'ptc' ? 'I_trip' : m === 'none' ? '' : L('eşik', 'threshold'), 'sig', 'start', 0, -5);
          pT.line('t', tps, failed ? 'bad' : 'cu');
          pT.hline('tmax', 175, 'bad');
          pT.text('tmaxt', 1.5e-7, 175, L('T_j,max 175 °C', 'T_j,max 175 °C'), 'bad', 'start', 0, -5);
          pT.rect('fail', failed ? tFail : 10, 0, 10, 260, 'bad'); pT.hide('fail', !failed);
          pI.rect('fail', failed ? tFail : 10, 0, 10, Math.max(5, Ipk * 1.12), 'bad'); pI.hide('fail', !failed);
          pT.text('failt', failed ? tFail : 1, 240, L('MOSFET arızalandı (kısa devre)', 'MOSFET failed (short)'), 'bad', failed && tFail > 0.01 ? 'end' : 'start', failed && tFail > 0.01 ? -4 : 4);
          pT.hide('failt', !failed);
          ro.set('ip', App.si(Iss, 'A'));
          ro.set('pk', App.si(Ipk, 'A'), Ipk > 100 ? 'bad' : Ipk > 30 ? 'warn' : '');
          const clearTxt = m === 'fold' && cut ? L('sınırlandı ', 'limited ') + App.si(tClear, 's') + (hic ? ' · hiccup ×' + hic : '') : cut ? App.si(tClear, 's') : L('kesilmedi', 'not interrupted');
          ro.set('tc', clearTxt, cut ? (m === 'fold' ? 'warn' : 'ok') : 'bad');
          ro.set('i2t', (App.lang === 'tr' ? String(Number(i2t.toPrecision(3))).replace('.', ',') : String(Number(i2t.toPrecision(3)))) + ' A²s');
          ro.set('tj', TjMax > 175 ? '> 175 °C' : App.num(TjMax, 0) + ' °C', TjMax > 175 ? 'bad' : TjMax > 150 ? 'warn' : 'ok');
          let res, st;
          if (failed) { res = L('MOSFET öldü', 'MOSFET dead'); st = 'bad'; }
          else if (Iss < 1.3 * th && (m === 'fuse' || m === 'ptc' || m === 'latch' || m === 'fold') && !cut) { res = L('aşırı yük: koruma görmedi', 'overload: protection did not see it'); st = 'warn'; }
          else if (m === 'none') { res = TjMax > 120 ? L('sıcak ama hayatta', 'hot but alive') : L('aşırı yük, sorun yok', 'overload, survivable'); st = TjMax > 120 ? 'warn' : 'ok'; }
          else { res = L('korundu', 'protected'); st = 'ok'; }
          ro.set('res', res, st);
          svg.querySelector('#scBox').textContent = { none: L('koruma yok', 'no protection'), fuse: L('sigorta ', 'fuse ') + App.num(th, 0) + ' A', ptc: 'PTC ' + App.num(th, 0) + ' A', latch: L('komparatör+latch', 'comparator+latch'), fold: L('foldback/eFuse', 'foldback/eFuse') }[m];
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!S) return;
          tc += dt;
          const ph = App.reducedMotion ? 1 : Math.min(1, (tc % 5) / 4.2);
          const k = Math.min(S.pts.length - 1, Math.floor(ph * (S.pts.length - 1)));
          const [t, I] = S.pts[k], Tj = S.tps[k][1];
          pI.vline('cur', t, 'sig solid'); pT.vline('cur', t, 'sig solid');
          pI.dot('d', t, I, '', 4); pT.dot('d', t, Tj, Tj > 175 ? 'bad' : '', 4);
          const sc = ph > 0.002;
          svg.querySelector('#scSwO').style.display = sc ? 'none' : '';
          svg.querySelector('#scSwC').style.display = sc ? '' : 'none';
          const r = Math.min(3, I / Math.max(1, S.Ipk) * 3);
          fS.rate = sc ? r : 0; fN.rate = sc ? Math.min(0.4, r) : 1;
          svg.querySelector('#scI').textContent = 'I = ' + App.si(I, 'A');
          svg.querySelector('#scT').textContent = 't = ' + App.si(t, 's', 2) + '   T_j = ' + App.num(Tj, 0) + ' °C';
          const st = svg.querySelector('#scSt');
          const dead = S.failed && t >= S.tFail;
          st.textContent = dead ? L('MOSFET arızalı!', 'MOSFET failed!') : I < 0.2 && sc ? L('akım kesildi', 'current interrupted') : sc ? L('kısa devre!', 'short circuit!') : L('normal', 'normal');
          st.setAttribute('class', 'sch-t big ' + (dead ? 'bad' : I < 0.2 ? 'ok' : sc ? 'bad' : 'muted'));
        });
      }

      /* ---------------- Lab: SOA ---------------- */
      {
        const lab = root.querySelector('#lab-soa');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, { w: 600, h: 400, x: [0.1, 100], y: [0.01, 1000], logX: true, logY: true, xLabel: 'V_DS (V)', yLabel: 'I_D (A)', xFmt: v => App.si(v, '', 2), yFmt: v => App.si(v, '', 2) });
        const status = App.h('div', { class: 'status ok' }); fig.appendChild(status);
        const Ron = 0.01, Vmax = 60, Vsp = 10;
        const P = { dc: { P: 300, I: 100, z: 0.5, sp: true }, '10m': { P: 500, I: 150, z: 0.3, sp: true }, '1m': { P: 1250, I: 400, z: 0.12, sp: false }, '100u': { P: 3750, I: 400, z: 0.04, sp: false } };
        const lim = (k, v, spOn) => {
          const q = P[k];
          let pw = q.P / v;
          if (spOn && q.sp && v > Vsp) pw *= Math.pow(Vsp / v, 0.8);
          return Math.min(v / Ron, q.I, pw);
        };
        const vs = []; for (let i = 0; i <= 200; i++) vs.push(Math.pow(10, -1 + Math.log10(Vmax / 0.1) * i / 200));
        const names = { dc: 'DC', '10m': '10 ms', '1m': '1 ms', '100u': '100 µs' };
        Object.keys(P).forEach(k => {
          p.line('b' + k, vs.map(v => [v, lim(k, v, false)]), 'faint');
          if (P[k].sp) p.line('s' + k, vs.filter(v => v >= Vsp).map(v => [v, lim(k, v, true)]), 'faint dash');
          p.text('t' + k, Vmax, lim(k, Vmax, false), names[k], 'muted', 'end', -4, -4);
        });
        p.line('ron', [[0.1, 10], [10, 1000]], 'sig dash');
        p.text('ront', 0.5, 50, 'R_DS(on)', 'sig', 'end', -4, 0);
        p.vline('vmax', Vmax, 'bad solid');
        p.text('vmt', Vmax, 0.02, 'V_(BR)DSS', 'bad', 'end', -4, 0);
        const sV = UI.slider(ctl, { label: 'V<sub>DS</sub>', min: 0.1, max: 80, step: 0.1, value: 24, log: true, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sI = UI.slider(ctl, { label: 'I<sub>D</sub>', min: 0.05, max: 500, step: 0.05, value: 5, log: true, fmt: v => App.si(v, 'A'), onInput: update });
        const sP = UI.segmented(ctl, { label: L('Darbe süresi', 'Pulse duration'), options: [{ value: 'dc', label: 'DC' }, { value: '10m', label: '10 ms' }, { value: '1m', label: '1 ms' }, { value: '100u', label: '100 µs' }], value: '10m', onChange: update });
        const tSp = UI.toggle(ctl, { label: L('Spirito sınırını uygula (gerçekçi)', 'Apply Spirito limit (realistic)'), value: true, onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'p', label: 'P = V<sub>DS</sub>·I<sub>D</sub>' },
          { key: 'pa', label: L('Bu V’de izin verilen I', 'Allowed I at this V') },
          { key: 'dt', label: 'ΔT<sub>j</sub> = P·Z<sub>th</sub>' },
          { key: 'lim', label: L('Sınırlayan', 'Limited by') },
          { key: 'ok', label: L('Durum', 'Status') }
        ]);
        function update() {
          const k = sP.value, v = sV.value, i = sI.value, spOn = tSp.value;
          const q = P[k];
          const bnd = vs.map(x => [x, lim(k, x, spOn)]);
          p.line('sel', bnd, 'cu');
          p.area('selA', bnd, 'ok', 0.01);
          const inside = v <= Vmax && i <= lim(k, v, spOn) * 1.0001;
          p.dot('d', v, i, inside ? '' : 'bad', 7);
          p.hline('ih', i, inside ? '' : 'bad'); p.vline('vv', v, inside ? '' : 'bad');
          const Pw = v * i, Ia = v <= Vmax ? lim(k, v, spOn) : 0;
          ro.set('p', App.si(Pw, 'W'));
          ro.set('pa', App.si(Ia, 'A'));
          const dT = Pw * q.z;
          ro.set('dt', App.num(dT, 0) + ' °C', dT > 150 ? 'bad' : dT > 100 ? 'warn' : 'ok');
          let by;
          if (v > Vmax) by = 'V_(BR)DSS';
          else { const a = v / Ron, b = q.I, c = lim(k, v, spOn); by = c === a ? 'R_DS(on)' : c === b ? L('I_D tavanı (paket)', 'I_D ceiling (package)') : (spOn && q.sp && v > Vsp ? L('Spirito (lineer mod)', 'Spirito (linear mode)') : L('güç / ısıl', 'power / thermal')); }
          ro.set('lim', by);
          ro.set('ok', inside ? L('SOA içinde', 'inside SOA') : L('SOA DIŞINDA', 'OUTSIDE SOA'), inside ? 'ok' : 'bad');
          status.className = 'status ' + (inside ? 'ok' : 'bad');
          status.textContent = inside
            ? L('Nokta seçilen darbe süresinin sınırı içinde (T_c = 25 °C, tek darbe). Tekrarlı darbelerde ve sıcak kasada payı artır.', 'The point is inside the boundary for the selected pulse (T_c = 25 °C, single pulse). For repetitive pulses and a hot case, add margin.')
            : L('Bu noktada MOSFET hasar görür. Darbeyi kısalt, akımı/gerilimi düşür ya da daha büyük bir MOSFET seç.', 'At this point the MOSFET is damaged. Shorten the pulse, lower current/voltage, or choose a bigger MOSFET.');
        }
        update();
      }

      /* ---------------- Lab: reverse polarity ---------------- */
      {
        const lab = root.querySelector('#lab-rev');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        // P-MOS mirrored + rotated so that drain is on the left, source on the right, gate pointing down
        const px = 230, py = 80; // rail at y = 60: drain (200,60), source (260,60), gate (230,110)
        const svg = Viz.schematic(fig, 600, 230, `
          <g id="batN">${Sch.vsrc(60, 125, '')}</g>
          <g id="batR" transform="rotate(180 60 125)">${Sch.vsrc(60, 125, '')}</g>
          <text x="80" y="129" class="sch-t" id="batV"></text>
          ${Sch.w([[60, 95], [60, 60], [200, 60]])}
          <g id="pNone">${Sch.w([[200, 60], [260, 60]])}</g>
          <g id="pDio">${Sch.diode(230, 60, 270, '')}</g>
          <g id="pMos">
            <g transform="translate(${2 * px},0) scale(-1,1) rotate(-90 ${px} ${py})">${Sch.pmos(px, py, '')}</g>
            ${Sch.w([[200, 60], [200, 35]])}${Sch.diode(230, 35, 270, '')}${Sch.w([[260, 35], [260, 60]])}${Sch.dot(200, 60)}${Sch.dot(260, 60)}
            <text x="230" y="20" class="sch-t muted" text-anchor="middle">body diode</text>
            ${Sch.w([[230, 110], [230, 130]], 'sigw')}${Sch.dot(230, 130)}
            ${Sch.res(230, 160, 0, '')}
            <text x="244" y="164" class="sch-t">R_G</text>
            ${Sch.w([[230, 130], [290, 130], [290, 120]], 'sigw')}
            ${Sch.diode(290, 90, 180, '', 'zener')}${Sch.dot(290, 60)}
            <text x="304" y="94" class="sch-t">${L('zener', 'zener')}</text>
            ${Sch.dot(230, 190)}
          </g>
          ${Sch.w([[260, 60], [430, 60]])}
          ${Sch.box(430, 40, 140, 150, L('Kart', 'Board'), L('MCU, IC’ler', 'MCU, ICs'))}
          ${Sch.w([[60, 155], [60, 190], [430, 190]])}
          <text id="rvSt" x="300" y="222" class="sch-t big" text-anchor="middle"></text>
          <text id="rvLbl" x="300" y="50" class="sch-t"></text>
        `);
        const fF = new Viz.Flow(svg, 'M60,95V60H430V190H60V155', { spacing: 14 });
        const fR = new Viz.Flow(svg, 'M60,155V190H430V60H60V95', { cls: 'flow bad', spacing: 10, speed: 120, r: 3 });
        const fB = new Viz.Flow(svg, 'M60,155V190H430', { cls: 'flow bad', spacing: 10, speed: 40, r: 2.4 });
        const tPol = UI.toggle(ctl, { label: L('Ters polarite', 'Reverse polarity'), value: false, onChange: update });
        const sM = UI.segmented(ctl, { label: L('Koruma', 'Protection'), options: [{ value: 'none', label: L('Yok', 'None') }, { value: 'si', label: L('Si diyot', 'Si diode') }, { value: 'sch', label: 'Schottky' }, { value: 'pmos', label: 'P-MOS' }], value: 'pmos', onChange: update });
        const sV = UI.slider(ctl, { label: L('Besleme', 'Supply'), min: 3.3, max: 24, step: 0.1, value: 12, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sI = UI.slider(ctl, { label: L('Yük akımı', 'Load current'), min: 0.1, max: 10, step: 0.1, value: 2, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'drop', label: L('Gerilim düşümü', 'Voltage drop') },
          { key: 'loss', label: L('Koruma kaybı', 'Protection loss') },
          { key: 'vout', label: L('Karta giden gerilim', 'Voltage at the board') },
          { key: 'rev', label: L('Ters akım', 'Reverse current') },
          { key: 'vgs', label: 'P-MOS V<sub>GS</sub>' }
        ]);
        function update() {
          const rev = tPol.value, m = sM.value, V = sV.value, I = sI.value;
          svg.querySelector('#batN').style.display = rev ? 'none' : '';
          svg.querySelector('#batR').style.display = rev ? '' : 'none';
          svg.querySelector('#batV').textContent = (rev ? '−' : '+') + App.num(V, 1) + ' V';
          ['None', 'Dio', 'Mos'].forEach(n => { svg.querySelector('#p' + n).style.display = (n === 'None' && m === 'none') || (n === 'Dio' && (m === 'si' || m === 'sch')) || (n === 'Mos' && m === 'pmos') ? '' : 'none'; });
          svg.querySelector('#rvLbl').textContent = m === 'none' ? '' : m === 'si' ? L('Si diyot', 'Si diode') : m === 'sch' ? 'Schottky' : L('P-MOS (drain bataryaya)', 'P-MOS (drain to battery)');
          let drop = 0, loss = 0, vgs = NaN, note = '';
          if (m === 'si' || m === 'sch') { const vf = m === 'si' ? 0.8 : 0.45; drop = vf; loss = vf * I; }
          if (m === 'pmos') {
            vgs = rev ? 0 : -Math.min(V, 15);
            const fully = Math.abs(vgs) >= 4.5;
            const r = fully ? 0.02 : 0.02 * 4.5 / Math.max(Math.abs(vgs) - 1.5, 0.3) * 1.5;
            drop = I * r; loss = I * I * r;
            if (!fully) note = L(' (zayıf sürülüyor)', ' (weakly driven)');
          }
          const blocked = rev && m !== 'none';
          const short = rev && m === 'none';
          fF.rate = rev ? 0 : Math.min(2, 0.4 + I / 4);
          fR.rate = short ? 2.5 : 0;
          fB.rate = blocked ? 0.25 : 0;
          ro.set('drop', rev ? '—' : App.num(drop * 1000, 0) + ' mV' + note, rev ? '' : drop > 0.5 ? 'warn' : 'ok');
          ro.set('loss', rev ? '—' : App.si(loss, 'W'), rev ? '' : loss > 1 ? 'bad' : loss > 0.3 ? 'warn' : 'ok');
          ro.set('vout', rev ? (short ? L('≈ −0,7 V (ESD diyotları)', '≈ −0.7 V (ESD diodes)') : '0 V') : App.num(V - drop, 2) + ' V');
          ro.set('rev', short ? L('≈ yüzlerce A', '≈ hundreds of A') : rev ? L('≈ 0 (bloke)', '≈ 0 (blocked)') : '—', short ? 'bad' : rev ? 'ok' : '');
          ro.set('vgs', m === 'pmos' ? App.num(vgs, 1) + ' V' + (!rev && V > 15 ? L(' (zener ile sınırlı)', ' (zener-clamped)') : '') : '—', m === 'pmos' && !rev && Math.abs(vgs) < 4.5 ? 'warn' : '');
          const st = svg.querySelector('#rvSt');
          st.textContent = short ? L('KISA DEVRE: kartın diyotları iletiyor → hasar', 'SHORT: the board’s diodes conduct → damage') : blocked ? L('ters akım bloke edildi', 'reverse current blocked') : L('normal çalışma', 'normal operation');
          st.setAttribute('class', 'sch-t big ' + (short ? 'bad' : blocked ? 'ok' : 'cu'));
        }
        update();
      }
    }
  });
})();
