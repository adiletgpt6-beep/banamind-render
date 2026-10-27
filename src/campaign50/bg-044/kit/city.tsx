// 2D-окружение BG-044 с узнаваемым Бишкеком: светлое небо, Ала-Тоо со
// снежными вершинами (два слоя для параллакса), панельные дома 9 и 5 этажей
// с подъездом и козырьком, тополя, дорога с тротуаром, школа «МЕКТЕП»,
// уличная табличка, комната (стена, окно с видом на горы, стол).
// Всё — SVG-группы для общего <Stage> (svg 1080×1920). Детерминировано.
//   <Stage><Sky tone="morning"/><Mountains baseY={900} offset={-t*2}/>…</Stage>
// Земля / тротуар: y — линия, на которой стоят люди и колёса.
import { fontFamily } from "../../../fonts";

const W = 1080;
const H = 1920;
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const Stage: React.FC<{ readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "hidden", ...style }}>
    {children}
  </svg>
);

export type SkyTone = "morning" | "day" | "afternoon" | "evening";
const SKY: Record<SkyTone, readonly [string, string, string]> = {
  morning: ["#BFE1FF", "#DDEEFF", "#FFF2DA"],
  day: ["#AEDBFF", "#D3ECFF", "#F1F8FF"],
  afternoon: ["#B8DDFB", "#E4EEFA", "#FFE7C6"],
  evening: ["#C9D6F6", "#F3DDF0", "#FFE2C2"],
};

export const Sky: React.FC<{ readonly tone?: SkyTone; readonly id?: string; readonly sunX?: number; readonly sunY?: number }> = ({ tone = "day", id = "sky", sunX, sunY }) => {
  const [a, b, c] = SKY[tone];
  const sx = sunX ?? (tone === "morning" ? 250 : tone === "afternoon" ? 820 : tone === "evening" ? 880 : 760);
  const sy = sunY ?? (tone === "morning" ? 520 : tone === "evening" ? 700 : 380);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.55" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset="0.35" stopColor="#FFE58A" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFE58A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${id}-g)`} />
      <circle cx={sx} cy={sy} r={190} fill={`url(#${id}-sun)`} />
      <circle cx={sx} cy={sy} r={62} fill="#FFF3B8" />
    </g>
  );
};

// мягкие облака (сдвиг offset — медленный дрейф)
export const Clouds: React.FC<{ readonly offset?: number; readonly y?: number }> = ({ offset = 0, y = 300 }) => (
  <g opacity={0.95}>
    {[0, 1, 2, 3].map((i) => {
      const x = ((i * 430 + offset) % 1700) - 300;
      const yy = y + (i % 2) * 120 + hash(i) * 60;
      const s = 0.8 + hash(i + 4) * 0.6;
      return (
        <g key={i} transform={`translate(${x} ${yy}) scale(${s})`}>
          <ellipse cx={0} cy={20} rx={120} ry={34} fill="#FFFFFF" />
          <ellipse cx={-40} cy={0} rx={56} ry={44} fill="#FFFFFF" />
          <ellipse cx={30} cy={-12} rx={66} ry={52} fill="#FFFFFF" />
        </g>
      );
    })}
  </g>
);

// Хребет: вершины по детерминированному шуму, повторяется по x (offset).
const ridge = (baseY: number, height: number, seed: number, offset: number, step = 150) => {
  const pts: [number, number][] = [];
  const start = Math.floor((-offset - 400) / step) - 1;
  for (let i = start; i * step + offset < W + 400; i++) {
    const x = i * step + offset;
    const peak = i % 2 === 0;
    const h = peak ? height * (0.62 + 0.38 * hash(i * 1.7 + seed)) : height * (0.25 + 0.25 * hash(i * 2.3 + seed));
    pts.push([x, baseY - h]);
  }
  return pts;
};

const ridgePath = (pts: [number, number][], baseY: number) =>
  `M ${pts[0][0]} ${baseY + 400} ` + pts.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + ` L ${pts[pts.length - 1][0]} ${baseY + 400} Z`;

