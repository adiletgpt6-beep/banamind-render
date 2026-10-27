// Предметы фильма BM-029 — условные оригинальные схемы BanaMind, не чертежи и не
// фотографии: ракета-ступень, автомобиль, батарейная ячейка, цех, монеты-запас,
// книга-символ и три прозрачных рабочих стола. Чистый вектор с ровным контуром.
import React from "react";
import { C, DC, DISPLAY, FONT, type DeskId } from "../theme";
import { OL } from "./people";
import { clamp01 } from "./kit";

// ── Ракета (условная двухступенчатая). Опора — сопло (0, 0), высота ≈ 560·s.
// sep — расхождение ступеней 0…1, flame — пламя 0…1, fail — место отказа (подсветка).
export const Rocket: React.FC<{ x: number; y: number; s?: number; t?: number; flame?: number; sep?: number; fail?: "engine" | "stage" | "tank" | null; rot?: number; color?: string; legs?: number }> = ({
  x, y, s = 1, t = 0, flame = 0, sep = 0, fail = null, rot = 0, color = C.white, legs = 0,
}) => {
  const fl = flame > 0 ? 1 + Math.sin(t * 31) * 0.08 + Math.sin(t * 17) * 0.06 : 0;
  const gap = sep * 120;
  const pulse = 0.55 + 0.45 * Math.sin(t * 6);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {flame > 0 && (
        <g transform={`scale(${flame * fl} ${flame * fl})`}>
          <path d="M -30 0 Q -20 120 0 200 Q 20 120 30 0 Z" fill={C.flame} />
          <path d="M -16 0 Q -10 80 0 130 Q 10 80 16 0 Z" fill={C.yellow} />
        </g>
      )}
      {/* первая ступень */}
      <path d="M -34 0 L -40 -20 L 40 -20 L 34 0 Z" fill={C.metalDark} stroke={OL} strokeWidth={4} />
      <rect x={-46} y={-330} width={92} height={310} rx={10} fill={color} stroke={OL} strokeWidth={5} />
      <rect x={-46} y={-250} width={92} height={18} fill={C.metal} />
      {legs > 0 &&
        [-1, 1].map((d) => <path key={d} d={`M ${d * 40} -70 L ${d * (46 + 60 * legs)} ${-6 + 6 * (1 - legs)}`} stroke={OL} strokeWidth={9} strokeLinecap="round" />)}
      {[-1, 1].map((d) => (
        <path key={d} d={`M ${d * 46} -90 L ${d * 74} -30 L ${d * 74} -10 L ${d * 46} -30 Z`} fill={C.metal} stroke={OL} strokeWidth={4} />
      ))}
      {/* вторая ступень и обтекатель */}
      <g transform={`translate(0 ${-gap})`}>
        <rect x={-40} y={-470} width={80} height={136} rx={8} fill={color} stroke={OL} strokeWidth={5} />
        <path d="M -40 -470 Q -40 -540 0 -566 Q 40 -540 40 -470 Z" fill={C.metal} stroke={OL} strokeWidth={5} />
        <rect x={-40} y={-410} width={80} height={14} fill={DC.eng.color} />
      </g>
      {fail === "engine" && <circle cx={0} cy={-6} r={58} fill="none" stroke={C.red} strokeWidth={9} opacity={pulse} />}
      {fail === "stage" && <rect x={-70} y={-360 - gap} width={140} height={60 + gap} rx={20} fill="none" stroke={C.red} strokeWidth={9} opacity={pulse} />}
      {fail === "tank" && <rect x={-62} y={-320} width={124} height={190} rx={22} fill="none" stroke={C.red} strokeWidth={9} opacity={pulse} />}
    </g>
  );
};

