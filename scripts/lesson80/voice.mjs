// Озвучка Lesson80_1_14: файл на реплику (41), голоса — src/lesson80/voices.ts.
//
// • Реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed), уже
//   лежащая в public/audio/lesson80-1-14/, повторно не синтезируется.
// • Новая реплика синтезируется в 3 дублях; в фильм идёт дубль, который
//   Meta MMS («rus») распознаёт точнее (scripts/lesson80/asr.py).
// • Темп и высота тона не меняются. Тишина по краям обрезается, громкость
//   реплик выравнивается; конец проверяется на тишину (слово не обрезано).
// • Для губ сохраняются тайминги слов и рот по кадрам (буквы + огибающая).
//
// Запуск в CI: node scripts/lesson80/voice.mjs (нужен ELEVENLABS_API_KEY).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { L80_LINES, L80_VIDEO } from "../../src/lesson80/script.ts";
import { L80_TTS, L80_VOICES } from "../../src/lesson80/voices.ts";
import { decodeMono, ffmpeg, writeWav } from "../lib/audio.mjs";

const SR = 44100;
const FPS = L80_VIDEO.fps;
const OUT = join("public", L80_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const TMP = "out/lesson80-takes";
const TAKES = Number(process.env.L80_TAKES ?? 4);
// основной тон роли (Гц): из дублей с почти лучшей разборчивостью берётся
// ближайший к нему — тембр персонажа остаётся ровным между репликами
const F0_TARGET = { yusuf: 310, amir: 250, bilal: 190, teacher: 112 };
const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const plain = (s) => s.normalize("NFD").replace(/́/g, "").normalize("NFC");

const hashOf = (line, voice, seed) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 2, text: line.spoken ?? line.text, tag: line.tag ?? null, voice: voice.voiceId, tts: L80_TTS, seed }))
    .digest("hex")
    .slice(0, 16);

