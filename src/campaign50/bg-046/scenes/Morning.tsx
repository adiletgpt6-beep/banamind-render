// Сцена 2 (≈7–21 с): «Эртең мененки даярдык».
// 1) Прихожая: дочь в школьной форме входит, останавливается у стула и
//    вежливо просит маму: «Апа, сумкамды тагынганга жардам бересизби?»
//    Мама улыбается, убирает телефон, подходит и поднимает рюкзак за ручку
//    (рюкзак качается и с удивлением смотрит на неё).
// 2) Крупно: рюкзак в маминых руках гордо: «Мен даярмын.» — и, глядя на
//    дверь: «Мектепке барчу жол да даярбы?»
// 3) Со спины: рюкзак уже на плечах дочери, она держит маму за руку у
//    закрытой двери; рюкзак оглядывается на зрителя и подмигивает.
// Ребёнок никуда не выходит один, на дорогу никто не выбегает.
import { useCurrentFrame } from "remotion";
import { FACE } from "../Backpack";
import { morningBeats } from "../beats";
import { useScene, useTimeline } from "../context";
import { GirlBack } from "../parts";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { cruise, keys, lerp, pendulum } from "../rig/motion";
import { BG46_TEXT } from "../script";
import { HALL, ChairBack, ChairSeat, HallBack, TearCalendar } from "../sets/Hall";
import { camMove, Depth, Shot } from "../shots";
import { BAG_S, faceKeys, H, LiveBag, SceneLabel } from "./common";

const BAG_TOP = 690 * BAG_S; // от низа рюкзака до верха ручки

