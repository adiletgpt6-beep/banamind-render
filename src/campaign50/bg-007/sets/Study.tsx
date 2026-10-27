// Домашний уголок папы в бишкекской квартире, вечер: на стене большой
// бумажный календарь недели, справа окно (панельные дома с огнями, горы
// Ала-Тоо в сумерках), дверь в коридор, торшер, растение, ковёр.
// Мир — px; пол (низ стены) — y = STUDY.floorY. Одинаковые координаты
// во всех планах.
import { box } from "../shots";
import { Mountains } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const STUDY = {
  floorY: 1700,
  board: { x: 96, y: 560, scale: 0.78 },
  window: { x: 1190, y: 470, w: 400, h: 600 },
  door: { x: 1690, y: 760, w: 300, h: 940 },
} as const;

export const StudyBack: React.FC<{ readonly doorOpen?: number }> = ({ doorOpen = 0 }) => {
  const w = STUDY.window;
  const d = STUDY.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      {/* стена, плинтус, пол */}
      <div style={box({ left: -600, top: -400, width: 3400, height: STUDY.floorY + 400, background: "linear-gradient(180deg, #EADCC6 0%, #E6D3B8 100%)" })} />
      <div style={box({ left: -600, top: -400, width: 3400, height: STUDY.floorY + 400, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 60px, transparent 60px 120px)" })} />
      <div style={box({ left: -600, top: STUDY.floorY - 26, width: 3400, height: 26, backgroundColor: "#C9AE88" })} />
      <div style={box({ left: -600, top: STUDY.floorY, width: 3400, height: 900, background: "linear-gradient(180deg, #B98A5E 0%, #A97A50 100%)" })} />
      <div style={box({ left: -600, top: STUDY.floorY, width: 3400, height: 900, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 4px, transparent 4px 180px)" })} />
      {/* ковёр с орнаментом */}
      <div style={box({ left: 420, top: STUDY.floorY + 70, width: 1180, height: 190, borderRadius: 20, backgroundColor: "#A8413A", border: "10px solid #E9D7B4", boxSizing: "border-box" })} />
      <div style={box({ left: 460, top: STUDY.floorY + 104, width: 1100, height: 122, borderRadius: 12, border: "6px dashed #E9D7B4", boxSizing: "border-box" })} />
      {/* окно: вечерний Бишкек */}
      <div style={box({ left: w.x - 24, top: w.y - 24, width: w.w + 48, height: w.h + 48, borderRadius: 10, backgroundColor: "#F7F1E6", boxShadow: "0 8px 20px rgba(60,40,20,0.15)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", background: "linear-gradient(180deg, #33406E 0%, #6B5D86 55%, #E4A675 100%)" })}>
        <Mountains x={-60} y={250} w={560} h={190} evening={1} />
        <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: "scale(0.42)", transformOrigin: "0 0" })}>
          <PanelHouse x={-80} y={1440} w={600} floors={6} color="#B9A894" seed={3} />
          <PanelHouse x={600} y={1500} w={450} floors={7} color="#C7B8A4" seed={7} />
          <Tree x={540} y={1460} s={1.2} kind="poplar" tone={1} />
        </div>
        <div style={box({ left: 0, top: 0, width: w.w, height: w.h, backgroundColor: "rgba(40,30,70,0.18)" })} />
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#F7F1E6" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.42, width: w.w, height: 14, backgroundColor: "#F7F1E6" })} />
      <div style={box({ left: w.x - 40, top: w.y + w.h + 18, width: w.w + 80, height: 30, borderRadius: 6, backgroundColor: "#EFE6D6" })} />
      {/* шторы */}
      <div style={box({ left: w.x - 90, top: w.y - 60, width: 90, height: w.h + 170, borderRadius: "0 0 30px 30px", backgroundColor: "#5E8C86" })} />
      <div style={box({ left: w.x + w.w, top: w.y - 60, width: 90, height: w.h + 170, borderRadius: "0 0 30px 30px", backgroundColor: "#5E8C86" })} />
      <div style={box({ left: w.x - 120, top: w.y - 76, width: w.w + 240, height: 16, borderRadius: 8, backgroundColor: "#7A5A40" })} />
      {/* дверь в коридор */}
      <div style={box({ left: d.x - 18, top: d.y - 18, width: d.w + 36, height: d.h + 18, backgroundColor: "#F2E8D8" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#5B4A3E" })} />
      <div
        style={box({
          left: d.x,
          top: d.y,
          width: d.w * (1 - 0.75 * doorOpen),
          height: d.h,
          backgroundColor: "#A57E5B",
          boxShadow: "inset 0 0 0 10px #956F4E",
        })}
      />
      <div style={box({ left: d.x + d.w * (1 - 0.75 * doorOpen) - 50, top: d.y + d.h * 0.52, width: 24, height: 24, borderRadius: 12, backgroundColor: "#E2C27A" })} />
      {/* торшер и растение */}
      <Plant x={30} y={STUDY.floorY} />
      <div style={box({ left: 960, top: 380, width: 160, height: 160, borderRadius: 80, background: "radial-gradient(circle, rgba(255,230,170,0.65), rgba(255,230,170,0) 70%)" })} />
    </div>
  );
};

const Plant: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={240} height={420} viewBox="0 0 240 420" style={box({ left: x - 120, top: y - 420, overflow: "visible" })}>
    <path d="M 120 300 C 60 240 30 160 50 90 C 90 140 110 210 120 300 Z" fill="#5E9A6A" />
    <path d="M 120 300 C 170 230 200 150 190 70 C 150 130 130 210 120 300 Z" fill="#4E8A5C" />
    <path d="M 120 300 C 100 220 110 120 130 40 C 150 120 140 220 120 300 Z" fill="#6FAE77" />
    <path d="M 70 300 L 170 300 L 156 420 L 84 420 Z" fill="#D9805E" />
    <rect x={62} y={292} width={116} height={22} rx={6} fill="#C46E4E" />
  </svg>
);

// Торшер справа от календаря (тёплый свет вечером).
export const FloorLamp: React.FC<{ x: number }> = ({ x }) => (
  <svg width={260} height={1100} viewBox="0 0 260 1100" style={box({ left: x - 130, top: STUDY.floorY - 1100, overflow: "visible" })}>
    <ellipse cx={130} cy={210} rx={200} ry={170} fill="rgba(255,226,160,0.28)" />
    <path d="M 60 120 L 200 120 L 236 250 L 24 250 Z" fill="#F6E3B4" />
    <rect x={124} y={250} width={12} height={830} fill="#5A4636" />
    <ellipse cx={130} cy={1086} rx={70} ry={14} fill="#5A4636" />
  </svg>
);
