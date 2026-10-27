// Сцена 2. Она любит шахматы (N02). «Бир нече күн мурун».
// A. Школьный кружок днём: дочка (школьная форма, жёлтая резинка) изучает
//    доску; напротив — мальчик из кружка, в глубине за другим столом —
//    двое детей. Движения второстепенных — спокойные и в разное время.
// B. Крупно: в тетради она ведёт стрелку a1 → a8 и ставит «✓», потом
//    проверяет вариант фигурой — ладья a1 → a8 (настоящий ход, мат по
//    последней горизонтали в учебной позиции).
// C. Дома, вечер, раньше: она только что сделала ход Rh1–h8; папа (без
//    пиджака, как в будущем финале) улыбается и чуть разводит руками,
//    признавая её находку; она радуется сдержанно.
import { AbsoluteFill } from "remotion";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { CH2_TEXT, CLUB_POSITION, MEMORY_POSITION } from "../script";
import { box, Svg, TimeCaption, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { CloseHand, SKIN } from "../props/CloseHand";
import { NotebookArt } from "../props/Notebook";
import type { BoardPiece } from "../props/Chess";
import { ClubFarTable, CLUB_FAR } from "../sets/Club";
import { ROOM } from "../sets/Home";
import { BoardTop, carryHand, GIRL_SEAT, RoomShot, TABLE_Y, TOP_Q, withHeld, type ActorSpec, type CarryKey } from "./shots";
import { DAD_SEATED_PLACE, dadSeated } from "./Reason";
import { H } from "./common";

export const clubPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "club");
  const book = T.word("N02", "Жаңы") - 4;
  const home = T.word("N02", "Кээде") - 6;
  const boardAt = book + Math.max(46, Math.round((home - book) * 0.42));
  const grab = boardAt + 14;
  return { book, boardAt, grab, release: grab + 46, home, len: T.len };
};
type P = ReturnType<typeof clubPlan>;

// Дочка в школе за доской (боковой план, как дома).
export const girlSchool = (pose: ActorSpec["pose"]): ActorSpec => ({ uid: "g-school", look: "girlSchool", place: () => GIRL_SEAT, face: () => 0.85, pose, role: "daughter", seed: 4, blinkShift: 37 });
export const girlSchoolPose = (o: { lookY?: number; expr?: "thinking" | "softSmile" | "calm" } = {}): PoseIn => ({
  sit: 1,
  seat: ROOM.seat,
  expr: o.expr ?? "thinking",
  lookY: o.lookY ?? 0.55,
  lookX: 0.45,
  nod: 5,
  lean: 6,
  armL: { target: { x: 398, y: TABLE_Y }, shape: "relax", elbow: "down" },
  armR: { target: { x: 416, y: TABLE_Y - 6 }, shape: "relax", elbow: "down" },
});

// Дети за дальним столом (в глубине) — тела, стол, руки.
const farKids: ActorSpec[] = [
  {
    uid: "k-braids",
    look: "kidBraids",
    place: () => ({ x: 540, y: CLUB_FAR.floor, h: H.kid * 0.8 }),
    face: () => 0.7,
    pose: (t) => ({ sit: 1, seat: 150, lookY: 0.5, nod: keys(t % 160, [[40, 2], [60, 7], [100, 7], [120, 2]]), armL: { target: { x: 600, y: CLUB_FAR.top - 6 }, elbow: "down" }, armR: { target: { x: 590, y: CLUB_FAR.top - 4 }, elbow: "down" } }),
    seed: 7,
    blinkShift: 11,
  },
  {
    uid: "k-tall",
    look: "kidTall",
    place: () => ({ x: 760, y: CLUB_FAR.floor, h: H.kidTall * 0.8 }),
    face: () => -0.7,
    pose: (t) => ({ sit: 1, seat: 150, lookY: 0.45, expr: "thinking", armL: { target: { x: 700, y: CLUB_FAR.top - 6 - 14 * keys(t % 210, [[90, 0], [104, 1], [130, 1], [146, 0]]) }, shape: "pinch", elbow: "down" }, armR: { target: { x: 716, y: CLUB_FAR.top - 4 }, elbow: "down" } }),
    seed: 9,
    blinkShift: 53,
  },
];
const Kid: React.FC<{ s: ActorSpec; f: number; layer: "body" | "arms" }> = ({ s, f, layer }) => <Actor uid={s.uid} look={s.look} f={f} place={s.place} face={s.face} pose={s.pose} seed={s.seed} blinkShift={s.blinkShift} layer={layer} />;
export const ClubBehind: React.FC<{ f: number }> = ({ f }) => (
  <>
    {farKids.map((s) => (
      <Kid key={s.uid} s={s} f={f} layer="body" />
    ))}
    <ClubFarTable />
    {farKids.map((s) => (
      <Kid key={`${s.uid}-a`} s={s} f={f} layer="arms" />
    ))}
  </>
);

// Мальчик из кружка напротив дочки (на месте, где дома сидит папа).
export const opponent: ActorSpec = {
  uid: "k-boy",
  look: "kidBoy",
  place: () => ({ x: ROOM.dadChair, y: ROOM.floorY, h: H.kid }),
  face: () => -0.85,
  pose: (t) => ({ sit: 1, seat: ROOM.seat, lookY: 0.55, lookX: -0.4, nod: 4, expr: t % 240 < 120 ? "thinking" : "calm", armL: { target: { x: 694, y: TABLE_Y }, elbow: "down" }, armR: { target: { x: 710, y: TABLE_Y - 4 }, elbow: "down" } }),
  seed: 6,
  blinkShift: 23,
};
export const CLUB_CAM = { x: 600, y: 1150, zoom: 1.4 } as const;

