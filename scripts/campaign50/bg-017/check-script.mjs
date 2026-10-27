// Проверка текста BG-017 перед синтезом и рендером (без сети): Бишкек в
// озвучке и в кадре, оба способа связи вслух и на экране, полный номер,
// кыргызские буквы, обращение ребёнка к родителям только на «сиз», нет
// запрещённых обещаний и реквизита; финал ≥ 5 с и ≥ 3 с после последнего слова.
import { B17_LINES, B17_TEXT } from "../../../src/campaign50/bg-017/script.ts";
import { buildB17Timeline, checkB17Timeline, estimateB17Manifest } from "../../../src/campaign50/bg-017/timing.ts";

const fail = [];
const spoken = (l) => (l.spoken ?? l.text).toLowerCase();
const all = B17_LINES.map(spoken).join(" ");
if (!/бишкек/.test(spoken(B17_LINES.find((l) => l.id === "n04")))) fail.push("финальная озвучка: нет Бишкека");
const n05 = spoken(B17_LINES.find((l) => l.id === "n05")) + " " + spoken(B17_LINES.find((l) => l.id === "n05b"));
if (!/профилдеги шилтеме/.test(n05)) fail.push("финальная озвучка: нет ссылки в профиле");
if (!/ватсап/.test(n05)) fail.push("финальная озвучка: нет WhatsApp");
if (!/нөл тогуз жүз токсон сегиз, нөл сегиз, отуз сегиз, жыйырма сегиз/.test(n05)) fail.push("озвучка: номер 0998 08 38 28 не произнесён");
if (!/0998 08 38 28/.test(B17_LINES.find((l) => l.id === "n05b").text)) fail.push("субтитр/текст: нет номера");
if (!/жолго чыгалы/.test(spoken(B17_LINES[B17_LINES.length - 1]))) fail.push("нет «BalaGo менен жолго чыгалы!»");
const C = B17_TEXT.cta;
if (C.city !== "Бишкек • Балдар үчүн такси") fail.push("финальный экран: нет «Бишкек • Балдар үчүн такси»");
if (C.whatsapp !== "WhatsApp: 0998 08 38 28") fail.push("финальный экран: нет номера WhatsApp");
if (C.link !== "Профилдеги шилтемеге өтүңүз") fail.push("финальный экран: нет ссылки в профиле");
if (C.or !== "же WhatsApp аркылуу жазыңыз") fail.push("финальный экран: нет «же WhatsApp аркылуу жазыңыз»");
if (!/ҮЙ → МЕКТЕП → ҮЙ/.test(C.route)) fail.push("нет ҮЙ → МЕКТЕП → ҮЙ");
if (!/[үөң]/.test(all)) fail.push("нет кыргызских букв ү/ө/ң");
const text = JSON.stringify(B17_LINES) + JSON.stringify(B17_TEXT);
for (const bad of [/24\/7/, /gps/i, /сертификат/i, /кепилдик/i, /эртең эле баштала/i, /тамак/i, /таттуу/i, /шире/i, /1000 сом/i])
  if (bad.test(text)) fail.push(`запрещённое обещание/реквизит: ${bad}`);
if (!/топ түзүл/.test(all)) fail.push("не сказано о формировании группы");
// ребёнок → родители: только «сиз» (никаких «сен/сага/сени/сенин», глаголов на -сыңбы)
for (const l of B17_LINES.filter((x) => x.role === "child")) {
  const s = spoken(l);
  if (/(^|[^\p{L}])(сен|сага|сени|сенин|сенде)([^\p{L}]|$)|[сз][ыиуү]ңб[ыиуү]([^\p{L}]|$)/u.test(s)) fail.push(`${l.id}: ребёнок обращается к родителю на «сен»`);
}
const polite = B17_LINES.filter((x) => x.role === "child").map(spoken).join(" ");
if (!/сиз/.test(polite)) fail.push("ребёнок нигде не обращается на «сиз»");
const tl = buildB17Timeline(estimateB17Manifest());
for (const p of checkB17Timeline(tl)) fail.push(`шкала: ${p}`);
if (fail.length) {
  for (const f of fail) console.error(`✗ ${f}`);
  process.exit(1);
}
console.log("✓ Текст BG-017: Бишкек, профиль и WhatsApp 0998 08 38 28 (вслух и в кадре), ҮЙ → МЕКТЕП → ҮЙ, группа до пробной поездки, «сиз» ребёнка — в порядке.");
