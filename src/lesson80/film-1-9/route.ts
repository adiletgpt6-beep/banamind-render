// Маршрут Билала и журнал раздачи салфеток фильма 80-1-9 (кадры фильма).
// Билал с подносом обходит ряды: ряд A — с ближней стороны (идёт вправо),
// ряд B — из прохода A/B (идёт влево), ряд C — из прохода B/C (вправо);
// затем подходит к Амиру за столиком, проходит за спинами к своему месту,
// садится и ставит поднос на столик. У каждого ученика — остановка: Билал
// снимает с подноса одну салфетку, протягивает, ученик берёт её, Билал
// отпускает, ученик кладёт салфетку рядом со своей тарелкой.
// Скорость шага постоянна и спокойна; моменты подобраны так, чтобы Амир
// получил салфетку к началу надписи «Альхамдулиллях — Хвала Аллаху».
// Без зависимостей от Remotion (читается тестами).
import { FPS } from "../core/video.ts";
import type { Vec } from "../rig/motion.ts";
import { BG_IDS, castById, heightAt, seatPlace } from "./cast.ts";
import { AISLE, AT_TABLE, BG_NAPKIN_W, BG_PLATE_DY, NAPKIN_AT, ROWS } from "./layout.ts";
import { napkinId, type NapkinEvent } from "./napkins.ts";
import { cueById, markOf, type L80Timeline } from "./timeline.ts";

const sec = (s: number) => Math.round(s * FPS);

export type GiveStop = {
  readonly who: string; // castId получателя
  readonly at: Vec; // где стоит Билал (точка между ступнями)
  readonly side: -1 | 1; // с какой стороны от Билала получатель (−1 — слева на экране)
  readonly meet: Vec; // точка встречи рук (центр салфетки при совместном касании)
  readonly rest: Vec; // куда получатель кладёт салфетку
  readonly arrive: number; // кадр остановки
  readonly depart: number; // кадр, когда Билал идёт дальше
  readonly ev: NapkinEvent;
};

export type RouteSeg = { readonly from: number; readonly to: number; readonly pts: readonly Vec[] };

export type BilalRoute = {
  readonly start: Vec;
  readonly stops: readonly GiveStop[]; // 22 ученика + Амир
  readonly segs: readonly RouteSeg[]; // переходы между остановками (и к месту)
  readonly seatBehind: Vec; // за своим местом (стоя)
  readonly seat: Vec; // место за столиком (сидя)
  readonly walkHome: { readonly from: number; readonly to: number };
  readonly sitDown: { readonly from: number; readonly to: number };
  readonly trayDown: { readonly reach: number; readonly contact: number; readonly back: number };
};

// Ступенька передачи (относительно прихода на остановку), кадры.
export const GIVE = { turn: 4, reach: 7, take: 14, extend: 28, contact: 29, release: 35, back: 46, depart: 52 } as const;
// Получатель кладёт салфетку через столько кадров после release.
export const SETTLE_AFTER = 20;
const STAND_OFF = 92; // насколько в стороне от ученика стоит Билал

const len = (pts: readonly Vec[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, (p.y - pts[i].y) * 0.8), 0);

// Встреча рук: над коленями ученика, чуть в сторону Билала, на высоте,
// куда сидящий ученик дотягивается поднятой рукой.
const meetFor = (who: string, side: -1 | 1): Vec => {
  const p = castById(who);
  const pl = seatPlace(p);
  return { x: pl.x - side * 0.07 * pl.h, y: pl.y - 0.5 * pl.h };
};

