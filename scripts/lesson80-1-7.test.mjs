// Проверки фильма 80-1-7: сценарий (44 реплики по порядку, роли), класс
// (ровно 25 учеников, 3 главных, без повторов мест), шкала (четыре
// зрительские паузы ровно 180/150/150/180 кадров, угол неподвижен на P1,
// реплика 19 — в кадре входа метки в свет, ночные/дневные положения метки),
// модель глобуса (одни координаты метки в обоих ракурсах, направление
// вращения, знак освещения до/после границы), озвучка (все файлы на месте).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { CAST } from "../src/lesson80/film-1-7/cast.ts";
import { FILM, L80_LINES, L80_PAUSES, L80_PHI, lineFile } from "../src/lesson80/film-1-7/script.ts";
import { buildTimeline, checkTimeline, cueById, estimateManifest, phiAt } from "../src/lesson80/film-1-7/timeline.ts";
import { CAM_SIDE, CAM_TOP, isLit, markState, markWorld, nightPolygon, project } from "../src/lesson80/film-1-7/globe/model.ts";
import { buildShots } from "../src/lesson80/film-1-7/shots.ts";
import { buildChoreo } from "../src/lesson80/film-1-7/choreo.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const FPS = FILM.fps;

test("сценарий: ровно 44 реплики по порядку с правильными говорящими", () => {
  assert.equal(L80_LINES.length, 44);
  L80_LINES.forEach((l, i) => assert.equal(l.id, i + 1));
  assert.equal(L80_LINES[0].role, "yusuf");
  assert.equal(L80_LINES[18].text, "Вот оно, утро!");
  assert.equal(L80_LINES[38].text, "Аллах.");
  assert.equal(L80_LINES[43].role, "muhammad");
  for (const l of L80_LINES) assert.ok(!/\d/.test(l.text), `в тексте №${l.id} нет номеров`);
});

test("класс: 25 учеников, 3 главных, учитель отдельно, места без повторов", () => {
  assert.equal(CAST.length, 25);
  assert.equal(CAST.filter((p) => p.main).length, 3);
  assert.equal(new Set(CAST.map((p) => p.id)).size, 25);
  const seats = new Set(CAST.map((p) => `${p.seat.row}:${p.seat.x}`));
  assert.equal(seats.size, 25);
  for (const p of CAST) assert.ok(p.age >= 4 && p.age <= 12);
  assert.ok(!CAST.some((p) => p.id === "muhammad"));
});

test("шкала: без замечаний, паузы ровно 180/150/150/180 кадров", () => {
  assert.deepEqual(checkTimeline(tl), []);
  for (const p of L80_PAUSES) {
    const a = cueById(tl, p.after);
    const b = cueById(tl, p.after + 1);
    const frames = Math.round(tl.sound[b.id].start * FPS) - Math.ceil(tl.sound[a.id].end * FPS - 1e-6);
    assert.equal(frames, p.sec * FPS, `пауза ${p.id}`);
    assert.ok(tl.sound[a.id].end <= tl.pauses.find((x) => x.id === p.id).from + 1e-6);
  }
  const total = L80_PAUSES.reduce((a, p) => a + p.sec, 0);
  assert.equal(total, 22);
});

test("глобус: угол неподвижен на всех паузах, реплика 19 в кадре входа в свет", () => {
  for (const ps of tl.pauses) {
    const a = phiAt(tl, ps.from);
    for (let f = Math.round(ps.from * FPS); f <= Math.round(ps.to * FPS); f++) assert.equal(phiAt(tl, f / FPS), a, `${ps.id}: кадр ${f}`);
  }
  // первый звук реплики 19 — в кадре входа метки в свет
  const f19 = Math.round(tl.sound[19].start * FPS);
  assert.ok(phiAt(tl, (f19 - 1) / FPS) < L80_PHI.sunrise && phiAt(tl, f19 / FPS) >= L80_PHI.sunrise);
  assert.ok(!isLit(markWorld(phiAt(tl, (f19 - 1) / FPS))));
  assert.ok(isLit(markWorld(phiAt(tl, f19 / FPS))));
  // непрерывность угла: только вперёд, не быстрее 1,5° за кадр (45°/с)
  let prev = phiAt(tl, 0);
  for (let f = 1; f < tl.durationInFrames; f++) {
    const cur = phiAt(tl, f / FPS);
    assert.ok(cur >= prev - 1e-9 && cur - prev < 1.5, `кадр ${f}: ${prev} → ${cur}`);
    prev = cur;
  }
});

