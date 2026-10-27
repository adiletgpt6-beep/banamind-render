// «Прослушивание» готового MP4 распознаванием речи: из экспортированного
// звука (с музыкой и эффектами) вырезается интервал каждой реплики по
// manifest, Meta MMS (кыргызский) распознаёт его и сравнивает с текстом.
// Падает, если реплики нет или она неразборчива (CER > 0,35 — запас на
// музыку под голосом). Запуск: node scripts/fu2d-export-asr.mjs out/x.mp4
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FU2_LINES, FU2_VIDEO } from "../src/five-unsent-messages-2d/script.ts";
import { buildFu2Cues } from "../src/five-unsent-messages-2d/timing.ts";

const file = process.argv[2];
const dir = join(tmpdir(), "fu2d-export-asr");
mkdirSync(dir, { recursive: true });
const manifest = JSON.parse(readFileSync(`public/${FU2_VIDEO.voiceDir}/manifest.json`, "utf8"));
const items = buildFu2Cues(manifest).map((c) => {
  const l = FU2_LINES.find((x) => x.id === c.line);
  const path = join(dir, `${c.id}.wav`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(Math.max(0, c.from - 0.08)), "-to", String(c.to + 0.12), "-i", file, "-ac", "1", "-ar", "16000", path]);
  return { id: c.id, path, text: l.spoken ?? l.text };
});
writeFileSync(join(dir, "in.json"), JSON.stringify(items.map(({ path, text }) => ({ path, text }))));
execFileSync("python3", ["scripts/fu2d_asr.py", "--score", join(dir, "in.json"), join(dir, "out.json")], { stdio: "inherit" });
const res = new Map(JSON.parse(readFileSync(join(dir, "out.json"), "utf8")).map((r) => [r.path, r]));
let bad = 0;
for (const it of items) {
  const r = res.get(it.path);
  const ok = r && r.cer <= 0.35;
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} ${it.id}  CER ${r?.cer}  «${r?.heard}»`);
}
if (bad) {
  console.error(`::error::${file}: ${bad} реплик не распознаны в готовом звуке`);
  process.exit(1);
}
console.log(`${file}: все ${items.length} реплик распознаны в готовом звуке`);
