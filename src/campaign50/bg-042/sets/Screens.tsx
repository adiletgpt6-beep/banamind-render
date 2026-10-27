// Содержимое экрана монитора мамы (локальные px OFFICE.monitor.w × h):
//   ReporterWindow — окно шуточных новостей с мини-репортёром и микрофоном;
//   BrowserScreen  — поиск «Бишкекте мектепке жеткирүү» → страница BalaGo
//                    с формой (дарек, мектеп, убакыт) и кнопкой WhatsApp.
// Отправку пользователь делает сам: подтверждение «заявка принята» не
// показывается (сайт только готовит сообщение в WhatsApp).
import React from "react";
import { fontFamily } from "../../../fonts";
import { Actor, type PoseIn } from "../Actor";
import { BG42_TEXT } from "../script";
import { C, clamp01, lerp } from "../theme";
import { BrandLogo, BrandWord, ClockIcon, HouseIcon, SchoolIcon, TvIcon, WaIcon } from "../ui";
import { OFFICE } from "./Office";

const SW = OFFICE.monitor.w;
const SH = OFFICE.monitor.h;

/** Микрофон репортёра (локальные координаты): головка в (x, y), рукоять по углу ang (градусы, 0 — вправо). */
export const Mic: React.FC<{ readonly x: number; readonly y: number; readonly ang: number; readonly scale?: number }> = ({ x, y, ang, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${scale})`}>
    <rect x={8} y={-4.5} width={46} height={9} rx={4.5} fill="#2A3352" />
    <rect x={12} y={-8} width={16} height={16} rx={3} fill={C.yellow} stroke={C.navy} strokeWidth={1.5} />
    <circle cx={0} cy={0} r={10.5} fill="#5E6780" />
    <circle cx={0} cy={0} r={10.5} fill="none" stroke="#2A3352" strokeWidth={2} />
    <path d="M -7 -4 L 7 -4 M -8 0 L 8 0 M -7 4 L 7 4" stroke="#8C95AD" strokeWidth={1.4} />
  </g>
);

/**
 * Окно шуточных новостей с репортёром. micOut 0…1 — репортёр тянет микрофон к
 * левому краю (к маме); close 0…1 — окно сворачивается в левый нижний угол.
 */
export const ReporterWindow: React.FC<{
  readonly f: number;
  readonly abs: number;
  readonly micOut: number;
  readonly close?: number;
  readonly face?: (t: number) => number;
  readonly expr?: PoseIn["expr"];
  readonly wave?: number;
}> = ({ f, abs, micOut, close = 0, face, expr = "smile", wave = 0 }) => {
  const k = 0.5; // рост репортёра 500 px → голова ≈ 72 px
  const place = { x: 268, y: 98 + 884 * k, h: 1000 * k };
  const m = clamp01(micOut);
  // кисть с микрофоном: у груди → у левого края экрана
  const hand = { x: lerp(222, 34, m), y: lerp(212, 168, m) };
  const waveArm = wave > 0 ? { x: 330 + Math.sin(f / 3) * 10 * wave, y: 120 - 10 * wave } : null;
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
      {/* «выездная» студия: светлый офисный коридор */}
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
          armR: waveArm ? { target: waveArm, shape: "wave" } : { target: { x: 292, y: 262 }, shape: "relax", elbow: "hang" },
        })}
      />
      {/* микрофон в руке (головка смотрит к маме, т. е. влево) */}
      <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Mic x={hand.x - 14} y={hand.y - 8} ang={lerp(-60, 8, m)} scale={1} />
      </svg>
      {/* логотип канала и плашка шутки */}
      <div style={{ position: "absolute", left: 10, top: 10, display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 5px", borderRadius: 7, background: C.navy, color: C.white, fontFamily, fontWeight: 900, fontSize: 12 }}>
        <TvIcon size={16} color={C.white} accent={C.yellow} />
        {BG42_TEXT.channel}
      </div>
      <div style={{ position: "absolute", left: 10, top: 36, padding: "2px 8px", borderRadius: 999, background: C.yellow, border: `1.5px solid ${C.navy}`, color: C.navy, fontFamily, fontWeight: 900, fontSize: 11 }}>
        {BG42_TEXT.jokePlate}
      </div>
      {/* кнопка закрытия окна */}
      <div style={{ position: "absolute", right: 8, top: 8, width: 22, height: 22, borderRadius: 6, background: "rgba(20,40,90,0.75)", color: C.white, fontFamily, fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</div>
    </div>
  );
};

/** Курсор мыши. */
export const Cursor: React.FC<{ readonly x: number; readonly y: number; readonly press?: number }> = ({ x, y, press = 0 }) => (
  <svg width={24} height={30} style={{ position: "absolute", left: x - 3, top: y - 2, overflow: "visible", transform: `scale(${1 - 0.12 * press})`, transformOrigin: "3px 2px" }}>
    {press > 0 ? <circle cx={3} cy={2} r={10 + 8 * press} fill="rgba(255,201,14,0.45)" /> : null}
    <path d="M 3 2 L 3 22 L 8.5 17 L 12.5 26 L 16 24.5 L 12 16 L 19 16 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

/**
 * Браузер. typed — сколько символов запроса набрано; results 0…1 — список
 * результатов; site 0…1 — открыта страница BalaGo; field — подсвеченное поле
 * формы (0…3, дробное — переход); cursor — положение курсора (локальные px).
 */
export const BrowserScreen: React.FC<{
  readonly typed: number;
  readonly results: number;
  readonly site: number;
  readonly field?: number;
  readonly cursor?: { readonly x: number; readonly y: number; readonly press?: number } | null;
  readonly caret?: boolean;
}> = ({ typed, results, site, field = -1, cursor = null, caret = false }) => {
  const q = BG42_TEXT.query.slice(0, Math.max(0, Math.floor(typed)));
  const r = clamp01(results);
  const st = clamp01(site);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F6F8FC", fontFamily, color: C.navy, overflow: "hidden" }}>
      {/* полоса браузера */}
      <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: 30, background: "#E3E9F3", display: "flex", alignItems: "center", gap: 6, paddingLeft: 10 }}>
        {["#F27D72", "#F6C453", "#72C58C"].map((c) => (
          <div key={c} style={{ width: 9, height: 9, borderRadius: 5, background: c }} />
        ))}
        <div style={{ marginLeft: 10, width: 120, height: 18, borderRadius: "7px 7px 0 0", background: "#F6F8FC", alignSelf: "flex-end" }} />
      </div>
      {/* строка поиска */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 40,
          width: SW - 32,
          height: 34,
          borderRadius: 17,
          background: C.white,
          border: `2px solid ${typed > 0 && st < 0.5 ? C.yellow : "#CAD4E4"}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          boxSizing: "border-box",
          fontWeight: 800,
          fontSize: 15,
          whiteSpace: "nowrap",
        }}
      >
        <svg width={16} height={16} viewBox="0 0 16 16">
          <circle cx={6.5} cy={6.5} r={4.8} stroke={C.navySoft} strokeWidth={2} fill="none" />
          <line x1={10} y1={10} x2={14.5} y2={14.5} stroke={C.navySoft} strokeWidth={2.2} strokeLinecap="round" />
        </svg>
        <span>{q}</span>
        {caret ? <span style={{ width: 2, height: 18, background: C.navy, marginLeft: -6 }} /> : null}
      </div>
      {/* результаты поиска */}
      <div style={{ position: "absolute", left: 16, top: 86, width: SW - 32, opacity: r * (1 - st), transform: `translateY(${(1 - r) * 10}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: C.white, border: `2px solid ${C.yellow}`, boxShadow: `0 4px 10px ${C.shadow}` }}>
          <BrandLogo size={34} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              <BrandWord size={16} /> — Балдар үчүн такси
            </div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: C.navySoft }}>Бишкек • {BG42_TEXT.siteRoute}</div>
          </div>
        </div>
        {[0, 1].map((i) => (
          <div key={i} style={{ marginTop: 9, padding: "9px 12px", borderRadius: 12, background: C.white, border: "2px solid #E1E7F1" }}>
            <div style={{ width: 170 - i * 30, height: 9, borderRadius: 5, background: "#C9D4E5" }} />
            <div style={{ marginTop: 6, width: 260 - i * 40, height: 7, borderRadius: 4, background: "#E1E7F1" }} />
          </div>
        ))}
      </div>
      {/* страница BalaGo */}
      <div style={{ position: "absolute", left: 0, top: 30, width: SW, height: SH - 30, background: C.white, opacity: st, transform: `translateY(${(1 - st) * 16}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: `3px solid ${C.yellow}` }}>
          <BrandLogo size={30} />
          <BrandWord size={20} />
          <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: 12, color: C.navySoft }}>{BG42_TEXT.siteTagline}</div>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "10px 14px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            {(
              [
                [BG42_TEXT.address, HouseIcon],
                [BG42_TEXT.school, SchoolIcon],
                [BG42_TEXT.time, ClockIcon],
              ] as const
            ).map(([label, Icon], i) => {
              const on = clamp01(1 - Math.abs(field - i));
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 10px",
                    borderRadius: 10,
                    border: `2px solid ${on > 0.5 ? C.yellow : "#D3DCEA"}`,
                    background: on > 0.5 ? C.yellowSoft : "#F8FAFD",
                  }}
                >
                  <Icon size={20} />
                  <div style={{ fontWeight: 900, fontSize: 14 }}>{label}</div>
                  <div style={{ marginLeft: "auto", width: 70, height: 7, borderRadius: 4, background: "#DCE3EE" }} />
                </div>
              );
            })}
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", borderRadius: 12, background: "#25D366", color: C.white, fontWeight: 900, fontSize: 13.5 }}>
              <WaIcon size={18} /> {BG42_TEXT.siteButton}
            </div>
          </div>
          <div style={{ width: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, background: C.yellowSoft, border: `2px solid ${C.yellow}` }}>
            <HouseIcon size={26} />
            <div style={{ fontWeight: 900, fontSize: 18 }}>↓</div>
            <SchoolIcon size={26} />
            <div style={{ fontWeight: 900, fontSize: 18 }}>↓</div>
            <HouseIcon size={26} />
          </div>
        </div>
      </div>
      {cursor ? <Cursor x={cursor.x} y={cursor.y} press={cursor.press} /> : null}
    </div>
  );
};
