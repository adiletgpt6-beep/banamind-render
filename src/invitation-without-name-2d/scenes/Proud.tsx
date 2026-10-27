// Сцена 4. Отец, которым гордятся. A — кабинет инженера: папа за столом
// ведёт линию на чертеже, Эмир рядом наклоняется к листу (N03, «Атасы —
// инженер»). B — крупно чертёж: фасад и конструктивные линии; карандаш папы
// дочерчивает размерную линию, палец Эмира ведёт по оси колонны (на
// «Эмир анын чиймелерин…»). C — школа: Эмир с гордостью рассказывает двум
// одноклассникам (S01); дети удивлённо переглядываются и улыбаются.
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, Paper, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C } from "../theme";
import { BlueprintArt } from "../props/Blueprint";
import { CloseHand, SKIN, WritingHand } from "../props/CloseHand";
import { OFFICE, OfficeBack, OfficeChairBack, OfficeDesk } from "../sets/Office";
import { CORRIDOR, Corridor } from "../sets/School";
import { OnTable } from "../sets/Home";
import { H } from "./common";

export const proudPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "proud");
  const close = T.word("N03", "Эмир") - 6;
  const school = T.to("N03") + 10;
  return { n03: T.from("N03"), close, school, s01: T.from("S01"), up: T.word("S01", "чыныгы") - 4, s01End: T.to("S01"), len: T.len };
};
type P = ReturnType<typeof proudPlan>;

const DAD: Place = { x: OFFICE.seatX, y: OFFICE.floorY, h: H.dad };
const EMIR: Place = { x: 760, y: OFFICE.floorY, h: H.boy };
const PRINT = { x: 545, y: 1258 };

const Office: React.FC<{ f: number; p: P }> = ({ f }) => {
  const stroke = (tt: number) => Math.sin(tt / 7) * 22;
  const dadPose = (tt: number) => ({
    sit: 1,
    seat: 216,
    lean: 10,
    expr: "calm" as const,
    lookY: 0.65,
    lookX: 0.2,
    armR: { target: { x: 520 + stroke(tt), y: 1250 }, shape: "pinch" as const, item: "pencil" as const, itemColor: C.yellow, elbow: "down" as const, behind: false },
    armL: { target: { x: 400, y: 1252 }, shape: "relax" as const, elbow: "down" as const },
  });
  const emirPose = (tt: number) => ({
    lean: keys(tt, [[10, 0], [30, 9]]),
    expr: "softSmile" as const,
    lookY: 0.7,
    lookX: -0.4,
    armL: { target: { x: 690, y: 1236 }, shape: "relax" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: 805, y: 1238 }, shape: "relax" as const, elbow: "down" as const },
  });
  return (
    <Shot f={f} cam={{ x: 600, y: 1110, zoom: keys(f, [[0, 1.5], [60, 1.6]]) }} bg="#ECEDEA">
      <OfficeBack />
      <OfficeChairBack x={DAD.x} />
      <Actor uid="p4-dad" look="azamat" f={f} place={() => DAD} face={() => 0.2} pose={dadPose} seed={2} layer="body" />
      <Actor uid="p4-emir" look="emir" f={f} place={() => EMIR} face={() => -0.45} pose={emirPose} seed={4} blinkShift={37} layer="body" />
      <OfficeDesk />
      <OnTable x={PRINT.x} y={PRINT.y} squash={0.27}>
        <BlueprintArt w={330} detail={false} />
      </OnTable>
      <Actor uid="p4-dad" look="azamat" f={f} place={() => DAD} face={() => 0.2} pose={dadPose} seed={2} layer="arms" />
      <Actor uid="p4-emir" look="emir" f={f} place={() => EMIR} face={() => -0.45} pose={emirPose} seed={4} blinkShift={37} layer="arms" />
    </Shot>
  );
};

