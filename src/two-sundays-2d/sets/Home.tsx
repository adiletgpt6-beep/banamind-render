// Один дом семьи (планировка одинакова во всех сценах).
//   ROOM    — уголок дочки: окно слева, детский стол у стены, стул, лампа,
//             карандаши в стакане. Лист календаря лежит на столе.
//   KITCHEN — кухня-столовая: рабочая столешница с доской слева, обеденный
//             стол в центре (мама слева, дочка в центре, папа справа — как
//             на детском рисунке), холодильник справа, лампа над столом.
//   HALL    — прихожая: входная дверь, вешалка, полка для обуви.
// warm — 0…1: вечерний тёплый свет (среда, общий стол); 0 — дневной.
import { box } from "../kit";
import { C } from "../theme";

// ---------- Уголок дочки ----------
export const ROOM = {
  floorY: 1560,
  desk: { x0: 450, x1: 1030, top: 1290 },
  chair: { x: 760 },
  sheet: { x: 700, y: 1282 },
  stool: { x: 300, h: 230 }, // табурет рядом со столом (мама присаживается) // лист на столе (центр, в профиль)
  window: { x: 40, y: 420, w: 330, h: 520 },
} as const;

export const RoomBack: React.FC<{ readonly warm?: number }> = ({ warm = 0 }) => (
  <div style={box({ left: -400, top: -200 })}>
    <div style={box({ left: 0, top: 0, width: 1900, height: ROOM.floorY + 200, backgroundColor: C.wallHome })} />
    {/* окно: днём светлое небо */}
    <div style={box({ left: ROOM.window.x + 400, top: ROOM.window.y + 200, width: ROOM.window.w, height: ROOM.window.h, backgroundColor: warm > 0.5 ? "#F3C98E" : C.sky, border: `18px solid ${C.white}`, boxSizing: "border-box" })} />
    <div style={box({ left: ROOM.window.x + 400 + ROOM.window.w / 2 - 8, top: ROOM.window.y + 200, width: 16, height: ROOM.window.h, backgroundColor: C.white })} />
    {/* полка с книгами над столом */}
    <div style={box({ left: 920, top: 760, width: 420, height: 18, backgroundColor: C.woodDark })} />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={box({ left: 940 + i * 46, top: 660 + (i % 2) * 14, width: 36, height: 100 - (i % 2) * 14, backgroundColor: [C.kidBlue, C.orange, C.yellow, C.kidGreen, C.kidPink][i] })} />
    ))}
    {/* детские рисунки на стене */}
    <div style={box({ left: 1420, top: 660, width: 150, height: 190, backgroundColor: C.white, transform: "rotate(4deg)", boxShadow: `0 6px 0 ${C.shadow}` })} />
    <div style={box({ left: 1450, top: 700, width: 90, height: 90, borderRadius: "50%", backgroundColor: C.kidGreen, opacity: 0.7 })} />
    {/* пол */}
    <div style={box({ left: 0, top: ROOM.floorY + 200, width: 1900, height: 900, backgroundColor: C.floorHome })} />
    <div style={box({ left: 0, top: ROOM.floorY + 196, width: 1900, height: 10, backgroundColor: "#C8B391" })} />
  </div>
);

// Табурет рядом со столом (мама присаживается на него).
export const Stool: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: ROOM.stool.x - 80, top: ROOM.floorY - ROOM.stool.h, width: 160, height: 28, borderRadius: 14, backgroundColor: C.kidTeal })} />
    <div style={box({ left: ROOM.stool.x - 64, top: ROOM.floorY - ROOM.stool.h + 28, width: 14, height: ROOM.stool.h - 28, backgroundColor: C.woodDark, transform: "rotate(6deg)" })} />
    <div style={box({ left: ROOM.stool.x + 50, top: ROOM.floorY - ROOM.stool.h + 28, width: 14, height: ROOM.stool.h - 28, backgroundColor: C.woodDark, transform: "rotate(-6deg)" })} />
  </div>
);

// Спинка детского стула (за сидящей дочкой).
export const RoomChairBack: React.FC = () => <div style={box({ left: ROOM.chair.x - 95, top: ROOM.floorY - 520, width: 190, height: 280, backgroundColor: C.kidTeal, borderRadius: "40px 40px 10px 10px" })} />;

