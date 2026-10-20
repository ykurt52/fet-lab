/* 11 — Inrush current: capacitive loads, lamps, motors; hard vs soft start, P-MOS RC soft start,
   NTC limiter and hot restart, load switches, hot-swap controllers, pre-charge. */
(function () {
  'use strict';
  const unitFor = T => T < 1.5e-3 ? [1e-6, 'µs'] : T < 1.5 ? [1e-3, 'ms'] : [1, 's'];

  App.page({
    id: 'inrush',
    num: '11',
    group: { tr: 'Koruma', en: 'Protection' },
    title: { tr: 'Inrush (ani kalkış) akımı', en: 'Inrush current' },
    blurb: { tr: 'Kondansatör, lamba ve motorların açılış akımı; soft-start, NTC, load switch ve hot-swap.', en: 'Switch-on current of capacitors, lamps and motors; soft start, NTC, load switches and hot-swap.' },
    summary: {
      tr: 'Bir yük açılışın ilk milisaniyelerinde normal akımının 10–1000 katını çekebilir. Bu akım sigortayı attırır, beslemeyi çökertir ve MCU’yu resetler. Bu bölüm inrush’ın kaynağını ve nasıl sınırlanacağını anlatır.',
      en: 'In its first milliseconds a load can draw 10–1000 times its normal current. That blows fuses, collapses supplies and resets the MCU. This chapter shows where inrush comes from and how to limit it.'
    },
    render(L) {
      return `
      ${App.keys([
        L('Boş kondansatör anlık kısa devredir: tepe akım V/R<sub>toplam</sub>.', 'An empty capacitor is momentarily a short: peak is V/R<sub>total</sub>.'),
        L('Şarjda dirençte ½·C·V² yanar; R ne olursa olsun.', 'Charging burns ½·C·V² in the resistance, whatever R is.'),
        L('Soft-start enerjiyi değil gücü azaltır; MOSFET’in SOA’sını kontrol et.', 'Soft start cuts power, not energy; check the MOSFET’s SOA.'),
        L('NTC ucuzdur ama sıcak yeniden başlatmada korumaz.', 'An NTC is cheap but fails on a hot restart.'),
        L('Lamba ve motorda MOSFET’i tepe akıma göre seç.', 'For lamps and motors, size the MOSFET for peak current.')
      ])}
      <h2>${L('Inrush nereden gelir?', 'Where does inrush come from?')}</h2>
      <p>${L('Yükün açılış anındaki empedansı, çalışırkenkinden çok küçüktür. O an akımı yalnızca kablo, konnektör, anahtar ve kaynak direnci sınırlar.',
             'A load’s impedance <b>at switch-on</b> is far lower than while running. At that instant only wiring, connector, switch and source resistance limit the current.')}</p>
      <div class="cards">
        <div class="card"><h4>${L('Kondansatörler', 'Capacitors')}</h4><p>${L('Boş kondansatör anlık kısa devredir. Bulk kondansatörler (100 µF–10 mF) en yaygın kaynaktır: I = C·dV/dt.', 'An empty capacitor is momentarily a short. Bulk caps (100 µF–10 mF) are the most common source: I = C·dV/dt.')}</p></div>
        <div class="card"><h4>${L('Akkor lambalar', 'Incandescent lamps')}</h4><p>${L('Soğuk filaman, sıcak direncinin ~1/10–1/15’idir. İlk 10–100 ms’de akım 10–15 kat olur.', 'A cold filament has ~1/10–1/15 of its hot resistance. Current is 10–15× for the first 10–100 ms.')}</p></div>
        <div class="card"><h4>${L('Motorlar', 'Motors')}</h4><p>${L('Duran motorda zıt EMK yoktur: I<sub>stall</sub> = V/R<sub>a</sub>, çalışma akımının 5–10 katı. Motor hızlanana kadar sürer.', 'A stopped motor has no back-EMF: I<sub>stall</sub> = V/R<sub>a</sub>, 5–10× running current. It lasts until the motor spins up.')}</p></div>
        <div class="card"><h4>${L('Transformatörler', 'Transformers')}</h4><p>${L('Kötü anda açılan çekirdek doyuma gider. Akım birkaç periyot boyunca nominalin 10–30 katı olabilir.', 'Switched on at an unlucky moment, the core saturates. Current can reach 10–30× nominal for a few cycles.')}</p></div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Etki', 'Effect')}</th><th>${L('Neden', 'Why')}</th></tr></thead>
        <tbody>
          <tr><td>${L('MCU brown-out / reset', 'MCU brown-out / reset')}</td><td>${L('Ortak besleme kablo ve kaynak empedansında düşer; BOR eşiği aşılır.', 'The shared rail sags across wiring and source; the BOR threshold trips.')}</td></tr>
          <tr><td>${L('Sigorta atması', 'Blown fuse')}</td><td>${L('Hızlı sigorta I²t’ye duyarlıdır; kısa ama yüksek darbe yeter.', 'Fast fuses respond to I²t; a short, high pulse is enough.')}</td></tr>
          <tr><td>${L('Konnektörde ark/kıvılcım', 'Connector arcing/sparks')}</td><td>${L('İlk temas yüzlerce amper taşır, kontak aşınır. XT60 ve DC jack’te bilinen sorun.', 'The first contact carries hundreds of amps and pits. Known with XT60s and DC jacks.')}</td></tr>
          <tr><td>${L('Beslemenin akım sınırına girmesi', 'Supply current limit trips')}</td><td>${L('Besleme hiccup moduna girer; sistem hiç açılamayabilir.', 'The supply enters hiccup mode; the system may never start.')}</td></tr>
          <tr><td>${L('Anahtarın SOA dışına çıkması', 'Switch outside SOA')}</td><td>${L('Kontrollü açılışta MOSFET yüksek V<sub>DS</sub> ve akımı birlikte taşır (Bölüm 12).', 'In a controlled turn-on the MOSFET sees high V<sub>DS</sub> and current together (chapter 12).')}</td></tr>
        </tbody></table></div>

      <h2>${L('Kondansatörlü yük: sert açılış', 'Capacitive load: hard switch-on')}</h2>
      <p>${L('Sert açılışta tepe akım V/R<sub>toplam</sub>’dır ve çoğu zaman yüzlerce amper eder. R<sub>toplam</sub> ESR, R<sub>DS(on)</sub>, kablo ve kaynak direncinin toplamıdır.',
             'On a hard switch-on the peak is V/R<sub>total</sub>, often hundreds of amps. R<sub>total</sub> is ESR + R<sub>DS(on)</sub> + wiring + source resistance.')}</p>
      <p>${L('Gerçekte tepeyi çoğu zaman kablo endüktansı ve kaynak sınırlar.', 'In practice wiring inductance and the source often set the peak.')}</p>
      <div class="eq">i(t) = (V / R) · e<sup>−t/RC</sup> &nbsp;&nbsp; I<sub>${L('tepe', 'peak')}</sub> = <b>V / R<sub>${L('toplam', 'total')}</sub></b> &nbsp;&nbsp; E<sub>R</sub> = ∫ i²R dt = <b>½ · C · V²</b>
        <span class="note">${L('Dirençte yanan enerji R’den bağımsızdır. Kaynak C·V² verir: yarısı kondansatörde kalır, yarısı ısı olur. Küçük R yalnızca aynı enerjiyi daha hızlı yakar.',
                               'The energy burned in R does not depend on R. The source delivers C·V²: half is stored, half becomes heat. Smaller R just burns it faster.')}</span></div>
      ${App.lab('lab-cap', L('Kondansatörlü yükü açmak: sert açılış ve soft-start', 'Switching on a capacitive load: hard vs soft start'), {
        stack: true,
        foot: L('İdeal kaynak; R<sub>toplam</sub> = ESR + anahtar + kablo; endüktans ihmal edildi. Soft-start çıkışı t<sub>ramp</sub> boyunca doğrusal yükseltir. Her iki durumda kayıp ½·C·V²’dir.',
                'Ideal source; R<sub>total</sub> = ESR + switch + wiring; inductance neglected. Soft start ramps the output linearly over t<sub>ramp</sub>. Loss is ½·C·V² in both cases.')
      })}
      <div class="call warn"><strong>${L('Soft-start enerjiyi azaltmaz, gücü azaltır', 'Soft start does not reduce the energy, it reduces the power')}</strong>
        <ul>
          <li>${L('Kayıp dirençlerden lineer bölgedeki MOSFET’e taşınır.', 'The loss moves from the resistances into the linear-mode MOSFET.')}</li>
          <li>${L('Ortalama güç: ½·C·V²/t<sub>ramp</sub>.', 'Average power: ½·C·V²/t<sub>ramp</sub>.')}</li>
          <li>${L('Başta MOSFET üzerinde tam V vardır: anlık güç ≈ V·I<sub>inrush</sub>.', 'At the start the full V is across it: instant power ≈ V·I<sub>inrush</sub>.')}</li>
        </ul>
        ${L('Bu noktayı t<sub>ramp</sub> süreli darbe için SOA eğrisinde kontrol et (<a href="#overcurrent">Bölüm 12</a>).', 'Check that point on the SOA curve for a t<sub>ramp</sub> pulse (<a href="#overcurrent">chapter 12</a>).')}</div>

      <h2>${L('P-MOS ve gate RC ile soft-start', 'Soft start with a P-MOS and a gate RC')}</h2>
      <p>${L('En ucuz kontrollü açılış: bir P-MOS, gate–drain arasında C<sub>gd,ext</sub> ve gate’i aşağı çeken R2. Çıkış eğimini yükten bağımsız olarak R2 ve C<sub>gd,ext</sub> belirler.',
             'The cheapest controlled turn-on: a P-MOS, C<sub>gd,ext</sub> from gate to drain, and R2 pulling the gate down. R2 and C<sub>gd,ext</sub> set the output slope, regardless of load.')}</p>
      <ul>
        <li>${L('Gate çekilir, P-MOS eşiğe gelir.', 'The gate is pulled down and the P-MOS reaches threshold.')}</li>
        <li>${L('Gate <b>Miller platosunda takılır</b>: yükselen çıkış C<sub>gd,ext</sub> üzerinden gate’i geri iter.', 'The gate <b>sticks on the Miller plateau</b>: the rising output pushes it back through C<sub>gd,ext</sub>.')}</li>
        <li>${L('R2 akımının neredeyse tamamı C<sub>gd,ext</sub>’den gelir; dV/dt sabitlenir.', 'Almost all of R2’s current comes through C<sub>gd,ext</sub>; dV/dt is fixed.')}</li>
        <li>${L('Inrush akımı C<sub>yük</sub>·dV/dt olur.', 'Inrush becomes C<sub>load</sub>·dV/dt.')}</li>
      </ul>
      <div class="eq">dV<sub>OUT</sub>/dt ≈ I<sub>R2</sub> / C<sub>gd,ext</sub> = [(V<sub>IN</sub> − |V<sub>${L('plato', 'plateau')}</sub>|)/R2 − |V<sub>${L('plato', 'plateau')}</sub>|/R1] / C<sub>gd,ext</sub> &nbsp;&nbsp; I<sub>inrush</sub> = <b>C<sub>${L('yük', 'load')}</sub> · dV<sub>OUT</sub>/dt</b>
        <span class="note">${L('R1 kapalıyken gate’i source’a çeker. Açıkken V<sub>SG</sub> = V<sub>IN</sub>·R1/(R1+R2). Bu 20 V’u aşacaksa gate–source arasına 12–15 V zener koy.',
                               'R1 holds the gate at the source when off. When on, V<sub>SG</sub> = V<sub>IN</sub>·R1/(R1+R2). If that exceeds 20 V, add a 12–15 V gate–source zener.')}</span></div>
      ${App.lab('lab-pmos', L('P-MOS soft-start: gate RC, Miller platosu ve çıkış rampası', 'P-MOS soft start: gate RC, Miller plateau and output ramp'), {
        stack: true,
        foot: L('R1 = 100 kΩ, |V<sub>th</sub>| = 2 V, |V<sub>plato</sub>| = 3 V, iç C<sub>gs</sub> = 2 nF; C<sub>gd,ext</sub> iç C<sub>gd</sub>’den çok büyük. Yük yalnızca kapasitif. MOSFET tepe gücü ≈ V<sub>IN</sub>·I<sub>inrush</sub>.',
                'R1 = 100 kΩ, |V<sub>th</sub>| = 2 V, |V<sub>plateau</sub>| = 3 V, internal C<sub>gs</sub> = 2 nF; C<sub>gd,ext</sub> ≫ internal C<sub>gd</sub>. Purely capacitive load. MOSFET peak power ≈ V<sub>IN</sub>·I<sub>inrush</sub>.')
      })}

      <h2>${L('NTC termistör ile sınırlama', 'Limiting with an NTC thermistor')}</h2>
      <p>${L('Güç kaynağı girişindeki küçük disk bir NTC’dir. Soğukken birkaç ohm’dur ve ilk şarj akımını sınırlar. Isınınca direnci 10–20 kat düşer.',
             'The small disc at a power-supply input is an NTC. Cold, it is a few ohms and limits the first charge. Once hot, its resistance drops 10–20 times.')}</p>
      <p>${L('Basit ve ucuzdur, ama iki zayıf noktası var:', 'Simple and cheap, but with two weak spots:')}</p>
      <ul>
        <li>${L('<b>Sürekli ısınır:</b> çalışırken I²R kaybı, gövde 100 °C’nin üstünde.', '<b>It runs hot:</b> I²R loss while running, body above 100 °C.')}</li>
        <li>${L('<b>Sıcak yeniden başlatmada korumaz:</b> NTC hâlâ sıcaktır, inrush neredeyse sınırsızdır.', '<b>No protection on a hot restart:</b> the NTC is still hot and inrush is almost unlimited.')}</li>
      </ul>
      <div class="eq">R(T) = R<sub>25</sub> · e<sup>B·(1/T − 1/298 K)</sup>
        <span class="note">${L('B tipik olarak 2500–4000 K; T kelvin cinsindendir.', 'B is typically 2500–4000 K; T in kelvin.')}</span></div>
      ${App.lab('lab-ntc', L('NTC: soğuk başlangıç, sıcak yeniden başlatma', 'NTC: cold start vs hot restart'), {
        foot: L('B = 2800 K, ısıl direnç 40 K/W, soğuma zaman sabiti 60 s, ortam 25 °C. Kondansatör tamamen boş kabul edildi. Diğer seri dirençler 0,1 Ω.',
                'B = 2800 K, thermal resistance 40 K/W, cooling time constant 60 s, ambient 25 °C. The capacitor is assumed fully discharged. Other series resistance 0.1 Ω.')
      })}

      <h2>${L('Lamba ve motor inrush’ı', 'Lamp and motor inrush')}</h2>
      ${App.figure('fig-lm', L('Isınan filaman ve hızlanan motor', 'A heating filament and a spinning-up motor'), {
        foot: L('Sol: 12 V / 21 W lamba, sıcak 6,9 Ω, soğuk ≈ 1/12’si, τ ≈ 30 ms. Sağ: 12 V motor, 1,2 Ω (I<sub>stall</sub> = 10 A), çalışma 2 A, τ = 150 ms. MOSFET’i <b>tepe</b> akıma göre seç; PWM’i yumuşak başlatmak da yardımcı olur.',
                'Left: 12 V / 21 W lamp, 6.9 Ω hot, ≈ 1/12 of that cold, τ ≈ 30 ms. Right: 12 V motor, 1.2 Ω (I<sub>stall</sub> = 10 A), 2 A running, τ = 150 ms. Size the MOSFET for the <b>peak</b>; ramping the PWM also helps.')
      })}
      <ul>
        <li>${L('<b>Lamba:</b> olay zararsızdır, ama sigorta ve MOSFET tepe akıma göre seçilmeli.', '<b>Lamp:</b> harmless, but choose fuse and MOSFET for the peak.')}</li>
        <li>${L('<b>Motor:</b> sıkışırsa inrush bitmez. Bu bir aşırı akımdır; Bölüm 12’deki koruma gerekir.', '<b>Motor:</b> if it stalls, inrush never ends. That is overcurrent and needs chapter 12’s protection.')}</li>
      </ul>

      <h2>${L('Diğer çözümler', 'Other solutions')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Yöntem', 'Method')}</th><th>${L('Nasıl çalışır', 'How it works')}</th><th>${L('Artı', 'Pros')}</th><th>${L('Eksi', 'Cons')}</th></tr></thead>
        <tbody>
          <tr><td>NTC</td><td>${L('Soğuk direnç akımı sınırlar, ısınınca düşer', 'Cold resistance limits current, drops when hot')}</td><td>${L('En ucuz, şebeke girişinde standart', 'Cheapest, standard at mains inputs')}</td><td>${L('Sıcak yeniden başlatma, sürekli kayıp', 'Hot restart, continuous loss')}</td></tr>
          <tr><td>${L('Ön şarj direnci + bypass rölesi', 'Pre-charge resistor + bypass relay')}</td><td>${L('Önce dirençle şarj, sonra röle direnci kısa devre eder', 'Charge through a resistor, then a relay shorts it')}</td><td>${L('Büyük kondansatör bankaları, EV/batarya, inverterler', 'Big capacitor banks, EV/battery, inverters')}</td><td>${L('Röle ve gerilim izleme gerekir; direnç ½·C·V²’yi kaldırmalı', 'Needs a relay and voltage sensing; resistor must absorb ½·C·V²')}</td></tr>
          <tr><td>${L('MOSFET + gate RC', 'MOSFET + gate RC')}</td><td>${L('Miller platosu dV/dt’yi sabitler', 'Miller plateau fixes dV/dt')}</td><td>${L('Birkaç pasif parça, ayarlanabilir', 'A few passives, adjustable')}</td><td>${L('Akım sınırı yok, kısa devrede korumaz; SOA kontrolü şart', 'No current limit or short protection; SOA check needed')}</td></tr>
          <tr><td>${L('Load switch IC', 'Load switch IC')}<br><span class="muted small">TPS22918, TPS22965, AP22652</span></td><td>${L('Entegre MOSFET, C<sub>T</sub> pini ile ayarlı eğim, çıkış deşarjı', 'Integrated MOSFET, slew set by a C<sub>T</sub> pin, output discharge')}</td><td>${L('Küçük, MCU’dan EN ile; tipik ≤ 5,5 V, birkaç A', 'Tiny, EN from the MCU; typically ≤ 5.5 V, a few A')}</td><td>${L('Düşük gerilim/akım; bazılarında akım sınırı yok', 'Low voltage/current; some lack a current limit')}</td></tr>
          <tr><td>${L('eFuse / hot-swap kontrolcüsü', 'eFuse / hot-swap controller')}<br><span class="muted small">TPS2490, LTC4211, TPS25947</span></td><td>${L('Akım sınırı, dV/dt kontrolü, hata zamanlayıcısı; bazılarında güç sınırı', 'Current limit, dV/dt control, fault timer; some limit power')}</td><td>${L('Canlı takma (hot-plug), kısa devre koruması dahil', 'Live insertion (hot-plug), short-circuit protection included')}</td><td>${L('MOSFET’in SOA’sı zamanlayıcı süresine dayanmalı', 'The MOSFET’s SOA must survive the timer duration')}</td></tr>
          <tr><td>${L('DC/DC soft-start', 'DC/DC soft start')}</td><td>${L('Regülatör çıkışını kendi rampalar', 'The regulator ramps its own output')}</td><td>${L('Bedava, çoğu regülatörde var', 'Free, built into most regulators')}</td><td>${L('Regülatörün kendi giriş kondansatörlerini korumaz', 'Does not protect the regulator’s own input caps')}</td></tr>
        </tbody></table></div>
      <div class="call info"><strong>${L('Hot-swap ve SOA', 'Hot-swap and SOA')}</strong>
        ${L('Kısa devrede kontrolcü akımı sınırlar, ama MOSFET üzerinde tam giriş gerilimi kalır. 48 V · 5 A = 240 W eder. Hata zamanlayıcısı (1–10 ms) bu gücü SOA içinde tutacak kadar kısa olmalı. TPS2490 gibi güç sınırlamalı kontrolcüler işi kolaylaştırır.',
            'Into a short the controller limits current, but the full input voltage stays across the MOSFET. 48 V · 5 A is 240 W. The fault timer (1–10 ms) must keep that inside the SOA. Power-limiting controllers like the TPS2490 make this easier.')}</div>

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <details class="fold"><summary>${L('24 V, 470 µF, 0,1 Ω: sert açılış mı, 10 ms soft-start mı?', '24 V, 470 µF, 0.1 Ω: hard switch-on or 10 ms soft start?')}</summary><div>
        <p>${L('2 A’lik bir beslemeden 470 µF’lık bus açılıyor. Önce sert açılışa, sonra soft-start’a bakalım.', 'A 470 µF bus is switched on from a 2 A supply. First the hard switch-on, then soft start.')}</p>
        ${App.example({
          given: [['V', '24 V'], ['C', '470 µF'], ['R<sub>' + L('toplam', 'total') + '</sub>', L('0,1 Ω', '0.1 Ω')]],
          steps: [
            [L('Tepe akım', 'Peak current'), L('24 / 0,1', '24 / 0.1'), '240 A', L('kablo endüktansı biraz düşürür; 100 A mertebesi gerçek', 'wiring inductance lowers it; 100 A class is real')],
            [L('Zaman sabiti', 'Time constant'), L('0,1 Ω · 470 µF', '0.1 Ω · 470 µF'), '47 µs', L('akım ~0,2 ms’de söner', 'current decays in ~0.2 ms')],
            [L('Harcanan enerji', 'Energy dissipated'), '½ · 470 µF · 24²', '135 mJ', L('R’den bağımsız', 'independent of R')]
          ],
          result: L('<b>Sert açılış uygun değil.</b> Konnektörde kıvılcım çıkar ve 2 A’lik besleme çöker.', '<b>A hard switch-on is not acceptable.</b> The connector sparks and the 2 A supply collapses.'),
          level: 'bad'
        })}
        ${App.example({
          given: [['t<sub>ramp</sub>', '10 ms'], ['C', '470 µF'], ['V', '24 V']],
          steps: [
            [L('Inrush akımı', 'Inrush current'), 'I = 470 µF · 24 V / 10 ms', L('1,13 A', '1.13 A'), L('2 A’lik besleme karşılar', 'the 2 A supply copes')],
            [L('MOSFET başlangıç gücü', 'MOSFET initial power'), L('24 V · 1,13 A', '24 V · 1.13 A'), '≈ 27 W'],
            [L('Ortalama güç, 10 ms', 'Average power, 10 ms'), '135 mJ / 10 ms', L('13,5 W', '13.5 W')]
          ],
          result: L('<b>Soft-start çalışır, ama SOA’yı kontrol et.</b> 24 V, 1,13 A, 10 ms noktası D2PAK/TO-220 için uygun, SOT-23 için değil.', '<b>Soft start works, but check the SOA.</b> The 24 V, 1.13 A, 10 ms point suits a D2PAK/TO-220, not a SOT-23.'),
          level: 'warn'
        })}
        <p>${L('Bu rampayı gate RC ile kurmak için C<sub>gd,ext</sub>’yi hesapla:', 'To build this ramp with a gate RC, size C<sub>gd,ext</sub>:')}</p>
        ${App.example({
          given: [['V<sub>IN</sub>', '24 V'], ['|V<sub>' + L('plato', 'plateau') + '</sub>|', '3 V'], ['R1 = R2', '100 kΩ']],
          steps: [
            [L('R2 akımı', 'R2 current'), '21 V / 100 kΩ − 3 V / 100 kΩ', '180 µA'],
            [L('Hedef eğim', 'Target slope'), '24 V / 10 ms', L('2,4 V/ms', '2.4 V/ms')],
            [L('Gereken kondansatör', 'Required capacitor'), L('180 µA / 2,4 V/ms', '180 µA / 2.4 V/ms'), '75 nF'],
            [L('Standart 68 nF ile rampa', 'Ramp with standard 68 nF'), '24 V · 68 nF / 180 µA', L('≈ 9,1 ms', '≈ 9.1 ms')]
          ],
          result: L('<b>C<sub>gd,ext</sub> = 68 nF yeterli.</b> Rampa ~9 ms sürer, inrush ~1,25 A olur.', '<b>C<sub>gd,ext</sub> = 68 nF is enough.</b> The ramp takes ~9 ms and inrush is ~1.25 A.'),
          level: 'ok'
        })}
      </div></details>`;
    },

    mount(root, App) {
      const { Viz } = App, { Sch, UI } = Viz, L = App.L;

      /* ---------------- Lab: capacitive load, hard vs soft ---------------- */
      {
        const lab = root.querySelector('#lab-cap');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const svg = Viz.schematic(fig, 600, 200, `
          ${Sch.vsrc(60, 110, 'V')}
          ${Sch.w([[60, 80], [60, 50], [140, 50]])}
          <g id="swO">${Sch.sw(170, 50, 90, false, '')}</g>
          <g id="swC">${Sch.sw(170, 50, 90, true, '')}</g>
          <text x="170" y="34" class="sch-t" text-anchor="middle">${L('anahtar', 'switch')}</text>
          ${Sch.w([[200, 50], [230, 50]])}
          ${Sch.res(260, 50, 90, '')}
          <text x="260" y="34" class="sch-t" text-anchor="middle">R_total</text>
          ${Sch.w([[290, 50], [380, 50], [380, 80]])}
          ${Sch.cap(380, 110, 0, 'C')}
          ${Sch.w([[380, 140], [380, 170], [60, 170], [60, 140]])}
          ${Sch.gnd(220, 170)}
          <text id="ciI" x="420" y="70" class="sch-t cu big"></text>
          <text id="ciV" x="420" y="100" class="sch-t"></text>
          <text id="ciP" x="420" y="130" class="sch-t bad"></text>
          <text id="ciM" x="420" y="160" class="sch-t muted"></text>
        `);
        const flow = new Viz.Flow(svg, 'M60,80V50H380V170H60V140', { spacing: 14, speed: 80 });
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const bA = App.h('div'), bB = App.h('div'); grid.append(bA, bB);
        const pI = new Viz.Plot(bA, { w: 420, h: 240, x: [0, 1], y: [0, 1], xLabel: 'ms', yLabel: L('I (A)', 'I (A)'), yFmt: v => App.si(v, '', 3) });
        const pV = new Viz.Plot(bB, { w: 420, h: 240, x: [0, 1], y: [0, 1], xLabel: 'ms', yLabel: 'V_C (V)', yFmt: v => App.num(v, 0) });
        const sV = UI.slider(ctl, { label: L('Besleme V', 'Supply V'), min: 3.3, max: 48, step: 0.1, value: 24, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sC = UI.slider(ctl, { label: L('Kapasitans C', 'Capacitance C'), min: 10e-6, max: 4.7e-3, step: 1e-6, value: 470e-6, log: true, unit: 'F', onInput: update });
        const sR = UI.slider(ctl, { label: L('Toplam seri R (ESR + anahtar + kablo)', 'Total series R (ESR + switch + wiring)'), min: 0.01, max: 10, step: 0.005, value: 0.1, log: true, unit: 'Ω', onInput: update });
        const tS = UI.toggle(ctl, { label: 'Soft-start', value: false, onChange: update });
        const sT = UI.slider(ctl, { label: 't<sub>ramp</sub>', min: 0.1e-3, max: 50e-3, step: 0.1e-3, value: 10e-3, log: true, unit: 's', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'pk', label: L('Tepe akım', 'Peak current') },
          { key: 'hard', label: L('Sert açılışta tepe (V/R)', 'Hard switch-on peak (V/R)') },
          { key: 'tau', label: 'τ = R·C' },
          { key: 'e', label: L('Dirençler + anahtarda enerji', 'Energy in resistances + switch') },
          { key: 'esw', label: L('Bunun anahtardaki kısmı', 'Of which in the switch') },
          { key: 'pp', label: L('Anahtar tepe gücü', 'Switch peak power') },
          { key: 't', label: L('%99 şarj süresi', 'Time to 99 %') }
        ]);
        let M = null, tc = 0;
        function update() {
          const V = sV.value, C = sC.value, R = sR.value, soft = tS.value, tr = sT.value;
          sT.el.style.opacity = soft ? 1 : 0.45;
          const tau = R * C;
          let T, i, vs;
          if (!soft) {
            T = 6 * tau;
            i = t => t < 0 ? 0 : V / R * Math.exp(-t / tau);
            vs = t => t < 0 ? 0 : V;
          } else {
            T = tr + 6 * tau;
            const I0 = C * V / tr;
            i = t => t < 0 ? 0 : t < tr ? I0 * (1 - Math.exp(-t / tau)) : I0 * (1 - Math.exp(-tr / tau)) * Math.exp(-(t - tr) / tau);
            vs = t => t < 0 ? 0 : V * Math.min(1, t / tr);
          }
          const pre = 0.08 * T;
          const vc = t => vs(t) - i(t) * R;
          // numeric energies
          const N = 2000; let Eall = 0, Esw = 0, Ppk = 0, Ipk = 0;
          for (let k = 0; k < N; k++) {
            const t = T * (k + 0.5) / N, ii = i(t);
            const Rsw = soft ? 0 : R * 0.3; // hard: assume ~30 % of R_total is the switch
            const psw = soft ? (V - vs(t)) * ii + ii * ii * R * 0.3 : ii * ii * Rsw;
            Eall += (ii * ii * R + (soft ? (V - vs(t)) * ii : 0)) * T / N;
            Esw += psw * T / N;
            Ppk = Math.max(Ppk, psw); Ipk = Math.max(Ipk, ii);
          }
          const [u, un] = unitFor(T);
          [pI, pV].forEach(p => { p.o.xLabel = L('zaman', 'time') + ' (' + un + ')'; p.o.xFmt = v => App.num(v, (T / u) < 5 ? 1 : 0); });
          pI.setRange({ x: [-pre / u, T / u], y: [0, Ipk * 1.15] });
          pV.setRange({ x: [-pre / u, T / u], y: [0, V * 1.15] });
          const pts = Viz.sample(t => 0, -pre, T, 500).map(([t]) => t);
          pI.line('i', pts.map(t => [t / u, i(t)]), 'cu');
          pI.area('ia', pts.map(t => [t / u, i(t)]), 'cu');
          pV.line('vs', pts.map(t => [t / u, vs(t)]), 'faint dash');
          pV.line('vc', pts.map(t => [t / u, vc(t)]), 'sig');
          pV.text('vsl', T / u, V, soft ? L('anahtar çıkışı', 'switch output') : 'V', 'muted', 'end', -4, -6);
          pI.text('ipk', 0, Ipk, App.si(Ipk, 'A'), 'cu', 'start', 6, 4);
          M = { i, vc, T, pre, Ipk, u, V, R };
          ro.set('pk', App.si(Ipk, 'A'), Ipk > 50 ? 'bad' : Ipk > 5 ? 'warn' : 'ok');
          ro.set('hard', App.si(V / R, 'A'));
          ro.set('tau', App.si(tau, 's'));
          ro.set('e', App.si(Eall, 'J') + ' ≈ ½CV² = ' + App.si(0.5 * C * V * V, 'J'));
          ro.set('esw', App.si(Esw, 'J') + (soft ? '' : L(' (R’nin %30’u varsayıldı)', ' (assumed 30 % of R)')));
          ro.set('pp', App.si(Ppk, 'W'), Ppk > 100 ? 'bad' : Ppk > 10 ? 'warn' : '');
          ro.set('t', App.si(soft ? tr + 4.6 * tau : 4.6 * tau, 's'));
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!M) return;
          tc += dt;
          const ph = App.reducedMotion ? 0.5 : Math.min(1, (tc % 4.2) / 3.4);
          const t = -M.pre + (M.T + M.pre) * ph;
          const ii = M.i(t), v = M.vc(t);
          pI.vline('cur', t / M.u, 'sig solid'); pV.vline('cur', t / M.u, 'sig solid');
          pI.dot('d', t / M.u, ii, '', 4); pV.dot('d', t / M.u, v, 'sig', 4);
          flow.rate = M.Ipk > 0 ? Math.min(3, ii / M.Ipk * 2.5) : 0;
          svg.querySelector('#swO').style.display = t < 0 ? '' : 'none';
          svg.querySelector('#swC').style.display = t < 0 ? 'none' : '';
          svg.querySelector('#ciI').textContent = 'I = ' + App.si(ii, 'A');
          svg.querySelector('#ciV').textContent = 'V_C = ' + App.num(Math.max(0, v), 2) + ' V';
          svg.querySelector('#ciP').textContent = 'P_R = ' + App.si(ii * ii * M.R, 'W');
          svg.querySelector('#ciM').textContent = t < 0 ? L('anahtar açık', 'switch open') : L('şarj oluyor', 'charging');
        });
      }

      /* ---------------- Lab: P-MOS RC soft start ---------------- */
      {
        const lab = root.querySelector('#lab-pmos');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const svg = Viz.schematic(fig, 600, 250, `
          ${Sch.vcc(320, 40, 'V_IN')}
          ${Sch.w([[230, 40], [320, 40], [320, 70]])}${Sch.dot(320, 40)}
          ${Sch.res(230, 70, 0, 'R1')}
          ${Sch.pmos(300, 100, 'Q1')}
          ${Sch.w([[180, 100], [270, 100]], 'sigw')}${Sch.dot(230, 100)}
          ${Sch.w([[230, 100], [230, 160], [245, 160]], 'sigw')}
          ${Sch.cap(275, 160, 90, '')}
          <text x="275" y="182" class="sch-t sig" text-anchor="middle">C_gd,ext</text>
          ${Sch.w([[305, 160], [320, 160]])}
          ${Sch.w([[320, 130], [320, 160], [440, 160]], 'hot')}${Sch.dot(320, 160)}
          ${Sch.cap(440, 190, 0, L('C_yük', 'C_load'))}
          ${Sch.gnd(440, 220)}
          ${Sch.res(180, 130, 0, 'R2')}
          ${Sch.nmos(160, 190, '')}
          ${Sch.gnd(180, 220)}
          ${Sch.box(10, 170, 70, 40, 'EN', '')}
          ${Sch.w([[80, 190], [130, 190]], 'sigw')}
          <text x="380" y="150" class="sch-t">V_OUT</text>
          <text id="psVo" x="470" y="110" class="sch-t cu"></text>
          <text id="psVg" x="470" y="90" class="sch-t sig"></text>
          <text id="psI" x="470" y="130" class="sch-t cu"></text>
          <text id="psPh" x="590" y="244" class="sch-t big" text-anchor="end"></text>
        `);
        const fG = new Viz.Flow(svg, 'M230,100H180V220', { cls: 'flow e', spacing: 11, speed: 50 });
        const fCgd = new Viz.Flow(svg, 'M320,160H230V100', { cls: 'flow e', spacing: 11, speed: 50 });
        const fL = new Viz.Flow(svg, 'M320,40V160H440V220', { spacing: 14 });
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const bA = App.h('div'), bB = App.h('div'); grid.append(bA, bB);
        const pV = new Viz.Plot(bA, { w: 420, h: 240, x: [0, 1], y: [0, 30], xLabel: 'ms', yLabel: 'V', yFmt: v => App.num(v, 0) });
        const pI = new Viz.Plot(bB, { w: 420, h: 240, x: [0, 1], y: [0, 1], xLabel: 'ms', yLabel: 'I_inrush (A)', yFmt: v => App.si(v, '', 2) });
        const sV = UI.slider(ctl, { label: 'V<sub>IN</sub>', min: 5, max: 48, step: 0.5, value: 24, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sR2 = UI.slider(ctl, { label: 'R2', min: 10e3, max: 1e6, step: 1e3, value: 100e3, log: true, unit: 'Ω', onInput: update });
        const sCg = UI.slider(ctl, { label: 'C<sub>gd,ext</sub>', min: 1e-9, max: 470e-9, step: 1e-9, value: 68e-9, log: true, unit: 'F', onInput: update });
        const sCl = UI.slider(ctl, { label: L('C<sub>yük</sub>', 'C<sub>load</sub>'), min: 10e-6, max: 4.7e-3, step: 1e-6, value: 470e-6, log: true, unit: 'F', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'dv', label: 'dV<sub>OUT</sub>/dt' },
          { key: 'tr', label: L('Rampa süresi', 'Ramp time') },
          { key: 'i', label: 'I<sub>inrush</sub>' },
          { key: 'pk', label: L('MOSFET tepe gücü ≈ V<sub>IN</sub>·I', 'MOSFET peak power ≈ V<sub>IN</sub>·I') },
          { key: 'e', label: L('MOSFET enerjisi ½·C·V²', 'MOSFET energy ½·C·V²') },
          { key: 'vsg', label: L('Açıkken V<sub>SG</sub>', 'V<sub>SG</sub> when on') }
        ]);
        const R1 = 100e3, Vth = 2, Vpl = 3, Cgs = 2e-9;
        let M = null, tc = 0;
        function update() {
          const V = sV.value, R2 = sR2.value, Cg = sCg.value, Cl = sCl.value;
          const Rp = R1 * R2 / (R1 + R2), Vsgf = V * R1 / (R1 + R2);
          const tau1 = Rp * (Cgs + Cg);
          const ok = Vsgf > Vpl + 0.2;
          // delay: V_SG rises from 0 towards Vsgf with tau1 until Vpl
          const td = ok ? tau1 * Math.log(Vsgf / (Vsgf - Vpl)) : NaN;
          const Ig = (V - Vpl) / R2 - Vpl / R1;
          const dvdt = Ig / Cg, tr = V / dvdt, Iin = Cl * dvdt;
          const tau4 = Rp * Cgs;
          const T = ok ? td + tr + 5 * tau4 + 0.15 * tr : 5 * tau1;
          const pre = 0.08 * T;
          const st = t => {
            if (t < 0) return { vsg: 0, vo: 0, i: 0 };
            if (!ok) { const vsg = Vsgf * (1 - Math.exp(-t / tau1)); return { vsg, vo: 0, i: 0 }; }
            if (t < td) return { vsg: Vsgf * (1 - Math.exp(-t / tau1)), vo: 0, i: 0 };
            if (t < td + tr) return { vsg: Vpl, vo: dvdt * (t - td), i: Iin };
            return { vsg: Vsgf - (Vsgf - Vpl) * Math.exp(-(t - td - tr) / tau4), vo: V, i: 0 };
          };
          const [u, un] = unitFor(T);
          [pV, pI].forEach(p => { p.o.xLabel = L('zaman', 'time') + ' (' + un + ')'; p.o.xFmt = v => App.num(v, (T / u) < 5 ? 1 : 0); });
          pV.setRange({ x: [-pre / u, T / u], y: [0, V * 1.15] });
          pI.setRange({ x: [-pre / u, T / u], y: [0, Math.max(Iin, 1e-3) * 1.3] });
          const ts = Viz.sample(t => 0, -pre, T, 500).map(([t]) => t);
          pV.line('vo', ts.map(t => [t / u, st(t).vo]), 'cu');
          pV.line('vg', ts.map(t => [t / u, V - st(t).vsg]), 'sig');
          pV.text('vol', T / u, V, 'V_OUT', 'cu', 'end', -4, 14);
          pV.text('vgl', 0, V - Math.min(Vsgf, V), 'V_G', 'sig', 'start', 4, -6);
          pI.line('i', ts.map(t => [t / u, st(t).i]), 'cu');
          pI.area('ia', ts.map(t => [t / u, st(t).i]), 'cu');
          if (ok) { pV.rect('pl', td / u, 0, (td + tr) / u, V * 1.15, 'warn'); pV.text('plt', (td + tr / 2) / u, V * 1.07, L('Miller platosu', 'Miller plateau'), 'muted', 'middle'); }
          pV.hide('pl', !ok); pV.hide('plt', !ok);
          M = { st, T, pre, u, Iin, ok, Ig, V, td, tr };
          ro.set('dv', ok ? App.si(dvdt * 1e-3, 'V') + '/ms' : '—');
          ro.set('tr', ok ? App.si(tr, 's') : '—');
          ro.set('i', ok ? App.si(Iin, 'A') : '—', ok ? (Iin > 5 ? 'bad' : Iin > 1.5 ? 'warn' : 'ok') : '');
          ro.set('pk', ok ? App.si(V * Iin, 'W') : '—', ok && V * Iin > 50 ? 'warn' : '');
          ro.set('e', App.si(0.5 * Cl * V * V, 'J'));
          ro.set('vsg', App.num(Vsgf, 1) + ' V' + (Vsgf > 20 ? L(' > 20 V: zener!', ' > 20 V: zener!') : !ok ? L(': tam açılmaz', ': not fully on') : ''), Vsgf > 20 || !ok ? 'bad' : Vsgf < 6 ? 'warn' : 'ok');
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!M) return;
          tc += dt;
          const ph = App.reducedMotion ? 0.5 : Math.min(1, (tc % 4.4) / 3.6);
          const t = -M.pre + (M.T + M.pre) * ph;
          const s = M.st(t);
          pV.vline('cur', t / M.u, 'sig solid'); pI.vline('cur', t / M.u, 'sig solid');
          pV.dot('d', t / M.u, s.vo, '', 4); pI.dot('d', t / M.u, s.i, '', 4);
          const ramp = M.ok && t >= M.td && t < M.td + M.tr;
          fG.rate = t >= 0 && (ramp || t < M.td || (t - M.td - M.tr) < M.T * 0.05) ? 1 : (t >= 0 ? 0.3 : 0);
          fCgd.rate = ramp ? 1.2 : 0;
          fL.rate = ramp ? Math.min(2.5, 0.5 + M.Iin / 2) : 0;
          svg.querySelector('#psVo').textContent = 'V_OUT = ' + App.num(s.vo, 1) + ' V';
          svg.querySelector('#psVg').textContent = 'V_SG = ' + App.num(s.vsg, 2) + ' V';
          svg.querySelector('#psI').textContent = 'I = ' + App.si(s.i, 'A');
          const ph2 = svg.querySelector('#psPh');
          ph2.textContent = t < 0 ? L('EN = 0: kapalı', 'EN = 0: off') : !M.ok ? L('V_SG plato altında: açılmıyor', 'V_SG below plateau: does not turn on') : t < M.td ? L('gate eşiğe iniyor', 'gate falling to threshold') : ramp ? L('plato: C_gd,ext eğimi belirliyor', 'plateau: C_gd,ext sets the slope') : L('tam açık', 'fully on');
          ph2.setAttribute('class', 'sch-t big ' + (ramp ? 'cu' : !M.ok && t >= 0 ? 'bad' : 'sig'));
        });
      }

      /* ---------------- Lab: NTC ---------------- */
      {
        const lab = root.querySelector('#lab-ntc');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const pR = new Viz.Plot(fig, { w: 600, h: 230, x: [0, 300], y: [0.05, 50], logY: true, xLabel: L('kapattıktan sonra geçen süre (s)', 'time since switch-off (s)'), yLabel: 'R_NTC (Ω)', xFmt: v => App.num(v, 0), yFmt: v => App.si(v, 'Ω', 2) });
        const pI = new Viz.Plot(fig, { w: 600, h: 230, x: [0, 10], y: [0, 100], xLabel: 'ms', yLabel: 'I (A)', yFmt: v => App.num(v, 0) });
        const sR25 = UI.slider(ctl, { label: 'R<sub>25</sub> (' + L('soğuk', 'cold') + ')', min: 1, max: 30, step: 0.5, value: 5, fmt: v => App.num(v, 1) + ' Ω', onInput: update });
        const sIl = UI.slider(ctl, { label: L('Çalışma akımı', 'Running current'), min: 0.3, max: 5, step: 0.1, value: 2, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const sOff = UI.slider(ctl, { label: L('Kapalı kalma süresi', 'Off time before restart'), min: 0.5, max: 300, step: 0.5, value: 5, log: true, fmt: v => App.num(v, 1) + ' s', onInput: update });
        const sV = UI.slider(ctl, { label: L('DC bus (doğrultulmuş şebeke)', 'DC bus (rectified mains)'), min: 12, max: 340, step: 1, value: 325, fmt: v => App.num(v, 0) + ' V', onInput: update });
        const sC = UI.slider(ctl, { label: 'C', min: 10e-6, max: 1e-3, step: 1e-6, value: 220e-6, log: true, unit: 'F', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'th', label: L('NTC çalışma sıcaklığı', 'NTC running temperature') },
          { key: 'rh', label: L('Sıcak direnç', 'Hot resistance') },
          { key: 'pl', label: L('Sürekli kayıp I²R', 'Continuous loss I²R') },
          { key: 'ic', label: L('Soğuk başlangıç tepe', 'Cold-start peak') },
          { key: 'rr', label: L('Yeniden başlatmada R', 'R at restart') },
          { key: 'ir', label: L('Yeniden başlatma tepe', 'Restart peak') }
        ]);
        const B = 2800, Rth = 40, tauTh = 60, Rs = 0.1;
        const RofT = (r25, Tc) => r25 * Math.exp(B * (1 / (Tc + 273.15) - 1 / 298.15));
        let M = null, tc = 0;
        function update() {
          const r25 = sR25.value, Il = sIl.value, toff = sOff.value, V = sV.value, C = sC.value;
          // solve T = 25 + I²·R(T)·Rth by bisection
          let a = 25, b = 400;
          for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (m - 25 - Il * Il * RofT(r25, m) * Rth < 0) a = m; else b = m; }
          const Th = (a + b) / 2, Rh = RofT(r25, Th);
          const Tr = t => 25 + (Th - 25) * Math.exp(-t / tauTh);
          pR.line('r', Viz.sample(t => RofT(r25, Tr(t)), 0, 300, 300), 'cu');
          pR.hline('r25', r25, '');
          pR.text('r25t', 300, r25, L('soğuk R_25', 'cold R_25'), 'muted', 'end', -4, -5);
          const Rr = RofT(r25, Tr(toff));
          pR.vline('off', toff, 'sig solid');
          pR.dot('d', toff, Rr, Rr < r25 * 0.3 ? 'bad' : '', 5);
          const Ic = V / (r25 + Rs), Ir = V / (Rr + Rs);
          const tauC = (r25 + Rs) * C, tauR = (Rr + Rs) * C;
          const T = 5 * tauC;
          const [u, un] = unitFor(T);
          pI.o.xLabel = L('zaman', 'time') + ' (' + un + ')';
          pI.o.xFmt = v => App.num(v, (T / u) < 5 ? 1 : 0);
          pI.setRange({ x: [0, T / u], y: [0, Ir * 1.12] });
          pI.line('c', Viz.sample(t => Ic * Math.exp(-t * u / tauC), 0, T / u, 300), 'cu');
          pI.line('h', Viz.sample(t => Ir * Math.exp(-t * u / tauR), 0, T / u, 600), 'bad');
          pI.text('ct', T / u * 0.25, Ic * Math.exp(-0.25 * T / tauC), L('soğuk başlangıç', 'cold start'), 'cu', 'start', 6, -6);
          pI.text('ht', 0, Ir, L('sıcak yeniden başlatma', 'hot restart'), 'bad', 'start', 8, 12);
          M = { Ic, Ir, T, u, tauC, tauR };
          ro.set('th', App.num(Th, 0) + ' °C', Th > 150 ? 'bad' : Th > 110 ? 'warn' : '');
          ro.set('rh', App.si(Rh, 'Ω'));
          ro.set('pl', App.si(Il * Il * Rh, 'W'));
          ro.set('ic', App.si(Ic, 'A'));
          ro.set('rr', App.si(Rr, 'Ω'), Rr < r25 * 0.3 ? 'bad' : Rr < r25 * 0.8 ? 'warn' : 'ok');
          ro.set('ir', App.si(Ir, 'A') + ' (×' + App.num(Ir / Ic, 1) + ')', Ir > 2 * Ic ? 'bad' : Ir > 1.2 * Ic ? 'warn' : 'ok');
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!M) return;
          tc += dt;
          const ph = App.reducedMotion ? 0.2 : (tc % 3.5) / 3;
          const t = Math.min(1, ph) * M.T;
          pI.vline('cur', t / M.u, 'sig solid');
          pI.dot('dc', t / M.u, M.Ic * Math.exp(-t / M.tauC), '', 4);
          pI.dot('dh', t / M.u, M.Ir * Math.exp(-t / M.tauR), 'bad', 4);
        });
      }

      /* ---------------- Figure: lamp and motor ---------------- */
      {
        const fig = root.querySelector('#fig-lm .lab-fig');
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const left = App.h('div'), right = App.h('div'); grid.append(left, right);
        const svgL = Viz.schematic(left, 420, 170, `
          ${Sch.vcc(120, 30, '12 V')}${Sch.w([[120, 30], [120, 55]])}
          <g class="sch led" id="lamp"><circle class="led-glow" cx="120" cy="85" r="22"/><circle cx="120" cy="85" r="16"/><path d="M120,55V69M120,101V115M109,74L131,96M131,74L109,96"/></g>
          ${Sch.w([[120, 115], [120, 140]])}${Sch.gnd(120, 140)}
          <text id="lmL" x="160" y="80" class="sch-t cu big"></text>
          <text id="lmR" x="160" y="104" class="sch-t"></text>
        `);
        const svgM = Viz.schematic(right, 420, 170, `
          ${Sch.vcc(120, 30, '12 V')}${Sch.w([[120, 30], [120, 55]])}
          ${Sch.motor(120, 85, '', 'mot')}
          ${Sch.w([[120, 115], [120, 140]])}${Sch.gnd(120, 140)}
          <text id="lmM" x="160" y="80" class="sch-t cu big"></text>
          <text id="lmW" x="160" y="104" class="sch-t"></text>
        `);
        const fLa = new Viz.Flow(svgL, 'M120,30V140', { spacing: 12 });
        const fMo = new Viz.Flow(svgM, 'M120,30V140', { spacing: 12 });
        const pL = new Viz.Plot(left, { w: 420, h: 220, x: [0, 200], y: [0, 24], xLabel: L('zaman (ms)', 'time (ms)'), yLabel: 'I (A)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
        const pM = new Viz.Plot(right, { w: 420, h: 220, x: [0, 800], y: [0, 12], xLabel: L('zaman (ms)', 'time (ms)'), yLabel: 'I (A)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
        const Rh = 6.9, r0 = 1 / 12, tl = 30;
        const Rl = t => Rh * (r0 + (1 - r0) * (1 - Math.exp(-t / tl)));
        const Il = t => 12 / Rl(t);
        const Im = t => 2 + 8 * Math.exp(-t / 150);
        pL.line('i', Viz.sample(Il, 0, 200, 300), 'cu');
        pL.hline('n', 12 / Rh, '');
        pL.text('nt', 198, 12 / Rh, L('nominal 1,75 A', 'nominal 1.75 A'), 'muted', 'end', 0, -6);
        pL.text('pt', 4, Il(0), L('≈ 21 A tepe', '≈ 21 A peak'), 'cu', 'start', 6, 10);
        pM.line('i', Viz.sample(Im, 0, 800, 300), 'cu');
        pM.hline('n', 2, '');
        pM.text('nt', 798, 2, L('çalışma 2 A', 'running 2 A'), 'muted', 'end', 0, -6);
        pM.text('pt', 8, 10, L('I_stall = 10 A', 'I_stall = 10 A'), 'cu', 'start', 6, 10);
        const glow = svgL.querySelector('#lamp .led-glow');
        const rotor = svgM.querySelector('#mot .rotor');
        let t = 0, ang = 0;
        App.onFrame(dt => {
          t += App.reducedMotion ? 0 : dt;
          const tL = App.reducedMotion ? 150 : ((t % 2.6) / 2.2) * 200;
          const tM = App.reducedMotion ? 600 : ((t % 4) / 3.4) * 800;
          const lOn = tL <= 200, mOn = tM <= 800;
          const il = lOn ? Il(tL) : 0, im = mOn ? Im(tM) : 0;
          pL.vline('cur', Math.min(tL, 200), 'sig solid'); pL.dot('d', Math.min(tL, 200), il, '', 4);
          pM.vline('cur', Math.min(tM, 800), 'sig solid'); pM.dot('d', Math.min(tM, 800), im, '', 4);
          fLa.rate = il / 8; fMo.rate = im / 4;
          glow.style.opacity = lOn ? (1 - Math.exp(-tL / tl)).toFixed(2) : 0;
          const w = mOn ? 1 - Math.exp(-tM / 150) : 0;
          ang = (ang + dt * 720 * w) % 360;
          rotor.setAttribute('transform', `rotate(${ang.toFixed(1)} 120 85)`);
          svgL.querySelector('#lmL').textContent = 'I = ' + App.num(il, 1) + ' A';
          svgL.querySelector('#lmR').textContent = 'R = ' + App.num(lOn ? Rl(tL) : Rh * r0, 2) + ' Ω';
          svgM.querySelector('#lmM').textContent = 'I = ' + App.num(im, 1) + ' A';
          svgM.querySelector('#lmW').textContent = L('hız ', 'speed ') + Math.round(w * 100) + ' %';
        });
      }
    }
  });
})();
