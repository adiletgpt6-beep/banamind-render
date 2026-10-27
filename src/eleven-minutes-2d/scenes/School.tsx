// Сцены 6–7 у школы. Ожидание: двери закрыты, отец ждёт у ворот, смотрит
// на часы; часы на фасаде идут; дети выходят; учительница передаёт
// записку «Эртең түстүү кагаз ала келсин.» — «Күтүү: +7 мүнөт» (29).
// Забытая форма: дочка с обычным рюкзаком, мешка для формы нет — смотрит
// на папу: «Ата, спорттук кийимим класста калыптыр.» «Кайра киришти.» —
// на карте короткая петля в класс, мешок появляется у неё в руке и дальше
// остаётся с ней. «+8» (37), путь к машине «+5» (42).
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, cruise, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { fontFamily } from "../../fonts";
import { EM2_TEXT } from "../script";
import { C } from "../theme";
import { Accumulator, Journal, Panel } from "../graphics/Hud";
import { MapView } from "../graphics/Map";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { camMove, PanelShot } from "../shots";
import { H, placeAt } from "./common";
import { STAGE, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const GYM_BAG = "#3FA7A0";

const walk = (t: number, t0: number, t1: number, a: Vec, b: Vec, h: number, acc = 0.25): Place => {
  const u = cruise((t - t0) / (t1 - t0), acc);
  return placeAt(lerp(a.x, b.x, u), lerp(a.y, b.y, u), h);
};

// Записка учительницы (крупно).
export const NoteCard: React.FC<{ a: number }> = ({ a }) => (
  <div style={box({ left: 170, top: 330, width: 740, padding: "50px 56px", borderRadius: 18, backgroundColor: "#FFFDF6", rotate: "-3deg", opacity: a, scale: `${0.92 + 0.08 * a}`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)", fontFamily, color: "#1E2235" })}>
    <div style={{ fontSize: 34, fontWeight: 800, color: "#5A6B8C" }}>{EM2_TEXT.noteFrom}</div>
    <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.2, marginTop: 14 }}>{EM2_TEXT.note}</div>
  </div>
);

export const WaitingScene: React.FC = () => {
  const { f, t } = useScene("waiting");
  const dad = (tt: number) => walk(tt, 150, 176, { x: 990, y: 1880 }, { x: 930, y: 1870 }, H.dad, 0.35);
  const teacher = (tt: number) => walk(tt, 120, 160, { x: 600, y: 1548 }, { x: 800, y: 1742 }, H.teacher, 0.3);
  const kidA = (tt: number) => walk(tt, 70, 150, { x: 560, y: 1546 }, { x: 330, y: 1720 }, 520, 0.2);
  const kidB = (tt: number) => walk(tt, 86, 170, { x: 620, y: 1548 }, { x: 1180, y: 1720 }, 600, 0.2);
  const give = 182;
  const meet: Vec = { x: 900, y: 1872 - 0.47 * H.dad };
  // сумка ноутбука — в левой руке; правой (с часами) смотрит на время,
  // затем ею же принимает записку
  const dadPose = (tt: number) => {
    const p = dad(tt);
    const side = { x: p.x + 0.13 * p.h, y: p.y - 0.44 * p.h };
    const watch = { x: p.x + 0.0 * p.h, y: p.y - 0.68 * p.h };
    return {
      expr: tt < 60 ? ("calm" as const) : tt < 120 ? ("thinking" as const) : ("calm" as const),
      armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.46 * p.h }, shape: "fist" as const, item: "laptopbag" as const, elbow: "down" as const },
      armR: {
        target: keysV(tt, [[0, side], [30, watch], [70, watch], [96, side], [give - 18, side], [give, meet], [give + 20, { x: p.x + 0.1 * p.h, y: p.y - 0.55 * p.h }]], anticipate),
        shape: tt >= give ? ("pinch" as const) : tt > give - 14 ? ("open" as const) : ("relax" as const),
        item: tt >= give ? ("note" as const) : ("none" as const),
        wrist: tt > 24 && tt < 80 ? 70 : 0,
        elbow: "down" as const,
        behind: false,
      },
      lookY: keys(tt, [[24, 0], [34, 0.45], [70, 0.45], [80, 0], [give + 20, 0], [give + 28, 0.5]]),
    };
  };
  // взгляд: на двери → на часы (вниз) → на выходящих детей
  const dadFace = (tt: number) => keys(tt, [[0, -0.5], [72, -0.5], [90, -0.3], [150, -0.55]]);
  const teacherPose = (tt: number) => {
    const p = teacher(tt);
    return {
      expr: "softSmile" as const,
      armR: { target: keysV(tt, [[0, { x: p.x + 0.12 * p.h, y: p.y - 0.46 * p.h }], [give - 16, { x: p.x + 0.12 * p.h, y: p.y - 0.46 * p.h }], [give, meet], [give + 16, { x: p.x + 0.1 * p.h, y: p.y - 0.44 * p.h }]], anticipate), shape: tt < give ? ("pinch" as const) : ("open" as const), item: tt < give ? ("note" as const) : ("none" as const), elbow: "down" as const, behind: false },
      armL: { target: { x: p.x - 0.08 * p.h, y: p.y - 0.5 * p.h }, shape: "fist" as const, item: "notebook" as const, elbow: "down" as const },
    };
  };
  const doors = clamp((f - 56) / 16);
  const noteIn = easeOut((f - 196) / 8);
  return (
    <>
      <PanelShot f={f} from={0} to={196} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={camMove(f, 0, 196, { x: 860, y: 1360, zoom: 0.95 }, { x: 860, y: 1400, zoom: 1.05 })}>
        <SchoolBack minutes={13 * 60 + 20 + (7 * f) / 210} doorOpen={doors} />
        {f > 60 ? <Actor uid="w6-kidA" look="son" f={f} place={kidA} face={() => -0.4} pose={() => ({ expr: "smile" as const })} seed={8} /> : null}
        {f > 76 ? <Actor uid="w6-kidB" look="daughter" f={f} place={kidB} face={() => 0.4} pose={() => ({ expr: "smile" as const })} seed={9} /> : null}
        {f > 110 ? <Actor uid="w6-teacher" look="teacher" f={f} place={teacher} face={() => 0.35} pose={teacherPose} seed={5} /> : null}
        <SchoolFence />
        <Actor uid="w6-dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" seed={2} />
        <SidewalkTrees />
      </PanelShot>
      {f < 196 ? <Accumulator t={t} x={STAGE.x + STAGE.w - 292} y={STAGE.y + 20} /> : null}
      {f >= 196 ? (
        <div style={box({ left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, borderRadius: 28, overflow: "hidden", background: "radial-gradient(circle at 50% 35%, #1B2433, #080C13)" })}>
          <NoteCard a={noteIn} />
        </div>
      ) : null}
    </>
  );
};

