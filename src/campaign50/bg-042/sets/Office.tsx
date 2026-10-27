// Светлый офис мамы (мир 1080×1920): окно с видом на Ала-Тоо и Бишкек,
// настенные часы, стеклянная переговорная с идущим «Жыйын», стол из светлого
// дерева. На столе — монитор (экран сцены через prop) и кружка-подставка для
// ручек с «телеэкраном» на боку. В кружке только ручки и карандаши — никаких
// напитков и еды.
// Порядок слоёв в сцене: OfficeBack → Chair → мама (layer="body") →
// DeskTop (столешница с предметами) → мама (layer="arms") → Monitor, MugTv →
// DeskFront.
import React from "react";
import { fontFamily } from "../../../fonts";
import { BG42_TEXT } from "../script";
import { C } from "../theme";

export const OFFICE = {
  window: { x: 90, y: 300, w: 400, h: 440 },
  clock: { x: 560, y: 330, r: 56 },
  meeting: { x: 640, y: 286, w: 500, h: 420 },
  desk: { back: 1150, front: 1252 },
  mom: { x: 400, y: 1483, h: 900 },
  monitor: { x: 610, y: 700, w: 420, h: 285, bezel: 14 },
  mug: { cx: 165, base: 1194, w: 122, h: 150 },
  keyboard: { x: 292, y: 1176, w: 268, h: 34 },
} as const;

/** Экран кружки (мировые координаты). */
export const MUG_SCREEN = (() => {
  const m = OFFICE.mug;
  const w = 96;
  const h = 70;
  return { x: m.cx - w / 2 - 4, y: m.base - m.h + 24, w, h, r: 12 };
})();

/** Экран монитора (мировые координаты). */
export const MONITOR_SCREEN = { x: OFFICE.monitor.x, y: OFFICE.monitor.y, w: OFFICE.monitor.w, h: OFFICE.monitor.h, r: 10 };

const fmt2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** Настенные часы (минуты от полуночи, плавно). */
export const WallClock: React.FC<{ readonly minutes: number; readonly x: number; readonly y: number; readonly r: number }> = ({ minutes, x, y, r }) => {
  const m = ((minutes % 60) / 60) * 360;
  const h = (((minutes / 60) % 12) / 12) * 360;
  const hand = (ang: number, len: number, w: number, color: string) => (
    <line x1={x} y1={y} x2={x + len * Math.sin((ang * Math.PI) / 180)} y2={y - len * Math.cos((ang * Math.PI) / 180)} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <circle cx={x + 4} cy={y + 8} r={r + 6} fill={C.shadow} />
      <circle cx={x} cy={y} r={r + 6} fill={C.navy} />
      <circle cx={x} cy={y} r={r} fill="#FFFFFF" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const l = i % 3 === 0 ? 12 : 6;
        return (
          <line
            key={i}
            x1={x + (r - 6) * Math.sin(a)}
            y1={y - (r - 6) * Math.cos(a)}
            x2={x + (r - 6 - l) * Math.sin(a)}
            y2={y - (r - 6 - l) * Math.cos(a)}
            stroke={C.navy}
            strokeWidth={i % 3 === 0 ? 4 : 2.5}
            strokeLinecap="round"
          />
        );
      })}
      {hand(h, r * 0.5, 7, C.navy)}
      {hand(m, r * 0.78, 4.5, C.navy)}
      <circle cx={x} cy={y} r={6} fill={C.yellow} stroke={C.navy} strokeWidth={2} />
    </svg>
  );
};

export const timeLabel = (minutes: number) => `${fmt2(Math.floor(minutes / 60) % 24)}:${fmt2(Math.floor(minutes % 60))}`;

