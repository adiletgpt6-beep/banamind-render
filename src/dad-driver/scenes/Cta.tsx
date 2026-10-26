// Сцена 14. Финал BalaGo (VO19). Чистая фирменная композиция: глубокий
// синий, белые элементы, жёлтый акцент. По словам рассказчика: логотип и
// BalaGo → «Бишкек» → «Балдар үчүн такси» → маршрут «ҮЙ → МЕКТЕП → ҮЙ»
// (белая машина едет от дома к школе и обратно). На призыве маршрут уходит,
// на его месте — кнопка «Баланы каттоо», «Шилтеме профилдин башында» и
// карточка WhatsApp с номером. Кадр держится полностью читаемым до конца.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { findWord, useCue, useSceneFrame, wordAt, type LocalCue } from "../context";
import { appear, C, fontFamily, GlowPath, GridDots } from "../kit";
import { HouseIcon, SchoolIcon, SideCar } from "../props/Cars";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { DD_TEXT } from "../script";

const T = DD_TEXT.cta;

// Первое слово с одним из префиксов (или запасной индекс).
const wordOf = (cue: LocalCue, prefixes: readonly string[], after: number, fallback: number) => {
  for (const p of prefixes) {
    const i = findWord(cue, p, after);
    if (i >= 0) return i;
  }
  return fallback;
};

export const ctaBeats = (cue: LocalCue) => {
  const w = (i: number) => wordAt(cue, i);
  const call = wordOf(cue, ["профил"], 9, 13); // «Профилдин башындагы шилтеме…»
  const wa = wordOf(cue, ["экран", "вотсап"], call, call + 5); // «экрандагы номерге» — номер на экране
  return {
    brand: w(0) - 4,
    city: w(1) - 2,
    tagline: w(2) - 2,
    toSchool: w(5),
    toHome: w(7),
    home: w(8) + 14,
    call: w(call) - 10, // маршрут уходит, появляется кнопка
    link: w(call + 1),
    press: w(call + 3) + 2,
    wa: w(wa) - 4,
  };
};

// Маршрут: дом слева → школа в центре → дом справа (тот же дом — «обратно»
// показан стрелкой возврата). Координаты кадра.
const ROAD_Y = 1010;
// Блок призыва (после ухода маршрута): кнопка, строка о шилтеме, WhatsApp.
const BTN_Y = 900;
const LINK_Y = 1062;
const WA_Y = 1146;
const HOME_X = 210;
const SCHOOL_X = 540;
const HOME2_X = 870;

