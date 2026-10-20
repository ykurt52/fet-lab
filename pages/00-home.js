/* 00 — Home: hero animation (MCU pin → MOSFET → LED), roadmap, BJT vs MOSFET at a glance */
App.page({
  id: 'home',
  num: '00',
  group: { tr: 'Başlangıç', en: 'Start' },
  title: { tr: 'Bir pin, bir transistör, bir yük', en: 'One pin, one transistor, one load' },
  summary: {
    tr: 'Mikrodenetleyici pini en fazla birkaç on miliamper verir; motor, LED şerit, röle ya da ısıtıcı ise amperler ister. Aradaki köprü bir transistördür. Bu laboratuvar, o köprüyü doğru kurmak için gereken her hesabı canlı şemalar ve grafiklerle gösterir.',
    en: 'A microcontroller pin gives a few tens of milliamps at most; a motor, LED strip, relay or heater wants amps. The bridge between them is a transistor. This lab shows every calculation you need to build that bridge, with live schematics and plots.'
  },
  render(L) {
    return `
      ${App.figure('hero', L('GPIO bir MOSFET’i sürüyor', 'A GPIO pin drives a MOSFET'), {
        foot: L('Pembe noktalar yük akımını (geleneksel yön), camgöbeği noktalar gate şarj/deşarj akımını gösterir. Gate akımı yalnızca geçişlerde akar; MOSFET iletimdeyken gate’e sürekli akım gitmez.',
                'Pink dots show load current (conventional direction), cyan dots show gate charge/discharge current. Gate current only flows during transitions; an ON MOSFET draws no steady gate current.')
      })}

      <h2>${L('Bu laboratuvarda ne var?', 'What is in this lab?')}</h2>
      <p>${L('Bölümler sırayla birbirinin üstüne kurulur: önce yükü tanı, sonra anahtarı seç, sonra onu doğru sür, en son koru. Her bölümde kaydırıcılarla oynayabileceğin en az bir deney paneli var.',
             'Chapters build on each other: know the load, pick the switch, drive it properly, then protect it. Every chapter has at least one lab panel you can play with using sliders.')}</p>
      <div id="roadmap"></div>

      <h2>${L('BJT mi, MOSFET mi? İlk bakış', 'BJT or MOSFET? First look')}</h2>
      <div class="table-wrap"><table>
        <thead><tr><th></th><th>BJT (NPN/PNP)</th><th>MOSFET (N/P)</th></tr></thead>
        <tbody>
          <tr><td>${L('Kontrol', 'Controlled by')}</td><td>${L('Base <b>akımı</b> (I<sub>B</sub>)', 'Base <b>current</b> (I<sub>B</sub>)')}</td><td>${L('Gate–source <b>gerilimi</b> (V<sub>GS</sub>)', 'Gate–source <b>voltage</b> (V<sub>GS</sub>)')}</td></tr>
          <tr><td>${L('Sürekli kontrol akımı', 'Steady drive current')}</td><td>I<sub>C</sub>/β … I<sub>C</sub>/10</td><td>${L('≈ 0 (yalnızca kaçak)', '≈ 0 (leakage only)')}</td></tr>
          <tr><td>${L('İletimde düşüm', 'On-state drop')}</td><td>V<sub>CE(sat)</sub> ≈ 0,05–0,3 V ${L('(sabit gibi)', '(roughly fixed)')}</td><td>I<sub>D</sub> · R<sub>DS(on)</sub> ${L('(dirençsel)', '(resistive)')}</td></tr>
          <tr><td>${L('İyi olduğu yer', 'Sweet spot')}</td><td>${L('Küçük akımlar (&lt; 0,5 A), ucuz, düşük gerilimde açılır (0,7 V)', 'Small currents (&lt; 0.5 A), cheap, turns on at 0.7 V')}</td><td>${L('Yüksek akım, PWM, düşük kayıp', 'High current, PWM, low loss')}</td></tr>
          <tr><td>${L('Hız sınırı', 'Speed limit')}</td><td>${L('Doyumdan çıkış (depolama zamanı)', 'Coming out of saturation (storage time)')}</td><td>${L('Gate kapasitansını şarj etme hızı', 'How fast you charge the gate capacitance')}</td></tr>
          <tr><td>${L('Tipik hata', 'Typical mistake')}</td><td>${L('Base direncini unutmak, yetersiz I<sub>B</sub>', 'Forgetting the base resistor, too little I<sub>B</sub>')}</td><td>${L('3,3 V ile tam açılmayan MOSFET seçmek', 'Choosing a MOSFET that won’t fully turn on at 3.3 V')}</td></tr>
        </tbody></table></div>

      <h2>${L('Renk dili', 'Color language')}</h2>
      <div class="cards">
        <div class="card"><h4 class="cu">${L('Bakır = güç', 'Copper = power')}</h4><p>${L('Yük akımı, drain/collector yolu, kayıp ve ısı.', 'Load current, drain/collector path, losses and heat.')}</p></div>
        <div class="card"><h4 class="sig">${L('Mavi = kontrol', 'Blue = control')}</h4><p>${L('Gate/base sinyali, mikrodenetleyici tarafı.', 'Gate/base signal, the microcontroller side.')}</p></div>
        <div class="card"><h4 style="color:var(--bad)">${L('Kırmızı = tehlike', 'Red = danger')}</h4><p>${L('Aşırı gerilim, aşırı akım, SOA dışı, sınır aşımı.', 'Overvoltage, overcurrent, outside SOA, a limit exceeded.')}</p></div>
      </div>
      <p class="muted small">${L('Akım animasyonları geleneksel akım yönünü (+’dan −’ye) kullanır. Elektron akışının gösterildiği yerlerde bu ayrıca belirtilir.',
        'Current animations use conventional current (+ to −). Where electron flow is shown instead, it is labelled.')}</p>`;
  },
  mount(root, App) {
    const { Viz } = App, { Sch } = Viz;
    const L = App.L;

    /* --- hero schematic --- */
    const fig = root.querySelector('#hero .lab-fig');
    const grid = App.h('div', { class: 'two' });
    fig.appendChild(grid);
    const left = App.h('div'), right = App.h('div');
    grid.append(left, right);
    const svg = Viz.schematic(left, 420, 290, `
      ${Sch.vcc(350, 24, '+12 V')}
      ${Sch.w([[350, 24], [350, 30]])}
      ${Sch.res(350, 60, 0, '1 kΩ')}
      ${Sch.led(350, 120, 0, 'LED', 'heroLed')}
      ${Sch.w([[350, 150], [350, 155]])}
      ${Sch.nmos(330, 185, 'Q1')}
      ${Sch.w([[350, 215], [350, 250]])}${Sch.gnd(350, 250)}
      ${Sch.box(20, 135, 110, 100, 'MCU', '3,3 V GPIO')}
      ${Sch.w([[130, 185], [170, 185]], 'sigw')}
      ${Sch.res(200, 185, 90, '100 Ω')}
      ${Sch.w([[230, 185], [300, 185]], 'sigw')}${Sch.dot(260, 185)}
      ${Sch.w([[260, 185], [260, 200]])}
      ${Sch.res(260, 230, 0, '10 kΩ')}
      ${Sch.gnd(260, 260)}
      <text id="pinState" x="75" y="225" class="sch-t sig" text-anchor="middle">LOW</text>
    `);
    const load = new Viz.Flow(svg, 'M350,24V250', { spacing: 14 });
    const gate = new Viz.Flow(svg, 'M130,185H300', { cls: 'flow e', spacing: 12, speed: 120 });
    const led = svg.querySelector('#heroLed .led-glow');
    const pinTxt = svg.querySelector('#pinState');

    // oscilloscope: GPIO voltage, load current and gate current on one screen
    const VIO = 3.3, IL = (12 - 2) / 1000, IG = VIO / 100;
    const scope = new Viz.Scope(right, {
      w: 460, h: 330, tdiv: 0.4, t0: 0, trig: false,
      channels: [
        { key: 'v', name: 'V GPIO', color: 'ch2', unit: 'V' },
        { key: 'i', name: 'I LOAD', color: 'ch3', unit: 'A' },
        { key: 'g', name: 'I GATE', color: 'ch4', unit: 'A' }
      ]
    });
    scope.fit('v', 0, VIO, 1.0, 3.6, true);
    scope.fit('i', 0, IL, -1.6, 0.6, true);
    scope.fit('g', -IG, IG, -3.8, -2.0, true);
    scope.status('ROLL · 50 kS/s');
    scope.drawLabels();

    const hist = [];
    let t = 0;
    const period = 2.4;
    const step = dt => {
      t += dt;
      const on = (t % period) < period / 2;
      const since = t % (period / 2);
      // gate current: short exponential pulse after each edge (RC with gate capacitance), sign by edge
      const ig = Math.exp(-since / 0.06) * (on ? 1 : -1);
      // load current lags a tiny bit (MOSFET switching), visually: first-order with 30 ms
      const last = hist.length ? hist[hist.length - 1] : { il: 0 };
      const il = last.il + ((on ? 1 : 0) - last.il) * Math.min(1, dt / 0.03);
      hist.push({ t, v: on ? 1 : 0, il, ig });
      while (hist.length && hist[0].t < t - 4) hist.shift();
      load.rate = il;
      gate.rate = Math.abs(ig) > 0.05 ? Math.abs(ig) * 2 : 0;
      gate.dir = ig >= 0 ? 1 : -1;
      led.style.opacity = il.toFixed(2);
      pinTxt.textContent = on ? 'HIGH' : 'LOW';
      const t0 = t - 4;
      scope.trace('v', hist.map(p => [p.t - t0, p.v * VIO]));
      scope.trace('i', hist.map(p => [p.t - t0, p.il * IL]));
      scope.trace('g', hist.map(p => [p.t - t0, p.ig * IG]));
    };
    for (let k = 0; k < 240; k++) step(1 / 60);   // fill the screen before the first frame
    App.onFrame(step);

    /* --- roadmap from registered pages --- */
    const rm = root.querySelector('#roadmap');
    let html = '', group = null;
    App.pages.slice(1).forEach(p => {
      const g = App.t(p.group);
      if (g !== group) {
        if (group !== null) html += '</div>';
        html += `<h3>${g}</h3><div class="cards">`;
        group = g;
      }
      html += `<a class="card card-ic" href="#${p.id}"><span class="tile">${App.icon(App.pageIcon[p.id] || 'info')}</span><span class="card-b"><span class="k">${p.num}</span><h4>${App.t(p.title)}</h4>${p.blurb ? `<p>${App.t(p.blurb)}</p>` : ''}</span></a>`;
    });
    rm.innerHTML = html + '</div>';
  }
});