/** Вид из окна: Ала-Тоо со снежными вершинами, зелёный низкий город. */
const WindowView: React.FC<{ readonly w: number; readonly h: number; readonly f: number }> = ({ w, h, f }) => {
  const cloud = (f * 0.25) % (w + 200);
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bg42sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFDDF8" />
          <stop offset="1" stopColor="#EAF5FF" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#bg42sky)" />
      <g opacity={0.85}>
        <ellipse cx={cloud - 100} cy={60} rx={70} ry={18} fill="#FFFFFF" />
        <ellipse cx={cloud - 60} cy={52} rx={44} ry={16} fill="#FFFFFF" />
      </g>
      {/* дальний хребет Ала-Тоо */}
      <path d={`M 0 ${h * 0.5} L 40 ${h * 0.36} L 95 ${h * 0.44} L 150 ${h * 0.27} L 205 ${h * 0.4} L 262 ${h * 0.24} L 330 ${h * 0.39} L 372 ${h * 0.31} L ${w} ${h * 0.42} L ${w} ${h * 0.62} L 0 ${h * 0.62} Z`} fill="#A9BFDB" />
      {/* снег на вершинах */}
      <path d={`M 128 ${h * 0.32} L 150 ${h * 0.27} L 174 ${h * 0.33} L 160 ${h * 0.31} L 150 ${h * 0.34} L 140 ${h * 0.31} Z`} fill="#FFFFFF" />
      <path d={`M 238 ${h * 0.3} L 262 ${h * 0.24} L 290 ${h * 0.31} L 274 ${h * 0.29} L 262 ${h * 0.32} L 250 ${h * 0.29} Z`} fill="#FFFFFF" />
      <path d={`M 22 ${h * 0.4} L 40 ${h * 0.36} L 58 ${h * 0.41} L 46 ${h * 0.4} L 38 ${h * 0.42} Z`} fill="#FFFFFF" />
      <path d={`M 356 ${h * 0.34} L 372 ${h * 0.31} L 390 ${h * 0.35} L 378 ${h * 0.345} L 370 ${h * 0.36} Z`} fill="#FFFFFF" />
      {/* ближние предгорья */}
      <path d={`M 0 ${h * 0.6} Q 120 ${h * 0.5} 220 ${h * 0.58} T ${w} ${h * 0.55} L ${w} ${h * 0.7} L 0 ${h * 0.7} Z`} fill="#C3D6C4" />
      {/* город: низкие дома, несколько многоэтажек, много зелени */}
      {[
        [10, 0.66, 60, 0.12],
        [80, 0.6, 40, 0.18],
        [128, 0.64, 70, 0.14],
        [210, 0.56, 36, 0.22],
        [254, 0.63, 66, 0.15],
        [330, 0.59, 44, 0.19],
      ].map(([x, top, bw, hh], i) => (
        <g key={i}>
          <rect x={x} y={h * top} width={bw} height={h * (1 - top)} fill={i % 2 ? "#E9EEF6" : "#F4F1EA"} stroke="#C8D3E3" strokeWidth={2} />
          {Array.from({ length: Math.floor((h * hh) / 22) }, (_, r) =>
            Array.from({ length: Math.max(1, Math.floor(bw / 18)) }, (__, c) => (
              <rect key={`${r}-${c}`} x={x + 6 + c * 18} y={h * top + 8 + r * 22} width={9} height={12} fill="#B9CDE6" />
            )),
          )}
        </g>
      ))}
      {[30, 100, 175, 240, 300, 360].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={h * 0.84 + (i % 2) * 8} rx={34} ry={26} fill={i % 2 ? "#8CC79A" : "#79B98B"} />
          <ellipse cx={x + 22} cy={h * 0.88} rx={26} ry={20} fill="#9ED3AA" />
        </g>
      ))}
      <rect y={h * 0.92} width={w} height={h * 0.08} fill="#DDE6EF" />
    </svg>
  );
};

