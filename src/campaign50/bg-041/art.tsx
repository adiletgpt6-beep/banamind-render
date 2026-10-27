// Графика BG-041: палитра BalaGo, белая машина BalaGo (вид сбоку, без
// марки; дети в салоне пристёгнуты), жилой дом и школа Бишкека, горы
// Ала-Тоо, тополя, значки. Без зависимостей от сцен.
import { Easing, interpolate } from "remotion";

export const NAVY = "#14284B";
export const NAVY_SOFT = "#4A5D80";
export const YELLOW = "#FFC928";
export const YELLOW_DEEP = "#F2B630";
export const YELLOW_SOFT = "#FFF3C4";
export const BG = "#F6F8FC";
export const GREEN = "#7CC48B";
export const WA_GREEN = "#25A55A";
export const WA_DARK = "#0B6E4F";
export const RED = "#E8463A";
export const INK = "#1E2235";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const easeInOut = (x: number) => ease(clamp01(x));
// 0→1 за dur (тех же единиц) начиная с at
export const prog = (t: number, at: number, dur: number) => clamp01((t - at) / dur);
// мягкий «выстрел» масштаба при появлении (до начала — 0: не виден)
export const popScale = (u: number) =>
  u <= 0 ? 0 : interpolate(u, [0, 0.6, 0.85, 1], [0.6, 1.08, 0.98, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Смешение двух цветов #RRGGBB.
export const mixColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (sh: number) => Math.round(mix((pa >> sh) & 255, (pb >> sh) & 255, clamp01(t)));
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
};

// ---------- Белая машина BalaGo, вид сбоку ----------
// Рисуется носом ВЛЕВО (бордюр и тротуар — за машиной, дети садятся и
// выходят со стороны тротуара, невидимой зрителю). (x, y) — середина
// низа колёс; width — длина машины.
//   kids — дети на заднем сиденье (каждый пристёгнут, ремень виден);
//   son  — 0…1 наш мальчик в заднем окне; driver — водитель за рулём.
export type CarKid = { readonly skin: string; readonly hair: string; readonly shirt: string };
export const CAR_KIDS: readonly CarKid[] = [
  { skin: "#E0AE88", hair: "#2A1E1A", shirt: "#E86F5A" },
  { skin: "#D9A47E", hair: "#3A2C26", shirt: "#7CC48B" },
];
export const SON_IN_CAR: CarKid = { skin: "#E8B48D", hair: "#221B19", shirt: "#2F4A7A" };

export const BalaGoCar: React.FC<{
  readonly uid: string;
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly wheelTurn?: number;
  readonly bounce?: number;
  readonly son?: number;
  readonly kids?: number;
  readonly lights?: number;
}> = ({ uid, x, y, width = 760, wheelTurn = 0, bounce = 0, son = 0, kids = 2, lights = 0 }) => {
  const s = width / 300;
  const kid = (k: CarKid, cx: number, alpha: number, key: string) => (
    <g key={key} opacity={alpha}>
      {/* спинка сиденья */}
      <rect x={cx - 13} y={40} width={26} height={22} rx={6} fill="#5B6B8C" />
      <path d={`M ${cx - 10} 62 L ${cx - 9} 50 Q ${cx} 44 ${cx + 9} 50 L ${cx + 10} 62 Z`} fill={k.shirt} />
      <circle cx={cx} cy={42} r={9.5} fill={k.skin} />
      <path d={`M ${cx - 9.5} 41 Q ${cx} 28 ${cx + 9.5} 41 L ${cx + 9} 37 Q ${cx} 31 ${cx - 9} 37 Z`} fill={k.hair} />
      <circle cx={cx - 3.2} cy={42} r={1.2} fill={INK} />
      <path d={`M ${cx - 4} 46.5 Q ${cx - 1.5} 48.5 ${cx + 1} 46.5`} stroke="#B86A62" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {/* ремень безопасности: от плеча по диагонали */}
      <path d={`M ${cx + 9} 47 L ${cx - 8} 62`} stroke="#2A2F3E" strokeWidth={3.2} strokeLinecap="round" />
      <path d={`M ${cx + 9} 47 L ${cx - 8} 62`} stroke="#8B93A6" strokeWidth={1} strokeLinecap="round" />
    </g>
  );
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} 108)`}>
      <circle r={21} fill="#1E2B42" />
      <circle r={10.5} fill="#C9D2E0" />
      <g transform={`rotate(${-wheelTurn})`}>
        <rect x={-1.6} y={-10} width={3.2} height={20} fill="#7F8BA0" />
        <rect x={-10} y={-1.6} width={20} height={3.2} fill="#7F8BA0" />
      </g>
    </g>
  );
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <g transform={`scale(${s}) translate(-150 -129)`}>
        <ellipse cx={150} cy={127} rx={134} ry={7} fill="rgba(20,40,75,0.16)" />
        <g transform={`translate(0 ${bounce})`}>
          {/* кузов: нос слева */}
          <path
            d="M 282 104 Q 290 104 290 92 L 288 74 Q 286 62 272 60 L 226 56 L 192 26 Q 184 18 170 18 L 104 18 Q 90 18 80 28 L 50 58 L 22 64 Q 8 68 8 82 L 8 96 Q 8 104 18 104 Z"
            fill="#FFFFFF"
            stroke={NAVY}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          {/* окна: переднее (слева) и заднее (справа) */}
          <path d="M 214 58 L 186 32 Q 180 27 170 27 L 144 27 L 144 58 Z" fill="#CFE2F5" stroke={NAVY} strokeWidth={3} />
          <path d="M 134 27 L 106 27 Q 96 27 88 35 L 64 58 L 134 58 Z" fill="#CFE2F5" stroke={NAVY} strokeWidth={3} />
          {/* водитель (руки на руле, без телефона) */}
          <g>
            <rect x={98} y={40} width={26} height={22} rx={6} fill="#5B6B8C" />
            <path d="M 101 62 L 102 49 Q 112 43 122 49 L 123 62 Z" fill="#3F4A63" />
            <circle cx={111} cy={40} r={10.5} fill="#D9A67E" />
            <path d="M 100.5 39 Q 111 25 121.5 39 L 121 35 Q 111 28 101 35 Z" fill="#2B2420" />
            <circle cx={106.5} cy={40} r={1.2} fill={INK} />
            {/* ремень водителя и рука на руле */}
            <path d="M 119 48 L 105 62" stroke="#8B93A6" strokeWidth={3} strokeLinecap="round" />
            <path d="M 112 50 L 92 54" stroke="#D9A67E" strokeWidth={4} strokeLinecap="round" />
            <circle cx={84} cy={52} r={6} fill="none" stroke="#2A2F3E" strokeWidth={2.4} />
          </g>
          {/* дети сзади, пристёгнуты (видны только в заднем окне) */}
          <clipPath id={`rear-${uid}`}>
            <path d="M 214 58 L 186 32 Q 180 27 170 27 L 144 27 L 144 58 Z" />
          </clipPath>
          <g clipPath={`url(#rear-${uid})`}>
            {CAR_KIDS.slice(0, kids).map((k, i) => kid(k, (son > 0 ? 190 : 184) - i * 18, 1, `k${i}`))}
            {son > 0 ? kid(SON_IN_CAR, 156, son, "son") : null}
          </g>
          {/* перерисовать рамку задней стойки поверх детей */}
          <path d="M 144 27 L 144 58" stroke={NAVY} strokeWidth={4} />
          <path d="M 214 58 L 186 32 Q 180 27 170 27 L 144 27 L 144 58 Z" fill="none" stroke={NAVY} strokeWidth={3} />
          {/* жёлтая полоса и надпись BalaGo */}
          <rect x={10} y={70} width={278} height={20} fill={YELLOW} />
          <text x={150} y={86} textAnchor="middle" fontSize={17} fontWeight={900} fill={NAVY} fontFamily="Nunito">
            BalaGo
          </text>
          <path d="M 140 60 L 140 102" stroke="#C9D2E0" strokeWidth={3} />
          <rect x={198} y={94} width={22} height={4} rx={2} fill="#C9D2E0" />
          <rect x={80} y={94} width={22} height={4} rx={2} fill="#C9D2E0" />
          {/* фары: передняя слева, задняя справа */}
          <rect x={12} y={66} width={12} height={8} rx={3} fill="#FFE58A" stroke={NAVY} strokeWidth={2} />
          <rect x={280} y={66} width={8} height={8} rx={2} fill={lights > 0 ? "#FF5A4E" : "#FF8A80"} stroke={NAVY} strokeWidth={2} />
          {lights > 0 ? <circle cx={292} cy={70} r={10} fill="#FF5A4E" opacity={0.35 * lights} /> : null}
        </g>
        {wheel(68)}
        {wheel(228)}
      </g>
    </svg>
  );
};

