/* HemoAtlas — small helper: built-in notes first, free public AI (Pollinations) as fallback */
(function () {
  'use strict';
  const log = document.getElementById('chatLog');
  if (!log) return;
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const chipsEl = document.getElementById('chatChips');
  const sendBtn = form.querySelector('button');
  const V = window.Viewer;
  const tt = (k) => t(S[k]);
  const LN = { en: 'English', ru: 'Russian', hy: 'Armenian' };
  const history = [];
  let busy = false, userMsgs = 0;

  const VESSEL = /vessel|arter|vein|capillar|сосуд|артер|вен[аыуе]|капилл|անոթ|զարկերակ|երակ|մազանոթ/;

  /* ---------- built-in notes ---------- */
  const FAQ = [
    { re: /\bpain|\bhurt|\bache\b|\baching|боль|болит|болят|ցավ/, a: L(
      'I cannot tell what causes pain — only a doctor can. If you have chest pain or pressure, trouble breathing, pain spreading to the arm or jaw, fainting or sudden weakness, call emergency services (112) right away. For other pain, see a doctor.',
      'Я не могу определить причину боли — это может только врач. Если есть боль или давление в груди, трудно дышать, боль отдаёт в руку или челюсть, был обморок или внезапная слабость — сразу звоните в скорую (112). При другой боли обратитесь к врачу.',
      'Ես չեմ կարող որոշել ցավի պատճառը․ դա կարող է անել միայն բժիշկը։ Եթե կրծքավանդակում ցավ կամ ճնշում կա, դժվար է շնչել, ցավը տարածվում է դեպի ձեռք կամ ծնոտ, եղել է ուշագնացություն կամ հանկարծակի թուլություն՝ անմիջապես զանգահարիր շտապ օգնություն (112)։ Այլ ցավի դեպքում դիմիր բժշկի։') },
    { re: /blue|син[иеяюо]|կապույտ|կապտ/, a: L(
      'Blood is never really blue — it is always red: bright red with oxygen, darker red without. Veins look blue through the skin because of how light is scattered and absorbed. In this model blue simply marks oxygen-poor blood and red marks oxygen-rich blood — that is why the pulmonary artery is blue although it is an artery.',
      'Кровь никогда не бывает по-настоящему синей — она всегда красная: ярко-красная с кислородом и темнее без него. Вены кажутся синими через кожу из-за рассеяния и поглощения света. В этой модели синий цвет просто обозначает кровь, бедную кислородом, красный — богатую. Поэтому лёгочная артерия синяя, хотя это артерия.',
      'Արյունը երբեք իրականում կապույտ չէ․ այն միշտ կարմիր է՝ թթվածնով՝ վառ կարմիր, առանց թթվածնի՝ մուգ կարմիր։ Երակները մաշկի միջով կապույտ են երևում լույսի ցրման և կլանման պատճառով։ Այս մոդելում կապույտը պարզապես նշանակում է թթվածնով աղքատ արյուն, կարմիրը՝ թթվածնով հարուստ․ դրա համար թոքային զարկերակը կապույտ է, թեև զարկերակ է։') },
    { re: /thick|wide|width|diamet|толщ|ширин|диаметр|հաստ|լայն|տրամագիծ/, need: VESSEL, a: L(
      'Sizes vary hugely: the aorta is about 2.5–3 cm across (like a garden hose), the vena cava is similar, large arteries and veins are 0.5–1 cm, tiny arterioles and venules are tens of micrometres, and capillaries are only 5–10 µm — about one red blood cell wide. In the 3D model the vessels are drawn thicker than real so you can see and click them.',
      'Размеры очень разные: аорта около 2,5–3 см в диаметре (как садовый шланг), полая вена похожа, крупные артерии и вены — 0,5–1 см, мелкие артериолы и венулы — десятки микрометров, а капилляры всего 5–10 мкм — примерно один эритроцит в ширину. В 3D-модели сосуды нарисованы толще настоящих, чтобы их было видно и можно было нажать.',
      'Չափերը շատ տարբեր են․ աորտան մոտ 2,5–3 սմ տրամագծով է (այգու փողրակի նման), սիներակը նույնպես, խոշոր զարկերակներն ու երակները՝ 0,5–1 սմ, մանր զարկերակիկներն ու երակիկները՝ տասնյակ միկրոմետր, իսկ մազանոթները՝ ընդամենը 5–10 մկմ՝ մոտ մեկ էրիթրոցիտի լայնությամբ։ 3D մոդելում անոթները իրականից հաստ են նկարված, որպեսզի երևան և հնարավոր լինի սեղմել։') },
    { re: /differ|versus|\bvs\b|отлич|разниц|տարբեր/, need: /(arter|артер|զարկերակ)[\s\S]*(vein|вен|երակ)|(vein|вен|երակ)[\s\S]*(arter|артер|զարկերակ)/, a: L(
      'Arteries carry blood away from the heart; they have thick, elastic, muscular walls because the pressure is high, and you can feel a pulse in them. Veins bring blood back to the heart; their walls are thinner, the pressure is low, and one-way valves stop blood from flowing backwards. Most arteries carry oxygen-rich blood, most veins oxygen-poor — the pulmonary vessels are the exception.',
      'Артерии уносят кровь от сердца; их стенки толстые, упругие и мышечные, потому что давление высокое, в них прощупывается пульс. Вены возвращают кровь к сердцу; стенки тоньше, давление низкое, а односторонние клапаны не дают крови течь назад. В большинстве артерий кровь богата кислородом, в большинстве вен — бедна; исключение — лёгочные сосуды.',
      'Զարկերակները արյունը տանում են սրտից․ պատերը հաստ են, առաձգական և մկանային, քանի որ ճնշումը բարձր է, և դրանցում զարկ է զգացվում։ Երակները արյունը վերադարձնում են սրտին․ պատերը բարակ են, ճնշումը ցածր է, իսկ միակողմանի փականները թույլ չեն տալիս արյանը հետ հոսել։ Զարկերակների մեծ մասում արյունը թթվածնով հարուստ է, երակների մեծ մասում՝ աղքատ․ բացառություն են թոքային անոթները։') },
    { re: /pulse|heart ?rate|bpm|пульс|сердцебиен|ритм|սրտազարկ|սրտի զարկ|զարկերակային զարկ/, a: L(
      'A normal resting heart rate for adults is about 60–100 beats per minute; well-trained athletes can be lower. Exercise, fever, stress and caffeine raise it. Try the heart-rate slider under the 3D model to watch the heart and the blood flow speed up.',
      'Нормальный пульс взрослого в покое — около 60–100 ударов в минуту; у тренированных людей он может быть ниже. Нагрузка, температура, стресс и кофеин его повышают. Попробуй ползунок пульса под 3D-моделью — сердце и ток крови ускорятся.',
      'Մեծահասակի հանգստի նորմալ սրտազարկը րոպեում մոտ 60–100 է․ մարզվածների մոտ կարող է ավելի ցածր լինել։ Այն բարձրացնում են ծանրաբեռնվածությունը, ջերմությունը, սթրեսը և կոֆեինը։ Փորձիր 3D մոդելի տակի սրտազարկի սահիկը՝ սիրտը և արյան հոսքը կարագանան։') },
    { re: /pressure|давлени|ճնշում/, a: L(
      'Blood pressure is the force of blood on artery walls, written as two numbers, for example 120/80 mmHg: the first is when the heart contracts, the second when it rests. Around 120/80 is considered normal for adults; persistently high values are a reason to see a doctor. It is usually measured on the brachial artery at the elbow.',
      'Артериальное давление — сила, с которой кровь давит на стенки артерий; записывается двумя числами, например 120/80 мм рт. ст.: первое — когда сердце сокращается, второе — когда расслаблено. Около 120/80 считается нормой у взрослых; постоянно повышенные значения — повод обратиться к врачу. Обычно его измеряют на плечевой артерии у локтя.',
      'Զարկերակային ճնշումը արյան ուժն է զարկերակների պատերի վրա՝ գրվում է երկու թվով, օրինակ՝ 120/80 մմ սնդ. սյ.․ առաջինը՝ երբ սիրտը կծկվում է, երկրորդը՝ երբ թուլանում է։ Մեծահասակների համար նորմա է համարվում մոտ 120/80․ մշտապես բարձր արժեքները բժշկի դիմելու պատճառ են։ Սովորաբար չափում են արմունկի մոտ՝ բազկային զարկերակի վրա։'), link: ['pressure.html', 'nav_pressure'] },
    { re: /clot|scab|bleed|мак?арда|свёртыв|свертыв|кровотеч|мակարդ|արյունահոս/, a: L(
      'A wound stops bleeding in four steps: the vessel narrows, platelets plug the hole, fibrin threads weave a net, and a clot (scab) seals it. Watch it step by step on the Clotting page.',
      'Рана перестаёт кровоточить за четыре шага: сосуд сужается, тромбоциты закрывают дыру, нити фибрина плетут сеть, и сгусток (корочка) запечатывает рану. Посмотри по шагам на странице «Свёртывание».',
      'Վերքը դադարում է արյունահոսել չորս քայլով՝ անոթը նեղանում է, թրոմբոցիտները փակում են անցքը, ֆիբրինի թելերը ցանց են հյուսում, և մակարդուկը (կեղևը) փակում է վերքը։ Տես քայլ առ քայլ «Մակարդում» էջում։'), link: ['clot.html', 'nav_clot'] },
    { re: /circul|loop|circle|how .*(flow|travel)|круг|кровообращ|как течёт|как течет|շրջանառ|շրջան/, a: L(
      'Blood travels in two loops. Pulmonary loop: right ventricle → pulmonary arteries → lungs (drops CO₂, picks up O₂) → pulmonary veins → left atrium. Systemic loop: left ventricle → aorta → arteries → capillaries (deliver O₂) → veins → vena cava → right atrium. One full trip takes roughly a minute.',
      'Кровь идёт по двум кругам. Малый: правый желудочек → лёгочные артерии → лёгкие (отдаёт CO₂, берёт O₂) → лёгочные вены → левое предсердие. Большой: левый желудочек → аорта → артерии → капилляры (отдают O₂) → вены → полая вена → правое предсердие. Один полный оборот занимает примерно минуту.',
      'Արյունը շրջանառում է երկու շրջանով։ Փոքր՝ աջ փորոք → թոքային զարկերակներ → թոքեր (տալիս է CO₂, վերցնում O₂) → թոքային երակներ → ձախ նախասիրտ։ Մեծ՝ ձախ փորոք → աորտա → զարկերակներ → մազանոթներ (տալիս են O₂) → երակներ → սիներակ → աջ նախասիրտ։ Մեկ ամբողջական շրջանը տևում է մոտ մեկ րոպե։') },
    { re: /how much blood|litre|liter|сколько крови|литр|որքան արյուն|լիտր/, a: L(
      'An adult has about 5 litres of blood. The heart pumps roughly 5 litres every minute — around 7,000 litres a day.',
      'У взрослого около 5 литров крови. Сердце перекачивает примерно 5 литров в минуту — около 7000 литров в сутки.',
      'Մեծահասակի մոտ կա շուրջ 5 լիտր արյուն։ Սիրտը րոպեում մղում է մոտ 5 լիտր՝ օրական մոտ 7000 լիտր։') },
    { re: /\becg\b|\bekg\b|экг|кардиограмм|էկգ|սրտագր/, a: L(
      'An ECG records the heart’s electrical impulses. On the ECG page you can watch a normal rhythm, fast and slow rhythms, fibrillation and the flat line of a stopped heart.',
      'ЭКГ записывает электрические импульсы сердца. На странице ЭКГ можно посмотреть нормальный ритм, быстрый и медленный, фибрилляцию и прямую линию остановившегося сердца.',
      'ԷԿԳ-ն գրանցում է սրտի էլեկտրական ազդակները։ ԷԿԳ էջում կարող ես տեսնել նորմալ ռիթմը, արագ և դանդաղ ռիթմերը, ֆիբրիլյացիան և կանգ առած սրտի ուղիղ գիծը։'), link: ['ecg.html', 'nav_ecg'] },
    { re: /transfus|donat|donor|перелив|донор|փոխներարկ|դոնոր/, a: L(
      'Who can give blood to whom is explained, with a table, on the Transfusion page.',
      'Кто кому может перелить кровь — с таблицей, на странице «Переливание».',
      'Ով ում կարող է արյուն տալ՝ աղյուսակով, բացատրված է «Փոխներարկում» էջում։'), link: ['transfusion.html', 'nav_transfusion'] },
    { re: /blood (type|group)|группа крови|группы крови|группу крови|rhesus|\brh\b|резус|արյան խումբ|ռեզուս/, a: L(
      'Blood groups (A, B, AB, O and Rh) and how to find out yours are on these pages.',
      'Группы крови (A, B, AB, O и резус) и как узнать свою — на этих страницах.',
      'Արյան խմբերը (A, B, AB, O և ռեզուս) և ինչպես իմանալ քոնը՝ այս էջերում։'), link: ['blood.html', 'nav_blood'], link2: ['find.html', 'nav_find'] },
    { re: /cholest|холестер|խոլեստեր|\bldl\b|\bhdl\b/, a: L(
      'Cholesterol, LDL, HDL and a calculator for your own numbers are on the Cholesterol page.',
      'Холестерин, ЛПНП, ЛПВП и калькулятор для ваших цифр — на странице «Холестерин».',
      'Խոլեստերինը, LDL-ը, HDL-ը և քո թվերի հաշվիչը՝ «Խոլեստերին» էջում։'), link: ['cholesterol.html', 'nav_chol'] },
    { re: /vitamin|витамин|վիտամին|\biron\b|железо|երկաթ|b12/, a: L(
      'Vitamins and iron for healthy blood, with sources and lab tests, are on the Vitamins page.',
      'Витамины и железо для здоровой крови, с источниками и анализами — на странице «Витамины».',
      'Վիտամինները և երկաթը առողջ արյան համար՝ աղբյուրներով և անալիզներով, «Վիտամիններ» էջում։'), link: ['vitamins.html', 'nav_vit'] },
  ];

  /* ---------- part lookup (stem matching, works for hy/ru/en) ---------- */
  const stems = (name) => name.toLowerCase().split(/[\s\-–,()/]+/).filter(w => w.length >= 3).map(w => w.slice(0, Math.max(3, w.length - 3)));
  function findPart(q) {
    let best = null, bs = 0;
    Object.keys(PARTS).forEach(id => {
      ['en', 'ru', 'hy'].forEach(lg => {
        PARTS[id].name[lg].split(/\s*(?:&| и )\s*/).forEach(alt => {
          const st = stems(alt);
          if (st.length && st.every(s => q.indexOf(s) >= 0)) {
            const sc = st.join('').length;
            if (sc > bs) { bs = sc; best = id; }
          }
        });
      });
    });
    return best;
  }

  function local(raw) {
    const q = raw.toLowerCase().replace(/ё/g, 'е');
    for (const f of FAQ) {
      if (f.re.test(q) && (!f.need || f.need.test(q))) {
        const links = [f.link, f.link2].filter(Boolean).map(l => ({ href: l[0], label: tt(l[1]) }));
        return { text: t(f.a), links };
      }
    }
    const id = findPart(q);
    if (id) {
      const p = PARTS[id];
      if (V) V.select(id);
      return { text: `${t(p.name)} — ${t(KINDS[p.kind].name)}\n${t(p.desc)}${V ? '\n\n' + tt('ai_hl') : ''}`, links: [] };
    }
    return null;
  }

  /* ---------- free public AI fallback ---------- */
  async function remote(q) {
    const cfg = window.HEMO_CONFIG || {};
    if (!cfg.geminiKey) throw new Error('nokey');
    const sys = `You are a concise helper inside an educational website about the human circulatory system (heart, blood vessels, blood, blood groups, cholesterol, vitamins and minerals for blood). Answer in ${LN[LANG]}, in at most 3 short sentences, in simple words. If the question is outside this topic, politely say you only discuss the circulatory system. Never diagnose or suggest treatment; for symptoms advise seeing a doctor, and for severe symptoms such as chest pain advise calling emergency services (112).`;
    const contents = history.slice(-6).concat([{ role: 'user', content: q }])
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
    try {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(cfg.model || 'gemini-3.5-flash-lite') + ':generateContent', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.geminiKey }, signal: ctl.signal,
        body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { maxOutputTokens: 400, temperature: 0.4 } }),
      });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      const parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
      const txt = parts && parts.filter(p => !p.thought).map(p => p.text || '').join('');
      if (!txt) throw new Error('empty');
      return txt.replace(/\*\*/g, '').trim();
    } finally { clearTimeout(to); }
  }

  /* ---------- UI ---------- */
  function addMsg(kind, text, links) {
    const d = document.createElement('div'); d.className = 'msg ' + kind;
    const p = document.createElement('div'); p.className = 'bubble'; p.textContent = text; d.appendChild(p);
    (links || []).forEach(l => { const a = document.createElement('a'); a.href = l.href; a.className = 'chat-link'; a.textContent = l.label + ' →'; p.appendChild(document.createElement('br')); p.appendChild(a); });
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    return d;
  }
  async function ask(text) {
    text = text.trim(); if (!text || busy) return;
    busy = true; sendBtn.disabled = true; userMsgs++;
    addMsg('user', text); input.value = '';
    let ans = local(text);
    if (ans) { addMsg('bot', ans.text, ans.links); history.push({ role: 'user', content: text }, { role: 'assistant', content: ans.text }); }
    else if (!(window.HEMO_CONFIG && window.HEMO_CONFIG.geminiKey)) {
      addMsg('bot', tt('ai_nokey'));
    } else {
      const w = addMsg('bot pending', tt('ai_thinking'));
      try {
        const r = await remote(text);
        w.remove(); addMsg('bot', r); history.push({ role: 'user', content: text }, { role: 'assistant', content: r });
      } catch (e) { w.remove(); addMsg('bot', tt('ai_err')); }
    }
    busy = false; sendBtn.disabled = false; input.focus({ preventScroll: true });
  }
  function refresh() {
    chipsEl.innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" class="qchip" data-q="${n}">${tt('ai_q' + n)}</button>`).join('');
    if (!userMsgs) { log.innerHTML = ''; addMsg('bot', tt('ai_hello')); }
  }
  chipsEl.addEventListener('click', e => { const b = e.target.closest('.qchip'); if (b) ask(tt('ai_q' + b.dataset.q)); });
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  window.HemoChat = { refresh };
  refresh();
})();
