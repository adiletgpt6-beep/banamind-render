// Лаборатория голосов «Урок 1. Кто построил домик?» (Lesson01WhoBuiltTheHouse).
//
// Запускается в CI до полной озвучки, если в src/lesson01/voices.json
// "lab": true. Нужен ELEVENLABS_API_KEY (секрет репозитория).
//
//  1. Сохраняет список голосов аккаунта (имя, id, метки) — без секретов.
//  2. Ищет в библиотеке ElevenLabs подходящие голоса (русский язык; мужчина
//     30–35 лет; мальчики) и скачивает их короткие превью.
//  3. Озвучивает короткие русские фразы из сценария голосами аккаунта и
//     голосами-кандидатами (eleven_v3, ru) — чтобы сравнить тембр и возраст.
//  4. Пробует Voice Design (только превью, голос в аккаунте не создаётся).
//
// Всё складывается в public/audio/lesson01/lab/ (CI сохраняет в ветку).
// Скрипт не меняет аккаунт и тариф: только читает списки и синтезирует.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const cfgText = readFileSync("src/lesson01/voices.json", "utf8");
const cfg = JSON.parse(cfgText);
if (!cfg.lab) {
  console.log("Лаборатория голосов выключена (lab: false).");
  process.exit(0);
}
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — лаборатория пропущена.");
  process.exit(0);
}
const OUT = "public/audio/lesson01/lab";
mkdirSync(join(OUT, "samples"), { recursive: true });
mkdirSync(join(OUT, "previews"), { recursive: true });
mkdirSync(join(OUT, "design"), { recursive: true });
const labHash = createHash("sha1").update(JSON.stringify(cfg.labPlan ?? {})).digest("hex").slice(0, 12);
const reportPath = join(OUT, "report.json");
if (existsSync(reportPath) && JSON.parse(readFileSync(reportPath, "utf8")).labHash === labHash) {
  console.log("= пробы для этого плана уже есть — пропуск");
  process.exit(0);
}

const api = async (path, init = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const err = new Error(`${init.method ?? "GET"} ${path.split("?")[0]} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res;
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9а-яё]+/giu, "-").replace(/^-|-$/g, "").slice(0, 40);
const report = { labHash, account: [], shared: [], samples: [], design: [], errors: [] };
const note = (e) => {
  console.warn(`  ⚠ ${e.message}`);
  report.errors.push(e.message);
};

// 0. Остаток кредитов (только числа)
try {
  const s = await (await api("/v1/user/subscription")).json();
  report.credits = { tier: s.tier, used: s.character_count, limit: s.character_limit, voiceSlotsUsed: s.voice_slots_used, voiceLimit: s.voice_limit };
  console.log(`Кредиты: ${s.character_count}/${s.character_limit}, голосов ${s.voice_slots_used}/${s.voice_limit}`);
} catch (e) {
  note(e);
}

// 1. Голоса аккаунта
if (cfg.labPlan.accountVoices.length) try {
  const { voices } = await (await api("/v2/voices?page_size=100")).json();
  report.account = voices.map((v) => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels, description: v.description?.slice(0, 200) ?? null }));
  console.log(`Голосов в аккаунте: ${voices.length}`);
  for (const v of report.account) console.log(`  · ${v.name} (${v.category}) ${JSON.stringify(v.labels)}`);
} catch (e) {
  note(e);
}

// 2. Библиотека
const seen = new Map();
for (const q of cfg.labPlan.sharedQueries) {
  try {
    const params = new URLSearchParams({ page_size: "30", ...q });
    const data = await (await api(`/v1/shared-voices?${params}`)).json();
    for (const v of data.voices ?? []) {
      if (seen.has(v.voice_id)) continue;
      seen.set(v.voice_id, {
        query: q,
        id: v.voice_id,
        owner: v.public_owner_id,
        name: v.name,
        gender: v.gender,
        age: v.age,
        accent: v.accent,
        language: v.language,
        useCase: v.use_case,
        descriptive: v.descriptive,
        description: v.description?.slice(0, 300) ?? null,
        clonedBy: v.cloned_by_count,
        freeUsersAllowed: v.free_users_allowed,
        previewUrl: v.preview_url,
        ruPreview: (v.verified_languages ?? []).find((l) => l.language === "ru")?.preview_url ?? null,
      });
    }
    console.log(`Библиотека ${JSON.stringify(q)}: ${data.voices?.length ?? 0}`);
  } catch (e) {
    note(e);
  }
}
report.shared = [...seen.values()];
let n = 0;
for (const v of report.shared) {
  const url = v.ruPreview ?? v.previewUrl;
  if (!url || n >= cfg.labPlan.maxPreviews) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`preview ${res.status}`);
    const file = join(OUT, "previews", `${String(n).padStart(2, "0")}-${slug(v.name)}.mp3`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    v.previewFile = file;
    n++;
  } catch (e) {
    note(new Error(`${v.name}: ${e.message}`));
  }
}

// 3. Пробы русской речи
const tts = async (voiceId, text) => {
  const res = await api(`/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_v3", language_code: "ru", seed: 7, voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
  });
  return Buffer.from(await res.arrayBuffer());
};
const want = [
  ...(cfg.labPlan.knownVoices ?? []).map((v) => ({ ...v, src: "known" })),
  ...report.account.filter((v) => cfg.labPlan.accountVoices.includes(v.name) || cfg.labPlan.accountVoices.includes("*")).map((v) => ({ ...v, src: "account" })),
  ...report.shared.filter((v) => cfg.labPlan.sharedForSamples === "all" || (cfg.labPlan.sharedForSamples ?? []).includes(v.name)).slice(0, cfg.labPlan.maxSharedSamples).map((v) => ({ ...v, src: "shared" })),
];
for (const v of want) {
  for (const [role, text] of Object.entries(cfg.labPlan.texts)) {
    if (v.src === "known" && v.roles && !v.roles.includes(role)) continue;
    const file = join(OUT, "samples", `${v.src}-${slug(v.name)}-${role}.mp3`);
    try {
      writeFileSync(file, await tts(v.id, text));
      report.samples.push({ src: v.src, name: v.name, id: v.id, role, text, file });
      console.log(`  ✓ ${file}`);
    } catch (e) {
      note(new Error(`${v.name}/${role}: ${e.message}`));
      if (e.status && e.status !== 429 && v.src === "shared") break;
    }
  }
}

