// ReflectionSceneComposer: каждый мир — отдельный ThreeCanvas в своём окне
// времени. Во время оптического перехода новый мир раскрывается CSS-маской,
// совпадающей с отражающей поверхностью (озеро растёт из зеркала, звёздное
// небо продолжается в небо другого мира) — без простого «наплыва» картинок.
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FPS } from "../engines/MirrorDimensionsEngine";
import { CameraPose, applyPose } from "../engines/MirrorCameraController";

export type Mask = { kind: "none" } | { kind: "radial"; cx: number; cy: number; r: number; soft: number } | { kind: "vertical"; edge: number; soft: number; fromTop: boolean } | { kind: "opacity"; value: number };

const maskCss = (m: Mask): React.CSSProperties => {
  if (m.kind === "radial") {
    const g = `radial-gradient(circle at ${m.cx * 100}% ${m.cy * 100}%, black ${Math.max(0, m.r - m.soft) * 100}vmax, transparent ${m.r * 100}vmax)`;
    return { WebkitMaskImage: g, maskImage: g };
  }
  if (m.kind === "vertical") {
    const a = Math.max(0, m.edge - m.soft) * 100, b = m.edge * 100;
    const g = m.fromTop ? `linear-gradient(to bottom, black ${a}%, transparent ${b}%)` : `linear-gradient(to top, black ${a}%, transparent ${b}%)`;
    return { WebkitMaskImage: g, maskImage: g };
  }
  if (m.kind === "opacity") return { opacity: m.value };
  return {};
};

export const WorldCanvas: React.FC<{
  from: number;
  to: number;
  mask?: (t: number) => Mask;
  render: (t: number) => React.ReactNode;
}> = ({ from, to, mask, render }) => {
  const startFrame = Math.round(from * FPS);
  return (
    <Sequence from={startFrame} durationInFrames={Math.round(to * FPS) - startFrame} layout="none">
      <WorldInner startFrame={startFrame} mask={mask} render={render} />
    </Sequence>
  );
};

const WorldInner: React.FC<{ startFrame: number; mask?: (t: number) => Mask; render: (t: number) => React.ReactNode }> = ({ startFrame, mask, render }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = (frame + startFrame) / FPS;
  const m = mask ? mask(t) : { kind: "none" as const };
  return (
    <AbsoluteFill style={maskCss(m)}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 40, near: 0.05, far: 500 }}>
        {render(t)}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

const _cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.01, 1000);
/** Экранная позиция (0..1) точки мира для позы камеры — центр маски перехода. */
export const projectToScreen = (pose: CameraPose, p: [number, number, number], aspect = 1080 / 1920) => {
  _cam.aspect = aspect;
  applyPose(_cam, pose);
  const v = new THREE.Vector3(...p).project(_cam);
  return { x: v.x * 0.5 + 0.5, y: 0.5 - v.y * 0.5 };
};
