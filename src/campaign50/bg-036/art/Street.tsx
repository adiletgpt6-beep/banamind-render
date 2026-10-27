// Маленький мир внутри ячейки-«кадра»: белая легковая машина с жёлтой
// полосой (водитель держит руль, ребёнок пристёгнут на заднем сиденье),
// панельный дом, школа с вывеской «МЕКТЕП», горы Ала-Тоо, фигурки
// ребёнка и мамы. Плоский стиль, вид сбоку.
import type React from "react";
import { fontFamily } from "../../../fonts";
import { Mountains } from "../../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { C } from "../palette";
import { box } from "./World";

// Белая легковая машина (вид сбоку, нос в сторону dir). (x, y) — середина
// низа колёс. wheel — угол колёс; kids — сколько детей на заднем сиденье
// (0…3, сбоку они видны друг за другом; ближний пристёгнут ремнём);
// kid — то же, что kids = 1.
export const SideCar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly dir?: 1 | -1;
  readonly wheel?: number;
  readonly kid?: boolean;
  readonly kids?: number;
  readonly bob?: number;
}> = ({ x, y, s = 1, dir = 1, wheel = 0, kid = true, kids, bob = 0 }) => (
  <svg
    width={540 * s}
    height={220 * s}
    viewBox="-270 -205 540 220"
    style={box({ left: x - 270 * s, top: y - 205 * s, overflow: "visible" })}
  >
    <g transform={`scale(${dir} 1)`}>
      <ellipse cx={0} cy={4} rx={236} ry={13} fill="rgba(20,25,40,0.2)" />
      <g transform={`translate(0 ${bob})`}>
        {/* кузов */}
        <path
          d="M -244 -44 Q -248 -94 -206 -102 L -136 -110 Q -96 -172 -16 -176 L 64 -174 Q 130 -170 172 -112 L 222 -102 Q 252 -94 250 -50 L 248 -24 L -242 -24 Z"
          fill={C.car}
          stroke={C.carLine}
          strokeWidth={4}
        />
        {/* окна: заднее (ребёнок) и переднее (водитель) */}
        <path d="M -116 -112 Q -84 -160 -22 -163 L -2 -163 L -2 -112 Z" fill="#B9D5EA" />
        <path d="M 12 -163 L 60 -162 Q 112 -158 146 -112 L 12 -112 Z" fill="#B9D5EA" />
        <rect x={-6} y={-166} width={14} height={58} fill={C.car} />
        {/* водитель смотрит на дорогу; руль — тёмный обод перед ним */}
        <g>
          <circle cx={70} cy={-138} r={17} fill="#3A2E2A" />
          <path d="M 48 -112 Q 52 -124 70 -124 Q 88 -124 92 -112 Z" fill="#46648F" />
          <ellipse cx={108} cy={-118} rx={4} ry={11} transform="rotate(-20 108 -118)" fill="none" stroke="#2C3140" strokeWidth={4} />
        </g>
        {/* дальние дети группы (за ближним ребёнком, чуть выше и мельче) */}
        {(kids ?? (kid ? 1 : 0)) >= 3 ? (
          <g opacity={0.92}>
            <circle cx={-24} cy={-142} r={12} fill="#D9A27E" />
            <path d="M -36 -144 Q -35 -157 -24 -157 Q -13 -157 -12 -146 Q -22 -152 -36 -144 Z" fill="#5A3A2A" />
          </g>
        ) : null}
        {(kids ?? (kid ? 1 : 0)) >= 2 ? (
          <g>
            <circle cx={-36} cy={-139} r={13.5} fill="#E2AC86" />
            <path d="M -50 -141 Q -49 -156 -36 -156 Q -22 -156 -22 -143 Q -33 -150 -50 -141 Z" fill="#3B2A24" />
            <path d="M -54 -112 Q -52 -121 -36 -121 Q -20 -121 -18 -112 Z" fill="#4E7BC7" />
          </g>
        ) : null}
        {/* ближний ребёнок на заднем сиденье, ремень через плечо */}
        {(kids ?? (kid ? 1 : 0)) >= 1 ? (
          <g>
            <circle cx={-52} cy={-136} r={15} fill="#E9B48F" />
            <path d="M -66 -140 Q -64 -156 -50 -156 Q -36 -156 -36 -142 Q -46 -150 -66 -140 Z" fill="#2E2422" />
            <path d="M -74 -112 Q -72 -122 -52 -122 Q -32 -122 -30 -112 Z" fill="#E85D75" />
            <path d="M -38 -122 L -64 -112" stroke="#1E2235" strokeWidth={5} strokeLinecap="round" />
            <circle cx={-46} cy={-139} r={2} fill="#2E2422" />
          </g>
        ) : null}
        {/* жёлтая фирменная полоса и ручки дверей */}
        <path d="M -238 -58 L 246 -58" stroke={C.yellow} strokeWidth={12} />
        <rect x={-100} y={-86} width={24} height={7} rx={3.5} fill="rgba(0,0,0,0.22)" />
        <rect x={30} y={-86} width={24} height={7} rx={3.5} fill="rgba(0,0,0,0.22)" />
        <path d="M -2 -112 L -2 -28" stroke="rgba(0,0,0,0.12)" strokeWidth={3} />
        <rect x={234} y={-86} width={14} height={18} rx={4} fill="#FFE7A8" />
        <rect x={-246} y={-86} width={10} height={18} rx={4} fill="#E25B4E" />
      </g>
      {[-150, 150].map((wx) => (
        <g key={wx} transform={`translate(${wx} -22) rotate(${wheel})`}>
          <circle r={37} fill="#23262E" />
          <circle r={19} fill="#C3C8D1" />
          <rect x={-3} y={-19} width={6} height={38} fill="#8C929C" />
          <rect x={-19} y={-3} width={38} height={6} fill="#8C929C" />
        </g>
      ))}
    </g>
  </svg>
);

