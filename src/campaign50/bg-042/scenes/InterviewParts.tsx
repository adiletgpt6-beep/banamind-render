// Части сцены «interview»: содержимое монитора (окно новостей всплывает
// поверх рабочего документа), микрофон репортёра, который проходит сквозь
// экран и высовывается из монитора к лицу мамы, и напоминание на телефоне.
import React from "react";
import { fontFamily } from "../../../fonts";
import { OFFICE } from "../sets/Office";
import { Mic, ReporterWindow } from "../sets/Screens";
import { C, clamp01, pop } from "../theme";
import { SchoolIcon } from "../ui";

const M = OFFICE.monitor;
/** Левый внешний край рамки монитора (мир). */
export const BEZEL_L = M.x - M.bezel;

// ---------- микрофон сквозь экран ----------

/**
 * Микрофон в кулаке репортёра при micOut = 1 (как его рисует ReporterWindow):
 * конец рукояти G (локальные px экрана), головка на расстоянии MIC_R от G,
 * угол рукояти MIC_ANG (градусы).
 */
const G = { x: 20 + 54 * Math.cos((8 * Math.PI) / 180), y: 160 + 54 * Math.sin((8 * Math.PI) / 180) };
export const MIC_R = 54;
export const MIC_ANG = 8;

/** Положение микрофона: r — головка от кулака (px), ang — угол рукояти. */
export type MicPose = { readonly r: number; readonly ang: number };

/** Головка (локальные px экрана) и масштаб: снаружи микрофон чуть крупнее — «ближе к зрителю». */
const micGeom = (p: MicPose) => {
  const a = (p.ang * Math.PI) / 180;
  const hx = G.x - p.r * Math.cos(a);
  const hy = G.y - p.r * Math.sin(a);
  const s = 1 + 0.25 * clamp01(-hx / 80);
  return { hx, hy, s, a };
};

/** Мировая x головки микрофона (для «ряби» на рамке). */
export const micHeadX = (p: MicPose) => M.x + micGeom(p).hx;

/** Микрофон целиком: рукоять от головки до кулака (сужается к кулаку) и головка. */
const MicBody: React.FC<{ readonly p: MicPose; readonly ox: number; readonly oy: number }> = ({ p, ox, oy }) => {
  const { hx, hy, s, a } = micGeom(p);
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const w0 = 4.5 * s;
  const w1 = 4.5;
  const x0 = ox + hx;
  const y0 = oy + hy;
  const x1 = ox + G.x;
  const y1 = oy + G.y;
  return (
    <>
      <path d={`M ${x0 + nx * w0} ${y0 + ny * w0} L ${x1 + nx * w1} ${y1 + ny * w1} L ${x1 - nx * w1} ${y1 - ny * w1} L ${x0 - nx * w0} ${y0 - ny * w0} Z`} fill="#2A3352" />
      <circle cx={x1} cy={y1} r={w1} fill="#2A3352" />
      <Mic x={x0} y={y0} ang={p.ang} scale={s} />
    </>
  );
};

/**
 * Поверх окна новостей (локальные px экрана): прячет микрофон, нарисованный
 * ReporterWindow (заплатка повторяет фон окна), и рисует тот же микрофон в
 * положении p — он уходит за левый край экрана.
 */
const MicInScreen: React.FC<{ readonly p: MicPose }> = ({ p }) => (
  <svg width={M.w} height={M.h} style={{ position: "absolute", left: 0, top: 0 }}>
    <defs>
      {/* тот же градиент, что у фона ReporterWindow */}
      <linearGradient id="bg42-int-wall" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={M.h}>
        <stop offset={0} stopColor="#D9E8F8" />
        <stop offset={0.7} stopColor="#EEF5FD" />
        <stop offset={1} stopColor="#E2ECF7" />
      </linearGradient>
    </defs>
    <rect x={0} y={144} width={20} height={34} fill="url(#bg42-int-wall)" />
    <rect x={20} y={144} width={45} height={34} fill="#C9DBF0" />
    <MicBody p={p} ox={0} oy={0} />
  </svg>
);

/**
 * Экран монитора: под окном — рабочий документ; окно новостей всплывает в
 * кадре win (масштаб 0,85 → 1 с мягкой пружиной). После всплытия окно стоит
 * без трансформаций — ровно как ReporterWindow в начале сцены «search».
 * mic — микрофон проходит сквозь экран (null — обычный микрофон в руке).
 */
