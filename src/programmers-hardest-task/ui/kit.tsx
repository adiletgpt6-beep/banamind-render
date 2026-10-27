// Графический язык фильма №35: палитра BalaGo (тёплый белый, тёмно-синий,
// жёлтые акценты), крупные карточки на светлом фоне, телефоны и
// уведомления. Весь текст — настоящий (не картинка), шрифт Nunito
// (кыргызские Ү ү, Ө ө, Ң ң), размеры рассчитаны на просмотр с телефона.
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../rig/motion";

export const C = {
  bg: "#F7F6F1",
  white: "#FFFFFF",
  navy: "#14243B",
  yellow: "#FFD34D",
  yellowSoft: "#FFF1C2",
  grey: "#8190A3",
  line: "#E4E1D8",
  ink2: "#4A5870",
  shadow: "0 26px 60px rgba(20,36,59,0.16)",
  shadowSm: "0 10px 26px rgba(20,36,59,0.14)",
} as const;

export const font = fontFamily;

export const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Появление за n кадров (0…1) с мягким выходом.
export const appear = (f: number, at: number, n = 8) => easeOut((f - at) / n);
export const fadeOut = (f: number, at: number, n = 8) => 1 - clamp((f - at) / n);

// Светлый фон графических вставок.
export const Paper: React.FC<{ readonly children?: React.ReactNode; readonly tone?: string }> = ({ children, tone }) => (
  <div style={abs({ inset: 0, backgroundColor: tone ?? C.bg, overflow: "hidden" })}>
    <div style={abs({ left: -200, top: -260, width: 760, height: 760, borderRadius: 380, backgroundColor: "rgba(255,211,77,0.10)" })} />
    <div style={abs({ right: -260, bottom: -200, width: 820, height: 820, borderRadius: 410, backgroundColor: "rgba(129,144,163,0.08)" })} />
    {children}
  </div>
);

// Белая карточка.
export const Card: React.FC<{ readonly style?: React.CSSProperties; readonly children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ backgroundColor: C.white, borderRadius: 36, boxShadow: C.shadow, fontFamily: font, color: C.navy, ...style }}>{children}</div>
);

// Значок семейного приложения: тёмно-синий квадрат, календарь, жёлтая точка.
export const AppIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", flexShrink: 0 }}>
    <rect width={100} height={100} rx={24} fill={C.navy} />
    <rect x={22} y={28} width={56} height={50} rx={9} fill="#FFFFFF" />
    <rect x={22} y={28} width={56} height={14} rx={7} fill="#C9D2DE" />
    <rect x={32} y={20} width={7} height={16} rx={3.5} fill="#FFFFFF" />
    <rect x={61} y={20} width={7} height={16} rx={3.5} fill="#FFFFFF" />
    <circle cx={64} cy={62} r={8} fill={C.yellow} />
    <rect x={31} y={52} width={20} height={6} rx={3} fill={C.grey} />
    <rect x={31} y={63} width={14} height={6} rx={3} fill={C.grey} />
  </svg>
);

// Галочка в круге (выполнено / сохранено).
export const Check: React.FC<{ readonly size: number; readonly k?: number; readonly fill?: string; readonly color?: string }> = ({ size, k = 1, fill = C.yellow, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flexShrink: 0 }}>
    <circle cx={20} cy={20} r={19 * (0.6 + 0.4 * k)} fill={fill} opacity={clamp(k * 2)} />
    <path d="M 11 21 L 17.5 27 L 29 14" fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - clamp((k - 0.3) / 0.7))} />
  </svg>
);

// Пустой чекбокс (задача ещё не выполнена).
export const EmptyBox: React.FC<{ readonly size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, border: `${Math.max(3, size * 0.09)}px solid ${C.grey}`, boxSizing: "border-box", flexShrink: 0, backgroundColor: C.white }} />
);

