// Предметы мастерской (из BM-027) — собственный 2D-стиль
// BanaMind: прозрачные коробки, конверт письма, карточка цитаты, тетрадь
// вечернего разбора, облако предположений и блоки фактов, условные фигуры
// людей. Всё — образы фильма, не предметы из писем и не изображения издания.
// Всё зависит только от времени сцены (без случайного шума).
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { clamp01, ease } from "./kit";
import { rnd } from "./particles";

export const OL = "#24283a"; // контур

// Подпись-плашка.
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; bg?: string; color?: string; opacity?: number; serif?: boolean; rot?: number }> = ({ x, y, text, size = 34, bg = C.cream, color = C.ink, opacity = 1, serif = false, rot = 0 }) => {
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + size * 1.3;
  const h = lines.length * size * 1.22 + size * 0.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      <rect x={-w / 2 + 4} y={-h / 2 + 7} width={w} height={h} rx={size * 0.5} fill="#24324a" opacity={0.1} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.5} fill={bg} stroke={OL} strokeWidth={3} />
      <text fontFamily={serif ? SERIF : FONT} fontWeight={serif ? 700 : 800} fontSize={size} fill={color} textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x={0} y={(i - (lines.length - 1) / 2) * size * 1.22 + size * 0.35}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Прозрачная коробка Мастерской: стеклянные стенки, ярлык спереди; содержимое
// рисуется внутри (children в координатах коробки, центр дна — (0, 0)).
export const GlassBox: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  label?: string;
  labelColor?: string;
  k?: number; // появление 0…1
  glow?: number; // подсветка выбранного 0…1
  children?: React.ReactNode;
  tilt?: number;
}> = ({ x, y, w = 300, h = 260, label, labelColor = C.yellow, k = 1, glow = 0, children, tilt = 0 }) => {
  if (k <= 0) return null;
  const d = w * 0.18; // глубина (изометрия)
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) rotate(${tilt})`} opacity={clamp01(k * 1.4)}>
      {glow > 0 && <rect x={-w / 2 - 18} y={-h - d - 18} width={w + d + 36} height={h + d + 36} rx={30} fill={C.teal} opacity={0.16 * glow} />}
      {/* задняя стенка и дно */}
      <path d={`M ${-w / 2 + d} ${-h - d} L ${w / 2 + d} ${-h - d} L ${w / 2 + d} ${-d} L ${-w / 2 + d} ${-d} Z`} fill={C.glass} opacity={0.55} stroke={OL} strokeWidth={2.5} strokeOpacity={0.35} />
      <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2 + d} ${-d} L ${-w / 2 + d} ${-d} Z`} fill="#d7e8ec" opacity={0.8} stroke={OL} strokeWidth={2.5} strokeOpacity={0.45} />
      {children}
      {/* передняя стенка — прозрачная, с бликом */}
      <rect x={-w / 2} y={-h} width={w} height={h} fill={C.glass} opacity={0.28} stroke={OL} strokeWidth={4} />
      <path d={`M ${-w / 2} ${-h} L ${-w / 2 + d} ${-h - d} L ${w / 2 + d} ${-h - d} L ${w / 2} ${-h}`} fill="none" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${w / 2} 0 L ${w / 2 + d} ${-d} L ${w / 2 + d} ${-h - d}`} fill="none" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${-w / 2 + 18} ${-h + 22} L ${-w / 2 + 18} ${-h * 0.45}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      {label && (() => {
        // подпись не шире коробки: шрифт уменьшается для длинных слов на узком верстаке
        const fs = Math.min(34, (w + 20) / (label.length * 0.62 + 1.4));
        const lw = label.length * fs * 0.62 + fs * 1.4;
        return (
          <g transform={`translate(0 ${32})`}>
            <rect x={-lw / 2} y={-fs * 0.72} width={lw} height={fs * 1.48} rx={fs * 0.74} fill={labelColor} stroke={OL} strokeWidth={3} />
            <text y={fs * 0.36} fontFamily={HEAVY} fontWeight={800} fontSize={fs} fill={C.ink} textAnchor="middle">
              {label}
            </text>
          </g>
        );
      })()}
    </g>
  );
};

// Шарик-«предмет» внутри коробки (внешняя вещь): яркий круг с контуром.
export const Bead: React.FC<{ x: number; y: number; r?: number; color: string; op?: number }> = ({ x, y, r = 14, color, op = 1 }) => (
  <circle cx={x} cy={y} r={r} fill={color} stroke={OL} strokeWidth={2.4} opacity={op} />
);

// Конверт письма: open 0…1 — клапан поднимается, листок выезжает.
export const Envelope: React.FC<{ x: number; y: number; s?: number; open?: number; num?: string; rot?: number; k?: number }> = ({ x, y, s = 1, open = 0, num, rot = 0, k = 1 }) => {
  if (k <= 0) return null;
  const o = ease(clamp01(open));
  const sheet = clamp01((open - 0.4) / 0.6);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 1.5)}>
      <rect x={-170} y={-110} width={340} height={220} rx={14} fill="#f1e2c2" stroke={OL} strokeWidth={5} />
      {sheet > 0 && (
        <g transform={`translate(0 ${-sheet * 150})`}>
          <rect x={-140} y={-120} width={280} height={220} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-110} y={-80 + i * 32} width={i === 3 ? 130 : 220} height={10} rx={5} fill={C.inkSoft} opacity={0.35} />
          ))}
          {num && (
            <text x={0} y={-90} fontFamily={SERIF} fontWeight={700} fontSize={30} fill={C.amber} textAnchor="middle" opacity={0}>
              {num}
            </text>
          )}
        </g>
      )}
      <path d="M -170 110 L 0 -10 L 170 110" fill="#ead5ac" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -170 -110 L 0 ${20 - o * 230} L 170 -110`} fill="#e9cf9c" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {o < 0.5 && <circle cx={0} cy={18 - o * 100} r={26} fill={C.coral} stroke={OL} strokeWidth={4} />}
      {num && (
        <text x={0} y={80} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
          {num}
        </text>
      )}
    </g>
  );
};

