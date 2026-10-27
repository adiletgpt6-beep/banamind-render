// Рабочий уголок папы-программиста в бишкекской квартире, день: светлая
// стена, окно на панельные дома и горы Ала-Тоо, доска с нерешённой схемой
// задачи, часы и листок «Сабак бүтөт 12:30», пробковая доска с жёлтым
// стикером «Мектеп: күн сайын», дверь в коридор. Стол стоит лицом к
// зрителю: ноутбук повёрнут к папе (виден задний край крышки), экран
// подсвечивает его лицо.
// Мир — px; пол (низ стены) — y = OFFICE.floorY. Координаты одинаковы во
// всех планах.
import { fontFamily } from "../../../fonts";
import { BG10_TEXT } from "../script";
import { box } from "../shots";
import { Mountains, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const OFFICE = {
  floorY: 1700,
  window: { x: 230, y: 440, w: 470, h: 620 },
  board: { x: 1330, y: 560, w: 470, h: 330 },
  clock: { x: 1420, y: 400, r: 74 },
  timetable: { x: 1530, y: 330, w: 250, h: 150 },
  cork: { x: 640, y: 850, w: 230, h: 200 },
  note: { x: 756, y: 952 },
  door: { x: 1880, y: 760, w: 300, h: 940 },
  desk: { x: 760, y: 1290, w: 760, h: 410 },
  chair: { x: 1080 },
  seat: 470, // высота сиденья (px мира от пола)
  laptop: { x: 1150, y: 1290, w: 380, h: 250 },
  phone: { x: 880, y: 1278 },
  dadX: 1080,
} as const;

export const YELLOW = "#FFC727";
export const NAVY = "#1F2D55";

// Стена, окно, доска, часы, пробковая доска, дверь, пол.
export const OfficeBack: React.FC<{
  readonly minutes: number; // время на часах (мин от полуночи)
  readonly doorOpen?: number;
  readonly noteOn?: boolean; // стикер на пробковой доске
  readonly light?: number; // 0 — полдень, 1 — после обеда (теплее)
}> = ({ minutes, doorOpen = 0, noteOn = true, light = 0 }) => {
  const w = OFFICE.window;
  const d = OFFICE.door;
  const b = OFFICE.board;
  const t = OFFICE.timetable;
  const c = OFFICE.cork;
  return (
    <div style={box({ left: 0, top: 0, width: 2400, height: 2600 })}>
      {/* стена, плинтус, пол */}
      <div style={box({ left: -600, top: -400, width: 3600, height: OFFICE.floorY + 400, background: "linear-gradient(180deg, #F7F4EE 0%, #EFE9DE 100%)" })} />
      <div style={box({ left: -600, top: -400, width: 3600, height: OFFICE.floorY + 400, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 70px, transparent 70px 140px)" })} />
      <div style={box({ left: -600, top: OFFICE.floorY - 24, width: 3600, height: 24, backgroundColor: "#DCD2C2" })} />
      <div style={box({ left: -600, top: OFFICE.floorY, width: 3600, height: 900, background: "linear-gradient(180deg, #CDB08C 0%, #BC9B74 100%)" })} />
      <div style={box({ left: -600, top: OFFICE.floorY, width: 3600, height: 900, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 4px, transparent 4px 200px)" })} />
      {/* окно: дневной Бишкек — горы, тополя, панельные дома */}
      <div style={box({ left: w.x - 22, top: w.y - 22, width: w.w + 44, height: w.h + 44, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(60,50,30,0.12)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", background: `linear-gradient(180deg, ${light > 0.5 ? "#9EC3E6" : "#A9D0F2"} 0%, #E4F1FB 70%)` })}>
        <Mountains x={-40} y={210} w={560} h={200} />
        <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: "scale(0.45)", transformOrigin: "0 0" })}>
          <PanelHouse x={-60} y={1380} w={560} floors={7} color="#E2D6C2" seed={5} />
          <PanelHouse x={560} y={1430} w={520} floors={6} color="#D6E0E8" seed={9} />
          <Tree x={520} y={1400} s={1.3} kind="poplar" />
          <Tree x={980} y={1420} s={1.1} kind="poplar" />
        </div>
        <div style={box({ left: 0, top: 0, width: w.w, height: w.h, backgroundColor: `rgba(255,200,120,${0.12 * light})` })} />
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.4, width: w.w, height: 14, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 40, top: w.y + w.h + 16, width: w.w + 80, height: 28, borderRadius: 6, backgroundColor: "#F2EEE6" })} />
      {/* доска с нерешённой схемой задачи */}
      <div style={box({ left: b.x - 14, top: b.y - 14, width: b.w + 28, height: b.h + 28, borderRadius: 12, backgroundColor: "#C9CED8" })} />
      <div style={box({ left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
      <svg width={b.w} height={b.h} viewBox={`0 0 ${b.w} ${b.h}`} style={box({ left: b.x, top: b.y })}>
        <text x={24} y={46} fontFamily={fontFamily} fontWeight={800} fontSize={30} fill={NAVY}>
          {BG10_TEXT.office.board}
        </text>
        <rect x={30} y={90} width={110} height={60} rx={10} fill="none" stroke="#4C5FD5" strokeWidth={5} />
        <rect x={190} y={90} width={110} height={60} rx={10} fill="none" stroke="#4C5FD5" strokeWidth={5} />
        <rect x={110} y={210} width={110} height={60} rx={10} fill="none" stroke="#4C5FD5" strokeWidth={5} />
        <path d="M 140 120 L 186 120 M 85 152 L 150 206 M 245 152 L 180 206" stroke="#4C5FD5" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 300 120 C 360 120 380 200 330 230" stroke="#E2574C" strokeWidth={5} fill="none" strokeDasharray="10 12" strokeLinecap="round" />
        <text x={360} y={260} fontFamily={fontFamily} fontWeight={900} fontSize={84} fill="#E2574C">
          ?
        </text>
      </svg>
      <div style={box({ left: b.x + 60, top: b.y + b.h + 6, width: 130, height: 14, borderRadius: 7, backgroundColor: "#AEB4C0" })} />
      {/* часы и листок со временем окончания уроков */}
      <WallClock x={OFFICE.clock.x} y={OFFICE.clock.y} r={OFFICE.clock.r} minutes={minutes} />
      <div style={box({ left: t.x, top: t.y, width: t.w, height: t.h, borderRadius: 8, backgroundColor: "#FFFFFF", border: "4px solid #E3E6EE", boxShadow: "0 6px 12px rgba(40,50,80,0.10)", boxSizing: "border-box", fontFamily, color: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" })}>
        <div style={{ fontSize: 30, fontWeight: 800 }}>{BG10_TEXT.office.timetable}</div>
        <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.05 }}>{BG10_TEXT.office.timetableTime}</div>
      </div>
      <div style={box({ left: t.x + t.w / 2 - 14, top: t.y - 10, width: 28, height: 28, borderRadius: 14, backgroundColor: "#E2574C" })} />
      {/* пробковая доска и стикер «Мектеп: күн сайын» */}
      <div style={box({ left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 10, backgroundColor: "#C79A68", border: "10px solid #9C7244", boxSizing: "border-box" })} />
      <div style={box({ left: c.x + 26, top: c.y + 30, width: 70, height: 52, backgroundColor: "#DDEBF7", transform: "rotate(-6deg)" })} />
      {noteOn ? <StickyNote x={OFFICE.note.x} y={OFFICE.note.y} rot={4} /> : null}
      {/* дверь в коридор */}
      <div style={box({ left: d.x - 18, top: d.y - 18, width: d.w + 36, height: d.h + 18, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#6A5C50" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w * (1 - 0.78 * doorOpen), height: d.h, backgroundColor: "#D9C3A3", boxShadow: "inset 0 0 0 10px #C8AE8A" })} />
      <div style={box({ left: d.x + d.w * (1 - 0.78 * doorOpen) - 48, top: d.y + d.h * 0.52, width: 22, height: 22, borderRadius: 11, backgroundColor: "#8F7A5E" })} />
      {/* растение у окна */}
      <Plant x={150} y={OFFICE.floorY} />
    </div>
  );
};

// Жёлтый стикер «Мектеп: күн сайын» (центр x, y; размер 150×130).
export const StickyNote: React.FC<{ x: number; y: number; rot?: number; scale?: number; lift?: number }> = ({ x, y, rot = 0, scale = 1, lift = 0 }) => (
  <div
    style={box({
      left: x - 75,
      top: y - 65,
      width: 150,
      height: 130,
      transform: `rotate(${rot}deg) scale(${scale})`,
      backgroundColor: YELLOW,
      boxShadow: `0 ${4 + 14 * lift}px ${8 + 16 * lift}px rgba(60,50,20,${0.18 + 0.1 * lift})`,
      fontFamily,
      color: NAVY,
      fontWeight: 900,
      fontSize: 27,
      lineHeight: 1.1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 10,
      boxSizing: "border-box",
    })}
  >
    {BG10_TEXT.office.note}
  </div>
);

const Plant: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={260} height={460} viewBox="0 0 260 460" style={box({ left: x - 130, top: y - 460, overflow: "visible" })}>
    <path d="M 130 330 C 60 260 30 170 54 90 C 96 150 120 230 130 330 Z" fill="#5E9A6A" />
    <path d="M 130 330 C 186 250 214 160 204 76 C 162 140 140 230 130 330 Z" fill="#4E8A5C" />
    <path d="M 130 330 C 108 240 118 130 140 44 C 162 130 152 240 130 330 Z" fill="#6FAE77" />
    <path d="M 76 330 L 184 330 L 168 460 L 92 460 Z" fill="#F2F2F2" />
    <rect x={68} y={322} width={124} height={22} rx={6} fill="#E2E2E2" />
  </svg>
);

// Офисный стул (за папой): спинка видна над его плечами только сбоку.
export const Chair: React.FC<{ x: number }> = ({ x }) => (
  <svg width={360} height={900} viewBox="0 0 360 900" style={box({ left: x - 180, top: OFFICE.floorY - 900, overflow: "visible" })}>
    <rect x={60} y={150} width={240} height={330} rx={60} fill="#3A4466" />
    <rect x={80} y={170} width={200} height={290} rx={50} fill="#46517A" />
    <rect x={160} y={460} width={40} height={100} fill="#2E3550" />
    <rect x={40} y={420} width={280} height={60} rx={24} fill="#3A4466" />
    <rect x={168} y={560} width={24} height={260} fill="#5B6175" />
    <path d="M 60 860 L 180 800 L 300 860" stroke="#5B6175" strokeWidth={22} fill="none" strokeLinecap="round" />
    <circle cx={60} cy={872} r={20} fill="#2E3550" />
    <circle cx={300} cy={872} r={20} fill="#2E3550" />
    <circle cx={180} cy={880} r={18} fill="#2E3550" />
  </svg>
);

// Стол лицом к зрителю: столешница и передняя панель (закрывает ноги).
export const Desk: React.FC = () => {
  const d = OFFICE.desk;
  return (
    <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h })}>
      <div style={box({ left: -10, top: 0, width: d.w + 20, height: 34, borderRadius: 8, backgroundColor: "#F5F0E8", boxShadow: "0 4px 0 #E2D9CB" })} />
      <div style={box({ left: 30, top: 34, width: d.w - 60, height: d.h - 34, backgroundColor: "#E9E1D4" })} />
      <div style={box({ left: 30, top: 34, width: 26, height: d.h - 34, backgroundColor: "#D9CFBF" })} />
      <div style={box({ left: d.w - 56, top: 34, width: 26, height: d.h - 34, backgroundColor: "#D9CFBF" })} />
      <div style={box({ left: 80, top: 70, width: d.w - 160, height: 120, borderRadius: 10, backgroundColor: "#F1EBE1" })} />
      <div style={box({ left: d.w / 2 - 50, top: 120, width: 100, height: 16, borderRadius: 8, backgroundColor: "#CDBFA9" })} />
    </div>
  );
};

// Ноутбук (вид сзади): open 0…1 — крышка откинута / закрыта; glow — свет
// экрана на лице папы (рисуется отдельно в сцене).
export const Laptop: React.FC<{ readonly open: number }> = ({ open }) => {
  const l = OFFICE.laptop;
  const h = Math.max(6, l.h * open);
  return (
    <div style={box({ left: l.x - l.w / 2, top: l.y - h - 10, width: l.w, height: h + 14 })}>
      <div style={box({ left: 0, top: 0, width: l.w, height: h, borderRadius: "16px 16px 4px 4px", background: "linear-gradient(180deg, #D5DAE3 0%, #C3C9D4 100%)", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.05)" })} />
      {open > 0.4 ? <div style={box({ left: l.w / 2 - 24, top: h * 0.42 - 24, width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.65)", opacity: (open - 0.4) / 0.6 })} /> : null}
      <div style={box({ left: -26, top: h - 2, width: l.w + 52, height: 14, borderRadius: 7, backgroundColor: "#AEB5C2" })} />
    </div>
  );
};

// Свет экрана ноутбука на лице и плечах (голубоватый ореол).
export const ScreenGlow: React.FC<{ readonly x: number; readonly y: number; readonly a: number }> = ({ x, y, a }) =>
  a > 0 ? <div style={box({ left: x - 260, top: y - 220, width: 520, height: 440, borderRadius: 260, background: "radial-gradient(circle, rgba(170,210,255,0.35), rgba(170,210,255,0) 70%)", opacity: a })} /> : null;
