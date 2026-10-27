// Сцена 18. Приглашение теперь с именем. Перед сном: Эмир сидит на краю
// кровати, папа заходит и останавливается у его стола. Над столом на
// пробковой доске — тот же лист с «Азамат», рядом та же фотография из
// класса, под ней детская подпись «Менин атам — инженер». F07 — папа с
// лёгкой улыбкой; S04 — сын спокойно и уверенно. Папа смотрит на имя,
// затем на сына; мальчик улыбается. Последний человеческий образ —
// заполненное приглашение и фото (крупно, ≈ 2 с без слов).
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, keys, lerp } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C, F } from "../theme";
import { IW2_TEXT } from "../script";
import { InvitationArt } from "../props/Invitation";
import { PhotoArt } from "../props/ClassPhoto";
import { ToyCar } from "../props/ToyCar";
import { ROOM, RoomBack, RoomDesk } from "../sets/Home";
import { H } from "./common";

export const bedtimePlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "bedtime");
  const s04End = T.to("S04");
  return { walk: [4, 60] as const, see: 66, f07: T.from("F07"), f07End: T.to("F07"), s04: T.from("S04"), s04End, toName: s04End + 2, toSon: s04End + 18, board: s04End + 30, len: T.len };
};

// Доска (мир): лист, фото, подпись; машинка на столе.
export const BOARD = { inv: { x: 590, y: 790, w: 210 }, photo: { x: 830, y: 720, w: 230 }, caption: { x: 830, y: 880 } } as const;
export const DESK_CAR = { x: 880, y: ROOM.deskTop } as const;

const EMIR: Place = { x: 330, y: ROOM.floorY, h: H.boy };
const BED_SEAT = 200;

export const BoardItems: React.FC = () => (
  <>
    <Svg>
      <g transform={`translate(${BOARD.inv.x} ${BOARD.inv.y}) rotate(-3)`}>
        <InvitationArt w={BOARD.inv.w} name={1} />
        <circle cx={0} cy={-BOARD.inv.w * 0.62} r={7} fill={C.coral} />
      </g>
      <g transform={`translate(${BOARD.photo.x} ${BOARD.photo.y}) rotate(3)`}>
        <PhotoArt w={BOARD.photo.w} uid="bt18" />
        <circle cx={0} cy={-BOARD.photo.w * 0.36} r={7} fill={C.blue} />
      </g>
    </Svg>
    <div style={box({ left: BOARD.caption.x - 130, top: BOARD.caption.y, width: 260, padding: "10px 6px", backgroundColor: C.sheet, transform: "rotate(-1.5deg)", textAlign: "center", fontFamily: F.text, fontWeight: 500, fontSize: 25, color: C.pencil, boxShadow: "3px 4px 0 rgba(23,23,23,0.12)" })}>{IW2_TEXT.caption}</div>
  </>
);

export const BedtimeScene: React.FC = () => {
  const { f } = useScene("bedtime");
  const p = usePlan(bedtimePlan);
  const dadPlace = (tt: number): Place => ({ x: lerp(1300, 1030, cruise(clamp((tt - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3)), y: ROOM.floorY + 20, h: H.dad });
  const lookName = (tt: number) => tt >= p.see && tt < p.f07 - 6 ? 1 : tt >= p.toName && tt < p.toSon ? 1 : 0;
  const dadPose = (tt: number) => ({
    expr: tt < p.see ? ("calm" as const) : ("softSmile" as const),
    lookX: lookName(tt) ? -0.1 : -0.6,
    lookY: lookName(tt) ? -0.45 : 0.25,
    armL: { target: null, shape: "relax" as const },
    armR: { target: null, shape: "relax" as const },
  });
  const sonPose = (tt: number) => ({
    sit: 1,
    seat: BED_SEAT,
    expr: tt >= p.toSon ? ({ browIn: 3, browOut: 4, lid: 0.1, smile: 1 } as const) : tt >= p.s04 - 6 ? ("smile" as const) : ("softSmile" as const),
    lookX: 0.5,
    lookY: -0.2,
    armL: { target: { x: 290, y: ROOM.floorY - BED_SEAT - 14 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: 385, y: ROOM.floorY - BED_SEAT - 14 }, shape: "relax" as const, elbow: "down" as const, behind: false },
  });
  const boardCam = f >= p.board;
  const cam = boardCam ? { x: 720, y: 800, zoom: keys(f, [[p.board, 2.0], [p.len, 2.1]]) } : { x: 680, y: 1160, zoom: keys(f, [[0, 1.16], [p.f07, 1.2]]) };
  return (
    <Shot f={f} cam={cam} bg="#F4E4C6">
      <RoomBack />
      <BoardItems />
      {/* кровать */}
      <div style={box({ left: -60, top: ROOM.floorY - BED_SEAT - 60, width: 520, height: 260, backgroundColor: C.navySoft, borderRadius: 24 })} />
      <div style={box({ left: -60, top: ROOM.floorY - BED_SEAT - 80, width: 520, height: 60, backgroundColor: C.sheet, borderRadius: 24 })} />
      <RoomDesk />
      <Svg>
        <ToyCar x={DESK_CAR.x} y={DESK_CAR.y} len={110} />
      </Svg>
      <Actor uid="bt18-emir" look="emir" f={f} place={() => EMIR} face={() => 0.45} pose={sonPose} role="son" seed={4} blinkShift={37} />
      <Actor uid="bt18-dad" look="azamat" f={f} place={dadPlace} face={(tt) => (tt < p.walk[1] ? -0.6 : -0.5)} pose={dadPose} role="father" seed={2} walkFrom={0} />
    </Shot>
  );
};
