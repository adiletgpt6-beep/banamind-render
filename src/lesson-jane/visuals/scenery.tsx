// Декорации фильма BM-032 «Джейн Эйр»: двери, окна, свечи, лестницы,
// пустошь, руины — собственный плоский стиль BanaMind (чёткие контуры,
// светлые заливки, без экранизаций). Всё зависит только от времени сцены.
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { OL } from "./draw";
import { clamp01 } from "./kit";

// Свеча с живым пламенем и ореолом.
export const Candle: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 1 }) => {
  const f = 1 + Math.sin(t * 9.1) * 0.06 + Math.sin(t * 13.7) * 0.04;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-120} r={110 * f} fill={C.yellow} opacity={0.18 * glow} />
      <circle cx={0} cy={-120} r={60 * f} fill={C.yellow} opacity={0.22 * glow} />
      <rect x={-46} y={-8} width={92} height={16} rx={8} fill="#b9821c" stroke={OL} strokeWidth={4} />
      <rect x={-18} y={-92} width={36} height={86} rx={6} fill={C.cream} stroke={OL} strokeWidth={4} />
      <path d={`M 0 ${-150 * f} Q 18 -118 0 -96 Q -18 -118 0 ${-150 * f} Z`} fill={C.gold} stroke={OL} strokeWidth={3} />
      <path d="M 0 -132 Q 8 -116 0 -104 Q -8 -116 0 -132 Z" fill="#fff6c8" />
    </g>
  );
};

