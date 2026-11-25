/* School home page: 3 languages + anonymous letters (Supabase). */
(function () {
  'use strict';
  var D = {
    hy: {
      brand: 'Եղվարդի N 2 դպրոց', n_home: 'Գլխավոր', pride_t: 'Մեր հպարտությունը', pride_x: 'Մեր դպրոցի լավագույն աշակերտները և մարդիկ, որոնցով հպարտանում է դպրոցը։', pride_empty: 'Շուտով այստեղ կհայտնվեն մեր լավագույն աշակերտները։', pride_err: 'Չհաջողվեց բեռնել։',  n_about: 'Դպրոցի մասին', n_where: 'Որտեղ ենք', n_proj: 'Մեր նախագծերը', n_letter: 'Գաղտնի նամակ',
      kicker: 'Անձնական էջ · Գևորգ',
      title: 'Եղվարդի Համլետ Թադևոսյանի անվան N 2 հիմնական դպրոց',
      lead: 'Բարի գալուստ։ Սա մեր դպրոցի էջն է, իսկ ներքևում կգտնես իմ ուսումնական նախագծերը՝ աշխարհագրություն, կենսաբանություն և երկրաչափություն։',
      cta1: 'Տեսնել նախագծերը', cta2: 'Գրել գաղտնի նամակ',
      about_t: 'Մեր դպրոցը',
      about_x: 'Եղվարդի N 2 հիմնական դպրոցը պետական ոչ առևտրային կազմակերպություն է (ՊՈԱԿ), որը գործում է Կոտայքի մարզի Եղվարդ քաղաքում։ Դպրոցը հիմնադրվել է 1962 թվականին, ուսուցումն անցնում է մեկ հերթով, շաբաթական հինգ օր։ Այն ունի համակարգչային և արհեստագործական սենյակներ, լաբորատորիաներ, գրադարաններ և սպորտդահլիճներ։',
      f_year: 'հիմնադրման տարին', f_pupils: 'աշակերտ', f_teachers: 'մանկավարժ', f_rooms: 'դասասենյակ', f_labs: 'լաբորատորիա', f_gyms: 'մարզադահլիճ',
      src_note: 'Տվյալների աղբյուրը՝ Կոտայքի մարզպետարանի կրթական հաստատությունների ցանկ (kotayk.mtad.am)։ Թվերը կարող են փոխվել։',
      where_t: 'Որտեղ է գտնվում',
      l_addr: 'Հասցե', v_addr: 'ք. Եղվարդ, Սաֆարյան փողոց 88, Կոտայքի մարզ, Հայաստան',
      l_phone: 'Հեռախոս', l_mail: 'Էլ. փոստ', l_dir: 'Տնօրեն', v_dir: 'Գայանե Երանոսյան',
      l_type: 'Տեսակը', v_type: 'Հիմնական դպրոց (ՊՈԱԿ)',
      map_btn: 'Բացել քարտեզում',
      town_t: 'Եղվարդի մասին',
      town_x: 'Եղվարդը քաղաք է Կոտայքի մարզում, Երևանից հյուսիս-արևելք։ 2022 թվականի մարդահամարով բնակչությունը մոտ 12 հազար մարդ է։ Քաղաքում գործում են երեք հանրակրթական դպրոց։',
      proj_t: 'Մեր նախագծերը', proj_x: 'Երեք ուսումնական կայք՝ երեք լեզվով։ Ընտրիր թեմա։',
      p_geo: 'Աշխարհագրություն', p_geo_x: 'Մեծ Բրիտանիա, Լա Մանշ, Եվրոթունել և Բիգ Բեն՝ 3D քարտեզով։',
      p_bio: 'Կենսաբանություն', p_bio_x: 'Սիրտ և արյունատար համակարգ՝ 3D մոդելով և թեստով։',
      p_geom: 'Երկրաչափություն', p_geom_x: 'Պյութագորասի թեորեմը՝ ապացույցներ, տեսանյութ, թեստ, AI օգնական։',
      let_t: 'Գաղտնի նամակ', let_x: 'Գրիր ինչ ուզում ես՝ գաղտնի։ Քո անունը ոչ ոք չի տեսնի, մենք այն չենք հավաքում։',
      let_ph: 'Գրիր քո նամակը այստեղ…', let_send: 'Ուղարկել գաղտնի',
      let_priv: 'Նամակը ուղարկվում է առանց անվան, էլ. փոստի կամ որևէ այլ տվյալի։ Այն տեսնում է միայն ադմինը։',
      let_ok: 'Նամակը ուղարկվեց։ Շնորհակալություն։', let_err: 'Չհաջողվեց ուղարկել։ Փորձիր ավելի ուշ։', let_cfg: 'Նամակների ծառայությունը դեռ միացված չէ։',
      foot: 'Եղվարդի N 2 հիմնական դպրոց · Անձնական էջ · Գևորգ'
    },
    ru: {
      brand: 'Школа № 2 г. Егвард', n_home: 'Главная', pride_t: 'Наша гордость', pride_x: 'Лучшие ученики нашей школы и люди, которыми гордится школа.', pride_empty: 'Скоро здесь появятся лучшие ученики нашей школы.', pride_err: 'Не удалось загрузить.',  n_about: 'О школе', n_where: 'Где мы', n_proj: 'Проекты', n_letter: 'Тайное письмо',
      kicker: 'Личная страница · Геворг',
      title: 'Основная школа № 2 им. Гамлета Тадевосяна, г. Егвард',
      lead: 'Добро пожаловать! Это страница нашей школы, а ниже — мои учебные проекты: география, биология и геометрия.',
      cta1: 'Смотреть проекты', cta2: 'Написать тайное письмо',
      about_t: 'Наша школа',
      about_x: 'Основная школа № 2 г. Егвард — государственная некоммерческая организация (ГНКО) в городе Егвард Котайкской области. Школа основана в 1962 году, занятия идут в одну смену, пять дней в неделю. В ней есть компьютерные и мастерские, лаборатории, библиотеки и спортивные залы.',
      f_year: 'год основания', f_pupils: 'учеников', f_teachers: 'педагогов', f_rooms: 'классов', f_labs: 'лаборатории', f_gyms: 'спортзала',
      src_note: 'Источник данных: список образовательных учреждений аппарата губернатора Котайка (kotayk.mtad.am). Цифры могут меняться.',
      where_t: 'Где находится',
      l_addr: 'Адрес', v_addr: 'г. Егвард, ул. Сафаряна 88, Котайкская область, Армения',
      l_phone: 'Телефон', l_mail: 'Эл. почта', l_dir: 'Директор', v_dir: 'Гаяне Эраносян',
      l_type: 'Тип', v_type: 'Основная школа (ГНКО)',
      map_btn: 'Открыть на карте',
      town_t: 'О городе Егвард',
      town_x: 'Егвард — город в Котайкской области к северо-востоку от Еревана. По переписи 2022 года в нём живёт около 12 тысяч человек. В городе три общеобразовательные школы.',
      proj_t: 'Наши проекты', proj_x: 'Три учебных сайта на трёх языках. Выбери тему.',
      p_geo: 'География', p_geo_x: 'Великобритания, Ла-Манш, Евротоннель и Биг-Бен на 3D-карте.',
      p_bio: 'Биология', p_bio_x: 'Сердце и кровеносная система: 3D-модель и тест.',
      p_geom: 'Геометрия', p_geom_x: 'Теорема Пифагора: доказательства, видео, тест, AI-помощник.',
      let_t: 'Тайное письмо', let_x: 'Напиши всё, что хочешь, тайно. Твоё имя никто не увидит — мы его не собираем.',
      let_ph: 'Напиши своё письмо здесь…', let_send: 'Отправить тайно',
      let_priv: 'Письмо отправляется без имени, почты и любых других данных. Его видит только администратор.',
      let_ok: 'Письмо отправлено. Спасибо.', let_err: 'Не удалось отправить. Попробуй позже.', let_cfg: 'Сервис писем пока не подключён.',
      foot: 'Основная школа № 2 г. Егвард · Личная страница · Геворг'
    },
    en: {
      brand: 'Yeghvard School No. 2', n_home: 'Home', pride_t: 'Our pride', pride_x: 'The best pupils of our school and the people the school is proud of.', pride_empty: 'Our best pupils will appear here soon.', pride_err: 'Could not load.',  n_about: 'About', n_where: 'Where we are', n_proj: 'Projects', n_letter: 'Secret letter',
      kicker: 'Personal page · Gevorg',
      title: 'Yeghvard Basic School No. 2 named after Hamlet Tadevosyan',
      lead: 'Welcome! This is our school’s page, and below you will find my study projects: geography, biology and geometry.',
      cta1: 'See the projects', cta2: 'Write a secret letter',
      about_t: 'Our school',
      about_x: 'Yeghvard Basic School No. 2 is a state non-commercial organisation in the town of Yeghvard, Kotayk Province. The school was founded in 1962 and works in a single shift, five days a week. It has computer and workshop rooms, laboratories, libraries and gyms.',
      f_year: 'founded', f_pupils: 'pupils', f_teachers: 'teachers', f_rooms: 'classrooms', f_labs: 'laboratories', f_gyms: 'gyms',
      src_note: 'Source: list of educational institutions of the Kotayk Governor’s office (kotayk.mtad.am). Figures may change.',
      where_t: 'Where it is',
      l_addr: 'Address', v_addr: '88 Safaryan St, Yeghvard, Kotayk Province, Armenia',
      l_phone: 'Phone', l_mail: 'E-mail', l_dir: 'Director', v_dir: 'Gayane Yeranosyan',
      l_type: 'Type', v_type: 'Basic school (state non-commercial)',
      map_btn: 'Open on the map',
      town_t: 'About Yeghvard',
      town_x: 'Yeghvard is a town in Kotayk Province, north-east of Yerevan. At the 2022 census it had about 12,000 inhabitants. The town has three public schools.',
      proj_t: 'Our projects', proj_x: 'Three study websites in three languages. Pick a subject.',
      p_geo: 'Geography', p_geo_x: 'Great Britain, the English Channel, the Channel Tunnel and Big Ben on a 3D map.',
      p_bio: 'Biology', p_bio_x: 'The heart and blood system: a 3D model and a quiz.',
      p_geom: 'Geometry', p_geom_x: 'The Pythagorean theorem: proofs, video, test, AI helper.',
      let_t: 'Secret letter', let_x: 'Write anything you want, secretly. Nobody will see your name: we do not collect it.',
      let_ph: 'Write your letter here…', let_send: 'Send secretly',
      let_priv: 'The letter is sent without a name, e-mail or any other data. Only the administrator can read it.',
      let_ok: 'Letter sent. Thank you.', let_err: 'Could not send. Please try later.', let_cfg: 'The letter service is not connected yet.',
      foot: 'Yeghvard Basic School No. 2 · Personal page · Gevorg'
    }
  };
  var $ = function (s) { return document.querySelector(s); };
  var lang = 'hy';
  try { var sv = localStorage.getItem('school_lang'); if (D[sv]) lang = sv; } catch (e) {}
  var T = function (k) { return D[lang][k]; };
  var PAGES = [['about', 'n_about'], ['where', 'n_where'], ['projects', 'n_proj'], ['letter', 'n_letter']];
  var cur = document.body.getAttribute('data-page') || 'home';
  var hd = document.getElementById('siteHeader');
  if (hd) hd.outerHTML = '<header class="top"><a class="brand" href="index.html"><svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path d="M16 4l12 7v2H4v-2zM7 15h4v10H7zm7 0h4v10h-4zm7 0h4v10h-4z" fill="#2e7d5b"/></svg><b data-i18n="brand"></b></a><nav class="nav">' +
    PAGES.map(function (p) { return '<a href="' + p[0] + '.html" data-i18n="' + p[1] + '"' + (p[0] === cur ? ' aria-current="page"' : '') + '></a>'; }).join('') +
    '</nav><div class="lang" id="lang"><button data-lang="hy" aria-pressed="true">HY</button><button data-lang="ru" aria-pressed="false">RU</button><button data-lang="en" aria-pressed="false">EN</button></div></header>';
  /* two quick clicks on the school name open the admin panel; one click goes home */
  (function () {
    var br = document.querySelector('.brand'), t = 0;
    function dbl() { location.href = 'admin.html'; }
    if (br) br.addEventListener('click', function (e) {
      e.preventDefault();
      if (t) { clearTimeout(t); t = 0; dbl(); return; }
      t = setTimeout(function () { t = 0; location.href = 'index.html'; }, 330);
    });
    var h1 = document.querySelector('h1[data-i18n=title]');
    if (h1) h1.addEventListener('dblclick', dbl);
  })();
  var ft = document.getElementById('siteFooter');
  if (ft) ft.outerHTML = '<footer class="foot"><div class="wrap"><b data-i18n="brand"></b> · <span data-i18n="foot"></span></div></footer>';

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = T(el.getAttribute('data-i18n-ph')); });
    document.querySelectorAll('#lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    document.dispatchEvent(new CustomEvent('schoollang'));
    var hit = PAGES.filter(function (p) { return p[0] === cur; })[0];
    document.title = hit ? T(hit[1]) + ' · ' + T('brand') : T('title');
    document.querySelectorAll('.slides img').forEach(function (im) { im.alt = T('title'); });
  }
  document.querySelectorAll('#lang button').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.dataset.lang; try { localStorage.setItem('school_lang', lang); } catch (e) {} apply(); });
  });
  apply();

  /* ---- photo slider ---- */
  (function () {
    var box = document.getElementById('slider'); if (!box) return;
    var imgs = box.querySelectorAll('.slides img'), dots = box.querySelector('.dots'), i = 0, timer = 0;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    imgs.forEach(function (_, k) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', (k + 1) + ' / ' + imgs.length); b.addEventListener('click', function () { go(k); restart(); }); dots.appendChild(b); });
    function go(n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      dots.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(i + 1); }, 4500); }
    box.querySelector('.prev').addEventListener('click', function () { go(i - 1); restart(); });
    box.querySelector('.next').addEventListener('click', function () { go(i + 1); restart(); });
    box.addEventListener('mouseenter', function () { clearInterval(timer); });
    box.addEventListener('mouseleave', restart);
    go(0); restart();
  })();

  /* ---- students we are proud of ---- */
  (function () {
    var box = document.getElementById('studentsList'); if (!box) return;
    var c = window.SCHOOL_CFG || {}, rows = null, failed = false;
    function render() {
      box.innerHTML = '';
      if (failed) { box.innerHTML = '<p class="note"></p>'; box.firstChild.textContent = T('pride_err'); return; }
      if (rows === null) return;
      if (!rows.length) { box.innerHTML = '<p class="note"></p>'; box.firstChild.textContent = T('pride_empty'); return; }
      rows.forEach(function (r) {
        var f = document.createElement('figure'); f.className = 'stu';
        var im = document.createElement('img'); im.src = r.photo; im.alt = ''; im.loading = 'lazy';
        var cp = document.createElement('figcaption'); cp.textContent = r.descr;
        f.appendChild(im); f.appendChild(cp); box.appendChild(f);
      });
    }
    document.addEventListener('schoollang', render);
    if (!c.supabaseUrl) { rows = []; render(); return; }
    fetch(c.supabaseUrl + '/rest/v1/rpc/list_students', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.anonKey }, body: '{}', credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); })
      .then(function (d) { rows = d; render(); })
      .catch(function () { failed = true; render(); });
  })();

  /* ---- anonymous letters ---- */
  var cfg = window.SCHOOL_CFG || {};
  var form = $('#letterForm'), txt = $('#letterText'), res = $('#letterRes'), btn = $('#letterBtn');
  if (form) txt.addEventListener('input', function () { $('#letterCount').textContent = txt.value.length + ' / 2000'; });
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var body = txt.value.trim();
    if (!body) return;
    if (!cfg.supabaseUrl || !cfg.anonKey) { res.className = 'result warn'; res.textContent = T('let_cfg'); return; }
    btn.disabled = true; res.className = 'result'; res.textContent = '…';
    fetch(cfg.supabaseUrl + '/rest/v1/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.anonKey, Prefer: 'return=minimal' },
      body: JSON.stringify({ body: body }),
      referrerPolicy: 'no-referrer', credentials: 'omit'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      txt.value = ''; $('#letterCount').textContent = '0 / 2000';
      res.className = 'result ok'; res.textContent = T('let_ok');
    }).catch(function () { res.className = 'result warn'; res.textContent = T('let_err'); })
      .then(function () { btn.disabled = false; });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1 });
    document.querySelectorAll('.facts li, .proj, .card, .info div, .stu-grid, .sec .sub').forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  }
})();
