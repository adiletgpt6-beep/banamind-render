// Рисунки «театра закрытых дверей» для BM-017 (обложки и фильм).
// Оригинальная графика BanaMind: остров-макет, дом с окнами, фигурки-жетоны ролей,
// доска предположений, весы, пустой стол. Смерть не изображается: персонаж
// «уходит» — фигурка гаснет/уходит в тень, окно дома тухнет.
import React from "react";

export const OL = "#0b1220"; // контур
export const PAL = {
  night: "#0e1a2b",
  storm: "#22304a",
  sea: "#1b3b5a",
  seaLight: "#2f5f86",
  rock: "#4a5568",
  rockLight: "#6b7689",
  grass: "#3f6b4f",
  window: "#f7c948",
  thread: "#d9534f",
  paper: "#efe6d2",
  cork: "#a8794f",
  porcelain: "#f4f1ea",
  cold: "#7fb2ff",
};

// Роли десяти гостей (иконки на жетонах). Порядок — как карточки на доске.
export type Role = "judge" | "doctor" | "detective" | "general" | "driver" | "lady" | "adventurer" | "secretary" | "butler" | "cook";
export const ROLES: Role[] = ["judge", "doctor", "detective", "general", "driver", "lady", "adventurer", "secretary", "butler", "cook"];

export const RoleIcon: React.FC<{ role: Role; x?: number; y?: number; s?: number; color?: string }> = ({ role, x = 0, y = 0, s = 1, color = OL }) => {
  const sw = 4;
  const c = { stroke: color, strokeWidth: sw, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let g: React.ReactNode = null;
  switch (role) {
    case "judge": // весы
      g = (
        <g {...c}>
          <path d="M 0 -18 L 0 16 M -12 16 L 12 16 M -18 -12 L 18 -12" />
          <path d="M -18 -12 L -24 2 L -12 2 Z M 18 -12 L 12 2 L 24 2 Z" />
        </g>
      );
      break;
    case "doctor": // крест
      g = <path d="M -5 -16 L 5 -16 L 5 -5 L 16 -5 L 16 5 L 5 5 L 5 16 L -5 16 L -5 5 L -16 5 L -16 -5 L -5 -5 Z" {...c} />;
      break;
    case "detective": // блокнот
      g = (
        <g {...c}>
          <rect x={-12} y={-16} width={24} height={32} rx={3} />
          <path d="M -6 -6 L 6 -6 M -6 2 L 6 2 M -6 10 L 2 10" />
        </g>
      );
      break;
    case "general": // погон-звезда
      g = <path d="M 0 -17 L 5 -5 L 17 -5 L 7 3 L 11 16 L 0 8 L -11 16 L -7 3 L -17 -5 L -5 -5 Z" {...c} />;
      break;
    case "driver": // руль
      g = (
        <g {...c}>
          <circle r={16} />
          <circle r={4} />
          <path d="M -16 0 L -4 0 M 4 0 L 16 0 M 0 4 L 0 16" />
        </g>
      );
      break;
    case "lady": // книга
      g = (
        <g {...c}>
          <path d="M 0 -12 Q -10 -18 -18 -14 L -18 14 Q -10 10 0 16 Q 10 10 18 14 L 18 -14 Q 10 -18 0 -12 Z" />
          <path d="M 0 -12 L 0 16" />
        </g>
      );
      break;
    case "adventurer": // компас
      g = (
        <g {...c}>
          <circle r={16} />
          <path d="M 0 -11 L 5 0 L 0 11 L -5 0 Z" />
        </g>
      );
      break;
    case "secretary": // перо
      g = <path d="M 14 -16 Q -6 -10 -10 12 L -14 18 M -10 12 Q 8 8 14 -16" {...c} />;
      break;
    case "butler": // поднос
      g = (
        <g {...c}>
          <path d="M -18 8 L 18 8 M -14 8 Q -14 -12 0 -12 Q 14 -12 14 8 M 0 -12 L 0 -16" />
        </g>
      );
      break;
    case "cook": // чашка
      g = (
        <g {...c}>
          <path d="M -14 -8 L 10 -8 L 8 12 L -12 12 Z M 10 -4 Q 18 -4 16 4 Q 14 8 9 7" />
        </g>
      );
      break;
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{g}</g>;
};

// Фарфоровая фигурка-жетон: голова, плечи, подставка. dim 0…1 — «ушла в тень».
export const Figurine: React.FC<{ x: number; y: number; s?: number; role?: Role; dim?: number; fill?: string; glow?: boolean; q?: boolean }> = ({ x, y, s = 1, role, dim = 0, fill = PAL.porcelain, glow, q }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dim * 0.82}>
    {glow && <ellipse cx={0} cy={-70} rx={70} ry={95} fill={PAL.window} opacity={0.25} />}
    <ellipse cx={0} cy={4} rx={44} ry={10} fill="#000" opacity={0.3} />
    <path d="M -40 0 L 40 0 L 36 -14 L -36 -14 Z" fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -30 -14 Q -34 -70 -22 -92 Q 0 -104 22 -92 Q 34 -70 30 -14 Z" fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={0} cy={-118} r={24} fill={fill} stroke={OL} strokeWidth={4} />
    <path d="M -16 -128 Q 0 -140 16 -128" stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />
    {role && <RoleIcon role={role} y={-54} s={0.9} />}
    {q && (
      <text x={0} y={-108} textAnchor="middle" fontFamily="Russo One" fontSize={34} fill={PAL.window} stroke={OL} strokeWidth={6} paintOrder="stroke">
        ?
      </text>
    )}
  </g>
);

// Тёмный силуэт человека (для «десяти теней»).
export const Shadow: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = "#05080f", opacity = 0.9 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={color}>
    <circle cx={0} cy={-150} r={30} />
    <path d="M -46 0 L -40 -96 Q -36 -120 0 -122 Q 36 -120 40 -96 L 46 0 Z" />
  </g>
);

