// Fills the remaining gap after augment-words.js: words with no exact-target
// sentence match anywhere and no Tanaka Corpus (jed) substring hit. Node
// built-ins only.
//
// These are NOT sourced from any dictionary or corpus — they're short,
// mechanically templated sentences generated from the word itself and its
// `meaning` gloss, so every kyoiku-wordsN.json word has *something* on the
// answer reveal. They're deliberately simple/generic compared to the
// hand-picked or corpus-matched examples elsewhere in this file, and are
// original text (not copied from any commercial workbook), consistent with
// this repo's copyright constraints (see this directory's README).
//
// Classification uses the JMdict-style POS tag already present in many
// `meaning` strings (e.g. "exchange, replace [v.t.]") when there is one;
// falls back to a kana-ending heuristic (kanji-drill's own augmented
// okurigana words carry no tag) otherwise:
//   - [v.t.] (transitive verb, may combine with v.i.) -> それを + verb
//   - [v.i.] only                                     -> それは + verb
//   - [adj.] tag, or untagged but ends in い            -> adjective
//   - untagged but ends in a verb-ending kana (transitivity unknown)
//                                                       -> bare verb, no
//                                                          subject/object
//                                                          guessed
//   - everything else                                  -> noun
//
// English translations deliberately never conjugate the gloss (no "-s", no
// invented subject) — the gloss strings are free-form JMdict/curated text
// ("put out, send", "be saved, survive"), and guessing agreement wrong reads
// worse than a plain infinitive/label gloss. The one enrichment applied is
// appending "it" to a single-word transitive gloss ("Bend it." rather than
// bare "Bend."); anything with a space (multi-word/phrasal, e.g. "put out")
// is left as-is rather than risk misplacing the object ("put out it.").
//
// Re-run any time after augment-words.js, from kanji-data's repo root:
//   node scripts/kyoiku/augment-words.js
//   node scripts/kyoiku/generate-filler-sentences.js

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const VERB_ENDINGS = new Set([...'るうくぐすつぬぶむ']);

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function formatEntry(w) {
  const parts = [`"word": ${JSON.stringify(w.word)}`, `"readings": ${JSON.stringify(w.readings)}`, `"meaning": ${JSON.stringify(w.meaning)}`];
  if (w.examples) parts.push(`"examples": ${JSON.stringify(w.examples)}`);
  return `{ ${parts.join(', ')} }`;
}

function writeWords(relPath, words) {
  const lines = ['['];
  words.forEach((w, i) => {
    const comma = i < words.length - 1 ? ',' : '';
    lines.push('  ' + formatEntry(w) + comma);
  });
  lines.push(']');
  fs.writeFileSync(path.join(ROOT, relPath), lines.join('\n') + '\n', 'utf8');
}

// First alternative before a comma, tag stripped, capitalized — meanings
// like "exchange, replace [v.t.]" or "be saved, survive [v.i.], helpful
// [adj.]" carry several senses; the first is the primary one.
function primaryGloss(meaning) {
  const firstSense = meaning.split(',')[0];
  const stripped = firstSense.replace(/\s*\[[^\]]*\]\s*/g, '').trim();
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function classify(word, meaning) {
  const hasTag = (tag) => meaning.includes(`[${tag}`);
  if (hasTag('v.t.')) return 'transitive';
  if (hasTag('v.i.')) return 'intransitive';
  if (hasTag('adj.')) return word.endsWith('い') ? 'i-adjective' : 'na-adjective';
  if (word.endsWith('い')) return 'i-adjective';
  if (VERB_ENDINGS.has(word[word.length - 1])) return 'verb-unknown-transitivity';
  return 'noun';
}

// A bare gloss/label translation ("Bend.", "Come out.") rather than a
// constructed sentence — see the file header for why.
function verbTranslation(gloss, transitive) {
  if (transitive && !gloss.includes(' ')) return `${gloss} it.`;
  return `${gloss}.`;
}

function fillerFor(word, meaning) {
  const gloss = primaryGloss(meaning);
  switch (classify(word, meaning)) {
    case 'transitive':
      return { sentence: `それを${word}。`, translation: verbTranslation(gloss, true) };
    case 'intransitive':
      return { sentence: `それは${word}。`, translation: verbTranslation(gloss, false) };
    case 'verb-unknown-transitivity':
      // Neither それを nor それは — Japanese permits a bare zero-pronoun
      // verb sentence, and it's the only choice that's never wrong when
      // transitivity isn't known.
      return { sentence: `${word}。`, translation: verbTranslation(gloss, false) };
    case 'i-adjective':
      return { sentence: `これはとても${word}。`, translation: `This is very ${gloss.toLowerCase()}.` };
    case 'na-adjective':
      return { sentence: `これはとても${word}です。`, translation: `This is very ${gloss.toLowerCase()}.` };
    default:
      return { sentence: `これは${word}です。`, translation: `This is ${gloss.toLowerCase()}.` };
  }
}

for (let g = 1; g <= 9; g++) {
  const wfile = `words/kyoiku-words${g}.json`;
  const words = readJson(wfile);
  let filled = 0;
  for (const w of words) {
    if (w.examples) continue;
    w.examples = [fillerFor(w.word, w.meaning)];
    filled++;
  }
  writeWords(wfile, words);
  console.log(g, 'filled', filled, 'of', words.length);
}
