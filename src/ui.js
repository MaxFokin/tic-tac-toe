// ===== Look and words =====
const STICKERS = ['#1FAD5C', '#FFD43B', '#D7263D', '#FF8A1E', '#1F6FEB', '#F6F6F1'];
const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const $ = (sel) => document.querySelector(sel);
// Object.hasOwn and ?. need Safari 15.4 and 13.4; the app runs wherever Cube Coach runs.
const hasKey = (k) => Object.prototype.hasOwnProperty.call(STRINGS, k);
const appEl = $('#app'), panelEl = $('#panel'), restartBtn = $('#restart');

// ===== State =====
const app = { screen: 'welcome', setup: { mode: 'single', level: 'easy', mark: 'X', first: 'me' } };
const KEY = 'ttt-coach-v1';
const SETUP_KEY = 'ttt-coach-setup';
// The game in progress, saved on every change: a reload lands on the same board and turn.
// The rings are not saved: restore() draws the hint ring again from the line (advise is
// deterministic); the coach's last-move ring is lost.
function save() {
  const { screen, game, board, turn, starter, history, line, result } = app;
  try { localStorage.setItem(KEY, JSON.stringify({ screen, game, board, turn, starter, history, line, result })); } catch (e) { /* storage unavailable */ }
}
// Takes a saved game only when every part agrees: the history replays from the empty board to the
// board, the turn follows, the line is a known key and the result is what the board says.
// Anything else leaves the app on welcome.
function restore() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return; }
  if (!d || !['play', 'done'].includes(d.screen) || !d.game || !Array.isArray(d.history) || !Array.isArray(d.board)) return;
  if (Object.keys(SETUP_CHOICES).some((k) => !SETUP_CHOICES[k].includes(d.game[k])) || !['X', 'O'].includes(d.starter)) return;
  if (d.board.length !== 9 || !d.board.every((c) => ['', 'X', 'O'].includes(c))) return;
  let board = emptyBoard(), mark = d.starter;
  for (const m of d.history) {
    if (!m || m.mark !== mark || !Number.isInteger(m.square) || board[m.square] !== '' || winner(board)) return;
    board = play(board, m.square, mark);
    mark = other(mark);
  }
  if (board.join() !== d.board.join() || d.turn !== mark) return;
  const w = winner(board), over = !!w || isFull(board);
  const result = over ? { winner: w ? w.mark : null, line: w ? w.line : null } : null;
  if (over !== (d.screen === 'done') || JSON.stringify(d.result) !== JSON.stringify(result)) return;
  const line = d.line;
  if (!line || typeof line.key !== 'string' || !hasKey(line.key)) return;
  if (line.vars !== undefined && !['X', 'O'].includes(line.vars && line.vars.mark)) return; // the only vars a line has
  // A hint line names its square only with the ring. It stays in the box through the coach's wait,
  // when the ring is gone, so it is drawn again only on the turn it was asked for.
  const ringed = d.screen === 'play' && line.key.indexOf('hint') === 0 && (d.game.mode === 'two' || mark === d.game.mark);
  Object.assign(app, { screen: d.screen, game: d.game, board, turn: mark, starter: d.starter, history: d.history, line, result, hint: ringed ? advise(board, mark).square : null, last: null });
}

// The welcome screen's four choices, kept under their own key so Start over never touches them.
const SETUP_CHOICES = { mode: ['single', 'two'], level: ['easy', 'medium', 'hard'], mark: ['X', 'O'], first: ['me', 'coach', 'random'] };
function loadSetup() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SETUP_KEY)); } catch (e) { /* storage unavailable or not JSON */ }
  for (const k in SETUP_CHOICES) if (saved && SETUP_CHOICES[k].includes(saved[k])) app.setup[k] = saved[k];
}
function saveSetup() {
  try { localStorage.setItem(SETUP_KEY, JSON.stringify(app.setup)); } catch (e) { /* storage unavailable */ }
}

// ===== Language =====
// Kept under its own key, apart from the progress record, so Start over and restore() never touch it.
const LANG_KEY = 'ttt-coach-lang';
const make = (cls) => { const el = document.createElement('div'); el.className = cls; return el; };

