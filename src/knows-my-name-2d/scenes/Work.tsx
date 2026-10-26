// Сцена 2. Машина есть, время приходится искать («Ошол күнү эртерээк»).
// A. Офис мамы: она у экрана обсуждает с коллегами «Бөлүмдүн планы» —
//    жест к строке документа; коллега кивает.
// B. Офис папы, фронтально: ноутбук наружной крышкой к зрителю, руки
//    папы на клавиатуре за крышкой; он печатает и смотрит в экран.
// C. Со стороны папы: на столе рядом с тачпадом — ключи от машины семьи;
//    камера поднимается к экрану: в календаре две записи на 15:00 —
//    «Жолугушуу» и «Мектептен алуу». Палец на тачпаде, курсор берёт
//    «Жолугушуу» и переносит на 16:00.
import { Actor, type Place } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { LaptopFront } from "../props/Laptop";
import { CalendarScreen, CAL_SCREEN, meetingPoint, TOUCHPAD } from "../props/Calendar30";
import { clamp, easeInOut, keys, keysV } from "../rig/motion";
import { box, camMove, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { C, F, TINT } from "../theme";
import { KM2_TEXT } from "../script";
import { DadChairBack, DadDeskFront, OFFICE, OfficeWall } from "../sets/Office";
import { H, HANDS, seatOf } from "./common";
import { MeetingWide } from "./OfficeShared";

export const workPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "work");
  const dad = T.word("N02", "Атасы") - 4;
  const keysShot = T.word("N02", "Машинасы") - 4;
  const tilt = T.word("N02", "Бирок") - 6; // камера к экрану
  const grab = T.word("N02", "жолугушуулардын") - 2;
  const drop = grab + 30;
  return { dad, keysShot, tilt, grab, drop, len: T.len };
};
type P = ReturnType<typeof workPlan>;

// Подпись времени: короткая плашка вверху кадра, спокойно появляется.
export const TimeCaption: React.FC<{ readonly text: string; readonly t: number; readonly out: number }> = ({ text, t, out }) => {
  if (t < 0 || t > out + 10) return null;
  const o = clamp(t / 8) * (1 - clamp((t - out) / 10));
  return (
    <div style={box({ left: 0, top: 180, width: 1080, display: "flex", justifyContent: "center", opacity: o })}>
      <div style={{ backgroundColor: "rgba(23,42,70,0.88)", color: C.white, fontFamily: F.text, fontWeight: 800, fontSize: 52, padding: "16px 40px 20px", borderRadius: 40 }}>{text}</div>
    </div>
  );
};

