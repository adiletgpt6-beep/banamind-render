// Проверки кыргызской версии ролика 80-1-3 «А если я не вижу?»: та же
// структура, что у русской (42 реплики, сцены, роли, порядок, паузы для
// зрителя, выдох Юсуфа), кыргызские тексты и надписи, слова-якоря для
// синхронизации картинки, а по готовой озвучке — шкала (паузы 4 / 4 / 5 с,
// без наложения речи), якоря в таймингах слов, актуальный SRT и физика
// вертушки на кыргызской шкале.
// Запуск: npm run test:80-1-3-ky
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { A3_EDITIONS } from "../src/lesson80-1-3/edition.ts";
import { A3_LINES, A3_VIEWER_PAUSES } from "../src/lesson80-1-3/script.ts";
import { KY_TERMS } from "../src/lesson80-1-3/script-ky.ts";
import { buildTimeline, checkViewerPauses } from "../src/lesson80-1-3/timeline.ts";
import { buildCues, toSrt } from "./lesson80-1-3-srt.mjs";

const KY = A3_EDITIONS.ky;
const MAN = `public/${KY.voiceDir}/manifest.json`;
const manifest = existsSync(MAN) ? JSON.parse(readFileSync(MAN, "utf8")) : null;
const complete = manifest?.complete === true;
const id = (n) => `80-1-3-${String(n).padStart(3, "0")}`;
const t = (n) => KY.lines[n - 1].text;
const letters = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
const words = (s) => s.split(/\s+/).map((w) => w.replace(/[^\p{L}]/gu, "").toLowerCase()).filter(Boolean);

test("структура: те же 42 реплики, сцены, роли, порядок, интонация и обращения к зрителю", () => {
  assert.equal(KY.lines.length, 42);
  KY.lines.forEach((l, i) => {
    const r = A3_LINES[i];
    assert.deepEqual([l.id, l.n, l.scene, l.role, l.tag, l.toViewer], [r.id, r.n, r.scene, r.role, r.tag, r.toViewer], l.id);
  });
  assert.equal(KY.id, "Lesson80-1-3-WhatIfICantSee-ky");
  assert.notEqual(KY.voiceDir, A3_EDITIONS.ru.voiceDir);
});

test("тексты: кыргызские, кириллица, без латиницы и цифр", () => {
  for (const l of KY.lines) {
    assert.ok(l.text.trim().length > 0, `${l.id}: пусто`);
    assert.notEqual(l.text, A3_LINES[l.n - 1].text, `${l.id}: не переведено`);
    assert.ok(!/[A-Za-z\d]/.test(l.text), `${l.id}: латиница или цифры`);
  }
  const all = KY.lines.map((l) => l.text).join(" ");
  assert.ok(/[үөң]/i.test(all), "нет кыргызских букв ү, ө, ң");
  assert.ok(!/ё/.test(all), "буква ё — не кыргызская");
});

