import assert from "node:assert/strict";
import { test } from "node:test";
import { NARRATION, SCENE_PLAN, TIMING, VIDEO } from "../src/config.ts";
import {
  buildTimeline,
  estimateManifest,
  speechIntervals,
  wordCue,
} from "../src/timeline.ts";

const fps = VIDEO.fps;

test("оценочный монтаж: все сцены по порядку, длина 25–30 с", () => {
  const t = buildTimeline(estimateManifest(), fps);
  assert.equal(t.scenes.length, SCENE_PLAN.length);
  assert.equal(t.scenes[0].from, 0);
  for (let i = 1; i < t.scenes.length; i++) {
    assert.ok(t.scenes[i].from > t.scenes[i - 1].from, "сцены идут по порядку");
  }
  assert.ok(t.durationInFrames >= TIMING.minSec * fps);
  assert.ok(t.durationInFrames <= TIMING.maxSec * fps);
  // TransitionSeries: сумма длительностей − переходы = длина ролика.
  const sum = t.scenes.reduce((a, s) => a + s.durationInFrames, 0);
  assert.equal(
    sum - TIMING.transitionFrames * (t.scenes.length - 1),
    t.durationInFrames,
  );
});

test("финальный призыв держится после последнего слова", () => {
  const m = estimateManifest();
  const t = buildTimeline(m, fps);
  const lastWord = t.narrationFrom + Math.ceil(m.segments.at(-1).end * fps);
  assert.ok(
    t.durationInFrames - lastWord >= Math.round(TIMING.ctaHoldSec * fps) - 1,
  );
});

test("акцент по слову попадает в свою сцену", () => {
  const t = buildTimeline(estimateManifest(), fps);
  const cue = wordCue(t, "route", "мектепке", -1);
  assert.ok(cue > 0, "слово найдено");
  const scene = t.scenes.find((s) => s.id === "route");
  assert.ok(cue < scene.durationInFrames);
});

test("в фрагментах озвучки нет латинского BalaGo и цифр", () => {
  for (const s of NARRATION.segments) {
    assert.ok(!/BalaGo/i.test(s.text), `«${s.text}» — пишем «БалаГо»`);
    assert.ok(!/\d/.test(s.text), `«${s.text}» — числа словами`);
  }
});

test("без озвучки музыка не приглушается", () => {
  const t = buildTimeline(estimateManifest(), fps);
  assert.deepEqual(speechIntervals(t, fps), []);
});

test("готовая длинная озвучка не обрезается ограничением в 30 секунд", () => {
  const m = estimateManifest();
  m.file = "narration.mp3";
  m.durationSec = 33;
  m.segments.at(-1).end = 32.5;
  assert.throws(() => buildTimeline(m, fps), /речь не обрезаем/);
});

test("готовая озвучка должна оставить время на финальный призыв", () => {
  const m = estimateManifest();
  m.file = "narration.mp3";
  m.durationSec = 29;
  m.segments.at(-1).end = 28.5;
  assert.throws(() => buildTimeline(m, fps), /финальным призывом/);
});

test("учитывается весь аудиофайл, даже если тайминги речи короче", () => {
  const m = estimateManifest();
  m.file = "narration.mp3";
  m.durationSec = 31;
  assert.throws(() => buildTimeline(m, fps), /речь не обрезаем/);
});

// ---------- Второй ролик: BalaGoDriverIntro ----------
import { DRIVER_TEXT, VIDEOS } from "../src/config.ts";

const driver = VIDEOS["driver-intro"];

test("driver-intro: оценочный монтаж собирается в пределах 25–30 с", () => {
  const t = buildTimeline(
    estimateManifest(driver.narration),
    fps,
    driver.scenePlan,
  );
  assert.deepEqual(
    t.scenes.map((s) => s.id),
    driver.scenePlan.map((s) => s.id),
  );
  assert.equal(t.scenes[0].from, 0);
  assert.ok(t.durationInFrames >= TIMING.minSec * fps);
  assert.ok(t.durationInFrames <= TIMING.maxSec * fps);
});

