'use strict';
/* Десять графических игр НейроСада */
const P = (name, cls = '') => Art.pic(name, cls);
const cover = (...names) => () => `<span class="cover">${names.map((n, i) => `<span class="cv cv${i}">${P(n)}</span>`).join('')}</span>`;
const inSvg = (inner, x, y, w, h, extra = '') => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 100 100" ${extra}>${inner}</svg>`;

/* ===== 1. Пары в саду ===== */
const gPairs = {
  id: 'pairs', name: 'Пары в саду', area: 'Зрительная память', c1: '#ffe0ec', c2: '#ffc2d6',
  desc: 'Переворачивайте карточки и находите одинаковые картинки.',
  pro: 'Кратковременная зрительная память и запоминание расположения.',
  levels: ['6 пар, подсказка в начале', '8 пар', '10 похожих пар'],
  steps: ['Нажмите на карточку — она перевернётся.', 'Нажмите на вторую. Если картинки одинаковые — пара найдена!', 'Если разные, карточки закроются. Запомните, где что лежит.'],
  cover: cover('Тюльпан', 'Яблоко', 'Синичка'),
  demo() { return `<div class="demo-pairs"><div class="mc open">${P('Яблоко')}</div><div class="mc"></div><div class="mc open d2">${P('Яблоко')}</div><div class="mc"></div></div>`; },
  play(stage, level, api) {
    const pools = {
      1: ['Тюльпан', 'Яблоко', 'Синичка', 'Подсолнух', 'Вишня', 'Бабочка', 'Лимон', 'Кошка', 'Божья коровка', 'Гриб'],
      2: ['Тюльпан', 'Яблоко', 'Синичка', 'Подсолнух', 'Вишня', 'Бабочка', 'Лимон', 'Виноград', 'Роза', 'Канарейка', 'Клубника', 'Улитка'],
      3: ['Тюльпан', 'Роза', 'Мак', 'Ромашка', 'Колокольчик', 'Василёк', 'Лаванда', 'Подсолнух', 'Синичка', 'Малиновка', 'Канарейка', 'Попугай', 'Голубая птица', 'Розовая птичка']
    };
    const pairs = [6, 8, 10][level - 1];
    const items = shuffle([...pick(pools[level], pairs)].flatMap(n => [n, n]));
    const cols = pairs === 6 ? 4 : pairs === 8 ? 4 : 5;
    const rows = Math.ceil(items.length / cols);
    stage.innerHTML = `<div class="pairs-grid" style="--cols:${cols};max-width:max(340px, min(960px, calc((100vh - 270px) / ${rows} * ${cols} * .86)))">${items.map((n, i) => `<button class="mcard" data-i="${i}" aria-label="Карточка ${i + 1}"><span class="mc-inner"><span class="mc-back"><span class="mc-pattern"></span></span><span class="mc-front">${P(n)}<span class="mc-name">${n}</span></span></span></button>`).join('')}</div>`;
    const cards = $$('.mcard', stage);
    let open = [], found = 0, moves = 0, lock = false;
    const upd = () => api.status(`Найдено пар: <b>${found} из ${pairs}</b> · ходов: ${moves}`);
    upd();
    if (level === 1) {
      lock = true; cards.forEach(c => c.classList.add('flip'));
      api.status('Посмотрите на картинки и запомните их…');
      api.later(() => { cards.forEach(c => c.classList.remove('flip')); lock = false; upd(); }, 3500);
    }
    cards.forEach(c => c.onclick = () => {
      if (lock || c.classList.contains('flip')) return;
      Sound.tap(); c.classList.add('flip'); open.push(c);
      if (open.length === 2) {
        moves++; const [a, b] = open; open = [];
        if (items[a.dataset.i] === items[b.dataset.i]) {
          found++; api.later(() => { a.classList.add('done'); b.classList.add('done'); api.good(b, found === pairs ? false : undefined); }, 350);
          upd();
          if (found === pairs) api.later(() => api.done(Math.min(1, pairs * 1.6 / moves), `Все ${pairs} пар найдены за ${moves} ходов.`), 1300);
        } else { lock = true; upd(); api.later(() => { a.classList.remove('flip'); b.classList.remove('flip'); lock = false; }, 1300); }
      }
    });
  }
};

