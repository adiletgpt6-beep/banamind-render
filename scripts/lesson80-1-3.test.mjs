// Проверки ролика 80-1-3 «А если я не вижу?»: сценарий (8 сцен, 42 реплики,
// роли и порядок, ключевые реплики дословно), поток (каждая реплика один раз,
// три паузы для ответа зрителя 4 / 4 / 5 с, выдох Юсуфа между 008 и 009),
// шкала по фактической озвучке (3:45–4:25, без наложения речи), полнота
// озвучки и совпадение текстов, субтитры (ответ не виден во время пауз),
// физика вертушки (вращение только от воздуха, покой в сценах 3–7, возврат
// к окну) и постоянный состав класса (25 мальчиков + учитель).
// Проверки, зависящие от озвучки, пропускаются, пока манифест не complete.
// Запуск: npm run test:80-1-3
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { A3_BLOW_SEC, A3_LINES, A3_PROTECTED, A3_ROLE_NAMES, A3_SCENES, A3_TEXT, A3_VIEWER_PAUSES } from "../src/lesson80-1-3/script.ts";
import { A3_FLOW, buildTimeline, checkViewerPauses } from "../src/lesson80-1-3/timeline.ts";
import { SRT_PATH, buildCues, toSrt } from "./lesson80-1-3-srt.mjs";

const MAN = "public/audio/lesson80-1-3/manifest.json";
const manifest = existsSync(MAN) ? JSON.parse(readFileSync(MAN, "utf8")) : null;
const complete = manifest?.complete === true;
const id = (n) => `80-1-3-${String(n).padStart(3, "0")}`;
const t = (n) => A3_LINES[n - 1].text;
const letters = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");

test("сценарий: 8 сцен в заданном порядке, ровно 42 реплики", () => {
  assert.deepEqual(
    A3_SCENES.map((s) => s.title),
    ["Крутится сама?", "Подуть — и проверить", "Не только глазами", "Вопрос Юсуфа", "Воздух — творение", "Любая невидимая вещь?", "Два вопроса", "Можно спрашивать"],
  );
  assert.equal(A3_LINES.length, 42);
  A3_LINES.forEach((l, i) => {
    assert.equal(l.id, id(i + 1));
    assert.equal(l.n, i + 1);
  });
  const counts = A3_SCENES.map((s) => A3_LINES.filter((l) => l.scene === s.id).length);
  assert.deepEqual(counts, [5, 7, 6, 6, 4, 6, 5, 3]);
  // сцены идут подряд, без возвратов
  const order = A3_SCENES.map((s) => s.id);
  for (let i = 1; i < A3_LINES.length; i++) assert.ok(order.indexOf(A3_LINES[i].scene) >= order.indexOf(A3_LINES[i - 1].scene), A3_LINES[i].id);
});

test("роли: говорят только Мухаммад, Юсуф, Амир и Билал — как в сценарии", () => {
  assert.deepEqual({ ...A3_ROLE_NAMES }, { teacher: "Мухаммад", yusuf: "Юсуф", amir: "Амир", bilal: "Билал" });
  for (const l of A3_LINES) assert.ok(["teacher", "yusuf", "amir", "bilal"].includes(l.role), l.id);
  const R = { М: "teacher", Ю: "yusuf", А: "amir", Б: "bilal" };
  // по сценам: 1–5 | 6–12 | 13–18 | 19–24 | 25–28 | 29–34 | 35–39 | 40–42
  const who = "ЮАБМЮ МЮМЮМАМ МБММЮА ЮМАМБМ ЮМБМ АМБМЮМ МЮМАМ ЮМБ".replace(/ /g, "");
  assert.equal(who.length, 42);
  A3_LINES.forEach((l, i) => assert.equal(l.role, R[who[i]], `${l.id}: ${l.role}`));
});

