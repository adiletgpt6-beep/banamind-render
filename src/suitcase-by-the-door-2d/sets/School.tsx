// Школьный двор в Бишкеке — общий для S04 (мама встречает сына) и S10
// (сына забирает папа). Обычная школа без вывески и названия: двух-
// трёхэтажное здание с крыльцом, асфальтированный двор с карагачами,
// ограда с воротами из кирпичных столбов, тротуар, арык с побелёнными
// стволами, дорога. Позади — пятиэтажки, тополя и далёкие горы с
// снежными вершинами в ясную погоду. Вид спереди, с тротуара.
//
// API (координаты — px мира; при камере { x: 540, y: 960, zoom: 1 } мир
// совпадает с кадром 1080×1920):
//   SCHOOL.horizon      — линия горизонта (уровень глаз взрослого);
//   SCHOOL.yardBack     — задний край двора (основание здания), y;
//   SCHOOL.fenceY       — основание ограды (граница двор / тротуар), y;
//   SCHOOL.gate         — проём ворот { x, w } (левый край и ширина) и
//                         высота столбов top (y верха столба);
//   SCHOOL.door         — дверь школы { x, w, y } (y — порог);
//   SCHOOL.sidewalk     — тротуар { top, bottom } (y);
//   SCHOOL.curb / road  — бордюр (y) и проезжая часть { top, bottom, lane };
//   SCHOOL.meet         — где родитель ждёт у ворот (на тротуаре) { x, y };
//   SCHOOL.exit         — где ребёнок появляется во дворе за воротами { x, y };
//   schoolScale(y)      — масштаб глубины (1 на линии SCHOOL.meet): рост
//                         персонажа на глубине y = H.* × schoolScale(y).
// Слои (рисовать по порядку):
//   <SchoolBack ink uid />   — небо, горы, дома, деревья, здание, двор,
//                              тротуар, арык и дорога (вся земля);
//   …персонажи ВО ДВОРЕ (y < SCHOOL.fenceY)…
//   <SchoolFence ink uid />  — ограда, столбы ворот, открытые створки;
//   …персонажи НА ТРОТУАРЕ / у ворот, машина на дороге…
//   <SchoolFront ink uid />  — необязательный передний план: стволы
//                              деревьев у арыка по краям кадра.
//   <TinyPerson …/>          — дальний упрощённый человек (родитель,
//                              ребёнок с рюкзаком) для фона двора.
// Ребёнок, проходящий через ворота, рисуется до ограды, пока он во дворе,
// и после неё, когда вышел (в проёме перекрытий нет — смена слоя незаметна).
import { C } from "../theme";
import { Grain, HatchDefs, PlusMark, roughEllipse, roughPath, roughRect, Svg, noise } from "../kit";

export const SCHOOL = {
  horizon: 760,
  yardBack: 1004,
  fenceY: 1240,
  gate: { x: 206, w: 250, top: 1040 },
  door: { x: 296, w: 132, y: 1004 },
  sidewalk: { top: 1240, bottom: 1474 },
  curb: 1512,
  road: { top: 1524, bottom: 2100, lane: 1760 },
  meet: { x: 790, y: 1392 },
  exit: { x: 340, y: 1150 },
} as const;

export const schoolScale = (y: number) => (y - SCHOOL.horizon) / (SCHOOL.meet.y - SCHOOL.horizon);

const WALL = "#F1E2C2";
const WALL_SHADE = "#E2CDA6";
const ROOF = "#B4785C";
const FENCE = "#5E7468";
const ASPHALT = "#CFCAC0";
const ASPHALT_DARK = "#B9B3A8";
const PAVING = "#E2DACB";

// Крона карагача: несколько неровных овалов с контуром и штриховкой в тени.
const Crown: React.FC<{ x: number; y: number; r: number; ink: number; seed: number; hatch: string; tone?: number }> = ({ x, y, r, ink, seed, hatch, tone = 0 }) => {
  const blobs = [
    [-0.55, 0.15, 0.62],
    [0.5, 0.18, 0.6],
    [0, -0.35, 0.68],
    [-0.15, 0.3, 0.7],
    [0.3, -0.05, 0.6],
  ];
  const col = tone ? C.treeDark : C.tree;
  return (
    <g>
      {blobs.map(([dx, dy, k], i) => (
        <path key={`o${i}`} d={roughEllipse(x + dx * r, y + dy * r, r * k, r * k * 0.86, seed + i, 3)} fill="none" stroke={C.ink} strokeWidth={ink * 2} />
      ))}
      {blobs.map(([dx, dy, k], i) => (
        <path key={`f${i}`} d={roughEllipse(x + dx * r, y + dy * r, r * k, r * k * 0.86, seed + i, 3)} fill={i % 2 ? C.treeDark : col} />
      ))}
      <path d={roughEllipse(x + r * 0.35, y + r * 0.25, r * 0.55, r * 0.4, seed + 9, 2)} fill={`url(#${hatch})`} />
    </g>
  );
};

