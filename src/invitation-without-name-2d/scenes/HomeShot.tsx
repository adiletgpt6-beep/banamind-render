// Общий план домашнего стола с правильным порядком слоёв: стена → спинки
// стульев → тела сидящих за столом (layer "body") → столешница → предметы
// на столе → руки (layer "arms"). Стоящий перед столом персонаж (front)
// рисуется целиком поверх стола.
import { Actor, type PoseIn, type Place } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import type { Iw2Role } from "../script";
import { type Cam, Shot } from "../kit";
import { C } from "../theme";
import { ChairBack, HOME, HomeTable, HomeWall } from "../sets/Home";
import { H } from "./common";

export type HomeActor = {
  readonly uid: string;
  readonly look: LookId;
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  readonly role?: Iw2Role;
  readonly seed: number;
  readonly blinkShift?: number;
  readonly walkFrom?: number;
  readonly front?: boolean;
};

// Места за столом (ступни сидящих — HOME.seatY).
// Эмир сидит слева, стул для папы — справа от него; лист — между ними.
export const SON_AT: Place = { x: 500, y: HOME.seatY, h: H.boy };
export const DAD_CHAIR = 790;
export const DAD_SIT = 812; // стул чуть отодвинут папой
export const SHEET_AT = { x: 650, y: 1272 } as const;

export const HomeShot: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly actors: readonly HomeActor[];
  readonly chairs?: readonly { readonly x: number; readonly color?: string }[];
  readonly onTable?: React.ReactNode;
  readonly over?: React.ReactNode;
  readonly warm?: number;
}> = ({ f, cam, actors, chairs = [], onTable, over, warm = 1 }) => {
  const actor = (a: HomeActor, layer?: "body" | "arms") => (
    <Actor key={`${a.uid}-${layer ?? "all"}`} uid={a.uid} look={a.look} f={f} place={a.place} face={a.face} pose={a.pose} role={a.role} seed={a.seed} blinkShift={a.blinkShift} walkFrom={a.walkFrom} layer={layer} />
  );
  return (
    <Shot f={f} cam={cam} bg={C.wallWarm}>
      <HomeWall warm={warm} />
      {chairs.map((c, i) => (
        <ChairBack key={i} x={c.x} color={c.color} />
      ))}
      {actors.filter((a) => !a.front).map((a) => actor(a, "body"))}
      <HomeTable />
      {onTable}
      {actors.filter((a) => !a.front).map((a) => actor(a, "arms"))}
      {actors.filter((a) => a.front).map((a) => actor(a))}
      {over}
    </Shot>
  );
};

export { HOME };