// ---------- Горы Ала-Тоо со снежными шапками ----------
export const Mountains: React.FC<{ readonly width: number; readonly y: number; readonly shift?: number; readonly far?: string; readonly near?: string }> = ({
  width,
  y,
  shift = 0,
  far = "#D5E0F0",
  near = "#BCCDE6",
}) => {
  const n = Math.ceil((width + 400) / 1100) + 1;
  return (
    <g transform={`translate(${shift} ${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${i * 1100 - 200} 0)`}>
          <path d="M -60 120 L 40 30 L 120 80 L 230 -10 L 330 70 L 420 10 L 540 90 L 640 -20 L 760 60 L 860 0 L 980 80 L 1180 20 L 1180 140 L -60 140 Z" fill={far} />
          <path d="M 230 -10 L 262 18 L 244 14 L 230 26 L 214 12 L 200 16 Z" fill="#FFFFFF" />
          <path d="M 640 -20 L 676 12 L 656 8 L 640 20 L 622 6 L 606 10 Z" fill="#FFFFFF" />
          <path d="M 860 0 L 890 24 L 872 20 L 860 30 L 846 18 L 832 22 Z" fill="#FFFFFF" />
          <path d="M 420 10 L 444 30 L 430 28 L 420 36 L 408 26 L 398 28 Z" fill="#FFFFFF" />
          <path d="M -60 150 L 90 70 L 190 120 L 330 60 L 470 130 L 600 70 L 740 125 L 880 75 L 1180 130 L 1180 170 L -60 170 Z" fill={near} />
        </g>
      ))}
    </g>
  );
};

