// Служебная композиция: мир дерева и птица по плану фильма (проверка поз).
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { birdPoseAt } from "./bird/birdPose";
import { buildTimeline, estimateManifest } from "./core/timing";
import { nestCountAt, materialAt } from "./film-1-6/birdPlan";
import { TreeWorld } from "./sets/Tree";
import { TREE } from "./sets/treeLayout";

const TL = buildTimeline(estimateManifest());

export const DevTree: React.FC<{ readonly zoom?: number; readonly cx?: number; readonly cy?: number }> = ({ zoom = 0.8, cx = TREE.fork.x, cy = TREE.fork.y }) => {
  const f = useCurrentFrame();
  const pose = birdPoseAt(TL, f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#DCE9EF" }}>
      <svg width={1920} height={1080} viewBox={`${cx - 960 / zoom} ${cy - 540 / zoom} ${1920 / zoom} ${1080 / zoom}`}>
        <TreeWorld pose={pose} placed={nestCountAt(TL, f)} f={f} grassOnGround={materialAt(TL, f) === "ground"} />
      </svg>
      <div style={{ position: "absolute", left: 20, top: 20, fontFamily: "sans-serif", fontSize: 28, color: "#222" }}>
        f={f} t={(f / 30).toFixed(1)} {pose.state} u={pose.u.toFixed(2)} mat={materialAt(TL, f)} nest={nestCountAt(TL, f)}
      </div>
    </AbsoluteFill>
  );
};
