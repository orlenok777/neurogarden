'use strict';
/* Живой сад: растёт от занятий */
const Garden = (() => {
  const kinds = [
    c => Art.flowers.tulip(c), c => Art.flowers.daisy(), c => Art.flowers.rose(c), () => Art.flowers.sunflower(),
    c => Art.flowers.bell(c), c => Art.flowers.poppy(c), c => Art.flowers.lavender(), c => Art.flowers.cornflower()
  ];
  const colors = ['#e8495f', '#ff9f1c', '#d63a5a', '#ffd166', '#7b6cf0', '#ef4b3a', '#9c7ae0', '#3d7be0', '#ff7aa8', '#f86f3c'];
  // фиксированные места для растений (x, y, масштаб)
  const spots = [];
  (function () {
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const rows = [[318, 0.78], [358, 0.92], [402, 1.08]];
    rows.forEach(([y, sc], r) => {
      for (let i = 0; i < 12; i++) spots.push({ x: 40 + i * 66 + (r % 2) * 30 + rnd() * 16, y: y + rnd() * 8, s: sc });
    });
    // перемешиваем порядок, чтобы сад заполнялся красиво
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
    spots.sort((a, b) => a.y - b.y); // дальние сзади
  })();
  const order = spots.map((_, i) => i);
  (function () { let seed = 3; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280; for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } })();

  function sprout(stage) {
    if (stage === 0) return `<path d="M50 96 C 50 88, 50 84, 50 80" stroke="#3f8a3a" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 84 C 40 76, 34 80, 32 86 C 40 88, 46 88, 50 84Z M50 82 C 60 74, 66 78, 68 84 C 60 86, 54 86, 50 82Z" fill="#6cc25a"/>`;
    return `<path d="M50 96 C 48 80, 52 66, 50 56" stroke="#3f8a3a" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M50 80 C 38 72, 32 76, 30 84 C 40 86, 46 84, 50 80Z M50 74 C 62 66, 68 70, 70 78 C 60 80, 54 78, 50 74Z" fill="#5cae4e"/>
      <ellipse cx="50" cy="50" rx="7" ry="10" fill="#7cc46a"/><path d="M46 46 Q 50 36 54 46" fill="#ff9fb5"/>`;
  }

  function render(info) {
    const { sessions = 0, streak = 0, activeDays = 0, todayDone = false, motion = true } = info;
    const sky = Art.uid('gsky'), hill = Art.uid('ghill'), sunG = Art.uid('gsun');
    const hour = new Date().getHours();
    const evening = hour >= 19 || hour < 6;
    let s = `<svg class="garden-svg ${motion ? '' : 'still'}" viewBox="0 0 860 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ваш сад: ${sessions} растений">
    <defs>
      ${Art.linear(sky, evening ? '#ffc8a2' : '#aee0ff', evening ? '#fff1d6' : '#f4fbff')}
      ${Art.linear(hill, '#a6d97a', '#6cb04f')}
      ${Art.radial(sunG, '#fff7b0', '#ffbf2e')}
    </defs>
    <rect width="860" height="420" fill="url(#${sky})"/>
    <g class="sun-g"><circle cx="740" cy="80" r="58" fill="#fff3b0" opacity=".45"/><circle cx="740" cy="80" r="40" fill="url(#${sunG})"/></g>
    <g class="cloud c1"><path d="M90 90 c -26 0 -28 -32 -4 -34 c 4 -26 44 -30 52 -8 c 18 -12 46 0 40 22 c 20 2 18 22 -2 22Z" fill="#fff" opacity=".95"/></g>
    <g class="cloud c2"><path d="M420 60 c -20 0 -22 -24 -3 -26 c 3 -20 34 -22 40 -6 c 14 -9 36 0 31 17 c 15 2 14 17 -2 17Z" fill="#fff" opacity=".85"/></g>
    <path d="M0 250 C 140 190, 260 230, 380 210 C 520 186, 640 230, 860 196 L 860 420 L 0 420Z" fill="#c7e8a0"/>
    <path d="M0 290 C 160 250, 360 300, 520 270 C 660 246, 760 280, 860 262 L 860 420 L 0 420Z" fill="url(#${hill})"/>`;
    // деревья по активным дням
    const trees = Math.min(4, Math.floor(activeDays / 3));
    const treeX = [120, 650, 300, 520];
    for (let t = 0; t < trees; t++) {
      const x = treeX[t];
      s += `<g class="tree"><rect x="${x - 7}" y="200" width="14" height="70" rx="5" fill="#8a5a2b"/>
        <circle cx="${x}" cy="190" r="40" fill="#4f9f44"/><circle cx="${x - 26}" cy="206" r="26" fill="#5cae4e"/><circle cx="${x + 26}" cy="204" r="28" fill="#5cae4e"/>
        <circle cx="${x - 12}" cy="180" r="5" fill="#e2402f"/><circle cx="${x + 16}" cy="196" r="5" fill="#e2402f"/><circle cx="${x + 4}" cy="210" r="5" fill="#e2402f"/></g>`;
    }
    // забор
    s += `<g opacity=".9">`;
    for (let x = 0; x < 860; x += 34) s += `<path d="M${x + 6} 300 L ${x + 6} 262 L ${x + 16} 252 L ${x + 26} 262 L ${x + 26} 300Z" fill="#fff6e6" stroke="#e2cfae" stroke-width="2"/>`;
    s += `<rect x="0" y="270" width="860" height="8" fill="#f1e3c8"/></g>`;
    // кусты
    [[20, 300, 1], [840, 296, 1.1], [600, 292, .7]].forEach(([x, y, k]) => { s += `<g transform="translate(${x} ${y}) scale(${k})"><circle cx="-26" cy="-8" r="26" fill="#4f9f44"/><circle cx="20" cy="-10" r="28" fill="#5cae4e"/><circle cx="-2" cy="-28" r="26" fill="#62b653"/><circle cx="-10" cy="-20" r="4" fill="#ff7aa8"/><circle cx="14" cy="-30" r="4" fill="#fff"/><circle cx="22" cy="-6" r="4" fill="#ff7aa8"/></g>`; });
    // земля-грядки
    s += `<path d="M0 300 L 860 300 L 860 420 L 0 420Z" fill="#7dbf5a"/>
      <path d="M0 318 C 200 310, 600 326, 860 314 L 860 420 L 0 420Z" fill="#6fb24e"/>
      <path d="M360 420 C 400 380, 440 340, 470 300 L 500 300 C 480 340, 470 380, 480 420Z" fill="#e8d3a8" opacity=".85"/>`;
    // растения
    const count = Math.min(sessions, spots.length);
    const plants = [];
    for (let i = 0; i < count; i++) {
      const sp = spots[order[i]];
      const stage = Math.min(3, sessions - i);
      plants.push({ sp, i, stage });
    }
    plants.sort((a, b) => a.sp.y - b.sp.y).forEach(({ sp, i, stage }) => {
      const size = 112 * sp.s;
      const inner = stage >= 2 ? kinds[i % kinds.length](colors[i % colors.length]) : sprout(stage);
      const sc = stage === 2 ? .8 : 1;
      s += `<g class="plant ${i === count - 1 && todayDone ? 'new' : ''}" style="animation-delay:${(i % 7) * .3}s">
        <svg x="${sp.x - size * sc / 2}" y="${sp.y - size * sc + 10}" width="${size * sc}" height="${size * sc}" viewBox="0 0 100 100">${inner}</svg></g>`;
    });
    if (count === 0) {
      s += `<g><rect x="250" y="335" width="360" height="52" rx="26" fill="#fff" opacity=".9"/>
        <text x="430" y="369" text-anchor="middle" font-size="22" fill="#3b5a2e" font-family="Nunito, sans-serif" font-weight="700">Здесь вырастет ваш первый цветок</text></g>`;
    }
    // бабочки за серию дней
    const bfs = Math.min(3, streak >= 2 ? Math.ceil(streak / 2) : 0);
    const bcol = ['#ff8fb1', '#ffd166', '#8fd3ff'];
    for (let b = 0; b < bfs; b++) {
      s += `<g class="bfly b${b}"><svg x="${200 + b * 200}" y="${150 + (b % 2) * 40}" width="46" height="46" viewBox="0 0 100 100">${Art.things.butterfly(bcol[b])}</svg></g>`;
    }
    if (streak >= 5) s += `<svg x="560" y="210" width="62" height="62" viewBox="0 0 100 100" class="fence-bird">${Art.birds.canary()}</svg>`;
    if (activeDays >= 2) s += `<svg x="760" y="230" width="80" height="80" viewBox="0 0 100 100">${Art.things.birdhouse()}</svg>`;
    s += `</svg>`;
    return s;
  }
  return { render, capacity: spots.length };
})();
