// Гостиная семьи — один мир для всех домашних сцен №34 (px мира). Слева
// направо: книжная полка (та самая книга), окно во двор, обеденный стол с
// ноутбуком (мама сидит у правого торца лицом влево), растение, диван на три
// места, кресло, стул папы, журнальный столик с чаем, ковёр, торшер.
// Пол у стены — y = 1500; стопы людей у дивана — y = 1540; передний план
// (ковёр) — y ≈ 1640. Предметы стоят на одних и тех же местах во всех
// планах. Вечер (evening = 1): тёплый свет торшера, темно за окном.
import { box, Svg } from "../kit";
import { BOOK } from "../props/bookStyle";
import { C } from "../theme";

export const LIVING = {
  floorY: 1500,
  feetY: 1540,
  frontY: 1640,
  width: 2700,
  bookshelf: { x: 110, w: 360, top: 520, shelves: [700, 880, 1060, 1240] },
  bookSlot: { x: 300, y: 1240 }, // книга стоит на нижней полке (по росту сына): низ корешка
  window: { x: 540, y: 380, w: 500, h: 580 },
  table: { x: 580, w: 600, top: 1220 },
  laptop: { x: 900, y: 1220 },
  // мама у правого торца стола, лицом влево (к ноутбуку)
  momSeat: { x: 1196, seat: 205 },
  plant: { x: 1262 },
  sofa: { x: 1320, w: 720, seatY: 1335, backTop: 1080, seats: [1500, 1680, 1860], seat: 205 },
  armchair: { x: 2100, w: 320, seatX: 2260, seatY: 1340, seat: 200 },
  dadChair: { x: 2560, seat: 205 },
  coffeeTable: { x: 1960, w: 400, top: 1452 },
  rug: { x: 1290, w: 1160, y: 1512, h: 220 },
  lamp: { x: 2470 },
  bagSpot: { x: 1404, y: 1550 }, // у левого подлокотника дивана, у ног воспитателя
  // игрушки малышки на ковре
  toys: { x: 1560, y: 1660 },
} as const;

const L = LIVING;
type Ev = { readonly evening?: number };

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

