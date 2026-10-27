// Выбор дублей озвучки ролика 80-1-4 (pick и groupPick в voices.json).
//
// Для каждой реплики сравниваются все её дубли:
//   1) распознавание (Whisper large-v3 в CI → docs/lesson80-1-4/voice-asr.json):
//      доля ошибок по буквам относительно «текст + Хорошо» — главный критерий
//      (дубль с потерянным или искажённым словом не выбирается);
//   2) отделение последнего слова от страховочного «Хорошо»: самая тихая точка
//      между ними (дБ) — чем тише, тем чище разрез и естественнее затухание;
//   3) пробы до массового синтеза (out/lesson80-1-4-takes-qa.json, если есть:
//      слепое прослушивание аудиомоделью) — дубль, где вопрос звучит
//      утверждением или восклицание — вопросом, получает штраф;
//   4) ручные решения — voices.json → pickFixed (имеют приоритет).
// Групповой ответ «Один! Аллах!»: для каждого голоса — лучший из его дублей;
// голос, у которого все дубли теряют слово, в смесь не идёт (groupSkip).
//
// Запуск: node scripts/lesson80-1-4-pick.mjs [--dry] [--lang=ky]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PACK } from "./lib/a4-lang.mjs";
import { decodeMono } from "./lib/audio.mjs";
import { plan, RAW } from "./lesson80-1-4-voice.mjs";

// языковая версия: --lang=ky — свои реплики, голоса и распознавание
const A4_LINES = PACK.lines;
const CFG = PACK.voices;
const cfg = JSON.parse(readFileSync(CFG, "utf8"));
const ASR = PACK.asr;
const asr = existsSync(ASR) ? JSON.parse(readFileSync(ASR, "utf8")).takes ?? {} : {};
const sampleQa = existsSync("out/lesson80-1-4-takes-qa.json") ? JSON.parse(readFileSync("out/lesson80-1-4-takes-qa.json", "utf8")) : [];
const SR = 48000;
const isLetter = (ch) => /[\p{L}\p{N}]/u.test(ch);
const rmsDb = (s, a, b) => {
  let acc = 0;
  a = Math.max(0, a);
  b = Math.min(s.length, b);
  for (let i = a; i < b; i++) acc += s[i] * s[i];
  return 20 * Math.log10(Math.sqrt(acc / Math.max(1, b - a)) || 1e-9);
};

// самая тихая точка между последней буквой реплики и началом «Хорошо»
const gapDb = (meta, pcm) => {
  const al = meta.alignment;
  const chars = al.characters.join("");
  const st = al.character_start_times_seconds;
  const en = al.character_end_times_seconds;
  const padAt = chars.lastIndexOf(meta.pad.replace(".", ""));
  if (padAt < 0) return { db: -60, gap: 1 };
  let b = padAt - 1;
  while (b > 0 && !isLetter(chars[b])) b--;
  const lo = Math.round((en[b] - 0.02) * SR);
  const hi = Math.round((st[padAt] + 0.04) * SR);
  const w = Math.round(0.01 * SR);
  let min = 0;
  for (let i = lo; i + w <= hi; i += w / 2) min = Math.min(min, rmsDb(pcm, i, i + w));
  return { db: min, gap: st[padAt] - en[b] };
};

const intonationPenalty = (key, text) => {
  const q = sampleQa.find((x) => x.key === key);
  const b = q?.blind;
  if (!b?.intonation) return 0;
  const want = text.trim().endsWith("?") ? "question" : text.trim().endsWith("!") ? "exclamation" : "statement";
  if (want === "question" && b.intonation !== "question") return 0.6;
  if (want !== "question" && b.intonation === "question") return 0.6;
  return 0;
};

const jobs = plan(true);
const report = [];
const pick = {};
const groupPick = {};
const groupSkip = [];
for (const line of A4_LINES) {
  const js = jobs.filter((j) => j.segId === line.id && !j.alt && existsSync(join(RAW, `${j.key}.mp3`)));
  const scored = js.map((j) => {
    const meta = JSON.parse(readFileSync(join(RAW, `${j.key}.json`), "utf8"));
    const g = gapDb(meta, decodeMono(join(RAW, `${j.key}.mp3`), SR));
    const a = asr[j.key];
    const cer = a ? a.cer : null;
    // тишина между словом и «Хорошо»: штраф, если громче −38 дБ
    const sep = (g.db > -38 ? Math.min(1, (g.db + 38) / 14) : 0) + (g.gap < 0.06 ? 0.4 : 0);
    const score = (cer ?? 0.05) * 10 + sep * 0.8 + intonationPenalty(j.key, line.text);
    return { j, cer, heard: a?.heard ?? null, gapDb: Number(g.db.toFixed(1)), gap: Number(g.gap.toFixed(3)), score: Number(score.toFixed(3)) };
  });
  if (line.role === "kids") {
    for (const v of cfg.group) {
      const own = scored.filter((s) => s.j.voice.name === v.name).sort((x, y) => x.score - y.score);
      if (!own.length) continue;
      groupPick[v.name] = own[0].j.gtake ?? 0;
      if (own[0].cer !== null && own[0].cer > 0.25) groupSkip.push(v.name);
      report.push({ id: line.id, voice: v.name, takes: own.map((s) => `${s.j.gtake}:${s.cer ?? "?"}/${s.gapDb}`), chosen: own[0].j.gtake });
    }
    continue;
  }
  scored.sort((x, y) => x.score - y.score || x.j.take - y.j.take);
  const fixed = cfg.pickFixed?.[line.id];
  const best = fixed !== undefined ? scored.find((s) => s.j.take === fixed) ?? scored[0] : scored[0];
  if (best.j.take !== 0) pick[line.id] = best.j.take;
  report.push({ id: line.id, chosen: best.j.take, fixed: fixed !== undefined, takes: scored.map((s) => `${s.j.take}: cer=${s.cer ?? "?"} gap=${s.gapDb} дБ/${s.gap} с «${s.heard ?? ""}»`) });
}
for (const r of report) console.log(r.id, r.voice ?? "", "→", r.chosen, r.fixed ? "(вручную)" : "", "\n   ", r.takes.join("\n    "));
if (!process.argv.includes("--dry")) {
  cfg.pick = pick;
  cfg.groupPick = groupPick;
  cfg.groupSkip = groupSkip;
  writeFileSync(CFG, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`voices.json: pick ${Object.keys(pick).length}, groupPick ${Object.keys(groupPick).length}, groupSkip ${groupSkip.join(", ") || "—"}`);
}