// Детский стол: столешница (вид спереди), ножки, карандаши в стакане,
// лампа; лист календаря — тонкая белая полоска на столешнице.
export const RoomDesk: React.FC<{ readonly sheet?: boolean }> = ({ sheet = true }) => {
  const d = ROOM.desk;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {/* лампа (слева на столе) */}
      <div style={box({ left: d.x1 - 70, top: d.top - 170, width: 12, height: 170, backgroundColor: C.navy, transform: "rotate(12deg)", transformOrigin: "50% 100%" })} />
      <div style={box({ left: d.x1 - 150, top: d.top - 200, width: 110, height: 58, backgroundColor: C.orange, borderRadius: "60px 60px 8px 8px", transform: "rotate(-14deg)" })} />
      {/* стакан с карандашами (слева) */}
      <div style={box({ left: d.x0 + 30, top: d.top - 96, width: 64, height: 96, backgroundColor: C.navy, borderRadius: "6px 6px 12px 12px" })} />
      {[C.kidRed, C.kidGreen, C.yellow, C.kidBlue].map((c, i) => (
        <div key={c} style={box({ left: d.x0 + 36 + i * 13, top: d.top - 150 + (i % 2) * 10, width: 10, height: 70, backgroundColor: c, transform: `rotate(${(i - 1.5) * 6}deg)` })} />
      ))}
      {sheet ? <div style={box({ left: ROOM.sheet.x - 150, top: d.top - 8, width: 300, height: 10, backgroundColor: "#FFFEFA", borderRadius: 3, boxShadow: "0 2px 0 #D8D2C4" })} /> : null}
      <div style={box({ left: d.x0, top: d.top, width: d.x1 - d.x0, height: 30, backgroundColor: C.woodLight })} />
      <div style={box({ left: d.x0 + 20, top: d.top + 30, width: d.x1 - d.x0 - 40, height: 90, backgroundColor: C.wood })} />
      <div style={box({ left: d.x0 + 30, top: d.top + 120, width: 24, height: ROOM.floorY - d.top - 120, backgroundColor: C.woodDark })} />
      <div style={box({ left: d.x1 - 54, top: d.top + 120, width: 24, height: ROOM.floorY - d.top - 120, backgroundColor: C.woodDark })} />
    </div>
  );
};

// ---------- Кухня-столовая ----------
export const KITCHEN = {
  floorY: 1560,
  table: { x0: 210, x1: 1010, top: 1230 },
  seats: { mom: 380, girl: 610, dad: 840 }, // как на рисунке: мама, дочка, папа
  counter: { x0: -520, x1: 120, top: 1150 },
  fridge: { x: 1250, top: 520, w: 380 },
} as const;

export const KitchenBack: React.FC<{ readonly warm?: number }> = ({ warm = 0 }) => (
  <div style={box({ left: -700, top: -300 })}>
    <div style={box({ left: 0, top: 0, width: 2900, height: KITCHEN.floorY + 300, backgroundColor: C.wallKitchen })} />
    {/* окно над столом: вечер — тёплое, день — светлое */}
    <div style={box({ left: 1000, top: 760, width: 520, height: 420, backgroundColor: warm > 0.5 ? "#2E3557" : C.sky, border: `16px solid ${C.white}`, boxSizing: "border-box" })} />
    <div style={box({ left: 1252, top: 760, width: 16, height: 420, backgroundColor: C.white })} />
    {warm > 0.5
      ? [0, 1, 2].map((i) => <div key={i} style={box({ left: 1060 + i * 150, top: 840 + (i % 2) * 70, width: 22, height: 22, backgroundColor: C.yellow, borderRadius: "50%", opacity: 0.85 })} />)
      : null}
    {/* верхние шкафчики над столешницей */}
    <div style={box({ left: 120, top: 700, width: 680, height: 300, backgroundColor: "#E2D3B8", borderBottom: `10px solid ${C.woodDark}` })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 150 + i * 220, top: 730, width: 190, height: 240, border: "4px solid #CDBB9C", boxSizing: "border-box" })} />
    ))}
    {/* лампа над столом */}
    <div style={box({ left: 1308, top: 300, width: 6, height: 520, backgroundColor: C.ink })} />
    <div style={box({ left: 1210, top: 800, width: 200, height: 96, backgroundColor: C.orange, borderRadius: "100px 100px 0 0" })} />
    {warm > 0 ? <div style={box({ left: 960, top: 890, width: 700, height: 900, background: "radial-gradient(ellipse at 50% 0%, rgba(255,205,120,0.38), rgba(255,205,120,0) 70%)", opacity: warm })} /> : null}
    {/* пол */}
    <div style={box({ left: 0, top: KITCHEN.floorY + 300, width: 2900, height: 900, backgroundColor: C.floorHome })} />
    <div style={box({ left: 0, top: KITCHEN.floorY + 296, width: 2900, height: 10, backgroundColor: "#C8B391" })} />
  </div>
);