const DadOffice: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const dad: Place = { x: OFFICE.dadSeat.x, y: OFFICE.floorY - 20, h: H.dad };
  // печать: кончики пальцев поочерёдно касаются клавиш (за крышкой)
  const tap = (t: number, ph: number) => 5 * Math.max(0, Math.sin(t / 2.4 + ph));
  const pose = (t: number) => ({
    sit: 1,
    seat: seatOf(H.dad) + 20,
    expr: "thinking" as const,
    lookY: 0.5,
    armL: { target: { x: 330, y: OFFICE.desk.top - 6 - tap(t, 0) }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: 480, y: OFFICE.desk.top - 6 - tap(t, 1.7) }, shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  return (
    <Shot f={f} cam={camMove(f, p.dad, p.keysShot, { x: 450, y: 1010, zoom: 1.45 }, { x: 440, y: 1000, zoom: 1.55 })} bg={C.wallOffice}>
      <OfficeWall />
      <DadChairBack />
      <Actor uid="w2-dad" look="km2Dad" f={f} place={() => dad} face={() => 0} pose={pose} seed={2} layer="body" />
      <Actor uid="w2-dad" look="km2Dad" f={f} place={() => dad} face={() => 0} pose={pose} seed={2} layer="arms" />
      <DadDeskFront />
      <LaptopFront x={OFFICE.laptop.x} y={OFFICE.laptop.y} w={OFFICE.laptop.w} open={1} />
      <div style={box({ left: -700, top: -600, width: 2600, height: 3200, backgroundColor: TINT.cool })} />
    </Shot>
  );
};

// Ключи от машины семьи (брелок без логотипов).
const CarKeys: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-18)`}>
    <circle cx={0} cy={0} r={34} fill="none" stroke="#A9B0BA" strokeWidth={9} />
    <rect x={20} y={-30} width={120} height={70} rx={30} fill="#2B2F38" />
    <circle cx={60} cy={5} r={10} fill="#5A616E" />
    <circle cx={100} cy={5} r={10} fill="#5A616E" />
    <path d="M -20 26 L -40 120 L -26 124 L -20 104 L -12 106 L -8 92 L -14 90 L -6 30 Z" fill="#C9CED6" stroke="#9AA2AD" strokeWidth={3} />
  </g>
);

const CalendarShot: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const drag = easeInOut(clamp((f - p.grab - 6) / 22));
  const grab = f >= p.grab && f < p.drop + 2;
  const m = meetingPoint(0);
  const cur = keysV(f, [
    [p.grab - 26, { x: m.x + 220, y: m.y + 160 }],
    [p.grab, { x: m.x - 40, y: m.y - 10 }],
    [p.grab + 6, { x: m.x - 40, y: m.y - 10 }],
    [p.grab + 28, { x: m.x - 40, y: meetingPoint(1).y - 10 }],
    [p.drop + 20, { x: m.x + 120, y: meetingPoint(1).y + 60 }],
  ]);
  // палец на тачпаде повторяет движение курсора (в масштабе тачпада)
  const touch = { x: TOUCHPAD.x + (cur.x - m.x) * 0.22, y: TOUCHPAD.y + (cur.y - m.y) * 0.22 };
  const cam = camMove(f, p.keysShot, p.keysShot + 4, { x: 540, y: 1500, zoom: 1.25 }, { x: 540, y: 1500, zoom: 1.25 });
  const camUp = camMove(f, p.tilt, p.tilt + 26, cam, { x: 540, y: 900, zoom: 1.0 });
  return (
    <Shot f={f} cam={f < p.tilt ? cam : camUp} bg="#D9DEE5">
      <div style={box({ left: -400, top: -400, width: 1900, height: 3000, background: "linear-gradient(180deg, #E6E9EE, #D3D8E0)" })} />
      <div style={box({ left: -400, top: CAL_SCREEN.y + 640, width: 1900, height: 1400, backgroundColor: "#EFE9DD" })} />
      <CalendarScreen drag={drag} grab={grab} cursor={cur} touch={touch} />
      <Svg>
        <CarKeys x={890} y={1500} />
        <CloseHand x={touch.x + 10} y={touch.y + 175} angle={182} size={150} {...HANDS.dad} shape="point" />
      </Svg>
      <div style={box({ left: -400, top: -400, width: 1900, height: 3000, backgroundColor: TINT.cool })} />
    </Shot>
  );
};

export const WorkScene: React.FC = () => {
  const { f } = useScene("work");
  const p = usePlan(workPlan);
  const T = KM2_TEXT;
  let shot: React.ReactNode;
  if (f < p.dad) {
    const momPose = (t: number) => ({
      expr: "calm" as const,
      armL: { target: { x: 200 + 10 * Math.sin(t / 16), y: 960 + 14 * Math.sin(t / 21) }, shape: "point" as const, elbow: "down" as const },
      lookY: 0.05,
    });
    const momFace = (t: number) => keys(t, [[0, -0.35], [40, -0.35], [62, 0.5], [110, 0.5], [130, -0.3]]);
    shot = (
      <MeetingWide
        f={f}
        cam={camMove(f, 0, p.dad, { x: 640, y: 1100, zoom: 1.0 }, { x: 630, y: 1090, zoom: 1.06 })}
        clock={[14, 20]}
        mom={{ x: 360, pose: momPose, face: momFace }}
        colleagueTalk={(t) => (t > 70 && t < 110 ? 0.6 : 0)}
      />
    );
  } else if (f < p.keysShot) shot = <DadOffice f={f} p={p} />;
  else shot = <CalendarShot f={f} p={p} />;
  return (
    <>
      {shot}
      <TimeCaption text={T.earlier} t={f - 4} out={52} />
    </>
  );
};
