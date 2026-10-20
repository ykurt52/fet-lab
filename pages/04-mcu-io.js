/* 04 — The MCU pin: push-pull stage, output impedance, V_OH/V_OL vs current, limits, logic levels,
   floating pins at reset and pull-downs, open-drain, series gate resistor, clamp diodes and back-feeding */
App.page({
  id: 'mcu-io',
  num: '04',
  group: { tr: 'Temeller', en: 'Fundamentals' },
  title: { tr: 'Mikrodenetleyici pini: ne kadar güç verebilir?', en: 'The microcontroller pin: how much can it give?' },
  blurb: { tr: 'Push-pull çıkış, V<sub>OH</sub> düşümü, pin/port akım sınırları, boşta kalan pinler, pull-down, seri direnç.', en: 'Push-pull output, V<sub>OH</sub> droop, pin/port current limits, floating pins, pull-downs, series resistors.' },
  summary: {
    tr: 'GPIO pini, çipin içindeki iki küçük MOSFET’tir. Birkaç mA’de neredeyse ideal bir kaynaktır; akım arttıkça gerilimi düşer ve ısınır. Bu bölüm pinin gerçekte ne verdiğini, açılışta neden tehlikeli olduğunu ve transistörü nasıl güvenle süreceğini gösterir.',
    en: 'A GPIO pin is two small MOSFETs inside the chip. At a few mA it is a near-ideal source; as current rises, its voltage sags and it heats up. This chapter shows what a pin really delivers, why power-up is risky, and how to drive a transistor safely.'
  },
  render(L) {
    return `
      <style>
        [data-page="mcu-io"] .chipbox { fill: none; stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 6 4; }
        [data-page="mcu-io"] .noise { fill: none; stroke: var(--bad); stroke-width: 1.5; }
      </style>
      ${App.keys([
        L('Pin bir LED ya da gate sürer; röle ve motor sürmez.', 'A pin drives an LED or a gate, not a relay or motor.'),
        L('Pin başına ≈ 20 mA hedefle; toplam çip sınırını da topla.', 'Aim for ≈ 20 mA per pin; also add up the chip total.'),
        L('Reset sırasında pinler boştadır: her gate’e 10–100 kΩ pull-down.', 'Pins float during reset: put 10–100 kΩ pull-down on every gate.'),
        L('Gate’e 47–220 Ω seri direnç koy.', 'Add a 47–220 Ω series resistor to the gate.'),
        L('Beslemesi kapalı bir çipe sinyal gönderme.', 'Never drive a signal into an unpowered chip.')
      ])}

      <h2>${L('GPIO’nun içi: push-pull çıkış katı', 'Inside a GPIO: the push-pull output stage')}</h2>
      <p>${L('Çıkış pini, V<sub>DD</sub>’ye bir <b>P-MOSFET</b> ve GND’ye bir <b>N-MOSFET</b>’tir. İkisi asla aynı anda açılmaz.',
             'An output pin is a <b>P-MOSFET</b> to V<sub>DD</sub> and an <b>N-MOSFET</b> to GND. They are never on together.')}</p>
      <ul>
        <li>${L('<b>HIGH:</b> üstteki P-MOSFET açık, pin akım <b>verir</b> (source).', '<b>HIGH:</b> the upper P-MOSFET is on, the pin <b>sources</b> current.')}</li>
        <li>${L('<b>LOW:</b> alttaki N-MOSFET açık, pin akım <b>çeker</b> (sink).', '<b>LOW:</b> the lower N-MOSFET is on, the pin <b>sinks</b> current.')}</li>
        <li>${L('<b>Giriş:</b> ikisi de kapalı, pin yüksek empedanslı (<b>Hi-Z</b>).', '<b>Input:</b> both are off, the pin is high-impedance (<b>Hi-Z</b>).')}</li>
      </ul>
      ${App.figure('fig-pp', L('Push-pull: HIGH’da akım verir, LOW’da akım çeker', 'Push-pull: sources current when HIGH, sinks when LOW'), {
        foot: L('Kesikli çerçeve çipin içidir. HIGH: V<sub>DD</sub> → P-MOSFET → pin → R1 → LED1 → GND. LOW: V<sub>DD</sub> → LED2 → R2 → pin → N-MOSFET → GND. Bakır noktalar geleneksel akımdır.',
                'The dashed frame is the inside of the chip. HIGH: V<sub>DD</sub> → P-MOSFET → pin → R1 → LED1 → GND. LOW: V<sub>DD</sub> → LED2 → R2 → pin → N-MOSFET → GND. Copper dots are conventional current.')
      })}

      <h2>${L('Çıkış empedansı: pin ideal bir kaynak değil', 'Output impedance: the pin is not an ideal source')}</h2>
      <p>${L('Pin akım verdikçe gerilimi düşer. Açık çıkış MOSFET’inin tipik <b>25–50 Ω</b> R<sub>DS(on)</sub>’ı vardır.',
             'The more current a pin sources, the lower its voltage. The on output MOSFET has a typical R<sub>DS(on)</sub> of <b>25–50 Ω</b>.')}</p>
      <div class="eq">V<sub>OH</sub> = V<sub>DD</sub> − I · R<sub>out</sub>
        <span class="note">${L('Datasheet bunu garanti olarak verir: “V<sub>OH</sub> ≥ V<sub>DD</sub> − 0,4 V @ 8 mA”.', 'Datasheets give it as a guarantee: “V<sub>OH</sub> ≥ V<sub>DD</sub> − 0.4 V @ 8 mA”.')}</span></div>
      <p>${L('Yüksek akımda pin akım kaynağı gibi davranır. Kısa devrede akım ≈ 50–100 mA’de sınırlanır, ama pin ve çip ısınır.',
             'At high current the pin behaves like a current source. Into a short it limits at ≈ 50–100 mA, but the pin and chip heat up.')}</p>
      ${App.lab('lab-voh', L('V<sub>OH</sub> / V<sub>OL</sub> – çıkış akımı', 'V<sub>OH</sub> / V<sub>OL</sub> vs output current'), {
        foot: L('Model: kare yasalı çıkış MOSFET’i, 25 °C. 5 V pin ≈ 25 Ω (ATmega328P benzeri; önerilen 20 mA, mutlak 40 mA). 3,3 V pin ≈ 40 Ω (STM32 benzeri; garanti 8 mA, mutlak 25 mA). Kendi MCU’nun “V<sub>OH</sub> vs I<sub>OH</sub>” grafiğini kullan.',
                'Model: square-law output MOSFET, 25 °C. 5 V pin ≈ 25 Ω (ATmega328P-like; recommended 20 mA, absolute 40 mA). 3.3 V pin ≈ 40 Ω (STM32-like; spec’d at 8 mA, absolute 25 mA). Use your own MCU’s “V<sub>OH</sub> vs I<sub>OH</sub>” graph.')
      })}

      <h2>${L('Tipik sınırlar ve toplam akım bütçesi', 'Typical limits and the total current budget')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>MCU</th><th class="num">${L('Pin başı (mutlak maks.)', 'Per pin (abs. max)')}</th><th class="num">${L('Önerilen / garanti', 'Recommended / spec’d')}</th><th class="num">${L('Toplam', 'Total')}</th><th>${L('Not', 'Note')}</th></tr></thead>
        <tbody>
          <tr><td>ATmega328P (Uno, 5 V)</td><td class="num">40 mA</td><td class="num">20 mA</td><td class="num">200 mA (V<sub>CC</sub>/GND)</td><td>${L('Port gruplarının ayrıca 100–150 mA sınırı var', 'Port groups have their own 100–150 mA limits')}</td></tr>
          <tr><td>STM32F1/F4 (${L('3,3 V', '3.3 V')})</td><td class="num">±25 mA</td><td class="num">±8 mA (±20 mA ${L('gevşek V<sub>OL</sub>', 'relaxed V<sub>OL</sub>')})</td><td class="num">≈ 80–150 mA</td><td>${L('Seriye göre değişir; ΣI<sub>IO</sub> sınırına bak', 'Series-dependent; check ΣI<sub>IO</sub>')}</td></tr>
          <tr><td>ESP32 (${L('3,3 V', '3.3 V')})</td><td class="num">≈ 40 mA</td><td class="num">${L('sürüş gücü 5/10/20/40 mA (varsayılan 20)', 'drive strength 5/10/20/40 mA (default 20)')}</td><td class="num">${L('datasheet’e bak', 'see datasheet')}</td><td>${L('Bazı pinler boot sırasında strapping pinidir', 'Some pins are boot strapping pins')}</td></tr>
          <tr><td>RP2040 (${L('3,3 V', '3.3 V')})</td><td class="num">—</td><td class="num">${L('sürüş gücü 2/4/8/12 mA (varsayılan 4)', 'drive strength 2/4/8/12 mA (default 4)')}</td><td class="num">50 mA (IOVDD)</td><td>${L('Toplam sınır çok düşük: 6 pin × 8 mA zaten 48 mA', 'Very low total: 6 pins × 8 mA is already 48 mA')}</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('Yaklaşık değerler; çip serisine, pakete ve revizyona göre değişir. Kendi datasheet’inin “Absolute Maximum Ratings” ve “DC characteristics” tablolarına bak. Mutlak maksimum bir hedef değil, hasar sınırıdır.',
        'Approximate values; they vary by chip series, package and revision. Check your datasheet’s “Absolute Maximum Ratings” and “DC characteristics” tables. Absolute maximum is a damage threshold, not a target.')}</p>
      <p>${L('Her pin kendi sınırında olsa bile toplam akım çipin besleme pinlerini aşabilir.',
             'Even with every pin within its own limit, the total can exceed the chip’s supply pins.')}</p>
      <div class="eq">ΣI<sub>${L('pinler', 'pins')}</sub> + I<sub>${L('çekirdek', 'core')}</sub> ≤ I<sub>V<sub>DD</sub>(max)</sub> &nbsp;&nbsp;&nbsp; P<sub>pin</sub> = (V<sub>DD</sub> − V<sub>OH</sub>) · I<sub>OH</sub></div>
      ${App.example({
        given: [['MCU', 'Arduino Uno'], [L('LED', 'LEDs'), '10 × 20 mA'], [L('Toplam sınır', 'Total limit'), '200 mA']],
        steps: [
          [L('Toplam pin akımı', 'Total pin current'), 'ΣI = 10 · 20 mA', '200 mA']
        ],
        result: L('<b>Tam sınırdasın, pay yok.</b> Çekirdek akımı da eklenince sınır aşılır.', '<b>Right at the limit, no margin.</b> Add the core current and you exceed it.'),
        level: 'warn'
      })}

      <h2>${L('Motor ya da röleyi neden doğrudan süremezsin?', 'Why you cannot drive a motor or relay directly')}</h2>
      <div class="cards">
        <div class="card"><h4 class="cu">${L('Akım', 'Current')}</h4><p>${L('5 V röle bobini ≈ 70 mA, küçük bir motor kalkışta 0,5–2 A ister. Pin 20 mA verir.', 'A 5 V relay coil wants ≈ 70 mA; a small motor wants 0.5–2 A at start. A pin gives 20 mA.')}</p></div>
        <div class="card"><h4 style="color:var(--bad)">${L('Endüktif sıçrama', 'Inductive kick')}</h4><p>${L('Bobin kapatılınca oluşan sıçrama clamp diyotlarından V<sub>DD</sub>’ye basılır. MCU sıfırlanır ya da kalıcı hasar görür.', 'A coil’s turn-off spike is pushed through the clamp diodes into V<sub>DD</sub>. The MCU resets or is permanently damaged.')}</p></div>
        <div class="card"><h4 class="cu">${L('Gerilim', 'Voltage')}</h4><p>${L('Yük 12 V istiyorsa pin onu veremez. Transistör, düşük gerilimli kontrol tarafını güç tarafından ayırır.', 'If the load needs 12 V, the pin cannot provide it. The transistor separates the low-voltage control side from the power side.')}</p></div>
        <div class="card"><h4 class="cu">${L('Gürültü ve toprak', 'Noise and ground')}</h4><p>${L('Yük akımı MCU toprağından dönerse toprak zıplar. Yük akımını kendi yolundan döndür.', 'If load current returns through the MCU ground, ground bounces. Give load current its own return path.')}</p></div>
      </div>

      <h2>${L('3,3 V ve 5 V lojik seviyeleri', '3.3 V and 5 V logic levels')}</h2>
      <p>${L('3,3 V çıkış TTL uyumlu girişleri rahat sürer, ama 5 V CMOS girişleri süremez. V<sub>IH</sub>, girişin “1” saydığı en düşük gerilimdir; 74HC’de 3,5 V.',
             'A 3.3 V output drives TTL-compatible inputs easily, but not 5 V CMOS inputs. V<sub>IH</sub> is the lowest voltage an input reads as “1”; 3.5 V for 74HC.')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Giriş ailesi', 'Input family')}</th><th class="num">V<sub>IH</sub> (min)</th><th class="num">V<sub>IL</sub> (max)</th><th>${L('3,3 V çıkış sürer mi?', 'Driven by 3.3 V output?')}</th></tr></thead>
        <tbody>
          <tr><td>TTL / 74LS / 74HCT / 74AHCT (5 V)</td><td class="num">${L('2,0 V', '2.0 V')}</td><td class="num">${L('0,8 V', '0.8 V')}</td><td><span class="pill ok">${L('evet', 'yes')}</span></td></tr>
          <tr><td>74HC (5 V CMOS, ${L('0,7', '0.7')}·V<sub>DD</sub>)</td><td class="num">${L('3,5 V', '3.5 V')}</td><td class="num">${L('1,5 V', '1.5 V')}</td><td><span class="pill bad">${L('hayır', 'no')}</span></td></tr>
          <tr><td>ATmega328P @ 5 V (${L('0,6', '0.6')}·V<sub>CC</sub>)</td><td class="num">${L('3,0 V', '3.0 V')}</td><td class="num">${L('1,5 V', '1.5 V')}</td><td><span class="pill warn">${L('sınırda', 'marginal')}</span></td></tr>
          <tr><td>LVCMOS ${L('3,3 V', '3.3 V')}</td><td class="num">${L('2,0 V', '2.0 V')}</td><td class="num">${L('0,8 V', '0.8 V')}</td><td><span class="pill ok">${L('evet', 'yes')}</span></td></tr>
        </tbody></table></div>
      <ul>
        <li>${L('<b>5 V → 3,3 V pin</b> daha tehlikelidir: pin 5 V toleranslı değilse (STM32’de FT) clamp diyotundan akım basar.', '<b>5 V → 3.3 V pin</b> is the dangerous direction: unless the pin is 5 V tolerant (FT on STM32), current flows through the clamp diode.')}</li>
        <li>${L('<b>3,3 V MCU + 12 V yük:</b> pin yalnızca gate/base’i görür; 12 V asla pine ulaşmamalı.', '<b>3.3 V MCU + 12 V load:</b> the pin sees only the gate/base; 12 V must never reach it.')}</li>
        <li>${L('En basit çözüm low-side N-MOSFET (3,3 V’ta R<sub>DS(on)</sub> garantili) ya da BJT’dir.', 'The simplest fix is a low-side N-MOSFET with R<sub>DS(on)</sub> guaranteed at 3.3 V, or a BJT.')}</li>
        <li>${L('12 V P-MOSFET doğrudan sürülmez; seviye kaydırıcı gerekir (Bölüm 07).', 'A 12 V P-MOSFET cannot be driven directly; it needs a level shifter (Chapter 07).')}</li>
      </ul>

      <h2>${L('Reset ve boot sırasında pinler boşta', 'Pins float during reset and boot')}</h2>
      <p>${L('Reset sırasında ve programın ilk satırlarına kadar pinler <b>giriş (Hi-Z)</b> durumundadır. Bootloader’la bu yüzlerce ms, programlama sırasında saniyeler sürer.',
             'During reset and until your first lines of code run, pins are <b>inputs (Hi-Z)</b>. With a bootloader that lasts hundreds of ms, and seconds during programming.')}</p>
      <p>${L('Bu sürede gate boştadır ve kablolardan, drain’den (C<sub>GD</sub>) ve elinden gürültü toplar. Gate eşiğe yaklaşırsa MOSFET <b>yarı açık</b> kalır: yük titrer, MOSFET lineer bölgede ısınır.',
             'Meanwhile the gate floats and picks up noise from wires, the drain (via C<sub>GD</sub>) and your hand. Near threshold the MOSFET sits <b>half-on</b>: the load twitches and the MOSFET heats in its linear region.')}</p>
      ${App.lab('lab-float', L('Boşta gate: pull-down ile ve pull-down’sız', 'Floating gate: with and without a pull-down'), {
        foot: L('Gürültü temsilidir. Model: V<sub>th</sub> = 1,5 V, k = 2 A/V², yük 12 V / 6 Ω (en fazla 2 A). 10 kΩ pull-down gate empedansını MΩ’lardan 10 kΩ’a indirir; nA–µA gürültü akımıyla gate &lt; 0,1 V’ta kalır.',
                'The noise is illustrative. Model: V<sub>th</sub> = 1.5 V, k = 2 A/V², load 12 V / 6 Ω (2 A max). A 10 kΩ pull-down cuts the gate impedance from MΩs to 10 kΩ; with nA–µA of noise current the gate stays &lt; 0.1 V.')
      })}
      <div class="call tip"><strong>${L('Kural: her gate’e bir pull-down', 'Rule: a pull-down on every gate')}</strong>
        ${L('Gate–source arasına, seri direncin transistör tarafına 10–100 kΩ koy. High-side P-MOSFET’te bu bir pull-<b>up</b> olur. BJT base’inde de aynı kural geçerlidir.',
            'Put 10–100 kΩ from gate to source, on the transistor side of the series resistor. For a high-side P-MOSFET it becomes a pull-<b>up</b>. The same rule applies to a BJT base.')}</div>
      ${App.example({
        given: [['R<sub>s</sub>', '100 Ω'], [L('Pull-down', 'Pull-down'), '100 kΩ']],
        steps: [
          [L('Gate’e ulaşan oran', 'Fraction reaching the gate'), '100 k / (100 k + 100)', L('%99,9', '99.9 %')]
        ],
        result: L('<b>Pull-down gate gerilimini yalnızca ≈ %0,1 düşürür.</b> MCU tarafı kopsa bile gate güvenle kapalı kalır.', '<b>The pull-down costs only ≈ 0.1 % of the gate voltage.</b> The gate stays safely off even if the MCU side disconnects.')
      })}

      <h2>${L('Open-drain çıkışlar', 'Open-drain outputs')}</h2>
      <p>${L('Open-drain modunda yalnızca alttaki N-MOSFET çalışır. Pin ya GND’ye çeker ya bırakır; HIGH seviyeyi dış pull-up verir.',
             'In open-drain mode only the lower N-MOSFET works. The pin either pulls to GND or lets go; an external pull-up provides HIGH.')}</p>
      <ul>
        <li>${L('Pull-up farklı bir gerilime gidebilir; pin 5 V toleranslıysa 5 V.', 'The pull-up can go to another voltage; 5 V if the pin is 5 V tolerant.')}</li>
        <li>${L('Birden çok çıkış aynı hatta güvenle bağlanır (I²C).', 'Several outputs can safely share one line (I²C).')}</li>
        <li>${L('Pin hiçbir zaman akım vermez.', 'The pin never sources current.')}</li>
        <li>${L('Bedeli: yükselen kenar, pull-up × hat kapasitansı RC’si kadar yavaştır.', 'The cost: the rising edge is as slow as the pull-up × line capacitance RC.')}</li>
      </ul>

      <h2>${L('GPIO’da seri direnç: gate şarj akımını sınırlamak', 'A series resistor on the GPIO: limiting gate charging current')}</h2>
      <p>${L('Gate’e 47–220 Ω seri direnç koy. Boş gate kondansatörü (C<sub>iss</sub>) ilk anda kısa devre gibidir; akımı yalnızca pin direnci sınırlar.',
             'Put 47–220 Ω in series with the gate. An empty gate capacitance (C<sub>iss</sub>) looks like a short at first; only the pin resistance limits the current.')}</p>
      <ul>
        <li>${L('Tepe akımı düşürür.', 'It lowers the peak current.')}</li>
        <li>${L('Gate hattındaki çınlamayı sönümler.', 'It damps ringing on the gate trace.')}</li>
        <li>${L('Gate bozulursa pini korur.', 'It protects the pin if the gate fails.')}</li>
        <li>${L('Bedeli: MOSFET daha yavaş anahtarlanır (Bölüm 09).', 'The cost: the MOSFET switches more slowly (Chapter 09).')}</li>
      </ul>
      <div class="eq">I<sub>peak</sub> = V<sub>DD</sub> / (R<sub>s</sub> + R<sub>out</sub>) &nbsp;&nbsp;&nbsp; τ = (R<sub>s</sub> + R<sub>out</sub>) · C<sub>iss</sub> &nbsp;&nbsp;&nbsp; v<sub>G</sub>(t) = V<sub>DD</sub> · (1 − e<sup>−t/τ</sup>)
        <span class="note">${L('Miller platosu yüzünden gerçek gate doğrusal değildir. Tepe akım ve kaba süre için bu RC modeli yeterlidir.',
                              'Because of the Miller plateau a real gate is not linear. This RC model is good enough for peak current and rough timing.')}</span></div>
      ${App.example({
        given: [['V<sub>DD</sub>', L('3,3 V', '3.3 V')], ['R<sub>out</sub>', '40 Ω'], ['R<sub>s</sub>', '100 Ω'], ['C<sub>iss</sub>', L('1,7 nF (IRLZ44N)', '1.7 nF (IRLZ44N)')]],
        steps: [
          [L('Seri dirençsiz tepe', 'Peak without R<sub>s</sub>'), L('I = 3,3 / 40', 'I = 3.3 / 40'), '≈ 83 mA', L('pin akım sınırına takılır', 'hits the pin’s current limit')],
          [L('Seri dirençle tepe', 'Peak with R<sub>s</sub>'), L('I = 3,3 / (100 + 40)', 'I = 3.3 / (100 + 40)'), '≈ 24 mA'],
          [L('Zaman sabiti', 'Time constant'), L('τ = 140 Ω · 1,7 nF', 'τ = 140 Ω · 1.7 nF'), '≈ 240 ns']
        ],
        result: L('<b>100 Ω tepe akımı 24 mA’e indirir.</b> Gate yine de mikrosaniyenin altında şarj olur.', '<b>100 Ω cuts the peak to 24 mA.</b> The gate still charges in well under a microsecond.')
      })}
      ${App.lab('lab-rs', L('Seri direnç ve gate kapasitansı: tepe akım ve şarj eğrisi', 'Series resistor and gate capacitance: peak current and charging curve'), {
        foot: L('Pin modeli önceki deneyle aynı. Datasheet’teki pin sınırları DC değerlerdir; ns–µs’lik şarj tepeleri her CMOS çıkışında olur. Yüksek PWM frekansında ortalama akım f · Q<sub>g</sub> olur ve pin ısınır.',
                'Same pin model as the previous lab. Datasheet pin limits are DC values; ns–µs charging peaks happen on every CMOS output. At high PWM frequency the average current is f · Q<sub>g</sub> and the pin warms up.')
      })}

      <h2>${L('Clamp diyotları, ESD ve geri besleme', 'Clamp diodes, ESD and back-feeding')}</h2>
      <p>${L('Beslemesi kapalı bir çipe sinyal gönderirsen, sinyal onun clamp diyotundan geçip V<sub>DD</sub> hattını besler. Buna <b>back-feed</b> denir.',
             'Drive a signal into a chip whose supply is off and it flows through that chip’s clamp diode into its V<sub>DD</sub> rail. This is <b>back-feeding</b>.')}</p>
      <ul>
        <li>${L('Her GPIO’da ESD için iki <b>clamp diyotu</b> vardır: pinden V<sub>DD</sub>’ye ve GND’den pine.', 'Every GPIO has two ESD <b>clamp diodes</b>: pin to V<sub>DD</sub> and GND to pin.')}</li>
        <li>${L('Pin V<sub>DD</sub> + 0,3 V’u aşınca üst diyot iletir.', 'Above V<sub>DD</sub> + 0.3 V the upper diode conducts.')}</li>
        <li>${L('“Kapalı” çip yarı çalışır, latch-up olabilir ya da pini sürekli yükler.', 'The “off” chip half-runs, may latch up, or loads your pin continuously.')}</li>
      </ul>
      ${App.figure('fig-bf', L('Kapalı bir çevre birimini GPIO’dan beslemek', 'Powering an unpowered peripheral through a GPIO'), {
        foot: L('Sağdaki çip kapalı. Pin HIGH olunca akım clamp diyotundan geçer ve çipin V<sub>DD</sub>’sini ≈ 3,3 − 0,6 V’a çıkarır. Çözüm: kapalı birime sinyal gönderme, 1–10 kΩ seri direnç koy ya da I<sub>off</sub> korumalı parça kullan.',
                'The chip on the right is unpowered. When the pin goes HIGH, current flows through the clamp diode and lifts the chip’s V<sub>DD</sub> to ≈ 3.3 − 0.6 V. Fixes: do not drive unpowered parts, add 1–10 kΩ in series, or use I<sub>off</sub>-protected parts.')
      })}

      <details class="fold"><summary>${L('Çözümlü örnek: Arduino Uno’da 8 LED', 'Worked example: 8 LEDs on an Arduino Uno')}</summary><div>
        ${App.example({
          given: [['V<sub>DD</sub>', '5 V'], ['LED', L('8 kırmızı, V<sub>f</sub> = 2,0 V', '8 red, V<sub>f</sub> = 2.0 V')], ['R', '330 Ω'], [L('Pin düşümü', 'Pin drop'), L('≈ 0,3 V', '≈ 0.3 V')]],
          steps: [
            [L('LED akımı', 'LED current'), L('I = (5 − 2,0 − 0,3) / 330', 'I = (5 − 2.0 − 0.3) / 330'), '≈ 8 mA', L('pin önerisi 20 mA', 'pin recommendation 20 mA')],
            [L('Toplam', 'Total'), 'ΣI = 8 · 8 mA', '64 mA', L('sınır 200 mA', 'limit 200 mA')]
          ],
          result: L('<b>8 LED doğrudan pinlerden sürülebilir.</b> Pin başına ve toplamda bol pay var.', '<b>The 8 LEDs can run straight from the pins.</b> Plenty of margin per pin and in total.')
        })}
      </div></details>

      <details class="fold"><summary>${L('Çözümlü örnek: Arduino Uno’da 5 V röle', 'Worked example: a 5 V relay on an Arduino Uno')}</summary><div>
        ${App.example({
          given: [[L('Bobin', 'Coil'), '5 V, 70 Ω'], [L('Pin sınırı', 'Pin limit'), L('20 mA önerilen, 40 mA mutlak', '20 mA recommended, 40 mA absolute')], ['2N7002 R<sub>DS(on)</sub> @ 5 V', '≈ 2–3 Ω']],
          steps: [
            [L('Bobin akımı', 'Coil current'), 'I = 5 / 70', '71 mA', L('pinin mutlak sınırının bile üstünde', 'above even the pin’s absolute limit')],
            [L('2N7002 düşümü', '2N7002 drop'), 'V = 71 mA · 3 Ω', L('≈ 0,2 V', '≈ 0.2 V')],
            [L('2N7002 kaybı', '2N7002 loss'), L('P = 0,071² · 3', 'P = 0.071² · 3'), '≈ 15 mW']
          ],
          result: L('<b>Röle doğrudan sürülmez; 2N7002 ile low-side anahtar kullan.</b> Bobine 1N4148 flyback, gate’e 100 Ω seri + 100 kΩ pull-down ekle; pin akımı ≈ 0.', '<b>Not directly: use a 2N7002 low-side switch.</b> Add a 1N4148 flyback across the coil and 100 Ω series + 100 kΩ pull-down on the gate; pin current ≈ 0.'),
          level: 'ok'
        })}
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    // pin model: square-law output MOSFET with R0 = 1/(k·Vov), Vth = 0.7 V
    const PIN = {
      v5: { vdd: 5, r0: 25, rec: 0.02, abs: 0.04, name: '5 V (ATmega328P)' },
      v33: { vdd: 3.3, r0: 40, rec: 0.008, abs: 0.025, name: '3,3 V (STM32)' }
    };
    function pinOf(key) {
      const m = PIN[key], vov = m.vdd - 0.7, k = 1 / (m.r0 * vov);
      const isat = k * vov * vov / 2;
      // voltage drop across the on transistor at current i (ohmic branch; beyond isat → full drop)
      const drop = i => i >= isat ? m.vdd : vov - Math.sqrt(Math.max(0, vov * vov - 2 * i / k));
      return Object.assign({}, m, { vov, k, isat, drop });
    }

    /* ---------------- Figure: push-pull ---------------- */
    {
      const fig = root.querySelector('#fig-pp .lab-fig');
      const svg = Viz.schematic(fig, 600, 320, `
        <rect x="30" y="12" width="290" height="270" rx="8" class="chipbox"/>
        <text x="40" y="30" class="sch-t muted">MCU</text>
        ${Sch.vcc(200, 44, 'V_DD')}${Sch.w([[200, 44], [200, 80]])}
        <path id="hlP" class="hl" d="M200,80V140"/>
        <path id="hlN" class="hl" d="M200,170V230"/>
        ${Sch.pmos(180, 110, '')}
        ${Sch.nmos(180, 200, '')}
        ${Sch.w([[200, 140], [200, 170]])}${Sch.dot(200, 155)}
        ${Sch.w([[200, 230], [200, 244]])}${Sch.gnd(200, 244)}
        ${Sch.w([[150, 110], [120, 110], [120, 200], [150, 200]], 'sigw')}${Sch.dot(120, 155)}
        ${Sch.w([[50, 155], [120, 155]], 'sigw')}
        <text x="52" y="146" class="sch-t sig">${L('lojik', 'logic')}</text>
        <text id="ppIn" x="52" y="174" class="sch-t sig big"></text>
        <text id="ppP" x="230" y="104" class="sch-t"></text>
        <text id="ppN" x="230" y="210" class="sch-t"></text>
        ${Sch.w([[200, 155], [520, 155]])}
        <rect x="314" y="149" width="12" height="12" class="layer metal"/>
        <text x="320" y="178" class="sch-t muted" text-anchor="middle">PIN</text>
        <text id="ppV" x="336" y="200" class="sch-t big"></text>
        ${Sch.vcc(430, 30, 'V_DD')}${Sch.w([[430, 30], [430, 35]])}
        ${Sch.led(430, 65, 0, 'LED2', 'ppL2')}
        ${Sch.res(430, 125, 0, 'R2')}${Sch.dot(430, 155)}
        ${Sch.res(520, 185, 0, 'R1')}
        ${Sch.led(520, 245, 0, 'LED1', 'ppL1')}${Sch.gnd(520, 275)}
      `);
      const fHigh = new Viz.Flow(svg, 'M200,44V155H520V275', { spacing: 15 });
      const fLow = new Viz.Flow(svg, 'M430,30V155H200V244', { spacing: 15 });
      const T = s => svg.querySelector(s);
      let t = 0, last = null;
      App.onFrame(dt => {
        t += dt;
        const high = (t % 4) < 2;
        if (high === last) return;
        last = high;
        fHigh.rate = high ? 1 : 0; fLow.rate = high ? 0 : 1;
        T('#hlP').style.display = high ? '' : 'none';
        T('#hlN').style.display = high ? 'none' : '';
        T('#ppL1 .led-glow').style.opacity = high ? 1 : 0;
        T('#ppL2 .led-glow').style.opacity = high ? 0 : 1;
        T('#ppIn').textContent = high ? 'HIGH' : 'LOW';
        T('#ppP').textContent = high ? L('P: AÇIK (source)', 'P: ON (source)') : L('P: kapalı', 'P: off');
        T('#ppN').textContent = high ? L('N: kapalı', 'N: off') : L('N: AÇIK (sink)', 'N: ON (sink)');
        T('#ppP').setAttribute('class', 'sch-t ' + (high ? 'cu' : 'muted'));
        T('#ppN').setAttribute('class', 'sch-t ' + (high ? 'muted' : 'cu'));
        T('#ppV').textContent = high ? L('≈ V_DD − I·R_P', '≈ V_DD − I·R_P') : L('≈ 0 + I·R_N', '≈ 0 + I·R_N');
      });
    }

    /* ---------------- Lab: V_OH / V_OL vs current ---------------- */
    {
      const lab = root.querySelector('#lab-voh');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p = new Viz.Plot(fig, {
        w: 600, h: 360, x: [0, 0.06], y: [0, 5.4], xTicks: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06], yTicks: [0, 1, 2, 3, 4, 5],
        xLabel: L('pin akımı (mA)', 'pin current (mA)'), yLabel: L('pin gerilimi (V)', 'pin voltage (V)'),
        xFmt: v => App.num(v * 1000, 0), yFmt: v => App.num(v, 0)
      });
      let model = 'v5', dir = 'src';
      UI.segmented(ctl, { label: L('Pin modeli', 'Pin model'), options: [{ value: 'v5', label: '5 V' }, { value: 'v33', label: L('3,3 V', '3.3 V') }], value: model, onChange: v => { model = v; update(); } });
      UI.segmented(ctl, { label: L('Yön', 'Direction'), options: [{ value: 'src', label: L('Source (HIGH)', 'Source (HIGH)') }, { value: 'snk', label: L('Sink (LOW)', 'Sink (LOW)') }], value: dir, onChange: v => { dir = v; update(); } });
      const sR = UI.slider(ctl, { label: L('Yük direnci', 'Load resistance'), min: 22, max: 10000, value: 220, log: true, step: 1, unit: 'Ω', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'i', label: L('Pin akımı', 'Pin current') }, { key: 'v', label: L('Pin gerilimi', 'Pin voltage') },
        { key: 'd', label: L('İçeride düşen', 'Drop inside') }, { key: 'p', label: L('Pinde kayıp', 'Power in pin') }, { key: 's', label: L('Durum', 'Status') }]);
      function update() {
        const m = pinOf(model), R = sR.value;
        ['v5', 'v33'].forEach(key => {
          const q = pinOf(key);
          const curve = Viz.sample(i => dir === 'src' ? q.vdd - q.drop(i) : q.drop(i), 0, Math.min(0.06, q.isat * 0.999), 200);
          p.line('c' + key, curve, key === model ? 'cu' : 'faint');
        });
        p.vline('abs', m.abs, 'bad');
        p.text('absT', m.abs, 5.25, L('mutlak maks.', 'abs. max'), 'bad', 'middle');
        p.vline('rec', m.rec, '');
        p.text('recT', m.rec, 4.95, L('önerilen', 'recommended'), 'muted', 'middle');
        p.hline('vih', 3.5, dir === 'src' ? 'sig' : '');
        p.text('vihT', 0.0595, 3.5, L('74HC V_IH = 3,5 V', '74HC V_IH = 3.5 V'), 'sig', 'end', 0, -5);
        p.hide('vih', dir !== 'src'); p.hide('vihT', dir !== 'src');
        // operating point: source → V = I·R (load to GND); sink → V = VDD − I·R (load from VDD)
        let a = 0, b = m.isat * 0.9999;
        const f = i => dir === 'src' ? (m.vdd - m.drop(i)) - i * R : (m.vdd - i * R) - m.drop(i);
        for (let k = 0; k < 60; k++) { const c = (a + b) / 2; if (f(c) > 0) a = c; else b = c; }
        const I = (a + b) / 2, d = m.drop(I), V = dir === 'src' ? m.vdd - d : d;
        const xe = dir === 'src' ? Math.min(0.06, 5.4 / R) : Math.min(0.06, m.vdd / R);
        p.line('ll', dir === 'src' ? [[0, 0], [xe, xe * R]] : [[0, m.vdd], [xe, m.vdd - xe * R]], 'sig dash thin');
        p.dot('q', I, V);
        ro.set('i', App.si(I, 'A'), I > m.abs ? 'bad' : I > m.rec ? 'warn' : 'ok');
        ro.set('v', App.num(V, 2) + ' V');
        ro.set('d', App.num(d, 2) + ' V');
        ro.set('p', App.si(d * I, 'W'));
        ro.set('s', I > m.abs ? L('Hasar riski!', 'Damage risk!') : I > m.rec ? L('Garanti dışı', 'Out of spec') : L('Güvenli', 'Safe'), I > m.abs ? 'bad' : I > m.rec ? 'warn' : 'ok');
      }
      update();
    }

    /* ---------------- Lab: floating gate ---------------- */
    {
      const lab = root.querySelector('#lab-float');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 250, `
        ${Sch.box(20, 110, 110, 80, 'MCU', '')}
        <text id="flState" x="75" y="170" class="sch-t sig" text-anchor="middle"></text>
        ${Sch.w([[130, 150], [180, 150]], 'sigw')}
        ${Sch.res(210, 150, 90, '100 Ω')}
        ${Sch.w([[240, 150], [300, 150]], 'sigw')}
        <path id="flNoise" class="noise" d="M250,128q5,-10 10,0t10,0t10,0t10,0"/>
        <g id="flPd">${Sch.dot(270, 150)}${Sch.w([[270, 150], [270, 165]])}${Sch.res(270, 195, 0, '10 kΩ')}${Sch.gnd(270, 225)}</g>
        ${Sch.vcc(350, 30, '+12 V')}${Sch.w([[350, 30], [350, 40]], 'hot')}
        ${Sch.motor(350, 70, 'M', 'flMot')}
        ${Sch.w([[350, 100], [350, 120]], 'hot')}
        ${Sch.nmos(330, 150, '')}
        ${Sch.w([[350, 180], [350, 225]], 'hot')}${Sch.gnd(350, 225)}
        <text id="flVgs" x="420" y="150" class="sch-t sig big"></text>
        <text id="flId" x="420" y="80" class="sch-t cu big"></text>
        <text id="flP" x="420" y="190" class="sch-t"></text>
      `);
      const flow = new Viz.Flow(svg, 'M350,30V225', { spacing: 14 });
      const p = new Viz.Plot(fig, {
        w: 600, h: 190, x: [0, 4], y: [-0.2, 3.6], yTicks: [0, 1, 2, 3],
        xLabel: L('zaman (s)', 'time (s)'), yLabel: 'V_GS (V)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const pI = new Viz.Plot(fig, {
        w: 600, h: 150, x: [0, 4], y: [0, 2.1], yTicks: [0, 1, 2],
        xLabel: L('zaman (s)', 'time (s)'), yLabel: 'I_D (A)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const VTH = 1.5, K = 2, VDD = 12, RL = 6;
      p.rect('band', 0, VTH, 4, 3.6, 'bad');
      p.hline('vth', VTH, 'bad');
      p.text('vthT', 0.05, VTH, L('V_th = 1,5 V', 'V_th = 1.5 V'), 'bad', 'start', 0, -5);
      let state = 'z';
      UI.segmented(ctl, { label: L('Pin durumu', 'Pin state'), options: [
        { value: 'z', label: L('Hi-Z (reset)', 'Hi-Z (reset)') }, { value: 'low', label: 'LOW' }, { value: 'high', label: 'HIGH' }], value: 'z', onChange: v => { state = v; } });
      const tPd = UI.toggle(ctl, { label: L('10 kΩ pull-down', '10 kΩ pull-down'), value: false, onChange: v => { svg.querySelector('#flPd').style.opacity = v ? 1 : 0.15; } });
      svg.querySelector('#flPd').style.opacity = 0.15;
      const ro = UI.readouts(ctl, [
        { key: 'v', label: 'V<sub>GS</sub>' }, { key: 'i', label: 'I<sub>D</sub>' },
        { key: 'vds', label: 'V<sub>DS</sub>' }, { key: 'p', label: L('MOSFET kaybı', 'MOSFET loss') }, { key: 's', label: L('Durum', 'Status') }]);
      const id = vgs => { // solve VDS = VDD − I·RL with I = mosId
        let a = 0, b = VDD;
        for (let k = 0; k < 40; k++) { const c = (a + b) / 2; if (VDD - Viz.phys.mosId(vgs, c, VTH, K, 0.01) * RL - c > 0) a = c; else b = c; }
        const vds = (a + b) / 2, i = (VDD - vds) / RL; return { vds, i: i < 1e-6 ? 0 : i };
      };
      let t = 0, x = 1.2, spike = 0, vg = 0, ang = 0, acc = 0;
      const hist = [];
      const randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      App.onFrame(dt => {
        t += dt;
        // Ornstein–Uhlenbeck drift around 1.4 V plus random spikes
        const tau = 0.7, mu = 1.35, sig = 0.55;
        x += -(x - mu) / tau * dt + sig * Math.sqrt(2 * dt / tau) * randn();
        if (Math.random() < dt * 0.6) spike += 0.8 + Math.random() * 1.2;
        spike *= Math.exp(-dt / 0.15);
        const noise = x + spike;
        const target = state === 'low' ? 0 : state === 'high' ? 3.3 : (tPd.value ? 0.02 * noise : App.clamp(noise, 0, 3.4));
        vg += (target - vg) * Math.min(1, dt / (state === 'z' ? 0.03 : 0.005));
        const r = id(vg);
        hist.push([t, vg, r.i]);
        while (hist.length && hist[0][0] < t - 4) hist.shift();
        const t0 = t - 4;
        p.line('v', hist.map(q => [q[0] - t0, q[1]]), 'sig');
        pI.line('i', hist.map(q => [q[0] - t0, q[2]]), 'cu');
        flow.rate = r.i > 0.01 ? App.clamp(r.i / 1.2, 0.15, 2) : 0;
        if (!App.reducedMotion) ang = (ang + dt * 400 * r.i) % 360;
        svg.querySelector('#flMot .rotor').setAttribute('transform', `rotate(${ang.toFixed(1)} 350 70)`);
        svg.querySelector('#flNoise').style.opacity = state === 'z' && !tPd.value ? 1 : 0;
        acc += dt;
        if (acc > 0.12) {
          acc = 0;
          const P = r.vds * r.i, half = r.i > 0.02 && r.vds > 0.5;
          svg.querySelector('#flState').textContent = state === 'z' ? 'Hi-Z' : state.toUpperCase();
          svg.querySelector('#flVgs').textContent = 'V_GS = ' + App.num(vg, 2) + ' V';
          svg.querySelector('#flId').textContent = 'I_D = ' + App.si(r.i, 'A', 2);
          const pt = svg.querySelector('#flP');
          pt.textContent = half ? L('YARI AÇIK: ', 'HALF-ON: ') + App.si(P, 'W', 2) : '';
          pt.setAttribute('class', 'sch-t big bad');
          ro.set('v', App.num(vg, 2) + ' V', vg > VTH && state !== 'high' ? 'bad' : '');
          ro.set('i', App.si(r.i, 'A'));
          ro.set('vds', App.num(r.vds, 2) + ' V');
          ro.set('p', App.si(P, 'W'), P > 0.5 ? 'bad' : P > 0.1 ? 'warn' : 'ok');
          ro.set('s', state === 'high' ? L('Tam açık', 'Fully on') : half ? L('Yarı açık, ısınıyor!', 'Half-on, heating!') : L('Kapalı', 'Off'),
            state === 'high' ? 'ok' : half ? 'bad' : 'ok');
        }
      });
    }

    /* ---------------- Lab: series resistor & gate charge ---------------- */
    {
      const lab = root.querySelector('#lab-rs');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const pI = new Viz.Plot(fig, { w: 600, h: 220, x: [0, 1e-6], y: [0, 0.1], xLabel: L('zaman', 'time'), yLabel: 'I_pin (mA)', xFmt: v => App.si(v, 's', 2), yFmt: v => App.num(v * 1000, 0) });
      const pV = new Viz.Plot(fig, { w: 600, h: 200, x: [0, 1e-6], y: [0, 5.4], yTicks: [0, 1, 2, 3, 4, 5], xLabel: L('zaman', 'time'), yLabel: 'v_G (V)', xFmt: v => App.si(v, 's', 2), yFmt: v => App.num(v, 0) });
      let model = 'v5';
      UI.segmented(ctl, { label: L('Pin', 'Pin'), options: [{ value: 'v5', label: '5 V' }, { value: 'v33', label: L('3,3 V', '3.3 V') }], value: model, onChange: v => { model = v; update(); } });
      const sR = UI.slider(ctl, { label: L('Seri direnç R<sub>s</sub>', 'Series resistor R<sub>s</sub>'), min: 0, max: 1000, step: 1, value: 100, fmt: v => App.si(v, 'Ω', 3), onInput: update });
      const sC = UI.slider(ctl, { label: 'C<sub>iss</sub>', min: 1e-10, max: 1e-8, value: 1.5e-9, log: true, step: 1e-12, unit: 'F', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'ip', label: L('Tepe akım', 'Peak current') }, { key: 'tau', label: 'τ = (R<sub>s</sub>+R<sub>out</sub>)·C' },
        { key: 't90', label: L('%90’a varış', 'Time to 90 %') }, { key: 'q', label: 'Q = C·V' }, { key: 's', label: L('Pin sınırına göre', 'vs pin limit') }]);
      function update() {
        const m = pinOf(model), Rs = sR.value, C = sC.value, V = m.vdd;
        const Rt = Rs + m.r0, tau = Rt * C, tEnd = 5 * tau;
        // integrate: i = min(isat, (V − vc)/Rt)
        const N = 400, dt = tEnd / N;
        let vc = 0, ipk = 0, t90 = null;
        const ptsI = [[0, 0]], ptsV = [[0, 0]];
        for (let k = 0; k <= N; k++) {
          const i = Math.min(m.isat, (V - vc) / Rt);
          if (k === 0) ptsI.push([0, i]);
          ipk = Math.max(ipk, i);
          ptsI.push([k * dt, i]); ptsV.push([k * dt, vc]);
          if (t90 === null && vc >= 0.9 * V) t90 = k * dt;
          vc += i * dt / C;
        }
        pI.setRange({ x: [0, tEnd], y: [0, Math.max(0.03, ipk * 1.15, m.abs * 1.15)] });
        pV.setRange({ x: [0, tEnd] });
        pI.area('ia', ptsI, 'cu');
        pI.line('i', ptsI, 'cu');
        pI.hline('abs', m.abs, 'bad');
        pI.text('absT', tEnd, m.abs, L('pin mutlak maks. (DC)', 'pin abs. max (DC)'), 'bad', 'end', -4, -5);
        pI.hline('sat', m.isat, '');
        pI.text('satT', tEnd, m.isat, L('pin doyum akımı', 'pin saturation current'), 'muted', 'end', -4, 14);
        pI.hide('sat', ipk < m.isat * 0.98); pI.hide('satT', ipk < m.isat * 0.98);
        pV.line('v', ptsV, 'sig');
        pV.hline('v90', 0.9 * V, '');
        pV.text('v90T', tEnd, 0.9 * V, '90 %', 'muted', 'end', -4, -5);
        if (t90 !== null) pV.vline('t90', t90, 'sig');
        ro.set('ip', App.si(ipk, 'A') + (ipk >= m.isat * 0.98 ? L(' (doyumda)', ' (saturated)') : ''), ipk > m.abs ? 'warn' : 'ok');
        ro.set('tau', App.si(tau, 's'));
        ro.set('t90', t90 === null ? '—' : App.si(t90, 's'));
        ro.set('q', App.si(C * V, 'C'));
        ro.set('s', ipk > m.abs ? L('kısa tepe > DC sınırı', 'brief peak > DC limit') : L('sınırın altında', 'below limit'), ipk > m.abs ? 'warn' : 'ok');
      }
      update();
    }

    /* ---------------- Figure: back-feeding through clamp diodes ---------------- */
    {
      const fig = root.querySelector('#fig-bf .lab-fig');
      const svg = Viz.schematic(fig, 600, 290, `
        ${Sch.box(30, 110, 120, 80, 'MCU', L('3,3 V, açık', '3.3 V, powered'))}
        ${Sch.w([[150, 150], [190, 150]], 'sigw')}
        ${Sch.res(220, 150, 90, '330 Ω')}
        ${Sch.w([[250, 150], [400, 150]], 'hot')}
        <rect x="320" y="30" width="250" height="245" rx="8" class="chipbox"/>
        <text x="330" y="48" class="sch-t muted">${L('Çevre birimi (besleme KAPALI)', 'Peripheral (supply OFF)')}</text>
        <rect x="314" y="144" width="12" height="12" class="layer metal"/>
        ${Sch.dot(400, 150)}
        ${Sch.w([[400, 150], [400, 130]])}${Sch.diode(400, 100, 180, '')}
        ${Sch.w([[400, 150], [400, 170]])}${Sch.diode(400, 200, 180, '')}
        ${Sch.w([[400, 70], [400, 60], [520, 60], [520, 120]], 'hot')}
        ${Sch.load(520, 150, 0, '')}
        <text x="520" y="196" class="sch-t muted" text-anchor="middle">${L('iç devre', 'internal logic')}</text>
        ${Sch.w([[520, 180], [520, 250], [400, 250], [400, 230]])}${Sch.gnd(460, 250)}
        <text x="412" y="96" class="sch-t">${L('clamp', 'clamp')}</text>
        <text x="412" y="206" class="sch-t">${L('clamp', 'clamp')}</text>
        <text id="bfRail" x="420" y="78" class="sch-t big"></text>
        <text id="bfPin" x="154" y="172" class="sch-t sig"></text>
        <text id="bfMsg" x="30" y="232" class="sch-t big"></text>
        <text id="bfMsg2" x="30" y="252" class="sch-t muted"></text>
      `);
      const flow = new Viz.Flow(svg, 'M150,150H400V60H520V250H460', { spacing: 15, cls: 'flow bad' });
      const T = s => svg.querySelector(s);
      let t = 0, last = null;
      App.onFrame(dt => {
        t += dt;
        const high = (t % 5) < 3;
        if (high === last) return;
        last = high;
        flow.rate = high ? 1 : 0;
        T('#bfPin').textContent = high ? L('HIGH 3,3 V', 'HIGH 3.3 V') : 'LOW';
        T('#bfRail').textContent = high ? L('V_DD ≈ 2–2,7 V (!)', 'V_DD ≈ 2–2.7 V (!)') : 'V_DD ≈ 0 V';
        T('#bfRail').setAttribute('class', 'sch-t big ' + (high ? 'bad' : 'muted'));
        T('#bfMsg').textContent = high ? L('Back-feed: pin → R → clamp → V_DD', 'Back-feed: pin → R → clamp → V_DD') : L('Pin LOW: back-feed yok', 'Pin LOW: no back-feed');
        T('#bfMsg2').textContent = high ? L('“Kapalı” çip yarı çalışır.', 'The “off” chip half-runs.') : '';
      });
    }
  }
});