test("ключевые реплики — дословно", () => {
  assert.equal(t(20), "В этой жизни мы не видим Аллаха глазами.");
  assert.equal(t(22), "Хороший вопрос. Мы узнаём об Аллахе из Корана и размышляем о мире, который Он создал.");
  assert.equal(t(26), "Нет, Юсуф. Воздух — творение. Аллах — Создатель, и Он не похож на Свои творения.");
  assert.equal(t(28), "Только то, что воздух может двигаться, хотя мы его не видим. А из слов «я не вижу» ещё не следует «этого нет».");
  assert.equal(t(30), "Нет. Одного «я не вижу» мало, чтобы сказать и «есть», и «нет». Нужно разбираться: какие у нас основания?");
  assert.equal(t(32), "Верно. А Коран учит верить в Аллаха и в то, чего мы не видим, но о чём Он сообщил.");
  assert.equal(t(39), "Верно. Аллах не похож на Свои творения.");
  assert.equal(t(42), "Не всё можно узнать только глазами.");
  assert.deepEqual([...A3_PROTECTED], [20, 22, 26, 28, 30, 32, 39]);
  assert.equal(A3_TEXT.final.join(" "), t(42).replace(/\.$/, ""));
});

test("синтез: только текст реплики; spoken отличается лишь пунктуацией", () => {
  for (const l of A3_LINES) {
    if (l.spoken !== undefined) assert.equal(letters(l.spoken), letters(l.text), `${l.id}: spoken меняет слова`);
    for (const s of [l.spoken ?? l.text, l.lead ?? ""]) {
      // без имён-подписей, скобок, ремарок, цифр и таймкодов
      assert.ok(!/[[\](){}<>*_#]|\d|(Мухаммад|Юсуф|Амир|Билал|Учитель)\s*:/.test(s), `${l.id}: «${s}»`);
    }
  }
});

test("поток: каждая реплика ровно один раз, по порядку; паузы после 016, 035, 037", () => {
  const segs = A3_FLOW.filter((f) => "seg" in f).map((f) => f.seg);
  assert.deepEqual(segs, A3_LINES.map((l) => l.id));
  assert.deepEqual(
    A3_VIEWER_PAUSES.map((p) => [p.q, p.a, p.sec]),
    [[id(16), id(17), 4], [id(35), id(36), 4], [id(37), id(38), 5]],
  );
  const pauses = A3_FLOW.filter((f) => "pause" in f).map((f) => f.pause);
  assert.deepEqual(pauses, [id(16), id(35), id(37)]);
  // пауза стоит сразу после вопроса, ответ — сразу после паузы
  for (const { q, a } of A3_VIEWER_PAUSES) {
    const i = A3_FLOW.findIndex((f) => "pause" in f && f.pause === q);
    assert.equal(A3_FLOW[i - 1].seg, q);
    assert.equal(A3_FLOW[i + 1].seg, a);
  }
  // сцены потока — в порядке сценария
  assert.deepEqual(A3_FLOW.filter((f) => "scene" in f).map((f) => f.scene), A3_SCENES.map((s) => s.id));
});

test("выдох Юсуфа: действие blow между 008 и 009, не короче A3_BLOW_SEC, без речи", () => {
  const i8 = A3_FLOW.findIndex((f) => f.seg === id(8));
  const i9 = A3_FLOW.findIndex((f) => f.seg === id(9));
  const ib = A3_FLOW.findIndex((f) => f.hold === "blow");
  assert.ok(i8 < ib && ib < i9, "blow не между 008 и 009");
  assert.ok(A3_FLOW.slice(i8 + 1, i9).every((f) => !("seg" in f) && !("pause" in f)), "между 008 и 009 есть речь или пауза");
  assert.ok(A3_FLOW[ib].sec >= A3_BLOW_SEC);
  assert.ok(A3_BLOW_SEC >= 2.9);
  for (const T of [buildTimeline(null, 30), ...(complete ? [buildTimeline(manifest, 30)] : [])]) {
    const b = T.hold.blow;
    assert.ok(b.start >= T.seg[id(8)].end && b.end <= T.seg[id(9)].start);
    assert.ok(b.end - b.start >= A3_BLOW_SEC - 1e-6);
    assert.ok(T.seg[id(9)].start - T.seg[id(8)].end >= 2.9);
    for (const s of Object.values(T.seg)) assert.ok(s.end <= b.start || s.start >= b.end, `речь ${s.line} внутри выдоха`);
  }
});

test("озвучка: все реплики, тексты совпадают со сценарием, файлы на месте", { skip: !complete && "манифест озвучки неполный" }, () => {
  assert.equal(manifest.lines.length, 42);
  for (const l of A3_LINES) {
    const x = manifest.lines.find((y) => y.segId === l.id);
    assert.ok(x, `нет ${l.id}`);
    assert.equal(x.role, l.role, l.id);
    assert.ok(existsSync(`public/audio/lesson80-1-3/${x.file}`), `нет файла ${x.file}`);
    assert.equal(x.text, l.spoken ?? l.text, l.id);
    assert.ok(x.speechEnd > x.speechStart && x.speechEnd <= x.durationSec + 0.01, l.id);
  }
});

test("шкала: паузы 4 / 4 / 5 с, 3:45–4:25, речь не накладывается", { skip: !complete && "манифест озвучки неполный" }, () => {
  const T = buildTimeline(manifest, 30);
  assert.equal(T.estimated, false);
  const ps = checkViewerPauses(T);
  assert.deepEqual(ps.map((p) => p.need), [120, 120, 150]);
  for (const p of ps) assert.ok(p.ok && p.frames >= p.need && p.seconds >= p.need / 30, `${p.q}→${p.a}: ${p.frames} < ${p.need}`);
  assert.ok(T.total >= 225 && T.total <= 265, `длительность ${T.total.toFixed(2)} с`);
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  assert.deepEqual(segs.map((s) => s.line), A3_LINES.map((l) => l.id));
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].start >= segs[i - 1].end + 0.05, `наложение ${segs[i].line}`);
});