/** Стеклянная переговорная: силуэты коллег за столом, презентация. */
const MeetingRoom: React.FC<{ readonly f: number }> = ({ f }) => {
  const M = OFFICE.meeting;
  const g = (k: number) => Math.sin((f + k * 23) / 18);
  return (
    <div style={{ position: "absolute", left: M.x, top: M.y, width: M.w, height: M.h }}>
      <svg width={M.w} height={M.h} style={{ position: "absolute", inset: 0 }}>
        <rect width={M.w} height={M.h} fill="#DCE8F5" />
        {/* экран презентации */}
        <rect x={200} y={34} width={190} height={110} rx={8} fill="#FFFFFF" stroke="#B7C7DD" strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={222 + i * 40} y={128 - [34, 62, 48, 80][i]} width={24} height={[34, 62, 48, 80][i]} fill={i === 3 ? C.yellow : "#9DB4D6"} />
        ))}
        {/* коллеги за столом (мягкие силуэты) */}
        {[
          [70, 0],
          [178, 1],
          [286, 2],
        ].map(([x, k]) => (
          <g key={k} transform={`translate(${x} ${262 + g(k) * 2})`}>
            <circle cx={0} cy={-36} r={24} fill="#9AAECB" />
            <path d="M -40 44 C -40 0 -22 -10 0 -10 C 22 -10 40 0 40 44 Z" fill="#A7B9D3" />
            {k === 1 ? <path d={`M 28 6 L ${50 + g(k) * 8} ${-10 - Math.abs(g(k + 2)) * 16}`} stroke="#A7B9D3" strokeWidth={13} strokeLinecap="round" /> : null}
          </g>
        ))}
        <rect x={20} y={300} width={360} height={34} rx={14} fill="#B8C9DF" />
        {/* докладчик у экрана */}
        <g transform={`translate(${430 + g(4) * 4} 228)`}>
          <circle cx={0} cy={-56} r={23} fill="#9AAECB" />
          <path d="M -32 92 C -32 10 -18 -30 0 -30 C 18 -30 32 10 32 92 Z" fill="#A7B9D3" />
          <path d={`M -22 -8 L ${-56 - g(5) * 6} ${-62 + g(5) * 10}`} stroke="#A7B9D3" strokeWidth={12} strokeLinecap="round" />
        </g>
      </svg>
      {/* матовое стекло */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.5), rgba(240,247,255,0.3) 40%, rgba(255,255,255,0.55))" }} />
      <div style={{ position: "absolute", left: 0, top: 182, width: M.w, height: 22, background: "rgba(255,255,255,0.7)" }} />
      {/* рама */}
      <div style={{ position: "absolute", inset: 0, border: "10px solid #C4D2E4", borderRight: "none" }} />
      <div style={{ position: "absolute", left: 250, top: 0, width: 8, height: M.h, background: "#C4D2E4" }} />
      {/* табличка «Жыйын» */}
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 196,
          padding: "6px 16px",
          borderRadius: 10,
          background: C.navy,
          color: C.yellow,
          fontFamily,
          fontWeight: 900,
          fontSize: 26,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 6, background: C.yellow, display: "inline-block" }} />
        {BG42_TEXT.meeting}
      </div>
    </div>
  );
};

