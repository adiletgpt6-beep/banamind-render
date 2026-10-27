// Разговор у детского стола (сцены 2 и 9 — одно и то же место, те же
// положения: дочка сидит за столом, мама присела слева, на высоте глаз
// ребёнка). Здесь — общие части: фон, стол, персонажи, план через плечо.
import { Actor, type PoseIn, type Place } from "../rig/Actor";
import { box, Svg } from "../kit";
import { C } from "../theme";
import { ROOM, RoomBack, RoomChairBack, RoomDesk, Stool } from "../sets/Home";
import { H, seatOf } from "./common";
import { Desk, onSheet, SheetTop, TOP } from "./CalendarTop";
import { CAL_POINTS } from "../props/Calendar";

export const GIRL_AT_DESK: Place = { x: ROOM.chair.x, y: ROOM.floorY, h: H.girl };
export const MOM_CROUCH_X = ROOM.stool.x;

// Дочка за столом: рука придерживает лист на столе.
export const girlDeskPose = (over: Partial<PoseIn> = {}): PoseIn => ({
  sit: 1,
  seat: seatOf(H.girl, true),
  expr: "calm",
  armL: { target: { x: ROOM.sheet.x - 10, y: ROOM.desk.top + 4 }, shape: "relax", elbow: "down", behind: false },
  armR: { target: { x: ROOM.sheet.x + 150, y: ROOM.desk.top + 6 }, shape: "relax", elbow: "down", behind: false },
  ...over,
});

export const DeskSet: React.FC<{
  readonly f: number;
  readonly mom: { place: (t: number) => Place; face: (t: number) => number; pose: (t: number) => PoseIn; walkFrom?: number };
  readonly girl: { face: (t: number) => number; pose: (t: number) => PoseIn };
  readonly warm?: number;
}> = ({ f, mom, girl, warm = 0 }) => (
  <>
    <RoomBack warm={warm} />
    <RoomChairBack />
    <Stool />
    <Actor uid="desk-girl" look="su2GirlHome" f={f} place={() => GIRL_AT_DESK} face={girl.face} pose={girl.pose} role="daughter" seed={7} blinkShift={23} layer="body" />
    <RoomDesk />
    <Actor uid="desk-girl" look="su2GirlHome" f={f} place={() => GIRL_AT_DESK} face={girl.face} pose={girl.pose} role="daughter" seed={7} blinkShift={23} layer="arms" />
    <Actor uid="desk-mom" look="su2MomHome" f={f} place={mom.place} face={mom.face} pose={mom.pose} role="mother" seed={5} walkFrom={mom.walkFrom} />
  </>
);

// План через плечо мамы: лист сверху на столе, на переднем плане — мягко
// размытые затылок и плечо мамы (слева внизу).
export const OverShoulder: React.FC<{ readonly ring3?: number; readonly ray?: number; readonly play?: number; readonly who?: "mom" | "dad" }> = ({ ring3 = 0, ray = 1, play = 0, who = "mom" }) => {
  const hair = who === "mom" ? "#2A201D" : "#1F1A19";
  const cloth = who === "mom" ? "#34477E" : "#8FAFC8";
  return (
    <>
      <Desk />
      <SheetTop ring3={ring3} ray={ray} play={play} />
      <div style={box({ left: -260, top: TOP.y + 980, width: 900, height: 1300, filter: "blur(9px)", opacity: 0.96 })}>
        <Svg>
          <path d="M -100 1300 L -100 640 Q 120 470 420 520 Q 700 560 820 760 L 860 1300 Z" fill={cloth} />
          <ellipse cx={250} cy={420} rx={170} ry={200} fill={hair} />
          <ellipse cx={395} cy={470} rx={46} ry={64} fill={who === "mom" ? "#D29B74" : "#C5906B"} />
        </Svg>
      </div>
    </>
  );
};

export const OUR_SUNDAY_TOP = onSheet(CAL_POINTS.ourSunday);
export const DRAWING_TOP = onSheet(CAL_POINTS.drawing);
export const DAD_FIG_TOP = onSheet(CAL_POINTS.dadFigure);
export { C };
