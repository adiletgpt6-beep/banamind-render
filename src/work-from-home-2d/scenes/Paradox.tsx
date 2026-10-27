// Сцена 01 «Ал үйдөн иштейт — бирок баарынан кеч». Сразу вечер: папа за
// столом, сын уносит свою тарелку к кухонному блоку, на месте мамы —
// нетронутый остывший ужин; из-под двери рабочей комнаты виден свет.
// На «Болгону…» камера доходит до двери: она открывается, мама выходит —
// без пальто и сумки, уставшая, но мягкая. На часах ≈ 20:10.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, keys, keysV, lerp } from "../rig/motion";
import { HOME, Plate } from "../sets/Home";
import { camMove, Shot } from "../shots";
import { H, onTable, placeAt, restOnTable, seated, seatOf, wordFrame } from "./common";
import { KitchenWorld, type ActorSpec } from "./worlds";

export const walkLine = (t: number, t0: number, t1: number, a: { x: number; y: number }, b: { x: number; y: number }, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / Math.max(1, t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// Сын с тарелкой: от стола к кухонному блоку.
const SON_FROM = { x: 1420, y: 1610 };
const SON_TO = { x: 2440, y: 1610 };
const SON_WALK = [24, 132] as const;
export const P1_SON = (t: number) => walkLine(t, SON_WALK[0], SON_WALK[1], SON_FROM, SON_TO, H.son);

export const ParadoxScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const door = wordFrame(cues, "N01", "Болгону", "paradox") - 6;
  const dad = seated("dad", HOME.seat.dad);
  // мама: из проёма двери (за порогом) — на кухню
  const momPlace = (t: number) => walkLine(t, door + 14, door + 70, { x: 2040, y: 1508 }, { x: 1860, y: 1600 }, H.mom, 0.3);
  const inside = momPlace(f).y < 1532;
  const counter = { x: HOME.counter.x + 120, y: HOME.counter.top - 6 };
  const sonPose = (t: number) => {
    const p = P1_SON(t);
    const carry = { x: p.x + 0.16 * p.h, y: p.y - 0.5 * p.h };
    const put = SON_WALK[1] + 14;
    return {
      expr: "calm" as const,
      packOff: true,
      armR: {
        target: keysV(t, [[0, carry], [SON_WALK[1], carry], [put, counter], [put + 6, counter], [put + 24, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }]], anticipate),
        shape: t < put + 2 ? ("fist" as const) : ("relax" as const),
        item: t < put + 2 ? ("plate" as const) : ("none" as const),
        behind: false,
      },
      armL: { target: t < put + 2 ? { x: p.x + 0.12 * p.h, y: p.y - 0.47 * p.h } : null, shape: "open" as const, behind: false },
      lookY: keys(t, [[SON_WALK[1] - 4, 0], [put - 4, 0.4], [put + 16, 0]]),
    };
  };
  const sonFace = (t: number) => (t < door + 10 ? 0.6 : keys(t, [[door + 10, 0.6], [door + 26, -0.2]]));
  const dadPose = (t: number) => ({
    sit: 1,
    seat: seatOf(dad),
    expr: t < door ? ("calm" as const) : ("softSmile" as const),
    armL: restOnTable(dad, -1),
    armR: { target: onTable(dad.x + 0.2 * dad.h, -6), shape: "relax" as const, elbow: "down" as const },
    lookY: t < door ? 0.2 : 0,
  });
  const dadFace = (t: number) => keys(t, [[0, 0.1], [door - 4, 0.1], [door + 12, 0.75]]);
  const momPose = (t: number) => ({
    expr: t < door + 50 ? ("tired" as const) : ("softSmile" as const),
    armR: { target: keysV(t, [[door + 4, { x: 2120, y: 1150 }], [door + 30, { x: 2120, y: 1150 }], [door + 50, { x: momPlace(t).x + 0.12 * H.mom, y: momPlace(t).y - 0.42 * H.mom }]]), shape: "relax" as const, behind: t < door + 30 },
    exhale: keys(t, [[door + 44, 0], [door + 60, 1], [door + 80, 0.4]]),
  });
  const momFace = (t: number) => keys(t, [[door, -0.3], [door + 60, -0.5], [door + 80, -0.6]]);
  const items = (
    <>
      <Plate x={HOME.plates.dad} y={onTable(0).y + 16} food={0.08} />
      {/* нетронутый ужин мамы: без пара — остыл */}
      <Plate x={HOME.plates.mom} y={onTable(0).y + 16} food={1} />
    </>
  );
  const momSpec = { uid: "p1-mom", look: "mom" as const, f, place: momPlace, face: momFace, pose: momPose, seed: 1, walkFrom: door + 14 };
  const cam = f < 96 ? camMove(f, 0, 96, { x: 1380, y: 1160, zoom: 0.98 }, { x: 1420, y: 1160, zoom: 1.0 }) : camMove(f, 96, door + 10, { x: 1420, y: 1160, zoom: 1.0 }, { x: 1830, y: 1150, zoom: 1.12 });
  return (
    <Shot f={f} from={0} to={100000} cam={cam}>
      <KitchenWorld
        minutes={20 * 60 + 9 + f / 300}
        evening={1}
        doorOpen={clamp((f - door) / 16)}
        workLight={1}
        inDoor={inside ? <ActorIn spec={momSpec} /> : null}
        chairs={[HOME.seat.dad, HOME.seat.son, HOME.seat.mom]}
        seated={[{ uid: "p1-dad", look: "dad", f, place: () => dad, face: dadFace, pose: dadPose, seed: 2 }]}
        items={items}
        standing={[{ uid: "p1-son", look: "son", f, place: P1_SON, face: sonFace, pose: sonPose, seed: 4 }, ...(inside ? [] : [momSpec])]}
        lamp={1}
      />
    </Shot>
  );
};

const ActorIn: React.FC<{ spec: ActorSpec }> = ({ spec }) => <Actor {...spec} />;
