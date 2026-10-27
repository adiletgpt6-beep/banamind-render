// Мир квартиры (сцены 1, 3 — начало, 6): кухня-столовая 2D-ролика №12
// (окно во двор с горами — Бишкек), стол, полка для обуви у двери,
// свой стул со спины с рюкзаком сына и мама. Утро, мягкий свет из окна.
import type { PoseIn, Place } from "../../../two-schedules-2d/rig/Actor";
import { Actor } from "../../../two-schedules-2d/rig/Actor";
import type { Vec } from "../../../two-schedules-2d/rig/motion";
import { HOME, HomeBack, ShoeBench, TableFront } from "../../../two-schedules-2d/sets/Home";
import { box } from "../context";
import { ChairWithPack, DustMotes } from "../sets";

export const MORNING = 7 * 60 + 42; // часы на стене: 7:42

export const at = (p: Place, dx: number, dy: number): Vec => ({ x: p.x + dx * p.h, y: p.y + dy * p.h });

// Мама стоит перед столом, справа от стула (сцена 1).
export const MOM_HOOK: Place = { x: 1000, y: 1720, h: 1000 };

// Мама держит телефон двумя руками у груди (печатает / читает).
export const phoneInHands = (p: Place, lower = 0): Pick<PoseIn, "armL" | "armR"> => ({
  armR: { target: at(p, 0.06, -0.71 + lower), shape: "phone", item: "phone", glow: 1, itemTilt: -8, elbow: "hang", behind: false, flat: 0 },
  armL: { target: at(p, -0.02, -0.68 + lower), shape: "point", elbow: "hang", behind: false },
});

export const HomeWorld: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly momPlace?: (t: number) => Place;
  readonly momPose?: (t: number) => PoseIn;
  readonly momFace?: (t: number) => number;
  readonly momOpacity?: number;
  readonly walkFrom?: number;
  readonly pack?: boolean; // рюкзак на стуле
  readonly packOpen?: number;
  readonly packGlow?: number;
  readonly benchPack?: boolean; // рюкзак на полке у двери
  readonly sun?: number;
  readonly dust?: number; // сдвиг фазы пылинок (разные планы)
}> = ({ f, uid, momPlace, momPose, momFace, momOpacity, walkFrom, pack = true, packOpen = 0, packGlow = 0, benchPack = false, sun = 1, dust = 0 }) => (
  <>
    <HomeBack minutes={MORNING} f={f + dust} />
    <ShoeBench sonPack={benchPack} />
    {/* утренний свет из окна и пылинки в луче */}
    <div
      style={box({
        left: HOME.window.x - 120,
        top: HOME.window.y,
        width: 900,
        height: 1500,
        background: `linear-gradient(160deg, rgba(255,240,200,${0.45 * sun}), rgba(255,240,200,0) 70%)`,
        clipPath: "polygon(10% 0, 62% 0, 100% 100%, 30% 100%)",
        pointerEvents: "none",
      })}
    />
    <DustMotes f={f + dust} x={HOME.window.x} y={HOME.window.y + 200} w={620} h={900} a={0.8 * sun} />
    <TableFront />
    <ChairWithPack pack={pack} open={packOpen} glow={packGlow} f={f + dust} />
    {momPlace ? (
      <Actor uid={`${uid}-mom`} look="mom" f={f} place={momPlace} face={momFace} pose={momPose} role="mother" seed={3} walkFrom={walkFrom} opacity={momOpacity} />
    ) : null}
  </>
);
