// Квартира семьи в Бишкеке (одинаковые координаты во всех домашних
// сценах): слева гостиная — диван, книжная полка, торшер; в середине
// кухня-столовая — окно во двор, часы, стол; справа — дверь рабочей
// комнаты мамы (из-под неё и из щели виден свет лампы) и кухонный блок.
// Пол (низ стены) — y = 1500; сидящие за столом стоят ступнями на y = 1540,
// на диване — на y = 1650.
import { box } from "../shots";
import { Mountains, WallClock } from "./Clock";
import { PanelHouse, Tree } from "./Outdoor";

const TOP = 1240; // столешница

export const HOME = {
  floorY: 1500,
  seatY: 1540,
  sofaY: 1650,
  window: { x: 880, y: 420, w: 440, h: 560 },
  clock: { x: 1540, y: 560, r: 62 },
  table: { x: 880, top: TOP, w: 900, front: TOP + 28, bottom: 1560 },
  // места за столом (x центра сидящего)
  seat: { dad: 1060, son: 1330, mom: 1620 },
  // дверь рабочей комнаты
  door: { x: 1900, y: 600, w: 270, h: 900 },
  counter: { x: 2330, top: 1150, w: 560 },
  sofa: { x: -560, w: 900, seat: 1430 },
  shelf: { x: 430, y: 520, w: 260, h: 860 },
  // предметы на столе
  plates: { dad: 1080, son: 1330, mom: 1600 },
} as const;

// Высота сиденья стула (px от пола) для роста h. Ребёнку — подушка.
export const seatH = (h: number) => (h < 600 ? 0.36 : 0.27) * h;

type Light = { readonly evening?: number };

export const WALL = { day: "#F3ECE1", evening: "#EAD7BE" } as const;

