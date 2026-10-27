// Бумага: стол сверху, лист, печатный текст (Nunito), «почерк» мамы
// (Caveat: буквы появляются под пером по одной, с лёгким естественным
// разбросом), линии пером, галочка.
import { box } from "../context";
import { fontFamily } from "../../../fonts";
import { handFamily } from "./fonts";
import { measure } from "./metrics";
import { C, paperShadow } from "./theme";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Деревянная столешница сверху (вид сверху для макропланов).
export const DeskTop: React.FC<{ readonly w?: number; readonly h?: number; readonly x?: number; readonly y?: number }> = ({ w = 1700, h = 2700, x = -310, y = -390 }) => (
  <div style={box({ left: x, top: y, width: w, height: h, background: `linear-gradient(160deg, #E8CBA4 0%, ${C.wood} 55%, #CBA27A 100%)` })}>
    <div style={box({ inset: 0, backgroundImage: `repeating-linear-gradient(8deg, ${C.woodGrain} 0 2px, transparent 2px 46px), repeating-linear-gradient(8deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 23px)` })} />
    {/* мягкий свет от окна слева сверху */}
    <div style={box({ inset: 0, background: "radial-gradient(ellipse at 20% 15%, rgba(255,250,235,0.45) 0%, rgba(255,250,235,0) 55%)" })} />
  </div>
);

// Лист бумаги: (x, y) — левый верхний угол, rot — наклон вокруг центра.
export const Sheet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly rot?: number;
  readonly lines?: "ruled" | "none";
  readonly children?: React.ReactNode;
  readonly lift?: number; // 0…1 — лист приподнят (тень больше)
  readonly tint?: string;
}> = ({ x, y, w, h, rot = 0, lines = "ruled", children, lift = 0, tint }) => (
  <div
    style={box({
      left: x,
      top: y,
      width: w,
      height: h,
      rotate: `${rot}deg`,
      backgroundColor: tint ?? C.paper,
      borderRadius: 6,
      boxShadow: lift > 0 ? `0 ${18 + 34 * lift}px ${40 + 50 * lift}px rgba(60,40,20,${0.22 + 0.1 * lift}), 0 3px 8px rgba(60,40,20,0.12)` : paperShadow,
      overflow: "hidden",
    })}
  >
    {lines === "ruled" ? (
      <>
        <div style={box({ inset: 0, backgroundImage: `repeating-linear-gradient(180deg, transparent 0 69px, ${C.paperLine} 69px 72px)`, backgroundPosition: "0 22px" })} />
        <div style={box({ left: 96, top: 0, bottom: 0, width: 3, backgroundColor: "rgba(232,105,95,0.32)" })} />
      </>
    ) : null}
    <div style={box({ inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0) 55%, rgba(190,175,150,0.16) 100%)" })} />
    {children}
  </div>
);

// Печатная строка (Nunito) с маркером и зачёркиванием.
export const Print: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly size?: number;
  readonly color?: string;
  readonly bold?: boolean;
  readonly marker?: number;
  readonly opacity?: number;
}> = ({ x, y, text, size = 40, color = C.navy, bold, marker = 0, opacity = 1 }) => {
  const w = measure(text, size, bold ? "uiBold" : "ui");
  return (
    <div style={box({ left: x, top: y, width: w + 10, height: size * 1.3, opacity })}>
      {marker > 0 ? <div style={box({ left: -10, top: size * 0.55, width: (w + 24) * clamp01(marker), height: size * 0.62, borderRadius: 10, backgroundColor: C.marker, rotate: "-0.8deg" })} /> : null}
      <div style={box({ left: 0, top: 0, whiteSpace: "nowrap", fontFamily, fontSize: size, fontWeight: bold ? 900 : 800, color, lineHeight: 1.25 })}>{text}</div>
    </div>
  );
};

