// Проверки данных фильма 80-1-10 (node --test): дословные 44 реплики и роли,
// состав класса (25 мальчиков, учитель отдельно), 25 карточек и сетка 5 × 5,
// порядок появления надписей плаката (ни один будущий ответ — раньше своей
// паузы), лодочка (один уголок раскрыт в паузе 4, затем держит форму до
// конца), шкала (четыре паузы ровно по 150 кадров, ответ — после паузы,
// 4–5 с финального общего плана), монтажный план, покой в паузах, звуки
// вне пауз и файлы озвучки.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { FILM, FILM_TITLE_CARD, L80_LINES, L80_PAUSES, POSTER_TEXT, VOICES } from "../src/lesson80/film-1-10/script.ts";
import { buildTimeline, checkTimeline, cueById, estimateManifest, finalHoldSec, markOf, pauseFrames } from "../src/lesson80/film-1-10/timeline.ts";
import { checkRoster, classRoster, drawingCards, cardByOwner } from "../src/lesson80/film-1-10/roster.ts";
import { buildPlan } from "../src/lesson80/film-1-10/plan.ts";
import { buildBoatPlan } from "../src/lesson80/film-1-10/boatPlan.ts";
import { buildChoreo } from "../src/lesson80/film-1-10/choreo.ts";
import { buildShots } from "../src/lesson80/film-1-10/shots.ts";
import { TEACHER } from "../src/lesson80/characters/characterConfig.ts";
import { boatTip, captionTip, CAPTION, drawingTip } from "../src/lesson80/film-1-10/drawingPaths.ts";

const MANIFEST = `public/${FILM.voiceDir}/manifest.json`;
const hasVoice = existsSync(MANIFEST);
const manifest = hasVoice ? JSON.parse(readFileSync(MANIFEST, "utf8")) : estimateManifest();
const tl = buildTimeline(manifest);
const pl = buildPlan(tl);
const bp = buildBoatPlan(tl);
const ch = buildChoreo(pl, bp);
const shots = buildShots(tl, pl, (f) => ch.teacher.place(f).x);
const F = (s) => Math.round(s * FILM.fps);
const pause = (id) => tl.pauses.find((p) => p.id === id);

// Канонический текст из задания (дословно).
const EXPECTED = [
  ["muhammad", "Сегодня сделаем общий плакат. Каждый добавит свой рисунок."],
  ["yusuf", "Я нарисую яблоко!"],
  ["amir", "А я — дерево."],
  ["bilal", "У меня будет Земля."],
  ["muhammad", "Хорошо. Расскажем рисунками о том, что узнали."],
  ["muhammad", "Посмотрите на Землю, дерево, яблоко. Кто создал природу и нас с вами?"],
  ["yusuf", "Аллах!"],
  ["muhammad", "Да. В Коране говорится: «Аллах — Творец всякой вещи»."],
  ["amir", "И нас тоже создал Аллах."],
  ["muhammad", "Поэтому назовём плакат: «Аллах — наш Создатель»."],
  ["bilal", "Земля, птица, человек — такие разные!"],
  ["muhammad", "А сколько у них Создателей? Подумайте и ответьте."],
  ["amir", "Один!"],
  ["muhammad", "Верно. Аллах Един. В Коране сказано: «Он — Аллах Единый»."],
  ["yusuf", "Я помню ещё один вопрос!"],
  ["muhammad", "Хочешь напомнить его нам?"],
  ["yusuf", "А кто создал Аллаха?"],
  ["muhammad", "Вы тоже вспомните ответ."],
  ["yusuf", "Аллаха никто не создал. Он существовал всегда."],
  ["muhammad", "Правильно. У Аллаха нет начала. В Коране Он назван Первым."],
  ["bilal", "Значит, до Него ничего не было."],
  ["muhammad", "Да."],
  ["yusuf", "Лодочку тоже нарисуем?"],
  ["amir", "Конечно! Я её сложил."],
  ["yusuf", "А ты тоже Создатель?"],
  ["muhammad", "Амир сделал лодочку из готовой бумаги. Люди делают вещи из уже существующих материалов."],
  ["bilal", "А нас и всё, из чего мы делаем вещи, создал Аллах."],
  ["amir", "На рисунке подпишем: «Лодочку сложил Амир»."],
  ["yusuf", "Ой, уголок разогнулся! Я испортил лодочку?"],
  ["amir", "Сейчас посмотрим."],
  ["muhammad", "Как можно помочь Юсуфу?"],
  ["amir", "Вот этот край нужно снова согнуть. Держи лодочку, а я поправлю."],
  ["yusuf", "Вот так?"],
  ["amir", "Да. Теперь она снова держит форму."],
  ["yusuf", "Спасибо, Амир!"],
  ["amir", "Теперь вместе нарисуем её рядом с деревом."],
  ["bilal", "Рисунки готовы. Можно собирать плакат."],
  ["muhammad", "Вы внимательно смотрели, вспоминали и помогали друг другу."],
  ["yusuf", "Альхамдулиллях! Это значит: «Хвала Аллаху»."],
  ["muhammad", "Смотрите, каждый добавил что-то своё."],
  ["yusuf", "Рисунки сделали мы. А наш Создатель — Аллах."],
  ["amir", "Он Един."],
  ["bilal", "У Него нет начала."],
  ["yusuf", "Вот теперь плакат готов!"],
];

