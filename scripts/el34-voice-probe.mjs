// Пробы голосов BalaGo34ExtraLine до массовой генерации.
//
// 1. Список голосов аккаунта ElevenLabs (только чтение): печатаются все
//    голоса, а сохранённые кыргызские голоса проекта («KG-…»), которых нет
//    в EL_VOICE_CANDIDATES, добавляются к пробам: женские — для рассказчика
//    и воспитателя, «мальчиковые» (son/boy) — для сына.
// 2. Короткие реплики из сценария читаются голосами-кандидатами тем же
//    синтезом, что и фильм (scripts/lib/el34-tts.mjs): темп и высота тона
//    не меняются. Женские голоса пробуются и как рассказчик, и как
//    воспитатель — так видно, какое распределение ролей лучше.
// 3. Оценка — scripts/el34_asr.py: CER распознавания Meta MMS (кыргызский),
//    медиана F0 и профиль голоса (возраст/пол, audeering). Это технический
//    замер, не прослушивание.
//
// Результат: voice-samples/extra-line-34/probe/*.mp3 и report.json. При той
// же конфигурации повторно не запускается (хэш). Выбранные голоса
// записываются в EL_VOICES (src/extra-line-34/script.ts).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EL_LINES, EL_TTS, EL_VOICE_CANDIDATES } from "../src/extra-line-34/script.ts";
import { synthLine } from "./lib/el34-tts.mjs";

const OUT = "voice-samples/extra-line-34/probe";
const REPORT = join(OUT, "report.json");
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

// Пробные реплики. Для рассказчика — ещё и короткая фраза с «БалаГо»
// (одинаковое произношение бренда во всём фильме).
const lineOf = (id) => EL_LINES.find((l) => l.id === id);
const BRAND = { id: "P10", role: "narrator", text: "БалаГо — Бишкектеги мектеп окуучулары үчүн. БалаГо менен жолго чыгалы!", tag: "[warmly]" };
const PROBES = {
  narrator: [lineOf("N05"), BRAND],
  caregiver: [lineOf("C01"), lineOf("C03")],
  mother: [lineOf("M01")],
  father: [lineOf("F01")],
  son: [lineOf("S01"), lineOf("S02"), lineOf("S04")],
};

const listVoices = async () => {
  if (!apiKey) return [];
  try {
    const res = await fetch(`${API}/v1/voices`, { headers: { "xi-api-key": apiKey } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const { voices } = await res.json();
    return voices.map((v) => ({ voiceId: v.voice_id, name: v.name, category: v.category, labels: v.labels ?? {}, description: (v.description ?? "").slice(0, 160) }));
  } catch (e) {
    console.warn(`  ⚠ список голосов недоступен: ${e.message}`);
    return [];
  }
};

const account = await listVoices();
if (account.length) {
  console.log(`Голоса аккаунта (${account.length}):`);
  for (const v of account) console.log(`  ${v.voiceId}  ${v.name}  [${v.category}] ${JSON.stringify(v.labels)} ${v.description}`);
}
const known = new Set(Object.values(EL_VOICE_CANDIDATES).flat().map((v) => v.voiceId));
const kg = account.filter((v) => /^kg[-_ ]/i.test(v.name) && !known.has(v.voiceId));
const boyish = (v) => /son|boy|kid|child|бала|уул/i.test(v.name);
const male = (v) => /^male$/i.test(v.labels.gender ?? "") || /husband|father|dad|man\b|ата/i.test(v.name);
const female = [
  ...new Map(
    [...EL_VOICE_CANDIDATES.narrator, ...EL_VOICE_CANDIDATES.caregiver, ...kg.filter((v) => !boyish(v) && !male(v)).slice(0, 6)].map((v) => [v.voiceId, { name: v.name, voiceId: v.voiceId }]),
  ).values(),
];
const sons = [...EL_VOICE_CANDIDATES.son, ...kg.filter(boyish).slice(0, 3).map((v) => ({ name: v.name, voiceId: v.voiceId }))];
const CAND = {
  narrator: female,
  caregiver: female,
  mother: EL_VOICE_CANDIDATES.mother,
  father: EL_VOICE_CANDIDATES.father,
  son: sons,
};

const config = { v: 1, PROBES, CAND, EL_TTS };
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : null;
if (prev?.hash === hash && prev.done) {
  console.log("= пробы голосов уже сделаны (report.json)");
  process.exit(0);
}
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const samples = [];
for (const [role, lines] of Object.entries(PROBES)) {
  for (const cand of CAND[role]) {
    for (const line of lines) {
      const file = `${role}-${cand.name.replace(/[^\w-]+/g, "_")}-${line.id}.mp3`;
      try {
        const info = await synthLine(apiKey, { ...line, role }, cand, join(OUT, file));
        samples.push({ role, voice: cand.name, voiceId: cand.voiceId, id: line.id, file, text: line.spoken ?? line.text, tag: info.tag, speechSec: Number((info.speechEnd - info.speechStart).toFixed(2)) });
      } catch (e) {
        samples.push({ role, voice: cand.name, voiceId: cand.voiceId, id: line.id, file: null, error: e.message.slice(0, 300) });
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
  execFileSync("python3", ["scripts/el34_asr.py", "--score", inp, out], { stdio: "inherit" });
  const m = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  for (const s of ok) Object.assign(s, (({ heard, cer, f0, profile }) => ({ heard, cer, f0, profile }))(m.get(join(OUT, s.file)) ?? {}));
} catch (e) {
  console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
}
writeFileSync(REPORT, JSON.stringify({ hash, done: true, account: account.map(({ voiceId, name, category, labels }) => ({ voiceId, name, category, labels })), samples }, null, 2) + "\n");
console.log("\nИтог проб:");
for (const s of samples) console.log(`${s.role.padEnd(9)} ${s.voice.padEnd(22)} ${s.id}: CER ${s.cer}, F0 ${s.f0}, ${JSON.stringify(s.profile)} «${s.heard ?? s.error}»`);
