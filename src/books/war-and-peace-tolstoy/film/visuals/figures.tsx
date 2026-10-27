// Люди «Масштаба выбора» — собственные плоские силуэты BanaMind (не иллюстрации изданий,
// не образы актёров и не кадры экранизаций). Лица не прорисованы: героя узнают по силуэту,
// детали костюма и цвету акцента (лента, шарф, плюмаж). Точка опоры — между ступнями (0, 0),
// рост ≈ 300 при s = 1.
import React from "react";
import { C, FONT } from "../theme";

export type Who =
  | "pierre"
  | "andrei"
  | "natasha"
  | "marya"
  | "nikolai"
  | "sonya"
  | "karataev"
  | "napoleon"
  | "kutuzov"
  | "oldPrince"
  | "helene"
  | "anatole"
  | "dolokhov"
  | "petya"
  | "denisov"
  | "soldier"
  | "lady"
  | "man"
  | "peasant"
  | "child"
  | "countess"
  | "count";

// на тёмном слое «История» силуэты светлые, иначе их не видно
export const ToneContext = React.createContext(false);

export type Arm = "down" | "out" | "up" | "point" | "coat" | "hold" | "open" | "reach";

type Spec = {
  h: number; // рост
  w: number; // ширина плеч
  dress?: boolean;
  hat?: "bicorne" | "shako" | "cap" | "top" | "wig" | "kerchief" | "busby";
  accent: string;
  body: string; // цвет силуэта
  belly?: number; // полнота
  glasses?: boolean;
  epaulets?: boolean;
  sword?: boolean;
  plume?: string;
  beard?: boolean;
  bow?: boolean;
  braid?: boolean;
  shawl?: boolean;
};

const INK_DARK = "#1f2440";
const LIGHT_BODY = "#dfe4f7";
const S: Record<Who, Spec> = {
  pierre: { h: 312, w: 112, belly: 26, glasses: true, accent: "#3fae6a", body: "#2c3352" },
  andrei: { h: 300, w: 86, epaulets: true, sword: true, accent: "#e0a23a", body: "#22305a" },
  natasha: { h: 262, w: 70, dress: true, bow: true, accent: "#e86a9a", body: "#3a2c52" },
  marya: { h: 270, w: 74, dress: true, shawl: true, accent: "#8a6ce8", body: "#2e2a4a" },
  nikolai: { h: 296, w: 88, hat: "shako", plume: "#e5484d", epaulets: true, accent: "#e5484d", body: "#24345e" },
  sonya: { h: 262, w: 70, dress: true, braid: true, accent: "#4fd1c5", body: "#2e3a4e" },
  karataev: { h: 250, w: 96, belly: 14, beard: true, hat: "kerchief", accent: "#ff9f43", body: "#5a4636" },
  napoleon: { h: 250, w: 84, belly: 16, hat: "bicorne", accent: "#7c9cff", body: "#1f2440" },
  kutuzov: { h: 296, w: 124, belly: 34, hat: "cap", epaulets: true, accent: "#f2b630", body: "#2b2f45" },
  oldPrince: { h: 280, w: 80, hat: "wig", accent: "#c9d6e3", body: "#2a2a3a" },
  helene: { h: 280, w: 76, dress: true, accent: "#c98a12", body: "#3a2440" },
  anatole: { h: 316, w: 92, epaulets: true, accent: "#ff7a6b", body: "#2b2440" },
  dolokhov: { h: 300, w: 90, accent: "#9aa3b5", body: "#22263a" },
  petya: { h: 220, w: 64, hat: "shako", plume: "#ffd23f", accent: "#ffd23f", body: "#2c3a5e" },
  denisov: { h: 270, w: 90, hat: "busby", epaulets: true, accent: "#a3e635", body: "#2a2f50" },
  soldier: { h: 290, w: 86, hat: "shako", accent: "#9aa3b5", body: "#30364f" },
  lady: { h: 270, w: 72, dress: true, accent: "#f472b6", body: "#3a3050" },
  man: { h: 296, w: 88, accent: "#9aa3b5", body: "#2e3348" },
  peasant: { h: 276, w: 90, beard: true, accent: "#b9a47a", body: "#55463a" },
  child: { h: 170, w: 54, accent: "#ffd23f", body: "#3a4060" },
  countess: { h: 266, w: 80, dress: true, shawl: true, accent: "#c9a0dc", body: "#3a3048" },
  count: { h: 296, w: 108, belly: 24, accent: "#f2b630", body: "#323650" },
};

