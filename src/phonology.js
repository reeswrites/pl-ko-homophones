// Rule-based G2P for Polish and Korean + weighted feature-distance matching.
// Every transcription here is derived from spelling by rule; nothing is looked up.
// ---------- Polish grapheme-to-phoneme ----------

const PL_VOWELS = new Set(["a", "e", "o", "u", "i", "ɨ", "ɛ", "ɔ", "ɔ̃", "ɛ̃"]);

// obstruent voicing pairs
const DEVOICE = {
  b: "p", d: "t", g: "k", v: "f", z: "s", ʐ: "ʂ", ʑ: "ɕ",
  "d͡z": "t͡s", "d͡ʐ": "t͡ʂ", "d͡ʑ": "t͡ɕ",
};
const VOICE = Object.fromEntries(Object.entries(DEVOICE).map(([a, b]) => [b, a]));
const VOICED_OBS = new Set(Object.keys(DEVOICE));
const VOICELESS_OBS = new Set(Object.keys(VOICE).concat(["x"]));
const isObstruent = (p) => VOICED_OBS.has(p) || VOICELESS_OBS.has(p);

// longest-match digraph table
const PL_MULTI = [
  ["dzi", "d͡ʑ", true],
  ["dź", "d͡ʑ", false],
  ["dż", "d͡ʐ", false],
  ["drz", null, false], // handled by parts
  ["dz", "d͡z", false],
  ["ch", "x", false],
  ["cz", "t͡ʂ", false],
  ["ci", "t͡ɕ", true],
  ["si", "ɕ", true],
  ["sz", "ʂ", false],
  ["zi", "ʑ", true],
  ["ni", "ɲ", true],
  ["rz", "ʐ", false],
];

const PL_SINGLE = {
  a: "a", á: "a", e: "ɛ", i: "i", o: "ɔ", u: "u", ó: "u", y: "ɨ",
  ą: "ɔ̃", ę: "ɛ̃",
  p: "p", b: "b", t: "t", d: "d", k: "k", g: "g",
  f: "f", w: "v", s: "s", z: "z", h: "x",
  c: "t͡s", ć: "t͡ɕ", ś: "ɕ", ź: "ʑ", ż: "ʐ", ń: "ɲ",
  m: "m", n: "n", l: "l", r: "r", ł: "w", j: "j",
  q: "k", v: "v", x: "ks",
};

