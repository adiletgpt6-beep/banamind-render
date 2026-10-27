// Полный сценарий фильма BM-005 для чтения — из данных сценария и тайм-лайна озвучки:
// сцены с таймкодами фильма, речь банана, действия в кадре, вопросы-паузы и
// источник каждой сцены (страницы PDF приложенного TXT).
// Запуск: node scripts/lesson-greene/export-docs.mjs [books/robert-greene-48-laws-of-power/SCRIPT.md]
import { writeFileSync } from "node:fs";
import { LESSON, VOICE } from "../../src/lesson-greene/script.ts";
import { SCENES, loadManifest, timeline } from "./lib.mjs";

const OUT = process.argv[2] ?? "books/robert-greene-48-laws-of-power/SCRIPT.md";
const tl = timeline();
const voiced = Boolean(loadManifest()?.lines?.length);
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const PART = { intro: "Начало", power: "Часть 1. Игра власти", words: "Часть 2. Слова и репутация", people: "Часть 3. Люди и ловушки", strategy: "Часть 4. Стратегия", flex: "Часть 5. Защита, границы и цена успеха", end: "Итоги" };
const HOST = { peek: "банан крупно из-за края кадра", center: "банан в центре", close: "банан крупно", left: "банан слева, схема справа", right: "банан справа, схема слева", corner: "банан в углу, схема на весь кадр", off: "банан за кадром" };
const POSE_RU = { shock: "изумлён, подпрыгивает", idle: "стоит", wave: "машет", hello: "машет двумя руками", point: "показывает на схему", pointLeft: "показывает влево", pointUp: "поднимает палец", think: "задумался", open: "разводит руками", present: "показывает ладонью", presentLeft: "показывает ладонью", shrug: "пожимает плечами", cheer: "радуется", hush: "спокойно, руки у груди", count: "считает на пальцах", ask: "спрашивает", heart: "руки у сердца" };
const MOOD_RU = { shock: "изумлён", happy: "улыбается", calm: "спокойно", wonder: "удивлён", think: "думает", confused: "озадачен", serious: "серьёзно", joy: "радость", lookBoard: "смотрит на схему" };

const sc = [];
sc.push(`# ${LESSON.title}`, "");
sc.push(`**BanaMind · BM-005.** Оригинальное анимационное объяснение книги ${LESSON.book}. Ведущий — банан BanaMind, обращение к зрителю на «вы»; аудитория — подростки и взрослые.`, "");
sc.push(voiced ? `Длительность по озвучке: **${mmss(tl.duration)}** (речь без растяжки пауз — ${mmss(tl.natural)}). Голос: ${VOICE.name}, темп ${VOICE.settings.speed}.` : `Черновые таймкоды (до озвучки, оценка по тексту): ${mmss(tl.duration)}.`);
sc.push("Формат: 1920×1080, 16:9, 30 fps, H.264/AAC. Без музыки, без таймеров в кадре. Титры — BanaMindAnimatedCaptions + SRT.", "");
sc.push("Источник содержания — только приложенный TXT русского издания (маркеры «СТРАНИЦА PDF N / 390»; повреждённые PDF 137–151 не использованы). Текст написан своими словами; дословно — лишь короткие реплики персонажей книги, копий страниц нет. Подробности — `SOURCE_MAP.md`, отбор идей — `BRIEF.md`.", "");
let words = 0;
let qn = 0;
let part = "";
tl.scenes.forEach((ts, i) => {
  const s = SCENES[i];
  if (s.part !== part) {
    part = s.part;
    sc.push(`## ${PART[part]}`, "");
  }
  sc.push(`### ${mmss(ts.from)} · Сцена ${i + 1}. ${s.title}`, "");
  sc.push(`*Кадр:* ${HOST[s.host]} · *схема:* \`${s.visual.kind}\` · *источник:* ${s.src.join("; ")}`, "");
  if (s.srcNote) sc.push(`> ${s.srcNote}`, "");
  ts.lines.forEach((ln, j) => {
    const l = s.lines[j];
    words += l.text.split(/\s+/).length;
    const act = [POSE_RU[l.pose], MOOD_RU[l.mood]].filter(Boolean).join(", ");
    sc.push(`- **${mmss(ln.speechFrom)}** ${l.text}${act ? `  _(банан: ${act})_` : ""}`);
    if (ln.waitFrom !== undefined) {
      qn++;
      sc.push(`- **${mmss(ln.waitFrom)}** ⏸ *Вопрос ${qn}: пауза ${l.wait} с на размышление; на экране — карточка с вопросом (без таймера).*`);
    }
  });
  sc.push("");
});
sc.push("---", "", `Всего сцен: ${tl.scenes.length}, реплик: ${tl.lines.length}, слов: ${words}, вопросов для размышления: ${qn}.`, "");
sc.push("Права: книга и перевод охраняются авторским правом. Фильм — самостоятельное образовательное объяснение для внутреннего производства; публичная/коммерческая публикация — только после проверки прав владельцем канала.", "");
writeFileSync(OUT, sc.join("\n"));
console.log(`✓ ${OUT} (${words} слов, ${qn} вопросов, ${mmss(tl.duration)})`);
