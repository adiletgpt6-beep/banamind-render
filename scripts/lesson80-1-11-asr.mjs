// Проверка разборчивости готовой озвучки Lesson80-1-11 (все 45 реплик, любой
// провайдер): распознавание Meta MMS (адаптер "rus", scripts/lesson80_asr.py),
// доля ошибок по буквам (CER) относительно канонического текста и медиана
// основного тона по каждой реплике. Это технический замер, не прослушивание:
// акцент и естественность интонации он не оценивает.
// Результат: voice-samples/lesson-80-1-11/asr.json и таблица в консоли.
// Запуск (нужны python3, torch, transformers — scripts/requirements-ts2d-asr.txt):
//   node scripts/lesson80-1-11-asr.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FILM, L80_LINES } from "../src/lesson80/film-1-11/script.ts";

const DIR = join("public", FILM.voiceDir);
const m = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const items = L80_LINES.map((l) => {
  const ml = m.lines.find((x) => x?.id === l.id);
  if (!ml?.file || !existsSync(join(DIR, ml.file))) throw new Error(`№${l.id}: нет файла озвучки`);
  return { path: join(DIR, ml.file), text: l.text, id: l.id, role: l.role };
});
const TMP = join(tmpdir(), "lesson80-1-11-asr");
mkdirSync(TMP, { recursive: true });
const inp = join(TMP, "in.json");
const out = join(TMP, "out.json");
writeFileSync(inp, JSON.stringify(items.map(({ path, text }) => ({ path, text }))));
execFileSync("python3", ["scripts/lesson80_asr.py", "--score", inp, out], { stdio: "inherit" });
const res = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
const rows = items.map((it) => {
  const r = res.get(it.path);
  return { id: it.id, role: it.role, text: it.text, heard: r?.heard ?? null, cer: r?.cer ?? null, f0: r?.f0 ?? null };
});
const byRole = {};
for (const r of rows) {
  const b = (byRole[r.role] ??= { lines: 0, cerMax: 0, f0: [] });
  b.lines++;
  b.cerMax = Math.max(b.cerMax, r.cer ?? 0);
  if (r.f0) b.f0.push(r.f0);
}
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const summary = Object.fromEntries(Object.entries(byRole).map(([k, v]) => [k, { lines: v.lines, cerMax: v.cerMax, f0Median: median(v.f0) }]));
mkdirSync(join("voice-samples", "lesson-80-1-11"), { recursive: true });
writeFileSync(join("voice-samples", "lesson-80-1-11", "asr.json"), JSON.stringify({ provider: m.provider, summary, rows }, null, 1) + "\n");
for (const r of rows) console.log(`№${String(r.id).padStart(2, "0")} ${r.role.padEnd(8)} CER ${String(r.cer).padEnd(5)} F0 ${String(r.f0).padEnd(6)} «${r.heard}»`);
console.log(JSON.stringify({ provider: m.provider, summary }, null, 1));
