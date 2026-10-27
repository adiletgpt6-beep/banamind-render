// Сцена 10 «Шашпай карачы». Ужин в тот же удачный день: вся семья за
// столом, еда ещё тёплая. Сын достаёт тетрадь, кладёт её на свободное
// место между тарелками и поворачивает к маме: «Апа, жазганымды карачы.
// Шашпай карасаң, ээ?» Крупно: разворот «Менин үй-бүлөм», мама придвигает
// тетрадь по столу, палец сына показывает строку. Мама смотрит на сына и
// мягко улыбается; он расслабляется и показывает ещё одну строку.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { HOME, Plate } from "../sets/Home";
import { NOTEBOOK, NotebookOnTable, NotebookTop } from "../sets/Props";
import { box, camMove, Shot } from "../shots";
import { lineFrames, onTable, restOnTable, sceneLen, seated, seatOf } from "./common";
import { KitchenWorld } from "./worlds";

export const NOTEBOOK_SHOTS = { wide: [0, 44], talk: [44, 150], top: [150, 250] } as const;

export const NotebookScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("notebook");
  const S = NOTEBOOK_SHOTS;
  const B01 = lineFrames(cues, "B01", "notebook");
  const dad = seated("dad", HOME.seat.dad);
  const son = seated("son", HOME.seat.son);
  const mom = seated("mom", HOME.seat.mom);
  // тетрадь: из рук сына → на стол (свободное место) → к маме
  const put = 30;
  const spot = onTable(1470, 10);
  const pulled = onTable(1540, 14);
  const pull = clamp((f - (S.top[0] + 20)) / 30);
  const nb = f < S.top[0] ? spot : { x: lerp(spot.x, pulled.x, easeInOut(pull)), y: lerp(spot.y, pulled.y, easeInOut(pull)) };
  const second = S.top[1] + 30;
  const sonPose = (t: number) => ({
    sit: 1,
    seat: seatOf(son),
    packOff: true,
    expr: t < B01.to + 40 ? ("calm" as const) : ("smile" as const),
    lean: keys(t, [[put - 10, 0], [put, 8], [put + 20, 4]]),
    armR: {
      target:
        t < S.top[1]
          ? keysV(t, [[0, { x: son.x + 0.1 * son.h, y: son.y - 0.36 * son.h }], [put, { x: spot.x - 20, y: spot.y - 6 }], [put + 70, { x: spot.x - 20, y: spot.y - 6 }], [put + 90, restOnTable(son, 1).target!]], anticipate)
          : keysV(t, [[S.top[1], restOnTable(son, 1).target!], [second, { x: pulled.x - 30, y: pulled.y - 4 }], [second + 40, { x: pulled.x - 30, y: pulled.y - 4 }], [second + 56, restOnTable(son, 1).target!]], anticipate),
      shape: t < put ? ("fist" as const) : t >= second - 4 && t < second + 44 ? ("point" as const) : ("relax" as const),
      item: t < put ? ("notebook" as const) : ("none" as const),
      itemColor: NOTEBOOK.cover,
      elbow: "down" as const,
      behind: false,
    },
    armL: restOnTable(son, -1),
    lookY: keys(t, [[B01.from - 6, 0.2], [B01.from + 4, 0]]),
  });
  const sonFace = (t: number) => keys(t, [[0, 0.2], [put + 6, 0.5], [B01.to + 30, 0.6]]);
  const momPose = (t: number) => ({
    sit: 1,
    seat: seatOf(mom),
    expr: t < B01.to ? ("calm" as const) : t < S.top[1] ? ("softSmile" as const) : ("smile" as const),
    lookY: keys(t, [[B01.from, 0.1], [B01.to + 6, 0.1], [B01.to + 16, 0.5]]),
    armL: { target: t >= S.top[0] && t < S.top[1] ? { x: nb.x + 50, y: nb.y } : onTable(mom.x - 0.12 * mom.h, 2), shape: "relax" as const, elbow: "down" as const },
    armR: restOnTable(mom, 1),
    headTilt: keys(t, [[S.top[1], 0], [S.top[1] + 14, -5]]),
  });
  const momFace = (t: number) => keys(t, [[0, -0.1], [put, -0.45], [S.top[1] + 4, -0.35], [S.top[1] + 14, -0.6]]);
  const world = (
    <KitchenWorld
      minutes={18 * 60 + 40}
      evening={1}
      workLight={0}
      seated={[
        { uid: "n10-dad", look: "dad", f, place: () => dad, face: () => 0.5, pose: () => ({ sit: 1, seat: seatOf(dad), expr: "softSmile" as const, armL: restOnTable(dad, -1), armR: restOnTable(dad, 1), lookY: 0.2 }), seed: 2 },
        { uid: "n10-son", look: "son", f, place: () => son, face: sonFace, pose: sonPose, role: "son", seed: 4 },
        { uid: "n10-mom", look: "mom", f, place: () => mom, face: momFace, pose: momPose, seed: 1 },
      ]}
      items={
        <>
          <Plate x={HOME.plates.dad} y={onTable(0).y + 16} food={0.6} steam={0.6} f={f} />
          <Plate x={HOME.plates.son - 90} y={onTable(0).y + 16} food={0.7} steam={0.6} f={f} />
          <Plate x={HOME.plates.mom + 40} y={onTable(0).y + 16} food={0.8} steam={0.8} f={f} />
          {f >= put ? <NotebookOnTable x={nb.x} y={nb.y} rot={-4} /> : null}
        </>
      }
      lamp={1}
    />
  );
  // крупный план тетради: рука мамы придвигает, палец сына показывает строку
  const topPoint = clamp((f - S.top[0] - 56) / 14) * (1 - clamp((f - S.top[1] + 8) / 8));
  return (
    <>
      <Shot f={f} from={S.wide[0]} to={S.wide[1]} cam={camMove(f, S.wide[0], S.wide[1], { x: 1330, y: 1180, zoom: 0.95 }, { x: 1360, y: 1180, zoom: 1.0 })}>
        {world}
      </Shot>
      <Shot f={f} from={S.talk[0]} to={S.talk[1]} cam={camMove(f, S.talk[0], S.talk[1], { x: 1470, y: 1060, zoom: 1.75 }, { x: 1470, y: 1060, zoom: 1.8 })}>
        {world}
      </Shot>
      <Shot
        f={f}
        from={S.top[0]}
        to={S.top[1]}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, backgroundColor: "#E9DCC7" })}>
            <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 30%, rgba(255,214,140,0.35), transparent 70%)" })} />
            <NotebookTop x={540 + 40 * easeInOut(pull)} y={1000 + 80 * easeInOut(pull)} w={900} rot={-3 + 3 * easeInOut(pull)} />
            {/* рука мамы на краю тетради (справа снизу) */}
            <div style={box({ left: 860 + 40 * easeInOut(pull), top: 1200 + 80 * easeInOut(pull), width: 400, height: 160, opacity: clamp((f - S.top[0] - 6) / 8) })}>
              <div style={box({ left: 60, top: 30, width: 400, height: 120, borderRadius: 60, backgroundColor: "#5E9A93" })} />
              <div style={box({ left: 0, top: 10, width: 140, height: 120, borderRadius: 56, backgroundColor: "#E6B590" })} />
              {[0, 1, 2].map((i) => (
                <div key={i} style={box({ left: -36 + i * 6, top: 18 + i * 30, width: 70, height: 28, borderRadius: 14, backgroundColor: "#E6B590" })} />
              ))}
            </div>
            {/* палец сына указывает на строку */}
            <div style={box({ left: -520 + 560 * topPoint, top: 1078, width: 520, height: 70, opacity: topPoint > 0.02 ? 1 : 0 })}>
              <div style={box({ left: 0, top: 0, width: 420, height: 70, borderRadius: 35, backgroundColor: "#2F4A7A" })} />
              <div style={box({ left: 380, top: 6, width: 140, height: 58, borderRadius: 29, backgroundColor: "#E8B48D" })} />
            </div>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={S.top[1]} to={len} cam={camMove(f, S.top[1], len, { x: 1470, y: 1080, zoom: 1.6 }, { x: 1470, y: 1090, zoom: 1.66 })}>
        {world}
      </Shot>
    </>
  );
};
