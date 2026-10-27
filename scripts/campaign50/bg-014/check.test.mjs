// Проверки сценария BalaGoBG014 до рендера (node --test):
// кыргызский текст, обращение сына к родителям на «сиз», Бишкек и оба способа
// связи в озвучке и на финальном экране, номер 0998 08 38 28, финал
// ≥ 5 с с контактами и ≥ 3 с после последнего слова, без еды и обещаний.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG14_CONTACTS_IN, BG14_LINES, BG14_TEXT, BG14_VIDEO } from "../../../src/campaign50/bg-014/script.ts";
import { buildBg14Timeline, checkBg14Timeline, estimateBg14Manifest } from "../../../src/campaign50/bg-014/timing.ts";

const MF = `public/${BG14_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG14_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg14Manifest();
const all = BG14_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const narr = BG14_LINES.filter((l) => l.role === "narrator").map((l) => l.spoken ?? l.text).join(" ").toLowerCase();

// Границы слов для кириллицы (\b в JS работает только с латиницей).
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");

test("сын обращается к родителям на «сиз» (сиздер), без «сен»", () => {
  const son = BG14_LINES.filter((x) => x.role === "son");
  assert.ok(son.length >= 2);
  for (const l of son) {
    assert.match(l.text, /сиз/iu, l.id);
    for (const bad of ["сен", "сага", "сени", "сенин", "силер", "силерчи", "издейсиңер", "издеп жатасыңар"]) assert.doesNotMatch(l.text, word(bad), `${l.id}: ${bad}`);
  }
  // вежливая форма глагола во множественном числе
  assert.match(BG14_LINES.find((x) => x.id === "s02").text, /издейсиздер/u);
});

test("реплики по сценарию 15-BG-014.md", () => {
  const t = (id) => BG14_LINES.find((x) => x.id === id).text;
  assert.equal(t("s01"), "Мен даярмын! А сиздерчи?");
  assert.equal(t("m01"), "Бүгүн мектепке ким жеткирет?");
  assert.equal(t("f01"), "Менин эртең менен жыйыным бар. Сиздин график кандай?");
  assert.equal(t("n01"), "Бала даяр. Ал эми чоңдор жолдун графигин кайрадан сүйлөшүп жатышат.");
  assert.equal(t("m02"), "Күн сайын шашылбай, мектепке каттамды алдын ала уюштуруунун жолун карайлы.");
  assert.match(t("n02"), /топ түзүлгөндөн кийин/u);
  assert.match(t("n02"), /Биринчи толук сыноо сапары акысыз/u);
  assert.equal(t("n05"), "BalaGo менен жолго чыгалы!");
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(narr, /бишкектеги балдар үчүн такси/u);
  assert.match(narr, /профилдеги шилтемеге/u);
  assert.match(narr, /ватсап|whatsapp/u);
  assert.match(all, /0998 08 38 28/);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG14_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG14_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG14_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG14_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет еды, гарантий «завтра всем», GPS-автоматики и 24/7", () => {
  const screen = JSON.stringify(BG14_TEXT).toLowerCase();
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "24/7", "кепилдик", "ар дайым орун", "1000 сом"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg14Timeline(manifest);
  assert.deepEqual(checkBg14Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG14_VIDEO.fps;
  assert.ok(end - (cta.from / BG14_VIDEO.fps + BG14_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG14_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG14_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG14_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});
