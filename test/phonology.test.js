import test from "node:test";
import assert from "node:assert/strict";
import {
  polishG2P, koreanG2P, normalizeFor, dist, matchAll, align,
} from "../src/phonology.js";
import { PL, KO } from "../src/lexicon.js";

const pl = (w) => polishG2P(w).join("");
const ko = (w) => koreanG2P(w).join("");

test("Polish: digraphs and soft consonants", () => {
  assert.equal(pl("cisza"), "t͡ɕiʂa");        // ci + consonant keeps [i]
  assert.equal(pl("ciasto"), "t͡ɕastɔ");      // ci + vowel drops it
  assert.equal(pl("dziecko"), "d͡ʑɛt͡skɔ");
  assert.equal(pl("szczęście"), "ʂt͡ʂɛ̃ɕt͡ɕɛ");
});

test("Polish: voicing assimilation and final devoicing", () => {
  assert.equal(pl("przez"), "pʂɛs");         // rz devoices after /p/, final z -> s
  assert.equal(pl("wtorek"), "ftɔrɛk");      // w -> f before voiceless
  assert.equal(pl("prośba"), "prɔʑba");      // regressive voicing: ś -> ź
  assert.equal(pl("chleb"), "xlɛp");         // final b -> p
  assert.equal(pl("kwiat"), "kfjat");        // w -> f, prevocalic i -> j
});

test("Polish: nasal vowels resolve by following segment", () => {
  assert.equal(pl("ręka"), "rɛŋka");         // before velar
  assert.equal(pl("wąż"), "vɔ̃ʂ");            // before fricative
  assert.equal(pl("się"), "ɕɛ");             // word-final ę
});

test("Korean: coda neutralisation and resyllabification", () => {
  assert.equal(ko("닭"), "tak");
  assert.equal(ko("옷"), "ot");
  assert.equal(ko("밥이"), "pabi");           // coda moves to onset, then voices
  assert.equal(ko("한국어"), "hangugʌ");
});

test("Korean: assimilation rules", () => {
  assert.equal(ko("신라"), "ɕilla");          // lateralisation
  assert.equal(ko("설날"), "sʌllal");
  assert.equal(ko("국물"), "kuŋmul");         // nasalisation
  assert.equal(ko("종로"), "t͡ɕoŋno");
  assert.equal(ko("같이"), "kat͡ɕʰi");         // palatalisation before 이
  assert.equal(ko("좋다"), "t͡ɕotʰa");         // ㅎ + ㄷ aspiration
  assert.equal(ko("좋아요"), "t͡ɕoajo");       // ㅎ deletes between sonorants
  assert.equal(ko("읽다"), "ikt͈a");           // tensification
  assert.equal(ko("앉다"), "ant͈a");
});

test("Korean: lenis stops voice between sonorants only", () => {
  assert.equal(ko("바보"), "pabo");
  assert.equal(ko("시간"), "ɕigan");           // ㅅ -> [ɕ] before /i/
  assert.equal(ko("밥"), "pap");
});

test("distance is a normalised metric in [0,1]", () => {
  const a = polishG2P("sam"), b = koreanG2P("삼");
  assert.equal(dist(a, b), 0);
  assert.equal(dist(a, a), 0);
  const d = dist(polishG2P("przyjaciel"), koreanG2P("물"));
  assert.ok(d > 0 && d <= 1, `expected 0 < ${d} <= 1`);
});

test("known homophone pairs score identical", () => {
  const pairs = [["sól", "술"], ["mól", "물"], ["pan", "반"], ["kasa", "가사"],
                 ["jak", "약"], ["kim", "김"], ["sam", "삼"], ["tak", "닭"]];
  for (const [p, k] of pairs) {
    assert.equal(dist(polishG2P(p), koreanG2P(k)), 0, `${p} ~ ${k}`);
  }
});

test("Polish trill vs Korean tap separates only in raw features", () => {
  // nara [nara] vs 나라 [naɾa]: /r/ is [+continuant], /ɾ/ is not, so the raw
  // feature space keeps them apart. Either listener maps both to one rhotic.
  const raw = dist(polishG2P("nara"), koreanG2P("나라"));
  assert.ok(raw > 0 && raw < 0.05, `expected a near miss, got ${raw}`);
  for (const ears of ["korean", "polish"]) {
    assert.equal(
      dist(normalizeFor(polishG2P("nara"), ears), normalizeFor(koreanG2P("나라"), ears)),
      0, `should merge under ${ears} ears`
    );
  }
});

test("perceptual assimilation is asymmetric", () => {
  const P = PL.map(([w, g, loan]) => ({ w, g, loan, ph: polishG2P(w) }));
  const K = KO.map(([w, g, loan]) => ({ w, g, loan, ph: koreanG2P(w) }));
  const exact = (ears) => matchAll(P, K, ears, 0.001).length;
  const [n, kr, po] = [exact("neutral"), exact("korean"), exact("polish")];
  assert.ok(kr > n, "Korean ears should merge more than raw features");
  assert.ok(po > n, "Polish ears should merge more than raw features");
  assert.notEqual(kr, po, "the two directions should not agree");
});

test("Korean ears collapse the Polish voicing contrast", () => {
  const bul = normalizeFor(polishG2P("ból"), "korean");
  assert.equal(dist(bul, normalizeFor(koreanG2P("불"), "korean")), 0);
  assert.equal(dist(bul, normalizeFor(koreanG2P("풀"), "korean")), 0);
  assert.ok(dist(polishG2P("ból"), koreanG2P("풀")) > 0, "but not in raw features");
});

test("every lexicon entry transcribes to something", () => {
  for (const [w] of PL) assert.ok(polishG2P(w).length > 0, `Polish: ${w}`);
  for (const [w] of KO) assert.ok(koreanG2P(w).length > 0, `Korean: ${w}`);
});

test("align returns a column per edit and reconstructs both strings", () => {
  const a = polishG2P("kot"), b = koreanG2P("곳");
  const cols = align(a, b);
  assert.equal(cols.filter((c) => c.a).map((c) => c.a).join(""), a.join(""));
  assert.equal(cols.filter((c) => c.b).map((c) => c.b).join(""), b.join(""));
});
