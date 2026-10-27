// Декорации и графика выпуска №38 (BG-038).
//   • Квартира — общий мир 2D-ролика №12 (HomeBack, TableFront, ShoeBench);
//     здесь только свой стул: вид со спины, школьный рюкзак сына висит на
//     спинке; клапан рюкзака открывается и «проецирует» мягкий свет.
//   • Стол-инфографика: светлая столешница, карточки пропущенных дней,
//     ряды шкалы, папки «Өткөн ай» → «Кийинки төлөм мезгили», отдельный
//     знак «Кызматтын катасы — башка эреже».
// Мир — px; одинаковые координаты во всех планах (ничего не «прыгает»).
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../../two-schedules-2d/rig/motion";
import { box } from "./context";

export const NAVY = "#14285A";
export const NAVY_SOFT = "#3A4F80";
export const YELLOW = "#FFC90E";
export const YELLOW_SOFT = "#FFF4C2";
export const PACK = "#3E9C6B"; // рюкзак сына (как в ролике №12)
export const PACK_SHADE = "#2F7E55";
export const SERVICE_RED = "#D9483B";
export const SERVICE_BLUE = "#2F62A8";

// ---------- Квартира: места ----------
// Пол у стены — y = 1500 (HOME.floorY); стул и мама стоят ближе к камере.
export const CHAIR = { x: 700, y: 1680, seat: 1390, top: 1040, w: 236 } as const;
// Рюкзак на спинке: центр петли (верх спинки) и размеры корпуса.
export const PACK_ON_CHAIR = { x: CHAIR.x, y: CHAIR.top + 34, w: 206, h: 262 } as const;

// Стул со спины (рисуется до мамы, если она стоит дальше; иначе — после).
// open — клапан рюкзака открыт (0…1), glow — свет изнутри, pack — рюкзак висит.
export const ChairWithPack: React.FC<{ readonly open?: number; readonly glow?: number; readonly pack?: boolean; readonly f?: number }> = ({
  open = 0,
  glow = 0,
  pack = true,
  f = 0,
}) => {
  const c = CHAIR;
  const wood = "#9A7353";
  const woodDark = "#7E5B40";
  const L = c.x - c.w / 2;
  const R = c.x + c.w / 2;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* тень на ковре */}
      <ellipse cx={c.x} cy={c.y + 6} rx={c.w * 0.62} ry={22} fill="rgba(60,30,20,0.18)" />
      {/* задние (дальние) ножки и сиденье */}
      <rect x={L + 26} y={c.seat + 10} width={18} height={c.y - c.seat - 40} rx={6} fill={woodDark} />
      <rect x={R - 44} y={c.seat + 10} width={18} height={c.y - c.seat - 40} rx={6} fill={woodDark} />
      <rect x={L - 6} y={c.seat - 8} width={c.w + 12} height={34} rx={10} fill={woodDark} />
      {/* спинка: стойки (продолжение задних ножек) и перекладины */}
      <rect x={L} y={c.top} width={26} height={c.y - c.top} rx={9} fill={wood} />
      <rect x={R - 26} y={c.top} width={26} height={c.y - c.top} rx={9} fill={wood} />
      <rect x={L - 8} y={c.top - 8} width={c.w + 16} height={46} rx={16} fill={wood} />
      <rect x={L + 10} y={c.top + 120} width={c.w - 20} height={24} rx={8} fill={wood} />
      {pack ? <PackHanging x={PACK_ON_CHAIR.x} y={PACK_ON_CHAIR.y} w={PACK_ON_CHAIR.w} h={PACK_ON_CHAIR.h} open={open} glow={glow} f={f} /> : null}
    </svg>
  );
};

