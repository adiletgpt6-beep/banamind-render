// Лист проверки стиля BM-034: персонажи, состояния Я, монтажный стол и точечная сборка.
import React from "react";
import { AbsoluteFill } from "remotion";
import { EGO, PART_BG } from "../theme";
import { EgoStack, MontageDesk } from "../visuals/core";
import { dotsOf, SH, Swarm, word } from "../visuals/dots";
import { BookObj, LOOKS, Person, type Who } from "../visuals/draw";

export const Sheet: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  const pts = dotsOf("sheet-dano", word("ДА,НО", 90, 22), 1500, 950, [EGO.P.color, EGO.A.color, EGO.C.color], 9, 320);
  const heart = dotsOf("sheet-heart", SH.heart(90), 1150, 930, ["#ff6b9a", "#ff9fb8", "#ffffff"], 11, 160);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PART_BG.intro[0]}, ${PART_BG.intro[1]})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => (
          <Person key={w} who={w} x={70 + i * 118} y={360} s={0.45} mood="smile" t={1} />
        ))}
        <EgoStack x={150} y={700} s={0.6} names />
        <BookObj x={400} y={700} s={0.9} />
        <MontageDesk t={10} x0={560} x1={1860} y={620} k={1} said={[{ text: "Почему бы вам не…?", at: 0, atS: 0 }, { text: "Да, но…", at: 0, atS: 0 }]} hidden={[{ text: "интерпретация", at: 0, atS: 0 }]} outcome={{ text: "Тишина", atS: 0 }} play={0.6} />
        <Swarm pts={heart} k={1} t={1} r={5} />
        <Swarm pts={pts} k={1} t={1} r={5} />
      </svg>
    </AbsoluteFill>
  );
};
