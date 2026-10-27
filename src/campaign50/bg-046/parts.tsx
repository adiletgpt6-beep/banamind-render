// Детали BG-046: рука в рукаве (входит в кадр и держит предмет), дочь со
// спины с рюкзаком-героем на плечах, записка из кармана, значки
// «үй / мектеп / убакыт». Все координаты — px мира сцены.
import type { ReactNode } from "react";
import { fontFamily } from "../../fonts";
import { C } from "./palette";
import { clamp, deg } from "./rig/motion";
import { LOOKS } from "./rig/looks";

type Pt = { readonly x: number; readonly y: number };

// Рука от плеча (за кадром) до кисти: рукав, манжета, кисть-«варежка»
// с большим пальцем. grip — пальцы сжаты (держит лямку / ручку).
export const ReachArm: React.FC<{
  readonly from: Pt;
  readonly to: Pt;
  readonly sleeve: string;
  readonly skin: string;
  readonly w?: number;
  readonly grip?: boolean;
  readonly bend?: number; // изгиб локтя (px, + наружу)
  readonly thumb?: 1 | -1;
}> = ({ from, to, sleeve, skin, w = 64, grip = true, bend = 40, thumb = 1 }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mid = { x: (from.x + to.x) / 2 + nx * bend, y: (from.y + to.y) / 2 + ny * bend };
  // запястье чуть не доходит до кисти
  const k = Math.max(0, 1 - (w * 0.9) / len);
  const wr = { x: from.x + dx * k, y: from.y + dy * k };
  const ang = deg(Math.atan2(to.y - wr.y, to.x - wr.x)) - 90;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${wr.x} ${wr.y}`} stroke={sleeve} strokeWidth={w} strokeLinecap="round" fill="none" />
      <path d={`M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${wr.x} ${wr.y}`} stroke="rgba(0,0,0,0.08)" strokeWidth={w * 0.3} strokeLinecap="round" fill="none" transform={`translate(${w * 0.18} 0)`} />
      <g transform={`translate(${wr.x} ${wr.y}) rotate(${ang})`}>
        <rect x={-w * 0.52} y={-w * 0.2} width={w * 1.04} height={w * 0.34} rx={w * 0.15} fill={sleeve} stroke="rgba(0,0,0,0.12)" strokeWidth={3} />
        <rect x={-w * 0.3} y={w * 0.08} width={w * 0.6} height={w * 0.28} rx={w * 0.12} fill={skin} />
        {grip ? (
          <>
            <ellipse cx={0} cy={w * 0.62} rx={w * 0.44} ry={w * 0.42} fill={skin} />
            {[-0.24, 0, 0.24].map((u) => (
              <path key={u} d={`M ${u * w - w * 0.1} ${w * 0.86} Q ${u * w} ${w * 0.98} ${u * w + w * 0.1} ${w * 0.86}`} stroke="rgba(120,70,40,0.35)" strokeWidth={3} fill="none" />
            ))}
            <ellipse cx={thumb * w * 0.38} cy={w * 0.5} rx={w * 0.14} ry={w * 0.24} fill={skin} transform={`rotate(${thumb * -30} ${thumb * w * 0.38} ${w * 0.5})`} stroke="rgba(120,70,40,0.25)" strokeWidth={2} />
          </>
        ) : (
          <>
            <rect x={-w * 0.4} y={w * 0.2} width={w * 0.8} height={w * 0.85} rx={w * 0.32} fill={skin} />
            <ellipse cx={thumb * w * 0.46} cy={w * 0.48} rx={w * 0.14} ry={w * 0.28} fill={skin} transform={`rotate(${thumb * -35} ${thumb * w * 0.46} ${w * 0.48})`} />
          </>
        )}
      </g>
    </svg>
  );
};

// Дочь со спины (ступни в x, y; рост h). Рюкзак-герой (children) рисуется
// поверх жакета, лямки идут через плечи. hold — левая рука поднята к
// руке мамы (точка в мировых px).
export const GirlBack: React.FC<{ readonly x: number; readonly y: number; readonly h: number; readonly f: number; readonly hold?: Pt; readonly braidSway?: number; readonly children?: ReactNode; readonly packTop?: number }> = ({ x, y, h, f, hold, braidSway = 0, children, packTop }) => {
  const L = LOOKS.girl;
  const k = h / 1000;
  const sway = braidSway + Math.sin(f / 19) * 2;
  const breath = Math.sin(f / 26) * 3;
  const shoulderY = -716 + breath;
  const handL = hold ? { x: (hold.x - x) / k, y: (hold.y - y) / k } : { x: -120, y: -470 };
  return (
    <>
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g transform={`translate(${x} ${y}) scale(${k})`}>
          <ellipse cx={0} cy={6} rx={120} ry={20} fill="rgba(25,30,60,0.16)" />
          {/* ноги и туфли */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <rect x={s * 34 - 24} y={-460} width={48} height={440} rx={22} fill={L.legColor} />
              <ellipse cx={s * 36} cy={-14} rx={36} ry={22} fill={L.shoes} />
            </g>
          ))}
          {/* юбка */}
          <path d="M -86 -540 L 86 -540 L 118 -400 Q 0 -380 -118 -400 Z" fill={L.bottom} />
          <path d="M -60 -536 L -74 -398 M 0 -538 L 0 -388 M 60 -536 L 74 -398" stroke={L.topShade} strokeWidth={6} />
          {/* правая рука висит, левая тянется к маме */}
          <path d={`M 84 ${shoulderY + 30} Q 104 -600 96 -470`} stroke={L.topColor} strokeWidth={40} strokeLinecap="round" fill="none" />
          <circle cx={96} cy={-450} r={22} fill={L.skin} />
          <path d={`M -84 ${shoulderY + 30} Q ${(-84 + handL.x) / 2 - 30} ${(shoulderY + handL.y) / 2} ${handL.x + 10} ${handL.y + 18}`} stroke={L.topColor} strokeWidth={40} strokeLinecap="round" fill="none" />
          <circle cx={handL.x} cy={handL.y} r={22} fill={L.skin} />
          {/* жакет со спины */}
          <path d={`M -92 ${shoulderY + 20} Q -96 ${shoulderY - 6} -60 ${shoulderY - 10} L 60 ${shoulderY - 10} Q 96 ${shoulderY - 6} 92 ${shoulderY + 20} L 96 -520 Q 0 -500 -96 -520 Z`} fill={L.topColor} />
          <path d={`M 0 ${shoulderY} L 0 -510`} stroke={L.topShade} strokeWidth={5} />
          {/* шея, голова со спины, косы с бантами */}
          <rect x={-22} y={-780} width={44} height={70} rx={14} fill={L.skinShade} />
          {[-1, 1].map((s) => (
            <g key={s} transform={`rotate(${s * 6 + sway} ${s * 52} -800)`}>
              {[0, 1, 2, 3].map((i) => (
                <ellipse key={i} cx={s * 56} cy={-786 + i * 24} rx={17 - i} ry={16} fill={L.hair} />
              ))}
              <path d={`M ${s * 56 - 9} -700 L ${s * 56} -676 L ${s * 56 + 9} -700 Z`} fill={L.hair} />
              <circle cx={s * 56} cy={-806} r={15} fill="#FFFFFF" />
              <path d={`M ${s * 56} -806 l -22 -12 l 0 24 Z M ${s * 56} -806 l 22 -12 l 0 24 Z`} fill="#FFFFFF" stroke="#E7E3EA" strokeWidth={2} />
            </g>
          ))}
          {[-1, 1].map((s) => (
            <ellipse key={s} cx={s * 70} cy={-826} rx={13} ry={18} fill={L.skin} />
          ))}
          <ellipse cx={0} cy={-848} rx={72} ry={80} fill={L.hair} />
          <path d="M 0 -926 L 0 -790" stroke="rgba(255,255,255,0.12)" strokeWidth={6} />
        </g>
      </svg>
      {children}
      {/* лямки поверх плеч (над рюкзаком сверху) */}
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g transform={`translate(${x} ${y}) scale(${k})`}>
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={`M ${s * 44} ${(packTop ?? -640) + 10} Q ${s * 56} ${shoulderY - 34} ${s * 74} ${shoulderY - 4}`}
              stroke={C.bagTrim}
              strokeWidth={28}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </g>
      </svg>
    </>
  );
};

// Значки: дом, школа, часы.
export const Icon: React.FC<{ readonly kind: "home" | "school" | "clock" | "group" | "car"; readonly s?: number; readonly color?: string }> = ({ kind, s = 1, color = C.navy }) => (
  <svg width={60 * s} height={60 * s} viewBox="-30 -30 60 60" style={{ display: "block", overflow: "visible" }}>
    {kind === "home" ? (
      <>
        <path d="M -22 -2 L 0 -22 L 22 -2" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -16 -6 L -16 20 L 16 20 L 16 -6" stroke={color} strokeWidth={6} fill="none" strokeLinejoin="round" />
        <rect x={-5} y={6} width={10} height={14} fill={color} />
      </>
    ) : kind === "school" ? (
      <>
        <path d="M -24 -6 L 0 -22 L 24 -6 Z" fill={color} />
        <rect x={-20} y={-6} width={40} height={26} fill="none" stroke={color} strokeWidth={5} />
        <rect x={-5} y={6} width={10} height={14} fill={color} />
        <path d="M 0 -22 L 0 -30 L 10 -27 L 0 -24" fill={C.yellow} stroke={color} strokeWidth={2} />
      </>
    ) : kind === "clock" ? (
      <>
        <circle r={22} fill="none" stroke={color} strokeWidth={6} />
        <path d="M 0 -12 L 0 0 L 9 6" stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
      </>
    ) : kind === "group" ? (
      <>
        {[-16, 0, 16].map((dx, i) => (
          <g key={i} transform={`translate(${dx} ${i === 1 ? -4 : 2})`}>
            <circle cy={-10} r={7} fill={color} />
            <path d="M -10 14 Q -10 -1 0 -1 Q 10 -1 10 14 Z" fill={color} />
          </g>
        ))}
      </>
    ) : (
      <>
        <path d="M -26 8 L -24 -4 Q -22 -10 -14 -11 L -8 -20 L 10 -20 L 18 -11 Q 26 -10 26 -2 L 26 8 Z" fill={color} />
        <circle cx={-14} cy={10} r={7} fill="#FFFFFF" stroke={color} strokeWidth={4} />
        <circle cx={14} cy={10} r={7} fill="#FFFFFF" stroke={color} strokeWidth={4} />
      </>
    )}
  </svg>
);

// Записка «Үй • Мектеп • Убакыт» (бумажный листок в клетку).
// open 0…1 — сложенная → раскрытая.
export const NotePaper: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly s: number; readonly open: number; readonly words: readonly string[]; readonly checks?: readonly number[] }> = ({ x, y, rot, s, open, words, checks }) => {
  const o = clamp(open);
  const kinds = ["home", "school", "clock"] as const;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 440, height: 520, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, transformOrigin: "50% 50%" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          backgroundColor: "#FFFFFF",
          backgroundImage: "linear-gradient(rgba(70,110,180,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(70,110,180,0.12) 2px, transparent 2px)",
          backgroundSize: "36px 36px",
          boxShadow: "0 18px 40px rgba(20,40,90,0.25)",
          transform: `scaleY(${0.25 + 0.75 * o})`,
          transformOrigin: "50% 0%",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 18, backgroundColor: C.yellow }} />
        {/* сгибы сложенного листка */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "33%", height: 4, backgroundColor: "rgba(20,40,90,0.12)", opacity: 1 - o }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "66%", height: 4, backgroundColor: "rgba(20,40,90,0.12)", opacity: 1 - o }} />
        <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)", fontFamily, fontSize: 120, fontWeight: 900, color: C.yellow, opacity: clamp(1 - o * 2.5) }}>?</div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 60, display: "flex", flexDirection: "column", gap: 26, opacity: clamp((o - 0.5) * 3) }}>
          {words.map((wd, i) => (
            <div key={wd} style={{ display: "flex", alignItems: "center", gap: 22, fontFamily, fontSize: 60, fontWeight: 900, color: C.navy }}>
              <div style={{ width: 96, height: 96, borderRadius: 26, backgroundColor: C.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon kind={kinds[i % 3]} s={1.2} />
              </div>
              <span>{wd}</span>
              {checks && checks[i] > 0 ? <span style={{ marginLeft: "auto", color: C.green, fontSize: 64, transform: `scale(${checks[i]})` }}>✓</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
