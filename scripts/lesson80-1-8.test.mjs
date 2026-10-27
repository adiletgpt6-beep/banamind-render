// Проверки фильма 80-1-8: сценарий (42 реплики по порядку, роли, точный
// текст карточки), класс (ровно 25 учеников, 3 главных, без повторов мест),
// шкала (три зрительские паузы ровно 150/150/180 кадров по звуку, порядок,
// длительность в допуске, финал ≥ 2 с общего плана), реквизит (карточка
// чистая до письма, письмо только после реплики 39, готовая надпись до
// реплики 40, карточка в папке в конце; лодочка и лист не пересекаются;
// книга на подставке к реплике 23; во время пауз нет движения рук и кивков),
// монтаж (непрерывный, без наложения «ответного» плана на паузу), озвучка.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { CAST } from "../src/lesson80/film-1-8/cast.ts";
import { CARD_LINES, CARD_TEXT, FILM, L80_LINES, L80_PAUSES, lineFile } from "../src/lesson80/film-1-8/script.ts";
import { buildTimeline, checkTimeline, cueById, estimateManifest, pauseFrames } from "../src/lesson80/film-1-8/timeline.ts";
import { buildShots } from "../src/lesson80/film-1-8/shots.ts";
import { buildChoreo } from "../src/lesson80/film-1-8/choreo.ts";
import { BOAT, SHEET_SLOT, TABLE } from "../src/lesson80/film-1-8/layout.ts";
import { cardTip } from "../src/lesson80/film-1-8/card.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const ch = buildChoreo(tl);
const FPS = FILM.fps;
const F = (id) => ({ from: Math.round(cueById(tl, id).from * FPS), to: Math.round(cueById(tl, id).to * FPS) });

test("сценарий: ровно 42 реплики по порядку, говорящие и опорные фразы", () => {
  assert.equal(L80_LINES.length, 42);
  L80_LINES.forEach((l, i) => assert.equal(l.id, i + 1));
  assert.equal(L80_LINES[0].role, "yusuf");
  assert.equal(L80_LINES[2].text, "А кто создал Аллаха?");
  assert.equal(L80_LINES[4].text, "Аллаха никто не создал. Он существовал всегда.");
  assert.equal(L80_LINES[16].role, "muhammad");
  assert.match(L80_LINES[16].text, /не создавал Самого Себя/);
  assert.equal(L80_LINES[36].text, "Никто. Аллах существовал всегда.");
  assert.equal(L80_LINES[41].role, "muhammad");
  for (const l of L80_LINES) {
    assert.ok(!/\d/.test(l.text), `в тексте №${l.id} нет номеров`);
    assert.ok(!["kids"].includes(l.role));
  }
  assert.equal(CARD_TEXT, "Аллаха никто не создал. Он существовал всегда");
  assert.deepEqual(CARD_LINES, ["Аллаха никто не создал.", "Он существовал всегда"]);
  const byRole = Object.fromEntries(["muhammad", "yusuf", "amir", "bilal"].map((r) => [r, L80_LINES.filter((l) => l.role === r).length]));
  assert.deepEqual(byRole, { muhammad: 20, yusuf: 10, amir: 7, bilal: 5 });
});

test("класс: 25 учеников, 3 главных за столиком, учитель отдельно, места без повторов", () => {
  assert.equal(CAST.length, 25);
  assert.equal(CAST.filter((p) => p.main).length, 3);
  assert.equal(new Set(CAST.map((p) => p.id)).size, 25);
  const seats = new Set(CAST.map((p) => `${p.seat.row}:${p.seat.x}`));
  assert.equal(seats.size, 25);
  for (const p of CAST) assert.ok(p.age >= 4 && p.age <= 12);
  assert.ok(!CAST.some((p) => p.id === "muhammad"));
  // на ковре никто не сидит ближе 180 px к соседу в том же ряду
  const rows = new Map();
  for (const p of CAST.filter((x) => x.seat.row >= 0)) rows.set(p.seat.row, [...(rows.get(p.seat.row) ?? []), p.seat.x]);
  for (const xs of rows.values()) {
    const s = [...xs].sort((a, b) => a - b);
    for (let i = 1; i < s.length; i++) assert.ok(s[i] - s[i - 1] >= 180, `ряд: ${s[i - 1]} и ${s[i]}`);
  }
});

