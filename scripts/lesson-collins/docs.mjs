// Документы фильма BM-037 из данных сценария (src/lesson-collins/script.ts) и тайм-лайна озвучки:
//   books/good-to-great-collins/scripts/SOURCE_MAP.md — сцены → строки книги (+ указатель карт source-map/);
//   …/SCRIPT.md — полный текст ведущего по сценам с таймкодами, «книга говорит» / «анализ фильма»;
//   …/STORYBOARD.md — что в кадре в каждой сцене, место банана;
//   books/good-to-great-collins/video/voice-words.json — фактические таймкоды слов всех реплик.
// Запуск: node scripts/lesson-collins/docs.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { LESSON, VOICE } from "../../src/lesson-collins/script.ts";
import { SECTIONS } from "../../src/lesson-collins/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/good-to-great-collins/scripts";
const m = loadManifest();
const tl = timeline();
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const HOST = { center: "банан в центре", close: "банан крупно", left: "банан слева, схема справа", right: "банан справа, схема слева", corner: "банан маленький в левом углу, схема на весь кадр", off: "банан за кадром", peek: "банан из-за правого края" };
const vis = (v) => {
  const p = Object.entries(v).filter(([k]) => k !== "kind" && k !== "enter").map(([k, x]) => `${k}: ${JSON.stringify(x)}`).join("; ");
  return `**${v.kind}** — ${p}`.replace(/\|/g, "/");
};
const esc = (s) => (s ?? "—").replace(/\|/g, "/").replace(/\n/g, " ");

// SOURCE_MAP
let sm = `# BM-037 · SOURCE_MAP — Джим Коллинз, «От хорошего к великому»

Источник: только \`books/500-series/sources/BM-037/part-01.txt … part-25.txt\` и 68 рисунков \`figures/\` (\`sha256sum -c source-checksums.sha256\` — 93/93 OK; SHA-256 конкатенации TXT \`7580ae6b…5e47810\`). Ссылки \`part-NN:a–b\` — локальные строки части; исходная строка = source_start_line + L − 1 (manifest.json). \`fig:имя.jpg=…\` — значения, напечатанные только на рисунке.

**Полное чтение.** Все 25 частей прочитаны построчно, все 68 JPG открыты. Подробные карты (структура, все факты с типом «данные/вывод/цитата/примечание», расшифровка рисунков с осями и периодами, опечатки, решение по каждому разделу):

- [01 · part-01…03 — обращение, предисловия, гл. 1, гл. 2 (начало)](source-map/01-parts-01-03.md)
- [02 · part-04…07 — гл. 2 (конец), гл. 3, гл. 4 (Стокдейл)](source-map/02-parts-04-07.md)
- [03 · part-08…11 — гл. 4 (выводы), гл. 5, гл. 6 (начало)](source-map/03-parts-08-11.md)
- [04 · part-12…14 — гл. 6 (конец), гл. 7, гл. 8](source-map/04-parts-12-14.md)
- [05 · part-15…25 — гл. 9, эпилог/FAQ, приложения 1.А–8.В, примечания 1–62](source-map/05-parts-15-25.md)

**Решения по главам.** Гл. 1–8 — основа фильма; гл. 9 («Построенные навечно») прочитана, в фильм не вынесена отдельным блоком (ограничение 30 минут, связь «сохраняйте суть» — вне главного вопроса); FAQ — блоки «Чего это исследование не доказывает» и «За пределами схемы»; приложения 1.А/1.В/1.D — критерии, пары, объём работы; 2.А, 5.А, 8.А, 8.В — проверка утверждений (внешние CEO, отрасли, порочный круг, поглощения). Предисловие Дерманова не используется и Коллинзу не приписывается. Табак (Philip Morris, R.J.R.) в фильме не подаётся как образец.

**Как читать.** «Книга говорит» — данные и выводы автора. «Анализ фильма» — метафоры (мастерские, двигатель, тележки с ускорителем) и оговорки фильма. Каждое число реплики автоматически ищется в указанных строках/рисунках, каждая цитата в «ёлочках» — во всём тексте (\`scripts/lesson-collins/script.test.mjs\`, \`quotes.mjs\`).

## Сцены → строки книги (${SCENES.length} сцен)

| Сцена | Время | Участок | Опора | Книга говорит | Анализ фильма |
|---|---|---|---|---|---|
`;
SCENES.forEach((s, i) => {
  sm += `| ${s.id} ${esc(s.title)} | ${mmss(tl.scenes[i].from)} | ${SECTIONS[s.part].title} | ${s.src.join("; ")} | ${esc(s.book)} | ${esc(s.analysis)} |\n`;
});
writeFileSync(`${DIR}/SOURCE_MAP.md`, sm);

