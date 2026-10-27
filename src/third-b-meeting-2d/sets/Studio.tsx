// Дизайн-студия «АЙКЫН» утром: светлая стена, большое окно, буквы названия
// на стене, доска с эскизами, стол с образцами материалов и ноутбуком.
import { box } from "../kit";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { BulakSign } from "../props/Call";

export const STUDIO = { floorY: 1700, deskTop: 1300, desk: { x0: 80, x1: 1000 } } as const;

export const StudioBack: React.FC = () => (
  <div style={box({ left: -400, top: -300 })}>
    <div style={box({ left: 0, top: 0, width: 2000, height: STUDIO.floorY + 300, backgroundColor: C.studioWall })} />
    {/* окно: утренний свет */}
    <div style={box({ left: 1120, top: 520, width: 520, height: 700, background: "linear-gradient(180deg, #DCEBF5, #F4EAD6)", border: `18px solid ${C.white}`, boxSizing: "border-box" })} />
    <div style={box({ left: 1371, top: 520, width: 18, height: 700, backgroundColor: C.white })} />
    <div style={box({ left: 980, top: 500, width: 900, height: 1300, background: "linear-gradient(200deg, rgba(255,240,200,0.45), rgba(255,240,200,0) 60%)" })} />
    {/* название студии на стене */}
    <div style={box({ left: 480, top: 580, fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.navy, letterSpacing: 6 })}>{T3B_TEXT.studio}</div>
    <div style={box({ left: 486, top: 710, fontFamily: F.text, fontWeight: 800, fontSize: 40, color: C.green })}>{T3B_TEXT.studioSub}</div>
    {/* доска с эскизами */}
    <div style={box({ left: 470, top: 810, width: 560, height: 420, backgroundColor: "#D9C3A0", border: `14px solid ${C.woodDark}`, boxSizing: "border-box" })} />
    <div style={box({ left: 500, top: 840, width: 270, height: 180, backgroundColor: "#FFFDF7", transform: "rotate(-3deg)" })}>
      <div style={box({ left: 25, top: 50 })}>
        <BulakSign variant={1} w={220} h={72} />
      </div>
    </div>
    <div style={box({ left: 790, top: 870, width: 210, height: 150, backgroundColor: "#FFFDF7", transform: "rotate(4deg)" })}>
      <div style={box({ left: 15, top: 40 })}>
        <BulakSign variant={2} w={180} h={62} />
      </div>
    </div>
    <div style={box({ left: 530, top: 1050, width: 440, height: 140, backgroundColor: "#FFFDF7", transform: "rotate(1deg)" })}>
      {[C.bulakA, "#C9A47A", "#9FA7AE", C.bulakB].map((c, i) => (
        <div key={c} style={box({ left: 20 + i * 104, top: 24, width: 84, height: 84, backgroundColor: c, borderRadius: 8 })} />
      ))}
    </div>
    {/* полка с образцами */}
    <div style={box({ left: 1700, top: 900, width: 260, height: 20, backgroundColor: C.woodDark })} />
    <div style={box({ left: 0, top: STUDIO.floorY + 300, width: 2000, height: 600, backgroundColor: C.floor })} />
  </div>
);

// Стол студии (передний план): столешница и ножки.
export const StudioDesk: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: STUDIO.desk.x0, top: STUDIO.deskTop, width: STUDIO.desk.x1 - STUDIO.desk.x0, height: 34, backgroundColor: "#E9E2D4" })} />
    <div style={box({ left: STUDIO.desk.x0 + 20, top: STUDIO.deskTop + 34, width: STUDIO.desk.x1 - STUDIO.desk.x0 - 40, height: 22, backgroundColor: "#CFC6B5" })} />
    <div style={box({ left: STUDIO.desk.x0 + 50, top: STUDIO.deskTop + 56, width: 24, height: 420, backgroundColor: C.navy })} />
    <div style={box({ left: STUDIO.desk.x1 - 74, top: STUDIO.deskTop + 56, width: 24, height: 420, backgroundColor: C.navy })} />
  </div>
);
