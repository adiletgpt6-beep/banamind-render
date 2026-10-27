// Сцены 10–11. Передача бабушке: отец заводит дочку домой; бабушка
// встречает; он передаёт записку учительницы и коротко объясняет; рюкзак
// и спортивный мешок остаются с дочкой дома. «+4» (54), до встречи 8.
// Те же одиннадцать минут: возвращение в офис «+7» (61), до встречи 1;
// уже остановившись, отец открывает карту — крупно «Кеңсе → Мектеп,
// 11 мүнөт», рядом «Бардык жол: 61 мүнөт»: все этапы собираются в одну
// понятную цепочку. Пауза — зритель сам видит разницу.
import { Actor, type Place } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { anticipate, clamp, cruise, easeInOut, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { fontFamily } from "../../fonts";
import { EM2_STAGES, EM2_TEXT, EM2_TRIP_TOTAL } from "../script";
import { C } from "../theme";
import { Accumulator, BigFigure, Journal, MeetingChip, Panel } from "../graphics/Hud";
import { MapView } from "../graphics/Map";
import { HomeBack, ShoeBench } from "../sets/Home";
import { camMove, PanelShot } from "../shots";
import { H, placeAt } from "./common";
import { STAGE, useScene } from "./kit";
import { GYM_BAG } from "./School";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
const walk = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

export const GrandmaScene: React.FC = () => {
  const { f, t, word } = useScene("grandma");
  const granny = placeAt(800, 1610, H.grandma);
  const girl = (tt: number) => walk(tt, 4, 60, { x: 230, y: 1600 }, { x: 640, y: 1650 }, H.girl, 0.25);
  const dad = (tt: number) => walk(tt, 14, 70, { x: 160, y: 1580 }, { x: 470, y: 1600 }, H.dad, 0.3);
  const give = Math.max(96, word("n09", 4) + 6);
  const meet: Vec = { x: 640, y: 1600 - 0.5 * H.dad };
  const dadPose = (tt: number) => {
    const p = dad(tt);
    return {
      expr: tt < give ? ("calm" as const) : ("softSmile" as const),
      armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.46 * p.h }, shape: "fist" as const, item: "laptopbag" as const, elbow: "down" as const },
      armR: {
        target: keysV(tt, [[0, { x: p.x + 0.1 * p.h, y: p.y - 0.55 * p.h }], [give - 18, { x: p.x + 0.1 * p.h, y: p.y - 0.55 * p.h }], [give, meet], [give + 16, { x: p.x + 0.18 * p.h, y: p.y - 0.6 * p.h }], [give + 60, { x: p.x + 0.18 * p.h, y: p.y - 0.6 * p.h }], [give + 76, { x: p.x + 0.12 * p.h, y: p.y - 0.44 * p.h }]], anticipate),
        shape: tt < give ? ("pinch" as const) : tt < give + 70 ? ("open" as const) : ("relax" as const),
        item: tt < give ? ("note" as const) : ("none" as const),
        elbow: "down" as const,
        behind: false,
      },
      nod: keys(tt, [[give + 30, 0], [give + 38, 4], [give + 50, 0]]),
    };
  };
  const grannyPose = (tt: number) => ({
    expr: tt < 40 ? ("smile" as const) : tt < give ? ("softSmile" as const) : ("calm" as const),
    armR: { target: { x: granny.x + 0.12 * granny.h, y: granny.y - 0.44 * granny.h }, shape: "relax" as const },
    armL: {
      target: keysV(tt, [[0, { x: granny.x - 0.12 * granny.h, y: granny.y - 0.44 * granny.h }], [40, { x: granny.x - 0.2 * granny.h, y: granny.y - 0.5 * granny.h }], [give - 16, { x: granny.x - 0.2 * granny.h, y: granny.y - 0.5 * granny.h }], [give, meet], [give + 24, { x: granny.x - 0.06 * granny.h, y: granny.y - 0.6 * granny.h }]], anticipate),
      shape: tt >= give ? ("pinch" as const) : ("open" as const),
      item: tt >= give ? ("note" as const) : ("none" as const),
      elbow: "down" as const,
      behind: false,
    },
    lookY: keys(tt, [[give + 24, 0], [give + 32, 0.5]]),
  });
  const girlPose = (tt: number) => {
    const p = girl(tt);
    return {
      expr: "smile" as const,
      armL: { target: { x: p.x - 0.15 * p.h, y: p.y - 0.46 * p.h }, shape: "fist" as const, item: "gymbag" as const, itemColor: GYM_BAG, elbow: "down" as const, behind: false },
    };
  };
  return (
    <>
      <PanelShot f={f} from={0} to={210} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={camMove(f, 0, 210, { x: 480, y: 1190, zoom: 1.0 }, { x: 560, y: 1180, zoom: 1.08 })}>
        <HomeBack minutes={13 * 60 + 50 + f / 120} doorOpen={keys(f, [[0, 1], [170, 1], [200, 0.6]])} f={f} />
        <ShoeBench sonPack={false} girlPack={false} bag={false} />
        <Actor uid="g10-granny" look="grandma" f={f} place={() => granny} face={() => -0.45} pose={grannyPose} seed={6} />
        <Actor uid="g10-dad" look="dad" f={f} place={dad} face={(tt) => keys(tt, [[0, 0.6], [70, 0.4]])} pose={dadPose} role="father" seed={2} />
        <Actor uid="g10-girl" look="girl" f={f} place={girl} face={(tt) => keys(tt, [[0, 0.6], [62, 0.35]])} pose={girlPose} role="daughter" seed={3} />
      </PanelShot>
      <Accumulator t={t} x={STAGE.x + STAGE.w - 292} y={STAGE.y + 20} />
      <div style={box({ left: STAGE.x + 24, top: STAGE.y + 24 })}>
        <MeetingChip t={t} x={0} y={0} />
      </div>
    </>
  );
};

