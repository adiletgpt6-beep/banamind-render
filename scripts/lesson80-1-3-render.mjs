// Финальный рендер ролика 80-1-3 «А если я не вижу?»:
//   1) проверка озвучки (все 42 реплики), трёх пауз для ответа зрителя
//      (4 / 4 / 5 с) и окна выдоха Юсуфа между репликами 08 и 09;
//   2) рендер Remotion (H.264 + AAC, 1920×1080, 30 к/с, 48 кГц);
//   3) выравнивание громкости (цель −16 LUFS, true peak ≤ −1,5 dBTP) —
//      меняется только звуковая дорожка, видео копируется без перекодирования;
//   4) субтитры SRT по той же озвучке и проверка результата
//      (scripts/lesson80-1-3-verify.mjs).
// Запуск: npm run render:80-1-3  [-- --subtitles]  →  out/lesson-80-1-3-what-if-i-cant-see-16x9.mp4
//         npm run render:80-1-3-ky (кыргызская версия) → out/lesson-80-1-3-what-if-i-cant-see-ky-16x9.mp4
// Свой Chromium: REMOTION_BROWSER_EXECUTABLE=/путь/к/chrome npm run render:80-1-3
// Потоки: RENDER_CONCURRENCY=4 (по умолчанию — число ядер).
/* global console, process */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { cpus } from "node:os";
import { a3Edition, a3LangFromArgs } from "../src/lesson80-1-3/edition.ts";
import { A3_BLOW_SEC, A3_VIDEO } from "../src/lesson80-1-3/script.ts";
import { buildTimeline, checkViewerPauses } from "../src/lesson80-1-3/timeline.ts";

const ED = a3Edition(a3LangFromArgs(process.argv, process.env));
const langArg = `--lang=${ED.lang}`;
console.log(`Версия: ${ED.lang} (${ED.id})`);
const manifest = JSON.parse(readFileSync(`public/${ED.voiceDir}/manifest.json`, "utf8"));
if (!manifest.complete) throw new Error(`Нет озвучки для: ${manifest.missing.join(", ")}`);
const T = buildTimeline(manifest, A3_VIDEO.fps, ED.lines);
if (T.estimated) throw new Error("Шкала построена по оценке, а не по озвучке");
for (const p of checkViewerPauses(T)) {
  if (!p.ok) throw new Error(`Пауза после ${p.q}: ${p.frames} кадров < ${p.need}`);
  console.log(`✓ пауза ${p.q} → ${p.a}: ${p.seconds.toFixed(2)} с, ${p.frames} кадров (нужно ≥ ${p.need})`);
}
const blowGap = T.seg["80-1-3-009"].start - T.seg["80-1-3-008"].end;
const blowHold = T.hold.blow.end - T.hold.blow.start;
if (blowGap < 2.9 || blowHold < A3_BLOW_SEC - 1e-6) throw new Error(`Окно выдоха: ${blowGap.toFixed(2)} с без речи, действие ${blowHold.toFixed(2)} с`);
console.log(`✓ выдох Юсуфа: ${blowGap.toFixed(2)} с без речи между 008 и 009 (действие ${blowHold.toFixed(2)} с)`);
console.log(`Хронометраж по шкале: ${T.total.toFixed(2)} с`);

mkdirSync("out", { recursive: true });
const subs = process.argv.includes("--subtitles");
const name = `out/${ED.output}${subs ? "-subtitles" : ""}`;
const raw = `${name}.raw.mp4`;
const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
const conc = process.env.RENDER_CONCURRENCY ?? String(Math.max(1, cpus().length));
execFileSync(
  "npx",
  ["remotion", "render", "src/index.ts", ED.id, raw, "--codec=h264", "--audio-codec=aac", "--pixel-format=yuv420p", "--color-space=bt709", `--concurrency=${conc}`, `--props=${JSON.stringify({ subtitles: subs, lang: ED.lang })}`, "--log=warn", ...browser],
  { stdio: "inherit" },
);

// громкость: двухпроходный loudnorm только для звука (видео — копия потока)
const LN = "I=-16:TP=-1.5:LRA=11";
const pass1 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", raw, "-map", "0:a", "-af", `loudnorm=${LN}:print_format=json`, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
if (pass1.status !== 0) throw new Error(`loudnorm (замер): ${pass1.stderr}`);
const log = pass1.stderr;
const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));
console.log(`Громкость до выравнивания: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP, LRA ${m.input_lra}`);
execFileSync("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-map", "0:v", "-map", "0:a", "-c:v", "copy",
  "-af", `loudnorm=${LN}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${name}.tmp.mp4`,
]);
renameSync(`${name}.tmp.mp4`, `${name}.mp4`);
rmSync(raw, { force: true });
execFileSync("node", ["scripts/lesson80-1-3-srt.mjs", langArg], { stdio: "inherit" });
execFileSync("node", ["scripts/lesson80-1-3-verify.mjs", langArg, `${name}.mp4`], { stdio: "inherit" });