// applyLang switches the words without saving, so an untouched app keeps following the phone;
// setLang (the switch) saves the choice.
function applyLang(code) {
  useLang(code);
  document.documentElement.lang = code;
  document.documentElement.dir = LANGS[code].dir;
}
function setLang(code) {
  applyLang(code);
  try { localStorage.setItem(LANG_KEY, code); } catch (e) { /* storage unavailable */ }
}
// The phone's language when it is one of ours, else English.
const phoneLang = () => (navigator.languages || [navigator.language]).map((l) => String(l).slice(0, 2).toLowerCase()).find((l) => Object.keys(LANGS).includes(l)) || 'en';
// The switch: one segmented control in the header's tools group, beside the theme toggle, built
// once from LANGS. CSS shows it on the welcome screen only. Each segment is the language's flag
// over its code; the full name is the label.
let langsEl = null;
function refreshLangs() {
  if (!langsEl) {
    langsEl = make('langs');
    langsEl.setAttribute('role', 'group');
    langsEl.innerHTML = Object.keys(LANGS).map((code) =>
      `<button class="lang" type="button" data-lang="${code}" lang="${code}" aria-label="${LANGS[code].name}"><i>${LANGS[code].flag}</i>${LANGS[code].code}</button>`).join('');
    langsEl.querySelectorAll('.lang').forEach((b) => b.addEventListener('click', () => { setLang(b.dataset.lang); disarm(); render(false); }));
    $('.tools').insertBefore(langsEl, themeBtn);
  }
  langsEl.setAttribute('aria-label', t('language'));
  langsEl.querySelectorAll('.lang').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}

// ===== Theme =====
// Light or dark on request; without a saved choice the app follows the phone. The same key is read
// by a one-line script in the head, so a saved choice is applied before the first paint.
const THEME_KEY = 'ttt-coach-theme';
const themeBtn = $('#theme');
function isDark() {
  const mode = document.documentElement.dataset.theme;
  return mode === 'dark' || (mode !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
}
function setTheme(mode) {
  document.documentElement.dataset.theme = mode;
  try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* storage unavailable */ }
}
// The icon shows the way out (a sun in the dark), the label says where it leads.
function paintTheme() {
  themeBtn.classList.toggle('dark', isDark());
  themeBtn.setAttribute('aria-label', t(isDark() ? 'lightMode' : 'darkMode'));
}

// Everything outside the panel that has words in the current language: the switch and the theme
// toggle. The credits line stays English.
function refreshChrome() {
  refreshLangs();
  paintTheme();
}

// ===== Screens =====
const btn = (id, label, cls = '') => `<button class="btn ${cls}" id="${id}" type="button">${label}</button>`;
const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

function go(screen) {
  app.screen = screen;
  save();
  render(true);
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}

function render(animate) {
  clearTimeout(coachTimer);
  appEl.dataset.screen = app.screen;
  delete appEl.dataset.mood; // the grey day is the loss screen's only
  refreshChrome();
  ({ welcome: screenWelcome, play: screenPlay, done: screenDone }[app.screen] || screenWelcome)(animate);
}

// The tile icons: the header's logo for Single player, a blue X beside an orange O for 2 players.
const LOGO = $('.brand svg').outerHTML;
const TWO_ICON = '<svg viewBox="0 0 100 60" aria-hidden="true"><path d="M12 12 40 48M40 12 12 48" stroke="#1F6FEB" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="74" cy="30" r="17" stroke="#FF8A1E" stroke-width="11" fill="none"/></svg>';
const AGES = { easy: 'age5', medium: 'age8', hard: 'age10' };

// Every choice is a button with one data-* attribute naming the setup key it sets.
function screenWelcome() {
  const s = app.setup;
  const press = (key, v) => `type="button" data-${key}="${v}" aria-pressed="${s[key] === v}"`;
  const mode = (v, ico) => `<button class="tile" id="mode-${v}" ${press('mode', v)}><span class="ico">${ico}</span><strong>${t(v)}</strong></button>`;
  const seg = (key, label, text) => `<div class="line"><span class="label">${t(label)}</span><div class="seg" role="group">${
    SETUP_CHOICES[key].map((v) => `<button class="${key}" ${press(key, v)}>${text(v)}</button>`).join('')}</div></div>`;
  const coachRows = `<div class="label">${t('coachLevel')}</div>
    <div class="choose n3">${SETUP_CHOICES.level.map((v) => `<button class="tile level" ${press('level', v)}><strong>${t(v)}</strong><small>${t(AGES[v])}</small></button>`).join('')}</div>
    ${seg('mark', 'youAre', (v) => v)}${seg('first', 'whoStarts', t)}`;
  const howto = `<ul class="howto">${['x', 'o', 'yellow'].map((c, i) => `<li><b style="--c:var(--${c})">${i + 1}</b><span>${t('howto' + (i + 1))}</span></li>`).join('')}</ul>`;
  panelEl.innerHTML = `<h1>${t('whoPlays')}</h1>
    <div class="choose">${mode('single', LOGO)}${mode('two', TWO_ICON)}</div>
    ${s.mode === 'single' ? coachRows : howto}
    <div class="actions">${btn('play', t('play'), 'primary small')}</div>`;
  panelEl.querySelectorAll('[aria-pressed]').forEach((b) => b.addEventListener('click', () => {
    const [key, v] = Object.entries(b.dataset)[0];
    app.setup[key] = v;
    saveSetup();
    render(false);
  }));
  on('play', startGame);
}

