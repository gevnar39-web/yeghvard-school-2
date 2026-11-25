/* HemoAtlas — animated story: Werner Forssmann (1929), drawn with SVG + CSS */
(function () {
  'use strict';
  const svg = document.getElementById('stSvg');
  if (!svg) return;
  const $ = (id) => document.getElementById(id);
  const SK = '#f2c9a0';
  const HEART = 'M100 168C28 112 10 78 10 52a42 42 0 0 1 90-18A42 42 0 0 1 190 52c0 26-18 60-90 116z';

  /* ---------- texts ---------- */
  const CAP = [
    L('1929, Germany. A young doctor, Werner Forssmann, 25 years old, works in a small hospital in Eberswalde.',
      '1929 год, Германия. Молодой врач Вернер Форсман, 25 лет, работает в небольшой больнице в Эберсвальде.',
      '1929 թվական, Գերմանիա։ 25-ամյա երիտասարդ բժիշկ Վերներ Ֆորսմանը աշխատում է Էբերսվալդեի փոքր հիվանդանոցում։'),
    L('When a heart was failing, doctors pushed a long needle through the chest straight into the heart to inject medicine. It was very dangerous.',
      'Когда сердце отказывало, врачи вводили лекарство длинной иглой прямо через грудную клетку в сердце. Это было очень опасно.',
      'Երբ սիրտը թուլանում էր, բժիշկները երկար ասեղով կրծքավանդակի միջով անմիջապես սրտի մեջ դեղ էին ներարկում։ Դա շատ վտանգավոր էր։'),
    L('Forssmann had an idea: what if a thin, soft tube goes through a vein of the arm all the way to the heart? A safe road for medicine!',
      'У Форсмана появилась идея: а что, если тонкая мягкая трубка пройдёт по вене руки прямо к сердцу? Безопасная дорога для лекарств!',
      'Ֆորսմանը մի գաղափար ունեցավ․ ի՞նչ կլինի, եթե բարակ, փափուկ խողովակը ձեռքի երակով հասնի մինչև սիրտ։ Դեղի համար անվտանգ ճանապարհ։'),
    L('But his chief said no: an experiment on a living person was too risky. Forssmann had only tried it on a dead body.',
      'Но начальник сказал «нет»: опыт на живом человеке слишком рискованный. Форсман пробовал только на трупе.',
      'Բայց նրա ղեկավարը ասաց՝ ոչ․ կենդանի մարդու վրա փորձը չափազանց վտանգավոր է։ Ֆորսմանը փորձել էր միայն դիակի վրա։'),
    L('Nurse Gerda Ditzen, who looked after the sterile tools, offered to be the test person. Forssmann pretended to agree and tied her to a chair so she could not move (some tellings say the operating table). Then he got ready to do it on himself.',
      'Медсестра Герда Дитцен, которая отвечала за стерильные инструменты, вызвалась стать подопытной. Форсман сделал вид, что согласен, и привязал её к стулу, чтобы она не двигалась (в некоторых рассказах — к операционному столу). А сам приготовился делать опыт на себе.',
      'Ստերիլ գործիքների համար պատասխանատու բուժքույր Գերդա Դիտցենը առաջարկեց ինքը դառնալ փորձարկվող։ Ֆորսմանը ձևացրեց, թե համաձայն է, և նրան կապեց աթոռին, որ չշարժվի (որոշ պատմություններում՝ վիրահատական սեղանին)։ Իսկ ինքը պատրաստվեց փորձը կատարել իր վրա։'),
    L('He numbed his own arm, opened a vein at the elbow and slowly pushed a thin tube, about 65 centimetres long, along the vein.',
      'Он обезболил собственную руку, вскрыл вену у локтя и медленно повёл по вене тонкую трубку длиной около 65 сантиметров.',
      'Նա թմրեցրեց իր ձեռքը, արմունկի մոտ բացեց երակը և դանդաղ առաջ տարավ մոտ 65 սանտիմետր երկարությամբ բարակ խողովակը։'),
    L('With the tube still in his arm, he walked down to the X-ray room to see where its tip was.',
      'С трубкой в руке он пошёл вниз, в рентген-кабинет, чтобы увидеть, где её конец.',
      'Խողովակը ձեռքում՝ նա իջավ ռենտգենի սենյակ՝ տեսնելու, թե որտեղ է նրա ծայրը։'),
    L('On the X-ray screen, which he watched in a mirror, the tip had reached the right atrium of his heart! An X-ray photo proved it.',
      'На экране рентгена, который он смотрел в зеркале, конец трубки дошёл до правого предсердия! Рентгеновский снимок это доказал.',
      'Ռենտգենի էկրանին, որը նա նայում էր հայելու մեջ, խողովակի ծայրը հասել էր սրտի աջ նախասիրտ։ Ռենտգեն նկարը դա ապացուցեց։'),
    L('He published it in 1929. Many doctors laughed or did not believe him, and later he left heart research and became a urologist.',
      'Он опубликовал это в 1929 году. Многие врачи смеялись или не верили, и позже он оставил исследования сердца и стал урологом.',
      'Նա դա հրապարակեց 1929-ին։ Շատ բժիշկներ ծիծաղեցին կամ չհավատացին, իսկ հետո նա թողեց սրտի հետազոտությունները և դարձավ ուրոլոգ։'),
    L('In 1956 he received the Nobel Prize in Physiology or Medicine, together with André Cournand and Dickinson Richards, who had turned the method into a tool to study the heart.',
      'В 1956 году он получил Нобелевскую премию по физиологии и медицине вместе с Андре Курнаном и Дикинсоном Ричардсом, которые превратили метод в инструмент изучения сердца.',
      '1956-ին նա ստացավ Նոբելյան մրցանակ ֆիզիոլոգիայի և բժշկության ոլորտում՝ Անդրե Կուրնանի և Դիկինսոն Ռիչարդսի հետ, ովքեր այդ մեթոդը դարձրին սիրտը հետազոտելու գործիք։'),
    L('Today catheters let doctors look inside heart vessels and open blocked ones with a tiny mesh tube called a stent. This idea helps millions of people.',
      'Сегодня катетеры позволяют врачам заглянуть в сосуды сердца и открыть закупоренные крошечной сетчатой трубкой — стентом. Эта идея помогает миллионам людей.',
      'Այսօր կաթետերները թույլ են տալիս բժիշկներին տեսնել սրտի անոթների ներսը և բացել խցանվածները ստենտ կոչվող փոքրիկ ցանցային խողովակով։ Այս գաղափարը օգնում է միլիոնավոր մարդկանց։'),
    L('Brave and curious — but do not copy this! It was a dangerous experiment. Today doctors test new ideas safely, step by step.',
      'Смелость и любопытство — но не повторяй это! Опыт был опасным. Сегодня врачи проверяют новые идеи безопасно, шаг за шагом.',
      'Համարձակություն և հետաքրքրասիրություն, բայց դու դա մի՛ կրկնիր։ Փորձը վտանգավոր էր։ Այսօր բժիշկները նոր գաղափարները ստուգում են անվտանգ՝ քայլ առ քայլ։'),
  ];
  const LBL = {
    xray: L('X-RAY', 'РЕНТГЕН', 'ՌԵՆՏԳԵՆ'),
    ra: L('right atrium', 'правое предсердие', 'աջ նախասիրտ'),
    elbow: L('vein at the elbow', 'вена у локтя', 'արմունկի երակ'),
    cm: L('≈ 65 cm', '≈ 65 см', '≈ 65 սմ'),
    mirror: L('mirror', 'зеркало', 'հայելի'),
    plaque: L('blockage', 'закупорка', 'խցանում'),
    stent: L('stent', 'стент', 'ստենտ'),
    nobel: L('Nobel Prize', 'Нобелевская премия', 'Նոբելյան մրցանակ'),
    nocopy: L('Do not copy!', 'Не повторяй!', 'Մի՛ կրկնիր'),
    heart: L('heart', 'сердце', 'սիրտ'),
    play: L('Play', 'Смотреть', 'Նայել'),
    pause: L('Pause', 'Пауза', 'Դադար'),
    replay: L('Replay', 'Заново', 'Նորից'),
    prev: L('Back', 'Назад', 'Հետ'),
    next: L('Next', 'Дальше', 'Առաջ'),
    snd_on: L('Sound on (click to mute)', 'Звук включён (нажми, чтобы выключить)', 'Ձայնը միացված է (սեղմիր անջատելու համար)'),
    snd_off: L('Sound off (click to turn on)', 'Звук выключен (нажми, чтобы включить)', 'Ձայնը անջատված է (սեղմիր միացնելու համար)'),
  };
  const lb = (k) => t(LBL[k]);
  const tx = (k, x, y, size, fill, extra) => `<text class="lbl" data-k="${k}" x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${fill}" ${extra || ''}>${lb(k)}</text>`;

  /* ---------- drawing helpers ---------- */
  function limb(d, w, col) { return `<path d="${d}" stroke="#c9d3ef" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`; }
  // feet at (0,0), facing right
  function man(o) {
    o = o || {};
    const coat = o.coat || '#ffffff', hair = o.hair || '#3b2a20';
    const armF = o.armF || 'M20 -128 Q38 -104 32 -82', hand = o.hand || [32, -78];
    let s = `<rect x="-14" y="-74" width="12" height="74" rx="5" fill="#33406b"/><rect x="2" y="-74" width="12" height="74" rx="5" fill="#33406b"/>
      <rect x="-17" y="-7" width="17" height="8" rx="4" fill="#1b1b2f"/><rect x="2" y="-7" width="19" height="8" rx="4" fill="#1b1b2f"/>
      ${limb('M-20 -128 Q-36 -104 -30 -82', 12, coat)}<circle cx="-30" cy="-78" r="6" fill="${SK}"/>
      <rect x="-25" y="-140" width="50" height="78" rx="15" fill="${coat}" stroke="#c9d3ef" stroke-width="2"/><path d="M-7 -140 L0 -118 L7 -140Z" fill="#d7263d"/>
      ${limb(armF, 12, coat)}`;
    if (o.tube) s += `<path d="${armF}" stroke="#f2b632" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M${hand[0]} ${hand[1]} q9 16 -3 34" stroke="#f2b632" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    s += `<circle cx="${hand[0]}" cy="${hand[1]}" r="6" fill="${SK}"/>`;
    if (o.bag) s += `<rect x="22" y="-72" width="30" height="22" rx="4" fill="#8a6a4a"/><path d="M30 -72 q7 -10 14 0" stroke="#5a4028" stroke-width="3" fill="none"/>`;
    s += `<circle cx="0" cy="-163" r="22" fill="${SK}"/><path d="M-22 -166 Q-20 -190 2 -188 Q24 -188 22 -166 Q8 -178 -22 -166Z" fill="${hair}"/>
      <circle cx="9" cy="-162" r="2.4" fill="#222"/>`;
    s += o.sad ? `<path d="M3 -150 Q9 -154 15 -150" stroke="#8a4a3a" stroke-width="2" fill="none"/>` : `<path d="M3 -153 Q9 -148 15 -153" stroke="#8a4a3a" stroke-width="2" fill="none"/>`;
    if (o.must) s += `<path d="M2 -157 Q10 -153 18 -157" stroke="#aaa" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    return s;
  }
  const bubble = (x, y, w, h, inner, delay) => `<g class="fx-pop" style="animation-delay:${delay}s"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#fff" stroke="#9aa8d4" stroke-width="3"/>${inner}</g>`;
  const bg = (id) => `<rect width="800" height="450" fill="url(#${id})"/>`;
  const floor = `<rect y="360" width="800" height="90" fill="#dfe7f7"/><path d="M0 360H800" stroke="#c4d0ee" stroke-width="3"/>`;

  /* ---------- scenes ---------- */
  const SCENES = [
    /* 1 hospital, 1929 */
    () => `${bg('bgDay')}${floor}
      <g class="fx-fade"><rect x="120" y="150" width="340" height="210" fill="#fff" stroke="#c9d3ef" stroke-width="3"/>
      <path d="M100 152 L290 98 L480 152Z" fill="#d7263d"/><circle cx="290" cy="132" r="20" fill="#fff"/><rect x="284" y="120" width="12" height="24" fill="#d7263d"/><rect x="278" y="126" width="24" height="12" fill="#d7263d"/>
      ${[150, 220, 340, 410].map(x => `<rect x="${x}" y="190" width="40" height="44" rx="4" fill="#bcd3ff"/><rect x="${x}" y="262" width="40" height="44" rx="4" fill="#bcd3ff"/>`).join('')}
      <rect x="270" y="290" width="40" height="70" rx="4" fill="#2358d6"/></g>
      <text x="650" y="120" text-anchor="middle" class="big-year fx-pop" style="animation-delay:.4s">1929</text>
      <text x="650" y="154" text-anchor="middle" class="sub-year fx-fade" style="animation-delay:1.2s">Eberswalde · Germany</text>
      <g transform="translate(560 360)"><g class="fx-move" style="--sx:-440px;--dx:0px;--dur:4.5s;animation-delay:.3s">${man()}</g></g>`,

    /* 2 dangerous needle */
    () => `${bg('bgWarm')}
      <rect x="270" y="80" width="260" height="300" rx="100" fill="#ffe3d3" stroke="#e5b58f" stroke-width="3"/>
      <g transform="translate(318 142) scale(.82)"><g class="fx-beat"><path d="${HEART}" fill="url(#heartG)"/></g></g>
      <circle cx="400" cy="225" r="125" fill="none" stroke="#d7263d" stroke-width="4" stroke-dasharray="10 10" class="fx-fade" style="animation-delay:.5s"/>
      <g transform="translate(400 224) rotate(-35)"><g class="fx-stab" style="--sx:170px;--sy:0px;--dx:0px;--dy:0px;animation-delay:1s">
        <line x1="0" y1="0" x2="95" y2="0" stroke="#7d8bb5" stroke-width="3"/>
        <rect x="95" y="-13" width="125" height="26" rx="4" fill="#fff" stroke="#2358d6" stroke-width="3"/><rect x="98" y="-10" width="68" height="20" fill="#ffc9d0"/>
        <rect x="220" y="-3" width="55" height="6" fill="#7d8bb5"/><rect x="275" y="-18" width="8" height="36" rx="3" fill="#2358d6"/></g></g>
      <g class="fx-pop" style="animation-delay:2s"><path d="M650 70 L705 165 H595Z" fill="#fff" stroke="#d7263d" stroke-width="9" stroke-linejoin="round"/>
        <text x="650" y="150" text-anchor="middle" font-size="62" font-weight="800" fill="#d7263d">!</text></g>`,

    /* 3 the idea */
    () => `${bg('bgRoom')}
      <rect x="290" y="70" width="220" height="310" rx="90" fill="#ffe3d3" stroke="#e5b58f" stroke-width="3"/>
      <g transform="translate(345 150) scale(.55)"><g class="fx-beat"><path d="${HEART}" fill="url(#heartG)"/></g></g>
      <path d="M300 130 Q230 140 190 240 Q165 300 90 335" stroke="#e5b58f" stroke-width="52" fill="none" stroke-linecap="round"/>
      <path d="M300 130 Q230 140 190 240 Q165 300 90 335" stroke="${SK}" stroke-width="44" fill="none" stroke-linecap="round"/>
      <path pathLength="1" class="fx-draw" style="--dur:1.8s;animation-delay:.6s" d="M95 330 Q168 298 196 238 Q235 150 300 128 Q350 118 372 160 L378 184" stroke="#2f6fe0" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path pathLength="1" class="fx-draw" style="--dur:3.2s;animation-delay:2.8s" d="M95 330 Q168 298 196 238 Q235 150 300 128 Q350 118 372 160 L378 184" stroke="#f2b632" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(150 95)"><g class="fx-pop" style="animation-delay:.3s"><circle r="27" fill="#ffe27a" stroke="#f2b632" stroke-width="3"/><rect x="-12" y="26" width="24" height="14" rx="3" fill="#9aa8d4"/>
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="0" y1="-38" x2="0" y2="-50" stroke="#f2b632" stroke-width="4" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g></g>
      <g class="fx-pop" style="animation-delay:6.3s"><circle cx="650" cy="225" r="62" fill="#e4f4ea" stroke="#2f9e6b" stroke-width="6"/><path d="M620 227 L643 250 L682 200" stroke="#2f9e6b" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`,

    /* 4 the chief says no */
    () => `${bg('bgRoom')}${floor}
      <g transform="translate(290 360)">${man()}</g>
      <g transform="translate(520 360) scale(-1 1)"><g class="fx-shake" style="animation-delay:1.4s">${man({ hair: '#b9b9c4', must: true, coat: '#eef3ff' })}</g></g>
      ${bubble(455, 62, 130, 84, `<circle cx="520" cy="104" r="28" fill="#d7263d"/><path d="M508 92 L532 116 M532 92 L508 116" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M496 146 l10 30 l14 -30Z" fill="#fff" stroke="#9aa8d4" stroke-width="3" stroke-linejoin="round"/>`, 1.2)}
      <g class="fx-pop" style="animation-delay:.4s"><circle cx="285" cy="180" r="8" fill="#fff" stroke="#9aa8d4" stroke-width="3"/><circle cx="268" cy="152" r="12" fill="#fff" stroke="#9aa8d4" stroke-width="3"/>
        <ellipse cx="225" cy="95" rx="78" ry="50" fill="#fff" stroke="#9aa8d4" stroke-width="3"/>
        <g transform="translate(190 62) scale(.38)"><path d="${HEART}" fill="url(#heartG)"/></g><path d="M215 105 Q250 125 285 95" stroke="#f2b632" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,

    /* 5 the nurse on the chair */
    () => `${bg('bgRoom')}${floor}
      <rect x="185" y="300" width="100" height="14" rx="4" fill="#8a6a4a"/><rect x="185" y="208" width="14" height="106" rx="4" fill="#8a6a4a"/>
      <rect x="190" y="314" width="10" height="46" fill="#8a6a4a"/><rect x="270" y="314" width="10" height="46" fill="#8a6a4a"/>
      <rect x="276" y="310" width="14" height="50" rx="6" fill="#f0ddd0"/><rect x="274" y="354" width="26" height="8" rx="4" fill="#1b1b2f"/>
      <rect x="205" y="205" width="46" height="96" rx="16" fill="#2358d6"/><rect x="214" y="214" width="28" height="84" rx="8" fill="#fff" opacity=".95"/>
      <rect x="215" y="296" width="72" height="20" rx="9" fill="#2358d6"/>
      <path d="M246 224 Q256 260 262 292" stroke="#2358d6" stroke-width="12" fill="none" stroke-linecap="round" class="fx-late" style="animation-delay:3.4s"/>
      <g class="fx-hand"><path d="M246 222 Q270 210 272 180" stroke="#2358d6" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="272" cy="172" r="7" fill="${SK}"/></g>
      <circle cx="228" cy="180" r="21" fill="${SK}"/><path d="M207 178 Q207 154 228 154 Q249 154 249 178 Q240 166 207 178Z" fill="#6a4630"/>
      <rect x="212" y="150" width="32" height="12" rx="3" fill="#fff"/><rect x="226" y="147" width="4" height="12" fill="#d7263d"/><rect x="222" y="151" width="12" height="4" fill="#d7263d"/>
      <circle cx="236" cy="181" r="2.3" fill="#222"/><path d="M226 191 Q232 195 238 191" stroke="#8a4a3a" stroke-width="2" fill="none"/>
      <path pathLength="1" class="fx-draw" style="--dur:.5s;animation-delay:3.4s" d="M194 240 H264" stroke="#7a4b2a" stroke-width="9" stroke-linecap="round"/>
      <path pathLength="1" class="fx-draw" style="--dur:.5s;animation-delay:3.9s" d="M194 272 H264" stroke="#7a4b2a" stroke-width="9" stroke-linecap="round"/>
      <g class="fx-pop" style="animation-delay:.6s"><circle cx="318" cy="150" r="22" fill="#fff" stroke="#2358d6" stroke-width="3"/><text x="318" y="161" text-anchor="middle" font-size="32" font-weight="800" fill="#2358d6">!</text></g>
      <g class="fx-pop" style="animation-delay:4.6s"><circle cx="170" cy="140" r="26" fill="#fff" stroke="#d7263d" stroke-width="3"/><text x="170" y="152" text-anchor="middle" font-size="30" font-weight="800" fill="#d7263d">?!</text></g>
      <rect x="570" y="270" width="190" height="12" rx="4" fill="#9aa8d4"/><rect x="580" y="282" width="10" height="78" fill="#9aa8d4"/><rect x="740" y="282" width="10" height="78" fill="#9aa8d4"/>
      <path d="M590 262 L630 250" stroke="#7d8bb5" stroke-width="5" stroke-linecap="round"/><rect x="655" y="244" width="16" height="26" rx="4" fill="#bcd3ff" stroke="#2358d6" stroke-width="2"/><rect x="700" y="254" width="48" height="10" rx="4" fill="#fff" stroke="#2358d6" stroke-width="2"/>
      <g transform="translate(350 360)"><g class="fx-move" style="--sx:0px;--dx:230px;--dur:2.2s;animation-delay:5.4s">${man({ armF: 'M20 -128 Q44 -118 56 -102', hand: [58, -98] })}</g></g>`,

    /* 6 the tube goes along the vein */
    () => `${bg('bgRoom')}
      <path d="M70 310 Q240 340 370 275 Q540 195 740 170" stroke="#e5b58f" stroke-width="80" fill="none" stroke-linecap="round"/>
      <path d="M70 310 Q240 340 370 275 Q540 195 740 170" stroke="${SK}" stroke-width="72" fill="none" stroke-linecap="round"/>
      <path pathLength="1" class="fx-draw" style="--dur:1.2s;animation-delay:.2s" d="M70 302 Q240 332 370 267 Q540 187 740 162" stroke="#2f6fe0" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path pathLength="1" class="fx-draw" style="--dur:4s;animation-delay:2.2s" d="M370 267 Q540 187 740 162" stroke="#f2b632" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle class="fx-tip" r="8" fill="#fff" stroke="#f2b632" stroke-width="4" style="offset-path:path('M370 267 Q540 187 740 162');--dur:4s;animation-delay:2.2s"/>
      <g transform="translate(372 246)"><g class="fx-pop2"><path d="M0 0 L34 -20 L40 -11 L6 9Z" fill="#cfd8ee" stroke="#7d8bb5" stroke-width="2"/><rect x="34" y="-34" width="38" height="12" rx="5" transform="rotate(-30 34 -22)" fill="#2358d6"/></g></g>
      <circle cx="370" cy="267" r="6" fill="#d7263d" class="fx-fade" style="animation-delay:1.2s"/>
      <path d="M370 140 H740 M370 130 V150 M740 130 V150" stroke="#2358d6" stroke-width="4" fill="none" class="fx-fade" style="animation-delay:5.5s"/>
      <g class="fx-fade" style="animation-delay:5.5s">${tx('cm', 555, 118, 28, '#2358d6')}</g>
      <g class="fx-fade" style="animation-delay:1s">${tx('elbow', 300, 392, 24, '#d7263d')}<path d="M300 370 L366 288" stroke="#d7263d" stroke-width="3"/></g>
      <g transform="translate(700 70) scale(.28)" class="fx-fade" style="animation-delay:6s"><g class="fx-beat"><path d="${HEART}" fill="url(#heartG)"/></g></g>`,

    /* 7 walking to the X-ray room */
    () => `${bg('bgRoom')}
      ${Array.from({ length: 10 }, (_, i) => `<rect x="${80 + 44 * i}" y="${150 + 22 * i}" width="44" height="${210 - 22 * i}" fill="${i % 2 ? '#cfd9f0' : '#dfe7f7'}" stroke="#b9c6e8" stroke-width="2"/>`).join('')}
      <rect x="520" y="358" width="280" height="92" fill="#dfe7f7"/><path d="M520 358H800" stroke="#b9c6e8" stroke-width="3"/>
      <rect x="610" y="206" width="100" height="152" rx="6" fill="#fff" stroke="#9aa8d4" stroke-width="4"/><rect x="624" y="222" width="72" height="58" rx="4" fill="#0a2a3a"/><path d="M640 250 q10 -22 20 0 q10 22 20 0" stroke="#5bd4ff" stroke-width="3" fill="none"/>
      <rect x="600" y="160" width="120" height="36" rx="7" fill="#07143f"/>${tx('xray', 660, 185, 20, '#fff')}
      <g transform="translate(102 150)"><g class="fx-move" style="--sx:0px;--sy:0px;--dx:396px;--dy:198px;--dur:6s;animation-delay:.5s">${man({ tube: true })}</g></g>`,

    /* 8 the X-ray screen */
    () => `${bg('bgDark')}
      <rect x="160" y="30" width="480" height="390" rx="26" fill="#0a2a3a" stroke="#5bd4ff" stroke-width="5"/>
      <ellipse cx="335" cy="235" rx="82" ry="125" fill="#04141d"/><ellipse cx="465" cy="235" rx="82" ry="125" fill="#04141d"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M400 ${105 + i * 36} Q${300 - i * 6} ${95 + i * 36} 232 ${150 + i * 38}" stroke="rgba(190,230,255,.45)" stroke-width="7" fill="none"/><path d="M400 ${105 + i * 36} Q${500 + i * 6} ${95 + i * 36} 568 ${150 + i * 38}" stroke="rgba(190,230,255,.45)" stroke-width="7" fill="none"/>`).join('')}
      <rect x="392" y="60" width="16" height="340" rx="6" fill="rgba(190,230,255,.3)"/>
      <path d="M385 215 Q380 175 415 180 Q470 190 478 250 Q480 320 420 345 Q370 340 372 280Z" fill="rgba(170,215,255,.4)"/>
      <path pathLength="1" class="fx-draw" style="--dur:3s;animation-delay:.8s" d="M205 78 Q300 88 355 150 Q392 190 396 226" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="396" cy="226" r="11" fill="#fff" class="fx-glow" style="animation-delay:3.8s"/>
      <g class="fx-fade" style="animation-delay:4.2s">${tx('ra', 560, 180, 22, '#ffd66b')}<path d="M512 188 L408 222" stroke="#ffd66b" stroke-width="3"/></g>
      <g class="fx-fade" style="animation-delay:1s"><rect x="660" y="280" width="110" height="130" rx="12" fill="#1a3556" stroke="#5bd4ff" stroke-width="3"/><circle cx="715" cy="335" r="26" fill="${SK}"/><path d="M690 332 Q715 300 740 332" fill="#3b2a20"/><rect x="690" y="372" width="50" height="30" rx="10" fill="#fff"/>${tx('mirror', 715, 428, 18, '#8fd9ff')}</g>
      <rect width="800" height="450" fill="#fff" class="fx-flash" style="animation-delay:5.2s"/>
      <g transform="rotate(-6 150 120)"><g class="fx-pop" style="animation-delay:5.8s"><rect x="40" y="60" width="110" height="130" rx="6" fill="#fff"/><rect x="48" y="68" width="94" height="96" fill="#0a2a3a"/><path d="M62 130 Q95 118 98 100" stroke="#fff" stroke-width="3" fill="none"/><path d="M70 178 L84 190 L112 170" stroke="#2f9e6b" stroke-width="5" fill="none" stroke-linecap="round"/></g></g>`,

    /* 9 laughed at */
    () => `${bg('bgWarm')}${floor}
      <g transform="translate(400 215) rotate(-6)"><g class="fx-pop" style="animation-delay:.3s"><rect x="-120" y="-100" width="240" height="200" fill="#fff" stroke="#b9c6e8" stroke-width="3"/><rect x="-104" y="-84" width="208" height="30" fill="#07143f"/>
        <rect x="-104" y="-40" width="110" height="10" fill="#cfd8ee"/><rect x="-104" y="-22" width="110" height="10" fill="#cfd8ee"/><rect x="-104" y="-4" width="110" height="10" fill="#cfd8ee"/><rect x="-104" y="14" width="80" height="10" fill="#cfd8ee"/>
        <rect x="14" y="-40" width="90" height="64" fill="#bcd3ff"/><text x="0" y="82" text-anchor="middle" font-size="54" font-weight="800" fill="#d7263d">?!</text></g></g>
      ${[[130, 150, .9], [670, 140, 1.4], [120, 300, 1.9]].map(f => `<g class="fx-pop" style="animation-delay:${f[2]}s"><g transform="translate(${f[0]} ${f[1]})"><g class="fx-shake"><circle r="34" fill="${SK}" stroke="#e5b58f" stroke-width="3"/><path d="M-18 -8 Q-11 -16 -4 -8 M4 -8 Q11 -16 18 -8" stroke="#3b2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M-16 6 Q0 34 16 6Z" fill="#7a1020"/></g>
        <text y="-48" text-anchor="middle" font-size="22" font-weight="800" fill="#d7263d">HA HA!</text></g></g>`).join('')}
      <g transform="translate(540 360)"><g class="fx-move" style="--sx:0px;--dx:200px;--dur:5s;animation-delay:2.6s">${man({ sad: true, bag: true })}</g></g>`,

    /* 10 Nobel Prize */
    () => `${bg('bgDark')}
      <g transform="translate(400 190)"><g class="fx-spin">${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="-112" x2="0" y2="-150" stroke="#ffd66b" stroke-width="6" stroke-linecap="round" opacity=".7" transform="rotate(${i * 22.5})"/>`).join('')}</g></g>
      <g class="fx-pop" style="animation-delay:.2s"><circle cx="400" cy="190" r="98" fill="url(#goldG)" stroke="#b8860b" stroke-width="6"/><circle cx="400" cy="190" r="78" fill="none" stroke="#b8860b" stroke-width="3"/>
        ${tx('nobel', 400, 165, 15, '#7a5200')}<text x="400" y="222" text-anchor="middle" font-size="46" font-weight="800" fill="#7a5200">1956</text></g>
      <text x="400" y="345" text-anchor="middle" font-size="34" font-weight="800" fill="#ffd66b" class="fx-fade" style="animation-delay:1.2s">Werner Forssmann</text>
      <text x="400" y="381" text-anchor="middle" font-size="24" fill="#fff" class="fx-fade" style="animation-delay:2.4s">André Cournand</text>
      <text x="400" y="413" text-anchor="middle" font-size="24" fill="#fff" class="fx-fade" style="animation-delay:3.2s">Dickinson Richards</text>`,

    /* 11 stent today */
    () => `${bg('bgRoom')}
      <rect x="60" y="165" width="680" height="110" rx="12" fill="#ffc9d0" stroke="#e2808f" stroke-width="8"/>
      <g style="transform-origin:400px 170px" class="fx-squash"><path d="M310 170 Q400 262 490 170Z" fill="#f4d170" stroke="#d9b24a" stroke-width="3"/></g>
      <g style="transform-origin:400px 270px" class="fx-squash"><path d="M310 270 Q400 178 490 270Z" fill="#f4d170" stroke="#d9b24a" stroke-width="3"/></g>
      <g class="fx-expand" style="transform-origin:400px 220px"><g stroke="#2358d6" stroke-width="3" fill="none" stroke-linecap="round">${Array.from({ length: 10 }, (_, i) => { const x = 330 + i * 14; return `<path d="M${x} 173 L${x + 14} 220 L${x} 267 M${x + 14} 173 L${x} 220 L${x + 14} 267"/>`; }).join('')}<path d="M330 173 H470 M330 267 H470"/></g></g>
      <g class="fx-gone"><path pathLength="1" class="fx-draw" style="--dur:2.4s;animation-delay:.8s" d="M60 220 H335" stroke="#f2b632" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle class="fx-tip" r="9" fill="#fff" stroke="#f2b632" stroke-width="4" style="offset-path:path('M60 220 H335');--dur:2.4s;animation-delay:.8s"/></g>
      ${[0, 1, 2, 3].map(i => `<circle class="fx-flow" cx="70" cy="220" r="12" fill="#d7263d" style="animation-delay:${7 + i * 1}s"/>`).join('')}
      <g class="fx-blink">${tx('plaque', 400, 110, 26, '#9a6b00')}<path d="M400 120 L400 168" stroke="#9a6b00" stroke-width="3"/></g>
      <g class="fx-fade" style="animation-delay:5.4s">${tx('stent', 400, 335, 26, '#2358d6')}<path d="M400 290 L400 316" stroke="#2358d6" stroke-width="3"/></g>`,

    /* 12 do not copy */
    () => `${bg('bgWarm')}${floor}
      <g class="fx-pop" style="animation-delay:.2s"><path d="M240 95 L355 320 H125Z" fill="#fff" stroke="#d7263d" stroke-width="16" stroke-linejoin="round"/><text x="240" y="292" text-anchor="middle" font-size="140" font-weight="800" fill="#d7263d">!</text></g>
      <g class="fx-fade" style="animation-delay:1s">${tx('nocopy', 530, 170, 46, '#d7263d')}</g>
      <text x="530" y="222" text-anchor="middle" font-size="22" font-weight="700" fill="#07143f" class="fx-fade" style="animation-delay:2s">Werner Forssmann · 1904–1979</text>
      <g transform="translate(480 250) scale(.55)" class="fx-fade" style="animation-delay:3s"><g class="fx-beat"><path d="${HEART}" fill="url(#heartG)"/></g></g>
      <g transform="translate(735 360)"><g class="fx-fade" style="animation-delay:3s">${man()}</g></g>`,
  ];
  const DUR = [7, 9, 9, 7, 12, 10, 8, 10, 9, 8, 11, 8].map(x => x * 1000);

  /* ---------- build ---------- */
  svg.innerHTML = `<defs>
    <linearGradient id="bgDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ff"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <linearGradient id="bgRoom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3eeff"/><stop offset="1" stop-color="#fff7f8"/></linearGradient>
    <linearGradient id="bgWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9ec"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <linearGradient id="bgDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2a7a"/><stop offset="1" stop-color="#07143f"/></linearGradient>
    <radialGradient id="heartG" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8a9a"/><stop offset="1" stop-color="#c4152e"/></radialGradient>
    <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#d9a21b"/></linearGradient>
    <linearGradient id="txtG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2358d6"/><stop offset="1" stop-color="#d7263d"/></linearGradient></defs>`
    + SCENES.map((f, i) => `<g class="sc" id="sc${i}">${f()}</g>`).join('');

/* ---------- sound: narration (audio/<lang>/NN.mp3) + synthesized effects ---------- */
  let soundOn = true, ctx = null, master = null;
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, d, type, vol, at, to) {
    const c = audio(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), s = c.currentTime + (at || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, s); if (to) o.frequency.exponentialRampToValueAtTime(to, s + d);
    g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(vol || 0.3, s + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, s + d);
    o.connect(g); g.connect(master); o.start(s); o.stop(s + d + 0.05);
  }
  function noise(d, vol, freq, at, type) {
    const c = audio(); if (!c) return;
    const n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = type || 'bandpass'; flt.frequency.value = freq;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(flt); flt.connect(g); g.connect(master); src.start(c.currentTime + (at || 0));
  }
  const FX = {
    chime: () => { tone(880, .5, 'sine', .25); tone(1320, .6, 'sine', .2, .12); },
    ding: () => tone(1568, .7, 'sine', .3),
    thump: () => { tone(70, .16, 'sine', .9, 0, 38); tone(60, .16, 'sine', .6, .2, 34); },
    warn: () => { tone(880, .14, 'square', .16); tone(880, .14, 'square', .16, .22); },
    no: () => tone(150, .4, 'sawtooth', .22, 0, 95),
    boing: () => tone(280, .22, 'sine', .3, 0, 620),
    strap: () => { noise(.12, .7, 1400); tone(180, .08, 'square', .1); },
    scalpel: () => noise(.25, .5, 5000, 0, 'highpass'),
    slide: () => tone(300, 3.8, 'triangle', .07, 0, 540),
    step: () => noise(.07, .8, 380, 0, 'lowpass'),
    shutter: () => { noise(.05, 1, 3000); noise(.06, 1, 2200, .09); tone(1800, .06, 'square', .08, .02); },
    laugh: () => [0, .17, .34].forEach((d, i) => tone(430 - i * 30, .12, 'triangle', .25, d, 330 - i * 30)),
    sad: () => [[233, 0], [208, .4], [185, .8]].forEach(a => tone(a[0], .42, 'sawtooth', .16, a[1])),
    fanfare: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .32, 'triangle', .26, i * .16)); tone(1046, 1.1, 'triangle', .22, .64); tone(784, 1.1, 'sine', .15, .64); },
    pop: () => tone(900, .12, 'sine', .35, 0, 220),
    success: () => [523, 659, 784].forEach((f, i) => tone(f, .35, 'sine', .22, i * .12)),
  };
  const rep = (name, from, to, every) => { const a = []; for (let x = from; x <= to; x += every) a.push([x, name]); return a; };
  const SFX = [
    [[300, 'chime']].concat(rep('step', 700, 4700, 520)),
    [[500, 'thump'], [1200, 'warn'], [2000, 'warn'], [3000, 'thump'], [4600, 'thump'], [6200, 'thump'], [7800, 'thump']],
    [[300, 'ding'], [2800, 'slide'], [6300, 'success']],
    [[400, 'pop'], [1300, 'no'], [2500, 'boing']],
    [[600, 'boing'], [3400, 'strap'], [3900, 'strap'], [4600, 'boing']].concat(rep('step', 5600, 7600, 480)),
    [[800, 'scalpel'], [2200, 'slide']],
    rep('step', 600, 6400, 600),
    [[800, 'slide'], [5200, 'shutter'], [5900, 'success']],
    [[900, 'laugh'], [1400, 'laugh'], [1900, 'laugh'], [2800, 'sad']],
    [[200, 'fanfare']],
    [[800, 'slide'], [4600, 'pop'], [5700, 'success']],
    [[200, 'warn'], [3000, 'chime']],
  ];

  const nar = new Audio(); nar.preload = 'auto';
  let narSrc = '', narDone = true, sfxIdx = 0;
  const LANGTAG = { hy: 'hy-AM', ru: 'ru-RU', en: 'en-US' };
  const AUDIO_LANGS = ['hy'];      // languages that have recorded narration in audio/<lang>/; the others use the browser voice
  let curU = null;
  nar.onended = () => { narDone = true; };
  nar.onerror = () => { speakFallback(); };
  function speakFallback() {
    narDone = true;
    if (!soundOn || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(t(CAP[cur])); u.lang = LANGTAG[LANG] || 'en-US';
    curU = u; narDone = false;
    u.onend = () => { if (curU === u) narDone = true; }; u.onerror = () => { if (curU === u) narDone = true; };
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function stopNar() { nar.pause(); curU = null; if (narSrc.indexOf('tts:') === 0) narSrc = ''; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function ensureNar() {
    if (!soundOn) { narDone = true; return; }
    if (AUDIO_LANGS.indexOf(LANG) < 0) { if (narSrc !== 'tts:' + LANG + cur) { narSrc = 'tts:' + LANG + cur; speakFallback(); } return; }
    const src = 'audio/' + LANG + '/' + String(cur + 1).padStart(2, '0') + '.mp3';
    if (narSrc !== src) { narSrc = src; nar.src = src; narDone = false; }
    if (!narDone) { const p = nar.play(); if (p && p.catch) p.catch(() => { narDone = true; }); }
  }

  /* ---------- player ---------- */
  const story = $('story'), cap = $('stCap'), chip = $('stChip'), big = $('stBig'), prog = $('stProg');
  const scs = Array.from(svg.querySelectorAll('.sc'));
  prog.innerHTML = DUR.map((d, i) => `<button type="button" data-i="${i}" aria-label="${i + 1}"><i></i></button>`).join('');
  const bars = Array.from(prog.querySelectorAll('i'));
  let cur = 0, el = 0, playing = false, last = 0, started = false;

  function show(i) {
    scs.forEach(s => s.classList.remove('active'));
    void svg.getBoundingClientRect();           // restart CSS animations
    stopNar(); narSrc = ''; narDone = !soundOn; sfxIdx = 0;
    cur = i; el = 0; scs[i].classList.add('active');
    texts(); bars.forEach((b, k) => { b.style.width = k < i ? '100%' : '0'; });
  }
  function texts() { cap.textContent = t(CAP[cur]); chip.textContent = (cur + 1) + ' / ' + SCENES.length; }
  const finished = () => cur === SCENES.length - 1 && el >= DUR[cur] && narDone;
  function setPlaying(p) {
    playing = p; story.classList.toggle('paused', !p);
    $('stPlay').textContent = p ? '❚❚ ' + lb('pause') : (started && finished() ? '↻ ' + lb('replay') : '▶ ' + lb('play'));
    big.hidden = p;
    if (p) { last = performance.now(); if (soundOn) { audio(); ensureNar(); } } else { stopNar(); if (ctx && ctx.state === 'running') ctx.suspend(); }
  }
  function loop(now) {
    if (!playing) return;
    el += Math.min(now - last, 100); last = now;
    const list = SFX[cur];
    while (sfxIdx < list.length && el >= list[sfxIdx][0]) { if (soundOn) FX[list[sfxIdx][1]](); sfxIdx++; }
    if (el >= DUR[cur]) {
      el = DUR[cur];
      if (!narDone) { bars[cur].style.width = '100%'; return; }      // wait for the narrator to finish
      if (cur < SCENES.length - 1) show(cur + 1), ensureNar();
      else { bars[cur].style.width = '100%'; setPlaying(false); big.textContent = '↻'; return; }
    }
    bars[cur].style.width = Math.min(100, el / DUR[cur] * 100) + '%';
  }
  function start() {
    if (!started || finished()) show(0);
    started = true; big.textContent = '▶'; setPlaying(true);
  }
  $('stPlay').addEventListener('click', () => { if (playing) setPlaying(false); else if (!started || finished()) start(); else setPlaying(true); });
  big.addEventListener('click', start);
  $('stPrev').addEventListener('click', () => { started = true; show(Math.max(0, cur - (el > 1500 ? 0 : 1))); setPlaying(true); });
  $('stNext').addEventListener('click', () => { started = true; show(Math.min(SCENES.length - 1, cur + 1)); setPlaying(true); });
  prog.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { started = true; show(+b.dataset.i); setPlaying(true); } });
  $('stSound').addEventListener('click', () => {
    soundOn = !soundOn;
    if (!soundOn) { stopNar(); narDone = true; } else if (playing) { narSrc = ''; narDone = false; ensureNar(); }
    refresh();
  });

  function refresh() {
    svg.querySelectorAll('.lbl').forEach(n => { n.textContent = lb(n.dataset.k); });
    $('stPrev').textContent = '◀ ' + lb('prev'); $('stNext').textContent = lb('next') + ' ▶';
    const sb = $('stSound'); sb.textContent = soundOn ? '🔊' : '🔇'; sb.title = sb.ariaLabel = lb(soundOn ? 'snd_on' : 'snd_off');
    texts(); setPlaying(playing);
  }
  if (window.HemoExtra) {
    const old = window.HemoExtra.refresh;
    window.HemoExtra.refresh = () => { const wasPlaying = playing; old(); refresh(); if (wasPlaying && soundOn) { stopNar(); narSrc = ''; narDone = false; ensureNar(); } };
  }
  window.HemoStory = { get state() { return { cur, el, playing, narDone, narSrc, paused: nar.paused, t: nar.currentTime, dur: nar.duration, ended: nar.ended, ready: nar.readyState, err: nar.error && nar.error.code, soundOn }; } };
  show(0); setPlaying(false); refresh(); setInterval(() => loop(performance.now()), 50);
})();
