// Детали сцены «search»: микрофон-«телескоп», вылезающий из рамки монитора
// к маме (тот же шуточный приём, что в интервью), окно новостей с плавным
// прощальным взмахом репортёра и мягкие подсветки в браузере.
import React from "react";
import { fontFamily } from "../../../fonts";
import { Actor, type PoseIn } from "../Actor";
import { BG42_TEXT } from "../script";
import { OFFICE } from "../sets/Office";
import { Mic } from "../sets/Screens";
import { C, clamp01, easeInOut, lerp } from "../theme";
import { TvIcon } from "../ui";

const SW = OFFICE.monitor.w;
const SH = OFFICE.monitor.h;

/** Внешний край левой рамки монитора (мир): отсюда «вылезает» микрофон. */
export const BEZEL_EDGE = OFFICE.monitor.x - OFFICE.monitor.bezel;

// Микрофон в мире: головка останавливается у лица мамы (голова ≈ (400, 880),
// край лица ≈ 455 → до головки микрофона ≥ 40 px), штанга уходит в монитор
// к руке репортёра на экране (≈ (644, 868)).
const MIC_END = { x: 524, y: 890 };
const MIC_ROOT = { x: OFFICE.monitor.x + 34, y: OFFICE.monitor.y + 168 };
const MIC_SCALE = 1.45;

/**
 * Микрофон-«телескоп» (мировые координаты, слой overMonitor). out 0…1(+):
 * 0 — спрятан за рамкой, 1 — у лица мамы (небольшой перелёт пружины допустим).
 * Всё правее внешнего края рамки обрезано — микрофон выходит из-за неё.
 */
export const PokeMic: React.FC<{ readonly out: number; readonly uid: string }> = ({ out, uid }) => {
  if (out <= 0.001) return null;
  const dx = MIC_ROOT.x - MIC_END.x;
  const dy = MIC_ROOT.y - MIC_END.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  // при out = 0 головка целиком за рамкой
  const hidden = len + 24;
  const back = (1 - out) * hidden;
  const head = { x: MIC_END.x + ux * back, y: MIC_END.y + uy * back };
  const s = MIC_SCALE;
  const id = `${uid}-clip`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={0} width={BEZEL_EDGE} height={1920} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {/* мягкая тень на стене */}
        <g transform={`translate(${head.x + 5} ${head.y + 9}) rotate(${ang})`} opacity={0.18}>
          <rect x={0} y={-6 * s} width={260} height={12 * s} rx={6 * s} fill={C.navyDeep} />
        </g>
        {/* телескопическая штанга: две секции уходят в монитор */}
        <g transform={`translate(${head.x} ${head.y}) rotate(${ang})`}>
          <rect x={50 * s} y={-3.6} width={70} height={7.2} rx={3.6} fill="#3A4566" />
          <rect x={50 * s + 66} y={-2.8} width={240} height={5.6} rx={2.8} fill="#56617F" />
          <rect x={50 * s + 62} y={-4.6} width={6} height={9.2} rx={2} fill={C.yellow} />
        </g>
        <Mic x={head.x} y={head.y} ang={ang} scale={s} />
      </g>
    </svg>
  );
};

/**
 * Окно шуточных новостей — та же вёрстка, что ReporterWindow (sets/Screens),
 * но правая рука репортёра поднимается для взмаха плавно (wave 0…1 — доля
 * подъёма), без скачка в первом кадре взмаха. Используется только в кадрах
 * с wave > 0; в остальных — общий ReporterWindow (стык сцен не меняется).
 */
