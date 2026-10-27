// Мир «Зеркальная вселенная» (сцены 5–6): ночное звёздное пространство и
// главная многослойная зеркальная композиция.
import { sampleCamera, useCameraPose } from "../engines/MirrorCameraController";
import { RIGS } from "../engines/MirrorLightingSystem";
import { MirrorComposition } from "../components/MirrorComposition";
import { SkyDome } from "../components/SkyDome";
import { LightRigView, useStudioEnv } from "../components/WorldKit";
import { KALEIDO, UNIVERSE_CAMERA } from "../scenes/Scene05MirrorUniverse";

export const UniverseWorld: React.FC<{ t: number }> = ({ t }) => {
  useCameraPose(sampleCamera(UNIVERSE_CAMERA, t), 0.05, 1500);
  const env = useStudioEnv();
  return (
    <>
      <SkyDome radius={700} state={{ night: 1, stars: 1 }} time={t} />
      <LightRigView rig={RIGS.space} intensity={0.9} />
      <MirrorComposition t={t} timing={KALEIDO} env={env} />
    </>
  );
};
