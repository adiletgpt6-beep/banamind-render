// Сцена 9. Почему это воскресенье — эмоциональный центр.
// A. Совпадение формы: рисунок «трое за столом» сверху — тот же лист на том
//    же детском столе (возвращаемся к первому разговору).
// B. M02: план на высоте дочки — мама спрашивает мягко.
// C. D02: дочка отвечает с паузами, камера спокойна (без зума и рывков).
//    На «Атам да үйдө болот» — вставка: палец касается нарисованного папы.
//    На словах о долгом сидении за столом она смотрит на маму.
// D. Реакция ≈ 0,8 с: мама мягко накрывает её руку и чуть придвигается.
// Музыка здесь заметно тише (Su2Audio), без эффектов.
import { CloseHand } from "../props/CloseHand";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { camMove, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C } from "../theme";
import { ROOM } from "../sets/Home";
import { HANDS } from "./common";
import { DAD_FIG_TOP, DeskSet, DRAWING_TOP, GIRL_AT_DESK, girlDeskPose, MOM_CROUCH_X } from "./DeskTalk";
import { Desk, SheetTop } from "./CalendarTop";

export const whyPlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "why");
  const two = 30;
  const girl = T.to("M02") + 6;
  const insert = T.word("D02", "Атам") - 12;
  const back = Math.max(T.word("D02", "Биз") - 4, T.word("D02", "Атам") + 30);
  const end = T.to("D02");
  const touch: [number, number] = [end + 4, end + 20];
  return { two, girl, insert, back, end, touch, len: T.len };
};

export const WhyScene: React.FC = () => {
  const { f } = useScene("why");
  const p = usePlan(whyPlan);
  if (f < p.two) {
    // A. рисунок сверху → чуть отъезжает
    const z = lerp(2.6, 2.2, easeInOut(f / p.two));
    return (
      <Shot f={f} cam={{ x: DRAWING_TOP.x, y: DRAWING_TOP.y + 40, zoom: z }} bg={C.woodLight}>
        <Desk />
        <SheetTop />
      </Shot>
    );
  }
  if (f >= p.insert && f < p.back) {
    // C2. Палец на нарисованном папе (вставка сверху)
    const k = easeInOut(clamp((f - p.insert) / 9));
    const tip = { x: DAD_FIG_TOP.x + 6, y: DAD_FIG_TOP.y + 10 };
    return (
      <Shot f={f} cam={{ x: DRAWING_TOP.x + 20, y: DRAWING_TOP.y + 60, zoom: 2.0 }} bg={C.woodLight}>
        <Desk />
        <SheetTop />
        <Svg>
          <CloseHand x={lerp(tip.x + 150, tip.x + 40, k)} y={lerp(tip.y + 300, tip.y + 175, k)} angle={170} size={110} {...HANDS.girl} shape="point" />
        </Svg>
      </Shot>
    );
  }
  const momTouch = easeInOut(clamp((f - p.touch[0]) / (p.touch[1] - p.touch[0])));
  const momPose = (t: number) => ({
    sit: 1,
    seat: ROOM.stool.h + 10,
    lean: 6 + 6 * momTouch,
    expr: t < p.girl ? ("calm" as const) : t < p.end ? ("calm" as const) : ("softSmile" as const),
    lookY: 0.05,
    armR: { target: { x: lerp(MOM_CROUCH_X + 170, ROOM.sheet.x - 20, momTouch), y: ROOM.desk.top + 8 }, shape: momTouch > 0.5 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    armL: { target: { x: MOM_CROUCH_X + 30, y: ROOM.floorY - 200 }, shape: "relax" as const, elbow: "down" as const },
  });
  const girlPose = (t: number) =>
    girlDeskPose({
      expr: t < p.back ? "calm" : "softSmile",
      lookY: t >= p.girl && t < p.insert ? 0.35 : 0.05,
      headTilt: t >= p.back ? 3 : 0,
    });
  const girlFace = (t: number) => (t < p.girl ? -0.55 : t < p.insert ? keys(t, [[p.girl, -0.5], [p.girl + 20, -0.25]]) : -0.55);
  const set = <DeskSet f={f} mom={{ place: () => ({ x: MOM_CROUCH_X + 10 * momTouch, y: ROOM.floorY + 10, h: 770 }), face: () => 0.75, pose: momPose }} girl={{ face: girlFace, pose: girlPose }} />;
  // B / C / D: спокойные планы на высоте глаз ребёнка
  const eye = { x: (MOM_CROUCH_X + GIRL_AT_DESK.x) / 2 + 20, y: 1130, zoom: 1.5 };
  const girlCu = { x: GIRL_AT_DESK.x - 70, y: 1120, zoom: 2.15 };
  const cam = f < p.girl ? eye : f < p.end + 2 ? girlCu : camMove(f, p.end + 2, p.end + 3, eye, eye);
  return (
    <Shot f={f} cam={cam} bg={C.wallHome}>
      {set}
    </Shot>
  );
};
