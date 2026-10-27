// Гостиная семьи (та же квартира в Бишкеке, что и в 2D-роликах серии):
// светлая комната, окно во двор (панельные дома, тополя, днём — горы
// Ала-Тоо), полка с книгами и коробкой настольной игры, часы, небольшое
// панно с орнаментом. Большой деревянный стол — и семейный, и рабочий:
// ноутбук папы, монитор, лампа. Вечером — тёмное окно и тёплая лампа.
// Пол (низ стены) — y = 1500; сидящие за столом стоят ступнями на y = 1540
// (те же правила посадки, что у рига ролика №12).
import { Mountains, Ornament, WallClock } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { clamp, lerp } from "../rig/motion";
import { box } from "../shots";
import { C } from "../ui/kit";

const TOP = 1240; // столешница

export const LIVING = {
  floorY: 1500,
  seatY: 1540,
  window: { x: 120, y: 360, w: 560, h: 640 },
  shelf: { x: 1010, y: 930, w: 560 },
  box: { x: 1185, y: 930 }, // коробка игры на полке (низ коробки) — над правым плечом папы
  clock: { x: 1720, y: 470, r: 62 },
  table: { x: 520, top: TOP, w: 1120, front: TOP + 30, bottom: 1560 },
  seat: { mom: 820, dad: 1080, son: 1350 },
  laptop: { x: 1060, y: TOP + 14 }, // середина шарнира (ближний к камере край)
  monitor: { x: 1290, y: TOP + 8 },
  lamp: { x: 640, y: TOP + 6 },
  phoneDad: { x: 1170, y: TOP + 22 },
  phoneMom: { x: 905, y: TOP + 22 },
} as const;

// Высота сиденья (px от пола) для роста h; ребёнку — подушка на стуле.
export const seatH = (h: number) => (h < 600 ? 0.36 : 0.27) * h;

export const LivingBack: React.FC<{ readonly evening?: number; readonly minutes: number; readonly boxOnShelf?: boolean }> = ({ evening = 0, minutes, boxOnShelf = true }) => {
  const w = LIVING.window;
  const ev = evening > 0.5;
  const wall = ev ? "#E7D9C6" : "#F3EEE5";
  const lower = ev ? "#DCCBB3" : "#E8E0D2";
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -400, top: 0, width: 3000, height: LIVING.floorY, backgroundColor: wall })} />
      <div style={box({ left: -400, top: 1150, width: 3000, height: LIVING.floorY - 1150, backgroundColor: lower })} />
      <div style={box({ left: -400, top: 1146, width: 3000, height: 10, backgroundColor: ev ? "#CDB89C" : "#DCD2C1" })} />
      {/* окно во двор */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 10,
          overflow: "hidden",
          background: ev ? "linear-gradient(180deg, #1E2A4C, #3F4570 72%, #8C6A6E)" : "linear-gradient(180deg, #CFE4F4, #F4EBDD)",
          border: "18px solid #FBF8F2",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: -w.x, top: -w.y })}>
          {ev ? null : <Mountains x={w.x - 80} y={w.y + 70} w={w.w + 160} h={180} />}
          <PanelHouse x={w.x - 140} y={w.y + 600} w={400} floors={3} color={ev ? "#343A5E" : "#E6D3C0"} seed={4} />
          <PanelHouse x={w.x + 290} y={w.y + 640} w={380} floors={3} color={ev ? "#30375A" : "#DCCDBB"} seed={7} />
          <Tree x={w.x + 260} y={w.y + 690} s={0.8} kind="poplar" tone={ev ? 1 : 0} />
        </div>
        {ev ? [0, 1, 2, 3, 4].map((i) => <div key={i} style={box({ left: 26 + (i % 3) * 170, top: 360 + Math.floor(i / 3) * 96, width: 40, height: 34, backgroundColor: "#F6D48A", opacity: 0.85 })} />) : null}
        <div style={box({ left: w.w / 2 - 24, top: 0, width: 12, height: w.h, backgroundColor: "#FBF8F2" })} />
      </div>
      <div style={box({ left: w.x - 30, top: w.y + w.h - 6, width: w.w + 60, height: 26, borderRadius: 6, backgroundColor: "#FBF8F2" })} />
      {/* шторы — спокойный серо-синий */}
      <div style={box({ left: w.x - 96, top: w.y - 40, width: 104, height: w.h + 110, borderRadius: "0 0 30px 30px", backgroundColor: ev ? "#7D879A" : "#AEBBCB" })} />
      <div style={box({ left: w.x + w.w - 8, top: w.y - 40, width: 104, height: w.h + 110, borderRadius: "0 0 30px 30px", backgroundColor: ev ? "#7D879A" : "#AEBBCB" })} />
      <div style={box({ left: w.x - 120, top: w.y - 54, width: w.w + 240, height: 14, borderRadius: 7, backgroundColor: "#8C6A4E" })} />
      {/* цветок на подоконнике */}
      <div style={box({ left: w.x + 420, top: w.y + w.h - 72, width: 64, height: 66, borderRadius: "8px 8px 18px 18px", backgroundColor: "#C9644F" })} />
      <div style={box({ left: w.x + 404, top: w.y + w.h - 150, width: 96, height: 90, borderRadius: 45, backgroundColor: "#7FAF63" })} />
      {/* полка с книгами и коробкой игры */}
      <Shelf boxOnShelf={boxOnShelf} />
      {/* панно с орнаментом и часы */}
      <div style={box({ left: 760, top: 560, width: 150, height: 190, borderRadius: 12, backgroundColor: "#7E2B2F", border: "8px solid #C9A043", boxSizing: "border-box" })}>
        <svg width={134} height={174} viewBox="0 0 134 174" style={box({ left: 0, top: 0 })}>
          <Ornament x={67} y={87} s={0.75} color="#F1D58C" />
        </svg>
      </div>
      <WallClock x={LIVING.clock.x} y={LIVING.clock.y} r={LIVING.clock.r} minutes={minutes} />
      {/* торшер справа */}
      <div style={box({ left: 1860, top: 760, width: 10, height: 740, backgroundColor: "#4A4E5C" })} />
      <div style={box({ left: 1790, top: 700, width: 150, height: 100, borderRadius: "70px 70px 10px 10px", backgroundColor: ev ? "#F6CF86" : "#EFE6D2" })} />
      {/* пол */}
      <div style={box({ left: -400, top: LIVING.floorY, width: 3000, height: 1100, background: ev ? "linear-gradient(180deg, #A9825F, #94704F)" : "linear-gradient(180deg, #D3B48D, #C6A47B)" })} />
      <div style={box({ left: -400, top: LIVING.floorY, width: 3000, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.09) 0 2px, transparent 2px 160px)" })} />
      {/* ковёр */}
      <div style={box({ left: 430, top: 1566, width: 1300, height: 300, borderRadius: 18, backgroundColor: ev ? "#6B7590" : "#8E9BB3", border: "14px solid #E8D7B0", boxSizing: "border-box" })} />
    </div>
  );
};

