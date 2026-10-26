// Пробы голосов BalaGoKnowsMyName2D (сценарий №30) до полной озвучки.
//
// Взрослые роли — сохранённые голоса проекта: N01 (KG-teacher), M01
// (KG-mother), F02 (KG-husband). Мальчик (8–9 лет) — кандидаты, уже
// созданные в аккаунте проекта:
//   • remix2 — KG-son v7 remix-2 (1c81DEBcmaJMj1QDHWU6): ремикс KG-boy a2-3,
//     ниже, плотнее и спокойнее, без «писка» (ролик №20, PR #37);
//   • kgboy  — KG-boy a2-3 (8QMDSJuOqCscZvQ6PqlL): ролики №22 и №24.
// Новые голоса не создаются: детские описания Voice Design сервис
// блокирует, библиотека голосов ключу недоступна (опыт №20, №22). Тон не
// повышается, речь не ускоряется.
//
// Каждый кандидат читает K01–K05 (eleven_v3, ky, один дубль), файлы
// склеиваются в <id>-all.mp3 для прослушивания. Оценка scripts/km2d_asr.py:
// CER распознавания MMS, медиана F0, профиль голоса (возраст, «ребёнок») —
// технический замер, не прослушивание. Выбор (picked): меньший средний
// штраф takePenalty; при разнице < 0,03 — remix2 (спокойнее, без писка).
// Итог: voice-samples/knows-my-name-2d/probe/report.json + MP3.
// Повторно не запускается при той же конфигурации (хэш).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KM2_LINES, KM2_TTS, KM2_VOICES } from "../src/knows-my-name-2d/script.ts";
import { synthLine, takePenalty } from "./lib/km2d-tts.mjs";
import { ffmpeg } from "./lib/audio.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const OUT = "voice-samples/knows-my-name-2d/probe";
const REPORT = join(OUT, "report.json");
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");

const BOYS = [
  { id: "remix2", name: "KG-son v7 remix-2", voiceId: "1c81DEBcmaJMj1QDHWU6" },
  { id: "kgboy", name: "KG-boy a2-3", voiceId: "8QMDSJuOqCscZvQ6PqlL" },
];
const BOY_LINES = KM2_LINES.filter((l) => l.role === "boy");
const ADULT = ["N01", "M01", "F02"].map((id) => KM2_LINES.find((l) => l.id === id));

const config = {
  v: 1,
  BOYS,
  boy: BOY_LINES.map((l) => [l.id, l.spoken ?? l.text, l.tag ?? null]),
  adult: ADULT.map((l) => [l.id, l.spoken ?? l.text, l.tag ?? null, KM2_VOICES[l.role].voiceId]),
  tts: KM2_TTS,
};
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = readJson(REPORT, null);
if (prev?.hash === hash && prev.done) {
  console.log(`= пробы голосов уже сделаны (report.json), мальчик: ${prev.picked?.name}`);
  process.exit(0);
}
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

const items = [];
for (const b of BOYS) {
  for (const l of BOY_LINES) {
    const file = `${b.id}-${l.id.toLowerCase()}.mp3`;
    const info = await synthLine(apiKey, l, { name: b.name, voiceId: b.voiceId }, join(OUT, file));
    items.push({ who: b.id, line: l, file, info });
  }
  // склейка для прослушивания: реплики через 0,6 с тишины
  const parts = BOY_LINES.map((l) => join(OUT, `${b.id}-${l.id.toLowerCase()}.mp3`));
  const inputs = parts.flatMap((p) => ["-i", p]);
  const chain = parts.map((_, i) => `[${i}:a]apad=pad_dur=0.6[a${i}]`).join(";");
  ffmpeg([...inputs, "-filter_complex", `${chain};${parts.map((_, i) => `[a${i}]`).join("")}concat=n=${parts.length}:v=0:a=1[o]`, "-map", "[o]", "-codec:a", "libmp3lame", "-b:a", "160k", join(OUT, `${b.id}-all.mp3`)]);
}
for (const l of ADULT) {
  const v = KM2_VOICES[l.role];
  const file = `${l.role}-${l.id.toLowerCase()}.mp3`;
  const info = await synthLine(apiKey, l, v, join(OUT, file));
  items.push({ who: l.role, line: l, file, info });
}

// оценка: CER (MMS), F0, профиль
const inp = join(OUT, "score-in.json");
const outp = join(OUT, "score-out.json");
writeJson(inp, items.map((it) => ({ path: join(OUT, it.file), text: it.line.spoken ?? it.line.text })));
let scores = new Map();
try {
  execFileSync("python3", ["scripts/km2d_asr.py", "--score", inp, outp], { stdio: "inherit" });
  scores = new Map(readJson(outp, []).map((r) => [r.path, r]));
} catch (e) {
  console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
}
const rows = items.map((it) => {
  const asr = scores.get(join(OUT, it.file)) ?? null;
  return {
    who: it.who,
    id: it.line.id,
    file: it.file,
    speechSec: Number((it.info.speechEnd - it.info.speechStart).toFixed(3)),
    cer: asr?.cer ?? null,
    f0: asr?.f0 ?? null,
    profile: asr?.profile ?? null,
    heard: asr?.heard ?? null,
    penalty: asr ? takePenalty(it.line, it.info, asr) : null,
  };
});
const mean = (xs) => (xs.length ? Number((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(3)) : null);
const summary = BOYS.map((b) => {
  const r = rows.filter((x) => x.who === b.id);
  const num = (k) => r.map((x) => x[k]).filter((x) => typeof x === "number");
  const prof = (k) => r.map((x) => x.profile?.[k]).filter((x) => typeof x === "number");
  return { ...b, penalty: mean(num("penalty")), cer: mean(num("cer")), f0: mean(num("f0")), age: mean(prof("age")), child: mean(prof("child")), female: mean(prof("female")) };
});
const [a, c] = summary;
let picked = a;
if (a.penalty !== null && c.penalty !== null && c.penalty < a.penalty - 0.03) picked = c;
const report = { hash, done: true, rows, summary, picked: { id: picked.id, name: picked.name, voiceId: picked.voiceId, reason: "меньший средний штраф (CER + темп + профиль); при равенстве — remix2" } };
writeJson(REPORT, report);
for (const r of rows) console.log(`  ${r.file}: CER ${r.cer}, F0 ${r.f0}, ${JSON.stringify(r.profile)} — «${r.heard}»`);
for (const s of summary) console.log(`  ${s.id}: штраф ${s.penalty}, CER ${s.cer}, F0 ${s.f0}, возраст ${s.age}, ребёнок ${s.child}`);
console.log(`✓ голос мальчика: ${picked.name} (${picked.voiceId})`);
