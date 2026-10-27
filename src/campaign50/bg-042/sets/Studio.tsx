// Светлая телестудия шуточных офисных новостей (мир 1080×1920).
// Сверху — видеостена (контент сцены через prop wall), в центре — ведущий за
// изогнутым столом, снизу — светлый пол. Ведущий рисуется сценой между
// StudioBack и StudioDesk (стол закрывает нижнюю часть корпуса), руки —
// после стола (Actor layer="arms").
import React from "react";
import { C } from "../theme";

export const STUDIO = {
  wall: { x: 70, y: 420, w: 940, h: 500, r: 34 },
  desk: { top: 1196, front: 1232, bottom: 1690, left: 120, right: 960 },
  // ведущий: точка (пол за столом), рост, высота сиденья
  anchor: { x: 540, y: 1620, h: 1000 },
  floor: 1660,
} as const;

/** Задник студии: стены, световые панели, видеостена с контентом. */
export const StudioBack: React.FC<{ readonly f: number; readonly wall?: React.ReactNode; readonly wallGlow?: number }> = ({ f, wall, wallGlow = 1 }) => {
  const W0 = STUDIO.wall;
  const sweep = ((f * 2.2) % 1600) - 300;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #E4EEFA 0%, #F2F7FD 46%, #E8F0FA 100%)" }} />
      {/* световые колонны */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: [-40, 200, 760, 1000][i],
            top: 0,
            width: 120,
            height: 1460,
            background: "linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.75) 40%, rgba(255,255,255,0.0))",
            opacity: 0.8,
          }}
        />
      ))}
      {/* потолочные софиты */}
      <svg width={1080} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
        {[180, 400, 680, 900].map((x, i) => (
          <g key={x}>
            <path d={`M ${x - 30} 0 L ${x + 30} 0 L ${x + 150 + i * 6} 420 L ${x - 150 - i * 6} 420 Z`} fill="rgba(255, 236, 170, 0.18)" />
            <rect x={x - 34} y={-10} width={68} height={34} rx={10} fill={C.navySoft} />
          </g>
        ))}
      </svg>
      {/* видеостена */}
      <div
        style={{
          position: "absolute",
          left: W0.x - 14,
          top: W0.y - 14,
          width: W0.w + 28,
          height: W0.h + 28,
          borderRadius: W0.r + 12,
          background: C.navy,
          boxShadow: `0 30px 70px ${C.shadowDeep}`,
        }}
      />
      <div style={{ position: "absolute", left: W0.x, top: W0.y, width: W0.w, height: W0.h, borderRadius: W0.r, overflow: "hidden", background: "linear-gradient(160deg, #1B3470 0%, #14285A 60%, #102150 100%)" }}>
        {/* сетка экрана */}
        <svg width={W0.w} height={W0.h} style={{ position: "absolute", inset: 0, opacity: 0.25 * wallGlow }}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={i * 80 + 20} y1={0} x2={i * 80 + 20} y2={W0.h} stroke="#3A5AA8" strokeWidth={1.5} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 80 + 10} x2={W0.w} y2={i * 80 + 10} stroke="#3A5AA8" strokeWidth={1.5} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: sweep, top: -100, width: 160, height: W0.h + 200, transform: "rotate(14deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        {wall}
      </div>
      {/* пол студии */}
      <div style={{ position: "absolute", left: 0, top: STUDIO.floor - 40, width: 1080, height: 1920 - STUDIO.floor + 40, background: "linear-gradient(180deg, #DCE7F5 0%, #EEF4FB 30%, #F6F9FD 100%)" }} />
      <svg width={1080} height={520} style={{ position: "absolute", left: 0, top: STUDIO.floor - 40 }}>
        <ellipse cx={540} cy={110} rx={520} ry={70} fill="rgba(255,201,14,0.10)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${540 + (i - 2) * 140} 40 L ${540 + (i - 2) * 420} 520`} stroke="rgba(20,40,90,0.06)" strokeWidth={3} />
        ))}
      </svg>
    </>
  );
};

/** Новостной стол (поверх корпуса ведущего, под его руками). */
export const StudioDesk: React.FC = () => {
  const D = STUDIO.desk;
  return (
    <>
      <svg width={1080} height={D.bottom - D.top + 40} style={{ position: "absolute", left: 0, top: D.top - 20 }}>
        <defs>
          <linearGradient id="bg42deskFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E3EBF6" />
          </linearGradient>
        </defs>
        {/* столешница: светлая, с лёгким изгибом */}
        <path d={`M ${D.left - 30} 20 Q 540 -6 ${D.right + 30} 20 L ${D.right + 40} 52 Q 540 30 ${D.left - 40} 52 Z`} fill="#F7F9FC" stroke="#CBD6E6" strokeWidth={2} />
        {/* передняя панель */}
        <path d={`M ${D.left - 40} 52 Q 540 30 ${D.right + 40} 52 L ${D.right + 10} ${D.bottom - D.top + 20} L ${D.left - 10} ${D.bottom - D.top + 20} Z`} fill="url(#bg42deskFront)" />
        <path d={`M ${D.left - 36} 74 Q 540 52 ${D.right + 36} 74 L ${D.right + 34} 92 Q 540 70 ${D.left - 34} 92 Z`} fill={C.yellow} />
        {[0.36, 0.64].map((k) => (
          <line key={k} x1={D.left + (D.right - D.left) * k} y1={110} x2={D.left + (D.right - D.left) * k} y2={D.bottom - D.top - 30} stroke="#D6E0EE" strokeWidth={3} />
        ))}
        <rect x={D.left - 10} y={D.bottom - D.top - 30} width={D.right - D.left + 20} height={50} fill={C.navy} />
        <rect x={D.left - 10} y={D.bottom - D.top - 36} width={D.right - D.left + 20} height={8} fill={C.yellow} />
      </svg>
    </>
  );
};

/** Ручка на столе ведущего / листы сценария (детали). */
export const DeskPapers: React.FC<{ readonly x: number; readonly y: number; readonly tilt?: number }> = ({ x, y, tilt = -6 }) => (
  <svg width={160} height={60} style={{ position: "absolute", left: x - 80, top: y - 30, overflow: "visible" }}>
    <g transform={`rotate(${tilt} 80 30)`}>
      <rect x={14} y={14} width={120} height={30} rx={4} fill="#FFFFFF" stroke="#C9D3E3" strokeWidth={2} />
      <rect x={22} y={8} width={120} height={30} rx={4} fill="#FFFFFF" stroke="#C9D3E3" strokeWidth={2} />
      <line x1={34} y1={18} x2={120} y2={18} stroke="#B9C6DA" strokeWidth={3} />
      <line x1={34} y1={27} x2={104} y2={27} stroke="#B9C6DA" strokeWidth={3} />
    </g>
  </svg>
);
