// Сборка финальных файлов реплик ролика 80-1-3 «А если я не вижу?» из
// сырых дублей (без обращения к API). Та же обработка, что у первого фильма
// (scripts/lesson01-build-voice.mjs), — одинаковые громкость и обрезка.
//
// Для каждой реплики берётся выбранный дубль (src/lesson80-1-3/voices.json
// → pick[segId], по умолчанию 0):
//   • страховочное слово в конце вырезается по таймингам, конец проверяется
//     на тишину (слова не обрезаются);
//   • тишина по краям обрезается с запасом, громкость речи выравнивается
//     (≈ −18 дБFS RMS речи, пик ≤ −3 дБFS); темп и высота тона не меняются;
//   • сохраняются тайминги слов и букв и огибающая громкости по кадрам
//     (30 к/с) — по ним двигаются губы.
// Групповых реплик в этом фильме нет: говорят только четыре героя.
//
// Результат: public/audio/lesson80-1-3/<id>.mp3 и manifest.json
// (кыргызская версия, --lang=ky: public/audio/lesson80-1-3-ky/, voices-ky.json).
// Замена одной реплики: положите свою запись в public/audio/lesson80-1-3/override/
// <id>.wav (или .mp3) — она заменит синтез при следующей сборке.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { decodeMono, ffmpeg, writeWav } from "./lib/audio.mjs";
import { ED, plan } from "./lesson80-1-3-voice.mjs";

const SR = 48000;
const FPS = 30;
const DIR = `public/${ED.voiceDir}`;
const RAW = join(DIR, "raw");
const OVR = join(DIR, "override");
const TMP = join(tmpdir(), `lesson80-1-3-voice-${ED.lang}`);
mkdirSync(TMP, { recursive: true });
const cfg = JSON.parse(readFileSync(ED.voices, "utf8"));
const r3 = (x) => Number(x.toFixed(3));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);