// Дом на острове: фасад модерн 1930-х, ряд окон; lit[i] — горит ли окно.
export const House: React.FC<{ x: number; y: number; s?: number; lit?: number[] }> = ({ x, y, s = 1, lit = Array(10).fill(1) }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -230 0 L -230 -170 L 230 -170 L 230 0 Z" fill="#d9d4c7" stroke={OL} strokeWidth={6} />
    <path d="M -250 -170 L 250 -170 L 250 -186 L -250 -186 Z" fill="#9aa3b2" stroke={OL} strokeWidth={6} />
    <path d="M -230 -86 L 230 -86" stroke={OL} strokeWidth={4} />
    {Array.from({ length: 10 }).map((_, i) => {
      const row = i < 5 ? 0 : 1;
      const col = i % 5;
      const wx = -190 + col * 88;
      const wy = row === 0 ? -156 : -72;
      const on = lit[i] ?? 0;
      return (
        <g key={i}>
          {on > 0 && <rect x={wx - 10} y={wy - 10} width={68} height={74} fill={PAL.window} opacity={0.25 * on} rx={6} />}
          <rect x={wx} y={wy} width={48} height={54} fill={on > 0 ? PAL.window : "#24324a"} opacity={on > 0 ? 0.5 + 0.5 * on : 1} stroke={OL} strokeWidth={4} />
          <path d={`M ${wx + 24} ${wy} L ${wx + 24} ${wy + 54} M ${wx} ${wy + 27} L ${wx + 48} ${wy + 27}`} stroke={OL} strokeWidth={3} />
        </g>
      );
    })}
  </g>
);

