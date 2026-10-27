// Пробы голосов BalaGoThirdBMeeting2D до синтеза всего объёма.
// Сначала оцениваются три места, которые задают впечатление о фильме:
// рассказчик (N01), вопрос клиента (C01, с C02–C03) и вопрос дочери (G02,
// с другими её репликами). Пробуются только сохранённые голоса проекта
// (T3B_PROBE_CANDIDATES) и для дочери — описания ВЗРОСЛЫХ голосов,
// которыми в анимации озвучивают школьниц (детские описания Voice Design
// сервис блокирует; фильтр не обходится, тон и темп не меняются).
//
// Этап 1 (нет pick.json): каждый кандидат читает текст роли → MP3 +
//   технический замер scripts/t3b_asr.py (CER MMS, F0, профиль голоса) →
//   voice-samples/third-b-meeting-2d/probe/report.json. Затем пробы
//   слушаются (слепая оценка без подсказки роли) и выбор пишется в pick.json.
// Этап 2 (pick.json): для выбранного превью Voice Design создаётся голос
//   аккаунта; report.json → picked[role] = { name, voiceId }.
// Повторно не запускается при той же конфигурации (хэш).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { T3B_LINES, T3B_PROBE_CANDIDATES } from "../src/third-b-meeting-2d/script.ts";
import { synthLine } from "./lib/t3b-tts.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const OUT = "voice-samples/third-b-meeting-2d/probe";
mkdirSync(OUT, { recursive: true });
const REPORT = join(OUT, "report.json");
const PICK = join(OUT, "pick.json");
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const L = (id) => T3B_LINES.find((x) => x.id === id);
const say = (id) => L(id).spoken ?? L(id).text;

// Тексты проб — реплики сценария (без тегов и ремарок).
const TEXTS = {
  narrator: say("N01"),
  client: `${say("C01")} ${say("C02")} ${say("C03")}`,
  // Voice Design требует ≥ 100 знаков: перед репликами дочери — две простые
  // фразы о рисунке в том же разговорном регистре.
  daughter: `Апа, бүгүн сабакта көрнөк тарттык. Мына, карачы, бул биздин класс. ${say("G02")} ${say("G03")} ${say("G01")}`,
};
const STUDIO = "Clear close-mic studio recording, no background noise, natural relaxed conversational pace, not theatrical, not announcer-like.";
const KG = "A native speaker of the Kyrgyz language with authentic Kyrgyz pronunciation.";
const DESIGNS = [
  { id: "g1", description: `A petite young Kyrgyz woman with a light, clear, bright natural voice and a small youthful sound. ${KG} Simple, sincere, curious delivery; no breathiness, no sultry or mature tone, not motherly. ${STUDIO}` },
  { id: "g2", description: `A Kyrgyz voice actress with a light, youthful, slightly thin mezzo voice who voices young cartoon heroines. ${KG} Gentle, curious, plain everyday speech, no singing quality, no squeak, not mature. ${STUDIO}` },
];

const pick = readJson(PICK, null);
const config = { v: 1, TEXTS, DESIGNS, CANDIDATES: T3B_PROBE_CANDIDATES, pick };
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = readJson(REPORT, null);
if (prev?.hash === hash && prev.done) {
  console.log("= пробы голосов уже сделаны (report.json)");
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

// Этап 2: выбор → голоса аккаунта (для превью Voice Design).
if (pick && prev?.previews?.length) {
  prev.picked = prev.picked ?? {};
  for (const [role, sel] of Object.entries(pick)) {
    if (sel.voiceId) {
      prev.picked[role] = { name: sel.name, voiceId: sel.voiceId, file: sel.file ?? null, reason: sel.reason ?? "" };
      continue;
    }
    const p = prev.previews.find((x) => x.generatedVoiceId === sel.generatedVoiceId);
    if (!p) throw new Error(`pick.json: превью ${role} не найдено в report.json`);
    if (prev.picked[role]?.generatedVoiceId === sel.generatedVoiceId) continue;
    const name = `KG-girl ${p.file.replace(".mp3", "")}`;
    const r = await call("POST", "/v1/text-to-voice", { voice_name: name, voice_description: p.description, generated_voice_id: p.generatedVoiceId });
    prev.picked[role] = { name, voiceId: r.voice_id, generatedVoiceId: p.generatedVoiceId, file: p.file, reason: sel.reason ?? "" };
    console.log(`✓ голос ${role} создан: ${r.voice_id} (${p.file})`);
  }
  prev.hash = hash;
  prev.done = true;
  writeJson(REPORT, prev);
  process.exit(0);
}

// Этап 1: пробы.
const report = { hash, done: false, texts: TEXTS, previews: [], errors: [] };
for (const [role, list] of Object.entries(T3B_PROBE_CANDIDATES)) {
  for (const v of list) {
    const file = `${role}-${v.name}.mp3`;
    const line = { id: `probe-${role}`, role, text: TEXTS[role], call: role === "client" };
    try {
      await synthLine(apiKey, line, v, join(OUT, file), 231);
      report.previews.push({ file, role, source: "saved", name: v.name, from: v.from, voiceId: v.voiceId });
    } catch (e) {
      report.errors.push({ file, error: e.message });
      console.warn(`  ⚠ ${file}: ${e.message}`);
    }
  }
}
for (const d of DESIGNS) {
  try {
    const data = await call("POST", "/v1/text-to-voice/design", { voice_description: d.description, model_id: "eleven_ttv_v3", text: TEXTS.daughter, auto_generate_text: false });
    for (const [i, p] of (data.previews ?? []).entries()) {
      const file = `daughter-${d.id}-${i + 1}.mp3`;
      writeFileSync(join(OUT, file), Buffer.from(p.audio_base_64, "base64"));
      report.previews.push({ file, role: "daughter", source: "design", design: d.id, description: d.description, generatedVoiceId: p.generated_voice_id });
    }
    console.log(`✓ ${d.id}: ${(data.previews ?? []).length} превью`);
  } catch (e) {
    report.errors.push({ id: d.id, error: e.message });
    console.warn(`  ⚠ ${d.id}: ${e.message}`);
  }
}
// технический замер: CER (MMS), F0, профиль — не прослушивание
if (report.previews.length) {
  const inp = join(OUT, "score-in.json");
  const out = join(OUT, "score-out.json");
  writeJson(inp, report.previews.map((p) => ({ path: join(OUT, p.file), text: TEXTS[p.role] })));
  try {
    execFileSync("python3", ["scripts/t3b_asr.py", "--score", inp, out], { stdio: "inherit" });
    const m = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
    for (const p of report.previews) {
      const r = m.get(join(OUT, p.file));
      Object.assign(p, { cer: r?.cer ?? null, f0: r?.f0 ?? null, profile: r?.profile ?? null, heard: r?.heard ?? null });
    }
  } catch (e) {
    console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
  }
}
report.done = true;
writeJson(REPORT, report);
for (const p of report.previews) console.log(`  ${p.file}: CER ${p.cer}, F0 ${p.f0}, ${JSON.stringify(p.profile)}`);
