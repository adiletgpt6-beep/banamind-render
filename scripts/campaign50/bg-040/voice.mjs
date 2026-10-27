// Озвучка BalaGoBG040: файл на реплику. Голоса и синтез — готовые
// кыргызские голоса проекта и функции 2D-ролика №12 (scripts/lib/ts2d-tts.mjs,
// импорт без изменений); eleven_v3, ky. Темп и высота тона не меняются.
// Роли → голоса: BG40_VOICE_OF (диктор — KG-husband, мама — KG-mother).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-040/, повторно не синтезируется —
// за те же реплики не платим второй раз. Новая или изменённая реплика
// синтезируется в BG40_TAKES дублях (по умолчанию 3); в ролик идёт дубль,
// который Meta MMS распознаёт точнее (scripts/ts2d_asr.py). Если синтез
// прервётся, уже оплаченные реплики сохраняются (partial manifest).
//
//   node scripts/campaign50/bg-040/voice.mjs          — синтез недостающего
//   node scripts/campaign50/bg-040/voice.mjs --check  — без API: 0 — всё
//       в кэше, 2 — нужен синтез.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG40_LINES, BG40_VIDEO, BG40_VOICE_OF } from "../../../src/campaign50/bg-040/script.ts";
import { buildBg40Timeline, checkBg40Timeline } from "../../../src/campaign50/bg-040/timing.ts";
import { lineSeed, synthLine, ts2Hash, voiceOfRole } from "../../lib/ts2d-tts.mjs";

const OUT = join("public", BG40_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG40_TAKES ?? 3);
const checkOnly = process.argv.includes("--check");

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map((prev.lines ?? []).map((l) => [l.id, l]));
const voiceOf = (line) => {
  const v = voiceOfRole(BG40_VOICE_OF[line.role]);
  if (!v) throw new Error(`Нет голоса для роли ${line.role}`);
  return v;
};
const cached = (line) => {
  const old = prevById.get(line.id);
  const file = `${line.id}.mp3`;
  return old?.hash === ts2Hash(line, voiceOf(line).voiceId) && existsSync(join(OUT, file)) ? old : null;
};

if (checkOnly) {
  const missing = BG40_LINES.filter((l) => !cached(l)).map((l) => l.id);
  // неполный/оценочный manifest или устаревший текст титров при том же
  // произношении — нужен обычный запуск (кэшированные реплики не оплачиваются)
  const stale = prev.kind !== "bg040" || prev.partial || prev.estimated || BG40_LINES.some((l) => {
    const old = cached(l);
    return old && (old.text !== l.text || (old.spoken ?? old.text) !== l.spoken);
  });
  console.log(missing.length ? `Нужен синтез: ${missing.join(", ")}` : stale ? "Manifest нужно обновить (без новых синтезов)." : "Все реплики в кэше.");
  process.exit(missing.length || stale ? 2 : 0);
}

const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg040", video: BG40_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-bg040-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
let failure = null;
for (const line of BG40_LINES) {
  const voice = voiceOf(line);
  const hash = ts2Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = cached(line);
  if (old) {
    // текст титров мог измениться при том же произношении — обновляем
    lines.push({ ...old, text: line.text, spoken: line.spoken });
    reused++;
    continue;
  }
  if (failure) continue;
  if (!apiKey) {
    failure = new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
    continue;
  }
  const takes = [];
  for (let k = 0; k < TAKES; k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    try {
      const info = await synthLine(apiKey, line, voice, path, seed);
      takes.push({ path, info, seed });
      made++;
    } catch (e) {
      failure = e;
      break;
    }
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
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
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
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: t.info.speechEnd - t.info.speechStart })),
  };
  console.log(`✓ ${p.line.id} [${best.info.voiceName}]: дубль seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer} «${best.asr.heard}» (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""));
}
const complete = !failure && lines.filter(Boolean).length === BG40_LINES.length;
save(!complete);
console.log(`Реплик: ${lines.filter(Boolean).length}/${BG40_LINES.length} (синтезов: ${made}, из кэша: ${reused})`);
if (failure) {
  console.error(`✗ Синтез прерван: ${failure.message}`);
  process.exit(1);
}

const tl = buildBg40Timeline({ version: 1, kind: "bg040", lines });
console.log(`Длительность ролика по озвучке: ${tl.durationSec.toFixed(2)} с; сцены: ${tl.scenes.map((s) => `${s.id} ${s.from.toFixed(1)}–${s.to.toFixed(1)}`).join(", ")}`);
const problems = checkBg40Timeline(tl);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length) process.exit(1);
