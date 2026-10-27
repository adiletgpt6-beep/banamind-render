// Сцена 13. Мама пишет тренеру (N08) и вставка в комнату.
// A. Тот же телефон мамы: переписка «Машыктыруучу» с его прежним
//    сообщением. Касание поля, короткий текст набирается, касание
//    отправки — сообщение уходит. Ответа тренера нет.
// B. Комната: дочка заканчивает расстановку новой задачи — короли уже на
//    a1 и c2; она снимает ферзя с e7 и ставит в коробку, берёт из коробки
//    чёрную ладью и ставит на c8. Без морфинга: одна фигура уходит,
//    другая приходит, каждая в руке.
import { clamp } from "../rig/motion";
import { CH2_TEXT, POSITION_B, type Piece } from "../script";
import { box, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { CHAT_INPUT, CHAT_SEND, ChatScreen, PhoneClose } from "../props/Phone";
import { SKIN } from "../props/CloseHand";
import { FreePiece, squareAt, type BoardPiece } from "../props/Chess";
import { BoardTop, carryHand, TOP_Q, TOP_SCALE, type CarryKey } from "./shots";

export const coachPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "coach");
  const input = 8;
  const typeFrom = 18;
  const send = Math.max(typeFrom + 70, T.word("N08", "эми") - 2);
  const room = Math.max(send + 34, T.to("N08") + 6);
  const q = { grab: room + 18, release: room + 54 }; // ферзь → коробка
  const r = { grab: room + 76, release: room + 112 }; // ладья → c8
  return { input, typeFrom, typeTo: send - 8, send, room, q, r, len: T.len };
};
type P = ReturnType<typeof coachPlan>;

// Открытая коробка для фигур справа внизу у доски.
const BOX_Q = { x: 830, y: 1735 };
const BOX_R = { x: 960, y: 1735 };
const PieceBox: React.FC = () => (
  <div style={box({ left: 700, top: 1630, width: 360, height: 190, backgroundColor: "#6B4A33", borderRadius: 14 })}>
    <div style={box({ left: 16, top: 16, width: 328, height: 158, backgroundColor: "#2F5C4A", borderRadius: 10 })} />
  </div>
);

// Короли уже на местах новой задачи; ферзь пока на e7, ладья в коробке.
const KINGS = POSITION_B.pieces.filter((x) => x.kind === "K") as BoardPiece[];
const QUEEN: Piece = { id: "wQ", kind: "Q", white: true, at: "e7" };
const ROOK = POSITION_B.pieces.find((x) => x.kind === "R")!;

const qKeys = (p: P): CarryKey[] => [
  [p.q.grab, "e7", 0],
  [p.q.grab + 12, "e7", 80],
  [p.q.release - 10, BOX_Q, 60],
  [p.q.release, BOX_Q, 0],
];
const rKeys = (p: P): CarryKey[] => [
  [p.r.grab, BOX_R, 0],
  [p.r.grab + 12, BOX_R, 70],
  [p.r.release - 10, "c8", 40],
  [p.r.release, "c8", 0],
];

const RoomInsert: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const L = 185;
  const rest = { x: 1080, y: 2300 };
  const useQ = f < (p.q.release + p.r.grab) / 2;
  const h = useQ
    ? carryHand(f, TOP_Q, "Q", qKeys(p), p.q.grab, p.q.release, { L, angle: 158, rest, approach: 18 })
    : carryHand(f, TOP_Q, "R", rKeys(p), p.r.grab, p.r.release, { L, angle: 158, rest, approach: 18 });
  const pieces: BoardPiece[] = [...KINGS];
  if (f < p.q.grab) pieces.push(QUEEN);
  if (f > p.r.release) pieces.push(ROOK);
  const held = h.holding ? { kind: useQ ? ("Q" as const) : ("R" as const), white: useQ, x: h.c.x, y: h.c.y, s: h.c.size, lift: h.c.lift } : null;
  const s = squareAt(TOP_Q, "d4").size * TOP_SCALE;
  return (
    <BoardTop
      pieces={pieces}
      held={held}
      hands={[{ wrist: h.wrist, angle: 158, size: L, skin: SKIN.girl, shape: h.shape }]}
      under={
        <>
          <PieceBox />
          <Svg>
            {f > p.q.release ? <FreePiece kind="Q" white x={BOX_Q.x} y={BOX_Q.y} s={s} lift={0} /> : null}
            {f < p.r.grab ? <FreePiece kind="R" white={false} x={BOX_R.x} y={BOX_R.y} s={s} lift={0} /> : null}
          </Svg>
        </>
      }
    />
  );
};

export const CoachScene: React.FC = () => {
  const { f } = useScene("coach");
  const p = usePlan(coachPlan);
  if (f >= p.room) return <RoomInsert f={f} p={p} />;
  const typed = clamp((f - p.typeFrom) / (p.typeTo - p.typeFrom));
  return (
    <PhoneClose f={f} taps={[{ at: p.input, tip: CHAT_INPUT }, { at: p.send, tip: CHAT_SEND }]} skin={SKIN.mom} caseColor="#C9786A">
      <ChatScreen incoming={CH2_TEXT.coachMsg} draft={CH2_TEXT.momMsg} typed={f < p.typeFrom ? 0 : typed} sent={f >= p.send + 2 ? f - p.send - 2 : -1} />
    </PhoneClose>
  );
};
