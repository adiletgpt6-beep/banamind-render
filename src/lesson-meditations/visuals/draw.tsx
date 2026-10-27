// Рисованные предметы фильма BM-012 (SVG): римский шатёр и лагерь, масляная лампа,
// восковая табличка, свиток, колонна, фигура императора (силуэт без портретного
// сходства — художественный образ), мини-банан — герой вымышленного дня, небо дня
// (солнце движется от утра к ночи, без часов), дождь, автобус, телефон, кровать,
// пчела, улей, лоза, лошадь, изумруд, родник, огонь, огурец, куст, стена, хлеб.
// Богов, божеств и обрядов здесь нет и быть не должно.
import React from "react";
import { Banana, MOODS, POSES, blinkAt, type MoodName, type PoseName } from "../../banana-host";
import { OL } from "../../lesson-traktat/visuals/draw";
import { C, FONT, R } from "../theme";

export { OL };
export { Book, Bubble, Heart, Person, Tree, Sun } from "../../lesson-traktat/visuals/draw";

type P = { x: number; y: number; s?: number };

// ── герой дня: тот же банан BanaMind, маленький, внутри сцены (рот закрыт — говорит ведущий) ──
export const Hero: React.FC<P & { pose?: PoseName; mood?: MoodName; t: number; flip?: boolean; umbrella?: boolean }> = ({ x, y, s = 0.42, pose = "idle", mood = "happy", t, flip, umbrella }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={4} rx={140} ry={18} fill="#000" opacity={0.08} />
    <Banana pose={POSES[pose]} face={MOODS[mood]} mouthOpen={0} mouthRound={0} blink={blinkAt(t + x * 0.01)} t={t} talk={0} />
    {umbrella && (
      <g transform="translate(150 -520)">
        <line x1={0} y1={0} x2={0} y2={300} stroke={OL} strokeWidth={10} />
        <path d="M -230 0 Q 0 -200 230 0 Q 190 -24 152 0 Q 114 -24 76 0 Q 38 -24 0 0 Q -38 -24 -76 0 Q -114 -24 -152 0 Q -190 -24 -230 0 Z" fill={C.coral} stroke={OL} strokeWidth={8} strokeLinejoin="round" />
      </g>
    )}
  </g>
);

