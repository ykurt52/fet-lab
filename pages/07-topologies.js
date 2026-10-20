/* 07 — Topologies: low-side, high-side P-MOS, high-side N-MOS (why the gate must go above the rail),
   half-bridge (shoot-through), H-bridge motor control, bootstrap supply, integrated bridge ICs */
App.page({
  id: 'topologies',
  num: '07',
  group: { tr: 'Sürme', en: 'Driving' },
  title: { tr: 'Low-side, high-side, yarım köprü, H-köprü', en: 'Low-side, high-side, half-bridge, H-bridge' },
  blurb: {
    tr: 'Anahtar yükün altında mı üstünde mi? Bootstrap, shoot-through ve motor yön kontrolü.',
    en: 'Switch below or above the load? Bootstrap, shoot-through and motor direction control.'
  },
  summary: {
    tr: 'Yükün altındaki MOSFET bir GPIO ile kolayca sürülür. Yükün üstündeyse gate’i rayın da üstüne çıkmalıdır. Beş yerleşimi karşılaştırıyor, H-köprü ile motor sürüyor ve bootstrap’ı hesaplıyoruz.',
    en: 'A MOSFET below the load is easy to drive from a GPIO. Above the load, its gate must go above the rail. We compare five arrangements, drive a motor with an H-bridge and size a bootstrap.'
  },
  render(L) {
    return `
      <style>
        [data-page="topologies"] .schem .wire.badw { stroke: var(--bad); }
        [data-page="topologies"] .topo-note { font-size: var(--fs-0); color: var(--ink-2); display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
        [data-page="topologies"] .topo-note b { display: block; font-family: var(--f-mono); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
        [data-page="topologies"] .topo-note .pro b { color: var(--ok); }
        [data-page="topologies"] .topo-note .con b { color: var(--bad); }
        [data-page="topologies"] .btn-row { display: flex; flex-wrap: wrap; gap: 6px; }
        [data-page="topologies"] .btn-row .btn { padding: 6px 10px; font-size: .82rem; }
        [data-page="topologies"] .tgl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        [data-page="topologies"] .status { margin: 0; }
        @media (max-width: 520px) { [data-page="topologies"] .topo-note { grid-template-columns: 1fr; } }
      </style>

      ${App.keys([
        L('<b>Low-side</b>: LED şerit, fan, röle, kutu içi yükler. GPIO N-MOS’u doğrudan sürer.', '<b>Low-side</b>: LED strips, fans, relays, loads inside a box. A GPIO drives the N-MOS directly.'),
        L('<b>High-side</b>: araç yükleri, 24 V PLC çıkışı, sensör beslemesi. Yük toprakta kalır.', '<b>High-side</b>: vehicle loads, 24 V PLC outputs, sensor rails. The load stays grounded.'),
        L('Kablo şasiye değebiliyorsa high-side seç: kısa devre sigortayı attırır, yükü açmaz.', 'If the wire can touch chassis, go high-side: a short then blows the fuse instead of switching the load on.'),
        L('High-side N-MOS’ta gate, rayın ~10 V üstüne çıkmalı: bootstrap, charge pump ya da sürücü IC.', 'A high-side N-MOS gate must sit ~10 V above the rail: bootstrap, charge pump or driver IC.'),
        L('Aynı bacakta iki MOSFET asla birlikte açılmaz. Dead-time ve donanım kilidi kullan.', 'Never turn on both MOSFETs of one leg. Use dead-time and a hardware interlock.')
      ])}

      <h2>${L('Anahtarı nereye koyuyoruz?', 'Where does the switch go?')}</h2>
      <p>${L('Bir yükü anahtarlamanın iki temel yolu vardır:', 'There are two basic places for the switch:')}</p>
      <ul>
        <li>${L('<b>Low-side</b>: anahtar yük ile toprak arasında.', '<b>Low-side</b>: between the load and ground.')}</li>
        <li>${L('<b>High-side</b>: anahtar besleme ile yük arasında.', '<b>High-side</b>: between the supply and the load.')}</li>
        <li>${L('<b>Yarım köprü</b>: bir high-side ve bir low-side üst üste.', '<b>Half-bridge</b>: a high-side stacked on a low-side.')}</li>
        <li>${L('<b>H-köprü</b>: iki yarım köprü yan yana. Akım iki yönde akabilir.', '<b>H-bridge</b>: two half-bridges side by side. Current can flow both ways.')}</li>
      </ul>
      <p>${L('Asıl fark gate sürmededir. N-MOS’u açan V<sub>GS</sub>, yani gate’in <b>source’a göre</b> gerilimidir.', 'The real difference is the gate drive. An N-MOS turns on by V<sub>GS</sub>, the gate voltage <b>relative to its source</b>.')}</p>
      <ul>
        <li>${L('Low-side’da source topraktadır. GPIO’nun 3,3 V’u doğrudan V<sub>GS</sub> olur.', 'In low-side the source is at ground. The GPIO’s 3.3 V is V<sub>GS</sub> directly.')}</li>
        <li>${L('High-side’da source yükün üstündedir. MOSFET açıldıkça besleme gerilimine yükselir.', 'In high-side the source sits on top of the load. It rises to the supply as the MOSFET turns on.')}</li>
      </ul>

      ${App.lab('lab-topo', L('Beş topoloji, tek şema', 'Five topologies, one schematic'), {
        foot: L('Bakır: yük akımı. Mavi: gate/base akımı. Kırmızı: shoot-through. High-side N-MOS: 12 V, 4 Ω yük, V<sub>th</sub> = 3 V, k = 20 A/V². Gate rampası yavaşlatıldı; H-köprü hız ve akımı normalize.',
                'Copper: load current. Blue: gate/base current. Red: shoot-through. High-side N-MOS: 12 V, 4 Ω load, V<sub>th</sub> = 3 V, k = 20 A/V². Gate ramp slowed down; H-bridge speed and current normalized.')
      })}

      <h2>${L('Low-side mı high-side mı? Nerede, neden?', 'Low-side or high-side? Where and why?')}</h2>
      <p>${L('Seçimi sürme kolaylığı değil, <b>sistem</b> belirler. Şu sorulara bak:', 'The <b>system</b> decides, not how easy the drive is. Ask these questions:')}</p>
      <ul>
        <li>${L('Yükün diğer ucu nereye bağlı? Şasiye bağlıysa tek seçenek high-side.', 'Where is the load’s other end? If it is on chassis, only high-side works.')}</li>
        <li>${L('Kablo uzun mu, şasiye sürtünebilir mi? Öyleyse high-side daha güvenli.', 'Is the wire long, can it chafe on chassis? Then high-side is safer.')}</li>
        <li>${L('Yük, kontrol kartıyla toprağı paylaşıyor mu? Öyleyse low-side toprak kayması yaratır.', 'Does the load share ground with the controller? Then low-side causes ground shift.')}</li>
      </ul>
      <p>${L('Kutu içindeki bir LED şerit için low-side neredeyse her zaman doğrudur. Araç lambası, 24 V PLC çıkışı ya da uzak sensör beslemesi high-side ister.', 'For an LED strip inside a box, low-side is almost always right. A vehicle lamp, a 24 V PLC output or a remote sensor supply needs high-side.')}</p>
      <div class="two">
        <div class="card"><h4>Low-side</h4>
          <p><span class="pill ok">${L('artı', 'pro')}</span></p>
          <ul>
            <li>${L('N-MOS doğrudan GPIO’dan sürülür.', 'N-MOS driven straight from a GPIO.')}</li>
            <li>${L('Ucuz, düşük R<sub>DS(on)</sub>.', 'Cheap, low R<sub>DS(on)</sub>.')}</li>
            <li>${L('Akım ölçümü: toprak tarafında şönt + basit op-amp.', 'Current sensing: ground-side shunt + simple op-amp.')}</li>
          </ul>
          <p><span class="pill bad">${L('eksi', 'con')}</span></p>
          <ul>
            <li>${L('Kapalıyken yükün alt ucu V+’da yüzer.', 'When off, the load’s low end floats at V+.')}</li>
            <li>${L('Kablo şasiye değerse yük <b>kalıcı olarak açılır</b>. Sigorta atmaz.', 'A wire short to chassis turns the load <b>on for good</b>. No fuse blows.')}</li>
            <li>${L('Yük akımı kartın toprağından döner: <b>toprak kayması</b>.', 'Load current returns through the board ground: <b>ground shift</b>.')}</li>
          </ul>
          <p class="muted small">${L('Kullanım: LED şerit, fan, röle, kutu içi solenoid, H-köprünün alt anahtarları.', 'Used for: LED strips, fans, relays, solenoids inside an enclosure, the bottom switches of an H-bridge.')}</p></div>
        <div class="card"><h4>High-side</h4>
          <p><span class="pill ok">${L('artı', 'pro')}</span></p>
          <ul>
            <li>${L('Kapalıyken yük ve kablo 0 V’ta: güvenli, korozyon az.', 'When off, load and wire sit at 0 V: safe, less corrosion.')}</li>
            <li>${L('Şasiye kısa devre sigortayı attırır. Yük kendiliğinden açılmaz.', 'A short to chassis blows the fuse. The load never turns itself on.')}</li>
            <li>${L('Yük akımı yerel şasiden döner, kart toprağını kirletmez.', 'Load current returns via local chassis, not the board ground.')}</li>
          </ul>
          <p><span class="pill bad">${L('eksi', 'con')}</span></p>
          <ul>
            <li>${L('Sürmesi zor: P-MOS + seviye kaydırıcı, N-MOS + bootstrap ya da akıllı anahtar (BTS, VN, TPS1H).', 'Harder to drive: P-MOS + level shifter, N-MOS + bootstrap, or a smart switch (BTS, VN, TPS1H).')}</li>
            <li>${L('Akım ölçümü high-side yükselteç ister (INA180, INA240).', 'Current sensing needs a high-side amplifier (INA180, INA240).')}</li>
          </ul>
          <p class="muted small">${L('Kullanım: otomotiv yükleri, 24 V PLC “PNP” çıkışları, sensör rayları, güç dağıtımı.', 'Used for: automotive loads, 24 V PLC “PNP” outputs, sensor rails, power distribution.')}</p></div>
      </div>
      ${App.lab('lab-short', L('Arıza simülatörü: kablo şasiye kısa devre', 'Fault simulator: wire shorted to chassis'), {
        foot: L('Yük 12 V / 6 Ω = 2 A, sigorta 5 A. Kısa devre, anahtar ile yük arasındaki kabloda. High-side kısa devre akımı yüzlerce amperdir; sigorta hızla açar. Zaman ekseni temsilîdir.',
                'Load 12 V / 6 Ω = 2 A, fuse 5 A. The short is on the wire between switch and load. The high-side fault current is hundreds of amps; the fuse opens fast. Time base is illustrative.')
      })}
      ${App.lab('lab-gshift', L('Toprak kayması: ortak dönüş kablosu', 'Ground shift: a shared return wire'), {
        foot: L('Kart, R<sub>ret</sub> dirençli tek bir kabloyla beslemeye döner. Low-side’da yük akımı da bu kablodan döner. High-side’da yük akımı şasiden döner; kabloda yalnız kartın ~50 mA’i kalır. PWM yavaşlatıldı.',
                'The board returns to the supply through one wire of resistance R<sub>ret</sub>. In low-side the load current returns through it too. In high-side it returns via chassis; only the board’s ~50 mA stays in the wire. PWM slowed down.')
      })}
      <div class="call info"><strong>${L('Sürme karmaşıklığı', 'Drive complexity')}</strong>
        ${L('Gate rayın üstüne çıkmazsa high-side N-MOS bir source follower olur. P-MOS kolaydır ama R<sub>DS(on)</sub>’u yüksek ve yavaştır. Birkaç amperlik araç/PLC yükleri için en temiz çözüm akıllı high-side anahtardır.',
            'Unless the gate goes above the rail, a high-side N-MOS becomes a source follower. A P-MOS is easy but has higher R<sub>DS(on)</sub> and is slower. For automotive/PLC loads of a few amps, a smart high-side switch is the cleanest choice.')}</div>

      <h2>${L('High-side N-MOS: gate neden rayın üstüne çıkmalı?', 'High-side N-MOS: why must the gate go above the rail?')}</h2>
      <p>${L('<b>Gate’i 12 V’la süren 12 V high-side N-MOS tam açılmaz.</b> Source yükseldikçe V<sub>GS</sub> eşiğe kadar küçülür ve orada takılır.', '<b>A 12 V high-side N-MOS with its gate at 12 V never fully turns on.</b> As the source rises, V<sub>GS</sub> shrinks to threshold and stalls there.')}</p>
      <p>${L('Deneyde “High-side N” seç, gate kaynağını 12 V yap ve MOSFET’i aç:', 'In the lab, pick “High-side N”, set the gate supply to 12 V and switch it on:')}</p>
      ${App.example({
        given: [['V+', '12 V'], ['V<sub>G</sub>', '12 V'], [L('Yük', 'Load'), '4 Ω'], ['V<sub>th</sub>', '3 V']],
        steps: [
          [L('Source dengede', 'Source settles at'), L('V<sub>GS</sub> eşiğin hemen üstünde kalır', 'V<sub>GS</sub> stays just above threshold'), L('≈ 8,5 V', '≈ 8.5 V')],
          ['V<sub>GS</sub>', L('12 − 8,5', '12 − 8.5'), L('3,5 V', '3.5 V')],
          [L('Yük akımı', 'Load current'), L('8,5 V / 4 Ω', '8.5 V / 4 Ω'), L('2,1 A', '2.1 A')],
          [L('MOSFET kaybı', 'MOSFET loss'), L('3,5 V · 2,1 A', '3.5 V · 2.1 A'), '≈ 7 W']
        ],
        result: L('<b>Bu bir anahtar değil, bir source follower.</b> Yük 12 V yerine 8,5 V görür, MOSFET 7 W ısıtır.', '<b>This is not a switch but a source follower.</b> The load gets 8.5 V instead of 12 V and the MOSFET burns 7 W.'),
        level: 'bad'
      })}
      <div class="eq"><b>V<sub>G</sub> ≥ V+ + V<sub>GS(on)</sub></b> &nbsp;&nbsp; ${L('örnek', 'e.g.')}: 12 V + 10 V = 22 V
        <span class="note">${L('Gate gerilimi source’a göre üretilmeli: source 0 V ile V+ arasında gezerken gate hep “source + 10 V”ta kalmalı. V<sub>GS(max)</sub>’ı aşma.', 'Generate the gate voltage relative to the source: as the source swings from 0 V to V+, the gate stays at “source + 10 V”. Do not exceed V<sub>GS(max)</sub>.')}</span></div>
      <p>${L('Rayın üstünde gate gerilimi üretmenin dört yolu:', 'Four ways to make a gate voltage above the rail:')}</p>
      <div class="cards">
        <div class="card"><h4>Bootstrap</h4><p>${L('Low-side açıkken bir kondansatör dolar, high-side açılınca source ile birlikte yükselir. Ucuz ve yaygın. %100 duty olmaz.', 'A capacitor charges while the low-side is on, then rides up with the source. Cheap and common. No 100 % duty.')}</p></div>
        <div class="card"><h4>${L('Charge pump', 'Charge pump')}</h4><p>${L('Osilatör + diyot–kondansatör merdiveni rayın üstünde sürekli gerilim üretir. %100 duty olur, akımı düşüktür. Akıllı anahtarların içinde bulunur.', 'An oscillator and diode–capacitor ladder make a steady voltage above the rail. 100 % duty works; current is low. Built into smart switches.')}</p></div>
        <div class="card"><h4>${L('İzole besleme', 'Isolated supply')}</h4><p>${L('Küçük izole DC–DC + izole gate sürücü. Her duty ve frekansta çalışır. Yüksek gerilimde standart, pahalı.', 'A small isolated DC–DC plus an isolated gate driver. Works at any duty and frequency. Standard at high voltage, expensive.')}</p></div>
        <div class="card"><h4>${L('High-side sürücü IC', 'High-side driver IC')}</h4><p>${L('IR2104, IR2110, LM5106, UCC27211: bootstrap, seviye kaydırma ve dead-time tek pakette. Ayrıntı Bölüm 10’da.', 'IR2104, IR2110, LM5106, UCC27211: bootstrap, level shifting and dead-time in one package. Details in chapter 10.')}</p></div>
      </div>

      <h2>${L('Yarım köprü ve shoot-through', 'Half-bridge and shoot-through')}</h2>
      <p>${L('<b>Aynı bacaktaki iki MOSFET asla aynı anda açık olmamalı.</b> Olursa besleme iki R<sub>DS(on)</sub> üzerinden toprağa kısa devre olur. Buna <b>shoot-through</b> denir.', '<b>The two MOSFETs of one leg must never be on together.</b> If they are, the supply shorts to ground through two R<sub>DS(on)</sub>. This is <b>shoot-through</b>.')}</p>
      ${App.example({
        given: [['V+', '12 V'], ['R<sub>DS(on)</sub>', '10 mΩ']],
        steps: [
          [L('Kısa devre akımı', 'Short-circuit current'), L('12 V / (2 · 0,01 Ω)', '12 V / (2 · 0.01 Ω)'), '600 A']
        ],
        result: L('<b>MOSFET’ler mikrosaniyeler içinde ölür.</b>', '<b>The MOSFETs die within microseconds.</b>'),
        level: 'bad'
      })}
      <p>${L('Yazılım hatası kadar geç kapanan gate de buna yol açar. Bu yüzden bir MOSFET kapanıp diğeri açılmadan önce <b>dead-time</b> beklenir: tipik 100 ns – 1 µs. Bu sürede endüktif akım body diyodundan geçer.', 'Slow gate turn-off causes it as much as software bugs. So a <b>dead-time</b> is inserted between one MOSFET turning off and the other turning on: typically 100 ns – 1 µs. During it, inductive current flows through a body diode.')}</p>
      <div class="call bad"><strong>${L('Köprüyü iki ayrı GPIO ile sürme', 'Do not drive a bridge from two independent GPIOs')}</strong>
        ${L('Reset sırasında pinler belirsizdir. Firmware güncellemesinde ya da breakpoint’te donabilirler. Donanım kilitli sürücü IC, donanım dead-time’lı tamamlayıcı PWM ya da EN/PH girişli köprü IC kullan.',
            'Pins are undefined during reset. They can freeze during a firmware update or a breakpoint. Use a driver IC with hardware interlock, complementary PWM with hardware dead-time, or a bridge IC with EN/PH inputs.')}</div>

      <h2>${L('H-köprü: motor yön kontrolü', 'H-bridge: motor direction control')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Mod', 'Mode')}</th><th>Q1 (${L('sol üst', 'top left')})</th><th>Q2 (${L('sol alt', 'bottom left')})</th><th>Q3 (${L('sağ üst', 'top right')})</th><th>Q4 (${L('sağ alt', 'bottom right')})</th><th>${L('Motor', 'Motor')}</th></tr></thead>
        <tbody>
          <tr><td><span class="pill ok">${L('İleri', 'Forward')}</span></td><td>ON</td><td>off</td><td>off</td><td>ON</td><td>${L('+V+ uygulanır', '+V+ applied')}</td></tr>
          <tr><td><span class="pill ok">${L('Geri', 'Reverse')}</span></td><td>off</td><td>ON</td><td>ON</td><td>off</td><td>${L('−V+ uygulanır', '−V+ applied')}</td></tr>
          <tr><td><span class="pill cu">${L('Fren', 'Brake')}</span></td><td>off</td><td>ON</td><td>off</td><td>ON</td><td>${L('Uçlar kısa devre: zıt-EMK motoru hızla durdurur', 'Terminals shorted: back-EMF stops the motor quickly')}</td></tr>
          <tr><td><span class="pill">${L('Serbest (coast)', 'Coast')}</span></td><td>off</td><td>off</td><td>off</td><td>off</td><td>${L('Akım body diyotlarından söner, motor yavaşça durur', 'Current dies out through body diodes, motor slows gradually')}</td></tr>
          <tr><td><span class="pill bad">${L('YASAK', 'ILLEGAL')}</span></td><td colspan="4">${L('Q1+Q2 ya da Q3+Q4 aynı anda ON (aynı bacak)', 'Q1+Q2 or Q3+Q4 on together (same leg)')}</td><td>${L('Shoot-through!', 'Shoot-through!')}</td></tr>
        </tbody></table></div>
      <p>${L('PWM ile hız kontrolünde bir köşegen anahtar sabit açık kalır, diğeri PWM ile sürülür. PWM kapalıyken akımın döndüğü yol motor davranışını değiştirir:', 'For PWM speed control, one diagonal switch stays on and the other is PWM-ed. The path the current takes during the off time changes the motor’s behaviour:')}</p>
      <ul>
        <li>${L('<b>Slow decay</b>: akım fren yolundan döner.', '<b>Slow decay</b>: current circulates through the brake path.')}</li>
        <li>${L('<b>Fast decay</b>: akım beslemeye geri döner.', '<b>Fast decay</b>: current returns to the supply.')}</li>
      </ul>
      <p>${L('Endüktif yüklerin davranışı Bölüm 08’de.', 'Inductive behaviour is covered in chapter 08.')}</p>

      <h2>${L('Ne zaman hangisi?', 'When to use which?')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Topoloji', 'Topology')}</th><th>${L('Sürme', 'Drive')}</th><th>${L('Artı', 'Pro')}</th><th>${L('Eksi', 'Con')}</th><th>${L('Tipik kullanım', 'Typical use')}</th></tr></thead>
        <tbody>
          <tr><td>Low-side N-MOS</td><td>${L('GPIO doğrudan', 'GPIO directly')}</td><td>${L('En basit, en ucuz, en düşük R<sub>DS(on)</sub>', 'Simplest, cheapest, lowest R<sub>DS(on)</sub>')}</td><td>${L('Yük toprağa bağlı değil; yük kapalıyken alt ucu V+’da', 'Load not grounded; its low end sits at V+ when off')}</td><td>${L('LED şerit, röle, fan, solenoid', 'LED strips, relays, fans, solenoids')}</td></tr>
          <tr><td>High-side P-MOS</td><td>${L('NPN/N-MOS + pull-up', 'NPN/N-MOS + pull-up')}</td><td>${L('Yük topraklı; %100 duty; basit', 'Grounded load; 100 % duty; simple')}</td><td>${L('P-MOS’un R<sub>DS(on)</sub>’u ~2–3× yüksek; yavaş kapanma', 'P-MOS R<sub>DS(on)</sub> ~2–3× higher; slow turn-off')}</td><td>${L('Güç yolu açma/kapama, sensör beslemesi, ters polarite', 'Power rail switching, sensor power, reverse polarity')}</td></tr>
          <tr><td>High-side N-MOS</td><td>${L('Bootstrap / charge pump / sürücü IC', 'Bootstrap / charge pump / driver IC')}</td><td>${L('Düşük R<sub>DS(on)</sub>, hızlı', 'Low R<sub>DS(on)</sub>, fast')}</td><td>${L('Gate’i rayın üstüne çıkarmak gerekir', 'Gate must go above the rail')}</td><td>${L('Otomotiv yükleri, yüksek akım, akıllı anahtarlar', 'Automotive loads, high current, smart switches')}</td></tr>
          <tr><td>${L('Yarım köprü', 'Half-bridge')}</td><td>${L('Sürücü IC + dead-time', 'Driver IC + dead-time')}</td><td>${L('Çıkışı hem V+’ya hem toprağa aktif çeker', 'Actively drives output to both V+ and ground')}</td><td>${L('Shoot-through riski', 'Shoot-through risk')}</td><td>${L('Buck/boost, BLDC fazı, sınıf-D', 'Buck/boost, BLDC phase, class-D')}</td></tr>
          <tr><td>${L('H-köprü', 'H-bridge')}</td><td>${L('İki yarım köprü ya da hazır IC', 'Two half-bridges or a ready-made IC')}</td><td>${L('İki yönlü akım, fren', 'Bidirectional current, braking')}</td><td>${L('Dört anahtar, iki bacakta shoot-through riski', 'Four switches, shoot-through risk on both legs')}</td><td>${L('DC motor, step motor sargısı, TEC', 'DC motors, stepper windings, TECs')}</td></tr>
        </tbody></table></div>

      <h2>${L('Bootstrap: kondansatörle gate beslemesi', 'Bootstrap: a gate supply from a capacitor')}</h2>
      <p>${L('<b>Bootstrap, high-side gate’i için ucuz bir yüzen besleme üretir.</b> Çalışması iki adımdır:', '<b>A bootstrap makes a cheap floating supply for the high-side gate.</b> It works in two steps:')}</p>
      <ol>
        <li>${L('<b>Şarj</b>: low-side açıkken SW toprağa yakındır. C<sub>boot</sub>, V<sub>DD</sub>’den bir diyot üzerinden dolar.', '<b>Charge</b>: while the low-side is on, SW is near ground. C<sub>boot</sub> charges from V<sub>DD</sub> through a diode.')}</li>
        <li>${L('<b>Kaldırma</b>: high-side açılınca SW, V+’ya çıkar. Kondansatör de onunla yükselir; diyot ters kutuplanıp V<sub>DD</sub>’yi korur.', '<b>Lift</b>: when the high-side turns on, SW rises to V+. The capacitor rides up with it; the diode reverse-biases and protects V<sub>DD</sub>.')}</li>
      </ol>
      ${App.example({
        given: [['V+', '48 V'], ['V<sub>DD</sub>', '12 V'], ['V<sub>F</sub>', L('0,7 V', '0.7 V')]],
        steps: [
          [L('C<sub>boot</sub> gerilimi', 'C<sub>boot</sub> voltage'), L('12 − 0,7', '12 − 0.7'), L('11,3 V', '11.3 V')],
          [L('HS açıkken V<sub>B</sub>', 'V<sub>B</sub> with HS on'), L('48 + 11,3', '48 + 11.3'), L('59,3 V', '59.3 V')],
          [L('HS gate’inde V<sub>GS</sub>', 'HS gate V<sub>GS</sub>'), 'V<sub>B</sub> − V<sub>SW</sub>', L('11,3 V', '11.3 V')]
        ],
        result: L('<b>High-side tam açılır.</b> Gate, rayın 11,3 V üstüne çıkar.', '<b>The high-side turns fully on.</b> Its gate goes 11.3 V above the rail.'),
        level: 'ok'
      })}
      ${App.figure('fig-boot', L('Bootstrap döngüsü: şarj (LS açık) ve kaldırma (HS açık)', 'The bootstrap cycle: charge (LS on) and lift (HS on)'), {
        foot: L('V+ = 48 V, V<sub>DD</sub> = 12 V, V<sub>F</sub> = 0,7 V. Her HS açılışı C<sub>boot</sub>’u biraz boşaltır (abartılı gösterildi); LS açıkken tazelenir.',
                'V+ = 48 V, V<sub>DD</sub> = 12 V, V<sub>F</sub> = 0.7 V. Each HS turn-on drains C<sub>boot</sub> a little (exaggerated here); it refills while LS is on.')
      })}
      <div class="eq"><b>C<sub>boot</sub> ≥ (Q<sub>g</sub> + I<sub>q</sub>·t<sub>on(max)</sub>) / ΔV<sub>max</sub></b> &nbsp;&nbsp; ${L('pratikte', 'in practice')} ×3…10
        <span class="note">${L('ΔV<sub>max</sub>: kabul edilen sarkma (ör. 0,5 V). I<sub>q</sub>: sürücü akımı + gate–source direnci + diyot kaçağı. LS her periyotta açılmalı: <b>duty &lt; %100</b>.',
                       'ΔV<sub>max</sub>: the droop you accept (e.g. 0.5 V). I<sub>q</sub>: driver current + gate–source resistor + diode leakage. LS must turn on every period: <b>duty &lt; 100 %</b>.')}</span></div>
      ${App.lab('lab-boot', L('Bootstrap kondansatörü hesabı', 'Sizing the bootstrap capacitor'), {
        foot: L('Model: V<sub>DD</sub> = 12 V, V<sub>F</sub> = 0,7 V, şarj yolu 10 Ω, UVLO = 8 V. Q<sub>g</sub> açılışta, I<sub>q</sub> açık süre boyunca çekilir. Kapalı sürede τ = 10 Ω·C<sub>boot</sub> ile tazelenir.',
                'Model: V<sub>DD</sub> = 12 V, V<sub>F</sub> = 0.7 V, charge path 10 Ω, UVLO = 8 V. Q<sub>g</sub> is drawn at turn-on, I<sub>q</sub> during the on time. It recharges with τ = 10 Ω·C<sub>boot</sub> during the off time.')
      })}

      <h2>${L('Hazır köprü entegreleri', 'Integrated bridge ICs')}</h2>
      <p>${L('<b>Birkaç ampere kadar hazır köprü IC’si daha güvenlidir.</b> Dead-time, shoot-through kilidi, aşırı akım, aşırı sıcaklık ve UVLO içeride çözülmüştür.', '<b>Up to a few amps, a ready-made bridge IC is safer.</b> Dead-time, shoot-through interlock, overcurrent, over-temperature and UVLO are handled inside.')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>IC</th><th>${L('Yapı', 'Structure')}</th><th class="num">V<sub>M</sub></th><th class="num">${L('Akım', 'Current')}</th><th>${L('Not', 'Note')}</th></tr></thead>
        <tbody>
          <tr><td>DRV8871</td><td>${L('1× H-köprü, MOSFET', '1× H-bridge, MOSFET')}</td><td class="num">6,5–45 V</td><td class="num">3,6 A ${L('tepe', 'peak')}</td><td>${L('R<sub>DS(on)</sub> (HS+LS) ≈ 565 mΩ, dahili akım regülasyonu, 2 PWM girişi', 'R<sub>DS(on)</sub> (HS+LS) ≈ 565 mΩ, built-in current regulation, 2 PWM inputs')}</td></tr>
          <tr><td>DRV8833</td><td>${L('2× H-köprü, MOSFET', '2× H-bridge, MOSFET')}</td><td class="num">2,7–10,8 V</td><td class="num">1,5 A rms</td><td>${L('Pil ile çalışan küçük robotlar için', 'For small battery-powered robots')}</td></tr>
          <tr><td>TB6612FNG</td><td>${L('2× H-köprü, MOSFET', '2× H-bridge, MOSFET')}</td><td class="num">4,5–13,5 V</td><td class="num">1,2 A ${L('ort.', 'avg')} / 3,2 A ${L('tepe', 'peak')}</td><td>${L('IN1/IN2/PWM girişleri, düşük düşüm; L298 yerine iyi bir seçim', 'IN1/IN2/PWM inputs, low drop; a good L298 replacement')}</td></tr>
          <tr><td>BTS7960 (×2)</td><td>${L('Yarım köprü, MOSFET', 'Half-bridge, MOSFET')}</td><td class="num">5,5–27 V</td><td class="num">${L('~40 A tepe', '~40 A peak')}</td><td>${L('İki tane = büyük DC motor için H-köprü; dahili charge pump', 'Two of them = an H-bridge for big DC motors; internal charge pump')}</td></tr>
          <tr><td>L298N</td><td>${L('2× H-köprü, <b>bipolar</b>', '2× H-bridge, <b>bipolar</b>')}</td><td class="num">${L('≤ 46 V', '≤ 46 V')}</td><td class="num">2 A</td><td><span class="pill bad">${L('eski', 'old')}</span> ${L('1 A’de ~2–4 V düşüm: 12 V motor ~9 V görür, çip ısınır. Harici flyback diyotları gerekir.', '~2–4 V drop at 1 A: a 12 V motor sees ~9 V and the chip runs hot. Needs external flyback diodes.')}</td></tr>
        </tbody></table></div>

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <details class="fold"><summary>${L('48 V yarım köprü, Q<sub>g</sub> = 60 nC, 20 kHz, %95 duty: hangi C<sub>boot</sub> ve diyot?', '48 V half-bridge, Q<sub>g</sub> = 60 nC, 20 kHz, 95 % duty: which C<sub>boot</sub> and diode?')}</summary><div>
        <p>${L('Kondansatör en uzun açık sürede yeterince dolu kalmalı ve kısa kapalı sürede tazelenmeli.', 'The capacitor must stay charged through the longest on-time and refill in the short off-time.')}</p>
        ${App.example({
          given: [['V+', '48 V'], ['Q<sub>g</sub>', '60 nC'], ['f', '20 kHz'], ['D<sub>max</sub>', L('%95', '95 %')], ['I<sub>q</sub>', '150 µA'], ['ΔV<sub>max</sub>', L('0,5 V', '0.5 V')]],
          steps: [
            [L('En uzun açık süre', 'Longest on-time'), L('0,95 / 20 kHz', '0.95 / 20 kHz'), L('47,5 µs', '47.5 µs')],
            [L('En kısa kapalı süre', 'Shortest off-time'), L('50 µs − 47,5 µs', '50 µs − 47.5 µs'), L('2,5 µs', '2.5 µs')],
            [L('I<sub>q</sub> yükü', 'I<sub>q</sub> charge'), L('150 µA · 47,5 µs', '150 µA · 47.5 µs'), L('7,1 nC', '7.1 nC'), L('Sürücü + 100 kΩ gate–source direnci', 'Driver + 100 kΩ gate–source resistor')],
            [L('Toplam yük', 'Total charge'), L('60 + 7,1', '60 + 7.1'), '67 nC'],
            [L('En küçük C', 'Minimum C'), L('67 nC / 0,5 V', '67 nC / 0.5 V'), '134 nF'],
            [L('Seçilen C', 'Chosen C'), L('~3× pay', '~3× margin'), '470 nF', L('X7R, ≥ 25 V seramik', 'X7R, ≥ 25 V ceramic')],
            [L('Şarj zaman sabiti', 'Charge time constant'), '10 Ω · 470 nF', L('4,7 µs', '4.7 µs')],
            [L('Periyot başı tazeleme', 'Refresh per period'), L('1 − e<sup>−2,5/4,7</sup>', '1 − e<sup>−2.5/4.7</sup>'), L('%41', '41 %')],
            [L('Periyot başı sarkma', 'Droop per period'), '67 nC / 470 nF', L('0,14 V', '0.14 V')],
            [L('Kalıcı minimum', 'Steady-state minimum'), L('11,3 − 0,14 / 0,41', '11.3 − 0.14 / 0.41'), L('≈ 10,9 V', '≈ 10.9 V'), L('UVLO (8 V) çok altta', 'Well above UVLO (8 V)')],
            [L('Diyot ters gerilimi', 'Diode reverse voltage'), 'V+ + V<sub>DD</sub>', '≈ 60 V']
          ],
          result: L('<b>470 nF X7R ve 100 V ultrafast diyot (ES1B, UF4002) yeterli.</b> 1N4007 gibi yavaş diyotlar ters toparlanmada C<sub>boot</sub>’u boşaltır.', '<b>A 470 nF X7R and a 100 V ultrafast diode (ES1B, UF4002) are enough.</b> Slow diodes like the 1N4007 drain C<sub>boot</sub> during reverse recovery.'),
          level: 'ok'
        })}
        <p>${L('Deneyde dene: C = 470 nF, Q<sub>g</sub> = 60 nC, f = 20 kHz, duty = %95.', 'Try it in the lab: C = 470 nF, Q<sub>g</sub> = 60 nC, f = 20 kHz, duty = 95 %.')}</p>
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const V = (v, d) => App.num(v, d == null ? 1 : d) + ' V';

    /* ======================= Lab: five topologies ======================= */
    {
      const lab = root.querySelector('#lab-topo');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const figBox = App.h('div'); fig.appendChild(figBox);
      const plotBox = App.h('div'); fig.appendChild(plotBox);
      const status = App.h('div', { class: 'status' }); fig.appendChild(status);
      const note = App.h('div', { class: 'topo-note' }); fig.appendChild(note);
      const topSel = UI.segmented(ctl, {
        label: L('Topoloji', 'Topology'), value: 'ls', onChange: build,
        options: [
          { value: 'ls', label: 'Low-side N' }, { value: 'hsp', label: 'High-side P' }, { value: 'hsn', label: 'High-side N' },
          { value: 'hb', label: L('Yarım köprü', 'Half-bridge') }, { value: 'hbr', label: L('H-köprü', 'H-bridge') }
        ]
      });
      const dyn = App.h('div', { class: 'ctl' }); ctl.appendChild(dyn);
      let flows = [], cur = null;
      const flow = (svg, d, o) => { const f = new Viz.Flow(svg, d, o); flows.push(f); f.rate = 0; return f; };
      const setStatus = (cls, html) => { status.className = 'status ' + cls; status.innerHTML = html; };
      const setNote = (pro, con) => {
        note.innerHTML = `<div class="pro"><b>${L('Artı', 'Pro')}</b>${pro}</div><div class="con"><b>${L('Eksi', 'Con')}</b>${con}</div>`;
      };
      App.onFrame(dt => { if (cur && cur.tick) cur.tick(dt); });

      function build() {
        flows.forEach(f => { f.stop(); });
        flows = []; cur = null;
        figBox.innerHTML = ''; plotBox.innerHTML = ''; dyn.innerHTML = '';
        cur = ({ ls: buildLS, hsp: buildHSP, hsn: buildHSN, hb: buildHB, hbr: buildHBR })[topSel.value]();
      }

      /* ---- (1) low-side N-MOS ---- */
      function buildLS() {
        const svg = Viz.schematic(figBox, 600, 290, `
          ${Sch.vcc(300, 30, '+12 V')}${Sch.w([[300, 30], [300, 50]])}
          ${Sch.load(300, 80, 0, L('yük', 'load'))}
          ${Sch.w([[300, 110], [300, 150]])}${Sch.dot(300, 130)}
          ${Sch.w([[300, 130], [360, 130]])}<text id="tN" x="366" y="134" class="sch-t"></text>
          ${Sch.nmos(280, 180, 'Q1')}
          ${Sch.w([[300, 210], [300, 262]])}${Sch.gnd(300, 262)}
          ${Sch.box(40, 150, 110, 60, 'MCU', '')}<text id="tG" x="95" y="200" class="sch-t sig" text-anchor="middle"></text>
          ${Sch.w([[150, 180], [250, 180]], 'sigw')}${Sch.dot(215, 180)}
          ${Sch.w([[215, 180], [215, 196]])}${Sch.res(215, 226, 0, '100 kΩ')}${Sch.gnd(215, 256)}
          <text id="tV" x="340" y="190" class="sch-t"></text>
        `);
        const $ = id => svg.querySelector('#' + id);
        const fL = flow(svg, 'M300,30V262', { spacing: 15 });
        const fG = flow(svg, 'M150,180H250', { cls: 'flow e', spacing: 12, speed: 90 });
        let gt = 0;
        const t = UI.toggle(dyn, { label: 'GPIO HIGH', value: true, onChange: upd });
        const ro = UI.readouts(dyn, [{ key: 'vgs', label: 'V<sub>GS</sub>' }, { key: 'vn', label: L('Yükün alt ucu', 'Load low end') }, { key: 'vl', label: L('Yük gerilimi', 'Load voltage') }]);
        function upd() {
          const on = t.value;
          gt = 0.6;
          fL.rate = on ? 1.1 : 0;
          $('tG').textContent = on ? 'HIGH ' + V(3.3) : 'LOW 0 V';
          $('tN').textContent = on ? L('≈ 0,03 V', '≈ 0.03 V') : L('= 12 V (!)', '= 12 V (!)');
          $('tN').setAttribute('class', 'sch-t ' + (on ? 'ok' : 'bad'));
          $('tV').textContent = 'V_GS = ' + (on ? V(3.3) : '0 V');
          ro.set('vgs', on ? V(3.3) + ' ' + L('(GPIO = V<sub>GS</sub>)', '(GPIO = V<sub>GS</sub>)') : '0 V', 'ok');
          ro.set('vn', on ? L('≈ 0,03 V', '≈ 0.03 V') : L('12 V — yük “toprağı” yüzer', '12 V — load “ground” floats'), on ? '' : 'warn');
          ro.set('vl', on ? V(11.97, 2) : '0 V');
          setStatus('ok', L('Source toprakta olduğu için GPIO’nun 3,3 V’u doğrudan V<sub>GS</sub> olur. Lojik seviye bir MOSFET yeter.', 'With the source at ground, the GPIO’s 3.3 V is V<sub>GS</sub> directly. A logic-level MOSFET is all you need.'));
        }
        setNote(L('Sürmesi en kolay topoloji; tek GPIO, tek MOSFET, en düşük R<sub>DS(on)</sub>.', 'Easiest to drive; one GPIO, one MOSFET, lowest R<sub>DS(on)</sub>.'),
          L('Yük kapalıyken alt ucu 12 V’tadır. Yük toprağı başka bir devreyle paylaşıyorsa (ör. veri hattı olan bir LED şerit ya da sensör), akım veri hattı ve ESD diyotları üzerinden dolaşır.', 'When off, the load’s low end sits at 12 V. If the load shares ground with another circuit (e.g. an LED strip with a data line, or a sensor), current sneaks through the data line and ESD diodes.'));
        upd();
        return { tick(dt) { gt = Math.max(0, gt - dt); fG.rate = gt > 0 ? 1.5 : 0; fG.dir = t.value ? 1 : -1; } };
      }

      /* ---- (2) high-side P-MOS ---- */
      function buildHSP() {
        const svg = Viz.schematic(figBox, 600, 290, `
          ${Sch.vcc(400, 30, '+12 V')}${Sch.w([[300, 30], [400, 30], [400, 70]])}${Sch.dot(400, 30)}
          ${Sch.res(300, 60, 0, '10 kΩ')}${Sch.w([[300, 90], [300, 110]])}${Sch.dot(300, 100)}
          ${Sch.w([[300, 100], [350, 100]])}
          ${Sch.pmos(380, 100, 'Q1')}
          ${Sch.w([[400, 130], [400, 160]])}${Sch.load(400, 190, 0, L('yük', 'load'))}${Sch.w([[400, 220], [400, 262]])}${Sch.gnd(400, 262)}
          ${Sch.res(300, 140, 0, '1 kΩ')}
          ${Sch.npn(280, 200, 'Q2')}${Sch.w([[300, 230], [300, 262]])}${Sch.gnd(300, 262)}
          ${Sch.box(30, 170, 110, 60, 'MCU', '')}<text id="tG" x="85" y="220" class="sch-t sig" text-anchor="middle"></text>
          ${Sch.w([[140, 200], [170, 200]], 'sigw')}${Sch.res(200, 200, 90, L('4,7 kΩ', '4.7 kΩ'))}${Sch.w([[230, 200], [250, 200]], 'sigw')}
          <text id="tV" x="440" y="92" class="sch-t"></text>
          <text id="tN" x="420" y="246" class="sch-t"></text>
        `);
        const $ = id => svg.querySelector('#' + id);
        const fL = flow(svg, 'M400,30V262', { spacing: 15 });
        const fB = flow(svg, 'M300,30V262', { cls: 'flow e', spacing: 13, speed: 40, r: 2.2 });
        const fG = flow(svg, 'M140,200H250', { cls: 'flow e', spacing: 13, speed: 40, r: 2.2 });
        const t = UI.toggle(dyn, { label: 'GPIO HIGH', value: true, onChange: upd });
        const ro = UI.readouts(dyn, [{ key: 'vg', label: L('P-MOS gate', 'P-MOS gate') }, { key: 'vgs', label: 'V<sub>GS</sub>' }, { key: 'vl', label: L('Yük gerilimi', 'Load voltage') }]);
        function upd() {
          const on = t.value;
          // divider 10k / 1k from 12 V to Q2 V_CE(sat) ≈ 0.1 V
          const vg = on ? 0.1 + (12 - 0.1) * 1 / 11 : 12;
          fL.rate = on ? 1.1 : 0; fB.rate = on ? 0.5 : 0; fG.rate = on ? 0.4 : 0;
          $('tG').textContent = on ? 'HIGH' : 'LOW';
          $('tV').textContent = 'V_GS = ' + (on ? '−' + V(12 - vg) : '0 V');
          $('tV').setAttribute('class', 'sch-t ' + (on ? 'ok' : ''));
          $('tN').textContent = on ? L('yük topraklı ✓', 'load grounded ✓') : '';
          $('tN').setAttribute('class', 'sch-t ok');
          ro.set('vg', V(vg, 2));
          ro.set('vgs', on ? '−' + V(12 - vg, 2) : '0 V', 'ok');
          ro.set('vl', on ? L('≈ 11,9 V', '≈ 11.9 V') : '0 V');
          setStatus('ok', L('GPIO HIGH → Q2 açılır → P-MOS gate’i ~1,2 V’a iner → V<sub>GS</sub> ≈ −10,8 V → açık. GPIO LOW → 10 kΩ gate’i 12 V’a çeker → kapalı.', 'GPIO HIGH → Q2 on → P-MOS gate drops to ~1.2 V → V<sub>GS</sub> ≈ −10.8 V → on. GPIO LOW → the 10 kΩ pulls the gate to 12 V → off.'));
        }
        setNote(L('Yük toprağa bağlı kalır; %100 duty sorunsuz; sadece iki ucuz ek parça.', 'The load stays grounded; 100 % duty is no problem; just two cheap extra parts.'),
          L('Aynı boyutta P-MOS’un R<sub>DS(on)</sub>’u N-MOS’tan ~2–3× büyüktür. Pull-up direnci kapanmayı yavaşlatır (hızlı PWM’e uygun değil). V+ > 20 V ise V<sub>GS</sub> sınırına dikkat (Bölüm 06).', 'A P-MOS has ~2–3× the R<sub>DS(on)</sub> of a same-size N-MOS. The pull-up slows turn-off (not for fast PWM). Above 20 V, watch V<sub>GS(max)</sub> (chapter 06).'));
        upd();
        return null;
      }

      /* ---- (3) high-side N-MOS ---- */
      function buildHSN() {
        const svg = Viz.schematic(figBox, 600, 290, `
          ${Sch.vcc(400, 30, '+12 V')}${Sch.w([[400, 30], [400, 80]])}
          ${Sch.nmos(380, 110, 'Q1')}
          ${Sch.w([[400, 140], [400, 170]])}${Sch.dot(400, 155)}${Sch.w([[400, 155], [440, 155]])}<text id="tS" x="446" y="159" class="sch-t cu"></text>
          ${Sch.load(400, 200, 0, L('yük 4 Ω', 'load 4 Ω'))}${Sch.w([[400, 230], [400, 262]])}${Sch.gnd(400, 262)}
          ${Sch.box(150, 80, 140, 60, L('GATE KAYNAĞI', 'GATE SUPPLY'), '')}<text id="tGs" x="220" y="128" class="sch-t sig" text-anchor="middle"></text>
          ${Sch.w([[290, 110], [350, 110]], 'sigw')}
          <text id="tG" x="320" y="102" class="sch-t sig" text-anchor="middle"></text>
          <text id="tV" x="460" y="114" class="sch-t big"></text>
          <text id="tP" x="460" y="132" class="sch-t"></text>
        `);
        const $ = id => svg.querySelector('#' + id);
        const fL = flow(svg, 'M400,30V262', { spacing: 15 });
        const fG = flow(svg, 'M290,110H350', { cls: 'flow e', spacing: 12, speed: 70 });
        const p = new Viz.Plot(plotBox, {
          w: 600, h: 200, x: [0, 4], y: [0, 24], xLabel: L('zaman (gösterim)', 'time (illustrative)'), yLabel: L('gerilim (V)', 'voltage (V)'),
          xTicks: [], yTicks: [0, 6, 12, 18, 24], yFmt: v => App.num(v, 0)
        });
        p.hline('rail', 12, '');
        p.text('lg', 0.05, 22.5, 'V_G', 'sig'); p.text('ls', 0.45, 22.5, 'V_S', 'cu'); p.text('lgs', 0.85, 22.5, 'V_GS', 'ok');
        const tOn = UI.toggle(dyn, { label: L('MOSFET’i aç', 'Turn the MOSFET on'), value: false, onChange: () => { } });
        const sSup = UI.segmented(dyn, {
          label: L('Gate kaynağı', 'Gate supply'), value: 12, onChange: () => { },
          options: [{ value: 12, label: '12 V (= V+)' }, { value: 22, label: L('V+ + 10 V (bootstrap)', 'V+ + 10 V (bootstrap)') }]
        });
        const ro = UI.readouts(dyn, [
          { key: 'vs', label: L('Source (yük) gerilimi', 'Source (load) voltage') }, { key: 'vgs', label: 'V<sub>GS</sub>' },
          { key: 'p', label: L('MOSFET kaybı', 'MOSFET dissipation') }, { key: 'pl', label: L('Yük gücü', 'Load power') }
        ]);
        const k = 20, vth = 3, RL = 4, VP = 12;
        const solve = vg => {
          let a = 0, b = VP;
          for (let i = 0; i < 50; i++) {
            const m = (a + b) / 2;
            const f = Viz.phys.mosId(vg - m, VP - m, vth, k, 0) - m / RL;
            if (f > 0) a = m; else b = m;
          }
          return (a + b) / 2;
        };
        let vg = 0, hist = [], tt = 0;
        tOn.set(true);
        function tick(dt) {
          tt += dt;
          const target = tOn.value ? sSup.value : 0;
          const dv = (target - vg) * Math.min(1, dt / 0.45);
          vg += dv;
          if (App.reducedMotion) vg = target;
          fG.rate = Math.abs(dv) / dt > 0.4 ? 1.2 : 0; fG.dir = dv >= 0 ? 1 : -1;
          const vs = solve(vg), i = vs / RL, vgs = vg - vs, pm = (VP - vs) * i;
          hist.push([tt, vg, vs]);
          while (hist.length && hist[0][0] < tt - 4) hist.shift();
          const t0 = tt - 4;
          p.line('g', hist.map(h => [h[0] - t0, h[1]]), 'sig');
          p.line('s', hist.map(h => [h[0] - t0, h[2]]), 'cu');
          p.line('gs', hist.map(h => [h[0] - t0, h[1] - h[2]]), 'ok');
          fL.rate = i / 3 * 1.1;
          $('tGs').textContent = 'V_G → ' + V(sSup.value, 0);
          $('tG').textContent = 'V_G = ' + V(vg);
          $('tS').textContent = 'V_S = ' + V(vs);
          $('tV').textContent = 'V_GS = ' + V(vgs);
          $('tV').setAttribute('class', 'sch-t big ' + (vgs < 6 && i > 0.1 ? 'bad' : 'ok'));
          $('tP').textContent = 'P = ' + App.si(pm, 'W');
          $('tP').setAttribute('class', 'sch-t ' + (pm > 1 ? 'bad' : 'muted'));
          ro.set('vs', V(vs, 2), vs > 11.5 || i < 0.05 ? 'ok' : 'bad');
          ro.set('vgs', V(vgs, 2), vgs > 6 || i < 0.05 ? 'ok' : 'bad');
          ro.set('p', App.si(pm, 'W'), pm > 1 ? 'bad' : 'ok');
          ro.set('pl', App.si(vs * i, 'W'));
          if (!tOn.value && vg < 0.5) setStatus('', L('MOSFET kapalı. Aç ve source geriliminin nasıl yükseldiğini izle.', 'MOSFET off. Turn it on and watch the source voltage rise.'));
          else if (sSup.value === 12) setStatus('bad', L('Gate sadece 12 V: source yükseldikçe V<sub>GS</sub> eşiğe kadar düşer. Source ~8,5 V’ta takılır, MOSFET ~7 W ısıtır. Source follower!', 'Gate only at 12 V: as the source rises, V<sub>GS</sub> collapses towards threshold. The source stalls at ~8.5 V and the MOSFET burns ~7 W. A source follower!'));
          else setStatus('ok', L('Gate 22 V: source 12 V’a çıkınca bile V<sub>GS</sub> ≈ 10 V kalır. Tam açık, kayıp birkaç on mW.', 'Gate at 22 V: even with the source at 12 V, V<sub>GS</sub> stays ≈ 10 V. Fully on, a few tens of mW of loss.'));
        }
        setNote(L('N-MOS’un düşük R<sub>DS(on)</sub>’u ve hızı + topraklı yük.', 'N-MOS low R<sub>DS(on)</sub> and speed + grounded load.'),
          L('Gate’in V+’nın ~10 V üstüne çıkması gerekir: bootstrap, charge pump, izole besleme ya da high-side sürücü IC.', 'The gate must go ~10 V above V+: bootstrap, charge pump, isolated supply or a high-side driver IC.'));
        return { tick };
      }

      /* ---- (4) half-bridge ---- */
      function buildHB() {
        const svg = Viz.schematic(figBox, 600, 290, `
          ${Sch.vcc(400, 30, '+12 V')}${Sch.w([[400, 30], [400, 70]])}
          ${Sch.nmos(380, 100, 'HS')}
          ${Sch.w([[400, 130], [400, 180]])}${Sch.dot(400, 155)}
          ${Sch.nmos(380, 210, 'LS')}
          ${Sch.w([[400, 240], [400, 262]])}${Sch.gnd(400, 262)}
          ${Sch.w([[400, 155], [500, 155], [500, 170]])}${Sch.load(500, 200, 0, L('yük', 'load'))}${Sch.w([[500, 230], [500, 262]])}${Sch.gnd(500, 262)}
          ${Sch.box(180, 70, 110, 170, L('SÜRÜCÜ', 'DRIVER'), '')}
          ${Sch.w([[290, 100], [350, 100]], 'sigw')}${Sch.w([[290, 210], [350, 210]], 'sigw')}
          <text x="300" y="94" class="sch-t sig">HO</text><text x="300" y="204" class="sch-t sig">LO</text>
          ${Sch.box(30, 125, 100, 60, 'MCU', '')}${Sch.w([[130, 155], [180, 155]], 'sigw')}
          <text id="tSW" x="440" y="148" class="sch-t cu"></text>
          <text id="tH" x="318" y="122" class="sch-t"></text><text id="tL" x="318" y="232" class="sch-t"></text>
        `);
        const $ = id => svg.querySelector('#' + id);
        const fL = flow(svg, 'M400,30V155H500V262', { spacing: 15 });
        const fX = flow(svg, 'M400,30V262', { cls: 'flow bad', spacing: 10, speed: 160 });
        const g = App.h('div', { class: 'tgl-grid' }); dyn.appendChild(g);
        const tH = UI.toggle(g, { label: 'HS ON', value: true, onChange: upd });
        const tL = UI.toggle(g, { label: 'LS ON', value: false, onChange: upd });
        const ro = UI.readouts(dyn, [{ key: 'sw', label: 'V<sub>SW</sub>' }, { key: 'i', label: L('Yük akımı', 'Load current') }, { key: 'x', label: L('Kısa devre akımı', 'Short-circuit current') }]);
        function upd() {
          const h = tH.value, l = tL.value, x = h && l;
          fL.rate = h && !l ? 1.1 : 0; fX.rate = x ? 3 : 0;
          $('tH').textContent = h ? 'ON' : 'off'; $('tH').setAttribute('class', 'sch-t ' + (x ? 'bad' : h ? 'ok' : 'muted'));
          $('tL').textContent = l ? 'ON' : 'off'; $('tL').setAttribute('class', 'sch-t ' + (x ? 'bad' : l ? 'ok' : 'muted'));
          const sw = x ? L('~6 V (çöküyor)', '~6 V (collapsing)') : h ? '12 V' : l ? '0 V' : L('yüzüyor (Hi-Z)', 'floating (Hi-Z)');
          $('tSW').textContent = 'SW = ' + sw;
          ro.set('sw', sw, x ? 'bad' : '');
          ro.set('i', h && !l ? L('12 V / R<sub>yük</sub>', '12 V / R<sub>load</sub>') : '0', '');
          ro.set('x', x ? L('12 V / (2·R<sub>DS(on)</sub>) → yüzlerce A', '12 V / (2·R<sub>DS(on)</sub>) → hundreds of A') : '0', x ? 'bad' : 'ok');
          if (x) setStatus('bad', L('SHOOT-THROUGH! İki MOSFET aynı bacakta aynı anda açık: besleme doğrudan toprağa kısa devre.', 'SHOOT-THROUGH! Both MOSFETs of the leg are on: the supply is shorted straight to ground.'));
          else if (h) setStatus('ok', L('HS açık: SW = V+, yük besleniyor.', 'HS on: SW = V+, the load is powered.'));
          else if (l) setStatus('ok', L('LS açık: SW toprağa çekili. Dirençsel yükte akım yok; endüktif yükte akım LS üzerinden döner. Bootstrap kondansatörü bu sırada şarj olur.', 'LS on: SW pulled to ground. No current in a resistive load; an inductive load’s current circulates through LS. The bootstrap capacitor charges now.'));
          else setStatus('warn', L('İkisi de kapalı (dead-time): SW yüzer; endüktif akım varsa body diyotlarından geçer.', 'Both off (dead-time): SW floats; any inductive current flows through the body diodes.'));
        }
        setNote(L('Çıkışı iki yöne de aktif sürer; senkron doğrultma, buck/boost ve motor fazları için temel blok.', 'Actively drives the output both ways; the building block for synchronous rectification, buck/boost and motor phases.'),
          L('Aynı bacakta iki MOSFET aynı anda açılırsa shoot-through. Dead-time ve donanım kilidi şart; HS için bootstrap gerekir.', 'Both MOSFETs of a leg on at once = shoot-through. Dead-time and a hardware interlock are mandatory; HS needs a bootstrap.'));
        upd();
        return null;
      }

      /* ---- (5) H-bridge with motor ---- */
      function buildHBR() {
        const svg = Viz.schematic(figBox, 600, 310, `
          ${Sch.vcc(310, 40, '+12 V')}${Sch.w([[200, 70], [200, 40], [420, 40], [420, 70]])}${Sch.dot(310, 40)}
          ${Sch.w([[200, 250], [200, 280], [420, 280], [420, 250]])}${Sch.dot(310, 280)}${Sch.gnd(310, 280)}
          ${Sch.nmos(180, 100, 'Q1', { bd: true })}${Sch.nmos(180, 220, 'Q2', { bd: true })}
          ${Sch.nmos(400, 100, 'Q3', { bd: true })}${Sch.nmos(400, 220, 'Q4', { bd: true })}
          ${Sch.w([[200, 130], [200, 190]])}${Sch.w([[420, 130], [420, 190]])}${Sch.dot(200, 160)}${Sch.dot(420, 160)}
          ${Sch.w([[200, 160], [280, 160]])}${Sch.w([[340, 160], [420, 160]])}
          <g transform="rotate(90 310 160)">${Sch.motor(310, 160, ' ', 'hMot')}</g>
          <text x="310" y="196" class="sch-t" text-anchor="middle">M</text>
          ${Sch.w([[124, 100], [150, 100]], 'sigw')}${Sch.w([[124, 220], [150, 220]], 'sigw')}
          ${Sch.w([[350, 100], [370, 100]], 'sigw')}${Sch.w([[350, 220], [370, 220]], 'sigw')}
          <text id="g1" x="120" y="104" class="sch-t" text-anchor="end"></text><text id="g2" x="120" y="224" class="sch-t" text-anchor="end"></text>
          <text id="g3" x="346" y="104" class="sch-t" text-anchor="end"></text><text id="g4" x="346" y="224" class="sch-t" text-anchor="end"></text>
          <text id="tM" x="310" y="134" class="sch-t cu" text-anchor="middle"></text>
          <text id="tMode" x="310" y="304" class="sch-t big" text-anchor="middle"></text>
        `);
        const $ = id => svg.querySelector('#' + id);
        const rotor = svg.querySelector('#hMot .rotor');
        const fF = flow(svg, 'M310,40H200V160H420V280H310', { spacing: 15 });
        const fR = flow(svg, 'M310,40H420V160H200V280H310', { spacing: 15 });
        const fB = flow(svg, 'M200,160H420V280H200V160', { spacing: 15 });
        const fCf = flow(svg, 'M310,280H200V160H420V40H310', { spacing: 15 });
        const fCr = flow(svg, 'M310,280H420V160H200V40H310', { spacing: 15 });
        const fXl = flow(svg, 'M200,40V280', { cls: 'flow bad', spacing: 10, speed: 160 });
        const fXr = flow(svg, 'M420,40V280', { cls: 'flow bad', spacing: 10, speed: 160 });
        const row = App.h('div', { class: 'btn-row' }); dyn.appendChild(row);
        const q = [false, false, false, false];
        const tg = [];
        const preset = (a, b, c, d) => { [a, b, c, d].forEach((v, i) => tg[i].set(v, true)); q.splice(0, 4, a, b, c, d); upd(); };
        UI.button(row, { label: L('İleri', 'Forward'), onClick: () => preset(true, false, false, true) });
        UI.button(row, { label: L('Geri', 'Reverse'), onClick: () => preset(false, true, true, false) });
        UI.button(row, { label: L('Fren', 'Brake'), onClick: () => preset(false, true, false, true) });
        UI.button(row, { label: L('Serbest', 'Coast'), onClick: () => preset(false, false, false, false) });
        const g = App.h('div', { class: 'tgl-grid' }); dyn.appendChild(g);
        ['Q1', 'Q3', 'Q2', 'Q4'].forEach(n => {
          const i = +n[1] - 1;
          tg[i] = UI.toggle(g, { label: n, value: false, onChange: v => { q[i] = v; upd(); } });
        });
        const ro = UI.readouts(dyn, [{ key: 'm', label: L('Mod', 'Mode') }, { key: 'v', label: L('Motor gerilimi', 'Motor voltage') }, { key: 'w', label: L('Hız', 'Speed') }]);
        let w = 0, i = 0, ang = 0, mode = 'coast';
        function upd() {
          const sl = q[0] && q[1], sr = q[2] && q[3];
          const left = q[0] ? 1 : q[1] ? 0 : null, right = q[2] ? 1 : q[3] ? 0 : null;
          if (sl || sr) mode = 'shoot';
          else if (left !== null && right !== null) mode = left - right > 0 ? 'fwd' : left - right < 0 ? 'rev' : 'brake';
          else mode = 'coast';
          for (let k = 0; k < 4; k++) {
            const el = $('g' + (k + 1));
            el.textContent = q[k] ? 'ON' : 'off';
            const leg = k < 2 ? sl : sr;
            el.setAttribute('class', 'sch-t ' + (q[k] && leg ? 'bad' : q[k] ? 'ok' : 'muted'));
          }
          const names = {
            fwd: [L('İLERİ', 'FORWARD'), 'ok'], rev: [L('GERİ', 'REVERSE'), 'ok'], brake: [L('FREN (iki low-side)', 'BRAKE (both low-sides)'), 'cu'],
            coast: [L('SERBEST (coast)', 'COAST'), 'muted'], shoot: [L('SHOOT-THROUGH!', 'SHOOT-THROUGH!'), 'bad']
          };
          $('tMode').textContent = names[mode][0];
          $('tMode').setAttribute('class', 'sch-t big ' + names[mode][1]);
          ro.set('m', names[mode][0], mode === 'shoot' ? 'bad' : mode === 'coast' ? '' : 'ok');
          const vm = mode === 'fwd' ? '+12 V' : mode === 'rev' ? '−12 V' : mode === 'brake' ? L('0 V (kısa devre)', '0 V (shorted)') : mode === 'shoot' ? '—' : L('yüzüyor', 'floating');
          ro.set('v', vm);
          if (mode === 'shoot') setStatus('bad', L('YASAK DURUM: aynı bacakta üst ve alt MOSFET açık. Besleme kısa devre; gerçek devrede MOSFET’ler anında yanar.', 'ILLEGAL STATE: top and bottom MOSFET of one leg are on. The supply is shorted; in a real circuit the MOSFETs burn instantly.'));
          else if (mode === 'fwd' || mode === 'rev') setStatus('ok', L('Köşegen çift açık: akım motordan ', 'Diagonal pair on: current flows through the motor ') + (mode === 'fwd' ? L('soldan sağa', 'left to right') : L('sağdan sola', 'right to left')) + L(' akar.', '.'));
          else if (mode === 'brake') setStatus('warn', L('Fren: motor uçları iki low-side üzerinden kısa devre. Dönen motorun zıt-EMK’sı ters yönde bir akım sürer ve motoru hızla durdurur.', 'Brake: the motor terminals are shorted through both low-sides. The spinning motor’s back-EMF drives a reverse current that stops it quickly.'));
          else setStatus('', L('Serbest: tüm anahtarlar kapalı. Bobin akımı body diyotları üzerinden kısa sürede söner, motor sürtünmeyle yavaşça durur.', 'Coast: all switches off. The winding current dies out quickly through the body diodes, and the motor slows down on friction alone.'));
        }
        function tick(dt) {
          const left = q[0] ? 1 : q[1] ? 0 : null, right = q[2] ? 1 : q[3] ? 0 : null;
          if (mode !== 'shoot' && left !== null && right !== null) {
            const it = ((left - right) - w) * 2;
            i += (it - i) * Math.min(1, dt / 0.12);
          } else {
            const d = dt / 0.12;
            i = Math.abs(i) < d ? 0 : i - Math.sign(i) * d;
          }
          w += (i - 0.3 * w) * dt * 1.2;
          if (!App.reducedMotion) { ang = (ang + w * dt * 720) % 360; rotor.setAttribute('transform', `rotate(${ang.toFixed(1)} 310 160)`); }
          const drive = mode === 'fwd' || mode === 'rev';
          fF.rate = mode === 'fwd' ? 0.45 + Math.abs(i) * 2.5 : 0;
          fR.rate = mode === 'rev' ? 0.45 + Math.abs(i) * 2.5 : 0;
          fB.rate = mode === 'brake' ? Math.min(2.5, Math.abs(i) * 3) : 0; fB.dir = i >= 0 ? 1 : -1;
          fCf.rate = !drive && mode !== 'brake' && i > 0.01 ? i * 4 : 0;
          fCr.rate = !drive && mode !== 'brake' && i < -0.01 ? -i * 4 : 0;
          fXl.rate = mode === 'shoot' && q[0] && q[1] ? 3 : 0;
          fXr.rate = mode === 'shoot' && q[2] && q[3] ? 3 : 0;
          $('tM').textContent = Math.abs(w) > 0.02 ? (w > 0 ? '↻ ' : '↺ ') + App.num(Math.abs(w) / 0.87 * 100, 0) + ' %' : '';
          ro.set('w', App.num(w / 0.87 * 100, 0) + ' %');
        }
        setNote(L('İki yönlü akım: ileri, geri ve aktif fren tek devrede.', 'Bidirectional current: forward, reverse and active braking in one circuit.'),
          L('Dört anahtar, iki high-side gate sürme, iki bacakta shoot-through riski. Birkaç ampere kadar hazır IC daha mantıklı.', 'Four switches, two high-side gate drives, shoot-through risk on both legs. Up to a few amps a ready-made IC makes more sense.'));
        preset(true, false, false, true);
        return { tick };
      }

      build();
    }

    /* ======================= Lab: short to chassis ======================= */
    {
      const lab = root.querySelector('#lab-short');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const fuse = (x, y, id) => `<g id="${id}">${Sch.res(x, y, 0, '')}<g class="sch"><path d="M${x},${y - 15}V${y + 15}"/></g>` +
        `<text x="${x + 14}" y="${y + 4}" class="sch-t">${L('sigorta 5 A', 'fuse 5 A')}</text><text class="sch-t bad big fx" x="${x}" y="${y + 6}" text-anchor="middle"></text></g>`;
      const svg = Viz.schematic(fig, 600, 300, `
        <g id="sLS">
          ${Sch.vcc(150, 30, '+12 V')}${Sch.w([[150, 30], [150, 40]])}${fuse(150, 70, 'fuLS')}${Sch.w([[150, 100], [150, 120]])}
          ${Sch.load(150, 150, 0, L('yük 6 Ω', 'load 6 Ω'))}${Sch.w([[150, 180], [150, 200], [420, 200], [420, 210]])}
          ${Sch.nmos(400, 240, 'Q1')}${Sch.w([[420, 270], [420, 272]])}${Sch.gnd(420, 272)}
          ${Sch.box(280, 220, 70, 40, 'MCU', '')}${Sch.w([[350, 240], [370, 240]], 'sigw')}
          <text id="wLS" x="430" y="194" class="sch-t"></text>
        </g>
        <g id="sHS">
          ${Sch.vcc(420, 30, '+12 V')}${Sch.w([[420, 30], [420, 40]])}${fuse(420, 70, 'fuHS')}${Sch.w([[420, 100], [420, 110]])}
          ${Sch.pmos(400, 140, 'Q1')}${Sch.w([[420, 170], [420, 200], [150, 200], [150, 210]])}
          ${Sch.load(150, 240, 0, L('yük 6 Ω', 'load 6 Ω'))}${Sch.w([[150, 270], [150, 272]])}${Sch.gnd(150, 272)}
          ${Sch.box(280, 120, 70, 40, L('sürücü', 'driver'), '')}${Sch.w([[350, 140], [370, 140]], 'sigw')}
          <text id="wHS" x="430" y="194" class="sch-t"></text>
        </g>
        <text x="320" y="192" class="sch-t muted" text-anchor="middle">${L('kablo demeti', 'harness')}</text>
        <g id="shG">${Sch.dot(250, 200)}${Sch.w([[250, 200], [250, 252]], 'badw')}${Sch.gnd(250, 252)}
          <text x="262" y="292" class="sch-t bad">${L('şasiye kısa devre', 'short to chassis')}</text></g>
        <text id="sSt" x="560" y="292" class="sch-t big" text-anchor="end"></text>
      `);
      const $ = id => svg.querySelector('#' + id);
      const fLS = new Viz.Flow(svg, 'M150,30V200H420V272', { spacing: 15 });
      const fLSs = new Viz.Flow(svg, 'M150,30V200H250V252', { cls: 'flow bad', spacing: 13 });
      const fHS = new Viz.Flow(svg, 'M420,30V200H150V272', { spacing: 15 });
      const fHSs = new Viz.Flow(svg, 'M420,30V200H250V252', { cls: 'flow bad', spacing: 9, speed: 170 });
      const sTop = UI.segmented(ctl, {
        label: L('Topoloji', 'Topology'), value: 'ls', onChange: upd,
        options: [{ value: 'ls', label: 'Low-side' }, { value: 'hs', label: 'High-side' }]
      });
      const tOn = UI.toggle(ctl, { label: L('Anahtar açık (GPIO HIGH)', 'Switch on (GPIO HIGH)'), value: false, onChange: upd });
      const tSh = UI.toggle(ctl, { label: L('Kablo şasiye kısa devre', 'Wire shorted to chassis'), value: false, onChange: upd });
      UI.button(ctl, { label: L('Sigortayı değiştir', 'Replace the fuse'), onClick: () => { blown = false; fault = 0; upd(); } });
      const ro = UI.readouts(ctl, [
        { key: 'load', label: L('Yük', 'Load') }, { key: 'w', label: L('Kablo gerilimi', 'Wire voltage') },
        { key: 'i', label: L('Akım', 'Current') }, { key: 'f', label: L('Sigorta', 'Fuse') }
      ]);
      const status = App.h('div', { class: 'status' }); fig.appendChild(status);
      let blown = false, fault = 0, flash = 0;
      function upd() {
        const hs = sTop.value === 'hs', on = tOn.value, sh = tSh.value;
        $('sLS').style.display = hs ? 'none' : ''; $('sHS').style.display = hs ? '' : 'none';
        $('shG').style.display = sh ? '' : 'none';
        let load, w, i, f = blown ? L('ATTI', 'BLOWN') : L('sağlam', 'intact'), st, msg;
        fLS.rate = 0; fLSs.rate = 0; fHS.rate = 0; fHSs.rate = 0;
        if (!hs) {
          if (sh) { load = L('AÇIK (kontrolsüz!)', 'ON (uncontrolled!)'); w = '0 V'; i = '2 A'; st = 'bad'; fLSs.rate = 1.1;
            msg = L('Low-side + kısa devre: yükün alt ucu şasiye bağlandı. Yük, MOSFET ne derse desin <b>sürekli açık</b>. Akım normal yük akımı (2 A) olduğu için sigorta atmaz; arıza fark edilmez.', 'Low-side + short: the load’s low end is now tied to chassis. The load is <b>permanently on</b>, whatever the MOSFET does. The current is the normal 2 A, so the fuse does not blow and the fault goes unnoticed.'); }
          else if (on) { load = L('AÇIK', 'ON'); w = L('≈ 0,03 V', '≈ 0.03 V'); i = '2 A'; st = 'ok'; fLS.rate = 1.1; msg = L('Normal çalışma: akım yük, kablo ve MOSFET üzerinden toprağa akıyor.', 'Normal operation: current flows through load, harness and MOSFET to ground.'); }
          else { load = L('KAPALI', 'OFF'); w = L('12 V (yüzüyor)', '12 V (floating)'); i = '0'; st = 'warn'; msg = L('Kapalı ama kablo demeti 12 V’ta duruyor: şasiye değerse yük açılır.', 'Off, but the harness sits at 12 V: if it touches chassis the load turns on.'); }
          $('wLS').textContent = 'V = ' + w.replace(/<[^>]+>/g, '');
          $('wLS').setAttribute('class', 'sch-t ' + (st === 'bad' ? 'bad' : st === 'warn' ? 'cu' : 'ok'));
        } else {
          if (blown) { load = L('KAPALI (sigorta attı)', 'OFF (fuse blown)'); w = '0 V'; i = '0'; st = sh ? 'ok' : 'warn';
            msg = sh ? L('High-side + kısa devre: sigorta attı, yük kapalı ve güvenli. Arıza görünür (yük çalışmıyor), kontrolsüz açılma yok.', 'High-side + short: the fuse blew, the load is off and safe. The fault is visible (the load stops working), no uncontrolled turn-on.')
              : L('Sigorta değiştirilmeli.', 'The fuse needs replacing.'); }
          else if (sh && on) { load = L('KISA DEVRE', 'SHORT CIRCUIT'); w = '0 V'; i = L('yüzlerce A', 'hundreds of A'); st = 'bad'; fHSs.rate = 3;
            msg = L('Kısa devre akımı! Sigorta ya da akıllı anahtarın akım sınırı birkaç ms içinde açacak…', 'Short-circuit current! The fuse or the smart switch’s current limit will open within milliseconds…'); }
          else if (sh) { load = L('KAPALI', 'OFF'); w = '0 V'; i = '0'; st = 'ok'; msg = L('Kapalıyken kablo zaten 0 V’ta: şasiye değmesi hiçbir şey değiştirmez. Anahtar açılırsa sigorta atar.', 'When off, the harness is already at 0 V: touching chassis changes nothing. If the switch turns on, the fuse blows.'); }
          else if (on) { load = L('AÇIK', 'ON'); w = '12 V'; i = '2 A'; st = 'ok'; fHS.rate = 1.1; msg = L('Normal çalışma: yük kendi bulunduğu yerde şasiye bağlı.', 'Normal operation: the load is grounded to chassis where it sits.'); }
          else { load = L('KAPALI', 'OFF'); w = '0 V'; i = '0'; st = 'ok'; msg = L('Kapalıyken kablo demeti 0 V’ta: güvenli, korozyon yok.', 'Off, the harness sits at 0 V: safe, no corrosion.'); }
          $('wHS').textContent = 'V = ' + w;
          $('wHS').setAttribute('class', 'sch-t ' + (st === 'bad' ? 'bad' : 'ok'));
        }
        ['fuLS', 'fuHS'].forEach(id => { svg.querySelector('#' + id + ' .fx').textContent = blown && id === 'fuHS' ? '✕' : ''; });
        ro.set('load', load, st === 'bad' ? 'bad' : '');
        ro.set('w', w, ''); ro.set('i', i, st === 'bad' ? 'bad' : '');
        ro.set('f', f, blown ? 'bad' : 'ok');
        status.className = 'status ' + st; status.innerHTML = msg;
        $('sSt').textContent = st === 'bad' ? (hs ? L('KISA DEVRE!', 'SHORT!') : L('KONTROL KAYBI!', 'LOST CONTROL!')) : '';
        $('sSt').setAttribute('class', 'sch-t big bad');
      }
      App.onFrame(dt => {
        const hs = sTop.value === 'hs';
        if (hs && tOn.value && tSh.value && !blown) {
          fault += dt; flash += dt;
          $('sSt').style.opacity = (Math.sin(flash * 25) > 0 ? 1 : 0.25);
          if (fault > 0.6 || App.reducedMotion) { blown = true; fault = 0; $('sSt').style.opacity = 1; upd(); }
        }
      });
      upd();
    }

    /* ======================= Lab: ground shift ======================= */
    {
      const lab = root.querySelector('#lab-gshift');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 285, `
        ${Sch.vsrc(60, 160, '12 V')}
        ${Sch.w([[60, 190], [60, 250], [145, 250]])}${Sch.gnd(60, 250)}
        ${Sch.res(175, 250, 90, '')}<text x="175" y="236" class="sch-t" text-anchor="middle">R_ret</text>
        ${Sch.w([[205, 250], [290, 250], [290, 200]])}${Sch.dot(290, 250)}
        ${Sch.box(220, 110, 140, 90, 'MCU', L('+ sürücü', '+ driver'))}
        <text id="gT" x="300" y="272" class="sch-t big"></text>
        <text id="gI" x="175" y="276" class="sch-t cu" text-anchor="middle"></text>
        <g id="gLS">
          ${Sch.w([[60, 130], [60, 40], [520, 40], [520, 100]])}
          ${Sch.load(520, 130, 0, L('yük', 'load'))}${Sch.w([[520, 160], [520, 180], [360, 180]])}
          <text x="440" y="174" class="sch-t muted" text-anchor="middle">${L('yük dönüşü', 'load return')}</text>
        </g>
        <g id="gHS">
          ${Sch.w([[60, 130], [60, 40], [290, 40], [290, 110]])}
          ${Sch.w([[360, 130], [440, 130], [440, 80], [520, 80], [520, 100]])}
          ${Sch.load(520, 130, 0, L('yük', 'load'))}${Sch.w([[520, 160], [520, 190]])}${Sch.gnd(520, 190)}
          <text x="520" y="222" class="sch-t muted" text-anchor="middle">${L('yerel şasi', 'local chassis')}</text>
        </g>
      `);
      const $ = id => svg.querySelector('#' + id);
      const fLS = new Viz.Flow(svg, 'M60,130V40H520V180H360L290,200V250H60V190', { spacing: 15 });
      const fHS = new Viz.Flow(svg, 'M60,130V40H290V110L360,130H440V80H520V190', { spacing: 15 });
      const fMcu = new Viz.Flow(svg, 'M290,200V250H60V190', { cls: 'flow e', spacing: 14, speed: 30, r: 2 });
      const p = new Viz.Plot(fig, {
        w: 600, h: 210, x: [0, 2], y: [-0.05, 1], xTicks: [0, 0.5, 1, 1.5, 2], xLabel: L('zaman (PWM periyodu, gösterim)', 'time (PWM periods, illustrative)'),
        yLabel: L('GND_MCU kayması (V)', 'GND_MCU shift (V)'), xFmt: v => App.num(v, 1), yFmt: v => App.num(v, 2)
      });
      const sTop = UI.segmented(ctl, {
        label: L('Topoloji', 'Topology'), value: 'ls', onChange: update,
        options: [{ value: 'ls', label: 'Low-side' }, { value: 'hs', label: 'High-side' }]
      });
      const sI = UI.slider(ctl, { label: L('Yük akımı', 'Load current'), min: 0.5, max: 10, step: 0.1, value: 5, unit: 'A', onInput: update });
      const sR = UI.slider(ctl, { label: 'R<sub>ret</sub>', min: 0.01, max: 0.2, step: 0.005, value: 0.05, unit: 'Ω', onInput: update });
      const sD = UI.slider(ctl, { label: 'Duty', min: 0.1, max: 0.9, step: 0.05, value: 0.5, fmt: v => App.num(v * 100, 0) + ' %', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'ls', label: L('Low-side: kayma (açıkken)', 'Low-side: shift (on)') },
        { key: 'hs', label: L('High-side: kayma', 'High-side: shift') },
        { key: 'adc', label: L('12-bit ADC hatası (3,3 V ref)', '12-bit ADC error (3.3 V ref)') },
        { key: 'pw', label: L('Dönüş kablosu kaybı', 'Return wire loss') }
      ]);
      const IMCU = 0.05;
      let shiftOn = 0, shiftOff = 0;
      function update() {
        const I = sI.value, R = sR.value, D = sD.value, hs = sTop.value === 'hs';
        $('gLS').style.display = hs ? 'none' : ''; $('gHS').style.display = hs ? '' : 'none';
        const lsOn = (I + IMCU) * R, base = IMCU * R;
        shiftOn = hs ? base : lsOn; shiftOff = base;
        const ymax = Math.max(0.1, lsOn * 1.25);
        p.setRange({ y: [-ymax * 0.05, ymax] });
        const sq = Viz.sample(t => ((t % 1) < D ? lsOn : base), 0, 2, 800);
        p.line('ls', sq, hs ? 'bad thin dash' : 'bad');
        p.line('hs', [[0, base], [2, base]], hs ? 'ok' : 'ok thin dash');
        p.text('lsT', 0.02, lsOn, 'low-side: I·R_ret = ' + App.si(lsOn, 'V'), 'bad', 'start', 0, -6);
        p.text('hsT', 1.98, base, 'high-side: ' + App.si(base, 'V'), 'ok', 'end', 0, -6);
        const adc = lsOn / 3.3 * 4096;
        ro.set('ls', App.si(lsOn, 'V'), lsOn > 0.1 ? 'bad' : lsOn > 0.03 ? 'warn' : 'ok');
        ro.set('hs', App.si(base, 'V'), 'ok');
        ro.set('adc', (hs ? App.num(base / 3.3 * 4096, 0) : App.num(adc, 0)) + ' LSB', !hs && adc > 20 ? 'bad' : 'ok');
        ro.set('pw', App.si((hs ? IMCU * IMCU : (I + IMCU) * (I + IMCU) * D) * R, 'W'));
      }
      const show = t => {
        const D = sD.value, on = (t % 1) < D, hs = sTop.value === 'hs';
        const v = on ? shiftOn : shiftOff;
        fLS.rate = !hs && on ? 1.1 : 0; fHS.rate = hs && on ? 1.1 : 0; fMcu.rate = 0.3;
        $('gT').textContent = 'GND_MCU = +' + App.si(v, 'V');
        $('gT').setAttribute('class', 'sch-t big ' + (v > 0.1 ? 'bad' : v > 0.03 ? 'cu' : 'ok'));
        $('gI').textContent = 'I = ' + App.si(!hs && on ? sI.value + IMCU : IMCU, 'A');
        p.vline('cur', t, 'cu solid');
        p.dot('d', t, v, v > 0.1 ? 'bad' : '', 5);
      };
      update();
      if (App.reducedMotion) show(0.25);
      else { let t = 0; App.onFrame(dt => { t = (t + dt * 0.5) % 2; show(t); }); }
    }

    /* ======================= Figure: bootstrap cycle ======================= */
    {
      const fig = root.querySelector('#fig-boot .lab-fig');
      const svg = Viz.schematic(fig, 600, 280, `
        ${Sch.vcc(420, 30, 'V+ = 48 V')}${Sch.w([[420, 30], [420, 70]])}
        ${Sch.nmos(400, 100, 'HS')}
        ${Sch.w([[420, 130], [420, 180]])}${Sch.dot(420, 155)}
        ${Sch.nmos(400, 210, 'LS')}
        ${Sch.w([[420, 240], [420, 255]])}${Sch.gnd(420, 255)}
        ${Sch.w([[420, 155], [570, 155]])}<text x="568" y="148" class="sch-t muted" text-anchor="end">${L('SW → yük', 'SW → load')}</text>
        ${Sch.vcc(110, 60, L('V_DD 12 V', 'V_DD 12 V'))}${Sch.w([[110, 60], [110, 70], [140, 70]])}
        ${Sch.diode(170, 70, 270, '', '')}<text x="170" y="92" class="sch-t" text-anchor="middle">D_boot</text>
        ${Sch.w([[200, 70], [337, 70], [337, 80]])}${Sch.dot(270, 70)}
        ${Sch.w([[270, 70], [270, 80]])}${Sch.cap(270, 110, 0, '')}<text x="258" y="114" class="sch-t" text-anchor="end">C_boot</text>
        ${Sch.w([[270, 140], [270, 155], [420, 155]])}${Sch.dot(337, 155)}
        ${Sch.box(320, 80, 35, 45, '', '')}<text x="337" y="106" class="sch-t" text-anchor="middle">HO</text>
        ${Sch.w([[337, 125], [337, 155]])}
        ${Sch.w([[355, 100], [370, 100]], 'sigw')}
        ${Sch.w([[330, 210], [370, 210]], 'sigw')}<text x="326" y="214" class="sch-t sig" text-anchor="end">LO</text>
        <text id="bVB" x="260" y="58" class="sch-t sig" text-anchor="middle"></text>
        <text id="bSW" x="440" y="176" class="sch-t cu"></text>
        <text id="bGS" x="446" y="122" class="sch-t ok"></text>
        <text id="bPh" x="160" y="200" class="sch-t big" text-anchor="middle"></text>
        <text id="bPh2" x="160" y="218" class="sch-t muted" text-anchor="middle"></text>
      `);
      const $ = id => svg.querySelector('#' + id);
      const fC = new Viz.Flow(svg, 'M110,62V70H270V155H420V255', { cls: 'flow e', spacing: 13, speed: 50 });
      const fG = new Viz.Flow(svg, 'M270,72H337V100H370', { cls: 'flow e', spacing: 11, speed: 70 });
      const fL = new Viz.Flow(svg, 'M420,30V155H570', { spacing: 15 });
      const p = new Viz.Plot(fig, {
        w: 600, h: 220, x: [0, 6], y: [-4, 66], xTicks: [0, 1.5, 3, 4.5, 6], yTicks: [0, 12, 24, 36, 48, 60],
        xLabel: L('zaman (gösterim, 2 periyot)', 'time (illustrative, 2 periods)'), yLabel: 'V', xFmt: () => '', yFmt: v => App.num(v, 0)
      });
      const VF = 11.3, VP = 48;
      // state at time t (period 3 s: 0–1.5 LS on, 1.5–3 HS on)
      const state = t => {
        const ph = t % 3, hs = ph >= 1.5;
        const sw = hs ? VP * App.clamp((ph - 1.5) / 0.08, 0, 1) : VP * (1 - App.clamp(ph / 0.08, 0, 1));
        // capacitor voltage: droop during HS (−0.9 V incl. a step for Qg), recharge during LS
        const vEnd = VF - 0.9;
        const vc = hs ? VF - 0.35 - 0.55 * (ph - 1.5) / 1.5 : vEnd + (VF - vEnd) * (1 - Math.exp(-ph / 0.18));
        return { hs, sw, vb: sw + vc, vgs: hs ? vc * App.clamp((ph - 1.5) / 0.08, 0, 1) : 0, vc, ph };
      };
      const sw = [], vb = [], gs = [];
      for (let k = 0; k <= 600; k++) { const t = k / 100, s = state(t); sw.push([t, s.sw]); vb.push([t, s.vb]); gs.push([t, s.vgs]); }
      p.rect('ls1', 0, -4, 1.5, 66, 'sig'); p.rect('ls2', 3, -4, 4.5, 66, 'sig');
      p.line('sw', sw, 'cu'); p.line('vb', vb, 'sig'); p.line('gs', gs, 'ok');
      p.text('t1', 0.1, 62, L('LS açık: şarj', 'LS on: charge'), 'muted');
      p.text('t2', 1.6, 62, L('HS açık: kaldırma', 'HS on: lift'), 'muted');
      p.text('lsw', 2.9, 44, 'V_SW', 'cu', 'end'); p.text('lvb', 2.9, 55, 'V_B', 'sig', 'end'); p.text('lgs', 2.9, 6, 'V_GS(HS)', 'ok', 'end');
      const show = t => {
        const s = state(t);
        $('bVB').textContent = 'V_B = ' + V(s.vb);
        $('bSW').textContent = 'V_SW = ' + V(s.sw, 0);
        $('bGS').textContent = s.hs ? 'V_GS = ' + V(s.vgs) : '';
        $('bPh').textContent = s.hs ? L('HS açık', 'HS on') : L('LS açık', 'LS on');
        $('bPh').setAttribute('class', 'sch-t big ' + (s.hs ? 'cu' : 'sig'));
        $('bPh2').textContent = s.hs ? L('C_boot gate’i besliyor, diyot ters', 'C_boot feeds the gate, diode reversed') : L('C_boot diyot üzerinden doluyor', 'C_boot charging through the diode');
        fC.rate = s.hs ? 0 : Math.exp(-s.ph / 0.25) * 2 + 0.05;
        fG.rate = s.hs && s.ph < 1.75 ? 1.5 : 0;
        fL.rate = s.hs ? 1 : 0;
        p.vline('cur', t, 'cu solid');
      };
      if (App.reducedMotion) show(2.2);
      else { let t = 0; App.onFrame(dt => { t = (t + dt * 0.8) % 6; show(t); }); }
    }

    /* ======================= Lab: bootstrap sizing ======================= */
    {
      const lab = root.querySelector('#lab-boot');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p = new Viz.Plot(fig, { w: 600, h: 300, x: [0, 1], y: [6, 12], xLabel: 't', yLabel: 'V_boot (V)', xFmt: v => App.si(v, 's', 2), yFmt: v => App.num(v, 0) });
      const sC = UI.slider(ctl, { label: 'C<sub>boot</sub>', min: 10e-9, max: 10e-6, step: 1e-9, value: 470e-9, log: true, unit: 'F', onInput: update });
      const sQ = UI.slider(ctl, { label: 'Q<sub>g</sub>', min: 5e-9, max: 200e-9, step: 1e-9, value: 60e-9, log: true, unit: 'C', onInput: update });
      const sIq = UI.slider(ctl, { label: 'I<sub>q</sub>', min: 10e-6, max: 2e-3, step: 1e-6, value: 150e-6, log: true, unit: 'A', onInput: update });
      const sF = UI.slider(ctl, { label: 'f<sub>PWM</sub>', min: 500, max: 200e3, step: 100, value: 20e3, log: true, unit: 'Hz', onInput: update });
      const sD = UI.slider(ctl, { label: 'Duty', min: 0.05, max: 0.998, step: 0.001, value: 0.95, fmt: v => App.num(v * 100, 1) + ' %', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'qg', label: L('Açılış başına ΔV (Q<sub>g</sub>/C)', 'ΔV per turn-on (Q<sub>g</sub>/C)') },
        { key: 'iq', label: L('Açık süre sarkması', 'On-time droop') },
        { key: 'a', label: L('Tazeleme (t<sub>off</sub> içinde)', 'Refresh (within t<sub>off</sub>)') },
        { key: 'vmin', label: L('Kalıcı V<sub>boot,min</sub>', 'Steady V<sub>boot,min</sub>') },
        { key: 'cmin', label: L('Önerilen C<sub>min</sub> (ΔV = 0,5 V)', 'Suggested C<sub>min</sub> (ΔV = 0.5 V)') },
        { key: 'ton', label: L('Maks. sürekli açık kalma', 'Max continuous on-time') }
      ]);
      const VDD = 12, VFD = 0.7, VFULL = VDD - VFD, UVLO = 8, RB = 10;
      function update() {
        const C = sC.value, Q = sQ.value, Iq = sIq.value, f = sF.value, D = sD.value;
        const T = 1 / f, ton = D * T, toff = T - ton, tau = RB * C;
        const dq = Q / C, di = Iq * ton / C, don = dq + di;
        const a = 1 - Math.exp(-toff / tau);
        const vmin = VFULL - don / a;
        const tmax = (C * (VFULL - UVLO) - Q) / Iq;
        // time-domain simulation of N periods
        const N = 24, pts = [];
        let v = VFULL;
        for (let n = 0; n < N; n++) {
          const t0 = n * T;
          pts.push([t0, v]); v -= dq; pts.push([t0 + 1e-12, v]);
          v -= di; pts.push([t0 + ton, v]);
          const v0 = v;
          for (let k = 1; k <= 6; k++) { const tt = toff * k / 6; pts.push([t0 + ton + tt, VFULL - (VFULL - v0) * Math.exp(-tt / tau)]); }
          v = VFULL - (VFULL - v0) * Math.exp(-toff / tau);
        }
        const lo = Math.min(UVLO - 1, ...pts.map(q => q[1]));
        p.setRange({ x: [0, N * T], y: [Math.max(0, Math.floor(lo)), 12] });
        p.hline('uv', UVLO, 'bad');
        p.text('uvT', N * T * 0.99, UVLO, 'UVLO 8 V', 'bad', 'end', 0, 14);
        p.hline('full', VFULL, '');
        p.text('fT', N * T * 0.99, VFULL, L('V_DD − V_F = 11,3 V', 'V_DD − V_F = 11.3 V'), 'muted', 'end', 0, -6);
        p.line('v', pts.map(q => [q[0], Math.max(q[1], -1)]), 'sig');
        ro.set('qg', App.si(dq, 'V'), dq > 1 ? 'bad' : dq > 0.5 ? 'warn' : 'ok');
        ro.set('iq', App.si(di, 'V'), di > 1 ? 'bad' : di > 0.5 ? 'warn' : 'ok');
        ro.set('a', App.num(a * 100, a < 0.1 ? 1 : 0) + ' %', a < 0.2 ? 'warn' : 'ok');
        ro.set('vmin', vmin > 0 ? V(vmin, 2) : '< 0 V', vmin < UVLO ? 'bad' : vmin < 10 ? 'warn' : 'ok');
        ro.set('cmin', App.si((Q + Iq * ton) / 0.5, 'F'));
        ro.set('ton', tmax > 0 ? App.si(tmax, 's') : L('hiç (Q<sub>g</sub> &gt; C·ΔV)', 'none (Q<sub>g</sub> &gt; C·ΔV)'), tmax > 0 ? '' : 'bad');
      }
      update();
    }
  }
});
