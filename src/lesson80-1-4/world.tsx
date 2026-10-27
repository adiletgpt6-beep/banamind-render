// Учебная комната ролика 80-1-4 — та же, что в предыдущих фильмах (стена,
// доска, шкаф, окно с деревом и горами, тумба, ковёр, низкий столик, 22
// фоновых ученика на своих местах). Новое: на столике — росток фасоли в
// горшке на поддоне (на светлом месте), лейка, подставка с карточками и
// стопка карточек; на подставке тумбы — закрытый Коран.
//
// Порядок рисования — по глубине (линии опоры на полу). Дети за столиком
// рисуются до стола; их руки, которые работают над столешницей (лейка,
// карточки, поддон), — отдельным слоем после стола и предметов в руках,
// поэтому кисть лежит поверх ручки лейки, а не прячется под столом.
import React from "react";
import { TABLE, WINDOW, scaleAt } from "../lesson01/layout";
import { Character } from "../lesson01/rig/Character";
import type { Look } from "../lesson01/rig/looks";
import type { Face, Pose } from "../lesson01/rig/pose";
import { Board } from "../lesson01/sets/Board";
import { House, Table } from "../lesson01/sets/Props";
import { RoomBack } from "../lesson01/sets/Room";
import { HOUSE_AT, QURAN_AT, RAIL0, STACK0, SUN_PATCH, TS } from "./layout";
import { Card, type CardKind, CardRail, CardStack, QuranOnStand, SproutPot, SunPatch, WateringCan, WaterStream } from "./sets/props";

export type Char = {
  id: string;
  look: Look;
  x: number;
  y: number; // линия опоры (глубина)
  pose: Pose;
  face: Face;
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  overArms?: ("L" | "R")[]; // руки над столешницей — рисуются поверх стола
  hidden?: boolean;
};

export type PotState = { x: number; y: number; wet: number; puddle: number; sway: number; tilt: number; light: number; dent: number };
export type CanState = { x: number; y: number; tilt: number; held: boolean };
type V2 = { x: number; y: number };
// detach — где и куда смотрел носик в момент остановки: хвост струи и капли
// продолжают падать оттуда, даже когда лейку уже выпрямили и подняли.
// tipAt/dirAt — носик и его направление как функции времени фильма: каждая
// капля падает оттуда, где носик был в момент отрыва.
export type StreamState = { tip: V2; dir: V2; land: V2; start: number; stop: number | null; detach?: { tip: V2; dir: V2 }; tipAt?: (t: number) => V2; dirAt?: (t: number) => V2 } | null;
export type CardsState = { rail: (CardKind | null)[]; stack: number; amirStack: number; amirStackAt: { x: number; y: number } };

export type RoomState = { t: number; chars: Char[]; pot: PotState; can: CanState; stream: StreamState; cards: CardsState; sun: number };

// Предметы на столешнице (рисуются вместе со столом).
const TableTop: React.FC<{ s: RoomState }> = ({ s }) => {
  const { pot, can, cards } = s;
  return (
    <g>
      <Table x={TABLE.x} floorY={TABLE.floorY} s={TS} w={TABLE.w} legH={TABLE.legH} topD={TABLE.topD} />
      <SunPatch x={SUN_PATCH.x} y={SUN_PATCH.y} s={TS} w={SUN_PATCH.w} k={s.sun} />
      <CardRail x={RAIL0.x} y={RAIL0.y} s={TS} cards={cards.rail} />
      {cards.stack > 0 ? <CardStack x={STACK0.x} y={STACK0.y} s={TS} n={cards.stack} /> : null}
      {cards.amirStack > 0 ? <CardStack x={cards.amirStackAt.x} y={cards.amirStackAt.y} s={TS} n={cards.amirStack} /> : null}
      <SproutPot x={pot.x} y={pot.y} s={TS} wet={pot.wet} puddle={pot.puddle} sway={pot.sway} tilt={pot.tilt} light={pot.light} dent={pot.dent} t={s.t} />
      {!can.held ? <WateringCan x={can.x} y={can.y} s={TS} tilt={can.tilt} shadow={1} /> : null}
    </g>
  );
};

// Обычный дневной свет на подоконнике: тёплое мягкое пятно на правой,
// солнечной части (без лучей и свечения).
const SillLight: React.FC = () => {
  const x0 = WINDOW.x + WINDOW.w * 0.28;
  const x1 = WINDOW.x + WINDOW.w + 30;
  const y = WINDOW.y + WINDOW.h;
  return (
    <g>
      <defs>
        <linearGradient id="sill-sun" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff3cf" stopOpacity={0} />
          <stop offset="0.35" stopColor="#fff3cf" stopOpacity={0.55} />
          <stop offset="0.85" stopColor="#fff6da" stopOpacity={0.6} />
          <stop offset="1" stopColor="#fff6da" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={x0} y={y + 3} width={x1 - x0} height={27} rx={6} fill="url(#sill-sun)" />
    </g>
  );
};

export const RoomWorld: React.FC<{ s: RoomState }> = ({ s }) => {
  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [{ y: TABLE.floorY, el: <TableTop key="table" s={s} /> }];
  // предмет в руках над столом и струя воды — после стола, до рук
  items.push({
    y: TABLE.floorY + 0.4,
    el: (
      <g key="held">
        {s.can.held ? <WateringCan x={s.can.x} y={s.can.y} s={TS} tilt={s.can.tilt} shadow={0} /> : null}
        {s.stream ? <WaterStream tip={s.stream.tip} dir={s.stream.dir} land={s.stream.land} start={s.stream.start} stop={s.stream.stop} detach={s.stream.detach} tipAt={s.stream.tipAt} dirAt={s.stream.dirAt} t={s.t} s={TS} /> : null}
      </g>
    ),
  });
  for (const c of s.chars) {
    if (c.hidden) continue;
    const sc = scaleAt(c.y);
    const over = c.y < TABLE.floorY && c.overArms && c.overArms.length ? c.overArms : null;
    items.push({
      y: c.y,
      el: <Character key={c.id} uid={c.id} look={c.look} pose={c.pose} face={c.face} x={c.x} y={c.y} scale={sc} holdL={c.holdL} holdR={c.holdR} layer={over ? "body" : "all"} layerArms={over ?? []} chestLean />,
    });
    if (over)
      items.push({
        y: TABLE.floorY + 0.6,
        el: <Character key={`${c.id}-arms`} uid={`${c.id}a`} look={c.look} pose={c.pose} face={c.face} x={c.x} y={c.y} scale={sc} holdL={c.holdL} holdR={c.holdR} layer="arms" layerArms={over} />,
      });
  }
  items.sort((a, b) => a.y - b.y);
  return (
    <g>
      <RoomBack t={s.t} windowGround />
      <SillLight />
      {/* домик из первого фильма — на тумбе у стены; закрытый Коран — на подставке */}
      <House x={HOUSE_AT.x} y={HOUSE_AT.y} s={0.6} />
      <QuranOnStand x={QURAN_AT.x} y={QURAN_AT.y} s={1} />
      <Board cards={{}} captions={{}} />
      {items.map((i) => i.el)}
    </g>
  );
};

export { Card };
