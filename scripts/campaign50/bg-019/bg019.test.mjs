// Проверки текста и шкалы BalaGoBG019 (node --test):
// обращение сына к маме на «сиз», Бишкек в голосе и кадре, оба способа
// связи и полный номер, полный маршрут, тайминг финала, титры.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { captionWords, chunksOf } from "../../../src/campaign50/bg-019/captions.ts";
import { requireBg19Manifest } from "../../../src/campaign50/bg-019/manifestGuard.ts";
import { BG19_LINES, BG19_TEXT, BG19_VIDEO } from "../../../src/campaign50/bg-019/script.ts";
import { buildBg19Timeline, checkBg19Timeline, estimateBg19Manifest } from "../../../src/campaign50/bg-019/timing.ts";

const spoken = (l) => l.spoken ?? l.text;
const all = BG19_LINES.map(spoken).join(" ");

test("ребёнок обращается к маме на «сиз»", () => {
  const kid = BG19_LINES.filter((l) => l.role === "son");
  assert.ok(kid.length > 0);
  for (const l of kid) {
    assert.match(l.text, /^Апа,/);
    assert.match(l.text, /(^|\s)сиз(\s|$)/u);
    assert.doesNotMatch(l.text, /(^|[\s,])(сен|сага|сени|сенин|сенде|сенден)([\s,.!?]|$)/iu, l.text);
    // неформальные окончания 2-го лица («кетесиңби», «келесиңби»)
    assert.doesNotMatch(l.text, /(сиңби|сыңбы|суңбу|сүңбү|сиң|сың)[?.!]?(\s|$)/u, l.text);
  }
});

test("Бишкек в озвучке и на финальном экране", () => {
  assert.match(all, /Бишкек/);
  assert.equal(BG19_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
});

test("финал: ссылка в профиле И WhatsApp, полный номер, слоган", () => {
  const cta = BG19_LINES.find((l) => l.scene === "cta");
  assert.ok(cta);
  assert.match(spoken(cta), /профилдеги шилтемеге/);
  assert.match(spoken(cta), /Ватсап/);
  assert.match(spoken(cta), /Бишкек/);
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(spoken(cta), /БалаГо менен жолго чыгалы!$/);
  assert.equal(BG19_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.match(BG19_TEXT.cta.link, /Профилдеги шилтемеге өтүңүз/);
  assert.match(BG19_TEXT.cta.or, /WhatsApp/);
});

test("полный маршрут ҮЙ → МЕКТЕП → ҮЙ и точные условия", () => {
  assert.equal(BG19_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.match(BG19_TEXT.route.full, /ҮЙ → МЕКТЕП → ҮЙ/);
  assert.match(BG19_TEXT.route.group, /3–4/);
  assert.match(BG19_TEXT.route.search, /2 жумага чейин/);
  assert.match(BG19_TEXT.route.trialNote, /топ түзүлгөндөн кийин/);
  assert.doesNotMatch(JSON.stringify(BG19_TEXT) + all, /GPS|геолокац|тамак|печенье|таттуу|жер-жемиш/i);
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
});

test("шкала по оценке проходит проверку финала", () => {
  const tl = buildBg19Timeline(estimateBg19Manifest());
  assert.deepEqual(checkBg19Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues[tl.cues.length - 1];
  assert.ok(tl.durationSec - cta.from >= 5);
  assert.ok(tl.durationSec - last.to >= 3);
  assert.equal(tl.frames, Math.round(tl.durationSec * BG19_VIDEO.fps));
});

test("титры: короткие фрагменты, все слова по порядку", () => {
  for (const l of BG19_LINES) {
    const w = captionWords(l.text);
    const ch = chunksOf(w);
    assert.deepEqual(ch.flat(), w.map((_, i) => i), l.id);
    for (const c of ch) assert.ok(c.map((i) => w[i]).join(" ").length <= 32, `${l.id}: ${c.map((i) => w[i]).join(" ")}`);
  }
});

test("готовая озвучка (если есть) полная и актуальная", () => {
  const path = join("public", BG19_VIDEO.voiceDir, "manifest.json");
  if (!existsSync(path)) return;
  const files = new Set(BG19_LINES.map((l) => `${BG19_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(join("public", f))));
  requireBg19Manifest(JSON.parse(readFileSync(path, "utf8")), files);
});