export const buildRoute = (tl: L80Timeline): BilalRoute => {
  const caption = markOf(tl, "надпись: значение");
  const back = markOf(tl, "Билал возвращается");
  const l13 = cueById(tl, 13);
  const t0 = sec(0.3);
  // контакт с Амиром — в начале надписи
  const amirContact = sec(caption.from) + 4;

  // остановки у фоновых учеников
  type Raw = { who: string; at: Vec; side: -1 | 1; corner: Vec[] };
  const raws: Raw[] = [];
  BG_IDS.forEach((id) => {
    const p = castById(id);
    const row = p.seat.row as "A" | "B" | "C";
    // ряды A и C — Билал идёт вправо и стоит левее ученика (ученик справа);
    // ряд B — идёт влево, стоит правее (ученик слева)
    const dir = row === "B" ? -1 : 1;
    const y = row === "A" ? AISLE.front : row === "B" ? AISLE.AB : AISLE.BC;
    const at = { x: p.seat.x - dir * STAND_OFF, y };
    raws.push({ who: id, at, side: dir === 1 ? 1 : -1, corner: [] });
  });
  // углы при переходе между рядами (обход концов рядов)
  const firstB = raws.findIndex((r) => castById(r.who).seat.row === "B");
  const firstC = raws.findIndex((r) => castById(r.who).seat.row === "C");
  raws[firstB].corner = [
    { x: 1660, y: AISLE.front },
    { x: 1700, y: AISLE.AB },
  ];
  raws[firstC].corner = [
    { x: 96, y: AISLE.AB },
    { x: 110, y: AISLE.BC },
  ];
  // Амир: Билал стоит за ним слева, у края столика
  const amirAt: Vec = { x: AT_TABLE.amir.x - 104, y: 1262 };
  // обход: за спиной bg08 (дальше от камеры), затем правее него — к Амиру
  raws.push({ who: "amir", at: amirAt, side: 1, corner: [{ x: 1600, y: AISLE.BC - 22 }, { x: 1730, y: AISLE.BC + 10 }, { x: 1740, y: 1200 }] });

  // в первом кадре Билал уже у первого ученика ряда A (подходит последний шаг)
  const start: Vec = { x: raws[0].at.x - 40, y: AISLE.front };
  // длительность ходьбы пропорциональна длине пути при постоянной скорости
  const holdF = GIVE.depart;
  const paths: Vec[][] = raws.map((r, i) => [i === 0 ? start : raws[i - 1].at, ...r.corner, r.at]);
  const walkLen = paths.reduce((a, p) => a + len(p), 0);
  // первая остановка: прибытие к t0 + путь; последняя (Амир) — контакт в amirContact
  const total = amirContact - GIVE.contact - t0 - holdF * (raws.length - 1);
  const pxPerFrame = walkLen / Math.max(1, total);
  const stops: GiveStop[] = [];
  const segs: RouteSeg[] = [];
  let t = t0;
  raws.forEach((r, i) => {
    const d = Math.max(10, Math.round(len(paths[i]) / pxPerFrame));
    segs.push({ from: t, to: t + d, pts: paths[i] });
    const arrive = t + d;
    const meet = r.who === "amir" ? { x: amirAt.x + 42, y: 992 } : meetFor(r.who, r.side);
    const p = castById(r.who);
    const pl = seatPlace(p);
    const rest =
      r.who === "amir" ? { x: NAPKIN_AT.amir.x, y: NAPKIN_AT.amir.y } : { x: pl.x - r.side * (BG_NAPKIN_W * 0.5 + 30), y: ROWS[p.seat.row as "A" | "B" | "C"] + BG_PLATE_DY + 4 };
    const ev: NapkinEvent = {
      napkin: napkinId(i),
      giver: "bilal",
      recipient: r.who,
      take: arrive + GIVE.take,
      contact: arrive + GIVE.contact,
      release: arrive + GIVE.release,
      settle: arrive + GIVE.release + SETTLE_AFTER + (r.who === "amir" ? 10 : 0),
    };
    stops.push({ who: r.who, at: r.at, side: r.side, meet, rest, arrive, depart: arrive + holdF, ev });
    t = arrive + holdF;
  });
  // домой: за спинами Амира к своему месту, сесть, поставить поднос
  const seat: Vec = { x: AT_TABLE.bilal.x, y: AT_TABLE.bilal.y };
  const seatBehind: Vec = { x: AT_TABLE.bilal.x - 6, y: 1266 };
  const homeFrom = stops[stops.length - 1].depart;
  const homeTo = homeFrom + Math.max(30, Math.round(len([amirAt, seatBehind]) / pxPerFrame));
  segs.push({ from: homeFrom, to: homeTo, pts: [amirAt, seatBehind] });
  const sitDown = { from: homeTo + 4, to: homeTo + 4 + sec(1.3) };
  const trayDown = { reach: sitDown.to + 2, contact: sitDown.to + sec(0.8), back: sitDown.to + sec(1.4) };
  if (trayDown.back > sec(l13.from) - 6) {
    // запас до реплики 13 обязателен: Билал говорит, уже сидя со свободными руками
    throw new Error(`Билал не успевает сесть до реплики 13 (${(trayDown.back / FPS).toFixed(2)} с > ${(l13.from - 0.2).toFixed(2)} с)`);
  }
  void back;
  return { start, stops, segs, seatBehind, seat, walkHome: { from: homeFrom, to: homeTo }, sitDown, trayDown };
};

// Рост Билала в точке мира.
export const bilalH = (y: number) => heightAt(castById("bilal").age, y);
