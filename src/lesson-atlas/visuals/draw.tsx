// Рисованные предметы фильма BM-006 (SVG): поезда, рельсы, семафоры, город,
// завод, ковш, браслет, мост, вышки, документы, фигурки героев и значки.
// Простые формы, контур, светлые цвета; собственный стиль канала, без
// повторения обложки или иллюстраций издания.
import React from "react";
import { C } from "../theme";
import { FONTS } from "../../banamind/fonts";

export const OL = "#28324a";

export const HostZone = { left: 1170, right: 760, corner: 1080, center: 960, close: 960, peek: 760, off: 960 } as Record<string, number>;
export const zoneX = (host: unknown) => HostZone[String(host)] ?? 960;

// ── рельсы: горизонтальный путь со шпалами (движение — сдвиг шпал) ──
export const Track: React.FC<{ x1: number; x2: number; y: number; shift?: number; color?: string; tie?: string }> = ({ x1, x2, y, shift = 0, color = C.steelDark, tie = C.rail }) => {
  const n = Math.ceil((x2 - x1) / 46) + 1;
  const off = ((shift % 46) + 46) % 46;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const x = x1 + i * 46 - off;
        if (x < x1 - 2 || x > x2) return null;
        return <rect key={i} x={x} y={y - 4} width={14} height={30} rx={3} fill={tie} />;
      })}
      <rect x={x1} y={y} width={x2 - x1} height={6} rx={3} fill={color} />
      <rect x={x1} y={y + 16} width={x2 - x1} height={6} rx={3} fill={color} />
    </g>
  );
};

// ── поезд: локомотив + вагоны (вид сбоку), колёса крутятся ──
export const Train: React.FC<{ x: number; y: number; s?: number; cars?: number; t?: number; color?: string; carColor?: string; lights?: boolean; label?: string }> = ({ x, y, s = 1, cars = 3, t = 0, color = C.skyDeep, carColor = "#e8eef6", lights, label }) => {
  const wheel = (cx: number, key: string) => (
    <g key={key} transform={`translate(${cx} 0) rotate(${(t * 360) % 360})`}>
      <circle r={16} fill={OL} />
      <circle r={7} fill={C.steelLight} />
      <rect x={-2} y={-15} width={4} height={30} fill={C.steelLight} />
    </g>
  );
  // начало координат — задний край локомотива; нос смотрит вправо (+x), вагоны тянутся влево
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: cars }).map((_, i) => {
        const cx = -232 * (i + 1);
        return (
          <g key={i}>
            <rect x={cx} y={-112} width={220} height={92} rx={14} fill={carColor} stroke={OL} strokeWidth={5} />
            {[0, 1, 2, 3].map((w) => (
              <rect key={w} x={cx + 16 + w * 50} y={-96} width={36} height={30} rx={6} fill={lights ? "#ffe9a6" : "#bcd7ee"} stroke={OL} strokeWidth={3} />
            ))}
            <rect x={cx + 218} y={-50} width={14} height={8} fill={OL} />
            {wheel(cx + 44, `a${i}`)}
            {wheel(cx + 176, `b${i}`)}
          </g>
        );
      })}
      <path d="M 0 -20 L 0 -118 Q 0 -140 22 -140 L 190 -140 Q 236 -140 240 -96 L 244 -20 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      <rect x={150} y={-122} width={70} height={40} rx={8} fill={lights ? "#ffe9a6" : "#d8ecff"} stroke={OL} strokeWidth={4} />
      <rect x={14} y={-70} width={120} height={14} rx={7} fill={C.white} opacity={0.75} />
      {label && (
        <text x={76} y={-90} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.white}>
          {label}
        </text>
      )}
      <circle cx={248} cy={-60} r={12} fill={lights ? "#fff4b8" : "#ffe9a6"} stroke={OL} strokeWidth={4} />
      {lights && <path d="M 252 -60 L 520 -110 L 520 -10 Z" fill="#fff4b8" opacity={0.35} />}
      {wheel(56, "l1")}
      {wheel(190, "l2")}
    </g>
  );
};

