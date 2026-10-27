// Озвучка Lesson80-1-8 «А кто создал Аллаха?»: файл на реплику (42 реплики,
// 4 роли), голос роли постоянный (VOICES в src/lesson80/film-1-8/script.ts).
// Провайдер: ELEVENLABS_API_KEY → OpenAI (OPENAI_API_KEY или подключённый
// прокси, --provider openai) → RHVoice (офлайн, rhvoice + rhvoice-russian)
// → Piper (офлайн, sherpa-onnx; черновая дорожка для местной проверки).
//   • кэш по хэшу (текст, тег, провайдер, голос, модель/версия, seed) —
//     готовая реплика повторно не синтезируется;
//   • ElevenLabs: приём ролика №12 — страховочное слово, тайминги букв,
//     L80_TAKES дублей (по умолчанию 2), в фильм идёт дубль с лучшим
//     распознаванием MMS (scripts/lesson80_asr.py);
//   • голоса — набор готовой дорожки 80-1-7 (лаборатория голосов не повторяется).
//
// Запуск: npm run audio:voice:lesson-80-1-8 [-- --provider rhvoice|piper]
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FILM, L80_LINES, L80_TTS, VOICES, lineFile } from "../src/lesson80/film-1-8/script.ts";
import { buildTimeline, checkTimeline } from "../src/lesson80/film-1-8/timeline.ts";
import { decodeMono } from "./lib/audio.mjs";
import { createL80Tts } from "./lib/l80-tts-core.mjs";
import { piperAvailable, rhvoiceAvailable, synthOpenAI, synthPiper, synthRhvoice } from "./lesson80/providers.mjs";
import { finishLine, lineHash } from "./lesson80/voice.mjs";

