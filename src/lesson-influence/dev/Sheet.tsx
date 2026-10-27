// Лист проверки стиля BM-021: персонажи, предметы, стёкла фильтров и точечная сборка.
import React from "react";
import { AbsoluteFill } from "remotion";
import { FILTERS, PART_BG } from "../theme";
import { BookObj, Gift, GlassPlate, Jar, LOOKS, NarrowDoor, Person, PriceTag, YesButton, Badge, type Who } from "../visuals/draw";
import { dotsOf, SH, Swarm, word } from "../visuals/dots";

export const Sheet: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  const pts = dotsOf("sheet-da", word("ДА?", 110, 24), 1500, 900, FILTERS.map((f) => f.color), 11, 300);
  const heart = dotsOf("sheet-heart", SH.heart(110), 1100, 880, ["#ff6b9a", "#d0416f", "#ffd2e1"], 13, 200);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PART_BG.intro[0]}, ${PART_BG.intro[1]})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => (
          <Person key={w} who={w} x={90 + i * 130} y={400} s={0.55} mood={(["smile", "think", "doubt", "happy", "shock", "kind", "tense"] as const)[i % 7]} pose={(["stand", "give", "point", "phone", "think", "wave", "shrug", "stop", "hold", "arms"] as const)[i % 10]} t={1} />
        ))}
        {FILTERS.map((f, i) => <GlassPlate key={f.id} id={f.id} x={110 + i * 140} y={600} w={110} h={160} t={1} />)}
        <Gift x={1080} y={600} />
        <Badge x={1230} y={580} s={0.8} />
        <YesButton x={1420} y={600} s={0.7} />
        <BookObj x={1650} y={580} s={0.8} />
        <Jar x={200} y={1050} n={2} s={0.7} />
        <NarrowDoor x={520} y={1050} k={0.5} h={300} />
        <PriceTag x={800} y={900} text="1,89 $" strike={1} />
        <Swarm pts={heart} k={1} t={1} r={6} />
        <Swarm pts={pts} k={1} t={1} r={5} />
      </svg>
    </AbsoluteFill>
  );
};
