// «Лаборатория голоса»: подбор голоса ElevenLabs до полной генерации.
// Запускается в CI, если в корне есть voice-lab.json.
//
// Что делает:
//  1. Печатает модели (поддержку кыргызского у eleven_v3), голоса аккаунта
//     и мужские голоса из библиотеки ElevenLabs с языком ky.
//  2. Для каждого кандидата синтезирует короткую тестовую реплику
//     (с меткой «with-timestamps»), распознаёт её обратно (Speech-to-Text,
//     scribe_v2, язык ky) и считает CER — долю ошибочных символов.
//     Низкий CER = слова произнесены разборчиво (косвенная проверка
//     произношения ү, ө, ң и «БалаГо»).
//  3. Сохраняет сэмплы и отчёт в public/audio/voice-lab/ (artifact CI).
// Скрипт только читает списки и синтезирует речь — аккаунт не меняет.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — лаборатория голоса пропущена.");
  process.exit(0);
}
const API =
  process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const labText = readFileSync("voice-lab.json", "utf8");
const lab = JSON.parse(labText);
// "enabled": false — пробы уже сделаны (или кредиты нужны для основной
// озвучки): лаборатория ничего не синтезирует.
if (lab.enabled === false) {
  console.log("Лаборатория голоса выключена (enabled: false) — пропуск.");
  process.exit(0);
}
// Папка для сэмплов: outDir из voice-lab.json (например, пробы голосов
// пятого ролика сохраняются в Git) или временная public/audio/voice-lab.
const OUT = lab.outDir ?? "public/audio/voice-lab";
mkdirSync(OUT, { recursive: true });
// Те же настройки уже озвучены (отчёт сохранён) — повторно не синтезируем.
const configHash = createHash("sha1")
  .update(labText)
  .digest("hex")
  .slice(0, 16);
const reportPath = join(OUT, "report.json");
if (existsSync(reportPath)) {
  const prev = JSON.parse(readFileSync(reportPath, "utf8"));
  if (prev.configHash === configHash) {
    console.log(`= пробы голосов уже есть (${OUT}), повторно не создаются`);
    process.exit(0);
  }
}

const api = async (path, init = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(
      `${init.method ?? "GET"} ${path} → ${res.status}: ${body.slice(0, 300)}`,
    );
    err.status = res.status;
    throw err;
  }
  return res;
};

const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a, b) => {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length];
};

const report = {
  configHash,
  models: null,
  accountVoices: [],
  sharedVoices: [],
  samples: [],
};

// 1. Модели
try {
  const models = await (await api("/v1/models")).json();
  report.models = models
    .filter((m) => /v3|multilingual|flash/.test(m.model_id))
    .map((m) => ({
      id: m.model_id,
      ky: (m.languages ?? []).some((l) => /^(ky|kir)/i.test(l.language_id)),
      languages: (m.languages ?? []).length,
    }));
  console.log("Модели:", JSON.stringify(report.models));
} catch (e) {
  console.log("Модели: ошибка", e.message);
}

// 2. Голоса аккаунта
try {
  const { voices } = await (await api("/v1/voices")).json();
  report.accountVoices = voices.map((v) => ({
    id: v.voice_id,
    name: v.name,
    category: v.category,
    labels: v.labels,
  }));
  console.log("Голоса аккаунта:");
  for (const v of report.accountVoices) {
    console.log(
      `  ${v.id}  ${v.name}  [${v.category}] ${JSON.stringify(v.labels ?? {})}`,
    );
  }
} catch (e) {
  console.log("Голоса аккаунта: ошибка", e.message);
}

// 3. Библиотека: мужские голоса с кыргызским
for (const language of lab.sharedLanguages ?? ["ky"]) {
  try {
    const q = new URLSearchParams({
      page_size: "30",
      gender: "male",
      language,
      sort: "usage_character_count_1y",
    });
    const data = await (await api(`/v1/shared-voices?${q}`)).json();
    console.log(`Библиотека (${language}, male): ${data.voices.length}`);
    for (const v of data.voices) {
      const item = {
        language,
        id: v.voice_id,
        owner: v.public_owner_id,
        name: v.name,
        accent: v.accent,
        age: v.age,
        locale: v.locale,
        useCase: v.use_case,
        descriptive: v.descriptive,
        usage1y: v.usage_character_count_1y,
        clonedBy: v.cloned_by_count,
        free: v.free_users_allowed,
        description: (v.description ?? "").slice(0, 120),
      };
      report.sharedVoices.push(item);
      console.log(
        `  ${item.id} owner=${item.owner} «${item.name}» ${item.age ?? ""} ${item.accent ?? ""} ${item.locale ?? ""} ` +
          `${item.useCase ?? ""}/${item.descriptive ?? ""} usage=${item.usage1y} clones=${item.clonedBy} — ${item.description}`,
      );
    }
  } catch (e) {
    console.log(`Библиотека (${language}): ошибка`, e.message);
  }
}

// 4. Тестовые реплики + распознавание
const stt = async (mp3) => {
  const form = new FormData();
  form.append("model_id", "scribe_v2");
  form.append("language_code", "ky");
  form.append("tag_audio_events", "false");
  form.append("file", new Blob([mp3], { type: "audio/mpeg" }), "sample.mp3");
  const data = await (
    await api("/v1/speech-to-text", { method: "POST", body: form })
  ).json();
  return data.text ?? "";
};

for (const c of lab.candidates ?? []) {
  for (const variant of lab.variants ?? [{ id: "base" }]) {
    const tag = `${c.name}-${variant.id}`.replace(/[^\w-]/g, "_");
    const text = variant.text ?? lab.sampleText;
    try {
      const body = {
        text,
        model_id: variant.model ?? lab.model ?? "eleven_v3",
        language_code: "ky",
        seed: lab.seed ?? 7,
        voice_settings: {
          ...(lab.voiceSettings ?? {}),
          ...(variant.voiceSettings ?? {}),
        },
      };
      const res = await api(
        `/v1/text-to-speech/${c.id}/with-timestamps?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      const mp3 = Buffer.from(data.audio_base64, "base64");
      writeFileSync(join(OUT, `${tag}.mp3`), mp3);
      const ends = data.alignment?.character_end_times_seconds ?? [];
      const duration = ends.length ? ends[ends.length - 1] : null;
      const heard = await stt(mp3);
      const ref = normalize(text);
      const hyp = normalize(heard);
      const cer = ref.length ? levenshtein(ref, hyp) / ref.length : 1;
      const row = {
        tag,
        voiceId: c.id,
        duration,
        cer: Number(cer.toFixed(3)),
        heard,
      };
      report.samples.push(row);
      console.log(
        `● ${tag}: ${duration?.toFixed(2)} с, CER ${(cer * 100).toFixed(1)}%\n    услышано: ${heard}`,
      );
    } catch (e) {
      console.log(`● ${tag}: ошибка ${e.message}`);
      report.samples.push({ tag, voiceId: c.id, error: e.message });
    }
  }
}

writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`+ ${reportPath}`);
