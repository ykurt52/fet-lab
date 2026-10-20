/* 01 — Know your load: Ohm/power, resistive, LED, lamp, motor, relay, capacitive; steady/peak/RMS; ratings with margin */
App.page({
  id: 'loads',
  num: '01',
  group: { tr: 'Temeller', en: 'Fundamentals' },
  title: { tr: 'Yükü tanı: akım ve güç hesabı', en: 'Know your load: current and power' },
  blurb: { tr: 'Direnç, LED, lamba, motor, röle: sürekli, tepe ve RMS akım; anahtar değerlerini seçmek.', en: 'Resistor, LED, lamp, motor, relay: steady, peak and RMS current; picking switch ratings.' },
  summary: {
    tr: 'Transistörü değil, önce yükü tanı. Sürekli akım, açılıştaki tepe akım, PWM altındaki RMS akım ve kapatışta ne olacağı anahtarı belirler. Bu bölüm her yük tipinin akımını hesaplar ve anahtar değerlerini paylı seçer.',
    en: 'Know the load before the transistor. Its steady current, switch-on peak, RMS current under PWM and turn-off behaviour decide the switch. This chapter computes each load’s current and picks switch ratings with margin.'
  },
  render(L) {
    return `
      ${App.keys([
        L('Anahtarı yük seçer: sürekli, tepe ve RMS akımı ayrı ayrı bul.', 'The load picks the switch: find steady, peak and RMS current separately.'),
        L('Lamba ve motor açılışta 5–15 kat akım çeker.', 'Lamps and motors draw 5–15× current at switch-on.'),
        L('PWM’de ısınmayı ortalama değil RMS akım belirler.', 'Under PWM, RMS current sets the heating, not the average.'),
        L('Endüktif yük kapatışta gerilim sıçratır: flyback diyot şart.', 'Inductive loads spike at turn-off: a flyback diode is mandatory.'),
        L('Gerilimde × 1,5–2, akımda × 2 pay bırak.', 'Leave × 1.5–2 margin on voltage, × 2 on current.')
      ])}

      <h2>${L('Neden önce yük?', 'Why the load first?')}</h2>
      <p>${L('Transistör yalnızca bir anahtardır. Akımı, gerilimi ve ısınmayı <b>yük</b> belirler. “IRLZ44N 47 A’lik, her şeyi sürer” demek yerine dört soru sor:',
             'A transistor is only a switch. The <b>load</b> sets its current, voltage and heating. Instead of “the IRLZ44N is rated 47 A, it drives anything”, ask four questions:')}</p>
      <ul>
        <li>${L('<b>Sürekli akım</b> ne kadar? Ohm yasası, datasheet ya da ölçüm.', 'What is the <b>steady current</b>? Ohm’s law, datasheet or measurement.')}</li>
        <li>${L('<b>Tepe akım</b> ne kadar, ne kadar sürüyor? Soğuk flaman, motor kalkışı, kondansatör şarjı.', 'What is the <b>peak current</b> and how long does it last? Cold filament, motor start, capacitor charging.')}</li>
        <li>${L('PWM varsa <b>RMS akım</b> ne kadar? Isınmayı RMS belirler.', 'Under PWM, what is the <b>RMS current</b>? Heating follows RMS.')}</li>
        <li>${L('Kapatınca ne olur? Motor, röle ve solenoid <b>gerilim sıçraması</b> üretir.', 'What happens at turn-off? Motors, relays and solenoids produce a <b>voltage spike</b>.')}</li>
      </ul>

      <div class="eq">I = V / R &nbsp;&nbsp;&nbsp; P = V · I = <b>I² · R</b> = V² / R
        <span class="note">${L('Akım iki katına çıkınca güç dört katına çıkar. Transistör kaybını bu yüzden hep I²·R ile düşünürüz.',
                              'Double the current and the power quadruples. That is why we treat transistor loss as I²·R.')}</span></div>

      ${App.lab('lab-calc', L('Yük hesaplayıcı', 'Load calculator'), {
        foot: L('Öneri kaba bir başlangıçtır. Gerilim: besleme × 1,5 (endüktifte × 2), bir üst standart değer. Akım: sürekli × 2; tepe akımı I<sub>DM</sub> karşılamalı. Isınmayı Bölüm 13’te kontrol et. LED V<sub>f</sub> sabit kabul edildi.',
                'The suggestion is a rough start. Voltage: supply × 1.5 (× 2 if inductive), next standard rating. Current: steady × 2; I<sub>DM</sub> must cover the peak. Check heating in Chapter 13. LED V<sub>f</sub> is assumed fixed.')
      })}

      <h2>${L('Dirençsel yükler: ısıtıcı, direnç, sabit yük', 'Resistive loads: heaters, resistors, fixed loads')}</h2>
      <p>${L('En kolay yük budur. Akım doğrudan V/R’dir; açılışta tepe, kapatışta sıçrama yoktur.',
             'This is the easy one. The current is simply V/R; there is no surge at turn-on and no spike at turn-off.')}</p>
      <ul>
        <li>${L('Nikrom ısıtıcı telinin direnci sıcaklıkla az değişir.', 'Nichrome heater wire barely changes resistance with temperature.')}</li>
        <li>${L('<b>Tungsten lamba</b> ve bazı PTC ısıtıcılar soğukken çok farklı dirençtedir.', '<b>Tungsten lamps</b> and some PTC heaters have a very different resistance when cold.')}</li>
        <li>${L('Kablo da yükün parçasıdır: 2 m, 0,5 mm² gidiş-dönüş ≈ 0,14 Ω, 5 A’de 0,7 V düşürür.', 'Wiring is part of the load: 2 m of 0.5 mm² there and back ≈ 0.14 Ω, dropping 0.7 V at 5 A.')}</li>
      </ul>

      <h2>${L('LED’ler: seri direnç hesabı', 'LEDs: the series resistor')}</h2>
      <p>${L('LED’e <b>gerilim değil, akım</b> verilir. V<sub>f</sub> aşılınca akım üstel artar. Seri direnç, besleme ile LED gerilimi arasındaki farkı üstlenir.',
             'Feed an LED a <b>current, not a voltage</b>. Above V<sub>f</sub> its current rises exponentially. A series resistor takes up the difference between supply and LED voltage.')}</p>
      <div class="eq">R = (V<sub>S</sub> − n · V<sub>f</sub>) / I<sub>f</sub> &nbsp;&nbsp;&nbsp; P<sub>R</sub> = I<sub>f</sub>² · R
        <span class="note">${L('n = seri LED sayısı. Tipik V<sub>f</sub>: kırmızı 1,9–2,1 V; yeşil, mavi, beyaz 2,8–3,3 V. Direnç gücünde en az 2 kat pay bırak.',
                              'n = LEDs in series. Typical V<sub>f</sub>: red 1.9–2.1 V; green, blue, white 2.8–3.3 V. Rate the resistor with at least 2× margin.')}</span></div>
      <p>${L('<b>LED şerit</b> aynı fikrin tekrarıdır. 12 V şeritte her segment 3 LED + 1 dirençtir ve segmentler paraleldir.',
             'An <b>LED strip</b> repeats the same idea. On a 12 V strip each segment is 3 LEDs + 1 resistor, all segments in parallel.')}</p>
      <div class="call warn"><strong>${L('Paralel LED’e ortak direnç koyma', 'No shared resistor on parallel LEDs')}</strong>
        ${L('V<sub>f</sub>’si düşük olan LED akımın çoğunu çeker ve ısınır. Isınınca V<sub>f</sub> daha da düşer ve önce o yanar.',
            'The LED with the lowest V<sub>f</sub> takes most of the current and heats up. Its V<sub>f</sub> then drops further, and it dies first.')}</div>

      <h2>${L('Lambalar: soğuk flaman ve inrush', 'Lamps: the cold filament and inrush')}</h2>
      <p>${L('Akkor lamba açılışta çalışma akımının ≈ 10 katını çeker. Soğuk tungsten flamanın direnci sıcak değerinin 1/10–1/15’idir. Tepe birkaç on ms’de söner, ama anahtar ve sigorta onu kaldırmalı.',
             'An incandescent lamp draws ≈ 10× its running current at switch-on. A cold tungsten filament has 1/10–1/15 of its hot resistance. The peak dies within tens of ms, but switch and fuse must survive it.')}</p>
      ${App.example({
        given: [[L('Lamba', 'Lamp'), '12 V, 5 W'], ['R<sub>' + L('soğuk', 'cold') + '</sub>', 'R<sub>' + L('sıcak', 'hot') + '</sub> / 10']],
        steps: [
          [L('Sıcak direnç', 'Hot resistance'), 'R = 12² / 5', L('28,8 Ω', '28.8 Ω')],
          [L('Çalışma akımı', 'Running current'), L('I = 12 / 28,8', 'I = 12 / 28.8'), L('0,42 A', '0.42 A')],
          [L('Soğuk direnç', 'Cold resistance'), L('R = 28,8 / 10', 'R = 28.8 / 10'), L('≈ 2,9 Ω', '≈ 2.9 Ω')],
          [L('Açılış akımı', 'Switch-on current'), L('I = 12 / 2,9', 'I = 12 / 2.9'), L('≈ 4,2 A', '≈ 4.2 A')]
        ],
        result: L('<b>Anahtar ve sigorta 4,2 A tepeyi kaldırmalı.</b> Sürekli akım yalnızca 0,42 A olsa da.', '<b>Switch and fuse must survive a 4.2 A peak.</b> Even though the steady current is only 0.42 A.'),
        level: 'warn'
      })}
      ${App.figure('fig-lamp', L('Lamba açılışı: soğuk flaman ≈ 10× akım çeker', 'Lamp switch-on: a cold filament draws ≈ 10× current'), {
        foot: L('Model: 12 V 5 W lamba, R<sub>soğuk</sub> = R<sub>sıcak</sub>/10, ısıl zaman sabiti ≈ 200 ms. Animasyon ≈ 6× ağır çekimdir. Inrush sınırlama: Bölüm 11.',
                'Model: 12 V 5 W lamp, R<sub>cold</sub> = R<sub>hot</sub>/10, thermal time constant ≈ 200 ms. Animation runs ≈ 6× slower. Limiting inrush: Chapter 11.')
      })}

      <h2>${L('DC motorlar: kalkış, çalışma ve kilitlenme akımı', 'DC motors: start, running and stall current')}</h2>
      <p>${L('Motor kalkışta çalışma akımının 5–10 katını çeker. Duran motorda akımı yalnızca sargı direnci sınırlar.',
             'A motor draws 5–10× its running current at start. At standstill only the winding resistance limits the current.')}</p>
      <ul>
        <li>${L('Fırçalı motor = sargı direnci R + endüktans L + <b>zıt EMK</b> E = k·ω.', 'A brushed motor = winding resistance R + inductance L + <b>back-EMF</b> E = k·ω.')}</li>
        <li>${L('Duran motorda ω = 0: akım V/R olur. Bu <b>kalkış / stall</b> akımıdır.', 'At standstill ω = 0, so the current is V/R. This is the <b>start / stall</b> current.')}</li>
        <li>${L('Motor hızlandıkça zıt EMK beslemeye yaklaşır ve akım düşer.', 'As the motor speeds up, back-EMF approaches the supply and the current falls.')}</li>
      </ul>
      <div class="eq">I(t) = (V − <b>k · ω(t)</b>) / R &nbsp;&nbsp;&nbsp; I<sub>stall</sub> = V / R &nbsp;&nbsp;&nbsp; T = k · I
        <span class="note">${L('k: motor sabiti, V·s/rad ya da N·m/A ile aynı sayı. Sargı direncini mili birkaç konuma çevirip ölç, en düşüğü al.',
                              'k: motor constant, the same number in V·s/rad or N·m/A. Measure the winding resistance at a few shaft positions and take the lowest.')}</span></div>
      ${App.lab('lab-motor', L('Motor kalkışı: zıt EMK akımı nasıl düşürür?', 'Motor start: how back-EMF brings the current down'), {
        foot: L('Model: R = 2 Ω, k = 0,02 V·s/rad, J = 2·10<sup>−5</sup> kg·m², τ<sub>m</sub> = J·R/k² = 100 ms. Sürtünme ve endüktans ihmal. “Tekrar oynat” zamanı ağır çekimde tarar.',
                'Model: R = 2 Ω, k = 0.02 V·s/rad, J = 2·10<sup>−5</sup> kg·m², τ<sub>m</sub> = J·R/k² = 100 ms. Friction and inductance neglected. “Replay” sweeps time in slow motion.')
      })}
      <div class="call warn"><strong>${L('Anahtarı kilitlenme akımına göre seç', 'Size the switch for stall current')}</strong>
        ${L('Her kalkışta motor kısa süre I<sub>stall</sub> çeker. Mil sıkışırsa bu akım sürekli olur. Sürekli stall için akım sınırlama gerekir (Bölüm 12).',
            'At every start the motor briefly draws I<sub>stall</sub>. If the shaft jams, that current becomes continuous. Continuous stall needs current limiting (Chapter 12).')}</div>

      <h2>${L('Röle ve solenoidler: bobin akımı', 'Relays and solenoids: coil current')}</h2>
      <p>${L('Bobin akımı küçüktür, ama kapatışta yüzlerce volt üretir. Her bobine <b>flyback diyot</b> gerekir (Bölüm 08).',
             'Coil current is small, but turn-off produces hundreds of volts. Every coil needs a <b>flyback diode</b> (Chapter 08).')}</p>
      <ul>
        <li>${L('DC akım yine V/R: 5 V bobin ≈ 70 Ω → 71 mA; 12 V bobin ≈ 400 Ω → 30 mA.', 'DC current is again V/R: 5 V coil ≈ 70 Ω → 71 mA; 12 V coil ≈ 400 Ω → 30 mA.')}</li>
        <li>${L('Açılışta akım L/R ile yavaş yükselir; tepe, sürekli akımı aşmaz.', 'At turn-on the current rises slowly with L/R; the peak never exceeds the steady value.')}</li>
        <li>${L('Kapatışta akım aniden kesilemez; bobin gerilimi fırlar.', 'At turn-off the current cannot stop instantly; the coil voltage flies up.')}</li>
        <li>${L('Solenoidde armatür çekildikten sonra PWM ile akım %30–50’ye indirilebilir.', 'On a solenoid, PWM can cut the hold current to 30–50 % once the armature has moved.')}</li>
      </ul>

      <h2>${L('Kapasitif yükler: görünmeyen inrush', 'Capacitive loads: the hidden inrush')}</h2>
      <p>${L('Girişinde büyük kondansatör olan her modül açılışta büyük akım çeker. Akım i = C·dV/dt’dir; hızlı anahtarda onu yalnızca kablo ve ESR sınırlar. Bölüm 11’de gate’i yavaşlatarak bu akımı kontrol ediyoruz.',
             'Any module with big input capacitors draws a large current at switch-on. The current is i = C·dV/dt; with a fast switch only wiring and ESR limit it. Chapter 11 controls it by slowing the gate.')}</p>
      ${App.example({
        given: [['C', '1000 µF'], ['V', '12 V'], ['Δt', '1 ms']],
        steps: [
          [L('Ortalama şarj akımı', 'Average charging current'), 'I = C · ΔV / Δt = 1000 µF · 12 V / 1 ms', '12 A']
        ],
        result: L('<b>1 ms’lik yumuşak açılış bile 12 A ister.</b> Nanosaniyelik açılışta tepe çok daha büyüktür.', '<b>Even a 1 ms soft start needs 12 A.</b> A nanosecond switch-on peaks far higher.'),
        level: 'warn'
      })}

      <div class="table-wrap"><table>
        <thead><tr><th>${L('Yük', 'Load')}</th><th>${L('Sürekli akım', 'Steady current')}</th><th>${L('Tepe akım', 'Peak current')}</th><th>${L('Kapatışta', 'At turn-off')}</th><th>${L('Bölüm', 'Chapter')}</th></tr></thead>
        <tbody>
          <tr><td>${L('Direnç / ısıtıcı', 'Resistor / heater')}</td><td>V/R</td><td>≈ V/R</td><td>${L('sorun yok', 'no issue')}</td><td>13</td></tr>
          <tr><td>LED (+R)</td><td>(V − nV<sub>f</sub>)/R</td><td>≈ ${L('aynı', 'same')}</td><td>${L('sorun yok', 'no issue')}</td><td>06, 09</td></tr>
          <tr><td>${L('Akkor lamba', 'Incandescent lamp')}</td><td>P/V</td><td class="bad">${L('10–15 × (ms’ler)', '10–15 × (ms)')}</td><td>${L('sorun yok', 'no issue')}</td><td>11</td></tr>
          <tr><td>${L('DC motor', 'DC motor')}</td><td>${L('yüke bağlı', 'load-dependent')}</td><td>V/R<sub>${L('sargı', 'winding')}</sub> (5–10 ×)</td><td>${L('endüktif sıçrama', 'inductive spike')}</td><td>08, 12</td></tr>
          <tr><td>${L('Röle / solenoid', 'Relay / solenoid')}</td><td>V/R<sub>${L('bobin', 'coil')}</sub></td><td>≈ ${L('aynı (yavaş yükselir)', 'same (rises slowly)')}</td><td class="bad">${L('yüzlerce volt', 'hundreds of volts')}</td><td>08</td></tr>
          <tr><td>${L('Kapasitif giriş', 'Capacitive input')}</td><td>${L('modüle bağlı', 'module-dependent')}</td><td class="bad">C·dV/dt (${L('çok büyük', 'very large')})</td><td>${L('sorun yok', 'no issue')}</td><td>11</td></tr>
        </tbody></table></div>

      <h2>${L('Sürekli, tepe ve RMS akım; PWM’de ortalama ≠ RMS', 'Steady, peak and RMS current; under PWM, average ≠ RMS')}</h2>
      <p>${L('PWM’de ölçü aletinin gösterdiği <b>ortalama</b> akım düşer. Anahtardaki ısınma ise <b>RMS</b> akımın karesiyle artar. Dikdörtgen akım için:',
             'Under PWM the <b>average</b> current on a meter drops. Heating in the switch, however, follows the square of the <b>RMS</b> current. For a rectangular current:')}</p>
      <div class="eq">I<sub>avg</sub> = D · I &nbsp;&nbsp;&nbsp; I<sub>rms</sub> = <b>I · √D</b> &nbsp;&nbsp;&nbsp; P<sub>${L('iletim', 'cond')}</sub> = I<sub>rms</sub>² · R<sub>DS(on)</sub> = D · I² · R<sub>DS(on)</sub>
        <span class="note">${L('D = doluluk oranı, 0…1.', 'D = duty cycle, 0…1.')}</span></div>
      ${App.example({
        given: [[L('Açıkken akım', 'On-current'), '4 A'], ['D', L('%25', '25 %')]],
        steps: [
          [L('Ortalama', 'Average'), L('I<sub>avg</sub> = 0,25 · 4', 'I<sub>avg</sub> = 0.25 · 4'), '1 A'],
          ['RMS', L('I<sub>rms</sub> = 4 · √0,25', 'I<sub>rms</sub> = 4 · √0.25'), '2 A'],
          [L('Kayıp oranı', 'Loss ratio'), '(2 / 1)²', '× 4', L('ortalama ile hesaplanan kayıp 4 kat küçük çıkar', 'loss computed from the average comes out 4× too small')]
        ],
        result: L('<b>Isıyı her zaman I<sub>rms</sub> ile hesapla.</b> “1 A” ile hesaplarsan kaybı 4 kat küçük bulursun.', '<b>Always compute heat with I<sub>rms</sub>.</b> Using “1 A” underestimates the loss 4×.'),
        level: 'warn'
      })}
      ${App.lab('lab-pwm', L('PWM: ortalama ve RMS akım', 'PWM: average and RMS current'), {
        foot: L('İdeal dikdörtgen akım, anahtarlama süreleri ihmal. Motorda yük akımı düzleşir, ama <b>anahtar</b> akımı yine darbe olduğu için formül geçerlidir.',
                'Ideal rectangular current, switching times neglected. With a motor the load current is smoothed, but the <b>switch</b> current is still a pulse, so the formula holds.')
      })}

      <h2>${L('Anahtar değerlerini pay bırakarak seç', 'Choose switch ratings with margin')}</h2>
      <div class="cards">
        <div class="card"><h4 class="cu">${L('Gerilim: × 1,5–2', 'Voltage: × 1.5–2')}</h4><p>${L('V<sub>DS</sub>/V<sub>CE</sub> ≥ 1,5 × besleme; endüktif yükte ve uzun kabloda 2 ×. 12 V → 30 V parça, 24 V → 40–60 V parça.', 'V<sub>DS</sub>/V<sub>CE</sub> ≥ 1.5 × supply; 2 × for inductive loads and long cables. 12 V → 30 V part, 24 V → 40–60 V part.')}</p></div>
        <div class="card"><h4 class="cu">${L('Akım: × 1,5–2', 'Current: × 1.5–2')}</h4><p>${L('Ön sayfadaki I<sub>D</sub> 25 °C kılıf ve sonsuz soğutucu içindir. Gerçek sınırı ısı koyar: sürekli akımın 2 katını seç, ısıyı hesapla.', 'The front-page I<sub>D</sub> assumes a 25 °C case on an infinite heatsink. Heat sets the real limit: pick 2 × the steady current and compute the heat.')}</p></div>
        <div class="card"><h4 class="cu">${L('Tepe: darbe değeri', 'Peak: pulsed rating')}</h4><p>${L('Kalkış ve inrush tepelerini I<sub>DM</sub> ve SOA ile karşılaştır. 100 ms’lik motor kalkışı için SOA’nın DC’ye yakın çizgisini kullan.', 'Check start-up and inrush peaks against I<sub>DM</sub> and the SOA. For a 100 ms motor start use the near-DC SOA line.')}</p></div>
        <div class="card"><h4 style="color:var(--bad)">${L('Isı her şeyi bağlar', 'Heat ties it together')}</h4><p>${L('Son kontrol jonksiyon sıcaklığıdır: P = I<sub>rms</sub>²·R<sub>DS(on)</sub>(sıcak), T<sub>j</sub> = T<sub>a</sub> + P·R<sub>θJA</sub>. Bölüm 13.', 'The final check is junction temperature: P = I<sub>rms</sub>²·R<sub>DS(on)</sub>(hot), T<sub>j</sub> = T<sub>a</sub> + P·R<sub>θJA</sub>. Chapter 13.')}</p></div>
      </div>

      <details class="fold"><summary>${L('Çözümlü örnek: 4 m, 12 V LED şerit', 'Worked example: 4 m of 12 V LED strip')}</summary><div>
        ${App.example({
          given: [[L('Şerit', 'Strip'), L('12 V, 60 LED/m', '12 V, 60 LEDs/m')], [L('Segment', 'Segment'), L('3 beyaz LED + 150 Ω', '3 white LEDs + 150 Ω')], ['V<sub>f</sub>', L('3,0 V', '3.0 V')], [L('Uzunluk', 'Length'), '4 m']],
          steps: [
            [L('Segment akımı', 'Segment current'), L('I = (12 − 3 · 3,0) / 150', 'I = (12 − 3 · 3.0) / 150'), '20 mA'],
            [L('Direnç gücü', 'Resistor power'), L('P = 0,02² · 150', 'P = 0.02² · 150'), '60 mW'],
            [L('Segment sayısı', 'Segments'), '4 m · 20 / m', '80'],
            [L('Toplam akım', 'Total current'), 'I = 80 · 20 mA', L('1,6 A', '1.6 A'), L('%100 PWM’de RMS de bu', 'also the RMS at 100 % PWM')],
            [L('Şerit gücü', 'Strip power'), L('P = 12 · 1,6', 'P = 12 · 1.6'), L('19,2 W', '19.2 W')],
            [L('Anahtar gerilimi', 'Switch voltage'), L('V ≥ 1,5 · 12 = 18 V', 'V ≥ 1.5 · 12 = 18 V'), L('30 V sınıfı', '30 V class')],
            [L('Anahtar akımı', 'Switch current'), L('I ≥ 2 · 1,6', 'I ≥ 2 · 1.6'), L('3,2 A', '3.2 A')],
            [L('AO3400A kaybı', 'AO3400A loss'), L('P = 1,6² · 0,04 Ω', 'P = 1.6² · 0.04 Ω'), L('≈ 0,1 W', '≈ 0.1 W'), L('R<sub>DS(on)</sub> ≈ 40 mΩ @ 2,5–4,5 V', 'R<sub>DS(on)</sub> ≈ 40 mΩ at 2.5–4.5 V')]
          ],
          result: L('<b>3,3 V ile tam açılan bir SOT-23 MOSFET yeter.</b> AO3400A yalnızca 0,1 W harcar.', '<b>A SOT-23 MOSFET that fully enhances at 3.3 V is enough.</b> The AO3400A dissipates only 0.1 W.')
        })}
      </div></details>

      <details class="fold"><summary>${L('Çözümlü örnek: 12 V fan motoru', 'Worked example: a 12 V fan motor')}</summary><div>
        ${App.example({
          given: [['V', '12 V'], [L('Çalışma akımı', 'Running current'), L('0,25 A', '0.25 A')], [L('Sargı direnci', 'Winding resistance'), '8 Ω']],
          steps: [
            [L('Kalkış akımı', 'Start current'), 'I = 12 / 8', L('1,5 A', '1.5 A'), L('çalışmanın 6 katı', '6× running')],
            [L('Anahtar gerilimi', 'Switch voltage'), L('V ≥ 2 · 12 (endüktif)', 'V ≥ 2 · 12 (inductive)'), L('30 V sınıfı', '30 V class')],
            [L('Sürekli akım değeri', 'Steady current rating'), L('I ≥ 2 · 0,25', 'I ≥ 2 · 0.25'), L('0,5 A', '0.5 A')],
            [L('Tepe akım', 'Peak current'), 'I<sub>stall</sub>', L('1,5 A', '1.5 A')]
          ],
          result: L('<b>Küçük bir MOSFET ve flyback diyot yeter.</b> BC547 gibi 100 mA’lik bir BJT yetmez.', '<b>A small MOSFET plus a flyback diode is enough.</b> A 100 mA BJT like the BC547 is not.')
        })}
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const STD_V = [12, 20, 30, 40, 60, 80, 100, 150, 200, 250, 400, 600];
    const E24 = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
    const nextE24 = r => {
      const dec = Math.pow(10, Math.floor(Math.log10(r)));
      const m = r / dec;
      const v = E24.find(x => x >= m - 1e-9);
      return v ? v * dec : 10 * dec;
    };
    const stdV = v => STD_V.find(x => x >= v) || Math.ceil(v / 100) * 100;
    const V = v => App.num(v, v < 10 ? 2 : 1) + ' V';

    /* ---------------- Lab: load calculator ---------------- */
    {
      const lab = root.querySelector('#lab-calc');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const schBox = App.h('div'); fig.appendChild(schBox);
      const status = App.h('div', { class: 'status ok' }); fig.appendChild(status);
      let type = 'res', svg = null, flows = [], rotorAng = 0, cur = { I: 0, ledGlow: 0, spin: 0 };

      const typeSeg = UI.segmented(ctl, {
        label: L('Yük tipi', 'Load type'),
        options: [
          { value: 'res', label: L('Direnç', 'Resistor') }, { value: 'led', label: 'LED' },
          { value: 'motor', label: L('Motor', 'Motor') }, { value: 'relay', label: L('Röle', 'Relay') }
        ],
        value: 'res', onChange: v => { type = v; buildParams(); buildSch(); update(); }
      });
      void typeSeg;
      const sVs = UI.slider(ctl, { label: L('Besleme V<sub>S</sub>', 'Supply V<sub>S</sub>'), min: 1, max: 24, step: 0.1, value: 12, fmt: V, onInput: update });
      const pBox = App.h('div', { class: 'ctl', style: 'gap:14px' }); ctl.appendChild(pBox);
      const oBox = App.h('div'); ctl.appendChild(oBox);
      let P = {}, ro = null;

      function buildParams() {
        pBox.innerHTML = ''; oBox.innerHTML = ''; P = {};
        if (type === 'res') {
          P.R = UI.slider(pBox, { label: 'R', min: 1, max: 10000, value: 33, log: true, step: 0.1, unit: 'Ω', onInput: update });
          ro = UI.readouts(oBox, [
            { key: 'i', label: L('Akım I = V/R', 'Current I = V/R') }, { key: 'p', label: L('Yük gücü', 'Load power') },
            { key: 'pk', label: L('Tepe akım', 'Peak current') }, { key: 'rv', label: L('Önerilen V<sub>DS</sub>', 'Suggested V<sub>DS</sub>') },
            { key: 'ri', label: L('Önerilen I<sub>D</sub>', 'Suggested I<sub>D</sub>') }]);
        } else if (type === 'led') {
          P.n = UI.slider(pBox, { label: L('Seri LED sayısı n', 'LEDs in series n'), min: 1, max: 6, step: 1, value: 3, fmt: v => String(v), onInput: update });
          P.vf = UI.slider(pBox, { label: 'V<sub>f</sub>', min: 1.6, max: 3.4, step: 0.05, value: 3.0, fmt: v => App.num(v, 2) + ' V', onInput: update });
          P.If = UI.slider(pBox, { label: 'I<sub>f</sub>', min: 0.001, max: 0.03, step: 0.0005, value: 0.02, unit: 'A', onInput: update });
          ro = UI.readouts(oBox, [
            { key: 'r', label: L('Hesaplanan R', 'Calculated R') }, { key: 're', label: L('E24 (bir üst)', 'E24 (next up)') },
            { key: 'i', label: L('Gerçek akım', 'Actual current') }, { key: 'pr', label: L('Direnç gücü', 'Resistor power') },
            { key: 'pl', label: L('LED gücü / verim', 'LED power / efficiency') }, { key: 'rv', label: L('Önerilen V<sub>DS</sub>', 'Suggested V<sub>DS</sub>') }]);
        } else if (type === 'motor') {
          P.R = UI.slider(pBox, { label: L('Sargı direnci R', 'Winding resistance R'), min: 0.3, max: 30, value: 2, log: true, step: 0.01, unit: 'Ω', onInput: update });
          P.Ir = UI.slider(pBox, { label: L('Çalışma akımı', 'Running current'), min: 0.05, max: 5, value: 0.8, step: 0.01, unit: 'A', onInput: update });
          ro = UI.readouts(oBox, [
            { key: 'i', label: L('Çalışma akımı', 'Running current') }, { key: 'st', label: L('Kalkış/stall = V/R', 'Start/stall = V/R') },
            { key: 'x', label: L('Tepe / çalışma', 'Peak / running') }, { key: 'p', label: L('Stall’da sargı gücü', 'Winding power at stall') },
            { key: 'rv', label: L('Önerilen V<sub>DS</sub>', 'Suggested V<sub>DS</sub>') }, { key: 'ri', label: L('Önerilen I<sub>D</sub> / I<sub>DM</sub>', 'Suggested I<sub>D</sub> / I<sub>DM</sub>') }]);
        } else {
          P.R = UI.slider(pBox, { label: L('Bobin direnci', 'Coil resistance'), min: 20, max: 2000, value: 400, log: true, step: 1, unit: 'Ω', onInput: update });
          ro = UI.readouts(oBox, [
            { key: 'i', label: L('Bobin akımı I = V/R', 'Coil current I = V/R') }, { key: 'p', label: L('Bobin gücü', 'Coil power') },
            { key: 'pk', label: L('Tepe akım', 'Peak current') }, { key: 'rv', label: L('Önerilen V<sub>DS</sub>', 'Suggested V<sub>DS</sub>') },
            { key: 'ri', label: L('Önerilen I<sub>D</sub>', 'Suggested I<sub>D</sub>') }]);
        }
      }

      // schematic: supply at x=40, load column x=250, NMOS at (230,240) drain (250,210) source (250,270)
      function buildSch() {
        flows.forEach(f => f.stop()); flows = [];
        schBox.innerHTML = '';
        let part = '';
        if (type === 'res') {
          part = `${Sch.w([[250, 40], [250, 105]], 'hot')}${Sch.load(250, 135, 0, 'R')}${Sch.w([[250, 165], [250, 210]], 'hot')}`;
        } else if (type === 'led') {
          part = `${Sch.w([[250, 40], [250, 65]], 'hot')}${Sch.res(250, 95, 0, 'R')}${Sch.w([[250, 125], [250, 140]], 'hot')}
                  ${Sch.led(250, 170, 0, 'LED ×n', 'calcLed')}${Sch.w([[250, 200], [250, 210]], 'hot')}`;
        } else {
          const body = type === 'motor' ? Sch.motor(250, 135, 'M', 'calcMot') : Sch.ind(250, 135, 0, L('bobin', 'coil'));
          part = `${Sch.w([[250, 40], [250, 105]], 'hot')}${body}${Sch.w([[250, 165], [250, 210]], 'hot')}
                  ${Sch.w([[250, 90], [320, 90], [320, 105]])}${Sch.diode(320, 135, 180, '')}${Sch.w([[320, 165], [320, 180], [250, 180]])}
                  ${Sch.dot(250, 90)}${Sch.dot(250, 180)}<text x="332" y="140" class="sch-t muted">flyback</text>`;
        }
        svg = Viz.schematic(schBox, 420, 310, `
          ${Sch.w([[40, 120], [40, 40], [250, 40]], 'hot')}
          ${Sch.vsrc(40, 150, '')}
          <text id="calcVs" x="58" y="154" class="sch-t cu"></text>
          ${Sch.w([[40, 180], [40, 290], [250, 290], [250, 270]], 'hot')}
          ${Sch.gnd(145, 290)}
          ${part}
          ${Sch.nmos(230, 240, 'Q')}
          ${Sch.box(80, 220, 76, 40, 'MCU', '')}
          ${Sch.w([[156, 240], [200, 240]], 'sigw')}
          <text id="calcI" x="410" y="30" class="sch-t cu big" text-anchor="end"></text>
          <text id="calcPk" x="410" y="48" class="sch-t bad" text-anchor="end"></text>
        `);
        flows.push(new Viz.Flow(svg, 'M40,120V40H250V290H40V180', { spacing: 16 }));
      }

      function setRec(I, Ipk, inductive) {
        const vreq = sVs.value * (inductive ? 2 : 1.5);
        ro.set('rv', '≥ ' + stdV(vreq) + ' V');
        if (ro.el.querySelector('[data-k="ri"]')) {
          ro.set('ri', '≥ ' + App.si(2 * I, 'A', 2) + (Ipk > 2 * I ? ' / ≥ ' + App.si(Ipk, 'A', 2) : ''));
        }
      }

      function update() {
        const vs = sVs.value;
        svg.querySelector('#calcVs').textContent = App.num(vs, 1) + ' V';
        let I = 0, Ipk = 0, st = 'ok', msg = '';
        if (type === 'res') {
          const R = P.R.value; I = vs / R; Ipk = I;
          ro.set('i', App.si(I, 'A'));
          const Pw = vs * vs / R;
          ro.set('p', App.si(Pw, 'W'), Pw > 10 ? 'warn' : '');
          ro.set('pk', App.si(Ipk, 'A') + L(' (≈ sürekli)', ' (≈ steady)'));
          setRec(I, Ipk, false);
          msg = L('Dirençsel yük: akım sabit, sıçrama yok. Isıtıcıda ısıyı yük üretir; anahtarda kalan kayıp I²·R<sub>DS(on)</sub>’dır.',
                  'Resistive load: steady current, no surge. The load makes the heat; the switch only loses I²·R<sub>DS(on)</sub>.');
        } else if (type === 'led') {
          const n = P.n.value, vf = P.vf.value, If = P.If.value;
          const head = vs - n * vf;
          if (head <= 0.05) {
            ['r', 're', 'i', 'pr', 'pl'].forEach(k => ro.set(k, '—', 'bad'));
            ro.set('r', L('V<sub>S</sub> yetersiz', 'V<sub>S</sub> too low'), 'bad');
            st = 'bad'; I = 0; Ipk = 0;
            msg = L('Besleme, n·V<sub>f</sub>’den küçük: LED’ler yanmaz. Seri LED sayısını azalt ya da beslemeyi yükselt.',
                    'The supply is below n·V<sub>f</sub>: the LEDs will not light. Use fewer LEDs in series or a higher supply.');
          } else {
            const R = head / If, Re = nextE24(R);
            I = head / Re; Ipk = I;
            const Pr = I * I * Re, Pl = n * vf * I;
            ro.set('r', App.si(R, 'Ω'));
            ro.set('re', App.si(Re, 'Ω', 2));
            ro.set('i', App.si(I, 'A'));
            const rating = Pr * 2 <= 0.125 ? '1/8 W' : Pr * 2 <= 0.25 ? '1/4 W' : Pr * 2 <= 0.5 ? '1/2 W' : Pr * 2 <= 1 ? '1 W' : '2 W+';
            ro.set('pr', App.si(Pr, 'W') + ' → ' + rating, Pr > 0.25 ? 'warn' : '');
            ro.set('pl', App.si(Pl, 'W') + ' / %' + App.num(100 * n * vf / vs, 0), n * vf / vs < 0.5 ? 'warn' : 'ok');
            setRec(I, Ipk, false);
            if (head < 0.6) { st = 'warn'; msg = L('Dirence düşen gerilim çok az: V<sub>f</sub>’deki küçük sapmalar ve besleme dalgalanması akımı büyük oranda değiştirir. En az ≈ 1 V pay bırak.', 'Very little voltage is left for the resistor: small V<sub>f</sub> spread or supply ripple changes the current a lot. Leave at least ≈ 1 V of headroom.'); }
            else msg = L('LED akımını direnç belirler. Verim = LED gücü / toplam güç; geri kalanı dirençte ısıya dönüşür.', 'The resistor sets the LED current. Efficiency = LED power / total power; the rest becomes heat in the resistor.');
          }
        } else if (type === 'motor') {
          const R = P.R.value, Ist = vs / R;
          I = Math.min(P.Ir.value, Ist); Ipk = Ist;
          ro.set('i', App.si(I, 'A'));
          ro.set('st', App.si(Ist, 'A'), Ist > 5 ? 'warn' : '');
          ro.set('x', '× ' + App.num(Ist / Math.max(I, 1e-6), 1));
          ro.set('p', App.si(vs * vs / R, 'W'), vs * vs / R > 20 ? 'bad' : 'warn');
          setRec(I, Ipk, true);
          st = 'warn';
          msg = P.Ir.value >= Ist ? L('Girilen çalışma akımı kilitlenme akımından büyük olamaz; motor zaten kilitli gibi davranıyor.', 'The running current cannot exceed the stall current; the motor is effectively stalled.')
            : L('Her kalkışta motor kısa süre V/R çeker. Anahtar ve sigorta bu tepeyi kaldırmalı; kapatışta endüktif sıçrama için flyback diyot şart.',
                'At every start the motor briefly draws V/R. The switch and fuse must survive this peak; a flyback diode is mandatory for the turn-off spike.');
        } else {
          const R = P.R.value; I = vs / R; Ipk = I;
          ro.set('i', App.si(I, 'A'), I > 0.04 ? 'warn' : '');
          ro.set('p', App.si(vs * vs / R, 'W'));
          ro.set('pk', App.si(Ipk, 'A') + L(' (L/R ile yükselir)', ' (rises with L/R)'));
          setRec(I, Ipk, true);
          st = I > 0.02 ? 'warn' : 'ok';
          msg = I > 0.02 ? L('Bu bobin akımı bir GPIO pininin rahat verebileceğinden fazla: araya transistör ve flyback diyot gerekir.', 'This coil current is more than a GPIO pin can comfortably give: you need a transistor and a flyback diode.')
            : L('Küçük bobin; yine de endüktif. Flyback diyotsuz sürme.', 'A small coil, but still inductive. Never drive it without a flyback diode.');
        }
        cur.I = I;
        svg.querySelector('#calcI').textContent = 'I = ' + App.si(I, 'A');
        svg.querySelector('#calcPk').textContent = Ipk > I * 1.5 ? L('tepe ', 'peak ') + App.si(Ipk, 'A') : '';
        flows[0].rate = I > 0 ? App.clamp(Math.sqrt(I / 1.5), 0.12, 3) : 0;
        const led = svg.querySelector('#calcLed .led-glow');
        if (led) led.style.opacity = App.clamp(I / 0.02, 0, 1).toFixed(2);
        cur.spin = type === 'motor' ? App.clamp(I, 0.1, 3) : 0;
        status.className = 'status ' + st;
        status.innerHTML = msg;
      }
      App.onFrame(dt => {
        if (!cur.spin || !svg) return;
        const r = svg.querySelector('#calcMot .rotor');
        if (!r) return;
        if (!App.reducedMotion) rotorAng = (rotorAng + dt * 360 * cur.spin) % 360;
        r.setAttribute('transform', `rotate(${rotorAng.toFixed(1)} 250 135)`);
      });
      buildParams(); buildSch(); update();
    }

    /* ---------------- Figure: lamp inrush ---------------- */
    {
      const fig = root.querySelector('#fig-lamp .lab-fig');
      const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
      const left = App.h('div'), right = App.h('div'); grid.append(left, right);
      const svg = Viz.schematic(left, 420, 290, `
        ${Sch.vsrc(60, 140, '12 V')}
        ${Sch.w([[60, 110], [60, 40], [110, 40]], 'hot')}
        <g id="lampSw">${Sch.sw(140, 40, 90, false, '')}</g>
        ${Sch.w([[170, 40], [260, 40], [260, 122]], 'hot')}
        <g class="sch led" id="lamp"><circle class="led-glow" cx="260" cy="140" r="26"/><circle cx="260" cy="140" r="18" class="load-body"/>
          <path class="thin" d="M247.3,127.3L272.7,152.7M272.7,127.3L247.3,152.7"/></g>
        ${Sch.w([[260, 158], [260, 240], [60, 240], [60, 170]], 'hot')}
        <text x="292" y="136" class="sch-t">12 V 5 W</text>
        <text id="lampR" x="292" y="154" class="sch-t muted"></text>
        <text id="lampI" x="292" y="200" class="sch-t cu big"></text>
        <text id="lampT" x="140" y="275" class="sch-t muted" text-anchor="middle"></text>
      `);
      const flow = new Viz.Flow(svg, 'M60,110V40H260V240H60V170', { spacing: 15 });
      const glow = svg.querySelector('#lamp .led-glow');
      const swG = svg.querySelector('#lampSw');
      const p = new Viz.Plot(right, {
        w: 420, h: 290, x: [0, 0.8], y: [0, 4.6], yTicks: [0, 1, 2, 3, 4],
        xLabel: L('zaman (s, simülasyon)', 'time (s, simulated)'), yLabel: 'I (A)',
        xFmt: v => App.num(v, 1), yFmt: v => App.num(v, 0)
      });
      p.hline('hot', 0.417, 'cu');
      p.text('hotT', 0.79, 0.417, L('sıcak: 0,42 A', 'hot: 0.42 A'), 'cu', 'end', 0, -6);
      p.text('pkT', 0.02, 4.4, L('soğuk: ≈ 4,2 A', 'cold: ≈ 4.2 A'), 'bad');
      const Vs = 12, Rhot = 28.8, tau = 0.2, slow = 6, onT = 0.4, offT = 0.4;
      let t = 0, th = 0, swOn = null;
      const hist = [];
      App.onFrame(dt => {
        const ds = dt / slow;
        t += ds;
        const on = (t % (onT + offT)) < onT;
        const R = Rhot * (0.1 + 0.9 * th);
        const I = on ? Vs / R : 0;
        const Pn = on ? (Vs * Vs / R) / (Vs * Vs / Rhot) : 0; // power normalised to hot power
        th += (Pn - th) * Math.min(1, ds / tau);
        th = App.clamp(th, 0, 1.05);
        hist.push([t, I]);
        while (hist.length && hist[0][0] < t - 0.8) hist.shift();
        const t0 = t - 0.8;
        p.line('i', hist.map(q => [q[0] - t0, q[1]]), 'cu');
        flow.rate = I > 0.01 ? App.clamp(I / 1.2, 0.2, 3) : 0;
        glow.style.opacity = Math.pow(App.clamp(th, 0, 1), 3).toFixed(2);
        if (swOn !== on) { swOn = on; swG.innerHTML = Sch.sw(140, 40, 90, on, ''); }
        svg.querySelector('#lampR').textContent = 'R ≈ ' + App.si(R, 'Ω', 2);
        svg.querySelector('#lampI').textContent = 'I = ' + App.si(I, 'A', 2);
        const tC = 25 + th * 2500;
        svg.querySelector('#lampT').textContent = L('flaman ≈ ', 'filament ≈ ') + App.num(tC, 0) + ' °C';
      });
    }

    /* ---------------- Lab: motor start-up ---------------- */
    {
      const lab = root.querySelector('#lab-motor');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const R = 2, k = 0.02, J = 2e-5, Tend = 0.5;
      const svg = Viz.schematic(fig, 600, 140, `
        <rect x="150" y="4" width="225" height="132" rx="8" style="fill:none;stroke:var(--muted);stroke-dasharray:5 4"/>
        <text x="262" y="130" class="sch-t muted" text-anchor="middle">${L('motorun eşdeğeri', 'motor equivalent')}</text>
        ${Sch.vsrc(50, 70, 'V')}
        ${Sch.w([[50, 40], [50, 20], [170, 20]], 'hot')}
        ${Sch.res(200, 20, 90, '')}<text x="200" y="44" class="sch-t" text-anchor="middle">R = 2 Ω</text>
        ${Sch.w([[230, 20], [320, 20], [320, 40]], 'hot')}
        ${Sch.vsrc(320, 70, 'E = k·ω')}
        ${Sch.w([[320, 100], [320, 115], [50, 115], [50, 100]], 'hot')}
        <text id="mE" x="338" y="92" class="sch-t sig"></text>
        <text id="mI" x="100" y="70" class="sch-t cu big"></text>
        <text x="425" y="75" class="sch-t big" text-anchor="middle">≡</text>
        <g class="sch"><circle cx="500" cy="70" r="34" class="load-body"/><g id="mRot"><path class="thin" d="M470,70H530M500,40V100M479,49L521,91"/></g></g>
        <text id="mW" x="500" y="128" class="sch-t muted" text-anchor="middle"></text>
      `);
      const flow = new Viz.Flow(svg, 'M50,40V20H320V115H50V100', { spacing: 15 });
      const pI = new Viz.Plot(fig, {
        w: 600, h: 230, x: [0, Tend], y: [0, 12.5], yTicks: [0, 3, 6, 9, 12],
        xLabel: L('zaman (s)', 'time (s)'), yLabel: 'I (A)', xFmt: v => App.num(v, 1), yFmt: v => App.num(v, 0)
      });
      const pW = new Viz.Plot(fig, {
        w: 600, h: 170, x: [0, Tend], y: [0, 12000], yTicks: [0, 4000, 8000, 12000],
        xLabel: L('zaman (s)', 'time (s)'), yLabel: L('hız (rpm)', 'speed (rpm)'), xFmt: v => App.num(v, 1), yFmt: v => App.num(v / 1000, 0) + 'k'
      });
      const sV = UI.slider(ctl, { label: L('Besleme V', 'Supply V'), min: 3, max: 24, step: 0.5, value: 12, fmt: v => App.num(v, 1) + ' V', onInput: update });
      const sT = UI.slider(ctl, { label: L('Yük torku', 'Load torque'), min: 0, max: 150, step: 1, value: 20, fmt: v => App.num(v, 0) + ' mN·m', onInput: update });
      const tLock = UI.toggle(ctl, { label: L('Mil kilitli (stall)', 'Shaft locked (stall)'), value: false, onChange: update });
      UI.button(ctl, { label: L('▶ Tekrar oynat', '▶ Replay'), kind: 'primary', onClick: () => { tc = 0; hold = 0; } });
      const ro = UI.readouts(ctl, [
        { key: 'i0', label: L('Kalkış I<sub>0</sub> = V/R', 'Start I<sub>0</sub> = V/R') }, { key: 'ir', label: L('Çalışma akımı', 'Running current') },
        { key: 'x', label: L('Kalkış / çalışma', 'Start / running') }, { key: 'w', label: L('Kararlı hız', 'Steady speed') },
        { key: 'ps', label: L('Kalkışta sargı gücü', 'Winding power at start') }]);
      let m = null, tc = 0, hold = 0, ang = 0;
      function model() {
        const v = sV.value, T = sT.value / 1000;
        const Tst = k * v / R;
        const locked = tLock.value || T >= Tst;
        const tau = J * R / (k * k);
        const wInf = locked ? 0 : (v - T * R / k) / k;
        const w = t => locked ? 0 : wInf * (1 - Math.exp(-t / tau));
        const i = t => (v - k * w(t)) / R;
        return { v, T, Tst, locked, tau, wInf, w, i };
      }
      function update() {
        m = model();
        pI.line('i', Viz.sample(m.i, 0, Tend, 200), 'cu');
        pW.line('w', Viz.sample(t => m.w(t) * 60 / (2 * Math.PI), 0, Tend, 200), 'ok');
        pI.hline('ir', m.i(Tend * 10), 'cu');
        pI.text('i0T', 0.01, m.v / R, 'I₀ = V/R', 'bad', 'start', 6, -6);
        pI.text('tauT', m.tau, m.i(m.tau), m.locked ? '' : 'τ = ' + App.num(m.tau * 1000, 0) + ' ms', 'muted', 'start', 6, -6);
        const Ir = m.i(Tend * 10);
        ro.set('i0', App.si(m.v / R, 'A'), 'warn');
        ro.set('ir', m.locked ? L('kilitli: ', 'stalled: ') + App.si(Ir, 'A') : App.si(Ir, 'A'), m.locked ? 'bad' : 'ok');
        ro.set('x', m.locked ? '× 1' : (Ir > 1e-3 ? '× ' + App.num(m.v / R / Ir, 1) : '∞'));
        ro.set('w', App.num(m.wInf * 60 / (2 * Math.PI), 0) + ' rpm', m.locked ? 'bad' : '');
        ro.set('ps', App.si(m.v * m.v / R, 'W'), m.v * m.v / R > 50 ? 'bad' : 'warn');
      }
      App.onFrame(dt => {
        if (!m) return;
        if (tc < Tend) tc = Math.min(Tend, tc + dt / 6); else { hold += dt; if (hold > 2) { tc = 0; hold = 0; } }
        const i = m.i(tc), w = m.w(tc);
        pI.vline('cur', tc, 'cu');
        pI.dot('d', tc, i);
        pW.vline('cur', tc, 'cu');
        pW.dot('d', tc, w * 60 / (2 * Math.PI), 'sig');
        flow.rate = App.clamp(i / 4, 0.1, 3);
        if (!App.reducedMotion) ang = (ang + dt * (w / 1200) * 900) % 360; // visual speed ∝ ω (slowed down)
        svg.querySelector('#mRot').setAttribute('transform', `rotate(${(ang).toFixed(1)} 500 70)`);
        svg.querySelector('#mE').textContent = '= ' + App.num(k * w, 1) + ' V';
        svg.querySelector('#mI').textContent = 'I = ' + App.num(i, 2) + ' A';
        svg.querySelector('#mW').textContent = App.num(w * 60 / (2 * Math.PI), 0) + ' rpm  (t = ' + App.num(tc * 1000, 0) + ' ms)';
      });
      update();
    }

    /* ---------------- Lab: PWM average vs RMS ---------------- */
    {
      const lab = root.querySelector('#lab-pwm');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p = new Viz.Plot(fig, {
        w: 600, h: 260, x: [0, 3], y: [0, 5.5], xTicks: [0, 1, 2, 3],
        xLabel: L('zaman (PWM periyodu)', 'time (PWM periods)'), yLabel: 'I (A)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 1)
      });
      const p2 = new Viz.Plot(fig, {
        w: 600, h: 200, x: [0, 1], y: [0, 1.05], yTicks: [0, 0.5, 1],
        xLabel: L('doluluk D', 'duty D'), yLabel: '÷ I', xFmt: v => '%' + App.num(v * 100, 0), yFmt: v => App.num(v, 1)
      });
      p2.line('avg', Viz.sample(d => d, 0, 1, 50), 'ok');
      p2.line('rms', Viz.sample(d => Math.sqrt(d), 0, 1, 100), 'warn');
      p2.text('aT', 0.8, 0.7, 'I_avg / I = D', 'ok', 'start');
      p2.text('rT', 0.15, 0.62, 'I_rms / I = √D', 'muted', 'start');
      const sD = UI.slider(ctl, { label: L('Doluluk D', 'Duty D'), min: 0, max: 1, step: 0.01, value: 0.25, fmt: v => '%' + App.num(v * 100, 0), onInput: update });
      const sI = UI.slider(ctl, { label: L('Açıkken akım I', 'On-current I'), min: 0.5, max: 10, step: 0.1, value: 4, fmt: v => App.num(v, 1) + ' A', onInput: update });
      const sR = UI.slider(ctl, { label: 'R<sub>DS(on)</sub>', min: 0.005, max: 0.2, step: 0.001, log: true, value: 0.03, unit: 'Ω', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'avg', label: 'I<sub>avg</sub> = D·I' }, { key: 'rms', label: 'I<sub>rms</sub> = I·√D' },
        { key: 'ratio', label: 'I<sub>rms</sub> / I<sub>avg</sub>' }, { key: 'p', label: L('Gerçek kayıp I<sub>rms</sub>²·R', 'True loss I<sub>rms</sub>²·R') },
        { key: 'pw', label: L('Yanlış: I<sub>avg</sub>²·R', 'Wrong: I<sub>avg</sub>²·R') }]);
      let scan = 0, D = 0.25, I = 4;
      function wave(x) { const f = x - Math.floor(x); return f < D ? I : 0; }
      function update() {
        D = sD.value; I = sI.value;
        let pts = [];
        if (D >= 0.995) pts = [[0, I], [3, I]];
        else if (D <= 0.005) pts = [[0, 0], [3, 0]];
        else for (let c = 0; c < 3; c++) pts.push([c, I], [c + D, I], [c + D, 0], [c + 1, 0]);
        p.area('wA', pts, 'cu');
        p.line('w', pts, 'cu');
        const a = D * I, r = I * Math.sqrt(D), R = sR.value;
        p.line('avg', [[0, a], [3, a]], 'ok dash');
        p.line('rms', [[0, r], [3, r]], 'warn dash');
        p.text('avgT', 2.98, a, 'I_avg = ' + App.num(a, 2) + ' A', 'ok', 'end', 0, 14);
        p.text('rmsT', 2.98, r, 'I_rms = ' + App.num(r, 2) + ' A', 'muted', 'end', 0, -6);
        p2.dot('da', D, D, '', 4);
        p2.dot('dr', D, Math.sqrt(D), 'bad', 4);
        p2.vline('dv', D, 'cu');
        ro.set('avg', App.num(a, 2) + ' A');
        ro.set('rms', App.num(r, 2) + ' A', 'warn');
        ro.set('ratio', D > 0 ? '× ' + App.num(1 / Math.sqrt(D), 2) : '—');
        ro.set('p', App.si(r * r * R, 'W'), 'ok');
        ro.set('pw', App.si(a * a * R, 'W') + (D > 0 && D < 1 ? L(' (', ' (') + App.num(1 / D, 1) + L(' kat az!)', '× too low!)') : ''), D < 1 && D > 0 ? 'bad' : '');
      }
      App.onFrame(dt => {
        if (!App.reducedMotion) scan = (scan + dt * 0.5) % 3;
        p.dot('scan', scan, wave(scan), '', 5);
      });
      update();
    }
  }
});
