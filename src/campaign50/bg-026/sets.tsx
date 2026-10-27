// Декорации BG-026: офис отца в Бишкеке (вид сбоку: окно с Ала-Тоо и
// городом, жалюзи, доска со стикерами, лампа) и «врезка» с водителем —
// белая легковая машина стоит у бордюра во дворе, водитель пишет сообщение
// на месте (машина не едет), ребёнок сзади пристёгнут.
// Мир офиса — px, пол y = FLOOR (как в общем rig two-schedules-2d).
import { Mountains } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { C } from "./palette";
import { abs, font } from "./parts";

export const FLOOR = 1000;
export const ADULT_H = 760;
export const deskTop = (h = ADULT_H) => FLOOR - 0.395 * h;
export const seatHeight = (h = ADULT_H) => 0.27 * h;

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Камера: точка мира cam.x/cam.y — в центре кадра 1080×1920.
export const World: React.FC<{ readonly cam: Cam; readonly children: React.ReactNode }> = ({ cam, children }) => (
  <div style={abs({ inset: 0, overflow: "hidden" })}>
    <div
      style={abs({
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        transformOrigin: "0 0",
        transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
      })}
    >
      {children}
    </div>
  </div>
);

// Офис: светлая стена, широкое окно на Бишкек и Ала-Тоо с жалюзи, доска
// со стикерами, полка. light 0…1 — утро разгорается.
export const OfficeRoom: React.FC<{ readonly light?: number }> = ({ light = 0 }) => (
  <div style={abs({ left: -500, top: -300, width: 2100, height: 1600 })}>
    <div style={abs({ left: 0, top: 0, width: 2100, height: 1600, background: "linear-gradient(180deg, #F4F7FB, #E7ECF3)" })} />
    {/* окно */}
    <div style={abs({ left: 520, top: 330, width: 760, height: 560, borderRadius: 8, overflow: "hidden", background: `linear-gradient(180deg, #BFDDF3 0%, #E6F1F9 ${60 + light * 10}%, #FFF3D6 100%)` })}>
      <Mountains x={-40} y={120} w={840} h={230} />
      {/* город: многоэтажки и панельные дома */}
      <div style={abs({ left: 40, top: 230, width: 110, height: 330, background: "#D7DEE8", borderRadius: 4 })} />
      <div style={abs({ left: 600, top: 250, width: 120, height: 310, background: "#CFD7E2", borderRadius: 4 })} />
      {[0, 1, 2, 3, 4, 5, 6].map((r) =>
        [0, 1, 2].map((k) => <div key={`${r}-${k}`} style={abs({ left: 52 + k * 32, top: 250 + r * 42, width: 20, height: 24, background: "#AFC4DD", borderRadius: 2 })} />),
      )}
      {[0, 1, 2, 3, 4, 5].map((r) =>
        [0, 1, 2].map((k) => <div key={`b${r}-${k}`} style={abs({ left: 614 + k * 34, top: 270 + r * 44, width: 22, height: 26, background: "#A9BFDA", borderRadius: 2 })} />),
      )}
      <PanelHouse x={180} y={560} w={380} floors={4} color="#E9E0D2" seed={7} />
      <Tree x={160} y={560} s={0.8} kind="poplar" />
      <Tree x={585} y={560} s={0.75} kind="poplar" />
    </div>
    {/* рама и жалюзи (подняты наполовину) */}
    <div style={abs({ left: 506, top: 316, width: 788, height: 588, borderRadius: 12, border: "14px solid #FFFFFF", boxSizing: "border-box" })} />
    <div style={abs({ left: 893, top: 330, width: 14, height: 560, background: "#FFFFFF" })} />
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} style={abs({ left: 520, top: 330 + i * 22, width: 760, height: 16, background: "#F1F3F6", boxShadow: "0 3px 0 #DCE1E8" })} />
    ))}
    {/* доска со стикерами */}
    <div style={abs({ left: 70, top: 380, width: 360, height: 250, borderRadius: 10, background: "#FFFFFF", border: "10px solid #D9DFE8", boxSizing: "border-box" })} />
    {[
      [100, 410, C.yellow, -4],
      [210, 400, "#BFE3CB", 3],
      [320, 418, "#CFE0F3", -2],
      [140, 520, "#CFE0F3", 2],
      [260, 515, C.yellow, -3],
    ].map(([x, y, c, r], i) => (
      <div key={i} style={abs({ left: Number(x), top: Number(y), width: 80, height: 80, background: String(c), transform: `rotate(${Number(r)}deg)`, boxShadow: "0 3px 6px rgba(0,0,0,0.08)" })} />
    ))}
    {/* полка */}
    <div style={abs({ left: 1400, top: 520, width: 260, height: 14, background: "#C9D2DE" })} />
    {["#5C86D6", "#FFC72C", "#9DB2CC"].map((c, i) => (
      <div key={i} style={abs({ left: 1420 + i * 46, top: 420, width: 36, height: 100, borderRadius: 4, background: c })} />
    ))}
    <div style={abs({ left: 0, top: 1300, width: 2100, height: 300, background: "#CED5DF" })} />
    {/* мягкий утренний свет из окна */}
    <div style={abs({ left: 300, top: 300, width: 1200, height: 1000, background: `radial-gradient(closest-side, rgba(255,240,200,${0.15 + 0.45 * light}), rgba(255,240,200,0))` })} />
  </div>
);

