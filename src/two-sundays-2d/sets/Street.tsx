// Улица: фасад школы с вывеской «Мектеп», тротуар и дорога; двор дома.
// Машина семьи — обычный белый седан без надписей (props/Car.tsx).
import { box } from "../kit";
import { C, F } from "../theme";

export const STREET = { curbY: 1900, roadY: 2020 } as const;

export const SchoolFacade: React.FC<{ readonly warm?: number }> = ({ warm = 0 }) => (
  <div style={box({ left: -400, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 3200, height: 2100, backgroundColor: warm ? "#E9D9C2" : "#CFE0EE" })} />
    <div style={box({ left: 120, top: 620, width: 2700, height: 1300, backgroundColor: "#E9DCC7" })} />
    <div style={box({ left: 120, top: 560, width: 2700, height: 70, backgroundColor: C.orange })} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 10 }).map((__, c) =>
        c === 4 ? null : <div key={`${r}${c}`} style={box({ left: 200 + c * 260, top: 720 + r * 320, width: 150, height: 200, backgroundColor: C.glass, border: `10px solid ${C.white}`, boxSizing: "border-box" })} />,
      ),
    )}
    <div style={box({ left: 1170, top: 1460, width: 260, height: 460, backgroundColor: "#6B4A3A" })} />
    <div style={box({ left: 1060, top: 1320, width: 480, height: 110, backgroundColor: C.navy, color: C.white, fontFamily: F.display, fontWeight: 900, fontSize: 84, textAlign: "center", lineHeight: "110px" })}>Мектеп</div>
    <div style={box({ left: 0, top: STREET.curbY, width: 3200, height: 120, backgroundColor: "#8F949C" })} />
    <div style={box({ left: 0, top: STREET.roadY, width: 3200, height: 30, backgroundColor: "#C9C3B6" })} />
    <div style={box({ left: 0, top: STREET.roadY + 30, width: 3200, height: 800, backgroundColor: "#DDD6C8" })} />
  </div>
);

// Двор у дома: многоэтажка, деревья, тротуар.
export const HomeYard: React.FC = () => (
  <div style={box({ left: -400, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 3200, height: 2100, backgroundColor: "#D5E6F2" })} />
    <div style={box({ left: 300, top: 300, width: 1500, height: 1620, backgroundColor: "#EADFD0" })} />
    {Array.from({ length: 5 }).map((_, r) =>
      Array.from({ length: 6 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 380 + c * 230, top: 380 + r * 280, width: 140, height: 170, backgroundColor: C.glass, border: `8px solid ${C.white}`, boxSizing: "border-box" })} />),
    )}
    {[2000, 2500].map((x) => (
      <div key={x} style={box({ left: 0, top: 0 })}>
        <div style={box({ left: x + 70, top: 1300, width: 50, height: 620, backgroundColor: "#EDEDE6" })} />
        <div style={box({ left: x - 80, top: 820, width: 350, height: 600, borderRadius: "50%", backgroundColor: "#86B06A" })} />
      </div>
    ))}
    <div style={box({ left: 0, top: STREET.curbY, width: 3200, height: 120, backgroundColor: "#8F949C" })} />
    <div style={box({ left: 0, top: STREET.roadY, width: 3200, height: 30, backgroundColor: "#C9C3B6" })} />
    <div style={box({ left: 0, top: STREET.roadY + 30, width: 3200, height: 800, backgroundColor: "#DDD6C8" })} />
  </div>
);
