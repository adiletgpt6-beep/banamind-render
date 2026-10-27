// Квартира семьи: кухня-столовая обычной бишкекской квартиры. Слева —
// входная дверь и полка для обуви с рюкзаками, окно во двор (панельные
// дома с балконами, тополя, днём — горы вдали), часы на стене (время дня),
// стол со скатертью, справа — кухня: плита с кастрюлей, шкафчики, пиалы.
// Пол (низ стены) — y = 1500; сидящие за столом стоят ступнями на y = 1540.
// Мир — px; одинаковые координаты во всех домашних сценах (предметы не
// «прыгают» между планами).
import { box } from "../shots";
import { Mountains, Ornament, WallClock } from "./Apartment";
import { PanelHouse, Tree } from "./Outdoor";

const TOP = 1240; // столешница

export const HOME = {
  floorY: 1500,
  seatY: 1540, // ступни сидящих за столом
  door: { x: 70, y: 570, w: 270, h: 930 },
  window: { x: 470, y: 400, w: 520, h: 600 },
  clock: { x: 1180, y: 520, r: 64 },
  table: { x: 540, top: TOP, w: 880, front: TOP + 28, bottom: 1560 },
  counter: { x: 1520, top: 1150, w: 520 },
  stove: { x: 1640, y: 1150 },
  bench: { x: 360, y: 1500 }, // полка для обуви у двери
  // места за столом (x центра сидящего)
  // сын — на торце стола (виден целиком; мама может присесть рядом)
  seat: { son: 470, mom: 1010, dad: 1230, daughter: 1330 },
  // предметы на столе (точка опоры на столешнице)
  laptop: { x: 1125, y: TOP + 16 },
  phone: { x: 1255, y: TOP + 20 },
  piala: { x: 905, y: TOP + 14 },
  bag: { x: 1372, y: TOP + 18 },
  plate: { x: 610, y: TOP + 20 },
  plan: { x: 905, y: TOP + 20 },
} as const;

// Высота сиденья стула (px от пола) для роста h.
// Ребёнку (рост < 600) — подушка на стуле: сиденье выше.
export const seatH = (h: number) => (h < 600 ? 0.36 : 0.27) * h;

type Light = { readonly evening?: number };

