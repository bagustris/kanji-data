# kanji-data

Canonical kanji/vocab data shared across a family of Japanese-study apps
([kanji-slideshow](https://github.com/bagustris/kanji-slideshow),
[jlpt](https://github.com/bagustris/jlpt),
[kanji-drill](https://github.com/bagustris/kanji-drill),
[wanikanji](https://github.com/bagustris/wanikanji),
[jed](https://github.com/bagustris/jed) (partial — see below), and —
possibly — [kotoba](https://github.com/bagustris/kotoba)), consumed as a
**git submodule**.

**Organized by data domain, not by which app produced it.** A consumer
looking for radicals, kanji facts, words, compound words, or example
sentences finds them under `radicals/`, `kanji/`, `words/`, `compounds/`,
`sentences/` — never under a folder named after one specific app. Per-kanji
facts from different sources are kept in separate, clearly-labeled files
rather than merged into one reconciled record (e.g. `kanji/kanji_metadata.json`
and `kanji/kyoiku-grade{1-9}.json` both describe kanji, from different
curricula, and both live under `kanji/` without being reconciled into one
schema) — an app wanting both just reads both files.

## Layout

```
kanji/
  kanji_metadata.json    per-kanji record (all ~10,400 KANJIDIC2 kanji):
                          strokes, jōyō grade, freq, JLPT level, meanings,
                          on'yomi/kun'yomi, WaniKani level/radicals
  kanji_n1.csv .. kanji_n5.csv
                          JLPT-curated combined working file: kanji, meaning,
                          readings, pitch-accented compounds, example
                          sentence, kana, translation, radicals, confusables
                          — the input scripts/*.py operate on; superseded
                          for direct cross-app consumption by compounds/ and
                          the per-domain files below, where those exist
  kyoiku-grade1.json .. kyoiku-grade9.json
                          Kyōiku/junior-high curriculum: kanji + readings +
                          grade + a few example words, from kanji-drill

radicals/
  radicals_metadata.csv  Kangxi radical list (number, char, strokes, name,
                          readings, kanji containing it)
  kradfile                raw EDRDG kanji -> radical decomposition

words/
  kyoiku-words1.json .. kyoiku-words9.json
                          word + readings + meaning, per Kyōiku grade, from
                          kanji-drill

compounds/
  jlpt-compounds-n1.json .. jlpt-compounds-n5.json
                          word/reading/accent/meaning/sourceKanji, deduped
                          per JLPT level — dual-written by
                          scripts/export_jlpt_web.py whenever it's run, so
                          this stays in sync with kanji/kanji_n{1-5}.csv
                          automatically
  accents_kanjium.txt    raw Kanjium pitch-accent database

sentences/
  kyoiku-sentences1.json .. kyoiku-sentences9.json
                          hand-written example sentences, per Kyōiku grade,
                          from kanji-drill
  jed-kanji-sentences.json
                          Tanaka-Corpus-derived example sentences with
                          furigana, keyed by kanji character, from jed
                          (partial mirror — see "About the jed data" below)
  examples.utf            raw Tanaka Corpus (indexed by word)

stroke-order/
  kanjivg/                2,136 stroke-order SVGs, filename = 5-hex-digit
                          Unicode codepoint (e.g. 04e00.svg = 一), jōyō kanji
                          only, from jed (partial mirror)

scripts/
  enrich_kanji_csv.py     adds sentence/kana/translation/radicals/confusables
                          columns to kanji/kanji_n{1-5}.csv, from
                          radicals/kradfile + sentences/examples.utf
  add_pitch_accent.py     adds kanjium pitch-accent notation to compounds in
                          kanji/kanji_n{1-5}.csv, from compounds/accents_kanjium.txt
  export_jlpt_web.py      exports a JLPT quiz app's slim per-level JSON (see
                          usage below) and dual-writes compounds/jlpt-compounds-n{1-5}.json
  kyoiku/                 kanji-drill's own data-maintenance scripts
                          (network/offline modes documented in
                          scripts/kyoiku/README.md) — audit-readings.js,
                          audit-words.js, fetch-example-words.js,
                          fetch-examples-kanjialive.js, jmdict.js,
                          validate-sentences.js
```

**Deliberately not (yet) split out**: per-kanji `sentence`/`kana`/`translation`
columns inside `kanji/kanji_n{1-5}.csv` aren't exported as their own
`sentences/jlpt-sentences-n{1-5}.json` — revisit if an app wants them
standalone rather than via the combined CSV.

## About the jed data

Unlike kanji-slideshow/jlpt/kanji-drill/wanikanji (which fully consume this
repo — their own local copies were removed), **jed keeps its own full local
`data/` and deploys exactly as before**. `sentences/jed-kanji-sentences.json`
and `stroke-order/kanjivg/` are a deliberately partial, periodically
refreshed *mirror* of just the two pieces of jed's ~148MB dataset that are
portable to other apps without also needing jed's JMdict search stack
(`words/`/`index/` shards, ~120MB, are dictionary-search infrastructure
specific to jed and are not mirrored here). To refresh: in jed, run
`tools/build_data.py` → `tools/build_sentences.py` → `tools/build_furigana.py`
(see jed's `tools/README.md`), then copy `data/kanjivg/` and
`data/kanji-sentences.json` here. jed's `data/word-sentences.json` is keyed
by JMdict sequence-id, unresolvable without also carrying jed's `words/`
shards — no other app currently has JMdict seq-ids to look up with, so it
isn't portable in its current form; bring it in later if an app wants
word-level (not just kanji-level) sentence lookup.

kotoba's learning engine is ported from kanji-drill's code, but it has no
data dependency on kanji-drill or jed, so it may end up needing no
migration at all.

## Using this from a consuming app

Add as a submodule at `vendor/kanji-data`:

```bash
git submodule add https://github.com/bagustris/kanji-data vendor/kanji-data
git submodule update --init
```

To regenerate an app's own `data/kanji-n{1-5}.json` + `data/compounds-n{1-5}.json`
from the submodule (this is how the jlpt app gets its data):

```bash
python3 vendor/kanji-data/scripts/export_jlpt_web.py \
  --src-dir vendor/kanji-data/kanji --output-dir data
```

To pick up upstream changes later:

```bash
git submodule update --remote vendor/kanji-data
```

Apps that consume this data directly at runtime (kanji-drill, and any
future app doing the same) need their GitHub Pages deployment to actually
check out submodules — the classic "deploy from a branch" pipeline does
not. Use a `.github/workflows/*.yml` with `actions/checkout@v4`
(`submodules: true`) → `actions/upload-pages-artifact` → `actions/deploy-pages`,
and set the repo's Pages source to "GitHub Actions". Apps that only read
this data at *build time* to produce their own committed output (like
jlpt, wanikanji) aren't affected.

## Data sources & licensing

See [CREDITS.md](CREDITS.md). In short: `kanji/kanji_metadata.json` and the
JLPT CSVs are built from KANJIDIC2 and WaniKani-style enrichment (EDRDG
licence, CC BY-SA-compatible attribution required); `radicals/kradfile` is
EDRDG's KRADFILE; `sentences/examples.utf` is the Tanaka Corpus (via
EDRDG's `JMdict_e_examp.xml`); `compounds/accents_kanjium.txt` is the
Kanjium pitch-accent database; `kanji/kyoiku-grade*.json`,
`words/kyoiku-words*.json` are JMdict/KANJIDIC (via kanjiapi.dev) and Kanji
Alive data, `sentences/kyoiku-sentences*.json` is original hand-written
content; `stroke-order/kanjivg/` is KanjiVG (CC BY-SA 3.0, © Ulrich Apel)
and `sentences/jed-kanji-sentences.json` is Tanaka Corpus (EDRDG licence)
with furigana added by jed's build pipeline. Any redistribution of this
repo's data should carry CREDITS.md along with it.
