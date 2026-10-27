// Телефон мамы: поиск «Бишкек балдар мектеп каттамы», результат BalaGo и
// страница «Кантип иштейт?» (заявка → подходящая группа → первая полная
// пробная поездка бесплатно после формирования группы). Мама только
// читает — никакой мгновенно принятой заявки. Тексты кыргызча, крупные.
import { Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut } from "./rig/motion";
import { BG11_TEXT, BG11_VIDEO } from "./script";
import { C } from "./sets/Kitchen";
import { box } from "./shots";

const INK = C.ink;
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);

export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу справа (рукав маминого кардигана).
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string }> = ({ x, y, w, sleeve, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x + w * 0.62, top: y + h * 0.94, width: w * 0.62, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: "-18deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: x + w * 0.68, top: y + h * 0.84, width: w * 0.46, height: w * 0.5, borderRadius: w * 0.2, backgroundColor: skin, rotate: "-14deg" })} />
      <div style={box({ left: x + w * 0.9, top: y + h * 0.8, width: w * 0.12, height: w * 0.26, borderRadius: w * 0.06, backgroundColor: skin, rotate: "-32deg", boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x - w * 0.05, top: y + h * (0.72 + i * 0.07), width: w * 0.1, height: w * 0.11, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Палец, касающийся экрана в tapAt (подводится и уходит).
export const TapFinger: React.FC<{ x: number; y: number; f: number; tapAt: number; skin: string; hold?: number }> = ({ x, y, f, tapAt, skin, hold = 10 }) => {
  const a = interpolate(f, [tapAt - 20, tapAt - 8, tapAt + hold, tapAt + hold + 12], [0, 1, 1, 0], CL);
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [0, 1, 0], CL);
  if (a <= 0) return null;
  return (
    <div style={box({ left: x - 46 + 60 * (1 - a), top: y - 24 + 90 * (1 - a) + 10 * press, width: 92, height: 300, opacity: a })}>
      <div style={box({ left: 0, top: 0, width: 92, height: 300, borderRadius: 46, backgroundColor: skin, boxShadow: "0 18px 30px rgba(20,30,60,0.25)" })} />
      <div style={box({ left: 18, top: 14, width: 56, height: 46, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.35)" })} />
    </div>
  );
};

const Logo: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile(BG11_VIDEO.logo)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", flex: "none" }} />
);

// Поиск: строка набирается по буквам, затем появляются результаты;
// результат BalaGo подсвечивается и нажимается (tapAt).
export const SearchScreen: React.FC<{ f: number; typeFrom: number; resultsAt: number; tapAt: number }> = ({ f, typeFrom, resultsAt, tapAt }) => {
  const s = BG11_TEXT.search;
  const n = Math.round(clamp((f - typeFrom) / Math.max(1, resultsAt - typeFrom - 6)) * s.query.length);
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.96, 1], CL);
  return (
    <div style={box({ inset: 0, padding: "90px 34px 0", color: INK })}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 26px", borderRadius: 40, backgroundColor: "#FFFFFF", boxShadow: "0 6px 16px rgba(20,30,60,0.1)", fontSize: 34, fontWeight: 800 }}>
        <svg width={38} height={38} viewBox="0 0 40 40">
          <circle cx={17} cy={17} r={11} stroke="#5A6B8C" strokeWidth={5} fill="none" />
          <path d="M 26 26 L 36 36" stroke="#5A6B8C" strokeWidth={5} strokeLinecap="round" />
        </svg>
        <span>
          {s.query.slice(0, n)}
          {f < resultsAt && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: "#4C7BD9" }}>|</span> : null}
        </span>
      </div>
      {[0, 1, 2].map((i) => {
        const a = appear(f, resultsAt + i * 4, 8);
        const main = i === 0;
        return (
          <div
            key={i}
            style={{
              marginTop: 26,
              padding: "26px 28px",
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              opacity: a,
              translate: `0 ${(1 - a) * 30}px`,
              border: main ? `5px solid ${f > tapAt - 16 ? C.yellow : "#FFFFFF"}` : "5px solid #FFFFFF",
              transform: main ? `scale(${press})` : undefined,
              boxShadow: "0 6px 16px rgba(20,30,60,0.08)",
            }}
          >
            {main ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Logo size={96} />
                <div>
                  <div style={{ fontSize: 38, fontWeight: 900 }}>{s.resultTitle}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: "#5A6B8C", marginTop: 6 }}>{s.resultNote}</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ width: 380 - i * 60, height: 24, borderRadius: 12, backgroundColor: "#DCE3EE" }} />
                <div style={{ width: 300, height: 18, borderRadius: 9, backgroundColor: "#EDF1F6", marginTop: 14 }} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Значки маршрута.
export const RouteIcon: React.FC<{ kind: "home" | "school"; size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ flex: "none" }}>
    <circle cx={50} cy={50} r={48} fill={kind === "home" ? C.yellow : C.navy} />
    {kind === "home" ? (
      <path d="M 26 52 L 50 30 L 74 52 L 68 52 L 68 74 L 32 74 L 32 52 Z" fill={C.navy} />
    ) : (
      <g>
        <rect x={26} y={44} width={48} height={32} fill="#FFFFFF" />
        <path d="M 22 46 L 50 30 L 78 46 Z" fill="#FFFFFF" />
        <rect x={49} y={14} width={3} height={18} fill={C.yellow} />
        <path d="M 52 14 L 66 18 L 52 23 Z" fill={C.yellow} />
        <rect x={31} y={50} width={9} height={9} fill={C.navy} />
        <rect x={60} y={50} width={9} height={9} fill={C.navy} />
        <rect x={45} y={60} width={10} height={16} fill={C.yellow} />
      </g>
    )}
  </svg>
);

// Страница BalaGo «Кантип иштейт?»: шапка (логотип, Бишкек), маршрут и
// три шага; страница медленно прокручивается (scroll 0…1).
export const BalaGoPage: React.FC<{ f: number; from: number; scroll: number }> = ({ f, from, scroll }) => {
  const p = BG11_TEXT.page;
  const r = BG11_TEXT.route.stops;
  return (
    <div style={box({ inset: 0, color: INK })}>
      <div style={box({ left: 0, right: 0, top: -260 * scroll, padding: "80px 34px 0" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: appear(f, from) }}>
          <Logo size={110} />
          <div>
            <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{p.brand}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#5A6B8C" }}>
              {p.tagline} • {p.city}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 26, padding: "18px 10px", borderRadius: 26, backgroundColor: C.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: appear(f, from + 6), fontSize: 30, fontWeight: 900 }}>
          <RouteIcon kind="home" size={58} />
          <span>{r[0]}</span>
          <span style={{ color: "#B98A00" }}>→</span>
          <RouteIcon kind="school" size={58} />
          <span>{r[1]}</span>
          <span style={{ color: "#B98A00" }}>→</span>
          <RouteIcon kind="home" size={58} />
          <span>{r[2]}</span>
        </div>
        <div style={{ marginTop: 30, fontSize: 46, fontWeight: 900, opacity: appear(f, from + 10) }}>{p.how}</div>
        {p.steps.map((st, i) => {
          const a = appear(f, from + 16 + i * 10);
          return (
            <div key={st.title} style={{ marginTop: 18, padding: "22px 24px", borderRadius: 26, backgroundColor: "#FFFFFF", display: "flex", gap: 20, alignItems: "center", opacity: a, translate: `0 ${(1 - a) * 24}px`, boxShadow: "0 6px 16px rgba(20,30,60,0.08)" }}>
              <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 38, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1 }}>{st.title}</div>
                <div style={{ fontSize: 27, fontWeight: 700, color: "#5A6B8C", marginTop: 4 }}>{st.note}</div>
              </div>
              {"badge" in st ? <div style={{ padding: "8px 16px", borderRadius: 999, backgroundColor: "#E8F6EC", color: "#1F7A45", fontSize: 26, fontWeight: 900 }}>{st.badge}</div> : null}
            </div>
          );
        })}
      </div>
      {/* лёгкая подсветка при чтении */}
      <div style={box({ left: 0, right: 0, top: 0, height: 4, backgroundColor: C.yellow, opacity: easeInOut(scroll) })} />
    </div>
  );
};