/* ===== 2. Найдите отличия ===== */
const sceneItems = {
  house: { draw: () => Art.things.house(), alt: () => Art.things.birdhouse() },
  tree: { draw: c => `<rect x="44" y="55" width="12" height="42" rx="4" fill="#8a5a2b"/><circle cx="50" cy="40" r="28" fill="${c || '#4f9f44'}"/><circle cx="30" cy="54" r="16" fill="${c || '#5cae4e'}"/><circle cx="70" cy="52" r="18" fill="${c || '#5cae4e'}"/><circle cx="40" cy="36" r="5" fill="#e2402f"/><circle cx="62" cy="44" r="5" fill="#e2402f"/>`, colors: ['#4f9f44', '#e0a03a'] },
  tulip: { draw: c => Art.flowers.tulip(c), colors: ['#e8495f', '#ffd23f', '#9b5de5'] },
  rose: { draw: c => Art.flowers.rose(c), colors: ['#d63a5a', '#ff9f1c', '#ffffff'] },
  bell: { draw: c => Art.flowers.bell(c), colors: ['#7b6cf0', '#ff6f91'] },
  sunflower: { draw: () => Art.flowers.sunflower(), alt: () => Art.flowers.daisy() },
  cat: { draw: c => Art.things.cat(c), colors: ['#f39c4a', '#6b6b6b', '#2b2b2b'] },
  butterfly: { draw: c => Art.things.butterfly(c), colors: ['#ff8fb1', '#8fd3ff', '#ffd166'] },
  mushroom: { draw: () => Art.things.mushroom(), alt: () => Art.things.snail() },
  basket: { draw: () => Art.things.basket(), alt: () => Art.things.wateringCan() },
  bird: { draw: c => c === 'b' ? Art.birds.canary() : Art.birds.bluebird(), colors: ['a', 'b'] },
  umbrella: { draw: c => Art.things.umbrella(c), colors: ['#9b59d0', '#e2402f'] },
  ladybug: { draw: () => Art.things.ladybug(), alt: () => Art.things.bee() },
  cloud: { draw: () => `<path d="M20 70 C 4 70, 4 48, 20 46 C 20 26, 46 22, 52 38 C 60 24, 84 30, 80 50 C 96 52, 94 70, 80 70Z" fill="#fff"/>`, alt: () => Art.things.sun() },
  sun: { draw: () => Art.things.sun() }
};
const diffLayouts = [
  [['sun', 330, 10, 60], ['cloud', 60, 14, 70], ['cloud', 210, 4, 54], ['house', 40, 90, 110], ['tree', 250, 70, 120], ['tulip', 20, 190, 56], ['rose', 160, 180, 60], ['cat', 190, 140, 66], ['butterfly', 140, 70, 42], ['bell', 330, 184, 54], ['mushroom', 280, 200, 46], ['basket', 100, 196, 50], ['bird', 300, 120, 50], ['ladybug', 236, 216, 36], ['sunflower', 360, 160, 60], ['umbrella', 80, 50, 40]]
];
const gDiff = {
  id: 'diff', name: 'Найдите отличия', area: 'Внимание к деталям', c1: '#dff3ff', c2: '#b9e3ff',
  desc: 'Сравните две картинки сада и найдите, чем они отличаются.',
  pro: 'Избирательное внимание, зрительный поиск и сравнение.',
  levels: ['3 отличия', '5 отличий', '7 отличий'],
  steps: ['Посмотрите на две картинки. Они почти одинаковые.', 'Найдите, что изменилось: цвет, предмет или чего-то не хватает.', 'Нажмите на отличие на любой из картинок — появится кружок.'],
  cover: cover('Дом', 'Кошка', 'Бабочка'),
  demo() { return `<div class="demo-diff"><div>${P('Тюльпан')}${P('Кошка')}</div><div>${P('Тюльпан')}<span class="ring-mark">${P('Бабочка')}</span></div></div>`; },
  play(stage, level, api) {
    const k = [3, 5, 7][level - 1];
    const layout = diffLayouts[0].map(([type, x, y, s]) => ({ type, x, y, s, color: sceneItems[type].colors ? sceneItems[type].colors[0] : null }));
    // перетасуем цвета/расположение немного
    layout.forEach(it => { if (sceneItems[it.type].colors && Math.random() < .5) it.color = sceneItems[it.type].colors[rand(sceneItems[it.type].colors.length)]; it.x += rand(12) - 6; });
    const candidates = layout.map((it, i) => i).filter(i => layout[i].type !== 'sun' || level > 1);
    const diffs = pick(candidates, k).map(i => {
      const it = layout[i], spec = sceneItems[it.type], opts = ['hide'];
      if (spec.colors) opts.push('color', 'color'); if (spec.alt) opts.push('alt', 'alt');
      return { i, kind: opts[rand(opts.length)] };
    });
    const dmap = new Map(diffs.map(d => [d.i, d]));
    const build = right => {
      let s = Art.sceneBackground(400, 260);
      layout.forEach((it, i) => {
        const d = right ? dmap.get(i) : null, spec = sceneItems[it.type];
        if (d && d.kind === 'hide') return;
        let inner;
        if (d && d.kind === 'color') { const other = spec.colors.filter(c => c !== it.color); inner = spec.draw(other[rand(other.length)]); }
        else if (d && d.kind === 'alt') inner = spec.alt();
        else inner = spec.draw(it.color);
        s += inSvg(inner, it.x, it.y, it.s, it.s);
      });
      diffs.forEach((d, n) => { const it = layout[d.i]; s += `<circle class="hit" data-d="${n}" cx="${it.x + it.s / 2}" cy="${it.y + it.s / 2}" r="${Math.max(26, it.s / 2)}" fill="transparent"/>`; });
      return `<svg class="diff-svg" viewBox="0 0 400 260" data-side="${right ? 'r' : 'l'}">${s}<g class="marks"></g></svg>`;
    };
    stage.innerHTML = `<div class="diff-wrap"><div class="diff-pane"><span class="pane-lbl">Картинка 1</span>${build(false)}</div><div class="diff-pane"><span class="pane-lbl">Картинка 2</span>${build(true)}</div></div>
      <div class="stage-actions"><button class="btn ghost" id="hint">${Icons.bulb} Подсказка</button></div>`;
    const found = new Set(); let misses = 0, hints = 0;
    const upd = () => api.status(`Найдено отличий: <b>${found.size} из ${k}</b>`);
    upd();
    const mark = (n, cls = 'found') => $$('.diff-svg', stage).forEach(svg => {
      const d = diffs[n], it = layout[d.i];
      svg.querySelector('.marks').insertAdjacentHTML('beforeend', `<circle class="mark ${cls}" cx="${it.x + it.s / 2}" cy="${it.y + it.s / 2}" r="${Math.max(24, it.s / 2 + 2)}"/>`);
    });
    $$('.diff-svg', stage).forEach(svg => svg.addEventListener('click', e => {
      const hit = e.target.closest('.hit');
      if (hit) {
        const n = +hit.dataset.d; if (found.has(n)) return;
        found.add(n); mark(n); api.good(null, found.size === k ? 'Все отличия найдены!' : undefined); upd();
        if (found.size === k) api.later(() => api.done(k / (k + misses * .3 + hints * .5), `Найдено ${k} ${plural(k, 'отличие', 'отличия', 'отличий')}.`), 1400);
      } else { misses++; Sound.soft(); const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); svg.querySelector('.marks').insertAdjacentHTML('beforeend', `<circle class="mark miss" cx="${p.x}" cy="${p.y}" r="14"/>`); const m = svg.querySelector('.marks').lastElementChild; setTimeout(() => m.remove(), 900); }
    }));
    $('#hint', stage).onclick = () => {
      const left = diffs.map((d, n) => n).filter(n => !found.has(n)); if (!left.length) return;
      hints++; const n = left[rand(left.length)]; mark(n, 'hintm');
      setTimeout(() => $$('.mark.hintm', stage).forEach(m => m.remove()), 1800);
    };
  }
};

