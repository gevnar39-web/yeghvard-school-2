/* HemoAtlas — pressure/pulse, clotting, habits, quiz */
(function () {
  'use strict';
  const page = document.body.dataset.page;
  const tt = (k) => t(S[k]);
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const R = [];            // render functions, re-run on language change

  /* ================= pulse + blood pressure ================= */
  if (page === 'pressure') {
    const pulse = { age: 'child', taps: 0, start: 0, done: false, timer: null };
    const RANGE = { child: [70, 100], adult: [60, 100] };
    const box = $('pulseBox');

    function renderPulse() {
      box.innerHTML = `<h3>${tt('pr_pulse_t')}</h3><p>${tt('pr_pulse_how')}</p>
        <div class="row2"><div><select class="sel" id="pAge"><option value="child" ${pulse.age === 'child' ? 'selected' : ''}>${tt('pr_age_child')}</option><option value="adult" ${pulse.age === 'adult' ? 'selected' : ''}>${tt('pr_age_adult')}</option></select></div></div>
        <button type="button" class="tap-btn" id="tapBtn"><span class="tap-heart">♥</span>${tt('pr_tap')}</button>
        <div class="tap-info" id="tapInfo"></div>
        <button type="button" class="btn btn-ghost-d" id="pAgain">${tt('pr_again')}</button>`;
      infoPulse();
    }
    function infoPulse() {
      const left = pulse.start ? Math.max(0, 10 - (performance.now() - pulse.start) / 1000) : 10;
      const r = RANGE[pulse.age];
      let h = `<div class="tap-stat"><b>${Math.ceil(left)}</b> ${tt('pr_secs')} · <b>${pulse.taps}</b> ${tt('pr_taps')}</div>`;
      if (pulse.done) {
        const bpm = pulse.taps * 6;
        const k = bpm < r[0] ? ['warn', 'pr_low'] : bpm > r[1] ? ['warn', 'pr_high'] : ['good', 'pr_ok'];
        h = `<div class="tap-stat">${tt('pr_res')} <b class="big-num">${bpm}</b> ${tt('unit_bpm')}</div>
          <p><span class="st ${k[0]}">${tt(k[1])}</span></p><p class="note" style="margin:6px 0 0">${tt('pr_range')}: ${r[0]}–${r[1]} ${tt('unit_bpm')}</p>`;
      }
      $('tapInfo').innerHTML = h;
    }
    function tick() {
      if ((performance.now() - pulse.start) / 1000 >= 10) { pulse.done = true; clearInterval(pulse.timer); }
      infoPulse();
    }
    function tap() {
      if (pulse.done) return;
      if (!pulse.start) { pulse.start = performance.now(); pulse.timer = setInterval(tick, 150); }
      pulse.taps++;
      const h = box.querySelector('.tap-heart'); if (h) { h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); }
      infoPulse();
    }
    box.addEventListener('pointerdown', e => { if (e.target.closest('#tapBtn')) { e.preventDefault(); tap(); } });
    box.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'tapBtn') { e.preventDefault(); tap(); } });
    box.addEventListener('click', e => {
      if (e.target.id === 'pAgain') { clearInterval(pulse.timer); Object.assign(pulse, { taps: 0, start: 0, done: false }); infoPulse(); }
    });
    box.addEventListener('change', e => { if (e.target.id === 'pAge') { pulse.age = e.target.value; infoPulse(); } });

    /* blood pressure */
    const bp = { sys: '', dia: '' };
    const CATS = [
      { id: 'bp_low', cls: 'warn' }, { id: 'bp_norm', cls: 'good' }, { id: 'bp_elev', cls: 'warn' },
      { id: 'bp_h1', cls: 'bad' }, { id: 'bp_h2', cls: 'bad' }, { id: 'bp_cr', cls: 'bad' },
    ];
    function catOf(s, d) {
      if (s >= 180 || d >= 120) return 5;
      if (s >= 140 || d >= 90) return 4;
      if (s >= 130 || d >= 80) return 3;
      if (s < 90 || d < 60) return 0;
      if (s >= 120) return 2;
      return 1;
    }
    function renderBp() {
      $('bpBox').innerHTML = `<h3>${tt('pr_bp_t')}</h3><p>${tt('pr_bp_how')}</p>
        <div class="frow"><label for="bpS">${tt('pr_sys')}</label><input id="bpS" type="number" inputmode="numeric" min="30" max="300" value="${bp.sys}" placeholder="120"><span class="note" style="margin:0">mmHg</span></div>
        <div class="frow"><label for="bpD">${tt('pr_dia')}</label><input id="bpD" type="number" inputmode="numeric" min="20" max="200" value="${bp.dia}" placeholder="80"><span class="note" style="margin:0">mmHg</span></div>
        <div class="bp-scale" id="bpScale"></div><div id="bpOut"></div><p class="note">${tt('pr_kids')}</p>`;
      infoBp();
    }
    function infoBp() {
      const s = parseFloat(bp.sys), d = parseFloat(bp.dia), ok = isFinite(s) && isFinite(d) && s > 0 && d > 0;
      const c = ok ? catOf(s, d) : -1;
      $('bpScale').innerHTML = CATS.map((x, i) => `<span class="${x.cls} ${i === c ? 'on' : ''}">${tt(x.id)}</span>`).join('');
      $('bpOut').innerHTML = ok ? `<div class="bp-res ${CATS[c].cls}"><b>${s}/${d}</b> — ${tt(CATS[c].id)}<p>${tt(CATS[c].id + '_a')}</p></div>` : `<p class="note">${tt('pr_enter')}</p>`;
    }
    $('bpBox').addEventListener('input', e => { if (e.target.id === 'bpS') bp.sys = e.target.value; if (e.target.id === 'bpD') bp.dia = e.target.value; infoBp(); });
    R.push(renderPulse, renderBp);
  }

  /* ================= clotting ================= */
  if (page === 'clot') {
    let step = 1, playing = false, timer = null;
    function renderClot() {
      $('clotSvg').dataset.step = step;
      $('clotTitle').textContent = `${tt('cl_step')} ${step}: ${tt('cl_s' + step)}`;
      $('clotText').textContent = tt('cl_s' + step + 'd');
      $('clotDots').innerHTML = [1, 2, 3, 4].map(n => `<button type="button" class="${n === step ? 'on' : n < step ? 'done' : ''}" data-n="${n}" aria-label="${tt('cl_step')} ${n}">${n}</button>`).join('');
      $('clotPlay').textContent = playing ? '❚❚ ' + tt('cl_pause') : '▶ ' + tt('cl_play');
      $('clotPrev').disabled = step === 1; $('clotNext').disabled = step === 4;
    }
    const go = (n) => { step = clamp(n, 1, 4); renderClot(); };
    function stop() { playing = false; clearInterval(timer); }
    $('clotNext').addEventListener('click', () => { stop(); go(step + 1); });
    $('clotPrev').addEventListener('click', () => { stop(); go(step - 1); });
    $('clotDots').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { stop(); go(+b.dataset.n); } });
    $('clotPlay').addEventListener('click', () => {
      if (playing) { stop(); renderClot(); return; }
      playing = true; if (step === 4) step = 1; renderClot();
      timer = setInterval(() => { if (step >= 4) { stop(); renderClot(); } else go(step + 1); }, 3200);
    });
    R.push(renderClot);
  }

  /* ================= healthy habits ================= */
  if (page === 'habits') {
    const H = [
      L('Move for 60 minutes a day (run, bike, play)', 'Двигайся 60 минут в день (бег, велосипед, игры)', 'Օրական 60 րոպե շարժվիր (վազք, հեծանիվ, խաղեր)'),
      L('Eat fruit and vegetables every day', 'Ешь фрукты и овощи каждый день', 'Ամեն օր մրգեր և բանջարեղեն կեր'),
      L('Drink water instead of sweet drinks', 'Пей воду вместо сладких напитков', 'Քաղցր ըմպելիքների փոխարեն ջուր խմիր'),
      L('Sleep enough: 9–12 hours at ages 6–12, 8–10 hours for teens', 'Высыпайся: 9–12 часов в 6–12 лет, 8–10 часов у подростков', 'Բավարար քնիր՝ 6–12 տարեկանում 9–12 ժամ, դեռահասների համար՝ 8–10 ժամ'),
      L('Eat chips, fast food and sweets rarely', 'Редко ешь чипсы, фастфуд и сладости', 'Չիպսը, արագ սնունդը և քաղցրավենիքը հազվադեպ կեր'),
      L('Limit screen time and get up to move every hour', 'Ограничь время у экрана и вставай размяться каждый час', 'Սահմանափակիր էկրանի առջև անցկացրած ժամանակը և ամեն ժամ վեր կաց շարժվելու համար'),
      L('Stay away from cigarettes, vapes and smoke', 'Держись подальше от сигарет, вейпов и дыма', 'Հեռու մնա ծխախոտից, վեյփերից և ծխից'),
      L('Laugh, talk to friends and family, ask for help when worried', 'Смейся, общайся с друзьями и семьёй, проси помощи, если тревожно', 'Ծիծաղիր, շփվիր ընկերների և ընտանիքի հետ, անհանգստության դեպքում օգնություն խնդրիր'),
    ];
    const on = new Set();
    const mix = (a, b, u) => a.map((x, i) => Math.round(x + (b[i] - x) * u));
    const hex = (c) => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
    function renderHabits() {
      $('hcList').innerHTML = H.map((h, i) => `<label class="sym hc-item"><input type="checkbox" data-i="${i}" ${on.has(i) ? 'checked' : ''}><span>${t(h)}</span></label>`).join('');
      paint();
    }
    function paint() {
      const n = on.size, u = n / 8;
      $('hcCount').textContent = n; $('hcBar').style.width = (u * 100) + '%';
      $('hg1').setAttribute('stop-color', hex(mix([217, 167, 175], [255, 138, 154], u)));
      $('hg2').setAttribute('stop-color', hex(mix([150, 105, 115], [196, 21, 46], u)));
      const hs = $('hcHeart').style; hs.animationDuration = (1.9 - 0.15 * n).toFixed(2) + 's'; hs.transform = '';
      $('hcMsg').textContent = tt(n <= 2 ? 'hc_m0' : n <= 5 ? 'hc_m1' : n <= 7 ? 'hc_m2' : 'hc_m3');
    }
    $('hcList').addEventListener('change', e => { const i = +e.target.dataset.i; if (e.target.checked) on.add(i); else on.delete(i); paint(); });
    R.push(renderHabits);
  }

  /* ================= quiz ================= */
  if (page === 'quiz') {
    const Q = [
      { q: L('Which vessels carry blood away from the heart?', 'Какие сосуды уносят кровь от сердца?', 'Ո՞ր անոթներն են արյունը տանում սրտից'),
        a: [L('Arteries', 'Артерии', 'Զարկերակներ'), L('Veins', 'Вены', 'Երակներ'), L('Capillaries', 'Капилляры', 'Մազանոթներ')],
        e: L('Arteries carry blood away from the heart; veins bring it back.', 'Артерии уносят кровь от сердца, а вены возвращают её обратно.', 'Զարկերակները արյունը տանում են սրտից, իսկ երակները՝ վերադարձնում։') },
      { q: L('How many chambers does the human heart have?', 'Сколько камер у сердца человека?', 'Քանի՞ խոռոչ ունի մարդու սիրտը'),
        a: [L('4', '4', '4'), L('2', '2', '2'), L('3', '3', '3')],
        e: L('Two atria and two ventricles.', 'Два предсердия и два желудочка.', 'Երկու նախասիրտ և երկու փորոք։') },
      { q: L('What carries oxygen inside red blood cells?', 'Что переносит кислород в эритроцитах?', 'Ի՞նչն է էրիթրոցիտներում թթվածին տեղափոխում'),
        a: [L('Hemoglobin', 'Гемоглобин', 'Հեմոգլոբին'), L('Plasma', 'Плазма', 'Պլազմա'), L('Cholesterol', 'Холестерин', 'Խոլեստերին')],
        e: L('Hemoglobin contains iron and binds oxygen.', 'Гемоглобин содержит железо и связывает кислород.', 'Հեմոգլոբինը երկաթ է պարունակում և կապում է թթվածինը։') },
      { q: L('Which blood cells help to stop bleeding?', 'Какие клетки крови помогают остановить кровотечение?', 'Արյան ո՞ր բջիջներն են օգնում դադարեցնել արյունահոսությունը'),
        a: [L('Platelets', 'Тромбоциты', 'Թրոմբոցիտներ'), L('White blood cells', 'Лейкоциты', 'Լեյկոցիտներ'), L('Red blood cells', 'Эритроциты', 'Էրիթրոցիտներ')],
        e: L('Platelets plug the wound and start clotting.', 'Тромбоциты закрывают рану и запускают свёртывание.', 'Թրոմբոցիտները փակում են վերքը և սկսում մակարդումը։') },
      { q: L('Which blood type can give red cells to everyone?', 'Какая группа крови подходит для переливания эритроцитов всем?', 'Ո՞ր արյան խումբը կարող է էրիթրոցիտներ տալ բոլորին'),
        a: [L('O−', 'O−', 'O−'), L('AB+', 'AB+', 'AB+'), L('A+', 'A+', 'A+')],
        e: L('O− has no A, B or Rh antigens on its red cells.', 'У O− на эритроцитах нет антигенов A, B и резуса.', 'O−-ի էրիթրոցիտների վրա A, B և ռեզուս անտիգեններ չկան։') },
      { q: L('What is a normal resting pulse for an adult?', 'Какой пульс в покое нормален для взрослого?', 'Ի՞նչ է մեծահասակի նորմալ հանգստի սրտազարկը'),
        a: [L('60–100 per minute', '60–100 в минуту', 'րոպեում 60–100'), L('20–40 per minute', '20–40 в минуту', 'րոպեում 20–40'), L('150–200 per minute', '150–200 в минуту', 'րոպեում 150–200')],
        e: L('Athletes can be lower; exercise and excitement raise it.', 'У спортсменов бывает ниже; нагрузка и волнение повышают.', 'Մարզիկների մոտ կարող է ավելի ցածր լինել․ բեռը և հուզմունքը բարձրացնում են։') },
      { q: L('Which vessels are the thinnest?', 'Какие сосуды самые тонкие?', 'Ո՞ր անոթներն են ամենաբարակը'),
        a: [L('Capillaries', 'Капилляры', 'Մազանոթներ'), L('Arteries', 'Артерии', 'Զարկերակներ'), L('Veins', 'Вены', 'Երակներ')],
        e: L('Capillaries are about one red cell wide; oxygen passes through their walls.', 'Капилляры шириной примерно с один эритроцит; через их стенки проходит кислород.', 'Մազանոթները մոտ մեկ էրիթրոցիտի լայնությամբ են․ նրանց պատերով անցնում է թթվածինը։') },
      { q: L('Which veins carry oxygen-rich blood?', 'Какие вены несут кровь, богатую кислородом?', 'Ո՞ր երակներն են թթվածնով հարուստ արյուն տանում'),
        a: [L('Pulmonary veins', 'Лёгочные вены', 'Թոքային երակներ'), L('Venae cavae', 'Полые вены', 'Սիներակներ'), L('Jugular veins', 'Яремные вены', 'Պարանոցային երակներ')],
        e: L('Pulmonary veins bring fresh blood from the lungs to the heart.', 'Лёгочные вены приносят свежую кровь из лёгких к сердцу.', 'Թոքային երակները թարմ արյունը թոքերից բերում են սրտին։') },
      { q: L('What does a flat line on an ECG show?', 'О чём говорит прямая линия на ЭКГ?', 'Ի՞նչ է ցույց տալիս ԷԿԳ-ի ուղիղ գիծը'),
        a: [L('No electrical activity — the heart is not beating', 'Нет электрической активности — сердце не бьётся', 'Էլեկտրական ակտիվություն չկա՝ սիրտը չի զարկում'), L('A very fast heartbeat', 'Очень быстрое сердцебиение', 'Շատ արագ սրտի զարկ'), L('A healthy sleeping heart', 'Здоровое сердце во сне', 'Քնած առողջ սիրտ')],
        e: L('There are no impulses to record (or an electrode came off), so doctors act at once.', 'Записывать нечего (или отошёл электрод), поэтому врачи действуют немедленно.', 'Գրանցելու ազդակներ չկան (կամ էլեկտրոդն է թուլացել), ուստի բժիշկները անմիջապես գործում են։') },
      { q: L('Which cholesterol is called “bad”?', 'Какой холестерин называют «плохим»?', 'Ո՞ր խոլեստերինն են անվանում «վատ»'),
        a: [L('LDL', 'ЛПНП (LDL)', 'LDL'), L('HDL', 'ЛПВП (HDL)', 'HDL'), L('Hemoglobin', 'Гемоглобин', 'Հեմոգլոբին')],
        e: L('LDL leaves plaque on artery walls; HDL carries extra cholesterol back to the liver.', 'ЛПНП оставляет бляшки на стенках артерий, а ЛПВП возвращает лишний холестерин в печень.', 'LDL-ը թիթեղներ է թողնում զարկերակների պատերին, իսկ HDL-ը ավելորդ խոլեստերինը վերադարձնում է լյարդ։') },
    ];
    let order = [], idx = 0, score = 0, picked = -1, started = false;
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    function start() {
      order = shuffle(Q.map((q, i) => i)).map(i => ({ i, opts: shuffle(Q[i].a.map((x, k) => ({ x, ok: k === 0 }))) }));
      idx = 0; score = 0; picked = -1; started = true; renderQuiz();
    }
    function renderQuiz() {
      const box = $('quizBox');
      if (!started) { box.innerHTML = `<button class="btn btn-solid" id="qzStart">${tt('qz_start')}</button>`; return; }
      if (idx >= order.length) {
        const g = score >= 9 ? 'qz_g2' : score >= 5 ? 'qz_g1' : 'qz_g0';
        box.innerHTML = `<div class="qz-end"><div>${tt('qz_score')}</div><div class="big-num">${score}/${order.length}</div><p>${tt(g)}</p><button class="btn btn-solid" id="qzStart">${tt('qz_again')}</button></div>`;
        return;
      }
      const cur = order[idx], q = Q[cur.i];
      let h = `<div class="qz-top"><span>${tt('qz_q')} ${idx + 1}/${order.length}</span><div class="fbar"><i style="width:${(idx / order.length) * 100}%"></i></div></div><h3>${t(q.q)}</h3><div class="qz-opts">`;
      cur.opts.forEach((o, k) => {
        const cls = picked < 0 ? '' : o.ok ? 'right' : k === picked ? 'wrong' : 'dim';
        h += `<button class="qz-opt ${cls}" data-k="${k}" ${picked >= 0 ? 'disabled' : ''}>${t(o.x)}</button>`;
      });
      h += '</div>';
      if (picked >= 0) {
        const ok = cur.opts[picked].ok;
        h += `<div class="qz-fb ${ok ? 'good' : 'bad'}"><b>${tt(ok ? 'qz_right' : 'qz_wrong')}</b> ${t(q.e)}</div><button class="btn btn-solid" id="qzNext">${tt(idx + 1 === order.length ? 'qz_finish' : 'qz_next')}</button>`;
      }
      box.innerHTML = h;
    }
    $('quizBox').addEventListener('click', e => {
      if (e.target.id === 'qzStart') return start();
      if (e.target.id === 'qzNext') { idx++; picked = -1; return renderQuiz(); }
      const b = e.target.closest('.qz-opt');
      if (b && picked < 0) { picked = +b.dataset.k; if (order[idx].opts[picked].ok) score++; renderQuiz(); }
    });
    R.push(renderQuiz);
  }

  /* ================= video ================= */
  if (page === 'video') {
    // optional videos stay hidden until their file loads
    document.querySelectorAll('.vid-opt').forEach(box => {
      const v = box.querySelector('video');
      v.addEventListener('loadedmetadata', () => { box.hidden = false; });
    });
  }

  window.HemoExtra = { refresh: () => R.forEach(f => f()) };
  window.HemoExtra.refresh();
})();
