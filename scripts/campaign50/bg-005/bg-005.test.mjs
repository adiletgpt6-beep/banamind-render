// Проверки BG-005 до рендера: текст сценария (episodes/06-BG-005.md),
// причинно-следственный порядок сцен, правила AGENTS.md/CLAUDE.md (Бишкек,
// ссылка в профиле и WhatsApp 0998 08 38 28, финал ≥ 5 с и ≥ 3 с после речи),
// отсутствие выдуманных обещаний, шкала монтажа и озвучка
// (с BG05_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-005/bg-005.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { bg05Beats } from "../../../src/campaign50/bg-005/beats.ts";
import { BG05_LINES, BG05_SCENES, BG05_TEXT, BG05_VIDEO, BG05_VOICES } from "../../../src/campaign50/bg-005/script.ts";
import { buildBg05Timeline, checkBg05Timeline, estimateBg05Manifest } from "../../../src/campaign50/bg-005/timing.ts";

const MANIFEST = `public/${BG05_VIDEO.voiceDir}/manifest.json`;
const all = (l) => `${l.text} ${l.spoken ?? ""}`;
const lineOf = (id) => BG05_LINES.find((l) => l.id === id);

test("реплики дословно из сценария episodes/06-BG-005.md", () => {
  const script = readFileSync("campaigns/balago-50/episodes/06-BG-005.md", "utf8").replace(/\s+/g, " ");
  for (const l of BG05_LINES) assert.ok(script.includes(l.text.replace(/\s+/g, " ")), `${l.id}: нет в сценарии: ${l.text}`);
  // финальная реплика сценария целиком = n05 + n06
  assert.ok(script.includes(`${lineOf("n05").text} ${lineOf("n06").text}`));
});

test("порядок: хук → крюк → вопрос мамы и поиск → BalaGo → группа и проба → CTA", () => {
  assert.deepEqual(
    BG05_SCENES.map((s) => s.id),
    ["hook", "detour", "compare", "apply", "group", "cta"],
  );
  // BalaGo впервые звучит только после вопроса мамы (осознание причины)
  const firstBrand = BG05_LINES.findIndex((l) => /BalaGo/.test(l.text));
  assert.equal(BG05_LINES[firstBrand].id, "n03");
  assert.equal(lineOf("m01").role, "mother");
  assert.equal(lineOf("m01").scene, "compare");
  const tl = buildBg05Timeline(estimateBg05Manifest());
  const b = bg05Beats(tl);
  // связующее действие: вопрос → телефон → поиск → нажатие на BalaGo → заявка
  assert.ok(b.compare.speakTo < b.compare.raise && b.compare.raise < b.compare.typeFrom, "мама берёт телефон после вопроса");
  assert.ok(b.compare.typeTo < b.compare.results && b.compare.results < b.compare.tap, "поиск до нажатия");
  assert.ok(b.compare.tap < b.compare.to - 0.3, "нажатие внутри сцены 3");
  assert.ok(b.compare.tap < b.apply.brand, "BalaGo озвучен после выбора мамы");
  // крюк виден до вопроса мамы
  assert.ok(b.detour.leg3[1] < b.compare.from + 0.1);
  // пробная поездка только после подбора группы
  assert.ok(b.group.step1 < b.group.step2 && b.group.step2 <= b.group.carFrom);
});

test("честные условия: группа заранее, 3–4 ребёнка с оговоркой, проба после подбора", () => {
  assert.match(lineOf("n04").text, /^Адегенде ылайыктуу топ тандалат\. Андан кийин биринчи толук сыноо сапары акысыз өтөт\.$/);
  assert.equal(BG05_TEXT.group.size, "3–4 бала");
  assert.match(BG05_TEXT.group.sizeNote, /коопсуздук/);
  assert.match(BG05_TEXT.group.search, /2 жумага чейин/);
  assert.equal(BG05_TEXT.apply.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG05_TEXT.apply.example, "Мисал");
  assert.match(BG05_TEXT.map.note, /Шарттуу/);
});

test("Бишкек и оба способа связи — в озвучке финала", () => {
  const cta = lineOf("n05");
  for (const s of [cta.text, cta.spoken]) {
    assert.match(s, /Бишкек/);
    assert.match(s, /профилдеги шилтемеге өтүңүз/);
    assert.match(s, /WhatsApp|Ватсап/);
  }
  assert.match(cta.text, /0998 08 38 28/);
  assert.match(cta.spoken, /нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/);
  assert.match(lineOf("n06").text, /BalaGo менен жолго чыгалы!/);
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG05_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("нет выдуманных обещаний, цен и еды", () => {
  const text = [...BG05_LINES.map(all), JSON.stringify(BG05_TEXT)].join(" ");
  assert.doesNotMatch(text, /GPS|24\/7|кресло|эртең эле|азыр эле|кепилдик|сертификат|сом\b|саат|мүнөт|тамак|таттуу|шире/iu);
});

test("обращения: ребёнок к родителю только на «сиз» (в ролике дети не говорят)", () => {
  // единственная немая роль — дети; реплики только у диктора и мамы
  assert.deepEqual([...new Set(BG05_LINES.map((l) => l.role))].sort(), ["mother", "narrator"]);
  assert.ok(BG05_VOICES.mother.voiceId && BG05_VOICES.narrator.voiceId);
});

test("кыргызские буквы ү, ө, ң в надписях и речи", () => {
  const text = [...BG05_LINES.map(all), JSON.stringify(BG05_TEXT)].join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(text.includes(ch), `нет буквы ${ch}`);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи", () => {
  assert.deepEqual(checkBg05Timeline(buildBg05Timeline(estimateBg05Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG05_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG05_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG05_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(existsSync(`public/${BG05_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg05Timeline(m);
  assert.deepEqual(checkBg05Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