const srtReady = complete && existsSync(SRT_PATH);
test("SRT: актуален, тексты дословно, ответ не виден во время паузы", { skip: !srtReady && "нет SRT или манифест неполный" }, () => {
  const srt = readFileSync(SRT_PATH, "utf8");
  assert.equal(srt, toSrt(buildCues(manifest)), "SRT устарел — npm run srt:80-1-3");
  const T = buildTimeline(manifest, 30);
  const sec = (s) => {
    const [h, m, r] = s.split(":");
    return Number(h) * 3600 + Number(m) * 60 + Number(r.replace(",", "."));
  };
  const cues = srt.trim().split(/\n\n/).map((b) => {
    const [, time, ...text] = b.split("\n");
    const [a, z] = time.split(" --> ").map(sec);
    return { a, z, rows: text, text: text.join(" ") };
  });
  // тексты: подряд и дословно — утверждённые реплики (line.text)
  assert.equal(cues.map((c) => c.text).join(" "), A3_LINES.map((l) => l.text).join(" "));
  assert.equal(cues.length, 42 + A3_LINES.filter((l) => l.text.length > 84).length);
  for (const c of cues) {
    assert.ok(!/Мухаммад:|Юсуф:|Амир:|Билал:|\d/.test(c.text), `«${c.text}»`);
    assert.ok(c.z > c.a + 0.5, `короткий субтитр «${c.text}»`);
    assert.ok(c.rows.length <= 2 && c.rows.every((r) => r.length <= 50), `длинные строки «${c.text}»`);
  }
  for (let i = 1; i < cues.length; i++) assert.ok(cues[i].a >= cues[i - 1].z - 0.001, `наложение субтитров «${cues[i].text}»`);
  // во время паузы — только «хвост» вопроса (≤ 0,7 с); ответ — не раньше конца паузы
  for (const { q, a } of A3_VIEWER_PAUSES) {
    const qEnd = T.seg[q].end;
    const pEnd = T.pause[q].end;
    assert.ok(Math.abs(T.seg[a].start - pEnd) < 1e-6, `ответ ${a} не сразу после паузы`);
    for (const c of cues) assert.ok(!(c.a < pEnd && c.z > qEnd + 0.7), `субтитр «${c.text}» в паузе после ${q}`);
    const ans = cues.find((c) => c.text === A3_LINES.find((l) => l.id === a).text);
    assert.ok(ans, `нет субтитра ответа ${a}`);
    assert.ok(ans.a >= pEnd, `ответ ${a} виден раньше конца паузы (${ans.a} < ${pEnd.toFixed(3)})`);
  }
});

