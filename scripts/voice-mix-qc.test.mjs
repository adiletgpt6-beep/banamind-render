import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectVoiceClip, VOICE_QC_RATE, voiceManifestProblems } from "./lib/voice-mix-qc.mjs";

const rate = VOICE_QC_RATE;
const line = { id: "sample", text: "Сыноо", at: 0.4 };
const manifestLine = { id: line.id, text: line.text, file: "sample.mp3", durationSec: 2, speechStart: 0.1, speechEnd: 1.85 };
const source = Float32Array.from({ length: 2 * rate }, (_, i) => {
  const t = i / rate;
  return t < 0.1 || t > 1.85 ? 0 : 0.18 * Math.sin(2 * Math.PI * (190 * t + 20 * t * t)) * (0.7 + 0.3 * Math.sin(19 * t));
});
const mixWith = (gain, cutAt = Infinity) => Float32Array.from({ length: 3 * rate }, (_, i) => {
  const t = i / rate;
  const j = i - Math.round(0.325 * rate); // начало файла 0,3 с + задержка кодека 25 мс
  return 0.004 * Math.sin(2 * Math.PI * 347 * t) + (j >= 0 && j < source.length && j / rate < cutAt ? gain * source[j] : 0);
});
const inspect = mix => inspectVoiceClip(mix, source, { line, manifestLine, fps: 30 });

test("громкая музыка без речи не проходит проверку голосов", () => {
  const music = Float32Array.from({ length: 3 * rate }, (_, i) => 0.3 * Math.sin(2 * Math.PI * 347 * i / rate));
  assert.ok(inspect(music).problems.some(p => p.includes("отсутствует")));
});

test("голос в миксе и допустимая задержка AAC принимаются", () => {
  const result = inspect(mixWith(1));
  assert.deepEqual(result.problems, []);
  assert.ok(Math.abs(result.speech.lagSec - 0.025) < 0.002);
});

test("тихий голос при звучащем фоне отклоняется", () => {
  assert.ok(inspect(mixWith(0.03)).problems.some(p => p.includes("слишком тихая")));
});

test("исчезновение последнего слова выявляется отдельно от всей реплики", () => {
  const result = inspect(mixWith(1, 1.5));
  assert.ok(result.problems.some(p => p.includes("окончание")));
});

test("манифест с пропущенной репликой не считается полной озвучкой", () => {
  const required = [line, { id: "missing", text: "Экинчи", at: 3 }];
  const m = { version: 1, kind: "fixture", lines: [manifestLine] };
  assert.ok(voiceManifestProblems(m, required, { kind: "fixture", hasFile: () => true }).includes("missing: нет реплики"));
});

test("изменённый текст и отсутствующий MP3 отклоняются до рендера", () => {
  const m = { version: 1, kind: "fixture", lines: [{ ...manifestLine, text: "Старый текст" }] };
  const problems = voiceManifestProblems(m, [line], { kind: "fixture", hasFile: () => false });
  assert.ok(problems.some(p => p.includes("устарел")));
  assert.ok(problems.some(p => p.includes("нет аудиофайла")));
});