// Карточка цитаты с подписью «Письмо I, § 3» — короткий проверенный отрывок.
export const QuoteCard: React.FC<{ x: number; y: number; w?: number; lines: string[]; refText: string; k: number; size?: number; color?: string }> = ({ x, y, w = 1000, lines, refText, k, size = 44, color = C.amber }) => {
  if (k <= 0) return null;
  const h = lines.length * size * 1.3 + 150;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={clamp01(k * 1.3)}>
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={34} fill="#24324a" opacity={0.1} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={C.white} stroke={OL} strokeWidth={4} />
      <rect x={-w / 2} y={-h / 2} width={18} height={h} rx={9} fill={color} />
      <text x={-w / 2 + 60} y={-h / 2 + 92} fontFamily={SERIF} fontWeight={700} fontSize={110} fill={color} opacity={0.5}>
        «
      </text>
      <text fontFamily={SERIF} fontWeight={700} fontSize={size} fill={C.ink} textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x={20} y={-h / 2 + 80 + i * size * 1.3 + size * 0.4}>
            {l}
          </tspan>
        ))}
      </text>
      <text x={w / 2 - 44} y={h / 2 - 36} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.inkSoft} textAnchor="end">
        {refText}
      </text>
    </g>
  );
};

// Условная фигура человека (без лица-портрета): голова, плечи, руки.
export type FigProps = { x: number; y: number; s?: number; color?: string; head?: string; arm?: number; armR?: number; k?: number; sad?: boolean; tag?: string; tagColor?: string; bob?: number };
export const Figure: React.FC<FigProps> = ({ x, y, s = 1, color = C.teal, head = "#f1c9a5", arm = 0, armR, k = 1, sad = false, tag, tagColor = C.yellow, bob = 0 }) => {
  if (k <= 0) return null;
  const a2 = armR ?? arm;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30 + bob}) scale(${s})`} opacity={clamp01(k * 1.5)}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.08} />
      {/* руки */}
      <g transform={`translate(-52 -150) rotate(${20 + arm})`}>
        <rect x={-13} y={0} width={26} height={110} rx={13} fill={color} stroke={OL} strokeWidth={4} />
        <circle cx={0} cy={112} r={15} fill={head} stroke={OL} strokeWidth={4} />
      </g>
      <g transform={`translate(52 -150) rotate(${-20 - a2})`}>
        <rect x={-13} y={0} width={26} height={110} rx={13} fill={color} stroke={OL} strokeWidth={4} />
        <circle cx={0} cy={112} r={15} fill={head} stroke={OL} strokeWidth={4} />
      </g>
      {/* тело */}
      <path d="M -62 0 L -58 -150 Q 0 -190 58 -150 L 62 0 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      {/* голова */}
      <circle cx={0} cy={-218} r={52} fill={head} stroke={OL} strokeWidth={5} />
      <circle cx={-18} cy={-222} r={6} fill={OL} />
      <circle cx={18} cy={-222} r={6} fill={OL} />
      <path d={sad ? "M -16 -192 Q 0 -202 16 -192" : "M -16 -198 Q 0 -186 16 -198"} fill="none" stroke={OL} strokeWidth={4.5} strokeLinecap="round" />
      {tag && (
        <g transform="translate(0 -320)">
          <rect x={-tag.length * 12 - 22} y={-26} width={tag.length * 24 + 44} height={50} rx={25} fill={tagColor} stroke={OL} strokeWidth={3} />
          <text y={10} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">
            {tag}
          </text>
        </g>
      )}
    </g>
  );
};

// Облако предположений: мягкие круги, подпись внутри; k — появление, split — «рассеивание».
export const Cloud: React.FC<{ x: number; y: number; s?: number; k: number; text?: string; color?: string; split?: number; t?: number }> = ({ x, y, s = 1, k, text, color = C.plumSoft, split = 0, t = 0 }) => {
  if (k <= 0) return null;
  const blobs = [
    [-120, 10, 90], [-40, -40, 110], [70, -30, 100], [140, 20, 80], [20, 40, 100], [-90, 50, 70],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * k)})`} opacity={clamp01(k * 1.4) * (1 - split * 0.85)}>
      {blobs.map(([bx, by, r], i) => (
        <circle key={i} cx={bx + Math.sin(t * 0.8 + i) * 4 + (bx > 0 ? 1 : -1) * split * 120} cy={by + Math.cos(t * 0.7 + i) * 3 - split * 40} r={r} fill={color} stroke={C.plum} strokeWidth={4} strokeOpacity={0.5} />
      ))}
      {blobs.map(([bx, by, r], i) => (
        <circle key={`f${i}`} cx={bx + Math.sin(t * 0.8 + i) * 4 + (bx > 0 ? 1 : -1) * split * 120} cy={by + Math.cos(t * 0.7 + i) * 3 - split * 40} r={r - 4} fill={color} />
      ))}
      {text && (
        <text y={14} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.plum} textAnchor="middle">
          {text.split("\n").map((l, i, a) => (
            <tspan key={i} x={0} dy={i === 0 ? -(a.length - 1) * 24 : 48}>
              {l}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
};

// Блок факта: плотный кирпич с галочкой.
export const FactBlock: React.FC<{ x: number; y: number; text: string; k: number; w?: number; color?: string }> = ({ x, y, text, k, w = 360, color = C.teal }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y - (1 - k) * 80})`} opacity={clamp01(k * 2)}>
      <rect x={-w / 2 + 5} y={-40} width={w} height={84} rx={14} fill="#24324a" opacity={0.12} />
      <rect x={-w / 2} y={-46} width={w} height={84} rx={14} fill={color} stroke={OL} strokeWidth={4} />
      <text y={8} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.white} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// Тетрадь вечернего разбора: строки с пометками «✓» / «?» / «→ завтра».
export const Notebook: React.FC<{ x: number; y: number; rows: { text: string; mark?: "ok" | "q" | "fix" }[]; t: number; at: number[]; k: number; title?: string }> = ({ x, y, rows, t, at, k, title }) => {
  if (k <= 0) return null;
  const h = 120 + rows.length * 86;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 30})`} opacity={clamp01(k * 1.4)}>
      <rect x={-360 + 8} y={-h / 2 + 12} width={720} height={h} rx={26} fill="#24324a" opacity={0.1} />
      <rect x={-360} y={-h / 2} width={720} height={h} rx={26} fill={C.cream} stroke={OL} strokeWidth={5} />
      <line x1={-280} y1={-h / 2} x2={-280} y2={h / 2} stroke={C.coral} strokeWidth={4} opacity={0.6} />
      {title && (
        <text x={-250} y={-h / 2 + 70} fontFamily={HEAVY} fontWeight={800} fontSize={40} fill={C.ink}>
          {title}
        </text>
      )}
      {rows.map((r, i) => {
        const rk = clamp01((t - (at[i] ?? 99)) / 0.5);
        if (rk <= 0) return null;
        const yy = -h / 2 + 140 + i * 86;
        const col = r.mark === "ok" ? C.green : r.mark === "q" ? C.amber : r.mark === "fix" ? C.teal : C.inkSoft;
        const sym = r.mark === "ok" ? "✓" : r.mark === "q" ? "?" : r.mark === "fix" ? "→" : "•";
        return (
          <g key={i} opacity={rk} transform={`translate(${(1 - rk) * 20} 0)`}>
            <text x={-320} y={yy + 12} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={col} textAnchor="middle">
              {sym}
            </text>
            <text x={-250} y={yy + 12} fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.ink}>
              {r.text}
            </text>
            <line x1={-250} y1={yy + 34} x2={320} y2={yy + 34} stroke={C.inkSoft} strokeWidth={2} opacity={0.2} />
          </g>
        );
      })}
    </g>
  );
};

