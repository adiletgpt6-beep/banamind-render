// S05 · За ужином.
//
// 5A — общий план спереди: тёплая вечерняя кухня, семейный стол. Папа
//      слева, сын посередине за дальней стороной стола, мама справа; все
//      сидят. Пиалы с супом, лепёшка, чайник; сбоку лежат телефоны и
//      маленькое школьное расписание. Сын спокойно ест; папа ест и с
//      улыбкой смотрит на сына; мама помешивает суп, задумчиво смотрит в
//      пиалу, коротко глядит на сына (N05).
// 5B — средний план мамы (папа — у левого края кадра): мама спокойно
//      кладёт ложку на стол, на секунду опускает взгляд, поднимает глаза
//      на папу и говорит M02. Папа поднимает голову, поворачивается к ней,
//      слушает; после реплики — небольшая пауза и чуть поднятые брови,
//      затем мягко, без упрёка — P01 (с открытой ладонью к ней). Камера
//      плавно смещается к папе на его реплике.
import { useScene, usePlan, Shot, camKeys } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { C } from "../theme";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, keysV, type Vec } from "../rig/motion";
import { EXPR, mixExpr, type Expression } from "../rig/pose";
import { Svg } from "../kit";
import { Bowl, Bread, Cup, KITCHEN, KitchenBack, KitchenChair, KitchenTable, PhoneFlat, SheetOnTable, SpoonFlat, Teapot } from "../sets/Kitchen";
import { H, seatOf } from "./common";
import type { Sd2SfxPlan } from "../sfx";

// ---------- общие для кухонных сцен S05–S07 ----------
// Плавная смена мимики по ключам: [[кадр, выражение], …].
export const exprKeys = (t: number, pts: readonly (readonly [number, Expression])[]): Expression => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) return mixExpr(pts[i - 1][1], pts[i][1], easeInOut((t - pts[i - 1][0]) / Math.max(1, pts[i][0] - pts[i - 1][0])));
  }
  return pts[pts.length - 1][1];
};
// Лёгкое удивление (брови чуть вверх) и тёплое спокойное выражение.
export const LIGHT_SURPRISE: Expression = mixExpr(EXPR.neutral, EXPR.surprised, 0.55);
export const WARM: Expression = mixExpr(EXPR.calm, EXPR.softSmile, 0.5);
export const PENSIVE: Expression = mixExpr(EXPR.thinking, EXPR.calm, 0.35);

const SEAT = KITCHEN.seatY;
export const SEAT_DAD = seatOf(H.dad);
export const SEAT_MOM = seatOf(H.mom);
export const SEAT_SON = 257; // на подушке: плечи над столом

// Кисть, спокойно лежащая на столе: плечо вдоль корпуса (локоть у края
// стола), предплечье — к зрителю. side −1 — рука слева на экране; dx —
// сдвиг к середине корпуса (+) или наружу (−), dy — ниже/выше.
export const restArm = (P: { x: number; y: number; h: number }, seat: number, side: -1 | 1, dx = 0, dy = 0, shape: "relax" | "open" | "fist" = "relax") => {
  const k = P.h / 1000;
  const ex = P.x + side * 92 * k;
  const ey = P.y - seat - 128 * k;
  return { target: { x: ex - side * (28 + dx), y: ey + 24 + dy }, shape, elbow: "hang" as const };
};

// Средний двухплан (5B, S06, S07): папа слева, мама справа.
export const TWO = {
  dad: { x: 470, y: SEAT, h: H.dad },
  mom: { x: 790, y: SEAT, h: H.mom * 0.985 },
  momBowl: 770,
  dadBowl: 455,
  sheet0: { x: 884, y: 1186 }, // расписание лежит справа от мамы
} as const;

// ---------- план сцены ----------
export const dinnerPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "dinner");
  const m02 = T.from("M02");
  const cut = m02 - 26;
  return {
    len: T.len,
    apasy: T.word("N05", "апасы"),
    cut,
    spoonDown: cut + 14, // ложка касается стола
    m02,
    ordu: T.word("M02", "ордума"),
    m02end: T.to("M02"),
    p01: T.from("P01"),
    ozung: T.word("P01", "өзүң"),
    p01end: T.to("P01"),
  };
};
type Plan = ReturnType<typeof dinnerPlan>;

