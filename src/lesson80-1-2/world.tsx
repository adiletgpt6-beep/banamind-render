// Учебная комната ролика 80-1-2 — та же, что в «Кто построил домик?»
// (стена, доска, шкаф, окно с тем же деревом, тумба, ковёр, низкий столик),
// с новыми предметами на столе. Домик первого фильма стоит на тумбе как
// знакомая деталь. Порядок рисования — по глубине (линии опоры на полу).
import React from "react";
import { CABINET, TABLE, scaleAt } from "../lesson01/layout";
import { Character } from "../lesson01/rig/Character";
import { House, Table } from "../lesson01/sets/Props";
import { RoomBack } from "../lesson01/sets/Room";
import type { CharState } from "../lesson01/World";
import { type BoardState, LessonBoard } from "./sets/board";
import { Apple, AppleHalf, AppleHalfTurning, Knife, Napkin, Plate, SAUCER_SEED, Saucer, Seed } from "./sets/props";

export const TS = scaleAt(TABLE.floorY); // масштаб предметов на столе
export const PLATE_W = { x: 1515, y: 1830 } as const;
export const APPLE_REST = { x: PLATE_W.x, y: PLATE_W.y - 6 * TS } as const; // опора целого яблока
export const HALF_L = { x: PLATE_W.x - 21 * TS, y: PLATE_W.y - 4 * TS } as const;
export const HALF_R = { x: PLATE_W.x + 22 * TS, y: PLATE_W.y - 6 * TS } as const;
export const SAUCER0 = { x: 1668, y: 1834 } as const;
export const SAUCER1 = { x: 1636, y: 1834 } as const;
export const NAPKIN_W = { x: 1424, y: 1838 } as const;
export const KNIFE_REST = { x: 1446, y: 1838 - 7 * TS, rot: 5 } as const; // рукоять справа, лезвие влево

export type TableProps = {
  apple: "hand" | "plate" | "none"; // целое яблоко на тарелке (или в руке, или уже разрезано)
  appleCut: number; // линия разреза 0…1
  halves: null | { open: number; lx: number; ly: number; rx: number; ry: number }; // half positions (мир)
  halfSeedsL: [boolean, boolean];
  knifeOnNapkin: boolean;
  saucerX: number;
  seedOnSaucer: boolean;
};

export type RoomState = { t: number; chars: CharState[]; board: BoardState; props: TableProps };

export const TableSet: React.FC<{ p: TableProps }> = ({ p }) => {
  const sx = p.saucerX;
  return (
    <g>
      <Table x={TABLE.x} floorY={TABLE.floorY} s={TS} w={TABLE.w} legH={TABLE.legH} topD={TABLE.topD} />
      <Napkin x={NAPKIN_W.x} y={NAPKIN_W.y} s={TS} />
      {p.knifeOnNapkin ? <Knife x={KNIFE_REST.x} y={KNIFE_REST.y} rot={KNIFE_REST.rot} s={TS} flip /> : null}
      <Saucer x={sx} y={SAUCER0.y} s={TS}>
        {p.seedOnSaucer ? <Seed x={SAUCER_SEED.x} y={SAUCER_SEED.y} ang={168} /> : null}
      </Saucer>
      <Plate x={PLATE_W.x} y={PLATE_W.y} s={TS} />
      {p.apple === "plate" ? <Apple x={APPLE_REST.x} y={APPLE_REST.y} s={TS} cut={p.appleCut} shadow /> : null}
      {p.halves ? (
        p.halves.open >= 0.999 ? (
          <g>
            <AppleHalf x={p.halves.lx} y={p.halves.ly} side={-1} s={TS} seeds={p.halfSeedsL} />
            <AppleHalf x={p.halves.rx} y={p.halves.ry} side={1} s={TS} />
          </g>
        ) : (
          <g>
            <g transform={`translate(${p.halves.lx} ${p.halves.ly}) scale(${TS})`}>
              <AppleHalfTurning x={0} y={0} side={-1} k={p.halves.open} />
            </g>
            <g transform={`translate(${p.halves.rx} ${p.halves.ry}) scale(${TS})`}>
              <AppleHalfTurning x={0} y={0} side={1} k={p.halves.open} />
            </g>
          </g>
        )
      ) : null}
    </g>
  );
};

export const RoomWorld: React.FC<{ s: RoomState }> = ({ s }) => {
  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [{ y: TABLE.floorY, el: <TableSet key="table" p={s.props} /> }];
  for (const c of s.chars) {
    if (c.hidden) continue;
    items.push({
      y: c.y,
      el: <Character key={c.id} uid={c.id} look={c.look} pose={c.pose} face={c.face} x={c.x} y={c.y} scale={scaleAt(c.y)} holdL={c.holdL} holdR={c.holdR} opacity={c.opacity} />,
    });
  }
  items.sort((a, b) => a.y - b.y);
  return (
    <g>
      <RoomBack t={s.t} />
      {/* домик из первого фильма — на тумбе у стены */}
      <House x={CABINET.x + 300} y={CABINET.y - 16} s={0.6} />
      <LessonBoard b={s.board} />
      {items.map((i) => i.el)}
    </g>
  );
};
