// Мир ответа 3: светлая мастерская предпринимательницы — войлочные изделия
// с орнаментом «кочкор мүйүз» на полках, окно на Ала-Тоо. Она раскладывает
// образцы войлока на рабочем столе, отходит на полшага, улыбается и
// отвечает: «Өз ишимди өнүктүрүүгө көбүрөөк көңүл бурат элем.»
// Мир — px; f — кадр от начала сцены studio (может быть < 0 и больше длины).
import { lineIn, useTimeline } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, easeInOut, keys, keysV, lerp, type Vec } from "../rig/motion";
import { box, type Cam } from "../shots";
import { Ornament } from "../sets/Apartment";
import { FLOOR, H, Plant, RoomShell, Window } from "../sets/Room";
import { C } from "../palette";

const TOP = FLOOR - 0.47 * H.adult; // рабочий стол
const DEPTH = 110;
const MAKER = { x: 560, y: FLOOR + 26 } as const;
// образцы на столе: 4 × 2 (перспектива: дальний ряд выше и меньше)
const COLORS = [C.yellow, "#5E9A93", "#2F4A7A", "#D98B5F", "#F4E9D2", "#7FB3E0", "#E8B547", "#8A9B5E"];
const SLOT = (i: number): Vec => ({ x: 330 + (i % 4) * 120 + (i >= 4 ? -10 : 0), y: TOP - (i < 4 ? 80 : 30) });
const STACK: Vec = { x: 190, y: TOP - 40 };

export const studioKeys = (tl: ReturnType<typeof useTimeline>) => {
  const b01 = lineIn(tl, "b01", "studio");
  const pick = Math.max(4, b01.from - 44);
  const put = pick + 20;
  const back = put + 8;
  const look = Math.max(back + 6, b01.from - 12);
  return { b01, pick, put, back, look };
};

export const STUDIO_PORTRAIT: Cam = { x: 590, y: 900, s: 2.3 };
export const STUDIO_TILE: Cam = { x: 560, y: 990, s: 1.62 };
export const studioCam = (f: number, k: ReturnType<typeof studioKeys>): Cam => {
  const a: Cam = { x: 560, y: 1000, s: 1.55 };
  const b: Cam = { x: 560, y: 965, s: 1.72 };
  const t = easeInOut((f - (k.look - 10)) / 44);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t) };
};

// Образец войлока на столе (вид спереди-сверху).
const Felt: React.FC<{ readonly p: Vec; readonly c: string; readonly s?: number }> = ({ p, c, s = 1 }) => (
  <svg width={1} height={1} style={box({ left: p.x, top: p.y, overflow: "visible" })}>
    <g transform={`scale(${s})`}>
      <path d="M -50 -18 L 50 -18 L 56 18 L -56 18 Z" fill={c} />
      <path d="M -40 -11 L 40 -11 L 44 11 L -44 11 Z" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeDasharray="6 5" opacity={0.85} />
      <path d="M 0 -6 C -16 -8 -18 6 -6 5 M 0 -6 C 16 -8 18 6 6 5" stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />
    </g>
  </svg>
);

// Полки с войлочными изделиями.
const Shelves: React.FC = () => (
  <>
    {[640, 860].map((y) => (
      <div key={y} style={box({ left: 40, top: y, width: 600, height: 18, borderRadius: 6, backgroundColor: "#D7C2A0", boxShadow: "0 6px 0 rgba(0,0,0,0.05)" })} />
    ))}
    {/* свёрнутые ала-кийизы */}
    {["#C9825B", "#2F4A7A", C.yellow].map((c, i) => (
      <div key={c} style={box({ left: 70 + i * 92, top: 556, width: 84, height: 84, borderRadius: 42, backgroundColor: c, boxShadow: "inset 0 0 0 10px rgba(255,255,255,0.25)" })} />
    ))}
    {/* подушки с орнаментом */}
    <svg width={330} height={140} viewBox="0 0 330 140" style={box({ left: 330, top: 500 })}>
      <rect x={0} y={20} width={150} height={120} rx={26} fill="#2F4A7A" />
      <Ornament x={75} y={80} s={0.55} color={C.yellow} />
      <rect x={170} y={30} width={150} height={110} rx={26} fill="#5E9A93" />
      <Ornament x={245} y={85} s={0.5} color="#FFFFFF" />
    </svg>
    {/* войлочные тапочки и маленькая юрта */}
    <svg width={560} height={130} viewBox="0 0 560 130" style={box({ left: 60, top: 730 })}>
      <path d="M 10 120 Q 10 70 60 70 L 120 70 Q 150 70 150 100 L 150 120 Z" fill="#D98B5F" />
      <path d="M 160 120 Q 160 70 210 70 L 270 70 Q 300 70 300 100 L 300 120 Z" fill="#D98B5F" />
      <path d="M 60 82 L 120 82 M 210 82 L 270 82" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="8 6" />
      <path d="M 360 128 L 360 70 Q 430 10 500 70 L 500 128 Z" fill="#F4E9D2" stroke="#C9A97D" strokeWidth={4} />
      <path d="M 360 92 L 500 92" stroke="#C9825B" strokeWidth={8} />
      <rect x={418} y={98} width={24} height={30} fill="#2F4A7A" />
    </svg>
  </>
);