// ---------- 5A: общий план ----------
const G = {
  dad: { x: 300, y: SEAT, h: H.dad },
  son: { x: 540, y: SEAT, h: H.son },
  mom: { x: 780, y: SEAT, h: H.mom * 0.985 },
} as const;

// Цикл «ложка: пиала → рот → пиала»: доля пути к лицу (0…1).
const eatCycle = (t: number, t0: number, period: number) => {
  const u = (((t - t0) % period) + period) % period / period;
  // вверх 0–0.3, у рта 0.3–0.45, вниз 0.45–0.75, зачерпнуть 0.75–1
  if (u < 0.3) return easeInOut(u / 0.3);
  if (u < 0.45) return 1;
  if (u < 0.75) return 1 - easeInOut((u - 0.45) / 0.3);
  return 0;
};

const WideShot: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const bowlY = 1190;
  // сын: ест ровно, без спешки
  const sonHand = (t: number): Vec => {
    const k = eatCycle(t, -8, 52);
    return { x: 566 - k * 6, y: 1150 - k * 102 };
  };
  const sonPose = (t: number): PoseIn => {
    const k = eatCycle(t, -8, 52);
    return {
      sit: 1,
      seat: SEAT_SON,
      expr: EXPR.calm,
      lookY: 0.55 - k * 0.45,
      nod: 6 - k * 4,
      lean: 4,
      armR: { target: sonHand(t), shape: "fist", item: "spoon", itemTilt: -40 - k * 70, elbow: "down" },
      armL: restArm(G.son, SEAT_SON, -1, 4),
    };
  };
  // папа: подносит ложку, затем с улыбкой смотрит на сына
  const dadHand = (t: number): Vec => {
    const k = t < 44 ? eatCycle(t, 2, 44) : 0;
    return { x: 326 - k * 8, y: 1152 - k * 128 };
  };
  const dadFace = (t: number) => keys(t, [[0, 0.1], [34, 0.12], [44, 0.42], [p.cut, 0.4]]);
  const dadPose = (t: number): PoseIn => {
    const k = t < 44 ? eatCycle(t, 2, 44) : 0;
    return {
      sit: 1,
      seat: SEAT_DAD,
      expr: exprKeys(t, [[0, EXPR.calm], [40, EXPR.calm], [52, EXPR.softSmile]]),
      lookY: t < 42 ? 0.5 - k * 0.45 : 0.2,
      nod: t < 42 ? 5 - k * 3 : 2,
      armR: { target: dadHand(t), shape: "fist", item: "spoon", itemTilt: -40 - k * 70, elbow: "down" },
      armL: restArm(G.dad, SEAT_DAD, -1),
    };
  };
  // мама: помешивает суп, коротко смотрит на сына, снова в пиалу
  const momFace = (t: number) => keys(t, [[0, -0.12], [p.apasy - 6, -0.12], [p.apasy + 4, -0.5], [p.apasy + 22, -0.5], [p.apasy + 32, -0.15]]);
  const momPose = (t: number): PoseIn => {
    const stir = Math.sin(t / 7) * 6 * (t < p.apasy - 4 || t > p.apasy + 30 ? 1 : 0.2);
    const glance = t > p.apasy && t < p.apasy + 28;
    return {
      sit: 1,
      seat: SEAT_MOM,
      expr: glance ? EXPR.softSmile : PENSIVE,
      lookY: glance ? 0.15 : 0.55,
      nod: glance ? 1 : 6,
      armL: { target: { x: G.mom.x - 26 + stir, y: 1150 }, shape: "fist", item: "spoon", itemTilt: 40, elbow: "hang" },
      armR: restArm(G.mom, SEAT_MOM, 1),
    };
  };
  const cam = camKeys(f, [
    [0, { x: 540, y: 1000, zoom: 1.36 }],
    [p.cut, { x: 556, y: 1004, zoom: 1.44 }],
  ]);
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid="s05-dad" look="dadHome" f={f} place={() => G.dad} face={dadFace} pose={dadPose} role="father" seed={2} blinkShift={11} layer={layer} />
      <Actor uid="s05-son" look="sonHome" f={f} place={() => G.son} face={() => 0.04} pose={sonPose} seed={3} blinkShift={37} layer={layer} />
      <Actor uid="s05-mom" look="momHome" f={f} place={() => G.mom} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />
    </>
  );
  const ink = 3.4 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam} tint={C.warmLight}>
      <KitchenBack ink={ink} uid="s05-k" />
      <Svg>
        <KitchenChair x={G.dad.x} ink={ink} />
        <KitchenChair x={G.son.x} ink={ink} child />
        <KitchenChair x={G.mom.x} ink={ink} />
      </Svg>
      {actors("body")}
      <KitchenTable ink={ink} uid="s05-kt" />
      <Svg>
        <Teapot cx={655} y={1166} s={62} ink={ink * 0.8} />
        <Bread cx={418} y={1170} w={84} ink={ink * 0.8} />
        <Cup cx={372} y={1206} w={34} ink={ink * 0.7} />
        <Cup cx={706} y={1206} w={34} ink={ink * 0.7} />
        <Bowl cx={G.dad.x} y={bowlY} w={86} ink={ink * 0.8} />
        <Bowl cx={G.son.x} y={bowlY + 4} w={78} ink={ink * 0.8} />
        <Bowl cx={G.mom.x - 12} y={bowlY} w={84} ink={ink * 0.8} />
        {/* сбоку: телефоны и маленькое школьное расписание */}
        <PhoneFlat cx={196} y={1212} w={34} ink={ink * 0.8} />
        <SheetOnTable cx={884} cy={1182} w={96} rot={-6} ink={ink * 0.5} hi={[0, 1, 1, 1, 0]} />
        <PhoneFlat cx={884} y={1214} w={32} ink={ink * 0.8} color="#6B5A55" />
      </Svg>
      {actors("arms")}
    </Shot>
  );
};

