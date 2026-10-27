// Лист проверки стиля BM-029: фигуры ролей, предметы, три стола и точечная сборка.
import React from "react";
import { AbsoluteFill } from "remotion";
import { DESKS, PART_BG } from "../theme";
import { dotsOf, SH, Swarm } from "../visuals/dots";
import { BookSymbol, Car, Cell, Coins, DateCard, DeskGlass, Factory, Rocket } from "../visuals/objects";
import { LOOKS, Person, type Who } from "../visuals/people";

export const Sheet: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  const rocket = dotsOf("sheet-rocket", SH.rocket(150), 1700, 260, ["#17b8b0", "#0b8580", "#7fe3dc"], 11, 170);
  const car = dotsOf("sheet-car", SH.car(180), 1500, 900, ["#ff6f61", "#d4473b", "#ffb0a8"], 11, 200);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PART_BG.intro[0]}, ${PART_BG.intro[1]})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => (
          <Person key={w} who={w} x={70 + i * 118} y={330} s={0.5} mood={(["smile", "think", "doubt", "happy", "shock", "kind", "tense"] as const)[i % 7]} pose={(["stand", "give", "point", "phone", "think", "wave", "shrug", "stop", "hold", "arms"] as const)[i % 10]} t={1} />
        ))}
        {DESKS.map((d, i) => <DeskGlass key={d.id} id={d.id} x={250 + i * 470} y={700} w={400} h={220} level={0.3 + i * 0.3} t={1} focus={i === 1} />)}
        <Rocket x={1560} y={560} s={0.4} flame={1} t={1} />
        <Car x={1500} y={700} s={0.5} t={1} battery={1} />
        <Cell x={1400} y={420} />
        <Coins x={1270} y={500} n={4} s={0.7} />
        <Factory x={300} y={1050} w={420} k={1} t={1} />
        <BookSymbol x={700} y={920} s={0.45} />
        <DateCard x={950} y={950} text="7 июня 2013" />
        <Swarm pts={rocket} k={1} t={1} r={5} />
        <Swarm pts={car} k={1} t={1} r={5} />
      </svg>
    </AbsoluteFill>
  );
};
