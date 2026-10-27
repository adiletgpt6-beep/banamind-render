// Тесты BalaGoBG023: тексты сценария, правила AGENTS.md/CLAUDE.md, шкала CTA.
//   node --test scripts/campaign50/bg-023/bg023.test.mjs
// BG23_STRICT_VOICE=1 — требовать полную озвучку (CI перед рендером).
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  BG23_CTA,
  BG23_CTA_FADE_IN,
  BG23_LINES,
  BG23_SUBS,
  BG23_VIDEO,
  buildBg23Subs,
  buildBg23Timeline,
  spokenWords,
} from "../../../src/campaign50/bg-023/script.ts";

const MANIFEST = join("public", BG23_VIDEO.voiceDir, "manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const voiceText = BG23_LINES.map((l) => l.spoken).join(" ");
const allText = [...BG23_LINES.map((l) => l.text), ...Object.values(BG23_CTA)].join(" ");

test("реплики сценария 24-BG-023.md дословно", () => {
  const ep = readFileSync("campaigns/balago-50/episodes/24-BG-023.md", "utf8");
  for (const l of BG23_LINES.filter((x) => x.scene !== "cta")) assert.ok(ep.includes(l.text), l.id);
  const ctaSrc = "BalaGo — Бишкектеги балдар үчүн такси. Профилдеги шилтемеге өтүп балаңызды каттаңыз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз. BalaGo менен жолго чыгалы!";
  assert.ok(ep.includes(ctaSrc));
  // единственная правка — запятая после деепричастия «өтүп»
  const cta = BG23_LINES.filter((x) => x.scene === "cta").map((l) => l.text).join(" ");
  assert.equal(cta.replace("өтүп,", "өтүп"), ctaSrc);
});

test("Бишкек и оба способа связи в голосе и в кадре", () => {
  assert.match(voiceText, /Бишкек/);
  assert.match(voiceText, /Профилдеги шилтемеге/);
  assert.match(voiceText, /вотсап/);
  assert.match(voiceText, /жолго чыгалы/);
  assert.equal(BG23_CTA.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG23_CTA.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG23_CTA.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG23_CTA.phone, "WhatsApp: 0998 08 38 28");
  const cta = readFileSync("src/campaign50/bg-023/Cta.tsx", "utf8");
  for (const k of ["city", "link", "or", "go"]) assert.ok(cta.includes(`BG23_CTA.${k}`), k);
  assert.ok(cta.includes("0998 08 38 28"));
});

test("номер в речи читается полностью и верно", () => {
  const c2 = BG23_LINES.find((l) => l.id === "c2-contacts").spoken;
  assert.match(c2, /нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/);
});

test("нет обращения на «сен», еды, GPS и неподтверждённых обещаний", () => {
  const src = readdirSync("src/campaign50/bg-023").map((f) => readFileSync(join("src/campaign50/bg-023", f), "utf8")).join("\n");
  const ky = allText + " " + src;
  assert.doesNotMatch(ky, /(?<!\p{L})(сен|сага|сени|сенин|сенде)(?!\p{L})/iu);
  assert.doesNotMatch(ky, /тамак|печенье|шире|момпосуй|GPS|кресло|ар дайым 4|төрт орун/iu);
  assert.match(src, /2 жумага чейин/);
  assert.match(src, /топ даяр болгондон кийин гана/);
  assert.match(src, /коопсуз орун болсо гана/);
  assert.match(src, /Шарттуу мисал/);
});

test("титры покрывают все слова синтеза", () => {
  for (const l of BG23_LINES) {
    const subs = BG23_SUBS[l.id];
    assert.ok(subs, l.id);
    assert.equal(subs.reduce((a, [, k]) => a + k, 0), spokenWords(l.spoken).length, l.id);
    assert.equal(subs.map(([t]) => t).join(" "), l.text, l.id);
  }
});

const checkTimeline = (tl) => {
  const cta = tl.scenes.at(-1);
  assert.ok(cta.to - tl.lastWordEnd >= 3, "≥ 3 с после последнего слова");
  assert.ok(cta.to - tl.contactsFrom >= 5, "контакты ≥ 5 с");
  assert.ok(BG23_CTA_FADE_IN < 1);
  assert.ok(tl.durationSec >= 55 && tl.durationSec <= 85, `длительность ${tl.durationSec}`);
  for (let i = 1; i < tl.cues.length; i++) assert.ok(tl.cues[i].from >= tl.cues[i - 1].to + 0.3, "реплики не накладываются");
  for (const c of tl.cues) {
    const sc = tl.scenes.find((s) => s.id === c.scene);
    assert.ok(c.from >= sc.from && c.to <= sc.to, `${c.id} в своей сцене`);
  }
  const subs = buildBg23Subs(tl);
  for (let i = 1; i < subs.length; i++) assert.ok(subs[i].from >= subs[i - 1].from);
};

test("шкала по оценке", () => checkTimeline(buildBg23Timeline(null)));

test("озвучка: все реплики, файлы, шкала", { skip: !manifest && !process.env.BG23_STRICT_VOICE }, () => {
  assert.ok(manifest, "нет manifest.json");
  const tl = buildBg23Timeline(manifest);
  assert.equal(tl.estimated, false);
  for (const l of manifest.lines) assert.ok(existsSync(join("public", BG23_VIDEO.voiceDir, l.file)), l.file);
  checkTimeline(tl);
  console.log(`  длительность ${tl.durationSec} с, последнее слово ${tl.lastWordEnd} с`);
});
