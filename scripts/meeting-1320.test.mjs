// Проверки BalaGoMeeting1320 (№31 «13:20дагы жолугушуу»): 30 речевых
// сегментов ровно по одному разу и по порядку, роли по префиксу, один голос
// на роль; время в голосе словами, на экране — 13:20, 13:30, 14:30; шкала по
// фактической речи (без наложений и обрезки); финал по правилам проекта
// (AGENTS.md): Бишкек в озвучке и в кадре, ссылка в профиле и WhatsApp
// 0998 08 38 28 в озвучке и на неподвижной карточке ≥ 5 с, после последнего
// слова ≥ 3 с, без выдуманного сайта; заявка только предварительная; BalaGo
// латиницей на экране и «Балаго» в голосе; звук без шагов.
// Запуск: node --test scripts/meeting-1320.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { M13_CONTACT_FRAMES, M13_FINAL_HOLD, M13_LINES, M13_SEG_SPECS, M13_TEXT, M13_VIDEO } from "../src/meeting-1320/script.ts";
import { buildM13Timeline, checkM13Timeline } from "../src/meeting-1320/timing.ts";
import { requireM13Manifest } from "../src/meeting-1320/manifestGuard.ts";

const DIR = join("public", M13_VIDEO.voiceDir);
const ASSETS = join("public", M13_VIDEO.assetDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const ORDER = [
  "N01", "N02", "N03", "N04", "A01", "F01", "N05", "N06", "S01", "S02", "F02", "N07", "N08", "N09", "N10",
  "N11", "N12", "N13", "A02", "F03", "N14", "N15", "N16", "N17", "S03", "N18", "F04", "N19", "N20", "N21",
];
const sourceFiles = (d) => readdirSync(d, { recursive: true }).filter((f) => /\.(tsx?|mjs)$/.test(f)).map((f) => join(d, f));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

test("30 речевых сегментов: каждый ровно один раз, по порядку; роли по префиксу", () => {
  assert.deepEqual(M13_LINES.map((l) => l.id), ORDER);
  assert.deepEqual(M13_SEG_SPECS.map((s) => s.id), ORDER);
  const role = { N: "narrator", A: "assistant", F: "father", S: "son" };
  for (const l of M13_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  // служебные пометки и теги не попадают в текст для озвучки и субтитры
  for (const l of M13_LINES) assert.ok(!/[[\]]|[NAFS]\d\d/.test(l.spoken ?? l.text), l.id);
  for (const l of M13_LINES) assert.ok(!/[[\]]/.test(l.text), l.id);
  // ручное деление субтитров совпадает с текстом реплики
  for (const l of M13_LINES) if (l.subs) assert.equal(l.subs.join(" "), l.text, l.id);
  // ключевые реплики — как в сценарии
  assert.equal(M13_LINES.find((l) => l.id === "A01").text, "Бул жолугушууңузду жылдырсак болобу?");
  assert.equal(M13_LINES.find((l) => l.id === "F03").text, "Ооба. Уулумду мектептен алып кетем.");
  assert.equal(M13_LINES.find((l) => l.id === "F02").text, "Айтып берчи.");
  assert.equal(M13_LINES.find((l) => l.id === "F04").text, "Жаныма отур. Баарын башынан айтып бер.");
});

test("время: в голосе словами, на экране 13:20, 13:30, 14:30", () => {
  for (const l of M13_LINES) assert.ok(!/\d/.test(l.spoken ?? l.text), `${l.id}: цифры в голосе`);
  const say = (id) => M13_LINES.find((l) => l.id === id).text;
  assert.match(say("N01"), /Саат бирден жыйырма мүнөт өткөндө/);
  assert.match(say("N04"), /саат бир жарымда/);
  assert.match(say("F01"), /саат эки жарымды/);
  assert.equal(M13_TEXT.calendar.mystery, "13:20");
  assert.equal(M13_TEXT.calendar.client.time, "13:30");
  assert.equal(M13_TEXT.calendar.proposal.time, "14:30");
  assert.equal(M13_TEXT.clock, "13:20");
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает, конец не обрезан", () => {
  requireM13Manifest(manifest);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
    assert.ok(l.durationSec - l.speechEnd >= 0.05, `${l.id}: конец обрезан`);
    // начало: выравнивание ElevenLabs ставит первую букву в 0, поэтому
    // проверяем саму волну — первые 15 мс тише −50 дБFS (речь не обрезана)
    const pcm = execFileSync("ffmpeg", ["-v", "error", "-i", p, "-t", "0.015", "-ac", "1", "-ar", "44100", "-f", "f32le", "-"]);
    const head = new Float32Array(pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength));
    const rms = Math.sqrt(head.reduce((a, v) => a + v * v, 0) / Math.max(1, head.length));
    assert.ok(20 * Math.log10(rms + 1e-9) < -50, `${l.id}: начало обрезано (${(20 * Math.log10(rms + 1e-9)).toFixed(1)} дБ)`);
  }
});

