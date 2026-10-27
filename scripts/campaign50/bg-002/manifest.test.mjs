import assert from "node:assert/strict";
import { test } from "node:test";
import { BG2_LINES, BG2_VIDEO } from "../../../src/campaign50/bg-002/script.ts";
import { estimateBg2Manifest } from "../../../src/campaign50/bg-002/timing.ts";
import { requireBg2Manifest } from "../../../src/campaign50/bg-002/manifestGuard.ts";

// Фикстура содержит метаданные, но не выдаётся за созданную озвучку.
const fixture = () => ({
  ...estimateBg2Manifest(),
  estimated: false,
  lines: estimateBg2Manifest().lines.map(ml => {
    const l = BG2_LINES.find(x => x.id === ml.id);
    return { ...ml, file: `${ml.id}.mp3`, text: l.text, spoken: l.spoken ?? l.text };
  }),
});
const files = () => new Set(BG2_LINES.map(l => `${BG2_VIDEO.voiceDir}/${l.id}.mp3`));

test("без манифеста финальный ролик не собирается", () => {
  assert.throws(() => requireBg2Manifest(null), /не создана/);
});

test("оценочная и частичная озвучка отклоняются", () => {
  assert.throws(() => requireBg2Manifest(estimateBg2Manifest()), /неполная/);
  assert.throws(() => requireBg2Manifest({ ...fixture(), partial: true }), /неполная/);
});

test("отсутствующая реплика не заменяется оценкой по тексту", () => {
  const m = fixture();
  m.lines.shift();
  assert.throws(() => requireBg2Manifest(m, files()), /n01: нет/);
});

test("отсутствующий MP3 останавливает рендер", () => {
  const names = files();
  names.delete(`${BG2_VIDEO.voiceDir}/n01.mp3`);
  assert.throws(() => requireBg2Manifest(fixture(), names), /n01: нет MP3/);
});

test("устаревший текст озвучки останавливает рендер", () => {
  const m = fixture();
  m.lines[0].text = "Башка сөздөр";
  assert.throws(() => requireBg2Manifest(m, files()), /n01: текст устарел/);
});

test("полные согласованные метаданные допускаются", () => {
  const m = fixture();
  assert.equal(requireBg2Manifest(m, files()), m);
});
