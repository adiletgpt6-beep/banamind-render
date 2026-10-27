// Детали сцены «group» BG-041: схематичная карта Бишкека (вид сверху),
// метки домов и школы, карточки заявок трёх семей, календарь поиска
// (14 дней), поле группы «Топ изделет…» с местами, честная печать
// «Кепилдик жок», лупа поиска, облака (параллакс). Всё — чистые функции
// параметров; время считает Group.tsx.
import { fontFamily } from "../../../fonts";
import { box, CheckIcon, clamp01, ClockIcon, HouseIcon, mix, NAVY, NAVY_SOFT, SchoolIcon, YELLOW, YELLOW_DEEP, YELLOW_SOFT } from "../art";
import { BG41_TEXT } from "../script";

const G = BG41_TEXT.group;

export const MAP_BG = "#EAF1FB";

// мягкое появление значка (0 → 1.1 → 1)
const popIn = (u: number) => (u <= 0 ? 0 : u < 0.6 ? mix(0.3, 1.1, u / 0.6) : mix(1.1, 1, (u - 0.6) / 0.4));
const ROAD = "#FFFFFF";
const PARK = "#CFEBCF";
const PARK_EDGE = "#B5DDB6";
const WATER = "#C9E2F7";

// ---------- Раскладка мира (мир = кадр при z = 1) ----------
export const CAL = { x: 40, y: 540, w: 1000, h: 118 } as const;
export const SLOT = { x: 60, y: 1188, w: 900, h: 228 } as const;
export const SCHOOL_PT = { x: 330, y: 1146 } as const;
// Главный проспект, по которому сходятся маршруты к школе.
export const AVE_Y = 1098;

export type Family = {
  readonly name: string;
  readonly color: string; // цвет семьи (аватар ребёнка, метка)
  readonly kid: { readonly skin: string; readonly hair: string };
  readonly ours: boolean;
  readonly pin: { readonly x: number; readonly y: number }; // острие метки дома
  readonly card: { readonly x: number; readonly y: number }; // левый верх карточки
  readonly lane: number; // смещение линии маршрута по проспекту
};

export const CARD_W = 318;
export const CARD_H = 140;

export const FAMILIES: readonly Family[] = [
  { name: G.families[0], color: YELLOW, kid: { skin: "#E8B48D", hair: "#221B19" }, ours: true, pin: { x: 185, y: 1052 }, card: { x: 30, y: 778 }, lane: -9 },
  { name: G.families[1], color: "#8EC5F0", kid: { skin: "#D9A47E", hair: "#3A2C26" }, ours: false, pin: { x: 450, y: 1020 }, card: { x: 381, y: 778 }, lane: 0 },
  { name: G.families[2], color: "#9FD8A8", kid: { skin: "#E0AE88", hair: "#2A1E1A" }, ours: false, pin: { x: 965, y: 1024 }, card: { x: 732, y: 778 }, lane: 9 },
];

// Места в поле группы (центры, мир).
export const SEAT_R = 42;
export const seatCenter = (i: number) => ({ x: SLOT.x + 44 + SEAT_R + i * 104, y: SLOT.y + 158 });

// Маршруты по улицам: дом → проспект → школа.
export const routePath = (fam: Family) => {
  const y = AVE_Y + fam.lane;
  const sx = SCHOOL_PT.x + fam.lane * 0.6;
  return `M ${fam.pin.x} ${fam.pin.y} L ${fam.pin.x} ${y} L ${sx} ${y} L ${sx} ${SCHOOL_PT.y - 4}`;
};

