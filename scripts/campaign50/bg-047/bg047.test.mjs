// Проверки текста и шкалы BalaGoBG047 (node --test):
// реплики дословно из сценария, Бишкек в голосе и кадре, оба способа
// связи и полный номер, честные условия (группа, проба, решение родителя,
// не GPS), кыргызские буквы, финал ≥ 5 с и ≥ 3 с после речи, титры.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { captionGroups, captionWords } from "../../../src/campaign50/bg-047/captions.ts";
import { requireBg47Manifest } from "../../../src/campaign50/bg-047/manifestGuard.ts";
import { BG47_CTA_FULL_SEC, BG47_LINES, BG47_TEXT, BG47_VIDEO } from "../../../src/campaign50/bg-047/script.ts";
import { buildBg47Timeline, checkBg47Timeline, estimateBg47Manifest, estimateLine, lineFramesIn, sceneOf } from "../../../src/campaign50/bg-047/timing.ts";
import { applyBeats, fieldsBeats, foundAtOf, HOOK, mismatchBeats, trialBeats } from "../../../src/campaign50/bg-047/beats.ts";

const spoken = (l) => l.spoken ?? l.text;
const all = BG47_LINES.map(spoken).join(" ");
const screen = JSON.stringify(BG47_TEXT);
const EPISODE = "campaigns/balago-50/episodes/47-BG-047.md";

test("реплики дословно из утверждённого сценария", () => {
  if (!existsSync(EPISODE)) return;
  const doc = readFileSync(EPISODE, "utf8");
  for (const l of BG47_LINES) assert.ok(doc.includes(`«${l.text}»`), `${l.id}: «${l.text}» нет в сценарии`);
});

test("никаких обращений на «сен»: только вежливые формы", () => {
  for (const l of BG47_LINES) {
    assert.doesNotMatch(spoken(l), /(^|[\s,])(сен|сага|сени|сенин|сенде|сенден)([\s,.!?]|$)/iu, l.id);
  }
  assert.match(all, /жөнөтөсүз/);
  assert.match(all, /өтүңүз/);
});

test("Бишкек в озвучке и на финальном экране", () => {
  assert.match(all, /Бишкектеги балдар үчүн такси/);
  assert.equal(BG47_TEXT.cta.cityLine, "Бишкек • Балдар үчүн такси");
  assert.deepEqual(BG47_TEXT.cta.city, ["Бишкек", "Балдар үчүн такси"]);
  assert.equal(BG47_TEXT.hook.city, "БИШКЕК");
});

