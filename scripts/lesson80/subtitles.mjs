// Русские субтитры 80-1-14 (SRT и VTT) — те же реплики и тайминги, что в кадре.
//   node scripts/lesson80/subtitles.mjs out/lesson-80-1-14-can-we-count-the-gifts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const base = process.argv[2] ?? "out/lesson-80-1-14-can-we-count-the-gifts";
mkdirSync("out", { recursive: true });
await build({ entryPoints: ["src/lesson80/checks.ts"], bundle: true, format: "esm", platform: "node", outfile: "out/.l80-checks.mjs", logLevel: "error", jsx: "automatic" });
const L = await import(`${process.cwd()}/out/.l80-checks.mjs?${Date.now()}`);
const MAN = "public/audio/lesson80-1-14/manifest.json";
if (!existsSync(MAN)) throw new Error("нет озвучки");
const tl = L.buildTimeline(JSON.parse(readFileSync(MAN, "utf8")));
const cues = L.buildCues(tl);
const fps = L.L80_VIDEO.fps;
const ts = (f, sep) => {
  const ms = Math.round((f / fps) * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}${sep}${String(ms % 1000).padStart(3, "0")}`;
};
writeFileSync(`${base}.srt`, cues.map((c, i) => `${i + 1}\n${ts(c.from, ",")} --> ${ts(c.to, ",")}\n${c.text}\n`).join("\n"));
writeFileSync(`${base}.vtt`, "WEBVTT\n\n" + cues.map((c) => `${ts(c.from, ".")} --> ${ts(c.to, ".")}\n${c.text}\n`).join("\n"));
console.log(`✓ ${cues.length} субтитров → ${base}.srt / .vtt`);