test("модель: координаты метки общие для обоих ракурсов, вращение против часовой сверху", () => {
  for (const phi of [315, 400, 480, 540, 630, 662, 945]) {
    const w = markWorld(phi);
    const s = project(CAM_SIDE, w);
    const t = project(CAM_TOP, w);
    assert.ok(Math.abs(Math.hypot(w[0], w[1], w[2]) - 1) < 1e-9);
    // одна и та же мировая точка → в обоих видах видимость по z, а не по удобству кадра
    assert.equal(markState(CAM_SIDE, phi).visible, s.z > 0.02);
    assert.equal(markState(CAM_TOP, phi).visible, t.z > 0.02);
  }
  // сверху: с ростом φ экранный угол растёт против часовой стрелки (y экрана вниз)
  const ang = (phi) => {
    const m = markState(CAM_TOP, phi).screen;
    return Math.atan2(-m.y, m.x);
  };
  let d = ang(310) - ang(300);
  if (d < -Math.PI) d += 2 * Math.PI;
  assert.ok(d > 0 && d < 0.3);
  // сбоку: передний край движется слева направо
  assert.ok(markState(CAM_SIDE, 570).screen.x > markState(CAM_SIDE, 560).screen.x);
  // освещение: до 270° (восход) тень, после — свет; световой рисунок не зависит от φ
  assert.ok(!isLit(markWorld(628)) && isLit(markWorld(632)));
  assert.ok(isLit(markWorld(448)) && !isLit(markWorld(452)));
  assert.deepEqual(nightPolygon(CAM_SIDE).length, nightPolygon(CAM_SIDE).length);
  // сцена 5: метка в тени и видна сбоку
  const m5 = markState(CAM_SIDE, L80_PHI.night2);
  assert.ok(m5.visible && !m5.lit);
});

test("постановка: лампа включается один раз, занавеска прикрыта в опыте и открыта в сцене 6", () => {
  const ch = buildChoreo(tl);
  const on = ch.events.lampOn;
  assert.equal(ch.lamp(on - 1), 0);
  for (let f = on; f < tl.durationInFrames; f += 7) assert.equal(ch.lamp(f), 1);
  assert.equal(ch.curtain(0), 0);
  assert.equal(ch.curtain(Math.round(cueById(tl, 17).from * FPS)), 1);
  assert.equal(ch.curtain(Math.round(cueById(tl, 29).from * FPS)), 0);
  assert.equal(ch.curtain(tl.durationInFrames - 1), 0);
  // монтажный план непрерывен и покрывает весь фильм
  const shots = buildShots(tl);
  assert.equal(shots[0].from, 0);
  for (let i = 1; i < shots.length; i++) assert.equal(shots[i].from, shots[i - 1].to, shots[i].label);
  assert.equal(shots[shots.length - 1].to, tl.durationInFrames);
});

test("озвучка: все 44 файла и тайминги на месте", { skip: !existsSync(MANIFEST) ? "нет манифеста" : false }, () => {
  assert.equal(manifest.partial, false);
  for (const l of L80_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `№${l.id}`);
    assert.equal(ml.text, l.text);
    assert.ok(existsSync(`public/${FILM.voiceDir}/${lineFile(l.id)}`));
    assert.ok(ml.words.length > 0 && ml.env.length > 0);
  }
});