test("синтез: spoken отличается лишь пунктуацией; без подписей, скобок, ремарок", () => {
  for (const l of KY.lines) {
    if (l.spoken !== undefined) assert.equal(letters(l.spoken), letters(l.text), `${l.id}: spoken меняет слова`);
    for (const s of [l.spoken ?? l.text, l.lead ?? ""]) assert.ok(!/[[\](){}<>*_#]|\d|(Мухаммад|Юсуф|Амир|Билал|Мугалим)\s*:/.test(s), `${l.id}: «${s}»`);
  }
  assert.ok(KY.pad.trim().length > 1 && /\.$/.test(KY.pad), "страховочное слово");
});

test("вопросы остаются вопросами (в т. ч. перед паузами для зрителя)", () => {
  for (const l of A3_LINES) if (/\?$/.test(l.text)) assert.match(t(l.n), /\?$/, `${l.id}: «${t(l.n)}»`);
  for (const { q } of A3_VIEWER_PAUSES) assert.match(KY.lines.find((l) => l.id === q).text, /\?$/, q);
});

test("термины и защищённые реплики: Аллах, Куран, Жаратуучу / творение — единообразно", () => {
  // термины утверждены переводом (KY_TERMS) и встречаются там, где в русском
  for (const l of A3_LINES) if (/Аллах/.test(l.text)) assert.ok(/Аллах/.test(t(l.n)), `${l.id}: нет «Аллах»`);
  for (const l of A3_LINES) if (!/Аллах/.test(l.text)) assert.ok(!/Аллах/.test(t(l.n)), `${l.id}: лишнее «Аллах»`);
  for (const n of [22, 32]) assert.ok(t(n).includes(KY_TERMS.quran), `${id(n)}: нет «${KY_TERMS.quran}»`);
  for (const n of [26, 37]) assert.ok(t(n).toLowerCase().includes(KY_TERMS.creator.toLowerCase()), `${id(n)}: нет «${KY_TERMS.creator}»`);
  // творение — «жаратылган нерсе»; творение Аллаха / Свои творения — «(Аллах / Өзү) жараткан нерсе(лер)»
  for (const n of [26, 37]) assert.ok(t(n).toLowerCase().includes(KY_TERMS.creation.toLowerCase()), `${id(n)}: нет «${KY_TERMS.creation}»`);
  for (const n of [26, 38, 39]) assert.ok(t(n).toLowerCase().includes(KY_TERMS.creationOf.toLowerCase()), `${id(n)}: нет «${KY_TERMS.creationOf}»`);
  for (const n of [26, 39]) assert.ok(t(n).toLowerCase().includes(KY_TERMS.notLike.toLowerCase()), `${id(n)}: нет «${KY_TERMS.notLike}»`);
  assert.ok(t(20).toLowerCase().includes(KY_TERMS.thisLife.toLowerCase()), `${id(20)}: нет «${KY_TERMS.thisLife}» (в этой жизни)`);
  assert.ok(!/кудай/i.test(KY.lines.map((l) => l.text).join(" ")), "имя — «Аллах», не «Кудай»");
});

test("надписи: название и финальная фраза (= реплика 42, две строки)", () => {
  assert.ok(KY.text.title.trim().length > 0);
  assert.equal(KY.text.final.length, 2);
  assert.equal(letters(KY.text.final.join(" ")), letters(t(42)));
  assert.notEqual(KY.text.title, A3_EDITIONS.ru.text.title);
});

test("слова-якоря картинки есть в своих репликах целиком", () => {
  const where = { a13pinwheel: 13, a13skin: 13, a23apple: 23, a24plants: 24, a28second: 28, a30need: 30 };
  for (const [k, n] of Object.entries(where)) {
    const a = KY.anchors[k];
    assert.ok(a && words(t(n)).includes(a.toLowerCase()), `${k}: «${a}» нет в ${id(n)} «${t(n)}»`);
  }
  // воспоминание о вертушке — раньше воспоминания о щеке
  const w13 = words(t(13));
  assert.ok(w13.indexOf(KY.anchors.a13pinwheel.toLowerCase()) < w13.indexOf(KY.anchors.a13skin.toLowerCase()), "порядок якорей в 013");
});

test("озвучка: все реплики, тексты совпадают, файлы на месте, якоря в таймингах", { skip: !complete && "кыргызская озвучка неполная" }, () => {
  assert.equal(manifest.lines.length, 42);
  for (const l of KY.lines) {
    const x = manifest.lines.find((y) => y.segId === l.id);
    assert.ok(x, `нет ${l.id}`);
    assert.equal(x.role, l.role, l.id);
    assert.ok(existsSync(`public/${KY.voiceDir}/${x.file}`), `нет файла ${x.file}`);
    assert.equal(x.text, l.spoken ?? l.text, l.id);
    assert.ok(x.speechEnd > x.speechStart && x.speechEnd <= x.durationSec + 0.01, l.id);
  }
  const where = { a13pinwheel: 13, a13skin: 13, a23apple: 23, a24plants: 24, a28second: 28, a30need: 30 };
  for (const [k, n] of Object.entries(where)) {
    const x = manifest.lines.find((y) => y.segId === id(n));
    assert.ok(x.words.some((w) => w.text.replace(/[^\p{L}]/gu, "").toLowerCase() === KY.anchors[k].toLowerCase()), `${k}: нет в таймингах слов ${id(n)}`);
  }
});

test("шкала: паузы 4 / 4 / 5 с, 3:45–4:25, речь не накладывается", { skip: !complete && "кыргызская озвучка неполная" }, () => {
  const T = buildTimeline(manifest, 30, KY.lines);
  assert.equal(T.estimated, false);
  const ps = checkViewerPauses(T);
  for (const p of ps) assert.ok(p.ok && p.frames >= p.need, `${p.q}→${p.a}: ${p.frames} < ${p.need}`);
  assert.ok(T.total >= 225 && T.total <= 265, `длительность ${T.total.toFixed(2)} с`);
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  assert.deepEqual(segs.map((s) => s.line), KY.lines.map((l) => l.id));
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].start >= segs[i - 1].end + 0.05, `наложение ${segs[i].line}`);
  const b = T.hold.blow;
  assert.ok(b.start >= T.seg[id(8)].end && b.end <= T.seg[id(9)].start && T.seg[id(9)].start - T.seg[id(8)].end >= 2.9, "окно выдоха");
});

