// Сцена 9. У него есть место на корабле.
// A. Белая машина подъезжает к дому и останавливается; задняя дверь
//    открывается — Бектур виден в салоне.
// B. Он уже стоит на тротуаре (обе стопы на земле), закрывает дверь за
//    ручку (дверь вращается вокруг шарнира), замечает друзей и бежит —
//    короткий детский бег: разгон, ровный темп, остановка.
// C. Двор: картонный корабль на земле у жилого дома. Бектур останавливается
//    возле друзей: «Мен да жардам берем!» (S04 — после рассказчика). Друзья
//    отвечают жестом и освобождают место. Папа подходит спокойнее.
// D. Совместное действие: папа держит мачту у основания, Бектур прикладывает
//    картонную опору, друг придерживает корпус, флажок колышется.
// E. Общий план: мальчик уже в игре, папа рядом слушает.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { C } from "../theme";
import { box, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { CarSide, doorHandleAt } from "../props/Car";
import { SHIP, ShipReal } from "../props/Ship";
import { H } from "./common";

export const yardPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "yard");
  const stop = 34;
  const doorOpen: [number, number] = [stop + 14, stop + 40];
  const out = doorOpen[1] + 8; // B
  const close: [number, number] = [out + 14, out + 34];
  const run: [number, number] = [close[1] + 16, close[1] + 56];
  const yard = run[1] - 6; // C
  const s04 = T.from("S04");
  const room = T.to("S04") + 4;
  const joint = Math.max(room + 34, T.to("S04") + 40); // D
  const brace: [number, number] = [joint + 20, joint + 46];
  const wide = joint + 104; // E
  return { stop, doorOpen, out, close, run, yard, boyStop: yard + 46, dadIn: [yard + 30, yard + 130] as const, s04, room, joint, brace, wide, len: T.len };
};
type P = ReturnType<typeof yardPlan>;

const CAR = { x: 1150, y: 1990, s: 1.8 };
const HomeFacade: React.FC = () => (
  <div style={box({ left: -400, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 3000, height: 2100, backgroundColor: "#CFE3F2" })} />
    <div style={box({ left: 300, top: 420, width: 2200, height: 1520, backgroundColor: "#E9DCC7" })} />
    {Array.from({ length: 4 }).map((_, r) =>
      Array.from({ length: 8 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 380 + c * 270, top: 500 + r * 340, width: 150, height: 190, backgroundColor: "#9FB6CE", border: `10px solid ${C.paper}`, boxSizing: "border-box" })} />),
    )}
    <div style={box({ left: 0, top: 1900, width: 3000, height: 120, backgroundColor: "#8F949C" })} />
    <div style={box({ left: 0, top: 2020, width: 3000, height: 30, backgroundColor: "#C9C3B6" })} />
    <div style={box({ left: 0, top: 2050, width: 3000, height: 700, backgroundColor: "#DDD6C8" })} />
  </div>
);

// ---------- A. Машина у дома ----------
const Arrive: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const u = easeOut(clamp(f / p.stop));
  const x = lerp(-300, CAR.x, u);
  const bounce = f > p.stop - 4 && f < p.stop + 8 ? Math.sin(((f - p.stop + 4) / 12) * Math.PI) * 3 : 0;
  const a = keys(f, [[p.doorOpen[0], 0], [p.doorOpen[1], 66]], anticipate);
  // Бектур в салоне (виден в окне), поворачивается к открытой двери
  const boy: Place = { x: x - 140 * CAR.s, y: CAR.y + 20, h: 520 };
  return (
    <Shot f={f} cam={{ x: 900, y: 1600, zoom: 0.62 }} bg="#CFE3F2">
      <HomeFacade />
      <CarSide x={x} y={CAR.y} s={CAR.s} layer="back" open={a} />
      <div style={box({ left: -2000, top: 0, width: 6000, height: 1900, overflow: "hidden" })}>
        <div style={box({ left: 2000, top: 0 })}>
          <Actor uid="y9-boycar" look="bektur" f={f} place={() => boy} face={() => (f > p.doorOpen[0] ? 0.6 : 0.2)} pose={() => ({ sit: 1, seat: 120, badge: 1, expr: "smile" })} seed={4} blinkShift={37} />
        </div>
      </div>
      <CarSide x={x} y={CAR.y} s={CAR.s} layer="body" open={a} wheel={u * 900} bounce={bounce} />
      <CarSide x={x} y={CAR.y} s={CAR.s} layer="door" open={a} />
    </Shot>
  );
};

