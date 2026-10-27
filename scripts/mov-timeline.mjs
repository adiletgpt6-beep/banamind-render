// Тайминги фильма №33 по фактической озвучке: начала сцен и начало/конец
// каждой реплики (секунды фильма). Пишет public/audio/moms-old-video/timeline.json
// и печатает таблицу Markdown (для отчёта и README).
// Запуск: node scripts/mov-timeline.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { lineById, MOV_DURATION, MOV_SCENES, MOV_VIDEO, MOV_VOICES } from "../src/moms-old-video/script.ts";
import { buildMovCues } from "../src/moms-old-video/timing.ts";

const manifest = JSON.parse(readFileSync(`public/${MOV_VIDEO.voiceDir}/manifest.json`, "utf8"));
const cues = buildMovCues(manifest);
const r2 = (x) => Math.round(x * 100) / 100;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
const data = {
  video: MOV_VIDEO.id,
  durationSec: MOV_DURATION,
  scenes: MOV_SCENES.map((s) => ({ id: s.id, title: s.title, from: s.from, to: s.to })),
  lines: cues.map((c) => {
    const l = lineById(c.id);
    return { id: c.id, role: c.role, voice: MOV_VOICES[c.role].name, scene: l.scene, from: r2(c.from), to: r2(c.to), text: l.text, spoken: l.spoken ?? l.text, file: c.file };
  }),
};
writeFileSync(`public/${MOV_VIDEO.voiceDir}/timeline.json`, JSON.stringify(data, null, 2) + "\n");
console.log("| Сцена | Время | Реплика | Роль | Начало–конец речи |\n| --- | --- | --- | --- | --- |");
for (const s of MOV_SCENES) {
  const ls = data.lines.filter((l) => l.scene === s.id);
  if (!ls.length) console.log(`| ${s.title} | ${fmt(s.from)}–${fmt(s.to)} | — (без речи) | | |`);
  ls.forEach((l, i) => console.log(`| ${i ? "" : s.title} | ${i ? "" : `${fmt(s.from)}–${fmt(s.to)}`} | «${l.text}» | ${l.role} | ${fmt(l.from)}–${fmt(l.to)} |`));
}
