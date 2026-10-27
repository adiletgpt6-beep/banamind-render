// Телефон крупным планом: корпус, рука, палец, строка состояния, значки
// маршрута и экраны сцены «решение»: поиск → форма сайта BalaGo (поля
// как на сайте) → WhatsApp с подготовленным сайтом сообщением, которое
// мама отправляет САМА. После отправки — только серая галочка «отправлено»
// мессенджера: никакого «заявка принята» от сервиса.
// Экраны рисуются на макете 520×1100 и масштабируются под корпус.
import { Img, interpolate, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { clamp, easeOut } from "./rig/motion";
import { BG45_TEXT, BG45_VIDEO } from "./script";
import { box } from "./shots";

const INK = "#1E2235";
export const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const SCREEN_W = 520;
export const SCREEN_H = 1100;

export const StatusBar: React.FC<{ time: string; light?: boolean }> = ({ time, light }) => (
  <div style={box({ left: 44, right: 44, top: 22, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, color: light ? "#FFFFFF" : INK })}>
    <span>{time}</span>
    <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {[10, 16, 22].map((h) => (
        <span key={h} style={{ width: 8, height: h, borderRadius: 2, backgroundColor: light ? "#FFFFFF" : INK }} />
      ))}
      <span style={{ marginLeft: 8, width: 40, height: 20, borderRadius: 5, border: `3px solid ${light ? "#FFFFFF" : INK}`, boxSizing: "border-box" }} />
    </span>
  </div>
);

// Корпус телефона; содержимое — макет 520×1100, вписанный в экран.
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, children }) => {
  const h = w * 2.05;
  const inset = w * 0.035;
  const iw = w - 2 * inset;
  const ih = h - 2 * inset;
  const k = Math.min(iw / SCREEN_W, ih / SCREEN_H);
  return (
    <div style={box({ left: x, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: inset, top: inset, width: iw, height: ih, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>
        <div style={box({ left: (iw - SCREEN_W * k) / 2, top: 0, width: SCREEN_W, height: ih / k, transform: `scale(${k})`, transformOrigin: "0 0" })}>{children}</div>
      </div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: рукав, ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string }> = ({ x, y, w, sleeve, skin }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: x + w * 0.56, top: y + h * 1.07, width: w * 0.62, height: h * 0.6, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: "-18deg", transformOrigin: "50% 0%" })} />
      <div style={box({ left: x + w * 0.58, top: y + h * 0.985, width: w * 0.46, height: w * 0.42, borderRadius: w * 0.2, backgroundColor: skin, rotate: "-10deg" })} />
      <div style={box({ left: x + w * 0.965, top: y + h * 0.62, width: w * 0.1, height: w * 0.24, borderRadius: w * 0.05, backgroundColor: skin, rotate: "-8deg", boxShadow: "-3px 4px 8px rgba(20,30,60,0.18)" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: x - w * 0.05, top: y + h * (0.72 + i * 0.07), width: w * 0.1, height: w * 0.11, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Палец, нажимающий на экран (x, y — точка касания в кадре), в tapAt — касание.
// lead/tail — сколько кадров палец появляется до касания и уходит после (> 7 и > 9).
export const TapFinger: React.FC<{ x: number; y: number; f: number; tapAt: number; skin: string; lead?: number; tail?: number }> = ({ x, y, f, tapAt, skin, lead = 20, tail = 20 }) => {
  const a = interpolate(f, [tapAt - lead, tapAt - 7, tapAt + 9, tapAt + tail], [0, 1, 1, 0], CL);
  const press = interpolate(f, [tapAt - 4, tapAt, tapAt + 6], [0, 1, 0], CL);
  if (a <= 0) return null;
  return (
    <div style={box({ left: x - 40 + 70 * (1 - a), top: y - 18 + 90 * (1 - a) + 8 * press, width: 84, height: 280, opacity: clamp(a * 4), rotate: "-12deg", transformOrigin: "50% 0%" })}>
      <div style={box({ left: 0, top: 0, width: 80, height: 280, borderRadius: 40, backgroundColor: skin, boxShadow: "0 18px 30px rgba(20,30,60,0.25)" })} />
      <div style={box({ left: 16, top: 12, width: 48, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.35)" })} />
    </div>
  );
};

// Круг касания на экране (в координатах макета).
const Ripple: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const t = (f - at) / 12;
  if (t < 0 || t > 1) return null;
  return <div style={box({ left: x - 60 * t - 20, top: y - 60 * t - 20, width: 40 + 120 * t, height: 40 + 120 * t, borderRadius: 999, backgroundColor: "rgba(20,40,90,0.15)", opacity: 1 - t })} />;
};

export const RouteIcon: React.FC<{ kind: "home" | "school"; size: number }> = ({ kind, size }) => (
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

const Tick: React.FC<{ size: number; color: string; double?: boolean }> = ({ size, color, double }) => (
  <svg width={size * (double ? 1.4 : 1)} height={size} viewBox={`0 0 ${double ? 34 : 24} 24`}>
    <path d="M 3 13 L 9 19 L 21 5" stroke={color} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {double ? <path d="M 13 19 L 31 5" stroke={color} strokeWidth={3.2} fill="none" strokeLinecap="round" /> : null}
  </svg>
);

// ---------- 1. Поиск ----------
export const SearchScreen: React.FC<{ f: number; typeFrom: number; tapAt: number }> = ({ f, typeFrom, tapAt }) => {
  const t = BG45_TEXT.decide;
  const n = Math.round(clamp((f - typeFrom) / 10) * t.query.length);
  const typed = t.query.slice(0, n);
  const done = typeFrom + 10;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.96, 1], CL);
  return (
    <div style={box({ left: 0, top: 0, width: SCREEN_W, height: SCREEN_H, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="15:10" />
      <div style={box({ left: 24, right: 24, top: 88, height: 88, borderRadius: 44, backgroundColor: "#F0F3F8", border: "3px solid #DCE3EE", display: "flex", alignItems: "center", gap: 14, padding: "0 22px", boxSizing: "border-box" })}>
        <svg width={40} height={40} viewBox="0 0 40 40">
          <circle cx={17} cy={17} r={11} stroke={C.muted} strokeWidth={4} fill="none" />
          <path d="M 25 25 L 35 35" stroke={C.muted} strokeWidth={4} strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 33, fontWeight: 800, color: INK }}>
          {typed}
          <span style={{ opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: C.navy }}>|</span>
        </span>
      </div>
      {/* результат: сайт BalaGo */}
      <div style={box({ left: 24, right: 24, top: 206, padding: 22, borderRadius: 28, backgroundColor: "#FFFFFF", border: `4px solid ${f >= tapAt - 2 ? C.yellow : "#E3E8F0"}`, boxShadow: "0 12px 28px rgba(20,40,90,0.12)", opacity: appear(f, done, 8), translate: `0 ${(1 - appear(f, done, 8)) * 30}px`, scale: `${press}`, display: "flex", gap: 18, alignItems: "center" })}>
        <Img src={staticFile(BG45_VIDEO.logo)} style={{ width: 104, height: 104, borderRadius: 52, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 31, fontWeight: 900, color: C.navy, lineHeight: 1.12 }}>{t.result}</span>
          <span style={{ fontSize: 27, fontWeight: 800, color: C.muted }}>{t.resultSub}</span>
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 24, right: 24, top: 430 + i * 136, height: 110, borderRadius: 24, backgroundColor: "#F4F6FA", opacity: 0.8 * appear(f, done + 4 + i * 3, 8) })}>
          <div style={box({ left: 24, top: 26, width: 320 - i * 50, height: 20, borderRadius: 10, backgroundColor: "#DCE3EE" })} />
          <div style={box({ left: 24, top: 62, width: 230 + i * 30, height: 16, borderRadius: 8, backgroundColor: "#E6EBF2" })} />
        </div>
      ))}
      <Ripple f={f} at={tapAt} x={260} y={290} />
    </div>
  );
};

