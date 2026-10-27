// Тесты BalaGoTwoSchedules2D: шкала 120 с, тексты, озвучка и голоса.
// Запуск: node --test scripts/two-schedules-2d.test.mjs
// TS2_STRICT_VOICE=1 — устаревшие файлы озвучки считаются ошибкой (задача
// render workflow two-schedules-2d.yml, после перегенерации голоса).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  TS2_DIALOG_END,
  TS2_FRAMES,
  TS2_LINES,
  TS2_SCENES,
  TS2_TEXT,
  TS2_VIDEO,
  TS2_VOICES,
} from "../src/two-schedules-2d/script.ts";
import { buildTs2Cues, checkTs2Timing, estimateTs2Manifest } from "../src/two-schedules-2d/timing.ts";
import { ts2Hash, voiceOfRole } from "./lib/ts2d-tts.mjs";

const MANIFEST = `public/${TS2_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const complete = Boolean(manifest && !manifest.partial && manifest.lines?.length === TS2_LINES.length);
const strict = process.env.TS2_STRICT_VOICE === "1";

test("формат: 1080×1920, 30 fps, ровно 120 с (3600 кадров)", () => {
  assert.equal(TS2_VIDEO.id, "BalaGoTwoSchedules2D");
  assert.equal(TS2_VIDEO.width, 1080);
  assert.equal(TS2_VIDEO.height, 1920);
  assert.equal(TS2_VIDEO.fps, 30);
  assert.equal(TS2_FRAMES, 3600);
});

test("девять сцен подряд от 0 до 120 с, финальная карточка ≈ 10 с", () => {
  assert.deepEqual(
    TS2_SCENES.map((s) => s.id),
    ["morning", "trip1", "lunch", "call", "ready", "trip2", "evening", "plan", "cta"],
  );
  assert.equal(TS2_SCENES[0].from, 0);
  for (let i = 1; i < TS2_SCENES.length; i++) assert.equal(TS2_SCENES[i].from, TS2_SCENES[i - 1].to);
  const cta = TS2_SCENES.at(-1);
  assert.equal(cta.to, 120);
  assert.ok(cta.to - cta.from >= 9 && cta.to - cta.from <= 11, `финал ${cta.to - cta.from} с`);
});

test("реплики — по сценарию, в нужном порядке", () => {
  assert.deepEqual(
    TS2_LINES.map((l) => [l.role, l.text]),
    [
      ["father", "Бүгүн балдарды качан алып келесиң?"],
      ["mother", "Уулубузду он экиде, кызыбызды экиде. Ортодо иштеп алам."],
      ["son", "Апа, бүгүн сүрөт тарттык. Кечинде сага көрсөтөм."],
      ["mother", "Көрсөтөсүң. Азыр үйгө барып тамактаналы."],
      ["son", "Апа, сен да тамак ичесиңби?"],
      ["mother", "Бир аздан кийин. Сен жей бер, мен бул ишти бүтүрүп алайын."],
      ["daughter", "Апа, бүгүн сабагыбыз эрте бүттү. Мени алып кетесиңби?"],
      ["mother", "Ооба, кызым. Азыр даярданып, жолго чыгам."],
      ["son", "Биз кайра мектепке барабызбы? Мен чарчадым."],
      ["mother", "Ооба, эжеңди алып келебиз. Анан үйдө эс аласың."],
      ["mother", "Жакындап калдык, кызым. Мугалимиңдин жанында күтүп тур."],
      ["father", "Бүгүн ишиңди бүтүрдүңбү?"],
      ["mother", "Бүтүрө алган жокмун. Бирин алып келсем, кайра экинчисине жөнөдүм. Күнүмдүн көбү жолдо өтүп кетти."],
      ["daughter", "Апа, мен сени шаштырдымбы?"],
      ["mother", "Жок, кызым. Сен күнөөлүү эмессиң. Биз убакытты жакшыраак уюштурушубуз керек."],
      ["mother", "Кел, экөөнүн убактысын жазып, алдын ала арыз калтыралы."],
      ["father", "Маршрутубуз боюнча сүйлөшүп көрөлү."],
      ["narrator", "BalaGo. Балдар үчүн такси. Алдын ала каттоо жүрүп жатат. Профилдеги шилтеме аркылуу балаңызды каттаңыз."],
    ],
  );
  assert.equal(TS2_TEXT.chat.msg, "Апа, сен алыстасыңбы?");
  assert.equal(TS2_TEXT.plan.son, "Уулум — 12:00");
  assert.equal(TS2_TEXT.plan.daughter, "Кызым — 14:00");
  assert.equal(TS2_TEXT.call.contact, "Кызым");
});

const strings = (x) =>
  typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(strings) : [];

test("кыргызские буквы ө, ү, ң — кириллица, без латинских подмен", () => {
  const all = [...TS2_LINES.map((l) => l.spoken ?? l.text), ...strings(TS2_TEXT)].join(" ");
  for (const ch of ["ө", "ү", "ң"]) assert.ok(all.includes(ch), `нет «${ch}»`);
  assert.ok(!/[öüñ]/i.test(all), "латинские ö/ü/ñ вместо ө/ү/ң");
  // латиница допустима только в названии BalaGo
  const latin = all.replace(/BalaGo/g, "").match(/[A-Za-z]+/g);
  assert.equal(latin, null, `латиница: ${latin}`);
});

test("содержание: без цен, дат запуска, гарантий, контактов, WhatsApp и подтверждённых поездок", () => {
  const all = [...TS2_LINES.map((l) => l.text), ...strings(TS2_TEXT)].join("\n").toLowerCase();
  for (const bad of [
    "whatsapp",
    "вотсап",
    "ватсап",
    "wa.me",
    "http",
    "www",
    "сом",
    "баасы",
    "кепилдик",
    "гарант",
    "ырасталды",
    "брондолду",
    "+996",
    "0998",
    "тиркеме",
  ]) {
    assert.ok(!new RegExp(`(^|[^\\p{L}])${bad.replace(".", "\\.")}`, "u").test(all), `найдено «${bad}»`);
  }
  assert.deepEqual(TS2_TEXT.cta, {
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
    route: "ҮЙ → МЕКТЕП → ҮЙ",
    status: "Алдын ала каттоо жүрүп жатат",
    button: "Баланы каттоо",
    link: "Профилдеги шилтеме аркылуу",
  });
  // заявка — предварительная, для обсуждения маршрута
  assert.match(TS2_TEXT.form.sent, /^Алдын ала арыз/);
  assert.match(TS2_TEXT.form.note, /сүйлөшүү/);
});

test("оценочная шкала (без озвучки): реплики не накладываются", { skip: complete && "есть реальная озвучка" }, () => {
  assert.deepEqual(checkTs2Timing(estimateTs2Manifest().lines), []);
});

test("диалог: в своих сценах, без наложений, пауза перед ответом мамы, речь до конца ролика", () => {
  const m = complete ? manifest : estimateTs2Manifest();
  assert.deepEqual(checkTs2Timing(m.lines), []);
  const cues = buildTs2Cues(m);
  for (const c of cues) assert.ok(c.to <= TS2_DIALOG_END, `${c.id} до ${c.to}`);
  const d02 = cues.find((c) => c.id === "d02");
  const m08 = cues.find((c) => c.id === "m08");
  assert.ok(m08.from - d02.to >= 0.8, `пауза ${(m08.from - d02.to).toFixed(2)} с`);
  // финальный голос начинается на карточке
  const n01 = cues.find((c) => c.id === "n01");
  assert.ok(n01.from >= TS2_SCENES.at(-1).from, "голос финала раньше карточки");
});

test("голоса: у каждой роли свой голос проекта", () => {
  const ids = Object.values(TS2_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, ids.length, "один голос — одна роль");
  for (const l of TS2_LINES) assert.ok(voiceOfRole(l.role), `${l.id}: нет голоса роли ${l.role}`);
});

const stale = complete
  ? TS2_LINES.filter((l) => {
      const v = voiceOfRole(l.role);
      const ml = manifest.lines.find((x) => x.id === l.id);
      return !v || !ml || ml.hash !== ts2Hash(l, v.voiceId);
    }).map((l) => l.id)
  : [];
const voiceSkip = !complete
  ? "озвучки ещё нет"
  : stale.length && !strict
    ? `озвучка устарела (${stale.join(", ")}) — перегенерируется в workflow two-schedules-2d.yml`
    : false;

test("файлы озвучки: актуальны, есть тайминги букв и огибающая, без перегруза", { skip: voiceSkip }, () => {
  assert.deepEqual(stale, [], `устаревшие реплики: ${stale.join(", ")}`);
  for (const l of TS2_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(existsSync(`public/${TS2_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.ok(ml.chars?.length > 5, `${l.id}: нет таймингов букв`);
    assert.ok(ml.env?.length >= Math.floor(ml.durationSec * 30), `${l.id}: нет огибающей`);
    assert.ok(ml.peakDb <= -1, `${l.id}: пик ${ml.peakDb} дБFS`);
    assert.ok(ml.speechEnd > ml.speechStart + 0.5, `${l.id}: слишком короткая речь`);
  }
});

