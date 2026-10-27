import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";

// Сцена 1080×1920: тон-маппинг ACES, мягкие тени. Камера задаётся каждый
// кадр (позиция, точка взгляда, фокусное).
export type Cam = { pos: THREE.Vector3; target: THREE.Vector3; fov?: number; roll?: number };

export const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.copy(cam.pos);
  c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
  c.lookAt(cam.target);
  if (cam.fov && c.fov !== cam.fov) {
    c.fov = cam.fov;
    c.updateProjectionMatrix();
  }
  c.updateMatrixWorld();
  return null;
};

export const Stage: React.FC<{
  readonly cam?: Cam;
  readonly bg?: string;
  readonly exposure?: number;
  readonly children: React.ReactNode;
}> = ({ cam, bg = "#cfe6f7", exposure = 1, children }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <ThreeCanvas
      width={1080}
      height={1920}
      shadows
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ fov: 38, near: 0.03, far: 400 }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      {cam ? <CameraRig cam={cam} /> : null}
      {children}
    </ThreeCanvas>
  </AbsoluteFill>
);

// Камера: точки по времени (плавно между ними).
export const camPath = (keys: readonly { t: number; pos: [number, number, number]; target: [number, number, number]; fov?: number }[], t: number): Cam => {
  const k = keys.findIndex((x) => x.t > t);
  const a = keys[Math.max(0, (k < 0 ? keys.length : k) - 1)];
  const b = k < 0 ? a : keys[k];
  const u = b === a ? 0 : Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const s = u * u * (3 - 2 * u);
  const v = (p: [number, number, number], q: [number, number, number]) => new THREE.Vector3(...p).lerp(new THREE.Vector3(...q), s);
  return { pos: v(a.pos, b.pos), target: v(a.target, b.target), fov: (a.fov ?? 38) + ((b.fov ?? 38) - (a.fov ?? 38)) * s };
};
