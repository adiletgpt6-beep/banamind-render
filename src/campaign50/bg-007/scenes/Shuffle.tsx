// Сцена 2 (≈6,5–18,5 с): папа двигает встречи. Вечер, домашний уголок,
// на стене — тот же календарь-тетрис. Папа берёт пятничный «Кардар»
// и поднимает его наверх, чтобы утренний «Мектеп» встал на его место;
// после обеда «Мектеп» выбивает встречу — карточка выпадает с листа.
// Крупный план: так же по всем дням — встречи наверху горой, после
// обеда внахлёст (красная обводка). Снова общий план: папа держится
// за шею, смотрит на перегруженный лист.
// Диктор: «Ар күнү баланы мектепке жеткирүү жана алып келүү үчүн
// жолугушууларды өзгөртүү оңой эмес.»
import { useCurrentFrame } from "remotion";
import { BoardAt, dragPath, SHUFFLE, shuffleState } from "../calendar";
import { useScene } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { cruise, keys, keysV, lerp } from "../rig/motion";
import { FloorLamp, STUDY, StudyBack } from "../sets/Study";
import { camMove, Shot } from "../shots";
import { BoardClose, H, onBoard } from "./common";

// Папа: стоит справа от календаря, во время перестановки шагает ближе.
export const SH_DAD = (t: number): Place => {
  const u = cruise((t - 8) / 22, 0.3);
  const back = cruise((t - 84) / 24, 0.3);
  return { x: lerp(lerp(1010, 930, u), 1000, back), y: STUDY.floorY, h: H.dad };
};

export const ShuffleScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const board = shuffleState(f);
  const dadPose = (t: number) => {
    const p = SH_DAD(t);
    const r = dragPath(t);
    const grip = onBoard(r.x + r.w / 2, r.y + r.h / 2);
    const rest = { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h };
    const armL = keysV(t, [
      [0, rest],
      [6, rest],
      [SHUFFLE.grab, grip],
    ]);
    const holding = t >= SHUFFLE.grab && t <= SHUFFLE.lift + 2;
    const after = keysV(t, [
      [SHUFFLE.lift + 2, onBoard(dragPath(SHUFFLE.lift).x + 80, dragPath(SHUFFLE.lift).y + 80)],
      [SHUFFLE.lift + 22, rest],
    ]);
    // общий план C: рука на шее, потом опускается
    const neck = { x: p.x + 0.06 * p.h, y: p.y - 0.84 * p.h };
    const armR = keysV(t, [
      [0, { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }],
      [SHUFFLE.wide + 10, { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }],
      [SHUFFLE.wide + 34, neck],
      [frames - 40, neck],
      [frames - 14, { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }],
    ]);
    return {
      expr:
        t < SHUFFLE.fall ? ("thinking" as const) : t < SHUFFLE.fall + 26 ? ("surprised" as const) : t < SHUFFLE.wide ? ("worried" as const) : ("tired" as const),
      armL: { target: t < SHUFFLE.grab ? armL : holding ? grip : after, shape: holding ? ("pinch" as const) : t < SHUFFLE.grab && t > 8 ? ("open" as const) : ("relax" as const), elbow: "out" as const },
      armR: { target: armR, shape: "relax" as const, elbow: t > SHUFFLE.wide + 10 ? ("out" as const) : ("hang" as const) },
      lookY: keys(t, [[0, -0.3], [SHUFFLE.grab, -0.45], [SHUFFLE.lift, -0.6], [SHUFFLE.fall, -0.1], [SHUFFLE.fall + 20, 0.35], [SHUFFLE.wide, -0.2]]),
      headTilt: keys(t, [[SHUFFLE.wide + 20, 0], [SHUFFLE.wide + 40, -5]]),
      lean: keys(t, [[SHUFFLE.fall, 0], [SHUFFLE.fall + 6, -4], [SHUFFLE.fall + 30, 0]]),
      exhale: keys(t, [[SHUFFLE.wide + 30, 0], [SHUFFLE.wide + 50, 0.7], [frames, 0.5]]),
      turnBody: 0.7,
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.7], [SHUFFLE.fall + 4, -0.55], [SHUFFLE.fall + 30, -0.65]]);
  const world = (
    <>
      <StudyBack />
      <FloorLamp x={1480} />
      <BoardAt s={board} x={STUDY.board.x} y={STUDY.board.y} scale={STUDY.board.scale} />
      <Actor uid="s2-dad" look="dad" f={f} place={SH_DAD} face={dadFace} pose={dadPose} role="father" seed={2} />
    </>
  );
  return (
    <>
      <Shot f={f} from={0} to={SHUFFLE.close} cam={camMove(f, 0, SHUFFLE.close, { x: 700, y: 1150, zoom: 0.9 }, { x: 730, y: 1120, zoom: 0.98 })}>
        {world}
      </Shot>
      {f >= SHUFFLE.close && f < SHUFFLE.wide ? <BoardClose s={board} f={f - SHUFFLE.close} len={SHUFFLE.wide - SHUFFLE.close} /> : null}
      <Shot f={f} from={SHUFFLE.wide} to={frames + 1} cam={camMove(f, SHUFFLE.wide, frames, { x: 760, y: 1120, zoom: 1.02 }, { x: 800, y: 1080, zoom: 1.12 })}>
        {world}
      </Shot>
    </>
  );
};
