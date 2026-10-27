// Сцена 03 «Эртең мененки жол». Три коротких плана: папа уходит в офис
// (сын у стола поправляет рюкзак) → у школы: семейная машина у бордюра,
// сын поправляет рюкзак и спокойно идёт к воротам, мама смотрит вслед →
// мама снова садится за рабочий стол и кладёт руки на клавиатуру.
import { useCurrentFrame } from "remotion";
import type { Place } from "../rig/Actor";
import { anticipate, keys, keysV } from "../rig/motion";
import { Car, MOM_CAR } from "../sets/Car";
import { SCHOOL, SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { WORK } from "../sets/WorkRoom";
import { camMove, Shot } from "../shots";
import { Actor } from "../rig/Actor";
import { H, placeAt, sceneLen, sitDown } from "./common";
import { walkLine } from "./Paradox";
import { DESK_FACE, momAtDesk } from "./Work";
import { KitchenWorld, keyAt, WorkWorld } from "./worlds";

export const MORNING_SHOTS = { home: [0, 72], school: [72, 172] } as const;

// Школа: сын идёт от машины через ворота к крыльцу.
export const SCHOOL_CURB_Y = 1960;
export const sonToSchool = (t0: number) => (t: number): Place => {
  const g = SCHOOL.gate;
  const pts = [
    { x: 1260, y: SCHOOL_CURB_Y },
    { x: g.x + g.w / 2, y: SCHOOL.fenceY + 10 },
    { x: SCHOOL.door.x + SCHOOL.door.w / 2 + 40, y: SCHOOL.groundY + 40 },
  ];
  const seg = (t - t0) / 150;
  const u = Math.max(0, Math.min(1, seg));
  const i = u < 0.45 ? 0 : 1;
  const k = i === 0 ? u / 0.45 : (u - 0.45) / 0.55;
  const a = pts[i];
  const b = pts[i + 1];
  const e = i === 0 ? Math.min(1, (k * k * (3 - 2 * k) + k) / 2) : k * (2 - k);
  return placeAt(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e, H.son);
};

export const SchoolWorld: React.FC<{ minutes: number; inYard?: React.ReactNode; onWalk?: React.ReactNode; car?: React.ReactNode; front?: React.ReactNode }> = ({ minutes, inYard, onWalk, car, front }) => (
  <>
    <div style={{ position: "absolute", left: -1200, top: 2000, width: 4400, height: 2400, backgroundColor: "#6E737E" }} />
    <div style={{ position: "absolute", left: -1200, top: 2700, width: 4400, height: 16, backgroundImage: "repeating-linear-gradient(90deg, #EDEAE4 0 120px, transparent 120px 240px)" }} />
    <SchoolBack minutes={minutes} />
    {inYard}
    <SchoolFence />
    {onWalk}
    {car}
    <SidewalkTrees />
    {front}
  </>
);

export const MorningScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("morning");
  const [h0, h1] = MORNING_SHOTS.home;
  const [, s1] = MORNING_SHOTS.school;
  // A. папа уходит налево, сын поправляет лямку
  const dadPlace = (t: number) => walkLine(t, 6, 70, { x: 1500, y: 1610 }, { x: 760, y: 1640 }, H.dad, 0.3);
  const son = placeAt(1880, 1620, H.son);
  // B. школа
  const sonWalk = sonToSchool(MORNING_SHOTS.school[0] + 14);
  const mom = placeAt(1420, 1975, H.mom);
  // C. мама садится за стол
  const sit0 = s1 + 8;
  const momSit = (t: number) => {
    const sd = sitDown(t, sit0, 30);
    const p = { x: WORK.chairX, y: WORK.seatY, h: H.mom };
    const hands = keyAt(2, t, 0);
    const base = momAtDesk(t, 0);
    return {
      ...base,
      sit: sd.sit,
      lean: Math.max(sd.lean, 12 * sd.sit),
      expr: "calm" as const,
      armR: { ...base.armR, target: keysV(t, [[sit0 + 20, { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }], [sit0 + 44, hands]], anticipate) },
      armL: { ...base.armL, target: keysV(t, [[sit0 + 24, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }], [sit0 + 50, keyAt(0, t, 0)]], anticipate) },
      lookY: keys(t, [[sit0 + 20, 0], [sit0 + 40, 0.32]]),
    };
  };
  return (
    <>
      <Shot f={f} from={h0} to={h1} cam={camMove(f, h0, h1, { x: 1500, y: 1170, zoom: 0.92 }, { x: 1440, y: 1170, zoom: 0.95 })}>
        <KitchenWorld
          minutes={8 * 60 + 20 + f / 600}
          standing={[
            {
              uid: "m3-son",
              look: "son",
              f,
              place: () => son,
              face: () => -0.4,
              pose: (t) => ({ expr: "calm" as const, strapTug: keys(t, [[20, 0], [32, 1], [50, 1], [62, 0]]), armR: { target: keysV(t, [[20, { x: son.x + 0.14 * son.h, y: son.y - 0.42 * son.h }], [32, { x: son.x + 0.12 * son.h, y: son.y - 0.68 * son.h }], [52, { x: son.x + 0.12 * son.h, y: son.y - 0.68 * son.h }], [64, { x: son.x + 0.14 * son.h, y: son.y - 0.42 * son.h }]]), shape: "fist" as const, behind: false } }),
              seed: 4,
            },
            {
              uid: "m3-dad",
              look: "dad",
              f,
              place: dadPlace,
              face: (t) => keys(t, [[0, 0.6], [8, -0.7]]),
              pose: (t) => ({ expr: "softSmile" as const, armR: { target: { x: dadPlace(t).x + 0.1 * H.dad, y: dadPlace(t).y - 0.5 * H.dad }, shape: "fist" as const, item: "keys" as const, behind: false } }),
              seed: 2,
              walkFrom: 6,
            },
          ]}
        />
      </Shot>
      <Shot f={f} from={MORNING_SHOTS.school[0]} to={s1} cam={camMove(f, MORNING_SHOTS.school[0], s1, { x: 1080, y: 1560, zoom: 0.7 }, { x: 1050, y: 1540, zoom: 0.73 })}>
        <SchoolWorld
          minutes={8 * 60 + 25}
          inYard={f > MORNING_SHOTS.school[0] + 80 ? <Actor uid="m3-sonY" look="son" f={f} place={sonWalk} face={() => 0} pose={(t) => ({ expr: "calm" as const, strapTug: keys(t, [[86, 0], [96, 1], [120, 0]]) })} seed={4} walkFrom={MORNING_SHOTS.school[0] + 14} /> : null}
          onWalk={
            <>
              {f <= MORNING_SHOTS.school[0] + 80 ? <Actor uid="m3-son2" look="son" f={f} place={sonWalk} face={(t) => keys(t, [[86, -0.3], [96, 0]])} pose={(t) => ({ expr: "calm" as const, strapTug: keys(t, [[78, 0], [88, 1], [100, 1], [110, 0]]) })} seed={4} walkFrom={MORNING_SHOTS.school[0] + 14} /> : null}
              <Actor uid="m3-mom" look="mom" f={f} place={() => mom} face={() => -0.35} pose={(t) => ({ expr: t > 120 ? ("softSmile" as const) : ("calm" as const), lookY: -0.1, armR: { target: { x: mom.x + 0.1 * mom.h, y: mom.y - 0.44 * mom.h }, shape: "fist" as const, item: "keys" as const, behind: false } })} seed={1} />
            </>
          }
          car={<Car x={250} y={2440} color={MOM_CAR} s={1.25} />}
        />
      </Shot>
      <Shot f={f} from={s1} to={len} cam={camMove(f, s1, len, { x: 820, y: 1150, zoom: 1.1 }, { x: 840, y: 1150, zoom: 1.14 })}>
        <WorkWorld minutes={8 * 60 + 52 + (f - s1) / 600} mom={{ uid: "m3-momD", look: "mom", f, place: () => ({ x: WORK.chairX, y: WORK.seatY, h: H.mom }), face: () => DESK_FACE, pose: momSit, seed: 1 }} />
      </Shot>
    </>
  );
};