// ---------- Вид из окна: двор, панельные дома, тополя, горы ----------
const WindowView: React.FC<{ readonly evening: number; readonly w: number; readonly h: number }> = ({ evening, w, h }) => {
  const ev = evening > 0.5;
  const house = (x: number, y: number, ww: number, floors: number, col: string, seed: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={ww} height={floors * 62 + 30} fill={col} />
      <rect x={x} y={y - 8} width={ww} height={10} fill={ev ? "#2B3150" : "#C9BBA8"} />
      {Array.from({ length: floors }).map((_, fl) =>
        Array.from({ length: Math.floor(ww / 46) }).map((__, i) => {
          const lit = ev && (seed * 7 + fl * 3 + i * 5) % 4 === 0;
          return (
            <g key={`${fl}-${i}`}>
              <rect x={x + 12 + i * 46} y={y + 16 + fl * 62} width={26} height={30} rx={2} fill={lit ? "#F7D48C" : ev ? "#3E4566" : "#B9CCDC"} opacity={lit ? 0.95 : 1} />
              {i % 2 === 0 ? <rect x={x + 6 + i * 46} y={y + 44 + fl * 62} width={38} height={8} fill={ev ? "#353B5C" : "#D9CDBB"} /> : null}
            </g>
          );
        }),
      )}
    </g>
  );
  const poplar = (x: number, y: number, s: number) => (
    <g key={`p${x}`}>
      <rect x={x - 4 * s} y={y - 40 * s} width={8 * s} height={60 * s} fill={ev ? "#2A2E40" : "#7A6550"} />
      <ellipse cx={x} cy={y - 150 * s} rx={34 * s} ry={130 * s} fill={ev ? "#2D3A3E" : C.greenDark} />
      <ellipse cx={x - 8 * s} cy={y - 170 * s} rx={18 * s} ry={90 * s} fill={ev ? "#33423F" : C.green} opacity={0.8} />
    </g>
  );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={box({ left: 0, top: 0 })}>
      <defs>
        <linearGradient id="el34-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ev ? "#1F2846" : "#CFE2F0"} />
          <stop offset="1" stopColor={ev ? "#4A4A6E" : "#F2EADB"} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#el34-sky)" />
      {/* горы Ала-Тоо */}
      <path d={`M 0 ${h * 0.42} L ${w * 0.12} ${h * 0.3} L ${w * 0.26} ${h * 0.37} L ${w * 0.42} ${h * 0.2} L ${w * 0.56} ${h * 0.33} L ${w * 0.72} ${h * 0.23} L ${w * 0.88} ${h * 0.35} L ${w} ${h * 0.28} L ${w} ${h * 0.6} L 0 ${h * 0.6} Z`} fill={ev ? "#2E3658" : "#B8C9DC"} />
      {!ev ? <path d={`M ${w * 0.39} ${h * 0.22} L ${w * 0.42} ${h * 0.2} L ${w * 0.455} ${h * 0.235} L ${w * 0.43} ${h * 0.23} Z M ${w * 0.7} ${h * 0.245} L ${w * 0.72} ${h * 0.23} L ${w * 0.75} ${h * 0.255} Z`} fill="#FFFFFF" opacity={0.9} /> : null}
      <path d={`M 0 ${h * 0.5} L ${w * 0.2} ${h * 0.44} L ${w * 0.45} ${h * 0.49} L ${w * 0.7} ${h * 0.43} L ${w} ${h * 0.48} L ${w} ${h * 0.62} L 0 ${h * 0.62} Z`} fill={ev ? "#283050" : "#9FB4CA"} />
      {house(-30, h * 0.5, 250, 5, ev ? "#3A3F62" : "#E5D5C2", 2)}
      {house(260, h * 0.56, 270, 5, ev ? "#353A5C" : "#DCCBB8", 5)}
      {poplar(232, h * 1.0, 0.9)}
      {poplar(462, h * 1.02, 0.8)}
      {/* двор */}
      <rect x={0} y={h * 0.9} width={w} height={h * 0.1} fill={ev ? "#2C3048" : "#CFC6B3"} />
    </svg>
  );
};

