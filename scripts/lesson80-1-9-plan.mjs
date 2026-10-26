// Данные фильма 80-1-9 «Кому сказать спасибо?» в одном документе
// (lesson-80-1-9-plan.md): реестр 45 реплик и файлов озвучки, сцены,
// зрительские паузы, фактический монтажный план и подписи, ключевые
// действия, класс (25 учеников и учитель) и журнал 25 салфеток.
// Всё считается из тех же модулей, что и рендер (шкала по манифесту
// озвучки, хореография, монтаж), поэтому документ совпадает с видео.
//   node scripts/lesson80-1-9-plan.mjs [выходной.md]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { FILM, L80_LINES, L80_SCENES, VOICES } from "../src/lesson80/film-1-9/script.ts";
import { buildTimeline, estimateManifest, pauseFrames } from "../src/lesson80/film-1-9/timeline.ts";
import { buildChoreo } from "../src/lesson80/film-1-9/choreo.ts";
import { buildShots } from "../src/lesson80/film-1-9/shots.ts";
import { CAST } from "../src/lesson80/film-1-9/cast.ts";
import { checkNapkinLog, givenCountAt, trayCountAt } from "../src/lesson80/film-1-9/napkins.ts";

const out = process.argv[2] ?? `${FILM.output}-plan.md`;
const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const { shots, captions } = buildShots(tl, ch);
const FPS = FILM.fps;

const ts = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
};
const tf = (frame) => ts(frame / FPS);
const ROLE = { muhammad: "Мухаммад", yusuf: "Юсуф", amir: "Амир", bilal: "Билал" };
const WHO = (id) => (id === "yusuf" ? "Юсуф" : id === "amir" ? "Амир" : id === "bilal" ? "Билал" : id);
const md = [];
const p = (...s) => md.push(...s);

p(`# Данные фильма 80-1-9 «Кому сказать спасибо?»`, "");
p(
  `Сгенерировано \`node scripts/lesson80-1-9-plan.mjs\` из шкалы по манифесту озвучки`,
  `(\`${MANIFEST}\`, провайдер \`${manifest.provider ?? "оценка"}\`), хореографии и монтажа —`,
  `тех же модулей, что строят композицию \`${FILM.id}\`. Время — м:сс.сс от начала`,
  `фильма, кадры — 30 к/с. Длительность: ${ts(tl.durationSec)} (${tl.durationInFrames} кадров).`,
  "",
);

// ---------- реплики ----------
p("## Реестр реплик и файлов озвучки", "");
p("Начало/конец — звучание речи в фильме (по огибающей файла, порог ≈ −43 дБFS).", "");
p("| № | Сцена | Роль | Текст | Файл | Начало | Конец |", "| --- | --- | --- | --- | --- | --- | --- |");
for (const l of L80_LINES) {
  const snd = tl.sound[l.id];
  const ml = manifest.lines.find((x) => x && x.id === l.id);
  const file = ml?.file ? `\`${FILM.voiceDir}/${ml.file}\`` : "—";
  p(`| ${String(l.id).padStart(2, "0")} | ${l.scene.slice(1)} | ${ROLE[l.role]} | ${l.text.replace(/\|/g, "\\|")} | ${file} | ${ts(snd.start)} | ${ts(snd.end)} |`);
}
p("");
p("| Роль | Голос (ElevenLabs) | Резерв (RHVoice) | Реплик |", "| --- | --- | --- | --- |");
for (const [role, v] of Object.entries(VOICES)) {
  p(`| ${ROLE[role]} | ${v.elevenlabs?.name ?? "—"} | ${v.rhvoice?.voice ?? "—"} | ${L80_LINES.filter((l) => l.role === role).length} |`);
}
p("");

// ---------- сцены и паузы ----------
p("## Сцены", "", "| Сцена | Начало | Конец | Реплики |", "| --- | --- | --- | --- |");
for (const s of L80_SCENES) {
  const sp = tl.scenes.find((x) => x.id === s.id);
  const ids = L80_LINES.filter((l) => l.scene === s.id).map((l) => l.id);
  p(`| ${s.title} | ${ts(sp.from)} | ${ts(sp.to)} | ${Math.min(...ids)}–${Math.max(...ids)} |`);
}
p("");
p("## Зрительские паузы", "");
p("От кадра полного окончания звучания вопроса до кадра первого звука ответа.", "");
p("| Пауза | После реплики | Ответ — реплика | Начало | Конец | Кадров |", "| --- | --- | --- | --- | --- | --- |");
for (const ps of tl.pauses) p(`| ${ps.id} | ${ps.after} | ${ps.after + 1} | ${ts(ps.from)} | ${ts(ps.to)} | ${pauseFrames(tl, ps.after)} |`);
p("");