const CLUB_AFTER: BoardPiece[] = CLUB_POSITION.pieces.map((p) => (p.id === "wR" ? { ...p, at: CLUB_POSITION.move.to } : p));

const rookKeys = (p: P): CarryKey[] => [
  [p.grab, "a1", 0],
  [p.grab + 10, "a1", 60],
  [p.release - 8, "a8", 40],
  [p.release, "a8", 0],
];

// Тетрадь крупно: карандаш ведёт стрелку a1 → a8 и ставит «✓».
const Book: React.FC<{ k: number }> = ({ k }) => {
  const u = easeInOut(clamp((k - 6) / 26));
  const tip = { x: 150, y: lerp(1010, 800, u) };
  return (
    <AbsoluteFill style={{ backgroundColor: "#C9D3DC" }}>
      <div style={box({ inset: 0, background: "linear-gradient(180deg, #B98A5E, #D2A877)" })} />
      <Svg>
        <g transform="translate(540 960)">
          <NotebookArt w={980} pieces={CLUB_POSITION.pieces} from="a1" to="a8" mark="✓" arrow={clamp((k - 10) / 16)} />
        </g>
        <line x1={tip.x} y1={tip.y} x2={tip.x + 70} y2={tip.y + 120} stroke="#E8B91F" strokeWidth={12} strokeLinecap="round" />
        <CloseHand x={tip.x + 0.42 * 220} y={tip.y + 1.0 * 220} angle={160} size={220} {...SKIN.girlSchool} shape="pinch" armLen={4} />
      </Svg>
      <div style={box({ inset: 0, backgroundColor: "rgba(200,225,255,0.08)" })} />
    </AbsoluteFill>
  );
};

// Воспоминание дома: папа признаёт её ход.
const Memory: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const k = f - p.home;
  const girl: ActorSpec = {
    uid: "g-home",
    look: "girlHome",
    place: () => GIRL_SEAT,
    face: () => 0.85,
    pose: (t) => ({
      sit: 1,
      seat: ROOM.seat,
      lookX: 0.45,
      lookY: keys(t - p.home, [[0, 0.5], [16, -0.1]]),
      expr: t - p.home > 18 ? { browIn: 2, browOut: 3, lid: 0.16, smile: 0.5 } : "thinking",
      armL: { target: { x: 398, y: TABLE_Y }, shape: "relax", elbow: "down" },
      armR: { target: { x: lerp(470, 418, easeInOut(clamp((t - p.home) / 14))), y: TABLE_Y - 6 }, shape: "relax", elbow: "down" },
    }),
    role: "daughter",
    seed: 4,
    blinkShift: 37,
  };
  const spread = easeInOut(clamp((k - 14) / 16)) * (1 - easeInOut(clamp((k - 60) / 18)));
  const dad: ActorSpec = {
    uid: "mem-dad",
    look: "dadShirt",
    place: () => DAD_SEATED_PLACE,
    face: () => -0.85,
    pose: () => ({
      ...dadSeated({ lean: 4 }),
      lookY: k < 10 ? 0.5 : 0.05,
      expr: k < 10 ? "thinking" : { browIn: 4, browOut: 4, lid: 0.12, smile: 0.7 },
      armL: { target: { x: lerp(694, 650, spread), y: lerp(TABLE_Y, TABLE_Y - 70, spread) }, shape: spread > 0.5 ? "open" : "relax", elbow: "down" },
      armR: { target: { x: lerp(716, 780, spread), y: lerp(TABLE_Y, TABLE_Y - 74, spread) }, shape: spread > 0.5 ? "open" : "relax", elbow: "down" },
    }),
    role: "father",
    seed: 2,
  };
  return <RoomShot f={f} cam={{ x: 590, y: 1120, zoom: 1.55 }} girl={girl} dad={dad} pieces={MEMORY_POSITION.pieces} notebook={false} />;
};

export const ClubScene: React.FC = () => {
  const { f } = useScene("club");
  const p = usePlan(clubPlan);
  let body: React.ReactNode;
  if (f < p.book) body = <RoomShot f={f} set="club" cam={CLUB_CAM} girl={girlSchool(() => girlSchoolPose())} dad={opponent} pieces={CLUB_POSITION.pieces} behind={<ClubBehind f={f} />} />;
  else if (f < p.boardAt) body = <Book k={f - p.book} />;
  else if (f < p.home) {
    const h = carryHand(f, TOP_Q, "R", rookKeys(p), p.grab, p.release, { L: 185, angle: 160, rest: { x: 1060, y: 2300 }, approach: 14 });
    const pieces = f > p.release ? CLUB_AFTER : withHeld(CLUB_POSITION.pieces, "wR", h.holding);
    body = (
      <BoardTop
        pieces={pieces}
        tint="rgba(200,225,255,0.10)"
        held={h.holding ? { kind: "R", white: true, x: h.c.x, y: h.c.y, s: h.c.size, lift: h.c.lift } : null}
        hands={[{ wrist: h.wrist, angle: 160, size: 185, skin: SKIN.girlSchool, shape: h.shape }]}
      />
    );
  } else body = <Memory f={f} p={p} />;
  return (
    <>
      {body}
      <TimeCaption text={CH2_TEXT.before} t={f} dur={90} />
    </>
  );
};
