// Проверки сценария BalaGoBG050 до рендера (node --test):
// реплики дословно по 50-BG-050.md, обращение сына к папе на «сиз»,
// Бишкек и оба способа связи в озвучке и на финальном экране, номер
// 0998 08 38 28, честные условия (сначала группа, проба после неё,
// решение потом, без гарантий), финал ≥ 5 с с контактами и ≥ 3 с после
// последнего слова, без еды и выдуманных обещаний, шесть разных голосов.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG50_CONTACTS_IN, BG50_LINES, BG50_TEXT, BG50_VIDEO, BG50_VOICES } from "../../../src/campaign50/bg-050/script.ts";
import { buildBg50Timeline, checkBg50Timeline, estimateBg50Manifest } from "../../../src/campaign50/bg-050/timing.ts";
import { bg50Hash, voiceOfRole } from "./tts.mjs";

const MF = `public/${BG50_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG50_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg50Manifest();
const all = BG50_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const narr = BG50_LINES.filter((l) => l.role === "narrator").map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG50_TEXT).toLowerCase();
const t = (id) => BG50_LINES.find((x) => x.id === id).text;

// Границы слов для кириллицы (\b в JS работает только с латиницей).
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");

test("реплики дословно по сценарию 50-BG-050.md", () => {
  assert.equal(t("n01"), "Мектеп жолун башкача уюштура алсаңыз, убактыңызды эмнеге бөлөт элеңиз?");
  assert.equal(t("a01"), "Жумушумду үзбөй, баштаган ишимди бүтүрөт элем.");
  assert.equal(t("f01"), "Кечинде уулум менен шашпай сүйлөшөт элем.");
  assert.equal(t("s01"), "Ата, мага дагы убакыт бөлөсүзбү?");
  assert.equal(t("b01"), "Өз ишимди өнүктүрүүгө көбүрөөк көңүл бурат элем.");
  assert.equal(t("n02"), "Ар кимдин жообу башка. Бирок күн сайын кайталанган мектеп жолу баарына тааныш.");
  assert.equal(t("c01"), "Анда мен дагы мектеп каттамын алдын ала уюштуруунун жолун издеп көрөйүн.");
  assert.equal(
    t("n03"),
    "BalaGo'до алгач ылайыктуу топ изделет. Топ түзүлсө, биринчи толук сыноо сапары акысыз. Андан кийин чечим сиздики.",
  );
  // финальная реплика сценария — три фразы подряд
  assert.equal(
    [t("n04"), t("n05"), t("n06")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  // порядок реплик как в сценарии
  assert.deepEqual(BG50_LINES.map((l) => l.id), ["n01", "a01", "f01", "s01", "b01", "n02", "c01", "n03", "n04", "n05", "n06"]);
});

test("озвучиваемый текст отличается от титров только написанием BalaGo/WhatsApp", () => {
  for (const l of BG50_LINES) {
    if (!l.spoken) continue;
    const norm = (s) => s.replace(/BalaGo'до/g, "БалаГодо").replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(l.spoken, norm(l.text), l.id);
  }
});

test("субтитры: карточки по смыслу, ≤ 2 строк, вместе — ровно реплика", () => {
  // в хуке и финале субтитров нет: там тот же текст написан в кадре крупно
  for (const l of BG50_LINES.filter((x) => x.scene !== "hook" && x.scene !== "cta")) {
    const cards = l.subs ?? [l.text];
    assert.equal(cards.join(" "), l.text, `${l.id}: subs ≠ text`);
    for (const c of cards) {
      assert.ok(c.length <= 56, `${l.id}: «${c}» длиннее 2 строк`);
      // вспомогательный глагол не отрывается от сказуемого
      assert.doesNotMatch(c, /^(элем|эле|болот|экен)[.!?]?$/u, `${l.id}: «${c}»`);
    }
  }
});

test("сын обращается к папе на «сиз», без «сен»", () => {
  const son = BG50_LINES.filter((x) => x.role === "son");
  assert.equal(son.length, 1);
  for (const l of son) {
    assert.match(l.text, /^Ата,/u, l.id);
    assert.match(l.text, /сүзбү\?$/u, `${l.id}: вежливая форма глагола (бөлөсүзбү)`);
    for (const bad of ["сен", "сага", "сени", "сенин", "бөлөсүңбү", "бөлөсүнбү"]) assert.doesNotMatch(l.text, word(bad), `${l.id}: ${bad}`);
  }
  // и на экране нет обращения на «сен»
  for (const bad of ["сен", "сага", "сени", "сенин"]) assert.doesNotMatch(screen, word(bad), bad);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(narr, /бишкектеги балдар үчүн такси/u);
  assert.match(narr, /профилдеги шилтемеге өтүңүз/u);
  assert.match(narr, /ватсап аркылуу жазыңыз/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG50_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG50_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG50_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG50_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG50_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG50_TEXT.cta.first, "Биринчи кадам өзүңүздөн");
});

test("экранные надписи сценария", () => {
  assert.deepEqual(BG50_TEXT.hook.big, ["УБАКТЫҢЫЗДЫ", "ЭМНЕГЕ", "БӨЛӨТ", "ЭЛЕҢИЗ?"]);
  assert.deepEqual(BG50_TEXT.answers.map((a) => `${a.n}. ${a.label}`), ["1. Ишти аягына чыгаруу", "2. Үй-бүлөгө көңүл буруу", "3. Өз ишине убакыт"]);
  assert.equal(BG50_TEXT.stroke, "ИШИМДИ БҮТҮРӨМ");
  assert.equal(BG50_TEXT.steps.flow, "Алгач топ → акысыз толук сыноо → чечим");
  assert.equal(BG50_TEXT.steps.noGuarantee, "Натыйжа кепил эмес");
  assert.equal(BG50_TEXT.example, "Шарттуу мисал");
});

test("честные условия: группа → проба после неё → решение и оплата потом", () => {
  const n03 = t("n03");
  assert.ok(n03.indexOf("алгач ылайыктуу топ") < n03.indexOf("Топ түзүлсө"));
  assert.ok(n03.indexOf("Топ түзүлсө") < n03.indexOf("акысыз"));
  assert.ok(n03.indexOf("акысыз") < n03.indexOf("чечим сиздики"));
  const s = BG50_TEXT.steps.items;
  assert.match(s[0].note, /3–4 бала/u);
  assert.match(s[0].note, /2 жумага чейин/u);
  assert.match(s[1].note, /топ түзүлгөндөн кийин/u);
  assert.match(s[1].note, /Үй → мектеп → үй/u);
  assert.match(s[2].note, /Төлөм — чечимден кийин/u);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет еды, гарантий, GPS-автоматики, круглосуточной поддержки и цен", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "конфет", "gps", "24/7", "кепилдик", "ар дайым орун", "сом", "%", "саат кайтарат"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("шесть ролей — шесть разных голосов", () => {
  const ids = Object.values(BG50_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, 6);
  for (const l of BG50_LINES) assert.ok(BG50_VOICES[l.role], l.id);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg50Timeline(manifest);
  assert.deepEqual(checkBg50Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG50_VIDEO.fps;
  const contactsFrom = cta.from / BG50_VIDEO.fps + BG50_CONTACTS_IN;
  assert.ok(end - contactsFrom >= 5, `контакты ${end - contactsFrom} с`);
  assert.ok(end - tl.speechEnd >= 3, `после речи ${end - tl.speechEnd} с`);
  // контакты появляются раньше, чем диктор их называет
  const n05 = tl.cues.find((c) => c.id === "n05");
  assert.ok(contactsFrom <= n05.from, "контакты должны быть на экране, когда их называют");
  assert.ok(end >= 60 && end <= BG50_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG50_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG50_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG50_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    // дубль соответствует текущим тексту, тегу, голосу, модели, настройкам и seed
    assert.equal(ml.hash, bg50Hash(l, voiceOfRole(l.role).voiceId), `${l.id}: устаревший дубль (хэш не совпадает)`);
  }
});
