// Озвучка банана фильма BM-037 — по файлу на реплику, public/lesson-collins/voice/<id>.mp3.
//
// • Основной движок — ElevenLabs (рабочий TTS проекта, ключ в секретах CI):
//   один и тот же голос на весь урок, тайминги букв → слова (субтитры) и буквы
//   (рот). Соседние реплики передаются как previous_text/next_text — интонация
//   связная. Темп речи не ускоряется.
// • Резерв — локальный движок (VOICE_ENGINE=local): Piper ru_RU через sherpa-onnx и
//   распознавание zipformer-ru для таймкодов слов (scripts/lesson-collins/tts_local.py,
//   align.mjs). Числа произносятся по src/lesson-collins/say.ts. Тот же кэш по хэшу:
//   при смене движка все реплики синтезируются заново.
// • Громкость каждой реплики выравнивается к −18 LUFS, края — 12 мс fade,
//   после последнего слова минимум 0.25 с тишины.
// • Кэш: реплика с тем же хэшем (текст, движок, голос, настройки) повторно не
//   синтезируется.
//
// Запуск: ELEVENLABS_API_KEY=… node scripts/lesson-collins/voice.mjs
//         VOICE_ENGINE=local PIPER_MODEL=/path/vits-piper-ru_RU-ruslan-medium ASR_MODEL=/path/sherpa-onnx-zipformer-ru-2024-09-18 node …
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SAY } from "../../src/lesson-collins/say.ts";
import { SCENES, VOICE } from "../../src/lesson-collins/script.ts";
import { spokenTimes, textWords } from "./align.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = "public/lesson-collins/voice";
const MANIFEST = join(OUT, "manifest.json");
const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
const ENGINE = process.env.VOICE_ENGINE ?? "elevenlabs";
const TMP = join(tmpdir(), "lesson-collins-voice");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const lines = SCENES.flatMap((s) => s.lines);
// VOICE_ONLY=pilot — только реплики пилотных сцен (бюджет: голос и титры проверяются до полного синтеза)
export const PILOT_SCENES = SCENES.filter((s) => s.pilot).map((s) => s.id);
const ONLY = process.env.VOICE_ONLY === "pilot" ? new Set(SCENES.filter((s) => s.pilot).flatMap((s) => s.lines.map((l) => l.id))) : null;
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const LOCAL = ENGINE === "local";
const voiceId = LOCAL ? `local:${(process.env.PIPER_MODEL ?? "").split("/").pop()}+${(process.env.ASR_MODEL ?? "").split("/").pop()}` : VOICE.voiceId;
const settingsOf = (ln) => (ln.expr ? { ...VOICE.settings, ...VOICE.expressive } : VOICE.settings);
// ударения в именах — только для синтеза (титры остаются без знаков ударения);
// реплики без этих имён сохраняют прежний хэш и не синтезируются заново
const STRESS = [
  [/Коллинз/g, "Ко́ллинз"],
  [/Миихан/g, "Ми́ихан"],
  [/Мак-Кинзи/g, "Мак-Ки́нзи"],
  [/Форчун/g, "Фо́рчун"],
  [/Кимберли/g, "Ки́мберли"],
  [/Моклер/g, "Мо́клер"],
  [/Жиллетт/g, "Жилле́тт"],
  [/Уолгрин/g, "Уо́лгрин"],
  [/Экерд/g, "Э́керд"],
  [/Крогер/g, "Кро́гер"],
  [/Ньюкор/g, "Нью́кор"],
  [/Фанни Мэй/g, "Фа́нни Мэй"],
  [/Вуртзел/g, "Ву́ртзел"],
  [/Серкит Сити/g, "Се́ркит Си́ти"],
  [/Сайло/g, "Са́йло"],
  [/Питни Боуз/g, "Пи́тни Бо́уз"],
  [/Эдрессограф/g, "Эдре́ссограф"],
  [/Эбботт/g, "Э́бботт"],
  [/Апджон/g, "А́пджон"],
  [/Уэллс Фарго/g, "Уэ́ллс Фа́рго"],
  [/Кули/g, "Ку́ли"],
  [/Максвелл/g, "Ма́ксвелл"],
  [/Синглтон/g, "Си́нглтон"],
  [/Теледайн/g, "Теледа́йн"],
  [/Стокдейл/g, "Сто́кдейл"],
  [/Армакост/g, "Армако́ст"],
  [/Грейт Вестерн/g, "Грейт Ве́стерн"],
  [/Черчилль/g, "Че́рчилль"],
  [/Берроуз/g, "Бе́рроуз"],
  [/Макдональд/g, "Макдо́нальд"],
  [/Раббермейд/g, "Ра́ббермейд"],
  [/Голт/g, "Го́лт"],
  [/Якокк/g, "Яко́кк"],
  [/Крайслер/g, "Кра́йслер"],
  [/Бетлехем/g, "Бе́тлехем"],
  [/Уорнер-Ламберт/g, "Уо́рнер-Ла́мберт"],
  [/Пфайзер/g, "Пфа́йзер"],
  [/Паккард/g, "Па́ккард"],
  [/Дженерал Электрик/g, "Дже́нерал Эле́ктрик"],
  [/Интел/g, "И́нтел"],
];
const stressed = (text) => STRESS.reduce((t, [re, to]) => t.replace(re, to), text);
const sayOf = (ln) => ln.say ?? (stressed(ln.text) !== ln.text ? stressed(ln.text) : null);
const hashOf = (ln) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 2, engine: ENGINE, text: ln.text, say: sayOf(ln), voice: voiceId, model: VOICE.modelId, settings: settingsOf(ln), seed: VOICE.seed }))
    .digest("hex")
    .slice(0, 16);
