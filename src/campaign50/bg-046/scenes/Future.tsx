// Сцена 5 (≈48–62 с): условный пример — «Шарттуу мисал» виден всё время.
// 1) «Топ түзүлгөндөн кийин»: утро у подъезда, к бордюру подъезжает белая
//    машина с жёлтой полосой и останавливается; мама с дочерью ждут на
//    тротуаре, мама держит дочь за руку.
// 2) В машине: дочь на заднем сиденье пристёгнута ремнём, рюкзак сидит
//    рядом: «Эгер каттам түзүлсө, биринчи толук сыноо сапары акысыз экен.»
//    Сверху — маршрут ҮЙ → МЕКТЕП / МЕКТЕП → ҮЙ = 1 толук сапар и значок
//    «Биринчи толук сыноо — акысыз».
// 3) Дома после школы: мама встречает дочь, рюкзак снова на стуле:
//    «Калганын ата-эне өзү чечет.» — мама с телефоном решает сама.
// «Шарттуу мисал» рисуется поверх всего (BalaGoBG046.tsx), включая переход.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { FACE } from "../Backpack";
import { futureBeats } from "../beats";
import { useScene, useTimeline } from "../context";
import { C } from "../palette";
import { Icon } from "../parts";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { BG46_TEXT } from "../script";
import { Mountains } from "../sets/Apartment";
import { HALL, ChairBack, ChairSeat, HallBack } from "../sets/Hall";
import { Car, PanelHouse, Sidewalk, Sky, Tree } from "../sets/Outdoor";
import { box, camMove, Depth, Shot } from "../shots";
import { BAG_S, faceKeys, H, LiveBag } from "./common";

// Внутри машины: пол и сиденье (px мира).
const CAR = { floor: 1500, seat: 1222, back: 760, win: { x: 120, y: 470, w: 1160, h: 330 } } as const;

const CarInterior: React.FC<{ readonly f: number }> = ({ f }) => {
  const off = (f * 9) % 1400;
  return (
    <>
      {/* за окном едет Бишкек */}
      <div style={box({ left: CAR.win.x, top: CAR.win.y, width: CAR.win.w, height: CAR.win.h, overflow: "hidden", borderRadius: 40, background: "linear-gradient(180deg, #BFDDF3, #EAF3F8)" })}>
        <Mountains x={-200} y={60} w={1700} h={200} />
        <div style={box({ left: -off * 0.6, top: 0, width: 4000, height: 400 })}>
          {[0, 1].map((k) => (
            <div key={k} style={box({ left: k * 1400, top: 0, width: 1400, height: 400 })}>
              <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: "scale(0.32)", transformOrigin: "0 0" })}>
                <PanelHouse x={0} y={1100} w={1400} floors={4} color="#EADFCB" seed={3} />
                <PanelHouse x={1700} y={1150} w={1500} floors={5} color="#F0E6D6" seed={8} />
              </div>
            </div>
          ))}
        </div>
        <div style={box({ left: -off * 1.6, top: 0, width: 6000, height: 400 })}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Tree key={i} x={i * 520 + 120} y={520} s={0.75} kind={i % 2 ? "poplar" : "round"} />
          ))}
        </div>
      </div>
      {/* кузов изнутри: стойки, обшивка двери */}
      <div style={box({ left: -400, top: 0, width: 2200, height: CAR.win.y + 20, background: "linear-gradient(180deg, #E9ECF1, #F6F7F9)" })} />
      <div style={box({ left: -400, top: CAR.win.y + CAR.win.h - 20, width: 2200, height: 900, backgroundColor: "#D9DEE6" })} />
      <div style={box({ left: CAR.win.x + CAR.win.w * 0.55, top: CAR.win.y - 10, width: 46, height: CAR.win.h + 20, backgroundColor: "#E4E8EE" })} />
      <div style={box({ left: CAR.win.x - 10, top: CAR.win.y - 10, width: CAR.win.w + 20, height: CAR.win.h + 20, borderRadius: 46, border: "16px solid #F4F6F9", boxSizing: "border-box" })} />
      {/* заднее сиденье: спинка, подголовники, подушка */}
      <div style={box({ left: 60, top: CAR.back, width: 1280, height: CAR.seat - CAR.back + 40, borderRadius: "70px 70px 30px 30px", background: "linear-gradient(180deg, #4A5774, #3C4762)" })} />
      {[470, 890].map((x) => (
        <div key={x} style={box({ left: x - 90, top: CAR.back - 90, width: 180, height: 120, borderRadius: 40, backgroundColor: "#4A5774" })} />
      ))}
      {[260, 680, 1100].map((x) => (
        <div key={x} style={box({ left: x, top: CAR.back + 40, width: 8, height: CAR.seat - CAR.back - 40, backgroundColor: "rgba(0,0,0,0.12)" })} />
      ))}
      <div style={box({ left: 30, top: CAR.seat - 10, width: 1340, height: 120, borderRadius: 40, background: "linear-gradient(180deg, #56648A, #46526F)" })} />
      <div style={box({ left: 30, top: CAR.seat + 110, width: 1340, height: 400, backgroundColor: "#2F3850" })} />
    </>
  );
};

