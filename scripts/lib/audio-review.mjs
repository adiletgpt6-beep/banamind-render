// Движок проверки настоящего звука готового ролика (MP4/WAV/MP3).
//
// Что делает:
//   1. FFprobe — проверяет файл и наличие аудиодорожки.
//   2. FFmpeg — вырезает выбранный диапазон в PCM16 WAV без нормализации,
//      меряет исходный микс (ebur128 + true peak, astats) и строит профиль
//      громкости. Это числа, не оценки модели.
//   3. Режет диапазон на фрагменты ~20 с с перекрытием ~2 с без пропусков.
//   4. Каждый фрагмент в base64 уходит как input_audio в Chat Completions
//      (gpt-audio-1.5, только текстовый ответ, store: false) с НЕЙТРАЛЬНЫМ
//      заданием: распознать речь по звуку и оценить слышимое. Сценарий,
//      ожидаемые реплики, роли и таймкоды модели не передаются никогда.
//   5. Ответ — JSON обычным текстом; проверяется своим парсером, исходный
//      текст сохраняется. Ошибка разбора и усечённый ответ видны в отчёте.
//   6. --context используется только локально, после ответа модели:
//      сравнение расшифровки со сценарием считает код
//      (audio-review-compare.mjs).
//   7. Время: подтверждён только фрагмент, который вырезал FFmpeg. Время
//      модели хранится отдельно как непроверенное. Более узкая привязка —
//      только по проверенному размещению файлов голоса в композиции.
//
// Режимы доступа:
//   claude_proxy — запрос через curl без Authorization: заголовок подставляет
//                  прокси облачной среды Claude Code; ключ в среде не нужен.
//   key          — OPENAI_API_KEY из окружения (локальный/серверный запуск).
// Секреты, заголовки авторизации и окружение никуда не выводятся.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  createReadStream,
} from "node:fs";
import { join } from "node:path";
import { compareLines, normalizeText } from "./audio-review-compare.mjs";

export const API_URL = "https://api.openai.com/v1/chat/completions";
export const DEFAULT_MODEL = "gpt-audio-1.5";
// v2: слепое прослушивание (без сценария), null в оценках, привязка к речи.
export const PROMPT_VERSION = "audio-review-v2-blind";
export const REPORT_FORMAT_VERSION = 2;
export const CACHE_FORMAT = 2;
export const DEFAULTS = {
  chunkSec: 20,
  overlapSec: 2,
  maxTokens: 2500,
  timeoutSec: 180,
  maxAttempts: 3,
  // Время модели ближе этого к искусственному краю — пометка «возможно,
  // артефакт нарезки». Только пометка: замечание не удаляется.
  boundaryGuardSec: 0.75,
  // Допуск при проверке времени модели на выход за фрагмент.
  timeToleranceSec: 0.05,
};
export const AUTH_MODES = ["claude_proxy", "key"];
export const CONFIDENCE = ["high", "medium", "low"];
export const SEVERITY = ["critical", "major", "minor"];
export const SCORE_KEYS = [
  "intelligibility",
  "word_endings",
  "pace",
  "timbre",
  "intonation_naturalness",
  "emotionality",
  "mix_balance",
  "sfx_naturalness",
];

// Нейтральное задание аудиомодели. Никаких ожидаемых реплик и таймкодов.
// Меняете текст — поднимайте PROMPT_VERSION (от него зависит кэш).
export const TASK_TEXT =
  "Прослушай фрагмент звука кыргызского рекламного ролика. " +
  "Сначала распознай всю речь только по звуку: записывай кириллицей ровно то, что слышно, " +
  "не исправляй по смыслу, не достраивай и не угадывай. Неразборчивое помечай [неразборчиво], " +
  "сомнительные слова — certainty low. Если речи нет, верни пустой heard_transcript. " +
  "Затем оцени слышимый звук: разборчивость, окончания слов, темп, тембр, естественность " +
  "интонации и умеренную эмоциональность; обрезанные фразы, наложение голосов, музыку поверх " +
  "речи, перепады громкости, неестественные и повторяющиеся звуки шагов, дверей, ключей, сумки " +
  "и ремня. Оценки кыргызского произношения могут быть ошибочными — отмечай неуверенные места " +
  "и необходимость проверки человеком. Для каждой проблемы дай примерное время, наблюдение, " +
  "предполагаемую причину, уверенность high/medium/low, серьёзность, конкретное исправление и " +
  "номер фрагмента речи из heard_transcript, к которому она относится (null, если не к речи). " +
  "Если какого-то звука не слышно или оценить его нельзя (например, шагов или эффектов нет), " +
  "ставь null и коротко поясни в score_notes — не ставь высокую оценку по умолчанию. " +
  "Не делай выводов о движении губ или изображении: тебе передан только звук.";

export const RESPONSE_FORMAT = `Ответь ОДНИМ JSON-объектом без markdown и без текста вокруг него.
Все времена — секунды от начала ЭТОГО фрагмента (0 = начало фрагмента); если не уверен во времени, всё равно дай оценку, она будет помечена как приблизительная.
Пояснения пиши по-русски, распознанную речь — как услышана (кириллицей).
{
  "heard_transcript": [{"t_start": 0.0, "t_end": 0.0, "speaker_guess": "мужской/женский/детский голос или null", "text": "только реально услышанное; неразборчивое — [неразборчиво]", "certainty": "high|medium|low"}],
  "scores": {"intelligibility": null, "word_endings": null, "pace": null, "timbre": null, "intonation_naturalness": null, "emotionality": null, "mix_balance": null, "sfx_naturalness": null},
  "score_notes": {"sfx_naturalness": "почему null или на чём основана оценка"},
  "issues": [{"heard_segment": 0, "t_start": 0.0, "t_end": 0.0, "category": "intelligibility|word_ending|pace|timbre|intonation|emotion|cut_phrase|voice_overlap|music_over_speech|loudness_jump|sfx_unnatural|sfx_repetitive|noise|other", "observation": "что слышно", "likely_cause": "предполагаемая причина", "confidence": "high|medium|low", "severity": "critical|major|minor", "fix": "конкретное исправление", "needs_human_check": true}],
  "uncertain_segments": [{"t_start": 0.0, "t_end": 0.0, "reason": "почему не уверен"}],
  "summary": "2–4 предложения о слышимом звуке"
}
heard_segment — номер элемента heard_transcript (с 0) или null.
Оценки scores — целые 1–5 (5 — отлично) или null, если оценить нельзя.
Если проблем нет, верни "issues": [] — но не утверждай того, чего не слышно.`;

export const sha256 = (data) => createHash("sha256").update(data).digest("hex");

export const sha256File = (path) =>
  new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(path)
      .on("data", (d) => h.update(d))
      .on("error", reject)
      .on("end", () => resolve(h.digest("hex")));
  });

// Убирает из строки всё, похожее на ключ API или заголовок авторизации.
export const redact = (text) =>
  String(text ?? "")
    .replace(/sk-[A-Za-z0-9_*.-]{6,}/g, "sk-***")
    .replace(/(authorization\s*[:=]\s*)(bearer\s+)?\S+/gi, "$1***")
    .replace(/bearer\s+[A-Za-z0-9_.-]{8,}/gi, "Bearer ***");

const round = (x, d = 3) => (Number.isFinite(x) ? Number(x.toFixed(d)) : x);

// ── Аргументы CLI ────────────────────────────────────────────────────────

export class ArgError extends Error {}

const num = (name, value, { min = 0, positive = false } = {}) => {
  const n = Number(value);
  if (value === undefined || value === "" || !Number.isFinite(n))
    throw new ArgError(`${name}: ожидается число, получено «${value ?? ""}»`);
  if (positive ? n <= 0 : n < min)
    throw new ArgError(
      `${name}: ${positive ? "должно быть больше 0" : `не меньше ${min}`}`,
    );
  return n;
};

export const parseArgs = (argv, env = {}) => {
  const o = {
    input: null,
    out: null,
    context: null,
    start: 0,
    duration: null,
    dryRun: false,
    model: DEFAULT_MODEL,
    auth: env.AUDIO_QA_AUTH_MODE || "key",
    chunkSec: DEFAULTS.chunkSec,
    overlapSec: DEFAULTS.overlapSec,
    maxTokens: DEFAULTS.maxTokens,
    timeoutSec: DEFAULTS.timeoutSec,
    maxAttempts: DEFAULTS.maxAttempts,
    cache: true,
    cacheDir: null,
    help: false,
  };
  const valueOf = (i, flag) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--"))
      throw new ArgError(`${flag}: нет значения`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    const [flag, inline] = raw.includes("=")
      ? raw.split(/=(.*)/s, 2)
      : [raw, undefined];
    const take = () => (inline !== undefined ? inline : valueOf(i++, flag));
    switch (flag) {
      case "--input":
        o.input = take();
        break;
      case "--out":
        o.out = take();
        break;
      case "--context":
        o.context = take();
        break;
      case "--start":
        o.start = num("--start", take());
        break;
      case "--duration":
        o.duration = num("--duration", take(), { positive: true });
        break;
      case "--dry-run":
        o.dryRun = true;
        break;
      case "--model":
        o.model = take();
        break;
      case "--auth":
        o.auth = take();
        break;
      case "--chunk":
        o.chunkSec = num("--chunk", take(), { positive: true });
        break;
      case "--overlap":
        o.overlapSec = num("--overlap", take());
        break;
      case "--max-tokens":
        o.maxTokens = Math.round(
          num("--max-tokens", take(), { positive: true }),
        );
        break;
      case "--timeout":
        o.timeoutSec = num("--timeout", take(), { positive: true });
        break;
      case "--max-attempts":
        o.maxAttempts = Math.round(
          num("--max-attempts", take(), { positive: true }),
        );
        break;
      case "--cache-dir":
        o.cacheDir = take();
        break;
      case "--no-cache":
        o.cache = false;
        break;
      case "-h":
      case "--help":
        o.help = true;
        break;
      default:
        throw new ArgError(`неизвестный аргумент: ${raw}`);
    }
  }
  if (o.help) return o;
  if (!o.input) throw new ArgError("нужен --input <MP4/WAV/MP3>");
  if (!AUTH_MODES.includes(o.auth))
    throw new ArgError(
      `--auth / AUDIO_QA_AUTH_MODE: ${AUTH_MODES.join(" или ")}, получено «${o.auth}»`,
    );
  // Анализ делает только аудиомодель: текстовую модель подставить нельзя.
  if (!/audio/i.test(o.model))
    throw new ArgError(
      `--model: нужна аудиомодель (например ${DEFAULT_MODEL}), получено «${o.model}»`,
    );
  if (o.overlapSec >= o.chunkSec)
    throw new ArgError("--overlap должно быть меньше --chunk");
  if (o.maxAttempts > 5) throw new ArgError("--max-attempts: не больше 5");
  return o;
};

