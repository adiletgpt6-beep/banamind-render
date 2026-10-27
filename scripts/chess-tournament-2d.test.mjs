// Проверки BalaGoChessTournament2D (№27): реплики и голоса, шкала по
// фактической речи, позиции на доске (ориентация, легальность, мат после
// показанного/подразумеваемого хода), номер — только в последних 150
// кадрах, звук без шагов. Запуск: node --test scripts/chess-tournament-2d.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CH2_CONTACT_FRAMES,
  CH2_LINES,
  CH2_SEG_SPECS,
  CH2_TEXT,
  CH2_VIDEO,
  CH2_VOICES,
  CLUB_POSITION,
  MEMORY_POSITION,
  POSITION_A,
  POSITION_B,
  isDark,
  placementFen,
  sq,
} from "../src/chess-tournament-2d/script.ts";
import { buildCh2Timeline, checkCh2Timeline } from "../src/chess-tournament-2d/timing.ts";
import { requireCh2Manifest } from "../src/chess-tournament-2d/manifestGuard.ts";

const DIR = join("public", CH2_VIDEO.voiceDir);
const manifest = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const EXPECTED = [
  ...["N01", "N02", "N03", "N04", "N05", "N06", "N07", "N08", "N09"],
  ...["F01", "F02", "F03", "F04", "F05"],
  ...["D01", "D02", "D03", "D04"],
  ...["M01", "M02"],
];

test("20 реплик: ID уникальны, роли по префиксу, каждая ровно один раз на шкале", () => {
  const ids = CH2_LINES.map((l) => l.id);
  assert.deepEqual([...ids].sort(), [...EXPECTED].sort());
  assert.equal(new Set(ids).size, 20);
  assert.deepEqual(CH2_SEG_SPECS.map((s) => s.id).sort(), [...EXPECTED].sort());
  const role = { N: "narrator", F: "father", D: "daughter", M: "mother" };
  for (const l of CH2_LINES) assert.equal(l.role, role[l.id[0]], l.id);
  const tl = buildCh2Timeline(manifest);
  for (const id of EXPECTED) assert.equal(tl.cues.filter((c) => c.id === id).length, 1, id);
});

test("озвучка полная: файлы есть, декодируются, длительность совпадает", () => {
  requireCh2Manifest(manifest);
  assert.equal(manifest.lines.length, 20);
  for (const l of manifest.lines) {
    const p = join(DIR, l.file);
    assert.ok(existsSync(p), p);
    const d = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).toString());
    assert.ok(Math.abs(d - l.durationSec) < 0.12, `${l.id}: ${d} vs ${l.durationSec}`);
  }
});

test("у каждой роли один постоянный голос из CH2_VOICES, роли различны", () => {
  const byRole = new Map();
  for (const l of manifest.lines) {
    const line = CH2_LINES.find((x) => x.id === l.id);
    const set = byRole.get(line.role) ?? new Set();
    set.add(l.voiceId);
    byRole.set(line.role, set);
  }
  for (const [r, set] of byRole) {
    assert.equal(set.size, 1, r);
    assert.ok(set.has(CH2_VOICES[r].voiceId), r);
  }
  assert.equal(new Set(Object.values(CH2_VOICES).map((v) => v.voiceId)).size, 4);
});

test("шкала: без наложений, речь внутри сцен, контакты — последние 150 кадров", () => {
  const tl = buildCh2Timeline(manifest);
  assert.deepEqual(checkCh2Timeline(tl), []);
  assert.equal(tl.frames - tl.contactFrom, CH2_CONTACT_FRAMES);
  assert.equal(tl.scenes.at(-1).id, "contact");
  assert.equal(tl.scenes.at(-1).from, tl.contactFrom);
  tl.scenes.forEach((s, i) => assert.equal(s.from, i ? tl.scenes[i - 1].to : 0));
  for (const c of tl.cues) {
    if (c.id === "N09") continue;
    assert.ok(c.audioFrom + c.durationSec <= tl.contactFrom / CH2_VIDEO.fps, `${c.id} заходит в контакты`);
  }
  const n09 = tl.cues.find((c) => c.id === "N09");
  assert.ok(n09.from * CH2_VIDEO.fps >= tl.contactFrom && n09.audioFrom + n09.durationSec <= tl.frames / CH2_VIDEO.fps - 0.8);
  // D03 договаривается до ответа папы; D04 — до финальной паузы и контактов
  const d03 = tl.cues.find((c) => c.id === "D03");
  const f04 = tl.cues.find((c) => c.id === "F04");
  assert.ok(f04.from > d03.to + 0.8);
  const d04 = tl.cues.find((c) => c.id === "D04");
  assert.ok(tl.contactFrom / CH2_VIDEO.fps - d04.to > 6, "после D04 — действие и человеческий финал");
  const saved = JSON.parse(readFileSync(join(DIR, "timeline.json"), "utf8"));
  assert.equal(saved.partial, false);
  assert.equal(saved.frames, tl.frames);
});