test("шкала: без замечаний, паузы ровно 150/150/180 кадров по звуку", () => {
  assert.deepEqual(checkTimeline(tl), []);
  for (const p of L80_PAUSES) assert.equal(pauseFrames(tl, p.after), p.sec * FPS, `пауза ${p.id}`);
  assert.equal(L80_PAUSES.reduce((a, p) => a + p.sec, 0), 16);
  // ответ не начинается раньше конца паузы ни звуком, ни артикуляцией (губы — по звуку)
  for (const p of tl.pauses) {
    const next = cueById(tl, p.after + 1);
    assert.ok(tl.sound[next.id].start >= p.to - 1e-6);
    assert.ok(cueById(tl, p.after + 1).from >= p.to - 1e-6);
  }
  assert.ok(tl.durationSec >= FILM.minSec && tl.durationSec <= FILM.maxSec);
});

test("карточка: чистая до письма, письмо после реплики 39, готова до «Готово», в папке в конце", () => {
  const ev = ch.events;
  for (let f = 0; f < ev.writeStart; f += 3) {
    const c = ch.card(f);
    assert.equal(c.state, "blank", `кадр ${f}`);
    assert.equal(c.progress, 0);
  }
  assert.ok(ev.writeStart > F(39).from, "письмо начинается после начала реплики 39");
  assert.ok(ev.writeStart > F(38).to, "письмо начинается после реплики 38");
  assert.ok(ev.writeEnd < F(40).from, "надпись закончена до «Готово»");
  assert.equal(ch.card(F(40).from).state, "complete");
  assert.equal(ch.card(F(41).from).state, "complete");
  assert.equal(ch.progress(F(40).from), 1);
  assert.equal(ch.card(tl.durationInFrames - 1).state, "inFolder");
  assert.ok(ev.cardInFolder > F(42).to, "карточка кладётся в папку после последней реплики");
  // карандаш касается бумаги только во время письма; между словами поднят
  for (const s of ev.writeSpans) assert.ok(s.from >= ev.writeStart && s.to <= ev.writeEnd + 1);
  assert.ok(ev.writeSpans.length >= 5, "штрихи по словам");
  assert.ok(cardTip(0.2).lift < 0.5 || cardTip(0.22).lift < 0.5);
  // карточка перед Амиром не лежит на листе и лодочке
  assert.ok(ch.card(ev.cardPlaced + 1).pos.x + 50 < SHEET_SLOT.x - 50);
  // до реплики 39 карандаш не в руке
  for (let f = 0; f < F(39).from; f += 5) assert.equal(ch.pencil(f).inHand, false, `кадр ${f}`);
});

test("реквизит: лист рядом с лодочкой без пересечения, книга на подставке к реплике 23", () => {
  const ev = ch.events;
  assert.ok(ev.loosePlaced < F(10).from, "лист положен до реплики 10");
  assert.ok(ev.looseTaken > F(9).to);
  const l = ch.loose(ev.loosePlaced + 1);
  assert.ok(l && !l.carried);
  assert.ok(Math.abs(l.pos.x - BOAT.x) < 140 && l.pos.x + 50 <= BOAT.x - 30, "лист рядом с лодочкой, слева, без пересечения");
  // лодочка после придвигания неподвижна до конца фильма
  const b0 = ch.boat(ev.boatMove.to + 1);
  for (let f = ev.boatMove.to; f < tl.durationInFrames; f += 30) assert.deepEqual(ch.boat(f), b0);
  // рисунок Земли лежит на папке с первой сцены до конца
  for (let f = ev.sheetLaid; f < tl.durationInFrames; f += 30) assert.equal(ch.earth(f).carried, false);
  assert.ok(ev.bookSet < F(23).from, "книга на подставке до реплики 23");
  assert.ok(ev.bookLifted > F(22).to);
  for (let f = ev.bookSet; f < tl.durationInFrames; f += 30) assert.equal(ch.quran(f).onStand, 1);
  for (let f = 0; f < ev.bookLifted; f += 30) assert.equal(ch.quran(f).onStand, 0);
  assert.ok(ch.quran(0).pos.y < TABLE.top + 2);
  // стопка: 4 листа → 3 после листа Амира → 2 после карточки
  assert.equal(ch.stackCount(0), 4);
  assert.equal(ch.stackCount(ev.looseTaken + 1), 3);
  assert.equal(ch.stackCount(ev.cardTaken + 1), 2);
});

