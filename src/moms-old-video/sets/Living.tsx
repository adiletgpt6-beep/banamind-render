// Гостиная семьи (сцены 1, 3–6, 11–13): обычная бишкекская квартира.
// Слева — проём в прихожую (там появляется папа), окно во двор (панельные
// дома, тополя, горы), полка с книгами и фотографиями, диван у стены,
// торшер. В среднем плане — рабочий стол мамы (она сидит за ним лицом к
// зрителю; ноутбук повёрнут к камере крышкой), перед ним — ковёр, где сын
// играет и где освобождают место для танца.
// Мир — px; пол (низ стены) — y = 1480. Одни и те же координаты во всех
// сценах — предметы не «прыгают» между планами.
import { Mountains, Ornament, WallClock } from "../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { box } from "../shots";

export type Light = "evening" | "morning" | "day";

export const LIV = {
  floorY: 1480,
  door: { x: 110, y: 560, w: 300, h: 920 },
  window: { x: 560, y: 380, w: 540, h: 620 },
  shelf: { x: 1240, y: 640, w: 470 },
  sofa: { x: 1360, w: 820, seatY: 1270, backY: 1040 },
  lamp: { x: 2270 },
  clock: { x: 1880, y: 560, r: 58 },
  // рабочий стол мамы: столешница y = 1210 (передний край 1238)
  table: { x: 380, w: 560, top: 1210, front: 1238 },
  chair: { x: 650 },
  seatFeetY: 1505, // ступни сидящей за столом
  laptop: { x: 690, y: 1222 }, // середина основания ноутбука (передний край)
  rug: { x: 760, y: 1530, w: 1100, h: 330 },
} as const;

const PAL = {
  evening: { wall: "#E9D3B8", wallLow: "#DCC1A0", floor: "#B98D66", floorLine: "rgba(80,50,30,0.12)", trim: "#F6EADA", tint: "rgba(255,190,120,0.18)" },
  morning: { wall: "#F3E8D8", wallLow: "#E8D9C2", floor: "#C99D74", floorLine: "rgba(80,50,30,0.10)", trim: "#FFFFFF", tint: "rgba(255,245,225,0.0)" },
  day: { wall: "#F1E4D1", wallLow: "#E5D3B9", floor: "#C49870", floorLine: "rgba(80,50,30,0.10)", trim: "#FDF8F0", tint: "rgba(255,230,200,0.06)" },
} as const;

