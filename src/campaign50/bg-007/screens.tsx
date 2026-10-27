// Экран телефона папы: страница BalaGo с отдельным маршрутом
// ҮЙ → МЕКТЕП → ҮЙ и этапы начала: заявка → подбор совместимой группы
// → первая бесплатная полная пробная поездка (после формирования группы).
// Тексты кыргызча, крупные, на экране достаточно долго для чтения.
import { Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./calendar";
import { clamp, easeOut } from "./rig/motion";
import { BG7_TEXT, BG7_VIDEO } from "./script";
import { box } from "./shots";

const INK = "#1E2235";
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div style={box({ left: 44, right: 44, top: 26, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: рукав, ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string }> = ({ x, y, w, sleeve, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x + w * 0.66, top: y + h * 0.95, width: w * 0.62, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: "-18deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: x + w * 0.7, top: y + h * 0.84, width: w * 0.46, height: w * 0.5, borderRadius: w * 0.2, backgroundColor: skin, rotate: "-14deg" })} />
      <div style={box({ left: x + w * 0.9, top: y + h * 0.8, width: w * 0.12, height: w * 0.26, borderRadius: w * 0.06, backgroundColor: skin, rotate: "-32deg", boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x - w * 0.05, top: y + h * (0.72 + i * 0.07), width: w * 0.1, height: w * 0.11, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Палец, нажимающий на экран (тень и лёгкое касание в момент tapAt).
export const TapFinger: React.FC<{ x: number; y: number; f: number; tapAt: number; skin: string }> = ({ x, y, f, tapAt, skin }) => {
  const a = interpolate(f, [tapAt - 22, tapAt - 8, tapAt + 10, tapAt + 22], [0, 1, 1, 0], CL);
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [0, 1, 0], CL);
  if (a <= 0) return null;
  return (
    <div style={box({ left: x - 50 + 60 * (1 - a), top: y - 30 + 80 * (1 - a) + 10 * press, width: 100, height: 300, opacity: a })}>
      <div style={box({ left: 0, top: 0, width: 92, height: 300, borderRadius: 46, backgroundColor: skin, boxShadow: "0 18px 30px rgba(20,30,60,0.25)" })} />
      <div style={box({ left: 18, top: 14, width: 56, height: 46, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.35)" })} />
    </div>
  );
};

const RouteIcon: React.FC<{ kind: "home" | "school"; size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={48} fill={kind === "home" ? C.yellow : C.navy} />
    {kind === "home" ? (
      <path d="M 26 52 L 50 30 L 74 52 L 68 52 L 68 74 L 32 74 L 32 52 Z" fill={C.navy} />
    ) : (
      <g fill="#FFFFFF">
        <path d="M 24 46 L 50 28 L 76 46 Z" />
        <rect x={30} y={46} width={40} height={28} />
        <rect x={45} y={58} width={10} height={16} fill={C.navy} />
      </g>
    )}
  </svg>
);

// Страница BalaGo: Бишкек, маршрут ҮЙ → МЕКТЕП → ҮЙ отдельной линией.
export const BalaGoScreen: React.FC<{ f: number; tapAt: number }> = ({ f, tapAt }) => {
  const p = BG7_TEXT.phone;
  const route = clamp((f - 16) / 40);
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.94, 1], CL);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="21:04" />
      <div style={box({ left: 0, right: 0, top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: appear(f, 0, 8) })}>
        <Img src={staticFile(BG7_VIDEO.logo)} style={{ width: 180, height: 180, borderRadius: 90, objectFit: "cover" }} />
        <div style={{ fontSize: 76, fontWeight: 900, color: C.navy }}>{p.brand}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#5A6B8C" }}>{p.tagline}</div>
        <div style={{ marginTop: 6, padding: "6px 26px", borderRadius: 999, backgroundColor: "#EAF0FA", fontSize: 36, fontWeight: 900, color: C.navy }}>📍 {p.city}</div>
      </div>
      <div style={box({ left: 34, right: 34, top: 560, height: 210, borderRadius: 30, backgroundColor: C.yellowSoft, opacity: appear(f, 8, 10) })}>
        <svg width="100%" height="100%" viewBox="0 0 560 210" style={box({ inset: 0 })}>
          <path d="M 80 74 L 480 74" stroke={C.navy} strokeWidth={6} strokeDasharray="14 12" fill="none" opacity={0.25} />
          <path d={`M 80 74 L ${80 + 400 * route} 74`} stroke={C.navy} strokeWidth={6} fill="none" />
        </svg>
        {(["home", "school", "home"] as const).map((k, i) => (
          <div key={i} style={box({ left: 26 + i * 200, top: 22, width: 108, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 + 0.65 * clamp(route * 2.2 - i * 0.6 + 0.2) })}>
            <RouteIcon kind={k} size={100} />
            <div style={{ fontSize: 32, fontWeight: 900, color: C.navy }}>{p.route[i]}</div>
          </div>
        ))}
      </div>
      <div style={box({ left: 34, right: 34, top: 810, display: "flex", gap: 14, opacity: appear(f, 30, 10) })}>
        <Chip text={`☀ ${BG7_TEXT.schoolTimes.am}`} />
        <Chip text={`🏫 ${BG7_TEXT.schoolTimes.pm}`} />
      </div>
      <div style={box({ left: 34, right: 34, top: 950, padding: "30px 0", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontSize: 44, fontWeight: 900, textAlign: "center", scale: `${press}`, boxShadow: "0 10px 24px rgba(255,201,14,0.4)", opacity: appear(f, 40, 10) })}>{p.open}</div>
    </div>
  );
};
const Chip: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ flex: 1, padding: "18px 0", borderRadius: 22, backgroundColor: "#EAF0FA", color: C.navy, fontSize: 38, fontWeight: 900, textAlign: "center" }}>{text}</div>
);

// Этапы: 1 — адрес и время (заявка), 2 — подбор группы (идёт поиск),
// 3 — первая полная пробная поездка бесплатно (после формирования группы).
export const StepsScreen: React.FC<{ f: number; at: readonly [number, number, number]; tapAt: number }> = ({ f, at, tapAt }) => {
  const t = BG7_TEXT.steps;
  const sent = appear(f, tapAt + 4, 10);
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.94, 1], CL);
  const card = (i: number): React.CSSProperties => ({
    position: "absolute",
    left: 30,
    right: 30,
    top: 176 + i * 312,
    height: 290,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    border: `4px solid ${i === 2 ? C.yellow : "#DCE3EE"}`,
    opacity: appear(f, at[i], 10),
    translate: `0 ${(1 - appear(f, at[i], 10)) * 40}px`,
    padding: "24px 26px",
    boxSizing: "border-box",
    boxShadow: "0 10px 26px rgba(20,40,90,0.08)",
  });
  const num = (i: number, done: boolean) => (
    <div style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, backgroundColor: done ? C.green : i === 2 ? C.yellow : C.navy, color: i === 2 && !done ? C.navy : "#FFFFFF", fontSize: 38, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{done ? "✓" : i + 1}</div>
  );
  const seats = clamp((f - at[1] - 6) / 50);
  const spin = (f / 30) * 360;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA" })}>
      <StatusBar time="21:06" />
      <div style={box({ left: 34, right: 34, top: 92, display: "flex", alignItems: "center", gap: 16 })}>
        <Img src={staticFile(BG7_VIDEO.logo)} style={{ width: 76, height: 76, borderRadius: 38, objectFit: "cover" }} />
        <div style={{ fontSize: 46, fontWeight: 900, color: C.navy }}>{t.title}</div>
      </div>
      {/* 1. заявка */}
      <div style={card(0)}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {num(0, sent > 0.5)}
          <div style={{ fontSize: 40, fontWeight: 900, color: INK }}>{t.items[0].title}</div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Field text="📍 Үй • Мектеп" a={appear(f, at[0] + 8, 10)} />
          <Field text={`⏰ ${BG7_TEXT.schoolTimes.am} • ${BG7_TEXT.schoolTimes.pm}`} a={appear(f, at[0] + 16, 10)} />
        </div>
        <div style={{ position: "relative", marginTop: 20, height: 70 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", scale: `${press}`, opacity: 1 - sent }}>{t.send}</div>
          <div style={{ position: "absolute", inset: 0, borderRadius: 999, backgroundColor: "#E7F4EC", color: C.green, fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: sent }}>✓ {t.sent}</div>
        </div>
      </div>
      {/* 2. совместимая группа: идёт поиск */}
      <div style={card(1)}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {num(1, false)}
          <div style={{ fontSize: 40, fontWeight: 900, color: INK }}>{t.items[1].title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
          {[0, 1, 2, 3].map((k) => {
            const on = k === 0 ? 1 : clamp(seats * 3 - (k - 1));
            const dashed = k === 3;
            return (
              <div key={k} style={{ width: 70, height: 70, borderRadius: 35, border: `4px ${dashed ? "dashed" : "solid"} ${C.navy}`, backgroundColor: dashed ? "transparent" : `rgba(255,201,14,${on})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, opacity: dashed ? 0.55 : 0.4 + 0.6 * on }}>
                {dashed ? "" : "🧒"}
              </div>
            );
          })}
          <div style={{ marginLeft: 8, width: 44, height: 44, borderRadius: 22, border: `6px solid #DCE3EE`, borderTopColor: C.navy, rotate: `${spin}deg` }} />
        </div>
        <div style={{ marginTop: 16, fontSize: 32, fontWeight: 800, color: "#3A4F80" }}>{t.items[1].note}</div>
      </div>
      {/* 3. первая полная пробная поездка — бесплатно, после формирования группы */}
      <div style={card(2)}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {num(2, false)}
          <div style={{ fontSize: 38, fontWeight: 900, color: INK, lineHeight: 1.1 }}>{t.items[2].title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
          <div style={{ padding: "8px 26px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontSize: 36, fontWeight: 900 }}>{t.items[2].badge}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#3A4F80", whiteSpace: "nowrap" }}>{BG7_TEXT.lane.route}</div>
        </div>
        <div style={{ marginTop: 14, fontSize: 30, fontWeight: 800, color: "#5A6B8C" }}>⏳ {t.items[2].note}</div>
      </div>
    </div>
  );
};
const Field: React.FC<{ text: string; a: number }> = ({ text, a }) => (
  <div style={{ flex: 1, padding: "14px 10px", borderRadius: 18, border: "3px solid #DCE3EE", backgroundColor: "#F8FAFD", color: INK, fontSize: 30, fontWeight: 800, textAlign: "center", opacity: 0.25 + 0.75 * a, whiteSpace: "nowrap" }}>{text}</div>
);
