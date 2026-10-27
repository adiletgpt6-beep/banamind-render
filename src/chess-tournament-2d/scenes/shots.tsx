// Общие планы, которые повторяются в нескольких сценах, чтобы предметы и
// стороны не менялись между склейками:
//   • RoomShot — комната дочки сбоку (дочка слева, папа справа, доска
//     между ними, лампа, тетрадь, свободный стул для пиджака);
//   • BoardTop — крупный план доски сверху со стороны белых (a1 слева
//     внизу, тёмное; h1 справа внизу, светлое) с рукой и фигурой в ней;
//   • carry — путь фигуры в руке: подход кисти, захват за верх, подъём,
//     перенос, опускание основания точно на клетку, отпускание, отвод.
import { AbsoluteFill } from "remotion";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import type { LookId } from "../rig/looks";
import { clamp, easeInOut, lerp, type Vec } from "../rig/motion";
import type { Ch2Role, PieceKind } from "../script";
import { C } from "../theme";
import { box, type Cam, Shot, Svg } from "../kit";
import { Board, FreePiece, pieceTop, squareAt, type BoardPiece, type BoardQuad } from "../props/Chess";
import { CloseHand, type CloseShape } from "../props/CloseHand";
import { JacketOnChair, Lamp, NotebookFlat, ROOM, RoomBack, RoomBoard, RoomChairs, RoomTable } from "../sets/Home";
import { H } from "./common";
import { ClubBack } from "../sets/Club";

export type ActorSpec = {
  readonly uid: string;
  readonly look: LookId;
  readonly place: (t: number) => Place;
  readonly face: (t: number) => number;
  readonly pose: (t: number) => PoseIn;
  readonly role?: Ch2Role;
  readonly seed: number;
  readonly blinkShift?: number;
  readonly walkFrom?: number;
  // стоит/идёт вне стола — рисуется целиком поверх стола
  readonly free?: boolean;
};

// Места за столом комнаты.
export const GIRL_SEAT: Place = { x: ROOM.girlChair, y: ROOM.floorY, h: H.girl };
export const DAD_SEAT: Place = { x: ROOM.dadChair, y: ROOM.floorY, h: H.dad };
// Уровень столешницы для кистей.
export const TABLE_Y = ROOM.table.top - 12;

const A: React.FC<{ s: ActorSpec; f: number; layer: "all" | "body" | "arms" }> = ({ s, f, layer }) => (
  <Actor uid={s.uid} look={s.look} f={f} place={s.place} face={s.face} pose={s.pose} role={s.role} seed={s.seed} blinkShift={s.blinkShift} walkFrom={s.walkFrom} layer={layer} />
);

export const RoomShot: React.FC<{
  readonly f: number;
  readonly cam: Cam;
  readonly girl?: ActorSpec;
  readonly dad?: ActorSpec;
  readonly mom?: ActorSpec; // в дверном проёме (за стульями)
  readonly pieces: readonly BoardPiece[];
  readonly jacket?: boolean;
  readonly doorLight?: number;
  readonly notebook?: boolean;
  readonly overTable?: React.ReactNode;
  readonly over?: React.ReactNode;
  // кружок в школе: тот же стол сбоку, дневной класс вместо комнаты
  readonly set?: "room" | "club";
  readonly behind?: React.ReactNode; // фон за стульями (дети)
  readonly extras?: readonly ActorSpec[]; // стоят за столом (тренер, мама)
}> = ({ f, cam, girl, dad, mom, pieces, jacket = false, doorLight = 0.6, notebook = true, overTable, over, set = "room", behind, extras = [] }) => (
  <Shot f={f} cam={cam} bg={set === "club" ? C.wallDay : C.wallNight}>
    {set === "club" ? <ClubBack /> : <RoomBack doorLight={doorLight} />}
    {behind}
    {mom ? <A s={mom} f={f} layer="all" /> : null}
    <RoomChairs />
    {jacket ? <JacketOnChair /> : null}
    {girl ? <A s={girl} f={f} layer="body" /> : null}
    {dad && !dad.free ? <A s={dad} f={f} layer="body" /> : null}
    {extras.map((e) => (
      <A key={e.uid} s={e} f={f} layer="body" />
    ))}
    <RoomTable />
    {notebook ? <NotebookFlat /> : null}
    {set === "room" ? <Lamp /> : null}
    <RoomBoard pieces={pieces} glow={set === "room" ? 1 : 0} />
    {overTable}
    {girl ? <A s={girl} f={f} layer="arms" /> : null}
    {dad && !dad.free ? <A s={dad} f={f} layer="arms" /> : null}
    {extras.map((e) => (
      <A key={`${e.uid}-a`} s={e} f={f} layer="arms" />
    ))}
    {dad?.free ? <A s={dad} f={f} layer="all" /> : null}
    {over}
  </Shot>
);

