import React, { useState, useMemo, useEffect } from "react";
import { polishG2P, koreanG2P, align, normalizeFor, dist } from "./phonology.js";
import { Art, headGloss } from "./art.jsx";

const Speaker = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7 2.5 3.8 5.2H1.5v5.6h2.3L7 13.5z" fill="currentColor" />
    <path d="M10 5.4a3.4 3.4 0 0 1 0 5.2M12.2 3.4a6.3 6.3 0 0 1 0 9.2"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices() || []);
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    const t = setTimeout(load, 700);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      clearTimeout(t);
    };
  }, []);
  return voices;
}

function SpeakButton({ text, lang, voice, id, playing, setPlaying }) {
  const on = playing === id;
  const speak = () => {
    if (!voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = 0.82;
    u.onend = () => setPlaying(null);
    u.onerror = () => setPlaying(null);
    setPlaying(id);
    window.speechSynthesis.speak(u);
  };
  return (
    <button className={"hf-speak" + (on ? " on" : "")} onClick={speak} disabled={!voice}
      title={voice ? `Play ${text} in ${lang}` : `No ${lang} voice installed`}
      aria-label={`Play ${text} in ${lang}`}>
      <Speaker />
    </button>
  );
}

function Strip({ cols }) {
  return (
    <div className="hf-strip" aria-hidden="true">
      {cols.map((c, i) => (
        <div className="hf-col" key={i}>
          <span className="hf-seg-a">{c.a || "·"}</span>
          <span className="hf-bar"><i style={{ "--s": Math.max(0.08, 1 - c.d) }} /></span>
          <span className="hf-seg-b">{c.b || "·"}</span>
        </div>
      ))}
    </div>
  );
}

function Plate({ p, k, d, ears, plVoice, koVoice, playing, setPlaying }) {
  const cols = useMemo(
    () => align(normalizeFor(p.ph, ears), normalizeFor(k.ph, ears)),
    [p, k, ears]
  );
  return (
    <div className="hf-plate">
      <div>
        <div className="hf-row">
          <SpeakButton text={p.w} lang="Polish" voice={plVoice} id={`p${p.w}${k.w}`}
            playing={playing} setPlaying={setPlaying} />
          <span className="hf-word pl">{p.w}</span>
          <span className="hf-ipa">[{p.ph.join("")}]</span>
          <span className="hf-gloss">{p.g}</span>
          {p.loan && <span className="hf-tag">loan</span>}
        </div>
        <Strip cols={cols} />
        <div className="hf-row">
          <SpeakButton text={k.w} lang="Korean" voice={koVoice} id={`k${p.w}${k.w}`}
            playing={playing} setPlaying={setPlaying} />
          <span className="hf-word ko">{k.w}</span>
          <span className="hf-ipa">[{k.ph.join("")}]</span>
          <span className="hf-gloss">{k.g}</span>
          {k.loan && <span className="hf-tag">loan</span>}
        </div>
      </div>
      <div className="hf-score">
        <b>{Math.round((1 - d) * 100)}</b>
        <span>match</span>
      </div>
    </div>
  );
}

function Transcriber({ plVoice, koVoice, playing, setPlaying, PLX, KOX, ears }) {
  const [pw, setPw] = useState("przyjaciel");
  const [kw, setKw] = useState("좋아요");
  const plPh = useMemo(() => { try { return polishG2P(pw); } catch { return []; } }, [pw]);
  const koPh = useMemo(() => { try { return koreanG2P(kw); } catch { return []; } }, [kw]);

  const nearest = (ph, list, lang) => {
    if (!ph.length) return null;
    const a = normalizeFor(ph, ears);
    let best = null;
    for (const x of list) {
      const d = dist(a, normalizeFor(x.ph, ears));
      if (!best || d < best.d) best = { d, x };
    }
    return best;
  };
  const nk = useMemo(() => nearest(plPh, KOX), [plPh, KOX, ears]);
  const np = useMemo(() => nearest(koPh, PLX), [koPh, PLX, ears]);

  return (
    <div className="hf-tr">
      <div>
        <div className="hf-lab" style={{ marginBottom: 8 }}>Polish spelling</div>
        <input className="hf-tr-in" value={pw} onChange={(e) => setPw(e.target.value)}
          spellCheck="false" aria-label="Polish word" />
        <div className="hf-out pl">{plPh.length ? `[${plPh.join("")}]` : ""}</div>
        <div style={{ marginTop: 10 }}>
          <SpeakButton text={pw} lang="Polish" voice={plVoice} id="tr-pl"
            playing={playing} setPlaying={setPlaying} />
        </div>
        {nk && <div className="hf-near">
          Closest Korean entry: <b style={{ color: "var(--ko)" }}>{nk.x.w}</b>{" "}
          [{nk.x.ph.join("")}] &lsquo;{nk.x.g}&rsquo; — {Math.round((1 - nk.d) * 100)}% match
        </div>}
      </div>
      <div>
        <div className="hf-lab" style={{ marginBottom: 8 }}>Korean (Hangul)</div>
        <input className="hf-tr-in" value={kw} onChange={(e) => setKw(e.target.value)}
          spellCheck="false" aria-label="Korean word" />
        <div className="hf-out ko">{koPh.length ? `[${koPh.join("")}]` : ""}</div>
        <div style={{ marginTop: 10 }}>
          <SpeakButton text={kw} lang="Korean" voice={koVoice} id="tr-ko"
            playing={playing} setPlaying={setPlaying} />
        </div>
        {np && <div className="hf-near">
          Closest Polish entry: <b style={{ color: "var(--pl)" }}>{np.x.w}</b>{" "}
          [{np.x.ph.join("")}] &lsquo;{np.x.g}&rsquo; — {Math.round((1 - np.d) * 100)}% match
        </div>}
      </div>
    </div>
  );
}

function Card({ p, k, d, ears, plVoice, koVoice, playing, setPlaying }) {
  const shared = useMemo(() => {
    const cols = align(normalizeFor(p.ph, ears), normalizeFor(k.ph, ears));
    return cols.map((c) => (c.d === 0 ? c.a : "·")).join("");
  }, [p, k, ears]);
  return (
    <figure className="hf-card">
      <div className="hf-art-pair">
        <div className="hf-art-cell pl"><Art gloss={p.g} ph={p.ph} /></div>
        <div className="hf-art-cell ko"><Art gloss={k.g} ph={k.ph} /></div>
      </div>
      <figcaption className="hf-card-body">
        <h3 className="hf-card-title">
          <span className="pl">{headGloss(p.g)}</span>
          <span className="sep">·</span>
          <span className="ko">{headGloss(k.g)}</span>
        </h3>
        <div className="hf-card-sound">[{shared}]</div>
        <div className="hf-card-words">
          <span>
            <SpeakButton text={p.w} lang="Polish" voice={plVoice} id={`gp${p.w}${k.w}`}
              playing={playing} setPlaying={setPlaying} />
            <b className="pl">{p.w}</b> <i>{p.ph.join("")}</i>
          </span>
          <span>
            <SpeakButton text={k.w} lang="Korean" voice={koVoice} id={`gk${p.w}${k.w}`}
              playing={playing} setPlaying={setPlaying} />
            <b className="ko">{k.w}</b> <i>{k.ph.join("")}</i>
          </span>
        </div>
        <div className="hf-card-score">{Math.round((1 - d) * 100)}</div>
      </figcaption>
    </figure>
  );
}

export { useVoices, Speaker, SpeakButton, Strip, Plate, Transcriber, Card };
