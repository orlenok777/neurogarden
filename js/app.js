'use strict';
/* НейроСад 2 — ядро: хранение, настройки, страницы, звук, конфетти */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = n => Math.floor(Math.random() * n);
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, k) => shuffle(a).slice(0, k);
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ---------- Хранилище ---------- */
const Store = (() => {
  const KEY = 'neurogarden2';
  const blank = () => ({ history: [], levels: {}, settings: { font: 1, contrast: false, sound: false, motion: true, timer: false }, name: '' });
  let data = blank(), canSave = true, privateMode = false;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); data = { ...blank(), ...d, settings: { ...blank().settings, ...(d.settings || {}) } }; }
    privateMode = localStorage.getItem(KEY + '-private') === '1';
  } catch (e) { canSave = false; }
  const temp = { history: [] };
  const save = () => { if (!canSave) return; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { canSave = false; } };
  return {
    get settings() { return data.settings; },
    setSetting(k, v) { data.settings[k] = v; save(); },
    get history() { return privateMode ? temp.history : data.history; },
    get privateMode() { return privateMode; },
    get canSave() { return canSave; },
    setPrivate(on) { privateMode = on; try { localStorage.setItem(KEY + '-private', on ? '1' : '0'); } catch (e) { } },
    level(id) { return data.levels[id] || 1; },
    addResult(r) {
      const rec = { ...r, day: dayKey(), t: Date.now() };
      if (privateMode) temp.history.push(rec);
      else {
        data.history.push(rec);
        if (data.history.length > 3000) data.history = data.history.slice(-3000);
        if (r.score >= 0.85 && r.level >= (data.levels[r.game] || 1)) data.levels[r.game] = Math.min(3, r.level + 1);
        else if (!data.levels[r.game]) data.levels[r.game] = r.level;
        save();
      }
      return rec;
    },
    reset() { const s = data.settings; data = blank(); data.settings = s; temp.history = []; save(); },
    exportJSON() { return JSON.stringify(data, null, 2); }
  };
})();

/* ---------- Статистика ---------- */
const Stats = {
  days() { return [...new Set(Store.history.map(h => h.day))].sort(); },
  streak() {
    const set = new Set(Store.history.map(h => h.day));
    let d = new Date(), n = 0;
    if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1); // серия не сгорает, пока день не закончился
    while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  todayCount() { const k = dayKey(); return Store.history.filter(h => h.day === k).length; },
  lastDays(n = 14) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d); const items = Store.history.filter(h => h.day === k); out.push({ d, k, count: items.length, avg: items.length ? items.reduce((a, b) => a + b.score, 0) / items.length : 0 }); }
    return out;
  },
  perGame(id) { const items = Store.history.filter(h => h.game === id); return { count: items.length, best: items.reduce((m, h) => Math.max(m, h.score), 0), last: items[items.length - 1] }; }
};

/* ---------- Звук (Web Audio, по умолчанию выкл.) ---------- */
const Sound = (() => {
  let ctx = null;
  const ac = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tone(freq, dur = .35, type = 'sine', vol = .18, delay = 0) {
    if (!Store.settings.sound) return; const c = ac(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .05);
  }
  return {
    tone,
    tap() { tone(660, .12, 'sine', .08); },
    good() { tone(784, .18, 'sine', .14); tone(1046, .3, 'sine', .12, .1); },
    soft() { tone(330, .25, 'triangle', .08); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .45, 'sine', .13, i * .13)); },
    bell(i) { const f = [392, 494, 587, 698, 784, 880][i % 6]; tone(f, .7, 'sine', .2); tone(f * 2, .5, 'sine', .05); }
  };
})();

