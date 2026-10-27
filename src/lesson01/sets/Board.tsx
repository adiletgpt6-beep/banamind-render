// Доска с карточками-иллюстрациями. Карточки появляются по очереди, по жесту
// учителя; на них — статичные картинки (без «самосборки» домика):
//   1) стол и отдельные кубики — «Домика ещё нет»;
//   2) стол с готовым домиком — «Домик построен»;
//   3) Земля; 4) нейтральные пиктограммы людей (без лиц, имён и костюмов).
import React from "react";
import { fontFamily } from "../../fonts";
import { BOARD } from "../layout";
import { OUTLINE } from "../rig/looks";
import { CUBE, Cube, House, Roof, WOOD } from "./Props";

const f = (n: number) => n.toFixed(1);

export const CARD = { w: 270, h: 370, y: 150, xs: [40, 330, 620, 910] } as const;
export type CardId = "before" | "after" | "earth" | "people";
export const CARD_INDEX: Record<CardId, number> = { before: 0, after: 1, earth: 2, people: 3 };

const MiniTable: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <path d={`M -95 ${y} l 14 -16 h 190 l -14 16 Z`} fill="#c9925f" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
    <rect x={-95} y={y} width={190} height={9} fill="#a87347" stroke={OUTLINE} strokeWidth={2.5} />
    <rect x={-82} y={y + 9} width={10} height={40} fill="#9c6a40" stroke={OUTLINE} strokeWidth={2} />
    <rect x={72} y={y + 9} width={10} height={40} fill="#9c6a40" stroke={OUTLINE} strokeWidth={2} />
  </g>
);

const CardArt: React.FC<{ id: CardId }> = ({ id }) => {
  const cx = CARD.w / 2;
  if (id === "before") {
    const s = 0.62;
    const c = CUBE * s;
    return (
      <g transform={`translate(${cx} 0)`}>
        <MiniTable y={190} />
        {/* кубики лежат отдельно, крыша — рядом */}
        {[
          [-80, 186, 0, "plain", -8],
          [-52, 188, 1, "door", 6],
          [-20, 187, 2, "plain", 0],
          [12, 186, 3, "window", 12],
          [40, 188, 4, "dots", -4],
          [-66, 168, 5, "window", 4],
        ].map(([x, y, k, deco, r], i) => (
          <Cube key={i} x={x as number} y={y as number} c={c} color={WOOD[k as number]} deco={deco as "plain"} rot={r as number} />
        ))}
        <Roof x={70} y={187} c={c * 0.8} rot={0} />
      </g>
    );
  }
  if (id === "after") {
    return (
      <g transform={`translate(${cx} 0)`}>
        <MiniTable y={190} />
        <House x={-6} y={188} s={0.78} shadow={false} />
      </g>
    );
  }
  if (id === "earth") {
    return (
      <g transform={`translate(${cx} 128)`}>
        <circle r={92} fill="#4a8cc4" stroke={OUTLINE} strokeWidth={3} />
        <path d="M -60 -50 C -30 -70 0 -60 10 -40 C 20 -20 -10 -10 -20 10 C -30 30 -60 20 -70 0 C -80 -20 -75 -40 -60 -50 Z" fill="#79b47d" />
        <path d="M 30 -10 C 50 -20 75 -5 70 20 C 66 45 40 60 25 45 C 12 30 15 0 30 -10 Z" fill="#79b47d" />
        <path d="M -30 50 C -10 45 10 60 0 75 C -20 85 -40 70 -30 50 Z" fill="#9cc47e" />
        <path d="M -80 -10 C -40 -20 20 -25 80 -15" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={8} strokeLinecap="round" />
        <circle r={92} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={10} transform="translate(-6 -6) scale(0.9)" />
      </g>
    );
  }
  // люди: нейтральные пиктограммы
  const fig = (x: number, h: number, color: string, key: number) => {
    const r = h * 0.17;
    return (
      <g key={key} transform={`translate(${x} 250)`}>
        <circle cx={0} cy={-h + r} r={r} fill={color} />
        <path d={`M ${-h * 0.2} 0 L ${-h * 0.24} ${-h * 0.5} Q 0 ${-h * 0.72} ${h * 0.24} ${-h * 0.5} L ${h * 0.2} 0 Z`} fill={color} />
      </g>
    );
  };
  return (
    <g>
      <ellipse cx={cx} cy={252} rx={110} ry={10} fill="#d9d2c4" />
      {fig(cx - 75, 170, "#7d8fa8", 0)}
      {fig(cx - 18, 150, "#a98aa3", 1)}
      {fig(cx + 38, 100, "#c9a06c", 2)}
      {fig(cx + 85, 120, "#8fae95", 3)}
    </g>
  );
};

export const Board: React.FC<{ cards: Partial<Record<CardId, number>>; captions: Partial<Record<CardId, string>> }> = ({ cards, captions }) => {
  const { x, y, w, h } = BOARD;
  return (
    <g>
      {/* доска */}
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={14} fill="#c3c8cf" stroke={OUTLINE} strokeWidth={3} />
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#fbfbf8" />
      <rect x={x + 30} y={y + 24} width={w - 60} height={h - 48} fill="none" stroke="#eef0ec" strokeWidth={10} />
      <rect x={x + 60} y={y + h + 10} width={w - 120} height={20} rx={6} fill="#aeb4bb" stroke={OUTLINE} strokeWidth={2.5} />
      <rect x={x + 160} y={y + h + 2} width={70} height={12} rx={5} fill="#2c4a7a" />
      <rect x={x + 250} y={y + h + 2} width={70} height={12} rx={5} fill="#b04f3e" />
      {(Object.keys(CARD_INDEX) as CardId[]).map((id) => {
        const p = cards[id] ?? 0;
        if (p <= 0.001) return null;
        const cx0 = x + CARD.xs[CARD_INDEX[id]];
        const cy0 = y + CARD.y - 60;
        const e = 1 - Math.pow(1 - Math.min(1, p), 3);
        const cap = captions[id];
        return (
          <g key={id} opacity={f(Math.min(1, p * 1.6))} transform={`translate(${f(cx0)} ${f(cy0 + (1 - e) * 24)})`}>
            <rect x={6} y={8} width={CARD.w} height={CARD.h} rx={10} fill="#000" opacity={0.08} />
            <rect x={0} y={0} width={CARD.w} height={CARD.h} rx={10} fill="#fffdf7" stroke={OUTLINE} strokeWidth={2.5} />
            <circle cx={CARD.w / 2} cy={14} r={9} fill="#c65c49" stroke={OUTLINE} strokeWidth={2} />
            <CardArt id={id} />
            {cap ? (
              <text x={CARD.w / 2} y={CARD.h - 34} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={27} fill="#234467">
                {cap}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