// Стена, окно, дверь, часы, кухня (задний план).
export const HomeBack: React.FC<{ readonly minutes: number; readonly doorOpen?: number; readonly stoveOn?: number; readonly steam?: number; readonly f?: number } & Light> = ({
  minutes,
  doorOpen = 0,
  stoveOn = 0,
  steam = 0,
  f = 0,
  evening = 0,
}) => {
  const w = HOME.window;
  const d = HOME.door;
  const wall = evening > 0.5 ? "#E3CBAE" : "#EFE3D0";
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: -300, top: 0, width: 2800, height: HOME.floorY, backgroundColor: wall })} />
      <div style={box({ left: -300, top: 1180, width: 2800, height: HOME.floorY - 1180, backgroundColor: evening > 0.5 ? "#D6B995" : "#E6D5BE" })} />
      <div style={box({ left: -300, top: 1176, width: 2800, height: 10, backgroundColor: evening > 0.5 ? "#C9A983" : "#D8C3A6" })} />
      {/* окно во двор */}
      <div
        style={box({
          left: w.x,
          top: w.y,
          width: w.w,
          height: w.h,
          borderRadius: 10,
          overflow: "hidden",
          background: evening > 0.5 ? "linear-gradient(180deg, #23305A, #4C4F7A 70%, #B9806A)" : "linear-gradient(180deg, #CFE4F4, #F4E8D6)",
          border: "16px solid #FBF7F0",
          boxSizing: "border-box",
        })}
      >
        <div style={box({ left: -w.x, top: -w.y })}>
          {evening > 0.5 ? null : <Mountains x={w.x - 60} y={w.y + 90} w={w.w + 120} h={170} />}
          <PanelHouse x={w.x - 120} y={w.y + 560} w={380} floors={3} color={evening > 0.5 ? "#3A3F62" : "#E6D3C0"} seed={3} />
          <PanelHouse x={w.x + 300} y={w.y + 600} w={360} floors={3} color={evening > 0.5 ? "#353A5C" : "#DCCDBB"} seed={6} />
          <Tree x={w.x + 270} y={w.y + 640} s={0.75} kind="poplar" tone={evening > 0.5 ? 1 : 0} />
        </div>
        {evening > 0.5
          ? [0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={box({ left: 30 + (i % 3) * 150, top: 330 + Math.floor(i / 3) * 90, width: 40, height: 34, backgroundColor: "#F6D48A", opacity: 0.85 })} />)
          : null}
        <div style={box({ left: w.w / 2 - 22, top: 0, width: 12, height: w.h, backgroundColor: "#FBF7F0" })} />
        <div style={box({ left: 0, top: w.h * 0.42, width: w.w, height: 12, backgroundColor: "#FBF7F0" })} />
      </div>
      {/* подоконник, цветок, занавески */}
      <div style={box({ left: w.x - 30, top: w.y + w.h - 6, width: w.w + 60, height: 26, borderRadius: 6, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: w.x + 40, top: w.y + w.h - 70, width: 60, height: 64, borderRadius: "8px 8px 18px 18px", backgroundColor: "#C9644F" })} />
      <div style={box({ left: w.x + 30, top: w.y + w.h - 140, width: 80, height: 80, borderRadius: 40, backgroundColor: "#7FAF63" })} />
      <div style={box({ left: w.x - 90, top: w.y - 40, width: 110, height: w.h + 90, borderRadius: "0 0 34px 34px", backgroundColor: evening > 0.5 ? "#B86F52" : "#D98E6A" })} />
      <div style={box({ left: w.x + w.w - 20, top: w.y - 40, width: 110, height: w.h + 90, borderRadius: "0 0 34px 34px", backgroundColor: evening > 0.5 ? "#B86F52" : "#D98E6A" })} />
      <div style={box({ left: w.x - 110, top: w.y - 54, width: w.w + 220, height: 16, borderRadius: 8, backgroundColor: "#8C6A4E" })} />
      {/* часы — время дня */}
      <WallClock x={HOME.clock.x} y={HOME.clock.y} r={HOME.clock.r} minutes={minutes} />
      {/* тушкийиз над столом (вышитое панно) */}
      <div style={box({ left: 1300, top: 410, width: 170, height: 230, borderRadius: 12, backgroundColor: "#7E2B2F", border: "8px solid #C9A043", boxSizing: "border-box" })}>
        <svg width={154} height={214} viewBox="0 0 154 214" style={box({ left: 0, top: 0 })}>
          <Ornament x={77} y={107} s={0.9} color="#F1D58C" />
        </svg>
      </div>
      {/* входная дверь (открывается внутрь кадра) */}
      <div style={box({ left: d.x - 18, top: d.y - 18, width: d.w + 36, height: d.h + 18, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w, height: d.h, backgroundColor: "#6D5546" })} />
      <div style={box({ left: d.x, top: d.y, width: d.w * (1 - 0.82 * doorOpen), height: d.h, backgroundColor: "#8C6A52", boxShadow: "inset -10px 0 0 rgba(0,0,0,0.08)" })}>
        <div style={box({ left: 30, top: 60, width: d.w - 60, height: 320, borderRadius: 10, border: "6px solid rgba(0,0,0,0.1)", boxSizing: "border-box", opacity: 1 - doorOpen })} />
        <div style={box({ left: 30, top: 440, width: d.w - 60, height: 400, borderRadius: 10, border: "6px solid rgba(0,0,0,0.1)", boxSizing: "border-box", opacity: 1 - doorOpen })} />
        <div style={box({ right: 22, top: 470, width: 46, height: 14, borderRadius: 7, backgroundColor: "#D9C27A", opacity: 1 - doorOpen })} />
      </div>
      {/* вешалка: мамина сумка висит, пока её не взяли */}
      <div style={box({ left: d.x + d.w + 60, top: 640, width: 150, height: 16, borderRadius: 8, backgroundColor: "#8C6A4E" })} />
      {/* кухня справа: шкафчики, вытяжка, плита, столешница */}
      <div style={box({ left: HOME.counter.x, top: 420, width: HOME.counter.w, height: 300, borderRadius: 10, backgroundColor: "#F7F2EA", border: "6px solid #E2D6C4", boxSizing: "border-box" })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: HOME.counter.x + 20 + i * 250, top: 440, width: 230, height: 260, borderRadius: 8, backgroundColor: "#EFE7DA" })} />
      ))}
      {/* полка с пиалами */}
      <div style={box({ left: HOME.counter.x + 40, top: 790, width: 440, height: 14, borderRadius: 6, backgroundColor: "#B88F68" })} />
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} width={70} height={44} viewBox="0 0 70 44" style={box({ left: HOME.counter.x + 70 + i * 100, top: 748 })}>
          <path d="M 4 6 Q 35 52 66 6 Z" fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
          <path d="M 12 14 Q 35 26 58 14" stroke="#2F62A8" strokeWidth={4} fill="none" />
        </svg>
      ))}
      <div style={box({ left: HOME.stove.x - 30, top: 870, width: 260, height: 70, borderRadius: "20px 20px 4px 4px", backgroundColor: "#D6DAE0" })} />
      {/* столешница и шкафы */}
      <div style={box({ left: HOME.counter.x, top: HOME.counter.top, width: HOME.counter.w, height: 30, borderRadius: 6, backgroundColor: "#CDB79A" })} />
      <div style={box({ left: HOME.counter.x + 10, top: HOME.counter.top + 30, width: HOME.counter.w - 20, height: HOME.floorY - HOME.counter.top - 20, backgroundColor: "#F2EADF" })} />
      {[0, 1].map((i) => (
        <div key={i} style={box({ left: HOME.counter.x + 30 + i * 245, top: HOME.counter.top + 60, width: 220, height: 260, borderRadius: 8, backgroundColor: "#EAE0D2" })} />
      ))}
      {/* плита: конфорки, кастрюля, огонь */}
      <div style={box({ left: HOME.stove.x - 40, top: HOME.stove.y - 16, width: 280, height: 20, borderRadius: 4, backgroundColor: "#3A3E48" })} />
      <div style={box({ left: HOME.stove.x - 20 + 8, top: HOME.stove.y - 30, width: 100, height: 14, borderRadius: 7, backgroundColor: "#2C2F37" })} />
      {stoveOn > 0.01
        ? [0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={box({ left: HOME.stove.x + 120 + i * 18, top: HOME.stove.y - 30 - 8 * stoveOn, width: 12, height: 14 + 6 * stoveOn * Math.abs(Math.sin(f / 4 + i)), borderRadius: "50% 50% 40% 40%", backgroundColor: "#4F8FE8", opacity: 0.8 * stoveOn })} />
          ))
        : null}
      {/* кастрюля */}
      <div style={box({ left: HOME.stove.x + 92, top: HOME.stove.y - 120, width: 150, height: 92, borderRadius: "10px 10px 24px 24px", backgroundColor: "#C7CCD5" })} />
      <div style={box({ left: HOME.stove.x + 82, top: HOME.stove.y - 130, width: 170, height: 18, borderRadius: 9, backgroundColor: "#AEB4BE" })} />
      <div style={box({ left: HOME.stove.x + 152, top: HOME.stove.y - 146, width: 30, height: 16, borderRadius: 8, backgroundColor: "#2C2F37" })} />
      {steam > 0.01
        ? [0, 1, 2].map((i) => {
            const k = ((f / 40 + i / 3) % 1 + 1) % 1;
            return <div key={i} style={box({ left: HOME.stove.x + 130 + i * 26 + Math.sin(f / 9 + i) * 10, top: HOME.stove.y - 170 - k * 160, width: 36, height: 50, borderRadius: 25, backgroundColor: "#FFFFFF", opacity: steam * 0.5 * (1 - k) })} />;
          })
        : null}
      {/* пол */}
      <div style={box({ left: -300, top: HOME.floorY, width: 2800, height: 1100, background: evening > 0.5 ? "linear-gradient(180deg, #9F7656, #8C6446)" : "linear-gradient(180deg, #C29B76, #B38A64)" })} />
      <div style={box({ left: -300, top: HOME.floorY, width: 2800, height: 1100, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.10) 0 2px, transparent 2px 170px)" })} />
      {/* ковёр под столом */}
      <div style={box({ left: 480, top: 1560, width: 1000, height: 300, borderRadius: 18, backgroundColor: "#9E3B36", border: "14px solid #E1C38A", boxSizing: "border-box" })} />
    </div>
  );
};