/** Задний план офиса. */
export const OfficeBack: React.FC<{ readonly f: number; readonly minutes: number }> = ({ f, minutes }) => {
  const Wn = OFFICE.window;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #F7FAFE 0%, ${C.wall} 55%, ${C.wallShade} 100%)` }} />
      {/* светлая полоса стены и плинтус полки */}
      <div style={{ position: "absolute", left: 0, top: 820, width: 1080, height: 18, background: "#E3EAF4" }} />
      {/* окно */}
      <div style={{ position: "absolute", left: Wn.x - 16, top: Wn.y - 16, width: Wn.w + 32, height: Wn.h + 32, borderRadius: 18, background: "#FFFFFF", boxShadow: `0 16px 40px ${C.shadow}` }} />
      <div style={{ position: "absolute", left: Wn.x, top: Wn.y, width: Wn.w, height: Wn.h, borderRadius: 8, overflow: "hidden" }}>
        <WindowView w={Wn.w} h={Wn.h} f={f} />
        <div style={{ position: "absolute", left: Wn.w / 2 - 5, top: 0, width: 10, height: Wn.h, background: "#FFFFFF" }} />
        <div style={{ position: "absolute", left: 0, top: Wn.h * 0.42, width: Wn.w, height: 10, background: "#FFFFFF" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.35), transparent 45%)" }} />
      </div>
      {/* растение на подоконнике */}
      <svg width={160} height={160} style={{ position: "absolute", left: Wn.x + Wn.w - 140, top: Wn.y + Wn.h - 120, overflow: "visible" }}>
        {[-40, -18, 0, 20, 42].map((a, i) => (
          <ellipse key={i} cx={80 + a * 0.8} cy={60 - Math.abs(a) * 0.3} rx={14} ry={42} transform={`rotate(${a} ${80 + a * 0.8} 100)`} fill={i % 2 ? "#5FAF7A" : "#4E9C69"} />
        ))}
        <path d="M 52 96 L 108 96 L 100 146 L 60 146 Z" fill={C.yellow} stroke={C.navy} strokeWidth={3} />
      </svg>
      <MeetingRoom f={f} />
      <WallClock minutes={minutes} x={OFFICE.clock.x} y={OFFICE.clock.y} r={OFFICE.clock.r} />
    </>
  );
};

/** Спинка офисного кресла за мамой. */
export const Chair: React.FC<{ readonly x: number }> = ({ x }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
    <rect x={x - 128} y={858} width={256} height={330} rx={70} fill="#2E4170" />
    <rect x={x - 108} y={878} width={216} height={290} rx={58} fill="#3A4F80" />
  </svg>
);

/** Столешница с предметами (клавиатура, телефон, блокнот, мышь). */
export const DeskTop: React.FC<{ readonly phoneGlow?: number }> = ({ phoneGlow = 0 }) => {
  const D = OFFICE.desk;
  const K = OFFICE.keyboard;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <defs>
        <linearGradient id="bg42deskTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9CDA6" />
          <stop offset="1" stopColor={C.woodTop} />
        </linearGradient>
      </defs>
      <path d={`M -20 ${D.back} L 1100 ${D.back} L 1100 ${D.front} L -20 ${D.front} Z`} fill="url(#bg42deskTop)" />
      <line x1={-20} y1={D.back} x2={1100} y2={D.back} stroke={C.woodEdge} strokeWidth={3} opacity={0.6} />
      {/* блокнот */}
      <g transform="rotate(-5 140 1225)">
        <rect x={70} y={1206} width={130} height={40} rx={6} fill="#FFFFFF" stroke="#C9D3E3" strokeWidth={2} />
        <line x1={84} y1={1218} x2={180} y2={1218} stroke="#B9C6DA" strokeWidth={3} />
        <line x1={84} y1={1230} x2={160} y2={1230} stroke="#B9C6DA" strokeWidth={3} />
      </g>
      {/* клавиатура */}
      <rect x={K.x} y={K.y} width={K.w} height={K.h} rx={8} fill="#F4F6FA" stroke="#B8C3D6" strokeWidth={2.5} />
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 13 }, (__, c) => <rect key={`${r}-${c}`} x={K.x + 8 + c * 19.6} y={K.y + 5 + r * 9.5} width={15} height={6.5} rx={1.5} fill="#D5DCE8" />),
      )}
      {/* мышь */}
      <ellipse cx={600} cy={1212} rx={16} ry={11} fill="#F4F6FA" stroke="#B8C3D6" strokeWidth={2.5} />
      {/* телефон экраном вверх */}
      <g transform="rotate(8 700 1228)">
        <rect x={666} y={1212} width={74} height={34} rx={8} fill={C.navy} />
        <rect x={670} y={1216} width={66} height={26} rx={5} fill={phoneGlow > 0 ? `rgba(255, 233, 160, ${0.4 + 0.6 * phoneGlow})` : "#26386A"} />
      </g>
    </svg>
  );
};