const rmsDb = (s, a, b) => {
  let acc = 0;
  a = Math.max(0, a);
  b = Math.min(s.length, b);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

// Тайминги тела реплики внутри синтеза (без тега и страховочного слова).
const spans = (meta) => {
  const al = meta.alignment;
  const aligned = al.characters.join("");
  const st = al.character_start_times_seconds;
  const en = al.character_end_times_seconds;
  const norm = (s) => s.replace(/…/g, "...");
  const body = norm(meta.text);
  let i0 = aligned.indexOf(body);
  if (i0 < 0) i0 = aligned.indexOf(body.slice(0, 8));
  if (i0 < 0) throw new Error(`${meta.segId}: текст не найден в таймингах`);
  let a = i0;
  while (!isLetter(aligned[a])) a++;
  const padAt = aligned.lastIndexOf(meta.pad.replace(".", ""));
  let b = padAt > i0 ? padAt - 1 : aligned.length - 1;
  while (b > a && !isLetter(aligned[b])) b--;
  const words = [];
  let wc = a;
  for (const w of meta.text.split(/\s+/)) {
    const clean = [...w].filter(isLetter).join("");
    if (!clean) continue;
    let k = aligned.indexOf(clean[0], wc);
    if (k < 0 || k > b) continue;
    let e = k;
    let n = 0;
    while (e <= b && n < clean.length) {
      if (isLetter(aligned[e])) n++;
      if (n < clean.length) e++;
    }
    words.push({ text: w, start: st[k], end: en[Math.min(e, b)] });
    wc = e + 1;
  }
  const chars = [];
  for (let k = a; k <= b; k++) if (/\p{L}/u.test(aligned[k])) chars.push({ c: aligned[k].toLowerCase(), start: st[k], end: en[k] });
  // конец вводного слова (если реплика синтезирована с ним)
  let l = i0 - 1;
  while (l >= 0 && !isLetter(aligned[l])) l--;
  const leadEnd = meta.lead && l >= 0 ? en[l] : null;
  return { start: st[a], end: en[b], padStart: padAt > i0 ? st[padAt] : null, leadEnd, words, chars };
};

const envelope = (pcm) => {
  const per = SR / FPS;
  const env = [];
  for (let i = 0; i * per < pcm.length; i++) {
    const db = rmsDb(pcm, Math.round(i * per), Math.round((i + 1) * per));
    env.push(Number(Math.max(0, Math.min(1, (db + 48) / 34)).toFixed(2)));
  }
  return env;
};

// Обрезка и выравнивание громкости одного дубля → { pcm, info }.
const prepare = (meta, mp3) => {
  const pcm = decodeMono(mp3, SR);
  const sp = spans(meta);
  // Граница со страховочным словом: тайминги синтеза бывают на 0,1–0,15 с
  // раньше звука, поэтому режем не по ним, а в самой тихой точке (окна по
  // 10 мс) между концом реплики и началом страховочного слова — затухание
  // последнего слога сохраняется, начало «Хорошо» не попадает.
  const valley = (from, to) => {
    let best = from;
    let bestDb = Infinity;
    for (let t = from; t <= to; t += 0.005) {
      const db = rmsDb(pcm, Math.round(t * SR), Math.round((t + 0.01) * SR));
      if (db < bestDb) {
        bestDb = db;
        best = t;
      }
    }
    return best + 0.005;
  };
  const cutAt = sp.padStart !== null ? valley(Math.max(sp.end, sp.padStart - 0.1), Math.min(sp.padStart + 0.16, sp.end + 0.6)) : pcm.length / SR;
  const cut = Math.min(pcm.length, Math.round(cutAt * SR));
  const tail = rmsDb(pcm, cut - Math.round(0.08 * SR), cut);
  // Начало: тайминги синтеза бывают и позже звука (у «Спрашивай» терялось
  // «С»), поэтому от точки за 0,14 с до речи идём назад до настоящей тишины
  // (окно 10 мс тише −45 дБ), не дальше 0,6 с.
  let a = Math.max(0, Math.round((sp.start - 0.14) * SR));
  if (sp.leadEnd !== null) {
    // после вводного слова — самая тихая точка между ним и репликой
    a = Math.round(valley(Math.max(0, sp.leadEnd - 0.05), sp.start + 0.05) * SR);
  } else {
    const a0 = Math.max(0, Math.round((sp.start - 0.74) * SR));
    while (a > a0 && rmsDb(pcm, a - 480, a) > -45) a -= 240;
    // немного тишины перед первым звуком (место в шкале считается от начала
    // речи, а не от начала файла)
    a = Math.max(0, a - Math.round(0.12 * SR));
  }
  // хвост: до конца последнего слова + естественное затухание
  let b = cut;
  const thr = -50;
  while (b > Math.round(sp.end * SR) + Math.round(0.06 * SR) && rmsDb(pcm, b - 480, b) < thr) b -= 480;
  b = Math.min(cut, b + Math.round(0.1 * SR));
  const out = pcm.slice(a, b);
  const fi = Math.round(0.012 * SR);
  const fo = Math.round(0.05 * SR);
  for (let i = 0; i < Math.min(fi, out.length); i++) out[i] *= i / fi;
  for (let i = 0; i < Math.min(fo, out.length); i++) out[out.length - 1 - i] *= i / fo;
  // громкость речи
  const blk = Math.round(0.05 * SR);
  let acc = 0;
  let cnt = 0;
  for (let i = 0; i + blk <= out.length; i += blk) {
    const db = rmsDb(out, i, i + blk);
    if (db > -42) {
      acc += Math.pow(10, db / 10);
      cnt++;
    }
  }
  const speechDb = cnt ? 10 * Math.log10(acc / cnt) : -30;
  const gain = Math.pow(10, (-18 - speechDb) / 20);
  let peak = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] *= gain;
    peak = Math.max(peak, Math.abs(out[i]));
  }
  const lim = Math.pow(10, -3 / 20);
  if (peak > lim) for (let i = 0; i < out.length; i++) out[i] = Math.tanh((out[i] / lim) * 0.9) * lim;
  // Границы речи — по звуку (окна 10 мс громче −40 дБ после нормализации):
  // от них считаются промежутки между репликами и паузы для зрителя.
  // Тайминги слов и букв линейно переносятся с границ синтеза на звуковые,
  // чтобы губы не опережали и не отставали от голоса.
  const loud = (i) => rmsDb(out, i, i + 480) > -40;
  let on = 0;
  while (on < out.length - 480 && !loud(on)) on += 240;
  let off = out.length - 480;
  while (off > on && !loud(off)) off -= 240;
  const ac0 = on / SR;
  const ac1 = Math.min(out.length / SR, (off + 480) / SR);
  const shift = a / SR;
  const s0 = sp.start - shift;
  const s1 = sp.end - shift;
  const map = (t) => r3(Math.max(0, ac0 + ((t - shift - s0) / Math.max(0.05, s1 - s0)) * (ac1 - ac0)));
  return {
    pcm: out,
    info: {
      speechStart: r3(ac0),
      speechEnd: r3(ac1),
      alignStart: r3(s0),
      alignEnd: r3(s1),
      words: sp.words.map((w) => ({ text: w.text, start: map(w.start), end: map(w.end) })),
      chars: sp.chars.map((c) => ({ c: c.c, start: map(c.start), end: map(c.end) })),
      tailDb: r3(tail),
      gainDb: r3(-18 - speechDb),
    },
  };
};

