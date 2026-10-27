// Кыргызские голоса для BalaGoHalfHour2D через ElevenLabs Voice Design.
//
// 1. Список файлов для распознавания (asr-targets.json: файл → текст по
//    сценарию) — реплики ролика, пробы голосов и варианты Voice Design.
//    Распознаёт их отдельная задача CI моделью Meta MMS (scripts/asr_mms.py):
//    у ключа ElevenLabs нет права на Speech-to-Text.
// 2. Voice Design: для каждой роли из src/half-hour-2d/voiceDesign.ts —
//    варианты голоса (обычно 3) с текстом пробы на кыргызском → design/*.mp3,
//    каждый вариант распознаётся. Повторно не запускается, если описание и
//    текст не менялись.
// 3. Выбранные варианты (HH2_DESIGN_PICK) сохраняются как голоса аккаунта →
//    design/voices.json (роль → voice_id). Голос создаётся один раз.
//
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HH2_LINES, HH2_VIDEO } from "../src/half-hour-2d/script.ts";
import { HH2_DESIGN, HH2_DESIGN_PICK } from "../src/half-hour-2d/voiceDesign.ts";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — Voice Design и распознавание пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const ROOT = "voice-samples/half-hour-2d";
const DESIGN = join(ROOT, "design");
mkdirSync(DESIGN, { recursive: true });
const sha = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 16);
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");

// ---------- 1. Список для распознавания ----------
const TARGETS = join(ROOT, "asr-targets.json");
const targets = {};
const lineText = new Map(HH2_LINES.map((l) => [l.id, l.text]));
const voiceDir = join("public", HH2_VIDEO.voiceDir);
for (const l of HH2_LINES) {
  const f = join(voiceDir, `${l.id}.mp3`);
  if (existsSync(f)) targets[f] = l.text;
}
for (const s of readJson(join(ROOT, "report.json"), { samples: [] }).samples) {
  if (!s.error && existsSync(join(ROOT, s.file))) targets[join(ROOT, s.file)] = lineText.get(s.id) ?? s.text;
}
const writeTargets = (report) => {
  for (const [role, d] of Object.entries(report.roles)) {
    for (const p of d.previews ?? []) targets[join(DESIGN, p.file)] = HH2_DESIGN[role].text;
  }
  writeJson(TARGETS, targets);
};

// ---------- 2. Voice Design ----------
const REPORT = join(DESIGN, "report.json");
const report = readJson(REPORT, { roles: {} });
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
for (const [role, spec] of Object.entries(HH2_DESIGN)) {
  const h = sha(JSON.stringify({ v: 1, spec }));
  if (report.roles[role]?.hash === h && (!report.roles[role].error || /blocked_generation/.test(report.roles[role].error))) {
    console.log(`= ${role}: варианты уже есть`);
    continue;
  }
  if (spec.text.length < 100) throw new Error(`${role}: текст пробы короче 100 символов`);
  console.log(`→ Voice Design: ${role}`);
  let data;
  let endpoint;
  try {
    endpoint = "/v1/text-to-voice/design";
    data = await api(endpoint, {
      voice_description: spec.description,
      model_id: "eleven_ttv_v3",
      text: spec.text,
      auto_generate_text: false,
    });
  } catch (e) {
    console.warn(`  ⚠ ${e.message}`);
    try {
      endpoint = "/v1/text-to-voice/create-previews";
      data = await api(endpoint, { voice_description: spec.description, text: spec.text, auto_generate_text: false });
    } catch (e2) {
      console.warn(`  ⚠ ${e2.message}`);
      report.roles[role] = { hash: h, error: `${e.message} | ${e2.message}` };
      writeJson(REPORT, report);
      continue;
    }
  }
  const previews = [];
  for (const [i, p] of (data.previews ?? []).entries()) {
    const file = `${role}-${i + 1}.mp3`;
    writeFileSync(join(DESIGN, file), Buffer.from(p.audio_base_64, "base64"));
    previews.push({ file, generatedVoiceId: p.generated_voice_id, durationSec: p.duration_secs ?? null });
    console.log(`  ✓ ${file}`);
  }
  report.roles[role] = { hash: h, endpoint, description: spec.description, text: spec.text, previews };
  writeJson(REPORT, report);
}

// ---------- 3. Голоса из выбранных вариантов ----------
const VOICES = join(DESIGN, "voices.json");
const voices = readJson(VOICES, {});
for (const [role, gid] of Object.entries(HH2_DESIGN_PICK)) {
  if (!gid || voices[role]?.generatedVoiceId === gid) continue;
  const spec = HH2_DESIGN[role];
  try {
    const d = await api("/v1/text-to-voice", {
      voice_name: `BalaGo KG ${role}`,
      voice_description: spec.description,
      generated_voice_id: gid,
    });
    voices[role] = { generatedVoiceId: gid, voiceId: d.voice_id };
    console.log(`✓ голос ${role}: ${d.voice_id}`);
  } catch (e) {
    console.warn(`⚠ голос ${role}: ${e.message}`);
    try {
      const d = await api("/v1/text-to-voice/create-voice-from-preview", {
        voice_name: `BalaGo KG ${role}`,
        voice_description: spec.description,
        generated_voice_id: gid,
      });
      voices[role] = { generatedVoiceId: gid, voiceId: d.voice_id };
      console.log(`✓ голос ${role}: ${d.voice_id}`);
    } catch (e2) {
      console.warn(`⚠ голос ${role}: ${e2.message}`);
    }
  }
  writeJson(VOICES, voices);
}
writeTargets(report);
console.log(`Файлы: ${readdirSync(DESIGN).length} в ${DESIGN}; для распознавания: ${Object.keys(targets).length}`);