/* ===== 3. Цвет и слово ===== */
const gStroop = {
  id: 'stroop', name: 'Цвет и слово', area: 'Контроль внимания', c1: '#fff0d6', c2: '#ffd9a0',
  desc: 'Назовите цвет букв, а не то, что написано.',
  pro: 'Тормозной контроль (эффект Струпа), устойчивость внимания. Требует различения цветов.',
  levels: ['10 слов, 4 цвета', '12 слов, больше путаницы', '14 слов, 5 цветов'],
  steps: ['На табличке появится слово, написанное краской.', 'Нажмите кнопку того <b>цвета, которым написано слово</b>.', 'Не обращайте внимания на смысл слова — смотрите на краску.'],
  cover: () => `<span class="cover stroop-cover"><b style="color:#1d4ed8">КРАСНЫЙ</b><b style="color:#15803d">СИНИЙ</b></span>`,
  demo() { return `<div class="demo-stroop"><div class="sign"><b style="color:#1d4ed8">КРАСНЫЙ</b></div><div class="demo-btns"><span class="cbtn" style="--k:#d62828">Красный</span><span class="cbtn pick" style="--k:#1d4ed8">Синий</span></div></div>`; },
  play(stage, level, api) {
    const all = [['Красный', '#d62828'], ['Синий', '#1d4ed8'], ['Зелёный', '#15803d'], ['Фиолетовый', '#7e22ce'], ['Оранжевый', '#ea580c']];
    const colors = level === 3 ? all : all.slice(0, 4);
    const total = [10, 12, 14][level - 1], congr = [.5, .25, .2][level - 1];
    const trials = Array.from({ length: total }, () => { const ink = rand(colors.length); let word = ink; if (Math.random() > congr) { do word = rand(colors.length); while (word === ink); } return { ink, word }; });
    let i = 0, correct = 0, firstTry = true;
    stage.innerHTML = `<div class="stroop"><div class="sign-board"><div class="sign-post"></div><div class="sign" id="sign"><b id="word"></b></div></div>
      <div class="color-btns">${colors.map(([n, c], k) => `<button class="cbtn" data-k="${k}" style="--k:${c}"><span class="blob"></span>${n}</button>`).join('')}</div>
      <div class="dots">${trials.map(() => '<i></i>').join('')}</div></div>`;
    const show = () => {
      const t = trials[i], w = $('#word', stage);
      w.textContent = colors[t.word][0].toUpperCase(); w.style.color = colors[t.ink][1];
      FX.pop($('#sign', stage)); firstTry = true;
      api.status(`Слово <b>${i + 1} из ${total}</b> · Каким цветом написано?`);
    };
    show();
    $$('.cbtn', stage).forEach(b => b.onclick = () => {
      const t = trials[i]; if (!t) return;
      if (+b.dataset.k === t.ink) {
        if (firstTry) correct++;
        $$('.dots i', stage)[i].className = firstTry ? 'ok' : 'half';
        api.good(b, false); i++;
        if (i >= total) api.later(() => api.done(correct / total, `Верно с первого раза: ${correct} из ${total}.`), 600);
        else api.later(show, 450);
      } else { firstTry = false; api.miss(b, 'Посмотрите на цвет букв'); }
    });
  }
};

