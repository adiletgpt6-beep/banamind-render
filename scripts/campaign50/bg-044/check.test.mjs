// Проверки сценария BalaGoBG044 до рендера (node --test): реплики дословно
// по 44-BG-044.md, три разных голоса, Бишкек и оба способа связи в озвучке
// и на финальном экране, номер 0998 08 38 28, честные условия (кепил эмес,
// 2 жумага чейин, проба — после формирования группы, оплата — после
// решения, отправку в WhatsApp делает сам родитель), без еды/GPS/цен,
// финал ≥ 5 с с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG44_CONTACTS_IN, BG44_LINES, BG44_SCENES, BG44_SPEAKER, BG44_TEXT, BG44_VIDEO, BG44_VOICES } from "../../../src/campaign50/bg-044/script.ts";
import { buildBg44Timeline, checkBg44Timeline, estimateBg44Manifest } from "../../../src/campaign50/bg-044/timing.ts";

const MF = `public/${BG44_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG44_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg44Manifest();
const all = BG44_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify(BG44_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const t = (id) => BG44_LINES.find((x) => x.id === id).text;

test("реплики дословно по сценарию 44-BG-044.md (полный VO)", () => {
  assert.equal(t("g1"), "Жаңы деңгээл: мектеп жолун уюштур!");
  assert.equal(t("m1"), "Бул оюндагыдай бир баскыч менен эле чечилбейт экен. Адегенде даректерди туура жазайын.");
  assert.equal(t("g2"), "Кийинки кадам — ылайыктуу топту издөө. Мында баарынын дареги менен убактысы туура келиши керек.");
  assert.equal(t("n1"), "Топ түзүлгөндө биринчи толук сыноо сапары акысыз өтөт: эртең менен мектепке, сабактан кийин үйгө.");
  assert.equal(t("n2"), "Бул оюндагы белек эмес, чыныгы кызматтын тартиби. Сыноодон кийин гана улантууну тандап, төлөмгө өтөсүз.");
  assert.equal(
    [t("c1"), t("c2"), t("c3")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  // произношение отличается только написанием имён BalaGo / WhatsApp
  for (const l of BG44_LINES) {
    if (!l.spoken) continue;
    assert.equal(l.spoken.replaceAll("БалаГо", "BalaGo").replaceAll("Ватсап", "WhatsApp"), l.text, l.id);
  }
});

test("роли и голоса: оюн диктору, апа, диктор — три разных голоса", () => {
  const roles = new Set(BG44_LINES.map((l) => l.role));
  assert.deepEqual([...roles].sort(), ["announcer", "mother", "narrator"]);
  const ids = new Set(Object.values(BG44_VOICES).map((v) => v.voiceId));
  assert.equal(ids.size, 3);
  assert.equal(BG44_SPEAKER.announcer, "Оюн диктору");
  assert.equal(BG44_SPEAKER.mother, "Апа");
  assert.equal(BG44_SPEAKER.narrator, "Диктор");
  assert.equal(BG44_LINES.find((l) => l.id === "m1").role, "mother");
});

test("порядок сцен по раскадровке", () => {
  assert.deepEqual(BG44_SCENES.map((s) => s.id), ["hook", "cards", "group", "trial", "decision", "cta"]);
});

test("обращение к родителю — «сиз»-формы, без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
  assert.match(all, /өтөсүз|өтүңүз|жазыңыз/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге/u);
  assert.match(all, /ватсап|whatsapp/u);
  assert.match(all, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG44_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG44_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG44_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG44_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG44_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("экранные надписи раскадровки", () => {
  assert.equal(BG44_TEXT.hook.level, "ДЕҢГЭЭЛ 1: МЕКТЕП ЖОЛУ");
  assert.equal(BG44_TEXT.hook.button, "БИР БАСУУ МЕНЕН БҮТ");
  assert.equal(BG44_TEXT.hook.message, "АЛДЫН АЛА УЮШТУРУУ КЕРЕК");
  assert.equal(BG44_TEXT.cards.header, "ҮЙ • МЕКТЕП • УБАКЫТ");
  assert.equal(BG44_TEXT.group.level, "ДЕҢГЭЭЛ 2: ЫЛАЙЫКТУУ ТОП");
  assert.equal(BG44_TEXT.group.notGuaranteed, "Кепил эмес");
  assert.equal(BG44_TEXT.trial.level, "ДЕҢГЭЭЛ 3: АКЫСЫЗ ТОЛУК СЫНОО");
  assert.equal(BG44_TEXT.decision.level, "ДЕҢГЭЭЛ 4: ЧЕЧИМ СИЗДИКИ");
  assert.deepEqual([BG44_TEXT.decision.yes, BG44_TEXT.decision.no], ["Улантам", "Улантпайм"]);
  assert.equal(BG44_TEXT.gameExample, "Оюндагы мисал");
  assert.equal(BG44_TEXT.example, "Шарттуу мисал");
});

test("честные условия: группа не гарантирована, проба после группы, оплата после решения", () => {
  assert.match(BG44_TEXT.group.search, /2 жумага чейин/u);
  assert.match(BG44_TEXT.group.group, /3–4 бала/u);
  assert.equal(BG44_TEXT.trial.after, "Топ түзүлгөндөн кийин");
  assert.match(t("n1"), /^Топ түзүлгөндө биринчи толук сыноо сапары акысыз/u);
  assert.match(t("n2"), /Сыноодон кийин гана улантууну тандап, төлөмгө/u);
  // порядок оплаты — шаги дословно с сайта BalaGo (ky.pricing.paymentSequence)
  assert.deepEqual(BG44_TEXT.decision.steps, [
    "Биринчи сапар — акысыз",
    "Андан кийин улантуу керекпи, өзүңүз чечесиз",
    "Улантсаңыз — пакет тандайсыз",
    "Пакет үчүн алдын ала төлөйсүз",
    "Төлөгөндөн кийин туруктуу сапарлар башталат",
  ]);
  assert.equal(BG44_TEXT.decision.when, "Топ түзүлгөндөн кийин");
  // WhatsApp: только подготовленное сообщение, отправляет сам родитель
  assert.match(BG44_TEXT.cards.whatsapp.note, /өзүңүз жөнөтөсүз/u);
  for (const bad of ["кабыл алынды", "тастыкталды", "ырасталды", "так", "сөзсүз", "кепилдейбиз", "дароо", "эртең эле"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("нет еды, цен, бонусов, GPS и 24/7", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "24/7", "сом", "бонус", "+2", "+5"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("кыргызские буквы ү, ө, ң в озвучке и надписях; без эмодзи", () => {
  for (const ch of ["ү", "ө", "ң"]) {
    assert.ok(all.includes(ch), `VO ${ch}`);
    assert.ok(screen.includes(ch), `экран ${ch}`);
  }
  assert.doesNotMatch(JSON.stringify(BG44_TEXT), /\p{Extended_Pictographic}/u);
});

test("в коде сцен нет эмодзи и случайности (детерминированный рендер)", () => {
  const dir = "src/campaign50/bg-044";
  const files = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${d}/${e.name}`);
      else if (/\.tsx?$/.test(e.name)) files.push(`${d}/${e.name}`);
    }
  };
  walk(dir);
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    assert.doesNotMatch(src, /Math\.random\(|Date\.now\(|new Date\(/, f);
    // ★ и ✓ — глифы пиксельного шрифта, не эмодзи
    assert.doesNotMatch(src.replace(/[★✓]/g, ""), /\p{Extended_Pictographic}/u, f);
  }
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, 60–95 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg44Timeline(manifest);
  assert.deepEqual(checkBg44Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG44_VIDEO.fps;
  assert.ok(end - (cta.from / BG44_VIDEO.fps + BG44_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG44_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG44_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG44_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG44_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
  }
});
