// Финальный рендер ролика 80-1-4 «Один Создатель»:
//   1) проверка озвучки (все 47 реплик) и обязательных пауз 4 / 5 / 5 / 5 с;
//   2) рендер Remotion (H.264 + AAC, 1920×1080, 30 к/с, 48 кГц);
//   3) выравнивание громкости (цель −17 LUFS, true peak ≤ −1,5 dBTP) —
//      меняется только звуковая дорожка, видео копируется без перекодирования;
//   4) проверка результата (scripts/lesson80-1-4-verify.mjs).
// Запуск: npm run render:80-1-4  [-- --subtitles]  →  out/lesson-80-1-4-one-creator-16x9.mp4
//         npm run render:80-1-4-ky (--lang=ky)   →  out/lesson-80-1-4-one-creator-ky-16x9.mp4
// Свой Chromium: REMOTION_BROWSER_EXECUTABLE=/путь/к/chrome npm run render:80-1-4
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { cpus } from "node:os";
import { buildTimeline, checkViewerPauses } from "../src/lesson80-1-4/timeline.ts";
import { LANG, PACK, VOICE_DIR } from "./lib/a4-lang.mjs";

const A4_VIDEO = PACK.video;
const manifest = JSON.parse(readFileSync(`${VOICE_DIR}/manifest.json`, "utf8"));
if (!manifest.complete) throw new Error(`Нет озвучки для: ${manifest.missing.join(", ")}`);
const T = buildTimeline(manifest, A4_VIDEO.fps, LANG);
for (const p of checkViewerPauses(T)) {
  if (!p.ok) throw new Error(`Пауза после ${p.q}: ${p.frames} кадров < ${p.need}`);
  console.log(`✓ пауза ${p.q} → ${p.a}: ${p.seconds.toFixed(2)} с, ${p.frames} кадров (нужно ≥ ${p.need})`);
}
console.log(`Хронометраж по шкале: ${T.total.toFixed(2)} с`);
mkdirSync("out", { recursive: true });
const subs = process.argv.includes("--subtitles");
const name = `out/${A4_VIDEO.output}${subs ? "-subtitles" : ""}`;
const raw = `${name}.raw.mp4`;
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const conc = process.env.RENDER_CONCURRENCY ?? String(Math.max(1, cpus().length));
execFileSync(
  "npx",
  ["remotion", "render", "src/index.ts", A4_VIDEO.id, raw, "--codec=h264", "--audio-codec=aac", "--pixel-format=yuv420p", "--color-space=bt709", `--concurrency=${conc}`, `--props=${JSON.stringify({ subtitles: subs, lang: LANG })}`, "--log=warn", ...browser],
  { stdio: "inherit" },
);
// громкость: двухпроходный loudnorm только для звука
const err = execFileSync("bash", ["-c", `ffmpeg -hide_banner -i "${raw}" -map 0:a -af loudnorm=I=-17:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | tail -12`], { encoding: "utf8" });
const m = JSON.parse(err.slice(err.indexOf("{"), err.lastIndexOf("}") + 1));
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-map", "0:v", "-map", "0:a", "-c:v", "copy",
  "-af", `loudnorm=I=-17:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${name}.tmp.mp4`,
]);
renameSync(`${name}.tmp.mp4`, `${name}.mp4`);
execFileSync("rm", ["-f", raw]);
execFileSync("node", ["scripts/lesson80-1-4-verify.mjs", `${name}.mp4`, `--lang=${LANG}`], { stdio: "inherit" });
