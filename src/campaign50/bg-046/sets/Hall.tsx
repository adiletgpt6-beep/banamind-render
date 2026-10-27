// Прихожая бишкекской квартиры утром: светло-голубая стена с белыми
// панелями, тёмно-синяя входная дверь (закрыта), крючки с маминым пальто,
// отрывной календарь, стул у двери, на котором ночует рюкзак, окно с
// горами Ала-Тоо и тополями, настенные часы. Мир — px; пол — HALL.floorY.
import { C } from "../palette";
import { box } from "../shots";
import { Mountains, Ornament, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const HALL = {
  floorY: 1500,
  door: { x: 110, y: 500, w: 340, h: 1000 },
  hooks: { x: 560, y: 760 },
  calendar: { x: 640, y: 470 },
  chair: { x: 1010, seat: 1150 },
  clock: { x: 1010, y: 560, r: 70 },
  window: { x: 1290, y: 420, w: 430, h: 560 },
  table: { x: 1820, w: 380, top: 1080 },
} as const;

// Отрывной календарь: день недели и число. flip 0…1 — верхний листок
// отрывается и улетает (смена дня).
export const TearCalendar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly day: string; readonly date: number; readonly next?: { day: string; date: number }; readonly flip?: number }> = ({ x, y, s = 1, day, date, next, flip = 0 }) => {
  const sheet = (d: string, n: number, extra?: React.CSSProperties) => (
    <div style={box({ left: 0, top: 44, width: 220, height: 230, borderRadius: "6px 6px 14px 14px", backgroundColor: "#FFFFFF", boxShadow: "0 4px 0 #E3E8F0", textAlign: "center", fontFamily: "Nunito", ...extra })}>
      <div style={{ marginTop: 18, fontSize: 92, fontWeight: 900, lineHeight: "100px", color: C.navy }}>{n}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: "#E0A100" }}>{d}</div>
    </div>
  );
  return (
    <div style={box({ left: x - 110 * s, top: y, width: 220, height: 290, transform: `scale(${s})`, transformOrigin: "0 0" })}>
      <div style={box({ left: 0, top: 0, width: 220, height: 284, borderRadius: 16, backgroundColor: C.navy, boxShadow: "0 10px 20px rgba(20,40,90,0.18)" })} />
      {next ? sheet(next.day, next.date) : null}
      {flip < 1
        ? sheet(day, date, {
            transformOrigin: "50% 0%",
            transform: `translateY(${-flip * 60}px) translateX(${flip * 160}px) rotate(${flip * 38}deg) rotateX(${flip * 70}deg)`,
            opacity: 1 - Math.max(0, flip - 0.6) * 2.5,
          })
        : null}
      <div style={box({ left: 24, top: 30, width: 172, height: 20, borderRadius: 10, backgroundColor: C.yellow })} />
    </div>
  );
};

