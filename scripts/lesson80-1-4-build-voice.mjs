// Сборка финальных файлов реплик ролика 80-1-4 «Один Создатель» из
// сырых дублей (без обращения к API). Та же обработка, что у первого фильма
// (scripts/lesson01-build-voice.mjs), — одинаковые громкость и обрезка.
//
// Для каждой реплики берётся выбранный дубль (src/lesson80-1-4/voices.json
// → pick[segId], по умолчанию 0):
//   • страховочное слово в конце вырезается по таймингам, конец проверяется
//     на тишину (слова не обрезаются);
//   • тишина по краям обрезается с запасом, громкость речи выравнивается
//     (≈ −18 дБFS RMS речи, пик ≤ −3 дБFS); темп и высота тона не меняются;
//   • сохраняются тайминги слов и букв и огибающая громкости по кадрам
//     (30 к/с) — по ним двигаются губы.
// Групповой ответ детей «Один! Аллах!» — смесь шести
// разных голосов с небольшими естественными сдвигами и панорамой (стерео).
//
// Результат: public/audio/lesson80-1-4/<id>.mp3 и manifest.json.
// Замена одной реплики: положите свою запись в public/audio/lesson80-1-4/override/
// <id>.wav (или .mp3) — она заменит синтез при следующей сборке.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { LANG, PACK, VOICE_DIR } from "./lib/a4-lang.mjs";
import { decodeMono, ffmpeg, writeWav } from "./lib/audio.mjs";
import { plan } from "./lesson80-1-4-voice.mjs";

// языковая версия: --lang=ky — свои реплики, голоса и папка озвучки
const A4_LINES = PACK.lines;

const SR = 48000;
const FPS = 30;
const DIR = VOICE_DIR;
const RAW = join(DIR, "raw");
const OVR = join(DIR, "override");
const TMP = join(tmpdir(), `lesson80-1-4-voice-${LANG}`);
mkdirSync(TMP, { recursive: true });
const cfg = JSON.parse(readFileSync(PACK.voices, "utf8"));
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
  return { start: st[a], end: en[b], padStart: padAt > i0 ? st[padAt] : null, words, chars };
};

