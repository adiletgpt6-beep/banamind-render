// Точечные дубли отдельных реплик BalaGoHalfHour для слуховой проверки.
// Читает .github/half-hour-retake-request.json:
//   { "takes": [{ "id": "m03", "seeds": [73, 101], "spoken": "…"? }] }
// и сохраняет voice-samples/half-hour-retake/<id>-s<seed>[-<tag>].mp3 тем же
// голосом роли, моделью и настройками, что и основная озвучка. Уже
// сохранённые дубли повторно не запрашиваются (кредиты не тратятся).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HH_LINES, HH_TTS, HH_VOICE_CHOICE } from "../src/half-hour/script.ts";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — дубли пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const OUT = "voice-samples/half-hour-retake";
mkdirSync(OUT, { recursive: true });
const request = JSON.parse(readFileSync(".github/half-hour-retake-request.json", "utf8"));
const reportPath = join(OUT, "report.json");
const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, "utf8")) : { takes: [] };

for (const take of request.takes) {
  const line = HH_LINES.find((l) => l.id === take.id);
  if (!line) throw new Error(`Нет реплики ${take.id}`);
  const voice = HH_VOICE_CHOICE[line.role];
  const text = take.spoken ?? line.spoken ?? line.text;
  for (const seed of take.seeds) {
    const file = `${line.id}-s${seed}${take.tag ? `-${take.tag}` : ""}.mp3`;
    if (existsSync(join(OUT, file))) {
      console.log(`= ${file}`);
      continue;
    }
    const res = await fetch(`${API}/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: HH_TTS.modelId,
        language_code: HH_TTS.languageCode,
        seed,
        voice_settings: HH_TTS.voiceSettings,
        apply_text_normalization: "auto",
      }),
    });
    if (!res.ok) {
      const err = (await res.text()).slice(0, 300);
      console.log(`✗ ${file}: ${res.status} ${err}`);
      report.takes.push({ id: line.id, seed, tag: take.tag ?? null, text, error: `${res.status} ${err}` });
      continue;
    }
    writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
    report.takes.push({ id: line.id, seed, tag: take.tag ?? null, text, voiceId: voice.voiceId, file });
    console.log(`✓ ${file}`);
  }
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