test("паузы: у всех за столиком руки в коленях, без кивков и жестов; фоновые дети не кивают", () => {
  for (const p of tl.pauses) {
    for (let f = Math.round(p.from * FPS); f <= Math.round(p.to * FPS); f += 4) {
      for (const [name, ctl] of [["teacher", ch.teacher], ["yusuf", ch.yusuf], ["amir", ch.amir], ["bilal", ch.bilal]]) {
        const pose = ctl.pose(f);
        assert.equal(pose.nod ?? 0, 0, `${name}, кадр ${f}: кивок`);
        assert.ok(!ctl.armsFront(f), `${name}, кадр ${f}: рука на столе`);
        for (const a of [pose.armL, pose.armR]) assert.ok(a && a.shape === "relax", `${name}, кадр ${f}: жест`);
      }
      for (const bgp of CAST.filter((x) => !x.main)) assert.equal(ch.bg(bgp).pose(f).nod, 0, `${bgp.id}, кадр ${f}`);
    }
  }
});

test("монтаж: непрерывен, ответные крупные планы начинаются не раньше чем за 20 кадров до конца паузы", () => {
  const shots = buildShots(tl, ch);
  assert.equal(shots[0].from, 0);
  for (let i = 1; i < shots.length; i++) assert.equal(shots[i].from, shots[i - 1].to, shots[i].label);
  assert.equal(shots[shots.length - 1].to, tl.durationInFrames);
  assert.equal(shots[shots.length - 1].kind, "room");
  assert.ok(shots[shots.length - 1].to - shots[shots.length - 1].from >= 2 * FPS, "финал: ≥ 2 с общего плана");
  const cardShots = shots.filter((s) => s.kind === "card");
  assert.ok(cardShots.length >= 3);
  for (const s of cardShots) assert.ok(s.from >= ch.events.writeStart - 4, `вид карточки сверху не раньше письма: ${s.label}`);
  const finished = cardShots.find((s) => s.cardFinished);
  assert.ok(finished && finished.to - finished.from >= 3 * FPS, "готовая карточка видна ≥ 3 с");
  // подписи источников только в своих сценах
  for (const s of shots.filter((x) => x.caption)) {
    const mid = (s.from + s.to) / 2 / FPS;
    assert.ok(["s5", "s6"].includes(tl.sceneOf(mid)), s.label);
  }
});

test("озвучка: все 42 файла и тайминги на месте", { skip: !existsSync(MANIFEST) ? "нет манифеста" : false }, () => {
  assert.equal(manifest.partial, false);
  for (const l of L80_LINES) {
    const ml = manifest.lines.find((x) => x.id === l.id);
    assert.ok(ml, `№${l.id}`);
    assert.equal(ml.text, l.text);
    assert.ok(existsSync(`public/${FILM.voiceDir}/${lineFile(l.id)}`));
    assert.ok(ml.words.length > 0 && ml.env.length > 0);
    assert.ok(ml.peakDb <= -1, `№${l.id}: пик ${ml.peakDb} дБFS`);
  }
  // одна дорожка одного провайдера: смешанных голосов нет
  assert.equal(new Set(manifest.lines.map((l) => l.provider)).size, 1);
  assert.ok(manifest.lines.every((l) => l.provider === manifest.provider));
  const roles = new Map();
  for (const ml of manifest.lines) roles.set(ml.role, new Set([...(roles.get(ml.role) ?? []), JSON.stringify(ml.voice ?? ml.voiceId)]));
  for (const [r, v] of roles) assert.equal(v.size, 1, `у роли ${r} один голос`);
});
