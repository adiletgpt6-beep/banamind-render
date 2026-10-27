// Тесты №34 «Жарыядагы ашыкча сап» (BalaGo34ExtraLine): сценарий, шкала по
// речи, озвучка, надписи и сквозные мотивы. Запуск:
//   node --test scripts/extra-line-34.test.mjs
// EL34_STRICT_VOICE=1 — дополнительно требует полной актуальной озвучки.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  EL_LINES,
  EL_SCENE_SPECS,
  EL_SEG_SPECS,
  EL_TEXT,
  EL_VIDEO,
  EL_VOICES,
  EL_VOICES_CONFIRMED,
  estimateSpeech,
  layoutTimeline,
} from "../src/extra-line-34/script.ts";
import { buildElTimeline, checkElTimeline, estimateElManifest } from "../src/extra-line-34/timing.ts";

const MANIFEST = `public/${EL_VIDEO.voiceDir}/manifest.json`;
const KY = /[үөңҮӨҢ]/;
const allText = () => [...EL_LINES.map((l) => l.text), ...JSON.stringify(EL_TEXT).match(/"[^"]*"/g)];

test("реплики: уникальные ID, у каждой — сегмент на шкале, роли известны", () => {
  const ids = EL_LINES.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(EL_SEG_SPECS.map((s) => s.id), ids, "сегменты идут в порядке реплик");
  for (const s of EL_SEG_SPECS) assert.ok(EL_SCENE_SPECS.some((sc) => sc.id === s.scene), `${s.id}: сцена ${s.scene}`);
  for (const l of EL_LINES) assert.ok(["narrator", "mother", "father", "caregiver", "son"].includes(l.role));
});

test("сценарий: ключевые реплики на месте и на кыргызском", () => {
  const t = (id) => EL_LINES.find((l) => l.id === id).text;
  assert.equal(t("S01"), "Сиз бул китепти окуп бере аласызбы?");
  assert.equal(t("M01"), "А сиз машина айдайсызбы?");
  assert.equal(t("C03"), "Жок. Балдар менен тажрыйбам көп, бирок машина айдабайм.");
  assert.equal(t("S03"), "Ал эже дагы келеби?");
  assert.equal(t("M02"), "Ооба, эртең келет.");
  assert.equal(t("S04"), "Эң кызыктуу жерине келгенде токтоп калганбыз.");
  assert.match(t("N10"), /BalaGo менен жолго чыгалы!$/);
  assert.match(t("N10"), /Бишкек/);
  assert.match(t("N10"), /профилдин башындагы шилтемеге/);
  assert.match(t("N10"), /WhatsApp аркылуу жазыңыз/);
  // голосом бренд звучит одинаково: «БалаГо»
  for (const l of EL_LINES.filter((x) => /BalaGo/.test(x.text))) {
    assert.ok(l.spoken && !/BalaGo/.test(l.spoken) && /БалаГо/.test(l.spoken), `${l.id}: spoken с «БалаГо»`);
  }
  for (const l of EL_LINES) assert.ok(!/\[|\]/.test(l.text), `${l.id}: в тексте нет тегов`);
});

test("обещания сервиса: только предварительная заявка, без цен и адресов; контакт — только WhatsApp заказчика в финале", () => {
  // финал по просьбе заказчика: ссылка в шапке профиля или WhatsApp 0998 08 38 28
  const { whatsappLabel, whatsappNumber, ...ctaRest } = EL_TEXT.cta;
  assert.equal(whatsappLabel, "WhatsApp");
  assert.equal(whatsappNumber, "0998 08 38 28");
  const all = [...EL_LINES.filter((l) => l.id !== "N10").map((l) => l.text), ...JSON.stringify({ ...EL_TEXT, cta: ctaRest }).match(/"[^"]*"/g)].join(" ");
  for (const bad of [/WhatsApp/i, /Ватсап/i, /http/i, /www\./i, /\.kg\b/i, /\bсом\b/i, /₸|\$/, /промокод/i, /тариф/i, /төлө/i, /ырастал/i, /кепилд/i, /\d{3}\s?\d{2}\s?\d{2}/]) {
    assert.ok(!bad.test(all), `запрещённое: ${bad}`);
  }
  // в финальной реплике — только ссылка в профиле и WhatsApp, без цифр и адресов
  const n10 = EL_LINES.find((l) => l.id === "N10").text;
  for (const bad of [/http/i, /www\./i, /\.kg\b/i, /\d/, /промокод/i, /төлө/i]) assert.ok(!bad.test(n10), `N10: ${bad}`);
  assert.equal(EL_TEXT.site.request, "Алдын ала өтүнмө");
  assert.equal(EL_TEXT.cta.site, "Шилтеме — профилдин башында");
  assert.deepEqual(EL_TEXT.site.familyRoute, ["МЕКТЕП", "ҮЙ"]);
  assert.deepEqual(EL_TEXT.cta.route, ["ҮЙ", "МЕКТЕП", "ҮЙ"]);
});

test("объявление: удаляется тот же пункт, который добавили", () => {
  assert.deepEqual(EL_TEXT.ad.extra, ["Айдоочулук күбөлүк", "Ишенимдүү айдоо", "Баланы мектептен алып келүү"]);
  assert.equal(EL_TEXT.ad.items.length, 3);
  assert.ok(EL_TEXT.ad.extra.at(-1).includes(EL_TEXT.ad.extraFocus));
  for (const s of [...EL_TEXT.ad.items, ...EL_TEXT.ad.extra]) assert.ok(!EL_TEXT.ad.items.includes(s) || !EL_TEXT.ad.extra.includes(s));
});

test("надписи кыргызские (есть ү/ө/ң в текстах), без глифа «→»", () => {
  assert.ok(allText().some((s) => KY.test(s)));
  assert.ok(!allText().some((s) => s.includes("→")), "стрелки рисуются SVG (в Nunito нет «→»)");
});

test("шкала по оценке речи проходит проверку; длительность ≈ 2–2,7 мин", () => {
  const tl = buildElTimeline(estimateElManifest());
  assert.deepEqual(checkElTimeline(tl), []);
  const sec = tl.frames / EL_VIDEO.fps;
  assert.ok(sec > 110 && sec < 170, `длительность ${sec.toFixed(1)} с`);
  // монотонно, сцены встык
  tl.scenes.forEach((s, i) => i && assert.equal(s.from, tl.scenes[i - 1].to));
});

test("layoutTimeline: сцена тянется под длинную реплику (речь не ускоряется)", () => {
  const base = layoutTimeline(estimateSpeech);
  const long = layoutTimeline((id) => (id === "N07" ? estimateSpeech(id) + 6 : estimateSpeech(id)));
  assert.ok(long.frames > base.frames + 170);
  const sc = long.scenes.find((s) => s.id === "balago");
  const seg = long.segments.find((s) => s.id === "N07");
  assert.ok(seg.end * EL_VIDEO.fps <= sc.to);
});

test("голоса: одна роль — один голос", () => {
  if (!EL_VOICES_CONFIRMED) return;
  const ids = Object.values(EL_VOICES).map((v) => v?.voiceId);
  assert.ok(ids.every(Boolean), "все роли с голосом");
  assert.equal(new Set(ids).size, ids.length, "голоса ролей различаются");
});

test("озвучка (строгий режим): полная, актуальная и укладывается в шкалу", async () => {
  if (process.env.EL34_STRICT_VOICE !== "1") return;
  assert.ok(existsSync(MANIFEST), "manifest.json есть");
  const { requireElManifest } = await import("../src/extra-line-34/manifestGuard.ts");
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const files = new Set(m.lines.filter((l) => existsSync(`public/${EL_VIDEO.voiceDir}/${l.file}`)).map((l) => `${EL_VIDEO.voiceDir}/${l.file}`));
  requireElManifest(m, files);
});

test("звуки: файлы совпадают со spec (sound.json), у каждого звука sound.ts есть файл", () => {
  const r = spawnSync(process.execPath, ["scripts/el34-sound.mjs", "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const files = JSON.parse(readFileSync(`public/${EL_VIDEO.voiceDir}/sfx/sound.json`, "utf8")).files;
  const have = Object.keys(files);
  const src = readFileSync("src/extra-line-34/sound.ts", "utf8");
  const names = [...src.matchAll(/^\s+\| "([a-z-]+)"/gm)].map((m) => `${m[1]}.mp3`);
  assert.ok(names.length >= 10, "список звуков SfxName");
  for (const f of [...names, "bed.mp3", "bed-end.mp3", "room.mp3"]) assert.ok(have.includes(f), `нет звука ${f}`);
  // подложка и атмосфера длиннее ролика: на стыке петли MP3 даёт паузу
  const m = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateElManifest();
  const sec = buildElTimeline(m).frames / EL_VIDEO.fps;
  for (const f of ["bed.mp3", "room.mp3"]) assert.ok(files[f].sec >= sec + 5, `${f}: ${files[f].sec} с, ролик ${sec.toFixed(1)} с — увеличить sec в el34-sound.mjs`);
});
