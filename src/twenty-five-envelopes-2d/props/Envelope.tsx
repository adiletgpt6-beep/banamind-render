// Конверт — один рисунок для всех планов (на столе сверху, в руке крупно).
// Лицевая сторона: имя одноклассника почерком Аяна и маленькая жёлтая
// звёздочка в углу. Оборот: линии склеенных клапанов и верхний клапан.
//
// Клапан закреплён по линии сгиба (верхний край оборота) и поворачивается
// вокруг неё: open 0 — закрыт (лежит на обороте), 1 — открыт (смотрит
// вверх, видна внутренняя сторона). Пока клапан закрыт, он рисуется поверх
// оборота; открытый — позади вложения (он продолжает переднюю стенку).
// Вложение (записка или рисунок) лежит между стенками и выходит только из
// горловины: снизу его всегда закрывает карман оборота.
//
// turn — переворот (0 — лицом вверх, 1 — оборотом): ширина проекции
// |cos πt|, сторона меняется на ребре. Локальные координаты: центр (0, 0).
import { C, F } from "../theme";
import { clamp } from "../rig/motion";

export const ENV_RATIO = 0.64; // высота / ширина

type Props = {
  readonly w: number;
  readonly name: string;
  readonly turn?: number; // 0 — лицо, 1 — оборот
  readonly open?: number; // клапан 0…1
  readonly out?: number; // вложение выдвинуто из горловины 0…1
  readonly content?: "note" | "drawing";
  readonly empty?: boolean; // вложение вынуто (в руке или на столе)
  readonly lift?: number; // 0 — лежит (контактная тень), 1 — поднят
  readonly shadow?: boolean;
};

const Front: React.FC<{ w: number; h: number; name: string }> = ({ w, h, name }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.025} fill={C.envelope} stroke={C.envelopeLine} strokeWidth={w * 0.008} />
    <rect x={-w / 2} y={h * 0.18} width={w} height={h * 0.32} rx={w * 0.02} fill={C.envelopeShade} opacity={0.35} />
    {/* звёздочка, нарисованная фломастером */}
    <path
      d={starPath(w * 0.36, -h * 0.26, w * 0.055)}
      fill={C.yellow}
      stroke="#E2A50E"
      strokeWidth={w * 0.006}
      strokeLinejoin="round"
    />
    <text x={-w * 0.02} y={h * 0.1} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={h * 0.34} fill={C.pencil}>
      {name}
    </text>
    <path d={`M ${-w * 0.28} ${h * 0.2} Q ${0} ${h * 0.24} ${w * 0.26} ${h * 0.19}`} stroke={C.pencil} strokeWidth={w * 0.008} fill="none" strokeLinecap="round" opacity={0.7} />
  </g>
);

const starPath = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

// Вложение: сложенная записка (линейки) или рисунок (цветные штрихи).
const Insert: React.FC<{ w: number; h: number; kind: "note" | "drawing"; y: number }> = ({ w, h, kind, y }) => {
  const iw = w * 0.86;
  const ih = h * 0.9;
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={-iw / 2} y={-ih / 2} width={iw} height={ih} rx={w * 0.01} fill={kind === "note" ? C.noteSheet : "#FFFFFF"} stroke="#E2DACB" strokeWidth={w * 0.006} />
      {kind === "note"
        ? [0, 1, 2].map((k) => <rect key={k} x={-iw * 0.38} y={-ih * 0.36 + k * ih * 0.13} width={iw * (k === 2 ? 0.5 : 0.76)} height={ih * 0.035} rx={2} fill={C.pencil} opacity={0.55} />)
        : (
          <g>
            <rect x={-iw * 0.4} y={-ih * 0.42} width={iw * 0.8} height={ih * 0.1} rx={4} fill="#9FD0F0" opacity={0.8} />
            <circle cx={iw * 0.3} cy={-ih * 0.32} r={ih * 0.07} fill={C.yellow} />
            <rect x={-iw * 0.36} y={-ih * 0.24} width={iw * 0.18} height={ih * 0.06} rx={3} fill="#E9897A" />
          </g>
        )}
      {/* линия сгиба листа */}
      <line x1={-iw / 2} y1={0} x2={iw / 2} y2={0} stroke="#E6DED0" strokeWidth={w * 0.006} />
    </g>
  );
};

const Back: React.FC<{ w: number; h: number; open: number; out: number; content: "note" | "drawing"; empty: boolean }> = ({ w, h, open, out, content, empty }) => {
  const top = -h / 2;
  const depth = h * 0.58;
  const ang = clamp(open) * Math.PI;
  const apexY = top + depth * Math.cos(ang);
  const inside = Math.cos(ang) < 0;
  const flap = (
    <path
      d={`M ${-w / 2} ${top} L ${w / 2} ${top} L ${w * 0.04} ${apexY} Q 0 ${apexY + (inside ? -1 : 1) * h * 0.03} ${-w * 0.04} ${apexY} Z`}
      fill={inside ? C.envelopeInside : C.envelope}
      stroke={C.envelopeLine}
      strokeWidth={w * 0.008}
      strokeLinejoin="round"
    />
  );
  // вложение выходит вверх из горловины; снизу его закрывает карман
  const insertY = -out * h * 0.95 + h * 0.02;
  return (
    <g>
      {/* внутренняя сторона передней стенки (видна над карманом только в
          горловине) */}
      <rect x={-w / 2} y={top} width={w} height={h} rx={w * 0.025} fill={C.envelopeInside} />
      {inside ? flap : null}
      {!empty && open > 0.35 ? <Insert w={w} h={h} kind={content} y={insertY} /> : null}
      {/* карман оборота: боковые и нижний клапаны */}
      <path d={`M ${-w / 2} ${top + h * 0.06} L ${-w * 0.02} ${h * 0.08} L ${w * 0.02} ${h * 0.08} L ${w / 2} ${top + h * 0.06} L ${w / 2} ${h / 2} L ${-w / 2} ${h / 2} Z`} fill={C.envelope} stroke={C.envelopeLine} strokeWidth={w * 0.008} strokeLinejoin="round" />
      <path d={`M ${-w / 2} ${h / 2} L ${-w * 0.03} ${-h * 0.02} L ${w * 0.03} ${-h * 0.02} L ${w / 2} ${h / 2}`} fill={C.envelopeShade} opacity={0.5} stroke={C.envelopeLine} strokeWidth={w * 0.006} />
      {!inside ? flap : null}
    </g>
  );
};

export const EnvelopeArt: React.FC<Props> = ({ w, name, turn = 0, open = 0, out = 0, content = "note", empty = false, lift = 0, shadow = true }) => {
  const h = w * ENV_RATIO;
  const sx = Math.abs(Math.cos(Math.PI * clamp(turn)));
  const back = turn > 0.5;
  const sh = 4 + lift * w * 0.08;
  return (
    <g>
      {shadow ? <rect x={(-w * Math.max(0.05, sx)) / 2 + sh * 0.6} y={-h / 2 + sh} width={w * Math.max(0.05, sx)} height={h} rx={w * 0.03} fill="rgba(40,28,14,0.22)" opacity={1 - lift * 0.5} /> : null}
      <g transform={`scale(${Math.max(0.02, sx)} 1)`}>{back ? <Back w={w} h={h} open={open} out={out} content={content} empty={empty} /> : <Front w={w} h={h} name={name} />}</g>
    </g>
  );
};