// ── семафор: красный / жёлтый / зелёный ──
export const Signal: React.FC<{ x: number; y: number; s?: number; state: "red" | "green" | "off"; glow?: number }> = ({ x, y, s = 1, state, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-8} y={-10} width={16} height={260} fill={C.steelDark} stroke={OL} strokeWidth={4} />
    <rect x={-46} y={-170} width={92} height={180} rx={24} fill="#2b3446" stroke={OL} strokeWidth={5} />
    <circle cx={0} cy={-122} r={28} fill={state === "red" ? C.red : "#55303a"} />
    <circle cx={0} cy={-46} r={28} fill={state === "green" ? C.green : "#2f4d3d"} />
    {state === "red" && <circle cx={0} cy={-122} r={60} fill={C.red} opacity={0.22 * glow} />}
    {state === "green" && <circle cx={0} cy={-46} r={60} fill={C.green} opacity={0.22 * glow} />}
  </g>
);

// ── город: силуэт небоскрёбов с окнами ──
export const Skyline: React.FC<{ y: number; color?: string; win?: string; t?: number; seed?: number; x0?: number; x1?: number }> = ({ y, color = "#7f8fa9", win = "#ffe9a6", t = 0, seed = 0, x0 = 0, x1 = 1920 }) => {
  const out: React.ReactNode[] = [];
  let x = x0;
  let i = seed;
  while (x < x1) {
    const w = 90 + ((i * 53) % 90);
    const h = 220 + ((i * 97) % 330);
    out.push(
      <g key={i}>
        <rect x={x} y={y - h} width={w} height={h + 4} fill={color} stroke={OL} strokeWidth={3} />
        {Array.from({ length: Math.floor(h / 46) }).map((_, r) =>
          Array.from({ length: Math.floor(w / 34) }).map((__, c) => {
            const on = ((r * 7 + c * 13 + i * 5) % 5) < 2 + Math.round(Math.sin(t * 0.7 + r + c) * 0.5);
            return <rect key={`${r}-${c}`} x={x + 10 + c * 34} y={y - h + 16 + r * 46} width={18} height={24} rx={3} fill={on ? win : "#c6d0de"} opacity={on ? 0.95 : 0.55} />;
          }),
        )}
      </g>,
    );
    x += w + 8;
    i++;
  }
  return <g>{out}</g>;
};

