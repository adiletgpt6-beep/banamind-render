// Сцены 4–5 (повседневность).
// 4. «Кызы айтып берет»: короткий план — белая машина Айжан трогается от
//    школы (дочка уже сзади); затем салон: дочка сзади пристёгнута, держит
//    папку с листами для рисования: «Апа, бизде сүрөт сынагы болот! Мен да
//    катышам.» Айжан тепло: «Абдан жакшы!» — улыбается и следит за
//    дорогой. Линия «Мектеп → Үй». Готовый рисунок пока не раскрывается.
// 5. «Күн кайталанат»: бабушка встречает дочку дома; Айжан возвращается
//    в офис к отложенным документам. Смена 1-күн → 2-күн → 3-күн: короткие
//    повторы школьной поездки, незавершённых документов и того же черновика.
import { fontFamily } from "../../fonts";
import { Icon } from "../graphics/Icons";
import { caretOn } from "../graphics/Letter";
import { MOMENTS } from "../layout";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, clamp, cruise, easeIn, easeOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { UL2_LETTER, UL2_TEXT } from "../script";
import { CabinBack, CabinFront, FrontSeats } from "../sets/CarViews";
import { HomeBack } from "../sets/Home";
import { Car } from "../sets/Outdoor";
import { SchoolBack, SchoolFence, SidewalkTrees } from "../sets/School";
import { SCREEN } from "../sets/Office";
import { box as wbox } from "../shots";
import { C } from "../theme";
import { H, placeAt } from "./common";
import { box, crossfade, PanelArea, Stage, useScene } from "./kit";
import { OfficeStage, typingArms } from "./Office";

export const CAR_WHITE = "#F4F6F9";
export const FOLDER_BLUE = "#6FA8DC";

