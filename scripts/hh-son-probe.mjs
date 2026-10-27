// Второй раунд проб голоса сына (BalaGoHalfHour).
//  1) общая библиотека голосов ElevenLabs: есть ли доступ и голоса мальчика
//     (возраст young, «boy/kid/child») — с пробой, если голос можно озвучить;
//  2) стандартные голоса-кандидаты (HH_SON_PROBES.candidates).
// Каждый кандидат читает реплики сына и фразу на ө, ү, ң. Скорость речи не
// меняется, высота тона не сдвигается — только сам голос.
// Результат: voice-samples/half-hour/son-v2/*.mp3 и report.json (в Git, для
// прослушивания). Повторно не запускается, если настройки не изменились.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HH_SON_PROBES, HH_TTS } from "../src/half-hour/script.ts";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const OUT = "voice-samples/half-hour/son-v2";
mkdirSync(OUT, { recursive: true });
const cfgHash = createHash("sha1").update(JSON.stringify({ HH_SON_PROBES, HH_TTS, v: 1 })).digest("hex").slice(0, 16);
const reportPath = join(OUT, "report.json");
if (existsSync(reportPath) && JSON.parse(readFileSync(reportPath, "utf8")).cfgHash === cfgHash) {
  console.log("= пробы сына уже есть, повторно не создаются");
  process.exit(0);
}
const api = async (path, init = {}) => {
  const res = await fetch(`${API}${path}`, { ...init, headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) } });
  const text = res.ok ? null : (await res.text()).slice(0, 400);
  return { res, text };
};
const report = { cfgHash, library: [], samples: [] };

// 1. Общая библиотека голосов
const library = [];
for (const q of HH_SON_PROBES.librarySearch) {
  const { res, text } = await api(`/v1/shared-voices?page_size=20&search=${encodeURIComponent(q)}&age=young`);
  if (!res.ok) {
    report.library.push({ query: q, error: `${res.status} ${text}` });
    console.log(`Библиотека «${q}»: ${res.status}`);
    continue;
  }
  const data = await res.json();
  const voices = (data.voices ?? []).map((v) => ({
    name: v.name,
    voiceId: v.voice_id,
    ownerId: v.public_owner_id,
    gender: v.gender,
    age: v.age,
    accent: v.accent,
    language: v.language,
    useCase: v.use_case,
    description: (v.description ?? "").slice(0, 200),
  }));
  report.library.push({ query: q, count: voices.length, voices });
  console.log(`Библиотека «${q}»: ${voices.length}`);
  for (const v of voices) if (v.gender === "male" && !library.some((x) => x.voiceId === v.voiceId)) library.push(v);
}

// 2. Пробы
const synth = async (voice, text, file) => {
  const { res, text: err } = await api(`/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: HH_TTS.modelId,
      language_code: HH_TTS.languageCode,
      seed: HH_TTS.seed,
      voice_settings: HH_TTS.voiceSettings,
    }),
  });
  if (!res.ok) {
    report.samples.push({ voice: voice.name, voiceId: voice.voiceId, text, error: `${res.status} ${err}` });
    console.log(`  ✗ ${voice.name}: ${res.status}`);
    return false;
  }
  writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
  report.samples.push({ voice: voice.name, voiceId: voice.voiceId, source: voice.source ?? "premade", text, file });
  console.log(`  ✓ ${file}`);
  return true;
};
const slug = (s) => s.replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 24) || "voice";
const cands = [
  ...library.slice(0, 4).map((v) => ({ ...v, name: `lib-${slug(v.name)}`, source: "library" })),
  ...HH_SON_PROBES.candidates,
];
for (const v of cands) {
  for (let k = 0; k < HH_SON_PROBES.texts.length; k++) {
    const ok = await synth(v, HH_SON_PROBES.texts[k], `son-${v.name}-${k + 1}.mp3`);
    if (!ok) break; // голос недоступен — остальные фразы не пробуем
  }
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`+ ${reportPath}`);