function plTokenize(word) {
  const w = word.toLowerCase().trim();
  const out = [];
  let i = 0;
  while (i < w.length) {
    let matched = false;
    for (const [gr, ph, softening] of PL_MULTI) {
      if (ph === null) continue;
      if (w.startsWith(gr, i)) {
        if (softening) {
          // "ci/si/zi/ni/dzi" + vowel  ->  soft consonant alone
          // elsewhere -> soft consonant + [i]
          const next = w[i + gr.length];
          const beforeVowel = next && "aeouąę".includes(next);
          out.push(ph);
          if (!beforeVowel) out.push("i");
        } else {
          out.push(ph);
        }
        i += gr.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = w[i];
    if (PL_SINGLE[ch]) {
      const v = PL_SINGLE[ch];
      if (v === "ks") out.push("k", "s");
      else out.push(v);
    }
    i += 1;
  }
  return out;
}

function plPostprocess(ph) {
  let p = ph.slice();

  // 1. progressive devoicing: rz -> ʂ and w -> f after a voiceless obstruent
  for (let i = 1; i < p.length; i++) {
    if ((p[i] === "ʐ" || p[i] === "v") && VOICELESS_OBS.has(p[i - 1])) {
      p[i] = DEVOICE[p[i]];
    }
  }

  // 2. prevocalic /i/ after a consonant surfaces as the glide [j]
  for (let i = 1; i < p.length - 1; i++) {
    if (p[i] === "i" && !PL_VOWELS.has(p[i - 1]) && p[i - 1] !== "j" &&
        PL_VOWELS.has(p[i + 1])) p[i] = "j";
  }

  // 3. nasal vowels
  const out = [];
  for (let i = 0; i < p.length; i++) {
    const cur = p[i];
    if (cur !== "ɔ̃" && cur !== "ɛ̃") { out.push(cur); continue; }
    const base = cur === "ɔ̃" ? "ɔ" : "ɛ";
    const next = p[i + 1];
    const last = i === p.length - 1;
    if (last) {
      // word-final: ę -> [ɛ] (colloquial), ą -> [ɔ̃]
      out.push(base === "ɛ" ? "ɛ" : "ɔ̃");
    } else if (next === "l" || next === "w") {
      out.push(base);
    } else if (["p", "b"].includes(next)) {
      out.push(base, "m");
    } else if (["t", "d", "t͡s", "d͡z", "t͡ʂ", "d͡ʐ"].includes(next)) {
      out.push(base, "n");
    } else if (["t͡ɕ", "d͡ʑ"].includes(next)) {
      out.push(base, "ɲ");
    } else if (["k", "g"].includes(next)) {
      out.push(base, "ŋ");
    } else {
      // before fricatives: nasalized vowel
      out.push(base === "ɛ" ? "ɛ̃" : "ɔ̃");
    }
  }
  p = out;

  // 4. n -> ŋ before velars
  for (let i = 0; i < p.length - 1; i++) {
    if (p[i] === "n" && ["k", "g"].includes(p[i + 1])) p[i] = "ŋ";
  }

  // 5. regressive voicing assimilation inside obstruent clusters
  for (let i = p.length - 2; i >= 0; i--) {
    if (isObstruent(p[i]) && isObstruent(p[i + 1])) {
      const rightVoiced = VOICED_OBS.has(p[i + 1]);
      if (rightVoiced && VOICELESS_OBS.has(p[i]) && VOICE[p[i]]) p[i] = VOICE[p[i]];
      else if (!rightVoiced && VOICED_OBS.has(p[i])) p[i] = DEVOICE[p[i]];
    }
  }

  // 6. word-final devoicing
  const lastIdx = p.length - 1;
  if (lastIdx >= 0 && VOICED_OBS.has(p[lastIdx])) p[lastIdx] = DEVOICE[p[lastIdx]];

  return p;
}

function polishG2P(word) {
  return plPostprocess(plTokenize(word));
}

// ---------- Korean grapheme-to-phoneme ----------

const CHO = ["ᄀ","ᄁ","ᄂ","ᄃ","ᄄ","ᄅ","ᄆ","ᄇ","ᄈ","ᄉ","ᄊ","ᄋ","ᄌ","ᄍ","ᄎ","ᄏ","ᄐ","ᄑ","ᄒ"];
const CHO_ID = ["k","kk","n","t","tt","l","m","p","pp","s","ss","","c","cc","ch","kh","th","ph","h"];
const JUNG_ID = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","weo","we","wi","yu","eu","ui","i"];
const JONG_ID = ["","k","kk","ks","n","nc","nh","t","l","lk","lm","lp","ls","lth","lph","lh","m","p","ps","s","ss","ng","c","ch","kh","th","ph","h"];

// vowel id -> phone sequence
const VOWEL_PH = {
  a: ["a"], ae: ["ɛ"], ya: ["j", "a"], yae: ["j", "ɛ"],
  eo: ["ʌ"], e: ["e"], yeo: ["j", "ʌ"], ye: ["j", "e"],
  o: ["o"], wa: ["w", "a"], wae: ["w", "ɛ"], oe: ["w", "e"],
  yo: ["j", "o"], u: ["u"], weo: ["w", "ʌ"], we: ["w", "e"],
  wi: ["w", "i"], yu: ["j", "u"], eu: ["ɯ"], ui: ["ɯ", "i"], i: ["i"],
};

// onset id -> phone (lenis given as plain voiceless; voicing applied later)
const ONSET_PH = {
  k: "k", kk: "k͈", n: "n", t: "t", tt: "t͈", l: "ɾ", m: "m",
  p: "p", pp: "p͈", s: "s", ss: "s͈", "": null, c: "t͡ɕ", cc: "t͡ɕ͈",
  ch: "t͡ɕʰ", kh: "kʰ", th: "tʰ", ph: "pʰ", h: "h",
};

// coda id -> neutralized coda id (7-way)
const CODA_NEUT = {
  "": "", k: "k", kk: "k", ks: "k", lk: "k", kh: "k",
  n: "n", nc: "n", nh: "n",
  t: "t", s: "t", ss: "t", c: "t", ch: "t", th: "t", h: "t",
  l: "l", lp: "l", ls: "l", lth: "l", lh: "l",
  m: "m", lm: "m",
  p: "p", ps: "p", ph: "p", lph: "p",
  ng: "ng",
};
const CODA_PH = { "": null, k: "k", n: "n", t: "t", l: "l", m: "m", p: "p", ng: "ŋ" };

// complex coda -> [stays, moves] when resyllabifying before ㅇ
const CODA_SPLIT = {
  ks: ["k", "s"], nc: ["n", "c"], nh: ["n", "h"], lk: ["l", "k"],
  lm: ["l", "m"], lp: ["l", "p"], ls: ["l", "s"], lth: ["l", "th"],
  lph: ["l", "ph"], lh: ["l", "h"], ps: ["p", "s"],
};

const LENIS = { k: "kk", t: "tt", p: "pp", s: "ss", c: "cc" };
const ASPIRATE = { k: "kh", t: "th", p: "ph", c: "ch" };
const VOICED = { k: "g", t: "d", p: "b", "t͡ɕ": "d͡ʑ" };

function decompose(text) {
  const syls = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) continue;
    const cho = Math.floor(code / 588);
    const jung = Math.floor((code % 588) / 28);
    const jong = code % 28;
    syls.push({ on: CHO_ID[cho], nu: JUNG_ID[jung], co: JONG_ID[jong] });
  }
  return syls;
}

