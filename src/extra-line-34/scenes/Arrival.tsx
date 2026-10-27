// Сцена 5 «arrival» (N05): «Бир күнү аларга көп жыл бала бакчада тарбиячы
// болуп иштеген аял келди.» Спокойный средний план гостиной: воспитатель
// на левом месте дивана, сумка у подлокотника; мама в кресле слушает, папа
// на правом месте дивана кивает; малышка с зайчиком на ковре. В конце сын
// входит слева с книгой в руках. Во время рассказа рты закрыты.
import { Actor, type PoseIn } from "../rig/Actor";
import { cruise, keys, lerp } from "../rig/motion";
import { camMove, Shot, Svg, useScene } from "../kit";
import { BookClosedArt } from "../props/Book";
import { LIVING } from "../sets/Living";
import { BUNNY_SCALE, H, seatedAt } from "./common";
import { Room } from "./Room";

const L = LIVING;
// Сын с книгой: путь от столовой к дивану (продолжается в сцене 6).
export const SON_ENTER = { x0: 1300, x1: 1470, y: 1600 } as const;
export const TODDLER_SPOT = { x: 1975, y: 1662 } as const;

// Сын несёт книгу двумя руками у груди обложкой к камере. Книга — предмет
// мира между слоями тела и рук (HeldBook), кисти лежат на её нижних углах.
export const carryBook = (x: number, y: number, h: number, raise = 0): { pose: PoseIn; book: { x: number; y: number } } => {
  const hy = lerp(y - 0.4 * h, y - 0.48 * h, raise);
  return {
    pose: {
      expr: "softSmile",
      armL: { target: { x: x - 40, y: hy }, shape: "fist", elbow: "hang" },
      armR: { target: { x: x + 40, y: hy }, shape: "fist", elbow: "hang" },
    },
    book: { x, y: hy - 40 },
  };
};

// Закрытая книга в мире (обложкой к камере), центр (x, y).
// title — название на обложке и при малой ширине (крупные планы).
export const HeldBook: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly tilt?: number; readonly title?: boolean }> = ({ x, y, w = 104, tilt = 0, title }) => (
  <Svg>
    <g transform={`translate(${x} ${y})`}>
      <BookClosedArt w={w} tilt={tilt} title={title} />
    </g>
  </Svg>
);

export const ArrivalScene: React.FC = () => {
  const { f, from, to, len } = useScene("arrival");
  const n05 = { a: from("N05"), b: to("N05") };
  const enter0 = len - 62; // сын входит в конце сцены
  const cg = seatedAt("caregiver", L.sofa.seats[0]);
  const dad = seatedAt("dad", L.sofa.seats[2]);
  const mom = seatedAt("mom", L.armchair.seatX);
  const sonPlace = (t: number) => {
    const u = cruise((t - enter0) / 62, 0.25);
    return { x: lerp(SON_ENTER.x0, SON_ENTER.x1, u), y: SON_ENTER.y, h: H.son };
  };
  const td = { x: TODDLER_SPOT.x, y: TODDLER_SPOT.y, h: H.toddler };
  const lap = (p: { x: number; y: number; h: number }, side: -1 | 1) => ({ x: p.x + side * 0.07 * p.h, y: p.y - 0.27 * p.h - 8 });
  const cgPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.sofa.seat,
    expr: t < n05.a + 40 ? "softSmile" : "calm",
    nod: keys(t, [[n05.a + 50, 0], [n05.a + 58, 4], [n05.a + 70, 0]]),
    armL: { target: lap(cg, -1), shape: "relax", elbow: "down" },
    armR: { target: lap(cg, 1), shape: "relax", elbow: "down" },
    lookX: t > enter0 + 30 ? -0.4 : 0,
  });
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.armchair.seat,
    expr: "softSmile",
    headTilt: keys(t, [[20, 0], [50, -4], [110, -4], [140, 0]]),
    armL: { target: lap(mom, -1), shape: "relax", elbow: "down" },
    armR: { target: lap(mom, 1), shape: "relax", elbow: "down" },
  });
  const dadPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.sofa.seat,
    expr: "calm",
    nod: keys(t, [[n05.a + 70, 0], [n05.a + 78, 5], [n05.a + 90, 0], [n05.b - 10, 0], [n05.b, 4], [n05.b + 12, 0]]),
    armL: { target: lap(dad, -1), shape: "relax", elbow: "down" },
    armR: { target: lap(dad, 1), shape: "relax", elbow: "down" },
  });
  const tdPose = (t: number): PoseIn => {
    const bob = Math.sin(t / 7) * 6;
    return {
      expr: "smile",
      lookY: 0.4,
      armL: { target: { x: td.x - 18, y: td.y - 0.5 * td.h + bob }, shape: "fist", elbow: "hang" },
      armR: { target: { x: td.x + 18, y: td.y - 0.5 * td.h + bob }, shape: "fist", elbow: "hang", item: "bunny", itemScale: BUNNY_SCALE(td.h) },
    };
  };
  const seated = (
    <>
      <Actor uid="s5-cg" look="caregiver" f={f} place={() => cg} face={(t) => (t > enter0 + 24 ? -0.2 : 0.55)} pose={cgPose} seed={3} />
      <Actor uid="s5-dad" look="dad" f={f} place={() => dad} face={(t) => keys(t, [[0, 0.45], [n05.a + 60, 0.45], [n05.a + 76, -0.4], [n05.b, -0.4], [n05.b + 14, 0.4]])} pose={dadPose} seed={2} />
      <Actor uid="s5-mom" look="mom" f={f} place={() => mom} face={() => -0.6} pose={momPose} seed={1} />
    </>
  );
  const front = (
    <>
      <Actor uid="s5-td" look="toddler" f={f} place={() => td} face={() => 0.2} pose={tdPose} seed={5} />
      {f >= enter0 - 2 ? (
        <>
          <Actor uid="s5-son" look="son" f={f} place={sonPlace} face={() => 0.6} pose={(t) => carryBook(sonPlace(t).x, SON_ENTER.y, H.son).pose} walkFrom={enter0} seed={4} layer="body" />
          <HeldBook {...carryBook(sonPlace(f).x, SON_ENTER.y, H.son).book} />
          <Actor uid="s5-son" look="son" f={f} place={sonPlace} face={() => 0.6} pose={(t) => carryBook(sonPlace(t).x, SON_ENTER.y, H.son).pose} walkFrom={enter0} seed={4} layer="arms" />
        </>
      ) : null}
    </>
  );
  return (
    <Shot f={f} cam={camMove(f, 0, len, { x: 1862, y: 1250, zoom: 1.05 }, { x: 1842, y: 1250, zoom: 1.1 })}>
      <Room bag seated={seated} front={front} dadChair={false} />
    </Shot>
  );
};