// ---------- Крупный план доски ----------
// Фигуры крупного плана чуть выше клетки (вид немного сбоку).
export const TOP_SCALE = 1.3;
// Со стороны белых (дочка): 1-й ряд внизу, a слева.
export const TOP_Q: BoardQuad = {
  a1: { x: 40, y: 1500 },
  h1: { x: 1040, y: 1500 },
  h8: { x: 930, y: 600 },
  a8: { x: 150, y: 600 },
};
// Со стороны папы (камера за папой): доска повернута на 180° — 8-й ряд
// внизу, h слева; координаты фигур те же.
export const DAD_Q: BoardQuad = {
  h8: { x: 40, y: 1500 },
  a8: { x: 1040, y: 1500 },
  a1: { x: 930, y: 600 },
  h1: { x: 150, y: 600 },
};

// Путь фигуры: ключи [кадр, клетка или точка, подъём px]. Между ключами —
// плавно. Возвращает основание фигуры (точка на доске под ней), подъём и
// размер клетки в этой точке.
export type CarryKey = readonly [number, string | Vec, number];
export const carryAt = (f: number, q: BoardQuad, keys: readonly CarryKey[]) => {
  const pt = (k: CarryKey) => (typeof k[1] === "string" ? squareAt(q, k[1]) : { ...k[1], size: squareAt(q, "d4").size });
  if (f <= keys[0][0]) return { ...pt(keys[0]), lift: keys[0][2] };
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const a = pt(keys[i - 1]);
      const b = pt(keys[i]);
      const u = easeInOut((f - keys[i - 1][0]) / Math.max(1, keys[i][0] - keys[i - 1][0]));
      return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), size: lerp(a.size, b.size, u), lift: lerp(keys[i - 1][2], keys[i][2], u) };
    }
  }
  const last = keys[keys.length - 1];
  return { ...pt(last), lift: last[2] };
};

// Кисть крупно, держащая фигуру за верх: запястье по точке захвата.
// angle — направление кисти (180 — пальцы вверх, 160 — снизу справа).
export const wristForGrip = (grip: Vec, L: number, angle: number): Vec => {
  const r = (angle * Math.PI) / 180;
  const d = 0.92 * L;
  return { x: grip.x + d * Math.sin(r), y: grip.y - d * Math.cos(r) };
};
export const gripOf = (kind: PieceKind, base: Vec, s: number, lift: number): Vec => ({ x: base.x, y: base.y - lift - pieceTop(kind, s) * 0.78 });

export type HandSpec = {
  readonly wrist: Vec;
  readonly angle: number;
  readonly size: number;
  readonly skin: { skin: string; shade: string; sleeve: string; cuff?: string };
  readonly shape: CloseShape;
  readonly mirror?: boolean;
};

