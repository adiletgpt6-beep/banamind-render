// Озвучка BM-039 — по файлу на реплику, public/bm039-republic/voice/<id>.mp3.
//
// • Основной движок — ElevenLabs (голос банана Eric, как во всех фильмах BanaMind;
//   ключ — в секретах CI): тайминги букв → слова (титры) и буквы (рот).
// • Резерв — локальный Piper ru_RU (sherpa-onnx) + выравнивание по буквам через
//   локальное распознавание (scripts/bm039/tts_align_local.py): VOICE_ENGINE=piper.
//   Нужен, когда CI/ElevenLabs недоступны; голос другой — это отмечается в STATUS.
// • Ударения имён — из словаря STRESS (только для синтеза; титры без знаков).
// • Громкость каждой реплики выравнивается к −18 LUFS, края — 12 мс fade.
// • Кэш: реплика с тем же хэшем (текст, произношение, движок, голос) не синтезируется.
//
// Запуск: ELEVENLABS_API_KEY=… node scripts/bm039/voice.mjs
//         VOICE_ENGINE=piper PIPER_MODEL=…/vits-piper-ru_RU-ruslan-medium ASR_MODEL=…/sherpa-onnx-zipformer-ru-2024-09-18 node scripts/bm039/voice.mjs
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, STRESS, VOICE } from "../../src/bm039-republic/script.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = "public/bm039-republic/voice";
const MANIFEST = join(OUT, "manifest.json");
const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
const ENGINE = process.env.VOICE_ENGINE ?? "elevenlabs";
const TMP = join(tmpdir(), "bm039-voice");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const lines = SCENES.flatMap((s) => s.lines);
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const voiceId = ENGINE === "piper" ? `piper:${(process.env.PIPER_MODEL ?? "").replace(/\/$/, "").split("/").pop()}@${process.env.PIPER_SPEED ?? "0.86"}` : VOICE.voiceId;
const settingsOf = (ln) => (ln.expr ? { ...VOICE.settings, ...VOICE.expressive } : VOICE.settings);
const hashOf = (ln) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 1, engine: ENGINE, text: ln.text, say: spoken(ln), voice: voiceId, model: VOICE.modelId, settings: settingsOf(ln), seed: VOICE.seed }))
    .digest("hex")
    .slice(0, 16);
// произношение: явное say или текст с ударениями из словаря STRESS (только целые слова)
const stressRe = new RegExp(`(?<![\\p{L}])(${Object.keys(STRESS).join("|")})(?![\\p{L}])`, "gu");
const spoken = (ln) => ln.say ?? ln.text.replace(stressRe, (w) => STRESS[w]);

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const probeDur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const loudness = (f) => {
  const out = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${f}" -af ebur128 -f null - 2>&1 | tail -n 12`]).toString();
  return Number(/I:\s*(-?[\d.]+) LUFS/.exec(out)?.[1]);
};

// громкость по кадрам 30 fps → 0…1 (для рта и проверки начала/конца речи)
const envelope = (f) => {
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const s = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);
  const hop = 16000 / 30;
  const rms = [];
  for (let i = 0; i < s.length; i += hop) {
    let acc = 0;
    const n = Math.min(hop, s.length - i);
    for (let k = 0; k < n; k++) acc += (s[Math.floor(i) + k] / 32768) ** 2;
    rms.push(Math.sqrt(acc / Math.max(1, n)));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  return rms.map((v) => {
    const x = Math.min(1, v / ref);
    return x < 0.06 ? 0 : +x.toFixed(2);
  });
};

// слова сценария по таймингам букв ElevenLabs (последовательный поиск)
const wordsFromAlignment = (text, chars, starts, ends) => {
  const aligned = chars.join("");
  const words = [];
  let pos = 0;
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const core = [...token].filter(isLetter).join("");
    if (!core) {
      words.push(null);
      continue;
    }
    let i = aligned.indexOf(token, pos);
    let len = token.length;
    if (i < 0) {
      i = aligned.indexOf(core, pos);
      len = core.length;
    }
    if (i < 0) {
      words.push(null);
      continue;
    }
    let a = i;
    let b = i + len - 1;
    while (a < b && !isLetter(aligned[a])) a++;
    while (b > a && !isLetter(aligned[b])) b--;
    words.push({ text: token, start: starts[a], end: ends[b] });
    pos = i + len;
  }
  return words;
};

// слова по пропорции букв внутри речи (Piper без таймингов, или пропуски)
const fillWords = (text, words, speechStart, speechEnd) => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const weights = tokens.map((t) => 1 + [...t].filter(isLetter).length);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return tokens.map((t, i) => {
    const est = {
      text: t,
      start: +(speechStart + ((speechEnd - speechStart) * acc) / total).toFixed(3),
      end: +(speechStart + ((speechEnd - speechStart) * (acc + weights[i])) / total).toFixed(3),
    };
    acc += weights[i];
    return words?.[i] ?? est;
  });
};

