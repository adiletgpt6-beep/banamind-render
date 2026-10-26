// Озвучка BalaGoBG034: файл на реплику, голос роли — готовые кыргызские
// голоса проекта (BG34_VOICES в src/campaign50/bg-034/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-034/voice/, повторно не
// синтезируется (сохранённые MP3 не запрашиваются заново). Новая или
// изменённая реплика синтезируется в 3 дублях; в ролик идёт дубль, который
// Meta MMS распознаёт точнее (asr.py). Темп речи не меняется: сцены
// растягиваются под фактическую длину реплик (src/campaign50/bg-034/timing.ts).
//
// Запуск: node scripts/campaign50/bg-034/voice.mjs (нужен ELEVENLABS_API_KEY).
//   --dry-run — только показать, какие реплики нужно синтезировать и сколько
//   символов это займёт (без запросов к ElevenLabs); в GitHub Actions пишет
//   pending=<число> в $GITHUB_OUTPUT.
import { execFileSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG34_LINES, BG34_VIDEO } from "../../../src/campaign50/bg-034/script.ts";
import { buildBg34Timeline, checkBg34Timeline } from "../../../src/campaign50/bg-034/timing.ts";
import { bg34Hash, lineSeed, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", BG34_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG34_TAKES ?? 3);
const dryRun = process.argv.includes("--dry-run");

const prev0 = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
if (dryRun) {
  const todo = BG34_LINES.filter((line) => {
    const voice = voiceOfRole(line.role);
    const old = prev0.lines.find((l) => l.id === line.id);
    return !(old?.hash === bg34Hash(line, voice.voiceId) && existsSync(join(OUT, `${line.id}.mp3`)));
  });
  const chars = todo.reduce((n, l) => n + (l.spoken ?? l.text).length + (l.tag ? l.tag.length + 1 : 0) + 8, 0);
  for (const l of todo) console.log(`  нужно синтезировать ${l.id}: «${l.spoken ?? l.text}»`);
  console.log(`Реплик к синтезу: ${todo.length} (≈ ${chars} символов × ${TAKES} дубля = ${chars * TAKES})`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `pending=${todo.length}\n`);
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) => writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg034", video: BG34_VIDEO.id, partial, lines }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg034-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of BG34_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = bg34Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  for (let k = 0; k < TAKES; k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    const info = await synthLine(apiKey, line, voice, path, seed);
    takes.push({ path, info, seed });
    made++;
  }
  lines.push(null);
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

let scores = null;
if (pending.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text })))));
  try {
    execFileSync("python3", ["scripts/campaign50/bg-034/asr.py", "--score", inp, out], { stdio: "inherit" });
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
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);
const tl = buildBg34Timeline({ version: 1, kind: "bg034", lines });
console.log(`Длительность ролика: ${(tl.frames / BG34_VIDEO.fps).toFixed(2)} с; последнее слово: ${tl.speechEnd.toFixed(2)} с`);
const problems = checkBg34Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
