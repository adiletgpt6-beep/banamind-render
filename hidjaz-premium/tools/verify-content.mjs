// Финал не собирается из неподтверждённого содержания: нужен
// CONTENT.confirmed = true, файлы всех фото, реплики и их озвучка.
import { existsSync, readFileSync } from "node:fs";
import { CONTENT } from "../src/content.ts";

const errors = [];
if (!CONTENT.confirmed) errors.push("CONTENT.confirmed = false (факты о товаре не подтверждены)");
for (const p of CONTENT.photos) if (!p.file || !existsSync(`hidjaz-premium/public/products/${p.file}`)) errors.push(`нет фото: ${p.label}`);
if (CONTENT.brand.logo && !existsSync(`hidjaz-premium/public/brand/${CONTENT.brand.logo}`)) errors.push("нет файла логотипа");
if (!CONTENT.lines.length) errors.push("нет реплик озвучки");
const m = JSON.parse(readFileSync("hidjaz-premium/public/audio/voice/manifest.json", "utf8"));
for (const l of CONTENT.lines) if (!m.lines.some((x) => x.id === l.id)) errors.push(`нет озвучки: ${l.id}`);
// реплики не должны наезжать друг на друга и выходить за 59 с
const sorted = [...CONTENT.lines].sort((a, b) => a.at - b.at);
for (const [i, l] of sorted.entries()) {
  const d = m.lines.find((x) => x.id === l.id)?.duration ?? 0;
  const next = sorted[i + 1];
  if (next && l.at + d > next.at - 0.15) errors.push(`${l.id} наезжает на ${next.id}`);
  if (l.at + d > 57) errors.push(`${l.id} заканчивается позже 57 с (финальный экран должен держаться после речи)`);
}
if (errors.length) {
  console.error("Содержание не готово к финалу:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Содержание подтверждено, озвучка на месте.");
