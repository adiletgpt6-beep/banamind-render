// Мир «Ночное озеро» (сцена 7): долина ночью, Луна и звёзды в воде, мальчик на берегу.
import { sampleCamera, useCameraPose } from "../engines/MirrorCameraController";
import { NIGHT_LIGHT } from "../components/MirrorMountains";
import { Boy } from "../components/Boy";
import { BOY_POS, MOON_DIR, S7_CAMERA, boyHead } from "../scenes/Scene07Ending";
import { ValleyWorld } from "./ValleyWorld";

export const NightWorld: React.FC<{ t: number }> = ({ t }) => {
  useCameraPose(sampleCamera(S7_CAMERA, t), 0.1, 2000);
  return (
    <ValleyWorld
      time={t}
      light={{ ...NIGHT_LIGHT, sunDir: [MOON_DIR[0], 0.5, MOON_DIR[2]] }}
      sky={{ night: 1, stars: 1, moon: 1, clouds: 0.25, moonDir: MOON_DIR }}
      lake="reflective"
      lakeMorph={{ ripple: 0.28 }}
      treeGrowth={1}
      sproutGrowth={1}
      leafTint={0.35}
    >
      <Boy position={BOY_POS} yaw={Math.PI} headPitch={boyHead(t)} />
      <directionalLight color="#AFC4EE" intensity={1.6} position={[MOON_DIR[0] * 50, 30, MOON_DIR[2] * 50 + BOY_POS[2]]} />
      <directionalLight color="#8FB4E8" intensity={1.5} position={[4, 8, BOY_POS[2] - 30]} />
      <hemisphereLight color="#3A5288" groundColor="#0A1210" intensity={0.8} />
    </ValleyWorld>
  );
};