// ── Нарезка диапазона ────────────────────────────────────────────────────

// Равные фрагменты не длиннее chunkSec с перекрытием overlapSec, без пропусков.
export const planChunks = (
  start,
  end,
  { chunkSec = DEFAULTS.chunkSec, overlapSec = DEFAULTS.overlapSec } = {},
) => {
  const total = end - start;
  if (!(total > 0)) throw new Error("пустой диапазон");
  if (total <= chunkSec)
    return [
      {
        index: 0,
        start: round(start),
        end: round(end),
        duration: round(total),
      },
    ];
  const step = chunkSec - overlapSec;
  const n = Math.ceil((total - overlapSec) / step);
  const len = (total + (n - 1) * overlapSec) / n;
  const stride = len - overlapSec;
  const chunks = [];
  for (let i = 0; i < n; i++) {
    const s = start + i * stride;
    const e = i === n - 1 ? end : s + len;
    chunks.push({
      index: i,
      start: round(s),
      end: round(e),
      duration: round(e - s),
    });
  }
  return chunks;
};

// Возвращает непокрытые промежутки; пустой массив — покрытие полное.
export const coverageGaps = (chunks, start, end, eps = 1e-3) => {
  const sorted = [...chunks].sort((a, b) => a.start - b.start);
  const gaps = [];
  let cursor = start;
  for (const c of sorted) {
    if (c.start > cursor + eps)
      gaps.push({ start: round(cursor), end: round(c.start) });
    cursor = Math.max(cursor, c.end);
  }
  if (cursor < end - eps) gaps.push({ start: round(cursor), end: round(end) });
  return gaps;
};

// ── FFprobe / FFmpeg ─────────────────────────────────────────────────────

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, {
    maxBuffer: 1024 * 1024 * 64,
    encoding: "utf8",
  });
  if (r.error) throw new Error(`${cmd} не запускается: ${r.error.message}`);
  return r;
};

export const probeMedia = (path) => {
  if (!existsSync(path)) throw new Error(`файл не найден: ${path}`);
  const r = run("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    path,
  ]);
  if (r.status !== 0)
    throw new Error(`ffprobe не читает файл: ${r.stderr.trim().slice(0, 400)}`);
  const info = JSON.parse(r.stdout);
  const audio = (info.streams ?? []).filter((s) => s.codec_type === "audio");
  const video = (info.streams ?? []).filter((s) => s.codec_type === "video");
  const duration = Number(info.format?.duration ?? audio[0]?.duration);
  return {
    format: info.format?.format_name ?? null,
    duration_sec: Number.isFinite(duration) ? round(duration) : null,
    size_bytes: Number(info.format?.size) || null,
    bit_rate: Number(info.format?.bit_rate) || null,
    audio_streams: audio.map((s) => ({
      index: s.index,
      codec: s.codec_name,
      sample_rate: Number(s.sample_rate),
      channels: s.channels,
      channel_layout: s.channel_layout ?? null,
      bit_rate: Number(s.bit_rate) || null,
      duration_sec: Number(s.duration) ? round(Number(s.duration)) : null,
    })),
    video_streams: video.map((s) => ({
      index: s.index,
      codec: s.codec_name,
      width: s.width,
      height: s.height,
      fps: s.r_frame_rate,
    })),
  };
};

// Первая аудиодорожка → PCM16 WAV с исходной частотой и числом каналов.
// Никакой нормализации, фильтров громкости и пересэмплирования.
export const extractWav = (input, outPath, start, duration) => {
  const r = run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(start),
    "-t",
    String(duration),
    "-i",
    input,
    "-map",
    "0:a:0",
    "-vn",
    "-sn",
    "-dn",
    "-c:a",
    "pcm_s16le",
    "-f",
    "wav",
    outPath,
  ]);
  if (r.status !== 0)
    throw new Error(`ffmpeg не извлёк звук: ${r.stderr.trim().slice(0, 400)}`);
  return outPath;
};

// Длительность WAV по заголовку (data / byte rate) — фактический отрезок.
export const wavDuration = (buf) => {
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF") return null;
  let off = 12;
  let byteRate = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") byteRate = buf.readUInt32LE(off + 16);
    if (id === "data")
      return byteRate
        ? round(Math.min(size, buf.length - off - 8) / byteRate)
        : null;
    off += 8 + size + (size % 2);
  }
  return null;
};

const parseEbur128 = (text) => {
  const i = text.lastIndexOf("Summary:");
  const s = i >= 0 ? text.slice(i) : "";
  const pick = (re) => {
    const m = s.match(re);
    if (!m) return null;
    return m[1] === "-inf" ? -Infinity : Number(m[1]);
  };
  const fin = (x) => (x === -Infinity ? null : x);
  return {
    integrated_lufs: fin(pick(/I:\s+(-?[\d.]+|-inf)\s+LUFS/)),
    loudness_range_lu: fin(pick(/LRA:\s+(-?[\d.]+|-inf)\s+LU\b/)),
    lra_low_lufs: fin(pick(/LRA low:\s+(-?[\d.]+|-inf)/)),
    lra_high_lufs: fin(pick(/LRA high:\s+(-?[\d.]+|-inf)/)),
    true_peak_dbtp: fin(pick(/True peak:\s+Peak:\s+(-?[\d.]+|-inf)/)),
  };
};

const parseAstats = (text) => {
  const overall = text.slice(text.lastIndexOf("Overall"));
  const pick = (re) => {
    const m = overall.match(re);
    return m ? (m[1] === "-inf" ? null : round(Number(m[1]), 2)) : null;
  };
  return {
    sample_peak_dbfs: pick(/Peak level dB:\s+(-?[\d.]+|-inf)/),
    rms_dbfs: pick(/RMS level dB:\s+(-?[\d.]+|-inf)/),
    dc_offset: pick(/DC offset:\s+(-?[\d.]+)/),
    // Flat factor > 0 — подряд идущие пиковые отсчёты (признак клиппинга).
    flat_factor: pick(/Flat factor:\s+(-?[\d.]+)/),
    noise_floor_dbfs: pick(/Noise floor dB:\s+(-?[\d.]+|-inf)/),
  };
};

// Числовые измерения исходного стереомикса (без изменений сигнала).
export const measureLoudness = (wavPath) => {
  const r = run("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    wavPath,
    "-filter_complex",
    "ebur128=peak=true+sample,astats=measure_perchannel=none",
    "-f",
    "null",
    "-",
  ]);
  if (r.status !== 0)
    throw new Error(
      `ffmpeg ebur128 не сработал: ${r.stderr.trim().slice(-400)}`,
    );
  return { ...parseEbur128(r.stderr), ...parseAstats(r.stderr) };
};

// Профиль RMS окнами windowSec (время — от начала WAV).
export const loudnessProfile = (wavPath, sampleRate, windowSec = 0.25) => {
  const n = Math.max(1, Math.round(sampleRate * windowSec));
  const r = run("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    wavPath,
    "-af",
    `asetnsamples=n=${n}:p=0,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level`,
    "-f",
    "null",
    "-",
  ]);
  if (r.status !== 0) return [];
  const out = [];
  let t = null;
  for (const line of r.stderr.split("\n")) {
    const pt = line.match(/pts_time:([\d.]+)/);
    if (pt) t = Number(pt[1]);
    const v = line.match(/RMS_level=(-?[\d.]+|-inf)/);
    if (v && t !== null)
      out.push({
        t: round(t, 3),
        rms_db: v[1] === "-inf" ? -120 : round(Number(v[1]), 1),
      });
  }
  return out;
};

