// Озвучка BalaGoBG030: файл на реплику, голоса ролей — готовые кыргызские
// голоса проекта (BG30_VOICES в src/campaign50/bg-030/script.ts).
//
// • Платный синтез — только для утверждённого сценария (BG30_PRODUCTION).
// • Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки,
//   seed), уже лежащая в public/audio/campaign50/bg-030/voice/, повторно
//   не синтезируется.
// • Новая или изменённая реплика — 3 дубля; в ролик идёт дубль, который
//   Meta MMS распознаёт точнее (asr.py). В CI без работающего распознавания
//   синтез не начинается (иначе оплаченные дубли выбирались бы вслепую).
// • Если синтез оборвался, уже оплаченные реплики сохраняются (partial),
//   повторный запуск досинтезирует только недостающие.
// • Темп речи не меняется: сцены растягиваются под фактическую длину реплик.
//
// Запуск: node scripts/campaign50/bg-030/voice.mjs [--plan]
//   --plan — только план: сколько реплик и символов уйдёт в синтез (бесплатно).
// Нужен ELEVENLABS_API_KEY.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG30_LINES, BG30_PRODUCTION, BG30_VIDEO } from "../../../src/campaign50/bg-030/script.ts";
import { buildBg30Timeline, checkBg30Timeline } from "../../../src/campaign50/bg-030/timing.ts";
import { bg30Hash, lineSeed, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", BG30_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG30_TAKES ?? 3);
const planOnly = process.argv.includes("--plan");

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));

// план: что уже есть, что нужно синтезировать
const todo = [];
for (const line of BG30_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = bg30Hash(line, voice.voiceId);
  const old = prevById.get(line.id);
  const cached = old?.hash === hash && existsSync(join(OUT, `${line.id}.mp3`));
  if (!cached) todo.push(line);
}
const chars = todo.reduce((n, l) => n + (l.spoken ?? l.text).length + (l.tag ? l.tag.length + 1 : 0) + 8, 0);
console.log(`План: реплик ${BG30_LINES.length}, синтезировать ${todo.length} × ${TAKES} дубля ≈ ${chars * TAKES} символов (с запасным словом).`);
for (const l of todo) console.log(`  • ${l.id} [${l.role}] «${l.spoken ?? l.text}»`);
if (planOnly) process.exit(0);
if (todo.length && BG30_PRODUCTION.approved !== true) {
  console.error("Сценарий BG-030 не утверждён (BG30_PRODUCTION.approved) — платный синтез не запускается.");
  process.exit(1);
}
if (todo.length && !apiKey) throw new Error("Нужна озвучка, а ELEVENLABS_API_KEY не задан.");
// распознавание обязательно в CI: проверяем до первого платного запроса
if (todo.length && process.env.CI) {
  try {
    execFileSync("python3", ["-c", "import torch, transformers, numpy"], { stdio: "inherit" });
  } catch {
    console.error("Распознавание речи (torch/transformers) недоступно — синтез не запускается, чтобы не выбирать дубли вслепую.");
    process.exit(1);
  }
}

const lines = [];
const save = (partial) => writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg030", video: BG30_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg030-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
let failure = null;
for (const line of BG30_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = bg30Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (failure) continue;
  const takes = [];
  try {
    for (let k = 0; k < TAKES; k++) {
      const seed = lineSeed(line) + k * 11;
      const path = join(TMP, `${line.id}-${seed}.mp3`);
      const info = await synthLine(apiKey, line, voice, path, seed);
      takes.push({ path, info, seed });
      made++;
    }
  } catch (e) {
    failure = e;
    console.error(`✗ ${line.id}: ${e.message}`);
  }
  if (takes.length) {
    lines.push(null);
    pending.push({ line, hash, file, takes, index: lines.length - 1 });
  }
}

let scores = null;
if (pending.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text })))));
  try {
    execFileSync("python3", ["scripts/campaign50/bg-030/asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый дубль`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const best = scores ? ranked.reduce((a, b) => ((b.asr?.cer ?? Infinity) < (a.asr?.cer ?? Infinity) ? b : a)) : ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")}) — «${best.asr.heard}»` : ""));
}
const complete = !failure && lines.filter(Boolean).length === BG30_LINES.length;
save(!complete);
console.log(`Реплик: ${lines.filter(Boolean).length}/${BG30_LINES.length} (синтезов: ${made}, из кэша: ${reused})`);
if (!complete) {
  console.error("Озвучка неполная: сохранены оплаченные реплики, повторный запуск досинтезирует остальные.");
  process.exit(1);
}
const tl = buildBg30Timeline({ version: 1, kind: "bg030", lines });
console.log(`Длительность ролика: ${(tl.frames / BG30_VIDEO.fps).toFixed(2)} с; последнее слово: ${tl.speechEnd.toFixed(2)} с`);
const problems = checkBg30Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