// Дверь: open 0…1 — створка поворачивается; locked — замок и цепь.
export const Door: React.FC<{ x: number; y: number; s?: number; open?: number; color?: string; locked?: boolean; label?: string; glow?: string }> = ({ x, y, s = 1, open = 0, color = "#8a5c38", locked = false, label, glow }) => {
  const w = 200;
  const h = 360;
  const leaf = Math.cos(clamp01(open) * Math.PI * 0.45);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2 - 22} y={-h - 22} width={w + 44} height={h + 22} rx={14} fill="#d8c3a0" stroke={OL} strokeWidth={5} />
      <rect x={-w / 2} y={-h} width={w} height={h} fill={glow ?? "#fff3c8"} stroke={OL} strokeWidth={4} />
      {glow && <rect x={-w / 2} y={-h} width={w} height={h} fill="#fff" opacity={0.25 * clamp01(open)} />}
      <g transform={`translate(${-w / 2} 0) scale(${leaf} 1)`}>
        <rect x={0} y={-h} width={w} height={h} fill={color} stroke={OL} strokeWidth={5} />
        <rect x={22} y={-h + 26} width={w - 44} height={130} rx={8} fill="none" stroke={OL} strokeWidth={3.5} opacity={0.55} />
        <rect x={22} y={-h + 186} width={w - 44} height={146} rx={8} fill="none" stroke={OL} strokeWidth={3.5} opacity={0.55} />
        <circle cx={w - 28} cy={-h / 2} r={11} fill={C.gold} stroke={OL} strokeWidth={3} />
      </g>
      {locked && (
        <g transform={`translate(0 ${-h / 2})`}>
          <path d="M -120 -70 L 120 70 M 120 -70 L -120 70" stroke="#6a6a7a" strokeWidth={14} strokeLinecap="round" strokeDasharray="22 10" />
          <rect x={-34} y={-10} width={68} height={58} rx={10} fill="#8892ab" stroke={OL} strokeWidth={4} />
          <path d="M -20 -10 Q -20 -48 0 -48 Q 20 -48 20 -10" fill="none" stroke={OL} strokeWidth={8} />
        </g>
      )}
      {label && (
        <text x={0} y={-h - 40} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={C.ink} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
};

// Окно с переплётом и видом: sky — цвет неба, rain 0…1, moon — луна.
export const Window: React.FC<{ x: number; y: number; w?: number; h?: number; sky?: string; t: number; rain?: number; hills?: string; moon?: boolean; curtain?: string }> = ({ x, y, w = 360, h = 460, sky = C.sky, t, rain = 0, hills = C.sage, moon = false, curtain = C.red }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={12} fill="#c9a27a" stroke={OL} strokeWidth={5} />
    <clipPath id={`win${x}${y}`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} />
    </clipPath>
    <g clipPath={`url(#win${x}${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={sky} />
      {moon && <circle cx={w * 0.22} cy={-h * 0.25} r={36} fill="#fff8d8" stroke={OL} strokeWidth={3} />}
      <path d={`M ${-w / 2} ${h * 0.18} Q ${-w / 4} ${h * 0.02} 0 ${h * 0.16} Q ${w / 4} ${h * 0.3} ${w / 2} ${h * 0.1} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`} fill={hills} stroke={OL} strokeWidth={3} />
      {rain > 0 &&
        Array.from({ length: 26 }).map((_, i) => {
          const px = -w / 2 + ((i * 53) % w);
          const py = -h / 2 + ((t * 420 + i * 97) % (h + 60)) - 30;
          return <line key={i} x1={px} y1={py} x2={px - 10} y2={py + 34} stroke="#ffffff" strokeWidth={4} opacity={0.75 * rain} strokeLinecap="round" />;
        })}
    </g>
    <path d={`M 0 ${-h / 2} L 0 ${h / 2} M ${-w / 2} 0 L ${w / 2} 0`} stroke="#c9a27a" strokeWidth={14} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={OL} strokeWidth={4} />
    {curtain && (
      <g>
        <path d={`M ${-w / 2 - 30} ${-h / 2 - 40} L ${-w / 2 + 50} ${-h / 2 - 40} Q ${-w / 2 + 20} 0 ${-w / 2 + 40} ${h / 2 + 40} L ${-w / 2 - 30} ${h / 2 + 40} Z`} fill={curtain} stroke={OL} strokeWidth={4} />
        <path d={`M ${w / 2 + 30} ${-h / 2 - 40} L ${w / 2 - 50} ${-h / 2 - 40} Q ${w / 2 - 20} 0 ${w / 2 - 40} ${h / 2 + 40} L ${w / 2 + 30} ${h / 2 + 40} Z`} fill={curtain} stroke={OL} strokeWidth={4} />
      </g>
    )}
  </g>
);

// Холмы пустоши с вереском; drift — медленный параллакс.
export const Moor: React.FC<{ t: number; tint?: string; drift?: number; y?: number }> = ({ t, tint = C.heather, drift = 1, y = 0 }) => (
  <g transform={`translate(0 ${y})`}>
    <path d={`M 0 ${640 + Math.sin(t * 0.1) * 4} Q 420 520 860 610 Q 1300 700 1920 560 L 1920 1080 L 0 1080 Z`} fill="#cdbfe0" stroke={OL} strokeWidth={4} transform={`translate(${-t * 4 * drift} 0)`} />
    <path d="M -100 760 Q 500 640 1000 740 Q 1500 830 2020 700 L 2020 1080 L -100 1080 Z" fill={tint} opacity={0.75} stroke={OL} strokeWidth={4} transform={`translate(${-t * 8 * drift} 0)`} />
    {Array.from({ length: 34 }).map((_, i) => {
      const px = ((i * 137) % 2100) - 90 - ((t * 12 * drift) % 60);
      const py = 820 + ((i * 71) % 220);
      return <circle key={i} cx={px} cy={py} r={9 + (i % 3) * 3} fill={i % 2 ? "#a77fc9" : "#c79be0"} stroke={OL} strokeWidth={2} />;
    })}
  </g>
);

// Каменный указатель на перекрёстке пустоши.
export const Signpost: React.FC<{ x: number; y: number; s?: number; arms?: string[] }> = ({ x, y, s = 1, arms = [] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 0 L -30 -300 L 30 -300 L 40 0 Z" fill="#b9b2a4" stroke={OL} strokeWidth={5} />
    <rect x={-50} y={-320} width={100} height={30} rx={6} fill="#a39b8c" stroke={OL} strokeWidth={4} />
    {arms.map((a, i) => {
      const dir = i % 2 ? -1 : 1;
      const yy = -270 + i * 70;
      return (
        <g key={a} transform={`translate(0 ${yy})`}>
          <path d={`M 0 -24 L ${dir * 210} -24 L ${dir * 245} 0 L ${dir * 210} 24 L 0 24 Z`} fill={C.cream} stroke={OL} strokeWidth={4} />
          <text x={dir * 112} y={12} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">
            {a}
          </text>
        </g>
      );
    })}
  </g>
);

// Замок-особняк Тернфилд: зубцы, высокие окна; burnt 0…1 — почерневшие руины.
export const Hall: React.FC<{ x: number; y: number; s?: number; t: number; burnt?: number; lit?: number }> = ({ x, y, s = 1, t, burnt = 0, lit = 1 }) => {
  const wall = burnt > 0.5 ? "#9a8e86" : "#d9c6a5";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-420} y={-300} width={840} height={300} fill={wall} stroke={OL} strokeWidth={5} />
      {Array.from({ length: 15 }).map((_, i) => (
        <rect key={i} x={-420 + i * 58} y={-330} width={34} height={34} fill={wall} stroke={OL} strokeWidth={4} />
      ))}
      <rect x={-500} y={-420} width={120} height={420} fill={wall} stroke={OL} strokeWidth={5} />
      <rect x={380} y={-420} width={120} height={420} fill={wall} stroke={OL} strokeWidth={5} />
      {[-500, 380].map((tx) => [0, 1, 2].map((i) => <rect key={`${tx}${i}`} x={tx + i * 44} y={-450} width={30} height={32} fill={wall} stroke={OL} strokeWidth={4} />))}
      {Array.from({ length: 6 }).map((_, c) =>
        [0, 1].map((r) => {
          const cx = -330 + c * 132;
          const glow = (0.7 + 0.3 * Math.sin(t * 0.8 + c + r)) * lit * (1 - burnt);
          return (
            <g key={`${c}${r}`}>
              <rect x={cx - 26} y={-270 + r * 130} width={52} height={90} rx={26} fill={burnt > 0.5 ? "#3e3a40" : C.yellow} opacity={burnt > 0.5 ? 0.9 : 0.35 + 0.5 * glow} stroke={OL} strokeWidth={3.5} />
            </g>
          );
        }),
      )}
      {[-440, 440].map((cx) => (
        <rect key={cx} x={cx - 22} y={-360} width={44} height={70} rx={22} fill={burnt > 0.5 ? "#3e3a40" : C.yellow} opacity={0.6} stroke={OL} strokeWidth={3.5} />
      ))}
      <path d="M -50 0 L -50 -110 Q 0 -160 50 -110 L 50 0 Z" fill={burnt > 0.5 ? "#4a4046" : "#6b4a3a"} stroke={OL} strokeWidth={4} />
      {burnt > 0 && (
        <g opacity={burnt}>
          <path d="M -420 -300 L -300 -220 L -180 -320 L -40 -200 L 90 -330 L 230 -210 L 420 -300 L 420 -340 L -420 -340 Z" fill="#f3e6cc" />
          {[-260, 40, 300].map((cx, i) => (
            <path key={cx} d={`M ${cx} -300 Q ${cx + 40} -380 ${cx + 10} -${440 + i * 30} Q ${cx - 30} -500 ${cx + 20} -${560 + i * 20}`} stroke="#8892ab" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.35} transform={`translate(${Math.sin(t + i) * 8} 0)`} />
          ))}
        </g>
      )}
    </g>
  );
};

// Каштан в саду: split 0…1 — молния раскалывает ствол.
export const Chestnut: React.FC<{ x: number; y: number; s?: number; t: number; split?: number }> = ({ x, y, s = 1, t, split = 0 }) => {
  const a = split * 9;
  const crown = (dx: number) => (
    <g>
      <circle cx={dx} cy={-330} r={150} fill={C.sage} stroke={OL} strokeWidth={5} />
      <circle cx={dx - 110} cy={-250} r={100} fill="#6fae78" stroke={OL} strokeWidth={5} />
      <circle cx={dx + 110} cy={-250} r={100} fill="#6fae78" stroke={OL} strokeWidth={5} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 0.7) * 0.8})`}>
      <g transform={`rotate(${-a} -10 0)`}>
        <path d="M -10 0 L -40 0 L -34 -210 L -10 -230 Z" fill="#7a5a3a" stroke={OL} strokeWidth={4} />
        <g clipPath="url(#leftHalf)">{crown(0)}</g>
      </g>
      <g transform={`rotate(${a} 10 0)`}>
        <path d="M 10 0 L 40 0 L 34 -210 L 10 -230 Z" fill="#7a5a3a" stroke={OL} strokeWidth={4} />
        <g clipPath="url(#rightHalf)">{crown(0)}</g>
      </g>
      <defs>
        <clipPath id="leftHalf">
          <rect x={-400} y={-600} width={400 - split * 6} height={700} />
        </clipPath>
        <clipPath id="rightHalf">
          <rect x={split * 6} y={-600} width={400} height={700} />
        </clipPath>
      </defs>
      {split > 0 && split < 0.6 && <path d="M 30 -600 L -20 -460 L 30 -420 L -10 -260" stroke={C.yellow} strokeWidth={14} fill="none" strokeLinejoin="round" opacity={1 - split} />}
    </g>
  );
};

