// Озвучка BalaGoBG023 (выпуск №24): файл на реплику, голос диктора проекта
// (BG23_NARRATOR в src/campaign50/bg-023/script.ts), ElevenLabs eleven_v3, ky.
//
// Синтез реплики переиспользует общий модуль scripts/lib/ts2d-tts.mjs
// (только импорт, без изменений): страховочное слово против обрезанного
// конца, выравнивание громкости, тайминги слов. Темп и высота не меняются.
//
// Кэш: реплика с тем же хэшем (текст, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-023/, повторно не синтезируется.
// Новая реплика — в BG23_TAKES дублях (по умолчанию 2); в ролик идёт дубль,
// который Meta MMS распознаёт точнее (scripts/ts2d_asr.py), если он доступен.
//
// Запуск: ELEVENLABS_API_KEY=… node scripts/campaign50/bg-023/generate-voice.mjs
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG23_LINES, BG23_NARRATOR, BG23_VIDEO } from "../../../src/campaign50/bg-023/script.ts";
import { TS2_TTS } from "../../../src/two-schedules-2d/script.ts";
import { synthLine } from "../../lib/ts2d-tts.mjs";

const OUT = join("public", BG23_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.BG23_TAKES ?? 2);

export const bg23Hash = (line, voiceId) =>
  createHash("sha1")
    .update(
      JSON.stringify({
        v: 1,
        text: line.spoken,
        voiceId,
        modelId: TS2_TTS.modelId,
        languageCode: TS2_TTS.languageCode,
        voiceSettings: TS2_TTS.voiceSettings,
        seed: line.seed,
      }),
    )
    .digest("hex")
    .slice(0, 16);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const voice = { name: BG23_NARRATOR.name, voiceId: BG23_NARRATOR.voiceId };
const TMP = join(tmpdir(), "balago-bg023-takes");
mkdirSync(TMP, { recursive: true });

const pending = [];
let made = 0;
let reused = 0;
for (const line of BG23_LINES) {
  const hash = bg23Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  for (let k = 0; k < TAKES; k++) {
    const seed = line.seed + k * 11;
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
  const { env: _env, chars: _chars, ...info } = best.info;
  lines[p.index] = {
    ...info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(`✓ ${p.line.id}: seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer} (${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""));
}
writeFileSync(MANIFEST, JSON.stringify({ version: 1, video: BG23_VIDEO.id, voice: voice.name, lines }, null, 2) + "\n");
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);
