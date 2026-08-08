/* =========================================================
   白戸 朗 ｜ Portfolio  script.js
   ========================================================= */
(() => {
  'use strict';

  /* =======================================================
     ▼▼ 設定：ここだけ書き換えれば運用できます ▼▼
     ======================================================= */

  // 各作品のLP公開URL。空文字のままだと「準備中」と表示され、クリックしても開きません。
  const WORKS = [
    {
      id: 'hangsit',
      cat: 'PRODUCT LP',
      title: 'Hang & Sit Chair',
      desc: '部屋になじむ懸垂チェア。生活シーンの写真を主役に、置いた姿を想像できる構成にしました。',
      tags: ['LP', 'HTML/CSS/JS'],
      thumb: 'assets/BG_image2_sp.webp',
      url: 'https://akira-daddy.github.io/LP_Hang_Sit_Chair/'
    },
    {
      id: 'yuge',
      cat: 'CAMPAIGN LP',
      title: '湯気 - YUGE Sauna & Spa 神田',
      desc: '10周年記念キャンペーン。金と湯気の質感で「通いたくなる」空気をつくりました。',
      tags: ['LP', '記念企画', '予約フォーム'],
      thumb: 'assets/Logo.webp',
      url: 'https://akira-daddy.github.io/Sauna_and_Spa/'
    },
    {
      id: 'gallerydot',
      cat: 'GALLERY LP',
      title: 'GALLERY DOT',
      desc: '現代美術ギャラリー。作品の邪魔をしない余白設計で、展示そのものを見せます。',
      tags: ['LP', 'アート', '予約フォーム'],
      thumb: 'assets/Gallery_Dot.webp',
      url: 'https://akira-daddy.github.io/Gallery_Dot/'
    },
    {
      id: 'lumea',
      cat: 'REELS × LP',
      title: 'LUMEA SHIFT',
      desc: '朝夕兼用オールインワン美容液。Reelsから流入した人がそのまま買えるよう、動画とLPを同じ世界観で設計。',
      tags: ['LP', 'Reels', 'GASフォーム'],
      thumb: 'assets/Lotion_Bottle_Box.webp',
      url: 'https://akira-daddy.github.io/LUMEA_SHIFT/',
      reels: 'assets/RUMEA_SHIFT_Reels.mp4'
    },
    {
      id: 'toomachi',
      cat: 'REELS × LP',
      title: 'とおまち夏花火ナイト',
      desc: '地域の花火大会。キャラクター「なつき」が案内役になり、有料席の予約までを1ページで完結させました。',
      tags: ['LP', 'Reels', '予約フォーム'],
      thumb: 'assets/S5_1.webp',
      url: 'https://akira-daddy.github.io/Tomachi_Hanabi/',
      reels: 'assets/Tomachi_Hanabi_Reels.mp4'
    }
  ];

  // Google Apps Script のウェブアプリURL（doPost）。空だと送信せず案内を表示します。
  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbygODxmlZ2_1QZVyzQUwYZkPMAAnuMDByang7EH-G342twj-7OVOCtPd5VgJNTKClcD/exec';

  /* ======================================================= */

  const body   = document.body;
  const deck   = document.getElementById('deck');
  const grid   = document.getElementById('backdropGrid');

  /* -------------------------------------------------------
     0. Reels動画モーダル
     ------------------------------------------------------- */
  const reelsModal      = document.getElementById('reelsModal');
  const reelsVideoEl    = document.getElementById('reelsVideo');
  const reelsModalTitle = document.getElementById('reelsModalTitle');

  function openReelsModal(src, title) {
    if (!src || !reelsModal) return;
    reelsVideoEl.src = src;
    reelsModalTitle.textContent = title ? `${title} — Reels` : '';
    reelsModal.classList.add('is-open');
    reelsModal.setAttribute('aria-hidden', 'false');
    reelsVideoEl.currentTime = 0;
    reelsVideoEl.play().catch(() => {});
  }

  function closeReelsModal() {
    if (!reelsModal || !reelsModal.classList.contains('is-open')) return;
    reelsModal.classList.remove('is-open');
    reelsModal.setAttribute('aria-hidden', 'true');
    reelsVideoEl.pause();
    reelsVideoEl.removeAttribute('src');
    reelsVideoEl.load();
  }

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.matchMedia('(max-width: 820px)');
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     1. ステートマシン（home → menu → about / works / contact）
     ------------------------------------------------------- */
  const PARENT = { home: null, menu: 'home', about: 'menu', works: 'menu', contact: 'menu' };
  let current = 'home';
  let depth = 0;          // 自分で積んだ履歴の数

  function go(state, opts = {}) {
    if (!(state in PARENT) || state === current) return;
    current = state;
    body.dataset.state = state;

    if (!opts.silent) {
      history.pushState({ state }, '', state === 'home' ? location.pathname : '#' + state);
      depth++;
    }
    // パネル内スクロールは毎回リセット
    document.querySelectorAll('.sheet').forEach(el => { el.scrollTop = 0; });
    if (isNarrow.matches) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function back() {
    // 自分で積んだ履歴があればブラウザの戻ると挙動をそろえる
    if (depth > 0) { history.back(); return; }
    go(PARENT[current] || 'home');
  }

  document.addEventListener('click', (e) => {
    const reelsBtn = e.target.closest('.tag-reels');
    if (reelsBtn) {
      e.preventDefault();
      e.stopPropagation();
      openReelsModal(reelsBtn.dataset.reels, reelsBtn.dataset.title);
      return;
    }
    if (e.target.closest('[data-reels-close]')) { closeReelsModal(); return; }

    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { go(goBtn.dataset.go); return; }
    if (e.target.closest('[data-back]')) { back(); }
  });

  // Escで一段戻る（Reelsモーダルが開いていれば先に閉じる）
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (reelsModal && reelsModal.classList.contains('is-open')) { closeReelsModal(); return; }
    if (current !== 'home') {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      back();
    }
  });

  // ブラウザの戻る
  window.addEventListener('popstate', (e) => {
    const s = (e.state && e.state.state) || (location.hash.replace('#', '') || 'home');
    if (s in PARENT) { depth = Math.max(0, depth - 1); current = null; go(s, { silent: true }); }
  });

  // 初期表示（URLハッシュ対応）
  const initial = location.hash.replace('#', '');
  if (initial in PARENT && initial !== 'home') { current = null; go(initial, { silent: true }); }

  /* -------------------------------------------------------
     2. マウス追従の立体制御（lerpで滑らかに）
     ------------------------------------------------------- */
  const tilt = { tx: 0, ty: 0, x: 0, y: 0 };
  const MAX_Y = 11;   // 左右の振り（deg）
  const MAX_X = 7.5;  // 上下の振り（deg）
  let rafId = null;

  function onPointer(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    tilt.tx = nx *  MAX_Y;
    tilt.ty = ny * -MAX_X;
  }

  function loop() {
    if (current === 'works') {
      // WORKS表示中はページ全体の追従を止め、リング側の回転に専念させる
      if (deck.style.transform) deck.style.transform = '';
    } else {
      tilt.x += (tilt.tx - tilt.x) * 0.075;
      tilt.y += (tilt.ty - tilt.y) * 0.075;
      deck.style.transform =
        `rotateX(${tilt.y.toFixed(3)}deg) rotateY(${tilt.x.toFixed(3)}deg)`;
    }

    // 背景の格子は逆方向に少しだけ動かして奥行きを出す
    const bg = document.querySelector('.backdrop__grid');
    if (bg) {
      bg.style.transform =
        `translate3d(${(-tilt.x * 1.6).toFixed(2)}px, ${(tilt.y * 1.6).toFixed(2)}px, 0)`;
    }

    updateOrbit();
    rafId = requestAnimationFrame(loop);
  }

  function startTilt() {
    if (rafId || noMotion) return;
    window.addEventListener('pointermove', onPointer, { passive: true });
    rafId = requestAnimationFrame(loop);
  }

  function stopTilt() {
    if (!rafId) return;
    window.removeEventListener('pointermove', onPointer);
    cancelAnimationFrame(rafId);
    rafId = null;
    deck.style.transform = '';
    const bg = document.querySelector('.backdrop__grid');
    if (bg) bg.style.transform = '';
  }

  function syncTilt() {
    if (isCoarse || isNarrow.matches || noMotion) stopTilt();
    else startTilt();
  }
  syncTilt();
  isNarrow.addEventListener('change', syncTilt);

  // タブが裏に回ったら止める（省電力）
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopTilt() : syncTilt();
  });

  /* -------------------------------------------------------
     3. WORKS ｜ 3D回転オービット
     ------------------------------------------------------- */
  const orbitEl = document.getElementById('worksOrbit');
  const ringEl  = document.getElementById('worksRing');
  const wiresEl = document.getElementById('orbitWires');
  const hubDot  = document.getElementById('orbitAnchor');
  const N = WORKS.length;
  const STEP = 360 / N;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const wireLines = WORKS.map(() => {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('class', 'orbit-wires__line');
    wiresEl.appendChild(line);
    return line;
  });

  // カード生成（角度は等分。中央=正面に来た1枚が一番大きく見える）
  const panels = WORKS.map((w, i) => {
    const baseAngle = i * STEP;
    const card = document.createElement(w.url ? 'a' : 'button');
    card.className = 'work';
    card.dataset.angle = baseAngle;

    if (w.url) {
      card.href = w.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    } else {
      card.type = 'button';
      card.addEventListener('click', () => {
        const s = card.querySelector('.work__open');
        if (s) { s.textContent = '公開準備中です'; setTimeout(() => { s.textContent = '準備中'; }, 1800); }
      });
    }

    const tagsHtml = w.tags.map(t => {
      if (t === 'Reels' && w.reels) {
        return `<button type="button" class="tag-reels" data-reels="${w.reels}" data-title="${w.title}">Reels</button>`;
      }
      return `<span>${t}</span>`;
    }).join('');

    card.innerHTML = `
      <span class="work__thumb">
        <img src="${w.thumb}" alt="${w.title} のLPサムネイル" loading="lazy" decoding="async">
        <span class="work__cat">${w.cat}</span>
      </span>
      <span class="work__body">
        <span class="work__title">${w.title}</span>
        <span class="work__desc">${w.desc}</span>
        <span class="work__tags">${tagsHtml}</span>
        <span class="work__open">${w.url ? 'LPを開く' : '準備中'}</span>
      </span>
    `;
    ringEl.appendChild(card);
    return { el: card, baseAngle };
  });

  // --- 回転状態 ---
  const orbit = { ry: 0, rx: 0, vy: 0, dragging: false, moved: false, captured: false, pointerId: null, lastX: 0, lastY: 0, radius: 340, hover: false };
  const IDLE_SPIN = 0.045;   // 放置時のゆっくり自動回転（deg/frame）
  const SENS_Y = 0.32;       // 横ドラッグの感度
  const SENS_X = 0.18;       // 縦ドラッグの感度（傾き）

  function readRadius() {
    const raw = getComputedStyle(orbitEl).getPropertyValue('--radius').trim();
    return parseFloat(raw) || 340;
  }
  orbit.radius = readRadius();
  window.addEventListener('resize', () => { orbit.radius = readRadius(); });

  function normalizeDeg(d) {
    let x = d % 360;
    if (x > 180) x -= 360;
    if (x < -180) x += 360;
    return x;
  }

  function applyRing() {
    if (isNarrow.matches) return;   // モバイルは縦積みリスト表示（CSS側で固定）なので何もしない
    ringEl.style.transform = `rotateX(${orbit.rx.toFixed(2)}deg) rotateY(${orbit.ry.toFixed(2)}deg)`;
    panels.forEach(p => {
      const eff = normalizeDeg(p.baseAngle + orbit.ry);
      const front = Math.cos(eff * Math.PI / 180);
      const t = Math.max(0, front);
      const scale = 0.86 + 0.14 * t;
      p.el.style.opacity = (0.4 + 0.6 * t).toFixed(2);
      p.el.style.transform =
        `rotateY(${p.baseAngle}deg) translateZ(${orbit.radius}px) scale(${scale.toFixed(3)})`;
      p.el.style.zIndex = Math.round(t * 100);
    });
    drawWires();
  }
  applyRing();

  // ハブ中心から各カードへ、実際の投影後スクリーン座標を結んで配線する
  // （3Dの角度計算をせず、ブラウザが出した最終位置をそのまま使うので破綻しない）
  function drawWires() {
    const svgBox = wiresEl.getBoundingClientRect();
    if (!svgBox.width || !svgBox.height) return;
    const hubBox = hubDot.getBoundingClientRect();
    const hx = hubBox.left + hubBox.width / 2 - svgBox.left;
    const hy = hubBox.top + hubBox.height / 2 - svgBox.top;

    panels.forEach((p, i) => {
      const r = p.el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - svgBox.left;
      const cy = r.top + r.height / 2 - svgBox.top;
      const line = wireLines[i];
      line.setAttribute('x1', hx.toFixed(1));
      line.setAttribute('y1', hy.toFixed(1));
      line.setAttribute('x2', cx.toFixed(1));
      line.setAttribute('y2', cy.toFixed(1));

      const eff = normalizeDeg(p.baseAngle + orbit.ry);
      const t = Math.max(0, Math.cos(eff * Math.PI / 180));
      line.style.opacity = (0.15 + 0.55 * t).toFixed(2);
    });
  }

  function updateOrbit() {
    if (current !== 'works' || isNarrow.matches) return;
    if (!orbit.dragging) {
      orbit.rx += (0 - orbit.rx) * 0.1;
      if (Math.abs(orbit.vy) > 0.003) {
        orbit.ry += orbit.vy;
        orbit.vy *= 0.94;
      } else if (!orbit.hover && !noMotion) {
        orbit.ry += IDLE_SPIN;
      }
    }
    applyRing();
  }

  ringEl.addEventListener('pointerenter', () => { orbit.hover = true; });
  ringEl.addEventListener('pointerleave', () => { orbit.hover = false; });

  function resetPanelsForNarrow() {
    ringEl.style.transform = '';
    panels.forEach(p => {
      p.el.style.opacity = '';
      p.el.style.transform = '';
      p.el.style.zIndex = '';
    });
    wireLines.forEach(l => l.style.opacity = '0');
  }

  isNarrow.addEventListener('change', () => {
    if (isNarrow.matches) resetPanelsForNarrow();
    else applyRing();
  });
  if (isNarrow.matches) resetPanelsForNarrow();

  ringEl.addEventListener('pointerdown', (e) => {
    if (isNarrow.matches) return;
    if (e.button !== undefined && e.button !== 0) return;
    orbit.dragging = true;
    orbit.moved = false;
    orbit.captured = false;
    orbit.vy = 0;
    orbit.pointerId = e.pointerId;
    orbit.lastX = e.clientX;
    orbit.lastY = e.clientY;
  });

  ringEl.addEventListener('pointermove', (e) => {
    if (!orbit.dragging) return;
    const dx = e.clientX - orbit.lastX;
    const dy = e.clientY - orbit.lastY;

    // 実際に動かした時点で初めてポインタを掴む（クリックのtarget化けを防ぐ）
    if (!orbit.moved && Math.abs(dx) + Math.abs(dy) > 5) {
      orbit.moved = true;
      orbit.captured = true;
      ringEl.classList.add('is-grabbing');
      ringEl.setPointerCapture(e.pointerId);
    }
    if (!orbit.moved) return;

    orbit.ry += dx * SENS_Y;
    orbit.rx = Math.max(-18, Math.min(18, orbit.rx - dy * SENS_X));
    orbit.vy = dx * SENS_Y;

    orbit.lastX = e.clientX;
    orbit.lastY = e.clientY;
    applyRing();
  });

  function endDrag(e) {
    if (!orbit.dragging) return;
    orbit.dragging = false;
    ringEl.classList.remove('is-grabbing');
    if (orbit.captured && e && e.pointerId !== undefined &&
        ringEl.hasPointerCapture && ringEl.hasPointerCapture(e.pointerId)) {
      ringEl.releasePointerCapture(e.pointerId);
    }
    orbit.captured = false;
  }
  ringEl.addEventListener('pointerup', endDrag);
  ringEl.addEventListener('pointercancel', endDrag);

  // ドラッグの流れでのクリックはLP遷移させない（回転操作とタップの取り違え防止）
  ringEl.addEventListener('click', (e) => {
    if (orbit.moved) { e.preventDefault(); e.stopPropagation(); }
    orbit.moved = false;
  }, true);

  /* -------------------------------------------------------
     4. CONTACT フォーム
     ------------------------------------------------------- */
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const RULES = {
    name:    { msg: 'お名前を入力してください', test: v => v.trim().length > 0 },
    email:   { msg: 'メールアドレスの形式をご確認ください', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    message: { msg: 'お問い合わせ内容を入力してください', test: v => v.trim().length >= 5 }
  };

  function validate() {
    let ok = true;
    for (const [key, rule] of Object.entries(RULES)) {
      const input = form.elements[key];
      const field = input.closest('.field');
      const errEl = field.querySelector('.err');
      if (rule.test(input.value)) {
        field.classList.remove('is-invalid');
        errEl.textContent = '';
      } else {
        field.classList.add('is-invalid');
        errEl.textContent = rule.msg;
        if (ok) input.focus();
        ok = false;
      }
    }
    return ok;
  }

  form.addEventListener('input', (e) => {
    const key = e.target.name;
    if (RULES[key] && RULES[key].test(e.target.value)) {
      const field = e.target.closest('.field');
      field.classList.remove('is-invalid');
      field.querySelector('.err').textContent = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';

    if (!validate()) {
      status.classList.add('is-ng');
      status.textContent = '未入力の項目があります';
      return;
    }

    if (!GAS_ENDPOINT) {
      status.classList.add('is-ng');
      status.textContent = '送信先が未設定です（script.js の GAS_ENDPOINT にURLを設定してください）';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = '送信しています…';

    try {
      const data = new URLSearchParams(new FormData(form));
      await fetch(GAS_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data });
      form.reset();
      status.classList.add('is-ok');
      status.textContent = '送信しました。2営業日以内にご返信します。';
    } catch (err) {
      status.classList.add('is-ng');
      status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
    } finally {
      btn.disabled = false;
    }
  });

})();
