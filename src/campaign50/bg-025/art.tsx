// Общая рисовка BG-025 (SVG, координаты слоя): иконки, узнаваемый Бишкек
// (хребет Ала-Тоо со снегом, пирамидальные тополя, панельные дома, школа),
// белая легковая машина с пристёгнутыми детьми и постоянным водителем,
// элементы WhatsApp-подобного чата (без логотипа приложения).
import { C, F } from "./theme";

// ---------- Иконки (viewBox 48×48, контур) ----------
export type IconKind =
  | "home"
  | "school"
  | "clock"
  | "doc"
  | "people"
  | "chat"
  | "pack"
  | "pay"
  | "check"
  | "pin"
  | "link"
  | "phone"
  | "send"
  | "car"
  | "pause";

export const IconPath: React.FC<{ readonly kind: IconKind; readonly color?: string; readonly w?: number }> = ({ kind, color = C.navy, w = 4.5 }) => {
  const st = { fill: "none", stroke: color, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (kind) {
    case "home":
      return (
        <g {...st}>
          <path d="M6 23 L24 8 L42 23" />
          <path d="M11 20 V41 H37 V20" />
          <path d="M20 41 V29 H28 V41" />
        </g>
      );
    case "school":
      return (
        <g {...st}>
          <path d="M5 41 H43" />
          <path d="M9 41 V19 H39 V41" />
          <path d="M5 19 L24 8 L43 19" />
          <path d="M20 41 V31 H28 V41" />
          <path d="M14 25 H18 M30 25 H34" />
        </g>
      );
    case "clock":
      return (
        <g {...st}>
          <circle cx={24} cy={25} r={16} />
          <path d="M24 16 V25 L31 29" />
        </g>
      );
    case "doc":
      return (
        <g {...st}>
          <path d="M12 6 H30 L38 14 V42 H12 Z" />
          <path d="M30 6 V14 H38" />
          <path d="M18 22 H32 M18 29 H32 M18 36 H26" />
        </g>
      );
    case "people":
      return (
        <g {...st}>
          <circle cx={17} cy={17} r={6} />
          <circle cx={32} cy={17} r={6} />
          <path d="M6 40 Q6 28 17 28 Q28 28 28 40" />
          <path d="M24 30 Q27 28 32 28 Q42 28 42 40" />
        </g>
      );
    case "chat":
      return (
        <g {...st}>
          <path d="M8 10 H40 V32 H22 L13 40 V32 H8 Z" />
          <path d="M15 19 H33 M15 25 H27" />
        </g>
      );
    case "pack":
      return (
        <g {...st}>
          <path d="M8 16 L24 8 L40 16 V34 L24 42 L8 34 Z" />
          <path d="M8 16 L24 24 L40 16 M24 24 V42" />
        </g>
      );
    case "pay":
      return (
        <g {...st}>
          <rect x={6} y={12} width={36} height={24} rx={4} />
          <path d="M6 19 H42 M12 29 H20" />
        </g>
      );
    case "check":
      return (
        <g {...st}>
          <path d="M10 25 L20 35 L39 14" />
        </g>
      );
    case "pin":
      return (
        <g {...st}>
          <path d="M24 43 Q10 28 10 19 A14 14 0 0 1 38 19 Q38 28 24 43 Z" />
          <circle cx={24} cy={19} r={5} />
        </g>
      );
    case "link":
      return (
        <g {...st}>
          <path d="M21 27 L27 21" />
          <path d="M18 22 L13 27 A7 7 0 0 0 23 37 L28 32" />
          <path d="M30 26 L35 21 A7 7 0 0 0 25 11 L20 16" />
        </g>
      );
    case "phone":
      return (
        <g {...st}>
          <path d="M16 8 L21 17 L17 21 Q20 28 27 31 L31 27 L40 32 L37 40 Q16 40 8 16 Z" />
        </g>
      );
    case "send":
      return (
        <g fill={color} stroke="none">
          <path d="M8 24 L40 10 L32 40 L24 28 Z" />
          <path d="M24 28 L40 10" stroke={C.white} strokeWidth={2.5} />
        </g>
      );
    case "car":
      return (
        <g {...st}>
          <path d="M6 30 V24 L12 14 H34 L42 24 V30 Z" />
          <circle cx={15} cy={32} r={4} />
          <circle cx={33} cy={32} r={4} />
        </g>
      );
    case "pause":
      return (
        <g {...st}>
          <path d="M18 14 V34 M30 14 V34" />
        </g>
      );
  }
};

export const Icon: React.FC<{ readonly kind: IconKind; readonly s?: number; readonly color?: string; readonly w?: number }> = ({ kind, s = 48, color, w }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" style={{ flexShrink: 0, overflow: "visible" }}>
    <IconPath kind={kind} color={color} w={w} />
  </svg>
);

// Значок WhatsApp-канала: зелёный круг с трубкой (обозначение, не логотип).
export const WaBadge: React.FC<{ readonly s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <circle cx={24} cy={24} r={22} fill="#25B85A" />
    <g transform="translate(9 9) scale(0.62)">
      <IconPath kind="phone" color="#FFFFFF" w={5} />
    </g>
  </svg>
);

// ---------- Бишкек ----------
// Хребет Ала-Тоо со снежными вершинами (ширина w, высота h, низ — y = 0).
export const Mountains: React.FC<{ readonly w: number; readonly h: number; readonly x?: number; readonly y?: number; readonly far?: boolean }> = ({ w, h, x = 0, y = 0, far = false }) => {
  const pts = [0, 0.55, 0.12, 0.3, 0.22, 0.62, 0.34, 0.12, 0.46, 0.5, 0.58, 0.0, 0.7, 0.42, 0.82, 0.18, 0.93, 0.5, 1, 0.35];
  const P = (i: number) => ({ px: pts[i * 2] * w, py: -h + pts[i * 2 + 1] * h });
  let d = `M 0 0`;
  for (let i = 0; i < pts.length / 2; i++) d += ` L ${P(i).px} ${P(i).py}`;
  d += ` L ${w} 0 Z`;
  const peaks = [3, 5, 7];
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} fill={far ? C.mountainFar : C.mountain} />
      {peaks.map((i) => {
        const p = P(i);
        const s = h * 0.22;
        return <path key={i} d={`M ${p.px - s * 0.9} ${p.py + s} L ${p.px} ${p.py} L ${p.px + s * 0.9} ${p.py + s} L ${p.px + s * 0.35} ${p.py + s * 0.75} L ${p.px} ${p.py + s * 1.05} L ${p.px - s * 0.4} ${p.py + s * 0.78} Z`} fill={C.snow} opacity={far ? 0.9 : 1} />;
      })}
    </g>
  );
};

