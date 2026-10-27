// Бумажная схема Бишкека (вымышленная, но правдоподобная): прямоугольная
// сетка улиц, широкий проспект с тополями, арык, скверы, на дальнем крае —
// горы Ала-Тоо. Никаких реальных адресов. Лист 1000 × 1300 (координаты
// листа совпадают с координатами Stage).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { BG47_TEXT, BG47_VIDEO } from "../script";
import { C } from "./palette";

export const SHEET = { w: 1000, h: 1900 } as const;

// Улицы (оси) — по ним ходят точки и едет машина.
export const STREETS = {
  h: [150, 390, 640, 900, 1120, 1370, 1640],
  v: [110, 330, 560, 790],
  avenue: 640,
} as const;

// Опорные точки листа.
export const SPOT = {
  printed: { x: 445, y: 780 }, // напечатанная точка, из которой выпрыгивает герой
  home: { x: 230, y: 1010 },
  school: { x: 680, y: 520 },
  blueSchool: { x: 895, y: 265 },
  coralHome: { x: 110, y: 470 },
} as const;

const streetW = (y: number) => (y === STREETS.avenue ? 46 : 24);

export const MapSheet: React.FC<{ readonly printedDot?: number; readonly hole?: number; readonly label?: number }> = ({
  printedDot = 1,
  hole = 0,
  label = 1,
}) => {
  const { w, h } = SHEET;
  const parks = [
    { x: 342, y: 912, w: 206, h: 196 },
    { x: 802, y: 1132, w: 198, h: 220 },
    { x: 122, y: 1382, w: 196, h: 246 },
    { x: 572, y: 1652, w: 206, h: 248 },
    { x: 0, y: 162, w: 98, h: 216 },
  ];
  const trees: { x: number; y: number; r: number }[] = [];
  parks.forEach((p, k) => {
    for (let i = 0; i < 9; i++) {
      const tx = p.x + 26 + ((i * 67 + k * 31) % Math.max(30, p.w - 52));
      const ty = p.y + 26 + ((i * 43 + k * 19) % Math.max(30, p.h - 52));
      trees.push({ x: tx, y: ty, r: 13 + ((i + k) % 3) * 3 });
    }
  });
  // кварталы: «дома» сверху — светлые прямоугольники
  const blocks: { x: number; y: number; w: number; h: number }[] = [];
  const xs = [0, ...STREETS.v, w];
  const ys = [0, ...STREETS.h, h];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + (i ? 18 : 6);
      const x1 = xs[i + 1] - (i + 1 < xs.length - 1 ? 18 : 6);
      const y0 = ys[j] + (j ? (ys[j] === STREETS.avenue ? 30 : 18) : 6);
      const y1 = ys[j + 1] - (j + 1 < ys.length - 1 ? (ys[j + 1] === STREETS.avenue ? 30 : 18) : 6);
      if (x1 - x0 < 40 || y1 - y0 < 40) continue;
      if (parks.some((p) => Math.abs(p.x - x0) < 20 && Math.abs(p.y - y0) < 20)) continue;
      // внутри квартала 2–4 «дома»
      const n = 2 + ((i * 3 + j) % 3);
      for (let k = 0; k < n; k++) {
        const bw = (x1 - x0 - 12 * (n - 1)) / n;
        const tall = (i + j + k) % 2 === 0;
        blocks.push({ x: x0 + k * (bw + 12), y: tall ? y0 : y0 + (y1 - y0) * 0.35, w: bw, h: tall ? (y1 - y0) * 0.6 : (y1 - y0) * 0.65 });
      }
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        borderRadius: 6,
        boxShadow: "0 40px 60px rgba(20,40,90,0.18), 0 6px 12px rgba(20,40,90,0.10)",
        overflow: "hidden",
        backgroundColor: C.paper,
      }}
    >
      <Img src={staticFile(`${BG47_VIDEO.assetsDir}/paper.jpg`)} style={{ position: "absolute", inset: 0, width: w, height: h, objectFit: "cover", opacity: 0.9 }} />
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={i % 5 === 0 ? "#EDE3CB" : C.block} />
        ))}
        {parks.map((p, i) => (
          <rect key={`p${i}`} x={p.x} y={p.y} width={p.w} height={p.h} rx={14} fill={C.park} />
        ))}
        {trees.map((t, i) => (
          <circle key={`t${i}`} cx={t.x} cy={t.y} r={t.r} fill={C.parkDark} opacity={0.85} />
        ))}
        {/* арык */}
        <path d="M0 280 C 160 262, 300 300, 470 284 S 780 262, 1000 292" fill="none" stroke={C.water} strokeWidth={13} strokeLinecap="round" />
        {/* улицы: белые полосы с тонкой кромкой */}
        {STREETS.h.map((y) => (
          <g key={`h${y}`}>
            <rect x={0} y={y - streetW(y) / 2 - 2} width={w} height={streetW(y) + 4} fill={C.streetLine} />
            <rect x={0} y={y - streetW(y) / 2} width={w} height={streetW(y)} fill={C.street} />
          </g>
        ))}
        {STREETS.v.map((x) => (
          <g key={`v${x}`}>
            <rect x={x - 14} y={0} width={28} height={h} fill={C.streetLine} />
            <rect x={x - 12} y={0} width={24} height={h} fill={C.street} />
          </g>
        ))}
        {/* перекрёстки поверх кромок */}
        {STREETS.h.flatMap((y) =>
          STREETS.v.map((x) => <rect key={`x${x}-${y}`} x={x - 12} y={y - streetW(y) / 2} width={24} height={streetW(y)} fill={C.street} />),
        )}
        {/* разметка проспекта */}
        <line x1={0} y1={STREETS.avenue} x2={w} y2={STREETS.avenue} stroke="#E8DFC9" strokeWidth={3} strokeDasharray="18 16" />
        {/* сгибы бумаги */}
        {[333, 666].map((x) => (
          <rect key={`f${x}`} x={x - 10} y={0} width={20} height={h} fill="url(#foldV)" />
        ))}
        <rect x={0} y={640} width={w} height={22} fill="url(#foldH)" opacity={0.7} />
        <defs>
          <linearGradient id="foldV" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="rgba(120,100,60,0)" />
            <stop offset="0.48" stopColor="rgba(120,100,60,0.14)" />
            <stop offset="0.52" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="1" stopColor="rgba(120,100,60,0)" />
          </linearGradient>
          <linearGradient id="foldH" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(120,100,60,0)" />
            <stop offset="0.48" stopColor="rgba(120,100,60,0.12)" />
            <stop offset="0.52" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="1" stopColor="rgba(120,100,60,0)" />
          </linearGradient>
        </defs>
        {/* напечатанная точка — из неё выпрыгивает герой; после — пустое место */}
        {hole > 0 ? (
          <circle cx={SPOT.printed.x} cy={SPOT.printed.y} r={40} fill="none" stroke={C.yellowEdge} strokeWidth={5} strokeDasharray="10 9" opacity={hole} />
        ) : null}
        {printedDot > 0 ? (
          <g opacity={printedDot}>
            <circle cx={SPOT.printed.x} cy={SPOT.printed.y} r={40} fill={C.yellow} stroke={C.yellowEdge} strokeWidth={5} />
            <circle cx={SPOT.printed.x} cy={SPOT.printed.y} r={14} fill={C.white} opacity={0.9} />
          </g>
        ) : null}
      </svg>
      {/* картуш у ближнего края */}
      <div
        style={{
          position: "absolute",
          left: 290,
          top: 1290,
          padding: "10px 26px 12px",
          borderRadius: 14,
          backgroundColor: C.white,
          border: `4px solid ${C.navy}`,
          fontFamily,
          color: C.navy,
          opacity: label,
          boxShadow: "0 6px 0 rgba(20,40,90,0.12)",
        }}
      >
        <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: 6, lineHeight: 1 }}>{BG47_TEXT.hook.city}</div>
      </div>
    </div>
  );
};
