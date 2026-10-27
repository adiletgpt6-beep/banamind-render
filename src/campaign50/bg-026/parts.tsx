// Общие элементы рисовки BG-026: телефон и чат WhatsApp-группы (обычный
// мессенджер без фирменных логотипов), рука отца сверху, предметы рабочего
// стола, бейдж «Шарттуу мисал», значки (SVG, без emoji), логотип.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { BG26_TEXT, BG26_VIDEO } from "./script";

export const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const font = (size: number, weight = 800, color: string = C.navy): React.CSSProperties => ({
  fontFamily,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.15,
});

// ---------- Логотип ----------
export const Logo: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly opacity?: number; readonly scale?: number }> = ({ x, y, r, opacity = 1, scale = 1 }) => (
  <div style={abs({ left: x - r, top: y - r, width: r * 2, height: r * 2, opacity, transform: `scale(${scale})` })}>
    <Img
      src={staticFile(BG26_VIDEO.logo)}
      style={{ width: r * 2, height: r * 2, borderRadius: r, objectFit: "cover", boxShadow: "0 18px 40px rgba(20,40,90,0.16)" }}
    />
  </div>
);

// ---------- Значки ----------
type IconProps = { readonly s?: number; readonly color?: string };

export const IconLink: React.FC<IconProps> = ({ s = 44, color = C.navy }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <path d="M20 28 L28 20" stroke={color} strokeWidth={5} strokeLinecap="round" />
    <path d="M22 14 L26 10 Q32 4 38 10 Q44 16 38 22 L34 26" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
    <path d="M26 34 L22 38 Q16 44 10 38 Q4 32 10 26 L14 22" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

// Обычный значок мессенджера (пузырь с трубкой), без фирменного логотипа.
export const IconChat: React.FC<IconProps> = ({ s = 44, color = C.green }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <path d="M24 4 Q42 4 44 22 Q44 40 24 42 Q18 42 13 40 L4 44 L8 35 Q4 30 4 22 Q6 4 24 4 Z" fill={color} />
    <path d="M17 15 Q15 16 15 19 Q16 26 23 31 Q28 34 31 33 Q33 32 33 30 L29 27 Q27 27 26 29 Q22 27 20 23 Q22 22 22 20 L19 15 Z" fill="#FFFFFF" />
  </svg>
);

export const IconPin: React.FC<IconProps> = ({ s = 44, color = C.navy }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <path d="M24 44 Q8 28 8 18 Q8 4 24 4 Q40 4 40 18 Q40 28 24 44 Z" fill={color} />
    <circle cx={24} cy={18} r={6} fill="#FFFFFF" />
  </svg>
);

export const IconSend: React.FC<IconProps> = ({ s = 44, color = "#FFFFFF" }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <path d="M6 22 L42 6 L30 42 L24 27 Z" fill={color} />
  </svg>
);

// Две галочки «доставлено/прочитано».
export const Ticks: React.FC<{ readonly s?: number; readonly color?: string }> = ({ s = 26, color = "#4FA3E0" }) => (
  <svg width={s * 1.4} height={s} viewBox="0 0 34 24">
    <path d="M2 13 L8 19 L20 5" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 17 L15 19 L28 5" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Колокольчик автоматического уведомления, перечёркнутый.
export const IconBellOff: React.FC<IconProps> = ({ s = 44, color = C.navy }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <path d="M24 6 Q36 6 36 20 L36 30 L40 35 L8 35 L12 30 L12 20 Q12 6 24 6 Z" fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" />
    <path d="M19 39 Q24 44 29 39" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <path d="M7 7 L41 41" stroke="#E8735A" strokeWidth={5} strokeLinecap="round" />
  </svg>
);

export const IconParked: React.FC<IconProps> = ({ s = 44 }) => (
  <svg width={s} height={s} viewBox="0 0 48 48">
    <rect x={3} y={3} width={42} height={42} rx={10} fill="#2C6FD1" />
    <path d="M17 36 L17 12 L26 12 Q34 12 34 20 Q34 28 26 28 L17 28" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

// ---------- Бейдж «Шарттуу мисал» ----------
// Виден всё время условного примера (сцены group, location, order) в одном
// и том же месте — в безопасной зоне сверху слева.
export const ExampleBadge: React.FC<{ readonly opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={abs({
      left: 56,
      top: 252,
      padding: "10px 26px 10px 18px",
      borderRadius: 999,
      background: C.yellow,
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity,
      boxShadow: "0 8px 20px rgba(255,170,0,0.28)",
      ...font(34, 900, C.navy),
    })}
  >
    <svg width={30} height={30} viewBox="0 0 30 30">
      <circle cx={15} cy={15} r={13} fill="none" stroke={C.navy} strokeWidth={3} />
      <path d="M15 9 L15 17" stroke={C.navy} strokeWidth={3.4} strokeLinecap="round" />
      <circle cx={15} cy={22} r={2} fill={C.navy} />
    </svg>
    {BG26_TEXT.chat.example}
  </div>
);

// Плашка-подпись.
export const Chip: React.FC<{
  readonly children: React.ReactNode;
  readonly bg?: string;
  readonly color?: string;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, bg = C.navy, color = "#FFFFFF", size = 38, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.3}px ${size * 0.7}px`,
      borderRadius: 999,
      backgroundColor: bg,
      boxShadow: "0 10px 24px rgba(20,40,90,0.14)",
      whiteSpace: "nowrap",
      ...font(size, 900, color),
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Телефон ----------
// Корпус телефона с экраном; содержимое экрана — children (координаты
// экрана от левого верхнего угла). clock — время в строке состояния.
export const PhoneFrame: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly clock?: string;
  readonly screenBg?: string;
  readonly shadow?: number;
  readonly statusDark?: boolean;
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, clock = "07:50", screenBg = C.chatBg, shadow = 1, statusDark = false, children }) => {
  const sc = statusDark ? "#1E2A3A" : "#FFFFFF";
  const bez = Math.round(w * 0.035);
  return (
    <div
      style={abs({
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: w * 0.11,
        background: "#1D2233",
        boxShadow: `0 ${30 * shadow}px ${60 * shadow}px rgba(20,30,60,${0.28 * shadow})`,
      })}
    >
      <div style={abs({ left: bez, top: bez, width: w - 2 * bez, height: h - 2 * bez, borderRadius: w * 0.085, overflow: "hidden", background: screenBg })}>
        {children}
        {/* строка состояния */}
        <div style={abs({ left: 0, top: 0, right: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", ...font(24, 800, sc) })}>
          <span>{clock}</span>
          <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {[8, 12, 16, 20].map((hh) => (
              <span key={hh} style={{ width: 6, height: hh, borderRadius: 2, background: sc }} />
            ))}
            <span style={{ marginLeft: 8, width: 36, height: 18, borderRadius: 5, border: `2px solid ${sc}`, boxSizing: "border-box", padding: 2 }}>
              <span style={{ display: "block", width: "70%", height: "100%", background: sc, borderRadius: 2 }} />
            </span>
          </span>
        </div>
        {/* камера-«капля» */}
        <div style={abs({ left: (w - 2 * bez) / 2 - 60, top: 10, width: 120, height: 28, borderRadius: 14, background: "#1D2233" })} />
      </div>
    </div>
  );
};

// Шапка чата группы.
export const ChatHeader: React.FC<{ readonly title: string; readonly sub: string }> = ({ title, sub }) => (
  <div style={abs({ left: 0, top: 0, right: 0, height: 170, background: C.chatHead, display: "flex", alignItems: "flex-end", padding: "0 26px 22px", boxSizing: "border-box", gap: 18 })}>
    <svg width={30} height={40} viewBox="0 0 30 40">
      <path d="M22 6 L8 20 L22 34" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ width: 76, height: 76, borderRadius: 38, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={52} height={52} viewBox="0 0 52 52">
        <circle cx={18} cy={18} r={8} fill={C.chatHead} />
        <circle cx={34} cy={18} r={8} fill="#5FB08C" />
        <path d="M4 44 Q4 30 18 30 Q32 30 32 44 Z" fill={C.chatHead} />
        <path d="M22 44 Q22 30 34 30 Q48 30 48 44 Z" fill="#5FB08C" />
      </svg>
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ ...font(34, 900, "#FFFFFF"), whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ ...font(24, 700, "#D8F0E4"), marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

// Пузырь сообщения. side: in — от водителя (слева, белый), out — от отца
// (справа, светло-зелёный).
export const Bubble: React.FC<{
  readonly side?: "in" | "out";
  readonly name?: string;
  readonly text: React.ReactNode;
  readonly time: string;
  readonly scale?: number;
  readonly highlight?: number;
  readonly style?: React.CSSProperties;
}> = ({ side = "in", name, text, time, scale = 1, highlight = 0, style }) => (
  <div style={{ display: "flex", justifyContent: side === "in" ? "flex-start" : "flex-end", ...style }}>
    <div
      style={{
        maxWidth: 560 * scale,
        padding: `${12 * scale}px ${20 * scale}px ${10 * scale}px`,
        borderRadius: 22 * scale,
        borderTopLeftRadius: side === "in" ? 6 * scale : 22 * scale,
        borderTopRightRadius: side === "out" ? 6 * scale : 22 * scale,
        background: side === "in" ? C.bubbleIn : "#D9FDD3",
        boxShadow: `0 2px 0 rgba(0,0,0,0.06), 0 0 0 ${6 * highlight}px rgba(255,201,14,${0.85 * highlight})`,
      }}
    >
      {name ? <div style={font(24 * scale, 900, "#C2571A")}>{name}</div> : null}
      <div style={{ ...font(36 * scale, 800, "#1E2A3A"), lineHeight: 1.2 }}>{text}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 2, ...font(20 * scale, 700, "#8A94A6") }}>
        {time}
        {side === "out" ? <Ticks s={18 * scale} /> : null}
      </div>
    </div>
  </div>
);

// Системная строка в чате (по центру).
export const SystemNote: React.FC<{ readonly text: string; readonly scale?: number }> = ({ text, scale = 1 }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <div style={{ padding: `${8 * scale}px ${20 * scale}px`, borderRadius: 14 * scale, background: "#FFF6CC", ...font(24 * scale, 800, "#5A4A12"), textAlign: "center" }}>{text}</div>
  </div>
);

// Карточка ссылки на местоположение (пузырь водителя).
export const LinkBubble: React.FC<{ readonly time: string; readonly press?: number; readonly highlight?: number }> = ({ time, press = 0, highlight = 0 }) => (
  <div style={{ display: "flex", justifyContent: "flex-start" }}>
    <div
      style={{
        width: 520,
        padding: 10,
        borderRadius: 22,
        borderTopLeftRadius: 6,
        background: C.bubbleIn,
        transform: `scale(${1 - press * 0.03})`,
        boxShadow: `0 2px 0 rgba(0,0,0,0.06), 0 0 0 ${6 * highlight}px rgba(255,201,14,${0.85 * highlight})`,
      }}
    >
      <div style={{ ...font(24, 900, "#C2571A"), padding: "2px 10px 6px" }}>{BG26_TEXT.chat.driver}</div>
      <div style={{ position: "relative", height: 210, borderRadius: 14, overflow: "hidden" }}>
        <MiniMap w={500} h={210} pin={{ x: 300, y: 104 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px 0" }}>
        <IconPin s={40} color="#D9473A" />
        <div>
          <div style={font(32, 900, "#1E2A3A")}>{BG26_TEXT.chat.messages[2].text}</div>
          <div style={font(22, 800, "#4A7FC1")}>{BG26_TEXT.chat.linkSub}</div>
        </div>
        <div style={{ marginLeft: "auto", alignSelf: "flex-end", ...font(20, 700, "#8A94A6") }}>{time}</div>
      </div>
    </div>
  </div>
);

// ---------- Статичная схема улиц (без движения, без маршрута) ----------
// Обобщённые кварталы города, мектеп и метка машины; ничего не движется.
export const MiniMap: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly pin: { readonly x: number; readonly y: number };
  readonly school?: { readonly x: number; readonly y: number };
  readonly scale?: number;
}> = ({ w, h, pin, school, scale = 1 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
    <rect width={w} height={h} fill="#EEF1E6" />
    {/* кварталы */}
    {Array.from({ length: Math.ceil(w / 120) + 1 }).map((_, i) =>
      Array.from({ length: Math.ceil(h / 100) + 1 }).map((__, j) => (
        <rect key={`${i}-${j}`} x={i * 120 + 14 - ((j * 37) % 40)} y={j * 100 + 14} width={92} height={70} rx={8} fill={(i + j) % 5 === 2 ? "#D9ECCF" : "#FFFFFF"} />
      )),
    )}
    {/* проспект и улицы */}
    <path d={`M 0 ${h * 0.55} L ${w} ${h * 0.48}`} stroke="#FFE08A" strokeWidth={20 * scale} />
    <path d={`M ${w * 0.32} 0 L ${w * 0.38} ${h}`} stroke="#FFFFFF" strokeWidth={14 * scale} />
    <path d={`M ${w * 0.72} 0 L ${w * 0.7} ${h}`} stroke="#FFFFFF" strokeWidth={14 * scale} />
    {school ? (
      <g transform={`translate(${school.x} ${school.y}) scale(${scale})`}>
        <rect x={-34} y={-30} width={68} height={52} rx={8} fill="#5C86D6" />
        <path d="M -40 -28 L 0 -54 L 40 -28 Z" fill="#3F67B5" />
        <rect x={-8} y={0} width={16} height={22} fill="#FFFFFF" />
      </g>
    ) : null}
    {/* метка машины (статичная) */}
    <g transform={`translate(${pin.x} ${pin.y}) scale(${scale})`}>
      <ellipse cx={0} cy={6} rx={22} ry={7} fill="rgba(20,30,60,0.2)" />
      <path d="M 0 2 Q -30 -26 -30 -48 Q -30 -78 0 -78 Q 30 -78 30 -48 Q 30 -26 0 2 Z" fill="#D9473A" />
      <circle cx={0} cy={-49} r={20} fill="#FFFFFF" />
      <g transform="translate(-14 -58)">
        <path d="M 2 12 Q 2 8 6 7 L 9 2 Q 10 0 13 0 L 17 0 Q 20 0 21 2 L 24 7 Q 28 8 28 12 L 28 16 L 2 16 Z" fill={C.navy} />
        <circle cx={8} cy={17} r={3} fill={C.navy} />
        <circle cx={22} cy={17} r={3} fill={C.navy} />
      </g>
    </g>
  </svg>
);

// ---------- Рука отца (вид сверху) ----------
// Указательный палец вытянут; press 0…1 — нажатие. Рукав свитера.
export const TopHand: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly press?: number; readonly opacity?: number; readonly flat?: boolean }> = ({
  x,
  y,
  angle = -18,
  press = 0,
  opacity = 1,
  flat = false,
}) => (
  <svg width={1080} height={1920} style={abs({ left: 0, top: 0, opacity, pointerEvents: "none", overflow: "visible" })}>
    <g transform={`translate(${x} ${y + press * 8}) rotate(${angle}) scale(${1 - press * 0.035})`}>
      <ellipse cx={14} cy={1100} rx={130} ry={1000} fill="rgba(30,30,40,0.10)" transform="translate(18 26)" />
      {/* рукав */}
      <path d="M -66 206 L 78 206 L 150 2100 L -170 2100 Z" fill={C.sleeve} />
      <path d="M -70 196 Q 6 180 82 196 L 84 238 Q 6 224 -72 238 Z" fill={C.sleeveShade} />
      {/* часы на запястье */}
      <rect x={-58} y={170} width={124} height={30} rx={10} fill="#3B3B46" />
      {/* ладонь */}
      <path d="M -56 96 Q -70 150 -58 200 L 72 200 Q 88 150 72 104 Q 60 84 30 86 L -30 86 Q -52 86 -56 96 Z" fill={C.skin} />
      {flat ? (
        // ладонь раскрыта (кладёт телефон): пальцы вытянуты
        [0, 1, 2, 3].map((i) => <rect key={i} x={-44 + i * 26} y={-6 + Math.abs(i - 1.5) * 8} width={22} height={100} rx={11} fill={C.skin} stroke={C.skinShade} strokeWidth={2} />)
      ) : (
        <>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-2 + i * 24} ${92 + i * 4} q 14 -8 26 2 q 6 30 -4 46 q -14 8 -24 -2 Z`} fill={C.skinShade} opacity={0.9} />
          ))}
          <path d={`M -34 100 L -34 ${16 + press * 6} Q -34 0 -18 0 Q -2 0 -2 ${16 + press * 6} L -2 100 Z`} fill={C.skin} stroke={C.skinShade} strokeWidth={3} />
          <path d={`M -28 ${14 + press * 6} Q -18 6 -8 ${14 + press * 6}`} fill="none" stroke="#F3D3BC" strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      {/* большой палец */}
      <path d="M -56 132 Q -94 114 -102 84 Q -104 68 -90 68 Q -72 80 -44 106 Z" fill={C.skin} stroke={C.skinShade} strokeWidth={3} />
    </g>
  </svg>
);

