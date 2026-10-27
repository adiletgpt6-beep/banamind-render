// Сцена 11 «BalaGo» — финальная карточка (правила проекта: AGENTS.md).
// N19: логотип появляется в центре и поднимается; «BalaGo» и «Бишкек •
// Балдар үчүн такси» — по словам; маршрут «ҮЙ → МЕКТЕП → ҮЙ» прорисовывается
// на «Үйдөн мектепке…»; белый Volkswagen Polo BalaGo подъезжает и
// останавливается под маршрутом.
// N20: к началу реплики о контактах (tl.contactFrom) появляется блок
// контактов — «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и
// крупный номер WhatsApp. С этого кадра карточка полностью неподвижна до
// конца ролика (≥ 5 с; после последнего слова — ≥ 3 с). Всё важное — в зоне
// x 90…900, y ≤ 1420; субтитры финала — наверху и не перекрывают номер.
import { Img, staticFile } from "remotion";
import type { M13Timeline } from "../timing";
import { sceneTools } from "../plan";
import { box, usePlan, useScene } from "../kit";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { CarSide } from "../props/Car";
import { POLO_PAINT, RouteBadge } from "../props/HomeProps";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";
import { CAR_SCALE } from "./common";
import type { M13Sfx } from "./sfx";

export const brandPlan = (tl: M13Timeline) => {
  const T = sceneTools(tl, "brand");
  // с этого кадра сцены карточка с контактами видна целиком и неподвижна
  const card = tl.contactFrom - T.start;
  const n19 = T.from("N19");
  const city = T.word("N19", "Бишкектеги");
  const route = T.word("N19", "Үйдөн");
  // вступление заканчивается до появления контактов
  const settle = (x: number) => Math.min(card - 14, x);
  return {
    len: T.len,
    card,
    logo: [Math.max(4, n19 - 14), Math.max(20, n19 + 4)] as const,
    rise: [settle(n19 + 10), settle(n19 + 34)] as const,
    name: [settle(n19 + 16), settle(n19 + 30)] as const,
    city: [settle(city - 2), settle(city + 12)] as const,
    route: [settle(route - 4), settle(route + 46)] as const,
    car: [settle(route + 6), settle(route + 60)] as const,
    contacts: [card - 10, card] as const,
  };
};

export const brandSfx = (tl: M13Timeline): M13Sfx[] => {
  void tl;
  return [];
};

// весь финал — субтитры наверху: номер и контакты внизу ничем не закрыты
export const brandSubTop = (tl: M13Timeline): ReadonlyArray<readonly [number, number]> => {
  const T = sceneTools(tl, "brand");
  return [[T.start, T.start + T.len]];
};

const ramp = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1, b - a));
const CX = 495; // центр безопасной зоны 90…900

// Плавное появление: прозрачность и небольшой подъём.
const fadeUp = (u: number): React.CSSProperties => ({ opacity: u, transform: `translateY(${(1 - u) * 26}px)` });

