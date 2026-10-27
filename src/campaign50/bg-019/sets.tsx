// Декорации BalaGoBG019 (мировые px). Повторно используются готовые
// элементы 2D-ролика №12 (горы Ала-Тоо, панельные дома, тополя, часы,
// ноутбук, телефон) — только импортом, без изменений.
//
// Класс: стена до y = 1440, пол ниже; парта сына (верх y = 1350), задняя
// парта, доска, окно с видом на Бишкек, часы 13:00.
// Офис: стена до y = 1500; стол (верх y = 1240), мама сидит (ступни
// y = 1540), окно с городом и горами, часы 13:00, полка с папками.
import { fontFamily } from "../../fonts";
import { Mountains, PhoneFlat, WallClock } from "../../two-schedules-2d/sets/Apartment";
import { LaptopSide } from "../../two-schedules-2d/sets/Home";
import { PanelHouse, Sky, Tree } from "../../two-schedules-2d/sets/Outdoor";
import { box } from "./context";
import { BG19_TEXT } from "./script";

export const NAVY = "#14285A";
export const YELLOW = "#FFC90E";

// ---------- Класс ----------
export const CLASS = {
  floorY: 1440,
  desk: { x: 330, w: 400, top: 1350, bottom: 1620 },
  backDesk: { x: 40, w: 300, top: 1300, bottom: 1500 },
  board: { x: 70, y: 690, w: 540, h: 300 },
  window: { x: 700, y: 610, w: 330, h: 450 },
  clock: { x: 655, y: 640, r: 40 },
  son: { x: 520, y: 1620, h: 560 },
  teacher: { x: 850, y: 1600, h: 780 },
  kid: { x: 190, y: 1500, h: 470 },
  pack: { x: 625, y: 1350 }, // рюкзак сына на парте (низ, середина)
} as const;

// Вид из окна: горы, панельные дома, тополя (Бишкек).
const CityView: React.FC<{ w: number; h: number; houses?: boolean }> = ({ w, h, houses = true }) => (
  <div style={box({ left: 0, top: 0, width: w, height: h, overflow: "hidden" })}>
    <Sky w={w} h={h} />
    <Mountains x={-60} y={h * 0.18} w={w + 120} h={h * 0.38} />
    {houses ? (
      <>
        <PanelHouse x={-30} y={h + 40} w={w * 0.55} floors={4} color="#E7DCCB" seed={3} />
        <PanelHouse x={w * 0.5} y={h + 80} w={w * 0.62} floors={5} color="#DCE3E8" seed={5} />
        <Tree x={w * 0.46} y={h + 30} s={0.75} kind="poplar" />
      </>
    ) : null}
  </div>
);