test("driver-intro: все слова-акценты есть в озвучке своей сцены", () => {
  const t = buildTimeline(
    estimateManifest(driver.narration),
    fps,
    driver.scenePlan,
  );
  const cues = [
    ["intro", "Адилет"],
    ["intro", "сапар"],
    ["kids", "жүз"],
    ["kids", "катталуучу"],
    ["cta", "БалаГо"],
    ["cta", "шилтеме"],
    ...DRIVER_TEXT.care.features.map((f) => ["care", f.word]),
  ];
  for (const [scene, word] of cues) {
    assert.ok(wordCue(t, scene, word, -1) >= 0, `«${word}» в сцене ${scene}`);
  }
});

test("driver-intro: отдельная папка озвучки, текст без цифр и латиницы", () => {
  assert.equal(driver.voiceDir, "audio/driver-intro");
  assert.notEqual(driver.voiceDir, VIDEOS.promo.voiceDir);
  for (const s of driver.narration.segments) {
    assert.ok(!/BalaGo/i.test(s.text), s.text);
    assert.ok(!/\d/.test(s.text), s.text);
  }
});

// ---------- Третий ролик: BalaGoHowItWorks ----------
import { HOW_TIMING } from "../src/config.ts";

const how = VIDEOS["how-it-works"];
const howTimeline = () =>
  buildTimeline(
    estimateManifest(how.narration),
    fps,
    how.scenePlan,
    how.timing,
  );

test("how-it-works: сцены по порядку, длина 25–30 с", () => {
  const t = howTimeline();
  assert.deepEqual(
    t.scenes.map((s) => s.id),
    ["steps", "register", "toSchool", "toHome", "cta"],
  );
  assert.ok(t.durationInFrames >= how.timing.minSec * fps);
  assert.ok(t.durationInFrames <= how.timing.maxSec * fps);
});

test("how-it-works: финальный кадр держится ≥ 3 с после последнего слова", () => {
  const t = howTimeline();
  const lastWord =
    t.narrationFrom + Math.ceil(t.manifest.segments.at(-1).end * fps);
  assert.ok(how.timing.ctaHoldSec >= 3);
  assert.ok(t.durationInFrames - lastWord >= 3 * fps);
});

test("how-it-works: слова-акценты на месте", () => {
  const t = howTimeline();
  for (const [scene, word] of [
    ["steps", "үч"],
    ["register", "шилтеме"],
    ["register", "каттаңыз"],
    ["toSchool", "үйдөн"],
    ["toSchool", "жеткиребиз"],
    ["toSchool", "мектепке"],
    ["toHome", "кайра"],
    ["toHome", "келебиз"],
    ["cta", "БалаГо"],
    ["cta", "шилтеме"],
  ]) {
    assert.ok(wordCue(t, scene, word, -1) >= 0, `«${word}» в сцене ${scene}`);
  }
});

test("how-it-works: свои тайминги и папка озвучки, первые ролики не затронуты", () => {
  assert.equal(how.voiceDir, "audio/how-it-works");
  assert.equal(how.timing, HOW_TIMING);
  assert.equal(VIDEOS.promo.timing, TIMING);
  assert.equal(VIDEOS["driver-intro"].timing, TIMING);
  assert.equal(TIMING.ctaHoldSec, 2.8);
  for (const s of how.narration.segments) {
    assert.ok(!/BalaGo/i.test(s.text), s.text);
    assert.ok(!/\d/.test(s.text), s.text);
  }
});

// ---------- Четвёртый ролик: BalaGoMorningRush ----------
import { MORNING_MUSIC, MORNING_TEXT, MORNING_TIMING } from "../src/config.ts";

