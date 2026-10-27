// Проверки BalaGo36SuitcaseByTheDoor2D (№36 «Чемодан у двери»): 25 реплик и
// голоса ролей, полная озвучка, шкала по фактической речи (без наложений,
// реплики внутри своих сцен), финальный кадр ≥ 6,5 с и запас после речи,
// кыргызские тексты (ү ө ң, маршрут ҮЙ → МЕКТЕП → ҮЙ), запрет выдуманных
// контактов/цен и статусов подтверждённой брони, детерминированность кода,
// звуковые файлы, на которые ссылается сведение.
// Запуск: node --test scripts/suitcase-by-the-door-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  SD2_CTA_HOLD_SEC,
  SD2_CTA_WORDS,
  SD2_END_PAD_SEC,
  SD2_LINES,
  SD2_SCENE_SPECS,
  SD2_SEG_SPECS,
  SD2_TEXT,
  SD2_VIDEO,
  SD2_VOICES,
} from "../src/suitcase-by-the-door-2d/script.ts";
import { buildSd2Timeline, checkSd2Timeline } from "../src/suitcase-by-the-door-2d/timing.ts";
import { requireSd2Manifest } from "../src/suitcase-by-the-door-2d/manifestGuard.ts";

const DIR = join("public", SD2_VIDEO.voiceDir);
const SRC = "src/suitcase-by-the-door-2d";
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const EXPECTED = [
  ...Array.from({ length: 16 }, (_, i) => `N${String(i + 1).padStart(2, "0")}`),
  "M01", "M02", "M03", "P01", "P02", "C01", "C02", "C03", "C04",
];
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

test("25 реплик: ID уникальны, роль по префиксу, каждая ровно один раз на шкале и в своей сцене", () => {
  const ids = SD2_LINES.map((l) => l.id);
  assert.deepEqual([...ids].sort(), [...EXPECTED].sort());
  assert.equal(new Set(ids).size, 25);
  assert.deepEqual(SD2_SEG_SPECS.map((s) => s.id), ids, "порядок сегментов = порядок сценария");
  const role = { N: "narrator", M: "mother", P: "father", C: "son" };
  for (const l of SD2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  const tl = buildSd2Timeline(manifest);
  for (const id of EXPECTED) assert.equal(tl.cues.filter((c) => c.id === id).length, 1, id);
  assert.deepEqual(tl.scenes.map((s) => s.id), SD2_SCENE_SPECS.map((s) => s.id));
  assert.equal(tl.scenes.length, 16);
});

test("озвучка полная: файлы есть, не пустые, декодируются, длительность совпадает", () => {
  requireSd2Manifest(manifest);
  assert.equal(manifest.lines.length, 25);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
    assert.ok(l.speechEnd - l.speechStart > 0.4, `${l.id}: речь слишком короткая`);
    const vol = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${p}" -af volumedetect -f null - 2>&1 | grep mean_volume`]).toString();
    const mean = Number(/mean_volume:\s*(-?[\d.]+)/.exec(vol)[1]);
    assert.ok(mean > -35, `${l.id}: файл почти тихий (${mean} дБ)`);
  }
});

test("у каждой роли один постоянный голос из SD2_VOICES, все четыре голоса различны", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = SD2_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
    assert.equal(l.voiceId, SD2_VOICES[line.role].voiceId, l.id);
    assert.equal(l.text, line.text, `${l.id}: текст манифеста = сценарий`);
  }
  for (const [role, set] of byRole) assert.equal(set.size, 1, role);
  assert.equal(new Set(Object.values(SD2_VOICES).map((v) => v.voiceId)).size, 4);
});

test("шкала: без наложений, внутри сцен, CTA собран ≥ 6,5 с, речь кончается ≥ 0,8 с до конца", () => {
  const tl = buildSd2Timeline(manifest);
  assert.deepEqual(checkSd2Timeline(tl), []);
  const fps = SD2_VIDEO.fps;
  const last = tl.cues[tl.cues.length - 1];
  assert.equal(last.id, "N16");
  assert.ok(tl.frames / fps - last.to >= SD2_END_PAD_SEC, "запас после последней фразы");
  assert.ok((tl.frames - tl.ctaAssembledFrame) / fps >= SD2_CTA_HOLD_SEC - 0.1, "собранный финальный кадр");
  // паузы между репликами одной сцены — 0,25…1,0 с
  for (let i = 1; i < tl.cues.length; i++) {
    const a = tl.cues[i - 1];
    const b = tl.cues[i];
    if (a.scene === b.scene) assert.ok(b.from - a.to >= 0.25 && b.from - a.to <= 1.0, `${a.id}→${b.id}: ${(b.from - a.to).toFixed(2)} с`);
  }
  // секунды → кадры: сцены стыкуются без дыр
  for (let i = 1; i < tl.scenes.length; i++) assert.equal(tl.scenes[i].from, tl.scenes[i - 1].to);
  // ориентир по длительности: 2:20–3:10 (точная — по речи)
  assert.ok(tl.frames / fps > 140 && tl.frames / fps < 190, `${(tl.frames / fps).toFixed(1)} с`);
});

