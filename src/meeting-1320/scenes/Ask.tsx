// Сцена 3 «Жылдырсак болобу?».
// 3a. A01: обратный план из-за плеча директора — помощница в двери с
//     планшетом спрашивает; директор поднимает голову от ноутбука (экран
//     к нему и к нам — со стороны пользователя виден экран).
// 3b. Пауза: экран ноутбука крупно — пункт 13:20 (≈ 1 с).
// 3c. F01: средний план директора с точки помощницы (ноутбук к нам
//     крышкой): спокойно отвечает; один открытый жест ладонью на «саат эки
//     жарымды», затем рука возвращается на стол.
// 3d. Планшет: «Кардарга сунуш» — печатается 14:30, галочка.
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { Shot, box, camMove, usePlan, useScene } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { H, seatOf } from "./common";
import { DIRF, DIRR, DirectorFront, DirectorReverse } from "../sets/Office31";
import { CalendarBackdrop, CalendarDay, CalendarGlance, ScreenInsert, TabletScreen, TABLET_W } from "../props/CalendarUI";
import type { M13Sfx } from "./sfx";

export const askPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "ask");
  const a1 = T.from("A01");
  const a1End = T.to("A01");
  const f1 = T.from("F01");
  const f1End = T.to("F01");
  const cutB = a1End + 6;
  const cutC = Math.max(cutB + 26, f1 - 8);
  const cutD = Math.min(T.len - 40, f1End + 8);
  return {
    len: T.len,
    door: [0, 18] as const,
    a1,
    headUp: Math.max(20, a1 - 2),
    cutB,
    cutC,
    cutD,
    // ответ: взгляд от ноутбука на помощницу, жест на «саат эки жарымды»
    lookUp: cutC + 2,
    gesture: [T.word("F01", "саат") - 6, T.wordEnd("F01", "сунушта") + 4] as const,
    // планшет: подпись и 14:30 печатаются, затем галочка
    typeA: cutD + 4,
    typeB: Math.min(T.len - 14, cutD + 30),
  };
};

export const askSfx = (tl: M13Timeline): M13Sfx[] => {
  void tl;
  return [];
};

export const askSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  void tl;
  return [];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));

export const AskScene: React.FC = () => {
  const { f } = useScene("ask");
  const P = usePlan(askPlan);

  // 3a: помощница в двери
  const V = DIRR.visitor;
  const visitorPose = (): PoseIn => ({
    expr: "calm",
    lookY: 0.12,
    headTilt: 3,
    armL: { target: { x: V.x - 30 * V.s, y: V.y - 440 * V.s }, elbow: "down", item: "tablet", facing: "self" },
  });
  const visitor = (
    <Actor uid="k-a" look="m13Assistant" f={f} place={() => ({ x: V.x, y: V.y, h: H.assistant * V.s })} face={() => -0.3} pose={visitorPose} role="assistant" seed={7} blinkShift={11} />
  );

  // 3c: директор спереди
  const S = DIRF.seat;
  const up = easeInOut(ramp(f, P.lookUp, P.lookUp + 12));
  const g = keys(f, [
    [P.gesture[0], 0],
    [P.gesture[0] + 10, 1],
    [P.gesture[1], 1],
    [P.gesture[1] + 14, 0],
  ]);
  // кисти лежат на столе перед ним (ноутбук справа — к нему он повёрнут)
  const restL = { x: S.x - 58, y: DIRF.deskBack + 46 };
  const restR = { x: S.x + 64, y: DIRF.deskBack + 48 };
  const palm = { x: S.x + 104, y: DIRF.deskBack - 18 };
  const dirPose = (): PoseIn => ({
    sit: 1,
    seat: seatOf(H.dad),
    expr: f > P.gesture[0] ? "calm" : "thinking",
    lookY: lerp(0.45, 0.02, up),
    nod: 2 * g,
    armL: { target: restL, elbow: "hang", shape: "relax" },
    armR: { target: { x: lerp(restR.x, palm.x, g), y: lerp(restR.y, palm.y, g) }, elbow: "hang", shape: g > 0.4 ? "open" : "relax", wrist: -30 * g },
  });
  const dirFace = () => lerp(0.25, -0.05, up);
  const dir = (layer: "body" | "arms") => (
    <Actor uid="k-d" look="m13Director" f={f} place={() => ({ x: S.x, y: S.y, h: H.dad })} face={dirFace} pose={dirPose} role="father" seed={3} blinkShift={5} layer={layer} />
  );

  return (
    <>
      {/* 3a: из-за плеча директора — помощница в двери */}
      <Shot f={f} from={0} to={P.cutB} cam={camMove(f, 0, P.cutB, { x: 580, y: 1210, zoom: 1.12 }, { x: 610, y: 1170, zoom: 1.3 })}>
        <DirectorReverse door={ramp(f, P.door[0], P.door[1])} headUp={ramp(f, P.headUp, P.headUp + 12)} screen={<CalendarGlance glow={0.35} />} visitor={visitor} />
      </Shot>
      {/* 3b: экран ноутбука — пункт 13:20 */}
      <Shot f={f} from={P.cutB} to={P.cutC} cam={{ x: 540, y: 960, zoom: 1 }}>
        <ScreenInsert device="laptop" push={ramp(f, P.cutB, P.cutC)}>
          <CalendarDay x={110} y={60} scale={1} day={0} glow={0.3 + 0.7 * ramp(f, P.cutB + 4, P.cutB + 18)} />
        </ScreenInsert>
      </Shot>
      {/* 3c: директор отвечает */}
      <Shot f={f} from={P.cutC} to={P.cutD} cam={camMove(f, P.cutC, P.cutD, { x: 556, y: 1228, zoom: 1.66 }, { x: 556, y: 1218, zoom: 1.76 })}>
        <DirectorFront body={dir("body")} arms={dir("arms")} />
      </Shot>
      {/* 3d: планшет — 14:30 */}
      <Shot f={f} from={P.cutD} to={P.len} cam={{ x: 540, y: 960, zoom: 1 }}>
        <CalendarBackdrop props={false} />
        <div style={box({ left: (1080 - TABLET_W * 0.8) / 2, top: 330, width: 1, height: 1 })}>
          <TabletScreen x={0} y={0} scale={0.8} view="proposal" typed={ramp(f, P.typeA, P.typeB)} done={ramp(f, P.typeB + 2, P.typeB + 12)} />
        </div>
      </Shot>
    </>
  );
};
