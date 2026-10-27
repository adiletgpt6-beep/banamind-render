// Пять YouTube-обложек книги канала BanaMind + проверки + листы сравнения.
//   node scripts/books/thumbnails.mjs <slug> [--skip-render]
// Источник: src/thumbnails (Still thumb-<slug>-1..5), тексты — books/<slug>/thumbnails.json.
// Результат в books/<slug>/thumbnails/:
//   thumbnail-01.jpg … thumbnail-05.jpg  1280×720, JPEG sRGB, ≤ 2 МБ
//   comparison-sheet.jpg                  все пять рядом, номер, концепция, рекомендация
//   readability-320x180.jpg               все пять в размере 320×180 (как в ленте телефона)
//   checks.json                           результаты проверок
// Скрипт никогда не выбирает обложку окончательно: recommended — только предложение.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const slug = process.argv[2];
if (!slug) throw new Error("usage: node scripts/books/thumbnails.mjs <slug> [--skip-render]");
const skipRender = process.argv.includes("--skip-render");
const META = JSON.parse(readFileSync(`books/${slug}/thumbnails.json`, "utf8"));
const DIR = `books/${slug}/thumbnails`;
const RAW = `out/thumbs/${slug}`;
const FONT = "public/fonts/Nunito-Variable.ttf";
const MAX_BYTES = 2 * 1024 * 1024;
const W = 1280;
const H = 720;
const N = [1, 2, 3, 4, 5];
const pad = (n) => String(n).padStart(2, "0");
const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
mkdirSync(DIR, { recursive: true });
mkdirSync(RAW, { recursive: true });

if (META.thumbnails.length !== 5 || META.thumbnails.some((t, i) => t.n !== i + 1)) throw new Error("нужно ровно пять обложек n=1..5");
if (!N.includes(META.recommended)) throw new Error("recommended должен быть 1..5");

