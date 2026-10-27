// Документы фильма BM-009 из данных сценария и тайм-лайна озвучки:
//   books/morgan-housel-psychology-of-money/scripts/SCRIPT.md   — полный сценарий для чтения:
//     сцены, таймкоды (по озвучке; без неё — оценка), реплики, что в кадре, вопросы;
//   books/morgan-housel-psychology-of-money/scripts/SCRIPT.html — то же, для чтения в браузере/телефоне;
//   books/morgan-housel-psychology-of-money/scripts/SOURCE_MAP.md — для каждой сцены главы и строки TXT
//     книги и начало каждой указанной строки (проверяемые якоря). Пишется, только если
//     доступен TXT книги (BOOK_TXT=путь): полный текст книги в репозиторий не кладём.
// Запуск: [BOOK_TXT=/путь/к/книге.txt] node scripts/lesson-money/export-docs.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { LESSON, VOICE } from "../../src/lesson-money/script.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";
import { VIS } from "./vis-desc.mjs";

const DIR = "books/morgan-housel-psychology-of-money/scripts";
const SRC = process.env.BOOK_TXT;
const SHA = "885c854b2f075c3f526090ddc9e59cd6a9e2f3a30c33cdf19cd588306f70d64c";
const tl = timeline();
const voiced = !!loadManifest()?.lines?.length;
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const PART = { intro: "Начало", luck: "Опыт и удача", enough: "Достаточно", time: "Время", freedom: "Свобода", risk: "Запас прочности", mind: "Ловушки ума", end: "Итоги" };
const HOST = { peek: "банан крупно у края кадра", center: "банан в центре", close: "банан крупно", left: "банан слева, схема справа", right: "банан справа, схема слева", corner: "банан в углу, схема на весь кадр", off: "банан за кадром" };
const POSE_RU = { shock: "изумлённо вскидывает руки", idle: "стоит", wave: "машет", hello: "машет двумя руками", point: "показывает на схему", pointLeft: "показывает влево", pointUp: "поднимает палец", think: "задумался", open: "разводит руками", present: "показывает ладонью", presentLeft: "показывает ладонью", shrug: "пожимает плечами", cheer: "радуется, руки вверх", hush: "спокойно, руки у груди", count: "считает", ask: "спрашивает", heart: "руки у сердца" };
const MOOD_RU = { shock: "изумлён", happy: "улыбается", calm: "спокойно", wonder: "удивлён", think: "думает", confused: "озадачен", serious: "серьёзно", joy: "радость", lookBoard: "смотрит на схему" };