// Тополь — высокий узкий силуэт (типичен для Бишкека).
const Poplar: React.FC<{ x: number; base: number; h: number; ink: number; seed: number }> = ({ x, base, h, ink, seed }) => {
  const w = h * 0.16;
  const d = `M ${x} ${base - h} Q ${x + w * 0.9} ${base - h * 0.62} ${x + w * 0.62} ${base - h * 0.12} Q ${x} ${base} ${x - w * 0.62} ${base - h * 0.12} Q ${x - w * 0.9} ${base - h * 0.62} ${x} ${base - h} Z`;
  return (
    <g>
      <path d={d} fill={noise(seed) > 0.5 ? C.treeDark : "#93A886"} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={`M ${x} ${base - h * 0.9} L ${x} ${base - h * 0.1}`} stroke={C.greenDeep} strokeWidth={ink * 0.6} opacity={0.6} />
    </g>
  );
};

// Пятиэтажка с балконами (дальний план, светлая).
const Block: React.FC<{ x: number; y: number; w: number; h: number; color: string; ink: number; seed: number }> = ({ x, y, w, h, color, ink, seed }) => {
  const floors = 5;
  const fh = h / floors;
  const cols = Math.max(3, Math.round(w / 70));
  const cw = w / cols;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h + 60} fill={color} stroke={C.ink} strokeWidth={ink * 0.7} />
      <rect x={x - 6} y={y - 10} width={w + 12} height={12} fill="#C9C0B2" stroke={C.ink} strokeWidth={ink * 0.6} />
      {Array.from({ length: floors * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const wx = x + c * cw + cw * 0.22;
        const wy = y + r * fh + fh * 0.22;
        const balcony = c % 3 === 1;
        return (
          <g key={i}>
            <rect x={wx} y={wy} width={cw * 0.56} height={fh * 0.5} fill={noise(seed + i) > 0.82 ? "#F3E4B8" : "#C7D8E0"} stroke={C.ink} strokeWidth={ink * 0.45} />
            {balcony ? <rect x={wx - cw * 0.08} y={wy + fh * 0.36} width={cw * 0.72} height={fh * 0.34} fill="#EFE9DE" stroke={C.ink} strokeWidth={ink * 0.45} /> : null}
          </g>
        );
      })}
    </g>
  );
};

