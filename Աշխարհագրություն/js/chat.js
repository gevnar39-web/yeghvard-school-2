/* Gemini helper with voice input (microphone) and spoken answers. */
(function () {
  'use strict';
  const log = document.getElementById('chatLog');
  if (!log) return;
  const $ = id => document.getElementById(id);
  const chips = $('chatChips'), form = $('chatForm'), input = $('chatInput'), mic = $('chatMic'), sendBtn = form.querySelector('button[type=submit]');
  const LN = { hy: 'Armenian', ru: 'Russian', en: 'English' };
  const TAG = { hy: 'hy-AM', ru: 'ru-RU', en: 'en-US' };
  const GEM = 'https://generativelanguage.googleapis.com/v1beta/models/';
  const cfg = () => window.GEO_CONFIG || {};
  const getKey = () => String(cfg().geminiKey || '').trim();      // the key lives in js/config.js
  const models = () => [cfg().model || 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'].filter((m, i, a) => a.indexOf(m) === i);
  let history = [], busy = false, userMsgs = 0, listening = false, stopListen = null, curAudio = null, speakToken = 0;

  /* ---------- built-in answers (work without a key) ---------- */
  const tm = () => window.GeoTime ? window.GeoTime.london() : '';
  const FAQ = [
    { live: true, re: /(который|сколько).{0,12}(час|времени)|час(ы|ов)?.{0,10}(лондон|биг)|what time|time (is it|in|at)|london.{0,6}time|ժամը քանի|ո[՞]?ր ժամ|ժամ.{0,12}(լոնդոն|բիգ)|(լոնդոն|բիգ).{0,12}ժամ/,
      a: () => [`Լոնդոնում հիմա ${tm()} է։ Այս նույն ժամը ցույց է տալիս Բիգ Բենի 3D ժամացույցը։`, `В Лондоне сейчас ${tm()}. Ровно это время показывают 3D-часы Биг-Бена на карте.`, `In London it is ${tm()} right now. The 3D Big Ben clock on the map shows exactly this time.`] },
    { re: /перес|cross|how.{0,10}get|անցն|անցնել/,
      a: () => ['Լա Մանշն անցնում են լաստանավով Դովերից Կալե (մոտ 1,5 ժամ), Եվրոստար գնացքով կամ Լե Շաթլով՝ Եվրոթունելի միջով (մոտ 35 րոպե)։ Առաջին լողորդը Մեթյու Ուեբն էր՝ 1875 թվականին։', 'Ла-Манш пересекают на пароме из Дувра в Кале (около 1,5 часа), на поезде «Евростар» или «Ле-Шаттле» через Евротоннель (около 35 минут). Первым его переплыл Мэтью Уэбб в 1875 году.', 'You can cross the Channel by ferry from Dover to Calais (about 1.5 hours), by Eurostar, or by Le Shuttle through the Channel Tunnel (about 35 minutes). Matthew Webb was the first to swim it, in 1875.'] },
    { re: /тоннел|туннел|евротонн|tunnel|eurotunnel|թունել/,
      a: () => ['Եվրոթունելը 50,45 կմ երկարությամբ երկաթուղային թունել է Լա Մանշի տակ (ծովի տակ՝ ≈ 37,9 կմ)։ Այն բացվել է 1994 թվականի մայիսի 6-ին և կապում է Ֆոլքսթոունը (Անգլիա) Կոկելի հետ՝ Կալեի մոտ (Ֆրանսիա)։ Կազմված է երեք թունելից՝ երկու երկաթուղային և մեկ սպասարկման։', 'Евротоннель — железнодорожный тоннель под Ла-Маншем длиной 50,45 км (под морем ≈ 37,9 км). Открыт 6 мая 1994 года, соединяет Фолкстон (Англия) и Кокель у Кале (Франция). Состоит из трёх тоннелей: двух железнодорожных и одного служебного.', 'The Channel Tunnel is a 50.45 km railway tunnel under the Channel (≈ 37.9 km of it under the sea). It opened on 6 May 1994 and links Folkestone (England) with Coquelles near Calais (France). It has three tunnels: two rail tunnels and one service tunnel.'] },
    { re: /биг.?бен|big.?ben|elizabeth|башн|tower|բիգ.?բեն|աշտարակ/,
      a: () => ['Բիգ Բենը Վեսթմինսթերյան պալատի Էլիզաբեթ աշտարակի մեծ զանգն է Լոնդոնում։ Աշտարակը մոտ 96 մ բարձր է, ժամացույցը գործում է 1859 թվականից։ Հենց հիմա Լոնդոնում ' + tm() + ' է։', 'Биг-Бен — большой колокол башни Елизаветы у Вестминстерского дворца в Лондоне. Башня высотой около 96 м, часы идут с 1859 года. Сейчас в Лондоне ' + tm() + '.', 'Big Ben is the great bell of the Elizabeth Tower at the Palace of Westminster in London. The tower is about 96 m tall and the clock has run since 1859. It is ' + tm() + ' in London now.'] },
    { re: /ла.?манш|manche|channel|մանշ/,
      a: () => ['Լա Մանշը Ատլանտյան օվկիանոսի նեղ ծովածոց է Մեծ Բրիտանիայի և Ֆրանսիայի միջև։ Երկարությունը մոտ 560 կմ է, ամենանեղ տեղում (Դովերի նեղուց)՝ մոտ 33 կմ։ Ֆրանսերեն La Manche նշանակում է «թև»։', 'Ла-Манш — узкий пролив Атлантического океана между Великобританией и Францией. Длина около 560 км, в самом узком месте (Дуврский пролив) — около 33 км. По-французски La Manche означает «рукав».', 'The English Channel (La Manche) is a narrow arm of the Atlantic between Great Britain and France. It is about 560 km long and about 33 km wide at the narrowest point, the Strait of Dover. In French, La Manche means “the sleeve”.'] },
    { re: /британи|англи|шотланд|уэльс|britain|england|scotland|wales|բրիտանի|անգլի|շոտլանդ|ուելս/,
      a: () => ['Մեծ Բրիտանիան Եվրոպայի ամենամեծ կղզին է (≈ 209 000 կմ²)։ Նրա վրա են Անգլիան, Շոտլանդիան և Ուելսը։ Մայրաքաղաքը Լոնդոնն է, ամենաբարձր գագաթը՝ Բեն Նևիսը (1345 մ)։', 'Великобритания — крупнейший остров Европы (≈ 209 000 км²). На нём находятся Англия, Шотландия и Уэльс. Столица — Лондон, высшая точка — Бен-Невис (1345 м).', 'Great Britain is the largest island in Europe (≈ 209,000 km²). England, Scotland and Wales lie on it. The capital is London and the highest peak is Ben Nevis (1,345 m).'] }
  ];
  function local(raw) {
    const q = raw.toLowerCase().replace(/ё/g, 'е');
    for (const f of FAQ) if (f.re.test(q)) return { text: pick(f.a()), live: !!f.live };
    return null;
  }

  /* ---------- Gemini text ---------- */
  const textOf = j => { const p = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts; return (p || []).filter(x => !x.thought).map(x => x.text || '').join('').trim(); };
  async function gemini(body, modelList) {
    const key = getKey(); if (!key) throw new Error('nokey');
    let last = null;
    for (const model of modelList || models()) {
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 30000);
      try {
        const r = await fetch(GEM + encodeURIComponent(model) + ':generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, signal: ctl.signal, body: JSON.stringify(body) });
        if (r.ok) return await r.json();
        const txt = await r.text(); last = new Error(String(r.status));
        if (r.status === 403 || r.status === 401 || /API key not valid|API_KEY_INVALID/i.test(txt)) { last.bad = true; throw last; }
        if (r.status === 429) { last.quota = true; }
      } catch (e) { if (e.bad) throw e; last = last || e; } finally { clearTimeout(to); }
    }
    throw last || new Error('fail');
  }
  async function remote(q) {
    const sys = `You are a concise helper inside a school educational website (project by a pupil of Yeghvard school No. 2, Armenia) about the geography of Great Britain, the English Channel (La Manche), the Channel Tunnel (Eurotunnel), Big Ben / Elizabeth Tower and London, plus the time in London. Answer in ${LN[GEO.lang]}, in at most 4 short sentences, in simple words. The current time in London is ${tm()}. If the question is clearly outside geography and these topics, politely say you only discuss these topics. Do not use markdown.`;
    const contents = history.slice(-6).concat([{ role: 'user', content: q }]).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const j = await gemini({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { maxOutputTokens: 500, temperature: 0.4 } });
    const txt = textOf(j); if (!txt) throw new Error('empty');
    return txt.replace(/\*\*/g, '').trim();
  }

  /* ---------- voice in: microphone -> text ---------- */
  function toWav(int16, rate) {
    const n = int16.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    new Int16Array(buf, 44, n).set(int16);
    return new Blob([buf], { type: 'audio/wav' });
  }
  const b64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
  async function transcribe(blob) {
    const j = await gemini({ contents: [{ parts: [{ inlineData: { mimeType: 'audio/wav', data: await b64(blob) } }, { text: 'Transcribe this speech exactly in its original language and script (most likely ' + LN[GEO.lang] + '). Output only the transcript, nothing else. If there is no speech, output nothing.' }] }] });
    return textOf(j);
  }
  async function recordWav() {   // stops itself after ~1.4 s of silence
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
    const src = ac.createMediaStreamSource(stream), proc = ac.createScriptProcessor(4096, 1, 1);
    const chunks = []; let spoke = false, lastLoud = performance.now(); const t0 = performance.now(); let done;
    const finished = new Promise(res => { done = res; });
    proc.onaudioprocess = e => {
      const d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d));
      let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
      const now = performance.now();
      if (Math.sqrt(s / d.length) > 0.02) { spoke = true; lastLoud = now; }
      if ((spoke && now - lastLoud > 1400) || now - t0 > 20000) done();
    };
    src.connect(proc); proc.connect(ac.destination);
    stopListen = () => done();
    await finished;
    stopListen = null; proc.disconnect(); src.disconnect(); stream.getTracks().forEach(tr => tr.stop());
    const rate = ac.sampleRate; ac.close();
    let len = 0; chunks.forEach(c => { len += c.length; });
    const all = new Float32Array(len); let o = 0; chunks.forEach(c => { all.set(c, o); o += c.length; });
    const ratio = rate / 16000, n = Math.floor(len / ratio), pcm = new Int16Array(n);
    for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, all[Math.floor(i * ratio)])); pcm[i] = x < 0 ? x * 0x8000 : x * 0x7fff; }
    return { wav: toWav(pcm, 16000), spoke };
  }
  function setListening(on) {
    listening = on; mic.classList.toggle('rec', on); mic.setAttribute('aria-pressed', String(on));
    input.placeholder = on ? t('ai_listening') : t('ai_ph');
  }
  function listenNative() {      // the browser's own recognition when there is no key
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return false;
    const rec = new SR(); rec.lang = TAG[GEO.lang]; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = e => { setListening(false); ask(e.results[0][0].transcript, true); };
    rec.onerror = () => { setListening(false); addMsg('bot', t('ai_nomic')); };
    rec.onend = () => setListening(false);
    stopListen = () => rec.stop(); setListening(true);
    try { rec.start(); } catch (e) { setListening(false); return false; }
    return true;
  }
  async function onMic() {
    if (listening) { if (stopListen) stopListen(); return; }
    if (busy) return;
    stopSpeak();
    if (getKey() && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setListening(true);
        const rec = await recordWav();
        setListening(false);
        if (!rec.spoke) { addMsg('bot', t('ai_nospeech')); return; }
        input.placeholder = t('ai_thinking');
        const text = await transcribe(rec.wav);
        input.placeholder = t('ai_ph');
        if (!text) { addMsg('bot', t('ai_nospeech')); return; }
        ask(text, true); return;
      } catch (e) {
        setListening(false); input.placeholder = t('ai_ph');
        if (e && (e.name === 'NotAllowedError' || e.name === 'NotFoundError')) { addMsg('bot', t('ai_nomic')); return; }
        if (e && e.bad) { addMsg('bot', t('ai_badkey')); return; }
      }
    }
    if (!listenNative()) addMsg('bot', t('ai_nomic'));
  }

  /* ---------- voice out: text -> speech ---------- */
  const hasVoice = () => 'speechSynthesis' in window && speechSynthesis.getVoices().some(v => v.lang.toLowerCase().indexOf(GEO.lang) === 0);
  function stopSpeak() {
    speakToken++; if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (curAudio) { curAudio.pause(); curAudio = null; }
    document.querySelectorAll('.msg-listen.on').forEach(b => b.classList.remove('on'));
  }
  async function geminiSpeech(text) {
    for (const model of ['gemini-2.5-flash-preview-tts', 'gemini-3.8-flash-tts']) {
      try {
        const j = await gemini({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Achird' } } } } }, [model]);
        const p = j.candidates && j.candidates[0] && j.candidates[0].content.parts.find(x => x.inlineData);
        if (!p) continue;
        const bin = atob(p.inlineData.data), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        if (/wav/i.test(p.inlineData.mimeType)) return new Blob([bytes], { type: 'audio/wav' });
        const rate = +((/rate=(\d+)/.exec(p.inlineData.mimeType) || [])[1]) || 24000;
        return toWav(new Int16Array(bytes.buffer, 0, bytes.length >> 1), rate);
      } catch (e) { if (e && e.bad) throw e; }
    }
    throw new Error('tts');
  }
  async function speak(text, btn) {
    stopSpeak(); const my = speakToken;
    if (btn) btn.classList.add('on');
    const end = () => { if (btn && my === speakToken) btn.classList.remove('on'); };
    const clean = text.replace(/\s*→/g, '').replace(/\n+/g, '. ');
    if (hasVoice()) {
      const u = new SpeechSynthesisUtterance(clean); u.lang = TAG[GEO.lang];
      const v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().indexOf(GEO.lang) === 0); if (v) u.voice = v;
      u.onend = end; u.onerror = end; speechSynthesis.speak(u); return;
    }
    if (!getKey()) { end(); addMsg('bot', t('ai_novoice')); return; }
    try {
      const wav = await geminiSpeech(clean.slice(0, 700));
      if (my !== speakToken) return;
      const a = new Audio(URL.createObjectURL(wav)); curAudio = a; a.onended = end; a.onerror = end; await a.play();
    } catch (e) { end(); addMsg('bot', t('ai_novoice')); }
  }

  /* ---------- chat UI ---------- */
  function addMsg(kind, text) {
    const d = document.createElement('div'); d.className = 'msg ' + kind;
    const p = document.createElement('div'); p.className = 'bubble'; p.textContent = text; d.appendChild(p);
    if (kind === 'bot') {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'msg-listen'; b.textContent = '🔊'; b.title = b.ariaLabel = t('ai_listen');
      b.addEventListener('click', () => { if (b.classList.contains('on')) stopSpeak(); else speak(text, b); });
      d.appendChild(b);
    }
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    return d;
  }
  const say = (d, text, viaVoice) => { if (viaVoice) speak(text, d.querySelector('.msg-listen')); };

  async function ask(text, viaVoice) {
    text = text.trim(); if (!text || busy) return;
    busy = true; sendBtn.disabled = true; userMsgs++;
    addMsg('user', text); input.value = '';
    const loc = local(text);                 // exact built-in answer (the live London time) or an offline fallback
    const reply = (m, keep) => { say(addMsg('bot', m), m, viaVoice); if (keep) history.push({ role: 'user', content: text }, { role: 'assistant', content: m }); };
    if (loc && (loc.live || !getKey())) reply(loc.text, true);
    else if (!getKey()) reply(t('ai_nokey'));
    else {
      const w = addMsg('bot pending', t('ai_thinking'));
      try { const r = await remote(text); w.remove(); reply(r, true); }
      catch (e) { w.remove(); if (loc) reply(loc.text, true); else reply(t(e && e.bad ? 'ai_badkey' : 'ai_err')); }
    }
    busy = false; sendBtn.disabled = false; input.focus({ preventScroll: true });
  }
  function refresh() {
    chips.innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" class="qchip" data-q="${n}">${esc(t('ai_q' + n))}</button>`).join('');
    mic.title = mic.ariaLabel = t('ai_mic'); if (!listening) input.placeholder = t('ai_ph');
    if (!userMsgs) { log.innerHTML = ''; addMsg('bot', t('ai_hello')); }
  }
  chips.addEventListener('click', e => { const b = e.target.closest('.qchip'); if (b) ask(t('ai_q' + b.dataset.q)); });
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  mic.addEventListener('click', onMic);
  if ('speechSynthesis' in window) speechSynthesis.getVoices();     // start loading device voices
  GEO.onLang(refresh);
})();
