/* 08 — Inductive loads and flyback: V = L·di/dt, turn-off spike, clamp methods (diode, diode+zener,
   TVS, RC snubber), avalanche energy, motors and back-EMF, diode selection, PWM-driven coils */
App.page({
  id: 'inductive',
  num: '08',
  group: { tr: 'Sürme', en: 'Driving' },
  title: { tr: 'Endüktif yükler ve flyback', en: 'Inductive loads and flyback' },
  blurb: {
    tr: 'Röle, solenoid ve motorlar: kapanma tepesi, flyback diyodu, zener/TVS, avalanş enerjisi.',
    en: 'Relays, solenoids and motors: the turn-off spike, flyback diode, zener/TVS, avalanche energy.'
  },
  summary: {
    tr: 'Bobin akımı aniden değişmez. Anahtar açılınca bobin, bir yol bulana kadar yüzlerce volt üretebilir. Bu tepeyi görüyor ve güvenle bastırmanın yollarını karşılaştırıyoruz.',
    en: 'Coil current cannot change suddenly. When the switch opens, the coil can make hundreds of volts until something conducts. We look at that spike and compare safe ways to clamp it.'
  },
  render(L) {
    return `
      <style>
        [data-page="inductive"] .schem .heat { fill: var(--bad); stroke: none; opacity: 0; filter: blur(7px); }
        [data-page="inductive"] .status { margin: 0; }
      </style>

      ${App.keys([
        L('Endüktif yük kapanırken tepe gerilim üretir. Her bobine bir bastırma yolu ver.', 'An inductive load makes a voltage spike at turn-off. Give every coil a clamp path.'),
        L('Düz flyback diyodu en güvenlisidir ama röleyi yavaş bırakır.', 'A plain flyback diode is the safest clamp, but releases a relay slowly.'),
        L('Hızlı bırakma için diyoda seri zener ya da TVS ekle. MOSFET gerilimini yükselt.', 'For fast release, add a series zener or TVS. Raise the MOSFET voltage rating.'),
        L('PWM altında Schottky ya da ultrafast diyot kullan. 1N4007 kullanma.', 'Under PWM use a Schottky or ultrafast diode. Not a 1N4007.'),
        L('Avalanşa sadece nadir arızalarda güven, normal çalışmada değil.', 'Rely on avalanche only for rare faults, never in normal operation.')
      ])}

      <h2>${L('Bobin akımı aniden değişmez', 'Inductor current cannot change suddenly')}</h2>
      <p>${L('<b>Bobin akımını hızla kesersen büyük bir gerilim üretir.</b> Gerilim, akımın değişim hızıyla orantılıdır: V = L·di/dt.', '<b>Interrupt a coil’s current quickly and it produces a large voltage.</b> The voltage is proportional to how fast the current changes: V = L·di/dt.')}</p>
      <p>${L('MOSFET ya da mekanik anahtar akımı nanosaniyeler içinde keser. Bobin, akımı sürdürmek için gereken gerilimi kendisi üretir.', 'A MOSFET or a mechanical switch cuts the current within nanoseconds. The coil generates whatever voltage it takes to keep the current flowing.')}</p>
      <div class="eq"><b>V<sub>L</sub> = L · di/dt</b> &nbsp;&nbsp; E = ½ · L · I² &nbsp;&nbsp; τ = L / R</div>
      ${App.example({
        given: [['L', '10 mH'], ['I', '100 mA'], [L('Kesme süresi', 'Cut-off time'), '1 µs']],
        steps: [
          [L('Tepe gerilim', 'Peak voltage'), L('10 mH · 0,1 A / 1 µs', '10 mH · 0.1 A / 1 µs'), '1000 V'],
          [L('Depolanan enerji', 'Stored energy'), L('½ · 0,01 · 0,1²', '½ · 0.01 · 0.1²'), '50 µJ']
        ],
        result: L('<b>Küçük bir röle bobini bile bir MOSFET’i delebilir.</b> Enerji küçük ama gerilim çok yüksek.', '<b>Even a small relay coil can punch through a MOSFET.</b> The energy is small, but the voltage is huge.'),
        level: 'bad'
      })}
      ${App.figure('fig-ldi', L('Akımı ne kadar hızlı kesersen tepe o kadar büyür', 'The faster you interrupt, the bigger the spike'), {
        foot: L('L = 10 mH, I = 100 mA, akım t<sub>f</sub> sürede doğrusal sıfırlanıyor, bastırma yok. Gerçekte gerilim, bir şey iletime geçince durur: avalanş, kırılma, ark ya da bastırma elemanı.',
                'L = 10 mH, I = 100 mA, current ramps to zero in t<sub>f</sub>, no clamp. In reality the voltage stops when something conducts: avalanche, breakdown, an arc or a clamp.')
      })}

      <h2>${L('Anahtar açıldığında ne olur?', 'What happens when the switch opens?')}</h2>
      <p>${L('Low-side bir MOSFET bir röle bobinini sürüyor olsun. MOSFET kapanınca bobin akımının gidecek yeri kalmaz ve drain’i yukarı iter.', 'Take a low-side MOSFET driving a relay coil. When the MOSFET turns off, the coil current has nowhere to go and pushes the drain up.')}</p>
      <ul>
        <li>${L('<b>Bastırma yok:</b> drain <b>avalanş</b> gerilimine çıkar (V<sub>(BR)DSS</sub> × ~1,1–1,3). Bobinin bütün enerjisi MOSFET’te ısıya döner.', '<b>No clamp:</b> the drain rises to the <b>avalanche</b> voltage (V<sub>(BR)DSS</sub> × ~1.1–1.3). All the coil’s energy turns into heat inside the MOSFET.')}</li>
        <li>${L('<b>Flyback diyodu:</b> bobine ters paralel bağlanır. Akım diyottan bobine geri döner, drain V+ + 0,7 V’ta kalır.', '<b>Flyback diode:</b> reversed across the coil. Current circulates back through the diode and the drain stays at V+ + 0.7 V.')}</li>
      </ul>
      ${App.lab('lab-fly', L('Kapanma tepesi ve bastırma yöntemleri', 'The turn-off spike and clamp methods'), {
        foot: L('Bobin direnci R = V+/I. Diyot V<sub>F</sub> = 0,7 V. Bastırmasız MOSFET 1,2 × anma geriliminde avalanşa girer. TVS drain–toprak arasında ideal kelepçe; zener diyotla seri. Snubber R<sub>s</sub> = R. Parazitikler ihmal; E<sub>AS</sub> değerleri örnek; zaman yavaşlatıldı.',
                'Coil resistance R = V+/I. Diode V<sub>F</sub> = 0.7 V. Unclamped, the MOSFET avalanches at 1.2 × its rating. TVS is an ideal drain–ground clamp; the zener is in series with the diode. Snubber R<sub>s</sub> = R. Parasitics ignored; E<sub>AS</sub> values are examples; time slowed down.')
      })}

      <h2>${L('Bastırma yöntemleri: hız mı, gerilim mi?', 'Clamp methods: speed or voltage?')}</h2>
      <p>${L('<b>Bobin enerjisi her durumda bir yerde harcanır.</b> Bastırma yöntemi, bunun nerede ve ne kadar hızlı olacağını seçer.', '<b>The coil’s energy is always dissipated somewhere.</b> The clamp method chooses where, and how fast.')}</p>
      <ul>
        <li>${L('Bobin uçlarındaki ters gerilim büyüdükçe akım daha hızlı söner.', 'The higher the reverse voltage across the coil, the faster the current decays.')}</li>
        <li>${L('Düz diyot (0,7 V): en düşük drain gerilimi, en yavaş sönme.', 'Plain diode (0.7 V): lowest drain voltage, slowest decay.')}</li>
        <li>${L('Zener ya da TVS: daha yüksek drain gerilimi, çok daha hızlı sönme.', 'Zener or TVS: higher drain voltage, much faster decay.')}</li>
      </ul>
      <div class="eq">t<sub>${L('sönme', 'decay')}</sub> ≈ τ · ln(1 + I·R / V<sub>${L('kelepçe', 'clamp')}</sub>) &nbsp;&nbsp; <b>t ≈ L·I / V<sub>${L('kelepçe', 'clamp')}</sub></b> ${L('(V<sub>kelepçe</sub> ≫ I·R ise)', '(if V<sub>clamp</sub> ≫ I·R)')}
        <span class="note">${L('V<sub>kelepçe</sub>: sönme sırasında bobin uçlarındaki ters gerilim. Diyot: 0,7 V. Diyot + zener: V<sub>Z</sub> + 0,7 V. Drain’de TVS: V<sub>cl</sub> − V+.', 'V<sub>clamp</sub>: the reverse voltage across the coil during decay. Diode: 0.7 V. Diode + zener: V<sub>Z</sub> + 0.7 V. TVS at the drain: V<sub>cl</sub> − V+.')}</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Yöntem', 'Method')}</th><th class="num">${L('V<sub>DS</sub> tepe', 'Peak V<sub>DS</sub>')}</th><th>${L('Sönme', 'Decay')}</th><th>${L('Enerji nereye?', 'Energy goes to')}</th><th>${L('Ne zaman', 'When')}</th></tr></thead>
        <tbody>
          <tr><td><span class="pill bad">${L('Yok', 'None')}</span></td><td class="num">V<sub>(BR)DSS</sub></td><td>${L('çok hızlı', 'very fast')}</td><td>${L('MOSFET (avalanş)', 'MOSFET (avalanche)')}</td><td>${L('Sadece avalanşa dayanıklı MOSFET, küçük enerji, tek darbe. Genelde hayır.', 'Only with an avalanche-rated MOSFET, small energy, single pulse. Usually no.')}</td></tr>
          <tr><td>${L('Diyot', 'Diode')}</td><td class="num">${L('V+ + 0,7 V', 'V+ + 0.7 V')}</td><td>${L('yavaş (L/R)', 'slow (L/R)')}</td><td>${L('Bobin direnci + diyot', 'Coil resistance + diode')}</td><td>${L('Röleler, düşük frekans; en basit, en güvenli', 'Relays, low frequency; simplest and safest')}</td></tr>
          <tr><td>${L('Diyot + zener', 'Diode + zener')}</td><td class="num">${L('V+ + V<sub>Z</sub> + 0,7 V', 'V+ + V<sub>Z</sub> + 0.7 V')}</td><td>${L('hızlı', 'fast')}</td><td>${L('Zener (+ bobin)', 'Zener (+ coil)')}</td><td>${L('Röle bırakma süresi önemliyse, solenoid valfler', 'When relay release time matters, solenoid valves')}</td></tr>
          <tr><td>${L('TVS (drain–toprak)', 'TVS (drain–ground)')}</td><td class="num">V<sub>cl</sub></td><td>${L('hızlı', 'fast')}</td><td>${L('TVS', 'TVS')}</td><td>${L('Otomotiv, uzun kablolu yükler, ek koruma', 'Automotive, long-cable loads, extra protection')}</td></tr>
          <tr><td>${L('RC snubber', 'RC snubber')}</td><td class="num">${L('C’ye bağlı', 'depends on C')}</td><td>${L('salınımlı', 'oscillatory')}</td><td>R<sub>s</sub></td><td>${L('AC röle kontakları, salınım bastırma; tek başına flyback için nadir', 'AC relay contacts, ringing suppression; rarely alone for flyback')}</td></tr>
        </tbody></table></div>
      <div class="call warn"><strong>${L('Düz diyot röleyi yavaş bırakır', 'A plain diode makes the relay release slowly')}</strong>
        ${L('Diyotla akım L/R hızında, yavaş söner. Kontak geç ve yavaş açılır, daha uzun ark yapar ve çabuk aşınır. Seri bir 12–24 V zener bırakma süresini birkaç kat kısaltır; röle üreticileri bu yüzden diyot + zener önerir.',
            'With a diode the current decays slowly, at the L/R rate. The contact opens late and slowly, arcs longer and wears faster. A series 12–24 V zener cuts release time several-fold; that is why relay makers recommend diode + zener.')}</div>

      <h2>${L('Avalanş enerjisi (E<sub>AS</sub>)', 'Avalanche energy (E<sub>AS</sub>)')}</h2>
      <p>${L('<b>“Avalanche rated” bir MOSFET kırılmada sınırlı bir enerjiyi bir kez emebilir.</b> Datasheet bunu tek darbe için <b>E<sub>AS</sub></b>, tekrarlayan için <b>E<sub>AR</sub></b> olarak verir.', '<b>An “avalanche rated” MOSFET can absorb a limited energy once at breakdown.</b> The datasheet gives it as <b>E<sub>AS</sub></b> for a single pulse and <b>E<sub>AR</sub></b> for repetitive pulses.')}</p>
      <p>${L('Bastırmasız bobinin MOSFET’e verdiği enerji, depoladığından fazladır. Sönme sırasında besleme de enerji vermeye devam eder.', 'An unclamped coil dumps more energy into the MOSFET than it stored. The supply keeps delivering energy during the decay.')}</p>
      <div class="eq"><b>E<sub>AV</sub> ≈ ½ · L · I² · V<sub>BR</sub> / (V<sub>BR</sub> − V+)</b>
        <span class="note">${L('V<sub>BR</sub> ≈ 1,2–1,3 × V<sub>DSS</sub>. V+, V<sub>BR</sub>’ye yaklaştıkça çarpan büyür. E<sub>AS</sub> 25 °C’de ölçülür, sıcakta azalır.', 'V<sub>BR</sub> ≈ 1.2–1.3 × V<sub>DSS</sub>. The multiplier grows as V+ approaches V<sub>BR</sub>. E<sub>AS</sub> is measured at 25 °C and shrinks when hot.')}</span></div>
      <div class="call info"><strong>${L('Avalanş ne zaman kabul edilebilir?', 'When is avalanche acceptable?')}</strong>
        ${L('Sadece nadir arızalarda güvenlik ağı olarak: kablo kopması, acil kapanma. Şartlar: E<sub>AV</sub> &lt; E<sub>AS</sub>’nin yarısı ve MOSFET avalanşa dayanıklı. Her PWM kenarında tekrarlanan avalanştan tasarım olarak kaçın.',
            'Only as a safety net for rare faults: a cable break, an emergency stop. Conditions: E<sub>AV</sub> &lt; half of E<sub>AS</sub> and an avalanche-rated MOSFET. Avoid repetitive avalanche at every PWM edge by design.')}</div>

      <h2>${L('Motorlar da endüktiftir', 'Motors are inductive too')}</h2>
      <p>${L('DC motor; sargı endüktansı (0,1–5 mH), seri direnç ve hızla orantılı bir <b>zıt-EMK</b> kaynağıdır. Anahtar açılınca sargı akımı yine bir yol arar.', 'A DC motor is a winding inductance (0.1–5 mH), a series resistance and a <b>back-EMF</b> source proportional to speed. When a switch opens, the winding current again seeks a path.')}</p>
      <ul>
        <li>${L('H-köprüde bu yol MOSFET’lerin <b>body diyotlarıdır</b>. Ayrı flyback diyodu çoğu zaman gerekmez.', 'In an H-bridge, the path is the MOSFETs’ <b>body diodes</b>. Separate flyback diodes are rarely needed.')}</li>
        <li>${L('Body diyotu yavaştır. Hızlı PWM’de paralel Schottky ya da senkron doğrultma kaybı azaltır.', 'Body diodes are slow. At fast PWM, a parallel Schottky or synchronous rectification cuts losses.')}</li>
      </ul>
      <p>${L('<b>Frenlenen motor jeneratör olur ve beslemeye enerji pompalar.</b> Asansör inerken ya da araç yokuş aşağı giderken de olur. Besleme akım geri alamıyorsa bulk kondansatör gerilimi yükselir ve köprüyü öldürebilir.', '<b>A braking motor becomes a generator and pumps energy into the supply.</b> So does a descending lift or a vehicle going downhill. If the supply cannot sink current, the bulk capacitor voltage rises and can kill the bridge.')}</p>
      <p>${L('Önlemler:', 'Remedies:')}</p>
      <ul>
        <li>${L('Büyük bulk kondansatörü', 'A large bulk capacitor')}</li>
        <li>${L('Besleme rayında TVS', 'A TVS on the supply rail')}</li>
        <li>${L('Brake chopper direnci', 'A brake-chopper resistor')}</li>
        <li>${L('Geri akımı kabul eden besleme, örneğin pil', 'A supply that accepts reverse current, such as a battery')}</li>
      </ul>

      <h2>${L('Flyback diyodu seçimi', 'Choosing the flyback diode')}</h2>
      <ul>
        <li>${L('<b>Ters gerilim:</b> V<sub>RRM</sub> &gt; V+, 1,5–2× payla.', '<b>Reverse voltage:</b> V<sub>RRM</sub> &gt; V+, with 1.5–2× margin.')}</li>
        <li>${L('<b>Akım:</b> kapanma anında diyot bobin akımının <b>tamamını</b> taşır. Tepe = yük akımı. PWM’de ortalama ≈ (1 − D) × I.', '<b>Current:</b> at turn-off the diode carries the <b>entire</b> coil current. Peak = load current. Under PWM the average is ≈ (1 − D) × I.')}</li>
        <li>${L('<b>Hız:</b> açma–kapama rölesinde her diyot olur. PWM’de t<sub>rr</sub> her açılışta ek akım darbesi ve kayıp demektir: Schottky ya da ultrafast seç.', '<b>Speed:</b> any diode works for an on/off relay. Under PWM, t<sub>rr</sub> adds a current spike and loss at every turn-on: pick a Schottky or ultrafast.')}</li>
      </ul>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Diyot', 'Diode')}</th><th>${L('Tip', 'Type')}</th><th class="num">V<sub>RRM</sub></th><th class="num">I<sub>F(AV)</sub></th><th class="num">t<sub>rr</sub></th><th>${L('Kullanım', 'Use')}</th></tr></thead>
        <tbody>
          <tr><td>1N4148</td><td>${L('küçük sinyal, hızlı', 'small-signal, fast')}</td><td class="num">100 V</td><td class="num">150–200 mA</td><td class="num">4 ns</td><td>${L('Küçük röleler (≤ 100 mA bobin)', 'Small relays (≤ 100 mA coil)')}</td></tr>
          <tr><td>1N4007</td><td>${L('genel amaçlı, yavaş', 'general-purpose, slow')}</td><td class="num">1000 V</td><td class="num">1 A</td><td class="num">~2–30 µs</td><td>${L('Röle/solenoid, düşük frekans. PWM için <b>kötü</b>.', 'Relays/solenoids at low frequency. <b>Bad</b> for PWM.')}</td></tr>
          <tr><td>UF4007</td><td>ultrafast</td><td class="num">1000 V</td><td class="num">1 A</td><td class="num">75 ns</td><td>${L('Yüksek gerilimde PWM', 'PWM at higher voltage')}</td></tr>
          <tr><td>1N5819 / SS14</td><td>Schottky</td><td class="num">40 V</td><td class="num">1 A</td><td class="num">${L('≈ 0 (yok)', '≈ 0 (none)')}</td><td>${L('PWM ile motor/solenoid ≤ 1 A; V<sub>F</sub> ≈ 0,3–0,5 V', 'PWM motors/solenoids ≤ 1 A; V<sub>F</sub> ≈ 0.3–0.5 V')}</td></tr>
          <tr><td>SS34 / SS54</td><td>Schottky</td><td class="num">40 V</td><td class="num">3 A / 5 A</td><td class="num">${L('≈ 0', '≈ 0')}</td><td>${L('Daha büyük PWM yükleri. Sıcakta kaçak akım artar.', 'Bigger PWM loads. Leakage grows when hot.')}</td></tr>
        </tbody></table></div>

      <h2>${L('PWM ile sürülen endüktif yükler', 'PWM-driven inductive loads')}</h2>
      <p>${L('<b>PWM altında flyback diyodu her periyotta iletir.</b> MOSFET açıkken akım yükselir, kapalıyken diyot üzerinden azalır.', '<b>Under PWM the flyback diode conducts every period.</b> Current rises while the MOSFET is on and decays through the diode while it is off.')}</p>
      <ul>
        <li>${L('<b>Sürekli iletim (CCM):</b> τ = L/R periyottan çok uzun. Akım neredeyse sabit, ortalaması D·V/R.', '<b>Continuous (CCM):</b> τ = L/R is much longer than the period. Current is nearly constant and averages D·V/R.')}</li>
        <li>${L('<b>Kesintili iletim (DCM):</b> periyot τ’ya göre uzun. Akım her kapalı aralıkta sıfıra iner; yük titrer, solenoid vızıldar.', '<b>Discontinuous (DCM):</b> the period is long compared with τ. Current drops to zero each off interval; the load jitters and a solenoid buzzes.')}</li>
      </ul>
      ${App.lab('lab-pwm', L('PWM altında bobin akımı', 'Coil current under PWM'), {
        foot: L('İdeal anahtar, diyot V<sub>F</sub> = 0,7 V, kalıcı durum. Bakır: MOSFET akımı. Mavi: diyot akımı. Zıt-EMK yok (duran solenoid ya da kilitli motor).',
                'Ideal switch, diode V<sub>F</sub> = 0.7 V, steady state. Copper: MOSFET current. Blue: diode current. No back-EMF (a stationary solenoid or stalled motor).')
      })}

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <details class="fold"><summary>${L('24 V, 1,5 A, 50 mH solenoid: hangi diyot, ne kadar hızlı bırakır?', '24 V, 1.5 A, 50 mH solenoid: which diode, how fast does it release?')}</summary><div>
        <p>${L('Önce bobinin ne kadar enerji taşıdığını bul. Sonra bastırmasız, diyotlu ve zenerli durumları karşılaştır.', 'First find how much energy the coil holds. Then compare no clamp, a diode and a zener.')}</p>
        ${App.example({
          given: [['V+', '24 V'], ['I', L('1,5 A', '1.5 A')], ['L', '50 mH'], ['MOSFET', '60 V']],
          steps: [
            [L('Bobin direnci', 'Coil resistance'), L('24 V / 1,5 A', '24 V / 1.5 A'), '16 Ω'],
            [L('Zaman sabiti', 'Time constant'), '50 mH / 16 Ω', L('3,1 ms', '3.1 ms')],
            [L('Depolanan enerji', 'Stored energy'), L('½ · 0,05 · 1,5²', '½ · 0.05 · 1.5²'), '56 mJ']
          ],
          result: L('<b>56 mJ, bir röleden 1000 kat fazla.</b> Bu enerji her kapanışta bir yere gitmeli.', '<b>56 mJ, a thousand times a relay coil.</b> This energy must go somewhere at every turn-off.'),
          level: 'warn'
        })}
        <h3>${L('1. Bastırma yok', '1. No clamp')}</h3>
        ${App.example({
          steps: [
            [L('Avalanş gerilimi', 'Avalanche voltage'), L('1,2 · 60 V', '1.2 · 60 V'), '≈ 72 V'],
            [L('MOSFET’e giden enerji', 'Energy into the MOSFET'), '56 mJ · 72 / (72 − 24)', '84 mJ', L('Tipik TO-220 60 V MOSFET: E<sub>AS</sub> 100–300 mJ', 'Typical TO-220 60 V MOSFET: E<sub>AS</sub> 100–300 mJ')]
          ],
          result: L('<b>Bir kez dayanır, her kapanışta değil.</b> Bunu normal çalışma yapmak tasarım hatasıdır.', '<b>It survives once, not at every turn-off.</b> Making this normal operation is a design error.'),
          level: 'bad'
        })}
        <h3>${L('2. Sadece diyot', '2. Diode only')}</h3>
        ${App.example({
          steps: [
            [L('Drain tepe', 'Peak drain'), L('24 + 0,7', '24 + 0.7'), L('24,7 V', '24.7 V')],
            [L('Bırakma süresi', 'Release time'), L('3,1 ms · ln(1 + 24 / 0,7)', '3.1 ms · ln(1 + 24 / 0.7)'), '≈ 11 ms']
          ],
          result: L('<b>Güvenli ama yavaş.</b> Açma–kapama için 1N4007 yeter; PWM’de SS34 ya da 2 A+ ultrafast.', '<b>Safe but slow.</b> A 1N4007 is fine for on/off; under PWM use an SS34 or a 2 A+ ultrafast.'),
          level: 'ok'
        })}
        <h3>${L('3. Diyot + 33 V zener', '3. Diode + 33 V zener')}</h3>
        ${App.example({
          steps: [
            [L('Bırakma süresi', 'Release time'), L('3,1 ms · ln(1 + 24 / 33,7)', '3.1 ms · ln(1 + 24 / 33.7)'), L('≈ 1,7 ms', '≈ 1.7 ms'), L('Diyottan 6,5× hızlı', '6.5× faster than the diode alone')],
            [L('Drain tepe', 'Peak drain'), L('24 + 33 + 0,7', '24 + 33 + 0.7'), '≈ 58 V', L('60 V MOSFET için çok sınırda', 'Too close for a 60 V MOSFET')],
            [L('TVS ile en kötü durum', 'Worst case with a TVS'), L('24 + 53 + 0,7', '24 + 53 + 0.7'), '≈ 78 V', L('SMBJ33A: V<sub>BR</sub> ~37 V, V<sub>C</sub> ~53 V', 'SMBJ33A: V<sub>BR</sub> ~37 V, V<sub>C</sub> ~53 V')]
          ],
          result: L('<b>100 V MOSFET ve 600 W TVS (SMBJ33A) seç.</b> Zener 1,5 A tepeyi ve enerjinin çoğunu taşır; 500 mW’lık zener yetmez.', '<b>Pick a 100 V MOSFET and a 600 W TVS (SMBJ33A).</b> The zener carries the 1.5 A peak and most of the energy; a 500 mW zener will not do.'),
          level: 'warn'
        })}
        <p>${L('Deneyde dene: L = 50 mH, I = 1,5 A, V+ = 24 V; “diyot” ile “diyot + zener (33 V)” modlarını karşılaştır.', 'Try it in the lab: L = 50 mH, I = 1.5 A, V+ = 24 V; compare “diode” with “diode + zener (33 V)”.')}</p>
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const V = (v, d) => App.num(v, d == null ? 1 : d) + ' V';

    /* ---------------- Figure: V = L di/dt sweep ---------------- */
    {
      const fig = root.querySelector('#fig-ldi .lab-fig');
      const Lh = 0.01, I = 0.1;
      const p = new Viz.Plot(fig, {
        w: 600, h: 280, x: [1e-8, 1e-2], y: [0.01, 1e5], logX: true, logY: true,
        xLabel: L('akımın kesilme süresi t_f', 'current interruption time t_f'), yLabel: 'V = L·di/dt (V)',
        xFmt: v => App.si(v, 's', 1), yFmt: v => App.si(v, '', 1).trim()
      });
      p.rect('safe', 1e-8, 0.01, 1e-2, 12, 'ok');
      p.hline('v12', 12, 'sig'); p.text('v12T', 1.2e-8, 12, L('12 V besleme', '12 V supply'), 'sig', 'start', 0, -5);
      p.hline('v60', 60, 'bad'); p.text('v60T', 1.2e-8, 60, L('60 V MOSFET sınırı', '60 V MOSFET limit'), 'bad', 'start', 0, -5);
      p.line('l', [[1e-8, Lh * I / 1e-8], [1e-2, Lh * I / 1e-2]], 'cu');
      p.text('lT', 3e-4, Lh * I / 3e-4, 'V = L·I / t_f', 'cu', 'start', 6, -6);
      const show = tf => {
        const v = Lh * I / tf;
        p.dot('d', tf, v, v > 60 ? 'bad' : '', 6);
        p.vline('cur', tf, 'cu');
        p.text('big', 3e-6, 3e3 * 8, 't_f = ' + App.si(tf, 's', 2) + '  →  V = ' + App.si(v, 'V', 2), v > 60 ? 'bad big' : 'cu big', 'start');
      };
      if (App.reducedMotion) show(1e-6);
      else {
        let t = 0;
        App.onFrame(dt => {
          t = (t + dt) % 8;
          const u = t < 4 ? t / 4 : 1 - (t - 4) / 4; // ping-pong
          show(Math.pow(10, -2 - 6 * (u * u * (3 - 2 * u))));
        });
      }
    }

    /* ---------------- Main lab: turn-off spike ---------------- */
    {
      const lab = root.querySelector('#lab-fly');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 290, `
        <circle class="heat" id="fHeat" cx="290" cy="210" r="34"/>
        ${Sch.vcc(300, 30, '')}<text id="fVp" x="300" y="16" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.w([[300, 30], [300, 80]])}
        ${Sch.ind(300, 110, 0, L('bobin', 'coil'))}
        ${Sch.w([[300, 140], [300, 180]])}
        ${Sch.nmos(280, 210, 'Q1')}
        ${Sch.w([[300, 240], [300, 268]])}${Sch.gnd(300, 268)}
        ${Sch.box(60, 180, 110, 60, 'MCU', '')}${Sch.w([[170, 210], [250, 210]], 'sigw')}
        <text id="fG" x="115" y="172" class="sch-t sig" text-anchor="middle"></text>
        <g id="wTop">${Sch.dot(300, 50)}${Sch.w([[300, 50], [400, 50]])}</g>
        <g id="wBot">${Sch.dot(300, 170)}${Sch.w([[300, 170], [400, 170]])}</g>
        <g id="gD">${Sch.w([[400, 50], [400, 80]])}${Sch.diode(400, 110, 180, 'D')}${Sch.w([[400, 140], [400, 170]])}</g>
        <g id="gZ">${Sch.diode(400, 80, 0, '', 'zener')}${Sch.diode(400, 140, 180, '')}<text id="fZ" x="416" y="84" class="sch-t"></text><text x="416" y="144" class="sch-t">D</text></g>
        <g id="gT">${Sch.w([[400, 170], [400, 180]])}${Sch.diode(400, 210, 180, '', 'zener')}${Sch.w([[400, 240], [400, 268]])}${Sch.gnd(400, 268)}<text id="fT" x="416" y="214" class="sch-t"></text></g>
        <g id="gR">${Sch.res(400, 80, 0, 'R_s')}${Sch.cap(400, 140, 0, 'C_s')}</g>
        <text id="fVds" x="470" y="250" class="sch-t big"></text>
        <text id="fPh" x="20" y="284" class="sch-t"></text>
      `);
      const $ = id => svg.querySelector('#' + id);
      const fOn = new Viz.Flow(svg, 'M300,30V268', { spacing: 15 });
      const fLoop = new Viz.Flow(svg, 'M300,50V170H400V50H300', { spacing: 15 });
      const fTvs = new Viz.Flow(svg, 'M300,30V170H400V268', { spacing: 15 });
      const fAv = new Viz.Flow(svg, 'M300,30V268', { cls: 'flow bad', spacing: 11, speed: 150 });
      const pI = new Viz.Plot(fig, { w: 600, h: 170, x: [0, 1], y: [0, 1], xLabel: '', yLabel: 'I_L (A)', yFmt: v => App.si(v, '', 2).trim() });
      const pV = new Viz.Plot(fig, { w: 600, h: 200, x: [0, 1], y: [0, 1], xLabel: 't', yLabel: 'V_DS (V)', yFmt: v => App.num(v, 0) });

      const sMode = UI.segmented(ctl, {
        label: L('Bastırma', 'Clamp'), value: 'diode', onChange: update,
        options: [{ value: 'none', label: L('Yok', 'None') }, { value: 'diode', label: L('Diyot', 'Diode') }, { value: 'zener', label: L('Diyot+zener', 'Diode+zener') }, { value: 'tvs', label: 'TVS' }, { value: 'rc', label: 'RC' }]
      });
      const sL = UI.slider(ctl, { label: 'L', min: 1e-3, max: 500e-3, step: 1e-4, value: 50e-3, log: true, unit: 'H', onInput: update });
      const sI = UI.slider(ctl, { label: 'I', min: 0.05, max: 3, step: 0.01, value: 0.5, unit: 'A', onInput: update });
      const sV = UI.slider(ctl, { label: 'V+', min: 5, max: 48, step: 0.5, value: 24, fmt: v => V(v, 1), onInput: update });
      const sCl = UI.slider(ctl, { label: L('V<sub>Z</sub> / V<sub>cl</sub>', 'V<sub>Z</sub> / V<sub>cl</sub>'), min: 5, max: 90, step: 0.5, value: 33, fmt: v => V(v, 1), onInput: update });
      const sC = UI.slider(ctl, { label: 'C<sub>s</sub>', min: 10e-9, max: 20e-6, step: 1e-9, value: 1e-6, log: true, unit: 'F', onInput: update });
      const sR = UI.segmented(ctl, {
        label: L('MOSFET (örnek)', 'MOSFET (example)'), value: 60, onChange: update,
        options: [{ value: 30, label: '30 V' }, { value: 60, label: '60 V' }, { value: 100, label: '100 V' }]
      });
      const ro = UI.readouts(ctl, [
        { key: 'vpk', label: L('Tepe V<sub>DS</sub>', 'Peak V<sub>DS</sub>') },
        { key: 'td', label: L('Sönme süresi', 'Decay time') },
        { key: 'e', label: 'E = ½·L·I²' },
        { key: 'ec', label: L('Kelepçede/MOSFET’te enerji', 'Energy in clamp/MOSFET') },
        { key: 'v', label: L('Karar', 'Verdict') }
      ]);
      const EAS = { 30: 0.02, 60: 0.1, 100: 0.25 };
      const VF = 0.7;
      let sim = null;

      function simulate() {
        const mode = sMode.value, Lh = sL.value, I0 = sI.value, Vs = sV.value, R = Vs / I0, rating = sR.value;
        const VBR = 1.2 * rating, Vcl = sCl.value, C = sC.value, Rs = R;
        const tau = Lh / R;
        let win, tvsBad = false;
        const tdec = vc => tau * Math.log(1 + I0 * R / vc);
        if (mode === 'none') win = 1.3 * tdec(Math.max(0.5, VBR - Vs));
        else if (mode === 'diode') win = 1.3 * tdec(VF);
        else if (mode === 'zener') win = 1.3 * tdec(Vcl + VF);
        else if (mode === 'tvs') { tvsBad = Vcl <= Vs + 0.5; win = 1.3 * tdec(Math.max(0.5, Vcl - Vs)); }
        else {
          const w0 = 1 / Math.sqrt(Lh * C), a = (R + Rs) / (2 * Lh);
          if (a < w0) win = Math.max(Math.min(5 / a, 4 * 2 * Math.PI / Math.sqrt(w0 * w0 - a * a)), 1.2 * 2 * Math.PI / w0);
          else win = 5 / (a - Math.sqrt(a * a - w0 * w0));
        }
        const pre = 0.25 * win, N = 1200, dt = win / N, sub = 6, h = dt / sub;
        const pts = [[-pre, I0, 0.05], [0, I0, 0.05]];
        let i = I0, vC = -Vs, vpk = Vs, Eclamp = 0, tzero = null;
        for (let n = 1; n <= N; n++) {
          let vds = Vs;
          for (let s = 0; s < sub; s++) {
            if (mode === 'rc') {
              i = (i + h / Lh * (-vC)) / (1 + h * (R + Rs) / Lh);
              vC += h * i / C;
              vds = Vs + Rs * i + vC;
              Eclamp += Rs * i * i * h;
            } else if (i > 0) {
              let vcoil; // voltage pushing current (top minus bottom) during decay
              if (mode === 'none') { vds = VBR; vcoil = Vs - VBR; }
              else if (mode === 'diode') { vds = Vs + VF; vcoil = -VF; }
              else if (mode === 'zener') { vds = Vs + Vcl + VF; vcoil = -(Vcl + VF); }
              else { vds = tvsBad ? Vs : Vcl; vcoil = tvsBad ? 0 : Vs - Vcl; }
              i = (i + h / Lh * vcoil) / (1 + h * R / Lh);
              if (i <= 0) { i = 0; vds = Vs; }
              const pw = mode === 'none' || mode === 'tvs' ? vds * i : mode === 'zener' ? Vcl * i : VF * i;
              Eclamp += pw * h;
            } else vds = Vs;
          }
          if (tzero === null && mode !== 'rc' && i <= 0) tzero = n * dt;
          vpk = Math.max(vpk, vds);
          pts.push([n * dt, i, Math.max(vds, -0.7)]);
        }
        if (mode === 'rc') {
          // settling: last time |vds − Vs| > 5 % of peak excursion
          const ex = vpk - Vs; tzero = null;
          for (let k = pts.length - 1; k > 1; k--) if (Math.abs(pts[k][2] - Vs) > 0.05 * ex || Math.abs(pts[k][1]) > 0.05 * I0) { tzero = pts[k][0]; break; }
        }
        return { mode, Lh, I0, Vs, R, rating, VBR, Vcl, win, pre, pts, vpk, Eclamp, tzero, tvsBad, E: 0.5 * Lh * I0 * I0 };
      }

      function update() {
        const mode = sMode.value;
        ['wTop', 'wBot', 'gD', 'gZ', 'gT', 'gR'].forEach(id => { $(id).style.display = 'none'; });
        if (mode !== 'none') $('wBot').style.display = '';
        if (mode === 'diode' || mode === 'zener' || mode === 'rc') $('wTop').style.display = '';
        $({ diode: 'gD', zener: 'gZ', tvs: 'gT', rc: 'gR', none: 'wBot' }[mode]).style.display = mode === 'none' ? 'none' : '';
        sCl.el.style.display = mode === 'zener' || mode === 'tvs' ? '' : 'none';
        sC.el.style.display = mode === 'rc' ? '' : 'none';
        $('fZ').textContent = 'Z ' + V(sCl.value, 0);
        $('fT').textContent = 'TVS ' + V(sCl.value, 0);
        $('fVp').textContent = 'V+ = ' + V(sV.value);
        sim = simulate();
        const s = sim;
        const us = s.win < 2e-3, k = us ? 1e6 : 1e3, unit = us ? 'µs' : 'ms';
        const x0 = -s.pre * k, x1 = s.win * k;
        const ymaxV = Math.max(s.vpk * 1.15, s.Vs * 1.6, s.rating * 1.1);
        const iMin = Math.min(0, ...s.pts.map(q => q[1]));
        pI.setRange({ x: [x0, x1], y: [Math.min(0, iMin * 1.15), s.I0 * 1.2] });
        pV.o.xLabel = 't (' + unit + ')';
        pV.setRange({ x: [x0, x1], y: [Math.min(0, Math.min(...s.pts.map(q => q[2]))), ymaxV] });
        pI.rect('on', x0, Math.min(0, iMin * 1.15), 0, s.I0 * 1.2, 'sig');
        pV.rect('on', x0, Math.min(0, Math.min(...s.pts.map(q => q[2]))), 0, ymaxV, 'sig');
        pI.text('onT', x0, s.I0 * 1.2, L('MOSFET açık', 'MOSFET on'), 'sig', 'start', 4, 14);
        pI.line('i', s.pts.map(q => [q[0] * k, q[1]]), 'cu');
        pV.line('v', s.pts.map(q => [q[0] * k, q[2]]), s.vpk > s.rating ? 'bad' : 'sig');
        pV.hline('rat', s.rating, 'bad');
        pV.text('ratT', x1, s.rating, L('V_DS anma ', 'V_DS rating ') + s.rating + ' V', 'bad', 'end', 0, -5);
        pV.hline('vs', s.Vs, '');
        pV.text('vsT', x1, s.Vs, 'V+', 'muted', 'end', 0, 13);
        pV.text('pkT', 0, s.vpk, L('tepe ', 'peak ') + V(s.vpk), s.vpk > s.rating ? 'bad' : 'cu', 'start', 8, s.vpk > ymaxV * 0.9 ? 14 : -6);

        ro.set('vpk', V(s.vpk) + (s.mode === 'none' ? ' (' + L('avalanş', 'avalanche') + ')' : ''), s.vpk > s.rating ? 'bad' : s.vpk > 0.8 * s.rating ? 'warn' : 'ok');
        ro.set('td', s.tzero !== null ? App.si(s.tzero, 's') : '—');
        ro.set('e', App.si(s.E, 'J'));
        const where = { none: 'MOSFET', diode: L('diyot (+bobin R)', 'diode (+coil R)'), zener: 'zener', tvs: 'TVS', rc: 'R_s' }[s.mode];
        ro.set('ec', App.si(s.Eclamp, 'J') + ' → ' + where, s.mode === 'none' ? (s.Eclamp > EAS[s.rating] ? 'bad' : 'warn') : '');
        let vt, vs;
        if (s.tvsBad) { vt = L('TVS V+’dan düşük: sürekli iletir!', 'TVS below V+: it conducts permanently!'); vs = 'bad'; }
        else if (s.mode === 'none') {
          if (s.Eclamp > EAS[s.rating]) { vt = L('E > E_AS: MOSFET ölür', 'E > E_AS: MOSFET dies'); vs = 'bad'; }
          else { vt = L('Avalanşta (E < E_AS): bir kez dayanır, tasarım değil', 'Avalanches (E < E_AS): survives once, not a design'); vs = 'warn'; }
        } else if (s.vpk > s.rating) { vt = L('V_DS anma değerini aşıyor', 'Exceeds the V_DS rating'); vs = 'bad'; }
        else if (s.vpk > 0.8 * s.rating) { vt = L('Pay az (< %20)', 'Little margin (< 20 %)'); vs = 'warn'; }
        else { vt = L('Güvenli', 'Safe'); vs = 'ok'; }
        ro.set('v', vt, vs);
      }

      // playback: 0–0.8 s on, 0.8–3.4 s transient, 3.4–4.2 s hold
      const CYC = 4.2;
      const at = t => {
        const s = sim; if (!s) return null;
        let tt;
        if (t < 0.8) tt = -s.pre + s.pre * t / 0.8; else if (t < 3.4) tt = s.win * (t - 0.8) / 2.6; else tt = s.win;
        if (tt <= 0) return { tt, i: s.I0, vds: 0.05, on: true };
        const idx = Math.min(s.pts.length - 1, 2 + Math.round(tt / s.win * (s.pts.length - 3)));
        return { tt, i: s.pts[idx][1], vds: s.pts[idx][2], on: false };
      };
      const show = t => {
        const s = sim, q = at(t); if (!q) return;
        const k = s.win < 2e-3 ? 1e6 : 1e3;
        pI.vline('cur', q.tt * k, 'cu solid'); pV.vline('cur', q.tt * k, 'cu solid');
        pI.dot('d', q.tt * k, q.i, '', 4); pV.dot('d', q.tt * k, q.vds, q.vds > s.rating ? 'bad' : 'sig', 4);
        const r = Math.abs(q.i) / s.I0;
        fOn.rate = q.on ? 1.1 : 0;
        fLoop.rate = !q.on && (s.mode === 'diode' || s.mode === 'zener' || s.mode === 'rc') ? r * 1.4 : 0;
        fLoop.dir = q.i >= 0 ? 1 : -1;
        fTvs.rate = !q.on && s.mode === 'tvs' && !s.tvsBad ? r * 1.4 : 0;
        fAv.rate = !q.on && s.mode === 'none' && q.i > 0 ? 0.6 + r * 2 : 0;
        const avalanche = !q.on && ((s.mode === 'none' && q.i > 0) || q.vds > s.rating);
        $('fHeat').style.opacity = avalanche ? '0.8' : '0';
        $('fG').textContent = q.on ? 'GPIO HIGH' : 'GPIO LOW';
        $('fVds').textContent = 'V_DS = ' + V(q.vds);
        $('fVds').setAttribute('class', 'sch-t big ' + (q.vds > s.rating ? 'bad' : q.vds > s.Vs + 1 ? 'cu' : 'ok'));
        $('fPh').textContent = q.on ? L('MOSFET açık: bobin enerji depoluyor', 'MOSFET on: the coil stores energy')
          : Math.abs(q.i) > 0.002 * s.I0 ? L('MOSFET kapalı: bobin akımı sürdürüyor', 'MOSFET off: the coil keeps the current going') : L('akım söndü', 'current has died out');
        $('fPh').setAttribute('class', 'sch-t ' + (avalanche ? 'bad' : 'muted'));
      };
      update();
      if (App.reducedMotion) show(1.2);
      else { let t = 0; App.onFrame(dt => { t = (t + dt) % CYC; show(t); }); }
    }

    /* ---------------- Lab: PWM-driven coil ---------------- */
    {
      const lab = root.querySelector('#lab-pwm');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p = new Viz.Plot(fig, { w: 600, h: 300, x: [0, 3], y: [0, 1], xLabel: L('zaman (PWM periyodu)', 'time (PWM periods)'), yLabel: 'I_L (A)', xTicks: [0, 1, 2, 3], xFmt: v => App.num(v, 0), yFmt: v => App.si(v, '', 2).trim() });
      const sD = UI.slider(ctl, { label: 'Duty', min: 0.02, max: 0.98, step: 0.01, value: 0.5, fmt: v => App.num(v * 100, 0) + ' %', onInput: update });
      const sF = UI.slider(ctl, { label: 'f<sub>PWM</sub>', min: 10, max: 30000, step: 1, value: 1000, log: true, unit: 'Hz', onInput: update });
      const sL = UI.slider(ctl, { label: 'L', min: 1e-3, max: 200e-3, step: 1e-4, value: 20e-3, log: true, unit: 'H', onInput: update });
      const sR = UI.slider(ctl, { label: 'R', min: 2, max: 50, step: 0.5, value: 12, unit: 'Ω', onInput: update });
      const sV = UI.slider(ctl, { label: 'V+', min: 5, max: 24, step: 0.5, value: 12, fmt: v => V(v, 1), onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'tau', label: 'τ = L/R' }, { key: 'ratio', label: 'τ / T' },
        { key: 'avg', label: L('Ortalama akım', 'Average current') }, { key: 'rip', label: L('Dalgalanma (p-p)', 'Ripple (p-p)') },
        { key: 'mode', label: L('Mod', 'Mode') }, { key: 'dio', label: L('Diyot ort. / tepe', 'Diode avg / peak') }
      ]);
      const VF = 0.7;
      function update() {
        const D = sD.value, f = sF.value, Lh = sL.value, R = sR.value, Vs = sV.value;
        const T = 1 / f, ton = D * T, toff = T - ton, tau = Lh / R;
        const Iinf = Vs / R, Id = VF / R;
        const a = Math.exp(-ton / tau), b = Math.exp(-toff / tau);
        let i0 = (b * (Iinf * (1 - a) + Id) - Id) / (1 - a * b);
        let dcm = false;
        if (i0 < 0) { i0 = 0; dcm = true; }
        const i1 = Iinf + (i0 - Iinf) * a;
        const tz = dcm ? tau * Math.log(1 + i1 / Id) : toff;
        const iOn = t => Iinf + (i0 - Iinf) * Math.exp(-t / tau);
        const iOff = t => (t >= tz && dcm) ? 0 : Math.max(0, -Id + (i1 + Id) * Math.exp(-t / tau));
        const ymax = Math.max(i1 * 1.25, 0.01);
        p.setRange({ y: [0, ymax] });
        let all = [], avgSum = 0, dSum = 0;
        const n = 80;
        for (let c = 0; c < 3; c++) {
          const on = [], off = [];
          for (let k = 0; k <= n; k++) { const t = ton * k / n; on.push([c + t / T, iOn(t)]); }
          for (let k = 0; k <= n; k++) { const t = toff * k / n; off.push([c + (ton + t) / T, iOff(t)]); }
          p.rect('pw' + c, c, 0, c + D, ymax, 'sig');
          p.area('aOn' + c, on, 'cu', 0);
          p.area('aOff' + c, off, 'sig', 0);
          all = all.concat(on, off);
          if (c === 0) {
            for (let k = 0; k < n; k++) { avgSum += iOn(ton * (k + 0.5) / n) * ton / n; dSum += iOff(toff * (k + 0.5) / n) * toff / n; }
            avgSum += dSum;
          }
        }
        p.line('i', all, 'cu');
        const avg = avgSum / T, dAvg = dSum / T;
        p.hline('avg', avg, 'cu');
        p.text('avgT', 2.98, avg, L('ortalama ', 'average ') + App.si(avg, 'A'), 'cu', 'end', 0, -6);
        p.text('pwT', 0.02, ymax, 'PWM ON', 'muted', 'start', 2, 13);
        ro.set('tau', App.si(tau, 's'));
        ro.set('ratio', App.num(tau / T, tau / T < 10 ? 2 : 0), tau / T > 5 ? 'ok' : tau / T > 1 ? 'warn' : 'bad');
        ro.set('avg', App.si(avg, 'A') + ' (D·V/R = ' + App.si(D * Iinf, 'A') + ')');
        ro.set('rip', App.si(i1 - i0, 'A') + ' (' + App.num((i1 - i0) / Math.max(avg, 1e-9) * 100, 0) + ' %)', (i1 - i0) / avg > 0.5 ? 'warn' : 'ok');
        ro.set('mode', dcm ? L('Kesintili (DCM)', 'Discontinuous (DCM)') : L('Sürekli (CCM)', 'Continuous (CCM)'), dcm ? 'warn' : 'ok');
        ro.set('dio', App.si(dAvg, 'A') + ' / ' + App.si(i1, 'A'));
      }
      update();
    }
  }
});
