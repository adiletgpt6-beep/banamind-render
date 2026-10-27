// Проверки BG-001 до рендера: тексты по правилам AGENTS.md/CLAUDE.md и
// сценарию, шкала финала, озвучка (с BG1_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-001/bg-001.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG1_CTA_FROM, BG1_DIALOG_END, BG1_LINES, BG1_SCENES, BG1_TEXT, BG1_VIDEO } from "../../../src/campaign50/bg-001/script.ts";
import { checkBg1Timing } from "../../../src/campaign50/bg-001/timing.ts";

const MANIFEST = `public/${BG1_VIDEO.voiceDir}/manifest.json`;
const all = (l) => `${l.text} ${l.spoken ?? ""}`;

test("сын обращается к маме только на «сиз»", () => {
  const son = BG1_LINES.filter((l) => l.role === "son");
  assert.ok(son.length > 0);
  for (const l of son) {
    assert.match(l.text, /\bсиз\b|сиз[а-яүөң]*/iu, l.id);
    assert.doesNotMatch(all(l), /(^|[^а-яүөң])(сен|сени|сага|сенин|сенден|сенде)([^а-яүөң]|$)/iu, l.id);
    assert.doesNotMatch(all(l), /(сиңби|сыңбы|суңбу|сүңбү)\?/iu, `${l.id}: глагол на «сен»`);
  }
});

test("утверждённые реплики сценария не изменены", () => {
  const script = readFileSync("campaigns/balago-50/scripts/BG-001.md", "utf8").replace(/\s+/g, " ");
  for (const l of BG1_LINES) assert.ok(script.includes(l.text.replace(/\s+/g, " ")), `${l.id}: нет в сценарии: ${l.text}`);
});

test("мост (правка 01): проблема → мысль мамы → её поиск → BalaGo", () => {
  const scene = (id) => BG1_SCENES.findIndex((s) => s.id === id);
  assert.ok(scene("parallel") < scene("bridge") && scene("bridge") < scene("route"), "мост между parallel и route");
  const at = (id) => BG1_LINES.find((l) => l.id === id).at;
  const m02 = BG1_LINES.find((l) => l.id === "m02");
  assert.equal(m02.role, "mother");
  assert.equal(m02.scene, "bridge");
  assert.ok(at("m01") < at("m02") && at("m02") < at("n03"), "m01 < m02 < n03");
  // бренд не звучит до решения мамы
  const before = BG1_LINES.filter((l) => l.at < at("n03")).map(all).join(" ");
  assert.doesNotMatch(before, /BalaGo|БалаГо/);
  const bridge = BG1_SCENES.find((s) => s.id === "bridge");
  assert.ok(bridge.to - bridge.from >= 8, "мост занимает достаточное экранное время");
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = BG1_LINES.find((l) => l.scene === "cta");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.ok(BG1_LINES.some((l) => /Бишкек/.test(l.spoken ?? l.text) && l.scene !== "cta"), "Бишкек звучит и до финала");
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG1_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
  assert.ok(BG1_VIDEO.durationSec - BG1_CTA_FROM >= 5, "контакты ≥ 5 с");
  assert.ok(BG1_VIDEO.durationSec - BG1_DIALOG_END >= 3, "≥ 3 с после последнего слова");
});

test("нет обещаний немедленной поездки, цен и выдуманных функций", () => {
  const text = [...BG1_LINES.map(all), JSON.stringify(BG1_TEXT)].join(" ");
  assert.doesNotMatch(text, /дароо|азыр эле|сом\b|GPS|24\/7|кресло/iu);
  assert.match(text, /топ түзүл/);
  assert.match(text, /сыноо сапары акысыз/);
  assert.match(text, /улантууну өзүңүз чечесиз/);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG1_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG1_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.ok(existsSync(`public/${BG1_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  assert.deepEqual(checkBg1Timing(m.lines), []);
});
