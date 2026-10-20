/* FET Lab — line icons (24×24, stroke = currentColor). App.icon('name', 'extra-class') → SVG string. */
(function () {
  'use strict';
  const P = {
    home: 'M3 11l9-7 9 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5z',
    scope: 'M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM6 12l2-3 2 5 2-7 2 7 2-3h2M9 21h6M12 17v4',
    apps: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14v6M14 17h6',
    plug: 'M9 2v5M15 2v5M6 7h12v3a6 6 0 0 1-12 0zM12 16v6',
    bjt: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5 12h5M10 7.5v9M10 10l5.5-3.5V3.5M10 14l5.5 3.5v3M13.5 17l2 .5-.6-2',
    mosfet: 'M3 12h6M9 6.5v11M12 6v3M12 10.5v3M12 15v3M12 7.5h6V3M12 16.5h6V21M12 12h6v4.5M14 12l1.6-1.2v2.4z',
    chip: 'M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M10 10h4v4h-4z',
    pullup: 'M12 2v3M8 2h8M12 5l-2 1.5 4 2-4 2 4 2-2 1.5M12 14v3M12 17l-4 4M12 17h7M17 15v4',
    drive: 'M3 12h5M8 8l6 4-6 4zM14 12h3M17 7v10M17 9l4-3M17 15l4 3',
    bridge: 'M5 3v18M19 3v18M5 12h4M15 12h4M9 9.5h6v5H9z',
    coil: 'M2 14h3a2 2 0 0 1 4 0 2 2 0 0 1 4 0 2 2 0 0 1 4 0h5M7 6l3-3 3 3M10 3v6',
    square: 'M2 17h4V7h5v10h5V7h4v10h2',
    amp: 'M6 5v14l13-7zM2 12h4M19 12h3M10 9v2M9 10h2',
    surge: 'M2 18h5l3-14 3 14 2-6h7',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 8v5M12 16.2v.3',
    thermo: 'M10 4a2 2 0 0 1 4 0v10.3a4 4 0 1 1-4 0zM12 9v7',
    flask: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9',
    warn: 'M12 3.5L21.5 20h-19zM12 10v4.5M12 17.2v.3',
    book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20M8 7h8M8 11h6',
    quiz: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 12l3 3 5-6',
    fan: 'M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 10.5C10.5 6 11 3 13.5 3c2 0 2.3 3.5-1.5 7.5M13.5 12c4.5-1.5 7.5-1 7.5 1.5 0 2-3.5 2.3-7.5-1.5M12 13.5c1.5 4.5 1 7.5-1.5 7.5-2 0-2.3-3.5 1.5-7.5M10.5 12C6 13.5 3 13 3 10.5c0-2 3.5-2.3 7.5 1.5',
    led: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
    motor: 'M11 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM8 15V9l3 3.5L14 9v6M18 12h4',
    relay: 'M3 7h18v10H3zM6 12c0-2 2-2 2 0s2 2 2 0 2-2 2 0M15 14l3-4M18 10v-1',
    valve: 'M8 3h8v9H8zM12 12v6M7 21h10M10 6h4M10 9h4',
    lamp: 'M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3zM9 19h6M10 22h4M9.5 6.5l5 5M14.5 6.5l-5 5',
    heater: 'M7 3c-2 3 2 5 0 8s2 5 0 8M12 3c-2 3 2 5 0 8s2 5 0 8M17 3c-2 3 2 5 0 8s2 5 0 8M4 22h16',
    car: 'M3 16v-3l2.2-5.5A2 2 0 0 1 7 6h10a2 2 0 0 1 1.8 1.5L21 13v3zM3 16v3h3v-3M18 16v3h3v-3M3 13h18M7 13.5v.1M17 13.5v.1',
    factory: 'M3 21V11l5 3v-3l5 3v-3l5 3V4h3v17zM7 17h2M12 17h2',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l2.7 2.7L16 9.5',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.3',
    x: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
    dial: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 12l4.5-4.5M12 4v2M20 12h-2M4 12h2',
    pulse: 'M2 17h5V6h3v11h12',
    sine: 'M2 12c3-8 6-8 10 0s7 8 10 0',
    toggle: 'M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7zM16 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    battery: 'M3 8h15a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM21 10.5v3M6 10v4M9 10v4',
    gauge: 'M4 18a8 8 0 1 1 16 0M12 18l4-6M7 15h.1M17 15h.1M12 9.5v.1',
    gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
    spark: 'M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    play: 'M7 4l13 8-13 8z',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5'
  };
  // icons that look better filled (small details)
  const FILL = { play: 1, bolt: 1 };
  App.icon = function (name, cls) {
    const d = P[name] || P.info;
    return `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"${FILL[name] ? ' class="ic-fill"' : ''}/></svg>`;
  };
  App.icons = P;
  // chapter → icon (kept here so page files stay content-only)
  App.pageIcon = {
    home: 'home', simulator: 'scope', apps: 'apps', loads: 'plug', bjt: 'bjt', mosfet: 'mosfet', 'mcu-io': 'chip',
    outputs: 'pullup', 'bjt-drive': 'drive', 'mosfet-drive': 'gauge', topologies: 'bridge', inductive: 'coil',
    switching: 'square', 'gate-drivers': 'amp', inrush: 'surge', overcurrent: 'shield', thermal: 'thermo',
    examples: 'flask', mistakes: 'warn', reference: 'book', quiz: 'quiz'
  };
})();
