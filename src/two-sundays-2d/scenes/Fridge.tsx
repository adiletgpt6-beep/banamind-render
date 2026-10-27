// Сцена 14. Кто выбирает игру?
// A. Дверца холодильника: мама подносит лист, прижимает верх первым
//    магнитом, затем вторым, убирает руки — лист держится на магнитах.
// B. Крупно: папа карандашом дописывает «Оюн» рядом с рисунком среды —
//    штрихи появляются за кончиком; «Биздин жекшемби» не закрыто.
// C. F02: папа поворачивается к дочке и спрашивает.
// D. Дочка поднимает руку, как в классе; родители замечают и улыбаются.
// E. Последний человеческий кадр — та же композиция листа, что в начале:
//    два воскресенья на месте, на среде — общий план.
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { CalendarArt, CAL_POINTS, CAL_W, calPencilTip } from "../props/Calendar";
import { CloseHand } from "../props/CloseHand";
import { anticipate, clamp, easeInOut, keys, keysV, lerp } from "../rig/motion";
import { box, camMove, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Su2Timeline } from "../timing";
import { C, TINT } from "../theme";
import { Fridge, KITCHEN, KitchenBack } from "../sets/Home";
import { H, HANDS } from "./common";
import { PencilTop } from "./CalendarTop";

const K = KITCHEN;
// Лист на дверце холодильника (мир кухни).
const SH = { x: 1290, y: 905, w: 300 };
const sk = SH.w / CAL_W;
const onFridge = (pt: { x: number; y: number }) => ({ x: SH.x + pt.x * sk, y: SH.y + pt.y * sk });
const MAG = [onFridge({ x: 120, y: 40 }), onFridge({ x: 880, y: 40 })];

export const fridgePlan = (tl: Su2Timeline) => {
  const T = sceneTools(tl, "fridge");
  const bring: [number, number] = [4, 24];
  const mag1 = 32;
  const mag2 = 48;
  const release = 58;
  const write = 70;
  const writeDone = write + 36;
  const f02 = T.from("F02");
  const raise = T.to("F02") + 6;
  const final = Math.max(raise + 46, T.len - 54);
  return { bring, mag1, mag2, release, write, writeDone, f02, raise, final, len: T.len };
};

const Magnet: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <Svg>
    <circle cx={x} cy={y} r={15} fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
    <circle cx={x - 4} cy={y - 4} r={4} fill="rgba(255,255,255,0.6)" />
  </Svg>
);

const SheetOnFridge: React.FC<{ y?: number; play: number; mags: number }> = ({ y = SH.y, play, mags }) => (
  <>
    <Svg>
      <g transform={`translate(${SH.x} ${y})`}>
        <CalendarArt w={SH.w} play={play} />
      </g>
    </Svg>
    {mags >= 1 ? <Magnet x={MAG[0].x} y={MAG[0].y + (y - SH.y)} color={C.orange} /> : null}
    {mags >= 2 ? <Magnet x={MAG[1].x} y={MAG[1].y + (y - SH.y)} color={C.blue} /> : null}
  </>
);

