// ===== Words, in every language =====
// STRINGS[key] = { en, he, pl }. A value is a string with {name} placeholders or a plural set
// ({ one, two, few, many, other }; other is required). t(key, vars) picks the current language,
// falls back to English and fills every {name} from vars. No DOM in this file.
const LANGS = {
  en: { name: 'English', dir: 'ltr', flag: '🇬🇧', code: 'EN' },
  he: { name: 'עברית', dir: 'rtl', flag: '🇮🇱', code: 'HE' },
  pl: { name: 'Polski', dir: 'ltr', flag: '🇵🇱', code: 'PL' },
};
let lang = 'en';
const useLang = (code) => { lang = code; };
const PLURALS = {};
function pluralOf(n) {
  if (n === undefined) return 'other';
  try { return (PLURALS[lang] || (PLURALS[lang] = new Intl.PluralRules(lang))).select(n); } catch (e) { return 'other'; }
}
function t(key, vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return key;
  let v = entry[lang] !== undefined ? entry[lang] : entry.en;
  while (v && typeof v === 'object') {
    const c = pluralOf(vars.n); v = v[c] !== undefined ? v[c] : v.other;
  }
  if (typeof v !== 'string') return key;
  return v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
const STRINGS = {
  // Header
  startOver: {
    en: 'Start over',
    he: 'להתחיל מחדש',
    pl: 'Od nowa',
  },
  startOverArmed: {
    en: 'Tap again to start over',
    he: 'עוד לחיצה כדי להתחיל מחדש',
    pl: 'Dotknij znów: od nowa',
  },
  language: {
    en: 'Language',
    he: 'שפה',
    pl: 'Język',
  },
  darkMode: {
    en: 'Dark mode',
    he: 'מצב כהה',
    pl: 'Tryb ciemny',
  },
  lightMode: {
    en: 'Light mode',
    he: 'מצב בהיר',
    pl: 'Tryb jasny',
  },
};
