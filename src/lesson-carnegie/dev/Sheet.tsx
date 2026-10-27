// Лист проверки стиля BM-025: мост, площадки, персонажи, формы точечной сборки.
import React from "react";
import { AbsoluteFill } from "remotion";
import { BOOK_PARTS, PART_BG } from "../theme";
import { Bridge, Bubble, Ledge, planksOf } from "../visuals/bridge";
import { dotsOf, Swarm } from "../visuals/dots";
import { Person } from "../visuals/draw";
import { SHAPES, type ShapeName } from "../visuals/shapes";

const COLORS = Object.values(BOOK_PARTS).map((p) => p.color);

export const Sheet: React.FC = () => {
  const names = Object.keys(SHAPES) as ShapeName[];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PART_BG.frame[0]}, ${PART_BG.frame[1]})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <Ledge x={260} y={760} side={-1} label="Вы" />
        <Ledge x={1660} y={760} side={1} label="Собеседник" />
        <Bridge x0={470} x1={1450} y={745} planks={planksOf(8, 8, { fallFrom: 3, fallTo: 5, fall: 0.3 })} rope={1} t={1} />
        <Person who="anna" x={300} y={746} s={0.6} mood="smile" pose="wave" t={1} />
        <Person who="timur" x={1620} y={746} s={0.6} mood="doubt" pose="arms" t={1} flip />
        <Bubble x={960} y={560} text={"Как вы думаете?"} tail={1} />
        {names.map((n, i) => {
          const x = 110 + (i % 9) * 212;
          const y = 120 + Math.floor(i / 9) * 230;
          const pts = dotsOf(`sheet-${n}`, (px, py) => SHAPES[n](px / 0.33, py / 0.33), x, y, COLORS, 7, 110);
          return <Swarm key={n} pts={pts} k={1} t={1} r={2.8} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