// Здание школы: три этажа, светлые стены, белые рамы, крыльцо с козырьком.
const SchoolBuilding: React.FC<{ ink: number; hatch: string }> = ({ ink, hatch }) => {
  const x0 = 60;
  const x1 = 1020;
  const base = SCHOOL.yardBack;
  const top = 610;
  const d = SCHOOL.door;
  const floors = 3;
  const fh = (base - top - 20) / floors;
  const cols = 8;
  const cw = (x1 - x0) / cols;
  return (
    <g>
      {/* крыша и карниз */}
      <path d={`M ${x0 - 20} ${top} L ${x0 + 30} ${top - 46} L ${x1 - 30} ${top - 46} L ${x1 + 20} ${top} Z`} fill={ROOF} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={roughRect(x0, top, x1 - x0, base - top, 4, 301, ink * 0.4)} fill={WALL} stroke={C.ink} strokeWidth={ink} />
      <rect x={x1 - 160} y={top} width={160} height={base - top} fill={`url(#${hatch})`} opacity={0.6} />
      {/* межэтажные пояса */}
      {[1, 2].map((k) => (
        <rect key={k} x={x0} y={top + 10 + fh * k - 8} width={x1 - x0} height={10} fill={WALL_SHADE} />
      ))}
      {/* окна */}
      {Array.from({ length: floors * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const wx = x0 + c * cw + cw * 0.2;
        const wy = top + 10 + r * fh + fh * 0.16;
        const ww = cw * 0.6;
        const wh = fh * 0.62;
        if (r === floors - 1 && wx + ww > d.x - 30 && wx < d.x + d.w + 30) return null; // над дверью — крыльцо
        return (
          <g key={i}>
            <rect x={wx} y={wy} width={ww} height={wh} rx={3} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.7} />
            <rect x={wx + 6} y={wy + 6} width={ww - 12} height={wh - 12} fill="#BFD6E2" />
            <path d={`M ${wx + ww / 2} ${wy + 6} L ${wx + ww / 2} ${wy + wh - 6} M ${wx + 6} ${wy + wh * 0.36} L ${wx + ww - 6} ${wy + wh * 0.36}`} stroke="#FFFFFF" strokeWidth={5} />
            <path d={`M ${wx + 10} ${wy + wh - 14} L ${wx + ww * 0.4} ${wy + 14}`} stroke="#FFFFFF" strokeWidth={3} opacity={0.5} />
            <rect x={wx - 4} y={wy + wh - 2} width={ww + 8} height={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={ink * 0.5} />
          </g>
        );
      })}
      {/* крыльцо: козырёк, дверь, ступени */}
      <rect x={d.x - 40} y={base - 230} width={d.w + 80} height={20} fill="#D9D2C6" stroke={C.ink} strokeWidth={ink * 0.8} />
      {[d.x - 30, d.x + d.w + 18].map((px) => (
        <rect key={px} x={px} y={base - 210} width={12} height={196} fill="#EDE8DE" stroke={C.ink} strokeWidth={ink * 0.6} />
      ))}
      <rect x={d.x} y={base - 196} width={d.w} height={182} fill="#7E9BB6" stroke={C.ink} strokeWidth={ink * 0.8} />
      <path d={`M ${d.x + d.w / 2} ${base - 196} L ${d.x + d.w / 2} ${base - 14}`} stroke={C.ink} strokeWidth={ink * 0.7} />
      <rect x={d.x + 10} y={base - 184} width={d.w / 2 - 20} height={90} fill="#C9DCE8" />
      <rect x={d.x + d.w / 2 + 10} y={base - 184} width={d.w / 2 - 20} height={90} fill="#C9DCE8" />
      <rect x={d.x - 56} y={base - 14} width={d.w + 112} height={14} fill="#D9D2C6" stroke={C.ink} strokeWidth={ink * 0.6} />
      <rect x={d.x - 74} y={base - 2} width={d.w + 148} height={10} fill="#E6E0D4" stroke={C.ink} strokeWidth={ink * 0.6} />
    </g>
  );
};

