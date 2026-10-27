// Проверки урока 1: сценарий (8 сцен, 40 реплик, роли), временная шкала по
// фактической озвучке (обязательные паузы, диапазон 4:20–5:00), полнота
// озвучки и соответствие текстов. Запуск: npm run test:lesson01
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { L1_LINES, L1_SCENES, L1_VIEWER_PAUSES } from "../src/lesson01/script.ts";
import { L1_FLOW, buildTimeline, checkViewerPauses } from "../src/lesson01/timeline.ts";

const MAN = "public/audio/lesson01/manifest.json";

test("сценарий: 8 сцен в заданном порядке и ровно 40 реплик", () => {
  assert.deepEqual(
    L1_SCENES.map((s) => s.id),
    ["riddle", "self", "builder", "world", "question", "parents", "whoAllah", "answer"],
  );
  assert.equal(L1_LINES.length, 40);
  const counts = Object.fromEntries(L1_SCENES.map((s) => [s.id, L1_LINES.filter((l) => l.scene === s.id).length]));
  assert.deepEqual(counts, { riddle: 5, self: 6, builder: 5, world: 6, question: 5, parents: 4, whoAllah: 4, answer: 5 });
  // говорят только учитель и дети; голоса «от лица Аллаха» нет
  for (const l of L1_LINES) assert.ok(["teacher", "yusuf", "amir", "bilal", "kids"].includes(l.role));
});

test("каждая реплика ровно один раз в потоке, в порядке сценария", () => {
  const segs = L1_FLOW.filter((f) => "seg" in f).map((f) => f.seg.slice(0, 3));
  const uniq = segs.filter((s, i) => segs.indexOf(s) === i);
  assert.deepEqual(uniq, L1_LINES.map((l) => l.id));
});

test("части разделённой реплики складываются в полный текст", () => {
  for (const l of L1_LINES.filter((x) => x.parts)) assert.equal(l.parts.map((p) => p.text).join(" "), l.text);
});

test("озвучка: все сегменты, тексты совпадают со сценарием", { skip: !existsSync(MAN) }, () => {
  const m = JSON.parse(readFileSync(MAN, "utf8"));
  assert.equal(m.complete, true, `нет: ${m.missing}`);
  for (const l of L1_LINES) {
    const segs = l.parts ? l.parts.map((_, i) => `${l.id}${"ab"[i]}`) : [l.id];
    segs.forEach((id, i) => {
      const x = m.lines.find((y) => y.segId === id);
      assert.ok(x, `нет сегмента ${id}`);
      assert.ok(existsSync(`public/audio/lesson01/${x.file}`), `нет файла ${x.file}`);
      const want = l.parts ? (l.parts[i].spoken ?? l.parts[i].text) : (l.spoken ?? l.text);
      assert.equal(x.text, want, id);
      assert.ok(x.speechEnd > x.speechStart);
    });
  }
});

test("шкала: обязательные паузы 4 / 5 / 4 с и диапазон 4:20–5:00", { skip: !existsSync(MAN) }, () => {
  const T = buildTimeline(JSON.parse(readFileSync(MAN, "utf8")), 30);
  assert.equal(T.estimated, false);
  for (const p of checkViewerPauses(T)) assert.ok(p.ok, `${p.q}→${p.a}: ${p.frames} < ${p.need}`);
  assert.deepEqual(Object.values(L1_VIEWER_PAUSES), [4, 5, 4]);
  assert.ok(T.total >= 260 && T.total <= 300, `длительность ${T.total}`);
  // реплики не накладываются
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].start >= segs[i - 1].end, `наложение ${segs[i].line}`);
});
