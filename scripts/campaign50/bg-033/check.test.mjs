// Проверки сценария BalaGoBG033 до рендера (node --test):
// реплики дословно по утверждённому сценарию 33-BG-033.md, Бишкек и оба
// способа связи в озвучке и на финальном экране, номер 0998 08 38 28,
// ҮЙ → МЕКТЕП → ҮЙ, честные условия (проба только после формирования
// группы, без мгновенного старта, без цен и гарантий), финал ≥ 5 с с
// контактами и ≥ 3 с после речи, только «сиз».
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { BG33_CONTACTS_IN, BG33_LINES, BG33_TEXT, BG33_VIDEO } from "../../../src/campaign50/bg-033/script.ts";
import { buildBg33Timeline, checkBg33Timeline, estimateBg33Manifest } from "../../../src/campaign50/bg-033/timing.ts";

const MF = `public/${BG33_VIDEO.voiceDir}/manifest.json`;
const SCRIPT = "campaigns/balago-50/episodes/33-BG-033.md";
const strict = process.env.BG33_STRICT_VOICE === "1";
const manifest = existsSync(MF) ? JSON.parse(readFileSync(MF, "utf8")) : estimateBg33Manifest();
const all = BG33_LINES.map((l) => `${l.text} ${l.spoken ?? ""}`).join(" ").toLowerCase();
const spoken = BG33_LINES.map((l) => l.spoken ?? l.text).join(" ").toLowerCase();
const screen = JSON.stringify(BG33_TEXT).toLowerCase();

// Раздел «Отдельный VO script для TTS»: «**N. …:** **Роль:** «текст»»
const scenarioVo = () => {
  const md = readFileSync(SCRIPT, "utf8");
  const sec = md.split("## Отдельный VO script для TTS")[1].split("\n## ")[0];
  const out = [];
  for (const m of sec.matchAll(/\*\*(\d)\.[^*]*\*\*\s*\*\*([^:*]+):\*\*\s*«(.+)»\s*$/gmu)) out.push({ n: Number(m[1]), role: m[2].trim(), text: m[3] });
  return out;
};

test("реплики дословно по утверждённому сценарию 33-BG-033.md", () => {
  const vo = scenarioVo();
  assert.equal(vo.length, 6, "в сценарии 6 реплик");
  const byScene = { 1: ["m01"], 2: ["n02"], 3: ["n03", "n04"], 4: ["n05", "n06"], 5: ["n07", "n08"], 6: ["n09", "n10", "n11"] };
  for (const v of vo) {
    const ids = byScene[v.n];
    const joined = ids.map((id) => BG33_LINES.find((l) => l.id === id).text).join(" ");
    assert.equal(joined, v.text, `сцена ${v.n}`);
    const role = v.role === "Апа" ? "mother" : "narrator";
    for (const id of ids) assert.equal(BG33_LINES.find((l) => l.id === id).role, role, id);
  }
  assert.equal(BG33_LINES.length, 11);
});

