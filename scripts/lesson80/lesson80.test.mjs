// Проверки мини-фильма 80-1-14 (node --test scripts/lesson80/lesson80.test.mjs).
// Без озвучки (manifest.json) проверки идут по оценочным длительностям;
// L80_STRICT_VOICE=1 требует настоящую озвучку всех 41 реплики.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { build } from "esbuild";

mkdirSync("out", { recursive: true });
await build({ entryPoints: ["src/lesson80/checks.ts"], bundle: true, format: "esm", platform: "node", outfile: "out/.l80-checks.mjs", logLevel: "error", jsx: "automatic" });
const L = await import(`${process.cwd()}/out/.l80-checks.mjs?${Date.now()}`);

const MAN = "public/audio/lesson80-1-14/manifest.json";
const manifest = existsSync(MAN) ? JSON.parse(readFileSync(MAN, "utf8")) : L.estimateManifest();
const tl = L.buildTimeline(manifest);
const M = tl.marks;
const S = (f) => L.computeState(tl, f);

test("озвучка: 41 реплика с файлами и точным текстом", () => {
  if (process.env.L80_STRICT_VOICE === "1") assert.ok(existsSync(MAN), "нет manifest.json");
  if (!existsSync(MAN)) return;
  assert.equal(manifest.lines.length, 41);
  manifest.lines.forEach((l, i) => {
    const def = L.L80_LINES[i];
    assert.equal(l.id, def.id);
    assert.equal(l.text, def.text, `текст ${l.id}`);
    assert.ok(existsSync(`public/audio/lesson80-1-14/${l.file}`), `файл ${l.file}`);
    assert.ok(l.duration > 0.3 && l.speechEnd > l.speechStart);
  });
});

test("41 реплика один раз, по порядку, без пересечений", () => {
  assert.equal(L.L80_LINES.length, 41);
  const ids = L.L80_LINES.map((l) => l.id);
  assert.deepEqual(ids, Array.from({ length: 41 }, (_, i) => String(i + 1).padStart(2, "0")));
  let prev = -1;
  for (const id of ids) {
    const l = tl.lines[id];
    assert.ok(l.from >= prev, `реплика ${id} пересекается с предыдущей`);
    prev = l.to;
  }
});

test("состав: 25 мальчиков (3 главных + 22) и один учитель", () => {
  assert.equal(L.KIDS.length, 25);
  assert.equal(new Set(L.KIDS.map((k) => k.id)).size, 25);
  assert.deepEqual(L.KIDS.filter((k) => k.name).map((k) => k.name), ["Юсуф", "Амир", "Билал"]);
  assert.equal(L.KIDS.filter((k) => !k.name).length, 22);
  assert.equal(L.TEACHER.id, "t01");
  const ages = L.KIDS.map((k) => k.age);
  assert.ok(Math.min(...ages) >= 4 && Math.max(...ages) <= 12);
  // нет двух одинаковых детей (возраст + одежда + причёска)
  const looks = new Set(L.KIDS.map((k) => `${k.age}|${k.top}|${k.hairStyle}|${k.topStyle}`));
  assert.equal(looks.size, 25);
});

test("длительность 200–240 с, три паузы ровно по 150 кадров, финал 4–5 с", () => {
  assert.ok(tl.total >= 6000 && tl.total <= 7200, `длительность ${tl.total}`);
  assert.equal(tl.pauses.length, 3);
  const after = ["08", "20", "31"];
  tl.pauses.forEach((p, i) => {
    assert.equal(p.to - p.from, 150);
    assert.equal(p.after, after[i]);
    assert.ok(p.from >= tl.lines[after[i]].to, "пауза начинается после конца вопроса");
    // в паузе не звучит ни одна реплика
    for (const l of Object.values(tl.lines)) assert.ok(l.to <= p.from || l.from >= p.to);
  });
  const hold = tl.total - tl.lines["41"].speechTo;
  assert.ok(hold >= 120 && hold <= 155, `финальная выдержка ${hold}`);
});

test("лист: пустой в паузе 1, три значка после сцены 2, семь к реплике 16, без восьмого", () => {
  assert.equal(L.ICONS.length, 7);
  const mid1 = Math.round((tl.pauses[0].from + tl.pauses[0].to) / 2);
  assert.deepEqual(S(mid1).sheetState.icons, [0, 0, 0, 0, 0, 0, 0]);
  assert.equal(S(tl.pauses[0].to - 1).sheetState.icons.some((x) => x > 0), false);
  const end2 = S(M["s2.to"] - 1).sheetState.icons;
  assert.deepEqual(end2.slice(0, 3), [1, 1, 1], "три значка к концу сцены 2");
  assert.deepEqual(end2.slice(3), [0, 0, 0, 0]);
  assert.deepEqual(S(M["16.start"]).sheetState.icons, [1, 1, 1, 1, 1, 1, 1]);
  // рисунок появляется только после своего предложения
  const draws = L.drawsOf(tl);
  const after = ["09", "10", "11", "12", "13", "14", "15"];
  draws.forEach((d, i) => assert.ok(d.drawFrom >= tl.lines[after[i]].to - 2, `значок ${i + 1} раньше реплики`));
  assert.equal(S(M["s8.write"] - 1).sheetState.title, 0, "заголовок до сцены 8");
  assert.equal(S(tl.total - 1).sheetState.title, 1);
  assert.equal(S(tl.total - 1).sheet.mode, "upright");
});

