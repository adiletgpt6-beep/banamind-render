// Документы фильма BM-040 из данных сценария (src/books/spqr-history-ancient-rome-beard/film/script.ts)
// и тайм-лайна озвучки (если она уже есть):
//   books/spqr-history-ancient-rome-beard/scripts/SOURCE_MAP.md — каждая сцена → файл, строка файла и
//     строка оригинала; что говорит источник и что — наш способ объяснения;
//   …/SCRIPT.md — полный текст ведущего по сценам (с таймкодами, если есть озвучка);
//   …/STORYBOARD.md — что в кадре в каждой сцене, место банана, метка утверждения, зона титров;
//   …/VOICE_CUE_SHEET.md — реплики для озвучки: поза, эмоция, произношение.
// Подробные карты частей (якоря чтения) лежат рядом: scripts/source-map/part-NN.md.
// Запуск: node scripts/lesson-spqr/docs.mjs
import { writeFileSync } from "node:fs";
import { LESSON, VOICE } from "../../src/books/spqr-history-ancient-rome-beard/film/script.ts";
import { ROOMS } from "../../src/books/spqr-history-ancient-rome-beard/film/rooms.ts";
import { original, parseRef } from "./sources.mjs";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/spqr-history-ancient-rome-beard/scripts";
const m = loadManifest();
const voiced = m?.lines?.length > 0;
const tl = timeline();
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const when = (i) => (voiced ? mmss(tl.scenes[i].from) : `≈${mmss(tl.scenes[i].from)}`);
const HOST = {
  center: "банан в центре",
  close: "банан крупно",
  left: "банан слева, схема справа",
  right: "банан справа, схема слева",
  corner: "банан маленький в левом углу",
  off: "банан за кадром (полноэкранная схема)",
  peek: "банан крупно из-за правого края",
};
const CLAIM = { legend: "Легенда · римская память", ancient: "Античный голос · не камера", find: "Находка · документ", author: "Вывод историка", model: "Наша схема · условно", film: "Вывод BanaMind" };
const ref = (r) => (parseRef(r) ? `${r} (ориг. L${original(r)})` : r);
const flat = (a) => (Array.isArray(a) ? a.map((x) => (Array.isArray(x) ? x[0] : x)).filter((x) => typeof x === "string").join(" · ").replace(/\n/g, " ") : "");
const VIS = {
  speech: (p) => `трибуна, условный оратор, толпа фигур; пузыри реплик: ${flat(p.bubbles)}`,
  gate: (p) => `ворота собираются из точек; надпись над аркой меняется: ${flat(p.sign)}; фигуры внутри/снаружи${p.joinBeat !== undefined ? ", часть фигур проходит внутрь" : ""}${p.openBeat !== undefined ? "; створки раскрываются" : ""}`,
  workshop: (p) => `стол мастерской: запись о происхождении, решение собрания, знак службы, документ гражданства${typeof p.focus === "number" ? `; крупно предмет №${p.focus + 1}` : ""}${p.labels ? ` (подписи: ${flat(p.labels)})` : ""}`,
  status: (p) => `карточка утверждения «${String(p.text).replace(/\n/g, " ")}»; штамп статуса меняется: ${flat(p.stamps)}${p.notes ? `; пояснения: ${flat(p.notes)}` : ""}`,
  era: (p) => `лента эпох (подписи дат, не таймер; без нулевого года): ${(p.marks ?? []).map((x) => `${x[0]} — ${x[1] < 0 ? `${-x[1]} г. до н. э.` : `${x[1]} г. н. э.`}`).join("; ")}${p.note ? `; ярлык «${p.note}»` : ""}`,
  map: (p) => `условная векторная карта «${p.map}» (${p.era}); точки: ${flat(p.points)}${p.links?.length ? `; связи от центра: ${flat(p.links)}` : ""}; пометка «упрощённая схема, не точная граница»`,
  rings: (p) => `круги принадлежности: ${flat(p.rings)}${p.moves?.length ? "; точки-люди переходят во внутренний круг" : ""}${p.note ? `; ярлык «${p.note}»` : ""}`,
  matrix: (p) => `таблица «${p.title}»: столбцы ${flat(p.cols)}; строки ${flat(p.rows)}; ✓ / ✗ / ◐ / ?${p.legend ? ` (${p.legend})` : ""}`,
  power: (p) => `фронтон со словами «${flat(p.words)}»; колонны ${flat(p.blocks)} меняют высоту — вывеска та же, устройство другое`,
  letters: (p) => `два стола: «${p.left}» и «${p.right}»; письма летят: ${flat(p.letters)}`,
  lives: (p) => `карточки свидетельств: ${flat(p.cards)}${p.unknown ? `; пунктирные «белые пятна»: ${flat(p.unknown)}` : ""}`,
  quote: (p) => `плашка «${p.num}»; карточка проверенной цитаты «${flat(p.quote)}» («${p.ref}»)${p.note ? `; ярлык «${p.note}»` : ""}`,
  dots: (p) => `силуэт «${p.shape}»${p.morphTo ? ` → «${p.morphTo}»` : ""} собирается из чётких точек; плашка «${p.title ?? ""}»; ярлыки: ${flat(p.labels)}`,
  compare: (p) => `две колонки «${p.leftTitle}» (${flat(p.left)}) и «${p.rightTitle}» (${flat(p.right)})`,
  limits: (p) => `плашка «${p.title}»; зачёркиваются: ${flat(p.no)}; ярлык с галочкой «${p.yes}»`,
  steps: (p) => `плашка «${p.title ?? ""}»; пункты по репликам: ${flat(p.items)}`,
  finale: (p) => `ворота из точек, знак BanaMind и слоган; плашка «${p.caption ?? ""}»`,
  bigQuestion: (p) => `карточка вопроса «${flat(p.lines)}»`,
};
const lines = SCENES.reduce((a, s) => a + s.lines.length, 0);
const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
const status = voiced ? `Время — по фактической озвучке (${(tl.duration / 60).toFixed(2)} мин).` : `Озвучки ещё нет: время сцен — черновая оценка по тексту (≈${(tl.duration / 60).toFixed(1)} мин); после озвучки документы пересобираются той же командой.`;

