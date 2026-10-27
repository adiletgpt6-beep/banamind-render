// Декорация BalaGoBG039: светлая гостиная обычной бишкекской квартиры
// ближе к вечеру (своя, не кухня ролика №12): большое окно с видом на
// Ала-Тоо, панельные дома и тополя, книжная полка, детский рисунок
// в рамке, деревянный стол. Отец сидит за столом с бумажным билетом,
// сын рядом делает уроки — ребёнок дома, рядом со взрослым.
//
// Координаты мира — px, как у рига ролика №12: ступни сидящих — y = 1540,
// столешница — y = 1240 (высота сиденья seatH из sets/Home).
import { Mountains } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { box } from "./context";
import { NAVY, YELLOW } from "./art";

export const ROOM = {
  floorY: 1500,
  seatY: 1540,
  table: { x: 250, top: 1240, w: 960, front: 1270, bottom: 1560 },
  window: { x: 800, y: 300, w: 560, h: 720 },
  shelf: { x: 40, y: 360, w: 320, h: 820 },
  drawing: { x: 430, y: 470, w: 220, h: 180 },
  seat: { son: 430, dad: 920 },
  notebook: { x: 470, y: 1252 },
  folders: { service: { x: 640, y: 1250 }, absence: { x: 900, y: 1252 } },
} as const;

export const onRoomTable = (x: number, dy = 0) => ({ x, y: ROOM.table.top + 6 + dy });

