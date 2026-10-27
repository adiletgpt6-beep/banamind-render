// Проверки сценария BalaGoBG011 до рендера (node --test):
// кыргызский текст, обращение сына к родителям на «сиз», Бишкек и оба способа
// связи в озвучке и на финальном экране, номер 0998 08 38 28, финал
// ≥ 5 с с контактами и ≥ 3 с после последнего слова, без еды и обещаний.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG11_CONTACTS_IN, BG11_LINES, BG11_TEXT, BG11_VIDEO } from "../../../src/campaign50/bg-011/script.ts";
import { buildBg11Timeline, checkBg11Timeline, estimateBg11Manifest } from "../../../src/campaign50/bg-011/timing.ts";

const MF = `public/${BG11_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG11_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg11Manifest();
const all = BG11_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const narr = BG11_LINES.filter((l) => l.role === "narrator").map((l) => l.spoken ?? l.text).join(" ").toLowerCase();

test("сын обращается к родителям на «сиз» (вежливые формы глагола)", () => {
  const son = BG11_LINES.filter((x) => x.role === "son");
  assert.ok(son.length > 0);
  for (const l of son) {
    assert.match(l.text, /^(Ата|Апа)(?!\p{L})/u, `${l.id}: реплика ребёнка к родителю`);
    assert.match(l.text, /сиз|[ңн][ыиуү]з[а-яүөң]*/iu, l.id);
    assert.doesNotMatch(l.text, /(?<!\p{L})(сен|сага|сени|сенин)(?!\p{L})|\p{L}+[ңн](бы|би|бу|бү)(?!\p{L})/iu, l.id);
  }
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(narr, /бишкектеги балдар үчүн такси/u);
  assert.match(narr, /профилдеги шилтемеге/u);
  assert.match(narr, /ватсап|whatsapp/u);
  assert.match(all, /0998 08 38 28/);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG11_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG11_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG11_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG11_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет еды, гарантий «завтра всем», GPS-автоматики и 24/7", () => {
  const screen = JSON.stringify(BG11_TEXT).toLowerCase();
  for (const bad of ["тамак", "таттуу", "шире", "gps", "24/7", "кепилдик", "ар дайым орун"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg11Timeline(manifest);
  assert.deepEqual(checkBg11Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG11_VIDEO.fps;
  assert.ok(end - (cta.from / BG11_VIDEO.fps + BG11_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG11_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG11_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG11_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});
