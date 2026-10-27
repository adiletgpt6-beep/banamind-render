// Проверка готового MP4 ролика 80-1-3 «А если я не вижу?»: есть видео и звук
// (звук — на всю длину видео), 1920×1080, H.264 yuv420p, 30 к/с, AAC 48 кГц,
// длительность 3:45–4:25 и совпадает со шкалой озвучки, громкость −16 ± 1 LUFS,
// true peak ≤ −1 dBTP, нет чёрных фрагментов, последний кадр не чёрный.
// Паузы для ответа зрителя — по звуку готового файла: непрерывная тишина
// (< −30 дБFS) вокруг паузы не короче 4 / 4 / 5 с. Окно выдоха Юсуфа между
// репликами 08 и 09 — не меньше 2,9 с без речи (по шкале; по звуку — только
// мягкий выдох: громкость окна заметно ниже речи). Петли: в паузах не слышно
// ротора (вертушка неподвижна), у фона нет провалов на стыках петель.
// Запуск: npm run verify:80-1-3 [-- путь.mp4]
/* global console, process */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { a3Edition, a3LangFromArgs, a3PlainArgs } from "../src/lesson80-1-3/edition.ts";
import { A3_BLOW_SEC, A3_VIDEO } from "../src/lesson80-1-3/script.ts";
import { buildTimeline, checkViewerPauses } from "../src/lesson80-1-3/timeline.ts";

const ED = a3Edition(a3LangFromArgs(process.argv, process.env));
const file = a3PlainArgs(process.argv.slice(2))[0] ?? `out/${ED.output}.mp4`;
console.log(`Версия: ${ED.lang} (${ED.id}), файл: ${file}`);
// звуки комнаты и вертушки общие у языковых версий
const SFX = `public/${A3_VIDEO.voiceDir}/sfx`;
if (!existsSync(file)) {
  console.error(`✗ нет файла ${file}`);
  process.exit(1);
}
// ffmpeg пишет отчёты фильтров в stderr
const ff = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 1 << 28 }).stderr ?? "";
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }));
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const dur = Number(probe.format.duration);
const fails = [];
const ok = (c, msg) => (c ? console.log(`✓ ${msg}`) : fails.push(msg));
// выдох Юсуфа — тихий детский «фу-у», не порыв: на столько LU тише средней громкости ролика
const BLOW_LU = 6;
const mmss = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;

ok(Boolean(v) && Boolean(a), `есть видео и звук (${v ? "видео" : "нет видео"}, ${a ? "звук" : "нет звука"})`);
ok(v && v.width === 1920 && v.height === 1080, `видео 1920×1080 (${v?.width}×${v?.height})`);
ok(v && v.codec_name === "h264" && v.pix_fmt === "yuv420p", `H.264 yuv420p (${v?.codec_name}, ${v?.pix_fmt})`);
ok(v && v.r_frame_rate === "30/1", `30 к/с (${v?.r_frame_rate})`);
ok(a && a.codec_name === "aac" && a.sample_rate === "48000", `AAC 48 кГц (${a?.codec_name}, ${a?.sample_rate})`);
ok(dur >= 225 && dur <= 265, `длительность ${mmss(dur)} (${dur.toFixed(2)} с) в диапазоне 3:45–4:25`);
ok(v && a && Math.abs(Number(a.duration) - Number(v.duration)) <= 0.2, `звук на всю длину видео (звук ${Number(a?.duration).toFixed(2)} с, видео ${Number(v?.duration).toFixed(2)} с)`);

// шкала по фактической озвучке: файл отрендерен с ней (а не по оценке без манифеста)
const manifest = JSON.parse(readFileSync(`public/${ED.voiceDir}/manifest.json`, "utf8"));
const T = buildTimeline(manifest, A3_VIDEO.fps, ED.lines);
ok(manifest.complete === true && !T.estimated, `шкала по фактической озвучке (${T.total.toFixed(2)} с)`);
ok(Math.abs(dur - T.total) <= 0.3, `длительность файла совпадает со шкалой (${dur.toFixed(2)} с при шкале ${T.total.toFixed(2)} с, допуск 0,3 с)`);

// громкость и true peak (EBU R128)
const r128 = ff(["-i", file, "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"]);
const sum = r128.slice(r128.lastIndexOf("Summary:"));
const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(sum)?.[1]);
const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(sum.slice(sum.indexOf("True peak")))?.[1]);
ok(I >= -17 && I <= -15, `громкость ${I} LUFS (цель −16, допуск −17…−15)`);
ok(TP <= -1, `true peak ${TP} dBTP (≤ −1)`);

