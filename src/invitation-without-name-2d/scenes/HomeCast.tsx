// Общие позы разговора за домашним столом (сцены 7–10): папа сидит справа
// от Эмира на чуть отодвинутом стуле, лист приглашения — между ними.
import type { PoseIn, Place } from "../rig/Actor";
import { C } from "../theme";
import { CHAIR_SEAT, HOME, OnTable } from "../sets/Home";
import { InvitationArt } from "../props/Invitation";
import { DAD_SIT, SHEET_AT } from "./HomeShot";
import { H } from "./common";

export const DAD_SEATED: Place = { x: DAD_SIT, y: HOME.seatY, h: H.dad };

// Сидящий папа, повернувшись к сыну (слева от него).
export const dadSeated = (over: PoseIn = {}): PoseIn => ({
  sit: 1,
  seat: CHAIR_SEAT,
  lean: 8,
  turnBody: 0.55,
  expr: "calm",
  lookX: -0.2,
  lookY: 0.15,
  armL: { target: { x: 735, y: 1262 }, shape: "relax", elbow: "down", behind: false },
  armR: { target: { x: 860, y: 1264 }, shape: "relax", elbow: "down" },
  ...over,
});

// Сидящий Эмир, руки на столе.
export const sonSeated = (over: PoseIn = {}): PoseIn => ({
  sit: 1,
  seat: CHAIR_SEAT,
  turnBody: 0.5,
  expr: "calm",
  lookX: 0.35,
  lookY: 0.2,
  armL: { target: { x: 440, y: 1266 }, shape: "relax", elbow: "down" },
  armR: { target: { x: 548, y: 1266 }, shape: "relax", elbow: "down", behind: false },
  ...over,
});

// Лист на столе (named — имя уже вписано), карандаш рядом.
export const SheetOnTable: React.FC<{ readonly named?: boolean; readonly x?: number; readonly pencil?: boolean }> = ({ named = false, x = SHEET_AT.x, pencil = true }) => (
  <>
    <OnTable x={x} y={SHEET_AT.y} rot={-6}>
      <InvitationArt w={170} detail={false} name={named ? 1 : 0} />
    </OnTable>
    {pencil ? (
      <OnTable x={600} y={1290} rot={0} squash={1}>
        <g transform="rotate(-8)">
          <rect x={-46} y={-3} width={86} height={6} rx={2} fill={C.yellow} stroke="#C9A12E" strokeWidth={1} />
          <path d="M 40 -3 L 52 0 L 40 3 Z" fill="#E8CFA6" />
        </g>
      </OnTable>
    ) : null}
  </>
);
