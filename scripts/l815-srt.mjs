// Субтитры SRT Lesson80_1_5 по фактической звуковой дорожке: начало и конец
// каждой реплики — из манифеста озвучки и шкалы (timing.ts). Ответы на
// обязательные паузы начинаются не раньше своих реплик. Результат:
// out/lesson-80-1-5.srt (или путь в аргументе). Запуск: node scripts/l815-srt.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { L815_ROLE_NAMES, L815_VIDEO } from "../src/lesson-80-1-5/script.ts";
import { buildL815Timeline, estimateL815Manifest } from "../src/lesson-80-1-5/timing.ts";

const MANIFEST = join("public", L815_VIDEO.voiceDir, "manifest.json");
const out = process.argv[2] ?? join("out", `${L815_VIDEO.output}.srt`);
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateL815Manifest();
if (manifest.estimated) console.warn("⚠ Озвучки нет — субтитры по оценочным таймингам.");
const tl = buildL815Timeline(manifest);

const ts = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
// Максимум две строки: длинная реплика делится по словам поровну.
const wrap = (text, max = 44) => {
  if (text.length <= max) return [text];
  const words = text.split(" ");
  let best = -1;
  let bestDiff = Infinity;
  let len = 0;
  for (let i = 0; i < words.length - 1; i++) {
    len += words[i].length + (i ? 1 : 0);
    const diff = Math.abs(len - (text.length - len - 1));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best + 1).join(" "), words.slice(best + 1).join(" ")];
};
const FPS = L815_VIDEO.fps;
const blocks = tl.cues.map((c, i) => {
  const next = tl.cues[i + 1];
  // показ: от начала речи до конца речи + 0,4 с, но не позже начала следующей
  const start = c.from;
  const end = Math.min(c.to + 0.4, next ? next.from - 0.05 : tl.durationSec);
  const lines = wrap(c.text);
  return `${i + 1}\n${ts(start)} --> ${ts(end)}\n${L815_ROLE_NAMES[c.role]}: ${lines.join("\n")}\n`;
});
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, blocks.join("\n") + "\n");
// проверка: субтитр ответа не раньше конца паузы
for (const p of tl.pauses) {
  const q = tl.cues.find((x) => x.id === p.question);
  const a = tl.cues.find((x) => x.id === p.answer);
  if (a.from < q.to + p.sec - 1e-6) throw new Error(`${p.answer}: субтитр раньше конца паузы`);
}
console.log(`✓ ${out}: ${blocks.length} реплик, ${(tl.durationInFrames / FPS).toFixed(1)} с`);
