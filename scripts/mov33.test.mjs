// Тесты фильма №33 «Мама на старом видео»: формат, шкала, тексты, озвучка.
// Запуск: npm run test:moms-old-video
// MOV_STRICT_VOICE=1 — нужна полная актуальная озвучка, которая помещается в
// шкалу (задача render в moms-old-video.yml, перед финальным рендером).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import {
  lineAt,
  MOV_DURATION,
  MOV_FRAMES,
  MOV_LINES,
  MOV_SCENES,
  MOV_TEXT,
  MOV_VIDEO,
  MOV_VOICES,
  lineById,
} from "../src/moms-old-video/script.ts";
import { checkMovTiming, estimateMovManifest } from "../src/moms-old-video/timing.ts";
import { requireMovManifest } from "../src/moms-old-video/manifestGuard.ts";
import { movHash, voiceOfRole } from "./lib/mov-tts.mjs";
import { FOUNDER_CONTACT } from "../src/config.ts";
import { CHUNK_MAX, chunkStarts, norm, subChunks } from "../src/moms-old-video/subtitleChunks.ts";

const MANIFEST = `public/${MOV_VIDEO.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;
const strict = process.env.MOV_STRICT_VOICE === "1";

test("формат: 1080×1920, 30 fps, около двух с половиной минут", () => {
  assert.equal(MOV_VIDEO.id, "BalaGo33MomsOldVideo");
  assert.equal(MOV_VIDEO.output, "balago-33-moms-old-video");
  assert.equal(MOV_VIDEO.width, 1080);
  assert.equal(MOV_VIDEO.height, 1920);
  assert.equal(MOV_VIDEO.fps, 30);
  assert.ok(MOV_DURATION >= 145 && MOV_DURATION <= 200, `длительность ${MOV_DURATION} с`);
  assert.equal(MOV_FRAMES, Math.round(MOV_DURATION * 30));
});

test("четырнадцать сцен подряд, финальная карточка не короче 12 с", () => {
  assert.deepEqual(
    MOV_SCENES.map((s) => s.id),
    ["hook", "workday", "evening", "remember", "moves", "wish", "schedule", "route", "balago", "pick", "packing", "studio", "newVideo", "cta"],
  );
  assert.equal(MOV_SCENES[0].from, 0);
  for (let i = 1; i < MOV_SCENES.length; i++) assert.equal(MOV_SCENES[i].from, MOV_SCENES[i - 1].to);
  const cta = MOV_SCENES.at(-1);
  assert.ok(cta.to - cta.from >= 12, `финал ${cta.to - cta.from} с`);
});

test("реплики — по сценарию, в нужном порядке", () => {
  const spoken = MOV_LINES.filter((l) => l.subtitle !== false).map((l) => [l.role, l.text]);
  assert.deepEqual(spoken, [
    ["son", "Апа, бул чын эле сенсиңби? Ушинтип бийлей аласыңбы?"],
    ["narrator", "Апасы компанияда долбоорлорду башкарат. Өз ишин жакшы көрөт."],
    ["narrator", "Бирок сабактан кийин уулун үйгө алып келүү үчүн күн сайын ишин токтотуп, жолго чыгат."],
    ["narrator", "Калган иштерди кийин улантат. Кээде кечинде да ноутбугун ачууга туура келет."],
    ["narrator", "Уулу апасын көбүнчө ушундай көрүп көнгөн."],
    ["mother", "Мурда бир нече жыл бийге катышчумун."],
    ["son", "Азыр көрсөтүп берчи!"],
    ["son", "Ой!"],
    ["father", "Бул жерде репетиция болуп жатабы?"],
    ["son", "Апам сахнада бийлептир! Сен билчү белең?"],
    ["narrator", "Ошол кечте экөө эски видеону кайра көрүштү. Апасы бий студиясын, досторун эстеди."],
    ["mother", "Кайра бийлеп көргүм келип жатат."],
    ["narrator", "Кечки сабактар бар экен. Бирок дал ошол убакта апасы күндүз бүтпөй калган ишин бүтүрөт."],
    ["narrator", "Үйдө уулун бала багуучу күтүп ала алат."],
    ["narrator", "Мектептен үйгө чейинки жолду болсо ата-энеси өздөрү уюштуруп жүрүшөт."],
    ["narrator", "Экөө BalaGo кызматын таап, каттамды сүйлөшүү үчүн алдын ала өтүнмө калтырышты."],
    ["narrator", "Апасы болсо алгач ишембидеги сыноо сабагын тандады."],
    ["narrator", "Ишембиде уулу апасынын сумкасын чогултууга жардам берди."],
    ["son", "Кийин үйрөнгөнүңдү мага көрсөтөсүңбү?"],
    ["son", "Токтой тур. Муну да тартып коюш керек!"],
    ["narrator", "BalaGo — Бишкектеги балдар үчүн такси. Үйдөн мектепке жеткирип, сабактан кийин кайра үйгө алып келебиз."],
    ["narrator", "Профилдин башындагы шилтемеге өтүңүз же WhatsApp аркылуу жазыңыз: 0998\u00A008\u00A038\u00A028. BalaGo менен жолго чыгалы!"],
  ]);
});

test("BalaGo в озвучке произносится как «Балаго»", () => {
  for (const l of MOV_LINES) {
    if (l.text.includes("BalaGo")) assert.ok(l.spoken?.includes("Балаго") && !l.spoken.includes("BalaGo"), l.id);
    assert.ok(!/[A-Za-z]/.test(l.spoken ?? l.text), `${l.id}: латиница в озвучке`);
  }
});

test("у каждой роли свой голос; новые голоса не создаются", () => {
  const ids = Object.values(MOV_VOICES).map((v) => v.voiceId);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of MOV_LINES) assert.ok(voiceOfRole(l.role)?.voiceId, l.id);
});

test("надписи на кыргызском: латиница только в BalaGo; без цены и адресов; WhatsApp — только номер владельца в финале", () => {
  const values = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(values) : v && typeof v === "object" ? Object.values(v).flatMap(values) : []);
  const all = values(MOV_TEXT).join(" | ");
  const latin = all.match(/[A-Za-z]+/g) ?? [];
  assert.deepEqual([...new Set(latin)], ["BalaGo"]);
  assert.ok(!/whatsapp|ватсап|сом\b|http|www|\.kg|\+996/i.test(all));
  // номер — тот же, что у владельца в config.ts, и только на финальной карточке
  assert.equal(MOV_TEXT.cta.phone, FOUNDER_CONTACT.phone);
  const { phone, ...cta } = MOV_TEXT.cta;
  const outside = values({ ...MOV_TEXT, cta }).join(" | ");
  assert.ok(!/0998|\d{3}[\s-]+\d{2}[\s-]+\d{2}/.test(outside), "номер вне финальной карточки");
  assert.ok(phone);
  // в речи WhatsApp и номер — только в последней реплике
  for (const l of MOV_LINES.slice(0, -1)) assert.ok(!/whatsapp|ватсап|0998|нөл тогуз/i.test(`${l.text} ${l.spoken ?? ""}`), l.id);
  assert.equal(MOV_TEXT.cta.link, "Шилтеме — профилдин башында");
  assert.equal(MOV_TEXT.cta.button, "Баланы каттоо");
  assert.equal(MOV_TEXT.cta.route, "ҮЙ → МЕКТЕП → ҮЙ");
});

test("предварительная заявка не выдаётся за подтверждённую поездку", () => {
  const form = JSON.stringify(MOV_TEXT.form) + JSON.stringify(MOV_TEXT.page);
  assert.ok(!/ырастал|брондо|сапар башталды|жеткирилди/i.test(form));
  assert.match(MOV_TEXT.form.sent, /Алдын ала өтүнмө/);
});

test("реплики стоят внутри своих сцен и по порядку", () => {
  let prev = -1;
  for (const l of MOV_LINES) {
    const s = MOV_SCENES.find((x) => x.id === l.scene);
    const at = lineAt(l);
    assert.ok(at >= s.from && at < s.to, l.id);
    assert.ok(at >= prev - 0.5, `${l.id} раньше предыдущей`);
    prev = at;
  }
});

test("хэш озвучки зависит от текста, тега, голоса и seed", () => {
  const l = MOV_LINES.find((x) => !x.pick);
  const v = voiceOfRole(l.role).voiceId;
  assert.notEqual(movHash(l, v), movHash({ ...l, text: l.text + "!" }, v));
  assert.notEqual(movHash(l, v), movHash({ ...l, tag: "[sad]" }, v));
  assert.notEqual(movHash(l, v), movHash({ ...l, seed: 1 }, v));
  assert.notEqual(movHash(l, v), movHash({ ...l, pick: 2 }, v));
});

// ---------- манифест озвучки ----------
const fixture = () => ({
  ...estimateMovManifest(),
  estimated: false,
  lines: estimateMovManifest().lines.map((ml) => {
    const l = MOV_LINES.find((x) => x.id === ml.id);
    return { ...ml, file: `${ml.id}.mp3`, text: l.text, spoken: l.spoken ?? l.text };
  }),
});
const files = () => new Set(MOV_LINES.map((l) => `${MOV_VIDEO.voiceDir}/${l.id}.mp3`));

test("без манифеста финальный фильм не собирается", () => {
  assert.throws(() => requireMovManifest(null), /не создана/);
});

test("оценочная и частичная озвучка отклоняются", () => {
  assert.throws(() => requireMovManifest(estimateMovManifest()), /неполная/);
  assert.throws(() => requireMovManifest({ ...fixture(), partial: true }), /неполная/);
});

test("отсутствующая реплика и MP3 останавливают рендер", () => {
  const m = fixture();
  m.lines.shift();
  assert.throws(() => requireMovManifest(m, files()), /s01: нет/);
  const names = files();
  names.delete(`${MOV_VIDEO.voiceDir}/m01.mp3`);
  assert.throws(() => requireMovManifest(fixture(), names), /m01: нет MP3/);
});

test("устаревший текст озвучки останавливает рендер", () => {
  const m = fixture();
  m.lines[0].text = "Башка сөздөр";
  assert.throws(() => requireMovManifest(m, files()), /s01: текст устарел/);
});

test("озвучка в Git актуальна и помещается в шкалу", { skip: !manifest && !strict }, (t) => {
  assert.ok(manifest, "нет manifest.json");
  const stale = MOV_LINES.filter((l) => {
    const ml = manifest.lines.find((x) => x.id === l.id);
    return !ml || ml.hash !== movHash(l, voiceOfRole(l.role).voiceId) || !existsSync(`public/${MOV_VIDEO.voiceDir}/${ml.file}`);
  }).map((l) => l.id);
  const timing = stale.length ? [] : checkMovTiming(manifest.lines);
  if (!strict) {
    // на рабочем push озвучка может догонять текст — только сообщение
    if (stale.length || manifest.partial || timing.length) t.diagnostic(`озвучка: устарели ${stale.join(", ") || "—"}; шкала: ${timing.join("; ") || "ок"}`);
    return;
  }
  assert.ok(!manifest.partial, "озвучка неполная");
  assert.deepEqual(stale, [], "устаревшие или отсутствующие реплики");
  assert.deepEqual(timing, []);
});

test("субтитры: части не длиннее двух строк, без союза в конце, сменяются на своём слове озвучки", () => {
  for (const l of MOV_LINES.filter((x) => x.subtitle !== false)) {
    const parts = subChunks(l.text);
    for (const p of parts) {
      assert.ok(p.length <= CHUNK_MAX, `${l.id}: «${p}» длиннее двух строк`);
      assert.ok(!/(^|\s)(же|жана|бирок|анан)$/i.test(p), `${l.id}: союз в конце части «${p}»`);
    }
    const words = manifest?.lines.find((x) => x.id === l.id)?.words;
    if (!words?.length) continue;
    const spoken = words.map((w) => w.text);
    const starts = chunkStarts(parts, spoken);
    starts.forEach((s, k) => {
      if (k) assert.ok(s > starts[k - 1], `${l.id}: части не по порядку`);
      assert.equal(norm(spoken[s]), norm(parts[k].split(/\s+/)[0]), `${l.id}: часть ${k} начинается не на своём слове`);
    });
  }
  // финальный призыв: номер не делится, союз «же» — в начале второй части
  assert.deepEqual(subChunks(lineById("n13").text), [
    "Профилдин башындагы шилтемеге өтүңүз",
    "же WhatsApp аркылуу жазыңыз: 0998\u00A008\u00A038\u00A028.",
    "BalaGo менен жолго чыгалы!",
  ]);
});