// ── SOURCE_MAP.md ──
const sm = [
  `# BM-040 · SOURCE_MAP — сцены фильма → источник`,
  ``,
  `Источник: присланное русское издание (внутренний учёт: Мэри Бирд, «SPQR. История Древнего Рима», 2015/2017), \`books/500-series/sources/BM-040/part-01…42.txt\` (57/57 SHA-256 OK) и изображения \`reference/\` (_1–_5 карты, _122–_130 хронология). Ссылка \`p05 L17\` = файл \`part-05.txt\`, строка этого файла; в скобках — строка исходного TXT (по \`line-index.csv\`). \`png _126\` — изображение. «метафора» — образ фильма.`,
  ``,
  `Подробные карты чтения всех 42 частей (якоря с типом: ЛЕГЕНДА / АНТИЧНЫЙ ГОЛОС / АРХЕОЛОГИЯ-ДОКУМЕНТ / АВТОР / ФАКТ, побайтно сверенные короткие цитаты, даты, чувствительные места, странности копии): ${Array.from({ length: 42 }, (_, i) => `[p${String(i + 1).padStart(2, "0")}](source-map/part-${String(i + 1).padStart(2, "0")}.md)`).join(" · ")}.`,
  ``,
  `**Правило различения.** Колонка «Что говорит источник» — изложение книги: её фактов, её вывода (*вывод историка*) или голоса античного автора внутри книги (*античный голос — не нейтральная камера*). Колонка «Наш способ объяснения» — рамка фильма: ворота, стол, штампы статуса, таблицы и карты-схемы. Рамка «Мастерская городских ворот» — наш образ, не римский артефакт и не новая находка. Метка в кадре (правый верх): ${Object.values(CLAIM).join(" / ")}. Цитаты в «ёлочках» дословно сверены тестом \`scripts/lesson-spqr/quotes.mjs\`.`,
  ``,
  `${status}`,
  ``,
  `| Сцена | Время | Часть | Метка | Опоры (файл строка → ориг.) | Что говорит источник | Наш способ объяснения |`,
  `|---|---|---|---|---|---|---|`,
  ...SCENES.map((s, i) => `| ${s.id} ${s.title} | ${when(i)} | ${ROOMS[s.part]} | ${CLAIM[s.claim ?? "author"]} | ${s.src.map(ref).join("; ")} | ${s.book ?? "—"} | ${s.analysis ?? "—"} |`),
  ``,
];
writeFileSync(`${DIR}/SOURCE_MAP.md`, sm.join("\n"));

