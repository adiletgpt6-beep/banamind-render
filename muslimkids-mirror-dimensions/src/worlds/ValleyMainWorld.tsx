// Мир «Горное озеро» (сцены 3–5): долина, отражения в воде, дерево и росток.
import { sampleCamera, useCameraPose } from "../engines/MirrorCameraController";
import { S3_VALLEY_CAMERA } from "../scenes/Scene03Lake";
import { S4_CAMERA, sproutGrowth, valleyLight, valleySky } from "../scenes/Scene04Tree";
import { S5_VALLEY_CAMERA } from "../scenes/Scene05MirrorUniverse";
import { ValleyWorld } from "./ValleyWorld";
import { lerp, seg } from "../utils/math";

export const VALLEY_CAMERA = [...S3_VALLEY_CAMERA, ...S4_CAMERA, ...S5_VALLEY_CAMERA];

export const ValleyMainWorld: React.FC<{ t: number }> = ({ t }) => {
  useCameraPose(sampleCamera(VALLEY_CAMERA, t), 0.3, 2000);
  const night = seg(t, 35, 37.6);
  return (
    <ValleyWorld
      time={t}
      light={valleyLight(t)}
      sky={valleySky(t)}
      lake="reflective"
      lakeMorph={{ ripple: lerp(0.55, 0.35, seg(t, 24, 28)), rippleScale: 1 }}
      treeGrowth={1}
      sproutGrowth={sproutGrowth(t)}
      leafTint={lerp(1, 0.35, night)}
    />
  );
};