// снежные шапки: треугольники у вершин выше снеговой линии
const snowPath = (pts: [number, number][], snowY: number) => {
  let d = "";
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    if (y > snowY) continue;
    const [xl, yl] = pts[i - 1];
    const [xr, yr] = pts[i + 1];
    const k = (snowY - y) / Math.max(1, snowY - y + 60);
    const lx = x + (xl - x) * k * 0.55;
    const ly = y + (yl - y) * k * 0.55;
    const rx = x + (xr - x) * k * 0.55;
    const ry = y + (yr - y) * k * 0.55;
    d += `M ${lx.toFixed(1)} ${ly.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${rx.toFixed(1)} ${ry.toFixed(1)} L ${((x + rx) / 2).toFixed(1)} ${(ly + 18).toFixed(1)} L ${x.toFixed(1)} ${(ly + 4).toFixed(1)} L ${((x + lx) / 2).toFixed(1)} ${(ly + 20).toFixed(1)} Z `;
  }
  return d;
};

export const Mountains: React.FC<{ readonly baseY: number; readonly offset?: number; readonly scale?: number; readonly tint?: "day" | "warm" }> = ({ baseY, offset = 0, scale = 1, tint = "day" }) => {
  const far = ridge(baseY, 420 * scale, 3.1, offset * 0.5, 170 * scale);
  const near = ridge(baseY + 30, 290 * scale, 7.7, offset, 140 * scale);
  const farC = tint === "warm" ? "#D6D2EE" : "#CBD8F2";
  const nearC = tint === "warm" ? "#B9C0E6" : "#A9BFE8";
  return (
    <g>
      <path d={ridgePath(far, baseY)} fill={farC} />
      <path d={snowPath(far, baseY - 290 * scale)} fill="#FFFFFF" />
      <path d={ridgePath(near, baseY + 30)} fill={nearC} />
      <path d={snowPath(near, baseY + 30 - 220 * scale)} fill="#FFFFFF" opacity={0.95} />
    </g>
  );
};

// Панельный дом: x — левый край, y — земля, w — ширина. floors 9 или 5.
// Подъезд (дверь с козырьком) — у doorX (доля ширины, по умолчанию 0.5).
export const blockDoor = (x: number, w: number, doorAt = 0.5) => x + w * doorAt;

export const ApartmentBlock: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly floors?: 5 | 9;
  readonly tone?: "beige" | "blue" | "white";
  readonly doorAt?: number;
  readonly seed?: number;
}> = ({ x, y, w = 560, floors = 9, tone = "beige", doorAt = 0.5, seed = 1 }) => {
  const fh = 74;
  const h = floors * fh + 40;
  const wall = tone === "beige" ? "#F3E9DA" : tone === "blue" ? "#E3ECF7" : "#F7F8FA";
  const seam = tone === "beige" ? "#E6D8C3" : tone === "blue" ? "#CCDAEC" : "#E3E7EE";
  const cols = Math.max(3, Math.round(w / 92));
  const cw = w / cols;
  const door = blockDoor(x, w, doorAt);
  const win: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++) {
    const wy = y - 40 - (f + 1) * fh + 16;
    for (let c = 0; c < cols; c++) {
      const wx = x + c * cw + cw * 0.2;
      const ww = cw * 0.6;
      const lit = hash(f * 7 + c * 3 + seed) > 0.75;
      const balcony = (c + f + seed) % 3 === 0 && f > 0;
      win.push(
        <g key={`${f}-${c}`}>
          <rect x={wx} y={wy} width={ww} height={42} rx={3} fill={lit ? "#FFF1BF" : "#BFD6EE"} />
          <rect x={wx + ww / 2 - 1.5} y={wy} width={3} height={42} fill={wall} opacity={0.9} />
          <rect x={wx + 4} y={wy + 4} width={ww * 0.3} height={10} fill="#FFFFFF" opacity={0.55} />
          {balcony ? <rect x={wx - 8} y={wy + 26} width={ww + 16} height={22} rx={2} fill={seam} stroke="#C9B9A2" strokeWidth={2} /> : null}
        </g>,
      );
    }
  }
  return (
    <g>
      <rect x={x + 10} y={y - h + 10} width={w} height={h} fill="#14285A" opacity={0.06} />
      <rect x={x} y={y - h} width={w} height={h} fill={wall} />
      {/* панельные швы */}
      {Array.from({ length: floors }, (_, f) => (
        <rect key={f} x={x} y={y - 40 - (f + 1) * fh} width={w} height={2} fill={seam} />
      ))}
      <rect x={x - 8} y={y - h - 10} width={w + 16} height={16} fill="#C9D3E2" />
      {win}
      {/* цоколь и подъезд */}
      <rect x={x} y={y - 40} width={w} height={40} fill="#D9CDBC" />
      <rect x={door - 52} y={y - 130} width={104} height={130} rx={6} fill="#8C5A3C" />
      <rect x={door - 46} y={y - 124} width={44} height={118} rx={4} fill="#A26B49" />
      <rect x={door + 2} y={y - 124} width={44} height={118} rx={4} fill="#A26B49" />
      <rect x={door - 30} y={y - 108} width={20} height={34} rx={3} fill="#CFE2F4" />
      <rect x={door + 10} y={y - 108} width={20} height={34} rx={3} fill="#CFE2F4" />
      <path d={`M ${door - 90} ${y - 146} L ${door + 90} ${y - 146} L ${door + 76} ${y - 128} L ${door - 76} ${y - 128} Z`} fill="#5B7FC7" />
      <rect x={door - 70} y={y - 6} width={140} height={10} rx={3} fill="#C3B6A3" />
    </g>
  );
};

