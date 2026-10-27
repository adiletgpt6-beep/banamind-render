// Офис мамы в Бишкеке (понедельник, около полудня): светлая стена,
// окно на горы Ала-Тоо, панельные дома и тополя, настенные часы,
// отрывной календарь «ДҮЙШӨМБҮ», стеллаж с папками, растение. Мама сидит
// в офисном кресле боком к столу; ноутбук стоит экраном к зрителю.
// Мир — px; пол (низ стены) — OFFICE.floorY. Слои: OfficeBack → Chair →
// мама (layer "body") → Desk (стол, ноутбук, телефон) → мама ("arms").
// Надписи в зеркальной половине читаются нормально (Unflip).
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { clamp, easeOut } from "../rig/motion";
import { box, Unflip } from "../shots";
import { Mountains, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const OFFICE = {
  floorY: 1600,
  window: { x: -650, y: 360, w: 420, h: 600 },
  calendar: { x: -30, y: 480, w: 210, h: 200 },
  clock: { x: 290, y: 570, r: 64 },
  shelf: { x: 660, y: 700, w: 280 },
  desk: { x: 0, w: 470, top: 1150 },
  laptop: { x: 235, y: 1150 },
  phone: { x: 52, y: 1150 },
  chair: { x: -60, seat: 1318 },
  mom: { x: -40, seat: 282 },
} as const;

// Стена, окно, часы, календарь, стеллаж, растение, пол.
export const OfficeBack: React.FC<{ readonly minutes: number; readonly f: number; readonly day: string }> = ({ minutes, f, day }) => {
  const w = OFFICE.window;
  const cal = OFFICE.calendar;
  const sh = OFFICE.shelf;
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      {/* стена и пол */}
      <div style={box({ left: -1600, top: -900, width: 3600, height: OFFICE.floorY + 900, background: "linear-gradient(180deg, #FFFFFF 0%, #F9F6EF 72%, #F1EBDD 100%)" })} />
      <div style={box({ left: -1600, top: 1250, width: 3600, height: 14, backgroundColor: C.yellowSoft })} />
      <div style={box({ left: -1600, top: OFFICE.floorY - 20, width: 3600, height: 20, backgroundColor: "#FFFFFF", boxShadow: "0 -2px 0 #E4DED0" })} />
      <div style={box({ left: -1600, top: OFFICE.floorY, width: 3600, height: 1200, background: "linear-gradient(180deg, #D9DEE6 0%, #C9CFD9 100%)" })} />
      <div style={box({ left: -1600, top: OFFICE.floorY, width: 3600, height: 1200, backgroundImage: "repeating-linear-gradient(90deg, rgba(40,50,80,0.05) 0 3px, transparent 3px 200px)" })} />

      {/* окно: полдень в Бишкеке */}
      <div style={box({ left: w.x - 22, top: w.y - 22, width: w.w + 44, height: w.h + 44, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(60,50,30,0.12)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", background: "linear-gradient(180deg, #BFDDF3 0%, #E3EEF5 62%, #FBF0DA 100%)" })}>
        <Mountains x={-30} y={150} w={500} h={190} />
        <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: "scale(0.42)", transformOrigin: "0 0" })}>
          <PanelHouse x={-80} y={1400} w={520} floors={6} color="#E8DDCC" seed={3} />
          <PanelHouse x={540} y={1440} w={460} floors={7} color="#EEE5D7" seed={8} />
          <Tree x={470} y={1420} s={1.25} kind="poplar" />
          <Tree x={960} y={1440} s={1.05} kind="poplar" />
        </div>
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.4, width: w.w, height: 14, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 36, top: w.y + w.h + 16, width: w.w + 72, height: 26, borderRadius: 6, backgroundColor: "#F1ECE2" })} />
      {/* жалюзи — тонкие полосы сверху */}
      <div style={box({ left: w.x - 10, top: w.y - 40, width: w.w + 20, height: 120, borderRadius: "0 0 10px 10px", backgroundImage: "repeating-linear-gradient(180deg, #FFF8E2 0 12px, #F3E7C4 12px 15px)", boxShadow: "0 6px 12px rgba(60,50,30,0.08)" })} />

      {/* отрывной календарь: один и тот же понедельник */}
      <div style={box({ left: cal.x - cal.w / 2, top: cal.y, width: cal.w, height: cal.h, borderRadius: 16, backgroundColor: "#FFFFFF", boxShadow: "0 10px 22px rgba(20,40,90,0.14)", overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: cal.w, height: 66, backgroundColor: C.navy })} />
        {[0.25, 0.5, 0.75].map((k) => (
          <div key={k} style={box({ left: cal.w * k - 8, top: -6, width: 16, height: 34, borderRadius: 8, backgroundColor: "#C9D2E2" })} />
        ))}
      </div>
      <Unflip style={{ left: cal.x - cal.w / 2, top: cal.y + 70, width: cal.w, height: cal.h - 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily, color: C.navy }}>
        <div style={{ width: 120, height: 10, borderRadius: 5, backgroundColor: C.yellow, marginBottom: 18 }} />
        <div style={{ fontSize: 31, fontWeight: 900, letterSpacing: 0.3 }}>{day}</div>
      </Unflip>

      {/* часы (идут одинаково в обеих половинах) */}
      <Unflip style={{ left: OFFICE.clock.x - OFFICE.clock.r, top: OFFICE.clock.y - OFFICE.clock.r, width: OFFICE.clock.r * 2, height: OFFICE.clock.r * 2 }}>
        <WallClock x={OFFICE.clock.r} y={OFFICE.clock.r} r={OFFICE.clock.r} minutes={minutes} />
      </Unflip>

      {/* стеллаж с папками */}
      <div style={box({ left: sh.x, top: sh.y, width: sh.w, height: 18, borderRadius: 6, backgroundColor: "#D7C3A3" })} />
      <div style={box({ left: sh.x, top: sh.y + 230, width: sh.w, height: 18, borderRadius: 6, backgroundColor: "#D7C3A3" })} />
      {["#6E86B8", C.yellow, "#9DB4D8", "#E7D6B0", "#4C6A9E"].map((c, i) => (
        <div key={i} style={box({ left: sh.x + 20 + i * 48, top: sh.y - 170 + (i % 2) * 10, width: 40, height: 170 - (i % 2) * 10, borderRadius: 6, backgroundColor: c })} />
      ))}
      {["#E7D6B0", "#6E86B8", "#C9D6EE"].map((c, i) => (
        <div key={i} style={box({ left: sh.x + 30 + i * 70, top: sh.y + 80, width: 58, height: 150, borderRadius: 8, backgroundColor: c })} />
      ))}
      {/* растение в кадке */}
      <svg width={260} height={460} viewBox="0 0 240 420" style={box({ left: 720, top: OFFICE.floorY - 450, overflow: "visible" })}>
        <path d="M 120 300 C 60 240 30 160 50 90 C 90 140 110 210 120 300 Z" fill="#5E9A6A" />
        <path d="M 120 300 C 170 230 200 150 190 70 C 150 130 130 210 120 300 Z" fill="#4E8A5C" />
        <path d="M 120 300 C 100 220 110 120 130 40 C 150 120 140 220 120 300 Z" fill="#6FAE77" />
        <path d="M 70 300 L 170 300 L 156 420 L 84 420 Z" fill="#FFFFFF" stroke="#E3DDD0" strokeWidth={4} />
      </svg>
      {/* свет из окна */}
      <div style={box({ left: -900, top: 0, width: 1400, height: 2400, background: "radial-gradient(ellipse at 50% 30%, rgba(255,244,214,0.4), transparent 60%)", opacity: 0.9 + 0.1 * Math.sin(f / 40) })} />
    </div>
  );
};