// Полка для обуви у двери и рюкзаки на ней (если лежат).
export const ShoeBench: React.FC<{ readonly sonPack?: boolean; readonly girlPack?: boolean; readonly bag?: boolean }> = ({ sonPack, girlPack, bag }) => {
  const b = HOME.bench;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      {bag ? (
        <svg width={150} height={190} viewBox="0 0 150 190" style={box({ left: HOME.door.x + HOME.door.w + 60, top: 640 })}>
          <path d="M 30 70 Q 75 -20 120 70" stroke="#5E3F31" strokeWidth={7} fill="none" />
          <rect x={10} y={66} width={130} height={110} rx={20} fill="#8A5A44" />
          <rect x={10} y={66} width={130} height={24} rx={10} fill="#7A4E3B" />
        </svg>
      ) : null}
      <div style={box({ left: b.x, top: b.y - 150, width: 300, height: 22, borderRadius: 6, backgroundColor: "#A47D5B" })} />
      <div style={box({ left: b.x + 10, top: b.y - 128, width: 280, height: 128, backgroundColor: "#8C6A4E" })} />
      <div style={box({ left: b.x + 30, top: b.y - 70, width: 70, height: 26, borderRadius: 10, backgroundColor: "#2A2A30" })} />
      <div style={box({ left: b.x + 180, top: b.y - 66, width: 80, height: 24, borderRadius: 10, backgroundColor: "#5A3F33" })} />
      {sonPack ? <PackOnBench x={b.x + 80} color="#3E9C6B" /> : null}
      {girlPack ? <PackOnBench x={b.x + 210} color="#E5677A" /> : null}
    </div>
  );
};

