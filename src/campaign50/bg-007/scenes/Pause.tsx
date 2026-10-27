// Сцена 3 (≈18,5–30 с): пауза. Папа отходит от календаря, опускает руки —
// на листе значок паузы: игра остановлена. Из коридора тихо входит сын
// с рюкзаком, останавливается рядом и мягко спрашивает:
// «Ата, эртең мени сиз жеткиресизби?» Папа поворачивается к нему,
// приседает, кладёт руку на плечо: «Графигибизди башкача уюштурсак
// болот экен.» — и достаёт телефон (связующее действие: он начинает
// искать решение для самого маршрута).
import { useCurrentFrame } from "remotion";
import { BoardAt, pauseState } from "../calendar";
import { useLine, useScene } from "../context";
import { Actor, type Place } from "../rig/Actor";
import { cruise, keys, keysV, lerp } from "../rig/motion";
import { FloorLamp, STUDY, StudyBack } from "../sets/Study";
import { camMove, Shot } from "../shots";
import { H } from "./common";

export const PA = { stepBack: 6, door: 26, walk: 40, arrive: 100 };
export const PA_DAD = (t: number): Place => ({ x: lerp(1000, 1080, cruise((t - PA.stepBack) / 30, 0.3)), y: STUDY.floorY, h: H.dad });
export const PA_SON = (t: number): Place => ({ x: lerp(1900, 1360, cruise((t - PA.walk) / (PA.arrive - PA.walk), 0.25)), y: STUDY.floorY + 30, h: H.son });

export const PauseScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const s01 = useLine("s01");
  const f01 = useLine("f01");
  const turn = PA.arrive - 18; // папа поворачивается на шаги сына
  const crouchAt = s01.to + 4;
  const phoneAt = f01.to + 6;
  const dadPose = (t: number) => {
    const p = PA_DAD(t);
    const son = PA_SON(t);
    const shoulder = { x: son.x - 0.12 * son.h, y: son.y - 0.7 * son.h };
    const rest = { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h };
    const phone = { x: p.x + 0.1 * p.h, y: p.y - 0.6 * p.h };
    return {
      expr: t < turn ? ("tired" as const) : t < s01.to ? ("calm" as const) : t < phoneAt ? ("softSmile" as const) : ("thinking" as const),
      crouch: keys(t, [[crouchAt, 0], [crouchAt + 20, 0.32], [phoneAt - 4, 0.32], [phoneAt + 18, 0]]),
      exhale: keys(t, [[PA.stepBack, 0], [PA.stepBack + 20, 0.8], [turn, 0.6], [turn + 20, 0]]),
      armR: {
        target: keysV(t, [
          [0, rest],
          [crouchAt + 8, rest],
          [crouchAt + 26, shoulder],
          [phoneAt - 6, shoulder],
          [phoneAt + 16, phone],
        ]),
        shape: t > phoneAt ? ("phone" as const) : t > crouchAt + 18 ? ("open" as const) : ("relax" as const),
        item: t > phoneAt + 4 ? ("phone" as const) : ("none" as const),
        elbow: t > phoneAt ? ("hang" as const) : ("down" as const),
        glow: t > phoneAt + 10 ? 1 : 0,
        behind: false,
      },
      armL: { target: { x: p.x - 0.12 * p.h, y: p.y - 0.42 * p.h }, shape: "relax" as const, elbow: "out" as const },
      lookY: keys(t, [[0, -0.2], [PA.stepBack + 10, 0.2], [turn, 0.2], [turn + 12, 0.35], [phoneAt, 0.35], [phoneAt + 14, 0.7]]),
      nod: keys(t, [[f01.from + 8, 0], [f01.from + 16, 5], [f01.from + 28, 0]]),
      headTilt: keys(t, [[s01.from, 0], [s01.from + 16, 5], [phoneAt, 5], [phoneAt + 14, 0]]),
    };
  };
  const dadFace = (t: number) => keys(t, [[0, -0.7], [PA.stepBack + 20, -0.4], [turn, -0.4], [turn + 16, 0.65], [phoneAt + 6, 0.65], [phoneAt + 20, 0.3]]);
  const sonPose = (t: number) => ({
    expr: t < s01.from - 6 ? ("calm" as const) : t < f01.to ? ("worried" as const) : ("smile" as const),
    lookY: keys(t, [[PA.arrive, 0], [PA.arrive + 10, -0.55], [phoneAt + 10, -0.55], [phoneAt + 26, 0.1]]),
    strapTug: keys(t, [[s01.from - 20, 0], [s01.from - 6, 0.9], [s01.to + 10, 0.9], [s01.to + 26, 0]]),
    headTilt: keys(t, [[s01.from, 0], [s01.from + 10, -6], [f01.to, -6], [f01.to + 16, 0]]),
    armL: { target: null, shape: "relax" as const },
    armR: { target: null, shape: "relax" as const },
  });
  const sonFace = (t: number) => (t < PA.arrive - 6 ? -0.9 : -0.6);
  const doorOpen = keys(f, [[PA.door, 0], [PA.door + 16, 1]]);
  const world = (
    <>
      <StudyBack doorOpen={doorOpen} />
      <FloorLamp x={1480} />
      <BoardAt s={pauseState(f)} x={STUDY.board.x} y={STUDY.board.y} scale={STUDY.board.scale} />
      <Actor uid="s3-son" look="son" f={f} place={PA_SON} face={sonFace} pose={sonPose} role="son" seed={4} walkFrom={PA.walk - 2} />
      <Actor uid="s3-dad" look="dad" f={f} place={PA_DAD} face={dadFace} pose={dadPose} role="father" seed={2} />
    </>
  );
  const b = s01.from - 12;
  const c = f01.from - 8;
  const d = phoneAt - 4;
  return (
    <>
      <Shot f={f} from={0} to={b} cam={camMove(f, 0, b, { x: 860, y: 1150, zoom: 0.95 }, { x: 1020, y: 1180, zoom: 1.05 })}>
        {world}
      </Shot>
      <Shot f={f} from={b} to={c} cam={camMove(f, b, c, { x: 1300, y: 1200, zoom: 1.75 }, { x: 1300, y: 1190, zoom: 1.85 })}>
        {world}
      </Shot>
      <Shot f={f} from={c} to={d} cam={camMove(f, c, d, { x: 1170, y: 1100, zoom: 1.45 }, { x: 1180, y: 1120, zoom: 1.52 })}>
        {world}
      </Shot>
      <Shot f={f} from={d} to={frames + 1} cam={camMove(f, d, frames, { x: 1180, y: 1160, zoom: 1.3 }, { x: 1170, y: 1140, zoom: 1.42 })}>
        {world}
      </Shot>
    </>
  );
};
