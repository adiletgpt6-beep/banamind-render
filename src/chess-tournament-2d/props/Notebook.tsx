// Тетрадь с анализом позиции (одна и та же во всех планах). Левая
// страница — диаграмма задачи (та же позиция, что на доске, со стороны
// белых), правая — короткие записи от руки: «Маселе», «Актар жүрөт» и
// стрелка проверяемого варианта e7 → f7 со знаком вопроса. (0, 0) — центр
// разворота; w — ширина разворота.
import { CH2_TEXT, POSITION_A, isDark, sq, type Piece } from "../script";
import { C, F } from "../theme";
import { PieceArt } from "./Chess";

export const NotebookArt: React.FC<{
  readonly w: number;
  readonly arrow?: number;
  readonly pieces?: readonly Piece[];
  readonly from?: string;
  readonly to?: string;
  readonly mark?: string; // знак у стрелки: «?» — проверяет, «✓» — нашла
}> = ({ w, arrow = 1, pieces = POSITION_A.pieces, from = "e7", to = POSITION_A.tryAt, mark = "?" }) => {
  const h = w * 0.68;
  const page = w / 2;
  const cell = (page * 0.78) / 8;
  const bx = -page + page * 0.11;
  const by = -h / 2 + h * 0.2;
  const center = (name: string) => {
    const s = sq(name);
    return { x: bx + (s.file + 0.5) * cell, y: by + (7 - s.rank + 0.5) * cell };
  };
  const a = center(from);
  const b = center(to);
  return (
    <g>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={10} fill="rgba(23,42,70,0.18)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#FFFDF6" stroke="#CFC6B4" strokeWidth={3} />
      {/* клетка тетради */}
      {Array.from({ length: Math.floor(h / (w * 0.03)) }).map((_, i) => (
        <line key={i} x1={-w / 2 + 6} x2={w / 2 - 6} y1={-h / 2 + (i + 1) * w * 0.03} y2={-h / 2 + (i + 1) * w * 0.03} stroke="#D7E3F2" strokeWidth={1.5} />
      ))}
      <line x1={0} x2={0} y1={-h / 2} y2={h / 2} stroke="#CFC6B4" strokeWidth={4} />
      {/* диаграмма задачи */}
      {Array.from({ length: 64 }).map((_, i) => {
        const f = i % 8;
        const r = 7 - Math.floor(i / 8);
        return <rect key={i} x={bx + f * cell} y={by + (7 - r) * cell} width={cell} height={cell} fill={isDark({ file: f, rank: r }) ? "#C9B79A" : "#FFFDF6"} />;
      })}
      <rect x={bx} y={by} width={cell * 8} height={cell * 8} fill="none" stroke={C.navy} strokeWidth={2.5} />
      {pieces.map((p) => {
        const c = center(p.at);
        return (
          <g key={p.id} transform={`translate(${c.x} ${c.y + cell * 0.4})`}>
            <PieceArt kind={p.kind} white={p.white} s={cell * 0.86} />
          </g>
        );
      })}
      {arrow > 0 ? (
        <g opacity={arrow}>
          <path d={`M ${a.x + cell * 0.2} ${a.y - cell * 0.1} Q ${(a.x + b.x) / 2} ${a.y - cell * 0.9} ${b.x - cell * 0.15} ${b.y - cell * 0.2}`} stroke="#3D63C8" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d={`M ${b.x - cell * 0.15} ${b.y - cell * 0.2} l ${-cell * 0.32} ${-cell * 0.06} M ${b.x - cell * 0.15} ${b.y - cell * 0.2} l ${-cell * 0.08} ${-cell * 0.3}`} stroke="#3D63C8" strokeWidth={3.5} strokeLinecap="round" />
          <text x={b.x + cell * 0.55} y={b.y - cell * 0.55} fontFamily={F.text} fontWeight={800} fontSize={cell * 0.9} fill="#3D63C8">
            {mark}
          </text>
        </g>
      ) : null}
      {/* записи от руки (наклон, синие чернила) */}
      <g fontFamily={F.text} fontWeight={800} fill="#2F4FA8" transform="rotate(-1.5)">
        <text x={page * 0.12} y={-h / 2 + h * 0.2} fontSize={w * 0.05}>
          {CH2_TEXT.notebook}
        </text>
        <text x={page * 0.12} y={-h / 2 + h * 0.34} fontSize={w * 0.036} fontWeight={500}>
          Актар жүрөт
        </text>
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${page * 0.12} ${-h / 2 + h * (0.48 + k * 0.12)} q ${page * 0.2} ${-6} ${page * (0.55 - k * 0.12)} ${2}`} stroke="#2F4FA8" strokeWidth={3} fill="none" opacity={0.75} />
        ))}
      </g>
    </g>
  );
};
