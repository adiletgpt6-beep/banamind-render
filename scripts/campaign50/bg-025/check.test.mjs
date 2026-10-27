// Проверки сценария BalaGoBG025 до рендера (node --test): реплики дословно
// по 26-BG-025.md, разные голоса мамы и диктора, Бишкек и оба способа связи
// в озвучке и на финальном экране, номер 0998 08 38 28, «до 2 недель» без
// гарантии, пробная поездка — только после формирования группы, решение и
// оплата — после пробы, сообщения водителя — вручную, без еды/GPS/push,
// финал ≥ 5 с с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG25_CONTACTS_IN, BG25_LINES, BG25_STEPS, BG25_TEXT, BG25_VIDEO, BG25_VOICES } from "../../../src/campaign50/bg-025/script.ts";
import { buildBg25Timeline, checkBg25Timeline, estimateBg25Manifest } from "../../../src/campaign50/bg-025/timing.ts";

const MF = `public/${BG25_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG25_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg25Manifest();
const all = BG25_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify({ BG25_TEXT, BG25_STEPS }).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const t = (id) => BG25_LINES.find((x) => x.id === id).text;

test("реплики дословно по сценарию 26-BG-025.md", () => {
  assert.equal(t("m01"), "Арызымды жөнөттүм. Эми эмне болот?");
  assert.equal(t("n01"), "Адегенде үйүңүздүн дарегин, мектепти жана сабактын убактысын билдиресиз. Бул — каттам дароо башталат деген эмес.");
  assert.equal(
    t("n02"),
    "Андан кийин BalaGo дареги, мектеби жана убактысы туура келген балдарды издейт. Баштапкы издөө эки жумага чейин созулушу мүмкүн. Топ сөзсүз табылат деген кепилдик жок.",
  );
  assert.equal(t("n03"), "Ылайыктуу топ түзүлгөндө, биринчи толук сыноо сапары акысыз өтөт: эртең менен мектепке, сабактан кийин кайра үйгө.");
  assert.equal(t("n04"), "Сыноодон кийин чечим өзүңүздө. Эгер улантууну кааласаңыз, сапар топтомун тандап, андан кийин гана төлөйсүз.");
  assert.equal(
    t("n05"),
    "Уланткан ата-энелер үчүн ошол каттамдын WhatsApp тобу түзүлөт. Андан соң туруктуу каттам башталат. Айдоочу жолго чыгуу жана жеткирүү тууралуу өзү жазып кабарлайт.",
  );
  assert.equal(
    [t("n06"), t("n07"), t("n08")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("TTS-текст отличается от сценария только произношением BalaGo/WhatsApp", () => {
  for (const l of BG25_LINES) {
    if (!l.spoken) continue;
    assert.equal(l.spoken.replace(/БалаГо/g, "BalaGo").replace(/Ватсап/g, "WhatsApp"), l.text, l.id);
  }
});

test("роли: мама — одна реплика в хуке, диктор — остальные, голоса разные", () => {
  assert.deepEqual(
    BG25_LINES.filter((l) => l.role === "mother").map((l) => l.id),
    ["m01"],
  );
  assert.notEqual(BG25_VOICES.mother.voiceId, BG25_VOICES.narrator.voiceId);
});

test("обращение к родителю — только «сиз», без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
  assert.match(all, /өзүңүздө/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге/u);
  assert.match(all, /ватсап|whatsapp/u);
  assert.match(all, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG25_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG25_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG25_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG25_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG25_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("экранные надписи шагов — по сценарию", () => {
  assert.equal(BG25_TEXT.hook.title, "АРЫЗДАН КИЙИН ЭМНЕ БОЛОТ?");
  assert.equal(BG25_TEXT.step1.head, "1. Маалымат калтырасыз");
  assert.equal(BG25_TEXT.step1.row, "Үй • Мектеп • Убакыт");
  assert.equal(BG25_TEXT.step2.head, "2. Ылайыктуу топ изделет");
  assert.equal(BG25_TEXT.step2.period, "Баштапкы издөө: 2 жумага чейин");
  assert.equal(BG25_TEXT.step2.noGuarantee, "Топтун табылышы кепил эмес");
  assert.equal(BG25_TEXT.step3.head, "3. Биринчи толук сыноо сапары — акысыз");
  assert.equal(BG25_TEXT.step3.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG25_TEXT.step3.example, "Шарттуу мисал");
  assert.equal(BG25_TEXT.step4.head, "4. Чечим сиздики");
  assert.equal(BG25_TEXT.step4.after, "Жакса: топтом → төлөм");
  assert.equal(BG25_TEXT.step4.question, "Улантамбы?");
  assert.equal(BG25_TEXT.step56.head5, "5. Ата-энелердин WhatsApp тобу");
  assert.equal(BG25_TEXT.step56.head6, "6. Туруктуу каттам");
  assert.equal(BG25_TEXT.step56.note, "Айдоочу өзү кабарлайт");
  assert.equal(BG25_STEPS.length, 6);
});

test("честные условия: без гарантии, проба после группы, оплата после решения", () => {
  assert.match(t("n02"), /эки жумага чейин/u);
  assert.match(t("n02"), /кепилдик жок/u);
  assert.match(t("n03"), /^Ылайыктуу топ түзүлгөндө/u);
  assert.match(BG25_TEXT.step3.when, /Топ түзүлгөндө/u);
  assert.match(t("n04"), /андан кийин гана төлөйсүз/u);
  assert.match(t("n05"), /өзү жазып кабарлайт/u);
  // не «так», не «кепилдейбиз», не «14-күнү», без «тастыкталды»
  for (const bad of ["так", "кепилдейбиз", "14-күнү", "тастыкталды", "ырасталды"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("нет еды, GPS-автоматики, push, 24/7 и «1000 сом для всех»", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "push", "24/7", "1000 сом", "автоматтык"]) assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg25Timeline(manifest);
  assert.deepEqual(checkBg25Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG25_VIDEO.fps;
  assert.ok(end - (cta.from / BG25_VIDEO.fps + BG25_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 70 && end <= BG25_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG25_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG25_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG25_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
  }
});
