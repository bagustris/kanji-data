# kanji-data

Canonical kanji/vocab data shared across a family of Japanese-study apps
([kanji-slideshow](https://github.com/bagustris/kanji-slideshow),
[jlpt](https://github.com/bagustris/jlpt),
[kanji-drill](https://github.com/bagustris/kanji-drill),
[wanikanji](https://github.com/bagustris/wanikanji), and — in later phases —
[jed](https://github.com/bagustris/jed),
[kotoba](https://github.com/bagustris/kotoba)). Each app previously kept its
own copy of overlapping kanji/vocab data; this repo is the single source of
truth, consumed by each app as a **git submodule**.

This is **phase 2** of that consolidation: it holds what kanji-slideshow,
jlpt, kanji-drill, and wanikanji need. jed and kotoba have their own data
shapes (a full JMdict-backed dictionary, and context-grouped vocab
respectively) that will be folded in as later phases, without disturbing
what's here. (kotoba's learning engine is ported from kanji-drill's code,
but it has no data dependency on kanji-drill, so it may end up needing no
migration at all.)

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
hand-written sentences. Any redistribution of this repo's data should carry
CREDITS.md along with it.
