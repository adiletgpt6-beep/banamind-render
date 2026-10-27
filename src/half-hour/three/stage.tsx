import { useThree } from "@react-three/fiber";
import { Suspense, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useDelayRender, useRemotionEnvironment } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HHRenderScaleContext } from "../context";
import { prepareScreenFonts, screenFontsReady } from "./props";

THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => console.log(`3D resource ready: ${url} (${loaded}/${total})`);
THREE.DefaultLoadingManager.onError = (url) => console.error(`3D resource failed: ${url}`);

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

const environmentCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
const SoftEnvironment: React.FC = () => {
  const { gl, scene } = useThree();
  const environment = useMemo(() => {
    const cached = environmentCache.get(gl);
    if (cached) return cached;
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(room, 0.055).texture;
    room.dispose(); pmrem.dispose(); environmentCache.set(gl, texture); return texture;
  }, [gl]);
  scene.environmentIntensity = 0.34;
  return <primitive object={environment} attach="environment" />;
};

// Keep the frame renderer mounted while models/fonts/textures suspend. React
// replays layout effects when an outer Suspense boundary reveals its children;
// the ThreeCanvas passive frame effect can otherwise have already run.
const WaitingForAssets: React.FC = () => {
  const { delayRender, continueRender } = useDelayRender();
  useLayoutEffect(() => {
    const handle = delayRender("Loading 3D scene assets");
    return () => continueRender(handle);
  }, [delayRender, continueRender]);
  return null;
};

const ReadyScene: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { advance, gl } = useThree();
  const { isRendering } = useRemotionEnvironment();
  useLayoutEffect(() => {
    // Newly revealed assets need a draw even when the requested frame did not
    // change. The regular ThreeCanvas frame effect handles subsequent frames.
    if (isRendering) {
      advance(performance.now());
      console.log(`3D scene assets committed; drawing buffer ${gl.domElement.width}x${gl.domElement.height}`);
    }
  }, [advance, isRendering, gl]);
  return <>{children}</>;
};

export const Stage: React.FC<{
  readonly cam?: Cam;
  readonly bg?: string;
  readonly exposure?: number;
  readonly children: React.ReactNode;
}> = ({ cam, bg = "#dceafa", exposure = 1.07, children }) => {
  const [fontsReady, setFontsReady] = useState(screenFontsReady);
  const renderScale = useContext(HHRenderScaleContext);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [fontHandle] = useState(() => delayRender("Preparing 3D screen fonts"));
  useEffect(() => {
    prepareScreenFonts().then(() => setFontsReady(true)).catch(cancelRender);
  }, [cancelRender]);
  useLayoutEffect(() => {
    if (fontsReady) continueRender(fontHandle);
  }, [fontsReady, continueRender, fontHandle]);
  useEffect(() => () => continueRender(fontHandle), [continueRender, fontHandle]);
  return <AbsoluteFill style={{ backgroundColor: bg }}>
    {fontsReady ?
    <ThreeCanvas
      width={1080}
      height={1920}
      dpr={renderScale}
      shadows
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ fov: 38, near: 0.03, far: 400 }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
    >
      <Suspense fallback={<WaitingForAssets />}>
        <ReadyScene>
          <SoftEnvironment />
          {cam ? <CameraRig cam={cam} /> : null}
          {children}
        </ReadyScene>
      </Suspense>
    </ThreeCanvas> : null}
  </AbsoluteFill>;
};

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
