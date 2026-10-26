// Сцена 11. Знакомство с BalaGo и предварительная заявка (VO14).
// План А — вечер: мама берёт телефон, папа наклоняется посмотреть вместе.
// План Б — телефон крупно: нарисованная нами страница BalaGo (логотип,
// «Балдар үчүн такси», «Бишкек», «ҮЙ → МЕКТЕП → ҮЙ»), затем карточка с
// полями «Аты-жөнү», «Дарек», «Мектеп», «Убакыт» (без личных данных),
// одно нажатие «Баланы каттоо» → нейтральный статус «Өтүнмө жөнөтүлдү» и
// «Маршрут жана убакыт талкууланат», маршрут собирается последовательно.
// Это не подтверждённая поездка и не бронь.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { localCue, useCue, useSceneFrame, wordAt } from "../context";
import { appear, C, fontFamily, GlowPath, Headline, Vignette } from "../kit";
import { HouseIcon, SchoolIcon, SideCar } from "../props/Cars";
import { MomPointHand } from "../props/Hands";
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { EXPR } from "../rig/pose";
import { ChairBacks, HOME, HomeRoom, HomeTable } from "../sets/Home";
import { Shot } from "../shots";
import { DD_TEXT } from "../script";
import type { DdTimeline } from "../timing";
import { H, restOnTable, seatOf } from "./common";

const T = DD_TEXT.apply;
const MOM_X = 600;
const DAD_X = 860;

const beatsOf = (cue: ReturnType<typeof useCue>) => {
  const w = (i: number) => wordAt(cue, i);
  return {
    pick: 4, // мама берёт телефон
    cutB: w(6) - 10, // «Балаго тууралуу» — экран крупно
    scroll: w(9) - 6, // «маршрут» — к полям
    fieldA: w(9),
    fieldT: w(11), // «убакытты»
    headline: w(14),
    tap: w(16), // «өтүнмө»
    sent: w(16) + 9,
    route: w(17) + 6,
  };
};

export const applyBeats = (tl: DdTimeline) => {
  const sc = tl.scenes.find((s) => s.id === "apply")!;
  return { tap: beatsOf(localCue(tl, sc.from, "vo14")).tap };
};

export const ApplyScene: React.FC = () => {
  const t = useSceneFrame();
  const cue = useCue("vo14");
  const b = beatsOf(cue);
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      {t < b.cutB ? <ShotParents t={t} b={b} /> : <ShotPhone t={t} b={b} />}
      <Headline t={t} at={b.headline} lines={[[{ text: T.headline.split(" ").slice(0, 2).join(" ") }, { text: T.headline.split(" ")[2], hl: "yellow" }]]} y={150} size={84} />
    </AbsoluteFill>
  );
};

type Beats = ReturnType<typeof beatsOf>;

const ShotParents: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const mom = { x: MOM_X, y: HOME.seatY, h: H.mom };
  const dad = { x: DAD_X, y: HOME.seatY, h: H.dad };
  const phoneOnTable = { x: MOM_X + 90, y: HOME.table.top + 6 };
  const hold = { x: MOM_X + 110, y: 1090 };
  const momPose = (f: number) => ({
    expr: EXPR.calm,
    sit: 1,
    seat: seatOf(mom),
    lean: 4,
    lookY: keys(f, [[0, 0.6], [b.pick + 16, 0.55]]),
    nod: 4,
    armR: {
      target: keysV(f, [[0, phoneOnTable], [b.pick, phoneOnTable], [b.pick + 16, hold]]),
      shape: "phone" as const,
      item: f >= b.pick + 2 ? ("phone" as const) : ("none" as const),
      glow: 1,
      flat: keys(f, [[b.pick, 1], [b.pick + 14, 0]]),
      itemTilt: 8,
      elbow: "down" as const,
      behind: false,
    },
    armL: restOnTable(mom, -1),
  });
  const dadPose = (f: number) => ({
    expr: EXPR.calm,
    sit: 1,
    seat: seatOf(dad),
    lean: keys(f, [[b.pick + 6, 2], [b.pick + 26, 14]]),
    lookY: keys(f, [[b.pick + 6, 0.2], [b.pick + 24, 0.5]]),
    lookX: -0.2,
    armL: restOnTable(dad, -1, 0.08),
    armR: restOnTable(dad, 1),
  });
  const cam = { x: 730, y: 1060, zoom: lerp(1.9, 2.0, easeInOut(t / Math.max(1, b.cutB))) };
  return (
    <Shot f={t} from={-30} to={b.cutB} cam={cam} bg={C.wall}>
      <HomeRoom t={t} evening={1} />
      <ChairBacks xs={[MOM_X, DAD_X]} evening={1} />
      <Actor uid="ap-mom" look="mom" f={t} place={() => mom} face={() => 0.3} pose={momPose} seed={51} layer="body" />
      <Actor uid="ap-dad" look="dad" f={t} place={() => dad} face={(f) => keys(f, [[b.pick + 6, -0.3], [b.pick + 24, -0.55]])} pose={dadPose} seed={52} layer="body" />
      <HomeTable evening={1} />
      {t < b.pick + 2 ? (
        <div style={{ position: "absolute", left: phoneOnTable.x - 40, top: phoneOnTable.y - 12, width: 80, height: 22, borderRadius: 6, background: "#1E2235" }} />
      ) : null}
      <Actor uid="ap-mom" look="mom" f={t} place={() => mom} face={() => 0.3} pose={momPose} seed={51} layer="arms" />
      <Actor uid="ap-dad" look="dad" f={t} place={() => dad} face={(f) => keys(f, [[b.pick + 6, -0.3], [b.pick + 24, -0.55]])} pose={dadPose} seed={52} layer="arms" />
      <Vignette strength={0.3} />
    </Shot>
  );
};