function koreanG2P(word) {
  const s = decompose(word);
  if (!s.length) return [];

  // --- phonological rules over the syllable string ---
  for (let i = 0; i < s.length - 1; i++) {
    const cur = s[i], nxt = s[i + 1];

    // ㅎ + lenis -> aspiration (both directions)
    if (cur.co === "h" && ASPIRATE[nxt.on]) { cur.co = ""; nxt.on = ASPIRATE[nxt.on]; continue; }
    if (cur.co === "nh" || cur.co === "lh") {
      if (ASPIRATE[nxt.on]) { cur.co = cur.co[0]; nxt.on = ASPIRATE[nxt.on]; continue; }
    }
    if (nxt.on === "h" && ASPIRATE[CODA_NEUT[cur.co]]) {
      nxt.on = ASPIRATE[CODA_NEUT[cur.co]]; cur.co = ""; continue;
    }

    // ㄷ/ㅌ + 이 -> [t͡ɕ]/[t͡ɕʰ]
    if (nxt.on === "" && ["t", "th"].includes(cur.co) && ["i", "ya", "yeo", "yo", "yu"].includes(nxt.nu)) {
      nxt.on = cur.co === "t" ? "c" : "ch"; cur.co = ""; continue;
    }

    // resyllabification before ㅇ
    if (nxt.on === "" && cur.co) {
      if (CODA_SPLIT[cur.co]) {
        const [stay, move] = CODA_SPLIT[cur.co];
        cur.co = stay; nxt.on = move === "h" ? "" : move;
      } else if (cur.co !== "ng") {
        nxt.on = cur.co; cur.co = "";
      }
      continue;
    }

    const nc = CODA_NEUT[cur.co];

    // nasalization: obstruent coda before nasal onset
    if (["n", "m"].includes(nxt.on) && ["k", "t", "p"].includes(nc)) {
      cur.co = { k: "ng", t: "n", p: "m" }[nc];
      continue;
    }
    // ㄹ onset assimilation
    if (nxt.on === "l") {
      if (nc === "n") { cur.co = "l"; continue; }        // 신라 -> 실라
      if (nc === "l") { continue; }                       // 달래
      if (["k", "p"].includes(nc)) { cur.co = nc === "k" ? "ng" : "m"; nxt.on = "n"; continue; }
      if (["m", "ng"].includes(nc)) { nxt.on = "n"; continue; }
    }
    // ㄹ coda + ㄴ onset -> ll
    if (nc === "l" && nxt.on === "n") { nxt.on = "l"; continue; }

    // tensification after an obstruent coda, incl. clusters like ㄵ ㄼ ㄽ
    const clusterObs = ["nc", "ls", "lth", "lp", "ks", "ps", "lk"].includes(cur.co);
    if ((["k", "t", "p"].includes(nc) || clusterObs) && LENIS[nxt.on]) {
      nxt.on = LENIS[nxt.on]; continue;
    }
  }

  // --- spell out phones ---
  const ph = [];
  s.forEach((syl, i) => {
    let onset = ONSET_PH[syl.on];
    if (onset) {
      // lenis stops/affricate voice intervocalically & after nasal/liquid
      if (VOICED[onset] && i > 0) {
        const prev = ph[ph.length - 1];
        if (prev && ["a","ɛ","ʌ","e","o","u","ɯ","i","j","w","m","n","ŋ","l","ɾ"].includes(prev)) {
          onset = VOICED[onset];
        }
      }
      // ㄹ after a lateral coda is [l], not the intervocalic tap
      if (onset === "ɾ" && ph[ph.length - 1] === "l") onset = "l";
      // ㅅ -> [ɕ] before i / j
      const nucFirst = VOWEL_PH[syl.nu][0];
      if (onset === "s" && (nucFirst === "i" || nucFirst === "j")) onset = "ɕ";
      if (onset === "s͈" && (nucFirst === "i" || nucFirst === "j")) onset = "ɕ͈";
      // ㅎ deletes between sonorants
      const prevPh = ph[ph.length - 1];
      const sonorous = prevPh && ["a","ɛ","e","ʌ","o","u","ɯ","i","j","w","m","n","ŋ","l","ɾ"].includes(prevPh);
      if (!(onset === "h" && sonorous)) ph.push(onset);
    }
    VOWEL_PH[syl.nu].forEach((v) => ph.push(v));
    const c = CODA_PH[CODA_NEUT[syl.co]];
    if (c) ph.push(c);
  });
  return ph;
}

