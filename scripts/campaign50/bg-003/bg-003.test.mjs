// Проверки BG-003 до рендера: текст сценария (04-BG-003.md), правила
// AGENTS.md/CLAUDE.md (Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28,
// финал ≥ 5 с и ≥ 3 с после речи), факты BRAND_FACTS.md, шкала монтажа и
// озвучка (с BG3_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-003/bg-003.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG3_LINES, BG3_TEXT, BG3_VIDEO, BG3_VOICES } from "../../../src/campaign50/bg-003/script.ts";
import { buildBg3Timeline, checkBg3Timeline, estimateBg3Manifest } from "../../../src/campaign50/bg-003/timing.ts";

const MANIFEST = `public/${BG3_VIDEO.voiceDir}/manifest.json`;
const all = (l) => `${l.text} ${l.spoken ?? ""}`;
const lineOf = (id) => BG3_LINES.find((l) => l.id === id);
const norm = (s) => s.replace(/\s+/g, " ");

test("реплики диктора — текст сценария без изменений", () => {
  const script = norm(readFileSync("campaigns/balago-50/episodes/04-BG-003.md", "utf8"));
  for (const l of BG3_LINES.filter((x) => x.role === "narrator" && x.scene !== "cta")) assert.ok(script.includes(norm(l.text)), `${l.id}: нет в сценарии: ${l.text}`);
  // финальная реплика сценария = n05 + n06
  assert.ok(script.includes(norm(`${lineOf("n05").text} ${lineOf("n06").text}`)), "финальная реплика не совпадает со сценарием");
});

test("мысль мамы: та же мысль сценария, правка только для естественности", () => {
  const m = lineOf("m01");
  assert.equal(m.role, "mother");
  assert.equal(m.text, "Бул жолду күн сайын өзүм жүрүшүм керекпи?");
  assert.match(readFileSync("campaigns/balago-50/episodes/04-BG-003.md", "utf8"), /Бул жолду күн сайын өзүм бүтүрүшүм керекпи\?/);
});

test("голоса — готовые голоса проекта, у мамы и диктора разные", () => {
  assert.notEqual(BG3_VOICES.narrator.voiceId, BG3_VOICES.mother.voiceId);
  for (const l of BG3_LINES) assert.ok(BG3_VOICES[l.role], `${l.id}: роль ${l.role}`);
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n05");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(cta.spoken, /нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/);
  assert.match(lineOf("n06").text, /BalaGo менен жолго чыгалы!/);
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG3_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("факты BRAND_FACTS: группа 3–4, поиск до 2 недель, бесплатная полная проба", () => {
  assert.match(BG3_TEXT.steps.s1note, /3–4 бала/);
  assert.match(BG3_TEXT.steps.s1note, /2 жумага чейин/);
  assert.match(lineOf("n04").text, /Алгач каттамга ылайык топ түзүлөт/);
  assert.match(lineOf("n04").text, /Биринчи толук сыноо сапары акысыз/);
  assert.equal(BG3_TEXT.steps.s2note, "ҮЙ → МЕКТЕП → ҮЙ");
});

test("нет выдуманных обещаний и еды", () => {
  const text = [...BG3_LINES.map(all), JSON.stringify(BG3_TEXT)].join(" ");
  assert.doesNotMatch(text, /дароо|азыр эле|эртеӊ эле|GPS|24\/7|кресло|кепилдик|тамак|печенье|шире|кофе|маршрутка/iu);
});

test("кыргызские буквы ү, ө, ң в тексте", () => {
  const text = BG3_LINES.map(all).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(text.includes(ch), ch);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи", () => {
  assert.deepEqual(checkBg3Timeline(buildBg3Timeline(estimateBg3Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG3_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG3_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG3_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(existsSync(`public/${BG3_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg3Timeline(m);
  assert.deepEqual(checkBg3Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