// ---------- Предметы рабочего стола (вид сверху) ----------
// Столешница: светлое дерево и пятно утреннего солнца из окна; light 0…1 —
// время утра (пятно смещается и становится теплее).
export const DeskTop: React.FC<{ readonly light: number; readonly children?: React.ReactNode }> = ({ light, children }) => (
  <div style={abs({ inset: 0, background: C.desk, overflow: "hidden" })}>
    {Array.from({ length: 14 }).map((_, i) => (
      <div key={i} style={abs({ left: -40, right: -40, top: 60 + i * 140 + (i % 3) * 12, height: 3, background: C.deskGrain, borderRadius: 2, transform: `rotate(${(i % 2 ? 0.6 : -0.4)}deg)` })} />
    ))}
    {/* солнечное пятно от окна */}
    <div
      style={abs({
        left: -300 + light * 520,
        top: -200 + light * 160,
        width: 900,
        height: 1300,
        background: `linear-gradient(135deg, rgba(255,236,170,${0.42 - 0.12 * light}) 0%, rgba(255,240,200,0) 70%)`,
        transform: "skewX(-18deg)",
      })}
    />
    {children}
  </div>
);

// Настольные часы (вид сверху, чуть наклонены). minutes — от 0:00.
export const DeskClock: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly minutes: number }> = ({ x, y, r = 92, minutes }) => {
  const mAng = (minutes % 60) * 6;
  const hAng = ((minutes / 60) % 12) * 30;
  return (
    <svg width={r * 2 + 40} height={r * 2 + 40} viewBox={`${-r - 20} ${-r - 20} ${r * 2 + 40} ${r * 2 + 40}`} style={abs({ left: x - r - 20, top: y - r - 20 })}>
      <circle cx={8} cy={12} r={r} fill="rgba(40,30,20,0.14)" />
      <circle cx={0} cy={0} r={r} fill="#FFFFFF" stroke={C.navy} strokeWidth={10} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-3} y={-r + 14} width={6} height={i % 3 === 0 ? 18 : 10} rx={3} fill={C.navy} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-5} y={-r * 0.5} width={10} height={r * 0.56} rx={5} fill={C.navy} transform={`rotate(${hAng})`} />
      <rect x={-3.5} y={-r * 0.78} width={7} height={r * 0.84} rx={3.5} fill={C.yellow} stroke={C.navy} strokeWidth={1.5} transform={`rotate(${mAng})`} />
      <circle cx={0} cy={0} r={8} fill={C.navy} />
    </svg>
  );
};

