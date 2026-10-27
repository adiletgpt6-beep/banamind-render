// MirrorComposition: кульминация — панели (MirrorKaleidoscopeEngine), их гостевые
// миры, V-пара с настоящей Землёй и ограниченными взаимными отражениями
// (InfiniteReflectionEngine), мягкие световые лучи между поверхностями.
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DEFAULT_MORPH } from "../engines/ReflectionMorphEngine";
import { LAYER } from "../engines/MirrorReflectionEngine";
import { InfiniteReflectionChain } from "../engines/InfiniteReflectionEngine";
import { PanelId, Timing, innerEarthScale, panelState, tunnelBlend } from "../engines/MirrorKaleidoscopeEngine";
import { PALETTE } from "../engines/MirrorLightingSystem";
import { Mirror } from "./Mirror";
import { MirrorEarth } from "./MirrorEarth";
import { SkyDome } from "./SkyDome";
import { GrowingTree } from "./GrowingTree";
import { WorldLayer } from "./WorldKit";
import { LightBeam } from "./LightBeam";
import { DAY_LIGHT } from "./MirrorMountains";
import { ValleyWorld } from "../worlds/ValleyWorld";
import { seg } from "../utils/math";

export const PANEL_SIZE: [number, number] = [1.5, 2.1];
const REF_CAMERA = new THREE.Vector3(0, 1.75, 9.6);

/**
 * Геометрия отражения панели из опорной точки камеры: V — «отражённая камера»
 * (зеркальное изображение камеры за панелью), r — направление взгляда сквозь
 * панель. Гостевой мир ставится вдоль r — так он гарантированно виден в панели.
 */
const reflectionAxis = (pos: [number, number, number], rot: [number, number, number]) => {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const p = new THREE.Vector3(...pos);
  const V = REF_CAMERA.clone().sub(n.clone().multiplyScalar(2 * REF_CAMERA.clone().sub(p).dot(n)));
  const r = p.clone().sub(V).normalize();
  return { p, V, r, at: (dist: number) => p.clone().addScaledVector(r, dist) };
};

const SUN: [number, number, number] = [-0.55, 0.25, 0.8];

