// Полная озвучка BalaGoHalfHour2D: по файлу на реплику, голос по роли
// (HH2_VOICE_CHOICE в src/half-hour-2d/script.ts).
//
// Кэш: если реплика с тем же хэшем (текст, тег, голос, модель, настройки,
// seed) уже есть в public/audio/half-hour-2d/, она используется без запроса
// к ElevenLabs. Перегенерируются только изменённые реплики: по 3 дубля,
// лучший — по распознаванию Meta MMS (scripts/asr_mms.py --score).
//
// Пока не выбраны голоса мамы, сына и мужа, озвучка не создаётся —
// ролик собирается по оценочным таймингам (без голоса).
// Запуск: npm run audio:voice:half-hour-2d (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  HH2_CANDIDATES,
  HH2_LINES,
  HH2_VIDEO,
  HH2_VOICE_CHOICE,
} from "../src/half-hour-2d/script.ts";
import { checkHh2Timing } from "../src/half-hour-2d/timing.ts";
import { hh2Hash, lineSeed, resolveVoice, synthLine } from "./lib/hh2d-tts.mjs";

const OUT = join("public", HH2_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const SAMPLES = "voice-samples/half-hour-2d";
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

const unchosen = Object.entries(HH2_VOICE_CHOICE).filter(([, v]) => !v).map(([r]) => r);
if (unchosen.length) {
  console.log(`Голоса ещё не выбраны (${unchosen.join(", ")}) — полная озвучка не создаётся.`);
  process.exit(0);
}
const voiceOf = (role) => {
  const v = HH2_CANDIDATES[role].find((c) => c.name === HH2_VOICE_CHOICE[role]);
  if (!v) throw new Error(`Голос «${HH2_VOICE_CHOICE[role]}» не найден среди кандидатов роли ${role}.`);
  return resolveVoice(v);
};

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const sampleReport = existsSync(join(SAMPLES, "report.json"))
  ? JSON.parse(readFileSync(join(SAMPLES, "report.json"), "utf8")).samples
  : [];

const lines = [];
let made = 0;
let reused = 0;
const save = (partial) =>
  writeFileSync(
    MANIFEST,
    JSON.stringify({ version: 1, kind: "hh2d", video: HH2_VIDEO.id, partial, lines }, null, 2) + "\n",
  );

// Дубли: каждая новая реплика синтезируется TAKES раз с разным seed;
// в ролик идёт дубль, который модель Meta MMS распознаёт точнее всего
// (меньше доля ошибок по буквам относительно сценария). Если распознавание
// недоступно — берётся первый дубль.
const TAKES = Number(process.env.HH2_TAKES ?? 3);
const TMP = join(tmpdir(), "balago-hh2d-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
for (const line of HH2_LINES) {
  const voice = voiceOf(line.role);
  const hash = hh2Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push({ ...old, scene: line.scene });
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  // готовая проба того же голоса и текста — первый дубль (без запроса)
  const sample = sampleReport.find((x) => x.hash === hash && !x.error && existsSync(join(SAMPLES, x.file)));
  if (sample) {
    const path = join(TMP, `${line.id}-0.mp3`);
    copyFileSync(join(SAMPLES, sample.file), path);
    const { file: _f, ...info } = sample;
    takes.push({ path, info, seed: info.seed });
    console.log(`= ${line.id}: дубль 1 — проба ${sample.file}`);
  }
  for (let k = takes.length; k < TAKES; k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${k}.mp3`);
    const info = await synthLine(apiKey, { ...line, seed }, voice, path);
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
  writeFileSync(
    inp,
    JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.text })))),
  );
  try {
    execFileSync("python3", ["scripts/asr_mms.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый дубль`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const best = scores ? ranked.reduce((a, b) => (b.asr.cer < a.asr.cer ? b : a)) : ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    scene: p.line.scene,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null })),
  };
  console.log(
    `✓ ${p.line.id}: дубль seed ${best.seed}` +
      (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr.cer).join(" / ")})` : ""),
  );
}
save(false);
console.log(`Реплик: ${lines.length} (новых: ${made}, из кэша: ${reused})`);

const problems = checkHh2Timing(
  lines.map((l) => ({ id: l.id, speechStart: l.speechStart, speechEnd: l.speechEnd, durationSec: l.durationSec })),
);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) {
  console.error("✗ Реплики не помещаются в шкалу — сократите текст или сдвиньте at в script.ts");
  process.exit(1);
}
