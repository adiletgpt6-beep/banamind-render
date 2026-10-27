// Бренд-озвучка финала BalaGoLive04Motion: короткая реплика отдельным
// женским голосом проекта (KG-teacher — тот же голос финала, что в 2D-роликах),
// отчётливо отличным от живого голоса Адилета. Голос Адилета не синтезируется
// и не подделывается: в живой речи нет слова «Бишкек», поэтому город и оба
// действия звучат в отдельной фирменной реплике после его последней фразы.
//
// 3 дубля → в ролик идёт тот, что Meta MMS распознаёт точнее
// (scripts/ts2d_asr.py, CER). Готовый файл с тем же хэшем текста/голоса
// повторно не синтезируется.
//
//   ELEVENLABS_API_KEY=… node scripts/live04/brand-voice.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LIVE04_BRAND_LINE } from "../../src/live04/brand.ts";
import { lineSeed, synthLine, ts2Hash, voiceOfRole } from "../lib/ts2d-tts.mjs";

const OUT = "public/audio/live04";
const MANIFEST = join(OUT, "brand.json");
const FILE = "brand.mp3";
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
mkdirSync(OUT, { recursive: true });

const line = { id: "b01", role: "narrator", text: LIVE04_BRAND_LINE.text, spoken: LIVE04_BRAND_LINE.spoken, seed: LIVE04_BRAND_LINE.seed };
const voice = voiceOfRole("narrator");
const hash = ts2Hash(line, voice.voiceId);
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
if (prev?.hash === hash && existsSync(join(OUT, FILE))) {
  console.log(`✓ ${OUT}/${FILE} актуален (${prev.durationSec} с, CER ${prev.asrCer ?? "—"})`);
  process.exit(0);
}
if (!apiKey) {
  if (process.env.LIVE04_STRICT_VOICE === "1") throw new Error("Нет бренд-озвучки и ELEVENLABS_API_KEY не задан.");
  console.log("ELEVENLABS_API_KEY не задан — финал соберётся без бренд-озвучки (только для черновика).");
  process.exit(0);
}

const TMP = join(tmpdir(), "balago-live04-brand");
mkdirSync(TMP, { recursive: true });
const takes = [];
for (let k = 0; k < 3; k++) {
  const seed = lineSeed(line) + k * 11;
  const path = join(TMP, `b01-${seed}.mp3`);
  const info = await synthLine(apiKey, line, voice, path, seed);
  takes.push({ path, info });
}
const inp = join(TMP, "score-in.json");
const out = join(TMP, "score-out.json");
writeFileSync(inp, JSON.stringify(takes.map((t) => ({ path: t.path, text: line.spoken }))));
let scores = new Map();
try {
  execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
  scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
} catch (e) {
  console.warn(`⚠ Проверка MMS недоступна (${e.message}); берётся первый дубль.`);
}
takes.sort((a, b) => (scores.get(a.path)?.cer ?? 1) - (scores.get(b.path)?.cer ?? 1));
const best = takes[0];
copyFileSync(best.path, join(OUT, FILE));
const sc = scores.get(best.path);
const { env: _env, chars: _chars, ...info } = best.info;
writeFileSync(
  MANIFEST,
  JSON.stringify({ ...info, file: FILE, hash, asrCer: sc?.cer ?? null, asrHeard: sc?.heard ?? null, takes: takes.map((t) => ({ seed: t.info.seed, cer: scores.get(t.path)?.cer ?? null })) }, null, 2) + "\n",
);
console.log(`+ ${OUT}/${FILE}: ${info.durationSec} с, CER ${sc?.cer ?? "—"} — «${sc?.heard ?? ""}»`);
