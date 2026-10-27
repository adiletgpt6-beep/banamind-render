// Озвучка BalaGoBG046: файл на реплику, голос роли — готовые кыргызские
// голоса проекта (BG46_VOICES в src/campaign50/bg-046/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-046/voice/, повторно не
// синтезируется (сохранённые MP3 не запрашиваются заново). Новая или
// изменённая реплика синтезируется в 3 дублях; в ролик идёт дубль, который
// Meta MMS распознаёт точнее (asr.py). Темп речи не меняется: сцены
// растягиваются под фактическую длину реплик (src/campaign50/bg-046/timing.ts).
//
// Запуск: node scripts/campaign50/bg-046/voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG46_LINES, BG46_VIDEO } from "../../../src/campaign50/bg-046/script.ts";
import { buildBg46Timeline, checkBg46Timeline } from "../../../src/campaign50/bg-046/timing.ts";
import { bg46Hash, lineSeed, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", BG46_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG46_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) => writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg046", video: BG46_VIDEO.id, partial, lines }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg046-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
// Ошибка синтеза посередине не должна выбрасывать уже оплаченные дубли:
// готовые реплики оцениваются и сохраняются (manifest partial: true),
// следующий запуск синтезирует только недостающие.
let failure = null;
for (const line of BG46_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = bg46Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (failure) continue;
  if (!apiKey) {
    failure = new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
    continue;
  }
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
    console.error(`  ✗ ${line.id}: ${e.message}`);
  }
  // даже неполный набор дублей реплики (≥ 1) идёт в оценку и сохраняется
  if (!takes.length) continue;
  lines.push(null);
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

let scores = null;
if (pending.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text })))));
  try {
    execFileSync("python3", ["scripts/campaign50/bg-046/asr.py", "--score", inp, out], { stdio: "inherit" });
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
save(Boolean(failure));
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);
if (failure) {
  console.error(`Озвучка неполная (сохранено ${lines.length} из ${BG46_LINES.length}): ${failure.message}`);
  process.exit(1);
}
const tl = buildBg46Timeline({ version: 1, kind: "bg046", lines });
console.log(`Длительность ролика: ${(tl.frames / BG46_VIDEO.fps).toFixed(2)} с; последнее слово: ${tl.speechEnd.toFixed(2)} с`);
const problems = checkBg46Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
