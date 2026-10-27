// Проверки BG-041 до рендера: текст сценария (episodes/41-BG-041.md),
// правила AGENTS.md/CLAUDE.md (Бишкек в речи и кадре; ссылка в профиле и
// WhatsApp 0998 08 38 28; финал ≥ 5 с и ≥ 3 с после речи; обращение
// ребёнка к родителям только на «сиз»), факты BalaGo (BRAND_FACTS.md:
// ҮЙ → МЕКТЕП → ҮЙ, группа 3–4 ребёнка, поиск до 2 недель без гарантии,
// бесплатная первая полная проба, оплата после решения), обратная
// хронология сцен, отсутствие выдуманных обещаний, шкала монтажа и
// озвучка (с BG41_STRICT_VOICE=1 — обязательна).
//   node --test scripts/campaign50/bg-041/bg041.test.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { BG41_LINES, BG41_SCENES, BG41_TEXT, BG41_VIDEO, BG41_VOICES } from "../../../src/campaign50/bg-041/script.ts";
import { buildBg41Timeline, checkBg41Timeline, estimateBg41Manifest } from "../../../src/campaign50/bg-041/timing.ts";

const MANIFEST = `public/${BG41_VIDEO.voiceDir}/manifest.json`;
const lineOf = (id) => BG41_LINES.find((l) => l.id === id);
const norm = (s) => s.replace(/\s+/g, " ").trim();
const EPISODE = norm(readFileSync("campaigns/balago-50/episodes/41-BG-041.md", "utf8"));

test("реплики взяты из сценария 41-BG-041.md без изменений и полностью", () => {
  for (const l of BG41_LINES) assert.ok(EPISODE.includes(norm(l.text)), `${l.id}: нет в сценарии: ${l.text}`);
  // все шесть реплик сценария целиком (разбиение только по предложениям)
  const joined = (ids) => ids.map((id) => lineOf(id).text).join(" ");
  const vo = [
    joined(["n01"]),
    joined(["n02"]),
    joined(["n03"]),
    joined(["n04", "n05"]),
    joined(["n06", "n07"]),
    joined(["n08", "n09", "n10"]),
  ];
  for (const v of vo) assert.ok(EPISODE.includes(`«${v}»`), `реплика сценария собрана не целиком: ${v}`);
});

test("субтитры: смысловые фразы (sub) совпадают с текстом сценария и короткие", () => {
  for (const l of BG41_LINES) {
    if (!l.sub) continue;
    assert.equal(norm(l.sub.replace(/\s\|\s/g, " ")), norm(l.text), `${l.id}: sub ≠ text`);
    for (const ph of l.sub.split(" | ")) assert.ok(ph.length <= 34, `${l.id}: длинная фраза «${ph}»`);
    assert.doesNotMatch(l.sub, /алдын \| ала/);
  }
  assert.ok(["n01", "n02", "n03", "n04", "n05", "n06"].every((id) => lineOf(id).sub));
});

test("обратная хронология: следствие → условия → поступок родителя → финал", () => {
  assert.deepEqual(
    BG41_SCENES.map((s) => s.id),
    ["evening", "route", "decision", "group", "start", "cta"],
  );
  // BalaGo называется только в финале, после поступка мамы
  const firstBrand = BG41_LINES.findIndex((l) => /BalaGo/.test(l.text));
  assert.equal(BG41_LINES[firstBrand].scene, "cta");
  assert.ok(BG41_LINES.findIndex((l) => l.id === "n06") < firstBrand);
  assert.match(lineOf("n06").text, /апасы так маалыматты киргизип, кайрылуусун өзү жөнөткөн/);
  assert.equal(BG41_TEXT.start.label, "Башы: так маалымат + өзү жөнөтүү");
  assert.equal(BG41_TEXT.chain[0], "Так маалымат");
  assert.equal(BG41_TEXT.chain[BG41_TEXT.chain.length - 1], "Тынч кеч");
});