// Карточка цитаты: говорящий, текст, ссылка на главу.
export const QuoteBox: React.FC<{ x: number; y: number; w?: number; who: string; text: string; refText?: string; color?: string; size?: number; k?: number }> = ({ x, y, w = 760, who, text, refText, color = C.gold, size = 40, k = 1 }) => {
  const words = text.split(" ");
  const rows: string[] = [];
  const max = Math.floor((w - 100) / (size * 0.58));
  let cur = "";
  for (const wd of words) {
    if ((cur + " " + wd).trim().length > max) {
      rows.push(cur.trim());
      cur = wd;
    } else cur += " " + wd;
  }
  if (cur.trim()) rows.push(cur.trim());
  const h = 110 + rows.length * size * 1.25 + (refText ? 40 : 0);
  return (
    <g transform={`translate(${x} ${y})`} opacity={k}>
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={28} fill="#24324a" opacity={0.12} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={C.white} stroke={OL} strokeWidth={4} />
      <rect x={-w / 2} y={-h / 2} width={18} height={h} rx={9} fill={color} />
      <text x={-w / 2 + 50} y={-h / 2 + 58} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.inkSoft}>
        {who}
      </text>
      {rows.map((r, i) => (
        <text key={i} x={-w / 2 + 50} y={-h / 2 + 110 + i * size * 1.25} fontFamily={SERIF} fontWeight={700} fontSize={size} fill={C.ink}>
          {(i === 0 ? "«" : "") + r + (i === rows.length - 1 ? "»" : "")}
        </text>
      ))}
      {refText && (
        <text x={w / 2 - 34} y={h / 2 - 26} fontFamily={FONT} fontWeight={700} fontSize={24} fill={C.steel} textAnchor="end">
          {refText}
        </text>
      )}
    </g>
  );
};

