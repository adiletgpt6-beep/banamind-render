// Сцены 12–13. Признание: вечер дома. Мама спокойно: «Кандай барып
// келдиңер?» Отец кладёт телефон на стол, немного выдыхает, смотрит на
// неё: «Эми түшүндүм. Эмнеге бир сааттан ашык убакыт бөлөрүңдү.» На фоне —
// длинный блок маминого календаря. Главная эмоция: дочка подходит с той же
// поделкой: «Ата, мен унаада айтып бүтпөй калдым.» Отец отодвигает
// ноутбук, поворачивается к ней и опускает взгляд на поделку: «Көрсөтчү,
// кызым. Мен угуп жатам.» Длинный план, внимание важнее цифр.
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, keys, keysV, lerp } from "../rig/motion";
import { C } from "../theme";
import { Calendar } from "../graphics/Hud";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, ShoeBench, TableFront, Teapot, WarmLamp } from "../sets/Home";
import { PhoneFlat } from "../sets/Apartment";
import { camMove, PanelShot } from "../shots";
import { H, onTable, placeAt, seated, seatOf } from "./common";
import { STAGE, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const DAD = seated("dad", HOME.seat.dad);
const PHONE_SPOT = { x: 1150, y: HOME.table.top + 14 };

export const ConfessScene: React.FC = () => {
  const { f, from } = useScene("confess");
  const m02 = from("m02");
  const f03 = from("f03");
  const mom = placeAt(1600, 1620, H.mom);
  const putDown = m02 + 40;
  const dadPose = (tt: number) => ({
    expr: tt < m02 ? ("tired" as const) : tt < f03 ? ("thinking" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(DAD),
    exhale: keys(tt, [[putDown + 6, 0], [putDown + 22, 0.9], [f03 - 6, 0.5], [f03 + 30, 0.2]]),
    armL: {
      target: keysV(tt, [[0, { x: DAD.x - 0.04 * DAD.h, y: HOME.table.top - 110 }], [putDown - 12, { x: DAD.x - 0.04 * DAD.h, y: HOME.table.top - 110 }], [putDown, { x: PHONE_SPOT.x + 4, y: PHONE_SPOT.y - 8 }], [putDown + 18, onTable(DAD.x - 0.12 * DAD.h, -4)]], anticipate),
      shape: tt < putDown ? ("phone" as const) : ("relax" as const),
      item: tt < putDown ? ("phone" as const) : ("none" as const),
      flat: tt < putDown - 12 ? 0 : clamp((tt - putDown + 12) / 12),
      glow: tt < putDown ? 1 : 0,
      elbow: "down" as const,
      behind: false,
    },
    armR: { target: onTable(DAD.x + 0.13 * DAD.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: keys(tt, [[0, 0.55], [m02, 0.55], [m02 + 10, 0.2], [putDown - 14, 0.5], [putDown + 6, 0.3], [f03 - 10, 0]]),
  });
  // взгляд: телефон → (на вопрос) мама → телефон на стол → мама
  const dadFace = (tt: number) => keys(tt, [[0, 0.1], [m02 + 4, 0.1], [m02 + 14, 0.55], [putDown - 14, 0.3], [f03 - 14, 0.3], [f03 - 2, 0.6]]);
  const momPose = (tt: number) => ({
    expr: tt < f03 + 30 ? ("calm" as const) : ("softSmile" as const),
    armL: { target: { x: mom.x - 0.05 * mom.h, y: mom.y - 0.55 * mom.h }, shape: "fist" as const, item: "cup" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: mom.x + 0.02 * mom.h, y: mom.y - 0.5 * mom.h }, shape: "relax" as const, elbow: "down" as const, behind: false },
    headTilt: keys(tt, [[f03 + 20, 0], [f03 + 36, 5]]),
    nod: keys(tt, [[f03 + 70, 0], [f03 + 80, 4], [f03 + 92, 0]]),
  });
  const momFace = () => -0.5;
  return (
    <PanelShot f={f} from={0} to={300} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={camMove(f, 0, 300, { x: 1380, y: 1110, zoom: 1.05 }, { x: 1360, y: 1100, zoom: 1.14 })} bg="#2B2233">
      <HomeBack minutes={20 * 60 + 10 + f / 300} evening={1} f={f} />
      <WarmLamp />
      {/* длинный блок маминого календаря — ненавязчиво на стене */}
      <div style={box({ left: 1000, top: 380, width: 300, height: 360, opacity: 0.32, borderRadius: 18, overflow: "hidden", backgroundColor: C.panel })}>
        <Calendar w={300} h={360} mode="mom" />
      </div>
      <ChairBack x={DAD.x} evening={1} />
      <Actor uid="e12-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      <LaptopSide x={1290} y={HOME.laptop.y} open={1} glow={0.6} />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      {f >= putDown ? <PhoneFlat x={PHONE_SPOT.x} y={PHONE_SPOT.y} /> : null}
      <Actor uid="e12-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      <Actor uid="e12-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} />
    </PanelShot>
  );
};

// Ноутбук отца: отодвигается в сторону (кадры сцены «craft»).
export const craftLaptopX = (tt: number, push: number) => keys(tt, [[push, 1290], [push + 26, 1400]]);

export const CraftScene: React.FC = () => {
  const { f, from } = useScene("craft");
  const d03 = from("d03");
  const f04 = from("f04");
  const girl = (tt: number): Place => {
    const u = cruise(tt / 40, 0.3);
    return placeAt(lerp(760, 1060, u), lerp(1640, 1690, u), H.girl);
  };
  const push = d03 + 40; // отодвигает ноутбук после её фразы
  const turn = push + 30;
  const look = f04 + 18;
  const lx = craftLaptopX(f, push);
  const craftHold = (tt: number) => {
    const p = girl(tt);
    return { x: p.x + 0.12 * p.h, y: p.y - keys(tt, [[0, 0.5], [look - 10, 0.5], [look + 10, 0.62]]) * p.h };
  };
  const girlPose = (tt: number) => {
    const p = girl(tt);
    const c = craftHold(tt);
    return {
      expr: tt < d03 + 20 ? ("calm" as const) : tt < f04 + 10 ? ("softSmile" as const) : ("smile" as const),
      armR: { target: c, shape: "fist" as const, item: "craft" as const, elbow: "down" as const, behind: false },
      armL: { target: { x: c.x - 0.1 * p.h, y: c.y + 10 }, shape: "open" as const, elbow: "down" as const, behind: false },
      lookY: keys(tt, [[0, 0], [look, 0], [look + 12, 0.35]]),
    };
  };
  const girlFace = () => 0.45;
  const dadPose = (tt: number) => ({
    expr: tt < d03 ? ("thinking" as const) : tt < turn ? ("calm" as const) : ("smile" as const),
    sit: 1,
    seat: seatOf(DAD),
    lean: keys(tt, [[turn, 0], [turn + 20, 6], [look, 6], [look + 16, 12]]),
    // правая рука отодвигает ноутбук; затем обе руки свободно на столе
    armR: { target: keysV(tt, [[0, onTable(lx - 40, -6)], [push - 10, onTable(1250, -6)], [push, onTable(1260, -6)], [push + 26, onTable(1370, -6)], [push + 40, onTable(DAD.x + 0.12 * DAD.h, -4)]], anticipate), shape: tt > push - 6 && tt < push + 30 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    armL: { target: keysV(tt, [[0, onTable(lx - 90, -6)], [turn, onTable(DAD.x - 0.13 * DAD.h, -4)]]), shape: "relax" as const, elbow: "down" as const, behind: false },
    // последовательно: глаза → голова → корпус; затем взгляд на поделку
    lookX: keys(tt, [[d03 - 2, 0], [d03 + 6, -0.8], [turn, -0.3]]),
    lookY: keys(tt, [[0, 0.5], [d03, 0.5], [d03 + 8, 0.05], [look, 0.05], [look + 10, 0.6]]),
    turnBody: 0.9,
  });
  const dadFace = (tt: number) => keys(tt, [[0, 0.2], [d03 + 6, 0.2], [d03 + 18, -0.3], [turn, -0.3], [turn + 24, -0.6]]);
  return (
    <PanelShot f={f} from={0} to={240} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={camMove(f, 0, 240, { x: 1140, y: 1150, zoom: 1.15 }, { x: 1150, y: 1140, zoom: 1.3 })} bg="#2B2233">
      <HomeBack minutes={20 * 60 + 25 + f / 300} evening={1} f={f} />
      <WarmLamp />
      <ShoeBench sonPack={false} girlPack bag />
      <ChairBack x={DAD.x} evening={1} />
      <Actor uid="e13-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      <Teapot x={760} y={HOME.table.top + 18} s={0.8} />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <PhoneFlat x={PHONE_SPOT.x} y={PHONE_SPOT.y} />
      <LaptopSide x={lx} y={HOME.laptop.y} open={1} glow={0.6} />
      <Actor uid="e13-dad" look="dad" f={f} place={() => DAD} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
      <Actor uid="e13-girl" look="girl" f={f} place={girl} face={girlFace} pose={girlPose} role="daughter" seed={3} />
    </PanelShot>
  );
};
