// Озвучка ролика 80-1-2 «Что спрятано в яблоке?» — синтез сырых дублей (CI).
//
// Тот же способ, что у первого фильма урока 1 (scripts/lesson01-voice.mjs):
// для каждой из 43 реплик синтезируется voices.json → tts.takes дублей
// голосом роли (ElevenLabs eleven_v3, ru, тайминги букв). Голоса ролей — те же,
// что в «Кто построил домик?». Групповой ответ «Аллах!» — по одному дублю
// каждым голосом из "group" (разные голоса, а не копии одного файла).
//
// Результат: public/audio/lesson80-1-2/raw/<ключ>.mp3 + <ключ>.json.
// Ключ — хэш текста, голоса, модели, настроек и seed: готовые дубли повторно
// не синтезируются. Файлы реплик и манифест собирает
// scripts/lesson80-1-2-build-voice.mjs (без обращения к API).
//
// Запуск: ELEVENLABS_API_KEY=... node scripts/lesson80-1-2-voice.mjs
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { A2_LINES } from "../src/lesson80-1-2/script.ts";

const cfg = JSON.parse(readFileSync("src/lesson80-1-2/voices.json", "utf8"));
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
export const RAW = "public/audio/lesson80-1-2/raw";

// Страховочное слово в конце: модель договаривает последнее слово, затем
// оно вырезается по таймингам (как в первом фильме).
export const PAD = "Хорошо.";

export const takeKey = (text, tag, voiceId, seed) =>
  createHash("sha1")
    .update(JSON.stringify({ v: 1, text, tag: tag ?? null, voiceId, model: cfg.tts.modelId, lang: cfg.tts.languageCode, vs: cfg.tts.voiceSettings, seed, pad: PAD }))
    .digest("hex")
    .slice(0, 14);

// Список всех нужных дублей. segId = id реплики (80-1-2-001 …).
export const plan = () => {
  const jobs = [];
  for (const line of A2_LINES) {
    const text = line.spoken ?? line.text;
    if (line.role === "kids") {
      cfg.group.forEach((v, gi) => {
        const seed = (line.seed ?? cfg.tts.seed) + gi;
        jobs.push({ segId: line.id, line: line.id, role: line.role, text, tag: null, voice: v, seed, take: gi, key: takeKey(text, null, v.voiceId, seed) });
      });
    } else {
      const v = cfg.roles[line.role];
      const takes = cfg.takesFor?.[line.id] ?? cfg.tts.takes;
      for (let k = 0; k < takes; k++) {
        const seed = (line.seed ?? cfg.tts.seed) + k * 17;
        jobs.push({ segId: line.id, line: line.id, role: line.role, text, tag: line.tag ?? null, voice: v, seed, take: k, key: takeKey(text, line.tag, v.voiceId, seed) });
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
  console.log(`Дублей: ${jobs.length}, нужно синтезировать: ${missing.length}`);
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
      JSON.stringify({ segId: job.segId, line: job.line, role: job.role, voice: job.voice.name, voiceId: job.voice.voiceId, seed: job.seed, take: job.take, text: job.text, tag: usedTag ? job.tag : null, sent: r.sent, pad: PAD, alignment: r.alignment }) + "\n",
    );
  }
  console.log("Готово.");
}
