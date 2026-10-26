// Солнце в геометрическом стиле (SVG-слой): круг и лучи-треугольники.
// Неподвижно стоит слева вверху — оно не облетает Землю; свет в 3D-сцене
// направлен отсюда же.
import { PALETTE } from "../styles/palette";

export const GeometricSun: React.FC<{ t: number; opacity: number; x?: number; y?: number; r?: number }> = ({
  t,
  opacity,
  x = 40,
  y = 470,
  r = 120,
}) => {
  if (opacity <= 0.01) return null;
  const rays = 16;
  const rot = t * 4; // очень медленное вращение лучей (градусы)
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#fff3cf" stopOpacity={0.85} />
          <stop offset="35%" stopColor={PALETTE.gold} stopOpacity={0.35} />
          <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="sunCore">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="70%" stopColor="#ffe2a0" />
          <stop offset="100%" stopColor={PALETTE.gold} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 3.6} fill="url(#sunGlow)" />
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {Array.from({ length: rays }, (_, i) => {
          const long = i % 2 === 0;
          const a = (i / rays) * 360;
          const r0 = r * 1.18;
          const r1 = r * (long ? 1.95 : 1.6);
          const w = r * (long ? 0.2 : 0.14);
          return (
            <polygon
              key={i}
              transform={`rotate(${a})`}
              points={`${r0},${-w} ${r1},0 ${r0},${w}`}
              fill={long ? PALETTE.gold : "#f6d58f"}
              opacity={0.95}
            />
          );
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill="url(#sunCore)" />
      <polygon
        transform={`translate(${x} ${y}) rotate(${-rot * 0.5})`}
        points={Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return `${Math.cos(a) * r * 0.62},${Math.sin(a) * r * 0.62}`;
        }).join(" ")}
        fill="none"
        stroke="#fff6dc"
        strokeWidth={3}
        opacity={0.7}
      />
    </svg>
  );
};