// ---------- монтаж ----------
p("## Монтажный план (фактический)", "");
p("| # | Кадры | Начало | Конец | Длит., с | План | Переход |", "| --- | --- | --- | --- | --- | --- | --- |");
shots.forEach((s, i) => {
  const kind = s.kind === "garden" ? `сад: ${s.garden === "tree" ? "яблоня" : "работник"}` : s.label;
  const tr = s.dissolve ? `растворение ${s.dissolve} к.` : "склейка";
  p(`| ${i + 1} | ${s.from}–${s.to - 1} | ${tf(s.from)} | ${tf(s.to)} | ${((s.to - s.from) / FPS).toFixed(2)} | ${kind} | ${i === 0 ? "начало" : tr} |`);
});
p("");
p("| Подпись | Начало | Конец |", "| --- | --- | --- |");
for (const c of captions) p(`| ${c.text} | ${tf(c.from)} | ${tf(c.to)} |`);
p("");

// ---------- ключевые действия ----------
const ev = ch.events;
p("## Ключевые действия", "", "| Действие | Время |", "| --- | --- |");
const evRows = [
  ["тарелка Юсуфа коснулась столика (учитель ставит)", ev.plateContact],
  ["учитель отпустил тарелку", ev.plateRelease],
  ["салфетка №24 положена перед Юсуфом (Билал)", ev.yusufNapkinPlaced],
  ["Юсуф коснулся последней салфетки на подносе", ev.lastTouch],
  ["Юсуф взял последнюю салфетку", ev.lastTake],
  ["совместное касание Юсуф → Билал", ev.lastContact],
  ["Юсуф отпустил салфетку (она у Билала)", ev.lastRelease],
  ["Юсуф взял кусочек яблока правой рукой", ev.sliceTake],
  ["первый укус", ev.bite1],
  ["второй укус", ev.bite2],
  ["конец жевания (рот пуст)", ev.chewEnd],
];
for (const [what, f] of evRows) if (Number.isFinite(f)) p(`| ${what} | ${tf(f)} (кадр ${f}) |`);
p("");

// ---------- класс ----------
p("## Класс", "");
p("25 учеников (yusuf, amir, bilal + bg01…bg22) и учитель Мухаммад отдельно. bgNN — ученик серии pupilNN.", "");
p("| ID | Ученик серии | Имя | Возраст | Место | x | Салфетка | Получил |", "| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const c of CAST) {
  const e = ch.log.events.find((x) => x.recipient === c.castId);
  const place = c.seat.row === "table" ? "за столиком" : `ряд ${c.seat.row}`;
  const got = e ? `${tf(e.release)} от ${WHO(e.giver)}` : "—";
  p(`| ${c.castId} | ${c.id} | ${c.name ?? "—"} | ${c.age} | ${place} | ${Math.round(c.seat.x)} | ${e ? e.napkin : "—"} | ${got} |`);
}
p("");

// ---------- журнал салфеток ----------
p("## Журнал салфеток", "");
p(
  "25 чистых салфеток на подносе. Билал раздаёт bg01–bg22 и Амиру (23), затем кладёт салфетку Юсуфу (24);",
  "на подносе остаётся одна — Юсуф берёт её и отдаёт Билалу (25). Состояния: поднос → в руке дающего →",
  "совместное касание → в руке получателя → лежит.",
  "",
);
p("| Салфетка | Дал | Получил | Взята с подноса | Касание | Отпущена | Лежит |", "| --- | --- | --- | --- | --- | --- | --- |");
for (const e of ch.log.events) p(`| ${e.napkin} | ${WHO(e.giver)} | ${WHO(e.recipient)} | ${tf(e.take)} | ${tf(e.contact)} | ${tf(e.release)} | ${tf(e.settle)} |`);
p("");
const problems = checkNapkinLog(ch.log, { roster: CAST.map((c) => c.castId), duration: tl.durationInFrames });
const at = (sec) => Math.round(sec * FPS) - 1;
p("| Сцена | Получили в сцене | Выдано к концу сцены | В руках при передаче | На подносе |", "| --- | --- | --- | --- | --- |");
p(`| начало | — | ${givenCountAt(ch.log, 0)} | 0 | ${trayCountAt(ch.log, 0)} |`);
for (const sc of L80_SCENES) {
  const sp = tl.scenes.find((x) => x.id === sc.id);
  const f0 = Math.round(sp.from * FPS);
  const f1 = sc.id === "s8" ? tl.durationInFrames - 1 : at(sp.to);
  const got = ch.log.events.filter((e) => e.release >= f0 && e.release <= f1).map((e) => e.recipient);
  const list = got.length > 3 ? `${got[0]}–${got[got.length - 1].startsWith("bg") ? got[got.length - 1] : got.slice(-2).join(", ")}` : got.join(", ");
  p(`| ${sc.title} | ${got.length ? `${list} (${got.length})` : "—"} | ${givenCountAt(ch.log, f1)} | ${25 - givenCountAt(ch.log, f1) - trayCountAt(ch.log, f1)} | ${trayCountAt(ch.log, f1)} |`);
}
p("");
p(problems.length ? `Проверка журнала: ${problems.join("; ")}` : "Проверка журнала (`checkNapkinLog`): замечаний нет — без повторов, без потерь, одно совместное касание на передачу.");
p("");
writeFileSync(out, md.join("\n"));
console.log(`→ ${out} (${md.length} строк)`);
