// Проверки текста и шкалы BalaGoBG039 (node --test):
// реплики сценария, действующее правило компенсации сайта, Бишкек в голосе
// и кадре, оба способа связи и полный номер, тайминг финала, титры.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { captionWords, chunksOf } from "../../../src/campaign50/bg-039/captions.ts";
import { requireBg39Manifest } from "../../../src/campaign50/bg-039/manifestGuard.ts";
import { BG39_COMP_TIERS, BG39_COMP_WINDOW, BG39_LINES, BG39_TEXT, BG39_VIDEO, BG39_VOICES, compensationFor } from "../../../src/campaign50/bg-039/script.ts";
import { buildBg39Timeline, checkBg39Timeline, estimateBg39Manifest } from "../../../src/campaign50/bg-039/timing.ts";
import { TS2_VOICES } from "../../../src/two-schedules-2d/script.ts";

const spoken = (l) => l.spoken ?? l.text;
const all = BG39_LINES.map(spoken).join(" ");
const byId = (id) => BG39_LINES.find((l) => l.id === id);
const SCRIPT = readFileSync("campaigns/balago-50/episodes/39-BG-039.md", "utf8");

test("реплики сценария без изменений (n1, n2, n4, финал)", () => {
  for (const id of ["n1", "n2", "n4", "n5"]) assert.ok(SCRIPT.includes(`«${byId(id).text}»`), `${id} не совпадает со сценарием`);
  // реплика отца: уточнено одно слово («барып-келүү»), вопрос — как в сценарии
  assert.match(byId("f1").text, /^Барып-келүү бир толук сапар болуп эсептелет го\. /);
  assert.ok(SCRIPT.includes(byId("f1").text.split(". ")[1]));
});

test("правило компенсации = формула сайта (serviceFailureCompensation.ts)", () => {
  // сайт: 0 → 0; иначе max(1, floor(min(n, 10) / 2))
  const site = (n) => (n <= 0 ? 0 : Math.max(1, Math.floor(Math.min(Math.floor(n), 10) / 2)));
  for (let n = 0; n <= 12; n++) assert.equal(compensationFor(n), site(n), `n=${n}`);
  assert.equal(BG39_COMP_WINDOW, 10);
  // публичная шкала одного блока: 1–3 → 1, 4–5 → 2, 6–7 → 3, 8–9 → 4, 10 → 5
  const tiers = [];
  for (let n = 1; n <= 10; n++) {
    const r = compensationFor(n);
    const last = tiers[tiers.length - 1];
    if (last && last.rides === r) last.max = n;
    else tiers.push({ min: n, max: n, rides: r });
  }
  assert.deepEqual(BG39_COMP_TIERS.map((t) => ({ ...t })), tiers);
  assert.deepEqual(
    BG39_TEXT.rule.tiers.map((t) => `${t.range} ${t.result}`),
    ["1–3 жолу +1 сапар акысыз", "4–5 жолу +2 сапар акысыз", "6–7 жолу +3 сапар акысыз", "8–9 жолу +4 сапар акысыз", "10 жолу +5 сапар акысыз"],
  );
  assert.match(BG39_TEXT.rule.added, /Компенсация пакетиңизге кошулат/);
});

test("исходник сайта (если доступен) всё ещё даёт ту же шкалу", () => {
  const dir = process.env.BALAGO_SITE_DIR;
  if (!dir || !existsSync(join(dir, "src/data/serviceFailureCompensation.ts"))) return;
  const src = readFileSync(join(dir, "src/data/serviceFailureCompensation.ts"), "utf8");
  assert.match(src, /accountingWindowRides:\s*10/);
  assert.match(src, /Math\.max\(1, Math\.floor\(normalizedFailures \/ 2\)\)/);
  const block = readFileSync(join(dir, "src/components/sections/ServiceGuaranteeBlock.tsx"), "utf8");
  assert.match(block, /getCompensationScaleRows/);
});

test("реплика правила: шкала сайта, без удалённой формулировки «не списывается»", () => {
  const n3 = byId("n3").text;
  assert.match(n3, /кызматтын себебинен/);
  assert.match(n3, /ар бир он сапар боюнча эсептелет/);
  assert.match(n3, /бирден үчкө чейин болсо, пакетиңизге бир акысыз сапар кошулат/);
  assert.match(n3, /төрт же беш болсо — эки акысыз сапар/);
  // прежнее правило сайт удалил (8d505c3) — в ролике его нет
  assert.doesNotMatch(all + JSON.stringify(BG39_TEXT), /топтомдон алынбайт|пакеттен эсептен чыгарылбайт|0 сом|бүтүндөй .* акысыз болот/i);
  // пропуски ребёнка — отдельная скидка
  assert.match(byId("n4").text, /арзандатуудан башка эреже/);
});

