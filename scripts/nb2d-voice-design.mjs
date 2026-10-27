// Пробы голосов BalaGoNoBackup2D (мама, папа, дочка) через ElevenLabs
// Voice Design и выбор голоса по техническим замерам.
//
// 1. Для каждой роли (NB2_DESIGN в src/no-backup-2d/script.ts) — варианты
//    голоса с короткой пробой на кыргызском → design/<роль>-<n>.mp3.
//    Повторно не запускается, пока не изменились описание и текст.
// 2. Каждый вариант распознаётся моделью Meta MMS (scripts/nb2d_asr.py):
//    доля ошибок по буквам (CER) и медиана основного тона (F0).
// 3. Технический выбор: разборчивость и подходящий диапазон голоса.
//    Детский голос не выбирается по максимальной высоте. Итоговые пробы
//    требуют прослушивания человеком; измерения не оценивают актёрскую игру.
// 4. Выбранный вариант сохраняется как голос аккаунта → design/voices.json.
//
// Это технический выбор, а не прослушивание. Нужен ELEVENLABS_API_KEY
// (секрет GitHub); ключ не печатается и не сохраняется.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NB2_DESIGN, NB2_EXISTING_VOICES, NB2_PITCH } from "../src/no-backup-2d/script.ts";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const ROOT = "voice-samples/no-backup-2d";
const DESIGN = join(ROOT, "design");
mkdirSync(DESIGN, { recursive: true });
const sha = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 16);
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const REPORT = join(DESIGN, "report.json");
const VOICES = join(DESIGN, "voices.json");
const report = readJson(REPORT, { roles: {} });
const voices = readJson(VOICES, {});

// Существующий голос выбирается по точному ID без запроса Voice Design.
for (const [role, spec] of Object.entries(NB2_EXISTING_VOICES)) {
  if (voices[role]?.voiceId !== spec.voiceId) {
    throw new Error(`${role}: сохранённый голос ${spec.voiceId} недоступен.`);
  }
  console.log(`= ${role}: ${spec.source}; Voice Design не запрашивается`);
}

const api = async (path, body) => {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
};

// ---------- 1. Варианты голоса ----------
for (const [role, spec] of Object.entries(NB2_DESIGN)) {
  const h = sha(JSON.stringify({ v: 1, spec }));
  if (report.roles[role]?.hash === h && report.roles[role].previews?.length) {
    console.log(`= ${role}: варианты уже есть`);
    continue;
  }
  if (!apiKey) {
    console.log(`ELEVENLABS_API_KEY не задан — варианты ${role} не созданы.`);
    continue;
  }
  if (spec.text.length < 100) throw new Error(`${role}: текст пробы короче 100 символов`);
  console.log(`→ Voice Design: ${role}`);
  try {
    const data = await api("/v1/text-to-voice/design", {
      voice_description: spec.description,
      model_id: "eleven_ttv_v3",
      text: spec.text,
      auto_generate_text: false,
    });
    const previews = [];
    for (const [i, p] of (data.previews ?? []).entries()) {
      const file = `${role}-${i + 1}.mp3`;
      writeFileSync(join(DESIGN, file), Buffer.from(p.audio_base_64, "base64"));
      previews.push({ file, generatedVoiceId: p.generated_voice_id, durationSec: p.duration_secs ?? null });
      console.log(`  ✓ ${file}`);
    }
    report.roles[role] = { hash: h, description: spec.description, text: spec.text, previews };
  } catch (e) {
    console.warn(`  ⚠ ${role}: ${e.message}`);
    report.roles[role] = { hash: h, error: e.message, previews: [] };
  }
  writeJson(REPORT, report);
}