test("экранные надписи сценария — на кыргызском", () => {
  for (const s of [
    BG41_TEXT.evening.title,
    BG41_TEXT.badge,
    BG41_TEXT.route.label,
    BG41_TEXT.decision.label,
    BG41_TEXT.decision.choice,
    BG41_TEXT.group.label,
    BG41_TEXT.group.guarantee,
    BG41_TEXT.start.label,
  ])
    assert.ok(EPISODE.includes(s), `надписи «${s}» нет в сценарии`);
  const values = (o) => (typeof o === "string" ? [o] : Object.values(o).flatMap(values));
  const all = values(BG41_TEXT).join(" ").replace(/BalaGo|WhatsApp/g, "");
  assert.doesNotMatch(all, /[a-z]{3,}/i, "латиница только в BalaGo/WhatsApp");
  assert.match(all, /ү/);
  assert.match(all, /ө/);
});

test("обращение ребёнка к родителям — только «сиз» (детских реплик нет)", () => {
  const all = BG41_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ") + JSON.stringify(BG41_TEXT);
  assert.doesNotMatch(all, /(^|[\s,.!?"])(сен|сени|сага|сенин|сенде|сенден)([\s,.!?"]|$)/iu);
  assert.ok(BG41_LINES.every((l) => l.role === "narrator"));
  assert.equal(BG41_VOICES.narrator.name, "KG-teacher");
});

test("Бишкек и оба способа связи — в озвучке финала (точная реплика сценария)", () => {
  const cta = ["n08", "n09", "n10"].map(lineOf);
  assert.equal(
    cta.map((l) => l.text).join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  for (const l of cta) assert.doesNotMatch(l.spoken ?? "", /BalaGo|WhatsApp/, `${l.id}: бренд для TTS кириллицей`);
  assert.match(lineOf("n08").spoken, /Бишкектеги балдар үчүн такси/);
  assert.match(lineOf("n09").spoken, /профилдеги шилтемеге өтүңүз/);
  assert.match(lineOf("n09").spoken, /Ватсап аркылуу жазыңыз/);
  assert.equal(BG41_LINES[BG41_LINES.length - 1].id, "n10");
});

test("финальный экран: город, ссылка в профиле, WhatsApp и полный номер", () => {
  const c = BG41_TEXT.cta;
  assert.equal(c.city, "Бишкек • Балдар үчүн такси");
  assert.equal(c.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(c.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${c.whatsappLabel} ${c.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
  assert.equal(BG41_TEXT.group.city, "Бишкек");
});

test("условия BalaGo соответствуют BRAND_FACTS.md (честно, без обещаний)", () => {
  const d = BG41_TEXT.decision;
  assert.equal(d.trialTitle, "Биринчи толук сыноо сапары");
  assert.equal(d.trialFree, "Акысыз");
  assert.match(d.legMorning, /ҮЙ → МЕКТЕП/);
  assert.match(d.legAfter, /МЕКТЕП → ҮЙ/);
  assert.match(d.pay, /улантууну чечкенден кийин/);
  const g = BG41_TEXT.group;
  assert.match(g.kids, /3–4 бала/);
  assert.match(g.search, /2 жумага чейин/);
  assert.equal(g.guarantee, "Кепилдик жок");
  assert.match(lineOf("n05").text, /кепилдик жок/);
  // заявка — подготовленное сообщение, которое мама отправляет сама
  assert.match(BG41_TEXT.start.button, /WhatsApp аркылуу жөнөтүү/);
  assert.doesNotMatch(JSON.stringify(BG41_TEXT.start), /кабыл алынды|тастыкталды|ырасталды/iu);
});

test("нет выдуманных обещаний, еды и статистики", () => {
  const text = [...BG41_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`), JSON.stringify(BG41_TEXT)].join(" ");
  assert.doesNotMatch(text, /эртеңден баштап|GPS|24\/7|кресло|сертификат|тамак|таттуу|ширин|шире|кепилдиктүү|коопсуздук кепилдиги/iu);
});

test("шкала (оценка без голоса): финал ≥ 8 с, ≥ 3 с после речи, 65–95 с", () => {
  assert.deepEqual(checkBg41Timeline(buildBg41Timeline(estimateBg41Manifest())), []);
});

test("озвучка: актуальна и помещается в шкалу", (t) => {
  if (!existsSync(MANIFEST)) {
    if (process.env.BG41_STRICT_VOICE) assert.fail("нет озвучки");
    t.skip("озвучки ещё нет");
    return;
  }
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  assert.equal(m.partial, false);
  for (const l of BG41_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.ok(ml, `${l.id}: нет файла`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG41_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(existsSync(`public/${BG41_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
  }
  const tl = buildBg41Timeline(m);
  assert.deepEqual(checkBg41Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5, "контакты ≥ 5 с");
});
