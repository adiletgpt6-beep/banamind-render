// MuslimKidsGeometryWonders004 — «Удивительная геометрия мира», 60 с, 1080×1920.
// Слои: фон → 3D-миры (по актам, с наложением на переходах) → надписи → звук.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp, window01 } from "../engines/GeometryWondersEngine";
import { LandscapeWorld } from "../scenes/Scene04Landscape";
import { HoneycombBackground, HoneycombWorld } from "../scenes/Scene05Honeycomb";
import { CreationWorld } from "../scenes/Scenes06to07Creation";
import { Brand, OrnamentBackground, Quote } from "../components/FinalTexts";
import { PlanetWorld } from "../scenes/Scenes01to03Planet";
import { Soundtrack } from "../systems/AudioSyncSystem";
import { Label, Title } from "../systems/TypographySystem";
import { PALETTE } from "../styles/palette";
import { T } from "../timeline";
import { GeometricSun } from "../components/GeometricSun";

/** Мир показывается на [a, b] с плавным входом/выходом (маскированный переход). */
const Act: React.FC<{ t: number; a: number; b: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode }> = ({
  t,
  a,
  b,
  fadeIn = 0,
  fadeOut = 0,
  children,
}) => {
  if (t < a || t > b) return null;
  const k = Math.min(fadeIn ? ramp(t, a, a + fadeIn, "soft") : 1, fadeOut ? 1 - ramp(t, b - fadeOut, b, "soft") : 1);
  return <AbsoluteFill style={{ opacity: k }}>{children}</AbsoluteFill>;
};

const SpaceBackground: React.FC<{ t: number }> = ({ t }) => {
  const glow = 0.55 + 0.45 * ramp(t, T.space[0], T.space[1]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 85% 55% at 50% 48%, rgba(32,90,145,${0.55 * glow}) 0%, rgba(15,39,68,0.9) 45%, ${PALETTE.night} 100%)`,
      }}
    />
  );
};

const SkyBackground: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, #2f6fa8 0%, #6fb2dc 34%, #cfe8f4 58%, #e9f3ee 100%)` }} />
);

export const MuslimKidsGeometryWonders004: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.night }}>
      <SpaceBackground t={t} />
      <Act t={t} a={0} b={T.landIn[1]} fadeOut={T.landIn[1] - T.landIn[0]}>
        <GeometricSun t={t} opacity={window01(t, T.sunLight[0] + 0.3, T.dive[0] + 1.0, 1.2, 0.8)} />
        <PlanetWorld />
        <Label t={t} at={T.day - 0.15} until={T.dive[0] + 0.2} text="ДЕНЬ" pos={{ x: 330, y: 1420 }} color={PALETTE.night} pill={PALETTE.milk} />
        <Label t={t} at={T.night - 0.15} until={T.dive[0] + 0.2} text="НОЧЬ" pos={{ x: 750, y: 1420 }} color={PALETTE.milk} pill={PALETTE.royalDeep} />
      </Act>
      <Act t={t} a={T.landIn[0]} b={T.combIn[1]} fadeIn={T.landIn[1] - T.landIn[0]} fadeOut={T.combIn[1] - T.combIn[0]}>
        <SkyBackground />
        <LandscapeWorld />
      </Act>
      <Act t={t} a={T.combIn[0]} b={T.ornamentIn[1]} fadeIn={T.combIn[1] - T.combIn[0]} fadeOut={T.ornamentIn[1] - T.ornamentIn[0]}>
        <HoneycombBackground />
        <HoneycombWorld />
      </Act>
      <Act t={t} a={T.ornamentIn[0]} b={60} fadeIn={T.ornamentIn[1] - T.ornamentIn[0]}>
        <OrnamentBackground t={t} />
        <CreationWorld />
        <Title
          t={t}
          at={T.reflectText[0]}
          until={T.reflectText[1]}
          lines={["РАЗМЫШЛЯЙ", "О ТВОРЕНИИ"]}
          sub={["Сура «Аль-Имран», 3:190–191", "тема аятов — пересказ смысла"]}
          y={150}
        />
        <Quote t={t} />
        <Brand t={t} />
      </Act>
      <Soundtrack />
    </AbsoluteFill>
  );
};