// ── фигурка героя: условная, без портретного сходства ──
// hair: m — короткая, f — длинная, cap — кепка машиниста, hat — шляпа
export const Figure: React.FC<{ x: number; y: number; s?: number; color?: string; hair?: "m" | "f" | "cap" | "hat" | "bald"; hairColor?: string; t?: number; arms?: number; mood?: "smile" | "sad" | "flat" | "o"; walk?: number; skin?: string; flip?: boolean }> = ({
  x,
  y,
  s = 1,
  color = C.skyDeep,
  hair = "m",
  hairColor = "#5a3b22",
  t = 0,
  arms = 0,
  mood = "flat",
  walk = 0,
  skin = "#f1c9a1",
  flip,
}) => {
  const step = Math.sin(t * 7) * 14 * walk;
  const bob = Math.abs(Math.sin(t * 7)) * -5 * walk;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M -14 -8 L ${-16 + step} 34 M 14 -8 L ${16 - step} 34`} stroke={OL} strokeWidth={10} strokeLinecap="round" />
      <path d={`M -26 -62 L -46 ${-28 - arms * 46} M 26 -62 L ${46} ${-28 - arms * 46}`} stroke={OL} strokeWidth={10} strokeLinecap="round" />
      <rect x={-30} y={-84} width={60} height={80} rx={22} fill={color} stroke={OL} strokeWidth={4} />
      {hair === "f" && <path d="M -32 -100 Q -36 -40 -22 -54 L 22 -54 Q 36 -40 32 -100 Z" fill={hairColor} stroke={OL} strokeWidth={4} />}
      <circle cx={0} cy={-112} r={30} fill={skin} stroke={OL} strokeWidth={4} />
      {hair === "m" && <path d="M -30 -116 Q -28 -146 0 -146 Q 30 -146 30 -116 Q 14 -128 -30 -116 Z" fill={hairColor} stroke={OL} strokeWidth={4} />}
      {hair === "f" && <path d="M -31 -112 Q -30 -146 0 -146 Q 30 -146 31 -112 Q 10 -132 -31 -112 Z" fill={hairColor} stroke={OL} strokeWidth={4} />}
      {hair === "cap" && <path d="M -32 -118 Q -30 -150 0 -150 Q 30 -150 32 -118 L 46 -114 L -32 -114 Z" fill="#3e5a86" stroke={OL} strokeWidth={4} />}
      {hair === "hat" && (
        <g>
          <rect x={-46} y={-132} width={92} height={10} rx={5} fill="#3c3f4e" stroke={OL} strokeWidth={3} />
          <rect x={-26} y={-160} width={52} height={32} rx={8} fill="#3c3f4e" stroke={OL} strokeWidth={3} />
        </g>
      )}
      <circle cx={-10} cy={-114} r={4} fill={OL} />
      <circle cx={10} cy={-114} r={4} fill={OL} />
      {mood === "smile" && <path d="M -10 -100 Q 0 -92 10 -100" stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {mood === "sad" && <path d="M -10 -95 Q 0 -103 10 -95" stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {mood === "flat" && <path d="M -9 -98 L 9 -98" stroke={OL} strokeWidth={3} strokeLinecap="round" />}
      {mood === "o" && <ellipse cx={0} cy={-97} rx={5} ry={6} fill={OL} />}
    </g>
  );
};

// безликий силуэт (толпа, «уходящие люди»)
export const Silhouette: React.FC<{ x: number; y: number; s?: number; color?: string; walk?: number; t?: number; bag?: boolean; opacity?: number }> = ({ x, y, s = 1, color = "#5b6a84", walk = 0, t = 0, bag, opacity = 1 }) => {
  const step = Math.sin(t * 6) * 12 * walk;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path d={`M -10 -6 L ${-12 + step} 34 M 10 -6 L ${12 - step} 34`} stroke={color} strokeWidth={12} strokeLinecap="round" />
      <rect x={-24} y={-80} width={48} height={78} rx={20} fill={color} />
      <circle cx={0} cy={-104} r={24} fill={color} />
      <rect x={-34} y={-136} width={68} height={8} rx={4} fill={color} />
      <rect x={-20} y={-156} width={40} height={24} rx={6} fill={color} />
      {bag && (
        <g>
          <path d="M 26 -40 L 34 -6" stroke={color} strokeWidth={8} strokeLinecap="round" />
          <rect x={20} y={-8} width={46} height={34} rx={6} fill={C.rail} stroke={OL} strokeWidth={3} />
          <rect x={36} y={-14} width={14} height={8} rx={3} fill="none" stroke={OL} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// облачко речи
export const Bubble: React.FC<{ x: number; y: number; w: number; h?: number; text: string; size?: number; k?: number; fill?: string; color?: string; tail?: "left" | "right" | "down" | "none"; font?: string }> = ({ x, y, w, h = 90, text, size = 34, k = 1, fill = C.white, color = C.ink, tail = "down", font = FONTS.heavy }) => {
  if (k <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.4)}>
      <rect x={-w / 2 + 5} y={-h / 2 + 8} width={w} height={h} rx={h / 2.4} fill="#000" opacity={0.08} />
      {tail === "down" && <path d={`M -18 ${h / 2 - 4} L 0 ${h / 2 + 30} L 22 ${h / 2 - 4} Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
      {tail === "left" && <path d={`M ${-w / 2 + 4} -10 L ${-w / 2 - 30} 18 L ${-w / 2 + 4} 16 Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
      {tail === "right" && <path d={`M ${w / 2 - 4} -10 L ${w / 2 + 30} 18 L ${w / 2 - 4} 16 Z`} fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.4} fill={fill} stroke={OL} strokeWidth={4} />
      {text.split("\n").map((l, i, arr) => (
        <text key={i} x={0} y={size * 0.36 + (i - (arr.length - 1) / 2) * size * 1.15} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size} fill={color}>
          {l}
        </text>
      ))}
    </g>
  );
};

// ── ковш с жидким металлом ──
export const Ladle: React.FC<{ x: number; y: number; s?: number; tilt?: number; glow?: number }> = ({ x, y, s = 1, tilt = 0, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M -120 -90 L 120 -90 L 96 70 Q 0 104 -96 70 Z" fill="#5c4a3c" stroke={OL} strokeWidth={6} />
    <ellipse cx={0} cy={-90} rx={120} ry={26} fill={`rgb(255,${200 + 40 * glow},${120 + 80 * glow})`} stroke={OL} strokeWidth={6} />
    <rect x={-140} y={-60} width={28} height={20} rx={6} fill={C.steelDark} stroke={OL} strokeWidth={4} />
    <rect x={112} y={-60} width={28} height={20} rx={6} fill={C.steelDark} stroke={OL} strokeWidth={4} />
  </g>
);

// ── браслет из звеньев (вид сверху/под углом) ──
export const Bracelet: React.FC<{ x: number; y: number; s?: number; t?: number; color?: string; shine?: number; diamond?: boolean; chain?: number }> = ({ x, y, s = 1, t = 0, color = C.metal, shine = 0, diamond, chain = 0 }) => {
  const n = 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + t * 0.6;
        // chain=1: звенья вытягиваются в прямую цепь
        const rx = Math.cos(a) * 120;
        const ry = Math.sin(a) * 44;
        const lx = -300 + i * 46;
        const px = rx + (lx - rx) * chain;
        const py = ry + (0 - ry) * chain;
        const depth = Math.sin(a);
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${chain > 0.5 ? (i % 2) * 90 : (a * 180) / Math.PI + 90})`} opacity={chain > 0.5 ? 1 : 0.65 + 0.35 * (depth + 1) / 2}>
            {diamond ? (
              <path d="M 0 -16 L 14 0 L 0 16 L -14 0 Z" fill="#e6f6ff" stroke={OL} strokeWidth={3} />
            ) : (
              <ellipse rx={26} ry={13} fill="none" stroke={color} strokeWidth={10} />
            )}
          </g>
        );
      })}
      {shine > 0 && (
        <g opacity={shine}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill="#fff" transform={`translate(${Math.cos(i * 1.9 + t * 2) * 140} ${Math.sin(i * 1.9 + t * 2) * 60}) scale(${0.6 + 0.4 * Math.sin(t * 5 + i)})`} />
          ))}
        </g>
      )}
    </g>
  );
};

