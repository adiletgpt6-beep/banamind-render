// Субтитры SRT по фактически звучащим 44 репликам: субтитр начинается с
// речью и заканчивается после неё (+0,3 с), не захватывая зрительские паузы;
// без имён, номеров и постановочных пометок. Длинная реплика делится на
// части по словам (≤ 2 строк по 46 знаков) по таймингам слов озвучки.
import { readFileSync, writeFileSync } from "node:fs";
import { FILM, L80_PAUSES, lineById } from "../src/lesson80/film-1-7/script.ts";
import { buildTimeline } from "../src/lesson80/film-1-7/timeline.ts";

const out = process.argv[2] ?? `out/${FILM.output}.srt`;
const manifest = JSON.parse(readFileSync(`public/${FILM.voiceDir}/manifest.json`, "utf8"));
const tl = buildTimeline(manifest);
const MAX = 46;
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
const chunks = (text) => {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const parts = [];
  let cur = "";
  for (const s of sentences) {
    const next = cur ? `${cur} ${s}` : s;
    if (next.length <= MAX * 2) cur = next;
    else {
      if (cur) parts.push(cur);
      cur = s;
    }
  }
  if (cur) parts.push(cur);
  return parts;
};
const wrap = (text) => {
  if (text.length <= MAX) return text;
  const words = text.split(" ");
  let a = "";
  let b = "";
  for (const w of words) {
    if (!b && (a + " " + w).trim().length <= MAX) a = (a + " " + w).trim();
    else b = (b + " " + w).trim();
  }
  return `${a}\n${b}`;
};
let n = 1;
const entries = [];
for (const c of tl.cues) {
  const line = lineById(c.id);
  const parts = chunks(line.text);
  const words = line.text.split(/\s+/).filter(Boolean);
  let wi = 0;
  const starts = parts.map((p) => {
    const s = wi;
    wi += p.split(/\s+/).filter(Boolean).length;
    return s;
  });
  const nextStart = tl.cues.find((x) => x.id === c.id + 1)?.from ?? c.to + 1;
  // перед зрительской паузой субтитр гаснет вместе с речью: пауза — тишина без текста
  const beforePause = L80_PAUSES.some((p) => p.after === c.id);
  for (let k = 0; k < parts.length; k++) {
    const from = k === 0 ? c.from : (c.words[starts[k]]?.start ?? c.from + ((c.to - c.from) * starts[k]) / words.length);
    const toRaw = k === parts.length - 1 ? c.to + (beforePause ? 0.02 : 0.3) : (c.words[starts[k + 1]]?.start ?? c.to) - 0.02;
    const to = Math.min(toRaw, nextStart - 0.15);
    entries.push(`${n++}\n${ts(from)} --> ${ts(Math.max(to, from + 0.6))}\n${wrap(parts[k])}\n`);
  }
}
writeFileSync(out, entries.join("\n") + "\n");
console.log(`${out}: ${entries.length} субтитров по ${tl.cues.length} репликам`);
