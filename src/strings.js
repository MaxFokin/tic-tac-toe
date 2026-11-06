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
  // Welcome
  whoPlays: {
    en: 'Who plays?',
    he: 'מי משחק?',
    pl: 'Kto gra?',
  },
  single: {
    en: 'Single player',
    he: 'שחקן אחד',
    pl: 'Jeden gracz',
  },
  two: {
    en: '2 players',
    he: '2 שחקנים',
    pl: '2 graczy',
  },
  coachLevel: {
    en: 'How good is the coach?',
    he: 'כמה טוב המאמן?',
    pl: 'Jak dobry jest trener?',
  },
  easy: {
    en: 'Easy',
    he: 'קל',
    pl: 'Łatwy',
  },
  medium: {
    en: 'Medium',
    he: 'בינוני',
    pl: 'Średni',
  },
  hard: {
    en: 'Hard',
    he: 'קשה',
    pl: 'Trudny',
  },
  age5: {
    en: 'age 5',
    he: 'גיל 5',
    pl: '5 lat',
  },
  age8: {
    en: 'age 8',
    he: 'גיל 8',
    pl: '8 lat',
  },
  age10: {
    en: 'age 10+',
    he: 'גיל 10+',
    pl: '10+ lat',
  },
  youAre: {
    en: 'You are',
    he: 'אתה',
    pl: 'Jesteś',
  },
  whoStarts: {
    en: 'Who starts?',
    he: 'מי מתחיל?',
    pl: 'Kto zaczyna?',
  },
  me: {
    en: 'Me',
    he: 'אני',
    pl: 'Ja',
  },
  coach: {
    en: 'Coach',
    he: 'המאמן',
    pl: 'Trener',
  },
  random: {
    en: 'Random',
    he: 'הגרלה',
    pl: 'Losowo',
  },
  play: {
    en: 'Play',
    he: 'שחק',
    pl: 'Graj',
  },
  howto1: {
    en: 'Take turns on this phone. X starts.',
    he: 'משחקים בתורות על הטלפון הזה. X מתחיל.',
    pl: 'Grajcie na zmianę na tym telefonie. X zaczyna.',
  },
  howto2: {
    en: 'Stuck? Tap Help me. The coach shows you.',
    he: 'תקוע? לחץ על עזור לי. המאמן יראה לך.',
    pl: 'Nie wiesz, co dalej? Dotknij Pomóż mi. Trener pokaże.',
  },
  howto3: {
    en: 'Three in a row wins!',
    he: 'שלושה בשורה מנצחים!',
    pl: 'Trzy w rzędzie wygrywają!',
  },
  // Play
  yourTurn: {
    en: 'Your turn',
    he: 'התור שלך',
    pl: 'Twój ruch',
  },
  youAreMark: {
    en: 'You are {mark}',
    he: 'אתה {mark}',
    pl: 'Jesteś {mark}',
  },
  coachTurn: {
    en: 'The coach’s turn',
    he: 'התור של המאמן',
    pl: 'Ruch trenera',
  },
  markTurn: {
    en: '{mark}’s turn',
    he: 'התור של {mark}',
    pl: 'Ruch: {mark}',
  },
  tapSquare: {
    en: 'Tap a square',
    he: 'לחץ על ריבוע',
    pl: 'Dotknij pola',
  },
  helpMe: {
    en: 'Help me',
    he: 'עזור לי',
    pl: 'Pomóż mi',
  },
  cellEmpty: {
    en: 'Square {n}, empty',
    he: 'ריבוע {n}, ריק',
    pl: 'Pole {n}, puste',
  },
  cellMark: {
    en: 'Square {n}, {mark}',
    he: 'ריבוע {n}, {mark}',
    pl: 'Pole {n}, {mark}',
  },
  cellHint: {
    en: 'Square {n}, empty, the coach’s hint',
    he: 'ריבוע {n}, ריק, הרמז של המאמן',
    pl: 'Pole {n}, puste, podpowiedź trenera',
  },
  boxStuck: {
    en: 'Stuck? Tap Help me.',
    he: 'תקוע? לחץ על עזור לי.',
    pl: 'Nie wiesz, co dalej? Dotknij Pomóż mi.',
  },
  boxYouStart: {
    en: 'You start!',
    he: 'אתה מתחיל!',
    pl: 'Zaczynasz!',
  },
  boxCoachStarts: {
    en: 'The coach starts.',
    he: 'המאמן מתחיל.',
    pl: 'Trener zaczyna.',
  },
  // Hints (Help me)
  hintWin: {
    en: 'Put it here and you win!',
    he: 'שים כאן ואתה מנצח!',
    pl: 'Postaw tutaj i wygrywasz!',
  },
  hintBlock: {
    en: 'Put it here, or the coach wins.',
    he: 'שים כאן, אחרת המאמן מנצח.',
    pl: 'Postaw tutaj, bo trener wygra.',
  },
  hintBlock2: {
    en: 'Put it here, or {mark} wins.',
    he: 'שים כאן, אחרת {mark} מנצח.',
    pl: 'Postaw tutaj, bo {mark} wygra.',
  },
  hintFork: {
    en: 'Put it here. Then you have two ways to win!',
    he: 'שים כאן. ואז יש לך שתי דרכים לנצח!',
    pl: 'Postaw tutaj. Wtedy masz dwa sposoby na wygraną!',
  },
  hintTwoInRow: {
    en: 'Make two in a row. Now the coach must block.',
    he: 'עשה שניים בשורה. עכשיו המאמן חייב לחסום.',
    pl: 'Zrób dwa w rzędzie. Teraz trener musi blokować.',
  },
  hintTwoInRow2: {
    en: 'Make two in a row. Now {mark} must block.',
    he: 'עשה שניים בשורה. עכשיו {mark} חייב לחסום.',
    pl: 'Zrób dwa w rzędzie. Teraz {mark} musi blokować.',
  },
  hintStopFork: {
    en: 'Put it here, or the coach gets two ways to win.',
    he: 'שים כאן, אחרת למאמן יהיו שתי דרכים לנצח.',
    pl: 'Postaw tutaj, bo trener dostanie dwa sposoby na wygraną.',
  },
  hintStopFork2: {
    en: 'Put it here, or {mark} gets two ways to win.',
    he: 'שים כאן, אחרת ל-{mark} יהיו שתי דרכים לנצח.',
    pl: 'Postaw tutaj, bo {mark} dostanie dwa sposoby na wygraną.',
  },
  hintCenter: {
    en: 'Take the middle. It’s the best square.',
    he: 'קח את האמצע. זה הריבוע הכי טוב.',
    pl: 'Weź środek. To najlepsze pole.',
  },
  hintCorner: {
    en: 'Take a corner.',
    he: 'קח פינה.',
    pl: 'Weź róg.',
  },
  hintSide: {
    en: 'Take a side square.',
    he: 'קח ריבוע בצד.',
    pl: 'Weź pole z boku.',
  },
  hintAny: {
    en: 'Any square is fine here.',
    he: 'כל ריבוע טוב כאן.',
    pl: 'Każde pole jest tu dobre.',
  },
  // The coach’s lines, after its move (Polish in the present: no gendered past for the coach)
  coachBlock: {
    en: 'I blocked you.',
    he: 'חסמתי אותך.',
    pl: 'Blokuję cię.',
  },
  coachFork: {
    en: 'I made two ways to win. Can you stop me?',
    he: 'יצרתי שתי דרכים לנצח. תוכל לעצור אותי?',
    pl: 'Mam dwa sposoby na wygraną. Zatrzymasz mnie?',
  },
  coachTwoInRow: {
    en: 'Two in a row. Block me!',
    he: 'שניים בשורה. חסום אותי!',
    pl: 'Dwa w rzędzie. Zablokuj mnie!',
  },
  coachStopFork: {
    en: 'I stopped your two ways to win.',
    he: 'עצרתי את שתי הדרכים שלך לנצח.',
    pl: 'Zatrzymuję twoje dwa sposoby na wygraną.',
  },
  coachCenter: {
    en: 'I took the middle.',
    he: 'לקחתי את האמצע.',
    pl: 'Biorę środek.',
  },
  coachCorner: {
    en: 'I took a corner.',
    he: 'לקחתי פינה.',
    pl: 'Biorę róg.',
  },
  coachSide: {
    en: 'I took a side square.',
    he: 'לקחתי ריבוע בצד.',
    pl: 'Biorę pole z boku.',
  },
  // Done
  youWin: {
    en: 'You win!',
    he: 'ניצחת!',
    pl: 'Wygrywasz!',
  },
  markWins: {
    en: '{mark} wins!',
    he: '{mark} מנצח!',
    pl: '{mark} wygrywa!',
  },
  drawTitle: {
    en: 'It’s a draw!',
    he: 'תיקו!',
    pl: 'Remis!',
  },
  lossTitle: {
    en: 'Oh no…',
    he: 'אוי לא…',
    pl: 'Oj nie…',
  },
  winLine: {
    en: 'Three in a row. Well done!',
    he: 'שלושה בשורה. כל הכבוד!',
    pl: 'Trzy w rzędzie. Brawo!',
  },
  drawHard: {
    en: 'Nobody beats the Hard coach. A draw is as good as it gets!',
    he: 'אף אחד לא מנצח את המאמן הקשה. תיקו זה הכי טוב שיש!',
    pl: 'Nikt nie pokona trudnego trenera. Remis to najlepszy wynik!',
  },
  drawEasy: {
    en: 'You both played well. Shake hands!',
    he: 'שנינו שיחקנו יפה. לוחצים ידיים!',
    pl: 'Dobrze nam poszło. Podajmy sobie ręce!',
  },
  drawTwo: {
    en: 'Nobody wins this one. Shake hands!',
    he: 'אף אחד לא מנצח הפעם. לוחצים ידיים!',
    pl: 'Tym razem nikt nie wygrywa. Podajcie sobie ręce!',
  },
  lossMissedWin: {
    en: 'You had three in a row waiting. Next time, look for it first!',
    he: 'שלושה בשורה חיכו לך. בפעם הבאה, חפש אותם קודם!',
    pl: 'Czekały na ciebie trzy w rzędzie. Następnym razem szukaj ich najpierw!',
  },
  lossMissedBlock: {
    en: 'You could have blocked me. Next time, look at my two in a row.',
    he: 'יכולת לחסום אותי. בפעם הבאה, הסתכל על השניים בשורה שלי.',
    pl: 'Można było mnie zablokować. Następnym razem patrz na moje dwa w rzędzie.',
  },
  lossFork: {
    en: 'I made two ways to win. Next time, stop me before that.',
    he: 'יצרתי שתי דרכים לנצח. בפעם הבאה, עצור אותי לפני כן.',
    pl: 'Udało mi się zrobić dwa sposoby na wygraną. Następnym razem zatrzymaj mnie wcześniej.',
  },
  lossGeneral: {
    en: 'Next time, try the middle or a corner first.',
    he: 'בפעם הבאה, נסה קודם את האמצע או פינה.',
    pl: 'Następnym razem zacznij od środka albo rogu.',
  },
  playAgain: {
    en: 'Play again',
    he: 'שחק שוב',
    pl: 'Zagraj znowu',
  },
};