const spoken = (ln) => (LOCAL ? SAY[ln.id] ?? ln.text : sayOf(ln) ?? ln.text);

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
const wordsFromAlignment = (text, chars0, starts0, ends0) => {
  // знаки ударения (U+0301) из произношения убираются, тайминги букв сохраняются
  const keep = chars0.map((c, i) => (c === "\u0301" ? -1 : i)).filter((i) => i >= 0);
  const chars = keep.map((i) => chars0[i]);
  const starts = keep.map((i) => starts0[i]);
  const ends = keep.map((i) => ends0[i]);
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
const todo = lines.filter((ln) => (!ONLY || ONLY.has(ln.id)) && !(prevById.get(ln.id)?.hash === hashOf(ln) && existsSync(join(OUT, `${ln.id}.mp3`))));
if (LOCAL && todo.length) {
  const jobs = todo.map((ln) => ({ id: ln.id, text: spoken(ln), out: join(TMP, `${ln.id}-raw.wav`) }));
  writeFileSync(join(TMP, "jobs.json"), JSON.stringify(jobs));
  execFileSync(process.env.PIPER_PY ?? "python3", ["-I", join(HERE, "tts_local.py"), process.env.PIPER_MODEL, process.env.ASR_MODEL, join(TMP, "jobs.json"), process.env.PIPER_LENGTH ?? "1.05"], { stdio: "inherit" });
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
  if (ONLY && !ONLY.has(ln.id)) continue; // пилот: остальные реплики позже
  let raw;
  let words = null;
  let chars = [];
  if (LOCAL) {
    raw = join(TMP, `${ln.id}-raw.wav`);
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
      if (!ln.say) words = wordsFromAlignment(ln.text, al.characters, st, en);
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
  let align = null;
  if (LOCAL) {
    // реальные таймкоды: распознанные слова локальной озвучки → слова произношения → слова титров
    const asr = JSON.parse(readFileSync(`${raw}.asr.json`, "utf8"));
    const sw = spokenTimes(spoken(ln), asr, speechStart, speechEnd, env0);
    words = textWords(ln.text, sw);
    align = { matched: sw.filter((w) => w.matched).length, total: sw.length, asr: asr.text };
  }
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
    words, chars, env: envelope(join(OUT, file)), ...(align ? { align } : {}),
  });
  made++;
  if (made % 10 === 0) writeFileSync(MANIFEST, JSON.stringify({ version: 1, engine: ENGINE, voice: voiceId, lines: result }));
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, engine: ENGINE, voice: voiceId, lines: result }));
const speech = result.reduce((a, l) => a + l.speechEnd - l.speechStart, 0);
console.log(`Озвучка: ${result.length} реплик (новых ${made}), речь ${(speech / 60).toFixed(1)} мин, движок ${ENGINE}.`);