// Стена, окно с видом на горы, полка, рисунок, пол (задний план).
export const RoomBack: React.FC<{ readonly f: number; readonly sun?: number }> = ({ f, sun = 1 }) => {
  const w = ROOM.window;
  const s = ROOM.shelf;
  const d = ROOM.drawing;
  return (
    <div style={box({ left: 0, top: 0, width: 1600, height: 2400 })}>
      <div style={box({ left: -400, top: 0, width: 2400, height: ROOM.floorY, backgroundColor: "#EAF1F4" })} />
      <div style={box({ left: -400, top: 1170, width: 2400, height: ROOM.floorY - 1170, backgroundColor: "#DCE6EC" })} />
      <div style={box({ left: -400, top: 1166, width: 2400, height: 10, backgroundColor: "#C9D6DF" })} />
      {/* окно: небо ближе к вечеру, Ала-Тоо, панельные дома, тополя */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 12,
          overflow: "hidden",
          background: "linear-gradient(180deg, #BFDDF3 0%, #E6EEF3 50%, #FBE3C2 100%)",
          border: "18px solid #FFFFFF",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: -w.x, top: -w.y })}>
          <Mountains x={w.x - 80} y={w.y + 110} w={w.w + 160} h={210} />
          <PanelHouse x={w.x - 60} y={w.y + 660} w={330} floors={3} color="#E6D3C0" seed={5} />
          <PanelHouse x={w.x + 300} y={w.y + 700} w={300} floors={3} color="#DCCDBB" seed={9} />
          <Tree x={w.x + 280} y={w.y + 730} s={0.78} kind="poplar" />
          <Tree x={w.x + 40} y={w.y + 760} s={0.6} kind="poplar" />
        </div>
        {/* солнечный блик */}
        <div style={box({ left: w.w - 180, top: 40, width: 120, height: 120, borderRadius: 60, background: `radial-gradient(circle, rgba(255,230,160,${0.9 * sun}), rgba(255,230,160,0) 70%)` })} />
        <div style={box({ left: w.w / 2 - 9, top: 0, width: 18, height: w.h, backgroundColor: "#FFFFFF" })} />
        <div style={box({ left: 0, top: w.h * 0.4, width: w.w, height: 16, backgroundColor: "#FFFFFF" })} />
      </div>
      {/* подоконник, цветок, шторы */}
      <div style={box({ left: w.x - 34, top: w.y + w.h - 8, width: w.w + 68, height: 28, borderRadius: 6, backgroundColor: "#FFFFFF", boxShadow: "0 6px 0 rgba(20,40,90,0.06)" })} />
      <div style={box({ left: w.x + 60, top: w.y + w.h - 74, width: 64, height: 66, borderRadius: "8px 8px 20px 20px", backgroundColor: "#D9805E" })} />
      <div style={box({ left: w.x + 46, top: w.y + w.h - 150, width: 92, height: 92, borderRadius: 46, backgroundColor: "#7FAF63" })} />
      <div style={box({ left: w.x + 74, top: w.y + w.h - 182, width: 50, height: 60, borderRadius: 25, backgroundColor: "#8DBA70" })} />
      {/* шторы чуть колышутся (форточка открыта) */}
      <div style={box({ left: w.x - 96, top: w.y - 44, width: 112, height: w.h + 96, borderRadius: "0 0 36px 36px", backgroundColor: "#F3D27A", transformOrigin: "50% 0", rotate: `${0.6 * Math.sin(f / 37)}deg` })} />
      <div style={box({ left: w.x + w.w - 16, top: w.y - 44, width: 112, height: w.h + 96, borderRadius: "0 0 36px 36px", backgroundColor: "#F3D27A", transformOrigin: "50% 0", rotate: `${-0.6 * Math.sin(f / 41 + 1)}deg` })} />
      <div style={box({ left: w.x - 120, top: w.y - 60, width: w.w + 240, height: 18, borderRadius: 9, backgroundColor: "#9C7A5A" })} />
      {/* солнечный свет из окна на стене (тёплое пятно) */}
      <div style={box({ left: w.x - 520, top: w.y + 120, width: 620, height: 900, background: `linear-gradient(115deg, rgba(255,226,160,0) 0%, rgba(255,226,160,${0.28 * sun}) 45%, rgba(255,226,160,0) 100%)`, transform: "skewX(-14deg)" })} />
      {/* книжная полка */}
      <div style={box({ left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 10, backgroundColor: "#B88F68" })} />
      {[0, 1, 2, 3].map((r) => (
        <div key={r} style={box({ left: s.x + 16, top: s.y + 16 + r * 200, width: s.w - 32, height: 176, backgroundColor: "#EFE3D2", borderRadius: 4 })}>
          {Array.from({ length: 7 }, (_, i) => {
            const hgt = 110 + ((i * 37 + r * 23) % 50);
            const colors = ["#2F62A8", "#E2A33B", "#C9644F", "#5E9A93", "#7A6BC4", NAVY, "#E5677A"];
            return i === 5 && r % 2 ? null : (
              <div key={i} style={box({ left: 10 + i * 38, bottom: 0, width: 30, height: hgt, borderRadius: 3, backgroundColor: colors[(i + r * 2) % colors.length] })} />
            );
          })}
        </div>
      ))}
      {/* детский рисунок в рамке: дом, солнце, белая машина */}
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#FFFFFF", border: "12px solid #B88F68", boxSizing: "border-box", boxShadow: "0 8px 18px rgba(20,40,90,0.12)" })}>
        <svg width={196} height={156} viewBox="0 0 196 156" style={box({ left: 0, top: 0 })}>
          <circle cx={160} cy={30} r={18} fill={YELLOW} />
          <path d="M 20 100 L 60 64 L 100 100 Z" fill="#E2433A" />
          <rect x={28} y={100} width={64} height={44} fill="#5E9A93" />
          <rect x={52} y={116} width={16} height={28} fill="#FFFFFF" />
          <rect x={108} y={118} width={70} height={22} rx={8} fill="#FFFFFF" stroke="#9AA6BC" strokeWidth={3} />
          <rect x={110} y={126} width={66} height={4} fill={YELLOW} />
          <circle cx={124} cy={142} r={6} fill="#2B2F38" />
          <circle cx={162} cy={142} r={6} fill="#2B2F38" />
        </svg>
      </div>
      {/* пол и ковёр (шырдак) */}
      <div style={box({ left: -400, top: ROOM.floorY, width: 2400, height: 900, background: "linear-gradient(180deg, #CDAA82, #BD9871)" })} />
      <div style={box({ left: -400, top: ROOM.floorY, width: 2400, height: 900, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.10) 0 2px, transparent 2px 160px)" })} />
      <div style={box({ left: 180, top: 1580, width: 1100, height: 320, borderRadius: 22, backgroundColor: "#E9D3AE", border: "16px solid #C9644F", boxSizing: "border-box", backgroundImage: "repeating-linear-gradient(90deg, rgba(20,40,90,0.10) 0 22px, transparent 22px 64px)" })} />
    </div>
  );
};