// Телефон крупно.
const PH = { x: 250, y: 330, w: 580, h: 1060 } as const;
const SCR = { x: 22, y: 26, w: PH.w - 44, h: PH.h - 52 } as const;

const ShotPhone: React.FC<{ t: number; b: Beats }> = ({ t, b }) => {
  const enter = easeOut((t - b.cutB) / 12);
  const scroll = easeInOut((t - b.scroll) / 18) * 560;
  const press = t >= b.tap && t < b.tap + 10 ? Math.sin(((t - b.tap) / 10) * Math.PI) : 0;
  const sent = easeOut((t - b.sent) / 12);
  // кнопка — в координатах экрана после прокрутки
  const btn = { x: SCR.w / 2, y: 1352 - scroll };
  const fingerIn = easeOut((t - (b.tap - 16)) / 14) * (1 - easeInOut((t - (b.tap + 14)) / 14));
  const finger = { x: PH.x + SCR.x + btn.x + 40, y: PH.y + SCR.y + btn.y + 6 + 8 * press };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.tealDeep} 0%, ${C.deep} 45%, ${C.navy} 100%)` }}>
      <div style={{ position: "absolute", left: PH.x, top: PH.y, width: PH.w, height: PH.h, transform: `translateY(${(1 - enter) * 60}px) scale(${0.96 + 0.04 * enter})`, opacity: enter }}>
        {/* корпус */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 70, background: "#1E2235", boxShadow: `0 0 0 3px rgba(115,220,232,0.35), 0 0 60px rgba(115,220,232,0.18), 0 40px 80px rgba(0,0,0,0.5)` }} />
        {/* экран */}
        <div style={{ position: "absolute", left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, borderRadius: 52, overflow: "hidden", background: "#F6F7F9" }}>
          <div style={{ position: "absolute", left: 0, top: -scroll, width: SCR.w }}>
            <Page t={t} b={b} press={press} />
          </div>
          {/* верхняя панель браузера */}
          <div style={{ position: "absolute", left: 0, top: 0, width: SCR.w, height: 74, background: "rgba(246,247,249,0.97)", borderBottom: "2px solid #E3E8EE", display: "flex", alignItems: "center", gap: 14, padding: "0 26px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden" }}>
              <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontFamily, fontWeight: 900, fontSize: 34, color: C.ink }}>{T.brand}</span>
          </div>
          {/* статус после нажатия */}
          {sent > 0 ? <Status t={t} b={b} o={sent} /> : null}
        </div>
        <div style={{ position: "absolute", left: PH.w / 2 - 60, top: 10, width: 120, height: 10, borderRadius: 5, background: "#30364A" }} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {fingerIn > 0 ? <MomPointHand x={finger.x + (1 - fingerIn) * 260} y={finger.y + (1 - fingerIn) * 420} angle={-28} s={0.95} /> : null}
      </svg>
      <Vignette strength={0.25} />
    </AbsoluteFill>
  );
};

// Содержимое страницы (нарисовано нами, не снимок сайта).
const Page: React.FC<{ t: number; b: Beats; press: number }> = ({ t, b, press }) => {
  const W = SCR.w;
  const hl = (i: number) => (i === 1 || i === 2 ? appear(t, b.fieldA + (i - 1) * 6, 8) : i === 3 ? appear(t, b.fieldT, 8) : 0);
  return (
    <div style={{ position: "relative", width: W, height: 1700 }}>
      <div style={{ height: 90 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 210, height: 210, borderRadius: 105, overflow: "hidden", boxShadow: `0 0 0 5px ${C.yellow}` }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 66, color: C.ink, lineHeight: 1 }}>
          Bala<span style={{ color: C.yellowDeep }}>Go</span>
        </div>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 38, color: C.inkSoft }}>{T.tagline}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 22px", borderRadius: 30, background: "#E7F6F8", border: `3px solid ${C.cyan}` }}>
          <svg width={22} height={28} viewBox="0 0 34 44">
            <path d="M 17 2 C 7 2 2 10 2 17 C 2 28 17 42 17 42 C 17 42 32 28 32 17 C 32 10 27 2 17 2 Z" fill={C.yellowDeep} />
            <circle cx={17} cy={17} r={6} fill="#FFFFFF" />
          </svg>
          <span style={{ fontFamily, fontWeight: 900, fontSize: 34, color: C.ink }}>{T.city}</span>
        </div>
      </div>
      {/* маршрут */}
      <div style={{ margin: "26px 28px 0", padding: "18px 0 14px", borderRadius: 28, background: C.navy, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width={W - 56} height={120} viewBox={`0 0 ${W - 56} 120`}>
          <line x1={60} y1={96} x2={W - 116} y2={96} stroke="rgba(246,247,249,0.35)" strokeWidth={4} strokeDasharray="16 12" />
          <HouseIcon x={70} y={86} s={0.6} />
          <SchoolIcon x={(W - 56) / 2} y={86} s={0.6} />
          <HouseIcon x={W - 126} y={86} s={0.6} />
        </svg>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 36, color: C.light }}>{T.route}</div>
      </div>
      {/* регистрация: поля без личных данных */}
      <div style={{ margin: "28px 28px 0", padding: "24px 26px", borderRadius: 28, background: "#FFFFFF", boxShadow: "0 8px 24px rgba(16,24,39,0.12)", display: "flex", flexDirection: "column", gap: 16 }}>
        {T.fields.map((f, i) => (
          <div key={f} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily, fontWeight: 800, fontSize: 34, color: C.inkSoft }}>{f}</span>
            <div style={{ height: 58, borderRadius: 16, border: `3px solid ${hl(i) > 0 ? C.cyan : "#D5DCE6"}`, background: hl(i) > 0 ? `rgba(115,220,232,${0.16 * hl(i)})` : "#F6F7F9", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 12, height: 12, borderRadius: 6, background: "#C3CBD6" }} />
              ))}
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: 8,
            height: 92,
            borderRadius: 46,
            background: C.yellow,
            boxShadow: `0 ${10 - 6 * press}px 0 ${C.yellowDeep}`,
            transform: `translateY(${6 * press}px) scale(${1 - 0.03 * press})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily,
            fontWeight: 900,
            fontSize: 44,
            color: C.ink,
          }}
        >
          {T.button}
        </div>
      </div>
    </div>
  );
};