/** Передняя панель стола (ниже — только дерево, удобный фон для титров). */
export const DeskFront: React.FC = () => {
  const D = OFFICE.desk;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <rect x={-20} y={D.front} width={1120} height={1920 - D.front} fill={C.woodFront} />
      <rect x={-20} y={D.front} width={1120} height={16} fill={C.woodEdge} />
      <rect x={-20} y={D.front + 16} width={1120} height={40} fill="rgba(255,255,255,0.12)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M -20 ${D.front + 120 + i * 110} Q 540 ${D.front + 100 + i * 110 + (i % 2 ? 18 : -14)} 1100 ${D.front + 128 + i * 110}`} stroke="rgba(160,120,80,0.16)" strokeWidth={4} fill="none" />
      ))}
      {/* тумба с ящиками справа (мягкий контраст — фон для титров) */}
      <rect x={720} y={D.front + 40} width={300} height={560} rx={14} fill="rgba(255,255,255,0.10)" stroke="rgba(150,110,70,0.25)" strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <g key={`dr${i}`}>
          <rect x={736} y={D.front + 56 + i * 180} width={268} height={164} rx={10} fill="rgba(255,255,255,0.08)" stroke="rgba(150,110,70,0.22)" strokeWidth={3} />
          <rect x={830} y={D.front + 74 + i * 180} width={80} height={12} rx={6} fill={C.yellow} opacity={0.75} />
        </g>
      ))}
      <rect x={60} y={D.front + 40} width={8} height={560} rx={4} fill="rgba(150,110,70,0.18)" />
    </svg>
  );
};

/** Монитор на подставке; screen — содержимое экрана (локальные px w×h). */
export const Monitor: React.FC<{ readonly screen: React.ReactNode; readonly glow?: number }> = ({ screen, glow = 1 }) => {
  const M = OFFICE.monitor;
  const b = M.bezel;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {/* подставка */}
        <path d={`M ${M.x + M.w / 2 - 22} ${M.y + M.h + b} L ${M.x + M.w / 2 + 22} ${M.y + M.h + b} L ${M.x + M.w / 2 + 30} ${OFFICE.desk.back + 18} L ${M.x + M.w / 2 - 30} ${OFFICE.desk.back + 18} Z`} fill="#9AA8C0" />
        <ellipse cx={M.x + M.w / 2} cy={OFFICE.desk.back + 26} rx={92} ry={16} fill="#8795AE" />
        <ellipse cx={M.x + M.w / 2} cy={OFFICE.desk.back + 22} rx={86} ry={12} fill="#AAB6CB" />
        {/* корпус */}
        <rect x={M.x - b + 6} y={M.y - b + 12} width={M.w + 2 * b} height={M.h + 2 * b + 18} rx={20} fill={C.shadow} />
        <rect x={M.x - b} y={M.y - b} width={M.w + 2 * b} height={M.h + 2 * b + 16} rx={18} fill="#1C2A50" />
        <circle cx={M.x + M.w / 2} cy={M.y + M.h + b + 6} r={3.5} fill={C.yellow} opacity={0.9} />
      </svg>
      <div style={{ position: "absolute", left: M.x, top: M.y, width: M.w, height: M.h, borderRadius: 10, overflow: "hidden", background: C.screen }}>
        {screen}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, rgba(255,255,255,0.12), transparent 40%)", opacity: glow, pointerEvents: "none" }} />
      </div>
    </>
  );
};

/**
 * Кружка-подставка с ручками и «телеэкраном» на боку. power: 0 — экран
 * выключен (тёмное стекло), 1 — включён; screen — содержимое (MUG_SCREEN.w×h).
 */
