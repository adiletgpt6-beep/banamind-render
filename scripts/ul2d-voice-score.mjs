// Распознавание (MMS, CER) и замеры (F0) сэмплов подбора голоса:
// voice-samples/unanswered-letter-2d/asr-targets.json → asr.json. Уже
// распознанные файлы (тот же размер) не распознаются повторно.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = "voice-samples/unanswered-letter-2d";
const T = join(ROOT, "asr-targets.json");
if (!existsSync(T)) process.exit(0);
const targets = JSON.parse(readFileSync(T, "utf8"));
const OUT = join(ROOT, "asr.json");
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const todo = Object.entries(targets).filter(([p]) => existsSync(p) && prev[p]?.bytes !== statSync(p).size);
if (todo.length) {
  const inp = join(tmpdir(), "ul2d-vs-in.json");
  const out = join(tmpdir(), "ul2d-vs-out.json");
  writeFileSync(inp, JSON.stringify(todo.map(([path, text]) => ({ path, text }))));
  execFileSync("python3", ["scripts/ul2d_asr.py", "--score", inp, out], { stdio: "inherit" });
  for (const r of JSON.parse(readFileSync(out, "utf8"))) prev[r.path] = { ...r, bytes: statSync(r.path).size };
}
writeFileSync(OUT, JSON.stringify(prev, null, 2) + "\n");
console.log(`Распознано: ${todo.length}, всего: ${Object.keys(prev).length}`);
