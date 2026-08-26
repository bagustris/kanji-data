# Credits & data attribution

## JMdict / KANJIDIC2 (`kanji/kanji_metadata.json`, `kanji/kanji_n{1-5}.csv`)

> This project uses the JMdict, KANJIDIC and related dictionary files. These
> files are the property of the [Electronic Dictionary Research and
> Development Group (EDRDG)](https://www.edrdg.org/), and are used in
> conformance with the Group's licence.

- Copyright © Electronic Dictionary Research and Development Group.
- Licence: **Creative Commons Attribution-ShareAlike 4.0 International
  (CC BY-SA 4.0)** — <https://creativecommons.org/licenses/by-sa/4.0/>
- EDRDG licence statement: <https://www.edrdg.org/edrdg/licence.html>
- KANJIDIC project: <https://www.edrdg.org/wiki/index.php/KANJIDIC_Project>

`kanji_metadata.json` additionally carries WaniKani-style level/meaning/
reading/radical fields (`wk_*`) layered on top of the KANJIDIC2 facts.
"WaniKani" is a product of [Tofugu / WaniKani](https://www.wanikani.com/);
this data is used for educational, non-commercial study purposes and this
project is not affiliated with or endorsed by WaniKani.

Because this data is CC BY-SA, redistributing it (or derived works) must
keep this attribution and remain under a compatible share-alike licence.

## KRADFILE (`sources/kradfile`)

Kanji-to-radical decomposition table, originally compiled by Jim Rose at
Kanji Cafe (`KRADFILE2`), now maintained by EDRDG.

- Licence: EDRDG licence (as above), CC BY-SA 4.0-compatible.
- <https://www.edrdg.org/krad/kradinf.html>

## Tanaka Corpus (`sources/examples.utf`)

Indexed example sentences, originally from the Tanaka Corpus
(<https://tatoeba.org/>), distributed by EDRDG as part of
`JMdict_e_examp.xml`. Used here in its original per-word-indexed form to
back the `sentence`/`kana`/`translation` columns in `kanji_n{1-5}.csv`.

- Licence: EDRDG licence (as above), CC BY-SA 4.0-compatible.

## Kanjium pitch-accent database (`sources/accents_kanjium.txt`)

Word/reading → pitch-accent-kernel-position data, from the
[Kanjium](https://github.com/mifunetoshiro/kanjium) project by
mifunetoshiro. Used by `scripts/add_pitch_accent.py` to annotate compound
readings in `kanji_n{1-5}.csv` with their pitch accent. Kanjium does not
publish a formal licence file; it's widely reused by other Japanese-study
tooling (e.g. Yomichan/Yomitan) on an attribution basis — verify current
terms at the source repo before any redistribution beyond this project's
own apps.

## What is NOT from any workbook

Kanji readings, meanings, and JLPT-level assignments are language facts
taken from the dictionaries above, not transcribed from any commercial
workbook or app.

## License note

Any redistribution of this repo's `kanji/` or `sources/` directories should
carry this file along with it.