// чёрные фрагменты и последний кадр
const black = (ff(["-i", file, "-vf", "blackdetect=d=0.1:pic_th=0.98", "-an", "-f", "null", "-"]).match(/black_start/g) ?? []).length;
ok(black === 0, `чёрных фрагментов: ${black}`);
const yavg = [...ff(["-sseof", "-0.5", "-i", file, "-vf", "signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG", "-an", "-f", "null", "-"]).matchAll(/YAVG=([\d.]+)/g)].map((x) => Number(x[1]));
const last = yavg.at(-1);
ok(last !== undefined && last > 40, `последний кадр не чёрный (средняя яркость ${last?.toFixed(1)})`);

const cut = (from, to, af) => ff(["-ss", from.toFixed(3), "-t", (to - from).toFixed(3), "-i", file, "-map", "0:a", "-af", af, "-f", "null", "-"]);
const maxVol = (from, to) => Number(/max_volume:\s+(-?[\d.]+|-inf)/.exec(cut(from, to, "volumedetect"))?.[1].replace("-inf", "-200"));
// непрерывная тишина (все отсчёты < −30 дБFS), накрывающая момент mid; ищется в [from, to]
const silentRun = (from, to, mid) => {
  const out = cut(from, to, "silencedetect=n=-30dB:d=0.5");
  const s = [...out.matchAll(/silence_start: (-?[\d.]+)/g)].map((x) => from + Number(x[1]));
  const e = [...out.matchAll(/silence_end: (-?[\d.]+)/g)].map((x) => from + Number(x[1]));
  const k = s.findIndex((x, i) => x <= mid && (e[i] ?? to) >= mid);
  return k < 0 ? 0 : (e[k] ?? to) - s[k];
};
// паузы для ответа зрителя — по звуку готового файла
for (const p of checkViewerPauses(T)) {
  const qEnd = T.seg[p.q].end;
  const aStart = T.seg[p.a].start;
  const max = maxVol(qEnd + 0.05, aStart - 0.05);
  const run = silentRun(qEnd - 1, aStart + 1, (qEnd + aStart) / 2);
  const need = p.need / T.fps;
  ok(
    p.ok && p.seconds >= need && max < -30 && run >= need,
    `пауза ${p.q} → ${p.a}: по шкале ${p.seconds.toFixed(2)} с / ${p.frames} кадров, по звуку тишина ${run.toFixed(2)} с (нужно ≥ ${need} с / ${p.need} кадров), макс. уровень внутри ${max} дБFS (< −30)`,
  );
}
// окно выдоха: между 008 и 009 нет ничьей речи (по границам речи всех реплик)
{
  const from = T.seg["80-1-3-008"].end;
  const to = T.seg["80-1-3-009"].start;
  const speechInside = Object.values(T.seg).filter((s) => s.start < to - 0.01 && s.end > from + 0.01).map((s) => s.line);
  const blow = T.hold.blow;
  const inside = blow && blow.start >= from && blow.end <= to;
  ok(
    to - from >= 2.9 && !speechInside.length && inside && blow.end - blow.start >= A3_BLOW_SEC - 1e-6,
    `окно выдоха 008 → 009: ${(to - from).toFixed(2)} с без речи (нужно ≥ 2,9), действие ${(blow ? blow.end - blow.start : 0).toFixed(2)} с внутри${speechInside.length ? `; речь: ${speechInside.join(", ")}` : ""}`,
  );
  // по звуку: в окне только мягкий выдох — громкость за 400 мс (EBU R128 M) ниже средней громкости речи
  const M = [...cut(from + 0.1, to - 0.1, "ebur128").matchAll(/t:\s*([\d.]+)\s+TARGET:\S+ LUFS\s+M:\s*(-?[\d.]+)/g)].filter((x) => Number(x[1]) >= 0.4).map((x) => Number(x[2]));
  const mMax = M.length ? Math.max(...M) : -Infinity;
  ok(mMax <= I - BLOW_LU, `выдох мягкий: громкость окна ≤ ${mMax.toFixed(1)} LUFS (M), на ${(I - mMax).toFixed(1)} LU тише ролика (нужно ≥ ${BLOW_LU})`);
}

