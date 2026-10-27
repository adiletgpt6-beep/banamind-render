// Проверки текста и шкалы BalaGoBG027 (node --test):
// реплики дословно по сценарию, Бишкек в голосе и кадре, оба способа связи
// и полный номер, правило передачи ребёнка, метка условного примера,
// отсутствие запрещённых обещаний, тайминг финала, титры.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { captionWords, chunksOf } from "../../../src/campaign50/bg-027/captions.ts";
import { requireBg27Manifest } from "../../../src/campaign50/bg-027/manifestGuard.ts";
import { BG27_LINES, BG27_TEXT, BG27_VIDEO } from "../../../src/campaign50/bg-027/script.ts";
import { buildBg27Timeline, checkBg27Timeline, estimateBg27Manifest } from "../../../src/campaign50/bg-027/timing.ts";

const spoken = (l) => l.spoken ?? l.text;
const all = BG27_LINES.map(spoken).join(" ");
const screen = JSON.stringify(BG27_TEXT);

test("реплики дословно совпадают со сценарием 28-BG-027.md", () => {
  const md = readFileSync("campaigns/balago-50/episodes/28-BG-027.md", "utf8");
  const vo = md.slice(md.indexOf("## Отдельный VO script"));
  // реплика n3+n4 в сценарии — одна, в ролике разделена на две (пауза между фразами)
  for (const l of BG27_LINES) assert.ok(vo.includes(l.text), `${l.id}: «${l.text}» нет в сценарии`);
  // произношение: отличаются только написания брендов
  for (const l of BG27_LINES.filter((x) => x.spoken)) {
    const norm = (s) => s.replace(/BalaGo'до/g, "БалаГодо").replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(norm(l.text), l.spoken, l.id);
  }
});

test("Бишкек в озвучке и на финальном экране", () => {
  assert.match(all, /Бишкек/);
  assert.equal(BG27_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
});

test("финал: ссылка в профиле И WhatsApp, полный номер, слоган", () => {
  const cta = BG27_LINES.find((l) => l.scene === "cta");
  assert.ok(cta);
  assert.match(spoken(cta), /профилдеги шилтемеге/);
  assert.match(spoken(cta), /Ватсап/);
  assert.match(spoken(cta), /Бишкек/);
  assert.match(spoken(cta), /БалаГо менен жолго чыгалы!$/);
  assert.equal(BG27_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG27_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.match(BG27_TEXT.cta.link, /Профилдеги шилтемеге өтүңүз/);
  assert.match(BG27_TEXT.cta.or, /WhatsApp/);
});

test("правило передачи: ата-эне или согласованный доверенный взрослый", () => {
  assert.match(all, /ата-энесине же алдын ала макулдашылган ишенимдүү адамга гана/);
  assert.equal(BG27_TEXT.card.parent, "Ата-эне");
  assert.equal(BG27_TEXT.card.trusted, "Макулдашылган ишенимдүү адам");
  assert.match(BG27_TEXT.handover.unknown, /Белгисиз адамга тапшырылбайт/);
  assert.match(BG27_TEXT.markerRoute, /Каттам түзүлгөндөн кийинки шарттуу мисал/);
  assert.match(BG27_TEXT.marker, /Шарттуу/);
});

test("нет запрещённых обещаний и выдуманных процедур", () => {
  assert.doesNotMatch(screen + all, /GPS|геолокац|паспорт|документ|QR|тамак|печенье|таттуу|кепилд|автокресл|дароо/i);
});

test("ребёнок к родителю — только «сиз» (реплик ребёнка нет)", () => {
  for (const l of BG27_LINES) assert.doesNotMatch(spoken(l), /(^|[\s,])(сен|сага|сени|сенин)([\s,.!?]|$)/iu, l.id);
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
});

test("шкала по оценке проходит проверку финала", () => {
  const tl = buildBg27Timeline(estimateBg27Manifest());
  assert.deepEqual(checkBg27Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues[tl.cues.length - 1];
  assert.ok(tl.durationSec - cta.from >= 5);
  assert.ok(tl.durationSec - last.to >= 3);
  assert.equal(tl.frames, Math.round(tl.durationSec * BG27_VIDEO.fps));
});

test("титры: короткие фрагменты, все слова по порядку", () => {
  for (const l of BG27_LINES) {
    const w = captionWords(l.text);
    const ch = chunksOf(w);
    assert.deepEqual(ch.flat(), w.map((_, i) => i), l.id);
    for (const c of ch) assert.ok(c.map((i) => w[i]).join(" ").length <= 32, `${l.id}: ${c.map((i) => w[i]).join(" ")}`);
  }
});

test("готовая озвучка (если есть) полная и актуальная", () => {
  const path = join("public", BG27_VIDEO.voiceDir, "manifest.json");
  if (!existsSync(path)) return;
  const files = new Set(BG27_LINES.map((l) => `${BG27_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(join("public", f))));
  requireBg27Manifest(JSON.parse(readFileSync(path, "utf8")), files);
});