// Тополь: x — ствол, y — земля, h — высота кроны.
export const Poplar: React.FC<{ readonly x: number; readonly y: number; readonly h?: number; readonly sway?: number; readonly tone?: number }> = ({ x, y, h = 420, sway = 0, tone = 0 }) => {
  const g1 = tone ? "#6DBE6A" : "#5FB563";
  const g2 = tone ? "#8BD47E" : "#7FCB78";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-7} y={-h * 0.28} width={14} height={h * 0.28} rx={4} fill="#8C6A52" />
      <g transform={`rotate(${sway} 0 ${-h * 0.25})`}>
        <ellipse cx={0} cy={-h * 0.62} rx={h * 0.13} ry={h * 0.42} fill={g1} />
        <ellipse cx={-h * 0.03} cy={-h * 0.66} rx={h * 0.08} ry={h * 0.33} fill={g2} />
      </g>
    </g>
  );
};

// Дорога с тротуаром: y — верх тротуара (линия, где стоят люди),
// дорога ниже. offset сдвигает разметку (движение машины / камеры).
export const ROAD = { sidewalk: 70, curb: 14, road: 230 } as const;
export const Road: React.FC<{ readonly y: number; readonly offset?: number; readonly withSidewalk?: boolean }> = ({ y, offset = 0, withSidewalk = true }) => {
  const sw = withSidewalk ? ROAD.sidewalk : 0;
  const ry = y + sw + ROAD.curb;
  const dash = 140;
  const o = ((offset % (dash * 2)) + dash * 2) % (dash * 2);
  return (
    <g>
      {withSidewalk ? (
        <>
          <rect x={0} y={y} width={W} height={sw} fill="#E9E4DC" />
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={((i * 90 + offset) % 1440) - 180} y={y} width={2} height={sw} fill="#D6CFC4" />
          ))}
        </>
      ) : null}
      <rect x={0} y={y + sw} width={W} height={ROAD.curb} fill="#C7C2BA" />
      <rect x={0} y={ry} width={W} height={ROAD.road + 400} fill="#C9D1DD" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={i * dash * 2 - o} y={ry + ROAD.road * 0.55} width={dash} height={12} rx={4} fill="#FFFFFF" opacity={0.9} />
      ))}
      <rect x={0} y={ry + ROAD.road} width={W} height={400} fill="#9ED17E" />
    </g>
  );
};

