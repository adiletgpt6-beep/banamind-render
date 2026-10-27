// Озвучка BalaGoBG042: файл на реплику → public/audio/campaign50/bg-042/.
//
// Голоса — готовые кыргызские голоса проекта (BG42_VOICES в script.ts):
// ведущий KG-boss, репортёр NB2-brother, мама KG-mother, диктор KG-teacher.
//
// Кэш: реплика с тем же хэшем (текст произношения, тег, голос, модель,
// настройки, seed), уже лежащая в каталоге, повторно не синтезируется — за
// те же реплики не платим дважды. Новая/изменённая реплика синтезируется в
// BG42_TAKES дублях (по умолчанию 3); в ролик идёт дубль, который Meta MMS
// распознаёт точнее (scripts/ts2d_asr.py, только чтение). Без ключа скрипт
// завершается с ошибкой, если нужен хоть один новый синтез (так workflow
// понимает, нужна ли установка распознавания).
//
//   ELEVENLABS_API_KEY=… node scripts/campaign50/bg-042/voice.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG42_LINES, BG42_VIDEO, spokenOf, spokenWords } from "../../../src/campaign50/bg-042/script.ts";
import { MANIFEST, VOICE_DIR } from "./common.mjs";
import { lineHash, synthLine, voiceOf } from "./tts.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG42_TAKES ?? 3);
mkdirSync(VOICE_DIR, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const round3 = (x) => Number(x.toFixed(3));

const lines = [];
const pending = [];
for (const line of BG42_LINES) {
  const hash = lineHash(line);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(VOICE_DIR, file))) {
    lines.push(old);
    continue;
  }
  lines.push(null);
  pending.push({ line, hash, file, index: lines.length - 1 });
}
const save = (partial) =>
  writeFileSync(
    MANIFEST,
    JSON.stringify({ version: 1, kind: "bg042", video: BG42_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n",
  );

if (!pending.length) {
  console.log(`Озвучка актуальна: ${lines.length} реплик из кэша, синтезов нет.`);
  process.exit(0);
}
if (!apiKey) {
  console.error(`Нужен синтез: ${pending.map((p) => p.line.id).join(", ")}, а ELEVENLABS_API_KEY не задан.`);
  process.exit(3);
}

const TMP = join(tmpdir(), "balago-bg042-takes");
mkdirSync(TMP, { recursive: true });
let made = 0;
for (const p of pending) {
  p.takes = [];
  for (let k = 0; k < TAKES; k++) {
    const seed = p.line.seed + k * 11;
    const path = join(TMP, `${p.line.id}-${seed}.mp3`);
    const info = await synthLine(apiKey, p.line, path, seed);
    p.takes.push({ path, info, seed });
    made++;
  }
}

let scores = null;
const inp = join(TMP, "score-in.json");
const out = join(TMP, "score-out.json");
writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: spokenOf(p.line) })))));
try {
  execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
  scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
} catch (e) {
  console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся дубль с полным выравниванием слов`);
}

for (const p of pending) {
  const nWords = spokenWords(p.line).length;
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null, aligned: t.info.words.length === nWords }));
  // лучший: все слова выровнены (точные титры), затем меньший CER
  const score = (t) => (t.aligned ? 0 : 1) + (t.asr?.cer ?? 0.5);
  const best = ranked.reduce((a, b) => (score(b) < score(a) ? b : a));
  copyFileSync(best.path, join(VOICE_DIR, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    voiceName: voiceOf(p.line.role).name,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, aligned: t.aligned, speechSec: round3(t.info.speechEnd - t.info.speechStart) })),
  };
  console.log(`✓ ${p.line.id} [${voiceOf(p.line.role).name}]: дубль seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""));
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${lines.length - pending.length})`);
