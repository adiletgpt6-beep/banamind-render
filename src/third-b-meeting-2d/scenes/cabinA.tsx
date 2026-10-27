// Ракурс A (салон спереди, камера смотрит назад) — общий для сцен 5–12.
// Мама — заднее левое место (справа в кадре), ноутбук лежит у неё на
// коленях: зритель видит наружную крышку, экран повёрнут к маме и чуть к
// дочке (камера ноутбука захватывает край соседнего места). Дочка — заднее
// правое место (слева в кадре) на бустере, пристёгнута.
import { Actor, type PoseIn } from "../rig/Actor";
import { box, Shot } from "../kit";
import { LaptopFront } from "../props/Laptop";
import { CABIN, Belt, CabinCushion, CabinFrontEdges, CabinRearBack, seatH } from "../sets/Cabin";

export const MOM_A = { x: CABIN.mom.x, y: CABIN.mom.floor, h: CABIN.mom.h };
export const KYZ_A = { x: CABIN.kyz.x, y: CABIN.kyz.floor, h: CABIN.kyz.h };
export const MOM_SEAT = seatH(CABIN.mom.floor, CABIN.cushionY);
export const KYZ_SEAT = seatH(CABIN.kyz.floor, CABIN.boosterTop);
export const LAPTOP_A = { x: 735, y: 1470, w: 500 } as const;
// точки рук мамы на клавиатуре (за крышкой) и у тачпада
export const MOM_KEYS = { l: { x: 640, y: 1440 }, r: { x: 830, y: 1442 } } as const;
// плечо дочки (ремень идёт через него к замку)
export const KYZ_SHOULDER = { x: 290, y: 1010 } as const;

export type CabinAProps = {
  readonly f: number;
  readonly uid: string;
  readonly momPose: (t: number) => PoseIn;
  readonly momFace: (t: number) => number;
  readonly momPlace?: (t: number) => { x: number; y: number; h: number };
  readonly kyzPose?: (t: number) => PoseIn;
  readonly kyzFace?: (t: number) => number;
  readonly kyzPlace?: (t: number) => { x: number; y: number; h: number };
  readonly kyz?: boolean;
  readonly belt?: number; // 0 — не пристёгнута, 1 — пристёгнута; между — лента в руке
  readonly beltHand?: { x: number; y: number };
  readonly laptop?: number; // 0 — закрыт, 1 — открыт; < 0 — ноутбука нет
  readonly street?: number;
  readonly cam?: { x: number; y: number; zoom: number };
  readonly extra?: React.ReactNode; // предметы поверх (альбом и т. п.)
};

export const CabinA: React.FC<CabinAProps> = ({ f, uid, momPose, momFace, momPlace, kyzPose, kyzFace, kyzPlace, kyz = true, belt = 1, beltHand, laptop = 1, street = 0, cam = { x: 540, y: 960, zoom: 1 }, extra }) => {
  const mp = momPlace ?? (() => MOM_A);
  const kp = kyzPlace ?? (() => KYZ_A);
  return (
    <Shot f={f} cam={cam} bg="#3D4350">
      <CabinRearBack street={street} />
      <CabinCushion />
      {kyz ? <Actor uid={`${uid}-kyz`} look="kyz" f={f} place={kp} face={kyzFace ?? (() => 0.35)} pose={kyzPose} role="daughter" seed={4} blinkShift={37} /> : null}
      {kyz && belt > 0 ? (
        belt >= 1 ? (
          <Belt anchor={CABIN.beltAnchor} via={{ x: KYZ_SHOULDER.x + 10, y: KYZ_SHOULDER.y + 40 }} to={CABIN.buckle} lap={{ x: 210, y: 1330 }} />
        ) : beltHand ? (
          <Belt anchor={CABIN.beltAnchor} to={beltHand} />
        ) : null
      ) : null}
      <Actor uid={`${uid}-mom`} look="aizhan" f={f} place={mp} face={momFace} pose={momPose} role="mother" seed={5} />
      {laptop >= 0 ? <LaptopFront x={LAPTOP_A.x} y={LAPTOP_A.y} w={LAPTOP_A.w} open={laptop} /> : null}
      {extra}
      <CabinFrontEdges />
      <div style={box({ left: 0, top: 0 })} />
    </Shot>
  );
};
