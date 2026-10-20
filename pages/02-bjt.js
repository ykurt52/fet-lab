/* 02 — How a BJT works: inside the NPN, NPN vs PNP, beta, output characteristics with load line */
App.page({
  id: 'bjt',
  num: '02',
  group: { tr: 'Temeller', en: 'Fundamentals' },
  title: { tr: 'BJT nasıl çalışır?', en: 'How does a BJT work?' },
  blurb: { tr: 'Base akımı, β, kesim/aktif/doyum ve yük doğrusu.', en: 'Base current, β, cutoff/active/saturation and the load line.' },
  summary: {
    tr: 'BJT akım kontrollü bir elemandır: küçük bir base akımı β kat büyük bir collector akımına izin verir. Anahtar olarak kullanırken onu aktif bölgede değil, doyumda tutarız.',
    en: 'A BJT is current-controlled: a small base current permits a collector current β times larger. As a switch, we keep it in saturation, not in the active region.'
  },
  render(L) {
    return `
      ${App.keys([
        L('BJT’yi gerilimle değil, base direnci üzerinden akımla sür.', 'Drive a BJT with current through a base resistor, not a voltage.'),
        L('Anahtar ya kesimde ya doyumda olmalı; aktif bölge ısıtır.', 'A switch lives in cutoff or saturation; the active region heats it.'),
        L('Doyum için I<sub>B</sub> ≈ I<sub>C</sub> / 10 seç (zorlanmış β = 10).', 'For saturation choose I<sub>B</sub> ≈ I<sub>C</sub> / 10 (forced β = 10).'),
        L('h<sub>FE</sub> geniş bir aralıktır: minimum değerle hesap yap.', 'h<sub>FE</sub> is a wide range: design with the minimum.'),
        L('NPN yükün altında, PNP yükün üstünde kullanılır.', 'NPN goes below the load, PNP above it.')
      ])}

      <h2>${L('Üç katman, iki jonksiyon', 'Three layers, two junctions')}</h2>
      <p>${L('Base–emitter ≈ 0,6–0,7 V ile açılınca collector akımı akar. Base akımı bunun yalnızca küçük bir kısmıdır.',
             'Once base–emitter is forward-biased at ≈ 0.6–0.7 V, collector current flows. Base current is only a small part of it.')}</p>
      <ul>
        <li>${L('NPN = yoğun katkılı <b>emitter</b> (n+), çok ince <b>base</b> (p), geniş <b>collector</b> (n).', 'NPN = heavily doped <b>emitter</b> (n+), very thin <b>base</b> (p), wide <b>collector</b> (n).')}</li>
        <li>${L('İleri kutuplanan emitter, base’e elektron enjekte eder.', 'The forward-biased emitter injects electrons into the base.')}</li>
        <li>${L('Base ince olduğu için elektronların çoğu collector’a kapılır.', 'The base is thin, so most electrons are swept into the collector.')}</li>
        <li>${L('Base’de birleşen küçük kısım base akımıdır.', 'The few that recombine in the base form the base current.')}</li>
      </ul>
      ${App.lab('lab-npn', L('NPN’in içi: V<sub>BE</sub>’yi artır', 'Inside the NPN: raise V<sub>BE</sub>'), {
        foot: L('Mavi noktalar elektronlardır; akışları geleneksel akımın tersidir. Devre: V<sub>CC</sub> = 5 V, R<sub>C</sub> = 1 kΩ, β = 150. V<sub>BE</sub> ≈ 0,72 V’un üstünde I<sub>C</sub> 5 mA’de durur: doyum.',
                'Blue dots are electrons, flowing opposite to conventional current. Circuit: V<sub>CC</sub> = 5 V, R<sub>C</sub> = 1 kΩ, β = 150. Above V<sub>BE</sub> ≈ 0.72 V, I<sub>C</sub> stops at ~5 mA: saturation.')
      })}

      <div class="eq">I<sub>C</sub> ≈ I<sub>S</sub> · e<sup>V<sub>BE</sub>/V<sub>T</sub></sup> &nbsp;&nbsp; I<sub>B</sub> = I<sub>C</sub> / β &nbsp;&nbsp; I<sub>E</sub> = I<sub>C</sub> + I<sub>B</sub>
        <span class="note">${L('V<sub>T</sub> ≈ 26 mV (25 °C). V<sub>BE</sub> her 60 mV arttığında akım 10 kat büyür. Bu yüzden BJT bir direnç üzerinden <b>akımla</b> sürülür.',
                       'V<sub>T</sub> ≈ 26 mV (25 °C). Every 60 mV more V<sub>BE</sub> multiplies the current by 10. That is why a BJT is driven with <b>current</b> through a resistor.')}</span></div>

      <div class="call warn"><strong>${L('Base’i doğrudan GPIO’ya bağlama', 'Never tie the base straight to a GPIO')}</strong>
        ${L('Base–emitter bir diyottur. Doğrudan 3,3 V verirsen akımı hiçbir şey sınırlamaz: pin aşırı yüklenir, transistör ısınır. Her zaman seri base direnci kullan.',
            'Base–emitter is a diode. Apply 3.3 V directly and nothing limits the current: the pin is overloaded and the transistor heats up. Always use a series base resistor.')}</div>

      <h2>${L('NPN ve PNP: akım yönleri', 'NPN and PNP: current directions')}</h2>
      <p>${L('NPN yükün <b>altında</b> (low-side), PNP yükün <b>üstünde</b> (high-side) kullanılır. Sembol üzerindeki ok emitter’daki akım yönünü gösterir.',
             'NPNs sit <b>below</b> the load (low-side), PNPs <b>above</b> it (high-side). The arrow on the symbol shows current direction at the emitter.')}</p>
      <ul>
        <li>${L('NPN: ok dışarı, akım emitter’dan çıkar.', 'NPN: arrow out, current leaves the emitter.')}</li>
        <li>${L('PNP: ok içeri, akım emitter’a girer.', 'PNP: arrow in, current enters the emitter.')}</li>
      </ul>
      ${App.figure('fig-pol', L('NPN ve PNP’de akımlar', 'Currents in NPN and PNP'), {
        foot: L('NPN’i açmak için base’i emitter’ın ~0,7 V <b>üstüne</b> çek. PNP’yi açmak için base’i emitter’ın ~0,7 V <b>altına</b> çek. PNP’nin base akımı base’den <b>dışarı</b> akar.',
                'To turn an NPN on, pull the base ~0.7 V <b>above</b> the emitter. To turn a PNP on, pull it ~0.7 V <b>below</b> the emitter. A PNP’s base current flows <b>out</b> of the base.')
      })}

      <h2>${L('β (h<sub>FE</sub>) sabit değildir', 'β (h<sub>FE</sub>) is not a constant')}</h2>
      <p>${L('Anahtar tasarımında <b>minimum</b> h<sub>FE</sub> ile hesap yap ve pay ekle. Datasheet onu geniş bir aralık olarak verir; BC547B için 200–450.',
             'For switching, design with the <b>minimum</b> h<sub>FE</sub> and add margin. Datasheets give it as a wide range; 200–450 for the BC547B.')}</p>
      <ul>
        <li>${L('Akımla, sıcaklıkla ve parçadan parçaya değişir.', 'It varies with current, temperature and from part to part.')}</li>
        <li>${L('Yüksek akımda belirgin düşer.', 'It drops noticeably at high current.')}</li>
      </ul>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Parça', 'Part')}</th><th class="num">I<sub>C(max)</sub></th><th class="num">V<sub>CEO</sub></th><th class="num">h<sub>FE</sub> ${L('(tipik koşul)', '(typ. condition)')}</th><th class="num">V<sub>CE(sat)</sub></th></tr></thead>
        <tbody>
          <tr><td>BC547B (NPN)</td><td class="num">100 mA</td><td class="num">45 V</td><td class="num">200–450 @ 2 mA</td><td class="num">${L('0,2 V', '0.2 V')} @ 100 mA/5 mA</td></tr>
          <tr><td>2N3904 (NPN)</td><td class="num">200 mA</td><td class="num">40 V</td><td class="num">100–300 @ 10 mA</td><td class="num">${L('0,2 V', '0.2 V')} @ 10 mA/1 mA</td></tr>
          <tr><td>2N2222A (NPN)</td><td class="num">600 mA</td><td class="num">40 V</td><td class="num">100–300 @ 150 mA</td><td class="num">${L('0,3 V', '0.3 V')} @ 150 mA/15 mA</td></tr>
          <tr><td>BC327 (PNP)</td><td class="num">800 mA</td><td class="num">45 V</td><td class="num">100–630 @ 100 mA</td><td class="num">${L('0,7 V', '0.7 V')} @ 500 mA/50 mA</td></tr>
          <tr><td>BD139 (NPN, ${L('güç', 'power')})</td><td class="num">${L('1,5 A', '1.5 A')}</td><td class="num">80 V</td><td class="num">40–250 @ 150 mA</td><td class="num">${L('0,5 V', '0.5 V')} @ 500 mA/50 mA</td></tr>
        </tbody></table></div>
      <p class="muted small">${L('Tipik datasheet değerleri; üreticiye ve gruba göre değişir. V<sub>CE(sat)</sub> hep bir I<sub>C</sub>/I<sub>B</sub> oranında verilir, çoğunlukla 10.',
        'Typical datasheet values; they vary by vendor and gain group. V<sub>CE(sat)</sub> is always given at a forced I<sub>C</sub>/I<sub>B</sub> ratio, usually 10.')}</p>

      <h2>${L('Çıkış karakteristiği ve yük doğrusu', 'Output characteristics and the load line')}</h2>
      <p>${L('Çalışma noktası Q, yük doğrusunun I<sub>B</sub> eğrisini kestiği yerdir. Her eğri sabit bir I<sub>B</sub> için I<sub>C</sub>–V<sub>CE</sub> ilişkisidir.',
             'The operating point Q is where the load line crosses the I<sub>B</sub> curve. Each curve is I<sub>C</sub> vs V<sub>CE</sub> at a fixed I<sub>B</sub>.')}</p>
      <div class="eq">V<sub>CE</sub> = V<sub>CC</sub> − I<sub>C</sub> · R<sub>C</sub>
        <span class="note">${L('Yük doğrusu: devrenin transistöre izin verdiği tüm noktalar.', 'Load line: every point the circuit allows the transistor.')}</span></div>
      ${App.lab('lab-out', L('I<sub>C</sub>–V<sub>CE</sub> eğrileri, yük doğrusu, Q noktası', 'I<sub>C</sub>–V<sub>CE</sub> curves, load line, Q point'), {
        foot: L('Anahtarda Q ya sol üstte (doyum: düşük V<sub>CE</sub>, düşük kayıp) ya sağ altta (kesim: I<sub>C</sub> ≈ 0) olmalı. Ortada, aktif bölgede, transistör V<sub>CE</sub>·I<sub>C</sub> kadar ısınır.',
                'In a switch, Q sits upper-left (saturation: low V<sub>CE</sub>, low loss) or lower-right (cutoff: I<sub>C</sub> ≈ 0). In the middle, the active region, it dissipates V<sub>CE</sub>·I<sub>C</sub>.')
      })}

      <h2>${L('Üç bölge', 'Three regions')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>${L('Bölge', 'Region')}</th><th>B–E</th><th>B–C</th><th>${L('Davranış', 'Behaviour')}</th><th>${L('Kullanım', 'Used for')}</th></tr></thead>
        <tbody>
          <tr><td><span class="pill">${L('Kesim', 'Cutoff')}</span></td><td>${L('ters / &lt; 0,5 V', 'reverse / &lt; 0.5 V')}</td><td>${L('ters', 'reverse')}</td><td>I<sub>C</sub> ≈ 0 ${L('(nA–µA kaçak)', '(nA–µA leakage)')}</td><td>${L('Anahtar KAPALI', 'Switch OFF')}</td></tr>
          <tr><td><span class="pill warn">${L('Aktif', 'Active')}</span></td><td>${L('ileri ≈ 0,65 V', 'forward ≈ 0.65 V')}</td><td>${L('ters', 'reverse')}</td><td>I<sub>C</sub> = β·I<sub>B</sub></td><td>${L('Yükselteç; anahtarda kaçınılır', 'Amplifier; avoided in switches')}</td></tr>
          <tr><td><span class="pill ok">${L('Doyum', 'Saturation')}</span></td><td>${L('ileri ≈ 0,75–0,9 V', 'forward ≈ 0.75–0.9 V')}</td><td>${L('ileri', 'forward')}</td><td>I<sub>C</sub> &lt; β·I<sub>B</sub>, V<sub>CE</sub> = V<sub>CE(sat)</sub></td><td>${L('Anahtar AÇIK', 'Switch ON')}</td></tr>
        </tbody></table></div>
      <div class="call tip"><strong>${L('Zorlanmış β (forced beta)', 'Forced beta')}</strong>
        ${L('Doyumda I<sub>C</sub>’yi yük belirler, transistör değil. I<sub>C</sub>/I<sub>B</sub> oranına zorlanmış β denir. Güvenli doyum için 10–20 seç; hesabı Bölüm 05’te yapıyoruz.',
            'In saturation the load sets I<sub>C</sub>, not the transistor. The ratio I<sub>C</sub>/I<sub>B</sub> is the forced beta. Choose 10–20 for reliable saturation; Chapter 05 works it out.')}</div>
      ${App.example({
        given: [[L('Yük akımı', 'Load current'), 'I<sub>C</sub> = 100 mA'], ['β<sub>forced</sub>', '10'], ['h<sub>FE(min)</sub>', '100']],
        steps: [
          [L('Gereken base akımı', 'Required base current'), 'I<sub>B</sub> = 100 mA / 10', '10 mA'],
          [L('Aktif bölgede yeterli olan', 'Enough in the active region'), 'I<sub>B</sub> = 100 mA / 100', '1 mA', L('bu sınırda transistör doyuma girmez', 'at this edge the transistor does not saturate')]
        ],
        result: L('<b>Base’e 10 mA ver, 1 mA değil.</b> 10 kat fazla base akımı, h<sub>FE</sub> düşse bile doyumu garanti eder.', '<b>Feed the base 10 mA, not 1 mA.</b> Ten times the minimum keeps it saturated even if h<sub>FE</sub> drops.')
      })}

      <h3>${L('Sıcaklık etkisi', 'Temperature')}</h3>
      <ul>
        <li>${L('V<sub>BE</sub> ≈ <b>−2 mV/°C</b> kayar: sıcak transistör daha düşük gerilimde açılır.', 'V<sub>BE</sub> drifts ≈ <b>−2 mV/°C</b>: a hot transistor turns on at a lower voltage.')}</li>
        <li>${L('β sıcaklıkla artar. Paralel BJT’lerde ısınan daha çok akım çeker; emitter direnci olmadan paralelleme.', 'β rises with temperature. In paralleled BJTs the hotter one hogs current; never parallel them without emitter resistors.')}</li>
        <li>${L('Kesim kaçağı I<sub>CBO</sub> her ~10 °C’de ikiye katlanır. Base pull-down direnci onu güvenle boşaltır.', 'Cutoff leakage I<sub>CBO</sub> doubles every ~10 °C. A base pull-down resistor drains it safely.')}</li>
      </ul>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch, UI } = Viz, L = App.L;

    /* ---------------- Lab 1: inside the NPN ---------------- */
    {
      const lab = root.querySelector('#lab-npn');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const W = 600, H = 250;
      const svg = Viz.schematic(fig, W, H, `
        <rect x="60" y="40" width="170" height="120" class="layer n" />
        <rect x="230" y="40" width="44" height="120" class="layer p" />
        <rect x="274" y="40" width="250" height="120" class="layer n2" />
        <text x="145" y="32" class="sch-t big" text-anchor="middle">${L('Emitter (n+)', 'Emitter (n+)')}</text>
        <text x="252" y="32" class="sch-t big" text-anchor="middle">${L('Base (p)', 'Base (p)')}</text>
        <text x="399" y="32" class="sch-t big" text-anchor="middle">${L('Collector (n)', 'Collector (n)')}</text>
        ${Sch.w([[20, 100], [60, 100]])}<text x="16" y="94" class="sch-t" text-anchor="end">E</text>
        ${Sch.w([[524, 100], [580, 100]])}<text x="584" y="94" class="sch-t">C</text>
        ${Sch.w([[252, 160], [252, 215]], 'sigw')}<text x="262" y="214" class="sch-t sig">B</text>
        <text id="npnIc" x="560" y="128" class="sch-t cu" text-anchor="end"></text>
        <text id="npnIb" x="262" y="196" class="sch-t sig"></text>
        <text id="npnReg" x="300" y="240" class="sch-t big" text-anchor="middle"></text>
      `);
      // electron paths: emitter → collector (most), emitter → base → out (few)
      const eFlows = [60, 80, 100, 120, 140].map(y =>
        new Viz.Flow(svg, `M70,${y}H515`, { cls: 'flow e', spacing: 22, speed: 80, r: 2.4 }));
      const bFlow = new Viz.Flow(svg, 'M70,110H245V215', { cls: 'flow e', spacing: 22, speed: 80, r: 2.4 });
      const plotBox = App.h('div'); fig.appendChild(plotBox);
      const p = new Viz.Plot(plotBox, {
        w: 600, h: 220, x: [0.4, 0.85], y: [0, 6.5],
        xLabel: 'V_BE (V)', yLabel: 'I_C (mA)', xFmt: v => App.num(v, 2), yFmt: v => App.num(v, 0)
      });
      const Is = 1e-14, Vt = 0.026, beta = 150, Vcc = 5, Rc = 1000;
      const icMax = (Vcc - 0.1) / Rc;
      p.line('act', Viz.sample(v => Is * Math.exp(v / Vt) * 1e3, 0.4, 0.85, 200), 'faint dash');
      p.hline('max', icMax * 1e3, 'bad');
      p.text('maxT', 0.42, icMax * 1e3, L('yük sınırı (V_CC/R_C)', 'load limit (V_CC/R_C)'), 'bad', 'start', 0, -6);
      p.text('actT', 0.75, 6.1, L('β·I_B (sınırsız olsaydı)', 'β·I_B (if unlimited)'), 'muted', 'end');
      const ro = UI.readouts(ctl, [
        { key: 'ib', label: 'I<sub>B</sub>' }, { key: 'ic', label: 'I<sub>C</sub>' },
        { key: 'vce', label: 'V<sub>CE</sub>' }, { key: 'bf', label: 'I<sub>C</sub>/I<sub>B</sub>' }, { key: 'reg', label: L('Bölge', 'Region') }
      ]);
      const icOf = vbe => {
        const ia = Is * Math.exp(vbe / Vt);
        // smooth min(ia, icMax)
        return Math.pow(Math.pow(ia, -4) + Math.pow(icMax, -4), -1 / 4);
      };
      p.line('real', Viz.sample(v => icOf(v) * 1e3, 0.4, 0.85, 200), 'cu');
      const s = UI.slider(ctl, {
        label: 'V<sub>BE</sub>', min: 0, max: 0.82, step: 0.005, value: 0.66, fmt: v => App.num(v, 3) + ' V',
        onInput: update
      });
      ctl.insertBefore(s.el, ro.el);
      function update() {
        const vbe = s.value;
        const ia = Is * Math.exp(vbe / Vt);
        const ic = icOf(vbe);
        const ib = ia / beta;
        const vce = Vcc - ic * Rc;
        const region = ia < 1e-6 ? 'cut' : (ia > icMax * 1.15 ? 'sat' : 'act');
        ro.set('ib', App.si(ib, 'A'));
        ro.set('ic', App.si(ic, 'A'));
        ro.set('vce', App.num(Math.max(vce, 0.08), 2) + ' V');
        ro.set('bf', ib > 0 ? App.num(ic / ib, 0) : '—', region === 'sat' ? 'ok' : '');
        ro.set('reg', region === 'cut' ? L('Kesim', 'Cutoff') : region === 'act' ? L('Aktif', 'Active') : L('Doyum', 'Saturation'),
          region === 'sat' ? 'ok' : region === 'act' ? 'warn' : '');
        const rate = Math.min(1.6, ic / icMax * 1.4);
        eFlows.forEach(f => { f.rate = rate; });
        bFlow.rate = ic > 1e-6 ? Math.min(1.6, 0.25 + (region === 'sat' ? 1 : rate * 0.4)) : 0;
        svg.querySelector('#npnIc').textContent = 'I_C = ' + App.si(ic, 'A');
        svg.querySelector('#npnIb').textContent = 'I_B = ' + App.si(ib, 'A');
        const rg = svg.querySelector('#npnReg');
        rg.textContent = region === 'cut' ? L('KESİM: jonksiyon açılmadı', 'CUTOFF: junction not open') :
          region === 'act' ? L('AKTİF: I_C = β · I_B', 'ACTIVE: I_C = β · I_B') : L('DOYUM: I_C’yi yük sınırlıyor', 'SATURATION: the load limits I_C');
        rg.setAttribute('class', 'sch-t big ' + (region === 'sat' ? 'ok' : region === 'act' ? 'cu' : 'muted'));
        p.dot('q', vbe, ic * 1e3);
      }
      update();
    }

    /* ---------------- Figure: NPN vs PNP currents ---------------- */
    {
      const fig = root.querySelector('#fig-pol .lab-fig');
      const svg = Viz.schematic(fig, 600, 230, `
        ${Sch.npn(150, 115, 'NPN')}
        ${Sch.w([[60, 115], [120, 115]], 'sigw')}
        ${Sch.w([[170, 40], [170, 85]])}${Sch.w([[170, 145], [170, 195]])}
        <text x="60" y="105" class="sch-t sig">I_B →</text>
        <text x="180" y="52" class="sch-t cu">I_C ↓</text>
        <text x="180" y="190" class="sch-t cu">I_E = I_C + I_B ↓</text>
        <text x="150" y="222" class="sch-t muted" text-anchor="middle">V_B ≈ V_E + 0,7 V</text>
        ${Sch.pnp(450, 115, 'PNP')}
        ${Sch.w([[360, 115], [420, 115]], 'sigw')}
        ${Sch.w([[470, 40], [470, 85]])}${Sch.w([[470, 145], [470, 195]])}
        <text x="360" y="105" class="sch-t sig">← I_B</text>
        <text x="480" y="52" class="sch-t cu">I_E ↓</text>
        <text x="480" y="190" class="sch-t cu">I_C ↓</text>
        <text x="450" y="222" class="sch-t muted" text-anchor="middle">V_B ≈ V_E − 0,7 V</text>
      `);
      const f1 = new Viz.Flow(svg, 'M170,40V195', { spacing: 14 });
      const f2 = new Viz.Flow(svg, 'M60,115H120', { cls: 'flow e', spacing: 14, speed: 40 });
      const f3 = new Viz.Flow(svg, 'M470,40V195', { spacing: 14 });
      const f4 = new Viz.Flow(svg, 'M420,115H360', { cls: 'flow e', spacing: 14, speed: 40 });
      void f1; void f2; void f3; void f4;
    }

    /* ---------------- Lab 2: output characteristics ---------------- */
    {
      const lab = root.querySelector('#lab-out');
      const fig = lab.querySelector('.lab-fig'), ctl = lab.querySelector('.lab-ctl');
      const beta = 150;
      const p = new Viz.Plot(fig, {
        w: 600, h: 360, x: [0, 12], y: [0, 60],
        xLabel: 'V_CE (V)', yLabel: 'I_C (mA)', xFmt: v => App.num(v, 0), yFmt: v => App.num(v, 0)
      });
      const ibs = [50e-6, 100e-6, 150e-6, 200e-6, 250e-6, 300e-6, 350e-6];
      p.rect('satR', 0, 0, 0.3, 60, 'ok');
      p.text('satT', 0.35, 57, L('doyum', 'saturation'), 'ok');
      p.text('cutT', 11.8, 1.6, L('kesim', 'cutoff'), 'muted', 'end');
      ibs.forEach((ib, i) => {
        p.line('c' + i, Viz.sample(v => Viz.phys.bjtIc(ib, v, beta) * 1e3, 0, 12, 160), 'faint');
        p.text('ct' + i, 11.9, Viz.phys.bjtIc(ib, 12, beta) * 1e3, App.si(ib, 'A', 2), 'muted', 'end', 0, -4);
      });
      const ro = UI.readouts(ctl, [
        { key: 'ic', label: 'I<sub>C</sub>' }, { key: 'vce', label: 'V<sub>CE</sub>' },
        { key: 'p', label: L('Kayıp', 'Dissipation') + ' P = V<sub>CE</sub>·I<sub>C</sub>' }, { key: 'reg', label: L('Bölge', 'Region') }
      ]);
      const sIb = UI.slider(ctl, { label: 'I<sub>B</sub>', min: 0, max: 400e-6, step: 5e-6, value: 150e-6, unit: 'A', onInput: update });
      const sVcc = UI.slider(ctl, { label: 'V<sub>CC</sub>', min: 3, max: 12, step: 0.5, value: 12, fmt: v => App.num(v, 1) + ' V', onInput: update });
      const sRc = UI.slider(ctl, { label: 'R<sub>C</sub> (' + L('yük', 'load') + ')', min: 150, max: 2000, step: 10, value: 330, unit: 'Ω', log: true, onInput: update });
      ctl.append(ro.el);
      function update() {
        const ib = sIb.value, vcc = sVcc.value, rc = sRc.value;
        p.line('cur', Viz.sample(v => Viz.phys.bjtIc(ib, v, beta) * 1e3, 0, 12, 200), 'sig');
        p.line('ll', [[0, vcc / rc * 1e3], [vcc, 0]], 'cu');
        // solve Vce = Vcc - Ic(Vce)*Rc by bisection
        let a = 0, b = vcc;
        for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (vcc - Viz.phys.bjtIc(ib, m, beta) * rc - m > 0) a = m; else b = m; }
        const vce = (a + b) / 2, ic = (vcc - vce) / rc;
        p.dot('q', vce, ic * 1e3);
        p.text('qT', vce, ic * 1e3, 'Q', 'cu big', 'start', 8, -8);
        const region = ib <= 0 ? 'cut' : vce < 0.35 ? 'sat' : 'act';
        ro.set('ic', App.si(ic, 'A'));
        ro.set('vce', App.num(vce, 2) + ' V');
        const P = vce * ic;
        ro.set('p', App.si(P, 'W'), P > 0.5 ? 'bad' : P > 0.15 ? 'warn' : 'ok');
        ro.set('reg', region === 'cut' ? L('Kesim', 'Cutoff') : region === 'act' ? L('Aktif — ısınıyor', 'Active — heating') : L('Doyum', 'Saturation'),
          region === 'sat' ? 'ok' : region === 'act' ? 'warn' : '');
      }
      update();
    }
  }
});
