import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { FU2_LINES, FU2_VIDEO } from "../src/five-unsent-messages-2d/script.ts";
import { estimateFu2Manifest } from "../src/five-unsent-messages-2d/timing.ts";
import { requireFu2Manifest } from "../src/five-unsent-messages-2d/manifestGuard.ts";

// Фикстура содержит метаданные, но не выдаётся за созданную озвучку.
// Длительности — из реального manifest (если озвучка уже есть), иначе оценка.
const REAL = `public/${FU2_VIDEO.voiceDir}/manifest.json`;
const base = () => (existsSync(REAL) ? JSON.parse(readFileSync(REAL, "utf8")).lines : estimateFu2Manifest().lines);
const fixture = () => ({
  ...estimateFu2Manifest(),
  estimated: false,
  lines: base().map(ml => {
    const l = FU2_LINES.find(x => x.id === ml.id);
    return { ...ml, file: `${ml.id}.mp3`, text: l.text, spoken: l.spoken ?? l.text };
  }),
});
const files = () => new Set(FU2_LINES.map(l => `${FU2_VIDEO.voiceDir}/${l.id}.mp3`));

test("без манифеста финальный ролик не собирается", () => {
  assert.throws(() => requireFu2Manifest(null), /не создана/);
});

test("оценочная и частичная озвучка отклоняются", () => {
  assert.throws(() => requireFu2Manifest(estimateFu2Manifest()), /неполная/);
  assert.throws(() => requireFu2Manifest({ ...fixture(), partial: true }), /неполная/);
});

test("отсутствующая реплика не заменяется оценкой по тексту", () => {
  const m = fixture();
  m.lines.shift();
  assert.throws(() => requireFu2Manifest(m, files()), /n01: нет/);
});

test("отсутствующий MP3 останавливает рендер", () => {
  const names = files();
  names.delete(`${FU2_VIDEO.voiceDir}/f01.mp3`);
  assert.throws(() => requireFu2Manifest(fixture(), names), /f01: нет MP3/);
});

test("устаревший текст озвучки останавливает рендер", () => {
  const m = fixture();
  m.lines[0].text = "Башка сөздөр";
  assert.throws(() => requireFu2Manifest(m, files()), /n01: текст устарел/);
});

test("полные согласованные метаданные допускаются", () => {
  const m = fixture();
  assert.equal(requireFu2Manifest(m, files()), m);
});
