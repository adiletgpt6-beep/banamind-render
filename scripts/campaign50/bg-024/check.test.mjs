// Проверки сценария BalaGoBG024 до рендера (node --test): реплики дословно
// по 25-BG-024.md, Бишкек и оба способа связи в озвучке и на финальном
// экране, номер 0998 08 38 28, «до 2 недель» — без обещания старта,
// пробная поездка — только после формирования группы, без еды/GPS,
// финал ≥ 5 с с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG24_CONTACTS_IN, BG24_LINES, BG24_TEXT, BG24_VIDEO } from "../../../src/campaign50/bg-024/script.ts";
import { buildBg24Timeline, checkBg24Timeline, estimateBg24Manifest } from "../../../src/campaign50/bg-024/timing.ts";

const MF = `public/${BG24_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG24_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg24Manifest();
const all = BG24_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify(BG24_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");

test("реплики диктора дословно по сценарию 25-BG-024.md", () => {
  const t = (id) => BG24_LINES.find((x) => x.id === id).text;
  assert.equal(t("n01"), "Бүгүн катталсаңыз, BalaGo эртең эле алып кетеби?");
  assert.equal(t("n02"), "Алгач балдардын дареги, мектеби жана убактысы бири-бирине туура келиши керек.");
  assert.equal(t("n03"), "Ылайыктуу топту алгачкы издөө эки жумага чейин созулушу мүмкүн. Бул — эртең эле каттам башталат деген убада эмес.");
  assert.equal(t("n04"), "Топ түзүлгөндө гана каттамдын шарттарын тактап, кийинки кадамга өтүүгө болот.");
  assert.equal(t("n05"), "Андан кийин биринчи толук сыноо сапары акысыз өтөт. Кызматты улантуу чечимин өзүңүз кабыл аласыз.");
  assert.equal(
    [t("n06"), t("n07"), t("n08")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же WhatsApp аркылуу 0998 08 38 28 номерине жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("обращение к родителю — только «сиз», без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) assert.doesNotMatch(all, word(bad), bad);
  assert.match(all, /өзүңүз/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге/u);
  assert.match(all, /ватсап|whatsapp/u);
  assert.match(all, /0998 08 38 28/);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG24_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG24_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG24_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG24_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG24_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
});

test("честные условия: «до 2 недель» — не обещание, проба после группы", () => {
  assert.match(BG24_TEXT.calendar.range, /2 жумага чейин/u);
  assert.match(BG24_TEXT.calendar.note, /убадасы эмес/u);
  assert.equal(BG24_TEXT.trial.after, "Топ түзүлгөндөн кийин");
  assert.match(BG24_TEXT.trial.badge, /толук сыноо сапары — акысыз/u);
  assert.match(BG24_TEXT.match.example, /Шарттуу мисал/u);
  // не «так», не абсолютные обещания и не «14-күнү старт»
  for (const bad of ["так", "сөзсүз", "кепилдик", "кепилдейбиз", "дароо", "14-күнү"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("нет еды, GPS-автоматики, 24/7 и «1000 сом для всех»", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "24/7", "1000 сом"]) assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg24Timeline(manifest);
  assert.deepEqual(checkBg24Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG24_VIDEO.fps;
  assert.ok(end - (cta.from / BG24_VIDEO.fps + BG24_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG24_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG24_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG24_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});
