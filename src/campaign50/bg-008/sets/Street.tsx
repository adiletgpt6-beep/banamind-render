// Улица Бишкека сбоку: горы Ала-Тоо, панельные дома, тополя, арык,
// дорога; школа с вывеской «Мектеп» и воротами. Машина мамы —
// серебристая, без надписей (не машина BalaGo). Координаты мира — px;
// низ колёс на дороге — ROAD_Y.
import { fontFamily } from "../../../fonts";
import { NAVY } from "../screens";
import { BG8_TEXT } from "../script";
import { Depth, box } from "../shots";
import { Mountains } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const ROAD_Y = 1400;
export const MOM_CAR = "#AEB5BF";
export const SCHOOL_X = 2600;

// Школа: трёхэтажное светлое здание с вывеской «Мектеп», ворота.
export const SchoolBuilding: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={box({ left: x - 330, top: y - 560, width: 660, height: 560 })}>
    <div style={box({ left: 0, top: 60, width: 660, height: 500, backgroundColor: "#F2E6D6" })} />
    <div style={box({ left: -16, top: 44, width: 692, height: 26, backgroundColor: "#B9A58E" })} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 5 }).map((__, c) => (
        <div key={`${r}-${c}`} style={box({ left: 40 + c * 124, top: 110 + r * 120, width: 84, height: 80, borderRadius: 4, backgroundColor: "#9FB6CE", border: "5px solid #FFFFFF", boxSizing: "border-box" })} />
      )),
    )}
    <div style={box({ left: 250, top: 400, width: 160, height: 160, backgroundColor: "#6A5446", borderRadius: "10px 10px 0 0" })} />
    <div style={box({ left: 190, top: -10, width: 280, height: 70, borderRadius: 14, backgroundColor: NAVY, color: "#FFFFFF", fontFamily, fontSize: 44, fontWeight: 900, textAlign: "center", lineHeight: "70px" })}>{BG8_TEXT.route.school}</div>
  </div>
);

// Ограда школы с открытыми воротами (перед зданием).
export const SchoolFence: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={box({ left: x - 520, top: y - 120, width: 1040, height: 120 })}>
    <div style={box({ left: 0, top: 20, width: 380, height: 10, backgroundColor: "#4F6B8A" })} />
    <div style={box({ left: 660, top: 20, width: 380, height: 10, backgroundColor: "#4F6B8A" })} />
    {Array.from({ length: 14 }).map((_, i) => (
      <div key={i} style={box({ left: (i < 7 ? i * 56 : 660 + (i - 7) * 56) + 10, top: 0, width: 10, height: 120, backgroundColor: "#4F6B8A" })} />
    ))}
    <div style={box({ left: 380, top: -30, width: 18, height: 150, backgroundColor: "#3E5672" })} />
    <div style={box({ left: 642, top: -30, width: 18, height: 150, backgroundColor: "#3E5672" })} />
  </div>
);

// Улица целиком (мир 4000 px шириной от x = −600).
export const Street: React.FC<{ readonly withSchool?: boolean }> = ({ withSchool = true }) => (
  <>
    <Depth depth={0.15}>
      <div style={box({ left: -600, top: -400, width: 4400, height: ROAD_Y + 400, background: "linear-gradient(180deg, #CFE5F6 0%, #EAF3F8 60%, #FFF4E2 100%)" })} />
      <Mountains x={-600} y={380} w={4400} h={420} />
    </Depth>
    <Depth depth={0.55}>
      <PanelHouse x={-300} y={ROAD_Y - 120} w={420} floors={5} color="#E6DACB" seed={11} />
      <PanelHouse x={500} y={ROAD_Y - 130} w={360} floors={4} color="#DDE4EA" seed={12} />
      <PanelHouse x={1300} y={ROAD_Y - 120} w={330} floors={5} color="#EADFCF" seed={13} />
      <PanelHouse x={3200} y={ROAD_Y - 120} w={420} floors={4} color="#E0E6EC" seed={14} />
    </Depth>
    {withSchool ? <SchoolBuilding x={SCHOOL_X} y={ROAD_Y - 70} /> : null}
    {[-200, 260, 900, 1500, 2050, 3300].map((x, i) => (
      <Tree key={x} x={x} y={ROAD_Y - 60} s={0.85} kind={i % 2 ? "round" : "poplar"} tone={i % 2} />
    ))}
    {withSchool ? <SchoolFence x={SCHOOL_X} y={ROAD_Y - 66} /> : null}
    {/* тротуар, арык, дорога */}
    <div style={box({ left: -600, top: ROAD_Y - 70, width: 4400, height: 40, backgroundColor: "#E4E1DC" })} />
    <div style={box({ left: -600, top: ROAD_Y - 32, width: 4400, height: 12, backgroundColor: "#9FC1DD" })} />
    <div style={box({ left: -600, top: ROAD_Y - 20, width: 4400, height: 260, backgroundColor: "#5C6270" })} />
    <div style={box({ left: -600, top: ROAD_Y + 110, width: 4400, height: 10, backgroundImage: "repeating-linear-gradient(90deg, #FFFFFF 0 90px, transparent 90px 180px)" })} />
    <div style={box({ left: -600, top: ROAD_Y + 240, width: 4400, height: 800, backgroundColor: "#E4E1DC" })} />
  </>
);
