// Рабочая комната мамы (отдельная комната за дверью). Вид сбоку на стол:
// мама сидит в профиль лицом вправо, ноутбук открыт экраном к ней —
// со стороны камеры видна только боковая грань крышки. Дверь в семейную
// часть квартиры — на стене слева; та же жёлтая настольная лампа видна
// из кухни через дверной проём. Пол — y = 1500, стопы сидящей — y = 1560.
import { box } from "../shots";
import { WallClock } from "./Clock";

export const WORK = {
  floorY: 1500,
  seatY: 1560,
  door: { x: 110, y: 600, w: 270, h: 900 },
  desk: { x: 760, w: 620, top: 1190 },
  chairX: 720, // центр сидящей мамы
  laptop: { x: 920 }, // середина основания ноутбука
  keys: { x: 1290 }, // ключи от машины на краю стола
  clock: { x: 1060, y: 520, r: 60 },
  window: { x: 1450, y: 430, w: 420, h: 560 },
} as const;

type Light = { readonly evening?: number };

export const WorkRoomBack: React.FC<{ readonly minutes: number; readonly doorOpen?: number; readonly inDoor?: React.ReactNode } & Light> = ({
  minutes,
  doorOpen = 0,
  inDoor,
  evening = 0,
}) => {
  const eve = evening > 0.5;
  const d = WORK.door;
  const w = WORK.window;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -800, top: -900, width: 3600, height: WORK.floorY + 900, backgroundColor: eve ? "#D9DCE2" : "#E8EEF4" })} />
      <div style={box({ left: -800, top: 1180, width: 3600, height: WORK.floorY - 1180, backgroundColor: eve ? "#CDD5E0" : "#DCE4EE" })} />
      {/* дверь в семейную часть квартиры (из комнаты) */}
      <div style={box({ left: d.x - 20, top: d.y - 20, width: d.w + 40, height: d.h + 20, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: eve ? "#EBD3AE" : "#F1E6D6", overflow: "hidden" })}>
        {/* в проёме — кухня: стена, окно, край стола */}
        <div style={box({ left: 0, top: 560, width: d.w, height: 340, backgroundColor: eve ? "#D9BE98" : "#E6D6BF" })} />
        <div style={box({ left: 40, top: 520, width: 230, height: 24, backgroundColor: "#F7F1E6" })} />
        {eve ? <div style={box({ inset: 0, background: "radial-gradient(circle at 150px 380px, rgba(255,205,130,0.45), transparent 320px)" })} /> : null}
        {inDoor ? <div style={box({ left: -d.x, top: -d.y, width: 2200, height: 2600 })}>{inDoor}</div> : null}
      </div>
      <div style={box({ left: d.x + d.w * 0.86 * doorOpen, top: d.y, width: d.w * (1 - 0.86 * doorOpen), height: d.h, backgroundColor: "#FDFBF7", border: "4px solid #E6DED2", boxSizing: "border-box", boxShadow: "inset 8px 0 0 rgba(0,0,0,0.05)" })}>
        <div style={box({ left: 20, top: 470, width: 44, height: 13, borderRadius: 7, backgroundColor: "#B9A774", opacity: 1 - doorOpen })} />
      </div>
      {/* полка с папками */}
      <div style={box({ left: 470, top: 640, width: 280, height: 16, borderRadius: 4, backgroundColor: "#B58D69" })} />
      {["#172A46", "#5E9A93", "#FFD43B", "#9DB7CF"].map((c, i) => (
        <div key={c} style={box({ left: 490 + i * 52, top: 510, width: 42, height: 130, borderRadius: 4, backgroundColor: c })} />
      ))}
      {/* стикеры с задачами */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 520 + i * 86, top: 760 + (i % 2) * 24, width: 70, height: 70, backgroundColor: ["#FFE48A", "#CFE3F6", "#FFE48A"][i], rotate: `${(i - 1) * 4}deg` })}>
          <div style={box({ left: 10, top: 18, width: 46, height: 5, backgroundColor: "#9AA6BC" })} />
          <div style={box({ left: 10, top: 32, width: 34, height: 5, backgroundColor: "#9AA6BC" })} />
        </div>
      ))}
      <WallClock x={WORK.clock.x} y={WORK.clock.y} r={WORK.clock.r} minutes={minutes} />
      {/* окно */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, borderRadius: 10, border: "16px solid #FBF7F0", boxSizing: "border-box", background: eve ? "linear-gradient(180deg, #23305A, #4C4F7A 70%, #B9806A)" : "linear-gradient(180deg, #CFE4F4, #EEF3F6)" })}>
        <div style={box({ left: w.w / 2 - 22, top: 0, width: 12, height: w.h, backgroundColor: "#FBF7F0" })} />
      </div>
      <div style={box({ left: w.x - 30, top: w.y + w.h - 6, width: w.w + 60, height: 24, borderRadius: 6, backgroundColor: "#FBF7F0" })} />
      {/* пол */}
      <div style={box({ left: -800, top: WORK.floorY, width: 3600, height: 1100, background: eve ? "linear-gradient(180deg, #A47B5A, #8F6748)" : "linear-gradient(180deg, #C9A47F, #B8916B)" })} />
      <div style={box({ left: -800, top: WORK.floorY, width: 3600, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.10) 0 2px, transparent 2px 170px)" })} />
      {/* дневной свет из окна / вечерняя лампа */}
      <div style={box({ left: -800, top: 0, width: 3600, height: 2600, background: eve ? "radial-gradient(circle at 1300px 1000px, rgba(255,214,140,0.28), transparent 800px)" : "linear-gradient(250deg, rgba(200,225,250,0.25), transparent 60%)" })} />
    </div>
  );
};