const srtReady = complete && existsSync(KY.srt);
test("SRT: актуален, тексты дословно, ответ не виден во время паузы", { skip: !srtReady && "нет SRT или озвучка неполная" }, () => {
  const srt = readFileSync(KY.srt, "utf8");
  assert.equal(srt, toSrt(buildCues(manifest, KY)), "SRT устарел — npm run srt:80-1-3-ky");
  const cues = buildCues(manifest, KY);
  assert.equal(letters(cues.map((c) => c.text).join(" ")), letters(KY.lines.map((l) => l.text).join(" ")));
  const T = buildTimeline(manifest, 30, KY.lines);
  for (const { q, a } of A3_VIEWER_PAUSES) {
    const ans = cues.find((c) => c.line === a);
    assert.ok(ans.a >= T.pause[q].end - 0.001, `ответ ${a} виден во время паузы`);
  }
});

test("вертушка на кыргызской шкале: в сценах 3–7 покой, в финале у окна", { skip: !complete && "кыргызская озвучка неполная" }, async () => {
  const { buildSync } = await import("esbuild");
  const outfile = "node_modules/.cache/lesson80-1-3/direction-ky-test.mjs";
  buildSync({ entryPoints: ["src/lesson80-1-3/direction.tsx"], bundle: true, format: "esm", platform: "node", jsx: "automatic", outfile, packages: "external", logLevel: "error" });
  const mod = await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`);
  const T = buildTimeline(manifest, 30, KY.lines);
  const D = mod.buildDirection(T, KY.anchors);
  for (let f = 0; f < T.frames; f++) {
    const tt = f / 30;
    if (tt >= T.scenes.senses.start && tt < T.scenes.ask.start) assert.equal(D.omegaAt(tt), 0, `сцены 3–7: ротор вращается на ${tt.toFixed(2)} с`);
  }
  const end = T.total - 0.1;
  const p = mod.propAt(T, D, end, mod.teacherBodyAt(T, D, end));
  assert.ok(p.inStand && !p.held && Math.abs(D.omegaAt(end)) > 150, "в конце вертушка у окна и вращается");
  // моменты картинки по якорям — внутри своих реплик
  assert.ok(D.m1 >= T.seg[id(13)].start - 0.5 && D.m1 < D.m2 && D.m2 <= T.seg[id(13)].end, "воспоминания внутри 013");
});
