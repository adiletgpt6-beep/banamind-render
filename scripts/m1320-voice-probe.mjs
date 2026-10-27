// Пробы голосов BalaGoMeeting1320 (сценарий №31) до полной озвучки.
//
// Роли и кандидаты — M13_PROBE_CANDIDATES (src/meeting-1320/script.ts):
// только голоса, уже созданные в аккаунте проекта (ElevenLabs Voice
// Design). Отец — проверенный KG-husband; он тоже читает свои пробные
// реплики, чтобы рассказчик заметно отличался от него по высоте голоса.
//   narrator  — N01 (начало, любопытство) и N07 (раскрытие, тепло);
//   assistant — A01 и A02;
//   son       — S02 (радость) и S03 (вечерний вопрос).
// Каждый кандидат читает свои реплики одним дублем (eleven_v3, ky); файлы
// склеиваются в <role>-<id>-all.mp3 для прослушивания. Оценка
// scripts/m1320_asr.py: CER распознавания Meta MMS, медиана F0, профиль
// голоса (возраст, «женщина / мужчина / ребёнок») — технический замер, не
// прослушивание. Выбор (picked): меньший средний штраф takePenalty среди
// кандидатов с подходящим профилем (рассказчик — мужской и отличный от отца
// по F0 не меньше чем на 8 Гц; помощница — женский). Тон не повышается,
// речь не ускоряется.
// Итог: voice-samples/meeting-1320/probe/report.json + MP3. Повторно не
// запускается при той же конфигурации (хэш).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { M13_LINES, M13_PROBE_CANDIDATES, M13_TTS, M13_VOICES } from "../src/meeting-1320/script.ts";
import { synthLine, takePenalty } from "./lib/m1320-tts.mjs";
import { ffmpeg } from "./lib/audio.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const OUT = "voice-samples/meeting-1320/probe";
const REPORT = join(OUT, "report.json");
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
// Пробы — разовый кастинг голосов. Реплики проб зафиксированы такими, какими
// были при кастинге: правка реплики в фильме (тег F02 убран, чтобы фраза
// звучала чётче) не должна запускать пробы заново и менять выбранные голоса.
const PROBE_FROZEN = { F02: { tag: "[warmly]", spoken: undefined } };
const line = (id) => ({ ...M13_LINES.find((l) => l.id === id), ...(PROBE_FROZEN[id] ?? {}) });

const PROBE_LINES = {
  narrator: ["N01", "N07"],
  assistant: ["A01", "A02"],
  son: ["S02", "S03"],
  father: ["F01", "F02"],
};

const config = {
  v: 1,
  candidates: M13_PROBE_CANDIDATES,
  father: M13_VOICES.father,
  lines: Object.fromEntries(Object.entries(PROBE_LINES).map(([r, ids]) => [r, ids.map((id) => [id, line(id).spoken ?? line(id).text, line(id).tag ?? null])])),
  tts: M13_TTS,
};
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = readJson(REPORT, null);
if (prev?.hash === hash && prev.done) {
  console.log(`= пробы голосов уже сделаны (report.json): ${Object.entries(prev.picked ?? {}).map(([r, p]) => `${r} — ${p?.name}`).join(", ")}`);
  process.exit(0);
}
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

const concat = (parts, out) => {
  const inputs = parts.flatMap((p) => ["-i", p]);
  const chain = parts.map((_, i) => `[${i}:a]apad=pad_dur=0.6[a${i}]`).join(";");
  ffmpeg([...inputs, "-filter_complex", `${chain};${parts.map((_, i) => `[a${i}]`).join("")}concat=n=${parts.length}:v=0:a=1[o]`, "-map", "[o]", "-codec:a", "libmp3lame", "-b:a", "160k", out]);
};

