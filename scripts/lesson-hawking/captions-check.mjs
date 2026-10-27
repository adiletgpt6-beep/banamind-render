// Проверка анимированных титров BanaMind фильма: ≤ 2 строк, длина строк,
// без перекрытий, текст титров = текст сценария (смысл не меняется),
// слова идут по времени озвучки, выделения не на каждом слове, кинетика редкая.
//   node scripts/lesson-hawking/captions-check.mjs [--print]
import { CAPTION_STYLE } from "../../src/banamind/captions/style.ts";
import { cues, timeline } from "./lib.mjs";

const tl = timeline();
const list = cues(tl);
const errors = [];
const mark = (w) => (w.emph === 3 ? `[[${w.text.toUpperCase()}]]` : w.emph === 2 ? `{${w.text}}` : w.emph === 1 ? `*${w.text}*` : w.text);
let words = 0;
let hl = 0;
const kin = [];
list.forEach((c, i) => {
  if (c.rows.length > CAPTION_STYLE.maxRows) errors.push(`#${i + 1} строк ${c.rows.length}: ${c.text}`);
  for (const r of c.rows) {
    const len = r.map((w) => w.text).join(" ").length;
    if (len > CAPTION_STYLE.maxRowChars + 6) errors.push(`#${i + 1} длинная строка (${len}): ${r.map((w) => w.text).join(" ")}`);
  }
  const next = list[i + 1];
  if (next && c.end > next.start) errors.push(`#${i + 1} перекрывает следующий титр`);
  const ws = c.rows.flat();
  for (let k = 1; k < ws.length; k++) if (ws[k].start < ws[k - 1].start - 1e-6) errors.push(`#${i + 1} слова не по порядку`);
  if (ws[0].start - CAPTION_STYLE.lead < c.start - 1e-6) errors.push(`#${i + 1} слово раньше титра`);
  words += ws.length;
  hl += ws.filter((w) => w.emph).length;
  for (const w of ws) if (w.emph === 3) kin.push({ t: w.start, w: w.text });
  if (process.argv.includes("--print")) {
    const mm = `${Math.floor(c.start / 60)}:${String(Math.floor(c.start % 60)).padStart(2, "0")}`;
    console.log(`${mm} ${c.mode === "phrase" ? "▲" : "·"} ${c.rows.map((r) => r.map(mark).join(" ")).join(" / ")}`);
  }
});
// текст: титры реплики вместе = реплика сценария слово в слово
for (const ln of tl.lines) {
  const got = list.filter((c) => c.lineId === ln.id).map((c) => c.text).join(" ");
  if (got !== ln.text.split(/\s+/).filter(Boolean).join(" ")) errors.push(`${ln.id}: текст титров не совпадает со сценарием`);
}
for (let k = 1; k < kin.length; k++) if (kin[k].t - kin[k - 1].t < CAPTION_STYLE.kineticMinGap && kin[k].t - kin[k - 1].t > 2) errors.push(`кинетика слишком часто: ${kin[k].w}`);
const report = {
  cues: list.length,
  words,
  highlighted: `${hl} (${((hl / words) * 100).toFixed(1)}% слов)`,
  kinetic: kin.map((k) => `${Math.floor(k.t / 60)}:${String(Math.floor(k.t % 60)).padStart(2, "0")} ${k.w}`),
  maxRows: Math.max(...list.map((c) => c.rows.length)),
  phrase: list.filter((c) => c.mode === "phrase").length,
  errors,
};
console.log(JSON.stringify(report, null, 1));
if (errors.length) process.exit(1);