// ---------- 2. Замер вариантов (MMS + F0) ----------
const unscored = Object.entries(report.roles).flatMap(([role, r]) =>
  !NB2_DESIGN[role] ? [] :
  (r.previews ?? [])
    .filter((p) => p.cer === undefined && existsSync(join(DESIGN, p.file)))
    .map((p) => ({ path: join(DESIGN, p.file), text: NB2_DESIGN[role].text, p })),
);
if (unscored.length) {
  const inp = join(tmpdir(), "nb2d-design-in.json");
  const out = join(tmpdir(), "nb2d-design-out.json");
  writeJson(inp, unscored.map(({ path, text }) => ({ path, text })));
  try {
    execFileSync("python3", ["scripts/nb2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    const scores = new Map(readJson(out, []).map((r) => [r.path, r]));
    for (const u of unscored) {
      const s = scores.get(u.path);
      if (s) Object.assign(u.p, { cer: s.cer, heard: s.heard, f0: s.f0 });
    }
    writeJson(REPORT, report);
  } catch (e) {
    console.warn(`⚠ распознавание недоступно: ${e.message.split("\n")[0]}`);
  }
}

// ---------- 3. Выбор варианта ----------
const manual = process.env.NB2_DESIGN_PICK ? JSON.parse(process.env.NB2_DESIGN_PICK) : {};
const pickFor = (role, avoid) => {
  const all = (report.roles[role]?.previews ?? []).filter((p) => typeof p.cer === "number");
  if (manual[role]) return all.find((p) => p.generatedVoiceId === manual[role]) ?? null;
  if (!all.length) return null;
  const { min, max, prefer } = NB2_PITCH[role];
  const bestCer = Math.min(...all.map((p) => p.cer));
  let pool = all.filter((p) => p.cer <= bestCer + 0.04 && p.f0 >= min && p.f0 <= max && avoid(p));
  if (!pool.length) pool = all.filter((p) => p.cer <= bestCer + 0.04 && avoid(p));
  if (!pool.length) pool = all.filter((p) => p.cer <= bestCer + 0.04);
  const mid = (min + max) / 2;
  const key = (p) => (prefer === "low" ? p.f0 : prefer === "high" ? -p.f0 : Math.abs(p.f0 - mid));
  return [...pool].sort((a, b) => key(a) - key(b) || a.cer - b.cer)[0];
};
const picks = Object.fromEntries(Object.keys(NB2_DESIGN).map(role => [role, pickFor(role, () => true)]));
report.picks = Object.fromEntries(
  Object.entries(picks).map(([r, p]) => [r, p ? { file: p.file, generatedVoiceId: p.generatedVoiceId, cer: p.cer, f0: p.f0 } : null]),
);
for (const [role, spec] of Object.entries(NB2_EXISTING_VOICES)) {
  report.picks[role] = { ...voices[role], source: "existing", description: spec.source };
}
writeJson(REPORT, report);
for (const [role, p] of Object.entries(report.picks)) {
  console.log(p ? `• ${role}: ${p.file} (CER ${p.cer}, F0 ${p.f0} Гц)` : `• ${role}: вариант не выбран`);
}

// ---------- 4. Голоса аккаунта из выбранных вариантов ----------
for (const [role, p] of Object.entries(report.picks)) {
  if (p?.source === "existing") continue;
  if (!p || voices[role]?.generatedVoiceId === p.generatedVoiceId) continue;
  if (!apiKey) break;
  const spec = NB2_DESIGN[role];
  try {
    const d = await api("/v1/text-to-voice", {
      voice_name: `BalaGo NB2 ${role}`,
      voice_description: spec.description,
      generated_voice_id: p.generatedVoiceId,
    });
    voices[role] = { generatedVoiceId: p.generatedVoiceId, voiceId: d.voice_id, file: p.file, cer: p.cer, f0: p.f0 };
    console.log(`✓ голос ${role}: ${d.voice_id}`);
  } catch (e) {
    console.warn(`⚠ голос ${role}: ${e.message}`);
  }
  writeJson(VOICES, voices);
}

const incomplete = Object.entries(NB2_DESIGN).filter(([role, spec]) => {
  const expected = sha(JSON.stringify({ v: 1, spec }));
  return report.roles[role]?.hash !== expected || !picks[role] || voices[role]?.generatedVoiceId !== picks[role]?.generatedVoiceId;
}).map(([role]) => role);
if (incomplete.length) throw new Error(`Не готовы голоса: ${incomplete.join(", ")}. Нужны доступный ElevenLabs и ELEVENLABS_API_KEY. Старые голоса не подменяют новый состав.`);