/* ---------- Конфетти и лепестки ---------- */
const FX = {
  confetti(n = 90) {
    if (!Store.settings.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'); cv.className = 'fx'; document.body.appendChild(cv);
    const dpr = devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const cols = ['#ff7aa8', '#ffd166', '#7bd389', '#8fd3ff', '#b69cff', '#ff9f1c'];
    const ps = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .45, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 4, r: 6 + Math.random() * 8, a: Math.random() * 6, va: (Math.random() - .5) * .3, col: cols[rand(cols.length)], petal: Math.random() > .4 }));
    let t = 0;
    (function loop() {
      c.clearRect(0, 0, innerWidth, innerHeight); t++;
      ps.forEach(p => {
        p.vy += .25; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.col; c.globalAlpha = Math.max(0, 1 - t / 140);
        if (p.petal) { c.beginPath(); c.ellipse(0, 0, p.r * .5, p.r, 0, 0, 7); c.fill(); } else c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        c.restore();
      });
      if (t < 140) requestAnimationFrame(loop); else cv.remove();
    })();
  },
  pop(el) { if (!el || !Store.settings.motion) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); },
  shake(el) { if (!el || !Store.settings.motion) return; el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle'); }
};

const PRAISE = ['Прекрасно!', 'Замечательно!', 'Отлично получилось!', 'Браво!', 'Вы молодец!', 'Чудесно!', 'Великолепно!'];
const GENTLE = ['Почти! Попробуйте ещё раз', 'Ничего страшного — ещё попытка', 'Хорошая попытка!', 'Спокойно, без спешки'];

/* ---------- Подсказка-тост ---------- */
function toast(text, kind = 'good') {
  const t = $('#toast'); t.textContent = text; t.className = 'toast show ' + kind;
  clearTimeout(toast.h); toast.h = setTimeout(() => t.className = 'toast', 1800);
}

/* ---------- Настройки интерфейса ---------- */
function applySettings() {
  const s = Store.settings, b = document.body;
  b.dataset.font = s.font; b.classList.toggle('contrast', !!s.contrast);
  b.classList.toggle('still', !s.motion || matchMedia('(prefers-reduced-motion: reduce)').matches);
  const set = (id, on, txtOn, txtOff) => { const el = $(id); if (!el) return; el.setAttribute('aria-pressed', String(on)); el.querySelector('.lbl').textContent = on ? txtOn : txtOff; };
  set('#btnSound', s.sound, 'Звук: вкл.', 'Звук: выкл.');
  set('#btnMotion', s.motion, 'Движение: вкл.', 'Движение: выкл.');
  set('#btnContrast', s.contrast, 'Контраст: вкл.', 'Контраст: обычный');
  set('#btnTimer', s.timer, 'Таймер: показан', 'Таймер: скрыт');
  $('#btnFont .lbl').textContent = ['Шрифт: обычный', 'Шрифт: крупный', 'Шрифт: очень крупный'][s.font - 1] || 'Шрифт';
  const pm = $('#btnPrivate'); pm.setAttribute('aria-pressed', String(Store.privateMode));
  pm.querySelector('.lbl').textContent = Store.privateMode ? 'Без сохранения' : 'Сохранять прогресс';
}

/* ---------- Маршрутизация ---------- */
const App = {
  page: 'home', queue: [], current: null,
  go(page, arg) {
    Game.stop();
    this.page = page;
    $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
    const main = $('#main'); main.innerHTML = '';
    main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    ({ home: renderHome, games: renderGames, progress: renderProgress, pro: renderPro, play: () => Game.intro(arg) }[page] || renderHome)(main);
    if (page !== 'play') { location.hash = page; }
    window.scrollTo({ top: 0, behavior: 'auto' });
    main.focus({ preventScroll: true });
  },
  startDaily() {
    const played = new Set(Store.history.filter(h => h.day === dayKey()).map(h => h.game));
    const rest = GAMES.filter(g => !played.has(g.id));
    this.queue = pick(rest.length >= 3 ? rest : GAMES, 3).map(g => g.id);
    this.next();
  },
  next() { const id = this.queue.shift(); if (id) this.go('play', id); else this.go('home'); }
};

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
}

