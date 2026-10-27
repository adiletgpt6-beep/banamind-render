// Мир комнаты: задний план, доска, столик с домиком, ящик с игрушками,
// персонажи. Порядок рисования — по глубине (линии опоры на полу).
import React from "react";
import { TABLE, TOYBOX, scaleAt, tableTopY } from "./layout";
import { Character } from "./rig/Character";
import type { Look } from "./rig/looks";
import type { Face, Pose } from "./rig/pose";
import { Board, type CardId } from "./sets/Board";
import { House, type PartState, Table, ToyBox, ToyTree } from "./sets/Props";
import { RoomBack } from "./sets/Room";

export type CharState = {
  id: string;
  look: Look;
  x: number;
  y: number; // линия опоры (глубина)
  pose: Pose;
  face: Face;
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  hidden?: boolean;
  opacity?: number;
};

export type WorldState = {
  t: number;
  chars: CharState[];
  cards: Partial<Record<CardId, number>>;
  captions: Partial<Record<CardId, string>>;
  houseParts?: Record<string, PartState | undefined>;
  treeOnTable?: { x: number; y: number } | null; // в координатах домика
  treeInBox: boolean;
  boxCubes: number; // сколько кубиков видно в ящике (воспоминание)
};

export const HOUSE_X = TABLE.x - 18;
export const houseScale = () => scaleAt(TABLE.floorY);
export const houseBaseY = () => tableTopY() - TABLE.topD * scaleAt(TABLE.floorY) * 0.45;
export const TOYBOX_Y = TOYBOX.y;
export const TOYBOX_X = TOYBOX.x;

export const World: React.FC<{ s: WorldState }> = ({ s }) => {
  const ts = scaleAt(TABLE.floorY);
  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [];
  items.push({
    y: TABLE.floorY,
    el: (
      <g key="table">
        <Table x={TABLE.x} floorY={TABLE.floorY} s={ts} w={TABLE.w} legH={TABLE.legH} topD={TABLE.topD} />
        <House x={HOUSE_X} y={houseBaseY()} s={ts} states={s.houseParts} />
        {s.treeOnTable ? <ToyTree x={HOUSE_X + s.treeOnTable.x * ts} y={houseBaseY() + s.treeOnTable.y * ts} s={ts} /> : null}
      </g>
    ),
  });
  const bs = scaleAt(TOYBOX_Y);
  items.push({
    y: TOYBOX_Y,
    el: (
      <ToyBox key="box" x={TOYBOX_X} y={TOYBOX_Y} s={bs}>
        {s.treeInBox ? <ToyTree x={-22} y={-58} s={0.95} shadow={false} /> : null}
      </ToyBox>
    ),
  });
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
      <Board cards={s.cards} captions={s.captions} />
      {items.map((i) => i.el)}
    </g>
  );
};
