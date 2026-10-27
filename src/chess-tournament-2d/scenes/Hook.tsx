// Сцена 1. Отказ и доска (N01) — сразу событие, без заставки и рекламы.
// A. Телефон родителей: короткое сообщение «Машыктыруучу» — «Кызыңыз
//    турнирге катышпоону чечти.» Без всплывающих ошибок и красного.
// B. Монтажный переход на доску под лампой: детская рука берёт ферзя с
//    e7, останавливается над f7 и возвращает его на e7.
// C. Глаза девочки крупно: она сосредоточенно смотрит на доску — ей
//    интересно. Причина отказа не объясняется.
import { clamp, keys } from "../rig/motion";
import { CH2_TEXT, POSITION_A } from "../script";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ch2Timeline } from "../timing";
import { ChatScreen, PhoneClose } from "../props/Phone";
import { SKIN } from "../props/CloseHand";
import { BoardTop, carryHand, RoomShot, TOP_Q, withHeld, type CarryKey } from "./shots";
import { GIRL_SPEC, girlAtBoard } from "./Light";

export const hookPlan = (tl: Ch2Timeline) => {
  const T = sceneTools(tl, "hook");
  const board = Math.max(60, T.word("N01", "Бирок") - 10);
  const grab = board + 20;
  const set = grab + 76;
  return { board, grab, set, release: set + 4, eyes: set + 26, len: T.len };
};
type P = ReturnType<typeof hookPlan>;

const keysOf = (p: P): CarryKey[] => [
  [p.grab, "e7", 0],
  [p.grab + 12, "e7", 70],
  [p.grab + 34, POSITION_A.tryAt, 32],
  [p.set - 14, POSITION_A.tryAt, 32],
  [p.set - 5, "e7", 22],
  [p.set, "e7", 0],
];

export const HookScene: React.FC = () => {
  const { f } = useScene("hook");
  const p = usePlan(hookPlan);
  if (f < p.board) {
    return (
      <PhoneClose f={f} taps={[]} skin={SKIN.mom} caseColor="#C9786A">
        <ChatScreen incoming={CH2_TEXT.coachMsg} pulse={f > 10 && f < 40} />
      </PhoneClose>
    );
  }
  if (f < p.eyes) {
    const L = 185;
    const h = carryHand(f, TOP_Q, "Q", keysOf(p), p.grab, p.release, { L, angle: 158, rest: { x: 1080, y: 2300 }, approach: 18 });
    return (
      <BoardTop
        pieces={withHeld(POSITION_A.pieces, "wQ", h.holding)}
        held={h.holding ? { kind: "Q", white: true, x: h.c.x, y: h.c.y, s: h.c.size, lift: h.c.lift } : null}
        hands={[{ wrist: h.wrist, angle: 158, size: L, skin: SKIN.girl, shape: h.shape }]}
      />
    );
  }
  // C. Лицо крупно: взгляд на доске, лёгкое движение бровей (думает)
  const girl = GIRL_SPEC((t) => ({
    ...girlAtBoard({ expr: "thinking", lookY: 0.55 }),
    expr: { browIn: keys(t, [[p.eyes, -2], [p.eyes + 30, 2], [p.eyes + 50, -1]]), browOut: 2, lid: 0.16, smile: 0.05 },
    lookX: keys(t, [[p.eyes, 0.4], [p.eyes + 24, 0.55]]),
  }));
  return <RoomShot f={f} cam={{ x: 312, y: 1066, zoom: 3.7 + 0.1 * clamp((f - p.eyes) / 90) }} girl={girl} pieces={POSITION_A.pieces} />;
};