const toMp3 = (channels, path) => {
  const wav = join(TMP, "tmp.wav");
  writeWav(wav, channels, SR);
  ffmpeg(["-i", wav, "-ar", String(SR), "-codec:a", "libmp3lame", "-b:a", "192k", path]);
};

console.log(`Версия: ${ED.lang} → ${DIR}`);
const jobs = plan(false, false); // только голос роли (без кандидатов trials)
const segIds = [...new Set(jobs.map((j) => j.segId))];
const lines = [];
const missing = [];
for (const segId of segIds) {
  const segJobs = jobs.filter((j) => j.segId === segId);
  const line = ED.lines.find((l) => l.id === segJobs[0].line);
  const file = `${segId}.mp3`;
  const ovr = ["wav", "mp3"].map((e) => join(OVR, `${segId}.${e}`)).find((p) => existsSync(p));
  if (ovr) {
    // своя запись: границы речи — по порогу громкости
    const pcm = decodeMono(ovr, SR);
    const loud = (i) => rmsDb(pcm, i, i + 480) > -42;
    let s = 0;
    while (s < pcm.length && !loud(s)) s += 480;
    let e = pcm.length - 480;
    while (e > s && !loud(e)) e -= 480;
    toMp3([pcm], join(DIR, file));
    lines.push({ segId, line: line.id, role: line.role, text: segJobs[0].text, file, source: "override", durationSec: r3(pcm.length / SR), speechStart: r3(s / SR), speechEnd: r3((e + 480) / SR), words: [], chars: [], env: envelope(pcm) });
    continue;
  }
  const have = segJobs.filter((j) => existsSync(join(RAW, `${j.key}.mp3`)));
  if (have.length === 0) {
    missing.push(segId);
    continue;
  }
  const pick = cfg.pick?.[segId] ?? 0;
  const job = have.find((j) => j.take === pick) ?? have[0];
  const meta = JSON.parse(readFileSync(join(RAW, `${job.key}.json`), "utf8"));
  const { pcm, info } = prepare(meta, join(RAW, `${job.key}.mp3`));
  toMp3([pcm], join(DIR, file));
  lines.push({
    segId,
    line: line.id,
    role: line.role,
    text: job.text,
    file,
    source: "elevenlabs",
    voice: job.voice.name,
    voiceId: job.voice.voiceId,
    seed: job.seed,
    take: job.take,
    tag: meta.tag,
    durationSec: r3(pcm.length / SR),
    ...info,
    env: envelope(pcm),
  });
  if (info.tailDb > -30) console.warn(`  ⚠ ${segId}: конец дубля не отделён тишиной (${info.tailDb} дБ)`);
}
const all = new Set(ED.lines.map((l) => l.id));
for (const id of all) if (!lines.some((l) => l.segId === id) && !missing.includes(id)) missing.push(id);
const manifest = { version: 1, video: ED.id, sampleRate: SR, fps: FPS, complete: missing.length === 0, missing, lines };
writeFileSync(join(DIR, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(`Сегментов: ${lines.length}, нет озвучки: ${missing.length ? missing.join(", ") : "—"}`);
