// Площадка предпросмотра (не кадр фильма): школьный двор, машина семьи
// (двери, посадка), улица. Композиция M13LabOutdoor:
//   npx remotion still src/index.ts M13LabOutdoor out.png --frame=N
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../fonts";
import { SceneContext } from "../context";
import { box, Grain, Shot } from "../kit";
import { Actor } from "../rig/Actor";
import { clamp } from "../rig/motion";
import { CAR_SCALE, H } from "../scenes/common";
import { CarSide, carSeatPlace } from "../props/Car";
import { SchoolYard, SchoolYardFront, SY_CAM, SY_POS } from "../sets/SchoolYard";
import { CityStreet, STREET, YardTurnTop } from "../sets/City";
import { ParkingLot, PK_CAM, PK_POS } from "../sets/Parking";
import { BeltClose, BuckleClose } from "../props/CarInterior";
import { C, F } from "../theme";

const r = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

type Sec = { readonly from: number; readonly len: number; readonly name: string; readonly draw: (t: number, f: number) => React.ReactNode };

const SECS: readonly Sec[] = [
  {
    from: 0,
    len: 60,
    name: "SchoolYard wide",
    draw: (t, f) => {
      const c = SY_POS.car;
      const S = CAR_SCALE * c.s;
      const fa = SY_POS.fatherWait;
      return (
        <Shot f={f} cam={SY_CAM.wide}>
          <SchoolYard
            door={r(t, 0.3, 0.6)}
            mid={
              <>
                <Actor uid="lo-son" look="m13Son" f={f} place={() => ({ x: SY_POS.door.x, y: SY_POS.door.y, h: H.son * SY_POS.door.s })} face={() => 0} seed={5} />
                <Actor uid="lo-fa" look="m13Director" f={f} place={() => ({ x: fa.x, y: fa.y, h: H.dad * fa.s })} face={() => -0.4} seed={3} />
              </>
            }
          />
          <CarSide x={c.x} y={c.y} s={S} layer="back" />
          <CarSide x={c.x} y={c.y} s={S} layer="body" />
          <SchoolYardFront />
        </Shot>
      );
    },
  },
  {
    from: 60,
    len: 60,
    name: "Car rear door + son seated",
    draw: (t, f) => {
      const S = CAR_SCALE;
      const cx = 760;
      const cy = 1700;
      const seat = carSeatPlace(cx, cy, S, "rear");
      const front = carSeatPlace(cx, cy, S, "front");
      return (
        <Shot f={f} cam={{ x: 560, y: 1300, zoom: 0.8 }}>
          <div style={box({ left: -1000, top: 0, width: 4000, height: 1700, backgroundColor: C.sky })} />
          <div style={box({ left: -1000, top: 1700, width: 4000, height: 800, backgroundColor: C.sidewalk })} />
          <CarSide x={cx} y={cy} s={S} layer="back" open={70 * r(t, 0.1, 0.4)} frontOpen={65 * r(t, 0.5, 0.8)} />
          <Actor uid="lo-dr" look="m13Director" f={f} place={() => ({ x: front.x, y: front.y, h: H.dad })} face={() => -0.9} pose={() => ({ sit: 1, seat: front.seat, armL: { target: { x: front.x + 200, y: front.y - 330 }, elbow: "down" }, armR: { target: { x: front.x + 210, y: front.y - 320 }, elbow: "down" } })} seed={3} />
          <Actor uid="lo-sn" look="m13Son" f={f} place={() => ({ x: seat.x, y: seat.y, h: H.son })} face={() => -0.9} pose={() => ({ sit: 1, seat: seat.seat, packOff: true })} seed={5} />
          <CarSide x={cx} y={cy} s={S} layer="body" open={70 * r(t, 0.1, 0.4)} frontOpen={65 * r(t, 0.5, 0.8)} />
          <CarSide x={cx} y={cy} s={S} layer="door" open={70 * r(t, 0.1, 0.4)} frontOpen={65 * r(t, 0.5, 0.8)} />
          <Actor uid="lo-dad" look="m13Director" f={f} place={() => ({ x: cx - 760, y: cy + 60, h: H.dad })} face={() => 0.6} seed={9} />
          <Actor uid="lo-son2" look="m13Son" f={f} place={() => ({ x: cx - 560, y: cy + 60, h: H.son })} face={() => 0.6} seed={8} />
        </Shot>
      );
    },
  },
  {
    from: 120,
    len: 60,
    name: "Street",
    draw: (t, f) => {
      const S = CAR_SCALE * 0.5;
      const cx = 520;
      const cy = STREET.road;
      const fr = carSeatPlace(cx, cy, S, "front");
      const rr = carSeatPlace(cx, cy, S, "rear");
      return (
        <CityStreet
          scroll={t * 1600}
          bcX={700}
          car={
            <>
              <CarSide x={cx} y={cy} s={S} layer="back" wheel={t * 1600} />
              <Actor uid="st-d" look="m13Director" f={f} place={() => ({ x: fr.x, y: fr.y, h: H.dad * 0.5 })} face={() => 0.9} pose={() => ({ sit: 1, seat: fr.seat })} seed={3} />
              <Actor uid="st-s" look="m13Son" f={f} place={() => ({ x: rr.x, y: rr.y, h: H.son * 0.5 })} face={() => 0.9} pose={() => ({ sit: 1, seat: rr.seat, packOff: true })} seed={5} />
              <CarSide x={cx} y={cy} s={S} layer="body" wheel={t * 1600} bounce={Math.sin(f * 0.8) * 1.2} />
            </>
          }
        />
      );
    },
  },
  { from: 180, len: 60, name: "YardTurnTop", draw: (t) => <YardTurnTop u={t} /> },
  {
    from: 240,
    len: 60,
    name: "Parking",
    draw: (t, f) => {
      const c = PK_POS.car;
      const S = CAR_SCALE * c.s;
      const fr = carSeatPlace(c.x, c.y, S, "front", 1);
      return (
        <Shot f={f} cam={PK_CAM.wide}>
          <ParkingLot
            mid={
              <>
                <CarSide x={c.x} y={c.y} s={S} layer="back" dir={1} frontOpen={65 * r(t, 0.3, 0.6)} />
                <Actor uid="pk-d" look="m13Director" f={f} place={() => ({ x: fr.x, y: fr.y, h: H.dad * c.s })} face={() => -0.9} pose={() => ({ sit: 1, seat: fr.seat, armR: { target: { x: fr.x + 20, y: fr.y - 330 * c.s }, elbow: "front", item: "phone", shape: "phone" } })} seed={3} />
                <CarSide x={c.x} y={c.y} s={S} layer="body" dir={1} frontOpen={65 * r(t, 0.3, 0.6)} />
                <CarSide x={c.x} y={c.y} s={S} layer="door" dir={1} frontOpen={65 * r(t, 0.3, 0.6)} />
              </>
            }
          />
        </Shot>
      );
    },
  },
  { from: 300, len: 80, name: "BeltClose", draw: (t, f) => <BeltClose f={f} pull={r(t, 0.05, 0.7)} click={r(t, 0.72, 0.85)} release={r(t, 0.86, 1)} look={r(t, 0.1, 0.4) - r(t, 0.85, 1)} /> },
  { from: 380, len: 40, name: "BuckleClose", draw: (t) => <BuckleClose insert={r(t, 0, 0.6) * 1.1} release={r(t, 0.7, 1)} /> },
];

export const LabOutdoor: React.FC = () => {
  const f = useCurrentFrame();
  const sec = SECS.find((s) => f >= s.from && f < s.from + s.len) ?? SECS[SECS.length - 1];
  const t = clamp((f - sec.from) / Math.max(1, sec.len - 1));
  return (
    <SceneContext.Provider value={{ from: 0, to: 600 }}>
      <AbsoluteFill style={{ backgroundColor: C.paper, overflow: "hidden" }}>
        {sec.draw(t, f)}
        <Grain />
        <div style={box({ left: 24, top: 24, padding: "6px 14px", borderRadius: 10, backgroundColor: "rgba(23,42,70,0.55)", color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 30 })}>{`${sec.name} · ${f}`}</div>
      </AbsoluteFill>
    </SceneContext.Provider>
  );
};
