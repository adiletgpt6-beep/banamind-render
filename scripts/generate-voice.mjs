// Дикторская дорожка ролика: ИИ-голос ElevenLabs (eleven_v3, кыргызский).
//
// Весь текст NARRATION (src/config.ts) озвучивается ОДНИМ запросом
// /with-timestamps — так интонация связывает предложения. Из посимвольных
// таймингов ElevenLabs скрипт получает начало/конец каждого фрагмента и
// каждого слова; по ним Remotion строит монтаж (src/timeline.ts).
//
// Обработка: обрезка тишины по краям, громкость −16 LUFS (пик ≤ −1.5 дБTP).
// Темп не меняется: если текст не помещается в ролик — скрипт останавливает
// сборку с подсказкой сократить текст.
//
// Контроль качества (в лог): длительность, паузы между фразами, пик,
// «обрезанное» окончание, распознавание речи обратно (Speech-to-Text)
// и доля несовпадающих символов (CER) — косвенная проверка произношения.
//
// Нужна переменная ELEVENLABS_API_KEY (в GitHub — секрет репозитория).
// Необязательно: ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID.
// Запуск: npm run audio:voice
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { AUDIO, NARRATION, TIMING } from "../src/config.ts";
import {
  SAMPLE_RATE as SR,
  decodeMono,
  ffmpeg,
  writeWav,
} from "./lib/audio.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || NARRATION.voiceId;
const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || NARRATION.modelId;
const apiBase =
  process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";

const OUT = join("public", AUDIO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const FILE = "narration.mp3";
const TMP = join(tmpdir(), "balago-voice");

if (!apiKey) {
  console.log(
    "ELEVENLABS_API_KEY не задан — озвучка не создаётся. " +
      "Ролик будет собран с музыкой и эффектами, но без голоса.",
  );
  process.exit(0);
}

// Текст для синтеза: фрагменты через пробел. Во фрагменте можно указать
// тег интонации eleven_v3 (например "[warm]") в поле tag.
const parts = NARRATION.segments.map((s) => ({
  id: s.id,
  text: s.text,
  spoken: s.tag ? `${s.tag} ${s.text}` : s.text,
}));
const fullText = parts.map((p) => p.spoken).join(" ");

const request = {
  text: fullText,
  model_id: modelId,
  language_code: NARRATION.languageCode,
  seed: NARRATION.seed,
  voice_settings: NARRATION.voiceSettings,
  apply_text_normalization: "auto",
};
const hash = createHash("sha1")
  .update(JSON.stringify({ request, voiceId, v: 2 }))
  .digest("hex")
  .slice(0, 16);

mkdirSync(OUT, { recursive: true });
const previous = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : null;
if (previous?.hash === hash && existsSync(join(OUT, FILE))) {
  console.log(
    `= озвучка не изменилась (${previous.durationSec.toFixed(2)} с), используется готовая`,
  );
  console.log(
    "MANIFEST_JSON " + JSON.stringify({ ...previous, qc: undefined }),
  );
  process.exit(0);
}

const api = async (path, init) => {
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(
      `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 500)}`,
    );
  }
  return res;
};