// Рабочая столешница с разделочной доской (слева от стола).
export const KitchenCounter: React.FC = () => {
  const c = KITCHEN.counter;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: c.x0, top: c.top, width: c.x1 - c.x0, height: 34, backgroundColor: "#EDE6DA" })} />
      <div style={box({ left: c.x0, top: c.top + 34, width: c.x1 - c.x0, height: KITCHEN.floorY - c.top - 34, backgroundColor: "#D7C7AA" })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: c.x0 + 30 + i * 310, top: c.top + 70, width: 280, height: KITCHEN.floorY - c.top - 110, border: "4px solid #C4B293", boxSizing: "border-box" })} />
      ))}
    </div>
  );
};

// Обеденный стол (вид спереди): столешница перекрывает ноги сидящих.
export const KitchenTable: React.FC<{ readonly cloth?: string }> = ({ cloth }) => {
  const t = KITCHEN.table;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: t.x0, top: t.top, width: t.x1 - t.x0, height: 34, backgroundColor: cloth ?? C.woodLight })} />
      {cloth ? <div style={box({ left: t.x0, top: t.top + 34, width: t.x1 - t.x0, height: 110, backgroundColor: cloth, opacity: 0.92 })} /> : <div style={box({ left: t.x0 + 20, top: t.top + 34, width: t.x1 - t.x0 - 40, height: 70, backgroundColor: C.wood })} />}
      <div style={box({ left: t.x0 + 40, top: t.top + 104, width: 26, height: KITCHEN.floorY - t.top - 104, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x1 - 66, top: t.top + 104, width: 26, height: KITCHEN.floorY - t.top - 104, backgroundColor: C.woodDark })} />
    </div>
  );
};

// Спинки стульев за сидящими.
export const KitchenChairs: React.FC<{ readonly seats?: readonly number[] }> = ({ seats = [KITCHEN.seats.mom, KITCHEN.seats.girl, KITCHEN.seats.dad] }) => (
  <div style={box({ left: 0, top: 0 })}>
    {seats.map((x) => (
      <div key={x} style={box({ left: x - 90, top: KITCHEN.floorY - 560, width: 180, height: 330, backgroundColor: C.woodDark, borderRadius: "30px 30px 6px 6px" })} />
    ))}
  </div>
);

// Холодильник (справа): белый, две дверцы; лист календаря на нём —
// отдельным слоем в сцене (props/Calendar).
export const Fridge: React.FC = () => {
  const f = KITCHEN.fridge;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: f.x, top: f.top, width: f.w, height: KITCHEN.floorY - f.top, backgroundColor: "#F4F6F8", borderRadius: 26, border: "4px solid #D5DBE2", boxSizing: "border-box" })} />
      <div style={box({ left: f.x, top: f.top + 360, width: f.w, height: 6, backgroundColor: "#D5DBE2" })} />
      <div style={box({ left: f.x + 26, top: f.top + 120, width: 14, height: 180, borderRadius: 7, backgroundColor: "#BCC4CE" })} />
      <div style={box({ left: f.x + 26, top: f.top + 420, width: 14, height: 240, borderRadius: 7, backgroundColor: "#BCC4CE" })} />
    </div>
  );
};

// ---------- Прихожая ----------
export const HALL = { floorY: 1560, door: { x: 640, w: 320, top: 760 } } as const;

export const HallBack: React.FC<{ readonly open?: number }> = ({ open = 0 }) => {
  const d = HALL.door;
  return (
    <div style={box({ left: -400, top: -200 })}>
      <div style={box({ left: 0, top: 0, width: 1900, height: HALL.floorY + 200, backgroundColor: C.wallHome })} />
      {/* проём и дверь (открывается внутрь, к стене слева) */}
      <div style={box({ left: d.x + 400 - 14, top: d.top + 200 - 14, width: d.w + 28, height: HALL.floorY - d.top + 14, backgroundColor: C.white })} />
      <div style={box({ left: d.x + 400, top: d.top + 200, width: d.w, height: HALL.floorY - d.top, backgroundColor: "#DCE7EE" })} />
      <div style={box({ left: d.x + 400, top: d.top + 200, width: d.w * (1 - 0.85 * open), height: HALL.floorY - d.top, backgroundColor: "#8A6A52", borderRight: "6px solid #6E5341", boxSizing: "border-box" })} />
      {/* вешалка */}
      <div style={box({ left: 1420, top: 820, width: 260, height: 14, backgroundColor: C.woodDark })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 1440 + i * 80, top: 834, width: 12, height: 26, backgroundColor: C.ink })} />
      ))}
      <div style={box({ left: 1452, top: 860, width: 110, height: 260, backgroundColor: "#7E8C6A", borderRadius: "40px 40px 10px 10px" })} />
      {/* коврик и пол */}
      <div style={box({ left: 0, top: HALL.floorY + 200, width: 1900, height: 900, backgroundColor: C.floorHome })} />
      <div style={box({ left: d.x + 330, top: HALL.floorY + 190, width: 460, height: 40, backgroundColor: "#B5655F", borderRadius: 10 })} />
    </div>
  );
};