const PackOnBench: React.FC<{ x: number; color: string }> = ({ x, color }) => (
  <svg width={150} height={190} viewBox="0 0 150 190" style={box({ left: x - 75, top: HOME.bench.y - 150 - 186 })}>
    <path d="M 55 24 Q 75 2 95 24" stroke="#14285A" strokeWidth={8} fill="none" />
    <rect x={14} y={20} width={122} height={166} rx={36} fill={color} />
    <rect x={34} y={104} width={82} height={58} rx={16} fill="rgba(0,0,0,0.14)" />
  </svg>
);

// Мамина сумка на столе (с краю).
export const BagOnTable: React.FC<{ x: number; y: number; open?: number }> = ({ x, y, open = 0 }) => (
  <svg width={160} height={150} viewBox="0 0 160 150" style={box({ left: x - 80, top: y - 140 })}>
    <path d="M 40 60 Q 80 -10 120 60" stroke="#5E3F31" strokeWidth={7} fill="none" />
    <rect x={14} y={54} width={132} height={86} rx={18} fill="#8A5A44" />
    <rect x={14} y={54} width={132} height={20} rx={9} fill={open > 0.5 ? "#4A2F24" : "#7A4E3B"} />
  </svg>
);

// Спинка стула за сидящим (рисуется до персонажа).
export const ChairBack: React.FC<{ x: number; h?: number; evening?: number }> = ({ x, h = 760, evening = 0 }) => {
  const s = h / 760;
  const c = evening > 0.5 ? "#7A5A44" : "#9A7353";
  return (
    <div style={box({ left: x - 95 * s, top: HOME.seatY - 520 * s, width: 190 * s, height: 520 * s })}>
      <div style={box({ left: 10 * s, top: 0, width: 170 * s, height: 40 * s, borderRadius: 14 * s, backgroundColor: c })} />
      <div style={box({ left: 18 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 150 * s, top: 30 * s, width: 22 * s, height: 490 * s, backgroundColor: c })} />
      <div style={box({ left: 30 * s, top: 110 * s, width: 130 * s, height: 22 * s, backgroundColor: c })} />
    </div>
  );
};