// Синтез одним запросом + разбор посимвольных таймингов.
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const synthesize = async (withTags) => {
  const text = (
    withTags ? parts.map((p) => p.spoken) : parts.map((p) => p.text)
  ).join(" ");
  console.log(
    `→ голос ${voiceId}, модель ${modelId}, ${text.length} символов${withTags ? ", с тегами интонации" : ""}`,
  );
  console.log(`  «${text}»`);
  const data = await (
    await api(
      `/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, text }),
      },
    )
  ).json();
  const alignment = data.alignment;
  if (!alignment?.characters?.length) {
    throw new Error("ElevenLabs не вернул тайминги (alignment).");
  }
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;
  const aligned = alignment.characters.join("");
  // Ищем фрагменты и слова в выровненном тексте по порядку.
  const span = (from, needle) => {
    const i = aligned.indexOf(needle, from);
    if (i < 0) return null;
    let a = i;
    let b = i + needle.length - 1;
    while (a < b && !isLetter(aligned[a])) a++;
    while (b > a && !isLetter(aligned[b])) b--;
    return { a, b, next: i + needle.length };
  };
  const segments = [];
  const words = [];
  let cursor = 0;
  for (const part of parts) {
    const seg = span(cursor, part.text);
    if (!seg) {
      throw new Error(
        `Не удалось найти фрагмент «${part.id}» в таймингах ElevenLabs.`,
      );
    }
    segments.push({ id: part.id, start: starts[seg.a], end: ends[seg.b] });
    let wc = cursor;
    for (const w of part.text
      .split(/\s+/)
      .filter((x) => /[\p{L}\p{N}]/u.test(x))) {
      const r = span(wc, w);
      if (!r) continue;
      words.push({
        text: w,
        start: starts[r.a],
        end: ends[r.b],
        segment: part.id,
      });
      wc = r.next;
    }
    cursor = seg.next;
  }
  return { data, segments, words };
};

// eleven_v3 понимает теги интонации ([warm] и т. п.). Если тег всё же
// прозвучал вслух, перед фразой появляется лишняя «речь» — длинная пауза
// по таймингам. Тогда пересоздаём дорожку без тегов.
const tagged = parts.some((p) => p.spoken !== p.text);
let result = await synthesize(tagged);
if (tagged) {
  const suspicious = result.segments.filter((s, i) => {
    if (parts[i].spoken === parts[i].text) return false;
    const before = i === 0 ? 0 : result.segments[i - 1].end;
    return s.start - before > (i === 0 ? 0.7 : 1.1);
  });
  if (suspicious.length) {
    console.warn(
      `  ⚠ похоже, тег интонации прозвучал вслух перед: ${suspicious.map((s) => s.id).join(", ")} — пересоздаю без тегов`,
    );
    result = await synthesize(false);
  }
}
const { data, segments, words } = result;

// Аудио: обрезаем тишину в начале (сдвигая тайминги) и в конце.
mkdirSync(TMP, { recursive: true });
const rawPath = join(TMP, "raw.mp3");
writeFileSync(rawPath, Buffer.from(data.audio_base64, "base64"));
const pcm = decodeMono(rawPath);
const rawSec = pcm.length / SR;

const threshold = Math.pow(10, -45 / 20);
const win = Math.round(0.01 * SR);
const loudAt = (i) => {
  let m = 0;
  for (let k = i; k < Math.min(pcm.length, i + win); k++)
    m = Math.max(m, Math.abs(pcm[k]));
  return m > threshold;
};
let first = 0;
while (first < pcm.length && !loudAt(first)) first += win;
let last = pcm.length - win;
while (last > first && !loudAt(last)) last -= win;
const cutStart = Math.max(0, first - Math.round(0.03 * SR));
// Не обрезаем раньше конца последнего слова по таймингам ElevenLabs.
const lastWordEnd = Math.round(segments[segments.length - 1].end * SR);
const post = Math.round(0.25 * SR);
const cutEnd = Math.min(
  pcm.length,
  Math.max(last + win + post, lastWordEnd + post),
);
const trimmed = pcm.slice(cutStart, cutEnd);
const shift = cutStart / SR;

const trimmedWav = join(TMP, "trimmed.wav");
writeWav(trimmedWav, [trimmed]);
const outPath = join(OUT, FILE);
ffmpeg([
  "-i",
  trimmedWav,
  "-af",
  "loudnorm=I=-16:TP=-1.5:LRA=9",
  "-ar",
  String(SR),
  "-ac",
  "1",
  "-codec:a",
  "libmp3lame",
  "-b:a",
  "192k",
  outPath,
]);
const final = decodeMono(outPath);
const durationSec = final.length / SR;

const round = (x) => Number(x.toFixed(3));
const shiftItem = (x) => ({
  ...x,
  start: round(Math.max(0, x.start - shift)),
  end: round(Math.max(0, x.end - shift)),
});
const manifest = {
  version: 2,
  hash,
  voiceId,
  modelId,
  file: FILE,
  durationSec: round(durationSec),
  segments: segments.map(shiftItem),
  words: words.map(shiftItem),
};

// ---------- Контроль качества ----------
const warnings = [];
let peak = 0;
for (const v of final) peak = Math.max(peak, Math.abs(v));
const peakDb = 20 * Math.log10(peak || 1e-9);
console.log(
  `  исходно ${rawSec.toFixed(2)} с → после обрезки ${durationSec.toFixed(2)} с, пик ${peakDb.toFixed(1)} дБFS`,
);
if (peakDb > -0.5)
  warnings.push(`пик ${peakDb.toFixed(1)} дБFS — возможен перегруз`);

console.log("  фрагменты:");
for (let i = 0; i < manifest.segments.length; i++) {
  const s = manifest.segments[i];
  const gap = i > 0 ? s.start - manifest.segments[i - 1].end : s.start;
  console.log(
    `    ${s.id.padEnd(8)} ${s.start.toFixed(2)}–${s.end.toFixed(2)} с  (пауза перед: ${gap.toFixed(2)} с)`,
  );
  if (i > 0 && gap < 0)
    warnings.push(
      `фрагменты ${manifest.segments[i - 1].id} и ${s.id} накладываются`,
    );
  if (i > 0 && gap > 1.2)
    warnings.push(`длинная пауза ${gap.toFixed(2)} с перед «${s.id}»`);
}

// Окончание: последние 150 мс должны быть тише речи (слово не обрезано).
const n150 = Math.round(0.15 * SR);
let acc = 0;
for (let i = final.length - n150; i < final.length; i++)
  acc += final[i] * final[i];
const tailDb = 20 * Math.log10(Math.sqrt(acc / n150) || 1e-9);
console.log(`  уровень в последних 150 мс: ${tailDb.toFixed(1)} дБFS`);
if (tailDb > -40)
  warnings.push(
    `конец дорожки громкий (${tailDb.toFixed(1)} дБ) — возможно, обрезано слово`,
  );

const lastEnd = manifest.segments[manifest.segments.length - 1].end;
const totalSec = TIMING.narrationStartSec + lastEnd + TIMING.ctaHoldSec;
console.log(
  `  длина ролика ≈ ${totalSec.toFixed(1)} с (допустимо ${TIMING.minSec}–${TIMING.maxSec} с)`,
);

// Распознаём речь обратно и сравниваем с текстом.
try {
  const form = new FormData();
  form.append("model_id", "scribe_v2");
  form.append("language_code", "ky");
  form.append("tag_audio_events", "false");
  form.append(
    "file",
    new Blob([readFileSync(outPath)], { type: "audio/mpeg" }),
    FILE,
  );
  const stt = await (
    await api("/v1/speech-to-text", { method: "POST", body: form })
  ).json();
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/[^\p{L}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  const ref = norm(NARRATION.segments.map((s) => s.text).join(" "));
  const hyp = norm(stt.text ?? "");
  const dp = Array.from({ length: hyp.length + 1 }, (_, i) => i);
  for (let i = 1; i <= ref.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= hyp.length; j++) {
      const t = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (ref[i - 1] === hyp[j - 1] ? 0 : 1),
      );
      prev = t;
    }
  }
  const cer = dp[hyp.length] / ref.length;
  manifest.qc = { transcript: stt.text, cer: round(cer) };
  console.log(`  распознано: ${stt.text}`);
  console.log(`  CER: ${(cer * 100).toFixed(1)}%`);
  if (cer > 0.15)
    warnings.push(
      `распознавание расходится с текстом (CER ${(cer * 100).toFixed(1)}%)`,
    );
} catch (e) {
  console.log(`  Speech-to-Text недоступен: ${e.message}`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
rmSync(TMP, { recursive: true, force: true });
console.log(`+ ${outPath}\n+ ${MANIFEST}`);
// Тайминги одной строкой — по ним можно повторить монтаж локально.
console.log("MANIFEST_JSON " + JSON.stringify({ ...manifest, qc: undefined }));

for (const w of warnings) console.warn(`  ⚠ ${w}`);
if (totalSec > TIMING.maxSec) {
  console.error(
    `✗ Озвучка длится ${lastEnd.toFixed(1)} с — ролик получится ${totalSec.toFixed(1)} с, ` +
      `больше ${TIMING.maxSec} с. Сократите текст NARRATION в src/config.ts (темп не ускоряем).`,
  );
  process.exit(1);
}