const morning = VIDEOS["morning-rush"];
const morningTimeline = () =>
  buildTimeline(
    estimateManifest(morning.narration),
    fps,
    morning.scenePlan,
    morning.timing,
  );

test("morning-rush: сцены по порядку, длина 25–30 с", () => {
  const t = morningTimeline();
  assert.deepEqual(
    t.scenes.map((s) => s.id),
    ["alarm", "busy", "launch", "plan", "cta"],
  );
  assert.ok(t.durationInFrames >= morning.timing.minSec * fps);
  assert.ok(t.durationInFrames <= morning.timing.maxSec * fps);
});

test("morning-rush: финальный экран держится ≥ 3 с после последнего слова", () => {
  const t = morningTimeline();
  const lastWord =
    t.narrationFrom + Math.ceil(t.manifest.segments.at(-1).end * fps);
  assert.ok(morning.timing.ctaHoldSec >= 3);
  assert.ok(t.durationInFrames - lastWord >= 3 * fps);
});

test("morning-rush: слова-акценты на месте", () => {
  const t = morningTimeline();
  for (const [scene, word] of [
    ["alarm", "шашып"],
    ["busy", "жумушка"],
    ["busy", "мектепке"],
    ["busy", "жеткириш"],
    ["busy", "мүнөт"],
    ["launch", "БалаГо"],
    ["launch", "ишке"],
    ["plan", "мектепке"],
    ["plan", "үйгө"],
    ["plan", "алдын"],
    ["cta", "алдын"],
    ["cta", "каттаңыз"],
    ["cta", "шилтеме"],
  ]) {
    assert.ok(wordCue(t, scene, word, -1) >= 0, `«${word}» в сцене ${scene}`);
  }
});

test("morning-rush: свои тайминги, папка озвучки и музыка; прежние ролики не затронуты", () => {
  assert.equal(morning.voiceDir, "audio/morning-rush");
  assert.equal(morning.timing, MORNING_TIMING);
  assert.equal(VIDEOS["how-it-works"].timing, HOW_TIMING);
  assert.equal(VIDEOS.promo.voiceDir, "audio/voice");
  assert.notEqual(MORNING_MUSIC.base, "audio/music.mp3");
  assert.ok(
    morning.scenePlan.some((s) => s.id === MORNING_MUSIC.rhythmOutScene),
  );
  for (const s of morning.narration.segments) {
    assert.ok(!/BalaGo/i.test(s.text), s.text);
    assert.ok(!/\d/.test(s.text), s.text);
  }
});

test("morning-rush: надписи на кыргызском, BalaGo — латиницей только в логотипе", () => {
  const texts = JSON.stringify(MORNING_TEXT);
  // Ни цифр (дат, цен, процентов), ни латиницы в надписях.
  assert.ok(!/\d/.test(texts), texts);
  assert.ok(
    !/[A-Za-z]/.test(
      texts.replace(/"[a-z]+":/g, "").replace(/"(work|school|road|home)"/g, ""),
    ),
    texts,
  );
  assert.ok(texts.includes("Ишке киргизүүгө даярданып жатабыз"));
});

// ---------- Пятый ролик: BalaGoFounderStory (60 с) ----------
import {
  FOUNDER_CONTACT,
  FOUNDER_MUSIC,
  FOUNDER_TEXT,
  FOUNDER_TIMING,
} from "../src/config.ts";

const founder = VIDEOS["founder-story"];
const founderTimeline = () =>
  buildTimeline(
    estimateManifest(founder.narration),
    fps,
    founder.scenePlan,
    founder.timing,
  );

test("founder-story: сцены по порядку, ровно 60 с (1800 кадров)", () => {
  const t = founderTimeline();
  assert.deepEqual(
    t.scenes.map((s) => s.id),
    [
      "family",
      "chat",
      "trust",
      "founder",
      "idea",
      "format",
      "prelaunch",
      "contact",
    ],
  );
  assert.equal(t.durationInFrames, 1800);
});

