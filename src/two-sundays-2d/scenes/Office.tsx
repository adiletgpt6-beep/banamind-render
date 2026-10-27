// Сцена 4. Середина рабочего дня.
// A. Средний план офиса: мама у экрана объясняет коллегам рабочий
//    материал (жест к графику). На стене часы — около 12:50.
// B. Крупно часы: стрелка подходит к 13:00 (конец уроков); мама смотрит
//    на время, коротко кивает коллегам — разговор завершён.
// C. За столом: экран со стороны мамы (через плечо) — документ сохранён;
//    затем рука закрывает крышку ноутбука. Открытый блокнот остаётся на
//    столе — она ненадолго покидает задачу.
// D. У школы: мама открывает дверь машины, дочка подходит с рюкзаком;
//    вид через дверь — садится и пристёгивается.
import { CloseHand } from "../props/CloseHand";
import { LaptopScreen, laptopLidTop } from "../props/Laptop";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { box, camMove, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, F, TINT } from "../theme";
import { MOM_OFFICE, MomOfficeBack, WallClock } from "../sets/MomOffice";
import { HANDS } from "./common";
import { MeetingWide, MomAtDesk } from "./OfficeShared";
import { CarStreet, carStreetTimes, SeatView } from "./CarBits";

const O = MOM_OFFICE;

export const officePlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "office");
  const clock = Math.max(70, T.from("N04") - 14);
  const glance = clock + 16;
  const screen = clock + 44; // через плечо: сохранение
  const saved = screen + 22;
  const lid = screen + 46; // крышка закрывается
  const lidDone = lid + 24;
  const street = lidDone + 14;
  const S = carStreetTimes(street);
  const seat = S.end;
  return { clock, glance, screen, saved, lid, lidDone, street, seat, doorOpen: S.open[1], len: T.len };
};

export const OfficeScene: React.FC = () => {
  const { f } = useScene("office");
  const p = usePlan(officePlan);
  if (f < p.clock) {
    // A. Обсуждение у экрана
    const momPose = (t: number) => ({
      expr: "smile" as const,
      armL: { target: { x: 220 + 16 * Math.sin(t / 14), y: 900 + 24 * Math.sin(t / 19) }, shape: "point" as const, elbow: "down" as const },
      lookY: 0.05,
      nod: 2 * Math.sin(t / 11),
    });
    const momFace = (t: number) => keys(t, [[0, 0.55], [22, -0.3], [40, -0.3], [58, 0.55]]);
    return <MeetingWide f={f} cam={camMove(f, 0, p.clock, { x: 690, y: 1120, zoom: 1.0 }, { x: 680, y: 1110, zoom: 1.06 })} clock={[12, Math.round(lerp(50, 55, f / p.clock))]} mom={{ x: 380, pose: momPose, face: momFace }} />;
  }
  if (f < p.screen) {
    // B. Часы → взгляд мамы
    const m = Math.round(keys(f, [[p.clock, 57], [p.clock + 12, 59], [p.clock + 16, 60]]));
    if (f < p.glance) {
      return (
        <Shot f={f} cam={{ x: O.clock.x, y: O.clock.y, zoom: 3.2 }} bg={C.wallOffice}>
          <MomOfficeBack />
          <WallClock x={O.clock.x} y={O.clock.y} r={O.clock.r} h={m >= 60 ? 13 : 12} m={m % 60} />
          <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.cool })} />
        </Shot>
      );
    }
    const momPose = (t: number) => ({ expr: "calm" as const, lookY: keys(t, [[p.glance, -0.6], [p.glance + 10, -0.6], [p.glance + 16, 0]]), nod: keys(t, [[p.glance + 18, 0], [p.glance + 22, 5], [p.glance + 28, 0]]), lookX: 0 });
    return <MeetingWide f={f} cam={{ x: 560, y: 900, zoom: 1.7 }} clock={[13, 0]} mom={{ x: 380, pose: momPose, face: (t) => keys(t, [[p.glance, 0.2], [p.glance + 10, 0.2], [p.glance + 16, 0.6]]) }} />;
  }
  if (f < p.lid) {
    // C1. Экран со стороны мамы: документ сохранён
    const typed = 5;
    const done = clamp((f - p.saved) / 8);
    return (
      <Shot f={f} cam={{ x: 540, y: 1000, zoom: 1 }} bg="#D9DEE5">
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #E6E9EE, #D9DEE5)" })} />
        <Svg>
          <LaptopScreen x={540} y={1150} w={900} typed={typed} done={done} />
          <CloseHand x={700} y={1120 + 40} angle={175} size={150} {...HANDS.mom} shape="point" lift={f > p.saved - 6 && f < p.saved ? 1 : 0} />
        </Svg>
        {done > 0 ? (
          <div style={box({ left: 540 + 450 - 300, top: 1150 - 60 - 100, width: 200, textAlign: "right", fontFamily: F.text, fontWeight: 800, fontSize: 38, color: "#2E8A55", opacity: done })}>Сакталды</div>
        ) : null}
        <div style={box({ left: -200, top: 1450, width: 600, height: 800, filter: "blur(10px)", backgroundColor: C.navy, borderRadius: "50%" })} />
      </Shot>
    );
  }
  if (f < p.street) {
    // C2. Крышка закрывается; блокнот открыт рядом
    const lid = 1 - easeInOut(clamp((f - p.lid) / (p.lidDone - p.lid)));
    const top = laptopLidTop(O.laptop.x, O.laptop.y, O.laptop.w, lid);
    const momPose = () => ({ sit: 1, seat: 250, expr: "calm" as const, lookY: 0.55, armL: { target: { x: O.laptop.x + 50, y: top.y + 14 }, shape: "open" as const, elbow: "down" as const, behind: false }, armR: { target: { x: O.momSeat + 110, y: O.desk.top + 4 }, shape: "relax" as const, elbow: "down" as const, behind: false } });
    return <MomAtDesk f={f} cam={{ x: O.laptop.x + 160, y: 1000, zoom: 1.75 }} lid={lid} pose={momPose} face={() => -0.35} />;
  }
  if (f < p.seat) return <CarStreet f={f} t0={p.street} adult="su2Mom" kid="su2Girl" school />;
  return <SeatView f={f} t0={p.seat} kid="su2Girl" />;
};