// Ориентиры для РУЧНОЙ проверки: тихие участки и резкие подъёмы громкости
// микса. В миксе есть музыка и эффекты — ориентиры не определяют текст,
// говорящего и даже наличие речи; к репликам автоматически не привязываются.
export const loudnessLandmarks = (profile, offset, windowSec = 0.25) => {
  if (!profile.length) return [];
  const sorted = profile.map((p) => p.rms_db).sort((a, b) => a - b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const quietBelow = p90 - 20;
  const marks = [];
  let qs = null;
  profile.forEach((p, i) => {
    if (p.rms_db < quietBelow) qs ??= p.t;
    else if (qs !== null) {
      if (p.t - qs >= 0.5)
        marks.push({
          type: "quiet",
          start: round(offset + qs, 2),
          end: round(offset + p.t, 2),
        });
      qs = null;
    }
    if (i > 0 && p.rms_db - profile[i - 1].rms_db >= 10 && p.rms_db > p90 - 15)
      marks.push({
        type: "rise",
        at: round(offset + p.t, 2),
        delta_db: round(p.rms_db - profile[i - 1].rms_db, 1),
      });
  });
  const last = profile.at(-1);
  if (qs !== null && last.t + windowSec - qs >= 0.5)
    marks.push({
      type: "quiet",
      start: round(offset + qs, 2),
      end: round(offset + last.t + windowSec, 2),
    });
  return marks;
};

// ── Сценарий (только локально) ───────────────────────────────────────────

// Понимает {lines:[{id, role, text|spoken, plan_at|at|start, placement?}]}
// и {expected_text:"..."}. В запрос к модели контекст не попадает никогда.
export const loadContext = (path) => {
  if (!path) return null;
  const raw = readFileSync(path, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new ArgError(`--context: файл не является JSON (${e.message})`);
  }
  const fin = (v) =>
    v === null || v === undefined || v === ""
      ? null
      : Number.isFinite(Number(v))
        ? Number(v)
        : null;
  let lines = null;
  if (Array.isArray(data?.lines))
    lines = data.lines
      .map((l, i) => {
        const p = l.placement;
        const placement =
          p &&
          fin(p.file_from) !== null &&
          fin(p.file_to) !== null &&
          fin(p.file_to) > fin(p.file_from)
            ? {
                file: p.file ?? null,
                file_sha256: p.file_sha256 ?? null,
                file_from: fin(p.file_from),
                file_to: fin(p.file_to),
                speech_from: fin(p.speech_from),
                speech_to: fin(p.speech_to),
              }
            : null;
        return {
          order: i,
          id: l.id ?? `line-${i + 1}`,
          role: l.role ?? null,
          text: String(l.text ?? l.spoken ?? ""),
          plan_at: fin(l.plan_at ?? l.at ?? l.start),
          placement,
        };
      })
      .filter((l) => l.text.trim());
  else if (typeof data?.expected_text === "string")
    lines = [
      {
        order: 0,
        id: "expected",
        role: null,
        text: data.expected_text,
        plan_at: null,
        placement: null,
      },
    ];
  else
    throw new ArgError('--context: нужен {lines:[…]} или {expected_text:"…"}');
  return {
    path,
    sha256: sha256(raw),
    kind: data.kind ?? null,
    placement_basis: data.placement_basis ?? null,
    caveat: data.caveat ?? null,
    lines,
  };
};

// Какие реплики сравнивать с фрагментом и на чём основан выбор.
// placement — проверенное размещение файла; plan_time — плановое время
// (только выбор, не привязка); no_time — только если фрагмент один и
// покрывает весь файл.
export const linesForChunk = (
  ctx,
  chunk,
  { singleWholeFile = false, slackSec = 1.5 } = {},
) => {
  const out = [];
  for (const l of ctx.lines) {
    if (l.placement) {
      const a = l.placement.speech_from ?? l.placement.file_from;
      const b = l.placement.speech_to ?? l.placement.file_to;
      if (b <= chunk.start || a >= chunk.end) continue;
      const inside = a >= chunk.start - 1e-3 && b <= chunk.end + 1e-3;
      out.push({
        ...l,
        basis: "placement",
        boundary: !inside,
        boundary_reason: inside
          ? null
          : "реплика (по размещению файла) выходит за проверенный фрагмент",
      });
    } else if (l.plan_at !== null) {
      if (
        l.plan_at < chunk.start - slackSec ||
        l.plan_at > chunk.end + slackSec
      )
        continue;
      const nearEdge =
        l.plan_at < chunk.start + slackSec || l.plan_at > chunk.end - 3;
      out.push({
        ...l,
        basis: "plan_time",
        boundary: nearEdge,
        boundary_reason: nearEdge
          ? "по плановому времени реплика может быть обрезана краем фрагмента"
          : null,
      });
    } else if (singleWholeFile) {
      out.push({
        ...l,
        basis: "no_time",
        boundary: false,
        boundary_reason: null,
      });
    }
  }
  return out;
};

// Защита: текст сценария не должен оказаться в теле запроса к модели.
export const assertNoContextLeak = (body, ctx) => {
  if (!ctx) return;
  const text = normalizeText(
    JSON.stringify(
      body.messages.map((m) => m.content.filter((c) => c.type === "text")),
    ),
  );
  for (const l of ctx.lines) {
    const t = normalizeText(l.text);
    if (t.length >= 8 && text.includes(t))
      throw new Error(
        `внутренняя ошибка: текст реплики ${l.id} попал в запрос к модели`,
      );
  }
};

// ── Запрос к аудиомодели ─────────────────────────────────────────────────

// Задание зависит только от длительности фрагмента и того, какие края —
// искусственные границы нарезки. Ни сценария, ни времени в ролике.
export const buildPrompt = ({ chunk, range }) => {
  const cutStart = chunk.start > range.start + 1e-3;
  const cutEnd = chunk.end < range.end - 1e-3;
  const edges =
    cutStart || cutEnd
      ? `Искусственные границы нарезки: ${[cutStart && "начало", cutEnd && "конец"].filter(Boolean).join(" и ")} фрагмента. Оборванный там звук или слово не считай дефектом ролика.`
      : "Края фрагмента — границы выбранного для проверки отрезка; звук там может быть обрезан не по вине ролика.";
  return [
    TASK_TEXT,
    "",
    `Длительность фрагмента: ${chunk.duration.toFixed(2)} с.`,
    edges,
    "",
    RESPONSE_FORMAT,
  ].join("\n");
};

export const REQUEST_PARAMS = (maxTokens) => ({
  modalities: ["text"],
  store: false,
  max_completion_tokens: maxTokens,
});

export const buildRequestBody = ({ model, prompt, wavBase64, maxTokens }) => ({
  model,
  ...REQUEST_PARAMS(maxTokens),
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "input_audio",
          input_audio: { data: wavBase64, format: "wav" },
        },
      ],
    },
  ],
});

// Тело запроса без base64 — для сохранения рядом с отчётом.
export const describeRequest = (body, audioSha, audioBytes) => ({
  ...body,
  messages: body.messages.map((m) => ({
    ...m,
    content: m.content.map((c) =>
      c.type === "input_audio"
        ? {
            type: "input_audio",
            input_audio: {
              format: c.input_audio.format,
              data: `<base64 WAV: ${audioBytes} байт, sha256 ${audioSha}>`,
            },
          }
        : c,
    ),
  })),
});

// Классификация отказа: можно ли повторять и что объяснить человеку.
export const classifyFailure = ({ status, body, transportError, timedOut }) => {
  if (timedOut)
    return {
      kind: "timeout",
      retryable: true,
      fatal: false,
      hint: "истекло время ожидания ответа",
    };
  if (transportError)
    return {
      kind: "network",
      retryable: true,
      fatal: false,
      hint: `сетевой сбой: ${redact(transportError)}`,
    };
  let err = null;
  try {
    err = typeof body === "string" ? JSON.parse(body)?.error : body?.error;
  } catch {
    err = null;
  }
  const code = err?.code ?? err?.type ?? null;
  const msg = redact(
    err?.message ?? (typeof body === "string" ? body.slice(0, 300) : ""),
  );
  const quotaCodes = [
    "insufficient_quota",
    "credit_balance_exhausted",
    "billing_hard_limit_reached",
  ];
  if (
    quotaCodes.includes(err?.code) ||
    quotaCodes.includes(err?.type) ||
    /exceeded your current quota|no credits remaining/i.test(msg)
  )
    return {
      kind: "insufficient_quota",
      retryable: false,
      fatal: true,
      code,
      hint: "на балансе OpenAI API нет средств (insufficient_quota). Пополните баланс API на platform.openai.com → Billing; подписки ChatGPT и Claude его не заменяют.",
      message: msg,
    };
  if (status === 401)
    return {
      kind: "auth",
      retryable: false,
      fatal: true,
      code,
      hint: "401: ключ не принят. В режиме claude_proxy проверьте сохранённый ключ OpenAI в API credentials среды; в режиме key — OPENAI_API_KEY.",
      message: msg,
    };
  if (status === 403)
    return {
      kind: "forbidden",
      retryable: false,
      fatal: true,
      code,
      hint: "403: доступ запрещён (политика прокси среды, права проекта OpenAI или регион). Повтор не поможет.",
      message: msg,
    };
  if (status === 404 || code === "model_not_found")
    return {
      kind: "model_unavailable",
      retryable: false,
      fatal: true,
      code,
      hint: "модель недоступна для этого ключа/проекта OpenAI (model_not_found). Проверьте доступ к gpt-audio-1.5.",
      message: msg,
    };
  if (status === 429)
    return {
      kind: "rate_limit",
      retryable: true,
      fatal: false,
      code,
      hint: "429: лимит запросов, повтор с паузой",
      message: msg,
    };
  if (status >= 500)
    return {
      kind: "server",
      retryable: true,
      fatal: false,
      code,
      hint: `${status}: временная ошибка OpenAI`,
      message: msg,
    };
  if (status === 400)
    return {
      kind: "bad_request",
      retryable: false,
      fatal: false,
      code,
      hint: "400: запрос отклонён (формат аудио, размер или параметры)",
      message: msg,
    };
  return {
    kind: "http_error",
    retryable: false,
    fatal: false,
    code,
    hint: `HTTP ${status}`,
    message: msg,
  };
};

