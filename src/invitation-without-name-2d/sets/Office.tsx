// Кабинет инженера (сцены 4–5): большое окно с силуэтами зданий, стол с
// чертежом, лампа, полка с папками. Синий — цвет чертежа.
import { box } from "../kit";
import { C } from "../theme";

export const OFFICE = { floorY: 1520, deskTop: 1230, deskFront: 1290, desk: { x0: 160, x1: 900 }, seatX: 420 } as const;

export const OfficeBack: React.FC = () => (
  <div style={box({ left: -500, top: -300, width: 2100, height: 2600 })}>
    <div style={box({ left: 0, top: 0, width: 2100, height: OFFICE.floorY + 300, backgroundColor: "#ECEDEA" })} />
    {/* окно: город днём */}
    <div style={box({ left: 500 + 80, top: 300 + 380, width: 920, height: 600, backgroundColor: "#DCE8F2", border: `18px solid ${C.white}`, boxSizing: "border-box", overflow: "hidden" })}>
      {[
        [40, 260, 120, 400],
        [190, 160, 150, 500],
        [370, 300, 110, 360],
        [510, 120, 170, 540],
        [710, 240, 140, 420],
      ].map(([x, y, w, h], i) => (
        <div key={i} style={box({ left: x, top: y, width: w, height: h, backgroundColor: i % 2 ? "#BFD0E0" : "#C9D8E6" })}>
          {Array.from({ length: Math.floor(h / 60) }).map((_, r) => (
            <div key={r} style={box({ left: 16, top: 20 + r * 60, width: w - 32, height: 14, backgroundColor: "#E9F0F6" })} />
          ))}
        </div>
      ))}
      {/* кран на стройке */}
      <div style={box({ left: 640, top: 40, width: 10, height: 200, backgroundColor: C.yellowDeep })} />
      <div style={box({ left: 560, top: 40, width: 260, height: 10, backgroundColor: C.yellowDeep })} />
    </div>
    <div style={box({ left: 500 + 530, top: 300 + 380, width: 18, height: 600, backgroundColor: C.white })} />
    {/* полка с папками */}
    <div style={box({ left: 500 + 1080, top: 300 + 860, width: 260, height: 16, backgroundColor: C.woodDark })} />
    {[C.blue, C.navy, C.yellow, C.coral].map((c, i) => (
      <div key={i} style={box({ left: 500 + 1096 + i * 56, top: 300 + 754 + (i % 2) * 12, width: 44, height: 106 - (i % 2) * 12, backgroundColor: c })} />
    ))}
    <div style={box({ left: 0, top: OFFICE.floorY + 300, width: 2100, height: 900, backgroundColor: C.floor })} />
  </div>
);

export const OfficeDesk: React.FC = () => {
  const { x0, x1 } = OFFICE.desk;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: x0, top: OFFICE.deskTop, width: x1 - x0, height: OFFICE.deskFront - OFFICE.deskTop, backgroundColor: "#F2F1EC", borderTop: "4px solid #D8D6CE" })} />
      <div style={box({ left: x0 - 6, top: OFFICE.deskFront, width: x1 - x0 + 12, height: 22, backgroundColor: "#CFCDC4" })} />
      <div style={box({ left: x0 + 24, top: OFFICE.deskFront + 22, width: 26, height: OFFICE.floorY - OFFICE.deskFront - 22, backgroundColor: C.ink })} />
      <div style={box({ left: x1 - 50, top: OFFICE.deskFront + 22, width: 26, height: OFFICE.floorY - OFFICE.deskFront - 22, backgroundColor: C.ink })} />
    </div>
  );
};

// Спинка рабочего кресла (за сидящим папой).
export const OfficeChairBack: React.FC<{ readonly x: number }> = ({ x }) => (
  <div style={box({ left: x - 115, top: 880, width: 230, height: 330, backgroundColor: "#2B2F38", borderRadius: "40px 40px 12px 12px" })} />
);