// Стена, проём в прихожую, окно, полка, часы, торшер, пол.
export const LivingBack: React.FC<{ readonly light: Light; readonly f?: number; readonly hallLit?: boolean }> = ({ light, f = 0, hallLit = true }) => {
  const p = PAL[light];
  const w = LIV.window;
  const d = LIV.door;
  const eve = light === "evening";
  return (
    <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
      <div style={box({ left: -400, top: 0, width: 3400, height: LIV.floorY, backgroundColor: p.wall })} />
      <div style={box({ left: -400, top: 1150, width: 3400, height: LIV.floorY - 1150, backgroundColor: p.wallLow })} />
      <div style={box({ left: -400, top: 1146, width: 3400, height: 10, backgroundColor: p.trim })} />
      {/* пол: доска */}
      <div style={box({ left: -400, top: LIV.floorY, width: 3400, height: 1200, backgroundColor: p.floor })} />
      <div style={box({ left: -400, top: LIV.floorY, width: 3400, height: 1200, backgroundImage: `repeating-linear-gradient(90deg, ${p.floorLine} 0 3px, transparent 3px 190px)` })} />
      <div style={box({ left: -400, top: LIV.floorY - 22, width: 3400, height: 24, backgroundColor: p.trim })} />
      {/* проём в прихожую */}
      <div style={box({ left: d.x - 22, top: d.y - 22, width: d.w + 44, height: d.h + 22, backgroundColor: p.trim })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: eve ? (hallLit ? "#C9A27C" : "#8E7560") : "#E7D7C0", overflow: "hidden" })}>
        <div style={box({ left: 0, top: d.h - 60, width: d.w, height: 60, backgroundColor: eve ? "#9C7A5A" : "#C9A784" })} />
        {/* вешалка в прихожей */}
        <div style={box({ left: 40, top: 230, width: 200, height: 12, borderRadius: 6, backgroundColor: "#7A5A44" })} />
        <div style={box({ left: 60, top: 242, width: 70, height: 230, borderRadius: "30px 30px 12px 12px", backgroundColor: "#4E5D7E" })} />
        <div style={box({ left: 150, top: 242, width: 64, height: 180, borderRadius: "30px 30px 12px 12px", backgroundColor: "#B76B57" })} />
        {eve && hallLit ? <div style={box({ inset: 0, background: "radial-gradient(circle at 150px 120px, rgba(255,220,160,0.45), transparent 420px)" })} /> : null}
      </div>
      {/* окно во двор */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 10,
          overflow: "hidden",
          background: eve ? "linear-gradient(180deg, #1F2B55, #3F4A7A 62%, #A87A70)" : light === "morning" ? "linear-gradient(180deg, #BFDDF3, #F6E9D2)" : "linear-gradient(180deg, #CFE4F4, #F4E8D6)",
          border: `16px solid ${p.trim}`,
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: -w.x, top: -w.y })}>
          <Mountains x={w.x - 80} y={w.y + 120} w={w.w + 160} h={170} evening={eve ? 1 : 0} />
          <PanelHouse x={w.x - 150} y={w.y + 600} w={400} floors={3} color={eve ? "#384068" : "#E6D3C0"} seed={4} />
          <PanelHouse x={w.x + 280} y={w.y + 640} w={380} floors={3} color={eve ? "#30385E" : "#DCCDBB"} seed={8} />
          <Tree x={w.x + 250} y={w.y + 660} s={0.78} kind="poplar" tone={eve ? 1 : 0} />
        </div>
        {eve
          ? [0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={box({ left: 24 + (i % 4) * 128, top: 352 + Math.floor(i / 4) * 92, width: 38, height: 32, backgroundColor: "#F6D48A", opacity: 0.55 + 0.35 * Math.sin(i * 1.7 + f * 0.002) ** 2 })} />
            ))
          : null}
        <div style={box({ left: w.w / 2 - 22, top: 0, width: 12, height: w.h, backgroundColor: p.trim })} />
        <div style={box({ left: 0, top: w.h * 0.42, width: w.w, height: 12, backgroundColor: p.trim })} />
        {light === "morning" ? <div style={box({ inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,0.35), transparent 60%)" })} /> : null}
      </div>
      <div style={box({ left: w.x - 30, top: w.y + w.h - 6, width: w.w + 60, height: 26, borderRadius: 6, backgroundColor: p.trim })} />
      {/* занавески и цветок */}
      {([-1, 1] as const).map((side) => (
        <div
          key={side}
          style={box({
            left: side < 0 ? w.x - 110 : w.x + w.w - 10,
            top: w.y - 46,
            width: 120,
            height: w.h + 130,
            borderRadius: side < 0 ? "0 0 60px 20px" : "0 0 20px 60px",
            backgroundColor: eve ? "#5B6E96" : "#7D92BC",
            backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 14px, rgba(0,0,0,0.10) 14px 30px)",
          })}
        />
      ))}
      <div style={box({ left: w.x - 120, top: w.y - 56, width: w.w + 240, height: 16, borderRadius: 8, backgroundColor: "#8C6A4E" })} />
      <div style={box({ left: w.x + 380, top: w.y + w.h - 80, width: 64, height: 72, borderRadius: "8px 8px 18px 18px", backgroundColor: "#D17F5E" })} />
      <div style={box({ left: w.x + 362, top: w.y + w.h - 170, width: 100, height: 100, borderRadius: 50, backgroundColor: "#7FAF63" })} />
      <div style={box({ left: w.x + 400, top: w.y + w.h - 200, width: 50, height: 70, borderRadius: 25, backgroundColor: "#6E9E5C" })} />
      {/* полка: книги, растение, фотографии (на одной — сцена, намёк на прошлое мамы) */}
      <Shelf light={light} />
      {/* часы */}
      <WallClock x={LIV.clock.x} y={LIV.clock.y} r={LIV.clock.r} minutes={eve ? 20 * 60 + 15 + f / 300 : 10 * 60 + 5} />
      {/* торшер */}
      <div style={box({ left: LIV.lamp.x - 6, top: 760, width: 12, height: LIV.floorY - 760, backgroundColor: "#4B3B30" })} />
      <div style={box({ left: LIV.lamp.x - 60, top: LIV.floorY - 14, width: 120, height: 16, borderRadius: 8, backgroundColor: "#4B3B30" })} />
      <div style={box({ left: LIV.lamp.x - 100, top: 640, width: 200, height: 150, borderRadius: "40px 40px 12px 12px", backgroundColor: eve ? "#F4CF8F" : "#EADBC3" })} />
      {eve ? <div style={box({ left: -400, top: 0, width: 3400, height: 2600, background: "radial-gradient(circle at 2270px 760px, rgba(255,205,130,0.32), transparent 1100px)" })} /> : null}
      {/* тушкийиз над диваном */}
      <div style={box({ left: 1500, top: 300, width: 220, height: 150, borderRadius: 12, backgroundColor: "#7E2B2F", border: "8px solid #C9A043", boxSizing: "border-box" })}>
        <svg width={204} height={134} viewBox="0 0 204 134" style={box({ left: 0, top: 0 })}>
          <Ornament x={102} y={67} s={0.75} color="#F1D58C" />
          <Ornament x={40} y={67} s={0.45} color="#E9B76A" />
          <Ornament x={164} y={67} s={0.45} color="#E9B76A" />
        </svg>
      </div>
    </div>
  );
};