// Пирамидальный тополь (низ ствола — (x, y), высота h).
export const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly h: number; readonly sway?: number }> = ({ x, y, h, sway = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${sway})`}>
    <rect x={-h * 0.025} y={-h * 0.18} width={h * 0.05} height={h * 0.18} fill={C.woodDark} />
    <path d={`M 0 ${-h} C ${h * 0.16} ${-h * 0.75} ${h * 0.14} ${-h * 0.3} 0 ${-h * 0.14} C ${-h * 0.14} ${-h * 0.3} ${-h * 0.16} ${-h * 0.75} 0 ${-h} Z`} fill={C.poplar} />
    <path d={`M 0 ${-h} C ${h * 0.07} ${-h * 0.72} ${h * 0.06} ${-h * 0.32} 0 ${-h * 0.14} Z`} fill={C.poplarDark} opacity={0.55} />
  </g>
);

// Панельный дом (низ — (x, y)): этажи и окна, один подъезд.
export const Block: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly floors?: number; readonly color?: string; readonly lit?: number }> = ({ x, y, w, floors = 5, color = C.brick, lit = 0 }) => {
  const fh = w * 0.16;
  const h = fh * floors + fh * 0.4;
  const cols = Math.max(3, Math.round(w / 52));
  const cw = w / cols;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={-h} width={w} height={h} fill={color} />
      <rect x={-6} y={-h - 8} width={w + 12} height={12} fill="#CDB89A" />
      {Array.from({ length: floors }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * cw + cw * 0.22} y={-h + fh * 0.4 + r * fh + fh * 0.18} width={cw * 0.56} height={fh * 0.52} rx={3} fill={(r * 7 + c * 3) % 5 < lit * 5 ? "#FFE7A3" : "#CFE3F6"} />
        )),
      )}
      <rect x={w / 2 - cw * 0.3} y={-fh * 0.75} width={cw * 0.6} height={fh * 0.75} fill="#8A6A4C" />
    </g>
  );
};

// Школа: два этажа, крыльцо, табличка «Мектеп».
export const SchoolBuilding: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly label?: string }> = ({ x, y, w, label = "Мектеп" }) => {
  const h = w * 0.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={-h} width={w} height={h} fill="#F4E3C8" />
      <rect x={-8} y={-h - 10} width={w + 16} height={14} fill="#D9B98F" />
      {[0, 1].map((r) =>
        Array.from({ length: 5 }, (_, c) => <rect key={`${r}-${c}`} x={w * 0.07 + c * w * 0.18} y={-h + 26 + r * h * 0.4} width={w * 0.11} height={h * 0.22} rx={3} fill="#CFE3F6" />),
      )}
      <rect x={w * 0.42} y={-h * 0.36} width={w * 0.16} height={h * 0.36} fill="#8A6A4C" />
      <rect x={w * 0.22} y={-h - 14 - w * 0.17} width={w * 0.56} height={w * 0.15} rx={w * 0.03} fill={C.navy} />
      <text x={w / 2} y={-h - 14 - w * 0.06} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={w * 0.095} fill={C.white}>
        {label}
      </text>
    </g>
  );
};

// ---------- Ребёнок в машине (голова, плечи, ремень) ----------
const Kid: React.FC<{ readonly cx: number; readonly hair: string; readonly top: string; readonly girl?: boolean }> = ({ cx, hair, top, girl }) => (
  <g>
    <path d={`M ${cx - 20} 92 Q ${cx} 72 ${cx + 20} 92 L ${cx + 20} 100 L ${cx - 20} 100 Z`} fill={top} />
    <circle cx={cx} cy={60} r={16} fill="#E6B590" />
    <path d={`M ${cx - 16} 58 Q ${cx} 36 ${cx + 16} 58 Q ${cx + 8} 47 ${cx} 48 Q ${cx - 8} 47 ${cx - 16} 58 Z`} fill={hair} />
    {girl ? <circle cx={cx + 15} cy={52} r={6} fill={hair} /> : null}
    <circle cx={cx - 5} cy={61} r={1.8} fill="#2A201D" />
    <circle cx={cx + 5} cy={61} r={1.8} fill="#2A201D" />
    <path d={`M ${cx - 4} 67 Q ${cx} 70 ${cx + 4} 67`} stroke="#B5655F" strokeWidth={2} fill="none" strokeLinecap="round" />
    {/* ремень безопасности: через плечо к бедру */}
    <path d={`M ${cx - 14} 76 L ${cx + 16} 100`} stroke="#2B3550" strokeWidth={5.5} strokeLinecap="round" />
  </g>
);

// ---------- Белая легковая машина (вид сбоку) ----------
// Ширина 440 × s. (x, y) — середина низа колёс. Дети на заднем сиденье
// пристёгнуты, впереди — постоянный водитель (тоже пристёгнут).
// kids — сколько детей видно (0…2), dir 1 — вправо, −1 — влево.
// parked — машина стоит (аварийка не нужна, двигатель не важен).
export const Car: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly dir?: 1 | -1;
  readonly roll?: number;
  readonly bounce?: number;
  readonly kids?: number;
  readonly driver?: boolean;
}> = ({ x, y, s = 1, dir = 1, roll = 0, bounce = 0, kids = 2, driver = true }) => {
  const W = 440;
  return (
    <g transform={`translate(${x - (W * s) / 2} ${y - 188 * s + bounce}) scale(${s})`}>
      <g transform={dir === -1 ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <ellipse cx={W / 2} cy={190} rx={200} ry={10} fill="rgba(20,40,90,0.14)" />
        <path
          d="M 6 136 Q 4 104 34 98 L 104 90 L 156 42 Q 168 30 188 30 L 298 30 Q 318 30 332 44 L 382 92 L 418 100 Q 438 106 438 130 L 438 154 Q 438 166 424 166 L 18 166 Q 6 166 6 154 Z"
          fill="#FFFFFF"
          stroke="#BCC8DA"
          strokeWidth={4}
        />
        <path d="M 120 92 L 164 48 Q 172 42 184 42 L 246 42 L 246 92 Z" fill="#D6EAF8" />
        <path d="M 256 42 L 296 42 Q 312 42 322 52 L 362 92 L 256 92 Z" fill="#D6EAF8" />
        <g clipPath="url(#bg25-car-glass)">
          {kids > 0 ? <Kid cx={160} hair="#3B2A20" top="#2F4C86" /> : null}
          {kids > 1 ? <Kid cx={214} hair="#5A3A28" top="#FFC90E" girl /> : null}
          {driver ? (
            <g>
              <path d="M 280 92 Q 302 74 324 92 L 324 100 L 280 100 Z" fill="#33476E" />
              <circle cx={302} cy={60} r={16} fill="#DCAA84" />
              <path d="M 286 56 Q 302 38 318 56 Q 306 49 286 56 Z" fill="#1F1A19" />
              <path d="M 290 76 L 318 100" stroke="#2B3550" strokeWidth={5.5} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        <defs>
          <clipPath id="bg25-car-glass">
            <path d="M 120 92 L 164 48 Q 172 42 184 42 L 246 42 L 246 92 Z M 256 42 L 296 42 Q 312 42 322 52 L 362 92 L 256 92 Z" />
          </clipPath>
        </defs>
        <path d="M 250 38 L 250 164" stroke="#E2E8F2" strokeWidth={4} />
        <path d="M 20 120 L 430 120" stroke="#EEF2F8" strokeWidth={3} />
        <rect x={404} y={112} width={26} height={12} rx={5} fill="#FFE27A" />
        <rect x={8} y={114} width={18} height={12} rx={5} fill="#F2A08F" />
        {[96, 344].map((cx) => (
          <g key={cx} transform={`rotate(${roll} ${cx} 166)`}>
            <circle cx={cx} cy={166} r={30} fill="#2B3550" />
            <circle cx={cx} cy={166} r={14} fill="#DCE3EE" />
            <path d={`M ${cx} 152 L ${cx} 180 M ${cx - 14} 166 L ${cx + 14} 166`} stroke="#9AA8C0" strokeWidth={4} />
          </g>
        ))}
      </g>
    </g>
  );
};

// ---------- Чат (WhatsApp-подобный, без логотипа) ----------
export const Bubble: React.FC<{
  readonly out?: boolean;
  readonly children: React.ReactNode;
  readonly time?: string;
  readonly ticks?: number; // 0 — нет, 1 — одна серая галочка «отправлено»
  readonly author?: string;
  readonly width?: number;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ out = false, children, time, ticks = 0, author, width, size = 30, style }) => (
  <div
    style={{
      alignSelf: out ? "flex-end" : "flex-start",
      maxWidth: width ?? "84%",
      padding: "12px 18px 10px",
      borderRadius: out ? "22px 6px 22px 22px" : "6px 22px 22px 22px",
      backgroundColor: out ? C.bubbleOut : C.bubbleIn,
      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      fontFamily: F.text,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.22,
      color: "#1F2A33",
      ...style,
    }}
  >
    {author ? <div style={{ fontSize: size * 0.8, fontWeight: 900, color: C.chatTop, marginBottom: 4 }}>{author}</div> : null}
    {children}
    {time || ticks ? (
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 4, fontSize: size * 0.62, color: "#7A8A94", fontWeight: 700 }}>
        {time}
        {ticks ? (
          <svg width={size * 0.7} height={size * 0.5} viewBox="0 0 20 14">
            <path d="M2 7 L7 12 L18 2" fill="none" stroke="#8C9AA4" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    ) : null}
  </div>
);

// Круглый аватар-силуэт (родитель / водитель).
export const Avatar: React.FC<{ readonly s?: number; readonly bg?: string; readonly fg?: string; readonly label?: string }> = ({ s = 64, bg = C.skyDeep, fg = C.navy, label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <svg width={s} height={s} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={23} fill={bg} />
      <circle cx={24} cy={19} r={8} fill={fg} opacity={0.85} />
      <path d="M10 40 Q12 29 24 29 Q36 29 38 40 Z" fill={fg} opacity={0.85} />
    </svg>
    {label ? <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: s * 0.3, color: C.inkSoft }}>{label}</div> : null}
  </div>
);
