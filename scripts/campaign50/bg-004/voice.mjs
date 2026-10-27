// Озвучка BalaGoBG004 (BG-004): файл на реплику, голос диктора — готовый
// кыргызский голос проекта (BG04_VOICE в src/campaign50/bg-004/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-004/, повторно не синтезируется.
// Новая или изменённая реплика синтезируется в 3 дублях; в ролик идёт дубль,
// который Meta MMS распознаёт точнее (общий scripts/ts2d_asr.py, только
// чтение). Речь не ускоряется и не обрезается: монтаж подстраивается под
// фактическую длительность (timing.ts).
//
// Запуск: node scripts/campaign50/bg-004/voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG04_LINES, BG04_VIDEO } from "../../../src/campaign50/bg-004/script.ts";
import { buildBg04Timeline, checkBg04Timeline } from "../../../src/campaign50/bg-004/timing.ts";
import { bg04Hash, lineSeed, narratorVoice, synthLine } from "./tts.mjs";

const OUT = join("public", BG04_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg004", video: BG04_VIDEO.id, partial, lines }, null, 2) + "\n");

const TAKES = Number(process.env.BG04_TAKES ?? 3);
if (!apiKey && !existsSync(MANIFEST)) {
  console.error("ELEVENLABS_API_KEY не задан и озвучки нет.");
  process.exit(1);
}
const TMP = join(tmpdir(), "balago-bg004-takes");
mkdirSync(TMP, { recursive: true });
const voice = narratorVoice();
const pending = [];
let made = 0;
let reused = 0;
for (const line of BG04_LINES) {
  const hash = bg04Hash(line, voice.voiceId);
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
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый новый дубль`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const fresh = ranked.filter((t) => !t.prev);
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

const tl = buildBg04Timeline({ version: 1, kind: "bg004", lines });
console.log(`Длительность ролика: ${tl.durationSec.toFixed(2)} с; сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
const problems = checkBg04Timeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) {
  console.error("✗ Шкала не проходит проверку — поправьте minSec/lead в src/campaign50/bg-004/script.ts");
  process.exit(1);
}
