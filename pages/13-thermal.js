/* 13 — Heat: conduction loss, thermal Ohm's law, R_DS(on)(T) iteration and runaway, transient thermal impedance,
   PCB copper, derating, paralleling MOSFETs */
App.page({
  id: 'thermal',
  num: '13',
  group: { tr: 'Koruma', en: 'Protection' },
  title: { tr: 'Isı: kayıp, termal direnç, soğutucu', en: 'Heat: losses, thermal resistance, heatsinks' },
  blurb: { tr: 'P = I²·R<sub>DS(on)</sub>, T<sub>j</sub> = T<sub>a</sub> + P·R<sub>θ</sub>, sıcaklıkla artan R<sub>DS(on)</sub>, darbe gücü, bakır alan.', en: 'P = I²·R<sub>DS(on)</sub>, T<sub>j</sub> = T<sub>a</sub> + P·R<sub>θ</sub>, R<sub>DS(on)</sub> rising with temperature, pulse power, copper area.' },
  summary: {
    tr: 'Transistördeki her watt kayıp ısıya dönüşür. Jonksiyon sıcaklığını termal Ohm yasasıyla, bir gerilim gibi hesaplarsın. Püf noktası: MOSFET ısındıkça R<sub>DS(on)</sub> da artar.',
    en: 'Every watt lost in a transistor becomes heat. You compute junction temperature with the thermal Ohm’s law, just like a voltage. The catch: as the MOSFET heats, R<sub>DS(on)</sub> rises too.'
  },
  render(L) {
    return `
      ${App.keys([
        L('T<sub>j</sub> = T<sub>a</sub> + P · R<sub>θ</sub>; T<sub>j(max)</sub>’a 25–30 °C pay bırak.', 'T<sub>j</sub> = T<sub>a</sub> + P · R<sub>θ</sub>; keep 25–30 °C below T<sub>j(max)</sub>.'),
        L('Kaybı sıcak R<sub>DS(on)</sub> ile hesapla: 125 °C’de ≈ 1,7 × R<sub>25</sub>.', 'Use hot R<sub>DS(on)</sub>: ≈ 1.7 × R<sub>25</sub> at 125 °C.'),
        L('Küçük pakette sınırı akım değil R<sub>θJA</sub> koyar.', 'In small packages R<sub>θJA</sub>, not the current rating, sets the limit.'),
        L('Kısa darbeler Z<sub>θ</sub>(t) sayesinde DC’nin çok üstünde güce dayanır.', 'Short pulses tolerate far more than DC power, thanks to Z<sub>θ</sub>(t).'),
        L('Paralel MOSFET’ler tam açıkken kendiliğinden dengelenir; her gate’e ayrı direnç.', 'Fully-on parallel MOSFETs share current; give each gate its own resistor.')
      ])}
      <style>
        [data-page="thermal"] .tnode { stroke: var(--surface); stroke-width: 2; }
      </style>
      <h2>${L('Bütün kayıplar ısıya dönüşür', 'All losses become heat')}</h2>
      <p>${L('Anahtar olarak çalışan transistörde iki kayıp vardır:', 'A transistor used as a switch has two losses:')}</p>
      <ul>
        <li>${L('<b>İletim kaybı:</b> açıkken akım akarken.', '<b>Conduction loss:</b> while current flows in the on-state.')}</li>
        <li>${L('<b>Anahtarlama kaybı:</b> açılıp kapanırken akım ve gerilim birlikte varken.', '<b>Switching loss:</b> when current and voltage coexist at the edges.')}</li>
      </ul>
      <p>${L('Düşük frekansta ya da sürekli açık yükte iletim kaybı baskındır.', 'At low frequency or with always-on loads, conduction loss dominates.')}</p>
      <div class="eq">MOSFET: P<sub>${L('iletim', 'cond')}</sub> = <b>I<sub>rms</sub>² · R<sub>DS(on)</sub>(T<sub>j</sub>)</b><br>
        BJT: P<sub>${L('iletim', 'cond')}</sub> = V<sub>CE(sat)</sub> · I<sub>C</sub> + V<sub>BE</sub> · I<sub>B</sub><br>
        ${L('Anahtarlama', 'Switching')}: P<sub>sw</sub> ≈ ½ · V · I · (t<sub>r</sub> + t<sub>f</sub>) · f<sub>PWM</sub>
        <span class="note">${L('MOSFET’te RMS akım ve <b>sıcak</b> R<sub>DS(on)</sub> kullan (Bölüm 01, 03). Anahtarlama kaybı Bölüm 09’da.',
                              'For a MOSFET use RMS current and the <b>hot</b> R<sub>DS(on)</sub> (Chapters 01, 03). Switching loss is in Chapter 09.')}</span></div>

      <h2>${L('Termal Ohm yasası', 'Thermal Ohm’s law')}</h2>
      <p>${L('Isı akışı akım gibi, sıcaklık farkı gerilim gibi, termal direnç (°C/W) direnç gibi davranır. Isı seri dirençlerden geçer:', 'Heat flow acts like current, temperature difference like voltage, thermal resistance (°C/W) like resistance. Heat crosses resistances in series:')}</p>
      <ul>
        <li>${L('jonksiyon → kılıf: R<sub>θJC</sub>', 'junction → case: R<sub>θJC</sub>')}</li>
        <li>${L('kılıf → soğutucu: R<sub>θCS</sub> (ped/macun)', 'case → heatsink: R<sub>θCS</sub> (pad/paste)')}</li>
        <li>${L('soğutucu → hava: R<sub>θSA</sub>', 'heatsink → air: R<sub>θSA</sub>')}</li>
      </ul>
      <div class="eq">T<sub>j</sub> = T<sub>a</sub> + P · (R<sub>θJC</sub> + R<sub>θCS</sub> + R<sub>θSA</sub>) &nbsp;&nbsp;&nbsp; ${L('soğutucusuz', 'no heatsink')}: <b>T<sub>j</sub> = T<sub>a</sub> + P · R<sub>θJA</sub></b>
        <span class="note">${L('R<sub>θJA</sub> paket ve PCB birlikte içindir; hangi bakır alanında ölçüldüğüne bak. T<sub>j(max)</sub> genelde 150 ya da 175 °C; 25–30 °C pay bırak.',
                              'R<sub>θJA</sub> covers package and PCB together; check the copper area it was measured on. T<sub>j(max)</sub> is usually 150 or 175 °C; keep 25–30 °C margin.')}</span></div>
      ${App.figure('fig-tc', L('Termal devre: ısı jonksiyondan havaya akar', 'Thermal circuit: heat flows from junction to air'), {
        foot: L('TO-220 + soğutucu: R<sub>θJC</sub> = 1,5, R<sub>θCS</sub> = 0,5, R<sub>θSA</sub> = 5 °C/W, T<sub>a</sub> = 25 °C. Güç 4–12 W arasında yavaşça değişir; kararlı durum sıcaklıkları gösterilir. Toprak sembolü 0 °C referansıdır.',
                'TO-220 + heatsink: R<sub>θJC</sub> = 1.5, R<sub>θCS</sub> = 0.5, R<sub>θSA</sub> = 5 °C/W, T<sub>a</sub> = 25 °C. Power varies slowly between 4 and 12 W; steady-state temperatures are shown. The ground symbol is the 0 °C reference.')
      })}

      <h2>${L('R<sub>DS(on)</sub> ısındıkça artar: yinelemeli çözüm', 'R<sub>DS(on)</sub> rises with heat: an iterative solution')}</h2>
      <p>${L('Burada bir döngü var. Kayıp jonksiyonu ısıtır, sıcak jonksiyonda R<sub>DS(on)</sub> büyür, kayıp daha da artar.', 'There is a loop here. Loss heats the junction, the hot junction has higher R<sub>DS(on)</sub>, and loss rises further.')}</p>
      <ol class="steps">
        <li>${L('25 °C’deki R<sub>DS(on)</sub> ile T<sub>j</sub>’yi bul.', 'Find T<sub>j</sub> with the 25 °C R<sub>DS(on)</sub>.')}</li>
        <li>${L('O sıcaklıktaki R<sub>DS(on)</sub> ile kaybı yeniden hesapla.', 'Recompute the loss with R<sub>DS(on)</sub> at that temperature.')}</li>
        <li>${L('Tekrarla; genelde 3–5 adımda oturur.', 'Repeat; it usually settles in 3–5 steps.')}</li>
      </ol>
      <p>${L('Oturmuyorsa ya da T<sub>j(max)</sub> üstünde oturuyorsa bu bir <b>termal kaçak</b> uyarısıdır.', 'If it does not settle, or settles above T<sub>j(max)</sub>, that is a <b>thermal runaway</b> warning.')}</p>
      <div class="eq">R<sub>DS(on)</sub>(T) ≈ R<sub>25</sub> · (1 + α · (T − 25 °C)) &nbsp;&nbsp;&nbsp; T<sub>j</sub> = T<sub>a</sub> + I² · R<sub>DS(on)</sub>(T<sub>j</sub>) · R<sub>θ</sub>
        <span class="note">${L('Kapalı çözüm: G = I²·R<sub>25</sub>·α·R<sub>θ</sub> &lt; 1 ise T<sub>j</sub> = [T<sub>a</sub> + I²R<sub>25</sub>R<sub>θ</sub>(1 − 25α)] / (1 − G). G ≥ 1 ise denge yoktur.',
                              'Closed form: if G = I²·R<sub>25</sub>·α·R<sub>θ</sub> &lt; 1, T<sub>j</sub> = [T<sub>a</sub> + I²R<sub>25</sub>R<sub>θ</sub>(1 − 25α)] / (1 − G). If G ≥ 1 there is no equilibrium.')}</span></div>
      ${App.lab('lab-iter', L('T<sub>j</sub> hesabı: paket, akım ve sıcaklık katsayısı', 'Computing T<sub>j</sub>: package, current and temperature coefficient'), {
        foot: L('α = 0,007 /°C, yalnızca iletim kaybı, DC akım (PWM’de I<sub>rms</sub>). R<sub>θ</sub> yaklaşık: SOT-23 ≈ 250, SOT-223 ≈ 60, DPAK ≈ 50 / 30, TO-220 açık ≈ 62, TO-220 + 4 °C/W soğutucu ≈ 6 °C/W. Alt grafik: üretilen ısı (bakır) ile atılan ısının (yeşil) kesişimi dengedir.',
                'α = 0.007 /°C, conduction loss only, DC current (I<sub>rms</sub> under PWM). R<sub>θ</sub> approx.: SOT-23 ≈ 250, SOT-223 ≈ 60, DPAK ≈ 50 / 30, TO-220 free air ≈ 62, TO-220 + 4 °C/W heatsink ≈ 6 °C/W. Lower plot: equilibrium is where generated heat (copper) meets removed heat (green).')
      })}
      <div class="call bad"><strong>${L('Termal kaçak', 'Thermal runaway')}</strong>
        ${L('Üretilen ısı sıcaklıkla atılan ısıdan hızlı artarsa sıcaklık durmaz ve parça yanar. Alt grafikte bakır çizgi yeşilin üstünde kalır. Çözüm: daha düşük R<sub>DS(on)</sub>, daha iyi soğutma, daha az akım ya da paralel MOSFET.',
            'If generated heat grows faster with temperature than removed heat, temperature never stops and the part burns. In the lower plot the copper line stays above the green one. Fixes: lower R<sub>DS(on)</sub>, better cooling, less current, or parallel MOSFETs.')}</div>

      <h2>${L('Termal zaman sabiti: darbede daha çok güç', 'Thermal time constant: more power in a pulse')}</h2>
      <p>${L('Kısa darbeler, DC değerin çok üstünde güce dayanır. Silisyum, paket ve PCB’nin <b>ısıl kapasitesi</b> vardır; sıcaklık bir anda yükselmez.', 'Short pulses tolerate power far above the DC rating. Silicon, package and PCB have <b>thermal capacitance</b>; temperature cannot jump.')}</p>
      <ul>
        <li>${L('Çok kısa darbede ısı kılıfa bile ulaşmaz.', 'In a very short pulse the heat never even reaches the case.')}</li>
        <li>${L('Datasheet bunu <b>geçici termal empedans</b> Z<sub>θ</sub>(t) eğrisiyle verir.', 'Datasheets give this as a <b>transient thermal impedance</b> curve Z<sub>θ</sub>(t).')}</li>
        <li>${L('Kısa darbede Z<sub>θ</sub> küçüktür, uzun darbede R<sub>θ</sub>’ya yaklaşır.', 'Z<sub>θ</sub> is small for short pulses and approaches R<sub>θ</sub> for long ones.')}</li>
      </ul>
      <div class="eq">P<sub>${L('darbe, izin', 'pulse, allowed')}</sub> = (T<sub>j(max)</sub> − T<sub>a</sub>) / <b>Z<sub>θ</sub>(t<sub>p</sub>)</b> &nbsp;&nbsp;&nbsp; Z<sub>θ</sub>(t) = Σ R<sub>i</sub> · (1 − e<sup>−t/τ<sub>i</sub></sup>)
        <span class="note">${L('Foster modeli: her katman bir R–τ çiftidir. Tekrarlayan darbede datasheet’in duty-cycle eğrilerini kullan.', 'Foster model: each layer is an R–τ pair. For repetitive pulses use the datasheet’s duty-cycle curves.')}</span></div>
      ${App.lab('lab-pulse', L('Tek darbe: T<sub>j</sub>(t) ve Z<sub>θ</sub>(t<sub>p</sub>)', 'Single pulse: T<sub>j</sub>(t) and Z<sub>θ</sub>(t<sub>p</sub>)'), {
        foot: L('1 in² bakırda DPAK benzeri Foster ağı: R = 0,4 / 1,1 / 8,5 / 40 °C/W, τ = 0,3 ms / 15 ms / 1,5 s / 60 s (R<sub>θJA</sub> = 50 °C/W). T<sub>a</sub> = 25 °C, T<sub>j(max)</sub> = 175 °C.',
                'DPAK-like Foster network on 1 in² copper: R = 0.4 / 1.1 / 8.5 / 40 °C/W, τ = 0.3 ms / 15 ms / 1.5 s / 60 s (R<sub>θJA</sub> = 50 °C/W). T<sub>a</sub> = 25 °C, T<sub>j(max)</sub> = 175 °C.')
      })}

      <h2>${L('PCB bakırı soğutucudur', 'PCB copper is a heatsink')}</h2>
      <p>${L('SMD paketlerde ısı drain pedinden PCB bakırına, oradan havaya gider. R<sub>θJA</sub>’yı düşürmenin yolları:', 'In SMD packages heat goes from the drain pad into the copper, then into the air. Ways to cut R<sub>θJA</sub>:')}</p>
      <ul>
        <li>${L('ped alanını büyüt,', 'enlarge the pad,')}</li>
        <li>${L('katmanları termal via’larla bağla,', 'join layers with thermal vias,')}</li>
        <li>${L('bakırı kalınlaştır (1 oz → 2 oz).', 'use thicker copper (1 oz → 2 oz).')}</li>
      </ul>
      <p>${L('Bir noktadan sonra kazanç azalır; uzaktaki bakır ısıyı pek taşımaz.', 'Beyond a point the gain shrinks; distant copper carries little heat.')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Paket', 'Package')}</th><th class="num">${L('Minimum ped', 'Minimum pad')}</th><th class="num">≈ 1 cm²</th><th class="num">${L('≈ 6,5 cm² (1 in²)', '≈ 6.5 cm² (1 in²)')}</th><th class="num">${L('Geniş, 2 katman + via', 'Large, 2 layers + vias')}</th></tr></thead>
        <tbody>
          <tr><td>SOT-23</td><td class="num">300–350 °C/W</td><td class="num">≈ 200</td><td class="num">≈ 125–150</td><td class="num">≈ 100</td></tr>
          <tr><td>SOT-223</td><td class="num">≈ 130–160</td><td class="num">≈ 90</td><td class="num">≈ 55–60</td><td class="num">≈ 40</td></tr>
          <tr><td>DPAK (TO-252)</td><td class="num">≈ 100</td><td class="num">≈ 70</td><td class="num">≈ 50</td><td class="num">≈ 30</td></tr>
          <tr><td>TO-220 (${L('dik, açık hava', 'upright, free air')})</td><td class="num" colspan="4">≈ 62 °C/W; ${L('soğutucuyla', 'with heatsink')} R<sub>θJC</sub> ${L('≈ 0,5–2', '≈ 0.5–2')} + R<sub>θCS</sub> ${L('≈ 0,5', '≈ 0.5')} + R<sub>θSA</sub></td></tr>
        </tbody></table></div>
      <p class="muted small">${L('1 oz bakır, FR-4 ve durgun hava için kaba değerler. Yerleşim ve hava akışı sonucu çok değiştirir; kritik tasarımda ölç.',
        'Rough values for 1 oz copper, FR-4 and still air. Layout and airflow change them a lot; measure in a critical design.')}</p>

      <h2>${L('Derating: sıcak kılıfta daha az güç', 'Derating: less power with a hot case')}</h2>
      <p>${L('Datasheet’in ön sayfasındaki P<sub>D</sub> yalnızca <b>kılıf 25 °C’de</b> tutulursa geçerlidir. Kılıf ısındıkça izin verilen güç doğrusal düşer ve T<sub>c</sub> = T<sub>j(max)</sub>’da sıfır olur.',
             'The front-page P<sub>D</sub> holds only with the <b>case at 25 °C</b>. As the case warms, allowed power falls linearly and reaches zero at T<sub>c</sub> = T<sub>j(max)</sub>.')}</p>
      ${App.example({
        given: [[L('Parça', 'Part'), 'IRLZ44N'], ['R<sub>θJC</sub>', L('≈ 1,4 °C/W', '≈ 1.4 °C/W')], ['T<sub>j(max)</sub>', '175 °C']],
        steps: [
          [L('T<sub>c</sub> = 25 °C’de', 'At T<sub>c</sub> = 25 °C'), L('(175 − 25) / 1,4', '(175 − 25) / 1.4'), '≈ 107 W', L('datasheet: 110 W', 'datasheet: 110 W')],
          [L('T<sub>c</sub> = 100 °C’de', 'At T<sub>c</sub> = 100 °C'), L('(175 − 100) / 1,4', '(175 − 100) / 1.4'), '≈ 54 W']
        ],
        result: L('<b>110 W yalnızca sonsuz soğutucuyla mümkündür.</b> Gerçek kılıf sıcaklığında değer yarıya iner.', '<b>110 W needs an infinite heatsink.</b> At a realistic case temperature it halves.'),
        level: 'warn'
      })}
      ${App.lab('lab-derate', L('Güç derating eğrisi', 'Power derating curve'), {
        foot: L('P<sub>max</sub>(T<sub>c</sub>) = (T<sub>j(max)</sub> − T<sub>c</sub>) / R<sub>θJC</sub>. Eğim datasheet’te “derating factor” (W/°C) olarak verilir. Varsayılan: IRLZ44N.',
                'P<sub>max</sub>(T<sub>c</sub>) = (T<sub>j(max)</sub> − T<sub>c</sub>) / R<sub>θJC</sub>. Datasheets give the slope as the “derating factor” (W/°C). Default: IRLZ44N.')
      })}

      <h2>${L('MOSFET’leri paralellemek', 'Paralleling MOSFETs')}</h2>
      <p>${L('Tam açık MOSFET’ler akımı kendiliğinden paylaşır. Fazla akım çeken ısınır, direnci artar ve akımın bir kısmı komşusuna geçer.', 'Fully-on MOSFETs share current by themselves. The one carrying more heats up, its resistance rises, and current shifts to its neighbour.')}</p>
      ${App.example({
        given: [[L('Toplam akım', 'Total current'), 'I'], [L('Paralel', 'Parallel'), L('2 MOSFET', '2 MOSFETs')]],
        steps: [
          [L('Parça başına akım', 'Current per part'), 'I / 2', 'I/2'],
          [L('Parça başına kayıp', 'Loss per part'), '(I/2)² · R', 'I²R / 4'],
          [L('Toplam kayıp', 'Total loss'), '2 · (I/2)² · R', 'I²R / 2']
        ],
        result: L('<b>Toplam kayıp yarıya iner ve iki pakete dağılır.</b>', '<b>Total loss halves and spreads over two packages.</b>'),
        level: 'ok'
      })}
      <p>${L('Kurallar:', 'Rules:')}</p>
      <ul>
        <li>${L('aynı parça numarası,', 'same part number,')}</li>
        <li>${L('simetrik yerleşim, eşit source/drain yolları,', 'symmetric layout, equal source/drain paths,')}</li>
        <li>${L('<b>her gate’e ayrı</b> küçük seri direnç: salınımı önler,', 'a <b>separate</b> small resistor on each gate: prevents oscillation,')}</li>
        <li>${L('ortak termal bağlantı.', 'shared thermal coupling.')}</li>
      </ul>
      ${App.figure('fig-par', L('İki paralel MOSFET kendiliğinden dengelenir', 'Two paralleled MOSFETs balance themselves'), {
        foot: L('Toplam 20 A. Q1 R<sub>25</sub> = 18 mΩ, Q2 = 22 mΩ, R<sub>θ</sub> = 15 °C/W, τ ≈ 2 s (ağır çekim). Q2 120 °C’den başlar. Sıcaklıklar yaklaştıkça akımlar dengelenir. Uyarı: lineer bölgede, düşük V<sub>GS</sub>’de katsayı tersine döner ve paylaşım bozulur.',
                'Total 20 A. Q1 R<sub>25</sub> = 18 mΩ, Q2 = 22 mΩ, R<sub>θ</sub> = 15 °C/W, τ ≈ 2 s (slow motion). Q2 starts at 120 °C. As temperatures converge the currents balance. Warning: in the linear region at low V<sub>GS</sub> the coefficient reverses and sharing fails.')
      })}

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <p>${L('5 A sürekli akım, T<sub>a</sub> = 25 °C, gate 4,5–5 V, α = 0,007 /°C. İki aday parçayı karşılaştıralım.', '5 A continuous, T<sub>a</sub> = 25 °C, gate 4.5–5 V, α = 0.007 /°C. Compare two candidates.')}</p>
      <details class="fold"><summary>${L('AO3400A (SOT-23) 5 A taşıyabilir mi?', 'Can an AO3400A (SOT-23) carry 5 A?')}</summary><div>
        ${App.example({
          given: [['I', '5 A'], ['R<sub>DS(on)</sub>', L('32 mΩ @ 4,5 V', '32 mΩ @ 4.5 V')], ['R<sub>θJA</sub>', L('≈ 125 °C/W (1 in²)', '≈ 125 °C/W (1 in²)')]],
          steps: [
            [L('25 °C’de kayıp', 'Loss at 25 °C'), L('5² · 0,032', '5² · 0.032'), L('0,80 W', '0.80 W')],
            [L('İlk T<sub>j</sub> tahmini', 'First T<sub>j</sub> estimate'), L('25 + 0,8 · 125', '25 + 0.8 · 125'), '125 °C'],
            [L('125 °C’de direnç', 'Resistance at 125 °C'), L('32 · 1,7', '32 · 1.7'), '54 mΩ'],
            [L('Yeni kayıp ve T<sub>j</sub>', 'New loss and T<sub>j</sub>'), L('25 + 1,36 · 125', '25 + 1.36 · 125'), '195 °C', L('artmaya devam eder', 'keeps rising')],
            [L('Geri besleme kazancı', 'Feedback gain'), L('G = 0,8 · 0,007 · 125', 'G = 0.8 · 0.007 · 125'), L('0,70', '0.70')],
            [L('Denge sıcaklığı', 'Equilibrium temperature'), L('(25 + 82,5) / 0,30', '(25 + 82.5) / 0.30'), '≈ 358 °C']
          ],
          result: L('<b>AO3400A yanar.</b> Datasheet’teki “5,7 A” 10 s’lik darbe ve 25 °C içindir.', '<b>The AO3400A burns.</b> The datasheet’s “5.7 A” is for a 10 s pulse at 25 °C.'),
          level: 'bad'
        })}
      </div></details>
      <details class="fold"><summary>${L('IRLZ44N (TO-220, soğutucusuz) 5 A taşıyabilir mi?', 'Can an IRLZ44N (TO-220, no heatsink) carry 5 A?')}</summary><div>
        ${App.example({
          given: [['I', '5 A'], ['R<sub>DS(on)</sub>', '25 mΩ @ 5 V'], ['R<sub>θJA</sub>', '62 °C/W']],
          steps: [
            [L('25 °C’de kayıp', 'Loss at 25 °C'), L('25 · 0,025', '25 · 0.025'), L('0,625 W', '0.625 W')],
            [L('Geri besleme kazancı', 'Feedback gain'), L('G = 0,625 · 0,007 · 62', 'G = 0.625 · 0.007 · 62'), L('0,27', '0.27')],
            [L('Denge sıcaklığı', 'Equilibrium temperature'), L('[25 + 0,625 · 62 · 0,825] / 0,73', '[25 + 0.625 · 62 · 0.825] / 0.73'), '≈ 78 °C'],
            [L('Kontrol', 'Check'), L('R = 34,3 mΩ, P = 0,86 W', 'R = 34.3 mΩ, P = 0.86 W'), '78 °C', L('25 + 0,86 · 62 tutuyor', '25 + 0.86 · 62 agrees')],
            [L('Kapalı kutu, T<sub>a</sub> = 50 °C', 'Closed box, T<sub>a</sub> = 50 °C'), L('[50 + 32] / 0,73', '[50 + 32] / 0.73'), '≈ 112 °C']
          ],
          result: L('<b>IRLZ44N uygun.</b> 175 °C’ye 97 °C pay kalır.', '<b>The IRLZ44N is fine.</b> It keeps 97 °C of margin to 175 °C.'),
          level: 'ok'
        })}
      </div></details>
      <details class="fold"><summary>${L('İki AO3400A paralel bağlanırsa?', 'What if two AO3400As are paralleled?')}</summary><div>
        ${App.example({
          given: [[L('Parça başına', 'Per part'), L('2,5 A', '2.5 A')], ['R<sub>DS(on)</sub>', '32 mΩ'], ['R<sub>θJA</sub>', '125 °C/W']],
          steps: [
            [L('25 °C’de kayıp', 'Loss at 25 °C'), L('2,5² · 0,032', '2.5² · 0.032'), L('0,20 W', '0.20 W')],
            [L('Geri besleme kazancı', 'Feedback gain'), L('G = 0,2 · 0,007 · 125', 'G = 0.2 · 0.007 · 125'), L('0,175', '0.175')],
            [L('Denge sıcaklığı', 'Equilibrium temperature'), L('[25 + 0,2 · 125 · 0,825] / 0,825', '[25 + 0.2 · 125 · 0.825] / 0.825'), '≈ 55 °C']
          ],
          result: L('<b>Küçük pakette sınırı akım değil R<sub>θJA</sub> koyar.</b> İki parçayı paralelle ya da DPAK gibi daha büyük paket seç.', '<b>In small packages R<sub>θJA</sub>, not current, sets the limit.</b> Parallel two parts or pick a larger package such as DPAK.'),
          level: 'ok'
        })}
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const degC = v => App.num(v, 0) + ' °C';
    // node colour from temperature: 25 °C → ok, 150 °C → bad
    const tcol = T => `color-mix(in srgb, var(--bad) ${App.clamp((T - 25) / 125 * 100, 0, 100).toFixed(0)}%, var(--ok))`;

    /* ---------------- Figure: thermal circuit ---------------- */
    {
      const fig = root.querySelector('#fig-tc .lab-fig');
      const nodes = [{ x: 80, n: 'T_j' }, { x: 210, n: 'T_c' }, { x: 330, n: 'T_s' }, { x: 500, n: 'T_a' }];
      const svg = Viz.schematic(fig, 600, 250, `
        ${Sch.w([[80, 100], [120, 100]], 'hot')}${Sch.res(150, 100, 90, '')}
        ${Sch.w([[180, 100], [240, 100]], 'hot')}${Sch.res(270, 100, 90, '')}
        ${Sch.w([[300, 100], [360, 100]], 'hot')}${Sch.res(390, 100, 90, '')}
        ${Sch.w([[420, 100], [500, 100], [500, 130]], 'hot')}
        ${Sch.vsrc(500, 160, '')}<text x="518" y="164" class="sch-t">T_a = 25 °C</text>
        ${Sch.w([[500, 190], [500, 220], [80, 220], [80, 176]])}${Sch.gnd(290, 220)}
        ${Sch.w([[80, 100], [80, 144]], 'hot')}
        <g class="sch"><circle cx="80" cy="160" r="16"/><path d="M80,171V153"/><path class="fillink" d="${Sch.arrowHead(80, 148, 80, 170)}"/></g>
        <text id="tcP" x="102" y="164" class="sch-t cu big"></text>
        <text x="150" y="126" class="sch-t" text-anchor="middle">R_θJC</text><text x="150" y="140" class="sch-t muted" text-anchor="middle">${L('1,5 °C/W', '1.5 °C/W')}</text>
        <text x="270" y="126" class="sch-t" text-anchor="middle">R_θCS</text><text x="270" y="140" class="sch-t muted" text-anchor="middle">${L('0,5 °C/W', '0.5 °C/W')}</text>
        <text x="390" y="126" class="sch-t" text-anchor="middle">R_θSA</text><text x="390" y="140" class="sch-t muted" text-anchor="middle">5 °C/W</text>
        ${nodes.map((d, i) => `<circle id="tn${i}" cx="${d.x}" cy="100" r="7" class="tnode"/><text x="${d.x}" y="56" class="sch-t" text-anchor="middle">${d.n}</text><text id="tt${i}" x="${d.x}" y="78" class="sch-t big" text-anchor="middle"></text>`).join('')}
        <text x="300" y="246" class="sch-t muted" text-anchor="middle">${L('ısı akışı = “akım”, sıcaklık = “gerilim”', 'heat flow = “current”, temperature = “voltage”')}</text>
      `);
      const flow = new Viz.Flow(svg, 'M80,171V100H500', { spacing: 16 });
      const R = [1.5, 0.5, 5];
      let t = 0, acc = 1;
      App.onFrame(dt => {
        t += dt; acc += dt;
        const P = 8 + 4 * Math.sin(t * 2 * Math.PI / 8);
        flow.rate = P / 8;
        if (acc < 0.1) return;
        acc = 0;
        const Ts = [25 + P * 7, 25 + P * 5.5, 25 + P * 5, 25];
        Ts.forEach((T, i) => {
          svg.querySelector('#tt' + i).textContent = degC(T);
          svg.querySelector('#tn' + i).style.fill = tcol(T);
        });
        svg.querySelector('#tcP').textContent = 'P = ' + App.num(P, 1) + ' W';
        void R;
      });
    }

    /* ---------------- Lab: iterative Tj ---------------- */
    {
      const lab = root.querySelector('#lab-iter');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const ALPHA = 0.007;
      const PK = {
        sot23: { r: 250, tj: 150, label: 'SOT-23' }, sot223: { r: 60, tj: 150, label: 'SOT-223' },
        dpak1: { r: 50, tj: 175, label: L('DPAK 1 in²', 'DPAK 1 in²') }, dpak2: { r: 30, tj: 175, label: L('DPAK + bakır', 'DPAK + copper') },
        to220: { r: 62, tj: 175, label: 'TO-220' }, to220hs: { r: 6, tj: 175, label: L('TO-220 + soğutucu', 'TO-220 + heatsink') }
      };
      const pIt = new Viz.Plot(fig, {
        w: 600, h: 230, x: [0, 12], y: [0, 300], xTicks: [0, 2, 4, 6, 8, 10, 12], yTicks: [0, 50, 100, 150, 200, 250, 300],
        xLabel: L('yineleme adımı n', 'iteration step n'), yLabel: 'T_j (°C)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const pB = new Viz.Plot(fig, {
        w: 600, h: 220, x: [0, 250], y: [0, 5], xTicks: [0, 50, 100, 150, 200, 250],
        xLabel: 'T_j (°C)', yLabel: 'P (W)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 1)
      });
      let pk = 'to220';
      UI.segmented(ctl, { label: L('Paket / soğutma', 'Package / cooling'), options: Object.keys(PK).map(k => ({ value: k, label: PK[k].label })), value: pk, onChange: v => { pk = v; update(); } });
      const sI = UI.slider(ctl, { label: L('Akım I (RMS)', 'Current I (RMS)'), min: 0.1, max: 30, step: 0.1, value: 5, fmt: v => App.num(v, 1) + ' A', onInput: update });
      const sR = UI.slider(ctl, { label: 'R<sub>DS(on)</sub> @ 25 °C', min: 0.002, max: 0.2, step: 0.0005, log: true, value: 0.025, unit: 'Ω', onInput: update });
      const sTa = UI.slider(ctl, { label: 'T<sub>a</sub>', min: 0, max: 85, step: 1, value: 25, fmt: degC, onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'p25', label: 'P @ 25 °C' }, { key: 'tj', label: 'T<sub>j</sub>' }, { key: 'r', label: 'R<sub>DS(on)</sub> @ T<sub>j</sub>' },
        { key: 'p', label: 'P @ T<sub>j</sub>' }, { key: 'm', label: L('T<sub>j(max)</sub>’a pay', 'Margin to T<sub>j(max)</sub>') }]);
      const st = App.h('div', { class: 'status' }); ctl.appendChild(st);
      function update() {
        const I = sI.value, R25 = sR.value, Ta = sTa.value, Rt = PK[pk].r, Tmax = PK[pk].tj;
        const Rof = T => R25 * (1 + ALPHA * (T - 25));
        const Pof = T => I * I * Rof(T);
        const P25 = I * I * R25, G = P25 * ALPHA * Rt;
        const Tstar = G < 1 ? (Ta + P25 * Rt * (1 - 25 * ALPHA)) / (1 - G) : Infinity;
        // iteration
        const it = [[0, Ta]];
        let T = Ta;
        for (let n = 1; n <= 12; n++) { T = Ta + Pof(T) * Rt; it.push([n, Math.min(T, 1000)]); if (T > 1000) break; }
        pIt.line('it', it, 'cu');
        it.forEach((q, i) => pIt.dot('d' + i, q[0], Math.min(q[1], 300), q[1] > Tmax ? 'bad' : '', 3.5));
        for (let i = it.length; i <= 12; i++) pIt.hide('d' + i, true);
        for (let i = 0; i < it.length; i++) pIt.hide('d' + i, false);
        pIt.hline('tmax', Tmax, 'bad');
        pIt.text('tmaxT', 11.9, Tmax, 'T_j(max) = ' + Tmax + ' °C', 'bad', 'end', 0, -5);
        // balance plot
        const yMax = Math.max(0.5, Math.min(Pof(250) * 1.15, (250 - Ta) / Rt * 1.3));
        pB.setRange({ y: [0, yMax] });
        pB.line('gen', Viz.sample(Pof, 0, 250, 50).filter(q => q[1] <= yMax), 'cu');
        const xe = Math.min(250, Ta + yMax * Rt);
        pB.line('rem', [[Ta, 0], [xe, (xe - Ta) / Rt]], 'ok');
        pB.text('genT', 6, Pof(0), L('üretilen I²·R(T)', 'generated I²·R(T)'), 'cu', 'start', 0, -6);
        pB.text('remT', 246, Math.min((250 - Ta) / Rt, yMax * 0.95), L('atılan (T − T_a)/R_θ', 'removed (T − T_a)/R_θ'), 'ok', 'end', 0, 14);
        pB.vline('tmax', Tmax, 'bad');
        const ok = isFinite(Tstar) && Tstar < 400;
        pB.hide('eq', !ok || Tstar > 250);
        if (ok && Tstar <= 250) pB.dot('eq', Tstar, Pof(Tstar));
        ro.set('p25', App.si(P25, 'W'));
        if (!ok) {
          ro.set('tj', L('kaçak!', 'runaway!'), 'bad'); ro.set('r', '—', 'bad'); ro.set('p', '—', 'bad'); ro.set('m', '—', 'bad');
          st.className = 'status bad';
          st.innerHTML = L('Denge yok (G = ' + App.num(G, 2) + ' ≥ 1 ya da çok yüksek): sıcaklık sınırsız artar. Daha düşük R<sub>DS(on)</sub>, daha iyi soğutma ya da daha az akım gerekli.',
                           'No equilibrium (G = ' + App.num(G, 2) + ' ≥ 1 or far too hot): temperature rises without bound. You need lower R<sub>DS(on)</sub>, better cooling or less current.');
          return;
        }
        const m = Tmax - Tstar;
        ro.set('tj', degC(Tstar), Tstar > Tmax ? 'bad' : m < 30 ? 'warn' : 'ok');
        ro.set('r', App.si(Rof(Tstar), 'Ω') + ' (× ' + App.num(Rof(Tstar) / R25, 2) + ')');
        ro.set('p', App.si(Pof(Tstar), 'W'));
        ro.set('m', (m >= 0 ? '' : '−') + App.num(Math.abs(m), 0) + ' °C', m < 0 ? 'bad' : m < 30 ? 'warn' : 'ok');
        st.className = 'status ' + (m < 0 ? 'bad' : m < 30 ? 'warn' : 'ok');
        st.innerHTML = m < 0 ? L('T<sub>j(max)</sub> aşılıyor: parça hasar görür.', 'T<sub>j(max)</sub> exceeded: the part will be damaged.')
          : m < 30 ? L('Çalışır ama pay az; sıcak ortamda ya da kapalı kutuda sorun çıkar.', 'Works, but little margin; trouble in a hot ambient or a closed box.')
          : L('Rahat. ' + 'G = ' + App.num(G, 2) + ': sıcaklık katsayısı sıcaklık artışını yaklaşık %' + App.num((1 / (1 - G) - 1) * 100, 0) + ' büyüttü.',
              'Comfortable. G = ' + App.num(G, 2) + ': the temperature coefficient raised the rise by about ' + App.num((1 / (1 - G) - 1) * 100, 0) + '%.');
      }
      update();
    }

    /* ---------------- Lab: single pulse, transient thermal impedance ---------------- */
    {
      const lab = root.querySelector('#lab-pulse');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const Rs = [0.4, 1.1, 8.5, 40], Ts = [3e-4, 0.015, 1.5, 60], Ta = 25, TJM = 175;
      const Z = t => t <= 0 ? 0 : Rs.reduce((s, r, i) => s + r * (1 - Math.exp(-t / Ts[i])), 0);
      const pT = new Viz.Plot(fig, { w: 600, h: 230, x: [0, 1], y: [0, 200], xLabel: L('zaman', 'time'), yLabel: 'T_j (°C)', xFmt: v => App.si(v, 's', 2), yFmt: v => App.num(v, 0) });
      const pZ = new Viz.Plot(fig, { w: 600, h: 230, x: [1e-5, 1e3], y: [0.01, 100], logX: true, logY: true,
        xLabel: L('darbe süresi t_p (s)', 'pulse width t_p (s)'), yLabel: 'Z_θ (°C/W)', xFmt: v => App.si(v, 's', 1).replace(' ', ''), yFmt: v => App.num(v, v >= 1 ? 0 : v >= 0.1 ? 1 : 2) });
      pZ.line('z', Viz.sample(e => Math.pow(10, e), -5, 3, 200).map(q => [q[1], Z(q[1])]), 'cu');
      pZ.hline('rja', 50, '');
      pZ.text('rjaT', 1.2e-5, 50, L('R_θJA = 50 (DC)', 'R_θJA = 50 (DC)'), 'muted', 'start', 0, -5);
      const sP = UI.slider(ctl, { label: L('Darbe gücü P', 'Pulse power P'), min: 1, max: 300, value: 30, log: true, step: 0.1, unit: 'W', onInput: update });
      const sTp = UI.slider(ctl, { label: L('Darbe süresi t<sub>p</sub>', 'Pulse width t<sub>p</sub>'), min: 1e-4, max: 300, value: 0.1, log: true, step: 1e-5, unit: 's', onInput: update });
      UI.button(ctl, { label: L('▶ Darbeyi oynat', '▶ Play the pulse'), kind: 'primary', onClick: () => { play = 0; } });
      const ro = UI.readouts(ctl, [
        { key: 'z', label: 'Z<sub>θ</sub>(t<sub>p</sub>)' }, { key: 'pk', label: L('Tepe T<sub>j</sub>', 'Peak T<sub>j</sub>') },
        { key: 'pa', label: L('İzin verilen darbe gücü', 'Allowed pulse power') }, { key: 'pdc', label: L('DC izin (karşılaştır)', 'DC allowed (compare)') }]);
      let play = 0, tEnd = 0.2, curve = [];
      const Tj = (t, P, tp) => Ta + P * (Z(t) - (t > tp ? Z(t - tp) : 0));
      function update() {
        const P = sP.value, tp = sTp.value;
        tEnd = 2.5 * tp;
        curve = Viz.sample(t => Tj(t, P, tp), 0, tEnd, 300);
        const pk = Tj(tp, P, tp);
        pT.setRange({ x: [0, tEnd], y: [0, Math.max(200, Math.ceil(pk / 50) * 50 + 20)] });
        pT.rect('pulse', 0, 0, tp, Math.max(200, Math.ceil(pk / 50) * 50 + 20), 'cu');
        pT.line('tj', curve, 'cu');
        pT.hline('tjm', TJM, 'bad');
        pT.text('tjmT', tEnd, TJM, 'T_j(max) = 175 °C', 'bad', 'end', -4, -5);
        pT.text('pT', tp / 2, 10, L('darbe', 'pulse'), 'cu', 'middle');
        pZ.vline('tp', tp, 'cu');
        pZ.dot('d', tp, Z(tp));
        const z = Z(tp);
        ro.set('z', App.num(z, 2) + ' °C/W');
        ro.set('pk', degC(pk), pk > TJM ? 'bad' : pk > TJM - 30 ? 'warn' : 'ok');
        ro.set('pa', App.si((TJM - Ta) / z, 'W'), 'ok');
        ro.set('pdc', App.si((TJM - Ta) / 50, 'W'));
        play = 0;
      }
      App.onFrame(dt => {
        if (play > 1.3) return;
        play += dt / 3;
        const t = Math.min(1, play) * tEnd;
        pT.dot('cur', t, Tj(t, sP.value, sTp.value), Tj(t, sP.value, sTp.value) > TJM ? 'bad' : '');
      });
      update();
    }

    /* ---------------- Lab: derating ---------------- */
    {
      const lab = root.querySelector('#lab-derate');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p = new Viz.Plot(fig, { w: 600, h: 300, x: [0, 180], y: [0, 160], xTicks: [0, 25, 50, 75, 100, 125, 150, 175],
        xLabel: 'T_case (°C)', yLabel: 'P_max (W)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
      let tjm = 175;
      const sR = UI.slider(ctl, { label: 'R<sub>θJC</sub>', min: 0.3, max: 5, step: 0.05, value: 1.4, fmt: v => App.num(v, 2) + ' °C/W', onInput: update });
      UI.segmented(ctl, { label: 'T<sub>j(max)</sub>', options: [{ value: 150, label: '150 °C' }, { value: 175, label: '175 °C' }], value: tjm, onChange: v => { tjm = v; update(); } });
      const sT = UI.slider(ctl, { label: 'T<sub>case</sub>', min: 25, max: 175, step: 1, value: 90, fmt: degC, onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'pd', label: 'P<sub>D</sub> @ 25 °C' }, { key: 'df', label: L('Derating faktörü', 'Derating factor') }, { key: 'p', label: 'P<sub>max</sub> @ T<sub>case</sub>' }]);
      function update() {
        const R = sR.value, Tc = sT.value;
        const pd = (tjm - 25) / R;
        p.setRange({ y: [0, Math.max(20, Math.ceil(pd * 1.1 / 20) * 20)] });
        p.area('a', [[0, pd], [25, pd], [tjm, 0]], 'cu', 0);
        p.line('l', [[0, pd], [25, pd], [tjm, 0]], 'cu');
        const pm = Math.max(0, (tjm - Tc) / R);
        p.vline('tc', Tc, 'sig');
        p.dot('d', Tc, pm, 'sig');
        p.text('dT', Tc, pm, App.num(pm, 0) + ' W', 'sig', 'start', 8, -8);
        ro.set('pd', App.num(pd, 0) + ' W');
        ro.set('df', App.num(1 / R, 2) + ' W/°C');
        ro.set('p', App.num(pm, 1) + ' W', pm < pd * 0.3 ? 'warn' : 'ok');
      }
      update();
    }

    /* ---------------- Figure: paralleled MOSFETs ---------------- */
    {
      const fig = root.querySelector('#fig-par .lab-fig');
      const svg = Viz.schematic(fig, 600, 250, `
        ${Sch.vcc(300, 26, '+12 V')}${Sch.w([[300, 26], [300, 30]], 'hot')}
        ${Sch.load(300, 60, 0, '20 A')}
        ${Sch.w([[300, 90], [300, 110]], 'hot')}${Sch.dot(300, 110)}
        ${Sch.w([[180, 140], [180, 110], [420, 110], [420, 140]], 'hot')}
        ${Sch.nmos(160, 170, 'Q1')}${Sch.nmos(400, 170, 'Q2')}
        ${Sch.w([[180, 200], [180, 225], [420, 225], [420, 200]], 'hot')}${Sch.dot(300, 225)}${Sch.gnd(300, 225)}
        ${Sch.w([[100, 170], [130, 170]], 'sigw')}${Sch.w([[340, 170], [370, 170]], 'sigw')}
        <circle id="pq1" cx="160" cy="170" r="30" class="tnode" style="opacity:.25"/>
        <circle id="pq2" cx="400" cy="170" r="30" class="tnode" style="opacity:.25"/>
        <text id="pT1" x="40" y="140" class="sch-t big"></text><text id="pI1" x="40" y="200" class="sch-t cu big"></text>
        <text id="pT2" x="470" y="140" class="sch-t big"></text><text id="pI2" x="470" y="200" class="sch-t cu big"></text>
        <text id="pR1" x="40" y="216" class="sch-t muted"></text><text id="pR2" x="470" y="216" class="sch-t muted"></text>
      `);
      const f1 = new Viz.Flow(svg, 'M300,26V110H180V225H300', { spacing: 14 });
      const f2 = new Viz.Flow(svg, 'M300,110H420V225H300', { spacing: 14 });
      const p = new Viz.Plot(fig, { w: 600, h: 190, x: [0, 10], y: [0, 15], yTicks: [0, 5, 10, 15],
        xLabel: L('zaman (s, ağır çekim)', 'time (s, slow motion)'), yLabel: 'I (A)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
      p.text('l1', 0.2, 14, 'I_Q1', 'cu');
      p.text('l2', 1.4, 14, 'I_Q2', 'sig');
      const I = 20, A = 0.007, Rth = 15, tau = 2, Ta = 25, R25 = [0.018, 0.022];
      let T = [25, 120], t = 0, hist = [], acc = 1;
      App.onFrame(dt => {
        t += dt;
        if (t > 10) { t = 0; T = [25, 120]; hist = []; }
        const R = R25.map((r, i) => r * (1 + A * (T[i] - 25)));
        const I1 = I * R[1] / (R[0] + R[1]), I2 = I - I1;
        const Is = [I1, I2];
        T = T.map((Tk, i) => Tk + (Ta + Is[i] * Is[i] * R[i] * Rth - Tk) * Math.min(1, dt / tau));
        hist.push([t, I1, I2]);
        p.line('i1', hist.map(q => [q[0], q[1]]), 'cu');
        p.line('i2', hist.map(q => [q[0], q[2]]), 'sig');
        f1.rate = I1 / 10; f2.rate = I2 / 10;
        acc += dt;
        if (acc < 0.1) return;
        acc = 0;
        [0, 1].forEach(i => {
          svg.querySelector('#pT' + (i + 1)).textContent = 'T = ' + degC(T[i]);
          svg.querySelector('#pI' + (i + 1)).textContent = 'I = ' + App.num(Is[i], 1) + ' A';
          svg.querySelector('#pR' + (i + 1)).textContent = 'R = ' + App.num(R[i] * 1000, 1) + ' mΩ';
          svg.querySelector('#pq' + (i + 1)).style.fill = tcol(T[i]);
        });
      });
    }
  }
});