// ---------- Карта ----------
const H_ROADS: readonly (readonly [number, number])[] = [
  [470, 26],
  [710, 24],
  [930, 26],
  [AVE_Y, 46],
  [1270, 26],
  [1440, 30],
  [1640, 26],
];
const V_ROADS: readonly (readonly [number, number])[] = [
  [70, 24],
  [185, 22],
  [330, 30],
  [560, 46],
  [740, 22],
  [900, 26],
  [1030, 22],
];
const LANES_H = [590, 820, 1015, 1185, 1355, 1540];
const LANES_V = [255, 450, 650, 820, 965];
const PARKS: readonly (readonly [number, number, number, number])[] = [
  [355, 945, 182, 128],
  [760, 1112, 124, 140],
  [-40, 1112, 96, 140],
  [585, 485, 135, 210],
  [925, 1285, 160, 140],
];
const TREES: readonly (readonly [number, number])[] = [
  [390, 980],
  [430, 1030],
  [480, 975],
  [505, 1040],
  [790, 1150],
  [840, 1210],
  [800, 1235],
  [620, 540],
  [680, 600],
  [640, 650],
  [960, 1320],
  [1030, 1380],
];

export const MapBase: React.FC<{ readonly mountains?: number }> = () => (
  <svg width={1480} height={2320} viewBox="-200 -200 1480 2320" style={box({ left: -200, top: -200 })}>
    <rect x={-200} y={-200} width={1480} height={2320} fill={MAP_BG} />
    {/* канал (Чүй каналы — схематично, без подписи) */}
    <path d="M -200 395 C 100 360, 300 430, 560 392 S 980 360, 1280 400" fill="none" stroke={WATER} strokeWidth={34} strokeLinecap="round" />
    {PARKS.map(([x, y, w, h], i) => (
      <rect key={`p${i}`} x={x} y={y} width={w} height={h} rx={22} fill={PARK} stroke={PARK_EDGE} strokeWidth={4} />
    ))}
    {LANES_H.map((y) => (
      <rect key={`lh${y}`} x={-200} y={y - 5} width={1480} height={10} fill={ROAD} opacity={0.75} />
    ))}
    {LANES_V.map((x) => (
      <rect key={`lv${x}`} x={x - 5} y={-200} width={10} height={2320} fill={ROAD} opacity={0.75} />
    ))}
    {H_ROADS.map(([y, w]) => (
      <rect key={`h${y}`} x={-200} y={y - w / 2} width={1480} height={w} fill={ROAD} />
    ))}
    {V_ROADS.map(([x, w]) => (
      <rect key={`v${x}`} x={x - w / 2} y={-200} width={w} height={2320} fill={ROAD} />
    ))}
    {/* осевая разметка проспектов */}
    <path d={`M -200 ${AVE_Y} L 1280 ${AVE_Y}`} stroke="#DCE6F3" strokeWidth={3} strokeDasharray="18 16" />
    <path d="M 560 -200 L 560 2120" stroke="#DCE6F3" strokeWidth={3} strokeDasharray="18 16" />
    {TREES.map(([x, y], i) => (
      <g key={`t${i}`}>
        <circle cx={x} cy={y + 4} r={17} fill="#A8D3A9" />
        <circle cx={x} cy={y} r={17} fill="#8CCB95" />
        <circle cx={x - 5} cy={y - 5} r={6} fill="#B7E2BC" />
      </g>
    ))}
  </svg>
);

