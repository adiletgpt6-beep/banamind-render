// Озвучка «Посмотри на небо!» — по файлу на реплику:
// public/muslim-kids/ali-imran/voice/<id>.mp3 + manifest.json (тайминги слов).
//
// • ElevenLabs multilingual v2 (ключ — секрет CI ELEVENLABS_API_KEY), один голос
//   на весь ролик; соседние реплики передаются как previous_text/next_text —
//   интонация связная. Тайминги букв → слова: анимация привязана к словам.
// • Громкость каждой реплики выравнивается к −18 LUFS, края — короткий fade.
// • Кэш: реплика с тем же хэшем (текст, голос, модель, настройки) не синтезируется
//   повторно.
//
// Запуск: ELEVENLABS_API_KEY=… node scripts/muslim-kids/voice.mjs
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LINES, VIDEO, VOICE } from "../../src/muslim-kids/ali-imran/script.ts";

const OUT = join("public", VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
const TMP = join(tmpdir(), "mk-ali-imran-voice");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const prev = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const spoken = (ln) => ln.say ?? ln.text;
const hashOf = (ln) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        v: 1,
        text: spoken(ln),
        voice: VOICE.voiceId,
        model: VOICE.modelId,
        settings: VOICE.settings,
        seed: ln.seed ?? VOICE.seed,
      }),
    )
    .digest("hex")
    .slice(0, 16);
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const ff = (args) =>
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const probeDur = (f) =>
  Number(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      f,
    ])
      .toString()
      .trim(),
  );
const loudness = (f) => {
  const out = execFileSync("bash", [
    "-c",
    `ffmpeg -hide_banner -nostats -i "${f}" -af ebur128 -f null - 2>&1 | tail -n 12`,
  ]).toString();
  return Number(/I:\s*(-?[\d.]+) LUFS/.exec(out)?.[1]);
};

// слова текста по таймингам букв (последовательный поиск)
const wordsFromAlignment = (text, chars0, starts0, ends0) => {
  // знаки ударения (U+0301) из текста для синтеза не участвуют в поиске слов
  const keep = chars0
    .map((c, i) => (c === "\u0301" ? -1 : i))
    .filter((i) => i >= 0);
  const chars = keep.map((i) => chars0[i]);
  const starts = keep.map((i) => starts0[i]);
  const ends = keep.map((i) => ends0[i]);
  const aligned = chars.join("");
  const words = [];
  let pos = 0;
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const core = [...token].filter(isLetter).join("");
    if (!core) continue;
    const i = aligned.indexOf(core, pos);
    if (i < 0) {
      words.push({ text: token, start: null, end: null });
      continue;
    }
    words.push({
      text: token,
      start: +starts[i].toFixed(3),
      end: +ends[i + core.length - 1].toFixed(3),
    });
    pos = i + core.length;
  }
  // пропуски — по соседям
  for (let k = 0; k < words.length; k++) {
    if (words[k].start !== null) continue;
    const a = words[k - 1]?.end ?? 0;
    const b =
      words.slice(k + 1).find((w) => w.start !== null)?.start ?? a + 0.4;
    words[k].start = +a.toFixed(3);
    words[k].end = +b.toFixed(3);
  }
  return words;
};

const synth = async (ln, idx) => {
  const body = {
    text: spoken(ln),
    model_id: VOICE.modelId,
    voice_settings: VOICE.settings,
    seed: ln.seed ?? VOICE.seed,
    previous_text: LINES[idx - 1] ? spoken(LINES[idx - 1]) : undefined,
    next_text: LINES[idx + 1] ? spoken(LINES[idx + 1]) : undefined,
    language_code: "ru",
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(
      `${API}/v1/text-to-speech/${VOICE.voiceId}/with-timestamps?output_format=mp3_44100_192`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (res.ok) return res.json();
    const msg = `${res.status}: ${(await res.text()).slice(0, 300)}`;
    if (attempt >= 4 || res.status === 401)
      throw new Error(`ElevenLabs ${ln.id} ${msg}`);
    if (res.status === 400 && /language_code/.test(msg))
      delete body.language_code;
    console.warn(`  повтор ${ln.id}: ${msg}`);
    await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
};

const todo = LINES.filter(
  (ln) =>
    !(
      prevById.get(ln.id)?.hash === hashOf(ln) &&
      existsSync(join(OUT, `${ln.id}.mp3`))
    ),
);
if (todo.length && !key)
  throw new Error(
    `Нет озвучки для ${todo.length} реплик, а ELEVENLABS_API_KEY не задан.`,
  );

const result = [];
let made = 0;
for (let idx = 0; idx < LINES.length; idx++) {
  const ln = LINES[idx];
  const hash = hashOf(ln);
  const file = `${ln.id}.mp3`;
  const old = prevById.get(ln.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    result.push(old);
    continue;
  }
  console.log(`→ ${ln.id}: ${spoken(ln)}`);
  const data = await synth(ln, idx);
  const raw = join(TMP, `${ln.id}-raw.mp3`);
  writeFileSync(raw, Buffer.from(data.audio_base64, "base64"));
  const al = data.alignment;
  const st = al.character_start_times_seconds;
  const en = al.character_end_times_seconds;
  const words = wordsFromAlignment(ln.text, al.characters, st, en);
  const first = al.characters.findIndex(isLetter);
  let last = al.characters.length - 1;
  while (last > 0 && !isLetter(al.characters[last])) last--;
  const speechStart = st[first];
  const speechEnd = en[last];
  const rawDur = probeDur(raw);
  const pad = Math.max(0, speechEnd + 0.3 - rawDur);
  const gain = -18 - loudness(raw);
  ff([
    "-i",
    raw,
    "-af",
    `volume=${gain.toFixed(2)}dB,alimiter=limit=0.89,afade=t=in:d=0.012,apad=pad_dur=${pad.toFixed(3)},afade=t=out:st=${(rawDur + pad - 0.03).toFixed(3)}:d=0.03`,
    "-ar",
    "48000",
    "-ac",
    "1",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    join(OUT, file),
  ]);
  result.push({
    id: ln.id,
    file,
    hash,
    text: ln.text,
    duration: +probeDur(join(OUT, file)).toFixed(3),
    speechStart: +speechStart.toFixed(3),
    speechEnd: +speechEnd.toFixed(3),
    words,
  });
  made++;
}
writeFileSync(
  MANIFEST,
  JSON.stringify(
    { version: 1, engine: "elevenlabs", voice: VOICE.name, lines: result },
    null,
    2,
  ) + "\n",
);
const speech = result.reduce((a, l) => a + l.speechEnd - l.speechStart, 0);
console.log(
  `Озвучка: ${result.length} реплик (новых ${made}), чистая речь ${speech.toFixed(1)} с.`,
);
