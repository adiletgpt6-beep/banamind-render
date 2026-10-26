// Двор у дома семьи (Бишкек): панельный дом с окном квартиры, под ним —
// сквер со скамейкой, фонарём и тополями, горы вдали. Один и тот же мир
// снимается дважды одним и тем же проездом камеры (от окна вниз к
// скамейке): вечером «до» и в мягком дневном свете — «возможное после».
// Мир — px; окно и скамейка в обоих вариантах на одних местах.
import { Mountains } from "../../../two-schedules-2d/sets/Apartment";
import { Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { box, Depth } from "../../../two-schedules-2d/shots";

export const PARK = {
  w: 1300,
  h: 3100,
  houseTop: 560,
  houseBase: 1560,
  window: { x: 520, y: 860, w: 360, h: 300 }, // окно квартиры семьи
  groundY: 1640,
  bench: { x: 600, w: 440, floor: 2480, seatY: 2316 },
  lamp: { x: 300, top: 1940 },
} as const;

// Проезд камеры, одинаковый в обеих версиях: окно → скамейка.
export const PARK_CAM_A = { x: 700, y: 1010, zoom: 1.32 };
export const PARK_CAM_B = { x: 660, y: 2160, zoom: 1.06 };

export type ParkMode = "evening" | "day";

const PAL = {
  evening: {
    sky: "linear-gradient(180deg, #34406E 0%, #6D6A98 55%, #E9A97F 100%)",
    house: "#B9A99B",
    seams: "rgba(0,0,0,0.08)",
    win: "#5C6787",
    winLit: "#F7D795",
    lawn: "#6E8C66",
    lawn2: "#5F7E5A",
    path: "#9C958C",
    tint: "rgba(40,50,100,0.16)",
  },
  day: {
    sky: "linear-gradient(180deg, #BFDDF3 0%, #E8F1F6 55%, #FFE9C7 100%)",
    house: "#EADFCF",
    seams: "rgba(0,0,0,0.05)",
    win: "#A9C3DA",
    winLit: "#A9C3DA",
    lawn: "#A9C98A",
    lawn2: "#97BC78",
    path: "#D8D0C3",
    tint: "rgba(255,226,170,0.12)",
  },
} as const;

// Задний план: небо, горы, дом, окна (кроме окна семьи), земля, деревья.
export const ParkBack: React.FC<{ mode: ParkMode; lamp?: number }> = ({ mode, lamp = 0 }) => {
  const p = PAL[mode];
  const cols = 7;
  const cw = PARK.w / cols;
  const floors = 6;
  const fh = (PARK.houseBase - PARK.houseTop) / floors;
  return (
    <div style={box({ left: 0, top: 0, width: PARK.w, height: PARK.h })}>
      <div style={box({ left: -400, top: -400, width: PARK.w + 800, height: PARK.houseTop + 900, background: p.sky })} />
      <Depth depth={0.3}>
        <Mountains x={-300} y={PARK.houseTop + 40} w={1900} h={300} evening={mode === "evening" ? 1 : 0} />
      </Depth>
      {/* дом */}
      <div style={box({ left: -60, top: PARK.houseTop, width: PARK.w + 120, height: PARK.houseBase - PARK.houseTop, backgroundColor: p.house })} />
      <div style={box({ left: -60, top: PARK.houseTop, width: PARK.w + 120, height: PARK.houseBase - PARK.houseTop, backgroundImage: `repeating-linear-gradient(0deg, ${p.seams} 0 3px, transparent 3px ${fh}px)` })} />
      <div style={box({ left: -80, top: PARK.houseTop - 22, width: PARK.w + 160, height: 26, backgroundColor: "#8E8A86" })} />
      {Array.from({ length: floors }).map((_, fl) =>
        Array.from({ length: cols }).map((__, c) => {
          const x = c * cw + cw * 0.17;
          const y = PARK.houseTop + 26 + fl * fh;
          const w = PARK.window;
          if (x + cw * 0.66 > w.x - 10 && x < w.x + w.w + 10 && y + fh * 0.62 > w.y - 10 && y < w.y + w.h + 10) return null;
          const lit = mode === "evening" && (fl * 3 + c * 5) % 7 < 3;
          return (
            <div key={`${fl}-${c}`} style={box({ left: x, top: y, width: cw * 0.66, height: fh * 0.62, borderRadius: 4, backgroundColor: lit ? p.winLit : p.win, border: "5px solid #F1EDE6", boxSizing: "border-box", opacity: lit ? 0.95 : 1 })} />
          );
        }),
      )}
      {/* земля: тротуар, газон, дорожка */}
      <div style={box({ left: -100, top: PARK.houseBase, width: PARK.w + 200, height: 80, backgroundColor: "#B4AB9E" })} />
      <div style={box({ left: -100, top: PARK.groundY, width: PARK.w + 200, height: PARK.h - PARK.groundY + 200, backgroundColor: p.lawn })} />
      <div style={box({ left: -100, top: PARK.bench.floor - 30, width: PARK.w + 200, height: 160, backgroundColor: p.path, borderRadius: 30 })} />
      {[160, 980, 520].map((x, i) => (
        <div key={x} style={box({ left: x, top: 1760 + i * 90, width: 300, height: 80, borderRadius: 40, backgroundColor: p.lawn2 })} />
      ))}
      <Tree x={110} y={2250} s={1.25} kind="poplar" tone={mode === "evening" ? 1 : 0} />
      <Tree x={1180} y={2300} s={1.2} kind="round" tone={mode === "evening" ? 1 : 0} />
      <Tree x={880} y={1900} s={0.9} kind="round" tone={mode === "evening" ? 1 : 0} />
      {/* фонарь */}
      <div style={box({ left: PARK.lamp.x - 9, top: PARK.lamp.top, width: 18, height: PARK.bench.floor - PARK.lamp.top + 20, backgroundColor: "#4A4E58", borderRadius: 6 })} />
      <div style={box({ left: PARK.lamp.x - 46, top: PARK.lamp.top - 40, width: 92, height: 54, borderRadius: "46px 46px 10px 10px", backgroundColor: "#3A3E48" })} />
      <div style={box({ left: PARK.lamp.x - 30, top: PARK.lamp.top + 8, width: 60, height: 20, borderRadius: 10, backgroundColor: lamp > 0 ? "#FFE7A8" : "#C9CED6" })} />
      {lamp > 0 ? (
        <div style={box({ left: PARK.lamp.x - 360, top: PARK.lamp.top - 120, width: 720, height: 720, borderRadius: 360, background: "radial-gradient(circle, rgba(255,226,150,0.55), rgba(255,226,150,0) 65%)", opacity: lamp })} />
      ) : null}
      {/* спинка скамейки (за сидящими) */}
      <BenchBack />
    </div>
  );
};

export const BenchBack: React.FC = () => {
  const b = PARK.bench;
  return (
    <>
      <div style={box({ left: b.x + 20, top: b.seatY - 170, width: 14, height: 190, backgroundColor: "#4A4E58" })} />
      <div style={box({ left: b.x + b.w - 34, top: b.seatY - 170, width: 14, height: 190, backgroundColor: "#4A4E58" })} />
      <div style={box({ left: b.x, top: b.seatY - 165, width: b.w, height: 34, borderRadius: 8, backgroundColor: "#9A7354" })} />
      <div style={box({ left: b.x, top: b.seatY - 112, width: b.w, height: 34, borderRadius: 8, backgroundColor: "#9A7354" })} />
    </>
  );
};

// Сиденье и ножки скамейки (перед ногами сидящих рисуются ноги, сиденье —
// поверх таза, чтобы посадка читалась).
export const BenchFront: React.FC = () => {
  const b = PARK.bench;
  return (
    <>
      <div style={box({ left: b.x - 10, top: b.seatY - 6, width: b.w + 20, height: 30, borderRadius: 8, backgroundColor: "#8A6648" })} />
      <div style={box({ left: b.x + 24, top: b.seatY + 22, width: 16, height: b.floor - b.seatY - 22, backgroundColor: "#3F434C" })} />
      <div style={box({ left: b.x + b.w - 40, top: b.seatY + 22, width: 16, height: b.floor - b.seatY - 22, backgroundColor: "#3F434C" })} />
      <div style={box({ left: b.x - 20, top: b.floor - 6, width: b.w + 40, height: 16, borderRadius: 8, backgroundColor: "rgba(20,30,20,0.18)" })} />
    </>
  );
};

// Окно квартиры семьи: рама, подоконник, внутренняя комната (inside).
export const FamilyWindow: React.FC<{ mode: ParkMode; inside?: React.ReactNode; curtain?: number }> = ({ mode, inside, curtain = 0.25 }) => {
  const w = PARK.window;
  const lit = mode === "evening";
  return (
    <>
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", backgroundColor: lit ? "#F3D7A6" : "#DCE8EE" })}>
        {/* стена комнаты и лампа */}
        <div style={box({ left: 0, top: w.h * 0.68, width: w.w, height: w.h, backgroundColor: lit ? "#D9B98C" : "#CFDAE0" })} />
        {lit ? <div style={box({ left: w.w * 0.62, top: -10, width: 90, height: 46, borderRadius: "0 0 45px 45px", backgroundColor: "#F6C35A" })} /> : null}
        {lit ? <div style={box({ left: 0, top: 0, width: w.w, height: w.h, background: "radial-gradient(circle at 70% 10%, rgba(255,236,190,0.7), transparent 60%)" })} /> : null}
        {inside}
        {/* шторы */}
        <div style={box({ left: 0, top: 0, width: w.w * curtain, height: w.h, backgroundColor: lit ? "#C77F5E" : "#E7C9A9", opacity: 0.92 })} />
        <div style={box({ left: w.w * (1 - curtain * 0.6), top: 0, width: w.w * curtain * 0.6, height: w.h, backgroundColor: lit ? "#C77F5E" : "#E7C9A9", opacity: 0.92 })} />
        {!lit ? <div style={box({ left: 0, top: 0, width: w.w, height: w.h, background: "linear-gradient(135deg, rgba(255,255,255,0.45), transparent 50%)" })} /> : null}
      </div>
      <div style={box({ left: w.x - 12, top: w.y - 12, width: w.w + 24, height: w.h + 24, border: "12px solid #F4F1EC", boxSizing: "border-box", borderRadius: 6 })} />
      <div style={box({ left: w.x + w.w / 2 - 6, top: w.y, width: 12, height: w.h, backgroundColor: "#F4F1EC", opacity: 0.0 })} />
      <div style={box({ left: w.x - 30, top: w.y + w.h + 8, width: w.w + 60, height: 20, borderRadius: 6, backgroundColor: "#D9D3CA" })} />
    </>
  );
};

// Световой тон всего кадра (тёплые сумерки / мягкий день).
export const ParkTint: React.FC<{ mode: ParkMode }> = ({ mode }) => (
  <div style={box({ left: -200, top: -200, width: PARK.w + 400, height: PARK.h + 400, backgroundColor: PAL[mode].tint, pointerEvents: "none" })} />
);

// Воздушный змей: ромб с хвостом из бантиков. (x, y) — центр.
export const Kite: React.FC<{ x: number; y: number; s?: number; rot?: number; sway?: number }> = ({ x, y, s = 1, rot = 0, sway = 0 }) => (
  <svg width={200 * s} height={360 * s} viewBox="-100 -120 200 360" style={box({ left: x - 100 * s, top: y - 120 * s, overflow: "visible", transform: `rotate(${rot}deg)`, transformOrigin: `${100 * s}px ${120 * s}px` })}>
    <path d="M 0 -110 L 70 0 L 0 120 L -70 0 Z" fill="#FFC90E" stroke="#14285A" strokeWidth={6} strokeLinejoin="round" />
    <path d="M 0 -110 L 0 120 M -70 0 L 70 0" stroke="#14285A" strokeWidth={5} />
    <path d="M 0 -110 L 70 0 L 0 0 Z" fill="#3E7CC0" />
    <path d={`M 0 120 Q ${20 + sway * 20} 160 ${-10 + sway * 10} 200 Q ${-30 + sway * 10} 230 ${0 + sway * 20} 240`} stroke="#14285A" strokeWidth={4} fill="none" />
    {[160, 200, 232].map((yy, i) => (
      <path key={yy} d={`M ${-14 + sway * (8 + i * 6)} ${yy} l 14 -8 l 0 16 z M ${sway * (8 + i * 6)} ${yy} l 14 -8 l 0 16 z`} fill={i % 2 ? "#E5677A" : "#3E9C6B"} />
    ))}
  </svg>
);
