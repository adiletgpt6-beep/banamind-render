// Проверки BG-032 до рендера: тарифы (сайт BalaGo, distancePricing.ts),
// утверждённый текст сценария, правила AGENTS.md/CLAUDE.md (Бишкек, ссылка
// в профиле и WhatsApp 0998 08 38 28, финал ≥ 5 с и ≥ 3 с после речи),
// шкала монтажа и озвучка (с BG32_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-032/bg-032.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG32_LINES, BG32_MAX_KM, BG32_TEXT, BG32_TIERS, BG32_VIDEO, priceForKm } from "../../../src/campaign50/bg-032/script.ts";
import { buildBg32Timeline, checkBg32Timeline, estimateBg32Manifest } from "../../../src/campaign50/bg-032/timing.ts";

const MANIFEST = `public/${BG32_VIDEO.voiceDir}/manifest.json`;
const all = (l) => `${l.text} ${l.spoken ?? ""}`;
const lineOf = (id) => BG32_LINES.find((l) => l.id === id);

test("тарифы: границы 7 и 12 км включительно, максимум 20 км", () => {
  assert.deepEqual(
    BG32_TIERS.map((t) => [t.fromKm, t.toKm, t.price]),
    [
      [0, 7, 1000],
      [7, 12, 1200],
      [12, 20, 1500],
    ],
  );
  assert.equal(BG32_MAX_KM, 20);
  assert.equal(priceForKm(1), 1000);
  assert.equal(priceForKm(7), 1000);
  assert.equal(priceForKm(7.1), 1200);
  assert.equal(priceForKm(12), 1200);
  assert.equal(priceForKm(12.1), 1500);
  assert.equal(priceForKm(20), 1500);
  assert.equal(priceForKm(20.1), null);
});

test("цифры в озвучке и в кадре совпадают с тарифами", () => {
  assert.match(lineOf("n02").text, /жети чакырымга чейин.*миң сом/);
  assert.match(lineOf("n03").text, /Жетиден ашып, он эки чакырымга чейин.*миң эки жүз сом/);
  assert.match(lineOf("n04").text, /Он экиден ашып, жыйырма чакырымга чейин.*миң беш жүз сом/);
  assert.deepEqual(
    BG32_TEXT.tiers.map((t) => t.range),
    ["7 кмге чейин", "7ден ашык — 12 кмге чейин", "12ден ашык — 20 кмге чейин"],
  );
  assert.match(BG32_TEXT.over, /20 кмден ашык — азырынча тейленбейт/);
  assert.equal(BG32_TEXT.perChild, "1 бала • 1 толук сапар");
  assert.match(BG32_TEXT.basis, /бир тарапка/);
});

test("одна цена = полный круг ҮЙ → МЕКТЕП → ҮЙ", () => {
  assert.equal(BG32_TEXT.full.title, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.match(lineOf("n05").text, /бир тарапка эмес.*эртең менен мектепке.*сабактан кийин кайра үйгө/);
  assert.match(lineOf("n02").text, /бир толук сапар/);
});

test("утверждённые реплики сценария не изменены", () => {
  const script = readFileSync("campaigns/balago-50/scripts/BG-032.md", "utf8").replace(/\s+/g, " ");
  for (const l of BG32_LINES) assert.ok(script.includes(l.text.replace(/\s+/g, " ")), `${l.id}: нет в сценарии: ${l.text}`);
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n06");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(lineOf("n07").text, /BalaGo менен жолго чыгалы!/);
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG32_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("нет выдуманных обещаний", () => {
  const text = [...BG32_LINES.map(all), JSON.stringify(BG32_TEXT)].join(" ");
  assert.doesNotMatch(text, /дароо|азыр эле|GPS|24\/7|кресло|бардыгы үчүн 1000|акысыз/iu);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи", () => {
  assert.deepEqual(checkBg32Timeline(buildBg32Timeline(estimateBg32Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG32_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG32_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.ok(existsSync(`public/${BG32_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg32Timeline(m);
  assert.deepEqual(checkBg32Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
