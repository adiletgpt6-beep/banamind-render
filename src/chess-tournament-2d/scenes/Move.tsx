// Сцена 14. «Папа, теперь твой ход» (D04).
// A. Родители возвращаются в комнату: папа (ещё в пиджаке) входит и
//    останавливается у своего стула, мама остаётся в дверях и не
//    закрывает доску. На доске — новая позиция (Ka1; Kc2, Rc8, ход
//    чёрных): дочка поворачивается к папе.
// B. Новая позиция крупно (со стороны белых).
// C. D04 — лицо дочки: легко улыбается и приглашает папу к столу.
// D. Папа улыбается. Пиджак снимается в двух ясных планах: руки у
//    лацканов, плечи назад → крупно: пиджак в руках (руки уже в рукавах
//    рубашки) ложится на спинку соседнего стула, руки отпускают.
// E. Папа в той же рубашке садится напротив дочки; пиджак остаётся на
//    спинке стула. Он изучает позицию и подносит руку к ладье c8 — не
//    касаясь и не раскрывая решения. Дочка ждёт его хода.
// F. Последний человеческий кадр: папа без пиджака напротив дочки, новая
//    позиция между ними, мама улыбается в дверях.
import { AbsoluteFill } from "remotion";
import { type Place } from "../rig/Actor";
import { clamp, cruise, easeInOut, keys, lerp } from "../rig/motion";
import { POSITION_B } from "../script";
import { C } from "../theme";
import { box, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { ROOM, ROOM_BOARD } from "../sets/Home";
import { CloseHand, SKIN } from "../props/CloseHand";
import { squareAt } from "../props/Chess";
import { BoardTop, RoomShot, TOP_Q, type ActorSpec } from "./shots";
import { GIRL_SPEC, girlAtBoard } from "./Light";
import { dadSeated, ROOM_CAMS } from "./Reason";
import { H, sitDown } from "./common";

export const movePlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "move");
  const d04 = T.from("D04");
  const d04End = T.to("D04");
  const smile = d04End + 6;
  const lapels = smile + 26; // руки у лацканов
  const hang = lapels + 34; // пиджак на спинку стула
  const seat = hang + 44; // садится в рубашке
  const reach = seat + 48; // крупно: рука к ладье
  const last = reach + 44; // последний человеческий кадр
  return { enter: [0, 44] as const, board: [50, Math.max(56, d04 - 6)] as const, d04, d04End, smile, lapels, hang, seat, reach, last, len: T.len };
};
type P = ReturnType<typeof movePlan>;

const DOOR: Place = { x: 1020, y: ROOM.floorY - 40, h: H.dad * 0.95 };
const STAND: Place = { x: 915, y: ROOM.floorY, h: H.dad };
const CHAIR: Place = { x: ROOM.dadChair, y: ROOM.floorY, h: H.dad };
const MOM: Place = { x: 975, y: ROOM.floorY - 44, h: H.mom * 0.95 };

const momSpec: ActorSpec = {
  uid: "mv-mom",
  look: "momHome",
  place: () => MOM,
  face: () => -0.5,
  pose: () => ({ expr: "softSmile", lookY: 0.4, lookX: -0.3, armL: { target: null }, armR: { target: null } }),
  role: "mother",
  seed: 5,
  blinkShift: 19,
};

// Над ладьёй c8 в боковом плане (кисть папы останавливается здесь).
const ROOK_ABOVE = (() => {
  const s = squareAt(ROOM_BOARD, "c8");
  return { x: s.x + 14, y: s.y - 34 };
})();

const dadPlaceOf = (p: P) => (t: number): Place => {
  if (t < p.enter[1]) {
    const u = cruise(clamp((t - p.enter[0]) / (p.enter[1] - p.enter[0])), 0.3);
    return { x: lerp(DOOR.x, STAND.x, u), y: lerp(DOOR.y, STAND.y, u), h: lerp(DOOR.h, STAND.h, u) };
  }
  if (t < p.seat) return STAND;
  const u = cruise(clamp((t - p.seat) / 16), 0.3);
  return { x: lerp(STAND.x, CHAIR.x, u), y: CHAIR.y, h: CHAIR.h };
};

const dadPoseOf = (p: P) => (t: number) => {
  const s = sitDown(t, p.seat + 18, 34);
  const lap = keys(t, [[p.lapels, 0], [p.lapels + 12, 1], [p.hang, 1]]);
  const reachK = keys(t, [[p.seat + 54, 0], [p.seat + 70, 1]]);
  const seated = dadSeated({ lookY: 0.5 });
  if (t < p.seat + 18) {
    const chestY = ROOM.floorY - 548 + 10 * (1 - lap);
    return {
      expr: t < p.d04End ? ("calm" as const) : ({ browIn: 3, browOut: 4, lid: 0.12, smile: 0.7 } as const),
      lookY: 0.32,
      lookX: -0.4,
      shoulders: -0.4 * lap,
      // кисти берутся за лацканы на груди, плечи уходят назад
      armL: lap > 0.01 ? { target: { x: STAND.x - 26, y: chestY }, shape: "pinch" as const, elbow: "down" as const, behind: false } : { target: null },
      armR: lap > 0.01 ? { target: { x: STAND.x + 4, y: chestY + 6 }, shape: "pinch" as const, elbow: "down" as const, behind: false } : { target: null },
    };
  }
  return {
    ...seated,
    sit: s.sit,
    lean: s.lean + 6 * reachK,
    expr: { browIn: 2, browOut: 2, lid: 0.18, smile: 0.35 },
    lookY: 0.6,
    armL: reachK > 0 ? { target: { x: lerp(694, ROOK_ABOVE.x, reachK), y: lerp(seated.armL.target.y, ROOK_ABOVE.y, reachK) }, shape: "pinch" as const, elbow: "down" as const, behind: false } : seated.armL,
  };
};

