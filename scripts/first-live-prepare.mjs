// Подготовка исходника для BalaGoFirstLiveReel (живое видео Адилета).
//
// 1. Берёт мастер-исходник public/live/source.mp4 (если файла нет —
//    скачивает его из GitHub Release `live-reel-source` через `gh api`).
// 2. Проверяет параметры: 1080×1920, ~30 fps. Копию 720×1280 из соцсетей
//    не принимает.
// 3. Делает мягкую цветокоррекцию (приглушённые света, чуть спокойнее
//    зелень, кожа без изменений) и приводит видео к ровным 30 fps.
// 4. Бережно обрабатывает оригинальный голос: high-pass, лёгкое
//    шумоподавление (атмосфера улицы остаётся), EQ, de-esser, мягкая
//    компрессия, нормализация громкости, limiter.
//
// Готовые файлы (в Git не хранятся, см. .gitignore):
//   public/live/first-live-graded.mp4 — видео без звука, 30 fps CFR
//   public/live/first-live-voice.wav  — обработанный голос, 48 кГц
//
// Запуск: npm run live:prepare
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const REPO = "adiletzainidinov/balago-video";
const RELEASE_TAG = "live-reel-source";
const ASSET_NAME = "InShot_20261007_161714861.mp4";
const SHA256 =
  "2cfdea91f12ace4180c9936e359d05d1181dcd19c2218ee007848930d689da27";

const SOURCE = "public/live/source.mp4";
const GRADED = "public/live/first-live-graded.mp4";
const VOICE = "public/live/first-live-voice.wav";

const run = (cmd, args) =>
  execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 });

const download = () => {
  console.log(`Скачиваю ${ASSET_NAME} из релиза ${RELEASE_TAG}…`);
  const id = run("gh", [
    "api",
    `repos/${REPO}/releases/tags/${RELEASE_TAG}`,
    "--jq",
    `.assets[] | select(.name == "${ASSET_NAME}") | .id`,
  ]).trim();
  if (!id) throw new Error(`В релизе ${RELEASE_TAG} нет ${ASSET_NAME}`);
  const data = execFileSync(
    "gh",
    [
      "api",
      "-H",
      "Accept: application/octet-stream",
      `repos/${REPO}/releases/assets/${id}`,
    ],
    { maxBuffer: 1 << 30 },
  );
  writeFileSync(SOURCE, data);
};

if (!existsSync(SOURCE)) download();

const hash = createHash("sha256").update(readFileSync(SOURCE)).digest("hex");
if (hash !== SHA256) {
  console.warn(`Внимание: SHA-256 исходника ${hash} отличается от ожидаемого.`);
}

const probe = JSON.parse(
  run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,avg_frame_rate:format=duration",
    "-of",
    "json",
    SOURCE,
  ]),
);
const { width, height, avg_frame_rate: rate } = probe.streams[0];
const [num, den] = rate.split("/").map(Number);
const fps = num / den;
console.log(
  `Исходник: ${width}×${height}, ${fps.toFixed(2)} fps, ${Number(probe.format.duration).toFixed(2)} с`,
);
if (width !== 1080 || height !== 1920 || Math.abs(fps - 30) > 0.5) {
  throw new Error("Нужен оригинал 1080×1920 / 30 fps — этот файл не подходит.");
}

// ---------- Цвет ----------
// curves: света мягко прижаты (0.9 → 0.88, 1 → 0.955), лёгкая S-кривая;
// huesaturation: зелень/бирюза −14 %, небо −5 %; кожа (красные/жёлтые)
// не трогается. Лёгкий unsharp возвращает детали лица после сжатия.
const GRADE = [
  "fps=30",
  "curves=master='0/0.012 0.25/0.235 0.5/0.5 0.75/0.765 0.9/0.88 1/0.955'",
  "huesaturation=saturation=-0.14:colors=g+c:strength=1",
  "huesaturation=saturation=-0.05:colors=b",
  "eq=contrast=1.04",
  "unsharp=5:5:0.25",
  "format=yuv420p",
].join(",");

console.log("Цветокоррекция видео…");
run("ffmpeg", [
  "-v",
  "error",
  "-y",
  "-i",
  SOURCE,
  "-an",
  "-vf",
  GRADE,
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "13",
  "-g",
  "15",
  "-bf",
  "0",
  "-color_primaries",
  "bt709",
  "-color_trc",
  "bt709",
  "-colorspace",
  "bt709",
  "-movflags",
  "+faststart",
  GRADED,
]);

// ---------- Голос ----------
// Петличка на телефоне уже сильно ограничила пики (≈ −10 LUFS, пики 0 dBFS),
// поэтому сначала снимаем уровень, компрессия — очень мягкая.
const VOICE_CHAIN = [
  "pan=mono|c0=0.5*c0+0.5*c1",
  "volume=-6dB",
  "highpass=f=80:poles=2",
  // лёгкое шумоподавление: фон улицы приглушается, но не исчезает
  "afftdn=nr=7:nf=-48:tn=1",
  // убрать «бубнение» и чуть добавить разборчивости
  "equalizer=f=240:t=q:w=1.1:g=-1.8",
  "equalizer=f=3400:t=q:w=1.2:g=1.4",
  "deesser=i=0.25:m=0.5:f=0.5",
  "acompressor=threshold=-20dB:ratio=2:attack=10:release=160:makeup=1.5",
];

// Двухпроходная нормализация громкости: −16 LUFS, true peak −2 dBTP.
const loudnorm = "loudnorm=I=-16:TP=-2:LRA=9";
const pass1 = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-i",
    SOURCE,
    "-vn",
    "-af",
    [...VOICE_CHAIN, `${loudnorm}:print_format=json`].join(","),
    "-f",
    "null",
    "-",
  ],
  { encoding: "utf8" },
);
const m = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf("{")));

console.log("Обработка голоса…");
run("ffmpeg", [
  "-v",
  "error",
  "-y",
  "-i",
  SOURCE,
  "-vn",
  "-af",
  [
    ...VOICE_CHAIN,
    `${loudnorm}:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
      `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}` +
      `:offset=${m.target_offset}:linear=true`,
    "alimiter=limit=0.79:attack=3:release=60:level=disabled",
    "aresample=48000",
    "pan=stereo|c0=c0|c1=c0",
  ].join(","),
  "-c:a",
  "pcm_s16le",
  VOICE,
]);

console.log(`Готово: ${GRADED}, ${VOICE}`);
