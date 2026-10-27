// Пробы голосов восьмого ролика (BalaGoHalfHour) до основной озвучки.
//  1) какие модели ElevenLabs поддерживают кыргызский (ky);
//  2) Voice Design: голос мальчика (если ключ это разрешает);
//  3) короткие пробы реплик мамы и сына каждым кандидатом.
// Результат: voice-samples/half-hour/*.mp3 и report.json (сохраняются в Git
// для прослушивания). Повторно не запускается, если настройки не изменились.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HH_PROBES, HH_TTS, HH_VOICES } from "../src/half-hour/script.ts";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const OUT = "voice-samples/half-hour";
mkdirSync(OUT, { recursive: true });
const cfgHash = createHash("sha1")
  .update(JSON.stringify({ HH_PROBES, HH_TTS, m: HH_VOICES.mother, s: HH_VOICES.son, v: 2 }))
  .digest("hex")
  .slice(0, 16);
const reportPath = join(OUT, "report.json");
if (existsSync(reportPath) && JSON.parse(readFileSync(reportPath, "utf8")).cfgHash === cfgHash) {
  console.log("= пробы уже есть, повторно не создаются");
  process.exit(0);
}

const api = async (path, init = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) },
  });
  const text = res.ok ? null : (await res.text()).slice(0, 400);
  return { res, text };
};
const report = { cfgHash, models: null, design: null, samples: [] };

// 1. Модели с кыргызским
{
  const { res, text } = await api("/v1/models");
  if (res.ok) {
    const models = await res.json();
    report.models = models.map((m) => ({
      id: m.model_id,
      ky: (m.languages ?? []).some((l) => /^(ky|kir)/i.test(l.language_id)),
      tts: m.can_do_text_to_speech,
    }));
    console.log("Модели с ky:", report.models.filter((m) => m.ky).map((m) => m.id).join(", ") || "нет");
  } else {
    report.models = { error: `${res.status} ${text}` };
    console.log("Модели: ошибка", res.status);
  }
}

// 2. Voice Design: голос мальчика
const designed = [];
{
  const body = {
    voice_description: HH_PROBES.sonDesign,
    text: "Апа, сабак бүттү. Мен мектептин алдында күтүп турам. Апа, эмне үчүн сен дайыма эң акыркы келесиң? Мейли, эчтеке эмес.",
    model_id: "eleven_ttv_v3",
    loudness: 0.5,
    guidance_scale: 5,
    seed: 11,
  };
  const { res, text } = await api("/v1/text-to-voice/design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    const data = await res.json();
    const prev = data.previews ?? [];
    report.design = { ok: true, previews: [] };
    for (let i = 0; i < prev.length; i++) {
      const p = prev[i];
      const file = `son-design-${i + 1}.mp3`;
      writeFileSync(join(OUT, file), Buffer.from(p.audio_base_64, "base64"));
      report.design.previews.push({ file, generatedVoiceId: p.generated_voice_id });
      // сохранить голос в аккаунте (нужно для синтеза реплик)
      const c = await api("/v1/text-to-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_name: `BalaGo son ${i + 1}`,
          voice_description: HH_PROBES.sonDesign,
          generated_voice_id: p.generated_voice_id,
        }),
      });
      if (c.res.ok) {
        const v = await c.res.json();
        report.design.previews[i].voiceId = v.voice_id;
        designed.push({ name: `Designed son ${i + 1}`, voiceId: v.voice_id });
      } else {
        report.design.previews[i].createError = `${c.res.status} ${c.text}`;
      }
      if (designed.length >= 2) break;
    }
    console.log(`Voice Design: превью ${prev.length}, сохранено голосов ${designed.length}`);
  } else {
    report.design = { ok: false, error: `${res.status} ${text}` };
    console.log("Voice Design недоступен:", res.status);
  }
}

// 3. Пробы реплик
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
    return;
  }
  writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
  report.samples.push({ voice: voice.name, voiceId: voice.voiceId, text, file });
  console.log(`  ✓ ${file}`);
};
for (const v of HH_VOICES.mother.candidates) {
  for (let k = 0; k < HH_PROBES.mother.length; k++)
    await synth(v, HH_PROBES.mother[k], `mother-${v.name}-${k + 1}.mp3`);
}
for (const v of [...designed, ...HH_VOICES.son.candidates]) {
  for (let k = 0; k < HH_PROBES.son.length; k++)
    await synth(v, HH_PROBES.son[k], `son-${v.name.replace(/\s+/g, "")}-${k + 1}.mp3`);
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`+ ${reportPath}`);
