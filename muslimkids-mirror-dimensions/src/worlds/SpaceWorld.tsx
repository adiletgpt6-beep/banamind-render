// Мир «Космическая студия» (сцены 1–3): зеркало, Земля, переход зеркала в озеро.
import { CameraKey, sampleCamera, useCameraPose } from "../engines/MirrorCameraController";
import { LAYER } from "../engines/MirrorReflectionEngine";
import { DEFAULT_MORPH } from "../engines/ReflectionMorphEngine";
import { RIGS } from "../engines/MirrorLightingSystem";
import { Mirror } from "../components/Mirror";
import { MirrorEarth } from "../components/MirrorEarth";
import { SkyDome } from "../components/SkyDome";
import { LightRigView, WorldLayer, useStudioEnv } from "../components/WorldKit";
import { DAY_LIGHT } from "../components/MirrorMountains";
import { MIRROR_SIZE, S1_CAMERA, s1Light } from "../scenes/Scene01FirstMirror";
import { EARTH_POS, EARTH_RADIUS, S2_CAMERA, SUN_DIR, earthSpin } from "../scenes/Scene02Earth";
import { S3_SPACE_CAMERA, S3_VALLEY_CAMERA, VALLEY_SCALE, mirrorMorphS3, mirrorPose } from "../scenes/Scene03Lake";
import { ValleyWorld } from "./ValleyWorld";
import { seg } from "../utils/math";
import { valleySky } from "../scenes/Scene04Tree";

const scaleKeys = (keys: CameraKey[], s: number): CameraKey[] =>
  keys.map((k) => ({ ...k, pos: k.pos.map((v) => v / s) as CameraKey["pos"], look: k.look.map((v) => v / s) as CameraKey["look"] }));

export const SPACE_CAMERA: CameraKey[] = [...S1_CAMERA, ...S2_CAMERA, ...S3_SPACE_CAMERA, ...scaleKeys(S3_VALLEY_CAMERA, VALLEY_SCALE)];

/** Поворот зеркала: Земля входит в отражение, затем зеркало разворачивается к камере. */
export const mirrorYaw = (t: number) =>
  -0.35 + 0.62 * seg(t, 0.8, 5.6) + 0.13 * seg(t, 8.4, 10.8) - 0.4 * seg(t, 14.6, 16.8);

export const SpaceWorld: React.FC<{ t: number }> = ({ t }) => {
  useCameraPose(sampleCamera(SPACE_CAMERA, t), 0.02, 2000);
  const env = useStudioEnv();
  const pose = mirrorPose(t, mirrorYaw(t));
  const light = s1Light(t);
  const morph = { ...DEFAULT_MORPH, ...light, ...mirrorMorphS3(t) };
  const showValleyGuest = t > 15.5;
  return (
    <>
      <SkyDome radius={90} state={{ space: 1, stars: 0.75 }} time={t} />
      <LightRigView rig={RIGS.space} />
      <MirrorEarth position={EARTH_POS} radius={EARTH_RADIUS} spin={earthSpin(t)} sunDir={SUN_DIR} />
      <Mirror
        size={MIRROR_SIZE}
        position={pose.position}
        rotation={pose.rotation}
        frameOpacity={pose.frameOpacity}
        morph={morph}
        time={t}
        envMap={env}
        reflectA={{ layers: [LAYER.main], resolution: 1280 }}
        reflectB={{ layers: [LAYER.valleyGuest], resolution: 1280 }}
      />
      {showValleyGuest ? (
        <WorldLayer layer={LAYER.valleyGuest}>
          <ValleyWorld time={t} light={DAY_LIGHT} sky={valleySky(t)} worldScale={1 / VALLEY_SCALE} lake="flat" treeGrowth={1} />
        </WorldLayer>
      ) : null}
    </>
  );
};
