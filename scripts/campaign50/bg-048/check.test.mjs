// Проверки сценария BalaGoBG048 до рендера (node --test): реплики
// сценария 48-BG-048.md дословно (с допустимым разбиением), дочь
// обращается к родителям на «сиз/сиздер», Бишкек и оба способа связи в
// озвучке и на финальном экране, номер 0998 08 38 28, честные условия
// («Шарттуу мисал», «2 жумага чейин» + «кепил эмес», проба — если группа
// сформирована, оплата — после решения), без еды/GPS/обещаний, финал
// ≥ 5 с с контактами и ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { B48_LINES, B48_TEXT, B48_VIDEO } from "../../../src/campaign50/bg-048/script.ts";
import { buildB48Timeline, checkB48Timeline, estimateB48Manifest } from "../../../src/campaign50/bg-048/timing.ts";

const MF = `public/${B48_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.B48_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateB48Manifest();
const t = (id) => B48_LINES.find((x) => x.id === id).text;
const all = B48_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const screen = JSON.stringify(B48_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");

test("утверждённые реплики дословно по 48-BG-048.md", () => {
  assert.equal(`${t("f01")} ${t("f02")}`, "Даярсыңбы? Бүгүнкү операция: баланы мектептен алып келүү!");
  assert.equal(t("m01"), "Жумуштагы жолугушуу менен мектептин убактысы кайра дал келип калды!");
  assert.equal(t("f03"), "Чыныгы пульт жок да. Анда күн сайын кайталанган жолду алдын ала уюштуруп көрөлүчү?");
  assert.equal(`${t("n01")} ${t("n02")}`, "BalaGo'до биринчи кадам — так маалымат. Андан кийин ылайыктуу топ изделет. Бул дароо иштей турган баскыч эмес.");
  assert.equal(`${t("n03")} ${t("n04")}`, "Топ түзүлсө, биринчи толук сыноо сапары акысыз. Жакса, андан кийин гана улантуу жана төлөм тууралуу чечим кабыл аласыз.");
  assert.equal(
    [t("n05"), t("n06"), t("n07")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
});

test("дочь обращается к родителям только на «сиз/сиздер»", () => {
  const girl = B48_LINES.filter((l) => l.role === "daughter");
  assert.ok(girl.length >= 1);
  for (const l of girl) {
    const s = `${l.text} ${l.spoken ?? ""}`.toLowerCase();
    for (const bad of ["сен", "сага", "сени", "сенин", "силер", "силерге", "жактыңбы", "жасадыңбы"]) assert.doesNotMatch(s, word(bad), `${l.id}: ${bad}`);
    assert.match(s, /сиз/u, `${l.id}: нет «сиз»`);
  }
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге өтүңүз/u);
  assert.match(all, /ватсап аркылуу жазыңыз/u);
  assert.match(all, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(B48_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(B48_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(B48_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(B48_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(B48_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("честные условия: условный пример, поиск без гарантии, проба и оплата после", () => {
  assert.equal(B48_TEXT.example.label, "Шарттуу мисал");
  assert.match(B48_TEXT.example.group, /^Эгер топ түзүлсө/u);
  assert.match(B48_TEXT.memo.search, /2 жумага чейин/u);
  assert.match(B48_TEXT.memo.note, /кепил эмес/u);
  assert.match(B48_TEXT.example.trial, /Биринчи толук сыноо сапары — акысыз/u);
  assert.match(B48_TEXT.example.pay, /чечимден кийин гана/u);
  assert.deepEqual([...B48_TEXT.example.route], ["ҮЙ", "МЕКТЕП", "ҮЙ"]);
  // подготовленное сообщение — запись в BalaGo, не «запись в школу»
  assert.match(B48_TEXT.chat.draft, /BalaGo'го алдын ала каттоо/u);
  assert.doesNotMatch(B48_TEXT.chat.draft, /мектепке каттоо/u);
  for (const bad of ["сөзсүз", "кепилдейбиз", "кабыл алынды", "тастыкталды", "эртең эле"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("нет еды, GPS-автоматики, 24/7 и «1000 сом для всех»", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "кофе", "чай", "gps", "24/7", "1000 сом"]) assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң в озвучке и в кадре", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), `VO: ${ch}`);
  for (const ch of ["ү", "ө"]) assert.ok(screen.includes(ch), `кадр: ${ch}`);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, 60–92 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildB48Timeline(manifest);
  assert.deepEqual(checkB48Timeline(tl), []);
  assert.ok(tl.durationSec - tl.ctaFrom >= 5);
  assert.ok(tl.durationSec - tl.lastWord >= 3);
  assert.ok(tl.durationSec >= 60 && tl.durationSec <= B48_VIDEO.maxSec, `длительность ${tl.durationSec}`);
  const n05 = tl.cues.find((c) => c.id === "n05");
  assert.ok(n05.from >= tl.ctaFrom, "контакты видны раньше финальной реплики");
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  assert.notEqual(manifest.partial, true);
  for (const l of B48_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${B48_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.spoken, l.spoken ?? l.text, `${l.id}: произношение устарело`);
  }
});

test("субтитры: короткие фразы, не оканчиваются союзом, без «сирот», по порядку", async () => {
  const { chunkCue, CONJ } = await import("../../../src/campaign50/bg-048/subtitleChunks.ts");
  const tl = buildB48Timeline(manifest);
  for (const c of tl.cues.filter((x) => x.subtitle)) {
    const chunks = chunkCue(c);
    assert.equal(chunks.map((k) => k.text).join(" "), c.text, `${c.id}: текст субтитров не совпадает с репликой`);
    chunks.forEach((k, i) => {
      assert.ok(k.text.length <= 32, `${c.id}: «${k.text}» длиннее 32 знаков`);
      if (chunks.length > 1) assert.ok(k.text.length >= 6, `${c.id}: «${k.text}» слишком короткая фраза`);
      const last = k.text.split(" ").pop().toLowerCase().replace(/[^\p{L}]/gu, "");
      if (i < chunks.length - 1) assert.ok(!CONJ.has(last), `${c.id}: «${k.text}» оканчивается союзом`);
      assert.ok(k.to > k.from, `${c.id}: пустой интервал`);
      if (i > 0) assert.ok(k.from >= chunks[i - 1].from, `${c.id}: фразы не по порядку`);
    });
  }
});
