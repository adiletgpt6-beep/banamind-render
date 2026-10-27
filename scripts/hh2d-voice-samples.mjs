// Пробы голосов мамы, сына и мужа для BalaGoHalfHour2D.
// Каждый кандидат (HH2_CANDIDATES) читает реплики своей роли из ролика
// (HH2_SAMPLE_LINES) с теми же настройками, что и полная озвучка, — поэтому
// пробы выбранного голоса потом переиспользуются как реплики ролика.
// Результат: voice-samples/half-hour-2d/<роль>-<голос>-<реплика>.mp3 и
// report.json. Уже готовые пробы (тот же хэш) повторно не синтезируются.
// Скорость и высота тона не меняются.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  HH2_CANDIDATES,
  HH2_SAMPLE_LINES,
  HH2_VOICE_CHOICE,
  lineById,
} from "../src/half-hour-2d/script.ts";
import { hh2Hash, resolveVoice, synthLine } from "./lib/hh2d-tts.mjs";

// Пробы нужны, пока голоса не выбраны: после выбора (или при смене seed
// реплики) они не пересинтезируются — кредиты ElevenLabs не тратятся.
// Принудительно: HH2_FORCE_SAMPLES=1.
if (Object.values(HH2_VOICE_CHOICE).every(Boolean) && !process.env.HH2_FORCE_SAMPLES) {
  console.log("Голоса выбраны (HH2_VOICE_CHOICE) — пробы не создаются.");
  process.exit(0);
}

const OUT = "voice-samples/half-hour-2d";
const REPORT = join(OUT, "report.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
mkdirSync(OUT, { recursive: true });
const prev = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : { samples: [] };
const byFile = new Map(prev.samples.map((s) => [s.file, s]));

const samples = [];
let made = 0;
for (const [role, ids] of Object.entries(HH2_SAMPLE_LINES)) {
  for (const cand of HH2_CANDIDATES[role]) {
    let voice;
    try {
      voice = resolveVoice(cand);
    } catch (e) {
      console.warn(`  ⚠ ${e.message}`);
      continue;
    }
    for (const id of ids) {
      const line = lineById(id);
      const file = `${role}-${voice.name}-${id}.mp3`;
      const old = byFile.get(file);
      if (old && old.hash === hh2Hash(line, voice.voiceId) && existsSync(join(OUT, file))) {
        samples.push(old);
        continue;
      }
      if (!apiKey) {
        console.log(`ELEVENLABS_API_KEY не задан — проба ${file} пропущена.`);
        continue;
      }
      try {
        const info = await synthLine(apiKey, line, voice, join(OUT, file));
        samples.push({ file, ...info });
        made++;
      } catch (e) {
        console.warn(`  ⚠ ${file}: ${e.message}`);
        samples.push({ file, role, voiceName: voice.name, voiceId: voice.voiceId, id, error: e.message });
      }
      // промежуточное сохранение (оплаченные пробы не теряются)
      writeFileSync(REPORT, JSON.stringify({ version: 1, samples }, null, 2) + "\n");
    }
  }
}
writeFileSync(REPORT, JSON.stringify({ version: 1, samples }, null, 2) + "\n");
console.log(`Пробы: ${samples.length} (новых: ${made}) → ${OUT}`);
