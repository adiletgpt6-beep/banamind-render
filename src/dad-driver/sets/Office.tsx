// Кабинет инженеров (выходной день, дневной свет). Слева — стеклянная
// дверь с табличкой «Инженердик бөлүм», большие окна с видом на Бишкек
// (дома, тополя, вдали — Ала-Тоо). Посередине — стол папы с монитором
// (на экране — тот же роликовый конвейер), на столе — макет и листы.
// Справа — доска с чертежами, папки и стол коллеги с её монитором
// («жаңы долбоор»: тот же конвейер как оборудование). Свет — из окон слева
// сверху. Экраны мониторов повёрнуты к камере — их видно спереди.
import { C, fontFamily } from "../kit";
import { Conveyor } from "../props/Conveyor";
import { box } from "../shots";
import { Mountains } from "./Home";
import { DD_TEXT } from "../script";

export const OFFICE = {
  floorY: 1500,
  feetY: 1560, // ступни стоящих
  door: { x: 60, y: 500, w: 270, h: 1000 },
  window: { x: 400, y: 380, w: 900, h: 700 },
  desk: { x: 690, w: 430, top: 1222 }, // стол папы (лицевая панель до пола)
  monitor: { x: 830, y: 975, w: 210, h: 150 }, // экран монитора папы
  board: { x: 1360, y: 540, w: 320, h: 360 },
  desk2: { x: 1330, w: 400, top: 1222 }, // стол коллеги
  monitor2: { x: 1430, y: 975, w: 210, h: 150 },
} as const;

// Экран монитора: конвейер в программе проектирования (чертёж или объём).
export const MonitorScreen: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly t: number; readonly mode: "blueprint" | "equipment"; readonly glow?: number }> = ({ x, y, w, h, t, mode, glow = 0 }) => (
  <div style={box({ left: x, top: y, width: w, height: h })}>
    {/* рамка, подставка */}
    <div style={box({ left: -8, top: -8, width: w + 16, height: h + 16, borderRadius: 10, backgroundColor: "#262B38" })} />
    <div style={box({ left: w / 2 - 10, top: h + 8, width: 20, height: 1222 - (y + h) - 22, backgroundColor: "#3A4050" })} />
    <div style={box({ left: w / 2 - 46, top: 1222 - y - 18, width: 92, height: 12, borderRadius: 6, backgroundColor: "#3A4050" })} />
    <div style={box({ left: 0, top: 0, width: w, height: h, borderRadius: 4, overflow: "hidden", background: mode === "blueprint" ? "#14567A" : `linear-gradient(180deg, ${C.deep}, ${C.navy})`, boxShadow: glow ? `0 0 ${30 * glow}px rgba(115,220,232,${0.5 * glow})` : undefined })}>
      <div style={box({ left: 0, top: 0, width: w, height: 16, backgroundColor: "rgba(255,255,255,0.12)" })} />
      <div style={box({ left: w * 0.08, top: h * 0.86 })}>
        <Conveyor mode={mode} scale={(w * 0.84) / 830} t={t} progress={1} box={mode === "equipment"} glow={mode === "equipment" ? 0.5 : 0} />
      </div>
    </div>
  </div>
);

