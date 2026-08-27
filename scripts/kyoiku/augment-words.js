// Augments words/kyoiku-wordsN.json in two ways, from data already in this
// repo. Node built-ins only.
//
// 1. Okurigana words (e.g. 買う, 急ぐ, 食べる) — pulled from each kanji's own
//    `examples` in kanji/kyoiku-gradeN.json, filtered to entries whose word
//    is the kanji followed by kana only (this is what distinguishes an
//    inflected reading like 買う from a compound like 買い物 or 右手). Only
//    kanji with a dotted (okurigana-bearing) reading are considered. Words
//    already present in the words file (by exact text) are left untouched.
//
// 2. Example sentences — attached to *every* word entry (new or
//    pre-existing) whose text exactly matches a sentence's `target` in
//    sentences/kyoiku-sentencesN.json, up to 2 per word.
//
// Usage (from kanji-data's repo root), re-run after kanji/ or sentences/
// data grows for a grade:
//   node scripts/kyoiku/augment-words.js

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function isKana(c) {
  const cp = c.codePointAt(0);
  return (cp >= 0x3041 && cp <= 0x309f) // hiragana
    || (cp >= 0x30a0 && cp <= 0x30ff) // katakana
    || c === 'ー';
}

function coreReading(r) {
  const dot = r.indexOf('.');
  return dot === -1 ? r : r.slice(0, dot);
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

// Matches the words files' existing one-entry-per-line style:
// `{ "word": "学校", "readings": ["がっこう"], "meaning": "school" }`.
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

for (let g = 1; g <= 9; g++) {
  const kfile = `kanji/kyoiku-grade${g}.json`;
  const wfile = `words/kyoiku-words${g}.json`;
  const sfile = `sentences/kyoiku-sentences${g}.json`;
  const kanji = readJson(kfile);
  const words = readJson(wfile);
  const sents = readJson(sfile);

  const existing = new Set(words.map((w) => w.word));
  for (const k of kanji) {
    if (!k.readings.some((r) => r.includes('.'))) continue;
    for (const ex of k.examples || []) {
      const w = ex.word;
      if (w.length < 2 || w[0] !== k.kanji) continue;
      if (![...w.slice(1)].every(isKana)) continue;
      if (existing.has(w)) continue;
      existing.add(w);
      words.push({ word: w, readings: [coreReading(ex.reading)], meaning: ex.gloss });
    }
  }

  const byTarget = new Map();
  for (const s of sents) {
    if (!byTarget.has(s.target)) byTarget.set(s.target, []);
    byTarget.get(s.target).push(s);
  }
  for (const w of words) {
    const cands = byTarget.get(w.word);
    if (!cands) continue;
    w.examples = cands.slice(0, 2).map((s) => ({
      sentence: s.sentence,
      translation: s.translation || s.meaning || '',
    }));
  }

  writeWords(wfile, words);
  console.log(g, 'words now', words.length);
}
