// Общие элементы ролика BalaGo «Сабак бүттү»: надписи, фирменная подпись, иконки,
// схема маршрута «үй → мектеп → үй», белая машина (условная 2D-иллюстрация
// без брендинга), экраны телефона (напоминание, WhatsApp-группа, карта,
// форма заявки), карточка пробного дня. Светлый фон, глубокий синий текст,
// небольшие жёлтые акценты. Тексты — кыргызча, крупно.
import { interpolate } from "remotion";
import { fontFamily } from "../fonts";
import { clamp, easeInOut, easeOut } from "../two-schedules-2d/rig/motion";
import { box } from "../two-schedules-2d/shots";
import { Logo } from "../components/Logo";
import { TC_TEXT } from "./script";

export const C = {
  ink: "#14285A",
  ink2: "#3A4F80",
  muted: "#6B7A99",
  yellow: "#FFC90E",
  yellowSoft: "#FFF4C2",
  bg: "#F5F8FC",
  line: "#DCE5F0",
  green: "#2FA36B",
  wa: "#0B7D63",
  waBg: "#EFE7DD",
} as const;

export const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
export const CL = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Светлый фон сцены с мягким градиентом.
export const Backdrop: React.FC<{ tint?: string }> = ({ tint = "#E6F0FA" }) => (
  <div
    style={box({
      inset: 0,
      background: `linear-gradient(180deg, ${C.bg} 0%, ${tint} 100%)`,
    })}
  />
);

