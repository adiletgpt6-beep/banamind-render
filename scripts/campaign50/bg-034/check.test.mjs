// Проверки сценария BalaGoBG034 до рендера (node --test):
// реплики по сценарию 34-BG-034.md (с точечными правками по сайту), Бишкек
// и оба способа связи в озвучке и на финальном экране, номер 0998 08 38 28,
// факты пакета на 10 поездок (10 = 10, бонуса нет, минимальный пакет, цена
// за ребёнка по расстоянию, проба отдельно и до оплаты, предоплата после
// решения), запреты (суммы, км, календарь, «+», GPS, еда, кресла, «сен»),
// финал ≥ 5 с с контактами и ≥ 3 с после речи.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG34_CONTACTS_IN, BG34_LINES, BG34_TEXT, BG34_VIDEO } from "../../../src/campaign50/bg-034/script.ts";
import { buildBg34Timeline, checkBg34Timeline, estimateBg34Manifest } from "../../../src/campaign50/bg-034/timing.ts";

const MF = `public/${BG34_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG34_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg34Manifest();
const all = BG34_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG34_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG34_TEXT).toLowerCase();
// для запретов: все надписи, кроме предела обслуживания «20 км» (факт сайта)
const screenNoMax = JSON.stringify({ ...BG34_TEXT, distance: { ...BG34_TEXT.distance, maxDistance: "" } }).toLowerCase();
const t = (id) => BG34_LINES.find((x) => x.id === id).text;

test("реплики диктора по сценарию 34-BG-034.md (термин сайта «пакет»)", () => {
  assert.equal(t("n01"), "BalaGo'догу он сапар пакети эмнени билдирет?");
  assert.equal(t("n02"), "Бул пакеттеги бир сапар — бир баланы эртең менен мектепке, анан сабактан кийин кайра үйгө жеткирген толук сапар.");
  assert.equal(t("n03"), "Он сапар пакетинде он толук сапар үчүн төлөйсүз — он толук сапар аласыз.");
  assert.equal(t("n04"), "Бул пакетте бонус сапар жок.");
  assert.equal(t("n05"), "Туруктуу сапарларды баштоо үчүн эң аз пакет — он сапар.");
  assert.equal(t("n06"), "Пакеттин баасы ар бир бала үчүн, мектептен үйгө чейинки аралыкка жараша эсептелет.");
  assert.equal(t("n07"), "Так баа дарек текшерилгенден кийин тастыкталат.");
  assert.equal(t("n08"), "Топ түзүлүп, биринчи толук сыноо сапары акысыз өткөндөн кийин гана пакетти тандайсыз.");
  assert.equal(t("n09"), "Улантуу чечими — өзүңүздө. Улантсаңыз, пакет үчүн алдын ала төлөйсүз.");
  // финальная реплика сценария целиком (n10 + n11 + n12)
  assert.equal(
    [t("n10"), t("n11"), t("n12")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  // «топтом» (созвучно «топ» — группа) заменён термином сайта «пакет»
  assert.ok(!/топтом/u.test(all + screen));
});

test("бренд и мессенджер в TTS — кириллицей", () => {
  for (const l of BG34_LINES) {
    const s = l.spoken ?? l.text;
    assert.ok(!/BalaGo|WhatsApp/.test(s), `${l.id}: латиница в тексте для TTS`);
  }
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге өтүңүз/u);
  assert.match(spoken, /номерге ватсап аркылуу жазыңыз/u);
  assert.match(spoken, /жолго чыгалы/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG34_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG34_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG34_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG34_TEXT.cta.whatsapp, "WhatsApp: 0998 08 38 28");
  assert.equal(`${BG34_TEXT.cta.whatsappLabel} ${BG34_TEXT.cta.whatsappNumber}`, BG34_TEXT.cta.whatsapp);
});

test("пакет: 1 сапар = ҮЙ → МЕКТЕП → ҮЙ, 10 = 10, бонуса нет, минимальный пакет", () => {
  assert.equal(BG34_TEXT.ticket.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG34_TEXT.ticket.front, "ҮЙ → МЕКТЕП");
  assert.equal(BG34_TEXT.ticket.back, "МЕКТЕП → ҮЙ");
  assert.equal(BG34_TEXT.ticket.equation, "1 билет = 1 толук сапар");
  assert.equal(BG34_TEXT.ten.paid, "10 төлөйсүз");
  assert.equal(BG34_TEXT.ten.got, "10 аласыз");
  assert.equal(BG34_TEXT.ten.bonus, "Бонус сапар: 0");
  assert.equal(BG34_TEXT.ten.minimum, "Эң аз пакет — 10 сапар");
  assert.match(BG34_TEXT.example, /^Шарттуу мисал/u);
});

test("цена: за ребёнка, по расстоянию мектеп — үй, подтверждается после проверки адреса", () => {
  assert.match(t("n06"), /ар бир бала үчүн/u);
  assert.match(t("n06"), /мектептен үйгө чейинки аралыкка/u);
  assert.equal(BG34_TEXT.distance.perChild, "1 бала үчүн");
  assert.equal(BG34_TEXT.distance.confirm, "Так баа дарек текшерилгенден кийин тастыкталат");
  // единственное число км в ролике — предел обслуживания с сайта (distancePricing.ts)
  assert.equal(BG34_TEXT.distance.maxDistance, "Максималдуу аралык — 20 км");
});

test("порядок: группа → бесплатная проба (отдельно от 10) → решение → пакет → предоплата", () => {
  const ids = BG34_TEXT.order.steps.map((s) => s.id);
  assert.deepEqual(ids, ["group", "trial", "decision", "package", "prepay"]);
  assert.match(BG34_TEXT.order.steps[0].note, /3–4 бала/u);
  assert.match(BG34_TEXT.order.steps[0].note, /2 жумага чейин/u);
  assert.match(BG34_TEXT.order.steps[1].note, /10 сапарга кирбейт/u);
  assert.equal(BG34_TEXT.order.plate, "Чечимге чейин төлөм жок");
  assert.match(t("n08"), /өткөндөн кийин гана пакетти тандайсыз/u);
  assert.match(t("n09"), /алдын ала төлөйсүз/u);
});

test("без выдуманных обещаний и запрещённых деталей", () => {
  const bad = [
    "сом",
    "1000",
    "1200",
    "1500",
    "10 000",
    " км",
    "+",
    "11",
    "календар",
    "10 күн",
    "gps",
    "24/7",
    "кепилдик",
    "дароо",
    "эртең эле",
    "тамак",
    "таттуу",
    "шире",
    "печенье",
    "кресло",
    "отургуч",
    "төлөндү",
  ];
  for (const b of bad) assert.ok(!all.includes(b) && !screenNoMax.includes(b), b);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет обращения ребёнка к родителю на «сен» (реплик детей нет)", () => {
  assert.ok(BG34_LINES.every((l) => l.role === "narrator"));
  assert.ok(!/(?<![\p{L}])(сен|сага|сени|сенин)(?![\p{L}])/iu.test(all + screen));
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg34Timeline(manifest);
  assert.deepEqual(checkBg34Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG34_VIDEO.fps;
  assert.ok(end - (cta.from / BG34_VIDEO.fps + BG34_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG34_VIDEO.maxSec, `длительность ${end}`);
  // вся финальная реплика — на неподвижном финальном экране
  for (const id of ["n10", "n11", "n12"]) {
    const c = tl.cues.find((x) => x.id === id);
    assert.ok(c.from >= cta.from / BG34_VIDEO.fps + BG34_CONTACTS_IN, `${id} раньше контактов`);
  }
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG34_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG34_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.spoken, l.spoken ?? l.text, `${l.id}: текст для TTS устарел`);
  }
});