export const ClassroomBack: React.FC<{ readonly minutes?: number }> = ({ minutes = 13 * 60 }) => {
  const b = CLASS.board;
  const w = CLASS.window;
  return (
    <div style={box({ left: -400, top: 0, width: 1900, height: 2400 })}>
      <div style={box({ left: 0, top: 0, width: 1900, height: CLASS.floorY, backgroundColor: "#F4ECDF" })} />
      <div style={box({ left: 0, top: 1140, width: 1900, height: CLASS.floorY - 1140, backgroundColor: "#DCE7EF" })} />
      <div style={box({ left: 0, top: 1132, width: 1900, height: 12, backgroundColor: "#C7D6E2" })} />
      <div style={box({ left: 0, top: CLASS.floorY, width: 1900, height: 960, backgroundColor: "#D9BF9A" })} />
      <div style={box({ left: 0, top: CLASS.floorY, width: 1900, height: 960, backgroundImage: "repeating-linear-gradient(90deg, rgba(120,80,40,0.10) 0 3px, transparent 3px 150px)" })} />
      <div style={box({ left: 0, top: CLASS.floorY, width: 1900, height: 18, backgroundColor: "#B79C78" })} />
      {/* доска */}
      <div style={box({ left: 400 + b.x - 14, top: b.y - 14, width: b.w + 28, height: b.h + 28, borderRadius: 10, backgroundColor: "#9A7353" })} />
      <div style={box({ left: 400 + b.x, top: b.y, width: b.w, height: b.h, borderRadius: 4, backgroundColor: "#2F5D50" })} />
      <div style={box({ left: 400 + b.x + 34, top: b.y + 40, color: "rgba(255,255,255,0.88)", fontFamily, fontSize: 40, fontWeight: 700, whiteSpace: "nowrap" })}>{BG19_TEXT.board}</div>
      <div style={box({ left: 400 + b.x + 34, top: b.y + 120, width: 300, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" })} />
      <div style={box({ left: 400 + b.x + 34, top: b.y + 160, width: 220, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" })} />
      <div style={box({ left: 400 + b.x + 30, top: b.y + b.h + 4, width: 120, height: 16, borderRadius: 4, backgroundColor: "#B89878" })} />
      {/* окно */}
      <div style={box({ left: 400 + w.x - 16, top: w.y - 16, width: w.w + 32, height: w.h + 32, borderRadius: 10, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: 400 + w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden" })}>
        <CityView w={w.w} h={w.h} />
      </div>
      <div style={box({ left: 400 + w.x + w.w / 2 - 6, top: w.y, width: 12, height: w.h, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: 400 + w.x - 30, top: w.y + w.h + 12, width: w.w + 60, height: 22, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
      {/* часы */}
      <WallClock x={400 + CLASS.clock.x} y={CLASS.clock.y} r={CLASS.clock.r} minutes={minutes} />
      {/* шкаф у правой стены */}
      <div style={box({ left: 400 + 1090, top: 820, width: 260, height: 620, borderRadius: 8, backgroundColor: "#C9A27E" })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 400 + 1110, top: 850 + i * 190, width: 220, height: 160, borderRadius: 6, backgroundColor: "#E6D2B8" })}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={box({ left: 12 + k * 40, top: 30 + (k % 2) * 8, width: 30, height: 120 - (k % 2) * 8, borderRadius: 3, backgroundColor: ["#3A6EA5", "#E85D75", "#FFC90E", "#3E9C6B", "#7A6BC4"][k] })} />
          ))}
        </div>
      ))}
      {/* задняя парта */}
      <SchoolDesk x={400 + CLASS.backDesk.x} w={CLASS.backDesk.w} top={CLASS.backDesk.top} bottom={CLASS.backDesk.bottom} shade />
    </div>
  );
};

// Школьная парта: столешница и передняя панель (закрывает ноги стоящего).
export const SchoolDesk: React.FC<{ x: number; w: number; top: number; bottom: number; shade?: boolean }> = ({ x, w, top, bottom, shade }) => (
  <>
    <div style={box({ left: x - 10, top: top - 8, width: w + 20, height: 26, borderRadius: 8, backgroundColor: shade ? "#C79E74" : "#D7AE82" })} />
    <div style={box({ left: x, top: top + 18, width: w, height: bottom - top - 60, borderRadius: "0 0 10px 10px", backgroundColor: shade ? "#5D7FA6" : "#6A8DB5" })} />
    <div style={box({ left: x + 20, top: bottom - 46, width: 22, height: 46, backgroundColor: "#4B5466" })} />
    <div style={box({ left: x + w - 42, top: bottom - 46, width: 22, height: 46, backgroundColor: "#4B5466" })} />
  </>
);

export const ClassDeskFront: React.FC = () => {
  const d = CLASS.desk;
  return <SchoolDesk x={d.x} w={d.w} top={d.top} bottom={d.bottom} />;
};

// Рюкзак сына на парте: open 0…1 — клапан открыт; fill — что уже внутри.
export const PackOnDesk: React.FC<{ open: number; fill?: number }> = ({ open, fill = 0 }) => {
  const { x, y } = CLASS.pack;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <rect x={x - 78} y={y - 170} width={156} height={170} rx={30} fill="#3E9C6B" />
      <rect x={x - 60} y={y - 80} width={120} height={56} rx={14} fill="#358A5D" />
      {fill > 0 ? <rect x={x - 54} y={y - 186} width={46} height={30} rx={4} fill="#3A6EA5" opacity={Math.min(1, fill * 2)} /> : null}
      {fill > 0.5 ? <rect x={x + 2} y={y - 182} width={40} height={24} rx={8} fill="#E85D75" /> : null}
      <path d={`M ${x - 76} ${y - 160} Q ${x} ${y - 160 - 70 * (1 - open)} ${x + 76} ${y - 160} L ${x + 76} ${y - 132 + 60 * open} Q ${x} ${y - 112 + 70 * open} ${x - 76} ${y - 132 + 60 * open} Z`} fill="#45A876" />
      <rect x={x - 8} y={y - 132 + 60 * open} width={16} height={18} rx={4} fill="#FFC90E" />
    </svg>
  );
};

// ---------- Колокольчик ----------
// Ручной школьный колокольчик с красной лентой. (x, y) — кисть,
// которая держит ручку; swing — угол качания (градусы); s — масштаб.
export const HandBell: React.FC<{ x: number; y: number; swing: number; s?: number }> = ({ x, y, swing, s = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
      {/* ручка */}
      <rect x={-11} y={-8} width={22} height={70} rx={10} fill="#8A5A3B" />
      <rect x={-14} y={56} width={28} height={12} rx={4} fill="#B98A2E" />
      {/* лента */}
      <path d="M -6 70 Q -40 66 -52 92 Q -30 96 -8 80 Z" fill="#D93B3B" />
      <path d="M 6 70 Q 40 66 52 92 Q 30 96 8 80 Z" fill="#D93B3B" />
      <path d="M -4 78 L -22 138 L -10 132 L -4 146 Z M 4 78 L 22 138 L 10 132 L 4 146 Z" fill="#C42F33" />
      {/* купол */}
      <path d="M -26 68 Q -30 72 -34 96 Q -46 150 -78 168 L 78 168 Q 46 150 34 96 Q 30 72 26 68 Z" fill="#E8B23A" />
      <path d="M -18 76 Q -24 110 -40 150 L -24 150 Q -12 112 -8 78 Z" fill="#F6D57A" opacity={0.8} />
      <rect x={-84} y={160} width={168} height={16} rx={8} fill="#C9921F" />
      {/* язычок */}
      <circle cx={Math.sin((swing * Math.PI) / 180) * -18} cy={184} r={13} fill="#9C6E1A" />
    </g>
  </svg>
);

// Звуковые волны от колокольчика: кольца расходятся (t — секунды с удара).
export const BellRings: React.FC<{ x: number; y: number; hits: readonly number[]; f: number; color?: string; max?: number }> = ({ x, y, hits, f, color = YELLOW, max = 420 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    {hits.map((h) => {
      const u = (f - h) / 34;
      if (u < 0 || u > 1) return null;
      return [0, 0.22].map((d) => {
        const v = u - d;
        if (v < 0) return null;
        return <circle key={`${h}-${d}`} cx={x} cy={y} r={60 + max * v} fill="none" stroke={color} strokeWidth={10 * (1 - v)} opacity={0.6 * (1 - v)} />;
      });
    })}
  </svg>
);

// ---------- Офис ----------
export const OFFICE = {
  floorY: 1500,
  seatY: 1540,
  desk: { x: 250, top: 1240, front: 1268, bottom: 1540 },
  window: { x: 40, y: 400, w: 600, h: 700 },
  clock: { x: 900, y: 520, r: 52 },
  mom: { x: 600, h: 760 },
  laptop: { x: 880, y: 1256 },
  phone: { x: 430, y: 1262 },
} as const;

export const OfficeBack: React.FC<{ readonly minutes?: number }> = ({ minutes = 13 * 60 }) => {
  const w = OFFICE.window;
  return (
    <div style={box({ left: -400, top: 0, width: 1900, height: 2400 })}>
      <div style={box({ left: 0, top: 0, width: 1900, height: OFFICE.floorY, backgroundColor: "#E8EEF4" })} />
      <div style={box({ left: 0, top: OFFICE.floorY, width: 1900, height: 900, backgroundColor: "#B9C3CF" })} />
      <div style={box({ left: 0, top: OFFICE.floorY, width: 1900, height: 14, backgroundColor: "#9FAAB8" })} />
      {/* большое окно: Бишкек, горы */}
      <div style={box({ left: 400 + w.x - 18, top: w.y - 18, width: w.w + 36, height: w.h + 36, borderRadius: 8, backgroundColor: "#C7D0DA" })} />
      <div style={box({ left: 400 + w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden" })}>
        <CityView w={w.w} h={w.h} />
      </div>
      {[1, 2].map((i) => (
        <div key={i} style={box({ left: 400 + w.x + (w.w / 3) * i - 6, top: w.y, width: 12, height: w.h, backgroundColor: "#C7D0DA" })} />
      ))}
      {/* жалюзи сверху */}
      <div style={box({ left: 400 + w.x, top: w.y, width: w.w, height: 80, backgroundImage: "repeating-linear-gradient(0deg, #E9EDF2 0 10px, #D5DCE4 10px 14px)" })} />
      <WallClock x={400 + OFFICE.clock.x} y={OFFICE.clock.y} r={OFFICE.clock.r} minutes={minutes} />
      {/* полка с папками */}
      <div style={box({ left: 400 + 720, top: 840, width: 400, height: 16, backgroundColor: "#9AA6B4" })} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <div key={k} style={box({ left: 400 + 740 + k * 52, top: 700 + (k % 3) * 6, width: 40, height: 140 - (k % 3) * 6, borderRadius: 4, backgroundColor: ["#3A6EA5", "#FFC90E", "#6D7FA3", "#3E9C6B", "#E85D75", "#3A6EA5"][k] })} />
      ))}
      {/* доска с заметками */}
      <div style={box({ left: 400 + 760, top: 930, width: 300, height: 220, borderRadius: 10, backgroundColor: "#FFFFFF", border: "6px solid #C7D0DA" })}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={box({ left: 24 + k * 88, top: 30 + (k % 2) * 30, width: 70, height: 70, backgroundColor: ["#FFF2B3", "#D9F0E1", "#DDE9F7"][k], rotate: `${(k - 1) * 5}deg` })} />
        ))}
      </div>
      {/* растение */}
      <div style={box({ left: 400 + 1120, top: 1180, width: 90, height: 120, borderRadius: "10px 10px 30px 30px", backgroundColor: "#E9E2D6" })} />
      {[-40, -10, 20, 45].map((a, i) => (
        <div key={i} style={box({ left: 400 + 1150, top: 1000, width: 34, height: 190, borderRadius: 30, backgroundColor: i % 2 ? "#6B9C55" : "#7FAF63", transformOrigin: "50% 100%", rotate: `${a}deg` })} />
      ))}
    </div>
  );
};

// Офисное кресло за мамой (рисуется до неё).
export const OfficeChairBack: React.FC<{ x: number }> = ({ x }) => (
  <>
    <div style={box({ left: x - 120, top: 900, width: 240, height: 420, borderRadius: "70px 70px 30px 30px", backgroundColor: "#3D4556" })} />
    <div style={box({ left: x - 98, top: 922, width: 196, height: 370, borderRadius: "56px 56px 24px 24px", backgroundColor: "#485164" })} />
  </>
);

// Стол (поверх тела сидящей), ноутбук и телефон на столе.
export const OfficeDeskFront: React.FC<{ phone?: boolean; phoneGlow?: number; phoneShake?: number; laptopGlow?: number }> = ({ phone = true, phoneGlow = 0, phoneShake = 0, laptopGlow = 1 }) => {
  const d = OFFICE.desk;
  return (
    <>
      <div style={box({ left: d.x - 10, top: d.top - 6, width: 1400, height: d.front - d.top + 10, borderRadius: 10, backgroundColor: "#F7F4EE" })} />
      <div style={box({ left: d.x, top: d.front, width: 1400, height: d.bottom - d.front, backgroundColor: "#DCD3C4" })} />
      <div style={box({ left: d.x, top: d.front, width: 1400, height: 10, backgroundColor: "#C9BFAE" })} />
      {/* бумаги */}
      <div style={box({ left: 640, top: d.top - 6, width: 120, height: 10, borderRadius: 3, backgroundColor: "#FFFFFF", boxShadow: "0 2px 0 #E2DDD3" })} />
      <LaptopSide x={OFFICE.laptop.x} y={OFFICE.laptop.y} open={1} glow={laptopGlow} />
      {phone ? <PhoneFlat x={OFFICE.phone.x} y={OFFICE.phone.y} glow={phoneGlow} shake={phoneShake} scale={1.1} /> : null}
    </>
  );
};

// ---------- Подпись-ярлык мира ----------
export const WorldTag: React.FC<{ text: string; x: number; y: number; opacity: number; dark?: boolean }> = ({ text, x, y, opacity, dark }) => (
  <div
    style={box({
      left: x,
      top: y,
      padding: "12px 28px",
      borderRadius: 999,
      backgroundColor: dark ? NAVY : YELLOW,
      color: dark ? "#FFFFFF" : NAVY,
      fontFamily,
      fontSize: 42,
      fontWeight: 900,
      opacity,
      translate: `0 ${(1 - opacity) * 16}px`,
      boxShadow: "0 10px 24px rgba(20,40,90,0.18)",
      whiteSpace: "nowrap",
    })}
  >
    {text}
  </div>
);

// Звуковая волна-разделитель между мирами (горизонтальная линия по y).
export const WaveDivider: React.FC<{ y: number; f: number; amp: number; opacity?: number }> = ({ y, f, amp, opacity = 1 }) => {
  const pts: string[] = [];
  for (let x = -20; x <= 1100; x += 12) {
    const env = Math.sin((Math.PI * Math.max(0, Math.min(1080, x))) / 1080);
    const v = amp * env * Math.sin(x / 38 - f / 4) * (0.6 + 0.4 * Math.sin(x / 140 + f / 15));
    pts.push(`${x},${(y + v).toFixed(1)}`);
  }
  return (
    <svg width={1080} height={1920} style={box({ left: 0, top: 0, opacity })}>
      <polyline points={pts.join(" ")} fill="none" stroke="#FFFFFF" strokeWidth={22} strokeLinejoin="round" />
      <polyline points={pts.join(" ")} fill="none" stroke={YELLOW} strokeWidth={10} strokeLinejoin="round" />
    </svg>
  );
};