// Полка на стене: книги, фото, коробка настольной игры.
export const Shelf: React.FC<{ readonly boxOnShelf?: boolean }> = ({ boxOnShelf = true }) => {
  const s = LIVING.shelf;
  const books = ["#14243B", "#8190A3", "#E0A73A", "#5E9E86", "#14243B"];
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: s.x, top: s.y, width: s.w, height: 18, borderRadius: 5, backgroundColor: "#9A7353", boxShadow: "0 8px 12px rgba(60,40,20,0.15)" })} />
      {books.map((c, i) => (
        <div key={i} style={box({ left: s.x + 14 + i * 32, top: s.y - 120 + (i % 3) * 8, width: 26, height: 120 - (i % 3) * 8, borderRadius: 3, backgroundColor: c })} />
      ))}
      {/* фото в рамке */}
      <div style={box({ left: s.x + 300, top: s.y - 110, width: 86, height: 110, borderRadius: 6, backgroundColor: "#FBF8F2", border: "6px solid #6E5543", boxSizing: "border-box" })}>
        <div style={box({ left: 10, top: 40, width: 54, height: 40, borderRadius: "30px 30px 4px 4px", backgroundColor: "#AEBBCB" })} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: s.x + 410 + i * 34, top: s.y - 104 + i * 6, width: 28, height: 104 - i * 6, borderRadius: 3, backgroundColor: ["#C9644F", "#AEBBCB", "#E0A73A"][i] })} />
      ))}
      {boxOnShelf ? <GameBox x={LIVING.box.x} y={LIVING.box.y} w={150} /> : null}
    </div>
  );
};

// Коробка настольной игры (вид спереди): x — центр, y — низ коробки.
export const GameBox: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly rot?: number; readonly lid?: number }> = ({ x, y, w, rot = 0, lid = 0 }) => {
  const h = w * 0.62;
  return (
    <div style={box({ left: x - w / 2, top: y - h, width: w, height: h, rotate: `${rot}deg`, transformOrigin: "50% 100%" })}>
      <div style={box({ left: 0, top: h * 0.14, width: w, height: h * 0.86, borderRadius: 6, backgroundColor: "#2F5D8F" })} />
      <div style={box({ left: -3, top: -lid * h * 0.5, width: w + 6, height: h * 0.5, borderRadius: 7, backgroundColor: C.yellow, boxShadow: "0 3px 6px rgba(0,0,0,0.15)", opacity: 1 - clamp((lid - 0.6) / 0.4) })}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: w * 0.12 + i * w * 0.27, top: h * 0.12, width: w * 0.18, height: w * 0.18, borderRadius: w * 0.09, backgroundColor: ["#E5677A", "#14243B", "#5E9E86"][i] })} />
        ))}
      </div>
    </div>
  );
};