// Задний план: стены, окно, часы, книжная полка, диван, дверь рабочей
// комнаты, кухонный блок, пол. doorOpen 0…1 — дверь открыта внутрь.
// workLight — свет лампы в рабочей комнате (щель под дверью).
export const HomeBack: React.FC<{ readonly minutes: number; readonly doorOpen?: number; readonly workLight?: number; readonly inDoor?: React.ReactNode } & Light> = ({
  minutes,
  doorOpen = 0,
  workLight = 1,
  inDoor,
  evening = 0,
}) => {
  const w = HOME.window;
  const d = HOME.door;
  const eve = evening > 0.5;
  const wall = eve ? WALL.evening : WALL.day;
  const s = HOME.shelf;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -1400, top: -900, width: 4800, height: HOME.floorY + 900, backgroundColor: wall })} />
      <div style={box({ left: -1400, top: 1180, width: 4800, height: HOME.floorY - 1180, backgroundColor: eve ? "#DCC3A2" : "#E9DCC8" })} />
      <div style={box({ left: -1400, top: 1176, width: 4800, height: 10, backgroundColor: eve ? "#C9A983" : "#D8C3A6" })} />
      {/* арка между гостиной и кухней */}
      <div style={box({ left: 760, top: 300, width: 46, height: HOME.floorY - 300, backgroundColor: eve ? "#E2CDB2" : "#EDE3D4", boxShadow: "inset -8px 0 0 rgba(0,0,0,0.04)" })} />
      {/* окно во двор */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 10,
          overflow: "hidden",
          background: eve ? "linear-gradient(180deg, #23305A, #4C4F7A 70%, #B9806A)" : "linear-gradient(180deg, #CFE4F4, #F4E8D6)",
          border: "16px solid #FBF7F0",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: -w.x, top: -w.y })}>
          {eve ? null : <Mountains x={w.x - 60} y={w.y + 90} w={w.w + 120} h={170} />}
          <PanelHouse x={w.x - 120} y={w.y + 560} w={340} floors={3} color={eve ? "#3A3F62" : "#E6D3C0"} seed={3} />
          <PanelHouse x={w.x + 250} y={w.y + 600} w={320} floors={3} color={eve ? "#353A5C" : "#DCCDBB"} seed={6} />
          <Tree x={w.x + 230} y={w.y + 640} s={0.7} kind="poplar" tone={eve ? 1 : 0} />
        </div>
        {eve ? [0, 1, 2, 3].map((i) => <div key={i} style={box({ left: 30 + (i % 2) * 190, top: 330 + Math.floor(i / 2) * 90, width: 40, height: 34, backgroundColor: "#F6D48A", opacity: 0.85 })} />) : null}
        <div style={box({ left: w.w / 2 - 22, top: 0, width: 12, height: w.h, backgroundColor: "#FBF7F0" })} />
        <div style={box({ left: 0, top: w.h * 0.42, width: w.w, height: 12, backgroundColor: "#FBF7F0" })} />
      </div>
      <div style={box({ left: w.x - 30, top: w.y + w.h - 6, width: w.w + 60, height: 26, borderRadius: 6, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: w.x + 40, top: w.y + w.h - 70, width: 60, height: 64, borderRadius: "8px 8px 18px 18px", backgroundColor: "#C9644F" })} />
      <div style={box({ left: w.x + 30, top: w.y + w.h - 140, width: 80, height: 80, borderRadius: 40, backgroundColor: "#7FAF63" })} />
      {/* светлые шторы */}
      <div style={box({ left: w.x - 80, top: w.y - 40, width: 96, height: w.h + 90, borderRadius: "0 0 30px 30px", backgroundColor: eve ? "#C9B49A" : "#E4D6C2" })} />
      <div style={box({ left: w.x + w.w - 16, top: w.y - 40, width: 96, height: w.h + 90, borderRadius: "0 0 30px 30px", backgroundColor: eve ? "#C9B49A" : "#E4D6C2" })} />
      <div style={box({ left: w.x - 100, top: w.y - 54, width: w.w + 200, height: 14, borderRadius: 7, backgroundColor: "#8C6A4E" })} />
      {/* часы — время дня */}
      <WallClock x={HOME.clock.x} y={HOME.clock.y} r={HOME.clock.r} minutes={minutes} />
      {/* семейные фото (простые рамки) */}
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: 1360 + i * 110, top: 740 + i * 30, width: 90, height: 110, borderRadius: 6, backgroundColor: "#FFFFFF", border: "8px solid #B58D69", boxSizing: "border-box" })}>
          <div style={box({ left: 12, top: 18, width: 50, height: 60, borderRadius: "25px 25px 6px 6px", backgroundColor: i ? "#9DB7CF" : "#E2C5A3" })} />
        </div>
      ))}
      {/* гостиная: книжная полка */}
      <div style={box({ left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: 8, backgroundColor: "#B98E68" })} />
      {[0, 1, 2, 3].map((r) => (
        <div key={r} style={box({ left: s.x + 14, top: s.y + 16 + r * 210, width: s.w - 28, height: 186, backgroundColor: "#8E6A4C" })}>
          {Array.from({ length: 6 + (r % 2) }).map((_, i) => (
            <div
              key={i}
              style={box({
                left: 8 + i * 32,
                bottom: 0,
                width: 26,
                height: 120 + ((i * 37 + r * 13) % 50),
                borderRadius: 3,
                backgroundColor: ["#3E6FA6", "#D86A4A", "#F2C14E", "#5E9A73", "#7A5DA8", "#E7E1D6", "#2F4A7A"][(i + r * 2) % 7],
              })}
            />
          ))}
        </div>
      ))}
      {/* торшер */}
      <div style={box({ left: -720, top: 640, width: 8, height: 860, backgroundColor: "#5B4636" })} />
      <div style={box({ left: -800, top: 560, width: 170, height: 120, borderRadius: "40px 40px 10px 10px", backgroundColor: eve ? "#F6D48A" : "#EADBBF" })} />
      {/* картина над диваном */}
      <div style={box({ left: -330, top: 560, width: 420, height: 280, borderRadius: 8, backgroundColor: "#FFFFFF", border: "12px solid #B58D69", boxSizing: "border-box", overflow: "hidden" })}>
        <Mountains x={-20} y={60} w={440} h={200} />
      </div>
      {/* диван */}
      <Sofa evening={evening} />
      {/* дверь рабочей комнаты: проём (свет внутри), лист открывается внутрь */}
      <div style={box({ left: d.x - 20, top: d.y - 20, width: d.w + 40, height: d.h + 20, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: eve ? "#F4E3B8" : "#EEF1F4", overflow: "hidden" })}>
        {/* в проёме: часть рабочей комнаты — стол с лампой */}
        <div style={box({ left: 30, top: 520, width: 260, height: 26, backgroundColor: "#B58D69" })} />
        <div style={box({ left: 160, top: 400, width: 10, height: 120, backgroundColor: "#3A3E48" })} />
        <div style={box({ left: 120, top: 380, width: 90, height: 40, borderRadius: "40px 40px 6px 6px", backgroundColor: "#FFD43B" })} />
        {eve ? <div style={box({ inset: 0, background: `radial-gradient(circle at 170px 430px, rgba(255,226,150,${0.6 * workLight}), transparent 300px)` })} /> : null}
        {inDoor ? <div style={box({ left: -d.x, top: -d.y, width: 2200, height: 2600 })}>{inDoor}</div> : null}
      </div>
      <div
        style={box({
          left: d.x,
          top: d.y,
          width: d.w * (1 - 0.86 * doorOpen),
          height: d.h,
          backgroundColor: "#FDFBF7",
          boxShadow: "inset -8px 0 0 rgba(0,0,0,0.06)",
          border: "4px solid #E6DED2",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: 30, top: 60, right: 30, height: 330, borderRadius: 8, border: "5px solid rgba(0,0,0,0.07)", boxSizing: "border-box", opacity: 1 - doorOpen })} />
        <div style={box({ left: 30, top: 440, right: 30, height: 400, borderRadius: 8, border: "5px solid rgba(0,0,0,0.07)", boxSizing: "border-box", opacity: 1 - doorOpen })} />
        <div style={box({ right: 20, top: 470, width: 44, height: 13, borderRadius: 7, backgroundColor: "#B9A774", opacity: 1 - doorOpen })} />
      </div>
      {/* свет из-под двери вечером */}
      {eve && doorOpen < 0.05 ? <div style={box({ left: d.x + 10, top: d.y + d.h - 8, width: d.w - 20, height: 10, borderRadius: 5, backgroundColor: `rgba(255,214,120,${0.9 * workLight})`, boxShadow: `0 0 26px rgba(255,214,120,${0.8 * workLight})` })} /> : null}
      {eve ? <div style={box({ left: d.x - 140, top: d.y + d.h, width: d.w + 280, height: 120, background: `radial-gradient(ellipse at 50% 0%, rgba(255,214,120,${0.35 * workLight * (0.4 + doorOpen)}), transparent 70%)` })} /> : null}
      {/* кухонный блок справа */}
      <div style={box({ left: HOME.counter.x, top: 420, width: HOME.counter.w, height: 300, borderRadius: 10, backgroundColor: "#F7F2EA", border: "6px solid #E2D6C4", boxSizing: "border-box" })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: HOME.counter.x + 20 + i * 270, top: 440, width: 250, height: 260, borderRadius: 8, backgroundColor: "#EFE7DA" })} />
      ))}
      <div style={box({ left: HOME.counter.x, top: HOME.counter.top, width: HOME.counter.w, height: 30, borderRadius: 6, backgroundColor: "#CDB79A" })} />
      <div style={box({ left: HOME.counter.x + 10, top: HOME.counter.top + 30, width: HOME.counter.w - 20, height: HOME.floorY - HOME.counter.top - 20, backgroundColor: "#F2EADF" })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: HOME.counter.x + 30 + i * 260, top: HOME.counter.top + 60, width: 240, height: 260, borderRadius: 8, backgroundColor: "#EAE0D2" })} />
      ))}
      <div style={box({ left: HOME.counter.x + 300, top: HOME.counter.top - 16, width: 230, height: 20, borderRadius: 4, backgroundColor: "#3A3E48" })} />
      <div style={box({ left: HOME.counter.x + 60, top: HOME.counter.top - 70, width: 120, height: 66, borderRadius: "10px 10px 20px 20px", backgroundColor: "#C7CCD5" })} />
      {/* пол */}
      <div style={box({ left: -1400, top: HOME.floorY, width: 4800, height: 1100, background: eve ? "linear-gradient(180deg, #A47B5A, #8F6748)" : "linear-gradient(180deg, #C9A47F, #B8916B)" })} />
      <div style={box({ left: -1400, top: HOME.floorY, width: 4800, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.10) 0 2px, transparent 2px 170px)" })} />
      {/* ковёр в гостиной */}
    </div>
  );
};

