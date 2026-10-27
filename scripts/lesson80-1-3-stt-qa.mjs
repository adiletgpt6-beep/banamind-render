// Распознавание озвучки ролика 80-1-3: сравнение со сценарием (--report) по
// результатам локального Whisper в CI (scripts/lesson80-1-3-asr.py). Запасной
// путь — ElevenLabs Speech-to-Text (scribe_v1), если у ключа есть право
// speech_to_text. Независимая проверка, что дубль и готовый файл реплики
// произносят утверждённый текст. Результаты кэшируются по SHA-1 файла:
//   public/audio/lesson80-1-3/stt/<sha1>.json  { file, text, words }
// Сравнение со сценарием — локально: node scripts/lesson80-1-3-stt-qa.mjs --report
// Это технический замер распознавателем, а не прослушивание человеком.
//
// Запуск в CI: ELEVENLABS_API_KEY=... node scripts/lesson80-1-3-stt-qa.mjs
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { A3_LINES } from "../src/lesson80-1-3/script.ts";

const DIR = "public/audio/lesson80-1-3";
const OUT = join(DIR, "stt");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
mkdirSync(OUT, { recursive: true });

const sha = (p) => createHash("sha1").update(readFileSync(p)).digest("hex").slice(0, 16);
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
const lev = (a, b) => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)));
    prev = cur;
  }
  return prev[b.length];
};

// Что распознавать: готовые файлы реплик и все сырые дубли текущего плана.
const targets = () => {
  const list = [];
  for (const l of A3_LINES) {
    const f = join(DIR, `${l.id}.mp3`);
    if (existsSync(f)) list.push({ kind: "line", id: l.id, file: f, expect: l.spoken ?? l.text });
  }
  const raw = join(DIR, "raw");
  if (existsSync(raw)) {
    for (const j of readdirSync(raw).filter((x) => x.endsWith(".json"))) {
      const meta = JSON.parse(readFileSync(join(raw, j), "utf8"));
      const f = join(raw, j.replace(/\.json$/, ".mp3"));
      if (existsSync(f)) list.push({ kind: "take", id: meta.segId, take: meta.take, key: j.slice(0, -5), file: f, expect: `${meta.lead ? `${meta.lead} ` : ""}${meta.text} ${meta.pad}` });
    }
  }
  return list;
};

const transcribe = async (file) => {
  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("language_code", "rus");
  form.append("tag_audio_events", "false");
  form.append("file", new Blob([readFileSync(file)], { type: "audio/mpeg" }), "a.mp3");
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${API}/v1/speech-to-text`, { method: "POST", headers: { "xi-api-key": apiKey }, body: form });
    if (res.ok) return res.json();
    const body = (await res.text()).slice(0, 300);
    if (res.status !== 429 && res.status < 500) throw new Error(`STT ${res.status}: ${body}`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
  }
  throw new Error("STT: нет ответа");
};

if (process.argv.includes("--report")) {
  const rows = [];
  for (const t of targets()) {
    const p = join(OUT, `${sha(t.file)}.json`);
    if (!existsSync(p)) continue;
    const r = JSON.parse(readFileSync(p, "utf8"));
    // в сыром дубле распознаётся и страховочное слово — в сравнении оно учтено
    const ref = norm(t.expect);
    const cer = lev(ref, norm(r.text)) / Math.max(1, ref.length);
    rows.push({ ...t, heard: r.text, cer: Number(cer.toFixed(3)) });
  }
  rows.sort((a, b) => (a.id + (a.kind === "line" ? "" : `~${a.take}`)).localeCompare(b.id + (b.kind === "line" ? "" : `~${b.take}`)));
  for (const r of rows) console.log(`${r.cer < 0.05 ? "  " : "!!"} ${r.id} ${r.kind === "line" ? "ФАЙЛ " : `t${r.take} ${r.key.slice(0, 6)}`} cer=${r.cer.toFixed(3)} | ${r.heard}`);
  writeFileSync("out/lesson80-1-3-stt-report.json", JSON.stringify(rows, null, 1));
  process.exit(0);
}

if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — распознавание пропущено.");
  process.exit(0);
}
const todo = targets().filter((t) => !existsSync(join(OUT, `${sha(t.file)}.json`)));
console.log(`Распознать: ${todo.length}`);
for (const t of todo) {
  try {
    const r = await transcribe(t.file);
    writeFileSync(join(OUT, `${sha(t.file)}.json`), JSON.stringify({ file: t.file, id: t.id, take: t.take ?? null, text: r.text, words: (r.words ?? []).filter((w) => w.type === "word").map((w) => ({ text: w.text, start: w.start, end: w.end })) }) + "\n");
    console.log(`✓ ${t.id} ${t.kind} ${t.take ?? ""}: ${r.text}`);
  } catch (e) {
    console.warn(`✗ ${t.id}: ${e.message}`);
    if (/401|403/.test(e.message)) break;
  }
}
