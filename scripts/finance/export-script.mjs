// Полный английский сценарий выпуска в Markdown из src/finance/episode/script.ts
// (один источник правды для озвучки, субтитров и документа).
// Запуск: node scripts/finance/export-script.mjs → finance/episode-01/script.md
import { mkdirSync, writeFileSync } from "node:fs";
import { EPISODE } from "../../src/finance/episode/script.ts";
import { EPISODE_RU } from "../../src/finance/episode/script.ru.ts";
import { langOf } from "./lang.mjs";

const LANG = process.argv[2] ?? "en";
const L = langOf(LANG);
const SCENES = L.scenes;

const out =
  LANG === "ru"
    ? [`# ${EPISODE_RU.title}`, "", "Ведущий — лошадка. Сквозной пример: Алекс — зарплата на руки $4000 в месяц, расходы $3200, остаток $800 (учебные цифры, не статистика зарплат).", ""]
    : [`# ${EPISODE.title}`, "", "Host: the Horse (narrator). Running example: Alex — take-home pay $4,000/month, spending $3,200, leftover $800 (teaching numbers, not salary statistics).", ""];
let n = 0;
for (const s of SCENES) {
  out.push(`## ${++n}. ${s.chapter}`, "", `_Scene \`${s.id}\` · background: ${s.bg} · visual: ${s.visual} · host: ${s.host.map((h) => h.layout).join(" → ")}_`, "");
  for (const l of s.lines) out.push(`**${l.id}** — ${l.text}`, "");
}
const words = SCENES.flatMap((s) => s.lines).reduce((a, l) => a + l.text.split(/\s+/).length, 0);
out.push("---", "", `Lines: ${SCENES.flatMap((s) => s.lines).length} · words: ${words}`);
mkdirSync("finance/episode-01", { recursive: true });
writeFileSync(`finance/episode-01/${L.script}`, out.join("\n") + "\n");
console.log(`${L.script}: ${words} words`);