const armAngle: Record<Arm, number> = { down: 14, out: 82, up: 158, point: 95, coat: 0, hold: 52, open: 120, reach: 110 };

const Limb: React.FC<{ sx: number; sy: number; ang: number; len: number; side: 1 | -1; color: string; w: number }> = ({ sx, sy, ang, len, side, color, w }) => {
  const a = (ang * Math.PI) / 180;
  const hx = sx + side * Math.sin(a) * len;
  const hy = sy + Math.cos(a) * len;
  return (
    <g>
      <line x1={sx} y1={sy} x2={hx} y2={hy} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={w * 0.48} fill="#f3d9bf" />
    </g>
  );
};

export type PersonProps = {
  who: Who;
  x: number;
  y: number;
  s?: number;
  label?: string;
  labelColor?: string;
  arm?: Arm; // правая рука (со стороны зрителя — справа)
  arm2?: Arm; // левая
  flip?: boolean;
  t?: number;
  opacity?: number;
  lie?: boolean; // лежит (Аустерлиц)
  glow?: number; // мягкий ореол акцента 0…1 (не размытие — чёткое кольцо)
  dim?: boolean; // в тени, полупрозрачный
  light?: boolean; // светлый силуэт (тёмный фон)
};

export const Person: React.FC<PersonProps> = ({ who, x, y, s = 1, label, labelColor, arm = "down", arm2 = "down", flip, t = 0, opacity = 1, lie, glow = 0, dim, light }) => {
  const ctxLight = React.useContext(ToneContext);
  const isLight = light ?? ctxLight;
  const sp0 = S[who];
  const sp = isLight ? { ...sp0, body: LIGHT_BODY } : sp0;
  const INK = isLight ? "#5a648f" : INK_DARK;
  const { h, w } = sp;
  const breathe = Math.sin(t * 1.8 + x * 0.013) * 2.2;
  const headR = h * 0.085;
  const headY = -h + headR + breathe * 0.3;
  const shoulderY = -h + headR * 2.35;
  const hipY = sp.dress ? -h * 0.42 : -h * 0.44;
  const belly = sp.belly ?? 0;
  const body = sp.body;
  const legW = w * 0.2;
  const armLen = h * 0.3;
  const armW = w * 0.17;
  const torso = sp.dress
    ? `M ${-w * 0.3} ${shoulderY} L ${w * 0.3} ${shoulderY} L ${w * 0.2} ${hipY} L ${w * 0.62} -6 Q 0 8 ${-w * 0.62} -6 L ${-w * 0.2} ${hipY} Z`
    : `M ${-w * 0.42} ${shoulderY} Q 0 ${shoulderY - 10} ${w * 0.42} ${shoulderY} L ${w * 0.4 + belly * 0.5} ${hipY - h * 0.08} Q ${w * 0.36 + belly} ${hipY} ${w * 0.3} ${hipY + 8} L ${-w * 0.3} ${hipY + 8} Q ${-w * 0.36 - belly} ${hipY} ${-w * 0.4 - belly * 0.5} ${hipY - h * 0.08} Z`;
  const inner = (
    <g opacity={dim ? 0.45 : 1}>
      {glow > 0 && <circle cx={0} cy={-h * 0.5} r={h * 0.62} fill="none" stroke={sp.accent} strokeWidth={10} opacity={glow * 0.55} />}
      {/* ноги */}
      {!sp.dress && (
        <g>
          <rect x={-w * 0.27} y={hipY} width={legW} height={-hipY} rx={legW / 2} fill={body} />
          <rect x={w * 0.27 - legW} y={hipY} width={legW} height={-hipY} rx={legW / 2} fill={body} />
          {(sp.epaulets || who === "dolokhov") && (
            <g fill={INK}>
              <rect x={-w * 0.29} y={-h * 0.2} width={legW + 4} height={h * 0.2} rx={6} />
              <rect x={w * 0.25 - legW} y={-h * 0.2} width={legW + 4} height={h * 0.2} rx={6} />
            </g>
          )}
        </g>
      )}
      {/* рука сзади */}
      {arm2 !== "coat" && <Limb sx={-w * 0.38} sy={shoulderY + 10} ang={armAngle[arm2]} len={armLen} side={-1} color={body} w={armW} />}
      <path d={torso} fill={body} />
      {/* акцент: перевязь, пояс или лента */}
      {sp.dress ? (
        <path d={`M ${-w * 0.24} ${hipY + 4} Q 0 ${hipY + 16} ${w * 0.24} ${hipY + 4}`} stroke={sp.accent} strokeWidth={9} fill="none" strokeLinecap="round" />
      ) : sp.epaulets ? (
        <path d={`M ${-w * 0.36} ${shoulderY + 6} L ${w * 0.3} ${hipY - 6}`} stroke={sp.accent} strokeWidth={9} strokeLinecap="round" />
      ) : (
        <rect x={-w * 0.38 - belly * 0.4} y={hipY - 14} width={w * 0.76 + belly * 0.8} height={10} rx={5} fill={sp.accent} />
      )}
      {sp.shawl && <path d={`M ${-w * 0.34} ${shoulderY + 4} Q 0 ${shoulderY + 46} ${w * 0.34} ${shoulderY + 4} L ${w * 0.3} ${shoulderY + 22} Q 0 ${shoulderY + 70} ${-w * 0.3} ${shoulderY + 22} Z`} fill={sp.accent} opacity={0.85} />}
      {sp.epaulets && (
        <g fill={C.gold}>
          <rect x={-w * 0.5} y={shoulderY - 6} width={w * 0.2} height={10} rx={5} />
          <rect x={w * 0.3} y={shoulderY - 6} width={w * 0.2} height={10} rx={5} />
        </g>
      )}
      {sp.sword && <line x1={-w * 0.3} y1={hipY + 4} x2={-w * 0.62} y2={-h * 0.06} stroke="#9aa3b5" strokeWidth={7} strokeLinecap="round" />}
      {/* рука спереди */}
      {arm === "coat" ? <circle cx={w * 0.06} cy={shoulderY + h * 0.12} r={armW * 0.5} fill="#f3d9bf" /> : <Limb sx={w * 0.38} sy={shoulderY + 10} ang={armAngle[arm]} len={armLen} side={1} color={body} w={armW} />}
      {/* шея и голова */}
      <rect x={-headR * 0.35} y={headY + headR * 0.6} width={headR * 0.7} height={headR * 0.9} fill={body} />
      <circle cx={0} cy={headY} r={headR} fill={body} />
      {sp.braid && <path d={`M ${headR * 0.6} ${headY} q ${headR * 0.9} ${headR * 1.2} ${headR * 0.2} ${headR * 2.6}`} stroke={body} strokeWidth={headR * 0.45} fill="none" strokeLinecap="round" />}
      {sp.bow && <path d={`M ${-headR * 0.2} ${headY - headR * 0.9} l ${-headR * 0.7} ${-headR * 0.4} l 0 ${headR * 0.8} Z M ${-headR * 0.2} ${headY - headR * 0.9} l ${headR * 0.7} ${-headR * 0.4} l 0 ${headR * 0.8} Z`} fill={sp.accent} />}
      {sp.glasses && (
        <g stroke="#f3e6c8" strokeWidth={3} fill="none">
          <circle cx={headR * 0.3} cy={headY - headR * 0.05} r={headR * 0.26} />
          <circle cx={headR * 0.85} cy={headY - headR * 0.05} r={headR * 0.22} />
        </g>
      )}
      {sp.beard && <path d={`M ${-headR * 0.8} ${headY + headR * 0.2} Q 0 ${headY + headR * 2.1} ${headR * 0.8} ${headY + headR * 0.2} Z`} fill={body} />}
      {sp.hat === "bicorne" && <path d={`M ${-headR * 1.9} ${headY - headR * 0.3} Q 0 ${headY - headR * 2.6} ${headR * 1.9} ${headY - headR * 0.3} Q 0 ${headY - headR * 0.9} ${-headR * 1.9} ${headY - headR * 0.3} Z`} fill={INK} />}
      {(sp.hat === "shako" || sp.hat === "busby") && (
        <g>
          <rect x={-headR * 0.85} y={headY - headR * 2.3} width={headR * 1.7} height={headR * 1.6} rx={sp.hat === "busby" ? headR * 0.7 : 4} fill={INK} />
          <rect x={-headR * 1.05} y={headY - headR * 0.85} width={headR * 2.1} height={headR * 0.3} rx={3} fill={INK} />
          {sp.plume && <ellipse cx={0} cy={headY - headR * 2.7} rx={headR * 0.28} ry={headR * 0.6} fill={sp.plume} />}
        </g>
      )}
      {sp.hat === "cap" && (
        <g>
          <path d={`M ${-headR * 1.05} ${headY - headR * 0.35} Q 0 ${headY - headR * 1.9} ${headR * 1.05} ${headY - headR * 0.35} Z`} fill="#f4f1ea" />
          <rect x={-headR * 0.4} y={headY - headR * 0.45} width={headR * 1.7} height={headR * 0.26} rx={4} fill={INK} />
        </g>
      )}
      {sp.hat === "top" && <rect x={-headR * 0.8} y={headY - headR * 2.6} width={headR * 1.6} height={headR * 1.9} rx={4} fill={INK} />}
      {sp.hat === "wig" && <path d={`M ${-headR * 0.9} ${headY} q 0 ${headR * 1.8} ${-headR * 0.2} ${headR * 2.2}`} stroke="#e8e6df" strokeWidth={headR * 0.5} fill="none" strokeLinecap="round" />}
      {sp.hat === "kerchief" && <path d={`M ${-headR * 1.05} ${headY - headR * 0.1} Q 0 ${headY - headR * 1.6} ${headR * 1.05} ${headY - headR * 0.1} Z`} fill={sp.accent} />}
    </g>
  );
  const tr = lie ? `translate(${x} ${y}) scale(${s}) rotate(-90) translate(${h * 0.02} ${-w * 0.2})` : `translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`;
  return (
    <g opacity={opacity}>
      <ellipse cx={x} cy={y + 2} rx={(lie ? h * 0.55 : w * 0.7) * s} ry={10 * s} fill={isLight ? "#fff" : "#000"} opacity={isLight ? 0.12 : 0.1} />
      <g transform={tr}>{inner}</g>
      {label && <NameTag x={lie ? x - h * 0.5 * s : x} y={y + 44 * Math.max(0.7, s)} text={label} color={labelColor ?? sp.accent} s={Math.max(0.75, Math.min(1.1, s))} dark={isLight} />}
    </g>
  );
};

export const NameTag: React.FC<{ x: number; y: number; text: string; color?: string; s?: number; dark?: boolean }> = ({ x, y, text, color = C.gold, s = 1, dark }) => {
  const size = 28 * s;
  const w = text.length * size * 0.55 + size * 1.1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-size * 0.82} width={w} height={size * 1.42} rx={size * 0.7} fill={dark ? "#141a3a" : "#ffffff"} stroke={color} strokeWidth={4} />
      <text x={0} y={size * 0.27} fontFamily={FONT} fontWeight={900} fontSize={size} fill={dark ? "#fff" : INK_DARK} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

export const accentOf = (who: Who) => S[who].accent;
