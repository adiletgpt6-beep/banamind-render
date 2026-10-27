// Проверки BG-008 до рендера: тексты по правилам AGENTS.md/CLAUDE.md и
// сценарию, причинная связка, шкала финала, озвучка (с BG8_STRICT_VOICE=1 —
// обязательна).
//   node --test scripts/campaign50/bg-008/bg-008.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG8_CTA_FROM, BG8_DIALOG_END, BG8_LINES, BG8_SCENES, BG8_TEXT, BG8_VIDEO } from "../../../src/campaign50/bg-008/script.ts";
import { checkBg8Timing } from "../../../src/campaign50/bg-008/timing.ts";

const MANIFEST = `public/${BG8_VIDEO.voiceDir}/manifest.json`;
const all = (l) => `${l.text} ${l.spoken ?? ""}`;
const at = (id) => BG8_LINES.find((l) => l.id === id).at;
const scene = (id) => BG8_SCENES.findIndex((s) => s.id === id);

test("реплики сценария 09-BG-008.md перенесены дословно (кроме оговорённых n04/n05)", () => {
  const script = readFileSync("campaigns/balago-50/episodes/09-BG-008.md", "utf8").replace(/\s+/g, " ");
  for (const id of ["n01", "n02", "m01", "n03"]) {
    const l = BG8_LINES.find((x) => x.id === id);
    assert.ok(script.includes(l.text.replace(/\s+/g, " ")), `${id}: нет в сценарии: ${l.text}`);
  }
  // n04: водитель сам пишет в группу (BRAND_FACTS); n05: номер на экране, не цифрами вслух
  assert.match(BG8_LINES.find((l) => l.id === "n04").text, /Алгач ылайыктуу топ түзүлөт\. Биринчи толук сыноо сапары акысыз\./);
});

test("дети к родителям — только «сиз»; в ролике нет обращения на «сен»", () => {
  const text = BG8_LINES.map(all).join(" ");
  assert.doesNotMatch(text, /(^|[^а-яүөң])(сен|сени|сага|сенин|сенден|сенде)([^а-яүөң]|$)/iu);
  for (const l of BG8_LINES.filter((x) => x.role === "son")) assert.match(l.text, /сиз/iu, l.id);
});

test("причинность: звонок → пропущенный → календарь → мысль мамы → её поиск → BalaGo", () => {
  const order = ["hook", "office", "drive", "school", "decide", "how", "cta"];
  order.forEach((id, i) => assert.equal(scene(id), i, `порядок сцен: ${id}`));
  const m01 = BG8_LINES.find((l) => l.id === "m01");
  assert.equal(m01.role, "mother");
  assert.equal(m01.scene, "school");
  assert.ok(at("m01") < at("n03"), "решение мамы раньше бренда");
  // бренд не звучит и не показывается до её действия
  const before = BG8_LINES.filter((l) => l.at < at("n03")).map(all).join(" ");
  assert.doesNotMatch(before, /BalaGo|БалаГо/);
  const decide = BG8_SCENES.find((s) => s.id === "decide");
  assert.ok(at("n03") - decide.from >= 2.5, "поиск и выбор показаны до первого слова о BalaGo");
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = BG8_LINES.find((l) => l.scene === "cta");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.ok(BG8_LINES.some((l) => /Бишкек/.test(l.spoken ?? l.text) && l.scene !== "cta"), "Бишкек звучит и до финала");
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG8_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
  assert.ok(BG8_VIDEO.durationSec - BG8_CTA_FROM >= 5, "контакты ≥ 5 с");
  assert.ok(BG8_VIDEO.durationSec - BG8_DIALOG_END >= 3, "≥ 3 с после последнего слова");
  assert.ok(BG8_VIDEO.durationSec >= 60 && BG8_VIDEO.durationSec <= 72, "хронометраж 60–72 с");
});

test("нет обещаний немедленной поездки, цен и выдуманных функций; чат — условный пример", () => {
  const text = [...BG8_LINES.map(all), JSON.stringify(BG8_TEXT)].join(" ");
  assert.doesNotMatch(text, /дароо|азыр эле|эртең эле|сом\b|GPS|24\/7|кресло|автомат/iu);
  assert.match(text, /топ түзүл/);
  assert.match(text, /толук сыноо сапары акысыз/);
  assert.match(text, /айдоочу/iu);
  assert.equal(BG8_TEXT.chat.note, "Шарттуу мисал");
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  const text = BG8_LINES.map((l) => l.text).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(text.includes(ch), ch);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG8_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG8_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.ok(existsSync(`public/${BG8_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  assert.deepEqual(checkBg8Timing(m.lines), []);
});