export const FridgeScene: React.FC = () => {
  const { f } = useScene("fridge");
  const p = usePlan(fridgePlan);
  const play = clamp((f - p.write) / (p.writeDone - p.write));
  if (f < p.write) {
    // A. Магниты
    const k = easeInOut(clamp((f - p.bring[0]) / (p.bring[1] - p.bring[0])));
    const y = lerp(SH.y + 260, SH.y, k);
    const mags = f >= p.mag2 ? 2 : f >= p.mag1 ? 1 : 0;
    const handL = keysV(f, [[0, { x: SH.x - 120, y: SH.y + 700 }], [p.bring[1], { x: MAG[0].x, y: MAG[0].y }], [p.mag1, { x: MAG[0].x, y: MAG[0].y }], [p.release, { x: SH.x - 160, y: SH.y + 700 }]], anticipate);
    const handR = keysV(f, [[0, { x: SH.x + SH.w + 120, y: SH.y + 700 }], [p.bring[1], { x: MAG[1].x, y: MAG[1].y + 40 }], [p.mag2 - 8, { x: MAG[1].x, y: MAG[1].y + 40 }], [p.mag2, { x: MAG[1].x, y: MAG[1].y }], [p.release + 4, { x: SH.x + SH.w + 160, y: SH.y + 700 }]], anticipate);
    return (
      <Shot f={f} cam={{ x: SH.x + SH.w / 2, y: SH.y + 200, zoom: 2.4 }} bg="#F4F6F8">
        <KitchenBack warm={1} />
        <Fridge />
        <SheetOnFridge y={y} play={0} mags={mags} />
        <Svg>
          {/* правая рука мамы держит второй магнит, пока не прижмёт его */}
          {f < p.mag2 ? <circle cx={handR.x} cy={handR.y} r={15} fill={C.blue} /> : null}
          {f < p.mag1 ? <circle cx={handL.x} cy={handL.y} r={15} fill={C.orange} /> : null}
          <CloseHand x={handL.x - 10} y={handL.y + 62} angle={176} size={64} {...HANDS.momHome} shape="pinch" />
          <CloseHand x={handR.x + 10} y={handR.y + 62} angle={184} size={64} {...HANDS.momHome} shape="pinch" mirror />
        </Svg>
        <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
      </Shot>
    );
  }
  if (f < p.f02 - 6) {
    // B. «Оюн» карандашом
    const tipSheet = calPencilTip(play);
    const tip = onFridge(tipSheet);
    const away = { x: tip.x + 30, y: tip.y + 50 };
    const inK = easeInOut(clamp((f - p.write + 10) / 10));
    const outK = easeInOut(clamp((f - p.writeDone - 4) / 12));
    const t = { x: lerp(away.x, tip.x, inK - outK), y: lerp(away.y, tip.y, inK - outK) };
    const c = onFridge(CAL_POINTS.drawing);
    return (
      <Shot f={f} cam={{ x: c.x, y: c.y + 30, zoom: 5.0 }} bg="#F4F6F8">
        <KitchenBack warm={1} />
        <Fridge />
        <SheetOnFridge play={play} mags={2} />
        <PencilTop tip={t} ang={52} color={C.kidGreen} scale={0.2} />
        <Svg>
          <CloseHand x={t.x + 26} y={t.y + 40} angle={-140} size={26} {...HANDS.dadNext} shape="pinch" />
        </Svg>
        <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
      </Shot>
    );
  }
  if (f < p.final) {
    // C–D. У холодильника: вопрос папы и поднятая рука
    const dad: Place = { x: 1150, y: K.floorY - 10, h: H.dad };
    const girl: Place = { x: 830, y: K.floorY + 10, h: H.girl };
    const mom: Place = { x: 600, y: K.floorY - 20, h: H.mom };
    const up = easeInOut(clamp((f - p.raise) / 10));
    const smile = f > p.raise + 8;
    const dadPose = (t: number): PoseIn => ({ expr: t >= p.f02 - 6 ? "smile" : "softSmile", lookY: 0.25, armR: { target: { x: 1240, y: K.floorY - 10 - 420 }, shape: "pinch", item: "pencil", itemColor: C.kidGreen, elbow: "down", behind: false }, nod: smile ? keys(t, [[p.raise + 8, 0], [p.raise + 14, 4], [p.raise + 22, 0]]) : 0 });
    const girlPose = (): PoseIn => ({ expr: up > 0.3 ? "smile" : "softSmile", lookY: -0.25, armR: up > 0.01 ? { target: { x: girl.x + 60, y: lerp(girl.y - 0.4 * girl.h, girl.y - 1.15 * girl.h, up) }, shape: up > 0.6 ? "open" : "relax", elbow: "down", behind: false } : undefined });
    const momPose = (): PoseIn => ({ expr: smile ? "smile" : "softSmile", lookY: 0.1, headTilt: smile ? 4 : 0 });
    const cam = f < p.raise - 4 ? { x: 1020, y: 1010, zoom: 1.65 } : camMove(f, p.raise - 4, p.raise + 30, { x: 940, y: 1040, zoom: 1.45 }, { x: 930, y: 1060, zoom: 1.35 });
    return (
      <Shot f={f} cam={cam} bg={C.wallKitchen}>
        <KitchenBack warm={1} />
        <Fridge />
        <SheetOnFridge play={1} mags={2} />
        <Actor uid="f14-mom" look="su2MomHome" f={f} place={() => mom} face={() => 0.55} pose={momPose} seed={5} />
        <Actor uid="f14-dad" look="su2DadNext" f={f} place={() => dad} face={() => -0.6} pose={dadPose} role="father" seed={2} />
        <Actor uid="f14-girl" look="su2GirlNext" f={f} place={() => girl} face={(t) => (t < p.raise + 10 ? 0.4 : 0.2)} pose={girlPose} seed={7} blinkShift={23} />
        <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
      </Shot>
    );
  }
  // E. Та же композиция листа, что в начале фильма
  const z = keys(f, [[p.final, 3.2], [p.len, 3.35]]);
  return (
    <Shot f={f} cam={{ x: SH.x + SH.w / 2, y: SH.y + (SH.w * 1.32) / 2 - 10, zoom: z }} bg="#F4F6F8">
      <KitchenBack warm={1} />
      <Fridge />
      <SheetOnFridge play={1} mags={2} />
      <div style={box({ left: -800, top: -600, width: 3600, height: 3200, backgroundColor: TINT.warm })} />
    </Shot>
  );
};
