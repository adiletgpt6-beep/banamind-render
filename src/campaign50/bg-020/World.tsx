// Гостиная с семьёй — общий мир всех игровых сцен. Сцена задаёт позы
// персонажей (функции от кадра сцены) и состояние предметов; камера —
// через Shot (риг и камера — общие с 2D-роликами проекта, только чтение).
import { Actor, type Place, type PoseIn, type WorldArm } from "../../two-schedules-2d/rig/Actor";
import { seatH } from "../../two-schedules-2d/sets/Home";
import { easeInOut } from "../../two-schedules-2d/rig/motion";
import { BookSide, NotebookSide, PhoneOnTable, PlannerSide } from "./sets/Props";
import { ChairBack, ROOM, RoomBack, TableFront, WarmLight } from "./sets/Room";

// Рост персонажей (px мира) — как в 2D-роликах проекта.
export const H = { mom: 760, dad: 790, son: 540 } as const;

export const SON: Place = { x: ROOM.seat.son, y: ROOM.seatY, h: H.son };
export const MOM: Place = { x: ROOM.seat.mom, y: ROOM.seatY, h: H.mom };
export const DAD: Place = { x: ROOM.seat.dad, y: ROOM.seatY, h: H.dad };

export const seatOf = (p: Place) => seatH(p.h);
export const onTable = (x: number, dy = 0) => ({ x, y: ROOM.table.top + 6 + dy });
export const rest = (p: Place, side: -1 | 1, dx = 0.1): WorldArm => ({ target: onTable(p.x + side * dx * p.h, -4), shape: "relax", elbow: "down", behind: false });

export type Props = {
  readonly bookX?: number;
  readonly bookOpen?: number;
  readonly bookFlip?: number;
  readonly notebookX?: number;
  readonly notebook?: boolean;
  readonly planner?: number; // 0…1 открыт
  readonly phoneOnTable?: boolean;
  readonly phoneGlow?: number;
};

type PoseFn = (t: number) => PoseIn;
type FaceFn = (t: number) => number;

export type Cast = {
  readonly son: { readonly pose: PoseFn; readonly face: FaceFn };
  readonly mom: { readonly pose: PoseFn; readonly face: FaceFn };
  readonly dad: { readonly pose: PoseFn; readonly face: FaceFn };
};

export const World: React.FC<{ readonly f: number; readonly abs: number; readonly cast: Cast; readonly props: Props; readonly uid: string }> = ({ f, abs, cast, props, uid }) => {
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid={`${uid}-son`} look="son" f={f} place={() => SON} face={cast.son.face} pose={cast.son.pose} role="son" seed={4} layer={layer} />
      <Actor uid={`${uid}-mom`} look="mom" f={f} place={() => MOM} face={cast.mom.face} pose={cast.mom.pose} role="mother" seed={1} layer={layer} />
      <Actor uid={`${uid}-dad`} look="dad" f={f} place={() => DAD} face={cast.dad.face} pose={cast.dad.pose} role="father" seed={2} layer={layer} />
    </>
  );
  return (
    <>
      <RoomBack f={abs} dusk={Math.min(1, abs / 2400)} />
      <ChairBack x={SON.x} h={640} />
      <ChairBack x={MOM.x} />
      <ChairBack x={DAD.x} />
      {actors("body")}
      <TableFront />
      {props.notebook !== false ? <NotebookSide x={props.notebookX ?? ROOM.notebook.x} y={ROOM.table.top + 6} /> : null}
      <PlannerSide x={ROOM.planner.x} y={ROOM.table.top + 6} open={props.planner ?? 0} />
      {props.phoneOnTable !== false ? <PhoneOnTable x={ROOM.phone.x} y={ROOM.table.top + 8} glow={props.phoneGlow ?? 0} /> : null}
      <BookSide x={props.bookX ?? ROOM.book.x} y={ROOM.table.top + 6} open={props.bookOpen ?? 1} flip={props.bookFlip ?? 0} />
      {actors("arms")}
      <WarmLight />
    </>
  );
};

// ---------- Монтаж: последовательные планы с мягким наплывом ----------
export type Cut = { readonly from: number; readonly fade?: number; readonly node: () => React.ReactNode };

// Каждый план виден с from до начала следующего; следующий проявляется
// поверх за fade кадров (0 — прямая склейка).
export const Cuts: React.FC<{ readonly f: number; readonly cuts: readonly Cut[] }> = ({ f, cuts }) => (
  <>
    {cuts.map((c, i) => {
      const next = cuts[i + 1];
      const end = next ? next.from + (next.fade ?? 0) : Infinity;
      if (f < c.from || f >= end) return null;
      const op = c.fade ? easeInOut((f - c.from) / c.fade) : 1;
      return (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: op }}>
          {c.node()}
        </div>
      );
    })}
  </>
);
