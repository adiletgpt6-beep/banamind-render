// SRT фильма №35: та же финальная речь и те же фрагменты, что в субтитрах
// видео (src/programmers-hardest-task/Subtitles.tsx → chunkLine), с
// таймкодами по фактической озвучке. Без имён говорящих и номеров VO.
//   node scripts/pht-srt.mjs out/balago-35-programmers-hardest-task.srt
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { PHT_VIDEO } from "../src/programmers-hardest-task/script.ts";
import { planPht } from "../src/programmers-hardest-task/timing.ts";
import { chunkLine } from "../src/programmers-hardest-task/subtitleChunks.ts";

const out = process.argv[2] ?? "out/balago-35-programmers-hardest-task.srt";
const manifestPath = `public/${PHT_VIDEO.voiceDir}/manifest.json`;
if (!existsSync(manifestPath)) {
  console.error("Нет озвучки — SRT не создан.");
  process.exit(1);
}
const plan = planPht(JSON.parse(readFileSync(manifestPath, "utf8")));
const ts = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
const blocks = [];
for (const cue of plan.cues) for (const c of chunkLine(cue)) blocks.push(c);
const srt = blocks.map((b, i) => `${i + 1}\n${ts(b.from)} --> ${ts(b.to)}\n${b.words.join(" ")}\n`).join("\n");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, srt);
console.log(`✓ ${out}: ${blocks.length} фрагментов, ${plan.cues.length} реплик`);