// Цепочка этапов: полоса, доли пропорциональны минутам.
const Chain: React.FC<{ a: number; w: number }> = ({ a, w }) => {
  let acc = 0;
  return (
    <div style={{ position: "relative", width: w, height: 120 }}>
      {EM2_STAGES.map((s, i) => {
        const x = (acc / EM2_TRIP_TOTAL) * w;
        acc += s.min;
        const sw = (s.min / EM2_TRIP_TOTAL) * w;
        const k = easeOut(clamp(a * 10 - i * 0.9));
        return (
          <div key={s.id} style={box({ left: x + 2, top: 0, width: sw - 4, height: 64, borderRadius: 10, backgroundColor: i === 0 ? C.yellow : C.coral, opacity: (i === 0 ? 1 : 0.85) * k, transformOrigin: "0% 50%", scale: `${k} 1` })}>
            <div style={box({ left: 0, right: 0, top: 12, textAlign: "center", fontFamily, fontSize: 30, fontWeight: 900, color: C.bg })}>{s.min}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Same11Scene: React.FC = () => {
  const { f, t, word } = useScene("same11");
  const cmp = word("n10", 3) - 6; // «Картада…»
  const top = easeOut((f - cmp) / 10);
  const chain = clamp((f - cmp - 26) / 50);
  const all = easeOut((f - cmp - 70) / 12);
  return (
    <>
      {f < cmp ? (
        <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} title={EM2_TEXT.office}>
          <MapView t={t} f={f} cam={camMove(f, 0, cmp, { x: 380, y: 640, zoom: 0.95 }, { x: 360, y: 520, zoom: 1.0 })} w={STAGE.w} h={STAGE.h} dim={["drive", "park", "walk", "kit", "back", "home"]} glow="office" />
          <Accumulator t={t} x={STAGE.w - 272} y={22} />
          <MeetingChip t={t} x={24} y={70} />
          <Journal t={t} x={24} y={STAGE.h - 210} w={560} max={1} />
        </Panel>
      ) : (
        <>
          {/* исходный кадр: «Кеңсе → Мектеп, 11 мүнөт» */}
          <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={560} title={EM2_TEXT.route} opacity={top}>
            <MapView t={0} f={f} cam={{ x: 450, y: 390, zoom: 1.02 }} w={STAGE.w} h={560} routes={[]} preview={1} />
            <div style={box({ right: 40, top: 160 })}>
              <BigFigure text={EM2_TEXT.eleven} a={top} size={120} />
            </div>
          </Panel>
          {/* полный путь */}
          <Panel x={STAGE.x} y={STAGE.y + 590} w={STAGE.w} h={STAGE.h - 590} accent={all > 0.5 ? C.coral : undefined}>
            <div style={box({ left: 40, top: 40 })}>
              <Chain a={chain} w={STAGE.w - 80} />
            </div>
            <div style={box({ left: 40, right: 40, top: 160, display: "flex", flexWrap: "wrap", gap: "10px 22px", fontFamily, fontSize: 28, fontWeight: 800, color: C.dim, opacity: chain })}>
              {EM2_STAGES.slice(1).map((s) => (
                <span key={s.id}>{s.label}</span>
              ))}
            </div>
            <div style={box({ left: 0, right: 0, top: 300, textAlign: "center", fontFamily, fontSize: 72, fontWeight: 900, color: C.text, whiteSpace: "nowrap", opacity: all, scale: `${0.9 + 0.1 * all}` })}>
              Бардык жол: <span style={{ color: C.yellow }}>61 мүнөт</span>
            </div>
          </Panel>
        </>
      )}
    </>
  );
};

export const RETURN_LOOKS = LOOKS;
export const RETURN_EASE = easeInOut;