export const OfficeRoom: React.FC<{ readonly t: number; readonly doorOpen?: number; readonly glow2?: number }> = ({ t, doorOpen = 0, glow2 = 0 }) => {
  const w = OFFICE.window;
  const d = OFFICE.door;
  return (
    <div style={box({ left: 0, top: 0, width: 2000, height: 2600 })}>
      {/* стена и потолок */}
      <div style={box({ left: -600, top: -400, width: 3200, height: OFFICE.floorY + 400, background: "linear-gradient(90deg, #EEF2F4 0%, #E3E9EC 60%, #D9E0E4 100%)" })} />
      {[300, 900, 1500].map((x) => (
        <div key={x} style={box({ left: x, top: 150, width: 300, height: 18, borderRadius: 9, backgroundColor: "#FFFFFF", boxShadow: "0 0 40px rgba(255,255,255,0.9)" })} />
      ))}
      <div style={box({ left: -600, top: 1180, width: 3200, height: OFFICE.floorY - 1180, backgroundColor: "#D4DCE1" })} />
      {/* окна */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, #BFDDF2, #EAF2F4 70%)", border: "16px solid #FFFFFF", boxSizing: "border-box" })}>
        <Mountains x={-40} y={60} w={w.w + 80} h={200} />
        {[
          [20, 330, 200, "#E8D8C4"],
          [250, 300, 180, "#DCCDBB"],
          [470, 340, 210, "#E6D3C0"],
          [710, 310, 190, "#DCCDBB"],
        ].map(([x, y, ww, col], i) => (
          <div key={i} style={box({ left: x as number, top: y as number, width: ww as number, height: 500, backgroundColor: col as string })}>
            {Array.from({ length: 8 }, (_, k) => (
              <div key={k} style={box({ left: 16 + (k % 4) * ((ww as number) / 4), top: 24 + Math.floor(k / 4) * 70, width: (ww as number) / 4 - 22, height: 36, borderRadius: 3, backgroundColor: "#8FA8C2" })} />
            ))}
          </div>
        ))}
        {[160, 400, 640].map((x) => (
          <div key={x} style={box({ left: x, top: 430, width: 70, height: 240, borderRadius: 35, backgroundColor: "#6FA35E" })} />
        ))}
        {[w.w / 3, (2 * w.w) / 3].map((x) => (
          <div key={x} style={box({ left: x - 6, top: 0, width: 12, height: w.h, backgroundColor: "#FFFFFF" })} />
        ))}
      </div>
      {/* жалюзи-тень на стене */}
      <div style={box({ left: w.x - 30, top: w.y + w.h - 6, width: w.w + 60, height: 24, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
      {/* дверь со стеклом и табличкой */}
      <div style={box({ left: d.x - 18, top: d.y - 18, width: d.w + 36, height: d.h + 18, backgroundColor: "#B7C2CA" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#8B97A1" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w * (1 - 0.8 * doorOpen), height: d.h, backgroundColor: "#C9D6DE", boxShadow: "inset -8px 0 0 rgba(0,0,0,0.06)" })}>
        <div style={box({ left: 26, top: 40, width: d.w - 52, height: 560, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.45)", opacity: 1 - doorOpen })} />
        <div style={box({ right: 24, top: 600, width: 18, height: 90, borderRadius: 9, backgroundColor: "#5A6470", opacity: 1 - doorOpen })} />
      </div>
      {/* табличка на стене над окном — видна в общем плане, не режется в средних */}
      <div style={box({ left: OFFICE.window.x + 150, top: 288, width: 300, padding: "14px 0", borderRadius: 12, backgroundColor: C.tealDeep, textAlign: "center", fontFamily, fontWeight: 800, fontSize: 34, color: "#FFFFFF" })}>{DD_TEXT.office.sign}</div>
      {/* доска с чертежами */}
      <div style={box({ left: OFFICE.board.x, top: OFFICE.board.y, width: OFFICE.board.w, height: OFFICE.board.h, borderRadius: 10, backgroundColor: "#C79F72", border: "10px solid #9C7A55", boxSizing: "border-box" })}>
        {[
          [20, 24, 130, 100],
          [166, 30, 120, 150],
          [26, 150, 140, 160],
        ].map(([x, y, ww, hh], i) => (
          <div key={i} style={box({ left: x, top: y, width: ww, height: hh, backgroundColor: "#DCEBF3", border: "3px solid #9BC3D8", boxSizing: "border-box" })}>
            <svg width={ww - 6} height={hh - 6} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 10 70 L 85 70 M 15 70 L 15 90 M 50 70 L 50 90 M 80 70 L 80 90 M 10 62 L 85 62" stroke="#4E8FB4" strokeWidth={3} fill="none" />
              {[20, 32, 44, 56, 68].map((x2) => (
                <circle key={x2} cx={x2} cy={58} r={4} stroke="#4E8FB4" strokeWidth={2} fill="none" />
              ))}
            </svg>
            <div style={box({ left: ww / 2 - 8, top: -10, width: 16, height: 16, borderRadius: 8, backgroundColor: i === 1 ? C.yellow : C.coral })} />
          </div>
        ))}
      </div>
      {/* стеллаж с папками */}
      <div style={box({ left: 1720, top: 720, width: 220, height: 780, backgroundColor: "#B9C4CC" })}>
        {[0, 1, 2].map((r) => (
          <div key={r} style={box({ left: 10, top: 40 + r * 240, width: 200, height: 200 })}>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={box({ left: 8 + k * 48, top: 30, width: 40, height: 170, borderRadius: 4, backgroundColor: ["#5C88BC", "#73A9C9", "#3F6B5E", "#E0A04A"][(k + r) % 4] })} />
            ))}
          </div>
        ))}
      </div>
      {/* пол */}
      <div style={box({ left: -600, top: OFFICE.floorY, width: 3200, height: 1100, background: "linear-gradient(180deg, #B9C2C9, #CBD3D9)" })} />
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={box({ left: -600 + i * 200, top: OFFICE.floorY, width: 3, height: 1100, backgroundColor: "rgba(80,90,100,0.15)", transform: `skewX(${(i - 7.5) * 4}deg)`, transformOrigin: "top" })} />
      ))}
      {/* монитор коллеги: новый проект */}
      <MonitorScreen x={OFFICE.monitor2.x} y={OFFICE.monitor2.y} w={OFFICE.monitor2.w} h={OFFICE.monitor2.h} t={t} mode="equipment" glow={glow2} />
    </div>
  );
};

// Стол (лицевая панель и столешница) — рисуется перед стоящими у стола.
export const OfficeDesk: React.FC<{ readonly x: number; readonly w: number; readonly top: number; readonly children?: React.ReactNode }> = ({ x, w, top, children }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: x + 20, top: OFFICE.floorY + 40, width: w, height: 40, borderRadius: "50%", backgroundColor: "rgba(40,50,60,0.18)" })} />
    <div style={box({ left: x, top: top - 26, width: w, height: 40, borderRadius: 8, backgroundColor: "#F4F6F7", boxShadow: "0 6px 0 #D5DCE1" })} />
    <div style={box({ left: x + 16, top: top + 14, width: w - 32, height: OFFICE.floorY + 40 - top - 14, backgroundColor: "#A8B4BD" })} />
    <div style={box({ left: x + 30, top: top + 40, width: 140, height: 200, borderRadius: 6, backgroundColor: "#B9C4CC" })} />
    {children}
  </div>
);
