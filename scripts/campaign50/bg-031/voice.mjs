// Озвучка BalaGoBG031: файл на реплику, голос роли — готовые кыргызские
// голоса проекта (BG31_VOICES в src/campaign50/bg-031/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-031/voice/, повторно не
// синтезируется (сохранённые MP3 не запрашиваются заново). Новая или
// изменённая реплика синтезируется в 3 дублях; в ролик идёт дубль, который
// Meta MMS распознаёт точнее (asr.py). Темп речи не меняется: сцены
// растягиваются под фактическую длину реплик (src/campaign50/bg-031/timing.ts).
//
// Запуск: node scripts/campaign50/bg-031/voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG31_LINES, BG31_VIDEO } from "../../../src/campaign50/bg-031/script.ts";
import { buildBg31Timeline, checkBg31Timeline } from "../../../src/campaign50/bg-031/timing.ts";
import { bg31Hash, lineSeed, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", BG31_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG31_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.filter(Boolean).map((l) => [l.id, l]));
const lines = [];
// partial: true — озвучены не все реплики (сбой посреди прогона); готовые
// реплики всё равно сохраняются и коммитятся, следующий прогон досинтезирует
// только недостающие. Финальный рендер partial-озвучку не принимает.
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg031", video: BG31_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg031-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let failure = null;
let made = 0;
let reused = 0;
for (const line of BG31_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = bg31Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    // хэш считается по тексту синтеза; экранный text мог уточниться
    lines.push({ ...old, text: line.text, spoken: line.spoken ?? line.text });
    reused++;
    continue;
  }
  // после сбоя — только забираем готовые реплики из кэша, без синтеза
  if (failure) continue;
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  try {
    for (let k = 0; k < TAKES; k++) {
      const seed = lineSeed(line) + k * 11;
      const path = join(TMP, `${line.id}-${seed}.mp3`);
      const info = await synthLine(apiKey, line, voice, path, seed);
      // все оплаченные дубли с таймингами — в артефакт (можно заменить
      // выбранный дубль вручную без нового синтеза)
      writeFileSync(path.replace(/\.mp3$/, ".json"), JSON.stringify(info));
      takes.push({ path, info, seed });
      made++;
    }
  } catch (e) {
    failure = e;
    console.error(`  ✗ ${line.id}: ${e.message}`);
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
    execFileSync("python3", ["scripts/campaign50/bg-031/asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый дубль`);
  }
}
// Годный дубль: все слова выровнены по таймингам (иначе сдвинется
// синхронизация графики по словам), а вопрос мамы в хуке укладывается в
// первые 3 с (timing.ts). Из годных — лучший по распознаванию MMS; все
// дубли уже оплачены, лишних запросов нет.
const wordsWanted = (line) => (line.spoken ?? line.text).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const fits = (p, t) =>
  (p.line.scene === "cta" || t.info.words.length === wordsWanted(p.line)) &&
  (p.line.scene !== "hook" || BG31_LINES.find((l) => l.id === p.line.id).at + t.info.speechEnd - t.info.speechStart <= 3.1);
for (const p of pending) {
  const all = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const good = all.filter((t) => fits(p, t));
  if (!good.length) console.warn(`  ⚠ ${p.line.id}: нет дубля, подходящего по словам/длине хука — берётся лучший из всех`);
  const ranked = good.length ? good : all;
  const best = scores ? ranked.reduce((a, b) => ((b.asr?.cer ?? Infinity) < (a.asr?.cer ?? Infinity) ? b : a)) : ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: all.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, words: t.info.words.length, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer} (дубли: ${all.map((t) => t.asr?.cer ?? "?").join(" / ")}) — «${best.asr.heard}»` : ""));
}
save(Boolean(failure));
console.log(`Реплик: ${lines.filter(Boolean).length} из ${BG31_LINES.length} (синтезов: ${made}, из кэша: ${reused})`);
if (failure) {
  console.error(`Озвучка неполная: ${failure.message}. Готовые реплики сохранены; повторный запуск досинтезирует остальные.`);
  process.exit(1);
}
const tl = buildBg31Timeline({ version: 1, kind: "bg031", lines });
console.log(`Длительность ролика: ${(tl.frames / BG31_VIDEO.fps).toFixed(2)} с; последнее слово: ${tl.speechEnd.toFixed(2)} с`);
const problems = checkBg31Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
