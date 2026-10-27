// Фон BM-020: глубокий чернильно-синий градиент, мягкая виньетка и редкие
// неподвижные «звёзды»-точки (без мерцания). Не чёрный: предметы на телефоне видны.
import React from "react";
import { AbsoluteFill } from "remotion";
import { rnd } from "../visuals/dots";
import { C } from "../theme";

const STARS = Array.from({ length: 60 }, (_, i) => ({ x: rnd(i, 91) * 1920, y: rnd(i, 92) * 1080, r: 1.4 + rnd(i, 93) * 1.6, o: 0.12 + rnd(i, 94) * 0.18 }));

export const Background: React.FC<{ warm?: number }> = ({ warm = 0 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #26406b 0%, ${C.bgTop} 45%, ${C.bgBottom} 100%)` }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={C.mist} opacity={s.o} />
      ))}
      {warm > 0 && <rect width={1920} height={1080} fill={C.amberDeep} opacity={0.05 * warm} />}
    </svg>
  </AbsoluteFill>
);
