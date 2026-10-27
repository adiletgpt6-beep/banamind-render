// Подбор голоса дочки (≈ 8–9 лет) для BalaGoTwoSundays2D.
//
// Прежний KG-daughter (AeboPz5CtE7qRUVvW93b) не берётся автоматически: при
// слепом прослушивании его реплики из №12 оцениваются то как ребёнок, то
// как подросток или взрослая женщина. Детские описания Voice Design сервис
// блокирует (опыт №20, №22) — такие запросы не повторяются и фильтр не
// обходится. Здесь пробуются:
//   • base  — сам KG-daughter (eleven_v3) на тексте проб — для сравнения;
//   • g1–g3 — описания ВЗРОСЛЫХ актрис озвучания, которыми в анимации
//             озвучивают девочек (лёгкий высокий голос, простая речь);
//   • remix — ремикс KG-daughter в сторону более лёгкого и простого тембра.
// Темп и высота тона не меняются (без питч-шифта и ускорения).
//
// Этап 1 (нет girl-pick.json): превью читают реплики D01–D03 → MP3 + оценка
//   scripts/su2d_asr.py (CER, F0, профиль) → report.json. Превью затем
//   слушаются (слепое прослушивание, docs/two-sundays-2d.md).
// Этап 2 (girl-pick.json): выбранное превью Voice Design → голос аккаунта;
//   либо {"voiceId": …} — готовый голос (например, KG-daughter).
// Повторно не запускается при той же конфигурации (хэш).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SU2_LINES, SU2_TTS } from "../src/two-sundays-2d/script.ts";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голоса дочки пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const OUT = "voice-samples/two-sundays-2d/girl-probe";
mkdirSync(OUT, { recursive: true });
const REPORT = join(OUT, "report.json");
const PICK = join(OUT, "girl-pick.json");
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");

// Текст проб — реплики дочки из сценария (D01–D03), как они уходят в TTS.
const TEXT = SU2_LINES.filter((l) => l.role === "daughter")
  .map((l) => l.spoken ?? l.text)
  .join(" ");
const BASE = { name: "KG-daughter", voiceId: "AeboPz5CtE7qRUVvW93b" };
const STUDIO = "Clear close-mic studio recording, no background noise, natural conversational pace, not theatrical.";
const KG = "A native speaker of the Kyrgyz language with an authentic Kyrgyz accent.";
const DESIGNS = [
  { id: "g1", description: `A Kyrgyz voice actress with a light, bright, high and clear voice who voices young cartoon heroines. ${KG} Simple, sincere, slightly playful delivery with short everyday sentences; no breathiness, no sultry or mature tone. ${STUDIO}` },
  { id: "g2", description: `A petite young Kyrgyz woman with a small, thin, high-pitched voice and a gentle, curious way of speaking. ${KG} Plain and direct, warm but not motherly, no vocal fry, no singing quality. ${STUDIO}` },
  { id: "g3", description: `A Kyrgyz dubbing actress known for lively animated characters, with a light airy soprano and a quick, bright, unpolished delivery. ${KG} Sounds natural and unaffected, not a news presenter, not seductive. ${STUDIO}` },
  // Раунд 2 (g1, g2 и ремикс фильтр сервиса заблокировал; g3-1 — лучший по
  // слепому прослушиванию, но звучит как подросток): варианты описания g3.
  { id: "g4", description: `A Kyrgyz dubbing actress known for voicing small animated characters, with a very light, high, airy soprano and a quick, bright, unpolished delivery. ${KG} Sounds natural and unaffected, not a news presenter, not seductive. ${STUDIO}` },
  { id: "g5", description: `A Kyrgyz dubbing actress known for lively animated characters, with a high, thin, clear head voice and a playful, curious, energetic delivery. ${KG} Sounds natural and unaffected, not a news presenter, not seductive. ${STUDIO}` },
  { id: "g6", description: `A Kyrgyz dubbing actress known for lively animated characters, with a light airy soprano and a quick, bright, unpolished delivery. ${KG} Sounds natural and unaffected, not a news presenter, not seductive. ${STUDIO} Take two.` },
];
const REMIX = {
  base: BASE,
  description: "Make the voice lighter, thinner and brighter, with simpler and more direct delivery; less mature, less polished and less like a grown woman. Keep the native Kyrgyz accent and clear diction.",
};

const pick = readJson(PICK, null);
const config = { v: 1, TEXT, DESIGNS, REMIX, pick: pick?.generatedVoiceId ?? pick?.voiceId ?? null };
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = readJson(REPORT, null);
if (prev?.hash === hash && prev.done) {
  console.log("= пробы голоса дочки уже сделаны (report.json)");
  process.exit(0);
}