test("44 реплики дословно, в исходном порядке, у своих героев; четыре голоса", () => {
  assert.equal(L80_LINES.length, 44);
  L80_LINES.forEach((l, i) => {
    assert.equal(l.id, i + 1);
    assert.equal(l.role, EXPECTED[i][0], `роль реплики ${l.id}`);
    assert.equal(l.text, EXPECTED[i][1], `текст реплики ${l.id}`);
  });
  assert.deepEqual(Object.keys(VOICES).sort(), ["amir", "bilal", "muhammad", "yusuf"]);
  const ids = new Set(Object.values(VOICES).map((v) => v.elevenlabs.voiceId));
  assert.equal(ids.size, 4, "у каждого героя свой голос");
});

test("название фильма в начале не показывает заголовок плаката и ответы", () => {
  const card = `${FILM_TITLE_CARD.title} ${FILM_TITLE_CARD.sub}`;
  for (const t of [POSTER_TEXT.title, POSTER_TEXT.one, POSTER_TEXT.noBeginning, "Аллах", "Создател"]) assert.ok(!card.includes(t), `в названии есть «${t}»`);
});

test("надписи плаката точные", () => {
  assert.equal(POSTER_TEXT.title, "Аллах — наш Создатель");
  assert.equal(POSTER_TEXT.one, "Аллах Един");
  assert.equal(POSTER_TEXT.noBeginning, "У Аллаха нет начала");
  assert.equal(POSTER_TEXT.boatCaption, "Лодочку сложил Амир");
});

test("класс: 25 мальчиков, учитель отдельно; 25 карточек, по одной на каждого, сетка 5 × 5", () => {
  assert.deepEqual(checkRoster(), []);
  assert.equal(classRoster.length, 25);
  assert.ok(!classRoster.some((r) => r.id === TEACHER.id));
  assert.equal(drawingCards.length, 25);
  assert.equal(new Set(drawingCards.map((c) => c.owner)).size, 25);
  assert.equal(cardByOwner("amir").kind, "tree");
  // во всех кадрах — ровно 25 карточек, ни одной двадцать шестой
  for (let f = 0; f < tl.durationInFrames; f += 15) assert.equal(pl.cards(f).length, 25);
});

test("шкала: проверки, четыре паузы ровно по 150 кадров, ответ после паузы, финал 4–5 с", () => {
  assert.deepEqual(checkTimeline(tl), []);
  assert.equal(L80_PAUSES.length, 4);
  assert.deepEqual(L80_PAUSES.map((p) => p.after), [6, 12, 18, 31]);
  for (const p of L80_PAUSES) {
    assert.equal(pauseFrames(tl, p.after), 150, `пауза после ${p.after}`);
    const span = pause(p.id);
    assert.ok(tl.sound[p.after + 1].start >= span.to - 1e-6, `ответ ${p.after + 1} раньше конца паузы`);
    assert.ok(tl.sound[p.after].end <= span.from + 1e-6, `вопрос ${p.after} заходит в паузу`);
  }
  assert.equal(L80_PAUSES.reduce((a, p) => a + p.sec, 0), 20);
  const hold = finalHoldSec(tl);
  assert.ok(hold >= 4 && hold <= 5, `финал ${hold}`);
  assert.ok(tl.durationSec >= 220 && tl.durationSec <= 260, `длительность ${tl.durationSec}`);
  assert.deepEqual(tl.scenes.map((s) => s.id), ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]);
});

