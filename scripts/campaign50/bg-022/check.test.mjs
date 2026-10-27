// Проверки сценария BalaGoBG022 до рендера (node --test):
// реплики дословно по сценарию 23-BG-022.md, Бишкек и оба способа связи в
// озвучке и на финальном экране, номер 0998 08 38 28, 1 сапар = ҮЙ → МЕКТЕП
// → ҮЙ, условия без обещаний (цены без примеров, проба только после
// формирования маршрута), финал ≥ 5 с с контактами и ≥ 3 с после речи.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG22_CONTACTS_IN, BG22_LINES, BG22_TEXT, BG22_VIDEO } from "../../../src/campaign50/bg-022/script.ts";
import { buildBg22Timeline, checkBg22Timeline, estimateBg22Manifest } from "../../../src/campaign50/bg-022/timing.ts";

const MF = `public/${BG22_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG22_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg22Manifest();
const all = BG22_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG22_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG22_TEXT).toLowerCase();

test("реплики диктора дословно по сценарию 23-BG-022.md", () => {
  const t = (id) => BG22_LINES.find((x) => x.id === id).text;
  assert.equal(t("n01"), "BalaGo'до бир сапар деген эмнени билдирет?");
  assert.equal(t("n02"), "Биринчи бөлүгү — эртең менен үйдөн мектепке жеткирүү.");
  assert.equal(t("n03"), "Экинчи бөлүгү — сабактан кийин мектептен кайра үйгө алып келүү.");
  assert.equal(t("n04"), "Ушул эки багыт биригип, бир толук сапар болуп эсептелет.");
  assert.equal(t("n05"), "Баасы мектеп менен үйдүн ортосундагы бир тараптуу аралыкка жараша эсептелет.");
  assert.equal(t("n06"), "Каттам уюшулгандан кийин биринчи толук сыноо сапары акысыз.");
  assert.equal(t("n07"), "BalaGo — Бишкектеги балдар үчүн такси.");
  assert.equal(t("n08"), "Каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз.");
  assert.equal(t("n09"), "BalaGo менен жолго чыгалы!");
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге/u);
  assert.match(spoken, /ватсап/u);
  assert.match(all, /0998 08 38 28/);
  assert.match(spoken, /жолго чыгалы/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG22_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG22_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG22_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG22_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("одна полная поездка = ҮЙ → МЕКТЕП → ҮЙ (два этапа)", () => {
  assert.equal(BG22_TEXT.merge.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG22_TEXT.part1.route, "ҮЙ → МЕКТЕП");
  assert.equal(BG22_TEXT.part2.route, "МЕКТЕП → ҮЙ");
  assert.match(BG22_TEXT.cta.route, /ҮЙ → МЕКТЕП → ҮЙ/u);
});

test("условия: проба после формирования маршрута, без цен и обещаний", () => {
  assert.match(BG22_TEXT.example, /уюшулгандан кийин/u);
  const trial = BG22_TEXT.price.steps[2];
  assert.match(trial.note, /уюшулгандан кийин/u);
  assert.equal(trial.badge, "Акысыз");
  assert.match(BG22_TEXT.price.steps[1].note, /3–4 бала/u);
  assert.match(BG22_TEXT.price.steps[1].note, /2 жумага чейин/u);
  // «бир тараптуу аралык» — только про расчёт тарифа
  assert.match(BG22_LINES.find((x) => x.id === "n05").text, /Баасы .* бир тараптуу аралыкка/u);
  for (const bad of ["сом", "1000", "1200", "1500", "тамак", "таттуу", "шире", "печенье", "gps", "24/7", "кепилдик", "эртең эле", "дароо"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет обращения ребёнка к родителю на «сен» (реплик детей нет)", () => {
  assert.ok(BG22_LINES.every((l) => l.role === "narrator"));
  assert.ok(!/(?<![\p{L}])(сен|сага|сени|сенин)(?![\p{L}])/iu.test(all + screen));
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg22Timeline(manifest);
  assert.deepEqual(checkBg22Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG22_VIDEO.fps;
  assert.ok(end - (cta.from / BG22_VIDEO.fps + BG22_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG22_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG22_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG22_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});
