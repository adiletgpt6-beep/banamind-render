// Какое задание рендерить в workflow live-videos.yml.
//   node scripts/live-videos/task-info.mjs <LIVE-NNN|""> [version] [before-sha]
// Без id — задания, чьи task.json изменились между before-sha и HEAD
// (при push). Печатает JSON-массив и пишет его в $GITHUB_OUTPUT (matrix).
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { activeVersion, listTasks } from "./lib.mjs";

const [id, version, before] = process.argv.slice(2);
const tasks = listTasks();
let picked;
if (id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new Error(`Нет задания ${id}`);
  picked = [{ t, v: activeVersion(t, version || undefined) }];
} else {
  let changed = [];
  try {
    const base = before && !/^0+$/.test(before) ? before : "HEAD~1";
    changed = execFileSync("git", ["diff", "--name-only", base, "HEAD", "--", "live-videos/tasks"]).toString().split("\n");
  } catch {
    changed = [];
  }
  const ids = new Set(changed.map((f) => /live-videos\/tasks\/(LIVE-\d{3})\/task\.json$/.exec(f)?.[1]).filter(Boolean));
  picked = tasks.filter((t) => ids.has(t.id)).map((t) => ({ t, v: activeVersion(t) }));
}
const out = picked.map(({ t, v }) => ({
  id: t.id,
  version: v.version,
  composition: v.composition,
  stage: v.stage,
  previewTag: v.previewTag,
  prepare: (v.prepare ?? []).join(" && ") || "true",
  tests: (v.tests ?? []).join(" && ") || "true",
  out: `${t.id.toLowerCase()}-${v.version}`,
}));
console.log(JSON.stringify(out, null, 2));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${JSON.stringify(out)}\ncount=${out.length}\n`);
