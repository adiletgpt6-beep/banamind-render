// Тесты BalaGoHalfHour2D: шкала 120 с, реплики без наложений, финальный
// экран 6 с без речи, ограничения по содержанию, файлы озвучки и проб.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  HH2_CANDIDATES,
  HH2_DIALOG_END,
  HH2_FRAMES,
  HH2_LINES,
  HH2_SCENES,
  HH2_TEXT,
  HH2_VIDEO,
  HH2_VOICE_CHOICE,
} from "../src/half-hour-2d/script.ts";
import { buildHh2Cues, checkHh2Timing, estimateHh2Manifest } from "../src/half-hour-2d/timing.ts";
import { decodeMono, SAMPLE_RATE } from "./lib/audio.mjs";
import { hh2Hash, resolveVoice } from "./lib/hh2d-tts.mjs";

const DIR = join("public", HH2_VIDEO.voiceDir);
const MANIFEST = join(DIR, "manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const complete = manifest && !manifest.partial && manifest.lines.length === HH2_LINES.length;

test("формат: 1080×1920, 30 fps, ровно 120 с", () => {
  assert.equal(HH2_VIDEO.width, 1080);
  assert.equal(HH2_VIDEO.height, 1920);
  assert.equal(HH2_VIDEO.fps, 30);
  assert.equal(HH2_FRAMES, 3600);
});

test("сцены идут подряд от 0 до 120 с, финальный экран 114–120 с", () => {
  let t = 0;
  for (const s of HH2_SCENES) {
    assert.equal(s.from, t, `${s.id} начинается не с ${t}`);
    assert.ok(s.to > s.from);
    t = s.to;
  }
  assert.equal(t, 120);
  const cta = HH2_SCENES.at(-1);
  assert.equal(cta.id, "cta");
  assert.equal(cta.to - cta.from, 6);
});

test("оценочная шкала (без озвучки): реплики не накладываются", { skip: complete && "есть реальная озвучка" }, () => {
  assert.deepEqual(checkHh2Timing(estimateHh2Manifest().lines), []);
});

test("диалог заканчивается до финального экрана", () => {
  const m = complete ? manifest : estimateHh2Manifest();
  for (const c of buildHh2Cues(m)) assert.ok(c.to <= HH2_DIALOG_END, `${c.id} до ${c.to}`);
  assert.ok(HH2_DIALOG_END <= 114 - 0.5);
});

test("содержание: без цен, гарантий и подтверждённых поездок; WhatsApp только на финальном экране", () => {
  // все тексты (значения, не ключи), кроме блока WhatsApp финального экрана
  const ctaRest = Object.fromEntries(Object.entries(HH2_TEXT.cta).filter(([k]) => !k.startsWith("whatsapp")));
  const values = (x) => (typeof x === "string" ? [x] : x && typeof x === "object" ? Object.values(x).flatMap(values) : []);
  const all = values([HH2_LINES.map((l) => [l.text, l.spoken ?? ""]), { ...HH2_TEXT, cta: ctaRest }]).join("\n").toLowerCase();
  for (const bad of ["whatsapp", "ватсап", "сом", "баа", "кепилдик", "гарант", "ырасталды", "подтвержд", "wa.me"]) {
    assert.ok(!new RegExp(`(^|[^\\p{L}])${bad}`, "u").test(all), `найдено «${bad}»`);
  }
  assert.equal(HH2_TEXT.form.sent, "Арыз жөнөтүлдү");
  assert.equal(HH2_TEXT.form.contact, "Сиз менен байланышабыз.");
  assert.equal(HH2_TEXT.form.send, "Арызды жөнөтүү");
  assert.deepEqual(
    [HH2_TEXT.cta.brand, HH2_TEXT.cta.tagline, HH2_TEXT.cta.route, HH2_TEXT.cta.status, HH2_TEXT.cta.button, HH2_TEXT.cta.link],
    ["BalaGo", "Балдар үчүн такси", "ҮЙ → МЕКТЕП → ҮЙ", "Алдын ала каттоо жүрүп жатат", "Баланы каттоо", "Профилдеги шилтеме аркылуу"],
  );
  // номер WhatsApp — тот же, что в других роликах проекта
  assert.equal(HH2_TEXT.cta.phone, "0998 08 38 28");
  assert.equal(HH2_TEXT.cta.whatsappUrl, "https://wa.me/996998083828");
  assert.equal(HH2_TEXT.cta.phone.replace(/\D/g, "").replace(/^0/, "996"), HH2_TEXT.cta.whatsappUrl.split("/").at(-1));
});

test("кыргызские буквы ө, ү, ң есть в репликах (кириллица, не латиница)", () => {
  const text = HH2_LINES.map((l) => l.text).join(" ");
  for (const ch of ["ө", "ү", "ң"]) assert.ok(text.includes(ch), `нет «${ch}»`);
  assert.ok(!/[öüñ]/.test(text));
});

test("голоса: выбранный голос есть среди кандидатов, роли не делят голос", () => {
  const used = new Map();
  for (const [role, name] of Object.entries(HH2_VOICE_CHOICE)) {
    if (!name) continue;
    const v = HH2_CANDIDATES[role].find((c) => c.name === name);
    assert.ok(v, `${role}: ${name} нет среди кандидатов`);
    assert.ok(!used.has(v.voiceId), `${role} и ${used.get(v.voiceId)} — один голос`);
    used.set(v.voiceId, role);
  }
});

test("пробы голосов: файлы из report.json на месте", () => {
  const p = "voice-samples/half-hour-2d/report.json";
  if (!existsSync(p)) return;
  const r = JSON.parse(readFileSync(p, "utf8"));
  for (const s of r.samples) if (!s.error) assert.ok(existsSync(join("voice-samples/half-hour-2d", s.file)), s.file);
});

// Хэши озвучки строго проверяются в workflow half-hour-2d (там реплики
// перегенерируются до тестов, HH2_STRICT_VOICE=1). В общем workflow
// render.yml озвучка этого ролика не создаётся: если реплику только что
// изменили, а новый файл ещё не сохранён ботом, проверка пропускается.
const strict = process.env.HH2_STRICT_VOICE === "1";
const stale = complete
  ? HH2_LINES.filter((line) => {
      const m = manifest.lines.find((x) => x.id === line.id);
      const voice = resolveVoice(HH2_CANDIDATES[line.role].find((c) => c.name === HH2_VOICE_CHOICE[line.role]));
      return !m || m.hash !== hh2Hash(line, voice.voiceId);
    }).map((l) => l.id)
  : [];
const voiceSkip = !complete
  ? "полной озвучки ещё нет"
  : stale.length && !strict
    ? `озвучка ещё не перегенерирована: ${stale.join(", ")} (проверяется в workflow half-hour-2d)`
    : false;

test("озвучка (если есть): файлы, хэши, длительности, без обрезки и перегруза", { skip: voiceSkip }, () => {
  assert.deepEqual(checkHh2Timing(manifest.lines), []);
  assert.deepEqual(stale, [], "устаревшие файлы озвучки");
  for (const line of HH2_LINES) {
    const m = manifest.lines.find((x) => x.id === line.id);
    assert.ok(m, `нет ${line.id}`);
    const voice = resolveVoice(HH2_CANDIDATES[line.role].find((c) => c.name === HH2_VOICE_CHOICE[line.role]));
    assert.equal(m.hash, hh2Hash(line, voice.voiceId), `${line.id}: устаревший файл`);
    const pcm = decodeMono(join(DIR, m.file));
    const dur = pcm.length / SAMPLE_RATE;
    assert.ok(Math.abs(dur - m.durationSec) < 0.06, `${line.id}: длительность ${dur}`);
    assert.ok(m.speechEnd <= dur - 0.05, `${line.id}: речь обрезана`);
    let peak = 0;
    for (const v of pcm) peak = Math.max(peak, Math.abs(v));
    assert.ok(20 * Math.log10(peak) < -1, `${line.id}: пик ${peak}`);
  }
});

test("разборчивость (если есть замер MMS): доля ошибок по буквам ≤ 20 %", { skip: voiceSkip }, () => {
  // Технический замер распознаванием (scripts/asr_mms.py), не проверка на слух.
  for (const m of manifest.lines) {
    if (m.asrCer == null) continue;
    assert.ok(m.asrCer <= 0.2, `${m.id}: CER ${m.asrCer} — «${m.asrHeard}»`);
  }
});