// ---------- Шахматы ----------
const at = (pieces) => new Map(pieces.map((p) => [p.at, p]));
const inside = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;
const name = (f, r) => `${String.fromCharCode(97 + f)}${r + 1}`;
const attacks = (pieces, white) => {
  const occ = at(pieces);
  const out = new Set();
  for (const p of pieces.filter((x) => x.white === white)) {
    const { file: f, rank: r } = sq(p.at);
    const dirs = p.kind === "R" ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    if (p.kind === "K") for (const [dx, dy] of dirs) inside(f + dx, r + dy) && out.add(name(f + dx, r + dy));
    else if (p.kind === "P") for (const dx of [-1, 1]) inside(f + dx, r + (white ? 1 : -1)) && out.add(name(f + dx, r + (white ? 1 : -1)));
    else
      for (const [dx, dy] of dirs) {
        let x = f + dx;
        let y = r + dy;
        while (inside(x, y)) {
          out.add(name(x, y));
          const o = occ.get(name(x, y));
          // король атакованной стороны не закрывает линию (нельзя отступить вдоль неё)
          if (o && !(o.kind === "K" && o.white !== white)) break;
          x += dx;
          y += dy;
        }
      }
  }
  return out;
};
const king = (pieces, white) => pieces.find((p) => p.kind === "K" && p.white === white);
const legalStart = (pieces, toMoveWhite) => {
  const wk = sq(king(pieces, true).at);
  const bk = sq(king(pieces, false).at);
  assert.ok(Math.max(Math.abs(wk.file - bk.file), Math.abs(wk.rank - bk.rank)) > 1, "короли не соседствуют");
  // сторона, которая НЕ ходит, не под шахом
  assert.ok(!attacks(pieces, toMoveWhite).has(king(pieces, !toMoveWhite).at), "у стороны, которая не ходит, нет шаха");
};
const isMate = (pieces, matedWhite) => {
  const k = king(pieces, matedWhite);
  const att = attacks(pieces, !matedWhite);
  if (!att.has(k.at)) return false;
  const { file: f, rank: r } = sq(k.at);
  const own = at(pieces);
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if ((!dx && !dy) || !inside(f + dx, r + dy)) continue;
      const s = name(f + dx, r + dy);
      const o = own.get(s);
      if (o && o.white === matedWhite) continue;
      const after = pieces.filter((p) => p.at !== s).map((p) => (p === k ? { ...p, at: s } : p));
      if (!attacks(after, !matedWhite).has(s)) return false;
    }
  return true; // в этих позициях у матуемой стороны нет других фигур
};
const move = (pieces, from, to) => pieces.map((p) => (p.at === from ? { ...p, at: to } : p));

test("доска: a1 тёмное, h1 светлое (справа внизу у белых — светлое поле)", () => {
  assert.equal(isDark(sq("a1")), true);
  assert.equal(isDark(sq("h1")), false);
  assert.equal(isDark(sq("h8")), true);
});

test("домашняя задача: FEN 7k/4Q3/6K1/8/8/8/8/8 w, Qg7# корректен, вариант f7 — не мат", () => {
  assert.equal(placementFen(POSITION_A.pieces), POSITION_A.fen.split(" ")[0]);
  legalStart(POSITION_A.pieces, true);
  assert.ok(isMate(move(POSITION_A.pieces, "e7", "g7"), false));
  assert.ok(!isMate(move(POSITION_A.pieces, "e7", POSITION_A.tryAt), false));
});