// Стол (передний план): белая столешница и тумба.
export const OfficeDesk: React.FC<{ readonly x: number; readonly w?: number }> = ({ x, w = 900 }) => (
  <>
    <div style={abs({ left: x - w / 2, top: deskTop(), width: w, height: 30, borderRadius: 8, background: "#FBFBFC", boxShadow: "0 6px 0 #D5DCE6" })} />
    <div style={abs({ left: x - w / 2 + 20, top: deskTop() + 30, width: w - 40, height: FLOOR - deskTop() + 60, background: "linear-gradient(180deg, #E6EAF0, #D4DBE4)" })} />
    {/* тумба с ящиками */}
    {[0, 1, 2].map((i) => (
      <div key={i} style={abs({ left: x + w / 2 - 330, top: deskTop() + 52 + i * 92, width: 270, height: 78, borderRadius: 10, border: "3px solid #C5CED9", boxSizing: "border-box" })}>
        <div style={abs({ left: 95, top: 30, width: 80, height: 12, borderRadius: 6, background: "#AEB9C7" })} />
      </div>
    ))}
    <div style={abs({ left: x - w / 2 + 20, top: deskTop() + 30, width: w - 40, height: 26, background: "linear-gradient(180deg, rgba(40,50,70,0.12), rgba(40,50,70,0))" })} />
  </>
);

// Офисное кресло (за сидящим).
export const OfficeChair: React.FC<{ readonly x: number }> = ({ x }) => (
  <>
    <div style={abs({ left: x - 125, top: FLOOR - 610, width: 250, height: 340, borderRadius: "80px 80px 30px 30px", background: "#2F3A52" })} />
    <div style={abs({ left: x - 14, top: FLOOR - 270, width: 28, height: 200, background: "#262F44" })} />
  </>
);

// Настольная лампа (вид сбоку) — стоит на столе.
export const DeskLamp: React.FC<{ readonly x: number }> = ({ x }) => (
  <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${deskTop()})`}>
      <ellipse cx={0} cy={-6} rx={46} ry={10} fill="#2F3A52" />
      <path d="M 0 -10 L 30 -150 L -40 -230" fill="none" stroke="#2F3A52" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -40 -230 L -110 -200 L -60 -150 Z" fill={C.yellow} />
    </g>
  </svg>
);

// Ноутбук сбоку (экран светится).
export const LaptopSide: React.FC<{ readonly x: number; readonly open: number }> = ({ x, open }) => {
  const a = -100 * open; // угол экрана
  return (
    <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} ${deskTop() - 4})`}>
        <rect x={-150} y={-12} width={300} height={14} rx={6} fill="#B8C1CF" />
        <g transform={`translate(150 -10) rotate(${a})`}>
          <rect x={-300} y={-10} width={300} height={12} rx={6} fill="#9AA6B8" />
        </g>
      </g>
    </svg>
  );
};