const call = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "xi-api-key": apiKey, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path.split("?")[0]}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
};

// Этап 2: выбор.
if (pick && prev?.previews?.length) {
  if (pick.voiceId) {
    prev.picked = { voiceId: pick.voiceId, name: pick.name ?? "KG-daughter", file: pick.file ?? null, reason: pick.reason ?? "" };
  } else {
    const p = prev.previews.find((x) => x.generatedVoiceId === pick.generatedVoiceId);
    if (!p) throw new Error("girl-pick.json: превью не найдено в report.json");
    if (prev.picked?.generatedVoiceId !== pick.generatedVoiceId) {
      const name = `KG-girl ${p.file.replace(".mp3", "")}`;
      const r = await call("POST", "/v1/text-to-voice", { voice_name: name, voice_description: p.description, generated_voice_id: p.generatedVoiceId });
      prev.picked = { generatedVoiceId: p.generatedVoiceId, voiceId: r.voice_id, name, file: p.file, reason: pick.reason ?? "" };
      console.log(`✓ голос дочки создан: ${r.voice_id} (${p.file})`);
    }
  }
  prev.hash = hash;
  prev.done = true;
  writeJson(REPORT, prev);
  process.exit(0);
}

// Этап 1: превью. Уже сделанные пробы (тот же текст) сохраняются, новые
// описания добавляются — платные запросы не повторяются.
const same = prev?.text === TEXT;
const report = { hash, done: false, text: TEXT, previews: same ? prev.previews : [], errors: same ? (prev.errors ?? []) : [] };
const have = new Set(report.previews.map((p) => p.design));
const tried = new Set(report.errors.map((e) => e.id));
const keep = (id, description, data, source) => {
  for (const [i, p] of (data.previews ?? []).entries()) {
    const file = `${id}-${i + 1}.mp3`;
    writeFileSync(join(OUT, file), Buffer.from(p.audio_base_64, "base64"));
    report.previews.push({ file, design: id, source, description, generatedVoiceId: p.generated_voice_id });
  }
  console.log(`✓ ${id}: ${(data.previews ?? []).length} превью`);
};
// base: тот же текст голосом KG-daughter (eleven_v3)
for (const k of have.has("base") ? [] : [0, 1]) {
  try {
    const res = await fetch(`${API}/v1/text-to-speech/${BASE.voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text: TEXT, model_id: SU2_TTS.modelId, language_code: SU2_TTS.languageCode, seed: SU2_TTS.seed + k * 11, voice_settings: SU2_TTS.voiceSettings }),
    });
    if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
    const file = `base-${k + 1}.mp3`;
    writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
    report.previews.push({ file, design: "base", source: "existing", description: BASE.name, voiceId: BASE.voiceId });
    console.log(`✓ base-${k + 1}`);
  } catch (e) {
    report.errors.push({ id: "base", error: e.message });
    console.warn(`  ⚠ base: ${e.message}`);
  }
}
for (const d of DESIGNS.filter((x) => !have.has(x.id) && !tried.has(x.id))) {
  try {
    keep(d.id, d.description, await call("POST", "/v1/text-to-voice/design", { voice_description: d.description, model_id: "eleven_ttv_v3", text: TEXT, auto_generate_text: false }), "design");
  } catch (e) {
    report.errors.push({ id: d.id, error: e.message });
    console.warn(`  ⚠ ${d.id}: ${e.message}`);
  }
}
if (!have.has("remix") && !tried.has("remix")) try {
  keep("remix", REMIX.description, await call("POST", `/v1/text-to-voice/${REMIX.base.voiceId}/remix`, { voice_description: REMIX.description, text: TEXT, auto_generate_text: false }), "remix");
} catch (e) {
  report.errors.push({ id: "remix", error: e.message });
  console.warn(`  ⚠ remix: ${e.message}`);
}
// оценка: CER (MMS), F0, профиль — технический замер, не прослушивание
if (report.previews.length) {
  const inp = join(OUT, "score-in.json");
  const out = join(OUT, "score-out.json");
  writeJson(inp, report.previews.filter((p) => p.cer === undefined).map((p) => ({ path: join(OUT, p.file), text: TEXT })));
  try {
    execFileSync("python3", ["scripts/su2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    const m = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
    for (const p of report.previews) {
      const r = m.get(join(OUT, p.file));
      if (r) Object.assign(p, { cer: r.cer ?? null, f0: r.f0 ?? null, profile: r.profile ?? null, heard: r.heard ?? null });
    }
  } catch (e) {
    console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
  }
}
report.done = true;
writeJson(REPORT, report);
for (const p of report.previews) console.log(`  ${p.file}: CER ${p.cer}, F0 ${p.f0}, ${JSON.stringify(p.profile)}`);