export const HallBack: React.FC<{ readonly minutes: number; readonly calendar?: React.ReactNode; readonly light?: number }> = ({ minutes, calendar, light = 1 }) => {
  const w = HALL.window;
  const d = HALL.door;
  const fy = HALL.floorY;
  return (
    <div style={box({ left: 0, top: 0, width: 2400, height: 2600 })}>
      {/* стена: светло-голубая сверху, белые панели снизу */}
      <div style={box({ left: -900, top: -900, width: 4200, height: fy + 900, background: "linear-gradient(180deg, #E4EFFA 0%, #EEF5FB 60%, #F6F9FC 100%)" })} />
      <div style={box({ left: -900, top: -900, width: 4200, height: fy + 900, backgroundImage: "radial-gradient(circle at 20px 20px, rgba(20,40,90,0.05) 3px, transparent 4px)", backgroundSize: "80px 80px" })} />
      <div style={box({ left: -900, top: 1080, width: 4200, height: fy - 1080, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: -900, top: 1080, width: 4200, height: 18, backgroundColor: "#DCE7F3" })} />
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} style={box({ left: -880 + i * 200, top: 1140, width: 160, height: fy - 1200, borderRadius: 10, border: "5px solid #EAF0F7", boxSizing: "border-box" })} />
      ))}
      {/* пол — тёплый паркет */}
      <div style={box({ left: -900, top: fy - 20, width: 4200, height: 20, backgroundColor: "#FFFFFF", boxShadow: "0 -3px 0 #E2E8F0" })} />
      <div style={box({ left: -900, top: fy, width: 4200, height: 1200, background: "linear-gradient(180deg, #E2BF93 0%, #D2A776 100%)" })} />
      <div style={box({ left: -900, top: fy, width: 4200, height: 1200, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,55,25,0.08) 0 4px, transparent 4px 190px), repeating-linear-gradient(0deg, rgba(90,55,25,0.05) 0 3px, transparent 3px 70px)" })} />

      {/* входная дверь — закрыта */}
      <div style={box({ left: d.x - 28, top: d.y - 28, width: d.w + 56, height: d.h + 28, backgroundColor: "#FFFFFF", boxShadow: "0 0 0 3px #DCE5EF" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, background: "linear-gradient(90deg, #2C4684, #253C73)" })}>
        <div style={box({ left: 34, top: 70, width: d.w - 68, height: 380, border: "7px solid rgba(255,255,255,0.12)", borderRadius: 12, boxSizing: "border-box" })} />
        <div style={box({ left: 34, top: 510, width: d.w - 68, height: 420, border: "7px solid rgba(255,255,255,0.12)", borderRadius: 12, boxSizing: "border-box" })} />
        <div style={box({ left: d.w - 64, top: 470, width: 40, height: 14, borderRadius: 7, backgroundColor: "#E7C25A" })} />
        <div style={box({ left: d.w - 52, top: 500, width: 16, height: 26, borderRadius: 6, backgroundColor: "#C9A23F" })} />
        <div style={box({ left: d.w / 2 - 9, top: 260, width: 18, height: 18, borderRadius: 9, backgroundColor: "#E7C25A" })} />
      </div>
      {/* коврик-шырдак у двери */}
      <svg width={520} height={120} viewBox="0 0 520 120" style={box({ left: 30, top: fy + 40 })}>
        <rect x={6} y={10} width={512} height={108} rx={22} fill="rgba(30,30,40,0.12)" />
        <rect x={0} y={0} width={512} height={106} rx={22} fill={C.rug} />
        <rect x={12} y={12} width={488} height={82} rx={14} fill="none" stroke="#FFF1D0" strokeWidth={5} strokeDasharray="18 10" />
        <Ornament x={256} y={53} s={0.55} color="#FFF1D0" />
        <Ornament x={110} y={53} s={0.38} color="#FFF1D0" />
        <Ornament x={402} y={53} s={0.38} color="#FFF1D0" />
      </svg>

      {/* крючки: пальто мамы, шарф; полка для обуви */}
      <div style={box({ left: HALL.hooks.x, top: HALL.hooks.y, width: 250, height: 22, backgroundColor: "#E8DCC6", borderRadius: 6 })} />
      {[590, 670, 750].map((x) => (
        <div key={x} style={box({ left: x - 6, top: HALL.hooks.y + 12, width: 12, height: 30, backgroundColor: "#8C7A62", borderRadius: 6 })} />
      ))}
      <div style={box({ left: 560, top: HALL.hooks.y + 34, width: 110, height: 360, borderRadius: "36px 36px 16px 16px", backgroundColor: "#5E9A93" })} />
      <div style={box({ left: 560, top: HALL.hooks.y + 34, width: 110, height: 360, borderRadius: "36px 36px 16px 16px", backgroundImage: "linear-gradient(90deg, transparent 46%, rgba(0,0,0,0.12) 46% 54%, transparent 54%)" })} />
      <div style={box({ left: 690, top: HALL.hooks.y + 38, width: 54, height: 230, borderRadius: 20, backgroundColor: "#F2D06B" })} />
      <div style={box({ left: 540, top: fy - 150, width: 300, height: 16, borderRadius: 6, backgroundColor: "#E8DCC6" })} />
      <div style={box({ left: 552, top: fy - 134, width: 16, height: 134, backgroundColor: "#D7C7AB" })} />
      <div style={box({ left: 812, top: fy - 134, width: 16, height: 134, backgroundColor: "#D7C7AB" })} />
      <div style={box({ left: 590, top: fy - 196, width: 92, height: 46, borderRadius: "30px 30px 6px 6px", backgroundColor: "#3B3F52" })} />
      <div style={box({ left: 700, top: fy - 186, width: 76, height: 36, borderRadius: "26px 26px 6px 6px", backgroundColor: "#E8506A" })} />

      {calendar}

      <WallClock x={HALL.clock.x} y={HALL.clock.y} r={HALL.clock.r} minutes={minutes} />

      {/* окно: утренний Бишкек, горы Ала-Тоо, тополя */}
      <div style={box({ left: w.x - 24, top: w.y - 24, width: w.w + 48, height: w.h + 48, borderRadius: 12, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(40,60,90,0.12)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", background: "linear-gradient(180deg, #BFDDF3 0%, #E3EEF5 58%, #FFF0D2 100%)" })}>
        <Mountains x={-40} y={150} w={520} h={210} />
        <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: "scale(0.42)", transformOrigin: "0 0" })}>
          <PanelHouse x={-40} y={1300} w={520} floors={6} color="#EADFCB" seed={6} />
          <PanelHouse x={600} y={1340} w={460} floors={7} color="#F0E6D6" seed={2} />
          <Tree x={520} y={1320} s={1.25} kind="poplar" />
          <Tree x={980} y={1330} s={1.05} kind="poplar" />
        </div>
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.4, width: w.w, height: 14, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 40, top: w.y + w.h + 18, width: w.w + 80, height: 28, borderRadius: 6, backgroundColor: "#F3F6FA" })} />
      <div style={box({ left: w.x - 100, top: w.y - 60, width: 86, height: w.h + 170, borderRadius: "0 0 30px 30px", backgroundColor: "#FFFFFF", boxShadow: "inset -10px 0 0 #F1F4F8" })} />
      <div style={box({ left: w.x + w.w + 14, top: w.y - 60, width: 86, height: w.h + 170, borderRadius: "0 0 30px 30px", backgroundColor: "#FFFFFF", boxShadow: "inset 10px 0 0 #F1F4F8" })} />
      <div style={box({ left: w.x - 124, top: w.y - 76, width: w.w + 248, height: 16, borderRadius: 8, backgroundColor: "#C8D2DE" })} />

      {/* столик-консоль: растение и фото семьи */}
      <div style={box({ left: HALL.table.x, top: HALL.table.top, width: HALL.table.w, height: 24, borderRadius: 8, backgroundColor: "#E6D3B3" })} />
      <div style={box({ left: HALL.table.x + 30, top: HALL.table.top + 24, width: 20, height: fy - HALL.table.top - 24, backgroundColor: "#CDB58D" })} />
      <div style={box({ left: HALL.table.x + HALL.table.w - 50, top: HALL.table.top + 24, width: 20, height: fy - HALL.table.top - 24, backgroundColor: "#CDB58D" })} />
      <div style={box({ left: HALL.table.x + 40, top: HALL.table.top - 150, width: 130, height: 150, borderRadius: 8, backgroundColor: "#FFFFFF", border: "10px solid #D9C29C", boxSizing: "border-box", background: "linear-gradient(180deg, #CFE3F2 0 60%, #F2E3C8 60%)" })} />
      <svg width={200} height={320} viewBox="0 0 240 420" style={box({ left: HALL.table.x + 190, top: HALL.table.top - 310, overflow: "visible" })}>
        <path d="M 120 300 C 60 240 30 160 50 90 C 90 140 110 210 120 300 Z" fill="#5E9A6A" />
        <path d="M 120 300 C 170 230 200 150 190 70 C 150 130 130 210 120 300 Z" fill="#4E8A5C" />
        <path d="M 120 300 C 100 220 110 120 130 40 C 150 120 140 220 120 300 Z" fill="#6FAE77" />
        <path d="M 70 300 L 170 300 L 156 420 L 84 420 Z" fill="#FFFFFF" stroke="#E3DDD0" strokeWidth={4} />
      </svg>
      {/* утренний свет из окна */}
      <div style={box({ left: 700, top: 0, width: 1500, height: 2600, opacity: light, background: "linear-gradient(115deg, transparent 30%, rgba(255,236,190,0.28) 42%, rgba(255,236,190,0.12) 60%, transparent 70%)" })} />
    </div>
  );
};