test("плакат: P0…P5 по порядку; будущие ответы не видны до конца своей паузы", () => {
  const order = ["P0", "P1", "P2", "P3", "P4", "P5"];
  let last = 0;
  for (let f = 0; f < tl.durationInFrames; f += 5) {
    const k = order.indexOf(pl.stage(f));
    assert.ok(k >= last, `этап плаката откатился в кадре ${f}`);
    last = k;
  }
  assert.equal(pl.stage(0), "P0");
  // заголовок — только после ответа Юсуфа (реплика 7) и во время реплики 10
  const p1 = pause("pause01");
  for (let f = 0; f <= F(p1.to) + 5; f += 3) assert.equal(pl.titleProgress(f), 0, `заголовок раньше времени (${f})`);
  assert.ok(pl.write.start >= F(cueById(tl, 10).from));
  // «Аллах Един» — после паузы 2 и ответа Амира
  const p2 = pause("pause02");
  for (let f = 0; f <= F(cueById(tl, 13).to); f += 3) assert.notEqual(pl.textState("one", f).where, "poster");
  for (let f = 0; f <= F(p2.to); f += 3) assert.ok(pl.textState("one", f).flip < 0.5, "текст «Аллах Един» открыт раньше ответа");
  // «У Аллаха нет начала» — после паузы 3 и объяснения
  for (let f = 0; f <= F(cueById(tl, 22).to); f += 3) {
    assert.notEqual(pl.textState("two", f).where, "poster");
    assert.ok(pl.textState("two", f).flip < 0.5);
  }
  // к концу сцены 7 закреплены все 25 детских карточек, лодочка и подпись дорисованы
  const s7end = F(markOf(tl, "плакат на столе").to);
  const cs = pl.cards(s7end);
  assert.equal(cs.filter((c) => c.where === "poster" && c.tape >= 2).length, 25);
  const tree = cs.find((c) => c.owner === "amir");
  assert.equal(tree.boat, 1);
  assert.equal(tree.caption, 1);
  assert.equal(pl.stage(tl.durationInFrames - 1), "P5");
});

test("лодочка: одна модель, уголок раскрыт в паузе 4, исправлен после неё и держит форму до конца", () => {
  const p4 = pause("pause04");
  for (let f = F(p4.from); f < F(p4.to); f++) assert.ok(bp.open(f) > 0.9, `уголок закрыт в паузе (${f})`);
  for (let f = 0; f < bp.events.openStart; f += 3) assert.equal(bp.open(f), 0);
  for (let f = bp.events.foldEnd + 2; f < tl.durationInFrames; f += 3) assert.ok(bp.open(f) < 0.01, `уголок снова открыт (${f})`);
  // исправление — после паузы, руки никого в паузе на лодочке
  assert.ok(bp.events.point >= F(p4.to));
  for (let f = F(p4.from); f < F(p4.to); f += 2) {
    const h = bp.hands(f);
    assert.ok(!h.amir || h.amir.visible < 0.05, "рука Амира в паузе");
    assert.ok(!h.yusuf || h.yusuf.visible < 0.05, "рука Юсуфа в паузе");
  }
  // сгиб восстанавливается непрерывно: open убывает без скачков
  for (let f = bp.events.foldBack; f < bp.events.foldEnd; f++) assert.ok(Math.abs(bp.open(f + 1) - bp.open(f)) < 0.12);
});

test("монтаж: планы подряд от 0 до конца; финал — общий план комнаты ≥ 4 с; исправление сгиба одним планом", () => {
  assert.equal(shots[0].from, 0);
  for (let i = 1; i < shots.length; i++) assert.equal(shots[i].from, shots[i - 1].to, `разрыв перед планом ${shots[i].label}`);
  const last = shots[shots.length - 1];
  assert.equal(last.to, tl.durationInFrames);
  assert.equal(last.kind, "room");
  assert.ok(last.to - F(tl.sound[44].end) >= 4 * FILM.fps);
  const repair = shots.find((s) => s.from <= bp.events.point && s.to > bp.events.letGo);
  assert.ok(repair, "нет одного плана на всё исправление");
  assert.equal(repair.kind, "boat");
  assert.ok(shots.length >= 28 && shots.length <= 56, `планов ${shots.length}`);
});