// ---------- Тополь (типичные деревья бишкекских улиц) ----------
export const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly tone?: string }> = ({ x, y, s = 1, tone = GREEN }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-2.5} y={-14} width={5} height={14} fill="#8A6A4F" />
    <ellipse cx={0} cy={-38} rx={11} ry={30} fill={tone} />
    <ellipse cx={-3} cy={-44} rx={5} ry={16} fill="#9AD6A7" opacity={0.8} />
  </g>
);

// ---------- Значки (SVG, не зависят от шрифтов эмодзи) ----------
export const CheckIcon: React.FC<{ readonly size?: number; readonly color?: string; readonly draw?: number }> = ({ size = 32, color = NAVY, draw = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, overflow: "visible" }}>
    <path
      d="M 4 12.5 L 9.5 18 L 20 6.5"
      fill="none"
      stroke={color}
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - clamp01(draw)}
      opacity={draw > 0 ? 1 : 0}
    />
  </svg>
);

export const HouseIcon: React.FC<{ readonly size?: number; readonly color?: string; readonly fill?: string }> = ({ size = 40, color = NAVY, fill = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 4 11 L 12 4 L 20 11 L 20 20 L 4 20 Z" fill={fill} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <rect x={10} y={13.5} width={4} height={6.5} rx={0.8} fill={YELLOW} stroke={color} strokeWidth={1.3} />
  </svg>
);

export const SchoolIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 40, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 3 21 L 3 10 L 12 4.5 L 21 10 L 21 21 Z" fill="#FFFFFF" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M 12 4.5 L 12 1.8 L 15.5 2.6 L 12 3.4" fill={YELLOW} stroke={color} strokeWidth={1} />
    <rect x={9.5} y={14.5} width={5} height={6.5} rx={0.8} fill={YELLOW} stroke={color} strokeWidth={1.4} />
    <rect x={5} y={11.5} width={3} height={3} rx={0.5} fill="#9CC0EA" stroke={color} strokeWidth={1} />
    <rect x={16} y={11.5} width={3} height={3} rx={0.5} fill="#9CC0EA" stroke={color} strokeWidth={1} />
  </svg>
);

