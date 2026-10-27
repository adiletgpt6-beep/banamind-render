// Проверки сценария и тайм-лайна BM-039: опоры на источник, пометки мифа/модели,
// обращение к зрителю на «вы», отсутствие таймеров, длительность, титры.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SCENES, cues, loadManifest, timeline } from "./lib.mjs";
import { SHAPE_KINDS } from "../../src/bm039-republic/dots/shapes.ts";
import { OVERLAY_KINDS } from "../../src/bm039-republic/components/OverlayKinds.ts";

const lines = SCENES.flatMap((s) => s.lines);

test("уникальные id сцен и реплик", () => {
  const ids = [...SCENES.map((s) => s.id), ...lines.map((l) => l.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test("каждая сцена опирается на источник", () => {
  for (const s of SCENES) {
    assert.ok(s.src.length > 0 && s.srcNote, `${s.id}: нет src/srcNote`);
    for (const r of s.src) assert.match(r, /^(L\d+(–L\d+)?|—|README.*)$/, `${s.id}: ${r}`);
  }
});

test("фигуры и надписи существуют, такты в пределах сцены", () => {
  for (const s of SCENES) {
    for (const k of s.visual.dots) {
      assert.ok(SHAPE_KINDS.includes(k.shape.kind), `${s.id}: нет фигуры ${k.shape.kind}`);
      assert.ok(k.at < s.lines.length, `${s.id}: такт ${k.at}`);
    }
    for (const o of s.visual.ov ?? []) {
      assert.ok(OVERLAY_KINDS.includes(o.kind), `${s.id}: нет надписи ${o.kind}`);
      assert.ok(o.at < s.lines.length, `${s.id}: такт ${o.at}`);
    }
  }
});

test("миф об Эре помечен как миф, модель Платона — как модель", () => {
  const er = SCENES.filter((s) => /Эре/.test(s.title));
  assert.ok(er.length >= 2);
  for (const s of er) assert.ok((s.visual.ov ?? []).some((o) => o.kind === "badge" && /МИФ/.test(o.text)), s.id);
  assert.ok(lines.some((l) => /не исторический факт и не религиозное вероучение/i.test(l.text)));
  assert.ok(SCENES.some((s) => (s.visual.ov ?? []).some((o) => o.kind === "badge" && /МОДЕЛЬ/.test(o.text))));
});

test("к зрителю — на «вы», без таймеров и отсчётов", () => {
  for (const l of lines) {
    assert.doesNotMatch(l.text, /\b(таймер|секунд|обратный отсч)/i, l.id);
    // «ты» допустимо только в пересказе слов персонажей (после двоеточия / в кавычках)
    if (/(^|\s)(ты|тебе|тебя)(\s|[,.!?])/i.test(l.text)) assert.match(l.text, /[:«]/, `${l.id}: «ты» вне цитаты`);
  }
});

test("объём речи и длительность фильма", () => {
  const chars = lines.reduce((a, l) => a + l.text.length, 0);
  assert.ok(chars > 17000 && chars < 24000, `символов ${chars}`);
  const tl = timeline();
  if (loadManifest()) assert.ok(tl.duration >= 1770 && tl.duration <= 1830, `длительность ${tl.duration}`);
});

test("титры: ≤ 2 строк, без перекрытий, текст = сценарий", () => {
  const tl = timeline();
  const list = cues(tl);
  for (const c of list) assert.ok(c.rows.length <= 2);
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].end <= list[i].start + 1e-6);
  for (const ln of tl.lines) {
    const got = list.filter((c) => c.lineId === ln.id).map((c) => c.text).join(" ");
    assert.equal(got, ln.text.split(/\s+/).filter(Boolean).join(" "));
  }
});