test("рисунки: в крупных планах — только штрихи цвета карандаша в руке; подпись — под лодочкой", () => {
  // семейства цветов: карандаш Юсуфа красный, Амира зелёный, Билала голубой
  const family = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (r > g + 40 && r > b + 40) return "red";
    if (g > r + 20 && g > b) return "green";
    if (b > r + 40 && b >= g) return "blue";
    return "other";
  };
  const kind = { yusuf: "apple", amir: "tree", bilal: "earth" };
  for (const s of shots.filter((x) => x.kind === "desk" && ["yusufCard", "amirCard", "bilalCard"].includes(x.desk))) {
    const id = s.desk.replace("Card", "");
    const want = family(pl.pencilTake[id].color);
    for (let f = s.from; f < s.to; f++) {
      const p = pl.mainProgress[id](f);
      const tip = drawingTip(kind[id], p);
      if (tip.down && p > 0 && p < 1) assert.equal(family(tip.color), want, `${s.label}, кадр ${f}: штрих ${tip.color} карандашом ${pl.pencilTake[id].color}`);
    }
  }
  // карандаш кладут не раньше чем через 0,5 с после последнего штриха
  for (const id of ["yusuf", "amir", "bilal"]) {
    let done = pl.drawStart[id];
    while (pl.mainProgress[id](done) < 1) done++;
    assert.ok(pl.pencilDown[id] - done >= F(0.5), `${id}: карандаш кладут через ${(pl.pencilDown[id] - done) / FILM.fps} с после штриха`);
  }
  // подпись — точный текст, целиком ниже лодочки
  assert.equal(CAPTION, "Лодочку сложил Амир");
  let boatBottom = 0;
  for (let i = 0; i <= 400; i++) {
    const t = boatTip(i / 400);
    if (t.down) boatBottom = Math.max(boatBottom, t.y);
  }
  for (let i = 0; i <= 400; i++) {
    const t = captionTip(i / 400);
    if (t.down) assert.ok(t.y > boatBottom, `подпись (y ${t.y.toFixed(1)}) не ниже лодочки (${boatBottom.toFixed(1)})`);
  }
});

test("в паузах никто не говорит и не тянется к реквизиту; звуки действий вне пауз", () => {
  for (const p of tl.pauses) {
    for (let f = F(p.from) + 2; f < F(p.to) - 2; f += 4) {
      for (const who of ["teacher", "yusuf", "amir", "bilal"]) {
        const pose = ch[who].pose(f);
        assert.ok(!pose.nod, `${who} кивает в паузе ${p.id}`);
        for (const a of [pose.armL, pose.armR]) assert.ok(!a || a.shape === "relax" || a.shape === "open", `${who}: рука занята в паузе ${p.id}`);
      }
    }
  }
  // все отрезки действий не пересекают паузы
  for (const [label, m] of Object.entries(tl.marks)) {
    if (label.startsWith("pause")) continue;
    for (const p of tl.pauses) assert.ok(m.to <= p.from + 1e-6 || m.from >= p.to - 1e-6, `«${label}» пересекает ${p.id}`);
  }
});

test("озвучка: полная дорожка ElevenLabs, тексты совпадают, файлы на месте", { skip: !hasVoice }, () => {
  assert.equal(manifest.partial, false);
  assert.equal(manifest.lines.length, 44);
  const provs = new Set(manifest.lines.map((l) => l.provider));
  assert.equal(provs.size, 1);
  assert.equal([...provs][0], manifest.provider);
  for (const l of L80_LINES) {
    const m = manifest.lines.find((x) => x.id === l.id);
    assert.ok(m, `нет реплики ${l.id}`);
    assert.equal(m.text, l.text);
    assert.ok(existsSync(`public/${FILM.voiceDir}/${m.file}`));
    assert.ok(m.words.length > 0 && m.env.length > 0);
    assert.ok(m.peakDb <= -1, `пик реплики ${l.id}`);
  }
  const byRole = new Map();
  for (const m of manifest.lines) {
    const v = m.voiceId ?? JSON.stringify(m.voice);
    byRole.set(m.role, (byRole.get(m.role) ?? new Set()).add(v));
  }
  for (const [role, s] of byRole) assert.equal(s.size, 1, `у ${role} несколько голосов`);
});
