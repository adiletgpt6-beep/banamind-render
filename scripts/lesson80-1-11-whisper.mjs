// Второе распознавание готовой озвучки Lesson80-1-11 (Whisper medium,
// scripts/lesson80_whisper.py): CER и вероятность каждого слова; итог —
// voice-samples/lesson-80-1-11/whisper.json. Технический замер, не слух.
// Запуск (нужен pip install faster-whisper): node scripts/lesson80-1-11-whisper.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FILM, L80_LINES } from "../src/lesson80/film-1-11/script.ts";

const DIR = join("public", FILM.voiceDir);
const m = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const items = L80_LINES.map((l) => {
  const ml = m.lines.find((x) => x?.id === l.id);
  if (!ml?.file || !existsSync(join(DIR, ml.file))) throw new Error(`№${l.id}: нет файла озвучки`);
  return { id: l.id, path: join(DIR, ml.file), text: l.text };
});
const TMP = join(tmpdir(), "lesson80-1-11-whisper");
mkdirSync(TMP, { recursive: true });
const inp = join(TMP, "in.json");
const out = join(TMP, "out.json");
writeFileSync(inp, JSON.stringify(items));
execFileSync("python3", ["scripts/lesson80_whisper.py", inp, out, process.env.WHISPER_MODEL ?? "medium"], { stdio: "inherit" });
const rows = JSON.parse(readFileSync(out, "utf8"));
mkdirSync(join("voice-samples", "lesson-80-1-11"), { recursive: true });
writeFileSync(join("voice-samples", "lesson-80-1-11", "whisper.json"), JSON.stringify({ provider: m.provider, model: process.env.WHISPER_MODEL ?? "medium", rows }, null, 1) + "\n");
const flagged = rows.filter((r) => r.low.length || r.cer > 0.1);
console.log(`Whisper: ${rows.length} реплик, отмечено ${flagged.length}: ${flagged.map((r) => r.id).join(", ") || "—"}`);
