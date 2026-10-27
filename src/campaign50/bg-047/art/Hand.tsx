// Руки мамы в стиле вырезанной бумаги (вид сверху, тыльная сторона
// ладони). Рисунок в локальных координатах: (0, 0) — рабочая точка
// (кончики пальцев / зажатый предмет / острие карандаша), кисть и рукав
// уходят вниз (+y). Вся рука поворачивается вокруг рабочей точки на angle
// (0 — рука снизу вверх; отрицательный — пришла снизу-слева).
import { C } from "./palette";

export type HandPose = "pinch" | "point" | "pencil" | "open";

const Finger: React.FC<{ readonly pts: readonly (readonly [number, number])[]; readonly w: number; readonly nail?: boolean }> = ({ pts, w, nail = true }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const tip = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const nx = tip[0] - Math.cos(ang) * w * 0.18;
  const ny = tip[1] - Math.sin(ang) * w * 0.18;
  return (
    <g>
      <path d={d} fill="none" stroke={C.skinEdge} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.skin} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {nail ? <ellipse cx={nx} cy={ny} rx={w * 0.26} ry={w * 0.32} transform={`rotate(${(ang * 180) / Math.PI + 90} ${nx} ${ny})`} fill={C.nail} /> : null}
    </g>
  );
};

const Sleeve: React.FC<{ readonly wristY: number; readonly cx: number }> = ({ wristY, cx }) => (
  <g>
    <path d={`M${cx - 78} ${wristY + 30} L ${cx - 92} 1500 L ${cx + 102} 1500 L ${cx + 88} ${wristY + 30} Z`} fill={C.sleeve} stroke={C.sleeveDark} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M${cx - 30} ${wristY + 120} L ${cx - 36} 1500`} stroke={C.sleeveDark} strokeWidth={5} opacity={0.6} />
    <rect x={cx - 84} y={wristY + 4} width={178} height={40} rx={16} fill={C.cuff} stroke={C.sleeveDark} strokeWidth={5} />
  </g>
);

export const Hand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle?: number;
  readonly pose?: HandPose;
  readonly scale?: number;
  readonly flip?: boolean; // левая рука (зеркально)
  readonly holding?: React.ReactNode; // предмет в щепоти (в локальных координатах, центр — 0,0)
  readonly opacity?: number;
}> = ({ x, y, angle = 0, pose = "pinch", scale = 1, flip = false, holding, opacity = 1 }) => {
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: `rotate(${angle}deg) scale(${flip ? -scale : scale}, ${scale})`,
        transformOrigin: "0 0",
        opacity,
        filter: "drop-shadow(0 18px 18px rgba(20,40,90,0.22))",
      }}
    >
      <svg width={400} height={1600} viewBox="-200 -100 400 1600" style={{ position: "absolute", left: -200, top: -100, overflow: "visible" }}>
        {pose === "pinch" ? <Pinch /> : pose === "point" ? <Point /> : pose === "pencil" ? <Pencil /> : <Open />}
      </svg>
      {holding ? <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${flip ? -1 : 1}, 1)` }}>{holding}</div> : null}
    </div>
  );
};

// Щепоть: большой и указательный встречаются в (0, 0).
const Pinch: React.FC = () => (
  <g>
    <Sleeve wristY={232} cx={24} />
    <path d="M-44 128 C -50 180, -40 236, -6 252 L 66 252 C 98 236, 104 176, 96 138 C 80 112, -20 104, -44 128 Z" fill={C.skin} stroke={C.skinEdge} strokeWidth={5} />
    <Finger pts={[[86, 140], [92, 104], [92, 84]]} w={22} />
    <Finger pts={[[62, 126], [68, 82], [66, 62]]} w={25} />
    <Finger pts={[[36, 118], [40, 70], [34, 44]]} w={27} />
    <Finger pts={[[8, 120], [6, 66], [2, 18]]} w={27} />
    <Finger pts={[[-36, 172], [-52, 112], [-34, 50], [-10, 22]]} w={30} />
  </g>
);

// Указательный палец вытянут к (0, 0), остальные поджаты.
const Point: React.FC = () => (
  <g>
    <Sleeve wristY={262} cx={30} />
    <path d="M-30 150 C -40 200, -30 262, 6 280 L 74 280 C 104 264, 112 204, 102 164 C 86 138, -8 128, -30 150 Z" fill={C.skin} stroke={C.skinEdge} strokeWidth={5} />
    <Finger pts={[[92, 166], [100, 134], [96, 124]]} w={23} nail={false} />
    <Finger pts={[[68, 152], [76, 120], [72, 108]]} w={25} nail={false} />
    <Finger pts={[[42, 146], [48, 112], [44, 100]]} w={26} nail={false} />
    <Finger pts={[[10, 150], [6, 80], [0, 4]]} w={27} />
    <Finger pts={[[-24, 200], [-44, 160], [-26, 122]]} w={29} />
  </g>
);

// Карандаш: острие в (0, 0), карандаш лежит в пальцах.
const Pencil: React.FC = () => (
  <g>
    <Sleeve wristY={262} cx={44} />
    {/* карандаш */}
    <g transform="rotate(-24)">
      <rect x={-9} y={22} width={18} height={196} rx={3} fill={C.yellow} stroke={C.navy} strokeWidth={4} />
      <rect x={-9} y={196} width={18} height={22} rx={3} fill="#FF9AA8" stroke={C.navy} strokeWidth={4} />
      <path d="M-9 24 L 0 0 L 9 24 Z" fill="#F6D7AE" stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-3 9 L 0 0 L 3 9 Z" fill={C.navy} />
    </g>
    <path d="M-16 150 C -26 204, -12 262, 22 280 L 92 280 C 122 262, 128 202, 118 160 C 100 132, 4 126, -16 150 Z" fill={C.skin} stroke={C.skinEdge} strokeWidth={5} />
    <Finger pts={[[108, 164], [118, 132], [112, 118]]} w={22} nail={false} />
    <Finger pts={[[84, 150], [92, 112], [84, 98]]} w={24} nail={false} />
    <Finger pts={[[58, 146], [64, 104], [52, 84]]} w={25} />
    <Finger pts={[[30, 150], [42, 96], [30, 52]]} w={26} />
    <Finger pts={[[-6, 196], [-22, 126], [8, 74]]} w={29} />
  </g>
);

// Открытая ладонь вверх (принимает точку): центр ладони в (0, 0).
const Open: React.FC = () => (
  <g>
    <Sleeve wristY={150} cx={0} />
    <Finger pts={[[-58, 40], [-92, -10], [-108, -44]]} w={30} />
    <Finger pts={[[-30, -20], [-40, -90], [-44, -118]]} w={27} />
    <Finger pts={[[-2, -24], [0, -100], [0, -132]]} w={28} />
    <Finger pts={[[26, -20], [36, -92], [40, -120]]} w={27} />
    <Finger pts={[[50, -6], [66, -66], [74, -90]]} w={23} />
    <path d="M-70 -20 C -76 60, -60 140, -20 166 L 40 166 C 76 140, 84 60, 72 -20 C 50 -40, -46 -42, -70 -20 Z" fill={C.skin} stroke={C.skinEdge} strokeWidth={5} />
    <path d="M-40 40 C -10 70, 30 70, 52 40" fill="none" stroke={C.skinEdge} strokeWidth={4} opacity={0.6} strokeLinecap="round" />
  </g>
);
