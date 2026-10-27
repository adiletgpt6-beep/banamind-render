// Сцена 05 «Баягы эле документ». Мама возвращается за стол. Крупно — та
// же незаконченная строка «Сентябрь»: пальцы на клавишах замирают. Она
// просматривает предыдущие строки, открывает переписку команды — оба
// сообщения пришли, пока её не было (13:12 и 13:26), — читает, сверяет
// документ, находит место и только потом начинает печатать.
import { useCurrentFrame } from "remotion";
import { anticipate, clamp, easeInOut, keys, keysV } from "../rig/motion";
import { LaptopCloseup } from "../screens";
import { WORK } from "../sets/WorkRoom";
import { camMove, Shot } from "../shots";
import { H, sceneLen, sitDown, typingBursts } from "./common";
import { DESK_FACE, momAtDesk } from "./Work";
import { keyAt, WorkWorld } from "./worlds";

export const CONTEXT_SHOTS = { sit: [0, 84], doc: [84, 196], chat: [196, 300], face: [300, 352] } as const;

export const ContextScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("context");
  const S = CONTEXT_SHOTS;
  const p = { x: WORK.chairX, y: WORK.seatY, h: H.mom };
  const momPose = (t: number) => {
    const base = momAtDesk(t, 0);
    const sd = sitDown(t, 4, 30);
    return {
      ...base,
      sit: sd.sit,
      lean: Math.max(sd.lean, 12 * sd.sit),
      expr: t < 60 ? ("calm" as const) : ("thinking" as const),
      // пальцы над клавишами и пауза
      armR: { ...base.armR, target: keysV(t, [[24, { x: p.x + 0.12 * p.h, y: p.y - 0.42 * p.h }], [50, keyAt(2, t, 0)], [62, { ...keyAt(2, t, 0), y: keyAt(2, t, 0).y - 10 }]], anticipate) },
      armL: { ...base.armL, target: keysV(t, [[28, { x: p.x + 0.1 * p.h, y: p.y - 0.42 * p.h }], [54, keyAt(0, t, 0)], [64, { ...keyAt(0, t, 0), y: keyAt(0, t, 0).y - 8 }]], anticipate) },
      headTilt: keys(t, [[60, 0], [72, -4]]),
      lookY: keys(t, [[20, 0], [44, 0.32], [70, 0.25]]),
    };
  };
  // лицо: взгляд по строкам сообщений
  const facePose = (t: number) => ({
    ...momAtDesk(t, 0),
    expr: "thinking" as const,
    lookX: keys(t, [[S.face[0], -0.2], [S.face[0] + 16, 0.25], [S.face[0] + 18, -0.2], [S.face[0] + 34, 0.25], [S.face[0] + 40, 0]]),
    lookY: 0.15,
    nod: keys(t, [[S.face[0] + 36, 0], [S.face[0] + 42, 4], [S.face[0] + 50, 0]]),
  });
  const docStart = S.face[1];
  const view = (t: number) => {
    if (t < S.doc[1]) {
      return {
        doc: {
          filled: 0,
          cursorRow: 2,
          scrollUp: keys(t, [[S.doc[0] + 30, 0], [S.doc[0] + 50, 1], [S.doc[0] + 86, 1], [S.doc[0] + 104, 0]]),
          highlightRow: t > S.doc[0] + 44 && t < S.doc[0] + 70 ? 0 : t >= S.doc[0] + 70 && t < S.doc[0] + 100 ? 1 : undefined,
        },
        clock: "13:41",
      };
    }
    if (t < S.chat[1]) {
      return { doc: { filled: 0, cursorRow: 2 }, chat: easeInOut((t - S.chat[0]) / 14), chatRead: clamp((t - S.chat[0] - 20) / 70) * 2, clock: "13:42" };
    }
    return { doc: { filled: clamp((t - docStart - 26) / 160) * 0.5, cursorRow: 2, highlightRow: 2 }, chat: 1 - easeInOut((t - docStart) / 12), clock: "13:44" };
  };
  const typing = (t: number) => (t >= docStart + 26 ? typingBursts(t, docStart + 26, len, 46, 24) : 0);
  const pointer = (t: number) => (t >= S.doc[0] + 30 && t < S.doc[1] ? { x: 120, y: keys(t, [[S.doc[0] + 30, 300], [S.doc[0] + 60, 230], [S.doc[0] + 90, 268], [S.doc[0] + 110, 300]]) } : undefined);
  return (
    <>
      <Shot f={f} from={S.sit[0]} to={S.sit[1]} cam={camMove(f, S.sit[0], S.sit[1], { x: 840, y: 1100, zoom: 1.08 }, { x: 860, y: 1060, zoom: 1.3 })}>
        <WorkWorld minutes={13 * 60 + 40} mom={{ uid: "c5-mom", look: "mom", f, place: () => p, face: () => DESK_FACE, pose: momPose, seed: 1 }} />
      </Shot>
      {[S.doc, S.chat].map(([a, b]) => (
        <Shot key={a} f={f} from={a} to={b} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<LaptopCloseup f={f} view={{ ...view(f), pointer: pointer(f) }} hands={f < S.doc[1] ? 1 : 0.0001} typing={0} />}>
          {null}
        </Shot>
      ))}
      <Shot f={f} from={S.face[0]} to={S.face[1]} cam={camMove(f, S.face[0], S.face[1], { x: 780, y: 960, zoom: 2.2 }, { x: 780, y: 960, zoom: 2.3 })}>
        <WorkWorld minutes={13 * 60 + 43} mom={{ uid: "c5-momF", look: "mom", f, place: () => p, face: () => DESK_FACE, pose: facePose, seed: 1 }} />
      </Shot>
      <Shot f={f} from={docStart} to={len} cam={{ x: 540, y: 960, zoom: 1 }} overlay={<LaptopCloseup f={f} view={view(f)} hands={1} typing={typing(f)} />}>
        {null}
      </Shot>
    </>
  );
};
