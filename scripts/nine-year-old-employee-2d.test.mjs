// Проверки BalaGoNineYearOldEmployee2D: реплики и голоса, шкала по
// фактической речи, контакты ровно в последних 150 кадрах, звук без шагов.
// Запуск: node --test scripts/nine-year-old-employee-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NY2_CONTACT_FRAMES, NY2_LINES, NY2_SEG_SPECS, NY2_TEXT, NY2_VIDEO, NY2_VOICES } from "../src/nine-year-old-employee-2d/script.ts";
import { buildNy2Timeline, checkNy2Timeline } from "../src/nine-year-old-employee-2d/timing.ts";
import { requireNy2Manifest } from "../src/nine-year-old-employee-2d/manifestGuard.ts";

const DIR = join("public", NY2_VIDEO.voiceDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const EXPECTED = [
  ...["N01", "N02", "N03", "N04", "N05", "N06", "N07", "N08"],
  ...["F01", "F02", "F03", "F04", "F05", "F06"],
  ...["S01", "S02", "S03", "S04"],
  ...["M01", "M02", "M03"],
];

test("все реплики на месте, ID уникальны, роли по префиксу", () => {
  const ids = NY2_LINES.map((l) => l.id);
  assert.deepEqual([...ids].sort(), [...EXPECTED].sort());
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(NY2_SEG_SPECS.map((s) => s.id).sort(), [...EXPECTED].sort());
  const role = { N: "narrator", F: "father", S: "son", M: "mother" };
  for (const l of NY2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает", () => {
  requireNy2Manifest(manifest);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
  }
});

test("у каждой роли один постоянный голос; сын — не прежний KG-son", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = NY2_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
  }
  for (const [role, set] of byRole) assert.equal(set.size, 1, `${role}: ${[...set]}`);
  assert.ok(!byRole.get("son").has("Oxj8oi9pAu19zqQOffmM"));
  assert.notDeepEqual(byRole.get("narrator"), byRole.get("father"));
  if (NY2_VOICES.son.voiceId) assert.ok(byRole.get("son").has(NY2_VOICES.son.voiceId));
});

test("шкала: без наложений, речь внутри сцен, контакты — последние 150 кадров", () => {
  const tl = buildNy2Timeline(manifest);
  assert.deepEqual(checkNy2Timeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, NY2_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  // сцены покрывают весь ролик без промежутков
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  for (const c of tl.cues) assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / NY2_VIDEO.fps, `${c.id} заходит в контакты`);
  // S04 не накладывается на N07
  const n07 = tl.cues.find((c) => c.id === "N07");
  const s04 = tl.cues.find((c) => c.id === "S04");
  assert.ok(s04.from >= n07.to + 0.3);
  // timeline.json совпадает с расчётом
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
});

test("номер WhatsApp — только в контактной карточке", () => {
  const number = "0998 08 38 28";
  assert.equal(NY2_TEXT.cta.whatsapp, `WhatsApp: ${number}`);
  const flat = JSON.stringify({ ...NY2_TEXT, cta: null, whatsappUrl: null });
  assert.ok(!flat.includes("0998") && !flat.includes("998083828"));
  const scenes = readdirSync("src/nine-year-old-employee-2d/scenes").filter((f) => f !== "Contact.tsx");
  for (const f of scenes) {
    const src = readFileSync(join("src/nine-year-old-employee-2d/scenes", f), "utf8");
    assert.ok(!src.includes("0998") && !src.includes("cta.whatsapp"), f);
  }
  // номер не произносится
  for (const l of NY2_LINES) assert.ok(!/0998|тогуз жүз/.test(l.spoken ?? l.text), l.id);
});

test("звук без шагов: только эффекты с видимым действием", () => {
  const src = readFileSync("src/nine-year-old-employee-2d/Ny2Audio.tsx", "utf8");
  assert.ok(!/step|footstep|шаг\.mp3/i.test(src.replace(/Шагов нет[^\n]*/g, "")));
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", ""));
  assert.deepEqual(files.sort(), ["car-cabin", "car-door", "laptop-close", "paper", "photo", "tap"]);
  for (const m of ["curious", "office", "quiet", "warm", "focus", "end"]) assert.ok(existsSync(join(DIR, "music", `ny2d-${m}.mp3`)), m);
});

test("кыргызские тексты реквизита и формы", () => {
  assert.equal(NY2_TEXT.letter.title, "АРЫЗ");
  assert.equal(NY2_TEXT.letter.body, "Мага эртерээк кетүүгө уруксат беришиңизди суранам.");
  assert.equal(NY2_TEXT.letter.sign, "Бектур, 9 жаш");
  assert.deepEqual(NY2_TEXT.badge, { name: "Бектур", role: "Жардамчы" });
  assert.equal(NY2_TEXT.form.sent, "Алдын ала арыз жөнөтүлдү");
  assert.equal(NY2_TEXT.form.timeValue, "14:30");
  assert.equal(NY2_TEXT.page.route, "Мектеп → Үй");
});
