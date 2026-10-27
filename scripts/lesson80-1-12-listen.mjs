// Прослушивание озвучки Lesson80-1-12 моделью, понимающей звук (OpenAI
// gpt-audio): каждая реплика оценивается по слуху — произношение и ударения,
// совпадение интонации с задуманной (вопрос, удивление, тихая просьба,
// радость без крика), впечатление о возрасте говорящего, естественность,
// артефакты (обрезанные слова, щелчки, синтетические вдохи, посторонние
// слова). Это дополнение к распознаванию MMS/Whisper, а не замена слуха
// человека. Результат: voice-samples/lesson-80-1-12/listen.json.
// Запуск: node scripts/lesson80-1-12-listen.mjs [id,id,…]
// (нужен доступ к api.openai.com: OPENAI_API_KEY или подключённый прокси).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FILM, L80_LINES } from "../src/lesson80/film-1-12/script.ts";

const API = process.env.OPENAI_API_BASE?.trim() || "https://api.openai.com";
const KEY = process.env.OPENAI_API_KEY?.trim();
const MODEL = process.env.LISTEN_MODEL ?? "gpt-audio-1.5";
const DIR = join("public", FILM.voiceDir);
const OUT = join("voice-samples", "lesson-80-1-12", "listen.json");
const only = process.argv[2] ? new Set(process.argv[2].split(",").map(Number)) : null;
const m = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const WHO = {
  muhammad: "учитель Мухаммад, мужчина 30–35 лет, тёплый спокойный голос",
  yusuf: "Юсуф, мальчик 4 лет",
  amir: "Амир, мальчик 8 лет",
  bilal: "Билал, мальчик 11 лет",
};
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["heard", "all_words_clear", "mispronounced", "stress_errors", "intonation_ok", "intonation_comment", "sounds_like", "naturalness", "artifacts", "verdict"],
  properties: {
    heard: { type: "string", description: "дословно, что слышно" },
    all_words_clear: { type: "boolean" },
    mispronounced: { type: "array", items: { type: "string" } },
    stress_errors: { type: "array", items: { type: "string" }, description: "слова с неверным ударением" },
    intonation_ok: { type: "boolean" },
    intonation_comment: { type: "string" },
    sounds_like: { type: "string", description: "кто это по голосу: возраст, пол" },
    naturalness: { type: "integer", minimum: 1, maximum: 5 },
    artifacts: { type: "array", items: { type: "string" }, description: "обрезано начало/конец, щелчки, вдохи, шум, посторонние слова, роботизированность" },
    verdict: { type: "string", enum: ["ok", "minor", "retake"] },
  },
};

const ask = async (line, ml) => {
  const audio = readFileSync(join(DIR, ml.file)).toString("base64");
  const prompt = [
    "Ты — режиссёр озвучки детского мультфильма на русском языке. Внимательно прослушай реплику и оцени её строго по слуху.",
    `Говорящий: ${WHO[line.role]}.`,
    `Текст реплики: «${line.text}».`,
    `Задуманная интонация: ${line.note ?? "естественная разговорная"}${line.tag ? ` (тег ${line.tag})` : ""}.`,
    line.quiet ? "Эта реплика намеренно тихая, почти про себя, но каждое слово должно быть разборчиво." : "",
    "Отметь: все ли слова ясно слышны; неверно произнесённые слова; неверные ударения (например, «ду-А» — ударение на последний слог в слове «дуа»); совпадает ли интонация с задуманной (вопрос звучит как вопрос и т. п.); на кого похож голос; естественность 1–5; артефакты. Вердикт: ok, minor (мелочь, можно оставить) или retake (нужен новый дубль). Ответ — только JSON по схеме.",
  ].filter(Boolean).join("\n");
  const body = {
    model: MODEL,
    modalities: ["text"],
    messages: [
      { role: "user", content: [{ type: "text", text: prompt }, { type: "input_audio", input_audio: { data: audio, format: "mp3" } }] },
    ],
    response_format: { type: "json_schema", json_schema: { name: "listen", strict: true, schema: SCHEMA } },
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}/v1/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}) }, body: JSON.stringify(body) });
    if (res.ok) {
      const data = await res.json();
      const txt = data.choices?.[0]?.message?.content ?? "{}";
      return JSON.parse(txt);
    }
    const err = await res.text();
    if (attempt === 2) throw new Error(`${res.status}: ${err.slice(0, 300)}`);
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
};

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { rows: [] };
const rows = new Map((prev.rows ?? []).map((r) => [r.id, r]));
const todo = L80_LINES.filter((l) => !only || only.has(l.id));
let i = 0;
const worker = async () => {
  while (i < todo.length) {
    const line = todo[i++];
    const ml = m.lines.find((x) => x.id === line.id);
    try {
      const r = await ask(line, ml);
      rows.set(line.id, { id: line.id, role: line.role, text: line.text, seed: ml.seed, file: ml.file, ...r });
      const flag = r.verdict === "ok" ? "✓" : r.verdict === "minor" ? "~" : "✗";
      console.log(`${flag} №${String(line.id).padStart(2, "0")} ${line.role.padEnd(8)} nat ${r.naturalness} «${r.heard}» ${r.intonation_ok ? "" : "| интонация: " + r.intonation_comment} ${r.stress_errors.length ? "| ударение: " + r.stress_errors.join(", ") : ""} ${r.mispronounced.length ? "| произн.: " + r.mispronounced.join(", ") : ""} ${r.artifacts.length ? "| " + r.artifacts.join("; ") : ""} | ${r.sounds_like}`);
    } catch (e) {
      console.warn(`⚠ №${line.id}: ${e.message}`);
    }
  }
};
await Promise.all([worker(), worker(), worker(), worker()]);
mkdirSync(join("voice-samples", "lesson-80-1-12"), { recursive: true });
const all = [...rows.values()].sort((a, b) => a.id - b.id);
writeFileSync(OUT, JSON.stringify({ model: MODEL, provider: m.provider, rows: all }, null, 1) + "\n");
const bad = all.filter((r) => r.verdict === "retake");
console.log(`Прослушано: ${all.length}; на перезапись: ${bad.map((r) => r.id).join(", ") || "—"}`);
