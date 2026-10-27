// Тесты BG-016: текст речи и титров, обязательный финал, шкала.
//   node --test scripts/campaign50/bg-016/bg016.test.mjs
// BG016_STRICT_VOICE=1 — дополнительно требует полную актуальную озвучку.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { BG016_CTA, BG016_LINES, BG016_SCENES, BG016_VOICES } from "../../../src/campaign50/bg-016/script.ts";
import { buildTimeline, ctaCheck, estimateManifest, spokenWords } from "../../../src/campaign50/bg-016/timeline.ts";
import { lineHash } from "./tts.mjs";
import { MANIFEST, readManifest, VOICE_DIR } from "./common.mjs";

const all = (k) => BG016_LINES.map((l) => l[k] ?? l.text).join(" ");

test("ребёнок обращается к маме на «сиз»", () => {
  const kid = BG016_LINES.filter((l) => l.role === "son");
  assert.ok(kid.length >= 2);
  for (const l of kid) {
    assert.match(l.text, /(?<!\p{L})сиз(?!\p{L})/iu, `${l.id}: нет «сиз»`);
    assert.doesNotMatch(l.text, /(?<!\p{L})(сен|сага|сени|сенин)(?!\p{L})/iu, `${l.id}: «сен»`);
  }
  assert.match(BG016_LINES.find((l) => l.id === "c01").text, /жатасыз\?$/u);
  assert.match(BG016_LINES.find((l) => l.id === "c02").text, /жеткиресизби\?$/u);
});

test("Бишкек звучит в озвучке и есть в финальном кадре", () => {
  assert.match(all("spoken"), /Бишкек/u);
  assert.equal(BG016_CTA.city, "Бишкек • Балдар үчүн такси");
});

test("оба способа связи и номер — в голосе и в кадре", () => {
  const n06 = BG016_LINES.find((l) => l.id === "n06");
  assert.match(n06.spoken, /Профилдеги шилтеме/u);
  assert.match(n06.spoken, /вотсап/u);
  assert.match(n06.text, /0998 08 38 28/u);
  // номер словами = 0 998 08 38 28
  assert.match(n06.spoken, /нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/u);
  assert.equal(BG016_CTA.phone, "0998 08 38 28");
  assert.equal(BG016_CTA.profile, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG016_CTA.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG016_LINES.at(-1).text, "BalaGo менен жолго чыгалы!");
});

test("кыргызские буквы и запрещённые обещания", () => {
  const txt = all("text");
  assert.match(txt, /ү/u);
  assert.match(txt, /ө/u);
  assert.match(txt, /ң/u);
  for (const bad of [/тамак/iu, /таттуу/iu, /GPS/u, /кресло/iu, /эртеңден баштап/iu, /кепилдик/iu]) assert.doesNotMatch(txt, bad);
  // полный маршрут и «акысыз» только для первой полной пробной поездки
  assert.match(all("text"), /Биринчи толук сыноо сапары акысыз/u);
});

test("субтитры: куски покрывают текст реплики", () => {
  for (const l of BG016_LINES) {
    assert.equal(l.chunks.map((c) => c.text).join(" "), l.text, l.id);
    const n = spokenWords(l).length;
    let prev = -1;
    for (const c of l.chunks) {
      assert.ok(c.w > prev && c.w < n, `${l.id}: номер слова ${c.w}`);
      prev = c.w;
    }
  }
});

test("голоса — готовые голоса проекта, у каждой роли свой", () => {
  const ids = Object.values(BG016_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, ids.length);
});

const check = (tl) => {
  const r = ctaCheck(tl);
  assert.deepEqual(r.problems, []);
  assert.ok(tl.durationSec >= 55 && tl.durationSec <= 90, `длительность ${tl.durationSec}`);
  for (const s of tl.scenes) {
    const def = BG016_SCENES.find((x) => x.id === s.id);
    assert.ok(s.to - s.from >= def.min - 1e-6);
  }
  // реплики не перекрываются
  const cs = [...tl.cues].sort((a, b) => a.from - b.from);
  for (let i = 1; i < cs.length; i++) assert.ok(cs[i].from >= cs[i - 1].to + 0.2, `${cs[i - 1].id} → ${cs[i].id}`);
  // каждая реплика внутри своей сцены
  for (const c of tl.cues) {
    const s = tl.scenes.find((x) => x.id === c.scene);
    assert.ok(c.from >= s.from && c.to <= s.to, c.id);
  }
  return r;
};

test("шкала по оценке: финал ≥ 5 с, ≥ 3 с после голоса", () => {
  check(buildTimeline(estimateManifest()));
});

test("озвучка (если есть) актуальна и укладывается в правила финала", (t) => {
  const m = readManifest();
  if (!m) {
    if (process.env.BG016_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки пока нет");
    return;
  }
  assert.equal(m.partial, false);
  for (const l of BG016_LINES) {
    const x = m.lines.find((y) => y.id === l.id);
    assert.ok(x, `нет ${l.id}`);
    assert.ok(existsSync(join(VOICE_DIR, x.file)), x.file);
    assert.equal(x.hash, lineHash(l, BG016_VOICES[l.role].voiceId), `${l.id}: устарела`);
    assert.equal(x.words.length, spokenWords(l).length, `${l.id}: слова`);
  }
  const r = check(buildTimeline({ lines: m.lines }));
  console.log(`  финал: контакты ${r.visibleSec.toFixed(2)} с, после голоса ${r.afterVoice.toFixed(2)} с; ${MANIFEST}`);
});