// Блокнот с ручкой.
export const Notebook: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number }> = ({ x, y, rot = -8 }) => (
  <div style={abs({ left: x, top: y, width: 300, height: 380, transform: `rotate(${rot}deg)` })}>
    <div style={abs({ left: 10, top: 14, width: 300, height: 380, borderRadius: 14, background: "rgba(40,30,20,0.12)" })} />
    <div style={abs({ left: 0, top: 0, width: 300, height: 380, borderRadius: 14, background: "#FFFFFF", border: "2px solid #E3E8F0" })} />
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} style={abs({ left: 30, right: 30, top: 70 + i * 34, height: 3, background: "#E1E8F3" })} />
    ))}
    <div style={abs({ left: 0, top: 0, width: 26, height: 380, borderRadius: "14px 0 0 14px", background: "#5C86D6" })} />
    <div style={abs({ left: 200, top: 40, width: 18, height: 300, borderRadius: 9, background: C.navy, transform: "rotate(14deg)" })} />
    <div style={abs({ left: 203, top: 300, width: 12, height: 40, borderRadius: "0 0 8px 8px", background: C.yellow, transform: "rotate(14deg)" })} />
  </div>
);

// Небольшое растение в горшке (вид сверху).
export const Plant: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={260 * s} height={260 * s} viewBox="-130 -130 260 260" style={abs({ left: x - 130 * s, top: y - 130 * s })}>
    <circle cx={10} cy={14} r={92} fill="rgba(40,30,20,0.12)" />
    <circle cx={0} cy={0} r={88} fill="#E07A5F" />
    <circle cx={0} cy={0} r={72} fill="#7A5A44" />
    {Array.from({ length: 9 }).map((_, i) => (
      <ellipse key={i} cx={0} cy={-52} rx={22} ry={56} fill={i % 2 ? "#6FAF63" : "#5B9A52"} transform={`rotate(${i * 40})`} />
    ))}
    <circle cx={0} cy={0} r={16} fill="#8CC77C" />
  </svg>
);

