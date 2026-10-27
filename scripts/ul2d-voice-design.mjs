// Подбор рассказчика BalaGoUnansweredLetter2D (см. src/unanswered-letter-2d/voiceDesign.ts).
// 1. Voice Design → voice-samples/unanswered-letter-2d/design/*.mp3 + report.json.
// 2. Пробы готовыми голосами → voice-samples/unanswered-letter-2d/audition/*.mp3.
// 3. Список для распознавания (asr-targets.json): MMS (CER, F0) — отдельный шаг CI.
// 4. UL2_NARRATOR_PICK → голос аккаунта (design/voices.json), один раз.
// Нужен ELEVENLABS_API_KEY; ключ не печатается. Готовое не синтезируется повторно.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { UL2_AUDITION, UL2_NARRATOR_CONTROL, UL2_NARRATOR_DESIGN, UL2_NARRATOR_MODES, UL2_NARRATOR_PICK } from "../src/unanswered-letter-2d/voiceDesign.ts";
import { synthLine } from "./lib/ul2d-tts.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — подбор голоса пропущен.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const ROOT = "voice-samples/unanswered-letter-2d";
const DESIGN = join(ROOT, "design");
const AUD = join(ROOT, "audition");
mkdirSync(DESIGN, { recursive: true });
mkdirSync(AUD, { recursive: true });
const sha = (v) => createHash("sha1").update(JSON.stringify(v)).digest("hex").slice(0, 16);
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const api = async (path, body) => {
  const res = await fetch(`${API}${path}`, { method: "POST", headers: { "xi-api-key": apiKey, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 400)}`);
  return JSON.parse(text);
};
const targets = readJson(join(ROOT, "asr-targets.json"), {});

// ---------- 1. Voice Design ----------
const REPORT = join(DESIGN, "report.json");
const report = readJson(REPORT, { designs: {} });
for (const [key, spec] of Object.entries(UL2_NARRATOR_DESIGN)) {
  const h = sha({ v: 1, spec });
  if (report.designs[key]?.hash === h && !report.designs[key].error) {
    console.log(`= ${key}: варианты уже есть`);
  } else {
    console.log(`→ Voice Design: ${key}`);
    try {
      const data = await api("/v1/text-to-voice/design", { voice_description: spec.description, model_id: "eleven_ttv_v3", text: spec.text, auto_generate_text: false });
      const previews = (data.previews ?? []).map((p, i) => {
        const file = `${key}-${i + 1}.mp3`;
        writeFileSync(join(DESIGN, file), Buffer.from(p.audio_base_64, "base64"));
        console.log(`  ✓ ${file}`);
        return { file, generatedVoiceId: p.generated_voice_id, durationSec: p.duration_secs ?? null };
      });
      report.designs[key] = { hash: h, description: spec.description, text: spec.text, previews };
    } catch (e) {
      console.warn(`  ⚠ ${e.message}`);
      report.designs[key] = { hash: h, error: e.message };
    }
    writeJson(REPORT, report);
  }
  for (const p of report.designs[key].previews ?? []) targets[join(DESIGN, p.file)] = spec.text;
}

// ---------- 2. Пробы готовыми голосами ----------
const AREPORT = join(AUD, "report.json");
const areport = readJson(AREPORT, { samples: {} });
for (const a of UL2_AUDITION) {
  const h = sha({ v: 1, a });
  const file = `${a.id}.mp3`;
  if (areport.samples[a.id]?.hash !== h || !existsSync(join(AUD, file))) {
    console.log(`→ проба ${a.id} (${a.voiceName})`);
    try {
      const info = await synthLine(apiKey, { id: a.id, role: "narrator", text: a.text, tag: a.tag, voiceSettings: a.voiceSettings }, { name: a.voiceName, voiceId: a.voiceId }, join(AUD, file), 301);
      areport.samples[a.id] = { hash: h, file, voiceName: a.voiceName, voiceId: a.voiceId, voiceSettings: a.voiceSettings, text: a.text, durationSec: info.durationSec, speechSec: Number((info.speechEnd - info.speechStart).toFixed(3)) };
    } catch (e) {
      console.warn(`  ⚠ ${e.message}`);
      areport.samples[a.id] = { hash: h, error: e.message };
    }
    writeJson(AREPORT, areport);
  }
  if (existsSync(join(AUD, file))) targets[join(AUD, file)] = a.text;
}

// ---------- 2б. Контрольные записи рассказчика (режимы подачи) ----------
const CTRL = join(ROOT, "control");
mkdirSync(CTRL, { recursive: true });
const CREPORT = join(CTRL, "report.json");
const creport = readJson(CREPORT, { samples: {} });
const narratorVoice = readJson(join(DESIGN, "voices.json"), {}).narrator;
if (narratorVoice?.voiceId) {
  for (const [mode, m] of Object.entries(UL2_NARRATOR_MODES)) {
    for (const c of UL2_NARRATOR_CONTROL) {
      const id = `${c.id}-${mode}`;
      const h = sha({ v: 1, c, m, voiceId: narratorVoice.voiceId });
      const file = `${id}.mp3`;
      if (creport.samples[id]?.hash !== h || !existsSync(join(CTRL, file))) {
        console.log(`→ контроль ${id}`);
        try {
          const info = await synthLine(apiKey, { id, role: "narrator", text: c.text, tag: m.tag, voiceSettings: m.voiceSettings }, { name: "KG-narrator", voiceId: narratorVoice.voiceId }, join(CTRL, file), 401);
          creport.samples[id] = { hash: h, file, mode, text: c.text, durationSec: info.durationSec, speechSec: Number((info.speechEnd - info.speechStart).toFixed(3)), words: info.words };
        } catch (e) {
          console.warn(`  ⚠ ${e.message}`);
          creport.samples[id] = { hash: h, error: e.message };
        }
        writeJson(CREPORT, creport);
      }
      if (existsSync(join(CTRL, file))) targets[join(CTRL, file)] = c.text;
    }
  }
}

// ---------- 3. Голос из выбранного варианта ----------
const VOICES = join(DESIGN, "voices.json");
const voices = readJson(VOICES, {});
if (UL2_NARRATOR_PICK && voices.narrator?.generatedVoiceId !== UL2_NARRATOR_PICK.generatedVoiceId) {
  const spec = UL2_NARRATOR_DESIGN[UL2_NARRATOR_PICK.key];
  const d = await api("/v1/text-to-voice", { voice_name: "BalaGo KG narrator (ul2d)", voice_description: spec.description, generated_voice_id: UL2_NARRATOR_PICK.generatedVoiceId });
  voices.narrator = { key: UL2_NARRATOR_PICK.key, generatedVoiceId: UL2_NARRATOR_PICK.generatedVoiceId, voiceId: d.voice_id };
  console.log(`✓ голос рассказчика: ${d.voice_id}`);
  writeJson(VOICES, voices);
}
writeJson(join(ROOT, "asr-targets.json"), targets);
console.log(`Для распознавания: ${Object.keys(targets).length} файлов`);