test("финал: ссылка в профиле И WhatsApp, полный номер, слоган", () => {
  const cta = BG47_LINES.find((l) => l.scene === "cta");
  assert.ok(cta);
  assert.equal(
    cta.text,
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  assert.match(spoken(cta), /профилдеги шилтемеге өтүңүз/);
  assert.match(spoken(cta), /Ватсап аркылуу жазыңыз/);
  assert.match(spoken(cta), /БалаГо менен жолго чыгалы!$/);
  assert.equal(BG47_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG47_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG47_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG47_TEXT.apply.chat.number, "+996 998 08 38 28");
});

test("честные условия: группа, проба после группы, решение родителя, не GPS", () => {
  assert.match(BG47_TEXT.trial.group, /3–4/);
  assert.match(BG47_TEXT.mismatch.search, /2 жумага чейин/);
  assert.match(BG47_TEXT.trial.full, /ҮЙ → МЕКТЕП → ҮЙ/);
  assert.match(BG47_TEXT.trial.free, /Биринчи толук сыноо сапары — акысыз/);
  assert.match(all, /Топ түзүлсө, биринчи толук сыноо сапары акысыз/);
  assert.match(all, /ата-эне өзү чечет/);
  // GPS — только в отрицании
  assert.equal(BG47_TEXT.apply.notGps, "Бул GPS көзөмөлү эмес");
  for (const m of (screen + all).matchAll(/GPS|Жи-Пи-Эс/g)) {
    const around = (screen + all).slice(m.index, m.index + 30);
    assert.match(around, /көзөмөлү эмес/, around);
  }
  // кнопка формы — как на сайте; сообщение отправляет сам родитель
  assert.equal(BG47_TEXT.apply.site.button, "Арыз калтыруу");
  assert.doesNotMatch(screen + all, /тамак|таттуу|газ|автокресло|24\/7|кепилдик/i);
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
});

test("шкала по оценке проходит проверку финала", () => {
  const tl = buildBg47Timeline(estimateBg47Manifest());
  assert.deepEqual(checkBg47Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues[tl.cues.length - 1];
  assert.ok(tl.durationSec - cta.from - BG47_CTA_FULL_SEC >= 5);
  assert.ok(tl.durationSec - last.to >= 3);
  assert.equal(tl.frames, Math.round(tl.durationSec * BG47_VIDEO.fps));
});

test("титры: короткие фрагменты, все слова по порядку", () => {
  for (const l of BG47_LINES) {
    const w = captionWords(l.text);
    if (l.captions) assert.equal(l.captions.join(" "), l.text, `${l.id}: фрагменты титров ≠ текст`);
    const ch = captionGroups(l.text, l.captions);
    assert.deepEqual(ch.flat(), w.map((_, i) => i), l.id);
    for (const c of ch) assert.ok(c.map((i) => w[i]).join(" ").length <= 30, `${l.id}: ${c.map((i) => w[i]).join(" ")}`);
  }
});

test("готовая озвучка (если есть) полная и актуальная", () => {
  const path = join("public", BG47_VIDEO.voiceDir, "manifest.json");
  if (!existsSync(path)) return;
  const files = new Set(BG47_LINES.map((l) => `${BG47_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(join("public", f))));
  requireBg47Manifest(JSON.parse(readFileSync(path, "utf8")), files);
});

// Озвучка с речью быстрее/медленнее оценки (k — множитель времени).
const scaledTimeline = (k) =>
  buildBg47Timeline({
    version: 1,
    kind: "bg047",
    lines: BG47_LINES.map((l) => {
      const e = estimateLine(l);
      const sc = (t) => t * k;
      return { ...e, file: `${l.id}.mp3`, durationSec: sc(e.durationSec), speechStart: sc(e.speechStart), speechEnd: sc(e.speechEnd), words: e.words.map((w) => ({ ...w, start: sc(w.start), end: sc(w.end) })) };
    }),
  });

const ascending = (name, xs) => {
  for (let i = 1; i < xs.length; i++) assert.ok(xs[i] > xs[i - 1], `${name}: событие ${i} (${xs[i]}) не позже ${i - 1} (${xs[i - 1]}) — ${xs.join(", ")}`);
};

test("события сцен по порядку и успевают до конца сцены при любой скорости речи", () => {
  for (const k of [0.6, 0.8, 1, 1.25, 1.5]) {
    const tl = scaledTimeline(k);
    assert.deepEqual(checkBg47Timeline(tl), [], `k=${k}`);
    const len = (id) => Math.round((sceneOf(tl, id).to - sceneOf(tl, id).from) * BG47_VIDEO.fps);
    const d1 = lineFramesIn(tl, "d1");
    assert.ok(HOOK.land < d1.from + 4, `k=${k}: точка говорит до приземления`);
    assert.ok(d1.to + 14 < len("hook"), `k=${k}: хук`);
    const fb = fieldsBeats(tl);
    ascending(`поля k=${k}`, [fb.flip, fb.home, fb.school, fb.write, fb.writeEnd, fb.route, fb.glow, len("fields") - 20]);
    const mb = mismatchBeats(tl);
    ascending(`гости k=${k}`, [mb.arrive, mb.link, mb.tags, mb.neq, mb.leave, mb.lens, foundAtOf(mb, 1), foundAtOf(mb, 0), mb.lensEnd + 16, len("mismatch")]);
    assert.ok(mb.wave < mb.lens && mb.leave + 30 < mb.lens, `k=${k}: взгляд/прощание героя пересекаются с лупой`);
    assert.ok(mb.guestWave + 10 < mb.leave, `k=${k}: гости не успевают помахать`);
    assert.ok(mb.leave + 90 < len("mismatch"), `k=${k}: гости не успевают уйти`);
    const ab = applyBeats(tl);
    ascending(`заявка k=${k}`, [...ab.fills, ab.submit, ab.chat, ab.send, ab.sent, ab.gps, ab.back, len("apply") - 18]);
    const tb = trialBeats(tl);
    ascending(`проба k=${k}`, [tb.gather, tb.formed, tb.pop, tb.board, tb.go, tb.atSchool, tb.back, tb.atHome, tb.meet, len("trial") - 16]);
    assert.ok(tb.decide + 8 < len("trial"), `k=${k}: «чечим» не успевает`);
    if (k >= 0.8) assert.ok(tb.decide - tb.said <= (k >= 1 ? 12 : 45), `k=${k}: «чечим» загорается через ${tb.decide - tb.said} кадров после «өзү»`);
  }
});
