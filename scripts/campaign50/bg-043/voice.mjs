// Озвучка BalaGoBG043 «Сүйлөгөн сааттар»: файл на реплику, голос роли —
// готовые кыргызские голоса проекта (BG43_VOICES в
// src/campaign50/bg-043/script.ts): «Жумуш сааты», «Мектеп сааты», апа,
// диктор.
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-043/voice/, повторно не
// синтезируется (сохранённые MP3 не запрашиваются заново). Новая или
// изменённая реплика синтезируется в 3 дублях (BG43_TAKES); в ролик идёт
// дубль, который Meta MMS распознаёт точнее (asr.py). Без распознавания
// (нет Python/torch) берётся первый дубль. Темп речи не меняется: сцены
// растягиваются под фактическую длину реплик (src/campaign50/bg-043/timing.ts).
//
// Запуск: node scripts/campaign50/bg-043/voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG43_LINES, BG43_VIDEO } from "../../../src/campaign50/bg-043/script.ts";
import { buildBg43Timeline, checkBg43Timeline } from "../../../src/campaign50/bg-043/timing.ts";
import { bg43Hash, lineSeed, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", BG43_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Math.max(1, Number(process.env.BG43_TAKES ?? 3) || 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map((prev.lines ?? []).map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg043", video: BG43_VIDEO.id, partial, lines }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg043-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of BG43_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = bg43Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    // звук тот же (хэш по произносимому тексту); подпись text — актуальная
    lines.push({ ...old, text: line.text, spoken: line.spoken ?? line.text });
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
    execFileSync("python3", ["scripts/campaign50/bg-043/asr.py", "--score", inp, out], { stdio: "inherit" });
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
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(
    `✓ ${p.line.id}: дубль seed ${best.seed}` +
      (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")}) — «${best.asr.heard}»` : ""),
  );
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);
const tl = buildBg43Timeline({ version: 1, kind: "bg043", lines });
console.log(`Длительность ролика: ${(tl.frames / BG43_VIDEO.fps).toFixed(2)} с; последнее слово: ${tl.speechEnd.toFixed(2)} с`);
for (const s of tl.scenes) console.log(`  ${s.id}: кадры ${s.from}–${s.from + s.frames} (${(s.frames / BG43_VIDEO.fps).toFixed(2)} с)`);
const problems = checkBg43Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