// Диван (вид спереди): спинка, подушки, подлокотники. Сидящие — на sofa.seat.
export const Sofa: React.FC<Light> = ({ evening = 0 }) => {
  const s = HOME.sofa;
  const c = evening > 0.5 ? "#5E7FA6" : "#6E8FB6";
  const dk = evening > 0.5 ? "#4C6A8F" : "#5B7BA2";
  return (
    <div style={box({ left: s.x, top: 1060, width: s.w, height: 560 })}>
      <div style={box({ left: 60, top: 0, width: s.w - 120, height: 330, borderRadius: "40px 40px 10px 10px", backgroundColor: dk })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: 90 + i * ((s.w - 180) / 2), top: 40, width: (s.w - 200) / 2, height: 300, borderRadius: 30, backgroundColor: c })} />
      ))}
      <div style={box({ left: 0, top: 170, width: 110, height: 330, borderRadius: 40, backgroundColor: dk })} />
      <div style={box({ left: s.w - 110, top: 170, width: 110, height: 330, borderRadius: 40, backgroundColor: dk })} />
      <div style={box({ left: 30, top: 470, width: 30, height: 70, backgroundColor: "#5B4636" })} />
      <div style={box({ left: s.w - 60, top: 470, width: 30, height: 70, backgroundColor: "#5B4636" })} />
      {/* жёлтая подушка */}
      <div style={box({ left: s.w - 230, top: 150, width: 120, height: 120, borderRadius: 26, backgroundColor: "#FFD43B", rotate: "12deg" })} />
    </div>
  );
};

