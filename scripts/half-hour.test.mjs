// Тесты десятого 3D-сценария (BalaGoHalfHour): формат, монтаж по реальным (или
// оценочным) длительностям, озвучка, финальный экран и ограничения.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { HH_LINES, HH_TEXT, HH_VIDEO, HH_VOICE_CHOICE } from "../src/half-hour/script.ts";
import {
  checkTimeline,
  estimateHHManifest,
  HH_ANCHORS,
  HH_SHOTS,
  placeLines,
} from "../src/half-hour/timeline.ts";

const MANIFEST = join("public", HH_VIDEO.voiceDir, "manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;

test("формат: 1080×1920, 30 fps, ровно 120 с", () => {
  assert.equal(HH_VIDEO.width, 1080);
  assert.equal(HH_VIDEO.height, 1920);
  assert.equal(HH_VIDEO.fps, 30);
  assert.equal(HH_VIDEO.durationSec, 120);
  const root = readFileSync("src/Root.tsx", "utf8");
  assert.match(root, /id=\{HH_VIDEO\.id\}/);
});

test("сцены покрывают 0–120 с без пропусков, финальный экран ≥ 6 с", () => {
  let t = 0;
  for (const s of HH_SHOTS) {
    assert.equal(s.from, t, `сцена ${s.id} начинается не встык`);
    assert.ok(s.to > s.from);
    t = s.to;
  }
  assert.equal(t, 120);
  const cta = HH_SHOTS.find((s) => s.id === "cta");
  assert.ok(cta.to - cta.from >= 6);
  assert.ok(cta.from >= HH_VIDEO.speechEndMaxSec);
});

test("монтаж по оценке: речь не пересекается и заканчивается до 114 с", () => {
  const lines = placeLines(estimateHHManifest());
  assert.deepEqual(checkTimeline(lines), []);
  for (let i = 1; i < lines.length; i++) assert.ok(lines[i].speechFromSec >= lines[i - 1].speechToSec);
});

test("у каждой реплики есть якорь и сцена", () => {
  for (const l of HH_LINES) assert.ok(HH_ANCHORS[l.id], l.id);
});

test("озвучка (если есть): все реплики, файлы на месте, монтаж укладывается", { skip: !manifest }, () => {
  assert.equal(manifest.kind, "half-hour");
  const ids = manifest.lines.map((l) => l.id);
  for (const l of HH_LINES) assert.ok(ids.includes(l.id), `нет реплики ${l.id}`);
  for (const l of manifest.lines) {
    assert.ok(existsSync(join("public", HH_VIDEO.voiceDir, l.file)), l.file);
    assert.equal(l.voiceId, HH_VOICE_CHOICE[l.role]?.voiceId ?? l.voiceId);
  }
  assert.deepEqual(checkTimeline(placeLines(manifest)), []);
});

test("кыргызский текст: буквы ү, ө, ң на месте; без WhatsApp", () => {
  const all = JSON.stringify({ HH_LINES, HH_TEXT });
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
  assert.doesNotMatch(all, /whats|вотсап|wa\.me/i);
});

test("финальный экран: тексты как в задании", () => {
  assert.equal(HH_TEXT.cta.tagline, "Балдар үчүн такси");
  assert.equal(HH_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(HH_TEXT.cta.status, "Алдын ала каттоо жүрүп жатат");
  assert.equal(HH_TEXT.cta.button, "Баланы каттоо");
  assert.equal(HH_TEXT.cta.link, "Профилдеги шилтеме аркылуу");
});

test("без подтверждённой поездки: только предварительная заявка", () => {
  const all = JSON.stringify({ HH_LINES, HH_TEXT }).toLowerCase();
  for (const bad of ["айдоочу келди", "сапар ырасталды", "буйрутма кабыл алынды", "баасы", "сом"])
    assert.ok(!all.includes(bad), bad);
  assert.match(HH_TEXT.form.sent, /байланышабыз/);
});

test("голоса ролей различаются", () => {
  const ids = Object.values(HH_VOICE_CHOICE).map((v) => v?.voiceId);
  assert.equal(new Set(ids).size, ids.length);
});
