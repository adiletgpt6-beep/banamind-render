// Сцена 4 (19,5–32,5 с). 17:08, у школы. Машина мамы останавливается,
// сын выходит из ворот и садится назад. Мама на парковке (машина стоит)
// берёт телефон из держателя и перезванивает: «Кардар • Чалып жатат…» →
// «Жооп жок». Она открывает календарь, чтобы найти время, — и видит, что
// «Мектептен алуу 16:40–17:30» стоит каждый день Дш–Жм, ровно на время
// рабочих звонков. Причина найдена: «Бир жолку эмес экен. Баламдын жолун
// алдын ала уюштурсам жакшы болот.» — и мама начинает искать (печатает).
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { bg8Beats } from "../beats";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeOut, keys, keysV, lerp } from "../rig/motion";
import { CalendarWeek, CallScreen, NAVY, PhoneFrame, YELLOW } from "../screens";
import { BG8_TEXT } from "../script";
import { Car } from "../sets/Outdoor";
import { MOM_CAR, ROAD_Y, SCHOOL_X, Street } from "../sets/Street";
import { box, camMove, Shot } from "../shots";
import { Cabin, HOLDER, LOOK_AT, NEAR_EAR, WHEEL_L, WHEEL_R } from "./Cabin";

const PARK_X = SCHOOL_X - 520;
const KID_H = 150;

