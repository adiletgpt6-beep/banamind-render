// Таблица реплик и тайминга BalaGoChessTournament2D для
// docs/chess-tournament-2d.md (раздел между маркерами BEGIN/END) — из
// фактических manifest.json и timeline.json. Запуск: node scripts/ch2d-docs.mjs
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "public/audio/chess-tournament-2d";
const DOC = "docs/chess-tournament-2d.md";
const tl = JSON.parse(readFileSync(`${DIR}/timeline.json`, "utf8"));
const man = new Map(JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8")).lines.map((l) => [l.id, l]));
const f2 = (x) => Number(x).toFixed(2);

const out = [];
out.push(`Фактическая длительность: **${f2(tl.durationSec)} с** (${tl.frames} кадров, 30 к/с); контактная карточка — кадры ${tl.contactFromFrame}–${tl.frames - 1} (последние ${tl.frames - tl.contactFromFrame}).`, "");
out.push("### Сцены", "", "| Сцена | Начало, с | Конец, с |", "| --- | --- | --- |");
for (const s of tl.scenes) out.push(`| ${s.title} | ${f2(s.from)} | ${f2(s.to)} |`);
out.push("", "### Реплики", "", "| ID | Роль | Режим | Текст (кыргызча) | Файл | Голос | Речь, с | Начало, с | Конец, с | CER MMS | Связанное действие |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const s of tl.segments) {
  const l = man.get(s.id);
  out.push(`| ${s.id} | ${s.role} | ${s.mode} | ${s.text} | \`${s.file}\` | ${s.voice} | ${f2(l.speechEnd - l.speechStart)} | ${f2(s.from)} | ${f2(s.to)} | ${l.asrCer ?? "—"} | ${s.action} |`);
}
out.push("", "### Параметры синтеза", "", "| ID | voice_id | Модель | seed | Тег | Текст для TTS (если отличается) |", "| --- | --- | --- | --- | --- | --- |");
for (const s of tl.segments) {
  const l = man.get(s.id);
  out.push(`| ${s.id} | \`${l.voiceId}\` | ${l.modelId} | ${l.seed} | ${l.tag ?? "—"} | ${l.spoken !== l.text ? l.spoken : "—"} |`);
}
const doc = readFileSync(DOC, "utf8");
const a = doc.indexOf("<!-- BEGIN timing -->");
const b = doc.indexOf("<!-- END timing -->");
writeFileSync(DOC, doc.slice(0, a + "<!-- BEGIN timing -->".length) + "\n" + out.join("\n") + "\n" + doc.slice(b));
console.log(`${DOC}: обновлено (${tl.segments.length} реплик, ${f2(tl.durationSec)} с)`);
