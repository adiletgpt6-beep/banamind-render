// Полный рендер фильма №33 → out/balago-33-moms-old-video.mp4.
//   1) remotion render (H.264 yuv420p bt709 + AAC), только с полной озвучкой;
//   2) мастеринг звука: двухпроходный loudnorm до −16 LUFS, true peak
//      ≤ −1,5 дБTP (линейное усиление без изменения динамики, если возможно);
//      видео копируется без перекодирования;
//   3) faststart (moov в начале файла) и проверка формата (verify-mov.mjs).
// Запуск: npm run render:moms-old-video
//   MOV_CONCURRENCY=4 — параллельность рендера Remotion.
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { MOV_VIDEO } from "../src/moms-old-video/script.ts";

const out = `out/${MOV_VIDEO.output}.mp4`;
const raw = `out/${MOV_VIDEO.output}-raw.mp4`;
mkdirSync("out", { recursive: true });
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const conc = process.env.MOV_CONCURRENCY ? [`--concurrency=${process.env.MOV_CONCURRENCY}`] : [];
execFileSync(
  "npx",
  ["remotion", "render", MOV_VIDEO.id, raw, "--codec=h264", "--pixel-format=yuv420p", "--color-space=bt709", "--audio-codec=aac", "--audio-bitrate=192k", "--props", JSON.stringify({ preview: false }), "--log=warn", ...conc, ...browser],
  { stdio: "inherit" },
);

// мастеринг
const target = { I: -16, TP: -1.5, LRA: 11 };
const probe = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${raw}" -vn -af loudnorm=I=${target.I}:TP=${target.TP}:LRA=${target.LRA}:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p'`]).toString();
const m = JSON.parse(probe);
console.log(`До мастеринга: ${m.input_i} LUFS, пик ${m.input_tp} дБTP, LRA ${m.input_lra}`);
const af = `loudnorm=I=${target.I}:TP=${target.TP}:LRA=${target.LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=summary,aresample=48000`;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", `${out}.tmp.mp4`], { stdio: "inherit" });
renameSync(`${out}.tmp.mp4`, out);
rmSync(raw, { force: true });
execFileSync("node", ["scripts/verify-mov.mjs", out], { stdio: "inherit" });