const items = [];
const failed = [];
const roles = [...Object.keys(M13_PROBE_CANDIDATES), "father"];
for (const role of roles) {
  const cands = role === "father" ? [{ id: "husband", ...M13_VOICES.father, from: "№10–№30" }] : M13_PROBE_CANDIDATES[role];
  for (const c of cands) {
    const files = [];
    try {
      for (const id of PROBE_LINES[role]) {
        const l = line(id);
        const file = `${role}-${c.id}-${id.toLowerCase()}.mp3`;
        const info = await synthLine(apiKey, l, { name: c.name, voiceId: c.voiceId }, join(OUT, file));
        items.push({ role, who: c.id, line: l, file, info });
        files.push(join(OUT, file));
      }
      concat(files, join(OUT, `${role}-${c.id}-all.mp3`));
    } catch (e) {
      // голос недоступен в аккаунте — кандидат выбывает
      console.warn(`  ⚠ ${role}/${c.name}: ${e.message.split("\n")[0]}`);
      failed.push({ role, id: c.id, name: c.name, error: e.message.slice(0, 200) });
    }
  }
}

// оценка: CER (MMS), F0, профиль
const inp = join(OUT, "score-in.json");
const outp = join(OUT, "score-out.json");
writeJson(inp, items.map((it) => ({ path: join(OUT, it.file), text: it.line.spoken ?? it.line.text })));
let scores = new Map();
try {
  execFileSync("python3", ["scripts/m1320_asr.py", "--score", inp, outp], { stdio: "inherit" });
  scores = new Map(readJson(outp, []).map((r) => [r.path, r]));
} catch (e) {
  console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
}
const rows = items.map((it) => {
  const asr = scores.get(join(OUT, it.file)) ?? null;
  return {
    role: it.role,
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
const summarize = (role, c) => {
  const r = rows.filter((x) => x.role === role && x.who === c.id);
  const num = (k) => r.map((x) => x[k]).filter((x) => typeof x === "number");
  const prof = (k) => r.map((x) => x.profile?.[k]).filter((x) => typeof x === "number");
  return { role, id: c.id, name: c.name, voiceId: c.voiceId, from: c.from, n: r.length, penalty: mean(num("penalty")), cer: mean(num("cer")), f0: mean(num("f0")), age: mean(prof("age")), female: mean(prof("female")), male: mean(prof("male")), child: mean(prof("child")) };
};
const summary = [];
for (const role of roles) {
  const cands = role === "father" ? [{ id: "husband", ...M13_VOICES.father, from: "№10–№30" }] : M13_PROBE_CANDIDATES[role];
  for (const c of cands) summary.push(summarize(role, c));
}
const fatherF0 = summary.find((s) => s.role === "father")?.f0 ?? null;
const ok = (s) => {
  if (!s.n || s.penalty === null) return false;
  if (s.role === "narrator") return (s.male === null || s.male >= 0.5) && (fatherF0 === null || s.f0 === null || Math.abs(s.f0 - fatherF0) >= 8);
  if (s.role === "assistant") return s.female === null || s.female >= 0.5;
  return true;
};
const picked = {};
const reasons = {
  narrator: "меньший средний штраф (CER + темп) среди мужских голосов, отличных от отца по F0 ≥ 8 Гц",
  assistant: "меньший средний штраф (CER + темп) среди женских голосов",
  son: "меньший средний штраф (CER + темп + профиль «ребёнок»/возраст)",
};
for (const role of Object.keys(M13_PROBE_CANDIDATES)) {
  const all = summary.filter((s) => s.role === role && s.n);
  const pool = all.filter(ok).length ? all.filter(ok) : all;
  // при равенстве штрафа (разница < 0,01) — порядок кандидатов в script.ts
  const best = pool.reduce((a, b) => (a === null || (b.penalty ?? 9) < (a.penalty ?? 9) - 0.01 ? b : a), null);
  if (best) picked[role] = { id: best.id, name: best.name, voiceId: best.voiceId, reason: reasons[role] };
}
const done = Object.keys(M13_PROBE_CANDIDATES).every((r) => picked[r]);
writeJson(REPORT, { hash, done, rows, summary, failed, fatherF0, picked });
for (const r of rows) console.log(`  ${r.file}: CER ${r.cer}, F0 ${r.f0}, ${JSON.stringify(r.profile)} — «${r.heard}»`);
for (const s of summary) console.log(`  ${s.role}/${s.name}: штраф ${s.penalty}, CER ${s.cer}, F0 ${s.f0}, возраст ${s.age}, м ${s.male}, ж ${s.female}, ребёнок ${s.child}`);
for (const [r, p] of Object.entries(picked)) console.log(`✓ ${r}: ${p.name} (${p.voiceId})`);
if (!done) {
  console.error("✗ не для всех ролей выбран голос");
  process.exit(1);
}
