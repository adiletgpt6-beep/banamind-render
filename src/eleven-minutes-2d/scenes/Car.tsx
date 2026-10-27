// Сцены 8–9. В машине (вид через лобовое стекло, белый автомобиль без
// такси-окраски): дочка сзади, пристёгнута — ремень от плеча через грудь
// к замку, поясная часть по бёдрам; рюкзак и спортивный мешок рядом,
// сложенная поделка в руках. «Ата, бүгүн эмне болгонун айтып берейинби?»
// — «Ооба, кызым. Айта бер.» Пока машина стоит, отец смотрит в календарь
// телефона («Жолугушууга 20 мүнөт»), убирает телефон и трогается; дальше
// следит за дорогой. Дорога домой: маркер медленнее, затор на перекрёстке,
// «Үйгө жол: +8 мүнөт», накопитель 50, до встречи 12.
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, keys, keysV, type Vec } from "../rig/motion";
import { fontFamily } from "../../fonts";
import { EM2_TEXT } from "../script";
import { MEETING_SHOW, STAGE_MOVE } from "../story";
import { C } from "../theme";
import { Accumulator, Journal, MeetingChip, Panel } from "../graphics/Hud";
import { MapView } from "../graphics/Map";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { box as wbox, PanelShot } from "../shots";
import { FPS, STAGE, useScene } from "./kit";
import { GYM_BAG } from "./School";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Ремень безопасности: плечевая часть и поясная (мир панели, px).
const Belt: React.FC<{ anchor: Vec; buckle: Vec; lap: Vec; w?: number }> = ({ anchor, buckle, lap, w = 18 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#3A3F4A" strokeWidth={w * 0.45} strokeLinecap="round" />
    <path d={`M ${lap.x} ${lap.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <rect x={buckle.x - 12} y={buckle.y - 8} width={24} height={16} rx={4} fill="#9AA3B2" />
  </svg>
);

export const CarScene: React.FC = () => {
  const { f, t0, from, to } = useScene("car");
  const d02 = from("d02");
  const f02 = from("f02");
  const n07 = from("n07");
  const showCal = Math.round((MEETING_SHOW - t0) * FPS);
  const drive = to("n07") + 8; // трогаются после взгляда на календарь
  const moving = f >= drive;
  const pass = moving ? (f - drive) * 1.4 : 0;
  const dad: Place = { x: 830, y: 1980, h: 1180 };
  const girl: Place = { x: 470, y: 1360, h: 760 };
  const holder: Vec = { x: 300, y: 1470 };
  const dadPose = (tt: number) => ({
    expr: tt < f02 ? ("calm" as const) : tt < n07 ? ("softSmile" as const) : tt < drive ? ("thinking" as const) : ("calm" as const),
    sit: 1,
    seat: 780,
    // перед отъездом — левая рука к телефону в держателе, затем на руль
    armL: { target: keysV(tt, [[0, { x: 660, y: 1258 }], [n07 - 10, { x: 660, y: 1258 }], [n07 + 8, { x: holder.x + 50, y: holder.y - 20 }], [drive - 14, { x: holder.x + 50, y: holder.y - 20 }], [drive + 2, { x: 660, y: 1258 }]], anticipate), shape: tt > n07 && tt < drive - 6 ? ("point" as const) : ("fist" as const), elbow: "down" as const },
    armR: { target: { x: 982, y: 1258 }, shape: "fist" as const, elbow: "down" as const },
    // слушает дочку: взгляд в зеркало/назад, при движении — на дорогу
    lookX: keys(tt, [[d02 - 6, 0], [d02 + 4, -0.5], [f02 + 40, -0.5], [n07 - 6, 0], [n07 + 6, -0.7], [drive - 10, -0.7], [drive, 0]]),
    lookY: keys(tt, [[n07, 0], [n07 + 8, 0.55], [drive - 10, 0.55], [drive, 0]]),
    nod: keys(tt, [[f02, 0], [f02 + 8, 4], [f02 + 18, 0]]),
  });
  const dadFace = (tt: number) => keys(tt, [[0, 0], [d02, 0], [d02 + 8, -0.25], [f02 + 40, -0.25], [n07, -0.1], [drive, 0]]);
  const craftUp = d02 + 10; // начинает показывать поделку
  const girlPose = (tt: number) => ({
    expr: tt < d02 - 4 ? ("calm" as const) : ("smile" as const),
    sit: 1,
    seat: 330,
    packOff: true,
    lean: keys(tt, [[d02 - 4, 0], [d02 + 6, 6], [f02 + 30, 6], [f02 + 44, 2]]),
    armL: { target: keysV(tt, [[0, { x: 440, y: 1020 }], [craftUp, { x: 440, y: 1020 }], [craftUp + 16, { x: 452, y: 975 }]], anticipate), shape: "fist" as const, elbow: "down" as const },
    armR: { target: keysV(tt, [[0, { x: 515, y: 1024 }], [craftUp, { x: 515, y: 1024 }], [craftUp + 16, { x: 505, y: 978 }]], anticipate), shape: "fist" as const, item: "craft" as const, itemTilt: keys(tt, [[craftUp, 0], [craftUp + 20, -8]]), elbow: "down" as const, behind: false },
    lookY: keys(tt, [[0, 0.3], [d02 - 8, 0.3], [d02, 0], [f02 + 40, 0], [f02 + 52, 0.45]]),
  });
  const girlFace = (tt: number) => keys(tt, [[0, 0.1], [d02 - 6, 0.1], [d02, 0.35]]);
  const cal = clamp((f - showCal) / 8);
  return (
    <>
      <PanelShot f={f} from={0} to={330} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={f >= d02 - 8 && f < f02 - 4 ? { x: 520, y: 930, zoom: 1.75 } : { x: 560, y: 1150 + (moving ? Math.sin(f * 0.3) * 1.5 : 0), zoom: 0.95 }} bg="#3B414D">
        <CabinBack />
        {/* в заднем окне: школьная улица, пока стоим; потом проплывает */}
        <div style={wbox({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = (((i * 260 - pass * 10) % 1300) + 1300) % 1300 - 200;
            return <div key={i} style={wbox({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
          })}
        </div>
        <Actor uid="c8-girl" look="girl" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={3} />
        {/* ремень дочки: от крепления у плеча через грудь к замку */}
        <Belt anchor={{ x: 392, y: 790 }} buckle={{ x: 545, y: 1032 }} lap={{ x: 400, y: 1030 }} />
        {/* рюкзак и спортивный мешок рядом на сиденье */}
        <div style={wbox({ left: 600, top: 930, width: 140, height: 180, borderRadius: "40px 40px 20px 20px", backgroundColor: LOOKS.girl.backpack })} />
        <div style={wbox({ left: 622, top: 1030, width: 96, height: 56, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.15)" })} />
        <div style={wbox({ left: 740, top: 990, width: 104, height: 120, borderRadius: "30px 30px 40px 40px", backgroundColor: GYM_BAG })} />
        <div style={wbox({ left: 360, top: 1052, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
        <FrontSeats />
        <Actor uid="c8-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} />
        {/* ремень отца */}
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d="M 905 1000 L 745 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
        </svg>
        <CabinFront pass={pass} wheel={moving ? Math.sin(f * 0.05) * 3 : 0} />
        {/* телефон в держателе: календарь */}
        <div style={wbox({ left: holder.x - 46, top: holder.y - 80, width: 92, height: 160, borderRadius: 14, backgroundColor: "#1E2235", border: "4px solid #11131A" })}>
          <div style={wbox({ left: 5, top: 6, right: 5, bottom: 6, borderRadius: 9, backgroundColor: f >= n07 && f < drive ? "#1A2738" : "#2C3B5C" })}>
            {f >= n07 && f < drive ? (
              <>
                <div style={wbox({ left: 8, top: 18, right: 8, height: 26, borderRadius: 5, backgroundColor: "rgba(110,139,255,0.5)" })} />
                <div style={wbox({ left: 8, top: 52, right: 8, height: 50, borderRadius: 5, backgroundColor: "rgba(255,211,61,0.55)" })} />
                <div style={wbox({ left: 8, top: 110, right: 8, height: 22, borderRadius: 5, backgroundColor: "rgba(110,139,255,0.5)" })} />
              </>
            ) : null}
          </div>
        </div>
        <div style={wbox({ left: holder.x - 14, top: holder.y + 76, width: 28, height: 60, backgroundColor: "#11131A" })} />
      </PanelShot>
      {/* «Жолугушууга 20 мүнөт» — повествовательная карточка */}
      <div style={box({ left: STAGE.x + 24, top: STAGE.y + 24, opacity: cal })}>
        <MeetingChip t={t0 + f / FPS} x={0} y={0} />
      </div>
    </>
  );
};

export const RoadScene: React.FC = () => {
  const { f, t } = useScene("road");
  const m = STAGE_MOVE.home;
  const u = clamp((t - m[0]) / (m[1] - m[0]));
  // камера следует за маркером (медленно), на перекрёстке — ближе
  const cam = { x: keys(u, [[0, 820], [0.5, 700], [1, 520]]), y: keys(u, [[0, 780], [0.5, 900], [1, 980]]), zoom: keys(u, [[0, 1.4], [0.45, 1.65], [1, 1.45]]) };
  return (
    <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} title={EM2_TEXT.home}>
      <MapView t={t} f={f} cam={cam} w={STAGE.w} h={STAGE.h} routes={["drive", "park", "walk", "kit", "back", "home"]} dim={["drive", "park", "walk", "kit", "back"]} traffic={clamp(u * 3) * (1 - clamp((u - 0.75) * 4))} glow="home" />
      <Accumulator t={t} x={STAGE.w - 272} y={22} />
      <MeetingChip t={t} x={24} y={70} />
      <Journal t={t} x={24} y={STAGE.h - 210} w={560} max={1} />
      <div style={box({ left: 380, top: 420, fontFamily, fontSize: 32, fontWeight: 900, color: C.coral, opacity: clamp(u * 3) * (1 - clamp((u - 0.75) * 4)), textShadow: "0 4px 14px rgba(0,0,0,0.9)" })}>Тыгын</div>
    </Panel>
  );
};
