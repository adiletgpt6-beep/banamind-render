// Озвучка ролика 80-1-4 «Один Создатель» — синтез сырых дублей (CI).
//
// Тот же способ, что у первых трёх фильмов урока 1 (scripts/lesson01-voice.mjs,
// scripts/lesson80-1-2-voice.mjs, scripts/lesson80-1-3-voice.mjs): для каждой
// реплики синтезируется voices.json → tts.takes дублей голосом роли
// (ElevenLabs eleven_v3, ru, тайминги букв). Голоса ролей — те же, что в
// предыдущих фильмах. Групповой ответ «Один! Аллах!» — по одному дублю каждым
// голосом из "group" (разные голоса, а не копии одного файла).
// В синтез уходит только текст реплики (без номера, имени и указаний).
//
// voices.json → stage: "samples" — сначала только пробные реплики (samples),
// "all" — все 47 реплик.
//
// Результат: public/audio/lesson80-1-4/raw/<ключ>.mp3 + <ключ>.json.
// Ключ — хэш текста, голоса, модели, настроек и seed: готовые дубли повторно
// не синтезируются. Файлы реплик и манифест собирает
// scripts/lesson80-1-4-build-voice.mjs (без обращения к API).
//
// Запуск: ELEVENLABS_API_KEY=... node scripts/lesson80-1-4-voice.mjs [--lang=ky]
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PACK, VOICE_DIR } from "./lib/a4-lang.mjs";

// языковая версия: --lang=ky (кыргызская) — свои реплики, голоса и папка
const A4_LINES = PACK.lines;
const cfg = JSON.parse(readFileSync(PACK.voices, "utf8"));
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
export const RAW = `${VOICE_DIR}/raw`;

// Страховочное слово в конце: модель договаривает последнее слово, затем
// оно вырезается по таймингам (как в предыдущих фильмах).
export const PAD = PACK.pad;

export const takeKey = (text, tag, voiceId, seed) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 1, text, tag: tag ?? null, voiceId, model: cfg.tts.modelId, lang: cfg.tts.languageCode, vs: cfg.tts.voiceSettings, seed, pad: PAD }))
    .digest("hex")
    .slice(0, 14);

// Список всех нужных дублей. segId = id реплики (80-1-4-001 …).
// all = true — все реплики независимо от этапа (для сборки и проверок).
export const plan = (all = false) => {
  const jobs = [];
  const only = !all && cfg.stage === "samples" ? new Set(cfg.samples) : null;
  for (const line of A4_LINES) {
    if (only && !only.has(line.id)) continue;
    const text = line.spoken ?? line.text;
    if (line.role === "kids") {
      // по groupTakes дублей каждым голосом группы; take = номер голоса,
      // gtake = номер дубля этого голоса (выбор — groupPick в voices.json)
      cfg.group.forEach((v, gi) => {
        for (let k = 0; k < (cfg.groupTakes ?? 1); k++) {
          const seed = (line.seed ?? cfg.tts.seed) + gi + k * 17;
          jobs.push({ segId: line.id, line: line.id, role: line.role, text, tag: null, voice: v, seed, take: gi, gtake: k, key: takeKey(text, null, v.voiceId, seed) });
        }
      });
      continue;
    }
    const v = cfg.roles[line.role];
    const takes = cfg.takesFor?.[line.id] ?? cfg.tts.takes;
    for (let k = 0; k < takes; k++) {
      const seed = (line.seed ?? cfg.tts.seed) + k * 17;
      jobs.push({ segId: line.id, line: line.id, role: line.role, text, tag: line.tag ?? null, voice: v, seed, take: k, key: takeKey(text, line.tag, v.voiceId, seed) });
    }
    // сравнение голосов роли: те же реплики другим голосом (compare в voices.json);
    // такие дубли только распознаются и в фильм не идут (alt)
    for (const c of cfg.compare ?? []) {
      if (c.role !== line.role || !(cfg.compareLines ?? []).includes(line.id)) continue;
      for (let k = 0; k < (c.takes ?? 2); k++) {
        const seed = (line.seed ?? cfg.tts.seed) + k * 17;
        jobs.push({ segId: line.id, line: line.id, role: line.role, text, tag: line.tag ?? null, voice: c, seed, take: k, alt: c.name, key: takeKey(text, line.tag, c.voiceId, seed) });
      }
    }
  }
  return jobs;
};

const synth = async (job, withTag) => {
  const tag = withTag && job.tag ? `${job.tag} ` : "";
  const text = `${tag}${job.text} ${PAD}`;
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
  console.log(`Этап: ${cfg.stage ?? "all"}. Дублей: ${jobs.length}, нужно синтезировать: ${missing.length}`);
  if (missing.length && !apiKey) {
    console.log("ELEVENLABS_API_KEY не задан — синтез пропущен.");
    process.exit(0);
  }
  for (const job of missing) {
    console.log(`→ ${job.segId} [${job.role}: ${job.voice.name}] seed ${job.seed}: «${job.text}»`);
    let r = await synth(job, true);
    // тег интонации прозвучал вслух — повтор без тега
    const chars = r.alignment?.characters?.join("") ?? "";
    const at = chars.indexOf(job.text.slice(0, 6));
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
      JSON.stringify({ segId: job.segId, line: job.line, role: job.role, voice: job.voice.name, voiceId: job.voice.voiceId, seed: job.seed, take: job.take, gtake: job.gtake ?? null, text: job.text, tag: usedTag ? job.tag : null, sent: r.sent, pad: PAD, alignment: r.alignment }) + "\n",
    );
  }
  console.log("Готово.");
}
