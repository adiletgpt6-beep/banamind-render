// Озвучка BalaGoMeeting1320 (№31): файл на реплику (N01–N21, A01–A02,
// F01–F04, S01–S03 — 30 сегментов), голос роли — M13_VOICES или выбор проб
// (voice-samples/meeting-1320/probe/report.json).
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/meeting-1320/voice/, повторно не синтезируется —
// платный TTS не вызывается при каждом рендере.
// Новая или изменённая реплика синтезируется в M13_TAKES дублях (3); в
// ролик идёт дубль с наименьшим штрафом: CER распознавания Meta MMS + темп
// речи (растянутые гласные/скороговорка) + для сына профиль голоса. Это
// технический фильтр, а не прослушивание. Темп и высота тона не меняются.
//
// После синтеза шкала раскладывается по фактической речи (layoutTimeline):
// timeline.json — ID, роль, режим, текст, файл, длительность, начало и конец,
// связанное действие.
//
// Голос роли не выбран — её реплики пропускаются, manifest помечается
// partial (финальный рендер невозможен).
// Запуск: node scripts/generate-m1320-voice.mjs (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { M13_LINES, M13_SEG_SPECS, M13_VIDEO, modeOf } from "../src/meeting-1320/script.ts";
import { buildM13Timeline, checkM13Timeline } from "../src/meeting-1320/timing.ts";
import { lineSeed, m13Hash, synthLine, takePenalty, voiceOfRole } from "./lib/m1320-tts.mjs";

const OUT = join("public", M13_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.M13_TAKES ?? 3);

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
let partial = false;
const save = () => writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "m1320", video: M13_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

const TMP = join(tmpdir(), "balago-m1320-takes");
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of M13_LINES) {
  const voice = voiceOfRole(line.role);
  const file = `${line.id.toLowerCase()}.mp3`;
  const old = prevById.get(line.id);
  if (!voice) {
    console.warn(`  ⚠ ${line.id}: голос роли «${line.role}» не выбран — реплика пропущена`);
    partial = true;
    continue;
  }
  const hash = m13Hash(line, voice.voiceId);
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
  // прежний дубль того же текста, тега и голоса (перегенерация новым seed)
  // тоже участвует в сравнении — хуже не станет
  const words = (t) => (t ?? "").toLowerCase().replace(/[^\p{L}\s-]/gu, "").replace(/\s+/g, " ").trim();
  if (old && old.voiceId === voice.voiceId && words(old.spoken) === words(line.spoken ?? line.text) && (old.tag ?? null) === (line.tag ?? null) && existsSync(join(OUT, file))) {
    const path = join(TMP, `${line.id}-prev.mp3`);
    copyFileSync(join(OUT, file), path);
    const { asrCer: _c, asrHeard: _h, f0: _f, profile: _p, penalty: _x, takes: _t, hash: _hh, file: _ff, ...info } = old;
    takes.push({ path, info, seed: old.seed, prev: true });
  }
  // короткой реплике можно дать больше дублей (line.takes)
  for (let k = 0; k < (line.takes ?? TAKES); k++) {
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
    execFileSync("python3", ["scripts/m1320_asr.py", "--score", inp, out], { stdio: "inherit" });
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
    takes: ranked.map((t) => ({ seed: t.seed, prev: Boolean(t.prev), cer: t.asr?.cer ?? null, f0: t.asr?.f0 ?? null, profile: t.asr?.profile ?? null, penalty: t.asr ? pen(t) : null, speechSec: Number((t.info.speechEnd - t.info.speechStart).toFixed(3)) })),
  };
  console.log(`✓ ${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}` + (best.asr ? `, CER ${best.asr.cer}, штраф ${pen(best)} (дубли: ${ranked.map((t) => (t.asr ? pen(t) : "?")).join(" / ")})` : ""));
}
save();
console.log(`Реплик: ${lines.filter(Boolean).length}/${M13_LINES.length} (синтезов: ${made}, из кэша: ${reused})`);

// Шкала по фактической речи.
const manifest = { version: 1, kind: "m1320", estimated: partial, lines: lines.filter(Boolean) };
const tl = buildM13Timeline(manifest);
const r3 = (x) => Number(x.toFixed(3));
writeFileSync(
  join(OUT, "timeline.json"),
  JSON.stringify(
    {
      video: M13_VIDEO.id,
      partial,
      fps: M13_VIDEO.fps,
      frames: tl.frames,
      durationSec: r3(tl.frames / M13_VIDEO.fps),
      contactFromFrame: tl.contactFrom,
      cardFromSec: r3(tl.contactFrom / M13_VIDEO.fps),
      scenes: tl.scenes.map((s) => ({ id: s.id, title: s.title, fromFrame: s.from, toFrame: s.to, from: r3(s.from / M13_VIDEO.fps), to: r3(s.to / M13_VIDEO.fps) })),
      segments: tl.cues.map((c) => {
        const l = M13_LINES.find((x) => x.id === c.line);
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
          action: M13_SEG_SPECS.find((x) => x.id === c.id).action,
        };
      }),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Длительность: ${(tl.frames / M13_VIDEO.fps).toFixed(2)} с (${tl.frames} кадров), стабильная карточка с кадра ${tl.contactFrom}`);
const problems = checkM13Timeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
