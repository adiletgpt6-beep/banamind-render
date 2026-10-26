// Тесты BalaGo32DadDriver: тексты реплик по сценарию, шкала по озвучке,
// субтитры, надписи (кыргызча), озвучка и голоса.
// Запуск: npm run test:dad-driver
// DD_STRICT_VOICE=1 — озвучка обязана быть полной и актуальной (CI render).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { DD_LINES, DD_SCENES, DD_TEXT, DD_VIDEO, DD_VOICES } from "../src/dad-driver/script.ts";
import { buildDdTimeline, checkDdTiming, estimateDdManifest } from "../src/dad-driver/timing.ts";
import { requireDdManifest } from "../src/dad-driver/manifestGuard.ts";
import { chunkLine, subtitleWindows } from "../src/dad-driver/subs.ts";
import { ddHash } from "./lib/dd-tts.mjs";

const MANIFEST = `public/${DD_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const strict = process.env.DD_STRICT_VOICE === "1";

test("формат: 1080×1920, 30 fps, композиция BalaGo32DadDriver", () => {
  assert.equal(DD_VIDEO.id, "BalaGo32DadDriver");
  assert.equal(DD_VIDEO.width, 1080);
  assert.equal(DD_VIDEO.height, 1920);
  assert.equal(DD_VIDEO.fps, 30);
});

test("14 сцен по раскадровке, по порядку", () => {
  assert.deepEqual(
    DD_SCENES.map((s) => s.id),
    ["hook", "task", "ask", "why", "reply", "model", "blueprint", "office", "question", "week", "apply", "rewrite", "read", "cta"],
  );
});

// Звучащие реплики из сценария (VO01–VO19); VO04 и VO17 озвучены частями.
const SCRIPT = {
  VO01: "Уулу анкетага: «Атам — айдоочу», — деп жазды. Атасы болсо он жылдан бери инженер болуп иштейт.",
  VO02: "Биринчи класстын окуучуларына ата-энесинин кесиби жөнүндө айтып келүү тапшырмасы берилген. Апасы уулунун жазгандарын текшерип жатып, атасын чакырды.",
  VO03: "Эмне үчүн ушинтип жаздың? Айтып бересиңби?",
  VO04: "Эртең менен мени мектепке жеткиресиң. Анан жумушка кетесиң. Сабак бүткөндө кайра келип, мени алып кетесиң. Апамдын машинасы оңдоодо болгондо, аны да жеткиресиң.",
  VO05: "Туура, сен мени көбүнчө рулда көрөсүң.",
  VO06: "Сен машинаны жакшы айдайсың. Сени менен барган мага жагат.",
  VO07: "Атасы уулунун ийнинен сылап, текчеден кичинекей макет алып келди.",
  VO08: "Жумушта эмне кыларымды көргүң келеби?",
  VO09: "Алар макетти чогуу карашты. Атасы чиймелерин көрсөтүп, кагаздагы сүрөт кантип чыныгы жабдууга айланарын түшүндүрдү.",
  VO10: "Дем алыш күнү уулун кеңсесине алып барды. Иштеген жерин көрсөтүп, жаңы долбоорду чогуу даярдап жаткан кесиптеши менен тааныштырды.",
  VO11: "Мени мектептен алып кеткенден кийин, кайра ушул жакка келесиңби?",
  VO12: "Ооба, көбүнчө кайра келем.",
  VO13: "Кечинде ата-энеси кийинки жуманын графигин карашты. Атасында узак жумуш талкуулары, апасында кардарлар менен жолугушуулар бар. Баланы үйдөн чоң энеси тосуп ала алат.",
  VO14: "Алар мектепке барып-келүүгө жардам издей башташты. BalaGo тууралуу окуп, маршрут менен убакытты сүйлөшүү үчүн алдын ала өтүнмө калтырышты.",
  VO15: "Апа, «инженер» деген сөздү жазганга жардам берчи.",
  VO16: "Анкетаны кайра толтуруп, дагы бир сүйлөм кошту.",
  VO17: "Атам машинаны жакшы айдайт. Татаал нерселерди да түшүнүктүү айтып берет.",
  VO18: "Атасы окуп, жылмайды.",
  VO19: "BalaGo — Бишкекте балдар үчүн такси. Үйдөн мектепке, мектептен үйгө. BalaGo менен жолго чыгалы! Профилдин башындагы шилтемеге өтүңүз же экрандагы номерге вотсаптан жазыңыз.",
};

test("реплики VO01–VO19 по сценарию, по порядку, ничего лишнего", () => {
  const joined = {};
  for (const l of DD_LINES) joined[l.vo] = joined[l.vo] ? `${joined[l.vo]} ${l.text}` : l.text;
  assert.deepEqual(Object.keys(joined), Object.keys(SCRIPT));
  for (const [vo, text] of Object.entries(SCRIPT)) assert.equal(joined[vo], text, vo);
});

test("роли: рассказчик, папа, сын; у мамы реплик нет; один голос на роль", () => {
  const roles = Object.fromEntries(Object.keys(SCRIPT).map((vo) => [vo, DD_LINES.find((l) => l.vo === vo).role]));
  assert.deepEqual(roles, {
    VO01: "narrator", VO02: "narrator", VO03: "father", VO04: "son", VO05: "father", VO06: "son", VO07: "narrator", VO08: "father",
    VO09: "narrator", VO10: "narrator", VO11: "son", VO12: "father", VO13: "narrator", VO14: "narrator", VO15: "son", VO16: "narrator",
    VO17: "son", VO18: "narrator", VO19: "narrator",
  });
  for (const l of DD_LINES) assert.ok(DD_VOICES[l.role]?.voiceId, l.id);
});

test("бренд звучит «Балаго», на экране — BalaGo; служебных фраз нет", () => {
  for (const l of DD_LINES) {
    const spoken = l.spoken ?? l.text;
    assert.ok(!/BalaGo/.test(spoken), `${l.id}: латиница в озвучке`);
    if (/BalaGo/.test(l.text)) assert.match(spoken, /Балаго/);
    assert.ok(!/ChatGPT|ИИ|нейросет|AI/i.test(spoken), l.id);
  }
});

const strings = (x) => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(strings) : []);

test("надписи — кыргызча кириллица (ү, ө, ң), латиница только в BalaGo и WhatsApp", () => {
  const all = [...DD_LINES.map((l) => l.text), ...strings(DD_TEXT)];
  for (const s of all) {
    const latin = s.replace(/BalaGo|WhatsApp/g, "").match(/[A-Za-z]/g);
    assert.equal(latin, null, `латиница: «${s}»`);
    // нет «похожих» замен кыргызских букв (y/Y вместо ү/Ү, ö, ҥ и т. п.)
    assert.ok(!/[ӱӧҥӰӦҤ]/.test(s), `чужая буква в «${s}»`);
  }
  assert.ok(all.some((s) => /ү/.test(s)) && all.some((s) => /ө/.test(s)) && all.some((s) => /ң/.test(s)));
});

test("без цен, гарантий, доменов и выдуманных обещаний; WhatsApp — только в финале", () => {
  const { whatsappNumber, whatsappLabel, ...ctaRest } = DD_TEXT.cta;
  const rest = { ...DD_TEXT, cta: ctaRest };
  const lines = DD_LINES.filter((l) => l.id !== "vo19").map((l) => l.text);
  const all = [...lines, ...strings(rest)].join(" | ");
  assert.ok(!/сом|\$|₸|кепилдик|лиценз|эч качан кечикпейбиз|WhatsApp|Ватсап|вотсап|\.kg|\.com|https?:/i.test(all));
  assert.ok(!/\d{3}/.test(all), "длинные числа (телефоны, цены)");
  // финал: ссылка в шапке профиля или WhatsApp; номер — только на экране
  const vo19 = DD_LINES.find((l) => l.id === "vo19");
  assert.match(vo19.text, /Профилдин башындагы шилтемеге өтүңүз же экрандагы номерге вотсаптан жазыңыз\.$/);
  assert.ok(!/\d/.test(vo19.text) && !/\d/.test(vo19.spoken), "номер не читается голосом");
  assert.ok(!/сом|кепилдик|лиценз|https?:/i.test(vo19.text));
  assert.equal(whatsappLabel, "WhatsApp");
  assert.equal(whatsappNumber, "0998 08 38 28");
  assert.equal(DD_TEXT.apply.sent, "Өтүнмө жөнөтүлдү");
  assert.equal(DD_TEXT.cta.link, "Шилтеме профилдин башында");
});

test("шкала по оценочным таймингам сходится", () => {
  const tl = buildDdTimeline(estimateDdManifest());
  assert.equal(tl.scenes.length, 14);
  for (let i = 1; i < tl.scenes.length; i++) assert.equal(tl.scenes[i].from, tl.scenes[i - 1].to);
  assert.deepEqual(checkDdTiming(estimateDdManifest()), []);
});

test("субтитры: не длиннее двух строк, все слова каждой реплики, по порядку", () => {
  for (const l of DD_LINES) {
    const parts = chunkLine(l.text);
    for (const p of parts) assert.ok(p.text.length <= 52, `${l.id}: «${p.text}» (${p.text.length})`);
    assert.equal(parts.map((p) => p.text).join(" "), l.text, l.id);
  }
  const tl = buildDdTimeline(manifest ?? estimateDdManifest());
  const wins = subtitleWindows(tl.cues);
  for (let i = 1; i < wins.length; i++) assert.ok(wins[i].from >= wins[i - 1].to - 1e-6, `перекрытие ${wins[i - 1].id}/${wins[i].id}`);
  for (const w of wins) assert.ok(w.to - w.from >= 0.7, `слишком коротко: «${w.text}»`);
});

test("озвучка: полная, актуальная, шкала 128–155 с, финал держится ≥ 1,2 с", { skip: !manifest && !strict }, () => {
  assert.ok(manifest, "нет manifest.json");
  const files = new Set(DD_LINES.map((l) => `${DD_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(`public/${f}`)));
  const m = requireDdManifest(manifest, files);
  for (const l of DD_LINES) {
    const ml = m.lines.find((x) => x.id === l.id);
    assert.equal(ml.hash, ddHash(l, DD_VOICES[l.role].voiceId), `${l.id}: озвучка устарела`);
    assert.equal(ml.voiceId, DD_VOICES[l.role].voiceId, `${l.id}: не тот голос`);
  }
  // смысловые слова (mustHear) распознаны в выбранном дубле
  for (const l of DD_LINES.filter((x) => x.mustHear?.length)) {
    const heard = ` ${String(m.lines.find((x) => x.id === l.id).asrHeard ?? "").toLowerCase()} `;
    for (const w of l.mustHear) assert.ok(heard.includes(` ${w}`), `${l.id}: распознавание не слышит «${w}»: ${heard.trim()}`);
  }
  const tl = buildDdTimeline(m);
  const sec = tl.frames / DD_VIDEO.fps;
  assert.ok(sec >= 128 && sec <= 155, `длина ${sec.toFixed(1)} с`);
  assert.ok(sec - tl.cues.at(-1).to >= 1.2);
});