test("стаканы: личные, пустой стакан Амира не трогают в паузе 3, Амир получает воду", () => {
  const p3 = tl.pauses[2];
  for (let f = p3.from; f < p3.to; f += 10) {
    const st = S(f);
    assert.equal(st.cups.amir.level, 0);
    assert.equal(st.cups.amir.x, L.SPOTS.amirCupNear.x, "стакан Амира на месте");
    assert.ok(st.cups.amir.y === L.SPOTS.amirCupNear.y);
  }
  assert.ok(S(M["s1.exhale"]).cups.yusuf.level < S(0).cups.yusuf.level, "Юсуф попил");
  assert.equal(S(M["s6.pour"]).cups.amir.level, 0);
  assert.ok(S(M["s6.amirReach"]).cups.amir.level > 0.6, "налито");
  assert.ok(S(tl.total - 1).cups.amir.level > 0.5);
  // наливается только во время струи
  for (let f = M["s6.pour"]; f < M["s6.jugBack"]; f++) {
    const a = S(f).cups.amir.level;
    const b = S(f + 1).cups.amir.level;
    if (b > a + 1e-9) assert.ok(S(f).stream > 0 || S(f + 1).stream > 0, `уровень растёт без струи (${f})`);
  }
});

test("стакан не прыгает: координаты непрерывны", () => {
  for (const key of ["yusuf", "amir"]) {
    for (let f = 1; f < tl.total; f++) {
      const a = S(f - 1).cups[key];
      const b = S(f).cups[key];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      assert.ok(d < 26, `${key}: скачок ${d.toFixed(1)} в кадре ${f}`);
    }
  }
});

test("руки дотягиваются: захваты стакана, листа и кувшина без растяжения", () => {
  const reachKid = (k, f, side) => {
    const st = S(f);
    const pose = st.kids[k.id];
    const h = side === "L" ? pose.handL : pose.handR;
    const sh = L.kidShoulders(k, pose)[side];
    const g = L.kidGeometry(k);
    return Math.hypot(h.x - sh.x, h.y - sh.y) <= (g.upper + g.fore) * 0.995 + g.hand * 3;
  };
  for (const f of [M["s6.grasp"], M["s6.tgrasp"] - 1, M["s6.tgrasp"] + 2]) {
    assert.ok(reachKid(L.YUSUF, f, "L"), `Юсуф (левая) кадр ${f}`);
  }
  assert.ok(reachKid(L.YUSUF, M["s6.tgrasp"], "R"));
  assert.ok(reachKid(L.AMIR, M["s6.amirSip"] + 10, "R"));
  const T = L.TEACHER_DIMS;
  for (const [f, side] of [[M["s6.tgrasp"] + 2, "L"], [M["s6.pour"] + 30, "R"], [M["s6.place"] + 20, "L"], [M["s2.paperDown"] - 2, "R"]]) {
    const st = S(f);
    const h = side === "L" ? st.teacher.pose.handL : st.teacher.pose.handR;
    const sh = L.teacherShoulders(false, st.teacher.pose)[side];
    assert.ok(Math.hypot(h.x - sh.x, h.y - sh.y) <= T.upper + T.fore + T.hand * 2, `учитель кадр ${f}`);
  }
});

test("субтитры: точный текст, без будущих ответов, вопрос держится в паузе", () => {
  const cues = L.buildCues(tl);
  for (const def of L.L80_LINES) {
    const parts = cues.filter((c) => c.lineId === def.id && !c.hold).map((c) => c.text);
    assert.equal(parts.join(" "), def.text, `субтитр ${def.id}`);
    for (const c of cues.filter((x) => x.lineId === def.id)) assert.ok(c.from >= tl.lines[def.id].from - 4, `субтитр ${def.id} раньше речи`);
  }
  for (const p of tl.pauses) {
    for (let f = p.from; f < p.to; f += 5) {
      const c = L.cueAt(cues, f);
      assert.ok(!c || c.lineId === p.after, "в паузе только вопрос");
    }
  }
  // во время питья нет субтитров
  for (let f = M["s1.lift"]; f < M["s1.exhale"]; f += 3) assert.equal(L.cueAt(cues, f), null);
});

test("во время питья и паузы 3 никто не говорит; детерминизм", () => {
  for (const l of Object.values(tl.lines)) assert.ok(l.to <= M["s1.lift"] || l.from >= M["s1.exhale"]);
  const f = M["s6.pour"] + 20;
  assert.equal(JSON.stringify(S(f)), JSON.stringify(S(f)));
});

test("план кадров: склейки внутри фильма, финал — общий план", () => {
  const shots = L.buildShots(tl, L.drawsOf(tl));
  assert.equal(shots[0].from, 0);
  const last = shots[shots.length - 1];
  assert.equal(last.name, "WIDE");
  assert.ok(tl.total - last.from >= 120);
  // передача стакана: один непрерывный план от захвата до учителя
  const inHand = shots.filter((s) => s.from > M["s6.reach"] && s.from < M["s6.tset"]);
  assert.equal(inHand.length, 0, "склейка посреди передачи");
});
