// Сцена 3 «Иштер кечке калат» (342 кадра ≈ 11,4 с).
// Офис: крупно клавиатура — руки мамы печатают, задача не закончена.
// Руки замирают, и тот же план растворяется в вечер: тёплый свет, рукав
// домашнего свитера, руки снова печатают (склейка по рукам). Общий план
// гостиной: мама за столом (ноутбук к зрителю крышкой), сын на диване
// строит башню из кубиков, рядом лежит старый телефон мамы. На n04 сын
// поднимает глаза на маму, потом берёт телефон: вставка — галерея, тап по
// видео. Глаза сына округляются, он встаёт, идёт к столу и по пути
// поворачивает телефон экраном к маме — та же композиция, что в сцене 1.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { Actor, type Place, type PoseIn, type WorldArm } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, glide, keys, keysV, lerp, lerpV, type Vec } from "../rig/motion";
import { EXPR, mixExpr, type Expression } from "../rig/pose";
import { Gallery, HoldingHands, KeyboardCloseup, OldVideo, Phone, VideoPlayer } from "../screens";
import { Blocks, ChairBack, LaptopBack, LIV, LivingBack, Rug, Sofa, WorkTable } from "../sets/Living";
import { box, type Cam, camMove, Shot } from "../shots";
import { chairSeat, H, lineFrames, placeAt, sceneLen, SOFA, sofaSeatH, standUp } from "./common";
import { Block, InsertBack, phoneGeom, phoneH, PhoneTilt, PhoneTurn, PointingHand, ScreenGlow } from "./EveningParts";
import { HOOK_MOM, HOOK_SON, OLD_SEGS, SON_PHONE_W } from "./Hook";

// ---------- места и предметы (мир гостиной) ----------
const PHONE_W = SON_PHONE_W; // как в сцене 1
const PH_H = phoneH(PHONE_W);
// сын сидит у подлокотника (место сына на диване — SOFA.son)
const SON_SIT: Place = placeAt(SOFA.son, SOFA.feetY, H.son);
const PH_LIE: Vec = { x: 1400, y: 1189 }; // телефон лежит на подлокотнике
const PH_LAP: Vec = { x: 1442, y: 1240 }; // в руках над коленями (экраном к сыну)
const TOWER: Vec = { x: 1660, y: 1290 }; // кубики на сиденье справа
const B1_TOP: Vec = { x: 1602, y: 1173 };
const B2_TOP: Vec = { x: 1602, y: 1143 };
const B2_SEAT: Vec = { x: 1530, y: 1278 };
const B_HOLD: Vec = { x: 1516, y: 1214 }; // кубик в руке у груди
const KNEE_L: Vec = { x: 1424, y: 1292 };
const KNEE_R: Vec = { x: 1478, y: 1292 };
const B_GRIP: Vec = { x: -9, y: 20 }; // запястье относительно кубика
const SKIN = { son: "#E8B48D", sonShade: "#D29A73", mom: "#E6B590" };
// склейка офис → дом
const KB = { officeStop: 30, mix: [36, 48] as const, homeType: 52, cut: 95 };

// Мама за ноутбуком (как в сцене 1 до реплики сына): руки за крышкой.
const momPose = (t: number): PoseIn => ({
  expr: "focused",
  sit: 1,
  seat: chairSeat(H.mom),
  lookY: 0.55,
  headTilt: keys(t, [[120, 0], [150, -3], [220, -3], [260, 1]]),
  armL: { target: { x: LIV.laptop.x - 58 + Math.sin(t * 0.9) * 3, y: LIV.laptop.y - 12 }, shape: "relax", elbow: "down" },
  armR: { target: { x: LIV.laptop.x + 34 + Math.sin(t * 0.8 + 2) * 3, y: LIV.laptop.y - 12 }, shape: "relax", elbow: "down" },
});
const momFace = () => 0.12;

