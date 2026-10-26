// Озвучка BalaGoBG018: файл на реплику (src/campaign50/bg-018/script.ts),
// готовые кыргызские голоса проекта.
//
// Кэш: реплика с тем же хэшем (текст, тег, голос, модель, настройки, seed),
// уже лежащая в public/audio/campaign50/bg-018/, повторно не синтезируется —
// за те же реплики не платим второй раз. Изменить одну реплику — значит
// синтезировать только её (или поменять её seed для нового дубля).
//
// Запуск: node scripts/campaign50/bg-018/generate-voice.mjs
// (нужен ELEVENLABS_API_KEY, только если есть новые/изменённые реплики).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BG18_LINES, BG18_VIDEO } from "../../../src/campaign50/bg-018/script.ts";
import { buildBg18Timeline, checkBg18Timeline } from "../../../src/campaign50/bg-018/timing.ts";
import { bg18Hash, lineSeed, synthLine, voiceOfRole } from "./tts.mjs";

const OUT = join("public", BG18_VIDEO.voiceDir);
const MANIFEST = join(OUT, "manifest.json");
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

mkdirSync(OUT, { recursive: true });
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { lines: [] };
const prevById = new Map(prev.lines.map((l) => [l.id, l]));
const lines = [];
const save = (partial) =>
  writeFileSync(MANIFEST, JSON.stringify({ version: 1, kind: "bg018", video: BG18_VIDEO.id, partial, lines }, null, 2) + "\n");

let made = 0;
let reused = 0;
for (const line of BG18_LINES) {
  const voice = voiceOfRole(line.role);
  if (!voice) throw new Error(`Нет голоса для роли ${line.role}`);
  const hash = bg18Hash(line, voice.voiceId);
  const file = `${line.id}.mp3`;
  const old = prevById.get(line.id);
  if (old?.hash === hash && existsSync(join(OUT, file))) {
    lines.push(old);
    reused++;
    continue;
  }
  if (!apiKey) throw new Error(`Нет озвучки для ${line.id}, а ELEVENLABS_API_KEY не задан.`);
  const info = await synthLine(apiKey, line, voice, join(OUT, file), lineSeed(line));
  lines.push({ ...info, hash, file });
  made++;
  // сохраняем после каждой реплики: оплаченный синтез не теряется при сбое
  save(true);
}
save(false);
console.log(`Реплик: ${lines.length} (синтезов: ${made}, из кэша: ${reused})`);

const tl = buildBg18Timeline({ version: 1, kind: "bg018", lines });
console.log(`Длительность ролика: ${tl.durationSec.toFixed(2)} с (${tl.frames} кадров)`);
for (const s of tl.scenes) console.log(`  ${s.from.toFixed(2)}–${s.to.toFixed(2)} ${s.title}`);
const problems = checkBg18Timeline(tl);
for (const p of problems) console.warn(`  ⚠ ${p}`);
if (problems.length) process.exit(1);
