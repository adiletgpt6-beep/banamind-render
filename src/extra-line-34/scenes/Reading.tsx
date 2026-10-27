// Сцена 7 «reading» (C01, C02, S02). Воспитатель опускает книгу на колени,
// открывает её и переворачивает страницу (рука начинает поворот, страница
// меняется). Крупно — разворот с лисёнком и зайчонком; она читает:
// «Кичинекей каарман досуна жардам берүү үчүн кайра артка бурулду.»
// Двойной план: смотрит на мальчика — «Сен кандай ойлойсуң, ал эмнеге
// кайтып келди?» — короткая пауза — мальчик объясняет и оживляется: «Досун
// жалгыз калтыргысы келген жок.» Реакция мамы в другом плане — лёгкая улыбка.
import { Actor, type PoseIn } from "../rig/Actor";
import { CloseHand } from "../props/CloseHand";
import { LOOKS } from "../rig/looks";
import { clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { camMove, Shot, Svg, useScene } from "../kit";
import type { ElTimeline } from "../timing";
import { sceneTools } from "../plan";
import { BookCloseUp, closeUpCorner, OpenBook, openBookCorner } from "../props/Book";
import { LIVING } from "../sets/Living";
import { H, seatedAt } from "./common";
import { HeldBook, TODDLER_SPOT } from "./Arrival";
import { LAP_BOOK } from "./Ask";
import { Room } from "./Room";

const L = LIVING;
// Раскрытая книга на коленях воспитателя (центр корешка, ширина разворота).
export const LAP_OPEN = { x: L.sofa.seats[0] + 14, y: L.feetY - L.sofa.seat - 12, w: 262 } as const;
export const SON_SEAT = L.sofa.seats[1];

export const readingPlan = (tl: ElTimeline) => {
  const T = sceneTools(tl, "reading");
  const c01 = { a: T.from("C01"), b: T.to("C01") };
  const c02 = { a: T.from("C02"), b: T.to("C02") };
  const s02 = { a: T.from("S02"), b: T.to("S02") };
  const open0 = 2; // книга ложится на колени и раскрывается
  const open1 = 14;
  const turn0 = Math.max(open1 + 2, c01.a - 12); // переворот страницы
  const turn1 = turn0 + 18;
  const closeA = c01.a + 6; // крупный план страницы
  const closeB = c01.b + 4;
  const mom = s02.b + 6; // реакция мамы
  return { c01, c02, s02, open0, open1, turn0, turn1, closeA, closeB, mom, len: T.len };
};

// Поза воспитателя с раскрытой книгой на коленях: левая кисть — у левого
// края разворота, правая — у угла правой страницы (переворачивает) или у
// её края.
export const holdOpenBook = (turnHand: { x: number; y: number } | null): Pick<PoseIn, "armL" | "armR"> => ({
  armL: { target: { x: LAP_OPEN.x - LAP_OPEN.w / 2 + 12, y: LAP_OPEN.y + 8 }, shape: "fist", elbow: "down", behind: false },
  armR: { target: turnHand ?? { x: LAP_OPEN.x + LAP_OPEN.w / 2 - 14, y: LAP_OPEN.y + 10 }, shape: turnHand ? "pinch" : "fist", elbow: "down", behind: false },
});

export const ReadingScene: React.FC = () => {
  const { f, tl } = useScene("reading");
  const P = readingPlan(tl);
  const cg = seatedAt("caregiver", L.sofa.seats[0]);
  const son = seatedAt("son", SON_SEAT);
  const dad = seatedAt("dad", L.sofa.seats[2]);
  const mom = seatedAt("mom", L.armchair.seatX);
  const td = { x: TODDLER_SPOT.x, y: TODDLER_SPOT.y, h: H.toddler };
  const turn = easeInOut(clamp((f - P.turn0) / (P.turn1 - P.turn0)));
  const open = easeInOut(clamp((f - P.open0) / (P.open1 - P.open0)));
  const geom = { x: LAP_OPEN.x, y: LAP_OPEN.y, w: LAP_OPEN.w };
  const corner = (t: number) => openBookCorner(geom, easeInOut(clamp((t - P.turn0) / (P.turn1 - P.turn0))));
  const cgPose = (t: number): PoseIn => {
    const turning = t >= P.turn0 - 6 && t <= P.turn1 + 4;
    const pre = t < P.open1;
    return {
      sit: 1,
      seat: L.sofa.seat,
      expr: t < P.c02.a - 6 ? "softSmile" : t < P.s02.a ? "calm" : "smile",
      lookY: keys(t, [[0, 0.55], [P.c01.b, 0.55], [P.c01.b + 10, 0.1], [P.s02.b + 10, 0.1], [P.s02.b + 20, 0.4]]),
      nod: keys(t, [[P.s02.a + 10, 0], [P.s02.a + 18, 5], [P.s02.a + 30, 0], [P.s02.b, 0], [P.s02.b + 8, 4], [P.s02.b + 18, 0]]),
      headTilt: keys(t, [[P.c02.a - 8, 0], [P.c02.a + 8, 4], [P.s02.b + 10, 4], [P.s02.b + 24, 0]]),
      ...(pre
        ? {
            armL: { target: keysV(t, [[0, { x: LAP_BOOK.x - 54, y: LAP_BOOK.y + 10 }], [P.open1, { x: LAP_OPEN.x - LAP_OPEN.w / 2 + 12, y: LAP_OPEN.y + 8 }]]), shape: "fist", elbow: "down" },
            armR: { target: keysV(t, [[0, { x: LAP_BOOK.x + 54, y: LAP_BOOK.y + 10 }], [P.open1, { x: LAP_OPEN.x + LAP_OPEN.w / 2 - 14, y: LAP_OPEN.y + 10 }]]), shape: "fist", elbow: "down" },
          }
        : holdOpenBook(turning ? corner(t) : null)),
    };
  };
  const cgFace = (t: number) => keys(t, [[0, 0.3], [P.c01.b, 0.3], [P.c01.b + 10, 0.62], [P.s02.b + 12, 0.62], [P.s02.b + 26, 0.35]]);
  // мальчик смотрит в книгу, на вопрос поднимает глаза, отвечает с жестом
  const sonPose = (t: number): PoseIn => {
    const ges = keys(t, [[P.s02.a - 2, 0], [P.s02.a + 8, 1], [P.s02.b + 6, 1], [P.s02.b + 18, 0]]);
    return {
      sit: 1,
      seat: L.sofa.seat,
      expr: t < P.c02.b ? "calm" : "smile",
      lookY: keys(t, [[0, 0.5], [P.c02.a + 6, 0.5], [P.c02.a + 16, 0.05], [P.s02.b + 10, 0.05], [P.s02.b + 22, 0.45]]),
      nod: keys(t, [[P.s02.a, 0], [P.s02.a + 6, -3], [P.s02.a + 18, 3], [P.s02.a + 28, 0]]),
      lean: keys(t, [[0, 6], [P.c02.a, 6], [P.s02.a, 2]]),
      legSwing: Math.sin(t / 11) * (t > P.s02.a ? 0.7 : 0.35),
      armL: { target: { x: son.x - 20, y: son.y - L.sofa.seat - 18 }, shape: "relax", elbow: "down" },
      armR: ges > 0.02 ? { target: { x: lerp(son.x + 30, son.x + 66, ges), y: lerp(son.y - L.sofa.seat - 18, son.y - 0.6 * son.h + Math.sin(t / 5) * 6 * ges, ges) }, shape: ges > 0.5 ? "open" : "relax", elbow: "down" } : { target: { x: son.x + 30, y: son.y - L.sofa.seat - 18 }, shape: "relax", elbow: "down" },
    };
  };
  const sonFace = (t: number) => keys(t, [[0, -0.5], [P.c02.a + 6, -0.5], [P.c02.a + 16, -0.62]]);
  const lap = (p: { x: number; y: number; h: number }, side: -1 | 1) => ({ x: p.x + side * 0.07 * p.h, y: p.y - 0.27 * p.h - 8 });
  const dadPose = (t: number): PoseIn => ({ sit: 1, seat: L.sofa.seat, expr: t > P.s02.a ? "smile" : "softSmile", armL: { target: lap(dad, -1), shape: "relax", elbow: "down" }, armR: { target: lap(dad, 1), shape: "relax", elbow: "down" } });
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: L.armchair.seat,
    expr: t > P.s02.a + 10 ? "smile" : "softSmile",
    headTilt: keys(t, [[P.s02.a, 0], [P.s02.b + 10, -6]]),
    armL: { target: lap(mom, -1), shape: "relax", elbow: "down" },
    armR: { target: lap(mom, 1), shape: "relax", elbow: "down" },
  });
  const tdPose = (t: number): PoseIn => ({
    expr: "smile",
    lookY: 0.4,
    armL: { target: { x: td.x - 18, y: td.y - 0.5 * td.h + Math.sin(t / 7) * 5 }, shape: "fist", elbow: "hang" },
    armR: { target: { x: td.x + 18, y: td.y - 0.5 * td.h + Math.sin(t / 7) * 5 }, shape: "fist", elbow: "hang", item: "bunny", itemScale: 0.92 / (td.h / 1000) },
  });
  const book =
    f < P.open1 ? (
      <>
        {open < 0.5 ? <HeldBook x={lerp(LAP_BOOK.x, LAP_OPEN.x, open)} y={lerp(LAP_BOOK.y, LAP_OPEN.y - 20, open)} /> : null}
        {open > 0.3 ? (
          <Svg opacity={clamp((open - 0.3) / 0.4)}>
            <g transform={`translate(${LAP_OPEN.x} ${LAP_OPEN.y}) scale(${lerp(0.55, 1, open)} 1) translate(${-LAP_OPEN.x} ${-LAP_OPEN.y})`}>
              <OpenBook x={LAP_OPEN.x} y={LAP_OPEN.y} w={LAP_OPEN.w} spread={0} />
            </g>
          </Svg>
        ) : null}
      </>
    ) : (
      <Svg>
        <OpenBook x={LAP_OPEN.x} y={LAP_OPEN.y} w={LAP_OPEN.w} turn={turn} spread={turn >= 1 ? 1 : 0} />
      </Svg>
    );
  const care = (layer: "body" | "arms") => <Actor uid="s7-cg" look="caregiver" f={f} place={() => cg} face={cgFace} pose={cgPose} role="caregiver" seed={3} layer={layer} />;
  const seated = (
    <>
      {care("body")}
      <Actor uid="s7-son" look="son" f={f} place={() => son} face={sonFace} pose={sonPose} role="son" seed={4} />
      {book}
      {care("arms")}
      <Actor uid="s7-dad" look="dad" f={f} place={() => dad} face={(t) => (t < P.s02.a ? -0.5 : -0.4)} pose={dadPose} seed={2} />
      <Actor uid="s7-mom" look="mom" f={f} place={() => mom} face={() => -0.62} pose={momPose} seed={1} />
    </>
  );
  const front = <Actor uid="s7-td" look="toddler" f={f} place={() => td} face={() => 0.1} pose={tdPose} seed={5} />;
  const world = <Room bag cushion={{ x: cg.x + 70, y: L.sofa.seatY - 128, rot: 12 }} seated={seated} front={front} />;
  // крупный план страницы: её рука у края разворота
  const look = LOOKS.caregiver;
  const cu = closeUpCorner(0);
  return (
    <>
      <Shot f={f} from={0} to={P.closeA} cam={camMove(f, 0, P.closeA, { x: 1590, y: 1200, zoom: 1.45 }, { x: 1580, y: 1210, zoom: 1.55 })}>
        {world}
      </Shot>
      {f >= P.closeA && f < P.closeB ? (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.03 * clamp((f - P.closeA) / (P.closeB - P.closeA))})`, transformOrigin: "50% 55%" }}>
          <BookCloseUp spread={1} />
          {/* её рука держит край страницы справа (выше субтитров), рукав кардигана уходит за кадр */}
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <CloseHand at={{ x: cu.x - 34, y: cu.y - 170 }} angle={104} shape="relax" len={168} skin={look.skin} shade={look.skinShade} sleeve={look.topColor} sleeveShade={look.topShade} cuff={54} />
          </svg>
        </div>
      ) : null}
      <Shot f={f} from={P.closeB} to={P.mom} cam={camMove(f, P.closeB, P.mom, { x: 1595, y: 1170, zoom: 1.7 }, { x: 1600, y: 1165, zoom: 1.78 })}>
        {world}
      </Shot>
      <Shot f={f} from={P.mom} to={P.len + 1} cam={camMove(f, P.mom, P.len, { x: 2230, y: 1090, zoom: 1.9 }, { x: 2228, y: 1088, zoom: 1.96 })}>
        {world}
      </Shot>
    </>
  );
};