// Горы Ала-Тоо — южный край карты (внизу), силуэт со снегом.
export const MapMountains: React.FC<{ readonly y: number }> = ({ y }) => (
  <svg width={1480} height={700} viewBox={`-200 0 1480 700`} style={box({ left: -200, top: y })}>
    <defs>
      <linearGradient id="g41-mnt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#C2D3EA" />
        <stop offset="1" stopColor="#DCE6F4" />
      </linearGradient>
    </defs>
    {/* предгорья: полоса садов и тополей между городом и горами */}
    <rect x={-200} y={-10} width={1480} height={60} fill="#DDEFD9" />
    {Array.from({ length: 30 }, (_, i) => (
      <g key={i} transform={`translate(${-190 + i * 50 + (i % 3) * 7} ${30 + (i % 2) * 6})`}>
        <rect x={-2} y={-6} width={4} height={8} fill="#9C8068" />
        <ellipse cx={0} cy={-20} rx={9} ry={20} fill={i % 4 === 0 ? "#9AD0A2" : "#8CCB95"} />
        <ellipse cx={-2.5} cy={-24} rx={3.5} ry={11} fill="#B7E2BC" opacity={0.85} />
      </g>
    ))}
    <path d="M -200 140 L -60 80 L 60 130 L 190 40 L 320 115 L 440 55 L 560 125 L 700 20 L 830 110 L 950 50 L 1080 120 L 1180 70 L 1280 110 L 1280 700 L -200 700 Z" fill="#D6E2F2" />
    <path d="M 190 40 L 226 70 L 206 66 L 190 78 L 174 64 L 158 68 Z" fill="#FFFFFF" />
    <path d="M 700 20 L 742 54 L 718 50 L 700 64 L 682 50 L 662 54 Z" fill="#FFFFFF" />
    <path d="M 950 50 L 982 76 L 964 72 L 950 82 L 936 70 L 922 74 Z" fill="#FFFFFF" />
    <path d="M 440 55 L 468 78 L 452 75 L 440 84 L 428 74 L 414 76 Z" fill="#FFFFFF" />
    <path d="M -200 190 L -20 130 L 120 180 L 300 115 L 470 185 L 640 120 L 820 180 L 990 125 L 1280 185 L 1280 700 L -200 700 Z" fill="url(#g41-mnt)" />
    <path d="M -200 190 L -20 130 L 120 180 L 300 115 L 470 185 L 640 120 L 820 180 L 990 125 L 1280 185" fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.7} />
  </svg>
);

// ---------- Маршруты ----------
export const Routes: React.FC<{ readonly draw: readonly number[] }> = ({ draw }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={box({ left: 0, top: 0, overflow: "visible" })}>
    {FAMILIES.map((fam, i) => {
      const d = clamp01(draw[i] ?? 0);
      if (d <= 0) return null;
      return (
        <g key={i}>
          <path d={routePath(fam)} fill="none" stroke={NAVY} strokeOpacity={0.14} strokeWidth={fam.ours ? 22 : 18} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} transform="translate(0 3)" />
          <path
            d={routePath(fam)}
            fill="none"
            stroke={YELLOW}
            strokeWidth={fam.ours ? 16 : 12}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - d}
          />
        </g>
      );
    })}
  </svg>
);

