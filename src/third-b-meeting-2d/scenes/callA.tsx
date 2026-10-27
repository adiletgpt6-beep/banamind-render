// Ракурс A во время звонка: мама смотрит в экран и говорит, дочка рядом.
// Лист «3 Б» в руках дочки — в мировых координатах кадра: lift 0 — лежит
// у неё на коленях, 1 — поднят рядом с лицом мамы (лицо не закрыто),
// лицевой стороной к маме и ноутбуку (а значит, и к его камере).
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, lerp } from "../rig/motion";
import type { PoseIn } from "../rig/Actor";
import { ClassDrawing, SHEET } from "../props/Drawing";
import { CabinA, KYZ_A, KYZ_SEAT, MOM_KEYS, MOM_SEAT } from "./cabinA";
import { box } from "../kit";
import { C } from "../theme";

export const sheetA = (lift: number) => {
  const u = easeInOut(clamp(lift));
  return { x: lerp(335, 470, u), y: lerp(1290, 990, u), w: lerp(260, 300, u), rot: lerp(-4, -7, u), flat: lerp(0.45, 1, u) };
};
// точки, за которые держат лист: левый край и нижний край
const holdPts = (lift: number) => {
  const s = sheetA(lift);
  const h = (s.w * SHEET.h) / SHEET.w;
  return { left: { x: s.x - s.w / 2 - 6, y: s.y + 10 }, bottom: { x: s.x + s.w * 0.12, y: s.y + (h * s.flat) / 2 + 8 } };
};

export const SheetInA: React.FC<{ readonly lift: number; readonly uid: string }> = ({ lift, uid }) => {
  const s = sheetA(lift);
  const k = s.w / SHEET.w;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${s.x} ${s.y}) rotate(${s.rot}) scale(${k} ${k * s.flat}) translate(${-SHEET.w / 2} ${-SHEET.h / 2})`}>
        <ClassDrawing id={`${uid}-a`} />
      </g>
    </svg>
  );
};

// Альбом на коленях дочки (вид A): твёрдая обложка, толщина, край страниц.
export const AlbumOnLap: React.FC<{ readonly o?: number; readonly open?: number }> = ({ o = 1, open = 0 }) => (
  <div style={box({ left: 220, top: 1268, width: 230, height: 70, opacity: o })}>
    <div style={box({ left: 0, top: 10, width: 230, height: 54, borderRadius: 6, backgroundColor: "#F5EFE2" })} />
    <div style={box({ left: 0, top: 0, width: 230 * (1 - open * 0.5), height: 50, borderRadius: 6, backgroundColor: C.amber, borderBottom: "6px solid #C9732F" })} />
  </div>
);

export type CallAProps = {
  readonly f: number;
  readonly uid: string;
  readonly lift?: number;
  readonly mom?: (t: number) => PoseIn;
  readonly momFace?: (t: number) => number;
  readonly kyz?: (t: number) => PoseIn;
  readonly kyzFace?: (t: number) => number;
  readonly album?: number; // 0…1 альбом на коленях
  readonly laptop?: number;
  readonly cam?: { x: number; y: number; zoom: number };
  readonly sample?: number; // 0…1 образец в руке мамы поднят
  readonly momPlace?: (t: number) => { x: number; y: number; h: number };
};

export const momCallPose = (extra: PoseIn = {}): PoseIn => ({
  sit: 1,
  seat: MOM_SEAT,
  expr: "calm",
  lookY: 0.35,
  armL: { target: MOM_KEYS.l, elbow: "down" },
  armR: { target: MOM_KEYS.r, elbow: "down" },
  ...extra,
});

export const kyzSeatPose = (lift: number, extra: PoseIn = {}): PoseIn => {
  const hp = holdPts(lift);
  const holding = lift > 0.02;
  return {
    sit: 1,
    seat: KYZ_SEAT,
    packOff: true,
    expr: "calm",
    lookY: 0.15,
    armL: { target: holding ? hp.left : { x: KYZ_A.x - 60, y: 1300 }, shape: holding ? "pinch" : "relax", elbow: "down", behind: false },
    armR: { target: holding ? hp.bottom : { x: KYZ_A.x + 50, y: 1300 }, shape: holding ? "pinch" : "relax", elbow: "down", behind: false },
    ...extra,
  };
};

export const CallA: React.FC<CallAProps> = ({ f, uid, lift = 0, mom, momFace, kyz, kyzFace, album = 0, laptop = 1, cam, sample = 0, momPlace }) => (
  <CabinA
    momPlace={momPlace}
    f={f}
    uid={uid}
    cam={cam}
    laptop={laptop}
    momPose={mom ?? (() => momCallPose())}
    momFace={momFace ?? (() => 0)}
    kyzPose={kyz ?? (() => kyzSeatPose(lift))}
    kyzFace={kyzFace ?? (() => 0.2)}
    extra={
      <>
        {album > 0 ? <AlbumOnLap o={album} open={lift > 0 ? 1 : 0} /> : null}
        {lift > 0.001 ? <SheetInA lift={lift} uid={uid} /> : null}
        {sample > 0 ? (
          <div style={box({ left: 840, top: lerp(1420, 1120, easeInOut(sample)), width: 120, height: 90, borderRadius: 8, backgroundColor: C.bulakA, borderTop: "26px solid #C9A47A", boxSizing: "border-box" })} />
        ) : null}
      </>
    }
  />
);

export { Actor };