// ── мост-ферма над каньоном ──
export const Bridge: React.FC<{ x: number; y: number; w: number; s?: number; k?: number; color?: string; arches?: boolean }> = ({ x, y, w, s = 1, k = 1, color = C.metal, arches }) => {
  const n = Math.round(w / 70);
  const step = w / n;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={0} y={0} width={w * k} height={18} fill={color} stroke={OL} strokeWidth={4} />
      {arches
        ? Array.from({ length: 3 }).map((_, i) => {
            const a = (w / 3) * i;
            const b = a + w / 3;
            return a < w * k ? <path key={i} d={`M ${a} 0 Q ${(a + b) / 2} -150 ${b} 0`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" /> : null;
          })
        : Array.from({ length: n }).map((_, i) =>
            i * step < w * k ? (
              <g key={i} stroke={color} strokeWidth={10} strokeLinecap="round">
                <line x1={i * step} y1={0} x2={(i + 0.5) * step} y2={-90} />
                <line x1={(i + 0.5) * step} y1={-90} x2={(i + 1) * step} y2={0} />
                <line x1={(i + 0.5) * step} y1={-90} x2={Math.min(w, (i + 1.5) * step)} y2={-90} />
              </g>
            ) : null,
          )}
    </g>
  );
};

// ── каньон / горы ──
export const Canyon: React.FC<{ y: number; gapA: number; gapB: number; color?: string }> = ({ y, gapA, gapB, color = "#d9a77a" }) => (
  <g>
    <path d={`M 0 ${y} L ${gapA} ${y} L ${gapA + 60} ${y + 260} L ${gapA + 30} 1080 L 0 1080 Z`} fill={color} stroke={OL} strokeWidth={4} />
    <path d={`M 1920 ${y} L ${gapB} ${y} L ${gapB - 60} ${y + 260} L ${gapB - 30} 1080 L 1920 1080 Z`} fill={color} stroke={OL} strokeWidth={4} />
    <path d={`M ${gapA} ${y + 70} L ${gapA + 40} ${y + 90}  M ${gapB} ${y + 120} L ${gapB - 46} ${y + 140}`} stroke="#b07f55" strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const Mountains: React.FC<{ y: number; color?: string; snow?: boolean; seed?: number }> = ({ y, color = "#a9b8cf", snow = true, seed = 0 }) => (
  <g>
    {Array.from({ length: 6 }).map((_, i) => {
      const cx = ((i * 360 + seed * 120) % 2200) - 120;
      const h = 220 + ((i * 71 + seed * 31) % 160);
      return (
        <g key={i}>
          <path d={`M ${cx - 260} ${y} L ${cx} ${y - h} L ${cx + 260} ${y} Z`} fill={color} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
          {snow && <path d={`M ${cx - 60} ${y - h + 54} L ${cx} ${y - h} L ${cx + 60} ${y - h + 54} L ${cx + 22} ${y - h + 40} L ${cx} ${y - h + 58} L ${cx - 22} ${y - h + 40} Z`} fill="#fff" />}
        </g>
      );
    })}
  </g>
);

// ── нефтяная вышка ──
export const Derrick: React.FC<{ x: number; y: number; s?: number; t?: number; flame?: boolean }> = ({ x, y, s = 1, t = 0, flame }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 L -12 -260 L 12 -260 L 60 0" fill="none" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M ${-52 + i * 9} ${-40 - i * 55} L ${52 - i * 9} ${-40 - i * 55 - 50}`} stroke={OL} strokeWidth={5} />
    ))}
    <rect x={-24} y={-280} width={48} height={22} rx={4} fill={C.steelDark} stroke={OL} strokeWidth={4} />
    {flame && <path d={`M 0 -290 Q ${-20 + Math.sin(t * 9) * 6} -330 0 ${-372 + Math.sin(t * 7) * 8} Q ${20} -330 0 -290 Z`} fill={C.fire} stroke={C.fireDeep} strokeWidth={3} />}
  </g>
);