test("разборчивость (замер MMS): доля ошибок по буквам ≤ 25 % на реплику", { skip: voiceSkip }, () => {
  for (const ml of manifest.lines) {
    if (typeof ml.asrCer !== "number") continue;
    assert.ok(ml.asrCer <= 0.25, `${ml.id}: CER ${ml.asrCer} («${ml.asrHeard}»)`);
  }
});

test("походка: опорная стопа не скользит, стопа не прыгает между кадрами", async () => {
  const { trackOf, footWorld } = await import("../src/two-schedules-2d/rig/gait.ts");
  const { cruise } = await import("../src/two-schedules-2d/rig/motion.ts");
  const place = (t) => ({ x: 100 + 700 * cruise((t - 20) / 150), y: 1600 + 60 * cruise((t - 20) / 150), h: 700 });
  const stand = (side) => ({ x: side * 40, y: -14 });
  const prev = {};
  let slide = 0;
  let jump = 0;
  for (let f = 0; f <= 200; f++) {
    const tr = trackOf(place, 0, f + 50, 150);
    for (const side of [-1, 1]) {
      const w = footWorld(place, tr, f, side, 150, stand);
      const p = prev[side];
      if (p) {
        const d = Math.hypot(w.x - p.x, w.y - p.y);
        if (w.lift === 0 && p.lift === 0) slide = Math.max(slide, d);
        jump = Math.max(jump, d);
      }
      prev[side] = w;
    }
  }
  assert.ok(slide < 0.05, `скольжение опорной стопы ${slide.toFixed(3)} px`);
  assert.ok(jump < 40, `скачок стопы ${jump.toFixed(1)} px за кадр`);
});
