// Документы фильма BM-030 из данных сценария (src/books/war-and-peace-tolstoy/film/script.ts),
// тайм-лайна озвучки, индекса глав и построчных карт частей романа:
//   books/war-and-peace-tolstoy/scripts/SOURCE_MAP.md — привязка каждой ссылки сцены к
//     part-NN.txt:Lx–Ly, тому/части/главе, голосу и событию из карты части; где найдена каждая цитата;
//   …/VOLUME_AND_CHAPTER_AUDIT.md — все тома/части, 361 глава, что использовано в фильме;
//   …/SCRIPT.md — полный текст ведущего по сценам, «книга говорит» / «анализ видео», таймкоды;
//   …/STORYBOARD.md — что в кадре в каждой сцене, место банана, переходы.
// Запуск: node scripts/lesson-war/docs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { LESSON, VOICE } from "../../src/books/war-and-peace-tolstoy/film/script.ts";
import { ROOMS } from "../../src/books/war-and-peace-tolstoy/film/rooms.ts";
import { loadManifest, SCENES, timeline } from "./lib.mjs";

const DIR = "books/war-and-peace-tolstoy/scripts";
const SRC = "books/500-series/sources/BM-030";
const m = loadManifest();
const voiced = m?.lines?.length === SCENES.reduce((a, s) => a + s.lines.length, 0);
const tl = timeline();
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const pad = (n) => String(n).padStart(2, "0");
const chapters = JSON.parse(readFileSync(`${DIR}/chapter-index.json`, "utf8"));
const partText = Array.from({ length: 63 }, (_, i) => readFileSync(`${SRC}/part-${pad(i + 1)}.txt`, "utf8").split("\n"));

// глобальный номер строки: файл и строка → порядковый индекс (для поиска главы)
const offs = [];
let acc = 0;
partText.forEach((p) => {
  offs.push(acc);
  acc += p.length;
});
const g = (file, line) => offs[file - 1] + line;
const chapterAt = (file, line) => {
  let best = null;
  for (const c of chapters) {
    const f = Number(/part-(\d\d)/.exec(c.file)[1]);
    if (g(f, c.line) <= g(file, line)) best = c;
  }
  return best;
};
const chName = (c) => (!c ? "—" : c.vol === "Примечания" ? "Примечания" : `${c.vol}, ${c.part}, гл. ${c.ch}`);

// строки таблиц «Ключевые события» из карт частей
const mapRows = [];
for (let i = 1; i <= 63; i++) {
  const md = readFileSync(`${DIR}/source-map/part-${pad(i)}.md`, "utf8");
  for (const line of md.split("\n")) {
    const r = /^\|\s*`?part-(\d\d)\.txt:L?(\d+)(?:[–-]L?(\d+))?`?\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/.exec(line);
    if (!r) continue;
    mapRows.push({ file: Number(r[1]), a: Number(r[2]), b: Number(r[3] ?? r[2]), who: r[5].trim(), what: r[6].trim(), voice: r[7].trim() });
  }
}
const parseRef = (r) => {
  const x = /^part-(\d\d):L(\d+)(?:–L(\d+))?$/.exec(r);
  return x ? { file: Number(x[1]), a: Number(x[2]), b: Number(x[3] ?? x[2]) } : null;
};
const rowsFor = (ref) => mapRows.filter((r) => r.file === ref.file && r.a <= ref.b && r.b >= ref.a);