function renderHome(main) {
  const sessions = Store.history.length, streak = Stats.streak(), days = Stats.days().length, today = Stats.todayCount();
  const goal = 3, pct = Math.min(100, Math.round(today / goal * 100));
  main.innerHTML = `
  <section class="hero card-soft">
    <div class="hero-text">
      <p class="eyebrow">${greeting()}!</p>
      <h1>Ваш сад внимания и памяти</h1>
      <p class="lead">Каждое занятие сажает новый цветок. Занимайтесь понемногу каждый день — и сад будет цвести.</p>
      <div class="hero-actions">
        <button class="btn big primary" id="daily">${Icons.play} Занятие дня · 3 игры</button>
        <button class="btn big ghost" data-go="games">${Icons.grid} Все игры</button>
      </div>
    </div>
    <div class="goal">
      <svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="50" class="ring-bg"/><circle cx="60" cy="60" r="50" class="ring-fg" style="stroke-dasharray:${pct * 3.14} 314"/></svg>
      <div class="goal-text"><b>${Math.min(today, goal)} из ${goal}</b><span>сегодня</span></div>
    </div>
  </section>
  <section class="garden-wrap">${Garden.render({ sessions, streak, activeDays: days, todayDone: today > 0, motion: Store.settings.motion })}</section>
  <section class="stats">
    <div class="stat"><span class="stat-ic">${Icons.flame}</span><b>${streak}</b><span>${plural(streak, 'день', 'дня', 'дней')} подряд</span></div>
    <div class="stat"><span class="stat-ic">${Icons.flower}</span><b>${Math.min(sessions, Garden.capacity)}</b><span>${plural(Math.min(sessions, Garden.capacity), 'цветок', 'цветка', 'цветов')} в саду</span></div>
    <div class="stat"><span class="stat-ic">${Icons.cal}</span><b>${days}</b><span>${plural(days, 'день', 'дня', 'дней')} занятий</span></div>
  </section>
  ${Store.privateMode ? `<p class="note">Сейчас включён режим «Без сохранения»: сад вырастет только на время этого визита.</p>` : ''}
  <h2 class="section-title">Игры для тренировки</h2>
  <div class="game-grid">${GAMES.map(gameCard).join('')}</div>`;
  $('#daily').onclick = () => App.startDaily();
  bindCards(main);
}

function gameCard(g) {
  const st = Stats.perGame(g.id), lvl = Store.level(g.id);
  return `<button class="game-card" data-game="${g.id}" style="--c1:${g.c1};--c2:${g.c2}">
    <span class="gc-art">${g.cover()}</span>
    <span class="gc-body"><span class="gc-area">${g.area}</span><span class="gc-name">${g.name}</span><span class="gc-desc">${g.desc}</span>
    <span class="gc-meta"><span class="lvl-dots">${[1, 2, 3].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span>${st.count ? `Сыграно: ${st.count}` : 'Новая игра'}</span></span>
  </button>`;
}
function bindCards(root) {
  $$('[data-game]', root).forEach(b => b.onclick = () => { App.queue = []; App.go('play', b.dataset.game); });
  $$('[data-go]', root).forEach(b => b.onclick = () => App.go(b.dataset.go));
}

function renderGames(main) {
  const areas = ['Все', ...new Set(GAMES.map(g => g.area))];
  main.innerHTML = `<h1 class="page-title">Все игры</h1>
  <p class="lead">Выберите любую игру. Перед началом мы покажем, как играть. Спешить не нужно — время по умолчанию не ограничено.</p>
  <div class="chips">${areas.map((a, i) => `<button class="chip ${i ? '' : 'on'}" data-area="${a}">${a}</button>`).join('')}</div>
  <div class="game-grid" id="gg">${GAMES.map(gameCard).join('')}</div>`;
  $$('.chip', main).forEach(c => c.onclick = () => {
    $$('.chip', main).forEach(x => x.classList.toggle('on', x === c));
    const list = c.dataset.area === 'Все' ? GAMES : GAMES.filter(g => g.area === c.dataset.area);
    $('#gg').innerHTML = list.map(gameCard).join(''); bindCards(main);
  });
  bindCards(main);
}