// Стол: столешница поверх тел сидящих, передняя кромка, ножки.
export const TableFront: React.FC<{ readonly evening?: number }> = ({ evening = 0 }) => {
  const t = LIVING.table;
  const ev = evening > 0.5;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: t.x - 10, top: t.top - 6, width: t.w + 20, height: t.front - t.top + 10, borderRadius: 10, backgroundColor: ev ? "#D7B98E" : "#E7CDA6" })} />
      <div style={box({ left: t.x - 10, top: t.front, width: t.w + 20, height: 30, borderRadius: "0 0 8px 8px", backgroundColor: ev ? "#B8956A" : "#CDAA7E" })} />
      <div style={box({ left: t.x + 40, top: t.front + 30, width: 34, height: t.bottom - t.front - 30, backgroundColor: ev ? "#A3825B" : "#BC9970" })} />
      <div style={box({ left: t.x + t.w - 74, top: t.front + 30, width: 34, height: t.bottom - t.front - 30, backgroundColor: ev ? "#A3825B" : "#BC9970" })} />
    </div>
  );
};

// Спинка стула за сидящим (рисуется до персонажа).
export const ChairBack: React.FC<{ readonly x: number; readonly h?: number; readonly evening?: number }> = ({ x, h = 760, evening = 0 }) => {
  const s = h / 760;
  const c = evening > 0.5 ? "#55607A" : "#6C7A93";
  return (
    <div style={box({ left: x - 100 * s, top: LIVING.seatY - 530 * s, width: 200 * s, height: 530 * s })}>
      <div style={box({ left: 8 * s, top: 0, width: 184 * s, height: 190 * s, borderRadius: 28 * s, backgroundColor: c })} />
      <div style={box({ left: 24 * s, top: 170 * s, width: 18 * s, height: 360 * s, backgroundColor: "#3E4658" })} />
      <div style={box({ left: 158 * s, top: 170 * s, width: 18 * s, height: 360 * s, backgroundColor: "#3E4658" })} />
    </div>
  );
};

// Ноутбук спереди: к камере — шарнир и внешняя сторона крышки (экран
// смотрит на сидящего за столом). open: 1 — открыт (≈ 105°), 0 — закрыт;
// крышка поворачивается вокруг шарнира. turn: поворот вокруг вертикали
// (−1…1, ±40°). x, y — середина шарнира. Возвращает и точку верхнего края
// крышки (для кисти) через lidTop().
const LAP_W = 150;
const LAP_D = 104;
const ELEV = 0.28; // наклон взгляда камеры (≈ 16°)
export const lidTop = (x: number, y: number, open: number, turn = 0) => {
  const th = lerp(0, 105, clamp(open)) * (Math.PI / 180);
  const projH = LAP_D * (Math.sin(th) * Math.cos(ELEV) + Math.cos(th) * Math.sin(ELEV));
  return { x: x + turn * 10, y: y - projH };
};
export const LaptopFront: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly turn?: number; readonly glow?: number }> = ({ x, y, open, turn = 0, glow = 1 }) => {
  const a = turn * 0.7;
  const w = LAP_W * Math.cos(a);
  const top = lidTop(x, y, open, turn);
  const deckH = LAP_D * Math.sin(ELEV);
  const side = Math.sin(a) * 26;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* корпус (клавиатурная часть) лежит за шарниром */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 + side} ${y - deckH} L ${x - w / 2 + side} ${y - deckH} Z`} fill="#BCC4D0" />
      {/* свечение экрана на лице сидящего — мягкий ореол над крышкой */}
      {open > 0.6 && glow > 0 ? <ellipse cx={x + side} cy={top.y - 20} rx={w * 0.7} ry={40} fill={`rgba(190,220,255,${0.18 * glow * open})`} /> : null}
      {/* внешняя сторона крышки */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 + side * (top.y < y - deckH ? 0.4 : 1)} ${top.y} L ${x - w / 2 + side * (top.y < y - deckH ? 0.4 : 1)} ${top.y} Z`} fill="#D3D9E2" stroke="#AEB7C4" strokeWidth={3} strokeLinejoin="round" />
      {/* боковая грань крышки при повороте: видна толщина, не экран */}
      {Math.abs(side) > 2 ? <path d={`M ${x + Math.sign(side) * w / 2} ${y} L ${x + Math.sign(side) * w / 2} ${top.y} L ${x + Math.sign(side) * (w / 2 + 6)} ${top.y + 2} L ${x + Math.sign(side) * (w / 2 + 6)} ${y} Z`} fill="#9EA8B6" /> : null}
      <circle cx={x + side * 0.4} cy={(y + top.y) / 2} r={Math.max(2, (y - top.y) * 0.08)} fill="#C2C9D4" />
      <rect x={x - w / 2} y={y - 2} width={w} height={6} rx={3} fill="#9EA8B6" />
    </svg>
  );
};

