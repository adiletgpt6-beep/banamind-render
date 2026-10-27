// Субтитры ролика 80-1-3 (SRT; русская или --lang=ky кыргызская версия) по
// фактической озвучке: каждая
// реплика — от начала до конца речи (+0,6 с, без наложения на следующую).
// Текст — утверждённый текст реплики (line.text), без имён и номеров.
// Во время пауз для ответа зрителя ответ заранее не показывается: его
// субтитр начинается не раньше конца паузы (= начала речи ответа).
// Строки длиннее ~46 знаков переносятся на границе фразы; реплики длиннее
// 84 знаков делятся на ДВА субтитра подряд на границе предложения — по
// таймингам слов из манифеста (абсолютное время = fileStart + word.start).
// Запуск: node scripts/lesson80-1-3-srt.mjs [--lang=ky] [путь.srt]
/* global console, process */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { A3_EDITIONS, a3Edition, a3LangFromArgs, a3PlainArgs } from "../src/lesson80-1-3/edition.ts";
import { A3_VIDEO, A3_VIEWER_PAUSES } from "../src/lesson80-1-3/script.ts";
import { buildTimeline } from "../src/lesson80-1-3/timeline.ts";

export const SRT_PATH = A3_EDITIONS.ru.srt;
const LONG = 84; // длиннее — два субтитра
const TAIL = 0.6; // субтитр держится после конца речи
const LEAD = 0.05; // и появляется чуть раньше её начала

const ts = (sec) => {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n, k = 2) => String(n).padStart(k, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))},${p(ms % 1000, 3)}`;
};
// перенос ≈ по середине: лучше после конца предложения, затем после запятой,
// двоеточия или кавычки; не рядом с тире и не после короткого служебного слова
export const wrap = (text, max = 46) => {
  if (text.length <= max) return text;
  const mid = text.length / 2;
  let best = -1;
  let bestScore = Infinity;
  for (let i = 1; i < text.length - 1; i++) {
    if (text[i] !== " ") continue;
    const head = text.slice(0, i);
    const punct = /[.!?…]»?$/.test(head) ? 0 : /[,:;]»?$/.test(head) ? 3 : /»$/.test(head) ? 6 : 20;
    const weak = /(^|\s)\p{L}{1,2}$/u.test(head) || /—$/.test(head) || text[i + 1] === "—" ? 8 : 0;
    const over = Math.max(0, Math.max(i, text.length - i - 1) - max) * 2;
    const score = Math.abs(i - mid) + punct + weak + over;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best > 0 ? `${text.slice(0, best)}\n${text.slice(best + 1)}` : text;
};
const letters = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
// граница предложения, при которой длинная часть короче всего
const sentenceCut = (text) => {
  let best = -1;
  let worst = Infinity;
  for (let i = 1; i < text.length - 1; i++) {
    if (text[i] !== " " || !/[.!?…]»?$/.test(text.slice(0, i))) continue;
    const longer = Math.max(i, text.length - i - 1);
    if (longer < worst) {
      worst = longer;
      best = i;
    }
  }
  return best;
};

// Субтитры по манифесту: [{ a, z, text, line }] (секунды шкалы ролика).
export const buildCues = (manifest, ed = A3_EDITIONS.ru) => {
  const T = buildTimeline(manifest, A3_VIDEO.fps, ed.lines);
  if (T.estimated) throw new Error("Озвучка неполная — субтитры строятся только по фактической речи.");
  const segs = Object.values(T.seg).sort((x, y) => x.start - y.start);
  // ответ после паузы зрителя — не раньше конца паузы (без опережения LEAD; мс — вверх)
  const after = new Map(A3_VIEWER_PAUSES.map((p) => [p.a, Math.ceil(T.pause[p.q].end * 1000) / 1000]));
  const cues = [];
  segs.forEach((s, i) => {
    const line = ed.lines.find((l) => l.id === s.line);
    const next = segs[i + 1];
    const a = Math.max(s.start - LEAD, after.get(s.line) ?? 0);
    const z = Math.min(s.end + TAIL, next ? next.start - LEAD : s.end + TAIL);
    const cut = line.text.length > LONG ? sentenceCut(line.text) : -1;
    if (cut < 0) {
      cues.push({ a, z, text: line.text, line: line.id });
      return;
    }
    const p1 = line.text.slice(0, cut);
    const p2 = line.text.slice(cut + 1);
    // слова манифеста (только с буквами) ↔ слова первой части
    const words = s.m.words.filter((w) => letters(w.text));
    const k = p1.split(/\s+/).filter((w) => letters(w)).length;
    if (letters(words.slice(0, k).map((w) => w.text).join("")) !== letters(p1) || k >= words.length) throw new Error(`${line.id}: слова манифеста не совпадают с текстом`);
    const a2 = s.fileStart + words[k].start - LEAD;
    cues.push({ a, z: Math.min(s.fileStart + words[k - 1].end + TAIL, a2), text: p1, line: line.id });
    cues.push({ a: a2, z, text: p2, line: line.id });
  });
  return cues;
};

export const toSrt = (cues) => cues.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.z)}\n${wrap(c.text)}\n`).join("\n");

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const ed = a3Edition(a3LangFromArgs(process.argv, process.env));
  const out = a3PlainArgs(process.argv.slice(2))[0] ?? ed.srt;
  const manifest = JSON.parse(readFileSync(`public/${ed.voiceDir}/manifest.json`, "utf8"));
  if (!manifest.complete) throw new Error(`Озвучка неполная (нет: ${manifest.missing.join(", ")}) — субтитры строятся только по фактической речи.`);
  const cues = buildCues(manifest, ed);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, toSrt(cues));
  console.log(`SRT: ${out} (${cues.length} субтитров)`);
}
