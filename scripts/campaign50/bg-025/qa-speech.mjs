// Проверка речи в ГОТОВОМ MP4 BalaGoBG025: каждая реплика вырезается из
// звуковой дорожки ролика по шкале озвучки и распознаётся Meta MMS
// (asr.py, адаптер kir) — доля ошибок по буквам (CER) относительно
// сценария; плюс громкость речи и тишина после последнего слова.
// Это технический замер, не замена прослушиванию носителем языка.
//
// Запуск: PYTHON=python3 node scripts/campaign50/bg-025/qa-speech.mjs out/balago-bg-025.mp4
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BG25_LINES, BG25_VIDEO } from "../../../src/campaign50/bg-025/script.ts";
import { buildBg25Timeline } from "../../../src/campaign50/bg-025/timing.ts";

const file = process.argv[2];
if (!file) throw new Error("usage: qa-speech.mjs <mp4>");
const PY = process.env.PYTHON || "python3";
const tl = buildBg25Timeline(JSON.parse(readFileSync(`public/${BG25_VIDEO.voiceDir}/manifest.json`, "utf8")));
const TMP = join(tmpdir(), "balago-bg025-qa");
mkdirSync(TMP, { recursive: true });

const items = [];
for (const c of tl.cues) {
  const line = BG25_LINES.find((l) => l.id === c.id);
  const out = join(TMP, `${c.id}.wav`);
  const a = Math.max(0, c.from - 0.2);
  const d = c.to - c.from + 0.45;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", a.toFixed(3), "-t", d.toFixed(3), "-i", file, "-vn", "-ac", "1", "-ar", "16000", out]);
  items.push({ path: out, text: line.spoken ?? line.text, id: c.id, from: c.from, to: c.to });
}
const inp = join(TMP, "in.json");
const res = join(TMP, "out.json");
writeFileSync(inp, JSON.stringify(items.map(({ path, text }) => ({ path, text }))));
execFileSync(PY, ["scripts/campaign50/bg-025/asr.py", "--score", inp, res], { stdio: "inherit" });
const scores = JSON.parse(readFileSync(res, "utf8"));
let worst = 0;
for (const it of items) {
  const s = scores.find((x) => x.path === it.path);
  worst = Math.max(worst, s.cer);
  console.log(`${it.id} ${it.from.toFixed(2)}–${it.to.toFixed(2)} с: CER ${s.cer}, F0 ${s.f0} Гц — «${s.heard}»`);
}
// тишина голоса после последнего слова (допустимы только тихие эффекты)
const end = tl.frames / BG25_VIDEO.fps;
const tail = execFileSync("sh", [
  "-c",
  `ffmpeg -hide_banner -nostats -ss ${(tl.speechEnd + 0.3).toFixed(2)} -t ${(end - tl.speechEnd - 0.3).toFixed(2)} -i "${file}" -vn -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"`,
]).toString();
console.log(`После последнего слова (${tl.speechEnd.toFixed(2)} с → ${end.toFixed(2)} с, ${(end - tl.speechEnd).toFixed(2)} с):\n${tail.trim()}`);
console.log(`Худший CER: ${worst}`);
if (worst > 0.15) process.exit(1);