const Shelf: React.FC<{ light: Light }> = ({ light }) => {
  const s = LIV.shelf;
  const books = ["#2E4A86", "#D9A441", "#B85C4B", "#5E8C7A", "#3A3F55", "#E3C79A", "#7C6AA6"];
  return (
    <div style={box({ left: s.x, top: s.y - 260, width: s.w, height: 300 })}>
      <div style={box({ left: 0, top: 120, width: s.w, height: 16, borderRadius: 4, backgroundColor: "#A47D5B" })} />
      <div style={box({ left: 0, top: 270, width: s.w, height: 16, borderRadius: 4, backgroundColor: "#A47D5B" })} />
      {books.map((c, i) => (
        <div key={i} style={box({ left: 20 + i * 30, top: 270 - (90 + (i % 3) * 14), width: 26, height: 90 + (i % 3) * 14, borderRadius: 3, backgroundColor: c })} />
      ))}
      {/* рамка: молодая мама на сцене (маленький снимок) */}
      <div style={box({ left: 260, top: 160, width: 92, height: 110, borderRadius: 6, backgroundColor: "#F6EEE2", border: "6px solid #6B4A36", boxSizing: "border-box", overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: 80, height: 98, background: "radial-gradient(circle at 40px 30px, #F6D58E, #2A3866 70%)" })} />
        <div style={box({ left: 30, top: 22, width: 20, height: 20, borderRadius: 10, backgroundColor: "#E6B590" })} />
        <div style={box({ left: 26, top: 40, width: 28, height: 40, borderRadius: "10px 10px 4px 4px", backgroundColor: "#3E6FB8" })} />
      </div>
      {/* семейное фото */}
      <div style={box({ left: 370, top: 170, width: 80, height: 100, borderRadius: 6, backgroundColor: "#F6EEE2", border: "6px solid #8C6A4E", boxSizing: "border-box", overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: 68, height: 88, background: "linear-gradient(180deg, #BFDDF3, #CFE6C4)" })} />
        {[10, 26, 42].map((x, i) => (
          <div key={x} style={box({ left: x, top: 30 + (i === 1 ? 14 : 0), width: 16, height: 16, borderRadius: 8, backgroundColor: "#E2B08C" })} />
        ))}
      </div>
      {/* растение наверху */}
      <div style={box({ left: 320, top: 64, width: 60, height: 58, borderRadius: "8px 8px 16px 16px", backgroundColor: "#E7DCCB" })} />
      <div style={box({ left: 300, top: 0, width: 100, height: 80, borderRadius: 50, backgroundColor: light === "evening" ? "#6E9E5C" : "#7FAF63" })} />
      <div style={box({ left: 40, top: 70, width: 140, height: 50, borderRadius: 8, backgroundColor: "#E3D6C3" })} />
    </div>
  );
};

