// Сцена 8. Свет в комнате (N06).
// A. Поздний вечер. Тёмный коридор: папа (ещё в пиджаке) делает два
//    спокойных шага к тёплому свету из двери и останавливается. Без шагов
//    в звуке.
// B. Через дверной проём (рамка двери на переднем плане): дочка за
//    доской, лампа, тетрадь.
// C. Крупно: она берёт ферзя с e7, переносит и держит над f7.
//    Вставка: палец на диаграмме в тетради (стрелка e7 → f7 «?»).
//    Снова доска: ферзь в той же руке над f7 возвращается на e7, рука
//    отпускает и отходит. Короли не двигаются.
// D. Шире: папа стоит в дверях и смотрит; дочка его ещё не заметила.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { POSITION_A } from "../script";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { CORRIDOR, CorridorBack, ROOM } from "../sets/Home";
import { CloseHand, SKIN } from "../props/CloseHand";
import { NotebookArt } from "../props/Notebook";
import { BoardTop, carryHand, GIRL_SEAT, RoomShot, TABLE_Y, TOP_Q, withHeld, type ActorSpec, type CarryKey } from "./shots";
import { H } from "./common";

export const lightPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "light");
  const walk: [number, number] = [8, 62];
  const door = Math.max(walk[1] + 24, T.word("N06", "кызын") - 2);
  const close = T.to("N06") + 8;
  const grab = close + 16;
  const over = grab + 26; // ферзь над f7
  const book: [number, number] = [over + 10, over + 40];
  const back = book[1] + 8;
  const set = back + 16; // основание на e7
  const release = set + 4;
  const wide = release + 16;
  return { walk, door, close, grab, over, book, back, set, release, wide, len: T.len };
};
type P = ReturnType<typeof lightPlan>;

// Дочка за доской: смотрит на доску, кисти на столе. Общая поза сцен 8–9.
export const girlAtBoard = (o: { lookY?: number; lookX?: number; expr?: "thinking" | "calm" | "softSmile"; nod?: number } = {}) => ({
  sit: 1,
  seat: ROOM.seat,
  expr: o.expr ?? ("thinking" as const),
  lookY: o.lookY ?? 0.6,
  lookX: o.lookX ?? 0.45,
  nod: o.nod ?? 5,
  lean: 6,
  armL: { target: { x: 398, y: TABLE_Y }, shape: "relax" as const, elbow: "down" as const },
  armR: { target: { x: 416, y: TABLE_Y - 6 }, shape: "relax" as const, elbow: "down" as const },
});

export const GIRL_SPEC = (pose: ActorSpec["pose"], face: ActorSpec["face"] = () => 0.85): ActorSpec => ({
  uid: "g-home",
  look: "girlHome",
  place: () => GIRL_SEAT,
  face,
  pose,
  role: "daughter",
  seed: 4,
  blinkShift: 37,
});

// ---------- A. Коридор ----------
const Corridor: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const place = (t: number): Place => ({ x: lerp(330, 600, cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3)), y: CORRIDOR.floorY, h: H.dad });
  const face = (t: number) => (t < p.walk[1] + 4 ? 0.6 : keys(t, [[p.walk[1] + 4, 0.6], [p.walk[1] + 18, 0.75]]));
  const pose = (t: number) => ({
    expr: t > p.walk[1] + 10 ? ({ browIn: 4, browOut: 3, lid: 0.1, smile: 0.05 } as const) : ("calm" as const),
    lookY: 0.1,
    lookX: 0.2,
    armL: { target: null },
    armR: { target: null },
  });
  return (
    <Shot f={f} cam={{ x: 640, y: 1130, zoom: 1.32 }} bg="#6E6A7E">
      <CorridorBack />
      <Actor uid="l-dad" look="dadSuit" f={f} place={place} face={face} pose={pose} role="father" seed={2} walkFrom={p.walk[0] - 2} />
      {/* тёплый свет из двери на лице и плече */}
      <div style={box({ left: 520, top: 700, width: 600, height: 900, background: "radial-gradient(ellipse at 100% 40%, rgba(255,200,120,0.28), rgba(255,200,120,0) 60%)" })} />
    </Shot>
  );
};

