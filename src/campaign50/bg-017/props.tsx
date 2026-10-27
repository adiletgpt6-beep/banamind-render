// Реквизит BG-017: фильтры мелка и бумаги, детские рисунки-иконки (дом,
// школа, работа, машина, семья), руки взрослых и ребёнка (вид сверху),
// белая машина маршрута с пристёгнутыми детьми.
import type { Pt } from "./geometry";

export const NAVY = "#1E3A6E";
export const YELLOW = "#FFC928";
export const CRAYON_YELLOW = "#F6B800";
export const RED_PENCIL = "#D9443A";
export const PAPER = "#FFFDF6";
export const GRAPHITE = "#4A4E5A";

// ---------- Фильтры ----------
// «Мелок»: лёгкое дрожание края + зернистость бумаги сквозь штрих.
// «Бумага»: мягкое волокно листа. Фильтры детерминированы (seed).
export const Defs: React.FC = () => (
  <defs>
    <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={5} xChannelSelector="R" yChannelSelector="G" result="wob" />
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={9} result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="mask" />
      <feComposite in="wob" in2="mask" operator="in" />
    </filter>
    <filter id="crayonB" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={11} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={5} xChannelSelector="R" yChannelSelector="G" result="wob" />
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={13} result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="mask" />
      <feComposite in="wob" in2="mask" operator="in" />
    </filter>
    <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={7} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={2} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.38  0 0 0 0.07 0" />
    </filter>
    <filter id="wood" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves={3} seed={12} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.35 0" />
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
  </defs>
);

// Подпись «от руки» (Nunito под фильтром мелка).
export const Scrawl: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly size?: number;
  readonly color?: string;
  readonly rot?: number;
  readonly weight?: number;
  readonly anchor?: "start" | "middle" | "end";
  readonly opacity?: number;
  readonly reveal?: number; // 0…1 — «пишется» слева направо
}> = ({ x, y, text, size = 40, color = NAVY, rot = 0, weight = 900, anchor = "middle", opacity = 1, reveal = 1 }) => {
  const shown = Math.round(text.length * Math.min(1, Math.max(0, reveal)));
  return (
    <text
      x={x}
      y={y}
      transform={`rotate(${rot} ${x} ${y})`}
      fontFamily="Nunito"
      fontWeight={weight}
      fontSize={size}
      fill={color}
      textAnchor={anchor}
      opacity={opacity}
      filter="url(#pencil)"
    >
      {text.slice(0, shown)}
    </text>
  );
};

