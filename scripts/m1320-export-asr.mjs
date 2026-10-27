// «Прослушивание» готового MP4 распознаванием речи: из экспортированного
// звука (с музыкой и эффектами) вырезается интервал каждой реплики по
// manifest, Meta MMS (кыргызский) распознаёт его и сравнивает с текстом.
// Падает, если реплики нет или она неразборчива (CER > 0,35 — запас на
// музыку под голосом). Запуск: node scripts/m1320-export-asr.mjs out/x.mp4
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { M13_LINES, M13_VIDEO } from "../src/meeting-1320/script.ts";
import { buildM13Timeline } from "../src/meeting-1320/timing.ts";

const file = process.argv[2];
const dir = join(tmpdir(), "m1320-export-asr");
mkdirSync(dir, { recursive: true });
const manifest = JSON.parse(readFileSync(`public/${M13_VIDEO.voiceDir}/manifest.json`, "utf8"));
const items = buildM13Timeline(manifest).cues.map((c) => {
  const l = M13_LINES.find((x) => x.id === c.line);
  const path = join(dir, `${c.id}.wav`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(Math.max(0, c.from - 0.08)), "-to", String(c.to + 0.12), "-i", file, "-ac", "1", "-ar", "16000", path]);
  const m = manifest.lines.find((x) => x.id === c.line);
  return { id: c.id, path, text: l.spoken ?? l.text, speech: c.to - c.from, isoCer: m?.asrCer ?? null };
});
writeFileSync(join(dir, "in.json"), JSON.stringify(items.map(({ path, text }) => ({ path, text }))));
execFileSync("python3", ["scripts/m1320_asr.py", "--score", join(dir, "in.json"), join(dir, "out.json")], { stdio: "inherit" });
const res = new Map(JSON.parse(readFileSync(join(dir, "out.json"), "utf8")).map((r) => [r.path, r]));
// Фраза короче секунды (2 слова) — для MMS почти без контекста: её
// распознавание в миксе неустойчиво. Если сам дубль распознан (CER ≤ 0,15)
// и в миксе узнаётся хотя бы половина букв, это предупреждение ⚠ (видно в
// логе и отчёте), а не провал; уровень речи в миксе отдельно проверяет
// m1320-speech-check.mjs.
let bad = 0;
let warn = 0;
for (const it of items) {
  const r = res.get(it.path);
  const ok = r && r.cer <= 0.35;
  const soft = !ok && r && it.speech < 1 && it.isoCer !== null && it.isoCer <= 0.15 && r.cer <= 0.6;
  if (soft) warn++;
  else if (!ok) bad++;
  console.log(`${ok ? "✓" : soft ? "⚠" : "✗"} ${it.id}  CER ${r?.cer}  «${r?.heard}»${soft ? `  (короткая фраза ${it.speech.toFixed(2)} с; отдельно — CER ${it.isoCer})` : ""}`);
}
if (warn) console.warn(`::warning::${file}: ${warn} коротк. фраз распознаны в миксе неуверенно (см. ⚠)`);
if (bad) {
  console.error(`::error::${file}: ${bad} реплик не распознаны в готовом звуке`);
  process.exit(1);
}
console.log(`${file}: все ${items.length} реплик распознаны в готовом звуке`);
