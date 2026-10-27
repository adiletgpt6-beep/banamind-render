// Проверки текста и шкалы BalaGoBG040 (node --test): Бишкек в голосе и
// кадре, оба способа связи и полный номер, финал ≥ 5 с и ≥ 3 с после
// последнего слова, кыргызские буквы, честные условия (без обещаний минут,
// GPS и еды), реплики дословно из утверждённого сценария, титры.
// BG40_STRICT_VOICE=1 — озвучка обязательна (CI перед рендером).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { captionWords, chunksOf } from "../../../src/campaign50/bg-040/captions.ts";
import { requireBg40Manifest } from "../../../src/campaign50/bg-040/manifestGuard.ts";
import { BG40_LINES, BG40_TEXT, BG40_VIDEO, BG40_VOICE_OF } from "../../../src/campaign50/bg-040/script.ts";
import { buildBg40Timeline, checkBg40Timeline, estimateBg40Manifest, wordIndex } from "../../../src/campaign50/bg-040/timing.ts";

const all = BG40_LINES.map((l) => l.spoken).join(" ");
const shown = JSON.stringify(BG40_TEXT);

// Полный VO из campaigns/balago-50/episodes/40-BG-040.md (дословно).
const APPROVED = [
  "Бир эле мектеп жолу жумуш күнүн канча жолу бөлөт?",
  "Ишимдин эң кызык жерине келгенде, мектептен баламды алышым керек болот.",
  "Маселе бир гана жолдо эмес. Тапшырманы токтотуп, кайра баштоо да күч жана көңүл талап кылат.",
  "Ошондуктан күн сайын кайталанган мектеп каттамын алдын ала уюштуруунун жолун издейт. BalaGo'го дарек, мектеп жана убакыт керек.",
  "Эгер ылайыктуу топ түзүлсө, толук сыноо сапарынан кийин ата-эне улантууну тандай алат. Бул убакытты так мүнөт менен үнөмдөөгө убада эмес, күндү ыңгайлуураак пландоонун жолу.",
  "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
];

