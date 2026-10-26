// Озвучка BalaGo32DadDriver: файл на реплику, голос роли — готовые
// кыргызские голоса проекта (DD_VOICES в src/dad-driver/script.ts).
//
// Два этапа (DD_VOICE_STAGE в script.ts или переменная DD_STAGE):
//   samples — короткие пробы голосов на отрывках сценария →
//             voice-samples/dad-driver/*.mp3 + report.json (распознавание
//             MMS, основной тон, темп). Ролик на этом этапе не озвучивается.
//   full    — все реплики → public/audio/dad-driver/*.mp3 + manifest.json.
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в папке, повторно не синтезируется. Новая или изменённая
// реплика синтезируется в 3 дублях; в ролик идёт дубль, который Meta MMS
// распознаёт точнее (scripts/ts2d_asr.py), при равной разборчивости — с
// более спокойным для роли темпом. Темп и высота голоса не меняются.
//
// Запуск: npm run audio:voice:dad-driver (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DD_LINES, DD_SAMPLES, DD_VIDEO, DD_VOICE_POOL, DD_VOICE_STAGE, DD_VOICES } from "../src/dad-driver/script.ts";
import { checkDdTiming, buildDdTimeline } from "../src/dad-driver/timing.ts";
import { ddHash, lineSeed, synthLine } from "./lib/dd-tts.mjs";

const stage = process.env.DD_STAGE?.trim() || DD_VOICE_STAGE;
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TMP = join(tmpdir(), "balago-dd-takes");
mkdirSync(TMP, { recursive: true });

// Спокойный темп роли (букв в секунду) — при равной разборчивости дублей.
const PACE = { narrator: 13.5, father: 12.5, son: 11.5 };

