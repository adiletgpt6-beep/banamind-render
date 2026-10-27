// Таблица реплик и тайминга BalaGoNineYearOldEmployee2D для
// docs/nine-year-old-employee-2d.md (раздел между маркерами BEGIN/END) — из
// фактических manifest.json и timeline.json. Запуск: node scripts/ny2d-docs.mjs
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "public/audio/nine-year-old-employee-2d";
const DOC = "docs/nine-year-old-employee-2d.md";
const tl = JSON.parse(readFileSync(`${DIR}/timeline.json`, "utf8"));
const man = new Map(JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8")).lines.map((l) => [l.id, l]));
const report = JSON.parse(readFileSync("voice-samples/nine-year-old-employee-2d/son-probe/report.json", "utf8"));
const f2 = (x) => Number(x).toFixed(2);

const out = [];
out.push(`Фактическая длительность: **${f2(tl.durationSec)} с** (${tl.frames} кадров, 30 к/с); контактная карточка — кадры ${tl.contactFromFrame}–${tl.frames - 1} (последние ${tl.frames - tl.contactFromFrame}).`, "");
out.push("### Сцены", "", "| Сцена | Начало, с | Конец, с |", "| --- | --- | --- |");
for (const s of tl.scenes) out.push(`| ${s.title} | ${f2(s.from)} | ${f2(s.to)} |`);
out.push("", "### Реплики", "", "| ID | Роль | Режим | Текст (кыргызча) | Файл | Голос | Речь, с | Начало, с | Конец, с | Связанное действие |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const s of tl.segments) {
  const l = man.get(s.id);
  out.push(`| ${s.id} | ${s.role} | ${s.mode} | ${s.text} | \`${s.file}\` | ${s.voice} | ${f2(l.speechEnd - l.speechStart)} | ${f2(s.from)} | ${f2(s.to)} | ${s.action} |`);
}
out.push("", "### Пробы голоса сына", "", "| Превью | Источник | F0, Гц | CER MMS |", "| --- | --- | --- | --- |");
for (const p of report.previews) out.push(`| \`${p.file}\` | ${p.source} ${p.design} | ${p.f0 ?? "—"} | ${p.cer ?? "—"} |`);
out.push("", `Выбрано: **${report.picked?.name}** (\`${report.picked?.voiceId}\`). ${report.picked?.reason ?? ""}`);

const doc = readFileSync(DOC, "utf8");
const a = doc.indexOf("<!-- BEGIN timing -->");
const b = doc.indexOf("<!-- END timing -->");
writeFileSync(DOC, doc.slice(0, a + "<!-- BEGIN timing -->".length) + "\n" + out.join("\n") + "\n" + doc.slice(b));
console.log(`${DOC}: обновлено (${tl.segments.length} реплик, ${f2(tl.durationSec)} с)`);