const ink = (color: string, w = 7, fill = "none") => ({
  stroke: color,
  strokeWidth: w,
  fill,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

// ---------- Детские рисунки ----------
export const House: React.FC<{ readonly p: Pt; readonly s?: number; readonly label?: string }> = ({ p, s = 1, label = "ҮЙ" }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
    <g filter="url(#crayon)">
      <path d="M -62 -10 L -62 70 L 62 70 L 62 -10" {...ink("#C0562F", 8, "#FFE7B8")} />
      <path d="M -82 -6 L 0 -78 L 82 -6 Z" {...ink("#B5402A", 8, "#E86F4A")} />
      <path d="M -14 70 L -14 28 L 16 28 L 16 70" {...ink("#6E4128", 6, "#8C5A3C")} />
      <rect x={26} y={6} width={26} height={24} {...ink("#2F6BD8", 5, "#9ED3F5")} />
    </g>
    {label ? <Scrawl x={0} y={118} text={label} size={40} /> : null}
  </g>
);

export const School: React.FC<{ readonly p: Pt; readonly s?: number; readonly flag?: number }> = ({ p, s = 1, flag = 0 }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
    <g filter="url(#crayon)">
      <path d="M -96 -40 L -96 70 L 96 70 L 96 -40 Z" {...ink("#B07A12", 8, "#FFF1C2")} />
      <path d="M -110 -36 L 0 -84 L 110 -36" {...ink("#B07A12", 8)} />
      {[-62, -20, 22, 64].map((x) => (
        <rect key={x} x={x - 12} y={-14} width={24} height={24} {...ink("#2F6BD8", 4, "#9ED3F5")} />
      ))}
      <path d="M -14 70 L -14 30 L 14 30 L 14 70" {...ink("#6E4128", 5, "#8C5A3C")} />
      <path d="M 0 -84 L 0 -134" {...ink(GRAPHITE, 5)} />
      <path d={`M 0 -134 Q ${18 + flag * 4} ${-142 + flag * 3} 40 -130 L 40 -108 Q ${20 - flag * 3} ${-118 - flag * 2} 0 -112 Z`} {...ink("#B02A2A", 4, "#E03A3A")} />
    </g>
    <Scrawl x={0} y={118} text="МЕКТЕП" size={38} />
  </g>
);

export const Office: React.FC<{ readonly p: Pt; readonly color: string; readonly s?: number }> = ({ p, color, s = 1 }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
    <g filter="url(#crayon)">
      <rect x={-46} y={-84} width={92} height={154} {...ink(color, 8, "#E8F0FF")} />
      {[-58, -26, 6, 38].map((y) => (
        <g key={y}>
          <rect x={-30} y={y} width={20} height={18} fill={color} opacity={0.55} />
          <rect x={10} y={y} width={20} height={18} fill={color} opacity={0.55} />
        </g>
      ))}
    </g>
    <Scrawl x={0} y={112} text="ИШ" size={36} color={color} />
  </g>
);

export const DrawnCar: React.FC<{ readonly p: Pt; readonly s?: number; readonly rot?: number }> = ({ p, s = 1, rot = 0 }) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(${rot}) scale(${s})`} filter="url(#crayon)">
    <path d="M -64 10 L -60 -12 Q -44 -16 -30 -34 L 26 -34 Q 40 -16 62 -12 L 66 10 Z" {...ink(GRAPHITE, 6, "#FFFFFF")} />
    <path d="M -26 -14 L -18 -28 L 0 -28 L 0 -14 Z M 8 -14 L 8 -28 L 22 -28 L 32 -14 Z" {...ink("#2F6BD8", 3, "#9ED3F5")} />
    <circle cx={-36} cy={12} r={13} {...ink("#333", 4, "#555")} />
    <circle cx={38} cy={12} r={13} {...ink("#333", 4, "#555")} />
  </g>
);

// Семья палочками у дома: мама, папа, ребёнок.
export const StickFamily: React.FC<{ readonly p: Pt; readonly bob?: number }> = ({ p, bob = 0 }) => {
  const person = (x: number, h: number, c: string, dress: boolean, ph: number) => {
    const y = -Math.abs(Math.sin(bob * Math.PI * 2 + ph)) * 6;
    return (
      <g transform={`translate(${x} ${y})`}>
        <circle cx={0} cy={-h} r={h * 0.18} {...ink(GRAPHITE, 4, "#FFE0C2")} />
        {dress ? <path d={`M 0 ${-h * 0.8} L ${-h * 0.2} ${-h * 0.25} L ${h * 0.2} ${-h * 0.25} Z`} {...ink(c, 4, c)} /> : <path d={`M 0 ${-h * 0.8} L 0 ${-h * 0.3}`} {...ink(c, 6)} />}
        <path d={`M ${-h * 0.22} ${-h * 0.62} L ${h * 0.22} ${-h * 0.62}`} {...ink(c, 4)} />
        <path d={`M 0 ${-h * 0.3} L ${-h * 0.14} 0 M 0 ${-h * 0.3} L ${h * 0.14} 0`} {...ink(GRAPHITE, 4)} />
      </g>
    );
  };
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} filter="url(#crayon)">
      {person(-34, 86, "#2F6BD8", true, 0)}
      {person(0, 96, "#2EA05A", false, 0.33)}
      {person(32, 58, "#E86F4A", true, 0.66)}
    </g>
  );
};

// ---------- Руки (вид сверху) ----------
// Кончик указательного пальца — в (0, 0), рука уходит вниз по +y;
// angle поворачивает руку (откуда она входит в кадр).
export type HandPose = "flat" | "point" | "pencil";

export const AdultHand: React.FC<{
  readonly at: Pt;
  readonly angle: number;
  readonly pose: HandPose;
  readonly sleeve: string;
  readonly cuff?: string;
  readonly skin?: string;
  readonly pencil?: string;
  readonly s?: number;
  readonly opacity?: number;
}> = ({ at, angle, pose, sleeve, cuff, skin = "#E7B48E", pencil = RED_PENCIL, s = 1, opacity = 1 }) => {
  const crease = "rgba(140,70,40,0.28)";
  const nail = "rgba(255,236,224,0.85)";
  // палец — капсула от основания (на ладони) к кончику, с ногтем
  const finger = (x1: number, y1: number, x2: number, y2: number, w: number, withNail = true) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const rot = (Math.atan2(uy, ux) * 180) / Math.PI + 90;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={skin} strokeWidth={w} strokeLinecap="round" />
        {withNail ? <ellipse cx={x2 - ux * w * 0.22} cy={y2 - uy * w * 0.22} rx={w * 0.3} ry={w * 0.36} fill={nail} transform={`rotate(${rot} ${x2 - ux * w * 0.22} ${y2 - uy * w * 0.22})`} /> : null}
        <path d={`M ${x1 + (x2 - x1) * 0.55 - uy * w * 0.3} ${y1 + (y2 - y1) * 0.55 + ux * w * 0.3} l ${uy * w * 0.6} ${-ux * w * 0.6}`} stroke={crease} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  };
  const palm = "M -64 236 C -70 190 -76 130 -62 84 C -52 52 -30 38 0 36 C 34 34 66 42 78 74 C 90 112 84 190 72 236 Z";
  // смещение: кончик указательного пальца / грифеля — в (0, 0)
  const shift = pose === "point" ? "translate(12 132)" : pose === "pencil" ? "translate(-18 64)" : "translate(0 40)";
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${s})`} opacity={opacity}>
      <g transform={shift}>
        {/* мягкая тень на бумаге */}
        <ellipse cx={24} cy={230} rx={100} ry={190} fill="rgba(60,30,10,0.16)" filter="url(#soft)" />
        <rect x={-80} y={214} width={170} height={1100} rx={40} fill={sleeve} />
        <rect x={-84} y={206} width={178} height={42} rx={20} fill={cuff ?? sleeve} />
        {pose === "flat" ? (
          <g>
            {finger(-44, 70, -60, -16, 30)}
            {finger(-12, 60, -16, -50, 32)}
            {finger(22, 60, 28, -44, 32)}
            {finger(54, 74, 70, -6, 28)}
            {finger(-56, 168, -104, 92, 34)}
          </g>
        ) : pose === "point" ? (
          <g>
            {finger(-12, 70, -12, -116, 32)}
            {finger(22, 62, 26, 22, 32, false)}
            {finger(50, 70, 56, 36, 30, false)}
            {finger(72, 92, 76, 64, 26, false)}
            {finger(-56, 168, -84, 110, 34)}
          </g>
        ) : (
          <g>
            {/* карандаш лежит между большим и указательным пальцами */}
            <g transform="translate(18 -64) rotate(-28)">
              <rect x={-7} y={14} width={14} height={230} fill={pencil} />
              <path d="M -7 14 L 0 -6 L 7 14 Z" fill="#F2D2A6" />
              <path d="M -2.5 2 L 0 -6 L 2.5 2 Z" fill={pencil} />
            </g>
            {finger(-56, 168, -36, 70, 34)}
            {finger(-6, 70, 2, -40, 32)}
            {finger(26, 66, 36, 6, 30, false)}
            {finger(52, 76, 62, 26, 28, false)}
            {finger(72, 96, 80, 60, 24, false)}
          </g>
        )}
        <path d={palm} fill={skin} />
        <path d="M -36 70 Q 8 84 56 70" stroke={crease} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M -20 120 Q 10 128 40 118" stroke={crease} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
      </g>
    </g>
  );
};

