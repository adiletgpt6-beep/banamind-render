// Проверки BG-009 до рендера: текст сценария (episodes/10-BG-009.md),
// правила AGENTS.md/CLAUDE.md (Бишкек в речи и кадре, ссылка в профиле и
// WhatsApp 0998 08 38 28, финал ≥ 5 с и ≥ 3 с после речи), факты BalaGo
// (BRAND_FACTS.md: полная поездка ҮЙ → МЕКТЕП → ҮЙ, группа 3–4 ребёнка,
// подбор до 2 недель, бесплатная первая полная пробная поездка, оплата
// после решения), отсутствие выдуманных обещаний, шкала монтажа и озвучка
// (с BG9_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-009/bg-009.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG9_DAYS, BG9_LINES, BG9_SCENES, BG9_TEXT, BG9_VIDEO, BG9_VOICES } from "../../../src/campaign50/bg-009/script.ts";
import { buildBg9Timeline, checkBg9Timeline, estimateBg9Manifest } from "../../../src/campaign50/bg-009/timing.ts";

const MANIFEST = `public/${BG9_VIDEO.voiceDir}/manifest.json`;
const lineOf = (id) => BG9_LINES.find((l) => l.id === id);
const norm = (s) => s.replace(/\s+/g, " ").trim();

test("реплики взяты из сценария 10-BG-009.md без изменений", () => {
  const script = norm(readFileSync("campaigns/balago-50/episodes/10-BG-009.md", "utf8"));
  for (const l of BG9_LINES) assert.ok(script.includes(norm(l.text)), `${l.id}: нет в сценарии: ${l.text}`);
  // дикторский текст дней — целиком, по порядку
  const days = ["n02", "n03", "n04"].map((id) => lineOf(id).text).join(" ");
  assert.ok(script.includes(days), "понедельник–среда не совпадают со сценарием");
  assert.ok(script.includes(["n05", "n06", "n07"].map((id) => lineOf(id).text).join(" ")), "четверг–пятница и повтор не совпадают");
});

test("пять дней — пять разных цветов и задач", () => {
  assert.deepEqual(
    BG9_DAYS.map((d) => d.name),
    ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"],
  );
  assert.equal(new Set(BG9_DAYS.map((d) => d.color)).size, 5);
  assert.equal(new Set(BG9_DAYS.map((d) => d.task)).size, 5);
  assert.deepEqual(
    BG9_SCENES.map((s) => s.id),
    ["hook", "mon", "tue", "wed", "thu", "fri", "repeat", "sat", "how", "cta"],
  );
});

test("связующий поступок: реплика мамы до появления BalaGo", () => {
  const ids = BG9_LINES.map((l) => l.id);
  assert.ok(ids.indexOf("m01") < ids.indexOf("n08"), "BalaGo появляется только после решения мамы");
  assert.equal(lineOf("m01").role, "mother");
  assert.match(lineOf("m01").text, /алдын ала/);
  assert.equal(BG9_TEXT.app.title, "Каттамга өтүнмө");
  assert.equal(BG9_VOICES.mother.name, "KG-mother");
});

test("дети не обращаются к родителям на «сен» (в ролике нет детских реплик)", () => {
  assert.ok(BG9_LINES.every((l) => l.role === "narrator" || l.role === "mother"));
  const all = BG9_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ");
  assert.doesNotMatch(all, /(^|[\s,.!?])(сен|сени|сага|сенин|сенде)([\s,.!?]|$)/iu);
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n10");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(lineOf("n08").text, /Бишкектеги балдар үчүн такси/);
  assert.match(lineOf("n11").text, /BalaGo менен жолго чыгалы!/);
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG9_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("условия BalaGo соответствуют BRAND_FACTS.md", () => {
  const h = BG9_TEXT.how;
  assert.equal(h.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.match(lineOf("n09").text, /Үйдөн мектепке, сабактан кийин кайра үйгө/);
  assert.match(lineOf("n09").text, /Ылайыктуу топ түзүлгөн соң биринчи толук сыноо сапары акысыз/);
  assert.match(h.steps[1].note, /3–4 бала/);
  assert.match(h.steps[1].note, /2 жумага чейин/);
  assert.match(h.steps[2].title, /Биринчи толук сыноо сапары/);
  assert.match(h.steps[3].note, /сыноодон кийин/);
});

test("нет выдуманных обещаний, еды и статистики", () => {
  const text = [...BG9_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`), JSON.stringify(BG9_TEXT)].join(" ");
  assert.doesNotMatch(text, /дароо|эртеңден баштап|GPS|24\/7|кресло|сертификат|тамак|таттуу|ширин|шире|кепилдик|%\s*ата-эне/iu);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи, 55–75 с", () => {
  assert.deepEqual(checkBg9Timeline(buildBg9Timeline(estimateBg9Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG9_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG9_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG9_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(existsSync(`public/${BG9_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg9Timeline(m);
  assert.deepEqual(checkBg9Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
