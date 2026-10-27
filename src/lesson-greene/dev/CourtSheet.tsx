// Лист персонажей и предметов фильма (только для проверки рисунков, в фильм не входит).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Board, Castle, Chess, Coin, CoinStack, Crown, Figure, Mask, Ribbon, Scroll, Throne, type Role } from "../visuals/court";

const ROLES: Role[] = ["king", "queen", "minister", "courtier", "lady", "soldier", "merchant", "scholar", "artist", "modern", "peasant", "boss", "general"];

export const CourtSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff3d6" }}>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {ROLES.map((r, i) => (
        <Figure key={r} x={90 + i * 145} y={360} s={0.95} role={r} t={i} mood={(["happy", "proud", "sad", "angry", "shock", "sly", "neutral", "worried", "talk", "happy", "sleep", "angry", "proud"] as const)[i]} arms={[12 + i * 10, 20 + i * 11]} />
      ))}
      <Throne x={160} y={760} s={0.8} glow={1} />
      <Castle x={460} y={760} s={0.6} />
      <Chess x={700} y={760} kind="king" />
      <Chess x={800} y={760} kind="queen" dark />
      <Chess x={900} y={760} kind="pawn" />
      <Chess x={1000} y={760} kind="knight" dark />
      <Chess x={1100} y={760} kind="rook" />
      <Crown x={1250} y={680} glow={1} />
      <Scroll x={1500} y={640} w={260} h={180} lines={["Совет", "дервиша"]} />
      <Coin x={1700} y={600} />
      <CoinStack x={1800} y={700} n={5} />
      <Mask x={1700} y={820} />
      <Mask x={1820} y={820} sad />
      <Board x={1300} y={1040} w={500} />
      <Ribbon x={600} y={1000} text="ЗАКОН 1" />
    </svg>
  </AbsoluteFill>
);