export const FormScene: React.FC = () => {
  const { f, t, from, word } = useScene("form");
  const d01 = from("d01");
  const n06 = from("n06");
  const mapFrom = 142;
  const goIn = n06 - 4; // поворачиваются и идут обратно к двери
  const dad = (tt: number) => walk(tt, goIn, goIn + 40, { x: 930, y: 1870 }, { x: 780, y: 1800 }, H.dad, 0.3);
  // дочка справа от папы (не за его сумкой)
  const girl = (tt: number) => walk(tt, goIn - 4, goIn + 40, { x: 1100, y: 1890 }, { x: 900, y: 1800 }, H.girl, 0.3);
  const girlPose = (tt: number) => {
    const p = girl(tt);
    return {
      expr: tt < d01 - 10 ? ("calm" as const) : tt < n06 ? ("worried" as const) : ("calm" as const),
      // смотрит на свои руки (мешка нет) → на папу
      lookY: keys(tt, [[0, 0.1], [6, 0.6], [d01 - 12, 0.6], [d01 - 2, -0.35]]),
      armL: { target: keysV(tt, [[0, { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h }], [4, { x: p.x - 0.06 * p.h, y: p.y - 0.5 * p.h }], [d01 - 10, { x: p.x - 0.06 * p.h, y: p.y - 0.5 * p.h }], [d01 + 4, { x: p.x - 0.13 * p.h, y: p.y - 0.42 * p.h }]], anticipate), shape: "open" as const, behind: false },
      armR: { target: keysV(tt, [[0, { x: p.x + 0.13 * p.h, y: p.y - 0.42 * p.h }], [4, { x: p.x + 0.06 * p.h, y: p.y - 0.5 * p.h }], [d01 - 10, { x: p.x + 0.06 * p.h, y: p.y - 0.5 * p.h }], [d01 + 4, { x: p.x + 0.13 * p.h, y: p.y - 0.42 * p.h }]], anticipate), shape: "open" as const, behind: false },
      headTilt: keys(tt, [[d01, 0], [d01 + 12, -6]]),
    };
  };
  const girlFace = (tt: number) => keys(tt, [[0, -0.2], [d01 - 8, -0.2], [d01, -0.5], [goIn, -0.5], [goIn + 8, -0.7]]);
  const dadPose = (tt: number) => {
    const p = dad(tt);
    return {
      expr: tt < d01 + 20 ? ("calm" as const) : ("thinking" as const),
      armL: { target: { x: p.x - 0.14 * p.h, y: p.y - 0.46 * p.h }, shape: "fist" as const, item: "laptopbag" as const, elbow: "down" as const },
      armR: { target: { x: p.x + 0.1 * p.h, y: p.y - 0.55 * p.h }, shape: "pinch" as const, item: "note" as const, elbow: "down" as const, behind: false },
      // реакция: глаза → голова (вниз на дочку) → короткий выдох
      lookY: keys(tt, [[d01, 0.2], [d01 + 6, 0.55]]),
      exhale: keys(tt, [[word("d01", 3), 0], [word("d01", 3) + 14, 0.6], [goIn, 0]]),
    };
  };
  const dadFace = (tt: number) => keys(tt, [[0, -0.3], [d01 + 4, -0.3], [d01 + 12, 0.45], [goIn, 0.45], [goIn + 8, -0.75]]);
  const inset = easeOut((f - 182) / 10);
  const insetGirl: Place = { x: 520, y: 1700, h: 700 };
  return (
    <>
      <PanelShot f={f} from={0} to={mapFrom} x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} cam={camMove(f, 0, mapFrom, { x: 960, y: 1460, zoom: 1.35 }, { x: 950, y: 1470, zoom: 1.42 })}>
        <SchoolBack minutes={13 * 60 + 27 + f / 300} />
        <SchoolFence />
        <Actor uid="f7-girl" look="girl" f={f} place={girl} face={girlFace} pose={girlPose} role="daughter" seed={3} walkFrom={goIn - 6} />
        <Actor uid="f7-dad" look="dad" f={f} place={dad} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={goIn - 2} />
        <SidewalkTrees />
      </PanelShot>
      {f >= mapFrom ? (
        <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} title={EM2_TEXT.school}>
          <MapView t={t} f={f} cam={camMove(f, mapFrom, 240, { x: 700, y: 600, zoom: 1.85 }, { x: 750, y: 660, zoom: 1.6 })} w={STAGE.w} h={STAGE.h} routes={["drive", "park", "walk", "kit", "back"]} dim={["drive", "park", "walk"]} busy={1} glow="school" />
          <Accumulator t={t} x={STAGE.w - 272} y={22} />
          <Journal t={t} x={24} y={STAGE.h - 300} w={560} max={2} />
          {/* мешок со спортивной формой теперь у дочки */}
          <div style={box({ right: 20, bottom: 20, width: 330, height: 420, opacity: inset, translate: `0 ${(1 - inset) * 30}px` })}>
            <PanelShot f={f} from={0} to={99999} x={0} y={0} w={330} h={420} cam={{ x: 540, y: 1460, zoom: 0.62 }} bg="#1A2738">
              <SchoolBack minutes={13 * 60 + 35} />
              <Actor
                uid="f7-girl-in"
                look="girl"
                f={f}
                place={() => insetGirl}
                face={() => 0.2}
                pose={() => ({ expr: "smile" as const, armL: { target: { x: insetGirl.x - 0.15 * insetGirl.h, y: insetGirl.y - 0.46 * insetGirl.h }, shape: "fist" as const, item: "gymbag" as const, itemColor: GYM_BAG, elbow: "down" as const, behind: false } })}
                seed={3}
              />
            </PanelShot>
            <div style={box({ left: 16, bottom: 14, padding: "6px 14px", borderRadius: 999, backgroundColor: "rgba(8,12,19,0.85)", fontFamily, fontSize: 26, fontWeight: 800, color: C.teal })}>{EM2_TEXT.kit}</div>
          </div>
        </Panel>
      ) : null}
    </>
  );
};

