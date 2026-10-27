// Тесты BalaGoElevenMinutes2D: шкала 120 с, сцены без дыр, реплики и роли,
// этапы поездки (11 → 61 мин), обратный отсчёт до встречи, тексты, голоса.
// EM2_STRICT_VOICE=1 — устаревшая или неполная озвучка считается ошибкой.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  EM2_DIALOG_END,
  EM2_FRAMES,
  EM2_LINES,
  EM2_MEETING_LEFT,
  EM2_SCENES,
  EM2_STAGES,
  EM2_TEXT,
  EM2_TRIP_TOTAL,
  EM2_VIDEO,
  EM2_VOICES,
} from "../src/eleven-minutes-2d/script.ts";
import { buildEm2Cues, checkEm2Timing, estimateEm2Manifest } from "../src/eleven-minutes-2d/timing.ts";
import { em2Hash, voiceOfRole } from "./lib/em2d-tts.mjs";

const MANIFEST = `public/${EM2_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const complete = Boolean(manifest && !manifest.partial && manifest.lines?.length === EM2_LINES.length);
const strict = process.env.EM2_STRICT_VOICE === "1";

test("формат: 1080×1920, 30 fps, ровно 120 с (3600 кадров)", () => {
  assert.equal(EM2_VIDEO.id, "BalaGoElevenMinutes2D");
  assert.equal(EM2_VIDEO.output, "balago-eleven-minutes-2d");
  assert.deepEqual([EM2_VIDEO.width, EM2_VIDEO.height, EM2_VIDEO.fps, EM2_FRAMES], [1080, 1920, 30, 3600]);
});

test("14 сцен подряд, без дыр, от 0 до 120 с (сумма кадров = 3600)", () => {
  assert.equal(EM2_SCENES.length, 14);
  assert.equal(EM2_SCENES[0].from, 0);
  for (let i = 1; i < EM2_SCENES.length; i++) assert.equal(EM2_SCENES[i].from, EM2_SCENES[i - 1].to);
  assert.equal(EM2_SCENES.at(-1).to, 120);
  const frames = EM2_SCENES.reduce((s, sc) => s + Math.round(sc.to * 30) - Math.round(sc.from * 30), 0);
  assert.equal(frames, EM2_FRAMES);
});

test("четыре роли, у каждой свой сохранённый голос; рассказчик ≠ отец ≠ мама", () => {
  assert.deepEqual(Object.keys(EM2_VOICES).sort(), ["daughter", "father", "mother", "narrator"]);
  const ids = Object.values(EM2_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, 4);
  for (const l of EM2_LINES) assert.ok(voiceOfRole(l.role), `${l.id}: нет голоса`);
  assert.equal(new Set(EM2_LINES.map((l) => l.id)).size, EM2_LINES.length, "ID реплик уникальны");
});

test("ключевые реплики — по сценарию", () => {
  const t = Object.fromEntries(EM2_LINES.map((l) => [l.id, l.text]));
  assert.equal(t.n01, "Мектепке чейин — он бир мүнөт. Анда апасы эмнеге бир сааттан ашык убакыт бөлчү?");
  assert.equal(t.m01, "Макул. Бирок көбүрөөк убакыт бөл.");
  assert.equal(t.d01, "Ата, спорттук кийимим класста калыптыр.");
  assert.equal(t.n07, "Кийинки жолугушууга жыйырма мүнөт калды.");
  assert.equal(t.f03, "Эми түшүндүм. Эмнеге бир сааттан ашык убакыт бөлөрүңдү.");
  assert.equal(t.d03, "Ата, мен унаада айтып бүтпөй калдым.");
  assert.equal(t.f04, "Көрсөтчү, кызым. Мен угуп жатам.");
  // реплики идут по порядку сцен и времени
  const order = EM2_SCENES.map((s) => s.id);
  for (let i = 1; i < EM2_LINES.length; i++) {
    assert.ok(EM2_LINES[i].at > EM2_LINES[i - 1].at, `${EM2_LINES[i].id} раньше предыдущей`);
    assert.ok(order.indexOf(EM2_LINES[i].scene) >= order.indexOf(EM2_LINES[i - 1].scene));
  }
});

test("этапы поездки: 11 мин только до школы, накопление монотонно до 61", () => {
  assert.equal(EM2_STAGES[0].label, "Мектепке чейин");
  assert.equal(EM2_STAGES[0].min, 11);
  let sum = 0;
  for (const s of EM2_STAGES) {
    sum += s.min;
    assert.equal(s.total, sum, `${s.id}: накоплено ${s.total}, ожидалось ${sum}`);
  }
  assert.deepEqual(EM2_STAGES.map((s) => s.total), [11, 17, 22, 29, 37, 42, 50, 54, 61]);
  assert.equal(EM2_TRIP_TOTAL, 61);
});

test("обратный отсчёт до встречи 20 → 12 → 8 → 1 согласован с этапами", () => {
  assert.deepEqual(EM2_MEETING_LEFT, { back: 20, home: 12, granny: 8, office: 1 });
  const totalAt = (id) => EM2_STAGES.find((s) => s.id === id).total;
  for (const [id, left] of Object.entries(EM2_MEETING_LEFT)) assert.equal(totalAt(id) + left, 62, `${id}: ${totalAt(id)} + ${left}`);
});

const strings = (x) => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(strings) : []);

test("кыргызские ө, ү, ң кириллицей; латиница — только BalaGo", () => {
  const all = [...EM2_LINES.flatMap((l) => [l.text, l.spoken ?? ""]), ...strings(EM2_TEXT), ...EM2_STAGES.map((s) => s.label)].join(" ");
  for (const ch of ["ө", "ү", "ң"]) assert.ok(all.includes(ch), `нет «${ch}»`);
  assert.ok(!/[öüñ]/i.test(all));
  assert.equal(all.replace(/BalaGo/g, "").match(/[A-Za-z]+/g), null);
});

test("финал и заявка: точный текст, без цен, контактов, WhatsApp, сайта и гарантий", () => {
  assert.deepEqual(EM2_TEXT.cta, {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "Мектеп → Үй",
    call: "Алдын ала арыз калтырыңыз",
    button: "Алдын ала арыз",
    link: "Толук маалымат — профилдеги шилтемеде",
  });
  assert.equal(EM2_TEXT.page.title, "Алдын ала арыз");
  assert.equal(EM2_TEXT.page.sent, "Арыз жөнөтүлдү");
  const all = [...EM2_LINES.map((l) => l.text), ...strings(EM2_TEXT)].join("\n").toLowerCase();
  for (const bad of ["whatsapp", "вотсап", "wa.me", "http", "www", "сом", "баасы", "кепилдик", "гарант", "+996", "0998", "тиркеме", "ырасталды", "брондолду"]) {
    assert.ok(!new RegExp(`(^|[^\\p{L}])${bad}`, "u").test(all), `найдено «${bad}»`);
  }
});

test("оценочная шкала: реплики в своих сценах, без наложений", { skip: complete && "есть реальная озвучка" }, () => {
  assert.deepEqual(checkEm2Timing(estimateEm2Manifest().lines), []);
});

const stale = complete
  ? EM2_LINES.filter((l) => {
      const ml = manifest.lines.find((x) => x.id === l.id);
      return !ml || ml.hash !== em2Hash(l, voiceOfRole(l.role).voiceId);
    }).map((l) => l.id)
  : [];
const voiceSkip = !complete ? "озвучки ещё нет" : stale.length && !strict ? `устарела: ${stale.join(", ")}` : false;

test("озвучка: все реплики актуальны, тайминги букв и огибающая, без перегруза", { skip: voiceSkip }, () => {
  assert.deepEqual(stale, []);
  for (const l of EM2_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(existsSync(`public/${EM2_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.ok(ml.chars?.length > 3 && ml.env?.length >= Math.floor(ml.durationSec * 30), `${l.id}: нет таймингов`);
    assert.ok(ml.peakDb <= -1, `${l.id}: пик ${ml.peakDb}`);
    assert.equal(ml.voiceId, EM2_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
  }
});

test("реальная шкала: без наложений, паузы, речь до финального кадра", { skip: voiceSkip }, () => {
  assert.deepEqual(checkEm2Timing(manifest.lines), []);
  for (const c of buildEm2Cues(manifest)) assert.ok(c.to <= EM2_DIALOG_END, `${c.id} до ${c.to}`);
});

test("разборчивость (MMS): CER ≤ 25 % на реплику", { skip: voiceSkip }, () => {
  for (const ml of manifest.lines) if (typeof ml.asrCer === "number") assert.ok(ml.asrCer <= 0.25, `${ml.id}: CER ${ml.asrCer} («${ml.asrHeard}»)`);
});
