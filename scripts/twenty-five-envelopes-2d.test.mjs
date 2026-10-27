// Проверки BalaGoTwentyFiveEnvelopes2D (№29): 20 реплик и голоса, шкала по
// фактической речи, 25 конвертов и их состояния, одна записка с новой
// строкой, номер — только в последних 150 кадрах, звук без шагов. Запуск: node --test scripts/twenty-five-envelopes-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TE2_CONTACT_FRAMES,
  TE2_LINES,
  TE2_SEG_SPECS,
  TE2_TEXT,
  TE2_VIDEO,
  TE2_VOICES,
  BEKZAT,
  DESK_STATES,
  EMIR,
  ENVELOPES,
  NOTE,
} from "../src/twenty-five-envelopes-2d/script.ts";
import { modeOf } from "../src/twenty-five-envelopes-2d/script.ts";
import { buildTe2Timeline, checkTe2Timeline } from "../src/twenty-five-envelopes-2d/timing.ts";
import { requireTe2Manifest } from "../src/twenty-five-envelopes-2d/manifestGuard.ts";

const DIR = join("public", TE2_VIDEO.voiceDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const EXPECTED = [
  ...["N01", "N02", "N03", "N04", "N05", "N06", "N07", "N08", "N09"],
  ...["M01", "M02", "M03", "M04", "M05"],
  ...["C01", "C02", "C03", "C04", "C05", "C06"],
];

test("20 реплик: ID уникальны, роли по префиксу, каждая ровно один раз на шкале", () => {
  const ids = TE2_LINES.map((l) => l.id);
  assert.deepEqual([...ids].sort(), [...EXPECTED].sort());
  assert.equal(new Set(ids).size, 20);
  assert.deepEqual(TE2_SEG_SPECS.map((s) => s.id).sort(), [...EXPECTED].sort());
  const role = { N: "narrator", M: "mother", C: "son" };
  for (const l of TE2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  const tl = buildTe2Timeline(manifest);
  for (const id of EXPECTED) assert.equal(tl.cues.filter((c) => c.id === id).length, 1, id);
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает", () => {
  requireTe2Manifest(manifest);
  assert.equal(manifest.lines.length, 20);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
  }
});

test("у каждой роли один постоянный голос из TE2_VOICES, роли различны", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = TE2_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
  }
  for (const [r, set] of byRole) {
    assert.equal(set.size, 1, r);
    assert.ok(set.has(TE2_VOICES[r].voiceId), r);
  }
  assert.equal(new Set(Object.values(TE2_VOICES).map((v) => v.voiceId)).size, 3);
});

test("шкала: без наложений, речь внутри сцен, контакты — последние 150 кадров", () => {
  const tl = buildTe2Timeline(manifest);
  assert.deepEqual(checkTe2Timeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, TE2_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  for (const c of tl.cues) {
    if (c.id === "N09") continue;
    assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / TE2_VIDEO.fps, `${c.id} заходит в контакты`);
  }
  const n09 = tl.cues.find((c) => c.id === "N09");
  assert.ok(n09.from * TE2_VIDEO.fps >= tl.contactFrom && n09.audioFrom + n09.durationSec <= tl.frames / TE2_VIDEO.fps - 0.8);
  // C02 договаривается до M04; C06 заканчивается до финальной паузы
  const c02 = tl.cues.find((c) => c.id === "C02");
  const m04 = tl.cues.find((c) => c.id === "M04");
  assert.ok(m04.from > c02.to + 1.5);
  const c06 = tl.cues.find((c) => c.id === "C06");
  assert.ok(tl.contactFrom / TE2_VIDEO.fps - c06.to >= 1.0, "после C06 — спокойная пауза перед контактами");
  // M02 — чтение записки, C03–C05 — за кадром воспоминаний
  assert.equal(modeOf("M02"), "quoted-reading");
  for (const id of ["N01", "N05", "N09"]) assert.equal(modeOf(id), "narration");
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
});

// ---------- Конверты и записка ----------
test("ровно 25 конвертов одноклассникам: постоянные ID, уникальные имена, раскладка 5×5, Аяна нет", () => {
  assert.equal(ENVELOPES.length, 25);
  assert.equal(new Set(ENVELOPES.map((e) => e.id)).size, 25);
  assert.equal(new Set(ENVELOPES.map((e) => e.name)).size, 25);
  assert.ok(!ENVELOPES.some((e) => /Аян/.test(e.name)));
  assert.deepEqual(new Set(ENVELOPES.map((e) => `${e.row},${e.col}`)).size, 25);
  for (const e of ENVELOPES) assert.ok(e.row >= 0 && e.row < 5 && e.col >= 0 && e.col < 5, e.id);
  assert.equal(EMIR.name, "Эмир");
  assert.equal(BEKZAT.name, "Бекзат");
  assert.equal(BEKZAT.content, "drawing");
  assert.equal(ENVELOPES.filter((e) => e.content === "drawing").length, 1);
});

