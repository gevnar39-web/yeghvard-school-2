// Generates narration clips for js/story.js captions with Gemini TTS -> audio/<lang>/NN.mp3 (needs ffmpeg). Key from env GKEY.
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const root = 'C:/Users/gevni/OneDrive/Desktop/naxagtayin/';
const src = fs.readFileSync(root + 'js/story.js', 'utf8');
const a = src.indexOf('const CAP = ['), b = src.indexOf('\n  ];', a);
const CAP = vm.runInNewContext('const L=(en,ru,hy)=>({en,ru,hy});' + src.slice(a, b + 5) + ';CAP');
const MODEL = process.env.MODEL || 'gemini-3.1-flash-tts-preview', VOICE = 'Achird';
const STYLE = process.env.NOSTYLE ? '' : 'Read the following aloud in a warm, friendly storyteller voice for school children, at a calm pace: ';
const jobs = [];
for (const lang of (process.env.LANGS || 'hy,ru,en').split(',')) CAP.forEach((c, i) => jobs.push({ lang, i, text: c[lang].replace(/055B/g, '') }));

async function tts(text) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 120000);
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GKEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: STYLE + text }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }),
      });
      clearTimeout(to);
      const j = await r.json();
      const p = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts.find(x => x.inlineData);
      if (r.ok && p) return Buffer.from(p.inlineData.data, 'base64');
      console.log('retry', attempt, r.status, JSON.stringify(j).slice(0, 160));
    } catch (e) { console.log('retry', attempt, String(e)); }
    await new Promise(r => setTimeout(r, 2500 * attempt));
  }
  throw new Error('failed');
}

let next = 0, done = 0, failed = [];
async function worker() {
  while (next < jobs.length) {
    const j = jobs[next++];
    const dir = root + 'audio/' + j.lang; fs.mkdirSync(dir, { recursive: true });
    const nn = String(j.i + 1).padStart(2, '0'), mp3 = `${dir}/${nn}.mp3`;
    if (fs.existsSync(mp3)) { done++; continue; }
    try {
      const pcm = await tts(j.text);
      const tmp = `${dir}/${nn}.pcm`; fs.writeFileSync(tmp, pcm);
      const inArgs = pcm.slice(0, 4).toString() === 'RIFF' ? ['-i', tmp] : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tmp];
      cp.execFileSync('ffmpeg', ['-y', '-loglevel', 'error'].concat(inArgs, [
        '-af', 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse',
        '-codec:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', mp3]));
      fs.unlinkSync(tmp);
      done++; console.log('ok', j.lang, nn, `(${done}/${jobs.length})`);
    } catch (e) { failed.push(j.lang + nn); console.log('FAILED', j.lang, nn); }
  }
}
Promise.all([worker()]).then(() => console.log('finished; failed:', failed.join(',') || 'none'));
