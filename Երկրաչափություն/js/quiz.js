/* Test: 15 questions, 10 minutes. When time is up the test closes. */
(function () {
  'use strict';
  var box = document.getElementById('quizBox');
  if (!box) return;
  var LIMIT = 10 * 60 * 1000;
  var lang = function () { return window.PY_LANG || 'hy'; };
  var T = function (k) { return window.GEO[lang()][k]; };
  var state = 'idle';           // idle | running | done
  var qi = 0, score = 0, answered = false, picked = -1, deadline = 0, timer = 0, timedOut = false;

  function mmss(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60);
    return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }
  function tick() {
    var left = deadline - Date.now(), el = document.getElementById('qTime');
    if (left <= 0) { timedOut = true; finish(); return; }
    if (el) { el.textContent = mmss(left); el.classList.toggle('low', left < 60000); }
  }
  function start() {
    qi = 0; score = 0; answered = false; picked = -1; timedOut = false; state = "running";
    deadline = Date.now() + LIMIT;
    clearInterval(timer); timer = setInterval(tick, 250);
    render();
  }
  function finish() {
    clearInterval(timer); state = 'done'; render();
  }

  function render() {
    var Q = T('quiz');
    if (state === 'idle') {
      box.innerHTML = '<div class="q-final"><p>' + T('qz_rules') + '</p><button class="btn btn-solid" id="qStart">' + T('qz_start') + '</button></div>';
      document.getElementById('qStart').addEventListener('click', start);
      return;
    }
    if (state === 'done') {
      box.innerHTML = '<div class="q-final">' + (timedOut ? '<p class="q-closed">' + T('qz_timeup') + '</p>' : '') +
        '<p class="lab">' + T('qz_solved') + '</p><div class="score">' + score + ' / ' + Q.length + '</div>' +
        '<button class="btn btn-solid" id="qAgain">' + T('qz_again') + '</button></div>';
      document.getElementById('qAgain').addEventListener('click', start);
      return;
    }
    var q = Q[qi];
    box.innerHTML = '<div class="q-top"><span>' + T('qz_of') + ' ' + (qi + 1) + ' / ' + Q.length + '</span>' +
      '<span class="q-clock">' + T('qz_left') + ': <b id="qTime">' + mmss(deadline - Date.now()) + '</b></span></div>' +
      '<div class="q-bar"><i style="width:' + (qi / Q.length * 100) + '%"></i></div>' +
      '<p class="q-text">' + q.q + '</p><div class="q-opts">' +
      q.o.map(function (o, i) { return '<button data-i="' + i + '">' + o + '</button>'; }).join('') +
      '</div><div class="q-actions"></div>';
    var btns = box.querySelectorAll('.q-opts button');
    function mark() {
      btns.forEach(function (b, j) {
        b.disabled = true;
        if (j === q.a) b.classList.add('good'); else if (j === picked) b.classList.add('bad');
      });
      var nx = document.createElement('button');
      nx.className = 'btn btn-solid';
      nx.textContent = qi === Q.length - 1 ? T('qz_finish') : T('qz_next');
      nx.addEventListener('click', function () { if (qi === Q.length - 1) finish(); else { qi++; answered = false; picked = -1; render(); } });
      box.querySelector('.q-actions').appendChild(nx);
    }
    if (answered) mark();
    btns.forEach(function (bt) {
      bt.addEventListener('click', function () {
        if (answered || state !== 'running' || Date.now() >= deadline) return;
        answered = true; picked = +bt.dataset.i;
        if (picked === q.a) score++;
        mark();
      });
    });
  }

  document.addEventListener('langchange', render);
  render();
})();
