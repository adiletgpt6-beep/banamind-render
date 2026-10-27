import { SCHOOL, OFFICE } from "./layout";
export { SCHOOL, OFFICE } from "./layout";
// Школа и офис.
import { fontFamily } from "../../fonts";
import { NB2_TEXT } from "../script";
import { box, Depth } from "../shots";
import { Mountains, WallClock } from "./Apartment";
import { Sky, Tree } from "./Outdoor";
import { HandbagShape } from "../rig/Hand";



// Школа: фасад, вывеска, крыльцо, ограда, деревья. inDoor — те, кто входит
// в дверь (рисуются внутри проёма).
export const SchoolYard: React.FC<{ inDoor?: React.ReactNode; doorOpen?: number; minutes?: number }> = ({ inDoor, doorOpen = 1, minutes = 7 * 60 + 55 }) => {
  const d = SCHOOL.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      <Sky w={2000} h={1300} />
      <Depth depth={0.25}>
        <Mountains x={-300} y={360} w={2600} h={360} />
      </Depth>
      {/* здание школы */}
      <div style={box({ left: -100, top: 560, width: 1500, height: 960, backgroundColor: "#F1E3C8" })} />
      <div style={box({ left: -120, top: 530, width: 1540, height: 40, backgroundColor: "#C9644F" })} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) =>
          c === 2 || c === 3 ? null : (
            <div key={`${r}-${c}`} style={box({ left: -40 + c * 240, top: 640 + r * 260, width: 150, height: 170, borderRadius: 8, backgroundColor: "#AFC9E0", border: "8px solid #FFFFFF", boxSizing: "border-box" })} />
          ),
        ),
      )}
      {/* вывеска над входом */}
      <div style={box({ left: d.x - 90, top: d.y - d.h - 120, width: d.w + 180, height: 84, borderRadius: 14, backgroundColor: "#14285A", color: "#FFFFFF", fontFamily, fontSize: 40, fontWeight: 900, textAlign: "center", lineHeight: "84px" })}>{NB2_TEXT.school}</div>
      {/* часы на фасаде */}
      <WallClock x={d.x + d.w + 210} y={d.y - d.h - 78} r={58} minutes={minutes} />
      {/* вход: проём, кто входит, створки */}
      <div style={box({ left: d.x, top: d.y - d.h, width: d.w, height: d.h, backgroundColor: "#4A5470", overflow: "hidden" })}>
        <div style={box({ left: -d.x, top: -(d.y - d.h), width: 2000, height: 2600 })}>{inDoor}</div>
        <div style={box({ left: 0, top: 0, width: (d.w / 2) * (1 - 0.85 * doorOpen), height: d.h, backgroundColor: "#8DB0CC", borderRight: "6px solid #6E8FAB" })} />
        <div style={box({ right: 0, top: 0, width: (d.w / 2) * (1 - 0.85 * doorOpen), height: d.h, backgroundColor: "#8DB0CC", borderLeft: "6px solid #6E8FAB" })} />
      </div>
      <div style={box({ left: d.x - 30, top: d.y - d.h - 30, width: d.w + 60, height: 30, backgroundColor: "#FFFFFF" })} />
      {/* крыльцо */}
      <div style={box({ left: d.x - 120, top: d.y, width: d.w + 240, height: 30, backgroundColor: "#D9D2C6" })} />
      <div style={box({ left: d.x - 160, top: d.y + 30, width: d.w + 320, height: 30, backgroundColor: "#CEC6B9" })} />
      {/* двор: плитка, ограда с калиткой */}
      <div style={box({ left: -200, top: SCHOOL.groundY, width: 2400, height: 1100, backgroundColor: "#D8D1C5" })} />
      <div style={box({ left: -200, top: SCHOOL.groundY, width: 2400, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 110px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 3px, transparent 3px 90px)" })} />
      <Tree x={1180} y={1560} s={1.15} />
      <Tree x={-60} y={1560} s={1.1} kind="poplar" />
      {/* клумба */}
      <div style={box({ left: 1320, top: 1530, width: 320, height: 70, borderRadius: 35, backgroundColor: "#7FAF63" })} />
      {[1350, 1410, 1470, 1530, 1590].map((x, i) => (
        <div key={x} style={box({ left: x, top: 1536 + (i % 2) * 14, width: 22, height: 22, borderRadius: 11, backgroundColor: ["#E85D75", "#FFC90E", "#FFFFFF", "#E85D75", "#FFC90E"][i] })} />
      ))}
      {/* ограда (на переднем плане справа) */}
      <div style={box({ left: 1180, top: 1640, width: 900, height: 14, backgroundColor: "#4A5A6E" })} />
      <div style={box({ left: 1180, top: 1860, width: 900, height: 14, backgroundColor: "#4A5A6E" })} />
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={box({ left: 1190 + i * 56, top: 1610, width: 10, height: 300, backgroundColor: "#4A5A6E" })} />
      ))}
    </div>
  );
};

// Офис: стена, окно с городом и горами, часы, столы с мониторами.


