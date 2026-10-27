// Диапазоны кадров для параллельного рендера: node frames.mjs N → {"total","ranges":["a-b",…]}.
// node frames.mjs pilot → один диапазон пилота 30–60 с. Пилот BM-040 начинается со сцены
// PILOT_FROM (по умолчанию r04 — консул, «обвинение / версия / доказано?»), чтобы в нём были
// ведущий, предметная сцена и схема «свидетельство / вывод»; заканчивается в конце последней
// сцены, которая укладывается в 60 с от начала окна (но не раньше 30 с).
import { FPS, timeline, totalFrames } from "./lib.mjs";

const tl = timeline();
const total = totalFrames(tl);
if (process.argv[2] === "pilot") {
  const fromId = process.env.PILOT_FROM ?? "r04";
  const sc = tl.scenes.find((s) => s.id === fromId) ?? tl.scenes[0];
  const from = sc.from;
  const ends = tl.scenes.map((s) => s.to).filter((x) => x - from >= 30 && x - from <= 60);
  const end = ends.length ? Math.max(...ends) : from + 60;
  const a = Math.round(from * FPS);
  const b = Math.min(total - 1, Math.round(end * FPS) - 1);
  console.log(JSON.stringify({ total, pilotFrom: +from.toFixed(3), pilotSeconds: +(end - from).toFixed(2), ranges: [`${a}-${b}`] }));
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
