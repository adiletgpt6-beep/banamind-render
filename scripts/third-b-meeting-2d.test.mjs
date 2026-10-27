// Проверки BalaGoThirdBMeeting2D — риски именно этой истории: реплики и
// голоса, C01 — один файл дважды, шкала по фактической речи, контакты ровно
// в последних 150 кадрах, звонок завершается до закрытия крышки, подпись
// «Дизайнер — 3 Б» дописана до карточки, звук без шагов, номер только в
// карточке. Запуск: node --test scripts/third-b-meeting-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { T3B_CONTACT_FRAMES, T3B_LINES, T3B_SEG_SPECS, T3B_TEXT, T3B_VIDEO } from "../src/third-b-meeting-2d/script.ts";
import { buildT3bTimeline, checkT3bTimeline } from "../src/third-b-meeting-2d/timing.ts";
import { requireT3bManifest } from "../src/third-b-meeting-2d/manifestGuard.ts";
import { sceneTools } from "../src/third-b-meeting-2d/plan.ts";

const DIR = join("public", T3B_VIDEO.voiceDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const tl = buildT3bTimeline(manifest);
const FPS = T3B_VIDEO.fps;
const EXPECTED = ["C01", "C02", "C03", "N01", "N02", "N03", "N04", "F01", "F02", "F03", "G01", "G02", "G03", ...["M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08", "M09"]];

test("все реплики на месте, ID уникальны, роли по префиксу", () => {
  const ids = T3B_LINES.map((l) => l.id);
  assert.deepEqual([...ids].sort(), [...EXPECTED].sort());
  assert.equal(new Set(ids).size, ids.length);
  const role = { N: "narrator", F: "father", G: "daughter", M: "mother", C: "client" };
  for (const l of T3B_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  // каждая реплика звучит; C01 — дважды (вступление и сцена 9)
  for (const id of EXPECTED) assert.equal(T3B_SEG_SPECS.filter((s) => s.line === id).length, id === "C01" ? 2 : 1, id);
});

test("C01 — один и тот же файл в сценах 1 и 9", () => {
  const c = tl.cues.filter((x) => x.line === "C01");
  assert.equal(c.length, 2);
  assert.deepEqual(c.map((x) => x.scene), ["hook", "joke"]);
  assert.equal(c[0].file, c[1].file);
  assert.equal(c[0].file, "c01.mp3");
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает", () => {
  requireT3bManifest(manifest);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
    // речь не обрезана: после последнего слова в файле есть хвост
    assert.ok(l.durationSec - l.speechEnd >= 0.08, `${l.id}: конец речи у края файла`);
  }
});

test("у каждой роли один постоянный голос; голоса различаются", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const role = T3B_LINES.find((x) => x.id === l.id).role;
    byRole.set(role, (byRole.get(role) ?? new Set()).add(l.voiceId));
  }
  for (const [role, set] of byRole) assert.equal(set.size, 1, `${role}: ${[...set]}`);
  const ids = [...byRole.values()].map((s) => [...s][0]);
  assert.equal(new Set(ids).size, ids.length, "две роли с одним голосом");
});

test("шкала: без наложений, речь внутри сцен, контакты — последние 150 кадров", () => {
  assert.deepEqual(checkT3bTimeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, T3B_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  for (const c of tl.cues) {
    assert.ok(c.audioFrom >= 0 && c.from >= 0, `${c.id}: отрицательное время`);
    assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / FPS, `${c.id} заходит в контакты`);
  }
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
  assert.equal(saved.contactFromFrame, tl.frames - 150);
  // ориентир 2:40–3:00, небольшой выход за 3 минуты допустим
  assert.ok(tl.frames / FPS >= 150 && tl.frames / FPS <= 200, `${tl.frames / FPS} с`);
});

