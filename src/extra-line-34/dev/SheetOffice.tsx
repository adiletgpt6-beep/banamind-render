// Рабочий лист «Офис и совещание» (№34): короткие вставки сцены 2.
import { useCurrentFrame } from "remotion";
import { Actor, type PoseIn } from "../rig/Actor";
import { keys } from "../rig/motion";
import { camMove, Shot } from "../kit";
import { MEETING, MeetingBack, MeetingTable, OFFICE, OfficeBack, OfficeChair, OfficeDesk, OfficeFar } from "../sets/Office";
import { DevSheet } from "./DevSheet";

const O = OFFICE;
const M = MEETING;

export const SheetOffice: React.FC = () => {
  const f = useCurrentFrame();
  const mom = { x: O.momSeat.x, y: O.feetY, h: 760 };
  const type = (t: number) => Math.sin(t / 2.2) * 5;
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: O.momSeat.seat,
    expr: "calm",
    lookY: keys(t, [[0, 0.5], [50, 0.5], [62, 0.05]]),
    armL: { target: { x: O.keyboard.x - 36 + type(t), y: O.keyboard.y - 10 }, shape: "relax", elbow: "down" },
    armR: { target: { x: O.keyboard.x + 30 - type(t + 3), y: O.keyboard.y - 12 }, shape: "relax", elbow: "down" },
  });
  const dad = { x: M.dad.x, y: M.feetY, h: 790 };
  const dadPose = (t: number): PoseIn => ({
    expr: "calm",
    armL: { target: keys(t, [[120, 0], [150, 1], [200, 1], [220, 0]]) > 0.5 ? { x: M.board.x + 360, y: M.board.y + 190 } : null, shape: "open", elbow: "down" },
  });
  const office = f < 120;
  return (
    <DevSheet>
      {office ? (
        <Shot f={f} cam={camMove(f, 0, 110, { x: 600, y: 1080, zoom: 1.0 }, { x: 600, y: 1060, zoom: 1.08 })} bg="#E8EDF2">
          <OfficeBack />
          <OfficeFar>
            <Actor uid="so-col" look="colleagueW" f={f} place={() => ({ x: 1220, y: 1478, h: 560 })} face={() => -0.3} pose={() => ({ sit: 1, seat: 150, lookY: 0.3 })} seed={7} />
          </OfficeFar>
          <OfficeChair x={O.momSeat.x} />
          <Actor uid="so-mom" look="mom" f={f} place={() => mom} face={(t) => keys(t, [[0, 0.65], [50, 0.65], [64, 0.8]])} pose={momPose} layer="body" seed={1} />
          <OfficeDesk typing={keys(f, [[0, 0], [100, 1]])} />
          <Actor uid="so-mom" look="mom" f={f} place={() => mom} face={(t) => keys(t, [[0, 0.65], [50, 0.65], [64, 0.8]])} pose={momPose} layer="arms" seed={1} />
        </Shot>
      ) : (
        <Shot f={f} cam={camMove(f, 120, 240, { x: 640, y: 1050, zoom: 0.92 }, { x: 680, y: 1040, zoom: 0.98 })} bg="#EDF0F3">
          <MeetingBack point={keys(f, [[140, 0], [160, 1]])} />
          {M.seats.map((x, i) => (
            <Actor key={x} uid={`sm-c${i}`} look={i ? "colleagueW" : "colleagueM"} f={f} place={() => ({ x, y: M.feetY, h: 770 })} face={(t) => (t > 205 ? 0.75 : 0.85)} pose={(t) => ({ sit: 1, seat: 205, expr: "calm", nod: keys(t, [[205 + i * 8, 0], [212 + i * 8, 5], [222 + i * 8, 0]]) })} layer="body" seed={8 + i} />
          ))}
          <MeetingTable />
          {M.seats.map((x, i) => (
            <Actor key={x} uid={`sm-c${i}`} look={i ? "colleagueW" : "colleagueM"} f={f} place={() => ({ x, y: M.feetY, h: 770 })} face={(t) => (t > 205 ? 0.75 : 0.85)} pose={() => ({ sit: 1, seat: 205, expr: "calm", armL: { target: { x: x + 40, y: M.table.top - 14 }, shape: "relax", elbow: "down" }, armR: { target: { x: x + 90, y: M.table.top - 14 }, shape: "relax", elbow: "down" } })} layer="arms" seed={8 + i} />
          ))}
          <Actor uid="sm-dad" look="dad" f={f} place={() => dad} face={(t) => keys(t, [[120, -0.4], [150, -0.75], [200, -0.75], [216, -0.5]])} pose={dadPose} seed={2} />
        </Shot>
      )}
    </DevSheet>
  );
};
