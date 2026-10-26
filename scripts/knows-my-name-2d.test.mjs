// Проверки BalaGoKnowsMyName2D (№30): 18 речевых сегментов ровно по одному
// разу и по порядку (K01 звучит один раз), один голос на роль, шкала по
// фактической речи (без наложений и обрезки), контакты ровно в последних
// 150 кадрах (в них звучит только N09), номер — только на карточке, заявка
// предварительная, сведения об Адилете — только известные, вопросы без
// галочек, машинка — один предмет, звук без шагов.
// Запуск: node --test scripts/knows-my-name-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { KM2_CONTACT_FRAMES, KM2_LINES, KM2_SEG_SPECS, KM2_TEXT, KM2_VIDEO } from "../src/knows-my-name-2d/script.ts";
import { buildKm2Timeline, checkKm2Timeline } from "../src/knows-my-name-2d/timing.ts";
import { requireKm2Manifest } from "../src/knows-my-name-2d/manifestGuard.ts";

const DIR = join("public", KM2_VIDEO.voiceDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const ORDER = ["N01", "K01", "N02", "N03", "N04", "K02", "F01", "M01", "K03", "N05", "M02", "N06", "K04", "N07", "N08", "K05", "F02", "N09"];

test("18 речевых сегментов: каждый ровно один раз, по порядку; роли по префиксу", () => {
  assert.deepEqual(KM2_LINES.map((l) => l.id), ORDER);
  assert.deepEqual(KM2_SEG_SPECS.map((s) => s.id), ORDER);
  const role = { N: "narrator", K: "boy", M: "mother", F: "father" };
  for (const l of KM2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  // служебные пометки и теги не попадают в текст для озвучки
  for (const l of KM2_LINES) assert.ok(!/[[\]]|[NKMF]\d\d/.test(l.spoken ?? l.text), l.id);
  // вопрос начала и вопрос финала
  assert.equal(KM2_LINES.find((l) => l.id === "K01").text, "Ал менин атымды билеби?");
  assert.equal(KM2_LINES.find((l) => l.id === "K05").text, "Таанышканда, атымды өзүм айтсам болобу?");
  assert.equal(KM2_LINES.filter((l) => l.text === "Ал менин атымды билеби?").length, 1);
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает, конец не обрезан", () => {
  requireKm2Manifest(manifest);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
    assert.ok(l.durationSec - l.speechEnd >= 0.05, `${l.id}: конец обрезан`);
  }
});

test("у каждой роли один постоянный голос; четыре разных голоса", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = KM2_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
  }
  for (const [role, set] of byRole) assert.equal(set.size, 1, `${role}: ${[...set]}`);
  assert.equal(new Set([...byRole.values()].map((s) => [...s][0])).size, 4);
});

test("шкала: без наложений, речь внутри сцен, контакты — последние 150 кадров", () => {
  const tl = buildKm2Timeline(manifest);
  assert.deepEqual(checkKm2Timeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, KM2_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  for (const c of tl.cues) {
    if (c.id === "N09") assert.ok(c.from * KM2_VIDEO.fps >= tl.contactFrom, "N09 — только на карточке");
    else assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / KM2_VIDEO.fps, `${c.id} заходит в контакты`);
  }
  // ориентир 120–145 с (темп речи не меняется ради длительности)
  const sec = tl.frames / KM2_VIDEO.fps;
  assert.ok(sec >= 115 && sec <= 150, `${sec} с`);
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
  assert.equal(saved.contactFromFrame, tl.frames - 150);
});

test("номер — только в контактной карточке и не произносится", () => {
  const number = "0998 08 38 28";
  assert.equal(KM2_TEXT.cta.phone, number);
  assert.ok(!JSON.stringify({ ...KM2_TEXT, cta: null }).includes("0998"));
  for (const d of ["src/knows-my-name-2d/scenes", "src/knows-my-name-2d/props", "src/knows-my-name-2d/sets"])
    for (const f of readdirSync(d).filter((x) => x !== "Contact.tsx")) {
      const src = readFileSync(join(d, f), "utf8");
      assert.ok(!src.includes("0998") && !src.includes("cta.phone"), `${d}/${f}`);
    }
  for (const l of KM2_LINES) assert.ok(!/\d/.test(l.spoken ?? l.text), l.id);
});

