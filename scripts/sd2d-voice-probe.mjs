// Пробы голосов BalaGo36SuitcaseByTheDoor2D до массовой генерации.
// Короткие реплики из сценария читаются голосами-кандидатами проекта
// (SD2_VOICE_CANDIDATES, список проб — SD2_PROBES): рассказчик — N01,
// мама — M01, папа — P01, сын — C01 и C04. Каждая проба — тем же
// синтезом, что и ролик (scripts/lib/sd2d-tts.mjs): темп и высота тона не
// меняются. Оценка — scripts/sd2d_asr.py: CER распознавания Meta MMS
// (кыргызский), медиана F0 и профиль голоса (возраст/пол, audeering). Это
// технический замер, не прослушивание.
//
// Результат: voice-samples/suitcase-by-the-door-2d/probe/*.mp3 и report.json.
// Повторно не запускается при той же конфигурации (хэш). Выбранные голоса
// записываются в SD2_VOICES (src/suitcase-by-the-door-2d/script.ts).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SD2_LINES, SD2_PROBES, SD2_TTS, SD2_VOICE_CANDIDATES } from "../src/suitcase-by-the-door-2d/script.ts";
import { synthLine } from "./lib/sd2d-tts.mjs";

const OUT = "voice-samples/suitcase-by-the-door-2d/probe";
const REPORT = join(OUT, "report.json");
const PROBES = SD2_PROBES;
const config = { v: 1, PROBES, SD2_VOICE_CANDIDATES, SD2_TTS, text: Object.values(PROBES).flat().map((id) => SD2_LINES.find((l) => l.id === id)) };
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : null;
if (prev?.hash === hash && prev.done) {
  console.log("= пробы голосов уже сделаны (report.json)");
  process.exit(0);
}
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const samples = [];
for (const [role, ids] of Object.entries(PROBES)) {
  for (const cand of SD2_VOICE_CANDIDATES[role]) {
    for (const id of ids) {
      const line = SD2_LINES.find((l) => l.id === id);
      const file = `${role}-${cand.name.replace(/[^\w-]+/g, "_")}-${id}.mp3`;
      try {
        const info = await synthLine(apiKey, line, cand, join(OUT, file));
        samples.push({ role, voice: cand.name, voiceId: cand.voiceId, id, file, text: line.spoken ?? line.text, speechSec: Number((info.speechEnd - info.speechStart).toFixed(2)) });
      } catch (e) {
        samples.push({ role, voice: cand.name, voiceId: cand.voiceId, id, file: null, error: e.message.slice(0, 300) });
        console.warn(`  ⚠ ${file}: ${e.message.slice(0, 200)}`);
      }
    }
  }
}
const ok = samples.filter((s) => s.file);
const inp = join(OUT, "score-in.json");
const out = join(OUT, "score-out.json");
writeFileSync(inp, JSON.stringify(ok.map((s) => ({ path: join(OUT, s.file), text: s.text })), null, 2));
try {
  execFileSync("python3", ["scripts/sd2d_asr.py", "--score", inp, out], { stdio: "inherit" });
  const m = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  for (const s of ok) Object.assign(s, (({ heard, cer, f0, profile }) => ({ heard, cer, f0, profile }))(m.get(join(OUT, s.file)) ?? {}));
} catch (e) {
  console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
}
writeFileSync(REPORT, JSON.stringify({ hash, done: true, samples }, null, 2) + "\n");
for (const s of samples) console.log(`${s.role} ${s.voice} ${s.id}: CER ${s.cer}, F0 ${s.f0}, ${JSON.stringify(s.profile)} «${s.heard ?? s.error}»`);