const score = (items) => {
  if (!items.length) return null;
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(items));
  try {
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    return new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — берётся первый дубль`);
    return null;
  }
};

// Слова, которые распознавание обязано услышать (line.mustHear).
const heardAll = (heard, words = []) => {
  const h = ` ${String(heard ?? "").toLowerCase()} `;
  return words.every((w) => h.includes(` ${w.toLowerCase()}`));
};

const pick = (takes, scores, pace, mustHear) => {
  const ranked = takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  if (!scores) {
    if (mustHear?.length) throw new Error(`без распознавания нельзя проверить слова ${mustHear.join(", ")}`);
    return { best: ranked.find((t) => !t.prev) ?? ranked[0], ranked };
  }
  const ok = mustHear?.length ? ranked.filter((t) => heardAll(t.asr?.heard, mustHear)) : ranked;
  if (!ok.length) throw new Error(`ни в одном дубле не распознано: ${mustHear.join(", ")} (${ranked.map((t) => t.asr?.heard ?? "?").join(" | ")})`);
  const minCer = Math.min(...ok.map((t) => t.asr?.cer ?? Infinity));
  const close = ok.filter((t) => (t.asr?.cer ?? Infinity) <= minCer + 0.02);
  const best = close.reduce((a, b) => (Math.abs(b.info.lettersPerSec - pace) < Math.abs(a.info.lettersPerSec - pace) ? b : a));
  return { best, ranked };
};

// ---------- Пробы голосов ----------
if (stage === "samples") {
  const OUT = join("voice-samples", "dad-driver");
  const REPORT = join(OUT, "report.json");
  mkdirSync(OUT, { recursive: true });
  const prev = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, "utf8")) : { samples: [] };
  const done = new Map(prev.samples.map((s) => [s.id, s]));
  const samples = [];
  const pending = [];
  for (const s of DD_SAMPLES) {
    const voice = DD_VOICE_POOL[s.voice];
    const role = s.id.includes("son") ? "son" : s.id.includes("father") ? "father" : "narrator";
    const line = { ...s, role };
    const hash = ddHash(line, voice.voiceId);
    const file = `${s.id}.mp3`;
    const old = done.get(s.id);
    if (old?.hash === hash && existsSync(join(OUT, file))) {
      samples.push(old);
      continue;
    }
    if (!apiKey) throw new Error(`Нет пробы ${s.id}, а ELEVENLABS_API_KEY не задан.`);
    const takes = [];
    for (let k = 0; k < 2; k++) {
      const seed = lineSeed(line) + k * 11;
      const path = join(TMP, `${s.id}-${seed}.mp3`);
      takes.push({ path, seed, info: await synthLine(apiKey, line, voice, path, seed) });
    }
    samples.push(null);
    pending.push({ s, role, hash, file, takes, index: samples.length - 1 });
  }
  const scores = score(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.s.spoken ?? p.s.text }))));
  for (const p of pending) {
    const { best, ranked } = pick(p.takes, scores, PACE[p.role]);
    copyFileSync(best.path, join(OUT, p.file));
    const { words: _w, chars: _c, env: _e, ...info } = best.info;
    samples[p.index] = {
      ...info,
      id: p.s.id,
      hash: p.hash,
      file: p.file,
      asrCer: best.asr?.cer ?? null,
      asrHeard: best.asr?.heard ?? null,
      f0: best.asr?.f0 ?? null,
      takes: ranked.map((t) => ({ seed: t.seed, cer: t.asr?.cer ?? null, f0: t.asr?.f0 ?? null, lettersPerSec: t.info.lettersPerSec, heard: t.asr?.heard ?? null })),
    };
    console.log(`✓ проба ${p.s.id}: seed ${best.seed}${best.asr ? `, CER ${best.asr.cer}, F0 ${best.asr.f0} Гц` : ""}, ${best.info.lettersPerSec} букв/с`);
  }
  writeFileSync(REPORT, JSON.stringify({ video: DD_VIDEO.id, stage: "samples", samples }, null, 2) + "\n");
  console.log(`Пробы голосов: ${OUT}/ (${samples.length})`);
  process.exit(0);
}

// ---------- Все реплики ----------
const OUT = join("public", DD_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "dd", video: DD_VIDEO.id, partial, lines: lines.filter(Boolean) }, null, 2) + "\n");

if (!apiKey && !existsSync(MANIFEST)) {
  console.log("ELEVENLABS_API_KEY не задан и озвучки нет — финальный ролик не собирается.");
  process.exit(1);
}
const TAKES = Number(process.env.DD_TAKES ?? 3);
const pending = [];
let made = 0;
let reused = 0;
for (const line of DD_LINES) {
  const voice = DD_VOICES[line.role];
  const hash = ddHash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  // прежний дубль того же текста и голоса (другой seed) — тоже кандидат
  if (old && old.voiceId === voice.voiceId && old.spoken === (line.spoken ?? line.text) && (old.tag ?? null) === (line.tag ?? null) && existsSync(join(OUT, file))) {
    const path = join(TMP, `${line.id}-prev.mp3`);
    copyFileSync(join(OUT, file), path);
    const { asrCer: _c, asrHeard: _h, f0: _f, takes: _t, hash: _x, ...info } = old;
    takes.push({ path, info, seed: old.seed, prev: true });
  }
  for (let k = 0; k < (line.takes ?? TAKES); k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    takes.push({ path, info: await synthLine(apiKey, line, voice, path, seed), seed });
    made++;
  }
  lines.push(null);
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

const scores = score(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text }))));
for (const p of pending) {
  const { best, ranked } = pick(p.takes, scores, PACE[p.line.role], p.line.mustHear);
  copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, prev: Boolean(t.prev), cer: t.asr?.cer ?? null, heard: t.asr?.heard ?? null, lettersPerSec: t.info.lettersPerSec, speechSec: t.info.speechEnd - t.info.speechStart })),
  };
  console.log(
    `✓ ${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}` +
      (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "?").join(" / ")})` : "") +
      `, ${best.info.lettersPerSec} букв/с`,
  );
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const tl = buildDdTimeline(manifest);
console.log(`Длина ролика по озвучке: ${(tl.frames / DD_VIDEO.fps).toFixed(2)} с (${tl.frames} кадров)`);
const problems = checkDdTiming(manifest);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) {
  console.error("✗ Шкала не сходится — поправьте паузы (pre/tail) в src/dad-driver/script.ts");
  process.exit(1);
}
