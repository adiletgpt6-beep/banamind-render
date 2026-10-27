// Графика BG-003: палитра BalaGo, параметрическая 2D-фигура (мама, сын,
// бабушка) с шагом, морганием, взглядом и жестами; семейная серебристая
// машина без марки и надписей (это НЕ машина BalaGo); здания Бишкека
// (кеңсе, мектеп, панельный дом), горы Ала-Тоо, тополя; песочные часы.
// Всё детерминированно по времени t (секунды).
import { Easing, interpolate } from "remotion";

export const NAVY = "#14284B";
export const NAVY_SOFT = "#4A5D80";
export const YELLOW = "#FFC928";
export const YELLOW_DEEP = "#F2A900";
export const YELLOW_SOFT = "#FFF3C4";
export const BG = "#F6F8FC";
export const WA_GREEN = "#25A55A";
export const RED_SOFT = "#E8505B";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => ease(clamp01(x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
// 0→1 за dur секунд начиная с at (t — секунды)
export const prog = (t: number, at: number, dur: number) => clamp01((t - at) / dur);
// мягкий «выстрел» масштаба при появлении
export const popScale = (u: number) =>
  interpolate(u, [0, 0.6, 0.85, 1], [0.6, 1.08, 0.98, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
// кусочно-линейные ключи со сглаживанием между ними
export const keys = (t: number, pts: readonly (readonly [number, number])[]) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (t <= t1) return lerp(v0, v1, easeInOut((t - t0) / Math.max(1e-6, t1 - t0)));
  }
  return pts[pts.length - 1][1];
};
// детерминированное моргание: короткое закрытие век раз в 2,5–4 с
export const blinkAt = (t: number, seed: number) => {
  const period = 3.1 + (seed % 7) * 0.13;
  const ph = (t + seed * 0.71) % period;
  return ph < 0.12 ? Math.sin((ph / 0.12) * Math.PI) : 0;
};

// ---------- Фигура ----------
export type Look = {
  readonly skin: string;
  readonly hair: string;
  readonly hairStyle: "bun" | "boy" | "grey";
  readonly top: string;
  readonly topDark: string;
  readonly inner: string;
  readonly bottom: string;
  readonly shoes: string;
  readonly skirt?: boolean;
  readonly backpack?: string;
};

export const LOOKS = {
  mom: {
    skin: "#E8B48C",
    hair: "#2B1D18",
    hairStyle: "bun",
    top: "#3C79B8",
    topDark: "#2F6299",
    inner: "#FFFFFF",
    bottom: "#24324F",
    shoes: "#1B2233",
  },
  son: {
    skin: "#E9BA92",
    hair: "#231713",
    hairStyle: "boy",
    top: "#FFFFFF",
    topDark: "#DCE3EE",
    inner: "#FFFFFF",
    bottom: "#2E3D63",
    shoes: "#22283A",
    backpack: "#E8505B",
  },
  granny: {
    skin: "#E2AE86",
    hair: "#BFC3CA",
    hairStyle: "grey",
    top: "#8E5A9C",
    topDark: "#774985",
    inner: "#F2E6D8",
    bottom: "#6A4A73",
    shoes: "#3A2B33",
    skirt: true,
  },
} as const satisfies Record<string, Look>;

export type Arm = { readonly a: number; readonly e: number }; // градусы: a — плечо (0 вниз, + вперёд), e — сгиб локтя вперёд
export type Mouth = "smile" | "neutral" | "worry" | "o";

export type FigureProps = {
  readonly look: Look;
  readonly t: number;
  readonly walk?: number; // фаза шага (радианы); растёт с пройденным путём
  readonly walkAmt?: number; // 0…1 размах шага
  readonly armL?: Arm; // дальняя рука
  readonly armR?: Arm; // ближняя рука
  readonly lookX?: number; // −1…1
  readonly lookY?: number; // −1…1 (− вверх)
  readonly mouth?: Mouth;
  readonly worry?: number; // 0…1 брови «домиком»
  readonly headTilt?: number; // градусы
  readonly lean?: number; // наклон корпуса, градусы
  readonly blinkSeed?: number;
  readonly eyesClosed?: number; // 0…1 (вздох)
  readonly phone?: boolean; // телефон в ближней руке
  readonly legs?: boolean; // false — за столом (ноги не рисуются)
};

const P = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const rad = (d: number) => (d * Math.PI) / 180;

// Фигура ростом ≈ 600 (стопы в 0,0), вид 3/4 вправо. Поворот налево —
// scaleX(−1) снаружи.
export const Figure: React.FC<FigureProps> = (p) => {
  const L = p.look;
  const amt = p.walkAmt ?? 0;
  const ph = p.walk ?? 0;
  const bob = -Math.abs(Math.sin(ph)) * 8 * amt;
  const hip = { x: 0, y: -262 + bob };
  const shoulderY = -440 + bob;
  const lean = p.lean ?? 0;

  // ноги: бедро + голень, колено сгибается на заднем ходе
  const leg = (side: 1 | -1) => {
    const s = Math.sin(ph + (side === 1 ? 0 : Math.PI));
    const a = s * 26 * amt;
    const knee = Math.max(0, -Math.cos(ph + (side === 1 ? 0 : Math.PI))) * 34 * amt;
    const hx = hip.x + side * 14;
    const k = { x: hx + Math.sin(rad(a)) * 130, y: hip.y + Math.cos(rad(a)) * 130 };
    const f = { x: k.x + Math.sin(rad(a - knee)) * 128, y: k.y + Math.cos(rad(a - knee)) * 128 };
    const lift = Math.max(0, Math.sin(ph + (side === 1 ? Math.PI / 2 : -Math.PI / 2))) * 10 * amt;
    return (
      <g key={side}>
        <path d={`M ${P(hx, hip.y)} L ${P(k.x, k.y)} L ${P(f.x, f.y - lift)}`} stroke={side === 1 ? L.bottom : shade(L.bottom)} strokeWidth={38} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <ellipse cx={f.x + 14} cy={f.y - lift + 8} rx={30} ry={14} fill={L.shoes} />
      </g>
    );
  };

  const arm = (side: 1 | -1, st: Arm) => {
    const sx = side * 50 * Math.cos(rad(lean));
    const sh = { x: sx + Math.sin(rad(lean)) * 170, y: shoulderY + 18 };
    const swing = Math.sin(ph + (side === 1 ? Math.PI : 0)) * 22 * amt;
    const a = st.a + swing;
    const el = { x: sh.x + Math.sin(rad(a)) * 120, y: sh.y + Math.cos(rad(a)) * 120 };
    const fa = a + st.e;
    const hd = { x: el.x + Math.sin(rad(fa)) * 112, y: el.y + Math.cos(rad(fa)) * 112 };
    const col = side === 1 ? L.top : L.topDark;
    return (
      <g key={`arm${side}`}>
        <path d={`M ${P(sh.x, sh.y)} L ${P(el.x, el.y)} L ${P(hd.x, hd.y)}`} stroke={col} strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {side === 1 && p.phone ? (
          <g transform={`translate(${P(hd.x, hd.y)}) rotate(${-fa + 180})`}>
            <rect x={-22} y={-8} width={44} height={78} rx={9} fill="#1F2A3F" />
            <rect x={-17} y={-2} width={34} height={64} rx={5} fill="#BFE0FF" />
          </g>
        ) : null}
        <circle cx={hd.x} cy={hd.y} r={18} fill={L.skin} />
      </g>
    );
  };

  const torso = (
    <g transform={`rotate(${lean} ${hip.x} ${hip.y})`}>
      {L.backpack ? <rect x={-78} y={shoulderY + 10} width={70} height={150} rx={22} fill={L.backpack} /> : null}
      {L.skirt ? (
        <path d={`M ${P(-58, hip.y - 40)} L ${P(58, hip.y - 40)} L ${P(78, hip.y + 120)} L ${P(-74, hip.y + 120)} Z`} fill={L.bottom} />
      ) : (
        <rect x={-50} y={hip.y - 40} width={100} height={64} rx={24} fill={L.bottom} />
      )}
      <path
        d={`M ${P(-60, shoulderY + 6)} Q ${P(0, shoulderY - 14)} ${P(60, shoulderY + 6)} L ${P(52, hip.y - 4)} Q ${P(0, hip.y + 10)} ${P(-52, hip.y - 4)} Z`}
        fill={L.top}
      />
      <path d={`M ${P(-18, shoulderY - 2)} L ${P(0, shoulderY + 58)} L ${P(18, shoulderY - 2)} Z`} fill={L.inner} />
      {L.hairStyle === "boy" ? <path d={`M ${P(-14, shoulderY + 6)} L ${P(0, shoulderY + 30)} L ${P(14, shoulderY + 6)}`} stroke="#E8505B" strokeWidth={8} fill="none" /> : null}
    </g>
  );

  // голова
  const hx = Math.sin(rad(lean)) * 190;
  const head = { x: hx, y: -528 + bob };
  const blink = Math.max(blinkAt(p.t, p.blinkSeed ?? 1), p.eyesClosed ?? 0);
  const lx = (p.lookX ?? 0.4) * 5;
  const ly = (p.lookY ?? 0) * 5;
  const w = p.worry ?? 0;
  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={-4} rx={9} ry={Math.max(0.8, 11 * (1 - blink))} fill="#FFFFFF" />
      {blink < 0.7 ? <circle cx={cx + lx} cy={-3 + ly} r={6} fill="#1E1A1A" /> : null}
      {blink >= 0.7 ? <path d={`M ${P(cx - 9, -3)} Q ${P(cx, 2)} ${P(cx + 9, -3)}`} stroke="#3A2A24" strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
    </g>
  );
  const mouth = (() => {
    switch (p.mouth ?? "neutral") {
      case "smile":
        return <path d="M 2 30 Q 14 42 28 30" stroke="#8C3B33" strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "worry":
        return <path d="M 4 36 Q 15 28 26 36" stroke="#8C3B33" strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "o":
        return <ellipse cx={15} cy={34} rx={6} ry={7} fill="#8C3B33" />;
      default:
        return <path d="M 5 33 L 25 33" stroke="#8C3B33" strokeWidth={4.5} strokeLinecap="round" />;
    }
  })();
  const hairBack =
    L.hairStyle === "bun" ? (
      <>
        <circle cx={-34} cy={-60} r={32} fill={L.hair} />
        <ellipse cx={-6} cy={-4} rx={66} ry={70} fill={L.hair} />
      </>
    ) : L.hairStyle === "grey" ? (
      <>
        <circle cx={-40} cy={-30} r={28} fill={L.hair} />
        <ellipse cx={-6} cy={-6} rx={64} ry={68} fill={L.hair} />
      </>
    ) : (
      <ellipse cx={-4} cy={-14} rx={64} ry={62} fill={L.hair} />
    );
  const hairFront =
    L.hairStyle === "boy" ? (
      <path d="M -60 -20 Q -58 -70 0 -72 Q 52 -72 62 -22 Q 40 -44 8 -40 Q -30 -46 -60 -20 Z" fill={L.hair} />
    ) : (
      <path d="M -62 -6 Q -60 -70 2 -70 Q 58 -68 64 -14 Q 30 -50 -10 -40 Q -40 -34 -62 -6 Z" fill={L.hair} />
    );

  return (
    <g>
      {arm(-1, p.armL ?? { a: -6, e: 8 })}
      {p.legs === false ? null : (
        <>
          {leg(-1)}
          {leg(1)}
        </>
      )}
      {torso}
      <rect x={head.x - 16} y={head.y + 46} width={32} height={40} rx={10} fill={L.skin} />
      <g transform={`translate(${P(head.x, head.y)}) rotate(${p.headTilt ?? 0})`}>
        {hairBack}
        <ellipse cx={0} cy={0} rx={56} ry={62} fill={L.skin} />
        <ellipse cx={-50} cy={6} rx={10} ry={14} fill={L.skin} />
        {hairFront}
        {/* брови: «домиком» при тревоге */}
        <path d={`M ${P(-14, -23 + w * 3)} L ${P(2, -26 - w * 6)}`} stroke={L.hairStyle === "grey" ? "#8A8F98" : "#2B1D18"} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${P(22, -26 - w * 6)} L ${P(38, -23 + w * 3)}`} stroke={L.hairStyle === "grey" ? "#8A8F98" : "#2B1D18"} strokeWidth={4} strokeLinecap="round" />
        {eye(-6)}
        {eye(30)}
        <path d="M 16 4 Q 22 14 14 18" stroke="#C98D6A" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <circle cx={-18} cy={20} r={8} fill="#F29C8F" opacity={0.35} />
        <circle cx={42} cy={20} r={7} fill="#F29C8F" opacity={0.35} />
        {mouth}
      </g>
      {arm(1, p.armR ?? { a: 6, e: 10 })}
    </g>
  );
};

const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.82);
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

// ---------- Семейная машина героини (серебристая, без марки/надписей) ----------
export const FamilyCar: React.FC<{
  readonly wheel: number; // угол колёс, градусы
  readonly bounce?: number;
  readonly mom?: boolean;
  readonly kid?: boolean;
  readonly doorOpen?: number; // 0…1 — задняя дверь (посадка ребёнка)
}> = ({ wheel, bounce = 0, mom = false, kid = false, doorOpen = 0 }) => {
  const wh = (cx: number) => (
    <g transform={`translate(${cx} 150)`}>
      <circle r={30} fill="#1E2B42" />
      <circle r={15} fill="#C9D2E0" />
      <g transform={`rotate(${wheel})`}>
        <rect x={-2.5} y={-15} width={5} height={30} fill="#7F8BA0" />
        <rect x={-15} y={-2.5} width={30} height={5} fill="#7F8BA0" />
      </g>
    </g>
  );
  return (
    <g>
      <ellipse cx={210} cy={182} rx={200} ry={11} fill="rgba(20,40,75,0.16)" />
      <g transform={`translate(0 ${bounce})`}>
        {/* силуэты в салоне: мама за рулём (впереди), ребёнок сзади */}
        {mom ? (
          <g>
            <circle cx={268} cy={66} r={22} fill={LOOKS.mom.skin} />
            <path d="M 246 62 Q 248 40 270 40 Q 290 42 292 60 Q 280 50 262 54 Z" fill={LOOKS.mom.hair} />
            <circle cx={250} cy={46} r={10} fill={LOOKS.mom.hair} />
          </g>
        ) : null}
        {kid ? (
          <g>
            <circle cx={170} cy={76} r={18} fill={LOOKS.son.skin} />
            <path d="M 152 72 Q 154 56 172 56 Q 188 58 189 72 Q 176 64 160 68 Z" fill={LOOKS.son.hair} />
          </g>
        ) : null}
        <path
          d="M 22 146 Q 12 146 12 130 L 16 104 Q 18 88 38 86 L 104 80 L 152 36 Q 162 26 182 26 L 278 26 Q 296 26 310 40 L 350 82 L 390 90 Q 410 96 410 116 L 410 136 Q 410 146 396 146 Z"
          fill="#C3CAD5"
          stroke={NAVY}
          strokeWidth={5}
          strokeLinejoin="round"
          opacity={0.97}
        />
        {/* окна (полупрозрачные — видны пассажиры) */}
        <path d="M 122 82 L 160 44 Q 168 37 182 37 L 216 37 L 216 82 Z" fill="#9CC0EA" stroke={NAVY} strokeWidth={4} opacity={0.6} />
        <path d="M 230 82 L 230 37 L 276 37 Q 290 37 300 47 L 334 82 Z" fill="#9CC0EA" stroke={NAVY} strokeWidth={4} opacity={0.6} />
        <path d="M 222 86 L 222 140" stroke={NAVY} strokeWidth={3} opacity={0.5} />
        <rect x={392} y={100} width={14} height={12} rx={4} fill="#FFE58A" />
        <rect x={16} y={100} width={12} height={12} rx={4} fill="#F28B82" />
        {/* приоткрытая задняя дверь */}
        {doorOpen > 0 ? (
          <path d={`M 122 86 L ${122 - doorOpen * 60} ${94} L ${122 - doorOpen * 60} ${138} L 122 140 Z`} fill="#AEB6C2" stroke={NAVY} strokeWidth={4} />
        ) : null}
        {wh(96)}
        {wh(330)}
      </g>
    </g>
  );
};

// ---------- Фон Бишкека ----------
export const Mountains: React.FC<{ readonly w: number; readonly y: number; readonly x?: number }> = ({ w, y, x = 0 }) => {
  const peaks: string[] = [];
  const n = Math.ceil(w / 360) + 2;
  for (let i = -1; i < n; i++) {
    const px = x + i * 360;
    const h = 210 + ((i * 53) % 3) * 50;
    peaks.push(`M ${px - 230} ${y} L ${px} ${y - h} L ${px + 230} ${y} Z`);
  }
  const caps: string[] = [];
  for (let i = -1; i < n; i++) {
    const px = x + i * 360;
    const h = 210 + ((i * 53) % 3) * 50;
    caps.push(`M ${px - 62} ${y - h + 62} L ${px} ${y - h} L ${px + 62} ${y - h + 62} L ${px + 28} ${y - h + 50} L ${px + 6} ${y - h + 68} L ${px - 22} ${y - h + 50} Z`);
  }
  return (
    <g>
      <path d={peaks.join(" ")} fill="#B9C9E2" />
      <path d={caps.join(" ")} fill="#FFFFFF" />
    </g>
  );
};

export const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly sway?: number }> = ({ x, y, s = 1, sway = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-6} y={-60} width={12} height={60} fill="#8B6A4E" />
    <g transform={`rotate(${sway} 0 -60)`}>
      <ellipse cx={0} cy={-190} rx={38} ry={140} fill="#7CC48B" />
      <ellipse cx={-10} cy={-200} rx={18} ry={100} fill="#92D3A0" />
    </g>
  </g>
);

export const PanelHouse: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly floors: number; readonly color?: string }> = ({
  x,
  y,
  w,
  floors,
  color = "#E4E9F2",
}) => {
  const fh = 46;
  const cols = Math.floor((w - 30) / 56);
  const win: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++)
    for (let c = 0; c < cols; c++)
      win.push(<rect key={`${f}-${c}`} x={x + 22 + c * 56} y={y - floors * fh - 10 + f * fh + 12} width={30} height={24} rx={3} fill={(f * 7 + c * 3) % 5 === 0 ? "#FFE9A8" : "#AFC6E6"} />);
  return (
    <g>
      <rect x={x} y={y - floors * fh - 18} width={w} height={floors * fh + 18} fill={color} stroke="#C4CFDF" strokeWidth={3} />
      <rect x={x - 6} y={y - floors * fh - 26} width={w + 12} height={12} fill="#C4CFDF" />
      {win}
    </g>
  );
};

// ---------- Песочные часы (символ обеденного часа) ----------
export const Hourglass: React.FC<{ readonly size: number; readonly sand: number; readonly t: number }> = ({ size, sand, t }) => {
  const top = 1 - clamp01(sand); // доля песка вверху
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 200 260" style={{ overflow: "visible" }}>
      <g>
        <rect x={20} y={8} width={160} height={22} rx={10} fill={NAVY} />
        <rect x={20} y={230} width={160} height={22} rx={10} fill={NAVY} />
        <path d="M 40 30 L 160 30 Q 160 90 108 128 L 108 132 Q 160 170 160 230 L 40 230 Q 40 170 92 132 L 92 128 Q 40 90 40 30 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
        {/* песок вверху */}
        <path d={`M ${100 - 52 * top} ${120 - 80 * top} L ${100 + 52 * top} ${120 - 80 * top} L 100 126 Z`} fill={YELLOW} />
        {/* струйка */}
        {top > 0.02 && top < 0.99 ? <rect x={97} y={126} width={6} height={90} fill={YELLOW} opacity={0.8 + 0.2 * Math.sin(t * 20)} /> : null}
        {/* песок внизу */}
        <path d={`M 48 226 L 152 226 L ${152 - 30 * (1 - top)} ${226 - 70 * (1 - top)} L ${48 + 30 * (1 - top)} ${226 - 70 * (1 - top)} Z`} fill={YELLOW} />
      </g>
    </svg>
  );
};

// ---------- Значки ----------
export const LinkIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round">
    <path d="M 10 14 L 14 10" />
    <path d="M 8.5 11.5 L 6.5 13.5 Q 4 16 6.5 18.5 Q 9 21 11.5 18.5 L 13.5 16.5" />
    <path d="M 15.5 12.5 L 17.5 10.5 Q 20 8 17.5 5.5 Q 15 3 12.5 5.5 L 10.5 7.5" />
  </svg>
);

export const WaIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M 12 3 Q 20.5 3 20.5 11.5 Q 20.5 20 12 20 Q 9.6 20 7.7 19 L 3.8 20.2 L 5 16.5 Q 3.5 14.3 3.5 11.5 Q 3.5 3 12 3 Z" fill="#FFFFFF" />
    <path d="M 9 8 L 10.6 8 L 11.2 10.4 L 10.2 11.2 Q 11 13 12.9 13.9 L 13.7 12.9 L 16 13.5 L 16 15 Q 16 16.2 14.7 16.2 Q 8.2 15.6 7.8 9.3 Q 7.8 8 9 8 Z" fill={WA_GREEN} />
  </svg>
);

// Текст со стрелками «→», нарисованными SVG (одинаково во всех шрифтах).
export const ArrowText: React.FC<{ readonly text: string; readonly size: number; readonly color?: string }> = ({ text, size, color = NAVY }) => {
  const parts = text.split("→").map((s) => s.trim());
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3, whiteSpace: "nowrap" }}>
      {parts.map((s, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: size * 0.3 }}>
          {i > 0 ? (
            <svg width={size * 0.9} height={size * 0.6} viewBox="0 0 30 20">
              <path d="M 2 10 L 26 10 M 18 3 L 26 10 L 18 17" stroke={color} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
          <span>{s}</span>
        </span>
      ))}
    </span>
  );
};
