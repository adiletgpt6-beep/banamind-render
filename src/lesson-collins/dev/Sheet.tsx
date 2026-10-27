// Лист проверки стиля BM-037: маховик, шестерни узлов, фон мастерской, люди.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { C } from "../theme";
import { Person } from "../visuals/draw";
import { Flywheel, Gear } from "../visuals/machine";

export const Sheet: React.FC = () => (
  <AbsoluteFill>
    <Background part="study" prev="study" k={1} />
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <Flywheel x={520} y={470} r={230} angle={20} trail={0.6} label="маховик" />
      <Gear x={1180} y={330} r={120} angle={10} color={C.teal} label="Люди" />
      <Gear x={1420} y={520} r={120} angle={-6} color={C.coral} label="Ясность" />
      <Gear x={1660} y={330} r={120} angle={14} color={C.yellow} label="Шаги" />
      <Person who="anna" x={1200} y={980} s={0.6} mood="smile" pose="wave" t={1} />
      <Person who="timur" x={1500} y={980} s={0.6} mood="think" pose="point" t={1} flip />
    </svg>
  </AbsoluteFill>
);
