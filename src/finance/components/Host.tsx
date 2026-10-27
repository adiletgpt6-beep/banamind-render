// Ведущий в кадре: место и масштаб меняются плавно по раскладке сцены,
// поза — по подсказкам сценария, рот — по фактической речи.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Horse } from "../horse/Horse";
import { mouthAt } from "../horse/lipsync";
import { makeState, poseAt, type PoseCue } from "../horse/rig";
import type { Layout } from "../episode/types";
import type { TimedLine } from "../timeline";

// центр по X, ширина персонажа, сдвиг низа (px ниже края кадра)
const PLACES: Record<Layout, { x: number; w: number; sink: number; turn: number }> = {
  center: { x: 960, w: 660, sink: 70, turn: 0 },
  left: { x: 400, w: 600, sink: 70, turn: 0.35 },
  right: { x: 1520, w: 600, sink: 70, turn: -0.35 },
  corner: { x: 215, w: 360, sink: 30, turn: 0.45 },
  close: { x: 960, w: 1000, sink: 330, turn: 0 },
  off: { x: -420, w: 360, sink: 30, turn: 0.4 },
};

export type LayoutCue = { frame: number; layout: Layout };

export const Host: React.FC<{ layouts: LayoutCue[]; poses: PoseCue[]; lines: TimedLine[] }> = ({ layouts, poses, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let p = { ...PLACES[layouts[0]?.layout ?? "center"] };
  for (const c of layouts) {
    if (c.frame > frame) break;
    const k = Math.min(1, spring({ frame: frame - c.frame, fps, config: { damping: 20, stiffness: 90, mass: 0.9 } }));
    const q = PLACES[c.layout];
    p = { x: p.x + (q.x - p.x) * k, w: p.w + (q.w - p.w) * k, sink: p.sink + (q.sink - p.sink) * k, turn: p.turn + (q.turn - p.turn) * k };
  }
  const m = mouthAt(lines, frame, fps);
  const s = makeState({ frame, fps, pose: poseAt(poses, frame, fps), mouthOpen: m.open, mouthRound: m.round, speaking: m.speaking, headTurn: p.turn });
  const h = (p.w * 1000) / 700;
  return (
    <div style={{ position: "absolute", left: p.x - p.w / 2, top: 1080 + p.sink - h, width: p.w, height: h }}>
      {/* мягкая тень под персонажем */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: -p.w * 0.04,
          height: p.w * 0.12,
          borderRadius: "50%",
          background: "rgba(20,37,74,0.10)",
          filter: "blur(18px)",
        }}
      />
      <Horse s={s} width={p.w} />
    </div>
  );
};
