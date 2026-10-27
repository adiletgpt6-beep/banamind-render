// Сцена 4 «Апа эстейт» (276 кадров ≈ 9,2 с).
// Продолжение сцены 1: мама опускает крышку ноутбука, поворачивается к
// телефону и улыбается. Сын повторно включает фрагмент: крупно телефон —
// молодая мама на сцене заканчивает движение и кланяется. Наезд на её лицо
// в телефоне и растворение в крупный план настоящей мамы (то же место и
// размер лица, та же родинка под глазом): «Мурда бир нече жыл бийге
// катышчумун.» Сын: «Азыр көрсөтүп берчи!» Мама улыбается, кивает и кладёт
// ладони на стол — сейчас встанет (начало сцены 5).
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type PoseIn, type WorldArm } from "../rig/Actor";
import type { DanceSeg } from "../rig/dance";
import { LOOKS } from "../rig/looks";
import { clamp, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { EXPR, mixExpr, type Expression } from "../rig/pose";
import { HoldingHands, OLD_STAGE_MOM, OldVideo, Phone, VideoPlayer } from "../screens";
import { ChairBack, LaptopBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { box, type Cam, camMove, Shot } from "../shots";
import { chairSeat, H, lineFrames, sceneLen } from "./common";
import { InsertBack, phoneGeom, phoneH, VIDEO_TOP } from "./EveningParts";
import { HOOK_MOM, HOOK_SON, SON_PHONE_W } from "./Hook";

// ---------- места и предметы ----------
const SEAT = HOOK_MOM;
const PHONE_W = SON_PHONE_W; // как в сцене 1
const PH_H = phoneH(PHONE_W);
const SKIN = { son: "#E8B48D", sonShade: "#D29A73", sonSleeve: "#78BFA2" };
// повтор фрагмента: конец движения рукой и поклон (время записи)
export const REM_SEGS: readonly DanceSeg[] = [
  { move: "B", from: 0, dur: 48 },
  { move: "bow", from: 50, dur: 26 },
];
const R = {
  handsUp: [2, 10] as const, // руки к краю крышки
  lid: [10, 28] as const, // крышка опускается
  tap: 34, // сын повторно включает запись
  ins: 44, // вставка: телефон крупно
  push: [80, 104] as const, // наезд на лицо в записи
  mix: [97, 106] as const, // растворение в лицо мамы
};
const tvAt = (t: number) => (t < R.tap ? 200 : t - R.tap + 12);
const oldExpr = (t: number) => (t < 48 ? ("softSmile" as const) : ("smile" as const));

// крышка ноутбука: верхний край (со стороны зрителя) по степени открытия
const lidOpen = (t: number) => keys(t, [[R.lid[0], 1], [R.lid[1], 0.12]]);
const lidTop = (o: number) => LIV.laptop.y - 6 - 118 * Math.max(0.06, Math.sin((o * Math.PI) / 2));

// руки мамы: клавиатура (за крышкой) → край крышки → на закрытом ноутбуке →
// ладони на столе (как в начале сцены 5)
const KB_L: Vec = { x: LIV.laptop.x - 58, y: LIV.laptop.y - 12 };
const KB_R: Vec = { x: LIV.laptop.x + 34, y: LIV.laptop.y - 12 };
const LAP_L: Vec = { x: 622, y: 1292 }; // на коленях (за столом)
const LAP_R: Vec = { x: 682, y: 1292 };
const PALM_L: Vec = { x: SEAT.x - 70, y: LIV.table.top - 4 };
const PALM_R: Vec = { x: SEAT.x + 70, y: LIV.table.top - 4 };

// голова (центр овала) молодой мамы на записи в стойке и настоящей мамы за
// столом — для совпадения по лицу
const YB = LOOKS.youngMom.build;
const OLD_HEAD: Vec = { x: OLD_STAGE_MOM.x, y: OLD_STAGE_MOM.y + (YB.headY + 6) * (OLD_STAGE_MOM.h / 1000) };
const MB = LOOKS.momHome.build;
const MK = SEAT.h / 1000;
const momHead = (face: number): Vec => ({
  x: SEAT.x + face * 0.8 * 12 * MK,
  y: SEAT.y + (MB.headY + (-chairSeat(H.mom) / MK + 6 - MB.hipJointY)) * MK,
});
const MOM_RX = MB.headRx * MK;

// вставка: телефон в руках сына (взгляд мамы), камера записи внутри
const INS = { x: 540, y: 905, w: 500 };
const VCAM: Cam = { x: 905, y: 1080, zoom: 0.6 };
const G = phoneGeom(INS.x, INS.y, INS.w);
const H0 = G.at(270 + (OLD_HEAD.x - VCAM.x) * VCAM.zoom, VIDEO_TOP + 480 + (OLD_HEAD.y - VCAM.y) * VCAM.zoom);
const R0 = YB.headRx * (OLD_STAGE_MOM.h / 1000) * VCAM.zoom * G.k; // радиус лица на экране
const T_FACE: Vec = { x: 540, y: 790 }; // где лицо в кадре на склейке
const R1 = 180; // радиус лица на склейке
const S1 = R1 / R0;
const MIX_FACE = 0.24; // поворот головы мамы на склейке

// масштаб вставки и положение лица: медленно ближе, затем наезд
const insScale = (t: number) => {
  const pre = 1 + 0.05 * clamp((t - R.ins) / (R.push[0] - R.ins));
  const u = easeInOut((t - R.push[0]) / (R.push[1] - R.push[0]));
  const s = Math.exp(lerp(0, Math.log(S1 / 1.05), u));
  return { s: pre * s, w: (1 - 1 / s) / (1 - 1.05 / S1) };
};

export const RememberScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("remember");
  const m01 = lineFrames(cues, "m01");
  const s02 = lineFrames(cues, "s02");
  const sonShot = s02.from - 8;
  const momShot = Math.min(len - 34, s02.to + 4);
  const nod = momShot + 4;
  // руки с колен над столом (выше столешницы) → ладони на стол
  const up = [momShot + 8, momShot + 18] as const;
  const palms = [momShot + 18, momShot + 26] as const;

  // ---------- сын: телефон у груди (экраном к маме и к зрителю) ----------
  const phoneAt = (t: number) => {
    const raise = keys(t, [[s02.from - 2, 0], [s02.from + 8, -14], [s02.to, -10], [s02.to + 12, 0]]);
    return { x: HOOK_SON.x - 0.07 * HOOK_SON.h + Math.sin(t / 40) * 1.2, y: HOOK_SON.y - 0.56 * HOOK_SON.h + Math.sin(t / 33) + raise };
  };
  const corner = (t: number, side: -1 | 1): Vec => {
    const p = phoneAt(t);
    return { x: p.x + side * PHONE_W * 0.46, y: p.y + PH_H * 0.47 };
  };
  const tapPt = (t: number): Vec => {
    const p = phoneAt(t);
    return { x: p.x + PHONE_W * 0.1, y: p.y + PH_H * 0.06 };
  };
  const sonPose = (t: number): PoseIn => {
    const tapping = t > R.tap - 10 && t < R.tap + 12;
    const armR: WorldArm = tapping
      ? { target: keysV(t, [[R.tap - 8, corner(t, 1)], [R.tap - 1, tapPt(t)], [R.tap + 2, tapPt(t)], [R.tap + 10, corner(t, 1)]]), shape: t > R.tap - 5 && t < R.tap + 6 ? "point" : "fist", elbow: "down", behind: false }
      : { target: corner(t, 1), shape: "fist", elbow: "down", behind: false };
    const speak = t >= s02.from - 4 && t <= s02.to + 6;
    const expr: Expression = t < R.tap + 6 ? EXPR.curious : t < s02.from - 4 ? EXPR.smile : t < s02.to ? mixExpr(EXPR.amazed, EXPR.smile, clamp((t - s02.from) / (s02.to - s02.from))) : EXPR.proud;
    return {
      expr,
      lookY: keys(t, [[R.tap - 12, 0.05], [R.tap - 6, 0.72], [R.tap + 4, 0.72], [R.tap + 10, 0.05]]),
      nod: keys(t, [[R.tap - 12, 0], [R.tap - 6, 6], [R.tap + 4, 6], [R.tap + 10, 0]]) + (speak ? 2.5 * Math.sin((t - s02.from) / 3.2) : 0),
      headTilt: keys(t, [[0, 3], [R.tap - 6, -3], [R.tap + 10, 3], [s02.from, 3], [s02.from + 8, -4], [s02.to + 6, 2]]),
      lean: keys(t, [[s02.from - 4, 0], [s02.from + 6, 5], [s02.to + 4, 3], [s02.to + 16, 0]]),
      shoulders: keys(t, [[s02.from - 4, 0.1], [s02.from + 4, 0.35], [s02.to + 4, 0.2], [s02.to + 14, 0.1]]),
      armL: { target: corner(t, -1), shape: "fist", elbow: "down", behind: false },
      armR,
    };
  };
  const sonFace = (t: number) => keys(t, [[R.tap - 12, -0.62], [R.tap - 6, -0.3], [R.tap + 4, -0.3], [R.tap + 12, -0.6]]);

  // ---------- мама ----------
  const momFace = (t: number) => {
    if (t < R.ins) return 0.42;
    if (t < R.mix[1]) return keys(t, [[R.ins + 10, 0.42], [R.push[0], MIX_FACE]]);
    if (t < sonShot) return keys(t, [[m01.from, MIX_FACE], [m01.from + 30, 0.34]]);
    return 0.42;
  };
  const momExpr = (t: number): Expression => {
    if (t < R.lid[1]) return EXPR.softSmile;
    if (t < R.ins) return mixExpr(EXPR.softSmile, EXPR.smile, clamp((t - R.lid[1]) / 8));
    if (t < m01.from) return EXPR.softSmile;
    if (t < m01.to) return mixExpr(EXPR.dreamy, EXPR.softSmile, clamp((t - m01.from) / (m01.to - m01.from)));
    if (t < momShot) return EXPR.softSmile;
    return mixExpr(EXPR.softSmile, EXPR.smile, clamp((t - momShot) / 8));
  };
  const momArm = (t: number, side: -1 | 1): WorldArm => {
    const kb = side < 0 ? KB_L : KB_R;
    const lap = side < 0 ? LAP_L : LAP_R;
    const palm = side < 0 ? PALM_L : PALM_R;
    const above = { x: palm.x + side * 6, y: LIV.table.top - 50 };
    const lidX = side < 0 ? 628 : 752;
    const edge = (o: number): Vec => ({ x: lidX, y: lidTop(o) - 6 });
    if (t < R.handsUp[1]) return { target: keysV(t, [[R.handsUp[0], kb], [R.handsUp[1], edge(1)]]), shape: "relax", elbow: "down" };
    if (t < R.lid[1]) return { target: edge(lidOpen(t)), shape: "open", elbow: "down" };
    if (t < up[0]) return { target: keysV(t, [[R.lid[1] + 2, edge(0.12)], [R.lid[1] + 14, lap]]), shape: "relax", elbow: "down" };
    if (t < palms[0]) return { target: keysV(t, [[up[0], lap], [up[1], above]]), shape: "relax", elbow: "down" };
    return { target: keysV(t, [[palms[0], above], [palms[1], palm]]), shape: t < palms[0] + 3 ? "relax" : "open", elbow: "down" };
  };
  const momPose = (t: number): PoseIn => ({
    expr: momExpr(t),
    sit: 1,
    seat: chairSeat(H.mom),
    // закрывая крышку, смотрит на ноутбук; потом — на телефон сына
    lookY: keys(t, [[R.handsUp[0], 0], [R.handsUp[1], 0.45], [R.lid[1] - 4, 0.45], [R.lid[1] + 4, 0.05]]),
    lookX: t < R.ins ? 0.3 : t < sonShot ? keys(t, [[R.push[0], 0.15], [m01.from, 0.15], [m01.from + 30, 0.3]]) : 0.3,
    headTilt: t < R.ins ? keys(t, [[0, 4], [R.handsUp[1], 1], [R.lid[1] + 4, 4]]) : t < sonShot ? keys(t, [[m01.from, 3], [m01.from + 40, 6], [m01.to, 5]]) + Math.sin((t - m01.from) / 19) * 1.2 : 4,
    nod: t >= momShot ? keys(t, [[nod, 0], [nod + 6, 9], [nod + 14, 0]]) : 0,
    shoulders: t >= momShot ? keys(t, [[palms[0], 0], [palms[1] + 4, 0.18]]) : 0,
    armL: momArm(t, -1),
    armR: momArm(t, 1),
  });

  // ---------- мир ----------
  const p = phoneAt(f);
  const tv = tvAt(f);
  const progress = f < R.tap ? 0.97 : 0.72 + (tv - 12) / 900;
  const video = (id: string) => (
    <VideoPlayer progress={progress}>
      <OldVideo f={f} t={tv} segs={REM_SEGS} cam={VCAM} w={540} h={960} id={id} soft={false} exprAt={oldExpr} />
    </VideoPlayer>
  );
  // руки за крышкой и столом (как в сцене 1), пока не поднялись над столешницей
  const momBehind = f < up[1];
  const mom = (layer?: "body" | "arms") => <Actor uid="r4-mom" look="momHome" f={f} place={() => SEAT} face={momFace} pose={momPose} role="mother" seed={1} layer={layer} />;
  const son = (layer: "body" | "armsNoHands" | "hands") => <Actor uid="r4-son" look="son" f={f} place={() => HOOK_SON} face={sonFace} pose={sonPose} role="son" seed={4} layer={layer} />;
  const world = (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      <Rug />
      <ChairBack x={SEAT.x} light="evening" />
      {momBehind ? mom() : mom("body")}
      <WorkTable light="evening" />
      <LaptopBack open={lidOpen(f)} glow={1 - clamp((f - R.lid[0]) / 14)} />
      {momBehind ? null : mom("arms")}
      {son("body")}
      {son("armsNoHands")}
      <Phone x={p.x} y={p.y} w={PHONE_W} rot={keys(f, [[0, -4], [R.tap - 8, 0]])} shadow={false}>
        {video("r4-phone")}
      </Phone>
      {son("hands")}
    </>
  );

  // ---------- вставка: телефон крупно, наезд на лицо молодой мамы ----------
  const sc = insScale(f);
  const jit = 1 - clamp((f - R.push[0]) / 10);
  const hc = { x: lerp(H0.x, T_FACE.x, clamp(sc.w)), y: lerp(H0.y, T_FACE.y, clamp(sc.w)) };
  const insX = INS.x + Math.sin(f / 19) * 1.5 * jit;
  const insY = INS.y + Math.sin(f / 14) * 2 * jit;
  const insert = (
    <div style={box({ inset: 0, overflow: "hidden" })}>
      <InsertBack
        wall="#E9D3B8"
        low="#DCC1A0"
        blobs={[
          { x: 540, y: 1250, r: 560, c: SKIN.sonSleeve },
          { x: 980, y: 1500, r: 300, c: "#46598A", o: 0.8 },
          { x: 120, y: 260, r: 220, c: "#F4CF8F", o: 0.55 },
          { x: 900, y: 200, r: 130, c: "#F6D48A", o: 0.4 },
        ]}
      />
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${hc.x}px, ${hc.y}px) scale(${sc.s}) translate(${-H0.x}px, ${-H0.y}px)` })}>
        <HoldingHands x={insX} y={insY} w={INS.w} skin={SKIN.son} shade={SKIN.sonShade} sleeve={SKIN.sonSleeve} sleeveShort />
        <Phone x={insX} y={insY} w={INS.w}>
          {video("r4-insert")}
        </Phone>
      </div>
    </div>
  );

  // ---------- камера ----------
  const faceCam = (t: number): Cam => {
    const z = t <= R.push[1] ? (R0 * insScale(t).s) / MOM_RX : (R1 / MOM_RX) * (1 + 0.05 * easeInOut((t - R.push[1]) / (sonShot - R.push[1])));
    const h = momHead(momFace(t - 4));
    return { x: h.x - (T_FACE.x - 540) / z, y: h.y - (T_FACE.y - 960) / z, zoom: z };
  };
  const cam = (t: number): Cam => {
    if (t < R.ins) return camMove(t, 0, R.ins, { x: 935, y: 1180, zoom: 1.12 }, { x: 928, y: 1176, zoom: 1.18 });
    if (t < sonShot) return faceCam(t);
    if (t < momShot) return camMove(t, sonShot, momShot, { x: 1196, y: 1246, zoom: 2.08 }, { x: 1198, y: 1240, zoom: 2.16 });
    return camMove(t, momShot, len, { x: 690, y: 1080, zoom: 2.2 }, { x: 690, y: 1076, zoom: 2.26 });
  };
  const mixA = easeInOut((f - R.mix[0]) / (R.mix[1] - R.mix[0]));

  return (
    <div style={box({ inset: 0, backgroundColor: "#2A2F45" })}>
      <Shot f={f} from={0} to={R.ins} cam={cam(f)} bg="#3B3149">
        {world}
      </Shot>
      <Shot f={f} from={R.mix[0]} to={sonShot} cam={cam(f)} bg="#3B3149">
        {world}
      </Shot>
      {f >= R.ins && f < R.mix[1] ? <div style={box({ inset: 0, opacity: 1 - mixA })}>{insert}</div> : null}
      <Shot f={f} from={sonShot} to={momShot} cam={cam(f)} bg="#3B3149">
        {world}
      </Shot>
      <Shot f={f} from={momShot} to={len} cam={cam(f)} bg="#3B3149">
        {world}
      </Shot>
    </div>
  );
};