// ── заводской корпус с трубами и дымом ──
export const Factory: React.FC<{ x: number; y: number; s?: number; t?: number; glow?: number; sign?: string; smoke?: number }> = ({ x, y, s = 1, t = 0, glow = 0.6, sign, smoke = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-140, -60].map((sx, i) => (
      <g key={i}>
        <rect x={sx} y={-330} width={40} height={180} fill={C.steelDark} stroke={OL} strokeWidth={4} />
        {smoke > 0 &&
          [0, 1, 2].map((p) => {
            const k = ((t * 0.35 + p / 3 + i * 0.17) % 1);
            return <circle key={p} cx={sx + 20 + k * 60} cy={-340 - k * 160} r={20 + k * 34} fill="#dfe5ee" opacity={(1 - k) * 0.85 * smoke} />;
          })}
      </g>
    ))}
    <path d="M -220 0 L -220 -170 L -120 -230 L -120 -170 L -20 -230 L -20 -170 L 80 -230 L 80 -170 L 200 -170 L 200 0 Z" fill="#9aa8bd" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {[-190, -110, -30, 50, 130].map((wx, i) => (
      <rect key={i} x={wx} y={-120} width={50} height={60} rx={6} fill={`rgba(255,${150 + 60 * Math.sin(t * 3 + i)},60,${0.45 + 0.5 * glow})`} stroke={OL} strokeWidth={3} />
    ))}
    {sign && (
      <g transform="translate(-10 -200)">
        <rect x={-150} y={-30} width={300} height={56} rx={10} fill={OL} />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONTS.condensed} fontWeight={700} fontSize={34} fill={C.fire} letterSpacing={2}>
          {sign}
        </text>
      </g>
    )}
  </g>
);