// Изометрический остров-макет: скала, трава, дом, причал; море вокруг.
export const Island: React.FC<{ x: number; y: number; s?: number; lit?: number[]; boat?: boolean }> = ({ x, y, s = 1, lit, boat }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={60} rx={520} ry={150} fill={PAL.seaLight} opacity={0.55} />
    <path d="M -440 40 Q -420 -60 -300 -110 Q -120 -170 80 -160 Q 300 -150 420 -60 Q 470 0 430 50 Q 300 120 0 128 Q -300 120 -440 40 Z" fill={PAL.rock} stroke={OL} strokeWidth={6} />
    <path d="M -440 40 Q -300 120 0 128 Q 300 120 430 50 L 430 90 Q 300 170 0 178 Q -300 170 -440 90 Z" fill="#323b4a" stroke={OL} strokeWidth={6} />
    <path d="M -380 10 Q -360 -60 -260 -96 Q -100 -146 80 -136 Q 280 -126 380 -50 Q 400 0 360 30 Q 240 90 0 96 Q -260 90 -380 10 Z" fill={PAL.grass} stroke={OL} strokeWidth={4} />
    <House x={30} y={-40} s={0.62} lit={lit} />
    <path d="M -420 60 L -560 110 L -548 128 L -410 80 Z" fill="#7a5a3a" stroke={OL} strokeWidth={4} />
    {boat && <path d="M -620 128 Q -590 160 -530 150 L -520 130 Z" fill="#c9533f" stroke={OL} strokeWidth={4} />}
  </g>
);

// Волны (горизонтальные дуги).
export const Waves: React.FC<{ y: number; w: number; color?: string; opacity?: number; phase?: number; rows?: number }> = ({ y, w, color = "#9cc8f0", opacity = 0.35, phase = 0, rows = 3 }) => (
  <g opacity={opacity} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round">
    {Array.from({ length: rows }).map((_, r) => (
      <path key={r} d={Array.from({ length: Math.ceil(w / 120) + 2 }).map((__, i) => `${i === 0 ? "M" : ""} ${i * 120 - 120 + ((phase * 60 + r * 50) % 120)} ${y + r * 46} q 30 -16 60 0 t 60 0`).join(" ")} />
    ))}
  </g>
);