// Статус: заявка отправлена, маршрут и время будут обсуждаться.
const Status: React.FC<{ t: number; b: Beats; o: number }> = ({ t, b, o }) => {
  const W = SCR.w;
  const r = easeInOut((t - b.route) / 26);
  const carX = lerp(70, W - 126 - 40, r);
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(16,24,39,${0.55 * o})` }}>
      <div
        style={{
          position: "absolute",
          left: 26,
          right: 26,
          top: 300,
          padding: "34px 26px 26px",
          borderRadius: 34,
          background: "#FFFFFF",
          transform: `translateY(${(1 - o) * 40}px)`,
          opacity: o,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <svg width={96} height={96} viewBox="0 0 96 96">
          <circle cx={48} cy={48} r={44} fill="#E7F6F8" stroke={C.cyan} strokeWidth={5} />
          <path d="M 28 50 L 42 64 L 70 34" fill="none" stroke={C.tealDeep} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - clamp((t - b.sent - 4) / 10))} />
        </svg>
        <div style={{ fontFamily, fontWeight: 900, fontSize: 44, color: C.ink, textAlign: "center" }}>{T.sent}</div>
        <div style={{ fontFamily, fontWeight: 700, fontSize: 34, color: C.inkSoft, textAlign: "center", lineHeight: 1.25 }}>{T.note}</div>
        <svg width={W - 104} height={130} viewBox={`0 0 ${W - 104} 130`} style={{ marginTop: 8, opacity: appear(t, b.route - 6, 8) }}>
          <rect x={20} y={88} width={W - 144} height={22} rx={11} fill="#1B2A3E" />
          <GlowPath d={`M 46 99 L ${carX} 99`} len={W} progress={1} color={C.yellow} width={5} glow={false} />
          <HouseIcon x={46} y={86} s={0.5} />
          <SchoolIcon x={(W - 104) / 2} y={86} s={0.5} />
          <HouseIcon x={W - 150} y={86} s={0.5} />
          <SideCar kind="white" x={carX} y={112} scale={0.24} dist={carX * 3} />
        </svg>
      </div>
    </div>
  );
};