// Звуковые волны шума: концентрические дуги от точки, амплитуда 0…1.
export const Waves: React.FC<{ x: number; y: number; t: number; amp: number; color?: string; dir?: 1 | -1 }> = ({ x, y, t, amp, color = C.coral, dir = 1 }) => {
  if (amp <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir} 1)`} opacity={clamp01(amp)}>
      {[0, 1, 2].map((i) => {
        const ph = ((t * 0.9 + i / 3) % 1 + 1) % 1;
        const r = 40 + ph * 140;
        return <path key={i} d={`M ${r * Math.cos(-0.7)} ${r * Math.sin(-0.7)} A ${r} ${r} 0 0 1 ${r * Math.cos(0.7)} ${r * Math.sin(0.7)}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" opacity={(1 - ph) * amp} />;
      })}
    </g>
  );
};

// Нить из руки ведущего: светящаяся линия из точек от (x1,y1) к (x2,y2), k — длина.
export const Thread: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; t: number; color?: string; sag?: number; n?: number }> = ({ x1, y1, x2, y2, k, t, color = C.amber, sag = 80, n = 46 }) => {
  if (k <= 0) return null;
  const dots: React.ReactNode[] = [];
  const m = Math.ceil(n * clamp01(k));
  for (let i = 0; i < m; i++) {
    const u = i / (n - 1);
    const px = x1 + (x2 - x1) * u;
    const py = y1 + (y2 - y1) * u + Math.sin(u * Math.PI) * sag + Math.sin(t * 2 + i * 0.5) * 3;
    dots.push(<circle key={i} cx={px} cy={py} r={7 - u * 2} fill={color} stroke={OL} strokeWidth={1.2} strokeOpacity={0.35} />);
  }
  return <g>{dots}</g>;
};

// Стабильная россыпь точек в прямоугольнике (для «потока», «толпы» и т. п.).
export const dotField = (n: number, w: number, h: number, seed = 0) =>
  Array.from({ length: n }, (_, i) => ({ x: (rnd(i, seed + 11) - 0.5) * w, y: (rnd(i, seed + 12) - 0.5) * h, r: rnd(i, seed + 13) }));