// ── сценарий ──
const sc = [];
const html = [];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
sc.push(`# ${LESSON.title}`, "");
sc.push(`**Канал BanaMind · BM-009.** Анимационный разбор книги: ${LESSON.book}. Ведущий — банан, обращение к зрителю на «вы». Язык — русский.`, "");
sc.push(`Длительность: **${mmss(tl.duration)}**${voiced ? ` (по реальной озвучке; речь без растяжки пауз — ${mmss(tl.natural)})` : " (оценка по тексту — до озвучки)"}. Голос: ${VOICE.name}, темп ${VOICE.settings.speed}. Формат: 1920×1080, 16:9, 30 fps, без музыки, таймеров и обратных отсчётов.`, "");
sc.push("Это самостоятельное образовательное объяснение идей книги, а не пересказ и не инвестиционная рекомендация. Источник каждой сцены — главы и строки TXT книги (`SOURCE_MAP.md`). Таймкоды ниже — время в фильме. Цифры — данные книги (издание 2020 года).", "");
html.push(`<h1>${esc(LESSON.title)}</h1>`, `<p class="meta">BanaMind · BM-009 · ${esc(LESSON.book)}<br>Длительность ${mmss(tl.duration)} · 1920×1080 · 30 fps · русская озвучка</p>`, `<p class="note">Образовательный разбор идей книги, не инвестиционная рекомендация. Цифры — данные книги (издание 2020 года).</p>`);
let words = 0;
let qn = 0;
let part = "";
tl.scenes.forEach((ts, i) => {
  const s = SCENES[i];
  if (s.part !== part) {
    part = s.part;
    sc.push(`# ${PART[part]}`, "");
    html.push(`<h2>${esc(PART[part])}</h2>`);
  }
  sc.push(`## ${mmss(ts.from)} · Сцена ${i + 1}. ${s.title}`, "");
  sc.push(`*Кадр:* ${HOST[s.host]}. *Анимация:* ${VIS[s.visual.kind] ?? s.visual.kind}.`, "");
  html.push(`<section><h3><span class="tc">${mmss(ts.from)}</span> Сцена ${i + 1}. ${esc(s.title)}</h3><p class="vis">В кадре: ${esc(VIS[s.visual.kind] ?? s.visual.kind)}.</p>`);
  ts.lines.forEach((ln, j) => {
    const l = s.lines[j];
    words += l.text.split(/\s+/).length;
    const act = [POSE_RU[l.pose], MOOD_RU[l.mood]].filter(Boolean).join(", ");
    sc.push(`- **${mmss(ln.speechFrom)}** ${l.text}${act ? `  _(банан: ${act})_` : ""}`);
    html.push(`<p><span class="tc">${mmss(ln.speechFrom)}</span> ${esc(l.text)}</p>`);
    if (ln.waitFrom !== undefined) {
      qn++;
      sc.push(`- **${mmss(ln.waitFrom)}** ⏸ *Пауза ${l.wait} с: на экране карточка «Вопрос для размышления» (без таймера).*`);
      html.push(`<p class="q">⏸ Пауза для размышления (${l.wait} с)</p>`);
    }
  });
  sc.push("");
  html.push("</section>");
});
sc.push("---", "", `Сцен: ${tl.scenes.length}, реплик: ${tl.lines.length}, слов: ${words}, вопросов для размышления: ${qn}.`, "");
html.push(`<p class="meta">Сцен: ${tl.scenes.length}, реплик: ${tl.lines.length}, слов: ${words}, вопросов: ${qn}.</p>`);
writeFileSync(`${DIR}/SCRIPT.md`, sc.join("\n"));
writeFileSync(
  `${DIR}/SCRIPT.html`,
  `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Сценарий — Психология денег (BanaMind)</title><style>body{font:18px/1.6 Georgia,serif;max-width:860px;margin:auto;padding:24px 16px;background:#fffaf0;color:#1f2a44}h1{font:800 30px/1.2 system-ui,sans-serif}h2{font:800 24px system-ui,sans-serif;margin-top:40px;border-bottom:3px solid #ffd23f}h3{font:700 19px system-ui,sans-serif}.tc{font:700 14px monospace;color:#8a6d00;background:#fff3c4;border-radius:6px;padding:1px 6px;margin-right:6px}.vis{color:#56627a;font-size:15px;font-style:italic}.q{color:#2e7d4f;font-weight:bold}.meta,.note{color:#56627a;font-size:15px}section{margin-bottom:22px}</style></head><body>${html.join("\n")}</body></html>\n`,
);

