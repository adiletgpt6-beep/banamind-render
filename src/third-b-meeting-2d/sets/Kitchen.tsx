// Дом вечером: кухня-гостиная, стол у окна, тёплая настольная лампа
// (жёлтый акцент BalaGo), полка с маминой папкой образцов. Родители сидят
// за столом, дочка — рядом со своим альбомом.
import { box } from "../kit";
import { C } from "../theme";

export const KITCHEN = { floorY: 1520, tableTop: 1250, table: { x0: 110, x1: 970 }, lamp: { x: 860, y: 1250 } } as const;

export const KitchenBack: React.FC<{ readonly lamp?: number }> = ({ lamp = 1 }) => (
  <div style={box({ left: -300, top: -200 })}>
    <div style={box({ left: 0, top: 0, width: 1700, height: KITCHEN.floorY + 200, backgroundColor: "#EFE2C9" })} />
    {/* окно: вечерний город */}
    <div style={box({ left: 330, top: 520, width: 560, height: 480, backgroundColor: "#28324A", border: `16px solid ${C.paper}`, boxSizing: "border-box", overflow: "hidden" })}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={box({ left: 30 + i * 130, top: 260 - (i % 2) * 70, width: 90, height: 300, backgroundColor: "#3A4562" })} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={`w${i}`} style={box({ left: 50 + (i % 3) * 140 + (i > 2 ? 30 : 0), top: 300 + Math.floor(i / 3) * 60 - (i % 2) * 40, width: 22, height: 26, backgroundColor: C.yellow, opacity: 0.85 })} />
      ))}
    </div>
    <div style={box({ left: 602, top: 520, width: 16, height: 480, backgroundColor: C.paper })} />
    {/* полка: книги и мамина папка «АЙКЫН» */}
    <div style={box({ left: 1020, top: 760, width: 440, height: 22, backgroundColor: C.woodDark })} />
    {["#718B7A", "#C98E5E", "#34465E", "#EA974B"].map((c, i) => (
      <div key={c} style={box({ left: 1040 + i * 46, top: 620 + (i % 2) * 20, width: 38, height: 140 - (i % 2) * 20, backgroundColor: c })} />
    ))}
    <div style={box({ left: 1250, top: 650, width: 170, height: 110, backgroundColor: C.navy, color: C.paper, fontFamily: "T3B Inter Tight", fontWeight: 900, fontSize: 34, textAlign: "center", lineHeight: "110px" })}>АЙКЫН</div>
    {/* мягкий свет лампы на стене */}
    <div style={box({ left: 850, top: 700, width: 900, height: 900, background: `radial-gradient(circle at 50% 70%, rgba(255,212,71,${0.38 * lamp}), rgba(255,212,71,0) 62%)` })} />
    <div style={box({ left: 0, top: KITCHEN.floorY + 200, width: 1700, height: 900, backgroundColor: "#CDB894" })} />
  </div>
);

// Стол: столешница, ножки и настольная лампа (свет — тёплый янтарный).
export const KitchenTable: React.FC<{ readonly lamp?: number }> = ({ lamp = 1 }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: KITCHEN.table.x0, top: KITCHEN.tableTop, width: KITCHEN.table.x1 - KITCHEN.table.x0, height: 40, backgroundColor: C.wood })} />
    {/* скатерть до пола: за столом сидят, ноги не видны */}
    <div style={box({ left: KITCHEN.table.x0 + 6, top: KITCHEN.tableTop + 34, width: KITCHEN.table.x1 - KITCHEN.table.x0 - 12, height: KITCHEN.floorY - KITCHEN.tableTop + 40, backgroundColor: "#E7D2B0", borderTop: `10px solid ${C.woodDark}`, boxSizing: "border-box" })} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={box({ left: KITCHEN.table.x0 + 40 + i * 140, top: KITCHEN.tableTop + 44, width: 4, height: KITCHEN.floorY - KITCHEN.tableTop + 20, backgroundColor: "rgba(166,122,77,0.25)" })} />
    ))}
    {/* пиалы с чаем */}
    {[260, 600].map((x) => (
      <div key={x} style={box({ left: x - 40, top: KITCHEN.tableTop - 40, width: 80, height: 44, backgroundColor: "#FFFFFF", borderRadius: "0 0 40px 40px", borderTop: `8px solid ${C.amberDeep}` })} />
    ))}
    {/* настольная лампа */}
    <div style={box({ left: KITCHEN.lamp.x - 50, top: KITCHEN.tableTop - 14, width: 100, height: 16, borderRadius: 8, backgroundColor: C.navy })} />
    <div style={box({ left: KITCHEN.lamp.x - 6, top: KITCHEN.tableTop - 190, width: 12, height: 180, backgroundColor: C.navy })} />
    <div style={box({ left: KITCHEN.lamp.x - 80, top: KITCHEN.tableTop - 250, width: 140, height: 80, backgroundColor: C.yellow, borderRadius: "70px 70px 6px 6px", transform: "rotate(-12deg)" })} />
    <div style={box({ left: KITCHEN.lamp.x - 330, top: KITCHEN.tableTop - 180, width: 520, height: 200, background: `radial-gradient(ellipse at 60% 0%, rgba(255,212,71,${0.45 * lamp}), rgba(255,212,71,0) 70%)` })} />
  </div>
);
