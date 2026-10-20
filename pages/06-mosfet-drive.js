/* 06 — Driving a MOSFET: required V_GS vs V_GS(th), logic-level parts, gate resistor, pull-down,
   V_GS(max) and clamps, reading the datasheet, P-channel high-side from an MCU */
App.page({
  id: 'mosfet-drive',
  num: '06',
  group: { tr: 'Sürme', en: 'Driving' },
  title: { tr: 'MOSFET’i sürmek: gate gerilimi ve dirençler', en: 'Driving a MOSFET: gate voltage and resistors' },
  blurb: {
    tr: 'Lojik seviye MOSFET, R<sub>DS(on)</sub>–V<sub>GS</sub>, gate direnci, pull-down, V<sub>GS(max)</sub>, P-kanal high-side.',
    en: 'Logic-level MOSFETs, R<sub>DS(on)</sub> vs V<sub>GS</sub>, gate resistor, pull-down, V<sub>GS(max)</sub>, P-channel high-side.'
  },
  summary: {
    tr: 'MOSFET’in gate’i neredeyse hiç sürekli akım çekmez. İş, doğru <b>gerilimi</b> doğru <b>hızda</b> uygulamaktır. Bu bölüm 3,3 V’luk pinin MOSFET’i tam açıp açmadığını, gate direncini, pull-down’ı ve P-kanal high-side sürmeyi ele alır.',
    en: 'A MOSFET gate draws almost no steady current. The job is applying the right <b>voltage</b> at the right <b>speed</b>. This chapter covers whether a 3.3 V pin fully turns a MOSFET on, the gate resistor, the pull-down and P-channel high-side drive.'
  },
  render(L) {
    return `
      ${App.keys([
        L('V<sub>GS(th)</sub>’e değil, R<sub>DS(on)</sub>’un garanti edildiği V<sub>GS</sub>’e bak.', 'Look at the V<sub>GS</sub> where R<sub>DS(on)</sub> is guaranteed, not at V<sub>GS(th)</sub>.'),
        L('3,3 V MCU için R<sub>DS(on)</sub>’u 2,5 V’ta tanımlı bir MOSFET seç.', 'For a 3.3 V MCU pick a MOSFET with R<sub>DS(on)</sub> specified at 2.5 V.'),
        L('Gate’e 10–100 Ω seri direnç, gate–source arasına 10–100 kΩ pull-down koy.', 'Add 10–100 Ω in series with the gate and 10–100 kΩ gate to source.'),
        L('V<sub>GS(max)</sub>’ı asla aşma; 24 V P-MOS’ta zener kelepçe kullan.', 'Never exceed V<sub>GS(max)</sub>; clamp a 24 V P-MOS gate with a zener.'),
        L('P-MOS high-side’ı GPIO’dan değil, küçük bir N-MOS ya da NPN ile sür.', 'Drive a P-MOS high-side through a small N-MOS or NPN, not the GPIO.')
      ])}
      <style>
        [data-page="mosfet-drive"] .schem .heat { fill: var(--bad); stroke: none; opacity: 0; filter: blur(7px); }
        [data-page="mosfet-drive"] .schem .divider { stroke: var(--line); stroke-width: 1; stroke-dasharray: 4 4; }
        [data-page="mosfet-drive"] .ds-mock td:first-child { font-family: var(--f-mono); white-space: nowrap; }
        [data-page="mosfet-drive"] .ds-mock tr.hot td { background: var(--copper-soft); }
        [data-page="mosfet-drive"] .ds-mock .why { color: var(--muted); font-size: .84rem; }
        [data-page="mosfet-drive"] .ds-mock caption { caption-side: top; text-align: left; padding: 10px 12px; font: 600 .8rem var(--f-mono); color: var(--ink-2); background: var(--panel-2); }
      </style>

      <h2>${L('V<sub>GS(th)</sub> “açılma gerilimi” değildir', 'V<sub>GS(th)</sub> is not the “turn-on voltage”')}</h2>
      <p>${L('<b>V<sub>GS(th)</sub>’te MOSFET henüz açık değildir.</b> Eşik çok küçük bir akımda tanımlanır: tipik <b>I<sub>D</sub> = 250 µA</b>. Anahtar olarak kullanmak için V<sub>GS</sub>, <b>R<sub>DS(on)</sub>’un garanti edildiği gerilime</b> ulaşmalıdır.',
             '<b>At V<sub>GS(th)</sub> the MOSFET is not on yet.</b> The threshold is defined at a tiny current: typically <b>I<sub>D</sub> = 250 µA</b>. As a switch, V<sub>GS</sub> must reach <b>the voltage at which R<sub>DS(on)</sub> is guaranteed</b>.')}</p>
      <div class="eq">${L('Tasarım kuralı', 'Design rule')}: &nbsp; <b>${L('V<sub>GS(sürme)</sub> ≥ R<sub>DS(on)</sub>’un tabloda verildiği en düşük V<sub>GS</sub>', 'V<sub>GS(drive)</sub> ≥ the lowest V<sub>GS</sub> at which R<sub>DS(on)</sub> is listed')}</b>
        <span class="note">${L('V<sub>GS(th)</sub> yalnızca “kesin kapalı”nın bittiği yeri söyler. Eşik sıcakta ~4–7 mV/°C düşer; kapalı tutmak için gate’i 0 V’a sağlam bağla.',
                       'V<sub>GS(th)</sub> only tells you where “certainly off” ends. The threshold falls ~4–7 mV/°C when hot; tie the gate firmly to 0 V to keep it off.')}</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Sınıf', 'Class')}</th><th class="num">V<sub>GS(th)</sub> min–max</th><th class="num">R<sub>DS(on)</sub> max ${L('(koşul)', '(condition)')}</th><th class="num">V<sub>GS(max)</sub></th><th class="num">V<sub>DS</sub> / I<sub>D</sub></th></tr></thead>
        <tbody>
          <tr><td>IRF540N</td><td>${L('standart', 'standard')}</td><td class="num">2–4 V</td><td class="num">44 mΩ @ 10 V</td><td class="num">±20 V</td><td class="num">100 V / 33 A</td></tr>
          <tr><td>IRLZ44N</td><td>${L('lojik seviye', 'logic level')}</td><td class="num">1–2 V</td><td class="num">22 mΩ @ 10 V, 25 @ 5 V, 35 @ 4 V</td><td class="num">±16 V</td><td class="num">55 V / 47 A</td></tr>
          <tr><td>AO3400A</td><td>${L('düşük gerilim lojik', 'low-voltage logic')}</td><td class="num">${L('0,65–1,45 V', '0.65–1.45 V')}</td><td class="num">${L('26,5 mΩ @ 10 V, 32 @ 4,5 V, 48 @ 2,5 V', '26.5 mΩ @ 10 V, 32 @ 4.5 V, 48 @ 2.5 V')}</td><td class="num">±12 V</td><td class="num">${L('30 V / 5,7 A', '30 V / 5.7 A')}</td></tr>
          <tr><td>Si2302CDS</td><td>${L('düşük gerilim lojik', 'low-voltage logic')}</td><td class="num">${L('0,4–1,0 V', '0.4–1.0 V')}</td><td class="num">${L('57 mΩ @ 4,5 V, 75 @ 2,5 V', '57 mΩ @ 4.5 V, 75 @ 2.5 V')}</td><td class="num">±8 V</td><td class="num">${L('20 V / 2,6 A', '20 V / 2.6 A')}</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('Değerler datasheet tipik/maks. değerleridir ve üreticiye göre değişir. Kullandığın parçanın güncel datasheet’ini oku.',
        'Values are datasheet typ/max figures and vary by vendor. Read the current datasheet of the exact part you use.')}</p>

      <h3>${L('“Lojik seviye” ne demek?', 'What does “logic level” mean?')}</h3>
      <p>${L('Lojik seviye MOSFET’in R<sub>DS(on)</sub>’u <b>4,5 V veya altında</b> garanti edilir. Adında çoğu kez “L” vardır: IRL…, …L. Bu, 5 V lojik için yeterlidir.',
             'A logic-level MOSFET has its R<sub>DS(on)</sub> guaranteed at <b>4.5 V or less</b>. The name often has an “L”: IRL…, …L. That is enough for 5 V logic.')}</p>
      <p>${L('<b>3,3 V</b> MCU için R<sub>DS(on)</sub>’u <b>2,5 V ya da 2,7 V</b>’ta tanımlı bir parça ara. “Eşik 1–2 V, o hâlde 3,3 V yeter” akıl yürütmesi yanlıştır.',
             'For a <b>3.3 V</b> MCU, look for R<sub>DS(on)</sub> specified at <b>2.5 V or 2.7 V</b>. “The threshold is 1–2 V, so 3.3 V is plenty” is the wrong reasoning.')}</p>

      ${App.lab('lab-rds', L('MCU’m bu MOSFET’i tam açabiliyor mu?', 'Does my MCU fully turn it on?'), {
        foot: L('Model: R<sub>DS(on)</sub> = R<sub>0</sub> + A/(V<sub>GS</sub> − V<sub>th</sub>), datasheet <b>maks.</b> noktalarına uydurulmuş (mavi noktalar). I<sub>sat</sub> = k·(V<sub>GS</sub> − V<sub>th</sub>)², tipik transfer eğrilerinden. V<sub>th</sub> tipik olduğu için gerçek parça daha kötü olabilir. Yük 12 V’tan dirençsel; V<sub>GS</sub> = V<sub>MCU</sub>. 100 °C: R<sub>DS(on)</sub> ×1,6, V<sub>th</sub> −0,4 V.',
                'Model: R<sub>DS(on)</sub> = R<sub>0</sub> + A/(V<sub>GS</sub> − V<sub>th</sub>), fitted to the datasheet <b>max</b> points (blue dots). I<sub>sat</sub> = k·(V<sub>GS</sub> − V<sub>th</sub>)² from typical transfer curves. V<sub>th</sub> is typical, so a real part can be worse. Resistive load from 12 V; V<sub>GS</sub> = V<sub>MCU</sub>. 100 °C: R<sub>DS(on)</sub> ×1.6, V<sub>th</sub> −0.4 V.')
      })}
      <div class="call info"><strong>${L('Sıfır sıcaklık katsayısı (ZTC) noktası', 'Zero temperature coefficient (ZTC) point')}</strong>
        ${L('Farklı sıcaklıklardaki transfer eğrileri bir V<sub>GS</sub>’te kesişir. Bu noktanın <b>altında</b> sıcak bölge daha çok akım çeker ve kendini ısıtır. <b>Üstünde</b> MOSFET kendini dengeler. Tam açık anahtar ZTC’nin çok üstündedir; lineer çalışan MOSFET ise altındadır ve termal kaçağa açıktır.',
            'The transfer curves for different temperatures cross at one V<sub>GS</sub>. <b>Below</b> it, a hotter region draws more current and heats itself further. <b>Above</b> it, the MOSFET is self-stabilising. A fully-on switch sits far above ZTC; a MOSFET in linear mode sits below it and risks thermal runaway.')}</div>

      <h2>${L('Gate direnci (R<sub>G</sub>)', 'The gate resistor (R<sub>G</sub>)')}</h2>
      <p>${L('Gate elektriksel olarak bir kapasitördür: C<sub>iss</sub> = C<sub>GS</sub> + C<sub>GD</sub>, yüzlerce pF ile birkaç nF. Seri gate direnci üç iş yapar:', 'Electrically the gate is a capacitor: C<sub>iss</sub> = C<sub>GS</sub> + C<sub>GD</sub>, hundreds of pF to a few nF. A series gate resistor does three jobs:')}</p>
      <div class="cards">
        <div class="card"><h4>${L('1 · Tepe akımı sınırla', '1 · Limit the peak current')}</h4><p>${L('Boş kapasitöre basamak gerilim ilk anda büyük akım çeker: I<sub>pk</sub> = V/(R<sub>G</sub> + R<sub>out</sub>). R<sub>G</sub> sürücüyü korur.', 'A voltage step into an empty capacitor draws a large initial current: I<sub>pk</sub> = V/(R<sub>G</sub> + R<sub>out</sub>). R<sub>G</sub> protects the driver.')}</p></div>
        <div class="card"><h4>${L('2 · Salınımı sönümle', '2 · Damp ringing')}</h4><p>${L('İz endüktansı (5–50 nH) ve C<sub>iss</sub> bir LC devresidir. R<sub>G</sub> yoksa gate salınır; MOSFET yanlışlıkla açılıp kapanabilir ya da V<sub>GS(max)</sub> aşılabilir.', 'Trace inductance (5–50 nH) and C<sub>iss</sub> form an LC circuit. Without R<sub>G</sub> the gate rings; the MOSFET can false-trigger or exceed V<sub>GS(max)</sub>.')}</p></div>
        <div class="card"><h4>${L('3 · dV/dt ve EMI kontrolü', '3 · Control dV/dt and EMI')}</h4><p>${L('Yavaş gate, yavaş drain kenarı ve daha az gürültü demektir. Bedeli daha fazla anahtarlama kaybıdır (Bölüm 09).', 'A slower gate means a slower drain edge and less noise. The price is more switching loss (chapter 09).')}</p></div>
      </div>
      <div class="eq">τ = (R<sub>G</sub> + R<sub>out</sub>) · C<sub>iss</sub> &nbsp;&nbsp; t<sub>r(10–90 %)</sub> ≈ 2,2·τ &nbsp;&nbsp; <b>I<sub>pk</sub> ≈ V<sub>drive</sub> / (R<sub>G</sub> + R<sub>out</sub>)</b> &nbsp;&nbsp; ζ = ((R<sub>G</sub> + R<sub>out</sub>)/2)·√(C<sub>iss</sub>/L<sub>loop</sub>)
        <span class="note">${L('Tipik R<sub>G</sub>: MCU pininden 10–100 Ω (pinin kendisi zaten 20–50 Ω), gate sürücüden 2–20 Ω. ζ ≥ ~0,7 iyi sönümlü, ζ &lt; 0,3 belirgin salınımdır. Miller platosu nedeniyle gerçek gate saf RC’den uzun sürer.',
                       'Typical R<sub>G</sub>: 10–100 Ω from an MCU pin (the pin itself is already 20–50 Ω), 2–20 Ω from a gate driver. ζ ≥ ~0.7 is well damped, ζ &lt; 0.3 rings visibly. Because of the Miller plateau a real gate takes longer than a pure RC.')}</span></div>
      ${App.lab('lab-rg', L('Gate direnci: RC yükselme, tepe akımı ve salınım', 'Gate resistor: RC rise, peak current and ringing'), {
        foot: L('Model: seri R–L–C (R = R<sub>G</sub> + sürücü çıkış direnci, C = C<sub>iss</sub> sabit, Miller yok), ideal basamak. GPIO çıkış direnci 3,3 V’ta ~40 Ω, 5 V’ta ~25 Ω, gate sürücüde ~1,5 Ω. Kesik çizgi: eşik (~1,5 V).',
                'Model: series R–L–C (R = R<sub>G</sub> + driver output resistance, C = C<sub>iss</sub> constant, no Miller), ideal step. GPIO output resistance ~40 Ω at 3.3 V, ~25 Ω at 5 V, ~1.5 Ω for a gate driver. Dashed line: threshold (~1.5 V).')
      })}

      <h2>${L('Gate pull-down direnci', 'The gate pull-down resistor')}</h2>
      <p>${L('<b>Pull-down olmadan MOSFET açılışta yarı açık kalabilir.</b> MCU boot ve reset sırasında GPIO’yu Hi-Z giriş tutar; gate hiçbir yere bağlı değildir.',
             '<b>Without a pull-down the MOSFET can sit half-on at power-up.</b> During boot and reset the MCU leaves the GPIO as a Hi-Z input, so the gate is connected to nothing.')}</p>
      <p>${L('Yüzen gate; kaçak akım, kuplaj ve özellikle C<sub>GD</sub> üzerinden drain değişimleriyle yüklenir. Eşiğe yaklaşınca yük titrer ve MOSFET lineer bölgede ısınır.',
             'A floating gate charges from leakage, pickup and above all drain swings through C<sub>GD</sub>. Near the threshold the load flickers and the MOSFET heats in its linear region.')}</p>
      ${App.figure('fig-float', L('Pull-down yok vs 100 kΩ pull-down: açılış sırasında gate', 'No pull-down vs 100 kΩ pull-down: the gate during boot'), {
        foot: L('8 saniyelik döngü: 0–4 s boot (GPIO Hi-Z), 4–6 s GPIO LOW, 6–8 s GPIO HIGH. Soldaki yüzen gate eşiğe sürüklenir (gösterim amaçlı); sağdaki 100 kΩ onu 0 V’ta tutar. Kesik çizgi: eşik bölgesi.',
                'An 8-second cycle: 0–4 s boot (GPIO Hi-Z), 4–6 s GPIO LOW, 6–8 s GPIO HIGH. The floating gate on the left drifts towards threshold (illustrative); the 100 kΩ on the right holds it at 0 V. Dashed line: threshold region.')
      })}
      <ul>
        <li>${L('<b>Değer:</b> 10–100 kΩ. 10 kΩ daha sağlam tutar ama GPIO yüksekken 330 µA çeker; 100 kΩ yalnızca 33 µA çeker.', '<b>Value:</b> 10–100 kΩ. 10 kΩ holds harder but draws 330 µA with the GPIO high; 100 kΩ draws only 33 µA.')}</li>
        <li>${L('<b>Yer:</b> doğrudan gate–source arasına, R<sub>G</sub>’nin MOSFET tarafına. R<sub>G</sub> kopsa bile gate tutulur.', '<b>Placement:</b> directly gate to source, on the MOSFET side of R<sub>G</sub>. The gate stays held even if R<sub>G</sub> opens.')}</li>
        <li>${L('<b>Kapanma:</b> GPIO Hi-Z iken gate R<sub>PD</sub>·C<sub>iss</sub> ile boşalır: 100 kΩ ve 2 nF ile 0,2 ms. Bu yavaştır; normal kapanmayı GPIO LOW yapmalı.', '<b>Turn-off:</b> with the GPIO Hi-Z the gate discharges through R<sub>PD</sub>·C<sub>iss</sub>: 0.2 ms with 100 kΩ and 2 nF. That is slow; normal turn-off should come from GPIO LOW.')}</li>
      </ul>

      <h2>${L('V<sub>GS(max)</sub>: oksidi koru', 'V<sub>GS(max)</sub>: protect the oxide')}</h2>
      <p>${L('<b>V<sub>GS(max)</sub> kısa bir an bile aşılırsa gate oksidi delinir.</b> Sınır çoğu parçada ±20 V, lojik seviye parçalarda ±12 V ya da ±8 V’tur. Salınım tepeleri ve ESD de bu sınırı aşabilir.',
             '<b>Exceed V<sub>GS(max)</sub> even briefly and the gate oxide punctures.</b> The limit is ±20 V for most parts, ±12 V or ±8 V for logic-level parts. Ringing peaks and ESD can exceed it too.')}</p>
      <ul>
        <li>${L('<b>Zener kelepçe:</b> gate–source arasına 12–15 V zener. 24 V raydaki P-MOS high-side için standart çözümdür.', '<b>Zener clamp:</b> a 12–15 V zener from gate to source. The standard fix for a P-MOS high-side on a 24 V rail.')}</li>
        <li>${L('<b>Direnç bölücü:</b> P-MOS gate’ini 0 V yerine V+·R<sub>1</sub>/(R<sub>1</sub>+R<sub>2</sub>)’ye çek. Basittir ama V<sub>GS</sub>, V+ ile değişir; geniş beslemede zener daha güvenlidir.', '<b>Resistor divider:</b> pull the P-MOS gate to V+·R<sub>1</sub>/(R<sub>1</sub>+R<sub>2</sub>) instead of 0 V. Simple, but V<sub>GS</sub> follows V+; over a wide supply range a zener is safer.')}</li>
      </ul>

      <h2>${L('P-kanal high-side’ı MCU’dan sürmek', 'Driving a P-channel high-side from an MCU')}</h2>
      <p>${L('<b>3,3 V pin, 12 V raydaki P-MOS’u kapatamaz.</b> P-MOS’un source’u V+’dadır; kapatmak için gate V+’ya çıkmalıdır. Bu, Bölüm 05’teki PNP tuzağının aynısıdır.',
             '<b>A 3.3 V pin cannot turn off a P-MOS on a 12 V rail.</b> The P-MOS source sits at V+; to turn it off the gate must rise to V+. It is the same trap as the PNP in chapter 05.')}</p>
      <p>${L('Çözüm: gate’i dirençle V+’ya çek (kapalı), küçük bir N-MOS (2N7002) ya da NPN ile aşağı çek (açık). V+ 20 V’u aşarsa bölücü ya da zener ekle.',
             'The fix: pull the gate up to V+ with a resistor (off) and down with a small N-MOS (2N7002) or NPN (on). Above 20 V, add a divider or a zener.')}</p>
      ${App.lab('lab-pmos', L('P-MOS high-side: GPIO → N-MOS → P-MOS gate', 'P-MOS high-side: GPIO → N-MOS → P-MOS gate'), {
        foot: L('P-MOS: V<sub>GS(max)</sub> = ±20 V, R<sub>DS(on)</sub> −10 V’ta tanımlı, −4,5 V’ta kabul edilebilir. R<sub>1</sub> = 10 kΩ pull-up. Bölücü: R<sub>2</sub> = 10 kΩ; zener: R<sub>2</sub> = 2,2 kΩ ve 12 V zener. Kapanma R<sub>1</sub>·C<sub>iss</sub> ≈ 20 µs: hızlı PWM için değil, aç/kapa içindir.',
                'P-MOS: V<sub>GS(max)</sub> = ±20 V, R<sub>DS(on)</sub> specified at −10 V, acceptable at −4.5 V. R<sub>1</sub> = 10 kΩ pull-up. Divider: R<sub>2</sub> = 10 kΩ; zener: R<sub>2</sub> = 2.2 kΩ with a 12 V zener. Turn-off R<sub>1</sub>·C<sub>iss</sub> ≈ 20 µs: for on/off switching, not fast PWM.')
      })}

      <h2>${L('Datasheet okumak: hangi sayı önemli?', 'Reading the datasheet: which numbers matter?')}</h2>
      <p>${L('İlk sayfa pazarlamadır; asıl bilgi iki tablodadır:', 'The first page is marketing; the real information is in two tables:')}</p>
      <ul>
        <li>${L('<b>Mutlak maksimum değerler:</b> hiçbir koşulda aşılmaması gereken sınırlar. Çalışma noktası değildir.', '<b>Absolute maximum ratings:</b> limits never to be exceeded. They are not operating points.')}</li>
        <li>${L('<b>Elektriksel karakteristikler:</b> her sayı yalnızca yanındaki <b>koşulda</b> geçerlidir.', '<b>Electrical characteristics:</b> each number holds only under its <b>condition</b>.')}</li>
      </ul>
      <p>${L('Aşağıda kurgusal bir 30 V lojik seviye MOSFET ve her satıra neden bakıldığı var.', 'Below is a fictional 30 V logic-level MOSFET and why each row matters.')}</p>
      <div class="table-wrap"><table class="ds-mock">
        <caption>XYZ30N05L — ${L('Mutlak maksimum değerler (T<sub>A</sub> = 25 °C)', 'Absolute maximum ratings (T<sub>A</sub> = 25 °C)')}</caption>
        <thead><tr><th>${L('Sembol', 'Symbol')}</th><th>${L('Parametre', 'Parameter')}</th><th class="num">${L('Değer', 'Value')}</th><th>${L('Neden önemli', 'Why it matters')}</th></tr></thead>
        <tbody>
          <tr class="hot"><td>V<sub>DS</sub></td><td>${L('Drain–source gerilimi', 'Drain–source voltage')}</td><td class="num">30 V</td><td class="why">${L('Besleme + endüktif tepe + salınım bunun altında kalmalı; %20–30 pay bırak.', 'Supply + inductive spike + ringing must stay below it; keep 20–30 % margin.')}</td></tr>
          <tr class="hot"><td>V<sub>GS</sub></td><td>${L('Gate–source gerilimi', 'Gate–source voltage')}</td><td class="num">±12 V</td><td class="why">${L('12 V gate sürücüyle doğrudan sürülemez!', 'Cannot be driven straight from a 12 V gate driver!')}</td></tr>
          <tr><td>I<sub>D</sub></td><td>${L('Sürekli drain akımı', 'Continuous drain current')} (T<sub>C</sub> = 25 °C / 100 °C)</td><td class="num">40 A / 25 A</td><td class="why">${L('Kılıf 25 °C’de varsayılır; gerçek sınır ısıldır (Bölüm 13).', 'Assumes the case at 25 °C; the real limit is thermal (chapter 13).')}</td></tr>
          <tr><td>I<sub>DM</sub></td><td>${L('Darbe drain akımı', 'Pulsed drain current')}</td><td class="num">160 A</td><td class="why">${L('Kısa darbeler (inrush) için. Darbe genişliği notuna bak.', 'For short pulses (inrush). Check the pulse-width footnote.')}</td></tr>
          <tr><td>E<sub>AS</sub></td><td>${L('Tek darbe avalanş enerjisi', 'Single-pulse avalanche energy')}</td><td class="num">45 mJ</td><td class="why">${L('Diyotsuz endüktif yükte bir kez dayanabileceği enerji (Bölüm 08).', 'What it survives once with an unclamped inductive load (chapter 08).')}</td></tr>
          <tr><td>P<sub>D</sub>, T<sub>J</sub></td><td>${L('Kayıp gücü, jonksiyon sıcaklığı', 'Power dissipation, junction temperature')}</td><td class="num">35 W, 150 °C</td><td class="why">${L('P<sub>D</sub> de T<sub>C</sub> = 25 °C içindir; R<sub>θJA</sub> ile kendin hesapla.', 'P<sub>D</sub> also assumes T<sub>C</sub> = 25 °C; work it out with R<sub>θJA</sub>.')}</td></tr>
        </tbody></table></div>
      <div class="table-wrap"><table class="ds-mock">
        <caption>XYZ30N05L — ${L('Elektriksel karakteristikler (T<sub>J</sub> = 25 °C)', 'Electrical characteristics (T<sub>J</sub> = 25 °C)')}</caption>
        <thead><tr><th>${L('Sembol', 'Symbol')}</th><th>${L('Koşul', 'Condition')}</th><th class="num">min</th><th class="num">typ</th><th class="num">max</th><th>${L('Neden önemli', 'Why it matters')}</th></tr></thead>
        <tbody>
          <tr><td>V<sub>(BR)DSS</sub></td><td>V<sub>GS</sub> = 0, I<sub>D</sub> = 250 µA</td><td class="num">30 V</td><td class="num"></td><td class="num"></td><td class="why">${L('Avalanşın başladığı gerilim (pratikte 1,1–1,3× daha yüksek).', 'Where avalanche starts (in practice 1.1–1.3× higher).')}</td></tr>
          <tr class="hot"><td>V<sub>GS(th)</sub></td><td>V<sub>DS</sub> = V<sub>GS</sub>, <b>I<sub>D</sub> = 250 µA</b></td><td class="num">${L('1,0 V', '1.0 V')}</td><td class="num">${L('1,5 V', '1.5 V')}</td><td class="num">${L('2,2 V', '2.2 V')}</td><td class="why">${L('Sadece 250 µA: “açık” değil. Max değer, kapalı durumun gürültü payını gösterir.', 'Only 250 µA: not “on”. The max shows how much noise margin “off” has.')}</td></tr>
          <tr class="hot"><td>R<sub>DS(on)</sub></td><td>V<sub>GS</sub> = 10 V, I<sub>D</sub> = 20 A<br>V<sub>GS</sub> = ${L('4,5 V', '4.5 V')}, I<sub>D</sub> = 15 A<br><b>V<sub>GS</sub> = ${L('2,5 V', '2.5 V')}, I<sub>D</sub> = 5 A</b></td><td class="num"></td><td class="num">${L('4,0 mΩ<br>5,5 mΩ<br>9 mΩ', '4.0 mΩ<br>5.5 mΩ<br>9 mΩ')}</td><td class="num">${L('5,0 mΩ<br>7,0 mΩ<br>13 mΩ', '5.0 mΩ<br>7.0 mΩ<br>13 mΩ')}</td><td class="why">${L('3,3 V MCU için 2,5 V satırı belirleyicidir. Max değeri kullan, sıcaklık için ×1,5 ekle.', 'For a 3.3 V MCU the 2.5 V row decides. Use the max, then multiply by ~1.5 for temperature.')}</td></tr>
          <tr><td>Q<sub>g</sub></td><td>V<sub>GS</sub> = ${L('4,5 V', '4.5 V')}, V<sub>DS</sub> = 15 V</td><td class="num"></td><td class="num">22 nC</td><td class="num">30 nC</td><td class="why">${L('Gate’i doldurmak için gereken yük: hız, sürücü akımı, bootstrap kondansatörü.', 'Charge needed to fill the gate: speed, driver current, bootstrap capacitor.')}</td></tr>
          <tr><td>C<sub>iss</sub></td><td>V<sub>GS</sub> = 0, V<sub>DS</sub> = 15 V, f = 1 MHz</td><td class="num"></td><td class="num">1800 pF</td><td class="num"></td><td class="why">${L('RC tahmini için iyi; hız hesabında Q<sub>g</sub> daha doğrudur.', 'Good for an RC estimate; Q<sub>g</sub> is more accurate for speed.')}</td></tr>
          <tr><td>I<sub>GSS</sub></td><td>V<sub>GS</sub> = ±12 V</td><td class="num"></td><td class="num"></td><td class="num">±100 nA</td><td class="why">${L('Gate kaçağı: pull-down’ın ne kadar büyük olabileceğini gösterir.', 'Gate leakage: tells you how large a pull-down can be.')}</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('XYZ30N05L kurgusal bir parçadır; değerler bu sınıftaki tipik MOSFET’lere benzer.', 'XYZ30N05L is a fictional part; values resemble typical MOSFETs of this class.')}</p>

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <details class="fold"><summary>${L('3,3 V MCU 12 V, 3 A LED şeridini hangi MOSFET ile sürer?', 'Which MOSFET lets a 3.3 V MCU switch a 12 V, 3 A LED strip?')}</summary><div>
        <p>${L('Low-side anahtar; gate doğrudan GPIO’dan, 100 Ω seri ve 100 kΩ pull-down ile. V<sub>GS</sub> = 3,3 V.', 'Low-side switch; gate straight from the GPIO with 100 Ω series and 100 kΩ pull-down. V<sub>GS</sub> = 3.3 V.')}</p>
        <div class="table-wrap"><table>
          <thead><tr><th>${L('Parça', 'Part')}</th><th>${L('3,3 V’ta garanti?', 'Guaranteed at 3.3 V?')}</th><th class="num">R<sub>DS(on)</sub> @ ${L('3,3 V', '3.3 V')}</th><th class="num">P = I²R</th><th>${L('Karar', 'Verdict')}</th></tr></thead>
          <tbody>
            <tr><td>AO3400A</td><td>${L('Evet (2,5 V’ta maks. 48 mΩ)', 'Yes (48 mΩ max at 2.5 V)')}</td><td class="num">≈ 39 mΩ</td><td class="num">${L('≈ 0,35 W', '≈ 0.35 W')}</td><td><span class="pill ok">${L('uygun', 'OK')}</span> ${L('SOT-23 için sınırda; aşağıdaki hesaba bak.', 'Borderline for SOT-23; see the check below.')}</td></tr>
            <tr><td>IRLZ44N</td><td>${L('Hayır (en düşük tanım 4 V)', 'No (lowest spec point is 4 V)')}</td><td class="num">≈ 42 mΩ ${L('(tipik)', '(typ.)')}</td><td class="num">${L('≈ 0,38 W', '≈ 0.38 W')}</td><td><span class="pill warn">${L('garanti yok', 'not guaranteed')}</span> ${L('V<sub>GS(th)</sub> max 2 V: kötü bir parça yarı açık kalabilir. 5 V sürmeyle güvenli.', 'V<sub>GS(th)</sub> max 2 V: a bad part may stay half-on. Safe with 5 V drive.')}</td></tr>
            <tr><td>IRF540N</td><td>${L('Hayır (sadece 10 V)', 'No (10 V only)')}</td><td class="num">${L('tanımsız', 'undefined')}</td><td class="num">${L('watt’lar', 'watts')}</td><td><span class="pill bad">${L('kullanma', 'don’t')}</span> ${L('V<sub>GS(th)</sub> 2–4 V: 3,3 V’ta açılmaz ya da lineer bölgede yanar. 10–12 V gate sürücü gerekir.', 'V<sub>GS(th)</sub> 2–4 V: at 3.3 V it stays off or burns in the linear region. Needs a 10–12 V gate driver.')}</td></tr>
          </tbody></table></div>
        ${App.example({
          given: [[L('Yük', 'Load'), '12 V, 3 A'], ['V<sub>GS</sub>', L('3,3 V', '3.3 V')], [L('AO3400A R<sub>DS(on)</sub>', 'AO3400A R<sub>DS(on)</sub>'), '≈ 39 mΩ'], ['R<sub>θJA</sub> (SOT-23)', '≈ 100 °C/W']],
          steps: [
            [L('Kanal kaybı', 'Channel loss'), L('P = (3 A)² · 0,039 Ω', 'P = (3 A)² · 0.039 Ω'), L('≈ 0,35 W', '≈ 0.35 W')],
            [L('Sıcaklık artışı', 'Temperature rise'), L('ΔT = 0,35 W · 100 °C/W', 'ΔT = 0.35 W · 100 °C/W'), '≈ +35 °C', L('drain’e geniş bakır alan bırak', 'give the drain a generous copper pour')]
          ],
          result: L('<b>AO3400A uygun ama sınırda.</b> Uzun süreli 3 A için sıcaklığı ölç.', '<b>The AO3400A works but is borderline.</b> Measure its temperature for long-term 3 A.'),
          level: 'warn'
        })}
        <p>${L('Aynı üç parçayı yukarıdaki “MCU’m tam açabiliyor mu?” deneyinde 3,3 V ve 3 A ile dene. PWM ile karartacaksan gate şarj süresini de düşün (Bölüm 09); birkaç kHz’e kadar GPIO yeterlidir.',
               'Try the same three parts at 3.3 V and 3 A in the “Does my MCU fully turn it on?” lab above. For PWM dimming, consider gate charge time too (chapter 09); a GPIO is fine up to a few kHz.')}</p>
      </div></details>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;
    const V = (v, d) => App.num(v, d == null ? 2 : d) + ' V';

    /* ---------------- Lab 1: does my MCU turn it on? ---------------- */
    {
      const PARTS = {
        irf540n: { name: 'IRF540N', vth: 3.4, r0: 0.025, A: 0.125, k: 6, vdss: 100, id: 33, vgsMax: 20, spec: [[10, 0.044]], specMin: 10, pkg: 'TO-220', pWarn: 1.5, pBad: 3 },
        irlz44n: { name: 'IRLZ44N', vth: 1.6, r0: 0.0168, A: 0.0437, k: 15, vdss: 55, id: 47, vgsMax: 16, spec: [[10, 0.022], [5, 0.025], [4, 0.035]], specMin: 4, pkg: 'TO-220', pWarn: 1.5, pBad: 3 },
        ao3400a: { name: 'AO3400A', vth: 1.05, r0: 0.0223, A: 0.0372, k: 10, vdss: 30, id: 5.7, vgsMax: 12, spec: [[10, 0.0265], [4.5, 0.032], [2.5, 0.048]], specMin: 2.5, pkg: 'SOT-23', pWarn: 0.35, pBad: 0.7 },
        si2302: { name: 'Si2302', vth: 0.8, r0: 0.0417, A: 0.0566, k: 6, vdss: 20, id: 2.6, vgsMax: 8, spec: [[4.5, 0.057], [2.5, 0.075]], specMin: 2.5, pkg: 'SOT-23', pWarn: 0.3, pBad: 0.6 }
      };
      const lab = root.querySelector('#lab-rds');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const cap1 = App.h('div', { class: 'fig-cap' }, L('R<sub>DS(on)</sub> – V<sub>GS</sub> (log). Mavi: datasheet maks. noktaları, dikey çizgi: MCU gerilimi.', 'R<sub>DS(on)</sub> vs V<sub>GS</sub> (log). Blue: datasheet max points, vertical line: MCU voltage.'));
      fig.appendChild(cap1);
      const p1 = new Viz.Plot(fig, {
        w: 600, h: 260, x: [0, 10], y: [0.01, 1], logY: true, yTicks: [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1],
        xLabel: 'V_GS (V)', yLabel: 'R_DS(on) (Ω)', xFmt: v => App.num(v, 0), yFmt: v => App.si(v, 'Ω', 2).replace(' ', '')
      });
      const cap2 = App.h('div', { class: 'fig-cap' }, L('Transfer karakteristiği I<sub>D</sub> – V<sub>GS</sub> (doyumda, log): −40 / 25 / 125 °C. Yatay çizgi: yük akımı.', 'Transfer characteristic I<sub>D</sub> vs V<sub>GS</sub> (saturation, log): −40 / 25 / 125 °C. Horizontal line: load current.'));
      fig.appendChild(cap2);
      const p2 = new Viz.Plot(fig, {
        w: 600, h: 240, x: [0, 7], y: [0.01, 300], logY: true,
        xLabel: 'V_GS (V)', yLabel: 'I_D (A)', xFmt: v => App.num(v, 0), yFmt: v => App.si(v, '', 2).trim()
      });

      const sPart = UI.segmented(ctl, {
        label: 'MOSFET', value: 'ao3400a', onChange: update,
        options: Object.keys(PARTS).map(k => ({ value: k, label: PARTS[k].name }))
      });
      const sV = UI.segmented(ctl, { label: L('MCU gerilimi = gate gerilimi', 'MCU voltage = gate voltage'), value: 3.3, onChange: update, options: [{ value: 3.3, label: V(3.3, 1) }, { value: 5, label: '5 V' }] });
      const sT = UI.segmented(ctl, { label: L('Jonksiyon sıcaklığı', 'Junction temperature'), value: 25, onChange: update, options: [{ value: 25, label: '25 °C' }, { value: 100, label: '100 °C' }] });
      const sI = UI.slider(ctl, { label: L('Yük akımı', 'Load current'), min: 0.1, max: 20, step: 0.1, value: 3, log: true, unit: 'A', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'r', label: 'R<sub>DS(on)</sub> ' + L('(model)', '(model)') },
        { key: 'vds', label: 'V<sub>DS</sub>' },
        { key: 'p', label: L('İletim kaybı', 'Conduction loss') },
        { key: 'spec', label: L('Bu V<sub>GS</sub>’de garanti', 'Guaranteed at this V<sub>GS</sub>') },
        { key: 'id', label: L('Akım değeri', 'Current rating') },
        { key: 'v', label: L('Karar', 'Verdict') }
      ]);

      function dev(P, T) {
        const hot = T > 50;
        return {
          vth: P.vth - (hot ? 0.4 : 0), rm: hot ? 1.6 : 1, k: P.k * Math.pow((T + 273) / 298, -1.5)
        };
      }
      const rOf = (P, d, vgs) => vgs - d.vth <= 0.02 ? Infinity : (P.r0 + P.A / (vgs - d.vth)) * d.rm;
      const isat = (P, d, vgs) => vgs <= d.vth ? 0 : d.k * Math.pow(vgs - d.vth, 2);

      function update() {
        const P = PARTS[sPart.value], vg = sV.value, T = sT.value, I = sI.value;
        const d = dev(P, T);
        const R = rOf(P, d, vg), Is = isat(P, d, vg);
        // operating point with a 12 V resistive load
        const RL = 12 / I;
        let vds;
        if (!isFinite(R) || Is <= 0) vds = 12;
        else {
          let a = 0, b = 12;
          for (let i = 0; i < 60; i++) {
            const m = (a + b) / 2;
            const f = Is * Math.tanh(m / (Is * R)) - (12 - m) / RL;
            if (f > 0) b = m; else a = m;
          }
          vds = (a + b) / 2;
        }
        const Ireal = (12 - vds) / RL, Pw = vds * Ireal, Reff = Ireal > 0 ? vds / Ireal : Infinity;
        const linear = vds > 0.5 || Ireal < I * 0.95;
        const guaranteed = vg >= P.specMin - 1e-6;

        // plot 1
        const curve = [];
        for (let v = d.vth + 0.05; v <= 10; v += 0.02) curve.push([v, Math.min(2, rOf(P, d, v))]);
        p1.line('r', curve, 'cu');
        P.spec.forEach((s, i) => p1.dot('s' + i, s[0], s[1], 'sig', 4));
        for (let i = P.spec.length; i < 3; i++) p1.dot('s' + i, -5, 0.5, 'sig', 0);
        p1.vline('vg', vg, 'sig solid');
        p1.rect('vth', Math.max(0, d.vth - 0.5), 0.01, d.vth + 0.5, 1, 'warn');
        p1.text('vthT', d.vth, 0.75, 'V_th', 'muted', 'middle');
        p1.dot('op', vg, App.clamp(Reff, 0.0101, 0.99), linear ? 'bad' : '', 6);
        p1.text('opT', vg, App.clamp(Reff, 0.0101, 0.99), linear ? L('lineer bölge!', 'linear region!') : App.si(R, 'Ω', 3), linear ? 'bad' : 'cu', 'start', 9, -8);

        // plot 2 — transfer curves at three temperatures
        const temps = [[-40, 'sig thin'], [25, 'cu'], [125, 'bad thin']];
        const curves = temps.map(([t]) => {
          const dd = { vth: P.vth - 0.005 * (t - 25), k: P.k * Math.pow((t + 273) / 298, -1.5) };
          return Viz.sample(v => v <= dd.vth ? 0 : dd.k * Math.pow(v - dd.vth, 2), 0, 7, 280);
        });
        temps.forEach(([t, cls], i) => {
          p2.line('t' + i, curves[i].filter(q => q[1] >= 0.01), cls);
          const vthT = P.vth - 0.005 * (t - 25);
          p2.text('tt' + i, vthT, 0.012, t + ' °C', i === 0 ? 'sig' : i === 1 ? 'cu' : 'bad', i === 0 ? 'start' : 'end', i === 0 ? 4 : -3, -4 - i * 12);
        });
        // ZTC crossing between 25 °C and 125 °C curves
        let ztc = null;
        for (let i = 1; i < curves[1].length; i++) {
          const a0 = curves[2][i - 1][1] - curves[1][i - 1][1], a1 = curves[2][i][1] - curves[1][i][1];
          if (curves[1][i][1] > 0.01 && a0 > 0 && a1 <= 0) { ztc = curves[1][i]; break; }
        }
        if (ztc) { p2.dot('ztc', ztc[0], ztc[1], '', 4); p2.text('ztcT', ztc[0], ztc[1], 'ZTC', 'muted', 'start', 8, 14); }
        p2.hide('ztc', !ztc); p2.hide('ztcT', !ztc);
        p2.hline('il', I, 'cu');
        p2.vline('vg2', vg, 'sig solid');

        ro.set('r', isFinite(R) ? App.si(R, 'Ω', 3) : '∞', linear ? 'bad' : guaranteed ? 'ok' : 'warn');
        ro.set('vds', V(vds, vds < 1 ? 3 : 1), linear ? 'bad' : 'ok');
        ro.set('p', App.si(Pw, 'W'), Pw > P.pBad ? 'bad' : Pw > P.pWarn ? 'warn' : 'ok');
        ro.set('spec', guaranteed ? L('evet', 'yes') + ' (' + L('tanım', 'spec') + ' @ ' + V(P.specMin, 1) + ')' : L('hayır — en düşük tanım ', 'no — lowest spec ') + V(P.specMin, 1), guaranteed ? 'ok' : 'warn');
        ro.set('id', P.pkg + ', ' + App.si(P.id, 'A') + (I > P.id ? ' — ' + L('aşıldı', 'exceeded') : ''), I > P.id ? 'bad' : I > 0.7 * P.id ? 'warn' : 'ok');
        let v, vs;
        if (linear) { v = L('<span class="pill bad">tam açılmıyor</span>', '<span class="pill bad">not fully on</span>'); vs = 'bad'; }
        else if (I > P.id || Pw > P.pBad) { v = L('<span class="pill bad">aşırı yük / ısı</span>', '<span class="pill bad">overloaded / too hot</span>'); vs = 'bad'; }
        else if (!guaranteed || Pw > P.pWarn) { v = L('<span class="pill warn">sınırda</span>', '<span class="pill warn">marginal</span>'); vs = 'warn'; }
        else { v = L('<span class="pill ok">tam açık</span>', '<span class="pill ok">fully on</span>'); vs = 'ok'; }
        ro.set('v', v, vs);
      }
      update();
    }

    /* ---------------- Lab 2: gate resistor RLC ---------------- */
    {
      const lab = root.querySelector('#lab-rg');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const p1 = new Viz.Plot(fig, { w: 600, h: 220, x: [0, 100], y: [-1, 16], xLabel: 't (ns)', yLabel: 'V_GS (V)', xFmt: v => App.si(v, '', 3).trim(), yFmt: v => App.num(v, 0) });
      const p2 = new Viz.Plot(fig, { w: 600, h: 170, x: [0, 100], y: [-50, 200], xLabel: 't (ns)', yLabel: 'I_G (mA)', xFmt: v => App.si(v, '', 3).trim(), yFmt: v => App.num(v, 0) });
      const SRC = { m3: { v: 3.3, r: 40 }, m5: { v: 5, r: 25 }, d12: { v: 12, r: 1.5 } };
      const sSrc = UI.segmented(ctl, {
        label: L('Sürücü', 'Driver'), value: 'm3', onChange: update,
        options: [{ value: 'm3', label: 'GPIO ' + App.num(3.3, 1) + ' V' }, { value: 'm5', label: 'GPIO 5 V' }, { value: 'd12', label: L('Sürücü 12 V', 'Driver 12 V') }]
      });
      const sR = UI.slider(ctl, { label: 'R<sub>G</sub>', min: 1, max: 220, step: 1, value: 47, log: true, unit: 'Ω', onInput: update });
      const sC = UI.slider(ctl, { label: 'C<sub>iss</sub>', min: 100e-12, max: 10e-9, step: 1e-12, value: 1.5e-9, log: true, unit: 'F', onInput: update });
      const sL = UI.slider(ctl, { label: L('Gate döngü endüktansı', 'Gate loop inductance'), min: 2e-9, max: 100e-9, step: 1e-10, value: 20e-9, log: true, unit: 'H', onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'tau', label: 'τ = R·C<sub>iss</sub>' },
        { key: 'tr', label: 't<sub>r</sub> (10–90 %)' },
        { key: 'ipk', label: L('Tepe gate akımı', 'Peak gate current') },
        { key: 'z', label: L('Sönüm ζ', 'Damping ζ') },
        { key: 'ov', label: L('Aşma (overshoot)', 'Overshoot') }
      ]);
      function update() {
        const s = SRC[sSrc.value], Rt = sR.value + s.r, C = sC.value, Lg = sL.value, Vd = s.v;
        const tau = Rt * C, w0 = 1 / Math.sqrt(Lg * C), zeta = Rt / 2 * Math.sqrt(C / Lg);
        const tEnd = Math.max(6 * tau, zeta < 1 ? 7 * 2 * Math.PI / w0 : 0, 4 * 2 * Math.PI / w0);
        const N = 6000, dt = tEnd / N;
        let i = 0, vc = 0, ipk = 0, vmax = 0, t10 = null, t90 = null;
        const vPts = [[0, 0]], iPts = [[0, 0]];
        for (let n = 1; n <= N; n++) {
          i = (i + dt / Lg * (Vd - vc)) / (1 + dt * Rt / Lg);
          vc += dt * i / C;
          const t = n * dt;
          if (i > ipk) ipk = i;
          if (vc > vmax) vmax = vc;
          if (t10 === null && vc >= 0.1 * Vd) t10 = t;
          if (t90 === null && vc >= 0.9 * Vd) t90 = t;
          if (n % 15 === 0) { vPts.push([t * 1e9, vc]); iPts.push([t * 1e9, i * 1e3]); }
        }
        const x1 = tEnd * 1e9;
        p1.setRange({ x: [0, x1], y: [-0.5, Math.max(Vd * 1.25, vmax * 1.08)] });
        p2.setRange({ x: [0, x1], y: [Math.min(-10, Math.min(...iPts.map(p => p[1])) * 1.1), Math.max(10, ipk * 1e3 * 1.15)] });
        p1.hline('vth', 1.5, 'sig');
        p1.hline('vd', Vd, '');
        p1.line('v', vPts, 'sig');
        p1.text('vdT', x1 * 0.98, Vd, 'V_drive = ' + V(Vd, 1), 'muted', 'end', 0, -6);
        p2.line('i', iPts, 'cu');
        p2.hline('z0', 0, '');
        ro.set('tau', App.si(tau, 's'));
        ro.set('tr', t90 !== null && t10 !== null ? App.si(t90 - t10, 's') : '—');
        ro.set('ipk', App.si(ipk, 'A') + ' (V/R = ' + App.si(Vd / Rt, 'A') + ')');
        ro.set('z', App.num(zeta, 2), zeta >= 0.7 ? 'ok' : zeta >= 0.3 ? 'warn' : 'bad');
        const ov = Math.max(0, (vmax - Vd) / Vd * 100);
        ro.set('ov', App.num(ov, 0) + ' % → ' + V(vmax, 1), vmax > 20 ? 'bad' : ov > 15 ? 'warn' : 'ok');
      }
      update();
    }

    /* ---------------- Figure: floating gate ---------------- */
    {
      const fig = root.querySelector('#fig-float .lab-fig');
      const svg = Viz.schematic(fig, 600, 265, `
        <circle class="heat" id="flHeat" cx="190" cy="160" r="34"/>
        <line class="divider" x1="300" y1="10" x2="300" y2="255"/>
        ${Sch.vcc(200, 30, '+12 V')}${Sch.w([[200, 30], [200, 50]])}
        ${Sch.load(200, 80, 0, L('yük', 'load'))}${Sch.w([[200, 110], [200, 130]])}
        ${Sch.nmos(180, 160, '')}${Sch.w([[200, 190], [200, 220]])}${Sch.gnd(200, 220)}
        ${Sch.box(20, 140, 60, 40, 'MCU', '')}${Sch.w([[80, 160], [150, 160]], 'sigw')}
        <text id="flG1" x="84" y="150" class="sch-t sig"></text>
        <text id="flV1" x="216" y="166" class="sch-t"></text>
        <text x="150" y="252" class="sch-t big bad" text-anchor="middle">${L('Pull-down yok', 'No pull-down')}</text>
        ${Sch.vcc(500, 30, '+12 V')}${Sch.w([[500, 30], [500, 50]])}
        ${Sch.load(500, 80, 0, L('yük', 'load'))}${Sch.w([[500, 110], [500, 130]])}
        ${Sch.nmos(480, 160, '')}${Sch.w([[500, 190], [500, 220]])}${Sch.gnd(500, 220)}
        ${Sch.box(320, 140, 60, 40, 'MCU', '')}${Sch.w([[380, 160], [450, 160]], 'sigw')}
        ${Sch.dot(420, 160)}${Sch.w([[420, 160], [420, 172]])}${Sch.res(420, 202, 0, '100 kΩ')}${Sch.gnd(420, 232)}
        <text id="flG2" x="384" y="150" class="sch-t sig"></text>
        <text id="flV2" x="516" y="166" class="sch-t"></text>
        <text x="450" y="252" class="sch-t big ok" text-anchor="middle">${L('100 kΩ pull-down', '100 kΩ pull-down')}</text>
      `);
      const $ = id => svg.querySelector('#' + id);
      const f1 = new Viz.Flow(svg, 'M200,30V220', { spacing: 15 });
      const f2 = new Viz.Flow(svg, 'M500,30V220', { spacing: 15 });
      const p = new Viz.Plot(fig, {
        w: 600, h: 190, x: [0, 8], y: [-0.2, 3.8], xLabel: L('zaman (s)', 'time (s)'), yLabel: 'V_GS (V)',
        xTicks: [0, 2, 4, 6, 8], yTicks: [0, 1, 2, 3], xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      p.rect('hz', 0, -0.2, 4, 3.8, 'warn');
      p.text('hzT', 0.1, 3.5, L('reset / boot: GPIO Hi-Z', 'reset / boot: GPIO Hi-Z'), 'muted');
      p.text('loT', 4.1, 3.5, 'LOW', 'muted');
      p.text('hiT', 6.1, 3.5, 'HIGH', 'muted');
      p.rect('vth', 0, 1.2, 8, 1.8, 'bad');
      const vgsA = t => {
        if (t < 4) return Math.min(2.4, 2.3 * (1 - Math.exp(-t / 1.1)) + 0.18 * Math.sin(t * 9) * (t > 0.3 ? 1 : t / 0.3) + 0.08 * Math.sin(t * 23));
        return t < 6 ? 0 : 3.3;
      };
      const vgsB = t => (t < 6 ? 0 : 3.3);
      const on = v => App.clamp((v - 1.2) / 0.9, 0, 1);
      p.line('a', Viz.sample(vgsA, 0, 8, 400), 'bad');
      p.line('b', Viz.sample(vgsB, 0, 8, 400), 'ok dash');
      const cur = p.vline('cur', 0, 'cu solid');
      void cur;
      const show = t => {
        const a = Math.max(0, vgsA(t)), b = vgsB(t);
        const state = t < 4 ? 'Hi-Z' : t < 6 ? 'LOW' : 'HIGH';
        $('flG1').textContent = state; $('flG2').textContent = state;
        $('flV1').textContent = 'V_GS = ' + V(a, 1); $('flV2').textContent = 'V_GS = ' + V(b, 1);
        const half = t < 4 && on(a) > 0.05;
        $('flV1').setAttribute('class', 'sch-t ' + (half ? 'bad' : ''));
        f1.rate = on(a) * (t < 4 ? 0.6 : 1.1); f2.rate = on(b) * 1.1;
        $('flHeat').style.opacity = (half ? App.clamp(on(a), 0, 0.85) : 0).toFixed(2);
        p.vline('cur', t, 'cu solid');
        p.dot('da', t, a, 'bad', 4); p.dot('db', t, b, 'sig', 4);
      };
      if (App.reducedMotion) show(3.5);
      else { let t = 0; App.onFrame(dt => { t = (t + dt) % 8; show(t); }); }
    }

    /* ---------------- Lab 3: P-MOS high-side with N-MOS pull-down ---------------- */
    {
      const lab = root.querySelector('#lab-pmos');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const svg = Viz.schematic(fig, 600, 300, `
        ${Sch.vcc(400, 30, '')}<text id="pmV" x="400" y="16" class="sch-t rail" text-anchor="middle"></text>
        ${Sch.w([[280, 30], [400, 30], [400, 80]])}${Sch.dot(400, 30)}
        ${Sch.w([[280, 30], [280, 40]])}${Sch.res(280, 70, 0, 'R1 10 kΩ')}
        <g id="pmZ">${Sch.dot(280, 30)}${Sch.w([[280, 30], [230, 30], [230, 40]])}${Sch.diode(230, 70, 180, '', 'zener')}${Sch.w([[230, 100], [230, 110], [280, 110]])}${Sch.dot(280, 110)}
          <text x="200" y="74" class="sch-t" text-anchor="end">12 V</text></g>
        ${Sch.w([[280, 100], [280, 120]])}
        ${Sch.w([[280, 110], [350, 110]])}
        ${Sch.pmos(380, 110, 'P-MOS')}
        ${Sch.w([[400, 140], [400, 170]])}
        ${Sch.load(400, 200, 0, L('yük', 'load'))}
        ${Sch.w([[400, 230], [400, 270]])}${Sch.gnd(400, 270)}
        ${Sch.res(280, 150, 0, '')}<text id="pmR2" x="294" y="154" class="sch-t"></text>
        ${Sch.w([[280, 180], [280, 195]])}
        ${Sch.nmos(260, 225, '2N7002')}
        ${Sch.w([[280, 255], [280, 270]])}${Sch.gnd(280, 270)}
        ${Sch.box(20, 200, 100, 50, 'MCU', '')}
        ${Sch.w([[120, 225], [140, 225]], 'sigw')}${Sch.res(170, 225, 90, '100 Ω')}${Sch.w([[200, 225], [230, 225]], 'sigw')}
        <text id="pmG" x="70" y="268" class="sch-t sig" text-anchor="middle"></text>
        <text id="pmVgs" x="430" y="96" class="sch-t big"></text>
        <text id="pmSt" x="430" y="80" class="sch-t"></text>
      `);
      const $ = id => svg.querySelector('#' + id);
      const fLoad = new Viz.Flow(svg, 'M400,30V270', { spacing: 15 });
      const fBias = new Viz.Flow(svg, 'M280,30V270', { cls: 'flow e', spacing: 13, speed: 35, r: 2.2 });
      const fZ = new Viz.Flow(svg, 'M280,30H230V110H280V270', { cls: 'flow e', spacing: 13, speed: 35, r: 2.2 });
      const p = new Viz.Plot(fig, {
        w: 600, h: 220, x: [5, 48], y: [0, 50], xLabel: 'V+ (V)', yLabel: '|V_GS| (V)',
        xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      p.rect('bad', 5, 20, 48, 50, 'bad'); p.text('badT', 6, 46, L('|V_GS| > 20 V: oksit delinir', '|V_GS| > 20 V: oxide breaks down'), 'bad');
      p.rect('low', 5, 0, 48, 4.5, 'warn'); p.text('lowT', 6, 2, L('|V_GS| < 4,5 V: tam açılmaz', '|V_GS| < 4.5 V: not fully on'), 'muted');
      const sGp = UI.toggle(ctl, { label: L('GPIO HIGH (yük açık)', 'GPIO HIGH (load on)'), value: true, onChange: update });
      const sMode = UI.segmented(ctl, {
        label: L('Gate devresi', 'Gate network'), value: 'pu', onChange: update,
        options: [{ value: 'pu', label: L('Sadece pull-up', 'Pull-up only') }, { value: 'div', label: L('Bölücü', 'Divider') }, { value: 'z', label: 'Zener 12 V' }]
      });
      const sV = UI.slider(ctl, { label: 'V+', min: 5, max: 48, step: 0.5, value: 12, fmt: v => V(v, 1), onInput: update });
      const ro = UI.readouts(ctl, [
        { key: 'vgs', label: 'V<sub>GS</sub> (P-MOS)' },
        { key: 'ib', label: L('Bias akımı (açıkken)', 'Bias current (on)') },
        { key: 'pz', label: L('Zener kaybı', 'Zener dissipation') },
        { key: 'st', label: L('Durum', 'Status') }
      ]);
      const R1 = 10e3;
      const vgsOf = (vp, mode) => {
        if (mode === 'pu') return vp;
        if (mode === 'div') return vp * R1 / (R1 + 10e3);
        return Math.min(vp * R1 / (R1 + 2.2e3), 12);
      };
      function update() {
        const vp = sV.value, mode = sMode.value, on = sGp.value;
        $('pmZ').style.display = mode === 'z' ? '' : 'none';
        $('pmR2').textContent = mode === 'pu' ? 'R2 = 0 Ω' : mode === 'div' ? 'R2 10 kΩ' : L('R2 2,2 kΩ', 'R2 2.2 kΩ');
        $('pmV').textContent = 'V+ = ' + V(vp, 1);
        const mag = on ? vgsOf(vp, mode) : 0;
        const R2 = mode === 'pu' ? 0 : mode === 'div' ? 10e3 : 2.2e3;
        let ib = 0, pz = 0;
        if (on) {
          if (mode === 'z' && vp * R1 / (R1 + R2) > 12) { ib = (vp - 12) / R2; pz = (ib - 12 / R1) * 12; }
          else ib = vp / (R1 + R2);
        }
        const bad = mag > 20, weak = on && mag < 4.5, half = on && mag < 2.5;
        ro.set('vgs', on ? '−' + V(mag, 1) : '0 V (' + L('kapalı', 'off') + ')', bad ? 'bad' : weak ? 'warn' : 'ok');
        ro.set('ib', App.si(ib, 'A'));
        ro.set('pz', mode === 'z' ? App.si(pz, 'W') : '—', pz > 0.25 ? 'bad' : pz > 0.15 ? 'warn' : '');
        const st = !on ? ['ok', L('Kapalı: R1 gate’i V+’ya çekiyor', 'Off: R1 pulls the gate to V+')]
          : bad ? ['bad', L('V_GS(max) aşıldı — oksit hasarı!', 'V_GS(max) exceeded — oxide damage!')]
            : weak ? ['warn', L('V_GS çok küçük: yarı açık', 'V_GS too small: half-on')]
              : ['ok', L('Tam açık, V_GS sınırlar içinde', 'Fully on, V_GS within limits')];
        ro.set('st', st[1], st[0]);
        $('pmVgs').textContent = 'V_GS = ' + (on ? '−' : '') + V(mag, 1);
        $('pmVgs').setAttribute('class', 'sch-t big ' + (st[0] === 'bad' ? 'bad' : st[0] === 'warn' ? 'cu' : 'ok'));
        $('pmSt').textContent = mode === 'z' && on && vp * R1 / (R1 + R2) > 12 ? L('zener kelepçeliyor', 'zener clamping') : '';
        $('pmG').textContent = 'GPIO = ' + (on ? 'HIGH' : 'LOW');
        fLoad.rate = on && !half ? (weak ? 0.5 : 1.1) : 0;
        fBias.rate = on && mode !== 'z' ? 0.5 : 0;
        fZ.rate = on && mode === 'z' ? 0.5 : 0;
        if (on && mode === 'z' && vp * R1 / (R1 + R2) <= 12) { fZ.rate = 0; fBias.rate = 0.5; }
        ['pu', 'div', 'z'].forEach(m => p.line('m' + m, Viz.sample(x => vgsOf(x, m), 5, 48, 100), m === mode ? 'cu' : 'faint'));
        p.text('mpuT', 26, 30, L('sadece pull-up', 'pull-up only'), mode === 'pu' ? 'cu' : 'muted', 'start');
        p.text('mdivT', 30, 15, L('bölücü', 'divider'), mode === 'div' ? 'cu' : 'muted', 'end', -4, -8);
        p.text('mzT', 46, 12, 'zener', mode === 'z' ? 'cu' : 'muted', 'end', 0, 14);
        p.dot('op', vp, vgsOf(vp, mode), bad ? 'bad' : '');
      }
      update();
    }
  }
});
