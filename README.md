# kanji-data

Canonical kanji/vocab data shared across a family of Japanese-study apps
([kanji-slideshow](https://github.com/bagustris/kanji-slideshow),
[jlpt](https://github.com/bagustris/jlpt),
[kanji-drill](https://github.com/bagustris/kanji-drill),
[wanikanji](https://github.com/bagustris/wanikanji),
[jed](https://github.com/bagustris/jed) (partial — see below), and —
possibly — [kotoba](https://github.com/bagustris/kotoba)). Each app
previously kept its own copy of overlapping kanji/vocab data; this repo is
the shared home for data that's actually reused across more than one app,
consumed as a **git submodule**.

This is **phase 3** of that consolidation. kanji-slideshow, jlpt,
kanji-drill, and wanikanji fully consume this repo (their own local copies
were removed; see each app's README for how). **jed is different: only a
small, deliberately partial slice of its data lives here** (see `jed/`
below) — jed has no cross-app coupling problem to fix, so it keeps its own
full local `data/` and deploys exactly as before; this repo just holds a
periodically-refreshed *mirror* of the two pieces of jed's data that are
actually portable to other apps (kanji stroke-order animation, per-kanji
example sentences). kotoba's learning engine is ported from kanji-drill's
code, but it has no data dependency on kanji-drill or jed, so it may end up
needing no migration at all.

## Layout

```
kanji/     canonical JLPT/kanji-slideshow data
  kanji_metadata.json    per-kanji record: strokes, grade, freq, JLPT level,
                          meanings, on'yomi/kun'yomi, WaniKani level/radicals
  kanji_n1.csv .. kanji_n5.csv
                          JLPT-graded kanji lists: meaning, readings,
                          pitch-accented compounds, example sentence, kana,
                          translation, radicals, confusables
  radicals_metadata.csv  Kangxi radical metadata

sources/   large upstream source files the scripts below consume/regenerate
  kradfile              EDRDG kanji -> radical decomposition
  examples.utf          Tanaka Corpus example sentences (indexed by word)
  accents_kanjium.txt   Kanjium pitch-accent database

scripts/   build tooling that produces/enriches the files in kanji/
  enrich_kanji_csv.py   adds sentence/kana/translation/radicals/confusables
                         columns to kanji_n{1-5}.csv
  add_pitch_accent.py   adds kanjium pitch-accent notation to compounds
  export_jlpt_web.py    exports slim per-level JSON for a JLPT quiz app
                         (see usage below)

kanji-drill/   canonical Kyōiku/junior-high grade data (kanji-drill's own
               dataset — grade{1-9}/words{1-9} are JMdict/Kanji-Alive-backed,
               sentences{1-9} are original hand-written content). Consumed
               directly by kanji-drill's own web app at runtime, and by
               wanikanji's build step for example words/sentences.
  data/
    grade1.json .. grade9.json      kanji + readings (+ optional examples)
    words1.json .. words9.json      words + readings + meaning
    sentences1.json .. sentences9.json
                                     hand-written example sentences
  tools/     kanji-drill's own data-maintenance scripts (network/offline
             modes documented in tools/README.md) — audit-readings.js,
             audit-words.js, fetch-example-words.js,
             fetch-examples-kanjialive.js, jmdict.js, validate-sentences.js

jed/   PARTIAL mirror of jed's data — only the pieces that are portable to
       other apps without also needing jed's full JMdict search stack
       (jed's `words/`/`index/` shards, ~120MB, are dictionary-search
       infrastructure specific to jed itself and are deliberately NOT
       mirrored here). jed remains the authoritative source and keeps its
       own full local data/ — nothing here is consumed by jed itself.
  data/
    kanjivg/               2,136 stroke-order SVGs, filename = 5-hex-digit
                            Unicode codepoint (e.g. 04e00.svg = 一), jōyō
                            kanji only
    kanji-sentences.json   per-kanji example sentences (with furigana),
                            keyed directly by kanji character

  To refresh this mirror after jed's data changes: in jed, run
  `tools/build_data.py` → `tools/build_sentences.py` →
  `tools/build_furigana.py` (see jed's `tools/README.md`), then copy
  `data/kanjivg/` and `data/kanji-sentences.json` here.

  Not mirrored (yet): jed's `data/word-sentences.json` is keyed by JMdict
  sequence-id, which isn't resolvable without also carrying jed's `words/`
  shards — no other app currently has JMdict seq-ids to look up with, so
  it isn't portable in its current form. Bring it in later if an app wants
  word-level (not just kanji-level) sentence lookup.
```

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

Apps that consume `kanji-drill/data/` directly at runtime (kanji-drill
itself, and any future app doing the same) need their GitHub Pages
deployment to actually check out submodules — the classic "deploy from a
branch" pipeline does not. Use a `.github/workflows/*.yml` with
`actions/checkout@v4` (`submodules: true`) → `actions/upload-pages-artifact`
→ `actions/deploy-pages`, and set the repo's Pages source to "GitHub
Actions". Apps that only read this data at *build time* to produce their own
committed output (like jlpt, wanikanji) aren't affected.

## Data sources & licensing

See [CREDITS.md](CREDITS.md). In short: `kanji_metadata.json` and the JLPT
CSVs are built from KANJIDIC2 and WaniKani-style enrichment (EDRDG licence,
CC BY-SA-compatible attribution required); `kradfile` is EDRDG's KRADFILE;
`examples.utf` is the Tanaka Corpus (via EDRDG's `JMdict_e_examp.xml`);
`accents_kanjium.txt` is the Kanjium pitch-accent database; `kanji-drill/`
is JMdict/KANJIDIC (via kanjiapi.dev) and Kanji Alive data plus original
hand-written sentences; `jed/data/kanjivg/` is KanjiVG (CC BY-SA 3.0, ©
Ulrich Apel) and `jed/data/kanji-sentences.json` is Tanaka Corpus (EDRDG
licence, same family as `sources/examples.utf`) with furigana added by
jed's build pipeline. Any redistribution of this repo's data should carry
CREDITS.md along with it.
