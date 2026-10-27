// Таблица таймингов фильма 80-1-10 по фактической озвучке: сцены, 44 реплики
// (звучание каждой реплики в фильме), четыре зрительские паузы, ключевые
// действия и финальный общий план. Пишет out/lesson-80-1-10-our-common-poster-timing.md
// и …-timing.csv; те же таблицы — в производственной заметке.
//   node scripts/lesson80-1-10-timing.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTimeline, finalHoldSec, pauseFrames } from "../src/lesson80/film-1-10/timeline.ts";
import { buildPlan } from "../src/lesson80/film-1-10/plan.ts";
import { FILM, L80_LINES, L80_SCENES } from "../src/lesson80/film-1-10/script.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "public", FILM.voiceDir, "manifest.json"), "utf8"));
const tl = buildTimeline(manifest);
const pl = buildPlan(tl);
const FPS = FILM.fps;

const ts = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
};
const fr = (sec) => Math.round(sec * FPS);
const ROLE = { muhammad: "Мухаммад", yusuf: "Юсуф", amir: "Амир", bilal: "Билал" };

const md = [];
const csv = [["kind", "id", "role", "scene", "start_s", "end_s", "start_frame", "end_frame", "text"].join(",")];
const q = (s) => `"${String(s).replaceAll('"', '""')}"`;

md.push(`# Тайминги ${FILM.productionId} «${FILM.title}»`, "");
md.push(`Длительность: ${ts(tl.durationSec)} (${tl.durationSec.toFixed(2)} с, ${tl.durationInFrames} кадров, ${FPS} к/с). Озвучка: ${manifest.lines[0]?.provider ?? "?"}.`, "");

md.push("## Сцены", "", "| Сцена | Начало | Конец | Реплики |", "| --- | --- | --- | --- |");
for (const sc of L80_SCENES) {
  const span = tl.scenes.find((s) => s.id === sc.id);
  const ids = L80_LINES.filter((l) => l.scene === sc.id).map((l) => l.id);
  md.push(`| ${sc.title} | ${ts(span.from)} | ${ts(span.to)} | ${ids[0]}–${ids[ids.length - 1]} |`);
  csv.push(["scene", sc.id, "", sc.id, span.from.toFixed(3), span.to.toFixed(3), fr(span.from), fr(span.to), q(sc.title)].join(","));
}

md.push("", "## Реплики (звучание в фильме)", "", "| № | Говорит | Начало | Конец | Текст |", "| --- | --- | --- | --- | --- |");
for (const c of tl.cues) {
  const line = L80_LINES.find((l) => l.id === c.id);
  const snd = tl.sound[c.id];
  const a = snd.start;
  const b = snd.end;
  md.push(`| ${String(c.id).padStart(2, "0")} | ${ROLE[c.role]} | ${ts(a)} | ${ts(b)} | ${line.text} |`);
  csv.push(["line", c.id, c.role, line.scene, a.toFixed(3), b.toFixed(3), fr(a), fr(b), q(line.text)].join(","));
}

md.push("", "## Зрительские паузы (от последнего звука вопроса до первого звука ответа)", "", "| Пауза | После реплики | Начало | Конец | Кадров |", "| --- | --- | --- | --- | --- |");
for (const p of tl.pauses) {
  md.push(`| ${p.id} | ${p.after} | ${ts(p.from)} | ${ts(p.to)} | ${pauseFrames(tl, p.after)} |`);
  csv.push(["pause", p.id, "", "", p.from.toFixed(3), p.to.toFixed(3), fr(p.from), fr(p.to), q(`после реплики ${p.after}`)].join(","));
}

const f2s = (f) => f / FPS;
const ev = [
  ["Лист раскладывают на столике", pl.spread.from],
  ["Карточки раздают (Юсуф, Амир, Билал)", pl.deal.from],
  ["Три рисунка ложатся на лист", pl.lay.from],
  ["Заголовок «Аллах — наш Создатель» пишется", pl.write.start],
  ["Заголовок дописан", pl.write.end],
  ["Ученик передаёт птицу Билалу", pl.birdPass.take],
  ["«Аллах Един» на листе", pl.textOneEv.put],
  ["Ладонь на закрытой папке «Наши вопросы»", pl.folderTouch.touch],
  ["«У Аллаха нет начала» на листе", pl.textTwoEv.put],
  ["Лодочку рисуют на карточке Амира (Юсуф начинает)", pl.boatPencil.yStart],
  ["Подпись «Лодочку сложил Амир»", pl.boatPencil.capStart],
  ["Ряды передают карточки", pl.passStart],
  ["Сетка из 25 карточек готова", pl.lapse.at],
  ["Учитель поднимает плакат", pl.posterLift.grip],
  ["Плакат прижат к доске", pl.hangEv.press],
];
md.push("", "## Ключевые действия", "", "| Действие | Время | Кадр |", "| --- | --- | --- |");
for (const [label, f] of ev) {
  md.push(`| ${label} | ${ts(f2s(f))} | ${f} |`);
  csv.push(["event", "", "", "", f2s(f).toFixed(3), "", f, "", q(label)].join(","));
}
const fin = tl.marks["финал: общий план"];
md.push(`| Финальный общий план | ${ts(fin.from)} | ${fr(fin.from)} |`);
md.push("", `Последнее слово (реплика 44) заканчивается в ${ts(tl.sound[44].end)}; после него общий план держится ${finalHoldSec(tl).toFixed(2)} с.`);

mkdirSync(join(root, "out"), { recursive: true });
writeFileSync(join(root, "out", `${FILM.output}-timing.md`), md.join("\n") + "\n");
writeFileSync(join(root, "out", `${FILM.output}-timing.csv`), csv.join("\n") + "\n");
console.log(md.join("\n"));
