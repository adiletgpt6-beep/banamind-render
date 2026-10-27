// Школьный коридор на перемене: окно на горы и тополя, доска объявлений,
// крючки с куртками, плитка на полу. Пол — y = 1500.
import { box, Depth } from "../shots";
import { fontFamily } from "../../../fonts";
import { Mountains, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const HALL = { floorY: 1500 } as const;

export const SchoolHall: React.FC<{ readonly minutes: number }> = ({ minutes }) => (
  <>
    <div style={box({ left: -400, top: -200, width: 3000, height: HALL.floorY + 200, backgroundColor: "#E6F0EA" })} />
    <div style={box({ left: -400, top: 1100, width: 3000, height: 400, backgroundColor: "#CFE2D6" })} />
    <div style={box({ left: -400, top: 1092, width: 3000, height: 14, backgroundColor: "#B5CDBE" })} />
    {/* окно */}
    <div style={box({ left: 640, top: 360, width: 620, height: 620, overflow: "hidden", borderRadius: 6 })}>
      <Depth depth={0.4}>
        <div style={box({ left: -200, top: -200, width: 1100, height: 1100, background: "linear-gradient(180deg, #BFDDF3 0%, #E6F0F6 60%, #F7E9D6 100%)" })} />
        <Mountains x={-100} y={90} w={820} h={220} />
      </Depth>
      <Depth depth={0.6}>
        <PanelHouse x={-30} y={700} w={400} floors={3} color="#E9DCC8" seed={7} />
        <Tree x={470} y={700} s={1.2} kind="poplar" />
      </Depth>
    </div>
    <div style={box({ left: 624, top: 344, width: 652, height: 652, border: "16px solid #FFFFFF", borderRadius: 10, boxSizing: "border-box" })} />
    <div style={box({ left: 942, top: 360, width: 16, height: 620, backgroundColor: "#FFFFFF" })} />
    <div style={box({ left: 600, top: 990, width: 700, height: 26, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
    {/* доска объявлений */}
    <div style={box({ left: 90, top: 470, width: 400, height: 330, borderRadius: 12, backgroundColor: "#C79A6B", border: "12px solid #9C7450", boxSizing: "border-box" })}>
      <div style={box({ left: 30, top: 26, width: 150, height: 110, backgroundColor: "#FFF4C2", rotate: "-4deg" })} />
      <div style={box({ left: 200, top: 40, width: 140, height: 100, backgroundColor: "#FFFFFF", rotate: "3deg" })} />
      <div style={box({ left: 60, top: 160, width: 250, height: 110, backgroundColor: "#EAF3FC", rotate: "2deg", fontFamily, fontSize: 40, fontWeight: 900, color: "#14285A", display: "flex", alignItems: "center", justifyContent: "center" })}>Мектеп</div>
    </div>
    <WallClock x={1420} y={460} r={60} minutes={minutes} />
    {/* крючки с куртками */}
    {[1500, 1640, 1780].map((x, i) => (
      <div key={x}>
        <div style={box({ left: x, top: 700, width: 16, height: 30, borderRadius: 6, backgroundColor: "#7A8696" })} />
        <div style={box({ left: x - 50, top: 720, width: 116, height: 300, borderRadius: "40px 40px 16px 16px", backgroundColor: ["#E5677A", "#3E9C6B", "#7A6BC4"][i] })} />
      </div>
    ))}
    {/* пол */}
    <div style={box({ left: -400, top: HALL.floorY, width: 3000, height: 700, backgroundColor: "#D7CFC2", backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 160px)" })} />
  </>
);
