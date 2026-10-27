// Кадры из готового MP4 Lesson80-1-13 (те же отметки, что у контрольных
// кадров: сцены, реплики, паузы, контакты рук, общие планы) и контактные
// листы out/frames-mp4-<output>/contact-mp4-*.png. Нужен index.json из
// npm run stills:lesson-80-1-13 -- --list.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { FILM } from "../src/lesson80/film-1-13/script.ts";

const mp4 = process.argv[2] ?? `out/${FILM.output}.mp4`;
const index = JSON.parse(readFileSync(`out/frames-${FILM.output}/index.json`, "utf8"));
const outDir = `out/frames-mp4-${FILM.output}`;
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const names = [];
for (const { name, frame } of index) {
  const out = `${outDir}/${name}.png`;
  // точный кадр: декодирование до нужного номера (select по n)
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(Math.max(0, frame / FILM.fps - 1)), "-i", mp4, "-vf", `select=eq(n\\,${Math.min(frame, 30)})`, "-frames:v", "1", out]);
  names.push(out);
}
for (let i = 0; i < names.length; i += 12) {
  const part = names.slice(i, i + 12);
  const inputs = part.flatMap((p) => ["-i", p]);
  const scale = part.map((_, j) => `[${j}:v]scale=480:270[s${j}]`).join(";");
  const layout = part.map((_, j) => `${(j % 4) * 480}_${Math.floor(j / 4) * 270}`).join("|");
  const refs = part.map((_, j) => `[s${j}]`).join("");
  const filter = part.length > 1 ? `${scale};${refs}xstack=inputs=${part.length}:layout=${layout}:fill=black[o]` : `[0:v]scale=480:270[o]`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-map", "[o]", `${outDir}/contact-mp4-${String(i / 12 + 1).padStart(2, "0")}.png`]);
}
console.log(`Кадров из MP4: ${names.length} → ${outDir}`);
