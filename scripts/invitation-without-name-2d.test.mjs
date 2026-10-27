// Проверки BalaGoInvitationWithoutName2D: 23 речевых сегмента и голоса, шкала
// по фактической речи без наложений, контакты ровно в последних 150 кадрах
// (там звучит только N10 и заканчивается до конца файла), номер — только в
// карточке, звук без шагов, тексты приглашения и формы.
// Запуск: node --test scripts/invitation-without-name-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { IW2_CONTACT_FRAMES, IW2_LINES, IW2_SEG_SPECS, IW2_TEXT, IW2_VIDEO, IW2_VOICES } from "../src/invitation-without-name-2d/script.ts";
import { buildIw2Timeline, checkIw2Timeline } from "../src/invitation-without-name-2d/timing.ts";
import { requireIw2Manifest } from "../src/invitation-without-name-2d/manifestGuard.ts";

const DIR = join("public", IW2_VIDEO.voiceDir);
const MANIFEST = join(DIR, "manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const EXPECTED = ["T01", "F01", "N01", "N02", "N03", "S01", "N04", "N05", "F02", "F03", "S02", "F04", "S03", "N06", "N07", "F05", "N08", "M01", "F06", "N09", "F07", "S04", "N10"];

test("23 сегмента ровно один раз, в порядке монтажа, роли по префиксу", () => {
  assert.deepEqual(IW2_LINES.map((l) => l.id), EXPECTED);
  assert.deepEqual(IW2_SEG_SPECS.map((s) => s.id), EXPECTED);
  const role = { N: "narrator", F: "father", S: "son", M: "mother", T: "teacher" };
  for (const l of IW2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  // режиссёрские пометки и теги не попадают в произносимый текст
  for (const l of IW2_LINES) assert.ok(!/[[\]()]/.test(l.spoken ?? l.text), l.id);
});

test("голоса: пять разных ролей, сын — не прежний KG-son", () => {
  const ids = Object.values(IW2_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, 5);
  assert.notEqual(IW2_VOICES.son.voiceId, "Oxj8oi9pAu19zqQOffmM");
});

test("озвучка полная: файлы есть, длительность совпадает, у роли один голос", { skip: !manifest }, () => {
  requireIw2Manifest(manifest);
  const byRole = new Map();
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
    const role = IW2_LINES.find((x) => x.id === l.id).role;
    byRole.set(role, (byRole.get(role) ?? new Set()).add(l.voiceId));
  }
  for (const [role, set] of byRole) {
    assert.equal(set.size, 1, role);
    assert.ok(set.has(IW2_VOICES[role].voiceId), role);
  }
});

test("шкала: без наложений, контакты — последние 150 кадров, N10 внутри и до конца", { skip: !manifest }, () => {
  const tl = buildIw2Timeline(manifest);
  assert.deepEqual(checkIw2Timeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, IW2_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  const fps = IW2_VIDEO.fps;
  for (const c of tl.cues) {
    if (c.id === "N10") {
      assert.ok(c.from >= tl.contactFrom / fps);
      assert.ok(c.audioFrom + c.durationSec <= tl.frames / fps - 0.8);
    } else assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / fps, `${c.id} заходит в контакты`);
  }
  // длинная реплика сына — целиком, перед молчаливой сценой имени
  const s02 = tl.cues.find((c) => c.id === "S02");
  const name = tl.scenes.find((s) => s.id === "name");
  assert.ok(s02.to <= name.from / fps);
  assert.ok(!tl.cues.some((c) => c.scene === "name"));
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
});

test("номер WhatsApp — только в контактной карточке и не произносится", () => {
  assert.equal(IW2_TEXT.cta.whatsapp, "WhatsApp: 0998 08 38 28");
  const flat = JSON.stringify({ ...IW2_TEXT, cta: null });
  assert.ok(!flat.includes("0998") && !flat.includes("998083828"));
  for (const f of readdirSync("src/invitation-without-name-2d/scenes").filter((f) => f !== "Contact.tsx")) {
    const src = readFileSync(join("src/invitation-without-name-2d/scenes", f), "utf8");
    assert.ok(!src.includes("0998") && !src.includes("cta.whatsapp"), f);
  }
  for (const l of IW2_LINES) assert.ok(!/0998|тогуз жүз/.test(l.spoken ?? l.text), l.id);
});

test("звук без шагов: только эффекты с видимым действием, музыка на месте", () => {
  const src = readFileSync("src/invitation-without-name-2d/Iw2Audio.tsx", "utf8");
  assert.ok(!/footstep|step\.mp3|шаг\.mp3/i.test(src));
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", "")).sort();
  assert.deepEqual(files, ["applause", "car-cabin", "fold", "paper", "pencil", "tap", "toy", "zipper"]);
  for (const m of ["curious", "family", "quiet", "warm", "focus", "end"]) assert.ok(existsSync(join(DIR, "music", `iw2d-${m}.mp3`)), m);
});

test("кыргызские тексты: приглашение, список, подпись, форма — предварительная заявка", () => {
  assert.deepEqual(IW2_TEXT.invitation, { title: "КЕСИПТЕР КҮНҮ", day: "Күнү: жума", time: "Убактысы: 10:00", room: "Кабинет: 203", guest: "Чакырылган конок:", name: "Азамат" });
  assert.deepEqual(IW2_TEXT.list, ["Кагаз", "Оюнчук машина", "Карандаш"]);
  assert.equal(IW2_TEXT.caption, "Менин атам — инженер");
  assert.equal(IW2_TEXT.form.routeValue, "Үй → Мектеп → Үй");
  assert.equal(IW2_TEXT.form.sent, "Өтүнмө жөнөтүлдү");
  assert.equal(IW2_TEXT.search.query, "Бишкек балдар үчүн такси");
  const all = JSON.stringify(IW2_TEXT);
  assert.ok(!/Айдоочу дайындалды|Маршрут бекитилди|сом|рейтинг/i.test(all));
});