// Школа: x — центр, y — земля, w — ширина.
export const School: React.FC<{ readonly x: number; readonly y: number; readonly w?: number }> = ({ x, y, w = 760 }) => {
  const h = 330;
  const left = x - w / 2;
  const cols = 7;
  const cw = w / cols;
  return (
    <g>
      <rect x={left + 10} y={y - h + 10} width={w} height={h} fill="#14285A" opacity={0.06} />
      <rect x={left} y={y - h} width={w} height={h} fill="#FFF6E3" />
      <rect x={left - 14} y={y - h - 18} width={w + 28} height={26} rx={4} fill="#E8735A" />
      {[0, 1, 2].map((fl) =>
        Array.from({ length: cols }, (_, c) =>
          c === 3 && fl === 0 ? null : (
            <g key={`${fl}-${c}`}>
              <rect x={left + c * cw + cw * 0.15} y={y - 90 - fl * 96} width={cw * 0.7} height={62} rx={4} fill="#BFD6EE" />
              <rect x={left + c * cw + cw * 0.15 + 5} y={y - 86 - fl * 96} width={cw * 0.25} height={12} fill="#FFFFFF" opacity={0.6} />
            </g>
          ),
        ),
      )}
      {/* вход */}
      <rect x={x - 66} y={y - 120} width={132} height={120} rx={8} fill="#5B7FC7" />
      <rect x={x - 58} y={y - 112} width={56} height={112} rx={4} fill="#86A3DD" />
      <rect x={x + 2} y={y - 112} width={56} height={112} rx={4} fill="#86A3DD" />
      <rect x={x - 110} y={y - 8} width={220} height={12} rx={3} fill="#D8CDBD" />
      <rect x={x - 130} y={y + 4} width={260} height={10} rx={3} fill="#CFC3B1" />
      {/* вывеска */}
      <rect x={x - 150} y={y - h + 30} width={300} height={64} rx={14} fill="#14285A" />
      <text x={x} y={y - h + 76} textAnchor="middle" fontFamily={fontFamily} fontSize={44} fontWeight={900} fill="#FFC90E" letterSpacing={3}>
        МЕКТЕП
      </text>
    </g>
  );
};

// Уличная табличка (синяя, как в городе): x — столб, y — земля.
export const StreetSign: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly scale?: number }> = ({ x, y, text, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-6} y={-330} width={12} height={330} rx={4} fill="#8A97AD" />
    <rect x={-120} y={-360} width={240} height={74} rx={10} fill="#2E5AAC" stroke="#FFFFFF" strokeWidth={6} />
    <text x={0} y={-310} textAnchor="middle" fontFamily={fontFamily} fontSize={42} fontWeight={900} fill="#FFFFFF">
      {text}
    </text>
  </g>
);

// Комната: стена, окно с видом на горы, пол. tone evening — тёплый, но светлый.
export const Room: React.FC<{ readonly tone?: "day" | "evening"; readonly floorY?: number; readonly windowX?: number }> = ({ tone = "day", floorY = 1240, windowX = 560 }) => {
  const wall = tone === "evening" ? "#FBEEDD" : "#F6F1E8";
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={wall} />
      <rect x={0} y={floorY} width={W} height={H - floorY} fill={tone === "evening" ? "#E6CDB0" : "#E9D8C2"} />
      <rect x={0} y={floorY - 16} width={W} height={16} fill="#D9C2A5" />
      {/* окно с видом на Ала-Тоо */}
      <g>
        <rect x={windowX - 10} y={300} width={420} height={420} rx={10} fill="#FFFFFF" />
        <svg x={windowX} y={310} width={400} height={400} viewBox="0 0 1080 1080" preserveAspectRatio="xMidYMid slice">
          <rect width={1080} height={1080} fill={tone === "evening" ? "#F7D9C4" : "#CFE6FF"} />
          <Mountains baseY={760} scale={1.2} tint={tone === "evening" ? "warm" : "day"} />
          <rect y={740} width={1080} height={400} fill={tone === "evening" ? "#D8CBC6" : "#DCE6EF"} />
        </svg>
        <rect x={windowX + 195} y={310} width={10} height={400} fill="#FFFFFF" />
        <rect x={windowX} y={505} width={400} height={10} fill="#FFFFFF" />
        <rect x={windowX - 30} y={720} width={480} height={18} rx={4} fill="#EDE3D6" />
      </g>
      {/* лампа-торшер и картина для уюта */}
      <rect x={120} y={360} width={170} height={130} rx={8} fill="#FFFFFF" />
      <rect x={132} y={372} width={146} height={106} rx={4} fill="#FFE7A3" />
      <circle cx={205} cy={425} r={30} fill="#FFC90E" />
    </g>
  );
};

