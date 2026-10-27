// Тесты TaxiChildLessonsOver: формат 60 с, сцены, текст диктора, надписи,
// шкала по озвучке, защита финального рендера от неполной озвучки.
// Запуск: node --test scripts/taxi-child.test.mjs
// TC_STRICT_VOICE=1 — озвучка обязана быть полной и актуальной (CI render).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { TC_FRAMES, TC_LINES, TC_SCENES, TC_TEXT, TC_VIDEO, TC_VOICE } from "../src/taxi-child/script.ts";
import { buildTcTimeline, checkTcTiming, estimateTcManifest, sceneBeats, subtitleChunks, SUB_MAX_CHARS } from "../src/taxi-child/timing.ts";
import { requireTcManifest } from "../src/taxi-child/manifestGuard.ts";
import { ts2Hash } from "./lib/ts2d-tts.mjs";

const MANIFEST = `public/${TC_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const strict = process.env.TC_STRICT_VOICE === "1";

test("формат: 1080×1920, 30 fps, ровно 60 с (1800 кадров)", () => {
  assert.equal(TC_VIDEO.width, 1080);
  assert.equal(TC_VIDEO.height, 1920);
  assert.equal(TC_VIDEO.fps, 30);
  assert.equal(TC_FRAMES, 1800);
});

test("восемь сцен по сценарию, бюджеты подряд от 0 до 60 с", () => {
  assert.deepEqual(
    TC_SCENES.map((s) => s.id),
    ["hook", "service", "group", "whatsapp", "handoff", "price", "trial", "cta"],
  );
  assert.deepEqual(
    TC_SCENES.map((s) => s.budget),
    [[0, 5], [5, 13], [13, 21], [21, 30], [30, 37], [37, 45], [45, 53], [53, 60]],
  );
});

test("полный текст диктора — дословно по сценарию", () => {
  assert.deepEqual(
    TC_LINES.map((l) => l.text),
    [
      "Сабак бүттү. А сиздин жумуш күнүңүз бүтө элек.",
      "BalaGo — балаңызды үйдөн мектепке, сабактан кийин кайра үйгө жеткирген кызмат.",
      "Жолу жана убактысы дал келген үч-төрт бала чогуу барат. Каттамда — бир эле тааныш айдоочу.",
      "Айдоочу WhatsApp тобуна баланы алганын жана жеткиргенин жазат. Унаанын геолокациясын да көрө аласыз.",
      "Балаңызды сизге же алдын ала макулдашылган адамга гана тапшырабыз.",
      "Үйдөн мектепке, кайра үйгө — бир толук сапар. Бир балага миң сомдон башталат.",
      "Кеминде үч бала чогулганда, биринчи толук күндү акысыз сынап көрүңүз.",
      "Профилдеги шилтеме аркылуу өтүңүз же WhatsApp'ка жазыңыз: 0998 08 38 28.",
    ],
  );
  // по фразе на сцену, по порядку
  assert.deepEqual(TC_LINES.map((l) => l.scene), TC_SCENES.map((s) => s.id));
});

test("произношение: «БалаГо», «Ватсап», числа и номер словами", () => {
  for (const l of TC_LINES) {
    const spoken = l.spoken ?? l.text;
    assert.ok(!/[A-Za-z0-9]/.test(spoken), `${l.id}: в озвучке латиница или цифры: ${spoken}`);
  }
  assert.match(TC_LINES[1].spoken, /^БалаГо/);
  assert.match(TC_LINES[7].spoken, /Ватсапка жазыңыз: нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз\.$/);
  assert.match(TC_LINES[3].spoken, /Ватсап/);
});

test("надписи: BalaGo, цена, условие пробного дня, ссылка в профиле и WhatsApp", () => {
  assert.equal(TC_TEXT.brand, "BalaGo");
  assert.equal(TC_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.match(TC_TEXT.cta.button, /^Профилдеги шилтеме/);
  assert.equal(TC_TEXT.price.main, "1000 сомдон");
  assert.equal(TC_TEXT.price.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(TC_TEXT.trial.free, "АКЫСЫЗ");
  assert.match(TC_TEXT.trial.cond, /кеминде 3 бала/);
  const all = JSON.stringify({ TC_TEXT, TC_LINES });
  assert.ok(!/taxi child|такси чайлд|vercel/i.test(all), "в ролике не должно остаться Taxi Child и адреса сайта");
  // без обещаний немедленного старта, таймеров и гарантий
  assert.ok(!/эртең|таймер|кепилдик/i.test(all));
});

test("оценочная шкала: сцены подряд, ровно 1800 кадров, речь в своей сцене", () => {
  const tl = buildTcTimeline(estimateTcManifest());
  assert.deepEqual(tl.problems, []);
  assert.equal(tl.scenes[0].from, 0);
  assert.equal(tl.scenes.at(-1).to, TC_FRAMES);
  for (let i = 1; i < tl.scenes.length; i++) assert.equal(tl.scenes[i].from, tl.scenes[i - 1].to);
  for (const s of tl.scenes) {
    assert.ok(s.cue.from * 30 >= s.from, `${s.id}: речь раньше сцены`);
    assert.ok(s.cue.to * 30 <= s.to, `${s.id}: речь после сцены`);
  }
});

test("короткая речь — сцены точно по бюджету сценария", () => {
  const lines = TC_LINES.map((l) => ({ id: l.id, durationSec: 3, speechStart: 0.1, speechEnd: 2.6 }));
  const tl = buildTcTimeline({ version: 1, kind: "taxi-child", lines });
  assert.deepEqual(
    tl.scenes.map((s) => s.from / 30),
    TC_SCENES.map((s) => s.budget[0]),
  );
});

test("длинная речь сдвигает границы сцен без ускорения; слишком длинная — ошибка", () => {
  const longer = TC_LINES.map((l, i) => ({ id: l.id, durationSec: 9, speechStart: 0.1, speechEnd: i === 7 ? 7.9 : 6.6 }));
  assert.deepEqual(checkTcTiming(longer), []);
  const tl = buildTcTimeline({ version: 1, kind: "taxi-child", lines: longer });
  assert.ok(tl.scenes.at(-1).cue.to <= 59.31);
  const tooLong = TC_LINES.map((l) => ({ id: l.id, durationSec: 9, speechStart: 0.1, speechEnd: 8.6 }));
  assert.match(checkTcTiming(tooLong).join(";"), /не помещается/);
});

test("ключевые моменты внутри сцен; финал неподвижен последние 4 с", () => {
  const tl = buildTcTimeline(estimateTcManifest());
  for (const s of tl.scenes) {
    const D = s.to - s.from;
    for (const [k, v] of Object.entries(sceneBeats(s))) assert.ok(v >= 0 && v <= D, `${s.id}.${k} = ${v} вне 0…${D}`);
  }
  const cta = tl.scenes.at(-1);
  const b = sceneBeats(cta);
  for (const k of ["link", "wa"]) assert.ok(b[k] + 24 <= cta.to - cta.from - 120, `cta.${k} в последние 4 с`);
});

test("субтитры: фразы не длиннее двух строк", () => {
  for (const l of TC_LINES) for (const c of subtitleChunks(l.text)) assert.ok(c.length <= SUB_MAX_CHARS * 2, `${l.id}: «${c}»`);
});

// ---------- Защита финального рендера ----------
const fixture = () => ({
  version: 1,
  kind: "taxi-child",
  lines: estimateTcManifest().lines.map((ml) => {
    const l = TC_LINES.find((x) => x.id === ml.id);
    return { ...ml, file: `${ml.id}.mp3`, text: l.text, spoken: l.spoken ?? l.text };
  }),
});
const files = () => new Set(TC_LINES.map((l) => `${TC_VIDEO.voiceDir}/${l.id}.mp3`));

test("без озвучки, с оценочной или частичной — финальный рендер остановлен", () => {
  assert.throws(() => requireTcManifest(null), /не создана/);
  assert.throws(() => requireTcManifest(estimateTcManifest()), /неполная/);
  assert.throws(() => requireTcManifest({ ...fixture(), partial: true }), /неполная/);
});

test("нет MP3 или устарел текст — рендер остановлен; полная озвучка допускается", () => {
  const names = files();
  names.delete(`${TC_VIDEO.voiceDir}/n3.mp3`);
  assert.throws(() => requireTcManifest(fixture(), names), /n3: нет MP3/);
  const m = fixture();
  m.lines[0].text = "Башка сөздөр";
  assert.throws(() => requireTcManifest(m, files()), /n1: текст устарел/);
  const ok = fixture();
  assert.equal(requireTcManifest(ok, files()), ok);
});

test("озвучка: полная, актуальная, помещается в 60 с", { skip: !manifest && !strict }, () => {
  assert.ok(manifest, "нет public/audio/taxi-child/manifest.json");
  for (const l of TC_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет в манифесте`);
    assert.ok(existsSync(`public/${TC_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет файла`);
    assert.equal(ml.voiceId, TC_VOICE.voiceId, `${l.id}: другой голос`);
    if (strict) assert.equal(ml.hash, `tc1-${ts2Hash(l, TC_VOICE.voiceId)}`, `${l.id}: озвучка устарела`);
  }
  assert.deepEqual(checkTcTiming(manifest.lines), []);
});