// Офисное кресло (сбоку): спинка за мамой, сиденье, газлифт, колёса.
// bag — сумка висит на спинке (0 — её уже забрали).
export const Chair: React.FC<{ readonly x?: number; readonly spin?: number; readonly bag?: number }> = ({ x = OFFICE.chair.x, spin = 0, bag = 0 }) => {
  const s = OFFICE.chair.seat;
  const F = OFFICE.floorY;
  const sw = Math.cos(spin);
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g transform={`translate(${x} 0)`}>
        {/* колёса и крестовина */}
        <path d={`M ${-120 * sw} ${F - 26} L ${120 * sw} ${F - 26}`} stroke="#3A4152" strokeWidth={16} strokeLinecap="round" />
        {[-120, 0, 120].map((k) => (
          <circle key={k} cx={k * sw} cy={F - 14} r={14} fill="#262B36" />
        ))}
        <rect x={-9} y={s + 20} width={18} height={F - s - 46} fill="#8B93A3" />
        {/* сиденье */}
        <rect x={-130 * Math.max(0.35, Math.abs(sw))} y={s} width={260 * Math.max(0.35, Math.abs(sw))} height={36} rx={18} fill="#2F3E63" />
        {/* спинка (позади) */}
        <rect x={-150 + 40 * (1 - sw)} y={s - 360} width={70} height={330} rx={30} fill="#3A4C78" />
        <rect x={-122 + 40 * (1 - sw)} y={s - 40} width={14} height={60} fill="#3A4C78" />
        {bag > 0.01 ? (
          <g opacity={bag}>
            <path d={`M ${-150 + 40 * (1 - sw)} ${s - 330} Q ${-200} ${s - 260} ${-180} ${s - 170}`} stroke="#7A4E3A" strokeWidth={8} fill="none" />
            <rect x={-230} y={s - 190} width={120} height={140} rx={22} fill="#B9785A" />
            <rect x={-230} y={s - 190} width={120} height={36} rx={18} fill="#A2654B" />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// Ноутбук на столе (экран к зрителю): видеовстреча — четыре окна
// с коллегами. open 0…1 — крышка закрывается (экран складывается).
// type — мама печатает (клавиши мигают). scr — содержимое экрана вместо встречи.
export const Laptop: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly f: number;
  readonly open?: number;
  readonly title: string;
  readonly glow?: number;
  readonly screen?: React.ReactNode;
}> = ({ x, y, f, open = 1, title, glow = 0, screen }) => {
  const W = 280;
  const H = 186 * open;
  const talk = (k: number) => 0.55 + 0.45 * Math.abs(Math.sin((f + k * 13) / 5));
  const sway = (k: number) => Math.sin((f + k * 21) / 18) * 3;
  return (
    <div style={box({ left: x - W / 2, top: y - H - 14, width: W, height: H + 30 })}>
      <div style={box({ left: 0, top: 0, width: W, height: H, borderRadius: 14, backgroundColor: "#2B2F3C", overflow: "hidden", boxShadow: glow ? `0 0 ${40 * glow}px rgba(255,201,14,${0.5 * glow})` : undefined })}>
        {open > 0.3 ? (
          <Unflip style={{ left: 10, top: 10, right: 10, bottom: 10, borderRadius: 8, backgroundColor: "#EEF2F8", opacity: clamp((open - 0.3) / 0.3), overflow: "hidden", fontFamily }}>
            {screen ?? (
              <>
                <div style={box({ left: 10, top: 4, fontSize: 22, fontWeight: 900, color: C.navy })}>{title}</div>
                <div style={box({ right: 12, top: 12, width: 14, height: 14, borderRadius: 7, backgroundColor: "#E25B4E", opacity: 0.6 + 0.4 * Math.sin(f / 6) })} />
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} style={box({ left: 8 + (k % 2) * 126, top: 36 + Math.floor(k / 2) * 66, width: 118, height: 60, borderRadius: 8, backgroundColor: ["#C9D6EE", "#F4E2B8", "#D7E8DA", "#E6D6EE"][k], overflow: "hidden" })}>
                    <div style={box({ left: 40, top: 6 + sway(k) * 0.3, width: 36, height: 36, borderRadius: 18, backgroundColor: ["#6E5848", "#3E3230", "#8B6B55", "#4B3A33"][k], translate: `${sway(k)}px 0` })} />
                    <div style={box({ left: 33, top: 38, width: 50, height: 26, borderRadius: "28px 28px 0 0", backgroundColor: ["#4C6EA8", "#C08A3E", "#4E8A5C", "#7E5BA0"][k], translate: `${sway(k)}px 0` })} />
                    {k === 1 ? <div style={box({ left: 8, bottom: 6, width: 32, height: 6, borderRadius: 3, backgroundColor: C.green, scale: `${talk(k)} 1`, transformOrigin: "0 50%" })} /> : null}
                  </div>
                ))}
              </>
            )}
          </Unflip>
        ) : null}
      </div>
      <div style={box({ left: -24, top: H, width: W + 48, height: 18, borderRadius: "4px 4px 12px 12px", backgroundColor: "#BCC3CF" })} />
      <div style={box({ left: W / 2 - 40, top: H + 2, width: 80, height: 6, borderRadius: 3, backgroundColor: "#A6AEBB" })} />
    </div>
  );
};