export const MoveScene: React.FC = () => {
  const { f } = useScene("move");
  const p = usePlan(movePlan);
  const inShirt = f >= p.hang;
  const dad: ActorSpec = {
    uid: inShirt ? "mv-dad2" : "mv-dad",
    look: inShirt ? "dadShirt" : "dadSuit",
    place: dadPlaceOf(p),
    face: (t) => (t < p.enter[1] - 8 ? -0.5 : -0.85),
    pose: dadPoseOf(p),
    role: "father",
    seed: 2,
    walkFrom: 0,
    free: f < p.seat + 18,
  };
  const girl = GIRL_SPEC((t) => {
    const base = girlAtBoard({ expr: "calm" });
    const invite = keys(t, [[p.d04 + 20, 0], [p.d04 + 36, 1], [p.d04End + 10, 1], [p.d04End + 24, 0]]);
    return {
      ...base,
      lookY: t < p.enter[0] + 16 ? 0.5 : t >= p.seat + 40 ? 0.45 : -0.25,
      lookX: 0.6,
      expr: t < p.d04 - 10 ? ({ browIn: 3, browOut: 3, lid: 0.1, smile: 0.35 } as const) : ({ browIn: 2, browOut: 3, lid: 0.12, smile: 0.6 } as const),
      armR: invite > 0.01 ? { target: { x: lerp(416, 470, invite), y: lerp(base.armR.target.y, 1230, invite) }, shape: "open" as const, elbow: "down" as const } : base.armR,
    };
  });
  const room = (cam: { x: number; y: number; zoom: number }) => <RoomShot f={f} cam={cam} girl={girl} dad={dad} mom={momSpec} pieces={POSITION_B.pieces} jacket={inShirt} doorLight={0.5} />;

  if (f >= p.board[0] && f < p.board[1]) return <BoardTop pieces={POSITION_B.pieces} />;
  if (f >= p.hang && f < p.seat) return <JacketHang k={f - p.hang} />;
  if (f >= p.reach && f < p.last) return <ReachRook k={f - p.reach} />;
  if (f < p.board[0]) return room(ROOM_CAMS.wide);
  if (f < p.d04End + 4) return room(ROOM_CAMS.girl);
  if (f < p.lapels) return room({ x: 880, y: 1030, zoom: 2.0 });
  if (f < p.hang) return room({ x: 860, y: 1090, zoom: 1.7 });
  if (f < p.reach) return room({ x: 680, y: 1150, zoom: 1.22 });
  return room({ x: 680, y: 1150, zoom: lerp(1.22, 1.27, clamp((f - p.last) / 90)) });
};

// Крупно: пиджак в руках (рукава рубашки) ложится на спинку стула.
const JacketHang: React.FC<{ k: number }> = ({ k }) => {
  const drop = easeInOut(clamp(k / 24));
  const release = easeInOut(clamp((k - 26) / 12));
  const jy = lerp(500, 760, drop);
  const L = 250;
  return (
    <AbsoluteFill style={{ backgroundColor: C.wallNight }}>
      <div style={box({ inset: 0, background: `radial-gradient(ellipse at 20% 70%, ${C.amberGlow}, rgba(0,0,0,0) 60%)` })} />
      {/* спинка соседнего стула крупно */}
      <div style={box({ left: 470, top: 700, width: 140, height: 1300, backgroundColor: "#9A765A", borderRadius: 30 })} />
      <div style={box({ left: 450, top: 680, width: 180, height: 120, backgroundColor: "#A88466", borderRadius: 36 })} />
      <Svg>
        {/* пиджак перекинут через спинку: полы и воротник */}
        <g transform={`translate(540 ${jy})`}>
          <path d="M -150 0 Q 0 -60 150 0 L 190 820 Q 0 880 -190 820 Z" fill="#2E3D5C" />
          <path d="M -150 0 Q -230 380 -205 760" stroke="#24314B" strokeWidth={70} fill="none" strokeLinecap="round" />
          <path d="M -40 -20 L 10 300 L 80 -10" stroke="#24314B" strokeWidth={16} fill="none" strokeLinejoin="round" />
          <path d="M -150 0 Q 0 -60 150 0" stroke="#24314B" strokeWidth={22} fill="none" />
        </g>
        {/* руки держат воротник сверху и отпускают */}
        <CloseHand x={lerp(390, 300, release)} y={lerp(jy - 200, jy - 420, release)} angle={-20} size={L} {...SKIN.dadShirt} shape={release > 0.3 ? "open" : "pinch"} mirror armLen={4} />
        <CloseHand x={lerp(690, 780, release)} y={lerp(jy - 200, jy - 420, release)} angle={20} size={L} {...SKIN.dadShirt} shape={release > 0.3 ? "open" : "pinch"} armLen={4} />
      </Svg>
    </AbsoluteFill>
  );
};

// Крупно со стороны белых: папина рука (рукав рубашки) приходит сверху,
// со стороны чёрных, и останавливается над ладьёй c8, не касаясь её.
const ReachRook: React.FC<{ k: number }> = ({ k }) => {
  const L = 200;
  const rook = squareAt(TOP_Q, "c8");
  const tip = { x: rook.x, y: rook.y - rook.size * 1.15 };
  const near = { x: tip.x - 0.17 * L, y: tip.y - 1.1 * L };
  const u = easeInOut(clamp(k / 22));
  const wrist = { x: lerp(near.x + 160, near.x, u), y: lerp(-320, near.y, u) };
  return <BoardTop pieces={POSITION_B.pieces} hands={[{ wrist, angle: 0, size: L, skin: SKIN.dadShirt, shape: "point" }]} />;
};