// Стол: столешница (поверх тел сидящих) и скатерть до пола. Предметы
// рисуются отдельно (TableItems) поверх столешницы.
export const TableFront: React.FC<{ evening?: number }> = ({ evening = 0 }) => {
  const t = HOME.table;
  return (
    <div style={box({ left: 0, top: 0, width: 2200, height: 2600 })}>
      <div style={box({ left: t.x - 10, top: t.top - 4, width: t.w + 20, height: t.front - t.top + 8, borderRadius: 10, backgroundColor: evening > 0.5 ? "#E9DCC7" : "#F6EEE1" })} />
      <div style={box({ left: t.x - 10, top: t.front, width: t.w + 20, height: t.bottom - t.front - 40, backgroundColor: evening > 0.5 ? "#D8C6AA" : "#EADDC8", borderRadius: "0 0 14px 14px" })} />
      {/* узор по краю скатерти */}
      <div style={box({ left: t.x - 10, top: t.bottom - 120, width: t.w + 20, height: 30, backgroundImage: "repeating-linear-gradient(90deg, #C24E3E 0 18px, transparent 18px 36px)", opacity: 0.55 })} />
      <div style={box({ left: t.x + 40, top: t.bottom - 40, width: 26, height: 40, backgroundColor: "#7A5A44" })} />
      <div style={box({ left: t.x + t.w - 66, top: t.bottom - 40, width: 26, height: 40, backgroundColor: "#7A5A44" })} />
    </div>
  );
};

// Ноутбук на столе в ракурсе три четверти: экраном к маме (влево) и к
// зрителю. Видны верх основания с клавиатурой и тачпадом и экран на
// шарнире (задний край основания). open 0…1 — крышка поворачивается вокруг
// шарнира: 0 — лежит на клавиатуре, 1 — открыта. Геометрия — laptopGeom
// (её же используют сцены для рук: клавиши, край крышки).
export const laptopGeom = (x: number, y: number) => {
  const A = { x: x - 96, y }; // передний левый угол основания
  const B = { x: x + 74, y }; // передний правый
  const C = { x: x + 104, y: y - 34 }; // задний правый (шарнир)
  const D = { x: x - 66, y: y - 34 }; // задний левый (шарнир)
  // точка на верхней плоскости основания: u — вдоль (0 слева … 1 справа),
  // v — в глубину (0 у переднего края … 1 у шарнира)
  const at = (u: number, v: number) => ({ x: A.x + (B.x - A.x) * u + (D.x - A.x) * v, y: A.y + (D.y - A.y) * v });
  // свободный край крышки (середина) при открытии open
  const lidVec = (open: number) => {
    const a = (open * 104 * Math.PI) / 180; // от «лежит» до чуть откинута назад
    const front = { x: A.x - D.x, y: A.y - D.y }; // крышка закрыта: к переднему краю
    const len = Math.hypot(front.x, front.y);
    const up = { x: 10, y: -150 }; // открыта: вверх, чуть назад
    const k = Math.sin(Math.min(a, Math.PI / 2));
    const back = a > Math.PI / 2 ? Math.sin(a - Math.PI / 2) : 0;
    return {
      x: front.x * Math.cos(Math.min(a, Math.PI / 2)) + up.x * k + 18 * back,
      y: (front.y / len) * len * Math.cos(Math.min(a, Math.PI / 2)) + up.y * k - 6 * back,
    };
  };
  const lidEdge = (open: number) => {
    const v = lidVec(open);
    return { x: (C.x + D.x) / 2 + v.x, y: (C.y + D.y) / 2 + v.y };
  };
  return { A, B, C, D, at, lidVec, lidEdge };
};