// ---------- петли фона и вертушки — по звуку ----------
const SR = 48000;
// моно PCM 48 кГц через ffmpeg (args — вход и фильтр)
const pcm = (args) => {
  const b = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
};
const rms = (x, t0, t1) => {
  let e = 0;
  const i0 = Math.max(0, Math.round(t0 * SR)), i1 = Math.min(x.length, Math.round(t1 * SR));
  for (let i = i0; i < i1; i++) e += x[i] * x[i];
  return Math.sqrt(e / Math.max(1, i1 - i0)) + 1e-12;
};
// БПФ по основанию 2 на месте (inv — без деления на N)
const fft = (re, im, inv) => {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inv ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < h; k++) {
        const p = i + k, q = p + h;
        const tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
        re[q] = re[p] - tr;
        im[q] = im[p] - ti;
        re[p] += tr;
        im[p] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
};
// Вертушка в паузах для ответа неподвижна (сцены 3 и 7, вдали от окна) — шороха
// ротора нет. Нормированная взаимная корреляция отрезка (2,5–7 кГц) с циклической
// петлёй rotor.wav, максимум по всем сдвигам: звучащая петля даёт ≈ 0,7, без неё ≈ 0,02.
const HF = "highpass=f=2500:poles=2,highpass=f=2500:poles=2,lowpass=f=7000";
const rotorLoop = pcm(["-i", `${SFX}/rotor.wav`, "-af", HF]);
const rotorCorr = (from, len) => {
  const seg = pcm(["-ss", from.toFixed(3), "-t", len.toFixed(3), "-i", file, "-map", "0:a", "-af", HF]);
  const n = rotorLoop.length, m = seg.length;
  let N = 1;
  while (N < 2 * n + m) N <<= 1;
  const ar = new Float64Array(N), ai = new Float64Array(N), br = new Float64Array(N), bi = new Float64Array(N);
  ar.set(seg);
  br.set(rotorLoop);
  br.set(rotorLoop, n);
  fft(ar, ai, false);
  fft(br, bi, false);
  for (let k = 0; k < N; k++) {
    const r = ar[k] * br[k] + ai[k] * bi[k];
    ai[k] = ar[k] * bi[k] - ai[k] * br[k];
    ar[k] = r;
  }
  fft(ar, ai, true);
  const e = (x) => x.reduce((acc, y) => acc + y * y, 0);
  const norm = N * Math.sqrt((e(seg) * e(rotorLoop) * m) / n) || 1;
  let best = 0;
  for (let k = 0; k < n; k++) best = Math.max(best, Math.abs(ar[k]) / norm);
  return best;
};
for (const p of checkViewerPauses(T)) {
  const from = T.seg[p.q].end + 0.3;
  const c = rotorCorr(from, Math.min(3, T.seg[p.a].start - 0.3 - from));
  ok(c < 0.2, `в паузе после ${p.q} не слышно вертушки (корреляция с петлёй ротора ${c.toFixed(2)} < 0,2)`);
}
// Фон без провалов на стыках петель: уровень сразу после стыка (0…0,3 с) против
// уровня до него (−0,6…−0,1 с) в полосе, где слой главный, — среднее по стыкам
// без речи. Громкость петли, начинающаяся заново с каждого круга, даёт −10…−13 дБ;
// исправная сборка — около −3 дБ (так устроен сам roomtone.wav) или выше.
{
  const speech = Object.values(T.seg);
  const free = (t0, t1) => t0 > 1.5 && t1 < dur - 2.5 && speech.every((s) => t1 < s.start - 0.3 || t0 > s.end + 0.5) && (t1 < T.hold.blow.start - 0.5 || t0 > T.hold.blow.end + 0.5);
  const loops = [
    { name: "комната", src: "public/audio/lesson01/sfx/roomtone.wav", af: "lowpass=f=150:poles=2,lowpass=f=150:poles=2" },
    { name: "воздух у окна", src: `${SFX}/window-air.wav`, af: "highpass=f=200:poles=2,lowpass=f=1000:poles=2" },
  ];
  for (const L of loops) {
    const P = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", L.src], { encoding: "utf8" }));
    const x = pcm(["-i", file, "-map", "0:a", "-af", L.af]);
    const d = [];
    for (let k = 1; k * P < dur; k++) if (free(k * P - 0.7, k * P + 0.4)) d.push(20 * Math.log10(rms(x, k * P, k * P + 0.3) / rms(x, k * P - 0.6, k * P - 0.1)));
    const mean = d.length ? d.reduce((acc, y) => acc + y, 0) / d.length : 0;
    ok(mean > -6, `фон «${L.name}» без провалов на стыках петли ${P.toFixed(2)} с (${d.length} стыков без речи, в среднем ${mean.toFixed(1)} дБ; нужно > −6)`);
  }
}
if (fails.length) {
  for (const f of fails) console.error(`✗ ${f}`);
  process.exit(1);
}
console.log(`Готово: ${file}`);
