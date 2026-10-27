// Фронтальный план комнаты Аяна (см. sets/Room.tsx). Порядок слоёв:
// стена → стулья → тела сидящих за столом → столешница и предметы на ней
// → кисти сидящих → стоящая у края стола мама (целиком, ближе к зрителю).
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import type { Te2Role } from "../script";
import { type Cam, Shot } from "../kit";
import { C } from "../theme";
import { BoxFront, ChairFront, ComicFront, DeskFront, FRONT, FrontEnvelopes, LampFront, PenFront, RoomBack, toFront, type EnvState } from "../sets/Room";
import { H, seatOf } from "./common";

export type ActorSpec = {
  readonly uid: string;
  readonly look: LookId;
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  readonly role?: Te2Role;
  readonly seed: number;
  readonly blinkShift?: number;
  readonly walkFrom?: number;
};

export const Act: React.FC<{ s: ActorSpec; f: number; layer: "all" | "body" | "arms" }> = ({ s, f, layer }) => (
  <Actor uid={s.uid} look={s.look} f={f} place={s.place} face={s.face} pose={s.pose} role={s.role} seed={s.seed} blinkShift={s.blinkShift} walkFrom={s.walkFrom} layer={layer} />
);

// Места.
export const AYAN_SEAT: Place = { x: FRONT.ayanX, y: FRONT.ayanFloor, h: H.ayan };
export const MOM_STAND: Place = { x: FRONT.momStandX, y: FRONT.floor, h: H.mom };
export const MOM_SEAT: Place = { x: FRONT.momSeatX, y: FRONT.ayanFloor, h: H.mom * 0.97 };
export const AYAN_SEAT_H = seatOf(H.ayan, true) + 56; // подушка на стуле: локти на уровне столешницы
export const MOM_SEAT_H = seatOf(H.mom * 0.97);

// Точка на столешнице (вид сверху → фронтальный план) для кистей.
export const onDesk = (ox: number, oy: number, dy = -4) => {
  const p = toFront(ox, oy);
  return { x: p.x, y: p.y + dy };
};

// Аян за столом: сидит, кисти на столешнице, корпус чуть вперёд.
export const ayanSeated = (o: Partial<PoseIn> = {}): PoseIn => ({
  sit: 1,
  seat: AYAN_SEAT_H,
  lean: 6,
  lookY: 0.4,
  armL: { target: onDesk(1330, 1600), shape: "relax", elbow: "down" },
  armR: { target: onDesk(930, 1600), shape: "relax", elbow: "down" },
  ...o,
});

// Камеры фронтального плана.
export const ROOM_CAM = {
  two: { x: 720, y: 1090, zoom: 1.45 },
  twoSeated: { x: 690, y: 1150, zoom: 1.55 },
  ayan: { x: 560, y: 1150, zoom: 2.45 },
  mom: { x: 960, y: 960, zoom: 2.15 },
  momSeated: { x: 790, y: 1090, zoom: 2.3 },
  calendar: { x: 740, y: 770, zoom: 2.3 },
  wide: { x: 760, y: 1060, zoom: 1.05 },
} as const;

export const RoomFront: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly ayan?: ActorSpec;
  readonly mom?: ActorSpec; // стоит у стола справа (ближе к зрителю)
  readonly momSeated?: ActorSpec; // сидит за столом рядом с Аяном
  readonly momBack?: ActorSpec; // в дверном проёме (за столом)
  readonly momChairX?: number | null; // где стоит второй стул (null — нет)
  readonly items: readonly EnvState[];
  readonly boxInside?: number;
  readonly door?: number;
  readonly onTop?: React.ReactNode; // предметы на столешнице поверх конвертов
  readonly over?: React.ReactNode;
  readonly comic?: boolean;
  readonly pen?: boolean;
}> = ({ f, cam, ayan, mom, momSeated, momBack, momChairX = null, items, boxInside = 0, door = 0, onTop, over, comic = true, pen = true }) => (
  <Shot f={f} cam={cam} bg={C.wallNight}>
    <RoomBack door={door} />
    {momBack ? <Act s={momBack} f={f} layer="all" /> : null}
    {momChairX !== null ? <ChairFront x={momChairX} h={430} color="#9A765A" /> : null}
    <ChairFront x={FRONT.ayanX} />
    {momSeated ? <Act s={momSeated} f={f} layer="body" /> : null}
    {ayan ? <Act s={ayan} f={f} layer="body" /> : null}
    <DeskFront>
      <LampFront />
      <BoxFront inside={boxInside} />
      {comic ? <ComicFront /> : null}
      {pen ? <PenFront /> : null}
      <FrontEnvelopes items={items} />
      {onTop}
    </DeskFront>
    {ayan ? <Act s={ayan} f={f} layer="arms" /> : null}
    {momSeated ? <Act s={momSeated} f={f} layer="arms" /> : null}
    {mom ? <Act s={mom} f={f} layer="all" /> : null}
    {over}
  </Shot>
);
