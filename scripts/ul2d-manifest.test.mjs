import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { UL2_LINES, UL2_VIDEO } from "../src/unanswered-letter-2d/script.ts";
import { estimateUl2Manifest } from "../src/unanswered-letter-2d/timing.ts";
import { requireUl2Manifest } from "../src/unanswered-letter-2d/manifestGuard.ts";

// Фикстура содержит метаданные, но не выдаётся за созданную озвучку.
// Длительности — из реального manifest (если озвучка уже есть), иначе оценка.
const REAL = `public/${UL2_VIDEO.voiceDir}/manifest.json`;
const base = () => (existsSync(REAL) ? JSON.parse(readFileSync(REAL, "utf8")).lines : estimateUl2Manifest().lines);
const fixture = () => ({
  ...estimateUl2Manifest(),
  estimated: false,
  lines: base().map(ml => {
    const l = UL2_LINES.find(x => x.id === ml.id);
    return { ...ml, file: `${ml.id}.mp3`, text: l.text, spoken: l.spoken ?? l.text };
  }),
});
const files = () => new Set(UL2_LINES.map(l => `${UL2_VIDEO.voiceDir}/${l.id}.mp3`));

test("без манифеста финальный ролик не собирается", () => {
  assert.throws(() => requireUl2Manifest(null), /не создана/);
});

test("оценочная и частичная озвучка отклоняются", () => {
  assert.throws(() => requireUl2Manifest(estimateUl2Manifest()), /неполная/);
  assert.throws(() => requireUl2Manifest({ ...fixture(), partial: true }), /неполная/);
});

test("отсутствующая реплика не заменяется оценкой по тексту", () => {
  const m = fixture();
  m.lines.shift();
  assert.throws(() => requireUl2Manifest(m, files()), /n01: нет/);
});

test("отсутствующий MP3 останавливает рендер", () => {
  const names = files();
  names.delete(`${UL2_VIDEO.voiceDir}/m01.mp3`);
  assert.throws(() => requireUl2Manifest(fixture(), names), /m01: нет MP3/);
});

test("устаревший текст озвучки останавливает рендер", () => {
  const m = fixture();
  m.lines[0].text = "Башка сөздөр";
  assert.throws(() => requireUl2Manifest(m, files()), /n01: текст устарел/);
});

test("полные согласованные метаданные допускаются", () => {
  const m = fixture();
  assert.equal(requireUl2Manifest(m, files()), m);
});