test("реплики дословно совпадают с утверждённым сценарием", () => {
  assert.deepEqual(
    BG40_LINES.map((l) => l.text),
    APPROVED,
  );
  // произношение отличается только написанием BalaGo/WhatsApp кириллицей
  for (const l of BG40_LINES) {
    const norm = (s) => s.replace(/BalaGo'го/g, "БалаГого").replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(l.spoken, norm(l.text), l.id);
    assert.doesNotMatch(l.spoken, /\d/, `${l.id}: цифры в тексте для синтеза`);
  }
});

test("роли и голоса: диктор и мама — разные голоса", () => {
  assert.deepEqual(new Set(BG40_LINES.map((l) => l.role)), new Set(["narrator", "mother"]));
  assert.notEqual(BG40_VOICE_OF.narrator, BG40_VOICE_OF.mother);
});

test("Бишкек в озвучке и в кадре", () => {
  assert.match(all, /Бишкектеги/);
  assert.equal(BG40_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.match(BG40_TEXT.hook.date, /Бишкек/);
  assert.equal(BG40_TEXT.flow.city, "Бишкек");
});

test("финал: ссылка в профиле И WhatsApp, полный номер, слоган", () => {
  const cta = BG40_LINES.find((l) => l.scene === "cta");
  assert.ok(cta);
  assert.equal(cta.id, BG40_LINES[BG40_LINES.length - 1].id);
  assert.match(cta.spoken, /профилдеги шилтемеге өтүңүз/);
  assert.match(cta.spoken, /экрандагы номерге Ватсап аркылуу жазыңыз/);
  assert.match(cta.spoken, /^БалаГо — Бишкектеги балдар үчүн такси\./);
  assert.match(cta.spoken, /БалаГо менен жолго чыгалы!$/);
  assert.equal(BG40_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG40_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG40_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG40_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG40_TEXT.cta.slogan, "BalaGo менен жолго чыгалы!");
});

test("честные условия и запреты", () => {
  assert.equal(BG40_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG40_TEXT.plan.example, "Шарттуу мисал");
  assert.match(BG40_TEXT.plan.steps[0][1], /3–4 бала/);
  assert.match(BG40_TEXT.plan.steps[0][1], /2 жумага чейин/);
  assert.match(BG40_TEXT.plan.steps[1][1], /акысыз/);
  assert.match(BG40_TEXT.plan.steps[1][1], /топ түзүлгөндөн кийин/);
  assert.match(BG40_TEXT.plan.steps[2][1], /ата-эненин тандоосу/);
  assert.match(BG40_TEXT.plan.honest.join(" "), /убада эмес/);
  // время на телефоне — после возвращения в офис (13:50), позже напоминания 12:30
  for (const c of BG40_TEXT.search.clock) assert.ok(c > BG40_TEXT.flow.times[2], c);
  // подписи полей формы — как на сайте
  assert.deepEqual(
    BG40_TEXT.search.fields.map(([l]) => l).concat(BG40_TEXT.search.times.map(([l]) => l)),
    ["Баланы ала турган дарек", "Бара турган жер", "Сабактын башталыш убактысы", "Сабактын бүтүү убактысы"],
  );
  assert.equal(BG40_TEXT.search.banner, "Алгач ылайыктуу топ издөө");
  assert.equal(BG40_TEXT.search.button, "Арыз калтыруу");
  // никаких обещаний экономии минут/денег, GPS, еды, «заявка принята»
  assert.doesNotMatch(shown + all, /GPS|геолокац|тамак|печенье|таттуу|(^|\s)сом(\s|$)|сэкономите|үнөмдөйсүз|кабыл алынды|жөнөтүлдү|тастыкталды/i);
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
});

test("слова-ориентиры анимации есть в репликах", () => {
  for (const [id, w, n] of [
    ["n1", "бөлөт", 0],
    ["m1", "алышым", 0],
    ["n2", "токтотуп", 0],
    ["n2", "кайра", 0],
    ["n2", "көңүл", 0],
    ["n3", "издейт", 0],
    ["n3", "балаго", 0],
    ["n3", "дарек", 0],
    ["n3", "мектеп", 1],
    ["n3", "убакыт", 0],
    ["n4", "ылайыктуу", 0],
    ["n4", "толук", 0],
    ["n4", "ата", 0],
    ["n4", "убада", 0],
    ["n4", "ыңгайлуураак", 0],
  ])
    assert.ok(wordIndex(id, w, n) >= 0, `${id}: ${w}`);
});

test("шкала по оценке проходит проверку финала", () => {
  const tl = buildBg40Timeline(estimateBg40Manifest());
  assert.deepEqual(checkBg40Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues[tl.cues.length - 1];
  assert.ok(tl.durationSec - cta.from >= 5);
  assert.ok(tl.durationSec - last.to >= 3);
  assert.equal(tl.frames, Math.round(tl.durationSec * BG40_VIDEO.fps));
});

test("титры: короткие фрагменты, все слова по порядку", () => {
  for (const l of BG40_LINES) {
    const w = captionWords(l.text);
    const ch = chunksOf(w);
    assert.deepEqual(ch.flat(), w.map((_, i) => i), l.id);
    for (const c of ch) assert.ok(c.map((i) => w[i]).join(" ").length <= 32, `${l.id}: ${c.map((i) => w[i]).join(" ")}`);
  }
});

test("готовая озвучка полная и актуальная", () => {
  const path = join("public", BG40_VIDEO.voiceDir, "manifest.json");
  if (!existsSync(path)) {
    assert.ok(!process.env.BG40_STRICT_VOICE, "нет озвучки (manifest.json)");
    return;
  }
  const files = new Set(BG40_LINES.map((l) => `${BG40_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(join("public", f))));
  requireBg40Manifest(JSON.parse(readFileSync(path, "utf8")), files);
});
