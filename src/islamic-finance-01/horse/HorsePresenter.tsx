// The presenter in a scene: placement (x, y, scale), entrance/exit, the
// keyframed acting track for the shot, lip-sync from the narration and the
// procedural layers. Absolute frames so tracks can be written in seconds.
import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type { If01Manifest } from "../narration";
import { easeInOut, prog, springFirm } from "../motion";
import { applyActing, emphasisFrames } from "./acting";
import { type LipsyncData, mouthAt, speakingAt } from "./lipsync";
import { type Beat, evalTrack, REST } from "./pose";
import { HorseRig } from "./rig";

export type Placement = {
  /** x of the rig's horizontal centre, y of the rig's top (rig is 600×900 before scale) */
  readonly x: number;
  readonly y: number;
  readonly scale: number;
};

export type HorseShot = {
  readonly from: number; // absolute frame the shot starts
  readonly to: number; // absolute frame the shot ends
  readonly place: Placement;
  /** second placement to drift to over the shot (gentle camera feel) */
  readonly placeEnd?: Placement;
  /** explicit re-framings inside the shot (absolute frames) */
  readonly moves?: readonly { at: number; dur: number; to: Placement }[];
  readonly enter?: "left" | "right" | "bottom" | "fade" | "none";
  readonly exit?: "left" | "right" | "bottom" | "fade" | "none";
  readonly enterFrames?: number;
  readonly exitFrames?: number;
  /** beats with `at` in absolute frames */
  readonly beats: readonly Beat[];
  readonly shadow?: boolean;
};

export const HorsePresenter: React.FC<{
  readonly frame: number;
  readonly shot: HorseShot;
  readonly lipsync: LipsyncData;
  readonly manifest: If01Manifest;
}> = ({ frame, shot, lipsync, manifest }) => {
  const emphasis = useMemo(() => emphasisFrames(manifest), [manifest]);
  if (frame < shot.from || frame > shot.to) return null;
  const base = evalTrack(shot.beats, frame, REST);
  const pose = applyActing(base, frame, { lipsync, emphasis, speaking: speakingAt(lipsync, frame) });
  const mouth = mouthAt(lipsync, frame);
  const ef = shot.enterFrames ?? 16;
  const xf = shot.exitFrames ?? 12;
  const inP = shot.enter === "none" ? 1 : springFirm(frame, shot.from, ef);
  const outP = shot.exit === "none" ? 0 : prog(frame, shot.to - xf, shot.to, easeInOut);
  const drift = shot.placeEnd ? prog(frame, shot.from, shot.to, easeInOut) : 0;
  let px = shot.place.x + (shot.placeEnd ? (shot.placeEnd.x - shot.place.x) * drift : 0);
  let py = shot.place.y + (shot.placeEnd ? (shot.placeEnd.y - shot.place.y) * drift : 0);
  let ps = shot.place.scale + (shot.placeEnd ? (shot.placeEnd.scale - shot.place.scale) * drift : 0);
  for (const m of shot.moves ?? []) {
    const k = prog(frame, m.at, m.at + m.dur, easeInOut);
    px += (m.to.x - px) * k;
    py += (m.to.y - py) * k;
    ps += (m.to.scale - ps) * k;
  }
  const off = (dir: HorseShot["enter"] | HorseShot["exit"], p: number) => {
    const d = 1 - p;
    switch (dir) {
      case "left":
        return { x: -520 * ps * d, y: 0, o: 1 - d * 0.4 };
      case "right":
        return { x: 520 * ps * d, y: 0, o: 1 - d * 0.4 };
      case "bottom":
        return { x: 0, y: 420 * ps * d, o: 1 - d * 0.4 };
      case "fade":
        return { x: 0, y: 30 * d, o: 1 - d };
      default:
        return { x: 0, y: 0, o: 1 };
    }
  };
  const e = off(shot.enter ?? "bottom", inP);
  const x = off(shot.exit ?? "fade", 1 - outP);
  const opacity = Math.min(e.o, x.o);
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: px - 300 * ps + e.x + x.x, top: py + e.y + x.y, width: 600 * ps, height: 900 * ps, opacity }}>
        <HorseRig pose={pose} mouth={mouth} width={600 * ps} shadow={shot.shadow ?? true} />
      </div>
    </AbsoluteFill>
  );
};
