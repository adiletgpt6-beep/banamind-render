// Озвучка ролика 80-1-3 «А если я не вижу?» — синтез сырых дублей (CI).
//
// Тот же способ, что у первых двух фильмов урока 1 (scripts/lesson01-voice.mjs,
// scripts/lesson80-1-2-voice.mjs): для каждой реплики синтезируется
// voices.json → tts.takes дублей голосом роли (ElevenLabs eleven_v3, ru,
// тайминги букв). Голоса ролей — те же, что в первых двух фильмах.
// В синтез уходит только текст реплики (без номера, имени и указаний).
//
// voices.json → stage: "samples" — сначала только пробные реплики (samples),
// "all" — все 42 реплики. Пока голос роли не выбран, её реплики озвучиваются
// всеми кандидатами (trials: { роль: [голоса] }) — выбор по распознаванию.
//
// Языковая версия: --lang=ky (или A3_LANG=ky) — кыргызская (script-ky.ts,
// voices-ky.json, public/audio/lesson80-1-3-ky/); по умолчанию русская.
//
// Результат: public/audio/lesson80-1-3/raw/<ключ>.mp3 + <ключ>.json.
// Ключ — хэш текста, голоса, модели, настроек и seed: готовые дубли повторно
// не синтезируются. Файлы реплик и манифест собирает
// scripts/lesson80-1-3-build-voice.mjs (без обращения к API).
//
// Запуск: ELEVENLABS_API_KEY=... node scripts/lesson80-1-3-voice.mjs [--lang=ky]
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { a3Edition, a3LangFromArgs } from "../src/lesson80-1-3/edition.ts";

export const ED = a3Edition(a3LangFromArgs(process.argv, process.env));
const cfg = JSON.parse(readFileSync(ED.voices, "utf8"));
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
export const RAW = `public/${ED.voiceDir}/raw`;

// Страховочное слово в конце: модель договаривает последнее слово, затем
// оно вырезается по таймингам (как в первых двух фильмах).
export const PAD = ED.pad;

// lead — необязательное вводное слово перед репликой: синтез иначе может
// начать файл прямо с первого согласного и усечь его; вводное слово, как и
// страховочное, вырезается по таймингам и звуку при сборке.
export const takeKey = (text, tag, voiceId, seed, lead) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 1, text, tag: tag ?? null, voiceId, model: cfg.tts.modelId, lang: cfg.tts.languageCode, vs: cfg.tts.voiceSettings, seed, pad: PAD, ...(lead ? { lead } : {}) }))
    .digest("hex")
    .slice(0, 14);

// Список всех нужных дублей. segId = id реплики (80-1-3-001 …).
// withTrials — роли с кандидатами (trials) озвучиваются всеми кандидатами
// (для синтеза и распознавания); сборка берёт только голос роли (roles).
export const plan = (all = false, withTrials = true) => {
  const jobs = [];
  const only = !all && cfg.stage === "samples" ? new Set(cfg.samples) : null;
  for (const line of ED.lines) {
    if (only && !only.has(line.id)) continue;
    const text = line.spoken ?? line.text;
    const voices = withTrials && cfg.trials?.[line.role] ? cfg.trials[line.role] : [cfg.roles[line.role]];
    const takes = cfg.takesFor?.[line.id] ?? cfg.tts.takes;
    for (const v of voices) {
      for (let k = 0; k < takes; k++) {
        const seed = (line.seed ?? cfg.tts.seed) + k * 17;
        jobs.push({ segId: line.id, line: line.id, role: line.role, text, tag: line.tag ?? null, lead: line.lead ?? null, voice: v, seed, take: k, key: takeKey(text, line.tag, v.voiceId, seed, line.lead) });
      }
    }
  }
  return jobs;
};

const synth = async (job, withTag) => {
  const tag = withTag && job.tag ? `${job.tag} ` : "";
  const lead = job.lead ? `${job.lead} ` : "";
  const text = `${tag}${lead}${job.text} ${PAD}`;
  const res = await fetch(`${API}/v1/text-to-speech/${job.voice.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: cfg.tts.modelId,
      language_code: cfg.tts.languageCode,
      seed: job.seed,
      voice_settings: cfg.tts.voiceSettings,
      apply_text_normalization: "auto",
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return { audio: Buffer.from(data.audio_base64, "base64"), alignment: data.alignment, sent: text };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(RAW, { recursive: true });
  const jobs = plan();
  const missing = jobs.filter((j) => !existsSync(join(RAW, `${j.key}.mp3`)));
  console.log(`Версия: ${ED.lang}. Этап: ${cfg.stage ?? "all"}. Дублей: ${jobs.length}, нужно синтезировать: ${missing.length}`);
  if (missing.length && !apiKey) {
    console.log("ELEVENLABS_API_KEY не задан — синтез пропущен.");
    process.exit(0);
  }
  for (const job of missing) {
    console.log(`→ ${job.segId} [${job.role}: ${job.voice.name}] seed ${job.seed}: «${job.text}»`);
    let r = await synth(job, true);
    // тег интонации прозвучал вслух — повтор без тега
    const chars = r.alignment?.characters?.join("") ?? "";
    const at = chars.indexOf((job.lead ?? job.text).slice(0, 6));
    const start = at >= 0 ? r.alignment.character_start_times_seconds[at] : 0;
    let usedTag = Boolean(job.tag);
    if (job.tag && start > 0.9) {
      console.warn(`  ⚠ речь с ${start.toFixed(2)} с — тег, похоже, прозвучал; без тега`);
      r = await synth(job, false);
      usedTag = false;
    }
    writeFileSync(join(RAW, `${job.key}.mp3`), r.audio);
    writeFileSync(
      join(RAW, `${job.key}.json`),
      JSON.stringify({ segId: job.segId, line: job.line, role: job.role, voice: job.voice.name, voiceId: job.voice.voiceId, seed: job.seed, take: job.take, text: job.text, tag: usedTag ? job.tag : null, lead: job.lead ?? null, sent: r.sent, pad: PAD, alignment: r.alignment }) + "\n",
    );
  }
  console.log("Готово.");
}
