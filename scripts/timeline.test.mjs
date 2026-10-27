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