// Рюкзак, висящий лямками на перекладине: (x, y) — верх петли.
// Клапан поднимается (open), изнутри мягкий тёплый свет (glow).
export const PackHanging: React.FC<{ x: number; y: number; w: number; h: number; open: number; glow: number; f: number }> = ({ x, y, w, h, open, glow, f }) => {
  const top = y + 26;
  const flapH = h * 0.36;
  const flip = 1 - 1.55 * easeOut(open); // 1 — закрыт, < 0 — откинут вверх
  const sway = Math.sin(f / 37) * 0.6 * (1 - open);
  return (
    <g transform={`rotate(${sway} ${x} ${y})`}>
      {/* лямки через перекладину */}
      <path d={`M ${x - w * 0.3} ${top + 24} Q ${x - w * 0.32} ${y - 30} ${x - w * 0.12} ${y - 22}`} stroke={NAVY} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M ${x + w * 0.3} ${top + 24} Q ${x + w * 0.32} ${y - 30} ${x + w * 0.12} ${y - 22}`} stroke={NAVY} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* корпус */}
      <rect x={x - w / 2} y={top} width={w} height={h} rx={w * 0.3} fill={PACK} />
      {/* свет изнутри, когда клапан открыт */}
      {glow > 0.01 ? (
        <>
          <ellipse cx={x} cy={top + 22} rx={w * 0.42} ry={24} fill="#FFF3C4" opacity={glow} />
          <ellipse cx={x} cy={top + 18} rx={w * 0.7} ry={60} fill={`rgba(255,226,140,${0.35 * glow})`} />
        </>
      ) : null}
      {/* передний карман и светоотражающая полоска */}
      <rect x={x - w * 0.34} y={top + h * 0.52} width={w * 0.68} height={h * 0.36} rx={w * 0.14} fill={PACK_SHADE} />
      <rect x={x - w * 0.22} y={top + h * 0.6} width={w * 0.44} height={10} rx={5} fill="#FFFFFF" opacity={0.35} />
      {/* клапан: откидывается вверх вокруг верхнего края (видна изнанка) */}
      <g transform={`translate(0 ${top + 8}) scale(1 ${flip}) translate(0 ${-(top + 8)})`}>
        <path
          d={`M ${x - w / 2 + 6} ${top + 8} Q ${x - w / 2 + 2} ${top + flapH} ${x - w * 0.25} ${top + flapH + 8} L ${x + w * 0.25} ${top + flapH + 8} Q ${x + w / 2 - 2} ${top + flapH} ${x + w / 2 - 6} ${top + 8} Z`}
          fill={flip > 0 ? "#46AB77" : "#2B7A50"}
        />
        {flip > 0 ? <rect x={x - 16} y={top + flapH - 22} width={32} height={26} rx={7} fill="#E9C46A" /> : null}
      </g>
      {/* ручка-петля */}
      <path d={`M ${x - 22} ${top + 4} Q ${x} ${y - 8} ${x + 22} ${top + 4}`} stroke={NAVY} strokeWidth={9} fill="none" />
    </g>
  );
};

// Конус света из рюкзака (в мире): от (x, y) вниз (или вверх, up) на len,
// расширяясь до ширины w.
export const LightBeam: React.FC<{ x: number; y: number; len: number; w: number; a: number; up?: boolean; id?: string }> = ({ x, y, len, w, a, up, id = "bg38-beam" }) => {
  if (a <= 0.01) return null;
  const end = up ? y - len : y + len;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
      <defs>
        <linearGradient id={id} x1="0" y1={up ? "1" : "0"} x2="0" y2={up ? "0" : "1"}>
          <stop offset="0" stopColor="#FFF0B8" stopOpacity={0.85 * a} />
          <stop offset="1" stopColor="#FFF6D8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`M ${x - 40} ${y} L ${x + 40} ${y} L ${x + w / 2} ${end} L ${x - w / 2} ${end} Z`} fill={`url(#${id})`} />
    </svg>
  );
};

// Рюкзак на краю стола (вид спереди, клапан откинут): «проектор»
// карточек шкалы — свет поднимается от него к рядам.
export const PackProjector: React.FC<{ x: number; y: number; f: number; a: number }> = ({ x, y, f, a }) =>
  a <= 0.01 ? null : (
    <div style={box({ left: 0, top: 0, opacity: a })}>
      <LightBeam x={x} y={y + 30} len={1250} w={980} a={0.75 + 0.1 * Math.sin(f / 18)} up id="bg38-beam-up" />
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <ellipse cx={x} cy={y + 300} rx={150} ry={24} fill="rgba(110,70,30,0.18)" />
        <PackHanging x={x} y={y} w={230} h={286} open={1} glow={1} f={f} />
      </svg>
    </div>
  );

// Пылинки в солнечном луче (детерминированно).
export const DustMotes: React.FC<{ f: number; x: number; y: number; w: number; h: number; a?: number }> = ({ f, x, y, w, h, a = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
    {Array.from({ length: 18 }).map((_, i) => {
      const sx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const sy = (Math.sin(i * 78.233) * 12345.678) % 1;
      const px = x + Math.abs(sx) * w + Math.sin(f / 50 + i) * 14;
      const py = y + ((Math.abs(sy) * h + f * (0.35 + (i % 4) * 0.1)) % h);
      return <circle key={i} cx={px} cy={py} r={2.5 + (i % 3)} fill="#FFFFFF" opacity={a * (0.35 + 0.25 * Math.sin(f / 20 + i))} />;
    })}
  </svg>
);

// ---------- Надписи ----------
// «Шарттуу мисал» — условный художественный пример (в безопасной зоне).
export const ExampleTag: React.FC<{ a: number; x?: number; y?: number; dark?: boolean }> = ({ a, x = 90, y = 262, dark }) =>
  a <= 0.01 ? null : (
    <div
      style={box({
        left: x,
        top: y,
        padding: "8px 20px",
        borderRadius: 999,
        backgroundColor: dark ? "rgba(20,40,90,0.78)" : "rgba(255,255,255,0.88)",
        color: dark ? "#FFFFFF" : NAVY,
        fontFamily,
        fontSize: 30,
        fontWeight: 800,
        opacity: a,
        boxShadow: "0 6px 16px rgba(20,40,90,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      })}
    >
      <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: YELLOW, display: "inline-block" }} />
      Шарттуу мисал
    </div>
  );

// Пилюля-подпись (на графике).
export const Chip: React.FC<{ text: string; a: number; x: number; y: number; w?: number; bg?: string; color?: string; size?: number; center?: boolean }> = ({
  text,
  a,
  x,
  y,
  w,
  bg = "#FFFFFF",
  color = NAVY,
  size = 40,
  center,
}) =>
  a <= 0.01 ? null : (
    <div
      style={box({
        left: x,
        top: y,
        width: w,
        padding: "12px 26px",
        borderRadius: 999,
        backgroundColor: bg,
        color,
        fontFamily,
        fontSize: size,
        fontWeight: 900,
        textAlign: "center",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        boxShadow: "0 10px 26px rgba(20,40,90,0.16)",
        opacity: clamp(a),
        scale: `${0.85 + 0.15 * clamp(a)}`,
        translate: `${center ? "-50%" : "0"} ${(1 - clamp(a)) * 16}px`,
      })}
    >
      {text}
    </div>
  );

// ---------- Стол-инфографика ----------
// Светлая деревянная столешница во весь кадр с мягким светом сверху.
export const TableTop: React.FC<{ f: number; light?: number }> = ({ f, light = 1 }) => (
  <div style={box({ left: -400, top: -600, width: 1880, height: 3200, background: "linear-gradient(180deg, #F3E3C8, #EBD5B2)" })}>
    <div
      style={box({
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(150,105,60,0.07) 0 3px, transparent 3px 96px), repeating-linear-gradient(90deg, rgba(150,105,60,0.05) 0 2px, transparent 2px 37px)",
      })}
    />
    <div style={box({ inset: 0, background: `radial-gradient(circle at 940px ${700 + Math.sin(f / 90) * 30}px, rgba(255,247,220,${0.75 * light}), transparent 1100px)` })} />
  </div>
);

// Иконки: дом и школа (для маршрута на карточке).
export const HouseIcon: React.FC<{ s: number; color?: string }> = ({ s, color = NAVY }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill={color} />
  </svg>
);
export const SchoolIcon: React.FC<{ s: number; color?: string }> = ({ s, color = NAVY }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M12 3 2 8l10 5 8-4v6h2V8z" fill={color} />
    <path d="M6 12v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4l-6 3z" fill={color} />
  </svg>
);

// Маленькая карточка пропущенного дня (листок календаря): полная поездка
// — дом → школа → дом одной строкой. ghost — пунктир (необязательный день
// диапазона, например третий в «2–3»).
export const DayCard: React.FC<{ x: number; y: number; w?: number; rot?: number; a?: number; ghost?: boolean; tint?: string }> = ({
  x,
  y,
  w = 96,
  rot = 0,
  a = 1,
  ghost,
  tint = YELLOW,
}) => {
  const h = w * 1.22;
  return (
    <div
      style={box({
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: w * 0.14,
        backgroundColor: ghost ? "rgba(255,255,255,0.35)" : "#FFFFFF",
        border: ghost ? `4px dashed ${NAVY_SOFT}` : "none",
        boxSizing: "border-box",
        boxShadow: ghost ? "none" : "0 8px 18px rgba(80,50,20,0.22)",
        rotate: `${rot}deg`,
        opacity: a,
        overflow: "hidden",
      })}
    >
      {ghost ? null : (
        <>
          <div style={box({ left: 0, top: 0, right: 0, height: h * 0.24, backgroundColor: tint })} />
          {[0.3, 0.7].map((k) => (
            <div key={k} style={box({ left: w * k - 5, top: h * 0.06, width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" })} />
          ))}
          <div style={box({ left: 0, right: 0, top: h * 0.36, display: "flex", justifyContent: "center", alignItems: "center", gap: w * 0.02 })}>
            <HouseIcon s={w * 0.28} />
            <span style={{ fontSize: w * 0.18, fontWeight: 900, color: NAVY_SOFT, fontFamily }}>›</span>
            <SchoolIcon s={w * 0.28} />
          </div>
          <div style={box({ left: w * 0.14, right: w * 0.14, top: h * 0.74, height: 6, borderRadius: 3, backgroundColor: "#DCE5F2" })} />
        </>
      )}
    </div>
  );
};

// Большая карточка «1 күн = 1 толук сапар»: утренний и обратный путь
// объединены одной жёлтой скобкой — один день, а не два пропуска.
export const OneDayCard: React.FC<{ f: number; at: number; text: { title: string; morning: string; afternoon: string; full: string } }> = ({ f, at, text }) => {
  const a = (k: number) => easeOut((f - at - k) / 10);
  const legRow = (label: string, from: "house" | "school", k: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: a(k), translate: `${(1 - a(k)) * -30}px 0` }}>
      {from === "house" ? <HouseIcon s={58} /> : <SchoolIcon s={58} />}
      <span style={{ fontSize: 48, fontWeight: 900, color: NAVY }}>{label}</span>
    </div>
  );
  const bracket = easeOut((f - at - 16) / 12);
  return (
    <div style={box({ left: 0, top: 0, width: 640, height: 600, borderRadius: 44, backgroundColor: "#FFFFFF", boxShadow: "0 30px 60px rgba(80,50,20,0.25)", overflow: "hidden", fontFamily })}>
      <div style={box({ left: 0, top: 0, right: 0, height: 130, backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 900, color: NAVY })}>
        {text.title}
      </div>
      <div style={box({ left: 70, top: 180, display: "flex", flexDirection: "column", gap: 34 })}>
        {legRow(text.morning, "house", 4)}
        {legRow(text.afternoon, "school", 10)}
      </div>
      {/* скобка, объединяющая оба пути */}
      <svg width={80} height={190} viewBox="0 0 80 190" style={box({ left: 520, top: 168, opacity: bracket })}>
        <path d={`M 10 8 Q 46 8 46 40 L 46 ${80} Q 46 95 70 95 Q 46 95 46 110 L 46 150 Q 46 182 10 182`} stroke={YELLOW} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - bracket)} />
      </svg>
      <div
        style={box({
          left: 40,
          right: 40,
          top: 440,
          padding: "18px 0",
          borderRadius: 26,
          backgroundColor: "#EAF3FC",
          textAlign: "center",
          fontSize: 50,
          fontWeight: 900,
          color: NAVY,
          opacity: bracket,
          scale: `${0.9 + 0.1 * bracket}`,
        })}
      >
        {text.full}
      </div>
    </div>
  );
};

// Круглый знак процента (выскакивает с лёгким перехлёстом).
export const PercentBadge: React.FC<{ x: number; y: number; d: number; percent: number; a: number; hot?: number }> = ({ x, y, d, percent, a, hot = 0 }) => {
  const s = a <= 0 ? 0 : a < 1 ? easeOut(a) * (1 + 0.18 * Math.sin(Math.PI * a)) : 1;
  return s <= 0.01 ? null : (
    <div
      style={box({
        left: x - d / 2,
        top: y - d / 2,
        width: d,
        height: d,
        borderRadius: d / 2,
        backgroundColor: YELLOW,
        border: `8px solid ${hot > 0.5 ? NAVY : "#FFFFFF"}`,
        boxSizing: "border-box",
        boxShadow: `0 14px 30px rgba(200,140,0,${0.25 + 0.25 * hot})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        fontSize: d * 0.36,
        fontWeight: 900,
        color: NAVY,
        scale: `${s}`,
      })}
    >
      {percent}%
    </div>
  );
};

// Папка (вид спереди): язычок с подписью, внутри — карточки.
export const Folder: React.FC<{ x: number; y: number; w: number; h: number; label: string; color: string; tab: string; open?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  label,
  color,
  tab,
  open = 0,
  children,
}) => (
  <div style={box({ left: x, top: y, width: w, height: h, fontFamily })}>
    <div style={box({ left: 0, top: 0, width: w * 0.52, height: 70, borderRadius: "22px 22px 0 0", backgroundColor: tab })} />
    <div style={box({ left: 0, top: 50, width: w, height: h - 50, borderRadius: 26, backgroundColor: tab })} />
    {children}
    <div
      style={box({
        left: 0,
        top: 50 + (h - 50) * 0.32 + 30 * open,
        width: w,
        height: (h - 50) * 0.68 - 30 * open,
        borderRadius: 26,
        backgroundColor: color,
        boxShadow: "0 -6px 16px rgba(80,50,20,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 18px",
        boxSizing: "border-box",
        fontSize: 46,
        fontWeight: 900,
        lineHeight: 1.08,
        color: NAVY,
      })}
    >
      {label}
    </div>
  </div>
);

// Отдельный знак «Кызматтын катасы — башка эреже»: красно-синяя рамка,
// значок «≠» — это другая гарантия, со шкалой пропусков не суммируется.
export const ServiceSign: React.FC<{ x: number; y: number; w: number; text: string; a: number }> = ({ x, y, w, text, a }) =>
  a <= 0.01 ? null : (
    <div
      style={box({
        left: x,
        top: y,
        width: w,
        padding: "22px 26px",
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        border: `7px solid ${SERVICE_BLUE}`,
        boxShadow: `inset 0 0 0 7px ${SERVICE_RED}, 0 16px 34px rgba(20,40,90,0.18)`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily,
        opacity: clamp(a),
        translate: `${(1 - clamp(a)) * 80}px 0`,
      })}
    >
      <div style={{ flex: "0 0 auto", width: 92, height: 92, borderRadius: 46, backgroundColor: SERVICE_RED, color: "#FFFFFF", fontSize: 70, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
        ≠
      </div>
      <div style={{ fontSize: 42, fontWeight: 900, color: NAVY, lineHeight: 1.12 }}>
        {/* по смыслу: «Кызматтын катасы —» / «башка эреже» (без висящего слова) */}
        {text.split(" — ").map((part, i, all) => (
          <div key={i}>{i < all.length - 1 ? `${part} —` : part}</div>
        ))}
      </div>
    </div>
  );