const synthEleven = async (ln, idx) => {
  const body = {
    text: spoken(ln),
    model_id: VOICE.modelId,
    voice_settings: settingsOf(ln),
    seed: VOICE.seed,
    previous_text: lines[idx - 1] ? spoken(lines[idx - 1]) : undefined,
    next_text: lines[idx + 1] ? spoken(lines[idx + 1]) : undefined,
    language_code: "ru",
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}/v1/text-to-speech/${VOICE.voiceId}/with-timestamps?output_format=mp3_44100_192`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const msg = `${res.status}: ${(await res.text()).slice(0, 300)}`;
    if (attempt >= 4 || res.status === 401 || (res.status === 400 && !/language_code/.test(msg))) throw new Error(`ElevenLabs ${ln.id} ${msg}`);
    if (res.status === 400) delete body.language_code;
    console.warn(`  повтор ${ln.id}: ${msg}`);
    await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
};

// Piper: все недостающие реплики одним вызовом
const todo = lines.filter((ln) => !(prevById.get(ln.id)?.hash === hashOf(ln) && existsSync(join(OUT, `${ln.id}.mp3`))));
let local = {};
if (ENGINE === "piper" && todo.length) {
  const speed = Number(process.env.PIPER_SPEED ?? "0.86");
  const jobs = todo.map((ln) => ({ id: ln.id, say: spoken(ln), text: ln.text, out: join(TMP, `${ln.id}-raw.wav`), speed: ln.expr ? speed + 0.05 : speed }));
  writeFileSync(join(TMP, "jobs.json"), JSON.stringify(jobs));
  execFileSync(process.env.PIPER_PY ?? "python3", ["-I", join(HERE, "tts_align_local.py"), process.env.PIPER_MODEL, process.env.ASR_MODEL, join(TMP, "jobs.json"), join(TMP, "align.json")], { stdio: "inherit" });
  local = JSON.parse(readFileSync(join(TMP, "align.json"), "utf8"));
}
if (ENGINE === "elevenlabs" && todo.length && !key) throw new Error(`Нет озвучки для ${todo.length} реплик, а ELEVENLABS_API_KEY не задан.`);

const result = [];
let made = 0;
for (let idx = 0; idx < lines.length; idx++) {
  const ln = lines[idx];
  const hash = hashOf(ln);
  const file = `${ln.id}.mp3`;
  const old = prevById.get(ln.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    result.push(old);
    continue;
  }
  let raw;
  let words = null;
  let chars = [];
  if (ENGINE === "piper") {
    raw = join(TMP, `${ln.id}-raw.wav`);
    const al = local[ln.id];
    if (al) {
      words = al.words;
      chars = al.chars;
    }
  } else {
    console.log(`→ ${ln.id}: ${ln.text.slice(0, 80)}`);
    const data = await synthEleven(ln, idx);
    const al = data.alignment;
    raw = join(TMP, `${ln.id}-raw.mp3`);
    writeFileSync(raw, Buffer.from(data.audio_base64, "base64"));
    if (al?.characters?.length) {
      const st = al.character_start_times_seconds;
      const en = al.character_end_times_seconds;
      // слова субтитров — по тексту субтитров, если произношение не менялось
      if (spoken(ln) === ln.text) words = wordsFromAlignment(ln.text, al.characters, st, en);
      al.characters.forEach((c, i) => {
        if (/\p{L}/u.test(c)) chars.push({ c: c.toLowerCase(), start: +st[i].toFixed(3), end: +en[i].toFixed(3) });
      });
    }
  }
  const rawDur = probeDur(raw);
  const env0 = envelope(raw);
  const firstOn = env0.findIndex((v) => v > 0.1);
  let lastOn = env0.length - 1;
  while (lastOn > 0 && env0[lastOn] <= 0.1) lastOn--;
  const speechStart = chars.length ? chars[0].start : Math.max(0, firstOn / 30 - 0.03);
  const speechEnd = chars.length ? chars[chars.length - 1].end : Math.min(rawDur, (lastOn + 1) / 30 + 0.03);
  words = fillWords(ln.text, words, speechStart, speechEnd);
  const padTail = Math.max(0, speechEnd + 0.25 - rawDur);
  const gain = -18 - loudness(raw);
  ff([
    "-i", raw,
    "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.84,afade=t=in:d=0.012,apad=pad_dur=${padTail.toFixed(3)},afade=t=out:st=${(rawDur + padTail - 0.012).toFixed(3)}:d=0.012`,
    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "160k", join(OUT, file),
  ]);
  const duration = probeDur(join(OUT, file));
  result.push({
    id: ln.id, file, hash, duration: +duration.toFixed(3),
    speechStart: +speechStart.toFixed(3), speechEnd: +speechEnd.toFixed(3),
    words, chars, env: envelope(join(OUT, file)),
  });
  made++;
  if (made % 10 === 0) writeFileSync(MANIFEST, JSON.stringify({ version: 1, engine: ENGINE, voice: voiceId, lines: result }));
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, engine: ENGINE, voice: voiceId, lines: result }));
const speech = result.reduce((a, l) => a + l.speechEnd - l.speechStart, 0);
console.log(`Озвучка: ${result.length} реплик (новых ${made}), речь ${(speech / 60).toFixed(1)} мин, движок ${ENGINE}.`);