export const MirrorComposition: React.FC<{ t: number; timing: Timing; env: THREE.Texture | null }> = ({ t, timing, env }) => {
  const st = (id: PanelId) => panelState(id, t, timing);
  // опорные позы фазы A — для размещения гостевых миров
  const refPose = useMemo(() => {
    const at = timing.appear + 2.4;
    return {
      mountains: panelState("mountains", at, timing),
      earth: panelState("earth", at, timing),
      tree: panelState("tree", at, timing),
    };
  }, [timing]);
  const guests = useMemo(() => {
    // 1) горы: миниатюра долины стоит за панелью вдоль оси отражения — дальний
    //    хребет оказывается прямо «в окне» панели, ближние горы отсекаются её плоскостью
    const m = reflectionAxis(refPose.mountains.position, refPose.mountains.rotation);
    const yaw = Math.atan2(-m.r.x, -m.r.z);
    const s = 1 / 85;
    const lake = m.at(1.2);
    lake.y = m.at(5.0).y - 0.6;
    const euler = new THREE.Euler(0, yaw, 0, "YXZ");
    // 2) Земля и 3) дерево — на оси отражения, освещены со стороны зрителя
    const e = reflectionAxis(refPose.earth.position, refPose.earth.rotation);
    const tr = reflectionAxis(refPose.tree.position, refPose.tree.rotation);
    const side = new THREE.Vector3(-0.75, 0.3, 0);
    const sun = e.r.clone().negate().multiplyScalar(0.7).add(side).normalize();
    return {
      valley: { origin: lake, euler, scale: s },
      earth: e.at(5.0),
      earthSun: sun.toArray() as [number, number, number],
      tree: {
        point: tr.at(3.6),
        yaw: Math.atan2(-tr.r.x, -tr.r.z),
        // Луна за деревом: направление в локальных координатах повёрнутой группы
        moon: tr.r.clone().add(new THREE.Vector3(0.1, 0.12, 0)).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.atan2(-tr.r.x, -tr.r.z)).toArray() as [number, number, number],
      },
    };
  }, [refPose]);

  const earthRef = useRef<THREE.Mesh>(null);
  const partnerRef = useRef<THREE.Mesh>(null);
  const { gl, scene, camera, size } = useThree();
  const chains = useMemo(() => {
    const h = 900, w = Math.round(h * (size.width / size.height));
    return { a: new InfiniteReflectionChain(5, w, h), b: new InfiniteReflectionChain(5, w, h) };
  }, [size.width, size.height]);
  useEffect(() => () => { chains.a.dispose(); chains.b.dispose(); }, [chains]);

  const blend = tunnelBlend(t, timing);
  const partner = st("partner");
  // взаимные отражения V-пары: после собственных отражений панелей (priority −1)
  useFrame(() => {
    const a = earthRef.current, b = partnerRef.current;
    if (!a || !b || !partner.visible || blend <= 0) return;
    const ha = { mesh: a, material: a.material as THREE.ShaderMaterial };
    const hb = { mesh: b, material: b.material as THREE.ShaderMaterial };
    const ra = chains.a.render(gl, scene, camera, ha, hb, [LAYER.main], 0.88);
    const rb = chains.b.render(gl, scene, camera, hb, ha, [LAYER.main], 0.88);
    if (ra) {
      ha.material.uniforms.tReflB.value = ra.texture;
      ha.material.uniforms.uTexMatB.value.copy(ra.matrix);
    }
    if (rb) {
      hb.material.uniforms.tReflA.value = rb.texture;
      hb.material.uniforms.uTexMatA.value.copy(rb.matrix);
    }
  }, 0);

  const calm = 1 - 0.75 * seg(t, timing.calm, timing.calm + 3);
  const spin = t * 0.2 * calm;
  const morph = (k: Partial<typeof DEFAULT_MORPH>) => ({ ...DEFAULT_MORPH, reflectivity: 0.95, ...k });
  const sheen = (phase: number) => ({ sheen: 0.3, sheenPos: -0.9 + ((t * 0.09 + phase) % 2.4) });
  const earthInner = innerEarthScale(t, timing);
  const pair = st("earth");

  return (
    <>
      {/* гостевой мир 1: горная долина днём с облаками */}
      <WorldLayer layer={LAYER.valleyGuest} position={guests.valley.origin.toArray() as [number, number, number]} rotation={guests.valley.euler}>
        <ValleyWorld time={t} light={{ ...DAY_LIGHT, fogDensity: 0.0007 }} sky={{ day: 1, clouds: 1, sunDir: [-0.75, 0.5, 0.25] }} worldScale={guests.valley.scale} lake="flat" />
      </WorldLayer>
      {/* гостевой мир 2: вращающаяся Земля в космосе */}
      <WorldLayer layer={LAYER.earthGuest}>
        <SkyDome radius={60} state={{ space: 1, stars: 0.8 }} time={t} />
        <MirrorEarth position={guests.earth.toArray() as [number, number, number]} radius={0.95} spin={spin} sunDir={guests.earthSun} segments={64} />
      </WorldLayer>
      {/* гостевой мир 3: дерево под звёздным небом */}
      <WorldLayer layer={LAYER.treeGuest} position={[guests.tree.point.x, guests.tree.point.y - 0.8, guests.tree.point.z]} rotation={[0, guests.tree.yaw, 0]}>
        <SkyDome radius={60} state={{ night: 1, stars: 1, moon: 1, moonDir: guests.tree.moon }} time={t} />
        <GrowingTree seed={21} growth={1} position={[0, 0, 0]} scale={0.17} time={t} trunk={3.4} leafTint={0.9} />
        <mesh position={[0, -0.32, 0]} scale={[1, 0.3, 1]}>
          <sphereGeometry args={[1.15, 32, 16]} />
          <meshStandardMaterial color="#2C5A45" roughness={1} />
        </mesh>
        <directionalLight color="#D6E2FA" intensity={3.2} position={[-4, 5, 6]} />
        <directionalLight color={PALETTE.turquoise} intensity={1.2} position={[3, 3, -6]} />
        <hemisphereLight color="#4A64A0" groundColor="#0A1210" intensity={1.2} />
      </WorldLayer>

      {(["mountains", "tree"] as const).map((id, i) => {
        const s = st(id);
        if (!s.visible) return null;
        return (
          <Mirror
            key={id}
            size={PANEL_SIZE}
            position={s.position}
            rotation={s.rotation}
            frameOpacity={s.opacity}
            morph={morph({ opacity: s.opacity, ...sheen(i * 0.7) })}
            time={t}
            envMap={env}
            style={{ border: 0.05, radius: 0.09, depth: 0.07 }}
            reflectA={{ layers: [id === "mountains" ? LAYER.valleyGuest : LAYER.treeGuest], resolution: 900 }}
          />
        );
      })}
      {pair.visible ? (
        <Mirror
          size={PANEL_SIZE}
          position={pair.position}
          rotation={pair.rotation}
          frameOpacity={pair.opacity}
          morph={morph({ opacity: pair.opacity, blend, ...sheen(0.35) })}
          time={t}
          envMap={env}
          style={{ border: 0.05, radius: 0.09, depth: 0.07 }}
          reflectA={{ layers: [LAYER.earthGuest], resolution: 900 }}
          surfaceRef={earthRef}
        />
      ) : null}
      {partner.visible ? (
        <Mirror
          size={PANEL_SIZE}
          position={partner.position}
          rotation={partner.rotation}
          frameOpacity={partner.opacity}
          morph={morph({ opacity: partner.opacity, ...sheen(1.1) })}
          time={t}
          envMap={env}
          style={{ border: 0.05, radius: 0.09, depth: 0.07 }}
          reflectA={{ layers: [LAYER.main] }}
          surfaceRef={partnerRef}
          manual
        />
      ) : null}
      {/* свет проходит между поверхностями: от горной панели к V-паре и от пары к дереву */}
      {(() => {
        const k = seg(t, timing.wide - 0.4, timing.wide + 1.4) * (1 - seg(t, timing.fold - 0.6, timing.fold + 0.4));
        const mt = st("mountains"), tr = st("tree");
        const c = new THREE.Vector3(0, pair.position[1], -0.2);
        return (
          <>
            <LightBeam from={new THREE.Vector3(...mt.position)} to={c} color={PALETTE.gold} intensity={0.22 * k} time={t} />
            <LightBeam from={c} to={new THREE.Vector3(...tr.position)} color={PALETTE.turquoise} intensity={0.2 * k} time={t} phase={0.4} />
          </>
        );
      })()}
      {earthInner > 0.001 ? (
        <group position={[0, pair.position[1], -0.05]} scale={earthInner}>
          <MirrorEarth position={[0, 0, 0]} radius={0.34} spin={spin * 1.2 + 1} sunDir={SUN} segments={64} />
          <pointLight color={PALETTE.gold} intensity={0.6} distance={3} />
        </group>
      ) : null}
    </>
  );
};