// ── небо дня: положение солнца/луны без цифр и часов (0 — рассвет … 1 — полдень … 2 — закат … 3 — ночь) ──
export const SkyArc: React.FC<{ x: number; y: number; w: number; phase: number; t: number }> = ({ x, y, w, phase, t }) => {
  const k = Math.min(phase, 2) / 2;
  const a = Math.PI * (1 - k);
  const sx = x + Math.cos(a) * w * 0.5;
  const sy = y - Math.sin(a) * w * 0.28;
  const night = Math.max(0, Math.min(1, phase - 2));
  return (
    <g>
      <path d={`M ${x - w / 2} ${y} Q ${x} ${y - w * 0.56} ${x + w / 2} ${y}`} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="6 14" opacity={0.6} />
      {night < 1 && (
        <g opacity={1 - night}>
          <circle cx={sx} cy={sy} r={46 + 4 * Math.sin(t * 2)} fill={phase > 1.6 ? R.terracotta : C.yellow} opacity={0.3} />
          <circle cx={sx} cy={sy} r={34} fill={phase > 1.6 ? "#ff9a5a" : C.yellow} stroke={C.yellowDeep} strokeWidth={4} />
        </g>
      )}
      {night > 0 && (
        <g opacity={night} transform={`translate(${x} ${y - w * 0.26})`}>
          <path d="M 0 -36 A 36 36 0 1 0 30 18 A 28 28 0 1 1 0 -36 Z" fill="#fff3c4" stroke={OL} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

// ── масляная лампа с живым пламенем ──
export const OilLamp: React.FC<P & { t: number; glow?: number; out?: number }> = ({ x, y, s = 1, t, glow = 1, out = 0 }) => {
  const fl = 1 + 0.12 * Math.sin(t * 13) + 0.08 * Math.sin(t * 7.3);
  const on = 1 - out;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {on > 0 && <circle cx={58} cy={-62} r={170 * glow} fill="#ffcf66" opacity={0.18 * on} />}
      {on > 0 && <circle cx={58} cy={-62} r={80 * glow} fill="#ffd98a" opacity={0.28 * on} />}
      <path d="M -70 -10 Q -80 -50 -20 -54 L 60 -54 Q 96 -50 84 -30 Q 70 -10 40 -6 L -40 -6 Q -66 -6 -70 -10 Z" fill={R.terracotta} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -100 -40 Q -120 -36 -100 -22" fill="none" stroke={OL} strokeWidth={6} />
      <ellipse cx={-6} cy={-54} rx={22} ry={7} fill="#7a3a1e" stroke={OL} strokeWidth={3} />
      <rect x={-44} y={-6} width={70} height={12} rx={6} fill="#a8502c" stroke={OL} strokeWidth={4} />
      {on > 0 && (
        <g transform={`translate(66 -58) scale(${on} ${fl * on})`}>
          <path d="M 0 0 Q -16 -24 0 -56 Q 16 -24 0 0 Z" fill="#ff9f43" />
          <path d="M 0 -4 Q -8 -20 0 -38 Q 8 -20 0 -4 Z" fill="#fff1a8" />
        </g>
      )}
      {out > 0.2 && <path d={`M 66 -70 q ${-10} ${-20} 0 ${-40} q 10 -20 0 -40`} fill="none" stroke={R.grey} strokeWidth={4} opacity={out * 0.7} />}
    </g>
  );
};

// ── восковая табличка с записью (строки «пишутся» по k) ──
export const WaxTablet: React.FC<P & { k?: number; rows?: number; text?: string[]; tilt?: number }> = ({ x, y, s = 1, k = 1, rows = 5, text, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <rect x={-170} y={-120} width={340} height={240} rx={14} fill="#b07a3c" stroke={OL} strokeWidth={6} />
    <rect x={-150} y={-100} width={300} height={200} rx={6} fill={R.wax} stroke={OL} strokeWidth={3} />
    {text
      ? text.map((l, i) => (
          <text key={i} x={-132} y={-58 + i * 44} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={30} fill="#5b3a12" opacity={Math.max(0, Math.min(1, k * text.length - i))}>
            {l}
          </text>
        ))
      : Array.from({ length: rows }).map((_, i) => {
          const w = 250 - (i === rows - 1 ? 90 : (i * 37) % 60);
          const kk = Math.max(0, Math.min(1, k * rows - i));
          return <path key={i} d={`M -130 ${-70 + i * 36} q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke="#6b4316" strokeWidth={4} strokeDasharray={w + 20} strokeDashoffset={(w + 20) * (1 - kk)} />;
        })}
  </g>
);

// ── свиток ──
export const Scroll: React.FC<P & { open?: number; label?: string; color?: string }> = ({ x, y, s = 1, open = 1, label, color = R.parchment }) => {
  const h = 40 + 150 * open;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-60} y={-h / 2} width={120} height={h} fill={color} stroke={OL} strokeWidth={4} />
      {open > 0.5 &&
        [0, 1, 2, 3].map((i) => <line key={i} x1={-40} x2={40 - (i % 2) * 20} y1={-h / 2 + 34 + i * 26} y2={-h / 2 + 34 + i * 26} stroke="#b39463" strokeWidth={4} opacity={(open - 0.5) * 2} />)}
      <rect x={-72} y={-h / 2 - 16} width={144} height={22} rx={11} fill="#c79a5b" stroke={OL} strokeWidth={4} />
      <rect x={-72} y={h / 2 - 6} width={144} height={22} rx={11} fill="#c79a5b" stroke={OL} strokeWidth={4} />
      {label && (
        <text x={0} y={8} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={44} textAnchor="middle" fill={C.ink}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── колонна ──
export const Column: React.FC<P & { h?: number; color?: string }> = ({ x, y, s = 1, h = 360, color = R.marble }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-26} width={140} height={26} rx={4} fill={R.marbleShade} stroke={OL} strokeWidth={4} />
    <rect x={-50} y={-26 - h} width={100} height={h} fill={color} stroke={OL} strokeWidth={4} />
    {[-30, -10, 10, 30].map((fx) => (
      <line key={fx} x1={fx} x2={fx} y1={-20 - h} y2={-32} stroke={R.marbleShade} strokeWidth={5} />
    ))}
    <rect x={-74} y={-52 - h} width={148} height={28} rx={6} fill={R.marbleShade} stroke={OL} strokeWidth={4} />
    <path d={`M -80 ${-52 - h} q 20 -24 40 0 M 40 ${-52 - h} q 20 -24 40 0`} fill="none" stroke={OL} strokeWidth={4} />
  </g>
);

// ── римлянин в плаще, сидящий и пишущий (силуэт сбоку, без портрета) ──
export const Writer: React.FC<P & { t: number; write?: number; light?: string; flip?: boolean }> = ({ x, y, s = 1, t, write = 1, light = "#e7c7a0", flip }) => {
  const hand = Math.sin(t * 9) * 4 * write;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* табурет */}
      <rect x={-70} y={-10} width={110} height={16} rx={6} fill="#6b4a1e" stroke={OL} strokeWidth={4} />
      <line x1={-56} y1={6} x2={-64} y2={90} stroke={OL} strokeWidth={8} />
      <line x1={26} y1={6} x2={34} y2={90} stroke={OL} strokeWidth={8} />
      {/* плащ */}
      <path d="M -70 -10 Q -96 -120 -46 -190 Q 0 -230 40 -190 Q 70 -140 66 -60 L 96 -10 Z" fill={R.purple} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -20 -190 Q 10 -120 0 -10" fill="none" stroke="#fff" strokeWidth={10} opacity={0.35} />
      {/* голова (затылок, вьющиеся волосы, борода) */}
      <circle cx={8} cy={-236} r={44} fill={light} stroke={OL} strokeWidth={5} />
      <path d="M -36 -242 Q -40 -290 10 -286 Q 52 -284 50 -246 Q 30 -262 4 -258 Q -16 -262 -36 -242 Z" fill="#5a4a3a" stroke={OL} strokeWidth={4} />
      <path d="M 22 -214 Q 52 -206 50 -228 Q 56 -196 30 -192 Q 14 -194 22 -214 Z" fill="#5a4a3a" stroke={OL} strokeWidth={4} />
      {/* рука с палочкой-стилусом */}
      <path d={`M 30 -150 Q 90 -120 ${118 + hand} ${-96 + hand * 0.5}`} fill="none" stroke={R.purple} strokeWidth={26} strokeLinecap="round" />
      <circle cx={122 + hand} cy={-94 + hand * 0.5} r={13} fill={light} stroke={OL} strokeWidth={4} />
      <line x1={122 + hand} y1={-94 + hand * 0.5} x2={150 + hand} y2={-76 + hand * 0.5} stroke="#3b2a10" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

// ── походный шатёр ──
export const Tent: React.FC<P & { open?: number; glow?: number; color?: string }> = ({ x, y, s = 1, open = 1, glow = 0, color = "#d9c9a3" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 0 L 0 -300 L 260 0 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M 0 -300 L ${-120 * open} 0 L ${120 * open} 0 Z`} fill="#3b2c1c" />
    {glow > 0 && <path d={`M 0 -300 L ${-120 * open} 0 L ${120 * open} 0 Z`} fill="#ffcf66" opacity={0.55 * glow} />}
    <path d={`M 0 -300 L ${-120 * open} 0`} stroke={OL} strokeWidth={5} />
    <path d={`M 0 -300 L ${120 * open} 0`} stroke={OL} strokeWidth={5} />
    <line x1={0} y1={-300} x2={0} y2={-360} stroke={OL} strokeWidth={6} />
    <path d="M 0 -360 L 50 -346 L 0 -332 Z" fill={R.terracotta} stroke={OL} strokeWidth={3} />
  </g>
);

export const Campfire: React.FC<P & { t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-30} r={70} fill="#ffb347" opacity={0.18 + 0.05 * Math.sin(t * 9)} />
    <path d="M -40 0 L 40 -14 M -40 -14 L 40 0" stroke="#6b4a1e" strokeWidth={12} strokeLinecap="round" />
    <path d={`M -26 -6 Q -30 ${-50 - 8 * Math.sin(t * 11)} 0 ${-80 - 10 * Math.sin(t * 8)} Q 30 -50 26 -6 Z`} fill="#ff8a3d" />
    <path d={`M -12 -8 Q -12 ${-34 - 6 * Math.sin(t * 13)} 0 ${-50 - 6 * Math.sin(t * 9)} Q 12 -34 12 -8 Z`} fill="#ffe08a" />
  </g>
);

// ── дождь в прямоугольнике ──
export const Rain: React.FC<{ x: number; y: number; w: number; h: number; t: number; k?: number }> = ({ x, y, w, h, t, k = 1 }) => (
  <g opacity={k}>
    {Array.from({ length: 34 }).map((_, i) => {
      const px = x + ((i * 97) % w);
      const py = y + ((t * 520 + i * 61) % h);
      return <line key={i} x1={px} y1={py} x2={px - 8} y2={py + 26} stroke={R.rain} strokeWidth={5} strokeLinecap="round" />;
    })}
  </g>
);

export const Cloud: React.FC<P & { color?: string }> = ({ x, y, s = 1, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -90 30 Q -120 30 -120 0 Q -120 -34 -84 -34 Q -76 -80 -26 -76 Q 10 -110 54 -76 Q 110 -80 110 -30 Q 140 -20 130 14 Q 124 30 100 30 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const Bus: React.FC<P & { t?: number; color?: string }> = ({ x, y, s = 1, t = 0, color = C.yellow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-130} width={340} height={110} rx={22} fill={color} stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-150 + i * 72} y={-112} width={56} height={44} rx={6} fill={R.tealSoft} stroke={OL} strokeWidth={4} />
    ))}
    {[-100, 110].map((wx, i) => (
      <g key={i} transform={`translate(${wx} -20) rotate(${t * 200})`}>
        <circle r={26} fill={C.ink} stroke={OL} strokeWidth={4} />
        <line x1={-14} x2={14} stroke="#fff" strokeWidth={4} />
      </g>
    ))}
  </g>
);

export const Phone: React.FC<P & { children?: React.ReactNode; rot?: number }> = ({ x, y, s = 1, rot = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-110} y={-200} width={220} height={400} rx={30} fill={C.ink} stroke={OL} strokeWidth={5} />
    <rect x={-96} y={-176} width={192} height={340} rx={14} fill="#f7fbff" />
    <rect x={-30} y={176} width={60} height={8} rx={4} fill="#fff" opacity={0.5} />
    {children}
  </g>
);

export const Bed: React.FC<P & { blanket?: string }> = ({ x, y, s = 1, blanket = R.terracottaSoft }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-150} width={40} height={190} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
    <rect x={260} y={-90} width={40} height={130} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
    <rect x={-270} y={-50} width={540} height={60} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
    <path d="M -150 -50 Q -140 -120 0 -110 Q 200 -110 270 -60 L 270 10 L -150 10 Z" fill={blanket} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={-210} cy={-70} rx={60} ry={30} fill="#fff" stroke={OL} strokeWidth={5} />
  </g>
);

export const Bee: React.FC<P & { t: number; rot?: number }> = ({ x, y, s = 1, t, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={-6} cy={-20} rx={16} ry={10 + 6 * Math.abs(Math.sin(t * 30))} fill="#fff" opacity={0.8} stroke={OL} strokeWidth={2} />
    <ellipse cx={10} cy={-20} rx={16} ry={10 + 6 * Math.abs(Math.cos(t * 30))} fill="#fff" opacity={0.8} stroke={OL} strokeWidth={2} />
    <ellipse rx={24} ry={16} fill={C.yellow} stroke={OL} strokeWidth={3} />
    <path d="M -6 -15 L -6 15 M 6 -15 L 6 15" stroke={OL} strokeWidth={5} />
    <circle cx={22} cy={-4} r={3} fill={OL} />
  </g>
);

export const Hive: React.FC<P & { glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cy={-110} rx={170} ry={150} fill={C.yellow} opacity={0.3 * glow} />}
    {[0, 1, 2, 3, 4].map((i) => {
      const w = 120 + [0, 40, 70, 60, 30][i];
      return <rect key={i} x={-w} y={-40 - i * 48} width={w * 2} height={50} rx={25} fill={i % 2 ? "#f5c04a" : "#e9ad2c"} stroke={OL} strokeWidth={5} />;
    }).reverse()}
    <ellipse cx={0} cy={-36} rx={26} ry={18} fill="#5a3a12" stroke={OL} strokeWidth={4} />
  </g>
);

export const Grapes: React.FC<P & { k?: number }> = ({ x, y, s = 1, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * k})`} opacity={Math.min(1, k * 2)}>
    {[
      [0, 0], [-22, -10], [22, -10], [-34, -36], [0, -32], [34, -36], [-16, -58], [16, -58], [0, 22],
    ].map(([gx, gy], i) => (
      <circle key={i} cx={gx} cy={-gy} r={17} fill={R.purple} stroke={OL} strokeWidth={3} />
    ))}
    <path d="M 0 -82 L 0 -100 M 0 -96 Q 26 -112 40 -96" stroke={R.olive} strokeWidth={6} fill="none" />
  </g>
);

export const Vine: React.FC<P & { t: number; grapes?: number[] }> = ({ x, y, s = 1, t, grapes = [1, 1, 1] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 Q -20 -120 30 -200 Q 80 -280 20 -360" fill="none" stroke="#7a4f22" strokeWidth={14} strokeLinecap="round" />
    {[
      [-60, -150], [70, -230], [-30, -330],
    ].map(([lx, ly], i) => (
      <g key={i} transform={`translate(${lx} ${ly}) rotate(${Math.sin(t * 1.4 + i) * 6})`}>
        <path d="M 0 0 Q -50 -10 -60 -50 Q -20 -40 0 -70 Q 20 -40 60 -50 Q 50 -10 0 0 Z" fill={R.olive} stroke={OL} strokeWidth={4} />
      </g>
    ))}
    {grapes.map((g, i) => (g > 0 ? <Grapes key={i} x={[-10, 50, 0][i]} y={[-110, -180, -290][i] + 110} s={0.8} k={g} /> : null))}
  </g>
);

export const Horse: React.FC<P & { t: number }> = ({ x, y, s = 1, t }) => {
  const g = Math.sin(t * 9);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-60, -30, 50, 80].map((lx, i) => (
        <line key={i} x1={lx} y1={-70} x2={lx + (i % 2 ? g : -g) * 22} y2={0} stroke="#7a4f22" strokeWidth={14} strokeLinecap="round" />
      ))}
      <ellipse cx={10} cy={-96} rx={100} ry={44} fill="#a8692e" stroke={OL} strokeWidth={5} />
      <path d="M 90 -110 Q 120 -180 160 -186 L 180 -150 Q 150 -146 130 -96 Z" fill="#a8692e" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 100 -130 Q 120 -190 150 -196" fill="none" stroke="#4a2c10" strokeWidth={10} />
      <circle cx={160} cy={-170} r={4} fill={OL} />
      <path d={`M -88 -110 Q -130 ${-90 + g * 10} -126 -40`} fill="none" stroke="#4a2c10" strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

export const Emerald: React.FC<P & { glint?: number; color?: string; dull?: number }> = ({ x, y, s = 1, glint = 1, color = "#2fbf71", dull = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={120} fill={color} opacity={0.15 * glint * (1 - dull)} />
    <path d="M -60 -80 L 60 -80 L 100 -30 L 0 100 L -100 -30 Z" fill={color} stroke={OL} strokeWidth={6} strokeLinejoin="round" opacity={1 - dull * 0.5} />
    <path d="M -100 -30 L 100 -30 M -60 -80 L -30 -30 L 0 100 L 30 -30 L 60 -80" fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
    <path d="M -46 -66 L -20 -66 L -34 -40 Z" fill="#fff" opacity={0.7 * glint} />
  </g>
);

export const Spring: React.FC<P & { t: number; dirt?: number }> = ({ x, y, s = 1, t, dirt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={220} ry={60} fill={R.stone} stroke={OL} strokeWidth={5} />
    <ellipse cx={0} cy={-6} rx={190} ry={46} fill="#7cc8f0" stroke={OL} strokeWidth={3} />
    <ellipse cx={-30} cy={-4} rx={110 * dirt} ry={24 * dirt} fill="#7a5a2a" opacity={0.8 * dirt} />
    {[0, 1, 2].map((i) => {
      const r = ((t * 50 + i * 40) % 120) + 10;
      return <ellipse key={i} cx={0} cy={-6} rx={r} ry={r * 0.24} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - r / 130} />;
    })}
    <path d={`M 0 -10 Q -12 ${-70 - 6 * Math.sin(t * 6)} 0 -110 Q 12 -70 0 -10`} fill="#bfe8ff" stroke={OL} strokeWidth={3} opacity={0.9} />
  </g>
);

export const Fire: React.FC<P & { t: number; k?: number }> = ({ x, y, s = 1, t, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * k)})`}>
    <circle cy={-100} r={160} fill="#ffb347" opacity={0.18} />
    <path d={`M -90 0 Q -120 ${-120 - 20 * Math.sin(t * 7)} -40 ${-200 - 20 * Math.sin(t * 5)} Q -30 -120 0 ${-260 - 30 * Math.sin(t * 6)} Q 40 -140 60 ${-200 - 20 * Math.cos(t * 7)} Q 130 -110 90 0 Z`} fill="#ff7a3d" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M -50 0 Q -60 -80 -10 ${-140 - 14 * Math.sin(t * 9)} Q 20 -80 40 ${-120 - 10 * Math.cos(t * 8)} Q 70 -60 50 0 Z`} fill="#ffd166" />
  </g>
);

export const Cucumber: React.FC<P & { rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-110} y={-36} width={220} height={72} rx={36} fill="#5aa64a" stroke={OL} strokeWidth={5} />
    {[-70, -30, 10, 50, 80].map((dx, i) => (
      <circle key={i} cx={dx} cy={i % 2 ? -12 : 12} r={4} fill="#d8f0c0" />
    ))}
    <path d="M -110 0 q -18 -6 -26 -20" stroke="#3b7a2e" strokeWidth={6} fill="none" />
  </g>
);

export const Bush: React.FC<P & { thorns?: boolean }> = ({ x, y, s = 1, thorns = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 0 Q -150 -80 -80 -100 Q -60 -160 0 -140 Q 60 -170 90 -110 Q 160 -90 120 0 Z" fill="#4f8a3c" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    {thorns && [[-90, -60], [-40, -120], [30, -130], [90, -80], [0, -60], [60, -30], [-60, -20]].map(([tx, ty], i) => <path key={i} d={`M ${tx} ${ty} l 12 -18 l 6 22 Z`} fill="#fff" stroke={OL} strokeWidth={2} />)}
  </g>
);

export const Wall: React.FC<P & { w?: number; h?: number }> = ({ x, y, s = 1, w = 420, h = 360 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={R.stone} stroke={OL} strokeWidth={5} />
    {Array.from({ length: Math.floor(h / 50) }).map((_, r) =>
      Array.from({ length: Math.ceil(w / 90) + 1 }).map((_, c) => {
        const bx = -w / 2 + c * 90 - (r % 2) * 45;
        if (bx >= w / 2 || bx + 90 <= -w / 2) return null;
        const x0 = Math.max(-w / 2, bx);
        const x1 = Math.min(w / 2, bx + 90);
        return <rect key={`${r}-${c}`} x={x0 + 3} y={-h + r * 50 + 3} width={x1 - x0 - 6} height={44} rx={4} fill="#c2bbb1" />;
      }),
    )}
    {Array.from({ length: Math.ceil(w / 70) }).map((_, i) => (
      <rect key={i} x={-w / 2 + i * 70} y={-h - 40} width={44} height={40} fill={R.stone} stroke={OL} strokeWidth={4} />
    ))}
  </g>
);

export const Bread: React.FC<P & { cracks?: number }> = ({ x, y, s = 1, cracks = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -200 0 Q -220 -150 0 -160 Q 220 -150 200 0 Z" fill="#d9954a" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -170 -20 Q -160 -120 0 -130 Q 160 -120 170 -20" fill="none" stroke="#f0b870" strokeWidth={10} opacity={0.6} />
    {[-110, -40, 30, 100].map((cx, i) => (
      <path key={i} d={`M ${cx - 24} ${-100 + (i % 2) * 14} q 24 -18 ${48} 0`} fill="none" stroke="#7a4a1a" strokeWidth={9} strokeLinecap="round" strokeDasharray={70} strokeDashoffset={70 * (1 - Math.max(0, Math.min(1, cracks * 4 - i)))} />
    ))}
  </g>
);

export const Laurel: React.FC<P & { color?: string }> = ({ x, y, s = 1, color = R.olive }) => {
  const r = 80;
  const pt = (side: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [side * r * Math.sin(a), -r * Math.cos(a)];
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-1, 1].map((side) => {
        const [x0, y0] = pt(side, 172);
        const [x1, y1] = pt(side, 30);
        return (
          <g key={side}>
            <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 ${side > 0 ? 0 : 1} ${x1} ${y1}`} fill="none" stroke={color} strokeWidth={5} />
            {[160, 135, 110, 85, 60, 38].map((deg, i) => {
              const [lx, ly] = pt(side, deg);
              const rot = side > 0 ? 90 - deg + 35 : deg - 90 - 35;
              return <ellipse key={i} cx={lx} cy={ly} rx={20 - i} ry={8} fill={color} stroke={OL} strokeWidth={2.5} transform={`rotate(${rot} ${lx} ${ly})`} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

// крупная надпись с пружинкой
export const Big: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; k?: number; serif?: boolean }> = ({ x, y, text, size = 64, color = C.ink, k = 1, serif }) => (
  <text x={x} y={y} fontFamily={serif ? "'PT Serif', Georgia, serif" : "Rubik, Nunito"} fontWeight={serif ? 700 : 900} fontSize={size} textAnchor="middle" fill={color} opacity={Math.max(0, Math.min(1, k))}>
    {text}
  </text>
);

// карточка-цитата перевода (короткая, с пометкой книги)
export const QuoteCard: React.FC<{ x: number; y: number; w: number; text: string; refText?: string; k: number; size?: number; color?: string }> = ({ x, y, w, text, refText, k, size = 44, color = R.parchment }) => {
  if (k <= 0) return null;
  const rows = text.split("\n");
  const h = rows.length * size * 1.28 + (refText ? 90 : 60);
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40})`} opacity={Math.min(1, k * 1.4)}>
      <rect x={-w / 2 + 8} y={12} width={w} height={h} rx={26} fill="#24324a" opacity={0.12} />
      <rect x={-w / 2} y={0} width={w} height={h} rx={26} fill={color} stroke={OL} strokeWidth={5} />
      <text x={-w / 2 + 26} y={58} fontFamily="'PT Serif', Georgia, serif" fontSize={80} fill={R.terracotta} opacity={0.5}>
        «
      </text>
      {rows.map((r, i) => (
        <text key={i} x={0} y={size * 1.1 + 18 + i * size * 1.28} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={size} textAnchor="middle" fill={C.ink}>
          {r}
        </text>
      ))}
      {refText && (
        <text x={w / 2 - 30} y={h - 26} fontFamily={FONT} fontWeight={800} fontSize={26} textAnchor="end" fill={C.inkSoft}>
          {refText}
        </text>
      )}
    </g>
  );
};
