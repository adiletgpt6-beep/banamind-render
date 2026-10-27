// Общие декорации BG-050: комната (стена, плинтус, пол), окно с видом на
// Бишкек (горы Ала-Тоо, панельные дома, тополя) — днём, после обеда,
// в сумерках и ночью, — стол (передняя панель закрывает ноги сидящих),
// стул, торшер, полка, растение. Координаты — px мира; пол — FLOOR.
import { box } from "../shots";
import { Mountains } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const FLOOR = 1700;
// Рост персонажей (px мира) и высота стола/сиденья от пола.
export const H = { adult: 1000, dad: 1040, child: 720 } as const;
export const TABLE_TOP = FLOOR - 440;
export const SEAT = 270;

export type Light = "day" | "afternoon" | "dusk" | "night";

const SKY: Record<Light, string> = {
  day: "linear-gradient(180deg, #BFE0F6 0%, #E4F0F8 60%, #FFF4DC 100%)",
  afternoon: "linear-gradient(180deg, #C7E1F2 0%, #F3EBDD 65%, #FFE2B8 100%)",
  dusk: "linear-gradient(180deg, #3E4C80 0%, #8C6E92 55%, #F2B07F 100%)",
  night: "linear-gradient(180deg, #16204A 0%, #263667 60%, #3D4A78 100%)",
};

// Вид из окна: Ала-Тоо с белыми вершинами, панельные дома, тополя.
// Вечером и ночью в окнах свет, горы — силуэтом.
export const CityView: React.FC<{ readonly w: number; readonly h: number; readonly light: Light }> = ({ w, h, light }) => {
  const dark = light === "dusk" || light === "night";
  const k = w / 1000;
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, overflow: "hidden", background: SKY[light] })}>
      {light === "night" ? (
        <>
          <div style={box({ left: w * 0.74, top: h * 0.1, width: 46 * k, height: 46 * k, borderRadius: 999, backgroundColor: "#FFF4C8", boxShadow: "0 0 40px rgba(255,240,190,0.6)" })} />
          {[0.12, 0.3, 0.52, 0.86, 0.64].map((x, i) => (
            <div key={i} style={box({ left: w * x, top: h * (0.06 + 0.07 * (i % 3)), width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFFFFF", opacity: 0.7 })} />
          ))}
        </>
      ) : null}
      <Mountains x={-20 * k} y={h * 0.3} w={w + 40 * k} h={h * 0.42} evening={dark ? 1 : 0} />
      <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: `scale(${0.34 * k})`, transformOrigin: "0 0" })}>
        <PanelHouse x={-60} y={(h / (0.34 * k)) * 1.0} w={760} floors={5} color={dark ? "#5B5F7E" : "#E7DCCB"} seed={light === "night" ? 21 : 4} />
        <PanelHouse x={1180} y={(h / (0.34 * k)) * 1.03} w={700} floors={6} color={dark ? "#4E5373" : "#EDE4D6"} seed={light === "night" ? 23 : 9} />
        <PanelHouse x={2080} y={(h / (0.34 * k)) * 0.99} w={760} floors={4} color={dark ? "#565A78" : "#E3D8C6"} seed={light === "night" ? 25 : 7} />
        <Tree x={900} y={(h / (0.34 * k)) * 1.02} s={1.6} kind="poplar" tone={dark ? 1 : 0} />
        <Tree x={1020} y={(h / (0.34 * k)) * 1.03} s={1.35} kind="poplar" tone={dark ? 1 : 0} />
        <Tree x={1960} y={(h / (0.34 * k)) * 1.04} s={1.5} kind="poplar" tone={dark ? 1 : 0} />
        <Tree x={2860} y={(h / (0.34 * k)) * 1.02} s={1.3} kind="round" tone={dark ? 1 : 0} />
      </div>
      {dark ? <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: light === "night" ? "rgba(14,22,60,0.42)" : "rgba(40,30,80,0.22)" })} /> : null}
      {dark
        ? Array.from({ length: 22 }).map((_, i) => {
            const r = (n: number) => {
              const s = Math.sin(n * 77.3 + 11.1) * 43758.5;
              return s - Math.floor(s);
            };
            return (
              <div
                key={i}
                style={box({
                  left: w * (0.02 + 0.95 * r(i)),
                  top: h * (0.7 + 0.26 * r(i + 50)),
                  width: 14 * k,
                  height: 18 * k,
                  borderRadius: 2,
                  backgroundColor: "#FFD98A",
                  opacity: 0.85,
                  boxShadow: "0 0 10px rgba(255,210,120,0.6)",
                })}
              />
            );
          })
        : null}
    </div>
  );
};

