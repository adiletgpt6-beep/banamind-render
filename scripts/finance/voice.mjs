// Английская озвучка ведущего (ElevenLabs, рабочий TTS проекта) — файл на реплику.
//
// • Голос — готовый американский мужской голос (не клон автора исходника).
// • Каждая реплика синтезируется /with-timestamps: тайминги букв → слова
//   сценария (для субтитров и привязки графики) и буквы (для губ).
// • Соседние реплики передаются как previous_text/next_text — интонация
//   связная, без «чтения по карточкам».
// • Темп НЕ меняется. Края — мягкие 12 мс fade (без щелчков); громкость
//   каждой реплики выравнивается к −18 LUFS (пик ≤ −1.5 dBTP).
// • Кэш: реплика с тем же хэшем (текст, голос, модель, настройки, seed)
//   повторно не синтезируется.
// • Проверки: окончание не обрезано (тишина после последней буквы),
//   все слова сценария найдены в таймингах.
//
// Запуск: ELEVENLABS_API_KEY=… node scripts/finance/voice.mjs [en|ru]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SCENES as SCENES_EN, VOICE as VOICE_EN } from "../../src/finance/episode/script.ts";
import { SCENES_RU, VOICE_RU } from "../../src/finance/episode/script.ru.ts";

const LANG = process.argv[2] ?? "en";
if (!["en", "ru"].includes(LANG)) throw new Error(`Неизвестный язык ${LANG}`);
const SCENES = LANG === "ru" ? SCENES_RU : SCENES_EN;
const VOICE = LANG === "ru" ? VOICE_RU : VOICE_EN;
const OUT = LANG === "ru" ? "public/finance/voice-ru" : "public/finance/voice";
const MANIFEST = join(OUT, "manifest.json");
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
const TMP = join(tmpdir(), `finance-voice-${LANG}`);
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const lines = SCENES.flatMap((s) => s.lines);
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const hashOf = (ln) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 2, text: ln.text, ...(ln.say ? { say: ln.say } : {}), voice: VOICE.voiceId, model: VOICE.modelId, settings: VOICE.settings, seed: VOICE.seed }))
    .digest("hex")
    .slice(0, 16);

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const probeDur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
const lufsOf = (f) => {
  const out = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostats -i "${f}" -af ebur128=peak=true -f null - 2>&1 | tail -n 14`]).toString();
  const I = Number(/I:\s*(-?[\d.]+) LUFS/.exec(out)?.[1]);
  const P = Number(/Peak:\s*(-?[\d.]+) dBFS/.exec(out)?.[1]);
  return { I, P };
};

// Слова сценария по таймингам букв (последовательный поиск).
const strip = (t) => t.replace(/[.,!?;:]+$/, "");
const spokenText = (ln) => ln.text.split(/(\s+)/).map((t) => (ln.say?.[strip(t)] ? ln.say[strip(t)] + t.slice(strip(t).length) : t)).join("");
const wordsFromAlignment = (text, chars, starts, ends, say = {}) => {
  const aligned = chars.join("");
  const words = [];
  let pos = 0;
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const sayAs = say[strip(token)];
    if (sayAs) {
      // токен произносится словами — время берётся по фразе произношения
      const i = aligned.indexOf(sayAs, pos);
      if (i < 0) throw new Error(`Произношение «${sayAs}» не найдено в таймингах`);
      words.push({ text: token, start: starts[i], end: ends[i + sayAs.length - 1] });
      pos = i + sayAs.length;
      continue;
    }
    const core = [...token].filter(isLetter).join("");
    if (!core) {
      words.push(null);
      continue;
    }
    // ищем первую букву токена, затем последнюю
    let i = aligned.indexOf(token, pos);
    let len = token.length;
    if (i < 0) {
      i = aligned.indexOf(core, pos);
      len = core.length;
    }
    if (i < 0) throw new Error(`Слово «${token}» не найдено в таймингах`);
    let a = i;
    let b = i + len - 1;
    while (a < b && !isLetter(aligned[a])) a++;
    while (b > a && !isLetter(aligned[b])) b--;
    words.push({ text: token, start: starts[a], end: ends[b] });
    pos = i + len;
  }
  // токены без букв (например «—») получают время соседа
  return words.map((w, k) => w ?? { text: "—", start: words[k - 1]?.end ?? 0, end: words[k - 1]?.end ?? 0 });
};

const synth = async (ln, idx) => {
  const body = {
    text: spokenText(ln),
    model_id: VOICE.modelId,
    voice_settings: VOICE.settings,
    seed: VOICE.seed,
    previous_text: lines[idx - 1] ? spokenText(lines[idx - 1]) : undefined,
    next_text: lines[idx + 1] ? spokenText(lines[idx + 1]) : undefined,
    apply_text_normalization: "auto",
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}/v1/text-to-speech/${VOICE.voiceId}/with-timestamps?output_format=mp3_44100_192`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const msg = `${res.status}: ${(await res.text()).slice(0, 300)}`;
    if (attempt >= 4 || res.status === 401 || res.status === 400) throw new Error(`ElevenLabs ${ln.id} ${msg}`);
    console.warn(`  повтор ${ln.id}: ${msg}`);
    await new Promise((r) => setTimeout(r, 3000 * attempt));
  }
};

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
  if (!key) throw new Error(`Нет озвучки для ${ln.id}, а ELEVENLABS_API_KEY не задан.`);
  console.log(`→ ${ln.id}: ${ln.text}`);
  const data = await synth(ln, idx);
  const al = data.alignment;
  if (!al?.characters?.length) throw new Error(`${ln.id}: нет таймингов`);
  const raw = join(TMP, `${ln.id}-raw.mp3`);
  writeFileSync(raw, Buffer.from(data.audio_base64, "base64"));
  const rawDur = probeDur(raw);
  const starts = al.character_start_times_seconds;
  const ends = al.character_end_times_seconds;
  const words = wordsFromAlignment(ln.text, al.characters, starts, ends, ln.say ?? {});
  const chars = [];
  al.characters.forEach((c, i) => {
    if (/\p{L}/u.test(c)) chars.push({ c: c.toLowerCase(), start: +starts[i].toFixed(3), end: +ends[i].toFixed(3) });
  });
  const speechStart = words[0].start;
  const speechEnd = words[words.length - 1].end;
  // хвост: минимум 0.25 с после последней буквы, иначе добавляем тишину
  const padTail = Math.max(0, speechEnd + 0.25 - rawDur);
  const { I } = lufsOf(raw);
  const gain = Number.isFinite(I) ? Math.max(-12, Math.min(12, -18 - I)) : 0;
  const tmpWav = join(TMP, `${ln.id}.wav`);
  ff(["-i", raw, "-af", `apad=pad_dur=${padTail.toFixed(3)},volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=false,afade=t=in:d=0.012,areverse,afade=t=in:d=0.012,areverse`, "-ar", "44100", "-ac", "1", tmpWav]);
  ff(["-i", tmpWav, "-c:a", "libmp3lame", "-b:a", "192k", join(OUT, file)]);
  const duration = probeDur(join(OUT, file));
  const after = lufsOf(join(OUT, file));
  const entry = {
    id: ln.id,
    file,
    hash,
    duration: +duration.toFixed(3),
    speechStart: +speechStart.toFixed(3),
    speechEnd: +speechEnd.toFixed(3),
    lufs: +after.I.toFixed(1),
    peak: +after.P.toFixed(1),
    spoken: spokenText(ln),
    words: words.map((w) => ({ text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3) })),
    chars,
  };
  result.push(entry);
  made++;
  console.log(`  ✓ ${ln.id}: речь ${(speechEnd - speechStart).toFixed(2)} с, ${entry.lufs} LUFS, пик ${entry.peak} dBFS`);
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, voice: VOICE.name, model: VOICE.modelId, partial: true, lines: result }, null, 1) + "\n");
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, voice: VOICE.name, model: VOICE.modelId, lines: result }, null, 1) + "\n");
const total = result.reduce((a, l) => a + (l.speechEnd - l.speechStart), 0);
console.log(`Реплик: ${result.length} (новых: ${made}); чистой речи ${(total / 60).toFixed(1)} мин`);
