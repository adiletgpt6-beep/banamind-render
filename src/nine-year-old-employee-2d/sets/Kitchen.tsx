// Дом вечером: кухня (родители за столом, бабушка у плиты) и комната
// Бектура с его отдельным домашним столом.
import { box } from "../kit";
import { C } from "../theme";

export const KITCHEN = { floorY: 1520, tableTop: 1250, table: { x0: 150, x1: 930 } } as const;

export const KitchenBack: React.FC = () => (
  <div style={box({ left: -300, top: -200 })}>
    <div style={box({ left: 0, top: 0, width: 1700, height: KITCHEN.floorY + 200, backgroundColor: "#F3E3C4" })} />
    {/* окно: вечер за стеклом */}
    <div style={box({ left: 360, top: 560, width: 520, height: 470, backgroundColor: "#2A2F4A", border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    <div style={box({ left: 610, top: 560, width: 16, height: 470, backgroundColor: C.paper })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 400 + i * 150, top: 640 + (i % 2) * 60, width: 26, height: 26, backgroundColor: C.yellow, borderRadius: "50%" })} />
    ))}
    {/* плита и шкафчики (справа, за бабушкой) */}
    <div style={box({ left: 1080, top: 1200, width: 420, height: 520, backgroundColor: "#D9C9A8" })} />
    <div style={box({ left: 1080, top: 700, width: 420, height: 300, backgroundColor: "#E7D8B8" })} />
    <div style={box({ left: 1120, top: 1170, width: 160, height: 30, backgroundColor: "#3A3F4A" })} />
    {/* лампа над столом */}
    <div style={box({ left: 828, top: 200, width: 8, height: 400, backgroundColor: C.ink })} />
    <div style={box({ left: 730, top: 590, width: 200, height: 90, backgroundColor: C.orange, borderRadius: "100px 100px 0 0" })} />
    <div style={box({ left: 600, top: 680, width: 460, height: 700, background: "radial-gradient(ellipse at 50% 0%, rgba(255,211,61,0.35), rgba(255,211,61,0) 70%)" })} />
    <div style={box({ left: 0, top: KITCHEN.floorY + 200, width: 1700, height: 900, backgroundColor: "#CDB894" })} />
  </div>
);

export const KitchenTable: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: KITCHEN.table.x0, top: KITCHEN.tableTop, width: KITCHEN.table.x1 - KITCHEN.table.x0, height: 40, backgroundColor: C.wood })} />
    <div style={box({ left: KITCHEN.table.x0 + 20, top: KITCHEN.tableTop + 40, width: KITCHEN.table.x1 - KITCHEN.table.x0 - 40, height: 70, backgroundColor: C.woodDark })} />
    <div style={box({ left: KITCHEN.table.x0 + 40, top: KITCHEN.tableTop + 110, width: 26, height: 300, backgroundColor: C.woodDark })} />
    <div style={box({ left: KITCHEN.table.x1 - 66, top: KITCHEN.tableTop + 110, width: 26, height: 300, backgroundColor: C.woodDark })} />
    {/* пиалы с чаем */}
    {[300, 820].map((x) => (
      <div key={x} style={box({ left: x - 40, top: KITCHEN.tableTop - 40, width: 80, height: 44, backgroundColor: "#FFFFFF", borderRadius: "0 0 40px 40px", borderTop: "8px solid #A4553A" })} />
    ))}
  </div>
);

// Комната Бектура: стена, пробковая доска с крючком над его столом.
export const ROOM = { floorY: 1560, deskTop: 1240, desk: { x0: 520, x1: 1060 }, hook: { x: 790, y: 760 } } as const;

export const RoomBack: React.FC = () => (
  <div style={box({ left: -300, top: -200 })}>
    <div style={box({ left: 0, top: 0, width: 1700, height: ROOM.floorY + 200, backgroundColor: "#F6E2BE" })} />
    {/* окно детской (вечер) */}
    <div style={box({ left: 340, top: 500, width: 360, height: 460, backgroundColor: "#2A2F4A", border: `16px solid ${C.paper}`, boxSizing: "border-box" })} />
    {/* доска над столом и крючок */}
    <div style={box({ left: ROOM.hook.x + 300 - 200, top: ROOM.hook.y + 200 - 70, width: 400, height: 330, backgroundColor: "#C9A574", border: "12px solid #A67A4D", boxSizing: "border-box" })} />
    <div style={box({ left: ROOM.hook.x + 300 - 9, top: ROOM.hook.y + 200 - 10, width: 18, height: 34, backgroundColor: "#8A919C", borderRadius: "0 0 10px 10px" })} />
    {/* настольная лампа */}
    <div style={box({ left: 1250, top: 1180, width: 16, height: 260, backgroundColor: C.ink, transform: "rotate(-20deg)" })} />
    <div style={box({ left: 1180, top: 1130, width: 150, height: 80, backgroundColor: C.yellow, borderRadius: "80px 80px 0 0", transform: "rotate(-20deg)" })} />
    <div style={box({ left: 0, top: ROOM.floorY + 200, width: 1700, height: 900, backgroundColor: "#CDB894" })} />
  </div>
);

export const RoomDesk: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: ROOM.desk.x0, top: ROOM.deskTop, width: ROOM.desk.x1 - ROOM.desk.x0, height: 34, backgroundColor: C.blue })} />
    <div style={box({ left: ROOM.desk.x0 + 20, top: ROOM.deskTop + 34, width: 22, height: ROOM.floorY - ROOM.deskTop - 34, backgroundColor: "#1C2DC4" })} />
    <div style={box({ left: ROOM.desk.x1 - 42, top: ROOM.deskTop + 34, width: 22, height: ROOM.floorY - ROOM.deskTop - 34, backgroundColor: "#1C2DC4" })} />
  </div>
);
