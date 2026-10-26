// Квартира семьи (одна планировка во всех сценах; мир, px):
//
//   x −700…−90   прихожая и игровой уголок: входная дверь (ручка справа,
//                петли слева, открывается внутрь к стене), крючок для
//                рюкзака у двери, ковёр с кубиками;
//   x 220…900    обеденный стол (вид спереди): мама слева (x 400), папа
//                справа (x 700) — рядом, сын у свободного правого торца
//                (x 1010);
//   x 960…1240   низкий комод у правого торца стола: на нём лежит синяя
//                машинка мальчика;
//   над столом   подвесная лампа (x 560); в стене за столом окно.
//
// warm — 0…1: вечерний тёплый свет (одна лампа), 0 — дневной.
import { box } from "../kit";
import { C } from "../theme";

export const FLAT = {
  floorY: 1500,
  table: { x0: 220, x1: 900, top: 1180 },
  seats: { mom: 400, dad: 700 },
  boyStand: 1010,
  lamp: { x: 560, y: 690 },
  window: { x: 600, y: 560, w: 320, h: 360 },
  cabinet: { x0: 960, x1: 1240, top: 1150 },
  carOnCabinet: { x: 1080, y: 1150 },
  door: { x0: -660, x1: -400, top: 720 },
  hook: { x: -300, y: 1080 },
  rug: { x0: -380, x1: 40, y: 1500 },
  phoneOnTable: { x: 470, y: 1196 },
  notebook: { x: 740, y: 1198 },
} as const;

const F_ = FLAT;
const W0 = -1000;
const W1 = 1800;

