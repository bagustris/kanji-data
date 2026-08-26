# kanji-data

Canonical kanji/JLPT data shared across a family of Japanese-study apps
([kanji-slideshow](https://github.com/bagustris/kanji-slideshow),
[jlpt](https://github.com/bagustris/jlpt), and — in later phases —
[kanji-drill](https://github.com/bagustris/kanji-drill),
[jed](https://github.com/bagustris/jed),
[kotoba](https://github.com/bagustris/kotoba),
[wanikanji](https://github.com/bagustris/wanikanji)). Each app previously
kept its own copy of overlapping kanji/vocab data; this repo is the single
source of truth, consumed by each app as a **git submodule**.

This is **phase 1** of that consolidation: it currently holds what
kanji-slideshow and jlpt need. The other four apps have their own data
shapes (JMdict-backed dictionaries, context-grouped vocab, WaniKani-specific
fields, etc.) that will be folded in as later phases, without disturbing
what's here.

## Layout

```
kanji/     canonical, ready-to-use data
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

## Data sources & licensing

See [CREDITS.md](CREDITS.md). In short: `kanji_metadata.json` and the JLPT
CSVs are built from KANJIDIC2 and WaniKani-style enrichment (EDRDG licence,
CC BY-SA-compatible attribution required); `kradfile` is EDRDG's KRADFILE;
`examples.utf` is the Tanaka Corpus (via EDRDG's `JMdict_e_examp.xml`);
`accents_kanjium.txt` is the Kanjium pitch-accent database. Any
redistribution of this repo's data should carry CREDITS.md along with it.
