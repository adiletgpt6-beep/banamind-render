// Таблица реплик и тайминга BalaGoMeeting1320 для docs/meeting-1320.md
// (раздел между маркерами BEGIN/END) — из фактических manifest.json и
// timeline.json и отчёта проб голосов. Запуск: node scripts/m1320-docs.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "public/meeting-1320/voice";
const DOC = "docs/meeting-1320.md";
const tl = JSON.parse(readFileSync(`${DIR}/timeline.json`, "utf8"));
const man = new Map(JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8")).lines.map((l) => [l.id, l]));
const PROBE = "voice-samples/meeting-1320/probe/report.json";
const report = existsSync(PROBE) ? JSON.parse(readFileSync(PROBE, "utf8")) : null;
const f2 = (x) => Number(x).toFixed(2);
const mmss = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;

const out = [];
out.push(
  `Фактическая длительность: **${f2(tl.durationSec)} с** (${mmss(tl.durationSec)}, ${tl.frames} кадров, 30 к/с); неподвижная карточка с контактами (Бишкек, ссылка в профиле, WhatsApp) — кадры ${tl.contactFromFrame}–${tl.frames - 1} (${f2((tl.frames - tl.contactFromFrame) / 30)} с, с ${f2(tl.contactFromFrame / 30)} с); после последнего слова — ${f2(tl.durationSec - Math.max(...tl.segments.map((s) => s.to)))} с.`,
  "",
);
out.push("### Сцены", "", "| Сцена | Начало, с | Конец, с | Длина, с |", "| --- | --- | --- | --- |");
for (const s of tl.scenes) out.push(`| ${s.title} | ${f2(s.from)} | ${f2(s.to)} | ${f2(s.to - s.from)} |`);
out.push(
  "",
  "### Реплики",
  "",
  "| ID | Роль | Режим | Текст (кыргызча) | Что ушло в TTS | Файл | Голос (voice_id) | seed | Речь, с | Начало, с | Конец, с | CER MMS | Действие в кадре |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
);
for (const s of tl.segments) {
  const l = man.get(s.id);
  const spoken = l.spoken && l.spoken !== s.text ? l.spoken : "—";
  out.push(
    `| ${s.id} | ${s.role} | ${s.mode} | ${s.text} | ${spoken} | \`${s.file}\` | ${s.voice} (\`${l.voiceId}\`) | ${l.seed} | ${f2(l.speechEnd - l.speechStart)} | ${f2(s.from)} | ${f2(s.to)} | ${l.asrCer ?? "—"} | ${s.action} |`,
  );
}
const any = [...man.values()][0];
out.push("", `Модель: \`${any.modelId}\`, язык \`ky\`, stability 0,5, similarity_boost 0,8; темп и высота тона не менялись.`);
if (report) {
  out.push(
    "",
    "### Пробы голосов",
    "",
    "| Роль | Кандидат | voice_id | Средний CER | F0, Гц | Возраст по модели | «Мужчина» | «Женщина» | «Ребёнок» | Штраф |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );
  for (const c of report.summary) out.push(`| ${c.role} | ${c.name} | \`${c.voiceId}\` | ${c.cer} | ${c.f0} | ${c.age} | ${c.male} | ${c.female} | ${c.child} | ${c.penalty} |`);
  out.push("");
  for (const [role, p] of Object.entries(report.picked ?? {})) out.push(`- ${role}: **${p.name}** (\`${p.voiceId}\`) — ${p.reason}.`);
  if (report.failed?.length) out.push("", `Недоступные кандидаты: ${report.failed.map((x) => `${x.role}/${x.name}`).join(", ")}.`);
}

const doc = readFileSync(DOC, "utf8");
const a = doc.indexOf("<!-- BEGIN timing -->");
const b = doc.indexOf("<!-- END timing -->");
writeFileSync(DOC, doc.slice(0, a + "<!-- BEGIN timing -->".length) + "\n" + out.join("\n") + "\n" + doc.slice(b));
console.log(`${DOC}: обновлено (${tl.segments.length} реплик, ${f2(tl.durationSec)} с)`);
