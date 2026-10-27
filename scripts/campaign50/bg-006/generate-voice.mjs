// Озвучка BG-006 (BalaGoBG006): файл на реплику, голоса ролей — готовые
// кыргызские голоса проекта (B6_VOICES в src/campaign50/bg-006/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-006/, повторно не синтезируется
// (оплаченные MP3 не запрашиваются заново). Новая реплика синтезируется в
// 3 дублях; в ролик идёт дубль, который Meta MMS распознаёт точнее
// (scripts/campaign50/bg-006/asr.py).
//
// Запуск: node scripts/campaign50/bg-006/generate-voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { B6_DIALOG_END, B6_LINES, B6_SCENES, B6_VIDEO } from "../../../src/campaign50/bg-006/script.ts";
import { checkB6Timing } from "../../../src/campaign50/bg-006/timing.ts";
import { lineSeed, b6Hash, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", B6_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();


mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg006", video: B6_VIDEO.id, partial, lines }, null, 2) + "\n");

const TAKES = Number(process.env.B6_TAKES ?? 3);
// Без ключа и без готовых файлов ролик собирается по оценочным таймингам.
if (!apiKey && !existsSync(MANIFEST)) {
  console.log("ELEVENLABS_API_KEY не задан и озвучки нет — ролик собирается без голоса.");
  process.exit(0);
}
const TMP = join(tmpdir(), "balago-bg006-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of B6_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = b6Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  // прежний дубль того же текста и голоса — тоже кандидат
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
    execFileSync("python3", ["scripts/campaign50/bg-006/asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый новый дубль`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const next = B6_LINES[p.index + 1];
  const scene = B6_SCENES.find((s) => s.id === p.line.scene);
  const gap = next ? 0.3 : 0;
  const maxSpeech = Math.min(scene.to - 0.2, next ? next.at - gap : B6_DIALOG_END, B6_DIALOG_END) - p.line.at;
  // Разборчивый дубль должен целиком поместиться в сцену. Речь никогда
  // не ускоряется и не обрезается ради монтажного окна.
  const eligible = ranked.filter((t) => t.info.speechEnd - t.info.speechStart <= maxSpeech);
  if (!eligible.length) throw new Error(`${p.line.id}: ни один дубль не помещается в ${maxSpeech.toFixed(2)} с`);
  const fresh = eligible.filter((t) => !t.prev);
  const best = scores
    ? eligible.reduce((a, b) => ((b.asr?.cer ?? Infinity) < (a.asr?.cer ?? Infinity) ? b : a))
    : fresh[0] ?? eligible[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, prev: Boolean(t.prev), cer: t.asr?.cer ?? null, fits: eligible.includes(t), speechSec: t.info.speechEnd - t.info.speechStart })),
  };
  console.log(
    `✓ ${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}` +
      (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""),
  );
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);

const problems = checkB6Timing(lines);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) {
  console.error("✗ Реплики не помещаются в шкалу — сдвиньте at в src/campaign50/bg-006/script.ts");
  process.exit(1);
}
