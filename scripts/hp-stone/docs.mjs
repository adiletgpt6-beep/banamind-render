// Документы фильма BM-031 из данных сценария (src/books/harry-potter-philosophers-stone/film/script.ts):
//   books/harry-potter-philosophers-stone/scripts/SOURCE_MAP.md — сцены фильма → строки книги,
//   SCRIPT.md — полный текст озвучки по сценам (с таймкодами по озвучке, если она есть),
//   STORYBOARD.md — раскадровка: место банана, визуал сцены, переходы.
// Запуск: node scripts/hp-stone/docs.mjs
import { writeFileSync } from "node:fs";
import { LESSON, VOICE } from "../../src/books/harry-potter-philosophers-stone/film/script.ts";
import { SECTIONS } from "../../src/books/harry-potter-philosophers-stone/film/theme.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/harry-potter-philosophers-stone/scripts";
const m = loadManifest();
const voiced = (m?.lines?.length ?? 0) >= SCENES.flatMap((s) => s.lines).length;
const tl = timeline();
const tc = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const HOST = { center: "по центру", close: "крупно", left: "слева", right: "справа", corner: "в углу", off: "за кадром", peek: "выглядывает" };

const VIS = {
  labels: (p) => `фишка «${p.name}»${p.house ? " (домик из точек)" : ""}; ярлыки прилипают: ${p.labels.map((l) => `«${l}»`).join(", ")}${p.peel !== undefined ? "; первый ярлык отклеивается и падает" : ""}`,
  compass: (p) => `компас «Мастерской решений», режим ${p.mode}${p.dir ? `, стрелка → ${p.dir}` : ""}`,
  bookIntro: () => "условный том с названием текстом (не издательская обложка) + плашки: автор, первый роман, разбор, спойлеры",
  chapters: (p) => (p.roadmap ? "дорожка 17 глав, группы-развилки подписываются по очереди" : "дорожка из 17 глав, плашка о переводе"),
  partTitle: (p) => `заставка «Часть ${p.n} · ${p.text}» (${p.sub}); компас поворачивается к стороне «${p.dir}», образ участка собирается из точек`,
  house: (p) => ({ normal: "домик из точек, табличка «Всё нормально», глаза соседей, «тайна»", cupboard: "разрез дома: лестница и жёлтая дверца чулана, вопросы зачёркиваются", return: "домик, фишка Гарри и нити к друзьям: «тот же дом — другой мальчик»" })[p.mode],
  letters: () => "крупный конверт с адресом чулана; затем поток конвертов облетает дом, щель заколачивается",
  card: (p) => `карточка «Книга · ${p.ch}: ${p.title}» (${p.lines.join(" / ")})${p.note ? `; плашка «Наш анализ: ${p.note}»` : ""}`,
  scale: (p) => `весы: «${p.left}» ↔ «${p.right}»${p.tiltTo ? `, перевешивает ${p.tiltTo === "right" ? "правая" : "левая"}` : ", колеблются"}`,
  tokens: (p) => `фишки ${p.items.map((i) => `«${i.name}»`).join(", ")}${p.crowd ? " в толпе" : ""}; облачка: ${p.beats.map((b) => `«${b.text}»`).join(", ")}${p.link ? "; нить и сердце" : ""}${p.cross ? "; красный крест между фишками" : ""}`,
  board: (p) => `пробковая доска улик (${p.mode}): ${p.clues.map((c) => `«${c.text}»`).join(", ")}`,
  mirror: (p) => `овальная рамка зеркала (своя), отражение из точек — ${p.mode}`,
  gifts: () => "четыре коробки открываются: монетка, флейта, свитер, плащ отца; сердце из точек",
  chain: (p) => `домино решений: ${p.items.join(" → ")}`,
  trio: () => "три фишки и значки из точек: книга (знание и логика), пешка (партия и жертва), ключ (шаг дальше)",
  fear: (p) => `лестница страха (${p.steps.join(" → ")}), фишка поднимается в облаке фиолетовых точек`,
  points: () => "счёт баллов столбиками точек (нейтральные цвета): +50, +50, +60, затем +10 Невиллу",
  finale: (p) => `компас и три карточки выводов: ${p.theses.map((t) => `«${t}»`).join(", ")}`,
  outro: () => "компас и знак BanaMind, слоган",
  phrase: (p) => `фраза «${p.text}» рассыпается точками в форму «${p.shape}»${p.label ? ` + подпись «${p.label}»` : ""}${p.second ? `; вторая: «${p.second.text}» → ${p.second.shape}` : ""}`,
  compare: (p) => `сравнение «${p.lTitle}» / «${p.rTitle}»`,
  dotsQ: (p) => `знак вопроса из точек${p.text ? `, надпись «${p.text}»` : ""}; карточка вопроса на время паузы`,
};