// claude_proxy: curl, тело JSON через stdin, без своего Authorization.
// TLS проверяется как обычно (системные сертификаты + CA прокси среды).
export const curlTransport = ({ url = API_URL, body, timeoutSec }) =>
  new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const marker = "\n__AUDIO_REVIEW_META__";
    const child = spawn(
      "curl",
      [
        "-sS",
        "--http1.1",
        "-X",
        "POST",
        url,
        "-H",
        "Content-Type: application/json",
        "--data-binary",
        "@-",
        "--max-time",
        String(timeoutSec),
        "-w",
        `${marker} %{http_code} %{size_upload}`,
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const out = [];
    const err = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => err.push(d));
    child.on("error", (e) =>
      resolve({ status: 0, text: "", bytesSent: 0, transportError: e.message }),
    );
    child.on("close", (code) => {
      const text = Buffer.concat(out).toString("utf8");
      const k = text.lastIndexOf(marker);
      const [httpCode, upload] =
        k >= 0
          ? text
              .slice(k + marker.length)
              .trim()
              .split(/\s+/)
          : ["0", "0"];
      resolve({
        status: Number(httpCode) || 0,
        text: k >= 0 ? text.slice(0, k) : text,
        bytesSent: Number(upload) || 0,
        payloadBytes: Buffer.byteLength(payload),
        timedOut: code === 28,
        transportError:
          code !== 0 && code !== 28
            ? redact(Buffer.concat(err).toString("utf8").trim()) ||
              `curl exit ${code}`
            : null,
      });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(payload);
  });

// key: fetch с OPENAI_API_KEY из окружения. Ключ не логируется.
export const keyTransport = async ({
  url = API_URL,
  body,
  timeoutSec,
  apiKey,
}) => {
  const payload = JSON.stringify(body);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: payload,
      signal: AbortSignal.timeout(timeoutSec * 1000),
    });
    return {
      status: res.status,
      text: await res.text(),
      bytesSent: Buffer.byteLength(payload),
      payloadBytes: Buffer.byteLength(payload),
    };
  } catch (e) {
    const timedOut = e?.name === "TimeoutError";
    return {
      status: 0,
      text: "",
      bytesSent: 0,
      payloadBytes: Buffer.byteLength(payload),
      timedOut,
      transportError: timedOut ? null : redact(e?.message),
    };
  }
};

export const makeTransport = (auth, env = process.env) => {
  if (auth === "claude_proxy") return (opts) => curlTransport(opts);
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey)
    throw new ArgError(
      "режим key: задайте OPENAI_API_KEY в окружении (или используйте --auth claude_proxy в облачной среде)",
    );
  return (opts) => keyTransport({ ...opts, apiKey });
};

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ограниченные повторы только для временных ошибок.
export const callWithRetry = async ({
  transport,
  body,
  timeoutSec,
  maxAttempts = DEFAULTS.maxAttempts,
  sleep = defaultSleep,
  log = () => {},
}) => {
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = await transport({ body, timeoutSec });
    const sent =
      r.bytesSent > 0 && (!r.payloadBytes || r.bytesSent >= r.payloadBytes);
    const rec = {
      attempt,
      http_status: r.status,
      bytes_sent: r.bytesSent,
      audio_input_sent: sent,
    };
    if (r.status === 200) {
      let json = null;
      try {
        json = JSON.parse(r.text);
      } catch {
        rec.error = { kind: "bad_api_json", hint: "ответ API не JSON" };
        attempts.push(rec);
        return { ok: false, attempts, failure: rec.error, rawText: r.text };
      }
      attempts.push(rec);
      return { ok: true, attempts, json, rawText: r.text };
    }
    const failure = classifyFailure({
      status: r.status,
      body: r.text,
      transportError: r.transportError,
      timedOut: r.timedOut,
    });
    rec.error = failure;
    attempts.push(rec);
    if (!failure.retryable || attempt === maxAttempts)
      return { ok: false, attempts, failure, rawText: redact(r.text) };
    const wait = 2000 * 2 ** (attempt - 1);
    log(`  попытка ${attempt}: ${failure.hint}; повтор через ${wait / 1000} с`);
    await sleep(wait);
  }
  return { ok: false, attempts, failure: { kind: "unknown" } };
};

// ── Разбор ответа модели ─────────────────────────────────────────────────

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n =
    typeof v === "string"
      ? Number(v.replace(",", ".").replace(/[^\d.eE+-]/g, ""))
      : Number(v);
  return Number.isFinite(n) ? n : null;
};
const enumOr = (v, allowed, fallback) => {
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  return allowed.includes(s) ? s : fallback;
};

// Извлекает JSON из текста модели и проверяет форму. Не бросает исключений.
export const parseModelText = (text) => {
  const warnings = [];
  if (!text || !String(text).trim())
    return { ok: false, error: "пустой ответ модели", warnings };
  let s = String(text).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    s = fence[1].trim();
    warnings.push("JSON был обёрнут в markdown");
  }
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b <= a)
    return { ok: false, error: "в ответе нет JSON-объекта", warnings };
  if (a > 0 || b < s.length - 1)
    warnings.push("вокруг JSON был посторонний текст");
  let data;
  try {
    data = JSON.parse(s.slice(a, b + 1));
  } catch (e) {
    return { ok: false, error: `JSON не разбирается: ${e.message}`, warnings };
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    return { ok: false, error: "корень ответа — не объект", warnings };
  if (!Array.isArray(data.issues))
    return { ok: false, error: "нет массива issues", warnings };
  if (!Array.isArray(data.heard_transcript))
    return { ok: false, error: "нет массива heard_transcript", warnings };
  const arr = (v) => (Array.isArray(v) ? v : []);

  const heard = data.heard_transcript.map((h, i) => ({
    index: i,
    t_start: toNum(h?.t_start),
    t_end: toNum(h?.t_end),
    speaker_guess: h?.speaker_guess ?? null,
    text: String(h?.text ?? ""),
    certainty: enumOr(h?.certainty, CONFIDENCE, "low"),
  }));
  const issues = data.issues.map((it, i) => {
    const confidence = enumOr(it?.confidence, CONFIDENCE, "low");
    if (
      confidence !==
      String(it?.confidence ?? "")
        .toLowerCase()
        .trim()
    )
      warnings.push(`issues[${i}]: уверенность «${it?.confidence}» → low`);
    const severity = enumOr(it?.severity, SEVERITY, "minor");
    if (
      severity !==
      String(it?.severity ?? "")
        .toLowerCase()
        .trim()
    )
      warnings.push(`issues[${i}]: серьёзность «${it?.severity}» → minor`);
    const seg = toNum(it?.heard_segment);
    const segOk =
      seg !== null && Number.isInteger(seg) && seg >= 0 && seg < heard.length;
    if (seg !== null && !segOk)
      warnings.push(
        `issues[${i}]: heard_segment ${it?.heard_segment} не существует`,
      );
    return {
      t_start: toNum(it?.t_start ?? it?.time ?? it?.t),
      t_end: toNum(it?.t_end),
      heard_segment: segOk ? seg : null,
      category: String(it?.category ?? "other"),
      observation: String(it?.observation ?? ""),
      likely_cause: String(it?.likely_cause ?? ""),
      confidence,
      severity,
      fix: String(it?.fix ?? ""),
      needs_human_check:
        it?.needs_human_check === undefined
          ? true
          : Boolean(it.needs_human_check),
    };
  });
  const scores = {};
  for (const k of SCORE_KEYS) scores[k] = null;
  for (const [k, v] of Object.entries(
    data.scores && typeof data.scores === "object" ? data.scores : {},
  )) {
    const n = toNum(v);
    scores[k] = n !== null && n >= 1 && n <= 5 ? n : null;
  }
  const notes = {};
  for (const [k, v] of Object.entries(
    data.score_notes && typeof data.score_notes === "object"
      ? data.score_notes
      : {},
  ))
    if (v !== null && v !== undefined && String(v).trim()) notes[k] = String(v);
  return {
    ok: true,
    warnings,
    data: {
      heard_transcript: heard,
      scores,
      score_notes: notes,
      issues,
      uncertain_segments: arr(data.uncertain_segments).map((u) => ({
        t_start: toNum(u?.t_start),
        t_end: toNum(u?.t_end),
        reason: String(u?.reason ?? ""),
      })),
      summary: String(data.summary ?? ""),
    },
  };
};

// ── Время ────────────────────────────────────────────────────────────────

// Время модели внутри фрагмента: проверка без «подгонки». Невалидное не
// обрезается до правдоподобных секунд — source_* остаются null.
export const modelTime = (chunk, t0, t1, tol = DEFAULTS.timeToleranceSec) => {
  const base = {
    t_start_in_fragment: t0,
    t_end_in_fragment: t1,
    verified: false,
  };
  let reason = null;
  if (t0 === null) reason = "модель не указала время";
  else if (t0 < -tol || (t1 !== null && t1 < -tol))
    reason = "отрицательное время";
  else if (t1 !== null && t1 < t0) reason = "конец раньше начала";
  else if (
    t0 > chunk.duration + tol ||
    (t1 !== null && t1 > chunk.duration + tol)
  )
    reason = "за пределами фрагмента";
  if (reason)
    return {
      ...base,
      valid: false,
      invalid_reason: reason,
      source_start: null,
      source_end: null,
    };
  return {
    ...base,
    valid: true,
    invalid_reason: null,
    source_start: round(chunk.start + t0, 2),
    source_end: t1 === null ? null : round(chunk.start + t1, 2),
  };
};

const fragmentTime = (chunk) => ({
  start: chunk.start,
  end: chunk.end,
  basis: "ffmpeg_cut",
  verified: true,
});