// Фигурка (вид спереди/сбоку): ребёнок с рюкзаком или взрослый.
// (x, y) — точка между стопами; h — рост. wave 0…1 — машет рукой.
export const Figure: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly h: number;
  readonly kind: "kid" | "mom";
  readonly coat?: string;
  readonly wave?: number;
  readonly step?: number; // фаза шага (радианы), 0 — стоит
}> = ({ x, y, h, kind, coat, wave = 0, step = 0 }) => {
  const kid = kind === "kid";
  const color = coat ?? (kid ? "#E85D75" : "#4E7BC7");
  const leg = Math.sin(step) * 10;
  const arm = -20 - 110 * wave;
  return (
    <svg width={h} height={h} viewBox="-50 -100 100 100" style={box({ left: x - h / 2, top: y - h, overflow: "visible" })}>
      <ellipse cx={0} cy={0} rx={18} ry={3.5} fill="rgba(20,25,40,0.18)" />
      {/* ноги */}
      <path d={`M -5 -40 L ${-6 + leg} -2`} stroke="#2C3550" strokeWidth={7} strokeLinecap="round" />
      <path d={`M 5 -40 L ${6 - leg} -2`} stroke="#2C3550" strokeWidth={7} strokeLinecap="round" />
      {kid ? <rect x={-18} y={-66} width={11} height={24} rx={4} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={1.5} /> : null}
      {/* тело */}
      <path d={kid ? "M -12 -68 Q 0 -74 12 -68 L 14 -36 L -14 -36 Z" : "M -13 -74 Q 0 -80 13 -74 L 17 -30 L -17 -30 Z"} fill={color} />
      {/* рука, которой машет */}
      <path
        d={`M 11 ${kid ? -64 : -70} l ${Math.sin((arm * Math.PI) / 180) * -22} ${Math.cos((arm * Math.PI) / 180) * 22}`}
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path d={`M -11 ${kid ? -64 : -70} l -6 22`} stroke={color} strokeWidth={7} strokeLinecap="round" />
      {/* голова */}
      <circle cx={0} cy={kid ? -79 : -86} r={kid ? 11 : 10.5} fill="#E8B38E" />
      {kid ? (
        <path d="M -11 -82 Q -10 -94 0 -94 Q 11 -94 11 -82 Q 4 -88 -11 -82 Z" fill="#2E2422" />
      ) : (
        <path d="M -11 -86 Q -12 -99 0 -99 Q 12 -99 12 -86 L 13 -74 Q 8 -84 4 -92 Q -6 -88 -11 -86 Z" fill="#3A2A26" />
      )}
      <circle cx={-3.5} cy={kid ? -79 : -86} r={1.4} fill="#2E2422" />
      <circle cx={3.5} cy={kid ? -79 : -86} r={1.4} fill="#2E2422" />
      <path d={`M -3 ${kid ? -74.5 : -81.5} Q 0 ${kid ? -72.5 : -79.5} 3 ${kid ? -74.5 : -81.5}`} stroke="#9A4A3A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Школа: светлое здание, вывеска «МЕКТЕП», крыльцо. (x, y) — низ середины.
export const SchoolHouse: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly label: string }> = ({
  x,
  y,
  s = 1,
  label,
}) => (
  <div style={box({ left: x - 170 * s, top: y - 250 * s, width: 340 * s, height: 250 * s })}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 340, height: 250, transform: `scale(${s})`, transformOrigin: "0 0" }}>
      <div style={box({ left: 10, top: 60, width: 320, height: 190, backgroundColor: "#F1E3C8", borderRadius: 4 })} />
      <div style={box({ left: 0, top: 46, width: 340, height: 22, backgroundColor: "#C9644F", borderRadius: 4 })} />
      {[0, 1, 2, 3].map((c) =>
        [0, 1].map((r) =>
          c === 1 && r === 1 ? null : (
            <div
              key={`${c}-${r}`}
              style={box({ left: 30 + c * 78, top: 84 + r * 76, width: 46, height: 52, borderRadius: 4, backgroundColor: "#AFC9E0", border: "5px solid #FFFFFF", boxSizing: "border-box" })}
            />
          ),
        ),
      )}
      <div style={box({ left: 112, top: 168, width: 70, height: 82, backgroundColor: "#4A5470" })} />
      <div
        style={box({
          left: 70,
          top: 0,
          width: 200,
          height: 42,
          borderRadius: 10,
          backgroundColor: C.navy,
          color: "#FFFFFF",
          fontFamily,
          fontSize: 26,
          fontWeight: 900,
          lineHeight: "42px",
          textAlign: "center",
        })}
      >
        {label}
      </div>
    </div>
  </div>
);