// Диван у стены: спинка, подушки, сиденье, подлокотники.
export const Sofa: React.FC<{ readonly light: Light }> = ({ light }) => {
  const s = LIV.sofa;
  const c = light === "evening" ? "#46598A" : "#5269A0";
  const c2 = light === "evening" ? "#3B4C78" : "#475D92";
  return (
    <div style={box({ left: s.x, top: s.backY, width: s.w, height: LIV.floorY - s.backY + 40 })}>
      <div style={box({ left: 40, top: 0, width: s.w - 80, height: 300, borderRadius: "60px 60px 20px 20px", backgroundColor: c })} />
      <div style={box({ left: 90, top: 80, width: 180, height: 170, borderRadius: 40, backgroundColor: "#E9C46A", rotate: "-6deg" })} />
      <div style={box({ left: s.w - 290, top: 90, width: 170, height: 160, borderRadius: 40, backgroundColor: "#E7E1D6", rotate: "5deg" })} />
      <div style={box({ left: 20, top: s.seatY - s.backY - 10, width: s.w - 40, height: 120, borderRadius: 30, backgroundColor: c2 })} />
      <div style={box({ left: 0, top: 150, width: 90, height: 300, borderRadius: 40, backgroundColor: c })} />
      <div style={box({ left: s.w - 90, top: 150, width: 90, height: 300, borderRadius: 40, backgroundColor: c })} />
      <div style={box({ left: 60, top: LIV.floorY - s.backY - 10, width: 30, height: 34, backgroundColor: "#3B2E26" })} />
      <div style={box({ left: s.w - 90, top: LIV.floorY - s.backY - 10, width: 30, height: 34, backgroundColor: "#3B2E26" })} />
      <div style={box({ left: 40, top: s.seatY - s.backY + 100, width: s.w - 80, height: LIV.floorY - s.seatY - 100, backgroundColor: "#2E3B60", borderRadius: "0 0 16px 16px" })} />
    </div>
  );
};

// Ковёр (ширдак) на полу.
export const Rug: React.FC = () => {
  const r = LIV.rug;
  return (
    <svg width={r.w} height={r.h} viewBox={`0 0 ${r.w} ${r.h}`} style={box({ left: r.x, top: r.y })}>
      <rect x={0} y={0} width={r.w} height={r.h} rx={26} fill="#A84A3E" />
      <rect x={18} y={18} width={r.w - 36} height={r.h - 36} rx={18} fill="none" stroke="#F1E2C6" strokeWidth={7} strokeDasharray="26 12" />
      <Ornament x={r.w / 2} y={r.h / 2} s={1.4} color="#F1E2C6" />
      <Ornament x={r.w * 0.2} y={r.h / 2} s={0.9} color="#2E2A40" />
      <Ornament x={r.w * 0.8} y={r.h / 2} s={0.9} color="#2E2A40" />
    </svg>
  );
};