test("новая задача дочки: FEN 2r5/8/8/8/8/8/2k5/K7 b, Ra8# корректен", () => {
  assert.equal(placementFen(POSITION_B.pieces), POSITION_B.fen.split(" ")[0]);
  legalStart(POSITION_B.pieces, false);
  assert.ok(isMate(move(POSITION_B.pieces, "c8", "a8"), true));
  assert.notEqual(POSITION_B.fen, POSITION_A.fen);
});

test("учебные позиции: в кружке Ra1–a8#, дома — кадр после Rh1–h8#", () => {
  assert.equal(placementFen(CLUB_POSITION.pieces), CLUB_POSITION.fen.split(" ")[0]);
  legalStart(CLUB_POSITION.pieces, true);
  assert.ok(isMate(move(CLUB_POSITION.pieces, "a1", "a8"), false));
  const before = MEMORY_POSITION.pieces.map((p) => (p.id === "wR" ? { ...p, at: "h1" } : p));
  assert.equal(placementFen(before), MEMORY_POSITION.fenBefore.split(" ")[0]);
  legalStart(before, true);
  assert.ok(isMate(MEMORY_POSITION.pieces, false));
});

// ---------- Тексты, номер, звук ----------
test("номер WhatsApp — только в контактной карточке и не озвучивается", () => {
  const number = "0998 08 38 28";
  assert.equal(CH2_TEXT.cta.whatsapp, `WhatsApp: ${number}`);
  const flat = JSON.stringify({ ...CH2_TEXT, cta: null, whatsappUrl: null });
  assert.ok(!flat.includes("0998") && !flat.includes("998083828"));
  const dirs = ["src/chess-tournament-2d/scenes", "src/chess-tournament-2d/props", "src/chess-tournament-2d/sets"];
  for (const d of dirs)
    for (const f of readdirSync(d)) {
      if (f === "Contact.tsx") continue;
      const src = readFileSync(join(d, f), "utf8");
      assert.ok(!src.includes("0998") && !src.includes("cta.whatsapp"), `${d}/${f}`);
    }
  for (const l of CH2_LINES) assert.ok(!/0998|тогуз жүз/.test(l.spoken ?? l.text), l.id);
});

test("BalaGo впервые появляется в поиске родителей; заявка — предварительная", () => {
  const tl = buildCh2Timeline(manifest);
  const first = CH2_LINES.findIndex((l) => /BalaGo/.test(l.text));
  assert.equal(CH2_LINES[first].id, "N07");
  assert.ok(tl.scenes.findIndex((s) => s.id === "search") > tl.scenes.findIndex((s) => s.id === "calendars"));
  assert.equal(CH2_TEXT.form.sent, "Өтүнмө жөнөтүлдү");
  const all = JSON.stringify(CH2_TEXT);
  for (const bad of ["Айдоочу дайындалды", "Маршрут бекитилди", "төлөн", "сом", "отзыв", "рейтинг"]) assert.ok(!all.includes(bad), bad);
});

test("кыргызские тексты листа, формы и сообщений", () => {
  assert.deepEqual(CH2_TEXT.schedule, { title: "Шахмат", sub: "Кошумча машыгуу", days: "Дүйшөмбү · Шаршемби · Жума", end: "Аяктоо: 15:00" });
  assert.equal(CH2_TEXT.coachMsg, "Кызыңыз турнирге катышпоону чечти.");
  assert.equal(CH2_TEXT.momMsg, "Кызыбыз турнирге катышкысы келет. Жолду кантип уюштурарыбызды тактап жатабыз.");
  assert.equal(CH2_TEXT.search.query, "Бишкек балдар үчүн такси");
  assert.equal(CH2_TEXT.form.route, "Маршрут: Мектеп → Үй");
  assert.equal(CH2_TEXT.tagline, "Балдар үчүн такси");
});

test("звук без шагов: только эффекты с видимым действием", () => {
  const src = readFileSync("src/chess-tournament-2d/Ch2Audio.tsx", "utf8");
  assert.ok(!/step|footstep/i.test(src));
  const files = readdirSync(join(DIR, "sfx")).map((f) => f.replace(".mp3", ""));
  assert.deepEqual(files.sort(), ["car-cabin", "paper", "piece", "tap"]);
  for (const m of ["curious", "office", "quiet", "warm", "focus", "end"]) assert.ok(existsSync(join(DIR, "music", `ch2d-${m}.mp3`)), m);
});