export const LaptopSide: React.FC<{ x: number; y: number; open: number; glow?: number }> = ({ x, y, open, glow = 1 }) => {
  const g = laptopGeom(x, y);
  const { A, B, C, D } = g;
  const v = g.lidVec(open);
  const P = (p: { x: number; y: number }) => `${p.x} ${p.y}`;
  const lid = [D, C, { x: C.x + v.x, y: C.y + v.y }, { x: D.x + v.x, y: D.y + v.y }];
  // экран виден, когда крышка поднята выше ≈ 60°
  const screenOn = open > 0.45;
  const inset = (u: number, w: number) => ({
    x: lid[0].x + (lid[1].x - lid[0].x) * u + (lid[3].x - lid[0].x) * w,
    y: lid[0].y + (lid[1].y - lid[0].y) * u + (lid[3].y - lid[0].y) * w,
  });
  const keysEl: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 11; c++) {
      const u0 = 0.08 + c * 0.077;
      const v0 = 0.5 + r * 0.115;
      const q = [g.at(u0, v0), g.at(u0 + 0.06, v0), g.at(u0 + 0.06, v0 + 0.085), g.at(u0, v0 + 0.085)];
      keysEl.push(<path key={`${r}-${c}`} d={`M ${q.map(P).join(" L ")} Z`} fill="#3A4152" />);
    }
  }
  const pad = [g.at(0.36, 0.08), g.at(0.62, 0.08), g.at(0.62, 0.38), g.at(0.36, 0.38)];
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* корпус: толщина переднего края и верх основания */}
      <path d={`M ${P(A)} L ${P(B)} L ${B.x} ${B.y + 9} L ${A.x} ${A.y + 9} Z`} fill="#8E97A8" />
      <path d={`M ${P(B)} L ${P(C)} L ${C.x} ${C.y + 9} L ${B.x} ${B.y + 9} Z`} fill="#7E8798" />
      <path d={`M ${P(A)} L ${P(B)} L ${P(C)} L ${P(D)} Z`} fill="#B9C0CC" />
      {open > 0.15 ? (
        <g opacity={Math.min(1, (open - 0.15) / 0.2)}>
          {keysEl}
          <path d={`M ${pad.map(P).join(" L ")} Z`} fill="#A4ACBA" />
        </g>
      ) : null}
      {/* крышка на шарнире: снаружи — серая, внутри — экран */}
      <path d={`M ${lid.map(P).join(" L ")} Z`} fill={screenOn ? "#2A2F3A" : "#9AA3B2"} />
      {screenOn ? (
        <g>
          <path d={`M ${[inset(0.05, 0.06), inset(0.95, 0.06), inset(0.95, 0.94), inset(0.05, 0.94)].map(P).join(" L ")} Z`} fill={glow > 0 ? "#EEF3FA" : "#3A4152"} />
          {glow > 0
            ? [0, 1, 2, 3].map((k) => {
                const l = [inset(0.14, 0.78 - k * 0.15), inset(k === 3 ? 0.55 : 0.86, 0.78 - k * 0.15)];
                return <path key={k} d={`M ${P(l[0])} L ${P(l[1])}`} stroke={k === 0 ? "#2F62A8" : "#9AA6BC"} strokeWidth={k === 0 ? 6 : 4} strokeLinecap="round" />;
              })
            : null}
        </g>
      ) : null}
      {open > 0.6 && glow > 0 ? <path d={`M ${P(inset(0.1, 0.9))} L ${A.x - 70} ${A.y - 40} L ${P(inset(0.1, 0.1))} Z`} fill={`rgba(180,215,255,${0.12 * glow * open})`} /> : null}
    </svg>
  );
};

