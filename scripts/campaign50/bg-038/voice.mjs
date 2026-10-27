// Озвучка BalaGoBG038: файл на реплику. Голоса и синтез — готовые
// кыргызские голоса и функции 2D-ролика №12 (scripts/lib/ts2d-tts.mjs,
// импорт без изменений): mother — KG-mother, narrator — KG-teacher;
// eleven_v3, ky. Темп и высота тона не меняются.
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки,
// seed), уже лежащая в public/audio/campaign50/bg-038/, повторно не
// синтезируется — за те же реплики не платим второй раз. Новая или
// изменённая реплика синтезируется в 3 дублях; в ролик идёт дубль,
// который Meta MMS распознаёт точнее (scripts/ts2d_asr.py).
//
// Запуск: node scripts/campaign50/bg-038/voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG38_LINES, BG38_VIDEO } from "../../../src/campaign50/bg-038/script.ts";
import { buildBg38Timeline, checkBg38Timeline } from "../../../src/campaign50/bg-038/timing.ts";
import { lineSeed, synthLine, ts2Hash, voiceOfRole } from "../../lib/ts2d-tts.mjs";

const OUT = join("public", BG38_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG38_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg038", video: BG38_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg038-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of BG38_LINES) {
  const voice = voiceOfRole(line.role);
  if (!voice) throw new Error(`Нет голоса для роли ${line.role}`);
  const hash = ts2Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    // звук тот же (хэш по произносимому тексту); обновляется только текст титров
    lines.push({ ...old, text: line.text, spoken: line.spoken ?? line.text });
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
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
    // Сбой синтеза: уже оплаченные реплики сохраняются (первый дубль),
    // манифест помечается partial — следующий запуск возьмёт их из кэша.
    for (const p of pending) {
      copyFileSync(p.takes[0].path, join(OUT, p.file));
      lines[p.index] = { ...p.takes[0].info, hash: p.hash, file: p.file, asrCer: null, asrHeard: null, f0: null };
    }
    save(true);
    throw e;
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
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый дубль`);
  }
}
// Обязательные слова (город) должны быть распознаны: дубль, где MMS их
// не услышал, уступает дублю с той же или чуть большей ошибкой (≤ +2 %).
const MUST = [/бишкек/i];
const missing = (p, t) => MUST.filter((re) => re.test(p.line.spoken ?? p.line.text) && !re.test(t.asr?.heard ?? "")).length;
const score = (p, t) => (t.asr?.cer ?? Infinity) + 0.02 * missing(p, t);
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const best = scores ? ranked.reduce((a, b) => (score(p, b) < score(p, a) ? b : a)) : ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: t.info.speechEnd - t.info.speechStart })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""));
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);

const tl = buildBg38Timeline({ version: 1, kind: "bg038", lines });
console.log(`Длительность ролика по озвучке: ${tl.durationSec.toFixed(2)} с; сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
const problems = checkBg38Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
