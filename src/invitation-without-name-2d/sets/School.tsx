// Школа: коридор у кабинета 203 (сцена 1) и класс (сцены 3, 13–15).
// Спокойные светлые стены, тёмно-синие школьные детали, доска с надписью
// «КЕСИПТЕР КҮНҮ» мелом. Мировые координаты: кадр 1080×1920 при zoom 1.
import { box } from "../kit";
import { IW2_TEXT } from "../script";
import { C, F } from "../theme";

export const CORRIDOR = { floorY: 1500, door: { x: 640, w: 300, top: 640 } } as const;

export const Corridor: React.FC = () => {
  const d = CORRIDOR.door;
  return (
    <div style={box({ left: -500, top: -300, width: 2100, height: 2600 })}>
      <div style={box({ left: 0, top: 0, width: 2100, height: CORRIDOR.floorY + 300, backgroundColor: C.corridor })} />
      {/* панель стены снизу */}
      <div style={box({ left: 0, top: CORRIDOR.floorY + 300 - 380, width: 2100, height: 380, backgroundColor: "#DCDFE3" })} />
      <div style={box({ left: 0, top: CORRIDOR.floorY + 300 - 384, width: 2100, height: 8, backgroundColor: C.navySoft, opacity: 0.5 })} />
      {/* дверь кабинета 203 */}
      <div style={box({ left: 500 + d.x - d.w / 2 - 18, top: 300 + d.top - 18, width: d.w + 36, height: CORRIDOR.floorY - d.top + 18, backgroundColor: "#C9CDD3" })} />
      <div style={box({ left: 500 + d.x - d.w / 2, top: 300 + d.top, width: d.w, height: CORRIDOR.floorY - d.top, backgroundColor: "#C79E6C" })} />
      <div style={box({ left: 500 + d.x - d.w / 2 + 40, top: 300 + d.top + 70, width: d.w - 80, height: 260, backgroundColor: "#D8EAF3", border: "10px solid #A97F4E", boxSizing: "border-box" })} />
      <div style={box({ left: 500 + d.x + d.w / 2 - 60, top: 300 + d.top + 470, width: 34, height: 12, borderRadius: 6, backgroundColor: "#C9CDD3" })} />
      {/* табличка с номером */}
      <div style={box({ left: 500 + d.x - 80, top: 300 + d.top - 130, width: 160, height: 84, backgroundColor: C.white, border: `5px solid ${C.ink}`, boxSizing: "border-box", textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 56, lineHeight: "74px", color: C.ink })}>{IW2_TEXT.room}</div>
      {/* стенд с детскими рисунками */}
      <div style={box({ left: 500 + 40, top: 300 + 620, width: 290, height: 380, backgroundColor: "#F4F1E8", border: `6px solid ${C.navySoft}`, boxSizing: "border-box" })} />
      {[
        [64, 650, C.yellow],
        [190, 660, C.coralSoft],
        [80, 800, C.blueSoft],
        [196, 810, "#CFE6D3"],
      ].map(([x, y, c], i) => (
        <div key={i} style={box({ left: 500 + (x as number), top: 300 + (y as number), width: 100, height: 120, backgroundColor: c as string, transform: `rotate(${(i % 2 ? 2 : -2)}deg)` })} />
      ))}
      {/* пол */}
      <div style={box({ left: 0, top: CORRIDOR.floorY + 300, width: 2100, height: 900, backgroundColor: C.floor })} />
    </div>
  );
};

// Класс. Доска на дальней стене, окно слева, демонстрационный стол в центре.
export const CLASS = { floorY: 1560, board: { x: 190, y: 520, w: 700, h: 380 }, table: { x0: 250, x1: 830, top: 1260 } } as const;

export const ClassroomBack: React.FC<{ readonly title?: number; readonly light?: number }> = ({ title = 1, light = 1 }) => {
  const b = CLASS.board;
  return (
    <div style={box({ left: -500, top: -300, width: 2100, height: 2600 })}>
      <div style={box({ left: 0, top: 0, width: 2100, height: CLASS.floorY + 300, backgroundColor: "#EFEDE4" })} />
      {/* окно (день) */}
      <div style={box({ left: 500 - 420, top: 300 + 470, width: 330, height: 560, backgroundColor: "#D4E5F2", border: `16px solid ${C.white}`, boxSizing: "border-box", opacity: light })} />
      <div style={box({ left: 500 - 263, top: 300 + 470, width: 14, height: 560, backgroundColor: C.white })} />
      {/* доска */}
      <div style={box({ left: 500 + b.x - 20, top: 300 + b.y - 20, width: b.w + 40, height: b.h + 40, backgroundColor: "#C8B08A" })} />
      <div style={box({ left: 500 + b.x, top: 300 + b.y, width: b.w, height: b.h, backgroundColor: "#22354F" })} />
      <div style={box({ left: 500 + b.x, top: 300 + b.y + 54, width: b.w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 74, color: "#F4F1E8", opacity: title, letterSpacing: 1 })}>{IW2_TEXT.board}</div>
      <div style={box({ left: 500 + b.x + 150, top: 300 + b.y + 150, width: b.w - 300, height: 6, backgroundColor: C.yellow, opacity: 0.8 * title, borderRadius: 3 })} />
      <div style={box({ left: 500 + b.x + 40, top: 300 + b.y + b.h, width: b.w - 80, height: 16, backgroundColor: "#B39A75" })} />
      {/* полка с книгами справа */}
      <div style={box({ left: 500 + 980, top: 300 + 760, width: 300, height: 16, backgroundColor: C.woodDark })} />
      {[C.navy, C.coral, C.yellow, C.blue, C.navySoft].map((c, i) => (
        <div key={i} style={box({ left: 500 + 994 + i * 46, top: 300 + 660 + (i % 2) * 14, width: 38, height: 100 - (i % 2) * 14, backgroundColor: c })} />
      ))}
      {/* пол */}
      <div style={box({ left: 0, top: CLASS.floorY + 300, width: 2100, height: 900, backgroundColor: C.floor })} />
    </div>
  );
};

// Демонстрационный стол (перед папой): столешница и передняя панель.
export const DemoTable: React.FC<{ readonly x0?: number; readonly x1?: number; readonly top?: number }> = ({ x0 = CLASS.table.x0, x1 = CLASS.table.x1, top = CLASS.table.top }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: x0, top, width: x1 - x0, height: 26, backgroundColor: C.wood })} />
    <div style={box({ left: x0 + 14, top: top + 26, width: x1 - x0 - 28, height: CLASS.floorY - top - 26, backgroundColor: C.navy })} />
    <div style={box({ left: x0 + 14, top: top + 26, width: x1 - x0 - 28, height: 18, backgroundColor: "#0F1C33" })} />
  </div>
);