test("состояния стола: число конвертов не меняется; в финале 24 в коробке и «Эмир» на столе", () => {
  for (const [k, s] of Object.entries(DESK_STATES)) assert.equal(s.onDesk + s.inHand + s.inBox, 25, k);
  assert.equal(DESK_STATES.holdEmir.onDesk, 24);
  assert.equal(DESK_STATES.afterTalk.note, "in-envelope");
  assert.equal(DESK_STATES.afterTalk.drawing, "in-envelope");
  assert.deepEqual(DESK_STATES.final, { onDesk: 1, inHand: 0, inBox: 24, note: "on-desk", drawing: "in-envelope", noteLines: 3 });
});

test("одна записка: благодарность из M02 и новая строка на том же листе", () => {
  const m02 = TE2_LINES.find((l) => l.id === "M02");
  assert.equal(NOTE.lines.join(" "), m02.text);
  assert.equal(NOTE.added, "Эртең сага жаңы комиксимди алып келем.");
  assert.ok(NOTE.added.startsWith("Эртең"));
  // новая строка не озвучивается
  for (const l of TE2_LINES) assert.ok(!l.text.includes("комиксимди"), l.id);
  const box = readFileSync("src/twenty-five-envelopes-2d/scenes/Box.tsx", "utf8");
  assert.ok(box.includes("<NoteSheet added={chars}"), "дописывается тот же NoteSheet");
});

// ---------- Тексты, номер, звук ----------
test("номер WhatsApp — только в контактной карточке и не озвучивается", () => {
  const number = "0998 08 38 28";
  assert.equal(TE2_TEXT.cta.whatsapp, `WhatsApp: ${number}`);
  const flat = JSON.stringify({ ...TE2_TEXT, cta: null, whatsappUrl: null });
  assert.ok(!flat.includes("0998") && !flat.includes("998083828"));
  const dirs = ["src/twenty-five-envelopes-2d/scenes", "src/twenty-five-envelopes-2d/props", "src/twenty-five-envelopes-2d/sets"];
  for (const d of dirs)
    for (const f of readdirSync(d)) {
      if (f === "Contact.tsx") continue;
      const src = readFileSync(join(d, f), "utf8");
      assert.ok(!src.includes("0998") && !src.includes("cta.whatsapp"), `${d}/${f}`);
    }
  for (const l of TE2_LINES) assert.ok(!/0998|тогуз жүз/.test(l.spoken ?? l.text), l.id);
});

test("BalaGo впервые появляется в поиске родителей; заявка — предварительная", () => {
  const tl = buildTe2Timeline(manifest);
  const first = TE2_LINES.findIndex((l) => /BalaGo/.test(l.text));
  assert.equal(TE2_LINES[first].id, "N06");
  assert.ok(tl.scenes.findIndex((s) => s.id === "search") > tl.scenes.findIndex((s) => s.id === "people"));
  assert.equal(TE2_TEXT.form.sent, "Өтүнмө жөнөтүлдү");
  assert.equal(TE2_TEXT.form.sentSub, "Маршрутту талкуулоо үчүн");
  const all = JSON.stringify(TE2_TEXT);
  for (const bad of ["Айдоочу", "бекитилди", "төлөм", " сом", "отзыв", "рейтинг", "http://", "www."]) assert.ok(!all.includes(bad), bad);
  for (const f of readdirSync("src/twenty-five-envelopes-2d/scenes")) {
    if (["Search.tsx", "Form.tsx", "Contact.tsx"].includes(f)) continue;
    assert.ok(!readFileSync(join("src/twenty-five-envelopes-2d/scenes", f), "utf8").includes("TE2_TEXT.brand"), `${f}: бренд раньше поиска`);
  }
});

test("экранные тексты — по-кыргызски (латиница только BalaGo и WhatsApp)", () => {
  const strings = [];
  const walk = (v) => (typeof v === "string" ? strings.push(v) : v && typeof v === "object" && Object.values(v).forEach(walk));
  walk({ ...TE2_TEXT, whatsappUrl: null });
  for (const s of strings) {
    const latin = s.replace(/BalaGo|WhatsApp/g, "").match(/[A-Za-z]+/g);
    assert.equal(latin, null, s);
  }
  assert.equal(TE2_TEXT.search.query, "Бишкек балдар үчүн такси");
  assert.equal(TE2_TEXT.tagline, "Балдар үчүн такси");
  assert.equal(TE2_TEXT.page.route, "Үй → Мектеп → Үй");
});

test("звук без шагов: только эффекты с видимым действием", () => {
  const src = readFileSync("src/twenty-five-envelopes-2d/Te2Audio.tsx", "utf8");
  assert.ok(!/step|footstep/i.test(src));
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", ""));
  assert.deepEqual(files.sort(), ["envelope", "paper", "pen", "tap"]);
  for (const m of ["curious", "office", "quiet", "warm", "focus", "end"]) assert.ok(existsSync(join(DIR, "music", `te2d-${m}.mp3`)), m);
});
