// Озвучка BalaGoBG020: файл на реплику, готовые кыргызские голоса проекта
// (BG020_VOICES), синтез и обработка — общий модуль scripts/lib/ts2d-tts.mjs
// (только импорт, без изменений): страховочное слово против обрезанного
// конца, обрезка тишины, выравнивание громкости, тайминги букв для губ.
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-020/, повторно не синтезируется.
// Новая реплика — в TAKES дублях; в ролик идёт дубль, который Meta MMS
// распознаёт точнее (scripts/ts2d_asr.py), если распознавание доступно.
//
//   ELEVENLABS_API_KEY=… node scripts/campaign50/bg-020/voice.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG020_LINES, BG020_VIDEO, BG020_VOICES } from "../../../src/campaign50/bg-020/script.ts";
import { buildBg020Timeline, checkBg020Timeline } from "../../../src/campaign50/bg-020/timeline.ts";
import { synthLine, ts2Hash } from "../../lib/ts2d-tts.mjs";

const OUT = join("public", BG020_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG020_TAKES ?? 3);
const seedOf = (l) => l.seed ?? 2100;

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const TMP = join(tmpdir(), "balago-bg020-takes");
mkdirSync(TMP, { recursive: true });

const lines = [];
const pending = [];
let made = 0;
let reused = 0;
for (const line of BG020_LINES) {
  const voice = BG020_VOICES[line.role];
  const hash = ts2Hash(line, voice.voiceId, seedOf(line));
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
    const seed = seedOf(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    const info = await synthLine(apiKey, line, voice, path, seed);
    takes.push({ path, info, seed });
    made++;
  }
  lines.push(null);
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

let scores = null;
if (pending.length && process.env.BG020_NO_ASR !== "1") {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text })))));
  try {
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${String(e.message).split("\n")[0]}) — берётся первый дубль`);
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
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(2)) })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}${best.asr ? `, CER ${best.asr.cer} (${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""}`);
}
const manifest = { version: 1, kind: "bg020", video: BG020_VIDEO.id, lines };
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
const tl = buildBg020Timeline(manifest);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused}). Длительность ролика: ${tl.durationSec.toFixed(2)} с`);
for (const c of tl.cues) console.log(`  ${c.id}: ${c.from.toFixed(2)}–${c.to.toFixed(2)} с`);
const problems = checkBg020Timeline(tl);
if (problems.length) {
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
