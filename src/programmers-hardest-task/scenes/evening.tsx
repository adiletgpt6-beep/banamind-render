// Пятничный вечер дома (сцены 09–15): общая мизансцена, чтобы предметы
// и люди не «прыгали» между планами разных сцен.
//   • папа сидит за столом по центру (x = 1080), перед ним ноутбук
//     (к камере — внешняя сторона крышки);
//   • монитор справа от папы (x = 1400), повёрнут к нему; рисунок сына
//     клеится к ЛЕВОМУ краю монитора (центр листа ≈ x 1236) — с камеры видна обратная
//     сторона листа;
//   • сын стоит слева от папы за столом (x = 900), смотрит в экран;
//   • мама приносит стул и садится слева от сына (x = 740);
//   • лампа — на правом краю стола, тёплый свет; окно тёмное;
//   • коробка игры — на полке над правым плечом папы (LIVING.box).
// Сцена задаёт состояние (крышка ноутбука, рисунок, коробка, игра) и
// актёров; EveningRoom рисует всё в правильном порядке слоёв.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import type { PhtRole } from "../script";
import { ChairBack, DeskLamp, GameBox, LaptopFront, LIVING, LivingBack, Monitor, PhoneOnTable, TableFront } from "../sets/Living";
import { box } from "../shots";
import { placeAt, seated } from "./common";

export const EVE = {
  dad: LIVING.seat.dad, // 1080
  son: 900, // стоит
  mom: 740, // сидит (после прихода в сцене 11)
  laptop: { x: 1060, y: LIVING.laptop.y },
  monitor: { x: 1400, y: LIVING.monitor.y },
  paper: { x: 1236, y: 1080 }, // центр рисунка на левом краю монитора (мир)
  lamp: { x: 1590, y: LIVING.lamp.y },
  board: { x: 930, y: LIVING.table.top + 14 }, // игровое поле на столе
  minutes: 20 * 60 + 10, // 20:10 на часах
} as const;

export const dadSeat = (): Place => seated("dad", EVE.dad);
export const momSeat = (): Place => seated("mom", EVE.mom);
// стоящий за столом сын (ступни чуть ближе к камере, чем стулья)
export const sonStand = (x: number = EVE.son): Place => placeAt(x, 1556, 540);

export type EveActor = {
  readonly uid: string;
  readonly look: LookId;
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly role?: PhtRole;
  readonly seed?: number;
  readonly walkFrom?: number;
  readonly chair?: number; // x спинки стула за актёром (если сидит)
  readonly chairH?: number;
  // руки за крышкой ноутбука (печатает/тачпад): рисуются до ноутбука
  readonly under?: (t: number) => boolean;
};

export type EveState = {
  readonly f: number;
  readonly lid?: number; // крышка: 1 — открыта, 0 — закрыта
  readonly lidTurn?: number;
  readonly paper?: number; // рисунок на мониторе (0…1)
  readonly boxOnShelf?: boolean;
  readonly extraBack?: React.ReactNode; // предметы на столе за руками
  readonly extraFront?: React.ReactNode; // поверх рук
  readonly glow?: number;
};

export const EveningRoom: React.FC<{ readonly actors: readonly EveActor[]; readonly state: EveState }> = ({ actors, state }) => {
  const { f, lid = 1, lidTurn = 0, paper = 0, boxOnShelf = true, glow = 1 } = state;
  const draw = (layer: "body" | "arms", list: readonly EveActor[] = actors) =>
    list.map((a) => (
      <Actor key={`${a.uid}-${layer}`} uid={a.uid} look={a.look} f={f} place={a.place} face={a.face} pose={a.pose} role={a.role} seed={a.seed} walkFrom={a.walkFrom} layer={layer} />
    ));
  return (
    <>
      <LivingBack evening={1} minutes={EVE.minutes + f / 300} boxOnShelf={boxOnShelf} />
      {actors.filter((a) => a.chair !== undefined).map((a) => <ChairBack key={`ch-${a.uid}`} x={a.chair!} h={a.chairH} evening={1} />)}
      {draw("body")}
      <TableFront evening={1} />
      <DeskLamp x={EVE.lamp.x} y={EVE.lamp.y} on={1} />
      <PhoneOnTable x={1200} y={LIVING.phoneDad.y} />
      <Monitor x={EVE.monitor.x} y={EVE.monitor.y} paper={paper} glow={0.8 * glow} />
      {state.extraBack}
      {draw("arms", actors.filter((a) => a.under?.(f)))}
      <LaptopFront x={EVE.laptop.x} y={EVE.laptop.y} open={lid} turn={lidTurn} glow={glow} />
      {draw("arms", actors.filter((a) => !a.under?.(f)))}
      {state.extraFront}
      {/* вечер: комната приглушена, тёплый круг лампы справа, холодный отсвет экрана на лице папы */}
      <div style={box({ left: -400, top: 0, width: 3000, height: 2600, background: "radial-gradient(circle at 1990px 1150px, rgba(255,196,120,0.12) 0, rgba(255,196,120,0.03) 560px, rgba(22,26,58,0.34) 1250px)", pointerEvents: "none" })} />
      <div style={box({ left: -400, top: 0, width: 3000, height: 2600, background: `radial-gradient(circle at ${EVE.laptop.x + 400}px 1080px, rgba(170,205,255,${0.1 * glow * lid}), transparent 260px)`, pointerEvents: "none" })} />
    </>
  );
};

// Коробка игры на столе (после того как её сняли с полки).
export const BoxOnTable: React.FC<{ readonly x: number; readonly lid?: number }> = ({ x, lid = 0 }) => <GameBox x={x} y={LIVING.table.top + 16} w={150} lid={lid} />;