// ── SCRIPT.md ──
const sc = [
  `# BM-040 · SCRIPT — «${LESSON.title}»`,
  ``,
  `Собственный текст ведущего (банан BanaMind, обращение к зрителю на «вы»). ${SCENES.length} сцен, ${lines} реплик, ≈${words} слов; вопросы для размышления — с паузой без таймера. ${status} Произношение для синтеза (числа словами, ударения) — в VOICE_CUE_SHEET.md; на экране и в титрах — обычный текст.`,
  ``,
  `Рамка: **кризис и право говорить от имени народа → легенда о начале и пределы знания → включение и конфликт → завоевания и их цена → единоличная власть при старых словах → жизнь вне элиты → провинции и гражданство 212 года → снова у ворот: принадлежность ≠ власть.**`,
];
let lastPart = "";
SCENES.forEach((s, i) => {
  if (s.part !== lastPart) {
    sc.push(``, `## ${ROOMS[s.part]}`);
    lastPart = s.part;
  }
  sc.push(``, `### ${when(i)} · ${s.id} · ${s.title}`, ``);
  for (const l of s.lines) sc.push(`- ${l.wait ? "**[вопрос, пауза]** " : ""}${l.text}`);
  sc.push(``, `> Опоры: ${s.src.join("; ")}${s.book ? `  \n> Источник: ${s.book}` : ""}${s.analysis ? `  \n> Фильм: ${s.analysis}` : ""}`);
});
writeFileSync(`${DIR}/SCRIPT.md`, sc.join("\n") + "\n");

// ── STORYBOARD.md ──
const SUBS = { left: "титры сдвинуты вправо от банана", right: "титры сдвинуты влево от банана", corner: "титры по центру, правее угла с бананом", off: "титры по центру низа", center: "титры по центру низа", close: "титры по центру низа", peek: "титры левее" };
const sb = [
  `# BM-040 · STORYBOARD`,
  ``,
  `Кадр 1920×1080, 30 fps; всегда светлый фон части; вверху слева — BanaMind и вопрос части (без номеров и таймеров), справа — метка типа утверждения. Анимированные титры BanaMind (≤ 2 строк) внизу: зона 860–1040 px свободна от важных подписей схем; карточка вопроса заменяет титр во время паузы. Смена плана — каждая сцена (в среднем ≈ 30 с) плюс появления элементов на каждой реплике (каждые 5–12 с). Точечные образы собираются из чётких точек без bloom и ряби; цвета групп людей меняются по сценам — ни один цвет не закреплён за «плохой» группой. ${status}`,
  ``,
  `| Сцена | Время | Банан | Что в кадре | Метка | Зона титров |`,
  `|---|---|---|---|---|---|`,
  ...SCENES.map((s, i) => `| ${s.id} ${s.title} | ${when(i)} | ${HOST[s.host]} | ${(VIS[s.visual.kind] ?? (() => s.visual.kind))(s.visual)} | ${CLAIM[s.claim ?? "author"]} | ${SUBS[s.host] ?? "низ"} |`),
  ``,
];
writeFileSync(`${DIR}/STORYBOARD.md`, sb.join("\n"));

// ── VOICE_CUE_SHEET.md ──
const vc = [
  `# BM-040 · VOICE_CUE_SHEET`,
  ``,
  `Голос: ${VOICE.name}; модель \`${VOICE.modelId}\`, seed ${VOICE.seed}, speed ${VOICE.settings.speed} (речь не ускоряется — длительность фильма задают озвучка и паузы). Холодный старт — тот же голос, чуть живее. Поза/эмоция — для анимации банана.`,
  ``,
  `| Реплика | Поза | Эмоция | Текст | Для синтеза (если отличается) |`,
  `|---|---|---|---|---|`,
  ...SCENES.flatMap((s) => s.lines.map((l) => `| ${l.id}${l.wait ? " (вопрос)" : ""}${l.expr ? " (живее)" : ""} | ${l.pose ?? "idle"} | ${l.mood ?? "happy"} | ${l.text} | ${l.say ?? ""} |`)),
  ``,
];
writeFileSync(`${DIR}/VOICE_CUE_SHEET.md`, vc.join("\n"));
console.log(`✓ SOURCE_MAP, SCRIPT, STORYBOARD, VOICE_CUE_SHEET → ${DIR} (${SCENES.length} сцен, ${lines} реплик, ${words} слов)`);