// ── карта источников ──
if (!SRC || !existsSync(SRC)) {
  console.log(`✓ ${DIR}/SCRIPT.md + SCRIPT.html (${words} слов, ${qn} вопросов, ${mmss(tl.duration)}${voiced ? "" : ", оценка"}); SOURCE_MAP пропущен — нет BOOK_TXT`);
  process.exit(0);
}
const raw = readFileSync(SRC);
if (createHash("sha256").update(raw).digest("hex") !== SHA) throw new Error("BOOK_TXT: SHA-256 не совпадает с TXT владельца");
const book = raw.toString("utf8").split("\n");
const anchor = (n) => {
  const l = book[n - 1];
  if (!l) return null;
  const w = l.trim().split(/\s+/);
  return w.slice(0, 18).join(" ") + (w.length > 18 ? " …" : "");
};
const mp = [];
mp.push("# Карта источников фильма BM-009 «Психология денег»", "");
mp.push("Источник — только TXT владельца канала: `Hauzel_Psihologiya-deneg-Vechnye-uroki-bogatstva-zhadnosti-i-schastya.665703.txt`, 624 942 байта, 1697 строк,");
mp.push(`SHA-256 \`${SHA}\`. Полный текст в репозиторий не загружается (авторские права).`);
mp.push("В TXT нет номеров страниц бумажной книги, поэтому место указано как **глава + номер строки файла** («стр.» ниже = строка TXT). Одна строка файла — обычно целый абзац.");
mp.push("Под каждой сценой — начало каждой указанной строки (дословно, до 18 слов, для проверки).", "");
mp.push("**Структура TXT:** Введение — стр. 16–82; гл. 1 «Сумасшедших нет» 83; гл. 2 «Удача и риск» 164; гл. 3 «Всегда чего-то не хватает» 252; гл. 4 «Парадоксы накопления» 313; гл. 5 «Стать богатым и оставаться богатым» 371; гл. 6 «„Длинные хвосты“ выигрывают» 470; гл. 7 «Свобода» 566; гл. 8 «Парадокс человека в автомобиле» 620; гл. 9 «Богатство – это то, чего мы не видим» 636; гл. 10 «Копите деньги» 668; гл. 11 «Здравомыслие и рационализм» 734; гл. 12 «Сюрприз!» 788; гл. 13 «Место для ошибок» 873; гл. 14 «Вы изменитесь» 937; гл. 15 «Ничего бесплатного не бывает» 980; гл. 16 «Вы и я» 1035; гл. 17 «Соблазн пессимизма» 1094; гл. 18 «Когда вы готовы поверить чему угодно» 1189; гл. 19 «А теперь все обобщим» 1294; гл. 20 «Исповедь» 1338; Постскриптум 1381; Благодарности 1530; Примечания 1539–1697.", "");
mp.push("**Что сознательно не вошло или подано осторожно:** конкретные инвестиционные инструменты и доходности (фонды, акции, кредитное плечо, депозиты) — только как контекст, без рекомендаций; лотерея (гл. 1), казино-пример и «русская рулетка» (гл. 13), прогноз о распаде страны (гл. 17), суеверия и народная медицина (гл. 18), списки политических деятелей (гл. 12) и постскриптум о кредитной истории США — не используются; обстоятельства смерти героев гл. 5 не упоминаются; личные решения автора (гл. 20) поданы как его пример, не как совет. Сомнительные места перевода (дата в стр. 1235, «доходность» в стр. 1004, фраза в стр. 909) не используются.", "");
const lineNums = (r) => {
  const out = [];
  for (const m of r.matchAll(/(\d{2,4})(?:–(\d{2,4}))?/g)) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (b - a > 12) out.push(a, b);
    else for (let n = a; n <= b; n++) if (book[n - 1]?.trim()) out.push(n);
  }
  return [...new Set(out)].slice(0, 8);
};
SCENES.forEach((s, i) => {
  const ts = tl.scenes[i];
  mp.push(`## Сцена ${i + 1} (${mmss(ts.from)}). ${s.title}`, "");
  mp.push(`Место в книге: ${s.src.map((r) => `**${r}**`).join("; ")}`);
  if (s.srcNote) mp.push(`Что взято / как подано: ${s.srcNote}`);
  mp.push("");
  for (const r of s.src) {
    if (/^фильм/.test(r)) {
      mp.push("> Вопрос, связка или вывод из уже разобранного в фильме; новых утверждений о книге нет.", "");
      continue;
    }
    for (const n of lineNums(r)) {
      const a = anchor(n);
      if (a) mp.push(`> стр. ${n}: ${a}`);
    }
    mp.push("");
  }
});
writeFileSync(`${DIR}/SOURCE_MAP.md`, mp.join("\n"));
console.log(`✓ ${DIR}/SCRIPT.md + SCRIPT.html (${words} слов, ${qn} вопросов, ${mmss(tl.duration)}${voiced ? "" : ", оценка"}), ${DIR}/SOURCE_MAP.md`);