// ---------- 5B: мама и край папы ----------
const SPOON_AT: Vec = { x: 712, y: 1209 }; // ложка на столе (черенок)

const MomShot: React.FC<{ f: number; p: Plan; len: number }> = ({ f, p, len }) => {
  const placed = f >= p.spoonDown;
  // мама: ложка → стол; взгляд вниз; затем к папе
  const momHand = (t: number): Vec =>
    keysV(t, [
      [p.cut, { x: TWO.mom.x - 30, y: 1150 }],
      [p.spoonDown, { x: SPOON_AT.x + 4, y: SPOON_AT.y - 16 }],
      [p.spoonDown + 8, { x: SPOON_AT.x + 2, y: SPOON_AT.y - 20 }],
      [p.spoonDown + 24, restArm(TWO.mom, SEAT_MOM, -1).target],
    ]);
  const momFace = (t: number) =>
    keys(t, [
      [p.cut, -0.12],
      [p.ordu - 10, -0.16],
      [p.ordu + 2, -0.52],
      [p.p01end + 6, -0.5],
    ]);
  const momPose = (t: number): PoseIn => ({
    sit: 1,
    seat: SEAT_MOM,
    expr: exprKeys(t, [
      [p.cut, PENSIVE],
      [p.ordu, EXPR.thinking],
      [p.m02end, EXPR.calm],
      [p.ozung + 10, EXPR.calm],
      [p.p01end, EXPR.softSmile],
    ]),
    lookY: keys(t, [[p.cut, 0.5], [p.spoonDown, 0.62], [p.ordu - 10, 0.58], [p.ordu + 2, 0.04], [p.p01end - 6, 0.04], [p.p01end + 2, 0.3], [p.p01end + 12, 0.08]]),
    nod: keys(t, [[p.cut, 6], [p.ordu - 8, 7], [p.ordu + 4, 1]]),
    headTilt: keys(t, [[p.m02end, 0], [p.ozung + 4, 0], [p.ozung + 16, -3]]),
    armL:
      t < p.spoonDown
        ? { target: momHand(t), shape: "fist", item: "spoon", itemTilt: keys(t, [[p.cut, 40], [p.spoonDown, 70]]), elbow: "hang" }
        : t < p.spoonDown + 8
          ? { target: momHand(t), shape: "open", elbow: "hang" }
          : { target: momHand(t), shape: "relax", elbow: "hang" },
    armR: restArm(TWO.mom, SEAT_MOM, 1),
  });
  // папа: ест, поднимает голову на «Балким», слушает; пауза — брови; P01
  const dadFace = (t: number) => keys(t, [[p.cut, 0.12], [p.m02 + 4, 0.14], [p.m02 + 14, 0.5], [len, 0.52]]);
  const dadPose = (t: number): PoseIn => {
    const g = clamp((t - (p.ozung - 8)) / 10) * (1 - clamp((t - (p.ozung + 30)) / 14));
    return {
      sit: 1,
      seat: SEAT_DAD,
      expr: exprKeys(t, [
        [p.cut, EXPR.calm],
        [p.m02 + 10, EXPR.neutral],
        [p.m02end + 2, EXPR.neutral],
        [p.m02end + 10, LIGHT_SURPRISE],
        [p.p01 - 2, LIGHT_SURPRISE],
        [p.p01 + 12, WARM],
        [p.p01end, EXPR.softSmile],
      ]),
      lookY: keys(t, [[p.cut, 0.45], [p.m02 + 4, 0.45], [p.m02 + 14, 0.02]]),
      nod: keys(t, [[p.cut, 5], [p.m02 + 4, 5], [p.m02 + 14, 0], [p.m02end + 4, 0], [p.m02end + 12, -2], [p.p01 + 6, 1]]),
      headTilt: keys(t, [[p.p01, 0], [p.p01 + 14, 3]]),
      armL: restArm(TWO.dad, SEAT_DAD, -1),
      armR: (() => {
        const r = restArm(TWO.dad, SEAT_DAD, 1, 4);
        return { ...r, target: { x: r.target.x + g * 34, y: r.target.y - g * 46 }, shape: g > 0.3 ? ("open" as const) : ("relax" as const) };
      })(),
    };
  };
  const cam = camKeys(f, [
    [p.cut, { x: 702, y: 1010, zoom: 1.8 }],
    [p.m02end, { x: 694, y: 1006, zoom: 1.84 }],
    [p.p01 - 8, { x: 690, y: 1004, zoom: 1.84 }],
    [p.p01 + 24, { x: 650, y: 1000, zoom: 1.82 }],
    [len, { x: 646, y: 998, zoom: 1.84 }],
  ]);
  const actors = (layer: "body" | "arms") => (
    <>
      <Actor uid="s05-dad" look="dadHome" f={f} place={() => TWO.dad} face={dadFace} pose={dadPose} role="father" seed={2} blinkShift={11} layer={layer} />
      <Actor uid="s05-mom" look="momHome" f={f} place={() => TWO.mom} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />
    </>
  );
  const ink = 3.6 / cam.zoom; // толщина контура в px кадра при зуме плана
  return (
    <Shot f={f} cam={cam} tint={C.warmLight}>
      <KitchenBack ink={ink} uid="s05-k2" />
      <Svg>
        <KitchenChair x={TWO.dad.x} ink={ink} />
        <KitchenChair x={TWO.mom.x} ink={ink} />
      </Svg>
      {actors("body")}
      <KitchenTable ink={ink} uid="s05-kt2" />
      <Svg>
        <Teapot cx={628} y={1162} s={60} ink={ink * 0.8} />
        <Cup cx={566} y={1210} w={34} ink={ink * 0.7} />
        <Bowl cx={TWO.dadBowl} y={1190} w={86} ink={ink * 0.8} />
        <Bowl cx={TWO.momBowl} y={1190} w={84} ink={ink * 0.8} />
        <SheetOnTable cx={TWO.sheet0.x} cy={TWO.sheet0.y} w={96} rot={-6} ink={ink * 0.5} hi={[0, 1, 1, 1, 0]} />
        <PhoneFlat cx={890} y={1216} w={32} ink={ink * 0.8} color="#6B5A55" />
        {placed ? <SpoonFlat x={SPOON_AT.x - 14} y={SPOON_AT.y} len={44} ink={ink * 0.7} dir={1} /> : null}
      </Svg>
      {actors("arms")}
    </Shot>
  );
};

export const S05Dinner: React.FC = () => {
  const { f } = useScene("dinner");
  const p = usePlan(dinnerPlan);
  return f < p.cut ? <WideShot f={f} p={p} /> : <MomShot f={f} p={p} len={p.len} />;
};

// Звук: тёплая тихая комната; мама кладёт ложку.
export const sfxS05Dinner: Sd2SfxPlan = (tl) => {
  const p = dinnerPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.spoonDown - 1, kind: "spoon", volume: 0.32 },
  ];
};
