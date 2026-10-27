// Озвучка BalaGo36SuitcaseByTheDoor2D: файл на реплику (N01–N16, M01–M03,
// P01–P02, C01–C04), голос роли — SD2_VOICES (src/suitcase-by-the-door-2d/script.ts).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/suitcase-by-the-door-2d/, повторно не
// синтезируется — платный TTS не вызывается при каждом рендере.
// Новая или изменённая реплика синтезируется в SD2_TAKES дублях (3); в
// ролик идёт дубль с наименьшим штрафом: CER распознавания Meta MMS + темп
// речи (растянутые гласные/скороговорка). Это
// технический фильтр, а не прослушивание. Темп и высота тона не меняются.
//
// После синтеза шкала раскладывается по фактической речи (layoutTimeline):
// timeline.json — ID, роль, режим, текст, файл, длительность, начало и конец,
// связанное действие.
//
// Голос роли не выбран (пустой voiceId) — её реплики пропускаются, manifest
// помечается partial (финальный рендер невозможен).
// Запуск: node scripts/generate-sd2d-voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SD2_LINES, SD2_SEG_SPECS, SD2_VIDEO, modeOf } from "../src/suitcase-by-the-door-2d/script.ts";
import { buildSd2Timeline, checkSd2Timeline } from "../src/suitcase-by-the-door-2d/timing.ts";
import { lineSeed, sd2Hash, synthLine, takePenalty, voiceOfRole } from "./lib/sd2d-tts.mjs";

const OUT = join("public", SD2_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.SD2_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
let partial = false;
const save = () => writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "sd2d", video: SD2_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-sd2d-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of SD2_LINES) {
  const voice = voiceOfRole(line.role);
  const file = `${line.id.toLowerCase()}.mp3`;
  const old = prevById.get(line.id);
  if (!voice) {
    console.warn(`  ⚠ ${line.id}: голос роли «${line.role}» не выбран — реплика пропущена`);
    partial = true;
    continue;
  }
  const hash = sd2Hash(line, voice.voiceId);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
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
    execFileSync("python3", ["scripts/sd2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый дубль`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  const pen = (t) => takePenalty(p.line, t.info, t.asr);
  const best = scores ? ranked.reduce((a, b) => (pen(b) < pen(a) ? b : a)) : ranked[0];
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    profile: best.asr?.profile ?? null,
    penalty: scores ? pen(best) : null,
    takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, f0: t.asr?.f0 ?? null, profile: t.asr?.profile ?? null, penalty: t.asr ? pen(t) : null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}` + (best.asr ? `, CER ${best.asr.cer}, штраф ${pen(best)} (дубли: ${ranked.map((t) => (t.asr ? pen(t) : "?")).join(" / ")})` : ""));
}
save();
console.log(`Реплик: ${lines.filter(Boolean).length}/${SD2_LINES.length} (синтезов: ${made}, из кэша: ${reused})`);

// Шкала по фактической речи.
const manifest = { version: 1, kind: "sd2d", estimated: partial, lines: lines.filter(Boolean) };
const tl = buildSd2Timeline(manifest);
const r3 = (x) => Number(x.toFixed(3));
writeFileSync(
  join(OUT, "timeline.json"),
  JSON.stringify(
    {
      video: SD2_VIDEO.id,
      partial,
      fps: SD2_VIDEO.fps,
      frames: tl.frames,
      durationSec: r3(tl.frames / SD2_VIDEO.fps),
      ctaAssembledFrame: tl.ctaAssembledFrame,
      ctaHoldSec: r3((tl.frames - tl.ctaAssembledFrame) / SD2_VIDEO.fps),
      scenes: tl.scenes.map((s) => ({ id: s.id, title: s.title, fromFrame: s.from, toFrame: s.to, from: r3(s.from / SD2_VIDEO.fps), to: r3(s.to / SD2_VIDEO.fps) })),
      segments: tl.cues.map((c) => {
        const l = SD2_LINES.find((x) => x.id === c.id);
        const ml = manifest.lines.find((x) => x.id === c.id);
        return {
          id: c.id,
          role: c.role,
          mode: modeOf(c.id),
          scene: c.scene,
          text: l.text,
          file: c.file ?? null,
          voice: ml?.voiceName ?? null,
          durationSec: ml?.durationSec ?? null,
          from: r3(c.from),
          to: r3(c.to),
          action: SD2_SEG_SPECS.find((x) => x.id === c.id).action,
        };
      }),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Длительность: ${(tl.frames / SD2_VIDEO.fps).toFixed(2)} с (${tl.frames} кадров), финальный кадр собран с ${tl.ctaAssembledFrame}`);
const problems = checkSd2Timeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
