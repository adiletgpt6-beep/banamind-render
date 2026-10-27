// Школьный шахматный кружок (день): спокойная голубая стена, большие
// окна, настенная демонстрационная доска, часы. Стол и стулья переднего
// плана — те же, что в комнате (боковой план), поэтому стороны и масштаб
// совпадают. Дальний стол с двумя детьми — в глубине (меньше).
import { box } from "../kit";
import { C } from "../theme";
import { ROOM } from "./Home";

export const ClubBack: React.FC = () => (
  <div style={box({ left: -400, top: -300 })}>
    <div style={box({ left: 0, top: 0, width: 2000, height: ROOM.floorY + 300, backgroundColor: C.wallDay })} />
    {/* окна: дневной свет */}
    {[0, 1].map((i) => (
      <div key={i} style={box({ left: 460 + i * 420, top: 880, width: 330, height: 420, backgroundColor: "#CFE3F5", border: `14px solid ${C.white}`, boxSizing: "border-box" })}>
        <div style={box({ left: 30, top: 230, width: 120, height: 160, backgroundColor: "#9CC48A", borderRadius: "60px 60px 0 0" })} />
      </div>
    ))}
    {/* настенная демонстрационная доска 8×8 */}
    <div style={box({ left: 1360, top: 860, width: 300, height: 300, backgroundColor: "#7A5236" })}>
      {Array.from({ length: 64 }).map((_, i) => {
        const fl = i % 8;
        const rk = 7 - Math.floor(i / 8);
        return <div key={i} style={box({ left: 14 + fl * 34, top: 14 + (7 - rk) * 34, width: 34, height: 34, backgroundColor: (fl + rk) % 2 === 0 ? C.boardDark : C.boardLight })} />;
      })}
    </div>
    {/* часы */}
    <div style={box({ left: 1180, top: 760, width: 90, height: 90, borderRadius: 45, backgroundColor: C.white, border: `8px solid ${C.navy}`, boxSizing: "border-box" })}>
      <div style={box({ left: 33, top: 12, width: 5, height: 28, backgroundColor: C.navy })} />
      <div style={box({ left: 35, top: 35, width: 24, height: 5, backgroundColor: C.navy })} />
    </div>
    {/* пол */}
    <div style={box({ left: 0, top: ROOM.floorY + 300, width: 2000, height: 900, backgroundColor: "#C9D3DC" })} />
  </div>
);

// Дальний стол (в глубине класса): рисуется поверх тел дальних детей.
export const CLUB_FAR = { x0: 470, x1: 800, top: 1170, floor: 1380 } as const;
export const ClubFarTable: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: CLUB_FAR.x0, top: CLUB_FAR.top, width: CLUB_FAR.x1 - CLUB_FAR.x0, height: 14, backgroundColor: "#B88D62" })} />
    <div style={box({ left: CLUB_FAR.x0 + 120, top: CLUB_FAR.top - 8, width: 90, height: 8, backgroundColor: C.boardDark })} />
    <div style={box({ left: CLUB_FAR.x0 + 20, top: CLUB_FAR.top + 14, width: 10, height: CLUB_FAR.floor - CLUB_FAR.top - 14, backgroundColor: "#9A7550" })} />
    <div style={box({ left: CLUB_FAR.x1 - 30, top: CLUB_FAR.top + 14, width: 10, height: CLUB_FAR.floor - CLUB_FAR.top - 14, backgroundColor: "#9A7550" })} />
  </div>
);