/* ===== 4. Тропа чисел ===== */
const gTrail = {
  id: 'trail', name: 'Тропа чисел', area: 'Внимание и переключение', c1: '#e6f7dc', c2: '#c4eab0',
  desc: 'Соедините камешки на тропинке по порядку: 1, 2, 3…',
  pro: 'Зрительный поиск, скорость обработки; уровень 3 — переключение (аналог Trail Making B).',
  levels: ['от 1 до 8', 'от 1 до 12', '1 → А → 2 → Б …'],
  steps: ['На поляне лежат камешки с числами.', 'Нажимайте их по порядку: 1, потом 2, потом 3…', 'Божья коровка проложит за вами тропинку.'],
  cover: () => `<span class="cover trail-cover"><i>1</i><i>2</i><i>3</i></span>`,
  demo() { return `<svg viewBox="0 0 200 130" class="demo-trail"><path d="M40 90 L 100 40 L 160 85" stroke="#d98b3a" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round" fill="none"/>${[[40, 90, 1], [100, 40, 2], [160, 85, 3]].map(([x, y, n]) => `<g><circle cx="${x}" cy="${y}" r="20" fill="#f1e6d2" stroke="#b49a76" stroke-width="3"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="#4a3b2a">${n}</text></g>`).join('')}</svg>`; },
  play(stage, level, api) {
    const letters = 'АБВГДЕЖЗ';
    const labels = level === 3 ? Array.from({ length: 12 }, (_, i) => i % 2 ? letters[(i - 1) / 2] : String(i / 2 + 1)) : Array.from({ length: [8, 12][level - 1] }, (_, i) => String(i + 1));
    const W = 600, H = 400, R = 30, pts = [];
    let tries = 0;
    while (pts.length < labels.length && tries < 5000) { tries++; const p = { x: 50 + Math.random() * (W - 100), y: 50 + Math.random() * (H - 100) }; if (pts.every(q => Math.hypot(q.x - p.x, q.y - p.y) > R * 3.2)) pts.push(p); }
    let deco = '';
    for (let i = 0; i < 9; i++) deco += inSvg(Art.flowers[['daisy', 'tulip', 'cornflower'][i % 3]](), rand(W - 40), rand(H - 40), 34, 34, 'opacity=".55"');
    stage.innerHTML = `<svg class="trail-svg" viewBox="0 0 ${W} ${H}">
      <defs><radialGradient id="meadow" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#d9f2c4"/><stop offset="1" stop-color="#a9d98a"/></radialGradient></defs>
      <rect width="${W}" height="${H}" rx="24" fill="url(#meadow)"/>${deco}<path id="tpath" d="" stroke="#c97a2a" stroke-width="7" stroke-dasharray="2 14" stroke-linecap="round" fill="none"/>
      ${pts.map((p, i) => `<g class="stone" data-i="${i}" transform="translate(${p.x} ${p.y})"><circle r="${R + 8}" fill="transparent"/><ellipse rx="${R + 4}" ry="${R}" cy="4" fill="#00000018"/><ellipse class="st-body" rx="${R + 4}" ry="${R}" fill="#f3ead8" stroke="#b49a76" stroke-width="3"/><text y="10" text-anchor="middle" class="st-num">${labels[i]}</text></g>`).join('')}
      <g id="bug" style="transition:transform .6s ease" transform="translate(${pts[0].x - 70} ${pts[0].y - 70})">${inSvg(Art.things.ladybug(), 0, 0, 40, 40)}</g></svg>`;
    let next = 0, errors = 0, d = '', idle;
    const upd = () => api.status(next < labels.length ? `Следующий камешек: <b class="big-n">${labels[next]}</b>` : 'Тропинка готова!');
    const nudge = () => { clearTimeout(idle); if (level === 1) idle = api.later(() => { const g = $(`.stone[data-i="${next}"]`, stage); if (g) g.classList.add('nudge'); }, 7000); };
    upd(); nudge();
    $$('.stone', stage).forEach(g => g.onclick = () => {
      const i = +g.dataset.i; if (i < next) return;
      if (i === next) {
        g.classList.add('done'); g.classList.remove('nudge'); Sound.tone(440 + next * 40, .25, 'sine', .12);
        d += (next ? ' L ' : 'M ') + pts[i].x + ' ' + pts[i].y; $('#tpath', stage).setAttribute('d', d);
        $('#bug', stage).setAttribute('transform', `translate(${pts[i].x - 20} ${pts[i].y - 58})`);
        next++; upd(); nudge();
        if (next === labels.length) { api.good(null, 'Тропинка проложена!'); api.later(() => api.done(labels.length / (labels.length + errors * .5), errors ? '' : 'Без единой ошибки!'), 1200); }
      } else { errors++; api.miss(g, `Сейчас ищем «${labels[next]}»`); }
    });
    return () => clearTimeout(idle);
  }
};

/* ===== 5. Маршрут ёжика ===== */
const gRoute = {
  id: 'route', name: 'Маршрут ёжика', area: 'Пространственная память', c1: '#f3e8d6', c2: '#e6cfa8',
  desc: 'Проследите по стрелкам, куда придёт ёжик, и покажите эту клетку.',
  pro: 'Рабочая и пространственная память; уровень 3 — смена правила (красная стрелка — в обратную сторону).',
  levels: ['3 шага, стрелки видны', '4–5 шагов по очереди', '5 шагов, красные — наоборот'],
  steps: ['Ёжик стоит на грядке. Ниже показаны стрелки — куда он пойдёт.', 'Мысленно проведите ёжика по стрелкам.', 'Нажмите на клетку, где он окажется. Ёжик покажет свой путь.'],
  cover: cover('Ёжик', 'Яблоко'),
  demo() { return `<div class="demo-route"><div class="mini-grid">${Array.from({ length: 9 }, (_, i) => `<span class="${i === 3 ? 'hh' : ''} ${i === 2 ? 'target' : ''}">${i === 3 ? P('Ёжик') : ''}</span>`).join('')}</div><div class="arrows-row"><span class="arw">→</span><span class="arw">↑</span></div></div>`; },
  play(stage, level, api) {
    const N = 5, rounds = 5, D = { up: [0, -1, '↑'], down: [0, 1, '↓'], left: [-1, 0, '←'], right: [1, 0, '→'] }, OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
    let round = 0, correct = 0, cur;
    stage.innerHTML = `<div class="route"><div class="route-grid" style="--n:${N}">${Array.from({ length: N * N }, (_, i) => `<button class="cell" data-i="${i}" aria-label="Клетка ${i + 1}"></button>`).join('')}<div class="hh-token" id="hh">${P('Ёжик')}</div></div>
      <div class="route-side"><div class="arrows" id="arrows"></div><button class="btn primary" id="ready" hidden>Я запомнил(а)</button></div></div>`;
    const cells = $$('.cell', stage), hh = $('#hh', stage);
    const place = (x, y) => { hh.style.setProperty('--x', x); hh.style.setProperty('--y', y); };
    const newRound = () => {
      cells.forEach(c => c.className = 'cell');
      const len = level === 1 ? 3 : level === 2 ? 4 + (round > 2 ? 1 : 0) : 5;
      let x = rand(N), y = rand(N); const sx = x, sy = y, steps = [], path = [[x, y]];
      while (steps.length < len) {
        const dir = pick(Object.keys(D), 1)[0], red = level === 3 && Math.random() < .4, real = red ? OPP[dir] : dir;
        const nx = x + D[real][0], ny = y + D[real][1];
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        x = nx; y = ny; steps.push({ dir, red }); path.push([x, y]);
      }
      cur = { sx, sy, ex: x, ey: y, path, steps, answered: false };
      hh.classList.add('notrans'); place(sx, sy); void hh.offsetWidth; hh.classList.remove('notrans');
      cells[sy * N + sx].classList.add('start');
      const arrows = $('#arrows', stage);
      arrows.innerHTML = steps.map(s => `<span class="arw ${s.red ? 'red' : ''}">${D[s.dir][2]}</span>`).join('');
      api.status(`Маршрут <b>${round + 1} из ${rounds}</b>${level === 3 ? ' · <span class="red-t">красная стрелка — в обратную сторону</span>' : ''}`);
      if (level === 1) { cur.ready = true; arrows.classList.remove('hide'); }
      else {
        cur.ready = false; const a = $$('.arw', arrows); a.forEach(e => e.classList.add('dim'));
        a.forEach((e, k) => api.later(() => { a.forEach(z => z.classList.remove('lit')); e.classList.remove('dim'); e.classList.add('lit'); Sound.tap(); }, 600 + k * 1300));
        api.later(() => { a.forEach(z => z.classList.remove('lit', 'dim')); $('#ready', stage).hidden = false; api.status('Запомнили маршрут? Нажмите «Я запомнил(а)» — и покажите клетку.'); }, 600 + a.length * 1300);
      }
    };
    $('#ready', stage).onclick = () => { $('#arrows', stage).classList.add('hide'); $('#ready', stage).hidden = true; cur.ready = true; api.status('Куда пришёл ёжик? Нажмите на клетку.'); };
    cells.forEach(c => c.onclick = () => {
      if (!cur || cur.answered || !cur.ready) return;
      cur.answered = true; const i = +c.dataset.i, ok = i === cur.ey * N + cur.ex;
      if (ok) { correct++; c.classList.add('right'); api.good(c); } else { c.classList.add('wrongc'); cells[cur.ey * N + cur.ex].classList.add('right'); toast('Посмотрите, как шёл ёжик', 'soft'); Sound.soft(); }
      cur.path.forEach(([x, y], k) => api.later(() => { place(x, y); if (k) cells[y * N + x].classList.add('trail'); }, k * 550));
      api.later(() => { $('#arrows', stage).classList.remove('hide'); round++; if (round >= rounds) api.done(correct / rounds, `Верных маршрутов: ${correct} из ${rounds}.`); else newRound(); }, cur.path.length * 550 + 1200);
    });
    newRound();
  }
};

