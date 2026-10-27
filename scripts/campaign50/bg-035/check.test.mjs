// Проверки сценария BalaGoBG035 до рендера (node --test):
// реплики дословно по сценарию 35-BG-035.md (с одной согласованной
// правкой порядка слов в n05), Бишкек и оба способа связи в озвучке и на
// финальном экране, номер 0998 08 38 28, факты пакета 20 + 2 (пробная
// поездка отдельно), шарттуу-метка условной сцены, без цен и обещаний,
// «сиз», финал ≥ 5 с с контактами и ≥ 3 с после речи.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG35_CONTACTS_IN, BG35_LINES, BG35_TEXT, BG35_TOKENS, BG35_VIDEO, BG35_VOICES, BG35_WORDS } from "../../../src/campaign50/bg-035/script.ts";
import { buildBg35Timeline, CHAR_LAG, checkBg35Timeline, estimateBg35Manifest } from "../../../src/campaign50/bg-035/timing.ts";

const MF = `public/${BG35_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG35_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg35Manifest();
const all = BG35_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG35_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG35_TEXT).toLowerCase();
const t = (id) => BG35_LINES.find((x) => x.id === id).text;
const join = (...ids) => ids.map(t).join(" ");
const word = (s) => new RegExp(`(?<![\\p{L}\\p{N}])${s}(?![\\p{L}\\p{N}])`, "iu");

test("реплики дословно по сценарию 35-BG-035.md (раздел VO script для TTS)", () => {
  assert.equal(t("n01"), "Жыйырма сапарга төлөп, жыйырма эки сапар алса болобу?");
  assert.equal(t("m01"), "Кошумча эки сапар эмнеге берилет?");
  assert.equal(join("n02", "n03"), "BalaGo'нун жыйырма сапар топтомунда жыйырма толук сапарга төлөйсүз. Кошумча дагы эки толук сапар бонус катары берилет.");
  assert.equal(t("n04"), "Бонус сапарлар да толук: эртең менен мектепке, сабактан кийин үйгө. Бир тарапка гана эмес.");
  // единственная правка: «бонус эки сапардан» → «эки бонус сапардан» (порядок слов)
  assert.equal(
    join("n05", "n06", "n07"),
    "Биринчи акысыз сыноо сапары бул эки бонус сапардан өзүнчө. Адегенде ылайыктуу топ түзүлөт, сыноо өтөт, андан кийин гана топтомду тандайсыз. Баа аралыкка жараша эсептелет.",
  );
  assert.equal(
    join("n08", "n09", "n10"),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("деление субтитров совпадает с текстом реплики", () => {
  for (const l of BG35_LINES) if (l.subs) assert.equal(l.subs.join(" "), l.text, l.id);
});

test("spoken отличается от текста только формой бренда", () => {
  for (const l of BG35_LINES) {
    if (!l.spoken) continue;
    const norm = (s) => s.replace(/BalaGo/g, "БалаГо").replace(/'нун/g, "нун").replace(/WhatsApp/g, "вотсап");
    assert.equal(norm(l.text), l.spoken, l.id);
  }
});

test("индексы слов для синхронизации совпадают с текстом", () => {
  const words = (id) => (BG35_LINES.find((x) => x.id === id).spoken ?? t(id)).split(/\s+/).filter((w) => /\p{L}/u.test(w));
  const at = (id, i) => words(id)[i].replace(/[.,:!?]/g, "");
  assert.equal(at("n01", BG35_WORDS.n01.twentyTwo), "жыйырма");
  assert.equal(at("n02", BG35_WORDS.n02.firstTwenty), "жыйырма");
  assert.equal(at("n02", BG35_WORDS.n02.pay), "төлөйсүз");
  assert.equal(at("n03", BG35_WORDS.n03.two), "эки");
  assert.equal(at("n03", BG35_WORDS.n03.bonus), "бонус");
  assert.equal(at("n04", BG35_WORDS.n04.morning), "эртең");
  assert.equal(at("n04", BG35_WORDS.n04.after), "сабактан");
  assert.equal(at("n04", BG35_WORDS.n04.oneWay), "Бир");
  assert.equal(at("n05", BG35_WORDS.n05.trial), "сыноо");
  assert.equal(at("n05", BG35_WORDS.n05.apart), "өзүнчө");
  assert.equal(at("n06", BG35_WORDS.n06.group), "топ");
  assert.equal(at("n06", BG35_WORDS.n06.trial), "сыноо");
  assert.equal(at("n06", BG35_WORDS.n06.choose), "тандайсыз");
  assert.equal(at("n07", BG35_WORDS.n07.distance), "аралыкка");
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге/u);
  assert.match(spoken, /вотсап/u);
  assert.match(spoken, /жолго чыгалы/u);
  // номер на экране; в речи — «экрандагы номерге»
  assert.match(spoken, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG35_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG35_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG35_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG35_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG35_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("факты пакета: 20 оплачено + 2 бонуса = 22; проба отдельно", () => {
  assert.deepEqual({ ...BG35_TOKENS }, { paid: 20, bonus: 2, trial: 1 });
  assert.equal(BG35_TEXT.hook.question, "?");
  assert.equal(BG35_TEXT.hook.answer, String(BG35_TOKENS.paid + BG35_TOKENS.bonus));
  assert.match(BG35_TEXT.fill.paid, /^20 .*→ 22 толук сапар/u);
  assert.equal(BG35_TEXT.fill.badge, "+2 сапар акысыз");
  assert.equal(BG35_TEXT.full.eq, "2 бонус = 2 толук сапар");
  assert.equal(BG35_TEXT.full.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG35_TEXT.trial.apart, "Сыноо сапары өзүнчө");
  assert.equal(BG35_TEXT.trial.price, "Баасы аралыкка жараша");
  // порядок шагов сайта: топ → сыноо → чечим → топтом
  assert.deepEqual(BG35_TEXT.trial.steps.map((s) => s.title), ["Топ издөө", "Сыноо сапары", "Чечим", "Топтом"]);
  assert.match(BG35_TEXT.trial.steps[0].note, /2 жумага чейин/u);
  assert.match(BG35_TEXT.trial.steps[3].note, /сыноодон кийин/u);
  // на фишке пробы — только «СЫНОО» (бесплатность пробы — в речи и шагах)
  assert.equal(BG35_TEXT.trial.chip, "СЫНОО");
});

test("условная сцена помечена «Шарттуу мисал»", () => {
  assert.match(BG35_TEXT.full.example, /^Шарттуу мисал/u);
  assert.match(BG35_TEXT.full.example, /топ түзүлгөндөн кийин/u);
});

test("без цен, обещаний, еды и календаря", () => {
  for (const bad of ["1000", "1200", "1500", "20 000", "24/7", "gps"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
  for (const bad of ["сом", "сомдон", "тамак", "таттуу", "шире", "печенье", "кепилдик", "дароо", "ай", "календарь", "дүйшөмбү", "жума күнү"]) {
    assert.ok(!word(bad).test(all) && !word(bad).test(screen), bad);
  }
  assert.ok(!/эртең эле/u.test(all + screen));
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет обращения на «сен» (реплик детей нет), голоса разные", () => {
  assert.ok(BG35_LINES.every((l) => l.role === "narrator" || l.role === "mother"));
  assert.ok(!/(?<![\p{L}])(сен|сага|сени|сенин)(?![\p{L}])/iu.test(all + screen));
  assert.notEqual(BG35_VOICES.mother.voiceId, BG35_VOICES.narrator.voiceId);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, речь финала после контактов", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg35Timeline(manifest);
  assert.deepEqual(checkBg35Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG35_VIDEO.fps;
  const contacts = cta.from / BG35_VIDEO.fps + BG35_CONTACTS_IN;
  assert.ok(end - contacts >= 5);
  assert.ok(end - (tl.speechEnd + CHAR_LAG) >= 3);
  assert.ok(tl.cues.filter((c) => c.scene === "cta").every((c) => c.from >= contacts));
  assert.ok(end >= BG35_VIDEO.minSec && end <= BG35_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG35_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG35_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG35_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
    assert.ok(ml.env?.length && ml.chars?.length, `${l.id}: нет таймингов для губ/синхронизации`);
  }
});