// Крупная надпись: строки по центру, мягкое появление снизу.
export const Caption: React.FC<{
  f: number;
  at: number;
  lines: readonly string[];
  top: number;
  size?: number;
  card?: boolean;
  out?: number; // кадр исчезновения
  accent?: number; // строка с жёлтым маркером
}> = ({ f, at, lines, top, size = 60, card = true, out, accent }) => {
  const a = appear(f, at, 12) * (out === undefined ? 1 : 1 - appear(f, out, 8));
  if (a <= 0) return null;
  return (
    <div
      style={box({
        left: 50,
        right: 50,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: a,
        translate: `0 ${(1 - a) * 24}px`,
      })}
    >
      <div
        style={{
          padding: card ? "18px 34px" : 0,
          borderRadius: 30,
          backgroundColor: card ? "rgba(255,255,255,0.95)" : "transparent",
          boxShadow: card ? "0 12px 34px rgba(20,40,90,0.14)" : "none",
          fontFamily,
          fontSize: size,
          fontWeight: 900,
          lineHeight: 1.18,
          color: C.ink,
          textAlign: "center",
        }}
      >
        {lines.map((l, i) => (
          <div key={l}>
            <span
              style={
                i === accent
                  ? {
                      background: `linear-gradient(180deg, transparent 58%, ${C.yellow} 58%)`,
                      padding: "0 6px",
                    }
                  : undefined
              }
            >
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Фирменная подпись: круглый логотип BalaGo (public/assets/logo.png) и
// название. withName={false} — только логотип.
export const Brand: React.FC<{
  size?: number;
  color?: string;
  withName?: boolean;
}> = ({ size = 60, color = C.ink, withName = true }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.3,
      fontFamily,
      color,
    }}
  >
    <Logo
      size={size * 1.5}
      style={{ flex: "none", boxShadow: "0 8px 22px rgba(20,40,90,0.18)" }}
    />
    {withName ? (
      <div
        style={{
          fontSize: size,
          fontWeight: 900,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}
      >
        Bala<span style={{ color: "#F2B705" }}>Go</span>
      </div>
    ) : null}
  </div>
);

// ---------- Иконки ----------
type IconP = { readonly size: number; readonly color?: string };
export const IconHome: React.FC<IconP> = ({ size, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path
      d="M8 22 L24 9 L40 22"
      stroke={color}
      strokeWidth={4.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 21 L12 39 L36 39 L36 21 L24 12 Z" fill={color} />
    <rect x={20} y={27} width={8} height={12} rx={1.5} fill="#FFFFFF" />
  </svg>
);
export const IconSchool: React.FC<IconP> = ({ size, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 5 L24 13" stroke={color} strokeWidth={3} />
    <path d="M24 5 L32 7.5 L24 10 Z" fill={C.yellow} />
    <path d="M9 22 L24 13 L39 22 Z" fill={color} />
    <rect x={11} y={22} width={26} height={18} fill={color} />
    <rect x={21} y={29} width={6} height={11} fill="#FFFFFF" opacity={0.9} />
    <rect x={14} y={26} width={5} height={5} fill="#FFFFFF" opacity={0.9} />
    <rect x={29} y={26} width={5} height={5} fill="#FFFFFF" opacity={0.9} />
  </svg>
);
export const IconSun: React.FC<IconP> = ({ size, color = "#F4A51C" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={9} fill={color} />
    {Array.from({ length: 8 }).map((_, i) => (
      <line
        key={i}
        x1={24}
        y1={5}
        x2={24}
        y2={10}
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        transform={`rotate(${i * 45} 24 24)`}
      />
    ))}
  </svg>
);
// ring 0…1 — звонок качается и затихает.
export const IconBell: React.FC<IconP & { readonly ring?: number }> = ({
  size,
  color = C.ink,
  ring = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <g
      transform={`rotate(${Math.sin(ring * Math.PI * 6) * 14 * (1 - ring)} 24 8)`}
    >
      <path
        d="M24 8 Q14 8 14 20 L14 29 L10 34 L38 34 L34 29 L34 20 Q34 8 24 8 Z"
        fill={color}
      />
      <circle cx={24} cy={38} r={4} fill={color} />
    </g>
  </svg>
);
export const IconCheck: React.FC<IconP> = ({ size, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={21} fill={color} />
    <path
      d="M14 24 L21 31 L34 17"
      stroke="#FFFFFF"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Аватар ребёнка: круг с лицом (без мелких деталей).
export const KidAvatar: React.FC<{
  readonly size: number;
  readonly bg: string;
  readonly hair: string;
  readonly girl?: boolean;
}> = ({ size, bg, hair, girl }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={47} fill={bg} stroke="#FFFFFF" strokeWidth={6} />
    {girl ? <circle cx={22} cy={60} r={10} fill={hair} /> : null}
    {girl ? <circle cx={78} cy={60} r={10} fill={hair} /> : null}
    <ellipse cx={50} cy={57} rx={25} ry={27} fill="#E6B48E" />
    <path
      d={
        girl
          ? "M24 54 Q26 25 50 25 Q74 25 76 54 Q66 39 50 38 Q34 39 24 54 Z"
          : "M25 52 Q27 26 50 26 Q73 26 75 52 Q65 41 50 41 Q36 41 25 52 Z"
      }
      fill={hair}
    />
    <circle cx={41} cy={60} r={3.4} fill="#2A201D" />
    <circle cx={59} cy={60} r={3.4} fill="#2A201D" />
    <path
      d="M42 70 Q50 76 58 70"
      stroke="#B5655F"
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
export const KIDS = [
  { bg: "#BFE3CF", hair: "#221B19", girl: false },
  { bg: "#DCD3F5", hair: "#3B2B24", girl: true },
  { bg: "#FFE0B5", hair: "#3A2A22", girl: false },
] as const;

// ---------- Схема маршрута ----------
// Три точки в ряд: ҮЙ — МЕКТЕП — ҮЙ. draw — прорисовка первого участка
// (утро, солнце), back — второго (после уроков, звонок).
export const RouteStrip: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly draw: number;
  readonly back: number;
  readonly labels?: boolean;
  readonly icons?: boolean;
  readonly node?: number;
}> = ({ x, y, w, draw, back, labels = true, icons = true, node = 120 }) => {
  const xs = [0, w / 2, w];
  const seg = (a: number, b: number, t: number) => (
    <div
      style={box({
        left: a + node / 2,
        top: -7,
        width: Math.max(0, (b - a - node) * clamp(t)),
        height: 14,
        borderRadius: 7,
        backgroundColor: C.yellow,
      })}
    />
  );
  return (
    <div style={box({ left: x, top: y, width: w, height: 0, fontFamily })}>
      <div
        style={box({
          left: node / 2,
          top: -4,
          width: w - node,
          height: 8,
          borderRadius: 4,
          backgroundColor: C.line,
        })}
      />
      {seg(xs[0], xs[1], draw)}
      {seg(xs[1], xs[2], back)}
      {(icons ? [0, 1] : []).map((i) => {
        const a = clamp((i === 0 ? draw : back) * 2);
        return (
          <div
            key={i}
            style={box({
              left: (xs[i] + xs[i + 1]) / 2 - 36,
              top: -node * 0.5 - 70,
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 6px 16px rgba(20,40,90,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: a,
              scale: `${0.7 + 0.3 * easeOut(a)}`,
            })}
          >
            {i === 0 ? <IconSun size={52} /> : <IconBell size={46} />}
          </div>
        );
      })}
      {xs.map((cx, i) => (
        <div
          key={i}
          style={box({
            left: cx - node / 2,
            top: -node / 2,
            width: node,
            height: node,
            borderRadius: node / 2,
            backgroundColor: i === 1 ? C.ink : "#FFFFFF",
            border: `${Math.round(node * 0.05)}px solid ${C.ink}`,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          {i === 1 ? (
            <IconSchool size={node * 0.62} color="#FFFFFF" />
          ) : (
            <IconHome size={node * 0.6} />
          )}
        </div>
      ))}
      {labels
        ? xs.map((cx, i) => (
            <div
              key={`l${i}`}
              style={box({
                left: cx - 150,
                top: node / 2 + 12,
                width: 300,
                textAlign: "center",
                fontSize: Math.round(node * 0.34),
                fontWeight: 900,
                color: C.ink,
              })}
            >
              {TC_TEXT.service.route[i]}
            </div>
          ))
        : null}
    </div>
  );
};

// ---------- Белая машина (вид сбоку) ----------
// Условная иллюстрация: без надписей и логотипов. kids — головы детей в
// окнах; driver — водитель за рулём; door — задняя дверь открыта (0…1).
export const WhiteCar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly dir?: 1 | -1;
  readonly wheel?: number;
  readonly kids?: number;
  readonly driver?: boolean;
  readonly door?: number;
}> = ({
  x,
  y,
  s = 1,
  dir = 1,
  wheel = 0,
  kids = 0,
  driver = true,
  door = 0,
}) => (
  <svg
    width={540 * s}
    height={220 * s}
    viewBox="-270 -200 540 220"
    style={box({ left: x - 270 * s, top: y - 200 * s, overflow: "visible" })}
  >
    <g transform={`scale(${dir} 1)`}>
      <ellipse cx={0} cy={6} rx={250} ry={15} fill="rgba(20,25,40,0.2)" />
      <path
        d="M -248 -42 Q -252 -96 -206 -104 L -132 -112 Q -92 -176 -10 -178 L 74 -176 Q 136 -172 176 -114 L 228 -104 Q 258 -96 256 -50 L 254 -22 L -246 -22 Z"
        fill="#F8F9FB"
        stroke="#AFBACB"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M -114 -114 Q -80 -164 -12 -166 L 64 -164 Q 114 -160 150 -116 Z"
        fill="#A9CBE6"
      />
      <rect x={14} y={-166} width={11} height={54} fill="#F8F9FB" />
      {driver ? (
        <g>
          <circle cx={88} cy={-134} r={20} fill="#D6A27C" />
          <path
            d="M 68 -138 Q 70 -158 88 -158 Q 106 -158 108 -138 Q 98 -150 88 -150 Q 78 -150 68 -138 Z"
            fill="#2B2421"
          />
        </g>
      ) : null}
      {Array.from({ length: kids }).map((_, i) => (
        <g key={i}>
          <circle
            cx={-82 + i * 32}
            cy={-128}
            r={15}
            fill={["#E6B48E", "#E3B08A", "#DDA983"][i % 3]}
          />
          <path
            d={`M ${-97 + i * 32} -131 Q ${-96 + i * 32} -146 ${-82 + i * 32} -146 Q ${-68 + i * 32} -146 ${-67 + i * 32} -131 Z`}
            fill={["#221B19", "#3B2B24", "#3A2A22"][i % 3]}
          />
        </g>
      ))}
      <path
        d="M -248 -54 L 256 -54"
        stroke="rgba(20,40,90,0.10)"
        strokeWidth={4}
      />
      <rect
        x={-196}
        y={-82}
        width={24}
        height={6}
        rx={3}
        fill="rgba(20,40,90,0.25)"
      />
      <rect
        x={40}
        y={-82}
        width={24}
        height={6}
        rx={3}
        fill="rgba(20,40,90,0.25)"
      />
      <rect x={240} y={-84} width={14} height={20} rx={4} fill="#FFE7A8" />
      <rect x={-250} y={-84} width={10} height={20} rx={4} fill="#E25B4E" />
      {[-156, 156].map((wx) => (
        <g key={wx} transform={`translate(${wx} -22) rotate(${wheel})`}>
          <circle r={40} fill="#262A33" />
          <circle r={21} fill="#C2C8D2" />
          <rect x={-3} y={-21} width={6} height={42} fill="#8C929C" />
          <rect x={-21} y={-3} width={42} height={6} fill="#8C929C" />
        </g>
      ))}
      {door > 0 ? (
        <path
          d={`M -10 -166 L -10 -22 L ${-10 - 120 * door} -8 L ${-10 - 112 * door} -152 Z`}
          fill="#EEF0F4"
          stroke="#AFBACB"
          strokeWidth={4}
        />
      ) : null}
    </g>
  </svg>
);

// ---------- Телефон ----------
export const Phone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly children: React.ReactNode;
  readonly shake?: number;
}> = ({ x, y, w, children, shake = 0 }) => {
  const h = w * 2.05;
  return (
    <div
      style={box({
        left: x + shake,
        top: y,
        width: w,
        height: h,
        borderRadius: w * 0.11,
        backgroundColor: "#1E2235",
        boxShadow: "0 40px 80px rgba(20,30,60,0.30)",
      })}
    >
      <div
        style={box({
          left: w * 0.035,
          top: w * 0.035,
          right: w * 0.035,
          bottom: w * 0.035,
          borderRadius: w * 0.085,
          overflow: "hidden",
          backgroundColor: "#F4F6FA",
          fontFamily,
        })}
      >
        {children}
      </div>
      <div
        style={box({
          left: w * 0.38,
          top: w * 0.05,
          width: w * 0.24,
          height: w * 0.05,
          borderRadius: w * 0.03,
          backgroundColor: "#1E2235",
        })}
      />
    </div>
  );
};

// Напоминание (баннер уведомления на телефоне мамы).
export const Reminder: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
}> = ({ f, at, x, y, w }) => {
  const a = appear(f, at, 9);
  if (a <= 0) return null;
  return (
    <div style={box({ left: x, top: y - (1 - a) * 40, width: w, opacity: a })}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "18px 26px",
          borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.97)",
          boxShadow: "0 18px 40px rgba(20,40,90,0.22)",
          fontFamily,
          border: `4px solid ${C.yellow}`,
        }}
      >
        <div
          style={{
            width: 82,
            height: 82,
            borderRadius: 22,
            backgroundColor: C.yellow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <IconBell size={56} ring={clamp((f - at) / 40)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.ink }}>
            {TC_TEXT.hook.time}
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: C.ink2 }}>
            {TC_TEXT.hook.reminder}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- WhatsApp-группа родителей маршрута ----------
// Обычные сообщения водителя и геолокация WhatsApp — не отдельное приложение.
export const WaChat: React.FC<{
  readonly f: number;
  readonly m1: number;
  readonly m2: number;
  readonly loc: number;
  readonly tap?: number;
}> = ({ f, m1, m2, loc, tap }) => {
  const t = TC_TEXT.whatsapp;
  const bubble = (at: number, children: React.ReactNode, time: string) => {
    const a = appear(f, at, 9);
    if (a <= 0) return null;
    return (
      <div
        style={{
          alignSelf: "flex-start",
          maxWidth: "90%",
          padding: "14px 24px 10px",
          borderRadius: "8px 30px 30px 30px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 3px 8px rgba(20,30,60,0.10)",
          opacity: a,
          translate: `0 ${(1 - a) * 26}px`,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, color: C.wa }}>
          {t.driver}
        </div>
        {children}
        <div
          style={{
            fontSize: 24,
            color: "#8A96AE",
            textAlign: "right",
            marginTop: 2,
          }}
        >
          {time}
        </div>
      </div>
    );
  };
  const press =
    tap === undefined
      ? 1
      : interpolate(f, [tap - 4, tap, tap + 6], [1, 0.95, 1], CL);
  return (
    <div style={box({ inset: 0, backgroundColor: C.waBg })}>
      <div
        style={box({
          left: 0,
          right: 0,
          top: 0,
          height: 180,
          backgroundColor: C.wa,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
          padding: "0 24px 22px",
        })}
      >
        <div style={{ fontSize: 44, lineHeight: "60px" }}>‹</div>
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#DDEFE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <IconSchool size={46} color={C.wa} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, fontWeight: 900, whiteSpace: "nowrap" }}>
            {t.group}
          </div>
          <div style={{ fontSize: 25, fontWeight: 600, opacity: 0.85 }}>
            {t.members}
          </div>
        </div>
      </div>
      <div
        style={box({
          left: 22,
          right: 22,
          top: 214,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        })}
      >
        {bubble(
          m1,
          <div style={{ fontSize: 50, fontWeight: 800, color: C.ink }}>
            {t.msg1}
          </div>,
          t.t1,
        )}
        {bubble(
          m2,
          <div style={{ fontSize: 50, fontWeight: 800, color: C.ink }}>
            {t.msg2}
          </div>,
          t.t2,
        )}
        {bubble(
          loc,
          <div style={{ scale: `${press}` }}>
            <div
              style={{
                width: 420,
                height: 230,
                borderRadius: 18,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <MapView f={f} w={420} h={230} progress={0.62} mini />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 40,
                fontWeight: 800,
                color: C.ink,
                marginTop: 8,
              }}
            >
              <svg width={34} height={42} viewBox="0 0 48 60">
                <path
                  d="M24 58 Q6 36 6 22 A18 18 0 0 1 42 22 Q42 36 24 58 Z"
                  fill={C.wa}
                />
                <circle cx={24} cy={22} r={7.5} fill="#FFFFFF" />
              </svg>
              {t.location}
            </div>
          </div>,
          t.t3,
        )}
      </div>
    </div>
  );
};

// Карта: улицы, дом, школа, маршрут и машина (точка на маршруте).
export const MapView: React.FC<{
  readonly f: number;
  readonly w: number;
  readonly h: number;
  readonly progress: number;
  readonly mini?: boolean;
}> = ({ f, w, h, progress, mini }) => {
  const k = w / 400;
  const vh = h / k;
  const pts = [
    [60, vh - 40],
    [60, 110],
    [190, 110],
    [190, 50],
    [340, 50],
  ];
  const segs = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = clamp(progress) * segs.reduce((a, b) => a + b, 0);
  let cx = pts[0][0];
  let cy = pts[0][1];
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const t = segs[i] ? clamp(d / segs[i]) : 1;
      cx = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
      cy = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      break;
    }
    d -= segs[i];
  }
  const pulse = (f / 28) % 1;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 400 ${vh}`}
      style={{ display: "block", backgroundColor: "#E7EDE2" }}
    >
      {[60, 190, 280, 340].map((x) => (
        <rect
          key={`v${x}`}
          x={x - 8}
          y={-10}
          width={16}
          height={vh + 20}
          fill="#FFFFFF"
        />
      ))}
      {[50, 110, vh - 40].map((y) => (
        <rect
          key={`h${y}`}
          x={-10}
          y={y - 8}
          width={420}
          height={16}
          fill="#FFFFFF"
        />
      ))}
      <rect
        x={210}
        y={130}
        width={56}
        height={Math.max(30, vh - 200)}
        rx={8}
        fill="#CFE3C0"
      />
      <rect
        x={90}
        y={140}
        width={80}
        height={Math.max(30, vh - 210)}
        rx={8}
        fill="#DCE3EC"
      />
      <rect x={300} y={74} width={30} height={26} rx={6} fill="#DCE3EC" />
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={C.yellow}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform={`translate(${pts[0][0]} ${pts[0][1]})`}>
        <circle r={17} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
        <path d="M-8 1 L0 -7 L8 1 L8 8 L-8 8 Z" fill={C.ink} />
      </g>
      <g transform="translate(340 50)">
        <circle r={18} fill={C.ink} />
        <path d="M-9 2 L0 -7 L9 2 L9 9 L-9 9 Z" fill="#FFFFFF" />
      </g>
      {!mini ? (
        <circle
          cx={cx}
          cy={cy}
          r={14 + 24 * pulse}
          fill={C.wa}
          opacity={0.35 * (1 - pulse)}
        />
      ) : null}
      <circle
        cx={cx}
        cy={cy}
        r={13}
        fill={C.wa}
        stroke="#FFFFFF"
        strokeWidth={4}
      />
    </svg>
  );
};

// Короткое сообщение водителя на телефоне мамы (вставка поверх сцены).
export const PhoneToast: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly time: string;
}> = ({ f, at, x, y, text, time }) => {
  const a = appear(f, at, 9);
  if (a <= 0) return null;
  return (
    <div
      style={box({
        left: x,
        top: y,
        opacity: a,
        translate: `0 ${(1 - a) * -24}px`,
      })}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "16px 26px",
          borderRadius: 26,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 14px 34px rgba(20,40,90,0.22)",
          fontFamily,
        }}
      >
        <div
          style={{
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: C.wa,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <svg width={38} height={38} viewBox="0 0 48 48">
            <path
              d="M12 25 L20 33 L36 16"
              stroke="#FFFFFF"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.wa }}>
            {TC_TEXT.whatsapp.driver} · {time}
          </div>
          <div style={{ fontSize: 46, fontWeight: 900, color: C.ink }}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Карточка пробного дня ----------
export const TrialDay: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly stamp: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
}> = ({ f, at, stamp, x, y, w }) => {
  const t = TC_TEXT.trial;
  const a = appear(f, at, 12);
  const s = appear(f, stamp, 14);
  const row = (icon: React.ReactNode, label: string, k: number) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "16px 24px",
        borderRadius: 24,
        backgroundColor: "#F3F7FC",
        opacity: appear(f, at + 8 + k * 8, 10),
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 46, fontWeight: 900, color: C.ink, flex: 1 }}>
        {label}
      </div>
      <IconCheck size={58} />
    </div>
  );
  return (
    <div
      style={box({
        left: x,
        top: y,
        width: w,
        opacity: a,
        translate: `0 ${(1 - a) * 30}px`,
        fontFamily,
      })}
    >
      <div
        style={{
          borderRadius: 36,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 20px 46px rgba(20,40,90,0.16)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 96,
            backgroundColor: C.ink,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 50,
            fontWeight: 900,
          }}
        >
          {t.day}
        </div>
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {row(<IconSun size={54} />, t.to, 0)}
          {row(<IconBell size={48} />, t.back, 1)}
        </div>
      </div>
      {s > 0 ? (
        <div
          style={box({
            left: w - 330,
            top: -58,
            width: 380,
            height: 120,
            borderRadius: 28,
            border: `10px solid ${C.green}`,
            color: C.green,
            backgroundColor: "rgba(255,255,255,0.9)",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 70,
            fontWeight: 1000,
            letterSpacing: 4,
            rotate: "8deg",
            opacity: s,
            scale: `${1.2 - 0.2 * easeInOut(s)}`,
          })}
        >
          {t.free}
        </div>
      ) : null}
    </div>
  );
};