// ---------- B / D. Комната ----------
const queenKeys = (p: P): CarryKey[] => [
  [p.grab, "e7", 0],
  [p.grab + 12, "e7", 70],
  [p.over, POSITION_A.tryAt, 34],
  [p.back, POSITION_A.tryAt, 34],
  [p.set - 6, "e7", 26],
  [p.set, "e7", 0],
];

const Room: React.FC<{ f: number; p: P; through: boolean }> = ({ f, p, through }) => {
  const girl = GIRL_SPEC((t) => girlAtBoard({ lookY: t < p.door + 30 ? 0.55 : 0.4, expr: "thinking" }));
  const dad: ActorSpec | undefined = through
    ? undefined
    : {
        uid: "l-dad2",
        look: "dadSuit",
        place: () => ({ x: 1004, y: ROOM.floorY - 40, h: H.dad * 0.95 }),
        face: () => -0.55,
        pose: () => ({ expr: { browIn: 3, browOut: 2, lid: 0.12, smile: 0.2 }, lookY: 0.35, armL: { target: null }, armR: { target: { x: 960, y: ROOM.floorY - 470 }, shape: "relax", elbow: "down" } }),
        role: "father",
        seed: 2,
        free: true,
      };
  const cam = through ? { x: 430, y: 1080, zoom: 1.45 } : { x: 640, y: 1080, zoom: lerp(1.18, 1.22, clamp((f - p.wide) / 60)) };
  return (
    <AbsoluteFill>
      <RoomShot f={f} cam={cam} girl={girl} dad={dad} pieces={POSITION_A.pieces} doorLight={0.4} />
      {through ? (
        // рамка двери на переднем плане (взгляд папы из коридора)
        <>
          <div style={box({ left: 0, top: 0, width: 56, height: 1920, backgroundColor: "#3E3A4C" })} />
          <div style={box({ left: 990, top: 0, width: 90, height: 1920, backgroundColor: "#3E3A4C" })} />
          <div style={box({ left: 56, top: 0, width: 20, height: 1920, backgroundColor: "#57536A" })} />
          <div style={box({ left: 970, top: 0, width: 20, height: 1920, backgroundColor: "#57536A" })} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- C. Крупно: ферзь ----------
const HAND_L = 185;
const REST = { x: 1060, y: 2300 };

export const QueenTry: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const h = carryHand(f, TOP_Q, "Q", queenKeys(p), p.grab, p.release, { L: HAND_L, angle: 158, rest: REST, approach: 18 });
  const pieces = withHeld(POSITION_A.pieces, "wQ", h.holding);
  return (
    <BoardTop
      pieces={pieces}
      held={h.holding ? { kind: "Q", white: true, x: h.c.x, y: h.c.y, s: h.c.size, lift: h.c.lift } : null}
      hands={[{ wrist: h.wrist, angle: 158, size: HAND_L, skin: SKIN.girl, shape: h.shape }]}
    />
  );
};

// Вставка: тетрадь, палец ведёт по стрелке e7 → f7.
const Book: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = f - p.book[0];
  const u = easeInOut(clamp((k - 6) / 22));
  const tip = { x: lerp(318, 372, u), y: lerp(816, 812, u) };
  const L = 220;
  return (
    <AbsoluteFill style={{ backgroundColor: "#C99A68" }}>
      <div style={box({ inset: 0, background: "linear-gradient(180deg, #A97A50, #D2A877)" })} />
      <Svg>
        <g transform="translate(540 980)">
          <NotebookArt w={960} />
        </g>
        <CloseHand x={tip.x + 0.3 * L} y={tip.y + 1.0 * L} angle={164} size={L} {...SKIN.girl} shape="point" mirror armLen={4} />
      </Svg>
      <div style={box({ inset: 0, backgroundColor: "rgba(255,190,100,0.12)" })} />
    </AbsoluteFill>
  );
};

export const LightScene: React.FC = () => {
  const { f } = useScene("light");
  const p = usePlan(lightPlan);
  if (f < p.door) return <Corridor f={f} p={p} />;
  if (f < p.close) return <Room f={f} p={p} through />;
  if (f >= p.book[0] && f < p.book[1]) return <Book f={f} p={p} />;
  if (f < p.wide) return <QueenTry f={f} p={p} />;
  return <Room f={f} p={p} through={false} />;
};