// Жилой дом (панельный, как в Бишкеке) с подъездом. (x, y) — низ середины.
export const HomeBlock: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 0.32 }) => (
  <div style={box({ left: x - 300 * s, top: y, width: 1, height: 1 })}>
    <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${s})`, transformOrigin: "0 0" }}>
      <PanelHouse x={0} y={0} w={600} floors={4} color="#EADBC8" seed={36} door={300} />
    </div>
  </div>
);

// Задник мини-кадра: небо, горы, деревья, дорога (w × h).
export const MiniBackdrop: React.FC<{ readonly w: number; readonly h: number; readonly afternoon?: boolean; readonly road: number }> = ({
  w,
  h,
  afternoon,
  road,
}) => (
  <>
    <div
      style={box({
        left: 0,
        top: 0,
        width: w,
        height: h,
        background: afternoon
          ? "linear-gradient(180deg, #CFE6F7 0%, #EEF5FA 60%, #FFF2DC 100%)"
          : "linear-gradient(180deg, #FFE7C2 0%, #F6EEDB 45%, #DDEDF8 100%)",
      })}
    />
    <div
      style={box({
        left: afternoon ? w * 0.72 : w * 0.16,
        top: afternoon ? h * 0.08 : h * 0.2,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: afternoon ? "#FFE89A" : "#FFC95C",
        boxShadow: `0 0 40px ${afternoon ? "rgba(255,232,154,0.9)" : "rgba(255,180,80,0.8)"}`,
      })}
    />
    <Mountains x={-20} y={h * 0.18} w={w + 40} h={h * 0.42} />
    <Tree x={w * 0.5} y={road - 2} s={0.3} kind="poplar" />
    <Tree x={w * 0.58} y={road - 2} s={0.26} />
    <div style={box({ left: 0, top: road, width: w, height: h - road, backgroundColor: "#C9CDD4" })} />
    <div style={box({ left: 0, top: road, width: w, height: 8, backgroundColor: "#E8E2D6" })} />
    <div
      style={box({
        left: 0,
        top: road + (h - road) / 2,
        width: w,
        height: 5,
        backgroundImage: "repeating-linear-gradient(90deg, #FFFFFF 0 34px, transparent 34px 64px)",
      })}
    />
  </>
);