test("spoken отличается только записью бренда и мессенджера", () => {
  for (const l of BG33_LINES) {
    if (!l.spoken) continue;
    const norm = (s) => s.replace(/BalaGo'до/g, "БалаГодо").replace(/BalaGo/g, "БалаГо").replace(/WhatsApp/g, "вотсап");
    assert.equal(norm(l.text), l.spoken, l.id);
  }
});

test("Бишкек и оба способа связи в озвучке", () => {
  assert.match(spoken, /бишкектеги балдар үчүн такси/u);
  assert.match(spoken, /профилдеги шилтемеге өтүңүз/u);
  assert.match(spoken, /вотсап аркылуу жазыңыз/u);
  assert.match(spoken, /жолго чыгалы/u);
});

test("финальный экран: город, профиль, WhatsApp и полный номер", () => {
  assert.equal(BG33_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
  assert.equal(BG33_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG33_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG33_TEXT.cta.whatsappLabel, "WhatsApp:");
  assert.equal(BG33_TEXT.cta.whatsappNumber, "0998 08 38 28");
});

test("надписи сценария на месте", () => {
  assert.equal(BG33_TEXT.title, "Алгач сынап көрүңүз");
  assert.equal(BG33_TEXT.hook.question, "АЛГАЧ СЫНАП КӨРСӨ БОЛОБУ?");
  assert.equal(BG33_TEXT.hook.note, "Төлөйүнбү?");
  assert.equal(BG33_TEXT.rule.headline, "Биринчи толук сыноо — акысыз");
  assert.equal(BG33_TEXT.wait.group, "Адегенде ылайыктуу топ");
  assert.equal(BG33_TEXT.wait.notNow, "Дароо башталбайт");
  assert.equal(BG33_TEXT.trial.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(BG33_TEXT.example, "Шарттуу мисал");
  assert.equal(BG33_TEXT.choice.yes, "Улантам");
  assert.equal(BG33_TEXT.choice.no, "Улантпайм");
  assert.equal(BG33_TEXT.choice.decision, "Сыноо → өзүңүздүн чечимиңиз");
});

test("цитата сайта BalaGo дословна (src/i18n/translations.ts, trial)", () => {
  assert.equal(
    BG33_TEXT.rule.siteText,
    "Биринчи сыноо сапары — толук күн: үй → мектеп → үй — ар дайым акысыз. Ал жетиштүү бала жыйналганда өтөт жана эч бир сапар пакетине кирбейт.",
  );
  assert.ok(BG33_TEXT.rule.siteText.includes(BG33_TEXT.rule.underline));
});

test("условия честные: проба после группы, без мгновенного старта и обещаний", () => {
  assert.match(all, /топ түзүлгөндө/u);
  assert.match(all, /акысыз/u);
  assert.match(all, /башталбайт/u);
  assert.match(all, /чечим/u);
  assert.match(BG33_TEXT.rule.condition, /топ түзүлгөндөн кийин/u);
  // «дароо» — только в честной надписи «Дароо башталбайт»
  assert.ok(!all.includes("дароо"));
  assert.equal(screen.split("дароо").length - 1, 1);
  for (const bad of ["сом", "1000", "1200", "1500", "тамак", "таттуу", "шире", "печенье", "gps", "24/7", "кепилдик", "эртең эле", "кресло", "отургуч", "гарант"]) {
    assert.ok(!all.includes(bad) && !screen.includes(bad), bad);
  }
});

test("кыргызские буквы ү, ө, ң", () => {
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
});

test("только «сиз»: реплик ребёнка нет, нет «сен/сага/сени/сенин»", () => {
  assert.ok(BG33_LINES.every((l) => l.role === "narrator" || l.role === "mother"));
  assert.ok(!/(?<![\p{L}])(сен|сага|сени|сенин|сенде)(?![\p{L}])/iu.test(all + screen));
});

test("шкала: финал с контактами ≥ 5 с, после речи ≥ 3 с", () => {
  if (strict) assert.ok(existsSync(MF), "нет manifest.json озвучки");
  const tl = buildBg33Timeline(manifest);
  assert.deepEqual(checkBg33Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const end = tl.frames / BG33_VIDEO.fps;
  assert.ok(end - (cta.from / BG33_VIDEO.fps + BG33_CONTACTS_IN) >= 5);
  assert.ok(end - tl.speechEnd >= 3);
  assert.ok(end >= BG33_VIDEO.minSec - 0.05 && end <= BG33_VIDEO.maxSec, `длительность ${end}`);
});

test("озвучка актуальна (строгий режим)", { skip: !strict }, () => {
  assert.ok(!manifest.partial && !manifest.estimated, "озвучка неполная");
  for (const l of BG33_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml?.file && existsSync(`public/${BG33_VIDEO.voiceDir}/${ml.file}`), `${l.id}: нет MP3`);
    assert.equal(ml.text, l.text, `${l.id}: текст устарел`);
    assert.equal(ml.spoken, l.spoken ?? l.text, `${l.id}: текст для синтеза устарел`);
  }
});