export const EveningScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("evening");
  const n04 = lineFrames(cues, "n04");

  // ---------- планы ----------
  const S2 = KB.cut; // общий план
  const S3 = 150; // мама за ноутбуком
  const S4 = Math.max(S3 + 30, n04.from + 8); // сын на диване (n04)
  // хвост сцены считается от конца: после остановки стопам нужно ≈ 24
  // кадра, чтобы встать в спокойную стойку (как в сцене 1)
  const S5 = len - 90; // вставка: галерея
  const S6 = len - 64; // глаза сына
  const S7 = len - 54; // встаёт и идёт к столу
  // ---------- действия сына ----------
  const lookUp = n04.from + 20;
  const lookDown = S5 - 26;
  const reach = [S5 - 24, S5 - 16] as const;
  const lift = [S5 - 13, S5 - 3] as const;
  const join = [S5 - 8, S5 - 2] as const;
  const tapAt = S5 + 10;
  const openAt = tapAt + 3;
  const walk = [S7 + 12, S7 + 30] as const;
  const flip = [S7 + 18, S7 + 28] as const;
  const b1 = { place: [110, 118] as const, back: 130 };
  const b2 = { take: [170, 178] as const, up: 190, place: [S4 + 2, S4 + 10] as const, back: S4 + 22 };

  const sonPlace = (t: number): Place => {
    if (t <= walk[0]) return SON_SIT;
    if (t >= walk[1]) return HOOK_SON;
    const p = glide(t, walk[0], walk[1], [SON_SIT, { x: 1330, y: 1600 }, HOOK_SON], (x) => cruise(x, 0.3));
    return placeAt(p.x, p.y, H.son);
  };
  const sitAt = (t: number) => (t < S7 ? { sit: 1, lean: 0 } : standUp(t, S7, 18));

  // телефон: лежит → поднят экраном к сыну → у груди, поворот экраном к маме
  const phoneAt = (t: number) => {
    if (t < lift[0]) return { p: PH_LIE, b: 78, a: 0 };
    if (t < S7) {
      const u = easeInOut((t - lift[0]) / (lift[1] - lift[0]));
      const p = lerpV(PH_LIE, PH_LAP, u);
      return { p: { x: p.x, y: p.y - 26 * Math.sin(Math.PI * u) + Math.sin(t / 9) * 0.8 * u }, b: lerp(78, 180, u), a: 0 };
    }
    const sp = sonPlace(t);
    const chest = { x: sp.x - 0.07 * sp.h, y: sp.y - 0.56 * sp.h };
    const k = 1 - sitAt(t).sit;
    return { p: lerpV(PH_LAP, chest, k), b: 180, a: keys(t, [[flip[0], 0], [flip[1], 180]]) };
  };
  // хват: сидя — за бока, стоя — за нижние углы (как в сцене 1)
  const gripOf = (t: number, side: -1 | 1): Vec => {
    const ph = phoneAt(t);
    const k = t < S7 ? 0 : 1 - sitAt(t).sit;
    const squeeze = Math.max(0.32, Math.abs(Math.cos((ph.a * Math.PI) / 180)));
    return { x: ph.p.x + side * PHONE_W * lerp(0.5, 0.46, k) * squeeze, y: ph.p.y + PH_H * lerp(0.3, 0.47, k) };
  };
  const lieGrip: Vec = { x: PH_LIE.x - PHONE_W * 0.4, y: PH_LIE.y + 6 };

  const armLAt = (t: number): WorldArm => {
    if (t < reach[0]) return { target: KNEE_L, shape: "relax", elbow: "down" };
    if (t < lift[0]) return { target: keysV(t, [[reach[0], KNEE_L], [reach[1], lieGrip]]), shape: t < reach[1] - 3 ? "relax" : "fist", elbow: "down", behind: false };
    if (t < lift[1]) {
      const u = easeInOut((t - lift[0]) / (lift[1] - lift[0]));
      const ph = phoneAt(t);
      const off = lerpV({ x: lieGrip.x - PH_LIE.x, y: lieGrip.y - PH_LIE.y }, { x: -PHONE_W * 0.5, y: PH_H * 0.3 }, u);
      return { target: { x: ph.p.x + off.x, y: ph.p.y + off.y }, shape: "fist", elbow: "down", behind: false };
    }
    return { target: gripOf(t, -1), shape: "fist", elbow: "down", behind: false };
  };
  const armRAt = (t: number): WorldArm => {
    const hold = (b: Vec) => ({ x: b.x + B_GRIP.x, y: b.y + B_GRIP.y });
    const examine = { x: B_HOLD.x + Math.sin(t / 11) * 3, y: B_HOLD.y + Math.sin(t / 8) * 2 };
    if (t < b1.place[1] + 2) return { target: keysV(t, [[b1.place[0], hold(examine)], [b1.place[1], hold(B1_TOP)]]), shape: "pinch", elbow: "down" };
    if (t < b2.take[0]) return { target: keysV(t, [[b1.place[1] + 2, hold(B1_TOP)], [b1.back, KNEE_R]]), shape: "relax", elbow: "down" };
    if (t < b2.place[1] + 2) {
      return {
        target: keysV(t, [[b2.take[0], KNEE_R], [b2.take[1], hold(B2_SEAT)], [b2.take[1] + 3, hold(B2_SEAT)], [b2.up, hold(B_HOLD)], [b2.place[0], hold(B_HOLD)], [b2.place[1], hold(B2_TOP)]]),
        shape: t < b2.take[1] - 2 ? "relax" : "pinch",
        elbow: "down",
      };
    }
    if (t < join[0]) return { target: keysV(t, [[b2.place[1] + 2, hold(B2_TOP)], [b2.back, KNEE_R]]), shape: "relax", elbow: "down" };
    if (t < join[1]) return { target: keysV(t, [[join[0], KNEE_R], [join[1], gripOf(join[1], 1)]]), shape: t < join[1] - 2 ? "relax" : "fist", elbow: "down", behind: false };
    return { target: gripOf(t, 1), shape: "fist", elbow: "down", behind: false };
  };
  // кубики: в руке (за пальцами) или на башне/сиденье
  const blockAt = (t: number, i: 1 | 2) => {
    const w = armRAt(t).target ?? KNEE_R;
    const inHand = { x: w.x - B_GRIP.x, y: w.y - B_GRIP.y };
    if (i === 1) return t < b1.place[1] + 2 ? { p: inHand, held: true } : { p: B1_TOP, held: false };
    if (t < b2.take[1]) return { p: B2_SEAT, held: false };
    return t < b2.place[1] + 2 ? { p: inHand, held: true } : { p: B2_TOP, held: false };
  };

  const sonExpr = (t: number): Expression => {
    if (t < lookUp) return EXPR.calm;
    if (t < lookDown) return mixExpr(EXPR.calm, EXPR.softSmile, clamp((t - lookUp) / 10) * 0.5);
    if (t < S6) return EXPR.curious;
    return mixExpr(EXPR.curious, EXPR.amazed, easeOut((t - S6 - 1) / 6));
  };
  const sonFace = (t: number) => {
    if (t < lookUp) return keys(t, [[0, 0.32], [b1.back, 0.3], [b2.take[0], 0.36], [b2.place[1], 0.3]]);
    if (t < lookDown) return keys(t, [[lookUp, 0.3], [lookUp + 8, -0.62]]);
    if (t < lift[0]) return keys(t, [[lookDown, -0.62], [lookDown + 6, -0.34]]);
    if (t < S6) return keys(t, [[lift[0], -0.34], [lift[1], -0.04]]);
    if (t < walk[0]) return keys(t, [[S6 + 5, -0.04], [S6 + 11, -0.5]]);
    return keys(t, [[walk[1] - 6, -0.5], [walk[1] + 2, -0.22]]);
  };
  const sonPose = (t: number): PoseIn => {
    const s = sitAt(t);
    const lookY =
      t < lookUp
        ? 0.45
        : t < lookDown
          ? keys(t, [[lookUp, 0.45], [lookUp + 8, -0.05]])
          : t < S6 + 5
            ? keys(t, [[lookDown, -0.05], [lookDown + 6, 0.55], [lift[1], 0.7]])
            : t < walk[1] - 4
              ? keys(t, [[S6 + 5, 0.7], [S6 + 11, 0.1]])
              : 0.75;
    return {
      expr: sonExpr(t),
      sit: s.sit,
      lean: s.lean + (t < S7 ? keys(t, [[lift[0], 0], [lift[1], 4], [S6, 4], [S6 + 6, 0]]) : 0),
      seat: sofaSeatH(),
      lookY,
      lookX: t < lookUp ? 0.25 : 0,
      nod: t < lookUp ? 5 : keys(t, [[lift[0], 0], [lift[1], 6], [S6 + 4, 6], [S6 + 10, 0], [walk[1] - 4, 0], [walk[1] + 2, 6]]),
      headTilt: t < lookUp ? keys(t, [[0, 3], [b2.place[1], 5]]) : keys(t, [[lookUp, 4], [lookUp + 10, -2], [lookDown, -2], [lookDown + 6, 2]]),
      shoulders: keys(t, [[S6, 0], [S6 + 4, 0.35], [S6 + 12, 0.15]]),
      armL: armLAt(t),
      armR: armRAt(t),
    };
  };

  // ---------- мир ----------
  const ph = phoneAt(f);
  const tvE = Math.max(0, f - openAt);
  const phoneVideo = (id: string) => (
    <VideoPlayer progress={0.02 + tvE / 1440}>
      <OldVideo f={f} t={tvE} segs={OLD_SEGS} cam={{ x: 925, y: 1070, zoom: 0.62 }} w={540} h={960} id={id} soft={false} exprAt={(t) => (t < 40 ? "focused" : "smile")} />
    </VideoPlayer>
  );
  const son = (layer: "body" | "armsNoHands" | "hands") => (
    <Actor uid="e3-son" look="son" f={f} place={sonPlace} face={sonFace} pose={sonPose} seed={4} layer={layer} />
  );
  const blocks = ([1, 2] as const).map((i) => ({ i, ...blockAt(f, i) }));
  const blockColor = { 1: "#7C6AA6", 2: "#E8D35A" } as const;
  const glowA = f >= lift[0] && ph.a < 90 ? clamp((f - lift[0]) / 8) * (1 - clamp((ph.a - 40) / 40)) : 0;
  const world = (
    <>
      <LivingBack light="evening" f={f} />
      <Sofa light="evening" />
      <Rug />
      <Blocks x={TOWER.x} y={TOWER.y} />
      {blocks.filter((b) => !b.held).map((b) => <Block key={b.i} x={b.p.x} y={b.p.y} c={blockColor[b.i]} />)}
      <ChairBack x={HOOK_MOM.x} light="evening" />
      <Actor uid="e3-mom" look="momHome" f={f} place={() => HOOK_MOM} face={momFace} pose={momPose} seed={1} />
      <WorkTable light="evening" />
      <LaptopBack open={1} />
      {son("body")}
      {son("armsNoHands")}
      {blocks.filter((b) => b.held).map((b) => <Block key={b.i} x={b.p.x} y={b.p.y} c={blockColor[b.i]} />)}
      {ph.a > 0 ? (
        <PhoneTurn x={ph.p.x} y={ph.p.y} w={PHONE_W} a={ph.a}>
          {phoneVideo("e3-phone")}
        </PhoneTurn>
      ) : (
        <PhoneTilt x={ph.p.x} y={ph.p.y} w={PHONE_W} b={ph.b} />
      )}
      {son("hands")}
      <ScreenGlow x={ph.p.x + 6} y={ph.p.y - 120} r={120} a={glowA} />
    </>
  );

  // ---------- камера ----------
  const cam = (t: number): Cam => {
    if (t < S3) return camMove(t, S2, S3, { x: 1075, y: 1185, zoom: 0.84 }, { x: 1062, y: 1190, zoom: 0.89 });
    if (t < S4) return camMove(t, S3, S4, { x: 700, y: 1090, zoom: 2.0 }, { x: 700, y: 1084, zoom: 2.08 });
    if (t < S5) return camMove(t, S4, S5, { x: 1405, y: 1185, zoom: 1.72 }, { x: 1410, y: 1190, zoom: 1.8 });
    if (t < S7) return camMove(t, S6, S7, { x: 1440, y: 1160, zoom: 2.5 }, { x: 1440, y: 1164, zoom: 2.58 });
    return camMove(t, S7, len - 2, { x: 1345, y: 1235, zoom: 1.34 }, { x: 1120, y: 1210, zoom: 1.72 });
  };

  // ---------- крупно клавиатура: офис → дом ----------
  const kbScale = 1 + 0.06 * clamp(f / KB.cut);
  const keyboard = (warm: number, sleeve: string, typing: boolean) => (
    <div style={box({ inset: 0, transform: `scale(${kbScale})`, transformOrigin: "540px 1000px" })}>
      <KeyboardCloseup f={f} typing={typing} warm={warm} sleeve={sleeve} skin={SKIN.mom} />
    </div>
  );
  const homeMix = easeInOut((f - KB.mix[0]) / (KB.mix[1] - KB.mix[0]));

  // ---------- вставка: галерея в руках сына (его взгляд) ----------
  const INS = { x: 540, y: 930, w: 520 };
  const g = phoneGeom(INS.x, INS.y, INS.w);
  const tap = g.at(272, 448); // миниатюра видео
  const tip = keysV(f, [
    [S5, { x: 900, y: 1820 }],
    [S5 + 8, { x: tap.x + 40, y: tap.y + 70 }],
    [tapAt - 1, tap],
    [tapAt + 2, tap],
    [tapAt + 10, { x: 720, y: 1240 }],
    [S6, { x: 960, y: 1900 }],
  ]);
  const open = easeOut((f - openAt) / 8);
  const insert = (
    <div style={box({ inset: 0 })}>
      <InsertBack
        wall="#3E4E7C"
        low="#34466E"
        blobs={[
          { x: 540, y: 1700, r: 520, c: "#3F5A82" },
          { x: 920, y: 260, r: 160, c: "#E8D35A", o: 0.5 },
          { x: 1010, y: 420, r: 130, c: "#D9534F", o: 0.45 },
          { x: 120, y: 300, r: 200, c: "#E9C46A", o: 0.35 },
        ]}
      />
      <div style={box({ inset: 0, clipPath: `inset(0 ${1080 - INS.x}px 0 0)` })}>
        <HoldingHands x={INS.x} y={INS.y} w={INS.w} skin={SKIN.son} shade={SKIN.sonShade} sleeve="#78BFA2" sleeveShort />
      </div>
      <Phone x={INS.x} y={INS.y} w={INS.w}>
        <Gallery f={f} tapAt={tapAt} />
        {f >= openAt ? (
          <div style={box({ inset: 0, clipPath: `inset(${lerp(368, 0, open)}px ${lerp(188, 0, open)}px ${lerp(642, 0, open)}px ${lerp(192, 0, open)}px round ${lerp(10, 0, open)}px)` })}>
            <div style={box({ inset: 0, transform: `scale(${lerp(0.32, 1, open)})`, transformOrigin: "272px 448px" })}>{phoneVideo("e3-insert")}</div>
          </div>
        ) : null}
      </Phone>
      <PointingHand x={tip.x} y={tip.y} ang={24} s={0.95} skin={SKIN.son} shade={SKIN.sonShade} />
    </div>
  );

  return (
    <div style={box({ inset: 0, backgroundColor: "#2A2F45" })}>
      {f < KB.mix[1] ? keyboard(0, "#2C3D6B", f < KB.officeStop) : null}
      {f >= KB.mix[0] && f < KB.cut ? (
        <div style={box({ inset: 0, opacity: homeMix })}>
          {keyboard(1, "#C47A62", f >= KB.homeType)}
          {/* тёплая настольная лампа и вечерняя виньетка */}
          <div style={box({ inset: 0, background: "radial-gradient(circle at 140px 120px, rgba(255,200,130,0.35), transparent 720px)", mixBlendMode: "screen" })} />
          <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(40,20,10,0.35))" })} />
        </div>
      ) : null}
      {[S2, S3, S4, S6, S7].map((a, i, arr) => (
        <Shot key={a} f={f} from={a} to={i === arr.length - 1 ? len : i === 2 ? S5 : arr[i + 1]} cam={cam(f)} bg="#3B3149">
          {world}
        </Shot>
      ))}
      {f >= S5 && f < S6 ? insert : null}
    </div>
  );
};