// Рука ребёнка с жёлтым мелком (кончик мелка — в (0, 0)).
export const ChildHand: React.FC<{ readonly at: Pt; readonly angle: number; readonly opacity?: number }> = ({ at, angle, opacity = 1 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(0.85)`} opacity={opacity}>
    <ellipse cx={30} cy={170} rx={70} ry={130} fill="rgba(60,30,10,0.15)" filter="url(#soft)" />
    <g transform="rotate(-20)">
      <rect x={-11} y={0} width={22} height={86} rx={5} fill={CRAYON_YELLOW} />
      <rect x={-11} y={26} width={22} height={34} fill="#FFFFFF" opacity={0.85} />
      <path d="M -11 2 Q 0 -10 11 2 Z" fill="#E8A800" />
    </g>
    <circle cx={20} cy={64} r={30} fill="#F0C29E" />
    <circle cx={44} cy={84} r={24} fill="#F0C29E" />
    <path d="M -36 120 Q -40 60 0 52 L 50 60 Q 76 90 66 140 Q 50 180 0 176 Q -34 166 -36 120 Z" fill="#F0C29E" />
    <rect x={-50} y={160} width={124} height={900} rx={34} fill="#F28FB0" />
    <rect x={-52} y={156} width={128} height={28} rx={14} fill="#FFFFFF" opacity={0.85} />
  </g>
);

// ---------- Белая машина маршрута (вид сбоку): дети на сиденьях, ремни ----------
export const RouteCar: React.FC<{ readonly p: Pt; readonly flip?: boolean; readonly s?: number; readonly bounce?: number }> = ({ p, flip = false, s = 1, bounce = 0 }) => (
  <g transform={`translate(${p[0]} ${p[1] + bounce}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={36} rx={96} ry={10} fill="rgba(30,20,10,0.18)" />
    <path d="M -94 20 L -92 -6 Q -86 -18 -64 -20 L -40 -48 Q -34 -54 -24 -54 L 34 -54 Q 46 -54 54 -46 L 76 -20 Q 94 -16 96 -2 L 96 20 Q 96 26 90 26 L -88 26 Q -94 26 -94 20 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
    {/* окна и дети в креслах с ремнями */}
    <path d="M -34 -22 L -20 -46 L 2 -46 L 2 -22 Z" fill="#CFE9FB" stroke={NAVY} strokeWidth={3} />
    <path d="M 10 -22 L 10 -46 L 34 -46 Q 40 -46 44 -40 L 58 -22 Z" fill="#CFE9FB" stroke={NAVY} strokeWidth={3} />
    {[-10, 26].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy={-33} r={8} fill="#F0C29E" />
        <path d={`M ${x - 7} -38 Q ${x} -46 ${x + 7} -38`} stroke="#3A2A20" strokeWidth={4} fill="none" />
        <rect x={x - 9} y={-25} width={18} height={6} rx={3} fill={i ? "#E86F4A" : "#2F6BD8"} />
        {/* диагональный ремень безопасности */}
        <path d={`M ${x - 9} -27 L ${x + 8} -21`} stroke="#22314F" strokeWidth={3} strokeLinecap="round" />
      </g>
    ))}
    <rect x={-60} y={-6} width={130} height={7} rx={3} fill={YELLOW} />
    <circle cx={-56} cy={26} r={16} fill="#2B2F3A" />
    <circle cx={-56} cy={26} r={6} fill="#C9CED8" />
    <circle cx={58} cy={26} r={16} fill="#2B2F3A" />
    <circle cx={58} cy={26} r={6} fill="#C9CED8" />
    <rect x={86} y={-10} width={8} height={7} rx={2} fill="#FFE27A" />
  </g>
);

// Стрелка-наконечник в точке p, направление angle (град).
export const ArrowHead: React.FC<{ readonly p: Pt; readonly angle: number; readonly color: string; readonly s?: number; readonly opacity?: number }> = ({ p, angle, color, s = 1, opacity = 1 }) => (
  <path
    d="M -26 -22 L 6 0 L -26 22"
    transform={`translate(${p[0]} ${p[1]}) rotate(${angle}) scale(${s})`}
    stroke={color}
    strokeWidth={12}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
  />
);
