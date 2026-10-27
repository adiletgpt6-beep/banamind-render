// Сцена 5. «Жумуштан кетүүнү чечтиңби?» — сегодня, тот же стол.
// Папа берёт лист со стола, читает, улыбается — добрая шутка (F01).
// Короткая пауза: сын спокойно качает головой — «Жок. Болгону эртерээк
// кетким келет» (S01). Улыбка папы становится внимательной: он кладёт лист
// и смотрит на сына; вопрос (F02) — после остановки движения.
// Крупно руки: левая держит рюкзак, правая медленно достаёт фотографию за
// край (видна только оборотная сторона — снимок ещё не раскрыт).
import { AbsoluteFill } from "remotion";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { C } from "../theme";
import { box, Paper, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { CloseHand, SKIN } from "../props/CloseHand";
import { OFFICE } from "../sets/Office";
import { BOY_CHAIR, BOY_SEAT, DAD_DESK, DAD_SEAT, OfficeFront } from "./OfficeFront";

export const quitPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "quit");
  const f01 = T.from("F01");
  const s01 = T.from("S01");
  const f02 = T.from("F02");
  return {
    reach: 8,
    lift: [14, 34] as const,
    smile: f01 - 20,
    f01,
    f01End: T.to("F01"),
    shake: [s01 - 20, s01 + 4] as const,
    s01,
    s01End: T.to("S01"),
    down: [T.to("S01") + 4, T.to("S01") + 26] as const,
    f02,
    f02End: T.to("F02"),
    pull: T.to("F02") + 14,
    len: T.len,
  };
};
type P = ReturnType<typeof quitPlan>;

const PAPER = { x: OFFICE.paper.x, y: OFFICE.paper.y };
const READ = { x: 590, y: 990 };

const Talk: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const holding = (tt: number) => tt >= p.lift[0] && tt < p.down[1];
  const dadPose = (tt: number) => {
    const hand = keysV(tt, [[p.reach, { x: 520, y: 1150 }], [p.lift[0], PAPER], [p.lift[1], READ], [p.down[0], READ], [p.down[1], PAPER], [p.down[1] + 12, { x: 520, y: 1150 }]], anticipate);
    return {
      sit: 1,
      seat: DAD_SEAT,
      expr: tt < p.smile ? ("calm" as const) : tt < p.s01End + 2 ? ("smile" as const) : ("calm" as const),
      // читает лист → на сына; после «Жок…» — внимательно смотрит на сына
      lookY: tt < p.f01 - 6 ? 0.6 : tt < p.down[0] ? 0.05 : keys(tt, [[p.down[0], 0.4], [p.down[1], 0.05]]),
      lookX: tt < p.f01 - 6 ? 0.1 : 0.35,
      armR: { target: hand, shape: holding(tt) ? ("pinch" as const) : ("relax" as const), item: holding(tt) ? ("letter" as const) : ("none" as const), itemTilt: -8, elbow: "down" as const, behind: false },
      armL: { target: { x: 330, y: 1150 }, shape: "relax" as const, elbow: "down" as const },
      nod: keys(tt, [[p.f02 - 10, 0], [p.f02 - 4, 3], [p.f02 + 6, 0]]),
    };
  };
  const dadFace = (tt: number) => keys(tt, [[0, 0.15], [p.f01 - 8, 0.15], [p.f01, 0.55]]);
  const boyPose = (tt: number) => ({
    sit: 1,
    seat: BOY_SEAT,
    badge: 1,
    expr: tt < p.s01 - 30 ? ("neutral" as const) : ("calm" as const),
    lookY: 0.05,
    armL: { target: { x: BOY_CHAIR.x - 50, y: OFFICE.seatY - BOY_SEAT - 20 }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: BOY_CHAIR.x + 50, y: OFFICE.seatY - BOY_SEAT - 20 }, shape: "relax" as const, elbow: "down" as const },
  });
  // качает головой: два спокойных поворота перед ответом
  const boyFace = (tt: number) => -0.5 + (tt > p.shake[0] && tt < p.shake[1] ? Math.sin(((tt - p.shake[0]) / (p.shake[1] - p.shake[0])) * Math.PI * 2) * 0.22 : 0);
  // камера: двое в кадре; на вопросе — чуть ближе
  const zoom = keys(f, [[0, 1.36], [p.f02 - 20, 1.36], [p.f02, 1.48]], easeInOut);
  return (
    <OfficeFront
      f={f}
      cam={{ x: lerp(720, 770, clamp((f - p.f02 + 20) / 20)), y: 1060, zoom }}
      dad={{ place: () => DAD_DESK, face: dadFace, pose: dadPose }}
      boy={{ place: () => BOY_CHAIR, face: boyFace, pose: boyPose }}
      paperOnDesk={!holding(f)}
    />
  );
};

// Крупно: рюкзак у стула, рука достаёт фотографию за край.
const Pull: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.pull;
  const u = easeInOut(clamp((t - 12) / 44));
  const photoY = lerp(1060, 640, u);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Paper />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {/* фото (оборотом к зрителю) в кармане рюкзака */}
        <g transform={`translate(560 ${photoY}) rotate(${lerp(-6, -2, u)})`}>
          <rect x={-200} y={-160} width={400} height={320} fill="#FFFFFF" stroke="#D9D3C6" strokeWidth={4} />
          <rect x={-180} y={-140} width={360} height={280} fill="#F4F1EA" />
        </g>
        {/* рюкзак: перед фото (карман) */}
        <path d="M 180 980 Q 540 900 900 980 L 960 1820 Q 540 1900 120 1820 Z" fill="#3550D8" />
        <path d="M 180 980 Q 540 940 900 980" stroke="#2A40B8" strokeWidth={22} fill="none" />
        <rect x={300} y={1300} width={480} height={300} rx={50} fill="#2A40B8" />
        <rect x={500} y={1290} width={80} height={24} rx={8} fill="#C9CFF7" />
        {/* левая рука держит рюкзак за край */}
        <CloseHand x={110} y={880} angle={-40} size={210} {...SKIN.boy} shape="grip" mirror armLen={4} />
        {/* правая рука: щепоть за верхний край фото */}
        <CloseHand x={lerp(700, 690, u)} y={photoY - 360 + keys(t, [[0, -120], [12, 0]], anticipate)} angle={12} size={200} {...SKIN.boy} shape="pinch" armLen={5} />
      </svg>
    </AbsoluteFill>
  );
};

export const QuitScene: React.FC = () => {
  const { f } = useScene("quit");
  const p = usePlan(quitPlan);
  return f < p.pull ? <Talk f={f} p={p} /> : <Pull f={f} p={p} />;
};