// Стул у двери (вид спереди). back — спинка рисуется отдельно (за рюкзаком).
export const ChairBack: React.FC<{ readonly x: number; readonly seat: number }> = ({ x, seat }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${seat})`}>
      <rect x={-150} y={-400} width={30} height={410} rx={12} fill={C.wood} />
      <rect x={120} y={-400} width={30} height={410} rx={12} fill={C.wood} />
      <rect x={-160} y={-420} width={320} height={64} rx={24} fill={C.woodDark} />
      <rect x={-120} y={-300} width={240} height={26} rx={10} fill={C.wood} />
    </g>
  </svg>
);

export const ChairSeat: React.FC<{ readonly x: number; readonly seat: number; readonly floor: number }> = ({ x, seat, floor }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${seat})`}>
      <ellipse cx={0} cy={floor - seat + 6} rx={200} ry={20} fill="rgba(40,30,20,0.16)" />
      <rect x={-150} y={10} width={28} height={floor - seat - 10} rx={10} fill={C.woodDark} />
      <rect x={122} y={10} width={28} height={floor - seat - 10} rx={10} fill={C.woodDark} />
      <path d="M -175 -6 L 175 -6 L 165 36 L -165 36 Z" fill={C.wood} />
      <rect x={-160} y={-20} width={320} height={26} rx={12} fill={C.bagTrim} />
    </g>
  </svg>
);
