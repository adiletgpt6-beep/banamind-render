// Озвучка BalaGoBG021 (ElevenLabs eleven_v3, ky) — файл на реплику диктора.
// Синтез, обрезка тишины и выравнивание громкости — общей библиотекой
// проекта scripts/lib/ts2d-tts.mjs (только импорт, без изменений).
//
// Кэш: реплика с тем же хэшем (текст, голос, модель, настройки, seed), уже
// лежащая в public/audio/campaign50/bg-021/, повторно не синтезируется —
// за те же реплики не платим. Новая реплика синтезируется в BG021_TAKES
// дублях (по умолчанию 2); в ролик идёт дубль, который Meta MMS распознаёт
// точнее (scripts/ts2d_asr.py), без MMS — первый. Темп не меняется.
//
// Запуск: ELEVENLABS_API_KEY=… node scripts/campaign50/bg-021/generate-voice.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG021_LINES, BG021_TTS, BG021_VIDEO } from "../../../src/campaign50/bg-021/script.ts";
import { synthLine, ts2Hash } from "../../lib/ts2d-tts.mjs";

const OUT = join("public", BG021_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG021_TAKES ?? 2);
const voice = BG021_TTS.narrator;

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const TMP = join(tmpdir(), "balago-bg021-takes");
mkdirSync(TMP, { recursive: true });

const lines = [];
const pending = [];
let made = 0;
for (const line of BG021_LINES) {
  const hash = ts2Hash(line, voice.voiceId, BG021_TTS.seed);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    console.log(`= ${line.id}: из кэша`);
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  for (let k = 0; k < TAKES; k++) {
    const seed = BG021_TTS.seed + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    const info = await synthLine(apiKey, line, voice, path, seed);
    takes.push({ path, info, seed });
    made++;
  }
  lines.push(null);
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

let scores = null;
if (pending.length && TAKES > 1) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken })))));
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
  const { chars: _c, env: _e, ...info } = best.info;
  lines[p.index] = {
    ...info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(`✓ ${p.line.id}: seed ${best.seed}${best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""}`);
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, video: BG021_VIDEO.id, lines }, null, 2) + "\n");
console.log(`Реплик: ${lines.length}, новых синтезов: ${made}`);
