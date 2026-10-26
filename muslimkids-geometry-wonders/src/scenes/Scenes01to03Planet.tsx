// Сцены 1–3: один треугольник → розетка → Земля → день и ночь → «ныряем»
// к поверхности. Одна 3D-сцена: фигуры не исчезают, а перестраиваются.
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { GeometryEarth } from "../components/GeometryEarth";
import { EARTH, RosetteSphere, getRosette } from "../components/RosetteSphere";
import { cameraPlan, GeometryCamera } from "../engines/GeometryCameraController";
import { lerp, ramp, seeded, type Vec3 } from "../engines/GeometryWondersEngine";
import { blendPresets, GeometryLights, LIGHTS } from "../engines/GeometryLightingSystem";
import { llToVec } from "../systems/earthTexture";
import { T } from "../timeline";

const D = Math.PI / 180;
export const SPIN_DEG = 38;
export const spinAt = (t: number) => SPIN_DEG * ramp(t, T.spin[0], T.spin[1], "soft");

/** Точка Земли (широта/долгота) в мировых координатах в момент t. */
export function earthPointWorld(lat: number, lon: number, t: number, r = EARTH.radius): Vec3 {
  const v = new THREE.Vector3(...llToVec(lat, lon, r));
  v.applyEuler(new THREE.Euler(0, (-EARTH.lon0 + spinAt(t)) * D, 0));
  v.applyEuler(new THREE.Euler(EARTH.lat0 * D, 0, 0));
  return [v.x, v.y, v.z];
}

// Куда «ныряем»: горы Тянь-Шаня / Памира.
export const DIVE = { lat: 41.5, lon: 73 };

const first = () => getRosette().tris[0].centroid;

function planetCamera() {
  const [cx, cy] = first();
  const p = earthPointWorld(DIVE.lat, DIVE.lon, T.dive[1]);
  const n = new THREE.Vector3(...p).normalize();
  const near = n.clone().multiplyScalar(EARTH.radius + 0.42);
  const mid = n.clone().multiplyScalar(EARTH.radius + 2.6);
  return cameraPlan([
    { t: 0, pos: [cx, cy, 2.7], target: [cx, cy, 0], fov: 30 },
    { t: T.fan - 0.1, pos: [cx * 0.7, cy * 0.7, 2.05], target: [cx * 0.7, cy * 0.7, 0] },
    { t: T.unfold + 0.1, pos: [0, 0, 2.7], target: [0, 0, 0] },
    { t: T.breathe + 0.4, pos: [0, 0, 11.2], target: [0, 0, 0] },
    { t: T.fold[0] + 0.5, pos: [0, -0.4, 11.4], target: [0, 0, 0] },
    { t: T.grow[1], pos: [0, 0, 10.6], target: [0, 0, 0] },
    { t: 13.2, pos: [2.5, 1.0, 9.9], target: [0, 0, 0] },
    { t: 15.4, pos: [0.5, 0.45, 10.4], target: [0, 0, 0] },
    { t: T.dive[0], pos: [0.2, 0.35, 10.3], target: [0, 0, 0] },
    { t: T.dive[0] + 1.3, pos: [mid.x, mid.y, mid.z], target: [p[0] * 0.6, p[1] * 0.6, p[2] * 0.6], fov: 30, ease: "inOut" },
    { t: T.dive[1], pos: [near.x, near.y, near.z], target: p, fov: 34, ease: "inOut" },
  ]);
}

const Stars: React.FC<{ opacity: number }> = ({ opacity }) => {
  const geo = useMemo(() => {
    const rnd = seeded(404);
    const pos: number[] = [];
    const col: number[] = [];
    const pal = ["#F5F2E9", "#A4D8F0", "#E8BB65", "#59CED2"].map((h) => new THREE.Color(h));
    for (let i = 0; i < 170; i++) {
      const u = rnd() * 2 - 1;
      const a = rnd() * Math.PI * 2;
      const r = 60;
      const s = Math.sqrt(1 - u * u);
      const v = [Math.cos(a) * s * r, u * r, -Math.abs(Math.sin(a) * s * r) - 8];
      pos.push(...v);
      const c = pal[Math.floor(rnd() * pal.length)];
      col.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} visible={opacity > 0.01}>
      <pointsMaterial size={5} sizeAttenuation={false} vertexColors transparent opacity={opacity * 0.85} depthWrite={false} />
    </points>
  );
};

/** Дуга вращения из отдельных сегментов-стрелок (по экватору, к востоку). */
const SpinArrows: React.FC<{ t: number }> = ({ t }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.075, 0);
    s.lineTo(-0.05, 0.06);
    s.lineTo(-0.02, 0);
    s.lineTo(-0.05, -0.06);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  const appear = ramp(t, T.arrows[0], T.arrows[0] + 1.2, "inOut");
  const fade = 1 - ramp(t, T.arrows[1] - 0.8, T.arrows[1], "soft");
  const count = 11;
  const R = EARTH.radius * 1.2;
  const flow = (t - T.arrows[0]) * 0.18;
  return (
    <group rotation={[EARTH.lat0 * D * 0.55, 0, 0]}>
      {Array.from({ length: count }, (_, i) => {
        const u = ((i / count + flow) % 1 + 1) % 1; // 0…1 вдоль дуги
        const ang = lerp(-75, 75, u) * D;
        const vis = Math.min(1, u * 5, (1 - u) * 5) * Math.min(1, appear * count - i) * fade;
        if (vis <= 0.01) return null;
        return (
          <mesh
            key={i}
            geometry={shape}
            position={[Math.sin(ang) * R, -0.05, Math.cos(ang) * R]}
            rotation={[0, ang, 0]}
            scale={1.3}
          >
            <meshBasicMaterial color="#E8BB65" transparent opacity={vis} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

export const PlanetWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const plan = useMemo(planetCamera, []);
  const smoothK = ramp(t, T.smooth[0], T.smooth[1], "inOut");
  const diveK = ramp(t, T.dive[0] + 0.7, T.dive[1] - 0.25, "inOut");
  // На подлёте к поверхности свет становится «дневным» — как в следующей сцене.
  const light = blendPresets(
    blendPresets(
      blendPresets(LIGHTS.pattern, LIGHTS.sphere, ramp(t, T.fold[0], T.fold[1])),
      LIGHTS.sun,
      ramp(t, T.sunLight[0], T.sunLight[1]),
    ),
    LIGHTS.landscape,
    diveK,
  );
  const useEarthFacets = t >= T.smooth[0];
  return (
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true, alpha: true }} style={{ position: "absolute" }}>
      <GeometryCamera plan={plan} t={t} drift={0.04} />
      <GeometryLights preset={light} />
      <Stars opacity={ramp(t, T.space[0], T.space[1])} />
      {!useEarthFacets ? <RosetteSphere t={t} opacity={1} /> : null}
      {t >= T.smooth[0] - 0.05 ? (
        <GeometryEarth
          look={{
            facets: useEarthFacets ? Math.max(1 - smoothK, diveK) : 0,
            smooth: smoothK * (1 - diveK),
            edges: lerp(0.32 * smoothK, 0.12, ramp(t, 13, 15)) + diveK * 0.5,
            clouds: ramp(t, T.smooth[0] + 0.6, T.smooth[1] + 0.6) * (1 - diveK),
            atmosphere: ramp(t, T.smooth[0], T.smooth[1] + 0.5) * (1 - diveK),
            spin: spinAt(t),
          }}
        />
      ) : null}
      <SpinArrows t={t} />
    </ThreeCanvas>
  );
};