// Стул за столом: спинка (за мамой) — сдвигается, когда мама встаёт.
export const ChairBack: React.FC<{ readonly x: number; readonly feetY?: number; readonly h?: number; readonly light: Light }> = ({ x, feetY = LIV.seatFeetY, h = 760, light }) => {
  const s = h / 760;
  const c = light === "evening" ? "#7A5A44" : "#9A7353";
  return (
    <div style={box({ left: x - 95 * s, top: feetY - 520 * s, width: 190 * s, height: 520 * s })}>
      <div style={box({ left: 10 * s, top: 0, width: 170 * s, height: 40 * s, borderRadius: 14 * s, backgroundColor: c })} />
      <div style={box({ left: 18 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 150 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 30 * s, top: 110 * s, width: 130 * s, height: 22 * s, backgroundColor: c })} />
    </div>
  );
};

// Сиденье и ножки стула (когда на нём никто не сидит — видно целиком).
export const ChairSeat: React.FC<{ readonly x: number; readonly feetY?: number; readonly h?: number; readonly light: Light }> = ({ x, feetY = LIV.seatFeetY, h = 760, light }) => {
  const s = h / 760;
  const c = light === "evening" ? "#6E503C" : "#8C684B";
  return (
    <div style={box({ left: x - 105 * s, top: feetY - 240 * s, width: 210 * s, height: 240 * s })}>
      <div style={box({ left: 0, top: 0, width: 210 * s, height: 30 * s, borderRadius: 10 * s, backgroundColor: c })} />
      <div style={box({ left: 16 * s, top: 26 * s, width: 20 * s, height: 214 * s, backgroundColor: c })} />
      <div style={box({ left: 174 * s, top: 26 * s, width: 20 * s, height: 214 * s, backgroundColor: c })} />
    </div>
  );
};

// Стол мамы: столешница и передняя панель (поверх тела сидящей).
export const WorkTable: React.FC<{ readonly light: Light }> = ({ light }) => {
  const t = LIV.table;
  const top = light === "evening" ? "#B88A62" : "#C99B70";
  const side = light === "evening" ? "#94694A" : "#A97C57";
  return (
    <div style={box({ left: 0, top: 0, width: 2600, height: 2600 })}>
      <div style={box({ left: t.x, top: t.top - 4, width: t.w, height: t.front - t.top + 8, borderRadius: 8, backgroundColor: top })} />
      <div style={box({ left: t.x + 10, top: t.front, width: t.w - 20, height: 70, backgroundColor: side, borderRadius: "0 0 8px 8px" })} />
      <div style={box({ left: t.x + 26, top: t.front + 60, width: 26, height: LIV.floorY + 26 - t.front - 60, backgroundColor: side })} />
      <div style={box({ left: t.x + t.w - 52, top: t.front + 60, width: 26, height: LIV.floorY + 26 - t.front - 60, backgroundColor: side })} />
      {/* лампа на столе и кружка */}
      <div style={box({ left: t.x + 40, top: t.top - 150, width: 12, height: 150, backgroundColor: "#3D3A44", rotate: "-12deg" })} />
      <div style={box({ left: t.x + 10, top: t.top - 190, width: 110, height: 60, borderRadius: "50px 50px 10px 10px", backgroundColor: "#2F4A7A", rotate: "-12deg" })} />
      <div style={box({ left: t.x + t.w - 110, top: t.top - 54, width: 46, height: 54, borderRadius: "6px 6px 12px 12px", backgroundColor: "#F2EEE6" })} />
      {light === "evening" ? <div style={box({ left: t.x - 300, top: t.top - 500, width: 900, height: 900, background: "radial-gradient(circle at 300px 420px, rgba(255,214,150,0.30), transparent 420px)" })} /> : null}
    </div>
  );
};