// Телефон, лежащий на столе (вид сбоку — тонкая плашка), вибрирует и
// светится; над ним всплывает напоминание (кыргызча, читается в зеркале).
export const DeskPhone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly f: number;
  readonly buzz: number; // 0…1
  readonly hidden?: boolean;
}> = ({ x, y, f, buzz, hidden }) => {
  if (hidden) return null;
  const shake = buzz * Math.sin(f * 2.6) * 5;
  return (
    <div style={box({ left: x - 70 + shake, top: y - 14, width: 140, height: 14, borderRadius: 7, backgroundColor: "#1E2235", boxShadow: buzz ? `0 -6px ${24 * buzz}px rgba(255,201,14,${0.7 * buzz})` : undefined })}>
      <div style={box({ left: 8, top: 2, width: 124, height: 5, borderRadius: 3, backgroundColor: buzz > 0.1 ? "#BFD8F2" : "#2C3B5C" })} />
    </div>
  );
};

// Всплывающее напоминание (как уведомление телефона) — в мире над телефоном.
export const ReminderPop: React.FC<{ readonly x: number; readonly y: number; readonly a: number; readonly time: string; readonly text: string }> = ({ x, y, a, time, text }) => {
  if (a <= 0.01) return null;
  const e = easeOut(a);
  return (
    <Unflip
      style={{
        left: x - 210,
        top: y - 150 - 30 * e,
        width: 420,
        opacity: e,
        transform: `scale(${0.7 + 0.3 * e})`,
        padding: "14px 18px",
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        border: `4px solid ${C.yellow}`,
        boxShadow: "0 14px 30px rgba(20,40,90,0.18)",
        fontFamily,
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      <svg width={46} height={46} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={48} fill={C.yellow} />
        <path d="M 50 22 C 34 22 30 36 30 48 L 30 62 L 24 70 L 76 70 L 70 62 L 70 48 C 70 36 66 22 50 22 Z" fill={C.navy} />
        <circle cx={50} cy={78} r={7} fill={C.navy} />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: C.navy }}>{time}</span>
        <span style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>{text}</span>
      </div>
    </Unflip>
  );
};

// Стол: столешница, ножки, ноутбук, телефон, блокнот.
export const Desk: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <div style={box({ left: d.x, top: d.top, width: d.w, height: 30, borderRadius: 8, backgroundColor: "#E3CFAD", boxShadow: "0 6px 0 #CDB48C" })} />
      <div style={box({ left: d.x + 34, top: d.top + 30, width: 24, height: OFFICE.floorY - d.top - 30, backgroundColor: "#C6AE86" })} />
      <div style={box({ left: d.x + d.w - 58, top: d.top + 30, width: 24, height: OFFICE.floorY - d.top - 30, backgroundColor: "#C6AE86" })} />
      {/* тумба */}
      <div style={box({ left: d.x + d.w - 230, top: d.top + 30, width: 170, height: OFFICE.floorY - d.top - 30, borderRadius: "0 0 8px 8px", backgroundColor: "#EADCC2" })}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: 14, right: 14, top: 18 + i * 140, height: 120, borderRadius: 8, border: "4px solid #D9C6A2", boxSizing: "border-box" })}>
            <div style={box({ left: 52, top: 50, width: 50, height: 10, borderRadius: 5, backgroundColor: "#B79E76" })} />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};