// Крупно сверху: чертёж на столе.
const Drawing: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.close;
  const W = 940;
  const u = W / 100;
  const x0 = 540 - W / 2;
  const y0 = 900 - (W * 0.72) / 2;
  // карандаш папы: размерная линия снизу (от левого края здания к правому)
  const draw = clamp((t - 6) / 40);
  const tip = { x: x0 + (22 + 40 * easeInOut(draw)) * u, y: y0 + 67 * u };
  // палец Эмира: вдоль средней оси колонны сверху вниз
  const fing = keysV(t, [[0, { x: 1000, y: 300 }], [14, { x: x0 + 42 * u, y: y0 + 10 * u }], [52, { x: x0 + 42 * u, y: y0 + 52 * u }]], anticipate);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F2F1EC" }}>
      <Paper color="#F2F1EC" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <g transform={`translate(540 900) rotate(-1)`}>
          <BlueprintArt w={W} focus={clamp((t - 12) / 10)} />
        </g>
        {/* дочерченная размерная линия (поверх чертежа) */}
        <line x1={x0 + 22 * u} y1={y0 + 67 * u} x2={tip.x} y2={tip.y} stroke={C.blue} strokeWidth={4} strokeLinecap="round" />
        <CloseHand x={fing.x + 0.6 * 209} y={fing.y - 0.8 * 209} angle={37} size={190} {...SKIN.emir} shape="point" mirror armLen={5} />
        <WritingHand tip={tip} size={210} skin={SKIN.azamat} angle={150} lift={t < 6 ? (6 - t) * 6 : 0} />
      </svg>
    </AbsoluteFill>
  );
};

// Школа: Эмир и двое одноклассников.
const EMIR_S: Place = { x: 470, y: CORRIDOR.floorY, h: H.boy };
const KID_A: Place = { x: 735, y: CORRIDOR.floorY, h: 555 };
const KID_B: Place = { x: 900, y: CORRIDOR.floorY, h: 585 };
const Friends: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const heard = (tt: number) => tt >= p.s01End - 6;
  const emirPose = (tt: number) => {
    const up = keys(tt, [[p.up - 6, 0], [p.up + 6, 1], [p.s01End + 14, 1], [p.s01End + 28, 0]]);
    return {
      expr: tt < p.s01 - 8 ? ("calm" as const) : ("smile" as const),
      lookX: 0.3,
      lookY: -0.05,
      lean: -3 * up,
      // рука поднимается вверх — «настоящие здания»; вторая — к груди
      armR: { target: up > 0.02 ? { x: lerp(560, 600, up), y: lerp(1260, 1010, up) } : null, shape: up > 0.5 ? ("point" as const) : ("relax" as const), elbow: "down" as const, behind: false },
      armL: { target: { x: 455, y: 1235 }, shape: "relax" as const, elbow: "down" as const, behind: false },
      headTilt: 3 * up,
    };
  };
  const kidPose = (k: number) => (tt: number) => ({
    expr: heard(tt) ? (k ? ("smile" as const) : ("surprised" as const)) : ("calm" as const),
    lookX: -0.35,
    lookY: tt > p.up && tt < p.s01End ? -0.2 : 0,
    nod: heard(tt) ? keys(tt, [[p.s01End - 6 + k * 6, 0], [p.s01End + 2 + k * 6, 4], [p.s01End + 12 + k * 6, 0]]) : 0,
    armL: { target: null, shape: "relax" as const },
    armR: { target: null, shape: "relax" as const },
  });
  return (
    <Shot f={f} cam={{ x: 690, y: 1150, zoom: 1.6 }} bg={C.corridor}>
      <div style={box({ left: 0, top: 0, transform: "translateX(-760px)" })}>
        <Corridor />
      </div>
      <Actor uid="p4-kA" look="classA" f={f} place={() => KID_A} face={() => -0.5} pose={kidPose(0)} seed={11} blinkShift={13} />
      <Actor uid="p4-kB" look="classB" f={f} place={() => KID_B} face={() => -0.55} pose={kidPose(1)} seed={12} blinkShift={51} />
      <Actor uid="p4-emir-s" look="emir" f={f} place={() => EMIR_S} face={() => 0.5} pose={emirPose} role="son" seed={4} blinkShift={37} />
    </Shot>
  );
};

export const ProudScene: React.FC = () => {
  const { f } = useScene("proud");
  const p = usePlan(proudPlan);
  if (f >= p.school) return <Friends f={f} p={p} />;
  if (f >= p.close) return <Drawing f={f} p={p} />;
  return <Office f={f} p={p} />;
};