export const MorningScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const { c01, b02, walkIn, momGo, momAt, grab, lift, cutB, ready, cutC } = morningBeats(useTimeline());
  const X = HALL.chair.x;
  const seat = HALL.chair.seat;
  const fy = HALL.floorY;

  // ---------- 1. общий план ----------
  const girl = (t: number): Place => ({ x: lerp(1580, 1275, cruise((t - walkIn[0]) / (walkIn[1] - walkIn[0]))), y: fy + 6, h: H.girl });
  const mom = (t: number): Place => ({ x: lerp(760, 860, cruise((t - momGo) / (momAt - momGo))), y: fy + 12, h: H.mom });
  // рюкзак: на стуле → в руке мамы
  const bagX = (t: number) => (t < grab ? X : lerp(X, mom(t).x + 120, cruise((t - grab) / (lift - grab))));
  const bagY = (t: number) => (t < grab ? seat - 12 : lerp(seat - 12, seat - 150, cruise((t - grab) / (lift - grab))));
  const handle = (t: number) => ({ x: bagX(t), y: bagY(t) - BAG_TOP + 14 });
  const girlPose = (t: number): PoseIn => {
    const g = girl(t);
    const ask = t >= c01.from - 4 && t <= c01.to + 4;
    return {
      packOff: true,
      expr: ask ? "softSmile" : t > lift ? "smile" : "calm",
      armR: ask ? { target: { x: g.x - 0.2 * g.h, y: g.y - 0.48 * g.h }, shape: "open", elbow: "down" } : { target: null, shape: "relax" },
      lookY: keys(t, [[c01.from, -0.35], [c01.to, -0.35], [c01.to + 20, -0.1]]),
      headTilt: keys(t, [[c01.from, 0], [c01.from + 12, -6], [c01.to, -6], [c01.to + 12, 0]]),
      nod: keys(t, [[c01.to - 8, 0], [c01.to - 2, 4], [c01.to + 6, 0]]),
    };
  };
  const girlFace = (t: number) => keys(t, [[walkIn[1] - 6, -0.6], [c01.to + 30, -0.6], [lift, -0.3]]);
  const momPose = (t: number): PoseIn => {
    const p = mom(t);
    const phone = t < momGo + 4;
    const reach = keys(t, [[momAt - 10, 0], [grab, 1]]);
    return {
      expr: t < c01.from + 6 ? "calm" : "smile",
      armL: phone ? { target: { x: p.x + 0.04 * p.h, y: p.y - 0.5 * p.h }, shape: "phone", item: "phone", elbow: "hang", glow: 0.6 } : { target: null, shape: "relax" },
      armR: reach > 0 ? { target: { x: lerp(p.x + 0.15 * p.h, handle(t).x, reach), y: lerp(p.y - 0.45 * p.h, handle(t).y, reach) }, shape: "fist", elbow: "down" } : { target: null, shape: "relax" },
      crouch: keys(t, [[momAt - 4, 0], [grab, 0.07], [lift, 0]]),
      lean: keys(t, [[momAt - 6, 0], [grab, 9], [lift, 0]]),
      lookY: keys(t, [[c01.from, 0.25], [momGo, 0.25], [grab - 6, 0.45], [lift, 0.2]]),
      nod: keys(t, [[c01.to, 0], [c01.to + 6, 6], [c01.to + 14, 0]]),
    };
  };
  const momFace = (t: number) => keys(t, [[0, 0.1], [c01.from + 4, 0.1], [c01.from + 14, 0.65], [frames, 0.65]]);
  const bagFace = (t: number) =>
    faceKeys(t, [
      [0, { ...FACE.neutral, lookX: 0.7 }],
      [walkIn[1], { ...FACE.happy, lookX: 0.8 }],
      [c01.from, { ...FACE.curious, lookX: 0.9, lookY: -0.2 }],
      [momGo, { ...FACE.wonder, lookX: -0.7, lookY: -0.4 }],
      [lift, { ...FACE.happy, lookX: -0.4, lookY: -0.6 }],
    ]);
  const bagRot = (t: number) => (t < grab ? 0 : pendulum((u) => bagX(u), t, 0.35));

  // ---------- 2. крупно в руках мамы ----------
  const bf = f - cutB;
  const holdX = 540 + Math.sin(bf / 24) * 8;
  const holdY = 1560 + Math.sin(bf / 31) * 5;
  const HS = 1.05; // масштаб рюкзака на крупном плане
  // мама держит рюкзак с боков, лицо рюкзака открыто
  const strapTop = (side: -1 | 1) => ({ x: holdX + side * 222 * HS, y: holdY - 250 * HS });
  const momB = (): Place => ({ x: 540, y: 2820, h: 2600 });
  const momPoseB = (t: number): PoseIn => ({
    expr: t < b02.from ? "smile" : "softSmile",
    armL: { target: strapTop(-1), shape: "fist", elbow: "hang", behind: false },
    armR: { target: strapTop(1), shape: "fist", elbow: "hang", behind: false },
    lookY: keys(t, [[cutB, 0.75], [ready, 0.75], [ready + 10, 0.55]]),
    nod: 7,
    headTilt: keys(t, [[cutB, 0], [b02.from + 10, 5], [b02.to, -3]]),
  });
  const bFace = (t: number) =>
    faceKeys(t, [
      [cutB, { ...FACE.happy, lookX: -0.1, lookY: -0.9 }],
      [b02.from, FACE.proud],
      [ready, { ...FACE.curious, lookX: -0.95, lookY: 0 }],
      [b02.to - 6, { ...FACE.curious, lookX: 0, lookY: 0 }],
    ]);

  // ---------- 3. со спины у двери ----------
  const cf = f - cutC;
  const backX = 640;
  const holdPt = { x: backX - 150, y: 1170 };
  const momC = (): Place => ({ x: 330, y: fy + 12, h: H.mom });
  const momPoseC = (t: number): PoseIn => ({
    expr: "smile",
    armR: { target: holdPt, shape: "fist", elbow: "down" },
    armL: { target: null, shape: "relax" },
    lookY: 0.55,
    headTilt: keys(t, [[cutC, 0], [cutC + 20, 4]]),
  });
  const cFace = (t: number) =>
    faceKeys(t, [
      [cutC, { ...FACE.neutral, lookX: -0.6, lookY: -0.4 }],
      [cutC + 18, { ...FACE.happy, lookX: 0.1 }],
      [cutC + 34, { ...FACE.happy, lidR: 1, squint: 0.7 }],
      [cutC + 46, FACE.happy],
    ], 6);
  const packBottom = fy + 10 - 0.5 * H.girl + 30;

  return (
    <>
      <Shot f={f} from={0} to={cutB} cam={camMove(f, 0, cutB, { x: 1040, y: 1120, zoom: 1.12 }, { x: 1010, y: 1110, zoom: 1.2 })}>
        <HallBack minutes={BG46_TEXT.morning.clock} calendar={<TearCalendar x={HALL.calendar.x} y={HALL.calendar.y} day={BG46_TEXT.repeat.days[0]} date={13} />} />
        <ChairBack x={X} seat={seat} />
        <ChairSeat x={X} seat={seat} floor={fy} />
        <Actor uid="m-mom" look="mom" f={f} place={mom} face={momFace} pose={momPose} role="mother" seed={6} walkFrom={momGo - 2} layer="body" />
        <LiveBag uid="m-bag" f={f} x={bagX} y={bagY} s={BAG_S} face={bagFace} rot={bagRot} seed={7} shadow={f < grab} />
        <Actor uid="m-mom-arms" look="mom" f={f} place={mom} face={momFace} pose={momPose} role="mother" seed={6} walkFrom={momGo - 2} layer="arms" />
        <Actor uid="m-girl" look="girl" f={f} place={girl} face={girlFace} pose={girlPose} role="child" seed={3} walkFrom={0} />
      </Shot>
      <Shot f={f} from={cutB} to={cutC} cam={{ x: 540, y: 960, zoom: 1 }} bg="#EAF2FA">
        <Depth depth={0.3}>
          <div style={{ position: "absolute", left: -200, top: 0, width: 1500, height: 1920, transform: "scale(1.6)", transformOrigin: "40% 30%", filter: "blur(10px)", opacity: 0.85 }}>
            <HallBack minutes={BG46_TEXT.morning.clock + 1} />
          </div>
        </Depth>
        {/* мама держит рюкзак за лямки и смотрит на него */}
        <Actor uid="b-mom" look="mom" f={bf} place={momB} face={() => 0.05} pose={(t) => momPoseB(t + cutB)} seed={6} layer="body" />
        <LiveBag uid="b-bag" f={bf} offset={cutB} x={() => holdX} y={() => holdY} s={HS} face={(t) => bFace(t + cutB)} squash={(t) => keys(t, [[b02.from - cutB - 4, 0], [b02.from - cutB + 2, -0.15], [b02.from - cutB + 10, 0.08], [b02.from - cutB + 18, 0]])} seed={7} shadow={false} />
        <Actor uid="b-mom-arms" look="mom" f={bf} place={momB} face={() => 0.05} pose={(t) => momPoseB(t + cutB)} seed={6} layer="arms" />
      </Shot>
      <Shot f={f} from={cutC} to={frames} cam={camMove(f, cutC, frames, { x: 500, y: 1050, zoom: 1.42 }, { x: 510, y: 1030, zoom: 1.5 })}>
        <HallBack minutes={BG46_TEXT.morning.clock + 2} />
        {/* мама держит дочь за руку */}
        <Actor uid="c-mom" look="mom" f={cf} place={momC} face={() => 0.55} pose={(t) => momPoseC(t + cutC)} seed={6} />
        <GirlBack x={backX} y={fy + 10} h={H.girl} f={cf} hold={holdPt} packTop={(packBottom - 578 * 0.36 - (fy + 10)) / (H.girl / 1000)}>
          <LiveBag uid="c-bag" f={cf} offset={cutC} x={() => backX} y={() => packBottom} s={0.36} face={(t) => cFace(t + cutC)} straps="none" seed={9} shadow={false} speaks={false} />
        </GirlBack>
      </Shot>
      <SceneLabel f={f} text={BG46_TEXT.morning.label} at={6} out={cutB - 4} />
    </>
  );
};