// Весы правосудия.
export const Scales: React.FC<{ x: number; y: number; s?: number; tilt?: number; color?: string }> = ({ x, y, s = 1, tilt = 0, color = "#e8c96a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OL} strokeWidth={6} strokeLinejoin="round">
    <path d="M -10 0 L 10 0 L 16 -300 L -16 -300 Z" fill={color} />
    <path d="M -90 0 L 90 0 L 70 -30 L -70 -30 Z" fill={color} />
    <circle cx={0} cy={-312} r={20} fill={color} />
    <g transform={`translate(0 -290) rotate(${tilt})`}>
      <rect x={-200} y={-8} width={400} height={16} rx={8} fill={color} />
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d * 190} 0) rotate(${-tilt})`}>
          <path d="M 0 0 L -60 140 M 0 0 L 60 140" fill="none" />
          <path d="M -80 140 Q 0 200 80 140 Z" fill={color} />
        </g>
      ))}
    </g>
  </g>
);

// Судейский молоток (символ «самозваного суда»).
export const Gavel: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({ x, y, s = 1, rot = -30, color = "#8a5a33" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={OL} strokeWidth={6} strokeLinejoin="round">
    <rect x={-12} y={-20} width={24} height={240} rx={10} fill={color} />
    <rect x={-90} y={-80} width={180} height={70} rx={16} fill={color} />
    <rect x={-100} y={-86} width={24} height={82} rx={8} fill="#6a4426" />
    <rect x={76} y={-86} width={24} height={82} rx={8} fill="#6a4426" />
  </g>
);

// Обеденный стол в перспективе со стульями; n стульев по каждой стороне.
export const DinnerTable: React.FC<{ x: number; y: number; s?: number; chairs?: number }> = ({ x, y, s = 1, chairs = 5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OL} strokeWidth={5} strokeLinejoin="round">
    {Array.from({ length: chairs }).map((_, i) => {
      const k = i / (chairs - 1);
      const lx = -400 + k * 200;
      const rx = 400 - k * 200;
      const yy = 140 - k * 260;
      const sc = 1 - k * 0.45;
      return (
        <g key={i}>
          <g transform={`translate(${lx - 70 * sc} ${yy}) scale(${sc})`}>
            <rect x={-30} y={-130} width={60} height={130} rx={10} fill="#4a2f22" />
          </g>
          <g transform={`translate(${rx + 70 * sc} ${yy}) scale(${sc})`}>
            <rect x={-30} y={-130} width={60} height={130} rx={10} fill="#4a2f22" />
          </g>
        </g>
      );
    })}
    <path d="M -420 160 L 420 160 L 210 -140 L -210 -140 Z" fill="#6b4430" />
    <path d="M -400 150 L 400 150 L 200 -130 L -200 -130 Z" fill="#f2ead8" opacity={0.95} />
    <path d="M -420 160 L 420 160 L 420 190 L -420 190 Z" fill="#4a2f22" />
  </g>
);

// Пробковая доска с карточками и нитями. cards: позиции карточек; links: пары индексов.
export const Board: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-12} y={-12} width={w + 24} height={h + 24} rx={14} fill="#5a3b24" stroke={OL} strokeWidth={6} />
    <rect x={0} y={0} width={w} height={h} rx={6} fill={PAL.cork} />
    {Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={(i * 197) % w} cy={(i * 113) % h} r={2 + (i % 3)} fill="#8e6340" opacity={0.5} />
    ))}
    {children}
  </g>
);

export const Card: React.FC<{ x: number; y: number; role: Role; label?: string; rot?: number; dim?: number; w?: number }> = ({ x, y, role, label, rot = 0, dim = 0, w = 150 }) => {
  const h = w * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={1 - dim * 0.7}>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={8} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={PAL.paper} stroke={OL} strokeWidth={4} />
      <circle cx={0} cy={-h / 2 + 8} r={10} fill={PAL.thread} stroke={OL} strokeWidth={3} />
      <circle cx={0} cy={-h * 0.08} r={w * 0.3} fill="#d9cfb8" stroke={OL} strokeWidth={3} />
      <RoleIcon role={role} y={-h * 0.08} s={w / 110} />
      {label && (
        <text x={0} y={h / 2 - 18} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={w * 0.16} fill={OL}>
          {label}
        </text>
      )}
    </g>
  );
};

export const Thread: React.FC<{ a: [number, number]; b: [number, number]; color?: string; dashed?: boolean; sag?: number; progress?: number }> = ({ a, b, color = PAL.thread, dashed, sag = 30, progress = 1 }) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + sag;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.1;
  return (
    <path
      d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`}
      stroke={color}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={dashed ? "14 10" : `${len} ${len}`}
      strokeDashoffset={dashed ? 0 : len * (1 - progress)}
      opacity={dashed ? progress : 1}
    />
  );
};

// Лупа.
export const Magnifier: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 35 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={OL} strokeWidth={6}>
    <rect x={-12} y={60} width={24} height={110} rx={10} fill="#6a4426" />
    <circle r={64} fill="#bfe3ff" fillOpacity={0.35} />
    <circle r={64} fill="none" stroke="#c9a54a" strokeWidth={14} />
    <circle r={64} fill="none" />
    <path d="M -30 -30 Q -10 -46 14 -40" stroke="#fff" strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
  </g>
);

// Подвесная лампа над столом.
export const Lamp: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OL} strokeWidth={5}>
    <path d="M 0 -400 L 0 -40" />
    <path d="M -90 30 L 90 30 L 40 -40 L -40 -40 Z" fill="#2c3a2f" />
    <ellipse cx={0} cy={34} rx={34} ry={12} fill="#fff7d0" />
  </g>
);