test("звонок: лист поднят до вопроса, клиент говорит до завершения звонка", async () => {
  const { callPlan, liftAt, approvedPlan } = await import("../src/third-b-meeting-2d/scenes/callPlan.ts");
  const c = callPlan(tl);
  // во время вопроса (C01 в сцене 9) лист устойчиво поднят
  for (let t = c.j.c01[0]; t <= c.j.c01[1]; t += 5) assert.equal(liftAt(c, t), 1);
  // до подъёма лист не в кадре; после шутки опущен
  assert.equal(liftAt(c, c.d.lift[0] - 1), 0);
  assert.equal(liftAt(c, c.j.lower[1] + 5), 0);
  // все реплики клиента — до завершения звонка
  const A = sceneTools(tl, "approved");
  const ap = approvedPlan(c.endCall - A.start, A.from("M05"), A.to("M05"));
  const ended = A.start + ap.ended;
  // крышка закрывается после завершения звонка
  assert.ok(ap.close[0] > ap.ended);
  for (const cue of tl.cues.filter((x) => x.role === "client")) assert.ok(cue.to * FPS < ended, `${cue.id} после завершения звонка`);
});

test("финальная подпись дописана до карточки", () => {
  const G = sceneTools(tl, "sign");
  const m09End = G.to("M09");
  // план сцены 14 (scenes/Sign.tsx, signPlan): подпись + 2,5 с удержания
  const close = m09End + 12;
  const creditEnd = close + 36 + 60 + 2 + 14 + 2 + 28 + 12 + 120;
  assert.ok(creditEnd + 75 < G.len, `подпись ${creditEnd} + удержание не помещаются в ${G.len}`);
});

test("номер WhatsApp — только в контактной карточке и не произносится", () => {
  const number = "0998 08 38 28";
  assert.equal(T3B_TEXT.cta.whatsapp, `WhatsApp: ${number}`);
  assert.equal(T3B_TEXT.whatsappUrl, "https://wa.me/996998083828");
  const flat = JSON.stringify({ ...T3B_TEXT, cta: null, whatsappUrl: null });
  assert.ok(!flat.includes("0998") && !flat.includes("998083828"));
  for (const f of readdirSync("src/third-b-meeting-2d/scenes").filter((x) => x !== "Contact.tsx")) {
    const src = readFileSync(join("src/third-b-meeting-2d/scenes", f), "utf8");
    assert.ok(!src.includes("0998") && !src.includes("cta.whatsapp"), f);
  }
  for (const l of T3B_LINES) assert.ok(!/0998|тогуз жүз/.test(l.spoken ?? l.text), l.id);
});

test("звук без шагов: только эффекты с видимым действием", () => {
  const src = readFileSync("src/third-b-meeting-2d/T3bAudio.tsx", "utf8");
  assert.ok(!/step|footstep|шаг\.mp3/i.test(src.replace(/Шагов нет[^\n]*/g, "")));
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", ""));
  assert.deepEqual(files.sort(), ["belt", "call-end", "car-cabin", "car-door", "laptop-close", "paper", "pencil", "photo", "tap"]);
  for (const m of ["curious", "work", "call", "quiet", "road", "focus", "end"]) assert.ok(existsSync(join(DIR, "music", `t3b-${m}.mp3`)), m);
});

test("кыргызские надписи: время 13:30, названия, рисунки, обращение", () => {
  assert.equal(T3B_TEXT.message, "Жолугушууну 13:30га жылдырсак болобу?");
  assert.equal(T3B_TEXT.calendar.school, "Сабактын бүтүшү — 13:30");
  assert.equal(T3B_TEXT.calendar.newTime, "13:30");
  assert.equal(T3B_TEXT.drawingClass, "3 Б");
  assert.equal(T3B_TEXT.signTitle, "АЙКЫН");
  assert.equal(T3B_TEXT.signCredit, "Дизайнер — 3 Б");
  assert.equal(T3B_TEXT.studio, "АЙКЫН");
  assert.equal(T3B_TEXT.client, "БУЛАК");
  assert.equal(T3B_TEXT.page.route, "Мектеп → Үй");
  assert.equal(T3B_TEXT.chat.sent, "Жөнөтүлдү");
  assert.equal(T3B_TEXT.chat.text, "Саламатсызбы! Кызыбызды мектептен үйгө алып келүү боюнча алдын ала маалымат алсак болобу?");
  // «Б» в рисунках — кириллическая
  assert.ok(/^3 Б$/.test(T3B_TEXT.drawingClass));
  // нет «такси»-раскраски и логотипа на семейной машине
  const car = readFileSync("src/third-b-meeting-2d/props/Car.tsx", "utf8");
  assert.ok(!/logo|BalaGo|такси|checker/i.test(car.replace(/^\/\/.*$/gm, "")));
});
