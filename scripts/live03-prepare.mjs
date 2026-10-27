// Подготовка исходников для BalaGoLive03 (третий живой ролик Адилета).
//
// 1. Читает src/live-03/assets.json (тег релиза, имена файлов, SHA-256).
// 2. Если видео нет в public/live-03/ — скачивает их из GitHub Release
//    `balago-live-03-assets` через `gh api` (работает и для приватного
//    репозитория: в Actions — GITHUB_TOKEN, локально — gh auth).
// 3. Проверяет: настоящий MP4 (не HTML), SHA-256, видео- и аудиопоток,
//    размеры, длительность. Подменённый или повреждённый файл не принимает.
// 4. Делает рабочую копию видео: ровные 30 fps (CFR, длительность и
//    синхронизация сохраняются), мягкая общая цветокоррекция, без звука.
// 5. Бережно обрабатывает оригинальный голос (без TTS и без смены высоты):
//    снять уровень (исходник ≈ −10 LUFS, пики 0 dBFS), high-pass от гула,
//    мягкий EQ резонансов, de-esser, очень мягкая компрессия, двухпроходная
//    нормализация, limiter.
//
// Готовые файлы (в Git не хранятся):
//   public/live-03/live03-graded.mp4 — видео 1080×1920, 30 fps CFR
//   public/live-03/live03-voice.wav  — обработанный голос, 48 кГц
//
// Запуск: npm run live03:prepare            (скачать при необходимости и подготовить)
//         npm run live03:prepare -- --check (только скачать и проверить)
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, openSync, readFileSync, readSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const A = JSON.parse(readFileSync("src/live-03/assets.json", "utf8"));
const DIR = A.dir;
const SOURCE = join(DIR, A.source.localName);
const REFERENCE = join(DIR, A.reference.localName);
const GRADED = join("public", A.prepared.video);
const VOICE = join("public", A.prepared.voice);
const checkOnly = process.argv.includes("--check");

const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 });

mkdirSync(DIR, { recursive: true });

let releaseAssets = null;
const listAssets = () => {
  if (!releaseAssets) {
    releaseAssets = JSON.parse(
      run("gh", ["api", `repos/${A.repo}/releases/tags/${A.releaseTag}`, "--jq", "[.assets[] | {id, name, size}]"]),
    );
  }
  return releaseAssets;
};

const download = (entry, target) => {
  const match = listAssets().find((x) =>
    entry.releaseAsset ? x.name === entry.releaseAsset : x.name.startsWith(entry.releaseAssetPrefix),
  );
  if (!match) {
    throw new Error(
      `В релизе ${A.releaseTag} нет файла ${entry.releaseAsset ?? entry.releaseAssetPrefix + "…"}. ` +
        `Найдено: ${listAssets().map((x) => x.name).join(", ") || "ничего"}`,
    );
  }
  console.log(`Скачиваю ${match.name} (${(match.size / 1e6).toFixed(1)} МБ) из релиза ${A.releaseTag}…`);
  const data = execFileSync(
    "gh",
    ["api", "-H", "Accept: application/octet-stream", `repos/${A.repo}/releases/assets/${match.id}`],
    { maxBuffer: 1 << 30 },
  );
  writeFileSync(`${target}.part`, data);
  renameSync(`${target}.part`, target);
};