// ---------- Задний план: стена, окно, полка, панно, пол, ковёр ----------
export const LivingBack: React.FC<{ readonly f?: number; readonly bookOnShelf?: boolean } & Ev> = ({ evening = 0, bookOnShelf = true }) => {
  const ev = evening;
  const wall = mix(C.wall, C.wallEvening, ev);
  const wallLow = mix(C.wallShade, "#DCC3A0", ev);
  const floor = mix(C.floor, C.floorEvening, ev);
  const w = L.window;
  const sh = L.bookshelf;
  // книги на полках (детерминированно): ширина, высота, цвет
  const palette = ["#7E97A8", "#C9A46A", "#8FAF8A", "#B9786A", "#6C7FA0", "#D8C7A4", "#9A8BA8", "#7FA39B"];
  const shelfBooks = (shelfY: number, k: number) => {
    const out: React.ReactNode[] = [];
    let x = sh.x + 24;
    let i = 0;
    while (x < sh.x + sh.w - 40) {
      const isSlot = shelfY === L.bookSlot.y && Math.abs(x - (L.bookSlot.x - 18)) < 14;
      const bw = 18 + ((k * 7 + i * 5) % 4) * 6;
      const bh = 110 + ((k * 3 + i * 11) % 5) * 12;
      if (shelfY === L.bookSlot.y && x > L.bookSlot.x - 40 && x < L.bookSlot.x + 30) {
        x = L.bookSlot.x + 30;
        i++;
        continue;
      }
      if (!isSlot && !(k === 1 && i > 4 && i < 7)) {
        out.push(<rect key={`${k}-${i}`} x={x} y={shelfY - bh} width={bw} height={bh} rx={2} fill={palette[(k * 3 + i) % palette.length]} opacity={0.95} />);
        out.push(<rect key={`${k}-${i}b`} x={x + 3} y={shelfY - bh + 14} width={bw - 6} height={4} rx={1} fill="#FFFFFF" opacity={0.35} />);
      }
      x += bw + 3;
      i++;
    }
    return out;
  };
  return (
    <div style={box({ left: -400, top: 0, width: L.width + 800, height: 2600 })}>
      <div style={box({ left: 0, top: -900, width: L.width + 800, height: L.floorY + 900, backgroundColor: wall })} />
      {/* потолочный карниз */}
      <div style={box({ left: 0, top: 150, width: L.width + 800, height: 10, backgroundColor: mix("#F4EEE2", "#E3CFAE", ev) })} />
      {/* нижняя часть стены чуть темнее */}
      <div style={box({ left: 0, top: 1200, width: L.width + 800, height: L.floorY - 1200, backgroundColor: wallLow })} />
      <div style={box({ left: 0, top: 1196, width: L.width + 800, height: 8, backgroundColor: mix("#D8CCB8", "#C9AF88", ev) })} />
      {/* окно во двор */}
      <div style={box({ left: 400 + w.x - 18, top: w.y - 18, width: w.w + 36, height: w.h + 36, backgroundColor: "#FBF8F1", borderRadius: 10, boxShadow: "0 6px 18px rgba(60,40,20,0.10)" })} />
      <div style={box({ left: 400 + w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 4 })}>
        <WindowView evening={ev} w={w.w} h={w.h} />
        <div style={box({ left: w.w / 2 - 7, top: 0, width: 14, height: w.h, backgroundColor: "#FBF8F1" })} />
        <div style={box({ left: 0, top: w.h * 0.38, width: w.w, height: 14, backgroundColor: "#FBF8F1" })} />
      </div>
      <div style={box({ left: 400 + w.x - 34, top: w.y + w.h + 10, width: w.w + 68, height: 24, borderRadius: 6, backgroundColor: "#F6F1E7" })} />
      {/* цветок на подоконнике */}
      <div style={box({ left: 400 + w.x + 34, top: w.y + w.h - 54, width: 54, height: 64, borderRadius: "8px 8px 18px 18px", backgroundColor: "#C98A6A" })} />
      <div style={box({ left: 400 + w.x + 22, top: w.y + w.h - 124, width: 78, height: 78, borderRadius: 40, backgroundColor: C.green })} />
      {/* шторы — светлый лён */}
      <div style={box({ left: 400 + w.x - 110, top: w.y - 50, width: 104, height: w.h + 140, borderRadius: "0 0 30px 30px", backgroundColor: mix("#E6DCC9", "#D2BE9C", ev) })} />
      <div style={box({ left: 400 + w.x + w.w + 6, top: w.y - 50, width: 104, height: w.h + 140, borderRadius: "0 0 30px 30px", backgroundColor: mix("#E6DCC9", "#D2BE9C", ev) })} />
      <div style={box({ left: 400 + w.x - 130, top: w.y - 64, width: w.w + 260, height: 14, borderRadius: 7, backgroundColor: C.woodDark })} />
      {/* книжная полка */}
      <div style={box({ left: 400 + sh.x, top: sh.top, width: sh.w, height: L.floorY - sh.top, backgroundColor: mix(C.wood, "#AE8458", ev), borderRadius: 6 })} />
      <div style={box({ left: 400 + sh.x + 14, top: sh.top + 14, width: sh.w - 28, height: L.floorY - sh.top - 28, backgroundColor: mix("#E9DCC6", "#D6BE98", ev) })} />
      <svg width={L.width} height={1600} style={box({ left: 400, top: 0, overflow: "visible" })}>
        {sh.shelves.map((y, k) => (
          <g key={y}>
            {shelfBooks(y, k)}
            <rect x={sh.x + 10} y={y} width={sh.w - 20} height={16} fill={mix(C.woodDark, "#8A6440", ev)} />
          </g>
        ))}
        {/* та самая книга: корешок коралловый с лисёнком */}
        {bookOnShelf ? (
          <g>
            <rect x={L.bookSlot.x - 17} y={L.bookSlot.y - 150} width={34} height={150} rx={3} fill={BOOK.spine} />
            <rect x={L.bookSlot.x - 17} y={L.bookSlot.y - 150} width={34} height={150} rx={3} fill={BOOK.cover} opacity={0.55} />
            <rect x={L.bookSlot.x - 12} y={L.bookSlot.y - 132} width={24} height={26} rx={3} fill={BOOK.band} />
            <circle cx={L.bookSlot.x} cy={L.bookSlot.y - 52} r={9} fill={BOOK.fox} />
          </g>
        ) : null}
        {/* растение и рамка на полке */}
        <rect x={sh.x + 40} y={sh.top - 70} width={60} height={70} rx={10} fill="#D8B48C" />
        <ellipse cx={sh.x + 70} cy={sh.top - 96} rx={56} ry={40} fill={C.green} />
        <rect x={sh.x + 230} y={sh.top - 110} width={90} height={110} rx={6} fill="#FBF8F1" />
        <rect x={sh.x + 240} y={sh.top - 100} width={70} height={90} rx={3} fill="#C9D6E2" />
        <circle cx={sh.x + 265} cy={sh.top - 62} r={12} fill="#B98E72" />
        <circle cx={sh.x + 290} cy={sh.top - 58} r={10} fill="#C99A7C" />
        {/* корзина с игрушками внизу */}
        <rect x={sh.x + 40} y={sh.shelves[3] + 120} width={140} height={110} rx={14} fill="#C9AE84" />
        <circle cx={sh.x + 80} cy={sh.shelves[3] + 116} r={20} fill="#E8A0A0" />
        <rect x={sh.x + 110} y={sh.shelves[3] + 92} width={36} height={36} rx={6} fill="#8FB6D8" />
      </svg>
      {/* тушкийиз над диваном: вышитое панно с орнаментом */}
      <svg width={420} height={300} viewBox="0 0 420 300" style={box({ left: 400 + 1470, top: 560 })}>
        <rect x={4} y={8} width={412} height={288} rx={18} fill="rgba(60,40,30,0.10)" />
        <rect x={0} y={0} width={412} height={284} rx={18} fill={mix("#8E3B3F", "#7A3236", ev)} />
        <rect x={16} y={16} width={380} height={252} rx={12} fill="none" stroke="#E8C98A" strokeWidth={6} strokeDasharray="18 10" />
        <g fill="none" stroke="#F1D9A4" strokeWidth={8} strokeLinecap="round" transform="translate(206 142)">
          <path d="M 0 -50 C -30 -50 -44 -80 -24 -96 C -8 -108 12 -96 6 -80" />
          <path d="M 0 -50 C 30 -50 44 -80 24 -96 C 8 -108 -12 -96 -6 -80" />
          <path d="M 0 50 C -30 50 -44 80 -24 96 C -8 108 12 96 6 80" />
          <path d="M 0 50 C 30 50 44 80 24 96 C 8 108 -12 96 -6 80" />
          <path d="M -50 0 L 0 -50 L 50 0 L 0 50 Z" />
        </g>
        {[80, 332].map((x) => (
          <g key={x} fill="none" stroke="#E8C98A" strokeWidth={6} strokeLinecap="round" transform={`translate(${x} 142) scale(0.55)`}>
            <path d="M 0 -50 C -30 -50 -44 -80 -24 -96 C -8 -108 12 -96 6 -80" />
            <path d="M 0 50 C 30 50 44 80 24 96 C 8 108 -12 96 -6 80" />
            <path d="M -50 0 L 0 -50 L 50 0 L 0 50 Z" />
          </g>
        ))}
      </svg>
      {/* плинтус и пол */}
      <div style={box({ left: 0, top: L.floorY - 14, width: L.width + 800, height: 14, backgroundColor: mix("#F6F1E7", "#E6D6BC", ev) })} />
      <div style={box({ left: 0, top: L.floorY, width: L.width + 800, height: 1700, background: `linear-gradient(180deg, ${floor}, ${mix(floor, "#8E6E4E", 0.25)} 60%)` })} />
      <div style={box({ left: 0, top: L.floorY, width: L.width + 800, height: 1700, backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,40,0.08) 0 2px, transparent 2px 180px)" })} />
      {/* ковёр (вид чуть сверху) с узором по краю */}
      <svg width={L.rug.w + 80} height={L.rug.h + 40} style={box({ left: 400 + L.rug.x - 40, top: L.rug.y })}>
        <rect x={40} y={0} width={L.rug.w} height={L.rug.h} rx={26} fill={mix(C.rug, "#C9B08C", ev)} />
        <rect x={64} y={18} width={L.rug.w - 48} height={L.rug.h - 36} rx={18} fill="none" stroke={mix(C.rugBorder, "#A88A62", ev)} strokeWidth={10} />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M ${120 + i * 86} ${L.rug.h / 2} l 22 -22 l 22 22 l -22 22 Z`} fill="none" stroke={mix(C.rugBorder, "#A88A62", ev)} strokeWidth={5} opacity={0.6} />
        ))}
      </svg>
    </div>
  );
};

// ---------- Мебель ----------
// Диван: спинка с тремя подушками, сиденье, подлокотники; акцентная подушка
// (по умолчанию — на среднем месте; сцена задаёт её положение в мире, когда
// воспитатель отодвигает подушку и освобождает место сыну). book — книга,
// оставленная на сиденье (сц. 10).
export const SOFA_CUSHION = { x: LIVING.sofa.seats[1], y: LIVING.sofa.seatY - 70, rot: -6 } as const;
export const Sofa: React.FC<{ readonly cushion?: { readonly x: number; readonly y: number; readonly rot: number } | null; readonly book?: boolean } & Ev> = ({ evening = 0, cushion = SOFA_CUSHION, book = false }) => {
  const s = L.sofa;
  const col = mix(C.sofa, C.sofaEvening, evening);
  const shade = mix(C.sofaShade, "#6B7F8E", evening);
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <ellipse cx={s.x + s.w / 2} cy={L.feetY - 6} rx={s.w / 2 + 30} ry={22} fill="rgba(40,30,30,0.12)" />
      {/* ножки */}
      {[s.x + 50, s.x + s.w - 50].map((x) => (
        <rect key={x} x={x - 8} y={1500} width={16} height={34} rx={4} fill={C.woodDark} />
      ))}
      {/* спинка */}
      <rect x={s.x + 20} y={s.backTop} width={s.w - 40} height={s.seatY - s.backTop + 40} rx={46} fill={shade} />
      {s.seats.map((x) => (
        <rect key={x} x={x - 86} y={s.backTop + 26} width={172} height={s.seatY - s.backTop - 4} rx={36} fill={col} />
      ))}
      {/* сиденье */}
      <rect x={s.x + 34} y={s.seatY - 16} width={s.w - 68} height={70} rx={24} fill={col} />
      {s.seats.map((x) => (
        <line key={x} x1={x + 90} y1={s.seatY - 8} x2={x + 90} y2={s.seatY + 48} stroke={shade} strokeWidth={3} opacity={x === s.seats[2] ? 0 : 0.6} />
      ))}
      <rect x={s.x + 26} y={s.seatY + 44} width={s.w - 52} height={L.floorY - s.seatY - 26} rx={18} fill={shade} />
      {/* подлокотники */}
      {[s.x, s.x + s.w - 78].map((x) => (
        <g key={x}>
          <rect x={x} y={s.seatY - 110} width={78} height={L.floorY - s.seatY + 110 - 4} rx={34} fill={col} />
          <rect x={x + 8} y={s.seatY - 100} width={62} height={26} rx={13} fill="#FFFFFF" opacity={0.12} />
        </g>
      ))}
      {/* акцентная подушка */}
      {cushion ? (
        <g transform={`translate(${cushion.x} ${cushion.y}) rotate(${cushion.rot})`}>
          <rect x={-62} y={-60} width={124} height={118} rx={30} fill={mix("#E2B65A", "#C99E4E", evening)} />
          <path d="M -40 -30 L 40 30 M 40 -30 L -40 30" stroke="#FFFFFF" strokeWidth={4} opacity={0.25} />
        </g>
      ) : null}
      {/* книга, оставленная на сиденье: лежит обложкой вверх */}
      {book ? (
        <g transform={`translate(${s.seats[0] + 70} ${s.seatY - 14})`}>
          <polygon points="-70,0 52,0 70,-16 -52,-16" fill={BOOK.cover} />
          <polygon points="-70,0 52,0 52,8 -70,8" fill={BOOK.edge} />
          <polygon points="-40,-4 20,-4 30,-12 -30,-12" fill={BOOK.band} />
        </g>
      ) : null}
    </svg>
  );
};

export const Armchair: React.FC<Ev> = ({ evening = 0 }) => {
  const a = L.armchair;
  const col = mix(C.armchair, "#95A47E", evening);
  const shade = mix(C.armchairShade, "#7F8E68", evening);
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <ellipse cx={a.x + a.w / 2} cy={L.feetY - 6} rx={a.w / 2 + 20} ry={18} fill="rgba(40,30,30,0.12)" />
      {[a.x + 40, a.x + a.w - 40].map((x) => (
        <rect key={x} x={x - 7} y={1500} width={14} height={32} rx={4} fill={C.woodDark} />
      ))}
      <rect x={a.x + 24} y={a.seatY - 250} width={a.w - 48} height={300} rx={50} fill={shade} />
      <rect x={a.x + 50} y={a.seatY - 230} width={a.w - 100} height={240} rx={38} fill={col} />
      <rect x={a.x + 36} y={a.seatY - 14} width={a.w - 72} height={66} rx={24} fill={col} />
      <rect x={a.x + 30} y={a.seatY + 44} width={a.w - 60} height={L.floorY - a.seatY - 24} rx={16} fill={shade} />
      {[a.x, a.x + a.w - 64].map((x) => (
        <rect key={x} x={x} y={a.seatY - 96} width={64} height={L.floorY - a.seatY + 92} rx={30} fill={col} />
      ))}
    </svg>
  );
};

// Обычный деревянный стул (папа у дивана; мамин стул у торца стола).
export const WoodChair: React.FC<{ readonly x: number; readonly seat?: number; readonly feetY?: number; readonly back?: "left" | "right" | "center" } & Ev> = ({ x, seat = 205, feetY = L.feetY, back = "center", evening = 0 }) => {
  const col = mix(C.wood, "#A87F55", evening);
  const dark = mix(C.woodDark, "#7E5B3C", evening);
  const sy = feetY - seat;
  const bx = back === "left" ? x - 70 : back === "right" ? x + 52 : x - 9;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <ellipse cx={x} cy={feetY - 4} rx={80} ry={12} fill="rgba(40,30,30,0.10)" />
      <rect x={bx} y={sy - 230} width={18} height={232} rx={6} fill={dark} />
      {back === "center" ? <rect x={x - 70} y={sy - 230} width={140} height={34} rx={12} fill={col} /> : <rect x={bx - 4} y={sy - 236} width={26} height={120} rx={10} fill={col} />}
      <rect x={x - 76} y={sy - 6} width={152} height={22} rx={8} fill={col} />
      {[x - 62, x + 50].map((lx) => (
        <rect key={lx} x={lx} y={sy + 12} width={12} height={feetY - sy - 14} rx={4} fill={dark} />
      ))}
    </svg>
  );
};

// Обеденный стол (рисуется ПОСЛЕ сидящей у торца мамы — её бёдра уходят
// под столешницу) и стулья у стола.
export const DiningTable: React.FC<Ev> = ({ evening = 0 }) => {
  const t = L.table;
  const top = mix("#E9DCC4", "#D9C3A0", evening);
  const edge = mix(C.wood, "#A87F55", evening);
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <ellipse cx={t.x + t.w / 2} cy={L.floorY + 26} rx={t.w / 2 + 20} ry={16} fill="rgba(40,30,30,0.10)" />
      {[t.x + 40, t.x + t.w - 54].map((x) => (
        <rect key={x} x={x} y={t.top + 20} width={16} height={L.floorY + 20 - t.top - 20} rx={5} fill={mix(C.woodDark, "#7E5B3C", evening)} />
      ))}
      <rect x={t.x} y={t.top} width={t.w} height={30} rx={8} fill={edge} />
      <rect x={t.x - 6} y={t.top - 10} width={t.w + 12} height={18} rx={8} fill={top} />
    </svg>
  );
};

// Растение в кадке между столом и диваном.
export const PlantStand: React.FC<Ev> = ({ evening = 0 }) => {
  const x = L.plant.x;
  const g = mix(C.green, "#6F8C66", evening);
  const gd = mix(C.greenDark, "#5A7552", evening);
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <path d={`M ${x - 46} 1400 L ${x + 46} 1400 L ${x + 36} 1530 L ${x - 36} 1530 Z`} fill={mix("#D9C3A6", "#C2A884", evening)} />
      {[-60, -25, 10, 40, 70].map((a, i) => (
        <g key={i} transform={`rotate(${a} ${x} 1400)`}>
          <ellipse cx={x} cy={1400 - 120 - (i % 2) * 40} rx={34} ry={90} fill={i % 2 ? gd : g} />
        </g>
      ))}
    </svg>
  );
};

// Журнальный столик с чаем (передний план, рисуется после сидящих).
export const CoffeeTable: React.FC<{ readonly phone?: boolean } & Ev> = ({ phone = false, evening = 0 }) => {
  const t = L.coffeeTable;
  const top = mix("#D9B98E", "#C29E70", evening);
  const piala = (x: number) => (
    <g key={x}>
      <path d={`M ${x - 24} ${t.top - 22} Q ${x} ${t.top + 8} ${x + 24} ${t.top - 22} Z`} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
      <ellipse cx={x} cy={t.top - 21} rx={22} ry={4} fill="#B5651D" />
      <path d={`M ${x - 18} ${t.top - 14} Q ${x} ${t.top - 6} ${x + 18} ${t.top - 14}`} stroke="#2F62A8" strokeWidth={3} fill="none" />
    </g>
  );
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <ellipse cx={t.x + t.w / 2} cy={1610} rx={t.w / 2 + 10} ry={16} fill="rgba(40,30,30,0.12)" />
      {[t.x + 30, t.x + t.w - 46].map((x) => (
        <rect key={x} x={x} y={t.top + 16} width={16} height={1600 - t.top - 16} rx={5} fill={mix(C.woodDark, "#7E5B3C", evening)} />
      ))}
      <rect x={t.x} y={t.top} width={t.w} height={24} rx={10} fill={top} />
      <rect x={t.x + 6} y={t.top + 20} width={t.w - 12} height={8} rx={4} fill={mix(C.woodDark, "#7E5B3C", evening)} opacity={0.5} />
      {/* чайник */}
      <g transform={`translate(${t.x + 96} ${t.top - 2})`}>
        <path d="M 46 -46 Q 70 -54 74 -76" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
        <ellipse cx={10} cy={-36} rx={44} ry={36} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
        <path d="M -30 -38 Q 10 -52 50 -38" stroke="#2F62A8" strokeWidth={5} fill="none" />
        <ellipse cx={10} cy={-70} rx={16} ry={6} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
        <circle cx={10} cy={-77} r={5} fill="#2F62A8" />
        <path d="M -32 -50 Q -54 -40 -36 -14" stroke="#E6EAF0" strokeWidth={7} fill="none" />
      </g>
      {piala(t.x + 230)}
      {piala(t.x + 300)}
      {phone ? <rect x={t.x + 330} y={t.top - 8} width={56} height={10} rx={4} fill="#1E2235" /> : null}
    </svg>
  );
};

// Сумка воспитателя на полу у левого подлокотника.
export const CaregiverBag: React.FC<{ readonly x?: number; readonly y?: number }> = ({ x = L.bagSpot.x, y = L.bagSpot.y }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
    <ellipse cx={x} cy={y} rx={66} ry={10} fill="rgba(40,30,30,0.14)" />
    <path d={`M ${x - 34} ${y - 96} Q ${x} ${y - 150} ${x + 34} ${y - 96}`} stroke="#5E3F31" strokeWidth={8} fill="none" />
    <rect x={x - 60} y={y - 104} width={120} height={102} rx={22} fill="#8A5A44" />
    <rect x={x - 60} y={y - 104} width={120} height={26} rx={12} fill="#7A4E3B" />
    <rect x={x - 8} y={y - 82} width={16} height={12} rx={3} fill="#D9B46A" />
  </svg>
);

// Игрушки малышки на ковре (кубики).
export const Toys: React.FC = () => {
  const { x, y } = L.toys;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <rect x={x} y={y - 40} width={40} height={40} rx={6} fill="#8FB6D8" />
      <rect x={x + 46} y={y - 36} width={36} height={36} rx={6} fill="#F2C46A" />
      <rect x={x + 18} y={y - 78} width={36} height={36} rx={6} fill="#E8A0A0" />
    </svg>
  );
};

// Торшер у кресла: вечером светится.
export const FloorLamp: React.FC<{ readonly on?: number }> = ({ on = 0 }) => {
  const x = L.lamp.x;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <ellipse cx={x} cy={1530} rx={44} ry={8} fill="rgba(40,30,30,0.14)" />
      <rect x={x - 5} y={860} width={10} height={668} fill="#5B4636" />
      <rect x={x - 36} y={1514} width={72} height={14} rx={7} fill="#5B4636" />
      <path d={`M ${x - 70} 880 L ${x + 70} 880 L ${x + 46} 760 L ${x - 46} 760 Z`} fill={on > 0.5 ? "#F6D49A" : "#EADCC4"} />
    </svg>
  );
};

// Тёплый вечерний свет: от торшера и лампы, лёгкая виньетка.
export const EveningLight: React.FC<{ readonly on?: number }> = ({ on = 1 }) => (
  <div style={box({ left: -400, top: -900, width: L.width + 800, height: 4100, pointerEvents: "none" })}>
    <div style={box({ inset: 0, background: `radial-gradient(circle at ${400 + L.lamp.x}px ${900 + 860}px, rgba(255,200,130,${0.34 * on}), transparent 1000px)` })} />
    <div style={box({ inset: 0, background: `radial-gradient(circle at ${400 + 900}px ${900 + 1000}px, rgba(255,214,150,${0.2 * on}), transparent 900px)` })} />
    <div style={box({ inset: 0, background: `rgba(60,40,30,${0.07 * on})` })} />
  </div>
);

// Дневной свет из окна (мягкий луч на пол и стол).
export const DayLight: React.FC = () => (
  <Svg>
    <defs>
      <linearGradient id="el34-sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="rgba(255,248,230,0.32)" />
        <stop offset="1" stopColor="rgba(255,248,230,0)" />
      </linearGradient>
    </defs>
    <polygon points={`${L.window.x},${L.window.y + L.window.h} ${L.window.x + L.window.w},${L.window.y + L.window.h} ${L.window.x + L.window.w + 520},1720 ${L.window.x + 160},1720`} fill="url(#el34-sun)" />
  </Svg>
);
