// Диапазоны кадров для параллельного рендера: node frames.mjs N → {"total","ranges":["a-b",…]}.
// node frames.mjs pilot → один диапазон пилота 30–60 с: до конца последней реплики,
// которая заканчивается не позже 60 с (но не раньше 30 с).
import { FPS, timeline, totalFrames } from "./lib.mjs";

const tl = timeline();
const total = totalFrames(tl);
if (process.argv[2] === "pilot") {
  // пилот 30–60 с: до конца последней реплики (+0,8 с), которая заканчивается не позже 59 с
  const ends = tl.lines.map((l) => l.speechTo + 0.8).filter((x) => x >= 30 && x <= 60);
  const end = ends.length ? Math.max(...ends) : 60;
  const last = Math.min(total - 1, Math.round(end * FPS) - 1);
  console.log(JSON.stringify({ total, pilotSeconds: +end.toFixed(2), ranges: [`0-${last}`] }));
} else {
  const n = Number(process.argv[2] ?? 8);
  const size = Math.ceil(total / n);
  const ranges = [];
  for (let i = 0; i < n; i++) {
    const a = i * size;
    const b = Math.min(total - 1, a + size - 1);
    if (a <= b) ranges.push(`${a}-${b}`);
  }
  console.log(JSON.stringify({ total, ranges }));
}