// Всё за оградой и вся земля (двор, тротуар, арык, дорога).
export const SchoolBack: React.FC<{ readonly ink: number; readonly uid: string }> = ({ ink, uid }) => {
  const hatch = `${uid}-sh`;
  const S = SCHOOL;
  return (
    <>
      <Svg>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9DFEA" />
            <stop offset="1" stopColor="#EEF4F1" />
          </linearGradient>
        </defs>
        <HatchDefs id={hatch} />
        <rect x={-600} y={-600} width={2400} height={S.horizon + 700} fill={`url(#${uid}-sky)`} />
        {/* лёгкие облака */}
        {[
          [120, 230, 90],
          [760, 170, 120],
          [1180, 300, 80],
        ].map(([cx, cy, r], i) => (
          <path key={i} d={roughEllipse(cx, cy, r, r * 0.32, 400 + i, 3)} fill="#FFFFFF" opacity={0.75} />
        ))}
        {/* горы Ала-Тоо: дальняя гряда и снежные вершины */}
        <path
          d={roughPath(
            [
              [-600, 820],
              [-420, 640],
              [-250, 700],
              [-60, 560],
              [120, 650],
              [300, 540],
              [470, 640],
              [640, 520],
              [820, 630],
              [990, 560],
              [1160, 660],
              [1340, 590],
              [1600, 700],
              [1800, 820],
            ],
            411,
            4,
          ) + " L 1800 960 L -600 960 Z"}
          fill={C.mountain}
          stroke={C.ink}
          strokeWidth={ink * 0.6}
          strokeLinejoin="round"
          opacity={0.9}
        />
        {[
          [-60, 560],
          [300, 540],
          [640, 520],
          [990, 560],
          [1340, 590],
        ].map(([px, py], i) => (
          <path key={i} d={`M ${px - 62} ${py + 46} L ${px} ${py} L ${px + 58} ${py + 44} L ${px + 30} ${py + 36} L ${px + 8} ${py + 52} L ${px - 22} ${py + 34} Z`} fill="#FBFCFB" stroke={C.ink} strokeWidth={ink * 0.45} strokeLinejoin="round" />
        ))}
        {/* пятиэтажки и тополя за школой */}
        <Block x={-380} y={520} w={420} h={330} color="#E9D9C9" ink={ink} seed={7} />
        <Block x={860} y={500} w={460} h={350} color="#DCDCD2" ink={ink} seed={19} />
        <Block x={330} y={470} w={300} h={300} color="#E5DCCB" ink={ink} seed={31} />
        <Poplar x={20} base={720} h={300} ink={ink} seed={1} />
        <Poplar x={96} base={700} h={250} ink={ink} seed={2} />
        <Poplar x={1000} base={690} h={290} ink={ink} seed={3} />
        <Poplar x={1090} base={700} h={240} ink={ink} seed={4} />
        <SchoolBuilding ink={ink} hatch={hatch} />
        {/* двор: асфальт до ограды */}
        <rect x={-600} y={S.yardBack} width={2400} height={S.fenceY - S.yardBack + 4} fill={ASPHALT} />
        <path d={`M -600 ${S.yardBack} L 1800 ${S.yardBack}`} stroke={C.ink} strokeWidth={ink * 0.6} />
        {[1060, 1130, 1200].map((y, i) => (
          <path key={y} d={`M -600 ${y} L 1800 ${y}`} stroke={ASPHALT_DARK} strokeWidth={ink * (0.4 + i * 0.15)} opacity={0.5} />
        ))}
        {/* клумба у крыльца и скамейка */}
        <path d={roughEllipse(560, 1040, 110, 22, 421, 2)} fill="#B8C9A0" stroke={C.ink} strokeWidth={ink * 0.7} />
        {[500, 540, 580, 620].map((x, i) => (
          <circle key={x} cx={x} cy={1032 + (i % 2) * 8} r={8} fill={["#F5C642", "#FFFFFF", "#E6A07A", "#F5C642"][i]} stroke={C.ink} strokeWidth={ink * 0.4} />
        ))}
        <rect x={780} y={1060} width={140} height={14} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={ink * 0.7} />
        <rect x={786} y={1040} width={128} height={12} rx={4} fill={C.wood} stroke={C.ink} strokeWidth={ink * 0.6} />
        {[792, 900].map((x) => (
          <rect key={x} x={x} y={1074} width={10} height={24} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.5} />
        ))}
        {/* карагачи во дворе */}
        {[
          [-30, 1070, 150, 431],
          [990, 1080, 160, 441],
        ].map(([x, y, r, seed]) => (
          <g key={seed}>
            <path d={`M ${x - 16} ${y} L ${x - 10} ${y - r * 1.1} L ${x + 12} ${y - r * 1.1} L ${x + 18} ${y} Z`} fill="#8A6E58" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
            <rect x={x - 16} y={y - 70} width={34} height={70} fill="#F4F1EA" stroke={C.ink} strokeWidth={ink * 0.6} />
            <Crown x={x} y={y - r * 1.45} r={r} ink={ink} seed={seed} hatch={hatch} />
          </g>
        ))}
      </Svg>
      {/* тротуар — плитка с зерном бумаги */}
      <div style={{ position: "absolute", left: -600, top: S.sidewalk.top, width: 2400, height: S.sidewalk.bottom - S.sidewalk.top, backgroundColor: PAVING, overflow: "hidden" }}>
        <Grain opacity={0.45} w={2400} h={S.sidewalk.bottom - S.sidewalk.top} />
      </div>
      <Svg>
        {/* швы плитки (перспектива к горизонту) */}
        {Array.from({ length: 26 }, (_, i) => {
          const x = -600 + i * 100;
          const k = (S.sidewalk.top - S.horizon) / (S.sidewalk.bottom - S.horizon);
          return <path key={i} d={`M ${540 + (x - 540) * k} ${S.sidewalk.top} L ${x} ${S.sidewalk.bottom}`} stroke="#CFC5B2" strokeWidth={ink * 0.5} />;
        })}
        {[1290, 1360, 1440].map((y) => (
          <path key={y} d={`M -600 ${y} L 1800 ${y}`} stroke="#CFC5B2" strokeWidth={ink * 0.5} />
        ))}
        {/* арык: бетонный жёлоб с водой, затем бордюр и дорога */}
        <rect x={-600} y={S.sidewalk.bottom} width={2400} height={S.curb - S.sidewalk.bottom} fill="#B5AFA4" stroke={C.ink} strokeWidth={ink * 0.7} />
        <rect x={-600} y={S.sidewalk.bottom + 10} width={2400} height={S.curb - S.sidewalk.bottom - 20} fill="#8FB3C4" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${-560 + i * 210} ${S.sidewalk.bottom + 20} q 24 -5 48 0`} stroke="#FFFFFF" strokeWidth={ink * 0.6} fill="none" opacity={0.6} />
        ))}
        <rect x={-600} y={S.curb} width={2400} height={S.road.top - S.curb} fill="#EFECE5" stroke={C.ink} strokeWidth={ink * 0.7} />
        <rect x={-600} y={S.road.top} width={2400} height={S.road.bottom - S.road.top} fill="#9E9C98" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-560 + i * 300} y={S.road.lane - 6} width={150} height={12} rx={4} fill="#ECE8DE" opacity={0.85} />
        ))}
        <PlusMark x={160} y={300} color="rgba(36,50,74,0.18)" />
        <PlusMark x={930} y={250} color="rgba(36,50,74,0.18)" />
      </Svg>
    </>
  );
};

// Ограда с воротами (рисуется после тех, кто во дворе).
export const SchoolFence: React.FC<{ readonly ink: number; readonly uid: string }> = ({ ink }) => {
  const S = SCHOOL;
  const g = S.gate;
  const y = S.fenceY;
  const top = y - 150;
  const spans: (readonly [number, number])[] = [
    [-600, g.x - 18],
    [g.x + g.w + 18, 1800],
  ];
  return (
    <Svg>
      {/* открытые внутрь створки ворот */}
      {[
        { px: g.x, dir: 1 },
        { px: g.x + g.w, dir: -1 },
      ].map(({ px, dir }) => (
        <g key={px}>
          <path d={`M ${px} ${top + 4} L ${px + dir * 56} ${top - 22} L ${px + dir * 56} ${y - 32} L ${px} ${y - 4} Z`} fill="none" stroke={FENCE} strokeWidth={ink * 1.6} strokeLinejoin="round" />
          {[0.25, 0.5, 0.75].map((k) => (
            <path key={k} d={`M ${px + dir * 56 * k} ${top + 4 - 26 * k} L ${px + dir * 56 * k} ${y - 4 - 28 * k}`} stroke={FENCE} strokeWidth={ink * 1.2} />
          ))}
        </g>
      ))}
      {spans.map(([a, b]) => (
        <g key={a}>
          {Array.from({ length: Math.floor((b - a) / 28) }, (_, i) => {
            const x = a + 14 + i * 28;
            return (
              <g key={i}>
                <rect x={x - 4} y={top - 10} width={8} height={y - top + 10} fill={FENCE} stroke={C.ink} strokeWidth={ink * 0.45} />
                <path d={`M ${x - 6} ${top - 8} L ${x} ${top - 22} L ${x + 6} ${top - 8} Z`} fill={FENCE} stroke={C.ink} strokeWidth={ink * 0.45} strokeLinejoin="round" />
              </g>
            );
          })}
          <rect x={a} y={top + 6} width={b - a} height={12} fill={FENCE} stroke={C.ink} strokeWidth={ink * 0.6} />
          <rect x={a} y={y - 36} width={b - a} height={12} fill={FENCE} stroke={C.ink} strokeWidth={ink * 0.6} />
        </g>
      ))}
      {/* кирпичные столбы ворот */}
      {[g.x - 46, g.x + g.w].map((px) => (
        <g key={px}>
          <path d={roughRect(px, g.top, 46, y - g.top + 4, 3, px, ink * 0.3)} fill={C.brick} stroke={C.ink} strokeWidth={ink} />
          {Array.from({ length: 7 }, (_, k) => (
            <path key={k} d={`M ${px} ${g.top + 40 + k * 26} L ${px + 46} ${g.top + 40 + k * 26}`} stroke="#D4B08A" strokeWidth={ink * 0.6} />
          ))}
          <rect x={px - 8} y={g.top - 16} width={62} height={18} rx={3} fill="#D9D2C6" stroke={C.ink} strokeWidth={ink * 0.8} />
        </g>
      ))}
    </Svg>
  );
};

// Передний план: стволы деревьев у арыка по краям кадра (с побелкой).
export const SchoolFront: React.FC<{ readonly ink: number; readonly uid: string; readonly xs?: readonly number[] }> = ({ ink, uid, xs = [-40, 1120] }) => (
  <Svg>
    <HatchDefs id={`${uid}-fh`} />
    {xs.map((x, i) => {
      const base = SCHOOL.sidewalk.bottom + 18;
      return (
        <g key={x}>
          <path d={`M ${x - 34} ${base} Q ${x - 22} ${base - 600} ${x - 26} ${-200} L ${x + 30} ${-200} Q ${x + 24} ${base - 600} ${x + 40} ${base} Z`} fill="#8A6E58" stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
          <path d={`M ${x - 34} ${base} Q ${x - 22} ${base - 600} ${x - 26} ${-200} L ${x + 30} ${-200} Q ${x + 24} ${base - 600} ${x + 40} ${base} Z`} fill={`url(#${uid}-fh)`} />
          <path d={`M ${x - 34} ${base} L ${x - 30} ${base - 120} L ${x + 34} ${base - 120} L ${x + 40} ${base} Z`} fill="#F4F1EA" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
          <Crown x={x} y={-60} r={210} ink={ink} seed={460 + i * 5} hatch={`${uid}-fh`} tone={1} />
        </g>
      );
    })}
  </Svg>
);