/* ===== 6. Тёплые связи ===== */
const gAssoc = {
  id: 'assoc', name: 'Тёплые связи', area: 'Речь и ассоциации', c1: '#fdeedd', c2: '#f7d1b0',
  desc: 'Найдите, что подходит по смыслу: чайник — чашка, пчела — мёд.',
  pro: 'Семантическая память, словарный запас, знакомые пословицы.',
  levels: ['Картинки', 'Слова', 'Пословицы'],
  steps: ['Посмотрите на картинку или слово сверху.', 'Выберите из вариантов то, что с ним связано.', 'Если ошиблись — просто выберите ещё раз.'],
  cover: cover('Чайник', 'Чашка'),
  demo() { return `<div class="demo-assoc"><div class="q">${P('Пчела')}</div><div class="opts"><span>${P('Зонт')}</span><span class="pick">${P('Мёд')}</span></div></div>`; },
  play(stage, level, api) {
    const pics = [['Чайник', 'Чашка'], ['Пчела', 'Мёд'], ['Ключ', 'Дом'], ['Туча', 'Зонт'], ['Кошка', 'Клубок'], ['Лейка', 'Цветок в горшке'], ['Синичка', 'Скворечник'], ['Солнце', 'Шляпа'], ['Очки', 'Книга'], ['Корзинка', 'Гриб'], ['Бабочка', 'Ромашка'], ['Хлеб', 'Чайник']];
    const words = [['Иголка', 'Нитка'], ['Скрипка', 'Смычок'], ['Хлеб', 'Масло'], ['Море', 'Волна'], ['Самовар', 'Чай'], ['Снег', 'Санки'], ['Замок', 'Ключ'], ['Лук', 'Стрела'], ['Ручка', 'Тетрадь'], ['Молоток', 'Гвоздь'], ['Пальто', 'Пуговица'], ['Корова', 'Молоко'], ['Пчела', 'Улей'], ['Весна', 'Подснежник']];
    const proverbs = [['Без труда не вытащишь и…', 'рыбку из пруда'], ['Тише едешь —', 'дальше будешь'], ['Не имей сто рублей, а…', 'имей сто друзей'], ['Делу время —', 'потехе час'], ['Утро вечера…', 'мудренее'], ['Семь раз отмерь —', 'один раз отрежь'], ['Любишь кататься —', 'люби и саночки возить'], ['Что посеешь,', 'то и пожнёшь'], ['Цыплят по осени…', 'считают'], ['Под лежачий камень…', 'вода не течёт']];
    const set = level === 1 ? pics : level === 2 ? words : proverbs, rounds = 8;
    const qs = pick(set, rounds);
    let r = 0, correct = 0, first = true;
    const show = () => {
      const [q, a] = qs[r];
      const opts = shuffle([a, ...pick(set.filter(p => p[1] !== a && p[0] !== a), 3).map(p => p[1])]);
      first = true;
      const card = v => level === 1 ? `${P(v)}<span class="opt-name">${v}</span>` : `<span class="opt-word">${v}</span>`;
      stage.innerHTML = `<div class="assoc ${level === 3 ? 'prov' : ''}"><div class="assoc-q">${level === 1 ? P(q) : ''}<span class="q-word">${q}</span><span class="q-hint">${level === 3 ? 'Как закончить пословицу?' : 'Что с этим связано?'}</span></div>
        <div class="assoc-opts ${level === 1 ? 'pics' : ''}">${opts.map(o => `<button class="opt" data-v="${o}">${card(o)}</button>`).join('')}</div></div>`;
      api.status(`Вопрос <b>${r + 1} из ${rounds}</b>`);
      $$('.opt', stage).forEach(b => b.onclick = () => {
        if (b.dataset.v === a) {
          if (first) correct++; b.classList.add('right'); api.good(b, level === 3 ? `«${q.replace('…', '')} ${a}»` : `${q} — ${a.toLowerCase()}`);
          r++; api.later(() => r >= rounds ? api.done(correct / rounds, `С первого раза: ${correct} из ${rounds}.`) : show(), 1300);
          $$('.opt', stage).forEach(x => x.onclick = null);
        } else { first = false; b.classList.add('faded'); api.miss(b, 'Попробуйте другой вариант'); }
      });
    };
    show();
  }
};

