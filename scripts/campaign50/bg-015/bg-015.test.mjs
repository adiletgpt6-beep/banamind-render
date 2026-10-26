// Проверки BG-015 (node --test scripts/campaign50/bg-015/bg-015.test.mjs):
// обязательный финал (Бишкек, ссылка в профиле, WhatsApp 0998 08 38 28 —
// в голосе и в кадре, ≥ 5 с вместе и ≥ 3 с после последнего слова),
// обращение сына к папе (без «сен»), пометка условной картины, факты
// (без еды, без обещаний GPS), шкала и (BG15_STRICT_VOICE=1) озвучка.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { BG15_LINES, BG15_TEXT, BG15_VIDEO } from "../../../src/campaign50/bg-015/script.ts";
import { buildTimeline, estimateManifest, requireManifest } from "../../../src/campaign50/bg-015/timeline.ts";

const MANIFEST = join("public", BG15_VIDEO.voiceDir, "manifest.json");
const strict = process.env.BG15_STRICT_VOICE === "1";
const manifest = () => (existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null);

test("финальная озвучка: Бишкек, ссылка в профиле и WhatsApp", () => {
  const cta = BG15_LINES.filter((l) => l.scene === "cta");
  const said = cta.map((l) => l.spoken ?? l.text).join(" ");
  assert.match(said, /Бишкек/);
  assert.match(said, /профилдеги шилтемеге/);
  assert.match(said, /Ватсап/);
  assert.match(cta.map((l) => l.text).join(" "), /0998 08 38 28/);
  assert.equal(cta.at(-1).text, "BalaGo менен жолго чыгалы!");
  assert.ok(BG15_LINES.some((l) => l.scene !== "cta" && /Бишкек/.test(l.spoken ?? l.text)), "Бишкек звучит и до финала");
});

test("финальный экран: город, оба способа связи, полный номер", () => {
  const t = BG15_TEXT.cta;
  assert.equal(t.cityLine, "Бишкек • Балдар үчүн такси");
  assert.equal(t.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(t.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(t.whatsappNumber, "0998 08 38 28");
  assert.equal(t.route, "ҮЙ → МЕКТЕП → ҮЙ");
});

test("сын обращается к папе уважительно (без «сен» и его форм)", () => {
  const ty = /(^|[\s,.!?«])(сен|сага|сени|сенин|сенден|сенде)(?=[\s,.!?»]|$)|\p{L}+(сиң|сыңбы|сиңби|сыңар)\b/iu;
  for (const l of BG15_LINES.filter((x) => x.role === "son")) assert.doesNotMatch(l.text, ty, l.id);
});

test("условная картина помечена; нет еды, GPS-автоматики и обещаний сроков", () => {
  assert.equal(BG15_TEXT.possible, "Каттам уюшулганда — мүмкүн болгон көрүнүш");
  const all = JSON.stringify(BG15_TEXT) + BG15_LINES.map((l) => l.text).join(" ");
  assert.doesNotMatch(all, /тамак|печенье|таттуу|ширин|шире|GPS|push|эртең эле|дароо башта/i);
  assert.match(all, /2 жумага чейин/);
  assert.match(all, /3–4 бала/);
  assert.match(all, /толук/);
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  const all = BG15_LINES.map((l) => l.text).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

const checkTimeline = (tl) => {
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues.at(-1);
  assert.ok(tl.durationSec - last.to >= 3, `после последнего слова ${(tl.durationSec - last.to).toFixed(2)} с (нужно ≥ 3)`);
  assert.ok(cta.to - cta.from - 1 >= 5, "финальный экран ≥ 5 с");
  assert.ok(tl.durationSec >= 55 && tl.durationSec <= 90, `длительность ${tl.durationSec}`);
  for (let i = 1; i < tl.cues.length; i++) assert.ok(tl.cues[i].from - tl.cues[i - 1].to >= 0.3, `${tl.cues[i].id} слишком близко к предыдущей`);
  for (const c of tl.cues) {
    const s = tl.scenes.find((x) => x.id === c.scene);
    assert.ok(c.from >= s.from && c.to <= s.to, `${c.id} выходит за сцену`);
  }
};

test("шкала по оценке текста", () => checkTimeline(buildTimeline(estimateManifest())));

test("озвучка (если есть; обязательна при BG15_STRICT_VOICE=1)", (t) => {
  const m = manifest();
  if (!m) {
    if (strict) assert.fail("нет public/audio/campaign50/bg-015/manifest.json");
    t.skip("озвучки ещё нет");
    return;
  }
  const files = new Set(BG15_LINES.map((l) => `${BG15_VIDEO.voiceDir}/${l.id}.mp3`).filter((p) => existsSync(join("public", p))));
  const ok = requireManifest(m, files);
  checkTimeline(buildTimeline(ok));
});