// Дальний упрощённый человек (фон двора): x, y — между стопами, h — рост.
// kid — ребёнок (с рюкзаком), arm — поднятая рука (машет), facing −1…1.
export const TinyPerson: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly h: number;
  readonly ink: number;
  readonly top: string;
  readonly bottom?: string;
  readonly hair?: string;
  readonly kid?: boolean;
  readonly pack?: string;
  readonly arm?: number;
  readonly step?: number; // −1…1 фаза шага (ноги врозь)
  readonly skirt?: boolean;
}> = ({ x, y, h, ink, top, bottom = "#4A4F5E", hair = "#2A221E", kid = false, pack, arm = 0, step = 0, skirt = false }) => {
  const k = h / 100;
  const head = kid ? 11 : 8.5;
  const hy = kid ? -82 : -88;
  const sh = kid ? -66 : -76;
  const hip = kid ? -38 : -46;
  const st = { stroke: C.ink, strokeWidth: ink / k, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const legW = kid ? 7 : 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx={0} cy={1} rx={14} ry={3} fill={C.shadow} />
      {pack ? <rect x={-11} y={sh - 2} width={22} height={28} rx={7} fill={pack} {...st} /> : null}
      {[-1, 1].map((s) => (
        <path key={s} d={`M ${s * 4} ${hip} L ${s * 5 + step * s * 6} ${-3}`} fill="none" stroke={C.ink} strokeWidth={legW + (2 * ink) / k} strokeLinecap="round" />
      ))}
      {[-1, 1].map((s) => (
        <path key={`l${s}`} d={`M ${s * 4} ${hip} L ${s * 5 + step * s * 6} ${-3}`} fill="none" stroke={skirt ? "#D9B79A" : bottom} strokeWidth={legW} strokeLinecap="round" />
      ))}
      {skirt ? <path d={`M -9 ${hip - 4} L 9 ${hip - 4} L 13 ${hip + 18} L -13 ${hip + 18} Z`} fill={bottom} {...st} /> : null}
      <path d={`M ${-10} ${sh} Q 0 ${sh - 4} 10 ${sh} L 9 ${hip + 2} L -9 ${hip + 2} Z`} fill={top} {...st} />
      <path d={`M -9 ${sh + 2} L -12 ${hip + 4}`} {...st} stroke={C.ink} strokeWidth={5.5 + (2 * ink) / k} />
      <path d={`M -9 ${sh + 2} L -12 ${hip + 4}`} stroke={top} strokeWidth={5.5} strokeLinecap="round" />
      <path d={`M 9 ${sh + 2} L ${12 + arm * 4} ${hip + 4 - arm * 46}`} stroke={C.ink} strokeWidth={5.5 + (2 * ink) / k} strokeLinecap="round" />
      <path d={`M 9 ${sh + 2} L ${12 + arm * 4} ${hip + 4 - arm * 46}`} stroke={top} strokeWidth={5.5} strokeLinecap="round" />
      <circle cx={0} cy={hy} r={head} fill="#E2B08C" {...st} />
      <path d={`M ${-head} ${hy} Q ${-head} ${hy - head * 1.3} 0 ${hy - head * 1.1} Q ${head} ${hy - head * 1.3} ${head} ${hy} Q ${head * 0.4} ${hy - head * 0.5} ${-head} ${hy} Z`} fill={hair} {...st} />
    </g>
  );
};