function renderProgress(main) {
  const days = Stats.lastDays(14), max = Math.max(3, ...days.map(d => d.count));
  const wd = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const W = 700, H = 260, bw = W / 14;
  let bars = '';
  days.forEach((d, i) => {
    const h = d.count / max * 170, x = i * bw + 8, y = 200 - h;
    bars += `<g><rect x="${x}" y="${y}" width="${bw - 16}" height="${Math.max(h, 2)}" rx="10" fill="${d.count ? 'url(#barG)' : '#e6efe0'}"/>
      ${d.count ? `<text x="${x + (bw - 16) / 2}" y="${y - 8}" text-anchor="middle" class="bar-num">${d.count}</text>` : ''}
      <text x="${x + (bw - 16) / 2}" y="226" text-anchor="middle" class="bar-lbl">${wd[d.d.getDay()]}</text>
      <text x="${x + (bw - 16) / 2}" y="250" text-anchor="middle" class="bar-lbl small">${d.d.getDate()}</text></g>`;
  });
  const cal = Stats.lastDays(28).map(d => `<span class="cal-day ${d.count ? 'on' : ''}" title="${d.k}">${d.count ? Art.wrap(Art.flowers.daisy(), '20 15 60 50') : ''}</span>`).join('');
  main.innerHTML = `<h1 class="page-title">Мой прогресс</h1>
  <section class="stats">
    <div class="stat"><span class="stat-ic">${Icons.flame}</span><b>${Stats.streak()}</b><span>дней подряд</span></div>
    <div class="stat"><span class="stat-ic">${Icons.flower}</span><b>${Store.history.length}</b><span>занятий всего</span></div>
    <div class="stat"><span class="stat-ic">${Icons.star}</span><b>${Store.history.length ? Math.round(Store.history.reduce((a, b) => a + b.score, 0) / Store.history.length * 100) : 0}%</b><span>средний результат</span></div>
  </section>
  <div class="card-soft"><h2>Занятия за 2 недели</h2>
    <svg viewBox="0 0 ${W} ${H}" class="chart"><defs><linearGradient id="barG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7bd389"/><stop offset="1" stop-color="#3f9d5a"/></linearGradient></defs>${bars}</svg></div>
  <div class="card-soft"><h2>Календарь цветения · 4 недели</h2><div class="cal">${cal}</div>
    <p class="muted">Каждый цветок — день, когда вы занимались.</p></div>
  <div class="card-soft"><h2>По играм</h2><div class="per-game">
    ${GAMES.map(g => { const s = Stats.perGame(g.id); return `<div class="pg-row"><span class="pg-art">${g.cover()}</span><span class="pg-name">${g.name}<small>${g.area}</small></span>
      <span class="pg-bar"><i style="width:${Math.round(s.best * 100)}%"></i></span><span class="pg-num">${s.count ? Math.round(s.best * 100) + '%' : '—'}<small>${s.count} ${plural(s.count, 'раз', 'раза', 'раз')}</small></span></div>`; }).join('')}
  </div></div>
  <div class="card-soft row-actions">
    <button class="btn ghost" id="exp">${Icons.save} Сохранить копию прогресса (файл)</button>
    <button class="btn ghost danger" id="rst">Начать сад заново</button>
  </div>
  <p class="muted">Результаты — для вашей мотивации. Это не оценка здоровья.</p>`;
  $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([Store.exportJSON()], { type: 'application/json' })); a.download = 'neurogarden-progress.json'; a.click(); };
  $('#rst').onclick = () => { if (confirm('Удалить весь прогресс и начать сад заново?')) { Store.reset(); App.go('progress'); } };
}

function renderPro(main) {
  main.innerHTML = `<h1 class="page-title">Для специалиста</h1>
  <div class="card-soft prose">
    <p><b>НейроСад</b> — бесплатный набор упражнений для поддержания внимания, памяти и гибкости мышления у пожилых людей. Подходит для самостоятельных занятий, для занятий с родственниками, в группах и клубах.</p>
    <h2>Что тренируют игры</h2>
    <ul>${GAMES.map(g => `<li><b>${g.name}</b> — ${g.area.toLowerCase()}. ${g.pro}</li>`).join('')}</ul>
    <h2>Принципы</h2>
    <ul>
      <li>Нет давления временем: таймер скрыт по умолчанию и включается по желанию.</li>
      <li>Три уровня сложности; после уверенного результата (≥85%) предлагается следующий уровень.</li>
      <li>Мягкая обратная связь, без штрафов и «проигрышей». Ошибка — просто ещё одна попытка.</li>
      <li>Крупный шрифт, высокий контраст, большие кнопки, режим уменьшения движения, звук по желанию.</li>
      <li>Данные хранятся только на устройстве (localStorage) либо не сохраняются вовсе (режим «Без сохранения»). Никакой регистрации и рекламы.</li>
    </ul>
    <h2>Рекомендации к занятиям</h2>
    <ul><li>10–15 минут в день, 3 игры («Занятие дня»).</li><li>Начинать с лёгкого уровня, хвалить за регулярность, а не за результат.</li><li>Цветовые игры («Цвет и слово») не подходят людям с нарушением цветового зрения — их можно пропускать.</li></ul>
    <div class="disclaimer-box"><b>Важно.</b> НейроСад — практика внимания и памяти. Это не медицинское изделие, не диагностика и не лечение. Результаты нельзя использовать для оценки когнитивного состояния. При беспокойстве о памяти обратитесь к врачу.</div>
  </div>`;
}

