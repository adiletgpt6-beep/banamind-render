// Незавершённая бумажная лодочка Юсуфа: лист, сложенный пополам, с загнутыми
// к центру уголками (как в начале классической лодочки). fold — доля
// выполненного следующего сгиба (0 — уголки ещё не загнуты, 1 — загнуты).
// Один и тот же вид во всех планах: ориентация не меняется без анимации.
export const PaperCraft: React.FC<{ readonly w: number; readonly fold: number; readonly tilt?: number }> = ({ w, fold, tilt = 0 }) => {
  const h = w * 0.72;
  const f = Math.max(0, Math.min(1, fold));
  const cx = 0;
  const cy = 0;
  // загнутый уголок: вершина идёт от верхнего угла к центральной линии
  const tipL = { x: cx - w / 2 + (w / 2) * f, y: cy - h / 2 + (h * 0.62) * f };
  const tipR = { x: cx + w / 2 - (w / 2) * f, y: cy - h / 2 + (h * 0.62) * f };
  return (
    <g transform={`rotate(${tilt})`}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={2} fill="#F7F4EC" stroke="#D9D2C2" strokeWidth={1.5} />
      {/* линия сгиба пополам */}
      <line x1={cx - w / 2} y1={cy} x2={cx + w / 2} y2={cy} stroke="#D2C9B6" strokeWidth={1.5} />
      {/* нижняя часть чуть темнее — второй слой */}
      <rect x={cx - w / 2} y={cy} width={w} height={h / 2} fill="#ECE7DB" opacity={0.7} />
      {/* загнутые уголки */}
      {f > 0.02 ? (
        <>
          <path d={`M ${cx - w / 2} ${cy - h / 2} L ${tipL.x} ${tipL.y} L ${cx - w / 2} ${cy - h / 2 + h * 0.62 * f} Z`} fill="#FFFFFF" stroke="#D9D2C2" strokeWidth={1.2} />
          <path d={`M ${cx + w / 2} ${cy - h / 2} L ${tipR.x} ${tipR.y} L ${cx + w / 2} ${cy - h / 2 + h * 0.62 * f} Z`} fill="#FFFFFF" stroke="#D9D2C2" strokeWidth={1.2} />
        </>
      ) : null}
    </g>
  );
};
