// Сценарий и карта источников BM-002 в Markdown — из src/books/ibn-khisham-zhizneopisanie-proroka/script.ts.
// Если есть озвучка, у каждой сцены указан фактический таймкод фильма.
// node scripts/books/ibn-khisham/export-docs.mjs
import { writeFileSync } from "node:fs";
import { FILM, VOICE } from "../../../src/books/ibn-khisham-zhizneopisanie-proroka/script.ts";
import { PART_LABEL } from "../../../src/books/ibn-khisham-zhizneopisanie-proroka/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/ibn-khisham-zhizneopisanie-proroka";
const voiced = !!loadManifest();
const tl = timeline();
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
const VIS = {
  hook: "ночная пустыня; один огонёк становится множеством огней", bookIntro: "книга, цепочка передатчиков, правило фильма", chapter: "титульная карточка главы с орнаментом",
  landscape: "пейзаж (город, Кааба/пальмы, караван)", zamzam: "колодец в пустыне, вода для всех", elephant: "слон опускается на колени, стаи птиц", nomads: "шатры кочевников, верблюдица, овцы",
  cards: "анимированные карточки с иконками", blackStone: "Кааба; камень на ткани поднимается за четыре края", cave: "гора и пещера ночью, свет и слово", quote: "свиток с цитатой и страницей",
  sunMoon: "солнце и луна по сторонам, слово остаётся", bigWord: "раскалённая пустыня и крупное слово", map: "анимированная карта (маршруты)", boycott: "свиток на стене, съеденный червями",
  garden: "виноградник у стен ат-Таифа", isra: "ночное небо, светлый путь Мекка → Иерусалим", aqaba: "ночное ущелье, 75 огоньков", nightRoom: "ночная комната: постель под зелёным плащом",
  horse: "конь увязает в песке, охранное письмо", mosque: "строительство мечети: стволы пальм, кирпичи", bonds: "фонари-пары, связанные золотыми нитями", document: "договор пишется строка за строкой",
  adhan: "рассвет, звук азана волнами", qibla: "стрелка направления: Иерусалим → Кааба", numbers: "инфографика: числа войск", necklace: "ожерелье Хадиджи", uhud: "схема Ухуда: холм лучников, удар конницы",
  trench: "схема рва вокруг Медины", kneel: "верблюдица опускается на колени; тень слона", pledgeTree: "дерево клятвы", growth: "1400 → 10 000 точками", fires: "ночные костры у Мекки, три безопасных места",
  kaabaIdols: "идолы падают вокруг Каабы", arafat: "долина Арафат, шатры, множество огоньков", curtain: "занавес, свет утренней молитвы", lamp: "ночной фонарь, полумесяц, слова", recap: "итоговые уроки", finale: "финал: книга и знак BanaMind",
};

let md = `# BM-002 — сценарий фильма «${FILM.title}»\n\n`;
md += `**Книга:** ${FILM.book}. **Канал:** BanaMind. **Ведущий:** банан (\`src/banana-host/\`), голос ${VOICE.name}.\n\n`;
md += `**Формат:** 1920×1080, 16:9, 30 fps. Объём речи: ${words} слов, ${tl.lines.length} реплик, ${SCENES.length} сцен. `;
md += voiced ? `Длительность по фактической озвучке: **${fmt(tl.duration)}** (естественная ${fmt(tl.natural)}).\n\n` : `Озвучки ещё нет — таймкоды оценочные (${fmt(tl.duration)}).\n\n`;
md += `**Правила:** только содержание книги (страницы указаны у каждой сцены, подробности — SOURCE_MAP.md); слова Пророка — только в цитате/пересказе нейтральным голосом ведущего; ни одного изображения Пророка, других пророков, ангелов, их силуэтов или «заменителей» — в иллюстрациях вообще нет людей. Без таймеров в кадре.\n\n`;
let part = "";
for (const [i, sc] of SCENES.entries()) {
  const ts = tl.scenes[i];
  if (sc.part !== part) {
    part = sc.part;
    md += `\n## ${PART_LABEL[part]}\n\n`;
  }
  md += `### ${voiced ? fmt(ts.lines[0].speechFrom) + " · " : ""}${sc.id} — ${sc.title}\n`;
  md += `*Источник: ${sc.src.join(", ")}. Кадр: ${VIS[sc.visual.kind] ?? sc.visual.kind}; ведущий — ${sc.host}.*\n\n`;
  for (const l of sc.lines) md += `- ${l.wait ? "❓ " : ""}${l.text}\n`;
  md += "\n";
}
writeFileSync(`${DIR}/SCRIPT.md`, md);

let sm = `# BM-002 — карта источников (SOURCE_MAP)\n\n`;
sm += `Источник: ${FILM.book}; извлечённый текст 656 стр. в \`books/500-series/tasks/BM-002/source-text/part-001…032.txt\` (метки \`<PARSED TEXT FOR PAGE: N / 656>\`; номер печатной страницы = номеру страницы PDF). `;
sm += `Цитаты в «кавычках» сверены с текстом скриптом нормализованного поиска; сокращения обозначены многоточием. Оговорки книги («рассказывают», «по другой версии», «Аллах знает») сохранены в речи.\n\n`;
sm += `| Таймкод | Сцена | Страницы | Что взято из книги |\n|---|---|---|---|\n`;
for (const [i, sc] of SCENES.entries()) {
  const ts = tl.scenes[i];
  sm += `| ${voiced ? fmt(ts.lines[0].speechFrom) : "—"} | ${sc.id} ${sc.title} | ${sc.src.join("; ")} | ${(sc.srcNote ?? "титульная карточка главы").replace(/\|/g, "/")} |\n`;
}
writeFileSync(`${DIR}/SOURCE_MAP.md`, sm);
console.log(`✓ ${DIR}/SCRIPT.md, SOURCE_MAP.md (${voiced ? "по озвучке" : "оценка"}; ${fmt(tl.duration)})`);
