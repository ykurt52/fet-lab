/* 05 — Driving a BJT from a microcontroller: base resistor design, R_BE pull-down,
   PNP high-side and the level-shift fix, Darlington/ULN arrays, emitter-follower mistake, digital transistors */
App.page({
  id: 'bjt-drive',
  num: '05',
  group: { tr: 'Sürme', en: 'Driving' },
  title: { tr: 'BJT’yi mikrodenetleyiciden sürmek', en: 'Driving a BJT from a microcontroller' },
  blurb: {
    tr: 'Base direnci hesabı, zorlanmış β, pull-down, PNP high-side tuzağı, ULN2003.',
    en: 'Base resistor design, forced β, pull-down, the PNP high-side trap, ULN2003.'
  },
  summary: {
    tr: 'BJT’yi anahtar yapmak tek dirençle başlar: base direnci. En kötü parçada bile doyum için yeterince küçük, GPIO’yu zorlamamak için yeterince büyük olmalı. Ardından PNP high-side, Darlington ve sık yapılan hatalar geliyor.',
    en: 'Using a BJT as a switch starts with one resistor: the base resistor. It must be small enough to saturate the worst-case part, and large enough not to overload the GPIO. Then come PNP high-side switches, Darlingtons and the common mistakes.'
  },
  render(L) {
    return `
      ${App.keys([
        L('Base akımını I<sub>C</sub>/10 seç; h<sub>FE(min)</sub>’i yük akımında oku.', 'Set base current to I<sub>C</sub>/10; read h<sub>FE(min)</sub> at the load current.'),
        L('Base–emitter arasına 10–100 kΩ koy; boot sırasında transistör kapalı kalır.', 'Put 10–100 kΩ from base to emitter; the transistor stays off during boot.'),
        L('12 V PNP high-side’ı GPIO doğrudan kapatamaz; araya NPN seviye kaydırıcı koy.', 'A GPIO cannot turn off a 12 V PNP high-side; add an NPN level shifter.'),
        L('Darlington ve ULN2003 ~1 V düşürür; yüksek akımda MOSFET seç.', 'Darlingtons and the ULN2003 drop ~1 V; use a MOSFET at high current.'),
        L('NPN’yi yükün üstüne koyma: anahtar değil, emitter follower olur.', 'Do not put an NPN above the load: it becomes an emitter follower.')
      ])}
      <style>
        [data-page="bjt-drive"] .schem .heat { fill: var(--bad); stroke: none; opacity: 0; filter: blur(7px); }
        [data-page="bjt-drive"] .schem .wire.badw { stroke: var(--bad); }
        [data-page="bjt-drive"] .schem .divider { stroke: var(--line); stroke-width: 1; stroke-dasharray: 4 4; }
        [data-page="bjt-drive"] .status { margin: 0; }
      </style>

      <h2>${L('Hedef: doyum, aktif bölge değil', 'The goal: saturation, not the active region')}</h2>
      <p>${L('Anahtar olarak BJT <b>doyumda</b> çalışmalı. Doyumda V<sub>CE</sub> 0,05–0,3 V’a iner ve transistör az ısınır.',
             'As a switch, a BJT must run in <b>saturation</b>. There V<sub>CE</sub> falls to 0.05–0.3 V and the transistor barely warms up.')}</p>
      <p>${L('Base akımı yetmezse transistör aktif bölgede kalır. I<sub>C</sub>, β·I<sub>B</sub> ile sınırlanır ve V<sub>CE</sub> yükselir. Transistör V<sub>CE</sub>·I<sub>C</sub> kadar ısınır, yük de tam gerilimi alamaz.',
             'With too little base current it stays in the active region. I<sub>C</sub> is capped at β·I<sub>B</sub> and V<sub>CE</sub> rises. The transistor dissipates V<sub>CE</sub>·I<sub>C</sub>, and the load does not get its full voltage.')}</p>
      <div class="eq">${L('Doyum koşulu', 'Saturation condition')}: &nbsp; β<sub>min</sub> · I<sub>B</sub> &nbsp;≫&nbsp; I<sub>C(${L('yük', 'load')})</sub> &nbsp;&nbsp;⇒&nbsp;&nbsp; <b>I<sub>B</sub> = I<sub>C</sub> / β<sub>forced</sub></b>, &nbsp; β<sub>forced</sub> ≈ 10…20
        <span class="note">${L('β<sub>forced</sub>, datasheet’teki minimum h<sub>FE</sub>’den çok küçük seçilir. Aradaki oran “aşırı sürme” payıdır: sıcaklık, akım ve parça farklarına karşı güvence.',
                       'β<sub>forced</sub> is chosen far below the datasheet’s minimum h<sub>FE</sub>. The ratio between them is the “overdrive” margin against temperature, current and part spread.')}</span></div>

      <h2>${L('Base direnci: adım adım', 'Base resistor: step by step')}</h2>
      <ol class="steps">
        <li><b>${L('Yük akımını bil.', 'Know the load current.')}</b> ${L('I<sub>C</sub> = V<sub>yük</sub> / R<sub>yük</sub> ya da datasheet akımı. Inrush varsa onu da hesaba kat.', 'I<sub>C</sub> = V<sub>load</sub> / R<sub>load</sub>, or the datasheet current. Include inrush if there is any.')}</li>
        <li><b>${L('h<sub>FE(min)</sub>’i o akımda oku.', 'Read h<sub>FE(min)</sub> at that current.')}</b> ${L('Kazanç yüksek akımda düşer: 2N3904 10 mA’de ≥ 100, 100 mA’de ≥ 30. Tablodaki <i>min</i> değeri kullan.', 'Gain falls at high current: a 2N3904 has ≥ 100 at 10 mA but ≥ 30 at 100 mA. Use the table’s <i>min</i> value.')}</li>
        <li><b>${L('β<sub>forced</sub> seç: 10–20.', 'Pick β<sub>forced</sub>: 10–20.')}</b> ${L('Pratik kural I<sub>B</sub> = I<sub>C</sub>/10. β<sub>forced</sub>, h<sub>FE(min)</sub>’in en fazla yarısı olmalı.', 'Rule of thumb: I<sub>B</sub> = I<sub>C</sub>/10. β<sub>forced</sub> should be at most half of h<sub>FE(min)</sub>.')}</li>
        <li><b>${L('R<sub>B</sub>’yi hesapla.', 'Compute R<sub>B</sub>.')}</b> ${L('Direncin üstünde V<sub>GPIO</sub> − V<sub>BE(sat)</sub> kalır; V<sub>BE(sat)</sub> ≈ 0,7–0,9 V. R<sub>BE</sub> varsa onun çaldığı akımı ekle.', 'The resistor sees V<sub>GPIO</sub> − V<sub>BE(sat)</sub>; V<sub>BE(sat)</sub> ≈ 0.7–0.9 V. If there is an R<sub>BE</sub>, add the current it steals.')}</li>
        <li><b>${L('Bir alt standart değere yuvarla.', 'Round down to a standard value.')}</b> ${L('Küçük R<sub>B</sub> daha derin doyum demektir.', 'A smaller R<sub>B</sub> means deeper saturation.')}</li>
        <li><b>${L('GPIO akımını kontrol et.', 'Check the GPIO current.')}</b> ${L('Çoğu MCU’da 8–12 mA rahattır; ~20 mA mutlak sınıra yakındır.', 'On most MCUs 8–12 mA is comfortable; ~20 mA is near the absolute limit.')}</li>
        <li><b>${L('Kaybı kontrol et.', 'Check the dissipation.')}</b> ${L('P ≈ V<sub>CE(sat)</sub>·I<sub>C</sub> + V<sub>BE</sub>·I<sub>B</sub>. TO-92’de (≈ 200 °C/W) 0,2–0,3 W üstü sıcaktır.', 'P ≈ V<sub>CE(sat)</sub>·I<sub>C</sub> + V<sub>BE</sub>·I<sub>B</sub>. In a TO-92 (≈ 200 °C/W), above 0.2–0.3 W is hot.')}</li>
      </ol>
      <div class="eq"><b>R<sub>B</sub> = (V<sub>GPIO</sub> − V<sub>BE(sat)</sub>) / (I<sub>B</sub> + V<sub>BE</sub>/R<sub>BE</sub>)</b> &nbsp;&nbsp; ${L('aşırı sürme', 'overdrive')} = β<sub>min</sub>·I<sub>B</sub> / I<sub>C</sub>
        <span class="note">${L('R<sub>BE</sub> yoksa paydaki ikinci terim sıfırdır. Aşırı sürme ≥ 2 iyi, 1–2 sınırda, &lt; 1 ise doyum yok.', 'Without R<sub>BE</sub> the second term is zero. Overdrive ≥ 2 is good, 1–2 is marginal, &lt; 1 means no saturation.')}</span></div>

      ${App.lab('lab-calc', L('Low-side NPN anahtar hesaplayıcı', 'Low-side NPN switch calculator'), {
        foot: L('Model: V<sub>BE(sat)</sub> = 0,75 V, dirençsel yük, β = h<sub>FE(min)</sub> (en kötü parça, 25 °C). V<sub>CE(sat)</sub> yaklaşık bir tahmindir; gerçeğini datasheet’ten oku. GPIO V<sub>OH</sub> düşümü ihmal edildi. Grafik: R<sub>B</sub> büyüdükçe I<sub>C</sub>, V<sub>CE</sub> ve transistör kaybı (V·I/4’e göre).',
                'Model: V<sub>BE(sat)</sub> = 0.75 V, resistive load, β = h<sub>FE(min)</sub> (worst-case part, 25 °C). V<sub>CE(sat)</sub> is a rough estimate; read the real value from the datasheet. GPIO V<sub>OH</sub> sag is ignored. Plot: I<sub>C</sub>, V<sub>CE</sub> and transistor loss (relative to V·I/4) as R<sub>B</sub> grows.')
      })}

      <div class="call warn"><strong>${L('Çok büyük R<sub>B</sub> = sessiz arıza', 'Too large an R<sub>B</sub> = a silent failure')}</strong>
        ${L('Yük “bir şekilde” çalışır ama transistör aktif bölgeye kayar, V<sub>CE</sub> birkaç volta çıkar ve kılıf ısınır. Tezgâhta çalışan devre soğuk bir sabahta ya da düşük h<sub>FE</sub>’li partide çalışmaz. Laboratuvarda “R<sub>B</sub>’yi elle seç”i açıp dene.',
            'The load still works “somehow”, but the transistor slides into the active region, V<sub>CE</sub> climbs to volts and the package heats. A circuit that works on the bench fails on a cold morning or with a low-h<sub>FE</sub> batch. Try it in the lab with “choose R<sub>B</sub> manually”.')}</div>

      <h2>${L('Base pull-down direnci (R<sub>BE</sub>)', 'The base pull-down resistor (R<sub>BE</sub>)')}</h2>
      <p>${L('Base ile emitter arasındaki 10–100 kΩ iki iş yapar:', 'A 10–100 kΩ resistor from base to emitter does two jobs:')}</p>
      <ul>
        <li>${L('<b>Yüzen pin:</b> MCU reset ve boot sırasında pinlerini Hi-Z giriş yapar. Açıkta kalan base gürültüyle kısmen açılabilir; R<sub>BE</sub> onu 0 V’ta tutar.', '<b>Floating pin:</b> during reset and boot the MCU leaves its pins as Hi-Z inputs. A floating base can half-turn-on from noise; R<sub>BE</sub> holds it at 0 V.')}</li>
        <li>${L('<b>Kaçak akım:</b> I<sub>CBO</sub> sıcakta artar ve açık base’te β ile çarpılır. R<sub>BE</sub> onu emitter’a boşaltır ve kapanmayı hızlandırır.', '<b>Leakage:</b> I<sub>CBO</sub> grows when hot and an open base multiplies it by β. R<sub>BE</sub> drains it to the emitter and speeds up turn-off.')}</li>
      </ul>
      <p>${L('Bedeli: GPIO yüksekken V<sub>BE</sub>/R<sub>BE</sub> kadar akım base yerine R<sub>BE</sub>’ye gider. Kural: <b>R<sub>BE</sub> ≥ 5–10 × R<sub>B</sub></b>.',
             'The price: with the GPIO high, V<sub>BE</sub>/R<sub>BE</sub> flows into R<sub>BE</sub> instead of the base. Rule: <b>R<sub>BE</sub> ≥ 5–10 × R<sub>B</sub></b>.')}</p>
      <div class="eq">I<sub>B</sub> = (V<sub>GPIO</sub> − V<sub>BE</sub>)/R<sub>B</sub> − <b>V<sub>BE</sub>/R<sub>BE</sub></b> &nbsp;&nbsp; ${L('kapalıyken', 'when off')}: V<sub>BE</sub> = I<sub>leak</sub>·R<sub>BE</sub> ≪ 0,5 V</div>
      ${App.example({
        given: [['V<sub>BE</sub>', L('0,75 V', '0.75 V')], [L('I<sub>CBO</sub> (sıcak)', 'I<sub>CBO</sub> (hot)'), '1 µA']],
        steps: [
          [L('10 kΩ’un çaldığı akım', 'Current stolen by 10 kΩ'), L('I = 0,75 V / 10 kΩ', 'I = 0.75 V / 10 kΩ'), '75 µA', L('I<sub>B</sub> birkaç mA ise önemsiz, 200 µA ise ciddi', 'negligible at a few mA of I<sub>B</sub>, serious at 200 µA')],
          [L('47 kΩ ile kapalıyken V<sub>BE</sub>', 'V<sub>BE</sub> when off, 47 kΩ'), 'V = 1 µA · 47 kΩ', '47 mV', L('0,5 V’un çok altında', 'far below 0.5 V')]
        ],
        result: L('<b>R<sub>BE</sub> transistörü kapalı tutar ve base akımından az çalar.</b>', '<b>R<sub>BE</sub> keeps the transistor off and steals little base current.</b>')
      })}

      <h2>${L('PNP ile high-side: tuzak ve çözüm', 'PNP high-side: the trap and the fix')}</h2>
      <p>${L('PNP yükün <b>üstüne</b> konur; emitter pozitif raydadır. Base, emitter’ın ~0,7 V altına çekilince açılır. Kapatmak için base emitter gerilimine kadar <b>yukarı</b> çekilmelidir.',
             'A PNP sits <b>above</b> the load with its emitter on the positive rail. It turns on when the base is pulled ~0.7 V below the emitter. To turn it off, the base must be pulled <b>up</b> to the emitter voltage.')}</p>
      <p>${L('Yük rayı GPIO ile aynıysa (3,3 V) GPIO bunu doğrudan yapar: HIGH → kapalı, LOW → açık.',
             'If the load rail equals the GPIO voltage (3.3 V), the GPIO can do this directly: HIGH → off, LOW → on.')}</p>
      <p>${L('<b>12 V rayda PNP hiç kapanmaz.</b> GPIO base’i en fazla 3,3 V’a çıkarır, V<sub>EB</sub> = 8,7 V kalır. Üstelik base akımı pinin ESD diyodundan MCU’nun 3,3 V rayına akar.',
             '<b>On a 12 V rail the PNP never turns off.</b> The GPIO lifts the base to 3.3 V at most, leaving V<sub>EB</sub> = 8.7 V. Worse, base current flows through the pin’s ESD diode into the MCU’s 3.3 V rail.')}</p>
      <p>${L('Çözüm bir NPN seviye kaydırıcıdır. GPIO NPN’yi sürer, NPN PNP’nin base’ini aşağı çeker. Bir pull-up direnç PNP’yi kapatır.',
             'The fix is an NPN level shifter. The GPIO drives the NPN, the NPN pulls the PNP base down. A pull-up resistor turns the PNP off.')}</p>
      ${App.figure('fig-pnp', L('12 V PNP high-side: doğrudan GPIO ve NPN seviye kaydırıcı', '12 V PNP high-side: direct GPIO vs NPN level shifter'), {
        foot: L('GPIO her 2 saniyede bir değişir. Solda PNP iki durumda da iletimde; HIGH’ta kırmızı noktalar pine akan akımdır. Sağda 10 kΩ pull-up PNP’yi kapatır, 1 kΩ PNP base akımını (~11 mA), 4,7 kΩ NPN base akımını (~0,55 mA) belirler. Sağdaki mantık terstir: GPIO HIGH = yük AÇIK.',
                'The GPIO toggles every 2 seconds. On the left the PNP conducts in both states; in HIGH the red dots are current flowing into the pin. On the right the 10 kΩ pull-up turns the PNP off, the 1 kΩ sets the PNP base current (~11 mA), the 4.7 kΩ the NPN base current (~0.55 mA). The right-hand logic is inverted: GPIO HIGH = load ON.')
      })}
      <h3>${L('Sağdaki devrenin hesabı', 'Sizing the right-hand circuit')}</h3>
      ${App.example({
        given: [['V+', '12 V'], [L('Yük', 'Load'), '200 mA'], ['V<sub>GPIO</sub>', L('3,3 V', '3.3 V')], ['β<sub>forced</sub>', '10']],
        steps: [
          [L('PNP base akımı', 'PNP base current'), 'I<sub>B</sub> = 200 mA / 10', '20 mA'],
          [L('R<sub>2</sub> (PNP base)', 'R<sub>2</sub> (PNP base)'), L('R<sub>2</sub> = (12 − 0,8 − 0,2) V / 20 mA', 'R<sub>2</sub> = (12 − 0.8 − 0.2) V / 20 mA'), '≈ 560 Ω', L('V<sub>EB(sat)</sub> 0,8 V, NPN V<sub>CE(sat)</sub> 0,2 V', 'V<sub>EB(sat)</sub> 0.8 V, NPN V<sub>CE(sat)</sub> 0.2 V')],
          [L('NPN base akımı', 'NPN base current'), 'I<sub>B</sub> = 20 mA / 10', '2 mA'],
          [L('R<sub>1</sub> (NPN base)', 'R<sub>1</sub> (NPN base)'), L('R<sub>1</sub> = (3,3 − 0,75) V / 2 mA', 'R<sub>1</sub> = (3.3 − 0.75) V / 2 mA'), L('≈ 1,2 kΩ', '≈ 1.2 kΩ')],
          [L('Pull-up’ın çaldığı akım', 'Current stolen by the pull-up'), L('I = 0,8 V / 10 kΩ', 'I = 0.8 V / 10 kΩ'), '80 µA', L('ihmal edilebilir', 'negligible')]
        ],
        result: L('<b>R<sub>1</sub> = 1,2 kΩ, R<sub>2</sub> = 560 Ω, pull-up 10 kΩ.</b> GPIO yalnızca 2 mA verir.', '<b>R<sub>1</sub> = 1.2 kΩ, R<sub>2</sub> = 560 Ω, pull-up 10 kΩ.</b> The GPIO supplies only 2 mA.')
      })}

      <h2>${L('Darlington ve ULN2003/ULN2803', 'Darlingtons and the ULN2003/ULN2803')}</h2>
      <p>${L('Darlington iki BJT’nin art arda bağlanmasıdır; kazanç β<sub>1</sub>·β<sub>2</sub> (1000+) olur. GPIO çok az akımla yüzlerce mA’i açar.',
             'A Darlington is two BJTs in cascade; the gain is β<sub>1</sub>·β<sub>2</sub> (1000+). A GPIO can switch hundreds of mA with very little current.')}</p>
      <p>${L('<b>Bedeli: çıkış transistörü doyuma giremez.</b> V<sub>CE(sat)</sub> ≈ 0,9–1,6 V olur; kayıp tek BJT’nin 5–10 katıdır.',
             '<b>The price: the output transistor cannot saturate.</b> V<sub>CE(sat)</sub> becomes ≈ 0.9–1.6 V; the loss is 5–10 times that of a single BJT.')}</p>
      <p>${L('ULN2003 (7 kanal) ve ULN2803 (8 kanal) Darlington dizileridir. Her girişte 2,7 kΩ base direnci, her çıkışta COM’a giden bir <b>flyback diyodu</b> vardır. COM’u mutlaka yük beslemesine bağla.',
             'The ULN2003 (7 channels) and ULN2803 (8 channels) are Darlington arrays. Each input has a 2.7 kΩ base resistor, each output a <b>flyback diode</b> to COM. Always tie COM to the load supply.')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Çözüm', 'Option')}</th><th class="num">I<sub>C</sub> ${L('kanal başı', 'per channel')}</th><th class="num">V<sub>CE(sat)</sub> / V<sub>DS</sub></th><th>${L('Sürme', 'Drive')}</th><th>${L('Not', 'Note')}</th></tr></thead>
        <tbody>
          <tr><td>${L('Tek NPN (BC337)', 'Single NPN (BC337)')}</td><td class="num">≤ 800 mA</td><td class="num">${L('0,1–0,7 V', '0.1–0.7 V')}</td><td>I<sub>C</sub>/10</td><td>${L('Yüksek akımda GPIO yetmez', 'GPIO can’t supply enough at high current')}</td></tr>
          <tr><td>Darlington (TIP120)</td><td class="num">≤ 5 A</td><td class="num">≈ 2 V @ 3 A</td><td>${L('çok küçük (h<sub>FE</sub> ≥ 1000)', 'tiny (h<sub>FE</sub> ≥ 1000)')}</td><td>${L('Isınır; MOSFET ile değiştir', 'Runs hot; replace with a MOSFET')}</td></tr>
          <tr><td>ULN2003A / ULN2803A</td><td class="num">≤ 500 mA</td><td class="num">${L('0,9 V @ 100 mA, 1,3 V @ 350 mA', '0.9 V @ 100 mA, 1.3 V @ 350 mA')}</td><td>${L('doğrudan GPIO, dahili 2,7 kΩ', 'direct GPIO, internal 2.7 kΩ')}</td><td>${L('Dahili flyback diyotları; paket kaybı ~1 W ile sınırlı', 'Built-in flyback diodes; package loss limited to ~1 W')}</td></tr>
          <tr><td>${L('Lojik seviye MOSFET (AO3400A)', 'Logic-level MOSFET (AO3400A)')}</td><td class="num">≤ 5 A</td><td class="num">${L('I·R<sub>DS(on)</sub> ≈ 0,04 Ω·I', 'I·R<sub>DS(on)</sub> ≈ 0.04 Ω·I')}</td><td>${L('gerilim, ~0 akım', 'voltage, ~0 current')}</td><td>${L('Çoğu yeni tasarımda en iyi seçim', 'Best choice for most new designs')}</td></tr>
          <tr><td>${L('Dizi MOSFET sürücü (TPL7407L)', 'MOSFET array (TPL7407L)')}</td><td class="num">≤ 600 mA</td><td class="num">${L('≈ 0,1–0,3 V', '≈ 0.1–0.3 V')}</td><td>${L('doğrudan GPIO', 'direct GPIO')}</td><td>${L('ULN2003 bacak uyumlu, çok daha az kayıp', 'ULN2003 pin-compatible, much lower loss')}</td></tr>
        </tbody></table></div>
      ${App.lab('lab-darl', L('Kayıp karşılaştırması: BJT, Darlington, MOSFET', 'Loss comparison: BJT, Darlington, MOSFET'), {
        foot: L('Yaklaşık modeller: tek BJT 0,05 V + 0,4 Ω·I (β<sub>forced</sub> = 10), ULN2003 0,8 V + 1,4 Ω·I (datasheet tipik noktaları), MOSFET 40 mΩ (3,3 V gate). Paket sınırı: ULN2003 DIP-16, R<sub>θJA</sub> ≈ 67 °C/W, 25 °C’de pratik ~1 W.',
                'Approximate models: single BJT 0.05 V + 0.4 Ω·I (β<sub>forced</sub> = 10), ULN2003 0.8 V + 1.4 Ω·I (datasheet typical points), MOSFET 40 mΩ (3.3 V gate). Package limit: ULN2003 DIP-16, R<sub>θJA</sub> ≈ 67 °C/W, practical ~1 W at 25 °C.')
      })}

      <h2>${L('Sık hata: emitter follower’ı anahtar sanmak', 'Common mistake: using an emitter follower as a switch')}</h2>
      <p>${L('<b>Yükün üstündeki NPN anahtar değil, emitter follower’dır.</b> Emitter, base’in ~0,7 V altını takip eder. 3,3 V GPIO ile yük en fazla ~2,6 V görür; 12 V’un kalanı transistörde ısıya döner.',
             '<b>An NPN above the load is not a switch but an emitter follower.</b> The emitter follows ~0.7 V below the base. With a 3.3 V GPIO the load sees at most ~2.6 V; the rest of the 12 V turns into heat in the transistor.')}</p>
      <p>${L('Bu bağlantı cazip görünür çünkü yük toprakta kalır. NPN high-side ancak base yük rayının üstüne sürülebiliyorsa çalışır.',
             'The layout is tempting because the load stays grounded. An NPN high-side only works if the base can be driven above the load rail.')}</p>
      ${App.lab('lab-follow', L('Low-side anahtar ve emitter follower yan yana', 'Low-side switch vs emitter follower side by side'), {
        foot: L('İki devre de aynı GPIO, yük ve NPN’yi kullanır (β = 100, V<sub>BE</sub> = 0,7 V; soldaki R<sub>B</sub> doyum için yeterli). Follower’da V<sub>yük</sub> = V<sub>GPIO</sub> − 0,7 V; kalan gerilim V<sub>CE</sub> olarak transistörde kalır.',
                'Both circuits use the same GPIO, load and NPN (β = 100, V<sub>BE</sub> = 0.7 V; R<sub>B</sub> on the left is small enough to saturate). In the follower V<sub>load</sub> = V<sub>GPIO</sub> − 0.7 V; the rest stays across the transistor as V<sub>CE</sub>.')
      })}

      <h2>${L('Dirençli dijital transistörler', 'Digital (pre-biased) transistors')}</h2>
      <p>${L('DTC114E, PDTC114E, MUN2211 gibi “dijital transistörler”, içinde R<sub>1</sub> (base) ve R<sub>2</sub> (base–emitter) olan küçük NPN’lerdir. PNP karşılıkları DTA… serisidir. Tek parça yer kazandırır ve direnç unutulmaz.',
             'Parts like DTC114E, PDTC114E or MUN2211 are “digital transistors”: small NPNs with a built-in R<sub>1</sub> (base) and R<sub>2</sub> (base–emitter). PNP versions are DTA…. One part saves space, and you can’t forget the resistors.')}</p>
      <ul>
        <li>${L('Çıkış akımı küçüktür: tipik 50–100 mA. Röle bobini, LED ve küçük buzzer için uygundur.', 'Output current is small: typically 50–100 mA. Fine for relay coils, LEDs and small buzzers.')}</li>
        <li>${L('R<sub>1</sub> = 10 kΩ (“114”) sürümleri ~3 V ister; 3,3 V lojikte sınırdadır. 4,7 kΩ (“143”) ya da 2,2 kΩ (“123”) sürümünü seç ve V<sub>I(on)</sub>’u kontrol et.', 'The R<sub>1</sub> = 10 kΩ (“114”) versions need ~3 V; marginal at 3.3 V. Pick the 4.7 kΩ (“143”) or 2.2 kΩ (“123”) version and check V<sub>I(on)</sub>.')}</li>
        <li>${L('İç R<sub>2</sub> zaten pull-down’dır; ayrıca eklemeye gerek yok.', 'The internal R<sub>2</sub> is already the pull-down; no external one needed.')}</li>
      </ul>

      <h2>${L('Çözümlü örnekler', 'Worked examples')}</h2>
      <details class="fold"><summary>${L('Örnek 1: ESP32 (3,3 V) 12 V, 80 mA röle bobinini nasıl sürer?', 'Example 1: How does an ESP32 (3.3 V) drive a 12 V, 80 mA relay coil?')}</summary><div>
        <p>${L('2N3904 low-side anahtar, β<sub>forced</sub> = 10, base’te 10 kΩ pull-down.', '2N3904 low-side switch, β<sub>forced</sub> = 10, 10 kΩ base pull-down.')}</p>
        ${App.example({
          given: [['V<sub>GPIO</sub>', L('3,3 V', '3.3 V')], [L('Bobin', 'Coil'), '12 V, 150 Ω'], [L('Transistör', 'Transistor'), '2N3904'], ['R<sub>BE</sub>', '10 kΩ']],
          steps: [
            [L('Yük akımı', 'Load current'), 'I<sub>C</sub> = 12 V / 150 Ω', '80 mA'],
            [L('h<sub>FE(min)</sub> @ 80 mA', 'h<sub>FE(min)</sub> @ 80 mA'), L('50 mA’de 60, 100 mA’de 30', '60 at 50 mA, 30 at 100 mA'), '≈ 40'],
            [L('Base akımı', 'Base current'), 'I<sub>B</sub> = 80 mA / 10', '8 mA'],
            [L('Aşırı sürme', 'Overdrive'), '40 · 8 mA / 80 mA', '4', L('≥ 2 → iyi', '≥ 2 → good')],
            ['R<sub>B</sub>', L('(3,3 − 0,8) V / (8 + 0,08) mA', '(3.3 − 0.8) V / (8 + 0.08) mA'), '309 Ω', L('bir alt E24 değeri: 300 Ω', 'next lower E24 value: 300 Ω')],
            [L('GPIO akımı', 'GPIO current'), L('(3,3 − 0,8) V / 300 Ω', '(3.3 − 0.8) V / 300 Ω'), L('8,3 mA', '8.3 mA'), L('ESP32 için rahat', 'comfortable for an ESP32')],
            [L('Kayıp', 'Dissipation'), L('0,3 V · 80 mA + 0,8 V · 8 mA', '0.3 V · 80 mA + 0.8 V · 8 mA'), '≈ 30 mW', L('V<sub>CE(sat)</sub> ≈ 0,3 V', 'V<sub>CE(sat)</sub> ≈ 0.3 V')]
          ],
          result: L('<b>R<sub>B</sub> = 300 Ω, R<sub>BE</sub> = 10 kΩ.</b> Bobine mutlaka flyback diyodu (1N4148) koy; bkz. Bölüm 08.', '<b>R<sub>B</sub> = 300 Ω, R<sub>BE</sub> = 10 kΩ.</b> Always put a flyback diode (1N4148) across the coil; see chapter 08.')
        })}
        <p>${L('Sık görülen “1 kΩ” seçimi neden sınırda kalır:', 'Why the popular “1 kΩ” choice is marginal:')}</p>
        ${App.example({
          steps: [
            [L('Base akımı', 'Base current'), L('I<sub>B</sub> = (3,3 − 0,8) V / 1 kΩ', 'I<sub>B</sub> = (3.3 − 0.8) V / 1 kΩ'), L('2,5 mA', '2.5 mA')],
            [L('Aşırı sürme', 'Overdrive'), L('40 · 2,5 mA / 80 mA', '40 · 2.5 mA / 80 mA'), L('1,25', '1.25')]
          ],
          result: L('<b>1 kΩ sınırda kalır.</b> Tezgâhta çalışır, kötü bir partide doyumdan çıkar.', '<b>1 kΩ is marginal.</b> It works on the bench, but a bad batch drops out of saturation.'),
          level: 'warn'
        })}
        <p>${L('BC547B de olur, ama I<sub>C(max)</sub> = 100 mA olduğu için 80 mA sınıra yakındır.', 'A BC547B also works, but its I<sub>C(max)</sub> is 100 mA, so 80 mA is close to the limit.')}</p>
      </div></details>
      <details class="fold"><summary>${L('Örnek 2: BC337 500 mA yükü GPIO’dan sürebilir mi?', 'Example 2: Can a BC337 switch a 500 mA load from a GPIO?')}</summary><div>
        <p>${L('Sorun transistör değil, GPIO’nun verebileceği base akımı.', 'The problem is not the transistor but the base current the GPIO can supply.')}</p>
        ${App.example({
          given: [[L('Yük', 'Load'), '500 mA'], [L('Transistör', 'Transistor'), 'BC337-25'], ['h<sub>FE(min)</sub> @ 500 mA', '≈ 40'], ['V<sub>CE(sat)</sub>', L('≈ 0,5 V (tip.)', '≈ 0.5 V (typ.)')]],
          steps: [
            [L('Base akımı, β<sub>forced</sub> = 10', 'Base current, β<sub>forced</sub> = 10'), 'I<sub>B</sub> = 500 mA / 10', '50 mA', L('hiçbir GPIO veremez', 'no GPIO can supply this')],
            [L('Base akımı, β<sub>forced</sub> = 25', 'Base current, β<sub>forced</sub> = 25'), 'I<sub>B</sub> = 500 mA / 25', '20 mA', L('pin mutlak sınırında', 'the pin is at its absolute limit')],
            [L('Aşırı sürme', 'Overdrive'), '40 · 20 mA / 500 mA', L('1,6', '1.6'), L('sınırda', 'marginal')],
            [L('Kayıp', 'Dissipation'), L('P = 0,5 V · 0,5 A', 'P = 0.5 V · 0.5 A'), L('0,25 W', '0.25 W')],
            [L('Isınma (TO-92)', 'Temperature rise (TO-92)'), L('ΔT = 0,25 W · 200 °C/W', 'ΔT = 0.25 W · 200 °C/W'), '+50 °C']
          ],
          result: L('<b>Tek BC337’yi GPIO’dan sürme.</b> Lojik seviye MOSFET kullan: AO3400A 0,5 A’de 20 mV düşürür, 10 mW harcar ve GPIO akımı ≈ 0.', '<b>Do not drive a single BC337 from a GPIO.</b> Use a logic-level MOSFET: an AO3400A drops 20 mV at 0.5 A, dissipates 10 mW and draws ≈ 0 GPIO current.'),
          level: 'bad'
        })}
        <p>${L('Diğer seçenekler: iki kademe (küçük bir NPN, BC337’nin base akımını V+’dan sağlar) ya da Darlington (1 V üstü düşüm, ~0,6 W kayıp).', 'Other options: two stages (a small NPN feeds the BC337 base from V+) or a Darlington (over 1 V drop, ~0.6 W loss).')}</p>
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const E24 = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
    const e24Down = r => {
      const d = Math.pow(10, Math.floor(Math.log10(r) + 1e-9));
      const m = r / d; let best = E24[0];
      E24.forEach(v => { if (v <= m * 1.0001) best = v; });
      return +(best * d).toPrecision(3);
    };
    const V = (v, d) => App.num(v, d == null ? 2 : d) + ' V';

    /* ---------------- Lab 1: low-side NPN calculator ---------------- */
    {
      const lab = root.querySelector('#lab-calc');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 300, `
        <circle class="heat" id="cHeat" cx="410" cy="170" r="34"/>
        ${Sch.vcc(420, 30, '')}<text id="cVl" x="420" y="16" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.w([[420, 30], [420, 50]])}
        ${Sch.load(420, 80, 0, L('yük', 'load'))}
        ${Sch.w([[420, 110], [420, 140]])}
        ${Sch.npn(400, 170, 'Q1')}
        ${Sch.w([[420, 200], [420, 262]])}${Sch.gnd(420, 262)}
        ${Sch.box(20, 140, 110, 60, 'MCU', '')}<text id="cGp" x="75" y="190" class="sch-t sig" text-anchor="middle"></text>
        ${Sch.w([[130, 170], [170, 170]], 'sigw')}
        ${Sch.res(200, 170, 90, '')}<text id="cRb" x="200" y="152" class="sch-t" text-anchor="middle"></text>
        ${Sch.w([[230, 170], [370, 170]], 'sigw')}
        <g id="cRbeG">${Sch.dot(300, 170)}${Sch.w([[300, 170], [300, 192]])}${Sch.res(300, 222, 0, '')}${Sch.gnd(300, 252)}
          <text id="cRbe" x="314" y="226" class="sch-t"></text></g>
        <text id="cIb" x="200" y="198" class="sch-t sig" text-anchor="middle"></text>
        <text id="cIc" x="440" y="128" class="sch-t cu"></text>
        <text id="cVce" x="452" y="200" class="sch-t"></text>
        <text id="cSt" x="300" y="292" class="sch-t big" text-anchor="middle"></text>
      `);
      const fLoad = new Viz.Flow(svg, 'M420,30V262', { spacing: 15 });
      const fBase = new Viz.Flow(svg, 'M130,170H370', { cls: 'flow e', spacing: 13, speed: 55 });
      const fRbe = new Viz.Flow(svg, 'M300,172V252', { cls: 'flow e', spacing: 13, speed: 30, r: 2 });
      const $ = id => svg.querySelector('#' + id);

      const plotBox = App.h('div'); fig.appendChild(plotBox);
      const p = new Viz.Plot(plotBox, {
        w: 600, h: 230, x: [100, 100000], y: [0, 110], logX: true, yTicks: [0, 25, 50, 75, 100],
        xLabel: 'R_B (Ω)', yLabel: '%', xFmt: v => App.si(v, '', 2).trim(), yFmt: v => App.num(v, 0)
      });

      const sVg = UI.slider(ctl, { label: 'V<sub>GPIO</sub>', min: 1.8, max: 5, step: 0.1, value: 3.3, fmt: v => V(v, 1), onInput: update });
      const sVl = UI.slider(ctl, { label: 'V<sub>' + L('yük', 'load') + '</sub>', min: 3, max: 24, step: 0.5, value: 12, fmt: v => V(v, 1), onInput: update });
      const sIl = UI.slider(ctl, { label: 'I<sub>' + L('yük', 'load') + '</sub>', min: 0.005, max: 1, step: 0.001, value: 0.08, log: true, unit: 'A', onInput: update });
      const sH = UI.slider(ctl, { label: 'h<sub>FE(min)</sub>', min: 20, max: 400, step: 5, value: 40, fmt: v => App.num(v, 0), onInput: update });
      const sBf = UI.slider(ctl, { label: 'β<sub>forced</sub>', min: 5, max: 50, step: 1, value: 10, fmt: v => App.num(v, 0), onInput: update });
      const tRbe = UI.toggle(ctl, { label: L('R<sub>BE</sub> pull-down', 'R<sub>BE</sub> pull-down'), value: true, onChange: update });
      const sRbe = UI.slider(ctl, { label: 'R<sub>BE</sub>', min: 10000, max: 100000, step: 1000, value: 10000, log: true, unit: 'Ω', onInput: update });
      const tMan = UI.toggle(ctl, { label: L('R<sub>B</sub>’yi elle seç', 'Choose R<sub>B</sub> manually'), value: false, onChange: update });
      const sRb = UI.slider(ctl, { label: 'R<sub>B</sub>', min: 100, max: 100000, step: 10, value: 300, log: true, unit: 'Ω', onInput: () => { if (!tMan.value) tMan.set(true, true); update(); } });
      const ro = UI.readouts(ctl, [
        { key: 'ib', label: L('Hedef I<sub>B</sub>', 'Target I<sub>B</sub>') },
        { key: 'rbx', label: L('R<sub>B</sub> (tam)', 'R<sub>B</sub> (exact)') },
        { key: 'rbe24', label: L('R<sub>B</sub> (E24, aşağı)', 'R<sub>B</sub> (E24, down)') },
        { key: 'iba', label: L('Gerçek I<sub>B</sub>', 'Actual I<sub>B</sub>') },
        { key: 'od', label: L('Aşırı sürme β<sub>min</sub>I<sub>B</sub>/I<sub>C</sub>', 'Overdrive β<sub>min</sub>I<sub>B</sub>/I<sub>C</sub>') },
        { key: 'gp', label: L('GPIO akımı', 'GPIO current') },
        { key: 'vce', label: 'V<sub>CE</sub>' },
        { key: 'p', label: L('Transistör kaybı', 'Transistor loss') },
        { key: 'st', label: L('Durum', 'Status') }
      ]);
      const VBE = 0.75;

      // operating point for a given R_B
      function solve(rb, vg, vl, il, h, rbe) {
        const iRb = Math.max(0, (vg - VBE) / rb);
        const ib = Math.max(0, iRb - (rbe ? VBE / rbe : 0));
        const RL = vl / il;
        const od = h * ib / il;
        let ic, vce;
        const vsat0 = 0.04 + 0.3 * il;
        if (od >= 1) {
          const vs = vsat0 * (od < 2 ? 1 + (2 - od) * 1.5 : 1);
          vce = Math.min(vs, vl); ic = (vl - vce) / RL;
        } else {
          ic = h * ib;
          vce = Math.max(vl - ic * RL, vsat0 * 2.5);
          ic = Math.min(ic, (vl - vce) / RL);
        }
        return { iRb, ib, od, ic, vce, P: vce * ic + VBE * ib, RL };
      }

      function update() {
        const vg = sVg.value, vl = sVl.value, il = sIl.value, h = sH.value, bf = sBf.value;
        const rbe = tRbe.value ? sRbe.value : 0;
        $('cRbeG').style.display = rbe ? '' : 'none';
        sRbe.el.style.opacity = rbe ? '' : '.45';
        const ibT = il / bf;
        const den = ibT + (rbe ? VBE / rbe : 0);
        const ok = vg > VBE + 0.05;
        const rbx = ok ? (vg - VBE) / den : NaN;
        const rb24 = ok ? e24Down(rbx) : NaN;
        if (!tMan.value && ok) sRb.set(App.clamp(rb24, 100, 100000), true);
        const rb = tMan.value ? sRb.value : rb24;
        const s = ok ? solve(rb, vg, vl, il, h, rbe) : { iRb: 0, ib: 0, od: 0, ic: 0, vce: vl, P: 0 };

        ro.set('ib', App.si(ibT, 'A'));
        ro.set('rbx', ok ? App.si(rbx, 'Ω') : '—');
        ro.set('rbe24', ok ? App.si(rb24, 'Ω') + (tMan.value ? ' <span class="muted">(' + L('kullanılmıyor', 'unused') + ')</span>' : '') : '—');
        ro.set('iba', App.si(s.ib, 'A') + (tMan.value ? ' @ ' + App.si(rb, 'Ω') : ''));
        ro.set('od', App.num(s.od, 2) + '×', s.od >= 2 ? 'ok' : s.od >= 1 ? 'warn' : 'bad');
        ro.set('gp', App.si(s.iRb, 'A') + (s.iRb > 0.02 ? ' — ' + L('aşırı!', 'too high!') : s.iRb > 0.008 ? ' — ' + L('yüksek', 'high') : ''),
          s.iRb > 0.02 ? 'bad' : s.iRb > 0.008 ? 'warn' : 'ok');
        ro.set('vce', V(s.vce, 2), s.vce < 0.4 ? 'ok' : s.vce < 1 ? 'warn' : 'bad');
        ro.set('p', App.si(s.P, 'W'), s.P < 0.15 ? 'ok' : s.P < 0.3 ? 'warn' : 'bad');
        const st = !ok ? 'bad' : s.od >= 2 ? 'ok' : s.od >= 1 ? 'warn' : 'bad';
        const stTxt = !ok ? L('GPIO V<sub>BE</sub>’yi aşamıyor', 'GPIO cannot exceed V<sub>BE</sub>')
          : st === 'ok' ? L('<span class="pill ok">doyumda</span>', '<span class="pill ok">saturated</span>')
            : st === 'warn' ? L('<span class="pill warn">sınırda</span>', '<span class="pill warn">marginal</span>')
              : L('<span class="pill bad">doyumda DEĞİL</span>', '<span class="pill bad">NOT saturated</span>');
        ro.set('st', stTxt, st);

        // schematic labels + animation rates
        $('cVl').textContent = 'V+ = ' + V(vl, 1);
        $('cGp').textContent = 'GPIO ' + V(vg, 1);
        $('cRb').textContent = 'R_B = ' + (ok ? App.si(rb, 'Ω') : '—');
        $('cRbe').textContent = rbe ? 'R_BE ' + App.si(rbe, 'Ω') : '';
        $('cIb').textContent = 'I_B = ' + App.si(s.ib, 'A');
        $('cIc').textContent = 'I_C = ' + App.si(s.ic, 'A');
        $('cVce').textContent = 'V_CE = ' + V(s.vce, 2);
        $('cVce').setAttribute('class', 'sch-t ' + (s.vce > 1 ? 'bad' : s.vce > 0.4 ? 'cu' : 'ok'));
        const stEl = $('cSt');
        stEl.textContent = st === 'ok' ? L('DOYUM: V_CE küçük, transistör soğuk', 'SATURATED: small V_CE, transistor stays cool')
          : st === 'warn' ? L('SINIRDA: kötü bir parçada aktif bölgeye kayar', 'MARGINAL: a weak part will drop into the active region')
            : L('AKTİF BÖLGE: V_CE yükseldi, transistör ısınıyor', 'ACTIVE REGION: V_CE has risen, the transistor heats');
        stEl.setAttribute('class', 'sch-t big ' + (st === 'ok' ? 'ok' : 'bad'));
        $('cHeat').style.opacity = App.clamp(s.P / 0.4, 0, 0.85).toFixed(2);
        fLoad.rate = App.clamp(s.ic / il, 0, 1) * 1.2;
        fBase.rate = s.iRb > 0 ? App.clamp(0.25 + s.iRb / 0.008, 0, 2.5) : 0;
        fRbe.rate = rbe && s.iRb > 0 ? 0.35 : 0;

        // plot: sweep R_B
        const pts = { ic: [], vce: [], p: [] }, Pmax = vl * il / 4;
        for (let i = 0; i <= 160; i++) {
          const r = Math.pow(10, 2 + 3 * i / 160);
          const q = ok ? solve(r, vg, vl, il, h, rbe) : { ic: 0, vce: vl, P: 0 };
          pts.ic.push([r, q.ic / il * 100]); pts.vce.push([r, q.vce / vl * 100]); pts.p.push([r, Math.min(110, (q.P - VBE * q.ib) / Pmax * 100)]);
        }
        const rLim = (vg - VBE) / 0.02;
        p.rect('gpio', 100, 0, App.clamp(rLim, 100, 100000), 110, 'bad');
        p.text('gpioT', 105, 104, rLim > 160 ? L('GPIO > 20 mA', 'GPIO > 20 mA') : '', 'bad');
        p.line('ic', pts.ic, 'cu');
        p.line('vce', pts.vce, 'bad dash');
        p.line('p', pts.p, 'warn');
        p.vline('rbx', App.clamp(rbx || 100, 100, 100000), 'sig');
        p.vline('rb', App.clamp(rb || 100, 100, 100000), 'cu solid');
        const yI = s.ic / il * 100;
        p.dot('q', App.clamp(rb || 100, 100, 100000), yI);
        p.text('l1', 60000, 92, 'I_C / I_' + L('yük', 'load'), 'cu', 'end');
        p.text('l2', 60000, 80, 'V_CE / V+', 'bad', 'end');
        p.text('l3', 60000, 68, L('kayıp / maks', 'loss / max'), 'muted', 'end');
      }
      update();
    }

    /* ---------------- Figure: PNP high-side, direct vs level shifter ---------------- */
    {
      const fig = root.querySelector('#fig-pnp .lab-fig');
      const svg = Viz.schematic(fig, 600, 320, `
        <line class="divider" x1="290" y1="10" x2="290" y2="300"/>
        <!-- left: direct -->
        ${Sch.vcc(180, 30, '+12 V')}
        ${Sch.w([[180, 30], [180, 60]])}
        ${Sch.pnp(160, 90, 'Q1')}
        ${Sch.w([[180, 120], [180, 150]])}
        ${Sch.load(180, 180, 0, L('yük', 'load'))}
        ${Sch.w([[180, 210], [180, 240]])}${Sch.gnd(180, 240)}
        ${Sch.w([[130, 90], [110, 90]], 'sigw')}
        ${Sch.res(80, 90, 90, '1 kΩ')}
        ${Sch.w([[50, 90], [24, 90]], 'sigw')}
        <text x="24" y="114" class="sch-t sig">GPIO</text>
        <text id="pLg" x="24" y="128" class="sch-t sig"></text>
        <text id="pLv" x="194" y="134" class="sch-t"></text>
        <text id="pLs" x="145" y="272" class="sch-t big" text-anchor="middle"></text>
        <text id="pLs2" x="145" y="290" class="sch-t" text-anchor="middle"></text>
        <!-- right: NPN level shifter -->
        ${Sch.vcc(520, 30, '+12 V')}
        ${Sch.w([[440, 30], [520, 30], [520, 60]])}${Sch.dot(520, 30)}
        ${Sch.res(440, 60, 0, '10 kΩ')}
        ${Sch.pnp(500, 90, 'Q3')}
        ${Sch.w([[440, 90], [470, 90]])}${Sch.dot(440, 90)}
        ${Sch.w([[440, 90], [440, 115]])}
        ${Sch.res(440, 145, 0, '1 kΩ')}
        ${Sch.w([[440, 175], [440, 180]])}
        ${Sch.npn(420, 210, 'Q2')}
        ${Sch.w([[440, 240], [440, 250]])}${Sch.gnd(440, 250)}
        ${Sch.w([[390, 210], [380, 210]], 'sigw')}
        ${Sch.res(350, 210, 90, L('4,7 kΩ', '4.7 kΩ'))}
        ${Sch.w([[320, 210], [304, 210]], 'sigw')}
        <text x="304" y="234" class="sch-t sig">GPIO</text>
        <text id="pRg" x="304" y="248" class="sch-t sig"></text>
        ${Sch.w([[520, 120], [520, 150]])}
        ${Sch.load(520, 180, 0, L('yük', 'load'))}
        ${Sch.w([[520, 210], [520, 250]])}${Sch.gnd(520, 250)}
        <text id="pRv" x="528" y="134" class="sch-t"></text><text id="pRo" x="528" y="148" class="sch-t"></text>
        <text id="pRs" x="445" y="285" class="sch-t big" text-anchor="middle"></text>
      `);
      const $ = id => svg.querySelector('#' + id);
      const lLoad = new Viz.Flow(svg, 'M180,30V240', { spacing: 15 });
      const lBase = new Viz.Flow(svg, 'M180,62L156,82H24', { cls: 'flow e', spacing: 13, speed: 45 });
      const lBad = new Viz.Flow(svg, 'M180,62L156,82H24', { cls: 'flow bad', spacing: 13, speed: 45 });
      const rLoad = new Viz.Flow(svg, 'M520,30V250', { spacing: 15 });
      const rBase = new Viz.Flow(svg, 'M520,62L496,82H440V250', { cls: 'flow e', spacing: 13, speed: 45 });
      const rGp = new Viz.Flow(svg, 'M304,210H390', { cls: 'flow e', spacing: 13, speed: 35 });
      let t = 0, lastHigh = null;
      const set = high => {
        $('pLg').textContent = high ? 'HIGH = ' + V(3.3, 1) : 'LOW = 0 V';
        $('pRg').textContent = $('pLg').textContent;
        lLoad.rate = 1; lBase.rate = high ? 0 : 1; lBad.rate = high ? 0.8 : 0;
        $('pLv').textContent = high ? 'V_EB = ' + V(8.7, 1) + '!' : 'V_EB ≈ ' + V(0.7, 1);
        $('pLv').setAttribute('class', 'sch-t ' + (high ? 'bad' : ''));
        $('pLs').textContent = high ? L('KAPANMIYOR!', 'WON’T TURN OFF!') : L('AÇIK (doğru)', 'ON (correct)');
        $('pLs').setAttribute('class', 'sch-t big ' + (high ? 'bad' : 'ok'));
        $('pLs2').textContent = high ? L('~8 mA pine ve ESD diyoduna akıyor', '~8 mA flows into the pin and its ESD diode') : L('doğrudan GPIO, 12 V yük', 'direct GPIO, 12 V load');
        $('pLs2').setAttribute('class', 'sch-t ' + (high ? 'bad' : 'muted'));
        rLoad.rate = high ? 1 : 0; rBase.rate = high ? 0.8 : 0; rGp.rate = high ? 0.6 : 0;
        $('pRv').textContent = high ? 'V_EB≈' + V(0.7, 1) : 'V_EB = 0';
        $('pRo').textContent = high ? L('AÇIK', 'ON') : L('KAPALI', 'OFF');
        $('pRv').setAttribute('class', 'sch-t ' + (high ? 'cu' : 'ok'));
        $('pRo').setAttribute('class', 'sch-t ' + (high ? 'cu' : 'ok'));
        $('pRs').textContent = L('NPN seviye kaydırıcı: çalışır', 'NPN level shifter: works');
        $('pRs').setAttribute('class', 'sch-t big ok');
      };
      if (App.reducedMotion) set(true);
      else App.onFrame(dt => {
        t += dt;
        const high = (t % 4) < 2;
        if (high !== lastHigh) { set(high); lastHigh = high; }
      });
    }

    /* ---------------- Lab 2: loss comparison ---------------- */
    {
      const lab = root.querySelector('#lab-darl');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const vB = i => 0.05 + 0.4 * i, vD = i => 0.8 + 1.4 * i, vM = i => 0.04 * i;
      const p = new Viz.Plot(fig, {
        w: 600, h: 320, x: [0, 1], y: [0, 2.4], xLabel: L('Kanal akımı I (A)', 'Channel current I (A)'), yLabel: L('Kayıp (W)', 'Loss (W)'),
        xFmt: v => App.num(v, 1), yFmt: v => App.num(v, 1)
      });
      p.line('d', Viz.sample(i => vD(i) * i, 0, 1, 100), 'bad');
      p.line('b', Viz.sample(i => vB(i) * i, 0, 1, 100), 'cu');
      p.line('m', Viz.sample(i => vM(i) * i, 0, 1, 100), 'ok');
      p.text('dT', 0.98, vD(0.98) * 0.98, 'Darlington (ULN2003)', 'bad', 'end', 0, -8);
      p.text('bT', 0.98, vB(0.98) * 0.98, L('tek BJT', 'single BJT'), 'cu', 'end', 0, -8);
      p.text('mT', 0.98, vM(0.98) * 0.98, 'MOSFET 40 mΩ', 'ok', 'end', 0, -8);
      const sI = UI.slider(ctl, { label: L('Kanal akımı', 'Channel current'), min: 0.02, max: 1, step: 0.01, value: 0.3, unit: 'A', onInput: update });
      const sN = UI.slider(ctl, { label: L('Aynı anda açık kanal', 'Channels on at once'), min: 1, max: 7, step: 1, value: 4, fmt: v => App.num(v, 0), onInput: update });
      const sV = UI.slider(ctl, { label: L('Yük beslemesi', 'Load supply'), min: 5, max: 24, step: 1, value: 12, fmt: v => V(v, 0), onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'b', label: L('Tek BJT: V<sub>CE</sub> / P', 'Single BJT: V<sub>CE</sub> / P') },
        { key: 'd', label: L('Darlington: V<sub>CE</sub> / P', 'Darlington: V<sub>CE</sub> / P') },
        { key: 'm', label: 'MOSFET: V<sub>DS</sub> / P' },
        { key: 'pk', label: L('ULN2003 paket toplamı', 'ULN2003 package total') },
        { key: 'vl', label: L('Yüke kalan (Darlington)', 'Left for the load (Darlington)') }
      ]);
      function update() {
        const i = sI.value, n = sN.value, vs = sV.value;
        const f = (v) => V(v, 2) + ' / ' + App.si(v * i, 'W');
        ro.set('b', f(vB(i)), vB(i) * i > 0.3 ? 'warn' : 'ok');
        ro.set('d', f(vD(i)), vD(i) * i > 0.5 ? 'bad' : 'warn');
        ro.set('m', f(vM(i)), 'ok');
        const pk = n * vD(i) * i;
        ro.set('pk', App.si(pk, 'W') + ' → +' + App.num(pk * 67, 0) + ' °C', pk > 1 ? 'bad' : pk > 0.7 ? 'warn' : 'ok');
        ro.set('vl', V(vs - vD(i), 1) + ' (' + App.num((vs - vD(i)) / vs * 100, 0) + ' %)', vD(i) / vs > 0.1 ? 'warn' : '');
        p.vline('cur', i, 'cu');
        p.dot('db', i, vD(i) * i, 'bad'); p.dot('bb', i, vB(i) * i); p.dot('mb', i, vM(i) * i, 'sig');
        p.rect('lim', 0, 1 / n, 1, 2.4, 'bad');
        p.text('limT', 0.02, Math.min(2.3, 1 / n), L('paket sınırını aşar (' + n + ' kanal, ~1 W)', 'exceeds package limit (' + n + ' ch, ~1 W)'), 'bad', 'start', 0, 14);
      }
      update();
    }

    /* ---------------- Lab 3: emitter follower vs low-side ---------------- */
    {
      const lab = root.querySelector('#lab-follow');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 270, `
        <line class="divider" x1="300" y1="10" x2="300" y2="260"/>
        ${Sch.vcc(170, 30, '')}<text id="fV1" x="170" y="16" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.w([[170, 30], [170, 50]])}
        ${Sch.load(170, 80, 0, '')}
        ${Sch.w([[170, 110], [170, 120]])}
        ${Sch.npn(150, 150, '')}
        ${Sch.w([[170, 180], [170, 215]])}${Sch.gnd(170, 215)}
        ${Sch.w([[120, 150], [100, 150]], 'sigw')}
        ${Sch.res(70, 150, 90, '')}
        ${Sch.w([[40, 150], [20, 150]], 'sigw')}<text x="20" y="172" class="sch-t sig">GPIO</text>
        <text id="fL1" x="200" y="84" class="sch-t cu"></text>
        <text id="fC1" x="200" y="160" class="sch-t"></text>
        <text x="150" y="254" class="sch-t big ok" text-anchor="middle">${L('Low-side anahtar', 'Low-side switch')}</text>
        ${Sch.vcc(470, 30, '')}<text id="fV2" x="470" y="16" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.w([[470, 30], [470, 60]])}
        ${Sch.npn(450, 90, '')}
        ${Sch.w([[470, 120], [470, 140]])}
        ${Sch.load(470, 170, 0, '')}
        ${Sch.w([[470, 200], [470, 222]])}${Sch.gnd(470, 222)}
        ${Sch.w([[420, 90], [400, 90]], 'sigw')}
        ${Sch.res(370, 90, 90, '')}
        ${Sch.w([[340, 90], [320, 90]], 'sigw')}<text x="320" y="112" class="sch-t sig">GPIO</text>
        <text id="fL2" x="500" y="174" class="sch-t cu"></text>
        <text id="fC2" x="500" y="100" class="sch-t"></text>
        <circle class="heat" id="fHeat" cx="458" cy="90" r="32"/>
        <text x="450" y="254" class="sch-t big bad" text-anchor="middle">${L('Emitter follower (hata)', 'Emitter follower (mistake)')}</text>
      `);
      // heat circle must be behind the transistor body: move it first
      const heat = svg.querySelector('#fHeat'); svg.insertBefore(heat, svg.firstChild);
      const $ = id => svg.querySelector('#' + id);
      const f1 = new Viz.Flow(svg, 'M170,30V215', { spacing: 15 });
      const f2 = new Viz.Flow(svg, 'M470,30V222', { spacing: 15 });
      const sG = UI.slider(ctl, { label: 'V<sub>GPIO</sub>', min: 0, max: 5, step: 0.05, value: 3.3, fmt: v => V(v, 2), onInput: update });
      const sV = UI.slider(ctl, { label: 'V+', min: 5, max: 24, step: 0.5, value: 12, fmt: v => V(v, 1), onInput: update });
      const sR = UI.slider(ctl, { label: 'R<sub>' + L('yük', 'load') + '</sub>', min: 22, max: 1000, step: 1, value: 120, log: true, unit: 'Ω', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'l1', label: L('Low-side: yük gerilimi', 'Low-side: load voltage') },
        { key: 'p1', label: L('Low-side: transistör kaybı', 'Low-side: transistor loss') },
        { key: 'l2', label: L('Follower: yük gerilimi', 'Follower: load voltage') },
        { key: 'p2', label: L('Follower: transistör kaybı', 'Follower: transistor loss') }
      ]);
      function update() {
        const vg = sG.value, vp = sV.value, R = sR.value;
        // low-side: saturated if vg > ~0.75 V (R_B chosen properly), V_CE(sat) ≈ 0.1 V
        const on1 = App.clamp((vg - 0.55) / 0.25, 0, 1);
        const i1 = on1 * (vp - 0.1) / R, vce1 = vp - i1 * R;
        const vl2 = Math.max(0, Math.min(vg - 0.7, vp - 0.2)), i2 = vl2 / R, vce2 = vp - vl2;
        ro.set('l1', V(i1 * R, 2), on1 > 0.99 ? 'ok' : 'warn');
        ro.set('p1', App.si(vce1 * i1, 'W'), 'ok');
        ro.set('l2', V(vl2, 2) + ' / ' + V(vp, 0), vl2 < vp * 0.8 ? 'bad' : 'ok');
        ro.set('p2', App.si(vce2 * i2, 'W'), vce2 * i2 > 0.3 ? 'bad' : vce2 * i2 > 0.1 ? 'warn' : 'ok');
        $('fV1').textContent = 'V+ = ' + V(vp, 1); $('fV2').textContent = $('fV1').textContent;
        $('fL1').textContent = 'V_' + L('yük', 'load') + ' = ' + V(i1 * R, 1);
        $('fL2').textContent = 'V_' + L('yük', 'load') + ' = ' + V(vl2, 1);
        $('fC1').textContent = 'V_CE = ' + V(vce1, 2);
        $('fC2').textContent = 'V_CE = ' + V(vce2, 1);
        $('fC2').setAttribute('class', 'sch-t ' + (vce2 > 1 && i2 > 0 ? 'bad' : ''));
        heat.style.opacity = App.clamp(vce2 * i2 / 0.4, 0, 0.85).toFixed(2);
        f1.rate = i1 / ((vp - 0.1) / R) * 1.1;
        f2.rate = i2 / ((vp - 0.1) / R) * 1.1;
      }
      update();
    }
  }
});