// 3б. Сохранение выбранного превью Voice Design как голоса аккаунта
report.saved = [];
for (const d of cfg.labPlan.saveDesign ?? []) {
  try {
    const v = await (
      await api("/v1/text-to-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_name: d.name, voice_description: d.description, generated_voice_id: d.generatedVoiceId }),
      })
    ).json();
    report.saved.push({ name: d.name, voiceId: v.voice_id });
    console.log(`  ✓ сохранён голос ${d.name}: ${v.voice_id}`);
    const file = join(OUT, "samples", `saved-${slug(d.name)}-teacher.mp3`);
    writeFileSync(file, await tts(v.voice_id, cfg.labPlan.texts.teacher));
    report.samples.push({ src: "saved", name: d.name, id: v.voice_id, role: "teacher", file });
  } catch (e) {
    note(new Error(`save ${d.name}: ${e.message}`));
  }
}

// 4. Voice Design — только превью
for (const d of cfg.labPlan.design ?? []) {
  try {
    let data;
    try {
      data = await (
        await api("/v1/text-to-voice/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voice_description: d.description, text: d.text, model_id: "eleven_ttv_v3" }),
        })
      ).json();
    } catch (e) {
      if (e.status !== 404 && e.status !== 405) throw e;
      data = await (
        await api("/v1/text-to-voice/create-previews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voice_description: d.description, text: d.text }),
        })
      ).json();
    }
    (data.previews ?? []).forEach((p, i) => {
      const file = join(OUT, "design", `${d.id}-${i}.mp3`);
      writeFileSync(file, Buffer.from(p.audio_base_64, "base64"));
      report.design.push({ id: d.id, i, description: d.description, generatedVoiceId: p.generated_voice_id, file });
      console.log(`  ✓ design ${file}`);
    });
  } catch (e) {
    note(new Error(`design ${d.id}: ${e.message}`));
  }
}

writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`Отчёт: ${reportPath}; проб ${report.samples.length}, превью ${n}, design ${report.design.length}, ошибок ${report.errors.length}`);
