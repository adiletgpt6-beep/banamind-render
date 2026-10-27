import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { WorldJourney } from "../scenes/WorldJourney";
import { QuranScene } from "../scenes/QuranScene";
import { EndingScene } from "../scenes/EndingScene";
import { CAPTIONS } from "../scenes/captions";
import { LivingLine } from "../components/LivingLine";
import { Title, PointerLabel } from "../components/Typography";
import { Soundtrack } from "../components/Soundtrack";
import { FPS } from "../engines/InfiniteCameraEngine";
import { frameAt, mapPoint } from "../engines/SpaceMap";
import { CELL_PARTS } from "../components/PlantCell";
import { COLORS } from "../styles/theme";
import "../styles/theme";

// MUSLIM KIDS — INFINITE DISCOVERY · Experiment 002 · «Большой мир в маленькой капле»
export const InfiniteDiscovery001: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const f = frameAt(t);
  const nucleus = mapPoint("C", CELL_PARTS.nucleus, f);
  const chl = mapPoint("C", CELL_PARTS.chloroplast, f);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 40%, #0d2140 0%, ${COLORS.deep} 70%)` }}>
      <WorldJourney t={t} />
      <QuranScene t={t} />
      <EndingScene t={t} />
      <LivingLine t={t} />
      {CAPTIONS.map((c, i) => <Title key={i} c={c} t={t} />)}
      <PointerLabel t={t} t0={8.0} t1={10.1} text="ДЕНЬ" at={mapPoint("globe", { x: -0.52, y: -0.42 }, f)} to={mapPoint("globe", { x: -0.52, y: -0.25 }, f)} />
      <PointerLabel t={t} t0={9.05} t1={10.2} text="НОЧЬ" at={mapPoint("globe", { x: 0.55, y: 0.55 }, f)} to={mapPoint("globe", { x: 0.55, y: 0.31 }, f)} />
      <PointerLabel t={t} t0={33.0} t1={35.1} text="ядро" at={{ x: nucleus.x - 250, y: nucleus.y + 30 }} to={nucleus} />
      <PointerLabel t={t} t0={33.4} t1={35.1} text="хлоропласт" at={{ x: chl.x - 330, y: chl.y + 120 }} to={chl} />
      <Soundtrack />
    </AbsoluteFill>
  );
};
