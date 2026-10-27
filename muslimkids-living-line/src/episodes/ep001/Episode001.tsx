// MUSLIM KIDS — THE LIVING LINE — Episode 001
// «Кто создал этот удивительный мир?» (Āl ʿImrān 3:190–191)

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraTransform } from "../../engines/CameraController.ts";
import { LightingDefs, Sky, Starfield, Finish, envAt, type EnvKey } from "../../engines/LightingSystem.tsx";
import { LivingLine } from "../../engines/LineDrawingSystem.tsx";
import { rise } from "../../engines/SceneTransitionEngine.ts";
import { KineticText, useFonts } from "../../engines/TypographySystem.tsx";
import { NarrationTrack, SoundDesignTrack, voiceTimeline } from "../../engines/AudioSyncSystem.tsx";
import type { Stroke } from "../../engines/LivingLineEngine.ts";
import { Planet, continentsAlpha } from "../../components/Planet.tsx";
import {
  DayNightLabels,
  HillDecor,
  LandDecor,
  OrnamentDecor,
  SkyDecor,
  SunDecor,
  SunriseDecor,
  WorldDefs,
} from "../../scenes/decor.tsx";
import { FONTS, PALETTE } from "../../styles/palette.ts";
import { JOURNEY, camera } from "./episode.ts";
import { FPS } from "./world.ts";
import timing from "./timing.json";
import manifest from "../../../public/audio/ep001/voice/manifest.json";

export const VOICE = voiceTimeline(manifest, timing.voiceStartSec, FPS);

const ENV: EnvKey[] = [
  { f: 0, top: "#09111F", bottom: "#0B1526", stars: 0, warm: 0 },
  { f: 100, top: "#09111F", bottom: "#101F35", stars: 0, warm: 0 },
  { f: 128, top: "#13233D", bottom: "#33405C", stars: 0, warm: 0.9 },
  { f: 142, top: "#13233D", bottom: "#2E3B57", stars: 0, warm: 0.7 },
  { f: 176, top: "#09111F", bottom: "#101F35", stars: 0.9, warm: 0 },
  { f: 404, top: "#09111F", bottom: "#101F35", stars: 0.9, warm: 0 },
  { f: 470, top: "#0F2340", bottom: "#29486F", stars: 0.25, warm: 0.55 },
  { f: 960, top: "#0F2340", bottom: "#2B4A70", stars: 0.3, warm: 0.6 },
  { f: 1080, top: "#09111F", bottom: "#101F35", stars: 1, warm: 0 },
  { f: 1340, top: "#09111F", bottom: "#101F35", stars: 0.7, warm: 0 },
  { f: 1640, top: "#0A1324", bottom: "#132542", stars: 1, warm: 0.1 },
  { f: 1800, top: "#09111F", bottom: "#0D182B", stars: 0.6, warm: 0 },
];

/** Scene-level fades of finished contours (keeps every shot uncluttered). */
const KEEP_AT_END = new Set(["s7-logo", "s7-to-logo"]);
export const strokeFade = (s: Stroke, f: number): number => {
  let k = 1;
  const id = s.id;
  if (id.startsWith("s2-cont-")) k *= continentsAlpha(f);
  else if (id === "s2-axis" || id === "s2-equator" || id.startsWith("s2-ray-")) k *= 1 - rise(f, 398, 426);
  if (id.startsWith("s6-")) k *= 1 - 0.88 * rise(f, 1612, 1650);
  if (id.startsWith("s5-orbit-") || id === "s5-constellation") k *= 1 - 0.5 * rise(f, 1330, 1400);
  if (!KEEP_AT_END.has(id)) k *= 1 - 0.92 * rise(f, 1764, 1790);
  if (id === "s6-squares" || id === "s6-ring") k *= 1 - 0.55 * rise(f, 1404, 1440);
  if (id.startsWith("s6-")) k *= 1 - rise(f, 1640, 1660);
  return k;
};

export const Episode001: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const cam = camera(f);
  const env = envAt(ENV, f);
  const tf = cameraTransform(cam);
  const p = { f, cam, journey: JOURNEY };
  const finalDim = 1 - 0.92 * rise(f, 1764, 1790);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.bg }}>
      <Sky env={env} />
      <Starfield f={f} cam={cam} alpha={env.stars * finalDim} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <LightingDefs />
        <WorldDefs />
        <g transform={tf} opacity={finalDim}>
          <SunriseDecor {...p} />
          <SunDecor {...p} />
          <Planet f={f} zoom={cam.zoom} />
          <LandDecor {...p} />
          <DayNightLabels {...p} />
          <SkyDecor {...p} />
          <OrnamentDecor {...p} />
          <HillDecor {...p} />
        </g>
        <LivingLine journey={JOURNEY} f={f} cam={cam} style={{ fade: strokeFade }} tipOpacity={rise(f, 9, 14)} />
      </svg>

      {/* ── Typography ── */}
      <KineticText lines={["РАЗМЫШЛЯЙ"]} f={f} from={1186} to={1318} y={1398} size={112} letterSpacing={7} color={PALETTE.white} stagger={1.6} />
      <KineticText
        lines={["Сура «Аль-Имран», 3:190"]}
        f={f}
        from={1214}
        to={1318}
        y={1548}
        size={44}
        weight={800}
        stagger={0.5}
        color={PALETTE.moon}
      />
      <KineticText
        lines={["ГОСПОДЬ НАШ!", "ТЫ НЕ СОТВОРИЛ", "ЭТО ПОНАПРАСНУ"]}
        f={f}
        from={1409}
        to={1604}
        y={1150}
        size={70}
        lineHeight={1.25}
        font={FONTS.verse}
        weight={700}
        accent={["ГОСПОДЬ", "НАШ"]}
        stagger={1.1}
        lineDelay={[0, 26, 26]}
      />
      <KineticText
        lines={["Сура «Аль-Имран», 3:191", "Часть аята. Перевод смысла."]}
        f={f}
        from={1478}
        to={1604}
        y={1352}
        size={34}
        weight={800}
        lineHeight={1.35}
        stagger={0.35}
        color={PALETTE.moon}
        opacity={0.92}
      />
      <KineticText
        lines={["А ЧТО УДИВЛЯЕТ", "ТЕБЯ?"]}
        f={f}
        from={1640}
        to={1736}
        y={430}
        size={88}
        accent={["ТЕБЯ"]}
        stagger={1.3}
      />
      <KineticText lines={["MUSLIM KIDS"]} f={f} from={1772} y={1092} size={96} letterSpacing={12} stagger={0.9} />
      <KineticText lines={["ЖИВАЯ ЛИНИЯ"]} f={f} from={1784} y={1172} size={30} weight={800} letterSpacing={12} color={PALETTE.gold} stagger={0.5} shadow={false} />

      <Finish grain={0.045} />
      <NarrationTrack clips={VOICE} />
      <SoundDesignTrack file="audio/ep001/sfx/sound-design.wav" />
    </AbsoluteFill>
  );
};
