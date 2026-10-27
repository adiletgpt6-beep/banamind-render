// Будильник в сцене: губы по фактической речи своей роли (lipAt),
// моргание по расписанию, плавная смена мимики по ключам.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CLOSED, lipAt, SceneContext, TimelineContext } from "../context";
import { blinkAt, clamp } from "../rig/motion";
import type { Bg43Role } from "../script";
import { CEXPR, Clock, mixClockExpr, type ClockExpr, type ClockExprId, type ClockProps } from "./Clock";

// Мимика по ключам [[кадр, выражение], …]: смена за d кадров (плавно).
export const exprKeys = (f: number, pts: readonly (readonly [number, ClockExprId | ClockExpr])[], d = 7): ClockExpr => {
  const get = (e: ClockExprId | ClockExpr): ClockExpr => (typeof e === "string" ? CEXPR[e] : e);
  let cur = get(pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [t, e] = pts[i];
    if (f < t) break;
    cur = mixClockExpr(cur, get(e), clamp((f - t) / d));
  }
  return cur;
};

export type ClockActorProps = Omit<ClockProps, "mouth" | "blink" | "f"> & {
  readonly role?: Bg43Role;
  readonly seed?: number;
  readonly blinks?: readonly number[];
  // кадр сцены (по умолчанию — текущий)
  readonly f?: number;
  // рот закрыт (например, персонаж слушает)
  readonly mute?: boolean;
};

export const ClockActor: React.FC<ClockActorProps> = ({ role, seed = 1, blinks = [], f: fIn, mute, ...rest }) => {
  const cur = useCurrentFrame();
  const f = fIn ?? cur;
  const { cues } = useContext(TimelineContext);
  const { from } = useContext(SceneContext);
  const mouth = role && !mute ? lipAt(cues, role, f + from) : CLOSED;
  const blink = blinkAt(f, seed, blinks);
  return <Clock {...rest} f={f} mouth={mouth} blink={blink} />;
};