// ---------- Метки ----------
// Метка-капля: (x, y) — острие. Голова над острием.
const PinShape: React.FC<{ readonly r: number; readonly fill: string; readonly stroke?: string; readonly sw?: number }> = ({ r, fill, stroke = NAVY, sw = 5 }) => {
  const h = r * 1.55;
  return <path d={`M 0 0 C ${-r * 0.35} ${-h * 0.45}, ${-r} ${-h * 0.75}, ${-r} ${-h - r * 0.2} A ${r} ${r} 0 1 1 ${r} ${-h - r * 0.2} C ${r} ${-h * 0.75}, ${r * 0.35} ${-h * 0.45}, 0 0 Z`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
};

export const pinHead = (x: number, y: number, r: number) => ({ x, y: y - r * 1.55 - r * 0.2 });

export const HomePin: React.FC<{ readonly fam: Family; readonly s?: number; readonly ring?: number; readonly pulse?: number; readonly linked?: number }> = ({
  fam,
  s = 1,
  ring = 0,
  pulse = 0,
  linked = 0,
}) => {
  const r = fam.ours ? 34 : 30;
  const head = pinHead(0, 0, r);
  return (
    <div style={box({ left: fam.pin.x, top: fam.pin.y, width: 0, height: 0 })}>
      {/* волна ожидания (заявка ждёт подбора) */}
      {pulse > 0 ? (
        <div
          style={box({
            left: -r * (1 + ring * 1.4),
            top: head.y - r * (1 + ring * 1.4),
            width: 2 * r * (1 + ring * 1.4),
            height: 2 * r * (1 + ring * 1.4),
            borderRadius: "50%",
            border: `4px solid ${fam.ours ? YELLOW_DEEP : NAVY_SOFT}`,
            opacity: pulse * (1 - ring) * 0.7,
            boxSizing: "border-box",
          })}
        />
      ) : null}
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <ellipse cx={0} cy={2} rx={r * 0.6 * s} ry={r * 0.2 * s} fill="rgba(20,40,75,0.2)" />
        <g transform={`scale(${s})`}>
          {linked > 0 ? <circle cx={head.x} cy={head.y} r={r + 9} fill="none" stroke={YELLOW} strokeWidth={8} opacity={linked} /> : null}
          <PinShape r={r} fill={fam.ours ? YELLOW : "#FFFFFF"} />
        </g>
      </svg>
      <div style={box({ left: -r * 0.62 * s, top: head.y * s - r * 0.62 * s, width: r * 1.24 * s, height: r * 1.24 * s, display: "flex" })}>
        <HouseIcon size={r * 1.24 * s} fill={fam.ours ? "#FFFFFF" : "#FFFFFF"} />
      </div>
    </div>
  );
};

export const SchoolPin: React.FC<{ readonly glow?: number }> = ({ glow = 0 }) => {
  const r = 40;
  const head = pinHead(0, 0, r);
  return (
    <div style={box({ left: SCHOOL_PT.x, top: SCHOOL_PT.y, width: 0, height: 0 })}>
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <ellipse cx={0} cy={2} rx={26} ry={8} fill="rgba(20,40,75,0.22)" />
        {glow > 0 ? <circle cx={head.x} cy={head.y} r={r + 12} fill="none" stroke={YELLOW} strokeWidth={9} opacity={glow} /> : null}
        <PinShape r={r} fill={NAVY} stroke={NAVY} />
        <circle cx={head.x} cy={head.y} r={r - 7} fill="#FFFFFF" />
      </svg>
      <div style={box({ left: -27, top: head.y - 29, display: "flex" })}>
        <SchoolIcon size={54} />
      </div>
      {/* подпись школы — над меткой */}
      <div
        style={box({
          left: -90,
          width: 180,
          textAlign: "center",
          top: head.y - r - 54,
          padding: "5px 14px 6px",
          borderRadius: 16,
          backgroundColor: NAVY,
          color: "#FFFFFF",
          fontFamily,
          fontSize: 30,
          fontWeight: 1000,
          letterSpacing: 1.5,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 10px rgba(20,40,75,0.2)",
        })}
      >
        {G.school}
      </div>
    </div>
  );
};

// ---------- Ребёнок в кружке-месте ----------
export const KidAvatar: React.FC<{ readonly fam: Family; readonly r: number }> = ({ fam, r }) => (
  <svg width={2 * r} height={2 * r} viewBox="-50 -50 100 100" style={{ display: "block" }}>
    <clipPath id={`kid-${fam.name}`}>
      <circle r={46} />
    </clipPath>
    <circle r={46} fill={fam.color} />
    <g clipPath={`url(#kid-${fam.name})`}>
      <path d="M -34 56 Q -32 18 0 16 Q 32 18 34 56 Z" fill={fam.ours ? "#2F4A7A" : "#FFFFFF"} opacity={fam.ours ? 1 : 0.9} />
      <circle cx={0} cy={-6} r={21} fill={fam.kid.skin} />
      <path d="M -21 -8 Q -20 -32 0 -31 Q 21 -32 21 -8 Q 14 -20 0 -20 Q -12 -20 -21 -8 Z" fill={fam.kid.hair} />
      <circle cx={-7} cy={-3} r={2.6} fill={NAVY} />
      <circle cx={7} cy={-3} r={2.6} fill={NAVY} />
      <path d="M -6 7 Q 0 12 6 7" stroke="#B86A62" strokeWidth={2.6} fill="none" strokeLinecap="round" />
    </g>
    <circle r={46} fill="none" stroke={NAVY} strokeWidth={5} />
  </svg>
);

// ---------- Карточка заявки семьи ----------
export const FamilyCard: React.FC<{ readonly fam: Family; readonly hi?: number }> = ({ fam, hi = 0 }) => {
  const fields = [
    { label: G.fields[0], icon: <HouseIcon size={34} /> },
    { label: G.fields[1], icon: <SchoolIcon size={34} /> },
    { label: G.fields[2], icon: <ClockIcon size={34} minutes={0} /> },
  ];
  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        borderRadius: 26,
        backgroundColor: "#FFFFFF",
        border: `4px solid ${NAVY}`,
        boxShadow: `0 10px 22px rgba(20,40,75,0.16)${hi > 0 ? `, 0 0 0 ${6 * hi}px ${YELLOW}` : ""}`,
        padding: "12px 14px 10px",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: fam.color, border: `3px solid ${NAVY}`, boxSizing: "border-box", flexShrink: 0 }} />
        <div style={{ fontSize: 36, fontWeight: 1000, color: NAVY, lineHeight: 1, whiteSpace: "nowrap" }}>{fam.name}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        {fields.map((x) => (
          <div key={x.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 3 }}>
            {x.icon}
            <div style={{ fontSize: 23, fontWeight: 900, color: NAVY_SOFT, lineHeight: 1, whiteSpace: "nowrap" }}>{x.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Календарь поиска: 14 дней ----------
export const Calendar: React.FC<{ readonly day: number; readonly pulse?: number; readonly bracket?: number }> = ({ day, pulse = 0, bracket = 0 }) => {
  const cellsX = 232;
  const gap = 6;
  const wkGap = 16;
  const cw = (CAL.w - cellsX - 22 - 13 * gap - (wkGap - gap)) / 14;
  const cellLeft = (d: number) => cellsX + (d - 1) * (cw + gap) + (d > 7 ? wkGap - gap : 0);
  const cellsW = cellLeft(14) + cw - cellsX;
  return (
    <div style={box({ left: CAL.x, top: CAL.y, width: CAL.w, height: CAL.h, fontFamily })}>
      <div
        style={box({
          inset: 0,
          borderRadius: 30,
          backgroundColor: "#FFFFFF",
          border: `4px solid ${NAVY}`,
          boxSizing: "border-box",
          boxShadow: "0 10px 24px rgba(20,40,75,0.16)",
        })}
      />
      {/* корешки календаря */}
      {[cellsX + 40, CAL.w - 70].map((x) => (
        <div key={x} style={box({ left: x, top: -14, width: 14, height: 30, borderRadius: 7, backgroundColor: NAVY })} />
      ))}
      {/* счётчик: «N-күн» */}
      <div
        style={box({
          left: 16,
          top: 16,
          width: 196,
          height: CAL.h - 32,
          borderRadius: 20,
          backgroundColor: YELLOW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: NAVY,
          fontSize: 50,
          fontWeight: 1000,
          fontVariantNumeric: "tabular-nums",
          boxShadow: `inset 0 0 0 4px ${NAVY}`,
        })}
      >
        {`${day}-${G.day}`}
      </div>
      {Array.from({ length: 14 }, (_, k) => {
        const d = k + 1;
        const past = d < day;
        const cur = d === day;
        const glow = cur ? pulse : 0;
        return (
          <div
            key={d}
            style={box({
              left: cellLeft(d),
              top: 22,
              width: cw,
              height: CAL.h - 44,
              borderRadius: 12,
              boxSizing: "border-box",
              backgroundColor: cur ? YELLOW : past ? YELLOW_SOFT : "#F3F6FB",
              border: cur ? `4px solid ${NAVY}` : past ? `3px solid ${YELLOW_DEEP}` : "3px solid #D4DDEB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: past || cur ? NAVY : NAVY_SOFT,
              fontSize: 30,
              fontWeight: 1000,
              fontVariantNumeric: "tabular-nums",
              transform: `scale(${1 + 0.06 * glow})`,
              boxShadow: glow > 0 ? `0 0 0 ${4 + 6 * glow}px rgba(255,201,40,${0.5 * (1 - glow) + 0.15})` : undefined,
            })}
          >
            {d}
          </div>
        );
      })}
      {/* скобка «2 жума» под ячейками */}
      {bracket > 0 ? (
        <svg width={cellsW} height={34} style={box({ left: cellsX, top: CAL.h + 4, overflow: "visible" })}>
          <path
            d={`M 4 4 L 4 18 L ${cellsW - 4} 18 L ${cellsW - 4} 4`}
            fill="none"
            stroke={NAVY}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - clamp01(bracket)}
          />
          <path d={`M ${cellsW / 2} 18 L ${cellsW / 2} 30`} stroke={NAVY} strokeWidth={5} strokeLinecap="round" opacity={clamp01(bracket * 2 - 1)} />
        </svg>
      ) : null}
    </div>
  );
};
export const CAL_CELLS_CENTER = CAL.x + 232 + (CAL.w - 232 - 22) / 2;

// ---------- Поле группы: «Топ изделет…» ↔ «Ылайыктуу топ» ----------
// formed 0…1 — группа собрана (сплошная жёлтая рамка, заголовок с галочкой);
// seats — заполненность мест (0…1 для каждого из трёх детей);
// need 0…1 — подсказка-факт «Ылайыктуу топ: 3–4 бала» (в паузе);
// content 0…1 — видимость содержимого (при въезде камеры → пустой белый лист);
// spin — «бегущий» пунктир пустых мест.
export const SlotCard: React.FC<{
  readonly formed: number;
  readonly seats: readonly number[];
  readonly check: number;
  readonly need: number;
  readonly content: number;
  readonly spin: number;
  readonly dots: number;
}> = ({ formed, seats, check, need, content, spin, dots }) => {
  const [needA, needB] = G.kids.split(": ");
  // заголовки сменяются по очереди (без наложения букв)
  const formedT = clamp01(formed * 2 - 1);
  const emptyT = clamp01(1 - formed * 2);
  const border = formed > 0.5 ? `6px solid ${YELLOW_DEEP}` : `5px dashed ${NAVY_SOFT}`;
  return (
    <div style={box({ left: SLOT.x, top: SLOT.y, width: SLOT.w, height: SLOT.h, fontFamily })}>
      <div
        style={box({
          inset: 0,
          borderRadius: 34,
          backgroundColor: "#FFFFFF",
          border,
          boxSizing: "border-box",
          boxShadow: `0 14px 30px rgba(20,40,75,${0.16 * content})`,
        })}
      />
      <div style={box({ inset: 0, opacity: content })}>
        {/* заголовок: пустое поле ↔ собранная группа */}
        <div style={box({ left: 44, top: 26, height: 60, display: "flex", alignItems: "center", gap: 10, opacity: emptyT, transform: `translateY(${(1 - emptyT) * 26}px)`, whiteSpace: "nowrap" })}>
          <span style={{ fontSize: 50, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{G.empty.replace("…", "")}</span>
          <span style={{ display: "inline-flex", gap: 7, marginTop: 22 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: NAVY, opacity: 0.25 + 0.75 * clamp01(dots * 3 - i) }} />
            ))}
          </span>
        </div>
        <div style={box({ left: 44, top: 26, height: 60, display: "flex", alignItems: "center", gap: 14, opacity: formedT, transform: `translateY(${(formedT - 1) * 26}px)`, whiteSpace: "nowrap" })}>
          <span style={{ fontSize: 46, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{G.kids}</span>
        </div>
        {/* места: 4 кружка (3–4 ребёнка) */}
        {[0, 1, 2, 3].map((i) => {
          const c = seatCenter(i);
          const u = clamp01(seats[i] ?? 0);
          const s = u <= 0 ? 0 : u < 0.6 ? mix(0.4, 1.12, u / 0.6) : mix(1.12, 1, (u - 0.6) / 0.4);
          return (
            <div key={i} style={box({ left: c.x - SLOT.x - SEAT_R, top: c.y - SLOT.y - SEAT_R, width: 2 * SEAT_R, height: 2 * SEAT_R })}>
              <svg width={2 * SEAT_R} height={2 * SEAT_R} viewBox="-50 -50 100 100" style={box({ left: 0, top: 0, opacity: 1 - u * 0.999 })}>
                <circle r={45} fill="#F3F6FB" stroke={NAVY_SOFT} strokeWidth={5} strokeDasharray="12 10" strokeDashoffset={-spin} />
                <path d="M 0 -14 L 0 14 M -14 0 L 14 0" stroke="#B7C3D8" strokeWidth={6} strokeLinecap="round" opacity={i === 3 ? 1 : 0.0} />
              </svg>
              {u > 0 ? (
                <div style={box({ left: 0, top: 0, transform: `scale(${s})` })}>
                  <KidAvatar fam={FAMILIES[i]} r={SEAT_R} />
                </div>
              ) : null}
            </div>
          );
        })}
        {/* факт-подсказка в паузе: «Ылайыктуу топ: / 3–4 бала» */}
        {need > 0 ? (
          <div
            style={box({
              left: 500,
              top: 104,
              width: 360,
              height: 104,
              borderRadius: 26,
              backgroundColor: YELLOW_SOFT,
              border: `4px solid ${YELLOW_DEEP}`,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: NAVY,
              opacity: clamp01(need * 1.6),
              transform: `translateY(${(1 - need) * 16}px) scale(${0.92 + 0.08 * need})`,
            })}
          >
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.05 }}>{`${needA}:`}</div>
            <div style={{ fontSize: 50, fontWeight: 1000, lineHeight: 1.05 }}>{needB}</div>
          </div>
        ) : null}
        {/* собранная группа: большая галочка справа */}
        {formed > 0 ? (
          <div style={box({ left: 600, top: 108, width: 100, height: 100, borderRadius: 50, backgroundColor: YELLOW, boxShadow: `inset 0 0 0 5px ${NAVY}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: formed * (1 - need), transform: `scale(${popIn(check)})` })}>
            <CheckIcon size={66} draw={check} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------- Факт под календарём: «Издөө — 2 жумага чейин» ----------
export const SearchFact: React.FC<{ readonly u: number }> = ({ u }) => {
  if (u <= 0) return null;
  return (
    <div style={box({ left: CAL_CELLS_CENTER - 300, width: 600, top: CAL.y + CAL.h + 30, display: "flex", justifyContent: "center", fontFamily })}>
      <div
        style={{
          padding: "8px 26px 10px",
          borderRadius: 26,
          backgroundColor: NAVY,
          color: "#FFFFFF",
          fontSize: 38,
          fontWeight: 1000,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          opacity: clamp01(u * 1.6),
          transform: `translateY(${(1 - u) * -14}px) scale(${0.9 + 0.1 * u})`,
          boxShadow: "0 8px 18px rgba(20,40,75,0.22)",
        }}
      >
        {G.search}
      </div>
    </div>
  );
};

// ---------- Заголовок карты: «Бишкек» с горами ----------
export const CityChip: React.FC<{ readonly x: number; readonly y: number; readonly o?: number }> = ({ x, y, o = 1 }) => (
  <div
    style={box({
      left: x,
      top: y,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 20px 8px 14px",
      borderRadius: 24,
      backgroundColor: "#FFFFFF",
      border: `3px solid ${NAVY}`,
      boxShadow: "0 6px 14px rgba(20,40,75,0.14)",
      fontFamily,
      fontSize: 38,
      fontWeight: 1000,
      color: NAVY,
      opacity: o,
      whiteSpace: "nowrap",
    })}
  >
    <svg width={46} height={28} viewBox="0 0 46 28">
      <path d="M 1 27 L 13 9 L 20 17 L 29 3 L 45 27 Z" fill="#C2D3EA" stroke={NAVY} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M 29 3 L 33.5 10 L 30.5 9 L 28.5 11.5 L 26 9 L 24.6 9.8 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
    {G.city}
  </div>
);

// ---------- Честная печать: «Кепилдик жок» ----------
export const GuaranteeStamp: React.FC<{ readonly x: number; readonly y: number; readonly u: number; readonly note: number; readonly noteDx?: number }> = ({ x, y, u, note, noteDx = 0 }) => {
  if (u <= 0) return null;
  // «удар» печати: из крупного масштаба к 1, без вспышек
  const s = u < 0.7 ? mix(1.7, 0.96, u / 0.7) : mix(0.96, 1, (u - 0.7) / 0.3);
  return (
    <div style={box({ left: x - 300, top: y - 70, width: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, fontFamily })}>
      <div
        style={{
          transform: `rotate(-4deg) scale(${s})`,
          opacity: clamp01(u * 2.2),
          padding: "10px 28px 12px",
          borderRadius: 22,
          backgroundColor: YELLOW_SOFT,
          border: `6px solid ${NAVY}`,
          outline: `3px solid ${NAVY}`,
          outlineOffset: 5,
          color: NAVY,
          fontSize: 52,
          fontWeight: 1000,
          letterSpacing: 1,
          lineHeight: 1.05,
          whiteSpace: "nowrap",
          boxShadow: `0 ${mix(30, 10, u)}px ${mix(40, 20, u)}px rgba(20,40,75,${mix(0.08, 0.22, u)})`,
        }}
      >
        {G.guarantee}
      </div>
      <div
        style={{
          opacity: clamp01(note * 1.5),
          transform: `translate(${noteDx}px, ${(1 - note) * 12}px)`,
          padding: "8px 22px 10px",
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.97)",
          border: `3px solid ${NAVY_SOFT}`,
          color: NAVY,
          fontSize: 32,
          fontWeight: 900,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 14px rgba(20,40,75,0.14)",
        }}
      >
        {G.guaranteeNote}
      </div>
    </div>
  );
};

// ---------- Лупа поиска (покой в паузе) ----------
export const Magnifier: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly tilt?: number }> = ({ x, y, o, tilt = 0 }) => {
  if (o <= 0) return null;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: o }}>
      <g transform={`rotate(${tilt})`}>
        <path d="M 40 40 L 86 86" stroke={NAVY} strokeWidth={18} strokeLinecap="round" />
        <path d="M 46 46 L 84 84" stroke={YELLOW_DEEP} strokeWidth={8} strokeLinecap="round" />
        <circle r={56} fill="rgba(255,255,255,0.45)" stroke={NAVY} strokeWidth={10} />
        <path d="M -30 -22 Q -20 -38 0 -40" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.9} />
      </g>
    </svg>
  );
};

// ---------- Облака над картой (параллакс) ----------
export const Cloud: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number }> = ({ x, y, s = 1, o = 0.6 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: o }}>
    <g transform={`scale(${s})`}>
      <ellipse cx={0} cy={0} rx={90} ry={36} fill="#FFFFFF" />
      <circle cx={-34} cy={-18} r={34} fill="#FFFFFF" />
      <circle cx={18} cy={-30} r={42} fill="#FFFFFF" />
      <circle cx={62} cy={-6} r={28} fill="#FFFFFF" />
    </g>
  </svg>
);
