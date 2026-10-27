// Тесты BalaGoBG042 (node --test scripts/campaign50/bg-042/bg042.test.mjs):
// реплики дословно по утверждённому сценарию, Бишкек и оба CTA в голосе,
// надписи финала, номер WhatsApp, обращение и запрещённые обещания, титры,
// шкала финала (≥5 с контактов, ≥3 с после голоса), опорные моменты внутри
// своих сцен, файлы озвучки (BG42_STRICT_VOICE=1 — обязательны и актуальны).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { beats } from "../../../src/campaign50/bg-042/beats.ts";
import { BG42_CTA, BG42_LINES, BG42_SCENES, BG42_TEXT, BG42_VOICES, spokenOf, spokenWords } from "../../../src/campaign50/bg-042/script.ts";
import { buildSubs, buildTimeline, ctaCheck, estimateManifest } from "../../../src/campaign50/bg-042/timeline.ts";
import { MANIFEST, VOICE_DIR, readManifest } from "./common.mjs";
import { lineHash } from "./tts.mjs";

const STRICT = process.env.BG42_STRICT_VOICE === "1";
const norm = (s) => s.replace(/\s+/g, " ").trim();

test("реплики совпадают со сценарием 42-BG-042.md дословно", () => {
  const md = readFileSync("campaigns/balago-50/episodes/42-BG-042.md", "utf8");
  const sec = md.slice(md.indexOf("## Полный VO для TTS"), md.indexOf("## Монтажный"));
  const items = sec.split(/\n(?=\d+\. \*\*)/).filter((x) => /^\d+\. \*\*/.test(x));
  assert.equal(items.length, 6, "в сценарии 6 блоков VO");
  const quotes = items.map((it) => [...it.matchAll(/«([^»]+)»/g)].map((m) => norm(m[1])));
  const groups = [["a1"], ["r1", "m1"], ["r2", "m2"], ["a2", "a3"], ["n1", "n2"], ["c1", "c2", "c3"]];
  groups.forEach((ids, i) => {
    const ours = norm(ids.map((id) => BG42_LINES.find((l) => l.id === id).text).join(" "));
    assert.equal(ours, quotes[i].join(" "), `блок ${i + 1}`);
  });
});

test("роли совпадают с говорящими сценария, у каждой роли свой голос", () => {
  const want = { a1: "anchor", r1: "reporter", m1: "mother", r2: "reporter", m2: "mother", a2: "anchor", a3: "anchor", n1: "narrator", n2: "narrator", c1: "narrator", c2: "narrator", c3: "narrator" };
  for (const l of BG42_LINES) assert.equal(l.role, want[l.id], l.id);
  const ids = Object.values(BG42_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, ids.length, "голоса ролей различаются");
});

test("Бишкек и оба способа связи в голосе финала", () => {
  const vo = BG42_LINES.filter((l) => l.scene === "cta").map((l) => l.text).join(" ");
  assert.match(vo, /Бишкектеги балдар үчүн такси/);
  assert.match(vo, /профилдеги шилтемеге өтүңүз/);
  assert.match(vo, /WhatsApp аркылуу жазыңыз/);
  assert.match(vo, /BalaGo менен жолго чыгалы!/);
  assert.match(spokenOf(BG42_LINES.find((l) => l.id === "c2")), /вотсап/);
});

test("надписи финала и номер WhatsApp", () => {
  assert.equal(BG42_CTA.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG42_CTA.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG42_CTA.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG42_CTA.phone, "WhatsApp: 0998 08 38 28");
  assert.equal(BG42_CTA.phoneDigits, "0998 08 38 28");
  const cta = readFileSync("src/campaign50/bg-042/scenes/Cta.tsx", "utf8");
  for (const k of ["BG42_CTA.city", "BG42_CTA.link", "BG42_CTA.or", "BG42_CTA.phoneDigits", "WhatsApp:"]) assert.ok(cta.includes(k), `финал показывает ${k}`);
});

test("кыргызские буквы, без «сен», без еды/GPS/кресел и ложных обещаний", () => {
  const all = BG42_LINES.map((l) => `${l.text} ${spokenOf(l)}`).join(" ") + " " + Object.values(BG42_TEXT).join(" ");
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
  assert.doesNotMatch(all, /(^|[\s,.!?«])сен([\s,.!?»]|$)/i, "нет обращения на «сен»");
  assert.doesNotMatch(all, /тамак|таттуу|шире|газдалган|кофе|чай|GPS|кресло|кепилдик берилет|эртең эле баштайбыз/i);
  assert.match(BG42_TEXT.noGuarantee, /кепил эмес/);
  assert.match(BG42_TEXT.searchUpTo, /2 жумага чейин/);
  assert.match(BG42_TEXT.trialFree, /толук сыноо сапары — акысыз/);
  assert.match(BG42_TEXT.conditional, /Шарттуу мисал/);
  assert.match(BG42_TEXT.jokePlate, /Ойдон чыгарылган тамаша/);
});