// 1. Рендер PNG (один бандл на все пять).
if (!skipRender) {
  const bundle = `out/thumbs/bundle`;
  execFileSync("npx", ["remotion", "bundle", "src/thumbnails/index.ts", `--out-dir=${bundle}`, "--log=error"], { stdio: "inherit" });
  const browser = process.env.REMOTION_BROWSER_EXECUTABLE ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`] : [];
  for (const n of N) {
    execFileSync("npx", ["remotion", "still", bundle, `thumb-${slug}-${n}`, `${RAW}/${n}.png`, "--image-format=png", "--log=error", ...browser], { stdio: "inherit" });
  }
}

// 2. JPEG sRGB ≤ 2 МБ (качество понижается только если файл не влезает).
const files = [];
for (const n of N) {
  const out = `${DIR}/thumbnail-${pad(n)}.jpg`;
  let q = 2;
  for (;;) {
    ff(["-i", `${RAW}/${n}.png`, "-vf", "scale=in_range=full:out_range=full,format=yuvj444p", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1", "-colorspace", "bt470bg", "-q:v", String(q), "-frames:v", "1", out]);
    if (statSync(out).size <= MAX_BYTES || q >= 10) break;
    q += 1;
  }
  files.push(out);
}

// 3. Проверки формата.
const probe = (f) => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,width,height,pix_fmt", "-of", "json", f]).toString()).streams[0];
const checks = { slug, files: [], spelling: null, distinct: null, ok: true };
for (const f of files) {
  const s = probe(f);
  const bytes = statSync(f).size;
  const ok = s.codec_name === "mjpeg" && s.width === W && s.height === H && bytes <= MAX_BYTES;
  checks.files.push({ file: path.basename(f), width: s.width, height: s.height, codec: "jpeg", pix_fmt: s.pix_fmt, kb: Math.round(bytes / 1024), ok });
  if (!ok) checks.ok = false;
}

// 4. Орфография всех надписей (Hunspell ru_RU + словарь проекта books/dictionary.txt).
const words = META.thumbnails.flatMap((t) => t.texts);
try {
  const res = execFileSync("python3", ["scripts/books/spellcheck.py"], { input: JSON.stringify(words) }).toString();
  checks.spelling = JSON.parse(res);
  if (checks.spelling.unknown.length) checks.ok = false;
} catch (e) {
  checks.spelling = { error: String(e.message).split("\n")[0] };
  checks.ok = false;
}

// 5. Различие обложек: попарная средняя разница (0–255) уменьшенных копий 64×36.
const small = files.map((f) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", f, "-vf", "scale=64:36:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]));
const pairs = [];
for (let a = 0; a < 5; a++)
  for (let b = a + 1; b < 5; b++) {
    let d = 0;
    for (let i = 0; i < small[a].length; i++) d += Math.abs(small[a][i] - small[b][i]);
    pairs.push({ pair: `${a + 1}-${b + 1}`, diff: +(d / small[a].length).toFixed(1) });
  }
const minDiff = Math.min(...pairs.map((p) => p.diff));
checks.distinct = { pairs, min: minDiff, threshold: 25, ok: minDiff >= 25 };
if (!checks.distinct.ok) checks.ok = false;

// 6. Листы сравнения. Подписи пишем во временные файлы (textfile — без экранирования).
const tmp = `${RAW}/labels`;
mkdirSync(tmp, { recursive: true });
const label = (n) => {
  const t = META.thumbnails[n - 1];
  const f = `${tmp}/${n}.txt`;
  writeFileSync(f, `№${n} · ${t.concept}`);
  return f;
};
const recFile = `${tmp}/rec.txt`;
writeFileSync(recFile, "РЕКОМЕНДУЮ");
const titleFile = `${tmp}/title.txt`;
writeFileSync(titleFile, `«${META.title}» — пять обложек на выбор · канал BanaMind`);
const noteFile = `${tmp}/note.txt`;
writeFileSync(noteFile, `Рекомендация: №${META.recommended}. Финальный выбор — за владельцем канала.`);

const sheet = (out, tw, th, labelSize, gap, cols, header) => {
  const cellH = th + labelSize * 2;
  const rows = Math.ceil(5 / cols);
  const sw = cols * tw + (cols + 1) * gap;
  const sh = header + rows * cellH + (rows + 1) * gap;
  const inputs = files.flatMap((f) => ["-i", f]);
  const parts = [`color=c=0x1d2333:s=${sw}x${sh}:d=1[bg]`];
  let prev = "bg";
  N.forEach((n, i) => {
    const rec = n === META.recommended;
    const x = gap + (i % cols) * (tw + gap) + (i >= cols && rows > 1 ? ((cols * rows - 5) * (tw + gap)) / 2 : 0);
    const y = header + gap + Math.floor(i / cols) * (cellH + gap);
    const border = rec ? `,pad=${tw + 12}:${th + 12}:6:6:color=0xffd23f` : "";
    const off = rec ? 6 : 0;
    parts.push(`[${i}:v]scale=${tw}:${th}:flags=lanczos${border}[t${n}]`);
    parts.push(`[${prev}][t${n}]overlay=${x - off}:${y - off}[o${n}]`);
    let lab = `[o${n}]drawtext=fontfile=${FONT}:textfile=${label(n)}:fontcolor=white:fontsize=${labelSize}:x=${x}:y=${y + th + labelSize * 0.45}`;
    if (rec) lab += `,drawtext=fontfile=${FONT}:textfile=${recFile}:fontcolor=0x1d2333:box=1:boxcolor=0xffd23f:boxborderw=${Math.round(labelSize * 0.3)}:fontsize=${labelSize}:x=${x + tw}-text_w-${Math.round(labelSize * 0.3)}:y=${y + th + labelSize * 0.45}`;
    parts.push(`${lab}[l${n}]`);
    prev = `l${n}`;
  });
  if (header) {
    parts.push(`[${prev}]drawtext=fontfile=${FONT}:textfile=${titleFile}:fontcolor=white:fontsize=${Math.round(header * 0.36)}:x=${gap}:y=${Math.round(header * 0.18)},drawtext=fontfile=${FONT}:textfile=${noteFile}:fontcolor=0xffd23f:fontsize=${Math.round(header * 0.24)}:x=${gap}:y=${Math.round(header * 0.62)}[out]`);
    prev = "out";
  }
  ff([...inputs, "-filter_complex", parts.join(";"), "-map", `[${prev}]`, "-frames:v", "1", "-q:v", "3", out]);
};
sheet(`${DIR}/comparison-sheet.jpg`, 640, 360, 30, 28, 3, 110);
sheet(`${DIR}/readability-320x180.jpg`, 320, 180, 18, 16, 5, 0);
if (!existsSync(`${DIR}/comparison-sheet.jpg`)) checks.ok = false;

writeFileSync(`${DIR}/checks.json`, JSON.stringify(checks, null, 2) + "\n");

// 7. Отчёт для владельца канала.
const rec = META.thumbnails[META.recommended - 1];
const readme = [
  `# Обложки «${META.title}» — пять вариантов на выбор`,
  "",
  `Сгенерировано \`node scripts/books/thumbnails.mjs ${slug}\` (рисунки — \`src/books/${slug}/thumbnails.tsx\`, тексты — \`books/${slug}/thumbnails.json\`).`,
  "**Финальную обложку выбирает и загружает владелец канала.**",
  "",
  "![Лист сравнения](comparison-sheet.jpg)",
  "",
  "| № | Файл | Концепция | Надписи | Размер |",
  "|---|---|---|---|---|",
  ...META.thumbnails.map((t, i) => `| ${t.n}${t.n === META.recommended ? " ★" : ""} | [thumbnail-${pad(t.n)}.jpg](thumbnail-${pad(t.n)}.jpg) | ${t.concept} — ${t.idea} | ${t.texts.join(" · ")} | ${checks.files[i].width}×${checks.files[i].height}, ${checks.files[i].kb} КБ |`),
  "",
  `## Рекомендация: №${META.recommended} «${rec.concept}»`,
  "",
  META.why,
  "",
  "## Проверки",
  "",
  `- формат: ${checks.files.every((f) => f.ok) ? "✓" : "✗"} все пять — 1280×720, JPEG (sRGB), ≤ 2 МБ`,
  `- орфография (Hunspell ru_RU + books/dictionary.txt): ${checks.spelling.unknown && !checks.spelling.unknown.length ? "✓" : "✗"} ${checks.spelling.checked ?? 0} слов`,
  `- различие: ${checks.distinct.ok ? "✓" : "✗"} минимальная попарная разница ${minDiff} (порог 25 из 255)`,
  "- читаемость в 320×180: [readability-320x180.jpg](readability-320x180.jpg)",
  "",
].join("\n");
writeFileSync(`${DIR}/README.md`, readme);
for (const f of checks.files) console.log(`${f.ok ? "✓" : "✗"} ${f.file} ${f.width}×${f.height} ${f.kb} КБ`);
console.log(`орфография: ${checks.spelling.unknown ? (checks.spelling.unknown.length ? "✗ " + checks.spelling.unknown.join(", ") : "✓") : "✗ " + checks.spelling.error}`);
console.log(`различие (мин. ${minDiff}, порог 25): ${checks.distinct.ok ? "✓" : "✗"}`);
console.log(`рекомендация: №${META.recommended} (финальный выбор — за владельцем)`);
if (!checks.ok) process.exit(1);
