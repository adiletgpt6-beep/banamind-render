// Рисунки мелом на доске. Рисуются в координатах доски (внутренняя область
// ≈ 588×248 px) и появляются по порядку объяснения: штрих «дорисовывается»
// (dashoffset), затем подпись.
import { fontFamily } from "../../fonts";
import { clamp } from "../rig/motion";
import { L815_TEXT } from "../script";

const CHALK = "#F4F1E6";
const CHALK2 = "#F7D98B";
const stroke = (progress: number, extra: { stroke?: string } = {}) => ({
  fill: "none",
  stroke: CHALK,
  strokeWidth: 3.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - clamp(progress),
  ...extra,
});

const Label: React.FC<{ x: number; y: number; text: string; a: number }> = ({ x, y, text, a }) => (
  <text x={x} y={y} fill={CHALK} fontFamily={fontFamily} fontSize={18} fontWeight={700} textAnchor="middle" opacity={clamp(a)}>
    {text}
  </text>
);

// Рабочий (простая фигурка): голова, корпус, руки — «работа людей».
const Worker: React.FC<{ x: number; y: number; p: number; arm?: string }> = ({ x, y, p, arm = "M -8 -26 L -22 -8" }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={0} cy={-44} r={8} {...stroke(p * 2)} />
    <path d="M 0 -36 L 0 -8 M -10 -4 L 0 -8 L 10 -4" {...stroke(p * 2 - 0.5)} />
    <path d={arm} {...stroke(p * 2 - 0.8)} />
    <path d="M 8 -26 L 20 -12" {...stroke(p * 2 - 1)} />
  </g>
);

// Происхождение бумаги: дерево → древесина → масса из волокон → лист.
// stages — прогресс каждой стадии 0…1 (в порядке объяснения).
export const PaperOriginBoard: React.FC<{ stages: readonly [number, number, number, number] }> = ({ stages }) => {
  const [tree, wood, pulp, sheet] = stages;
  const arrow = (x: number, p: number) => <path d={`M ${x} 120 L ${x + 30} 120 M ${x + 22} 112 L ${x + 30} 120 L ${x + 22} 128`} {...stroke(p)} />;
  return (
    <svg width={588} height={248} viewBox="0 0 588 248" style={{ position: "absolute", left: 0, top: 0 }}>
      {/* дерево: ствол и крона */}
      <g transform="translate(70 0)">
        <path d="M -8 160 L -5 100 L 5 100 L 8 160 Z" {...stroke(tree * 1.5)} />
        <path d="M -5 100 Q -40 90 -42 60 Q -44 30 -20 32 Q -10 10 10 14 Q 40 10 42 40 Q 48 70 20 80 Q 20 98 5 100" {...stroke(tree * 1.5 - 0.3)} />
        <path d="M -30 160 L 30 160" {...stroke(tree)} />
        <Label x={0} y={190} text={L815_TEXT.board.tree} a={tree * 3 - 2} />
      </g>
      {arrow(118, wood)}
      {/* древесина: брёвна с годовыми кольцами, рабочий с пилой */}
      <g transform="translate(204 0)">
        <path d="M -40 118 L 30 118 M -40 150 L 30 150 M -40 118 Q -56 134 -40 150 M 30 118 Q 46 134 30 150" {...stroke(wood * 1.4)} />
        <path d="M -40 126 Q -48 134 -40 142 M -40 132 Q -44 134 -40 136" {...stroke(wood * 1.4 - 0.4)} />
        <path d="M -30 90 L 36 90 M -30 118 L 36 118 M -30 90 Q -46 104 -30 118 M 36 90 Q 52 104 36 118" {...stroke(wood * 1.4 - 0.2)} />
        <Worker x={64} y={116} p={wood} arm="M -8 -26 L -22 -14 L -30 -2" />
        <path d="M 26 102 L 40 112" {...stroke(wood * 1.4 - 0.6, { stroke: CHALK2 })} />
        <Label x={0} y={190} text={L815_TEXT.board.wood} a={wood * 3 - 2} />
      </g>
      {arrow(286, pulp)}
      {/* масса из маленьких волокон: чан, волокна, рабочий размешивает */}
      <g transform="translate(372 0)">
        <path d="M -44 90 L -36 156 L 36 156 L 44 90 Z" {...stroke(pulp * 1.4)} />
        <path d="M -36 110 Q 0 100 36 110" {...stroke(pulp * 1.4 - 0.2)} />
        {[[-24, 122, 10, -4], [-6, 130, 12, 3], [12, 118, 9, -6], [20, 136, 10, 2], [-18, 142, 11, 5], [4, 146, 9, -3]].map(([x, y, l, a], i) => (
          <path key={i} d={`M ${x} ${y} l ${l} ${a}`} {...stroke(pulp * 1.4 - 0.5 - i * 0.05)} />
        ))}
        <Worker x={62} y={108} p={pulp} arm="M -8 -26 L -22 -16 L -34 0" />
        <path d="M -8 92 L 28 108" {...stroke(pulp * 1.4 - 0.6, { stroke: CHALK2 })} />
        <Label x={0} y={190} text={L815_TEXT.board.pulp} a={pulp * 3 - 2} />
      </g>
      {arrow(448, sheet)}
      {/* тонкий слой на сетке, сушится; готовые листы */}
      <g transform="translate(534 0)">
        <path d="M -44 120 L 44 120 L 36 150 L -36 150 Z" {...stroke(sheet * 1.4)} />
        <path d="M -30 130 L 30 130 M -26 140 L 26 140" {...stroke(sheet * 1.4 - 0.3)} />
        <path d="M -24 70 L 24 70 L 24 104 L -24 104 Z" {...stroke(sheet * 1.4 - 0.5)} />
        <path d="M -16 78 L 32 78 L 32 112 L -16 112" {...stroke(sheet * 1.4 - 0.7)} />
        <Worker x={-50} y={116} p={sheet} arm="M -8 -26 L 6 -16 L 18 -8" />
        <Label x={0} y={190} text={L815_TEXT.board.sheet} a={sheet * 3 - 2} />
      </g>
    </svg>
  );
};

