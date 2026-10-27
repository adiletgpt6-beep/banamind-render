// Тесты ролика BalaGoNoBackup (сценарий №11): формат, монтаж по реальным
// (или оценочным) длительностям, озвучка, финальный экран и ограничения.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { NB_LINES, NB_TEXT, NB_VIDEO, NB_VOICE_CHOICE } from "../src/no-backup/script.ts";
import { checkTimeline, estimateNBManifest, NB_ANCHORS, NB_SHOTS, placeLines } from "../src/no-backup/timeline.ts";

const MANIFEST = join("public", NB_VIDEO.voiceDir, "manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;

test("формат: 1080×1920, 30 fps, ровно 120 с", () => {
  assert.equal(NB_VIDEO.width, 1080);
  assert.equal(NB_VIDEO.height, 1920);
  assert.equal(NB_VIDEO.fps, 30);
  assert.equal(NB_VIDEO.durationSec, 120);
  assert.match(readFileSync("src/Root.tsx", "utf8"), /id=\{NB_VIDEO\.id\}/);
});

test("сцены по сценарию покрывают 0–120 с, финальный экран — полные 6 с", () => {
  let t = 0;
  for (const s of NB_SHOTS) {
    assert.equal(s.from, t, `сцена ${s.id} начинается не встык`);
    assert.ok(s.to > s.from);
    t = s.to;
  }
  assert.equal(t, 120);
  const cta = NB_SHOTS.find((s) => s.id === "cta");
  assert.equal(cta.from, 114);
  assert.equal(cta.to - cta.from, 6);
  const plan = { morning: [0, 14], call: [14, 32], tries: [32, 47], decide: [47, 61], drive: [61, 80], office: [80, 94], evening: [94, 108], form: [108, 114] };
  for (const [id, [a, b]] of Object.entries(plan)) {
    const s = NB_SHOTS.find((x) => x.id === id);
    assert.deepEqual([s.from, s.to], [a, b], id);
  }
});

test("монтаж по оценке: речь не пересекается и заканчивается до финала", () => {
  const lines = placeLines(estimateNBManifest());
  assert.deepEqual(checkTimeline(lines), []);
  for (let i = 1; i < lines.length; i++) assert.ok(lines[i].speechFromSec >= lines[i - 1].speechToSec);
  assert.ok(lines[lines.length - 1].speechToSec <= NB_VIDEO.ctaFromSec);
});

test("у каждой реплики есть якорь и сцена", () => {
  for (const l of NB_LINES) assert.ok(NB_ANCHORS[l.id], l.id);
});

test("озвучка (если есть): все реплики, файлы на месте, монтаж укладывается", { skip: !manifest }, () => {
  assert.equal(manifest.kind, "no-backup");
  const ids = manifest.lines.map((l) => l.id);
  for (const l of NB_LINES) assert.ok(ids.includes(l.id), `нет реплики ${l.id}`);
  for (const l of manifest.lines) assert.ok(existsSync(join("public", NB_VIDEO.voiceDir, l.file)), l.file);
  const placed = placeLines(manifest);
  assert.deepEqual(checkTimeline(placed), []);
  for (let i = 1; i < placed.length; i++) assert.ok(placed[i].speechFromSec >= placed[i - 1].speechToSec + 0.2, `наложение ${placed[i].id}`);
  // у каждой роли свой голос
  const byRole = new Map();
  for (const l of manifest.lines) byRole.set(l.role, l.voiceId);
  assert.equal(new Set(byRole.values()).size, byRole.size);
});

test("кыргызский текст: буквы ү, ө, ң на месте; без WhatsApp", () => {
  const all = JSON.stringify({ NB_LINES, NB_TEXT });
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
  assert.doesNotMatch(all, /whats|вотсап|wa\.me/i);
});

test("финальный экран и форма: тексты как в задании", () => {
  assert.equal(NB_TEXT.cta.tagline, "Балдар үчүн такси");
  assert.equal(NB_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(NB_TEXT.cta.status, "Алдын ала каттоо жүрүп жатат");
  assert.equal(NB_TEXT.cta.button, "Баланы каттоо");
  assert.equal(NB_TEXT.cta.link, "Профилдеги шилтеме аркылуу");
  assert.equal(NB_TEXT.form.title, "Алдын ала каттоо");
  assert.deepEqual([NB_TEXT.form.name, NB_TEXT.form.school, NB_TEXT.form.address, NB_TEXT.form.time], ["Аты-жөнү", "Мектеп", "Дарек", "Убакыт"]);
  assert.equal(NB_TEXT.form.send, "Арызды жөнөтүү");
  assert.equal(NB_TEXT.form.sent, "Арыз жөнөтүлдү. Сиз менен байланышабыз.");
});

test("без подтверждённых поездок, цен, гарантий и дат", () => {
  const all = JSON.stringify({ NB_LINES, NB_TEXT }).toLowerCase();
  for (const bad of ["айдоочу келди", "сапар ырасталды", "буйрутма кабыл алынды", "баасы", " сом", "кепилдик", "ишке кирди"])
    assert.ok(!all.includes(bad), bad);
});

test("голоса ролей различаются", () => {
  const ids = Object.values(NB_VOICE_CHOICE).map((v) => (v && typeof v === "object" ? v.voiceId : String(v)));
  assert.equal(new Set(ids).size, ids.length);
});