// Ремень безопасности: плечевая часть и поясная (мир кадра, px).
const Belt: React.FC<{ anchor: Vec; buckle: Vec; lap: Vec; w?: number }> = ({ anchor, buckle, lap, w = 18 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <path d={`M ${anchor.x} ${anchor.y} L ${buckle.x} ${buckle.y}`} stroke="#3A3F4A" strokeWidth={w * 0.45} strokeLinecap="round" />
    <path d={`M ${lap.x} ${lap.y} L ${buckle.x} ${buckle.y}`} stroke="#1F2228" strokeWidth={w} strokeLinecap="round" />
    <rect x={buckle.x - 12} y={buckle.y - 8} width={24} height={16} rx={4} fill="#9AA3B2" />
  </svg>
);

// Маршрут «Мектеп → Үй» (чип внизу карточки), progress 0…1.
export const RouteChip: React.FC<{ progress: number; a: number; bottom?: number }> = ({ progress, a, bottom = 24 }) => (
  <div style={box({ left: 130, right: 130, bottom, height: 92, borderRadius: 46, backgroundColor: "rgba(23,28,38,0.92)", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", fontFamily, fontSize: 34, fontWeight: 900, color: C.text, opacity: a })}>
    <Icon id="school" size={38} color="#8FD3A6" stroke={4} />
    <span>{UL2_TEXT.school}</span>
    <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: "#3A4558", position: "relative" }}>
      <div style={{ width: `${100 * progress}%`, height: 8, borderRadius: 4, backgroundColor: "#8FD3A6" }} />
      <div style={{ position: "absolute", left: `calc(${100 * progress}% - 11px)`, top: -7, width: 22, height: 22, borderRadius: 11, backgroundColor: C.yellow }} />
    </div>
    <Icon id="home" size={38} color="#FFC46B" stroke={4} />
    <span>{UL2_TEXT.home}</span>
  </div>
);

// ---------- 4. Дочка рассказывает ----------
export const CarScene: React.FC = () => {
  const { f, from, to } = useScene("car");
  const d01 = from("d01");
  const m02 = from("m02");
  const cut = 34; // школа → салон
  const inA = crossfade(f, cut, 8);
  // снаружи: машина стоит у школы и трогается влево
  const go = easeIn(clamp((f - 8) / 40));
  const carX = 1040 - 520 * go;
  const pass = Math.max(0, f - cut) * 1.4;
  const mom: Place = { x: 830, y: 1980, h: 1150 };
  const girl: Place = { x: 470, y: 1360, h: 760 };
  const momPose = (tt: number): PoseIn => ({
    expr: tt < d01 + 10 ? "calm" : tt < m02 - 4 ? "softSmile" : "smile",
    sit: 1,
    seat: 760,
    armL: { target: { x: 668, y: 1262 }, shape: "fist", elbow: "down" },
    armR: { target: { x: 980, y: 1262 }, shape: "fist", elbow: "down" },
    // короткий взгляд в зеркало на дочку и снова на дорогу
    lookX: keys(tt, [[d01 + 4, 0], [d01 + 12, -0.5], [d01 + 34, -0.5], [d01 + 44, 0]]),
    nod: keys(tt, [[m02 - 4, 0], [m02 + 4, 3], [m02 + 14, 0]]),
  });
  const momFace = (tt: number) => keys(tt, [[d01 + 4, 0], [d01 + 14, -0.12], [d01 + 34, -0.12], [d01 + 46, 0]]);
  // дочка: папка на коленях; на «сүрөт сынагы» — живой жест рукой
  const fold = { x: 500, y: 1010 };
  const girlPose = (tt: number): PoseIn => ({
    expr: tt < d01 - 4 ? "calm" : "smile",
    sit: 1,
    seat: 330,
    packOff: true,
    armL: { target: { x: fold.x - 62, y: fold.y + 18 }, shape: "fist", elbow: "down", behind: false },
    armR: {
      target: keysV(tt, [[0, { x: fold.x + 62, y: fold.y + 18 }], [d01 + 6, { x: fold.x + 62, y: fold.y + 18 }], [d01 + 18, { x: 590, y: 880 }], [to("d01") - 6, { x: 600, y: 870 }], [to("d01") + 10, { x: fold.x + 62, y: fold.y + 18 }]], anticipate),
      shape: tt > d01 + 10 && tt < to("d01") ? "open" : "fist",
      elbow: "down",
      behind: false,
    },
    lookX: keys(tt, [[0, -0.5], [d01 - 10, -0.5], [d01 - 2, 0.1], [to("m02") + 20, 0.1], [to("m02") + 40, -0.4]]),
    nod: keys(tt, [[to("m02") + 2, 0], [to("m02") + 8, 4], [to("m02") + 16, 0]]),
  });
  const girlFace = (tt: number) => keys(tt, [[0, -0.4], [d01 - 10, -0.4], [d01, 0.15], [to("m02") + 20, 0.15], [to("m02") + 40, -0.3]]);
  return (
    <PanelArea>
      {inA < 1 ? (
        <Stage cam={{ x: 860, y: 1560, zoom: 0.64 }} bg="#CFE3F2" opacity={1 - inA}>
          <SchoolBack minutes={14 * 60 + 32} doorOpen={0} />
          <SchoolFence />
          <SidewalkTrees />
          <div style={wbox({ left: -400, top: 1990, width: 2800, height: 400, backgroundColor: "#8B929C" })} />
          <Car x={carX} y={2120} s={1.15} color={CAR_WHITE} wheel={-go * 260} dir={-1} driver kid />
        </Stage>
      ) : null}
      {inA > 0 ? (
        <Stage cam={{ x: 560, y: 1040 + Math.sin(f * 0.3) * 1.5, zoom: 0.8 }} bg="#3B414D" opacity={inA}>
          <CabinBack />
          {/* в заднем окне проплывает улица — машина едет */}
          <div style={wbox({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
            {[0, 1, 2, 3, 4].map((i) => {
              const x = (((i * 260 - pass * 10) % 1300) + 1300) % 1300 - 200;
              return <div key={i} style={wbox({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: ["#F1E3C8", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"][i], borderRadius: i % 2 ? 80 : 6 })} />;
            })}
          </div>
          <Actor uid="c4-girl" look="girl" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={5} layer="body" />
          {/* папка с листами для рисования (рисунок ещё не показан) */}
          <div style={wbox({ left: fold.x - 92, top: fold.y - 60, width: 184, height: 136, borderRadius: 12, backgroundColor: FOLDER_BLUE, boxShadow: "inset 0 -10px 0 rgba(0,0,0,0.1)" })}>
            <div style={wbox({ left: 14, top: -10, width: 150, height: 20, borderRadius: 4, backgroundColor: "#FFFDF5" })} />
          </div>
          <Actor uid="c4-girl-a" look="girl" f={f} place={() => girl} face={girlFace} pose={girlPose} role="daughter" seed={5} layer="arms" />
          {/* ремень: от крепления у плеча через грудь к замку, поясная часть по бёдрам */}
          <Belt anchor={{ x: 392, y: 800 }} buckle={{ x: 552, y: 1060 }} lap={{ x: 398, y: 1058 }} />
          <div style={wbox({ left: 360, top: 1066, width: 500, height: 300, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
          <FrontSeats />
          <Actor uid="c4-mom" look="aizhan" f={f} place={() => mom} face={momFace} pose={momPose} role="mother" seed={11} />
          <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d="M 905 1000 L 745 1440" stroke="#1F2228" strokeWidth={22} strokeLinecap="round" />
          </svg>
          <CabinFront pass={pass} wheel={Math.sin(f * 0.05) * 3} />
        </Stage>
      ) : null}
      <RouteChip progress={clamp((f - cut) / (270 - cut))} a={easeOut((f - cut - 6) / 10)} />
    </PanelArea>
  );
};

// ---------- 5. День повторяется ----------
const MiniCard: React.FC<{ icon: "school" | "folder" | "letter"; color: string; title: string; body?: React.ReactNode; a: number; y: number; hl?: number }> = ({ icon, color, title, body, a, y, hl = 0 }) => (
  <div style={box({ left: 50, right: 50, top: y, height: 168, borderRadius: 28, backgroundColor: "#FFFFFF", border: `3px solid ${hl > 0.5 ? C.yellow : C.cardLine}`, boxShadow: hl > 0.05 ? `0 0 0 ${8 * hl}px rgba(255,211,61,0.3)` : "0 8px 24px rgba(23,36,51,0.08)", display: "flex", alignItems: "center", gap: 24, padding: "0 30px", fontFamily, opacity: a, translate: `0 ${(1 - a) * 60}px` })}>
    <div style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon id={icon} size={48} color={C.ink} stroke={4} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: C.inkSoft, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ fontSize: 40, fontWeight: 900, color: C.ink, whiteSpace: "nowrap" }}>{body}</div>
    </div>
  </div>
);

const DocsScreen: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, backgroundColor: "#FFFFFF", fontFamily, color: C.ink })}>
    <div style={box({ left: 0, top: 0, width: SCREEN.w, height: 110, backgroundColor: "#F1F5FA", display: "flex", alignItems: "center", gap: 20, padding: "0 36px" })}>
      <Icon id="folder" size={60} color="#C79A12" stroke={4} />
      <div style={{ fontSize: 50, fontWeight: 900 }}>{UL2_TEXT.docs}</div>
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 40, right: 40, top: 150 + i * 140, height: 110, borderRadius: 20, backgroundColor: "#F4F6FA", display: "flex", alignItems: "center", gap: 24, padding: "0 28px" })}>
        <div style={{ width: 60, height: 76, borderRadius: 8, backgroundColor: ["#7FB8F0", "#8FD3A6", "#B79CF2"][i] }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: [460, 380, 520][i], height: 22, borderRadius: 11, backgroundColor: "#B9C4D2" }} />
          <div style={{ width: [300, 340, 240][i], height: 18, borderRadius: 9, backgroundColor: "#DCE3EC", marginTop: 14 }} />
        </div>
      </div>
    ))}
  </div>
);