export const ClockIcon: React.FC<{ readonly size?: number; readonly color?: string; readonly minutes?: number }> = ({ size = 40, color = NAVY, minutes = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <circle cx={12} cy={12} r={9} fill="#FFFFFF" stroke={color} strokeWidth={1.9} />
    <path d={`M 12 12 L 12 6.5`} stroke={color} strokeWidth={1.9} strokeLinecap="round" transform={`rotate(${(minutes / 60) * 360} 12 12)`} />
    <path d="M 12 12 L 15.5 13.5" stroke={RED} strokeWidth={1.7} strokeLinecap="round" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ readonly size?: number; readonly bg?: string; readonly fg?: string }> = ({ size = 58, bg = WA_GREEN, fg = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 12 3 Q 20.5 3 20.5 11.5 Q 20.5 20 12 20 Q 9.6 20 7.7 19 L 3.8 20.2 L 5 16.5 Q 3.5 14.3 3.5 11.5 Q 3.5 3 12 3 Z" fill={fg} />
    <path d="M 9 8 L 10.6 8 L 11.2 10.4 L 10.2 11.2 Q 11 13 12.9 13.9 L 13.7 12.9 L 16 13.5 L 16 15 Q 16 16.2 14.7 16.2 Q 8.2 15.6 7.8 9.3 Q 7.8 8 9 8 Z" fill={bg} />
  </svg>
);

export const LinkIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 50, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round">
    <path d="M 10 14 L 14 10" />
    <path d="M 8.5 11.5 L 6.5 13.5 Q 4 16 6.5 18.5 Q 9 21 11.5 18.5 L 13.5 16.5" />
    <path d="M 15.5 12.5 L 17.5 10.5 Q 20 8 17.5 5.5 Q 15 3 12.5 5.5 L 10.5 7.5" />
  </svg>
);

export const SendIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 40, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 3.5 20 L 21 12 L 3.5 4 L 3.5 10.2 L 15 12 L 3.5 13.8 Z" fill={color} />
  </svg>
);

// Стрелка → рисуется SVG (в Nunito её нет — без подмены шрифтом).
export const ArrowGlyph: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = "currentColor" }) => (
  <svg width={size * 1.1} height={size * 0.62} viewBox="0 0 22 12" style={{ display: "inline-block", verticalAlign: "middle", margin: `0 ${size * 0.18}px`, flexShrink: 0 }}>
    <path d="M 2 6 L 20 6 M 15 1.5 L 20 6 L 15 10.5" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowText: React.FC<{ readonly text: string; readonly size: number; readonly arrowColor?: string }> = ({ text, size, arrowColor }) => (
  <>
    {text.split(/(→)/).map((part, i) =>
      part === "→" ? <ArrowGlyph key={i} size={size} color={arrowColor} /> : <span key={i}>{part.trim()}</span>,
    )}
  </>
);

// Значки «перемотка назад», «пауза», «воспроизведение» (SVG).
export const RewIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 40, color = YELLOW }) => (
  <svg width={size * 1.3} height={size} viewBox="0 0 26 20" style={{ flexShrink: 0 }}>
    <path d="M 12.5 2 L 2 10 L 12.5 18 Z M 24 2 L 13.5 10 L 24 18 Z" fill={color} />
  </svg>
);
export const PlayIcon: React.FC<{ readonly size?: number; readonly color?: string; readonly double?: boolean }> = ({ size = 40, color = YELLOW, double }) => (
  <svg width={size * (double ? 1.3 : 0.8)} height={size} viewBox={double ? "0 0 26 20" : "0 0 16 20"} style={{ flexShrink: 0 }}>
    {double ? <path d="M 2 2 L 12.5 10 L 2 18 Z M 13.5 2 L 24 10 L 13.5 18 Z" fill={color} /> : <path d="M 2 2 L 15 10 L 2 18 Z" fill={color} />}
  </svg>
);
export const PauseIcon: React.FC<{ readonly size?: number; readonly color?: string }> = ({ size = 40, color = YELLOW }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 16 20" style={{ flexShrink: 0 }}>
    <rect x={2} y={2} width={4.6} height={16} rx={1.2} fill={color} />
    <rect x={9.4} y={2} width={4.6} height={16} rx={1.2} fill={color} />
  </svg>
);
