// Школа: фасад с вывеской «Мектеп» и часами, крыльцо и дверь, школьный
// двор, ограда с воротами (те же ворота в обеих поездках), тротуар с
// арыком и деревьями с побелёнными стволами, горы вдали.
// Двор — y 1520…1740, линия ограды — y = 1760, тротуар — y 1770…1990.
import { fontFamily } from "../../fonts";
import { EM2_TEXT } from "../script";
import { box, Depth } from "../shots";
import { Mountains, WallClock } from "./Apartment";
import { Sky, Tree } from "./Outdoor";

export const SCHOOL = {
  door: { x: 470, y: 1500, w: 260, h: 380 },
  groundY: 1520,
  fenceY: 1760,
  gate: { x: 760, w: 380 }, // проём ворот
  clock: { x: 1060, y: 700 },
} as const;

// Фасад, двор (до ограды). inDoor — кто выходит из двери (в проёме).
export const SchoolBack: React.FC<{ readonly minutes: number; readonly inDoor?: React.ReactNode; readonly doorOpen?: number }> = ({ minutes, inDoor, doorOpen = 1 }) => {
  const d = SCHOOL.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      <Sky w={2000} h={1300} />
      <Depth depth={0.25}>
        <Mountains x={-300} y={340} w={2600} h={380} />
      </Depth>
      <div style={box({ left: -100, top: 560, width: 1600, height: 960, backgroundColor: "#F1E3C8" })} />
      <div style={box({ left: -120, top: 530, width: 1640, height: 40, backgroundColor: "#C9644F" })} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) =>
          (c === 2 && r === 2) || (c === 4 && r === 0) ? null : (
            <div key={`${r}-${c}`} style={box({ left: -40 + c * 240, top: 640 + r * 260, width: 150, height: 170, borderRadius: 8, backgroundColor: "#AFC9E0", border: "8px solid #FFFFFF", boxSizing: "border-box" })} />
          ),
        ),
      )}
      {/* часы на фасаде */}
      <div style={box({ left: SCHOOL.clock.x - 86, top: SCHOOL.clock.y - 86, width: 172, height: 172, borderRadius: 86, backgroundColor: "#C9644F" })} />
      <WallClock x={SCHOOL.clock.x} y={SCHOOL.clock.y} r={74} minutes={minutes} />
      {/* вывеска над входом */}
      <div style={box({ left: d.x - 70, top: d.y - d.h - 120, width: d.w + 140, height: 88, borderRadius: 14, backgroundColor: "#14285A", color: "#FFFFFF", fontFamily, fontSize: 52, fontWeight: 900, textAlign: "center", lineHeight: "88px" })}>{EM2_TEXT.school}</div>
      {/* вход: проём, кто выходит, створки */}
      <div style={box({ left: d.x, top: d.y - d.h, width: d.w, height: d.h, backgroundColor: "#4A5470", overflow: "hidden" })}>
        <div style={box({ left: -d.x, top: -(d.y - d.h), width: 2000, height: 2600 })}>{inDoor}</div>
        <div style={box({ left: 0, top: 0, width: (d.w / 2) * (1 - 0.85 * doorOpen), height: d.h, backgroundColor: "#8DB0CC", borderRight: "6px solid #6E8FAB" })} />
        <div style={box({ right: 0, top: 0, width: (d.w / 2) * (1 - 0.85 * doorOpen), height: d.h, backgroundColor: "#8DB0CC", borderLeft: "6px solid #6E8FAB" })} />
      </div>
      <div style={box({ left: d.x - 30, top: d.y - d.h - 30, width: d.w + 60, height: 30, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: d.x - 120, top: d.y, width: d.w + 240, height: 24, backgroundColor: "#D9D2C6" })} />
      {/* двор */}
      <div style={box({ left: -200, top: SCHOOL.groundY, width: 2400, height: 1100, backgroundColor: "#D8D1C5" })} />
      <div style={box({ left: -200, top: SCHOOL.groundY, width: 2400, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 110px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 3px, transparent 3px 90px)" })} />
      <Tree x={1300} y={1540} s={1.15} />
      <Tree x={-40} y={1540} s={1.1} kind="poplar" />
      <div style={box({ left: 1080, top: 1540, width: 300, height: 66, borderRadius: 33, backgroundColor: "#7FAF63" })} />
      {[1110, 1170, 1230, 1290, 1350].map((x, i) => (
        <div key={x} style={box({ left: x, top: 1546 + (i % 2) * 14, width: 22, height: 22, borderRadius: 11, backgroundColor: ["#E85D75", "#FFC90E", "#FFFFFF", "#E85D75", "#FFC90E"][i] })} />
      ))}
    </div>
  );
};

