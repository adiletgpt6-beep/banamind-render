// Проверки сценария BalaGoBG043 «Сүйлөгөн сааттар» до рендера (node --test):
// реплики дословно по 43-BG-043.md, обращение только на «сиз», Бишкек и
// оба способа связи в озвучке и на финальном экране, номер 0998 08 38 28,
// честные условия (старт не гарантирован, «Шарттуу мисал», проба — после
// группы), без еды/GPS/24/7, финал ≥ 5 с с контактами и ≥ 3 с после
// последнего слова, файлы звуковых эффектов и музыки на месте.
// Строгий режим (BG43_STRICT_VOICE=1, CI перед рендером): озвучка есть
// для каждой реплики и совпадает с текущим текстом.
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { BG43_CONTACTS_IN, BG43_LINES, BG43_TEXT, BG43_VIDEO, BG43_VOICES } from "../../../src/campaign50/bg-043/script.ts";
import { buildBg43Timeline, checkBg43Timeline, estimateBg43Manifest } from "../../../src/campaign50/bg-043/timing.ts";
import { requireBg43Manifest } from "../../../src/campaign50/bg-043/manifestGuard.ts";
import { bg43Hash } from "./tts.mjs";

const EPISODE = "campaigns/balago-50/episodes/43-BG-043.md";
const MF = `public/${BG43_VIDEO.voiceDir}/manifest.json`;
const strict = process.env.BG43_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg43Manifest();
// что слышит зритель (текст TTS) и что читает в субтитрах
const voice = BG43_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG43_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screenStrings = [];
const collect = (v) => {
  if (typeof v === "string") screenStrings.push(v);
  else if (v && typeof v === "object") Object.values(v).forEach(collect);
};
collect(BG43_TEXT);
const screen = screenStrings.join(" \n ").toLowerCase();
const word = (re) => new RegExp(`(?<![\\p{L}])(?:${re})(?![\\p{L}])`, "iu");
const t = (id) => BG43_LINES.find((x) => x.id === id).text;

// Дословно из campaigns/balago-50/episodes/43-BG-043.md
const EXPECTED = {
  w01: "Мен жумушту эскертем!",
  s01: "Мен мектептен алып кетүү убактысын эскертем!",
  m01: "Экөөңөр тең маанилүүсүңөр. Бирок бир эле убакта эки жерде боло албайм да.",
  n01: "Эскертме өзү баланы жеткирбейт. Ошондуктан апа кайталанган мектеп жолун алдын ала уюштуруу мүмкүнчүлүгүн издей баштады.",
  n02: "BalaGo'го так дарек, мектеп, сабактын убактысы керек. Адегенде ылайыктуу топ изделет; баштала турган күн кепилденбейт.",
  n03: "Топ уюшулганда биринчи толук сыноо сапары акысыз. Андан кийин улантуу чечимин өзүңүз кабыл аласыз.",
};
const CTA =
  "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!";

test("реплики героев и диктора дословно по сценарию 43-BG-043.md", () => {
  assert.deepEqual(
    BG43_LINES.map((l) => l.id),
    ["w01", "s01", "m01", "n01", "n02", "n03", "n04", "n05", "n06"],
  );
  for (const [id, text] of Object.entries(EXPECTED)) assert.equal(t(id), text, id);
  assert.equal([t("n04"), t("n05"), t("n06")].join(" "), CTA);
  // роли: Саат 1 — «Жумуш сааты», Саат 2 — «Мектеп сааты», Апа, диктор
  const role = (id) => BG43_LINES.find((x) => x.id === id).role;
  assert.deepEqual(
    ["w01", "s01", "m01", "n01", "n02", "n03", "n04", "n05", "n06"].map(role),
    ["work", "school", "mom", "narrator", "narrator", "narrator", "narrator", "narrator", "narrator"],
  );
  // страховка от опечаток при копировании: строки есть в файле сценария
  if (existsSync(EPISODE)) {
    const md = readFileSync(EPISODE, "utf8");
    for (const text of [...Object.values(EXPECTED), CTA]) assert.ok(md.includes(text), `нет в ${EPISODE}: «${text}»`);
  }
});

