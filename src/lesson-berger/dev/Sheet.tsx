// Лист проверки стиля BM-038: персонажи, шесть камер, точечные предметы и сеть разговоров.
import React from "react";
import { AbsoluteFill } from "remotion";
import { CELL, CELLS, PART_BG } from "../theme";
import { Swarm } from "../visuals/dots";
import { LOOKS, Person, type Who } from "../visuals/draw";
import { buildNet, Chamber, Net, Spark } from "../visuals/lab";
import { pic, PICS } from "../visuals/pix";

export const Sheet: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  const names = Object.keys(PICS);
  const nodes = buildNet("sheet", 1600, 860, { gens: 3, fan: 2.2, step: 70, colors: CELLS.map((c) => CELL[c].color) });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PART_BG.intro[0]}, ${PART_BG.intro[1]})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => (
          <Person key={w} who={w} x={70 + i * 118} y={300} s={0.4} mood="smile" t={1} />
        ))}
        {CELLS.map((c, i) => (
          <Chamber key={c} cell={c} x={40 + i * 210} y={330} w={190} h={180} small>
            <Spark x={135 + i * 210} y={440} r={22} t={1} color={CELL[c].color} />
          </Chamber>
        ))}
        {names.map((n, i) => (
          <Swarm key={n} pts={pic(`sheet-${n}`, PICS[n], 80 + (i % 12) * 150, 600 + Math.floor(i / 12) * 160, 0.62, 6)} k={1} t={1} r={2.6} outline={false} />
        ))}
        <Net nodes={nodes} k={3} t={1} r={10} />
      </svg>
    </AbsoluteFill>
  );
};