// Ограда с воротами и тротуар с арыком (передний план, рисуется после
// тех, кто во дворе, и до тех, кто на тротуаре).
export const SchoolFence: React.FC = () => {
  const g = SCHOOL.gate;
  const y = SCHOOL.fenceY;
  const posts = (from: number, to: number) => {
    const out: number[] = [];
    for (let x = from; x < to; x += 54) out.push(x);
    return out;
  };
  const rail = "#3E4C63";
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      {[
        [-200, g.x],
        [g.x + g.w, 2200],
      ].map(([a, b]) => (
        <div key={a}>
          <div style={box({ left: a, top: y - 250, width: b - a, height: 12, backgroundColor: rail })} />
          <div style={box({ left: a, top: y - 40, width: b - a, height: 12, backgroundColor: rail })} />
          {posts(a + 10, b - 10).map((x) => (
            <div key={x} style={box({ left: x, top: y - 280, width: 10, height: 280, borderRadius: "5px 5px 0 0", backgroundColor: rail })} />
          ))}
        </div>
      ))}
      {/* столбы ворот, открытые створки */}
      {[g.x - 30, g.x + g.w].map((x) => (
        <div key={x} style={box({ left: x, top: y - 330, width: 34, height: 336, borderRadius: 6, backgroundColor: "#2F3A4E" })} />
      ))}
      <div style={box({ left: g.x - 150, top: y - 270, width: 120, height: 250, backgroundImage: `repeating-linear-gradient(90deg, ${rail} 0 8px, transparent 8px 30px)`, borderTop: `10px solid ${rail}`, borderBottom: `10px solid ${rail}`, boxSizing: "border-box", transform: "skewY(-8deg)" })} />
      <div style={box({ left: g.x + g.w + 34, top: y - 270, width: 120, height: 250, backgroundImage: `repeating-linear-gradient(90deg, ${rail} 0 8px, transparent 8px 30px)`, borderTop: `10px solid ${rail}`, borderBottom: `10px solid ${rail}`, boxSizing: "border-box", transform: "skewY(8deg)" })} />
      {/* тротуар, арык, бордюр */}
      <div style={box({ left: -200, top: y + 4, width: 2400, height: 230, backgroundColor: "#DAD3C7" })} />
      <div style={box({ left: -200, top: y + 4, width: 2400, height: 230, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 3px, transparent 3px 120px)" })} />
      <div style={box({ left: -200, top: y + 234, width: 2400, height: 46, backgroundColor: "#A9A39A" })} />
      <div style={box({ left: -200, top: y + 244, width: 2400, height: 26, background: "linear-gradient(180deg, #6E9CB8, #8FB8CF)" })} />
      <div style={box({ left: -200, top: y + 280, width: 2400, height: 22, backgroundColor: "#EFECE6" })} />
      <div style={box({ left: -200, top: y + 302, width: 2400, height: 600, backgroundColor: "#6E737E" })} />
    </div>
  );
};

// Деревья у тротуара (самый передний план).
export const SidewalkTrees: React.FC = () => (
  <>
    <Tree x={140} y={SCHOOL.fenceY + 210} s={1.25} />
    <Tree x={1700} y={SCHOOL.fenceY + 210} s={1.3} kind="poplar" />
  </>
);
