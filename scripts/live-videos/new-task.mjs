// Новое задание живого видео: следующий номер LIVE-NNN, папка из шаблона,
// строка в реестре.  npm run live:new -- <release-tag> "<название>"
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ID_RE, TASKS, listTasks } from "./lib.mjs";

const [release, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(" ").trim();
if (!release || !title) {
  console.error('usage: npm run live:new -- <release-tag> "<название>"');
  process.exit(2);
}
const used = new Set(listTasks().map((t) => Number(ID_RE.exec(t.id)[1])));
// номера LIVE-001…003 заняты прежними роликами из реестра
for (const line of readFileSync("live-videos/REGISTRY.md", "utf8").matchAll(/\| LIVE-(\d{3}) \|/g)) used.add(Number(line[1]));
let n = 1;
while (used.has(n)) n++;
if (n > 150) throw new Error("Все 150 номеров заняты");
const id = `LIVE-${String(n).padStart(3, "0")}`;
const slug = `live${String(n).padStart(3, "0")}`;
const dir = join(TASKS, id);
mkdirSync(dir, { recursive: true });
const task = JSON.parse(readFileSync("live-videos/templates/task.json", "utf8"));
task.id = id;
task.title = title;
task.sources.release = release;
Object.assign(task.versions[0], {
  composition: `BalaGo${slug.replace("live", "Live")}V1`,
  previewTag: `live-${String(n).padStart(3, "0")}-v1-preview`,
  plan: `src/live-videos/${slug}/plan.ts`,
});
writeFileSync(join(dir, "task.json"), JSON.stringify(task, null, 2) + "\n");
writeFileSync(
  join(dir, "TASK.md"),
  readFileSync("live-videos/templates/TASK.md", "utf8")
    .replace("LIVE-NNN — <название>", `${id} — ${title}`)
    .replace("`<tag>`", `\`${release}\``)
    .replace("`<CompositionId>`", `\`${task.versions[0].composition}\``)
    .replace("`<preview-tag>`", `\`${task.versions[0].previewTag}\``)
    .replace("src/live-videos/liveNNN/", `src/live-videos/${slug}/`),
);
appendFileSync("live-videos/REGISTRY.md", `| ${id} | ${title} | \`${release}\` | v1 \`${task.versions[0].previewTag}\` | новое |\n`);
console.log(`+ ${dir}/task.json, TASK.md; реестр обновлён. Код: src/live-videos/${slug}/`);