// ---------- B. Закрывает дверь и бежит ----------
const Out: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const a = keys(f, [[p.close[0], 66], [p.close[1], 0]], easeInOut);
  const place = (tt: number): Place => ({ x: lerp(640, -500, cruise(clamp((tt - p.run[0]) / (p.run[1] - p.run[0])), 0.3)), y: 2110, h: H.boy });
  const pose = (tt: number) => {
    const ang = keys(tt, [[p.close[0], 66], [p.close[1], 0]], easeInOut);
    const h = doorHandleAt(CAR.x, CAR.y, CAR.s, ang);
    const b = place(tt);
    const onDoor = tt >= p.close[0] - 2 && tt < p.close[1] + 2;
    const rest = { x: b.x + 0.12 * b.h, y: b.y - 0.42 * b.h };
    return {
      badge: 1,
      expr: tt > p.close[1] + 6 ? ("smile" as const) : ("calm" as const),
      armR: { target: onDoor ? h : keysV(tt, [[p.close[0] - 12, rest], [p.close[0] - 2, h], [p.close[1] + 2, h], [p.close[1] + 12, rest]], anticipate), shape: onDoor ? ("fist" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      lean: tt > p.run[0] ? 8 : 0,
    };
  };
  // голова: к двери → (заметил друзей) влево → бег влево
  const face = (tt: number) => keys(tt, [[0, 0.6], [p.close[1] + 2, 0.6], [p.close[1] + 10, -0.8]]);
  return (
    <Shot f={f} cam={{ x: 860, y: 1640, zoom: 0.95 }} bg="#CFE3F2">
      <HomeFacade />
      <CarSide x={CAR.x} y={CAR.y} s={CAR.s} layer="back" open={a} />
      <CarSide x={CAR.x} y={CAR.y} s={CAR.s} layer="body" open={a} />
      <CarSide x={CAR.x} y={CAR.y} s={CAR.s} layer="door" open={a} />
      <Actor uid="y9-boyout" look="bektur" f={f} place={place} face={face} pose={pose} role="son" seed={4} blinkShift={37} walkFrom={p.run[0] - 2} />
    </Shot>
  );
};

// ---------- C–E. Двор с кораблём ----------
const SHIPW = { x: 560, y: 1520, s: 0.75 };
const MAST_X = SHIPW.x + SHIP.mast.x * SHIPW.s;
const DECK_Y = SHIPW.y + SHIP.deckY * SHIPW.s;
const FR_A: Place = { x: 190, y: 1610, h: 540 };
const FR_C: Place = { x: 380, y: 1640, h: 600 };

const Yard: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const boy = (tt: number): Place => ({ x: lerp(1300, 820, cruise(clamp((tt - p.yard) / (p.boyStop - p.yard)), 0.25)), y: 1620, h: H.boy });
  const dad = (tt: number): Place => ({ x: lerp(1400, 540, cruise(clamp((tt - p.dadIn[0]) / (p.dadIn[1] - p.dadIn[0])), 0.25)), y: 1660, h: 760 });
  const frB = (tt: number): Place => ({ x: lerp(800, 960, easeInOut(clamp((tt - p.room) / 20))), y: 1612, h: 540 });
  const lift = 1; // мачта уже поднята
  const braceOn = clamp((f - p.brace[1]) / 2);
  const braceHand = keysV(f, [[p.brace[0], { x: MAST_X + 110, y: DECK_Y + 40 }], [p.brace[1], { x: MAST_X + 56, y: DECK_Y - 46 }]], easeInOut);
  const holdMast = f >= p.joint;
  const boyPose = (tt: number) => {
    const b = boy(tt);
    const bracing = tt >= p.brace[0] - 10 && tt < p.brace[1] + 6;
    return {
      badge: 1,
      expr: tt < p.boyStop ? ("smile" as const) : tt < p.s04 ? ("calm" as const) : ("smile" as const),
      lean: tt < p.boyStop ? 10 : bracing ? 14 : 0,
      armR: bracing ? { target: tt < p.brace[0] ? { x: b.x + 0.1 * b.h, y: b.y - 0.4 * b.h } : braceHand, shape: "pinch" as const, item: tt < p.brace[1] ? ("brace" as const) : ("none" as const), elbow: "down" as const, behind: false } : undefined,
      armL: tt >= p.brace[1] && tt < p.wide ? { target: { x: MAST_X + 40, y: DECK_Y - 40 }, shape: "open" as const, elbow: "down" as const, behind: false } : undefined,
    };
  };
  const boyFace = (tt: number) => (tt < p.boyStop ? -0.8 : tt < p.room + 20 ? -0.45 : -0.6);
  const dadPose = (tt: number) => ({
    expr: "smile" as const,
    // держит мачту двумя руками у основания
    armL: holdMast ? { target: { x: MAST_X - 8, y: DECK_Y - 150 }, shape: "fist" as const, elbow: "down" as const, behind: false } : undefined,
    armR: holdMast ? { target: { x: MAST_X - 4, y: DECK_Y - 60 }, shape: "fist" as const, elbow: "down" as const, behind: false } : undefined,
    lookY: tt > p.wide ? -0.1 : 0.3,
  });
  const dadFace = (tt: number) => (tt < p.dadIn[1] ? -0.8 : tt < p.wide ? 0.4 : 0.6);
  const cam =
    f < p.joint
      ? { x: 580, y: 1250, zoom: 1.22 }
      : f < p.wide
        ? { x: MAST_X + 40, y: DECK_Y + 40, zoom: 1.75 }
        : { x: 580, y: 1250, zoom: lerp(1.15, 1.22, clamp((f - p.wide) / 120)) };
  return (
    <Shot f={f} cam={cam} bg="#CFE3F2">
      <div style={box({ left: -400, top: 0, width: 2000, height: 1400, backgroundColor: "#CFE3F2" })} />
      <div style={box({ left: -300, top: 420, width: 1700, height: 1020, backgroundColor: "#E9DCC7" })} />
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 6 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: -220 + c * 270, top: 500 + r * 300, width: 150, height: 180, backgroundColor: "#9FB6CE", border: `10px solid ${C.paper}`, boxSizing: "border-box" })} />),
      )}
      <div style={box({ left: -400, top: 1400, width: 2000, height: 900, backgroundColor: "#B9C98C" })} />
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`translate(${SHIPW.x} ${SHIPW.y}) scale(${SHIPW.s})`}>
          <ShipReal stage={{ cabin: true, mast: "up", mastLift: lift, brace: braceOn, flagWave: f * 0.18 }} />
        </g>
      </svg>
      <Actor uid="y9-a" look="friendA" f={f} place={() => FR_A} face={() => 0.5} pose={(tt) => ({ expr: "smile", armR: tt > p.room && tt < p.room + 30 ? { target: { x: 320, y: 1180 }, shape: "wave", elbow: "out" } : undefined })} seed={11} />
      <Actor uid="y9-c" look="friendC" f={f} place={() => FR_C} face={() => 0.5} pose={() => ({ expr: "calm", armR: { target: { x: 480, y: DECK_Y + 70 }, shape: "open", elbow: "down", behind: false }, armL: { target: { x: 300, y: DECK_Y + 90 }, shape: "open", elbow: "down" } })} seed={13} />
      <Actor uid="y9-b" look="friendB" f={f} place={frB} face={(tt) => (tt < p.room ? 0.2 : -0.5)} pose={(tt) => ({ expr: "smile", armL: tt > p.room + 4 && tt < p.room + 40 ? { target: { x: frB(tt).x - 140, y: 1300 }, shape: "open", elbow: "out" } : undefined })} seed={12} walkFrom={p.room - 2} />
      <Actor uid="y9-dad" look="dadIT" f={f} place={dad} face={dadFace} pose={dadPose} seed={2} walkFrom={p.dadIn[0] - 2} />
      <Actor uid="y9-boy" look="bektur" f={f} place={boy} face={boyFace} pose={boyPose} role="son" seed={4} blinkShift={37} walkFrom={p.yard - 2} />
    </Shot>
  );
};

export const YardScene: React.FC = () => {
  const { f } = useScene("yard");
  const p = usePlan(yardPlan);
  if (f < p.out) return <Arrive f={f} p={p} />;
  if (f < p.yard) return <Out f={f} p={p} />;
  return (
    <AbsoluteFill>
      <Yard f={f} p={p} />
    </AbsoluteFill>
  );
};
