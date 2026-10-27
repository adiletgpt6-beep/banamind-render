// Фильм BM-017: сцены по тайм-лайну озвучки, банан-ведущий (общий Host),
// анимированные титры BanaMind. Без таймеров и отсчётов в кадре.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import "../../../banamind/fonts";
import { BanaMindAnimatedCaptions } from "../../../banamind/captions";
import { Host } from "../../../lesson-traktat/components/Host";
import type { HostSpot, Scene } from "../../../lesson-traktat/types";
import { CHRISTIE_CAPTIONS, type Cue } from "./captions";
import { FPS, type Timeline } from "./timeline";
import { VISUALS } from "./visuals";

const SUB_SHIFT: Record<HostSpot, number> = { center: 0, close: 0, left: 170, right: -170, corner: 110, off: 0, peek: -260 };
const FADE = 0.5;

const SceneView: React.FC<{ sc: Scene; from: number; to: number; tl: Timeline }> = ({ sc, from, to, tl }) => {
  const t = useCurrentFrame() / FPS;
  const dur = to - from;
  const V = VISUALS[sc.visual.kind];
  if (!V) throw new Error(`Нет визуала ${sc.visual.kind}`);
  const ts = tl.scenes.find((s) => s.id === sc.id)!;
  const k = Math.min(interpolate(t, [0, FADE], [0, 1], { extrapolateRight: "clamp" }), interpolate(t, [dur, dur + FADE], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <V t={t} dur={dur} beats={ts.lines.map((l) => l.speechFrom - from)} ends={ts.lines.map((l) => l.speechTo - from)} p={sc.visual} />
      </svg>
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ tl: Timeline; scenes: Scene[]; cues: Cue[] }> = ({ tl, scenes, cues }) => {
  const t = useCurrentFrame() / FPS;
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  return (
    <AbsoluteFill style={{ background: "#0e1a2b" }}>
      {tl.scenes.map((ts, i) => (
        <Sequence key={ts.id} from={Math.round(ts.from * FPS)} durationInFrames={Math.max(1, Math.round((ts.to - ts.from + FADE) * FPS))} layout="none">
          <SceneView sc={scenes[i]} from={ts.from} to={ts.to} tl={tl} />
        </Sequence>
      ))}
      <Host tl={tl} scenes={scenes} />
      <BanaMindAnimatedCaptions cues={cues} shift={SUB_SHIFT[scenes[si].host]} accent={CHRISTIE_CAPTIONS.accent} />
    </AbsoluteFill>
  );
};