const rmsDb = (s, a, b) => {
  let acc = 0;
  a = Math.max(0, a);
  b = Math.min(s.length, b);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

const PAD = "Хорошо.";

const synth = async (line, voice, seed, padMode) => {
  const body = line.spoken ?? line.text;
  const tag = line.tag ? `${line.tag} ` : "";
  const text = `${tag}${body}${padMode === "none" ? "" : padMode === "pause" ? ` ... ${PAD}` : ` ${PAD}`}`;
  const res = await fetch(`${API}/v1/text-to-speech/${voice.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: L80_TTS.modelId, language_code: L80_TTS.languageCode, seed, voice_settings: L80_TTS.voiceSettings }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const al = data.alignment;
  const chars = al.characters;
  const st = al.character_start_times_seconds;
  const en = al.character_end_times_seconds;
  const joined = chars.join("");
  const at = joined.indexOf(body);
  if (at < 0) throw new Error(`${line.id}: текст не найден в таймингах`);
  let a = at;
  let b = at + body.length - 1;
  while (a < b && !isLetter(joined[a])) a++;
  while (b > a && !isLetter(joined[b])) b--;
  const padAt = padMode === "none" ? -1 : joined.indexOf(PAD, at + body.length);
  // слова и буквы реплики
  const words = [];
  let i = a;
  while (i <= b) {
    while (i <= b && !isLetter(joined[i])) i++;
    let j = i;
    while (j <= b && (isLetter(joined[j]) || joined[j] === "́" || joined[j] === "-")) j++;
    if (j > i) words.push({ text: plain(joined.slice(i, j)), start: st[i], end: en[j - 1] });
    i = j;
  }
  const letters = [];
  for (let k = a; k <= b; k++) if (/\p{L}/u.test(joined[k])) letters.push({ c: joined[k].toLowerCase(), start: st[k], end: en[k] });
  return { audio: Buffer.from(data.audio_base64, "base64"), start: st[a], end: en[b], padStart: padAt >= 0 ? st[padAt] : null, words, letters };
};

// Попытки: со страховочным словом, с паузой перед ним, без него. Берётся
// первая, у которой после последнего слова тишина.
const takeOf = async (line, voice, seed) => {
  let best = null;
  for (const [ds, mode] of [[0, "pad"], [0, "pause"], [1, "pad"], [0, "none"]]) {
    const r = await synth(line, voice, seed + ds, mode);
    const raw = join(TMP, `${line.id}-${seed}-raw.mp3`);
    writeFileSync(raw, r.audio);
    const pcm = decodeMono(raw);
    const cutAt = r.padStart !== null ? Math.min(r.padStart - 0.04, r.end + 0.5) : pcm.length / SR;
    const cut = Math.min(pcm.length, Math.round(cutAt * SR));
    const tail = rmsDb(pcm, cut - Math.round(0.1 * SR), cut);
    const ok = (r.padStart !== null ? tail < -35 : tail < -30) && cutAt - r.end >= 0.05;
    const cand = { ...r, pcm: pcm.slice(0, cut), tail, seed: seed + ds };
    if (ok) return cand;
    if (!best || tail < best.tail) best = cand;
    console.warn(`  ⚠ ${line.id} (${mode}): конец не отделён тишиной (${tail.toFixed(1)} дБ)`);
  }
  const f = Math.min(best.pcm.length, Math.round(0.06 * SR));
  for (let k = 0; k < f; k++) best.pcm[best.pcm.length - f + k] *= 1 - k / f;
  return best;
};

// Обрезка краёв, выравнивание громкости (речь ≈ −18 дБFS), запись mp3 192k.
const finish = (t, outPath) => {
  const pcm = t.pcm;
  const a = Math.max(0, Math.round((t.start - 0.12) * SR));
  const b = Math.min(pcm.length, Math.round((t.end + 0.16) * SR));
  const out = pcm.slice(a, b);
  const fi = Math.round(0.012 * SR);
  const fo = Math.round(0.04 * SR);
  for (let k = 0; k < Math.min(fi, out.length); k++) out[k] *= k / fi;
  for (let k = 0; k < Math.min(fo, out.length); k++) out[out.length - 1 - k] *= k / fo;
  const blk = Math.round(0.05 * SR);
  let acc = 0;
  let n = 0;
  for (let k = 0; k + blk <= out.length; k += blk) {
    const db = rmsDb(out, k, k + blk);
    if (db > -40) {
      acc += Math.pow(10, db / 10);
      n++;
    }
  }
  const speechDb = n ? 10 * Math.log10(acc / n) : -30;
  let gain = Math.pow(10, (-18 - speechDb) / 20);
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  gain = Math.min(gain, Math.pow(10, -3 / 20) / Math.max(peak, 1e-6));
  for (let k = 0; k < out.length; k++) out[k] *= gain;
  const wav = outPath.replace(/\.mp3$/, ".wav");
  writeWav(wav, [out], SR);
  ffmpeg(["-i", wav, "-ac", "1", "-ar", String(SR), "-c:a", "libmp3lame", "-b:a", "192k", outPath]);
  const off = a / SR;
  // рот по кадрам: буква + огибающая громкости
  const frames = Math.ceil((out.length / SR) * FPS);
  const env = [];
  for (let f = 0; f < frames; f++) env.push(rmsDb(out, Math.round((f / FPS) * SR), Math.round(((f + 1) / FPS) * SR)));
  const cls = (c) => {
    if ("аяа".includes(c)) return [1, 0, 0.2];
    if ("оё".includes(c)) return [0.75, 1, 0];
    if ("ую".includes(c)) return [0.45, 1, 0];
    if ("эе".includes(c)) return [0.7, 0, 0.6];
    if ("иы".includes(c)) return [0.45, 0, 1];
    if ("мбп".includes(c)) return [0, 0, 0];
    if ("вф".includes(c)) return [0.15, 0, 0.2];
    return [0.3, 0, 0.2];
  };
  const mouth = [];
  for (let f = 0; f < frames; f++) {
    const tt = f / FPS + off + 0.5 / FPS;
    const L = t.letters.find((l) => tt >= l.start && tt < l.end);
    const loud = Math.max(0, Math.min(1, (env[f] + 42) / 22));
    const [o, r, w] = L ? cls(L.c) : [0, 0, 0];
    mouth.push([Number((o * (0.35 + 0.65 * loud)).toFixed(2)), r, w]);
  }
  return {
    duration: out.length / SR,
    speechStart: t.start - off,
    speechEnd: t.end - off,
    words: t.words.map((w) => ({ text: w.text, start: Number((w.start - off).toFixed(3)), end: Number((w.end - off).toFixed(3)) })),
    mouth,
  };
};

const lines = [];
const pending = [];
for (const line of L80_LINES) {
  if (line.derive) {
    lines.push(null); // собирается после синтеза исходной реплики
    continue;
  }
  const voice = L80_VOICES[line.role];
  const seed = line.seed ?? L80_TTS.seed;
  const hash = hashOf(line, voice, seed);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    continue;
  }
  if (!key) throw new Error(`Нет озвучки ${line.id}, а ELEVENLABS_API_KEY не задан`);
  const takes = [];
  for (let k = 0; k < TAKES; k++) {
    const s = seed + k * 11;
    const t = await takeOf(line, voice, s);
    const path = join(TMP, `${line.id}-take${k}.mp3`);
    const info = finish(t, path);
    takes.push({ path, info, seed: t.seed });
    console.log(`→ ${line.id} [${line.role}: ${voice.name}] дубль ${k} seed ${t.seed}: ${info.duration.toFixed(2)} с`);
  }
  lines.push(null);
  pending.push({ line, hash, file, voice, takes, index: lines.length - 1 });
}

if (pending.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.text })))));
  execFileSync("python3", ["scripts/lesson80/asr.py", inp, out], { stdio: "inherit" });
  const scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  for (const p of pending) {
    const ranked = p.takes.map((t) => ({ ...t, asr: scores.get(t.path) }));
    const minCer = Math.min(...ranked.map((t) => t.asr.cer));
    const target = F0_TARGET[p.line.role];
    const dist = (t) => (t.asr.f0 > 0 ? Math.abs(Math.log(t.asr.f0 / target)) : 9);
    const best = ranked.filter((t) => t.asr.cer <= minCer + 0.05).reduce((a, b) => (dist(b) < dist(a) ? b : a));
    copyFileSync(best.path, join(OUT, p.file));
    lines[p.index] = {
      id: p.line.id,
      role: p.line.role,
      text: p.line.text,
      file: p.file,
      voice: p.voice.name,
      voiceId: p.voice.voiceId,
      hash: p.hash,
      seed: best.seed,
      ...best.info,
      asrCer: best.asr.cer,
      asrHeard: best.asr.heard,
      f0: best.asr.f0,
      takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr.cer, f0: t.asr.f0, sec: Number(t.info.duration.toFixed(2)) })),
    };
    console.log(`✓ ${p.line.id}: CER ${best.asr.cer} (дубли ${ranked.map((t) => t.asr.cer).join(" / ")}), F0 ${best.asr.f0} — «${best.asr.heard}»`);
  }
}
// Производные реплики: то же произнесение слова из другой реплики
// (01 «Альхамдулиллях!» = первое слово реплики 41 — одинаково и отчётливо).
for (let i = 0; i < L80_LINES.length; i++) {
  const line = L80_LINES[i];
  if (!line.derive) continue;
  const src = lines.find((l) => l?.id === line.derive.from);
  const w = src.words.slice(0, line.derive.words);
  const end = Math.min(src.duration, w[w.length - 1].end + 0.16);
  const file = `${line.id}.mp3`;
  const wav = join(TMP, `${line.id}-derived.wav`);
  ffmpeg(["-i", join(OUT, src.file), "-t", end.toFixed(3), "-af", `afade=t=out:st=${(end - 0.05).toFixed(3)}:d=0.05`, "-ac", "1", "-ar", String(SR), wav]);
  ffmpeg(["-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", join(OUT, file)]);
  const frames = Math.ceil(end * FPS);
  lines[i] = {
    id: line.id,
    role: line.role,
    text: line.text,
    file,
    voice: src.voice,
    voiceId: src.voiceId,
    hash: `derived-${src.hash}-${line.derive.words}`,
    derivedFrom: src.id,
    duration: end,
    speechStart: src.speechStart,
    speechEnd: w[w.length - 1].end,
    words: w,
    mouth: src.mouth.slice(0, frames),
    asrCer: null,
    asrHeard: null,
    f0: src.f0,
  };
  console.log(`✓ ${line.id}: из реплики ${src.id} (${w.map((x) => x.text).join(" ")}), ${end.toFixed(2)} с`);
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, video: L80_VIDEO.id, lines }, null, 1) + "\n");
console.log(`Реплик: ${lines.length}, новых: ${pending.length}`);