// Ноутбук сверху: open 1 — открыт (над клавиатурой виден экран с таблицей),
// 0.5 — экран стоит вертикально (виден только торец), 0 — закрыт (крышка
// лежит на клавиатуре). Клавиатура не двигается; петля — верх клавиатуры.
export const LAPTOP_SCREEN = 0.56; // высота экрана сверху / ширина

export const laptopEdgeY = (y: number, w: number, open: number) => {
  const deck = w * 0.62;
  const hinge = y + w * LAPTOP_SCREEN;
  return open >= 0.5 ? hinge - w * LAPTOP_SCREEN * (2 * open - 1) : hinge + deck * (1 - 2 * open);
};

export const LaptopTop: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly open: number }> = ({ x, y, w = 620, open }) => {
  const deck = w * 0.62;
  const maxScreen = w * LAPTOP_SCREEN;
  const screen = maxScreen * Math.max(0, 2 * open - 1);
  const lid = deck * Math.max(0, 1 - 2 * open);
  return (
    <div style={abs({ left: x, top: y, width: w, height: deck + maxScreen })}>
      <div style={abs({ left: 12, top: maxScreen + 16, width: w, height: deck, borderRadius: 22, background: "rgba(40,30,20,0.14)" })} />
      {/* экран (в перспективе сверху) */}
      {screen > 2 ? (
        <div style={abs({ left: w * 0.02, top: maxScreen - screen, width: w * 0.96, height: screen, borderRadius: "18px 18px 4px 4px", background: "#2B3346", overflow: "hidden" })}>
          <div style={abs({ left: 14, top: 14, right: 14, bottom: 10, borderRadius: 8, background: "#F5F8FC" })}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={abs({ left: 18, right: 18 + (i % 3) * 40, top: 18 + i * (screen / 7.5), height: Math.max(2, screen / 22), borderRadius: 3, background: i === 0 ? "#9DB7E3" : "#DCE4F0" })} />
            ))}
          </div>
        </div>
      ) : null}
      {/* корпус с клавиатурой */}
      <div style={abs({ left: 0, top: maxScreen, width: w, height: deck, borderRadius: 22, background: "#C9D1DD", overflow: "hidden" })}>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} style={abs({ left: 40, right: 40, top: 30 + r * 46, height: 34, display: "flex", gap: 8 })}>
            {Array.from({ length: 12 }).map((__, k) => (
              <div key={k} style={{ flex: 1, borderRadius: 6, background: "#E9EDF3" }} />
            ))}
          </div>
        ))}
        <div style={abs({ left: w * 0.36, top: deck - 120, width: w * 0.28, height: 90, borderRadius: 12, background: "#D8DEE7" })} />
      </div>
      {/* крышка (задняя сторона экрана) ложится на клавиатуру от петли */}
      {lid > 2 ? (
        <div style={abs({ left: 0, top: maxScreen, width: w, height: lid, borderRadius: 22, background: "linear-gradient(160deg, #DCE2EA, #BCC5D3)", boxShadow: "0 6px 14px rgba(40,30,20,0.12)" })}>
          <div style={abs({ left: w / 2 - 34, top: lid / 2 - 34, width: 68, height: 68, borderRadius: 34, background: "rgba(255,255,255,0.45)", opacity: Math.min(1, lid / deck) })} />
        </div>
      ) : null}
    </div>
  );
};

// Стикер на столе/мониторе.
export const Sticky: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly rot?: number; readonly children: React.ReactNode; readonly opacity?: number; readonly scale?: number }> = ({
  x,
  y,
  w = 300,
  rot = -4,
  children,
  opacity = 1,
  scale = 1,
}) => (
  <div style={abs({ left: x, top: y, width: w, opacity, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: "50% 0" })}>
    <div style={{ padding: "26px 22px 22px", background: C.yellowSoft, borderRadius: 6, boxShadow: "0 12px 22px rgba(40,30,20,0.16)", borderTop: `16px solid ${C.yellow}` }}>{children}</div>
  </div>
);