test("у каждой роли один постоянный голос; четыре разных голоса", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = M13_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
  }
  for (const [role, set] of byRole) assert.equal(set.size, 1, `${role}: ${[...set]}`);
  assert.equal(new Set([...byRole.values()].map((s) => [...s][0])).size, 4);
  // темп и высота тона не менялись: модель и настройки одни для всех
  for (const l of manifest.lines) assert.equal(l.modelId, "eleven_v3", l.id);
});

test("шкала: без наложений, речь внутри сцен; финал с контактами ≥ 5 с, после слова ≥ 3 с", () => {
  const tl = buildM13Timeline(manifest);
  const fps = M13_VIDEO.fps;
  assert.deepEqual(checkM13Timeline(tl), []);
  assert.equal(tl.scenes.at(-1).id, "brand");
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  // контакты видны и неподвижны не меньше 5 с — с реплики о контактах до конца
  assert.ok(tl.frames - tl.contactFrom >= M13_CONTACT_FRAMES, `${tl.frames - tl.contactFrom} кадров`);
  const n20 = tl.cues.find((c) => c.id === "N20");
  assert.ok(tl.contactFrom <= Math.round(n20.from * fps), "контакты появляются к началу N20");
  assert.ok(tl.contactFrom >= tl.scenes.at(-1).from, "карточка — внутри финальной сцены");
  // после последнего слова финальный экран держится не меньше 3 с
  const last = tl.cues.at(-1);
  assert.ok(last.to <= tl.frames / fps - M13_FINAL_HOLD, `${(tl.frames / fps - last.to).toFixed(2)} с после слова`);
  // ориентир 2:15–2:50 (темп речи не меняется ради длительности)
  const sec = tl.frames / fps;
  assert.ok(sec >= 130 && sec <= 185, `${sec} с`);
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
  assert.equal(saved.contactFromFrame, tl.contactFrom);
});

