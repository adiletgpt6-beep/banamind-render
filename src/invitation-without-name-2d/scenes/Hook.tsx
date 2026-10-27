// Сцена 1. Неожиданные слова. Школьный коридор у кабинета 203: учительница
// обращается к папе (T01) — средний план. Взгляд папы меняется раньше, чем
// он отвечает: брови поднимаются, голова чуть наклоняется — интерес, не
// раздражение. Крупно — его вопрос (F01). В конце рядом выезжает светлая
// карточка с пустой строкой гостя — обещание истории, без объяснения.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeOut, keys } from "../rig/motion";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C, F } from "../theme";
import { IW2_TEXT } from "../script";
import { CORRIDOR, Corridor } from "../sets/School";
import { H } from "./common";

export const hookPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "hook");
  const f01 = T.from("F01");
  return {
    t01: T.from("T01"),
    t01End: T.to("T01"),
    react: T.to("T01") + 4, // взгляд меняется до ответа
    close: f01 - 8, // крупный план папы
    f01,
    f01End: T.to("F01"),
    card: T.to("F01") + 8,
    len: T.len,
  };
};

const TEACHER: Place = { x: 500, y: CORRIDOR.floorY, h: H.mom };
const DAD: Place = { x: 800, y: CORRIDOR.floorY, h: H.dad };

// Карточка с пустой строкой (тот же шрифт и строка, что на приглашении).
export const HOOK_CARD = { x: 560, y: 1290, w: 440, h: 190 } as const;
const BlankCard: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0) return null;
  const k = easeOut(clamp(t / 12));
  const g = IW2_TEXT.invitation;
  return (
    <div style={box({ left: HOOK_CARD.x + (1 - k) * 520, top: HOOK_CARD.y, width: HOOK_CARD.w, height: HOOK_CARD.h, backgroundColor: C.sheet, border: `4px solid ${C.ink}`, boxShadow: "8px 10px 0 rgba(23,23,23,0.16)", boxSizing: "border-box", opacity: k })}>
      <div style={box({ left: 30, top: 34, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.navy })}>{g.guest}</div>
      <div style={box({ left: 30, top: 140, width: 380, height: 4, backgroundColor: C.navy })} />
    </div>
  );
};

export const HookScene: React.FC = () => {
  const { f } = useScene("hook");
  const p = usePlan(hookPlan);
  const teacherPose = (tt: number) => ({
    expr: tt < p.t01 - 6 ? ("calm" as const) : ("softSmile" as const),
    lookX: 0.2,
    lookY: 0.05,
    // одна спокойная открытая ладонь на «келишиңизди», затем рука опускается
    armR: { target: keys(tt, [[p.t01 + 6, 0], [p.t01 + 16, 1], [p.t01End, 1], [p.t01End + 12, 0]]) > 0.5 ? { x: 610, y: 1110 } : { x: 585, y: 1170 }, shape: "open" as const, elbow: "down" as const, behind: false },
    armL: { target: { x: 455, y: 1150 }, shape: "relax" as const, item: "paper" as const, itemTilt: 4, elbow: "down" as const },
    nod: keys(tt, [[p.t01End - 8, 0], [p.t01End, 3], [p.t01End + 10, 0]]),
  });
  const dadPose = (tt: number) => ({
    expr: tt < p.react ? ("calm" as const) : tt < p.f01End + 6 ? ({ browIn: 7, browOut: 6, lid: 0.02, smile: 0.05 } as const) : ({ browIn: 5, browOut: 1, lid: 0.12, smile: 0 } as const),
    lookX: -0.2,
    lookY: 0.02,
    headTilt: keys(tt, [[p.react, 0], [p.react + 10, -4]]),
    armL: { target: null, shape: "relax" as const },
    armR: { target: null, shape: "relax" as const },
  });
  const close = f >= p.close;
  const cam = close ? { x: DAD.x - 20, y: 850, zoom: keys(f, [[p.close, 3.9], [p.len, 4.05]]) } : { x: 660, y: 1080, zoom: keys(f, [[0, 1.42], [p.close, 1.5]]) };
  return (
    <AbsoluteFill>
      <Shot f={f} cam={cam} bg={C.corridor}>
        <Corridor />
        <Actor uid="h1-teacher" look="mugalim" f={f} place={() => TEACHER} face={() => 0.5} pose={teacherPose} role="teacher" seed={8} />
        <Actor uid="h1-dad" look="azamat" f={f} place={() => DAD} face={() => -0.55} pose={dadPose} role="father" seed={2} blinks={[p.react - 2]} />
        <Svg>{null}</Svg>
      </Shot>
      <BlankCard t={f - p.card} />
    </AbsoluteFill>
  );
};
