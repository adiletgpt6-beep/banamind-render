// Проверки сценария BalaGoBG045 до рендера (node --test):
// реплики дословно по 45-BG-045.md, кыргызский текст (ү, ө, ң), Бишкек и оба
// способа связи в озвучке и на финальном экране, номер 0998 08 38 28,
// подпись условной половины «шарттуу мисал», честные условия (без
// мгновенного старта и гарантий), финал ≥ 5 с с контактами и ≥ 3 с после
// последнего слова, без еды и выдуманных обещаний.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { BG45_CONTACTS_IN, BG45_LINES, BG45_TEXT, BG45_VIDEO } from "../../../src/campaign50/bg-045/script.ts";
import { buildBg45Timeline, checkBg45Timeline, estimateBg45Manifest } from "../../../src/campaign50/bg-045/timing.ts";
import { decideBeats, groupBeats, trialBeats, wordFrame } from "../../../src/campaign50/bg-045/beats.ts";

const MF = `public/${BG45_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG45_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg45Manifest();
const all = BG45_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const narr = BG45_LINES.filter((l) => l.role === "narrator").map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG45_TEXT).toLowerCase();
const t = (id) => BG45_LINES.find((x) => x.id === id).text;

// Границы слов для кириллицы (\b в JS работает только с латиницей).
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");

test("реплики дословно по сценарию 45-BG-045.md", () => {
  assert.equal(t("n01"), "Бир эле дүйшөмбү эки башкача өтсө кандай болот?");
  assert.equal(t("n02"), "Бир учурда ата-эне мектеп жолун өзү уюштурат. Экинчи көрүнүш — каттам алдын ала макулдашылгандагы мүмкүн болгон күн.");
  assert.equal(t("m01"), "Мен да алдын ала каттам уюштурууга аракет кылып көрөйүн. Үйдү, мектепти, убакытты так жазам.");
  assert.equal(t("n03"), "Бирок арыздан кийин каттам дароо башталбайт. Адегенде ылайыктуу топ изделет, анын табылары кепил эмес.");
  assert.equal(t("n04"), "Топ түзүлсө, биринчи толук сыноо сапары акысыз өтөт. Эгер ата-эне улантууну тандаса, жолду алдын ала пландоо жеңилирээк болушу мүмкүн.");
  // финальная реплика — точно по сценарию (разбита на 3 файла озвучки)
  assert.equal(
    [t("n05"), t("n06"), t("n07")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  assert.equal(BG45_LINES.find((x) => x.id === "m01").role, "mother");
});

test("озвучка (spoken) меняет только произношение бренда и WhatsApp", () => {
  for (const l of BG45_LINES) {
    if (!l.spoken) continue;
    const back = l.spoken.replace(/БалаГо/g, "BalaGo").replace(/Ватсап/g, "WhatsApp");
    assert.equal(back, l.text, l.id);
  }
});

test("нет обращения на «сен» (ребёнок → родитель только «сиз»)", () => {
  for (const l of BG45_LINES) for (const bad of ["сен", "сага", "сени", "сенин", "сенде"]) assert.doesNotMatch(l.text, word(bad), `${l.id}: ${bad}`);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(narr, /бишкектеги балдар үчүн такси/u);
  assert.match(narr, /профилдеги шилтемеге/u);
  assert.match(narr, /ватсап/u);
  assert.match(narr, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG45_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG45_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG45_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG45_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG45_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG45_TEXT.decide.chatNumber, "+996 998 08 38 28");
});

test("условная половина подписана; правая створка всегда с подписью", () => {
  assert.equal(BG45_TEXT.mirror.now, "АЗЫР");
  assert.equal(BG45_TEXT.mirror.maybe, "ЭГЕР КАТТАМ УЮШУЛСА");
  assert.equal(BG45_TEXT.mirror.example, "ШАРТТУУ МИСАЛ");
  // RightPanel рисует подпись сам; отключать её нельзя нигде в сценах
  const dir = "src/campaign50/bg-045";
  const files = [];
  const walk = (d) => readdirSync(d).forEach((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : files.push(join(d, n))));
  walk(dir);
  for (const f of files.filter((x) => x.endsWith(".tsx"))) assert.doesNotMatch(readFileSync(f, "utf8"), /label=\{false\}/, f);
});

test("честные условия: не мгновенно, группа не гарантирована, проба после группы", () => {
  assert.match(t("n03"), /дароо башталбайт/u);
  assert.match(t("n03"), /кепил эмес/u);
  assert.match(t("n04"), /^Топ түзүлсө, биринчи толук сыноо сапары акысыз/u);
  assert.equal(BG45_TEXT.group.noGuarantee, "Топтун табылары кепил эмес");
  assert.equal(BG45_TEXT.trial.formed, "Топ түзүлсө");
  // поля и кнопка — как на сайте BalaGo; мама отправляет сама
  assert.deepEqual(BG45_TEXT.decide.fields.map((x) => x.k), ["Баланы ала турган дарек", "Бара турган жер", "Сабактын башталыш убактысы", "Сабактын бүтүү убактысы"]);
  assert.equal(BG45_TEXT.decide.apply, "Арыз калтыруу");
  assert.equal(BG45_TEXT.decide.formTitle, "Трансферге арыз калтырыңыз");
  assert.deepEqual(BG45_TEXT.decide.filled, ["Ата-эненин аты", "Телефон", "Баланын аты", "Баланын жашы"]);
  assert.equal(BG45_TEXT.decide.consent, "Мен арыз боюнча байланышуу үчүн берилген маалыматтарды иштетүүгө макулмун.");
  // подготовленное сайтом сообщение: приветствие, маршрут и обе заключительные строки
  const msg = BG45_TEXT.decide.message;
  assert.equal(msg[0], "Саламатсызбы! BalaGo кызматына арыз калтыргым келет.");
  assert.ok(msg.includes("Маршрут: Үй → бара турган жер → үй"));
  assert.deepEqual(msg.slice(-2), ["Кызматка кошулуу мүмкүнчүлүгүн тактагым келет.", "Маршрутту жана графикти тактоого даярмын."]);
  // на доске условий нет «совпадений» — только отправленная заявка и поиск
  assert.equal(BG45_TEXT.group.steps[0], "Арыз жөнөтүлдү");
  for (const bad of ["кабыл алынды", "тастыкталды", "заявка принята", "подтвержден"]) assert.ok(!screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("нет еды, гарантий, GPS-автоматики, 24/7 и выдуманных цен", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "gps", "24/7", "кепилдик", "ар дайым орун", "сом", "эртең эле"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg45Timeline(manifest);
  assert.deepEqual(checkBg45Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG45_VIDEO.fps;
  assert.ok(end - (cta.from / BG45_VIDEO.fps + BG45_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 60 && end <= BG45_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG45_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG45_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
  }
});

test("действия по словам укладываются в свои сцены", () => {
  const tl = buildBg45Timeline(manifest);
  const fps = BG45_VIDEO.fps;
  const sc = (id) => tl.scenes.find((x) => x.id === id);
  const cue = (id) => tl.cues.find((x) => x.id === id);
  const local = (id, s) => ({ from: Math.round(cue(id).from * fps) - s.from, to: Math.round(cue(id).to * fps) - s.from });
  // решение: телефон до «үйдү», форма раньше первого поля, отправка видна ≥ 2 с
  const d = sc("decide");
  const m01 = local("m01", d);
  const b = decideBeats(m01, (p, fb, nth = 0) => wordFrame(cue("m01"), p, fb, d.from, nth));
  assert.ok(b.phoneIn > m01.from && b.formIn <= b.fills[0] - 10, `телефон/форма: ${JSON.stringify(b)}`);
  assert.ok(b.fills.every((x, i) => i === 0 || x > b.fills[i - 1]), "поля по порядку");
  assert.ok(b.formTap > m01.to && b.sendAt + 60 <= d.frames, `отправка ${b.sendAt} из ${d.frames}`);
  // условия: зеркало открывается после реплики, штамп — до этого
  const g = sc("group");
  const gb = groupBeats(g.frames, (p, fb, nth = 0) => wordFrame(cue("n03"), p, fb, g.from, nth));
  assert.ok(gb.noG < gb.mir0 && gb.mir0 >= local("n03", g).to + 10, `mir0 ${gb.mir0}`);
  // условный пример: порядок «Топ түзүлсө» → отъезд → «акысыз» → возвращение → выбор → офис
  const tr = sc("trial");
  const t = trialBeats((p, fb) => wordFrame(cue("n04"), p, fb, tr.from));
  const order = [t.formed, t.first, t.free, t.back, t.choose, t.tap, t.office];
  assert.ok(order.every((x, i) => i === 0 || x > order[i - 1]), `порядок ${order}`);
  assert.ok(t.office + 30 <= tr.frames, "офисный кадр успевает");
});
