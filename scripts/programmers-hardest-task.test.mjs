// Тесты фильма №35: единый текст реплик, голоса, планировщик монтажа по
// озвучке, субтитры и SRT, экранные надписи. С PHT_STRICT_VOICE=1 —
// озвучка обязана быть полной и актуальной (CI перед финальным рендером).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { PHT_LINES, PHT_SCENES, PHT_TEXT, PHT_TIME, PHT_VIDEO, PHT_VOICES } from "../src/programmers-hardest-task/script.ts";
import { checkPhtPlan, estimatePhtManifest, planPht } from "../src/programmers-hardest-task/timing.ts";
import { chunkLine } from "../src/programmers-hardest-task/subtitleChunks.ts";
import { requirePhtManifest } from "../src/programmers-hardest-task/manifestGuard.ts";
import { phtHash } from "./lib/pht-tts.mjs";

const MANIFEST = `public/${PHT_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.PHT_STRICT_VOICE === "1";
const voiced = existsSync(MANIFEST);
const manifest = voiced ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimatePhtManifest();

test("36 реплик по порядку, роли и сцены по режиссёрской разбивке", () => {
  assert.equal(PHT_LINES.length, 36);
  PHT_LINES.forEach((l, i) => assert.equal(l.id, `vo${String(i + 1).padStart(2, "0")}`));
  const byScene = Object.fromEntries(PHT_SCENES.map((s) => [s.id, PHT_LINES.filter((l) => l.scene === s.id).map((l) => l.id)]));
  assert.deepEqual(byScene.hook, ["vo01", "vo02"]);
  assert.deepEqual(byScene.question, ["vo22", "vo23"]);
  assert.deepEqual(byScene.game, ["vo28", "vo29", "vo30", "vo31"]);
  assert.deepEqual(byScene.cta, ["vo32", "vo33", "vo34", "vo35", "vo36"]);
  const roles = { father: ["vo05", "vo06", "vo07", "vo13", "vo23", "vo27"], mother: ["vo09", "vo14", "vo24", "vo29"], son: ["vo10", "vo22", "vo28", "vo30"] };
  for (const [role, ids] of Object.entries(roles)) assert.deepEqual(PHT_LINES.filter((l) => l.role === role).map((l) => l.id), ids);
});

test("кыргызский текст: кириллица с ү, ө, ң; латиница — только BalaGo и WhatsApp", () => {
  const all = PHT_LINES.map((l) => l.text).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), `нет буквы ${ch}`);
  for (const l of PHT_LINES) {
    const latin = l.text.replace(/BalaGo|WhatsApp/g, "").match(/[A-Za-z]/g);
    assert.equal(latin, null, `${l.id}: латиница в «${l.text}»`);
    if (l.text.includes("BalaGo")) assert.ok((l.spoken ?? "").includes("Балаго"), `${l.id}: BalaGo должен звучать как «Балаго»`);
    // в озвучку не уходят латиница и цифры: TTS читает их ненадёжно
    if (/[A-Za-z0-9]/.test(l.text)) assert.ok(l.spoken && !/[A-Za-z0-9]/.test(l.spoken), `${l.id}: нужна озвучка словами`);
    // слова субтитра ↔ слова озвучки: карта spokenWords сходится по числу слов
    if (l.spokenWords) {
      const textWords = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
      const spokenWords = l.spoken.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
      assert.equal(l.spokenWords.length, textWords, `${l.id}: spokenWords по словам субтитра`);
      assert.equal(l.spokenWords.reduce((a, b) => a + b, 0), spokenWords, `${l.id}: spokenWords по словам озвучки`);
    }
  }
  assert.equal(PHT_LINES.find((l) => l.id === "vo22").text, "Ата, бул колдонмо өзү барып, мени алып келе алабы?");
});

test("четыре различимых голоса, рекламных обещаний нет, контакт в финале", () => {
  const ids = Object.values(PHT_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, 4);
  const screen = JSON.stringify(PHT_TEXT) + PHT_LINES.map((l) => l.text).join(" ");
  for (const bad of ["сом", "кепилдик", "айдоочу дайындалды"]) assert.ok(!screen.includes(bad), `лишнее: ${bad}`);
  // по просьбе заказчика в конце — ссылка в профиле и WhatsApp с номером
  assert.equal(PHT_TEXT.cta.phone, "0998 08 38 28");
  assert.equal(PHT_TEXT.cta.whatsapp, "WhatsApp");
  // фильм заканчивается этой фразой; слоган — перед ней
  const last = PHT_LINES[PHT_LINES.length - 1];
  assert.equal(last.id, "vo36");
  assert.ok(last.text.includes(PHT_TEXT.cta.whatsapp) && last.text.includes(PHT_TEXT.cta.phone), "последняя реплика — не WhatsApp с номером");
  assert.equal(PHT_LINES.find((l) => l.id === "vo35").text, "BalaGo менен жолго чыгалы!");
  // номер больше нигде не встречается (только в финале)
  for (const l of PHT_LINES.filter((x) => x.scene !== "cta")) assert.ok(!l.text.includes("0998") && !l.text.includes("WhatsApp"), l.id);
  assert.equal(PHT_TEXT.form.send, "Алдын ала өтүнмө");
  assert.equal(PHT_TEXT.tasks.item, "Мектепке барып-келүүнү тактоо");
  assert.equal(PHT_TEXT.cta.link, "Шилтеме профилдин башында");
  assert.equal(PHT_TIME.morning, "07:40");
});

test("план монтажа по озвучке: без наложений, целые кадры, финал держится", () => {
  const plan = planPht(manifest);
  assert.deepEqual(checkPhtPlan(plan), []);
  assert.equal(plan.scenes.length, PHT_SCENES.length);
  plan.scenes.forEach((s, i) => {
    assert.ok(Number.isInteger(s.from) && Number.isInteger(s.to) && s.to > s.from, s.id);
    if (i) assert.equal(s.from, plan.scenes[i - 1].to);
  });
  for (const c of plan.cues) assert.ok(Number.isInteger(c.audioFromFrame), c.id);
  const last = plan.cues[plan.cues.length - 1];
  assert.ok(plan.totalFrames / PHT_VIDEO.fps - last.to >= 1.5);
  if (voiced) {
    const sec = plan.totalFrames / PHT_VIDEO.fps;
    assert.ok(sec >= 125 && sec <= 160, `длительность ${sec.toFixed(1)} с`);
    // пауза перед ответом папы на вопрос сына
    const q = plan.cues.find((c) => c.id === "vo22");
    const a = plan.cues.find((c) => c.id === "vo23");
    assert.ok(a.from - q.to >= 0.6, "нет паузы перед ответом папы");
  }
});

test("субтитры: все слова реплики, фрагменты короткие и по порядку", () => {
  const plan = planPht(manifest);
  for (const c of plan.cues) {
    const chunks = chunkLine(c);
    assert.equal(chunks.map((x) => x.words.join(" ")).join(" "), PHT_LINES.find((l) => l.id === c.id).text);
    chunks.forEach((x, i) => {
      assert.ok(x.to > x.from, `${c.id}: пустой фрагмент`);
      assert.ok(x.words.join(" ").length <= 34, `${c.id}: длинный фрагмент «${x.words.join(" ")}»`);
      if (i) assert.ok(x.from >= chunks[i - 1].from);
    });
  }
});

test("озвучка полная и актуальная (строго в CI)", { skip: !strict && "PHT_STRICT_VOICE не задан" }, () => {
  assert.ok(voiced, "нет manifest.json");
  requirePhtManifest(manifest);
  for (const l of PHT_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    const voice = PHT_VOICES[l.role];
    assert.equal(ml.voiceId, voice.voiceId, `${l.id}: не тот голос`);
    assert.equal(ml.hash, phtHash(l, voice.voiceId), `${l.id}: устаревший файл`);
    assert.ok(existsSync(`public/${PHT_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет ${ml.file}`);
    // слова субтитра ↔ слова озвучки: все слова выровнены (иначе цифры
    // номера и субтитры поедут на равномерные тайминги)
    if (l.spokenWords) assert.equal(ml.words.length, l.spokenWords.reduce((a, b) => a + b, 0), `${l.id}: не все слова озвучки выровнены`);
  }
});