// Значок чата с телефонной трубкой (обобщённый, без чужого логотипа).
const ChatIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block" }}>
    <path d="M 32 4 A 28 28 0 1 1 13.6 53.2 L 5 58 L 8.6 46.6 A 28 28 0 0 1 32 4 Z" fill="#1F9D55" />
    <path
      d="M 23.5 18 C 21.4 18 19 20.6 19.6 24.4 C 20.8 32.6 30.6 43.4 39.8 44.6 C 43.4 45.1 46 42.7 46 40.6 L 46 38.4 C 46 37.5 45.4 36.8 44.6 36.6 L 39.6 35.4 C 38.9 35.2 38.2 35.5 37.8 36.1 L 36.4 38.2 C 32.4 36.4 28.1 32.1 26.2 28 L 28.3 26.6 C 28.9 26.2 29.2 25.5 29 24.8 L 27.8 19.8 C 27.6 19 26.9 18.4 26 18.4 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const BrandScene: React.FC = () => {
  const { f: f0 } = useScene("brand");
  const P = usePlan(brandPlan);
  // с начала карточки с контактами — неподвижный кадр до конца ролика
  const f = Math.min(f0, P.card);
  const T = M13_TEXT.cta;

  const pop = easeInOut(ramp(f, P.logo[0], P.logo[1]));
  const rise = easeInOut(ramp(f, P.rise[0], P.rise[1]));
  const logoSize = lerp(470, 220, rise) * lerp(0.86, 1, pop);
  const logoY = lerp(800, 430, rise);
  const name = easeInOut(ramp(f, P.name[0], P.name[1]));
  const city = easeInOut(ramp(f, P.city[0], P.city[1]));
  const routeU = ramp(f, P.route[0], P.route[1]);
  const routeIn = easeInOut(ramp(f, P.route[0] - 6, P.route[0] + 6));
  const contacts = easeInOut(ramp(f, P.contacts[0], P.contacts[1]));
  // белый Polo подъезжает слева и останавливается (колёса крутятся, пока едет)
  const carU = ramp(f, P.car[0], P.car[1]);
  const carE = 1 - Math.pow(1 - carU, 3);
  const carX = lerp(-360, CX + 10, carE);
  const cs = CAR_SCALE * 0.15;
  const carY = 1016;
  const wheel = (carX + 360) * 1.4;

  return (
    <>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: C.paper })} />
      {/* мягкие жёлтые пятна фона */}
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <circle cx={1000} cy={360} r={240} fill={C.yellow} opacity={0.2} />
        <circle cx={40} cy={1640} r={300} fill={C.yellow} opacity={0.16} />
        <path d={`M 130 ${carY + 2} L 860 ${carY + 2}`} stroke="#D9D2C4" strokeWidth={5} strokeLinecap="round" opacity={routeIn} />
      </svg>
      <Img
        src={staticFile("assets/logo.png")}
        style={box({ left: CX - logoSize / 2, top: logoY - logoSize / 2, width: logoSize, height: logoSize, opacity: pop, borderRadius: logoSize / 2, boxShadow: `0 16px 36px rgba(23,42,70,${0.16 * pop})` })}
      />
      <div style={box({ left: 90, top: 552, width: 810, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 92, lineHeight: 1, color: C.navy, ...fadeUp(name) })}>
        Bala<span style={{ color: "#E8A800" }}>Go</span>
      </div>
      <div style={box({ left: 90, top: 662, width: 810, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 46, lineHeight: 1.1, color: C.navy, ...fadeUp(city) })}>{T.city}</div>
      <div style={{ opacity: routeIn }}>
        <RouteBadge x={CX} y={826} k={0.8} draw={routeU} />
      </div>
      {carU > 0 ? (
        <>
          <CarSide x={carX} y={carY} s={cs} layer="back" paint={POLO_PAINT} wheel={wheel} />
          <CarSide x={carX} y={carY} s={cs} layer="body" paint={POLO_PAINT} wheel={wheel} />
        </>
      ) : null}
      {/* контакты: оба способа связи и полный номер — крупно и неподвижно */}
      <div
        style={box({
          left: 90,
          top: 1062,
          width: 810,
          padding: "22px 30px 28px",
          borderRadius: 34,
          background: "#FFFFFF",
          border: `4px solid ${C.navy}`,
          boxSizing: "border-box",
          textAlign: "center",
          color: C.navy,
          boxShadow: "0 18px 40px rgba(23,42,70,0.12)",
          ...fadeUp(contacts),
        })}
      >
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 44, lineHeight: 1.18 }}>{T.link}</div>
        <div style={{ fontFamily: F.text, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: "#2F3E57", marginTop: 4 }}>{T.whatsappCall}</div>
        <div style={{ marginTop: 20, borderRadius: 26, background: C.yellow, padding: "14px 10px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: F.text, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
            <ChatIcon size={46} />
            <span>{T.whatsappLabel}</span>
          </div>
          <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 90, lineHeight: 1.05, letterSpacing: 1, marginTop: 8, whiteSpace: "nowrap" }}>{T.phone}</div>
        </div>
      </div>
    </>
  );
};
