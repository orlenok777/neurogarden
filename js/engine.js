'use strict';
/* Каркас игр: вступление с демонстрацией, игровой экран, итог */
Art.things.hedgehog = () => {
  let sp = '';
  for (let i = 0; i < 11; i++) { const a = -160 + i * 14; sp += `<path d="M50 60 L ${50 + Math.cos(a * Math.PI / 180) * 42} ${60 + Math.sin(a * Math.PI / 180) * 34} L ${50 + Math.cos((a + 9) * Math.PI / 180) * 30} ${60 + Math.sin((a + 9) * Math.PI / 180) * 24}Z" fill="#6b4a2f"/>`; }
  return `${sp}<ellipse cx="48" cy="64" rx="32" ry="22" fill="#8a6440"/>
    <path d="M62 52 C 80 52, 94 62, 96 70 C 90 76, 76 80, 64 78Z" fill="#f1d3a6"/>
    <circle cx="96" cy="70" r="4" fill="#2b2b2b"/><circle cx="78" cy="62" r="3" fill="#2b2b2b"/><circle cx="79" cy="61" r="1" fill="#fff"/>
    <ellipse cx="72" cy="70" rx="4" ry="2.5" fill="#ff9fa8" opacity=".7"/>
    <ellipse cx="36" cy="86" rx="7" ry="4" fill="#5a3a22"/><ellipse cx="62" cy="86" rx="7" ry="4" fill="#5a3a22"/>
    <circle cx="40" cy="44" r="6" fill="#e2402f"/><path d="M40 38 L 42 34" stroke="#3f8a3a" stroke-width="2"/>`;
};
Art.catalog['Ёжик'] = Art.things.hedgehog;