const verify = (entry, file) => {
  // MP4 начинается с бокса ftyp; HTML-страница ошибки — нет.
  const head = Buffer.alloc(12);
  readSync(openSync(file, "r"), head, 0, 12, 0);
  if (head.toString("latin1", 4, 8) !== "ftyp") {
    throw new Error(`${file}: это не MP4 (нет бокса ftyp) — возможно, скачалась HTML-страница.`);
  }
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (hash !== entry.sha256) {
    throw new Error(`${file}: SHA-256 ${hash} не совпадает с ожидаемым ${entry.sha256}.`);
  }
  const p = JSON.parse(
    run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,width,height,avg_frame_rate:format=duration", "-of", "json", file]),
  );
  const v = p.streams.find((s) => s.codec_type === "video");
  const hasAudio = p.streams.some((s) => s.codec_type === "audio");
  const dur = Number(p.format.duration);
  if (!v || !hasAudio) throw new Error(`${file}: нужен видеопоток и звук.`);
  if (v.width !== entry.width || v.height !== entry.height) {
    throw new Error(`${file}: ${v.width}×${v.height}, ожидалось ${entry.width}×${entry.height}.`);
  }
  if (Math.abs(dur - entry.durationSec) > 0.2) {
    throw new Error(`${file}: длительность ${dur.toFixed(2)} с, ожидалось ≈ ${entry.durationSec} с.`);
  }
  const [n, d] = v.avg_frame_rate.split("/").map(Number);
  console.log(`OK ${file}: ${v.width}×${v.height}, ${(n / d).toFixed(2)} fps, ${dur.toFixed(2)} с, звук есть, SHA-256 совпадает.`);
};

for (const [entry, file] of [
  [A.source, SOURCE],
  [A.reference, REFERENCE],
]) {
  if (!existsSync(file)) download(entry, file);
  verify(entry, file);
}

if (checkOnly) process.exit(0);

// ---------- Видео: CFR 30 fps + мягкая общая коррекция ----------
// Ночная съёмка: света чуть прижаты (белая куртка не «выгорает»), тени
// чуть приподняты, насыщенность фонарей немного спокойнее, кожа не
// трогается. Выравнивание между ракурсами — в ARoll (SHOT_LOOK).
const GRADE = [
  "fps=30",
  "curves=master='0/0.01 0.2/0.205 0.5/0.505 0.8/0.79 0.94/0.905 1/0.95'",
  "huesaturation=saturation=-0.06:colors=y+g:strength=1",
  "eq=contrast=1.03",
  "unsharp=5:5:0.2",
  "format=yuv420p",
].join(",");

console.log("Рабочая копия видео (30 fps CFR)…");
run("ffmpeg", [
  "-v", "error", "-y", "-i", SOURCE, "-an", "-vf", GRADE,
  "-c:v", "libx264", "-preset", "slow", "-crf", "13", "-g", "15", "-bf", "0",
  "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
  "-movflags", "+faststart", GRADED,
]);

// ---------- Голос ----------
// Паузы в исходнике уже почти цифровая тишина (≈ −95 dB) — шумоподавление
// не нужно и только добавило бы артефактов. Убираем гул ниже 75 Гц,
// чуть «бубнения» в 250 Гц и резкость 3–4 кГц от петлички.
const VOICE_CHAIN = [
  "pan=mono|c0=0.5*c0+0.5*c1",
  "volume=-6dB",
  "highpass=f=75:poles=2",
  "equalizer=f=250:t=q:w=1.2:g=-2",
  "equalizer=f=3600:t=q:w=2:g=-1.2",
  "equalizer=f=6500:t=q:w=1.5:g=0.8",
  "deesser=i=0.3:m=0.5:f=0.55",
  "acompressor=threshold=-21dB:ratio=1.8:attack=12:release=180:makeup=1",
];
const loudnorm = "loudnorm=I=-15:TP=-2:LRA=8";
const pass1 = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-i", SOURCE, "-vn", "-af", [...VOICE_CHAIN, `${loudnorm}:print_format=json`].join(","), "-f", "null", "-"],
  { encoding: "utf8" },
);
const m = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf("{")));

console.log("Обработка голоса…");
run("ffmpeg", [
  "-v", "error", "-y", "-i", SOURCE, "-vn", "-af",
  [
    ...VOICE_CHAIN,
    `${loudnorm}:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
      `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}` +
      `:offset=${m.target_offset}:linear=true`,
    "alimiter=limit=0.8:attack=3:release=60:level=disabled",
    "aresample=48000",
    "pan=stereo|c0=c0|c1=c0",
  ].join(","),
  "-c:a", "pcm_s16le", VOICE,
]);

console.log(`Готово: ${GRADED}, ${VOICE}`);
