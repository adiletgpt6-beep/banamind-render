// Родители на диване, занятые завтрашней дорогой: мама с календарём в
// телефоне, папа с блокнотом. Используется на заднем плане хука и в сцене
// «Календарь».
import { visemeAt } from "../context";
import { CalendarScreen, Phone, Planner } from "../props";
import { Person } from "../rig/Person";
import { ROOM } from "../sets/LivingRoom";
import type { Face } from "../rig/Head";
import type { B12Cue } from "../timing";
import { breath, face, idleTilt, talkNod } from "./common";

export type ParentsState = {
  readonly momTurn: number; // 0 — в телефон, 1 — к папе
  readonly dadTurn: number; // 0 — в блокнот, 1 — к маме
  readonly dadShrug?: number;
  readonly calendarRow?: number;
  readonly calendarMark?: number;
  readonly momPoint?: number; // мама показывает папе экран
  readonly momFace?: Partial<Face>;
  readonly dadFace?: Partial<Face>;
  readonly momBlinks?: readonly number[];
  readonly dadBlinks?: readonly number[];
};

export const BusyParents: React.FC<{ readonly t: number; readonly abs: number; readonly cues: readonly B12Cue[]; readonly s: ParentsState }> = ({ t, abs, cues, s }) => {
  const mv = visemeAt(cues, "mother", abs);
  const dv = visemeAt(cues, "father", abs);
  const mt = s.momTurn;
  const dt = s.dadTurn;
  const mp = s.momPoint ?? 0;
  return (
    <>
      <Person
        uid="mom-busy"
        look="mom"
        x={ROOM.mom}
        y={ROOM.seatY - 220}
        pose={{
          lean: 2 + mt * 3,
          tilt: 4 - mt * 8 + idleTilt(t, 1, 1),
          nod: talkNod(mv, abs, 1) + (1 - mt) * 4,
          breathe: breath(t, 1),
          l: { x: -34 + mp * 30, y: 206 - mp * 24, kind: "hold" },
          r: { x: 42 + mp * 40, y: 210 - mp * 30, kind: "hold" },
        }}
        face={face(abs, 1, mv, {
          turn: 0.1 + mt * 0.35,
          lookX: 0.15 + mt * 0.75,
          lookY: 0.75 * (1 - mt),
          lid: 0.45 * (1 - mt),
          raise: mt * 0.35,
          worry: 0.15,
          smile: 0.05,
          ...s.momFace,
        }, s.momBlinks)}
        prop={
          <g transform={`translate(${4 + mp * 36} ${150 - mp * 26}) rotate(${-4 + mp * 14}) scale(0.22)`}>
            <Phone>
              <CalendarScreen highlight={s.calendarRow ?? -1} mark={s.calendarMark ?? 0} />
            </Phone>
          </g>
        }
      />
      <Person
        uid="dad-busy"
        look="dad"
        x={ROOM.dad}
        y={ROOM.seatY - 236}
        pose={{
          lean: -2 - dt * 3,
          tilt: -3 + dt * 6 + idleTilt(t, 2, 1),
          nod: talkNod(dv, abs, 2) + (1 - dt) * 5,
          breathe: breath(t, 2),
          shrug: s.dadShrug ?? 0,
          l: { x: -46, y: 196, kind: "hold" },
          r: { x: 40, y: 206, kind: "point" },
        }}
        face={face(abs, 2, dv, {
          turn: -0.1 - dt * 0.35,
          lookX: -0.1 - dt * 0.75,
          lookY: 0.8 * (1 - dt),
          lid: 0.4 * (1 - dt),
          raise: dt * 0.15,
          worry: 0.25,
          smile: 0,
          ...s.dadFace,
        }, s.dadBlinks)}
        prop={
          <g transform="translate(-4 186) rotate(4) scale(0.95)">
            <Planner />
          </g>
        }
      />
    </>
  );
};
