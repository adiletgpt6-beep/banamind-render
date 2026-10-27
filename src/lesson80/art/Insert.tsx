// Предметные вставки: тот же лист сверху на деревянном столе.
// pov — взгляд Билала (лист к нему лицом, рука снизу кадра);
// camside — со стороны класса (лист повёрнут к друзьям, рука сверху).
import React from "react";
import { SHEET, SheetContent, type SheetState } from "./Sheet";
import type { Pointer } from "../state";
import { BILAL, TEACHER, YUSUF } from "../cast";

const W = 1920;
const H = 1080;
const SCALE = 3.55;
const SX = (W - SHEET.w * SCALE) / 2;
const SY = 44;

const Arm: React.FC<{ p: NonNullable<Pointer>; from: "bottom" | "top"; skin: string; sleeve: string; cuff?: string; thin?: boolean }> = ({ p, from, skin, sleeve, cuff, thin }) => {
  // всё в координатах листа
  const dir = from === "bottom" ? 1 : -1;
  const tip = { x: p.x, y: p.y };
  if (p.type === "finger") {
    const knuckle = { x: tip.x + 6, y: tip.y + dir * 16 };
    const wrist = { x: knuckle.x + 14, y: knuckle.y + dir * 22 };
    const elbow = { x: wrist.x + 40, y: wrist.y + dir * 120 };
    return (
      <g>
        <line x1={wrist.x} y1={wrist.y} x2={elbow.x} y2={elbow.y} stroke={sleeve} strokeWidth={thin ? 15 : 22} strokeLinecap="round" />
        {cuff ? <line x1={wrist.x + 2} y1={wrist.y + dir * 4} x2={wrist.x + 4} y2={wrist.y + dir * 9} stroke={cuff} strokeWidth={21} /> : null}
        <ellipse cx={(knuckle.x + wrist.x) / 2} cy={(knuckle.y + wrist.y) / 2} rx={12} ry={14} fill={skin} />
        <line x1={tip.x} y1={tip.y} x2={knuckle.x} y2={knuckle.y} stroke={skin} strokeWidth={6.5} strokeLinecap="round" />
        <ellipse cx={tip.x} cy={tip.y - dir * 0.5} rx={2.6} ry={2} fill="#F4D8C8" opacity={0.8} />
      </g>
    );
  }
  const isMarker = p.type === "marker";
  // направление от кончика к ладони: вниз-вправо (снизу) или вверх-вправо (сверху)
  const n = Math.hypot(0.5, 1);
  const ux = 0.5 / n;
  const uy = dir / n;
  const len = isMarker ? 44 : 50;
  const end = { x: tip.x + ux * len, y: tip.y + uy * len };
  const grip = { x: tip.x + ux * 15, y: tip.y + uy * 15 };
  const palm = { x: tip.x + ux * 27 + 7, y: tip.y + uy * 27 };
  const wrist = { x: palm.x + 10, y: palm.y + dir * 16 };
  const elbow = { x: wrist.x + 48, y: wrist.y + dir * 140 };
  return (
    <g>
      <line x1={wrist.x} y1={wrist.y} x2={elbow.x} y2={elbow.y} stroke={sleeve} strokeWidth={21} strokeLinecap="round" />
      {cuff ? <line x1={wrist.x} y1={wrist.y} x2={wrist.x + 3} y2={wrist.y + dir * 7} stroke={cuff} strokeWidth={20} /> : null}
      <ellipse cx={palm.x} cy={palm.y} rx={12.5} ry={11.5} fill={skin} />
      <line x1={tip.x} y1={tip.y} x2={end.x} y2={end.y} stroke={isMarker ? "#2B3442" : p.color ?? "#3A78C2"} strokeWidth={isMarker ? 6.5 : 4.4} strokeLinecap="round" />
      {!isMarker ? (
        <>
          <line x1={tip.x} y1={tip.y} x2={tip.x + ux * 6} y2={tip.y + uy * 6} stroke="#E9C896" strokeWidth={4.2} strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y} r={1.3} fill={p.color ?? "#3A78C2"} />
        </>
      ) : (
        <circle cx={tip.x} cy={tip.y} r={2.2} fill="#24427A" />
      )}
      {/* пальцы, держащие карандаш */}
      <ellipse cx={grip.x + 1} cy={grip.y} rx={5.2} ry={4.2} fill={skin} />
      <ellipse cx={grip.x + 6} cy={grip.y + dir * 4} rx={4.6} ry={4} fill={skin} />
      <ellipse cx={palm.x - 6} cy={palm.y - dir * 2} rx={4.5} ry={6} fill={skin} opacity={0.95} />
    </g>
  );
};

export const SheetInsert: React.FC<{ view: "pov" | "camside"; st: SheetState; pointer: Pointer; frame: number; who?: "bilal" | "yusuf" | "teacher" }> = ({ view, st, pointer, frame, who }) => {
  const person =
    who === "teacher"
      ? { skin: TEACHER.skin, sleeve: TEACHER.suit, cuff: TEACHER.shirt, thin: false }
      : who === "yusuf"
        ? { skin: YUSUF.skin, sleeve: YUSUF.skin, cuff: undefined, thin: true }
        : { skin: BILAL.skin, sleeve: BILAL.top, cuff: undefined, thin: false };
  // лёгкое «дыхание» камеры не нужно: вставка неподвижна
  void frame;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="woodIns" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E3B985" />
          <stop offset="1" stopColor="#D2A26C" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#woodIns)" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M 0 ${40 + i * 95} C 500 ${20 + i * 95} 1300 ${70 + i * 95} ${W} ${30 + i * 95}`} stroke="#C99560" strokeWidth={3} fill="none" opacity={0.35} />
      ))}
      <g transform={`translate(${SX} ${SY}) scale(${SCALE})`}>
        <rect x={3} y={4} width={SHEET.w} height={SHEET.h} fill="rgba(90,55,25,0.22)" />
        <SheetContent s={st} uid={`ins-${view}`} />
        {pointer ? <Arm p={pointer} from={view === "pov" ? "bottom" : "top"} {...person} /> : null}
      </g>
    </svg>
  );
};
