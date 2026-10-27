// Дополнительная (локальная, не в CI) проверка озвучки BalaGoBG046 вторым
// распознаванием: OpenAI gpt-4o-transcribe → CER относительно текста для
// синтеза, и короткий отзыв аудиомодели о произношении, роли голоса и
// интонации. Это подсказка для человека, не замена прослушиванию носителем
// кыргызского языка.
//
// Запуск: node scripts/campaign50/bg-046/qa-openai.mjs [id …] [--judge]
// Ключ OpenAI подставляет окружение (OPENAI_API_KEY или прокси сессии).
import { readFileSync, writeFileSync } from "node:fs";
import { BG46_LINES, BG46_VIDEO, BG46_VOICES } from "../../../src/campaign50/bg-046/script.ts";

const args = process.argv.slice(2);
const judge = args.includes("--judge");
const only = args.filter((a) => !a.startsWith("--"));
const DIR = `public/${BG46_VIDEO.voiceDir}`;
const manifest = JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8"));
const KEY = process.env.OPENAI_API_KEY?.trim();
const auth = KEY ? { Authorization: `Bearer ${KEY}` } : {};

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/balago/g, "балаго")
    .replace(/whatsapp/g, "ватсап")
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

const transcribe = async (path) => {
  const fd = new FormData();
  fd.append("file", new Blob([readFileSync(path)], { type: "audio/mpeg" }), "line.mp3");
  fd.append("model", "gpt-4o-transcribe");
  fd.append("prompt", "Кыргыз тилиндеги жарнама: БалаГо, Бишкек, мектеп, ата-эне, Ватсап.");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: auth, body: fd });
  if (!res.ok) throw new Error(`transcribe ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).text;
};

const review = async (path, line) => {
  const role = { bag: "сказочный говорящий школьный рюкзак (звонкий мальчишеский голос)", child: "девочка 7–8 лет", mother: "мама", narrator: "диктор рекламы" }[line.role];
  const body = {
    model: "gpt-audio",
    modalities: ["text"],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Это кыргызская реплика для детской рекламы. Роль: ${role}. Ожидаемый текст: «${line.spoken ?? line.text}». Ответь по-русски кратко (3–5 строк): 1) произнесён ли текст полностью и разборчиво (какие слова звучат неверно или по-русски/с акцентом); 2) естественна ли интонация для роли; 3) оценка 1–5.`,
          },
          { type: "input_audio", input_audio: { data: readFileSync(path).toString("base64"), format: "mp3" } },
        ],
      },
    ],
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`review ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).choices[0].message.content.trim();
};

const report = [];
for (const line of BG46_LINES) {
  if (only.length && !only.includes(line.id)) continue;
  const ml = manifest.lines.find((x) => x.id === line.id);
  if (!ml?.file) {
    console.log(`✗ ${line.id}: нет файла`);
    continue;
  }
  const path = `${DIR}/${ml.file}`;
  const heard = await transcribe(path);
  const ref = norm(line.spoken ?? line.text);
  const cer = lev(norm(heard), ref) / Math.max(1, ref.length);
  const row = { id: line.id, role: line.role, voice: BG46_VOICES[line.role].name, mmsCer: ml.asrCer, openaiCer: Number(cer.toFixed(3)), heard, speechSec: Number((ml.speechEnd - ml.speechStart).toFixed(2)) };
  if (judge) row.review = await review(path, line);
  report.push(row);
  console.log(`${line.id} [${row.voice}] MMS ${ml.asrCer ?? "?"} • OpenAI ${row.openaiCer} — «${heard}»${row.review ? `\n   ${row.review.replace(/\n/g, "\n   ")}` : ""}`);
}
writeFileSync("out/bg-046-voice-qa.json", JSON.stringify(report, null, 2));
console.log("→ out/bg-046-voice-qa.json");
