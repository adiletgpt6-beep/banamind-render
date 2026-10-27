// Проверки сценария BalaGoBG010 до рендера (node --test):
// кыргызский текст, обращение сына к папе на «сиз», Бишкек и оба способа
// связи в озвучке и на финальном экране, номер 0998 08 38 28, финал
// ≥ 5 с с контактами и ≥ 3 с после последнего слова, без еды и обещаний.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG10_CONTACTS_IN, BG10_LINES, BG10_TEXT, BG10_VIDEO } from "../../../src/campaign50/bg-010/script.ts";
import { buildBg10Timeline, checkBg10Timeline, estimateBg10Manifest } from "../../../src/campaign50/bg-010/timing.ts";

const MF = `public/${BG10_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG10_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg10Manifest();
const all = BG10_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const narr = BG10_LINES.filter((l) => l.role === "narrator").map((l) => l.spoken ?? l.text).join(" ").toLowerCase();

test("сын обращается к папе на «сиз»", () => {
  for (const l of BG10_LINES.filter((x) => x.role === "son")) {
    assert.match(l.text, /\bсиз\b|сизби|сиз[а-яүөң]+/iu, l.id);
    assert.doesNotMatch(l.text, /\bсен\b|сага\b|сени\b|сенин\b|[а-яүөң]+сыңбы\b|[а-яүөң]+сиңби\b/iu, l.id);
  }
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(narr, /бишкектеги балдар үчүн такси/u);
  assert.match(narr, /профилдеги шилтемеге/u);
  assert.match(narr, /ватсап|whatsapp/u);
  assert.match(all, /0998 08 38 28/);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG10_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG10_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG10_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG10_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет еды, гарантий «завтра всем», GPS-автоматики и 24/7", () => {
  const screen = JSON.stringify(BG10_TEXT).toLowerCase();
  for (const bad of ["тамак", "таттуу", "шире", "gps", "24/7", "кепилдик", "ар дайым орун"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg10Timeline(manifest);
  assert.deepEqual(checkBg10Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG10_VIDEO.fps;
  assert.ok(end - (cta.from / BG10_VIDEO.fps + BG10_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG10_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG10_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG10_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});

test("маршрут ҮЙ → МЕКТЕП → ҮЙ, группа до пробной поездки", () => {
  assert.equal(BG10_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.deepEqual([...BG10_TEXT.route.stops], ["ҮЙ", "МЕКТЕП", "ҮЙ"]);
  const steps = BG10_TEXT.steps.items.map((s) => s.title.toLowerCase());
  assert.ok(steps.findIndex((s) => s.includes("топ")) < steps.findIndex((s) => s.includes("сыноо")), "группа раньше пробной поездки");
  assert.match(narr, /адегенде ылайыктуу топ түзүлөт/u);
  assert.match(narr, /биринчи толук сыноо сапары акысыз/u);
});

test("нет выдуманных цифр производительности", () => {
  const screen = JSON.stringify(BG10_TEXT);
  assert.doesNotMatch(`${all} ${screen}`, /\d+\s?%|процент|пайыз|саат жоготот|мүнөт жоготот/iu);
});