// Спинки передних сидений на переднем плане (камера между ними смотрит
// назад): закрывают ноги дочери — видно, что она сидит на сиденье.
const FrontSeats: React.FC = () => (
  <>
    <div style={box({ left: 90, top: 1262, width: 560, height: 700, borderRadius: "90px 90px 0 0", background: "linear-gradient(180deg, #3D4966, #2A3247)", boxShadow: "0 -10px 30px rgba(10,15,30,0.25)" })} />
    <div style={box({ left: 150, top: 1330, width: 440, height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.08)" })} />
    <div style={box({ left: 650, top: 1350, width: 80, height: 600, borderRadius: "24px 24px 0 0", backgroundColor: "#262D40" })} />
    <div style={box({ left: 730, top: 1300, width: 560, height: 700, borderRadius: "90px 90px 0 0", background: "linear-gradient(180deg, #3D4966, #2A3247)", boxShadow: "0 -10px 30px rgba(10,15,30,0.25)" })} />
    <div style={box({ left: 790, top: 1368, width: 440, height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.08)" })} />
  </>
);

export const FutureScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const { b03, wFree, wTrial, cut1, cut2 } = futureBeats(useTimeline());
  const T = BG46_TEXT.future;

  // ---------- 1. улица у подъезда ----------
  const ground = 1420;
  const carX = (t: number) => lerp(1700, 700, cruise(clamp(t / 46), 0.1));
  const wheel = (t: number) => -(1700 - carX(t)) * 0.9;
  const momA = (): Place => ({ x: 250, y: ground + 30, h: H.mom * 0.78 });
  const girlA = (): Place => ({ x: 420, y: ground + 34, h: H.girl * 0.78 });
  const momPoseA = (t: number): PoseIn => {
    const g = girlA();
    return {
      expr: "softSmile",
      armR: { target: { x: g.x - 0.12 * g.h, y: g.y - 0.48 * g.h }, shape: "relax", elbow: "down" },
      lookY: 0.2,
      headTilt: keys(t, [[30, 0], [44, 4]]),
    };
  };
  const girlPoseA = (t: number): PoseIn => {
    const g = girlA();
    return {
      expr: t > 40 ? "smile" : "calm",
      armL: { target: { x: g.x - 0.18 * g.h, y: g.y - 0.48 * g.h }, shape: "relax", elbow: "down" },
      strapTug: 0.6,
    };
  };

  // ---------- 2. в машине ----------
  const girlB = (): Place => ({ x: 470, y: CAR.floor, h: H.girl });
  const girlPoseB = (t: number): PoseIn => ({
    sit: 1,
    seat: CAR.floor - CAR.seat + 4,
    packOff: true,
    expr: t > wFree ? "smile" : "softSmile",
    armL: { target: { x: 430, y: 1250 }, shape: "relax", elbow: "down" },
    armR: { target: { x: 520, y: 1252 }, shape: "relax", elbow: "down" },
    lookY: keys(t, [[cut1, 0.2], [wTrial, 0.1]]),
    headTilt: keys(t, [[wFree - 4, 0], [wFree + 8, 6]]),
  });
  const girlFaceB = (t: number) => keys(t, [[cut1, 0.1], [b03.from + 8, 0.55], [wFree, 0.55], [wFree + 14, 0.2]]);
  const bagFaceB = (t: number) =>
    faceKeys(t, [
      [cut1, { ...FACE.happy, lookX: -0.6 }],
      [b03.from, { ...FACE.neutral, lookX: 0 }],
      [wTrial, { ...FACE.curious, lookX: 0.1 }],
      [wFree, FACE.happy],
    ]);
  // ремень безопасности дочери (по сидящей фигуре)
  const belt = (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d="M 404 1012 Q 470 1090 536 1176" stroke="#2D3240" strokeWidth={26} strokeLinecap="round" fill="none" />
      <path d="M 404 1012 Q 470 1090 536 1176" stroke="#4A5160" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
      <path d="M 410 1196 Q 470 1206 548 1192" stroke="#2D3240" strokeWidth={24} strokeLinecap="round" fill="none" />
      <rect x={526} y={1172} width={44} height={34} rx={8} fill="#B8BEC8" stroke="#2D3240" strokeWidth={4} />
      <rect x={393} y={990} width={24} height={30} rx={6} fill="#8C929C" />
    </svg>
  );

  // ---------- 3. дома ----------
  const X = HALL.chair.x;
  const momC = (): Place => ({ x: 600, y: HALL.floorY + 12, h: H.mom });
  const girlC = (): Place => ({ x: 800, y: HALL.floorY + 8, h: H.girl });
  const momPoseC = (t: number): PoseIn => {
    const p = momC();
    const g = girlC();
    return {
      expr: t < cut2 + 30 ? "smile" : "thinking",
      crouch: 0.06,
      armR: { target: { x: g.x + 0.02 * g.h, y: g.y - 0.7 * g.h }, shape: "open", elbow: "down", behind: false },
      armL: { target: { x: p.x - 0.02 * p.h, y: p.y - 0.52 * p.h }, shape: "phone", item: "phone", elbow: "hang", glow: 0.8 },
      lookY: keys(t, [[cut2, -0.1], [cut2 + 24, -0.1], [cut2 + 36, 0.5]]),
      nod: keys(t, [[frames - 30, 0], [frames - 22, 5], [frames - 14, 0]]),
    };
  };
  const momFaceC = (t: number) => keys(t, [[cut2, 0.6], [cut2 + 24, 0.6], [cut2 + 36, 0.15]]);
  const girlPoseC = (): PoseIn => ({ expr: "smile", packOff: true, lookY: -0.3 });
  const bagFaceC = (t: number) =>
    faceKeys(t, [
      [cut2, { ...FACE.happy, lookX: -0.8, lookY: -0.2 }],
      [cut2 + 20, { ...FACE.proud, lookX: 0 }],
      [b03.to + 4, { ...FACE.happy, lidL: 1, squint: 0.7 }],
      [b03.to + 16, FACE.happy],
    ], 6);

  // ---------- надписи ----------
  const after = easeOut((f - 8) / 10) * (1 - easeOut((f - cut1 + 6) / 8));
  const route = easeOut((f - cut1 - 4) / 10) * (1 - easeOut((f - cut2 + 4) / 8));
  const free = easeOut((f - wFree + 2) / 8);
  return (
    <>
      <Shot f={f} from={0} to={cut1} cam={camMove(f, 0, cut1, { x: 560, y: 1000, zoom: 1.02 }, { x: 600, y: 1020, zoom: 1.08 })}>
        <div style={box({ left: 0, top: 0, width: 2400, height: 2600 })}>
          <Sky w={2400} h={1400} />
          <Depth depth={0.2}>
            <Mountains x={-300} y={360} w={2600} h={420} />
          </Depth>
          <PanelHouse x={-160} y={ground - 40} w={1500} floors={5} color="#EADFCF" seed={5} door={420} />
          <Tree x={1180} y={ground - 30} s={1.1} kind="poplar" />
          <Tree x={-40} y={ground - 30} s={1.0} kind="poplar" />
          <div style={box({ left: -300, top: ground - 40, width: 3000, height: 60, backgroundColor: "#B4AB9E" })} />
          <Sidewalk x={-300} y={ground + 10} w={3000} />
          <div style={box({ left: -300, top: ground + 228, width: 3000, height: 800, backgroundColor: "#8C9099" })} />
          <div style={box({ left: -300, top: ground + 420, width: 3000, height: 14, backgroundImage: "repeating-linear-gradient(90deg, #F4F1EA 0 120px, transparent 120px 220px)" })} />
          <Actor uid="fa-mom" look="mom" f={f} place={momA} face={() => 0.45} pose={momPoseA} seed={6} />
          <Actor uid="fa-girl" look="girl" f={f} place={girlA} face={() => 0.5} pose={girlPoseA} seed={3} />
          <Car x={carX(f)} y={ground + 380} s={1.75} color="#FFFFFF" wheel={wheel(f)} dir={-1} driver stripe={C.yellow} />
        </div>
      </Shot>
      <Shot f={f} from={cut1} to={cut2} cam={camMove(f, cut1, cut2, { x: 690, y: 1010, zoom: 1.46 }, { x: 685, y: 1015, zoom: 1.52 })}>
        <CarInterior f={f} />
        <Actor uid="fb-girl" look="girl" f={f} place={girlB} face={girlFaceB} pose={girlPoseB} role="child" seed={3} />
        {belt}
        <LiveBag uid="fb-bag" f={f} x={() => 880} y={() => CAR.seat + 8} s={0.44} face={bagFaceB} seed={15} lean={(t) => Math.sin(t / 9) * 4} shadow={false} />
        <FrontSeats />
      </Shot>
      <Shot f={f} from={cut2} to={frames} cam={camMove(f, cut2, frames, { x: 860, y: 1060, zoom: 1.3 }, { x: 860, y: 1050, zoom: 1.36 })}>
        <HallBack minutes={13 * 60 + 20} light={0.4} />
        <ChairBack x={X} seat={HALL.chair.seat} />
        <ChairSeat x={X} seat={HALL.chair.seat} floor={HALL.floorY} />
        <LiveBag uid="fc-bag" f={f} x={() => X + 40} y={() => HALL.chair.seat - 12} s={BAG_S} face={bagFaceC} seed={17} />
        <Actor uid="fc-girl" look="girl" f={f} place={girlC} face={() => -0.6} pose={girlPoseC} role="child" seed={3} />
        <Actor uid="fc-mom" look="mom" f={f} place={momC} face={momFaceC} pose={momPoseC} role="mother" seed={6} />
      </Shot>
      {after > 0.01 ? (
        <div style={{ position: "absolute", left: 64, top: 300, opacity: after, fontFamily, fontSize: 40, fontWeight: 900, color: C.navy, padding: "12px 26px", borderRadius: 20, backgroundColor: "#FFFFFF", boxShadow: "0 10px 24px rgba(20,40,90,0.16)" }}>
          {T.after}
        </div>
      ) : null}
      {route > 0.01 ? (
        <div style={{ position: "absolute", left: 64, right: 64, top: 300, opacity: route, transform: `translateY(${(1 - route) * -20}px)`, pointerEvents: "none" }}>
          <div style={{ padding: "20px 26px", borderRadius: 28, backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 12px 30px rgba(20,40,90,0.18)", fontFamily, color: C.navy }}>
            {[T.am, T.pm].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 36, fontWeight: 900, marginTop: i ? 8 : 0, opacity: easeOut((f - cut1 - 6 - i * 10) / 8) }}>
                <Icon kind={i ? "school" : "home"} s={0.75} />
                {t}
              </div>
            ))}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 900 }}>
              <span style={{ color: "#5A6B8C" }}>=</span>
              <span style={{ padding: "4px 16px", borderRadius: 12, backgroundColor: "#EEF2F8" }}>{T.full}</span>
            </div>
          </div>
        </div>
      ) : null}
      {/* «Биринчи толук сыноо — акысыз» держится до конца сцены: под картой
          маршрута, а после смены плана поднимается на её место */}
      {free > 0.01 ? (
        <div style={{ position: "absolute", left: 64, right: 64, top: lerp(512, 300, easeInOut((f - cut2) / 14)), display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ padding: "16px 30px", borderRadius: 22, backgroundColor: C.yellow, color: C.navy, fontFamily, fontSize: 42, fontWeight: 900, boxShadow: "0 10px 0 #E0A800", transform: `scale(${0.7 + 0.3 * free}) rotate(-2deg)`, opacity: free }}>
            ★ {T.free}
          </div>
        </div>
      ) : null}
    </>
  );
};