// Примеры: пекарь печёт хлеб из муки; плотник делает стол из древесины.
export const ExamplesBoard: React.FC<{ baker: number; carpenter: number }> = ({ baker, carpenter }) => (
  <svg width={588} height={248} viewBox="0 0 588 248" style={{ position: "absolute", left: 0, top: 0 }}>
    <g transform="translate(150 20)">
      <Worker x={-40} y={150} p={baker} arm="M -8 -26 L 8 -20 L 22 -22" />
      {/* колпак пекаря */}
      <path d="M -48 100 Q -40 86 -32 100" {...stroke(baker * 1.5 - 0.6)} />
      {/* мешок муки и хлеб */}
      <path d="M 10 150 L 14 118 Q 30 110 46 118 L 50 150 Z" {...stroke(baker * 1.5 - 0.3)} />
      <path d="M 18 110 L 42 110" {...stroke(baker * 1.5 - 0.5)} />
      <path d="M 70 150 Q 70 124 96 124 Q 122 124 122 150 Z" {...stroke(baker * 1.5 - 0.7)} />
      <path d="M 82 132 L 90 140 M 96 128 L 104 136" {...stroke(baker * 1.5 - 0.9)} />
      <Label x={40} y={185} text={L815_TEXT.board.baker} a={baker * 3 - 2} />
    </g>
    <g transform="translate(400 20)">
      <Worker x={-50} y={150} p={carpenter} arm="M -8 -26 L 8 -24 L 24 -18" />
      {/* доски и стол */}
      <path d="M 0 150 L 40 150 M 0 142 L 40 142 M 0 134 L 40 134" {...stroke(carpenter * 1.5 - 0.3)} />
      <path d="M 60 122 L 140 122 L 140 130 L 60 130 Z M 66 130 L 66 152 M 134 130 L 134 152" {...stroke(carpenter * 1.5 - 0.5)} />
      <path d="M 20 112 L 34 124" {...stroke(carpenter * 1.5 - 0.8, { stroke: CHALK2 })} />
      <Label x={40} y={185} text={L815_TEXT.board.carpenter} a={carpenter * 3 - 2} />
    </g>
  </svg>
);