// SCRIPT
let sc = `# BM-037 · SCRIPT — «${LESSON.title}»

Книга: ${LESSON.book}. Ведущий — банан BanaMind. Таймкоды — по фактической озвучке (${m?.engine === "local" ? "локальный движок: Piper ru_RU ruslan + выравнивание слов распознаванием zipformer-ru" : VOICE.name}). Длительность фильма ${mmss(tl.duration)}.
Реплики с числами озвучиваются по тексту произношения \`src/lesson-collins/say.ts\` (титры — с цифрами).

`;
let part = "";
SCENES.forEach((s, i) => {
  if (s.part !== part) {
    part = s.part;
    sc += `\n## ${SECTIONS[s.part].title}\n\n`;
  }
  sc += `### ${mmss(tl.scenes[i].from)} · ${s.id} · ${s.title}\n\n`;
  if (s.book) sc += `> Книга говорит (${s.src.filter((r) => r !== "метафора").join("; ")}): ${s.book}\n\n`;
  if (s.analysis) sc += `> Анализ фильма: ${s.analysis}\n\n`;
  tl.scenes[i].lines.forEach((ln, j) => {
    const L = s.lines[j];
    sc += `- **${mmss(ln.speechFrom)}** \`${ln.id}\`${L.wait ? " _(пауза-вопрос " + L.wait + " с)_" : ""}: ${ln.text}\n`;
  });
  sc += "\n";
});
writeFileSync(`${DIR}/SCRIPT.md`, sc);

// STORYBOARD
let sb = `# BM-037 · STORYBOARD

Фон — светлая инженерная мастерская (чертёжная сетка, медленно вращающиеся шестерни по краям), цвет узла: люди — бирюзовый, ясность — коралловый, последовательность — жёлтый. Подпись участка вверху слева, анимированные титры BanaMind внизу (сдвиг от банана). Таймеров и отсчётов нет.

| Сцена | Время | Банан | Что в кадре |
|---|---|---|---|
`;
SCENES.forEach((s, i) => {
  sb += `| ${s.id} ${esc(s.title)} | ${mmss(tl.scenes[i].from)}–${mmss(tl.scenes[i].to)} | ${HOST[s.host]} | ${vis(s.visual)} |\n`;
});
writeFileSync(`${DIR}/STORYBOARD.md`, sb);

mkdirSync("books/good-to-great-collins/video", { recursive: true });
writeFileSync(
  "books/good-to-great-collins/video/voice-words.json",
  JSON.stringify({ engine: m?.engine, voice: m?.voice, duration: tl.duration, lines: tl.lines.map((l) => ({ id: l.id, from: +l.speechFrom.toFixed(3), to: +l.speechTo.toFixed(3), words: l.words.map((w) => [w.text, +w.start.toFixed(3), +w.end.toFixed(3)]) })) }, null, 0),
);
console.log(`✓ SOURCE_MAP, SCRIPT, STORYBOARD, voice-words.json (${SCENES.length} сцен, ${tl.lines.length} реплик, ${mmss(tl.duration)})`);