const intersect = (a, b) => {
  const s = Math.max(a.start, b.start);
  const e = Math.min(a.end, b.end);
  return e > s ? { start: round(s, 3), end: round(e, 3) } : null;
};

// Более узкая проверенная привязка фрагмента речи модели (heard_segment):
// только через проверенное размещение файла голоса и однозначное
// сопоставление слов. Плановое время сценария привязкой не считается.
const placementForSegment = (comparison, chunk, seg) => {
  if (!comparison || seg === null)
    return { interval: null, why: "нет связи с фрагментом речи модели" };
  const hits = comparison.lines.filter((l) => l.heard_segments.includes(seg));
  if (!hits.length)
    return {
      interval: null,
      why: "фрагмент речи модели не сопоставлен ни с одной репликой",
    };
  const bad = hits.find(
    (l) => l.basis !== "placement" || !l.placement || l.status === "unclear",
  );
  if (bad)
    return {
      interval: null,
      why:
        bad.basis !== "placement"
          ? "для реплики нет проверенного размещения файла (только плановое время)"
          : "сопоставление с репликой неоднозначно",
    };
  const span = {
    start: Math.min(...hits.map((l) => l.placement.file_from)),
    end: Math.max(...hits.map((l) => l.placement.file_to)),
  };
  const iv = intersect(span, chunk);
  if (!iv) return { interval: null, why: "размещение реплики вне фрагмента" };
  return {
    interval: {
      ...iv,
      basis: "project_audio_placement",
      verified: true,
      lines: hits.map((l) => l.id),
      files: hits.map((l) => l.placement.file),
    },
    why:
      `фрагмент речи модели №${seg} → локальное сопоставление слов → ` +
      `${hits.map((l) => `${l.id} (${l.status})`).join(", ")} → размещение файла в композиции; ` +
      "проверено, где звучит файл реплики, а не точное место дефекта внутри неё",
  };
};

// ── Замечания ────────────────────────────────────────────────────────────

// Каждое замечание сохраняется отдельно. Ничего не удаляется у краёв и не
// склеивается по времени модели и категории: возможные дубли из перекрытия
// и возможные артефакты нарезки только помечаются как непроверенные.
export const collectIssues = (
  chunkResults,
  range,
  guardSec = DEFAULTS.boundaryGuardSec,
) => {
  const all = [];
  for (const cr of chunkResults) {
    if (cr.status !== "analyzed") continue;
    const { chunk } = cr;
    cr.parsed.data.issues.forEach((it, k) => {
      const mt = modelTime(chunk, it.t_start, it.t_end);
      const cutStart = chunk.start > range.start + 1e-3;
      const cutEnd = chunk.end < range.end - 1e-3;
      const nearCut =
        mt.valid &&
        ((cutStart && it.t_start < guardSec) ||
          (cutEnd && (it.t_end ?? it.t_start) > chunk.duration - guardSec));
      const narrow = placementForSegment(
        cr.comparison,
        chunk,
        it.heard_segment,
      );
      all.push({
        id: `f${chunk.index + 1}-i${k + 1}`,
        chunk_index: chunk.index,
        category: it.category,
        observation: it.observation,
        likely_cause: it.likely_cause,
        fix: it.fix,
        model_confidence: it.confidence,
        model_severity: it.severity,
        needs_human_check: true,
        heard_segment: it.heard_segment,
        heard_text:
          it.heard_segment !== null
            ? (cr.parsed.data.heard_transcript[it.heard_segment]?.text ?? null)
            : null,
        time: {
          fragment: fragmentTime(chunk),
          model_estimate: mt,
          verified_narrower: narrow.interval,
          verified_narrower_note: narrow.interval
            ? narrow.why
            : `более узкой проверенной привязки нет: ${narrow.why}`,
          display_basis: narrow.interval
            ? "project_audio_placement"
            : "fragment",
        },
        possible_boundary_artifact: nearCut,
        possible_duplicates: [],
      });
    });
  }
  // Перекрытие соседних фрагментов само по себе дефект не подтверждает:
  // только пометка «возможно, то же самое» с явной неопределённостью.
  for (const a of all)
    for (const b of all) {
      if (
        a === b ||
        Math.abs(a.chunk_index - b.chunk_index) !== 1 ||
        a.category !== b.category
      )
        continue;
      const [ea, eb] = [a.time.model_estimate, b.time.model_estimate];
      if (!ea.valid || !eb.valid) continue;
      const lo = Math.max(
        chunkResults[a.chunk_index].chunk.start,
        chunkResults[b.chunk_index].chunk.start,
      );
      const hi = Math.min(
        chunkResults[a.chunk_index].chunk.end,
        chunkResults[b.chunk_index].chunk.end,
      );
      const inOverlap = (e) =>
        e.source_start >= lo - 0.5 && e.source_start <= hi + 0.5;
      if (
        inOverlap(ea) &&
        inOverlap(eb) &&
        Math.abs(ea.source_start - eb.source_start) <= 1.5
      )
        a.possible_duplicates.push(b.id);
    }
  return all;
};

// ── Сравнение со сценарием (локально) ────────────────────────────────────

export const compareChunk = (ctx, chunk, heard, opts) => {
  if (!ctx) return null;
  const lines = linesForChunk(ctx, chunk, opts);
  if (!lines.length)
    return {
      chunk_index: chunk.index,
      selection_note:
        "для фрагмента нет ожидаемых реплик (по размещению/времени)",
      lines: [],
      unassigned_heard: heard.map((h) => ({ segment: h.index, text: h.text })),
    };
  const cmp = compareLines(lines, heard);
  return {
    chunk_index: chunk.index,
    selection_note: null,
    lines: cmp.lines.map((r, i) => ({
      ...r,
      basis: lines[i].basis,
      plan_at: lines[i].plan_at,
      placement: lines[i].placement,
      verified_interval:
        lines[i].placement && r.status !== "unclear"
          ? intersect(
              {
                start: lines[i].placement.file_from,
                end: lines[i].placement.file_to,
              },
              chunk,
            )
          : null,
    })),
    unassigned_heard: cmp.unassigned_heard,
    spacing_normalized: cmp.spacing_normalized,
  };
};

// Свод по репликам: результат берётся из фрагмента, где реплика целиком
// внутри; если такие фрагменты расходятся — unclear.
// Реплики, которые по размещению/плановому времени целиком вне выбранного
// диапазона, помечаются outside_range и в ручную проверку не попадают.
export const rollupLines = (ctx, comparisons, range = null) => {
  if (!ctx) return [];
  return ctx.lines.map((l) => {
    const seen = comparisons.flatMap((c) =>
      (c?.lines ?? [])
        .filter((x) => x.id === l.id)
        .map((x) => ({ ...x, chunk_index: c.chunk_index })),
    );
    const a = l.placement
      ? (l.placement.speech_from ?? l.placement.file_from)
      : l.plan_at;
    const b = l.placement
      ? (l.placement.speech_to ?? l.placement.file_to)
      : l.plan_at;
    if (
      !seen.length &&
      range &&
      a !== null &&
      (b <= range.start || a >= range.end)
    )
      return {
        id: l.id,
        role: l.role,
        expected_text: l.text,
        status: "outside_range",
        needs_human_check: false,
        note: `вне выбранного диапазона (${l.placement ? "по размещению файла" : "по плановому времени"})`,
        observations: [],
      };
    if (!seen.length)
      return {
        id: l.id,
        role: l.role,
        expected_text: l.text,
        status: "not_checked",
        needs_human_check: true,
        note: "реплика вне проверенных фрагментов или фрагменты не разобраны",
        observations: [],
      };
    const inside = seen.filter(
      (x) => !x.reasons.some((r) => /край|краем|выходит/.test(r)),
    );
    const statuses = [...new Set(inside.map((x) => x.status))];
    const status =
      inside.length && statuses.length === 1 ? statuses[0] : "unclear";
    return {
      id: l.id,
      role: l.role,
      expected_text: l.text,
      status,
      needs_human_check: status !== "match",
      note: !inside.length
        ? "реплика только на краях фрагментов"
        : statuses.length > 1
          ? "фрагменты дают разные результаты"
          : null,
      observations: seen.map((x) => ({
        chunk_index: x.chunk_index,
        status: x.status,
        heard_text_aligned: x.heard_text_aligned,
        diffs: x.diffs,
        reasons: x.reasons,
      })),
    };
  });
};

// ── Кэш ──────────────────────────────────────────────────────────────────

// Ключ — только то, что реально уходит в модель: аудио, модель, задание и
// параметры запроса. Сценарий в ключ не входит: его смена пересчитывает
// локальное сравнение без нового платного прослушивания.
export const cacheKey = ({ audioSha, model, prompt, params }) =>
  sha256(
    JSON.stringify({
      cache_format: CACHE_FORMAT,
      audioSha,
      model,
      promptVersion: PROMPT_VERSION,
      promptSha: sha256(prompt),
      params,
    }),
  );

export const readCache = (dir, key) => {
  const p = join(dir, `${key}.json`);
  if (!existsSync(p)) return null;
  try {
    const e = JSON.parse(readFileSync(p, "utf8"));
    // Старые записи (v1 — ответы со сценарием в запросе) не используются.
    if (
      e.cache_format !== CACHE_FORMAT ||
      e.prompt_version !== PROMPT_VERSION ||
      e.finish_reason !== "stop"
    )
      return null;
    return e;
  } catch {
    return null;
  }
};

