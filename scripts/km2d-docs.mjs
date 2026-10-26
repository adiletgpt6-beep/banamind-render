// Таблица реплик и тайминга BalaGoKnowsMyName2D для
// docs/knows-my-name-2d.md (раздел между маркерами BEGIN/END) — из
// фактических manifest.json и timeline.json. Запуск: node scripts/km2d-docs.mjs
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "public/audio/knows-my-name-2d";
const DOC = "docs/knows-my-name-2d.md";
const tl = JSON.parse(readFileSync(`${DIR}/timeline.json`, "utf8"));
const man = new Map(JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8")).lines.map((l) => [l.id, l]));
const report = JSON.parse(readFileSync("voice-samples/knows-my-name-2d/probe/report.json", "utf8"));
const f2 = (x) => Number(x).toFixed(2);

const out = [];
out.push(`Фактическая длительность: **${f2(tl.durationSec)} с** (${tl.frames} кадров, 30 к/с); контактная карточка — кадры ${tl.contactFromFrame}–${tl.frames - 1} (последние ${tl.frames - tl.contactFromFrame}).`, "");
out.push("### Сцены", "", "| Сцена | Начало, с | Конец, с |", "| --- | --- | --- |");
for (const s of tl.scenes) out.push(`| ${s.title} | ${f2(s.from)} | ${f2(s.to)} |`);
out.push("", "### Реплики", "", "| ID | Роль | Режим | Текст в кадре (кыргызча) | Что ушло в TTS | Файл | Голос (voice_id) | seed | Речь, с | Начало, с | Конец, с | CER MMS | Связанное действие |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const s of tl.segments) {
  const l = man.get(s.id);
  const spoken = l.spoken && l.spoken !== s.text ? l.spoken : "—";
  out.push(`| ${s.id} | ${s.role} | ${s.mode} | ${s.text} | ${spoken} | \`${s.file}\` | ${s.voice} (\`${l.voiceId}\`) | ${l.seed} | ${f2(l.speechEnd - l.speechStart)} | ${f2(s.from)} | ${f2(s.to)} | ${l.asrCer ?? "—"} | ${s.action} |`);
}
const any = [...man.values()][0];
out.push("", `Модель: \`${any.modelId}\`, язык \`ky\`, настройки голоса: stability 0,5, similarity_boost 0,8; темп и высота тона не менялись.`);
out.push("", "### Пробы голоса мальчика (K01–K05)", "", "| Кандидат | voice_id | Средний CER | F0, Гц | Возраст по модели | «Ребёнок» | Штраф |", "| --- | --- | --- | --- | --- | --- | --- |");
for (const c of report.summary) out.push(`| ${c.name} | \`${c.voiceId}\` | ${c.cer} | ${c.f0} | ${c.age} | ${c.child} | ${c.penalty} |`);
out.push("", `Выбрано: **${report.picked?.name}** (\`${report.picked?.voiceId}\`) — ${report.picked?.reason ?? ""}.`);

const doc = readFileSync(DOC, "utf8");
const a = doc.indexOf("<!-- BEGIN timing -->");
const b = doc.indexOf("<!-- END timing -->");
writeFileSync(DOC, doc.slice(0, a + "<!-- BEGIN timing -->".length) + "\n" + out.join("\n") + "\n" + doc.slice(b));
console.log(`${DOC}: обновлено (${tl.segments.length} реплик, ${f2(tl.durationSec)} с)`);
