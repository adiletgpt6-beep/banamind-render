// Родители на диване вечером (сцены 6–9): одни места, одна поза «смотрим в
// телефон вместе» (телефон у мамы, к зрителю тыльной стороной), ноутбук с
// незаконченной работой на столе. Сцены меняют только выражения, взгляды и
// жесты поверх базовых поз.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { LOOKS, type LookId } from "../rig/looks";
import type { Vec } from "../rig/motion";
import { ChairBack, LaptopBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { box } from "../shots";
import { sofaPlace, sofaSeatH } from "./common";
import { PhoneBack, phoneH, ScreenGlow } from "./EveningParts";
import { SON_PHONE_W } from "./Hook";

export const SOFA_MOM: Place = sofaPlace("mom");
export const SOFA_DAD: Place = sofaPlace("dad");
export const SOFA_PHONE_W = SON_PHONE_W;
export const SOFA_PH: Vec = { x: 1716, y: 1162 };
const PH_H = phoneH(SOFA_PHONE_W);
export const phoneCorner = (side: -1 | 1, ph: Vec = SOFA_PH): Vec => ({ x: ph.x + side * SOFA_PHONE_W * 0.46, y: ph.y + PH_H * 0.47 });

// голова сидящего на диване (центр овала) — для крупных планов
export const seatedHead = (p: Place, look: LookId, face: number): Vec => {
  const b = LOOKS[look].build;
  const k = p.h / 1000;
  return { x: p.x + face * 0.8 * 12 * k, y: p.y + (b.headY + (-sofaSeatH() / k + 6 - b.hipJointY)) * k };
};
// камера крупного плана: лицо радиусом r в точке (sx, sy) кадра
export const faceCam = (head: Vec, look: LookId, h: number, r = 150, sx = 540, sy = 760) => {
  const z = r / (LOOKS[look].build.headRx * (h / 1000));
  return { x: head.x - (sx - 540) / z, y: head.y - (sy - 960) / z, zoom: z };
};

export const momSofaBase = (phone: boolean): PoseIn => ({
  expr: "softSmile",
  sit: 1,
  seat: sofaSeatH(),
  lookY: 0.42,
  lookX: 0.45,
  headTilt: 3,
  armL: phone ? { target: phoneCorner(-1), shape: "fist", elbow: "down", behind: false } : { target: { x: SOFA_MOM.x - 0.08 * SOFA_MOM.h, y: 1280 }, shape: "relax", elbow: "down" },
  armR: phone ? { target: phoneCorner(1), shape: "fist", elbow: "down", behind: false } : { target: { x: SOFA_MOM.x + 0.1 * SOFA_MOM.h, y: 1282 }, shape: "relax", elbow: "down" },
});
export const dadSofaBase = (): PoseIn => ({
  expr: "softSmile",
  sit: 1,
  seat: sofaSeatH(),
  lean: 7,
  lookY: 0.4,
  lookX: -0.4,
  headTilt: -3,
  armL: { target: { x: SOFA_DAD.x - 0.08 * SOFA_DAD.h, y: 1302 }, shape: "relax", elbow: "down" },
  armR: { target: { x: SOFA_DAD.x + 0.1 * SOFA_DAD.h, y: 1306 }, shape: "relax", elbow: "down" },
});

export const SofaEvening: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly phone: boolean; // телефон в руках мамы
  readonly mom: (t: number) => PoseIn;
  readonly dad: (t: number) => PoseIn;
  readonly momFace: (t: number) => number;
  readonly dadFace: (t: number) => number;
  readonly glow?: number;
  readonly dim?: number; // затемнение мира под графикой
}> = ({ f, uid, phone, mom, dad, momFace, dadFace, glow = 1, dim = 0 }) => {
  const momA = (layer: "body" | "armsNoHands" | "hands") => (
    <Actor uid={`${uid}-mom`} look="momHome" f={f} place={() => SOFA_MOM} face={momFace} pose={mom} role="mother" seed={1} layer={layer} />
  );
  return (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      <Rug />
      <ChairBack x={LIV.chair.x} light="evening" />
      <WorkTable light="evening" />
      <LaptopBack open={1} />
      <Actor uid={`${uid}-dad`} look="dad" f={f} place={() => SOFA_DAD} face={dadFace} pose={dad} role="father" seed={2} />
      {momA("body")}
      {momA("armsNoHands")}
      {phone ? <PhoneBack x={SOFA_PH.x} y={SOFA_PH.y} w={SOFA_PHONE_W} rot={-10} /> : null}
      {momA("hands")}
      {phone ? <ScreenGlow x={SOFA_PH.x - 20} y={SOFA_PH.y - 150} r={170} a={glow} /> : null}
      <div style={box({ left: -400, top: 0, width: 3400, height: 2600, backgroundColor: "rgba(40,36,80,0.16)", mixBlendMode: "multiply", pointerEvents: "none" })} />
      {dim > 0 ? <div style={box({ left: -400, top: 0, width: 3400, height: 2600, backgroundColor: `rgba(20,24,48,${0.45 * dim})`, pointerEvents: "none" })} /> : null}
    </>
  );
};
