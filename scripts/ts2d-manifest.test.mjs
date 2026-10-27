import assert from "node:assert/strict";
import { test } from "node:test";
import { TS2_LINES, TS2_VIDEO } from "../src/two-schedules-2d/script.ts";
import { estimateTs2Manifest } from "../src/two-schedules-2d/timing.ts";
import { requireTs2Manifest } from "../src/two-schedules-2d/manifestGuard.ts";

// Фикстура содержит метаданные, но не выдаётся за созданную озвучку.
const fixture = () => ({
  ...estimateTs2Manifest(),
  estimated: false,
  lines: estimateTs2Manifest().lines.map(ml => {
    const l = TS2_LINES.find(x => x.id === ml.id);
    return { ...ml, file: `${ml.id}.mp3`, text: l.text, spoken: l.spoken ?? l.text };
  }),
});
const files = () => new Set(TS2_LINES.map(l => `${TS2_VIDEO.voiceDir}/${l.id}.mp3`));

test("без манифеста финальный ролик не собирается", () => {
  assert.throws(() => requireTs2Manifest(null), /не создана/);
});

test("оценочная и частичная озвучка отклоняются", () => {
  assert.throws(() => requireTs2Manifest(estimateTs2Manifest()), /неполная/);
  assert.throws(() => requireTs2Manifest({ ...fixture(), partial: true }), /неполная/);
});

test("отсутствующая реплика не заменяется оценкой по тексту", () => {
  const m = fixture();
  m.lines.shift();
  assert.throws(() => requireTs2Manifest(m, files()), /f01: нет/);
});

test("отсутствующий MP3 останавливает рендер", () => {
  const names = files();
  names.delete(`${TS2_VIDEO.voiceDir}/m01.mp3`);
  assert.throws(() => requireTs2Manifest(fixture(), names), /m01: нет MP3/);
});

test("устаревший текст озвучки останавливает рендер", () => {
  const m = fixture();
  m.lines[0].text = "Башка сөздөр";
  assert.throws(() => requireTs2Manifest(m, files()), /f01: текст устарел/);
});

test("полные согласованные метаданные допускаются", () => {
  const m = fixture();
  assert.equal(requireTs2Manifest(m, files()), m);
});
