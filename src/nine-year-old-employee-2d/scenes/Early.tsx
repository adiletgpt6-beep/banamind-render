// Сцена 8. Он заканчивает раньше — собственное решение папы.
// A. Экран со стороны папы: короткие нажатия пальцев, строки появляются
//    вместе с ними, затем отметка «готово».
// B. Фронтальный план: папа закрывает крышку (она поворачивается вокруг
//    шарнира, руки не проходят сквозь корпус; тихий звук), берёт ключи со
//    стола и кивает сыну — идём. Заявление остаётся на столе; фотография
//    уже у Бектура в руке.
// C. Салон: те же места и ремни (папа за рулём, сын сзади).
import { AbsoluteFill } from "remotion";
import { anticipate, clamp, easeInOut, keys, keysV } from "../rig/motion";
import { C } from "../theme";
import { Paper, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { CloseHand, SKIN } from "../props/CloseHand";
import { LaptopScreen, laptopLidTop } from "../props/Laptop";
import { OFFICE } from "../sets/Office";
import { BOY_CHAIR, BOY_SEAT, DAD_DESK, DAD_SEAT, OfficeFront } from "./OfficeFront";
import { CabinShot } from "./Route";

export const earlyPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "early");
  const front = 58;
  const close: [number, number] = [front + 16, front + 38];
  const keysAt = close[1] + 14;
  const go = keysAt + 22;
  const cabin = Math.max(go + 30, T.to("N06") + 4);
  return { typeEnd: 44, front, close, keysAt, go, cabin, len: T.len };
};
type P = ReturnType<typeof earlyPlan>;

// ---------- A. Экран ----------
const Screen: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const press = (k: number) => (f < p.typeEnd && Math.sin(f * 1.4 + k * 2) > 0.3 ? 1 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: C.wall }}>
      <Paper color={C.wall} />
      <LaptopScreen x={540} y={1180} w={860} typed={f / 9} done={clamp((f - p.typeEnd) / 6)} />
      <Svg>
        <CloseHand x={360} y={1780} angle={176} size={200} {...SKIN.dad} shape="rest" mirror lift={press(0)} />
        <CloseHand x={720} y={1780} angle={184} size={200} {...SKIN.dad} shape="rest" lift={press(1)} />
      </Svg>
    </AbsoluteFill>
  );
};

// ---------- B. Закрывает ноутбук, берёт ключи ----------
const KEYS = { x: 250, y: 1176 };
const Close: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const open = 1 - easeInOut(clamp((f - p.close[0]) / (p.close[1] - p.close[0])));
  const hasKeys = f >= p.keysAt;
  const dadPose = (tt: number) => {
    const o = 1 - easeInOut(clamp((tt - p.close[0]) / (p.close[1] - p.close[0])));
    const top = laptopLidTop(OFFICE.laptop.x, OFFICE.laptop.y, OFFICE.laptop.w, o);
    // правая рука ложится на верхний край крышки и опускает её
    const onLid = { x: OFFICE.laptop.x + 40, y: top.y - 4 };
    const handR = keysV(tt, [[p.close[0] - 12, { x: 480, y: 1150 }], [p.close[0], onLid], [p.close[1], onLid], [p.close[1] + 10, { x: 520, y: 1150 }]], anticipate);
    const handL = keysV(tt, [[p.close[1] + 2, { x: 330, y: 1155 }], [p.keysAt, KEYS], [p.keysAt + 14, { x: 330, y: 1060 }]], anticipate);
    return {
      sit: 1,
      seat: DAD_SEAT,
      expr: tt < p.go ? ("calm" as const) : ("smile" as const),
      lookY: tt < p.keysAt + 4 ? 0.55 : 0.05,
      lookX: tt < p.go ? 0 : 0.4,
      armR: { target: tt >= p.close[0] && tt < p.close[1] ? onLid : handR, shape: tt >= p.close[0] - 2 && tt < p.close[1] + 2 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false, wrist: tt >= p.close[0] && tt < p.close[1] ? -70 : 0 },
      armL: { target: handL, shape: tt >= p.keysAt ? ("fist" as const) : ("relax" as const), item: tt >= p.keysAt ? ("keys" as const) : ("none" as const), elbow: "down" as const, behind: false },
      nod: keys(tt, [[p.go, 0], [p.go + 8, 5], [p.go + 18, 0]]),
    };
  };
  const dadFace = (tt: number) => (tt < p.go - 6 ? 0.1 : 0.6);
  const boyPose = (tt: number) => ({
    sit: 1,
    seat: BOY_SEAT,
    badge: 1,
    expr: tt > p.go + 6 ? ("smile" as const) : ("calm" as const),
    lookY: 0.1,
    // фотография снова у Бектура: держит её у колен
    armR: { target: { x: BOY_CHAIR.x + 30, y: OFFICE.seatY - BOY_SEAT - 50 }, shape: "pinch" as const, item: "photo" as const, elbow: "down" as const, behind: false },
    armL: { target: { x: BOY_CHAIR.x - 50, y: OFFICE.seatY - BOY_SEAT - 20 }, shape: "relax" as const, elbow: "down" as const },
  });
  return (
    <OfficeFront
      f={f}
      cam={{ x: 620, y: 1060, zoom: 1.5 }}
      dad={{ place: () => DAD_DESK, face: dadFace, pose: dadPose }}
      boy={{ place: () => BOY_CHAIR, face: () => -0.45, pose: boyPose }}
      laptopOpen={open}
      extra={
        hasKeys ? null : (
          <Svg>
            <circle cx={KEYS.x} cy={KEYS.y - 4} r={12} fill="none" stroke="#B9BEC8" strokeWidth={4} />
            <rect x={KEYS.x + 6} y={KEYS.y - 8} width={34} height={9} rx={4} fill="#C9A646" />
          </Svg>
        )
      }
    />
  );
};

export const EarlyScene: React.FC = () => {
  const { f } = useScene("early");
  const p = usePlan(earlyPlan);
  if (f < p.front) return <Screen f={f} p={p} />;
  if (f < p.cabin) return <Close f={f} p={p} />;
  return <CabinShot f={f} from={p.cabin} />;
};

