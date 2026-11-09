/* HemoAtlas — live ECG simulator (educational) */
(function () {
  'use strict';
  const cv = document.getElementById('ecgCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const tt = (k) => t(S[k]);
  const $ = (id) => document.getElementById(id);

  /* ---------- rhythms ---------- */
  const RHY = {
    normal: { st: 'good', name: L('Normal rhythm (sinus)', 'Нормальный ритм (синусовый)', 'Նորմալ ռիթմ (սինուսային)'),
      tag: L('Normal', 'Норма', 'Նորմա'),
      desc: L('Regular beats. Each one has a small P wave, a tall narrow QRS spike and a rounded T wave. The SA node sets the pace: 60–100 beats a minute at rest.',
        'Ровные удары. У каждого есть небольшой зубец P, высокий узкий комплекс QRS и округлый зубец T. Ритм задаёт синусовый узел: 60–100 ударов в минуту в покое.',
        'Հավասար զարկեր։ Յուրաքանչյուրն ունի փոքր P ատամ, բարձր նեղ QRS բարդույթ և կլոր T ատամ։ Ռիթմը տալիս է սինուս-նախասրտային հանգույցը՝ հանգստի ժամանակ րոպեում 60–100 զարկ։') },
    fast: { st: 'warn', name: L('Fast rhythm (tachycardia)', 'Учащённый ритм (тахикардия)', 'Արագ ռիթմ (տախիկարդիա)'),
      tag: L('Fast', 'Быстро', 'Արագ'),
      desc: L('More than 100 beats a minute. After exercise, fever or a fright it is normal; at rest it should be shown to a doctor.',
        'Больше 100 ударов в минуту. После нагрузки, при температуре или испуге это нормально; в покое стоит показать врачу.',
        'Րոպեում 100-ից ավելի զարկ։ Մարզվելուց, ջերմության կամ վախից հետո նորմալ է․ հանգստի ժամանակ արժե ցույց տալ բժշկին։') },
    slow: { st: 'warn', name: L('Slow rhythm (bradycardia)', 'Замедленный ритм (брадикардия)', 'Դանդաղ ռիթմ (բրադիկարդիա)'),
      tag: L('Slow', 'Медленно', 'Դանդաղ'),
      desc: L('Fewer than 60 beats a minute. Normal in sleep and in well-trained athletes; with dizziness or fainting see a doctor.',
        'Меньше 60 ударов в минуту. Нормально во сне и у тренированных спортсменов; при головокружении или обмороках нужен врач.',
        'Րոպեում 60-ից քիչ զարկ։ Նորմալ է քնի ժամանակ և մարզված մարզիկների մոտ․ գլխապտույտի կամ ուշագնացության դեպքում պետք է բժիշկ։') },
    afib: { st: 'bad', name: L('Atrial fibrillation', 'Фибрилляция предсердий', 'Նախասրտերի ֆիբրիլյացիա'),
      tag: L('Irregular', 'Неровный', 'Անկանոն'),
      desc: L('The gaps between beats are uneven and there are no clear P waves: the atria quiver instead of contracting. It raises the risk of blood clots and stroke and needs treatment.',
        'Промежутки между ударами неровные, чётких зубцов P нет: предсердия трепещут, а не сокращаются. Повышает риск тромбов и инсульта, нужно лечение.',
        'Զարկերի միջև տարածությունները անհավասար են, հստակ P ատամներ չկան՝ նախասրտերը կծկվելու փոխարեն դողում են։ Մեծացնում է թրոմբերի և կաթվածի ռիսկը և բուժում է պահանջում։') },
    vf: { st: 'bad', name: L('Ventricular fibrillation', 'Фибрилляция желудочков', 'Փորոքների ֆիբրիլյացիա'),
      tag: L('Emergency', 'Опасно', 'Վտանգավոր'),
      desc: L('Chaotic waves and no beats. The heart quivers and pumps no blood, so the heart stops within seconds. It needs CPR and a defibrillator immediately.',
        'Хаотичные волны, ударов нет. Сердце трепещет и не качает кровь, остановка наступает за секунды. Нужны сердечно-лёгочная реанимация и дефибриллятор немедленно.',
        'Քաոսային ալիքներ, զարկեր չկան։ Սիրտը դողում է և արյուն չի մղում, ուստի մի քանի վայրկյանում կանգ է առնում։ Անհապաղ պետք են սրտա-թոքային վերակենդանացում (CPR) և դեֆիբրիլյատոր։') },
    asystole: { st: 'bad', name: L('Flat line (asystole) — the heart has stopped', 'Прямая линия (асистолия) — сердце остановилось', 'Ուղիղ գիծ (ասիստոլիա)՝ սիրտը կանգ է առել'),
      tag: L('No heartbeat', 'Нет сердцебиения', 'Սրտի զարկ չկա'),
      desc: L('There is no electrical activity, so the line is flat. This is how the ECG of a person whose heart has stopped looks. A defibrillator does not help here; doctors use CPR and medicines. (Sometimes a flat line is only a loose electrode, so the patient is always checked.)',
        'Электрической активности нет, поэтому линия прямая. Так выглядит ЭКГ человека, у которого остановилось сердце. Дефибриллятор здесь не помогает; врачи используют реанимацию и лекарства. (Иногда прямая линия — просто отошедший электрод, поэтому пациента всегда проверяют.)',
        'Էլեկտրական ակտիվություն չկա, ուստի գիծը ուղիղ է։ Այսպես է երևում այն մարդու ԷԿԳ-ն, ում սիրտը կանգ է առել։ Դեֆիբրիլյատորը այստեղ չի օգնում․ բժիշկները կիրառում են վերակենդանացում և դեղեր։ (Երբեմն ուղիղ գիծը պարզապես թուլացած էլեկտրոդ է, ուստի հիվանդին միշտ ստուգում են։)') },
  };
  const ORDER = ['normal', 'fast', 'slow', 'afib', 'vf', 'asystole'];
  const WAVES = [
    { c: '#2358d6', n: 'P', d: L('P wave — the two atria contract', 'Зубец P — сокращаются предсердия', 'P ատամ՝ կծկվում են նախասրտերը') },
    { c: '#d7263d', n: 'QRS', d: L('QRS complex — the ventricles contract (the big spike)', 'Комплекс QRS — сокращаются желудочки (большой «шип»)', 'QRS բարդույթ՝ կծկվում են փորոքները (մեծ սուր ատամը)') },
    { c: '#7c5cd6', n: 'T', d: L('T wave — the ventricles recover (relax)', 'Зубец T — желудочки восстанавливаются (расслабляются)', 'T ատամ՝ փորոքները վերականգնվում են (թուլանում են)') },
  ];

  /* ---------- signal model ---------- */
  const g = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) * ((x - mu) / s));
  function tmpl(ms, b) { // ms relative to the R peak
    let v = 0;
    if (b.p) v += 0.14 * g(ms, -150, 24);
    v += -0.12 * g(ms, -22, 7) + b.a * g(ms, 0, 10) - 0.22 * g(ms, 24, 8) + 0.3 * g(ms, b.tc, 48);
    return v;
  }
  function vf(x) {
    const env = 0.62 + 0.28 * Math.sin(x * 0.9) + 0.1 * Math.sin(x * 2.3);
    return env * (0.5 * Math.sin(x * 26 + 2 * Math.sin(x * 1.3)) + 0.38 * Math.sin(x * 38 + 1.5 * Math.sin(x * 0.7)) + 0.28 * Math.sin(x * 17.5));
  }

  let rhythm = 'normal', bpm = 72;
  let beats = [], nextT = 0, changes = [{ t: -1e9, m: 'normal' }];
  const clock = () => performance.now() / 1000;
  const modeAt = (x) => { let m = changes[0].m; for (const c of changes) { if (c.t <= x) m = c.m; else break; } return m; };
  const beating = (m) => m === 'normal' || m === 'fast' || m === 'slow' || m === 'afib';
  const rrFor = () => rhythm === 'afib' ? 0.32 + Math.random() * 0.85 : (60 / bpm) * (1 + 0.025 * (Math.random() - 0.5));

  function gen(now) {
    if (!beating(rhythm)) return;
    if (nextT < now - 6) nextT = now;
    while (nextT < now + 1.2) {
      const rr = rrFor();
      beats.push({ t: nextT, p: rhythm !== 'afib', a: rhythm === 'afib' ? 0.8 + Math.random() * 0.35 : 1, tc: 150 + 90 * Math.min(1.2, rr), fired: false });
      nextT += rr;
    }
    beats = beats.filter(b => b.t > now - 12);
  }
  function sample(x) {
    let v = 0;
    for (let i = 0; i < beats.length; i++) { const ms = (x - beats[i].t) * 1000; if (ms > -260 && ms < 560) v += tmpl(ms, beats[i]); }
    const m = modeAt(x);
    if (m === 'vf') v += vf(x);
    else if (m === 'afib') v += 0.035 * Math.sin(x * 38) + 0.028 * Math.sin(x * 61 + 1) + 0.02 * Math.sin(x * 23);
    else if (m === 'asystole') v += 0.01 * Math.sin(x * 1.7) + 0.005 * Math.sin(x * 9.1);
    else v += 0.008 * Math.sin(x * 1.3);
    return v;
  }

  function setRhythm(r, keepBpm) {
    const now = clock();
    rhythm = r;
    if (!keepBpm) { if (r === 'normal') bpm = 72; else if (r === 'fast') bpm = 130; else if (r === 'slow') bpm = 45; }
    beats = beats.filter(b => b.t <= now + 0.16);
    changes.push({ t: now, m: r }); changes = changes.slice(-8);
    nextT = beating(r) ? now + 0.3 : Infinity;
    sync();
  }

  /* ---------- drawing ---------- */
  const PPS = 170;
  let W = 0, H = 0, dpr = 1, running = true;
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(cv.parentElement); resize();
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { running = es[0].isIntersecting; }).observe(cv.parentElement);

  function grid() {
    const small = PPS * 0.04, big = PPS * 0.2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(215,38,61,.13)'; ctx.beginPath();
    for (let x = 0; x <= W; x += small) { ctx.moveTo(Math.round(x) + .5, 0); ctx.lineTo(Math.round(x) + .5, H); }
    for (let y = 0; y <= H; y += small) { ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(W, Math.round(y) + .5); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(215,38,61,.34)'; ctx.beginPath();
    for (let x = 0; x <= W; x += big) { ctx.moveTo(Math.round(x) + .5, 0); ctx.lineTo(Math.round(x) + .5, H); }
    for (let y = 0; y <= H; y += big) { ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(W, Math.round(y) + .5); }
    ctx.stroke();
  }
  const heartEl = $('ecgHeart'), bpmEl = $('ecgBpm');
  let lastReadout = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (!running || document.hidden || !W) return;
    const now = clock();
    gen(now);
    ctx.clearRect(0, 0, W, H);
    grid();
    const base = H * 0.62, sc = H * 0.4;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const y = base - sample(now - (W - x) / PPS) * sc;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#13236b'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(35,88,214,.45)'; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
    // moving "pen" dot
    ctx.fillStyle = '#d7263d'; ctx.beginPath(); ctx.arc(W - 2, base - sample(now) * sc, 4, 0, 7); ctx.fill();

    beats.forEach(b => { if (!b.fired && b.t <= now) { b.fired = true; heartEl.classList.remove('beat'); void heartEl.offsetWidth; heartEl.classList.add('beat'); } });
    if (now - lastReadout > 0.5) { lastReadout = now; readout(now); }
  }
  function readout(now) {
    if (rhythm === 'asystole') { bpmEl.textContent = '0'; return; }
    if (rhythm === 'vf') { bpmEl.textContent = '—'; return; }
    const rec = beats.filter(b => b.t <= now).slice(-7);
    if (rec.length < 3) { bpmEl.textContent = rhythm === 'afib' ? '…' : String(bpm); return; }
    const rr = (rec[rec.length - 1].t - rec[0].t) / (rec.length - 1);
    bpmEl.textContent = (rhythm === 'afib' ? '~' : '') + Math.round(60 / rr);
  }

  /* ---------- UI ---------- */
  function sync() {
    const r = RHY[rhythm];
    $('ecgTag').className = 'ecg-tag ' + r.st; $('ecgTag').textContent = t(r.tag);
    $('rGrid').querySelectorAll('.rcard').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.r === rhythm)));
    const adj = beating(rhythm) && rhythm !== 'afib';
    $('ecgRateBox').style.display = adj ? '' : 'none';
    $('ecgRate').value = bpm; $('ecgRateVal').textContent = bpm;
    $('rDetail').innerHTML = `<span class="st ${r.st}">${t(r.tag)}</span><h3>${t(r.name)}</h3><p>${t(r.desc)}</p>`;
  }
  function beatSvg() {
    const w = 640, h = 190, pts = [];
    for (let ms = -260; ms <= 520; ms += 3) pts.push([(ms + 260) / 780 * (w - 20) + 10, 120 - tmpl(ms, { p: true, a: 1, tc: 230 }) * 95]);
    const path = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    const X = (ms) => ((ms + 260) / 780 * (w - 20) + 10).toFixed(1);
    const seg = (a, b, c) => `<rect x="${X(a)}" y="14" width="${(X(b) - X(a)).toFixed(1)}" height="${h - 28}" rx="8" fill="${c}" opacity=".13"/>`;
    const lbl = (ms, txt, c) => `<text x="${X(ms)}" y="${h - 4}" text-anchor="middle" font-weight="800" font-size="15" fill="${c}">${txt}</text>`;
    $('beatSvg').innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="PQRST">
      ${seg(-195, -105, '#2358d6')}${seg(-45, 50, '#d7263d')}${seg(150, 320, '#7c5cd6')}
      <path d="${path}" fill="none" stroke="#13236b" stroke-width="3" stroke-linejoin="round"/>
      ${lbl(-150, 'P', '#2358d6')}${lbl(0, 'QRS', '#d7263d')}${lbl(235, 'T', '#7c5cd6')}</svg>`;
    $('waveList').innerHTML = WAVES.map(x => `<li style="--c:${x.c}"><b>${x.n}</b><span>${t(x.d)}</span></li>`).join('');
  }
  function refresh() {
    $('rGrid').innerHTML = ORDER.map(k => `<button class="rcard ${RHY[k].st}" data-r="${k}" aria-pressed="${k === rhythm}"><i></i>${t(RHY[k].name)}</button>`).join('');
    sync(); beatSvg();
  }
  $('rGrid').addEventListener('click', e => { const b = e.target.closest('.rcard'); if (b) setRhythm(b.dataset.r); });
  $('ecgRate').addEventListener('input', e => {
    bpm = +e.target.value; $('ecgRateVal').textContent = bpm;
    const r = bpm < 60 ? 'slow' : bpm > 100 ? 'fast' : 'normal';
    if (r !== rhythm) setRhythm(r, true);
  });
  window.HemoEcg = { refresh };
  setRhythm('normal');
  refresh();
  frame();
})();
