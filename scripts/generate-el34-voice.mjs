// Озвучка BalaGo34ExtraLine: файл на реплику (N01–N10, S01–S04, C01–C03,
// M01–M02, F01), голос роли — EL_VOICES (src/extra-line-34/script.ts).
// Пока голоса не подтверждены пробами (EL_VOICES_CONFIRMED = false), полная
// озвучка не синтезируется: шкала строится по оценке, manifest — partial.
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/extra-line-34/, повторно не
// синтезируется — платный TTS не вызывается при каждом рендере.
// Новая или изменённая реплика синтезируется в EL_TAKES дублях (3); в
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
// Запуск: node scripts/generate-el34-voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EL_LINES, EL_SEG_SPECS, EL_VIDEO, EL_VOICES_CONFIRMED, modeOf } from "../src/extra-line-34/script.ts";
import { buildElTimeline, checkElTimeline } from "../src/extra-line-34/timing.ts";
import { lineSeed, el34Hash, synthLine, takePenalty, voiceOfRole } from "./lib/el34-tts.mjs";

const OUT = join("public", EL_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.EL_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
let partial = false;
const save = () => writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "el34", video: EL_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-el34-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of EL_LINES) {
  const voice = EL_VOICES_CONFIRMED ? voiceOfRole(line.role) : null;
  const file = `${line.id.toLowerCase()}.mp3`;
  const old = prevById.get(line.id);
  if (!voice) {
    console.warn(`  ⚠ ${line.id}: голос роли «${line.role}» ${EL_VOICES_CONFIRMED ? "не выбран" : "ещё не подтверждён пробами"} — реплика пропущена`);
    partial = true;
    continue;
  }
  const hash = el34Hash(line, voice.voiceId);
  // отдельно записанная озвучка не перезаписывается, пока текст тот же
  if (old?.recorded && old.text === line.text && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
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
    execFileSync("python3", ["scripts/el34_asr.py", "--score", inp, out], { stdio: "inherit" });
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
console.log(`Реплик: ${lines.filter(Boolean).length}/${EL_LINES.length} (синтезов: ${made}, из кэша: ${reused})`);

// Шкала по фактической речи.
const manifest = { version: 1, kind: "el34", estimated: partial, lines: lines.filter(Boolean) };
const tl = buildElTimeline(manifest);
const r3 = (x) => Number(x.toFixed(3));
writeFileSync(
  join(OUT, "timeline.json"),
  JSON.stringify(
    {
      video: EL_VIDEO.id,
      partial,
      fps: EL_VIDEO.fps,
      frames: tl.frames,
      durationSec: r3(tl.frames / EL_VIDEO.fps),
      scenes: tl.scenes.map((s) => ({ id: s.id, title: s.title, fromFrame: s.from, toFrame: s.to, from: r3(s.from / EL_VIDEO.fps), to: r3(s.to / EL_VIDEO.fps) })),
      segments: tl.cues.map((c) => {
        const l = EL_LINES.find((x) => x.id === c.line);
        const ml = manifest.lines.find((x) => x.id === c.line);
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
          action: EL_SEG_SPECS.find((x) => x.id === c.id).action,
        };
      }),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Длительность: ${(tl.frames / EL_VIDEO.fps).toFixed(2)} с (${tl.frames} кадров)${partial ? " — оценка, озвучка неполная" : ""}`);
const problems = partial ? [] : checkElTimeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
