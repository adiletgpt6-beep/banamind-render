// Рабочий лист «Гостиная» (№34): весь мир комнаты днём и вечером, посадка
// героев на диван, кресло, стул и у торца стола, ноутбук с экраном.
import { useCurrentFrame } from "remotion";
import { Actor, type PoseIn } from "../rig/Actor";
import { Shot, type Cam } from "../kit";
import { Laptop, LAPTOP_DESIGN } from "../props/Laptop";
import { BunnyProp } from "../props/Bunny";
import { Armchair, CaregiverBag, CoffeeTable, DayLight, DiningTable, EveningLight, FloorLamp, LIVING, LivingBack, PlantStand, Sofa, Toys, WoodChair } from "../sets/Living";
import { DevSheet } from "./DevSheet";

const L = LIVING;

const Screen: React.FC = () => (
  <div style={{ width: LAPTOP_DESIGN.w, height: LAPTOP_DESIGN.h, backgroundColor: "#F7F5EF", position: "relative" }}>
    <div style={{ position: "absolute", left: 360, top: 90, width: 880, height: 820, backgroundColor: "#FFFFFF", borderRadius: 40, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
      <div style={{ margin: 60, height: 70, width: 560, borderRadius: 14, backgroundColor: "#17263D" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ marginLeft: 60, marginTop: 34, height: 34, width: 640 - i * 80, borderRadius: 10, backgroundColor: "#C9D0DC" }} />
      ))}
      <div style={{ margin: "40px 60px", height: 170, borderRadius: 20, backgroundColor: "#FFEBC4", borderLeft: "16px solid #E8A23A" }} />
    </div>
  </div>
);

export const SheetLiving: React.FC = () => {
  const f = useCurrentFrame();
  const ev = f >= 180 ? 1 : 0;
  const cam: Cam =
    f < 60 ? { x: 1350, y: 1080, zoom: 0.4 } : f < 120 ? { x: 1880, y: 1200, zoom: 0.78 } : f < 180 ? { x: 960, y: 1180, zoom: 1.05 } : f < 240 ? { x: 1350, y: 1080, zoom: 0.4 } : { x: 700, y: 1150, zoom: 0.8 };
  const sit = (seat: number, extra: PoseIn = {}) => (): PoseIn => ({ sit: 1, seat, expr: "softSmile", ...extra });
  const mom = { x: L.momSeat.x, y: L.feetY, h: 760 };
  const momOnTable: PoseIn = {
    sit: 1,
    seat: L.momSeat.seat,
    expr: "calm",
    lookY: 0.35,
    armL: { target: { x: 980, y: L.table.top - 16 }, shape: "relax", elbow: "down" },
    armR: { target: { x: 1040, y: L.table.top - 12 }, shape: "relax", elbow: "down" },
  };
  return (
    <DevSheet>
      <Shot f={f} cam={cam}>
        <LivingBack evening={ev} bookOnShelf />
        {!ev ? <DayLight /> : null}
        <PlantStand evening={ev} />
        <FloorLamp on={ev} />
        <Sofa evening={ev} cushion={f > 90 ? { x: 1400, y: L.sofa.seatY - 80, rot: 8 } : undefined} />
        <Armchair evening={ev} />
        <WoodChair x={L.dadChair.x} evening={ev} />
        <WoodChair x={L.momSeat.x + 20} evening={ev} back="right" />
        <CaregiverBag />
        {/* мама у торца стола: тело, стол, ноутбук, руки */}
        <Actor uid="sl-mom" look="mom" f={f} place={() => (f < 60 || (f >= 120 && f < 240) ? mom : { ...mom, x: L.armchair.seatX })} face={() => (f < 60 || (f >= 120 && f < 240) ? -0.75 : -0.3)} pose={() => (f < 60 || (f >= 120 && f < 240) ? momOnTable : { sit: 1, seat: L.armchair.seat, expr: "softSmile" })} layer="body" seed={1} />
        <DiningTable evening={ev} />
        <Laptop x={L.laptop.x} y={L.laptop.y} screen={<Screen />} />
        <Actor uid="sl-mom" look="mom" f={f} place={() => (f < 60 || (f >= 120 && f < 240) ? mom : { ...mom, x: L.armchair.seatX })} face={() => (f < 60 || (f >= 120 && f < 240) ? -0.75 : -0.3)} pose={() => (f < 60 || (f >= 120 && f < 240) ? momOnTable : { sit: 1, seat: L.armchair.seat, expr: "softSmile" })} layer="arms" seed={1} />
        <Actor uid="sl-cg" look="caregiver" f={f} place={() => ({ x: L.sofa.seats[0], y: L.feetY, h: 750 })} face={() => 0.4} pose={sit(L.sofa.seat)} seed={3} />
        <Actor uid="sl-son" look="son" f={f} place={() => ({ x: L.sofa.seats[1], y: L.feetY, h: 560 })} face={() => -0.4} pose={sit(L.sofa.seat, { legSwing: Math.sin(f / 9) * 0.6 })} seed={4} />
        <Actor uid="sl-dad" look="dad" f={f} place={() => ({ x: L.dadChair.x, y: L.feetY, h: 790 })} face={() => -0.6} pose={sit(L.dadChair.seat)} seed={2} />
        <Toys />
        <Actor uid="sl-td" look="toddler" f={f} place={() => ({ x: 1640, y: L.frontY, h: 380 })} face={() => 0.3} pose={() => ({ expr: "smile" })} seed={5} />
        <BunnyProp x={1720} y={L.frontY} s={1.1} rot={-10} />
        <CoffeeTable evening={ev} phone />
        {ev ? <EveningLight /> : null}
      </Shot>
    </DevSheet>
  );
};