// ── документ с печатью ──
export const Doc: React.FC<{ x: number; y: number; s?: number; title?: string; stamp?: string; stampK?: number; rot?: number; lines?: number; color?: string }> = ({ x, y, s = 1, title, stamp, stampK = 0, rot = 0, lines = 5, color = "#fffdf6" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-200} width={300} height={400} rx={12} fill="#000" opacity={0.08} transform="translate(8 10)" />
    <rect x={-150} y={-200} width={300} height={400} rx={12} fill={color} stroke={OL} strokeWidth={5} />
    {title &&
      title.split("\n").map((l, i) => (
        <text key={i} x={0} y={-140 + i * 36} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={30} fill={C.ink}>
          {l}
        </text>
      ))}
    {Array.from({ length: lines }).map((_, i) => (
      <rect key={i} x={-110} y={-60 + i * 36} width={i % 3 === 2 ? 140 : 220} height={10} rx={5} fill="#c9d1dd" />
    ))}
    {stamp && stampK > 0 && (
      <g transform={`translate(40 140) rotate(-12) scale(${1.8 - 0.8 * Math.min(1, stampK)})`} opacity={Math.min(1, stampK * 1.5)}>
        <rect x={-120} y={-34} width={240} height={68} rx={10} fill="none" stroke={C.red} strokeWidth={7} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONTS.display} fontSize={36} fill={C.red}>
          {stamp}
        </text>
      </g>
    )}
  </g>
);

export const Coin: React.FC<{ x: number; y: number; r?: number; t?: number; label?: string; color?: string }> = ({ x, y, r = 40, t = 0, label = "$", color = C.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.15, Math.abs(Math.cos(t * 2.4)))} 1)`}>
    <circle r={r} fill={color} stroke={OL} strokeWidth={4} />
    <circle r={r * 0.74} fill="none" stroke="#b8862a" strokeWidth={3} />
    <text y={r * 0.36} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={r} fill="#8a5f12">
      {label}
    </text>
  </g>
);

export const Ingot: React.FC<{ x: number; y: number; s?: number; color?: string; glow?: number }> = ({ x, y, s = 1, color = C.metal, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-10} rx={130} ry={60} fill={color} opacity={0.25 * glow} />}
    <path d="M -90 0 L -60 -50 L 60 -50 L 90 0 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -60 -50 L 60 -50 L 50 -40 L -50 -40 Z" fill="#fff" opacity={0.35} />
  </g>
);

export const WineGlass: React.FC<{ x: number; y: number; s?: number; fill?: string; tilt?: number }> = ({ x, y, s = 1, fill = "#d24d6b", tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M -40 -120 Q -44 -50 0 -40 Q 44 -50 40 -120 Z" fill="#eaf4fb" stroke={OL} strokeWidth={4} opacity={0.95} />
    <path d="M -38 -96 Q -38 -52 0 -46 Q 38 -52 38 -96 Z" fill={fill} opacity={0.9} />
    <rect x={-4} y={-42} width={8} height={40} fill="#eaf4fb" stroke={OL} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={30} ry={8} fill="#eaf4fb" stroke={OL} strokeWidth={3} />
  </g>
);

// ── дерево (для полого дуба) ──
export const Oak: React.FC<{ x: number; y: number; s?: number; split?: number; t?: number }> = ({ x, y, s = 1, split = 0, t = 0 }) => {
  const d = split * 70;
  const sway = Math.sin(t * 1.1) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * d * 0.6} 0) rotate(${side * split * 12} 0 0)`}>
          <path d={`M ${side * 2} 0 L ${side * 38} 0 Q ${side * 30} -120 ${side * 26} -230 L ${side * 2} -230 Z`} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
          <g transform={`rotate(${sway})`}>
            <circle cx={side * 80} cy={-290} r={90} fill="#4fae74" stroke={OL} strokeWidth={5} />
            <circle cx={side * 20} cy={-350} r={86} fill="#5cbd80" stroke={OL} strokeWidth={5} />
          </g>
        </g>
      ))}
      {split > 0.05 && <path d={`M ${-d * 0.5 + 6} -10 L ${-d * 0.5 + 6} -220 L ${d * 0.5 - 6} -220 L ${d * 0.5 - 6} -10 Z`} fill="#2d2118" opacity={Math.min(1, split * 2)} />}
      {split > 0.3 &&
        Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={(i % 3) * 14 - 14} cy={-30 - i * 22 + split * 30} r={6} fill="#9a8c7a" opacity={0.8 * split} />
        ))}
    </g>
  );
};

