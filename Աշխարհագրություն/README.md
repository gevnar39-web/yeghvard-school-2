# Աշխարհագրություն

Ուսումնական կայք՝ Մեծ Բրիտանիա, Լա Մանշ, Եվրոթունել, Բիգ Բեն։ Եղվարդի թիվ 2 դպրոց, հեղինակ՝ Գևորգ։
Երեք լեզու՝ հայերեն, ռուսերեն, անգլերեն։

## Run
Open `index.html` in a browser (internet is needed for Three.js and fonts).

## Structure
- `index.html` — 3D Britain + Big Ben (live London time) + Gemini helper with voice
- `britain.html`, `manche.html`, `tunnel.html`, `quiz.html`, `video.html` — other pages (opened from the 3-line menu)
- `js/data.js` — all texts; `js/app.js` — menu, languages, quiz; `js/scene.js` — 3D; `js/chat.js` — Gemini helper
- `video/hy.mp4`, `video/ru.mp4`, `video/en.mp4` — put the videos here (the page shows "coming soon" until they exist)

## Gemini key
The key is in `js/config.js` (`geminiKey`). That file is public if the site is published, so restrict the key to your site address in Google AI Studio.
Get a new key at https://aistudio.google.com/apikey