test("founder-story: финальный экран держится ≥ 5 с после последнего слова", () => {
  const t = founderTimeline();
  const lastWord =
    t.narrationFrom + Math.ceil(t.manifest.segments.at(-1).end * fps);
  assert.ok(founder.timing.ctaHoldSec >= 5);
  assert.ok(t.durationInFrames - lastWord >= 5 * fps);
});

test("founder-story: слишком длинная озвучка не обрезается, а останавливает сборку", () => {
  const m = estimateManifest(founder.narration);
  const long = {
    ...m,
    file: "narration.mp3",
    durationSec: 56,
    segments: m.segments.map((s, i, all) =>
      i === all.length - 1 ? { ...s, end: 56 } : s,
    ),
  };
  assert.throws(() =>
    buildTimeline(long, fps, founder.scenePlan, founder.timing),
  );
});

test("founder-story: слова-акценты на месте", () => {
  const t = founderTimeline();
  for (const [scene, word] of [
    ["family", "төрт"],
    ["family", "эч"],
    ["chat", "жумушта"],
    ["chat", "жолдо"],
    ["chat", "баарынын"],
    ["chat", "иши"],
    ["trust", "мектепке"],
    ["trust", "кимге"],
    ["trust", "ишенсе"],
    ["founder", "Адилет"],
    ["founder", "такси"],
    ["founder", "араб"],
    ["idea", "БалаГо"],
    ["idea", "муктаждыктан"],
    ["idea", "ата"],
    ["idea", "пландаштыруу"],
    ["format", "мектепке"],
    ["format", "үйгө"],
    ["prelaunch", "БалаГо"],
    ["prelaunch", "ишке"],
    ["contact", "каттоо"],
    ["contact", "шилтеме"],
    ["contact", "номерге"],
  ]) {
    assert.ok(wordCue(t, scene, word, -1) >= 0, `«${word}» в сцене ${scene}`);
  }
});

test("founder-story: свои тайминги и музыка; общие ограничения прежних роликов не изменились", () => {
  assert.equal(founder.voiceDir, "audio/founder-story");
  assert.equal(founder.timing, FOUNDER_TIMING);
  assert.equal(FOUNDER_TIMING.minSec, 60);
  assert.equal(FOUNDER_TIMING.maxSec, 60);
  assert.equal(TIMING.minSec, 25);
  assert.equal(TIMING.maxSec, 30);
  for (const key of ["promo", "driver-intro", "how-it-works", "morning-rush"]) {
    assert.ok(VIDEOS[key].timing.maxSec <= 30, key);
  }
  for (const layer of FOUNDER_MUSIC.layers) {
    assert.ok(
      founder.scenePlan.some((s) => s.id === layer.from),
      layer.src,
    );
  }
});

test("founder-story: факты и контакты", () => {
  const spoken = founder.narration.segments.map((s) => s.text).join(" ");
  // Четверо ВЗРОСЛЫХ, четыре года в такси, арабский язык детям.
  assert.ok(spoken.includes("төрт чоң киши"));
  assert.ok(spoken.includes("Төрт жылдан бери такси"));
  assert.ok(spoken.includes("араб тилин"));
  assert.ok(!/BalaGo/i.test(spoken));
  assert.ok(!/\d/.test(spoken));
  assert.equal(FOUNDER_CONTACT.phone, "0998 08 38 28");
  assert.equal(FOUNDER_CONTACT.whatsappUrl, "https://wa.me/996998083828");
  const texts = JSON.stringify(FOUNDER_TEXT);
  assert.ok(texts.includes("Үй-бүлөдө төрт чоң киши"));
  assert.ok(texts.includes("Таксиде төрт жылдык тажрыйба"));
  assert.ok(texts.includes("Ишке киргизүүгө даярданып жатабыз"));
  assert.ok(!/\d/.test(texts), "цифры только в номере телефона");
});
