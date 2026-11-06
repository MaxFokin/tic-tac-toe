// ===== Look and words =====
const STICKERS = ['#1FAD5C', '#FFD43B', '#D7263D', '#FF8A1E', '#1F6FEB', '#F6F6F1'];
const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const $ = (sel) => document.querySelector(sel);
const appEl = $('#app'), panelEl = $('#panel'), restartBtn = $('#restart');

// ===== State =====
const app = { screen: 'welcome', setup: { mode: 'single', level: 'easy', mark: 'X', first: 'me' } };
const KEY = 'ttt-coach-v1';
const SETUP_KEY = 'ttt-coach-setup';
function save() { /* Task 10 */ }
function restore() { /* Task 10 */ }

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
  appEl.dataset.screen = app.screen;
  refreshChrome();
  ({ welcome: screenWelcome, play: screenPlay }[app.screen] || screenWelcome)(animate);
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
  app.result = null;
  app.starter = s.mode === 'two' ? 'X' : s.first === 'me' ? s.mark : s.first === 'coach' ? other(s.mark) : pick(['X', 'O']);
  app.turn = app.starter;
  const drawn = s.mode === 'single' && s.first === 'random';
  app.line = { key: drawn ? (app.starter === s.mark ? 'boxYouStart' : 'boxCoachStarts') : 'boxStuck' };
  go('play');
}

function screenPlay() {
  panelEl.innerHTML = `<h1>${t('yourTurn')}</h1>`;
}

function confetti() {
  if (reduced) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const cols = STICKERS;
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.setProperty('--c', cols[i % cols.length]);
    p.style.setProperty('--x', (Math.random() * 40 - 20).toFixed(1) + 'vw');
    p.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
    p.style.setProperty('--t', (2.2 + Math.random() * 1.6).toFixed(2) + 's');
    p.style.setProperty('--d', (Math.random() * 0.5).toFixed(2) + 's');
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4600);
}


