// Полная озвучка фильма №35: файл на реплику, голос роли — PHT_VOICES
// (src/programmers-hardest-task/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/programmers-hardest-task/, повторно не
// синтезируется. Новая или изменённая реплика синтезируется в нескольких
// дублях (PHT_TAKES, по умолчанию 3); в фильм идёт дубль, который Meta MMS
// распознаёт точнее (scripts/ts2d_asr.py). Прежний дубль того же текста и
// голоса тоже участвует в сравнении. Число дублей — PHT_VOICES[роль].takes
// (или PHT_TAKES). Темп не меняется: длительность монтажа
// подстраивается под речь (timing.ts), а не наоборот.
//
// Запуск: npm run audio:voice:programmers-hardest-task (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PHT_LINES, PHT_VIDEO, PHT_VOICES, PHT_VOICES_CONFIRMED } from "../src/programmers-hardest-task/script.ts";
import { checkPhtPlan, planPht } from "../src/programmers-hardest-task/timing.ts";
import { lineSeed, phtHash, synthLine, voiceOfRole } from "./lib/pht-tts.mjs";

const OUT = join("public", PHT_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

if (!PHT_VOICES_CONFIRMED) {
  console.log("Голоса ещё не подтверждены пробами (PHT_VOICES_CONFIRMED = false) — полная озвучка не создаётся.");
  process.exit(0);
}
const ids = Object.values(PHT_VOICES).map((v) => v.voiceId);
if (new Set(ids).size !== ids.length) throw new Error("У четырёх ролей должны быть четыре разных голоса (PHT_VOICES).");

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "pht", video: PHT_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TAKES_ENV = process.env.PHT_TAKES ? Number(process.env.PHT_TAKES) : null;
if (!apiKey && !existsSync(MANIFEST)) {
  console.log("ELEVENLABS_API_KEY не задан и озвучки нет — фильм собирается только для предпросмотра.");
  process.exit(0);
}
const TMP = join(tmpdir(), "balago-pht-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of PHT_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = phtHash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  if (old && old.voiceId === voice.voiceId && old.spoken === (line.spoken ?? line.text) && (old.tag ?? null) === (line.tag ?? null) && existsSync(join(OUT, file))) {
    const path = join(TMP, `${line.id}-prev.mp3`);
    copyFileSync(join(OUT, file), path);
    const { asrCer: _c, asrHeard: _h, f0: _f, takes: _t, hash: _x, ...info } = old;
    takes.push({ path, info, seed: old.seed, prev: true });
  }
  const takesN = TAKES_ENV ?? line.takes ?? PHT_VOICES[line.role].takes ?? 3;
  for (let k = 0; k < takesN; k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    try {
      const info = await synthLine(apiKey, line, voice, path, seed);
      takes.push({ path, info, seed });
      made++;
    } catch (e) {
      console.warn(`  ⚠ ${line.id} seed ${seed}: ${e.message}`);
    }
  }
  if (!takes.length) throw new Error(`${line.id}: ни одного дубля`);
  lines.push(null);
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

let scores = null;
if (pending.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text })))));
  try {
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый новый дубль`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const fresh = ranked.filter((t) => !t.prev);
  // меньше CER — разборчивее; при равенстве — первый (seed по порядку)
  const best = scores ? ranked.reduce((a, b) => ((b.asr?.cer ?? Infinity) < (a.asr?.cer ?? Infinity) ? b : a)) : fresh[0] ?? ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, prev: Boolean(t.prev), cer: t.asr?.cer ?? null, speechSec: t.info.speechEnd - t.info.speechStart })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}` + (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""));
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);

const plan = planPht({ version: 1, kind: "pht", lines });
console.log(`Длительность фильма по озвучке: ${(plan.totalFrames / PHT_VIDEO.fps).toFixed(2)} с (${plan.totalFrames} кадров)`);
const problems = checkPhtPlan(plan);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