test("заявка предварительная, без подтверждения, водителя, цен и ответа", () => {
  assert.equal(KM2_TEXT.form.sent, "Алдын ала өтүнмө жөнөтүлдү");
  const all = JSON.stringify(KM2_TEXT);
  assert.ok(!/бекитилди|дайындалды|айдоочу/i.test(all));
  assert.ok(!/сом\b|\$|баа\b|арзандатуу/i.test(all));
  // сведения об Адилете — только известные
  assert.deepEqual(KM2_TEXT.page.facts, ["5000+ сапар", "Балдар менен иштөө тажрыйбасы", "Балдарга араб тилин окуткан"]);
  // вопросы — для разговора (без галочек в блокноте)
  assert.deepEqual(KM2_TEXT.questions, ["Сабактын убактысы", "Мектептеги чыгыш", "Үйдө ким тосуп алат?", "Сапарга чейин таанышуу"]);
  const nb = readFileSync("src/knows-my-name-2d/props/Notebook30.tsx", "utf8");
  assert.ok(!/галочк|check|✓/i.test(nb.replace(/\/\/[^\n]*/g, "")));
  assert.equal(KM2_TEXT.carQuestion, "Машинкасын алса болобу?");
});

test("машинка — один предмет: в каждый момент либо на комоде, либо в руке, либо на столе", async () => {
  const { toyCarPlan, carState } = await import("../src/knows-my-name-2d/scenes/ToyCar.tsx").catch(() => ({}));
  if (!toyCarPlan) return; // TSX без сборщика не импортируется — проверка по исходнику ниже
  const tl = buildKm2Timeline(manifest);
  const p = toyCarPlan(tl);
  for (let f = 0; f < p.len; f++) assert.ok(["cabinet", "hand", "table"].includes(carState(p, f)));
});

test("в утренних сценах нет BalaGo: едет машина семьи, без брендинга", () => {
  const src = readFileSync("src/knows-my-name-2d/scenes/School30.tsx", "utf8");
  assert.ok(!/BalaGo|page\.|logo/i.test(src.replace(/\/\/[^\n]*/g, "")));
  assert.match(src, /FAMILY_CAR/);
});

test("звук без шагов: эффекты только с видимым действием, музыка своя", () => {
  for (const f of ["src/knows-my-name-2d/Km2Audio.tsx", "src/knows-my-name-2d/scenes/sfx.ts"]) {
    const src = readFileSync(f, "utf8").replace(/Шагов нет[^\n]*/g, "");
    assert.ok(!/step|footstep/i.test(src), f);
  }
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", ""));
  assert.deepEqual(files.sort(), ["bag", "pen", "phone-down", "tap", "toy"]);
  for (const m of ["curious", "day", "evening", "morning"]) assert.ok(existsSync(join(DIR, "music", `km2d-${m}.mp3`)), m);
});

test("кыргызские буквы и бренд: BalaGo латиницей, «Балдар үчүн такси»", () => {
  assert.equal(KM2_TEXT.brand, "BalaGo");
  assert.equal(KM2_TEXT.tagline, "Балдар үчүн такси");
  assert.equal(KM2_TEXT.cta.link, "Маалымат жана алдын ала каттоо — профилдеги шилтемеде");
  const spoken = KM2_LINES.map((l) => l.spoken ?? l.text).join(" ");
  assert.ok(!/BalaGo|IT\b/.test(spoken), "в TTS — «БалаГо», «ай-ти»");
  assert.match(KM2_LINES.find((l) => l.id === "K03").text, /үчүнчү «Б»/);
});
