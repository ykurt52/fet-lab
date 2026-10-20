/* 09 — The switching instant: MOSFET capacitances, gate charge, Miller plateau, switching/conduction/gate losses,
   dV/dt-induced turn-on, and why BJTs are slow to turn off (storage time, Baker clamp, speed-up capacitor). */
(function () {
  'use strict';

  /* Piecewise gate-charge model (clamped inductive load with freewheel diode).
     Intervals use RC charging of an effective capacitance where V_GS moves and a constant
     gate current on the Miller plateau, so every interval = charge / gate current.
     p = {vdrv, rg, qgs, qgd, qg, vth, vpl, il, vdd}; Q_g is taken as specified at V_GS = 10 V. */
  function gateModel(p, mode) {
    const vth = p.vth, vpl = Math.max(p.vpl, vth + 0.1), V = p.vdrv, R = p.rg;
    const C1 = p.qgs / vpl;                                   // 0 → plateau
    const qod = Math.max(p.qg - p.qgs - p.qgd, 0.5e-9);
    const C4 = qod / Math.max(10 - vpl, 0.5);                 // plateau → 10 V
    const tau1 = R * C1, tau4 = R * C4;
    const idOf = v => v <= vth ? 0 : p.il * Math.min(1, Math.pow((v - vth) / (vpl - vth), 2));
    const m = { mode, vpl, vth, status: 'ok', b: null, tD: NaN, tI: NaN, tV: NaN, igPl: NaN };
    if (mode === 'on') {
      if (V <= vth) {
        m.status = 'none'; m.T = 5 * tau1;
        m.f = t => { const vgs = t < 0 ? 0 : V * (1 - Math.exp(-t / tau1)); return { vgs, vds: p.vdd, id: 0, ig: t < 0 ? 0 : (V - vgs) / R }; };
      } else if (V <= vpl + 0.02) {
        m.status = 'stall'; m.T = 6 * tau1; m.tD = tau1 * Math.log(V / (V - vth));
        m.f = t => { const vgs = t < 0 ? 0 : V * (1 - Math.exp(-t / tau1)); return { vgs, vds: p.vdd, id: idOf(vgs), ig: t < 0 ? 0 : (V - vgs) / R }; };
        m.idStall = idOf(V);
      } else {
        const t1 = tau1 * Math.log(V / (V - vth));
        const t2 = tau1 * Math.log((V - vth) / (V - vpl));
        const ig3 = (V - vpl) / R, t3 = p.qgd / ig3, t4 = 3 * tau4;
        const b = [0, t1, t1 + t2, t1 + t2 + t3, t1 + t2 + t3 + t4];
        m.b = b; m.T = b[4]; m.tD = t1; m.tI = t2; m.tV = t3; m.igPl = ig3;
        m.f = t => {
          if (t < 0) return { vgs: 0, vds: p.vdd, id: 0, ig: 0 };
          if (t < b[2]) { const vgs = V * (1 - Math.exp(-t / tau1)); return { vgs, vds: p.vdd, id: idOf(vgs), ig: (V - vgs) / R }; }
          if (t < b[3]) return { vgs: vpl, vds: p.vdd * (1 - (t - b[2]) / t3), id: p.il, ig: ig3 };
          const vgs = V - (V - vpl) * Math.exp(-(t - b[3]) / tau4);
          return { vgs, vds: 0, id: p.il, ig: (V - vgs) / R };
        };
      }
    } else {
      if (V <= vpl + 0.02) {
        m.status = 'noton'; m.T = 5 * tau1;
        m.f = () => ({ vgs: V, vds: p.vdd, id: idOf(V), ig: 0 });
      } else {
        const ta = tau4 * Math.log(V / vpl);
        const igp = vpl / R, tb = p.qgd / igp;
        const tc = tau1 * Math.log(vpl / vth), td = 2.3 * tau1;
        const b = [0, ta, ta + tb, ta + tb + tc, ta + tb + tc + td];
        m.b = b; m.T = b[4]; m.tD = ta; m.tV = tb; m.tI = tc; m.igPl = igp;
        m.f = t => {
          if (t < 0) return { vgs: V, vds: 0, id: p.il, ig: 0 };
          if (t < b[1]) { const vgs = V * Math.exp(-t / tau4); return { vgs, vds: 0, id: p.il, ig: -vgs / R }; }
          if (t < b[2]) return { vgs: vpl, vds: p.vdd * (t - b[1]) / tb, id: p.il, ig: -igp };
          const vgs = vpl * Math.exp(-(t - b[2]) / tau1);
          return { vgs, vds: p.vdd, id: idOf(vgs), ig: -vgs / R };
        };
      }
    }
    // switching energy E = ∫ V_DS·I_D dt (numeric)
    const N = 1600; let E = 0, prev = 0;
    m.cum = [];
    for (let i = 0; i <= N; i++) {
      const t = m.T * i / N, s = m.f(t), P = s.vds * s.id;
      if (i) E += (P + prev) / 2 * m.T / N;
      prev = P; m.cum.push(E);
    }
    m.E = E;
    return m;
  }

  App.page({
    id: 'switching',
    num: '09',
    group: { tr: 'Hızlı anahtarlama', en: 'Fast switching' },
    title: { tr: 'Anahtarlama anı: gate şarjı ve Miller platosu', en: 'The switching instant: gate charge and the Miller plateau' },
    blurb: { tr: 'C_iss/C_rss, Q_g ve Miller platosu, anahtarlama kaybı, dV/dt ile istenmeyen iletim, BJT depolama zamanı.', en: 'C_iss/C_rss, Q_g and the Miller plateau, switching loss, dV/dt turn-on, BJT storage time.' },
    summary: {
      tr: 'MOSFET tam açık ya da tam kapalıyken az ısınır. Isının çoğu aradaki kısa geçişte üretilir. Bu geçişi gate kapasitansları ve gate akımı belirler.',
      en: 'A MOSFET barely warms up when fully on or fully off. Most heat is made in the short transition between. Gate capacitance and gate current set that transition.'
    },
    render(L) {
      return `
      ${App.keys([
        L('MOSFET ısısının çoğu açık ile kapalı arasındaki geçişte üretilir.', 'Most MOSFET heat is made in the transition between on and off.'),
        L('Geçiş süresi ≈ Q<sub>gd</sub> / gate akımı. Gate akımını sürücü belirler.', 'Transition time ≈ Q<sub>gd</sub> / gate current. The driver sets the gate current.'),
        L('3,3 V GPIO gate’i mikrosaniyelerle sürer. Hızlı PWM’de gate sürücü kullan.', 'A 3.3 V GPIO takes microseconds. For fast PWM, use a gate driver.'),
        L('Yarım köprüde alt MOSFET’in kapatma yolunu düşük empedanslı tut.', 'In a half-bridge, keep the low-side turn-off path low-impedance.'),
        L('BJT geç kapanır. Hızlandırma kondansatörü ya da Baker clamp ekle.', 'A BJT turns off late. Add a speed-up capacitor or a Baker clamp.')
      ])}

      <h2>${L('Üç kapasitans, bir datasheet tablosu', 'Three capacitances, one datasheet table')}</h2>
      <p>${L('<b>MOSFET’in gate’i aslında bir kondansatördür.</b> İnce bir oksitle kanaldan yalıtılmış bir metal plakadır.', '<b>A MOSFET’s gate is really a capacitor.</b> It is a metal plate insulated from the channel by a thin oxide.')}</p>
      <p>${L('Fiziksel olarak üç kapasitans vardır:', 'Physically there are three capacitances:')}</p>
      <ul>
        <li>${L('<b>C<sub>gs</sub></b>: gate–source.', '<b>C<sub>gs</sub></b>: gate–source.')}</li>
        <li>${L('<b>C<sub>gd</sub></b>: gate–drain, yani Miller kapasitansı.', '<b>C<sub>gd</sub></b>: gate–drain, the Miller capacitance.')}</li>
        <li>${L('<b>C<sub>ds</sub></b>: drain–source, çoğunlukla body diyotunun jonksiyon kapasitansı.', '<b>C<sub>ds</sub></b>: drain–source, mostly the body-diode junction capacitance.')}</li>
      </ul>
      <p>${L('Datasheet bunları doğrudan vermez. Ölçülebilen üç kombinasyonu verir:', 'The datasheet does not list them directly. It gives three measurable combinations:')}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Datasheet', 'Datasheet')}</th><th>${L('Tanım', 'Definition')}</th><th>${L('Ne işe yarar', 'What it tells you')}</th></tr></thead>
        <tbody>
          <tr><td><b>C<sub>iss</sub></b> ${L('(giriş)', '(input)')}</td><td>C<sub>gs</sub> + C<sub>gd</sub></td><td>${L('Gate’in “gördüğü” kapasitans; gecikme ve sürücü yükü.', 'What the gate driver “sees”; delay and driver load.')}</td></tr>
          <tr><td><b>C<sub>oss</sub></b> ${L('(çıkış)', '(output)')}</td><td>C<sub>ds</sub> + C<sub>gd</sub></td><td>${L('Her kapanışta şarj olan, her açılışta kanalda boşalan enerji: ½·C<sub>oss</sub>·V².', 'Energy charged at each turn-off and dumped in the channel at each turn-on: ½·C<sub>oss</sub>·V².')}</td></tr>
          <tr><td><b>C<sub>rss</sub></b> ${L('(geri besleme)', '(reverse transfer)')}</td><td>C<sub>gd</sub></td><td>${L('Miller platosunun uzunluğu ve dV/dt kaynaklı istenmeyen iletim.', 'Length of the Miller plateau and dV/dt-induced turn-on.')}</td></tr>
        </tbody></table></div>
      <p>${L('<b>Bu kapasitanslar gerilime bağlıdır.</b> V<sub>DS</sub> arttıkça C<sub>gd</sub> ve C<sub>ds</sub> küçülür; C<sub>rss</sub> 0 ile 25 V arasında 10 kattan fazla değişebilir.', '<b>These capacitances depend on voltage.</b> C<sub>gd</sub> and C<sub>ds</sub> shrink as V<sub>DS</sub> rises; C<sub>rss</sub> can change more than tenfold between 0 and 25 V.')}</p>
      <p>${L('İlk sayfadaki C<sub>iss</sub> genellikle 25 V’ta ölçülür. Anahtarlama sırasında gate’in gördüğünü küçümser.', 'The C<sub>iss</sub> on page one is usually measured at 25 V. It underestimates what the gate sees while switching.')}</p>
      ${App.figure('fig-caps', L('Kapasitanslar V<sub>DS</sub> ile nasıl değişir', 'How the capacitances change with V<sub>DS</sub>'), {
        foot: L('Tipik 60 V trench MOSFET; C<sub>gs</sub> ≈ 1,8 nF sabit, C<sub>gd</sub> ve C<sub>ds</sub> jonksiyon modeli. Logaritmik eksen. Düşük gerilimde C<sub>rss</sub>’in nasıl şiştiğine bak.',
                'Typical 60 V trench MOSFET; C<sub>gs</sub> ≈ 1.8 nF constant, C<sub>gd</sub> and C<sub>ds</sub> from a junction model. Log axis. Notice how C<sub>rss</sub> balloons at low voltage.')
      })}
      <div class="call info"><strong>${L('Kapasitans yerine yük (nC) kullan', 'Use charge (nC) instead of capacitance')}</strong>
        ${L('Kapasitans gerilimle değiştiği için “C·ΔV” hesabı yanıltır. Bu yüzden datasheet <b>Q<sub>g</sub></b> verir: gate’i belirli bir V<sub>GS</sub>’e getiren toplam yük. Yük, değişken kapasitansın etkisini zaten içerir.',
            'Capacitance varies with voltage, so a “C·ΔV” estimate misleads. That is why datasheets give <b>Q<sub>g</sub></b>: the total charge to bring the gate to a given V<sub>GS</sub>. Charge already includes the varying capacitance.')}</div>

      <h2>${L('Gate şarj eğrisi ve dört aralık', 'The gate-charge curve and its four intervals')}</h2>
      <p>${L('<b>Gate gerilimi açılışın ortasında yatay bir bölgede durur: Miller platosu.</b> Açılış dört aralıkta olur:', '<b>The gate voltage pauses on a flat section mid-turn-on: the Miller plateau.</b> Turn-on happens in four intervals:')}</p>
      <ol class="steps">
        <li>${L('<b>t1, gecikme:</b> V<sub>GS</sub> 0’dan V<sub>th</sub>’ye çıkar. Yalnız C<sub>gs</sub> dolar, drain akımı yoktur.', '<b>t1, delay:</b> V<sub>GS</sub> rises from 0 to V<sub>th</sub>. Only C<sub>gs</sub> charges; no drain current yet.')}</li>
        <li>${L('<b>t2, akım yükselişi:</b> I<sub>D</sub> yük akımına çıkar. Diyot hâlâ ilettiği için V<sub>DS</sub> = V<sub>DD</sub> kalır. MOSFET tam akımı tam gerilim altında alır.', '<b>t2, current rise:</b> I<sub>D</sub> rises to the load current. The diode still conducts, so V<sub>DS</sub> stays at V<sub>DD</sub>. The MOSFET takes full current at full voltage.')}</li>
        <li>${L('<b>t3, Miller platosu:</b> şimdi V<sub>DS</sub> düşer. Sürücü akımının tamamı C<sub>gd</sub>’ye gider, V<sub>GS</sub> sabit kalır. Bu aralığın yükü <b>Q<sub>gd</sub></b>’dir.', '<b>t3, Miller plateau:</b> now V<sub>DS</sub> falls. All the driver current goes into C<sub>gd</sub> and V<sub>GS</sub> stays flat. The charge of this interval is <b>Q<sub>gd</sub></b>.')}</li>
        <li>${L('<b>t4, overdrive:</b> V<sub>GS</sub> sürücü gerilimine çıkar ve R<sub>DS(on)</sub> en aza iner. Anahtarlama kaybı yoktur, yük yine harcanır.', '<b>t4, overdrive:</b> V<sub>GS</sub> rises to the drive voltage and R<sub>DS(on)</sub> reaches its minimum. No switching loss, but charge is still spent.')}</li>
      </ol>
      <div class="eq"><b>t<sub>fv</sub> ≈ Q<sub>gd</sub> / I<sub>G</sub></b> &nbsp;&nbsp; I<sub>G(plato)</sub> = (V<sub>drv</sub> − V<sub>plateau</sub>) / R<sub>G</sub>
        <span class="note">${L('R<sub>G</sub>: sürücü çıkış direnci + harici direnç + MOSFET iç gate direnci (1–3 Ω). Kapanışta plato akımı V<sub>plateau</sub>/R<sub>G</sub> olur.',
                                'R<sub>G</sub>: driver output resistance + external resistor + MOSFET internal gate resistance (1–3 Ω). At turn-off the plateau current is V<sub>plateau</sub>/R<sub>G</sub>.')}</span></div>

      ${App.lab('lab-gate', L('Açılış/kapanış simülatörü: V<sub>GS</sub>, V<sub>DS</sub>, I<sub>D</sub> ve kayıp enerjisi', 'Turn-on/turn-off simulator: V<sub>GS</sub>, V<sub>DS</sub>, I<sub>D</sub> and switching energy'), {
        stack: true,
        foot: L('Endüktif yük + serbest geçiş diyotu; parça parça gate şarj modeli, Q<sub>g</sub> 10 V’ta. Gerçekte V<sub>DS</sub> düşüşü iki eğimlidir ve endüktanslar ringing ekler. Kırmızı alan V<sub>DS</sub>·I<sub>D</sub>; altındaki alan anahtarlama enerjisidir.',
                'Inductive load + freewheel diode; piecewise gate-charge model, Q<sub>g</sub> at 10 V. In reality the V<sub>DS</sub> fall has two slopes and inductances add ringing. The red area is V<sub>DS</sub>·I<sub>D</sub>; the area under it is the switching energy.')
      })}

      <h3>${L('3,3 V GPIO neden yavaş?', 'Why is a 3.3 V GPIO slow?')}</h3>
      <p>${L('<b>GPIO plato boyunca gate’e çok az akım verir.</b> Pin direnci 25–50 Ω’dur ve logic-level platosu 2,5–3 V civarındadır. Sürücü ile platonun arasında yalnız birkaç yüz mV kalır.', '<b>A GPIO feeds very little current into the gate on the plateau.</b> The pin resistance is 25–50 Ω and a logic-level plateau sits near 2.5–3 V. Only a few hundred mV are left between drive and plateau.')}</p>
      ${App.example({
        given: [['Q<sub>gd</sub>', '10 nC'], ['V<sub>plateau</sub>', L('2,9 V', '2.9 V')]],
        steps: [
          [L('GPIO gate akımı', 'GPIO gate current'), L('(3,3 − 2,9) V / 40 Ω', '(3.3 − 2.9) V / 40 Ω'), '10 mA'],
          [L('GPIO plato süresi', 'GPIO plateau time'), '10 nC / 10 mA', '1 µs'],
          [L('12 V sürücü, 4 Ω', '12 V driver, 4 Ω'), L('(12 − 2,9) V / 4 Ω', '(12 − 2.9) V / 4 Ω'), L('2,3 A', '2.3 A')],
          [L('Sürücü plato süresi', 'Driver plateau time'), L('10 nC / 2,3 A', '10 nC / 2.3 A'), L('4,4 ns', '4.4 ns')]
        ],
        result: L('<b>Gate sürücü 200 kattan fazla hızlı.</b> Fark, plato boyunca gate’e giden akımdan gelir.', '<b>The gate driver is over 200 times faster.</b> The difference is the current into the gate on the plateau.'),
        level: 'warn'
      })}
      <div class="call bad"><strong>${L('Plato sürücü gerilimine yaklaşırsa anahtar takılır', 'If the plateau approaches the drive voltage, the switch stalls')}</strong>
        ${L('3,1 V platoyu 3,3 V ile sürersen gate akımı yalnız 0,2 V/R<sub>G</sub> olur ve plato milisaniyeler sürebilir. Plato sürücünün üstündeyse MOSFET <b>hiç</b> tam açılmaz, lineer bölgede yanar. Simülatörde “3,3 V takılma” ön ayarını dene.',
            'Drive a 3.1 V plateau from 3.3 V and the gate current is just 0.2 V/R<sub>G</sub>; the plateau can last milliseconds. If the plateau is above the drive, the MOSFET <b>never</b> fully turns on and burns in the linear region. Try the “3.3 V stall” preset in the simulator.')}</div>

      <h2>${L('Miller etkisi: düşen drain gate’i aşağı çeker', 'The Miller effect: a falling drain pulls the gate down')}</h2>
      <p>${L('<b>C<sub>gd</sub>, gate’ten bakınca olduğundan çok daha büyük görünür.</b> Plato sırasında gate neredeyse sabitken drain V<sub>DD</sub>’den 0’a iner.', '<b>From the gate, C<sub>gd</sub> looks much bigger than it is.</b> On the plateau the gate is almost still while the drain drops from V<sub>DD</sub> to 0.')}</p>
      <p>${L('C<sub>gd</sub> üzerindeki gerilim V<sub>DD</sub> kadar değişir ve bu yük gate düğümünden gelmek zorundadır. Etkin kapasitans (1 + |A<sub>v</sub>|) kat büyür: Miller çarpanı.', 'The voltage across C<sub>gd</sub> changes by V<sub>DD</sub>, and that charge must come from the gate node. The effective capacitance grows (1 + |A<sub>v</sub>|) times: the Miller multiplication.')}</p>
      ${App.figure('fig-miller', L('Miller platosunda gate akımı nereye gidiyor?', 'Where does the gate current go on the Miller plateau?'), {
        foot: L('Mavi: gate akımı. Bakır: drain akımı. Açılışta plato boyunca sürücü akımının tamamı C<sub>gd</sub>’ye akar, V<sub>GS</sub> sabit kalır. Kapanışta aynı akım ters yönde akar.',
                'Blue: gate current. Copper: drain current. At turn-on, during the plateau all the driver current flows into C<sub>gd</sub> and V<sub>GS</sub> stays flat. At turn-off the same current flows the other way.')
      })}

      <h2>${L('Ne kadar gate akımı, ne kadar güç?', 'How much gate current, how much power?')}</h2>
      <p>${L('<b>Gate sürücüyü istediğin geçiş süresinden geriye doğru boyutlandır.</b> Her açılış Q<sub>g</sub> yükü verir, her kapanış onu toprağa boşaltır. Bu enerji sürücüde ve R<sub>G</sub>’de ısıya döner.', '<b>Size the gate driver backwards from the transition time you want.</b> Every turn-on delivers Q<sub>g</sub>, every turn-off dumps it to ground. That energy becomes heat in the driver and R<sub>G</sub>.')}</p>
      <div class="eq">I<sub>G(${L('tepe', 'peak')})</sub> ≈ <b>Q<sub>g</sub> / t<sub>${L('istenen', 'target')}</sub></b> &nbsp;&nbsp;&nbsp; P<sub>gate</sub> = <b>Q<sub>g</sub> · V<sub>drv</sub> · f<sub>sw</sub></b></div>
      ${App.example({
        given: [['Q<sub>g</sub>', '40 nC'], [L('Hedef', 'Target'), '50 ns'], ['V<sub>drv</sub>', '12 V'], ['f<sub>sw</sub>', '100 kHz']],
        steps: [
          [L('Tepe gate akımı', 'Peak gate current'), '40 nC / 50 ns', L('0,8 A', '0.8 A')],
          [L('Gate gücü', 'Gate power'), '40 nC · 12 V · 100 kHz', '48 mW'],
          [L('Sürücü ortalama akımı', 'Driver average current'), '40 nC · 100 kHz', '4 mA']
        ],
        result: L('<b>0,8 A tepe verebilen bir sürücü seç.</b> 48 mW MOSFET’te değil, sürücü ve gate dirençlerinde harcanır.', '<b>Pick a driver that can source 0.8 A peak.</b> The 48 mW is burned in the driver and gate resistors, not the MOSFET.'),
        level: 'ok'
      })}
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Kayıp', 'Loss')}</th><th>${L('Formül', 'Formula')}</th><th>${L('Frekansla', 'With frequency')}</th><th>${L('Nasıl azalır', 'How to reduce it')}</th></tr></thead>
        <tbody>
          <tr><td class="cu">${L('İletim', 'Conduction')}</td><td>I<sup>2</sup>·R<sub>DS(on)</sub>·D</td><td>${L('sabit', 'flat')}</td><td>${L('Düşük R<sub>DS(on)</sub>, tam V<sub>GS</sub>, soğuk tutmak', 'Lower R<sub>DS(on)</sub>, full V<sub>GS</sub>, keep it cool')}</td></tr>
          <tr><td>${L('Anahtarlama', 'Switching')}</td><td>½·V·I·(t<sub>r</sub>+t<sub>f</sub>)·f</td><td>${L('doğrusal artar', 'rises linearly')}</td><td>${L('Daha güçlü gate sürücü, küçük Q<sub>gd</sub>', 'Stronger gate driver, smaller Q<sub>gd</sub>')}</td></tr>
          <tr><td>C<sub>oss</sub></td><td>½·C<sub>oss</sub>·V<sup>2</sup>·f</td><td>${L('doğrusal artar', 'rises linearly')}</td><td>${L('Düşük gerilimde küçük; yüksek gerilimde önemli', 'Small at low voltage; matters at high voltage')}</td></tr>
          <tr><td class="sig">Gate</td><td>Q<sub>g</sub>·V<sub>drv</sub>·f</td><td>${L('doğrusal artar', 'rises linearly')}</td><td>${L('Küçük Q<sub>g</sub>; sürücüde harcanır', 'Smaller Q<sub>g</sub>; burned in the driver')}</td></tr>
        </tbody></table></div>
      <div class="call warn"><strong>${L('R<sub>DS(on)</sub> ile Q<sub>g</sub> arasında takas', 'The R<sub>DS(on)</sub> vs Q<sub>g</sub> trade-off')}</strong>
        ${L('R<sub>DS(on)</sub>’ı yarıya indirmek kanalı iki kat genişletir; Q<sub>g</sub> de kabaca iki katına çıkar. Yüksek frekansta “en düşük R<sub>DS(on)</sub>” en iyi seçim değildir. R<sub>DS(on)</sub>·Q<sub>g</sub> çarpımını karşılaştır.',
            'Halving R<sub>DS(on)</sub> doubles the channel width, and roughly doubles Q<sub>g</sub> too. At high frequency “lowest R<sub>DS(on)</sub>” is not the best pick. Compare the R<sub>DS(on)</sub>·Q<sub>g</sub> product.')}</div>

      ${App.lab('lab-loss', L('Kayıplar ve anahtarlama frekansı', 'Losses vs switching frequency'), {
        foot: L('Sert anahtarlama, endüktif yük, R<sub>DS(on)</sub> sabit (sıcakta ~1,5×), 10 V gate, C<sub>oss</sub> ihmal. ΔT: soğutucusuz TO-220, 62 °C/W; gate gücü dahil değil. Yeşil: anahtarlama kaybı iletimden küçük.',
                'Hard switching, inductive load, constant R<sub>DS(on)</sub> (~1.5× when hot), 10 V gate, C<sub>oss</sub> ignored. ΔT: TO-220 without heatsink, 62 °C/W; gate power excluded. Green: switching loss below conduction loss.')
      })}

      <h2>${L('dV/dt ile istenmeyen iletim (parazitik açılma)', 'dV/dt-induced turn-on (parasitic turn-on)')}</h2>
      <p>${L('<b>Hızlı bir drain kenarı, kapalı MOSFET’i bir anlığına açabilir.</b> Yarım köprüde üst MOSFET açılınca switch düğümü nanosaniyeler içinde V<sub>DD</sub>’ye fırlar. Bu düğüm alt MOSFET’in drain’idir.', '<b>A fast drain edge can briefly turn on an off MOSFET.</b> In a half-bridge, when the high-side turns on, the switch node jumps to V<sub>DD</sub> in nanoseconds. That node is the low-side drain.')}</p>
      <ul>
        <li>${L('C<sub>gd</sub>, alt MOSFET’in gate’ine C<sub>gd</sub>·dV/dt akımı basar.', 'C<sub>gd</sub> injects a current C<sub>gd</sub>·dV/dt into the low-side gate.')}</li>
        <li>${L('Bu akım kapatma yolunda (R<sub>G(off)</sub>) gerilim oluşturur.', 'That current builds a voltage across the turn-off path (R<sub>G(off)</sub>).')}</li>
        <li>${L('V<sub>GS</sub> bir anlığına V<sub>th</sub>’yi geçerse iki MOSFET birlikte açılır: shoot-through.', 'If V<sub>GS</sub> briefly crosses V<sub>th</sub>, both MOSFETs conduct: shoot-through.')}</li>
      </ul>
      <div class="eq">V<sub>GS(${L('tepe', 'peak')})</sub> ≈ R<sub>G(off)</sub> · C<sub>gd</sub> · (dV/dt) · (1 − e<sup>−t<sub>r</sub>/τ</sup>), &nbsp; τ = R<sub>G(off)</sub>·(C<sub>gs</sub>+C<sub>gd</sub>) &nbsp;&nbsp; ≤ &nbsp; <b>V<sub>DD</sub> · C<sub>gd</sub>/(C<sub>gd</sub>+C<sub>gs</sub>)</b>
        <span class="note">${L('Üst sınır, gate tamamen boştayken kapasitif bölücüdür. Kapatma yolu ne kadar düşük empedanslıysa basılan akım o kadar zararsız boşalır.',
                               'The upper bound is the capacitive divider with the gate floating. The lower the turn-off path impedance, the more harmlessly the injected current drains.')}</span></div>
      ${App.lab('lab-dvdt', L('Alt MOSFET’in gate’ine basılan gerilim', 'Voltage injected into the low-side gate'), {
        foot: L('Birinci dereceden model: switch düğümü doğrusal yükselir, gate R<sub>G(off)</sub> ∥ (C<sub>gs</sub>+C<sub>gd</sub>). Miller clamp’te etkin direnç 2 Ω. Gate döngüsü endüktansı ihmal; gerçekte durumu kötüleştirir. V<sub>th</sub> sıcakta düşer: sıcak MOSFET varsay.',
                'First-order model: the switch node ramps linearly; the gate is R<sub>G(off)</sub> ∥ (C<sub>gs</sub>+C<sub>gd</sub>). Miller clamp uses 2 Ω effective. Gate-loop inductance ignored; in reality it makes things worse. V<sub>th</sub> falls when hot: assume a hot MOSFET.')
      })}
      <p>${L('Dört çözüm:', 'Four remedies:')}</p>
      <div class="cards">
        <div class="card"><h4>${L('Düşük empedanslı kapatma yolu', 'Low-impedance turn-off path')}</h4><p>${L('Kapatma direncini küçük tut: ayrı R<sub>on</sub>/R<sub>off</sub> + diyot (Bölüm 10). Sürücüyü gate’e yakın koy.', 'Keep the turn-off resistance small: separate R<sub>on</sub>/R<sub>off</sub> with a diode (chapter 10). Put the driver close to the gate.')}</p></div>
        <div class="card"><h4>${L('Negatif gate gerilimi', 'Negative gate bias')}</h4><p>${L('Kapalıyken −3…−5 V, V<sub>th</sub>’ye olan payı büyütür. SiC ve IGBT’de standart; Si MOSFET’in negatif V<sub>GS</sub> sınırına bak.', 'Holding −3…−5 V while off widens the margin to V<sub>th</sub>. Standard for SiC and IGBT; check the Si MOSFET’s negative V<sub>GS</sub> rating.')}</p></div>
        <div class="card"><h4>${L('Miller clamp', 'Miller clamp')}</h4><p>${L('Gate ~2 V’un altına inince sürücü içindeki ayrı bir transistör gate’i source’a kısa devre eder. UCC5350, Si8271 gibi sürücülerde bulunur.', 'Below ~2 V, a separate transistor inside the driver shorts gate to source. Found in drivers such as UCC5350 and Si8271.')}</p></div>
        <div class="card"><h4>${L('Düşük C<sub>rss</sub>/C<sub>iss</sub> oranı', 'Low C<sub>rss</sub>/C<sub>iss</sub> ratio')}</h4><p>${L('Gate–source arasına küçük bir kondansatör bölücüyü iyileştirir ama açılışı yavaşlatır. Yüksek V<sub>th</sub>’li MOSFET de daha toleranslıdır.', 'A small gate–source capacitor improves the divider but slows turn-on. A higher-V<sub>th</sub> MOSFET is also more tolerant.')}</p></div>
      </div>

      <h2>${L('BJT: neden geç kapanır?', 'BJT: why is it slow to turn off?')}</h2>
      <p>${L('<b>Doyumdaki BJT, base sürücüsü kesildikten sonra da bir süre iletmeye devam eder.</b> Base’i bilerek fazla sürdük (β<sub>forced</sub> ≈ 10), bu yüzden base fazla yükle doludur.', '<b>A saturated BJT keeps conducting for a while after the base drive is removed.</b> We over-drove the base on purpose (β<sub>forced</sub> ≈ 10), so it is full of excess charge.')}</p>
      <p>${L('Bu yük boşalana kadar I<sub>C</sub> hiç değişmez. Bu süreye <b>depolama zamanı t<sub>s</sub></b> denir: küçük BJT’lerde yüzlerce ns, güç BJT’lerinde mikrosaniyeler.', 'Until that charge is gone, I<sub>C</sub> does not change at all. This is the <b>storage time t<sub>s</sub></b>: hundreds of ns in small BJTs, microseconds in power BJTs.')}</p>
      <div class="eq">t<sub>s</sub> ≈ τ<sub>s</sub> · ln[ (I<sub>B1</sub> − I<sub>B2</sub>) / (I<sub>C</sub>/β − I<sub>B2</sub>) ]
        <span class="note">${L('I<sub>B1</sub>: açıkken base akımı. I<sub>B2</sub>: kapanışta base’den çekilen negatif akım. Fazla sürme t<sub>s</sub>’yi uzatır, güçlü ters akım kısaltır.',
                               'I<sub>B1</sub>: base current while on. I<sub>B2</sub>: negative current pulled out at turn-off. Overdrive lengthens t<sub>s</sub>; a strong reverse current shortens it.')}</span></div>
      <div class="cards">
        <div class="card"><h4>${L('Hızlandırma kondansatörü', 'Speed-up capacitor')}</h4><p>${L('R<sub>B</sub>’ye paralel 100 pF–1 nF. Kenar anında R<sub>B</sub>’yi kısa devre eder. Kapanışta base’den büyük bir negatif darbe çekip depolanan yükü süpürür.', '100 pF–1 nF across R<sub>B</sub>. At each edge it shorts R<sub>B</sub>. At turn-off it pulls a large negative pulse out of the base and sweeps out the stored charge.')}</p></div>
        <div class="card"><h4>${L('Baker clamp', 'Baker clamp')}</h4><p>${L('Base’den collector’a Schottky diyot, anot base’te. Fazla base akımını collector’a saptırır; transistör derin doyuma girmez. Bedeli: daha yüksek V<sub>CE(on)</sub>, ≈ 0,3–0,4 V.', 'A Schottky from base to collector, anode on the base. It steers excess base current into the collector, so the transistor never saturates deeply. Cost: a higher V<sub>CE(on)</sub>, ≈ 0.3–0.4 V.')}</p></div>
      </div>
      ${App.lab('lab-bjt', L('BJT kapanışı: depolama zamanı, hızlandırma kondansatörü, Baker clamp', 'BJT turn-off: storage time, speed-up capacitor, Baker clamp'), {
        foot: L('Nitel model: I<sub>C</sub> = 100 mA, β = 100, τ<sub>s</sub> = 250 ns, τ<sub>β</sub> = 50 ns; 3,3 V GPIO, ~50 Ω. Hızlandırma kondansatörü bir I<sub>B2</sub> darbesi, Baker clamp V<sub>F</sub> ≈ 0,4 V Schottky. Soluk eğri: hızlandırma yokken I<sub>C</sub>.',
                'Qualitative model: I<sub>C</sub> = 100 mA, β = 100, τ<sub>s</sub> = 250 ns, τ<sub>β</sub> = 50 ns; 3.3 V GPIO, ~50 Ω. Speed-up capacitor as an I<sub>B2</sub> pulse, Baker clamp as a V<sub>F</sub> ≈ 0.4 V Schottky. Faint curve: I<sub>C</sub> with no speed-up.')
      })}

      <h2>${L('Çözümlü örnek', 'Worked example')}</h2>
      <details class="fold"><summary>${L('24 V, 5 A, 20 kHz PWM: GPIO mu, gate sürücü mü?', '24 V, 5 A, 20 kHz PWM: GPIO or gate driver?')}</summary><div>
        <p>${L('Aynı MOSFET’i iki şekilde sürüp kayıpları karşılaştırıyoruz. MOSFET: Q<sub>g</sub> = 40 nC, Q<sub>gd</sub> = 15 nC, R<sub>DS(on)</sub> = 15 mΩ (4,5 V’ta), 5 A’de plato 3,0 V.', 'We drive the same MOSFET two ways and compare losses. MOSFET: Q<sub>g</sub> = 40 nC, Q<sub>gd</sub> = 15 nC, R<sub>DS(on)</sub> = 15 mΩ (at 4.5 V), plateau 3.0 V at 5 A.')}</p>
        <h3>${L('1. Doğrudan 3,3 V GPIO, 40 Ω', '1. Straight from a 3.3 V GPIO, 40 Ω')}</h3>
        ${App.example({
          given: [['V', '24 V'], ['I', '5 A'], ['f', '20 kHz'], ['D', L('%50', '50 %')]],
          steps: [
            [L('Açılış gate akımı', 'Turn-on gate current'), L('(3,3 − 3,0) / 40', '(3.3 − 3.0) / 40'), L('7,5 mA', '7.5 mA')],
            [L('V<sub>DS</sub> düşüşü', 'V<sub>DS</sub> fall'), L('15 nC / 7,5 mA', '15 nC / 7.5 mA'), '2 µs'],
            [L('Kapanış gate akımı', 'Turn-off gate current'), L('3,0 / 40', '3.0 / 40'), '75 mA'],
            [L('V<sub>DS</sub> yükselişi', 'V<sub>DS</sub> rise'), '15 nC / 75 mA', L('0,2 µs', '0.2 µs')],
            [L('Periyot başı enerji', 'Energy per period'), L('½ · 24 · 5 · 2,2 µs', '½ · 24 · 5 · 2.2 µs'), '132 µJ', L('Akım geçişleri hariç', 'Current transitions excluded')],
            [L('Anahtarlama kaybı', 'Switching loss'), '132 µJ · 20 kHz', L('2,6 W', '2.6 W')],
            [L('İletim kaybı', 'Conduction loss'), L('5² · 0,015 · 0,5', '5² · 0.015 · 0.5'), L('0,19 W', '0.19 W'), L('3,3 V’ta R<sub>DS(on)</sub> daha da yüksek', 'R<sub>DS(on)</sub> is even higher at 3.3 V')],
            [L('Sıcaklık artışı', 'Temperature rise'), L('2,8 W · 62 °C/W', '2.8 W · 62 °C/W'), '≈ 174 °C', L('Soğutucusuz TO-220', 'TO-220 without heatsink')]
          ],
          result: L('<b>Olmaz: MOSFET yanar.</b> Anahtarlama kaybı iletim kaybının 14 katı.', '<b>No: the MOSFET burns.</b> Switching loss is 14× the conduction loss.'),
          level: 'bad'
        })}
        <h3>${L('2. 12 V gate sürücü, toplam 5 Ω', '2. 12 V gate driver, 5 Ω total')}</h3>
        ${App.example({
          steps: [
            [L('Açılış gate akımı', 'Turn-on gate current'), '(12 − 3) / 5', L('1,8 A', '1.8 A')],
            [L('V<sub>DS</sub> düşüşü', 'V<sub>DS</sub> fall'), L('15 nC / 1,8 A', '15 nC / 1.8 A'), L('8,3 ns', '8.3 ns')],
            [L('Kapanış gate akımı', 'Turn-off gate current'), '3 / 5', L('0,6 A', '0.6 A')],
            [L('V<sub>DS</sub> yükselişi', 'V<sub>DS</sub> rise'), L('15 nC / 0,6 A', '15 nC / 0.6 A'), '25 ns'],
            [L('Anahtarlama kaybı', 'Switching loss'), '½ · 24 · 5 · 33 ns · 20 kHz', '40 mW'],
            [L('Gate gücü', 'Gate power'), '40 nC · 12 V · 20 kHz', '10 mW', L('Sürücüde harcanır', 'Burned in the driver')],
            [L('Toplam MOSFET kaybı', 'Total MOSFET loss'), L('0,19 + 0,04', '0.19 + 0.04'), L('0,23 W', '0.23 W')],
            [L('Sıcaklık artışı', 'Temperature rise'), L('0,23 W · 62 °C/W', '0.23 W · 62 °C/W'), '≈ 14 °C']
          ],
          result: L('<b>Gate sürücü ile soğutucu bile gerekmez.</b> Birkaç on centlik sürücü, soğutucu ve güvenilirlik kazandırır.', '<b>With a gate driver, no heatsink is needed.</b> A driver costing a few tens of cents saves a heatsink and buys reliability.'),
          level: 'ok'
        })}
      </div></details>
      <div class="call tip"><strong>${L('Kural', 'Rule of thumb')}</strong>
        ${L('Şu durumlardan biri varsa gate sürücü kullan: PWM birkaç kHz’in üstünde, akım birkaç amperden fazla ya da plato sürücü geriliminin yarısından yüksek. Bir sonraki bölüm sürücü seçimini anlatıyor.',
            'Use a gate driver if any of these hold: PWM above a few kHz, more than a few amps, or a plateau above half the drive voltage. The next chapter covers choosing a driver.')}</div>`;
    },

    mount(root, App) {
      const { Viz } = App, { Sch, UI } = Viz, L = App.L;
      const fmtT = v => isFinite(v) ? App.si(v, 's', 3) : '∞';
      const timeUnit = T => T < 1.5e-6 ? [1e-9, 'ns'] : T < 1.5e-3 ? [1e-6, 'µs'] : [1e-3, 'ms'];

      /* ---------------- Figure: capacitances vs V_DS ---------------- */
      {
        const fig = root.querySelector('#fig-caps .lab-fig');
        const Cgs = 1.8e-9;
        const Cgd = v => 40e-12 + 1100e-12 / (1 + v / 1.5);
        const Cds = v => 1600e-12 / Math.sqrt(1 + v / 0.8);
        const p = new Viz.Plot(fig, {
          w: 600, h: 300, x: [0, 60], y: [10e-12, 10e-9], logY: true,
          xLabel: 'V_DS (V)', yLabel: L('kapasitans (F)', 'capacitance (F)'),
          xFmt: v => App.num(v, 0), yFmt: v => App.si(v, 'F', 2)
        });
        p.line('iss', Viz.sample(v => Cgs + Cgd(v), 0, 60, 120), 'sig');
        p.line('oss', Viz.sample(v => Cds(v) + Cgd(v), 0, 60, 120), 'cu');
        p.line('rss', Viz.sample(Cgd, 0, 60, 120), '');
        p.text('tiss', 59, Cgs + Cgd(60), 'C_iss', 'sig', 'end', 0, -8);
        p.text('toss', 59, Cds(60) + Cgd(60), 'C_oss', 'cu', 'end', 0, -8);
        p.text('trss', 59, Cgd(60), 'C_rss = C_gd', '', 'end', 0, -8);
        p.vline('cur', 0, 'solid');
        const lbl = p.text('val', 30, 7e-9, '', 'muted', 'middle');
        let t = 0;
        App.onFrame(dt => {
          t += App.reducedMotion ? 0 : dt;
          const v = App.reducedMotion ? 25 : 30 - 29 * Math.cos(t * 0.5);
          p.vline('cur', v, 'solid');
          p.dot('d1', v, Cgs + Cgd(v), 'sig', 4);
          p.dot('d2', v, Cds(v) + Cgd(v), '', 4);
          p.dot('d3', v, Cgd(v), 'sig', 3.5);
          lbl.textContent = 'V_DS = ' + App.num(v, 1) + ' V   C_rss = ' + App.si(Cgd(v), 'F', 2) + '   C_oss = ' + App.si(Cds(v) + Cgd(v), 'F', 2);
        });
      }

      /* ---------------- Lab: gate-charge switching simulator ---------------- */
      {
        const lab = root.querySelector('#lab-gate');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        // small schematic: driver → R_G → NMOS with inductive load and freewheel diode
        const svg = Viz.schematic(fig, 600, 200, `
          ${Sch.box(20, 95, 90, 50, L('Sürücü', 'Driver'), 'V_drv')}
          ${Sch.w([[110, 120], [150, 120]], 'sigw')}
          ${Sch.res(180, 120, 90, 'R_G')}
          ${Sch.w([[210, 120], [290, 120]], 'sigw')}
          ${Sch.nmos(320, 120, 'Q1')}
          ${Sch.vcc(340, 30, 'V_DD')}
          ${Sch.ind(340, 60, 0, 'L')}
          ${Sch.w([[340, 90], [340, 90]])}
          ${Sch.diode(420, 60, 180, '')}
          ${Sch.w([[340, 30], [420, 30]])}${Sch.dot(340, 30)}
          ${Sch.w([[420, 90], [420, 90], [340, 90]])}${Sch.dot(340, 90)}
          ${Sch.w([[340, 150], [340, 170]])}${Sch.gnd(340, 170)}
          <text x="434" y="64" class="sch-t">D</text>
          <text id="gsVgs" x="216" y="106" class="sch-t sig"></text>
          <text id="gsIg" x="216" y="142" class="sch-t sig"></text>
          <text id="gsVds" x="460" y="120" class="sch-t"></text>
          <text id="gsId" x="460" y="140" class="sch-t cu"></text>
          <text id="gsPh" x="460" y="165" class="sch-t big"></text>
        `);
        const fGate = new Viz.Flow(svg, 'M110,120H290', { cls: 'flow e', spacing: 13, speed: 90 });
        const fFet = new Viz.Flow(svg, 'M340,30V170', { spacing: 14 });
        const fDio = new Viz.Flow(svg, 'M340,34V90H420V30H340', { spacing: 14 });

        const boxA = App.h('div'), boxB = App.h('div');
        const grid = App.h('div', { class: 'two' }); grid.append(boxA, boxB); fig.appendChild(grid);
        const pA = new Viz.Plot(boxA, { w: 420, h: 250, x: [0, 1], y: [0, 13], xLabel: 'ns', yLabel: 'V_GS (V)', yFmt: v => App.num(v, 0), yTicks: [0, 3, 6, 9, 12] });
        const pB = new Viz.Plot(boxB, { w: 420, h: 250, x: [0, 1], y: [0, 1.2], xLabel: 'ns', yLabel: 'V_DS, I_D (%)', yTicks: [0, 0.5, 1], yFmt: v => Math.round(v * 100) + '%' });
        const status = App.h('div', { class: 'status ok' }); fig.appendChild(status);

        const presets = App.h('div', { class: 'kbd-row' }); ctl.appendChild(presets);
        const sV = UI.slider(ctl, { label: L('Sürücü gerilimi V<sub>drv</sub>', 'Drive voltage V<sub>drv</sub>'), min: 3.3, max: 12, step: 0.1, value: 10, fmt: v => App.num(v, 1) + ' V', onInput: update });
        const sR = UI.slider(ctl, { label: L('Toplam R<sub>G</sub> (sürücü dahil)', 'Total R<sub>G</sub> (incl. driver)'), min: 0.5, max: 100, step: 0.5, value: 10, log: true, fmt: v => App.num(v, 1) + ' Ω', onInput: update });
        const sQgs = UI.slider(ctl, { label: 'Q<sub>gs</sub>', min: 1e-9, max: 30e-9, step: 0.5e-9, value: 6e-9, unit: 'C', onInput: update });
        const sQgd = UI.slider(ctl, { label: 'Q<sub>gd</sub> (Miller)', min: 1e-9, max: 40e-9, step: 0.5e-9, value: 10e-9, unit: 'C', onInput: update });
        const sQg = UI.slider(ctl, { label: L('Q<sub>g</sub> toplam (10 V’ta)', 'Q<sub>g</sub> total (at 10 V)'), min: 5e-9, max: 120e-9, step: 1e-9, value: 30e-9, unit: 'C', onInput: update });
        const sVth = UI.slider(ctl, { label: 'V<sub>th</sub>', min: 0.8, max: 4, step: 0.05, value: 2.5, fmt: v => App.num(v, 2) + ' V', onInput: update });
        const sVpl = UI.slider(ctl, { label: L('Plato V<sub>plateau</sub>', 'Plateau V<sub>plateau</sub>'), min: 1.2, max: 6.5, step: 0.05, value: 4.5, fmt: v => App.num(v, 2) + ' V', onInput: update });
        const sIL = UI.slider(ctl, { label: L('Yük akımı I<sub>L</sub>', 'Load current I<sub>L</sub>'), min: 0.5, max: 30, step: 0.5, value: 10, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const sVdd = UI.slider(ctl, { label: 'V<sub>DD</sub>', min: 5, max: 60, step: 1, value: 24, fmt: v => App.num(v, 0) + ' V', onInput: update });
        const mode = UI.segmented(ctl, { label: L('Olay', 'Event'), options: [{ value: 'on', label: L('Açılış', 'Turn-on') }, { value: 'off', label: L('Kapanış', 'Turn-off') }], value: 'on', onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'td', label: L('Gecikme t<sub>d</sub>', 'Delay t<sub>d</sub>') },
          { key: 'ti', label: L('Akım geçişi t<sub>i</sub>', 'Current transition t<sub>i</sub>') },
          { key: 'tv', label: L('Gerilim geçişi t<sub>v</sub> (plato)', 'Voltage transition t<sub>v</sub> (plateau)') },
          { key: 'tsw', label: L('Anahtarlama süresi t<sub>i</sub>+t<sub>v</sub>', 'Switching time t<sub>i</sub>+t<sub>v</sub>') },
          { key: 'ig', label: L('Platoda I<sub>G</sub>', 'I<sub>G</sub> on plateau') },
          { key: 'e', label: L('Enerji E = ∫V<sub>DS</sub>·I<sub>D</sub>dt', 'Energy E = ∫V<sub>DS</sub>·I<sub>D</sub>dt') },
          { key: 'p', label: L('P<sub>sw</sub> @ 100 kHz', 'P<sub>sw</sub> @ 100 kHz') }
        ]);
        const preset = (name, v) => UI.button(presets, { label: name, onClick: () => {
          const all = [[sV, 'v'], [sR, 'r'], [sQgs, 'qgs'], [sQgd, 'qgd'], [sQg, 'qg'], [sVth, 'vth'], [sVpl, 'vpl'], [sIL, 'il'], [sVdd, 'vdd']];
          all.forEach(([s, k]) => { if (v[k] != null) s.set(v[k], true); });
          update();
        } });
        preset(L('12 V sürücü', '12 V driver'), { v: 12, r: 4, qgs: 6e-9, qgd: 10e-9, qg: 30e-9, vth: 2.5, vpl: 4.5, il: 10, vdd: 24 });
        preset(L('3,3 V GPIO', '3.3 V GPIO'), { v: 3.3, r: 40, qgs: 5e-9, qgd: 10e-9, qg: 30e-9, vth: 1.6, vpl: 2.9, il: 5, vdd: 24 });
        preset(L('3,3 V takılma', '3.3 V stall'), { v: 3.3, r: 40, qgs: 5e-9, qgd: 10e-9, qg: 30e-9, vth: 1.9, vpl: 3.2, il: 10, vdd: 24 });

        let M = null, U = [1e-9, 'ns'], pre = 0, tc = 0;
        const igMaxRef = () => Math.max(1e-6, Math.abs(sV.value) / sR.value);
        function update() {
          const prm = { vdrv: sV.value, rg: sR.value, qgs: sQgs.value, qgd: sQgd.value, qg: Math.max(sQg.value, sQgs.value + sQgd.value + 1e-9), vth: sVth.value, vpl: sVpl.value, il: sIL.value, vdd: sVdd.value };
          M = gateModel(prm, mode.value);
          M.p = prm;
          U = timeUnit(M.T);
          pre = 0.06 * M.T;
          const x0 = -pre / U[0], x1 = M.T / U[0];
          [pA, pB].forEach(p => { p.o.xLabel = L('zaman', 'time') + ' (' + U[1] + ')'; p.o.xFmt = v => App.num(v, Math.abs(x1 - x0) < 5 ? 1 : 0); p.setRange({ x: [x0, x1] }); });
          const N = 400, pts = [];
          for (let i = 0; i <= N; i++) { const t = -pre + (M.T + pre) * i / N; pts.push([t, M.f(t)]); }
          pA.line('vgs', pts.map(([t, s]) => [t / U[0], s.vgs]), 'sig');
          pA.hline('vth', M.vth, '');
          pA.hline('vpl', M.vpl, 'sig');
          pA.text('tvth', x1, M.vth, 'V_th', 'muted', 'end', -4, 13);
          pA.text('tvpl', x0, M.vpl, 'V_plateau', 'sig', 'start', 4, -5);
          pB.line('vds', pts.map(([t, s]) => [t / U[0], s.vds / prm.vdd]), '');
          pB.line('id', pts.map(([t, s]) => [t / U[0], s.id / prm.il]), 'cu');
          pB.area('pw', pts.map(([t, s]) => [t / U[0], s.vds * s.id / (prm.vdd * prm.il)]), 'bad');
          pB.text('lvds', x0, 1.08, 'V_DS', '', 'start', 4, 0);
          pB.text('lid', x0 + (x1 - x0) * 0.16, 1.08, 'I_D', 'cu', 'start', 4, 0);
          pB.text('lpw', x0 + (x1 - x0) * 0.3, 1.08, 'P = V_DS·I_D', 'bad', 'start', 4, 0);
          const names = mode.value === 'on'
            ? [['t1', ''], ['t2', 'cu'], ['t3', 'warn'], ['t4', 'ok']]
            : [['t1', 'ok'], ['t2', 'warn'], ['t3', 'cu'], ['t4', '']];
          for (let i = 0; i < 4; i++) {
            const show = !!M.b;
            pA.hide('r' + i, !show); pA.hide('rt' + i, !show); pB.hide('bv' + i, !show);
            if (!show) continue;
            const a = M.b[i] / U[0], b = M.b[i + 1] / U[0];
            pA.rect('r' + i, a, 0, b, 13, names[i][1]);
            pA.text('rt' + i, (a + b) / 2, 12.2, names[i][0], 'muted', 'middle');
            pB.vline('bv' + i, a, '');
          }
          // readouts
          const ok = M.status === 'ok';
          ro.set('td', fmtT(M.tD));
          ro.set('ti', ok ? fmtT(M.tI) : '—');
          ro.set('tv', ok ? fmtT(M.tV) : '∞', ok ? (M.tV > 1e-6 ? 'bad' : M.tV > 100e-9 ? 'warn' : 'ok') : 'bad');
          ro.set('tsw', ok ? fmtT(M.tI + M.tV) : '∞', ok ? '' : 'bad');
          ro.set('ig', ok ? App.si(M.igPl, 'A') : (mode.value === 'on' ? App.si(Math.max(0, prm.vdrv - M.vpl) / prm.rg, 'A') : '—'), ok && M.igPl < 0.05 ? 'warn' : '');
          ro.set('e', ok ? App.si(M.E, 'J') : '—');
          const P = M.E * 1e5;
          ro.set('p', ok ? App.si(P, 'W') : '—', ok ? (P > 2 ? 'bad' : P > 0.5 ? 'warn' : 'ok') : '');
          if (M.status === 'none') {
            status.className = 'status bad';
            status.textContent = L('V_drv ≤ V_th: MOSFET hiç açılmıyor.', 'V_drv ≤ V_th: the MOSFET never turns on.');
          } else if (M.status === 'stall') {
            status.className = 'status bad';
            status.textContent = L('V_drv ≤ V_plateau: MOSFET platoya ulaşamıyor ve lineer bölgede kalıyor. ', 'V_drv ≤ V_plateau: the MOSFET cannot reach the plateau and stays in linear mode. ') +
              L('Taşıdığı akım ≈ ', 'It carries ≈ ') + App.si(M.idStall, 'A') + L(' ve V_DS = V_DD iken P ≈ ', ' at V_DS = V_DD, so P ≈ ') + App.si(M.idStall * prm.vdd, 'W') + L(' sürekli ısı!', ' of continuous heat!');
          } else if (M.status === 'noton') {
            status.className = 'status bad';
            status.textContent = L('V_drv plato geriliminin altında: MOSFET zaten tam açık değildi.', 'V_drv is below the plateau: the MOSFET was never fully on.');
          } else if (M.tV > 1e-6) {
            status.className = 'status warn';
            status.textContent = L('Plato çok uzun: gate akımı az. Plato sırasında MOSFET hem akım hem gerilim taşır.', 'Plateau is very long: too little gate current. During the plateau the MOSFET carries both current and voltage.');
          } else {
            status.className = 'status ok';
            status.textContent = L('Gate akımı plato boyunca ', 'Gate current on the plateau ') + App.si(M.igPl, 'A') + ' → t_v = Q_gd / I_G = ' + fmtT(M.tV);
          }
          tc = 0;
        }
        update();

        const period = 3.6, hold = 0.9;
        App.onFrame(dt => {
          if (!M) return;
          tc += dt;
          const ph = App.reducedMotion ? 1 : Math.min(1, (tc % (period + hold)) / period);
          const t = -pre + (M.T + pre) * ph;
          const s = M.f(t), x = t / U[0];
          pA.vline('cur', x, 'sig solid'); pB.vline('cur', x, 'sig solid');
          pA.dot('dg', x, s.vgs, 'sig', 4);
          pB.dot('di', x, s.id / M.p.il, '', 4);
          const k = Math.max(0, Math.min(M.cum.length - 1, Math.round(t / M.T * (M.cum.length - 1))));
          pB.text('ecum', x, 0.55, 'E = ' + App.si(t > 0 ? M.cum[k] : 0, 'J'), 'bad', x > (M.T / U[0]) * 0.6 ? 'end' : 'start', x > (M.T / U[0]) * 0.6 ? -6 : 6);
          const igr = Math.abs(s.ig) / igMaxRef();
          fGate.rate = igr > 0.004 ? 0.25 + igr * 2.2 : 0; fGate.dir = s.ig >= 0 ? 1 : -1;
          fFet.rate = s.id / M.p.il;
          fDio.rate = Math.max(0, 1 - s.id / M.p.il);
          svg.querySelector('#gsVgs').textContent = 'V_GS = ' + App.num(s.vgs, 2) + ' V';
          svg.querySelector('#gsIg').textContent = 'I_G = ' + App.si(s.ig, 'A');
          svg.querySelector('#gsVds').textContent = 'V_DS = ' + App.num(s.vds, 1) + ' V';
          svg.querySelector('#gsId').textContent = 'I_D = ' + App.num(s.id, 2) + ' A';
          let ph2 = '';
          if (M.b && t >= 0) {
            const i = M.b.findIndex((b, j) => j < 4 && t >= b && t < M.b[j + 1]);
            const on = M.mode === 'on';
            const txt = on
              ? [L('t1: gecikme', 't1: delay'), L('t2: akım yükseliyor', 't2: current rising'), L('t3: Miller platosu', 't3: Miller plateau'), L('t4: overdrive', 't4: overdrive')]
              : [L('t1: overdrive boşalıyor', 't1: overdrive discharging'), L('t2: Miller platosu', 't2: Miller plateau'), L('t3: akım düşüyor', 't3: current falling'), L('t4: kuyruk', 't4: tail')];
            ph2 = i >= 0 ? txt[i] : txt[3];
          }
          const el = svg.querySelector('#gsPh');
          el.textContent = ph2;
          el.setAttribute('class', 'sch-t big ' + (/Miller/.test(ph2) ? 'bad' : 'sig'));
        });
      }

      /* ---------------- Figure: Miller effect, charge flow ---------------- */
      {
        const fig = root.querySelector('#fig-miller .lab-fig');
        const grid = App.h('div', { class: 'two' }); fig.appendChild(grid);
        const left = App.h('div'), right = App.h('div'); grid.append(left, right);
        const svg = Viz.schematic(left, 440, 270, `
          ${Sch.box(10, 140, 90, 50, L('Sürücü', 'Driver'), '0 → 10 V')}
          ${Sch.w([[100, 165], [120, 165]], 'sigw')}
          ${Sch.res(150, 165, 90, 'R_G')}
          ${Sch.w([[180, 165], [300, 165]], 'sigw')}${Sch.dot(240, 165)}
          ${Sch.nmos(330, 165, '')}
          ${Sch.cap(240, 135, 0, 'C_gd')}
          ${Sch.cap(240, 195, 0, 'C_gs')}
          ${Sch.w([[240, 105], [350, 105]])}${Sch.dot(350, 105)}
          ${Sch.w([[350, 105], [350, 135]])}
          ${Sch.w([[240, 225], [350, 225]])}${Sch.w([[350, 195], [350, 225]])}${Sch.dot(350, 225)}
          ${Sch.gnd(350, 225)}
          ${Sch.load(350, 75, 0, '')}
          ${Sch.vcc(350, 45, 'V_DD')}
          <text x="374" y="80" class="sch-t">${L('yük', 'load')}</text>
          <text id="mlVds" x="436" y="128" class="sch-t cu" text-anchor="end"></text>
          <text id="mlVgs" x="55" y="210" class="sch-t sig" text-anchor="middle"></text>
          <text id="mlPh" x="220" y="262" class="sch-t big" text-anchor="middle"></text>
        `);
        const fDrv = new Viz.Flow(svg, 'M100,165H240', { cls: 'flow e', spacing: 12, speed: 70 });
        const fCgs = new Viz.Flow(svg, 'M240,165V225H340', { cls: 'flow e', spacing: 12, speed: 70 });
        const fCgd = new Viz.Flow(svg, 'M240,165V105H350V225', { cls: 'flow e', spacing: 12, speed: 70 });
        const fLoad = new Viz.Flow(svg, 'M350,45V225', { spacing: 14 });
        const prm = { vdrv: 10, rg: 10, qgs: 6e-9, qgd: 12e-9, qg: 30e-9, vth: 2.5, vpl: 4.5, il: 5, vdd: 24 };
        const on = gateModel(prm, 'on'), off = gateModel(prm, 'off');
        const gap = 0.35 * on.T, Ttot = on.T + gap + off.T + gap;
        const at = t => {
          if (t < on.T) return Object.assign({ m: on, tt: t }, on.f(t));
          if (t < on.T + gap) return Object.assign({ m: null }, on.f(t));
          if (t < on.T + gap + off.T) { const tt = t - on.T - gap; return Object.assign({ m: off, tt }, off.f(tt)); }
          return Object.assign({ m: null }, off.f(off.T));
        };
        const p = new Viz.Plot(right, { w: 420, h: 270, x: [0, Ttot * 1e9], y: [0, 26], xLabel: L('zaman (ns)', 'time (ns)'), yLabel: 'V', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
        const pts = Viz.sample(t => 0, 0, Ttot, 500).map(([t]) => [t, at(t)]);
        p.line('vds', pts.map(([t, s]) => [t * 1e9, s.vds]), 'cu');
        p.line('vgs', pts.map(([t, s]) => [t * 1e9, s.vgs * 2]), 'sig');
        p.text('l1', Ttot * 1e9 * 0.02, 24.5, 'V_DS', 'cu');
        p.text('l2', Ttot * 1e9 * 0.98, 21.5, 'V_GS × 2', 'sig', 'end');
        [[on.b[2], on.b[3]], [on.T + gap + off.b[1], on.T + gap + off.b[2]]].forEach((r, i) => {
          p.rect('pl' + i, r[0] * 1e9, 0, r[1] * 1e9, 26, 'warn');
          p.text('plt' + i, (r[0] + r[1]) / 2 * 1e9, 1.2, 'Miller', 'muted', 'middle');
        });
        let tc = 0;
        const igMax = prm.vdrv / prm.rg;
        App.onFrame(dt => {
          tc += App.reducedMotion ? 0 : dt;
          const t = App.reducedMotion ? (on.b[2] + on.b[3]) / 2 : ((tc / 7) % 1) * Ttot;
          const s = at(t);
          p.vline('cur', t * 1e9, 'sig solid');
          p.dot('d', t * 1e9, s.vgs * 2, 'sig', 4);
          const ir = Math.abs(s.ig) / igMax;
          let seg = -1;
          if (s.m) seg = s.m.b.findIndex((b, j) => j < 4 && s.tt >= b && s.tt < s.m.b[j + 1]);
          const plateau = s.m && ((s.m === on && seg === 2) || (s.m === off && seg === 1));
          const r = ir > 0.01 ? 0.3 + ir * 2.5 : 0;
          const dir = s.ig >= 0 ? 1 : -1;
          fDrv.rate = r; fDrv.dir = dir;
          fCgd.rate = plateau ? r : r * 0.25; fCgd.dir = dir;
          fCgs.rate = plateau ? 0 : r * 0.9; fCgs.dir = dir;
          fLoad.rate = s.id / prm.il;
          svg.querySelector('#mlVds').textContent = 'V_DS = ' + App.num(s.vds, 1) + ' V';
          svg.querySelector('#mlVgs').textContent = 'V_GS = ' + App.num(s.vgs, 1) + ' V';
          const ph = svg.querySelector('#mlPh');
          let txt = '', cls = 'sig';
          if (!s.m) txt = s.vgs > 5 ? L('tam açık: gate akımı yok', 'fully on: no gate current') : L('kapalı', 'off');
          else if (plateau) { txt = s.m === on ? L('Plato: tüm akım C_gd’ye, V_DS düşüyor', 'Plateau: all current into C_gd, V_DS falling') : L('Plato: C_gd akımı gate’ten dışarı, V_DS yükseliyor', 'Plateau: C_gd current out of the gate, V_DS rising'); cls = 'bad'; }
          else txt = s.m === on ? L('C_gs şarj oluyor', 'C_gs charging') : L('C_gs boşalıyor', 'C_gs discharging');
          ph.textContent = txt; ph.setAttribute('class', 'sch-t big ' + cls);
        });
      }

      /* ---------------- Lab: losses vs frequency ---------------- */
      {
        const lab = root.querySelector('#lab-loss');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const p = new Viz.Plot(fig, {
          w: 600, h: 360, x: [1e3, 1e6], y: [1e-3, 1e3], logX: true, logY: true,
          xLabel: L('anahtarlama frekansı f_sw', 'switching frequency f_sw'), yLabel: L('güç (W)', 'power (W)'),
          xFmt: v => App.si(v, 'Hz', 2), yFmt: v => App.si(v, 'W', 2)
        });
        const sF = UI.slider(ctl, { label: 'f<sub>sw</sub>', min: 1e3, max: 1e6, step: 100, value: 20e3, log: true, unit: 'Hz', onInput: update });
        const sI = UI.slider(ctl, { label: L('Yük akımı I', 'Load current I'), min: 0.5, max: 30, step: 0.5, value: 10, fmt: v => App.num(v, 1) + ' A', onInput: update });
        const sV = UI.slider(ctl, { label: 'V<sub>DD</sub>', min: 5, max: 100, step: 1, value: 24, fmt: v => App.num(v, 0) + ' V', onInput: update });
        const sR = UI.slider(ctl, { label: 'R<sub>DS(on)</sub>', min: 1e-3, max: 200e-3, step: 0.5e-3, value: 10e-3, log: true, unit: 'Ω', onInput: update });
        const sT = UI.slider(ctl, { label: 't<sub>r</sub> + t<sub>f</sub>', min: 10e-9, max: 5e-6, step: 1e-9, value: 100e-9, log: true, unit: 's', onInput: update });
        const sD = UI.slider(ctl, { label: L('Doluluk D', 'Duty D'), min: 0.05, max: 0.95, step: 0.01, value: 0.5, fmt: v => Math.round(v * 100) + ' %', onInput: update });
        const sQ = UI.slider(ctl, { label: 'Q<sub>g</sub>', min: 5e-9, max: 200e-9, step: 1e-9, value: 40e-9, unit: 'C', onInput: update });
        const ro = UI.readouts(ctl, [
          { key: 'pc', label: L('İletim P<sub>cond</sub>', 'Conduction P<sub>cond</sub>') },
          { key: 'ps', label: L('Anahtarlama P<sub>sw</sub>', 'Switching P<sub>sw</sub>') },
          { key: 'pg', label: 'Gate P<sub>gate</sub>' },
          { key: 'pt', label: L('Toplam', 'Total') },
          { key: 'fx', label: L('Kesişim P<sub>sw</sub> = P<sub>cond</sub>', 'Crossover P<sub>sw</sub> = P<sub>cond</sub>') },
          { key: 'eff', label: L('Yük gücüne oranla kayıp', 'Loss vs load power') },
          { key: 'dt', label: L('ΔT (TO-220, soğutucusuz)', 'ΔT (TO-220, no heatsink)') }
        ]);
        const Vdrv = 10;
        p.text('lc', 1.2e3, 0, L('P_cond (sabit)', 'P_cond (flat)'), 'cu');
        p.text('ls', 1.2e3, 0, 'P_sw', '');
        p.text('lg', 1.2e3, 0, 'P_gate', 'sig');
        p.text('lt', 1.2e3, 0, L('toplam', 'total'), '');
        function update() {
          const I = sI.value, V = sV.value, R = sR.value, T = sT.value, D = sD.value, Q = sQ.value, f = sF.value;
          const Pc = I * I * R * D, Esw = 0.5 * V * I * T, Eg = Q * Vdrv;
          const fs = []; for (let i = 0; i <= 120; i++) fs.push(Math.pow(10, 3 + 3 * i / 120));
          p.line('c', fs.map(x => [x, Math.max(1e-3, Pc)]), 'cu');
          p.line('s', fs.map(x => [x, Math.max(1e-3, Esw * x)]), 'warn');
          p.line('g', fs.map(x => [x, Math.max(1e-3, Eg * x)]), 'sig');
          p.line('t', fs.map(x => [x, Pc + (Esw + Eg) * x]), '');
          const fx = Pc / (Esw + Eg);
          p.rect('opt', 1e3, 1e-3, App.clamp(fx, 1e3, 1e6), 1e3, 'ok');
          p.text('optT', Math.sqrt(1e3 * App.clamp(fx, 1e3, 1e6)), 500, fx > 1.5e3 ? L('iletim baskın', 'conduction dominates') : '', 'ok', 'middle');
          p.vline('fx', App.clamp(fx, 1e3, 1e6), 'cu');
          p.text('lc', 1.2e3, Pc, L('P_cond (sabit)', 'P_cond (flat)'), 'cu', 'start', 0, -6);
          p.text('ls', 1e6, Esw * 1e6, 'P_sw', 'muted', 'end', -4, 14);
          p.text('lg', 1e6, Eg * 1e6, 'P_gate', 'sig', 'end', -4, 14);
          p.text('lt', 1e6, Pc + (Esw + Eg) * 1e6, L('toplam', 'total'), '', 'end', -4, -6);
          p.vline('f', f, 'sig solid');
          p.dot('dc', f, Pc, '', 4); p.dot('ds', f, Esw * f, '', 3.5); p.dot('dt', f, Pc + (Esw + Eg) * f, 'sig', 5);
          const Ps = Esw * f, Pg = Eg * f, Pt = Pc + Ps + Pg;
          ro.set('pc', App.si(Pc, 'W'));
          ro.set('ps', App.si(Ps, 'W'), Ps > Pc ? 'warn' : '');
          ro.set('pg', App.si(Pg, 'W'));
          ro.set('pt', App.si(Pt, 'W'));
          ro.set('fx', App.si(fx, 'Hz'));
          ro.set('eff', App.num(Pt / (V * I * D) * 100, 2) + ' %');
          const dT = (Pc + Ps) * 62;
          ro.set('dt', App.num(dT, 0) + ' °C', dT > 100 ? 'bad' : dT > 50 ? 'warn' : 'ok');
        }
        update();
      }

      /* ---------------- Lab: dV/dt-induced turn-on ---------------- */
      {
        const lab = root.querySelector('#lab-dvdt');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const svg = Viz.schematic(fig, 600, 280, `
          ${Sch.vcc(320, 30, 'V_DD')}${Sch.w([[320, 30], [320, 50]])}
          ${Sch.nmos(300, 80, L('üst', 'high'))}
          ${Sch.box(20, 55, 90, 50, L('Sürücü', 'Driver'), 'HI: 0 → ON')}
          ${Sch.w([[110, 80], [270, 80]], 'sigw')}
          ${Sch.w([[320, 110], [320, 165]])}${Sch.dot(320, 135)}
          ${Sch.nmos(300, 195, L('alt', 'low'))}
          ${Sch.cap(240, 165, 0, 'C_gd')}
          ${Sch.w([[240, 135], [320, 135]])}
          ${Sch.w([[110, 195], [110, 195]])}
          ${Sch.box(20, 170, 90, 50, L('Sürücü', 'Driver'), 'LO = OFF')}
          ${Sch.res(140, 195, 90, '')}
          ${Sch.w([[170, 195], [270, 195]], 'sigw')}${Sch.dot(240, 195)}${Sch.dot(205, 195)}
          ${Sch.cap(205, 225, 0, '')}
          <text x="186" y="230" class="sch-t" text-anchor="end">C_gs</text>
          <text x="140" y="181" class="sch-t sig" text-anchor="middle">R_G(off)</text>
          ${Sch.w([[320, 225], [320, 255]])}${Sch.w([[205, 255], [320, 255]])}${Sch.gnd(320, 255)}
          ${Sch.w([[320, 135], [450, 135]], 'hot')}
          ${Sch.ind(480, 135, 90, '')}
          ${Sch.w([[510, 135], [580, 135]], 'hot')}
          <text x="480" y="122" class="sch-t">L</text>
          <text x="400" y="128" class="sch-t">SW</text>
          <text id="dvVsw" x="400" y="160" class="sch-t cu"></text>
          <text id="dvVgs" x="40" y="262" class="sch-t sig"></text>
          <text id="dvSt" x="590" y="30" class="sch-t big" text-anchor="end"></text>
        `);
        const fHi = new Viz.Flow(svg, 'M320,30V135H580', { spacing: 14 });
        const fInj = new Viz.Flow(svg, 'M320,135H240V195H110', { cls: 'flow e', spacing: 11, speed: 60 });
        const fSt = new Viz.Flow(svg, 'M320,30V255', { cls: 'flow bad', spacing: 10, speed: 120, r: 3 });
        const p = new Viz.Plot(fig, { w: 600, h: 240, x: [0, 1], y: [-6, 10], xLabel: L('zaman (ns)', 'time (ns)'), yLabel: 'V_GS (V)', yFmt: v => App.num(v, 0) });
        const sS = UI.slider(ctl, { label: 'dV/dt', min: 1, max: 100, step: 0.5, value: 10, log: true, fmt: v => App.num(v, 1) + ' V/ns', onInput: update });
        const sVdd = UI.slider(ctl, { label: 'V<sub>DD</sub>', min: 12, max: 100, step: 1, value: 48, fmt: v => App.num(v, 0) + ' V', onInput: update });
        const sCgd = UI.slider(ctl, { label: 'C<sub>gd</sub> (C<sub>rss</sub>)', min: 10e-12, max: 500e-12, step: 1e-12, value: 80e-12, log: true, unit: 'F', onInput: update });
        const sCgs = UI.slider(ctl, { label: 'C<sub>gs</sub>', min: 300e-12, max: 6e-9, step: 10e-12, value: 1.5e-9, log: true, unit: 'F', onInput: update });
        const sR = UI.slider(ctl, { label: 'R<sub>G(off)</sub>', min: 0.5, max: 50, step: 0.1, value: 4.7, log: true, fmt: v => App.num(v, 1) + ' Ω', onInput: update });
        const sVth = UI.slider(ctl, { label: L('V<sub>th</sub> (sıcak)', 'V<sub>th</sub> (hot)'), min: 1, max: 4, step: 0.05, value: 2, fmt: v => App.num(v, 2) + ' V', onInput: update });
        const sm = UI.segmented(ctl, { label: L('Kapalı gate', 'Off-state gate'), options: [{ value: 'z', label: '0 V' }, { value: 'neg', label: '−5 V' }, { value: 'clamp', label: 'Miller clamp' }], value: 'z', onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'tr', label: L('Kenar süresi t<sub>r</sub>', 'Edge time t<sub>r</sub>') },
          { key: 'ii', label: L('Enjekte akım C<sub>gd</sub>·dV/dt', 'Injected current C<sub>gd</sub>·dV/dt') },
          { key: 'pk', label: L('V<sub>GS</sub> tepe', 'V<sub>GS</sub> peak') },
          { key: 'div', label: L('Bölücü üst sınırı', 'Divider upper bound') },
          { key: 'rmax', label: L('Güvenli R<sub>G(off)</sub> en çok', 'Max safe R<sub>G(off)</sub>') },
          { key: 'st', label: 'Shoot-through' }
        ]);
        let S = null, tc = 0;
        function vAt(t) {
          if (t < 0) return S.base;
          const tt = Math.min(t, S.tr);
          let v = S.A * (1 - Math.exp(-tt / S.tau));
          if (t > S.tr) v *= Math.exp(-(t - S.tr) / S.tau);
          return S.base + v;
        }
        function update() {
          const dv = sS.value * 1e9, Vdd = sVdd.value, Cgd = sCgd.value, Cgs = sCgs.value, Vth = sVth.value;
          const R = sm.value === 'clamp' ? 2 : sR.value;
          const base = sm.value === 'neg' ? -5 : 0;
          const tr = Vdd / dv, tau = R * (Cgs + Cgd), A = R * Cgd * dv;
          S = { base, tr, tau, A, Vth, Vdd };
          const pk = base + A * (1 - Math.exp(-tr / tau));
          S.pk = pk;
          const Tw = tr + 4 * tau, pre = 0.15 * Tw;
          S.pre = pre; S.Tw = Tw;
          p.setRange({ x: [-pre * 1e9, Tw * 1e9], y: [-6, Math.max(10, pk + 1.5)] });
          p.line('v', Viz.sample(t => vAt(t * 1e-9), -pre * 1e9, Tw * 1e9, 300), 'sig');
          p.line('sw', Viz.sample(t => { const tt = t * 1e-9; return tt < 0 ? -5.5 : tt < tr ? -5.5 + 4.5 * tt / tr : -1; }, -pre * 1e9, Tw * 1e9, 200), 'cu thin');
          p.text('swl', Tw * 1e9, -1, L('V_SW (ölçeksiz)', 'V_SW (not to scale)'), 'cu', 'end', -2, -6);
          p.hline('vth', Vth, 'bad');
          p.text('vthl', -pre * 1e9, Vth, 'V_th', 'bad', 'start', 4, -5);
          p.rect('ex', -pre * 1e9, Vth, Tw * 1e9, Math.max(10, pk + 1.5), pk > Vth ? 'bad' : '');
          p.hide('ex', pk <= Vth);
          const st = pk > Vth;
          ro.set('tr', App.si(tr, 's'));
          ro.set('ii', App.si(Cgd * dv, 'A'));
          ro.set('pk', App.num(pk, 2) + ' V', st ? 'bad' : pk > Vth - 0.7 ? 'warn' : 'ok');
          ro.set('div', App.num(base + Vdd * Cgd / (Cgd + Cgs), 2) + ' V');
          const rmax = (Vth - base) / (Cgd * dv);
          ro.set('rmax', App.si(rmax, 'Ω'));
          ro.set('st', st ? L('EVET', 'YES') : L('hayır', 'no'), st ? 'bad' : 'ok');
          const stEl = svg.querySelector('#dvSt');
          stEl.textContent = st ? L('SHOOT-THROUGH!', 'SHOOT-THROUGH!') : L('alt MOSFET kapalı kalıyor', 'low side stays off');
          stEl.setAttribute('class', 'sch-t big ' + (st ? 'bad' : 'ok'));
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!S) return;
          tc += dt;
          const ph = App.reducedMotion ? 0.5 : Math.min(1, (tc % 3.6) / 3);
          const t = -S.pre + (S.Tw + S.pre) * ph;
          const v = vAt(t);
          p.vline('cur', t * 1e9, 'sig solid');
          p.dot('d', t * 1e9, v, v > S.Vth ? 'bad' : 'sig', 4.5);
          const ramping = t > 0 && t < S.tr;
          const injI = Math.abs(v - S.base) / Math.max(1e-9, S.A);
          fInj.rate = t > 0 ? Math.min(2.5, injI * 2) : 0;
          fInj.dir = 1; void ramping;
          fHi.rate = t > 0 ? 1 : 0;
          fSt.rate = v > S.Vth ? 2 : 0;
          const vsw = t < 0 ? 0 : Math.min(1, t / S.tr) * S.Vdd;
          svg.querySelector('#dvVsw').textContent = 'V_SW = ' + App.num(vsw, 0) + ' V';
          svg.querySelector('#dvVgs').textContent = L('alt V_GS = ', 'low V_GS = ') + App.num(v, 2) + ' V';
        });
      }

      /* ---------------- Lab: BJT turn-off ---------------- */
      {
        const lab = root.querySelector('#lab-bjt');
        const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
        const svg = Viz.schematic(fig, 420, 250, `
          ${Sch.box(10, 130, 80, 50, 'GPIO', L('3,3 V', '3.3 V'))}
          ${Sch.w([[90, 155], [160, 155]], 'sigw')}${Sch.dot(130, 155)}
          ${Sch.res(190, 155, 90, '')}
          <text x="190" y="176" class="sch-t sig" text-anchor="middle">R_B</text>
          ${Sch.w([[220, 155], [270, 155]], 'sigw')}${Sch.dot(250, 155)}
          <g id="bjCap">${Sch.w([[130, 155], [130, 95], [160, 95]], 'sigw')}${Sch.cap(190, 95, 90, '')}${Sch.w([[220, 95], [250, 95], [250, 155]], 'sigw')}
            <text x="190" y="78" class="sch-t sig" text-anchor="middle">C ${L('hızlandırma', 'speed-up')}</text></g>
          ${Sch.npn(300, 155, '')}
          ${Sch.w([[320, 185], [320, 205]])}${Sch.gnd(320, 205)}
          ${Sch.load(320, 75, 0, '')}
          ${Sch.vcc(320, 45, '12 V')}
          <text x="344" y="80" class="sch-t">120 Ω</text>
          ${Sch.w([[320, 105], [320, 125]])}
          <g id="bjBaker">${Sch.w([[260, 155], [260, 115]])}${Sch.dot(260, 155)}${Sch.diode(290, 115, 270, '', 'schottky')}${Sch.dot(320, 115)}
            <text x="292" y="102" class="sch-t" text-anchor="middle">Baker</text></g>
          <text id="bjIc" x="336" y="160" class="sch-t cu"></text>
          <text id="bjIb" x="140" y="210" class="sch-t sig" text-anchor="middle"></text>
          <text id="bjPh" x="210" y="242" class="sch-t big" text-anchor="middle"></text>
        `);
        const fB = new Viz.Flow(svg, 'M90,155H270', { cls: 'flow e', spacing: 12, speed: 60 });
        const fC = new Viz.Flow(svg, 'M320,45V205', { spacing: 14 });
        const p = new Viz.Plot(fig, { w: 600, h: 260, x: [-100, 500], y: [-80, 115], xLabel: L('zaman (ns), GPIO t = 0’da LOW olur', 'time (ns), GPIO goes LOW at t = 0'), yLabel: 'mA', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0) });
        const sBf = UI.slider(ctl, { label: L('β<sub>forced</sub> = I<sub>C</sub>/I<sub>B1</sub>', 'β<sub>forced</sub> = I<sub>C</sub>/I<sub>B1</sub>'), min: 3, max: 90, step: 1, value: 10, fmt: v => App.num(v, 0), onInput: update });
        const tCap = UI.toggle(ctl, { label: L('Hızlandırma kondansatörü', 'Speed-up capacitor'), value: false, onChange: update });
        const tBak = UI.toggle(ctl, { label: L('Baker clamp (Schottky B–C)', 'Baker clamp (Schottky B–C)'), value: false, onChange: update });
        const ro = UI.readouts(ctl, [
          { key: 'ib1', label: 'I<sub>B1</sub> (' + L('açık', 'on') + ')' },
          { key: 'od', label: L('Aşırı sürme β/β<sub>forced</sub>', 'Overdrive β/β<sub>forced</sub>') },
          { key: 'ib2', label: 'I<sub>B2</sub> (' + L('kapanış', 'turn-off') + ')' },
          { key: 'ts', label: L('Depolama t<sub>s</sub>', 'Storage t<sub>s</sub>') },
          { key: 'tf', label: L('Düşüş t<sub>f</sub>', 'Fall t<sub>f</sub>') },
          { key: 'vce', label: 'V<sub>CE(on)</sub>' },
          { key: 'pon', label: L('İletim kaybı', 'On-state loss') }
        ]);
        const IC = 0.1, beta = 100, tauS = 250e-9, tauB = 50e-9, VBE = 0.75, Rout = 50;
        function calc(bf, cap, baker) {
          const ib1 = IC / bf, RB = (3.3 - VBE) / ib1;
          const ib2 = cap ? -(3.3) / Rout : -VBE / RB;
          const ib1eff = baker ? Math.min(ib1, 1.05 * IC / beta) : ib1;
          const ts = Math.max(2e-9, tauS * Math.log((ib1eff - ib2) / (IC / beta - ib2)));
          const tf = tauB * Math.log(1 + IC / (beta * -ib2));
          const vce = baker ? Math.max(0.35, 0.08 + 0.4 * Math.pow(bf / beta, 3)) : 0.08 + 0.4 * Math.pow(bf / beta, 3);
          const ic = t => t < ts ? IC : Math.max(0, beta * ib2 + (IC - beta * ib2) * Math.exp(-(t - ts) / tauB));
          const ib = t => t < 0 ? ib1 : t < ts + tf ? ib2 * (cap ? Math.exp(-t / Math.max(ts + tf, 20e-9)) * 0.8 + 0.2 : 1) : ib2 * Math.exp(-(t - ts - tf) / 15e-9) * (cap ? 0.2 : 1);
          return { ib1, ib2, ts, tf, vce, ic, ib };
        }
        let C = null, X1 = 500, tc = 0;
        function update() {
          const bf = sBf.value;
          C = calc(bf, tCap.value, tBak.value);
          const ref = calc(bf, false, false);
          X1 = Math.max(150, Math.ceil(((ref.ts + 4 * ref.tf) * 1.25e9) / 50) * 50);
          p.setRange({ x: [-0.15 * X1, X1], y: [Math.min(-10, C.ib2 * 1e3 * 1.15), 118] });
          const s = (f) => Viz.sample(t => f(t * 1e-9) * 1e3, -0.15 * X1, X1, 400);
          p.line('ref', s(ref.ic), 'faint dash');
          p.line('ic', s(C.ic), 'cu');
          p.line('ib', s(C.ib), 'sig');
          p.rect('st', 0, Math.min(-10, C.ib2 * 1e3 * 1.15), C.ts * 1e9, 118, 'warn');
          p.text('stl', C.ts * 1e9 / 2, 108, 't_s', 'muted', 'middle');
          p.text('icl', -0.14 * X1, 100, 'I_C', 'cu', 'start', 0, -6);
          p.text('ibl', -0.14 * X1, C.ib1 * 1e3, 'I_B', 'sig', 'start', 0, -6);
          p.hline('z', 0, '');
          svg.querySelector('#bjCap').style.opacity = tCap.value ? 1 : 0.15;
          svg.querySelector('#bjBaker').style.opacity = tBak.value ? 1 : 0.15;
          ro.set('ib1', App.si(C.ib1, 'A'), C.ib1 > 0.02 ? 'warn' : '');
          ro.set('od', '× ' + App.num(beta / bf, 1), beta / bf < 2 ? 'warn' : '');
          ro.set('ib2', App.si(C.ib2, 'A'));
          ro.set('ts', App.si(C.ts, 's'), C.ts > 150e-9 ? 'bad' : C.ts > 50e-9 ? 'warn' : 'ok');
          ro.set('tf', App.si(C.tf, 's'));
          ro.set('vce', App.num(C.vce, 2) + ' V', C.vce > 0.3 ? 'warn' : 'ok');
          ro.set('pon', App.si(C.vce * IC, 'W'));
          tc = 0;
        }
        update();
        App.onFrame(dt => {
          if (!C) return;
          tc += dt;
          const ph = App.reducedMotion ? 0.3 : Math.min(1, (tc % 3.8) / 3.2);
          const tn = -0.15 * X1 + 1.15 * X1 * ph, t = tn * 1e-9;
          const ic = C.ic(t), ib = C.ib(t);
          p.vline('cur', tn, 'sig solid');
          p.dot('d', tn, ic * 1e3, '', 4);
          fC.rate = ic / IC;
          fB.rate = Math.abs(ib) > 1e-4 ? Math.min(2.5, 0.3 + Math.abs(ib) / C.ib1 * 0.7) : 0;
          fB.dir = ib >= 0 ? 1 : -1;
          svg.querySelector('#bjIc').textContent = 'I_C = ' + App.num(ic * 1e3, 0) + ' mA';
          svg.querySelector('#bjIb').textContent = 'I_B = ' + App.num(ib * 1e3, 1) + ' mA';
          const ph2 = svg.querySelector('#bjPh');
          if (t < 0) { ph2.textContent = L('açık (doyum)', 'on (saturated)'); ph2.setAttribute('class', 'sch-t big ok'); }
          else if (t < C.ts) { ph2.textContent = L('depolama: yük boşalıyor, I_C değişmiyor', 'storage: charge leaving, I_C unchanged'); ph2.setAttribute('class', 'sch-t big bad'); }
          else if (ic > 1e-3) { ph2.textContent = L('düşüş', 'falling'); ph2.setAttribute('class', 'sch-t big cu'); }
          else { ph2.textContent = L('kapalı', 'off'); ph2.setAttribute('class', 'sch-t big muted'); }
        });
      }
    }
  });
})();
