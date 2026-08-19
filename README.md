# One sound, two languages

Finds phonetic homophones between Polish and Korean. Both lexicons are transcribed
from spelling **by rule** — nothing is looked up — and then every Polish word is
compared to every Korean word in a weighted articulatory feature space. Speech
playback runs in the browser via the Web Speech API.

Everything is client-side. No API keys, no backend, no network calls at runtime
beyond the webfont request.

```
npm install
npm run dev      # http://localhost:5173
npm test         # 13 phonology regression tests
npm run build    # -> dist/
```

## Deploying to GitHub Pages

1. Push this repo to GitHub with `main` as the default branch.
2. Go to **Settings → Pages → Build and deployment** and set **Source** to
   **GitHub Actions**. This step is easy to miss and nothing deploys without it.
3. Push to `main`. `.github/workflows/deploy.yml` runs the tests, builds, and
   publishes. The URL appears in the workflow summary and under Settings → Pages.

You do not need to edit `vite.config.js`. GitHub Pages serves project sites from
`https://<owner>.github.io/<repo>/`, so the bundle needs a matching base path;
the config reads `GITHUB_REPOSITORY` (set automatically in Actions) and works it
out. Forks and renames are handled, and a repo named `<owner>.github.io` correctly
gets `/` instead.

Tagging `v1.0.0` triggers `release.yml`, which builds with a relative base path
(`BASE_PATH=./`) and attaches a portable zip to a GitHub Release. Pull requests
run `ci.yml` against Node 20 and 22.

## What the code does

**`src/phonology.js`** — the engine, and the only file with real domain logic.

*Polish:* longest-match digraph parsing, the soft-consonant rule (`ci/si/zi/ni/dzi`
+ vowel yields a bare palatal, elsewhere it keeps its `[i]`), prevocalic `/i/` to
`[j]`, nasal vowels resolved by the following segment, progressive devoicing of
`rz` and `w` after voiceless obstruents, regressive voicing assimilation across
obstruent clusters, and word-final devoicing.

*Korean:* Hangul syllable decomposition by Unicode arithmetic, then coda
neutralisation to the seven-way set, resyllabification before `ㅇ`, nasal
assimilation, lateralisation, `ㅎ` aspiration and intervocalic deletion,
`ㄷ/ㅌ` palatalisation before `이`, tensification, and — the rule that matters
most for matching Polish — lenis stop voicing between sonorants.

*Scoring:* weighted edit distance over phone strings. Substitution costs the
proportion of the 18 articulatory features two phones disagree on, with
major-class and manner features weighted double; the total is normalised by the
longer word. A length prefilter skips pairs that cannot come under threshold, so
a full 208,250-pair sweep takes about 130 ms.

**`src/lexicon.js`** — 490 Polish and 425 Korean entries with glosses. These are
hand-built samples, not frequency-ranked corpora. To scale up, replace the two
arrays with OpenSubtitles frequency lists in the same `[word, gloss, isLoan?]`
shape. Nothing else needs to change.

**`src/art.jsx`** — 134 hand-drawn SVG concept icons plus a synonym table,
covering about 82% of the concepts that appear in high-scoring pairs. The rest
are function words like *there*, *whom* and *nor*, which have no picture; those
fall through to a **sonority contour** — a plot of the word's own phonetic shape,
one point per phone, height by sonority. When the meaning cannot be drawn, the
sound is.

**`src/components.jsx`**, **`src/App.jsx`** — presentation, speech synthesis, and
the filter/sort state.

## Whose ears?

Cross-language homophony is asymmetric, and the **Whose ears?** control is the
point of the whole thing. A listener has one perceptual space, so the selected
phonology is applied to both sides before comparing.

| Listener | Identical pairs |
| --- | --- |
| Neither (raw features) | 12 |
| Korean | 26 |
| Polish | 18 |

A Korean listener folds Polish `/b d g v z ʐ/` into the plain series and `/r l/`
into `ㄹ`, so *ból* arrives as both 불 and 풀. A Polish listener collapses Korean's
three-way plain/tense/aspirated contrast and has no `/ʌ/`, so *tak* picks up 떡 —
a merger the Korean direction never produces. Same 208,250 comparisons, different
answers.

## Known limits

The lexicons are samples rather than corpora. Polish nasal vowels, Korean
tensification in verb stems, and vowel length are simplified. Feature counting
treats retroflex and alveolar as one step apart, which flatters pairs like
*szary* ~ 다리. Real confirmation needs native listeners; perceptual assimilation
models (Best's PAM, Flege's SLM) are the framework for doing it properly.

Speech playback depends on voices installed at the OS level. Chrome and Edge
usually ship both Polish and Korean; Safari needs them added in system settings.
The app reports which language is missing rather than failing silently.

## Licence

MIT. See `LICENSE`.