// Фактические (акустические) границы речи: первые и последние 10 мс выше
// порога. Тайминги синтеза отмечают буквы, а затухание последнего слога и
// атака первого звучат на несколько сотых дольше — для пауз зрителя и
// стыков берётся более широкая из двух границ.
const SPEECH_DB = -40;
const acoustic = (pcm, aligned) => {
  const w = Math.round(0.01 * SR);
  const loud = (i) => rmsDb(pcm, i, i + w) > SPEECH_DB;
  let s = 0;
  while (s + w < pcm.length && !loud(s)) s += w;
  let e = pcm.length - w;
  while (e > s && !loud(e)) e -= w;
  const as = s / SR;
  const ae = (e + w) / SR;
  return {
    start: aligned ? Math.min(aligned.start, Math.max(as, aligned.start - 0.25)) : as,
    end: aligned ? Math.max(aligned.end, Math.min(ae, aligned.end + 0.35)) : ae,
  };
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

// Начало речи по звуку: первые 30 мс подряд громче −45 дБFS (или 10 мс громче
// −32). Тайминги ElevenLabs для реплик с тегом эмоции ([curious] и т. п.)
// отводят тегу первые ~0,2–0,3 с и сжимают начало текста, хотя звук начинается
// раньше, — поэтому начало реплики режется по звуку, а не по таймингам.
const onsetOf = (pcm, limit) => {
  const w = Math.round(0.01 * SR);
  for (let i = 0; i + 3 * w < Math.min(pcm.length, limit * SR); i += w) {
    const d0 = rmsDb(pcm, i, i + w);
    if (d0 > -32) return i / SR;
    if (d0 > -45 && rmsDb(pcm, i + w, i + 2 * w) > -45 && rmsDb(pcm, i + 2 * w, i + 3 * w) > -45) return i / SR;
  }
  return null;
};
// Перенос таймингов букв/слов: [первая буква, последняя буква] по таймингам →
// [начало по звуку, последняя буква] (конец по таймингам точен — по нему режется хвост).
const remapSpans = (sp, onset) => {
  if (onset === null || Math.abs(onset - sp.start) < 0.03 || onset >= sp.end - 0.1) return sp;
  const k = (sp.end - onset) / (sp.end - sp.start);
  const f = (t) => (t >= sp.end ? t : onset + (t - sp.start) * k);
  return {
    ...sp,
    start: onset,
    words: sp.words.map((w) => ({ ...w, start: f(w.start), end: f(w.end) })),
    chars: sp.chars.map((c) => ({ ...c, start: f(c.start), end: f(c.end) })),
    shiftedBy: onset - sp.start,
  };
};

// Обрезка и выравнивание громкости одного дубля → { pcm, info }.
const prepare = (meta, mp3) => {
  const pcm = decodeMono(mp3, SR);
  const sp0 = spans(meta);
  const sp = remapSpans(sp0, onsetOf(pcm, sp0.end));
  // разрез перед страховочным словом — в самой тихой точке между концом
  // последнего слова и началом «Хорошо» (окна 10 мс), чтобы не срезать
  // затухание последнего слога и не захватить начало страховочного слова
  let cutAt = pcm.length / SR;
  if (sp.padStart !== null) {
    const lo = Math.round((sp.end - 0.02) * SR);
    const hi = Math.round(Math.min(sp.padStart + 0.04, sp.end + 0.6) * SR);
    const w = Math.round(0.01 * SR);
    let best = Math.round((sp.padStart - 0.03) * SR);
    let bestDb = Infinity;
    for (let i = lo; i + w <= hi; i += Math.round(w / 2)) {
      const d = rmsDb(pcm, i, i + w);
      // при равной тишине — точка позже (длиннее естественное затухание)
      if (d < bestDb - 1.5 || (d < bestDb + 0.5 && i > best)) {
        if (d < bestDb) bestDb = d;
        best = i + Math.round(w / 2);
      }
    }
    cutAt = Math.min(best / SR, sp.end + 0.45);
  }
  const cut = Math.min(pcm.length, Math.round(cutAt * SR));
  const tail = rmsDb(pcm, cut - Math.round(0.08 * SR), cut);
  // до начала речи — 0,14 с тишины (вдох перед словом не режется)
  const a = Math.max(0, Math.round((sp.start - 0.14) * SR));
  // хвост: до конца последнего слова + естественное затухание
  let b = cut;
  const thr = -50;
  while (b > Math.round(sp.end * SR) + Math.round(0.06 * SR) && rmsDb(pcm, b - 480, b) < thr) b -= 480;
  b = Math.min(cut, b + Math.round(0.1 * SR));
  // затухание — только в тишине после последней буквы (не съедает слог);
  // после разреза добавляется 0,1 с тишины — естественный хвост реплики
  const lastEnd = Math.round((sp.end - a / SR) * SR);
  const body = pcm.slice(a, b);
  const fi = Math.round(0.012 * SR);
  const fo = Math.max(Math.round(0.008 * SR), Math.min(Math.round(0.05 * SR), body.length - lastEnd - Math.round(0.006 * SR)));
  for (let i = 0; i < Math.min(fi, body.length); i++) body[i] *= i / fi;
  for (let i = 0; i < Math.min(fo, body.length); i++) body[body.length - 1 - i] *= i / fo;
  // если в дубле перед речью меньше 0,14 с тишины — тишина добавляется
  const pre = Math.max(0, Math.round((0.14 - (sp.start - a / SR)) * SR));
  const out = new Float32Array(pre + body.length + Math.round(0.1 * SR));
  out.set(body, pre);
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
  const shift = (a - pre) / SR;
  const rel = (t) => r3(Math.max(0, t - shift));
  const ac = acoustic(out, { start: rel(sp.start), end: rel(sp.end) });
  return {
    pcm: out,
    info: {
      speechStart: r3(ac.start),
      speechEnd: r3(ac.end),
      alignedStart: rel(sp.start),
      alignedEnd: rel(sp.end),
      words: sp.words.map((w) => ({ text: w.text, start: rel(w.start), end: rel(w.end) })),
      chars: sp.chars.map((c) => ({ c: c.c, start: rel(c.start), end: rel(c.end) })),
      tailDb: r3(tail),
      onsetShift: r3(sp.shiftedBy ?? 0),
      gainDb: r3(-18 - speechDb),
    },
  };
};

const toMp3 = (channels, path) => {
  const wav = join(TMP, "tmp.wav");
  writeWav(wav, channels, SR);
  ffmpeg(["-i", wav, "-ar", String(SR), "-codec:a", "libmp3lame", "-b:a", "192k", path]);
};

const jobs = plan(true).filter((j) => !j.alt); // дубли сравнения голосов в фильм не идут
const segIds = [...new Set(jobs.map((j) => j.segId))];
const lines = [];
const missing = [];
for (const segId of segIds) {
  const segJobs = jobs.filter((j) => j.segId === segId);
  const line = A4_LINES.find((l) => l.id === segJobs[0].line);
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
  // группа: от каждого голоса — выбранный дубль (groupPick[имя], по умолчанию 0)
  // (голос из groupSkip — все его дубли теряли слово — в смесь не идёт)
  const chosen = line.role === "kids" ? segJobs.filter((j) => (j.gtake ?? 0) === (cfg.groupPick?.[j.voice.name] ?? 0) && !(cfg.groupSkip ?? []).includes(j.voice.name)) : segJobs;
  const have = chosen.filter((j) => existsSync(join(RAW, `${j.key}.mp3`)));
  if (have.length === 0) {
    missing.push(segId);
    continue;
  }
  if (line.role === "kids") {
    // Смесь голосов «Один! Аллах!»: каждое слово каждого голоса ставится
    // отдельно — дети говорят вместе, расхождение внутри слова 0–60 мс (при
    // сдвигах до 150 мс короткое «Один» размывалось до неразборчивости).
    // Первый голос — ведущий, остальные тише; панорама — по местам в классе.
    const offs = [0, 0.035, 0.055, 0.02, 0.06, 0.045];
    const gains = [0, -4, -5, -4.5, -6.5, -5.5];
    const pans = [-0.35, 0.3, -0.1, 0.45, -0.5, 0.15];
    const parts = have.map((j) => ({ j, ...prepare(JSON.parse(readFileSync(join(RAW, `${j.key}.json`), "utf8")), join(RAW, `${j.key}.mp3`)) }));
    const base = 0.12;
    const w = Math.round(0.01 * SR);
    // куски голоса по словам: граница — самая тихая точка между словами
    const pieces = parts.map((p) => {
      const ws = p.info.words;
      const cuts = [0];
      for (let k = 1; k < ws.length; k++) {
        const lo = Math.round(ws[k - 1].end * SR);
        const hi = Math.max(lo + w, Math.round(ws[k].start * SR));
        let best = Math.round((lo + hi) / 2);
        let bestDb = Infinity;
        for (let i = lo; i + w <= hi; i += w / 2) {
          const d = rmsDb(p.pcm, i, i + w);
          if (d < bestDb) {
            bestDb = d;
            best = i + w / 2;
          }
        }
        cuts.push(best);
      }
      cuts.push(p.pcm.length);
      return ws.map((wd, k) => ({ pcm: p.pcm.subarray(cuts[k], cuts[k + 1]), from: cuts[k] / SR, word: wd }));
    });
    const nW = Math.min(...pieces.map((x) => x.length));
    // общее время начала каждого слова: следующее слово — после самого
    // длинного предыдущего у всех голосов (никто не «наезжает»)
    const wordAt = [base];
    for (let k = 1; k < nW; k++) {
      const need = Math.max(...pieces.map((x, i) => offs[i % 6] + (x[k].word.start - x[k - 1].word.start)));
      wordAt.push(wordAt[k - 1] + need);
    }
    const len = Math.round((wordAt[nW - 1] + 0.2 + Math.max(...pieces.map((x) => x[nW - 1].pcm.length / SR))) * SR) + Math.round(0.1 * SR);
    const L = new Float32Array(len);
    const R = new Float32Array(len);
    pieces.forEach((x, i) => {
      const g = Math.pow(10, gains[i % 6] / 20) * 0.62;
      const pl = Math.sqrt((1 - pans[i % 6]) / 2);
      const pr = Math.sqrt((1 + pans[i % 6]) / 2);
      for (let k = 0; k < nW; k++) {
        const pc = x[k];
        // начало слова в куске (pc.word.start − pc.from) ставится на wordAt[k] + сдвиг голоса
        const o = Math.round((wordAt[k] + offs[i % 6] - (pc.word.start - pc.from)) * SR);
        const f = Math.round(0.005 * SR);
        for (let q = 0; q < pc.pcm.length; q++) {
          const idx = o + q;
          if (idx < 0 || idx >= len) continue;
          const env = Math.min(1, q / f, (pc.pcm.length - q) / f);
          L[idx] += pc.pcm[q] * env * g * pl * 1.41;
          R[idx] += pc.pcm[q] * env * g * pr * 1.41;
        }
      }
    });
    let peak = 0;
    for (let k = 0; k < len; k++) peak = Math.max(peak, Math.abs(L[k]), Math.abs(R[k]));
    const n = peak > 0.7 ? 0.7 / peak : 1;
    for (let k = 0; k < len; k++) {
      L[k] *= n;
      R[k] *= n;
    }
    toMp3([L, R], join(DIR, file));
    const mono = L.map((v, k) => (v + R[k]) / 2);
    const lead = pieces[0];
    const words = lead.slice(0, nW).map((pc, k) => ({ text: pc.word.text, start: r3(wordAt[k]), end: r3(wordAt[k] + Math.max(...pieces.map((x, i) => offs[i % 6] + x[k].word.end - x[k].word.start))) }));
    const gac = acoustic(mono, { start: base, end: words[words.length - 1].end });
    lines.push({
      segId,
      line: line.id,
      role: "kids",
      text: segJobs[0].text,
      file,
      source: "elevenlabs-group",
      voices: have.map((j) => j.voice.name),
      offsets: offs.slice(0, have.length),
      durationSec: r3(len / SR),
      speechStart: r3(gac.start),
      speechEnd: r3(gac.end),
      alignedStart: r3(base),
      alignedEnd: words[words.length - 1].end,
      words,
      chars: [],
      env: envelope(mono),
    });
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
const manifest = { version: 1, video: PACK.video.id, ...(LANG !== "ru" ? { lang: LANG } : {}), sampleRate: SR, fps: FPS, complete: missing.length === 0, missing, lines };
writeFileSync(join(DIR, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(`Сегментов: ${lines.length}, нет озвучки: ${missing.length ? missing.join(", ") : "—"}`);