/* ===== 7. Садовые колокольчики ===== */
const gBells = {
  id: 'bells', name: 'Садовые колокольчики', area: 'Рабочая память', c1: '#ece6ff', c2: '#d4c8ff',
  desc: 'Колокольчики звенят по очереди — повторите мелодию в том же порядке.',
  pro: 'Рабочая память на последовательности (зрительно-слуховой вариант теста Корси).',
  levels: ['4 цветка, медленно', '5 цветков', '6 цветков'],
  steps: ['Цветы-колокольчики по очереди засветятся и зазвенят.', 'Когда появится надпись «Ваша очередь», нажмите их в том же порядке.', 'Каждый раз мелодия будет на один звук длиннее.'],
  cover: cover('Колокольчик', 'Колокольчик'),
  demo() { return `<div class="demo-bells">${['#7b6cf0', '#ff6f91', '#3fb6a8'].map((c, i) => `<span class="db ${i === 1 ? 'lit' : ''}">${Art.wrap(Art.flowers.bell(c))}<i>${i + 1}</i></span>`).join('')}</div>`; },
  play(stage, level, api) {
    const n = [4, 5, 6][level - 1], speed = [1000, 850, 750][level - 1], target = [5, 6, 7][level - 1];
    const cols = ['#7b6cf0', '#ff6f91', '#3fb6a8', '#ffb627', '#4a90e2', '#e2533a'];
    stage.innerHTML = `<div class="bells" style="--n:${n}">${Array.from({ length: n }, (_, i) => `<button class="bell-btn" data-i="${i}" style="--bc:${cols[i]}" aria-label="Колокольчик ${i + 1}"><span class="glow"></span>${Art.wrap(Art.flowers.bell(cols[i]))}</button>`).join('')}</div>
      <div class="stage-actions"><button class="btn ghost" id="replay">${Icons.redo} Повторить мелодию</button></div>`;
    const btns = $$('.bell-btn', stage);
    let seq = [], input = 0, listening = false, best = 0, mistakes = 0;
    const flash = i => { const b = btns[i]; b.classList.add('lit'); Sound.bell(i); setTimeout(() => b.classList.remove('lit'), speed * .6); };
    const playSeq = () => {
      listening = false; input = 0; api.status(`Слушайте и смотрите… <b>${seq.length} ${plural(seq.length, 'звук', 'звука', 'звуков')}</b>`);
      seq.forEach((s, k) => api.later(() => flash(s), 700 + k * speed));
      api.later(() => { listening = true; api.status('<b>Ваша очередь!</b> Нажмите цветы в том же порядке.'); }, 700 + seq.length * speed);
    };
    const grow = () => { seq.push(rand(n)); playSeq(); };
    seq = Array.from({ length: level === 1 ? 2 : 3 }, () => rand(n)); playSeq();
    $('#replay', stage).onclick = () => { if (listening) playSeq(); };
    btns.forEach(b => b.onclick = () => {
      if (!listening) return; const i = +b.dataset.i; flash(i);
      if (i === seq[input]) {
        input++;
        if (input === seq.length) {
          listening = false; best = Math.max(best, seq.length); api.good(b, `Мелодия из ${seq.length} звуков — верно!`);
          if (seq.length >= target) api.later(() => api.done(1, `Вы повторили мелодию из ${seq.length} звуков!`), 1200);
          else api.later(grow, 1300);
        }
      } else {
        listening = false; mistakes++;
        if (mistakes >= 3) { api.miss(b, 'Хорошая попытка!'); api.later(() => api.done(Math.max(best, 1) / target, `Самая длинная мелодия: ${best} ${plural(best, 'звук', 'звука', 'звуков')}.`), 1300); }
        else { api.miss(b, 'Послушаем мелодию ещё раз'); api.later(playSeq, 1500); }
      }
    });
  }
};