const Game = (() => {
  let timerH = null, cleanup = null, startT = 0, gid = null, glevel = 1;
  const LEVELS = ['Лёгкий', 'Средний', 'Сложный'];

  function stop() { clearInterval(timerH); timerH = null; if (cleanup) { try { cleanup(); } catch (e) { } } cleanup = null; }

  function intro(id) {
    const g = GAMES.find(x => x.id === id) || GAMES[0];
    const main = $('#main'), lvl = Store.level(g.id);
    main.innerHTML = `
    <div class="play-top"><button class="btn ghost" id="back">${Icons.back} Назад</button>${App.queue.length ? `<span class="queue-note">Занятие дня: ещё ${App.queue.length + 1}</span>` : ''}</div>
    <section class="intro" style="--c1:${g.c1};--c2:${g.c2}">
      <div class="intro-demo"><div class="demo-stage">${g.demo()}</div><div class="demo-hand">${Hand}</div></div>
      <div class="intro-text">
        <p class="eyebrow">${g.area}</p>
        <h1>${g.name}</h1>
        <ol class="steps">${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        <p class="hint-line">${Icons.bulb} Спешить не нужно. Ошибки не страшны — можно пробовать снова.</p>
        <div class="level-pick" role="radiogroup" aria-label="Уровень">
          ${LEVELS.map((n, i) => `<button class="lvl-btn ${i + 1 === lvl ? 'on' : ''}" data-l="${i + 1}" role="radio" aria-checked="${i + 1 === lvl}"><span class="lvl-dots">${[1, 2, 3].map(k => `<i class="${k <= i + 1 ? 'on' : ''}"></i>`).join('')}</span>${n}<small>${g.levels[i]}</small></button>`).join('')}
        </div>
        <button class="btn big primary" id="go">${Icons.play} Начать игру</button>
      </div>
    </section>`;
    let chosen = lvl;
    $$('.lvl-btn', main).forEach(b => b.onclick = () => { chosen = +b.dataset.l; $$('.lvl-btn', main).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); }); Sound.tap(); });
    $('#back').onclick = () => { App.queue = []; App.go('home'); };
    $('#go').onclick = () => start(g.id, chosen);
  }

  function start(id, level) {
    stop();
    const g = GAMES.find(x => x.id === id); gid = id; glevel = level;
    const main = $('#main');
    main.innerHTML = `
    <div class="play-top">
      <button class="btn ghost" id="back">${Icons.back} Выйти</button>
      <div class="play-title"><b>${g.name}</b><span>${LEVELS[level - 1]} уровень</span></div>
      <div class="play-side"><span class="timer" id="timer" ${Store.settings.timer ? '' : 'hidden'}>0:00</span>
      <button class="btn ghost" id="restart" title="Начать заново">${Icons.redo}<span class="hide-sm"> Заново</span></button></div>
    </div>
    <div class="status" id="status" aria-live="polite"></div>
    <div class="stage" id="stage" style="--c1:${g.c1};--c2:${g.c2}"></div>`;
    $('#back').onclick = () => { App.queue = []; App.go('home'); };
    $('#restart').onclick = () => start(id, level);
    startT = Date.now();
    timerH = setInterval(() => { const t = $('#timer'); if (!t) return; t.hidden = !Store.settings.timer; const s = Math.floor((Date.now() - startT) / 1000); t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }, 500);
    const api = {
      status(html) { const s = $('#status'); if (s) s.innerHTML = html; },
      good(el, text) { Sound.good(); FX.pop(el); if (text !== false) toast(text || PRAISE[rand(PRAISE.length)], 'good'); },
      miss(el, text) { Sound.soft(); FX.shake(el); toast(text || GENTLE[rand(GENTLE.length)], 'soft'); },
      later(fn, ms) { const h = setTimeout(() => { if (gid === id && $('#stage')) fn(); }, ms); api._t.push(h); return h; },
      _t: [],
      done(score, detail = '') { finish(g, level, Math.max(0, Math.min(1, score)), detail); }
    };
    const c = g.play($('#stage'), level, api);
    cleanup = () => { api._t.forEach(clearTimeout); if (typeof c === 'function') c(); };
  }

  function finish(g, level, score, detail) {
    const secs = Math.round((Date.now() - startT) / 1000);
    stop();
    Store.addResult({ game: g.id, level, score, secs });
    const stars = score >= .85 ? 3 : score >= .55 ? 2 : 1;
    Sound.win(); FX.confetti();
    const main = $('#main'), canUp = level < 3 && score >= .85;
    const msg = stars === 3 ? 'Великолепный результат!' : stars === 2 ? 'Очень хорошо!' : 'Хорошее начало! С каждым разом будет легче.';
    main.innerHTML = `
    <section class="result card-soft" style="--c1:${g.c1};--c2:${g.c2}">
      <div class="result-flower">${Art.wrap(Garden_flowerFor(Store.history.length))}</div>
      <div class="result-stars">${[1, 2, 3].map(i => `<span class="rstar ${i <= stars ? 'on' : ''}" style="animation-delay:${i * .25}s">${Icons.star}</span>`).join('')}</div>
      <h1>${msg}</h1>
      <p class="lead">В вашем саду вырос новый цветок.${detail ? ' ' + detail : ''}</p>
      <p class="muted">Результат: ${Math.round(score * 100)}%${Store.settings.timer ? ` · время ${Math.floor(secs / 60)} мин ${secs % 60} с` : ''}</p>
      <div class="hero-actions center">
        ${App.queue.length ? `<button class="btn big primary" id="nextg">${Icons.next} Следующая игра (${App.queue.length})</button>` : ''}
        ${canUp ? `<button class="btn big ${App.queue.length ? 'ghost' : 'primary'}" id="up">${Icons.star} Попробовать уровень сложнее</button>` : ''}
        <button class="btn big ghost" id="again">${Icons.redo} Ещё раз</button>
        <button class="btn big ghost" id="home">${Icons.home} В мой сад</button>
      </div>
    </section>`;
    $('#again').onclick = () => start(g.id, level);
    $('#home').onclick = () => { App.queue = []; App.go('home'); };
    if ($('#up')) $('#up').onclick = () => start(g.id, level + 1);
    if ($('#nextg')) $('#nextg').onclick = () => App.next();
  }
  return { intro, start, stop };
})();

function Garden_flowerFor(i) {
  const f = [() => Art.flowers.tulip('#ff6f91'), () => Art.flowers.sunflower(), () => Art.flowers.rose('#e23b6a'), () => Art.flowers.daisy(), () => Art.flowers.bell('#8a7bff'), () => Art.flowers.poppy()];
  return f[i % f.length]();
}

const Hand = `<svg viewBox="0 0 60 70" class="hand-svg" aria-hidden="true"><path d="M22 6c4 0 6 3 6 6v20l3-1c3-1 6 1 6 4l1 1c3-1 6 1 6 4l1 1c3-1 6 1 6 4v12c0 9-7 16-16 16h-4c-6 0-10-3-13-8L8 47c-2-3-1-6 2-7 2-1 5 0 6 2l2 4V12c0-3 2-6 4-6z" fill="#fff" stroke="#4a3b2a" stroke-width="3" stroke-linejoin="round"/></svg>`;
