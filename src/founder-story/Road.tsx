import { COLORS } from "../config";

// Линия времени, которая превращается в дорогу.
// morph 0 — тонкая линия расписания с делениями, 1 — тёмно-синяя дорога
// с жёлтой разметкой. draw 0…1 — насколько линия прорисована слева направо.
export const Road: React.FC<{
  readonly y: number;
  readonly morph: number;
  readonly draw?: number;
  readonly dashShift?: number;
  readonly x0?: number;
  readonly x1?: number;
}> = ({ y, morph, draw = 1, dashShift = 0, x0 = 90, x1 = 990 }) => {
  const width = 8 + 62 * morph;
  const len = (x1 - x0) * draw;
  return (
    <svg
      width={1080}
      height={200}
      viewBox="0 0 1080 200"
      style={{ position: "absolute", left: 0, top: y - 100 }}
    >
      <line
        x1={x0}
        y1={100}
        x2={x0 + len}
        y2={100}
        stroke={COLORS.navy}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {/* деления расписания исчезают */}
      {Array.from({ length: 10 }, (_, i) => {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / 10;
        if (x > x0 + len) return null;
        return (
          <line
            key={i}
            x1={x}
            y1={78}
            x2={x}
            y2={122}
            stroke={COLORS.navy}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={1 - morph * 1.6}
          />
        );
      })}
      {/* разметка дороги появляется */}
      <line
        x1={x0 + 30}
        y1={100}
        x2={Math.max(x0 + 30, x0 + len - 30)}
        y2={100}
        stroke={COLORS.yellow}
        strokeWidth={8}
        strokeDasharray="34 26"
        strokeDashoffset={-dashShift}
        strokeLinecap="round"
        opacity={Math.max(0, morph * 1.4 - 0.4)}
      />
    </svg>
  );
};
