/* SIM — Circuit simulator: pick a real part (2N7002, AO3400A, IRLZ44N, IRF540N, BC547, TIP120 …),
   a logic source (FPGA/MCU 1.8/3.3/5 V), a drive stage, a 5/12/24 V rail and a load; see the operating
   point, switching waveforms up to MHz PWM, losses, junction temperature and a ranking of every part. */
App.page({
  id: 'simulator',
  num: 'SIM',
  group: { tr: 'Simülatör', en: 'Simulator' },
  title: { tr: 'Devre simülatörü', en: 'Circuit simulator' },
  blurb: {
    tr: 'Gerçek parçalarla (2N7002, IRLZ44N, IRF540N, BC547, TIP120…) 1,8/3,3/5 V kaynaktan 12/24 V yük sür, 100 kHz’de dene.',
    en: 'Drive 12/24 V loads from 1.8/3.3/5 V logic with real parts (2N7002, IRLZ44N, IRF540N, BC547, TIP120…), try 100 kHz.'
  },
  summary: {
    tr: 'Gerçek parçalarla bir sürme devresi kur. Çalışma noktasını, dalga şekillerini, kaybı ve sıcaklığı anında gör.',
    en: 'Build a drive circuit with real parts. See the operating point, waveforms, losses and temperature instantly.'
  },
  render(L) {
    return `
      <style>
        [data-page="simulator"] .scn { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 10px; margin: 8px 0 8px; }
        [data-page="simulator"] .scn button { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: center; text-align: left; padding: 10px 12px;
          border: 1px solid var(--line); border-radius: 12px; background: var(--surface); color: var(--ink); cursor: pointer; font: inherit; }
        [data-page="simulator"] .scn button:hover { border-color: var(--accent); }
        [data-page="simulator"] .scn button[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); }
        [data-page="simulator"] .scn .tile { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--panel); color: var(--accent); }
        [data-page="simulator"] .scn .tile.bad { background: var(--bad-soft); color: var(--bad); }
        [data-page="simulator"] .scn .tile .ic { width: 22px; height: 22px; }
        [data-page="simulator"] .scn b { display: block; font: 600 .9rem/1.25 var(--f-display); }
        [data-page="simulator"] .scn small { display: block; font: 500 .72rem/1.3 var(--f-mono); color: var(--muted); margin-top: 2px; }
        [data-page="simulator"] .verdicts { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
        [data-page="simulator"] .verdicts li { display: grid; grid-template-columns: 22px 1fr; gap: 8px; align-items: start; font-size: .88rem; line-height: 1.45; max-width: none; margin: 0;
          padding: 8px 10px; border-radius: 10px; background: var(--ok-soft); }
        [data-page="simulator"] .verdicts li.warn { background: var(--warn-soft); }
        [data-page="simulator"] .verdicts li.bad { background: var(--bad-soft); }
        [data-page="simulator"] .verdicts li .ic { width: 18px; height: 18px; margin-top: 1px; color: var(--ok); }
        [data-page="simulator"] .verdicts li.warn .ic { color: var(--warn); }
        [data-page="simulator"] .verdicts li.bad .ic { color: var(--bad); }
        [data-page="simulator"] .partcard { font-size: .84rem; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; }
        [data-page="simulator"] .partcard .specs { font-family: var(--f-mono); font-size: .74rem; color: var(--muted); margin-top: 6px; line-height: 1.6; }
        [data-page="simulator"] .grp { display: grid; gap: 14px; align-content: start; }
        [data-page="simulator"] .grp-t { display: flex; align-items: center; gap: 8px; font: 600 .82rem var(--f-display); color: var(--ink-2); border-bottom: 1px dashed var(--line); padding-bottom: 6px; }
        [data-page="simulator"] .grp-t .ic { width: 18px; height: 18px; color: var(--accent); }
        [data-page="simulator"] .cmp tr { cursor: pointer; }
        [data-page="simulator"] .cmp tr.sel td { background: var(--accent-soft); }
        [data-page="simulator"] .sim-top { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 18px; }
        [data-page="simulator"] .bneck { list-style: none; padding: 0 !important; display: grid; gap: 8px; }
        [data-page="simulator"] .bneck li { max-width: none; margin: 0; padding: 10px 14px; border-radius: 10px; background: var(--panel); }
        [data-page="simulator"] .rlc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
        [data-page="simulator"] .rlc { display: grid; gap: 10px; align-content: start; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); }
        [data-page="simulator"] .rlc-t { font: 600 .9rem var(--f-display); }
        [data-page="simulator"] .rlc-n { font-size: .78rem; color: var(--muted); line-height: 1.45; }
        [data-page="simulator"] .ctx { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        [data-page="simulator"] .ctx .card ul { margin: 8px 0 0; padding-left: 1.1em; font-size: .9rem; color: var(--ink-2); }
        [data-page="simulator"] .ctx .card li { margin: 3px 0; }
        @media (max-width: 760px) { [data-page="simulator"] .sim-top { grid-template-columns: minmax(0, 1fr); } }
      </style>

      ${App.keys([
        L('Bir senaryo kartı seç ya da aşağıdan kendi devreni kur.', 'Pick a scenario card or build your own circuit below.'),
        L('Yeşil uygun, sarı dikkat, kırmızı olmaz demek. Nedeni hemen yanında yazar.', 'Green fits, yellow needs care, red fails. The reason is listed right next to it.'),
        L('Osiloskopta açılış veya kapanış kenarına yakınlaş: sıçramaları ve Miller platosunu gör.', 'Zoom the scope to the turn-on or turn-off edge to see spikes and the Miller plateau.'),
        L('R / L / C bileşeni ekleyerek kablonun ve kondansatörlerin etkisini dene.', 'Add R / L / C parts to try the effect of wiring and capacitors.'),
        L('En alttaki tablo aynı koşullarda bütün parçaları sıralar.', 'The table at the bottom ranks every part under the same conditions.')
      ])}

      <h2>${L('Senaryolar', 'Scenarios')}</h2>
      <div class="scn" id="simPresets" role="group" aria-label="${L('Hazır senaryolar', 'Ready-made scenarios')}"></div>

      <section class="lab" id="lab-sim">
        <div class="lab-head"><span class="tag">${L('Simülasyon', 'Simulation')}</span><h3 id="simTitle"></h3></div>
        <div class="lab-body stack">
          <div class="lab-fig">
            <div class="sim-top">
              <div id="simSch"></div>
              <div class="grp"><ul class="verdicts" id="simVerdicts"></ul><div id="simRo"></div></div>
            </div>
            <div id="simScope"></div>
          </div>
          <div class="lab-ctl" id="simCtl"></div>
        </div>
        <div class="lab-foot">${L('Modeller eğitim amaçlıdır: 25 °C tipik datasheet değerleri, R<sub>DS(on)</sub> %0,7/°C artar. P-kanal ve PNP için gerilimler mutlak değerdir. Sonucu kendi datasheet’inle doğrula.',
          'Teaching models: 25 °C typical datasheet values, R<sub>DS(on)</sub> rises 0.7 %/°C. For P-channel and PNP, voltages are magnitudes. Confirm the result with your own datasheet.')}</div>
      </section>

      <h2>${L('Hız neye bağlı?', 'What sets the speed?')}</h2>
      <p>${L('PWM frekansı arttıkça gate her periyotta dolup boşalır. Kenarlar periyodun %1–5’ini geçince kayıp hızla büyür.',
             'At higher PWM frequency the gate charges and discharges every period. Once the edges exceed 1–5 % of the period, losses climb fast.')}</p>
      <div class="cards">
        <div class="card card-ic"><span class="tile">${App.icon('bolt')}</span><span class="card-b"><h4>${L('Sürücü gerilimi', 'Drive voltage')}</h4><p>${L('Plato geriliminin ne kadar üstünde? 1,8 V çoğu MOSFET’in platosuna bile ulaşmaz.', 'How far above the plateau? 1.8 V does not even reach most MOSFET plateaus.')}</p></span></div>
        <div class="card card-ic"><span class="tile">${App.icon('gauge')}</span><span class="card-b"><h4>${L('Sürücü direnci', 'Drive resistance')}</h4><p>${L('Pin ≈ 25–60 Ω, gate sürücü IC ≈ 1–3 Ω. Gate akımını bu belirler.', 'Pin ≈ 25–60 Ω, gate-driver IC ≈ 1–3 Ω. This sets the gate current.')}</p></span></div>
        <div class="card card-ic"><span class="tile">${App.icon('layers')}</span><span class="card-b"><h4>${L('Gate yükü Q<sub>gd</sub>', 'Gate charge Q<sub>gd</sub>')}</h4><p>${L('Büyük MOSFET = büyük Q<sub>gd</sub> = yavaş kenar.', 'Bigger MOSFET = bigger Q<sub>gd</sub> = slower edge.')}</p></span></div>
        <div class="card card-ic"><span class="tile">${App.icon('square')}</span><span class="card-b"><h4>${L('Frekans', 'Frequency')}</h4><p>${L('Anahtarlama kaybı frekansla doğru orantılı artar.', 'Switching loss rises in proportion to frequency.')}</p></span></div>
      </div>
      <div class="eq">t<sub>sw</sub> ≈ Q<sub>gd</sub> / I<sub>G</sub> &nbsp;·&nbsp; I<sub>G</sub> = (V<sub>drive</sub> − V<sub>plateau</sub>) / (R<sub>out</sub> + R<sub>G</sub>) &nbsp;·&nbsp; P<sub>sw</sub> = ½·V·I·(t<sub>on</sub> + t<sub>off</sub>)·f</div>
      ${App.lab('lab-sweep', L('Kayıp neye bağlı?', 'What does the loss depend on?'), {
        foot: L('Kesikli kırmızı çizgi: bu kılıfın taşıyabileceği en yüksek kayıp. Gate sürme gücü MOSFET’te değil, sürücüde harcanır.',
                'Dashed red line: the highest loss this package can take. Gate drive power is burned in the driver, not in the MOSFET.')
      })}
      <ul class="bneck" id="simBneck"></ul>

      <h2>${L('Aynı koşullarda bütün parçalar', 'Every part under the same conditions')}</h2>
      <p>${L('Satıra tıkla, o parça simülasyona yüklensin.', 'Click a row to load that part into the simulation.')}</p>
      <div class="table-wrap"><table class="cmp" id="simCmp"></table></div>

      <h2>${L('Ray ve kaynak notları', 'Rail and source notes')}</h2>
      <div class="ctx">
        <div class="card card-ic"><span class="tile">${App.icon('car')}</span><span class="card-b"><h4>${L('12 V otomotiv', '12 V automotive')}</h4><ul>
          <li>${L('Normal 9–16 V, marşta ~6 V', 'Normal 9–16 V, ~6 V while cranking')}</li>
          <li>${L('Load dump ~40 V, ters akü olabilir', 'Load dump ~40 V, reverse battery possible')}</li>
          <li>${L('40–60 V MOSFET + TVS kullan', 'Use 40–60 V MOSFETs + TVS')}</li>
          <li>${L('Gövdeye bağlı yük → high-side', 'Load tied to chassis → high-side')}</li></ul></span></div>
        <div class="card card-ic"><span class="tile">${App.icon('factory')}</span><span class="card-b"><h4>${L('24 V endüstri', '24 V industrial')}</h4><ul>
          <li>${L('Çalışma aralığı 18–30 V', 'Operating range 18–30 V')}</li>
          <li>${L('Uzun kablo = endüktif darbe', 'Long cables = inductive pulses')}</li>
          <li>${L('60 V sınıfı parça + TVS', '60 V class parts + TVS')}</li>
          <li>${L('Çıkışlar çoğunlukla PNP / sourcing', 'Outputs are mostly PNP / sourcing')}</li></ul></span></div>
        <div class="card card-ic"><span class="tile">${App.icon('chip')}</span><span class="card-b"><h4>${L('1,8 V FPGA', '1.8 V FPGA')}</h4><ul>
          <li>${L('Güç MOSFET’ini doğrudan süremez', 'Cannot drive a power MOSFET directly')}</li>
          <li>${L('1,8 V girişli gate sürücü kullan', 'Use a gate driver with 1.8 V inputs')}</li>
          <li>${L('ya da önüne seviye çevirici koy', 'or put a level translator in front')}</li></ul></span></div>
      </div>`;
  },

  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L, P = App.Parts;

    /* ================= configuration ================= */
    const SRC = {
      fpga18: { vio: 1.8, rout: 55, imax: 0.012, name: 'FPGA 1,8 V', nameEn: 'FPGA 1.8 V' },
      fpga33: { vio: 3.3, rout: 40, imax: 0.016, name: 'FPGA 3,3 V', nameEn: 'FPGA 3.3 V' },
      mcu33: { vio: 3.3, rout: 40, imax: 0.020, name: 'MCU 3,3 V', nameEn: 'MCU 3.3 V' },
      mcu5: { vio: 5.0, rout: 25, imax: 0.040, name: 'MCU 5 V', nameEn: 'MCU 5 V' }
    };
    const LOADS = {
      res: { tr: 'Isıtıcı / direnç', en: 'Heater / resistor', peak: 1, ind: false },
      led: { tr: 'LED şerit', en: 'LED strip', peak: 1, ind: false },
      motor: { tr: 'DC motor', en: 'DC motor', peak: 6, ind: true },
      coil: { tr: 'Röle / solenoid', en: 'Relay / solenoid', peak: 1, ind: true },
      lamp: { tr: 'Akkor lamba', en: 'Filament lamp', peak: 10, ind: false }
    };
    const cfg = {
      src: 'mcu33', topo: 'low', drive: 'pin', vaux: 12, part: 'IRLZ44N', rail: '12', vsup: 12,
      load: 'led', inom: 2, fly: true, f: 20000, dc: false, duty: 0.5, rg: 100, rpd: 10000, ta: 25,
      sink: false, zener: true, worst: true, zoom: false, lvl: false,
      // passive parts (R/L/C palette)
      Rw: 0.02, Lw: 200e-9, useLL: false, LL: 1e-3, useCL: false, CL: 100e-9, useCbus: true, Cbus: 100e-6,
      useSn: false, Rsn: 10, Csn: 4.7e-9, useTvs: false, Vtvs: 33, view: 'steady'
    };
    // typical inductance / capacitance that comes with each load type
    const LOAD_RLC = {
      res: { useLL: false, useCL: false }, led: { useLL: false, useCL: false }, lamp: { useLL: false, useCL: false },
      motor: { useLL: true, LL: 2e-3, useCL: true, CL: 100e-9 }, coil: { useLL: true, LL: 50e-3, useCL: false }
    };

    function srcOf(c) {
      if (c.vioOverride) {
        const v = c.vioOverride;
        return { vio: v, rout: 25 + (5 - v) * 9, imax: 0.02 };
      }
      return SRC[c.src];
    }

    /* ================= the solver ================= */
    function sim(c, part) {
      const s = srcOf(c);
      const vs = c.vsup, RL = vs / c.inom;
      const T = c.dc ? 0 : 1 / c.f, D = c.dc ? 1 : c.duty, f = c.dc ? 0 : c.f;
      const ld = LOADS[c.load];
      const chk = [];
      const add = (lvl, tr, en) => chk.push({ lvl, tr, en });
      const r = { part, src: s, T, D, f, RL, chk, kind: part.kind };
      const high = c.topo === 'high';
      const rth = (c.sink && part.rthjc) ? part.rthjc + 0.5 + 4 : part.rthja;
      r.rth = rth;

      /* --- drive stage: on-level, off-level, on/off resistances (magnitudes w.r.t. source/emitter) --- */
      let von, voff = 0, ron, roff, tpd = 5e-9, inputOk = true;
      if (!high) {
        if (c.drive === 'pin') { von = s.vio; ron = roff = s.rout + c.rg; }
        else if (c.drive === 'totem') { von = c.vaux - 0.7; ron = roff = 3 + c.rg; tpd = 60e-9; voff = 0.7; if (s.vio < 1.4) inputOk = false; }
        else { von = c.vaux; ron = roff = 2.5 + c.rg; tpd = c.lvl ? 20e-9 : 15e-9; if (s.vio < 2.4 && !c.lvl) inputOk = false; }
        // pull-down divider on the gate (MOSFET) — for BJT it steals base current instead
        if (part.kind === 'mos') von = von * c.rpd / (c.rpd + ron);
      } else {
        // P-type high side: gate/base pulled toward ground to turn on; "pull-up" resistor to V+ turns it off
        const clampV = c.zener ? Math.min(vs, 10) : vs;
        if (c.drive === 'shift') { von = clampV; ron = c.rg + 5; roff = c.rpd; tpd = 40e-9; }
        else if (c.drive === 'pin') { von = vs; voff = Math.max(0, vs - s.vio); ron = s.rout + c.rg; roff = s.rout + c.rg; }
        else { von = Math.min(vs, 10); ron = roff = 3 + c.rg; tpd = 30e-9; }
      }
      r.von = von; r.voff = voff; r.ron = ron; r.roff = roff; r.tpd = tpd;
      if (!inputOk) add('bad', `Sürücü girişi ${App.num(s.vio, 1)} V mantık seviyesini tanımıyor (tipik V<sub>IH</sub> ≈ 2,2 V). 1,8 V uyumlu girişli sürücü ya da seviye çevirici kullan.`,
        `The driver input does not recognise ${App.num(s.vio, 1)} V logic (typical V<sub>IH</sub> ≈ 2.2 V). Use a driver with 1.8 V-compatible inputs or a level shifter.`);
      if (high && c.drive === 'pin' && vs > s.vio + 0.3) add('bad', `GPIO doğrudan ${App.num(vs, 0)} V raydaki gate/base’e bağlı: pin, mutlak maksimum gerilimin üstünde zorlanıyor.`,
        `The GPIO connects straight to a gate/base on a ${App.num(vs, 0)} V rail: the pin is pushed above its absolute maximum voltage.`);

      if (part.kind === 'mos') simMos(c, part, r, add, { vs, RL, D, f, T, ld, high, rth, inputOk });
      else simBjt(c, part, r, add, { vs, RL, D, f, T, ld, high, rth, inputOk, s });

      /* --- common checks --- */
      const vRate = part.kind === 'mos' ? part.vds : part.vce;
      if (ld.ind && !c.fly) add('bad', `Endüktif yük ve flyback diyot yok: kapanışta V<sub>${part.kind === 'mos' ? 'DS' : 'CE'}</sub> çığ (avalanche) gerilimine fırlar; her periyotta ${part.id} zorlanır.`,
        `Inductive load without a flyback diode: at turn-off V<sub>${part.kind === 'mos' ? 'DS' : 'CE'}</sub> flies up to avalanche; ${part.id} is stressed every period.`);
      if (c.rail === '12' && vRate < 40) add('warn', `Otomotiv 12 V: load dump ~40 V’a çıkabilir; ${vRate} V’luk parça için TVS ve ≥ 40–60 V seçimi önerilir.`,
        `Automotive 12 V: load dump can reach ~40 V; with a ${vRate} V part add a TVS or choose ≥ 40–60 V.`);
      else if (c.rail === '24' && vRate < 40) add('bad', `Endüstriyel 24 V: ${vRate} V’luk parça 30 V+ darbelere dayanmaz; 60 V sınıfı seç.`,
        `Industrial 24 V: a ${vRate} V part will not survive 30 V+ pulses; choose a 60 V class part.`);
      else if (vRate < vs * 1.5) add(vRate < vs ? 'bad' : 'warn', `Gerilim payı düşük: ${vRate} V’luk parça ${App.num(vs, 1)} V rayda (önerilen ≥ 1,5×).`,
        `Low voltage margin: a ${vRate} V part on a ${App.num(vs, 1)} V rail (recommended ≥ 1.5×).`);
      const ipk = r.i * ld.peak;
      const iRate = part.kind === 'mos' ? part.id_ : part.ic;
      if (r.i > iRate) add('bad', `Akım ${App.si(r.i, 'A')} parçanın sürekli akım değerini (${App.si(iRate, 'A')}) aşıyor.`, `Current ${App.si(r.i, 'A')} exceeds the part’s continuous rating (${App.si(iRate, 'A')}).`);
      else if (ld.peak > 1 && ipk > iRate * (part.kind === 'mos' ? 4 : 2)) add('warn', `İlk açılışta ${ld.peak}× kalkış akımı (~${App.si(ipk, 'A')}) darbe akım sınırını zorlar. Bkz. inrush bölümü.`,
        `At switch-on the ${ld.peak}× inrush (~${App.si(ipk, 'A')}) strains the pulse current rating. See the inrush chapter.`);
      if (r.tj >= part.tj - 0.5) add('bad', `T<sub>j</sub> ≈ ${r.runaway ? '> 300' : App.num(r.tj, 0)} °C &gt; ${part.tj} °C: parça yanar.${!c.sink && part.rthjc ? ' Soğutucu ekle ya da daha düşük kayıplı parça seç.' : ''}`,
        `T<sub>j</sub> ≈ ${r.runaway ? '> 300' : App.num(r.tj, 0)} °C &gt; ${part.tj} °C: the part burns.${!c.sink && part.rthjc ? ' Add a heatsink or choose a lower-loss part.' : ''}`);
      else if (r.tj > part.tj - 40) add('warn', `T<sub>j</sub> ≈ ${App.num(r.tj, 0)} °C: sınıra yakın (güvenilirlik için ≤ ${part.tj - 40} °C hedefle).`,
        `T<sub>j</sub> ≈ ${App.num(r.tj, 0)} °C: close to the limit (aim for ≤ ${part.tj - 40} °C for reliability).`);
      if (!chk.some(x => x.lvl !== 'ok')) add('ok', 'Bu koşullarda tasarım sağlıklı görünüyor.', 'The design looks healthy under these conditions.');
      r.verdict = chk.some(x => x.lvl === 'bad') ? 'bad' : chk.some(x => x.lvl === 'warn') ? 'warn' : 'ok';
      return r;
    }

    function simMos(c, m, r, add, k) {
      const { vs, RL, D, f, T, high, rth } = k;
      const vgs = k.inputOk ? r.von : 0;
      r.vgs = vgs;
      if (vgs > m.vgsMax) add('bad', `|V<sub>GS</sub>| = ${App.num(vgs, 1)} V &gt; V<sub>GS(max)</sub> = ±${m.vgsMax} V: gate oksidi delinir.${high ? ' Zener kelepçe kullan.' : ''}`,
        `|V<sub>GS</sub>| = ${App.num(vgs, 1)} V &gt; V<sub>GS(max)</sub> = ±${m.vgsMax} V: the gate oxide breaks down.${high ? ' Use a zener clamp.' : ''}`);
      // operating point with thermal iteration
      let tj = c.ta, id = 0, vds = vs, runaway = false;
      const solve = t => {
        let a = 0, b = vs;
        for (let i = 0; i < 60; i++) { const mid = (a + b) / 2; if ((vs - mid) / RL - P.idOf(m, vgs, mid, t) > 0) a = mid; else b = mid; }
        vds = (a + b) / 2; id = (vs - vds) / RL;
      };
      let sw = {};
      for (let it = 0; it < 60; it++) {
        solve(tj);
        sw = mosSwitch(c, m, r, id, vs, f);
        const pc = id * vds * D;
        const pt = pc + sw.psw;
        const tjn = c.ta + pt * rth;
        if (tjn > 320) { runaway = true; tj = tjn; break; }
        if (Math.abs(tjn - tj) < 0.05) { tj = tjn; break; }
        tj = 0.5 * (tj + tjn);
      }
      r.tj = tj; r.runaway = runaway; r.i = id; r.v = vds; r.iIdeal = vs / RL;
      r.rds = P.rds(m, vgs, tj);
      r.pcond = id * vds * D; r.psw = sw.psw; r.pgate = sw.pgate; r.ptot = r.pcond + r.psw;
      Object.assign(r, sw);
      r.ratio = f && vgs > m.vth ? (sw.tdon + sw.ton + sw.tdoff + sw.toff) / T : 0;
      if (vgs <= m.vth) { r.psw = r.pgate = 0; r.ptot = r.pcond; }
      r.ctl = vgs; r.ctlLabel = '|V<sub>GS</sub>|';
      // checks specific to MOSFETs
      if (vgs <= m.vth) add('bad', `|V<sub>GS</sub>| = ${App.num(vgs, 2)} V, eşik ${App.num(m.vth, 1)} V’un altında: MOSFET hiç açılmıyor.`,
        `|V<sub>GS</sub>| = ${App.num(vgs, 2)} V is below the ${App.num(m.vth, 1)} V threshold: the MOSFET never turns on.`);
      else if (vds > 0.1 * vs || id < 0.95 * r.iIdeal) add('bad', `Lineer bölge: ${App.num(vgs, 2)} V gate gerilimi ${App.si(r.iIdeal, 'A')} taşımaya yetmiyor (doyum akımı ≈ ${App.si(P.idsat(m, vgs, tj), 'A')}). V<sub>DS</sub> = ${App.num(vds, 2)} V, parça ısı üretiyor.`,
        `Linear region: ${App.num(vgs, 2)} V of gate drive cannot carry ${App.si(r.iIdeal, 'A')} (saturation current ≈ ${App.si(P.idsat(m, vgs, tj), 'A')}). V<sub>DS</sub> = ${App.num(vds, 2)} V, the part makes heat.`);
      else if (vgs < m.vth + 1.5) add('warn', `|V<sub>GS</sub>| = ${App.num(vgs, 2)} V eşiğe çok yakın: V<sub>GS(th)</sub> parçadan parçaya ±0,5–1 V değişir; en kötü durumda lineer bölgeye düşebilir.`,
        `|V<sub>GS</sub>| = ${App.num(vgs, 2)} V is close to threshold: V<sub>GS(th)</sub> varies ±0.5–1 V between parts; a worst-case part may drop into the linear region.`);
      if (high && c.drive === 'pin' && r.voff > m.vth - 0.3) add('bad', `Pin yüksekken bile |V<sub>GS</sub>| = ${App.num(r.voff, 1)} V (${App.num(vs, 1)} V − ${App.num(vs - r.voff, 1)} V): P-MOS hiç kapanmıyor. Seviye çevirici kullan.`,
        `Even with the pin high |V<sub>GS</sub>| = ${App.num(r.voff, 1)} V (${App.num(vs, 1)} V − ${App.num(vs - r.voff, 1)} V): the P-MOSFET never turns off. Use a level shifter.`);
      const linear = vgs <= m.vth || vds > 0.1 * vs || id < 0.95 * r.iIdeal;
      if (f && !linear) {
        if (sw.stall) add('bad', `Plato gerilimi (${App.num(sw.vpl, 2)} V) sürücü gerilimine çok yakın: gate akımı neredeyse sıfır, geçiş sürmüyor.`,
          `The plateau voltage (${App.num(sw.vpl, 2)} V) is too close to the drive voltage: almost no gate current, the transition stalls.`);
        if (r.ratio > 0.2) add('bad', `Anahtarlama kenarları periyodun %${App.num(r.ratio * 100, 0)}’i: bu frekans için çok yavaş. Gate akımını artır (sürücü IC, küçük R<sub>G</sub>) ya da Q<sub>g</sub>’si küçük parça seç.`,
          `Switching edges take ${App.num(r.ratio * 100, 0)} % of the period: too slow for this frequency. Raise gate current (driver IC, smaller R<sub>G</sub>) or pick a lower-Q<sub>g</sub> part.`);
        else if (r.ratio > 0.04) add('warn', `Anahtarlama kenarları periyodun %${App.num(r.ratio * 100, 1)}’i; anahtarlama kaybı ${App.si(r.psw, 'W')}.`,
          `Switching edges take ${App.num(r.ratio * 100, 1)} % of the period; switching loss ${App.si(r.psw, 'W')}.`);
        if (c.drive === 'pin' && !high) {
          const ipk = r.von / r.ron, s = r.src;
          if (ipk > 2 * s.imax) add('warn', `Gate şarjında pin tepe akımı ≈ ${App.si(ipk, 'A')} (pin sınırı ~${App.si(s.imax, 'A')}): R<sub>G</sub>’yi büyüt ya da sürücü kullan.`,
            `Peak pin current while charging the gate ≈ ${App.si(ipk, 'A')} (pin limit ~${App.si(s.imax, 'A')}): increase R<sub>G</sub> or use a driver.`);
          const iavg = sw.qg * f * 2;
          if (iavg > s.imax * 0.5) add('warn', `Ortalama gate akımı ${App.si(iavg, 'A')}: yüksek frekansta pin bütçesini tüketiyor.`, `Average gate current ${App.si(iavg, 'A')}: at this frequency it eats the pin’s budget.`);
        }
        if (high && c.drive === 'shift' && sw.toff > 5 * sw.ton) add('warn', `Kapanış pull-up direnci (${App.si(c.rpd, 'Ω')}) üzerinden: t<sub>off</sub> ${App.si(sw.toff + sw.tdoff, 's')}, t<sub>on</sub>’dan çok uzun. Yüksek frekansta push-pull high-side sürücü kullan.`,
          `Turn-off goes through the pull-up resistor (${App.si(c.rpd, 'Ω')}): t<sub>off</sub> ${App.si(sw.toff + sw.tdoff, 's')}, far longer than t<sub>on</sub>. At high frequency use a push-pull high-side driver.`);
      }
    }

    function mosSwitch(c, m, r, id, vs, f) {
      const von = Math.max(r.von, 1e-3), ron = r.ron, roff = r.roff, voff = r.voff;
      const ciss = m.ciss * 1e-12;
      const vpl = Math.min(P.vplateau(m, id), von * 0.995);
      const scale = App.clamp(Math.sqrt(Math.max(vs, 1) / (0.8 * m.vds)), 0.3, 1.5);
      const qgd = m.qgd * 1e-9 * scale, qgs2 = 0.6 * m.qgs * 1e-9;
      const igOn = Math.max((von - vpl) / ron, 1e-9);
      const igOff = Math.max((vpl - voff) / roff, 1e-9);
      const tdon = von > m.vth ? ron * ciss * Math.log(von / (von - m.vth)) : 1;
      const tir = qgs2 / igOn, tvf = qgd / igOn, tvr = qgd / igOff, tif = qgs2 / igOff;
      const tdoff = roff * ciss * Math.log(von / Math.max(vpl, 1e-3));
      const qg = Math.max(qgs2 / 0.6 + qgd, m.qg * 1e-9 * von / m.qv);
      const ton = tir + tvf, toff = tvr + tif;
      return {
        vpl, igOn, igOff, tdon, tir, tvf, tvr, tif, tdoff, ton, toff, qg, ciss,
        stall: (von - vpl) < 0.15 && von > m.vth,
        psw: f ? 0.5 * vs * id * (ton + toff) * f : 0,
        pgate: f ? qg * von * f : 0
      };
    }

    function simBjt(c, b, r, add, k) {
      const { vs, RL, D, f, T, high, rth, s } = k;
      const vbe = b.vbe;
      // base current through Rb (+ drive-stage resistance), minus what the B-E resistor steals
      const rb = r.ron;
      let ib = k.inputOk ? (r.von - vbe) / rb - vbe / c.rpd : 0;
      if (high && c.drive === 'pin') ib = Math.max(0, (vs - vbe) / rb - vbe / c.rpd);
      ib = Math.max(ib, 0);
      let ic = 0, vce = vs, sat = false;
      let h = P.hfe(b, vs / RL, c.worst);
      for (let i = 0; i < 40; i++) {
        h = P.hfe(b, ic || vs / RL, c.worst);
        const icSat = Math.max(0, (vs - P.vcesat(b, ic || vs / RL)) / RL);
        if (h * ib >= icSat) { ic = icSat; vce = vs - ic * RL; sat = true; }
        else { ic = h * ib; vce = vs - ic * RL; sat = false; }
      }
      if (vce < 0) vce = 0;
      const od = ic > 0 ? h * ib / ic : 0;
      r.i = ic; r.v = vce; r.ib = ib; r.hfe = h; r.od = od; r.sat = sat; r.iIdeal = vs / RL;
      r.ctl = ib; r.ctlLabel = 'I<sub>B</sub>';
      const tsw = b.tsw * 1e-9; // datasheet rise + fall
      // storage time grows with overdrive (datasheet value is at forced β ≈ 10)
      r.tsw = tsw; r.ts = sat ? b.ts * 1e-9 * App.clamp(Math.log(1 + od) / Math.log(1 + h / 10), 0.3, 3) : 0;
      r.psw = f ? 0.5 * vs * ic * tsw * f : 0;
      r.pgate = (r.von - vbe) * ib * D;
      r.pcond = (vce * ic + vbe * ib) * D;
      r.ptot = r.pcond + r.psw;
      r.tj = c.ta + r.ptot * rth; r.runaway = r.tj > 320;
      r.ratio = f ? (tsw + r.ts + r.tpd * 2) / T : 0;
      if (ib <= 0) add('bad', 'Base akımı yok: transistör açılmıyor.', 'No base current: the transistor does not turn on.');
      else if (!sat) add('bad', `Doyuma girmiyor: β·I<sub>B</sub> = ${App.si(h * ib, 'A')} &lt; ${App.si(r.iIdeal, 'A')}. V<sub>CE</sub> = ${App.num(vce, 2)} V, transistör ısınıyor. R<sub>B</sub>’yi küçült ya da MOSFET kullan.`,
        `Not saturated: β·I<sub>B</sub> = ${App.si(h * ib, 'A')} &lt; ${App.si(r.iIdeal, 'A')}. V<sub>CE</sub> = ${App.num(vce, 2)} V, the transistor heats up. Lower R<sub>B</sub> or use a MOSFET.`);
      else if (od < 2) add('warn', `Overdrive ${App.num(od, 1)}×: doyumda ama payı az (h<sub>FE</sub> sıcaklık ve parçaya göre değişir). Hedef: I<sub>B</sub> ≈ I<sub>C</sub>/10–I<sub>C</sub>/20.`,
        `Overdrive ${App.num(od, 1)}×: saturated but with little margin (h<sub>FE</sub> varies with temperature and part). Aim for I<sub>B</sub> ≈ I<sub>C</sub>/10–I<sub>C</sub>/20.`);
      if (b.darl) add('warn', `Darlington: V<sub>CE(sat)</sub> ≈ ${App.num(vce, 2)} V, iletim kaybı ${App.si(r.pcond, 'W')}. Aynı akımda logic-level MOSFET çok daha serin çalışır.`,
        `Darlington: V<sub>CE(sat)</sub> ≈ ${App.num(vce, 2)} V, conduction loss ${App.si(r.pcond, 'W')}. A logic-level MOSFET runs much cooler at this current.`);
      const ipin = ib + vbe / c.rpd;
      if ((c.drive === 'pin' && !high) && ipin > s.imax) add('bad', `Pin akımı ${App.si(ipin, 'A')} &gt; ~${App.si(s.imax, 'A')}: GPIO aşırı yükleniyor.`, `Pin current ${App.si(ipin, 'A')} &gt; ~${App.si(s.imax, 'A')}: the GPIO is overloaded.`);
      if (high && c.drive === 'pin' && vs > s.vio + 0.4) add('bad', `PNP’nin base’i ${App.num(s.vio, 1)} V’a çıkabiliyor ama emitter ${App.num(vs, 0)} V’ta: transistör hiç kapanmıyor.`,
        `The PNP base only rises to ${App.num(s.vio, 1)} V while the emitter is at ${App.num(vs, 0)} V: the transistor never turns off.`);
      if (f && r.ratio > 0.2) add('bad', `BJT anahtarlama + depolama süresi (${App.si(tsw + r.ts, 's')}) periyodun %${App.num(r.ratio * 100, 0)}’i: bu frekans için fazla yavaş.`,
        `BJT switching + storage time (${App.si(tsw + r.ts, 's')}) is ${App.num(r.ratio * 100, 0)} % of the period: too slow for this frequency.`);
      else if (f && r.ratio > 0.04) add('warn', `Depolama süresi ≈ ${App.si(r.ts, 's')} kapanışı geciktiriyor (görev oranı uzar). Baker kelepçesi veya hızlandırma kondansatörü düşün.`,
        `Storage time ≈ ${App.si(r.ts, 's')} delays turn-off (duty stretches). Consider a Baker clamp or a speed-up capacitor.`);
    }

    /* ================= controls ================= */
    const ctl = root.querySelector('#simCtl');
    const grp = (t, ic) => { const g = App.h('div', { class: 'grp' }); g.innerHTML = `<div class="grp-t">${App.icon(ic)}${t}</div>`; ctl.appendChild(g); return g; };
    const gSrc = grp(L('Kaynak ve sürme', 'Source and drive'), 'chip');
    const gSw = grp(L('Anahtar', 'Switch'), 'mosfet');
    const gLoad = grp(L('Ray ve yük', 'Rail and load'), 'plug');
    const gPwm = grp(L('PWM ve ortam', 'PWM and ambient'), 'square');

    const C = {};
    C.src = UI.segmented(gSrc, { label: L('Mantık kaynağı', 'Logic source'), value: cfg.src,
      options: Object.keys(SRC).map(k => ({ value: k, label: App.lang === 'en' ? SRC[k].nameEn : SRC[k].name })), onChange: v => { cfg.src = v; recompute(); } });
    C.topo = UI.segmented(gSrc, { label: L('Topoloji', 'Topology'), value: cfg.topo,
      options: [{ value: 'low', label: L('Low-side (N)', 'Low-side (N)') }, { value: 'high', label: L('High-side (P)', 'High-side (P)') }],
      onChange: v => { cfg.topo = v; cfg.drive = v === 'high' ? 'shift' : 'pin'; ensurePart(); buildDrive(); rebuild(); } });
    const driveHost = App.h('div'); gSrc.appendChild(driveHost);
    function buildDrive() {
      driveHost.innerHTML = '';
      const opts = cfg.topo === 'low'
        ? [{ value: 'pin', label: L('Doğrudan pin', 'Direct pin') }, { value: 'totem', label: L('BJT totem-pole', 'BJT totem-pole') }, { value: 'driver', label: L('Gate sürücü IC', 'Gate-driver IC') }]
        : [{ value: 'shift', label: L('Seviye çevirici', 'Level shifter') }, { value: 'pin', label: L('Doğrudan pin', 'Direct pin') }, { value: 'driver', label: L('High-side sürücü', 'High-side driver') }];
      C.drive = UI.segmented(driveHost, { label: L('Sürme katı', 'Drive stage'), value: cfg.drive, options: opts, onChange: v => { cfg.drive = v; rebuild(); } });
    }
    buildDrive();
    C.lvl = UI.toggle(gSrc, { label: L('Sürücü girişinde seviye çevirici (ör. 74LVC1T45)', 'Level translator at the driver input (e.g. 74LVC1T45)'), value: cfg.lvl, onChange: v => { cfg.lvl = v; recompute(); } });
    C.vaux = UI.slider(gSrc, { label: L('Sürücü beslemesi', 'Driver supply'), min: 5, max: 15, step: 0.5, value: cfg.vaux, fmt: v => App.num(v, 1) + ' V', onInput: v => { cfg.vaux = v; recompute(); } });

    const selWrap = App.h('div', { class: 'ctl' });
    selWrap.innerHTML = `<label for="simPart"><span>${L('Parça', 'Part')}</span></label><select id="simPart"></select><div class="partcard" id="simPartCard"></div>`;
    gSw.appendChild(selWrap);
    const sel = selWrap.querySelector('select');
    sel.addEventListener('change', () => { cfg.part = sel.value; rebuild(); });
    C.rg = UI.slider(gSw, { label: 'R<sub>G</sub> / R<sub>B</sub>', min: 1, max: 22000, value: cfg.rg, unit: 'Ω', log: true, step: 1, digits: 2, onInput: v => { cfg.rg = v; recompute(); } });
    C.rpd = UI.slider(gSw, { label: L('Pull-down / pull-up', 'Pull-down / pull-up'), min: 100, max: 1e6, value: cfg.rpd, unit: 'Ω', log: true, step: 10, digits: 2, onInput: v => { cfg.rpd = v; recompute(); } });
    C.zener = UI.toggle(gSw, { label: L('Gate zener kelepçesi (10 V, high-side)', 'Gate zener clamp (10 V, high-side)'), value: cfg.zener, onChange: v => { cfg.zener = v; recompute(); } });
    C.worst = UI.toggle(gSw, { label: L('En kötü durum h<sub>FE</sub> (min)', 'Worst-case h<sub>FE</sub> (min)'), value: cfg.worst, onChange: v => { cfg.worst = v; recompute(); } });

    C.rail = UI.segmented(gLoad, { label: L('Ray', 'Rail'), value: cfg.rail,
      options: [{ value: '5', label: '5 V' }, { value: '12', label: L('12 V oto', '12 V auto') }, { value: '24', label: L('24 V endüstri', '24 V industrial') }, { value: 'x', label: L('Serbest', 'Custom') }],
      onChange: v => { cfg.rail = v; if (v !== 'x') { cfg.vsup = +v === 12 ? 13.8 : +v; C.vsup.set(cfg.vsup, true); } recompute(); } });
    C.vsup = UI.slider(gLoad, { label: 'V+', min: 3, max: 36, step: 0.1, value: cfg.vsup, fmt: v => App.num(v, 1) + ' V', onInput: v => { cfg.vsup = v; cfg.rail = 'x'; C.rail.set('x', true); recompute(); } });
    C.load = UI.segmented(gLoad, { label: L('Yük', 'Load'), value: cfg.load,
      options: Object.keys(LOADS).map(k => ({ value: k, label: App.t(LOADS[k]) })), onChange: v => { cfg.load = v; Object.assign(cfg, LOAD_RLC[v]); rebuild(); } });
    C.inom = UI.slider(gLoad, { label: L('Yük akımı (nominal)', 'Load current (nominal)'), min: 0.01, max: 20, value: cfg.inom, unit: 'A', log: true, step: 0.005, onInput: v => { cfg.inom = v; recompute(); } });
    C.fly = UI.toggle(gLoad, { label: L('Flyback diyot', 'Flyback diode'), value: cfg.fly, onChange: v => { cfg.fly = v; rebuild(); } });

    C.dc = UI.toggle(gPwm, { label: L('Sürekli açık (PWM yok)', 'Always on (no PWM)'), value: cfg.dc, onChange: v => { cfg.dc = v; recompute(); } });
    C.f = UI.slider(gPwm, { label: L('PWM frekansı', 'PWM frequency'), min: 100, max: 1e6, value: cfg.f, unit: 'Hz', log: true, step: 1, onInput: v => { cfg.f = v; recompute(); } });
    const fq = App.h('div', { class: 'presets' }); gPwm.appendChild(fq);
    [[1e3, '1 kHz'], [20e3, '20 kHz'], [100e3, '100 kHz'], [500e3, '500 kHz']].forEach(([v, l]) =>
      UI.button(fq, { label: l, onClick: () => { cfg.f = v; cfg.dc = false; C.f.set(v, true); C.dc.set(false, true); recompute(); } }));
    C.duty = UI.slider(gPwm, { label: L('Görev oranı', 'Duty cycle'), min: 0.05, max: 0.95, step: 0.01, value: cfg.duty, fmt: v => App.num(v * 100, 0) + ' %', onInput: v => { cfg.duty = v; recompute(); } });
    C.ta = UI.slider(gPwm, { label: L('Ortam sıcaklığı', 'Ambient temperature'), min: -20, max: 85, step: 1, value: cfg.ta, fmt: v => App.num(v, 0) + ' °C', onInput: v => { cfg.ta = v; recompute(); } });
    C.sink = UI.toggle(gPwm, { label: L('Soğutucu (R<sub>θSA</sub> ≈ 4 °C/W)', 'Heatsink (R<sub>θSA</sub> ≈ 4 °C/W)'), value: cfg.sink, onChange: v => { cfg.sink = v; recompute(); } });
    C.view = UI.segmented(gPwm, { label: L('Osiloskop görünümü', 'Scope view'), value: cfg.view,
      options: [{ value: 'steady', label: L('Kararlı (2 periyot)', 'Steady (2 periods)') }, { value: 'start', label: L('İlk açılış', 'Start-up') },
        { value: 'on', label: L('Açılış kenarı', 'Turn-on edge') }, { value: 'off', label: L('Kapanış kenarı', 'Turn-off edge') }],
      onChange: v => { cfg.view = v; recompute(); } });

    /* ---- 5 · passive parts ---- */
    const gRlc = grp(L('R / L / C bileşenleri', 'R / L / C parts'), 'layers');
    gRlc.style.gridColumn = '1 / -1';
    const rlcGrid = App.h('div', { class: 'rlc-grid' }); gRlc.appendChild(rlcGrid);
    const cell = (title, note) => { const d = App.h('div', { class: 'rlc' }); d.innerHTML = `<div class="rlc-t">${title}</div>${note ? `<div class="rlc-n">${note}</div>` : ''}`; rlcGrid.appendChild(d); return d; };
    const cW = cell(L('Kablo / hat', 'Wiring'), L('Besleme ile yük arasındaki seri R ve L. L, kapanışta L·di/dt sıçraması yapar.', 'Series R and L between supply and load. L makes an L·di/dt spike at turn-off.'));
    C.Rw = UI.slider(cW, { label: 'R<sub>w</sub>', min: 0.001, max: 2, value: cfg.Rw, unit: 'Ω', log: true, step: 0.0005, onInput: v => { cfg.Rw = v; recompute(); } });
    C.Lw = UI.slider(cW, { label: 'L<sub>w</sub>', min: 1e-9, max: 20e-6, value: cfg.Lw, unit: 'H', log: true, step: 1e-9, onInput: v => { cfg.Lw = v; recompute(); } });
    const cB = cell(L('Besleme kondansatörü', 'Supply capacitor'), L('Yükün yanındaki bulk C; hat L’si ile LC oluşturur.', 'Bulk C next to the load; forms an LC with the wiring L.'));
    C.useCbus = UI.toggle(cB, { label: 'C<sub>bus</sub>', value: cfg.useCbus, onChange: v => { cfg.useCbus = v; rebuild(); } });
    C.Cbus = UI.slider(cB, { label: L('değer', 'value'), min: 1e-6, max: 10e-3, value: cfg.Cbus, unit: 'F', log: true, step: 1e-7, onInput: v => { cfg.Cbus = v; recompute(); } });
    const cL = cell(L('Yük endüktansı', 'Load inductance'), L('Bobin, motor sargısı. Akım L/R ile yükselir, kapanışta yol arar.', 'Coil, motor winding. Current rises with L/R and needs a path at turn-off.'));
    C.useLL = UI.toggle(cL, { label: 'L<sub>load</sub>', value: cfg.useLL, onChange: v => { cfg.useLL = v; rebuild(); } });
    C.LL = UI.slider(cL, { label: L('değer', 'value'), min: 1e-6, max: 1, value: cfg.LL, unit: 'H', log: true, step: 1e-7, onInput: v => { cfg.LL = v; recompute(); } });
    const cC = cell(L('Yüke paralel C', 'C across the load'), L('Motor parazit C’si, LED sürücü girişi. Açılışta inrush çeker.', 'Motor noise cap, LED driver input. Draws inrush at turn-on.'));
    C.useCL = UI.toggle(cC, { label: 'C<sub>load</sub>', value: cfg.useCL, onChange: v => { cfg.useCL = v; rebuild(); } });
    C.CL = UI.slider(cC, { label: L('değer', 'value'), min: 1e-9, max: 1e-3, value: cfg.CL, unit: 'F', log: true, step: 1e-10, onInput: v => { cfg.CL = v; recompute(); } });
    const cS = cell(L('RC snubber', 'RC snubber'), L('Anahtarın uçlarında; çınlamayı söndürür, kayıp ekler.', 'Across the switch; damps ringing, adds loss.'));
    C.useSn = UI.toggle(cS, { label: L('snubber', 'snubber'), value: cfg.useSn, onChange: v => { cfg.useSn = v; rebuild(); } });
    C.Rsn = UI.slider(cS, { label: 'R<sub>s</sub>', min: 1, max: 470, value: cfg.Rsn, unit: 'Ω', log: true, step: 0.1, onInput: v => { cfg.Rsn = v; recompute(); } });
    C.Csn = UI.slider(cS, { label: 'C<sub>s</sub>', min: 100e-12, max: 470e-9, value: cfg.Csn, unit: 'F', log: true, step: 1e-12, onInput: v => { cfg.Csn = v; recompute(); } });
    const cT = cell(L('TVS / zener kelepçe', 'TVS / zener clamp'), L('Anahtar gerilimini sınırlar; endüktif enerji onda yanar.', 'Limits the switch voltage; inductive energy burns in it.'));
    C.useTvs = UI.toggle(cT, { label: 'TVS', value: cfg.useTvs, onChange: v => { cfg.useTvs = v; rebuild(); } });
    C.Vtvs = UI.slider(cT, { label: L('kelepçe gerilimi', 'clamp voltage'), min: 5, max: 120, step: 0.5, value: cfg.Vtvs, fmt: v => App.num(v, 1) + ' V', onInput: v => { cfg.Vtvs = v; recompute(); } });
    function syncRlc() {
      ['Rw', 'Lw', 'Cbus', 'LL', 'CL', 'Rsn', 'Csn', 'Vtvs'].forEach(k => C[k].set(cfg[k], true));
      ['useCbus', 'useLL', 'useCL', 'useSn', 'useTvs'].forEach(k => C[k].set(cfg[k], true));
      C.Cbus.el.hidden = !cfg.useCbus; C.LL.el.hidden = !cfg.useLL; C.CL.el.hidden = !cfg.useCL;
      C.Rsn.el.hidden = C.Csn.el.hidden = !cfg.useSn; C.Vtvs.el.hidden = !cfg.useTvs;
    }

    function compatible() {
      const t = cfg.topo === 'low' ? 'N' : 'P';
      return P.all.filter(p => p.type === t);
    }
    function ensurePart() {
      const list = compatible();
      if (!list.find(p => p.id === cfg.part)) cfg.part = (cfg.topo === 'low' ? 'IRLZ44N' : 'AO3401A');
    }
    function fillSelect() {
      const list = compatible();
      const mosL = list.filter(p => p.kind === 'mos'), bjtL = list.filter(p => p.kind === 'bjt');
      const opt = p => `<option value="${p.id}">${p.id} · ${p.pkg} · ${p.vds} V</option>`;
      sel.innerHTML = P.families.map(f => {
        const items = mosL.filter(p => p.fam === f.id);
        return items.length ? `<optgroup label="MOSFET · ${App.t(f)}">${items.map(opt).join('')}</optgroup>` : '';
      }).join('') +
        `<optgroup label="BJT (${cfg.topo === 'low' ? 'NPN' : 'PNP'})">${bjtL.map(p => `<option value="${p.id}">${p.id} · ${p.pkg}</option>`).join('')}</optgroup>`;
      sel.value = cfg.part;
    }

    /* ---------- presets ---------- */
    const PRESETS = [
      { ic: 'fan', tr: '12 V fan', en: '12 V fan', c: { src: 'mcu33', topo: 'low', drive: 'pin', part: 'AO3400A', rail: '12', vsup: 12, load: 'motor', inom: 0.25, fly: true, f: 25000, dc: false, duty: 0.6, rg: 47, rpd: 100000, useCL: false, LL: 3e-3 } },
      { ic: 'led', tr: 'LED şerit 5 A', en: 'LED strip 5 A', c: { src: 'mcu5', topo: 'low', drive: 'pin', part: 'IRLZ44N', rail: '12', vsup: 12, load: 'led', inom: 5, fly: false, f: 1000, dc: false, duty: 0.5, rg: 100, rpd: 10000 } },
      { ic: 'warn', bad: 1, tr: 'Klasik hata: IRF540N', en: 'Classic mistake: IRF540N', c: { src: 'mcu33', topo: 'low', drive: 'pin', part: 'IRF540N', rail: '12', vsup: 12, load: 'led', inom: 3, fly: false, f: 1000, dc: false, duty: 0.5, rg: 100, rpd: 10000 } },
      { ic: 'valve', tr: '24 V valf, 100 kHz', en: '24 V valve, 100 kHz', c: { src: 'fpga18', topo: 'low', drive: 'driver', vaux: 12, part: 'IRLZ44N', rail: '24', vsup: 24, load: 'coil', inom: 1.5, fly: true, f: 100000, dc: false, duty: 0.4, rg: 4.7, rpd: 10000, lvl: true } },
      { ic: 'warn', bad: 1, tr: 'FPGA doğrudan MOSFET', en: 'FPGA straight to MOSFET', c: { src: 'fpga18', topo: 'low', drive: 'pin', part: 'AO3400A', rail: '24', vsup: 24, load: 'coil', inom: 1.5, fly: true, f: 100000, dc: false, duty: 0.4, rg: 22, rpd: 100000 } },
      { ic: 'heater', tr: '24 V ısıtıcı, 100 kHz', en: '24 V heater, 100 kHz', c: { src: 'mcu33', topo: 'low', drive: 'driver', vaux: 12, part: 'IRF540N', rail: '24', vsup: 24, load: 'res', inom: 4, fly: false, f: 100000, dc: false, duty: 0.5, rg: 4.7, rpd: 10000 } },
      { ic: 'relay', tr: '5 V röle (BC547)', en: '5 V relay (BC547)', c: { src: 'mcu33', topo: 'low', drive: 'pin', part: 'BC547B', rail: '5', vsup: 5, load: 'coil', inom: 0.07, fly: true, f: 1000, dc: true, duty: 0.5, rg: 2200, rpd: 47000 } },
      { ic: 'motor', tr: 'Motor 2 A (TIP120)', en: 'Motor 2 A (TIP120)', c: { src: 'mcu5', topo: 'low', drive: 'pin', part: 'TIP120', rail: '12', vsup: 12, load: 'motor', inom: 2, fly: true, f: 1000, dc: false, duty: 0.7, rg: 1000, rpd: 10000 } },
      { ic: 'coil', bad: 1, tr: 'Diyotsuz bobin', en: 'Coil without diode', c: { src: 'mcu33', topo: 'low', drive: 'pin', part: 'AO3400A', rail: '24', vsup: 24, load: 'coil', inom: 0.8, fly: false, f: 1000, dc: false, duty: 0.5, rg: 47, rpd: 100000, Lw: 2e-6, Rw: 0.1, useLL: true, LL: 20e-3, view: 'off' } },
      { ic: 'shield', tr: 'Motor + snubber + TVS', en: 'Motor + snubber + TVS', c: { src: 'mcu5', topo: 'low', drive: 'driver', vaux: 12, part: 'IRLZ44N', rail: '24', vsup: 24, load: 'motor', inom: 3, fly: true, f: 20000, dc: false, duty: 0.5, rg: 10, rpd: 10000, Lw: 1e-6, useSn: true, Rsn: 10, Csn: 4.7e-9, useTvs: true, Vtvs: 40, view: 'off' } },
      { ic: 'car', tr: 'Oto lamba, high-side', en: 'Car lamp, high-side', c: { src: 'mcu33', topo: 'high', drive: 'shift', part: 'IRF4905', rail: '12', vsup: 13.8, load: 'lamp', inom: 1.8, fly: false, f: 200, dc: true, duty: 0.5, rg: 1000, rpd: 10000, zener: true } }
    ];
    const pre = root.querySelector('#simPresets');
    const srcShort = { fpga18: 'FPGA 1V8', fpga33: 'FPGA 3V3', mcu33: 'MCU 3V3', mcu5: 'MCU 5V' };
    pre.innerHTML = PRESETS.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="false">
      <span class="tile${p.bad ? ' bad' : ''}">${App.icon(p.ic)}</span>
      <span><b>${App.t(p)}</b><small>${srcShort[p.c.src]} · ${p.c.part} · ${p.c.dc ? 'DC' : App.si(p.c.f, 'Hz', 3)}</small></span></button>`).join('');
    pre.addEventListener('click', e => {
      const b = e.target.closest('button[data-i]'); if (!b) return;
      pre.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      applyPreset(PRESETS[+b.dataset.i].c);
      if (window.matchMedia('(max-width: 760px)').matches) root.querySelector('#lab-sim').scrollIntoView({ behavior: App.reducedMotion ? 'auto' : 'smooth' });
    });
    function applyPreset(pc) {
      Object.assign(cfg, { vaux: 12, zener: true, sink: false, view: 'steady', lvl: false, Rw: 0.02, Lw: 200e-9, useCbus: true, Cbus: 100e-6, useSn: false, useTvs: false },
        LOAD_RLC[pc.load] || {}, pc);
      C.lvl.set(cfg.lvl, true);
      C.src.set(cfg.src, true); C.topo.set(cfg.topo, true); buildDrive();
      C.vaux.set(cfg.vaux, true); C.rg.set(cfg.rg, true); C.rpd.set(cfg.rpd, true); C.zener.set(cfg.zener, true);
      C.rail.set(cfg.rail, true); C.vsup.set(cfg.vsup, true); C.load.set(cfg.load, true); C.inom.set(cfg.inom, true);
      C.fly.set(cfg.fly, true); C.dc.set(cfg.dc, true); C.f.set(cfg.f, true); C.duty.set(cfg.duty, true);
      C.sink.set(cfg.sink, true); C.view.set(cfg.view, true);
      rebuild();
    }

    /* ================= schematic ================= */
    const schHost = root.querySelector('#simSch');
    let svg = null, flows = [], rotor = null, ledGlow = null, rotA = 0;
    function loadSym(x, y, id) {
      const t = cfg.load;
      if (t === 'led') return Sch.led(x, y, 0, '', id);
      if (t === 'motor') return Sch.motor(x, y, 'M', id);
      if (t === 'coil') return Sch.ind(x, y, 0, L('bobin', 'coil'));
      if (t === 'lamp') return `<g class="sch"><path d="M${x},${y - 30}V${y - 14}M${x},${y + 14}V${y + 30}"/><circle cx="${x}" cy="${y}" r="14" class="load-body"/><path class="thin" d="M${x - 10},${y - 10}L${x + 10},${y + 10}M${x + 10},${y - 10}L${x - 10},${y + 10}"/></g>`;
      return Sch.load(x, y, 0, 'R<tspan font-size="8">L</tspan>');
    }
    function rebuild() {
      ensurePart(); fillSelect(); syncRlc();
      flows.forEach(f => f.stop()); flows = [];
      schHost.innerHTML = '';
      const part = P.get(cfg.part), isM = part.kind === 'mos';
      const low = cfg.topo === 'low';
      const sw = (x, y) => low
        ? (isM ? Sch.nmos(x, y, part.id, { bd: true }) : Sch.npn(x, y, part.id))
        : (isM ? Sch.pmos(x, y, part.id, { bd: true }) : Sch.pnp(x, y, part.id));
      const srcLabel = (App.lang === 'en' ? SRC[cfg.src].nameEn : SRC[cfg.src].name);
      const sl1 = srcLabel.split(' ')[0], sl2 = srcLabel.split(' ').slice(1).join(' ');
      const flyOn = cfg.fly && (LOADS[cfg.load].ind || cfg.useLL);
      const lab = (x, y, s, cls, a) => `<text x="${x}" y="${y}" class="sch-t ${cls || 'muted'}" text-anchor="${a || 'start'}">${s}</text>`;
      // local frame: node A (after the wiring) is the rail at y = 26; the wiring R/L sits above it in the global frame
      let inner = '', loadPath = '', gatePath = '', flyPath = '';
      const rightEnd = cfg.useCbus ? 520 : (cfg.useTvs ? 490 : (cfg.useSn ? 440 : 380));
      const busTop = rightEnd > 380 ? Sch.w([[380, 26], [rightEnd, 26]]) : '';
      const cbus = cfg.useCbus ? Sch.cap(520, 56, 0, '') + Sch.gnd(520, 86) + lab(532, 60, 'C<tspan font-size="8">bus</tspan>') : '';
      // components across the load (between y=ya and y=yb at x=380)
      const across = (ya, yb) => {
        let s = '';
        const ym = (ya + yb) / 2, far = cfg.useCL ? 470 : (flyOn ? 430 : 380);
        if (far > 380) s += Sch.w([[380, ya], [far, ya]]) + Sch.w([[380, yb], [far, yb]]) + Sch.dot(380, ya) + Sch.dot(380, yb);
        if (flyOn) s += Sch.diode(430, ym, 180, '', 'schottky');
        if (flyOn && cfg.useCL) s += Sch.dot(430, ya) + Sch.dot(430, yb);
        if (cfg.useCL) s += Sch.cap(470, ym, 0, '') + lab(482, ym + 4, 'C<tspan font-size="8">L</tspan>');
        return s;
      };
      const loadL = cfg.useLL && cfg.load !== 'coil' ? lab(396, 0, '') : '';
      void loadL;
      if (low) {
        const drvBox = cfg.drive === 'pin' ? '' : Sch.box(120, 160, 60, 50, cfg.drive === 'driver' ? 'DRV' : 'TOTEM', `${App.num(cfg.vaux, 0)} V`);
        const swBus = (cfg.useSn || cfg.useTvs) ? Sch.w([[380, 140], [cfg.useTvs ? 490 : 440, 140]]) + Sch.dot(380, 140) : '';
        inner = `
          ${busTop}${cbus}${Sch.w([[380, 26], [380, 60]])}
          ${loadSym(380, 90, 'simLoad')}${across(60, 120)}
          ${Sch.w([[380, 120], [380, 155]])}${swBus}
          ${sw(360, 185)}
          ${Sch.w([[380, 215], [380, 262]])}${Sch.gnd(380, 262)}
          ${cfg.useSn ? Sch.res(440, 170, 0, '') + Sch.cap(440, 230, 0, '') + Sch.gnd(440, 260) + lab(452, 174, 'R<tspan font-size="8">s</tspan>') + lab(452, 234, 'C<tspan font-size="8">s</tspan>') : ''}
          ${cfg.useTvs ? Sch.diode(490, 185, 180, '', 'zener') + Sch.w([[490, 140], [490, 155]]) + Sch.w([[490, 215], [490, 262]]) + Sch.gnd(490, 262) + lab(502, 189, 'TVS') : ''}
          ${Sch.box(14, 150, 96, 70, sl1, sl2)}
          ${cfg.drive === 'pin' ? Sch.w([[110, 185], [200, 185]], 'sigw') : Sch.w([[110, 185], [120, 185]], 'sigw') + drvBox + Sch.w([[180, 185], [200, 185]], 'sigw')}
          ${Sch.res(230, 185, 90, '')}${lab(230, 170, 'R' + (isM ? 'G' : 'B'), 'sig', 'middle')}
          ${Sch.w([[260, 185], [330, 185]], 'sigw')}${Sch.dot(290, 185)}
          ${Sch.w([[290, 185], [290, 200]])}${Sch.res(290, 230, 0, '')}${Sch.gnd(290, 260)}
          <text id="simVd" x="392" y="150" class="sch-t cu"></text>
          <text id="simVg" x="332" y="168" class="sch-t sig" text-anchor="end"></text>`;
        loadPath = 'M380,26V262'; gatePath = 'M110,185H330'; flyPath = 'M380,120H430V60H380V120';
      } else {
        const shifter = cfg.drive === 'shift';
        const swBus = (cfg.useSn || cfg.useTvs) ? Sch.w([[380, 146], [cfg.useTvs ? 490 : 440, 146]]) + Sch.dot(380, 146) : '';
        inner = `
          ${busTop}${cbus}${Sch.w([[290, 26], [380, 26]])}${Sch.dot(380, 26)}${Sch.w([[380, 26], [380, 56]])}
          ${sw(360, 86)}
          ${Sch.res(290, 56, 0, '')}${lab(276, 60, 'R<tspan font-size="8">PU</tspan>', 'muted', 'end')}
          ${Sch.w([[290, 86], [330, 86]], 'sigw')}${Sch.dot(290, 86)}
          ${cfg.zener ? Sch.w([[290, 86], [250, 86]]) + Sch.diode(250, 56, 180, '', 'zener') + Sch.w([[250, 26], [290, 26]]) : ''}
          ${shifter ? `${Sch.w([[290, 86], [290, 120]], 'sigw')}${Sch.res(290, 150, 0, '')}${lab(276, 154, 'R<tspan font-size="8">G</tspan>', 'sig', 'end')}
            ${Sch.npn(270, 210, '')}${Sch.w([[290, 240], [290, 262]])}${Sch.gnd(290, 262)}
            ${Sch.w([[110, 210], [180, 210]], 'sigw')}${Sch.res(210, 210, 90, '')}
            ${Sch.box(14, 175, 96, 70, sl1, sl2)}`
            : `${Sch.w([[290, 86], [290, 150], [110, 150]], 'sigw')}${Sch.box(14, 115, 96, 70, cfg.drive === 'pin' ? sl1 : 'HS-DRV', cfg.drive === 'pin' ? sl2 : '')}`}
          ${Sch.w([[380, 116], [380, 160]])}${swBus}
          ${cfg.useSn ? Sch.res(440, 56, 0, '') + Sch.cap(440, 116, 0, '') + lab(452, 60, 'R<tspan font-size="8">s</tspan>') + lab(452, 120, 'C<tspan font-size="8">s</tspan>') : ''}
          ${cfg.useTvs ? Sch.w([[490, 26], [490, 56]]) + Sch.diode(490, 86, 180, '', 'zener') + Sch.w([[490, 116], [490, 146]]) + lab(502, 90, 'TVS') : ''}
          ${loadSym(380, 190, 'simLoad')}${across(160, 220)}
          ${Sch.w([[380, 220], [380, 262]])}${Sch.gnd(380, 262)}
          <text id="simVd" x="392" y="140" class="sch-t cu"></text>
          <text id="simVg" x="150" y="72" class="sch-t sig" text-anchor="middle"></text>`;
        loadPath = 'M380,26V262'; gatePath = shifter ? 'M290,86V180' : 'M290,86V150H110'; flyPath = 'M380,220H430V160H380V220';
      }
      // global frame: supply, wiring R and L, then the local frame shifted down by 114
      const lwTxt = App.si(cfg.Lw, 'H', 2), rwTxt = App.si(cfg.Rw, 'Ω', 2);
      const llNote = cfg.useLL ? `<text x="${low ? 404 : 404}" y="${(low ? 90 : 190) + 30}" class="sch-t muted">L ${App.si(cfg.LL, 'H', 2)}</text>` : '';
      const full = `
        ${Sch.vcc(380, 20, App.num(cfg.vsup, 1) + ' V')}
        ${Sch.res(380, 50, 0, '')}${lab(394, 54, 'R<tspan font-size="8">w</tspan> ' + rwTxt)}
        ${Sch.ind(380, 110, 0, '')}${lab(394, 114, 'L<tspan font-size="8">w</tspan> ' + lwTxt)}
        <text x="370" y="136" class="sch-t muted" text-anchor="end">A</text>
        <g id="simLocal" transform="translate(0,114)">${inner}${llNote}</g>`;
      svg = Viz.schematic(schHost, 560, 400, full);
      svg.setAttribute('viewBox', '0 -8 560 404');
      const localG = svg.querySelector('#simLocal');
      flows.push(new Viz.Flow(localG, loadPath, { spacing: 14 }));
      flows.push(new Viz.Flow(localG, gatePath, { cls: 'flow e', spacing: 11, speed: 110 }));
      flows.push(new Viz.Flow(localG, flyPath, { spacing: 12, speed: 60 }));
      flows.push(new Viz.Flow(svg, 'M380,20V140', { spacing: 14 }));
      flows[2].rate = 0;
      rotor = svg.querySelector('#simLoad .rotor');
      ledGlow = svg.querySelector('#simLoad .led-glow');
      recompute();
    }

    /* ================= plots ================= */
    const roHost = root.querySelector('#simRo');
    const ro = UI.readouts(roHost, [
      { key: 'ctl', label: L('Sürme', 'Drive') }, { key: 'i', label: L('Yük akımı', 'Load current') },
      { key: 'v', label: L('Anahtar üzerindeki düşüm', 'Drop across switch') }, { key: 'r', label: 'R<sub>DS(on)</sub> / h<sub>FE</sub>' },
      { key: 'pc', label: L('İletim kaybı', 'Conduction loss') }, { key: 'ps', label: L('Anahtarlama kaybı', 'Switching loss') },
      { key: 'tsw', label: L('Kenar süreleri (açma / kapama)', 'Edge times (on / off)') },
      { key: 'pg', label: L('Gate/base sürme gücü', 'Gate/base drive power') }, { key: 'tj', label: 'T<sub>j</sub>' },
      { key: 'pkv', label: L('Tepe V<sub>DS</sub> (transient)', 'Peak V<sub>DS</sub> (transient)') }, { key: 'pki', label: L('Tepe anahtar akımı', 'Peak switch current') },
      { key: 'dip', label: L('Besleme çökmesi (A)', 'Supply dip (node A)') }, { key: 'pav', label: L('Ortalama anahtar kaybı (transient)', 'Average switch loss (transient)') }
    ]);
    const scope = new Viz.Scope(root.querySelector('#simScope'), {
      w: 720, h: 380, divX: 10, divY: 8,
      channels: [
        { key: 'v', name: 'V DS', color: 'ch1', unit: 'V' },
        { key: 'g', name: 'V GS', color: 'ch2', unit: 'V' },
        { key: 'i', name: L('I anahtar', 'I switch'), color: 'ch3', unit: 'A' },
        { key: 'il', name: L('I yük', 'I load'), color: 'ch4', unit: 'A' }
      ]
    });

    let R = null, wave = null;
    /* Transient solver — backward-Euler time stepping of the power stage.
       States: wiring inductor current iLw, supply node vA (C_bus + 10 nF parasitic), load inductor current iLL,
       load capacitor voltage vCL, snubber capacitor vCs, switch node vB (C_oss), gate node vG (C_gs, C_gd).
       At every step the switch-node voltage is found by bisection on its KCL (the residual is monotonic in vB).
       High-side P-type circuits are solved in the mirrored frame (voltages measured from the supply rail),
       which is the same circuit, so all voltages are reported as magnitudes. */
    function waveform(r) {
      const part = r.part, isM = part.kind === 'mos';
      const vs = cfg.vsup, RL = r.RL;
      const T = r.f ? r.T : 0, D = r.D;
      const LL = cfg.useLL ? cfg.LL : 0, CL = cfg.useCL ? cfg.CL : 0;
      const Rw = Math.max(cfg.Rw, 1e-4), Lw = Math.max(cfg.Lw, 1e-9), CA = (cfg.useCbus ? cfg.Cbus : 0) + 10e-9;
      const Rs = cfg.useSn ? cfg.Rsn : 0, Cs = cfg.useSn ? cfg.Csn : 0;
      const BV = isM ? part.vds * 1.15 : part.vce * 1.3; // avalanche / breakdown
      const Vcl = cfg.useTvs ? Math.min(cfg.Vtvs, BV) : BV;
      const fly = cfg.fly && (LOADS[cfg.load].ind || LL > 0);
      // device capacitances
      let Cgd = 0, Cgs = 0, Coss = 50e-12;
      if (isM) {
        const scale = App.clamp(Math.sqrt(Math.max(vs, 1) / (0.8 * part.vds)), 0.3, 1.5);
        Cgd = Math.max(part.qgd * 1e-9 * scale / Math.max(vs, 1), 1e-12);
        Cgs = Math.max(part.ciss * 1e-12 - Cgd, 0.3 * part.ciss * 1e-12);
        Coss = 0.35 * part.ciss * 1e-12;
      }
      const tj = r.tj || 25;
      // time window
      const edge = isM ? Math.max(r.tdon + r.ton, r.tdoff + r.toff, 20e-9) : (r.tsw + r.ts + r.tpd);
      const tauL = LL > 0 ? LL / RL : 0;
      const settle = Math.max(5 * tauL, 20 * Math.sqrt(Lw * CA), 1e-6);
      const dcOffAt = Math.max(0.5e-3, settle);
      const tOffEdge = T ? D * T : dcOffAt;
      let t0, t1;
      // edge window long enough for the switch-node capacitance (C_load + snubber + C_oss) to swing the rail
      const cNode = CL + Cs + Coss, slew = cNode * vs / Math.max(r.iIdeal, 1e-3);
      const wEdge = Math.max(edge * 4, 60e-9, slew * 3);
      if (cfg.view === 'on') { const w = wEdge; t0 = -0.15 * w; t1 = w; }
      else if (cfg.view === 'off') { const w = wEdge; t0 = tOffEdge - 0.15 * w; t1 = t0 + w * 1.15; }
      else if (cfg.view === 'start') { t0 = -0.05 * (T ? 10 * T : 2e-3); t1 = T ? 10 * T : Math.max(2e-3, 3 * settle); }
      else { t0 = 0; t1 = T ? 2 * T : 1e-3; }
      const dcOff = !T && cfg.view === 'off';
      // drive signal (true = command on), measured from the first on-edge at t = 0
      const cmd = t => {
        if (!T) return dcOff ? (t >= 0 && t < dcOffAt) : t >= 0;
        if (t < 0 && cfg.view === 'start') return false;
        const tp = ((t % T) + T) % T;
        return tp < D * T;
      };
      // coarse pre-roll so inductors and capacitors reach their periodic state before the recorded window
      let tPre = t0;
      if (cfg.view !== 'start') {
        if (T) tPre = Math.min(t0, -Math.min(Math.max(3 * T, settle), 400 * T)) + (t0 > 0 ? 0 : 0);
        else tPre = dcOff ? 0 : t0;
        if (T) tPre = Math.floor(tPre / T) * T;
      }
      // initial state: off and settled, or (steady view) pre-rolled
      let iLw = 0, vA = vs, iLL = 0, vCL = 0, vB = vs, vG = r.voff || 0, vCs = vs, ibE = 0, offSince = 1;
      if (T && cfg.view !== 'start' && LL > 0 && fly) { iLL = D * (vs / RL); vB = vs + 0.45; }
      const Npre = tPre < t0 ? 8000 : 0;
      const dtPre = Npre ? (t0 - tPre) / Npre : 0;
      const N = cfg.view === 'start' ? 30000 : (cfg.view === 'steady' ? 30000 : 8000);
      const dtWin = (t1 - t0) / N;
      let dt = dtPre || dtWin;
      const ib0 = r.ib || 0, hfe = r.hfe || 100, tauB = Math.max((r.tsw || 1e-7) / 2, 5e-9), ts = r.ts || 0;
      const vsat = isM ? 0 : P.vcesat(part, Math.max(r.i, 1e-3));
      const swI = (vg, vb, ib) => {
        if (vb < 0) return -Math.max(0, -vb - 0.6) / 0.02;           // body / substrate diode
        if (isM) return P.idOf(part, vg, vb, tj);
        const imax = hfe * ib;
        if (imax <= 0) return 0;
        const rsat = Math.max(vsat / Math.max(r.i, 1e-3), 0.01);
        return imax * Math.tanh(vb / (rsat * imax));
      };
      // recording (min/max per bucket so spikes are not lost)
      const M = 900, out = { g: [], v: [], i: [], il: [], va: [] };
      const bucket = Math.max(1, Math.floor(N / M));
      let bk = 0, bVmax = -1e9, bImax = 0, bImaxAbs = -1;
      let pk = { v: 0, i: 0, va: vs, iw: 0 }, E = 0, Ecl = 0, Etime = 0;
      let t = tPre;
      for (let n = 0; n <= Npre + N; n++) {
        if (n < Npre) { t = tPre + n * dtPre; dt = dtPre; } else { t = t0 + (n - Npre) * dtWin; dt = dtWin; }
        const on = cmd(t - r.tpd);
        // --- supply node A (BE on the 2×2 L–C system, load current from last step)
        const iload = iLL + CL * 0 + 0; // placeholder replaced below
        void iload;
        const iLoadPrev = out._iLoad || 0;
        const k1 = 1 + dt * Rw / Lw + dt * dt / (Lw * CA);
        const iLwN = (iLw + dt / Lw * (vs - vA + dt / CA * iLoadPrev)) / k1;
        const vAN = vA + dt / CA * (iLwN - iLoadPrev);
        // --- drive
        let vdrv, Rg;
        if (isM) { vdrv = on ? r.von : (r.voff || 0); Rg = on ? r.ron : r.roff; }
        else {
          if (on) { ibE += (ib0 - ibE) * Math.min(1, dt / tauB); offSince = 0; }
          else { offSince += dt; if (offSince > ts) ibE += (0 - ibE) * Math.min(1, dt / tauB); }
          vdrv = on ? r.von : 0; Rg = 1;
        }
        const Cg = Cgs + Cgd;
        const gateOf = vb => isM ? (Cg / dt * vG + Cgd / dt * (vb - vB) + vdrv / Rg) / (Cg / dt + 1 / Rg) : vdrv;
        const resid = vb => {
          const vg = gateOf(vb);
          const igd = isM ? Cgd * ((vb - vg) - (vB - vG)) / dt : 0;
          const iLLn = LL > 0 ? (iLL + dt / LL * (vAN - vb)) / (1 + dt * RL / LL) : (vAN - vb) / RL;
          const iCL = CL * ((vAN - vb) - vCL) / dt;
          const idio = fly ? Math.max(0, vb - vAN - 0.45) / 0.02 : 0;
          const isn = Rs ? (vb - vCs) / (Rs + dt / Cs) : 0;
          const ioss = Coss * (vb - vB) / dt;
          const isw = swI(vg, vb, ibE);
          const icl = Math.max(0, vb - Vcl) / 0.05;
          return iLLn + iCL - idio - isn - ioss - isw - icl - igd;
        };
        let lo = -3, hi = Vcl + vs + 30;
        for (let k = 0; k < 48; k++) { const mid = (lo + hi) / 2; if (resid(mid) > 0) lo = mid; else hi = mid; }
        const vBN = (lo + hi) / 2, vGN = gateOf(vBN);
        const iLLN = LL > 0 ? (iLL + dt / LL * (vAN - vBN)) / (1 + dt * RL / LL) : (vAN - vBN) / RL;
        const iCLn = CL * ((vAN - vBN) - vCL) / dt;
        const idio = fly ? Math.max(0, vBN - vAN - 0.45) / 0.02 : 0;
        const isw = swI(vGN, vBN, ibE);
        const icl = Math.max(0, vBN - Vcl) / 0.05;
        const isn = Rs ? (vBN - vCs) / (Rs + dt / Cs) : 0;
        // commit
        iLw = iLwN; vA = vAN; iLL = iLLN; vCL = vAN - vBN; if (Rs) vCs += dt * isn / Cs; vB = vBN; vG = vGN;
        out._iLoad = iLL + iCLn - idio;
        if (t >= t0) {
          E += vBN * isw * dt; Ecl += vBN * icl * dt; Etime += dt;
          pk.v = Math.max(pk.v, vBN); pk.i = Math.max(pk.i, Math.abs(isw)); pk.va = Math.min(pk.va, vAN); pk.iw = Math.max(pk.iw, Math.abs(iLwN));
          if (vBN > bVmax) bVmax = vBN;
          if (Math.abs(isw) > bImaxAbs) { bImaxAbs = Math.abs(isw); bImax = isw; }
          if (++bk >= bucket) {
            out.g.push([t, isM ? vGN : vdrv]); out.v.push([t, bVmax]); out.i.push([t, bImax]);
            out.il.push([t, iLL]); out.va.push([t, vAN]);
            bk = 0; bVmax = -1e9; bImaxAbs = -1;
          }
        }
      }
      delete out._iLoad;
      const avgP = Etime ? (E + Ecl) / Etime : 0;
      return { t0, t1, origin: cfg.view === 'off' ? tOffEdge : 0, pts: out, spike: pk.v, pk, avgP, Ecl, BV, Vcl, dt: dtWin };
    }
    function fmtT(t0, t1, origin) {
      const span = t1 - t0;
      const u = span < 2e-6 ? [1e-9, 'ns'] : span < 2e-3 ? [1e-6, 'µs'] : [1e-3, 'ms'];
      return v => App.num((v - (origin || 0)) / u[0], span / u[0] < 10 ? 1 : 0) + ' ' + u[1];
    }
    function drawScope() {
      const w = wave, isM = R.kind === 'mos';
      const shift = w.origin || 0;
      const sh = pts => pts.map(p => [p[0] - shift, p[1]]);
      const vmax = Math.max(cfg.vsup, w.spike, 0.5);
      const gmax = Math.max(R.von || 0, ...w.pts.g.map(p => p[1]), 0.5);
      const imax = Math.max(R.i, w.pk.i, ...w.pts.il.map(p => p[1]), 1e-3);
      const imin = Math.min(0, ...w.pts.i.map(p => p[1]));
      scope.setChannel('v', { name: isM ? 'V DS' : 'V CE' });
      scope.setChannel('g', { name: isM ? 'V GS' : 'V IN' });
      scope.fit('v', 0, vmax, 0.4, 3.85, true);
      scope.fit('g', 0, gmax, -1.4, 0.2, true);
      scope.fit('i', imin, imax, -3.85, -1.7, true);
      scope.ch.il.scale = scope.ch.i.scale; scope.ch.il.pos = scope.ch.i.pos;   // same scale → comparable
      scope.o.t0 = w.t0 - shift; scope.o.tdiv = (w.t1 - w.t0) / 10; scope.o.trig = 0;
      const viewName = { steady: L('KARARLI', 'STEADY'), start: L('AÇILIŞ', 'START-UP'), on: L('AÇILIŞ KENARI', 'TURN-ON EDGE'), off: L('KAPANIŞ KENARI', 'TURN-OFF EDGE') }[cfg.view];
      scope.status(viewName);
      scope.meas = [
        { label: 'Vpk', value: App.num(w.pk.v, 1) + ' V', color: 'ch1' },
        { label: 'Ipk', value: App.si(w.pk.i, 'A', 3), color: 'ch3' }
      ];
      scope.ch.il.hidden = !cfg.useLL && !LOADS[cfg.load].ind;   // load current = switch current for resistive loads
      scope.drawLabels();
      scope.trace('v', sh(w.pts.v)); scope.trace('g', sh(w.pts.g));
      scope.trace('i', sh(w.pts.i)); scope.trace('il', sh(w.pts.il));
      const rating = isM ? R.part.vds : R.part.vce;
      scope.level('bv', 'v', rating <= vmax * 1.6 ? rating : null, 'bad', (isM ? 'V DS max ' : 'V CEO ') + rating + ' V');
      if (isM && R.vpl && R.f) scope.level('pl', 'g', R.vpl, 'ch2', L('plato ', 'plateau ') + App.num(R.vpl, 2) + ' V'); else scope.level('pl', 'g', null);
    }

    /* ================= sweep ================= */
    const swLab = root.querySelector('#lab-sweep');
    const swFig = swLab.querySelector('.lab-fig'), swCtl = swLab.querySelector('.lab-ctl');
    const pS = new Viz.Plot(swFig, { w: 620, h: 330, x: [100, 1e6], y: [1e-3, 100], logX: true, logY: true, xLabel: 'f (Hz)', yLabel: 'P (W)' });
    let sweepX = 'f';
    UI.segmented(swCtl, { label: L('Değişen parametre', 'Swept parameter'), value: 'f',
      options: [{ value: 'f', label: L('Frekans', 'Frequency') }, { value: 'rg', label: 'R<sub>G</sub>/R<sub>B</sub>' }, { value: 'vio', label: L('Mantık gerilimi', 'Logic voltage') }, { value: 'inom', label: L('Yük akımı', 'Load current') }],
      onChange: v => { sweepX = v; drawSweep(); } });
    const swRo = UI.readouts(swCtl, [{ key: 'pmax', label: L('İzin verilen kayıp', 'Allowed loss') }, { key: 'fmax', label: L('Bu kayıpla en yüksek f', 'Highest f at that loss') }, { key: 'best', label: L('En kötü etken', 'Dominant term') }]);
    swCtl.insertAdjacentHTML('beforeend', `<div class="legend"><span><i style="background:var(--copper)"></i>${L('toplam', 'total')}</span><span><i style="background:var(--ch1)"></i>${L('iletim', 'conduction')}</span><span><i style="background:var(--signal)"></i>${L('anahtarlama', 'switching')}</span><span><i style="background:var(--accent)"></i>${L('gate sürme (sürücüde)', 'gate drive (in driver)')}</span></div>`);

    function drawSweep() {
      const part = P.get(cfg.part);
      const ranges = { f: [100, 1e6, true, 'f (Hz)'], rg: [1, 22000, true, 'R (Ω)'], vio: [1.5, 5.5, false, L('V_IO (V)', 'V_IO (V)')], inom: [0.01, 20, true, 'I (A)'] };
      const [a, b, lg, lab] = ranges[sweepX];
      const pts = { t: [], c: [], s: [], g: [] };
      const N = 60;
      for (let i = 0; i <= N; i++) {
        const x = lg ? a * Math.pow(b / a, i / N) : a + (b - a) * i / N;
        const c2 = Object.assign({}, cfg);
        if (sweepX === 'f') { c2.f = x; c2.dc = false; }
        if (sweepX === 'rg') c2.rg = x;
        if (sweepX === 'vio') c2.vioOverride = x;
        if (sweepX === 'inom') c2.inom = x;
        const r = sim(c2, part);
        const cap = v => Math.max(v, 1e-4);
        pts.t.push([x, cap(r.ptot)]); pts.c.push([x, cap(r.pcond)]); pts.s.push([x, cap(r.psw)]); pts.g.push([x, cap(r.pgate)]);
      }
      const ymax = Math.max(1, ...pts.t.map(p => p[1])) * 2;
      pS.o.logX = lg; pS.o.xLabel = lab;
      pS.o.xFmt = sweepX === 'vio' ? (v => App.num(v, 1)) : null;
      pS.setRange({ x: [a, b], y: [1e-4, Math.min(ymax, 1e4)] });
      pS.line('g', pts.g, 'acc thin'); pS.line('c', pts.c, 'ch1'); pS.line('s', pts.s, 'sig'); pS.line('t', pts.t, 'cu');
      const rth = (cfg.sink && part.rthjc) ? part.rthjc + 4.5 : part.rthja;
      const pmax = (part.tj - cfg.ta) / rth;
      pS.hline('pm', pmax, 'bad'); pS.text('pmT', a, pmax, L('izin verilen kayıp', 'allowed loss'), 'bad', 'start', 4, -5);
      const cur = { f: cfg.dc ? null : cfg.f, rg: cfg.rg, vio: srcOf(cfg).vio, inom: cfg.inom }[sweepX];
      if (cur != null) { pS.vline('cur', cur, 'acc solid'); pS.hide('cur', false); } else pS.hide('cur', true);
      swRo.set('pmax', App.si(pmax, 'W'));
      if (sweepX === 'f') {
        const over = pts.t.find(p => p[1] > pmax);
        swRo.set('fmax', over ? '≈ ' + App.si(over[0], 'Hz') : '> 1 MHz', over && cfg.f > over[0] ? 'bad' : 'ok');
      } else swRo.set('fmax', '—');
      const r = R;
      const dom = r.psw > r.pcond ? L('anahtarlama', 'switching') : L('iletim', 'conduction');
      swRo.set('best', dom, r.psw > r.pcond ? 'warn' : '');
    }

    /* ================= comparison table ================= */
    const cmp = root.querySelector('#simCmp');
    function drawCmp() {
      const rows = compatible().map(p => ({ p, r: sim(cfg, p) }));
      const rank = { ok: 0, warn: 1, bad: 2 };
      rows.sort((a, b) => rank[a.r.verdict] - rank[b.r.verdict] || a.r.ptot - b.r.ptot);
      cmp.innerHTML = `<thead><tr><th>${L('Parça', 'Part')}</th><th>${L('Kılıf', 'Package')}</th><th class="num">${L('Sürme', 'Drive')}</th><th class="num">${L('Akım', 'Current')}</th><th class="num">${L('Düşüm', 'Drop')}</th><th class="num">${L('Kayıp', 'Loss')}</th><th class="num">T<sub>j</sub></th><th class="num">${L('Kenar/periyot', 'Edge/period')}</th><th>${L('Sonuç', 'Verdict')}</th></tr></thead><tbody>` +
        rows.map(({ p, r }) => `<tr data-id="${p.id}" class="${p.id === cfg.part ? 'sel' : ''}">
          <td><b>${p.id}</b> <span class="muted small">${p.kind === 'mos' ? App.t(P.families.find(f => f.id === p.fam) || { tr: 'MOSFET', en: 'MOSFET' }) : 'BJT'}</span></td><td>${p.pkg}</td>
          <td class="num">${p.kind === 'mos' ? App.num(r.vgs, 2) + ' V' : App.si(r.ib, 'A')}</td>
          <td class="num">${App.si(r.i, 'A')}</td><td class="num">${App.num(r.v, 2)} V</td>
          <td class="num">${App.si(r.ptot, 'W')}</td><td class="num">${r.runaway ? '&gt; 300' : App.num(r.tj, 0)} °C</td>
          <td class="num">${r.f ? App.num(r.ratio * 100, 1) + ' %' : '—'}</td>
          <td><span class="pill ${r.verdict}">${r.verdict === 'ok' ? L('uygun', 'fits') : r.verdict === 'warn' ? L('dikkat', 'caution') : L('olmaz', 'fails')}</span></td></tr>`).join('') + '</tbody>';
    }
    cmp.addEventListener('click', e => {
      const tr = e.target.closest('tr[data-id]'); if (!tr) return;
      cfg.part = tr.dataset.id; rebuild();
      root.querySelector('#lab-sim').scrollIntoView({ behavior: App.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });

    /* ================= recompute ================= */
    function recompute() {
      const part = P.get(cfg.part);
      R = sim(cfg, part);
      const isM = part.kind === 'mos';
      root.querySelector('#simTitle').innerHTML = `${App.lang === 'en' ? SRC[cfg.src].nameEn : SRC[cfg.src].name} → ${part.id} → ${App.num(cfg.vsup, 1)} V ${App.t(LOADS[cfg.load]).toLowerCase()} · ${cfg.dc ? 'DC' : App.si(cfg.f, 'Hz')}`;
      root.querySelector('#simPartCard').innerHTML = `${App.t(part.note)}<div class="specs">${isM
        ? `V<sub>DS</sub> ${part.vds} V · I<sub>D</sub> ${part.id_} A · V<sub>th</sub> ≈ ${App.num(part.vth, 1)} V · V<sub>GS(max)</sub> ±${part.vgsMax} V<br>R<sub>DS(on)</sub> ${part.p.map(([v, r]) => App.si(r, 'Ω') + ' @ ' + App.num(v, 1) + ' V').join(', ')} · Q<sub>g</sub> ${part.qg} nC · Q<sub>gd</sub> ${part.qgd} nC · C<sub>iss</sub> ${part.ciss} pF<br>R<sub>θJA</sub> ${part.rthja} °C/W${part.rthjc ? ' · R<sub>θJC</sub> ' + part.rthjc + ' °C/W' : ''}`
        : `V<sub>CEO</sub> ${part.vce} V · I<sub>C</sub> ${part.ic} A · h<sub>FE</sub> ${part.hmin}–${part.htyp}+ @ ${App.si(part.iref, 'A')}<br>V<sub>CE(sat)</sub> ≈ ${App.num(P.vcesat(part, part.ic / 2), 2)} V @ ${App.si(part.ic / 2, 'A')} · V<sub>BE(sat)</sub> ≈ ${App.num(part.vbe, 2)} V · t<sub>s</sub> ≈ ${part.ts} ns<br>R<sub>θJA</sub> ${part.rthja} °C/W${part.rthjc ? ' · R<sub>θJC</sub> ' + part.rthjc + ' °C/W' : ''}`}</div>`;
      C.zener.el.hidden = cfg.topo !== 'high';
      C.worst.el.hidden = isM;
      C.vaux.el.hidden = cfg.drive === 'pin' || cfg.drive === 'shift' || cfg.topo === 'high';
      C.lvl.el.hidden = !(cfg.topo === 'low' && cfg.drive === 'driver');
      C.f.el.style.opacity = cfg.dc ? .45 : 1; C.duty.el.style.opacity = cfg.dc ? .45 : 1;
      // readouts
      ro.set('ctl', isM ? App.num(R.vgs, 2) + ' V (|V<sub>GS</sub>|)' : App.si(R.ib, 'A') + ' (I<sub>B</sub>)', isM ? (R.vgs > part.vth + 1.5 ? 'ok' : 'warn') : (R.sat ? 'ok' : 'bad'));
      ro.set('i', App.si(R.i, 'A') + (R.i < 0.95 * R.iIdeal ? ' / ' + App.si(R.iIdeal, 'A') : ''), R.i < 0.95 * R.iIdeal ? 'bad' : '');
      ro.set('v', App.num(R.v, 3) + ' V', R.v > 0.1 * cfg.vsup ? 'bad' : '');
      ro.set('r', isM ? App.si(R.rds, 'Ω') + ' @ ' + App.num(R.tj, 0) + ' °C' : 'h<sub>FE</sub> ' + App.num(R.hfe, 0) + ' · ' + L('overdrive', 'overdrive') + ' ' + App.num(R.od, 1) + '×');
      ro.set('pc', App.si(R.pcond, 'W'));
      ro.set('ps', R.f ? App.si(R.psw, 'W') : '—', R.psw > R.pcond && R.f ? 'warn' : '');
      ro.set('tsw', isM ? (R.f || cfg.view !== 'steady' ? App.si(R.tdon + R.ton, 's') + ' / ' + App.si(R.tdoff + R.toff, 's') : '—') : App.si(R.tsw / 2 + R.tpd, 's') + ' / ' + App.si(R.ts + R.tsw / 2, 's'));
      ro.set('pg', App.si(R.pgate, 'W'));
      ro.set('tj', (R.runaway ? '&gt; 300' : App.num(R.tj, 0)) + ' °C', R.tj > part.tj ? 'bad' : R.tj > part.tj - 40 ? 'warn' : 'ok');
      root.querySelector('#simVerdicts').innerHTML = R.chk.map(c => `<li class="${c.lvl}">${App.icon({ ok: 'check', warn: 'warn', bad: 'x' }[c.lvl])}<span>${App.lang === 'en' ? c.en : c.tr}</span></li>`).join('');
      scheduleWave();
      const vd = svg && svg.querySelector('#simVd'), vg = svg && svg.querySelector('#simVg');
      if (vd) vd.textContent = (isM ? 'V_DS ' : 'V_CE ') + App.num(R.v, 2) + ' V';
      if (vg) vg.textContent = isM ? 'V_GS ' + App.num(R.vgs, 1) + ' V' : 'I_B ' + App.si(R.ib, 'A');
      drawSweep(); drawCmp(); bottlenecks();
    }
    // the time-domain solve is the slow part: run it once the sliders settle
    let waveTimer = 0, firstWave = true;
    function scheduleWave() {
      clearTimeout(waveTimer);
      const run = () => {
        const r = R;
        wave = waveform(r);
        transientChecks(r, wave);
        root.querySelector('#simVerdicts').innerHTML = r.chk.map(c => `<li class="${c.lvl}">${App.icon({ ok: 'check', warn: 'warn', bad: 'x' }[c.lvl])}<span>${App.lang === 'en' ? c.en : c.tr}</span></li>`).join('');
        drawScope();
      };
      if (firstWave) { firstWave = false; run(); } else waveTimer = setTimeout(run, 90);
    }
    App.onCleanup(() => clearTimeout(waveTimer));

    // checks that only the time-domain simulation can see
    function transientChecks(r, w) {
      const part = r.part, isM = part.kind === 'mos';
      const rating = isM ? part.vds : part.vce, vs = cfg.vsup;
      const add = (lvl, tr, en) => r.chk.push({ lvl, tr, en });
      if (r.chk.length === 1 && r.chk[0].lvl === 'ok') r.chk.length = 0;
      if (w.pk.v > rating * 1.01) add('bad', `Transient: V<sub>${isM ? 'DS' : 'CE'}</sub> ${App.num(w.pk.v, 1)} V’a sıçrıyor (sınır ${rating} V). Hat endüktansı (L<sub>w</sub>), yük L’si ya da kelepçe eksikliği. Flyback diyot, TVS veya snubber ekle; C<sub>bus</sub>’ı anahtara yaklaştır.`,
        `Transient: V<sub>${isM ? 'DS' : 'CE'}</sub> spikes to ${App.num(w.pk.v, 1)} V (rating ${rating} V). Wiring inductance (L<sub>w</sub>), load L or a missing clamp. Add a flyback diode, TVS or snubber; move C<sub>bus</sub> closer to the switch.`);
      else if (w.pk.v > vs * 1.25 && w.pk.v > vs + 3) add('warn', `Transient: kapanışta ${App.num(w.pk.v, 1)} V tepe (ray ${App.num(vs, 1)} V). Pay: %${App.num((1 - w.pk.v / rating) * 100, 0)}.`,
        `Transient: ${App.num(w.pk.v, 1)} V peak at turn-off (rail ${App.num(vs, 1)} V). Margin: ${App.num((1 - w.pk.v / rating) * 100, 0)} %.`);
      const idm = isM ? part.id_ * 4 : part.ic * 2;
      if (w.pk.i > idm) add('bad', `Transient: anahtar akımı ${App.si(w.pk.i, 'A')} tepe yapıyor (darbe sınırı ≈ ${App.si(idm, 'A')}). C<sub>load</sub> inrush’ı ya da snubber deşarjı olabilir.`,
        `Transient: switch current peaks at ${App.si(w.pk.i, 'A')} (pulse limit ≈ ${App.si(idm, 'A')}). Likely C<sub>load</sub> inrush or snubber discharge.`);
      else if (w.pk.i > r.iIdeal * 2 && w.pk.i > 0.1) add('warn', `Transient: açılışta ${App.si(w.pk.i, 'A')} akım tepesi (nominalin ${App.num(w.pk.i / r.iIdeal, 1)} katı).`,
        `Transient: ${App.si(w.pk.i, 'A')} current peak at turn-on (${App.num(w.pk.i / r.iIdeal, 1)}× nominal).`);
      if (w.pk.va < vs * 0.9) add('warn', `Besleme düğümü ${App.num(w.pk.va, 2)} V’a çöküyor (%${App.num((1 - w.pk.va / vs) * 100, 0)}). Aynı raydaki MCU resetlenebilir; C<sub>bus</sub>’ı büyüt ya da hat direncini azalt.`,
        `The supply node dips to ${App.num(w.pk.va, 2)} V (${App.num((1 - w.pk.va / vs) * 100, 0)} %). An MCU on the same rail may reset; enlarge C<sub>bus</sub> or cut wiring resistance.`);
      if (w.Ecl > 0 && cfg.view === 'steady' && r.f) { const pcl = w.Ecl / (w.t1 - w.t0); if (pcl > 0.01) add(cfg.useTvs ? 'warn' : 'bad', `Kelepçe/avalanche her periyotta enerji yutuyor: ≈ ${App.si(pcl, 'W')}.`, `The clamp/avalanche absorbs energy every period: ≈ ${App.si(pcl, 'W')}.`); }
      if (!r.chk.length) add('ok', 'Bu koşullarda tasarım sağlıklı görünüyor.', 'The design looks healthy under these conditions.');
      r.verdict = r.chk.some(x => x.lvl === 'bad') ? 'bad' : r.chk.some(x => x.lvl === 'warn') ? 'warn' : 'ok';
      ro.set('pkv', App.num(w.pk.v, 1) + ' V', w.pk.v > rating ? 'bad' : w.pk.v > vs * 1.25 && w.pk.v > vs + 3 ? 'warn' : 'ok');
      ro.set('pki', App.si(w.pk.i, 'A'), w.pk.i > idm ? 'bad' : '');
      ro.set('dip', App.num(w.pk.va, 2) + ' V', w.pk.va < vs * 0.9 ? 'warn' : '');
      ro.set('pav', cfg.view === 'steady' ? App.si(w.avgP, 'W') : '—');
    }

    function bottlenecks() {
      const r = R, part = r.part, out = [];
      if (part.kind === 'mos') {
        out.push(L(`Sürücü: ${App.num(r.von, 2)} V, toplam direnç ${App.si(r.ron, 'Ω')} → plato sırasında gate akımı ${App.si(r.igOn || 0, 'A')}.`,
          `Driver: ${App.num(r.von, 2)} V through ${App.si(r.ron, 'Ω')} total → gate current during the plateau ${App.si(r.igOn || 0, 'A')}.`));
        out.push(L(`Plato gerilimi ≈ ${App.num(r.vpl || 0, 2)} V (V<sub>th</sub> + √(2·a·I<sub>D</sub>)); sürücüyle arasındaki pay ${App.num(Math.max(0, r.von - (r.vpl || 0)), 2)} V. Bu pay küçüldükçe kenarlar uzar.`,
          `Plateau ≈ ${App.num(r.vpl || 0, 2)} V (V<sub>th</sub> + √(2·a·I<sub>D</sub>)); headroom to the driver ${App.num(Math.max(0, r.von - (r.vpl || 0)), 2)} V. Less headroom, longer edges.`));
        out.push(L(`Q<sub>gd</sub> (bu raya ölçeklenmiş) ${App.si(part.qgd * 1e-9 * App.clamp(Math.sqrt(Math.max(cfg.vsup, 1) / (0.8 * part.vds)), 0.3, 1.5), 'C')} → V<sub>DS</sub> geçişi ${App.si(r.tvf || 0, 's')}.`,
          `Q<sub>gd</sub> (scaled to this rail) ${App.si(part.qgd * 1e-9 * App.clamp(Math.sqrt(Math.max(cfg.vsup, 1) / (0.8 * part.vds)), 0.3, 1.5), 'C')} → V<sub>DS</sub> transition ${App.si(r.tvf || 0, 's')}.`));
      } else {
        out.push(L(`BJT’de hız sınırı depolama süresi: overdrive ${App.num(r.od || 0, 1)}× → t<sub>s</sub> ≈ ${App.si(r.ts || 0, 's')}.`, `For the BJT the limit is storage time: overdrive ${App.num(r.od || 0, 1)}× → t<sub>s</sub> ≈ ${App.si(r.ts || 0, 's')}.`));
      }
      if (r.f) out.push(L(`Periyot ${App.si(r.T, 's')}; kenarlar bunun %${App.num(r.ratio * 100, 1)}’i.`, `Period ${App.si(r.T, 's')}; edges take ${App.num(r.ratio * 100, 1)} % of it.`));
      root.querySelector('#simBneck').innerHTML = out.map(s => `<li>${s}</li>`).join('');
    }

    /* ================= animation ================= */
    let u = 0, lastG = 0, gateKick = 0, flyKick = 0;
    App.onFrame(dt => {
      if (!wave) return;
      u = (u + dt / 4) % 1;
      const n = Math.floor(u * (wave.pts.i.length - 1));
      const t = wave.pts.i[n][0];
      scope.cursor(t - (wave.origin || 0));
      const iFrac = wave.pts.i[n][1] / Math.max(R.iIdeal, 1e-6);
      const ilFrac = wave.pts.il[n][1] / Math.max(R.iIdeal, 1e-6);
      flows[0] && (flows[0].rate = App.clamp(iFrac, 0, 1.5));
      flows[3] && (flows[3].rate = App.clamp(Math.max(iFrac, 0), 0, 1.5));
      const g = wave.pts.g[n][1];
      if (Math.abs(g - lastG) > 0.3 * Math.max(R.von, 0.5)) { gateKick = 0.35; flows[1].dir = g > lastG ? 1 : -1; if (g < lastG && LOADS[cfg.load].ind && cfg.fly) flyKick = 1; }
      lastG = g;
      gateKick = Math.max(0, gateKick - dt); flyKick = Math.max(0, flyKick - dt * 1.2);
      if (flows[1]) flows[1].rate = gateKick > 0 ? 1.5 : 0;
      if (flows[2]) flows[2].rate = cfg.fly ? App.clamp(ilFrac - Math.max(iFrac, 0), 0, 1.5) : 0;
      void flyKick;
      const avg = R.iIdeal ? R.i / R.iIdeal * (cfg.dc ? 1 : cfg.duty) : 0;
      if (rotor && !App.reducedMotion) { rotA = (rotA + dt * 720 * avg) % 360; const c = rotor.closest('.motor').querySelector('circle'); rotor.setAttribute('transform', `rotate(${rotA.toFixed(1)} ${c.getAttribute('cx')} ${c.getAttribute('cy')})`); }
      if (ledGlow) ledGlow.style.opacity = (cfg.dc ? iFrac : Math.min(1, avg * 1.3)).toFixed(2);
    });

    ensurePart();
    rebuild();
  }
});
