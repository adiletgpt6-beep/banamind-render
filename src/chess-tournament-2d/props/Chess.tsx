// Шахматная доска 8×8 и фигуры. Доска задаётся четырьмя углами игрового
// поля в координатах кадра/мира (a1, h1, h8, a8) — так один и тот же
// компонент рисует доску сверху со стороны белых, со стороны папы
// (повёрнутую вместе с камерой) и сбоку в среднем плане. Цвет клетки —
// по правилу: a1 тёмная, h1 светлая («справа внизу светлое поле»).
// Фигуры — узнаваемые силуэты (король с крестом, ферзь с короной, ладья
// с зубцами), всегда вертикальны, с контактной тенью на доске. Поднятая
// фигура рисуется сценой отдельно у пальцев и на клетке в это время её нет.
import { C } from "../theme";
import { isDark, sq, type Piece, type PieceKind } from "../script";
import { lerp, type Vec } from "../rig/motion";

export type BoardQuad = { readonly a1: Vec; readonly h1: Vec; readonly h8: Vec; readonly a8: Vec };

// Точка доски: u — по файлам (0 — край a, 8 — край h), v — по рядам
// (0 — край 1-го ряда, 8 — край 8-го). Билинейная интерполяция углов.
export const boardPoint = (q: BoardQuad, u: number, v: number): Vec => {
  const s = u / 8;
  const t = v / 8;
  const bottom = { x: lerp(q.a1.x, q.h1.x, s), y: lerp(q.a1.y, q.h1.y, s) };
  const top = { x: lerp(q.a8.x, q.h8.x, s), y: lerp(q.a8.y, q.h8.y, s) };
  return { x: lerp(bottom.x, top.x, t), y: lerp(bottom.y, top.y, t) };
};

// Центр клетки («e7») и её размер в кадре (для масштаба фигуры).
export const squareAt = (q: BoardQuad, name: string) => {
  const s = sq(name);
  const c = boardPoint(q, s.file + 0.5, s.rank + 0.5);
  const l = boardPoint(q, s.file, s.rank + 0.5);
  const r = boardPoint(q, s.file + 1, s.rank + 0.5);
  const d = boardPoint(q, s.file + 0.5, s.rank);
  const u = boardPoint(q, s.file + 0.5, s.rank + 1);
  const size = Math.max(Math.hypot(r.x - l.x, r.y - l.y), Math.hypot(u.x - d.x, u.y - d.y));
  return { ...c, size };
};

// ---------- Фигура ----------
// (0, 0) — середина основания; s — ширина клетки; вверх — минус.
const HEIGHT: Record<PieceKind, number> = { K: 1.05, Q: 0.98, R: 0.66, P: 0.6 };

