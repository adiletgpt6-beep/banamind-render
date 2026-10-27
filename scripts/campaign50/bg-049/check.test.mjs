// Проверки сценария BalaGoBG049 до рендера (node --test): реплики дословно
// по 49-BG-049.md, Бишкек и оба способа связи в озвучке и на финальном
// экране, номер 0998 08 38 28, честные условия (группа не гарантирована,
// проба — только после формирования группы, «Шарттуу мисал»), без еды/GPS,
// одна непрерывная жёлтая линия на весь ролик, финал ≥ 5 с с контактами и
// ≥ 3 с после последнего слова.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  BG49_CONTACTS_IN,
  BG49_LINES,
  BG49_TEXT,
  BG49_VIDEO,
  BG49_VOICES,
} from "../../../src/campaign50/bg-049/script.ts";
import {
  buildBg49Timeline,
  checkBg49Timeline,
  estimateBg49Manifest,
} from "../../../src/campaign50/bg-049/timing.ts";
import {
  buildLineTrack,
  lineState,
} from "../../../src/campaign50/bg-049/line/track.ts";

const MF = `public/${BG49_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG49_STRICT_VOICE === "1";
const manifest = existsSync(MF)
  ? JSON.parse(readFileSync(MF, "utf8"))
  : estimateBg49Manifest();
const all = BG49_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`)
  .join(" ")
  .toLowerCase();
const screen = JSON.stringify(BG49_TEXT).toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const SCENARIO = "campaigns/balago-50/episodes/49-BG-049.md";

test("реплики дословно по сценарию 49-BG-049.md", () => {
  const t = (id) => BG49_LINES.find((x) => x.id === id).text;
  assert.equal(t("n01"), "Бир суроо бүтүндөй күндү өзгөртө алабы?");
  assert.equal(
    t("m01"),
    "Баламдын күн сайын кайталанган мектеп жолун кантип алдын ала уюштурам?",
  );
  assert.equal(
    t("n02"),
    "Жооп издей баштаганда, BalaGo'нун алдын ала уюштурулган мектеп каттамы жөнүндө маалыматты көрөт.",
  );
  assert.equal(
    t("n03"),
    "Ата-эне так маалымат калтырат. Анан дареги менен убактысы ылайык келген топ изделет. Анын табылышы кепилденбейт.",
  );
  assert.equal(
    t("n04"),
    "Топ түзүлсө, биринчи толук сыноо сапары акысыз болот. Кызматты улантуу чечими андан кийин кабыл алынат.",
  );
  assert.equal(
    [t("n05"), t("n06"), t("n07")].join(" "),
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  // и каждая реплика действительно стоит в разделе VO сценария
  if (existsSync(SCENARIO)) {
    const md = readFileSync(SCENARIO, "utf8");
    const vo = md.slice(md.indexOf("## Полный VO для TTS"));
    for (const l of BG49_LINES)
      assert.ok(vo.includes(l.text), `${l.id} нет в сценарии`);
  }
});

test("ручное деление субтитров — те же слова, что в реплике, ≤ 2 строк", () => {
  for (const l of BG49_LINES.filter((x) => x.sub)) {
    assert.equal(
      l.sub.join(" "),
      l.text,
      `${l.id}: деление субтитров не совпадает с текстом`,
    );
    for (const part of l.sub)
      assert.ok(part.length <= 60, `${l.id}: «${part}» длиннее 2 строк`);
  }
});

test("голоса: диктор и мама — разные готовые голоса проекта", () => {
  assert.notEqual(BG49_VOICES.narrator.voiceId, BG49_VOICES.mother.voiceId);
  assert.equal(BG49_LINES.find((l) => l.id === "m01").role, "mother");
  assert.ok(
    BG49_LINES.filter((l) => l.id !== "m01").every(
      (l) => l.role === "narrator",
    ),
  );
});

test("обращение — только «сиз», без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "силер"]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
  assert.match(all, /өтүңүз|жазыңыз/u);
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(all, /бишкектеги балдар үчүн такси/u);
  assert.match(all, /профилдеги шилтемеге/u);
  assert.match(all, /ватсап|whatsapp/u);
  assert.match(all, /экрандагы номерге/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG49_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG49_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG49_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG49_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG49_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG49_TEXT.form.chat, "+996 998 08 38 28");
});

test("экранные надписи сценария на месте", () => {
  assert.equal(BG49_TEXT.hook.title, "БИР СУРОО");
  assert.equal(BG49_TEXT.notebook.caption, "Күн сайын кайталанган милдет");
  assert.equal(BG49_TEXT.search.caption, "Чечимди өзү издеп табат");
  assert.equal(BG49_TEXT.form.title, "Үй • Мектеп • Убакыт");
  assert.equal(BG49_TEXT.form.search, "Топ издөө");
  assert.equal(BG49_TEXT.trial.example, "Шарттуу мисал");
  assert.deepEqual(BG49_TEXT.trial.flow, ["Сыноо", "Чечим"]);
});

test("честные условия: группа не гарантирована, проба — после группы", () => {
  assert.match(all, /кепилденбейт/u);
  assert.match(BG49_TEXT.form.noGuarantee, /кепилденбейт/u);
  assert.match(BG49_TEXT.form.window, /2 жумага чейин/u);
  assert.equal(BG49_TEXT.trial.condition, "Топ түзүлсө");
  assert.match(BG49_TEXT.trial.badge, /толук сыноо сапары — акысыз/u);
  assert.deepEqual(BG49_TEXT.trial.route, ["ҮЙ", "МЕКТЕП", "ҮЙ"]);
  assert.match(BG49_TEXT.form.hint, /өзүңүз жөнөтөсүз/u);
  for (const bad of [
    "сөзсүз",
    "кепилдик",
    "кепилдейбиз",
    "дароо",
    "эртең эле",
  ]) {
    assert.doesNotMatch(all, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("нет еды, GPS-автоматики, 24/7 и «1000 сом для всех»", () => {
  for (const bad of [
    "тамак",
    "таттуу",
    "шире",
    "печенье",
    "конфет",
    "gps",
    "24/7",
    "1000 сом",
  ])
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg49Timeline(manifest);
  assert.deepEqual(checkBg49Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG49_VIDEO.fps;
  assert.ok(end - (cta.from / BG49_VIDEO.fps + BG49_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= 70 && end <= BG49_VIDEO.maxSec, `длительность ${end}`);
});

test("одна жёлтая линия: видна весь ролик и в финале неподвижна", () => {
  const tl = buildBg49Timeline(manifest);
  const keys = buildLineTrack(tl);
  for (let f = 0; f < tl.frames; f += 5) {
    const st = lineState(keys, f);
    assert.ok(st, `кадр ${f}: линии нет`);
    assert.ok(
      st.b - st.a >= (f < 36 ? 0.09 : 0.99),
      `кадр ${f}: видна только часть линии`,
    );
  }
  // финальное подчёркивание не двигается с момента появления контактов
  const cta = tl.scenes.find((s) => s.id === "cta");
  const a = lineState(
    keys,
    cta.from + Math.round(BG49_CONTACTS_IN * BG49_VIDEO.fps) + 6,
  );
  const b = lineState(keys, tl.frames - 1);
  assert.deepEqual(a.pts, b.pts);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  for (const l of BG49_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(
      ml?.file && existsSync(`public/${BG49_VIDEO.voiceDir}/${ml.file}`),
      `${l.id}: нет MP3`,
    );
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(
      ml.spoken,
      l.spoken ?? l.text,
      `${l.id}: произношение устарело`,
    );
  }
});