// Окно в стене: рама, переплёт, подоконник, шторы.
export const Window: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly light: Light;
  readonly curtain?: string;
}> = ({ x, y, w, h, light, curtain = "#FFE38A" }) => (
  <>
    <div style={box({ left: x - 22, top: y - 22, width: w + 44, height: h + 44, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(60,50,30,0.12)" })} />
    <div style={box({ left: x, top: y, width: w, height: h, overflow: "hidden" })}>
      <CityView w={w} h={h} light={light} />
    </div>
    <div style={box({ left: x + w / 2 - 7, top: y, width: 14, height: h, backgroundColor: "#FFFFFF" })} />
    <div style={box({ left: x, top: y + h * 0.4, width: w, height: 14, backgroundColor: "#FFFFFF" })} />
    <div style={box({ left: x - 40, top: y + h + 16, width: w + 80, height: 26, borderRadius: 6, backgroundColor: "#F3EEE4" })} />
    <div style={box({ left: x - 92, top: y - 56, width: 80, height: h + 160, borderRadius: "0 0 30px 30px", backgroundColor: curtain })} />
    <div style={box({ left: x + w + 12, top: y - 56, width: 80, height: h + 160, borderRadius: "0 0 30px 30px", backgroundColor: curtain })} />
    <div style={box({ left: x - 116, top: y - 72, width: w + 232, height: 16, borderRadius: 8, backgroundColor: "#C9B79A" })} />
  </>
);

// Стена, жёлтый бордюр, плинтус и пол. tone — оттенок стены.
export const RoomShell: React.FC<{ readonly wall: string; readonly floor: string; readonly stripe?: string; readonly dim?: number }> = ({ wall, floor, stripe, dim = 0 }) => (
  <>
    <div style={box({ left: -1200, top: -1200, width: 4000, height: FLOOR + 1200, background: wall })} />
    <div style={box({ left: -1200, top: -1200, width: 4000, height: FLOOR + 1200, backgroundImage: "repeating-linear-gradient(90deg, rgba(20,40,90,0.025) 0 4px, transparent 4px 90px)" })} />
    {stripe ? <div style={box({ left: -1200, top: FLOOR - 560, width: 4000, height: 14, backgroundColor: stripe })} /> : null}
    <div style={box({ left: -1200, top: FLOOR - 22, width: 4000, height: 22, backgroundColor: "#FFFFFF", boxShadow: "0 -2px 0 #E6E0D2" })} />
    <div style={box({ left: -1200, top: FLOOR, width: 4000, height: 1400, background: floor })} />
    <div style={box({ left: -1200, top: FLOOR, width: 4000, height: 1400, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,30,0.07) 0 3px, transparent 3px 170px)" })} />
    {dim > 0 ? <div style={box({ left: -1200, top: -1200, width: 4000, height: 4000, backgroundColor: `rgba(30,25,60,${dim})` })} /> : null}
  </>
);

// Передняя панель стола: рисуется после персонажей и закрывает ноги
// сидящих; руки на столешнице (выше top) остаются видны.
export const TableFront: React.FC<{ readonly x: number; readonly w: number; readonly top?: number; readonly color?: string; readonly edge?: string }> = ({
  x,
  w,
  top = TABLE_TOP,
  color = "#E9D6B8",
  edge = "#D4BC97",
}) => (
  <>
    <div style={box({ left: x, top: top - 4, width: w, height: 30, borderRadius: 10, backgroundColor: edge })} />
    <div style={box({ left: x + 10, top: top + 22, width: w - 20, height: 120, borderRadius: "0 0 10px 10px", backgroundColor: color, boxShadow: "inset 0 10px 0 rgba(0,0,0,0.05)" })} />
    <div style={box({ left: x + 30, top: top + 140, width: 28, height: FLOOR - top - 140, backgroundColor: edge })} />
    <div style={box({ left: x + w - 58, top: top + 140, width: 28, height: FLOOR - top - 140, backgroundColor: edge })} />
    <div style={box({ left: x + 40, top: FLOOR - 10, width: w - 80, height: 20, borderRadius: 10, backgroundColor: "rgba(40,30,20,0.12)" })} />
  </>
);

// Стул (вид спереди/сбоку): спинка за сидящим, сиденье на высоте SEAT.
export const Chair: React.FC<{ readonly x: number; readonly color?: string; readonly back?: boolean; readonly seat?: boolean }> = ({ x, color = "#B9895E", back = true, seat = true }) => (
  <>
    {back ? (
      <>
        <div style={box({ left: x - 120, top: FLOOR - SEAT - 420, width: 240, height: 60, borderRadius: 18, backgroundColor: color })} />
        <div style={box({ left: x - 110, top: FLOOR - SEAT - 380, width: 22, height: 400, borderRadius: 8, backgroundColor: color })} />
        <div style={box({ left: x + 88, top: FLOOR - SEAT - 380, width: 22, height: 400, borderRadius: 8, backgroundColor: color })} />
        <div style={box({ left: x - 100, top: FLOOR - SEAT - 250, width: 200, height: 22, borderRadius: 8, backgroundColor: color, opacity: 0.85 })} />
      </>
    ) : null}
    {seat ? (
      <>
        <div style={box({ left: x - 130, top: FLOOR - SEAT - 10, width: 260, height: 34, borderRadius: 12, backgroundColor: color, filter: "brightness(0.92)" })} />
        <div style={box({ left: x - 112, top: FLOOR - SEAT + 20, width: 20, height: SEAT - 20, backgroundColor: color, filter: "brightness(0.8)" })} />
        <div style={box({ left: x + 92, top: FLOOR - SEAT + 20, width: 20, height: SEAT - 20, backgroundColor: color, filter: "brightness(0.8)" })} />
      </>
    ) : null}
  </>
);

// Торшер с тёплым светом.
export const FloorLamp: React.FC<{ readonly x: number; readonly on?: number }> = ({ x, on = 1 }) => (
  <>
    <div style={box({ left: x - 360, top: FLOOR - 1400, width: 720, height: 900, background: `radial-gradient(ellipse at 50% 30%, rgba(255,214,140,${0.45 * on}), transparent 65%)` })} />
    <div style={box({ left: x - 9, top: FLOOR - 1060, width: 18, height: 1060, backgroundColor: "#4A4250" })} />
    <div style={box({ left: x - 80, top: FLOOR - 16, width: 160, height: 16, borderRadius: 8, backgroundColor: "#4A4250" })} />
    <div style={box({ left: x - 110, top: FLOOR - 1200, width: 220, height: 170, borderRadius: "40px 40px 12px 12px", backgroundColor: on > 0.5 ? "#FFE7A6" : "#F0E6D2", boxShadow: on > 0.5 ? "0 30px 80px rgba(255,200,110,0.55)" : undefined })} />
  </>
);

// Комнатное растение в белом горшке.
export const Plant: React.FC<{ readonly x: number; readonly s?: number; readonly y?: number }> = ({ x, s = 1, y = FLOOR }) => (
  <svg width={240 * s} height={420 * s} viewBox="0 0 240 420" style={box({ left: x - 120 * s, top: y - 420 * s, overflow: "visible" })}>
    <path d="M 120 300 C 60 240 30 160 50 90 C 90 140 110 210 120 300 Z" fill="#5E9A6A" />
    <path d="M 120 300 C 170 230 200 150 190 70 C 150 130 130 210 120 300 Z" fill="#4E8A5C" />
    <path d="M 120 300 C 100 220 110 120 130 40 C 150 120 140 220 120 300 Z" fill="#6FAE77" />
    <path d="M 70 300 L 170 300 L 156 420 L 84 420 Z" fill="#FFFFFF" stroke="#E3DDD0" strokeWidth={4} />
  </svg>
);
