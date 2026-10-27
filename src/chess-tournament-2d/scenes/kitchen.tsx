// Кухня во фронтальном плане (сцены 5, 6, 7, 11): люди сидят за столом
// лицом к камере, спинки стульев за ними, кисти и предметы — поверх
// столешницы. Порядок слоёв: стена → спинки → тела → стол → предметы →
// передние руки → стоящие у стола.
import { Actor, type Place } from "../rig/Actor";
import { type Cam, Shot } from "../kit";
import { KITCHEN, KitchenBack, KitchenChairBack, KitchenTable } from "../sets/Home";
import { H } from "./common";
import type { ActorSpec } from "./shots";

// Места за кухонным столом.
export const K_SEAT = { mom: 330, girl: 560, dad: 790 } as const;
export const K_SEAT_H = { adult: 216, girl: 262 } as const;
export const K_TABLE_Y = KITCHEN.tableTop - 4; // уровень кистей на столе
export const seatPlace = (x: number, h: number): Place => ({ x, y: KITCHEN.floorY, h });
export const K_PLACE = {
  mom: seatPlace(K_SEAT.mom, H.mom),
  girl: seatPlace(K_SEAT.girl, H.girl),
  dad: seatPlace(K_SEAT.dad, H.dad),
} as const;

const A: React.FC<{ s: ActorSpec; f: number; layer: "all" | "body" | "arms" }> = ({ s, f, layer }) => (
  <Actor uid={s.uid} look={s.look} f={f} place={s.place} face={s.face} pose={s.pose} role={s.role} seed={s.seed} blinkShift={s.blinkShift} walkFrom={s.walkFrom} layer={layer} />
);

export const KitchenShot: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly seated: readonly ActorSpec[];
  readonly chairs: readonly number[]; // x спинок стульев
  readonly standing?: readonly ActorSpec[];
  readonly onTable?: React.ReactNode;
  readonly over?: React.ReactNode;
}> = ({ f, cam, seated, chairs, standing = [], onTable, over }) => (
  <Shot f={f} cam={cam} bg="#EFDDBD">
    <KitchenBack />
    {chairs.map((x) => (
      <KitchenChairBack key={x} x={x} />
    ))}
    {seated.map((s) => (
      <A key={s.uid} s={s} f={f} layer="body" />
    ))}
    <KitchenTable />
    {onTable}
    {seated.map((s) => (
      <A key={`${s.uid}-a`} s={s} f={f} layer="arms" />
    ))}
    {standing.map((s) => (
      <A key={s.uid} s={s} f={f} layer="all" />
    ))}
    {over}
  </Shot>
);
