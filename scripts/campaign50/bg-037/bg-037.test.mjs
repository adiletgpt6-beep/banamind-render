// Проверки BG-037 до рендера: утверждённый текст сценария, порядок оплаты
// (группа → бесплатная первая полная проба → решение → оплата), правила
// AGENTS.md/CLAUDE.md (Бишкек, ссылка в профиле и WhatsApp 0998 08 38 28,
// финал ≥ 5 с и ≥ 3 с после речи), шкала монтажа и озвучка
// (с BG37_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-037/bg-037.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG37_LINES, BG37_TEXT, BG37_VIDEO, BG37_VOICES } from "../../../src/campaign50/bg-037/script.ts";
import { buildBg37Timeline, checkBg37Timeline, estimateBg37Manifest } from "../../../src/campaign50/bg-037/timing.ts";

const MANIFEST = `public/${BG37_VIDEO.voiceDir}/manifest.json`;
const lineOf = (id) => BG37_LINES.find((l) => l.id === id);

test("утверждённые реплики сценария не изменены", () => {
  const script = readFileSync("campaigns/balago-50/episodes/37-BG-037.md", "utf8").replace(/\s+/g, " ");
  for (const l of BG37_LINES) assert.ok(script.includes(l.text.replace(/\s+/g, " ")), `${l.id}: нет в сценарии: ${l.text}`);
});

test("роли и голоса: мама, папа, диктор — готовые голоса проекта", () => {
  assert.equal(lineOf("m01").role, "mother");
  assert.equal(lineOf("f02").role, "father");
  for (const id of ["n03", "n04", "n05", "n06", "n07"]) assert.equal(lineOf(id).role, "narrator");
  for (const v of Object.values(BG37_VOICES)) assert.match(v.voiceId, /^[A-Za-z0-9]{20}$/);
});

test("порядок оплаты: подбор → бесплатная проба → решение → оплата", () => {
  assert.match(lineOf("n03").text, /ылайыктуу топ изделет.*төлөмдү да, эртеңки каттамды да билдирбейт/);
  assert.match(lineOf("n04").text, /Топ түзүлгөндө гана биринчи толук сыноо.*акысыз/);
  assert.match(lineOf("n05").text, /чечим сиздики.*андан кийин гана.*төлөйсүз/);
  assert.equal(BG37_TEXT.group.noPay, "Азыр төлөм жок");
  assert.equal(BG37_TEXT.trial.free, "Биринчи сыноо акысыз");
  assert.equal(BG37_TEXT.trial.step, "2. ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG37_TEXT.trial.sample, "Шарттуу мисал");
  assert.equal(BG37_TEXT.decide.step, "3. Чечим → топтом → төлөм");
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n06");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(lineOf("n07").text, /BalaGo менен жолго чыгалы!/);
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG37_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("нет выдуманных обещаний и цифр", () => {
  const text = [...BG37_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`), JSON.stringify(BG37_TEXT)].join(" ");
  assert.doesNotMatch(text, /GPS|24\/7|кресло|кепилдик|\d+\s*сом|\d+\s*%/iu);
  assert.doesNotMatch(text, /(^|[^\p{L}])(сен|сага|сенин|сени)(?=[^\p{L}]|$)/iu);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи", () => {
  assert.deepEqual(checkBg37Timeline(buildBg37Timeline(estimateBg37Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG37_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG37_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG37_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(existsSync(`public/${BG37_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg37Timeline(m);
  assert.deepEqual(checkBg37Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