export const BoardTop: React.FC<{
  readonly q?: BoardQuad;
  readonly pieces: readonly BoardPiece[];
  readonly held?: { readonly kind: PieceKind; readonly white: boolean; readonly x: number; readonly y: number; readonly s: number; readonly lift: number } | null;
  readonly hands?: readonly HandSpec[];
  readonly highlight?: string;
  readonly tint?: string; // тёплый свет лампы / дневной
  readonly children?: React.ReactNode;
  readonly under?: React.ReactNode; // предметы на столе под фигурами (коробка)
  readonly zoom?: number;
}> = ({ q = TOP_Q, pieces, held, hands = [], highlight, tint = "rgba(255,190,100,0.14)", children, under, zoom = 1 }) => {
  const bottom = Math.max(q.a1.y, q.h1.y, q.a8.y, q.h8.y);
  const left = Math.min(q.a1.x, q.h1.x, q.a8.x, q.h8.x);
  const right = Math.max(q.a1.x, q.h1.x, q.a8.x, q.h8.x);
  return (
    <AbsoluteFill style={{ backgroundColor: "#B98A5E", overflow: "hidden" }}>
      <div style={box({ inset: 0, transform: `scale(${zoom})`, transformOrigin: "50% 60%" })}>
        {/* столешница с волокнами */}
        <div style={box({ inset: 0, background: "linear-gradient(180deg, #A97A50, #C99A68 55%, #D2A877)" })} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={box({ left: -100, top: 160 + i * 300, width: 1300, height: 6, backgroundColor: "rgba(120,80,45,0.18)", transform: `rotate(${(i % 2) * 2 - 1}deg)` })} />
        ))}
        {under}
        <Svg>
          <polygon points={`${left - 40},${bottom + 60} ${right + 40},${bottom + 60} ${right + 20},${bottom + 92} ${left - 20},${bottom + 92}`} fill="rgba(40,25,15,0.25)" />
          <Board q={q} pieces={pieces} scale={TOP_SCALE} edge={0.4} thickness={22} highlight={highlight} />
          {held ? <FreePiece kind={held.kind} white={held.white} x={held.x} y={held.y} s={held.s * TOP_SCALE} lift={held.lift} /> : null}
          {hands.map((h, i) => (
            <CloseHand key={i} x={h.wrist.x} y={h.wrist.y} angle={h.angle} size={h.size} {...h.skin} shape={h.shape} mirror={h.mirror} armLen={4} />
          ))}
        </Svg>
        {children}
      </div>
      <div style={box({ inset: 0, backgroundColor: tint, pointerEvents: "none" })} />
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,20,10,0.32) 100%)" })} />
    </AbsoluteFill>
  );
};

// Кисть, которая несёт фигуру по ключам carry: до захвата подходит к
// фигуре от точки rest, после отпускания отходит обратно.
export const carryHand = (
  f: number,
  q: BoardQuad,
  kind: PieceKind,
  keys: readonly CarryKey[],
  grab: number,
  release: number,
  opts: { readonly L: number; readonly angle: number; readonly rest: Vec; readonly approach?: number },
) => {
  const c = carryAt(f, q, keys);
  const s = c.size * TOP_SCALE;
  const grip = gripOf(kind, c, s, c.lift);
  const at = wristForGrip(grip, opts.L, opts.angle);
  const ap = opts.approach ?? 16;
  let wrist = at;
  let shape: CloseShape = "pinch";
  if (f < grab) {
    const u = easeInOut(clamp((f - (grab - ap)) / ap));
    wrist = { x: lerp(opts.rest.x, at.x, u), y: lerp(opts.rest.y, at.y, u) };
    shape = u > 0.7 ? "pinch" : "rest";
  } else if (f > release) {
    const u = easeInOut(clamp((f - release) / ap));
    wrist = { x: lerp(at.x, opts.rest.x, u), y: lerp(at.y, opts.rest.y, u) };
    shape = u > 0.3 ? "rest" : "pinch";
  }
  const holding = f >= grab && f <= release;
  return { c, wrist, shape, holding };
};

// Фигуры с учётом поднятой: held — на доске её нет (она в руке).
export const withHeld = (pieces: readonly BoardPiece[], id: string, holding: boolean, at?: string): BoardPiece[] =>
  pieces.map((p) => (p.id === id ? { ...p, held: holding, at: at ?? p.at } : p));