export const WavingReporterWindow: React.FC<{
  readonly f: number;
  readonly abs: number;
  readonly micOut: number;
  readonly close?: number;
  readonly face?: (t: number) => number;
  readonly expr?: PoseIn["expr"];
  readonly wave: number;
}> = ({ f, abs, micOut, close = 0, face, expr = "smile", wave }) => {
  const k = 0.5;
  const place = { x: 268, y: 98 + 884 * k, h: 1000 * k };
  const m = clamp01(micOut);
  const hand = { x: lerp(222, 34, m), y: lerp(212, 168, m) };
  // кисть: у груди → над плечом (взмах), локоть всё время вниз — без переворота
  const up = easeInOut(clamp01(wave));
  // ладонь — правее и выше головы (а не у уха), покачивание ≈ 1,6 Гц
  const swing = Math.sin(f / 3) * 12 * clamp01((up - 0.55) / 0.45);
  const waveHand = { x: lerp(300, 356 + swing, up), y: lerp(228, 96, up) };
  const s = 1 - 0.86 * close;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "8% 92%",
        transform: `scale(${s})`,
        opacity: 1 - clamp01((close - 0.75) / 0.25),
        borderRadius: 10 + 20 * close,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #D9E8F8 0%, #EEF5FD 70%, #E2ECF7 100%)" }} />
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0 }}>
        <rect x={20} y={60} width={110} height={150} rx={6} fill="#C9DBF0" />
        <rect x={30} y={70} width={90} height={60} rx={4} fill="#EAF4FF" />
        <rect x={330} y={46} width={70} height={190} rx={6} fill="#CBDDF1" />
        <ellipse cx={380} cy={232} rx={26} ry={10} fill="#B9CBE2" />
        {[-24, -8, 8, 24].map((a, i) => (
          <ellipse key={i} cx={380 + a * 0.6} cy={196 - Math.abs(a) * 0.2} rx={7} ry={22} transform={`rotate(${a} ${380 + a * 0.6} 220)`} fill={i % 2 ? "#6DB487" : "#5AA376"} />
        ))}
        <rect x={0} y={240} width={SW} height={SH - 240} fill="#D3E1F1" />
      </svg>
      <Actor
        uid="rep-win"
        look="reporter"
        f={f}
        abs={abs}
        place={place}
        face={face ?? (() => -0.3)}
        role="reporter"
        seed={7}
        pose={() => ({
          expr,
          lean: 4 * m,
          armL: { target: hand, shape: "fist", elbow: "down" },
          armR: { target: waveHand, shape: up > 0.45 ? "wave" : "relax", elbow: "down" },
        })}
      />
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Mic x={hand.x - 14} y={hand.y - 8} ang={lerp(-60, 8, m)} scale={1} />
      </svg>
      <div style={{ position: "absolute", left: 10, top: 10, display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 5px", borderRadius: 7, background: C.navy, color: C.white, fontFamily, fontWeight: 900, fontSize: 12 }}>
        <TvIcon size={16} color={C.white} accent={C.yellow} />
        {BG42_TEXT.channel}
      </div>
      <div style={{ position: "absolute", left: 10, top: 36, padding: "2px 8px", borderRadius: 999, background: C.yellow, border: `1.5px solid ${C.navy}`, color: C.navy, fontFamily, fontWeight: 900, fontSize: 11 }}>
        {BG42_TEXT.jokePlate}
      </div>
      <div style={{ position: "absolute", right: 8, top: 8, width: 22, height: 22, borderRadius: 6, background: "rgba(20,40,90,0.75)", color: C.white, fontFamily, fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</div>
    </div>
  );
};

/** Мягкое жёлтое свечение вокруг элемента браузера (локальные px монитора). */
export const SoftGlow: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly r: number; readonly amount: number }> = ({ x, y, w, h, r, amount }) =>
  amount > 0.001 ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: r,
        boxShadow: `0 0 0 ${3 + 2 * amount}px rgba(255, 201, 14, ${0.42 * amount}), 0 0 ${16 * amount}px rgba(255, 201, 14, ${0.55 * amount})`,
        pointerEvents: "none",
      }}
    />
  ) : null;

/** Высота полосы вкладок браузера (BrowserScreen) — она одинакова на обеих страницах. */
const TAB_BAR = 30;

/**
 * Переход «результаты → страница BalaGo»: новая страница (children — полный
 * BrowserScreen) открывается шторкой сверху вниз, под полосой вкладок бежит
 * жёлтая полоска загрузки. progress, load — 0…1.
 */
export const PageWipe: React.FC<{ readonly progress: number; readonly load: number; readonly children: React.ReactNode }> = ({ progress, load, children }) => {
  const p = clamp01(progress);
  const edge = TAB_BAR + p * (SH - TAB_BAR);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${SH - edge}px 0)` }}>{children}</div>
      {p < 1 ? <div style={{ position: "absolute", left: 0, top: edge - 1, width: SW, height: 10, background: "linear-gradient(180deg, rgba(20,40,90,0.12), transparent)" }} /> : null}
      {load > 0.001 ? <div style={{ position: "absolute", left: 0, top: TAB_BAR - 3, width: SW * Math.min(1, load * 1.15), height: 3, borderRadius: 2, background: C.yellow, opacity: Math.min(1, load * 4) }} /> : null}
    </>
  );
};
