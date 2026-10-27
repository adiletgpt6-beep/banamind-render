// Озвучка фильма №33 «Мама на старом видео»: файл на реплику, у каждой роли
// свой готовый кыргызский голос проекта (MOV_VOICES в
// src/moms-old-video/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/moms-old-video/, повторно не синтезируется.
// Новая или изменённая реплика синтезируется в нескольких дублях (MOV_TAKES,
// по умолчанию 3); в фильм идёт дубль, который Meta MMS распознаёт точнее
// (scripts/ts2d_asr.py: CER по буквам и основной тон). Если реплика
// перегенерируется (новый seed), прежний дубль участвует в сравнении.
// Речь не ускоряется и не обрезается: монтаж подстраивается под озвучку.
//
// MOV_ONLY=s01,m01 — синтезировать только эти реплики (пробные дубли
// ключевых реплик); остальные остаются как есть, manifest помечается partial.
//
// Запуск: npm run audio:voice:moms-old-video (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MOV_LINES, MOV_VIDEO } from "../src/moms-old-video/script.ts";
import { checkMovTiming } from "../src/moms-old-video/timing.ts";
import { lineSeed, movHash, synthLine, voiceOfRole } from "./lib/mov-tts.mjs";

const OUT = join("public", MOV_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const only = new Set((process.env.MOV_ONLY ?? "").split(",").map((s) => s.trim()).filter(Boolean));
const TAKES = Number(process.env.MOV_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "mov33", video: MOV_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

if (!apiKey && !existsSync(MANIFEST)) {
  console.log("ELEVENLABS_API_KEY не задан и озвучки нет — пропуск.");
  process.exit(0);
}
const TMP = join(tmpdir(), "balago-mov33-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
let skipped = 0;
for (const line of MOV_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = movHash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (only.size && !only.has(line.id)) {
    skipped++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  // прежний дубль того же текста и голоса — тоже кандидат
  if (!line.pick && old && old.voiceId === voice.voiceId && old.spoken === (line.spoken ?? line.text) && (old.tag ?? null) === (line.tag ?? null) && existsSync(join(OUT, file))) {
    const path = join(TMP, `${line.id}-prev.mp3`);
    copyFileSync(join(OUT, file), path);
    const { asrCer: _c, asrHeard: _h, f0: _f, takes: _t, hash: _x, ...info } = old;
    takes.push({ path, info, seed: old.seed, prev: true });
  }
  // pick — выбранный по замерам дубль: синтезируется только он
  for (let k = 0; k < (line.pick ? 1 : TAKES); k++) {
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
// Естественный темп кыргызской речи этих голосов — 10–15 букв/с. Дубль вне
// этого диапазона (скомканный или растянутый) получает штраф при выборе.
const letters = (s) => [...s].filter((c) => /\p{L}/u.test(c)).length;
const pace = (line, info) => letters(line.spoken ?? line.text) / Math.max(0.2, info.speechEnd - info.speechStart);
const paceFine = (p) => Math.max(0, 10 - p) * 0.02 + Math.max(0, p - 15.5) * 0.02;
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null, pace: pace(p.line, t.info) }));
  const score = (t) => (t.asr?.cer ?? 0.5) + paceFine(t.pace) + (t.info.tag === null && p.line.tag ? 0.01 : 0);
  const fresh = ranked.filter((t) => !t.prev);
  const best = scores ? ranked.reduce((a, b) => (score(b) < score(a) ? b : a)) : fresh[0] ?? ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    pace: Number(best.pace.toFixed(1)),
    takes: ranked.map((t) => ({
      seed: t.seed,
      prev: Boolean(t.prev),
      cer: t.asr?.cer ?? null,
      f0: t.asr?.f0 ?? null,
      heard: t.asr?.heard ?? null,
      pace: Number(t.pace.toFixed(1)),
      speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)),
    })),
  };
  console.log(
    `✓ ${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}, ${best.pace.toFixed(1)} букв/с` +
      (best.asr ? `, CER ${best.asr.cer}, F0 ${best.asr.f0} Гц (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""),
  );
}
const partial = lines.filter(Boolean).length < MOV_LINES.length;
save(partial);
console.log(`Реплик: ${lines.filter(Boolean).length}/${MOV_LINES.length} (синтезов: ${made}, из кэша: ${reused}, пропущено: ${skipped})`);

// Монтаж подстраивается под озвучку: здесь только предупреждение.
// Финальный рендер останавливается, если реплики не помещаются в шкалу.
if (!partial) {
  const problems = checkMovTiming(lines);
  for (const p of problems) console.warn(`  ⚠ шкала: ${p}`);
}
