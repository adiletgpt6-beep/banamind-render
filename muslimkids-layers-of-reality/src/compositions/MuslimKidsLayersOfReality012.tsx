// MUSLIM KIDS — Experiment 012 «Слои реальности». 1080×1920, 30 fps, 60 s.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { WorldCanvas } from "../engines/LayersOfRealityEngine";
import { activeTracks } from "./shots";
import { Scene01Earth } from "../scenes/Scene01Earth";
import { Scene02EarthLayers } from "../scenes/Scene02EarthLayers";
import { Scene03Mountains } from "../scenes/Scene03Mountains";
import { Scene04Leaf } from "../scenes/Scene04Leaf";
import { Scene05GrandReveal } from "../scenes/Scene05GrandReveal";
import { QUOTE_WINDOW, Scene06Quran } from "../scenes/Scene06Quran";
import { Scene07Ending } from "../scenes/Scene07Ending";
import { loadFileTextures } from "../materials/textures";
import { loadFonts } from "../components/Typography";
import { smoothstep, window4 } from "../utils/math";

export const MuslimKidsLayersOfReality012: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    Promise.all([loadFileTextures(), loadFonts()]).then(() => setReady(true));
  }, []);
  // calm the world behind the Qur'an quote
  const dim = 1 - 0.45 * window4(t, ...QUOTE_WINDOW);
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 42%, #123A66 0%, #0B2342 45%, #081627 100%)",
      }}
    >
      {ready &&
        activeTracks(t).map((tr) => (
          <AbsoluteFill key={tr.id} style={{ opacity: tr.opacity, filter: dim < 0.999 ? `brightness(${dim})` : undefined }}>
            <WorldCanvas track={tr.id} />
          </AbsoluteFill>
        ))}
      {ready && (
        <AbsoluteFill>
          <Scene01Earth t={t} />
          <Scene02EarthLayers t={t} />
          <Scene03Mountains t={t} />
          <Scene04Leaf t={t} />
          <Scene05GrandReveal t={t} />
          <Scene06Quran t={t} />
          <Scene07Ending t={t} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#050D18", opacity: 1 - smoothstep(0, 0.7, t), pointerEvents: "none" }} />
      {audio && <Audio src={staticFile("audio/voice.wav")} />}
      {audio && <Audio src={staticFile("audio/sfx.wav")} />}
    </AbsoluteFill>
  );
};