test("финал по правилам проекта: Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28", () => {
  const cta = M13_TEXT.cta;
  assert.equal(cta.brand, "BalaGo");
  assert.equal(cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(cta.whatsappCall, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${cta.whatsappLabel} ${cta.phone}`, "WhatsApp: 0998 08 38 28");
  // озвучка финала: Бишкек и оба действия (номер — на экране, не вслух)
  const say = (id) => M13_LINES.find((l) => l.id === id);
  assert.match(say("N19").spoken ?? say("N19").text, /Бишкектеги балдар үчүн такси/);
  assert.match(say("N20").spoken, /профилдеги шилтемеге өтүңүз/);
  assert.match(say("N20").spoken, /же экрандагы номерге вотсап аркылуу жазыңыз/);
  assert.match(say("N20").text, /же экрандагы номерге WhatsApp аркылуу жазыңыз/);
  assert.match(say("N21").text, /^BalaGo менен жолго чыгалы!$/);
  // карточка выводит все четыре строки и номер из M13_TEXT.cta
  const brand = stripComments(readFileSync("src/meeting-1320/scenes/Brand.tsx", "utf8"));
  for (const k of ["city", "link", "whatsappCall", "whatsappLabel", "phone"]) assert.ok(brand.includes(`{T.${k}}`), `Brand.tsx: T.${k}`);
  // номер нигде не задан вручную — только в M13_TEXT.cta.phone; сайта нет
  const src = [...sourceFiles("src/meeting-1320")].map((f) => stripComments(readFileSync(f, "utf8"))).join("\n");
  assert.equal((src.match(/0998 08 38 28/g) ?? []).length, 1);
  assert.ok(!/wa\.me|https?:\/\/|www\.|\.kg\b|\.com\b/i.test(src + JSON.stringify(M13_TEXT)));
});

test("заявка предварительная: поля формы, без подтверждения, водителя, цен", () => {
  assert.deepEqual(M13_TEXT.form.fields, ["Аты-жөнү", "Дарек", "Мектеп", "Убакыт"]);
  assert.equal(M13_TEXT.form.sent, "Алдын ала өтүнмө жөнөтүлдү");
  const all = JSON.stringify(M13_TEXT);
  assert.ok(!/ырасталды|бекитилди|дайындалды|айдоочу|подтвержд/i.test(all));
  assert.ok(!/сом\b|\$|баа\b|арзандатуу|маршрутк/i.test(all));
});

test("загадка: до школы нет сына, его фото и семейной подписи", () => {
  // подпись «Уулум — мектеп» в календаре — только после раскрытия
  assert.equal(M13_TEXT.calendar.meaning, "Уулум — мектеп");
  for (const f of ["Calendar.tsx", "Notice.tsx", "Ask.tsx", "Drive.tsx"].map((x) => join("src/meeting-1320/scenes", x))) {
    if (!existsSync(f)) continue;
    const s = stripComments(readFileSync(f, "utf8"));
    assert.ok(!/calendar\.meaning|look="m13Son|look=\{"m13Son|Son\b/.test(s), f);
  }
});

test("семейная машина без BalaGo; Volkswagen Polo — только в финале", () => {
  for (const f of sourceFiles("src/meeting-1320/scenes").filter((x) => !/Brand\.tsx$/.test(x))) {
    const s = stripComments(readFileSync(f, "utf8"));
    assert.ok(!/<Polo\b|PoloCar/.test(s), `${f}: Polo только в финале`);
  }
});

test("звук без шагов: эффекты только с видимым действием, музыка своя", () => {
  for (const f of ["src/meeting-1320/M13Audio.tsx", "src/meeting-1320/scenes/sfx.ts"]) {
    if (!existsSync(f)) continue;
    const src = stripComments(readFileSync(f, "utf8"));
    assert.ok(!/footstep|steps?\.mp3|шаг/i.test(src), f);
  }
  if (existsSync(join(ASSETS, "sfx"))) {
    const files = readdirSync(join(ASSETS, "sfx"));
    assert.ok(!files.some((f) => /step|шаг/i.test(f)), files.join(", "));
  }
});

test("кыргызские буквы и бренд: BalaGo латиницей, «Балаго» в голосе", () => {
  assert.equal(M13_TEXT.brand, "BalaGo");
  assert.equal(M13_TEXT.tagline, "Балдар үчүн такси");
  assert.equal(M13_TEXT.title, "13:20дагы жолугушуу");
  const spoken = M13_LINES.map((l) => l.spoken ?? l.text).join(" ");
  assert.ok(!/BalaGo|[A-Za-z]/.test(spoken), "в TTS — только кириллица («Балаго»)");
  assert.ok(/Балаго/.test(spoken));
  assert.ok(/[үөң]/.test(JSON.stringify(M13_TEXT)));
});