export const writeCache = (dir, key, entry) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${key}.json`),
    JSON.stringify(
      { cache_format: CACHE_FORMAT, prompt_version: PROMPT_VERSION, ...entry },
      null,
      2,
    ),
  );
};

// ── Итоговый статус ──────────────────────────────────────────────────────

// complete — все выбранные фрагменты обработаны (ответ полный и разобран).
// Это статус обработки, а не оценка качества ролика.
export const finalStatus = ({ dryRun, chunkResults }) => {
  if (dryRun) return "dry_run";
  const okCount = chunkResults.filter((c) => c.status === "analyzed").length;
  if (okCount === 0) return "failed";
  return okCount === chunkResults.length ? "complete" : "partial";
};

const addUsage = (total, u) => {
  if (!u) return;
  for (const k of ["prompt_tokens", "completion_tokens", "total_tokens"])
    total[k] += u[k] ?? 0;
  for (const d of ["prompt_tokens_details", "completion_tokens_details"])
    for (const [k, v] of Object.entries(u[d] ?? {}))
      if (typeof v === "number") total[d][k] = (total[d][k] ?? 0) + v;
};

export const LIMITATIONS = [
  "Оценки 1–5, certainty и confidence — мнение аудиомодели, не измерение и не гарантия.",
  "Распознавание кыргызской речи моделью может быть ошибочным; расхождение со сценарием — повод прослушать, а не доказанная ошибка озвучки.",
  "Подтверждено только время фрагмента, вырезанного FFmpeg. Время модели внутри фрагмента не проверено.",
  "Ориентиры громкости FFmpeg не определяют текст, говорящего и даже наличие речи: в миксе есть музыка и эффекты.",
  "Инструмент получает только звук: о синхронизации губ и изображении выводов нет.",
  "Ответы одной и той же модели на один и тот же звук могут различаться от запуска к запуску.",
];

// ── Основной сценарий ────────────────────────────────────────────────────

export const runReview = async (
  opts,
  { transport = null, env = process.env, log = console.log, sleep } = {},
) => {
  const startedAt = new Date().toISOString();
  mkdirSync(opts.out, { recursive: true });
  const chunksDir = join(opts.out, "chunks");
  const rawDir = join(opts.out, "raw");
  mkdirSync(chunksDir, { recursive: true });
  mkdirSync(rawDir, { recursive: true });
  const cacheDir = opts.cacheDir ?? join(opts.out, "..", ".audio-review-cache");

  const media = probeMedia(opts.input);
  if (!media.audio_streams.length) throw new Error("в файле нет аудиодорожки");
  const mediaDuration =
    media.audio_streams[0].duration_sec ?? media.duration_sec;
  if (!mediaDuration) throw new Error("ffprobe не сообщил длительность");
  if (opts.start >= mediaDuration)
    throw new ArgError(
      `--start ${opts.start} за пределами файла (длительность ${mediaDuration} с)`,
    );
  const requestedEnd = opts.duration
    ? opts.start + opts.duration
    : mediaDuration;
  const end = Math.min(requestedEnd, mediaDuration);
  const range = {
    start: round(opts.start),
    end: round(end),
    duration: round(end - opts.start),
    requested_duration: opts.duration,
    clamped_to_file_end: requestedEnd > mediaDuration + 1e-3,
  };

  log(
    `Файл: ${opts.input} (${mediaDuration} с), диапазон ${range.start}–${range.end} с`,
  );
  const sourceSha = await sha256File(opts.input);
  const ctx = loadContext(opts.context);
  const send = opts.dryRun
    ? null
    : (transport ?? makeTransport(opts.auth, env));

  // Весь диапазон — для измерений исходного микса и ориентиров громкости.
  const rangeWav = join(opts.out, "range.wav");
  extractWav(opts.input, rangeWav, range.start, range.duration);
  const rangeMetrics = measureLoudness(rangeWav);
  const sr = media.audio_streams[0].sample_rate || 48000;
  const profile = loudnessProfile(rangeWav, sr);
  const landmarks = loudnessLandmarks(profile, range.start);

  const chunks = planChunks(range.start, range.end, opts);
  const gaps = coverageGaps(chunks, range.start, range.end);
  if (gaps.length)
    throw new Error(
      `внутренняя ошибка: пропуски покрытия ${JSON.stringify(gaps)}`,
    );
  const singleWholeFile =
    chunks.length === 1 &&
    range.start === 0 &&
    !range.clamped_to_file_end &&
    Math.abs(range.end - mediaDuration) < 0.05;

  const chunkResults = [];
  const usage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    prompt_tokens_details: {},
    completion_tokens_details: {},
  };
  let fatal = null;
  let audioInputSent = false;
  let apiSuccess = false;

  for (const chunk of chunks) {
    const tag = String(chunk.index + 1).padStart(2, "0");
    const wavPath = join(chunksDir, `chunk-${tag}.wav`);
    extractWav(opts.input, wavPath, chunk.start, chunk.duration);
    const wav = readFileSync(wavPath);
    const audioSha = sha256(wav);
    const actualDuration = wavDuration(wav);
    const metrics = measureLoudness(wavPath);
    const prompt = buildPrompt({ chunk, range });
    const key = cacheKey({
      audioSha,
      model: opts.model,
      prompt,
      params: REQUEST_PARAMS(opts.maxTokens),
    });
    const body = buildRequestBody({
      model: opts.model,
      prompt,
      wavBase64: wav.toString("base64"),
      maxTokens: opts.maxTokens,
    });
    assertNoContextLeak(body, ctx);
    writeFileSync(
      join(rawDir, `chunk-${tag}.request.json`),
      JSON.stringify(describeRequest(body, audioSha, wav.length), null, 2),
    );

    const cr = {
      chunk,
      wav: wavPath,
      audio_sha256: audioSha,
      audio_bytes: wav.length,
      wav_duration_sec: actualDuration,
      cache_key: key,
      metrics,
      status: "planned",
      from_cache: false,
      audio_input_sent: false,
      api_success: false,
      attempts: [],
      parsed: null,
      comparison: null,
      error: null,
      usage: null,
      finish_reason: null,
      incomplete_reason: null,
    };
    chunkResults.push(cr);

    const cached = opts.cache ? readCache(cacheDir, key) : null;
    if (opts.dryRun) {
      cr.status = cached ? "dry_run_cached" : "dry_run";
      log(
        `  фрагмент ${tag} ${chunk.start}–${chunk.end} с: dry-run${cached ? " (есть в кэше)" : ""}`,
      );
      continue;
    }
    if (fatal) {
      cr.status = "skipped";
      cr.error = {
        kind: "skipped_after_fatal",
        hint: `не отправлен: ${fatal.hint}`,
      };
      continue;
    }

    let content;
    let responseJson;
    if (cached) {
      cr.from_cache = true;
      content = cached.content;
      cr.usage = cached.usage ?? null;
      cr.finish_reason = cached.finish_reason;
      cr.response_model = cached.response_model ?? null;
      cr.cached_at = cached.saved_at;
      responseJson = cached.response;
      writeFileSync(
        join(rawDir, `chunk-${tag}.response.json`),
        JSON.stringify(cached.response, null, 2),
      );
      log(
        `  фрагмент ${tag}: прослушивание из кэша (${cached.saved_at}), без нового запроса`,
      );
    } else {
      log(
        `  фрагмент ${tag} ${chunk.start}–${chunk.end} с: отправка ${wav.length} байт WAV в ${opts.model}…`,
      );
      const res = await callWithRetry({
        transport: send,
        body,
        timeoutSec: opts.timeoutSec,
        maxAttempts: opts.maxAttempts,
        sleep,
        log,
      });
      cr.attempts = res.attempts;
      cr.audio_input_sent = res.attempts.some((a) => a.audio_input_sent);
      audioInputSent ||= cr.audio_input_sent;
      writeFileSync(
        join(rawDir, `chunk-${tag}.response.json`),
        res.json
          ? JSON.stringify(res.json, null, 2)
          : JSON.stringify(
              { http_error: true, body: res.rawText ?? "" },
              null,
              2,
            ),
      );
      if (!res.ok) {
        cr.status = "api_error";
        cr.error = res.failure;
        if (res.failure?.fatal) fatal = res.failure;
        log(
          `  фрагмент ${tag}: ошибка — ${res.failure?.hint}${res.failure?.message ? ` (${res.failure.message})` : ""}`,
        );
        continue;
      }
      responseJson = res.json;
      const choice = res.json?.choices?.[0];
      content =
        typeof choice?.message?.content === "string"
          ? choice.message.content
          : "";
      cr.finish_reason = choice?.finish_reason ?? null;
      cr.usage = res.json?.usage ?? null;
      cr.response_model = res.json?.model ?? null;
      addUsage(usage, cr.usage);
      if (!content.trim()) {
        cr.status = "empty_response";
        cr.error = {
          kind: "empty_response",
          hint: `API ответил без текста (finish_reason: ${cr.finish_reason})`,
        };
        log(`  фрагмент ${tag}: пустой ответ модели`);
        continue;
      }
      cr.api_success = true;
      apiSuccess = true;
    }

    writeFileSync(join(rawDir, `chunk-${tag}.model-text.txt`), content);
    cr.raw_text = content;
    cr.parsed = parseModelText(content);
    // Усечённый или иначе неполный ответ — не полная проверка, не в кэш.
    if (cr.finish_reason !== "stop") {
      cr.status =
        cr.finish_reason === "length" ? "truncated" : "incomplete_response";
      cr.incomplete_reason =
        cr.finish_reason === "length"
          ? `ответ обрезан лимитом max_completion_tokens=${opts.maxTokens} (finish_reason: length)`
          : `ответ завершён не штатно (finish_reason: ${cr.finish_reason})`;
      cr.error = { kind: cr.status, hint: cr.incomplete_reason };
      log(`  фрагмент ${tag}: ${cr.incomplete_reason}`);
      continue;
    }
    if (!cr.parsed.ok) {
      cr.status = "parse_error";
      cr.error = { kind: "parse_error", hint: cr.parsed.error };
      log(`  фрагмент ${tag}: ошибка разбора — ${cr.error.hint}`);
      continue;
    }
    cr.status = "analyzed";
    if (!cr.from_cache && opts.cache)
      writeCache(cacheDir, key, {
        saved_at: new Date().toISOString(),
        model: opts.model,
        audio_sha256: audioSha,
        content,
        finish_reason: cr.finish_reason,
        response_model: cr.response_model,
        usage: cr.usage,
        response: responseJson,
      });
    log(
      `  фрагмент ${tag}: разобрано (речь: ${cr.parsed.data.heard_transcript.length} фрагм., замечаний: ${cr.parsed.data.issues.length})`,
    );
  }

  // Локальное сравнение со сценарием — после независимого прослушивания.
  for (const cr of chunkResults)
    if (cr.status === "analyzed")
      cr.comparison = compareChunk(
        ctx,
        cr.chunk,
        cr.parsed.data.heard_transcript,
        { singleWholeFile },
      );

  const status = finalStatus({ dryRun: opts.dryRun, chunkResults });
  const issues = collectIssues(chunkResults, range);
  const analyzed = chunkResults.filter((c) => c.status === "analyzed");
  const unchecked = chunkResults
    .filter((c) => c.status !== "analyzed")
    .map((c) => ({
      start: c.chunk.start,
      end: c.chunk.end,
      status: c.status,
      reason: c.error?.hint ?? null,
    }));
  const lineRollup = rollupLines(
    ctx,
    chunkResults.map((c) => c.comparison),
    range,
  );

  const manual = [];
  for (const l of lineRollup)
    if (l.needs_human_check)
      manual.push({
        what: `реплика ${l.id}: ${l.status}`,
        where:
          l.observations
            .map((o) => `фрагмент ${o.chunk_index + 1}`)
            .join(", ") || "—",
        why:
          l.note ??
          l.observations
            .flatMap((o) =>
              o.diffs
                .map((d) => `«${d.expected}» ↔ «${d.heard}» (${d.kind_ru})`)
                .concat(o.reasons),
            )
            .join("; "),
      });
  for (const i of issues)
    manual.push({
      what: `замечание ${i.id}: ${i.category}`,
      where: i.time.verified_narrower
        ? `${i.time.verified_narrower.start}–${i.time.verified_narrower.end} с (размещение файла)`
        : `${i.time.fragment.start}–${i.time.fragment.end} с (фрагмент)`,
      why: i.observation,
    });
  for (const u of unchecked)
    manual.push({
      what: `не проверено моделью: ${u.status}`,
      where: `${u.start}–${u.end} с`,
      why: u.reason ?? "",
    });

  const report = {
    tool: "balago audio-review",
    report_format_version: REPORT_FORMAT_VERSION,
    prompt_version: PROMPT_VERSION,
    model: opts.model,
    auth_mode: opts.auth,
    status,
    status_meaning:
      "статус обработки выбранных фрагментов, а не оценка качества ролика",
    audio_input_sent: audioInputSent,
    api_success: apiSuccess,
    context_sent_to_model: false,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    source: { path: opts.input, sha256: sourceSha, ...media },
    range,
    coverage: {
      chunks_total: chunkResults.length,
      chunks_analyzed: analyzed.length,
      chunks_from_cache: chunkResults.filter(
        (c) => c.from_cache && c.status === "analyzed",
      ).length,
      seconds_analyzed_union: round(
        analyzed.reduce(
          (acc, c, i, arr) =>
            acc +
            c.chunk.duration -
            (i > 0 && arr[i - 1].chunk.index === c.chunk.index - 1
              ? Math.max(0, arr[i - 1].chunk.end - c.chunk.start)
              : 0),
          0,
        ),
        2,
      ),
      seconds_selected: range.duration,
    },
    context: ctx
      ? {
          path: ctx.path,
          sha256: ctx.sha256,
          kind: ctx.kind,
          lines: ctx.lines.length,
          with_placement: ctx.lines.filter((l) => l.placement).length,
          placement_basis: ctx.placement_basis,
          caveat: ctx.caveat,
          used: "только локальное сравнение после ответа модели",
        }
      : null,
    settings: {
      chunk_sec: opts.chunkSec,
      overlap_sec: opts.overlapSec,
      max_completion_tokens: opts.maxTokens,
      timeout_sec: opts.timeoutSec,
      max_attempts: opts.maxAttempts,
      cache: opts.cache,
    },
    fatal_error: fatal,
    // Числа FFmpeg — отдельно от мнения модели.
    measurements: {
      tool: "ffmpeg ebur128 (peak=true) + astats, без нормализации",
      range: rangeMetrics,
      chunks: chunkResults.map((c) => ({
        index: c.chunk.index,
        start: c.chunk.start,
        end: c.chunk.end,
        wav_duration_sec: c.wav_duration_sec,
        ...c.metrics,
      })),
      loudness_landmarks: {
        note: "ориентиры для ручной проверки; не определяют текст, говорящего или наличие речи (в миксе музыка и эффекты); к репликам автоматически не привязываются",
        window_sec: 0.25,
        marks: landmarks,
      },
    },
    chunks: chunkResults.map((c) => ({
      index: c.chunk.index,
      start: c.chunk.start,
      end: c.chunk.end,
      duration: c.chunk.duration,
      wav_duration_sec: c.wav_duration_sec,
      status: c.status,
      from_cache: c.from_cache,
      audio_input_sent: c.audio_input_sent,
      api_success: c.api_success,
      audio_sha256: c.audio_sha256,
      audio_bytes: c.audio_bytes,
      cache_key: c.cache_key,
      attempts: c.attempts,
      finish_reason: c.finish_reason,
      incomplete_reason: c.incomplete_reason,
      response_model: c.response_model ?? null,
      usage: c.usage,
      error: c.error,
      parse_ok: c.parsed?.ok ?? null,
      parse_warnings: c.parsed?.warnings ?? [],
      raw_text: c.raw_text ?? null,
      // Частично разобранный ответ усечённого/неполного фрагмента — для чтения, не как проверка.
      partial_result:
        c.status === "truncated" || c.status === "incomplete_response"
          ? c.parsed?.ok
            ? c.parsed.data
            : null
          : undefined,
    })),
    // Мнение модели (не измерения). Время модели — непроверенное.
    model_assessment: {
      note: "оценки, certainty и confidence — мнение модели; heard_transcript — исходная расшифровка без исправлений по сценарию",
      per_chunk: analyzed.map((c) => ({
        index: c.chunk.index,
        fragment: fragmentTime(c.chunk),
        scores: c.parsed.data.scores,
        score_notes: c.parsed.data.score_notes,
        summary: c.parsed.data.summary,
        heard_transcript: c.parsed.data.heard_transcript.map((h) => ({
          ...h,
          model_time: modelTime(c.chunk, h.t_start, h.t_end),
        })),
        uncertain_segments: c.parsed.data.uncertain_segments.map((u) => ({
          ...u,
          model_time: modelTime(c.chunk, u.t_start, u.t_end),
        })),
      })),
      issues,
    },
    // Локальное сравнение (код, не модель).
    script_comparison: ctx
      ? {
          computed_by: "local code after independent listening",
          meaning:
            "расхождение = сценарий ≠ распознавание модели; не доказанная ошибка озвучки",
          normalization:
            "регистр, пробелы, пунктуация; у/ү, о/ө, н/ң, ы/и не приравниваются",
          per_chunk: chunkResults
            .filter((c) => c.comparison)
            .map((c) => c.comparison),
          lines: lineRollup,
        }
      : null,
    unchecked_ranges: unchecked,
    manual_check: manual,
    limitations: LIMITATIONS,
    usage_this_run: usage,
  };

  writeFileSync(
    join(opts.out, "audio-review.json"),
    JSON.stringify(report, null, 2),
  );
  writeFileSync(join(opts.out, "audio-review.md"), renderMarkdown(report));
  return report;
};

// ── Markdown ─────────────────────────────────────────────────────────────

const fmtN = (v, unit = "") =>
  v === null || v === undefined ? "—" : `${v}${unit}`;
const cell = (s) =>
  String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n+/g, " ");
const fmtModelTime = (mt) =>
  mt.valid
    ? `≈${mt.source_start.toFixed(1)}${mt.source_end !== null && mt.source_end !== mt.source_start ? `–${mt.source_end.toFixed(1)}` : ""} с (не проверено)`
    : `невалидно: ${mt.invalid_reason} (${mt.t_start_in_fragment ?? "—"}…${mt.t_end_in_fragment ?? "—"})`;

const STATUS_RU = {
  complete: "complete — все выбранные фрагменты обработаны моделью",
  partial: "partial — обработана только часть фрагментов",
  failed: "failed — ни один фрагмент не обработан полностью",
  dry_run: "dry_run — запросы к API не отправлялись",
};

export const renderMarkdown = (r) => {
  const L = [];
  L.push(`# Проверка звука: ${r.source.path}`, "");
  L.push(
    `- Статус обработки: **${STATUS_RU[r.status] ?? r.status}**. Это не оценка качества ролика.`,
  );
  L.push(
    `- Аудио отправлено в API: **${r.audio_input_sent ? "да" : "нет"}**; успешный ответ API в этом запуске: **${r.api_success ? "да" : "нет"}**`,
  );
  L.push(
    `- Сценарий модели не передавался (\`context_sent_to_model: false\`).`,
  );
  L.push(
    `- Модель: \`${r.model}\`, задание \`${r.prompt_version}\`, формат отчёта v${r.report_format_version}, доступ: \`${r.auth_mode}\``,
  );
  L.push(`- SHA-256 файла: \`${r.source.sha256}\``);
  L.push(
    `- Диапазон: ${r.range.start}–${r.range.end} с (${r.range.duration} с)${r.range.clamped_to_file_end ? ", обрезан до конца файла" : ""}`,
  );
  L.push(
    `- Охват: обработано ${r.coverage.chunks_analyzed}/${r.coverage.chunks_total} фрагментов (${r.coverage.chunks_from_cache} из кэша), ≈${r.coverage.seconds_analyzed_union} из ${r.coverage.seconds_selected} с`,
  );
  L.push(
    r.context
      ? `- Сценарий: \`${r.context.path}\` — ${r.context.used}; реплик ${r.context.lines}, с проверенным размещением файла ${r.context.with_placement}`
      : "- Сценарий не передан: локального сравнения нет",
  );
  L.push("");

  if (r.fatal_error) {
    L.push(
      "## Препятствие",
      "",
      `**${r.fatal_error.kind}**: ${r.fatal_error.hint}`,
    );
    if (r.fatal_error.message)
      L.push("", `Сообщение API: ${r.fatal_error.message}`);
    L.push("");
  }

  const m = r.measurements.range;
  L.push("## Измерения FFmpeg (числа, не оценки модели)", "");
  L.push(
    "| Диапазон | Integrated, LUFS | LRA, LU | True peak, dBTP | Sample peak, dBFS | RMS, dBFS | Flat factor |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  );
  L.push(
    `| весь ${r.range.start}–${r.range.end} с | ${fmtN(m.integrated_lufs)} | ${fmtN(m.loudness_range_lu)} | ${fmtN(m.true_peak_dbtp)} | ${fmtN(m.sample_peak_dbfs)} | ${fmtN(m.rms_dbfs)} | ${fmtN(m.flat_factor)} |`,
  );
  for (const c of r.measurements.chunks)
    L.push(
      `| фрагмент ${c.index + 1}: ${c.start}–${c.end} с | ${fmtN(c.integrated_lufs)} | ${fmtN(c.loudness_range_lu)} | ${fmtN(c.true_peak_dbtp)} | ${fmtN(c.sample_peak_dbfs)} | ${fmtN(c.rms_dbfs)} | ${fmtN(c.flat_factor)} |`,
    );
  const a0 = r.source.audio_streams[0];
  if (a0)
    L.push(
      "",
      `Дорожка: ${a0.codec}, ${a0.sample_rate} Гц, ${a0.channels} кан.${a0.channel_layout ? ` (${a0.channel_layout})` : ""}. Анализ — PCM16 WAV без нормализации.`,
    );
  const lm = r.measurements.loudness_landmarks;
  if (lm.marks.length) {
    L.push("", `Ориентиры громкости для ручной проверки (${lm.note}):`);
    L.push(
      lm.marks
        .map((x) =>
          x.type === "quiet"
            ? `тихо ${x.start}–${x.end} с`
            : `подъём +${x.delta_db} дБ на ${x.at} с`,
        )
        .join("; "),
    );
  }
  L.push("");

  L.push(
    "## Фрагменты (подтверждённое время — вырезано FFmpeg)",
    "",
    "| # | Время | Статус | Кэш | Аудио отправлено | Ответ API | finish_reason | Примечание |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const c of r.chunks)
    L.push(
      `| ${c.index + 1} | ${c.start}–${c.end} с | ${c.status} | ${c.from_cache ? "да" : "нет"} | ${c.audio_input_sent ? "да" : "нет"} | ${c.api_success ? "да" : "нет"} | ${c.finish_reason ?? "—"} | ${cell(c.error?.hint ?? (c.parse_warnings.length ? c.parse_warnings.join("; ") : ""))} |`,
    );
  L.push("");

  if (r.status === "dry_run") {
    L.push(
      "## Итог",
      "",
      "Dry-run: файл, дорожка, нарезка и измерения проверены, **модель звук не слушала**. Это не проверка качества озвучки.",
      "",
    );
    return L.join("\n");
  }

  L.push("## Расшифровка модели (исходная, без исправлений по сценарию)", "");
  for (const pc of r.model_assessment.per_chunk) {
    L.push(
      `### Фрагмент ${pc.index + 1} (${pc.fragment.start}–${pc.fragment.end} с)`,
      "",
    );
    if (!pc.heard_transcript.length) L.push("Модель не распознала речи.");
    for (const h of pc.heard_transcript)
      L.push(
        `- №${h.index} [${h.certainty}] ${h.speaker_guess ? `${h.speaker_guess}: ` : ""}«${h.text}» — время модели: ${fmtModelTime(h.model_time)}`,
      );
    L.push("");
    if (pc.summary) L.push(`Резюме модели: ${pc.summary}`, "");
    L.push(
      `Оценки 1–5 (мнение модели): ${SCORE_KEYS.map((k) => `${k} ${pc.scores[k] ?? "null"}`).join(", ")}`,
    );
    const notes = Object.entries(pc.score_notes);
    if (notes.length)
      L.push(
        "",
        `Пояснения модели: ${notes.map(([k, v]) => `${k} — ${v}`).join("; ")}`,
      );
    if (pc.uncertain_segments.length) {
      L.push("", "Неуверенные места по мнению модели:");
      for (const u of pc.uncertain_segments)
        L.push(`- ${fmtModelTime(u.model_time)}: ${u.reason}`);
    }
    L.push("");
  }

  if (r.script_comparison) {
    const sc = r.script_comparison;
    L.push(
      "## Сравнение со сценарием (локально, после прослушивания)",
      "",
      `${sc.meaning}. Нормализация: ${sc.normalization}.`,
      "",
    );
    L.push(
      "| Реплика | Ожидалось | Распознано (выровнено) | Статус | Расхождения | Почему проверить |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const c of sc.per_chunk)
      for (const l of c.lines)
        L.push(
          `| ${cell(l.id)} (фр. ${c.chunk_index + 1}, ${l.basis}) | ${cell(l.expected_text)} | ${cell(l.heard_text_aligned || "—")} | ${l.status} | ${cell(l.diffs.map((d) => `«${d.expected}» → «${d.heard}» (${d.kind_ru})`).join("; ") || "—")} | ${cell(l.reasons.join("; ") || (l.needs_human_check ? "есть расхождение" : "—"))} |`,
        );
    const spacing = sc.per_chunk.flatMap((c) => c.spacing_normalized ?? []);
    if (spacing.length)
      L.push("", `Нормализация пробелов: ${spacing.join("; ")}.`);
    L.push("");
  }

  L.push("## Замечания модели (мнение модели, требуют проверки человеком)", "");
  if (r.model_assessment.issues.length) {
    L.push(
      "| ID | Проверенный фрагмент | Время по модели | Более узкая проверенная привязка | Категория | Наблюдение | Причина | Уверенность / серьёзность (модель) | Исправление | Пометки |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const i of r.model_assessment.issues) {
      const t = i.time;
      const marks = [
        i.possible_boundary_artifact &&
          "возможно, артефакт нарезки (по времени модели)",
        i.possible_duplicates.length &&
          `возможно, то же, что ${i.possible_duplicates.join(", ")} (не подтверждено)`,
      ]
        .filter(Boolean)
        .join("; ");
      L.push(
        `| ${i.id} | ${t.fragment.start}–${t.fragment.end} с | ${cell(fmtModelTime(t.model_estimate))} | ${cell(t.verified_narrower ? `${t.verified_narrower.start}–${t.verified_narrower.end} с: ${t.verified_narrower_note}` : t.verified_narrower_note)} | ${cell(i.category)} | ${cell(i.observation)} | ${cell(i.likely_cause)} | ${i.model_confidence} / ${i.model_severity} | ${cell(i.fix)} | ${cell(marks || "—")} |`,
      );
    }
  } else if (r.status === "complete") {
    L.push(
      "Модель не назвала проблем в обработанных фрагментах. Это не подтверждение качества: кыргызскую речь и эффекты должен прослушать человек.",
    );
  } else {
    L.push(
      "Замечаний нет, но обработаны не все фрагменты — вывод о качестве сделать нельзя.",
    );
  }
  L.push("");

  if (r.unchecked_ranges.length) {
    L.push("## Не проверено моделью", "");
    for (const u of r.unchecked_ranges)
      L.push(
        `- ${u.start}–${u.end} с: ${u.status}${u.reason ? ` — ${u.reason}` : ""}`,
      );
    L.push("");
  }
  if (r.manual_check.length) {
    L.push("## Места для ручной проверки", "");
    for (const x of r.manual_check)
      L.push(`- ${x.what} — ${x.where}${x.why ? `: ${x.why}` : ""}`);
    L.push("");
  }
  L.push("## Ограничения", "", ...r.limitations.map((x) => `- ${x}`), "");
  const u = r.usage_this_run;
  L.push(
    "## Usage API (этот запуск)",
    "",
    `prompt ${u.prompt_tokens}, completion ${u.completion_tokens}, total ${u.total_tokens}; детали: ${JSON.stringify({ prompt: u.prompt_tokens_details, completion: u.completion_tokens_details })}`,
    "",
  );
  return L.join("\n");
};