export const InterviewMonitor: React.FC<{
  readonly f: number;
  readonly abs: number;
  readonly win: number;
  readonly micOut: number;
  readonly mic: MicPose | null;
}> = ({ f, abs, win, micOut, mic }) => {
  const settled = f >= win + 40;
  const p = settled ? 1 : pop(f, win, 15, 150);
  const o = clamp01((f - win) / 6);
  return (
    <>
      {settled ? null : <WorkDoc />}
      <div style={{ position: "absolute", inset: 0, opacity: settled ? 1 : o, transform: settled ? undefined : `scale(${0.85 + 0.15 * p})` }}>
        <ReporterWindow f={f} abs={abs} micOut={micOut} />
      </div>
      {mic ? <MicInScreen p={mic} /> : null}
    </>
  );
};

/**
 * Микрофон «из монитора» (мир): тот же микрофон, что в экране, продолжение
 * за левой рамкой (всё правее края рамки обрезано). ripple 0…1 — «рябь»
 * стекла на рамке в момент прохода головки.
 */
export const PokeMic: React.FC<{ readonly p: MicPose; readonly ripple: readonly number[] }> = ({ p, ripple }) => {
  const { a } = micGeom(p);
  // линия микрофона на середине рамки
  const bx = BEZEL_L + M.bezel / 2;
  const by = M.y + G.y - (M.x + G.x - bx) * Math.tan(a);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: BEZEL_L, height: 1920, overflow: "hidden", pointerEvents: "none" }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <MicBody p={p} ox={M.x} oy={M.y} />
        </svg>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        {ripple.map((k, i) =>
          k > 0 && k < 1 ? (
            <ellipse key={i} cx={bx} cy={by} rx={5 + 14 * k} ry={13 + 26 * k} fill="none" stroke={i % 2 ? C.yellow : C.white} strokeWidth={0.6 + 3.2 * (1 - k)} opacity={0.9 * (1 - k)} />
          ) : null,
        )}
      </svg>
    </>
  );
};

// ---------- экран до всплытия окна и телефон ----------

/** Рабочий документ мамы под окном новостей (локальные px экрана). */
const WorkDoc: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#F6F8FC" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: M.w, height: 26, background: "#E3E9F3" }} />
    <div style={{ position: "absolute", left: 34, top: 44, width: M.w - 68, height: M.h - 60, borderRadius: 6, background: C.white, boxShadow: `0 4px 12px ${C.shadow}` }}>
      {[250, 300, 210, 280, 160, 290, 120].map((w, i) => (
        <div key={i} style={{ position: "absolute", left: 22, top: 22 + i * 26, width: w, height: 8, borderRadius: 4, background: i === 0 ? "#9DB0CF" : "#DCE3EE" }} />
      ))}
    </div>
  </div>
);

/** Телефон на столе (мир, центр экрана телефона — см. DeskTop). */
const PHONE = { x: 703, y: 1229 };

/**
 * Напоминание с телефона: школа и 16:00 (как на видеостене хука). Всплывает
 * над телефоном на кадре at, исчезает на кадре out. Мировые координаты.
 */
export const PhoneReminder: React.FC<{ readonly f: number; readonly at: number; readonly out: number }> = ({ f, at, out }) => {
  const p = pop(f, at, 13, 150);
  const q = clamp01((f - out) / 8);
  const k = p * (1 - q);
  if (f < at || k <= 0.001) return null;
  const rise = 26 * (1 - p) + 10 * q;
  const buzz = Math.sin(f * 1.9) * 2.2 * clamp01(1 - (f - at) / 18);
  return (
    <>
      {/* вибрация телефона: короткие дуги */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        {[-1, 1].map((side) => (
          <path
            key={side}
            d={`M ${PHONE.x + side * 50} ${PHONE.y - 14} Q ${PHONE.x + side * 60} ${PHONE.y} ${PHONE.x + side * 50} ${PHONE.y + 14}`}
            stroke={C.yellowDeep}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            opacity={clamp01(1 - (f - at) / 24)}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 652,
          top: 1062,
          width: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "8px 0",
          borderRadius: 18,
          background: C.white,
          border: `3px solid ${C.yellow}`,
          boxShadow: `0 8px 18px ${C.shadow}`,
          fontFamily,
          fontWeight: 1000,
          fontSize: 30,
          color: C.navy,
          opacity: clamp01(k * 1.6),
          transform: `translate(${buzz}px, ${rise}px) scale(${0.7 + 0.3 * k})`,
          transformOrigin: "50% 100%",
        }}
      >
        <SchoolIcon size={38} />
        16:00
        <div style={{ position: "absolute", left: 66, bottom: -11, width: 18, height: 18, background: C.white, borderRight: `3px solid ${C.yellow}`, borderBottom: `3px solid ${C.yellow}`, transform: "rotate(45deg)" }} />
      </div>
    </>
  );
};
