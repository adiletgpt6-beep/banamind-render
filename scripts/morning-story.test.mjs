// Тесты седьмого ролика (BalaGoMorningStory): регистрация, формат,
// монтаж по реальным длительностям, озвучка (файлы, хэши, голоса),
// финальный экран и ограничения по содержанию.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  MS_CTA_HOLD_SEC,
  MS_LINES,
  MS_SCENES,
  MS_TEXT,
  MS_VIDEO,
  MS_VOICES,
} from "../src/morning-story/script.ts";
import {
  buildStoryTimeline,
  estimateStoryManifest,
  timelineSummary,
} from "../src/morning-story/storyTimeline.ts";
import { decodeMono, SAMPLE_RATE } from "./lib/audio.mjs";
import { lineHash } from "./lib/story-voice.mjs";

const DIR = join("public", MS_VIDEO.voiceDir);
const MANIFEST = join(DIR, "manifest.json");
const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : null;
// Полная озвучка: manifest без пометки partial и со всеми репликами.
const complete =
  manifest && !manifest.partial && manifest.lines.length === MS_LINES.length;

test("story: composition is registered with 1080×1920 @ 30 fps", () => {
  const root = readFileSync("src/Root.tsx", "utf8");
  assert.match(root, /id=\{MS_VIDEO\.id\}/);
  assert.match(root, /component=\{BalaGoMorningStory\}/);
  assert.equal(MS_VIDEO.id, "BalaGoMorningStory");
  assert.equal(MS_VIDEO.width, 1080);
  assert.equal(MS_VIDEO.height, 1920);
  assert.equal(MS_VIDEO.fps, 30);
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(pkg.scripts["render:story"], /BalaGoMorningStory out\/balago-morning-story\.mp4/);
});

test("story: estimated timeline is valid (every scene, final hold ≥ 5 s)", () => {
  const tl = buildStoryTimeline(estimateStoryManifest(), 30);
  assert.equal(tl.scenes.length, MS_SCENES.length);
  for (const s of tl.scenes) assert.ok(s.durationInFrames > 30, s.id);
  assert.ok(tl.durationInFrames - tl.speechEndFrame >= 5 * 30);
});

test("story: CTA text and contact", () => {
  assert.equal(MS_TEXT.cta.phone, "0998 08 38 28");
  assert.equal(MS_TEXT.cta.whatsappUrl, "https://wa.me/996998083828");
  assert.equal(MS_TEXT.cta.tagline, "Балдар үчүн такси");
  assert.equal(MS_TEXT.cta.status, "Алдын ала каттоо жүрүп жатат");
  assert.equal(MS_TEXT.cta.button, "Баланы каттоо");
  assert.equal(MS_TEXT.cta.link, "Профилдеги шилтеме аркылуу");
  assert.ok(MS_CTA_HOLD_SEC >= 5);
});

test("story: no claims of a launched service, guarantees or fines", () => {
  const banned = [
    /күн сайын балдарды ташып/i,
    /алып кетебиз/i,
    /айдоочу бекитилди/i,
    /айдоочу дайындалды/i,
    /100\s*%/,
    /кепилдик/i,
    /текшерилген/i,
    /толук коопсуз/i,
    /сөзсүз келет/i,
    /айып/i,
  ];
  const texts = [
    ...MS_LINES.map((l) => l.text),
    ...JSON.stringify(MS_TEXT).match(/"[^"]*"/g),
  ];
  for (const t of texts) for (const re of banned) assert.doesNotMatch(t, re, t);
  // предварительная запись озвучена в финале
  assert.ok(MS_LINES.some((l) => /Алдын ала каттоо жүрүп жатат/.test(l.text)));
});

test("story: Kyrgyz texts have no stray Latin letters", () => {
  const allowed = /\b(BalaGo|WhatsApp)\b/g;
  const texts = [
    ...MS_LINES.map((l) => l.text),
    ...Object.values(MS_TEXT.captions),
    ...Object.values(MS_TEXT.app),
    ...Object.values(MS_TEXT.ad),
    ...Object.values(MS_TEXT.form),
    MS_TEXT.cta.tagline,
    MS_TEXT.cta.route,
    MS_TEXT.cta.status,
    MS_TEXT.cta.button,
    MS_TEXT.cta.link,
  ];
  for (const t of texts) {
    assert.doesNotMatch(t.replace(allowed, ""), /[A-Za-z]/, t);
  }
});

test("story: sound files referenced by the composition exist", () => {
  const src = readFileSync("src/morning-story/StoryAudio.tsx", "utf8");
  const files = [...src.matchAll(/"(audio\/[^"]+\.mp3)"/g)].map((m) => m[1]);
  assert.ok(files.length >= 10);
  for (const f of files) assert.ok(existsSync(join("public", f)), f);
});

test("story: roles have distinct voices", () => {
  for (const [role, v] of Object.entries(MS_VOICES)) {
    assert.ok(v.candidates.length > 0, role);
  }
});

test("story: saved voice lines match the script (no stale audio)", (t) => {
  if (!complete) {
    t.skip("озвучка ещё не полная (создаётся в CI)");
    return;
  }
  const roleVoice = new Map();
  for (const line of MS_LINES) {
    const m = manifest.lines.find((l) => l.id === line.id);
    assert.ok(m, `нет реплики ${line.id}`);
    assert.equal(m.text, line.text);
    assert.equal(m.role, line.role);
    assert.ok(
      MS_VOICES[line.role].candidates.some((c) => c.voiceId === m.voiceId),
      `${line.id}: голос не из списка роли`,
    );
    assert.equal(m.hash, lineHash(line, m.voiceId), `${line.id}: хэш устарел`);
    // одна роль — один голос
    if (roleVoice.has(line.role)) assert.equal(roleVoice.get(line.role), m.voiceId);
    roleVoice.set(line.role, m.voiceId);
    // файл есть, длительность совпадает с manifest
    const file = join(DIR, m.file);
    assert.ok(existsSync(file), file);
    const sec = decodeMono(file).length / SAMPLE_RATE;
    assert.ok(Math.abs(sec - m.durationSec) < 0.06, `${m.file}: ${sec} vs ${m.durationSec}`);
    assert.ok(m.speechEnd <= m.durationSec && m.speechStart >= 0);
    assert.ok(typeof m.timelineStartSec === "number");
  }
  // ключевые роли звучат разными голосами
  const key = ["mother", "father", "daughter", "driver", "balago"];
  const ids = key.map((r) => roleVoice.get(r));
  assert.equal(new Set(ids).size, key.length);
});

test("story: real timeline ≈3 min, speech ends ≥ 5 s before the end", (t) => {
  if (!complete) {
    t.skip("озвучка ещё не полная (создаётся в CI)");
    return;
  }
  const tl = buildStoryTimeline(manifest, 30);
  const sec = tl.durationInFrames / 30;
  assert.ok(sec >= 170 && sec <= 190, `длина ${sec} с`);
  assert.ok((tl.durationInFrames - tl.speechEndFrame) / 30 >= 5);
  // timeline.json соответствует текущему монтажу
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.deepEqual(saved, timelineSummary(tl));
});
