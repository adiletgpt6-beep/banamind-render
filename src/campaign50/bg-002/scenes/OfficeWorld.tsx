// Офис целиком: задний план, коллеги (в переговорной и идущие к ней),
// кресло, папа (тело → стол → руки), предметы на столе.
// Коллеги, дошедшие до двери, рисуются уже «за стеклом» переговорной.
import type { ReactNode } from "react";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import { PhoneFlat } from "../sets/Apartment";
import { DeskFront, Folder, MonitorBack, OFFICE, OfficeBack, OfficeChair, TabletOnDesk } from "../sets/Office";
import { box } from "../shots";
import { H, placeAt } from "./common";

export type Walker = {
  readonly uid: string;
  readonly look: LookId;
  readonly place: (t: number) => Place;
  readonly face?: (t: number) => number;
  readonly pose?: (t: number) => PoseIn;
  readonly walkFrom?: number;
  readonly seed: number;
};

// Сидящие в переговорной (координаты мира).
const SITTERS: readonly Walker[] = [
  { uid: "room-a", look: "parentA", place: () => placeAt(1620, 1470, H.colleagueB), face: () => 0.3, pose: () => ({ sit: 1, seat: 190, expr: "calm" }), seed: 7 },
  { uid: "room-b", look: "teacher", place: () => placeAt(1980, 1470, H.colleagueA), face: () => -0.4, pose: () => ({ sit: 1, seat: 190, expr: "softSmile" }), seed: 8 },
];

export const OfficeWorld: React.FC<{
  readonly f: number;
  readonly dad: (t: number) => Place;
  readonly dadFace: (t: number) => number;
  readonly dadPose: (t: number) => PoseIn;
  readonly dadWalkFrom?: number;
  readonly dadBehindDesk?: boolean; // папа за столом (стол перекрывает ноги)
  readonly walkers?: readonly Walker[];
  readonly sitters?: number; // сколько коллег уже в переговорной
  readonly doorOpen?: number;
  readonly phone?: { readonly glow: number; readonly shake: number } | null;
  readonly folder?: boolean;
  readonly tablet?: ReactNode | null; // экран планшета на подставке
  readonly chair?: boolean;
}> = ({ f, dad, dadFace, dadPose, dadWalkFrom = 0, dadBehindDesk = true, walkers = [], sitters = 2, doorOpen = 0, phone = { glow: 0, shake: 0 }, folder = true, tablet = null, chair = true }) => {
  const r = OFFICE.room;
  const inside = (w: Walker) => w.place(f).x > r.x + 90;
  const actor = (w: Walker, layer?: "body" | "arms") => (
    <Actor key={`${w.uid}-${layer ?? "all"}`} uid={w.uid} look={w.look} f={f} place={w.place} face={w.face} pose={w.pose} walkFrom={w.walkFrom} seed={w.seed} layer={layer} />
  );
  const dadActor = (layer: "body" | "arms" | "all") => (
    <Actor uid="dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" walkFrom={dadWalkFrom} seed={2} layer={layer} />
  );
  const roomPeople = (
    <div style={box({ left: -r.x, top: -r.y })}>
      {SITTERS.slice(0, sitters).map((w) => actor(w))}
      {walkers.filter(inside).map((w) => actor(w))}
    </div>
  );
  return (
    <>
      <OfficeBack doorOpen={doorOpen} inRoom={roomPeople} />
      {walkers.filter((w) => !inside(w)).map((w) => actor(w))}
      {chair ? <OfficeChair x={OFFICE.dad} /> : null}
      {dadBehindDesk ? dadActor("body") : null}
      <MonitorBack />
      <DeskFront />
      {folder ? <Folder x={OFFICE.folder.x} y={OFFICE.folder.y} /> : null}
      {phone ? <PhoneFlat x={OFFICE.phone.x} y={OFFICE.phone.y} glow={phone.glow} shake={phone.shake} scale={1.3} /> : null}
      {tablet ? <TabletOnDesk x={OFFICE.tablet.x} y={OFFICE.tablet.y}>{tablet}</TabletOnDesk> : null}
      {dadBehindDesk ? dadActor("arms") : dadActor("all")}
    </>
  );
};
