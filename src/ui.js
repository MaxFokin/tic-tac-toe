// ===== Look and words =====
const STICKERS = ['#1FAD5C', '#FFD43B', '#D7263D', '#FF8A1E', '#1F6FEB', '#F6F6F1'];
const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const $ = (sel) => document.querySelector(sel);
const appEl = $('#app'), panelEl = $('#panel'), restartBtn = $('#restart');

// ===== State =====
const app = { screen: 'welcome' };
const KEY = 'ttt-coach-v1';
const SETUP_KEY = 'ttt-coach-setup';
function save() { /* Task 10 */ }
function restore() { /* Task 10 */ }

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
  ({ welcome: screenWelcome }[app.screen] || screenWelcome)(animate);
}

function screenWelcome() {
  panelEl.innerHTML = `<h1>Tic-Tac-Toe Coach</h1>`;
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


