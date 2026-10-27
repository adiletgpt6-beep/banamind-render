// Утро в бишкекской квартире: светлая прихожая-гостиная. Слева входная
// дверь и крючки, по центру часы и окно (панельные дома, тополя, горы
// Ала-Тоо), справа высокий стол, на нём ноутбук папы с рабочей встречей.
// Палитра светлая, бело-жёлтая с тёмно-синим; красного в интерьере нет
// (красные только кроссовки сына). Мир — px; пол (низ стены) — HOME.floorY.
import { C } from "../palette";
import { box } from "../shots";
import { Mountains, Ornament, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

export const HOME = {
  floorY: 1600,
  door: { x: 250, y: 660, w: 300, h: 940 },
  clock: { x: 900, y: 500, r: 74 },
  window: { x: 1150, y: 560, w: 440, h: 560 },
  desk: { x: 1830, w: 400, top: 1020 },
  laptop: { x: 2010, y: 1020 },
} as const;

export const HomeBack: React.FC<{ readonly minutes: number }> = ({ minutes }) => {
  const w = HOME.window;
  const d = HOME.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2400, height: 2600 })}>
      {/* стена (светлая), плинтус, пол */}
      <div style={box({ left: -800, top: -800, width: 4000, height: HOME.floorY + 800, background: "linear-gradient(180deg, #FFFFFF 0%, #FBF7EE 70%, #F4EDDF 100%)" })} />
      <div style={box({ left: -800, top: -800, width: 4000, height: HOME.floorY + 800, backgroundImage: "repeating-linear-gradient(90deg, rgba(20,40,90,0.025) 0 4px, transparent 4px 90px)" })} />
      {/* жёлтая полоса-бордюр (фирменный акцент) */}
      <div style={box({ left: -800, top: 1200, width: 4000, height: 16, backgroundColor: C.yellowSoft })} />
      <div style={box({ left: -800, top: HOME.floorY - 22, width: 4000, height: 22, backgroundColor: "#FFFFFF", boxShadow: "0 -2px 0 #E6E0D2" })} />
      <div style={box({ left: -800, top: HOME.floorY, width: 4000, height: 1100, background: "linear-gradient(180deg, #E4CFAE 0%, #D6BC96 100%)" })} />
      <div style={box({ left: -800, top: HOME.floorY, width: 4000, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,30,0.07) 0 3px, transparent 3px 170px)" })} />
      {/* шырдак у двери: тёмно-синий с жёлтым орнаментом */}
      <svg width={760} height={150} viewBox="0 0 760 150" style={box({ left: 480, top: HOME.floorY + 70 })}>
        <rect x={6} y={12} width={752} height={138} rx={20} fill="rgba(30,30,40,0.12)" />
        <rect x={0} y={0} width={752} height={136} rx={20} fill="#2A3E74" />
        <rect x={12} y={12} width={728} height={112} rx={12} fill="none" stroke={C.yellow} strokeWidth={5} strokeDasharray="20 10" />
        <Ornament x={376} y={68} s={0.7} color={C.yellow} />
        <Ornament x={150} y={68} s={0.45} color="#FFFFFF" />
        <Ornament x={602} y={68} s={0.45} color="#FFFFFF" />
      </svg>

      {/* входная дверь (закрыта: все дома) */}
      <div style={box({ left: d.x - 26, top: d.y - 26, width: d.w + 52, height: d.h + 26, backgroundColor: "#FFFFFF", boxShadow: "0 0 0 2px #ECE6DA" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, background: "linear-gradient(90deg, #C9A57E, #B58D64)" })}>
        <div style={box({ left: 30, top: 60, width: d.w - 60, height: 360, border: "6px solid rgba(90,60,30,0.25)", borderRadius: 10, boxSizing: "border-box" })} />
        <div style={box({ left: 30, top: 470, width: d.w - 60, height: 400, border: "6px solid rgba(90,60,30,0.25)", borderRadius: 10, boxSizing: "border-box" })} />
        <div style={box({ left: d.w - 56, top: 470, width: 34, height: 12, borderRadius: 6, backgroundColor: "#3B3A40" })} />
        <div style={box({ left: d.w / 2 - 8, top: 250, width: 16, height: 16, borderRadius: 8, backgroundColor: "#3B3A40" })} />
      </div>
      {/* крючки: мамина сумка и куртки */}
      <div style={box({ left: 610, top: 840, width: 230, height: 20, backgroundColor: "#E3D7C2", borderRadius: 6 })} />
      {[640, 720, 800].map((x) => (
        <div key={x} style={box({ left: x - 6, top: 850, width: 12, height: 30, backgroundColor: "#8C7A62", borderRadius: 6 })} />
      ))}
      <div style={box({ left: 610, top: 872, width: 92, height: 300, borderRadius: "30px 30px 14px 14px", backgroundColor: "#9FB3D6" })} />
      <div style={box({ left: 696, top: 874, width: 70, height: 250, borderRadius: "26px 26px 12px 12px", backgroundColor: "#4C5568" })} />
      <div style={box({ left: 770, top: 878, width: 64, height: 76, borderRadius: "10px 10px 18px 18px", backgroundColor: "#E7C77B" })} />

      <WallClock x={HOME.clock.x} y={HOME.clock.y} r={HOME.clock.r} minutes={minutes} />

      {/* окно: утренний Бишкек */}
      <div style={box({ left: w.x - 24, top: w.y - 24, width: w.w + 48, height: w.h + 48, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 8px 20px rgba(60,50,30,0.12)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", background: "linear-gradient(180deg, #CFE6F7 0%, #EAF3F8 60%, #FFF3D6 100%)" })}>
        <Mountains x={-40} y={170} w={540} h={200} />
        <div style={box({ left: 0, top: 0, width: 1, height: 1, transform: "scale(0.42)", transformOrigin: "0 0" })}>
          <PanelHouse x={-60} y={1260} w={560} floors={6} color="#E7DCCB" seed={4} />
          <PanelHouse x={620} y={1320} w={480} floors={7} color="#EDE4D6" seed={9} />
          <Tree x={560} y={1290} s={1.2} kind="poplar" />
          <Tree x={1030} y={1310} s={1.0} kind="poplar" />
        </div>
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.42, width: w.w, height: 14, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: w.x - 40, top: w.y + w.h + 18, width: w.w + 80, height: 28, borderRadius: 6, backgroundColor: "#F3EEE4" })} />
      {/* лёгкие жёлтые шторы */}
      <div style={box({ left: w.x - 96, top: w.y - 60, width: 86, height: w.h + 170, borderRadius: "0 0 30px 30px", backgroundColor: "#FFE38A" })} />
      <div style={box({ left: w.x + w.w + 10, top: w.y - 60, width: 86, height: w.h + 170, borderRadius: "0 0 30px 30px", backgroundColor: "#FFE38A" })} />
      <div style={box({ left: w.x - 120, top: w.y - 76, width: w.w + 240, height: 16, borderRadius: 8, backgroundColor: "#C9B79A" })} />

      {/* высокий стол папы */}
      <div style={box({ left: HOME.desk.x, top: HOME.desk.top, width: HOME.desk.w, height: 26, borderRadius: 8, backgroundColor: "#D8C3A2" })} />
      <div style={box({ left: HOME.desk.x + 30, top: HOME.desk.top + 26, width: 22, height: HOME.floorY - HOME.desk.top - 26, backgroundColor: "#BFA77F" })} />
      <div style={box({ left: HOME.desk.x + HOME.desk.w - 52, top: HOME.desk.top + 26, width: 22, height: HOME.floorY - HOME.desk.top - 26, backgroundColor: "#BFA77F" })} />
      {/* растение */}
      <svg width={220} height={380} viewBox="0 0 240 420" style={box({ left: 1620, top: HOME.floorY - 380, overflow: "visible" })}>
        <path d="M 120 300 C 60 240 30 160 50 90 C 90 140 110 210 120 300 Z" fill="#5E9A6A" />
        <path d="M 120 300 C 170 230 200 150 190 70 C 150 130 130 210 120 300 Z" fill="#4E8A5C" />
        <path d="M 120 300 C 100 220 110 120 130 40 C 150 120 140 220 120 300 Z" fill="#6FAE77" />
        <path d="M 70 300 L 170 300 L 156 420 L 84 420 Z" fill="#FFFFFF" stroke="#E3DDD0" strokeWidth={4} />
      </svg>
      {/* утренний свет из окна */}
      <div style={box({ left: 900, top: 0, width: 1100, height: 2600, background: "radial-gradient(ellipse at 50% 35%, rgba(255,240,200,0.35), transparent 60%)" })} />
    </div>
  );
};

