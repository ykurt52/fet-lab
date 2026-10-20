/* 03 — How a MOSFET works: structure & channel, threshold, regions, output/transfer curves, R_DS(on) vs V_GS,
   P-channel, body diode, gate capacitance, temperature, real parts */
App.page({
  id: 'mosfet',
  num: '03',
  group: { tr: 'Temeller', en: 'Fundamentals' },
  title: { tr: 'MOSFET nasıl çalışır?', en: 'How does a MOSFET work?' },
  blurb: { tr: 'Kanal oluşumu, V<sub>GS(th)</sub>, ohmik ve doyum bölgeleri, R<sub>DS(on)</sub>, body diyot, P-kanal.', en: 'Channel formation, V<sub>GS(th)</sub>, ohmic vs saturation, R<sub>DS(on)</sub>, body diode, P-channel.' },
  summary: {
    tr: 'MOSFET gerilim kontrollü bir elemandır: gate gerilimi, yalıtkan oksidin altında iletken bir kanal açar. Gate’e sürekli akım gitmez, ama tam açılması için yeterli V<sub>GS</sub> gerekir. Anahtar olarak onu ohmik bölgede, küçük bir direnç gibi tutarız.',
    en: 'A MOSFET is voltage-controlled: the gate voltage opens a conducting channel under an insulating oxide. No steady current flows into the gate, but it needs enough V<sub>GS</sub> to turn fully on. As a switch, we keep it in the ohmic region, acting as a small resistor.'
  },
  render(L) {
    return `
      <style>
        [data-page="mosfet"] .depl { fill: none; stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 4 3; }
        [data-page="mosfet"] .qneg { fill: var(--signal); font: 700 14px var(--f-mono); }
      </style>
      ${App.keys([
        L('V<sub>GS(th)</sub> “zar zor açık” demektir; R<sub>DS(on)</sub> satırına bak.', 'V<sub>GS(th)</sub> means “barely on”; check the R<sub>DS(on)</sub> row instead.'),
        L('3,3 V GPIO için R<sub>DS(on)</sub> 2,5 V’ta garanti olmalı.', 'For a 3.3 V GPIO, R<sub>DS(on)</sub> must be guaranteed at 2.5 V.'),
        L('Tam açık MOSFET ohmik bölgededir; “doyum” orada ısınma demektir.', 'A fully-on MOSFET is ohmic; MOSFET “saturation” means heating.'),
        L('Gate bir kondansatördür: asla boşta bırakma, pull-down koy.', 'The gate is a capacitor: never leave it floating, add a pull-down.'),
        L('Isı hesabını sıcak R<sub>DS(on)</sub> ile yap: 125 °C’de 1,5–2 kat.', 'Compute heat with the hot R<sub>DS(on)</sub>: 1.5–2× at 125 °C.')
      ])}

      <h2>${L('Yapı: N-kanal enhancement MOSFET', 'Structure: the N-channel enhancement MOSFET')}</h2>
      <p>${L('Gate gerilimi sıfırken source ile drain arası kapalıdır. Aralarında sırt sırta iki pn jonksiyonu vardır.',
             'With zero gate voltage, source to drain is blocked. Two back-to-back pn junctions sit between them.')}</p>
      <ul>
        <li>${L('p-tipi gövdede (<b>body</b>) iki n+ bölge: <b>source</b> ve <b>drain</b>.', 'Two n+ regions in a p-type <b>body</b>: the <b>source</b> and the <b>drain</b>.')}</li>
        <li>${L('Aralarının üstünde çok ince SiO₂ yalıtkan ve <b>gate</b> elektrodu.', 'Above the gap: a very thin SiO₂ insulator and the <b>gate</b> electrode.')}</li>
      </ul>
      <p>${L('V<sub>GS</sub> eşiği aşınca yüzeyde bir elektron kanalı oluşur ve source ile drain bağlanır. Sıra şöyledir:',
             'Once V<sub>GS</sub> passes the threshold, an electron channel forms at the surface and links source to drain. In order:')}</p>
      <ul>
        <li>${L('Gate–oksit–body bir kondansatör gibi şarj olur.', 'The gate–oxide–body stack charges like a capacitor.')}</li>
        <li>${L('Oksit altındaki delikler itilir: <b>tükenim bölgesi</b>.', 'Holes under the oxide are pushed away: a <b>depletion region</b>.')}</li>
        <li>${L('Yüzeyde elektronlar toplanır ve p bölgesini n-tipine çevirir: <b>inversion kanalı</b>.', 'Electrons gather at the surface and invert it to n-type: the <b>inversion channel</b>.')}</li>
      </ul>
      ${App.lab('lab-xs', L('Kesit: V<sub>GS</sub> ile kanalı büyüt', 'Cross-section: grow the channel with V<sub>GS</sub>'), {
        foot: L('Mavi: kanaldaki elektronlar (source → drain). Bakır: dış devredeki akım. Model: V<sub>th</sub> = 2,0 V, k = 0,5 A/V², kare yasası, body source’ta. V<sub>DS</sub> &gt; V<sub>GS</sub> − V<sub>th</sub> olunca kanal drain ucunda daralır (pinch-off) ve akım artık pek artmaz.',
                'Blue: electrons in the channel (source → drain). Copper: current in the external circuit. Model: V<sub>th</sub> = 2.0 V, k = 0.5 A/V², square law, body tied to source. When V<sub>DS</sub> &gt; V<sub>GS</sub> − V<sub>th</sub> the channel pinches off at the drain and the current barely rises.')
      })}

      <h2>${L('Eşik gerilimi V<sub>GS(th)</sub>: “tam açık” değil, “zar zor açık”', 'Threshold voltage V<sub>GS(th)</sub>: “barely on”, not “fully on”')}</h2>
      <p>${L('Eşik, MOSFET’in amper taşıdığı değil, <b>iletmeye başladığı</b> noktadır. Datasheet onu çok küçük bir akımda ölçer: <b>I<sub>D</sub> = 250 µA</b>, V<sub>DS</sub> = V<sub>GS</sub>.',
             'The threshold is where the MOSFET <b>starts</b> to conduct, not where it carries amps. Datasheets measure it at a tiny current: <b>I<sub>D</sub> = 250 µA</b>, V<sub>DS</sub> = V<sub>GS</sub>.')}</p>
      <p>${L('Eşik bir aralıktır; IRF540N için 2–4 V. “Eşik 2 V, 3,3 V yeter” yanlıştır: en kötü parça 4 V’ta bile yalnızca 250 µA geçirir.',
             'The threshold is a range; 2–4 V for the IRF540N. “Threshold is 2 V, so 3.3 V is enough” is wrong: the worst part passes only 250 µA even at 4 V.')}</p>
      <div class="call warn"><strong>${L('Doğru soru: R<sub>DS(on)</sub> hangi V<sub>GS</sub>’de garanti?', 'The right question: at what V<sub>GS</sub> is R<sub>DS(on)</sub> guaranteed?')}</strong>
        ${L('Cevabı eşik değil, R<sub>DS(on)</sub> tablosu verir. 3,3 V GPIO için 2,5 V ya da 2,7 V satırı, 5 V için 4,5 V satırı gerekir. “Logic-level” genelde 4,5–5 V demektir, 3,3 V değil.',
            'The R<sub>DS(on)</sub> table answers it, not the threshold. A 3.3 V GPIO needs a 2.5 V or 2.7 V row; 5 V needs a 4.5 V row. “Logic-level” usually means 4.5–5 V, not 3.3 V.')}</div>

      <h2>${L('Üç bölge ve isim karmaşası', 'Three regions and a naming trap')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Bölge', 'Region')}</th><th>${L('Koşul', 'Condition')}</th><th>I<sub>D</sub></th><th>${L('Davranış', 'Behaviour')}</th><th>${L('Kullanım', 'Used for')}</th></tr></thead>
        <tbody>
          <tr><td><span class="pill">${L('Kesim', 'Cutoff')}</span></td><td>V<sub>GS</sub> &lt; V<sub>th</sub></td><td>≈ 0 ${L('(nA–µA kaçak)', '(nA–µA leakage)')}</td><td>${L('açık devre', 'open circuit')}</td><td>${L('Anahtar KAPALI', 'Switch OFF')}</td></tr>
          <tr><td><span class="pill ok">${L('Ohmik (lineer, triode)', 'Ohmic (linear, triode)')}</span></td><td>V<sub>DS</sub> &lt; V<sub>GS</sub> − V<sub>th</sub></td><td>k[(V<sub>GS</sub>−V<sub>th</sub>)V<sub>DS</sub> − V<sub>DS</sub>²/2]</td><td>${L('direnç gibi: R<sub>DS(on)</sub>', 'acts as a resistor: R<sub>DS(on)</sub>')}</td><td>${L('Anahtar AÇIK', 'Switch ON')}</td></tr>
          <tr><td><span class="pill warn">${L('Doyum (aktif)', 'Saturation (active)')}</span></td><td>V<sub>DS</sub> ≥ V<sub>GS</sub> − V<sub>th</sub></td><td>(k/2)(V<sub>GS</sub>−V<sub>th</sub>)²</td><td>${L('akım kaynağı', 'current source')}</td><td>${L('Yükselteç, inrush sınırlama; anahtarda geçiş anı', 'Amplifier, inrush limiting; transitions in a switch')}</td></tr>
        </tbody></table></div>
      <div class="call bad"><strong>${L('“Doyum” kelimesi iki transistörde zıt anlamda', '“Saturation” means opposite things for the two transistors')}</strong>
        ${L('BJT’de doyum = anahtar tam açık. MOSFET’te doyum = akım kaynağı bölgesi; V<sub>DS</sub> büyük, parça ısınıyor. Tam açık MOSFET <b>ohmik</b> bölgededir.',
            'For a BJT, saturation = switch fully on. For a MOSFET, saturation = current-source region; V<sub>DS</sub> is large and the part heats up. A fully-on MOSFET is in the <b>ohmic</b> region.')}</div>
      <div class="eq">${L('Ohmik', 'Ohmic')}: I<sub>D</sub> = k · [(V<sub>GS</sub> − V<sub>th</sub>) · V<sub>DS</sub> − V<sub>DS</sub>²/2] &nbsp;&nbsp; ⇒ &nbsp;&nbsp; <b>R<sub>DS(on)</sub> ≈ 1 / (k · (V<sub>GS</sub> − V<sub>th</sub>))</b><br>
        ${L('Doyum', 'Saturation')}: I<sub>D</sub> = (k/2) · (V<sub>GS</sub> − V<sub>th</sub>)² · (1 + λ·V<sub>DS</sub>)
        <span class="note">${L('Basit kare yasası. Güç MOSFET’inde drift bölgesi, bağlantı telleri ve paket direnci de eklenir. Bu yüzden R<sub>DS(on)</sub> yüksek V<sub>GS</sub>’de düzleşir.',
                              'The simple square law. In power MOSFETs the drift region, bond wires and package add resistance. That is why R<sub>DS(on)</sub> flattens at high V<sub>GS</sub>.')}</span></div>
      ${App.lab('lab-out', L('I<sub>D</sub>–V<sub>DS</sub> eğrileri, yük doğrusu ve Q noktası', 'I<sub>D</sub>–V<sub>DS</sub> curves, load line and Q point'), {
        foot: L('Model: V<sub>th</sub> = 2,0 V, k = 1 A/V², λ = 0,02 V<sup>−1</sup>. Yeşil alan ohmik bölgedir. Devre: V<sub>DD</sub> → R<sub>yük</sub> → drain, source toprakta. Q’yu yeşil alana sokacak kadar V<sub>GS</sub> ver: kayıp düşer.',
                'Model: V<sub>th</sub> = 2.0 V, k = 1 A/V², λ = 0.02 V<sup>−1</sup>. The green area is the ohmic region. Circuit: V<sub>DD</sub> → R<sub>load</sub> → drain, source to ground. Give enough V<sub>GS</sub> to push Q into the green area and the loss drops.')
      })}

      <h2>${L('Transfer eğrisi ve R<sub>DS(on)</sub>–V<sub>GS</sub>', 'Transfer curve and R<sub>DS(on)</sub> vs V<sub>GS</sub>')}</h2>
      <p>${L('Datasheet R<sub>DS(on)</sub> değerlerini eğrinin düz kısmında verir: 4,5 V ve 10 V. Eşiğin hemen üstünde R<sub>DS(on)</sub> çok büyüktür, sonra hızla düşer ve düzleşir.',
             'Datasheets give R<sub>DS(on)</sub> on the flat part of the curve: 4.5 V and 10 V. Just above threshold R<sub>DS(on)</sub> is huge, then falls steeply and flattens.')}</p>
      <ul>
        <li>${L('Transfer eğrisi: I<sub>D</sub>, V<sub>GS</sub>’nin fonksiyonu.', 'Transfer curve: I<sub>D</sub> as a function of V<sub>GS</sub>.')}</li>
        <li>${L('Eşiğin altında da <b>alt-eşik</b> akımı vardır; her ≈ 90 mV’de 10 kat artar.', 'Below threshold a <b>subthreshold</b> current still flows; it grows 10× every ≈ 90 mV.')}</li>
        <li>${L('Eşik, bu eğrinin 250 µA’i kestiği noktadır.', 'The threshold is where this curve crosses 250 µA.')}</li>
      </ul>
      ${App.lab('lab-tr', L('Eşik nerede, R<sub>DS(on)</sub> nerede düzleşir?', 'Where is the threshold, where does R<sub>DS(on)</sub> flatten?'), {
        foot: L('Model: R<sub>DS(on)</sub> = R<sub>sabit</sub> + R<sub>kanal</sub>; R<sub>sabit</sub> = 0,4·R<sub>10V</sub>, R<sub>kanal</sub> ∝ 1/(V<sub>GS</sub> − V<sub>th</sub>). Transfer eğrisi EKV benzeri, alt-eşik eğimi ≈ 90 mV/dekad, 25 °C. Gerçek eğriler yüksek akımda büker.',
                'Model: R<sub>DS(on)</sub> = R<sub>fixed</sub> + R<sub>channel</sub>; R<sub>fixed</sub> = 0.4·R<sub>10V</sub>, R<sub>channel</sub> ∝ 1/(V<sub>GS</sub> − V<sub>th</sub>). EKV-like transfer curve, subthreshold slope ≈ 90 mV/decade, 25 °C. Real curves bend at high current.')
      })}

      <h2>${L('P-kanal MOSFET', 'The P-channel MOSFET')}</h2>
      <p>${L('P-MOSFET doğal bir <b>high-side</b> anahtardır. Source pozitif beslemededir: gate source geriliminde = kapalı, gate toprakta = açık.',
             'A P-MOSFET is a natural <b>high-side</b> switch. Its source sits on the positive supply: gate at source voltage = off, gate at ground = on.')}</p>
      <ul>
        <li>${L('Katkılar terstir: n-tipi gövdede p+ source/drain; kanalı <b>delikler</b> oluşturur.', 'Doping is reversed: p+ source/drain in an n-type body; <b>holes</b> form the channel.')}</li>
        <li>${L('Açmak için gate source’a göre <b>negatif</b> olmalı: V<sub>GS</sub> &lt; V<sub>th</sub> &lt; 0.', 'To turn on, the gate must be <b>negative</b> relative to the source: V<sub>GS</sub> &lt; V<sub>th</sub> &lt; 0.')}</li>
        <li>${L('Delikler yavaştır, bu yüzden R<sub>DS(on)</sub> <b>2–3 kat</b> yüksektir: IRF540N 44 mΩ, IRF9540N 117 mΩ.', 'Holes are slower, so R<sub>DS(on)</sub> is <b>2–3×</b> higher: IRF540N 44 mΩ, IRF9540N 117 mΩ.')}</li>
        <li>${L('Yüksek akımda bu yüzden N-kanal tercih edilir.', 'That is why N-channel is preferred at high current.')}</li>
      </ul>
      ${App.figure('fig-np', L('N-kanal low-side ve P-kanal high-side', 'N-channel low-side and P-channel high-side'), {
        foot: L('Bakır noktalar yük akımıdır. N-MOSFET’te akım drain → source, P-MOSFET’te source → drain akar; body diyot ikisinde de ters kutupludur. 3,3 V GPIO, 12 V’taki P-MOSFET’i kapatamaz; Bölüm 07’deki seviye kaydırıcı gerekir.',
                'Copper dots are load current. N-MOSFET: drain → source; P-MOSFET: source → drain; the body diode stays reverse-biased in both. A 3.3 V GPIO cannot turn off a 12 V P-MOSFET; you need the level shifter in Chapter 07.')
      })}

      <h2>${L('Body diyot: her MOSFET’in içindeki gizli diyot', 'The body diode: the hidden diode in every MOSFET')}</h2>
      <p>${L('Drain source’un altına inerse body diyot gate ne derse desin iletir. Diyot, body’nin source’a bağlanmasından doğar. N-kanalda anodu source’ta, katodu drain’dedir.',
             'If the drain goes below the source, the body diode conducts whatever the gate says. It exists because the body is tied to the source. In an N-channel part its anode is at the source, its cathode at the drain.')}</p>
      <ul>
        <li>${L('MOSFET akımı yalnızca bir yönde keser. Ters polarite koruması bu yönü bilinçli kullanır (Bölüm 12).', 'A MOSFET blocks only one direction. Reverse-polarity protection uses this on purpose (Chapter 12).')}</li>
        <li>${L('H-köprüde dead-time sırasında freewheel yolu body diyottur. Yavaş ters toparlanması kayıp ve gürültü yaratır.', 'In an H-bridge the body diode is the freewheel path during dead-time. Its slow reverse recovery causes loss and noise.')}</li>
        <li>${L('Diyot iletirken gate’i açarsan akım kanala geçer. Düşüm 0,7–1,2 V’tan I·R<sub>DS(on)</sub>’a iner: ters iletim.', 'Turn the gate on while the diode conducts and current moves into the channel. The drop falls from 0.7–1.2 V to I·R<sub>DS(on)</sub>: reverse conduction.')}</li>
      </ul>
      ${App.figure('fig-bd', L('Body diyot animasyonu: dört durum', 'Body diode animation: four cases'), {
        foot: L('Döngü: (1) normal, gate kapalı → akım yok. (2) normal, gate açık → kanal iletir. (3) ters, gate kapalı → body diyot iletir, ≈ 0,8 V. (4) ters, gate açık → kanal ters iletir, düşüm I·R<sub>DS(on)</sub>.',
                'Cycle: (1) normal, gate off → no current. (2) normal, gate on → the channel conducts. (3) reversed, gate off → the body diode conducts, ≈ 0.8 V. (4) reversed, gate on → the channel conducts in reverse, drop I·R<sub>DS(on)</sub>.')
      })}

      <h2>${L('Gate bir kondansatördür', 'The gate is a capacitor')}</h2>
      <p>${L('Gate’i ne kadar hızlı şarj edersen MOSFET o kadar hızlı anahtarlanır. Sürekli gate akımı yoktur, ama açmak için gate kapasitanslarına bir <b>yük Q<sub>g</sub></b> taşımak gerekir.',
             'The faster you charge the gate, the faster the MOSFET switches. There is no steady gate current, but turning on means delivering a <b>charge Q<sub>g</sub></b> to the gate capacitances.')}</p>
      <div class="eq">t<sub>${L('geçiş', 'switch')}</sub> ≈ Q<sub>g</sub> / I<sub>gate</sub> &nbsp;&nbsp;&nbsp; P<sub>${L('sürücü', 'drive')}</sub> = Q<sub>g</sub> · V<sub>GS</sub> · f<sub>PWM</sub>
        <span class="note">${L('Ayrıntılar Bölüm 09 ve 10’da.', 'Details in Chapters 09 and 10.')}</span></div>
      ${App.example({
        given: [['IRLZ44N Q<sub>g</sub>', '48 nC']],
        steps: [
          [L('GPIO ile, 20 mA', 'From a GPIO, 20 mA'), 't = 48 nC / 20 mA', L('2,4 µs', '2.4 µs')],
          [L('Gate sürücüyle, 1 A', 'From a gate driver, 1 A'), 't = 48 nC / 1 A', '48 ns']
        ],
        result: L('<b>Gate sürücü 50 kat hızlı anahtarlar.</b> Yavaş geçiş, her kenarda ek ısı demektir.', '<b>A gate driver switches 50× faster.</b> A slow edge means extra heat on every transition.')
      })}
      <div class="call warn"><strong>${L('Gate’i asla boşta bırakma', 'Never leave the gate floating')}</strong>
        ${L('Boştaki gate yükünü saatlerce tutar ve gürültü toplar. Yarı açık kalıp MOSFET’i lineer bölgede ısıtabilir. Gate–source arasına 10–100 kΩ pull-down koy (Bölüm 04).',
            'A floating gate holds its charge for hours and picks up noise. It can sit half-on and cook the MOSFET in its linear region. Put a 10–100 kΩ pull-down from gate to source (Chapter 04).')}</div>
      <p>${L('Gate oksidi onlarca nm incedir. V<sub>GS</sub> mutlak sınırı tipik <b>±20 V</b>, bazı düşük gerilim parçalarda ±12 V ya da ±8 V. Bunu aşan sıçrama oksidi kalıcı deler.',
             'The gate oxide is only tens of nm thick. Absolute max V<sub>GS</sub> is typically <b>±20 V</b>, ±12 V or ±8 V on some low-voltage parts. A spike beyond it punches through the oxide permanently.')}</p>

      <h2>${L('Sıcaklık: R<sub>DS(on)</sub> ısındıkça artar', 'Temperature: R<sub>DS(on)</sub> rises as it heats')}</h2>
      <p>${L('125 °C’de R<sub>DS(on)</sub>, 25 °C değerinin <b>1,5–2 katıdır</b>. Düşük gerilim parçalarda ≈ 1,5×, yüksek gerilimde ≈ 2×. Datasheet’teki “Normalized R<sub>DS(on)</sub> vs T<sub>J</sub>” grafiği bunu verir.',
             'At 125 °C, R<sub>DS(on)</sub> is <b>1.5–2×</b> its 25 °C value. About 1.5× for low-voltage parts, 2× for high-voltage ones. The datasheet’s “Normalized R<sub>DS(on)</sub> vs T<sub>J</sub>” graph gives it.')}</p>
      <ul>
        <li>${L('Isı hesabını <b>sıcak</b> R<sub>DS(on)</sub> ile yap (Bölüm 13).', 'Do the thermal calculation with the <b>hot</b> R<sub>DS(on)</sub> (Chapter 13).')}</li>
        <li>${L('Tam açık MOSFET’ler <b>paralellenebilir</b>: ısınanın direnci artar, akım diğerine kayar.', 'Fully-on MOSFETs can be <b>paralleled</b>: the hotter one’s resistance rises and current shifts away.')}</li>
        <li>${L('BJT’de tersi olur; bu yüzden emitter direnci gerekir.', 'BJTs do the opposite, which is why they need emitter resistors.')}</li>
      </ul>
      ${App.figure('fig-temp', L('Normalize R<sub>DS(on)</sub> – jonksiyon sıcaklığı', 'Normalised R<sub>DS(on)</sub> vs junction temperature'), {
        foot: L('Yaklaşık: R(T)/R(25 °C) = (T/298 K)<sup>a</sup>; düşük gerilimde a ≈ 1,5, yüksek gerilimde a ≈ 2,3. Gerçek değer için parçanın kendi grafiğine bak.',
                'Approximate: R(T)/R(25 °C) = (T/298 K)<sup>a</sup>; a ≈ 1.5 for low-voltage, a ≈ 2.3 for high-voltage parts. For real numbers use the part’s own graph.')
      })}

      <h2>${L('Gerçek parçalar', 'Real parts')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Tip / paket', 'Type / package')}</th><th class="num">V<sub>DS</sub></th><th class="num">I<sub>D</sub> (25 °C)</th><th class="num">V<sub>GS(th)</sub></th><th class="num">R<sub>DS(on)</sub> ${L('(maks.)', '(max)')}</th><th class="num">Q<sub>g</sub></th></tr></thead>
        <tbody>
          <tr><td>2N7002</td><td>N, SOT-23</td><td class="num">60 V</td><td class="num">${L('0,115–0,3 A', '0.115–0.3 A')}</td><td class="num">${L('1–2,5 V', '1–2.5 V')}</td><td class="num">${L('≈ 2–7,5 Ω @ 4,5–10 V', '≈ 2–7.5 Ω @ 4.5–10 V')}</td><td class="num">≈ 1 nC</td></tr>
          <tr><td>AO3400A</td><td>N, SOT-23</td><td class="num">30 V</td><td class="num">${L('5,7 A', '5.7 A')}</td><td class="num">${L('0,65–1,45 V', '0.65–1.45 V')}</td><td class="num">${L('26,5 mΩ @ 10 V<br>32 mΩ @ 4,5 V<br>48 mΩ @ 2,5 V', '26.5 mΩ @ 10 V<br>32 mΩ @ 4.5 V<br>48 mΩ @ 2.5 V')}</td><td class="num">≈ 6 nC</td></tr>
          <tr><td>Si2301</td><td>P, SOT-23</td><td class="num">−20 V</td><td class="num">${L('≈ −2,5 A', '≈ −2.5 A')}</td><td class="num">${L('−0,4…−1 V', '−0.4…−1 V')}</td><td class="num">${L('≈ 0,11 Ω @ −4,5 V<br>≈ 0,15 Ω @ −2,5 V', '≈ 0.11 Ω @ −4.5 V<br>≈ 0.15 Ω @ −2.5 V')}</td><td class="num">≈ 5 nC</td></tr>
          <tr><td>IRLZ44N</td><td>N, TO-220, logic-level</td><td class="num">55 V</td><td class="num">47 A</td><td class="num">1–2 V</td><td class="num">22 mΩ @ 10 V<br>25 mΩ @ 5 V<br>35 mΩ @ 4 V</td><td class="num">≈ 48 nC</td></tr>
          <tr><td>IRF540N</td><td>N, TO-220</td><td class="num">100 V</td><td class="num">33 A</td><td class="num">2–4 V</td><td class="num">44 mΩ @ 10 V</td><td class="num">≈ 71 nC</td></tr>
          <tr><td>IRF9540N</td><td>P, TO-220</td><td class="num">−100 V</td><td class="num">−23 A</td><td class="num">−2…−4 V</td><td class="num">117 mΩ @ −10 V</td><td class="num">≈ 97 nC</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('Yaklaşık datasheet değerleri; tasarımda güncel datasheet’i kullan. I<sub>D</sub> 25 °C kılıf ve ideal soğutma içindir. IRF540N’in R<sub>DS(on)</sub>’ı yalnızca 10 V’ta garanti: GPIO ile doğrudan sürülmez.',
        'Approximate datasheet values; design with the current datasheet. I<sub>D</sub> assumes a 25 °C case and ideal cooling. The IRF540N’s R<sub>DS(on)</sub> is guaranteed only at 10 V: no direct GPIO drive.')}</p>

      <details class="fold"><summary>${L('Çözümlü örnek: 3,3 V GPIO ile 3 A, 12 V yük', 'Worked example: a 3 A, 12 V load from a 3.3 V GPIO')}</summary><div>
        <p>${L('Önce adayları R<sub>DS(on)</sub> satırına göre ele, sonra kalanın ısısını hesapla.', 'First screen the candidates by their R<sub>DS(on)</sub> rows, then compute the heat of the survivor.')}</p>
        <div class="table-wrap"><table>
          <thead><tr><th>${L('Aday', 'Candidate')}</th><th>${L('En düşük garanti satırı', 'Lowest guaranteed row')}</th><th>${L('Karar', 'Verdict')}</th></tr></thead>
          <tbody>
            <tr><td>IRF540N</td><td>${L('yalnızca 10 V; V<sub>th</sub> 4 V’a kadar', '10 V only; V<sub>th</sub> up to 4 V')}</td><td><span class="pill bad">${L('uygun değil', 'unsuitable')}</span></td></tr>
            <tr><td>IRLZ44N</td><td>${L('35 mΩ @ 4 V; 3,3 V’ta garanti yok', '35 mΩ @ 4 V; nothing at 3.3 V')}</td><td><span class="pill warn">${L('sınırda', 'marginal')}</span></td></tr>
            <tr><td>AO3400A</td><td>${L('48 mΩ @ 2,5 V', '48 mΩ @ 2.5 V')}</td><td><span class="pill ok">${L('aday', 'candidate')}</span></td></tr>
          </tbody></table></div>
        ${App.example({
          given: [['I', '3 A'], ['V', '12 V'], [L('R<sub>DS(on)</sub> @ 3,3 V', 'R<sub>DS(on)</sub> @ 3.3 V'), '≈ 35 mΩ'], ['R<sub>θJA</sub>', L('125 °C/W, iyi bakır', '125 °C/W, good copper')], ['T<sub>a</sub>', '25 °C']],
          steps: [
            [L('Sıcak R<sub>DS(on)</sub>', 'Hot R<sub>DS(on)</sub>'), L('R = 35 mΩ · 1,4 (100 °C)', 'R = 35 mΩ · 1.4 (100 °C)'), '≈ 50 mΩ'],
            [L('Kayıp', 'Loss'), L('P = 3² · 0,05', 'P = 3² · 0.05'), L('0,45 W', '0.45 W')],
            [L('Sıcaklık artışı', 'Temperature rise'), L('ΔT = 0,45 · 125', 'ΔT = 0.45 · 125'), '≈ 56 °C'],
            [L('Jonksiyon sıcaklığı', 'Junction temperature'), 'T<sub>j</sub> = 25 + 56', '≈ 81 °C'],
            [L('Gerilim payı', 'Voltage margin'), L('30 V ≥ 1,5 · 12 = 18 V', '30 V ≥ 1.5 · 12 = 18 V'), L('yeterli', 'OK')]
          ],
          result: L('<b>AO3400A uygun; bakır alanına dikkat.</b> Gate: 100 Ω seri + 100 kΩ pull-down; yük endüktifse flyback diyot ekle.', '<b>The AO3400A works; mind the copper area.</b> Gate: 100 Ω series + 100 kΩ pull-down; add a flyback diode if the load is inductive.')
        })}
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const mosId = Viz.phys.mosId;

    /* ---------------- Lab: cross-section ---------------- */
    {
      const lab = root.querySelector('#lab-xs');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const VTH = 2.0, K = 0.5;
      let negs = '';
      for (let i = 0; i < 9; i++) negs += `<text class="qneg" x="${212 + i * 22}" y="128" text-anchor="middle">−</text>`;
      const svg = Viz.schematic(fig, 600, 300, `
        <rect x="40" y="110" width="520" height="150" class="layer p"/>
        <rect x="60" y="110" width="140" height="46" rx="4" class="layer n"/>
        <rect x="400" y="110" width="140" height="46" rx="4" class="layer n"/>
        <path id="xsDepG" class="depl" d=""/>
        <path id="xsDepD" class="depl" d=""/>
        <path id="xsChan" class="layer chan" d=""/>
        <g id="xsNeg">${negs}</g>
        <rect x="190" y="100" width="220" height="10" class="layer ox"/>
        <rect x="190" y="80" width="220" height="20" class="layer metal"/>
        <rect x="90" y="98" width="80" height="12" class="layer metal"/>
        <rect x="430" y="98" width="80" height="12" class="layer metal"/>
        <text x="130" y="150" class="sch-t big" text-anchor="middle">n+</text>
        <text x="470" y="150" class="sch-t big" text-anchor="middle">n+</text>
        <text x="300" y="250" class="sch-t muted" text-anchor="middle">p (body)</text>
        <text x="418" y="94" class="sch-t muted">SiO₂</text>
        ${Sch.w([[130, 98], [130, 40]], 'hot')}<text x="130" y="30" class="sch-t big" text-anchor="middle">S</text>
        ${Sch.w([[470, 98], [470, 40]], 'hot')}<text x="470" y="30" class="sch-t big" text-anchor="middle">D</text>
        ${Sch.w([[300, 80], [300, 40]], 'sigw')}<text x="300" y="30" class="sch-t big sig" text-anchor="middle">G</text>
        ${Sch.w([[40, 230], [22, 230], [22, 60], [130, 60]])}${Sch.dot(130, 60)}<text x="16" y="240" class="sch-t muted">B</text>
        <text id="xsVgs" x="312" y="58" class="sch-t sig"></text>
        <text id="xsVds" x="482" y="58" class="sch-t cu"></text>
        <text id="xsReg" x="300" y="288" class="sch-t big" text-anchor="middle"></text>
      `);
      const eFlow = new Viz.Flow(svg, 'M100,128H200L212,114H388L400,128H500', { cls: 'flow e', spacing: 18, speed: 60, r: 2.6 });
      const dFlow = new Viz.Flow(svg, 'M470,40V98', { spacing: 14 });
      const sFlow = new Viz.Flow(svg, 'M130,98V62', { spacing: 14 });
      const chan = svg.querySelector('#xsChan'), negG = svg.querySelector('#xsNeg');
      const depG = svg.querySelector('#xsDepG'), depD = svg.querySelector('#xsDepD');
      const sG = UI.slider(ctl, { label: 'V<sub>GS</sub>', min: 0, max: 6, step: 0.05, value: 1.2, fmt: v => App.num(v, 2) + ' V', onInput: update });
      const sD = UI.slider(ctl, { label: 'V<sub>DS</sub>', min: 0, max: 6, step: 0.05, value: 1.0, fmt: v => App.num(v, 2) + ' V', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'vov', label: 'V<sub>GS</sub> − V<sub>th</sub>' }, { key: 'id', label: 'I<sub>D</sub>' },
        { key: 'r', label: 'V<sub>DS</sub> / I<sub>D</sub>' }, { key: 'reg', label: L('Bölge', 'Region') }]);
      const st = App.h('div', { class: 'status' }); ctl.appendChild(st);
      function update() {
        const vgs = sG.value, vds = sD.value, vov = vgs - VTH;
        const id = mosId(vgs, vds, VTH, K, 0.02);
        // channel thickness: source end ts, drain end td (pinch-off when vds >= vov)
        const ts = vov > 0 ? 3 + 7 * Math.min(1, vov / 3) : 0;
        const td = vov > 0 ? ts * Math.max(0, 1 - vds / vov) : 0;
        const xp = vov > 0 && vds > vov ? 400 - 22 * Math.min(1, (vds - vov) / 3) : 400; // pinch-off point moves toward source
        chan.setAttribute('d', vov <= 0 ? '' : vds < vov ? `M200,110H400V${(110 + td).toFixed(1)}L200,${(110 + ts).toFixed(1)}Z` : `M200,110H${xp.toFixed(1)}L200,${(110 + ts).toFixed(1)}Z`);
        chan.style.opacity = vov > 0 ? (0.35 + 0.5 * Math.min(1, vov / 3)).toFixed(2) : 0;
        negG.style.opacity = App.clamp(vgs / VTH, 0, 1) * (vov > 0 ? 0.35 : 0.9);
        // depletion depth under gate grows until threshold, then pins
        const dg = 6 + 20 * Math.sqrt(App.clamp(vgs, 0, VTH) / VTH);
        depG.setAttribute('d', vgs > 0.05 ? `M200,110V${110 + dg}H400V110` : '');
        const dd = 6 + 8 * Math.sqrt(vds + 0.7);
        depD.setAttribute('d', `M${400 - dd * 0.6},110V${156 + dd * 0.4}Q${400 - dd * 0.6},${156 + dd} ${400 + 10},${156 + dd}H540`);
        const region = vov <= 0 ? 'cut' : vds < vov ? 'ohm' : 'sat';
        const rate = App.clamp(id / 1.5, 0, 2.5);
        eFlow.rate = id > 1e-4 ? Math.max(0.15, rate) : 0;
        dFlow.rate = sFlow.rate = id > 1e-4 ? Math.max(0.15, rate) : 0;
        ro.set('vov', App.num(vov, 2) + ' V', vov > 0 ? 'ok' : '');
        ro.set('id', App.si(id, 'A'));
        ro.set('r', id > 1e-6 && vds > 0.01 ? App.si(vds / id, 'Ω') : '∞');
        ro.set('reg', region === 'cut' ? L('Kesim', 'Cutoff') : region === 'ohm' ? L('Ohmik', 'Ohmic') : L('Doyum (pinch-off)', 'Saturation (pinch-off)'),
          region === 'ohm' ? 'ok' : region === 'sat' ? 'warn' : '');
        svg.querySelector('#xsVgs').textContent = 'V_GS = ' + App.num(vgs, 2) + ' V';
        svg.querySelector('#xsVds').textContent = 'V_DS = ' + App.num(vds, 2) + ' V';
        const rg = svg.querySelector('#xsReg');
        rg.textContent = region === 'cut' ? (vgs > 0.3 ? L('Tükenim var, kanal yok: KESİM', 'Depletion, no channel yet: CUTOFF') : L('Kanal yok: KESİM', 'No channel: CUTOFF'))
          : region === 'ohm' ? L('Kanal tam boy: OHMİK (direnç gibi)', 'Full channel: OHMIC (resistor-like)') : L('Drain ucunda pinch-off: DOYUM (akım kaynağı)', 'Pinch-off at the drain: SATURATION (current source)');
        rg.setAttribute('class', 'sch-t big ' + (region === 'ohm' ? 'ok' : region === 'sat' ? 'cu' : 'muted'));
        st.className = 'status ' + (region === 'ohm' ? 'ok' : region === 'sat' ? 'warn' : '');
        st.innerHTML = region === 'cut' ? L('V<sub>GS</sub> eşiğin altında: yüzeyde elektron yok denecek kadar az.', 'V<sub>GS</sub> below threshold: almost no electrons at the surface.')
          : region === 'ohm' ? L('Kanal source’tan drain’e kesintisiz: MOSFET bir direnç gibi.', 'The channel is continuous from source to drain: the MOSFET is a resistor.')
          : L('V<sub>DS</sub> ≥ V<sub>GS</sub> − V<sub>th</sub>: akım artık V<sub>GS</sub> ile sınırlı; anahtarda bu bölgede kalma, ısınır.', 'V<sub>DS</sub> ≥ V<sub>GS</sub> − V<sub>th</sub>: current is now set by V<sub>GS</sub>; a switch must not stay here, it heats.');
      }
      update();
    }

    /* ---------------- Lab: output characteristics ---------------- */
    {
      const lab = root.querySelector('#lab-out');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const VTH = 2.0, K = 1.0, LAM = 0.02;
      const p = new Viz.Plot(fig, {
        w: 600, h: 370, x: [0, 12], y: [0, 10],
        xLabel: 'V_DS (V)', yLabel: 'I_D (A)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const vmax = Math.sqrt(2 * 10 / K);
      p.area('ohm', Viz.sample(v => K * v * v / 2, 0, vmax, 60), 'ok', 10);
      p.line('bnd', Viz.sample(v => K * v * v / 2, 0, vmax, 60), 'ok dash thin');
      p.text('ohmT', 0.3, 9.3, L('ohmik', 'ohmic'), 'ok');
      p.text('satT', 11.8, 9.3, L('doyum (akım kaynağı)', 'saturation (current source)'), 'muted', 'end');
      const fam = [3, 3.5, 4, 4.5, 5, 5.5, 6];
      fam.forEach((vg, i) => {
        p.line('f' + i, Viz.sample(v => mosId(vg, v, VTH, K, LAM), 0, 12, 160), 'faint');
        const yEnd = mosId(vg, 12, VTH, K, LAM);
        if (yEnd < 9.6) p.text('ft' + i, 11.9, yEnd, App.num(vg, 1) + ' V', 'muted', 'end', 0, -4);
      });
      const sG = UI.slider(ctl, { label: 'V<sub>GS</sub>', min: 0, max: 6.4, step: 0.05, value: 3.5, fmt: v => App.num(v, 2) + ' V', onInput: update });
      const sV = UI.slider(ctl, { label: 'V<sub>DD</sub>', min: 1, max: 12, step: 0.1, value: 12, fmt: v => App.num(v, 1) + ' V', onInput: update });
      const sR = UI.slider(ctl, { label: 'R<sub>' + L('yük', 'load') + '</sub>', min: 1.2, max: 100, value: 2.4, log: true, step: 0.1, unit: 'Ω', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'id', label: 'I<sub>D</sub>' }, { key: 'vds', label: 'V<sub>DS</sub>' },
        { key: 'r', label: 'R<sub>DS</sub> = V<sub>DS</sub>/I<sub>D</sub>' }, { key: 'p', label: L('Kayıp V<sub>DS</sub>·I<sub>D</sub>', 'Loss V<sub>DS</sub>·I<sub>D</sub>') },
        { key: 'reg', label: L('Bölge', 'Region') }]);
      function update() {
        const vg = sG.value, vdd = sV.value, R = sR.value;
        p.line('cur', Viz.sample(v => mosId(vg, v, VTH, K, LAM), 0, 12, 200), 'sig');
        p.line('ll', [[0, vdd / R], [vdd, 0]], 'cu');
        let a = 0, b = vdd;
        for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (vdd - mosId(vg, m, VTH, K, LAM) * R - m > 0) a = m; else b = m; }
        const vds = (a + b) / 2, id = (vdd - vds) / R;
        p.dot('q', vds, Math.min(id, 9.9));
        p.text('qT', vds, Math.min(id, 9.9), 'Q', 'cu big', 'start', 8, -8);
        const vov = vg - VTH;
        const region = vov <= 0 ? 'cut' : vds < vov ? 'ohm' : 'sat';
        const P = vds * id;
        ro.set('id', App.si(id, 'A'));
        ro.set('vds', App.num(vds, 2) + ' V');
        ro.set('r', id > 1e-6 ? App.si(vds / id, 'Ω') : '∞');
        ro.set('p', App.si(P, 'W'), P > 5 ? 'bad' : P > 1 ? 'warn' : 'ok');
        ro.set('reg', region === 'cut' ? L('Kesim', 'Cutoff') : region === 'ohm' ? L('Ohmik — anahtar açık', 'Ohmic — switch on') : L('Doyum — ısınıyor', 'Saturation — heating'),
          region === 'ohm' ? 'ok' : region === 'sat' ? 'warn' : '');
      }
      update();
    }

    /* ---------------- Lab: transfer curve + R_DS(on) vs V_GS ---------------- */
    {
      const lab = root.querySelector('#lab-tr');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const pT = new Viz.Plot(fig, {
        w: 600, h: 250, x: [0, 10], y: [1e-6, 1e3], logY: true,
        xLabel: 'V_GS (V)', yLabel: 'I_D (A)', xFmt: v => App.num(v, 0), yFmt: v => App.si(v, 'A', 1).replace(' ', '')
      });
      const pR = new Viz.Plot(fig, {
        w: 600, h: 230, x: [0, 10], y: [1e-3, 10], logY: true,
        xLabel: 'V_GS (V)', yLabel: 'R_DS(on) (Ω)', xFmt: v => App.num(v, 0), yFmt: v => App.si(v, 'Ω', 1).replace(' ', '')
      });
      const sTh = UI.slider(ctl, { label: 'V<sub>GS(th)</sub> @ 250 µA', min: 0.6, max: 4, step: 0.05, value: 2.0, fmt: v => App.num(v, 2) + ' V', onInput: update });
      const sR = UI.slider(ctl, { label: 'R<sub>DS(on)</sub> @ 10 V', min: 0.005, max: 0.2, step: 0.001, log: true, value: 0.02, unit: 'Ω', onInput: update });
      const sG = UI.slider(ctl, { label: L('Sürüş V<sub>GS</sub>', 'Drive V<sub>GS</sub>'), min: 0, max: 10, step: 0.05, value: 3.3, fmt: v => App.num(v, 2) + ' V', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'r', label: L('R<sub>DS(on)</sub> @ sürüş', 'R<sub>DS(on)</sub> @ drive') }, { key: 'r33', label: L('R @ 3,3 V', 'R @ 3.3 V') },
        { key: 'r45', label: L('R @ 4,5 V', 'R @ 4.5 V') }, { key: 'r10', label: 'R @ 10 V' },
        { key: 'i', label: L('I<sub>D</sub> (doyum) @ sürüş', 'I<sub>D</sub> (sat) @ drive') }]);
      const n = 1.5, Vt = 0.026;
      function update() {
        const vth = sTh.value, R10 = sR.value, vg = sG.value;
        const Rfix = 0.4 * R10, Rch0 = 0.6 * R10 * (10 - vth);
        const k = 1 / Rch0;
        const ekv = (v, v0) => { const x = (v - v0) / (2 * n * Vt); const l = x > 30 ? x : Math.log1p(Math.exp(x)); return 2 * n * n * k * Vt * Vt * l * l; };
        let a = vth - 1.5, b = vth + 1.5;
        for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (ekv(vth, m) > 250e-6) a = m; else b = m; }
        const v0 = (a + b) / 2;
        const Id = v => ekv(v, v0);
        const R = v => v > v0 + 0.02 ? Rfix + Rch0 / (v - v0) : Infinity;
        pT.line('t', Viz.sample(Id, 0, 10, 400).filter(q => q[1] >= 1e-6), 'cu');
        pT.hline('h250', 250e-6, 'sig');
        pT.text('h250T', 9.9, 250e-6, '250 µA', 'sig', 'end', 0, 14);
        pT.vline('vth', vth, 'sig');
        pT.text('vthT', vth, 1e2, 'V_th', 'sig', 'start', 4, 0);
        pT.dot('dg', vg, Math.max(Id(vg), 1.1e-6), 'sig');
        const ptsR = Viz.sample(R, Math.min(9.99, v0 + 0.03), 10, 300).filter(q => isFinite(q[1]));
        pR.line('r', ptsR, 'cu');
        pR.hline('r10', R10, 'ok');
        [['m33', 3.3], ['m45', 4.5], ['m10', 10]].forEach(([key, v]) => {
          pR.vline(key, v, '');
          pR.text(key + 'T', v, 5, (App.lang === 'en' ? String(v) : String(v).replace('.', ',')) + ' V', 'muted', v === 10 ? 'end' : 'start', v === 10 ? -4 : 4, 0);
        });
        pR.vline('vth', vth, 'sig');
        pR.text('vthT', vth, 1.5e-3, 'V_th', 'sig', 'start', 4, 0);
        const rv = R(vg);
        pR.dot('dg', vg, isFinite(rv) ? App.clamp(rv, 1e-3, 10) : 10, 'sig');
        const fmtR = r => isFinite(r) && r < 100 ? App.si(r, 'Ω') : L('kapalı', 'off');
        const stR = r => !isFinite(r) || r > 3 * R10 ? 'bad' : r > 1.5 * R10 ? 'warn' : 'ok';
        ro.set('r', fmtR(rv), stR(rv));
        ro.set('r33', fmtR(R(3.3)), stR(R(3.3)));
        ro.set('r45', fmtR(R(4.5)), stR(R(4.5)));
        ro.set('r10', fmtR(R(10)), 'ok');
        ro.set('i', App.si(Id(vg), 'A'));
      }
      update();
    }

    /* ---------------- Figure: N low-side vs P high-side ---------------- */
    {
      const fig = root.querySelector('#fig-np .lab-fig');
      const svg = Viz.schematic(fig, 600, 270, `
        ${Sch.vcc(150, 30, '+12 V')}${Sch.w([[150, 30], [150, 60]], 'hot')}
        ${Sch.load(150, 90, 0, L('yük', 'load'))}${Sch.w([[150, 120], [150, 140]], 'hot')}
        ${Sch.nmos(130, 170, 'N')}${Sch.w([[150, 200], [150, 222]], 'hot')}${Sch.gnd(150, 222)}
        ${Sch.w([[40, 170], [100, 170]], 'sigw')}
        <text id="npG1" x="40" y="160" class="sch-t sig"></text>
        <text id="npS1" x="40" y="192" class="sch-t muted"></text><text id="npT1" x="40" y="208" class="sch-t"></text>
        <text x="150" y="262" class="sch-t big" text-anchor="middle">${L('N-kanal, low-side', 'N-channel, low-side')}</text>
        ${Sch.vcc(450, 30, '+12 V')}${Sch.w([[450, 30], [450, 70]], 'hot')}
        ${Sch.pmos(430, 100, 'P')}${Sch.w([[450, 130], [450, 150]], 'hot')}
        ${Sch.load(450, 180, 0, L('yük', 'load'))}${Sch.w([[450, 210], [450, 222]], 'hot')}${Sch.gnd(450, 222)}
        ${Sch.w([[330, 100], [400, 100]], 'sigw')}
        <text id="npG2" x="396" y="90" class="sch-t sig" text-anchor="end"></text>
        <text id="npS2" x="396" y="122" class="sch-t muted" text-anchor="end"></text><text id="npT2" x="396" y="138" class="sch-t" text-anchor="end"></text>
        <text x="450" y="262" class="sch-t big" text-anchor="middle">${L('P-kanal, high-side', 'P-channel, high-side')}</text>
      `);
      const f1 = new Viz.Flow(svg, 'M150,30V222', { spacing: 14 });
      const f2 = new Viz.Flow(svg, 'M450,30V222', { spacing: 14 });
      let t = 0, last = null;
      App.onFrame(dt => {
        t += dt;
        const on = (t % 4) < 2.4;
        if (on === last) return;
        last = on;
        f1.rate = f2.rate = on ? 1 : 0;
        svg.querySelector('#npG1').textContent = on ? 'V_G = 5 V' : 'V_G = 0 V';
        svg.querySelector('#npS1').textContent = on ? 'V_GS = +5 V' : 'V_GS = 0 V';
        svg.querySelector('#npT1').textContent = on ? L('→ AÇIK', '→ ON') : L('→ KAPALI', '→ OFF');
        svg.querySelector('#npG2').textContent = on ? 'V_G = 0 V' : 'V_G = 12 V';
        svg.querySelector('#npS2').textContent = on ? 'V_GS = −12 V' : 'V_GS = 0 V';
        svg.querySelector('#npT2').textContent = on ? L('→ AÇIK', '→ ON') : L('→ KAPALI', '→ OFF');
      });
    }

    /* ---------------- Figure: body diode ---------------- */
    {
      const fig = root.querySelector('#fig-bd .lab-fig');
      const svg = Viz.schematic(fig, 600, 260, `
        <g class="sch"><circle cx="100" cy="130" r="18"/></g>
        <text id="bdTop" x="100" y="126" class="sch-t big" text-anchor="middle">+</text>
        <text id="bdBot" x="100" y="146" class="sch-t big" text-anchor="middle">−</text>
        <text x="72" y="134" class="sch-t" text-anchor="end">5 V</text>
        ${Sch.w([[100, 112], [100, 40], [320, 40], [320, 100]], 'hot')}
        ${Sch.nmos(300, 130, '', { bd: true })}
        <text x="312" y="92" class="sch-t muted" text-anchor="end">D</text>
        <text x="312" y="176" class="sch-t muted" text-anchor="end">S</text>
        ${Sch.w([[320, 160], [320, 220], [240, 220]], 'hot')}
        ${Sch.res(210, 220, 90, '')}<text x="210" y="244" class="sch-t" text-anchor="middle">R</text>
        ${Sch.w([[180, 220], [100, 220], [100, 148]], 'hot')}
        ${Sch.w([[215, 130], [270, 130]], 'sigw')}
        <text id="bdG" x="212" y="120" class="sch-t sig"></text>
        <text id="bdStep" x="390" y="60" class="sch-t big"></text>
        <text id="bdL1" x="390" y="90" class="sch-t"></text>
        <text id="bdL2" x="390" y="112" class="sch-t"></text>
        <text id="bdL3" x="390" y="150" class="sch-t cu big"></text>
      `);
      const chanFlow = new Viz.Flow(svg, 'M100,112V40H320V220H100V148', { spacing: 15 });
      const diodeFlow = new Viz.Flow(svg, 'M100,148V220H320V152H338V108H320V40H100V112', { spacing: 15, cls: 'flow bad' });
      const T = svg.querySelector.bind(svg);
      const phases = [
        { rev: false, gate: false, tr: ['1 · Normal, gate kapalı', 'Akım yok: kanal yok,', 'body diyot ters kutuplu.', 'I = 0'], en: ['1 · Normal, gate off', 'No current: no channel,', 'body diode reverse-biased.', 'I = 0'] },
        { rev: false, gate: true, tr: ['2 · Normal, gate açık', 'Kanal iletir: drain → source.', 'Düşüm = I · R_DS(on)', 'V_DS ≈ 0,02 V'], en: ['2 · Normal, gate on', 'Channel conducts: drain → source.', 'Drop = I · R_DS(on)', 'V_DS ≈ 0.02 V'] },
        { rev: true, gate: false, tr: ['3 · Ters, gate kapalı', 'Body diyot iletir: source → drain!', 'Gate’in kontrolü yok.', 'V_SD ≈ 0,8 V'], en: ['3 · Reversed, gate off', 'Body diode conducts: source → drain!', 'The gate has no say.', 'V_SD ≈ 0.8 V'] },
        { rev: true, gate: true, tr: ['4 · Ters, gate açık', 'Kanal ters yönde iletir,', 'diyotu “kısa devre” eder.', 'V_SD ≈ 0,02 V'], en: ['4 · Reversed, gate on', 'Channel conducts in reverse,', 'bypassing the diode.', 'V_SD ≈ 0.02 V'] }
      ];
      let t = 0, last = -1;
      App.onFrame(dt => {
        t += dt;
        const i = Math.floor(t / 2.6) % 4;
        if (i === last) return;
        last = i;
        const ph = phases[i], tx = App.lang === 'en' ? ph.en : ph.tr;
        T('#bdTop').textContent = ph.rev ? '−' : '+';
        T('#bdBot').textContent = ph.rev ? '+' : '−';
        T('#bdG').textContent = ph.gate ? 'V_GS = 10 V' : 'V_GS = 0 V';
        T('#bdStep').textContent = tx[0];
        T('#bdL1').textContent = tx[1];
        T('#bdL2').textContent = tx[2];
        T('#bdL3').textContent = tx[3];
        T('#bdL3').setAttribute('class', 'sch-t big ' + (i === 2 ? 'bad' : 'cu'));
        chanFlow.rate = ph.gate ? 1 : 0;
        chanFlow.dir = ph.rev ? -1 : 1;
        diodeFlow.rate = ph.rev && !ph.gate ? 1 : 0;
      });
    }

    /* ---------------- Figure: R_DS(on) vs temperature ---------------- */
    {
      const fig = root.querySelector('#fig-temp .lab-fig');
      const p = new Viz.Plot(fig, {
        w: 600, h: 260, x: [-50, 175], y: [0.4, 2.6], xTicks: [-50, -25, 0, 25, 50, 75, 100, 125, 150, 175], yTicks: [0.5, 1, 1.5, 2, 2.5],
        xLabel: 'T_J (°C)', yLabel: 'R_DS(on) / R_DS(on)(25 °C)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 1)
      });
      const f = a => T => Math.pow((T + 273) / 298, a);
      p.line('lv', Viz.sample(f(1.5), -50, 175, 100), 'cu');
      p.line('hv', Viz.sample(f(2.3), -50, 175, 100), 'bad');
      p.text('lvT', 172, f(1.5)(172), L('düşük gerilim (≈ 30 V)', 'low voltage (≈ 30 V)'), 'cu', 'end', 0, 16);
      p.text('hvT', 150, f(2.3)(150), L('yüksek gerilim (≈ 600 V)', 'high voltage (≈ 600 V)'), 'bad', 'end', -6, -6);
      p.vline('v25', 25, '');
      p.vline('v125', 125, 'bad');
      let T = -50;
      App.onFrame(dt => {
        if (!App.reducedMotion) T += dt * 40;
        if (T > 175) T = -50;
        p.dot('a', T, f(1.5)(T), '', 4);
        p.dot('b', T, f(2.3)(T), 'bad', 4);
        p.text('tt', T, f(2.3)(T), App.num(T, 0) + ' °C', 'muted', 'middle', 0, -12);
      });
    }
  }
});
