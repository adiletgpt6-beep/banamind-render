// BM-036. Диапазоны кадров для параллельного рендера: node frames.mjs N → JSON-массив "a-b".
import { totalFrames } from "./lib.mjs";

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
