// Проверки BG-013 до рендера: текст сценария (episodes/14-BG-013.md),
// правила AGENTS.md/CLAUDE.md (ребёнок к маме — только «сиз»; Бишкек в речи
// и кадре; ссылка в профиле и WhatsApp 0998 08 38 28; финал ≥ 5 с и ≥ 3 с
// после речи), факты BalaGo (BRAND_FACTS.md: ҮЙ → МЕКТЕП → ҮЙ, группа
// 3–4 ребёнка, подбор до 2 недель, бесплатная первая полная пробная поездка,
// оплата после пробы), отсутствие выдуманных обещаний, шкала монтажа и
// озвучка (с BG13_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-013/bg-013.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG13_LINES, BG13_SCENES, BG13_TEXT, BG13_VIDEO, BG13_VOICES } from "../../../src/campaign50/bg-013/script.ts";
import { buildBg13Timeline, checkBg13Timeline, estimateBg13Manifest } from "../../../src/campaign50/bg-013/timing.ts";

const MANIFEST = `public/${BG13_VIDEO.voiceDir}/manifest.json`;
const lineOf = (id) => BG13_LINES.find((l) => l.id === id);
const norm = (s) => s.replace(/\s+/g, " ").trim();

test("реплики взяты из сценария 14-BG-013.md без изменений", () => {
  const script = norm(readFileSync("campaigns/balago-50/episodes/14-BG-013.md", "utf8"));
  for (const l of BG13_LINES) assert.ok(script.includes(norm(l.text)), `${l.id}: нет в сценарии: ${l.text}`);
});

test("сцены: хук → мамин день → вечер → рисунок/поиск → карта → финал", () => {
  assert.deepEqual(
    BG13_SCENES.map((s) => s.id),
    ["hook", "pickup", "evening", "drawing", "map", "cta"],
  );
  // поступок мамы (её реплика о маршруте) — до первого упоминания BalaGo
  const ids = BG13_LINES.map((l) => l.id);
  const firstBrand = BG13_LINES.findIndex((l) => /BalaGo/.test(l.text));
  assert.ok(ids.indexOf("m02") < firstBrand, "BalaGo появляется только после мысли мамы о маршруте");
  assert.equal(lineOf("m02").role, "mother");
});

test("ребёнок обращается к маме только на «сиз»", () => {
  const kid = BG13_LINES.filter((l) => l.role === "son");
  assert.ok(kid.length >= 2);
  const all = kid.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ");
  assert.doesNotMatch(all, /(^|[\s,.!?])(сен|сени|сага|сенин|сенде|сенден)([\s,.!?]|$)/iu);
  assert.doesNotMatch(all, /чарчадыңбы|келесиңби|бересиңби/iu);
  assert.match(lineOf("s02").text, /^Апа, сиз .*чарчадыңызбы\?$/);
});

test("голоса: сын, мама, диктор — готовые голоса проекта, разные", () => {
  assert.equal(new Set(Object.values(BG13_VOICES).map((v) => v.voiceId)).size, 3);
  assert.equal(BG13_VOICES.son.name, "KG-son");
  assert.equal(BG13_VOICES.mother.name, "KG-mother");
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n03");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкектеги балдар үчүн такси/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(lineOf("n02").text, /Бишкекте/);
  assert.match(lineOf("n04").text, /BalaGo менен жолго чыгалы!/);
  assert.equal(BG13_LINES[BG13_LINES.length - 1].id, "n04");
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG13_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("условия BalaGo соответствуют BRAND_FACTS.md", () => {
  const m = BG13_TEXT.map;
  assert.equal(m.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.match(lineOf("n02").text, /үйдөн мектепке, сабактан кийин кайра үйгө/);
  assert.match(lineOf("n02").text, /Адегенде ылайыктуу топ түзүлөт/);
  assert.match(m.steps[1].note, /3–4 бала/);
  assert.match(m.steps[1].note, /2 жумага чейин/);
  assert.match(m.steps[2].title, /Биринчи толук сыноо сапары/);
  assert.match(m.steps[2].note, /акысыз/);
  assert.match(m.steps[2].note, /сыноодон кийин/);
});

test("нет выдуманных обещаний, еды и статистики", () => {
  const text = [...BG13_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`), JSON.stringify(BG13_TEXT)].join(" ");
  assert.doesNotMatch(text, /дароо|эртеңден баштап|GPS|24\/7|кресло|сертификат|тамак|таттуу|ширин|шире|кепилдик|бош убакыт/iu);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи, 55–80 с", () => {
  assert.deepEqual(checkBg13Timeline(buildBg13Timeline(estimateBg13Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG13_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG13_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG13_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(existsSync(`public/${BG13_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg13Timeline(m);
  assert.deepEqual(checkBg13Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
