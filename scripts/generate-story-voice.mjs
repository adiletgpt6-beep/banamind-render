// Озвучка седьмого ролика (BalaGoMorningStory): у каждого персонажа свой
// голос ElevenLabs, поэтому каждая реплика — отдельный файл.
//
// Для каждой реплики из src/morning-story/script.ts:
//   • хэш = текст + тег + голос + модель + настройки + seed;
//   • если файл с таким хэшем уже есть (public/audio/morning-story/) —
//     используется он, запроса к ElevenLabs НЕТ (кредиты не тратятся);
//   • иначе — синтез /with-timestamps (eleven_v3, ky) с «страховочной»
//     фразой в конце (вырезается), проверка полного окончания, обрезка
//     тишины, выравнивание громкости. Темп НЕ меняется.
// Затем по реальным длительностям строится монтаж (storyTimeline.ts) и
// записываются manifest.json (голоса, тексты, длительности, положение на
// шкале) и timeline.json (начала сцен и реплик).
//
// Нужна переменная ELEVENLABS_API_KEY (в GitHub — секрет репозитория);
// ключ не печатается. Без ключа и без сохранённых файлов ролик собирается
// по оценочным таймингам (без голоса).
// Запуск: npm run audio:voice:story
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  MS_LINES,
  MS_TTS,
  MS_VIDEO,
  MS_VOICES,
} from "../src/morning-story/script.ts";
import {
  buildStoryTimeline,
  timelineSummary,
} from "../src/morning-story/storyTimeline.ts";
import {
  SAMPLE_RATE as SR,
  decodeMono,
  ffmpeg,
  writeWav,
} from "./lib/audio.mjs";
import { lineHash } from "./lib/story-voice.mjs";

const OUT = join("public", MS_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const TIMELINE = join(OUT, "timeline.json");
const TMP = join(tmpdir(), "balago-voice-morning-story");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const apiBase =
  process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
// Только пересчитать монтаж по сохранённым файлам (без API).
const timelineOnly = process.argv.includes("--timeline-only");

const round = (x) => Number(x.toFixed(3));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);

mkdirSync(OUT, { recursive: true });
const previous = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : null;
const prevById = new Map((previous?.lines ?? []).map((l) => [l.id, l]));

// Голос роли: уже использованный в сохранённых репликах этой роли (чтобы
// роль звучала одинаково), иначе — первый доступный кандидат.
const roleVoice = new Map();
for (const p of previous?.lines ?? []) {
  if (!roleVoice.has(p.role) && p.voiceId) {
    const v = MS_VOICES[p.role]?.candidates.find((c) => c.voiceId === p.voiceId);
    if (v) roleVoice.set(p.role, v);
  }
}
const unavailable = new Set();
const pickVoice = (role) => {
  if (roleVoice.has(role)) return roleVoice.get(role);
  const taken = new Set([...roleVoice.values()].map((v) => v.voiceId));
  const v = MS_VOICES[role].candidates.find(
    (c) => !unavailable.has(c.voiceId) && !taken.has(c.voiceId),
  );
  if (!v) throw new Error(`Для роли «${role}» не осталось доступных голосов.`);
  return v;
};

const plan = MS_LINES.map((line) => {
  const prev = prevById.get(line.id);
  const reusable =
    prev?.file &&
    existsSync(join(OUT, prev.file)) &&
    roleVoice.get(line.role)?.voiceId === prev.voiceId &&
    prev.hash === lineHash(line, prev.voiceId);
  return { line, prev: reusable ? prev : null };
});
const missing = plan.filter((p) => !p.prev);

if (missing.length && (timelineOnly || !apiKey)) {
  if (!previous && !timelineOnly) {
    console.log(
      "ELEVENLABS_API_KEY не задан и озвучки нет — ролик соберётся по " +
        "оценочным таймингам, без голоса.",
    );
    process.exit(0);
  }
  throw new Error(
    `Нет актуальной озвучки для реплик: ${missing.map((p) => p.line.id).join(", ")}. ` +
      "Задайте ELEVENLABS_API_KEY и запустите npm run audio:voice:story.",
  );
}

const api = async (path, init) => {
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(
      `ElevenLabs ${res.status} (${path.split("?")[0]}): ${(await res.text()).slice(0, 400)}`,
    );
  }
  return res;
};

