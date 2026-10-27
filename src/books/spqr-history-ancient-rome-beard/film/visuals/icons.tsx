// Значки (из BM-027) — собственный плоский 2D-стиль BanaMind, используются выборочно.
// BanaMind (чёткий контур, светлые заливки). Условные пиктограммы, а не
// реконструкции: колос, животное, амбар, дома, слиток стали, ружьё (как слово
// названия книги, без сцен насилия), микроб, лошадь, корабль, свиток, корона,
// шестерня, стеклянная линза. Центр значка — (0, 0), размер ≈ 120×120 при s = 1.
import React from "react";
import { C, HEAVY } from "../theme";
import { clamp01 } from "./kit";

export const OL = "#24283a";

type IP = { x?: number; y?: number; s?: number; k?: number; color?: string; t?: number; rot?: number };
const G: React.FC<IP & { children: React.ReactNode }> = ({ x = 0, y = 0, s = 1, k = 1, rot = 0, children }) => {
  if (k <= 0.001) return null;
  const kk = clamp01(k);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (0.6 + 0.4 * kk)})`} opacity={clamp01(kk * 1.5)}>
      {children}
    </g>
  );
};

export const Wheat: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M 0 60 Q 4 0 0 -60" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" />
    {[-44, -24, -4, 16].map((y, i) => (
      <g key={i}>
        <ellipse cx={-14} cy={y} rx={10} ry={17} transform={`rotate(-28 -14 ${y})`} fill={p.color ?? C.amber} stroke={OL} strokeWidth={3.5} />
        <ellipse cx={14} cy={y} rx={10} ry={17} transform={`rotate(28 14 ${y})`} fill={p.color ?? C.amber} stroke={OL} strokeWidth={3.5} />
      </g>
    ))}
    <ellipse cx={0} cy={-62} rx={9} ry={15} fill={p.color ?? C.amber} stroke={OL} strokeWidth={3.5} />
  </G>
);

// Условное крупное домашнее животное (без породы): корпус, голова, рожки.
export const Animal: React.FC<IP> = (p) => (
  <G {...p}>
    <ellipse cx={0} cy={56} rx={58} ry={8} fill="#000" opacity={0.08} />
    {[-34, -14, 18, 36].map((x, i) => (
      <rect key={i} x={x - 6} y={10} width={12} height={44} rx={5} fill={OL} />
    ))}
    <ellipse cx={0} cy={0} rx={52} ry={32} fill={p.color ?? "#f2e6d4"} stroke={OL} strokeWidth={5} />
    <circle cx={-14} cy={-6} r={10} fill={OL} opacity={0.75} />
    <circle cx={16} cy={8} r={8} fill={OL} opacity={0.75} />
    <ellipse cx={58} cy={-20} rx={24} ry={20} fill={p.color ?? "#f2e6d4"} stroke={OL} strokeWidth={5} />
    <path d="M 46 -36 Q 40 -54 30 -54 M 70 -36 Q 76 -54 86 -54" stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
    <circle cx={64} cy={-22} r={3.5} fill={OL} />
  </G>
);

export const Horse: React.FC<IP> = (p) => (
  <G {...p}>
    {[-30, -12, 20, 34].map((x, i) => (
      <rect key={i} x={x - 5} y={8} width={10} height={50} rx={4} fill={OL} />
    ))}
    <ellipse cx={0} cy={0} rx={48} ry={24} fill={p.color ?? "#b98552"} stroke={OL} strokeWidth={5} />
    <path d="M 34 -10 L 52 -52 Q 60 -64 74 -56 L 82 -42 Q 70 -38 62 -30 L 46 6 Z" fill={p.color ?? "#b98552"} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 52 -52 Q 40 -40 38 -18" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -46 -6 Q -66 6 -60 30" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
  </G>
);

export const Granary: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M -50 60 L -50 -10 Q 0 -60 50 -10 L 50 60 Z" fill={p.color ?? C.amberSoft} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -62 -6 Q 0 -80 62 -6" fill="none" stroke={OL} strokeWidth={7} strokeLinecap="round" />
    <rect x={-14} y={20} width={28} height={40} rx={4} fill={C.earth} stroke={OL} strokeWidth={4} />
    {[-30, 30].map((x) => (
      <circle key={x} cx={x} cy={10} r={7} fill={C.amber} stroke={OL} strokeWidth={3} />
    ))}
  </G>
);

export const House: React.FC<IP> = (p) => (
  <G {...p}>
    <rect x={-40} y={-10} width={80} height={60} fill={p.color ?? C.cream} stroke={OL} strokeWidth={5} />
    <path d="M -52 -6 L 0 -50 L 52 -6 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-10} y={18} width={20} height={32} fill={C.earth} stroke={OL} strokeWidth={3.5} />
  </G>
);

// Город: несколько домов и башня.
export const City: React.FC<IP> = (p) => (
  <G {...p}>
    <rect x={-70} y={-10} width={44} height={70} fill={C.cream} stroke={OL} strokeWidth={4} />
    <rect x={-22} y={-60} width={44} height={120} fill={C.steelSoft} stroke={OL} strokeWidth={4} />
    <path d="M -28 -60 L 0 -90 L 28 -60 Z" fill={C.amber} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={26} y={0} width={44} height={60} fill={C.cream} stroke={OL} strokeWidth={4} />
    {[-48, 48].map((x) => (
      <rect key={x} x={x - 8} y={14} width={16} height={18} fill={C.sky} stroke={OL} strokeWidth={2.5} />
    ))}
    {[-30, 0, 30].map((y) => (
      <rect key={y} x={-8} y={y - 20} width={16} height={16} fill={C.sky} stroke={OL} strokeWidth={2.5} />
    ))}
  </G>
);

export const Ingot: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M -56 26 L -36 -18 L 36 -18 L 56 26 Z" fill={p.color ?? C.steel} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -36 -18 L -26 -36 L 46 -36 L 36 -18" fill={C.steelSoft} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 36 -18 L 46 -36 L 64 6 L 56 26" fill="#5f6b87" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -24 4 L 22 4" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
  </G>
);

// Ружьё — только как символ названия книги (без выстрела и цели).
export const Musket: React.FC<IP> = (p) => (
  <G {...p}>
    <g transform="rotate(-18)">
      <rect x={-70} y={-7} width={110} height={14} rx={5} fill={C.steel} stroke={OL} strokeWidth={4} />
      <path d="M 30 -10 L 74 -12 Q 86 0 74 16 L 30 12 Z" fill="#a8743f" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 26 10 Q 30 26 18 26" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  </G>
);

export const Germ: React.FC<IP> = (p) => {
  const t = p.t ?? 0;
  const col = p.color ?? C.coral;
  return (
    <G {...p} rot={(p.rot ?? 0) + Math.sin(t * 1.3) * 8}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <g key={i}>
            <line x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * 48} y2={Math.sin(a) * 48} stroke={OL} strokeWidth={5} strokeLinecap="round" />
            <circle cx={Math.cos(a) * 50} cy={Math.sin(a) * 50} r={7} fill={col} stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      <circle r={34} fill={col} stroke={OL} strokeWidth={5} />
      <circle cx={-10} cy={-8} r={7} fill="#fff" opacity={0.55} />
      <circle cx={10} cy={10} r={5} fill={OL} opacity={0.3} />
    </G>
  );
};

export const Ship: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M -70 10 L 70 10 L 50 44 L -50 44 Z" fill="#a8743f" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <line x1={0} y1={10} x2={0} y2={-80} stroke={OL} strokeWidth={6} />
    <path d="M 4 -76 Q 50 -40 4 -2 Z" fill={p.color ?? C.cream} stroke={OL} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -4 -64 Q -44 -34 -4 -2 Z" fill={p.color ?? C.cream} stroke={OL} strokeWidth={4.5} strokeLinejoin="round" />
  </G>
);

// Лодка с балансиром (без опознавательных деталей конкретного народа).
export const Canoe: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M -70 0 Q 0 30 70 0 L 60 18 Q 0 40 -60 18 Z" fill="#a8743f" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <line x1={-20} y1={4} x2={-20} y2={-50} stroke={OL} strokeWidth={4} />
    <line x1={20} y1={4} x2={20} y2={-50} stroke={OL} strokeWidth={4} />
    <path d="M -20 -60 L 20 -60 L 0 -6 Z" fill={p.color ?? C.amberSoft} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <line x1={-40} y1={10} x2={-40} y2={44} stroke={OL} strokeWidth={4} />
    <line x1={40} y1={10} x2={40} y2={44} stroke={OL} strokeWidth={4} />
    <rect x={-60} y={42} width={120} height={10} rx={5} fill="#a8743f" stroke={OL} strokeWidth={3} />
  </G>
);

export const Scroll: React.FC<IP> = (p) => (
  <G {...p}>
    <rect x={-46} y={-50} width={92} height={100} fill={p.color ?? C.cream} stroke={OL} strokeWidth={5} />
    <rect x={-56} y={-62} width={112} height={18} rx={9} fill={C.earth} stroke={OL} strokeWidth={4} />
    <rect x={-56} y={44} width={112} height={18} rx={9} fill={C.earth} stroke={OL} strokeWidth={4} />
    {[-24, -6, 12, 30].map((y, i) => (
      <path key={y} d={`M -30 ${y} L ${i % 2 ? 18 : 30} ${y}`} stroke={OL} strokeWidth={5} strokeLinecap="round" opacity={0.65} />
    ))}
  </G>
);

export const Crown: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M -54 30 L -60 -30 L -28 0 L 0 -44 L 28 0 L 60 -30 L 54 30 Z" fill={p.color ?? C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-56} y={28} width={112} height={18} rx={6} fill={C.amber} stroke={OL} strokeWidth={4} />
    {[-60, 0, 60].map((x, i) => (
      <circle key={x} cx={x} cy={i === 1 ? -48 : -34} r={8} fill={C.coral} stroke={OL} strokeWidth={3} />
    ))}
  </G>
);

export const Gear: React.FC<IP> = (p) => {
  const t = p.t ?? 0;
  const teeth = 10;
  return (
    <G {...p} rot={(p.rot ?? 0) + t * 30}>
      {Array.from({ length: teeth }, (_, i) => (
        <rect key={i} x={-9} y={-56} width={18} height={20} rx={4} fill={p.color ?? C.steel} stroke={OL} strokeWidth={3.5} transform={`rotate(${(i * 360) / teeth})`} />
      ))}
      <circle r={42} fill={p.color ?? C.steel} stroke={OL} strokeWidth={5} />
      <circle r={14} fill={C.cream} stroke={OL} strokeWidth={4} />
    </G>
  );
};

// Стеклянная линза-переменная Лаборатории: ободок, стекло, блик, подпись под ней.
export const Lens: React.FC<IP & { r?: number; glow?: number; label?: string; dim?: number }> = (p) => {
  const r = p.r ?? 70;
  const g = p.glow ?? 0;
  return (
    <G {...p}>
      {g > 0 && <circle r={r + 26} fill={p.color ?? C.teal} opacity={0.18 * g} />}
      <circle r={r} fill={C.glass} opacity={0.75} />
      <circle r={r} fill={p.color ?? C.teal} opacity={0.14 + 0.18 * g} />
      <circle r={r} fill="none" stroke={OL} strokeWidth={6} />
      <circle r={r - 9} fill="none" stroke={p.color ?? C.teal} strokeWidth={5} opacity={0.8} />
      <path d={`M ${-r * 0.55} ${-r * 0.2} A ${r * 0.6} ${r * 0.6} 0 0 1 ${-r * 0.15} ${-r * 0.58}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.85} />
      {p.label && (
        <g transform={`translate(0 ${r + 44})`}>
          <rect x={-p.label.length * 10.5 - 18} y={-26} width={p.label.length * 21 + 36} height={48} rx={24} fill={C.white} stroke={OL} strokeWidth={3} />
          <text y={9} fontFamily={HEAVY} fontWeight={700} fontSize={28} fill={C.ink} textAnchor="middle">
            {p.label}
          </text>
        </g>
      )}
    </G>
  );
};