test("в ролике нет реплик ребёнка к родителям на «сен»", () => {
  for (const l of BG39_LINES.filter((x) => !["narrator", "father"].includes(x.role))) {
    assert.match(l.text, /(^|\s)(сиз|сизге|сизди|сиздин)/u, l.text);
    assert.doesNotMatch(l.text, /(^|[\s,])(сен|сага|сени|сенин)([\s,.!?]|$)/iu, l.text);
  }
});

test("голоса — готовые голоса проекта (TS2_VOICES)", () => {
  for (const [role, v] of Object.entries(BG39_VOICES)) assert.equal(TS2_VOICES[role].voiceId, v.voiceId, role);
  for (const l of BG39_LINES) assert.ok(BG39_VOICES[l.role], l.id);
});

test("Бишкек в озвучке и на финальном экране", () => {
  assert.match(all, /Бишкек/);
  assert.equal(BG39_TEXT.cta.city, "Бишкек • Балдар үчүн такси");
});

test("финал: ссылка в профиле И WhatsApp, полный номер, слоган", () => {
  const cta = BG39_LINES.find((l) => l.scene === "cta");
  assert.ok(cta);
  assert.equal(
    cta.text,
    "BalaGo — Бишкектеги балдар үчүн такси. Балаңызды алдын ала каттоо үчүн профилдеги шилтемеге өтүңүз же экрандагы номерге WhatsApp аркылуу жазыңыз. BalaGo менен жолго чыгалы!",
  );
  assert.match(spoken(cta), /профилдеги шилтемеге/);
  assert.match(spoken(cta), /Ватсап/);
  assert.match(spoken(cta), /Бишкек/);
  assert.match(spoken(cta), /БалаГо менен жолго чыгалы!$/);
  assert.equal(BG39_TEXT.cta.whatsappNumber, "0998 08 38 28");
  assert.equal(BG39_TEXT.cta.link, "Профилдеги шилтемеге өтүңүз");
  assert.equal(BG39_TEXT.cta.or, "же WhatsApp аркылуу жазыңыз");
  assert.equal(BG39_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
});

test("нет запрещённых обещаний", () => {
  assert.doesNotMatch(JSON.stringify(BG39_TEXT) + all, /GPS|геолокац|тамак|печенье|таттуу|кресло|кепилдик/i);
});

test("кыргызские буквы ү, ө, ң на месте", () => {
  assert.match(all, /ү/);
  assert.match(all, /ө/);
  assert.match(all, /ң/);
});

test("шкала по оценке проходит проверку финала", () => {
  const tl = buildBg39Timeline(estimateBg39Manifest());
  assert.deepEqual(checkBg39Timeline(tl), []);
  const cta = tl.scenes.find((s) => s.id === "cta");
  const last = tl.cues[tl.cues.length - 1];
  assert.ok(tl.durationSec - cta.from >= 5);
  assert.ok(tl.durationSec - last.to >= 3);
  assert.equal(tl.frames, Math.round(tl.durationSec * BG39_VIDEO.fps));
});

test("титры: короткие фрагменты, все слова по порядку", () => {
  for (const l of BG39_LINES) {
    const w = captionWords(l.text);
    const ch = chunksOf(w);
    assert.deepEqual(ch.flat(), w.map((_, i) => i), l.id);
    for (const c of ch) assert.ok(c.map((i) => w[i]).join(" ").length <= 32, `${l.id}: ${c.map((i) => w[i]).join(" ")}`);
  }
});

test("готовая озвучка полная и актуальная (BG39_STRICT_VOICE=1 — обязательна)", () => {
  const path = join("public", BG39_VIDEO.voiceDir, "manifest.json");
  if (!existsSync(path)) {
    assert.ok(!process.env.BG39_STRICT_VOICE, "озвучки нет");
    return;
  }
  const files = new Set(BG39_LINES.map((l) => `${BG39_VIDEO.voiceDir}/${l.id}.mp3`).filter((f) => existsSync(join("public", f))));
  requireBg39Manifest(JSON.parse(readFileSync(path, "utf8")), files);
});