// Монитор на подставке, повёрнут к сидящему: к камере — задняя крышка и
// левый край. paper — рисунок сына, приклеенный к левому краю монитора
// (с камеры видна обратная сторона листа).
export const Monitor: React.FC<{ readonly x: number; readonly y: number; readonly paper?: number; readonly glow?: number }> = ({ x, y, paper = 0, glow = 1 }) => (
  <div style={box({ left: x - 120, top: y - 230, width: 240, height: 230 })}>
    <div style={box({ left: 104, top: 150, width: 32, height: 74, backgroundColor: "#4C5466" })} />
    <div style={box({ left: 64, top: 214, width: 112, height: 16, borderRadius: 8, backgroundColor: "#3C4252" })} />
    <div style={box({ left: 0, top: 0, width: 240, height: 160, borderRadius: 12, backgroundColor: "#353C4C", boxShadow: `0 0 40px rgba(170,205,255,${0.25 * glow})` })} />
    <div style={box({ left: 70, top: 40, width: 100, height: 70, borderRadius: 10, backgroundColor: "#2C3240" })} />
    {paper > 0 ? (
      <div style={box({ left: -96, top: 26, width: 104, height: 76, borderRadius: 3, backgroundColor: "#F3F0E8", opacity: paper, boxShadow: "0 3px 6px rgba(0,0,0,0.15)" })}>
        <div style={box({ left: 18, top: 30, width: 60, height: 26, borderRadius: 8, border: "3px solid rgba(61,108,196,0.18)", boxSizing: "border-box" })} />
        <div style={box({ left: 82, top: -4, width: 26, height: 12, backgroundColor: "rgba(255,255,255,0.7)", rotate: "20deg" })} />
      </div>
    ) : null}
  </div>
);

// Настольная лампа (тёплый свет вечером).
export const DeskLamp: React.FC<{ readonly x: number; readonly y: number; readonly on?: number }> = ({ x, y, on = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    {on > 0 ? <ellipse cx={x + 60} cy={y - 10} rx={240} ry={60} fill={`rgba(255,210,130,${0.25 * on})`} /> : null}
    <ellipse cx={x} cy={y} rx={44} ry={10} fill="#3E4658" />
    <path d={`M ${x} ${y} L ${x - 10} ${y - 110} L ${x + 50} ${y - 170}`} stroke="#3E4658" strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d={`M ${x + 30} ${y - 196} L ${x + 104} ${y - 150} L ${x + 72} ${y - 120} Z`} fill={C.yellow} stroke="#C9A43A" strokeWidth={3} />
  </svg>
);

// Телефон, лежащий на столе (вид спереди-сверху), экран может светиться.
export const PhoneOnTable: React.FC<{ readonly x: number; readonly y: number; readonly glow?: number; readonly shake?: number }> = ({ x, y, glow = 0, shake = 0 }) => (
  <div style={box({ left: x - 34 + shake, top: y - 12, width: 68, height: 16, borderRadius: 5, backgroundColor: "#1B2433", boxShadow: glow > 0 ? `0 -6px 16px rgba(190,220,255,${0.7 * glow})` : undefined })}>
    <div style={box({ left: 4, top: 3, width: 60, height: 8, borderRadius: 3, backgroundColor: glow > 0 ? `rgba(210,232,255,${0.4 + 0.6 * glow})` : "#2C3B5C" })} />
  </div>
);

// Кружка с карандашами / кружка с чаем.
export const Mug: React.FC<{ readonly x: number; readonly y: number; readonly pencils?: boolean }> = ({ x, y, pencils }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    {pencils ? [-10, 0, 10].map((d, i) => <rect key={d} x={x + d - 3} y={y - 74 - i * 6} width={6} height={50} rx={2} fill={["#E0A73A", "#3D6CC4", "#5E9E86"][i]} transform={`rotate(${d * 0.8} ${x} ${y - 30})`} />) : null}
    <rect x={x - 22} y={y - 44} width={44} height={44} rx={8} fill={pencils ? "#8190A3" : "#FFFFFF"} stroke="#C5CDD8" strokeWidth={2} />
  </svg>
);