// ---------- articulatory features ----------
// syl cons son cont nas lat voi sg cg lab cor ant dor high low back rnd
const FEAT_NAMES = ["syl","cons","son","cont","nas","lat","voi","sg","cg","lab","cor","ant","dor","high","low","back","round","tense"];
// major-class and manner features dominate perception; place/laryngeal are finer
const FEAT_W = { syl:2, cons:2, son:2, cont:2, nas:2, lat:2, voi:1, sg:1, cg:1,
                 lab:1, cor:1, ant:1, dor:1, high:1, low:1, back:1, round:1, tense:1 };
const W = FEAT_NAMES.map((n) => FEAT_W[n]);
const WSUM = W.reduce((a, b) => a + b, 0);
function mk(o) {
  return FEAT_NAMES.map((n) => (o[n] === undefined ? 0 : o[n] ? 1 : -1));
}
const TBL = {};
function def(sym, o) { TBL[sym] = mk(o); }

// obstruent stops & affricates
const stop = (lab, cor, ant, dor, voi, sg, cg, cont, strid) => ({
  syl: 0, cons: 1, son: 0, cont, nas: 0, lat: 0, voi, sg, cg, lab, cor, ant, dor,
});
def("p",  stop(1,0,0,0, 0,0,0, 0));
def("b",  stop(1,0,0,0, 1,0,0, 0));
def("pʰ", stop(1,0,0,0, 0,1,0, 0));
def("p͈", stop(1,0,0,0, 0,0,1, 0));
def("t",  stop(0,1,1,0, 0,0,0, 0));
def("d",  stop(0,1,1,0, 1,0,0, 0));
def("tʰ", stop(0,1,1,0, 0,1,0, 0));
def("t͈", stop(0,1,1,0, 0,0,1, 0));
def("k",  stop(0,0,0,1, 0,0,0, 0));
def("g",  stop(0,0,0,1, 1,0,0, 0));
def("kʰ", stop(0,0,0,1, 0,1,0, 0));
def("k͈", stop(0,0,0,1, 0,0,1, 0));
// affricates: [-cont] but coronal strident
def("t͡s", stop(0,1,1,0, 0,0,0, 0));
def("d͡z", stop(0,1,1,0, 1,0,0, 0));
def("t͡ʂ", stop(0,1,0,0, 0,0,0, 0));
def("d͡ʐ", stop(0,1,0,0, 1,0,0, 0));
def("t͡ɕ", stop(0,1,0,1, 0,0,0, 0));
def("d͡ʑ", stop(0,1,0,1, 1,0,0, 0));
def("t͡ɕʰ",stop(0,1,0,1, 0,1,0, 0));
def("t͡ɕ͈",stop(0,1,0,1, 0,0,1, 0));
// fricatives
def("f",  stop(1,0,0,0, 0,0,0, 1));
def("v",  stop(1,0,0,0, 1,0,0, 1));
def("s",  stop(0,1,1,0, 0,0,0, 1));
def("z",  stop(0,1,1,0, 1,0,0, 1));
def("s͈", stop(0,1,1,0, 0,0,1, 1));
def("ʂ",  stop(0,1,0,0, 0,0,0, 1));
def("ʐ",  stop(0,1,0,0, 1,0,0, 1));
def("ɕ",  stop(0,1,0,1, 0,0,0, 1));
def("ʑ",  stop(0,1,0,1, 1,0,0, 1));
def("ɕ͈", stop(0,1,0,1, 0,0,1, 1));
def("x",  stop(0,0,0,1, 0,0,0, 1));
def("h",  { syl:0, cons:1, son:0, cont:1, nas:0, lat:0, voi:0, sg:1, cg:0, lab:0, cor:0, ant:0, dor:0 });
// nasals
def("m", { syl:0, cons:1, son:1, cont:0, nas:1, lat:0, voi:1, sg:0, cg:0, lab:1, cor:0, ant:0, dor:0 });
def("n", { syl:0, cons:1, son:1, cont:0, nas:1, lat:0, voi:1, sg:0, cg:0, lab:0, cor:1, ant:1, dor:0 });
def("ɲ", { syl:0, cons:1, son:1, cont:0, nas:1, lat:0, voi:1, sg:0, cg:0, lab:0, cor:1, ant:0, dor:1, high:1 });
def("ŋ", { syl:0, cons:1, son:1, cont:0, nas:1, lat:0, voi:1, sg:0, cg:0, lab:0, cor:0, ant:0, dor:1, high:1, back:1 });
// liquids
def("l", { syl:0, cons:1, son:1, cont:1, nas:0, lat:1, voi:1, sg:0, cg:0, lab:0, cor:1, ant:1, dor:0 });
def("r", { syl:0, cons:1, son:1, cont:1, nas:0, lat:0, voi:1, sg:0, cg:0, lab:0, cor:1, ant:1, dor:0 });
def("ɾ", { syl:0, cons:1, son:1, cont:0, nas:0, lat:0, voi:1, sg:0, cg:0, lab:0, cor:1, ant:1, dor:0 });
// glides
def("j", { syl:0, cons:0, son:1, cont:1, nas:0, lat:0, voi:1, sg:0, cg:0, lab:0, cor:0, ant:0, dor:1, high:1, low:0, back:0, round:0 });
def("w", { syl:0, cons:0, son:1, cont:1, nas:0, lat:0, voi:1, sg:0, cg:0, lab:1, cor:0, ant:0, dor:1, high:1, low:0, back:1, round:1 });
// vowels
const V = (high, low, back, round, tense = 1) => ({ syl:1, cons:0, son:1, cont:1, nas:0, lat:0, voi:1, sg:0, cg:0, lab:round, cor:0, ant:0, dor:1, high, low, back, round, tense });
def("i", V(1,0,0,0));
def("ɨ", V(1,0,0,0,0));   // Polish y — central; distinguished from i by 'back' below
TBL["ɨ"] = mk(V(1,0,0,0)); TBL["ɨ"][FEAT_NAMES.indexOf("back")] = 0;
def("ɯ", V(1,0,1,0));
def("e", V(0,0,0,0));
def("ɛ", V(0,0,0,0,0));
def("a", V(0,1,1,0,0));
def("ʌ", V(0,0,1,0,0));
def("o", V(0,0,1,1));
def("ɔ", V(0,0,1,1,0));
def("u", V(1,0,1,1));
def("ɛ̃", { ...V(0,0,0,0,0), nas: 1 });
def("ɔ̃", { ...V(0,0,1,1,0), nas: 1 });

