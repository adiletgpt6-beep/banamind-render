// Проверки сценария BalaGoBG030 до рендера (node --test): реплики дословно
// по 31-BG-030.md, Бишкек и оба способа связи в озвучке и на финальном
// экране, номер 0998 08 38 28, «до 2 недель» и «кепил эмес» отдельными
// строками, «Шарттуу мисал», подписи формы — как на сайте, без еды/GPS,
// финал ≥ 5 с с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG30_CONTACTS_IN, BG30_LINES, BG30_PRODUCTION, BG30_TEXT, BG30_VIDEO } from "../../../src/campaign50/bg-030/script.ts";
import { buildBg30Timeline, checkBg30Timeline, estimateBg30Manifest } from "../../../src/campaign50/bg-030/timing.ts";

const MF = `public/${BG30_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG30_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg30Manifest();
const all = BG30_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify(BG30_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const t = (id) => BG30_LINES.find((x) => x.id === id).text;

test("реплики дословно по сценарию 31-BG-030.md", () => {
  assert.equal(t("n01"), "Бишкек чоң шаар. Ар бир баланын мектеби да, үйү да башка жерде.");
  assert.equal(t("m01"), "Баламдын мектебине ылайык каттам табылса жакшы болот эле.");
  assert.equal(t("n02"), "Ошон үчүн BalaGo'го үйдүн жана мектептин так дарегин, сабактын убактысын билдирүү маанилүү.");
  assert.equal(
    [t("n03"), t("n04")].join(" "),
    "Андан кийин ушул шарттары бири-бирине ылайык келген балдардын тобу изделет. Баштапкы издөө эки жумага чейин созулушу мүмкүн, бирок топтун табылышы кепил эмес.",
  );
  assert.equal(t("n05"), "Топ түзүлсө, биринчи толук сыноо сапары акысыз өтөт: мектепке жана сабактан кийин кайра үйгө.");
  assert.equal(
    [t("n06"), t("n07"), t("n08")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("spoken: бренд кириллицей, число слов как в тексте (субтитры по словам)", () => {
  for (const l of BG30_LINES) {
    if (!l.spoken) continue;
    assert.doesNotMatch(l.spoken, /balago|whatsapp/i, l.id);
    assert.equal(l.spoken.split(/\s+/).length, l.text.split(/\s+/).length, l.id);
  }
});

test("обращение — только вежливое, без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) assert.doesNotMatch(all, word(bad), bad);
  assert.match(all, /балаңызды/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге/u);
  assert.match(all, /ватсап|whatsapp/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG30_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG30_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG30_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(`${BG30_TEXT.cta.whatsappLabel} ${BG30_TEXT.cta.whatsappNumber}`, "WhatsApp: 0998 08 38 28");
  assert.equal(BG30_TEXT.site.chat.phone, "+996 998 08 38 28");
});

test("честные условия: до 2 недель и «кепил эмес» — отдельно, «Шарттуу мисал»", () => {
  assert.match(BG30_TEXT.windows.period, /2 жумага чейин/u);
  assert.equal(BG30_TEXT.windows.noGuarantee, "Топтун табылышы кепил эмес");
  assert.ok(!BG30_TEXT.windows.period.includes("кепил"));
  assert.equal(BG30_TEXT.windows.example, "Шарттуу мисал");
  assert.equal(BG30_TEXT.future.example, "Шарттуу мисал");
  assert.match(BG30_TEXT.windows.group, /3–4 бала/u);
  assert.equal(BG30_TEXT.future.badge, "Биринчи толук сыноо сапары — акысыз");
  for (const bad of ["сөзсүз", "кепилдейбиз", "дароо", "эртең эле", "14-күнү"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("форма и WhatsApp — подписи действующего сайта, без «заявка принята»", () => {
  assert.deepEqual(
    BG30_TEXT.site.fields.map((x) => x.label),
    ["Баланы ала турган дарек", "Бара турган жер", "Сабактын башталыш убактысы", "Сабактын бүтүү убактысы"],
  );
  assert.equal(BG30_TEXT.site.button, "Арыз калтыруу");
  assert.equal(BG30_TEXT.site.chat.greeting, "Саламатсызбы! BalaGo кызматына арыз калтыргым келет");
  for (const bad of ["кабыл алынды", "жөнөтүлдү", "ийгиликтүү", "тастыкталды"]) assert.ok(!screen.includes(bad), bad);
});

test("нет еды, GPS-автоматики, 24/7, автокресел и «1000 сом для всех»", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "24/7", "1000 сом", "автокресло"]) assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("платная озвучка — только для утверждённого сценария", () => {
  assert.equal(BG30_PRODUCTION.approved, true);
  assert.match(BG30_PRODUCTION.approvedOn, /^\d{4}-\d{2}-\d{2}$/);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, 75–90 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg30Timeline(manifest);
  assert.deepEqual(checkBg30Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG30_VIDEO.fps;
  assert.ok(end - (cta.from / BG30_VIDEO.fps + BG30_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  // реплики CTA начинаются, когда карточка контактов уже на экране
  const firstCta = tl.cues.find((c) => c.scene === "cta");
  assert.ok(firstCta.from >= cta.from / BG30_VIDEO.fps + BG30_CONTACTS_IN);
  assert.ok(end >= BG30_VIDEO.minSec && end <= BG30_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  assert.ok(!manifest.partial && !manifest.estimated, "озвучка неполная");
  for (const l of BG30_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG30_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.spoken, l.spoken ?? l.text, `${l.id}: произношение устарело`);
  }
});