// Рукописная строка: буквы появляются под пером (p — 0…1), у каждой —
// лёгкий детерминированный разброс высоты и наклона.
export const HandLine: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly p: number;
  readonly size?: number;
  readonly color?: string;
  readonly seed?: number;
  readonly rot?: number;
}> = ({ x, y, text, p, size = 64, color = C.ink, seed = 1, rot = -1 }) => {
  const chars = [...text];
  const n = chars.length;
  const shown = clamp01(p) * n;
  let cx = 0;
  return (
    <div style={box({ left: x, top: y, height: size * 1.3, rotate: `${rot}deg`, transformOrigin: "0 60%", whiteSpace: "nowrap" })}>
      {chars.map((ch, i) => {
        const w = measure(ch, size, "hand");
        const left = cx;
        cx += w;
        const a = clamp01(shown - i);
        if (a <= 0) return null;
        return (
          <span
            key={i}
            style={box({
              left,
              top: (rnd(seed * 31 + i) - 0.5) * size * 0.06,
              fontFamily: handFamily,
              fontWeight: 600,
              fontSize: size,
              lineHeight: 1.1,
              color,
              rotate: `${(rnd(seed * 17 + i * 3) - 0.5) * 5}deg`,
              clipPath: a < 1 ? `inset(-30% ${(1 - a) * 100}% -30% -10%)` : undefined,
            })}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Острие пера на строке HandLine (те же x, y, текст, кегль, p, rot).
export const penTipAt = (x: number, y: number, text: string, p: number, size = 64, rot = -1) => {
  const chars = [...text];
  const shown = clamp01(p) * chars.length;
  let w = 0;
  chars.forEach((ch, i) => {
    w += measure(ch, size, "hand") * clamp01(shown - i);
  });
  const r = (rot * Math.PI) / 180;
  const ly = size * 0.86;
  return { x: x + w * Math.cos(r) - (ly - size * 0.78) * Math.sin(r), y: y + ly + w * Math.sin(r) };
};

export const handWidth = (text: string, size = 64) => measure(text, size, "hand");

// Линия пером: путь d в координатах svg, p — 0…1 доля пути.
export const Stroke: React.FC<{
  readonly d: string;
  readonly p: number;
  readonly color?: string;
  readonly width?: number;
  readonly opacity?: number;
}> = ({ d, p, color = C.ink, width = 8, opacity = 1 }) => {
  if (p <= 0) return null;
  return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(p)} opacity={opacity} />;
};

// Галочка в кружке (p — 0…1).
export const Check: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly p: number; readonly color?: string }> = ({ x, y, r = 26, p, color = C.green }) => (
  <svg width={r * 2 + 8} height={r * 2 + 8} style={box({ left: x - r - 4, top: y - r - 4, overflow: "visible" })}>
    <circle cx={r + 4} cy={r + 4} r={r} fill="none" stroke={C.inkSoft} strokeWidth={4} opacity={0.6} />
    <path
      d={`M ${r * 0.45 + 4} ${r + 4} L ${r * 0.88 + 4} ${r * 1.45 + 4} L ${r * 1.65 + 4} ${r * 0.5 + 4}`}
      stroke={color}
      strokeWidth={7}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - clamp01(p)}
    />
  </svg>
);

// Строки «печатного» текста-заглушки на листе (работа): ряд полос разной
// длины. fade — от какой строки и насколько они бледнее (после перерыва).
export const TextBars: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly rows: number;
  readonly gap?: number;
  readonly seed?: number;
  readonly from?: number; // сколько строк видно (может быть дробным)
  readonly color?: string;
  readonly fadeFrom?: number;
  readonly fadeTo?: number;
}> = ({ x, y, w, rows, gap = 34, seed = 3, from = rows, color = "#7C88A6", fadeFrom = -1, fadeTo = -1 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => {
      const a = clamp01(from - i);
      if (a <= 0) return null;
      const len = (i % 5 === 4 ? 0.55 : 0.78 + 0.2 * rnd(seed + i)) * w;
      const faded = i >= fadeFrom && i <= fadeTo;
      return (
        <div
          key={i}
          style={box({
            left: x,
            top: y + i * gap,
            width: len * a,
            height: gap * 0.36,
            borderRadius: 4,
            backgroundColor: color,
            opacity: faded ? 0.28 : 0.8,
            backgroundImage: faded ? "repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 10px, transparent 10px 26px)" : undefined,
          })}
        />
      );
    })}
  </>
);
