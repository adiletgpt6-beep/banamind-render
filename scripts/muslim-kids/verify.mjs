// Проверка готового MP4: формат, длительность, звук, отсутствие пустых кадров.
// Запуск: node scripts/muslim-kids/verify.mjs out/file.mp4 [ожидаемая длительность, с]
import { execFileSync } from "node:child_process";

const file = process.argv[2];
const expect = Number(process.argv[3] ?? 0);
const probe = JSON.parse(
  execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_streams",
    "-show_format",
    "-of",
    "json",
    file,
  ]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const run = (args) => {
  try {
    return execFileSync("bash", ["-c", args], {
      maxBuffer: 1 << 26,
    }).toString();
  } catch (e) {
    return String(e.stdout ?? "") + String(e.stderr ?? "");
  }
};
const lufs = Number(
  /I:\s*(-?[\d.]+) LUFS/.exec(
    run(
      `ffmpeg -hide_banner -nostats -i "${file}" -map 0:a -af ebur128 -f null - 2>&1 | tail -n 12`,
    ),
  )?.[1],
);
const black = (
  run(
    `ffmpeg -hide_banner -nostats -i "${file}" -vf blackdetect=d=0.5:pix_th=0.02 -an -f null - 2>&1`,
  ).match(/black_start/g) ?? []
).length;
const silence =
  run(
    `ffmpeg -hide_banner -nostats -i "${file}" -af silencedetect=n=-50dB:d=4 -vn -f null - 2>&1`,
  ).match(/silence_start/g)?.length ?? 0;
const checks = [
  ["Видео H.264", v?.codec_name === "h264"],
  ["1080×1920", v?.width === 1080 && v?.height === 1920],
  ["30 fps", v?.r_frame_rate === "30/1"],
  ["yuv420p", v?.pix_fmt === "yuv420p"],
  ["Звук AAC", a?.codec_name === "aac"],
  [
    `Длительность ${dur.toFixed(2)} с${expect ? ` (ожидается ${expect.toFixed(2)})` : ""}`,
    dur > 50 && dur < 80 && (!expect || Math.abs(dur - expect) < 0.2),
  ],
  [`Громкость ${lufs} LUFS`, lufs > -26 && lufs < -12],
  [`Чёрных участков > 0.5 с: ${black}`, black === 0],
  [`Тишина > 4 с: ${silence}`, silence === 0],
  [
    "faststart (moov в начале)",
    run(`head -c 200000 "${file}" | grep -c moov`).trim() !== "0",
  ],
];
let ok = true;
console.log(`### Проверка ${file}\n`);
for (const [name, pass] of checks) {
  console.log(`- ${pass ? "✅" : "❌"} ${name}`);
  ok &&= pass;
}
if (!ok) process.exit(1);