// ── SOURCE_MAP ──
let sm = `# BM-031 · SOURCE_MAP — «Гарри Поттер и философский камень» (Дж. К. Роулинг)\n\n`;
sm += `Источник: только \`books/500-series/sources/BM-031/part-01.txt … part-25.txt\` (25 файлов, 820 138 байт, 6 021 строка; \`sha256sum -c source-checksums.sha256\` — 25/25 OK). Ссылка \`part-NN:a–b\` — строки файла (исходная строка TXT = начало части − 1 + строка, см. manifest.json).\n\n`;
sm += `Все 25 частей прочитаны полностью. Подробные карты с конспектом всех 17 глав, опорами по темам, написанием имён и спорными местами — [source-map/](source-map/).\n\n`;
sm += `**Как читать.** «Книга» — что происходит в романе (наш пересказ). «Анализ» — вывод или метафора фильма, не утверждение автора. Озвучка проверена тестом: нет совпадений с переводом из 7+ слов подряд.\n\n| Сцена | Тема | Строки книги | Что взято из книги / анализ |\n|---|---|---|---|\n`;
for (const s of SCENES) sm += `| ${s.id} | ${s.title} | ${s.src.join(", ")} | ${(s.book ?? "").replace(/\|/g, "/")}${s.analysis ? ` *Анализ:* ${s.analysis}` : ""} |\n`;
writeFileSync(`${DIR}/SOURCE_MAP.md`, sm);

// ── SCRIPT ──
let sc = `# BM-031 · SCRIPT — ${LESSON.title}\n\n${LESSON.book}\n\nГолос: ${VOICE.name}. Таймкоды ${voiced ? "по фактической озвучке" : "оценочные (озвучка ещё не полная)"}; длительность ${tc(tl.duration)}.\n\n`;
let lastPart = "";
SCENES.forEach((s, i) => {
  if (s.part !== lastPart) {
    sc += `\n## ${SECTIONS[s.part].title}\n\n`;
    lastPart = s.part;
  }
  sc += `**${s.id} · ${s.title}** — ${tc(tl.scenes[i].from)} · опора: ${s.src.join(", ")}\n\n`;
  for (const l of s.lines) sc += `- \`${l.id}\` ${l.text}${l.wait ? " *(пауза-вопрос)*" : ""}\n`;
  sc += "\n";
});
writeFileSync(`${DIR}/SCRIPT.md`, sc);

// ── STORYBOARD ──
let sb = `# BM-031 · STORYBOARD\n\nФормат 1920×1080, 30 fps. Ведущий — банан из \`src/banana-host/\`. Сквозная метафора — «Мастерская решений» с компасом (\`visuals/common.tsx\`). Персонажи романа — только фишки с именами (точечный силуэт без примет). Точки — чёткие векторные круги на шестиугольной сетке (\`visuals/dots.tsx\`, формы \`visuals/shapes.ts\`). Переходы: сцены въезжают снизу с лёгким масштабом, во вступлении — «шторкой»; фон плавно меняет цвет на смене участка. Таймеров и отсчётов нет. Титры — \`BanaMindAnimatedCaptions\` по таймингам слов озвучки.\n\n| Сцена | Время | Банан | Визуал | Участок |\n|---|---|---|---|---|\n`;
SCENES.forEach((s, i) => {
  const f = VIS[s.visual.kind];
  sb += `| ${s.id} | ${tc(tl.scenes[i].from)} | ${HOST[s.host]} | ${(f ? f(s.visual) : s.visual.kind).replace(/\|/g, "/")} | ${SECTIONS[s.part].title} |\n`;
});
writeFileSync(`${DIR}/STORYBOARD.md`, sb);
console.log(`✓ SOURCE_MAP, SCRIPT, STORYBOARD → ${DIR} (${SCENES.length} сцен, ${tc(tl.duration)})`);
