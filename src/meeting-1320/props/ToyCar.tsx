// Маленькая синяя игрушечная машинка мальчика — один и тот же предмет во
// всех сценах: синий кузов, светлые окна, две хорошо заметные чёрные шины
// с серыми дисками. (0, 0) — середина между колёсами на опоре (земля/стол);
// len — длина в px; dir 1 — нос вправо.
export const ToyCarArt: React.FC<{ readonly x: number; readonly y: number; readonly len: number; readonly dir?: 1 | -1; readonly rot?: number }> = ({ x, y, len, dir = 1, rot = 0 }) => {
  const k = len / 100;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k * dir} ${k})`}>
      {/* кузов */}
      <path d="M -50 -12 Q -51 -26 -40 -28 L -24 -30 Q -16 -46 -2 -48 L 18 -48 Q 28 -47 34 -32 L 44 -30 Q 52 -28 51 -14 L 50 -10 Q 50 -6 46 -6 L -46 -6 Q -50 -7 -50 -12 Z" fill="#2F6FD6" stroke="#1D4E9E" strokeWidth={2.5} strokeLinejoin="round" />
      {/* окна */}
      <path d="M -18 -31 Q -12 -42 -2 -43 L 6 -43 L 6 -31 Z" fill="#CFE6F7" />
      <path d="M 10 -43 L 17 -43 Q 25 -42 29 -31 L 10 -31 Z" fill="#CFE6F7" />
      {/* блик и фара */}
      <rect x={-40} y={-24} width={30} height={4} rx={2} fill="#7FB0F0" />
      <circle cx={46} cy={-20} r={3} fill="#FFE08A" />
      {/* колёса */}
      {[-30, 30].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-8} r={11} fill="#16181D" />
          <circle cx={cx} cy={-8} r={5} fill="#A9B0BA" />
        </g>
      ))}
    </g>
  );
};

// Машинка как отдельный слой мира сцены (лежит на поверхности).
export const ToyCar: React.FC<{ readonly x: number; readonly y: number; readonly len: number; readonly dir?: 1 | -1; readonly rot?: number }> = (p) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <ToyCarArt {...p} />
  </svg>
);
