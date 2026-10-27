// Диапазоны кадров для параллельного рендера: node frames.mjs N → {"total", "ranges": ["a-b", …]}.
// node frames.mjs until <sceneId> → один диапазон от начала до конца сцены (пилот).
import { totalFrames, timeline, FPS } from "./lib.mjs";

if (process.argv[2] === "until") {
  const tl = timeline();
  const sc = tl.scenes.find((s) => s.id === process.argv[3]);
  if (!sc) throw new Error(`нет сцены ${process.argv[3]}`);
  const end = Math.round(sc.to * FPS) - 1;
  console.log(JSON.stringify({ total: end + 1, seconds: +(sc.to).toFixed(2), ranges: [`0-${end}`] }));
} else {
  const n = Number(process.argv[2] ?? 8);
  const total = totalFrames();
  const size = Math.ceil(total / n);
  const ranges = [];
  for (let i = 0; i < n; i++) {
    const a = i * size;
    const b = Math.min(total - 1, a + size - 1);
    if (a <= b) ranges.push(`${a}-${b}`);
  }
  console.log(JSON.stringify({ total, ranges }));
}
