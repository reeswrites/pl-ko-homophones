import React, { useState, useMemo, useEffect } from "react";
import { polishG2P, koreanG2P, matchAll } from "./phonology.js";
import { PL, KO } from "./lexicon.js";
import { headGloss } from "./art.jsx";
import { useVoices, SpeakButton, Plate, Transcriber, Card } from "./components.jsx";

const EAR_COPY = {
  neutral: "Raw articulatory features — no listener's phonology applied. The strictest reading.",
  korean: "Korean categories. Polish /b d g v z ʐ/ fold into the plain series, /r/ and /l/ into ㄹ, /ɨ/ into ㅡ — so pairs a Pole keeps apart collapse together.",
  polish: "Polish categories. Korean's three-way plain/tense/aspirated contrast folds into one, ㅓ lands on /a/, ㅡ on /y/ — a different set of collapses, and a different answer.",
};

export default function App() {
  const [tab, setTab] = useState("pairs");
  const [ears, setEars] = useState("neutral");
  const [closeness, setCloseness] = useState(93);
  const [q, setQ] = useState("");
  const [hideLoans, setHideLoans] = useState(true);
  const [sort, setSort] = useState("match");
  const [limit, setLimit] = useState(40);
  const [playing, setPlaying] = useState(null);

  const voices = useVoices();
  const plVoice = useMemo(() => voices.find((v) => v.lang.toLowerCase().startsWith("pl")), [voices]);
  const koVoice = useMemo(() => voices.find((v) => v.lang.toLowerCase().startsWith("ko")), [voices]);

  const PLX = useMemo(() => PL.map(([w, g, loan]) => ({ w, g, loan, ph: polishG2P(w) })), []);
  const KOX = useMemo(() => KO.map(([w, g, loan]) => ({ w, g, loan, ph: koreanG2P(w) })), []);

  const threshold = 1 - closeness / 100;
  const raw = useMemo(() => matchAll(PLX, KOX, ears, threshold), [PLX, KOX, ears, threshold]);

  const pairs = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = raw.filter((r) => {
      const p = PLX[r.pi], k = KOX[r.ki];
      if (hideLoans && p.loan && k.loan) return false;
      if (!needle) return true;
      return (p.w + p.g + k.w + k.g).toLowerCase().includes(needle);
    });
    const key = {
      match: (r) => r.d,
      meaning: (r) => headGloss(PLX[r.pi].g).toLowerCase(),
      sound: (r) => PLX[r.pi].ph.join(""),
      length: (r) => PLX[r.pi].ph.length + r.d,
    }[sort];
    return out.slice().sort((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return a.d - b.d;
    });
  }, [raw, q, hideLoans, sort, PLX, KOX]);

  useEffect(() => { setLimit(40); }, [ears, closeness, q, hideLoans, sort]);

  const exact = pairs.filter((r) => r.d < 0.005).length;
  const ttsMissing = !plVoice || !koVoice;

  return (
    <div className="hf">
      <div className="hf-wrap">
        <header className="hf-head">
          <div className="hf-eyebrow">polski · 한국어 · cross-language homophones</div>
          <h1 className="hf-h1">
            <span className="a">One</span> sound,<br /><span className="b">two</span> languages
          </h1>
          <p className="hf-lede">
            Both lexicons are transcribed from spelling by rule — Polish voicing assimilation and
            final devoicing, Korean coda neutralisation, resyllabification and lenis voicing — then
            every Polish word is compared to every Korean word in a weighted{" "}
            <b>articulatory feature space</b>. Korean's simple syllable shape does most of the
            filtering: a word with a cluster or a final fricative has nowhere to land.
          </p>
          <div className="hf-tally">
            <div><span className="n" style={{ color: "var(--pl)" }}>{PLX.length}</span>
              <span className="l">Polish entries</span></div>
            <div><span className="n" style={{ color: "var(--ko)" }}>{KOX.length}</span>
              <span className="l">Korean entries</span></div>
            <div><span className="n">{(PLX.length * KOX.length).toLocaleString()}</span>
              <span className="l">pairs compared</span></div>
            <div><span className="n" style={{ color: "var(--both)" }}>{exact}</span>
              <span className="l">identical</span></div>
          </div>
        </header>

        <div className="hf-tabs" role="tablist">
          <button className="hf-tab" role="tab" aria-selected={tab === "pairs"}
            onClick={() => setTab("pairs")}>Pairs</button>
          <button className="hf-tab" role="tab" aria-selected={tab === "gallery"}
            onClick={() => setTab("gallery")}>Gallery</button>
          <button className="hf-tab" role="tab" aria-selected={tab === "transcribe"}
            onClick={() => setTab("transcribe")}>Transcribe anything</button>
        </div>

        {(tab === "pairs" || tab === "gallery") && (
          <>
            <div className="hf-ctl">
              <div className="hf-field">
                <span className="hf-lab">Whose ears?</span>
                <div className="hf-seg">
                  {[["neutral", "Neither"], ["korean", "Korean"], ["polish", "Polish"]].map(([v, l]) => (
                    <button key={v} aria-pressed={ears === v} onClick={() => setEars(v)}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="hf-field">
                <span className="hf-lab">Closeness ≥ {closeness}%</span>
                <input className="hf-slider" type="range" min="80" max="100" value={closeness}
                  onChange={(e) => setCloseness(+e.target.value)} aria-label="Minimum closeness" />
              </div>
              <div className="hf-field">
                <span className="hf-lab">Sort by</span>
                <div className="hf-seg">
                  {[["match", "Match"], ["meaning", "Meaning"], ["sound", "Sound"],
                    ["length", "Length"]].map(([v, l]) => (
                    <button key={v} aria-pressed={sort === v} onClick={() => setSort(v)}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="hf-field">
                <span className="hf-lab">Filter</span>
                <input className="hf-input" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="word or meaning" aria-label="Filter pairs" />
              </div>
              <label className="hf-check">
                <input type="checkbox" checked={hideLoans}
                  onChange={(e) => setHideLoans(e.target.checked)} />
                Hide shared loanwords
              </label>
            </div>

            <p className="hf-note">{EAR_COPY[ears]}</p>

            {ttsMissing && (
              <p className="hf-note" style={{
                background: "var(--pl-wash)", borderLeftColor: "var(--pl)"
              }}>
                {!plVoice && !koVoice ? "No Polish or Korean speech voices found on this device."
                  : !plVoice ? "No Polish speech voice found on this device."
                    : "No Korean speech voice found on this device."}{" "}
                Playback buttons for that language stay disabled. Adding the language under your
                operating system's speech or language settings makes its voice available here.
              </p>
            )}

            {pairs.length === 0 ? (
              <div className="hf-empty">
                Nothing at {closeness}% or above with this filter. Drag closeness down, or clear
                the filter box, to widen the net.
              </div>
            ) : (
              <>
                {tab === "gallery" ? (
                  <div className="hf-grid">
                    {pairs.slice(0, limit).map((r) => (
                      <Card key={r.pi + ":" + r.ki} p={PLX[r.pi]} k={KOX[r.ki]} d={r.d} ears={ears}
                        plVoice={plVoice} koVoice={koVoice} playing={playing} setPlaying={setPlaying} />
                    ))}
                  </div>
                ) : (
                  <div style={{ marginTop: 22 }}>
                    {pairs.slice(0, limit).map((r) => (
                      <Plate key={r.pi + ":" + r.ki} p={PLX[r.pi]} k={KOX[r.ki]} d={r.d} ears={ears}
                        plVoice={plVoice} koVoice={koVoice} playing={playing} setPlaying={setPlaying} />
                    ))}
                  </div>
                )}
                {limit < pairs.length && (
                  <button className="hf-more" onClick={() => setLimit((l) => l + 60)}>
                    Show 60 more · {pairs.length - limit} remaining
                  </button>
                )}
              </>
            )}
          </>
        )}

        {tab === "transcribe" && (
          <Transcriber plVoice={plVoice} koVoice={koVoice} playing={playing}
            setPlaying={setPlaying} PLX={PLX} KOX={KOX} ears={ears} />
        )}

        <footer className="hf-foot">
          <h3>What the numbers mean</h3>
          <p>
            Each pair is scored by edit distance over phone strings, where substituting one phone
            for another costs the weighted proportion of articulatory features they disagree on —
            major-class and manner features count double. The result is divided by the length of
            the longer word, so <code>100</code> means the two transcriptions are identical under
            the selected listener's phonology.
          </p>
          <h3>Why the direction matters</h3>
          <p>
            Cross-language homophony is asymmetric. A Korean listener assimilates Polish [b] and
            [p] to a single category, so <i>ból</i> and <i>pól</i> both arrive as 불; a Pole hears
            ㅂ, ㅃ and ㅍ as three stabs at one /p/. Switching ears changes which pairs merge, and
            the counts move with it.
          </p>
          <h3>Where it is rough</h3>
          <p>
            The lexicons are hand-built samples, not frequency-ranked corpora. Polish nasal vowels,
            Korean tensification after verb stems, and vowel-length are simplified. Feature-counting
            treats retroflex and alveolar as one step apart, which flatters some pairs. Real
            confirmation needs native listeners.
          </p>
        </footer>
      </div>
    </div>
  );
}
