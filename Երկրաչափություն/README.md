# Երկրաչափություն — Պյութագորասի թեորեմը

Ուսումնական կայք՝ երեք լեզվով (HY / RU / EN)։

## Run
Open `index.html` in a browser (internet is needed for fonts and the AI helper).

## Pages
- `index.html` — home: animated hero + AI helper (only about the theorem and Pythagoras, never solves homework)
- `theorem.html`, `proofs.html`, `converse.html`, `triples.html`, `uses.html` — lessons (opened from the top menu)
- `pythagoras.html` — biography (Կենսագրություն)
- `quiz.html` — test: 15 questions, 10 minutes; when time is up the test closes and the score is shown

## Code
- `js/data.js` — all texts (3 languages) and the 15 quiz questions
- `js/layout.js` — shared header/footer; `js/app.js` — lesson widgets; `js/quiz.js` — timed test
- `js/hero.js` — hero animations; `js/chat.js` + `js/config.js` — Gemini helper and key

If the site is published, restrict the Gemini key to your site address in Google AI Studio (the key is readable in `js/config.js`).