export const MugTv: React.FC<{ readonly screen?: React.ReactNode; readonly power?: number; readonly tap?: number }> = ({ screen, power = 1, tap = 0 }) => {
  const m = OFFICE.mug;
  const S = MUG_SCREEN;
  const top = m.base - m.h;
  const x0 = m.cx - m.w / 2;
  // лёгкий «пружинящий» отклик кружки на касание (tap 0…1…0)
  const squash = 1 - 0.03 * tap;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${m.cx}px ${m.base}px`, transform: `scale(${1 + 0.02 * tap}, ${squash})` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {/* тень */}
        <ellipse cx={m.cx + 6} cy={m.base + 2} rx={m.w * 0.62} ry={10} fill={C.shadow} />
        {/* ручки и карандаши */}
        <g>
          <rect x={m.cx - 34} y={top - 70} width={12} height={110} rx={5} fill={C.yellow} stroke={C.navy} strokeWidth={2.5} transform={`rotate(-14 ${m.cx - 28} ${top + 30})`} />
          <path d={`M ${m.cx - 34} ${top - 70} l 6 -16 l 6 16 Z`} fill="#F1D7A8" stroke={C.navy} strokeWidth={2} transform={`rotate(-14 ${m.cx - 28} ${top + 30})`} />
          <rect x={m.cx - 6} y={top - 84} width={10} height={120} rx={5} fill={C.navy} transform={`rotate(4 ${m.cx} ${top + 30})`} />
          <rect x={m.cx + 18} y={top - 60} width={14} height={100} rx={6} fill={C.teal} stroke={C.navy} strokeWidth={2.5} transform={`rotate(16 ${m.cx + 24} ${top + 30})`} />
          <rect x={m.cx + 16} y={top - 66} width={18} height={18} rx={5} fill={C.navy} transform={`rotate(16 ${m.cx + 24} ${top + 30})`} />
        </g>
        {/* ручка кружки */}
        <path d={`M ${x0 + m.w - 6} ${top + 34} C ${x0 + m.w + 44} ${top + 34} ${x0 + m.w + 44} ${top + 112} ${x0 + m.w - 6} ${top + 112}`} stroke="#E3E9F3" strokeWidth={16} fill="none" />
        <path d={`M ${x0 + m.w - 6} ${top + 34} C ${x0 + m.w + 44} ${top + 34} ${x0 + m.w + 44} ${top + 112} ${x0 + m.w - 6} ${top + 112}`} stroke="#C8D3E3" strokeWidth={4} fill="none" />
        {/* корпус */}
        <path d={`M ${x0} ${top} L ${x0 + m.w} ${top} L ${x0 + m.w - 6} ${m.base - 6} Q ${m.cx} ${m.base + 6} ${x0 + 6} ${m.base - 6} Z`} fill="#FFFFFF" stroke="#C8D3E3" strokeWidth={3} />
        <rect x={x0 + m.w - 30} y={top + 8} width={14} height={m.h - 26} rx={7} fill="#EEF2F8" />
        <ellipse cx={m.cx} cy={top} rx={m.w / 2} ry={11} fill="#F1F4F9" stroke="#C8D3E3" strokeWidth={3} />
        <ellipse cx={m.cx} cy={top + 1} rx={m.w / 2 - 9} ry={6.5} fill="#56637F" />
        {/* жёлтая полоска бренда кружки */}
        <rect x={x0 + 4} y={m.base - 28} width={m.w - 8} height={8} fill={C.yellow} opacity={0.9} />
        {/* рамка экрана */}
        <rect x={S.x - 5} y={S.y - 5} width={S.w + 10} height={S.h + 10} rx={S.r + 4} fill={C.navy} />
      </svg>
      <div style={{ position: "absolute", left: S.x, top: S.y, width: S.w, height: S.h, borderRadius: S.r, overflow: "hidden", background: "#0B1636" }}>
        <div style={{ position: "absolute", inset: 0, opacity: power }}>{screen}</div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.22), transparent 45%)" }} />
      </div>
    </div>
  );
};