const GRANDMA: Place = placeAt(660, 1560, H.grandma);
export const DaysScene: React.FC = () => {
  const { f, at } = useScene("days");
  const officeCut = 66;
  const d2 = at(MOMENTS.day2);
  const carousel = d2 - 6; // карточки 2-го дня появляются вместе с меткой
  const d3 = at(MOMENTS.day3);
  const homeA = 1 - crossfade(f, officeCut, 8);
  const officeA = crossfade(f, officeCut, 8) * (1 - crossfade(f, carousel, 8));
  const carA = crossfade(f, carousel, 8);
  // дом: дочка входит, бабушка встречает; Айжан в дверях машет и уходит
  const girlPlace = (tt: number): Place => {
    const u = cruise((tt - 4) / 42, 0.25);
    return placeAt(lerp(250, 480, u), 1580, H.girl);
  };
  const girlPose = (): PoseIn => ({ expr: "smile", strapTug: 0.4 });
  const grandmaPose = (tt: number): PoseIn => ({
    expr: "smile",
    armR: { target: tt > 30 ? keysV(tt, [[30, { x: 700, y: 1560 - 380 }], [46, { x: 560, y: 1580 - 400 }]], anticipate) : null, shape: "open", elbow: "down" },
    nod: keys(tt, [[30, 0], [40, 4], [52, 0]]),
  });
  const momPlace = (tt: number): Place => placeAt(keys(tt, [[0, 180], [44, 180], [64, 100]]), 1530, H.mom);
  const momPose = (tt: number): PoseIn => ({
    expr: "softSmile",
    armL: { target: tt > 14 && tt < 42 ? { x: 120, y: 1530 - 700 + Math.sin(tt * 0.5) * 12 } : null, shape: "wave", elbow: "out" },
  });
  const draftLine = (
    <span>
      {UL2_LETTER.draft}
      <span style={{ display: "inline-block", width: 4, height: 40, marginLeft: 4, verticalAlign: "-6px", backgroundColor: caretOn(f) ? "#2F6FD6" : "transparent" }} />
    </span>
  );
  // наборы карточек дня: 2-й и 3-й день
  const set = (start: number, end: number) => {
    const out = end < 9999 ? 1 - easeOut((f - end + 6) / 8) : 1;
    return [0, 1, 2].map((i) => easeOut((f - start - i * 6) / 9) * out);
  };
  const s2 = set(carousel, d3);
  const s3 = set(d3, 9999);
  const dayNo = f < d3 ? UL2_TEXT.day2 : UL2_TEXT.day3;
  const age = Math.max(0, f - (f < d3 ? carousel : d3));
  return (
    <PanelArea>
      {homeA > 0 ? (
        <Stage cam={{ x: 470, y: 1120, zoom: 0.74 }} bg="#EFE3D0" opacity={homeA}>
          <HomeBack minutes={15 * 60} doorOpen={1} />
          <Actor uid="d5-mom" look="aizhan" f={f} place={momPlace} face={(tt) => (tt < 44 ? 0.5 : -0.8)} pose={momPose} seed={11} walkFrom={44} opacity={1 - clamp((f - 56) / 8)} />
          <Actor uid="d5-gm" look="grandma" f={f} place={() => GRANDMA} face={() => -0.6} pose={grandmaPose} seed={7} />
          <Actor uid="d5-girl" look="girl" f={f} place={girlPlace} face={() => 0.6} pose={girlPose} seed={5} />
        </Stage>
      ) : null}
      {officeA > 0 ? (
        <OfficeStage f={f} uid="d5o" cam={{ x: 860, y: 1060, zoom: 0.92 }} momFace={() => -0.4} momPose={(tt) => ({ expr: "thinking", sit: 1, seat: 0.27 * H.mom, ...typingArms(tt, true), lookY: 0.15 })} screen={<DocsScreen />} opacity={officeA} />
      ) : null}
      {carA > 0 ? (
        <div style={box({ inset: 0, backgroundColor: "#EEF2F7", opacity: carA })}>
          <div style={box({ left: 0, right: 0, top: 44, textAlign: "center", fontFamily, fontSize: 100, fontWeight: 900, color: C.ink, opacity: easeOut(age / 6), scale: `${0.9 + 0.1 * easeOut(age / 6)}` })}>{dayNo}</div>
          {[s2, s3].map((s, k) => (
            <div key={k}>
              <MiniCard icon="school" color="#8FD3A6" title={UL2_TEXT.reminder} body={`${UL2_TEXT.school} → ${UL2_TEXT.home}`} a={s[0]} y={210} />
              <MiniCard icon="folder" color="#E8C26A" title={UL2_TEXT.docs} body="· · ·" a={s[1]} y={400} />
              <MiniCard icon="letter" color="#7FB8F0" title={UL2_LETTER.subject} body={draftLine} a={s[2]} y={590} hl={k === 1 ? easeOut((f - d3 - 30) / 10) : 0} />
            </div>
          ))}
        </div>
      ) : null}
    </PanelArea>
  );
};