// Стол: сидящий за ним смотрит в камеру; на столе ноутбук (виден сзади,
// не закрывает лицо), кружка, бумаги.
// Сумка, поставленная на стол: та же форма, что на плече и в руке
// (HandbagShape), точка хвата за ручки — grip, масштаб персонажа k.
export const DeskBag: React.FC<{ grip: { x: number; y: number }; k: number }> = ({ grip, k }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${grip.x} ${grip.y}) scale(${k})`}>
      <HandbagShape L={47} />
    </g>
  </svg>
);

export const Desk: React.FC<{ x: number; y: number; w: number; laptop?: number }> = ({ x, y, w, laptop = 0.3 }) => (
  <div style={box({ left: x, top: y - 330, width: w, height: 600 })}>
    <div style={box({ left: w * laptop - 95, top: 196, width: 190, height: 124, borderRadius: "12px 12px 4px 4px", backgroundColor: "#AEB6C4" })} />
    <div style={box({ left: w * laptop - 18, top: 244, width: 36, height: 36, borderRadius: 18, backgroundColor: "#C6CCD6" })} />
    <div style={box({ left: w * 0.78, top: 262, width: 50, height: 56, borderRadius: 8, backgroundColor: "#FFC90E" })} />
    <div style={box({ left: w * 0.55, top: 302, width: 110, height: 14, borderRadius: 3, backgroundColor: "#FFFFFF" })} />
    <div style={box({ left: 0, top: 316, width: w, height: 34, borderRadius: 10, backgroundColor: "#E9E3DA" })} />
    <div style={box({ left: 30, top: 350, width: w - 60, height: 250, backgroundColor: "#CFC7BA" })} />
    <div style={box({ left: 50, top: 380, width: w - 100, height: 8, backgroundColor: "#BDB4A6" })} />
  </div>
);

export const OfficeRoom: React.FC<{ minutes: number; doorOpen?: number; inDoor?: React.ReactNode }> = ({ minutes, doorOpen = 0, inDoor }) => {
  const d = OFFICE.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      <div style={box({ left: -200, top: 0, width: 2400, height: OFFICE.floorY, background: "linear-gradient(180deg, #E4EAF0, #EEF1F4)" })} />
      {/* окно: город и горы */}
      <div style={box({ left: 520, top: 380, width: 900, height: 560, borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, #CFE3F4, #F3E6D2)", border: "12px solid #FFFFFF", boxSizing: "border-box" })}>
        <Mountains x={-40} y={110} w={980} h={220} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={box({ left: i * 190 - 20, top: 300 - (i % 3) * 40, width: 150, height: 300, backgroundColor: ["#E3D3C1", "#D7CBBD", "#E8DCCB"][i % 3] })} />
        ))}
        <div style={box({ left: 438, top: 0, width: 12, height: 560, backgroundColor: "#FFFFFF" })} />
      </div>
      <WallClock x={420} y={460} r={78} minutes={minutes} />
      {/* доска: собрание было в 08:00 */}
      <div style={box({ left: 1440, top: 740, width: 240, height: 150, borderRadius: 8, backgroundColor: "#FFFFFF", border: "6px solid #D5DCE6", boxSizing: "border-box", fontFamily, color: "#3A4F80", fontWeight: 900, fontSize: 30, textAlign: "center", paddingTop: 22, lineHeight: 1.25, whiteSpace: "pre-line" })}>{NB2_TEXT.meeting}</div>
      {/* дверь */}
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#C8CFD8", overflow: "hidden" })}>
        <div style={box({ left: -d.x, top: -d.y, width: 2000, height: 2600 })}>{inDoor}</div>
        <div style={box({ left: 0, top: 0, width: d.w * (1 - 0.85 * doorOpen), height: d.h, backgroundColor: "#9AA7B8" })} />
      </div>
      <div style={box({ left: d.x - 20, top: d.y - 20, width: d.w + 40, height: 20, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: -200, top: OFFICE.floorY, width: 2400, height: 1100, backgroundColor: "#B9C2CE" })} />
      <div style={box({ left: -200, top: OFFICE.floorY, width: 2400, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 140px)" })} />
    </div>
  );
};

// Стул (спинка — за сидящим, сиденье).
export const ChairBack: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <div style={box({ left: x - 110 * s, top: y - 560 * s, width: 220 * s, height: 560 * s })}>
    <div style={box({ left: 20 * s, top: 0, width: 180 * s, height: 260 * s, borderRadius: 30 * s, backgroundColor: "#3C4659" })} />
    <div style={box({ left: 100 * s, top: 250 * s, width: 20 * s, height: 140 * s, backgroundColor: "#2A3140" })} />
    <div style={box({ left: 0, top: 380 * s, width: 220 * s, height: 40 * s, borderRadius: 14 * s, backgroundColor: "#3C4659" })} />
    <div style={box({ left: 100 * s, top: 420 * s, width: 20 * s, height: 110 * s, backgroundColor: "#2A3140" })} />
    <div style={box({ left: 20 * s, top: 520 * s, width: 180 * s, height: 14 * s, borderRadius: 7 * s, backgroundColor: "#2A3140" })} />
  </div>
);
