// Проверки русской версии выпуска: якоря графики, перевод надписей,
// произношение чисел, фильтр формулировок, субтитры.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { SCENES, SFX } from "../../src/finance/episode/script.ts";
import { SCENES_RU, RU_LINES } from "../../src/finance/episode/script.ru.ts";
import { RU_UI } from "../../src/finance/episode/ui.ru.ts";
import { buildTimeline, cueTime } from "../../src/finance/timeline.ts";
import { buildCaptions } from "../../src/finance/captions.ts";

const MAN = "public/finance/voice-ru/manifest.json";
const manifest = existsSync(MAN) ? JSON.parse(readFileSync(MAN, "utf8")) : null;
const tl = buildTimeline(SCENES_RU, manifest);
const text = SCENES_RU.flatMap((s) => s.lines.map((l) => l.text)).join(" ");

test("у каждой английской реплики есть русская, и наоборот", () => {
  const en = SCENES.flatMap((s) => s.lines.map((l) => l.id)).sort();
  assert.deepEqual(Object.keys(RU_LINES).sort(), en);
});

test("все привязки графики находят русское слово-якорь", () => {
  const cues = [];
  for (const s of SCENES_RU) {
    s.host.slice(1).forEach((h) => cues.push(h.at));
    s.poses.slice(1).forEach((p) => cues.push(p.at));
  }
  SFX.forEach(([c]) => cues.push(c));
  for (const f of readdirSync("src/finance/visuals")) {
    const src = readFileSync(`src/finance/visuals/${f}`, "utf8");
    for (const m of src.matchAll(/"([a-z]\d(?:@[^"]+)?)"/g)) if (/^[a-z]\d(@|$)/.test(m[1])) cues.push(m[1]);
  }
  const bad = [];
  for (const c of new Set(cues)) {
    try {
      cueTime(tl, c);
    } catch (e) {
      bad.push(`${c}: ${e.message}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("все надписи графики переведены", () => {
  const keys = new Set();
  for (const f of readdirSync("src/finance/visuals")) {
    const src = readFileSync(`src/finance/visuals/${f}`, "utf8");
    for (const m of src.matchAll(/\bt\((["'])(.*?)\1\)/g)) keys.add(m[2]);
    // строки массивов, которые переводятся при отрисовке через t(переменная)
    for (const m of src.matchAll(/\[\s*"([^"@]+?)",\s*(?:"[a-z]\d@|"group-|\d|"[a-z]+",\s*"[a-z]\d@)/g)) keys.add(m[1]);
    for (const m of src.matchAll(/\b(?:t|sub): "([^"]+)"/g)) keys.add(m[1]);
  }
  for (const m of readFileSync("src/finance/visuals/partA.tsx", "utf8").match(/const STEPS = \[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)) keys.add(m[1]);
  const missing = [...keys].filter((k) => /[A-Za-z]{2,}/.test(k) && !(k in RU_UI));
  assert.deepEqual(missing, []);
});

test("числа произносятся словами и есть в тексте", () => {
  for (const [id, l] of Object.entries(RU_LINES)) {
    const tokens = l.text.split(/\s+/).map((w) => w.replace(/[.,!?;:«»]+$/g, "").replace(/^«/, ""));
    for (const tok of tokens) if (/^\d+$/.test(tok)) assert.ok(l.say?.[tok], `${id}: число ${tok} без произношения`);
    for (const k of Object.keys(l.say ?? {})) assert.ok(tokens.includes(k), `${id}: say «${k}» нет в тексте`);
  }
});

test("нет запрещённых рекомендаций и обещаний (рус.)", () => {
  const banned = [/сложн\w* процент/i, /облигаци/i, /крипт/i, /биткоин/i, /кредитн\w* плеч/i, /ставк\w* на спорт/i, /лотере/i, /гарантированн\w* (доход|прибыл)/i, /пассивн\w* доход/i, /финансов\w* свобод/i, /ипотек/i, /годовых/i, /халяль/i];
  const allowed = [/схемы быстрого обогащения/gi, /процентные долги/gi, /проценты по займам/gi, /обещанной/gi, /ничего не гарантировано/gi, /не фиксированная гарантированная выплата/gi, /азартные игры/gi];
  let t = text;
  for (const a of allowed) t = t.replace(a, "");
  for (const b of banned) assert.doesNotMatch(t, b);
});

test("субтитры: не больше двух строк, текст совпадает со сценарием", () => {
  const caps = buildCaptions(tl);
  for (const c of caps) {
    assert.ok(c.lines.length <= 2, c.lines.join(" / "));
    for (const l of c.lines) assert.ok(l.length <= 48, `длинная строка: ${l}`);
  }
  assert.equal(caps.map((c) => c.lines.join(" ")).join(" ").replace(/\s+/g, " "), text.replace(/\s+/g, " "));
});

test("в графике нет непереведённого текста без t()", () => {
  const bare = [];
  for (const f of readdirSync("src/finance/visuals")) {
    readFileSync(`src/finance/visuals/${f}`, "utf8")
      .split("\n")
      .forEach((l, i) => {
        if (/^\s+[A-Z$][\w$,.'’ ·—–-]*[a-z][\w$,.'’ ·—–-]*\s*$/.test(l) && !/^\s+(return|export|import|const)\b/.test(l)) bare.push(`${f}:${i + 1}: ${l.trim()}`);
      });
  }
  assert.deepEqual(bare, []);
});