// Сиденье дивана — рисуется поверх ног сидящих (передний край).
export const SofaFront: React.FC<Light> = ({ evening = 0 }) => {
  const s = HOME.sofa;
  const c = evening > 0.5 ? "#5E7FA6" : "#6E8FB6";
  return (
    <div style={box({ left: s.x + 90, top: HOME.sofa.seat + 10, width: s.w - 180, height: 90, borderRadius: "16px 16px 22px 22px", backgroundColor: c, boxShadow: "inset 0 -14px 0 rgba(0,0,0,0.1)" })} />
  );
};

// Спинка стула за сидящим.
export const ChairBack: React.FC<{ x: number; h?: number; evening?: number; y?: number }> = ({ x, h = 760, evening = 0, y = HOME.seatY }) => {
  const s = h / 760;
  const c = evening > 0.5 ? "#7A5A44" : "#9A7353";
  return (
    <div style={box({ left: x - 95 * s, top: y - 520 * s, width: 190 * s, height: 520 * s })}>
      <div style={box({ left: 10 * s, top: 0, width: 170 * s, height: 40 * s, borderRadius: 14 * s, backgroundColor: c })} />
      <div style={box({ left: 18 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 150 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 30 * s, top: 110 * s, width: 130 * s, height: 22 * s, backgroundColor: c })} />
    </div>
  );
};