export const FlatBack: React.FC<{ readonly warm?: number }> = ({ warm = 0 }) => {
  const d = F_.door;
  const w = F_.window;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: W0, top: -600, width: W1 - W0, height: F_.floorY + 600, backgroundColor: C.wallHome })} />
      {/* плинтус */}
      <div style={box({ left: W0, top: F_.floorY - 22, width: W1 - W0, height: 22, backgroundColor: "#E4D7C1" })} />
      {/* входная дверь: петли слева, ручка справа */}
      <div style={box({ left: d.x0 - 18, top: d.top - 18, width: d.x1 - d.x0 + 36, height: F_.floorY - d.top + 18, backgroundColor: C.white })} />
      <div style={box({ left: d.x0, top: d.top, width: d.x1 - d.x0, height: F_.floorY - d.top, backgroundColor: "#8A6A52" })} />
      <div style={box({ left: d.x0 + 26, top: d.top + 40, width: d.x1 - d.x0 - 52, height: 300, border: "5px solid #7A5C46", boxSizing: "border-box" })} />
      <div style={box({ left: d.x0 + 26, top: d.top + 380, width: d.x1 - d.x0 - 52, height: 330, border: "5px solid #7A5C46", boxSizing: "border-box" })} />
      <div style={box({ left: d.x1 - 46, top: d.top + 360, width: 26, height: 12, borderRadius: 6, backgroundColor: "#D8C08A" })} />
      {[0.18, 0.78].map((k) => (
        <div key={k} style={box({ left: d.x0 - 4, top: d.top + (F_.floorY - d.top) * k, width: 8, height: 46, backgroundColor: "#6E5341" })} />
      ))}
      {/* крючок для рюкзака */}
      <div style={box({ left: F_.hook.x - 60, top: F_.hook.y - 16, width: 120, height: 14, backgroundColor: C.woodDark })} />
      <div style={box({ left: F_.hook.x - 6, top: F_.hook.y - 2, width: 12, height: 26, borderRadius: 6, backgroundColor: C.ink })} />
      {/* детский рисунок и полка над игровым уголком */}
      <div style={box({ left: -200, top: 820, width: 160, height: 200, backgroundColor: C.white, transform: "rotate(-3deg)", boxShadow: `0 6px 0 ${C.shadow}` })} />
      <div style={box({ left: -168, top: 870, width: 96, height: 96, borderRadius: "50%", backgroundColor: C.yellow, opacity: 0.8 })} />
      {/* окно за столом: вечер — тёмно-синее небо и огни, день — светлое */}
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, backgroundColor: warm > 0.5 ? "#26314F" : C.sky, border: `16px solid ${C.white}`, boxSizing: "border-box" })} />
      <div style={box({ left: w.x + w.w / 2 - 8, top: w.y, width: 16, height: w.h, backgroundColor: C.white })} />
      {warm > 0.5 ? [0, 1, 2, 3].map((i) => <div key={i} style={box({ left: w.x + 40 + i * 66, top: w.y + 210 + (i % 2) * 50, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#FFE3A0", opacity: 0.8 })} />) : null}
      {/* картина на стене слева от окна */}
      <div style={box({ left: 300, top: 640, width: 200, height: 150, backgroundColor: "#E9DDC8", border: `10px solid ${C.woodDark}`, boxSizing: "border-box" })} />
      <div style={box({ left: 330, top: 700, width: 140, height: 60, background: "linear-gradient(170deg, transparent 40%, #9DB89A 41%)" })} />
      {/* пол */}
      <div style={box({ left: W0, top: F_.floorY, width: W1 - W0, height: 1200, backgroundColor: C.floorHome })} />
      <div style={box({ left: W0, top: F_.floorY, width: W1 - W0, height: 8, backgroundColor: "#C8B391" })} />
    </div>
  );
};

// Подвесная лампа над столом и тёплое пятно света (вечер).
export const Lamp: React.FC<{ readonly warm?: number }> = ({ warm = 0 }) => (
  <div style={box({ left: 0, top: 0 })}>
    <div style={box({ left: F_.lamp.x - 3, top: -600, width: 6, height: F_.lamp.y + 600 - 80, backgroundColor: C.ink })} />
    <div style={box({ left: F_.lamp.x - 110, top: F_.lamp.y - 80, width: 220, height: 92, backgroundColor: "#E9A23B", borderRadius: "110px 110px 0 0" })} />
    {warm > 0 ? <div style={box({ left: F_.lamp.x - 80, top: F_.lamp.y + 2, width: 160, height: 20, borderRadius: "50%", backgroundColor: "#FFE7A8", opacity: warm })} /> : null}
  </div>
);
export const LampGlow: React.FC<{ readonly warm?: number }> = ({ warm = 0 }) =>
  warm > 0 ? (
    <div style={box({ left: F_.lamp.x - 900, top: F_.lamp.y - 500, width: 1800, height: 1700, background: "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(255,200,120,0.30), rgba(255,200,120,0) 100%)", opacity: warm })} />
  ) : null;

// Комод у правого торца стола (машинка — отдельным слоем, ToyCar).
export const Cabinet: React.FC = () => {
  const c = F_.cabinet;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: c.x0, top: c.top, width: c.x1 - c.x0, height: 26, backgroundColor: C.woodLight })} />
      <div style={box({ left: c.x0 + 10, top: c.top + 26, width: c.x1 - c.x0 - 20, height: F_.floorY - c.top - 46, backgroundColor: "#D9B98F" })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: c.x0 + 30, top: c.top + 50 + i * 130, width: c.x1 - c.x0 - 60, height: 110, border: "4px solid #C4A57C", boxSizing: "border-box" })} />
      ))}
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: (c.x0 + c.x1) / 2 - 22, top: c.top + 98 + i * 130, width: 44, height: 10, borderRadius: 5, backgroundColor: "#A8875E" })} />
      ))}
      {/* книги на комоде (у дальнего края, справа от машинки) */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: c.x1 - 110 + i * 32, top: c.top - 120 + (i % 2) * 10, width: 26, height: 120 - (i % 2) * 10, backgroundColor: [C.kidGreen, C.orange, C.kidPurple][i] })} />
      ))}
    </div>
  );
};

// Стулья: спинки за сидящими родителями.
export const ChairBacks: React.FC = () => (
  <div style={box({ left: 0, top: 0 })}>
    {[F_.seats.mom, F_.seats.dad].map((x) => (
      <div key={x} style={box({ left: x - 90, top: F_.floorY - 560, width: 180, height: 330, backgroundColor: C.woodDark, borderRadius: "30px 30px 6px 6px" })} />
    ))}
  </div>
);