// Спинка стула за сидящим (рисуется до персонажа).
export const RoomChair: React.FC<{ readonly x: number; readonly h?: number }> = ({ x, h = 760 }) => {
  const s = h / 760;
  const c = "#8C6A4E";
  return (
    <div style={box({ left: x - 95 * s, top: ROOM.seatY - 520 * s, width: 190 * s, height: 520 * s })}>
      <div style={box({ left: 10 * s, top: 0, width: 170 * s, height: 46 * s, borderRadius: 16 * s, backgroundColor: c })} />
      <div style={box({ left: 18 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 150 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 30 * s, top: 120 * s, width: 130 * s, height: 20 * s, backgroundColor: c })} />
    </div>
  );
};

// Деревянный стол: столешница поверх тел сидящих, царга и ножки.
export const RoomTable: React.FC = () => {
  const t = ROOM.table;
  return (
    <div style={box({ left: 0, top: 0, width: 1600, height: 2400 })}>
      <div style={box({ left: t.x, top: t.top - 6, width: t.w, height: t.front - t.top + 12, borderRadius: 12, backgroundColor: "#D9B184" })} />
      <div style={box({ left: t.x, top: t.top - 6, width: t.w, height: 10, borderRadius: "12px 12px 0 0", backgroundColor: "#E6C59E" })} />
      <div style={box({ left: t.x + 10, top: t.front + 6, width: t.w - 20, height: 70, backgroundColor: "#B88F68", borderRadius: "0 0 10px 10px" })} />
      <div style={box({ left: t.x + 40, top: t.front + 70, width: 34, height: t.bottom - t.front - 70, backgroundColor: "#A47D5B" })} />
      <div style={box({ left: t.x + t.w - 74, top: t.front + 70, width: 34, height: t.bottom - t.front - 70, backgroundColor: "#A47D5B" })} />
    </div>
  );
};

// Тетрадь сына на столе (вид чуть сверху) с рисунком.
export const NotebookOnTable: React.FC<{ readonly x: number; readonly y: number; readonly lines?: number }> = ({ x, y, lines = 3 }) => (
  <div style={box({ left: x - 110, top: y - 30, width: 220, height: 44, transform: "perspective(500px) rotateX(55deg)", transformOrigin: "50% 100%" })}>
    <div style={box({ left: 0, top: -40, width: 220, height: 84, backgroundColor: "#FFFFFF", borderRadius: 6, border: "3px solid #C9D3E3" })} />
    <div style={box({ left: 108, top: -40, width: 4, height: 84, backgroundColor: "#C9D3E3" })} />
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} style={box({ left: 124, top: -28 + i * 18, width: 70 - i * 8, height: 5, borderRadius: 3, backgroundColor: "#7D93B8" })} />
    ))}
  </div>
);

// Пиала с водой — без еды и сладостей.
export const CupOnTable: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <svg width={70} height={44} viewBox="0 0 70 44" style={box({ left: x - 35, top: y - 40 })}>
    <path d="M 4 8 Q 35 54 66 8 Z" fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
    <ellipse cx={35} cy={9} rx={29} ry={5} fill="#D7ECF8" />
    <path d="M 12 18 Q 35 30 58 18" stroke="#2F62A8" strokeWidth={4} fill="none" />
  </svg>
);
