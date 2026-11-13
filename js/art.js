'use strict';
/* НейроСад 2 — библиотека рисованных SVG-иллюстраций */
const Art = (() => {
  let n = 0;
  const uid = p => `${p}${++n}`;
  const wrap = (inner, vb = '0 0 100 100', cls = '') =>
    `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  const radial = (id, c1, c2) =>
    `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;
  const linear = (id, c1, c2, vertical = true) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  const petals = (cx, cy, count, rx, ry, dist, fill, rot = 0, extra = '') => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const a = rot + (360 / count) * i;
      s += `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra} transform="rotate(${a} ${cx} ${cy})"/>`;
    }
    return s;
  };
  const stem = (x = 50, top = 55) =>
    `<path d="M${x} ${top} C ${x - 3} 70, ${x + 3} 82, ${x} 96" stroke="#3f8a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
     <path d="M${x} 80 C ${x - 14} 72, ${x - 20} 76, ${x - 22} 84 C ${x - 12} 86, ${x - 5} 84, ${x} 80Z" fill="#5cae4e"/>
     <path d="M${x} 74 C ${x + 14} 66, ${x + 20} 70, ${x + 22} 78 C ${x + 12} 80, ${x + 5} 78, ${x} 74Z" fill="#4f9f44"/>`;

  /* ---------- Цветы ---------- */
  const flowers = {
    daisy(c = '#ffffff') {
      const g = uid('dz');
      return `<defs>${radial(g, '#ffe27a', '#f0a51c')}</defs>${stem(50, 50)}
        ${petals(50, 38, 14, 6, 15, 15, c, 0, 'stroke="#e8e1d6" stroke-width="1"')}
        <circle cx="50" cy="38" r="10" fill="url(#${g})"/>
        <circle cx="47" cy="35" r="2" fill="#fff6" />`;
    },
    tulip(c = '#e8495f') {
      const g = uid('tl');
      return `<defs>${linear(g, c, shade(c, -30))}</defs>${stem(50, 52)}
        <path d="M30 22 C 30 50, 40 58, 50 58 C 60 58, 70 50, 70 22 L 60 34 L 50 18 L 40 34Z" fill="url(#${g})"/>
        <path d="M50 18 L 42 34 C 44 48, 48 56, 50 58 C 52 56, 56 48, 58 34Z" fill="${shade(c, 20)}" opacity=".7"/>`;
    },
    sunflower() {
      const g = uid('sf');
      return `<defs>${radial(g, '#8a5a2b', '#3e2412')}</defs>${stem(50, 55)}
        ${petals(50, 38, 16, 5, 13, 17, '#ffc21a', 0)}${petals(50, 38, 16, 4, 11, 15, '#ffa600', 11)}
        <circle cx="50" cy="38" r="13" fill="url(#${g})"/>
        <circle cx="46" cy="35" r="1.5" fill="#c79a5e"/><circle cx="53" cy="40" r="1.5" fill="#c79a5e"/><circle cx="50" cy="33" r="1.2" fill="#c79a5e"/>`;
    },
    rose(c = '#d63a5a') {
      const g = uid('rs');
      return `<defs>${radial(g, shade(c, 35), shade(c, -25))}</defs>${stem(50, 55)}
        <circle cx="50" cy="38" r="20" fill="url(#${g})"/>
        <path d="M50 22 C 62 24, 66 36, 58 44 C 52 50, 40 46, 40 38 C 40 30, 50 28, 54 34 C 57 39, 52 44, 47 41" stroke="${shade(c, -40)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M32 40 C 34 54, 50 60, 64 52" stroke="${shade(c, -35)}" stroke-width="2" fill="none" opacity=".7"/>`;
    },
    bell(c = '#7b6cf0') {
      const g = uid('bl');
      return `<defs>${linear(g, shade(c, 30), shade(c, -20))}</defs>
        <path d="M50 96 C 50 70, 52 40, 64 20" stroke="#3f8a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M50 84 C 36 76, 30 80, 28 88 C 38 90, 46 88, 50 84Z" fill="#5cae4e"/>
        <path d="M64 20 C 52 22, 40 30, 38 42 C 36 52, 32 58, 28 62 L 62 62 C 58 58, 56 52, 58 44 C 60 34, 66 26, 64 20Z" fill="url(#${g})" transform="rotate(-8 50 40)"/>
        <path d="M28 62 Q 34 68 38 62 Q 44 68 48 62 Q 54 68 62 62" fill="${shade(c, -10)}" transform="rotate(-8 50 40)"/>
        <circle cx="44" cy="68" r="3.5" fill="#ffd36b"/>`;
    },
    poppy(c = '#ef4b3a') {
      const g = uid('pp');
      return `<defs>${radial(g, shade(c, 25), shade(c, -20))}</defs>${stem(50, 55)}
        ${petals(50, 38, 5, 13, 15, 10, `url(#${g})`, 15)}
        <circle cx="50" cy="38" r="7" fill="#2b2233"/>${petals(50, 38, 10, 0.9, 4, 9, '#2b2233')}`;
    },
    lavender(c = '#9c7ae0') {
      let s = `<path d="M50 96 L 50 22" stroke="#4d8f45" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M50 88 C 40 80 34 84 32 90" stroke="#5cae4e" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 8; i++) {
        const y = 22 + i * 6;
        s += `<ellipse cx="${45}" cy="${y}" rx="5" ry="3.6" fill="${shade(c, i * 3)}" transform="rotate(-25 45 ${y})"/>
              <ellipse cx="${55}" cy="${y + 2}" rx="5" ry="3.6" fill="${shade(c, -10 + i * 3)}" transform="rotate(25 55 ${y + 2})"/>`;
      }
      return s;
    },
    cornflower(c = '#3d7be0') {
      return `${stem(50, 55)}${petals(50, 38, 10, 5, 12, 12, c, 0)}${petals(50, 38, 10, 3, 8, 10, shade(c, 25), 18)}
        <circle cx="50" cy="38" r="6" fill="#283a8f"/>`;
    }
  };

  /* ---------- Фрукты ---------- */
  const fruits = {
    apple(c = '#e2402f') {
      const g = uid('ap');
      return `<defs>${radial(g, shade(c, 40), shade(c, -25))}</defs>
        <path d="M50 30 C 30 18, 12 34, 16 56 C 20 78, 36 92, 50 84 C 64 92, 80 78, 84 56 C 88 34, 70 18, 50 30Z" fill="url(#${g})"/>
        <path d="M50 30 C 50 22, 52 16, 56 10" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M56 18 C 64 8, 76 10, 80 14 C 74 22, 62 24, 56 18Z" fill="#58a64a"/>
        <ellipse cx="32" cy="44" rx="6" ry="10" fill="#fff" opacity=".35" transform="rotate(20 32 44)"/>`;
    },
    pear() {
      const g = uid('pr');
      return `<defs>${radial(g, '#e8f07a', '#9cbc2c')}</defs>
        <path d="M50 18 C 40 18, 38 34, 36 44 C 22 52, 20 74, 30 84 C 40 94, 60 94, 70 84 C 80 74, 78 52, 64 44 C 62 34, 60 18, 50 18Z" fill="url(#${g})"/>
        <path d="M50 18 C 50 12, 52 8, 54 4" stroke="#6b4423" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M54 10 C 62 2, 72 6, 74 8 C 68 16, 58 16, 54 10Z" fill="#58a64a"/>
        <ellipse cx="38" cy="66" rx="5" ry="9" fill="#fff" opacity=".35"/>`;
    },
    cherry() {
      const g = uid('ch');
      return `<defs>${radial(g, '#ff6f7d', '#a3102a')}</defs>
        <path d="M34 66 C 40 40, 50 22, 62 12 M66 62 C 64 40, 64 24, 62 12" stroke="#5b7f2a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M62 12 C 72 4, 86 8, 88 14 C 80 20, 68 20, 62 12Z" fill="#58a64a"/>
        <circle cx="32" cy="72" r="16" fill="url(#${g})"/><circle cx="68" cy="70" r="16" fill="url(#${g})"/>
        <circle cx="26" cy="66" r="4" fill="#fff" opacity=".5"/><circle cx="62" cy="64" r="4" fill="#fff" opacity=".5"/>`;
    },
    lemon() {
      const g = uid('lm');
      return `<defs>${radial(g, '#fff59a', '#f2c40c')}</defs>
        <path d="M12 52 C 14 40, 26 26, 50 26 C 74 26, 86 40, 88 52 C 86 64, 74 78, 50 78 C 26 78, 14 64, 12 52Z" fill="url(#${g})"/>
        <path d="M50 26 C 54 18, 62 14, 70 16 C 66 24, 58 28, 50 26Z" fill="#58a64a"/>
        <ellipse cx="34" cy="44" rx="10" ry="5" fill="#fff" opacity=".4" transform="rotate(-20 34 44)"/>`;
    },
    grapes(c = '#7b3fa0') {
      const g = uid('gr');
      let s = `<defs>${radial(g, shade(c, 45), shade(c, -20))}</defs>
        <path d="M50 22 C 50 14, 54 8, 60 6" stroke="#6b4423" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M52 16 C 40 4, 24 10, 22 16 C 32 24, 46 24, 52 16Z" fill="#58a64a"/>`;
      const pos = [[38, 30], [50, 28], [62, 30], [32, 42], [44, 42], [56, 42], [68, 42], [38, 54], [50, 54], [62, 54], [44, 66], [56, 66], [50, 78]];
      pos.forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="8" fill="url(#${g})"/><circle cx="${x - 3}" cy="${y - 3}" r="2" fill="#fff" opacity=".45"/>`; });
      return s;
    },
    strawberry() {
      const g = uid('sb');
      let s = `<defs>${radial(g, '#ff7a6e', '#c8102e')}</defs>
        <path d="M50 90 C 30 80, 16 54, 20 38 C 24 26, 40 24, 50 28 C 60 24, 76 26, 80 38 C 84 54, 70 80, 50 90Z" fill="url(#${g})"/>
        <path d="M30 30 L 38 18 L 44 28 L 50 14 L 56 28 L 62 18 L 70 30 C 60 34, 40 34, 30 30Z" fill="#4c9e3f"/>`;
      [[36, 44], [50, 42], [64, 44], [42, 56], [58, 56], [50, 68], [36, 60], [64, 60], [46, 78], [54, 78]].forEach(([x, y]) => { s += `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.4" fill="#ffe38a"/>`; });
      return s;
    },
    orange() {
      const g = uid('or');
      return `<defs>${radial(g, '#ffc164', '#f07c0c')}</defs>
        <circle cx="50" cy="56" r="34" fill="url(#${g})"/>
        <path d="M50 22 C 56 12, 66 10, 74 12 C 70 22, 60 24, 50 22Z" fill="#58a64a"/>
        <circle cx="50" cy="23" r="2.5" fill="#8a5a1a"/>
        <ellipse cx="36" cy="44" rx="7" ry="10" fill="#fff" opacity=".3" transform="rotate(30 36 44)"/>`;
    },
    plum() {
      const g = uid('pl');
      return `<defs>${radial(g, '#9a6ddb', '#3b1b6e')}</defs>
        <ellipse cx="50" cy="58" rx="30" ry="32" fill="url(#${g})"/>
        <path d="M50 28 C 46 42, 46 74, 50 88" stroke="#2a124f" stroke-width="2" fill="none" opacity=".5"/>
        <path d="M50 28 C 50 20, 52 14, 56 10" stroke="#6b4423" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="38" cy="48" rx="5" ry="9" fill="#fff" opacity=".3"/>`;
    }
  };

  /* ---------- Птицы ---------- */
  function bird(c = '#4aa3df', belly = '#ffe7b8', wing) {
    const g = uid('bd');
    wing = wing || shade(c, -25);
    return `<defs>${radial(g, shade(c, 25), shade(c, -15))}</defs>
      <path d="M22 60 L 6 50 L 10 66Z" fill="${wing}"/>
      <ellipse cx="50" cy="58" rx="30" ry="24" fill="url(#${g})"/>
      <circle cx="68" cy="38" r="17" fill="url(#${g})"/>
      <ellipse cx="54" cy="66" rx="18" ry="13" fill="${belly}"/>
      <path d="M30 52 C 40 44, 58 50, 56 62 C 48 70, 34 66, 30 52Z" fill="${wing}"/>
      <path d="M83 36 L 95 40 L 83 44Z" fill="#f5a623"/>
      <circle cx="73" cy="34" r="4.2" fill="#fff"/><circle cx="74" cy="34" r="2.6" fill="#222"/><circle cx="75" cy="33" r="1" fill="#fff"/>
      <path d="M46 82 L 44 92 M56 82 L 58 92" stroke="#c77a1e" stroke-width="3" stroke-linecap="round"/>`;
  }
  const birds = {
    bluebird: () => bird('#4aa3df', '#ffe7b8'),
    robin: () => bird('#7a5a44', '#ff8a4c'),
    canary: () => bird('#ffd22e', '#fff4b0', '#e0a800'),
    parrot: () => bird('#3cbf6a', '#ffd54a', '#1f7d47'),
    pinkbird: () => bird('#ee7fb4', '#fff0f6', '#c04f86'),
    tit: () => bird('#2f5d9a', '#ffe14d', '#1d3b66')
  };

  /* ---------- Предметы ---------- */
  const things = {
    wateringCan(c = '#3fa7a0') {
      return `<path d="M24 40 L 70 40 L 66 86 L 28 86Z" fill="${c}"/>
        <path d="M70 52 L 92 30 L 96 34 L 74 60Z" fill="${shade(c, -15)}"/>
        <ellipse cx="94" cy="31" rx="5" ry="3" fill="${shade(c, -25)}" transform="rotate(-45 94 31)"/>
        <path d="M30 40 C 30 18, 64 18, 64 40" stroke="${shade(c, -20)}" stroke-width="6" fill="none"/>
        <rect x="24" y="38" width="46" height="6" rx="3" fill="${shade(c, 20)}"/>`;
    },
    cat(c = '#f39c4a') {
      return `<path d="M70 80 C 92 78, 96 56, 84 50" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <ellipse cx="54" cy="74" rx="26" ry="18" fill="${c}"/>
        <circle cx="40" cy="46" r="20" fill="${c}"/>
        <path d="M24 38 L 22 18 L 38 30Z M56 38 L 58 18 L 42 30Z" fill="${c}"/>
        <path d="M27 34 L 26 24 L 33 30Z M53 34 L 54 24 L 47 30Z" fill="#ffc2c2"/>
        <ellipse cx="33" cy="45" rx="3" ry="4" fill="#2b2b2b"/><ellipse cx="47" cy="45" rx="3" ry="4" fill="#2b2b2b"/>
        <path d="M38 52 L 42 52 L 40 55Z" fill="#e5737a"/>
        <path d="M40 55 Q 36 59 33 56 M40 55 Q 44 59 47 56" stroke="#7a3d14" stroke-width="1.5" fill="none"/>
        <path d="M28 52 L 14 50 M28 55 L 15 57 M52 52 L 66 50 M52 55 L 65 57" stroke="#7a3d14" stroke-width="1"/>
        <path d="M44 68 C 50 66 58 66 64 70" stroke="${shade(c, -20)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    },
    butterfly(c = '#ff8fb1') {
      const g = uid('bf');
      return `<defs>${radial(g, shade(c, 30), shade(c, -20))}</defs>
        <path d="M50 48 C 30 18, 6 22, 12 44 C 16 56, 36 56, 50 50Z" fill="url(#${g})"/>
        <path d="M50 48 C 70 18, 94 22, 88 44 C 84 56, 64 56, 50 50Z" fill="url(#${g})"/>
        <path d="M50 52 C 34 58, 20 70, 30 80 C 40 86, 48 70, 50 56Z" fill="${shade(c, -10)}"/>
        <path d="M50 52 C 66 58, 80 70, 70 80 C 60 86, 52 70, 50 56Z" fill="${shade(c, -10)}"/>
        <circle cx="26" cy="38" r="5" fill="#fff" opacity=".6"/><circle cx="74" cy="38" r="5" fill="#fff" opacity=".6"/>
        <rect x="47.5" y="36" width="5" height="40" rx="2.5" fill="#3b2a3f"/>
        <path d="M49 37 C 46 28 42 24 38 22 M51 37 C 54 28 58 24 62 22" stroke="#3b2a3f" stroke-width="1.6" fill="none"/>`;
    },
    mushroom() {
      return `<path d="M40 56 L 38 88 C 46 92, 54 92, 62 88 L 60 56Z" fill="#f6ead2"/>
        <path d="M10 58 C 10 22, 90 22, 90 58 C 70 64, 30 64, 10 58Z" fill="#e2403a"/>
        <circle cx="32" cy="42" r="6" fill="#fff"/><circle cx="56" cy="34" r="5" fill="#fff"/><circle cx="72" cy="48" r="5" fill="#fff"/><circle cx="48" cy="52" r="3.5" fill="#fff"/>`;
    },
    basket() {
      return `<path d="M24 50 C 24 14, 76 14, 76 50" stroke="#a0662f" stroke-width="5" fill="none"/>
        <path d="M14 48 L 86 48 L 76 88 L 24 88Z" fill="#c98a45"/>
        <path d="M18 60 L 82 60 M21 72 L 79 72" stroke="#8f5a26" stroke-width="3"/>
        <path d="M34 48 L 36 88 M50 48 L 50 88 M66 48 L 64 88" stroke="#8f5a26" stroke-width="2.5"/>
        <circle cx="38" cy="44" r="9" fill="#e2402f"/><circle cx="58" cy="42" r="9" fill="#f2c40c"/>`;
    },
    hat(c = '#e8c27a') {
      return `<ellipse cx="50" cy="66" rx="44" ry="12" fill="${c}"/>
        <path d="M26 64 C 26 30, 74 30, 74 64Z" fill="${shade(c, 10)}"/>
        <path d="M26 58 C 40 62, 60 62, 74 58 L 74 64 C 60 68, 40 68, 26 64Z" fill="#d6455d"/>`;
    },
    teapot(c = '#5a8fd8') {
      return `<path d="M20 50 C 4 44, 4 70, 22 70" stroke="${shade(c, -15)}" stroke-width="5" fill="none"/>
        <path d="M78 58 L 96 40" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="50" cy="62" rx="32" ry="26" fill="${c}"/>
        <ellipse cx="50" cy="38" rx="20" ry="5" fill="${shade(c, -15)}"/>
        <circle cx="50" cy="30" r="5" fill="${shade(c, 20)}"/>
        <path d="M30 62 Q 50 72 70 62" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>
        <circle cx="40" cy="56" r="3" fill="#fff" opacity=".8"/><circle cx="60" cy="56" r="3" fill="#fff" opacity=".8"/>`;
    },
    cup(c = '#ef8f6a') {
      return `<path d="M74 44 C 92 44, 92 70, 72 70" stroke="${shade(c, -15)}" stroke-width="6" fill="none"/>
        <path d="M20 34 L 80 34 L 74 78 C 72 86, 28 86, 26 78Z" fill="${c}"/>
        <ellipse cx="50" cy="34" rx="30" ry="6" fill="#8a4e2a"/>
        <ellipse cx="50" cy="88" rx="38" ry="6" fill="${shade(c, -20)}"/>
        <path d="M40 24 C 36 18 44 14 40 6 M56 24 C 52 18 60 14 56 6" stroke="#bbb" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    },
    ladybug() {
      return `<circle cx="50" cy="28" r="12" fill="#2b2b2b"/>
        <ellipse cx="50" cy="58" rx="32" ry="30" fill="#e2302a"/>
        <path d="M50 30 L 50 88" stroke="#2b2b2b" stroke-width="3"/>
        <circle cx="36" cy="48" r="5" fill="#2b2b2b"/><circle cx="64" cy="48" r="5" fill="#2b2b2b"/>
        <circle cx="32" cy="66" r="5" fill="#2b2b2b"/><circle cx="68" cy="66" r="5" fill="#2b2b2b"/>
        <circle cx="45" cy="26" r="2.5" fill="#fff"/><circle cx="55" cy="26" r="2.5" fill="#fff"/>`;
    },
    birdhouse() {
      return `<rect x="47" y="60" width="6" height="38" fill="#8a5a2b"/>
        <rect x="24" y="34" width="52" height="40" rx="3" fill="#f2b26b"/>
        <path d="M16 38 L 50 10 L 84 38Z" fill="#c2473a"/>
        <circle cx="50" cy="52" r="8" fill="#5a3418"/><rect x="46" y="64" width="8" height="3" fill="#8a5a2b"/>`;
    },
    snail() {
      return `<path d="M8 84 C 8 74, 20 72, 30 74 L 86 74 C 92 74, 94 84, 86 86 L 14 88 C 10 88, 8 86, 8 84Z" fill="#e7c48e"/>
        <path d="M18 74 C 14 64, 16 54, 20 50 M26 74 C 26 62, 30 56, 32 52" stroke="#e7c48e" stroke-width="3" fill="none"/>
        <circle cx="20" cy="49" r="3" fill="#5a4430"/><circle cx="32" cy="51" r="3" fill="#5a4430"/>
        <circle cx="60" cy="54" r="26" fill="#c77d3a"/>
        <path d="M60 54 m -18 0 a 18 18 0 1 1 18 18 a 12 12 0 1 1 -12 -12 a 6 6 0 1 1 6 6" stroke="#8a4c1a" stroke-width="3" fill="none"/>`;
    },
    key() {
      return `<circle cx="28" cy="50" r="18" fill="none" stroke="#e0a72e" stroke-width="8"/>
        <path d="M46 50 L 90 50 M74 50 L 74 66 M86 50 L 86 62" stroke="#e0a72e" stroke-width="8" stroke-linecap="round"/>`;
    },
    glasses() {
      return `<circle cx="28" cy="54" r="17" fill="#cfe9ff" fill-opacity=".5" stroke="#3a3a5a" stroke-width="5"/>
        <circle cx="72" cy="54" r="17" fill="#cfe9ff" fill-opacity=".5" stroke="#3a3a5a" stroke-width="5"/>
        <path d="M45 52 Q 50 46 55 52 M11 50 L 2 42 M89 50 L 98 42" stroke="#3a3a5a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    },
    umbrella(c = '#9b59d0') {
      return `<path d="M50 48 L 50 84 C 50 94, 36 94, 36 86" stroke="#555" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M6 50 C 6 10, 94 10, 94 50 C 86 42, 80 42, 72 50 C 64 42, 58 42, 50 50 C 42 42, 36 42, 28 50 C 20 42, 14 42, 6 50Z" fill="${c}"/>
        <path d="M50 14 C 40 26, 30 40, 28 50 M50 14 C 60 26, 70 40, 72 50" stroke="${shade(c, -20)}" stroke-width="2" fill="none"/>`;
    },
    book(c = '#3c8dbc') {
      return `<path d="M10 24 C 26 18, 40 20, 50 28 L 50 86 C 40 78, 26 76, 10 82Z" fill="${c}"/>
        <path d="M90 24 C 74 18, 60 20, 50 28 L 50 86 C 60 78, 74 76, 90 82Z" fill="${shade(c, -15)}"/>
        <path d="M16 28 C 28 24, 38 26, 46 32 L 46 80 C 38 74, 28 72, 16 76Z" fill="#fffaf0"/>
        <path d="M84 28 C 72 24, 62 26, 54 32 L 54 80 C 62 74, 72 72, 84 76Z" fill="#fffaf0"/>
        <path d="M22 40 L 40 42 M22 50 L 40 52 M60 42 L 78 40 M60 52 L 78 50" stroke="#bbb" stroke-width="2"/>`;
    },
    house() {
      return `<rect x="18" y="44" width="64" height="48" fill="#f6d8a8"/>
        <path d="M8 48 L 50 12 L 92 48Z" fill="#c2473a"/>
        <rect x="42" y="64" width="16" height="28" fill="#8a5a2b"/>
        <rect x="24" y="54" width="14" height="14" fill="#9fd4ff" stroke="#fff" stroke-width="2"/>
        <rect x="62" y="54" width="14" height="14" fill="#9fd4ff" stroke="#fff" stroke-width="2"/>
        <rect x="66" y="18" width="8" height="16" fill="#8a4a3a"/>`;
    },
    sun() {
      const g = uid('sn');
      return `<defs>${radial(g, '#fff3a0', '#ffb703')}</defs>${petals(50, 50, 12, 4, 10, 34, '#ffc93c')}
        <circle cx="50" cy="50" r="24" fill="url(#${g})"/>`;
    },
    cloud() {
      return `<path d="M24 74 C 8 74, 6 52, 22 50 C 22 32, 46 28, 52 42 C 60 30, 82 36, 78 54 C 94 56, 92 74, 78 74Z" fill="#fff" stroke="#c9dcef" stroke-width="2"/>
        <path d="M34 82 L 30 92 M50 82 L 46 92 M66 82 L 62 92" stroke="#5aa9e6" stroke-width="4" stroke-linecap="round"/>`;
    },
    bee() {
      return `<ellipse cx="38" cy="34" rx="14" ry="18" fill="#dff3ff" opacity=".9" transform="rotate(-25 38 34)"/>
        <ellipse cx="62" cy="34" rx="14" ry="18" fill="#dff3ff" opacity=".9" transform="rotate(25 62 34)"/>
        <ellipse cx="50" cy="60" rx="30" ry="22" fill="#ffcc2e"/>
        <path d="M40 40 C 36 50, 36 70, 40 80 M54 38 C 50 50, 50 70, 54 82" stroke="#2b2b2b" stroke-width="7" fill="none"/>
        <circle cx="74" cy="54" r="3" fill="#2b2b2b"/><path d="M20 60 L 10 62" stroke="#2b2b2b" stroke-width="3"/>`;
    },
    honey() {
      return `<rect x="22" y="34" width="56" height="56" rx="12" fill="#f5a524"/>
        <rect x="18" y="22" width="64" height="16" rx="5" fill="#c97a28"/>
        <path d="M30 38 C 30 50, 36 50, 36 42 C 36 56, 44 56, 44 42" fill="#c97a28"/>
        <ellipse cx="38" cy="62" rx="6" ry="12" fill="#fff" opacity=".35"/>`;
    },
    yarn() {
      return `<circle cx="50" cy="54" r="32" fill="#e86a8e"/>
        <path d="M22 40 C 40 50, 60 30, 80 44 M20 58 C 40 70, 64 46, 82 62 M30 78 C 46 80, 66 64, 76 76 M40 24 C 30 48, 40 70, 60 86" stroke="#b8406a" stroke-width="3" fill="none"/>
        <path d="M78 76 C 88 84, 92 92, 98 94" stroke="#e86a8e" stroke-width="3" fill="none"/>`;
    },
    bread() {
      return `<path d="M10 60 C 10 30, 90 30, 90 60 L 86 84 L 14 84Z" fill="#d99a4e"/>
        <path d="M30 44 L 38 60 M48 40 L 54 58 M66 44 L 70 60" stroke="#f7d9a4" stroke-width="4" stroke-linecap="round"/>`;
    },
    letter() {
      return `<rect x="10" y="24" width="80" height="56" rx="6" fill="#fff8e7" stroke="#d8c49a" stroke-width="2"/>
        <path d="M10 26 L 50 58 L 90 26" stroke="#d8c49a" stroke-width="3" fill="none"/>
        <circle cx="50" cy="58" r="8" fill="#d63a5a"/>`;
    },
    flowerPot() {
      return `<g transform="translate(20 -4) scale(.6)">${flowers.tulip('#ff7a9c')}</g><path d="M28 60 L 72 60 L 66 96 L 34 96Z" fill="#d0733f"/><rect x="24" y="56" width="52" height="8" rx="3" fill="#b85f30"/>`;
    }
  };

  function shade(hex, pct) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    let r = num >> 16, g = (num >> 8) & 255, b = num & 255;
    const t = pct < 0 ? 0 : 255, p = Math.abs(pct) / 100;
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* каталог именованных картинок */
  const catalog = {
    'Ромашка': () => flowers.daisy(), 'Тюльпан': () => flowers.tulip(), 'Подсолнух': () => flowers.sunflower(),
    'Роза': () => flowers.rose(), 'Колокольчик': () => flowers.bell(), 'Мак': () => flowers.poppy(),
    'Лаванда': () => flowers.lavender(), 'Василёк': () => flowers.cornflower(),
    'Яблоко': () => fruits.apple(), 'Груша': () => fruits.pear(), 'Вишня': () => fruits.cherry(),
    'Лимон': () => fruits.lemon(), 'Виноград': () => fruits.grapes(), 'Клубника': () => fruits.strawberry(),
    'Апельсин': () => fruits.orange(), 'Слива': () => fruits.plum(),
    'Синичка': () => birds.tit(), 'Малиновка': () => birds.robin(), 'Канарейка': () => birds.canary(),
    'Попугай': () => birds.parrot(), 'Голубая птица': () => birds.bluebird(), 'Розовая птичка': () => birds.pinkbird(),
    'Лейка': () => things.wateringCan(), 'Кошка': () => things.cat(), 'Бабочка': () => things.butterfly(),
    'Гриб': () => things.mushroom(), 'Корзинка': () => things.basket(), 'Шляпа': () => things.hat(),
    'Чайник': () => things.teapot(), 'Чашка': () => things.cup(), 'Божья коровка': () => things.ladybug(),
    'Скворечник': () => things.birdhouse(), 'Улитка': () => things.snail(), 'Ключ': () => things.key(),
    'Очки': () => things.glasses(), 'Зонт': () => things.umbrella(), 'Книга': () => things.book(),
    'Дом': () => things.house(), 'Солнце': () => things.sun(), 'Туча': () => things.cloud(),
    'Пчела': () => things.bee(), 'Мёд': () => things.honey(), 'Клубок': () => things.yarn(),
    'Хлеб': () => things.bread(), 'Письмо': () => things.letter(), 'Цветок в горшке': () => things.flowerPot()
  };
  const pic = (name, cls = '') => wrap(catalog[name] ? catalog[name]() : '', '0 0 100 100', cls);

  /* ---------- Фон сцены ---------- */
  function sceneBackground(w = 400, h = 260) {
    const sky = uid('sky'), grass = uid('gs');
    return `<defs>${linear(sky, '#bfe6ff', '#fef6e4')}${linear(grass, '#9bd46a', '#5fa344')}</defs>
      <rect width="${w}" height="${h}" fill="url(#${sky})"/>
      <path d="M0 ${h * .62} C ${w * .2} ${h * .5}, ${w * .4} ${h * .58}, ${w * .55} ${h * .55} C ${w * .75} ${h * .5}, ${w * .9} ${h * .56}, ${w} ${h * .52} L ${w} ${h} L 0 ${h}Z" fill="#b6dd8a"/>
      <path d="M0 ${h * .72} C ${w * .3} ${h * .64}, ${w * .6} ${h * .74}, ${w} ${h * .66} L ${w} ${h} L 0 ${h}Z" fill="url(#${grass})"/>`;
  }

  return { wrap, pic, catalog, flowers, fruits, birds, things, shade, sceneBackground, uid, radial, linear, petals };
})();
