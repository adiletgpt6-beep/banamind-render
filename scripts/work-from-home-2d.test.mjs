// Тесты BalaGoWorkFromHome2D (№28): шкала, тексты, озвучка.
// Запуск: node --test scripts/work-from-home-2d.test.mjs
// WFH_STRICT_VOICE=1 — нужна полная актуальная озвучка всех 19 реплик
// (задача render в work-from-home-2d.yml).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  WFH_CARD_FRAMES,
  WFH_CARD_FROM,
  WFH_DURATION,
  WFH_FRAMES,
  WFH_LINES,
  WFH_SCENES,
  WFH_TEXT,
  WFH_VIDEO,
  WFH_VOICES,
} from "../src/work-from-home-2d/script.ts";
import { buildWfhCues, checkWfhTiming } from "../src/work-from-home-2d/timing.ts";
import { voiceOfRole, wfhHash } from "./lib/wfh2d-tts.mjs";

const MANIFEST = `public/${WFH_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const strict = process.env.WFH_STRICT_VOICE === "1";

test("формат: 1080×1920, 30 fps, 2:20–2:40, карточка — последние 150 кадров", () => {
  assert.equal(WFH_VIDEO.id, "BalaGoWorkFromHome2D");
  assert.equal(WFH_VIDEO.width, 1080);
  assert.equal(WFH_VIDEO.height, 1920);
  assert.equal(WFH_VIDEO.fps, 30);
  assert.ok(WFH_DURATION >= 140 && WFH_DURATION <= 162, `длительность ${WFH_DURATION} с`);
  assert.equal(WFH_FRAMES, Math.round(WFH_DURATION * 30));
  assert.equal(WFH_CARD_FRAMES, 150);
  assert.equal(WFH_CARD_FROM, WFH_FRAMES - 150);
  const card = WFH_SCENES.at(-1);
  assert.equal(card.id, "card");
  assert.equal(Math.round(card.from * 30), WFH_CARD_FROM);
});

test("14 сцен подряд, без промежутков", () => {
  assert.equal(WFH_SCENES.length, 14);
  assert.equal(WFH_SCENES[0].from, 0);
  for (let i = 1; i < WFH_SCENES.length; i++) assert.equal(WFH_SCENES[i].from, WFH_SCENES[i - 1].to, WFH_SCENES[i].id);
  for (const s of WFH_SCENES) assert.ok(s.to - s.from >= 4.9, s.id);
});

test("19 реплик в порядке монтажа, роли по сценарию", () => {
  assert.deepEqual(
    WFH_LINES.map((l) => l.id),
    ["N01", "N02", "N03", "N04", "N05", "F01", "M01", "N06", "N07", "N08", "N09", "F02", "M02", "B01", "N10", "N11", "B02", "M03", "N12"],
  );
  const role = { N: "narrator", F: "father", M: "mother", B: "son" };
  for (const l of WFH_LINES) {
    assert.equal(l.role, role[l.id[0]], l.id);
    assert.equal(l.mode, l.role === "narrator" ? "narration" : "dialogue", l.id);
  }
  for (let i = 1; i < WFH_LINES.length; i++) assert.ok(WFH_LINES[i].at > WFH_LINES[i - 1].at, WFH_LINES[i].id);
  for (const l of WFH_LINES) {
    const s = WFH_SCENES.find((x) => x.id === l.scene);
    assert.ok(l.at >= s.from && l.at < s.to, `${l.id} вне сцены ${l.scene}`);
  }
  assert.equal(WFH_LINES.find((l) => l.id === "M02").text.startsWith("Жок, ошол эле."), true);
  assert.equal(WFH_LINES.find((l) => l.id === "B01").text, "Апа, жазганымды карачы. Шашпай карасаң, ээ?");
  assert.equal(WFH_LINES.find((l) => l.id === "N09").text, "Саат беш жарымда ал ноутбугун жапты.");
});

const strings = (x) => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(strings) : []);

test("кыргызский текст: кириллица с ү, ө, ң; латиница только в BalaGo и WhatsApp", () => {
  const all = [...WFH_LINES.flatMap((l) => [l.text, l.spoken ?? ""]), ...strings(WFH_TEXT)].join(" ");
  const latin = all.replace(/BalaGo|WhatsApp/g, "").match(/[A-Za-z]+/g);
  assert.equal(latin, null, `латиница: ${latin}`);
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
  // TTS читает бренд по-кыргызски, субтитры — BalaGo
  for (const l of WFH_LINES) {
    if (l.text.includes("BalaGo")) assert.ok(l.spoken && !l.spoken.includes("BalaGo") && l.spoken.includes("БалаГо"), l.id);
  }
  // цифры 17:30 не озвучиваются цифрами
  for (const l of WFH_LINES) assert.ok(!/\d/.test(l.spoken ?? l.text), `${l.id}: цифры в речи`);
});

test("номер WhatsApp только на контактной карточке, бренд не раньше поиска", () => {
  const { card, ...rest } = WFH_TEXT;
  assert.equal(card.whatsappNumber, "0998 08 38 28");
  const other = strings(rest).join(" ");
  assert.ok(!/0998|083828|08 38 28/.test(other), "номер вне карточки");
  for (const l of WFH_LINES) assert.ok(!/0998|08 38 28/.test(l.text), `${l.id}: номер в речи`);
  const firstBrand = WFH_LINES.find((l) => l.text.includes("BalaGo"));
  assert.equal(firstBrand.id, "N11");
  assert.equal(WFH_TEXT.form.sent, "Өтүнмө жөнөтүлдү");
});

test("каждой роли — свой голос", () => {
  const ids = Object.values(WFH_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, ids.length);
});

test("озвучка: все 19 реплик ровно по одному разу, актуальные и в шкале", { skip: !strict && !manifest }, () => {
  assert.ok(manifest, "нет manifest.json");
  assert.equal(manifest.partial, false);
  for (const l of WFH_LINES) {
    const m = manifest.lines.filter((x) => x.id === l.id);
    assert.equal(m.length, 1, `${l.id}: ${m.length} файлов`);
    const ml = m[0];
    assert.ok(existsSync(`public/${WFH_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.hash, wfhHash(l, voiceOfRole(l.role).voiceId), `${l.id}: хэш устарел`);
    assert.equal(ml.voiceId, WFH_VOICES[l.role].voiceId, `${l.id}: голос`);
    assert.ok(ml.words?.length && ml.chars?.length && ml.env?.length, `${l.id}: тайминги`);
  }
  assert.equal(manifest.lines.length, WFH_LINES.length);
  assert.deepEqual(checkWfhTiming(manifest.lines), []);
  // речь заканчивается внутри файла
  const cues = buildWfhCues(manifest);
  for (const c of cues) assert.ok(c.audioFrom + c.durationSec <= WFH_DURATION - 0.3, `${c.id}: файл за концом`);
});

test("timeline.json и docs/work-from-home-2d/lines.md соответствуют шкале и озвучке", { skip: !manifest }, () => {
  const path = `public/${WFH_VIDEO.voiceDir}/timeline.json`;
  assert.ok(existsSync(path), "нет timeline.json — node scripts/wfh2d-docs.mjs");
  const tl = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(tl.frames, WFH_FRAMES);
  const cues = buildWfhCues(manifest);
  for (const c of cues) {
    const r = tl.lines.find((x) => x.id === c.id);
    assert.ok(r && Math.abs(r.montageFrom - c.from) < 0.011 && Math.abs(r.montageTo - c.to) < 0.011, `${c.id}: тайминг устарел — node scripts/wfh2d-docs.mjs`);
  }
});
