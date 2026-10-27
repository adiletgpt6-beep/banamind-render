// Кабинет Айжан: стена, окно с городом и горами, дверь слева (в неё
// заглядывает коллега), стол поперёк кадра, монитор, развёрнутый к маме
// (экран под углом, текст не зеркалится), место для рисунка справа от
// монитора. Столешница — y = HOME.table.top (общие помощники позы).
// Одинаковые координаты во всех офисных кадрах (1-й день и «Эртеси»).
import { box } from "../shots";
import { HOME } from "./Home";
import { Mountains } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

const TOP = HOME.table.top;

export const OFFICE = {
  floorY: 1500,
  top: TOP,
  desk: { x: 330, w: 1000 },
  door: { x: 70, y: 560, w: 240, h: 940 },
  window: { x: 660, y: 400, w: 520, h: 470 },
  monitor: { cx: 660, w: 420, h: 270, bottom: TOP - 70 },
  keyboard: { x: 985, y: TOP + 10 },
  drawing: { x: 985, w: 190 }, // место рисунка у монитора (центр по x, ширина)
  mom: 1110, // x сидящей Айжан
  folder: { x: 1250, y: TOP + 14 },
  keys: { x: 1200, y: TOP + 14 },
} as const;

export const OfficeBack: React.FC<{ readonly doorOpen?: number }> = ({ doorOpen = 0 }) => {
  const d = OFFICE.door;
  const w = OFFICE.window;
  return (
    <div style={box({ left: 0, top: 0, width: 1600, height: 2400 })}>
      <div style={box({ left: -300, top: 0, width: 2200, height: 1500, background: "linear-gradient(180deg, #E4E9F0, #EEF1F5)" })} />
      {/* окно */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 8, overflow: "hidden", background: "linear-gradient(180deg, #BFD6EA, #E8EEF3)", border: "14px solid #C3CDD8", boxSizing: "border-box" })}>
        <div style={box({ left: -w.x, top: -w.y })}>
          <Mountains x={w.x - 20} y={w.y + 90} w={w.w + 40} h={130} />
          <PanelHouse x={w.x + 20} y={w.y + 470} w={220} floors={4} color="#D9CBB9" seed={3} />
          <PanelHouse x={w.x + 270} y={w.y + 480} w={240} floors={3} color="#CFC2B4" seed={6} />
          <Tree x={w.x + 250} y={w.y + 470} s={0.7} kind="poplar" />
        </div>
      </div>
      <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#C3CDD8" })} />
      {/* полка с папками */}
      <div style={box({ left: 1240, top: 620, width: 260, height: 16, backgroundColor: "#B7A38C" })} />
      {["#7FB8F0", "#8FD3A6", "#B79CF2", "#E8C26A"].map((c, i) => (
        <div key={c} style={box({ left: 1256 + i * 52, top: 520 + (i % 2) * 10, width: 40, height: 100 - (i % 2) * 10, borderRadius: 4, backgroundColor: c })} />
      ))}
      {/* дверь: проём и полотно (открывается внутрь) */}
      <div style={box({ left: d.x - 16, top: d.y - 16, width: d.w + 32, height: d.h + 16, backgroundColor: "#CBD3DD" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#5E6B7C" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w * (1 - 0.78 * doorOpen), height: d.h, backgroundColor: "#A88A6E", boxShadow: "inset -10px 0 0 rgba(0,0,0,0.08)" })}>
        <div style={box({ right: 20, top: 470, width: 40, height: 14, borderRadius: 7, backgroundColor: "#E2CF8C", opacity: 1 - doorOpen })} />
      </div>
      {/* растение */}
      <div style={box({ left: 1380, top: 1290, width: 110, height: 150, borderRadius: "10px 10px 26px 26px", backgroundColor: "#D5C2A8" })} />
      <div style={box({ left: 1350, top: 1090, width: 170, height: 220, borderRadius: "50% 50% 40% 40%", backgroundColor: "#6FA86A" })} />
      <div style={box({ left: -300, top: 1500, width: 2200, height: 900, backgroundColor: "#B9C2CE" })} />
    </div>
  );
};

// Кресло за Айжан (рисуется до персонажа).
export const OfficeChair: React.FC = () => (
  <div style={box({ left: OFFICE.mom - 110, top: TOP - 420, width: 220, height: 560 })}>
    <div style={box({ left: 0, top: 0, width: 220, height: 330, borderRadius: "70px 70px 30px 30px", backgroundColor: "#3D4656" })} />
    <div style={box({ left: 100, top: 320, width: 20, height: 240, backgroundColor: "#2C3340" })} />
  </div>
);

// Столешница (рисуется между телом и руками сидящего).
export const DeskTop: React.FC = () => (
  <div style={box({ left: OFFICE.desk.x, top: TOP - 4, width: OFFICE.desk.w, height: 30, borderRadius: 8, backgroundColor: "#D9C3A5" })} />
);

// Передняя панель стола (закрывает ноги сидящей).
export const DeskFront: React.FC = () => (
  <div style={box({ left: OFFICE.desk.x + 14, top: TOP + 24, width: OFFICE.desk.w - 28, height: 1500 - TOP - 24 + 60, backgroundColor: "#C6AD8C", borderRadius: "0 0 10px 10px" })}>
    <div style={box({ left: 30, top: 40, width: OFFICE.desk.w - 88, height: 6, borderRadius: 3, backgroundColor: "rgba(0,0,0,0.06)" })} />
  </div>
);

// Монитор под углом к маме. Содержимое экрана (screen) рисуется в
// собственных координатах sw × sh и переносится перспективой без
// зеркалирования. lock — экран заблокирован (тёмный с замком).
export const SCREEN = { w: 940, h: 600 } as const;
export const Monitor: React.FC<{ readonly screen?: React.ReactNode; readonly lock?: number; readonly glow?: number }> = ({ screen, lock = 0, glow = 1 }) => {
  const m = OFFICE.monitor;
  const s = (m.w - 24) / SCREEN.w;
  return (
    <div style={box({ left: m.cx - m.w / 2, top: m.bottom - m.h, width: m.w, height: m.h + 70, perspective: 900 })}>
      {/* подставка */}
      <div style={box({ left: m.w / 2 - 22, top: m.h - 6, width: 44, height: 64, backgroundColor: "#8C96A6" })} />
      <div style={box({ left: m.w / 2 - 90, top: m.h + 52, width: 180, height: 18, borderRadius: 9, backgroundColor: "#7A8494" })} />
      <div style={box({ left: 0, top: 0, width: m.w, height: m.h, borderRadius: 16, backgroundColor: "#1E2430", transform: "rotateY(-16deg)", transformOrigin: "50% 50%", overflow: "hidden" })}>
        <div style={box({ left: 12, top: 12, width: SCREEN.w, height: SCREEN.h, transform: `scale(${s})`, transformOrigin: "0 0", overflow: "hidden", borderRadius: 10 / s, opacity: glow })}>
          {screen}
          {lock > 0 ? (
            <div style={box({ inset: 0, backgroundColor: `rgba(23,36,51,${0.94 * lock})`, display: "flex", alignItems: "center", justifyContent: "center" })}>
              <svg width={150} height={170} viewBox="0 0 30 34" style={{ opacity: lock }}>
                <rect x={3} y={14} width={24} height={18} rx={4} fill="#FFFFFF" />
                <path d="M 8 14 L 8 9 Q 8 3 15 3 Q 22 3 22 9 L 22 14" stroke="#FFFFFF" strokeWidth={3} fill="none" />
              </svg>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Клавиатура и мышь перед Айжан.
export const Keyboard: React.FC = () => (
  <>
    <div style={box({ left: OFFICE.keyboard.x - 120, top: OFFICE.keyboard.y - 16, width: 240, height: 22, borderRadius: 6, backgroundColor: "#E7EBF0", boxShadow: "0 3px 0 #B9C1CC" })} />
    <div style={box({ left: OFFICE.keyboard.x + 150, top: OFFICE.keyboard.y - 14, width: 40, height: 20, borderRadius: 10, backgroundColor: "#E7EBF0", boxShadow: "0 3px 0 #B9C1CC" })} />
  </>
);

// Ключи от машины на столе (лежат, пока их не взяли).
export const KeysOnDesk: React.FC<{ readonly x?: number; readonly y?: number }> = ({ x = OFFICE.keys.x, y = OFFICE.keys.y }) => (
  <svg width={70} height={40} viewBox="0 0 70 40" style={box({ left: x - 35, top: y - 26 })}>
    <circle cx={18} cy={20} r={12} fill="none" stroke="#B8BEC8" strokeWidth={5} />
    <rect x={28} y={16} width={34} height={8} rx={3} fill="#9AA2AE" />
    <rect x={8} y={24} width={20} height={14} rx={4} fill="#2B3240" />
  </svg>
);

// Папка, в которой Айжан принесла рисунок из дома (лежит на столе).
export const FolderOnDesk: React.FC<{ readonly x?: number; readonly y?: number; readonly open?: number }> = ({ x = OFFICE.folder.x, y = OFFICE.folder.y, open = 0 }) => (
  <div style={box({ left: x - 110, top: y - 26, width: 220, height: 30 })}>
    <div style={box({ left: 0, top: 6, width: 220, height: 24, borderRadius: 6, backgroundColor: "#E8B44A" })} />
    <div style={box({ left: 6, top: 0 - 14 * open, width: 208, height: 18, borderRadius: 6, backgroundColor: "#F3C661", transform: `rotate(${-8 * open}deg)`, transformOrigin: "0 100%" })} />
  </div>
);