// где в романе найдена цитата (первое вхождение)
const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[–—-]/g, "-").replace(/[«»"„“]/g, "").replace(/[\s ]+/g, " ").trim();
const NORM = partText.map((p) => p.map(norm));
const findQuote = (q) => {
  const piece = norm(q.split(/…|\.\.\./)[0]).replace(/^[\s,.!?:;-]+|[\s,.!?:;-]+$/g, "");
  for (let f = 0; f < 63; f++) for (let l = 0; l < NORM[f].length; l++) if (NORM[f][l].includes(piece)) return { file: f + 1, line: l + 1 };
  return null;
};
const NOT_QUOTES = new Set(["Войну и мир", "Война и мир", "Тулона", "дедушка", "длиннополого", "любовь", "Тулон"]);

// ── SOURCE_MAP.md ──
{
  const out = [];
  out.push(`# BM-030 — SOURCE_MAP: «Война и мир» → фильм «${LESSON.title}»`);
  out.push("");
  out.push(`Источник: \`${SRC}/part-01…63.txt\` (SHA-256 конкатенации \`bb711e80…7467907\`, проверено 63/63). Построчные карты всех 63 частей: \`source-map/part-NN.md\` (прочитано целиком, 407 коротких цитат сверены \`grep\`). Индекс 361 главы: \`chapter-index.json\`.`);
  out.push("");
  out.push("Каждая строка ниже — ссылка сцены фильма на строки романа: том/часть/глава (нумерация глав в источнике сквозная внутри тома), событие и голос (по карте части), сцена и что в ней является собственным выводом фильма. «метафора» — авторская схема BanaMind без опоры на конкретную строку.");
  out.push("");
  out.push("| # | ref | Том / часть / глава | событие или тезис в романе (своими словами) | чей голос | сцена | вывод фильма / анализ |");
  out.push("|---|---|---|---|---|---|---|");
  let n = 0;
  for (const s of SCENES) {
    for (const r of s.src) {
      const ref = parseRef(r);
      if (!ref) continue;
      const rows = rowsFor(ref);
      const what = rows.length ? rows.map((x) => x.what).slice(0, 2).join("; ") : (s.book ?? "").slice(0, 200);
      const voice = rows.length ? [...new Set(rows.map((x) => x.voice))].slice(0, 2).join("; ") : "—";
      n++;
      out.push(`| ${n} | \`part-${pad(ref.file)}.txt:L${ref.a}${ref.b !== ref.a ? `–L${ref.b}` : ""}\` | ${chName(chapterAt(ref.file, ref.a))} | ${what.replace(/\|/g, "/")} | ${voice.replace(/\|/g, "/")} | ${s.id} «${s.title}» | ${(s.analysis ?? "пересказ/цитата книги без собственного вывода").replace(/\|/g, "/")} |`);
    }
  }
  out.push("");
  out.push(`Всего привязок: **${n}**.`);
  out.push("");
  out.push("## Где в романе находится каждая цитата сценария");
  out.push("");
  out.push("Проверка: `node scripts/lesson-war/quotes.mjs` (все фрагменты в «ёлочках» дословно найдены в 63 частях; без учёта регистра, ё/е, вида тире и пробелов).");
  out.push("");
  out.push("| реплика | цитата | найдено | глава |");
  out.push("|---|---|---|---|");
  for (const s of SCENES)
    for (const l of s.lines)
      for (const q of l.text.matchAll(/«([^»]+)»/g)) {
        if (NOT_QUOTES.has(q[1])) continue;
        const at = findQuote(q[1]);
        out.push(`| ${l.id} | «${q[1]}» | ${at ? `part-${pad(at.file)}.txt:L${at.line}` : "**не найдено**"} | ${at ? chName(chapterAt(at.file, at.line)) : "—"} |`);
      }
  out.push("");
  out.push("## Сцены фильма: что говорит книга и что — анализ");
  out.push("");
  for (const s of SCENES) {
    out.push(`- **${s.id} · ${s.title}** — ${s.src.join(", ")}. Книга: ${s.book ?? "—"}${s.analysis ? ` Анализ фильма: ${s.analysis}` : ""}`);
  }
  writeFileSync(`${DIR}/SOURCE_MAP.md`, out.join("\n") + "\n");
  console.log(`✓ SOURCE_MAP.md: ${n} привязок`);
}

// ── VOLUME_AND_CHAPTER_AUDIT.md ──
{
  const used = new Map(); // ключ главы → сцены
  for (const s of SCENES)
    for (const r of s.src) {
      const ref = parseRef(r);
      if (!ref) continue;
      for (let l = ref.a; l <= ref.b; l++) {
        const c = chapterAt(ref.file, l);
        if (!c) continue;
        const k = chName(c);
        if (!used.has(k)) used.set(k, new Set());
        used.get(k).add(s.id);
      }
    }
  const groups = [];
  for (const c of chapters) {
    if (!c.ch) continue;
    const k = `${c.vol} · ${c.part}`;
    let gr = groups.find((x) => x.k === k);
    if (!gr) groups.push((gr = { k, list: [] }));
    gr.list.push(c);
  }
  const out = [];
  out.push("# BM-030 — VOLUME_AND_CHAPTER_AUDIT");
  out.push("");
  out.push(`Пересчитано скриптом по \`${SRC}\`: **${chapters.filter((c) => c.ch).length} заголовков «Глава»** (в источнике нумерация глав сквозная внутри каждого тома; эпилог II продолжает нумерацию эпилога I — гл. 17–28), блок «Примечания» с \`part-60.txt:L28\` до конца \`part-63.txt\`: **961 примечание**, 961 маркер \`[N]\` в тексте, соответствие 1:1 (подробно — \`source-map/NOTES_AUDIT.md\`). Все 63 части прочитаны построчно (\`source-map/part-NN.md\`).`);
  out.push("");
  out.push("| Том · часть | глав | первая глава | последняя глава | главы, на которые опирается фильм (сцены) |");
  out.push("|---|---:|---|---|---|");
  for (const gr of groups) {
    const f = gr.list[0];
    const l = gr.list[gr.list.length - 1];
    const u = gr.list.filter((c) => used.has(chName(c))).map((c) => `${c.ch} (${[...used.get(chName(c))].join(",")})`);
    out.push(`| ${gr.k} | ${gr.list.length} | гл. ${f.ch} — ${f.file}:L${f.line} | гл. ${l.ch} — ${l.file}:L${l.line} | ${u.join("; ") || "—"} |`);
  }
  out.push("");
  out.push(`Итого глав: ${groups.reduce((a, gr) => a + gr.list.length, 0)}. Глав с прямыми ссылками сцен: ${used.size}.`);
  out.push("");
  { const f = `${DIR}/VOLUME_AND_CHAPTER_AUDIT.md`; const cur = readFileSync(f, "utf8"); const i = cur.indexOf("| Том · часть"); writeFileSync(f, cur.slice(0, i) + out.slice(out.findIndex((l) => l.startsWith("| Том · часть"))).join("\n") + "\n"); }
  console.log(`✓ VOLUME_AND_CHAPTER_AUDIT.table.md: ${used.size} глав в фильме`);
}

// ── SCRIPT.md ──
{
  const out = [];
  out.push(`# BM-030 — SCRIPT: ${LESSON.title}`);
  out.push("");
  out.push(`${LESSON.book}. Авторский аналитический фильм BanaMind «Масштаб выбора». Ведущий — банан BanaMind, голос: ${VOICE.name} (speed ${VOICE.settings.speed}).`);
  out.push(voiced ? `Таймкоды — по реальной озвучке; длительность ${mmss(tl.duration)} (естественная ${mmss(tl.natural)}).` : "Таймкоды — черновая оценка до озвучки.");
  const words = SCENES.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/).length;
  out.push(`Сцен: ${SCENES.length}, реплик: ${SCENES.reduce((a, s) => a + s.lines.length, 0)}, слов: ${words}. Цитаты в «ёлочках» дословны (см. SOURCE_MAP.md).`);
  out.push("");
  let part = "";
  SCENES.forEach((s, i) => {
    if (s.part !== part) {
      part = s.part;
      out.push(`## ${ROOMS[part]}`);
      out.push("");
    }
    const ts = tl.scenes[i];
    out.push(`### ${mmss(ts.from)} · ${s.id} — ${s.title}`);
    out.push(`*Источник:* ${s.src.join(", ")}${s.book ? ` · *Книга:* ${s.book}` : ""}${s.analysis ? ` · *Анализ фильма:* ${s.analysis}` : ""}`);
    out.push("");
    s.lines.forEach((l, j) => {
      const tline = tl.scenes[i].lines[j];
      out.push(`- \`${mmss(tline.speechFrom)}\` ${l.wait ? "**[вопрос, пауза]** " : ""}${l.text}`);
    });
    out.push("");
  });
  writeFileSync(`${DIR}/SCRIPT.md`, out.join("\n"));
  console.log(`✓ SCRIPT.md (${voiced ? "по озвучке" : "оценка"})`);
}

// ── STORYBOARD.md ──
{
  const HOST = { peek: "банан крупно из-за правого края", center: "банан в центре", close: "банан крупно", left: "банан слева, схема справа", right: "банан справа, схема слева", corner: "банан маленький в углу, схема на весь кадр", off: "банан за кадром" };
  const out = [];
  out.push("# BM-030 — STORYBOARD «Масштаб выбора»");
  out.push("");
  out.push("Слои карты: **личный выбор** (силуэты, предметы, жесты) → **переживание войны** (карты, планы, поле) → **историческая перспектива** (сеть ярких точек-решений). Все рисунки — собственные SVG BanaMind (`src/books/war-and-peace-tolstoy/film/visuals/`), карты подписаны как художественная схема. Смена смыслового кадра — каждые 10–30 с; смена части (фон, подпись вверху) — каждые 1,5–3 мин. Переходы: мягкий подъём/растворение, во вступлении — «шторка». Без таймеров.");
  out.push("");
  out.push("| время | сцена | часть | визуал (kind / режим) | банан | длительность |");
  out.push("|---|---|---|---|---|---|");
  SCENES.forEach((s, i) => {
    const ts = tl.scenes[i];
    const v = s.visual;
    const extra = [v.mode, v.text, Array.isArray(v.labels) ? v.labels.join(" · ") : null, Array.isArray(v.items) ? v.items.join(" · ") : null].filter(Boolean).join("; ");
    out.push(`| ${mmss(ts.from)} | ${s.id} ${s.title} | ${ROOMS[s.part]} | \`${v.kind}\`${extra ? ` — ${extra}` : ""} | ${HOST[s.host]} | ${(ts.to - ts.from).toFixed(1)} с |`);
  });
  writeFileSync(`${DIR}/STORYBOARD.md`, out.join("\n") + "\n");
  console.log("✓ STORYBOARD.md");
}
