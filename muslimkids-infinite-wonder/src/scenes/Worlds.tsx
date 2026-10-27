// Два мира одной истории. Камера всегда одна; мир меняется под облачной
// завесой (s = 5), поэтому зритель видит непрерывный полёт.
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { applyPose } from "../engines/CameraTransitionEngine";
import { SPACE_SUN } from "../engines/LightingSystem";
import type { DirectorState } from "../engines/InfiniteWonderDirector";
import { PaintingCanvas } from "../components/PaintingCanvas";
import { LivingEarth } from "../components/LivingEarth";
import { DayNightGuide, PaintDrop, SpaceBackdrop } from "../components/SpaceDetails";
import { MountainWorld } from "../components/MountainWorld";
import { ForestWorld } from "../components/ForestWorld";
import { LivingTree } from "../components/LivingTree";
import { LeafCutaway } from "../components/LeafCutaway";
import { CloudVeil } from "../components/CloudVeil";

const CameraRig: React.FC<{ st: DirectorState }> = ({ st }) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  applyPose(camera, st.pose, size.width / size.height);
  return null;
};

/** Сцены 1–2 и финал возвращения: холст, капля, Земля, космос. */
export const SpaceWorld: React.FC<{ st: DirectorState }> = ({ st }) => {
  const scene = useThree((s) => s.scene);
  scene.fog = null;
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={SPACE_SUN.clone().multiplyScalar(10)} intensity={2.2} />
      <SpaceBackdrop st={st} />
      <PaintingCanvas st={st} />
      <PaintDrop st={st} />
      <LivingEarth st={st} />
      <DayNightGuide st={st} />
    </>
  );
};

/** Сцены 3–6: горы, лес, дерево, лист, срез и клетка. */
export const NatureWorld: React.FC<{ st: DirectorState }> = ({ st }) => (
  <>
    <MountainWorld st={st} />
    <ForestWorld />
    <LivingTree st={st} />
    <LeafCutaway st={st} />
  </>
);

export const WorldStage: React.FC<{ st: DirectorState; aspect: number }> = ({ st, aspect }) => (
  <>
    <CameraRig st={st} />
    {st.world === "space" ? <SpaceWorld st={st} /> : <NatureWorld st={st} />}
    <CloudVeil st={st} aspect={aspect} />
  </>
);