/* ===== 8. Найдите в саду ===== */
const gFind = {
  id: 'find', name: 'Найдите в саду', area: 'Зрительный поиск', c1: '#e2f5e9', c2: '#b9e6c8',
  desc: 'В саду спрятались предметы. Найдите все из списка.',
  pro: 'Зрительный поиск среди отвлекающих стимулов, удержание цели.',
  levels: ['3 предмета', '4 предмета, больше вещей', '5 предметов, тесно'],
  steps: ['Сверху показано, что нужно найти.', 'Найдите эти предметы на картинке сада.', 'Нажмите на найденный предмет — он отметится галочкой.'],
  cover: cover('Лейка', 'Улитка', 'Очки'),
  demo() { return `<div class="demo-find"><div class="want">${P('Ключ')}</div><div class="scene-mini">${P('Гриб')}${P('Кошка')}<span class="ring-mark">${P('Ключ')}</span>${P('Роза')}</div></div>`; },
  play(stage, level, api) {
    const pool = ['Лейка', 'Кошка', 'Бабочка', 'Гриб', 'Корзинка', 'Шляпа', 'Чайник', 'Чашка', 'Божья коровка', 'Скворечник', 'Улитка', 'Ключ', 'Очки', 'Зонт', 'Книга', 'Пчела', 'Мёд', 'Клубок', 'Яблоко', 'Груша', 'Лимон', 'Вишня', 'Синичка', 'Ёжик', 'Письмо', 'Хлеб'];
    const k = [3, 4, 5][level - 1], total = [10, 15, 21][level - 1];
    const chosen = pick(pool, total), targets = chosen.slice(0, k);
    const W = 640, H = 400, cell = level === 3 ? [7, 3] : level === 2 ? [5, 3] : [5, 2];
    const slots = [];
    for (let r = 0; r < cell[1]; r++) for (let c = 0; c < cell[0]; c++) slots.push([c, r]);
    const sz = level === 3 ? 70 : 84;
    const cw = W / cell[0], ch = (H - 120) / cell[1];
    let objs = '';
    const placed = shuffle(slots).slice(0, total);
    chosen.forEach((name, i) => {
      const [c, r] = placed[i];
      const x = c * cw + (cw - sz) / 2 + (rand(20) - 10), y = 110 + r * ch + (ch - sz) / 2 + (rand(16) - 8);
      objs += `<g class="fobj" data-n="${name}">${inSvg(Art.catalog[name](), x, y, sz, sz, `transform="rotate(${rand(24) - 12} ${x + sz / 2} ${y + sz / 2})"`)}<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="transparent"/></g>`;
    });
    let deco = '';
    for (let i = 0; i < 8; i++) deco += inSvg(Art.flowers[['daisy', 'tulip', 'lavender', 'cornflower'][i % 4]](), i * 80 + rand(30), 300 + rand(60), 48, 48, 'opacity=".9" pointer-events="none"');
    stage.innerHTML = `<div class="find"><div class="find-list">${targets.map(t => `<span class="want-item" data-n="${t}">${P(t)}<b>${t}</b></span>`).join('')}</div>
      <svg class="find-svg" viewBox="0 0 ${W} ${H}">${Art.sceneBackground(W, H)}${deco}${objs}</svg></div>`;
    const got = new Set(); let misses = 0;
    const upd = () => api.status(`Найдено: <b>${got.size} из ${k}</b>`);
    upd();
    $$('.fobj', stage).forEach(g => g.onclick = () => {
      const n = g.dataset.n;
      if (targets.includes(n) && !got.has(n)) {
        got.add(n); g.classList.add('got'); $(`.want-item[data-n="${n}"]`, stage).classList.add('got'); api.good(null, `${n} — нашли!`); upd();
        if (got.size === k) api.later(() => api.done(k / (k + misses * .3), 'Все предметы найдены!'), 1200);
      } else if (!targets.includes(n)) { misses++; api.miss(g, `Это ${n.toLowerCase()}, а не то, что ищем`); }
    });
  }
};

/* ===== 9. Собери картину ===== */
function puzzleScene(variant) {
  const sky = Art.uid('psk');
  const base = `<defs>${Art.linear(sky, variant === 1 ? '#ffd1a8' : '#9fd8ff', '#fff6e0')}</defs><rect width="400" height="300" fill="url(#${sky})"/>
    ${inSvg(Art.things.sun(), 290, 14, 90, 90)}
    <path d="M0 170 C 80 130, 160 160, 240 140 C 320 120, 360 150, 400 140 L 400 300 L 0 300Z" fill="#a8d878"/>
    <path d="M0 210 C 120 180, 260 220, 400 196 L 400 300 L 0 300Z" fill="#6fb24e"/>
    <path d="M170 300 C 190 260, 210 230, 220 200 L 236 200 C 236 236, 240 268, 260 300Z" fill="#ecd9ad"/>`;
  const parts = variant === 1
    ? [['Дом', 30, 90, 130], ['Подсолнух', 170, 150, 70], ['Кошка', 300, 190, 80], ['Тюльпан', 10, 220, 70], ['Роза', 250, 220, 60], ['Бабочка', 120, 40, 50]]
    : [['Скворечник', 40, 100, 90], ['Яблоко', 160, 60, 50], ['Ромашка', 120, 200, 80], ['Ёжик', 260, 200, 90], ['Колокольчик', 340, 150, 60], ['Синичка', 180, 120, 60], ['Мак', 20, 220, 70]];
  return base + parts.map(([n, x, y, s]) => inSvg(Art.catalog[n](), x, y, s, s)).join('');
}
const gPuzzle = {
  id: 'puzzle', name: 'Собери картину', area: 'Зрительно-пространственное мышление', c1: '#fff3c9', c2: '#ffe08a',
  desc: 'Картинка рассыпалась на кусочки. Поменяйте их местами и соберите сад.',
  pro: 'Зрительно-пространственный анализ и синтез, планирование.',
  levels: ['6 кусочков', '9 кусочков', '16 кусочков'],
  steps: ['Картинка разрезана на части и перемешана.', 'Нажмите на кусочек, затем на другой — они поменяются местами.', 'Кусочки на своём месте подсвечиваются зелёной рамкой.'],
  cover: () => `<span class="cover puzzle-cover">${Art.wrap(puzzleScene(0), '0 0 400 300')}</span>`,
  demo() { return `<div class="demo-puzzle">${[0, 1, 2, 3].map(i => `<span class="${i === 1 ? 'sel' : ''}">${Art.wrap(puzzleScene(0), `${[200, 0, 0, 200][i]} ${[0, 0, 150, 150][i]} 200 150`)}</span>`).join('')}</div>`; },
  play(stage, level, api) {
    const [cols, rows] = [[3, 2], [3, 3], [4, 4]][level - 1], n = cols * rows, variant = rand(2);
    const tw = 400 / cols, th = 300 / rows;
    let perm; do perm = shuffle([...Array(n).keys()]); while (perm.filter((p, i) => p === i).length > Math.floor(n / 4));
    const cycles = (() => { const seen = new Set(); let c = 0; perm.forEach((_, i) => { if (seen.has(i)) return; c++; let j = i; while (!seen.has(j)) { seen.add(j); j = perm[j]; } }); return c; })();
    const minSwaps = n - cycles;
    stage.innerHTML = `<div class="puzzle"><div class="pz-board" style="--cols:${cols};--rows:${rows}" id="board"></div>
      <div class="pz-side"><span class="pane-lbl">Образец</span><div class="pz-sample">${Art.wrap(puzzleScene(variant), '0 0 400 300')}</div></div></div>`;
    const board = $('#board', stage);
    const tile = p => Art.wrap(puzzleScene(variant), `${(p % cols) * tw} ${Math.floor(p / cols) * th} ${tw} ${th}`);
    const tiles = [...Array(n).keys()].map(p => tile(p));
    let sel = null, moves = 0;
    const draw = () => {
      board.innerHTML = perm.map((p, i) => `<button class="pz-tile ${p === i ? 'ok' : ''}" data-i="${i}">${tiles[p]}</button>`).join('');
      $$('.pz-tile', board).forEach(b => b.onclick = () => {
        const i = +b.dataset.i;
        if (sel === null) { sel = i; b.classList.add('sel'); Sound.tap(); return; }
        if (sel === i) { sel = null; b.classList.remove('sel'); return; }
        [perm[sel], perm[i]] = [perm[i], perm[sel]]; moves++;
        const placedNow = perm[sel] === sel || perm[i] === i; sel = null; draw();
        if (placedNow) Sound.good(); else Sound.tap();
        const done = perm.every((p, k) => p === k);
        upd();
        if (done) { board.classList.add('complete'); api.good(null, 'Картина собрана!'); api.later(() => api.done(Math.min(1, minSwaps / moves * 1.15), `Собрано за ${moves} ${plural(moves, 'ход', 'хода', 'ходов')}.`), 1500); }
      });
    };
    const upd = () => api.status(`На месте: <b>${perm.filter((p, i) => p === i).length} из ${n}</b> · ходов: ${moves}`);
    draw(); upd();
  }
};