// ── пишущая машинка ──
export const Typewriter: React.FC<{ x: number; y: number; s?: number; t?: number; broken?: number }> = ({ x, y, s = 1, t = 0, broken = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-70} width={300} height={90} rx={22} fill="#5d6b80" stroke={OL} strokeWidth={5} />
    <rect x={-170} y={-110} width={340} height={44} rx={16} fill="#3f4a5c" stroke={OL} strokeWidth={5} />
    <rect x={-100} y={-200} width={200} height={110} fill="#fffdf6" stroke={OL} strokeWidth={4} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 8 }).map((__, c) => (
        <circle key={`${r}-${c}`} cx={-115 + c * 33 + r * 8} cy={-40 + r * 22} r={9} fill="#e8eef6" stroke={OL} strokeWidth={2} transform={`translate(0 ${broken && (r + c) % 5 === 0 ? Math.sin(t * 10 + c) * 3 : 0})`} />
      )),
    )}
    {broken > 0 &&
      [0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${160 + i * 40} ${10 + Math.min(1, broken) * 40}) rotate(${i * 50 + t * 40})`}>
          <path d="M -10 -4 L 10 -4 L 10 4 L -10 4 Z" fill={C.steel} stroke={OL} strokeWidth={2} />
        </g>
      ))}
  </g>
);

// ── большой знак вопроса в тумане ──
export const FogQuestion: React.FC<{ x: number; y: number; s?: number; t?: number; k?: number; color?: string }> = ({ x, y, s = 1, t = 0, k = 1, color = "#9aa9c2" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
    {Array.from({ length: 7 }).map((_, i) => (
      <ellipse key={i} cx={Math.sin(t * 0.4 + i) * 60 + (i - 3) * 50} cy={Math.cos(t * 0.3 + i * 2) * 20 + 140} rx={120} ry={34} fill="#fff" opacity={0.45} />
    ))}
    <text x={0} y={60} textAnchor="middle" fontFamily={FONTS.display} fontSize={320} fill={color} opacity={0.9}>
      ?
    </text>
  </g>
);

// ── значки для карточек ──
export const Icon: React.FC<{ name: string; x: number; y: number; s?: number; t?: number }> = ({ name, x, y, s = 1, t = 0 }) => {
  const g = (ch: React.ReactNode) => <g transform={`translate(${x} ${y}) scale(${s})`}>{ch}</g>;
  switch (name) {
    case "gear":
      return g(
        <g transform={`rotate(${t * 30})`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={-9} y={-50} width={18} height={22} rx={4} fill={C.steel} stroke={OL} strokeWidth={3} transform={`rotate(${i * 45})`} />
          ))}
          <circle r={34} fill={C.steel} stroke={OL} strokeWidth={4} />
          <circle r={12} fill={C.paper} stroke={OL} strokeWidth={3} />
        </g>,
      );
    case "music":
      return g(
        <g>
          <path d="M -14 26 L -14 -40 L 34 -52 L 34 14" fill="none" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={-26} cy={28} rx={16} ry={12} fill={C.violet} stroke={OL} strokeWidth={4} />
          <ellipse cx={22} cy={16} rx={16} ry={12} fill={C.violet} stroke={OL} strokeWidth={4} />
        </g>,
      );
    case "helmet":
      return g(
        <g>
          <path d="M -50 14 Q -50 -44 0 -44 Q 50 -44 50 14 Z" fill={C.yellow} stroke={OL} strokeWidth={5} />
          <rect x={-62} y={10} width={124} height={16} rx={8} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
          <rect x={-8} y={-44} width={16} height={54} fill={C.yellowDeep} />
        </g>,
      );
    case "factory":
      return g(<Factory x={0} y={40} s={0.32} t={t} />);
    case "question":
      return g(
        <text y={36} textAnchor="middle" fontFamily={FONTS.display} fontSize={110} fill={C.violet}>
          ?
        </text>,
      );
    case "door":
      return g(
        <g>
          <rect x={-36} y={-56} width={72} height={112} rx={6} fill="#2b3446" stroke={OL} strokeWidth={4} />
          <path d="M -36 -56 L 18 -42 L 18 70 L -36 56 Z" fill="#a37b52" stroke={OL} strokeWidth={4} />
          <circle cx={8} cy={8} r={5} fill={C.gold} />
        </g>,
      );
    case "mine":
      return g(
        <g>
          <path d="M -56 40 L -56 -10 Q 0 -70 56 -10 L 56 40 Z" fill="#8f6a4a" stroke={OL} strokeWidth={4} />
          <path d="M -26 40 L -26 0 Q 0 -30 26 0 L 26 40 Z" fill="#2b2420" />
          <path d="M -30 -40 L 30 -40" stroke={OL} strokeWidth={6} />
        </g>,
      );
    case "shadow":
      return g(<Silhouette x={0} y={40} s={0.52} color="#3b4660" />);
    case "glass":
      return g(<WineGlass x={0} y={56} s={0.8} />);
    case "law":
      return g(<Doc x={0} y={0} s={0.24} stamp="ЗАКОН" stampK={1} />);
    case "signal":
      return g(<Signal x={0} y={50} s={0.42} state="green" />);
    case "calc":
      return g(
        <g>
          <rect x={-42} y={-56} width={84} height={112} rx={12} fill="#e8eef6" stroke={OL} strokeWidth={4} />
          <rect x={-30} y={-44} width={60} height={24} rx={4} fill="#bfe8de" stroke={OL} strokeWidth={3} />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={-30 + (i % 3) * 22} y={-10 + Math.floor(i / 3) * 20} width={16} height={14} rx={3} fill={C.steel} />
          ))}
        </g>,
      );
    case "fog":
      return g(
        <g>
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={(i - 1) * 26 + Math.sin(t + i) * 6} cy={i * 18 - 16} rx={50} ry={16} fill="#b9c4d6" stroke={OL} strokeWidth={3} />
          ))}
        </g>,
      );
    case "ingot":
      return g(<Ingot x={0} y={26} s={0.55} />);
    case "rails":
      return g(
        <g>
          <path d="M -40 56 L -10 -56 M 40 56 L 10 -56" stroke={C.metal} strokeWidth={8} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-34 + i * 7} y={40 - i * 30} width={68 - i * 14} height={8} rx={3} fill={C.rail} />
          ))}
        </g>,
      );
    case "folder":
      return g(
        <g>
          <path d="M -52 -36 L -12 -36 L 0 -24 L 52 -24 L 52 44 L -52 44 Z" fill="#c9a26b" stroke={OL} strokeWidth={4} />
          <rect x={-40} y={-14} width={80} height={10} rx={4} fill="#fffdf6" />
        </g>,
      );
    case "notebook":
      return g(
        <g>
          <rect x={-40} y={-54} width={80} height={108} rx={8} fill="#fffdf6" stroke={OL} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-26} y={-30 + i * 20} width={52} height={6} rx={3} fill="#c9d1dd" />
          ))}
          <path d="M 30 50 L 58 -30" stroke={C.yellowDeep} strokeWidth={10} strokeLinecap="round" />
        </g>,
      );
    case "copper":
      return g(<Coin x={0} y={0} r={48} t={t} label="Cu" color="#d98e5a" />);
    case "derrick":
      return g(<Derrick x={0} y={60} s={0.42} t={t} flame />);
    case "train":
      return g(<Train x={0} y={30} s={0.3} cars={1} t={t} />);
    case "heart":
      return g(<path d="M 0 40 Q -60 -4 -40 -34 Q -20 -56 0 -28 Q 20 -56 40 -34 Q 60 -4 0 40 Z" fill={C.coral} stroke={OL} strokeWidth={4} />);
    default:
      return g(<circle r={40} fill={C.steel} />);
  }
};
