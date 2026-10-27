// Сцена 16. Родители решают практический вопрос. Вечер, тот же стол. Мама и
// папа рядом; на краю — фотография из класса, в центре — телефон мамы и
// лист с недельным расписанием. M01 — мама; F06 — папа соглашается. После
// реплик мама берёт телефон и открывает поиск, папа наклоняется к экрану —
// зритель видит, кто начинает действие.
import { type Place } from "../rig/Actor";
import { anticipate, clamp, keys, keysV } from "../rig/motion";
import { Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { PhotoArt } from "../props/ClassPhoto";
import { CHAIR_SEAT, HOME, OnTable } from "../sets/Home";
import { HomeShot } from "./HomeShot";
import { H } from "./common";

export const parentsPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "parents");
  const f06End = T.to("F06");
  return { m01: T.from("M01"), m01End: T.to("M01"), f06: T.from("F06"), f06End, grab: [f06End + 6, f06End + 22] as const, lean: f06End + 26, len: T.len };
};

const MOM: Place = { x: 420, y: HOME.seatY, h: H.mom };
const DAD: Place = { x: 700, y: HOME.seatY, h: H.dad };
export const PHONE_ON_TABLE = { x: 520, y: 1272 } as const;
export const PHOTO_ON_TABLE = { x: 290, y: 1268 } as const;
export const PARENTS_CAM = { x: 520, y: 1080, zoom: 1.75 } as const;

export const ParentsScene: React.FC = () => {
  const { f } = useScene("parents");
  const p = usePlan(parentsPlan);
  const holding = f >= p.grab[0] + 8;
  const momPose = (tt: number) => {
    const h = tt >= p.grab[0] + 8;
    return {
      sit: 1,
      seat: CHAIR_SEAT,
      turnBody: 0.5,
      expr: tt < p.m01 - 6 ? ("calm" as const) : ("softSmile" as const),
      lookX: h ? -0.1 : tt > p.m01End ? 0.4 : 0.3,
      lookY: h ? 0.55 : tt < p.m01 ? 0.45 : 0.1,
      armR: { target: keysV(tt, [[p.grab[0], { x: 470, y: 1262 }], [p.grab[0] + 8, PHONE_ON_TABLE], [p.grab[1], { x: 500, y: 1150 }]], anticipate), shape: h ? ("phone" as const) : ("relax" as const), item: h ? ("phone" as const) : ("none" as const), itemColor: C.navy, glow: h ? clamp((tt - p.grab[1]) / 6) : 0, elbow: "down" as const, behind: false },
      armL: { target: { x: 370, y: 1264 }, shape: "relax" as const, elbow: "down" as const },
    };
  };
  const dadPose = (tt: number) => ({
    sit: 1,
    seat: CHAIR_SEAT,
    turnBody: 0.5,
    lean: keys(tt, [[p.lean, 6], [p.lean + 16, 16]]),
    expr: tt < p.m01End ? ("calm" as const) : ("softSmile" as const),
    lookX: tt >= p.lean ? -0.6 : -0.35,
    lookY: tt >= p.lean ? 0.5 : tt < p.m01 ? 0.45 : 0.1,
    nod: keys(tt, [[p.f06 - 6, 0], [p.f06 + 2, 4], [p.f06 + 14, 0]]),
    armL: { target: { x: 640, y: 1264 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: 760, y: 1264 }, shape: "relax" as const, elbow: "down" as const },
  });
  return (
    <HomeShot
      f={f}
      cam={{ ...PARENTS_CAM, zoom: keys(f, [[0, PARENTS_CAM.zoom], [p.len, 1.88]]) }}
      chairs={[{ x: MOM.x }, { x: DAD.x }]}
      actors={[
        { uid: "pa16-mom", look: "mama", place: () => MOM, face: (tt) => (tt >= p.grab[0] + 8 ? 0.2 : 0.4), pose: momPose, role: "mother", seed: 5, blinkShift: 19 },
        { uid: "pa16-dad", look: "azamat", place: () => DAD, face: (tt) => (tt >= p.lean ? -0.55 : -0.42), pose: dadPose, role: "father", seed: 2 },
      ]}
      onTable={
        <>
          {/* фотография из класса на краю стола */}
          <Svg>
            <g transform={`translate(${PHOTO_ON_TABLE.x} ${PHOTO_ON_TABLE.y}) scale(1 0.42) rotate(-5)`}>
              <PhotoArt w={150} uid="pa16" />
            </g>
          </Svg>
          {/* расписание недели */}
          <OnTable x={640} y={1270} rot={3}>
            <rect x={-80} y={-105} width={160} height={210} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={3} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={-60} y={-80 + i * 36} width={i % 2 ? 90 : 120} height={14} fill={C.navy} opacity={0.65} />
            ))}
          </OnTable>
          {holding ? null : (
            <OnTable x={PHONE_ON_TABLE.x} y={PHONE_ON_TABLE.y} rot={8}>
              <rect x={-40} y={-74} width={80} height={148} rx={14} fill={C.navy} />
              <rect x={-34} y={-66} width={68} height={132} rx={9} fill="#2C3B5C" />
            </OnTable>
          )}
        </>
      }
    />
  );
};
