// Проверка рига перед постановкой 80-1-11: посадка на ковёр и подъём
// (sitMorph), наклон учителя от бедра (bow) с лёгким приседом (crouch) — рука к низкому
// столику.
// Только для разработки.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneContext } from "../../core/context";
import { Shot } from "../../core/shots";
import { Actor, type Place } from "../../rig/Actor";
import { pupilById, TEACHER, heightForAge } from "../../characters/characterConfig";
import { RoomBack } from "../../sets/Classroom";
import { nestingBirdPose } from "../../bird/birdPose";
import { clamp, easeInOut } from "../../rig/motion";

const amir = pupilById("amir");
const yusuf = pupilById("yusuf");
const bilal = pupilById("bilal");
const at = (x: number, y: number, h: number) => (): Place => ({ x, y, h });

export const RigCheck: React.FC = () => {
  const f = useCurrentFrame();
  const sitK = (t: number) => easeInOut(clamp((t - 0) / 40)) * (1 - easeInOut(clamp((t - 60) / 40)));
  const pose = (t: number) => ({ floorSit: sitK(t), sitMorph: true, armSnap: true, lean: 8 * Math.sin(Math.PI * sitK(t)), expr: "listening" as const });
  const variants = [
    { bow: 0, crouch: 0 },
    { bow: 15, crouch: 0.12 },
    { bow: 25, crouch: 0.18 },
    { bow: 32, crouch: 0.25 },
    { bow: 40, crouch: 0.3 },
  ];
  return (
    <SceneContext.Provider value={{ from: 0, len: 300 }}>
      <AbsoluteFill>
        <Shot f={f} from={0} to={10000} cam={{ x: 1350, y: 1000, zoom: 1.0 }} bg="#F1E7D6">
          <RoomBack pose={nestingBirdPose(f)} placed={1} f={f} grassOnGround={false} />
          <Actor uid="b" look={bilal.look} f={f} place={at(300, 1300, heightForAge(11) * 1.17)} face={() => 0.2} pose={pose} seed={13} />
          <Actor uid="a" look={amir.look} f={f} place={at(520, 1300, heightForAge(8) * 1.17)} face={() => 0.2} pose={pose} seed={12} />
          <Actor uid="y" look={yusuf.look} f={f} place={at(700, 1300, heightForAge(4) * 1.17)} face={() => 0.2} pose={pose} seed={11} />
          {variants.map((v, i) => (
            <Actor
              key={i}
              uid={`t${i}`}
              look={TEACHER.look}
              f={f}
              place={at(900 + i * 380, 1300, 760 * 1.17)}
              face={() => -0.6}
              pose={() => ({ crouch: v.crouch, bow: v.bow, armSnap: true, lookY: 0.6, expr: "focused" as const, armR: { target: { x: 900 + i * 380 - 150, y: 1300 - 889 * 0.42 }, shape: "point" as const, elbow: "down" as const } })}
              seed={4 + i}
            />
          ))}
        </Shot>
        <div style={{ position: "absolute", left: 20, top: 20, fontSize: 40, color: "#000" }}>{f}</div>
      </AbsoluteFill>
    </SceneContext.Provider>
  );
};