// ---------- 2. Форма сайта: поля заполняются на словах мамы ----------
export const FORM_BUTTON = { x: 260, y: 990 } as const;
export const CONSENT_BOX = { x: 43, y: 869 } as const;

const Check: React.FC<{ size: number; a?: number }> = ({ size, a = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ opacity: a, flexShrink: 0 }}>
    <circle cx={20} cy={20} r={19} fill={C.green} />
    <path d="M 11 21 L 17 27 L 29 13" stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Форма сайта (прокручена к адресу и времени): обязательные поля
// «Ата-эненин аты», «Телефон», «Баланын аты», «Баланын жашы» уже
// заполнены; дарек, бара турган жер и время вписываются на словах мамы;
// согласие отмечается, затем — «Арыз калтыруу».
export const FormScreen: React.FC<{ f: number; fills: readonly number[]; checkAt: number; tapAt: number }> = ({ f, fills, checkAt, tapAt }) => {
  const t = BG45_TEXT.decide;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL);
  const agree = appear(f, checkAt + 1, 3);
  return (
    <div style={box({ left: 0, top: 0, width: SCREEN_W, height: SCREEN_H, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="15:11" />
      <div style={box({ left: 0, right: 0, top: 70, height: 96, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", backgroundColor: C.yellowSoft })}>
        <Img src={staticFile(BG45_VIDEO.logo)} style={{ width: 72, height: 72, borderRadius: 36, objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: C.navy, lineHeight: 1 }}>BalaGo</span>
          <span style={{ fontSize: 23, fontWeight: 800, color: C.muted }}>{t.formSub}</span>
        </div>
      </div>
      <div style={box({ left: 26, right: 26, top: 180, fontSize: 28, fontWeight: 900, color: C.navy, whiteSpace: "nowrap" })}>{t.formTitle}</div>
      {/* уже заполненные обязательные поля */}
      <div style={box({ left: 26, right: 26, top: 228, display: "flex", flexWrap: "wrap", gap: 8 })}>
        {t.filled.map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 14, backgroundColor: "#F1F4F8", fontSize: 20, fontWeight: 800, color: C.muted }}>
            <Check size={20} />
            {k}
          </div>
        ))}
      </div>
      {t.fields.map((fl, i) => {
        const at = fills[i] ?? 1e9;
        const shown = clamp((f - at) / 10);
        const n = Math.round(shown * fl.v.length);
        const active = f >= at - 4 && f < at + 18;
        return (
          <div key={fl.k} style={box({ left: 26, right: 26, top: 330 + i * 128 })}>
            <div style={{ fontSize: 23, fontWeight: 800, color: C.muted, marginBottom: 5 }}>{fl.k}</div>
            <div style={{ height: 70, borderRadius: 18, border: `4px solid ${active ? C.yellow : "#DCE3EE"}`, backgroundColor: active ? "#FFFCEF" : "#F8FAFD", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0 18px", boxSizing: "border-box" }}>
              <span style={{ fontSize: 29, fontWeight: 900, color: INK, whiteSpace: "nowrap" }}>{fl.v.slice(0, n)}</span>
              {f >= checkAt && shown >= 1 ? <Check size={36} a={appear(f, checkAt + i * 2, 6)} /> : null}
            </div>
          </div>
        );
      })}
      {/* согласие на обработку данных (обязательное на сайте) */}
      <div style={box({ left: 26, right: 26, top: 852, display: "flex", gap: 12, alignItems: "flex-start" })}>
        <div style={{ width: 34, height: 34, borderRadius: 8, border: `4px solid ${agree > 0.5 ? C.green : "#B8C4D6"}`, backgroundColor: agree > 0.5 ? C.green : "#FFFFFF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
          {agree > 0.5 ? (
            <svg width={22} height={22} viewBox="0 0 40 40">
              <path d="M 8 21 L 16 29 L 32 11" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
        <span style={{ fontSize: 19, fontWeight: 700, color: C.muted, lineHeight: 1.25 }}>{t.consent}</span>
      </div>
      <div style={box({ left: 26, right: 26, top: FORM_BUTTON.y - 44, height: 88, borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", scale: `${press}`, boxShadow: "0 10px 0 #E0A800, 0 18px 30px rgba(255,201,14,0.35)" })}>{t.apply}</div>
      <div style={box({ left: 0, right: 0, top: FORM_BUTTON.y + 58, textAlign: "center", fontSize: 24, fontWeight: 800, color: C.muted })}>{t.toWhatsApp}</div>
      <Ripple f={f} at={checkAt + 1} x={CONSENT_BOX.x} y={CONSENT_BOX.y} />
      <Ripple f={f} at={tapAt} x={FORM_BUTTON.x + 195} y={FORM_BUTTON.y + 10} />
    </div>
  );
};

// ---------- 3. WhatsApp: подготовленное сообщение, мама сама жмёт «отправить» ----------
export const SEND_BUTTON = { x: 466, y: 1024 } as const;

export const WhatsAppScreen: React.FC<{ f: number; sendAt: number }> = ({ f, sendAt }) => {
  const t = BG45_TEXT.decide;
  const sent = f >= sendAt + 2;
  const fly = appear(f, sendAt + 2, 10);
  const press = interpolate(f, [sendAt - 3, sendAt, sendAt + 6], [1, 0.88, 1], CL);
  const lines = t.message;
  return (
    <div style={box({ left: 0, top: 0, width: SCREEN_W, height: SCREEN_H, backgroundColor: "#EFE8DC" })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 196, backgroundColor: "#1F7A55" })} />
      <StatusBar time="15:12" light />
      <div style={box({ left: 20, right: 20, top: 80, height: 104, display: "flex", alignItems: "center", gap: 16 })}>
        <svg width={30} height={40} viewBox="0 0 30 40">
          <path d="M 22 6 L 8 20 L 22 34" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Img src={staticFile(BG45_VIDEO.logo)} style={{ width: 78, height: 78, borderRadius: 39, objectFit: "cover", border: "3px solid #FFFFFF" }} />
        <div style={{ display: "flex", flexDirection: "column", color: "#FFFFFF" }}>
          <span style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.05 }}>{t.chat}</span>
          <span style={{ fontSize: 25, fontWeight: 700, opacity: 0.9 }}>{t.chatNumber}</span>
        </div>
      </div>
      {/* отправленное сообщение (после нажатия мамы) */}
      {sent ? (
        <div style={box({ right: 16, top: 220 + (1 - fly) * 380, width: 476, padding: "16px 18px 10px", borderRadius: "26px 6px 26px 26px", backgroundColor: "#DCF4CF", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", opacity: Math.min(1, fly * 2) })}>
          {lines.map((l, i) => (
            <div key={i} style={{ fontSize: 25, fontWeight: i === 0 ? 800 : 700, color: "#1E2B22", lineHeight: 1.25, marginBottom: i === 0 || i === lines.length - 3 ? 6 : 1 }}>{l}</div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 6, fontSize: 22, fontWeight: 700, color: "#6B7C70" }}>
            15:12 <Tick size={22} color="#8A979F" />
          </div>
        </div>
      ) : null}
      {/* поле ввода с текстом, подготовленным сайтом */}
      <div style={box({ left: 14, right: 100, bottom: 30, minHeight: 90, maxHeight: 760, padding: sent ? "26px 24px" : "18px 20px", borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", boxSizing: "border-box" })}>
        {sent ? (
          <span style={{ fontSize: 30, fontWeight: 700, color: "#A0A8B2" }}>…</span>
        ) : (
          lines.map((l, i) => (
            <div key={i} style={{ fontSize: 20, fontWeight: 700, color: "#25303A", lineHeight: 1.24 }}>{l}</div>
          ))
        )}
      </div>
      <div style={box({ left: SEND_BUTTON.x - 42, top: SEND_BUTTON.y - 42, width: 84, height: 84, borderRadius: 42, backgroundColor: "#1F9D63", display: "flex", alignItems: "center", justifyContent: "center", scale: `${press}`, boxShadow: f < sendAt ? `0 0 0 ${8 + 6 * Math.sin(f / 4)}px rgba(31,157,99,0.25)` : undefined })}>
        <svg width={44} height={44} viewBox="0 0 44 44">
          <path d="M 6 22 L 38 8 L 28 38 L 22 25 Z" fill="#FFFFFF" />
        </svg>
      </div>
      <Ripple f={f} at={sendAt} x={SEND_BUTTON.x} y={SEND_BUTTON.y} />
    </div>
  );
};

// ---------- Неделя в календаре ноутбука: «Мектеп» каждый день среди встреч ----------
export const WeekCalendar: React.FC<{ f: number; closeAt: number }> = ({ f, closeAt }) => {
  const t = BG45_TEXT.decide;
  const shut = clamp((f - closeAt) / 8);
  const cursor = { x: interpolate(f, [closeAt - 30, closeAt - 6], [120, 240], CL), y: interpolate(f, [closeAt - 30, closeAt - 6], [120, 12], CL) };
  return (
    <div style={box({ left: 0, top: 0, width: 260, height: 166, background: "linear-gradient(135deg, #BFD8F2, #FFF1C9)", fontFamily })}>
      <div style={box({ left: 4, top: 4, width: 252, height: 158, borderRadius: 6, backgroundColor: "#FFFFFF", boxShadow: "0 4px 10px rgba(20,40,90,0.15)", transform: `scale(${1 - 0.85 * shut})`, opacity: 1 - shut, transformOrigin: "100% 0%" })}>
        <div style={box({ left: 0, top: 0, right: 0, height: 18, borderRadius: "6px 6px 0 0", backgroundColor: C.navy })} />
        <div style={box({ left: 8, top: 2, fontSize: 11, fontWeight: 900, color: "#FFFFFF" })}>{t.week}</div>
        <div style={box({ right: 6, top: 3, width: 12, height: 12, borderRadius: 6, backgroundColor: f >= closeAt - 4 ? "#E25B4E" : "#7A8AA8", color: "#FFFFFF", fontSize: 10, lineHeight: "12px", textAlign: "center", fontWeight: 900 })}>×</div>
        {t.days.map((d, i) => (
          <div key={d} style={box({ left: 6 + i * 49, top: 22, width: 46, height: 132 })}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.navy, textAlign: "center" }}>{d}</div>
            <div style={box({ left: 0, top: 16, width: 46, height: 30, borderRadius: 4, backgroundColor: "#C9D6EE", fontSize: 8, fontWeight: 800, color: C.navy, textAlign: "center", lineHeight: "30px" })}>{t.meeting}</div>
            <div style={box({ left: 0, top: 50 + (i % 2) * 4, width: 46, height: 38, borderRadius: 4, backgroundColor: C.yellow, border: "2px solid #E0A800", boxSizing: "border-box", fontSize: 8, fontWeight: 900, color: C.navy, textAlign: "center", paddingTop: 4, scale: `${1 + 0.22 * Math.sin(Math.PI * clamp((f - (closeAt - 40 + i * 6)) / 12)) * (1 - shut)}`, boxShadow: `0 0 0 ${3 * Math.sin(Math.PI * clamp((f - (closeAt - 40 + i * 6)) / 12))}px #E25B4E` })}>
              12:40
              <br />
              {t.school}
            </div>
            <div style={box({ left: 0, top: 94, width: 46, height: 30, borderRadius: 4, backgroundColor: "#D7E8DA", fontSize: 8, fontWeight: 800, color: C.navy, textAlign: "center", lineHeight: "30px" })}>{t.meeting}</div>
          </div>
        ))}
      </div>
      {/* курсор мыши */}
      {shut < 1 ? (
        <svg width={16} height={20} viewBox="0 0 16 20" style={box({ left: cursor.x, top: cursor.y })}>
          <path d="M 1 1 L 1 16 L 5 12 L 8 19 L 11 18 L 8 11 L 14 11 Z" fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
        </svg>
      ) : null}
    </div>
  );
};

// Условная неделя: время школы отмечено как «Каттам» — путь спланирован
// заранее (иллюстрация к «жолду алдын ала пландоо»; правая половина
// подписана «шарттуу мисал»).
export const PlannedWeek: React.FC = () => {
  const t = BG45_TEXT.decide;
  return (
    <div style={box({ left: 0, top: 0, width: 260, height: 166, background: "linear-gradient(135deg, #BFD8F2, #FFF1C9)", fontFamily })}>
      <div style={box({ left: 4, top: 4, width: 252, height: 158, borderRadius: 6, backgroundColor: "#FFFFFF", boxShadow: "0 4px 10px rgba(20,40,90,0.15)" })}>
        <div style={box({ left: 0, top: 0, right: 0, height: 18, borderRadius: "6px 6px 0 0", backgroundColor: C.navy })} />
        <div style={box({ left: 8, top: 2, fontSize: 11, fontWeight: 900, color: "#FFFFFF" })}>{t.week}</div>
        {t.days.map((d, i) => (
          <div key={d} style={box({ left: 6 + i * 49, top: 22, width: 46, height: 132 })}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.navy, textAlign: "center" }}>{d}</div>
            <div style={box({ left: 0, top: 16, width: 46, height: 30, borderRadius: 4, backgroundColor: "#C9D6EE", fontSize: 8, fontWeight: 800, color: C.navy, textAlign: "center", lineHeight: "30px" })}>{t.meeting}</div>
            <div style={box({ left: 0, top: 52, width: 46, height: 34, borderRadius: 4, backgroundColor: "#DDF1E3", border: "2px solid #9ACFAE", boxSizing: "border-box", fontSize: 8, fontWeight: 900, color: "#1F6B43", textAlign: "center", paddingTop: 5 })}>
              {t.planned}
            </div>
            <div style={box({ left: 0, top: 94, width: 46, height: 30, borderRadius: 4, backgroundColor: "#D7E8DA", fontSize: 8, fontWeight: 800, color: C.navy, textAlign: "center", lineHeight: "30px" })}>{t.meeting}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Шаги решения над телефоном: «Издөө → так маалымат → өзү жөнөтүү».
export const StepsBar: React.FC<{ f: number; at: readonly number[]; y?: number }> = ({ f, at, y = 262 }) => {
  const steps = BG45_TEXT.decide.steps;
  return (
    <div style={box({ left: 30, right: 30, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily })}>
      {steps.map((s, i) => {
        const on = appear(f, at[i], 8);
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: "10px 20px 12px", borderRadius: 999, fontSize: 32, fontWeight: 900, whiteSpace: "nowrap", backgroundColor: on > 0.5 ? C.yellow : "#FFFFFF", color: C.navy, border: `3px solid ${on > 0.5 ? "#E0A800" : "#DCE3EE"}`, opacity: 0.45 + 0.55 * on, scale: `${1 + 0.08 * Math.sin(Math.PI * clamp((f - at[i]) / 10))}` }}>{s}</div>
            {i < steps.length - 1 ? <span style={{ fontSize: 34, fontWeight: 900, color: C.navy, opacity: 0.5 + 0.5 * on }}>→</span> : null}
          </div>
        );
      })}
    </div>
  );
};