test("произношение для TTS: BalaGo и WhatsApp кириллицей, смысл тот же", () => {
  for (const l of BG43_LINES) {
    const s = l.spoken ?? l.text;
    assert.doesNotMatch(s, /[A-Za-z]/, `${l.id}: латиница в тексте для TTS`);
    const norm = (x) => x.replace(/BalaGo'?/g, "БалаГо").replace(/WhatsApp/g, "Ватсап");
    assert.equal(norm(l.text), s, `${l.id}: spoken расходится с текстом`);
  }
});

test("обращение к родителю — только «сиз», без «сен/сага»", () => {
  for (const bad of ["сен", "сага", "сени", "сенин", "сенден", "сенде", "силер"]) {
    assert.doesNotMatch(voice, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
  for (const ok of ["өзүңүз", "аласыз", "өтүңүз", "жазыңыз", "балаңызды"]) assert.match(voice, new RegExp(ok, "u"), ok);
  assert.match(screen, /сизде/u);
});

test("Бишкек, профиль и WhatsApp звучат в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге өтүңүз/u);
  assert.match(spoken, /ватсап аркылуу жазыңыз/u);
  assert.match(spoken, /экрандагы номерге/u);
  assert.match(voice, /whatsapp/u);
  // финальная фраза — последней
  assert.equal(BG43_LINES[BG43_LINES.length - 1].text, "BalaGo менен жолго чыгалы!");
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG43_TEXT.cta.brand, "BalaGo");
  assert.equal(BG43_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG43_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG43_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG43_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG43_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("экранные надписи сценария", () => {
  assert.equal(BG43_TEXT.hook.title, "СААТТАР ТАЛАШЫ");
  assert.equal(BG43_TEXT.hook.fiction, "Ойдон чыгарылган тамаша");
  assert.equal(BG43_TEXT.hook.work.time, "08:00");
  assert.equal(BG43_TEXT.hook.school.time, "13:00");
  assert.equal(BG43_TEXT.align.caption, "Бир ата-эне — эки милдет");
  assert.equal(BG43_TEXT.search.caption, "Эскертме эмес — каттамды пландоо");
  assert.equal(BG43_TEXT.search.page, "Кайталанган жол");
  assert.equal(BG43_TEXT.fields.caption, "Так маалымат → топ издөө");
  assert.deepEqual(
    BG43_TEXT.fields.fields.map((f) => f.k),
    ["Үй", "Мектеп", "Убакыт"],
  );
});

test("честные условия: старт не гарантирован, проба — после группы", () => {
  assert.match(t("n02"), /баштала турган күн кепилденбейт/u);
  assert.equal(BG43_TEXT.fields.noStart, "Баштала турган күн кепилденбейт");
  assert.ok(BG43_TEXT.fields.strip.includes("Күтүү мүмкүн"));
  assert.equal(BG43_TEXT.trial.example, "Шарттуу мисал");
  assert.equal(BG43_TEXT.trial.after, "Топ уюшулгандан кийин");
  assert.equal(BG43_TEXT.trial.badge, "Акысыз толук сыноо");
  assert.equal(BG43_TEXT.trial.route, "Биринчи толук сапар: ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG43_TEXT.trial.choice, "Улантуу чечими — сизде");
  assert.match(BG43_TEXT.trial.pay, /улантууну чечкенден кийин гана/u);
  assert.match(t("n03"), /^Топ уюшулганда биринчи толук сыноо сапары акысыз\./u);
  // без абсолютных обещаний и «мгновенного» старта
  for (const bad of ["сөзсүз", "кепилдик", "кепилдейбиз", "кепилдейт", "дароо", "эртең эле", "ошол эле күнү"]) {
    assert.doesNotMatch(voice, word(bad), bad);
    assert.doesNotMatch(screen, word(bad), bad);
  }
});

test("нет еды, GPS-автоматики, 24/7 и «1000 сом для всех»", () => {
  for (const bad of ["тамак", "таттуу", "шире", "печенье", "конфет", "gps", "24/7", "1000 сом", "автокресло", "push"]) {
    assert.ok(!voice.includes(bad), `озвучка: ${bad}`);
    assert.ok(!screen.includes(bad), `экран: ${bad}`);
  }
});

test("экран на кыргызском: латиница только в BalaGo, WhatsApp и доменах .kg", () => {
  for (const s of screenStrings) {
    const rest = s.replace(/BalaGo|WhatsApp|\.kg\b/g, "");
    assert.doesNotMatch(rest, /[A-Za-z]/, `латиница в надписи «${s}»`);
  }
});

test("кыргызские буквы ү, ө, ң в озвучке и на экране", () => {
  for (const ch of ["ү", "ө", "ң"]) {
    assert.ok(voice.includes(ch), `озвучка: ${ch}`);
    assert.ok(screen.includes(ch), `экран: ${ch}`);
  }
});

test("голоса ролей разные, хэш озвучки учитывает всё, что меняет звук", () => {
  const ids = Object.values(BG43_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, ids.length);
  const l = BG43_LINES[0];
  const v = BG43_VOICES[l.role].voiceId;
  const h = bg43Hash(l, v);
  assert.match(h, /^[0-9a-f]{16}$/);
  assert.equal(bg43Hash({ ...l }, v), h);
  assert.notEqual(bg43Hash({ ...l, text: `${l.text} ` }, v), h);
  assert.notEqual(bg43Hash({ ...l, spoken: "Мен жумушту эскертем." }, v), h);
  assert.notEqual(bg43Hash({ ...l, tag: "[calm]" }, v), h);
  assert.notEqual(bg43Hash(l, "other-voice"), h);
  assert.notEqual(bg43Hash(l, v, 1), h);
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с, длительность", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg43Timeline(manifest);
  assert.deepEqual(checkBg43Timeline(tl), []);
  const fps = BG43_VIDEO.fps;
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / fps;
  assert.ok(end - (cta.from / fps + BG43_CONTACTS_IN) >= 5, "контакты на экране < 5 с");
  assert.ok(end - tl.speechEnd >= 3, `после последнего слова ${(end - tl.speechEnd).toFixed(2)} с`);
  assert.ok(end >= 60 && end <= BG43_VIDEO.maxSec, `длительность ${end.toFixed(2)} с`);
  // контакты появляются раньше, чем диктор их называет
  const n05 = tl.cues.find((c) => c.id === "n05");
  assert.ok(cta.from / fps + BG43_CONTACTS_IN <= n05.from, "контакты появляются позже реплики n05");
  // реплики не перекрываются и идут по порядку сцен
  for (let i = 1; i < tl.cues.length; i++) assert.ok(tl.cues[i].from >= tl.cues[i - 1].to, `${tl.cues[i].id} перекрывает ${tl.cues[i - 1].id}`);
});

test("звуковые эффекты и музыка на месте", () => {
  const src = readFileSync("src/campaign50/bg-043/sfxCues.ts", "utf8");
  const block = /SFX_NAMES\s*=\s*\[([\s\S]*?)\]/.exec(src)?.[1] ?? "";
  const names = [...block.matchAll(/"([A-Za-z]+)"/g)].map((m) => m[1]);
  assert.ok(names.length >= 10, "SFX_NAMES не найден");
  for (const n of names) {
    const f = `public/${BG43_VIDEO.audioDir}/sfx/${n}.mp3`;
    assert.ok(existsSync(f) && statSync(f).size > 500, `нет эффекта ${f}`);
  }
  const music = `public/${BG43_VIDEO.audioDir}/music.mp3`;
  assert.ok(existsSync(music), "нет music.mp3");
  assert.ok(statSync(music).size > 200_000 && statSync(music).size < 2.5 * 1048576, "music.mp3: неожиданный размер");
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  assert.equal(manifest.kind, "bg043");
  assert.ok(!manifest.partial && !manifest.estimated, "озвучка неполная");
  const files = new Set();
  for (const l of BG43_LINES) {
    const ml = manifest.lines.filter((x) => x.id === l.id);
    assert.equal(ml.length, 1, `${l.id}: реплика в манифесте не одна`);
    const path = `public/${BG43_VIDEO.voiceDir}/${ml[0].file}`;
    assert.ok(ml[0].file && existsSync(path) && statSync(path).size > 1000, `${l.id}: нет MP3`);
    files.add(`${BG43_VIDEO.voiceDir}/${ml[0].file}`);
    assert.equal(ml[0].text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml[0].spoken ?? ml[0].text, l.spoken ?? l.text, `${l.id}: произносимый текст устарел`);
    // хэш — по базовому seed реплики (как в voice.mjs): голос, модель, тег и
    // настройки те же, что сейчас в script.ts
    assert.equal(ml[0].hash, bg43Hash(l, BG43_VOICES[l.role].voiceId), `${l.id}: озвучка сделана с другими параметрами`);
  }
  // та же проверка, что выполняет композиция при рендере с requireVoice
  requireBg43Manifest(manifest, files);
});