function startGame() {
  const s = app.setup;
  app.game = { ...s };
  app.board = emptyBoard();
  app.history = [];
  app.hint = null;
  app.last = null;
  app.result = null;
  app.starter = s.mode === 'two' ? 'X' : s.first === 'me' ? s.mark : s.first === 'coach' ? other(s.mark) : pick(['X', 'O']);
  app.turn = app.starter;
  const drawn = s.mode === 'single' && s.first === 'random';
  app.line = { key: drawn ? (app.starter === s.mark ? 'boxYouStart' : 'boxCoachStarts') : 'boxStuck' };
  go('play');
}

// ===== Play =====
const COACH_WAIT = 700; // ms the coach waits before its move, so the move is seen as a move
let coachTimer = null;
const coachMark = () => other(app.game.mark);
const isCoachTurn = () => app.game.mode === 'single' && app.turn === coachMark();

// Start over: the game goes, the setup stays.
function resetAll() {
  clearTimeout(coachTimer);
  for (const k of ['board', 'history', 'turn', 'starter', 'line', 'hint', 'last', 'result']) app[k] = null;
}

function tapCell(i) {
  if (app.screen !== 'play' || isCoachTurn() || app.board[i] !== '') return;
  placeMove(i, app.turn);
}

// The coach's square keeps the magenta ring until the child's next tap; any tap takes the hint away.
function placeMove(i, mark) {
  app.last = isCoachTurn() ? i : null;
  app.board = play(app.board, i, mark);
  app.history.push({ mark, square: i });
  app.hint = null;
  app.turn = other(mark); // even when the game ends: the turn always follows the moves, as restore() checks
  if (winner(app.board) || isFull(app.board)) return finish();
  if (app.game.mode === 'two') app.line = { key: 'boxStuck' };
  save();
  render(true); // screenPlay schedules the coach on its turn
}

// Runs from screenPlay on the coach's turn; render() clears the timer, so it never fires on a
// stale screen or after the game is over.
function scheduleCoach() {
  clearTimeout(coachTimer);
  coachTimer = setTimeout(() => {
    const { square, reason } = coachMove(app.board, coachMark(), app.game.level);
    sayReason('coach', reason);
    placeMove(square, coachMark());
  }, COACH_WAIT);
}

function askHelp() {
  const { square, reason } = advise(app.board, app.turn);
  app.hint = square;
  sayReason('hint', reason);
  save();
  render(false);
}

// The box's line is 'hint' or 'coach' and the reason: hintBlock, coachCenter… In 2 players a hint
// that names the other player takes its '2' form with that player's mark. A reason with no line
// (the coach's 'win' ends the game) keeps the box as it is.
function sayReason(prefix, reason) {
  const key = reason && prefix + reason[0].toUpperCase() + reason.slice(1);
  if (!key || !hasKey(key)) return;
  const two = app.game.mode === 'two' && hasKey(key + '2');
  app.line = two ? { key: key + '2', vars: { mark: other(app.turn) } } : { key };
}

function finish() {
  const w = winner(app.board);
  app.result = { winner: w ? w.mark : null, line: w ? w.line : null };
  if (w && (app.game.mode === 'two' || w.mark === app.game.mark)) confetti();
  go('done');
}

const MARK_SVG = {
  X: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M23 23 77 77M77 23 23 77"/></svg>',
  O: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="29"/></svg>',
};
const markHtml = (mark) => `<b class="${mark.toLowerCase()}">${mark}</b>`;