export const StudioWorld: React.FC<{ readonly f: number }> = ({ f }) => {
  const tl = useTimeline();
  const k = studioKeys(tl);
  const place = (): Place => ({ x: MAKER.x, y: MAKER.y, h: H.adult });
  const P = place();
  const placed = f >= k.put; // последний образец лёг в пустую ячейку
  const pose = (t: number): PoseIn => {
    const speaking = t >= k.b01.from - 4 && t <= k.b01.to + 6;
    const REST_R: Vec = { x: P.x + 150, y: P.y - 480 };
    const GESTURE: Vec = { x: P.x + 230, y: P.y - 650 };
    // до начала действия — поправляет образцы (живое движение в портрете)
    const adjust: Vec = { x: SLOT(1).x + 14 * Math.sin(t / 9), y: SLOT(1).y - 22 + 5 * Math.sin(t / 5) };
    const armR: PoseIn["armR"] =
      t < k.pick - 10
        ? { target: adjust, shape: "open", elbow: "down", behind: false }
        : t < k.put + 4
          ? {
              target: keysV(t, [[k.pick - 10, adjust], [k.pick, { x: STACK.x + 20, y: STACK.y - 40 }], [k.put, { x: SLOT(6).x, y: SLOT(6).y - 40 }]], anticipate),
              shape: t >= k.pick && t < k.put ? "pinch" : "open",
              item: t >= k.pick && t < k.put ? "felt" : "none",
              itemColor: COLORS[6],
              elbow: "down",
              behind: false,
            }
          : {
              // одна непрерывная траектория: образец → покой → жест на реплике → покой
              target: keysV(
                t,
                [
                  [k.put + 4, { x: SLOT(6).x, y: SLOT(6).y - 40 }],
                  [k.back + 10, REST_R],
                  [k.b01.from - 4, REST_R],
                  [k.b01.from + 12, GESTURE],
                  [k.b01.to, GESTURE],
                  [k.b01.to + 18, REST_R],
                ],
                anticipate,
              ),
              shape: speaking ? "open" : "relax",
              wrist: -30 * keys(t, [[k.b01.from - 4, 0], [k.b01.from + 12, 1], [k.b01.to, 1], [k.b01.to + 18, 0]]),
              elbow: "down",
              behind: false,
            };
    const armL: PoseIn["armL"] = { target: keysV(t, [[k.back, { x: SLOT(4).x, y: SLOT(4).y - 30 }], [k.back + 14, { x: P.x - 160, y: P.y - 470 }]], anticipate), shape: t < k.back ? "open" : "relax", elbow: "down", behind: false };
    return {
      armR,
      armL,
      expr: t < k.back ? "calm" : "smile",
      lookY: t < k.look ? 0.55 : keys(t, [[k.look, 0.4], [k.look + 12, 0]]),
      nod: t < k.look ? 8 : speaking ? 2 * Math.sin((t - k.b01.from) / 10) : 0,
      headTilt: t > k.back ? keys(t, [[k.back, 0], [k.back + 10, -5]]) : 0,
      lean: t < k.back ? 7 : keys(t, [[k.back, 7], [k.back + 14, 0]]),
    };
  };
  const face = (t: number) => keys(t, [[k.pick - 8, 0.1], [k.pick, -0.55], [k.pick + 10, -0.3], [k.put, 0.25], [k.look, 0.15], [k.look + 12, 0.04]]);
  return (
    <div style={box({ left: 0, top: 0, width: 1, height: 1 })}>
      <RoomShell wall="linear-gradient(180deg, #FFFFFF 0%, #FBF5EC 70%, #F5EBDD 100%)" floor="linear-gradient(180deg, #D8C3A5 0%, #C9B08D 100%)" stripe={C.yellowSoft} />
      <Window x={720} y={360} w={460} h={560} light="afternoon" curtain="#F4E9D2" />
      <Shelves />
      <Plant x={1240} s={1.15} />
      <Actor uid="s-mom" look="momMaker" f={f} place={place} face={face} pose={pose} role="momMaker" seed={31} layer="body" />
      {/* столешница с образцами */}
      <div style={box({ left: 90, top: TOP - DEPTH, width: 900, height: DEPTH, background: "linear-gradient(180deg, #F3E6D0, #E8D5B6)", clipPath: "polygon(3% 0, 97% 0, 100% 100%, 0 100%)" })} />
      {[0, 1, 2, 3, 4, 5, 7].map((i) => (
        <Felt key={i} p={SLOT(i)} c={COLORS[i]} s={i < 4 ? 0.92 : 1} />
      ))}
      {placed ? <Felt p={SLOT(6)} c={COLORS[6]} /> : null}
      {/* стопка образцов */}
      {[0, 1, 2, 3].map((i) => (
        <Felt key={`st${i}`} p={{ x: STACK.x, y: STACK.y - i * 9 }} c={[C.yellow, "#D98B5F", "#5E9A93", "#E8B547"][i]} s={0.95} />
      ))}
      {/* ножницы и мел */}
      <div style={box({ left: 860, top: TOP - 52, width: 80, height: 14, borderRadius: 7, backgroundColor: "#8C93A6", rotate: "-12deg" })} />
      <div style={box({ left: 880, top: TOP - 30, width: 46, height: 14, borderRadius: 4, backgroundColor: "#FFFFFF", border: "2px solid #D7DCE6" })} />
      <Actor uid="s-mom" look="momMaker" f={f} place={place} face={face} pose={pose} role="momMaker" seed={31} layer="arms" />
      {/* передняя панель стола */}
      <div style={box({ left: 82, top: TOP - 4, width: 916, height: 32, borderRadius: 10, backgroundColor: "#CDAE84" })} />
      <div style={box({ left: 100, top: TOP + 28, width: 880, height: 100, borderRadius: "0 0 12px 12px", backgroundColor: "#E6CFAA" })} />
      <div style={box({ left: 130, top: TOP + 128, width: 30, height: FLOOR - TOP - 128, backgroundColor: "#CDAE84" })} />
      <div style={box({ left: 920, top: TOP + 128, width: 30, height: FLOOR - TOP - 128, backgroundColor: "#CDAE84" })} />
    </div>
  );
};