export const CtaScene: React.FC = () => {
  const t = useSceneFrame();
  const cue = useCue("vo19");
  const b = ctaBeats(cue);
  const logo = appear(t, b.brand, 12);
  const brand = appear(t, b.brand + 6, 10);
  const city = appear(t, b.city, 10);
  const tag = appear(t, b.tagline, 10);
  // маршрут появляется по «Үйдөн мектепке» и уходит вверх на призыве
  const routeOut = easeInOut((t - b.call) / 12);
  const route = appear(t, b.toSchool - 8, 10) * (1 - routeOut);
  // машина: дом → школа (остановка) → дом справа
  const go1 = easeInOut((t - b.toSchool) / Math.max(10, b.toHome - b.toSchool - 4));
  const go2 = easeInOut((t - b.toHome) / Math.max(12, b.home - b.toHome));
  const carX = t < b.toHome ? lerp(HOME_X + 70, SCHOOL_X - 10, go1) : lerp(SCHOOL_X - 10, HOME2_X - 125, go2);
  const dist = (carX - HOME_X) * 3.2;
  const lineP1 = clamp((carX - HOME_X) / (SCHOOL_X - HOME_X));
  const lineP2 = clamp((carX - SCHOOL_X) / (HOME2_X - 125 - SCHOOL_X));
  const btn = appear(t, b.call + 8, 10);
  const press = t > b.press && t < b.press + 12 ? Math.sin(((t - b.press) / 12) * Math.PI) : 0;
  const link = appear(t, b.link, 10);
  const wa = appear(t, b.wa, 10);
  const waPop = t > b.wa && t < b.wa + 16 ? Math.sin(((t - b.wa) / 16) * Math.PI) : 0;
  const glowPulse = 0.5 + 0.5 * Math.sin(t / 18);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, ${C.navy} 55%, #0B1220 100%)`, overflow: "hidden" }}>
      <GridDots w={1080} h={1920} t={t} n={34} />
      {/* мягкое свечение за логотипом */}
      <div
        style={{
          position: "absolute",
          left: 540 - 420,
          top: 300 - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,211,78,0.22) 0%, rgba(115,220,232,0.10) 40%, rgba(0,0,0,0) 70%)",
          opacity: logo,
        }}
      />
      {/* логотип */}
      <div
        style={{
          position: "absolute",
          left: 540 - 150,
          top: 160,
          width: 300,
          height: 300,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: `0 0 0 6px ${C.yellow}, 0 18px 50px rgba(0,0,0,0.45)`,
          opacity: logo,
          transform: `scale(${0.86 + 0.14 * easeOut((t - b.brand) / 14)})`,
        }}
      >
        <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* BalaGo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 488, textAlign: "center", opacity: brand, transform: `translateY(${(1 - brand) * 18}px)` }}>
        <span style={{ fontFamily, fontWeight: 900, fontSize: 120, color: C.light, letterSpacing: -2, lineHeight: 1 }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </span>
      </div>
      {/* Балдар үчүн такси */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 628, textAlign: "center", opacity: tag, transform: `translateY(${(1 - tag) * 14}px)` }}>
        <span style={{ fontFamily, fontWeight: 800, fontSize: 62, color: C.light }}>{T.tagline}</span>
      </div>
      {/* Бишкек */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 724,
          transform: `translate(-50%, 0) scale(${0.9 + 0.1 * city})`,
          opacity: city,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 30px",
          borderRadius: 40,
          background: "rgba(16,24,39,0.85)",
          border: `3px solid ${C.cyan}`,
          boxShadow: `0 0 26px rgba(115,220,232,0.35)`,
        }}
      >
        <svg width={34} height={44} viewBox="0 0 34 44">
          <path d="M 17 2 C 7 2 2 10 2 17 C 2 28 17 42 17 42 C 17 42 32 28 32 17 C 32 10 27 2 17 2 Z" fill={C.yellow} />
          <circle cx={17} cy={17} r={6} fill={C.navy} />
        </svg>
        <span style={{ fontFamily, fontWeight: 900, fontSize: 54, color: C.light }}>{T.city}</span>
      </div>
      {/* маршрут: дорога, значки, машина */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: route, transform: `translateY(${-40 * routeOut}px)` }}>
        <rect x={110} y={ROAD_Y - 4} width={860} height={44} rx={22} fill="#1B2A3E" />
        <line x1={140} y1={ROAD_Y + 18} x2={940} y2={ROAD_Y + 18} stroke="rgba(246,247,249,0.35)" strokeWidth={4} strokeDasharray="26 22" />
        <GlowPath d={`M ${HOME_X} ${ROAD_Y + 18} L ${SCHOOL_X} ${ROAD_Y + 18}`} len={SCHOOL_X - HOME_X} progress={lineP1} color={C.yellow} width={7} />
        <GlowPath d={`M ${SCHOOL_X} ${ROAD_Y + 18} L ${HOME2_X - 125} ${ROAD_Y + 18}`} len={HOME2_X - 125 - SCHOOL_X} progress={lineP2} color={C.yellow} width={7} />
        <HouseIcon x={HOME_X} y={ROAD_Y - 10} s={0.95} />
        <SchoolIcon x={SCHOOL_X} y={ROAD_Y - 10} s={0.95} />
        <HouseIcon x={HOME2_X} y={ROAD_Y - 10} s={0.95} />
        <SideCar kind="white" x={carX} y={ROAD_Y + 34} scale={0.42} dist={dist} glow={0.6} />
      </svg>
      {/* ҮЙ → МЕКТЕП → ҮЙ — подписи под значками */}
      <div style={{ position: "absolute", left: 0, right: 0, top: ROAD_Y + 62 - 40 * routeOut, height: 70, opacity: route }}>
        {[
          [HOME_X, T.route.split(" → ")[0]],
          [(HOME_X + SCHOOL_X) / 2, "→"],
          [SCHOOL_X, T.route.split(" → ")[1]],
          [(SCHOOL_X + HOME2_X) / 2, "→"],
          [HOME2_X, T.route.split(" → ")[2]],
        ].map(([x, s], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x as number,
              top: 0,
              transform: "translateX(-50%)",
              fontFamily,
              fontWeight: 900,
              fontSize: s === "→" ? 48 : 50,
              color: s === "→" ? C.cyan : C.light,
              opacity: appear(t, b.toSchool - 8 + i * 4, 8),
            }}
          >
            {s}
          </div>
        ))}
      </div>
      {/* кнопка */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: BTN_Y,
          transform: `translate(-50%, 0) scale(${(0.9 + 0.1 * btn) * (1 - 0.05 * press)})`,
          opacity: btn,
          padding: "26px 70px",
          borderRadius: 60,
          background: C.yellow,
          boxShadow: `0 ${12 - 6 * press}px 0 ${C.yellowDeep}, 0 0 ${40 + 20 * glowPulse}px rgba(255,211,78,0.35)`,
          fontFamily,
          fontWeight: 900,
          fontSize: 66,
          color: C.ink,
          whiteSpace: "nowrap",
        }}
      >
        {T.button}
      </div>
      {/* Шилтеме профилдин башында */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LINK_Y,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          opacity: link,
          transform: `translateY(${(1 - link) * 12}px)`,
        }}
      >
        <svg width={40} height={44} viewBox="0 0 40 44" style={{ transform: `translateY(${-4 * Math.sin(t / 10) * link}px)` }}>
          <path d="M 20 4 L 36 22 L 26 22 L 26 40 L 14 40 L 14 22 L 4 22 Z" fill={C.cyan} />
        </svg>
        <span style={{ fontFamily, fontWeight: 800, fontSize: 46, color: C.light }}>{T.link}</span>
      </div>
      {/* WhatsApp: подпись и номер */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: WA_Y,
          transform: `translate(-50%, 0) translateY(${(1 - wa) * 16}px) scale(${1 + 0.04 * waPop})`,
          opacity: wa,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "18px 40px 18px 26px",
          borderRadius: 30,
          background: "rgba(16,24,39,0.88)",
          border: `3px solid ${WA_GREEN}`,
          boxShadow: `0 0 ${24 + 18 * waPop}px rgba(37,211,102,0.35)`,
          whiteSpace: "nowrap",
        }}
      >
        <ChatIcon />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.08 }}>
          <span style={{ fontFamily, fontWeight: 800, fontSize: 40, color: WA_GREEN }}>{T.whatsappLabel}</span>
          <span style={{ fontFamily, fontWeight: 900, fontSize: 78, color: C.light, letterSpacing: 1 }}>{T.whatsappNumber}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Зелёный — цвет мессенджера; значок — простой облачко-телефон (не логотип).
const WA_GREEN = "#25D366";
const ChatIcon: React.FC = () => (
  <svg width={84} height={84} viewBox="0 0 84 84">
    <circle cx={42} cy={42} r={40} fill={WA_GREEN} />
    <path d="M 42 16 C 27 16 16 27 16 41 C 16 46 17.5 50.5 20 54.5 L 17 67 L 29.5 63.8 C 33.3 66 37.5 67 42 67 C 57 67 68 56 68 41.5 C 68 27 57 16 42 16 Z" fill="none" stroke="#FFFFFF" strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 33 30 C 31 30 29.5 32 29.5 34.5 C 29.5 42 37.5 51.5 47.5 54 C 50 54.5 52.5 53 53 51 L 53.5 48.5 L 47.5 45.5 L 45 48 C 41 46.5 37.5 43 36 39 L 38.5 36.5 L 35.5 30.5 Z" fill="#FFFFFF" />
  </svg>
);
