// Проверки сценария BalaGoBG031 до рендера (node --test):
// реплики по сценарию 32-BG-031.md, Бишкек и оба способа связи в озвучке
// и на финальном экране, номер 0998 08 38 28, тариф 1000 сом только с
// условием «до 7 км в одну сторону, за ребёнка, за полную поездку», без
// цифр других тарифов и обещаний, проба только после группы, финал ≥ 5 с
// с контактами и ≥ 3 с после речи, хук-вопрос в первые 3 с.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG31_CONTACTS_IN, BG31_LINES, BG31_TEXT, BG31_VIDEO } from "../../../src/campaign50/bg-031/script.ts";
import { buildBg31Timeline, checkBg31Timeline, estimateBg31Manifest } from "../../../src/campaign50/bg-031/timing.ts";

const MF = `public/${BG31_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG31_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg31Manifest();
const all = BG31_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG31_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG31_TEXT).toLowerCase();
const t = (id) => BG31_LINES.find((x) => x.id === id).text;

test("реплики по сценарию 32-BG-031.md (одна согласуемая правка «каттамдын» → «сапардын»)", () => {
  assert.equal(t("l01"), "Миң сом — эмнеге төлөйм?");
  assert.equal(t("n02"), "Бул — үй менен мектептин аралыгы бир тарапка жети чакырымга чейин болгон сапардын баасы.");
  assert.equal(t("n03"), "Бир бала үчүн бир толук сапар эртең менен мектепке барууну жана сабактан кийин үйгө кайтууну камтыйт.");
  assert.equal(t("n04"), "Эгер аралык жети чакырымдан ашса, баа башка тариф боюнча эсептелет. Ошондуктан даректи так көрсөтүү керек.");
  assert.equal(
    t("n05"),
    "Бирок төлөм дароо алынбайт. Ылайыктуу топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз, андан кийин гана улантууну тандайсыз.",
  );
  assert.equal(
    [t("c1"), t("c2"), t("c3")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("сценарий в репозитории совпадает с репликами (кроме согласуемой правки)", () => {
  const md = readFileSync("campaigns/balago-50/episodes/32-BG-031.md", "utf8");
  for (const l of BG31_LINES) {
    if (l.scene === "cta") continue;
    const want = l.id === "n02" ? l.text.replace("сапардын баасы", "каттамдын баасы") : l.text;
    assert.ok(md.includes(want), `${l.id}: нет в сценарии`);
  }
});

test("субтитры: куски дают реплику дословно, без союза в конце куска", () => {
  for (const l of BG31_LINES) {
    if (!l.subs) continue;
    assert.equal(l.subs.join(" "), l.text, l.id);
    for (const p of l.subs.slice(0, -1)) assert.ok(!/(?:^|\s)(жана|же|менен|бирок|андан)$/u.test(p), `${l.id}: «${p}»`);
    for (const p of l.subs) assert.ok(p.length <= 40, `${l.id}: длинный кусок «${p}»`);
  }
});

test("TTS: бренды кириллицей, без латиницы и цифр", () => {
  for (const l of BG31_LINES) {
    const s = l.spoken ?? l.text;
    assert.ok(!/[a-z]/i.test(s), `${l.id}: латиница в тексте для синтеза`);
    assert.ok(!/\d/.test(s), `${l.id}: цифры в тексте для синтеза`);
  }
  assert.match(spoken, /балаго/u);
  assert.match(spoken, /вотсап/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге өтүңүз/u);
  assert.match(spoken, /номерге вотсап аркылуу жазыңыз/u);
  assert.match(spoken, /жолго чыгалы/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG31_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG31_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG31_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${BG31_TEXT.cta.whatsappLabel} ${BG31_TEXT.cta.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
});

test("тариф: 1000 сом только за ребёнка, полная поездка, до 7 км в одну сторону", () => {
  assert.equal(BG31_TEXT.receipt.price, "1000 сом");
  assert.equal(BG31_TEXT.receipt.unit, "/ бала");
  assert.equal(BG31_TEXT.receipt.kind, "Бир толук сапар");
  assert.equal(BG31_TEXT.unfold.limit, "7 кмге чейин");
  assert.equal(BG31_TEXT.unfold.oneWay, "бир жакка");
  assert.deepEqual([...BG31_TEXT.trip.route], ["ҮЙ", "МЕКТЕП", "ҮЙ"]);
  assert.match(t("n02"), /бир тарапка жети чакырымга чейин/u);
  assert.match(t("n03"), /^Бир бала үчүн бир толук сапар/u);
  // больше 7 км — другой тариф (без цифр), предел 20 км
  assert.equal(BG31_TEXT.beyond.over, "7 кмден ашса — башка тариф");
  assert.equal(BG31_TEXT.beyond.max, "Максималдуу аралык — 20 км");
  for (const bad of ["1200", "1500", "баарына", "бардыгына", "ар бир адамга"]) assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("условия: проба бесплатна только после группы, без обещаний и еды", () => {
  assert.match(t("n05"), /топ түзүлгөндөн кийин биринчи толук сыноо сапары акысыз/u);
  assert.equal(BG31_TEXT.memo.first, "Алгач топ + акысыз толук сыноо");
  assert.equal(BG31_TEXT.memo.then, "Андан кийин чечим");
  assert.match(BG31_TEXT.memo.search, /көбүнчө 2 жумага чейин/u);
  assert.equal(BG31_TEXT.example, "Шарттуу мисал");
  // «дароо» — только «төлөм дароо алынбайт»
  assert.equal((all.match(/дароо/gu) ?? []).length, 1);
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "24/7", "кепилдик", "эртең эле", "автокресло", "кресло"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет обращения на «сен»; реплик ребёнка к родителю нет", () => {
  assert.ok(BG31_LINES.every((l) => l.role === "narrator" || l.role === "mother"));
  assert.ok(!/(?<![\p{L}])(сен|сага|сени|сенин)(?![\p{L}])/iu.test(all + screen));
});

test("шкала: хук ≤ 3 с, финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg31Timeline(manifest);
  assert.deepEqual(checkBg31Timeline(tl), []);
  const hook = tl.cues.find((c) => c.id === "l01");
  assert.ok(hook.to <= 3.2, `хук до ${hook.to}`);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG31_VIDEO.fps;
  assert.ok(end - (cta.from / BG31_VIDEO.fps + BG31_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG31_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG31_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG31_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.spoken, l.spoken ?? l.text, `${l.id}: текст синтеза устарел`);
  }
});