// Пузырь реплики со «хвостиком».
export const Bubble: React.FC<{ x: number; y: number; text: string; size?: number; tail?: "left" | "right" | "down" | "none"; bg?: string; color?: string; serif?: boolean; k?: number; maxChars?: number }> = ({ x, y, text, size = 38, tail = "down", bg = C.white, color = C.ink, serif = false, k = 1, maxChars = 26 }) => {
  if (k <= 0.001) return null;
  const words = text.split(" ");
  const rows: string[] = [];
  let cur = "";
  for (const wd of words) {
    if ((cur + " " + wd).trim().length > maxChars) {
      rows.push(cur.trim());
      cur = wd;
    } else cur += " " + wd;
  }
  if (cur.trim()) rows.push(cur.trim());
  const w = Math.max(...rows.map((r) => r.length)) * size * 0.55 + size * 1.4;
  const h = rows.length * size * 1.22 + size * 0.9;
  const tp =
    tail === "left" ? `M ${-w / 2 + 30} ${h / 2 - 30} L ${-w / 2 - 40} ${h / 2 + 30} L ${-w / 2 + 70} ${h / 2 - 4}` : tail === "right" ? `M ${w / 2 - 30} ${h / 2 - 30} L ${w / 2 + 40} ${h / 2 + 30} L ${w / 2 - 70} ${h / 2 - 4}` : tail === "down" ? `M -30 ${h / 2 - 4} L 0 ${h / 2 + 46} L 30 ${h / 2 - 4}` : "";
  const sc = 0.7 + 0.3 * clamp01(k);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={clamp01(k * 1.4)}>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={size * 0.7} fill="#000" opacity={0.12} />
      {tp && <path d={tp} fill={bg} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.7} fill={bg} stroke={OL} strokeWidth={4} />
      {rows.map((r, i) => (
        <text key={i} x={0} y={-h / 2 + size * 1.15 + i * size * 1.22} fontFamily={serif ? SERIF : FONT} fontWeight={serif ? 700 : 800} fontSize={size} fill={color} textAnchor="middle">
          {r}
        </text>
      ))}
    </g>
  );
};

// Ценник «цена выбора»: бирка на верёвочке.
export const PriceTag: React.FC<{ x: number; y: number; title: string; text: string; color?: string; k?: number; rot?: number; s?: number }> = ({ x, y, title, text, color = C.gold, k = 1, rot = -6, s = 1 }) => {
  if (k <= 0.001) return null;
  const w = Math.max(title.length * 22, text.length * 20) + 120;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + (1 - clamp01(k)) * 20}) scale(${s * (0.6 + 0.4 * clamp01(k))})`} opacity={clamp01(k * 1.5)}>
      <path d={`M ${-w / 2} -50 L ${w / 2 - 40} -50 L ${w / 2} 0 L ${w / 2 - 40} 50 L ${-w / 2} 50 Z`} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={w / 2 - 42} cy={0} r={10} fill={C.paper} stroke={OL} strokeWidth={3} />
      <path d={`M ${w / 2 - 42} 0 Q ${w / 2} -60 ${w / 2 + 30} -90`} stroke={OL} strokeWidth={3} fill="none" />
      <text x={-w / 2 + 26} y={-12} fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.ink} opacity={0.75}>
        {title}
      </text>
      <text x={-w / 2 + 26} y={30} fontFamily={HEAVY} fontWeight={800} fontSize={34} fill={C.ink}>
        {text}
      </text>
    </g>
  );
};
