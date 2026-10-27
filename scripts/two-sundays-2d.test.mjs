// Проверки BalaGoTwoSundays2D: 20 речевых сегментов ровно по одному разу и
// по порядку, один голос на роль, шкала по фактической речи (без
// наложений и обрезки), контакты ровно в последних 150 кадрах (в них
// звучит только N13), номер — только на карточке, календарь из семи
// клеток, звук без шагов. Запуск: node --test scripts/two-sundays-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SU2_CONTACT_FRAMES, SU2_LINES, SU2_SEG_SPECS, SU2_TEXT, SU2_VIDEO } from "../src/two-sundays-2d/script.ts";
import { buildSu2Timeline, checkSu2Timeline } from "../src/two-sundays-2d/timing.ts";
import { requireSu2Manifest } from "../src/two-sundays-2d/manifestGuard.ts";

const DIR = join("public", SU2_VIDEO.voiceDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const ORDER = ["N01", "N02", "M01", "D01", "N03", "N04", "N05", "N06", "N07", "N08", "M02", "D02", "N09", "N10", "N11", "F01", "N12", "D03", "F02", "N13"];

test("20 речевых сегментов: каждый ровно один раз, по порядку; роли по префиксу", () => {
  assert.deepEqual(SU2_LINES.map((l) => l.id), ORDER);
  assert.deepEqual(SU2_SEG_SPECS.map((s) => s.id), ORDER);
  const role = { N: "narrator", M: "mother", D: "daughter", F: "father" };
  for (const l of SU2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  // служебные пометки и теги не попадают в текст для озвучки
  for (const l of SU2_LINES) assert.ok(!/[[\]]|N\d\d|D\d\d/.test(l.spoken ?? l.text), l.id);
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает", () => {
  requireSu2Manifest(manifest);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
    // конец речи не обрезан: после последнего слова в файле есть хвост
    assert.ok(l.durationSec - l.speechEnd >= 0.05, `${l.id}: конец обрезан`);
  }
});

test("у каждой роли один постоянный голос; четыре разных голоса", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = SU2_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
  }
  for (const [role, set] of byRole) assert.equal(set.size, 1, `${role}: ${[...set]}`);
  const ids = [...byRole.values()].map((s) => [...s][0]);
  assert.equal(new Set(ids).size, 4);
});

test("шкала: без наложений, речь внутри сцен, контакты — последние 150 кадров", () => {
  const tl = buildSu2Timeline(manifest);
  assert.deepEqual(checkSu2Timeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, SU2_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  for (const c of tl.cues) {
    if (c.id === "N13") assert.ok(c.from * SU2_VIDEO.fps >= tl.contactFrom, "N13 — только на карточке");
    else assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / SU2_VIDEO.fps, `${c.id} заходит в контакты`);
  }
  // ориентир 2:30–2:50 (темп речи не меняется ради длительности)
  assert.ok(tl.frames / SU2_VIDEO.fps > 140 && tl.frames / SU2_VIDEO.fps < 200);
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
  assert.equal(saved.contactFromFrame, tl.frames - 150);
});

test("номер — только в контактной карточке и не произносится", () => {
  const number = "0998 08 38 28";
  assert.equal(SU2_TEXT.cta.phone, number);
  const flat = JSON.stringify({ ...SU2_TEXT, cta: null });
  assert.ok(!flat.includes("0998"));
  const dirs = ["src/two-sundays-2d/scenes", "src/two-sundays-2d/props", "src/two-sundays-2d/sets"];
  for (const d of dirs)
    for (const f of readdirSync(d).filter((x) => x !== "Contact.tsx")) {
      const src = readFileSync(join(d, f), "utf8");
      assert.ok(!src.includes("0998") && !src.includes("cta.phone"), `${d}/${f}`);
    }
  for (const l of SU2_LINES) assert.ok(!/\d/.test(l.spoken ?? l.text), l.id);
});

test("календарь: ровно семь дней по порядку, среда переименована, воскресенье на месте", () => {
  assert.deepEqual(SU2_TEXT.days, ["Дүйшөмбү", "Шейшемби", "Биздин жекшемби", "Бейшемби", "Жума", "Ишемби", "Жекшемби"]);
  assert.equal(SU2_TEXT.days.filter((d) => /жекшемби/i.test(d)).length, 2);
  const cal = readFileSync("src/two-sundays-2d/props/Calendar.tsx", "utf8");
  assert.match(cal, /Array\.from\(\{ length: 4 \}/);
  assert.match(cal, /Array\.from\(\{ length: 3 \}/);
});

test("заявка предварительная: среда остаётся за папой, без подтверждения поездок", () => {
  const f = SU2_TEXT.form;
  assert.deepEqual(f.days.filter((d) => d.on).map((d) => d.full), ["Дүйшөмбү", "Шейшемби", "Бейшемби", "Жума"]);
  assert.equal(f.dadNote, "Шаршембиде атасы алып келет");
  assert.equal(f.sent, "Өтүнмө жөнөтүлдү");
  const all = JSON.stringify(SU2_TEXT);
  assert.ok(!/бекитилди|дайындалды|айдоочу/i.test(all));
  assert.ok(!/сом\b|\$|баа/i.test(all));
});

test("звук без шагов: эффекты только с видимым действием, музыка своя", () => {
  for (const f of ["src/two-sundays-2d/Su2Audio.tsx", "src/two-sundays-2d/scenes/sfx.ts"]) {
    const src = readFileSync(f, "utf8").replace(/Шагов нет[^\n]*/g, "");
    assert.ok(!/step|footstep/i.test(src), f);
  }
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", ""));
  assert.deepEqual(files.sort(), ["bag", "car-cabin", "car-door", "cutlery", "laptop-close", "magnet", "paper", "pencil", "tap"]);
  for (const m of ["open", "weekday", "wednesday", "quiet", "focus", "end"]) assert.ok(existsSync(join(DIR, "music", `su2d-${m}.mp3`)), m);
});

test("дочка обращается к родителям на «сиз»; в конце — шилтеме и WhatsApp", () => {
  for (const l of SU2_LINES.filter((x) => x.role === "daughter")) {
    // цитата мамы в D02 («айтып бер») — её слова дочке, не обращение дочки
    const own = l.text.replace(/«[^»]*»/g, "");
    assert.ok(!/(^|[^\p{L}])(сен|сага|сени|сенин)([^\p{L}]|$)|сиң([^\p{L}]|$)/iu.test(own), `${l.id}: обращение на «сен»`);
  }
  assert.match(SU2_LINES.find((l) => l.id === "D02").text, /Сиз .* дебейсиз/);
  assert.equal(SU2_TEXT.cta.link, "Профилдин башындагы шилтемеге өтүңүз");
  assert.equal(SU2_TEXT.cta.whatsapp, "же WhatsApp аркылуу жазыңыз:");
});