test("слова финального кадра есть в N16 (сборка CTA по словам озвучки)", () => {
  const n16 = manifest.lines.find((l) => l.id === "N16");
  const norm = (s) => s.toLowerCase().replace(/[^\p{L}-]/gu, "");
  for (const [k, w] of Object.entries(SD2_CTA_WORDS)) assert.ok(n16.words.some((x) => norm(x.text).startsWith(norm(w))), `${k}: «${w}»`);
});

test("кыргызские тексты: маршрут, кнопка, ссылка, город; ү ө ң присутствуют, русского текста в кадре нет", () => {
  assert.equal(SD2_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
  assert.equal(SD2_TEXT.cta.tagline, "Балдар үчүн такси");
  assert.equal(SD2_TEXT.cta.city, "Бишкек");
  assert.equal(SD2_TEXT.cta.button, "Баланы каттоо");
  assert.equal(SD2_TEXT.cta.link, "Шилтеме профилдин башында");
  // WhatsApp и номер — как дал заказчик; номер есть и в финальной реплике
  assert.equal(SD2_TEXT.cta.whatsapp, "WhatsApp");
  assert.equal(SD2_TEXT.cta.phone, "0998 08 38 28");
  assert.ok(SD2_LINES.find((l) => l.id === "N16").text.includes("WhatsApp") && SD2_LINES.find((l) => l.id === "N16").text.includes("0998 08 38 28"), "N16: WhatsApp и номер");
  assert.equal(SD2_TEXT.badge.name, "Айжан");
  assert.equal(SD2_TEXT.badge.role, "Спикер");
  const all = JSON.stringify(SD2_TEXT) + SD2_LINES.map((l) => l.text).join(" ");
  for (const ch of ["ү", "ө", "ң"]) assert.ok(all.includes(ch), ch);
  // буквы, которые встречаются только в русских словах
  assert.ok(!/[щъ]/i.test(all), "буквы, которых нет в кыргызском тексте");
});

test("нет выдуманных контактов, цен, URL и подтверждённой брони", () => {
  const files = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));
  const code = files.map((f) => readFileSync(f, "utf8")).join("\n");
  // единственный контакт — WhatsApp с номером, который дал заказчик
  const CUSTOMER_PHONE = "0998 08 38 28";
  const values = (o) => (typeof o === "string" ? [o] : Object.values(o).flatMap(values)); // только тексты, без ключей
  const visible = [...values(SD2_TEXT), ...SD2_LINES.map((l) => l.text)].join(" ").replaceAll(CUSTOMER_PHONE, "").replaceAll("WhatsApp", "");
  assert.ok(!/\d{3}[ -]?\d{2}[ -]?\d{2}[ -]?\d{2}/.test(visible), "другой телефон");
  assert.ok(!/\d{4,}/.test(visible), "другие длинные числа");
  assert.ok(!/wa\.me|whatsapp|telegram|http|www\.|\.kg|сом\b|\$/i.test(visible), "контакты/URL/цена");
  for (const bad of ["Айдоочу дайындалды", "Бронь ырасталды", "3 күнгө даяр", "кепилдик"]) assert.ok(!code.includes(bad), bad);
});

test("код детерминирован: нет Math.random, Date, setInterval, fetch в сценах", () => {
  for (const f of walk(SRC).filter((x) => /\.(ts|tsx)$/.test(x))) {
    const s = readFileSync(f, "utf8");
    if (f.endsWith("loadManifest.ts")) continue; // загрузка манифеста — до рендера кадров
    assert.ok(!/Math\.random|Date\.now|new Date\(|setInterval|setTimeout|fetch\(/.test(s), f);
  }
});

test("звуковые файлы сведения существуют (музыка, эффекты, бумага)", () => {
  const audio = readFileSync(join(SRC, "Sd2Audio.tsx"), "utf8");
  for (const m of audio.matchAll(/"(sd2d-[a-z]+)"/g)) assert.ok(existsSync(join(DIR, "music", `${m[1]}.mp3`)), m[1]);
  for (const m of audio.matchAll(/file: "([a-z-]+)"/g)) assert.ok(existsSync(join(DIR, "sfx", `${m[1]}.mp3`)), m[1]);
  assert.ok(existsSync("public/assets/suitcase-36/paper-grain.png"));
});

test("субтитры ↔ озвучка: слова экрана (с буквой или цифрой) = слова spoken (с буквой)", () => {
  for (const l of SD2_LINES) {
    const screen = l.text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    const spoken = (l.spoken ?? l.text).split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
    assert.equal(screen, spoken, `${l.id}: ${screen} ≠ ${spoken}`);
    assert.ok(!/\p{N}/u.test(l.spoken ?? l.text), `${l.id}: цифры в TTS — только словами`);
  }
});
