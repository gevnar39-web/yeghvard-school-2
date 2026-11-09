# Նախագծային աշխատանք — արյունատար համակարգ

Ուսումնական կայք Եղվարդի թիվ 2 դպրոցի աշակերտների համար (հեղինակ՝ Գևորգ).
3D մարմին և սիրտ, ԷԿԳ, արյան խմբեր և փոխներարկում, խոլեստերին, վիտամիններ, ճնշում, մակարդում, առողջ սիրտ, թեստ, տեսանյութեր։ Երեք լեզու՝ հայերեն, ռուսերեն, անգլերեն։

Educational website about the human circulatory system (Armenian / Russian / English). Plain HTML, CSS and JavaScript — no build step, no database.

## Run locally
Open `index.html` in a browser (internet is needed for Three.js and fonts).

## Structure
- `index.html`, `blood.html`, `ecg.html`, … — the pages
- `js/` — scripts (`data.js` and `data-extra.js` hold all texts), `css/style.css`
- `audio/hy/` — Armenian narration for the animation, `video/` — videos
- `js/config.js` — settings for the helper on the home page; an optional Gemini key goes into `js/config.local.js` (git-ignored, so it is never uploaded). The helper works without a key.

Educational content only, not medical advice.