export const SchoolScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { school: s } = bg8Beats(cues);
  const { m01 } = s;
  // машина подъезжает и останавливается
  const carX = lerp(PARK_X - 700, PARK_X, cruise(clamp(f / s.stop), 0.05) * 0.5 + clamp(f / s.stop) * 0.5);
  const carMoving = f < s.stop;
  // сын: от ворот к задней двери
  const kid = (t: number): Place => {
    const u = cruise(clamp((t - 22) / 40), 0.3);
    return { x: lerp(SCHOOL_X - 40, PARK_X + 110, u), y: ROAD_Y - 46, h: KID_H };
  };
  const kidPose = (): PoseIn => ({ expr: "smile", armR: { target: null, shape: "relax" }, strapTug: 0.6 });

  const holding = f >= s.take;
  const typing = f >= s.type;
  const momPose = (t: number): PoseIn => ({
    expr: t < s.noAnswer ? "calm" : t < m01.from - 4 ? "thinking" : t < m01.to ? "worried" : "calm",
    sit: 1,
    seat: 780,
    lookX: keys(t, [[s.take - 10, 0], [s.take - 2, -0.6], [s.take + 10, -0.6], [s.ear, -0.1], [s.back, -0.1], [s.back + 10, -0.35], [m01.from, -0.35], [m01.from + 40, 0], [s.type - 4, 0], [s.type + 6, -0.35]]),
    lookY: keys(t, [[s.take - 10, 0], [s.take - 2, 0.5], [s.take + 10, 0.5], [s.ear, 0], [s.back, 0], [s.back + 10, 0.6], [m01.from, 0.6], [m01.from + 40, 0.05], [s.type - 4, 0.05], [s.type + 6, 0.6]]),
    headTilt: keys(t, [[s.ear, 0], [s.ear + 10, -6], [s.back, -6], [s.back + 10, 0]]),
    nod: keys(t, [[m01.from + 50, 0], [m01.from + 60, 4], [m01.from + 72, 0]]),
    armL: {
      target: keysV(
        t,
        [
          [s.take - 14, WHEEL_L],
          [s.take, HOLDER],
          [s.ear, NEAR_EAR],
          [s.back, NEAR_EAR],
          [s.back + 14, LOOK_AT],
          [m01.from + 30, LOOK_AT],
          [m01.from + 44, { x: LOOK_AT.x + 10, y: LOOK_AT.y + 70 }],
          [s.type - 8, { x: LOOK_AT.x + 10, y: LOOK_AT.y + 70 }],
          [s.type + 4, LOOK_AT],
        ],
        anticipate,
      ),
      shape: holding ? "phone" : "fist",
      item: holding ? "phone" : "none",
      glow: 1,
      itemTilt: keys(t, [[s.ear - 6, 0], [s.ear, -16], [s.back, -16], [s.back + 10, 0]]),
      elbow: "down",
      behind: false,
    },
    armR: typing
      ? { target: { x: LOOK_AT.x + 34 + Math.sin(t * 1.4) * 6, y: LOOK_AT.y - 10 + Math.abs(Math.sin(t * 1.1)) * 6 }, shape: "point", elbow: "down", behind: false }
      : { target: WHEEL_R, shape: "fist", elbow: "down" },
  });
  const momFace = (t: number) => keys(t, [[s.take - 10, 0], [s.take, -0.25], [s.ear, 0.05], [s.back, 0.05], [s.back + 10, -0.15], [m01.from + 30, -0.15], [m01.from + 44, 0.08], [s.type - 4, 0.08], [s.type + 6, -0.15]]);
  const sonPose = (t: number): PoseIn => ({
    expr: t < m01.from ? "smile" : "calm",
    sit: 1,
    seat: 300,
    packOff: true,
    nod: keys(t, [[m01.to - 10, 0], [m01.to, 4], [m01.to + 12, 0]]),
    armL: { target: { x: 480, y: 1105 }, shape: "relax" },
    armR: { target: { x: 565, y: 1110 }, shape: "relax" },
  });
  const sonFace = (t: number) => keys(t, [[s.cabin, -0.5], [s.cabin + 30, 0.45], [s.ear + 20, 0.45], [s.ear + 40, -0.3], [m01.from, -0.3], [m01.from + 10, 0.5]]);
  const cabin = (
    <Cabin f={f} uid="s4" pass={0} moving={false} window="school" momFace={momFace} momPose={momPose} son={{ face: sonFace, pose: sonPose }} phoneInHolder={!holding} phoneGlow={0.4} phoneShake={0} />
  );
  const chip = easeOut((f - 4) / 8);
  const insertBg = <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #E7EDF6, #C8D3E3)" })} />;
  return (
    <>
      {/* у школы: машина паркуется, сын садится */}
      <Shot f={f} from={0} to={s.cabin} cam={{ x: PARK_X + 260, y: ROAD_Y - 200, zoom: 1.05 }} base={{ x: PARK_X + 260, y: ROAD_Y - 200, zoom: 1.05 }}>
        <Street />
        {f >= 22 && f < 62 ? <Actor uid="s4-kid" look="son" f={f} place={kid} face={() => -0.6} pose={kidPose} seed={4} walkFrom={20} /> : null}
        <Car x={carX} y={ROAD_Y + 80} s={1} color={MOM_CAR} wheel={carX * 0.9} dir={1} driver kid={f >= 62} openRear={keys(f, [[52, 0], [58, 0.8], [62, 0]])} />
      </Shot>
      <Shot f={f} from={s.cabin} to={s.callAt} cam={camMove(f, s.cabin, s.callAt, { x: 600, y: 1120, zoom: 1.08 }, { x: 620, y: 1080, zoom: 1.14 })}>
        {cabin}
      </Shot>
      {/* кайра чалуу: «Чалып жатат…» → «Жооп жок» */}
      <Shot
        f={f}
        from={s.callAt}
        to={s.back}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <>
            {insertBg}
            <PhoneFrame x={230} y={300} w={620} tilt={-2}>
              <CallScreen f={f} state={f < s.noAnswer ? "calling" : "noanswer"} time={BG8_TEXT.time.school} />
            </PhoneFrame>
          </>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={s.back} to={s.cal} cam={{ x: 620, y: 1080, zoom: 1.14 }}>
        {cabin}
      </Shot>
      {/* календарь недели: событие повторяется каждый день */}
      <Shot
        f={f}
        from={s.cal}
        to={s.calOut}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <>
            {insertBg}
            <PhoneFrame x={230} y={50} w={620}>
              <CalendarWeek f={f} dayAt={s.days} clashAt={s.clashAt} repeatAt={s.repeatAt} time={BG8_TEXT.time.school} />
            </PhoneFrame>
          </>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={s.calOut} to={400} cam={camMove(f, s.calOut, 390, { x: 640, y: 1040, zoom: 1.22 }, { x: 650, y: 1020, zoom: 1.3 })}>
        {cabin}
      </Shot>
      <div style={box({ left: 60, top: 220, display: "flex", gap: 14, fontFamily, opacity: chip * (f < s.callAt || (f >= s.back && f < s.cal) || f >= s.calOut ? 1 : 0) })}>
        <div style={{ padding: "12px 26px", borderRadius: 40, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 42, fontWeight: 900 }}>{BG8_TEXT.time.school}</div>
        <div style={{ padding: "12px 26px", borderRadius: 40, backgroundColor: YELLOW, color: NAVY, fontSize: 40, fontWeight: 900, opacity: carMoving ? 0 : 1 }}>{f < s.callAt ? BG8_TEXT.lanes.pick : BG8_TEXT.callBack}</div>
      </div>
    </>
  );
};