// `ring(i)` is the extra classes of square i; the square of the latest move pops when `animate`.
function boardHtml(ring, animate) {
  const lastMove = app.history.length ? app.history[app.history.length - 1].square : -1;
  return `<div class="board">${app.board.map((m, i) => {
    const cls = ['cell', m.toLowerCase(), ring(i), animate && i === lastMove ? 'pop' : ''].filter(Boolean).join(' ');
    const label = m ? t('cellMark', { n: i + 1, mark: m }) : t('cellEmpty', { n: i + 1 });
    return `<button class="${cls}" type="button" data-i="${i}" aria-label="${label}">${MARK_SVG[m] || ''}</button>`;
  }).join('')}</div>`;
}
const boxHtml = () => `<div class="box${/^(hint|coach)/.test(app.line.key) ? ' coach' : ''}" id="box">${t(app.line.key, app.line.vars)}</div>`;

function screenPlay(animate) {
  const single = app.game.mode === 'single';
  const title = single ? t(isCoachTurn() ? 'coachTurn' : 'yourTurn') : t('markTurn', { mark: markHtml(app.turn) });
  const sub = single ? t('youAreMark', { mark: markHtml(app.game.mark) }) : t('tapSquare');
  const ring = (i) => (i === app.hint ? 'hint' : i === app.last ? 'last' : '');
  panelEl.innerHTML = `<h1 id="title">${title}</h1><div class="sub" id="sub">${sub}</div>
    ${boardHtml(ring, animate)}${boxHtml()}
    <div class="actions">${btn('help', t('helpMe'), 'small')}</div>`;
  panelEl.querySelectorAll('.cell').forEach((b) => b.addEventListener('click', () => tapCell(+b.dataset.i)));
  on('help', askHelp);
  if (isCoachTurn()) { $('#help').disabled = true; scheduleCoach(); }
}

// The end of a game: the title, the board as it ended with the winning three ringed, the coach's
// line and Play again. A draw gets the handshake; a loss for the child the grey day: the colors
// fade, a rain cloud drifts over the board and the child's marks droop.
function screenDone() {
  const w = app.result.winner, line = app.result.line || [];
  const single = app.game.mode === 'single', child = app.game.mark;
  const lost = single && w && w !== child;
  const title = !w ? t('drawTitle') : !single ? t('markWins', { mark: markHtml(w) }) : t(lost ? 'lossTitle' : 'youWin');
  const reason = lost && lossReason(app.history, child);
  const say = !w ? (!single ? 'drawTwo' : app.game.level === 'hard' ? 'drawHard' : 'drawEasy')
    : lost ? 'loss' + reason[0].toUpperCase() + reason.slice(1) : 'winLine';
  const ring = (i) => `${line.includes(i) ? 'win' : ''} ${lost && app.board[i] === child ? 'droop' : ''}`.trim();
  if (lost) appEl.dataset.mood = 'sad';
  panelEl.innerHTML = `<h1 id="title">${title}</h1>
    ${!w ? '<div class="handshake" aria-hidden="true">🤝</div>' : ''}${lost ? '<div class="cloud" aria-hidden="true">🌧️</div>' : ''}
    ${boardHtml(ring, false)}<div class="box coach" id="box">${t(say)}</div>
    <div class="actions">${btn('again', t('playAgain'), 'primary small')}</div>`;
  panelEl.querySelectorAll('.cell').forEach((b) => { b.disabled = true; });
  on('again', startGame);
}

// Flat confetti in turn: a rounded square, an X and an O, each in a random sticker color.
const PIECES = [
  (c) => `<rect x="8" y="8" width="84" height="84" rx="22" fill="${c}"/>`,
  (c) => `<path d="M22 22 78 78M78 22 22 78" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round"/>`,
  (c) => `<circle cx="50" cy="50" r="30" fill="none" stroke="${c}" stroke-width="16"/>`,
];
function confetti() {
  if (reduced) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${PIECES[i % PIECES.length](pick(STICKERS))}</svg>`;
    p.style.left = Math.random() * 100 + 'vw';
    p.style.setProperty('--s', (12 + Math.random() * 8).toFixed(1) + 'px');
    p.style.setProperty('--dx', (Math.random() * 40 - 20).toFixed(1) + 'vw');
    p.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
    p.style.setProperty('--t', (2.2 + Math.random() * 1.6).toFixed(2) + 's');
    p.style.setProperty('--d', (Math.random() * 0.5).toFixed(2) + 's');
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4600);
}