const NF = FEAT_NAMES.length;
function phoneDist(a, b) {
  if (a === b) return 0;
  const fa = TBL[a], fb = TBL[b];
  if (!fa || !fb) return 1;
  let d = 0;
  for (let i = 0; i < NF; i++) d += (Math.abs(fa[i] - fb[i]) / 2) * W[i];
  return d / WSUM;
}

// How each listener's phonology folds the other language's sounds into its own
// categories. Applied to BOTH strings: a listener has only one perceptual space.
const EARS = {
  neutral: {},
  korean: {
    b:"p", d:"t", g:"k", "d͡z":"t͡ɕ", "t͡s":"t͡ɕ", "d͡ʐ":"t͡ɕ", "t͡ʂ":"t͡ɕ", "d͡ʑ":"t͡ɕ",
    v:"p", f:"p", z:"s", ʐ:"s", ʂ:"s", ʑ:"ɕ", x:"h",
    r:"l", ɾ:"l", ɲ:"n", ɨ:"ɯ", ɔ:"o", "ɔ̃":"o", ɛ:"e", "ɛ̃":"e",
    stripLaryngeal: true,
  },
  polish: {
    ɯ:"ɨ", ʌ:"a", o:"ɔ", e:"ɛ", h:"x", ɾ:"r", "ɔ̃":"ɔ", "ɛ̃":"ɛ",
    stripLaryngeal: true,
  },
};