// Обеденный стол (вид спереди, чуть сверху): видна полоса столешницы
// (на ней лежат телефон, блокнот, машинка), передний край перекрывает ноги
// сидящих.
export const TABLE_SURFACE = { y0: FLAT.table.top - 30, y1: FLAT.table.top + 26 };
export const DiningTable: React.FC = () => {
  const t = F_.table;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <div style={box({ left: t.x0, top: TABLE_SURFACE.y0, width: t.x1 - t.x0, height: TABLE_SURFACE.y1 - TABLE_SURFACE.y0, backgroundColor: C.woodLight, borderRadius: "10px 10px 0 0" })} />
      <div style={box({ left: t.x0, top: TABLE_SURFACE.y1, width: t.x1 - t.x0, height: 60, backgroundColor: C.wood })} />
      <div style={box({ left: t.x0 + 30, top: TABLE_SURFACE.y1 + 60, width: 26, height: F_.floorY - TABLE_SURFACE.y1 - 60, backgroundColor: C.woodDark })} />
      <div style={box({ left: t.x1 - 56, top: TABLE_SURFACE.y1 + 60, width: 26, height: F_.floorY - TABLE_SURFACE.y1 - 60, backgroundColor: C.woodDark })} />
    </div>
  );
};

// Пуф, на котором сидит няня у ковра.
export const Pouf: React.FC<{ readonly x: number }> = ({ x }) => (
  <div style={box({ left: x - 90, top: F_.floorY - 170, width: 180, height: 170, borderRadius: "40px 40px 16px 16px", backgroundColor: "#C58B6A" })} />
);

// Игровой уголок: ковёр и кубики (n — сколько кубиков уже в башенке).
export const Rug: React.FC = () => (
  <div style={box({ left: F_.rug.x0, top: F_.rug.y - 30, width: F_.rug.x1 - F_.rug.x0, height: 70, borderRadius: "50%", backgroundColor: "#9FB7C9" })} />
);
const BLOCK_COLORS = [C.kidRed, C.kidBlue, C.yellow, C.kidGreen];
export const TOWER_X = -125; // середина башенки
export const towerTop = (n: number) => FLAT.floorY - 8 - n * 46; // верх башенки из n кубиков
export const RUG_BLOCK = { x: -227, y: FLAT.floorY - 27 }; // кубик, который берёт сестрёнка
export const Blocks: React.FC<{ readonly tower: number; readonly held?: { x: number; y: number } | null; readonly taken?: boolean }> = ({ tower, held = null, taken = false }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    {/* башенка у сестрёнки */}
    {Array.from({ length: tower }).map((_, i) => (
      <rect key={i} x={-150} y={F_.floorY - 8 - (i + 1) * 46} width={50} height={46} rx={6} fill={BLOCK_COLORS[i % 4]} stroke="rgba(0,0,0,0.12)" strokeWidth={2} />
    ))}
    {/* россыпь кубиков на ковре */}
    {[-300, -250, -40].map((x, i) => (taken && x === -250 ? null :
      <rect key={x} x={x} y={F_.floorY - 50} width={46} height={46} rx={6} fill={BLOCK_COLORS[(i + 2) % 4]} stroke="rgba(0,0,0,0.12)" strokeWidth={2} transform={`rotate(${x === -250 ? 0 : i * 12 - 8} ${x + 23} ${F_.floorY - 27})`} />
    ))}
    {held ? <rect x={held.x - 23} y={held.y - 23} width={46} height={46} rx={6} fill={BLOCK_COLORS[tower % 4]} stroke="rgba(0,0,0,0.12)" strokeWidth={2} /> : null}
  </svg>
);

// Рюкзак на крючке (после того как мальчик его повесил).
export const PackOnHook: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <path d={`M ${F_.hook.x - 14} ${F_.hook.y + 16} Q ${F_.hook.x} ${F_.hook.y - 6} ${F_.hook.x + 14} ${F_.hook.y + 16}`} stroke="#1F3F7A" strokeWidth={8} fill="none" />
    <rect x={F_.hook.x - 42} y={F_.hook.y + 14} width={84} height={140} rx={28} fill={color} />
    <rect x={F_.hook.x - 30} y={F_.hook.y + 90} width={60} height={50} rx={14} fill="#2558B0" />
  </svg>
);

// Тёплый вечерний / прохладный дневной тон поверх сцены.
export const Tone: React.FC<{ readonly color: string }> = ({ color }) => <div style={box({ left: -1400, top: -1200, width: 4400, height: 4400, backgroundColor: color })} />;