// Телефон (рамка) — экран внутри. x, y — левый верх, w — ширина.
export const Phone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly tilt?: number;
  readonly scale?: number;
  readonly children?: React.ReactNode;
  readonly screen?: string;
}> = ({ x, y, w, tilt = 0, scale = 1, children, screen = C.bg }) => {
  const h = w * 2.05;
  return (
    <div style={abs({ left: x, top: y, width: w, height: h, rotate: `${tilt}deg`, scale: String(scale), transformOrigin: "50% 60%", borderRadius: w * 0.13, backgroundColor: "#1B2433", boxShadow: "0 40px 80px rgba(20,36,59,0.28)", padding: w * 0.035, boxSizing: "border-box" })}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.1, backgroundColor: screen, overflow: "hidden" }}>
        {children}
        <div style={abs({ left: "50%", top: w * 0.025, width: w * 0.26, height: w * 0.055, marginLeft: -w * 0.13, borderRadius: w * 0.03, backgroundColor: "#1B2433" })} />
      </div>
    </div>
  );
};

// Строка состояния телефона.
export const StatusBar: React.FC<{ readonly time: string; readonly w: number; readonly dark?: boolean }> = ({ time, w, dark }) => (
  <div style={{ height: w * 0.1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${w * 0.08}px`, fontFamily: font, fontWeight: 800, fontSize: w * 0.04, color: dark ? C.white : C.navy }}>
    <span>{time}</span>
    <span style={{ display: "flex", gap: w * 0.012 }}>
      {[0.4, 0.6, 0.8, 1].map((k) => (
        <span key={k} style={{ width: w * 0.012, height: w * 0.03 * k, marginTop: w * 0.03 * (1 - k), backgroundColor: dark ? C.white : C.navy, borderRadius: 2, display: "inline-block" }} />
      ))}
      <span style={{ width: w * 0.06, height: w * 0.03, marginLeft: w * 0.015, border: `2px solid ${dark ? C.white : C.navy}`, borderRadius: 4, boxSizing: "border-box", display: "inline-block" }} />
    </span>
  </div>
);

// Уведомление (баннер): значок, название приложения, время, текст.
export const Notification: React.FC<{
  readonly w: number;
  readonly title: string;
  readonly body: string;
  readonly time?: string;
  readonly k?: number; // появление 0…1
  readonly app?: string;
  readonly icon?: React.ReactNode;
  readonly scale?: number; // крупнее текст (для вставок крупным планом)
}> = ({ w, title, body, time = "азыр", k = 1, app = "Күн тартиби", icon, scale = 1 }) => (
  <div
    style={{
      width: w,
      boxSizing: "border-box",
      padding: `${w * 0.045}px ${w * 0.05}px`,
      borderRadius: w * 0.07,
      backgroundColor: "rgba(255,255,255,0.97)",
      boxShadow: C.shadowSm,
      fontFamily: font,
      color: C.navy,
      opacity: clamp(k * 1.5),
      transform: `translateY(${(1 - k) * -w * 0.12}px) scale(${0.94 + 0.06 * k})`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: w * 0.03 }}>
      {icon ?? <AppIcon size={w * 0.085 * Math.min(scale, 1.3)} />}
      <div style={{ flex: 1, fontSize: w * 0.04 * Math.min(scale, 1.3), fontWeight: 800, color: C.grey }}>{app}</div>
      <div style={{ fontSize: w * 0.036 * Math.min(scale, 1.3), fontWeight: 700, color: C.grey }}>{time}</div>
    </div>
    <div style={{ fontSize: w * 0.058 * scale, fontWeight: 900, marginTop: w * 0.025, lineHeight: 1.15 }}>{title}</div>
    <div style={{ fontSize: w * 0.05 * scale, fontWeight: 700, marginTop: w * 0.012, color: C.ink2, lineHeight: 1.2 }}>{body}</div>
  </div>
);

// Короткое подтверждение («Убакыт жаңыртылды»).
export const Toast: React.FC<{ readonly text: string; readonly k: number; readonly size?: number }> = ({ text, k, size = 40 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      padding: `${size * 0.42}px ${size * 0.8}px ${size * 0.42}px ${size * 0.5}px`,
      borderRadius: size * 1.2,
      backgroundColor: C.navy,
      color: C.white,
      fontFamily: font,
      fontWeight: 800,
      fontSize: size,
      boxShadow: C.shadowSm,
      opacity: clamp(k * 1.6),
      transform: `translateY(${(1 - k) * size}px)`,
    }}
  >
    <Check size={size * 1.25} k={k} />
    {text}
  </div>
);

// Подпись дня недели: всегда одна и та же плашка в одном месте.
export const DayLabel: React.FC<{ readonly text: string; readonly f: number; readonly from?: number; readonly hold?: number }> = ({ text, f, from = 0, hold = 66 }) => {
  const k = appear(f, from, 9) * fadeOut(f, from + hold, 10);
  if (k <= 0) return null;
  return (
    <div style={abs({ left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", pointerEvents: "none" })}>
      <div
        style={{
          padding: "16px 44px",
          borderRadius: 999,
          backgroundColor: C.yellow,
          color: C.navy,
          fontFamily: font,
          fontWeight: 900,
          fontSize: 58,
          letterSpacing: 4,
          boxShadow: C.shadowSm,
          opacity: k,
          transform: `translateY(${(1 - k) * -24}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Редакционный акцент (не субтитр): короткая фраза сверху.
export const Accent: React.FC<{ readonly text: string; readonly k: number; readonly top?: number; readonly size?: number }> = ({ text, k, top = 250, size = 62 }) =>
  k <= 0 ? null : (
    <div style={abs({ left: 90, right: 90, top, display: "flex", justifyContent: "center", pointerEvents: "none" })}>
      <div
        style={{
          padding: `${size * 0.28}px ${size * 0.6}px`,
          borderRadius: size * 0.4,
          backgroundColor: C.white,
          color: C.navy,
          fontFamily: font,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.15,
          textAlign: "center",
          boxShadow: C.shadow,
          borderBottom: `${size * 0.12}px solid ${C.yellow}`,
          opacity: clamp(k * 1.4),
          transform: `translateY(${(1 - k) * 30}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );

// Указательный палец (кисть с рукавом) для касаний экрана в крупных
// вставках. (x, y) — кончик пальца; рука входит снизу справа.
export const Finger: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly sleeve: string;
  readonly skin: string;
  readonly shade: string;
  readonly press?: number; // 0…1 нажатие (палец чуть уходит в экран)
  readonly angle?: number; // наклон руки, градусы (0 — снизу вверх)
  readonly scale?: number;
}> = ({ x, y, sleeve, skin, shade, press = 0, angle = -18, scale = 1 }) => (
  <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
    <g transform={`translate(${x} ${y + press * 6}) rotate(${angle}) scale(${scale * (1 - press * 0.03)})`}>
      {/* рукав */}
      <path d="M -70 250 L -48 560 L 128 560 L 108 236 Q 20 214 -70 250 Z" fill={sleeve} />
      <path d="M -66 252 Q 20 222 106 240 L 110 278 Q 20 258 -62 290 Z" fill="rgba(0,0,0,0.12)" />
      {/* ладонь и согнутые пальцы */}
      <path d="M -54 250 Q -66 150 -30 112 L 70 104 Q 104 120 100 190 L 96 252 Q 20 232 -54 250 Z" fill={skin} stroke={shade} strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${2 + i * 30} ${126 + i * 6} q 16 -8 30 4 q 6 24 -4 40 q -18 6 -28 -6 Z`} fill={skin} stroke={shade} strokeWidth={3} />
      ))}
      {/* большой палец */}
      <path d="M -40 168 Q -78 150 -74 118 Q -64 104 -44 118 Q -26 132 -18 150 Z" fill={skin} stroke={shade} strokeWidth={3} />
      {/* указательный */}
      <path d="M -26 128 L -20 8 Q -14 -10 4 -8 Q 18 -6 20 12 L 26 124 Z" fill={skin} stroke={shade} strokeWidth={3} />
      <path d="M -10 2 Q 2 -6 12 2 L 12 16 Q 2 12 -10 16 Z" fill="#F4D7C6" opacity={0.85} />
    </g>
  </svg>
);

// Курсор мыши (стрелка).
export const Cursor: React.FC<{ readonly x: number; readonly y: number; readonly size?: number }> = ({ x, y, size = 46 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 20 28" style={abs({ left: x, top: y, pointerEvents: "none", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.25))" })}>
    <path d="M 1 1 L 1 22 L 6.5 17 L 10.5 26 L 14 24.5 L 10 15.5 L 17 15 Z" fill={C.white} stroke={C.navy} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);
