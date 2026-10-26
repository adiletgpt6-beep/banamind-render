// Сцены 6–7: соты → большой орнамент → Земля, небо, звёзды, Солнце →
// центр освобождается для цитаты → фигуры складываются в знак Muslim Kids.
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FinalPattern, type Tier } from "../components/FinalPattern";
import { GeometryEarth } from "../components/GeometryEarth";
import { Honeycomb } from "../components/Honeycomb";
import { LogoMark } from "../components/LogoMark";
import { cameraPlan, GeometryCamera } from "../engines/GeometryCameraController";
import { clamp, polygonShape, ramp, seeded } from "../engines/GeometryWondersEngine";
import { GeometryLights, LIGHTS } from "../engines/GeometryLightingSystem";
import { starPolygon } from "../engines/PatternGenerator";
import { PALETTE } from "../styles/palette";
import { T } from "../timeline";
import { COMB_TIMES, PATTERN_Z } from "./Scene05Honeycomb";

/** Интеграл скорости вращения: 1 до остановки, затем плавно к 0. */
function rotationTime(t: number) {
  const a = T.open[0];
  const b = T.open[1];
  const t0 = T.ornamentIn[0];
  if (t <= a) return t - t0;
  let acc = a - t0;
  const end = Math.min(t, b);
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const u = a + ((end - a) * (i + 0.5)) / steps;
    acc += ((end - a) / steps) * (1 - ramp(u, a, b, "inOut"));
  }
  return acc;
}

const SUN_POS: [number, number, number] = [-0.86, 0.72, 0.25];

const SymbolSun: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const rays = useMemo(() => new THREE.ShapeGeometry(polygonShape(starPolygon(12, 0.3, 0.19))), []);
  if (k <= 0.001) return null;
  return (
    <group position={SUN_POS} scale={k}>
      <mesh rotation={[0, 0, t * 0.15]} geometry={rays}>
        <meshBasicMaterial color={PALETTE.gold} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[0.17, 40]} />
        <meshBasicMaterial color="#ffe6a8" />
      </mesh>
    </group>
  );
};

const Sparkles: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const geo = useMemo(() => new THREE.ShapeGeometry(polygonShape(starPolygon(4, 0.07, 0.022))), []);
  const pts = useMemo(() => {
    const rnd = seeded(77);
    return Array.from({ length: 9 }, (_, i) => {
      const a = -0.6 + (i / 9) * Math.PI * 1.75 + rnd() * 0.2;
      const r = 0.82 + rnd() * 0.3;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 0.7 + rnd() * 0.7, ph: rnd() * 6 };
    });
  }, []);
  if (k <= 0.001) return null;
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} geometry={geo} position={[p.x, p.y, 0.2]} scale={p.s * clamp(k * 9 - i) * (0.85 + 0.15 * Math.sin(t * 2 + p.ph))}>
          <meshBasicMaterial color={i % 3 ? PALETTE.milk : PALETTE.sky} />
        </mesh>
      ))}
    </group>
  );
};

export const CreationWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const plan = useMemo(
    () =>
      cameraPlan([
        { t: T.ornamentIn[0], pos: [0, 0, PATTERN_Z], target: [0, 0, 0], fov: 40 },
        { t: T.reflectText[0], pos: [0, -0.3, 19.2], target: [0, -0.3, 0] },
        { t: T.open[1], pos: [0, 0, 19.6], target: [0, 0, 0] },
        { t: 60, pos: [0, 0, 20.2], target: [0, 0, 0] },
      ]),
    [],
  );
  const bloom = ramp(t, T.ornamentBloom[0], T.ornamentBloom[1], "linear");
  const part = ramp(t, T.sky - 0.2, T.earth + 0.6, "inOut");
  const open = ramp(t, T.open[0], T.open[1], "inOut");
  const logoDim = ramp(t, T.logo[0] - 0.3, T.logo[1], "inOut");
  const centerOut = 1 - open;
  const earthK = ramp(t, T.earth - 0.1, T.earth + 0.8, "back") * centerOut;
  const combFade = ramp(t, T.ornamentIn[0], T.ornamentBloom[0] + 1.2);
  const fade = (tier: Tier) => (tier.inner ? 1 - open : 1) * (tier.id === "triE" ? 1 - ramp(t, T.logo[0], T.logo[0] + 0.5) : 1);
  return (
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true, alpha: true }} style={{ position: "absolute" }}>
      <GeometryCamera plan={plan} t={t} drift={0.03} />
      <GeometryLights preset={LIGHTS.ornament} />
      <group position={[0, 0, -0.5]}>
        <Honeycomb t={T.combToPattern[1]} times={COMB_TIMES} fade={0.9 * combFade + 0.06 * logoDim} />
      </group>
      <FinalPattern state={{ bloom, rotT: rotationTime(t), part, open, dim: logoDim, fade }} />
      {earthK > 0.001 ? (
        <GeometryEarth
          scale={0.45 * earthK}
          look={{ smooth: 1, facets: 0, edges: 0.18, clouds: 1, atmosphere: 0.8, spin: -40 + (t - T.earth) * 9, tilt: 18 }}
        />
      ) : null}
      <SymbolSun k={ramp(t, T.dayNight - 0.2, T.dayNight + 0.6, "back") * centerOut} t={t} />
      <Sparkles k={ramp(t, T.sky - 0.1, T.sky + 1.2) * centerOut} t={t} />
      <LogoMark t={t} at={T.logo} fromRadius={3.0 * 1.42} />
    </ThreeCanvas>
  );
};