// Пиала с чаем.
export const Piala: React.FC<{ x: number; y: number; s?: number; tea?: boolean }> = ({ x, y, s = 1, tea = true }) => (
  <svg width={70 * s} height={44 * s} viewBox="0 0 70 44" style={box({ left: x - 35 * s, top: y - 40 * s })}>
    <path d="M 4 8 Q 35 54 66 8 Z" fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
    {tea ? <ellipse cx={35} cy={9} rx={29} ry={5} fill="#B5651D" /> : null}
    <path d="M 12 18 Q 35 30 58 18" stroke="#2F62A8" strokeWidth={4} fill="none" />
  </svg>
);

// Чайник на столе.
export const Teapot: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={150 * s} height={110 * s} viewBox="0 0 150 110" style={box({ left: x - 75 * s, top: y - 108 * s })}>
    <path d="M 108 60 Q 138 50 142 26" stroke="#FFFFFF" strokeWidth={11} fill="none" strokeLinecap="round" />
    <ellipse cx={70} cy={66} rx={50} ry={42} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
    <path d="M 24 64 Q 70 48 116 64" stroke="#2F62A8" strokeWidth={6} fill="none" />
    <ellipse cx={70} cy={26} rx={20} ry={7} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
    <circle cx={70} cy={18} r={6} fill="#2F62A8" />
    <path d="M 22 46 Q 0 56 20 86" stroke="#E6EAF0" strokeWidth={8} fill="none" />
  </svg>
);

// Тарелка с обедом на столе (вид чуть сверху).
export const PlateOnTable: React.FC<{ x: number; y: number; eaten?: number }> = ({ x, y, eaten = 0 }) => (
  <svg width={180} height={60} viewBox="-90 -30 180 60" style={box({ left: x - 90, top: y - 30 })}>
    <ellipse cx={0} cy={6} rx={80} ry={22} fill="#D5DCE6" />
    <ellipse cx={0} cy={0} rx={80} ry={22} fill="#FFFFFF" />
    <ellipse cx={0} cy={0} rx={54} ry={14} fill="#F1F3F6" />
    <ellipse cx={-12} cy={-2} rx={32 * (1 - 0.6 * eaten)} ry={9 * (1 - 0.5 * eaten)} fill="#E7C27A" />
    <ellipse cx={24} cy={0} rx={17 * (1 - 0.7 * eaten)} ry={7 * (1 - 0.6 * eaten)} fill="#C9643E" />
  </svg>
);

// Листок с планом на столе.
export const PaperOnTable: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = -6 }) => (
  <div style={box({ left: x - 70, top: y - 22, width: 140, height: 30, backgroundColor: "#FFFDF6", borderRadius: 4, rotate: `${rot}deg`, boxShadow: "0 3px 6px rgba(60,40,20,0.15)" })}>
    {[0, 1].map((i) => (
      <div key={i} style={box({ left: 14, top: 7 + i * 10, width: 100 - i * 30, height: 4, borderRadius: 2, backgroundColor: "#9AA6BC" })} />
    ))}
  </div>
);

// Тёплый вечерний свет: лампа над столом.
export const WarmLamp: React.FC<{ on?: number }> = ({ on = 1 }) => (
  <>
    <div style={box({ left: 960 - 4, top: 0, width: 8, height: 560, backgroundColor: "#5B4636" })} />
    <div style={box({ left: 960 - 120, top: 540, width: 240, height: 110, borderRadius: "120px 120px 16px 16px", backgroundColor: "#F2C27A" })} />
    <div style={box({ left: -300, top: 0, width: 2800, height: 2600, background: `radial-gradient(circle at 960px 700px, rgba(255,205,130,${0.38 * on}), transparent 900px)`, pointerEvents: "none" })} />
  </>
);
