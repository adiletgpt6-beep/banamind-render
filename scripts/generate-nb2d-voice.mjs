// Полная озвучка BalaGoNoBackup2D: файл на реплику, голос роли — из
// voice-samples/no-backup-2d/design/voices.json (scripts/nb2d-voice-design.mjs).
//
// Кэш: реплика с тем же хэшем (текст, голос, модель, настройки, seed),
// уже лежащая в public/audio/no-backup-2d/, повторно не синтезируется.
// Новая или изменённая реплика синтезируется максимум в 2 дублях; в ролик идёт дубль,
// который Meta MMS распознаёт точнее (scripts/nb2d_asr.py). Если реплика
// перегенерируется (новый seed), прежний дубль участвует в сравнении —
// техническое распознавание не подтверждает качество произношения.
//
// Без полного состава голосов финальная сборка завершается ошибкой.
// Запуск: npm run audio:voice:no-backup-2d (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NB2_LINES, NB2_VIDEO } from "../src/no-backup-2d/script.ts";
import { checkNb2Timing } from "../src/no-backup-2d/timing.ts";
import { lineSeed, nb2Hash, synthLine, voiceOfRole } from "./lib/nb2d-tts.mjs";

const OUT = join("public", NB2_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

const missing = [...new Set(NB2_LINES.map((l) => l.role))].filter((r) => !voiceOfRole(r));
if (missing.length) {
  throw new Error(`Голоса ещё не созданы: ${missing.join(", ")}.`);
}

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "nb2d", video: NB2_VIDEO.id, partial, lines: partial ? [...lines, ...prev.lines.filter(old => !lines.some(l => l.id === old.id))] : lines }, null, 2) + "\n");

const TAKES = Number(process.env.NB2_TAKES ?? 2);
if (!Number.isInteger(TAKES) || TAKES < 1 || TAKES > 2) throw new Error("NB2_TAKES должен быть 1 или 2.");
const TMP = join(tmpdir(), "balago-nb2d-takes");
const RETAKES = "voice-samples/no-backup-2d/retakes";
mkdirSync(TMP, { recursive: true });
const pending = [];
let made = 0;
let reused = 0;
for (const line of NB2_LINES) {
  const voice = voiceOfRole(line.role);
  const hash = nb2Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    if (typeof old.asrCer !== "number") pending.push({ line, hash, file, takes: [{path: join(OUT, file), info: old, seed: old.seed, prev: true}], index: lines.length - 1 });
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  // прежний дубль того же текста и голоса — тоже кандидат (для перезаписи
  // с другим темпом/паузами — только для сравнения, см. retake)
  if (old && old.voiceId === voice.voiceId && (old.spoken === (line.spoken ?? line.text) || (line.retake && old.text === line.text)) && existsSync(join(OUT, file))) {
    const path = join(TMP, `${line.id}-prev.mp3`);
    copyFileSync(join(OUT, file), path);
    // прежняя запись сохраняется в ветке для прослушивания и сравнения
    mkdirSync(RETAKES, { recursive: true });
    copyFileSync(join(OUT, file), join(RETAKES, `${line.id}-prev-seed${old.seed}.mp3`));
    const { asrCer: _c, asrHeard: _h, f0: _f, takes: _t, hash: _x, ...info } = old;
    takes.push({ path, info, seed: old.seed, prev: true });
  }
  for (let k = 0; k < TAKES; k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    const info = await synthLine(apiKey, line, voice, path, seed);
    takes.push({ path, info, seed });
    made++;
    // Контрольная точка ДО второго запроса: если он или последующая
    // реплика упадёт, первый оплаченный дубль останется в ветке.
    if (k === 0) {
      copyFileSync(path, join(OUT, file));
      lines.push({ ...info, hash, file });
      save(true);
    }
  }
  pending.push({ line, hash, file, takes, index: lines.length - 1 });
}

let scores = null;
if (pending.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(pending.flatMap((p) => p.takes.map((t) => ({ path: t.path, text: p.line.spoken ?? p.line.text })))));
  try {
    execFileSync("python3", ["scripts/nb2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    throw new Error(`Проверка разборчивости недоступна: ${e.message.split("\n")[0]}. Синтезированные файлы сохранены, повторно создавать их не нужно.`);
  }
}
for (const p of pending) {
  const ranked = p.takes.map((t) => ({ ...t, asr: scores?.get(t.path) ?? null }));
  if (ranked.some(t => !Number.isFinite(t.asr?.cer))) {
    throw new Error(`${p.line.id}: нет корректного замера разборчивости для каждого дубля. Готовые файлы сохранены; финальная сборка остановлена.`);
  }
  const bestOf = (list) => list.reduce((a, b) => (b.asr.cer < a.asr.cer ? b : a));
  // retake: прежний дубль остаётся, только если все новые заметно хуже
  const fresh = ranked.filter((t) => !t.prev);
  const prevTake = ranked.find((t) => t.prev);
  // перезапись ради темпа: среди новых дублей с близкой разборчивостью
  // (CER не хуже лучшего на 0,04) берётся более спокойный — с большей
  // длительностью речи; скорость звука при этом не меняется
  const calmest = (list) => {
    const top = bestOf(list).asr.cer;
    return list.filter((t) => t.asr.cer <= top + 0.04).reduce((a, b) => ((b.info.speechEnd - b.info.speechStart) > (a.info.speechEnd - a.info.speechStart) ? b : a));
  };
  const best = p.line.retake && fresh.length
    ? (prevTake && bestOf(fresh).asr.cer > prevTake.asr.cer + 0.05 ? prevTake : calmest(fresh))
    : bestOf(ranked);
  if (best.path !== join(OUT, p.file)) copyFileSync(best.path, join(OUT, p.file));
  lines[p.index] = {
    ...best.info,
    hash: p.hash,
    file: p.file,
    asrCer: best.asr?.cer ?? null,
    asrHeard: best.asr?.heard ?? null,
    f0: best.asr?.f0 ?? null,
    takes: ranked.map((t) => ({ seed: t.seed, prev: Boolean(t.prev), cer: t.asr?.cer ?? null })),
  };
  save(true);
  console.log(
    `✓ ${p.line.id}: дубль seed ${best.seed}${best.prev ? " (прежний)" : ""}` +
      (best.asr ? `, CER ${best.asr.cer} (дубли: ${ranked.map((t) => t.asr?.cer ?? "не измерено").join(" / ")})` : ""),
  );
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);

const problems = checkNb2Timing(lines);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) {
  console.error("✗ Реплики не помещаются в шкалу — сдвиньте at в src/no-backup-2d/script.ts");
  process.exit(1);
}
