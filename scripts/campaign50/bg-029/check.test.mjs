// Проверки сценария BalaGoBG029 до рендера (node --test): реплики дословно
// по 30-BG-029.md, Бишкек и оба способа связи в озвучке и на финальном
// экране, номер 0998 08 38 28, «Шарттуу мисал», проба — только после
// формирования группы, вода — только 0,5 л газсыз, без еды/GPS/кресел,
// финал ≥ 5 с с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG29_CONTACTS_IN, BG29_LINES, BG29_TEXT, BG29_VIDEO } from "../../../src/campaign50/bg-029/script.ts";
import { buildBg29Timeline, checkBg29Timeline, estimateBg29Manifest } from "../../../src/campaign50/bg-029/timing.ts";

const MF = `public/${BG29_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG29_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg29Manifest();
const all = BG29_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify(BG29_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const scene = (id) => BG29_LINES.filter((l) => l.scene === id).map((l) => l.text).join(" ");

test("озвучка дословно по сценарию 30-BG-029.md (по сценам)", () => {
  assert.equal(scene("hook"), "Балдардын жолунда майда нерселер маанилүү эмеспи?");
  assert.equal(scene("belt"), "Биринчиси — орун жана коопсуздук куру. Машинадагы ар бир балага ылайыктуу орун менен кур болушу керек.");
  assert.equal(scene("water"), "Экинчиси — суу. BalaGo унаасында жарым литр газсыз суу сунушталат: даамы бар же жөнөкөй.");
  assert.equal(scene("pickup"), "Үчүнчүсү — баланы ким тосуп алары. Бала ата-энесине же алдын ала макулдашылган ишенимдүү адамга өткөрүлөт.");
  assert.equal(scene("day"), "Мындай сапар алдын ала уюшулган каттамда болот. Топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз, андан ары чечим сиздики.");
  assert.equal(
    scene("cta"),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  // в TTS меняется только написание бренда/мессенджера
  for (const l of BG29_LINES) {
    const norm = (s) => s.replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(norm(l.spoken ?? l.text), norm(l.text), l.id);
  }
});

test("обращение к родителю — только «сиз», без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) assert.doesNotMatch(all, word(bad), bad);
  assert.match(all, /сиздики|өтүңүз/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге/u);
  assert.match(all, /ватсап|whatsapp/u);
  assert.match(all, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG29_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG29_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG29_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG29_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG29_TEXT.hook.city, "Бишкек");
});

test("надписи сцен по сценарию", () => {
  assert.equal(BG29_TEXT.hook.answer, "МАЙДА НЕРСЕЛЕР — МААНИЛҮҮ");
  assert.equal(BG29_TEXT.belt.title, "1. Орун жана коопсуздук куру");
  assert.equal(BG29_TEXT.water.title, "2. Газсыз суу • 0,5 л");
  assert.equal(BG29_TEXT.water.label, "0,5 л • газсыз");
  assert.equal(BG29_TEXT.pickup.title, "3. Алдын ала макулдашылган тосуп алуу");
  assert.equal(BG29_TEXT.day.route.join(" → "), "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG29_TEXT.day.example, "Шарттуу мисал");
  assert.match(BG29_TEXT.day.trial, /^Топ түзүлгөндөн кийин/u);
});

test("без еды, сока, газировки, GPS, кресел и абсолютных обещаний", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "газдуу", "gps", "24/7", "1000 сом", "кепилдик", "кепилдейбиз", "сөзсүз", "дароо", "балдар креслосу", "автокресло"])
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg29Timeline(manifest);
  assert.deepEqual(checkBg29Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG29_VIDEO.fps;
  assert.ok(end - (cta.from / BG29_VIDEO.fps + BG29_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG29_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG29_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG29_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});
