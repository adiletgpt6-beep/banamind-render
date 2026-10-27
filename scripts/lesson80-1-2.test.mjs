// Проверки ролика 80-1-2: сценарий (8 сцен, 43 реплики, роли, порядок),
// временная шкала по фактической озвучке (паузы 4 / 5 с от конца вопроса до
// начала ответа, диапазон 4:00–4:45, без наложения реплик), полнота озвучки
// и совпадение текстов, отсутствие готового ответа в субтитрах во время пауз.
// Запуск: npm run test:80-1-2
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { A2_LINES, A2_SCENES, A2_TEXT, A2_VIEWER_PAUSES } from "../src/lesson80-1-2/script.ts";
import { A2_FLOW, buildTimeline, checkViewerPauses } from "../src/lesson80-1-2/timeline.ts";

const MAN = "public/audio/lesson80-1-2/manifest.json";

test("сценарий: 8 сцен в заданном порядке и ровно 43 реплики", () => {
  assert.deepEqual(
    A2_SCENES.map((s) => s.title),
    ["Яблоко с вопросом", "Маленькое семечко, большое дерево", "То, чего мы не видим", "Листья, цветы и пчела", "Соберём то, что заметили", "Как растёт — и кто создал", "Ответ для зрителя", "Теперь я замечаю"],
  );
  assert.equal(A2_LINES.length, 43);
  const counts = A2_SCENES.map((s) => A2_LINES.filter((l) => l.scene === s.id).length);
  assert.deepEqual(counts, [6, 5, 5, 6, 5, 6, 5, 5]);
  A2_LINES.forEach((l, i) => assert.equal(l.id, `80-1-2-${String(i + 1).padStart(3, "0")}`));
  // говорят только учитель и дети; голоса «от лица Аллаха» нет
  for (const l of A2_LINES) assert.ok(["teacher", "yusuf", "amir", "bilal", "kids"].includes(l.role));
  // синтез получает только текст реплики (без имён, скобок, таймкодов)
  for (const l of A2_LINES) assert.ok(!/[[\]]|Мухаммад:|Юсуф:|Амир:|Билал:|\d\d:\d\d/.test(l.spoken ?? l.text), l.id);
});

test("ключевые реплики — дословно", () => {
  const t = (n) => A2_LINES[n - 1].text;
  assert.equal(t(28), "Но дерево ведь выросло из семечка.");
  assert.equal(t(29), "Да. Мы узнаём, как оно растёт. А кто создал сами растения, воду, солнце и воздух?");
  assert.equal(t(34), "Кто создал растения и всё, что помогает им жить?");
  assert.equal(t(43), "Да. За воду, за растения и за пищу. Замечайте мир вокруг, размышляйте и благодарите Аллаха.");
  assert.deepEqual(A2_TEXT.final, ["Замечай.", "Размышляй.", "Благодари Аллаха"]);
});

test("каждая реплика ровно один раз в потоке, в порядке сценария", () => {
  const segs = A2_FLOW.filter((f) => "seg" in f).map((f) => f.seg);
  assert.deepEqual(segs, A2_LINES.map((l) => l.id));
  const pauses = A2_FLOW.filter((f) => "pause" in f).map((f) => f.pause);
  assert.deepEqual(pauses, A2_VIEWER_PAUSES.map((p) => p.q));
});

test("озвучка: все реплики, тексты совпадают со сценарием, файлы на месте", { skip: !existsSync(MAN) }, () => {
  const m = JSON.parse(readFileSync(MAN, "utf8"));
  assert.equal(m.complete, true, `нет: ${m.missing}`);
  for (const l of A2_LINES) {
    const x = m.lines.find((y) => y.segId === l.id);
    assert.ok(x, `нет ${l.id}`);
    assert.ok(existsSync(`public/audio/lesson80-1-2/${x.file}`), `нет файла ${x.file}`);
    assert.equal(x.text, l.spoken ?? l.text, l.id);
    assert.ok(x.speechEnd > x.speechStart);
  }
});

test("шкала: паузы 4 и 5 с, диапазон 4:00–4:45, реплики не накладываются", { skip: !existsSync(MAN) }, () => {
  const T = buildTimeline(JSON.parse(readFileSync(MAN, "utf8")), 30);
  assert.equal(T.estimated, false);
  for (const p of checkViewerPauses(T)) assert.ok(p.ok, `${p.q}→${p.a}: ${p.frames} < ${p.need}`);
  assert.deepEqual(A2_VIEWER_PAUSES.map((p) => p.sec), [4, 5]);
  assert.ok(T.total >= 240 && T.total <= 285, `длительность ${T.total}`);
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].start >= segs[i - 1].end + 0.05, `наложение ${segs[i].line}`);
});

test("SRT: ответ не появляется во время паузы", { skip: !existsSync(MAN) }, () => {
  const srt = readFileSync("docs/lesson80-1-2/lesson-80-1-2-what-is-inside-apple.ru.srt", "utf8");
  const T = buildTimeline(JSON.parse(readFileSync(MAN, "utf8")), 30);
  const sec = (s) => {
    const [h, m, r] = s.split(":");
    return Number(h) * 3600 + Number(m) * 60 + Number(r.replace(",", "."));
  };
  const cues = srt.trim().split(/\n\n/).map((b) => {
    const [, time, ...text] = b.split("\n");
    const [a, z] = time.split(" --> ").map(sec);
    return { a, z, text: text.join(" ") };
  });
  assert.equal(cues.length, 43);
  for (const { q, a } of A2_VIEWER_PAUSES) {
    const qEnd = T.seg[q].end;
    const aStart = T.seg[a].start;
    for (const c of cues) assert.ok(!(c.a < aStart - 0.06 && c.z > qEnd + 0.7), `субтитр «${c.text}» в паузе`);
    const ans = cues.find((c) => c.text === A2_LINES.find((l) => l.id === a).text);
    assert.ok(ans.a >= aStart - 0.06, "ответ раньше времени");
  }
});
