// Таблица реплик и тайминга BalaGoInvitationWithoutName2D для
// docs/invitation-without-name-2d.md (раздел между маркерами BEGIN/END) — из
// фактических manifest.json и timeline.json. Запуск: node scripts/iw2d-docs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { IW2_VOICES } from "../src/invitation-without-name-2d/script.ts";

const DIR = "public/audio/invitation-without-name-2d";
const DOC = "docs/invitation-without-name-2d.md";
const tl = JSON.parse(readFileSync(`${DIR}/timeline.json`, "utf8"));
const man = new Map(JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8")).lines.map((l) => [l.id, l]));
const f2 = (x) => Number(x).toFixed(2);

const out = [];
out.push(`Фактическая длительность: **${f2(tl.durationSec)} с** (${tl.frames} кадров, 30 к/с); контактная карточка — кадры ${tl.contactFromFrame}–${tl.frames - 1} (последние ${tl.frames - tl.contactFromFrame}).`, "");
out.push("### Сцены", "", "| Сцена | Начало, с | Конец, с |", "| --- | --- | --- |");
for (const s of tl.scenes) out.push(`| ${s.title} | ${f2(s.from)} | ${f2(s.to)} |`);
out.push("", "### Реплики", "", "| ID | Роль | Режим | Текст (кыргызча) | Файл | Голос | Файл, с | Речь, с | Начало, с | Конец, с | Связанное действие |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const s of tl.segments) {
  const l = man.get(s.id);
  out.push(`| ${s.id} | ${s.role} | ${s.mode} | ${s.text} | \`${s.file}\` | ${s.voice} | ${f2(l.durationSec)} | ${f2(l.speechEnd - l.speechStart)} | ${f2(s.from)} | ${f2(s.to)} | ${s.action} |`);
}
out.push("", "### Голоса", "", "| Роль | Голос | voice_id |", "| --- | --- | --- |");
for (const [role, v] of Object.entries(IW2_VOICES)) out.push(`| ${role} | ${v.name} | \`${v.voiceId}\` |`);

const doc = readFileSync(DOC, "utf8");
const a = doc.indexOf("<!-- BEGIN timing -->");
const b = doc.indexOf("<!-- END timing -->");
writeFileSync(DOC, doc.slice(0, a + "<!-- BEGIN timing -->".length) + "\n" + out.join("\n") + "\n" + doc.slice(b));
console.log(`${DOC}: обновлено (${tl.segments.length} реплик, ${f2(tl.durationSec)} с)`);
