// Сопроводительные файлы фильма №36 по ФАКТИЧЕСКОЙ шкале (манифест озвучки):
//   out/balago-36-suitcase-by-the-door-ky.srt — субтитры UTF-8, те же
//     смысловые порции и строки, что в кадре (src/suitcase-by-the-door-2d/
//     subtitleChunks.ts), начало порции — по слову озвучки;
//   out/balago-36-suitcase-by-the-door-voice-script-ky.txt — итоговая речь
//     по порядку (ID, роль, голос, время, текст);
//   out/scene-timeline.json — сцены S01–S16 и реплики с фактическими
//     кадрами и секундами, связанное действие, голос, файл.
// Запуск после создания озвучки: node scripts/sd2d-deliverables.mjs [папка]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SD2_LINES, SD2_SCENE_SPECS, SD2_SEG_SPECS, SD2_VIDEO, SD2_VOICES } from "../src/suitcase-by-the-door-2d/script.ts";
import { buildSd2Timeline } from "../src/suitcase-by-the-door-2d/timing.ts";
import { chunkWords, spokenIndex, twoLines } from "../src/suitcase-by-the-door-2d/subtitleChunks.ts";

const outDir = process.argv[2] ?? "out";
mkdirSync(outDir, { recursive: true });
const manifest = JSON.parse(readFileSync(join("public", SD2_VIDEO.voiceDir, "manifest.json"), "utf8"));
const tl = buildSd2Timeline(manifest);
const fps = SD2_VIDEO.fps;
const r3 = (x) => Number(x.toFixed(3));
const ts = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const z = (n, w = 2) => String(n).padStart(w, "0");
  return `${z(h)}:${z(m)}:${z(s)},${z(ms % 1000, 3)}`;
};

// SRT: та же логика, что Subtitles.tsx (появление за 0,08 с до слова, порция
// держится до начала следующей, последняя — до конца речи + 0,3 с).
const entries = [];
for (const c of tl.cues) {
  const line = SD2_LINES.find((l) => l.id === c.id);
  const words = line.text.split(/\s+/).filter(Boolean);
  const chunks = chunkWords(line.text);
  const starts = chunks.map(([a], k) => (k === 0 ? c.from - 0.08 : (c.words[spokenIndex(line.text, a)]?.start ?? c.from) - 0.06));
  chunks.forEach(([a, b], k) => {
    const from = starts[k];
    const to = k + 1 < chunks.length ? starts[k + 1] : c.to + 0.3;
    const text = twoLines(words.slice(a, b)).map((ln) => ln.join(" ")).join("\n");
    entries.push({ from, to, text });
  });
}
// без наложений: порция заканчивается не позже начала следующей
entries.forEach((e, i) => {
  if (entries[i + 1] && e.to > entries[i + 1].from - 0.02) e.to = entries[i + 1].from - 0.02;
});
const srt = entries.map((e, i) => `${i + 1}\n${ts(e.from)} --> ${ts(e.to)}\n${e.text}\n`);
const n = entries.length + 1;
const base = "balago-36-suitcase-by-the-door";
writeFileSync(join(outDir, `${base}-ky.srt`), srt.join("\n"), "utf8");

// Текст озвучки
const ROLE = { narrator: "Рассказчик (N)", mother: "Мама (M)", father: "Папа (P)", son: "Сын (C)" };
const txt = [
  `BalaGo №36 «Чемодан у двери» (Эшиктин жанындагы чемодан) — итоговая кыргызская озвучка`,
  `Композиция ${SD2_VIDEO.id}, ${(tl.frames / fps).toFixed(2)} с (${tl.frames} кадров, ${fps} к/с). Голоса ElevenLabs eleven_v3, ky:`,
  ...Object.entries(SD2_VOICES).map(([r, v]) => `  ${ROLE[r]} — ${v.name} (${v.voiceId})`),
  `Обозначения N, M, P, C и номера не озвучиваются. В синтез бренд передаётся как «БалаГо».`,
  "",
];
let scene = "";
for (const c of tl.cues) {
  const sc = SD2_SCENE_SPECS.find((s) => s.id === c.scene);
  if (sc.id !== scene) {
    scene = sc.id;
    txt.push(`${sc.title}`);
  }
  const line = SD2_LINES.find((l) => l.id === c.id);
  txt.push(`  ${c.id} · ${ROLE[c.role]} · ${ts(c.from).slice(3)}–${ts(c.to).slice(3)}`);
  txt.push(`    ${line.text}`);
}
writeFileSync(join(outDir, `${base}-voice-script-ky.txt`), txt.join("\n") + "\n", "utf8");

// Шкала сцен
const tlJson = {
  video: SD2_VIDEO.id,
  fps,
  frames: tl.frames,
  durationSec: r3(tl.frames / fps),
  ctaAssembledFrame: tl.ctaAssembledFrame,
  ctaHoldSec: r3((tl.frames - tl.ctaAssembledFrame) / fps),
  scenes: tl.scenes.map((s) => {
    const spec = SD2_SCENE_SPECS.find((x) => x.id === s.id);
    return { code: spec.code, id: s.id, title: spec.title, fromFrame: s.from, toFrame: s.to, from: r3(s.from / fps), to: r3(s.to / fps), durationSec: r3((s.to - s.from) / fps) };
  }),
  lines: tl.cues.map((c) => {
    const ml = manifest.lines.find((l) => l.id === c.id);
    return {
      id: c.id,
      scene: c.scene,
      role: c.role,
      voice: ml?.voiceName ?? null,
      text: SD2_LINES.find((l) => l.id === c.id).text,
      file: c.file ?? null,
      speechFrom: r3(c.from),
      speechTo: r3(c.to),
      measuredDurationSec: r3(c.to - c.from),
      fileDurationSec: ml?.durationSec ?? null,
      asrCer: ml?.asrCer ?? null,
      action: SD2_SEG_SPECS.find((x) => x.id === c.id).action,
    };
  }),
};
writeFileSync(join(outDir, "scene-timeline.json"), JSON.stringify(tlJson, null, 2) + "\n", "utf8");
console.log(`✓ ${outDir}/${base}-ky.srt (${n - 1} порций), ${base}-voice-script-ky.txt, scene-timeline.json — ${(tl.frames / fps).toFixed(2)} с`);
