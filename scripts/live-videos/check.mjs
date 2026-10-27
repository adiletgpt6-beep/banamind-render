// Проверка заданий живых видео: структура task.json, уникальные теги превью
// (старые версии не перезаписываются), композиции зарегистрированы, план
// укладывается в лимиты вставок и звуков (live-videos/RULES.md).
//   node scripts/live-videos/check.mjs
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SFX_LIMIT_PER_45S, insertLimit, listTasks } from "./lib.mjs";

const errors = [];
const err = (m) => errors.push(m);
const root = readFileSync("src/Root.tsx", "utf8");
const tags = new Map();
const tasks = listTasks();
for (const t of tasks) {
  if (!t.title) err(`${t.id}: нет названия`);
  if (!t.sources?.release && !t.sources?.r2?.key)
    err(`${t.id}: нет исходника GitHub Release или sources.r2.key`);
  if (t.sources?.r2?.key && !new RegExp("^live/raw/[0-9a-f-]{36}/source[.](mp4|mov)$").test(t.sources.r2.key))
    err(`${t.id}: некорректный приватный ключ R2`);
  if (!existsSync(`${t.dir}/TASK.md`)) err(`${t.id}: нет TASK.md`);
  for (const v of t.versions ?? []) {
    const key = `${t.id} ${v.version}`;
    if (!v.composition) err(`${key}: нет композиции`);
    if (!["preview", "final"].includes(v.stage)) err(`${key}: stage должен быть preview или final`);
    if (!v.previewTag) err(`${key}: нет previewTag`);
    else if (tags.has(v.previewTag)) err(`${key}: previewTag ${v.previewTag} уже у ${tags.get(v.previewTag)} — версии не перезаписываются`);
    else tags.set(v.previewTag, key);
    if (v.legacy) continue;
    if (v.composition && !root.includes(`id="${v.composition}"`)) err(`${key}: композиция ${v.composition} не зарегистрирована в src/Root.tsx (id="${v.composition}")`);
    if (!v.plan || !existsSync(v.plan)) {
      err(`${key}: нет плана ${v.plan ?? ""}`);
      continue;
    }
    const { PLAN } = await import(pathToFileURL(resolve(v.plan)).href);
    if (!PLAN) {
      err(`${key}: ${v.plan} не экспортирует PLAN`);
      continue;
    }
    const lim = insertLimit(PLAN.liveSec);
    // ориентир live/STYLE.md: больше — только с обоснованием смысла каждой вставки
    if (PLAN.inserts.length > lim && !PLAN.justification) err(`${key}: вставок ${PLAN.inserts.length} (ориентир ${lim}) — опишите смысл в PLAN.justification`);
    // живой CTA: если автор его произнёс — не дублировать (AGENTS.md, live/STYLE.md)
    if (PLAN.cta?.spoken && PLAN.cta.duplicated !== false) err(`${key}: CTA уже произнесён автором — дублировать нельзя (cta.duplicated: false)`);
    if (PLAN.cta && !PLAN.cta.spoken) console.warn(`::warning::${key}: CTA в записи нет — сообщить владельцу и согласовать решение`);
    // жёсткого лимита звуков нет (RULES.md п. 3–4): предупреждение, если их явно много
    const sfxSoft = Math.round((SFX_LIMIT_PER_45S * 2.5 * Math.max(30, PLAN.liveSec)) / 45);
    if (PLAN.sfx.length > sfxSoft) console.warn(`::warning::${key}: звуков ${PLAN.sfx.length} — проверьте, не шумно ли (ориентир ≤ ${sfxSoft})`);
    // одновременно в кадре — одна вставка (RULES.md п. 2)
    const sorted = [...PLAN.inserts].sort((a, b) => a.from - b.from);
    for (let i = 1; i < sorted.length; i++) if (sorted[i].from < sorted[i - 1].to - 0.35) err(`${key}: вставки ${sorted[i - 1].id} и ${sorted[i].id} пересекаются`);
    for (const ins of PLAN.inserts) if (!ins.words || !ins.why) err(`${key}: вставка ${ins.id} без слов или смысла`);
    console.log(`✓ ${key}: ${PLAN.inserts.length}/${lim} вставок, ${PLAN.sfx.length} звуков, ${v.stage}, → ${v.previewTag}`);
  }
}
if (errors.length) {
  for (const e of errors) console.error(`::error::${e}`);
  process.exit(1);
}
console.log(`Заданий: ${tasks.length}, ошибок нет.`);