// Ноутбук на столе, крышкой к зрителю (экран — к маме). open 0…1: крышка
// опускается к маме — со стороны зрителя становится короче. glow — свет
// экрана на лице и руках мамы.
export const LaptopBack: React.FC<{ readonly open: number; readonly glow?: number }> = ({ open, glow = 1 }) => {
  const { x, y } = LIV.laptop;
  // реальный размер относительно мамы (рост 760 px ≈ 163 см): ≈ 34 × 23 см
  const w = 176;
  const h = 118 * Math.max(0.06, Math.sin((open * Math.PI) / 2));
  return (
    <>
      {open > 0.2 && glow > 0 ? (
        <div style={box({ left: x - 260, top: y - 520, width: 520, height: 520, background: `radial-gradient(ellipse at 260px 420px, rgba(190,220,255,${0.22 * glow * open}), transparent 260px)` })} />
      ) : null}
      <div style={box({ left: x - w / 2 - 6, top: y - 8, width: w + 12, height: 12, borderRadius: 5, backgroundColor: "#9AA3B2" })} />
      <div style={box({ left: x - w / 2, top: y - 6 - h, width: w, height: h, borderRadius: "10px 10px 4px 4px", background: "linear-gradient(180deg, #C9CFD9, #AEB6C4)", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.06)" })} />
      {h > 30 ? <div style={box({ left: x - 11, top: y - 6 - h / 2 - 11, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.35)" })} /> : null}
    </>
  );
};

// Кубики сына на ковре.
export const Blocks: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <svg width={260} height={130} viewBox="0 0 260 130" style={box({ left: x - 130, top: y - 120 })}>
    <rect x={10} y={70} width={60} height={50} rx={6} fill="#E8A33D" />
    <rect x={75} y={70} width={60} height={50} rx={6} fill="#3E7CC0" />
    <rect x={42} y={18} width={60} height={50} rx={6} fill="#D9534F" />
    <rect x={160} y={80} width={70} height={40} rx={6} fill="#5AAE7A" />
    <rect x={190} y={52} width={34} height={28} rx={5} fill="#E8D35A" />
  </svg>
);

// Телефон, лежащий на ковре/диване (вид сверху-сбоку).
export const PhoneOnFloor: React.FC<{ readonly x: number; readonly y: number; readonly glow?: number }> = ({ x, y, glow = 0 }) => (
  <div style={box({ left: x - 50, top: y - 18, width: 100, height: 22, borderRadius: 8, backgroundColor: "#1E2235", transform: "skewX(-20deg)" })}>
    <div style={box({ left: 6, top: 3, right: 6, bottom: 5, borderRadius: 5, backgroundColor: glow > 0 ? `rgba(180,210,245,${0.6 + 0.4 * glow})` : "#2C3B5C" })} />
  </div>
);

// Спортивная сумка (суббота): молния открыта (open 0…1).
export const SportBag: React.FC<{ readonly x: number; readonly y: number; readonly open?: number; readonly s?: number }> = ({ x, y, open = 0, s = 1 }) => (
  <svg width={300 * s} height={190 * s} viewBox="0 0 300 190" style={box({ left: x - 150 * s, top: y - 186 * s })}>
    <path d="M 90 60 Q 150 -10 210 60" stroke="#24305A" strokeWidth={10} fill="none" />
    <rect x={10} y={50} width={280} height={136} rx={48} fill="#2E4A86" />
    <rect x={10} y={50} width={280} height={136} rx={48} fill="url(#none)" />
    <path d={`M 40 ${62} L 260 ${62}`} stroke={open > 0.5 ? "#1A2546" : "#F2C230"} strokeWidth={open > 0.5 ? 14 : 5} />
    <rect x={120} y={110} width={60} height={40} rx={10} fill="#F2C230" opacity={0.9} />
    <rect x={10} y={150} width={280} height={36} rx={18} fill="#000000" opacity={0.12} />
  </svg>
);

// Тёплый вечерний свет поверх всей сцены (мягкий слой).
export const LightTint: React.FC<{ readonly light: Light }> = ({ light }) => (
  <div style={box({ left: -400, top: 0, width: 3400, height: 2600, backgroundColor: PAL[light].tint, pointerEvents: "none", mixBlendMode: "multiply" })} />
);