// Режиссура (direction.tsx) — TSX: для проверок собирается esbuild в кэш
// node_modules (зависимости остаются внешними и находятся как обычно).
const direction = async () => {
  const { buildSync } = await import("esbuild");
  const outfile = "node_modules/.cache/lesson80-1-3/direction.mjs";
  buildSync({ entryPoints: ["src/lesson80-1-3/direction.tsx"], bundle: true, format: "esm", platform: "node", jsx: "automatic", outfile, packages: "external", logLevel: "error" });
  const mod = await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`);
  const T = buildTimeline(manifest, 30);
  return { mod, T, D: mod.buildDirection(T) };
};

test("вертушка: крутится только от движущегося воздуха; в сценах 3–7 покой; в финале снова у окна", { skip: !complete && "манифест озвучки неполный" }, async () => {
  const { mod, T, D } = await direction();
  const sc = T.scenes;
  const at = (t) => mod.propAt(T, D, t, mod.teacherBodyAt(T, D, t));
  const home = at(0);
  // у открытого окна, в потоке воздуха (в т. ч. пока учитель снимает её со столика)
  const nearWindow = (p) => Math.hypot(p.pw.o.x - home.pw.o.x, p.pw.o.y - home.pw.o.y) < 260;
  const atWindow = (p) => p.inStand && !p.held && Math.abs(p.stand.x - home.stand.x) < 0.5 && Math.abs(p.stand.y - home.stand.y) < 0.5;
  const coastEnd = D.leave + 3.4; // выбег ротора после выхода из потока у окна
  const blowEnd = D.A.exhaleEnd + 4.4; // выбег после выдоха
  let spinFrames = 0;
  for (let f = 0; f < T.frames; f++) {
    const t = f / 30;
    const w = D.omegaAt(t);
    if (t >= sc.senses.start && t < sc.ask.start) assert.equal(w, 0, `сцены 3–7: ротор вращается на ${t.toFixed(2)} с`);
    if (w === 0) continue;
    spinFrames++;
    const p = at(t);
    const why = nearWindow(p) ? "окно" : t >= D.leave - 1e-6 && t <= coastEnd ? "выбег" : t >= D.A.exhale && t <= blowEnd ? "выдох" : null;
    assert.ok(why, `ротор вращается без причины на ${t.toFixed(2)} с`);
    if (t < sc.blow.start) assert.ok(!p.held, "в сцене 1 вертушку никто не трогает");
  }
  assert.ok(spinFrames > 30 * 20);
  // перед выдохом ротор стоит; выдох раскручивает его
  assert.equal(D.omegaAt(D.A.exhale), 0, "перед выдохом ротор должен стоять");
  assert.ok(Math.abs(D.omegaAt((D.A.exhale + D.A.exhaleEnd) / 2)) > 200, "выдох не раскрутил ротор");
  // финал: вертушка снова в подставке у окна и вращается в прежнем потоке
  const end = T.total - 0.1;
  assert.ok(atWindow(at(end)), "в конце вертушка не у окна");
  assert.ok(Math.abs(D.omegaAt(end)) > 150, "в конце ротор не вращается у окна");
  assert.ok(D.enterFlow >= sc.ask.start, "возврат к окну — в сцене 8");
  // угол — интеграл скорости: без скачков между кадрами
  for (let f = 1; f < T.frames; f++) {
    const d = Math.abs(D.spinAt(f / 30).angle - D.spinAt((f - 1) / 30).angle);
    assert.ok(d <= 600 / 30 + 1e-6, `скачок угла на кадре ${f}`);
  }
});

test("класс: 25 мальчиков в постоянной расстановке и учитель", { skip: !complete && "манифест озвучки неполный" }, async () => {
  const { mod, T, D } = await direction();
  assert.equal(mod.ROSTER.length, 25);
  assert.equal(new Set(mod.ROSTER).size, 25);
  const s0 = mod.roomStateAt(T, D, 0);
  const kids = s0.chars.filter((c) => c.id !== "teacher");
  assert.equal(kids.length, 25);
  assert.equal(s0.chars.filter((c) => c.id === "teacher").length, 1);
  for (let t = 0; t < T.total; t += 2.5) {
    const s = mod.roomStateAt(T, D, t);
    assert.equal(s.chars.length, 26, `${t} с`);
    for (const k of kids) {
      const c = s.chars.find((x) => x.id === k.id);
      assert.ok(c && Math.abs(c.x - k.x) < 1e-6 && Math.abs(c.y - k.y) < 1e-6, `${k.id} сместился на ${t.toFixed(1)} с`);
    }
  }
});
