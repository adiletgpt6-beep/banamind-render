// Озвучка Lesson80_1_5: файл на реплику (48 реплик, реплика 43 — хор).
//
// Провайдер: --provider openai | elevenlabs | local | auto (по умолчанию
// auto: сначала OpenAI gpt-4o-mini-tts, затем ElevenLabs (если задан
// ELEVENLABS_API_KEY), при недоступности обоих — локальные голоса, и тогда
// манифест помечается temporary: true — временная дорожка).
// Кэш: реплика с тем же хэшем (текст, голос, seed, уровень) не
// синтезируется повторно. --force перегенерирует всё; --only l07,l08 —
// только указанные реплики.
//
// Запуск: npm run audio:voice:lesson-80-1-5 [-- --provider openai]
// (за HTTPS-прокси Node ≥ 22.21 читает HTTPS_PROXY при NODE_USE_ENV_PROXY=1).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { L815_LINES, L815_VIDEO } from "../src/lesson-80-1-5/script.ts";
import { buildL815Timeline, checkL815Timeline, fmtTime } from "../src/lesson-80-1-5/timing.ts";
import { voicesFor } from "../src/lesson-80-1-5/voices.ts";
import { l815Hash, ProviderUnavailable, synthChorus, synthLine, voiceKey } from "./lib/l815-tts.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const requested = opt("--provider", process.env.L815_TTS_PROVIDER ?? "auto");
const force = args.includes("--force");
const only = opt("--only", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const OUT = join("public", L815_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map((prev.lines ?? []).map((l) => [l.id, l]));

const ORDER = ["openai", "elevenlabs", "local"];
let provider = requested === "auto" ? "openai" : requested;
const specFor = (p, line) => (line.role === "kids" ? voicesFor(p).chorus : voicesFor(p).roles[line.role]);
const hashFor = (p, line) => l815Hash(line, specFor(p, line));

const lines = [];
let made = 0;
let reused = 0;
const synth = async (p, line, file) => {
  const out = join(OUT, file);
  const info = line.role === "kids" ? await synthChorus(line, specFor(p, line), out) : await synthLine(line, specFor(p, line), out);
  return { ...info, file, hash: hashFor(p, line), temporary: p === "local" };
};

for (const line of L815_LINES) {
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  const wanted = only.length ? only.includes(line.id) : true;
  if (!force && wanted && old?.hash === hashFor(provider, line) && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!wanted && old && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  try {
    const info = await synth(provider, line, file);
    lines.push(info);
    made++;
    console.log(`✓ ${line.id} [${line.role}: ${info.voice}] ${info.durationSec.toFixed(2)} с, речь ${info.speechStart}–${info.speechEnd} с, F0 ${info.f0} Гц, пик ${info.peakDb} дБFS (${info.wordsFrom})`);
  } catch (e) {
    if (e instanceof ProviderUnavailable && requested === "auto" && provider !== "local") {
      const next = ORDER[ORDER.indexOf(provider) + 1];
      console.warn(`⚠ ${provider} недоступен (${e.message.split("\n")[0]}). Переход: ${next}${next === "local" ? " — временная дорожка" : ""}.`);
      provider = next;
      // повторить ту же реплику новым провайдером (или из кэша)
      const old2 = prevById.get(line.id);
      if (!force && old2?.hash === hashFor(provider, line) && existsSync(join(OUT, file))) {
        lines.push(old2);
        reused++;
        continue;
      }
      try {
        const info = await synth(provider, line, file);
        lines.push(info);
        made++;
        console.log(`✓ ${line.id} [${line.role}: ${info.voice}] ${info.durationSec.toFixed(2)} с, речь ${info.speechStart}–${info.speechEnd} с, F0 ${info.f0} Гц (${info.wordsFrom})`);
        continue;
      } catch (e2) {
        if (e2 instanceof ProviderUnavailable && provider === "elevenlabs") {
          console.warn(`⚠ elevenlabs недоступен (${e2.message.split("\n")[0]}). Переход: local — временная дорожка.`);
          provider = "local";
          const info = await synth(provider, line, file);
          lines.push(info);
          made++;
          console.log(`✓ ${line.id} [${line.role}: ${info.voice}] ${info.durationSec.toFixed(2)} с (${info.wordsFrom})`);
          continue;
        }
        throw e2;
      }
    }
    throw e;
  }
}

const temporary = lines.some((l) => l.temporary);
const manifest = {
  version: 1,
  kind: "lesson-80-1-5",
  video: L815_VIDEO.id,
  provider,
  temporary,
  voices: Object.fromEntries(Object.entries(voicesFor(provider).roles).map(([r, v]) => [r, voiceKey(v)])),
  lines,
};
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused}); провайдер: ${manifest.provider}${temporary ? " — ВРЕМЕННАЯ ДОРОЖКА" : ""}`);

const tl = buildL815Timeline(manifest);
console.log(`Шкала: ${fmtTime(tl.durationSec)} (${tl.durationInFrames} кадров); сцены: ${tl.scenes.map((s) => `${s.id} ${fmtTime(s.from / 30)}–${fmtTime(s.to / 30)}`).join(", ")}`);
const problems = checkL815Timeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
