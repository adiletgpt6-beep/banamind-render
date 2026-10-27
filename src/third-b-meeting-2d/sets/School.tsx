// Школьная улица. Тихий переулок у школы: машина стоит у тротуара.
//   SchoolSidewalk — вид через улицу: фасад школы с надписью «Мектеп»,
//     тротуар у школы; машина у бордюра обращена к зрителю левой стороной
//     (нос влево), её правые двери — у тротуара, за машиной.
//   CurbSide — вид с тротуара (камера у школы): машина правой стороной к
//     зрителю (нос вправо), за ней дорога и дома напротив.
//   SchoolRoad — вид с дороги (левая сторона машины): за машиной тротуар и
//     забор школы, на переднем плане пустая полоса — рядом никто не едет.
import { box } from "../kit";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";

export const STREET = { ground: 1990, curb: 1900 } as const;

export const SchoolSidewalk: React.FC = () => (
  <div style={box({ left: -600, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 3400, height: 2100, backgroundColor: C.sky })} />
    <div style={box({ left: 300, top: 560, width: 2500, height: 1360, backgroundColor: "#EADFCB" })} />
    <div style={box({ left: 300, top: 500, width: 2500, height: 70, backgroundColor: C.green })} />
    {Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 9 }).map((__, c) =>
        c === 4 ? null : <div key={`${r}${c}`} style={box({ left: 400 + c * 270, top: 680 + r * 330, width: 160, height: 210, backgroundColor: C.glass, border: `10px solid ${C.paper}`, boxSizing: "border-box" })} />,
      ),
    )}
    {/* вход и надпись */}
    <div style={box({ left: 1450, top: 1430, width: 300, height: 490, backgroundColor: "#7A5A45" })} />
    <div style={box({ left: 1595, top: 1430, width: 10, height: 490, backgroundColor: "#5E4535" })} />
    <div style={box({ left: 1340, top: 1270, width: 520, height: 120, backgroundColor: C.green, color: C.paper, fontFamily: F.display, fontWeight: 900, fontSize: 92, textAlign: "center", lineHeight: "120px", borderRadius: 10 })}>{T3B_TEXT.school}</div>
    {/* деревья */}
    {[180, 2700].map((x) => (
      <div key={x} style={box({ left: x, top: 1100, width: 300, height: 360, borderRadius: "150px 150px 120px 120px", backgroundColor: "#8FB07C" })} />
    ))}
    {/* тротуар, бордюр, дорога */}
    <div style={box({ left: 0, top: STREET.curb - 20, width: 3400, height: 40, backgroundColor: "#CFC8BA" })} />
    <div style={box({ left: 0, top: STREET.curb + 20, width: 3400, height: 1600, backgroundColor: "#B9BCC2" })} />
  </div>
);

export const SchoolRoad: React.FC = () => (
  <div style={box({ left: -600, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 3400, height: 2100, backgroundColor: C.sky })} />
    {/* за машиной: тротуар, забор и школьный двор */}
    <div style={box({ left: 0, top: 900, width: 3400, height: 900, backgroundColor: "#EADFCB" })} />
    <div style={box({ left: 0, top: 850, width: 3400, height: 60, backgroundColor: C.green })} />
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} style={box({ left: i * 120, top: 1500, width: 14, height: 300, backgroundColor: C.navySoft })} />
    ))}
    <div style={box({ left: 0, top: 1520, width: 3400, height: 14, backgroundColor: C.navySoft })} />
    <div style={box({ left: 1200, top: 1180, width: 420, height: 100, backgroundColor: C.green, color: C.paper, fontFamily: F.display, fontWeight: 900, fontSize: 76, textAlign: "center", lineHeight: "100px", borderRadius: 10 })}>{T3B_TEXT.school}</div>
    {[500, 2300].map((x) => (
      <div key={x} style={box({ left: x, top: 1180, width: 300, height: 360, borderRadius: "150px 150px 120px 120px", backgroundColor: "#8FB07C" })} />
    ))}
    <div style={box({ left: 0, top: 1800, width: 3400, height: 80, backgroundColor: "#CFC8BA" })} />
    {/* пустая полоса дороги перед машиной, разметка */}
    <div style={box({ left: 0, top: 1880, width: 3400, height: 900, backgroundColor: "#A9ADB4" })} />
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={`m${i}`} style={box({ left: i * 320, top: 2240, width: 180, height: 16, backgroundColor: "#F2F2F2" })} />
    ))}
  </div>
);

export const CurbSide: React.FC = () => (
  <div style={box({ left: -600, top: 0 })}>
    <div style={box({ left: 0, top: 0, width: 3400, height: 2100, backgroundColor: C.sky })} />
    {/* дома на другой стороне улицы */}
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={box({ left: 100 + i * 680, top: 900 + (i % 2) * 80, width: 560, height: 700, backgroundColor: ["#E9D9C2", "#D9E1E5", "#EADFCB", "#E3D3C0", "#DCE3DA"][i] })}>
        {[0, 1].map((r) => [0, 1, 2].map((c) => <div key={`${r}${c}`} style={box({ left: 60 + c * 170, top: 90 + r * 220, width: 110, height: 140, backgroundColor: C.glass })} />))}
      </div>
    ))}
    <div style={box({ left: 0, top: 1600, width: 3400, height: 60, backgroundColor: "#CFC8BA" })} />
    {/* дорога за машиной — пустая */}
    <div style={box({ left: 0, top: 1660, width: 3400, height: 300, backgroundColor: "#A9ADB4" })} />
    {/* бордюр и тротуар у школы (передний план) */}
    <div style={box({ left: 0, top: 1960, width: 3400, height: 40, backgroundColor: "#CFC8BA" })} />
    <div style={box({ left: 0, top: 2000, width: 3400, height: 800, backgroundColor: "#D9D3C6" })} />
  </div>
);
