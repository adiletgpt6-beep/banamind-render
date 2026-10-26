// Сцена 3. Дома его есть кому встретить (день, та же квартира).
// A. Общий план прихожей и игрового уголка: дверь открыта, мама в дверях
//    (заехала между встречами), мальчик с рюкзаком входит и проходит к
//    крючку; няня на пуфе у ковра оборачивается и приветственно машет.
// B. Средний план: сестрёнка берёт кубик с ковра и ставит на башенку,
//    няня придерживает башенку.
// C. Средний план у крючка (склейка): мальчик вешает рюкзак — петля
//    касается крючка, кисть отпускает, рюкзак остаётся висеть.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, cruise, keys, keysV, lerp } from "../rig/motion";
import { box, camMove, Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Km2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { Blocks, FLAT, FlatBack, PackOnHook, Pouf, Rug, RUG_BLOCK, Tone, TOWER_X, towerTop } from "../sets/Flat";
import { H } from "./common";

const PACK = "#2F6FD6";
const NANNY_X = -10;
const SIS_X = -205;

export const nannyPlan = (tl: Km2Timeline) => {
  const T = sceneTools(tl, "nanny");
  const walk: [number, number] = [8, 62]; // мальчик входит и идёт к крючку
  const wave = 40; // няня машет
  const blocks = Math.max(walk[1] + 20, T.word("N03", "Ал") - 4);
  const reach = blocks + 8;
  const grab = reach + 14;
  const place = grab + 26;
  const hook = Math.max(place + 22, T.word("N03", "Кыйынчылык") - 4);
  const hang = hook + 18; // петля на крючке
  return { walk, wave, blocks, reach, grab, place, hook, hang, len: T.len };
};
type P = ReturnType<typeof nannyPlan>;

const boyPath = (p: P) => (t: number): Place => {
  const u = cruise(clamp((t - p.walk[0]) / (p.walk[1] - p.walk[0])), 0.3);
  return { x: lerp(-560, -360, u), y: FLAT.floorY + 10, h: H.boy };
};

const nannyPose = (p: P) => (t: number): PoseIn => {
  const w = t > p.wave && t < p.wave + 34 ? Math.sin((t - p.wave) / 3.4) : 0;
  const waving = t > p.wave - 4 && t < p.wave + 40;
  return {
    sit: 1,
    seat: 170,
    expr: waving ? "smile" : "softSmile",
    lookY: waving ? -0.05 : 0.45,
    armL: waving
      ? { target: { x: NANNY_X - 60 + 14 * w, y: FLAT.floorY - 560 }, shape: "wave", elbow: "out" }
      : { target: { x: TOWER_X + 40, y: towerTop(3) + 40 }, shape: "open", elbow: "down", behind: false },
    armR: { target: { x: NANNY_X + 50, y: FLAT.floorY - 190 }, shape: "relax", elbow: "down" },
  };
};
const nannyFace = (p: P) => (t: number) => keys(t, [[p.wave - 12, -0.55], [p.wave - 2, -0.85], [p.wave + 40, -0.85], [p.wave + 52, -0.5]]);

// Сестрёнка: присела у башенки, берёт кубик с ковра и ставит сверху.
const sisHand = (p: P) => (t: number) =>
  keysV(t, [
    [p.reach, { x: SIS_X + 30, y: FLAT.floorY - 150 }],
    [p.grab, { x: RUG_BLOCK.x, y: RUG_BLOCK.y - 10 }],
    [p.grab + 4, { x: RUG_BLOCK.x, y: RUG_BLOCK.y - 10 }],
    [p.place, { x: TOWER_X, y: towerTop(4) + 13 }],
    [p.place + 6, { x: TOWER_X, y: towerTop(4) + 13 }],
    [p.place + 22, { x: SIS_X + 40, y: FLAT.floorY - 160 }],
  ]);
const sisPose = (p: P) => (t: number): PoseIn => {
  const h = sisHand(p)(t);
  const holding = t >= p.grab + 2 && t < p.place + 3;
  return {
    crouch: 0.55,
    expr: t > p.place + 4 ? "smile" : "calm",
    lookY: 0.6,
    armR: { target: h, shape: holding ? "fist" : "open", elbow: "down", behind: false },
    armL: { target: { x: SIS_X - 30, y: FLAT.floorY - 150 }, shape: "relax", elbow: "down" },
  };
};

const Living: React.FC<{ f: number; p: P; cam: { x: number; y: number; zoom: number }; boy?: React.ReactNode }> = ({ f, p, cam, boy }) => {
  const holding = f >= p.grab + 2 && f < p.place + 3;
  const tower = f >= p.place + 3 ? 4 : 3;
  const h = sisHand(p)(f);
  return (
    <Shot f={f} cam={cam} bg={C.wallHome}>
      <FlatBack warm={0} />
      <Rug />
      <Pouf x={NANNY_X} />
      <Actor uid="n3-nanny" look="km2Nanny" f={f} place={() => ({ x: NANNY_X, y: FLAT.floorY - 16, h: H.nanny })} face={nannyFace(p)} pose={nannyPose(p)} seed={21} blinkShift={7} />
      <Blocks tower={tower} taken={f >= p.grab + 2} held={holding ? { x: h.x, y: h.y + 12 } : null} />
      <Actor uid="n3-sis" look="km2Sister" f={f} place={() => ({ x: SIS_X, y: FLAT.floorY + 4, h: H.sister })} face={() => 0.55} pose={sisPose(p)} seed={23} blinkShift={50} />
      {boy}
      <Tone color={TINT.cool} />
    </Shot>
  );
};

export const NannyScene: React.FC = () => {
  const { f } = useScene("nanny");
  const p = usePlan(nannyPlan);
  if (f < p.blocks) {
    // A. Общий план: мама в дверях, мальчик проходит к крючку
    const momPose = (t: number): PoseIn => ({ expr: "softSmile", armR: { target: { x: FLAT.door.x1 - 30, y: FLAT.floorY - 420 }, shape: "relax", elbow: "down" }, armL: t > 30 && t < 70 ? { target: { x: -620, y: FLAT.floorY - 640 + 10 * Math.sin(t / 3.4) }, shape: "wave", elbow: "out" } : undefined });
    const boy = (
      <Actor uid="n3-boy" look="km2BoySchool" f={f} place={boyPath(p)} face={(t) => (t < p.walk[1] ? 0.6 : keys(t, [[p.walk[1], 0.6], [p.walk[1] + 12, 0.3]]))} pose={() => ({ expr: "calm", lookY: 0 })} role="boy" seed={9} walkFrom={0} />
    );
    return (
        <Shot f={f} cam={camMove(f, 0, p.blocks, { x: -280, y: 1080, zoom: 1.0 }, { x: -260, y: 1090, zoom: 1.05 })} bg={C.wallHome}>
          <FlatBack warm={0} />
          {/* открытая дверь: створка прижата к стене слева, в проёме мама */}
          <div style={box({ left: FLAT.door.x0, top: FLAT.door.top, width: FLAT.door.x1 - FLAT.door.x0, height: FLAT.floorY - FLAT.door.top, backgroundColor: "#DCE7EE" })} />
          <div style={box({ left: FLAT.door.x0 - 40, top: FLAT.door.top, width: 40, height: FLAT.floorY - FLAT.door.top, backgroundColor: "#8A6A52" })} />
          <Actor uid="n3-mom" look="km2Mom" f={f} place={() => ({ x: -540, y: FLAT.floorY - 14, h: H.mom * 0.97 })} face={() => 0.35} pose={momPose} seed={5} />
          <Rug />
          <Pouf x={NANNY_X} />
          <Actor uid="n3-nanny" look="km2Nanny" f={f} place={() => ({ x: NANNY_X, y: FLAT.floorY - 16, h: H.nanny })} face={nannyFace(p)} pose={nannyPose(p)} seed={21} blinkShift={7} />
          <Blocks tower={3} />
          <Actor uid="n3-sis" look="km2Sister" f={f} place={() => ({ x: SIS_X, y: FLAT.floorY + 4, h: H.sister })} face={() => 0.55} pose={sisPose(p)} seed={23} blinkShift={50} />
          {boy}
          <Tone color={TINT.cool} />
        </Shot>
    );
  }
  if (f < p.hook) return <Living f={f} p={p} cam={{ x: -120, y: 1250, zoom: 1.75 }} />;
  // C. У крючка: рюкзак в руке (снят), петля на крючок, кисть отпускает
  const hookPt = { x: FLAT.hook.x, y: FLAT.hook.y + 14 };
  const hand = keysV(f, [
    [p.hook, { x: hookPt.x - 80, y: hookPt.y + 110 }],
    [p.hang, hookPt],
    [p.hang + 6, hookPt],
    [p.hang + 24, { x: hookPt.x - 120, y: FLAT.floorY - 260 }],
  ]);
  const hung = f >= p.hang + 4;
  const boyPose = (): PoseIn => ({
    expr: "calm",
    lookY: f < p.hang + 8 ? -0.45 : 0,
    packOff: true,
    armR: { target: hand, shape: hung ? "open" : "fist", item: hung ? "none" : "backpack", itemColor: PACK, elbow: "down", behind: false },
  });
  return (
    <Shot f={f} cam={{ x: -370, y: 1180, zoom: 1.65 }} bg={C.wallHome}>
      <FlatBack warm={0} />
      {hung ? <PackOnHook color={PACK} /> : null}
      <Actor uid="n3-boy2" look="km2BoySchool" f={f} place={() => ({ x: -450, y: FLAT.floorY + 10, h: H.boy })} face={(t) => keys(t, [[p.hang + 10, 0.45], [p.hang + 24, -0.2]])} pose={boyPose} role="boy" seed={9} />
      <Tone color={TINT.cool} />
    </Shot>
  );
};
