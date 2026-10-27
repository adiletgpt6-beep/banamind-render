// Проверка текста BG-006 перед синтезом и рендером (без сети):
// Бишкек в озвучке и в кадре, оба способа связи вслух и на экране, полный
// номер, кыргызские буквы, вежливое «сиз» коллеги, отсутствие запрещённых
// обещаний; финальный экран ≥ 5 с и ≥ 3 с после последнего слова.
import { B6_CTA_FROM, B6_DIALOG_END, B6_LINES, B6_TEXT, B6_VIDEO } from "../../../src/campaign50/bg-006/script.ts";

const fail = [];
const spoken = (l) => (l.spoken ?? l.text).toLowerCase();
const cta = B6_LINES.at(-1);
if (!/бишкек/.test(spoken(cta))) fail.push("финальная озвучка: нет Бишкека");
if (!/профилдеги шилтеме/.test(spoken(cta))) fail.push("финальная озвучка: нет ссылки в профиле");
if (!/ватсап|whatsapp/.test(spoken(cta))) fail.push("финальная озвучка: нет WhatsApp");
if (B6_TEXT.cta.city !== "Бишкек • Балдар үчүн такси") fail.push("финальный экран: нет «Бишкек • Балдар үчүн такси»");
if (!B6_TEXT.cta.whatsapp.includes("0998 08 38 28")) fail.push("финальный экран: нет номера 0998 08 38 28");
if (!/профилдеги шилтеме/i.test(B6_TEXT.cta.link)) fail.push("финальный экран: нет ссылки в профиле");
if (B6_VIDEO.durationSec - B6_CTA_FROM < 5) fail.push("контакты на экране < 5 с");
if (B6_VIDEO.durationSec - B6_DIALOG_END < 3) fail.push("после последнего слова < 3 с");
const all = B6_LINES.map((l) => l.text).join(" ") + JSON.stringify(B6_TEXT);
if (!/[үөң]/.test(all)) fail.push("нет кыргызских букв ү/ө/ң");
for (const bad of [/24\/7/, /gps/i, /сертификат/i, /кепилдик/i, /эртең эле/i, /тамак/i, /таттуу/i]) if (bad.test(all)) fail.push(`запрещённое обещание/реквизит: ${bad}`);
// обращение коллеги к маме — вежливое «сиз»
const c01 = B6_LINES.find((l) => l.id === "c01");
if (/\bсен\b|\bсага\b/i.test(c01.text) || !/ңүз|сиз/i.test(c01.text)) fail.push("c01: нужна вежливая форма «сиз»");
if (fail.length) {
  for (const f of fail) console.error(`✗ ${f}`);
  process.exit(1);
}
console.log("✓ Текст BG-006: Бишкек, профиль и WhatsApp 0998 08 38 28, хронометраж финала, «сиз» — в порядке.");
