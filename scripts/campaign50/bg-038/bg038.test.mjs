// Проверки текста и шкалы BalaGoBG038 (node --test): реплики дословно
// по утверждённому сценарию, подтверждённая шкала скидок (как на сайте
// BalaGo), Бишкек в голосе и кадре, оба способа связи и полный номер,
// ү/ө/ң, тайминг финала, титры, актуальность готовой озвучки.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { captionWords, chunksOf } from "../../../src/campaign50/bg-038/captions.ts";
import { requireBg38Manifest } from "../../../src/campaign50/bg-038/manifestGuard.ts";
import { BG38_LINES, BG38_MAX_MONTHS, BG38_MAX_PERCENT, BG38_TEXT, BG38_TIERS, BG38_VIDEO } from "../../../src/campaign50/bg-038/script.ts";
import { buildBg38Timeline, checkBg38Timeline, estimateBg38Manifest, wordIndexOf } from "../../../src/campaign50/bg-038/timing.ts";

const spoken = (l) => l.spoken ?? l.text;
const all = BG38_LINES.map(spoken).join(" ");

// Полный VO утверждённого сценария (episodes/38-BG-038.md), по порядку.
const APPROVED = [
  "Балам ооруп, мектепке барбай калсачы?",
  "Бала ооруп же башка себеп менен каттамдан калган күндөр боюнча BalaGo'до кийинки төлөм мезгилине арзандатуу тартиби бар.",
  "Өткөн айда эки-үч күн өткөрүлсө — беш пайыз, төрт-беш күн өткөрүлсө — он пайыз арзандатуу каралган.",
  "Алты-жети күн болсо — он беш пайыз. Сегиз же андан көп күндө — жыйырма пайыз. Эң жогорку чек — жыйырма пайыз.",
  "Арзандатуу кийинки төлөнүүчү мезгилге эң көп бир айга тиешелүү. Бул баланын келбей калган күндөрү үчүн эреже, кызматтын катасы тууралуу шарттан өзүнчө.",
  "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
];

test("реплики дословно по утверждённому сценарию", () => {
  const texts = BG38_LINES.map((l) => l.text);
  // финальная реплика — два файла по границе предложений
  assert.deepEqual([...texts.slice(0, 5), `${texts[5]} ${texts[6]}`], APPROVED);
  // в TTS отличаются только написания BalaGo/WhatsApp
  for (const l of BG38_LINES) {
    const norm = (s) => s.replace(/BalaGo'до/g, "БалаГодо").replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(spoken(l), norm(l.text), l.id);
  }
});

test("шкала скидок совпадает с сайтом BalaGo (absenceDiscount.ts)", () => {
  assert.deepEqual(
    BG38_TIERS.map((t) => [t.min, t.max, t.percent]),
    [
      [2, 3, 5],
      [4, 5, 10],
      [6, 7, 15],
      [8, null, 20],
    ],
  );
  assert.equal(BG38_MAX_PERCENT, 20);
  assert.equal(BG38_MAX_MONTHS, 1);
  assert.deepEqual(
    BG38_TIERS.map((t) => t.chip),
    ["2–3 күн → 5%", "4–5 күн → 10%", "6–7 күн → 15%", "8+ күн → 20%"],
  );
  assert.equal(BG38_TEXT.ceiling, "Эң көп 20%");
  assert.equal(BG38_TEXT.folders.max, "Эң көп 1 ай");
  assert.equal(BG38_TEXT.oneDay.full, "1 күн = 1 толук сапар");
});

test("сбой сервиса показан отдельным правилом, без выдуманных обещаний", () => {
  assert.match(BG38_TEXT.folders.service, /^Кызматтын катасы — башка эреже$/);
  assert.match(BG38_TEXT.folders.noMix, /аралаштырбоо/);
  const screen = JSON.stringify(BG38_TEXT) + all;
  assert.doesNotMatch(screen, /GPS|геолокац|автомат|акча кайтар|кайтарылат|тамак|таттуу|газдалган|автокресло/i);
});

test("Бишкек в озвучке и на финальном экране", () => {
  assert.match(all, /Бишкек/);
  assert.equal(BG38_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
});

test("финал: ссылка в профиле И WhatsApp, полный номер, слоган", () => {
  const cta = BG38_LINES.filter((l) => l.scene === "door" || l.scene === "cta").map(spoken).join(" ");
  assert.match(cta, /Бишкектеги балдар үчүн такси/);
  assert.match(cta, /профилдеги шилтемеге өтүңүз/);
  assert.match(cta, /Ватсап аркылуу жазыңыз/);
  assert.match(cta, /БалаГо менен жолго чыгалы!$/);
  assert.equal(BG38_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG38_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG38_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG38_TEXT.cta.slogan, "BalaGo менен жолго чыгалы!");
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
});

test("шкала по оценке проходит проверку финала", () => {
  const tl = buildBg38Timeline(estimateBg38Manifest());
  assert.deepEqual(checkBg38Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues[tl.cues.length - 1];
  assert.ok(tl.durationSec - cta.from >= 5);
  assert.ok(tl.durationSec - last.to >= 3);
  assert.equal(tl.frames, Math.round(tl.durationSec * BG38_VIDEO.fps));
});

test("события анимации привязаны к существующим словам", () => {
  const anchors = [
    ["n1", "каттамдан калган"],
    ["n1", "кийинки төлөм"],
    ["n1", "арзандатуу тартиби"],
    ["n2", "эки-үч"],
    ["n2", "беш пайыз"],
    ["n2", "төрт-беш"],
    ["n2", "он пайыз"],
    ["n3", "Алты-жети"],
    ["n3", "он беш"],
    ["n3", "Сегиз"],
    ["n3", "жыйырма пайыз. Эң"],
    ["n3", "Эң жогорку"],
    ["n4", "кийинки төлөнүүчү"],
    ["n4", "бир айга"],
    ["n4", "кызматтын катасы"],
  ];
  for (const [id, needle] of anchors) assert.ok(wordIndexOf(id, needle) >= 0, `${id}: ${needle}`);
  assert.ok(wordIndexOf("n3", "жыйырма пайыз. Эң") < wordIndexOf("n3", "Эң жогорку"));
});

test("титры: короткие фрагменты, все слова по порядку", () => {
  for (const l of BG38_LINES) {
    const w = captionWords(l.text);
    const ch = chunksOf(w);
    assert.deepEqual(ch.flat(), w.map((_, i) => i), l.id);
    for (const c of ch) assert.ok(c.map((i) => w[i]).join(" ").length <= 32, `${l.id}: ${c.map((i) => w[i]).join(" ")}`);
  }
});

test("готовая озвучка (если есть) полная и актуальная", () => {
  const path = join("public", BG38_VIDEO.voiceDir, "manifest.json");
  if (!existsSync(path)) return;
  const files = new Set(BG38_LINES.map((l) => `${BG38_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(join("public", f))));
  requireBg38Manifest(JSON.parse(readFileSync(path, "utf8")), files);
});
