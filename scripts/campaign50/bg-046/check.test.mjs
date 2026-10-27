// Проверки сценария BalaGoBG046 до рендера (node --test):
// реплики дословно по 46-BG-046.md, дочь обращается к маме на «сиз»,
// кыргызские буквы, Бишкек и оба способа связи в озвучке и на финальном
// экране, номер 0998 08 38 28, «Шарттуу мисал», честные условия (группа
// 3–4 ребёнка, поиск до 2 недель, бесплатная первая полная проба только
// после формирования группы), без еды и выдуманных обещаний; финал ≥ 5 с
// с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG46_CONTACTS_IN, BG46_LINES, BG46_TEXT, BG46_VIDEO, BG46_VOICES } from "../../../src/campaign50/bg-046/script.ts";
import { buildBg46Timeline, checkBg46Timeline, estimateBg46Manifest } from "../../../src/campaign50/bg-046/timing.ts";

const MF = `public/${BG46_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG46_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg46Manifest();
const t = (id) => BG46_LINES.find((x) => x.id === id).text;
const all = BG46_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const narr = BG46_LINES.filter((l) => l.role === "narrator").map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG46_TEXT).toLowerCase();

// Границы слов для кириллицы (\b в JS работает только с латиницей).
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");

test("реплики дословно по сценарию 46-BG-046.md", () => {
  assert.equal(t("b01"), "Мен мектепке күн сайын барам. Бирок мени ким менен алып барышат?");
  assert.equal(t("c01"), "Апа, сумкамды тагынганга жардам бересизби?");
  assert.equal(t("b02"), "Мен даярмын. Мектепке барчу жол да даярбы?");
  assert.equal(t("m01"), "Мектепке алып баруу менен кайра алып келүүнү алдын ала кантип уюштурсам болот?");
  assert.equal(t("n01"), "BalaGo үчүн үйдүн дареги, мектеп жана убакыт керек. Ошол маалымат боюнча ылайыктуу топ изделет.");
  assert.equal(t("b03"), "Эгер каттам түзүлсө, биринчи толук сыноо сапары акысыз экен. Калганын ата-эне өзү чечет.");
  // финальная реплика диктора — дословно, разбита на три фразы
  assert.equal(
    [t("n02"), t("n03"), t("n04")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  // для синтеза меняются только написание бренда и WhatsApp
  for (const l of BG46_LINES) {
    if (!l.spoken) continue;
    assert.equal(l.spoken.replaceAll("БалаГо", "BalaGo").replaceAll("Ватсап", "WhatsApp"), l.text, l.id);
  }
});

test("дочь обращается к маме на «сиз», без «сен»", () => {
  const kid = BG46_LINES.filter((x) => x.role === "child");
  assert.ok(kid.length >= 1);
  for (const l of kid) {
    assert.match(l.text, /сиз/iu, l.id);
    for (const bad of ["сен", "сага", "сени", "сенин", "бересиңби", "бересинби", "бер"]) assert.doesNotMatch(l.text, word(bad), `${l.id}: ${bad}`);
  }
  assert.match(t("c01"), /^Апа,/u);
  assert.match(t("c01"), /бересизби\?$/u);
});

test("четыре разных готовых голоса проекта", () => {
  const ids = Object.values(BG46_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, 4);
  for (const l of BG46_LINES) assert.ok(BG46_VOICES[l.role], l.id);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(narr, /бишкектеги балдар үчүн такси/u);
  assert.match(narr, /профилдеги шилтемеге өтүңүз/u);
  assert.match(narr, /ватсап аркылуу жазыңыз/u);
  assert.match(narr, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG46_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG46_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG46_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG46_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG46_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("надписи сценария на экране", () => {
  assert.equal(BG46_TEXT.hook.title, "МЕКТЕП СУМКАСЫ СҮЙЛӨЙТ");
  assert.equal(BG46_TEXT.hook.chip, "Жомок");
  assert.equal(BG46_TEXT.tale, "Ойдон чыгарылган жомок");
  assert.equal(BG46_TEXT.morning.label, "Эртең мененки даярдык");
  assert.equal(BG46_TEXT.repeat.label, "Күн сайын кайталанган жол");
  assert.equal(BG46_TEXT.note.rule, "Так маалымат → ылайыктуу топ издөө");
  assert.equal(BG46_TEXT.future.sample, "Шарттуу мисал");
  assert.equal(BG46_TEXT.future.free, "Биринчи толук сыноо — акысыз");
  assert.deepEqual([...BG46_TEXT.note.paper], ["Үй", "Мектеп", "Убакыт"]);
});

test("честные условия: группа, поиск, проба после формирования группы", () => {
  assert.deepEqual([...BG46_TEXT.note.facts], ["Топ: 3–4 бала", "Издөө: 2 жумага чейин"]);
  assert.equal(BG46_TEXT.future.after, "Топ түзүлгөндөн кийин");
  assert.equal(BG46_TEXT.note.start, "Каттам топ түзүлгөндө гана башталат");
  assert.match(t("b03"), /^Эгер каттам түзүлсө/u);
  // отправку в WhatsApp делает сам родитель — без «подтверждено»/«катталдыңыз»
  assert.match(BG46_TEXT.note.chat.hint, /ата-эне өзү жөнөтөт/u);
  for (const bad of ["ырасталды", "катталдыңыз", "кабыл алынды", "подтвержд"]) assert.ok(!screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
  for (const ch of ["ү", "ө"]) assert.ok(screen.includes(ch), `экран: ${ch}`);
});

test("нет еды, гарантий, GPS-автоматики, 24/7 и неверных цен", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "конфет", "gps", "24/7", "кепилдик", "кепилденет", "эртеңден баштап", "1000 сом", "автокресло", "push"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, 72–95 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg46Timeline(manifest);
  assert.deepEqual(checkBg46Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG46_VIDEO.fps;
  const contacts = cta.from / BG46_VIDEO.fps + BG46_CONTACTS_IN;
  assert.ok(end - contacts >= 5, `контакты ${end - contacts} с`);
  assert.ok(end - tl.speechEnd >= 3, `после речи ${end - tl.speechEnd} с`);
  // контакты появляются раньше, чем диктор начинает финальную реплику
  const n02 = tl.cues.find((c) => c.id === "n02");
  assert.ok(n02.from >= contacts, "финальная реплика раньше карточки контактов");
  assert.ok(end >= BG46_VIDEO.minSec && end <= BG46_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  assert.equal(manifest.kind, "bg046");
  assert.ok(!manifest.partial && !manifest.estimated);
  for (const l of BG46_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG46_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.voiceId, BG46_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
  }
});
