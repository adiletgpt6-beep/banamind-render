// Сцена 1 (0–6 с), холодное начало. Машина на парковке у офиса, 16:40.
// Телефон в держателе вибрирует — «Кардар». Мама уже пристёгнута: её рука
// тянется к телефону — и останавливается; часы, взгляд на дорогу, руки на
// руль. Крупно: входящий «Кардар» дрожит в держателе. Машина трогается,
// телефон продолжает вибрировать; за рулём мама телефоном не пользуется.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg8Beats, buzzing } from "../beats";
import { CuesContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { anticipate, clamp, easeOut, keys, keysV } from "../rig/motion";
import { CallScreen, DashHolder, NAVY, PhoneFrame, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";
import { box, camMove, Shot } from "../shots";
import { Cabin, HOLDER, WHEEL_L, WHEEL_R } from "./Cabin";

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { hook } = bg8Beats(cues);
  const buzz = buzzing(f, hook.buzz);
  const shake = buzz ? Math.sin(f * 2.7) * 4 : 0;
  // путь машины: стоит, с hook.go плавно трогается
  const pass = keys(f, [[hook.go, 0], [hook.go + 30, 8], [180, 40]], (x) => x * x);
  const toward = { x: HOLDER.x + 70, y: HOLDER.y - 120 };
  const momPose = (t: number): PoseIn => ({
    expr: t < 14 ? "thinking" : t < hook.back ? "worried" : "calm",
    sit: 1,
    seat: 780,
    lookX: keys(t, [[4, 0], [10, -0.75], [44, -0.75], [52, 0.1], [hook.back, 0], [hook.back + 8, 0]]),
    lookY: keys(t, [[4, 0], [10, 0.55], [44, 0.55], [52, 0.15], [hook.back, 0.05]]),
    // рука тянется к телефону — и возвращается на руль
    armL: {
      target: keysV(t, [[14, WHEEL_L], [30, toward], [40, toward], [54, WHEEL_L]], anticipate),
      shape: t > 20 && t < 46 ? "open" : "fist",
      elbow: "down",
      behind: false,
    },
    armR: { target: WHEEL_R, shape: "fist", elbow: "down" },
    exhale: keys(t, [[44, 0], [56, 0.7], [76, 0.2]]),
    nod: keys(t, [[48, 0], [56, 4], [66, 0]]),
  });
  const momFace = (t: number) => keys(t, [[6, 0], [14, -0.3], [44, -0.3], [54, 0], [hook.back, 0.02]]);
  const cabin = (
    <Cabin f={f} uid="h1" pass={pass} moving={f >= hook.go} window="parking" momFace={momFace} momPose={momPose} phoneInHolder phoneGlow={1} phoneShake={shake} />
  );
  const chip = easeOut((f - 8) / 10);
  return (
    <>
      <Shot f={f} from={0} to={hook.insert} cam={camMove(f, 0, hook.insert, { x: 600, y: 1150, zoom: 1.08 }, { x: 560, y: 1200, zoom: 1.18 })}>
        {cabin}
      </Shot>
      {/* крупно: телефон в держателе дрожит — «Кардар» */}
      <Shot
        f={f}
        from={hook.insert}
        to={hook.back}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #2B2F38 0%, #1E2128 100%)" })}>
            <div style={box({ left: -100, top: -200, width: 1280, height: 700, background: "linear-gradient(180deg, #C9D6E0, #8FA9C2)", opacity: 0.35, borderRadius: "0 0 50% 50%" })} />
            <DashHolder x={250 + shake} y={330} w={580} />
            <PhoneFrame x={250} y={330} w={580} shake={shake} tilt={buzz ? Math.sin(f * 2.3) * 0.6 : 0}>
              <CallScreen f={f} state="incoming" time={BG8_TEXT.time.hook} />
            </PhoneFrame>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={hook.back} to={200} cam={camMove(f, hook.back, 180, { x: 620, y: 1100, zoom: 1.12 }, { x: 640, y: 1080, zoom: 1.16 })}>
        {cabin}
      </Shot>
      {/* время и цель: 16:40, а уроки заканчиваются в 17:00 */}
      <div style={box({ left: 60, top: 220, display: "flex", gap: 16, fontFamily, opacity: chip * (f >= hook.insert && f < hook.back ? 0 : 1), transform: `translateY(${(1 - chip) * -20}px)` })}>
        <div style={{ padding: "12px 28px", borderRadius: 40, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 46, fontWeight: 900 }}>{BG8_TEXT.time.hook}</div>
        <div style={{ padding: "12px 28px", borderRadius: 40, backgroundColor: YELLOW, color: NAVY, fontSize: 40, fontWeight: 900, opacity: clamp((f - 20) / 10) }}>{BG8_TEXT.lessonsEnd}</div>
      </div>
    </>
  );
};