// Офисное кресло в профиль (за сидящей, до персонажа).
export const OfficeChair: React.FC<{ x: number; y?: number }> = ({ x, y = WORK.seatY }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <rect x={x - 118} y={y - 560} width={44} height={330} rx={20} fill="#3E4C63" transform={`rotate(-6 ${x - 96} ${y - 230})`} />
    <rect x={x - 120} y={y - 232} width={240} height={34} rx={14} fill="#46566F" />
    <rect x={x - 8} y={y - 200} width={16} height={150} fill="#7E8796" />
    <path d={`M ${x - 110} ${y - 30} L ${x + 110} ${y - 30}`} stroke="#5B6474" strokeWidth={14} strokeLinecap="round" />
    <circle cx={x - 100} cy={y - 14} r={12} fill="#2C2F37" />
    <circle cx={x + 100} cy={y - 14} r={12} fill="#2C2F37" />
  </svg>
);

// Стол в профиль: столешница и ножки (поверх ног сидящей).
export const Desk: React.FC = () => {
  const d = WORK.desk;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <rect x={d.x} y={d.top} width={d.w} height={30} rx={6} fill="#C9A27A" />
      <rect x={d.x} y={d.top + 24} width={d.w} height={8} fill="#A9825E" />
      <rect x={d.x + 150} y={d.top + 30} width={24} height={WORK.seatY - 40 - d.top - 30 + 20} fill="#8C6A4E" />
      <rect x={d.x + d.w - 42} y={d.top + 30} width={24} height={WORK.seatY - 40 - d.top - 30 + 20} fill="#8C6A4E" />
      {/* настольная лампа (та же, что видна из кухни) */}
      <rect x={d.x + d.w - 110} y={d.top - 14} width={80} height={14} rx={5} fill="#3A3E48" />
      <path d={`M ${d.x + d.w - 70} ${d.top - 14} L ${d.x + d.w - 120} ${d.top - 190} L ${d.x + d.w - 60} ${d.top - 250}`} stroke="#3A3E48" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M ${d.x + d.w - 100} ${d.top - 290} L ${d.x + d.w - 10} ${d.top - 250} L ${d.x + d.w - 40} ${d.top - 200} Z`} fill="#FFD43B" />
      {/* блокнот и ручка */}
      <rect x={d.x + 330} y={d.top - 8} width={110} height={8} rx={2} fill="#FFFFFF" />
      <rect x={d.x + 330} y={d.top - 12} width={110} height={5} rx={2} fill="#172A46" />
    </svg>
  );
};

// Ноутбук в профиль: экран повёрнут к маме (влево). open 0…1 — угол крышки
// (0 — закрыт). Крышка вращается вокруг петли на дальнем (правом) краю.
// Возвращает и точку верхнего края крышки — для руки, которая её закрывает.
// Размер в натуральном масштабе (рост 760 px ≈ 165 см): основание ≈ 34 см.
const LB = 78; // половина основания
const LL = 150; // длина крышки
export const lidTop = (x: number, y: number, open: number) => {
  const a = ((3 + 102 * open) * Math.PI) / 180;
  const hx = x + LB - 2;
  const hy = y - 9;
  return { x: hx - Math.cos(a) * LL, y: hy - Math.sin(a) * LL };
};

export const LaptopSide: React.FC<{ x: number; y: number; open: number; glow?: number }> = ({ x, y, open, glow = 1 }) => {
  const a = 3 + 102 * open; // 3° — закрыт, 105° — открыт (экран к маме)
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* основание с клавиатурой (видна толщина) */}
      <rect x={x - LB} y={y - 10} width={LB * 2} height={10} rx={4} fill="#AEB6C4" />
      <rect x={x - LB + 6} y={y - 12} width={LB * 1.2} height={3} rx={1} fill="#7E8796" />
      <g transform={`translate(${x + LB - 2} ${y - 9}) rotate(${a})`}>
        {/* крышка: боковая грань */}
        <rect x={-LL} y={-4} width={LL} height={9} rx={4} fill="#9AA3B2" />
        {/* экран на внутренней стороне (к маме) */}
        {open > 0.2 ? <rect x={-LL + 5} y={4} width={LL - 14} height={3} fill={`rgba(150,200,250,${0.9 * glow})`} /> : null}
      </g>
    </svg>
  );
};

// Ключи от машины на столе (одна связка: брелок и два ключа).
export const KeysOnTable: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <circle cx={x - 18} cy={y - 8} r={9} fill="none" stroke="#9AA3B2" strokeWidth={4} />
    <rect x={x - 12} y={y - 10} width={30} height={6} rx={2} fill="#C9CED6" />
    <rect x={x - 34} y={y - 14} width={18} height={12} rx={4} fill="#172A46" />
    <rect x={x - 8} y={y - 6} width={26} height={5} rx={2} fill="#D8B856" />
  </svg>
);