// Росток/растение: дикое (мелкое) или культурное (крупные плоды).
export const Plant: React.FC<IP & { big?: number; fruit?: string }> = (p) => {
  const b = p.big ?? 0;
  const fr = 8 + b * 10;
  return (
    <G {...p}>
      <path d="M 0 60 Q -4 10 0 -40" stroke={C.sage} strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={-22} cy={10} rx={22} ry={10} transform="rotate(-30 -22 10)" fill={C.sage} stroke={OL} strokeWidth={3.5} />
      <ellipse cx={22} cy={-8} rx={22} ry={10} transform="rotate(30 22 -8)" fill={C.sage} stroke={OL} strokeWidth={3.5} />
      {[-1, 0, 1].map((i) => (
        <circle key={i} cx={i * (12 + b * 6)} cy={-46 - Math.abs(i) * -8} r={fr} fill={p.fruit ?? C.amber} stroke={OL} strokeWidth={3.5} />
      ))}
    </G>
  );
};

// Человек-значок для толп и сравнений (точка-голова + плечи), цвет — роль.
export const Person: React.FC<IP> = (p) => (
  <G {...p}>
    <path d="M -22 40 Q -22 6 0 6 Q 22 6 22 40 Z" fill={p.color ?? C.teal} stroke={OL} strokeWidth={3.5} />
    <circle cx={0} cy={-10} r={14} fill="#f1c9a5" stroke={OL} strokeWidth={3.5} />
  </G>
);

export const ICONS: Record<string, React.FC<IP>> = {
  wheat: Wheat,
  animal: Animal,
  horse: Horse,
  granary: Granary,
  house: House,
  city: City,
  steel: Ingot,
  gun: Musket,
  germ: Germ,
  ship: Ship,
  canoe: Canoe,
  scroll: Scroll,
  crown: Crown,
  gear: Gear,
  plant: Plant,
  person: Person,
};

export const Icon: React.FC<IP & { name: string }> = ({ name, ...p }) => {
  const I = ICONS[name];
  return I ? <I {...p} /> : null;
};