function plural(n, one, few, many) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many; }

/* ---------- Иконки ---------- */
const ic = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const Icons = {
  play: ic('<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>'),
  grid: ic('<rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor"/><rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>'),
  flame: ic('<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#ff8a3d"/>'),
  flower: ic('<g fill="#ff7aa8"><circle cx="12" cy="6" r="4"/><circle cx="6" cy="11" r="4"/><circle cx="18" cy="11" r="4"/><circle cx="8.5" cy="17" r="4"/><circle cx="15.5" cy="17" r="4"/></g><circle cx="12" cy="12" r="3.2" fill="#ffd166"/>'),
  cal: ic('<rect x="3" y="5" width="18" height="16" rx="3" fill="#7bb6ff"/><rect x="3" y="5" width="18" height="5" rx="2" fill="#3f7fd8"/><circle cx="8" cy="15" r="1.6" fill="#fff"/><circle cx="12" cy="15" r="1.6" fill="#fff"/><circle cx="16" cy="15" r="1.6" fill="#fff"/>'),
  star: ic('<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="#ffc21a"/>'),
  save: ic('<path d="M12 3v12m0 0l-5-5m5 5l5-5M4 19h16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  back: ic('<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  redo: ic('<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>'),
  next: ic('<path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  home: ic('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>'),
  bulb: ic('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" stroke="currentColor" stroke-width="2" fill="#ffe27a"/>')
};

/* ---------- Запуск ---------- */
window.addEventListener('DOMContentLoaded', () => {
  $$('.nav a').forEach(a => a.onclick = e => { e.preventDefault(); App.go(a.dataset.page); closeMenu(); });
  $('#brand').onclick = e => { e.preventDefault(); App.go('home'); };
  const s = Store.settings;
  $('#btnFont').onclick = () => { Store.setSetting('font', s.font % 3 + 1); applySettings(); };
  $('#btnSound').onclick = () => { Store.setSetting('sound', !s.sound); applySettings(); Sound.good(); };
  $('#btnMotion').onclick = () => { Store.setSetting('motion', !s.motion); applySettings(); if (App.page === 'home') App.go('home'); };
  $('#btnContrast').onclick = () => { Store.setSetting('contrast', !s.contrast); applySettings(); };
  $('#btnTimer').onclick = () => { Store.setSetting('timer', !s.timer); applySettings(); };
  $('#btnPrivate').onclick = () => { Store.setPrivate(!Store.privateMode); applySettings(); toast(Store.privateMode ? 'Прогресс этого визита не сохранится' : 'Прогресс сохраняется на этом устройстве', 'info'); if (App.page !== 'play') App.go(App.page); };
  $('#menuBtn').onclick = () => document.body.classList.toggle('menu-open');
  $('#settingsBtn').onclick = () => document.body.classList.toggle('settings-open');
  $('#settingsClose').onclick = () => document.body.classList.remove('settings-open');
  function closeMenu() { document.body.classList.remove('menu-open'); }
  applySettings();
  const h = location.hash.replace('#', '');
  App.go(['home', 'games', 'progress', 'pro'].includes(h) ? h : 'home');
  if (!Store.canSave) toast('Браузер не разрешает сохранять — прогресс будет временным', 'info');
});