export const PieceArt: React.FC<{ readonly kind: PieceKind; readonly white: boolean; readonly s: number }> = ({ kind, white, s }) => {
  const fill = white ? C.pieceWhite : C.pieceBlack;
  const shade = white ? C.pieceWhiteShade : C.pieceBlackShade;
  const line = white ? "#8F8370" : "#0E0D12";
  const sw = Math.max(1, s * 0.028);
  const H = HEIGHT[kind] * s;
  const bw = s * (kind === "P" ? 0.28 : 0.34); // полуширина основания
  const topW = kind === "R" ? s * 0.2 : kind === "P" ? s * 0.09 : s * 0.12;
  const neckY = -H * (kind === "R" ? 0.72 : 0.7);
  const body = `M ${-bw * 0.72} ${-s * 0.14} C ${-bw * 0.6} ${-H * 0.35} ${-topW * 1.1} ${neckY + s * 0.08} ${-topW} ${neckY} L ${topW} ${neckY} C ${topW * 1.1} ${neckY + s * 0.08} ${bw * 0.6} ${-H * 0.35} ${bw * 0.72} ${-s * 0.14} Z`;
  const head = (() => {
    if (kind === "P") return <circle cx={0} cy={neckY - s * 0.09} r={s * 0.13} fill={fill} stroke={line} strokeWidth={sw} />;
    if (kind === "R") {
      const y = neckY;
      const w = s * 0.25;
      const h = s * 0.2;
      const cw = (w * 2) / 5;
      return (
        <path
          d={`M ${-w} ${y + 2} L ${-w} ${y - h} L ${-w + cw} ${y - h} L ${-w + cw} ${y - h * 0.62} L ${-w + 2 * cw} ${y - h * 0.62} L ${-w + 2 * cw} ${y - h} L ${-w + 3 * cw} ${y - h} L ${-w + 3 * cw} ${y - h * 0.62} L ${-w + 4 * cw} ${y - h * 0.62} L ${-w + 4 * cw} ${y - h} L ${w} ${y - h} L ${w} ${y + 2} Z`}
          fill={fill}
          stroke={line}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      );
    }
    if (kind === "Q") {
      const y = neckY;
      const w = s * 0.2;
      const h = s * 0.2;
      return (
        <g>
          <path
            d={`M ${-w * 0.8} ${y + 2} L ${-w * 1.15} ${y - h} L ${-w * 0.5} ${y - h * 0.55} L 0 ${y - h * 1.15} L ${w * 0.5} ${y - h * 0.55} L ${w * 1.15} ${y - h} L ${w * 0.8} ${y + 2} Z`}
            fill={fill}
            stroke={line}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          {[-1.15, 0, 1.15].map((k) => (
            <circle key={k} cx={w * k} cy={y - h * (k === 0 ? 1.2 : 1.05)} r={s * 0.045} fill={fill} stroke={line} strokeWidth={sw * 0.8} />
          ))}
        </g>
      );
    }
    // король: купол и крест
    const y = neckY;
    const w = s * 0.17;
    return (
      <g>
        <path d={`M ${-w} ${y + 2} C ${-w * 1.1} ${y - s * 0.16} ${w * 1.1} ${y - s * 0.16} ${w} ${y + 2} Z`} fill={fill} stroke={line} strokeWidth={sw} />
        <rect x={-s * 0.03} y={y - s * 0.34} width={s * 0.06} height={s * 0.22} fill={fill} stroke={line} strokeWidth={sw * 0.8} />
        <rect x={-s * 0.09} y={y - s * 0.28} width={s * 0.18} height={s * 0.055} fill={fill} stroke={line} strokeWidth={sw * 0.8} />
      </g>
    );
  })();
  return (
    <g>
      {/* основание */}
      <ellipse cx={0} cy={-s * 0.07} rx={bw} ry={s * 0.1} fill={shade} stroke={line} strokeWidth={sw} />
      <rect x={-bw} y={-s * 0.16} width={bw * 2} height={s * 0.09} fill={fill} stroke={line} strokeWidth={sw} />
      <ellipse cx={0} cy={-s * 0.16} rx={bw} ry={s * 0.07} fill={fill} stroke={line} strokeWidth={sw} />
      {/* тело и тень справа (свет слева сверху) */}
      <path d={body} fill={fill} stroke={line} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M ${topW * 0.3} ${neckY + 4} C ${bw * 0.3} ${-H * 0.35} ${bw * 0.5} ${-s * 0.2} ${bw * 0.62} ${-s * 0.16} L ${bw * 0.72} ${-s * 0.14} C ${bw * 0.6} ${-H * 0.35} ${topW * 1.1} ${neckY + s * 0.08} ${topW} ${neckY} Z`} fill={shade} opacity={0.8} />
      {/* воротник */}
      <ellipse cx={0} cy={neckY + s * 0.02} rx={topW * 1.7} ry={s * 0.045} fill={fill} stroke={line} strokeWidth={sw} />
      {head}
    </g>
  );
};

// Высота фигуры (для захвата пальцами за верхнюю часть).
export const pieceTop = (kind: PieceKind, s: number) => HEIGHT[kind] * s;

// Контактная тень: под основанием; при подъёме (lift, px) бледнеет и
// расплывается.
export const PieceShadow: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly lift?: number }> = ({ x, y, s, lift = 0 }) => {
  const k = Math.min(1, lift / (s * 1.2));
  return <ellipse cx={x + s * 0.06 + k * s * 0.08} cy={y + s * 0.02} rx={s * 0.38 * (1 + 0.3 * k)} ry={s * 0.12 * (1 + 0.2 * k)} fill="rgba(23,30,50,0.32)" opacity={1 - 0.6 * k} />;
};

// ---------- Доска ----------
export type BoardPiece = Piece & {
  // фигура поднята: на доске её нет (рисуется у руки сценой)
  readonly held?: boolean;
};

export const Board: React.FC<{
  readonly q: BoardQuad;
  readonly pieces: readonly BoardPiece[];
  readonly scale?: number; // размер фигур относительно клетки
  readonly edge?: number; // ширина рамки (в клетках)
  readonly thickness?: number; // видимый торец доски (px)
  readonly glow?: number; // тёплый свет лампы 0…1
  readonly highlight?: string; // клетка, которую сейчас рассматривают
}> = ({ q, pieces, scale = 1, edge = 0.45, thickness = 0, glow = 0, highlight }) => {
  const pt = (u: number, v: number) => boardPoint(q, u, v);
  const poly = (ps: Vec[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
  const outer = [pt(-edge, -edge), pt(8 + edge, -edge), pt(8 + edge, 8 + edge), pt(-edge, 8 + edge)];
  // ближний к камере край (два нижних угла) — для торца
  const lowest = [...outer].sort((a, b) => b.y - a.y).slice(0, 2).sort((a, b) => a.x - b.x);
  const squares: React.ReactNode[] = [];
  for (let f = 0; f < 8; f++)
    for (let r = 0; r < 8; r++) {
      const dark = isDark({ file: f, rank: r });
      squares.push(<polygon key={`${f}${r}`} points={poly([pt(f, r), pt(f + 1, r), pt(f + 1, r + 1), pt(f, r + 1)])} fill={dark ? C.boardDark : C.boardLight} />);
    }
  const hl = highlight
    ? (() => {
        const s = sq(highlight);
        return <polygon points={poly([pt(s.file, s.rank), pt(s.file + 1, s.rank), pt(s.file + 1, s.rank + 1), pt(s.file, s.rank + 1)])} fill={C.yellow} opacity={0.45} />;
      })()
    : null;
  // фигуры — от дальних к ближним (по y основания)
  const placed = pieces
    .filter((p) => !p.held)
    .map((p) => ({ p, at: squareAt(q, p.at) }))
    .sort((a, b) => a.at.y - b.at.y);
  return (
    <g>
      {thickness > 0 ? <polygon points={poly([lowest[0], lowest[1], { x: lowest[1].x, y: lowest[1].y + thickness }, { x: lowest[0].x, y: lowest[0].y + thickness }])} fill="#5E3E28" /> : null}
      <polygon points={poly(outer)} fill={C.boardEdge} />
      {squares}
      {hl}
      <polygon points={poly([pt(0, 0), pt(8, 0), pt(8, 8), pt(0, 8)])} fill="none" stroke="#5E3E28" strokeWidth={Math.max(1, squareAt(q, "d4").size * 0.03)} />
      {glow > 0 ? <polygon points={poly(outer)} fill="rgba(255,196,110,1)" opacity={0.14 * glow} /> : null}
      {placed.map(({ p, at }) => (
        <PieceShadow key={`sh-${p.id}`} x={at.x} y={at.y} s={at.size * scale} />
      ))}
      {placed.map(({ p, at }) => (
        <g key={p.id} transform={`translate(${at.x} ${at.y + at.size * scale * 0.08})`}>
          <PieceArt kind={p.kind} white={p.white} s={at.size * scale} />
        </g>
      ))}
    </g>
  );
};

// Фигура вне доски (в руке, над клеткой) с тенью на доске под ней.
export const FreePiece: React.FC<{ readonly kind: PieceKind; readonly white: boolean; readonly x: number; readonly y: number; readonly s: number; readonly lift: number; readonly shadow?: boolean }> = ({ kind, white, x, y, s, lift, shadow = true }) => (
  <g>
    {shadow ? <PieceShadow x={x} y={y} s={s} lift={lift} /> : null}
    <g transform={`translate(${x} ${y - lift + s * 0.08})`}>
      <PieceArt kind={kind} white={white} s={s} />
    </g>
  </g>
);