function seqDist(A, B, ears = "neutral") {
  const map = EARS[ears] || {};
  const norm = (p) => {
    let q = p;
    if (map.stripLaryngeal) q = q.replace(/ʰ/g, "").replace(/͈/g, "");
    return map[q] || q;
  };
  const a = A.map(norm), b = B.map(norm);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i][0] = i;
  for (let j = 1; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + phoneDist(a[i - 1], b[j - 1])
      );
  return dp[n][m] / Math.max(n, m);
}


// ---------- optimized batch matching ----------
const _dcache = new Map();
function pd(a, b) {
  if (a === b) return 0;
  const k = a + "\u0000" + b;
  let v = _dcache.get(k);
  if (v === undefined) { v = phoneDist(a, b); _dcache.set(k, v); }
  return v;
}

function normalizeFor(ph, ears) {
  const map = EARS[ears] || {};
  return ph.map((p) => {
    let q = p;
    if (map.stripLaryngeal) q = q.replace(/ʰ/g, "").replace(/͈/g, "");
    return map[q] || q;
  });
}

function dist(a, b) {
  const n = a.length, m = b.length;
  if (!n || !m) return 1;
  let prev = new Float64Array(m + 1), cur = new Float64Array(m + 1);
  for (let j = 0; j <= m; j++) prev[j] = j;
  for (let i = 1; i <= n; i++) {
    cur[0] = i;
    const ai = a[i - 1];
    for (let j = 1; j <= m; j++) {
      const sub = prev[j - 1] + pd(ai, b[j - 1]);
      const del = prev[j] + 1, ins = cur[j - 1] + 1;
      cur[j] = sub < del ? (sub < ins ? sub : ins) : (del < ins ? del : ins);
    }
    const t = prev; prev = cur; cur = t;
  }
  return prev[m] / Math.max(n, m);
}

// DP traceback, for showing which phones lined up
function align(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 1; i <= n; i++) dp[i][0] = i;
  for (let j = 1; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = Math.min(dp[i-1][j-1] + pd(a[i-1], b[j-1]), dp[i-1][j] + 1, dp[i][j-1] + 1);
  const out = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && Math.abs(dp[i][j] - (dp[i-1][j-1] + pd(a[i-1], b[j-1]))) < 1e-9) {
      out.push({ a: a[i-1], b: b[j-1], d: pd(a[i-1], b[j-1]) }); i--; j--;
    } else if (i > 0 && Math.abs(dp[i][j] - (dp[i-1][j] + 1)) < 1e-9) {
      out.push({ a: a[i-1], b: null, d: 1 }); i--;
    } else { out.push({ a: null, b: b[j-1], d: 1 }); j--; }
  }
  return out.reverse();
}

function matchAll(P, K, ears, threshold) {
  const pn = P.map((x) => normalizeFor(x.ph, ears));
  const kn = K.map((x) => normalizeFor(x.ph, ears));
  const res = [];
  for (let i = 0; i < P.length; i++) {
    const a = pn[i], la = a.length;
    for (let j = 0; j < K.length; j++) {
      const b = kn[j], lb = b.length;
      const mx = la > lb ? la : lb;
      if (Math.abs(la - lb) / mx > threshold) continue;   // length prefilter
      const d = dist(a, b);
      if (d <= threshold) res.push({ pi: i, ki: j, d });
    }
  }
  res.sort((x, y) => x.d - y.d);
  return res;
}


export { polishG2P, koreanG2P, matchAll, align, normalizeFor, dist,
         phoneDist, TBL, FEAT_NAMES, FEAT_W, EARS };
