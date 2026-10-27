// YouTube-метаданные книги канала BanaMind.
//   node scripts/books/youtube-meta.mjs <slug>
// Источник: books/<slug>/book.json (где тайм-лайн фильма) и books/<slug>/metadata/meta.json
// (варианты названия, описание, ключевые слова, главы по id сцен).
// Таймкоды глав берутся из тайм-лайна готового фильма — их не нужно править вручную.
// Результат: books/<slug>/metadata/youtube.md (для копирования в YouTube Studio) и youtube.json.
// Таймкоды допустимы только в описании; в самом видео таймеров нет.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const slug = process.argv[2];
if (!slug) throw new Error("usage: node scripts/books/youtube-meta.mjs <slug>");
const BOOK = JSON.parse(readFileSync(`books/${slug}/book.json`, "utf8"));
const META = JSON.parse(readFileSync(`books/${slug}/metadata/meta.json`, "utf8"));
const { timeline } = await import(pathToFileURL(path.resolve(BOOK.lesson.timeline)).href);
const tl = timeline();
const ts = (s) => {
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = String(Math.floor(s % 60)).padStart(2, "0");
  return h ? `${h}:${String(m % 60).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

const errors = [];
const chapters = META.chapters.map((c) => {
  const sc = tl.scenes.find((s) => s.id === c.scene);
  if (!sc) errors.push(`глава «${c.title}»: нет сцены ${c.scene}`);
  return { ...c, at: sc ? sc.from : NaN };
});
// Правила глав YouTube: первая 0:00, не меньше трёх, каждая не короче 10 с, по возрастанию.
if (chapters[0]?.at !== 0) errors.push("первая глава должна начинаться с 0:00");
if (chapters.length < 3) errors.push("нужно не меньше трёх глав");
chapters.forEach((c, i) => {
  const end = i + 1 < chapters.length ? chapters[i + 1].at : tl.duration;
  if (!(end - c.at >= 10)) errors.push(`глава «${c.title}» короче 10 с`);
});

const lines = [...META.description, "", "Главы:", ...chapters.map((c) => `${ts(c.at)} ${c.title}`), "", META.channelLine, "", META.hashtags.join(" ")];
const description = lines.join("\n");
const tags = META.keywords.join(", ");
const titles = META.titles;
if (titles.length !== 5) errors.push("нужно пять вариантов названия");
titles.forEach((t) => t.length > 100 && errors.push(`название длиннее 100 символов: ${t}`));
if (!titles[META.recommended - 1]) errors.push("recommended вне 1..5");
if (description.length > 5000) errors.push(`описание ${description.length} > 5000 символов`);
if (/[<>]/.test(description + titles.join(""))) errors.push("YouTube не принимает символы < и >");
if (tags.length > 500) errors.push(`ключевые слова ${tags.length} > 500 символов`);

const spell = JSON.parse(execFileSync("python3", ["scripts/books/spellcheck.py"], { input: JSON.stringify([...titles, description, ...META.keywords]) }).toString());
if (spell.unknown.length) errors.push(`орфография: ${spell.unknown.join(", ")}`);

const out = { slug, book: BOOK.title, author: BOOK.author, collection: BOOK.collection, channel: BOOK.channel, titles, recommended: META.recommended, why: META.why, description, tags: META.keywords, chapters: chapters.map((c) => ({ at: ts(c.at), seconds: +c.at.toFixed(2), title: c.title, scene: c.scene })), duration: ts(tl.duration), checks: { descriptionChars: description.length, tagsChars: tags.length, spelling: spell, errors } };
writeFileSync(`books/${slug}/metadata/youtube.json`, JSON.stringify(out, null, 2) + "\n");

const md = [
  `# YouTube: «${BOOK.title}» — канал «${BOOK.channel}»`,
  "",
  `Сгенерировано \`node scripts/books/youtube-meta.mjs ${slug}\` из \`metadata/meta.json\` и тайм-лайна фильма (${ts(tl.duration)}). Правьте meta.json, а не этот файл.`,
  "",
  "## Варианты названия",
  "",
  ...titles.map((t, i) => `${i + 1}. ${t}${i + 1 === META.recommended ? " — **рекомендую**" : ""} _(${t.length} симв.)_`),
  "",
  `**Почему №${META.recommended}:** ${META.why}`,
  "",
  "## Описание (скопировать целиком)",
  "",
  "```text",
  description,
  "```",
  "",
  "## Ключевые слова (теги)",
  "",
  "```text",
  tags,
  "```",
  "",
  `## Проверки`,
  "",
  `- описание: ${description.length} / 5000 символов; теги: ${tags.length} / 500 символов`,
  `- главы: ${chapters.length}, первая 0:00, каждая ≥ 10 с, по возрастанию — таймкоды из тайм-лайна фильма`,
  `- орфография (Hunspell ru_RU + books/dictionary.txt): ${spell.unknown.length ? "✗ " + spell.unknown.join(", ") : "✓"} (${spell.checked} слов)`,
  `- ошибки: ${errors.length ? errors.join("; ") : "нет"}`,
  "",
].join("\n");
writeFileSync(`books/${slug}/metadata/youtube.md`, md);
console.log(md.split("## Проверки")[1]);
if (errors.length) process.exit(1);
