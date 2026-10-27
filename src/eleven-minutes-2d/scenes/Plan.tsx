// Сцена 3 (14–26 с): уверенный расчёт. Вечер дома: отец смотрит карту в
// телефоне — крупно «11 мүнөт». «Он бир эле мүнөт экен. Эртең мен алып
// келейин. Жолугушуулардын ортосунда убактым бар.» — в его календаре между
// встречами появляется маленький блок «Мектепке баруу». Мама доброжелательно,
// с короткой паузой: «Макул. Бирок көбүрөөк убакыт бөл.» Переход к
// следующему дню — линией маршрута.
import { Actor } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { EM2_TEXT } from "../script";
import { C } from "../theme";
import { BigFigure, Calendar, Panel } from "../graphics/Hud";
import { MapView } from "../graphics/Map";
import { ChairBack, HOME, HomeBack, LaptopSide, Piala, TableFront, WarmLamp } from "../sets/Home";
import { camMove, PanelShot } from "../shots";
import { onTable, seated, seatOf } from "./common";
import { STAGE, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Телефон крупно (рамка и экран).
export const PhoneBig: React.FC<{ x: number; y: number; w: number; children: React.ReactNode; tilt?: number }> = ({ x, y, w, children, tilt = 0 }) => (
  <div style={box({ left: x, top: y, width: w, height: w * 2.05, borderRadius: w * 0.11, backgroundColor: "#05080D", border: "3px solid #2A3B52", rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" })}>
    <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: C.panel2 })}>{children}</div>
  </div>
);

export const PlanScene: React.FC = () => {
  const { f, t, from, to, word } = useScene("plan");
  const dad = seated("dad", HOME.seat.dad);
  const mom = seated("mom", HOME.seat.mom);
  const f01 = from("f01");
  const m01 = from("m01");
  const phoneEnd = word("f01", 5) - 2; // до «Эртең»
  const calFrom = word("f01", 9) - 4; // «Жолугушуулардын…»
  const calTo = to("f01") + 12;
  const phoneHand = { x: dad.x - 0.06 * dad.h, y: HOME.table.top - 120 };
  const dadPose = (tt: number) => ({
    expr: tt < f01 ? ("thinking" as const) : tt < to("f01") ? ("smile" as const) : tt < m01 + 20 ? ("calm" as const) : ("softSmile" as const),
    sit: 1,
    seat: seatOf(dad),
    armL: {
      target: keysV(tt, [[0, onTable(dad.x - 0.12 * dad.h, -4)], [10, phoneHand], [to("f01") - 10, phoneHand], [to("f01") + 6, onTable(dad.x - 0.1 * dad.h, -6)]], anticipate),
      shape: tt < to("f01") ? ("phone" as const) : ("relax" as const),
      item: tt < to("f01") + 6 ? ("phone" as const) : ("none" as const),
      flat: tt < 10 ? 1 - clamp(tt / 10) : tt > to("f01") - 4 ? clamp((tt - to("f01") + 4) / 10) : 0,
      glow: 1,
      elbow: "down" as const,
      behind: false,
    },
    armR: { target: onTable(dad.x + 0.13 * dad.h, -4), shape: "relax" as const, elbow: "down" as const },
    lookY: keys(tt, [[0, 0.5], [f01, 0.5], [f01 + 12, 0.1], [word("f01", 5), 0.1], [to("f01"), 0.1]]),
    nod: keys(tt, [[word("f01", 8), 0], [word("f01", 8) + 6, 4], [word("f01", 8) + 16, 0]]),
  });
  // отец смотрит в телефон → на маму
  const dadFace = (tt: number) => keys(tt, [[0, -0.1], [f01, -0.1], [f01 + 10, -0.55], [m01 + 30, -0.55], [m01 + 50, -0.35]]);
  const momPose = (tt: number) => ({
    // опыт, а не раздражение: тёплая полуулыбка, короткая пауза перед «Бирок»
    expr: tt < m01 ? ("calm" as const) : tt < m01 + 26 ? ("softSmile" as const) : ("thinking" as const),
    sit: 1,
    seat: seatOf(mom),
    armL: { target: onTable(mom.x - 0.12 * mom.h, -4), shape: "relax" as const, elbow: "down" as const },
    armR: { target: keysV(tt, [[0, onTable(mom.x + 0.12 * mom.h, -4)], [m01 + 20, onTable(mom.x + 0.12 * mom.h, -4)], [m01 + 34, onTable(mom.x + 0.2 * mom.h, -10)]], anticipate), shape: tt > m01 + 24 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    headTilt: keys(tt, [[m01 + 18, 0], [m01 + 30, 5]]),
    nod: keys(tt, [[m01 - 2, 0], [m01 + 6, 4], [m01 + 16, 0]]),
  });
  const momFace = (tt: number) => keys(tt, [[0, 0.4], [m01 - 10, 0.4], [m01, 0.55]]);
  const world = (
    <>
      <HomeBack minutes={20 * 60 + 15 + f / 300} evening={1} f={f} />
      <WarmLamp />
      <ChairBack x={mom.x} evening={1} />
      <ChairBack x={dad.x} evening={1} />
      <Actor uid="p3-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      <Actor uid="p3-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="body" />
      <TableFront evening={1} />
      <Piala x={HOME.piala.x} y={HOME.piala.y} />
      <LaptopSide x={820} y={HOME.laptop.y} open={0} />
      <Actor uid="p3-mom" look="mom" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <Actor uid="p3-dad" look="dad" f={f} place={() => dad} face={dadFace} pose={dadPose} role="father" seed={2} layer="arms" />
    </>
  );
  const P = { f, x: STAGE.x, y: STAGE.y, w: STAGE.w, h: STAGE.h, bg: "#2B2233" };
  const eleven = easeOut((f - f01 - 8) / 10);
  const block = easeOut((f - calFrom - 8) / 10);
  const wipe = easeInOut(clamp((f - 330) / 28));
  return (
    <>
      <PanelShot {...P} from={0} to={f01} cam={camMove(f, 0, f01, { x: 1120, y: 1060, zoom: 1.0 }, { x: 1130, y: 1060, zoom: 1.08 })}>
        {world}
      </PanelShot>
      {/* экран телефона отца: «11 мүнөт» */}
      {f >= f01 && f < phoneEnd ? (
        <div style={box({ left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, borderRadius: 28, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #1B2433, #080C13)" })}>
          <PhoneBig x={230} y={60} w={480}>
            <MapView t={t} f={f} cam={{ x: 450, y: 390, zoom: 0.66 }} w={446} h={950} routes={[]} preview={1} glow="school" />
            <div style={box({ left: 0, right: 0, top: 640 })}>
              <BigFigure text={EM2_TEXT.eleven} a={eleven} size={92} />
            </div>
          </PhoneBig>
        </div>
      ) : null}
      <PanelShot {...P} from={phoneEnd} to={calFrom} cam={camMove(f, phoneEnd, calFrom, { x: 1200, y: 1010, zoom: 1.7 }, { x: 1195, y: 1010, zoom: 1.78 })}>
        {world}
      </PanelShot>
      {/* календарь отца: маленький блок между встречами */}
      {f >= calFrom && f < calTo ? (
        <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h}>
          <Calendar w={STAGE.w} h={STAGE.h} mode="dad" schoolMin={11} appear={block} highlight={block * (1 - clamp((f - calFrom - 30) / 20))} />
        </Panel>
      ) : null}
      <PanelShot {...P} from={calTo} to={360} cam={camMove(f, calTo, 360, { x: 1110, y: 1040, zoom: 1.45 }, { x: 1080, y: 1040, zoom: 1.55 })}>
        {world}
      </PanelShot>
      {/* переход к следующему дню: жёлтая линия маршрута проходит по кадру */}
      {wipe > 0 ? <div style={box({ left: STAGE.x + STAGE.w * wipe - 40, top: STAGE.y, width: 12, height: STAGE.h, backgroundColor: C.yellow, opacity: 1 - clamp((f - 352) / 8), boxShadow: `0 0 30px ${C.yellow}` })} /> : null}
    </>
  );
};