// ── Автомобиль (условный низкий седан/родстер). Опора — середина между колёсами.
export const Car: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string; roadster?: boolean; drive?: number; ghost?: boolean; battery?: number }> = ({
  x, y, s = 1, t = 0, color = DC.eng.color, roadster = false, drive = 0, ghost = false, battery = 0,
}) => {
  const spin = (t * 360 * drive) % 360;
  const body = roadster
    ? "M -250 -40 Q -250 -86 -200 -92 L -90 -100 Q -40 -150 30 -150 L 60 -110 L 200 -100 Q 256 -92 256 -46 L 256 -30 L -250 -30 Z"
    : "M -270 -40 Q -270 -96 -214 -104 L -130 -112 Q -70 -190 30 -190 Q 120 -190 170 -118 L 222 -110 Q 272 -100 272 -50 L 272 -30 L -270 -30 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={ghost ? 0.45 : 1}>
      <ellipse cx={0} cy={36} rx={270} ry={16} fill="#000" opacity={0.14} />
      <path d={body} fill={ghost ? "none" : color} stroke={OL} strokeWidth={6} strokeDasharray={ghost ? "18 12" : undefined} />
      {!roadster && <path d="M -100 -112 Q -54 -170 24 -172 Q 100 -170 140 -116 Z" fill={ghost ? "none" : C.sky} stroke={OL} strokeWidth={4} />}
      {roadster && <path d="M -60 -104 Q -22 -136 26 -138 L 46 -108 Z" fill={ghost ? "none" : C.sky} stroke={OL} strokeWidth={4} />}
      {battery > 0 && (
        <g>
          <rect x={-170} y={-60} width={340} height={30} rx={8} fill={C.yellow} stroke={OL} strokeWidth={3} opacity={clamp01(battery)} />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={-164 + i * 24} y={-56} width={18} height={22} rx={5} fill={DC.res.deep} opacity={clamp01(battery * 14 - i)} />
          ))}
        </g>
      )}
      {[-165, 170].map((wx) => (
        <g key={wx} transform={`translate(${wx} -18) rotate(${spin})`}>
          <circle r={52} fill="#2a2e44" stroke={OL} strokeWidth={5} />
          <circle r={24} fill={C.metal} />
          <path d="M -24 0 L 24 0 M 0 -24 L 0 24" stroke={OL} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

// ── Батарейная ячейка (цилиндр) — условная, без марки.
export const Cell: React.FC<{ x: number; y: number; s?: number; hot?: number }> = ({ x, y, s = 1, hot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-62} width={44} height={124} rx={12} fill={hot > 0 ? C.red : DC.eng.color} stroke={OL} strokeWidth={4} />
    <rect x={-22} y={-62} width={44} height={26} rx={10} fill={C.metal} stroke={OL} strokeWidth={4} />
    <rect x={-9} y={-74} width={18} height={14} rx={4} fill={C.metalDark} stroke={OL} strokeWidth={3} />
    <path d="M -6 -10 L 6 -10 M 0 -16 L 0 -4" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
  </g>
);

// ── Стопка монет — «денежный запас» (без конкретной суммы, если не указана).
export const Coins: React.FC<{ x: number; y: number; n: number; s?: number; color?: string }> = ({ x, y, n, s = 1, color = DC.res.color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: Math.max(0, Math.round(n)) }, (_, i) => (
      <g key={i} transform={`translate(0 ${-i * 20})`}>
        <ellipse cx={0} cy={0} rx={62} ry={18} fill={DC.res.deep} stroke={OL} strokeWidth={3} />
        <rect x={-62} y={-14} width={124} height={14} fill={DC.res.deep} />
        <ellipse cx={0} cy={-14} rx={62} ry={18} fill={color} stroke={OL} strokeWidth={3} />
      </g>
    ))}
  </g>
);

// ── Цех: крыша-пила, станки; k — сколько секций «построено» 0…1.
export const Factory: React.FC<{ x: number; y: number; w?: number; k?: number; t?: number; color?: string }> = ({ x, y, w = 640, k = 1, t = 0, color = C.metal }) => {
  const n = 5;
  const sw = w / n;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => {
        const kk = clamp01(k * n - i);
        if (kk <= 0) return null;
        const x0 = -w / 2 + i * sw;
        return (
          <g key={i} opacity={kk} transform={`translate(0 ${(1 - kk) * 40})`}>
            <path d={`M ${x0} 0 L ${x0} -150 L ${x0 + sw} -210 L ${x0 + sw} 0 Z`} fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <path d={`M ${x0 + sw * 0.12} -150 L ${x0 + sw * 0.12} -178 L ${x0 + sw * 0.9} -206`} stroke={C.sky} strokeWidth={10} />
            <rect x={x0 + sw * 0.25} y={-90} width={sw * 0.5} height={60} rx={8} fill={C.glass} stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      <rect x={w / 2 - 70} y={-290} width={40} height={90} fill={C.metalDark} stroke={OL} strokeWidth={4} opacity={clamp01(k * 2 - 1)} />
      {k >= 1 && [0, 1, 2].map((i) => <circle key={i} cx={w / 2 - 50 + Math.sin(t + i) * 10} cy={-310 - ((t * 30 + i * 40) % 120)} r={16 + i * 4} fill="#fff" opacity={0.5 - ((t * 30 + i * 40) % 120) / 260} />)}
    </g>
  );
};

// ── Три прозрачных рабочих стола модели фильма. focus — какой стол выделен.
// level — заполненность «нагрузки» каждого стола 0…1 (качественная, без чисел).
export const DeskGlass: React.FC<{ id: DeskId; x: number; y: number; w?: number; h?: number; k?: number; focus?: boolean; dim?: boolean; level?: number; label?: boolean; t?: number }> = ({
  id, x, y, w = 420, h = 250, k = 1, focus = false, dim = false, level, label = true, t = 0,
}) => {
  const d = DC[id];
  const glow = focus ? 0.6 + 0.4 * Math.sin(t * 2.4) : 0;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 60})`} opacity={clamp01(k) * (dim ? 0.45 : 1)}>
      {focus && <rect x={-w / 2 - 14} y={-h - 14} width={w + 28} height={h + 28} rx={34} fill="none" stroke={d.color} strokeWidth={6} opacity={glow} />}
      {/* ножки */}
      <path d={`M ${-w / 2 + 30} 0 L ${-w / 2 + 40} 120 M ${w / 2 - 30} 0 L ${w / 2 - 40} 120`} stroke={OL} strokeWidth={10} strokeLinecap="round" />
      {/* стеклянная столешница-экран */}
      <rect x={-w / 2} y={-h} width={w} height={h} rx={28} fill={d.light} fillOpacity={0.78} stroke={d.deep} strokeWidth={6} />
      <rect x={-w / 2 + 16} y={-h + 14} width={w * 0.35} height={10} rx={5} fill="#fff" opacity={0.75} />
      <rect x={-w / 2 - 10} y={-4} width={w + 20} height={22} rx={10} fill={d.color} stroke={OL} strokeWidth={4} />
      {level !== undefined && (
        <g>
          <rect x={-w / 2 + 30} y={-56} width={w - 60} height={26} rx={13} fill="#fff" stroke={OL} strokeWidth={3} />
          <rect x={-w / 2 + 33} y={-53} width={(w - 66) * clamp01(level)} height={20} rx={10} fill={level > 0.85 ? C.red : d.color} />
        </g>
      )}
      {label && (
        <text x={0} y={70} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={7} paintOrder="stroke">
          {d.name}
        </text>
      )}
    </g>
  );
};

// ── Книга-символ (оригинальная, не издательская обложка).
export const BookSymbol: React.FC<{ x: number; y: number; s?: number; rot?: number; title?: string; author?: string }> = ({ x, y, s = 1, rot = 0, title = "Илон Маск", author = "Эшли Вэнс" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-130} y={-180} width={260} height={360} rx={14} fill="#000" opacity={0.16} transform="translate(8 12)" />
    <rect x={-130} y={-180} width={260} height={360} rx={14} fill="#26365f" stroke={OL} strokeWidth={5} />
    <rect x={-130} y={-180} width={30} height={360} rx={10} fill="#1b2848" />
    <path d="M -40 70 L 0 -90 L 40 70 Z" fill="none" stroke={C.yellow} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={110} r={10} fill={C.yellow} />
    <text x={15} y={-130} fontFamily={DISPLAY} fontWeight={800} fontSize={30} fill="#fff" textAnchor="middle">
      {title}
    </text>
    <text x={15} y={160} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.fog} textAnchor="middle">
      {author}
    </text>
  </g>
);

// ── Календарный лист с датой из книги (не таймер: статичная пометка периода).
export const DateCard: React.FC<{ x: number; y: number; text: string; s?: number; color?: string }> = ({ x, y, text, s = 1, color = C.paper }) => {
  const w = Math.max(180, text.length * 26 + 50);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2 + 5} y={-46} width={w} height={92} rx={18} fill="#000" opacity={0.15} />
      <rect x={-w / 2} y={-52} width={w} height={92} rx={18} fill={color} stroke={OL} strokeWidth={4} />
      <rect x={-w / 2} y={-52} width={w} height={22} rx={10} fill={C.red} />
      <text x={0} y={22} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.ink} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};