// Ноутбук на столе (экран к зрителю): рабочая встреча — четыре окна
// с коллегами. open 0…1 — крышка закрывается (экран складывается).
export const Laptop: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly open?: number; readonly title: string }> = ({ x, y, f, open = 1, title }) => {
  const W = 340;
  const H = 220 * open;
  const talk = (k: number) => 0.6 + 0.4 * Math.abs(Math.sin((f + k * 13) / 5));
  return (
    <div style={box({ left: x - W / 2, top: y - H - 14, width: W, height: H + 30 })}>
      <div style={box({ left: 0, top: 0, width: W, height: H, borderRadius: 14, backgroundColor: "#2B2F3C", overflow: "hidden" })}>
        {open > 0.3 ? (
          <div style={box({ left: 10, top: 10, right: 10, bottom: 10, borderRadius: 8, backgroundColor: "#EEF2F8", opacity: Math.min(1, (open - 0.3) / 0.3) })}>
            <div style={box({ left: 10, top: 6, fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: "inherit" })}>{title}</div>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={box({ left: 10 + (k % 2) * 155, top: 40 + Math.floor(k / 2) * 76, width: 145, height: 70, borderRadius: 8, backgroundColor: ["#C9D6EE", "#F4E2B8", "#D7E8DA", "#E6D6EE"][k] })}>
                <div style={box({ left: 52, top: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: ["#6E5848", "#3E3230", "#8B6B55", "#4B3A33"][k] })} />
                <div style={box({ left: 46, top: 46, width: 52, height: 24, borderRadius: "26px 26px 0 0", backgroundColor: ["#4C6EA8", "#C08A3E", "#4E8A5C", "#7E5BA0"][k] })} />
                {k === 1 ? <div style={box({ left: 8, bottom: 6, width: 30, height: 6, borderRadius: 3, backgroundColor: C.green, scale: `${talk(k)} 1`, transformOrigin: "0 50%" })} /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div style={box({ left: -20, top: H, width: W + 40, height: 16, borderRadius: "4px 4px 12px 12px", backgroundColor: "#BCC3CF" })} />
    </div>
  );
};
