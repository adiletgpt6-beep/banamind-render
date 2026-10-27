// Проверки сценария BalaGoBG026 до рендера (node --test): реплики дословно
// по утверждённому сценарию 27-BG-026.md с согласованными правками
// (handoffs/BG-026.md), Бишкек и оба способа связи в озвучке и на финальном
// экране, номер 0998 08 38 28, обращение на «сиз», честные факты
// (водитель пишет сам, ссылка — не автоматика, порядок топ → сыноо →
// чечим, «Шарттуу мисал»), в тексте для TTS нет латиницы, финал ≥ 5 с с
// контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG26_CONTACTS_IN, BG26_LINES, BG26_TEXT, BG26_VIDEO, BG26_VOICES } from "../../../src/campaign50/bg-026/script.ts";
import { buildBg26Timeline, checkBg26Timeline, estimateBg26Manifest } from "../../../src/campaign50/bg-026/timing.ts";

const MF = `public/${BG26_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG26_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg26Manifest();
const all = BG26_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify(BG26_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const t = (id) => BG26_LINES.find((x) => x.id === id).text;

test("реплики дословно по утверждённому сценарию (с согласованными правками)", () => {
  assert.equal(t("f01"), "Балам азыр кайда экен? Кантип кабар алам?");
  assert.equal(t("n02"), "Балаңызды мектепке жеткирүүнү алдын ала уюштурганда, жолдогу маалыматты кантип аларыңызды да билгиңиз келет.");
  assert.equal(
    t("n03"),
    "Туруктуу сапарлар башталганда, кызматты улантууну тандаган ата-энелер үчүн WhatsApp-группа түзүлөт. Айдоочу жолго чыкканын, баланы алганын жана жеткиргенин өзү жазып билдирет.",
  );
  assert.equal(t("n04"), "Сапар учурунда айдоочу унаа азыр кайда экенин көрсөткөн шилтемени да өзү жөнөтөт. Бул шилтеме — автоматтык түрдө келип турган кабарлама эмес.");
  assert.equal(t("n05"), "Мунун баары ылайыктуу топ түзүлүп, толук сыноо сапарынан кийин кызматты улантсаңыз иштейт. Түшүнүктүү кабар алуу — ата-эне үчүн маанилүү.");
  assert.equal(
    [t("c01"), t("c02"), t("c03")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("части субтитров дословно равны реплике и не длиннее 2 строк", () => {
  for (const l of BG26_LINES) {
    if (!l.subs) continue;
    assert.equal(l.subs.join(" "), l.text, l.id);
    for (const p of l.subs) assert.ok(p.length <= 56, `${l.id}: «${p}» длиннее 2 строк`);
  }
});

test("голоса: отец — KG-husband, диктор — KG-teacher (готовые голоса проекта)", () => {
  assert.equal(BG26_LINES.find((x) => x.id === "f01").role, "father");
  assert.equal(BG26_VOICES.father.name, "KG-husband");
  assert.equal(BG26_VOICES.narrator.name, "KG-teacher");
  for (const l of BG26_LINES) if (l.id !== "f01") assert.equal(l.role, "narrator", l.id);
});

test("текст для TTS без латиницы (БалаГо, вотсап)", () => {
  for (const l of BG26_LINES) assert.doesNotMatch(l.spoken ?? l.text, /[A-Za-z]/, l.id);
  assert.match(all, /балаго/u);
  assert.match(all, /вотсап/u);
});

test("обращение к родителю — только «сиз», без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
  assert.match(all, /аларыңызды|улантсаңыз|өтүңүз|жазыңыз/u);
  assert.match(screen, /сизде/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге өтүңүз/u);
  assert.match(all, /вотсап аркылуу жазыңыз/u);
  assert.match(t("c02"), /же экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG26_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG26_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG26_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG26_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG26_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG26_TEXT.hook.city, "Бишкек");
  assert.equal(BG26_TEXT.cta.slogan, "BalaGo менен жолго чыгалы!");
});

test("честные факты: водитель пишет сам, ссылка не автоматическая, условный пример", () => {
  assert.match(t("n03"), /өзү жазып билдирет/u);
  assert.match(t("n04"), /өзү жөнөтөт/u);
  assert.match(t("n04"), /автоматтык түрдө келип турган кабарлама эмес/u);
  assert.equal(BG26_TEXT.chat.example, "Шарттуу мисал");
  assert.equal(BG26_TEXT.chat.selfNote, "Айдоочу өзү жазат");
  assert.equal(BG26_TEXT.chat.notAuto, "Автоматтык кабарлама эмес");
  assert.match(BG26_TEXT.chat.linkCaption, /айдоочудан/u);
  // FAQ сайта BalaGo: вопрос и официальный ответ (группа — при старте регулярных поездок)
  assert.equal(BG26_TEXT.plan.eyebrow, "Көп берилүүчү суроолор");
  assert.equal(BG26_TEXT.plan.faq[BG26_TEXT.plan.focus], "Ата-энелер сапар тууралуу маалыматты кантип алышат?");
  assert.match(BG26_TEXT.plan.answer, /^Туруктуу сапарлар башталганда, сиз жабык WhatsApp-группага кошуласыз\./u);
  assert.ok(BG26_TEXT.plan.answer.includes(BG26_TEXT.plan.answerKey));
  assert.equal(BG26_TEXT.chat.firstDay, "Туруктуу сапарлардын биринчи күнү");
  assert.equal(BG26_TEXT.order.title, "Алгач топ → толук сыноо → чечим");
  assert.match(JSON.stringify(BG26_TEXT.order.steps), /акысыз/u);
  assert.match(JSON.stringify(BG26_TEXT.order.steps), /3–4 бала/u);
});

test("нет GPS-обещаний, гарантий, еды, 24/7 и «1000 сом для всех»", () => {
  for (const bad of ["gps", "жи-пи-эс", "24/7", "1000 сом", "тамак", "таттуу", "шире", "печенье", "кофе", "чай"]) assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  for (const bad of ["кепилдик", "кепилдейбиз", "сөзсүз", "дароо", "эртең эле"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg26Timeline(manifest);
  assert.deepEqual(checkBg26Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG26_VIDEO.fps;
  assert.ok(end - (cta.from / BG26_VIDEO.fps + BG26_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG26_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  assert.notEqual(manifest.partial, true, "manifest помечен partial");
  for (const l of BG26_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG26_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.spoken, l.spoken ?? l.text, `${l.id}: текст для TTS устарел`);
  }
});