// Стол: столешница (поверх тел сидящих) и скатерть до пола.
export const TableFront: React.FC<Light> = ({ evening = 0 }) => {
  const t = HOME.table;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: t.x - 10, top: t.top - 4, width: t.w + 20, height: t.front - t.top + 8, borderRadius: 10, backgroundColor: evening > 0.5 ? "#EADFCB" : "#F7F1E6" })} />
      <div style={box({ left: t.x - 10, top: t.front, width: t.w + 20, height: t.bottom - t.front - 40, backgroundColor: evening > 0.5 ? "#DCCDB3" : "#ECE2D1", borderRadius: "0 0 14px 14px" })} />
      <div style={box({ left: t.x - 10, top: t.bottom - 110, width: t.w + 20, height: 10, backgroundColor: "#C9B79A", opacity: 0.7 })} />
      <div style={box({ left: t.x + 40, top: t.bottom - 40, width: 26, height: 40, backgroundColor: "#7A5A44" })} />
      <div style={box({ left: t.x + t.w - 66, top: t.bottom - 40, width: 26, height: 40, backgroundColor: "#7A5A44" })} />
    </div>
  );
};

// Тарелка (вид чуть сверху). food 0…1 — сколько еды; steam — пар от тёплой.
export const Plate: React.FC<{ x: number; y: number; food?: number; steam?: number; f?: number; s?: number }> = ({ x, y, food = 1, steam = 0, f = 0, s = 1 }) => (
  <div style={box({ left: x - 90 * s, top: y - 30 * s, width: 180 * s, height: 60 * s })}>
    <svg width={180 * s} height={60 * s} viewBox="-90 -30 180 60" style={{ overflow: "visible" }}>
      <ellipse cx={0} cy={6} rx={80} ry={22} fill="#D5DCE6" />
      <ellipse cx={0} cy={0} rx={80} ry={22} fill="#FFFFFF" />
      <ellipse cx={0} cy={0} rx={54} ry={14} fill="#F1F3F6" />
      {food > 0.02 ? (
        <>
          <ellipse cx={-12} cy={-2} rx={32 * food} ry={9 * Math.min(1, food * 1.2)} fill="#E7C27A" />
          <ellipse cx={24} cy={0} rx={17 * food} ry={7 * Math.min(1, food * 1.2)} fill="#C9643E" />
          <ellipse cx={4} cy={-6} rx={9 * food} ry={4 * food} fill="#7FAF63" />
        </>
      ) : null}
      {steam > 0.01
        ? [0, 1, 2].map((i) => {
            const k = (((f / 46 + i / 3) % 1) + 1) % 1;
            return <ellipse key={i} cx={-20 + i * 20 + Math.sin(f / 11 + i) * 6} cy={-20 - k * 70} rx={10} ry={16} fill="#FFFFFF" opacity={steam * 0.45 * (1 - k)} />;
          })
        : null}
    </svg>
  </div>
);

// Пиала.
export const Piala: React.FC<{ x: number; y: number; s?: number; tea?: boolean }> = ({ x, y, s = 1, tea = true }) => (
  <svg width={70 * s} height={44 * s} viewBox="0 0 70 44" style={box({ left: x - 35 * s, top: y - 40 * s })}>
    <path d="M 4 8 Q 35 54 66 8 Z" fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
    {tea ? <ellipse cx={35} cy={9} rx={29} ry={5} fill="#B5651D" /> : null}
    <path d="M 12 18 Q 35 30 58 18" stroke="#2F62A8" strokeWidth={4} fill="none" />
  </svg>
);

// Тёплый вечерний свет: лампа над столом.
export const WarmLamp: React.FC<{ on?: number; x?: number }> = ({ on = 1, x = 1330 }) => (
  <>
    <div style={box({ left: x - 4, top: -900, width: 8, height: 1460, backgroundColor: "#5B4636" })} />
    <div style={box({ left: x - 120, top: 540, width: 240, height: 110, borderRadius: "120px 120px 16px 16px", backgroundColor: "#F2C27A" })} />
    <div style={box({ left: -1400, top: 0, width: 4800, height: 2600, background: `radial-gradient(circle at ${x}px 700px, rgba(255,205,130,${0.34 * on}), transparent 950px)`, pointerEvents: "none" })} />
  </>
);
