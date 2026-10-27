// Учебная комната ролика 80-1-3 — та же, что в «Кто построил домик?» и «Что
// спрятано в яблоке?» (стена, доска, шкаф, окно с тем же деревом, тумба,
// ковёр, низкий столик). Новое — только постоянные детали этого фильма:
// открытая нижняя левая створка окна, край лёгкой занавески справа и
// маленький столик у окна. Домик первого фильма стоит на тумбе, доска чистая.
// Порядок рисования — по глубине (линии опоры на полу); предметы (столики,
// подставка, вертушка) приходят из режиссуры как элементы с глубиной.
import React from "react";
import { CABINET, scaleAt } from "../lesson01/layout";
import { Character } from "../lesson01/rig/Character";
import { House } from "../lesson01/sets/Props";
import { RoomBack } from "../lesson01/sets/Room";
import type { CharState } from "../lesson01/World";
import { BOARD0, LessonBoard } from "../lesson80-1-2/sets/board";
import { Curtain, OpenWindow } from "./sets/windowCorner";

export type DepthItem = { y: number; key: string; el: React.ReactNode };
export type RoomState = { t: number; chars: CharState[]; items: DepthItem[]; wind: number };

export const RoomWorld: React.FC<{ s: RoomState }> = ({ s }) => {
  const items: DepthItem[] = [...s.items];
  for (const c of s.chars) {
    if (c.hidden) continue;
    items.push({
      y: c.y,
      key: c.id,
      el: <Character key={c.id} uid={c.id} look={c.look} pose={c.pose} face={c.face} x={c.x} y={c.y} scale={scaleAt(c.y)} holdL={c.holdL} holdR={c.holdR} opacity={c.opacity} />,
    });
  }
  // при равной глубине предметы на столике рисуются после самого столика
  items.sort((a, b) => a.y - b.y);
  return (
    <g>
      <RoomBack t={s.t} />
      <OpenWindow t={s.t} />
      <Curtain t={s.t} wind={s.wind} />
      {/* домик из первого фильма — на тумбе у стены (как во втором фильме) */}
      <House x={CABINET.x + 300} y={CABINET.y - 16} s={0.6} />
      <LessonBoard b={{ ...BOARD0, t: s.t }} />
      {items.map((i) => (
        <React.Fragment key={i.key}>{i.el}</React.Fragment>
      ))}
    </g>
  );
};