test("титры: фразы покрывают реплику целиком, номера слов растут", () => {
  for (const l of BG42_LINES) {
    assert.equal(norm(l.chunks.map((c) => c.text).join(" ")), norm(l.text), `${l.id}: фразы титров = текст`);
    const n = spokenWords(l).length;
    l.chunks.forEach((c, i) => {
      assert.ok(c.w >= 0 && c.w < n, `${l.id}: слово ${c.w} < ${n}`);
      if (i) assert.ok(c.w > l.chunks[i - 1].w, `${l.id}: номера слов растут`);
    });
    assert.equal(l.chunks[0].w, 0, `${l.id}: первая фраза с первого слова`);
  }
});

const timelines = () => {
  const out = [["оценка", buildTimeline(estimateManifest())]];
  const m = readManifest();
  if (m && !m.partial) out.push(["озвучка", buildTimeline({ lines: m.lines })]);
  return out;
};

test("финал: контакты ≥ 5 с, после последнего слова ≥ 3 с", () => {
  for (const [name, tl] of timelines()) {
    const c = ctaCheck(tl);
    assert.deepEqual(c.problems, [], `${name}: ${c.problems.join("; ")}`);
    assert.ok(c.visibleSec >= 5 && c.afterVoice >= 3, name);
  }
});

test("сцены подряд, реплики внутри своих сцен, опорные моменты внутри сцен", () => {
  for (const [name, tl] of timelines()) {
    assert.deepEqual(tl.scenes.map((s) => s.id), BG42_SCENES.map((s) => s.id));
    for (let i = 1; i < tl.scenes.length; i++) assert.ok(Math.abs(tl.scenes[i].from - tl.scenes[i - 1].to) < 1e-6);
    for (const c of tl.cues) {
      const s = tl.scenes.find((x) => x.id === c.scene);
      assert.ok(c.from >= s.from && c.to <= s.to, `${name}: ${c.id} в сцене ${c.scene}`);
    }
    for (let i = 1; i < tl.cues.length; i++) assert.ok(tl.cues[i].from > tl.cues[i - 1].to, `${name}: реплики не накладываются (${tl.cues[i].id})`);
    const b = beats(tl);
    for (const [k, v] of Object.entries(b)) {
      for (const [bk, t] of Object.entries(v)) assert.ok(t >= v.from - 1e-6 && t <= v.to + 1e-6, `${name}: ${k}.${bk}=${t.toFixed(2)} внутри [${v.from.toFixed(2)}, ${v.to.toFixed(2)}]`);
    }
    // сайт BalaGo успевает открыться и показать форму до перехода в студию
    assert.ok(b.search.fields + 0.9 <= b.search.to, `${name}: форма видна до конца сцены поиска`);
    // «телевизор» выключается после слов «шарттары чыныгы»
    const n2 = tl.cues.find((c) => c.id === "n2");
    assert.ok(b.trial.offEnd >= n2.to - 0.3 && b.trial.offEnd <= b.trial.to, `${name}: выключение после реплики n2`);
    const subs = buildSubs(tl);
    assert.ok(subs.every((s) => s.to > s.from), `${name}: титры положительной длины`);
    assert.ok(tl.durationSec >= 55 && tl.durationSec <= 95, `${name}: длительность ${tl.durationSec.toFixed(1)} с`);
  }
});

test("файлы озвучки: есть, актуальны по хэшу, тайминги слов полные", { skip: !STRICT && !existsSync(MANIFEST) }, () => {
  const m = readManifest();
  assert.ok(m && !m.partial, "manifest.json полный");
  for (const l of BG42_LINES) {
    const got = m.lines.find((x) => x.id === l.id);
    assert.ok(got, `есть ${l.id}`);
    assert.ok(existsSync(join(VOICE_DIR, got.file)), `файл ${got.file}`);
    assert.equal(got.hash, lineHash(l), `${l.id}: озвучка соответствует тексту и голосу`);
    assert.ok(got.speechEnd > got.speechStart, `${l.id}: речь не пустая`);
    assert.ok(got.env?.length > 0 && got.chars?.length > 0, `${l.id}: губы (буквы и огибающая)`);
    if (got.words.length !== spokenWords(l).length) console.warn(`  ⚠ ${l.id}: слов в таймингах ${got.words.length}, в тексте ${spokenWords(l).length} — титры по пропорции`);
  }
});
