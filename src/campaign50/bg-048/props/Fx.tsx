// Мягкие комедийные эффекты BG-048 (SVG-группы в мировых координатах).
// Все управляются прогрессом k 0…1 и ничего не рисуют при k ≤ 0 или k ≥ 1.
// Без вспышек на большой площади: только небольшие яркие детали.
import { fontFamily } from "../fonts";
import { NAVY, YELLOW } from "../palette";

type P = { readonly k: number; readonly x: number; readonly y: number; readonly scale?: number; readonly color?: string };
const f1 = (n: number) => n.toFixed(1);
const on = (k: number) => k > 0 && k < 1;
const bell = (k: number) => Math.sin(Math.PI * Math.max(0, Math.min(1, k)));

// Лучи и кольцо от точки.
export const Pop: React.FC<P> = ({ k, x, y, scale = 1, color = YELLOW }) => {
  if (!on(k)) return null;
  const r = 30 + 70 * k;
  const o = 1 - k;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${scale.toFixed(3)})`} opacity={o}>
      <circle cx={0} cy={0} r={r} fill="none" stroke={color} strokeWidth={8 * o + 2} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        return <line key={i} x1={Math.cos(a) * r * 0.9} y1={Math.sin(a) * r * 0.9} x2={Math.cos(a) * (r + 30)} y2={Math.sin(a) * (r + 30)} stroke={color} strokeWidth={7} strokeLinecap="round" />;
      })}
    </g>
  );
};

const Twinkle: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <path
    d={`M ${f1(x)} ${f1(y - 22 * s)} Q ${f1(x + 3 * s)} ${f1(y - 3 * s)} ${f1(x + 22 * s)} ${f1(y)} Q ${f1(x + 3 * s)} ${f1(y + 3 * s)} ${f1(x)} ${f1(y + 22 * s)} Q ${f1(x - 3 * s)} ${f1(y + 3 * s)} ${f1(x - 22 * s)} ${f1(y)} Q ${f1(x - 3 * s)} ${f1(y - 3 * s)} ${f1(x)} ${f1(y - 22 * s)} Z`}
    fill={color}
  />
);

// Мерцающие звёздочки вокруг точки.
export const Sparkles: React.FC<P> = ({ k, x, y, scale = 1, color = YELLOW }) => {
  if (!on(k)) return null;
  const pts = [
    [-70, -20, 1, 0],
    [60, -50, 0.8, 0.15],
    [10, -95, 0.6, 0.3],
    [-40, 50, 0.55, 0.2],
    [80, 35, 0.7, 0.35],
  ] as const;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${scale.toFixed(3)})`}>
      {pts.map(([dx, dy, s, d], i) => {
        const kk = Math.max(0, Math.min(1, (k - d) / 0.6));
        const b = bell(kk);
        return b > 0.01 ? <Twinkle key={i} x={dx} y={dy - 10 * kk} s={s * b} color={i % 2 ? "#FFFFFF" : color} /> : null;
      })}
    </g>
  );
};

// Капля пота у головы: появляется и сползает.
export const Sweat: React.FC<P> = ({ k, x, y, scale = 1 }) => {
  if (!on(k)) return null;
  const dy = 40 * k;
  return (
    <g transform={`translate(${f1(x)} ${f1(y + dy)}) scale(${scale.toFixed(3)})`} opacity={Math.min(1, bell(k) * 2)}>
      <path d="M 0 -26 C 6 -12 16 0 16 10 A 16 16 0 0 1 -16 10 C -16 0 -6 -12 0 -26 Z" fill="#8FD3FF" stroke="#4A9BD6" strokeWidth={3} />
      <ellipse cx={-5} cy={6} rx={4} ry={6} fill="#FFFFFF" opacity={0.8} />
    </g>
  );
};

// Знак «!» / «?!» в облачке, с пружинистым появлением.
export const Exclaim: React.FC<P & { readonly text?: string }> = ({ k, x, y, scale = 1, text = "!" }) => {
  if (!on(k)) return null;
  const inK = Math.min(1, k / 0.15);
  const s = scale * (inK < 1 ? 0.6 + 0.55 * inK : 1 + 0.06 * Math.sin(k * 20) * (1 - k));
  const o = k > 0.8 ? (1 - k) / 0.2 : 1;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`} opacity={o}>
      <path d="M -58 -44 Q -60 -78 -20 -80 L 30 -80 Q 62 -78 60 -44 L 60 -14 Q 60 16 30 16 L -6 16 L -24 36 L -22 16 Q -58 14 -58 -14 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" />
      <text x={2} y={-14} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={64} fill="#FF6B5E">
        {text}
      </text>
    </g>
  );
};

// Облачко бумажной пыли — кнопка, которая ничего не делает.
export const Puff: React.FC<P> = ({ k, x, y, scale = 1 }) => {
  if (!on(k)) return null;
  const o = 1 - k;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${scale.toFixed(3)})`} opacity={o * 0.9}>
      {[
        [-30, -10, 22],
        [0, -24, 26],
        [30, -8, 20],
        [-12, 8, 16],
        [18, 10, 14],
      ].map(([dx, dy, r], i) => (
        <circle key={i} cx={dx * (1 + k)} cy={dy * (1 + k) - 30 * k} r={r * (0.6 + 0.8 * k)} fill="#EAD9BC" stroke="#D2BB93" strokeWidth={2} />
      ))}
    </g>
  );
};

// Бумажное конфетти из пружины-хлопушки (детерминированно).
export const Confetti: React.FC<P> = ({ k, x, y, scale = 1 }) => {
  if (!on(k)) return null;
  const colors = ["#F7C531", "#FF8FC7", "#59C3FF", "#4ED38A", "#FFFFFF", "#FF6B5E"];
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${scale.toFixed(3)})`} opacity={k > 0.8 ? (1 - k) / 0.2 : 1}>
      {Array.from({ length: 22 }, (_, i) => {
        const a = -Math.PI / 2 + ((i / 21) - 0.5) * 2.4;
        const v = 260 + ((i * 37) % 90);
        const px = Math.cos(a) * v * k;
        const py = Math.sin(a) * v * k + 420 * k * k;
        const rot = (i * 47 + k * 720 * (i % 2 ? 1 : -1)) % 360;
        return <rect key={i} x={f1(px - 7)} y={f1(py - 4)} width={14} height={8} rx={2} fill={colors[i % colors.length]} transform={`rotate(${f1(rot)} ${f1(px)} ${f1(py)})`} />;
      })}
    </g>
  );
};

// Сердечко, плывущее вверх.
export const Heart: React.FC<P> = ({ k, x, y, scale = 1, color = "#FF7FA8" }) => {
  if (!on(k)) return null;
  const s = scale * (0.6 + 0.4 * Math.min(1, k * 4));
  return (
    <g transform={`translate(${f1(x + 8 * Math.sin(k * 9))} ${f1(y - 70 * k)}) scale(${s.toFixed(3)})`} opacity={k > 0.7 ? (1 - k) / 0.3 : 1}>
      <path d="M 0 18 C -30 -2 -26 -28 -10 -28 C -2 -28 0 -20 0 -16 C 0 -20 2 -28 10 -28 C 26 -28 30 -2 0 18 Z" fill={color} stroke="#E0517F" strokeWidth={3} />
    </g>
  );
};
