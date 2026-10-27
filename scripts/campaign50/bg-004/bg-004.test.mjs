// Проверки BG-004 до рендера: текст сценария (episodes/05-BG-004.md),
// причинно-следственный порядок сцен, правила AGENTS.md/CLAUDE.md (Бишкек,
// ссылка в профиле и WhatsApp 0998 08 38 28, финал ≥ 5 с и ≥ 3 с после речи),
// отсутствие выдуманных обещаний и цифр, шкала монтажа и озвучка
// (с BG04_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-004/bg-004.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { bg04Beats } from "../../../src/campaign50/bg-004/beats.ts";
import { BG04_LINES, BG04_SCENES, BG04_TEXT, BG04_VIDEO } from "../../../src/campaign50/bg-004/script.ts";
import { buildBg04Timeline, checkBg04Timeline, estimateBg04Manifest } from "../../../src/campaign50/bg-004/timing.ts";

const MANIFEST = `public/${BG04_VIDEO.voiceDir}/manifest.json`;
const all = (l) => `${l.text} ${l.spoken ?? ""}`;
const lineOf = (id) => BG04_LINES.find((l) => l.id === id);

test("реплики дословно из сценария episodes/05-BG-004.md", () => {
  const script = readFileSync("campaigns/balago-50/episodes/05-BG-004.md", "utf8").replace(/\s+/g, " ");
  for (const l of BG04_LINES) assert.ok(script.includes(l.text.replace(/\s+/g, " ")), `${l.id}: нет в сценарии: ${l.text}`);
});

test("порядок: вопрос → день → «күн сайын» → алдын ала уюштуруу → BalaGo → сыноо → CTA", () => {
  assert.deepEqual(
    BG04_SCENES.map((s) => s.id),
    ["hook", "rows", "week", "plan", "trial", "cta"],
  );
  // BalaGo впервые звучит только после осознания повторяемости и решения
  // «алдын ала уюштуруу» (связующее действие), а не в хуке
  const firstBrand = BG04_LINES.findIndex((l) => /BalaGo/.test(l.text));
  assert.equal(BG04_LINES[firstBrand].id, "n05");
  assert.match(lineOf("n03").text, /күн сайын/);
  assert.match(lineOf("n04").text, /алдын ала уюштурууга/);
  const tl = buildBg04Timeline(estimateBg04Manifest());
  const b = bg04Beats(tl);
  assert.ok(b.week.daily < b.plan.grab && b.plan.grab < b.plan.drop && b.plan.drop < b.plan.brand, "курсор переносит маршрут до появления BalaGo");
  assert.ok(b.week.fillFrom < b.week.fillTo, "строки копируются на дни недели");
});

test("полный маршрут и честные условия пробной поездки", () => {
  assert.equal(BG04_TEXT.trial.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG04_TEXT.plan.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.match(lineOf("n05").text, /үйдөн мектепке жана кайра үйгө/);
  assert.match(lineOf("n06").text, /^Ылайыктуу топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз\.$/);
  assert.deepEqual(
    BG04_TEXT.trial.steps.map((s) => s.title),
    ["Арыз", "Топ", "Сыноо"],
  );
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n07");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(cta.spoken, /нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/);
  assert.match(lineOf("n08").text, /BalaGo менен жолго чыгалы!/);
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG04_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("нет выдуманных обещаний, цен и «статистики» времени", () => {
  const text = [...BG04_LINES.map(all), JSON.stringify(BG04_TEXT)].join(" ");
  assert.doesNotMatch(text, /GPS|24\/7|кресло|эртең эле|азыр эле|кепилдик|сертификат|сом\b|саат|мүнөт/iu);
  // значения таблицы — иллюстрация: есть оговорка «Мисал»
  assert.match(BG04_TEXT.sheet.note, /^Мисал:/);
  assert.equal(BG04_TEXT.plan.example, "Мисалы");
});

test("кыргызские буквы ү, ө, ң в надписях и речи", () => {
  const text = [...BG04_LINES.map(all), JSON.stringify(BG04_TEXT)].join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(text.includes(ch), `нет буквы ${ch}`);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи", () => {
  assert.deepEqual(checkBg04Timeline(buildBg04Timeline(estimateBg04Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG04_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG04_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.ok(existsSync(`public/${BG04_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg04Timeline(m);
  assert.deepEqual(checkBg04Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