const rmsDb = (samples, from, to) => {
  let acc = 0;
  const a = Math.max(0, from);
  const b = Math.min(samples.length, to);
  for (let i = a; i < b; i++) acc += samples[i] * samples[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

// Синтез одной реплики. В конец добавляется короткая фраза PAD: eleven_v3
// иногда смазывает последнее слово дорожки; с продолжением договаривает его
// полностью. PAD вырезается по таймингам.
const PAD = "Рахмат.";
// padMode: "pad" — страховочная фраза сразу; "pause" — через многоточие
// (пауза); "none" — без неё.
const synthesize = async (line, voice, withTag, seed, padMode = "pad") => {
  const body = line.spoken ?? line.text;
  const withPad = padMode !== "none";
  const sep = padMode === "pause" ? " ... " : " ";
  const text = `${withTag && line.tag ? `${line.tag} ` : ""}${body}${withPad ? `${sep}${PAD}` : ""}`;
  console.log(
    `→ ${line.id} [${line.role}: ${voice.name}] seed ${seed}${withTag && line.tag ? `, тег ${line.tag}` : ""}: «${body}»`,
  );
  const data = await (
    await api(
      `/v1/text-to-speech/${voice.voiceId}/with-timestamps?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: MS_TTS.modelId,
          language_code: MS_TTS.languageCode,
          seed,
          voice_settings: MS_TTS.voiceSettings,
          apply_text_normalization: "auto",
        }),
      },
    )
  ).json();
  const al = data.alignment;
  if (!al?.characters?.length) throw new Error("Нет таймингов (alignment).");
  const starts = al.character_start_times_seconds;
  const ends = al.character_end_times_seconds;
  const aligned = al.characters.join("");
  const span = (from, needle) => {
    const i = aligned.indexOf(needle, from);
    if (i < 0) return null;
    let a = i;
    let b = i + needle.length - 1;
    while (a < b && !isLetter(aligned[a])) a++;
    while (b > a && !isLetter(aligned[b])) b--;
    return { a, b, next: i + needle.length };
  };
  const whole = span(0, body);
  if (!whole) throw new Error(`Реплика ${line.id} не найдена в таймингах.`);
  const words = [];
  let wc = aligned.indexOf(body);
  for (const w of line.text.split(/\s+/).filter(isLetter)) {
    // «BalaGo» в тексте озвучивается как «БалаГо»
    const sw = w.replace("BalaGo", "БалаГо");
    const r = span(wc, sw);
    if (!r) continue;
    words.push({ text: w, start: starts[r.a], end: ends[r.b] });
    wc = r.next;
  }
  const pad = withPad ? span(whole.next, PAD) : null;
  return {
    audio: Buffer.from(data.audio_base64, "base64"),
    start: starts[whole.a],
    end: ends[whole.b],
    padStart: pad ? starts[pad.a] : null,
    words,
  };
};

const generate = async (line, voice) => {
  const raw = join(TMP, `${line.id}-raw.mp3`);
  let useTag = Boolean(line.tag);
  // Попытки: страховочная фраза сразу, затем через паузу, затем без неё
  // (короткие реплики вроде «Саламатсызбы.» модель сливает со следующей).
  const attempts = [
    [0, "pad"],
    [1, "pad"],
    [0, "pause"],
    [1, "pause"],
    [0, "none"],
    [1, "none"],
  ];
  let best = null;
  for (let attempt = 0; attempt < attempts.length; attempt++) {
    const [ds, padMode] = attempts[attempt];
    const seed = MS_TTS.seed + ds;
    let res = await synthesize(line, voice, useTag, seed, padMode);
    // Тег прозвучал вслух → перед речью длинный «лишний» кусок.
    if (useTag && res.start > 0.9) {
      console.warn(
        `  ⚠ ${line.id}: речь начинается на ${res.start.toFixed(2)} с — тег, похоже, прозвучал; без тега`,
      );
      useTag = false;
      res = await synthesize(line, voice, false, seed, padMode);
    }
    writeFileSync(raw, res.audio);
    const pcm = decodeMono(raw);
    const withPad = padMode !== "none";
    const cutAt =
      withPad && res.padStart !== null
        ? Math.min(res.padStart - 0.04, res.end + 0.5)
        : pcm.length / SR;
    const cut = Math.min(pcm.length, Math.round(cutAt * SR));
    // со страховочной фразой — тишина 120 мс перед ней; без неё модель
    // заканчивает файл сразу после речи — смотрим последние 40 мс
    const win = withPad ? 0.12 : 0.04;
    const tail = rmsDb(pcm, cut - Math.round(win * SR), cut);
    const after = cutAt - res.end;
    const ok = withPad ? tail < -35 && after >= 0.08 : tail < -30 && after >= 0;
    const cand = { ...res, pcm: pcm.slice(0, cut), seed, usedTag: useTag, tail };
    if (ok) return cand;
    if (!best || tail < best.tail) best = cand;
    console.warn(
      `  ⚠ ${line.id}, попытка ${attempt + 1} (${padMode}): окончание не отделено тишиной (${tail.toFixed(1)} дБ, ${after.toFixed(2)} с)`,
    );
  }
  // Ни одна попытка не дала чистого окончания: берём самую тихую в конце
  // и мягко затухаем последние 60 мс (без обрезки слова по таймингам).
  console.warn(
    `  ⚠ ${line.id}: использую лучшую попытку (${best.tail.toFixed(1)} дБ в конце) с мягким затуханием`,
  );
  const f = Math.min(best.pcm.length, Math.round(0.06 * SR));
  for (let i = 0; i < f; i++) best.pcm[best.pcm.length - f + i] *= 1 - i / f;
  return best;
};

// Обрезка тишины по краям + выравнивание громкости реплик между собой
// (средний уровень речи −16.5 дБFS, пик ограничивается −2.5 дБFS — запас
// для итогового микса с музыкой: true peak ролика ≤ −1 дБTP).
const finish = (line, res, outPath) => {
  const { pcm } = res;
  const thr = Math.pow(10, -45 / 20);
  const win = Math.round(0.01 * SR);
  const loudAt = (i) => {
    let m = 0;
    for (let k = i; k < Math.min(pcm.length, i + win); k++)
      m = Math.max(m, Math.abs(pcm[k]));
    return m > thr;
  };
  let first = 0;
  while (first < pcm.length && !loudAt(first)) first += win;
  let last = pcm.length - win;
  while (last > first && !loudAt(last)) last -= win;
  // Начало: по первому звуку, но не раньше чем за 0,15 с до первого слова
  // по таймингам (вдох или прозвучавший тег не попадают в файл).
  const a = Math.max(
    0,
    Math.max(first, Math.round((res.start - 0.15) * SR)) -
      Math.round(0.05 * SR),
  );
  const b = Math.min(
    pcm.length,
    Math.max(last + win, Math.round(res.end * SR)) + Math.round(0.15 * SR),
  );
  const out = pcm.slice(a, b);
  const fi = Math.round(0.01 * SR);
  const fo = Math.round(0.03 * SR);
  for (let i = 0; i < Math.min(fi, out.length); i++) out[i] *= i / fi;
  for (let i = 0; i < Math.min(fo, out.length); i++)
    out[out.length - 1 - i] *= i / fo;
  // средняя мощность громких 50-мс блоков
  const blk = Math.round(0.05 * SR);
  let acc = 0;
  let cnt = 0;
  for (let i = 0; i + blk <= out.length; i += blk) {
    const db = rmsDb(out, i, i + blk);
    if (db > -40) {
      acc += Math.pow(10, db / 10);
      cnt++;
    }
  }
  const speechDb = cnt ? 10 * Math.log10(acc / cnt) : -30;
  const gainDb = -16.5 - speechDb;
  const wav = join(TMP, `${line.id}.wav`);
  writeWav(wav, [out]);
  ffmpeg([
    "-i",
    wav,
    "-af",
    `volume=${gainDb.toFixed(2)}dB,alimiter=limit=0.75:attack=3:release=60:level=disabled`,
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
  const shift = a / SR;
  return {
    speechStart: round(Math.max(0, res.start - shift)),
    speechEnd: round(res.end - shift),
    words: res.words.map((w) => ({
      text: w.text,
      start: round(Math.max(0, w.start - shift)),
      end: round(w.end - shift),
    })),
    gainDb: round(gainDb),
  };
};

mkdirSync(TMP, { recursive: true });
const lines = [];
let generated = 0;
for (const { line, prev } of plan) {
  if (prev) {
    lines.push({ ...prev, scene: line.scene });
    continue;
  }
  // голос роли; если ElevenLabs его не находит — следующий кандидат
  let voice;
  let res;
  for (;;) {
    voice = pickVoice(line.role);
    try {
      res = await generate(line, voice);
      break;
    } catch (e) {
      if (/voice_not_found/.test(String(e.message))) {
        console.warn(`  ⚠ голос ${voice.name} (${voice.voiceId}) недоступен — беру следующий для роли ${line.role}`);
        unavailable.add(voice.voiceId);
        continue;
      }
      throw e;
    }
  }
  roleVoice.set(line.role, voice);
  const hash = lineHash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const outPath = join(OUT, file);
  const fin = finish(line, res, outPath);
  const final = decodeMono(outPath);
  let peak = 0;
  for (const v of final) peak = Math.max(peak, Math.abs(v));
  const durationSec = round(final.length / SR);
  console.log(
    `  ✓ ${file}: ${durationSec.toFixed(2)} с, речь ${fin.speechStart.toFixed(2)}–${fin.speechEnd.toFixed(2)} с, ` +
      `усиление ${fin.gainDb} дБ, пик ${(20 * Math.log10(peak || 1e-9)).toFixed(1)} дБFS` +
      (res.usedTag ? "" : line.tag ? " (без тега)" : ""),
  );
  generated++;
  lines.push({
    id: line.id,
    scene: line.scene,
    role: line.role,
    character: MS_VOICES[line.role].role,
    text: line.text,
    spoken: `${res.usedTag && line.tag ? `${line.tag} ` : ""}${line.spoken ?? line.text}`,
    voiceName: voice.name,
    voiceId: voice.voiceId,
    modelId: MS_TTS.modelId,
    voiceSettings: MS_TTS.voiceSettings,
    seed: res.seed,
    hash,
    file,
    durationSec,
    speechStart: fin.speechStart,
    speechEnd: fin.speechEnd,
    words: fin.words,
  });
  // промежуточное сохранение: при сбое на следующей реплике готовые не теряются
  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        version: 1,
        kind: "story",
        video: MS_VIDEO.id,
        partial: true,
        lines: [
          ...lines,
          ...[...prevById.values()].filter(
            (p) => !lines.some((l) => l.id === p.id),
          ),
        ],
      },
      null,
      2,
    ) + "\n",
  );
}

// Сначала сохраняем озвучку (оплаченные файлы не теряются, даже если
// монтаж ниже не собрался), затем — положение реплик на шкале.
const base = { version: 1, kind: "story", video: MS_VIDEO.id, lines };
writeFileSync(MANIFEST, JSON.stringify(base, null, 2) + "\n");
rmSync(TMP, { recursive: true, force: true });
let summary;
try {
  summary = timelineSummary(buildStoryTimeline(base, MS_VIDEO.fps));
} catch (e) {
  console.error(`✗ Монтаж не собирается: ${e.message}`);
  process.exit(1);
}
const byId = new Map(summary.lines.map((l) => [l.id, l]));
const manifest = {
  ...base,
  lines: lines.map((l) => ({
    ...l,
    timelineStartSec: byId.get(l.id).speechStartSec,
    timelineEndSec: byId.get(l.id).speechEndSec,
  })),
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(TIMELINE, JSON.stringify(summary, null, 2) + "\n");

console.log(
  `Реплик: ${lines.length} (новых: ${generated}, из сохранённых: ${lines.length - generated})`,
);
console.log(
  `Ролик: ${summary.durationSec.toFixed(2)} с, речь заканчивается на ${summary.speechEndSec.toFixed(2)} с, ` +
    `финальный экран ${summary.ctaHoldSec.toFixed(2)} с`,
);
for (const s of summary.scenes)
  console.log(`  ${s.id.padEnd(11)} ${s.startSec.toFixed(2)}–${s.endSec.toFixed(2)} с`);
if (summary.durationSec < 170 || summary.durationSec > 190)
  console.warn(
    `  ⚠ длина ${summary.durationSec.toFixed(1)} с вне ориентира 175–185 с — поправьте паузы/minSec в script.ts`,
  );
console.log(`+ ${MANIFEST}\n+ ${TIMELINE}`);