// Стол: x — левый край, y — верх столешницы, w — ширина.
export const Table: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly legs?: number }> = ({ x, y, w, legs = 300 }) => (
  <g>
    <rect x={x + 30} y={y + 20} width={18} height={legs} fill="#B98A62" />
    <rect x={x + w - 48} y={y + 20} width={18} height={legs} fill="#B98A62" />
    <rect x={x} y={y} width={w} height={26} rx={6} fill="#D7A979" />
    <rect x={x} y={y + 20} width={w} height={8} fill="#C4946A" />
  </g>
);

// Улица «тротуар впереди»: газон за дорогой, дорога (машины), бордюр и
// тротуар у зрителя — люди стоят перед машиной и садятся со стороны
// тротуара. roadTop — верх асфальта; люди стоят на STREET.feet(roadTop).
export const STREET = { road: 190, curb: 12, sidewalk: 92 } as const;
export const streetFeet = (roadTop: number) => roadTop + STREET.road + STREET.curb + 60;
export const streetCarY = (roadTop: number) => roadTop + STREET.road - 40;
export const StreetFloor: React.FC<{ readonly roadTop: number; readonly offset?: number }> = ({ roadTop, offset = 0 }) => {
  const dash = 140;
  const o = ((offset % (dash * 2)) + dash * 2) % (dash * 2);
  const cy = roadTop + STREET.road;
  const sy = cy + STREET.curb;
  return (
    <g>
      <rect x={0} y={roadTop - 16} width={W} height={16} fill="#9ED17E" />
      <rect x={0} y={roadTop} width={W} height={STREET.road} fill="#C9D1DD" />
      <rect x={0} y={roadTop} width={W} height={6} fill="#B7C0CE" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={i * dash * 2 - o} y={roadTop + STREET.road * 0.32} width={dash} height={10} rx={4} fill="#FFFFFF" opacity={0.85} />
      ))}
      <rect x={0} y={cy} width={W} height={STREET.curb} fill="#BDB6AC" />
      <rect x={0} y={sy} width={W} height={STREET.sidewalk} fill="#ECE7DF" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={((((i * 96 + offset) % 1536) + 1536) % 1536) - 240} y={sy} width={3} height={STREET.sidewalk} fill="#D9D1C5" />
      ))}
      <rect x={0} y={sy + STREET.sidewalk} width={W} height={H} fill="#A6D689" />
      <rect x={0} y={sy + STREET.sidewalk} width={W} height={8} fill="#8CC56F" />
      {/* газон у зрителя: кусты и цветы (сдвигаются вместе с улицей) */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = ((((i * 170 + offset * 1.15) % 1530) + 1530) % 1530) - 200;
        const y = sy + STREET.sidewalk + 70 + (i % 3) * 26;
        return (
          <g key={`b${i}`} transform={`translate(${x} ${y})`}>
            <ellipse cx={0} cy={0} rx={78} ry={44} fill="#7CC36B" />
            <ellipse cx={-34} cy={-16} rx={42} ry={34} fill="#8ED07B" />
            <ellipse cx={30} cy={-20} rx={46} ry={36} fill="#8ED07B" />
            {[-40, -6, 28].map((dx, k) => (
              <g key={k} transform={`translate(${dx} ${-34 + (k % 2) * 10})`}>
                <circle r={9} fill={k === 1 ? "#FFFFFF" : "#FFC90E"} />
                <circle r={3.5} fill="#E0A800" />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
};