// Ноутбук анфас (к зрителю — задняя крышка): стоит на столе перед
// сидящим, x — центр. Кисти за крышкой на клавиатуре.
export const LaptopFront: React.FC<{ readonly x: number; readonly w?: number; readonly hk?: number }> = ({ x, w = 330, hk = 0.62 }) => (
  <svg width={1} height={1} style={abs({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${deskTop()})`}>
      <ellipse cx={0} cy={2} rx={w * 0.56} ry={8} fill="rgba(20,30,60,0.12)" />
      <path d={`M ${-w / 2} -4 L ${-w / 2 + 14} ${-w * hk} L ${w / 2 - 14} ${-w * hk} L ${w / 2} -4 Z`} fill="#C9D1DD" />
      <path d={`M ${-w / 2 + 10} -10 L ${-w / 2 + 22} ${-w * (hk - 0.02)} L ${w / 2 - 22} ${-w * (hk - 0.02)} L ${w / 2 - 10} -10 Z`} fill="#D8DEE7" />
      <circle cx={0} cy={-w * hk * 0.52} r={w * 0.06} fill="#EEF2F7" />
      <rect x={-w / 2 - 10} y={-6} width={w + 20} height={8} rx={4} fill="#AEB9C7" />
    </g>
  </svg>
);

// Телефон, лежащий на столе (вид сбоку): экран вверх, при glow — светится.
export const PhoneOnDesk: React.FC<{ readonly x: number; readonly glow?: number }> = ({ x, glow = 0 }) => (
  <div style={abs({ left: x - 80, top: deskTop() - 20, width: 160, height: 22, borderRadius: 8, background: "#1D2233", boxShadow: glow ? `0 -8px 24px rgba(120,200,255,${0.7 * glow})` : undefined })} />
);

// ---------- Врезка: водитель на месте ----------
// Машина стоит у бордюра (знак P, колёса не крутятся). typing 0…1 —
// сколько набрано текста text; sent 0…1 — нажатие «отправить» и отлёт.
// kid — ребёнок на заднем сиденье, пристёгнут. phoneUp — телефон в руках.
export const DriverVignette: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly text: string;
  readonly typing: number;
  readonly sent: number;
  readonly kid: number;
  readonly f: number;
  readonly label?: string;
  readonly parkedLabel?: string;
  readonly mode?: "text" | "location";
}> = ({ w, h, text, typing, sent, kid, f, label, parkedLabel, mode = "text" }) => {
  const shown = text.slice(0, Math.round(text.length * typing));
  const thumb = typing > 0 && typing < 1 ? Math.sin(f * 1.9) * 4 : 0;
  const S = w / 900;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 34, overflow: "hidden", background: "#DCEEFA", boxShadow: "0 16px 40px rgba(20,40,90,0.22)", border: "6px solid #FFFFFF" }}>
      <svg width={w} height={h} viewBox={`0 0 900 ${h / S}`} style={abs({ left: 0, top: 0 })}>
        <defs>
          <linearGradient id="bg26-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFDDF3" />
            <stop offset="1" stopColor="#F1F7FB" />
          </linearGradient>
        </defs>
        <rect width={900} height={h / S} fill="url(#bg26-sky)" />
        {mode === "text" ? (
          <>
            {/* двор: панельный дом и тополь */}
            <rect x={40} y={40} width={420} height={260} fill="#E9E0D2" />
            {[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((k) => <rect key={`${r}-${k}`} x={60 + k * 80} y={60 + r * 80} width={46} height={50} rx={3} fill="#B9CCE2" />))}
            <ellipse cx={560} cy={150} rx={42} ry={140} fill="#6FAF63" />
            <rect x={554} y={230} width={12} height={80} fill="#7A5A44" />
          </>
        ) : (
          <>
            {/* улица по дороге: ряд тополей и горы вдали, машина в кармане у обочины */}
            <path d="M 0 150 L 160 70 L 300 140 L 470 50 L 640 130 L 900 60 L 900 300 L 0 300 Z" fill="#C9D9EA" />
            {[60, 170, 280, 390, 500, 610].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy={170} rx={30} ry={110} fill="#6FAF63" />
                <rect x={x - 5} y={250} width={10} height={55} fill="#7A5A44" />
              </g>
            ))}
          </>
        )}
        {/* знак P */}
        <rect x={812} y={150} width={8} height={160} fill="#8A94A6" />
        <rect x={786} y={96} width={60} height={60} rx={10} fill="#2C6FD1" />
        <text x={816} y={142} textAnchor="middle" fontFamily="Nunito" fontWeight={900} fontSize={42} fill="#FFFFFF">
          P
        </text>
        {/* тротуар и бордюр */}
        <rect x={0} y={300} width={900} height={40} fill="#D7DCE3" />
        <rect x={0} y={336} width={900} height={10} fill="#B9C1CC" />
        <rect x={0} y={346} width={900} height={200} fill="#9EA7B4" />
        {/* машина (вид сбоку, стоит) */}
        <g transform={`translate(110 ${Math.round(h / S - 360)}) scale(0.82)`}>
          <ellipse cx={380} cy={318} rx={360} ry={16} fill="rgba(20,30,60,0.22)" />
          <path
            d="M 10 230 Q 6 186 52 176 L 160 160 L 250 80 Q 270 60 300 60 L 520 60 Q 552 60 574 82 L 660 160 L 718 172 Q 750 180 750 220 L 750 262 Q 750 286 726 286 L 30 286 Q 10 286 10 266 Z"
            fill="#FFFFFF"
            stroke="#BCC8DA"
            strokeWidth={5}
          />
          {/* окна */}
          <path d="M 186 162 L 262 92 Q 276 80 296 80 L 392 80 L 392 162 Z" fill="#CFE6F7" />
          <path d="M 406 80 L 516 80 Q 540 80 556 96 L 626 162 L 406 162 Z" fill="#CFE6F7" />
          {/* ребёнок сзади, пристёгнут */}
          <g opacity={kid}>
            <circle cx={300} cy={120} r={26} fill={C.skin} />
            <path d="M 274 116 Q 300 84 326 116 Q 312 102 300 104 Q 288 102 274 116 Z" fill="#3B2A20" />
            <path d="M 266 162 Q 300 140 334 162 Z" fill="#F1B830" />
            <path d="M 278 140 L 326 162" stroke="#2B3550" strokeWidth={7} strokeLinecap="round" />
          </g>
          {/* водитель: держит телефон двумя руками */}
          <circle cx={500} cy={112} r={30} fill={C.skin} />
          <path d="M 470 106 Q 500 74 530 106 Q 512 92 470 106 Z" fill="#2B2B2B" />
          <path d="M 456 162 Q 500 134 544 162 Z" fill="#33507F" />
          <path d="M 470 150 L 530 162" stroke="#2B3550" strokeWidth={6} strokeLinecap="round" />
          <g transform={`translate(${468 + thumb * 0.3} ${128})`}>
            <rect x={0} y={0} width={30} height={46} rx={6} fill="#1D2233" transform="rotate(-20)" />
            <rect x={3} y={4} width={24} height={36} rx={4} fill="#BFE8FF" transform="rotate(-20)" />
          </g>
          {/* руль */}
          <path d="M 590 110 L 600 150" stroke="#2F3A52" strokeWidth={12} strokeLinecap="round" />
          <path d="M 400 60 L 400 284" stroke="#E2E8F2" strokeWidth={5} />
          <path d="M 30 220 L 740 220" stroke="#EEF2F8" strokeWidth={4} />
          <rect x={712} y={196} width={32} height={16} rx={6} fill="#FFE27A" />
          {/* колёса (неподвижны) */}
          {[160, 600].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={286} r={50} fill="#2B3550" />
              <circle cx={cx} cy={286} r={22} fill="#DCE3EE" />
            </g>
          ))}
        </g>
      </svg>
      {/* экран телефона водителя крупно: набор и отправка */}
      <div
        style={abs({
          left: 20 * S,
          top: 16 * S,
          width: 440 * S,
          padding: `${16 * S}px`,
          borderRadius: 26 * S,
          background: "#FFFFFF",
          boxShadow: "0 10px 26px rgba(20,40,90,0.22)",
          opacity: 1 - sent,
          transform: `translateY(${-sent * 40}px)`,
        })}
      >
        {mode === "text" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 * S }}>
            <div style={{ flex: 1, minHeight: 64 * S, padding: `${10 * S}px ${18 * S}px`, borderRadius: 32 * S, background: "#F1F3F6", display: "flex", alignItems: "center", ...font(36 * S, 800, "#1E2A3A") }}>
              {shown}
              {typing < 1 ? <span style={{ width: 4 * S, height: 38 * S, marginLeft: 2, background: Math.floor(f / 8) % 2 ? "#1F7A5C" : "transparent" }} /> : null}
            </div>
            <div style={{ width: 70 * S, height: 70 * S, borderRadius: 35 * S, background: C.chatHead, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${typing >= 1 ? 1.12 - 0.12 * Math.min(1, sent * 4) : 1})` }}>
              <svg width={36 * S} height={36 * S} viewBox="0 0 48 48">
                <path d="M6 22 L42 6 L30 42 L24 27 Z" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 14 * S }}>
            <svg width={56 * S} height={56 * S} viewBox="0 0 48 48">
              <path d="M24 44 Q8 28 8 18 Q8 4 24 4 Q40 4 40 18 Q40 28 24 44 Z" fill="#D9473A" />
              <circle cx={24} cy={18} r={6} fill="#FFFFFF" />
            </svg>
            <div style={{ flex: 1, ...font(32 * S, 900, "#1E2A3A") }}>{text}</div>
            <div style={{ width: 70 * S, height: 70 * S, borderRadius: 35 * S, background: C.chatHead, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${typing >= 1 ? 1.12 - 0.12 * Math.min(1, sent * 4) : 1})` }}>
              <svg width={36 * S} height={36 * S} viewBox="0 0 48 48">
                <path d="M6 22 L42 6 L30 42 L24 27 Z" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        )}
      </div>
      {label ? (
        <div style={abs({ left: 18 * S, bottom: 12 * S, padding: `${6 * S}px ${20 * S}px`, borderRadius: 999, background: C.navy, ...font(36 * S, 900, "#FFFFFF") })}>{label}</div>
      ) : null}
      {parkedLabel ? (
        <div style={abs({ right: 18 * S, bottom: 12 * S, padding: `${6 * S}px ${18 * S}px`, borderRadius: 999, background: "#FFFFFF", display: "flex", alignItems: "center", gap: 10 * S, ...font(31 * S, 900, "#2C6FD1") })}>
          <svg width={34 * S} height={34 * S} viewBox="0 0 48 48">
            <rect x={3} y={3} width={42} height={42} rx={10} fill="#2C6FD1" />
            <path d="M17 36 L17 12 L26 12 Q34 12 34 20 Q34 28 26 28 L17 28" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
          </svg>
          {parkedLabel}
        </div>
      ) : null}
    </div>
  );
};
