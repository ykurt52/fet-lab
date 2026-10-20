/* 15 — Common mistakes: 18 cards, each with an animated wrong/right schematic or mini-plot,
   then three short lines (symptom, cause, fix), an optional worked calculation and a chapter link.
   Filter by category. */
(function () {
  'use strict';

  const CATS = {
    bjt: { tr: 'BJT', en: 'BJT' },
    mosfet: { tr: 'MOSFET', en: 'MOSFET' },
    prot: { tr: 'Koruma', en: 'Protection' },
    layout: { tr: 'Yerleşim', en: 'Layout' },
    mcu: { tr: 'MCU', en: 'MCU' }
  };

  // Text of every mistake: one short sentence per line, ch = [hash, chapter number],
  // ex(L) = optional App.example data. Visual builders live in mount() under the same id.
  const M = [
    { id: 'nobase', cat: ['bjt'], ch: ['bjt-drive', '05'],
      title: { tr: 'Base direnci yok', en: 'No base resistor' },
      sym: { tr: 'GPIO pini ısınır; MCU resetlenir ya da pin ölür.', en: 'The GPIO pin runs hot; the MCU resets or the pin dies.' },
      why: { tr: 'Base–emitter bir diyottur; akımı yalnızca pinin iç direnci sınırlar.', en: 'Base–emitter is a diode; only the pin’s internal resistance limits the current.' },
      fix: { tr: 'Base’e seri direnç koy; 50 mA’lik yük için 1 kΩ yeter.', en: 'Add a series base resistor; 1 kΩ is enough for a 50 mA load.' },
      ex: L => ({
        given: [['V_GPIO', '3,3 V'], ['V_BE', '0,7 V'], ['R_B', '1 kΩ'], ['I_C', '50 mA']],
        steps: [
          [L('Base akımı', 'Base current'), 'I_B = (3,3 − 0,7) / 1 kΩ', '2,6 mA', L('pin sınırının çok altında', 'far below the pin limit')],
          [L('Zorlanmış kazanç', 'Forced gain'), 'β = 50 / 2,6', '≈ 19', L('h<sub>FE</sub>’nin altında, yani doyumda', 'below h<sub>FE</sub>, so it saturates')]
        ],
        result: L('<b>1 kΩ hem pini korur hem transistörü doyurur.</b>', '<b>1 kΩ protects the pin and still saturates the transistor.</b>'),
        level: 'ok'
      }) },
    { id: 'vth', cat: ['mosfet'], ch: ['mosfet', '03'],
      title: { tr: '“V<sub>GS(th)</sub> &lt; 3,3 V, demek ki logic-level”', en: '“V<sub>GS(th)</sub> &lt; 3.3 V, so it is logic level”' },
      sym: { tr: 'MOSFET ısınır, yük zayıf kalır; bir partide çalışır, diğerinde çalışmaz.', en: 'The MOSFET runs hot and the load is weak; one batch works, the next fails.' },
      why: { tr: 'V<sub>GS(th)</sub>’ta yalnızca 250 µA akar; IRF540N 3,3 V’ta birkaç yüz mA geçirir.', en: 'Only 250 µA flows at V<sub>GS(th)</sub>; an IRF540N passes a few hundred mA at 3.3 V.' },
      fix: { tr: 'R<sub>DS(on)</sub>’u kendi gate geriliminde garanti edilmiş bir parça seç ya da sürücü ekle.', en: 'Pick a part with R<sub>DS(on)</sub> guaranteed at your gate voltage, or add a driver.' } },
    { id: 'pulldown', cat: ['mosfet', 'prot'], ch: ['mosfet-drive', '06'],
      title: { tr: 'Gate pull-down yok', en: 'No gate pull-down' },
      sym: { tr: 'Açılışta ya da programlarken motor seğirir, LED yanıp söner.', en: 'The motor twitches at power-up or while flashing; the LED flickers.' },
      why: { tr: 'Boot sırasında pin boştadır; gürültü ve C<sub>gd</sub> gate’i eşiğin üstüne çeker.', en: 'The pin floats during boot; noise and C<sub>gd</sub> lift the gate above threshold.' },
      fix: { tr: 'Gate ile source arasına 10–100 kΩ koy; strapping pinlerini kullanma.', en: 'Put 10–100 kΩ from gate to source; avoid strapping pins.' } },
    { id: 'noflyback', cat: ['prot'], ch: ['inductive', '08'],
      title: { tr: 'Flyback diyotu yok', en: 'No flyback diode' },
      sym: { tr: 'Transistör saatler sonra kısa devre olur; MCU rastgele resetlenir.', en: 'The transistor fails short after hours; the MCU resets at random.' },
      why: { tr: 'Bobin akımı aniden duramaz; drain çığ gerilimine fırlar, enerji MOSFET’te yanar.', en: 'Coil current cannot stop instantly; the drain hits avalanche and the MOSFET absorbs the energy.' },
      fix: { tr: 'Yükün uçlarına diyot koy, katot + beslemeye; hızlı bırakma için zener ekle.', en: 'Put a diode across the load, cathode to +; add a zener for fast release.' } },
    { id: 'slowdiode', cat: ['prot'], ch: ['switching', '09'],
      title: { tr: 'PWM flyback’te yavaş 1N4007', en: 'Slow 1N4007 as a PWM flyback diode' },
      sym: { tr: 'MOSFET hesaptan çok sıcak, diyot da ısınır, EMI yüksektir.', en: 'The MOSFET runs far hotter than calculated; the diode heats and EMI is high.' },
      why: { tr: 'Yavaş diyot her açılışta mikrosaniyelerce kısa devre gibi davranır.', en: 'A slow diode acts like a short for microseconds at every turn-on.' },
      fix: { tr: 'PWM’de Schottky (SS34, 1N5819) ya da ultra hızlı diyot (UF4007) kullan.', en: 'In PWM use a Schottky (SS34, 1N5819) or an ultrafast diode (UF4007).' } },
    { id: 'pmos3v3', cat: ['mosfet'], ch: ['topologies', '07'],
      title: { tr: '12 V hatta P-MOS gate’i doğrudan 3,3 V GPIO’ya', en: 'P-MOS on a 12 V rail driven straight from a 3.3 V GPIO' },
      sym: { tr: 'Yük hiç kapanmaz; pin de zarar görebilir.', en: 'The load never turns off, and the pin may be damaged.' },
      why: { tr: 'Pin yüksekken bile V<sub>GS</sub> −8,7 V’tur; P-MOS tam açık kalır.', en: 'Even with the pin high, V<sub>GS</sub> is −8.7 V, so the P-MOS stays on.' },
      fix: { tr: 'Gate–source pull-up ve gate’i aşağı çeken küçük bir NPN ekle.', en: 'Add a gate–source pull-up and a small NPN that pulls the gate down.' },
      ex: L => ({
        given: [['V_S', '12 V'], [L('Pin yüksek', 'Pin high'), '3,3 V'], ['V_GS(th)', '−2…−4 V']],
        steps: [
          [L('Pin yüksekken', 'Pin high'), 'V_GS = 3,3 − 12', '−8,7 V', L('eşiğin çok ötesinde, yani açık', 'well past threshold, so on')],
          [L('NPN ile, pin yüksek', 'With NPN, pin high'), 'V_GS = 0 − 12', '−12 V', L('açık', 'on')],
          [L('NPN ile, pin düşük', 'With NPN, pin low'), 'V_GS = 12 − 12', '0 V', L('pull-up kapatır', 'the pull-up turns it off')]
        ],
        result: L('<b>Doğrudan GPIO ile P-MOS hiç kapanmaz.</b> NPN ve pull-up ile tam açılır, tam kapanır.', '<b>Driven straight from a GPIO, the P-MOS never turns off.</b> With an NPN and pull-up it switches fully.'),
        level: 'bad'
      }) },
    { id: 'nmoshigh', cat: ['mosfet'], ch: ['gate-drivers', '10'],
      title: { tr: 'High-side N-MOS, gate doğrudan GPIO’dan', en: 'High-side N-MOS with its gate driven from a GPIO' },
      sym: { tr: 'Yük yalnızca birkaç volt alır; MOSFET çok ısınır.', en: 'The load gets only a few volts; the MOSFET runs very hot.' },
      why: { tr: 'Devre source follower olur; source, gate’in yaklaşık 2 V altında kalır.', en: 'It becomes a source follower; the source stays about 2 V below the gate.' },
      fix: { tr: 'Low-side’a al ya da P-MOS + seviye çevirici veya bootstrap sürücü kullan.', en: 'Move it low-side, or use a P-MOS with a level shifter or a bootstrap driver.' },
      ex: L => ({
        given: [['V+', '12 V'], ['V_G', '3,3 V'], ['I_D', '0,5 A']],
        steps: [
          [L('Source gerilimi', 'Source voltage'), 'V_S ≈ 3,3 − 2', '1,3 V', L('iletmek için V<sub>GS</sub> ≈ 2 V gerekir', 'it needs V<sub>GS</sub> ≈ 2 V to conduct')],
          [L('MOSFET üzerinde', 'Across the MOSFET'), 'V_DS = 12 − 1,3', '10,7 V'],
          [L('Kayıp', 'Loss'), 'P = 10,7 V · 0,5 A', '5,4 W']
        ],
        result: L('<b>Gerilimin çoğu MOSFET’te ısıya döner.</b> Yük yalnızca 1,3 V görür.', '<b>Most of the voltage turns into heat in the MOSFET.</b> The load sees only 1.3 V.'),
        level: 'bad'
      }) },
    { id: 'follower', cat: ['bjt'], ch: ['topologies', '07'],
      title: { tr: 'Emitter follower’ı anahtar sanmak', en: 'Using an emitter follower as a switch' },
      sym: { tr: '12 V’luk yük yalnızca ~2,6 V görür; transistör ısınır.', en: 'A 12 V load sees only ~2.6 V; the transistor heats.' },
      why: { tr: 'Emitter, base’in 0,7 V altında kalır; base 3,3 V’u geçemez.', en: 'The emitter stays 0.7 V below the base, and the base cannot exceed 3.3 V.' },
      fix: { tr: 'Yükü collector’a koy (ortak emitter, low-side) ve doyuma sür.', en: 'Put the load in the collector (common emitter, low-side) and saturate it.' },
      ex: L => ({
        given: [['V+', '12 V'], ['V_B', '3,3 V'], ['V_BE', '0,7 V']],
        steps: [
          [L('Yük gerilimi', 'Load voltage'), 'V_E = 3,3 − 0,7', '2,6 V'],
          [L('Transistörde kalan', 'Left across the transistor'), 'V_CE = 12 − 2,6', '9,4 V', L('bu gerilim ısıya döner', 'this voltage becomes heat')]
        ],
        result: L('<b>Follower yükü en fazla 2,6 V’a çıkarır.</b>', '<b>A follower lifts the load to 2.6 V at most.</b>'),
        level: 'bad'
      }) },
    { id: 'darlington', cat: ['bjt'], ch: ['bjt-drive', '05'],
      title: { tr: 'Darlington düşümünü yok saymak', en: 'Ignoring the Darlington drop' },
      sym: { tr: 'TIP120 ya da ULN2003 çok ısınır; yük eksik gerilim alır.', en: 'A TIP120 or ULN2003 runs very hot; the load is under-powered.' },
      why: { tr: 'Darlington hiç doyuma girmez; 1–2 V düşürür.', en: 'A Darlington never saturates; it drops 1–2 V.' },
      fix: { tr: 'Logic-level MOSFET kullan; 3 A’de kayıp 6 W’tan 0,23 W’a iner.', en: 'Use a logic-level MOSFET; loss at 3 A falls from 6 W to 0.23 W.' },
      ex: L => ({
        given: [['I', '3 A'], ['V_CE (TIP120)', '2 V'], ['R_DS(on) (IRLZ44N)', '25 mΩ']],
        steps: [
          [L('TIP120 kaybı', 'TIP120 loss'), 'P = 2 V · 3 A', '6 W'],
          [L('MOSFET kaybı', 'MOSFET loss'), 'P = 3² · 0,025 Ω', '0,23 W'],
          [L('Oran', 'Ratio'), '6 / 0,23', '≈ 26×']
        ],
        result: L('<b>MOSFET yaklaşık 26 kat daha az ısınır.</b> Soğutucuya gerek kalmaz.', '<b>The MOSFET heats about 26 times less.</b> No heatsink needed.'),
        level: 'ok'
      }) },
    { id: 'gnd', cat: ['layout'], ch: ['switching', '09'],
      title: { tr: 'Yük dönüşüyle sinyal toprağını paylaşmak (ground bounce)', en: 'Sharing the load return with signal ground (ground bounce)' },
      sym: { tr: 'PWM kenarlarında ADC zıplar, I²C/UART hata verir, MCU resetlenir.', en: 'The ADC jumps on PWM edges, I²C/UART fails, the MCU resets.' },
      why: { tr: 'Yük izinin direnci ve endüktansı var; 5 A anahtarlamak 1 V’luk tepe yapar.', en: 'The load trace has resistance and inductance; switching 5 A makes 1 V spikes.' },
      fix: { tr: 'Yıldız toprak kullan: güç dönüşü beslemeye, MCU toprağı tek noktaya.', en: 'Use a star ground: power return to the supply, MCU ground at one point.' },
      ex: L => ({
        given: [[L('İz', 'Trace'), '20 mΩ · 10 nH'], ['ΔI', '5 A'], ['t_r', '50 ns']],
        steps: [
          [L('Dirençsel düşüm', 'Resistive drop'), 'V = 20 mΩ · 5 A', '0,1 V'],
          [L('Endüktif tepe', 'Inductive spike'), 'V = 10 nH · 5 A / 50 ns', '1 V', L('her kenarda', 'at every edge')]
        ],
        result: L('<b>MCU toprağı her kenarda 1 V zıplar.</b> 3,3 V lojik için bu çok büyük.', '<b>The MCU ground jumps 1 V at every edge.</b> That is far too much for 3.3 V logic.'),
        level: 'bad'
      }) },
    { id: 'gpiosum', cat: ['mcu'], ch: ['mcu-io', '04'],
      title: { tr: 'GPIO toplam akımını aşmak', en: 'Exceeding the total GPIO current' },
      sym: { tr: 'Her pin sınırın altında ama MCU ısınır, çıkış seviyeleri çöker.', en: 'Each pin is within limits, yet the MCU warms and output levels sag.' },
      why: { tr: 'Port grubu ve paket sınırı da vardır; pin akımları toplanır.', en: 'Port-group and package limits also apply; pin currents add up.' },
      fix: { tr: 'Yükleri transistör, ULN2003 ya da TPIC6B595 ile sür; pinlere birkaç mA bırak.', en: 'Drive loads via transistors, a ULN2003 or a TPIC6B595; leave pins a few mA.' },
      ex: L => ({
        given: [['MCU', 'ATmega328P'], [L('Pin', 'Pins'), '6'], [L('Pin başına', 'Per pin'), '30 mA']],
        steps: [
          [L('Toplam', 'Total'), '6 · 30 mA', '180 mA'],
          [L('Port grubu sınırı', 'Port-group limit'), L('datasheet', 'datasheet'), '~100–150 mA', L('aşıldı', 'exceeded')]
        ],
        result: L('<b>Pinler tek tek güvenli, toplam değil.</b>', '<b>Each pin is safe, the total is not.</b>'),
        level: 'bad'
      }) },
    { id: 'vgsmax', cat: ['mosfet', 'prot'], ch: ['topologies', '07'],
      title: { tr: '24 V hatta V<sub>GS(max)</sub>’ı aşmak', en: 'Exceeding V<sub>GS(max)</sub> on a 24 V rail' },
      sym: { tr: 'P-MOS ilk açılışta ya da birkaç gün sonra gate–source kısa devre olur.', en: 'The P-MOS fails gate–source short at first switch-on or days later.' },
      why: { tr: 'NPN gate’i 0 V’a çekince V<sub>GS</sub> −24 V olur; sınır ±20 V’tur.', en: 'When the NPN pulls the gate to 0 V, V<sub>GS</sub> is −24 V; the limit is ±20 V.' },
      fix: { tr: 'Gate’e seri R2 ile bölücü kur ya da 12–15 V zener ekle.', en: 'Add R2 in series with the gate as a divider, or a 12–15 V zener.' },
      ex: L => ({
        given: [['V_S', '24 V'], ['V_GS(max)', '±20 V'], ['R1 = R2', '10 kΩ']],
        steps: [
          [L('Bölücüsüz', 'No divider'), 'V_GS = 0 − 24', '−24 V', L('sınırın dışında', 'outside the limit')],
          [L('Bölücüyle', 'With divider'), 'V_GS = −24 · R1 / (R1 + R2)', '−12 V', L('tam açık, güvenli', 'fully on, safe')]
        ],
        result: L('<b>Bölücü V<sub>GS</sub>’yi −12 V’ta tutar.</b> MOSFET tam açılır, oksit korunur.', '<b>The divider holds V<sub>GS</sub> at −12 V.</b> The MOSFET turns fully on and the oxide survives.'),
        level: 'ok'
      }) },
    { id: 'rdsT', cat: ['mosfet'], ch: ['thermal', '13'],
      title: { tr: 'R<sub>DS(on)</sub>’un sıcaklıkla artışını unutmak', en: 'Forgetting that R<sub>DS(on)</sub> rises with temperature' },
      sym: { tr: 'Hesapta 100 °C görünen MOSFET 150 °C’yi aşar ya da kaçak ısınmayla ölür.', en: 'A MOSFET calculated at 100 °C runs above 150 °C or dies in thermal runaway.' },
      why: { tr: 'R<sub>DS(on)</sub> 100 °C’de ~1,5 katıdır; ısı kaybı, kayıp ısıyı artırır.', en: 'R<sub>DS(on)</sub> is ~1.5× higher at 100 °C; heat raises loss, loss raises heat.' },
      fix: { tr: 'Sıcak R<sub>DS(on)</sub> ile yinele; iki eğrinin kesiştiği yer gerçek T<sub>j</sub>’dir.', en: 'Iterate with the hot R<sub>DS(on)</sub>; where the curves cross is the real T<sub>j</sub>.' },
      ex: L => ({
        given: [['T_a', '40 °C'], ['R_θJA', '40 °C/W'], ['P @ 25 °C', '1,6 W'], ['R_DS(on)', '+0,6 %/°C']],
        steps: [
          [L('25 °C değeriyle', 'With the 25 °C value'), 'T = 40 + 1,6 · 40', '104 °C', L('ilk tahmin', 'first estimate')],
          [L('104 °C’deki kayıp', 'Loss at 104 °C'), 'P = 1,6 · (1 + 0,006 · 79)', '2,36 W'],
          [L('Yeni sıcaklık', 'New temperature'), 'T = 40 + 2,36 · 40', '134 °C'],
          [L('Denge', 'Equilibrium'), 'T = 104 + 0,384 · (T − 25)', '≈ 153 °C', L('birkaç turda oturur', 'settles after a few rounds')]
        ],
        result: L('<b>Gerçek T<sub>j</sub> yaklaşık 153 °C.</b> İlk tahminden 49 °C fazla.', '<b>The real T<sub>j</sub> is about 153 °C.</b> That is 49 °C above the first estimate.'),
        level: 'bad'
      }) },
    { id: 'dead', cat: ['prot', 'mosfet'], ch: ['gate-drivers', '10'],
      title: { tr: 'Yarım köprüde dead-time yok (shoot-through)', en: 'No dead-time in a half-bridge (shoot-through)' },
      sym: { tr: 'Köprü ısınır, besleme her geçişte çöker; sonunda iki MOSFET birden patlar.', en: 'The bridge heats, the supply dips at every edge, then both MOSFETs blow.' },
      why: { tr: 'Kapanma açılmadan yavaştır; iki anahtar kısa süre birlikte iletir.', en: 'Turn-off is slower than turn-on, so both switches briefly conduct together.' },
      fix: { tr: 'İkisi de kapalıyken 100 ns–1 µs bekle (IR2104 ya da tamamlayıcı PWM).', en: 'Leave 100 ns–1 µs with both off (IR2104 or complementary PWM).' } },
    { id: 'parallel', cat: ['bjt'], ch: ['bjt', '02'],
      title: { tr: 'BJT’leri emitter direnci olmadan paralellemek', en: 'Paralleling BJTs without emitter resistors' },
      sym: { tr: 'Bir transistör yükün çoğunu alır, ısınır ve ölür; ardından diğeri.', en: 'One transistor takes most of the load, overheats and dies; then the other.' },
      why: { tr: 'V<sub>BE</sub> −2 mV/°C kayar; ısınan transistör daha çok akım çeker.', en: 'V<sub>BE</sub> drifts −2 mV/°C, so the hotter transistor draws more current.' },
      fix: { tr: 'Her emitter’a 0,1–0,47 Ω koy ya da MOSFET kullan.', en: 'Put 0.1–0.47 Ω in each emitter, or use MOSFETs.' },
      ex: L => ({
        given: [[L('Transistör başına', 'Per transistor'), '1,5 A'], ['R_E', '0,22 Ω'], ['ΔT', '50 °C']],
        steps: [
          [L('V<sub>BE</sub> kayması', 'V<sub>BE</sub> drift'), 'ΔV = 50 °C · 2 mV/°C', '0,1 V'],
          [L('R<sub>E</sub> geri beslemesi', 'R<sub>E</sub> feedback'), 'V = 0,22 Ω · 1,5 A', '0,33 V', L('kaymadan 3 kat büyük', '3× larger than the drift')]
        ],
        result: L('<b>R<sub>E</sub> kaymayı bastırır, akım eşit paylaşılır.</b>', '<b>R<sub>E</sub> swamps the drift, so the current shares evenly.</b>'),
        level: 'ok'
      }) },
    { id: 'bigrg', cat: ['mosfet'], ch: ['mosfet-drive', '06'],
      title: { tr: 'Büyük gate direnci + yüksek PWM frekansı', en: 'Huge gate resistor + high PWM frequency' },
      sym: { tr: 'Düşük akımda bile MOSFET ısınır; parlaklık duty’yi tuhaf izler.', en: 'The MOSFET heats even at low current; brightness tracks duty oddly.' },
      why: { tr: 'Gate RC sabiti PWM yarım periyoduna yakın; gate hiç tam dolmaz.', en: 'The gate RC constant is close to the PWM half-period; the gate never fully charges.' },
      fix: { tr: 'R<sub>G</sub> = 10–100 Ω kullan; 10 kΩ yalnızca pull-down içindir.', en: 'Use R<sub>G</sub> = 10–100 Ω; 10 kΩ belongs in the pull-down.' },
      ex: L => ({
        given: [['R_G', '10 kΩ'], ['C_iss', '2 nF'], ['f_PWM', '20 kHz']],
        steps: [
          [L('Zaman sabiti', 'Time constant'), 'τ = 10 kΩ · 2 nF', '20 µs'],
          [L('Yarım periyot', 'Half period'), 't = 1 / (2 · 20 kHz)', '25 µs', L('τ ile neredeyse eşit', 'almost equal to τ')],
          [L('47 Ω ile', 'With 47 Ω'), 'τ = 47 Ω · 2 nF', '94 ns']
        ],
        result: L('<b>10 kΩ ile gate zamanının çoğunu lineer bölgede geçirir.</b> 47 Ω ile geçiş 1 µs’den kısa sürer.', '<b>With 10 kΩ the gate spends most of its time in the linear region.</b> With 47 Ω the edge takes under 1 µs.'),
        level: 'bad'
      }) },
    { id: 'ringing', cat: ['layout'], ch: ['gate-drivers', '10'],
      title: { tr: 'Uzun gate kabloları → çınlama/osilasyon', en: 'Long gate wires → ringing/oscillation' },
      sym: { tr: 'Gate’te MHz’lik çınlama, EMI ve ısınma; bazen V<sub>GS(max)</sub> aşılır.', en: 'MHz ringing on the gate, EMI and heating; sometimes V<sub>GS(max)</sub> is exceeded.' },
      why: { tr: '20 cm kablo ve C<sub>iss</sub> zayıf sönümlü bir RLC devresi kurar.', en: '20 cm of wire and C<sub>iss</sub> form a lightly damped RLC circuit.' },
      fix: { tr: 'Sürücüyü MOSFET’in dibine koy ve 5–22 Ω gate direnci ekle.', en: 'Place the driver right at the MOSFET and add 5–22 Ω of gate resistance.' },
      ex: L => ({
        given: [[L('Kablo', 'Wire'), '200 nH'], ['C_iss', '2 nF'], ['R', '2 Ω']],
        steps: [
          [L('Rezonans', 'Resonance'), 'f₀ = 1 / (2π · √(200 nH · 2 nF))', '8,0 MHz'],
          [L('Sönüm', 'Damping'), 'ζ = 2/2 · √(2 nF / 200 nH)', '0,10', L('ζ &lt; 0,5 → büyük aşım', 'ζ &lt; 0.5 → large overshoot')],
          [L('Kısa iz + 10 Ω', 'Short trace + 10 Ω'), 'ζ = 10/2 · √(2 nF / 20 nH)', '1,6', L('aşım yok', 'no overshoot')]
        ],
        result: L('<b>Kısa iz ve küçük gate direnci çınlamayı söndürür.</b>', '<b>A short trace and a small gate resistor kill the ringing.</b>'),
        level: 'ok'
      }) },
    { id: 'inrush', cat: ['prot'], ch: ['inrush', '11'],
      title: { tr: 'Kapasitif inrush MCU’yu resetliyor', en: 'Capacitive inrush resets the MCU' },
      sym: { tr: 'Büyük kapasitörlü bir modülü açtığın anda MCU resetlenir.', en: 'The MCU resets the moment you switch on a module with a big capacitor.' },
      why: { tr: 'Boş kapasitör kısa devre gibidir; ani akımda besleme hattı çöker.', en: 'An empty capacitor acts like a short; the rail collapses under the surge.' },
      fix: { tr: 'Yumuşak açılış, yük anahtarı IC, eFuse ya da NTC kullan.', en: 'Use soft start, a load-switch IC, an eFuse or an NTC.' },
      ex: L => ({
        given: [['C', '1000 µF'], ['V', '12 V'], [L('Kaynak + anahtar', 'Source + switch'), '0,55 Ω']],
        steps: [
          [L('Anlık akım', 'Instant current'), 'I = 12 V / 0,55 Ω', '≈ 22 A'],
          [L('10 ms rampa ile', 'With a 10 ms ramp'), 'I = 1000 µF · 12 V / 10 ms', '1,2 A']
        ],
        result: L('<b>10 ms’lik rampa akımı 18 kat azaltır.</b> MCU hattı ayakta kalır.', '<b>A 10 ms ramp cuts the current 18-fold.</b> The MCU rail stays up.'),
        level: 'ok'
      }) }
  ];

  App.page({
    id: 'mistakes',
    num: '15',
    group: { tr: 'Uygulama', en: 'Practice' },
    title: { tr: 'Sık yapılan hatalar', en: 'Common mistakes' },
    blurb: { tr: '18 klasik hata: yanlış/doğru şema, belirti, neden, çözüm.', en: '18 classic mistakes: wrong/right schematic, symptom, cause, fix.' },
    summary: {
      tr: 'Bu hataların çoğu masada çalışır, sahada bozulur. Her kartta yanlış ve doğru devreyi karşılaştır.',
      en: 'Most of these mistakes work on the bench and fail in the field. Compare the wrong and right circuit on each card.'
    },
    render(L) {
      const t = App.t, ic = App.icon || (() => '');
      const row = (cls, icon, label, text) => `
                <li class="mrow ${cls}"><span class="mic">${ic(icon)}</span><div><span class="mlbl">${label}</span><p>${text}</p></div></li>`;
      const html = `
        <style>
          [data-page="mistakes"] .mbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; justify-content: space-between; margin: 10px 0 4px; }
          [data-page="mistakes"] .mbar .ctl { min-width: min(100%, 420px); }
          [data-page="mistakes"] .mbar .kbd-row { align-items: center; }
          [data-page="mistakes"] .mgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr)); gap: 18px; margin-top: 16px; align-items: start; }
          [data-page="mistakes"] .mcard { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r); display: flex; flex-direction: column; overflow: hidden; min-width: 0; transition: border-color .2s; }
          [data-page="mistakes"] .mcard[data-mode="bad"] { border-color: color-mix(in srgb, var(--bad) 35%, var(--line)); }
          [data-page="mistakes"] .mcard[data-mode="good"] { border-color: color-mix(in srgb, var(--ok) 35%, var(--line)); }
          [data-page="mistakes"] .mcard header { display: flex; gap: 10px; align-items: baseline; padding: 12px 16px; border-bottom: 1px solid var(--line); }
          [data-page="mistakes"] .mnum { font: 600 .8rem var(--f-mono); color: var(--muted); }
          [data-page="mistakes"] .mcard h3 { margin: 0; font-size: 1rem; line-height: 1.35; flex: 1; }
          [data-page="mistakes"] .mcats { display: flex; gap: 4px; flex-wrap: wrap; }
          [data-page="mistakes"] .mseg { padding: 12px 16px 0; }
          [data-page="mistakes"] .mseg .seg button { font-weight: 600; }
          [data-page="mistakes"] .mcard[data-mode="bad"] .seg button[aria-pressed="true"] { background: var(--bad); color: var(--surface); }
          [data-page="mistakes"] .mcard[data-mode="good"] .seg button[aria-pressed="true"] { background: var(--ok); color: var(--surface); }
          [data-page="mistakes"] .mfig { padding: 8px 12px 4px; }
          [data-page="mistakes"] .mrows { list-style: none; margin: 0; padding: 4px 16px 4px !important; display: grid; gap: 12px; }
          [data-page="mistakes"] .mrow { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; align-items: start; margin: 0 !important; max-width: none !important; }
          [data-page="mistakes"] .mic { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; }
          [data-page="mistakes"] .mic .ic { width: 16px; height: 16px; }
          [data-page="mistakes"] .mrow.sym .mic { background: var(--warn-soft); color: var(--warn); }
          [data-page="mistakes"] .mrow.why .mic { background: var(--accent-soft); color: var(--signal); }
          [data-page="mistakes"] .mrow.fix .mic { background: var(--ok-soft); color: var(--ok); }
          [data-page="mistakes"] .mlbl { display: block; font: 600 .68rem/1.4 var(--f-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
          [data-page="mistakes"] .mrow p { margin: 1px 0 0; font-size: .9rem; line-height: 1.5; color: var(--ink-2); max-width: none; }
          [data-page="mistakes"] .mrow.fix p { color: var(--ink); }
          [data-page="mistakes"] .mfoot { padding: 6px 16px 16px; display: grid; gap: 10px; }
          [data-page="mistakes"] .mfoot details.fold { margin: 0; }
          [data-page="mistakes"] .mfoot details.fold > summary { font-size: .88rem; padding: 8px 12px; }
          [data-page="mistakes"] .mfoot details.fold > div { padding: 0 12px 4px; }
          [data-page="mistakes"] .mfoot .ex { margin: 4px 0 8px; }
          [data-page="mistakes"] .mfoot ol.calc > li { grid-template-columns: 22px minmax(0, 1fr) auto; gap: 4px 10px; padding: 9px 12px; }
          [data-page="mistakes"] .mfoot ol.calc .c-f { grid-column: 2 / -1; grid-row: 2; font-size: .84rem; }
          [data-page="mistakes"] .mfoot .ex-given .kv { font-size: .78rem; }
          [data-page="mistakes"] .mlink { display: inline-flex; align-items: center; gap: 6px; font-size: .86rem; font-weight: 600; }
          [data-page="mistakes"] .mlink .ic { width: 15px; height: 15px; }
          [data-page="mistakes"] .schem .heat { fill: var(--bad); stroke: none; opacity: 0; filter: blur(6px); }
          [data-page="mistakes"] .schem .wire.badw { stroke: var(--bad); }
          [data-page="mistakes"] .schem .tw { fill: none; stroke: var(--signal); stroke-width: 1.6; }
          [data-page="mistakes"] .schem .cur { stroke: var(--muted); stroke-width: 1; stroke-dasharray: 3 3; }
          [data-page="mistakes"] .mcount { font: 500 .8rem var(--f-mono); color: var(--muted); }
        </style>
        ${App.keys([
          L('Her endüktif yüke bir söndürme yolu ver: diyot, zener ya da TVS.', 'Give every inductive load a decay path: diode, zener or TVS.'),
          L('Her gate’e pull-down koy; boot sırasında pin boşta kalır.', 'Put a pull-down on every gate; the pin floats during boot.'),
          L('V<sub>GS(th)</sub>’a değil, R<sub>DS(on)</sub>’un garanti edildiği gerilime bak.', 'Check the voltage where R<sub>DS(on)</sub> is guaranteed, not V<sub>GS(th)</sub>.'),
          L('High-side anahtarın gate’ini seviye çeviriciyle sür.', 'Drive a high-side switch’s gate through a level shifter.'),
          L('Tipik değerle değil, en kötü durumla hesapla.', 'Design for the worst case, not typical values.')
        ])}
        <div class="call info"><strong>${L('Nasıl kullanılır?', 'How to use')}</strong>
          ${L('Her kartta <b>✗ Yanlış</b> ile <b>✓ Doğru</b> arasında geçiş yap. Kırmızı tehlike, bakır yük akımı, mavi kontrol sinyalidir.',
              'Flip each card between <b>✗ Wrong</b> and <b>✓ Right</b>. Red is danger, copper is load current, blue is the control signal.')}</div>
        <div class="mbar"><div id="mFilter"></div><div class="kbd-row"><span class="mcount" id="mCount"></span><span id="mAll"></span></div></div>
        <div class="mgrid">
          ${M.map((m, i) => `
            <article class="mcard" id="mc-${m.id}" data-cat="${m.cat.join(' ')}" data-mode="bad">
              <header><span class="mnum">${String(i + 1).padStart(2, '0')}</span><h3>${t(m.title)}</h3>
                <span class="mcats">${m.cat.map(c => `<span class="pill">${t(CATS[c])}</span>`).join('')}</span></header>
              <div class="mseg"></div>
              <div class="mfig"></div>
              <ul class="mrows">${row('sym', 'warn', L('Belirti', 'Symptom'), t(m.sym))}${row('why', 'info', L('Neden', 'Cause'), t(m.why))}${row('fix', 'check', L('Çözüm', 'Fix'), t(m.fix))}
              </ul>
              <div class="mfoot">
                ${m.ex ? `<details class="fold"><summary>${L('Hesap', 'The numbers')}</summary><div>${App.example(m.ex(L))}</div></details>` : ''}
                <a class="mlink" href="#${m.ch[0]}">${ic('book')}${L('Bölüm', 'Chapter')} ${m.ch[1]}</a>
              </div>
            </article>`).join('')}
        </div>
        <div class="call tip"><strong>${L('Ortak payda', 'The common thread')}</strong>
          ${L('Hataların çoğu “tipik” değerle tasarlamaktan doğar. Minimum h<sub>FE</sub>, maksimum V<sub>GS(th)</sub>, sıcak R<sub>DS(on)</sub> ve boot anındaki pin durumuyla hesapla. Örnekler <a href="#examples">Bölüm 14</a>’te, formüller <a href="#reference">Bölüm 16</a>’da.',
              'Most mistakes come from designing with “typical” values. Use minimum h<sub>FE</sub>, maximum V<sub>GS(th)</sub>, hot R<sub>DS(on)</sub> and the pin state at boot. Examples are in <a href="#examples">Chapter 14</a>, formulas in <a href="#reference">Chapter 16</a>.')}</div>`;
      return App.lang === 'en' ? html.replace(/(\d),(\d)/g, '$1.$2') : html;
    },

    mount(root, App) {
      const { Viz } = App, { Sch: S, UI } = Viz, L = App.L;
      const n = (v, d) => App.num(v, d);
      const dec = s => App.lang === 'en' ? s.replace(/(\d),(\d)/g, '$1.$2') : s;

      /* ----- per-card builders: (bad, c) → tick(dt, t) | null ----- */
      const B = {
        nobase(bad, c) {
          const svg = c.svg(320, 180, `
            ${bad ? '<circle class="heat" cx="148" cy="124" r="22"/><circle class="heat" cx="80" cy="124" r="16"/>' : ''}
            ${S.vcc(200, 24, '+12 V')}${S.w([[200, 24], [200, 34]])}${S.load(200, 64, 0, '50 mA')}
            ${S.npn(180, 124, '')}${S.gnd(200, 154)}
            ${S.box(10, 99, 70, 50, 'GPIO', dec('3,3 V'))}
            ${bad ? S.w([[80, 124], [150, 124]], 'sigw') : S.w([[80, 124], [85, 124]], 'sigw') + S.res(115, 124, 90, '') + S.w([[145, 124], [150, 124]], 'sigw')}
            ${bad ? S.text(115, 112, 'I_B ≫ 20 mA!', 'bad', 'middle') + S.text(115, 168, L('sınır: pin direnci', 'limit: pin resistance'), 'bad', 'middle')
                  : S.text(115, 110, '1 kΩ', '', 'middle') + S.text(115, 168, dec('I_B ≈ 2,6 mA'), 'sig', 'middle')}
            ${S.text(310, 120, bad ? L('pin aşırı yük', 'pin overloaded') : L('doyumda', 'saturated'), bad ? 'bad' : 'ok', 'end')}
          `);
          c.flow(svg, 'M200,24V168', { spacing: 13 });
          const fb = c.flow(svg, 'M80,124H150', { cls: bad ? 'flow bad' : 'flow e', spacing: 10, speed: bad ? 150 : 50 });
          fb.rate = bad ? 2.6 : 0.7;
          const heats = svg.querySelectorAll('.heat');
          return (dt, t) => heats.forEach(h => { h.style.opacity = (0.35 + 0.25 * Math.sin(t * 6)).toFixed(2); });
        },

        vth(bad, c) {
          const p = c.plot({ x: [0, 5], y: [0, 10], xLabel: 'V_GS (V)', yLabel: 'I_D (A)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
          const vt = bad ? 2.6 : 1.0, k = bad ? 4 : 8;
          const f = v => v <= vt ? 0 : Math.min(12, 0.5 * k * (v - vt) * (v - vt));
          p.line('c', Viz.sample(f, 0, 5, 160), bad ? 'bad' : 'cu');
          p.vline('g', 3.3, 'sig');
          p.hline('need', 5, 'faint');
          p.text('gt', 3.35, 9.4, dec('GPIO 3,3 V'), 'sig');
          p.text('nt', 0.1, 5, L('yükün istediği 5 A', 'load needs 5 A'), 'muted', 'start', 0, -5);
          p.text('th', 0.1, 8.2, bad ? dec('V_GS(th) = 2–4 V @ 250 µA') : dec('R_DS(on) @ 2,5 V garanti'), bad ? 'bad' : 'ok');
          return (dt, t) => {
            const v = Math.min(3.3, (t % 3.2) * 1.5);
            p.dot('d', v, Math.min(f(v), 9.9), bad ? 'bad' : '');
            p.text('dv', v, Math.min(f(v), 9.9), 'I_D = ' + n(f(v), 1) + ' A', bad ? 'bad' : 'cu', v > 2 ? 'end' : 'start', v > 2 ? -8 : 8, -8);
          };
        },

        pulldown(bad, c) {
          const p = c.plot({ x: [0, 3], y: [0, 4.2], xLabel: L('zaman (s)', 'time (s)'), yLabel: 'V (V)', xFmt: v => n(v, 1), yFmt: v => n(v, 0) });
          p.rect('boot', 0, 0, 1, 4.2, 'warn');
          p.text('bt', 0.05, 3.95, L('boot: pin Hi-Z', 'boot: pin Hi-Z'), 'muted');
          p.text('fw', 2.05, 3.95, L('firmware AÇ', 'firmware ON'), 'muted');
          p.hline('vth', 1.6, 'faint');
          p.text('vt', 2.95, 1.6, 'V_th', 'muted', 'end', 0, -4);
          const vg = t => t < 1 ? (bad ? Math.max(0, 1.1 + 0.9 * Math.sin(7 * t) + 0.6 * Math.sin(23 * t + 1)) : 0.02) : (t < 2 ? 0.02 : 3.3);
          const im = t => App.clamp((vg(t) - 1.6) / 1.2, 0, 1) * 2.6;
          const xs = Viz.sample(x => x, 0, 3, 300).map(q => q[0]);
          p.text('l1', 1.05, 3.5, 'V_G', 'sig');
          p.text('l2', 1.05, 3.05, 'I_motor', 'cu');
          return (dt, t) => {
            const tc = (t * 0.9) % 3.4;
            const vis = xs.filter(x => x <= tc);
            p.line('g', vis.map(x => [x, vg(x)]), 'sig');
            p.line('m', vis.map(x => [x, im(x)]), 'cu');
            p.vline('cur', Math.min(tc, 3), '');
            const tw = bad && tc < 1 && im(tc) > 0.05;
            p.text('tw', 0.5, 0.25, tw ? L('motor seğiriyor!', 'motor twitches!') : '', 'bad', 'middle');
          };
        },

        noflyback(bad, c) {
          const svg = c.svg(320, 190, `
            <circle class="heat" cx="196" cy="130" r="24"/>
            ${S.vcc(200, 26, '+12 V')}${S.w([[200, 26], [200, 30]])}
            ${S.ind(200, 60, 0, '')}${S.text(188, 64, L('bobin', 'coil'), '', 'end')}
            ${S.w([[200, 90], [200, 100]])}
            ${S.nmos(180, 130, '')}${S.gnd(200, 160)}
            ${S.box(10, 105, 70, 50, 'GPIO', '')}${S.w([[80, 130], [150, 130]], 'sigw')}
            ${bad ? '' : S.dot(200, 26) + S.w([[200, 26], [260, 26], [260, 30]]) + S.diode(260, 60, 180, '') + S.dot(200, 95) + S.w([[200, 95], [260, 95], [260, 90]])}
            <text class="sch-t big" x="312" y="150" text-anchor="end" id="st"></text>
            <text class="sch-t" x="312" y="168" text-anchor="end" id="st2"></text>
          `);
          const fm = c.flow(svg, 'M200,26V160', { spacing: 13 });
          const ff = bad ? null : c.flow(svg, 'M200,26V95H260V26Z', { spacing: 13 });
          const fa = bad ? c.flow(svg, 'M200,92V160', { cls: 'flow bad', spacing: 8, speed: 160 }) : null;
          const fg = c.flow(svg, 'M80,130H150', { cls: 'flow e', spacing: 12, speed: 90 });
          const heat = svg.querySelector('.heat'), st = svg.querySelector('#st'), st2 = svg.querySelector('#st2');
          let i = 0, spike = 0, prev = false;
          return (dt, t) => {
            const on = (t % 2) < 1;
            if (prev && !on) spike = bad ? 0.4 : 0;
            if (prev !== on) fg.rate = 1.6; else fg.rate = Math.max(0, fg.rate - dt * 6);
            fg.dir = on ? 1 : -1;
            prev = on;
            if (on) i += (1 - i) * Math.min(1, dt / 0.2);
            else if (bad) i = 0; else i += -i * Math.min(1, dt / 0.3);
            spike = Math.max(0, spike - dt);
            fm.rate = on ? i : 0;
            if (ff) ff.rate = on ? 0 : i;
            if (fa) fa.rate = spike > 0 ? 2.5 : 0;
            heat.style.opacity = spike > 0 ? 0.7 : 0;
            if (bad) {
              st.textContent = spike > 0 ? L('V_DS → çığ! (≫ 60 V)', 'V_DS → avalanche! (≫ 60 V)') : (on ? L('AÇIK', 'ON') : L('KAPALI', 'OFF'));
              st.setAttribute('class', 'sch-t big ' + (spike > 0 ? 'bad' : ''));
              st2.textContent = L('enerji MOSFET’te yanar', 'energy burns in the MOSFET');
            } else {
              st.textContent = on ? L('AÇIK', 'ON') : dec('V_DS ≈ 12,8 V');
              st.setAttribute('class', 'sch-t big ' + (on ? 'cu' : 'ok'));
              st2.textContent = on ? '' : L('akım diyotta döner', 'current loops in the diode');
            }
          };
        },

        slowdiode(bad, c) {
          const p = c.plot({ x: [-0.5, 4], y: [-0.5, 9], xLabel: L('MOSFET açıldıktan sonra (µs)', 'after MOSFET turn-on (µs)'), yLabel: 'I_D (A)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
          const IL = 2, Irr = bad ? 5.5 : 0.5, tp = bad ? 0.5 : 0.03, td = bad ? 0.6 : 0.03;
          const f = t => t < 0 ? 0 : IL * (1 - Math.exp(-t / 0.03)) + Irr * (t < tp ? t / tp : Math.exp(-(t - tp) / td));
          const pts = Viz.sample(f, -0.5, 4, 400);
          p.area('rr', pts.filter(q => q[0] >= 0).map(q => [q[0], Math.max(IL, q[1])]), bad ? 'bad' : 'ok', IL);
          p.hline('il', IL, 'faint');
          p.text('ilt', 3.9, IL, L('yük akımı 2 A', 'load current 2 A'), 'muted', 'end', 0, -5);
          p.text('nm', 3.9, 8.2, bad ? L('1N4007: t_rr ~ µs, Q_rr büyük', '1N4007: t_rr ~ µs, large Q_rr') : L('SS34 Schottky: Q_rr ≈ 0', 'SS34 Schottky: Q_rr ≈ 0'), bad ? 'bad' : 'ok', 'end');
          p.text('pk', bad ? 0.6 : 0.1, f(tp), L('tepe ', 'peak ') + n(f(tp), 1) + ' A', bad ? 'bad' : 'cu', 'start', 8, -4);
          return (dt, t) => {
            const tc = -0.5 + ((t * 1.1) % 5);
            p.line('i', pts.filter(q => q[0] <= tc), bad ? 'bad' : 'cu');
            p.vline('cur', Math.min(tc, 4), '');
          };
        },

        pmos3v3(bad, c) {
          const svg = c.svg(320, 200, `
            ${S.vcc(220, 22, '+12 V')}${S.w([[220, 22], [220, 60]])}
            ${S.pmos(200, 90, '')}${S.load(220, 150, 0, '')}${S.gnd(220, 180)}
            ${bad ? S.w([[30, 90], [170, 90]], 'sigw') + S.text(30, 82, 'GPIO', 'sig', 'start')
                  : S.dot(220, 30) + S.w([[140, 30], [220, 30]]) + S.res(140, 60, 0, '') + S.text(128, 64, '10 kΩ', '', 'end')
                    + S.w([[140, 90], [170, 90]]) + S.dot(140, 90) + S.w([[140, 90], [140, 120]]) + S.npn(120, 150, '') + S.gnd(140, 180)
                    + S.res(60, 150, 90, '') + S.text(60, 172, '10 kΩ', '', 'middle') + S.text(8, 140, 'GPIO', 'sig', 'start')}
            <text id="t1" x="316" y="70" class="sch-t sig" text-anchor="end"></text>
            <text id="t2" x="316" y="88" class="sch-t" text-anchor="end"></text>
            <text id="t3" x="316" y="108" class="sch-t big" text-anchor="end"></text>
          `);
          const fl = c.flow(svg, 'M220,22V180', { spacing: 13 });
          const fn = bad ? null : c.flow(svg, 'M140,30V180', { cls: 'flow e', spacing: 14, speed: 40 });
          const fb = bad ? null : c.flow(svg, 'M30,150H90', { cls: 'flow e', spacing: 12, speed: 40 });
          const [t1, t2, t3] = ['#t1', '#t2', '#t3'].map(s => svg.querySelector(s));
          return (dt, t) => {
            const hi = (t % 2.4) < 1.2;
            const vg = bad ? (hi ? 3.3 : 0) : (hi ? 0.1 : 12);
            const vgs = vg - 12, on = vgs < -2;
            fl.rate = on ? 1 : 0;
            if (fn) { fn.rate = hi ? 0.6 : 0; fb.rate = hi ? 0.6 : 0; }
            t1.textContent = 'GPIO: ' + (hi ? dec('3,3 V') : '0 V');
            t2.textContent = 'V_GS: ' + n(vgs, 1) + ' V';
            t3.textContent = on ? (bad && !hi ? L('hâlâ AÇIK!', 'still ON!') : L('AÇIK', 'ON')) : L('KAPALI', 'OFF');
            t3.setAttribute('class', 'sch-t big ' + (bad ? 'bad' : on ? 'cu' : 'ok'));
          };
        },

        nmoshigh(bad, c) {
          const svg = c.svg(320, 180, bad ? `
            <circle class="heat" cx="196" cy="70" r="26"/>
            ${S.vcc(200, 26, '+12 V')}${S.w([[200, 26], [200, 40]])}
            ${S.nmos(180, 70, '')}${S.load(200, 130, 0, '')}${S.gnd(200, 160)}
            ${S.w([[30, 70], [150, 70]], 'sigw')}${S.text(30, 62, dec('GPIO 3,3 V'), 'sig', 'start')}
            ${S.text(312, 64, dec('V_DS ≈ 10,7 V'), 'bad', 'end')}${S.text(312, 134, dec('V_load ≈ 1,3 V'), 'bad', 'end')}
            ${S.text(312, 82, dec('P = 10,7 V × I'), 'bad', 'end')}
          ` : `
            ${S.vcc(200, 26, '+12 V')}${S.w([[200, 26], [200, 34]])}
            ${S.load(200, 64, 0, '')}${S.nmos(180, 124, '')}${S.gnd(200, 154)}
            ${S.w([[30, 124], [150, 124]], 'sigw')}${S.text(30, 116, dec('GPIO 3,3 V'), 'sig', 'start')}
            ${S.text(312, 68, dec('V_load ≈ 12 V'), 'ok', 'end')}${S.text(312, 128, 'V_DS = I·R_DS(on)', 'ok', 'end')}
          `);
          const f = c.flow(svg, 'M200,26V' + (bad ? 160 : 154), { spacing: 13 });
          f.rate = bad ? 0.3 : 1.1;
          const heat = svg.querySelector('.heat');
          return heat ? (dt, t) => { heat.style.opacity = (0.45 + 0.2 * Math.sin(t * 4)).toFixed(2); } : null;
        },

        follower(bad, c) {
          const p = c.plot({ x: [0, 3.3], y: [0, 12.5], xLabel: 'V_GPIO (V)', yLabel: L('V_yük (V)', 'V_load (V)'), xFmt: v => n(v, 1), yFmt: v => n(v, 0) });
          const fF = v => Math.max(0, v - 0.7);
          const fS = v => 11.8 * App.clamp((v - 0.62) / 0.13, 0, 1);
          const f = bad ? fF : fS;
          p.line('o', Viz.sample(bad ? fS : fF, 0, 3.3, 200), 'faint dash');
          p.line('c', Viz.sample(f, 0, 3.3, 200), bad ? 'bad' : 'cu');
          p.hline('v12', 12, 'faint');
          p.text('t12', 0.05, 12, L('besleme 12 V', 'supply 12 V'), 'muted', 'start', 0, -4);
          p.text('lab', 3.25, bad ? 3.6 : 10.6, bad ? L('emitter follower: en fazla 2,6 V', 'emitter follower: 2.6 V max') : L('ortak emitter: 11,8 V', 'common emitter: 11.8 V'), bad ? 'bad' : 'ok', 'end');
          return (dt, t) => {
            const v = Math.min(3.3, (t % 3) * 1.4);
            p.dot('d', v, f(v), bad ? 'bad' : '');
          };
        },

        darlington(bad, c) {
          const p = c.plot({ x: [0, 2], y: [0, 7], xTicks: [], xLabel: '', yLabel: L('kayıp @ 3 A (W)', 'loss @ 3 A (W)'), yFmt: v => n(v, 0) });
          const items = [{ x: 0.5, P: 6, lbl: 'TIP120', sub: dec('V_CE ≈ 2 V'), mine: bad }, { x: 1.5, P: 0.23, lbl: 'IRLZ44N @ 5 V', sub: dec('25 mΩ → 0,075 V'), mine: !bad }];
          items.forEach((it, i) => {
            p.text('n' + i, it.x, 0, it.lbl, it.mine ? (bad ? 'bad' : 'ok') : 'muted', 'middle', 0, 16);
          });
          let g = 0;
          return (dt) => {
            g = Math.min(1, g + dt / 0.8);
            items.forEach((it, i) => {
              const h = it.P * (it.mine ? g : 1);
              p.rect('b' + i, it.x - 0.28, 0, it.x + 0.28, Math.max(h, 0.04), it.mine ? (bad ? 'bad' : 'ok') : '');
              p.text('v' + i, it.x, h, n(h, 2) + ' W', it.mine ? (bad ? 'bad' : 'ok') : 'muted', 'middle', 0, -6);
              p.text('s' + i, it.x, 0, it.sub, 'muted', 'middle', 0, 28);
            });
          };
        },

        gnd(bad, c) {
          const tap = bad
            ? S.w([[110, 130], [110, 148], [220, 148], [220, 170]], 'badw') + S.dot(220, 170)
            : S.w([[110, 130], [110, 148], [50, 148], [50, 170]]) + S.dot(50, 170);
          const svg = c.svg(320, 200, `
            ${S.vsrc(30, 100, '')}${S.w([[30, 70], [30, 34], [240, 34]])}
            ${S.load(240, 64, 0, '')}${S.nmos(220, 124, '')}
            ${S.w([[240, 154], [240, 170], [200, 170]])}${S.res(170, 170, 90, '')}${S.w([[140, 170], [30, 170], [30, 130]])}
            ${S.text(170, 194, L('iz: 20 mΩ + 10 nH', 'trace: 20 mΩ + 10 nH'), 'muted', 'middle')}
            ${S.box(70, 90, 80, 40, 'MCU', '')}
            ${S.w([[150, 110], [170, 110], [170, 124], [190, 124]], 'sigw')}
            ${tap}
            <text id="gt" x="110" y="80" class="sch-t big" text-anchor="middle"></text>
            ${S.text(44, 22, bad ? L('MCU toprağı yük izinin ortasında', 'MCU ground taps the load trace') : L('yıldız toprak: tek nokta', 'star ground: one point'), bad ? 'bad' : 'ok', 'start')}
          `);
          const fl = c.flow(svg, 'M30,70V34H240V170H30V130', { spacing: 13 });
          const gt = svg.querySelector('#gt');
          let prev = false, b = 0;
          return (dt, t) => {
            const on = (t % 1.2) < 0.6;
            if (on !== prev) { b = 1; prev = on; }
            b = Math.max(0, b - dt * 4);
            fl.rate = on ? 1.1 : 0;
            if (bad) {
              const v = (on ? 0.1 : 0) + b * (on ? 0.9 : -0.9);
              gt.textContent = 'GND_MCU: ' + (v >= 0 ? '+' : '') + n(v, 2) + ' V';
              gt.setAttribute('class', 'sch-t big ' + (Math.abs(v) > 0.2 ? 'bad' : 'cu'));
            } else { gt.textContent = 'GND_MCU: 0 V'; gt.setAttribute('class', 'sch-t big ok'); }
          };
        },

        gpiosum(bad, c) {
          const p = c.plot({ x: [0, 8], y: [0, 200], xTicks: [], xLabel: '', yLabel: L('akım (mA)', 'current (mA)'), yFmt: v => n(v, 0) });
          p.hline('pin', 40, 'bad'); p.text('pinT', 0.2, 40, L('pin mutlak maks. 40 mA', 'pin abs. max 40 mA'), 'bad', 'start', 0, -4);
          p.hline('port', 150, 'bad'); p.text('portT', 0.2, 150, L('port grubu ~100–150 mA', 'port group ~100–150 mA'), 'bad', 'start', 0, -4);
          const each = bad ? 30 : 2;
          for (let i = 1; i <= 6; i++) p.text('l' + i, i - 0.3, 0, 'P' + i, 'muted', 'middle', 0, 14);
          p.text('lt', 7.2, 0, 'Σ', 'muted', 'middle', 0, 14);
          let g = 0;
          return (dt) => {
            g = Math.min(1, g + dt / 1.0);
            for (let i = 1; i <= 6; i++) p.rect('b' + i, i - 0.62, 0, i + 0.02, Math.max(1, each * Math.min(1, g * 6 - (i - 1) * 0.7)), bad ? 'warn' : 'ok');
            const tot = each * 6 * g;
            p.rect('bt', 6.75, 0, 7.65, Math.max(1, tot), bad && tot > 150 ? 'bad' : bad ? 'warn' : 'ok');
            p.text('tt', 7.2, tot, n(tot, 0) + ' mA', bad && tot > 150 ? 'bad' : 'ok', 'middle', 0, -6);
          };
        },

        vgsmax(bad, c) {
          const svg = c.svg(320, 200, `
            ${bad ? '<circle class="heat" cx="172" cy="88" r="20"/>' : ''}
            ${S.vcc(220, 22, '+24 V')}${S.w([[220, 22], [220, 58]])}${S.dot(220, 28)}${S.w([[150, 28], [220, 28]])}
            ${S.res(150, 58, 0, '')}${S.text(138, 62, 'R1', '', 'end')}
            ${S.w([[150, 88], [170, 88]])}${S.dot(150, 88)}
            ${S.pmos(200, 88, '')}${S.load(220, 148, 0, '')}${S.gnd(220, 178)}
            ${bad ? S.w([[80, 88], [150, 88]]) : S.w([[80, 88], [85, 88]]) + S.res(115, 88, 90, '') + S.w([[145, 88], [150, 88]]) + S.text(115, 76, 'R2', '', 'middle')}
            ${S.npn(60, 118, '')}${S.gnd(80, 148)}
            ${S.w([[8, 118], [30, 118]], 'sigw')}${S.text(6, 108, 'GPIO', 'sig', 'start')}
            <text id="t1" x="316" y="70" class="sch-t big" text-anchor="end"></text>
            <text id="t2" x="316" y="88" class="sch-t" text-anchor="end"></text>
            <text id="t3" x="316" y="104" class="sch-t" text-anchor="end"></text>
          `);
          const fl = c.flow(svg, 'M220,22V178', { spacing: 13 });
          const heat = svg.querySelector('.heat');
          const [t1, t2, t3] = ['#t1', '#t2', '#t3'].map(s => svg.querySelector(s));
          return (dt, t) => {
            const hi = (t % 2.4) < 1.2;
            const vgs = hi ? (bad ? -23.9 : -11.95) : 0;
            fl.rate = hi ? 1 : 0;
            t1.textContent = 'V_GS = ' + n(vgs, 1) + ' V';
            t1.setAttribute('class', 'sch-t big ' + (hi ? (bad ? 'bad' : 'ok') : ''));
            t2.textContent = 'V_GS(max) = ±20 V';
            t3.textContent = hi ? (bad ? L('oksit delinir!', 'oxide breaks down!') : L('R1 = R2 → yarısı', 'R1 = R2 → half')) : '';
            t3.setAttribute('class', 'sch-t ' + (bad ? 'bad' : 'ok'));
            if (heat) heat.style.opacity = hi ? (0.4 + 0.25 * Math.sin(t * 8)).toFixed(2) : 0;
          };
        },

        rdsT(bad, c) {
          const p = c.plot({ x: [25, 200], y: [0, 4.5], xLabel: 'T_j (°C)', yLabel: 'P (W)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
          const Ta = 40, Rth = 40, P25 = 1.6;
          const gen = T => bad ? P25 : P25 * (1 + 0.006 * (T - 25));
          const rem = T => (T - Ta) / Rth;
          p.rect('hot', 150, 0, 200, 4.5, 'bad');
          p.line('rem', [[Ta, 0], [200, rem(200)]], 'sig');
          p.text('remT', 196, rem(196), L('soğutma (T−T_a)/R_θ', 'cooling (T−T_a)/R_θ'), 'sig', 'end', 0, 14);
          p.line('gen', Viz.sample(gen, 25, 200, 60), bad ? 'faint dash' : 'cu');
          p.text('genT', 30, gen(30) + 0.25, bad ? L('R_DS(on) sabit (25 °C)', 'R_DS(on) fixed (25 °C)') : L('I²·R_DS(on)(T)', 'I²·R_DS(on)(T)'), bad ? 'muted' : 'cu');
          // equilibrium
          let T = 25; const steps = [[25, 0]];
          for (let k = 0; k < 14; k++) { const P = gen(T); steps.push([T, P]); T = Ta + P * Rth; steps.push([T, P]); }
          const Teq = T;
          let g = 0;
          return (dt) => {
            g = Math.min(steps.length, g + dt * 3);
            p.line('cob', steps.slice(0, Math.max(2, Math.floor(g))), bad ? 'bad thin' : 'ok thin');
            if (g >= steps.length - 1) {
              p.dot('eq', Teq, gen(Teq), bad ? 'bad' : '');
              p.text('eqT', Teq, gen(Teq), (bad ? L('tahmin ', 'estimate ') : L('gerçek ', 'real ')) + n(Teq, 0) + ' °C', bad ? 'bad' : 'cu', 'end', -8, -8);
            }
          };
        },

        dead(bad, c) {
          // timing diagram in the right part of the SVG, x 190..310 = one period
          const X = ph => 190 + ph * 120;
          const hs = [[0, 0.5]], ls = bad ? [[0.44, 1], [0, 0.06]] : [[0.56, 0.94]];
          const wave = (segs, yLo, yHi) => {
            const on = ph => segs.some(s => ph >= s[0] && ph < s[1]);
            let d = '', prevOn = null;
            for (let i = 0; i <= 120; i++) {
              const ph = i / 120, o = on(Math.min(ph, 0.9999));
              const y = o ? yHi : yLo;
              if (prevOn === null) d += `M${X(ph)},${y}`;
              else if (o !== prevOn) d += `L${X(ph)},${prevOn ? yHi : yLo}L${X(ph)},${y}`;
              prevOn = o;
            }
            return d + `L${X(1)},${prevOn ? yHi : yLo}`;
          };
          const svg = c.svg(320, 190, `
            <circle class="heat" cx="118" cy="95" r="34"/>
            ${S.vcc(120, 22, '+12 V')}${S.w([[120, 22], [120, 32]])}
            ${S.nmos(100, 62, '')}${S.nmos(100, 128, '')}
            ${S.w([[120, 92], [120, 98]])}${S.dot(120, 95)}${S.w([[120, 95], [165, 95]])}${S.text(168, 99, 'OUT', 'muted', 'start')}
            ${S.gnd(120, 158)}
            ${S.w([[40, 62], [70, 62]], 'sigw')}${S.w([[40, 128], [70, 128]], 'sigw')}
            ${S.text(36, 66, 'HS', 'sig', 'end')}${S.text(36, 132, 'LS', 'sig', 'end')}
            <path class="tw" d="${wave(hs, 132, 116)}"/><path class="tw" d="${wave(ls, 162, 146)}"/>
            ${S.text(186, 128, 'HS', 'sig', 'end')}${S.text(186, 158, 'LS', 'sig', 'end')}
            ${bad ? `<rect x="${X(0.44)}" y="112" width="${X(0.5) - X(0.44)}" height="54" style="fill:var(--bad-soft)"/><rect x="${X(0)}" y="112" width="${X(0.06) - X(0)}" height="54" style="fill:var(--bad-soft)"/>`
                  : `<rect x="${X(0.5)}" y="112" width="${X(0.56) - X(0.5)}" height="54" style="fill:var(--ok-soft)"/><rect x="${X(0.94)}" y="112" width="${X(1) - X(0.94)}" height="54" style="fill:var(--ok-soft)"/>`}
            <line id="cur" class="cur" x1="190" x2="190" y1="108" y2="170"/>
            <text id="st" x="250" y="60" class="sch-t big" text-anchor="middle"></text>
            <text id="st2" x="250" y="78" class="sch-t" text-anchor="middle"></text>
            ${S.text(250, 184, bad ? L('örtüşme = kısa devre', 'overlap = short circuit') : L('dead-time boşlukları', 'dead-time gaps'), bad ? 'bad' : 'ok', 'middle')}
          `);
          const fH = c.flow(svg, 'M120,22V95H165', { spacing: 12 });
          const fL = c.flow(svg, 'M120,158V95H165', { spacing: 12 });
          const fS = c.flow(svg, 'M120,22V158', { cls: 'flow bad', spacing: 8, speed: 170 });
          const heat = svg.querySelector('.heat'), cur = svg.querySelector('#cur'), st = svg.querySelector('#st'), st2 = svg.querySelector('#st2');
          const isOn = (segs, ph) => segs.some(s => ph >= s[0] && ph < s[1]);
          return (dt, t) => {
            const ph = (t / 3) % 1;
            const h = isOn(hs, ph), l = isOn(ls, ph);
            cur.setAttribute('x1', X(ph)); cur.setAttribute('x2', X(ph));
            fS.rate = h && l ? 3 : 0;
            fH.rate = h && !l ? 1 : 0;
            fL.rate = !h && l ? 1 : (!h && !l ? 0.7 : 0);
            heat.style.opacity = h && l ? 0.8 : 0;
            st.textContent = h && l ? 'SHOOT-THROUGH!' : h ? L('üst açık', 'high side on') : l ? L('alt açık', 'low side on') : 'dead-time';
            st.setAttribute('class', 'sch-t big ' + (h && l ? 'bad' : !h && !l ? 'ok' : 'cu'));
            st2.textContent = !h && !l ? L('akım body diyottan', 'current via body diode') : '';
          };
        },

        parallel(bad, c) {
          const em = bad
            ? S.w([[90, 154], [90, 216]]) + S.w([[230, 154], [230, 216]])
            : S.w([[90, 154], [90, 156]]) + S.res(90, 186, 0, '') + S.w([[230, 154], [230, 156]]) + S.res(230, 186, 0, '') + S.text(102, 190, dec('0,22 Ω'), '', 'start') + S.text(242, 190, dec('0,22 Ω'), '', 'start');
          const svg = c.svg(320, 240, `
            <circle class="heat" id="h1" cx="76" cy="124" r="26"/><circle class="heat" id="h2" cx="216" cy="124" r="26"/>
            ${S.vcc(150, 24, '+12 V')}${S.load(150, 54, 0, '3 A')}${S.w([[150, 84], [150, 94]])}${S.dot(150, 94)}${S.w([[90, 94], [230, 94]])}
            ${S.npn(70, 124, '')}${S.npn(210, 124, '')}
            ${S.w([[14, 124], [40, 124]], 'sigw')}${S.w([[154, 124], [180, 124]], 'sigw')}
            ${em}${S.w([[90, 216], [230, 216]])}${S.dot(160, 216)}${S.gnd(160, 216)}
            <text id="q1" x="8" y="30" class="sch-t big"></text><text id="q2" x="8" y="48" class="sch-t big"></text>
            ${S.text(316, 30, bad ? L('ısınan daha çok çeker', 'the hotter one hogs') : L('R_E dengeler', 'R_E balances'), bad ? 'bad' : 'ok', 'end')}
          `);
          c.flow(svg, 'M150,24V94', { spacing: 13 });
          const f1 = c.flow(svg, 'M150,94H90V216H160', { spacing: 13 });
          const f2 = c.flow(svg, 'M150,94H230V216H160', { spacing: 13 });
          const h1 = svg.querySelector('#h1'), h2 = svg.querySelector('#h2'), q1 = svg.querySelector('#q1'), q2 = svg.querySelector('#q2');
          let s = 0.52, tt = 0;
          return (dt) => {
            tt += dt;
            if (bad) { s += (s - 0.5) * 0.9 * dt; if (s > 0.9 || tt > 7) { s = 0.52; tt = 0; } }
            else s = 0.51 + 0.01 * Math.sin(tt);
            f1.rate = 2 * s; f2.rate = 2 * (1 - s);
            h1.style.opacity = App.clamp((s - 0.5) * 2.5, 0, 0.8).toFixed(2);
            h2.style.opacity = 0;
            q1.textContent = 'Q1: ' + n(3 * s, 2) + ' A · ' + n(40 + 60 * s * 1.6, 0) + ' °C';
            q2.textContent = 'Q2: ' + n(3 * (1 - s), 2) + ' A · ' + n(40 + 60 * (1 - s) * 1.6, 0) + ' °C';
            q1.setAttribute('class', 'sch-t big ' + (s > 0.65 ? 'bad' : 'cu'));
            q2.setAttribute('class', 'sch-t big cu');
          };
        },

        bigrg(bad, c) {
          const p = c.plot({ x: [0, 100], y: [0, 5.6], xLabel: L('zaman (µs), 20 kHz', 'time (µs), 20 kHz'), yLabel: 'V_GS (V)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
          p.rect('lin', 0, 2, 100, 4, 'warn');
          p.text('linT', 99, 3, L('lineer bölge', 'linear region'), 'muted', 'end');
          const tau = bad ? 20 : 0.094, V = 5, per = 50;
          const pts = []; let v = 0, inLin = 0, cnt = 0;
          for (let i = 0; i <= 2000; i++) {
            const t = i * 0.05, drv = (t % per) < per / 2 ? V : 0;
            v += (drv - v) * (1 - Math.exp(-0.05 / tau));
            if (i % 4 === 0) pts.push([t, v]);
            if (t > 50) { cnt++; if (v > 2 && v < 4) inLin++; }
          }
          const frac = inLin / cnt;
          p.line('drv', [[0, 5], [25, 5], [25, 0], [50, 0], [50, 5], [75, 5], [75, 0], [100, 0]], 'faint dash');
          p.text('fr', 50, 5.3, (bad ? 'R_G = 10 kΩ' : 'R_G = 47 Ω') + ' · ' + L('lineerde: ', 'in linear: ') + n(frac * 100, 0) + ' %', bad ? 'bad' : 'ok', 'middle');
          return (dt, t) => {
            const tc = (t * 30) % 115;
            p.line('v', pts.filter(q => q[0] <= tc), bad ? 'bad' : 'sig');
            p.vline('cur', Math.min(tc, 100), '');
          };
        },

        ringing(bad, c) {
          const p = c.plot({ x: [0, 400], y: [0, 21], xLabel: L('zaman (ns)', 'time (ns)'), yLabel: 'V_GS (V)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
          const Lg = bad ? 200e-9 : 20e-9, R = bad ? 2 : 10, C = 2e-9, V = 10;
          const pts = []; let i = 0, v = 0; const h = 0.02e-9;
          for (let k = 0; k <= 20000; k++) {
            const di = (V - R * i - v) / Lg * h; const dv = i / C * h;
            i += di; v += dv;
            if (k % 50 === 0) pts.push([k * h * 1e9, v]);
          }
          const zeta = R / 2 * Math.sqrt(C / Lg), f0 = 1 / (2 * Math.PI * Math.sqrt(Lg * C));
          p.hline('max', 20, 'bad'); p.text('maxT', 395, 20, 'V_GS(max) = 20 V', 'bad', 'end', 0, -4);
          p.hline('drv', 10, 'faint');
          p.text('par', 395, 3, `L = ${bad ? 200 : 20} nH, R = ${R} Ω → ζ = ${n(zeta, 2)}, f₀ = ${n(f0 / 1e6, 1)} MHz`, bad ? 'bad' : 'ok', 'end');
          const pk = Math.max(...pts.map(q => q[1]));
          p.text('pk', 395, 17, L('tepe ', 'peak ') + n(pk, 1) + ' V', bad ? 'bad' : 'ok', 'end');
          return (dt, t) => {
            const tc = (t * 120) % 470;
            p.line('v', pts.filter(q => q[0] <= tc), bad ? 'bad' : 'sig');
            p.vline('cur', Math.min(tc, 400), '');
          };
        },

        inrush(bad, c) {
          const p = c.plot({ x: [0, 14], y: [0, 13], xLabel: L('zaman (ms)', 'time (ms)'), yLabel: 'V (V)', xFmt: v => n(v, 0), yFmt: v => n(v, 0) });
          const Rs = 0.5, Rsw = 0.05, Cl = 1e-3, tau = (Rs + Rsw) * Cl * 1e3;
          const vr = t => t < 1 ? 12 : bad ? 12 - Rs * (12 / (Rs + Rsw)) * Math.exp(-(t - 1) / tau) : (t < 11 ? 12 - Rs * 1.2 : 12);
          const v3 = t => Math.min(3.3, Math.max(0, vr(t) - 0.6));
          p.hline('bod', 2.7, 'bad'); p.text('bodT', 13.9, 2.7, L('brown-out 2,7 V', 'brown-out 2.7 V'), 'bad', 'end', 0, -4);
          p.text('l1', 13.9, 12.4, L('12 V hattı', '12 V rail'), 'cu', 'end');
          p.text('l2', 13.9, 4.2, L('MCU 3,3 V', 'MCU 3.3 V'), 'sig', 'end');
          p.text('ev', 1.1, 7, bad ? L('anahtar açıldı: ~22 A', 'switch on: ~22 A') : L('10 ms rampa: 1,2 A', '10 ms ramp: 1.2 A'), bad ? 'bad' : 'ok');
          const xs = Viz.sample(x => x, 0, 14, 700).map(q => q[0]);
          return (dt, t) => {
            const tc = (t * 3.5) % 16;
            const vis = xs.filter(x => x <= tc);
            p.line('r', vis.map(x => [x, vr(x)]), 'cu');
            p.line('m', vis.map(x => [x, v3(x)]), 'sig');
            p.vline('cur', Math.min(tc, 14), '');
            const reset = bad && tc > 1 && tc < 6;
            p.text('rs', 3.2, 1.2, reset ? 'RESET!' : '', 'bad big');
          };
        }
      };

      /* ----- card wiring ----- */
      const cards = [];
      M.forEach(m => {
        const el = root.querySelector('#mc-' + m.id);
        const fig = el.querySelector('.mfig');
        const card = { m, el, fig, flows: [], tick: null, t: 0, visible: true, onScreen: false };
        const ctx = {
          svg: (W, H, inner) => Viz.schematic(fig, W, H, inner),
          flow: (svg, d, o) => { const f = new Viz.Flow(svg, d, o); card.flows.push(f); return f; },
          plot: o => new Viz.Plot(fig, Object.assign({ w: 320, h: 200, margin: { l: 42, r: 10, t: 12, b: 34 } }, o))
        };
        card.build = mode => {
          card.flows.forEach(f => { f.stop(); f.g.remove(); f.path.remove(); });
          card.flows = [];
          fig.innerHTML = '';
          el.dataset.mode = mode;
          card.t = 0;
          card.tick = B[m.id](mode === 'bad', ctx);
          if (card.tick) card.tick(0, 0);
        };
        card.seg = UI.segmented(el.querySelector('.mseg'), {
          options: [{ value: 'bad', label: L('✗ Yanlış', '✗ Wrong') }, { value: 'good', label: L('✓ Doğru', '✓ Right') }],
          value: 'bad', onChange: v => card.build(v)
        });
        card.build('bad');
        cards.push(card);
      });

      /* only animate cards that are on screen and not filtered out */
      let io = null;
      if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(es => es.forEach(e => {
          const cd = cards.find(c => c.el === e.target); if (cd) cd.onScreen = e.isIntersecting;
        }), { rootMargin: '100px' });
        cards.forEach(c => io.observe(c.el));
      } else cards.forEach(c => { c.onScreen = true; });

      App.onFrame(dt => {
        cards.forEach(c => {
          const live = c.visible && c.onScreen;
          if (!live) { c.flows.forEach(f => { if (f.rate) { f._r = f.rate; f.rate = 0; } }); c.paused = true; return; }
          if (c.paused) { c.flows.forEach(f => { if (f._r) { f.rate = f._r; f._r = 0; } }); c.paused = false; }
          c.t += dt;
          if (c.tick) c.tick(dt, c.t);
        });
      });

      /* filter + global switches */
      const count = root.querySelector('#mCount');
      const applyFilter = v => {
        let k = 0;
        cards.forEach(c => { c.visible = v === 'all' || c.m.cat.includes(v); c.el.hidden = !c.visible; if (c.visible) k++; });
        count.textContent = k + ' / ' + cards.length;
      };
      UI.segmented(root.querySelector('#mFilter'), {
        label: L('Kategori', 'Category'),
        options: [{ value: 'all', label: L('Hepsi', 'All') }].concat(Object.keys(CATS).map(k => ({ value: k, label: App.t(CATS[k]) }))),
        value: 'all', onChange: applyFilter
      });
      applyFilter('all');
      const allBox = root.querySelector('#mAll');
      UI.button(allBox, { label: L('Hepsi yanlış', 'All wrong'), onClick: () => cards.forEach(c => c.seg.set('bad')) });
      UI.button(allBox, { label: L('Hepsi doğru', 'All right'), kind: 'primary', onClick: () => cards.forEach(c => c.seg.set('good')) });
      allBox.style.display = 'flex'; allBox.style.gap = '6px';

      return () => { if (io) io.disconnect(); };
    }
  });
})();
