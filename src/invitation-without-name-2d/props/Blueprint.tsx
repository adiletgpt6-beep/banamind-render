// Чертёж папы: фасад пятиэтажного здания (контур, окна, вход) и
// конструктивные линии — оси колонн (штрихпунктир), перекрытия, размерные
// линии. Насыщенный синий на белом листе с редкой сеткой. BlueprintArt:
// (0, 0) — центр листа, ширина w, высота w · 0.72. draw — доля
// прорисованных линий (0…1), focus — подсветка оси (0…1, палец сына).
import { C } from "../theme";

export const BLUEPRINT_RATIO = 0.72;

export const BlueprintArt: React.FC<{ readonly w: number; readonly draw?: number; readonly focus?: number; readonly detail?: boolean }> = ({ w, draw = 1, focus = 0, detail = true }) => {
  const u = w / 100;
  const h = w * BLUEPRINT_RATIO;
  const st = (k: number) => ({ strokeDasharray: `${Math.max(0, Math.min(1, draw * 1.3 - k * 0.3)) * 400} 400` });
  const B = C.blue;
  // здание: 40 × 50 единиц, этажи по 9
  const bx = 22;
  const by = 12;
  const bw = 40;
  const bh = 50;
  return (
    <g transform={`translate(${-w / 2} ${-h / 2}) scale(${u})`}>
      <rect x={0} y={0} width={100} height={72} fill="#FDFDFB" stroke="#CFD3DE" strokeWidth={0.4} />
      {detail
        ? Array.from({ length: 9 }).map((_, i) => <line key={`g${i}`} x1={i * 12.5} y1={0} x2={i * 12.5} y2={72} stroke={B} strokeWidth={0.12} opacity={0.18} />)
        : null}
      {/* оси колонн */}
      {[0, 0.5, 1].map((k, i) => (
        <line key={`a${i}`} x1={bx + bw * k} y1={by - 6} x2={bx + bw * k} y2={by + bh + 4} stroke={B} strokeWidth={i === 1 ? 0.5 + focus * 0.5 : 0.5} strokeDasharray="4 1.2 0.8 1.2" opacity={0.8} pathLength={400} style={i === 1 ? {} : undefined} />
      ))}
      {/* контур здания и перекрытия */}
      <path d={`M ${bx} ${by + bh} L ${bx} ${by} L ${bx + bw} ${by} L ${bx + bw} ${by + bh} Z`} fill="none" stroke={B} strokeWidth={1.1} pathLength={400} style={st(0)} />
      {[1, 2, 3, 4].map((k) => (
        <line key={`f${k}`} x1={bx} y1={by + k * 10} x2={bx + bw} y2={by + k * 10} stroke={B} strokeWidth={0.45} pathLength={400} style={st(0.4)} />
      ))}
      {/* окна */}
      {detail
        ? [0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`w${r}${c}`} x={bx + 3 + c * 9.3} y={by + 2.6 + r * 10} width={5.6} height={5} fill="none" stroke={B} strokeWidth={0.4} opacity={Math.max(0, Math.min(1, draw * 2 - 0.8))} />
            )),
          )
        : null}
      {/* вход */}
      <path d={`M ${bx + 16} ${by + bh} L ${bx + 16} ${by + 42} L ${bx + 24} ${by + 42} L ${bx + 24} ${by + bh}`} fill="none" stroke={B} strokeWidth={0.6} pathLength={400} style={st(0.6)} />
      {/* земля */}
      <line x1={bx - 8} y1={by + bh} x2={bx + bw + 8} y2={by + bh} stroke={B} strokeWidth={1.1} pathLength={400} style={st(0.2)} />
      {/* размерная линия */}
      {detail ? (
        <g opacity={Math.max(0, Math.min(1, draw * 2 - 1))}>
          <line x1={bx} y1={by + bh + 5} x2={bx + bw} y2={by + bh + 5} stroke={B} strokeWidth={0.35} />
          <path d={`M ${bx} ${by + bh + 3.6} L ${bx} ${by + bh + 6.4} M ${bx + bw} ${by + bh + 3.6} L ${bx + bw} ${by + bh + 6.4}`} stroke={B} strokeWidth={0.35} />
          <line x1={bx + bw + 5} y1={by} x2={bx + bw + 5} y2={by + bh} stroke={B} strokeWidth={0.35} />
          <path d={`M ${bx + bw + 3.6} ${by} L ${bx + bw + 6.4} ${by} M ${bx + bw + 3.6} ${by + bh} L ${bx + bw + 6.4} ${by + bh}`} stroke={B} strokeWidth={0.35} />
          {/* разрез балки справа */}
          <rect x={74} y={20} width={18} height={12} fill="none" stroke={B} strokeWidth={0.5} />
          <path d="M 77 23 L 89 23 M 83 23 L 83 29 M 79 29 L 87 29" stroke={B} strokeWidth={0.9} />
          <rect x={72} y={56} width={24} height={12} fill="none" stroke={B} strokeWidth={0.4} />
          <line x1={72} y1={60} x2={96} y2={60} stroke={B} strokeWidth={0.3} />
        </g>
      ) : null}
    </g>
  );
};
