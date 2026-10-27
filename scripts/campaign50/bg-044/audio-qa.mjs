// Независимая техническая проверка озвучки BG-044 через OpenAI (не замена
// прослушиванию носителем кыргызского языка!):
//   1) распознавание каждой реплики gpt-4o-transcribe (без подсказки текста)
//      → доля ошибок по буквам (CER) относительно сценария;
//   2) «слушатель» gpt-audio: отмечает слова, произнесённые неверно или
//      неразборчиво, и неестественные места (кратко, JSON).
// Результат: scripts/campaign50/bg-044/audio-qa.json (без ключей).
// Запуск: node scripts/campaign50/bg-044/audio-qa.mjs  (OPENAI_API_KEY или
// прокси, подставляющий ключ для api.openai.com).
import { readFileSync, writeFileSync } from "node:fs";
import { BG44_LINES, BG44_VIDEO } from "../../../src/campaign50/bg-044/script.ts";

const API = "https://api.openai.com/v1";
const key = process.env.OPENAI_API_KEY?.trim();
const auth = key ? { Authorization: `Bearer ${key}` } : {};
const dir = `public/${BG44_VIDEO.voiceDir}`;
const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, "utf8"));

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/balago|балаго/g, "балаго")
    .replace(/whatsapp|ватсап|вотсап/g, "ватсап")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
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
const cer = (ref, hyp) => Number((lev(norm(ref), norm(hyp)) / Math.max(1, norm(ref).length)).toFixed(3));

const transcribe = async (path) => {
  for (const language of ["ky", null]) {
    const form = new FormData();
    form.append("file", new Blob([readFileSync(path)], { type: "audio/mpeg" }), "line.mp3");
    form.append("model", "gpt-4o-transcribe");
    if (language) form.append("language", language);
    const res = await fetch(`${API}/audio/transcriptions`, { method: "POST", headers: auth, body: form });
    if (res.ok) return { text: (await res.json()).text, language };
    const err = await res.text();
    if (!language) throw new Error(`transcribe ${res.status}: ${err.slice(0, 200)}`);
  }
  return null;
};

const listen = async (path, expected) => {
  const body = {
    model: "gpt-audio",
    modalities: ["text"],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "You are a strict Kyrgyz-language voice-over QA listener. The audio should say exactly this Kyrgyz text: " +
              `«${expected}». Listen and reply ONLY with JSON: {"matches": true|false, "mispronounced": [words], ` +
              '"missing_or_extra": [words], "naturalness_1_5": number, "comment": "short English note"}.',
          },
          { type: "input_audio", input_audio: { data: readFileSync(path).toString("base64"), format: "mp3" } },
        ],
      },
    ],
  };
  const res = await fetch(`${API}/chat/completions`, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) return { error: `${res.status}: ${(await res.text()).slice(0, 200)}` };
  const txt = (await res.json()).choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(txt.replace(/^```json\s*|```\s*$/g, ""));
  } catch {
    return { raw: txt.slice(0, 400) };
  }
};

const out = [];
for (const l of BG44_LINES) {
  const ml = manifest.lines.find((x) => x.id === l.id);
  if (!ml?.file) throw new Error(`${l.id}: нет файла озвучки`);
  const path = `${dir}/${ml.file}`;
  const expected = l.spoken ?? l.text;
  const tr = await transcribe(path);
  const ear = await listen(path, expected);
  const row = { id: l.id, role: l.role, voice: ml.voiceName, expected, heard: tr?.text ?? null, cer: tr ? cer(expected, tr.text) : null, mmsCer: ml.asrCer ?? null, listener: ear };
  out.push(row);
  console.log(`${l.id} [${ml.voiceName}] CER ${row.cer} (MMS ${row.mmsCer}) — «${row.heard}»`);
  console.log(`   слушатель: ${JSON.stringify(ear)}`);
}
writeFileSync("scripts/campaign50/bg-044/audio-qa.json", JSON.stringify({ checkedOn: process.env.QA_DATE ?? null, lines: out }, null, 2) + "\n");