/* ===== 10. Сад воспоминаний ===== */
const gGrid = {
  id: 'grid', name: 'Сад воспоминаний', area: 'Зрительная память', c1: '#e9f6d6', c2: '#cbe8a4',
  desc: 'Запомните, на каких грядках выросли цветы, и найдите эти места.',
  pro: 'Зрительно-пространственная кратковременная память.',
  levels: ['3×3, 3 цветка', '4×4, 5 цветков', '5×5, 7 цветков'],
  steps: ['На некоторых грядках появятся цветы. Рассмотрите их не спеша.', 'Нажмите «Я запомнил(а)» — цветы спрячутся.', 'Нажмите на грядки, где были цветы, и затем «Проверить».'],
  cover: cover('Мак', 'Ромашка'),
  demo() { return `<div class="mini-grid beds">${Array.from({ length: 9 }, (_, i) => `<span>${[0, 4, 8].includes(i) ? P(['Тюльпан', 'Ромашка', 'Мак'][i / 4]) : ''}</span>`).join('')}</div>`; },
  play(stage, level, api) {
    const N = level + 2, k = [3, 5, 7][level - 1], rounds = 3;
    const fl = ['Тюльпан', 'Ромашка', 'Мак', 'Роза', 'Подсолнух', 'Василёк', 'Колокольчик', 'Лаванда'];
    let round = 0, total = 0, targets, chosen, phase;
    const newRound = () => {
      targets = new Set(pick([...Array(N * N).keys()], k)); chosen = new Set(); phase = 'look';
      stage.innerHTML = `<div class="memgrid-wrap"><div class="memgrid" style="--n:${N}">${Array.from({ length: N * N }, (_, i) => `<button class="bed ${targets.has(i) ? 'has' : ''}" data-i="${i}" aria-label="Грядка ${i + 1}"><span class="bed-plant">${targets.has(i) ? P(fl[rand(fl.length)]) : ''}</span><span class="bed-mark">${P('Цветок в горшке')}</span></button>`).join('')}</div>
        <div class="stage-actions"><button class="btn big primary" id="act">Я запомнил(а)</button></div></div>`;
      api.status(`Раунд <b>${round + 1} из ${rounds}</b> · Запомните, где растут цветы (${k})`);
      const beds = $$('.bed', stage);
      beds.forEach(b => b.onclick = () => {
        if (phase !== 'pick') return; const i = +b.dataset.i;
        if (chosen.has(i)) { chosen.delete(i); b.classList.remove('chosen'); } else if (chosen.size < k) { chosen.add(i); b.classList.add('chosen'); Sound.tap(); }
        api.status(`Отмечено грядок: <b>${chosen.size} из ${k}</b>`);
        $('#act', stage).disabled = chosen.size === 0;
      });
      $('#act', stage).onclick = () => {
        if (phase === 'look') { phase = 'pick'; stage.querySelector('.memgrid').classList.add('hidden-plants'); $('#act', stage).textContent = 'Проверить'; $('#act', stage).disabled = true; api.status(`Где были цветы? Отметьте ${k} ${plural(k, 'грядку', 'грядки', 'грядок')}.`); }
        else if (phase === 'pick') {
          phase = 'show'; stage.querySelector('.memgrid').classList.remove('hidden-plants');
          let hit = 0; beds.forEach((b, i) => { if (chosen.has(i) && targets.has(i)) { hit++; b.classList.add('right'); } else if (chosen.has(i)) b.classList.add('wrongc'); else if (targets.has(i)) b.classList.add('missed'); });
          total += hit / k;
          if (hit === k) api.good(null, 'Все цветы на месте!'); else toast(`Угадано ${hit} из ${k}. Хорошо!`, 'good');
          $('#act', stage).textContent = round + 1 < rounds ? 'Дальше' : 'Готово'; $('#act', stage).disabled = false; phase = 'next';
        } else { round++; if (round >= rounds) api.done(total / rounds, ''); else newRound(); }
      };
    };
    newRound();
  }
};

const GAMES = [gPairs, gDiff, gStroop, gTrail, gBells, gFind, gPuzzle, gRoute, gAssoc, gGrid];