const { l80Hash, lineSeed, synthLine } = createL80Tts({ FILM, L80_TTS });
const argv = process.argv.slice(2);
const argProvider = argv.includes("--provider") ? argv[argv.indexOf("--provider") + 1] : process.env.L80_TTS;
const eleven = process.env.ELEVENLABS_API_KEY?.trim();
const openaiKey = process.env.OPENAI_API_KEY?.trim();
const provider = argProvider ?? (eleven ? "elevenlabs" : openaiKey ? "openai" : rhvoiceAvailable() ? "rhvoice" : piperAvailable() ? "piper" : null);
const OUT = join("public", FILM.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const TMP = join(tmpdir(), "lesson80-1-8-voice");
mkdirSync(TMP, { recursive: true });

const score = (items) => {
  if (!items.length) return null;
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(items));
  try {
    execFileSync("python3", ["scripts/lesson80_asr.py", "--score", inp, out], { stdio: "inherit" });
    return new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]})`);
    return null;
  }
};

if (!provider) {
  console.error("Нет доступного синтеза речи: задайте ELEVENLABS_API_KEY / OPENAI_API_KEY, установите rhvoice + rhvoice-russian или задайте PIPER_MODELS_DIR (sherpa-onnx).");
  process.exit(existsSync(MANIFEST) ? 0 : 1);
}
console.log(`Провайдер озвучки: ${provider}`);
mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map((prev.lines ?? []).map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "lesson80", film: FILM.id, provider, partial, lines }, null, 1) + "\n");

const hashOf = (line, spec) => (provider === "elevenlabs" ? l80Hash(line, spec.voiceId) : lineHash(line, provider, spec, L80_TTS.version));
// по умолчанию один дубль (экономия квоты ElevenLabs); L80_TAKES=2 — выбор лучшего по MMS
const TAKES = Number(process.env.L80_TAKES ?? 1);
const pending = [];
const failed = [];
let made = 0;
let reused = 0;
for (const line of L80_LINES) {
  const spec = VOICES[line.role][provider];
  const hash = hashOf(line, spec);
  const file = lineFile(line.id);
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (provider === "elevenlabs") {
    const takes = [];
    // прежняя реплика годится только от того же провайдера: смешанная
    // дорожка (часть реплик ElevenLabs, часть RHVoice) недопустима — при
    // неполном синтезе манифест не перезаписывается, остаётся прежняя дорожка
    const keepOld = (why) => {
      if (old?.file && old.provider === provider && existsSync(join(OUT, old.file))) {
        console.warn(`  ⚠ №${line.id}: ${why} — остаётся прежняя реплика (${old.voiceName ?? old.provider})`);
        failed.push(line.id);
        lines.push(old);
        return true;
      }
      return false;
    };
    if (old && old.provider === provider && old.voiceId === spec.voiceId && old.text === line.text && (old.tag ?? null) === (line.tag ?? null) && existsSync(join(OUT, file))) {
      const path = join(TMP, `l${line.id}-prev.mp3`);
      copyFileSync(join(OUT, file), path);
      const { asrCer: _c, asrHeard: _h, f0: _f, takes: _t, hash: _x, ...info } = old;
      takes.push({ path, info, seed: old.seed, prev: true });
    }
    let error = null;
    for (let k = 0; k < TAKES; k++) {
      const seed = lineSeed(line) + k * 11;
      const path = join(TMP, `l${line.id}-${seed}.mp3`);
      try {
        const info = await synthLine(eleven, { ...line, id: `l${String(line.id).padStart(2, "0")}` }, spec, path, seed);
        takes.push({ path, info: { ...info, id: line.id }, seed });
        made++;
      } catch (e) {
        error = e;
        console.warn(`  ⚠ №${line.id}: ${e.message.split("\n")[0].slice(0, 160)}`);
        break;
      }
    }
    if (!takes.some((t) => !t.prev)) {
      if (keepOld(error ? "синтез не удался" : "нет дублей")) continue;
      throw error ?? new Error(`№${line.id}: нет дублей`);
    }
    lines.push(null);
    pending.push({ line, hash, file, takes, index: lines.length - 1 });
    continue;
  }
  console.log(`→ №${String(line.id).padStart(2, "0")} [${line.role}: ${provider}]: «${line.text}»`);
  const wav = join(TMP, `l${line.id}.wav`);
  const r = provider === "openai"
    ? await synthOpenAI({ text: line.text, spec, outWav: wav, apiKey: openaiKey })
    : provider === "piper"
      ? await synthPiper({ text: line.text, spec, outWav: wav, tmpJson: join(TMP, `l${line.id}.json`) })
      : await synthRhvoice({ text: line.text, spec, outWav: wav, tmpJson: join(TMP, `l${line.id}.json`) });
  const fin = finishLine({ pcm: decodeMono(wav), words: r.words, chars: r.chars, outPath: join(OUT, file), tmpDir: TMP, id: `l${line.id}` });
  console.log(`  ✓ ${file}: ${fin.durationSec.toFixed(2)} с, речь ${fin.speechStart.toFixed(2)}–${fin.speechEnd.toFixed(2)} с, пик ${fin.peakDb} дБFS`);
  lines.push({ id: line.id, role: line.role, text: line.text, tag: null, file, provider, voice: spec, hash, ...fin });
  made++;
  save(true);
}

if (pending.length) {
  const scores = score(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.text }))));
  for (const p of pending) {
    const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
    const fresh = ranked.filter((t) => !t.prev);
    const best = scores
      ? ranked.reduce((a, b) => ((b.asr?.cer ?? Infinity) < (a.asr?.cer ?? Infinity) ? b : a))
      : fresh[0] ?? ranked[0];
    copyFileSync(best.path, join(OUT, p.file));
    lines[p.index] = {
      ...best.info,
      id: p.line.id,
      provider,
      hash: p.hash,
      file: p.file,
      asrCer: best.asr?.cer ?? null,
      asrHeard: best.asr?.heard ?? null,
      f0: best.asr?.f0 ?? null,
      takes: ranked.map((t) => ({ seed: t.seed, prev: Boolean(t.prev), cer: t.asr?.cer ?? null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(2)) })),
    };
    console.log(`✓ №${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}` + (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : ""));
  }
}
save(false);
if (failed.length) console.warn(`::warning::Не пересинтезированы реплики ${failed.join(", ")} — в манифесте остались прежние файлы.`);
const speech = lines.reduce((a, l) => a + (l.speechEnd - l.speechStart), 0);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused}); чистой речи ${speech.toFixed(1)} с`);
const tl = buildTimeline({ version: 1, kind: "lesson80", film: FILM.id, provider, lines });
const m = Math.floor(tl.durationSec / 60);
console.log(`Длительность фильма по шкале: ${m}:${String(Math.round(tl.durationSec - m * 60)).padStart(2, "0")} (${tl.durationInFrames} кадров)`);
for (const s of tl.scenes) console.log(`  ${s.title}: ${s.from.toFixed(1)}–${s.to.toFixed(1)} с`);
const problems = checkTimeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
