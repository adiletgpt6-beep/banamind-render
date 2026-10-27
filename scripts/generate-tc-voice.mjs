// Озвучка TaxiChildLessonsOver: файл на фразу диктора, один голос
// (TC_VOICE в src/taxi-child/script.ts — готовый кыргызский голос проекта).
// Синтез — тот же, что у ролика №12 (scripts/lib/ts2d-tts.mjs): eleven_v3,
// ky, без ускорения и изменения тона; тайминги слов для монтажа и субтитров.
//
// Кэш: фраза с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/taxi-child/, повторно не синтезируется.
// Новая фраза синтезируется в 3 дублях; берётся дубль, который Meta MMS
// распознаёт точнее (scripts/ts2d_asr.py). Если вместе дубли не помещаются
// в 60 с, лучшие по CER дубли заменяются более короткими с наименьшей
// потерей разборчивости. Речь не ускоряется и не обрезается.
//
// Запуск: npm run audio:voice:taxi-child (нужен ELEVENLABS_API_KEY).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TC_LINES, TC_VIDEO, TC_VOICE } from "../src/taxi-child/script.ts";
import { checkTcTiming } from "../src/taxi-child/timing.ts";
import { lineSeed, synthLine, ts2Hash } from "./lib/ts2d-tts.mjs";

const OUT = join("public", TC_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const TAKES = Number(process.env.TC_TAKES ?? 3);
const voice = { name: TC_VOICE.name, voiceId: TC_VOICE.voiceId };

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const tcHash = (line) => `tc1-${ts2Hash(line, voice.voiceId)}`;

if (!apiKey && !existsSync(MANIFEST)) {
  console.log("ELEVENLABS_API_KEY не задан и озвучки нет — финальный рендер будет остановлен.");
  process.exit(0);
}

const TMP = join(tmpdir(), "taxi-child-takes");
mkdirSync(TMP, { recursive: true });
// Для каждой фразы — кандидаты (дубли); у готовой из кэша — один.
const cands = [];
let made = 0;
for (const line of TC_LINES) {
  const hash = tcHash(line);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    cands.push({ line, hash, file, takes: [{ cached: true, info: old }] });
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const takes = [];
  if (old && old.voiceId === voice.voiceId && old.spoken === (line.spoken ?? line.text) && (old.tag ?? null) === (line.tag ?? null) && existsSync(join(OUT, file))) {
    const path = join(TMP, `${line.id}-prev.mp3`);
    copyFileSync(join(OUT, file), path);
    const { asrCer: _c, asrHeard: _h, f0: _f, takes: _t, hash: _x, ...info } = old;
    takes.push({ path, info, seed: old.seed, prev: true });
  }
  for (let k = 0; k < TAKES; k++) {
    const seed = lineSeed(line) + k * 11;
    const path = join(TMP, `${line.id}-${seed}.mp3`);
    takes.push({ path, info: await synthLine(apiKey, line, voice, path, seed), seed });
    made++;
  }
  cands.push({ line, hash, file, takes });
}

// Разборчивость дублей (Meta MMS, адаптер kir).
const fresh = cands.flatMap((c) => c.takes.filter((t) => !t.cached).map((t) => ({ path: t.path, text: c.line.spoken ?? c.line.text })));
let scores = null;
if (fresh.length) {
  const inp = join(TMP, "score-in.json");
  const out = join(TMP, "score-out.json");
  writeFileSync(inp, JSON.stringify(fresh));
  try {
    execFileSync("python3", ["scripts/ts2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    scores = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
  } catch (e) {
    console.warn(`  ⚠ распознавание недоступно (${e.message.split("\n")[0]}) — дубли сравниваются только по длительности`);
  }
}
// Без замера: прежний дубль хуже нового на 0,1 (новый — по свежим настройкам).
const cerOf = (t) => (t.cached ? (t.info.asrCer ?? 0) : (scores?.get(t.path)?.cer ?? (t.prev ? 0.1 : 0)));
const speechOf = (t) => t.info.speechEnd - t.info.speechStart;

// Выбор: лучший CER; если вместе не помещаются — замены на более короткие дубли.
const pick = cands.map((c) => c.takes.reduce((best, t, i) => (cerOf(t) < cerOf(c.takes[best]) ? i : best), 0));
const manifestLines = () => cands.map((c, i) => ({ ...c.takes[pick[i]].info, id: c.line.id, file: c.file }));
for (let guard = 0; guard < 40 && checkTcTiming(manifestLines()).length; guard++) {
  let bestSwap = null;
  cands.forEach((c, i) => {
    const cur = c.takes[pick[i]];
    c.takes.forEach((t, j) => {
      const saved = speechOf(cur) - speechOf(t);
      if (saved <= 0.02) return;
      const cost = (cerOf(t) - cerOf(cur)) / saved;
      if (!bestSwap || cost < bestSwap.cost) bestSwap = { i, j, cost };
    });
  });
  if (!bestSwap) break;
  pick[bestSwap.i] = bestSwap.j;
}

const lines = cands.map((c, i) => {
  const t = c.takes[pick[i]];
  if (t.cached) return t.info;
  copyFileSync(t.path, join(OUT, c.file));
  const asr = scores?.get(t.path) ?? null;
  console.log(`✓ ${c.line.id}: дубль seed ${t.seed}${t.prev ? " (прежний)" : ""}, речь ${speechOf(t).toFixed(2)} с` + (asr ? `, CER ${asr.cer} (дубли: ${c.takes.map((x) => scores?.get(x.path)?.cer ?? "?").join(" / ")})` : ""));
  return {
    ...t.info,
    hash: c.hash,
    file: c.file,
    asrCer: asr?.cer ?? null,
    asrHeard: asr?.heard ?? null,
    f0: asr?.f0 ?? null,
    takes: c.takes.map((x) => ({ seed: x.seed, prev: Boolean(x.prev), cer: scores?.get(x.path)?.cer ?? null, speechSec: Number(speechOf(x).toFixed(3)) })),
  };
});
writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "taxi-child", video: TC_VIDEO.id, voice: TC_VOICE.name, lines }, null, 2) + "\n");
const total = lines.reduce((a, l) => a + l.speechEnd - l.speechStart, 0);
console.log(`Фраз: ${lines.length} (синтезов: ${made}), речь всего ${total.toFixed(2)} с`);

const problems = checkTcTiming(lines);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) {
  console.error("✗ Озвучка не помещается в 60 с — нужен другой дубль (seed) или правка сценария.");
  process.exit(1);
}
