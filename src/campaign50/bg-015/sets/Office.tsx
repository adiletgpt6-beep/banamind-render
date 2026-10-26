// Офис папы: современный бизнес-центр Бишкека — светлый фасад, стеклянная
// входная группа, табличка, горы за зданием. Пол (тротуар) — y = 1700.
import { fontFamily } from "../../../fonts";
import { Mountains } from "../../../two-schedules-2d/sets/Apartment";
import { Sky, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { box, Depth } from "../../../two-schedules-2d/shots";

export const OFFICE = { floorY: 1700, door: { x: 360, w: 300, h: 420 } } as const;

export const OfficeBack: React.FC<{ doorOpen?: number }> = ({ doorOpen = 0 }) => {
  const d = OFFICE.door;
  return (
    <div style={box({ left: 0, top: 0, width: 1700, height: 2400 })}>
      <Sky w={1700} h={1200} />
      <Depth depth={0.25}>
        <Mountains x={-300} y={760} w={2400} h={360} />
      </Depth>
      {/* фасад */}
      <div style={box({ left: -100, top: 420, width: 1900, height: OFFICE.floorY - 420, backgroundColor: "#E9E6E1" })} />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 7 }).map((__, c) => (
          <div key={`${r}-${c}`} style={box({ left: -60 + c * 260, top: 470 + r * 160, width: 220, height: 120, backgroundColor: "#9DBAD3", borderRadius: 4, boxShadow: "inset 0 0 0 6px #D7DDE3" })} />
        )),
      )}
      <div style={box({ left: -100, top: 1270 - 10, width: 1900, height: 14, backgroundColor: "#CFCAC2" })} />
      {/* входная группа */}
      <div style={box({ left: d.x - 40, top: OFFICE.floorY - d.h - 60, width: d.w + 80, height: 40, borderRadius: 6, backgroundColor: "#3A4F80" })}>
        <div style={{ fontFamily, color: "#FFFFFF", fontWeight: 800, fontSize: 24, textAlign: "center", lineHeight: "40px", letterSpacing: 2 }}>БИЗНЕС БОРБОР</div>
      </div>
      <div style={box({ left: d.x, top: OFFICE.floorY - d.h, width: d.w, height: d.h, backgroundColor: "#5A6E86" })} />
      <div style={box({ left: d.x + 10, top: OFFICE.floorY - d.h + 10, width: d.w / 2 - 15 - doorOpen * 100, height: d.h - 10, backgroundColor: "rgba(190,214,232,0.85)", border: "4px solid #C8CED6", boxSizing: "border-box" })} />
      <div style={box({ left: d.x + d.w / 2 + 5 + doorOpen * 100, top: OFFICE.floorY - d.h + 10, width: d.w / 2 - 15 - doorOpen * 100, height: d.h - 10, backgroundColor: "rgba(190,214,232,0.85)", border: "4px solid #C8CED6", boxSizing: "border-box" })} />
      {/* тротуар */}
      <div style={box({ left: -100, top: OFFICE.floorY, width: 1900, height: 700, backgroundColor: "#CFC8BC" })} />
      <div style={box({ left: -100, top: OFFICE.floorY + 260, width: 1900, height: 16, backgroundColor: "#EFECE6" })} />
      <div style={box({ left: -100, top: OFFICE.floorY + 276, width: 1900, height: 500, backgroundColor: "#8C9099" })} />
      <Tree x={1180} y={OFFICE.floorY + 20} s={1.15} kind="poplar" />
    </div>
  );
};
