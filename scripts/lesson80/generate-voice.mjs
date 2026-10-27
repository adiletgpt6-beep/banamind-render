// Озвучка LESSON-80 (80-1-6): файл на реплику, голос роли постоянный.
// Провайдер: ELEVENLABS_API_KEY → OpenAI (OPENAI_API_KEY или подключённый
// прокси, L80_TTS=openai) → RHVoice (офлайн). Реплика с тем же хэшем
// (текст, провайдер, голос, версия обработки) повторно не синтезируется.
//
// Запуск: npm run audio:voice:lesson-80-1-6 [-- --provider rhvoice|openai|elevenlabs]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CHORUS, FILM, LINES, VOICES, TTS, lineFile } from "../../src/lesson80/film-1-6/script.ts";
import { buildTimeline, checkTimeline } from "../../src/lesson80/core/timing.ts";
import { SAMPLE_RATE as SR, decodeMono } from "../lib/audio.mjs";
import { checkElevenLabsVoices, rhvoiceAvailable, synthElevenLabs, synthOpenAI, synthRhvoice } from "./providers.mjs";
import { finishLine, lineHash } from "./voice.mjs";

const OUT = join("public", FILM.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const TMP = join(tmpdir(), "lesson80-voice");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const argProvider = process.argv.includes("--provider") ? process.argv[process.argv.indexOf("--provider") + 1] : process.env.L80_TTS;
const eleven = process.env.ELEVENLABS_API_KEY?.trim();
const openaiKey = process.env.OPENAI_API_KEY?.trim();
const provider = argProvider ?? (eleven ? "elevenlabs" : openaiKey ? "openai" : rhvoiceAvailable() ? "rhvoice" : null);
if (!provider) {
  console.error("Нет доступного синтеза речи: задайте ELEVENLABS_API_KEY / OPENAI_API_KEY или установите rhvoice + rhvoice-russian.");
  process.exit(1);
}
console.log(`Провайдер озвучки: ${provider}`);

const specOf = (role) => {
  const v = VOICES[role];
  if (provider === "elevenlabs") {
    if (!v.elevenlabs) throw new Error(`Для роли ${role} не задан голос ElevenLabs (VOICES в script.ts)`);
    return v.elevenlabs;
  }
  if (provider === "openai") return v.openai;
  return v.rhvoice;
};

if (provider === "elevenlabs") await checkElevenLabsVoices(Object.keys(VOICES).map(specOf), eleven);

const synth = async (text, role, outWav, tag, seed = 7) => {
  const spec = specOf(role);
  if (provider === "elevenlabs") return synthElevenLabs({ text, spec, outWav, apiKey: eleven, seed });
  if (provider === "openai") return synthOpenAI({ text, spec, outWav, apiKey: openaiKey });
  return synthRhvoice({ text, spec, outWav, tmpJson: join(TMP, `${tag}.json`) });
};

const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map((prev.lines ?? []).map((l) => [l.id, l]));
const lines = [];
let made = 0;
let reused = 0;

for (const line of LINES) {
  const text = line.spoken ?? line.text;
  const file = lineFile(line.id);
  const roles = line.role === "kids" ? CHORUS.map((c) => c.role) : [line.role];
  const spec = line.role === "kids" ? { chorus: CHORUS, voices: roles.map(specOf) } : specOf(line.role);
  const hash = lineHash(line, provider, spec, TTS.version);
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  console.log(`→ №${String(line.id).padStart(2, "0")} [${line.role}]: «${text}»`);
  let pcm;
  let words;
  let chars = null;
  if (line.role === "kids") {
    // хор: каждый детский голос отдельно, затем смешение со смещениями
    const takes = [];
    for (const c of CHORUS) {
      const wav = join(TMP, `l${line.id}-${c.role}.wav`);
      const r = await synth(text, c.role, wav, `l${line.id}-${c.role}`, 100 + line.id);
      takes.push({ ...c, pcm: decodeMono(wav), words: r.words });
    }
    const len = Math.max(...takes.map((t) => t.pcm.length + Math.round((t.offsetMs / 1000) * SR)));
    pcm = new Float32Array(len);
    for (const t of takes) {
      const off = Math.round((t.offsetMs / 1000) * SR);
      for (let i = 0; i < t.pcm.length; i++) pcm[i + off] += (t.pcm[i] * t.gain) / takes.length;
    }
    const base = takes.find((t) => t.offsetMs === 0) ?? takes[0];
    words = base.words.map((w) => ({ ...w, start: w.start + base.offsetMs / 1000, end: w.end + base.offsetMs / 1000 }));
  } else {
    const wav = join(TMP, `l${line.id}.wav`);
    const r = await synth(text, line.role, wav, `l${line.id}`, 100 + line.id);
    pcm = decodeMono(wav);
    words = r.words;
    chars = r.chars;
  }
  const fin = finishLine({ pcm, words, chars, outPath: join(OUT, file), tmpDir: TMP, id: `l${line.id}` });
  console.log(`  ✓ ${file}: ${fin.durationSec.toFixed(2)} с, речь ${fin.speechStart.toFixed(2)}–${fin.speechEnd.toFixed(2)} с, пик ${fin.peakDb} дБFS`);
  lines.push({ id: line.id, role: line.role, text: line.text, spoken: text, file, provider, voice: spec, hash, ...fin });
  made++;
}

writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "lesson80", film: FILM.id, provider, partial: false, lines }, null, 1) + "\n");
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);
const tl = buildTimeline({ version: 1, kind: "lesson80", film: FILM.id, lines });
const m = Math.floor(tl.durationSec / 60);
console.log(`Длительность фильма по шкале: ${m}:${String(Math.round(tl.durationSec - m * 60)).padStart(2, "0")} (${tl.durationInFrames} кадров)`);
for (const s of tl.scenes) console.log(`  сцена ${s.id}: ${s.from.toFixed(1)}–${s.to.toFixed(1)} с`);
const problems = checkTimeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
