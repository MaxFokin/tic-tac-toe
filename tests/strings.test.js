// The strings table: every key in every language, matching placeholders, well-formed plural
// sets, and t() picking the right variant.
const assert = require('assert');
const { STRINGS, LANGS, t, useLang } = require('./load.js');
const placeholders = (s) => new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
const leaves = (v) => (typeof v === 'string' ? [v] : Object.values(v).flatMap(leaves));
// Every word the screens and the coach need.
for (const k of [
  'whoPlays', 'single', 'two', 'coachLevel', 'easy', 'medium', 'hard', 'age5', 'age8', 'age10', 'youAre', 'whoStarts', 'me', 'coach', 'random', 'play', 'howto1', 'howto2', 'howto3',
  'yourTurn', 'youAreMark', 'coachTurn', 'markTurn', 'tapSquare', 'helpMe', 'cellEmpty', 'cellMark', 'cellHint', 'boxStuck', 'boxYouStart', 'boxCoachStarts',
  'hintWin', 'hintBlock', 'hintBlock2', 'hintFork', 'hintTwoInRow', 'hintTwoInRow2', 'hintStopFork', 'hintStopFork2', 'hintCenter', 'hintCorner', 'hintSide', 'hintAny',
  'coachBlock', 'coachFork', 'coachTwoInRow', 'coachStopFork', 'coachCenter', 'coachCorner', 'coachSide',
  'youWin', 'markWins', 'drawTitle', 'lossTitle', 'winLine', 'drawHard', 'drawEasy', 'drawTwo', 'lossMissedWin', 'lossMissedBlock', 'lossFork', 'lossGeneral', 'playAgain',
]) assert(STRINGS[k], k + ' exists');
for (const [key, entry] of Object.entries(STRINGS)) {
  for (const code of Object.keys(LANGS)) assert(entry[code] !== undefined, `${key} lacks ${code}`);
  const want = placeholders(leaves(entry.en).join(' '));
  for (const code of Object.keys(LANGS)) for (const leaf of leaves(entry[code])) {
    for (const p of want) assert(leaf.includes(`{${p}}`), `${key}.${code} lacks {${p}}: ${leaf}`);
    for (const p of placeholders(leaf)) assert(want.has(p), `${key}.${code} has unknown {${p}}`);
    assert(!leaf.includes('—'), `${key}.${code} has an em dash`);
    assert(!/\b[A-Z]{3,}\b/.test(leaf.replace(/\{\w+\}/g, '')), `${key}.${code} shouts: ${leaf}`);
  }
  const checkSets = (v, path) => {
    if (typeof v === 'string') return;
    assert(v.other !== undefined, `${path} plural set lacks other`);
    Object.entries(v).forEach(([k, w]) => checkSets(w, `${path}.${k}`));
  };
  for (const code of Object.keys(LANGS)) checkSets(entry[code], `${key}.${code}`);
}

// t(): placeholders, plurals, fallback.
STRINGS._probe = { en: { one: 'That took {n} turn.', other: 'That took {n} turns.' } };
useLang('en');
assert.strictEqual(t('_probe', { n: 1 }), 'That took 1 turn.');
assert.strictEqual(t('_probe', { n: 9 }), 'That took 9 turns.');
assert.strictEqual(t('missingKey'), 'missingKey');
useLang('xx');
assert.strictEqual(t('_probe', { n: 1 }), 'That took 1 turn.', 'unknown language falls back to English');
useLang('en');
delete STRINGS._probe;
console.log('strings: ok (' + Object.keys(STRINGS).length + ' keys, ' + Object.keys(LANGS).join(' ') + ')');
