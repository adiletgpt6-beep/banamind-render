// Переход «молния»: светлая полоса с жёлтой лентой-молнией по переднему
// краю проходит по кадру слева направо; склейка сцен спрятана под ней
// (кадр at). Мотив героя-рюкзака, без вспышек.
import { useCurrentFrame } from "remotion";
import { C } from "./palette";
import { easeInOut } from "./rig/motion";

const DUR = 18;

export const ZipWipe: React.FC<{ readonly at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const u = (f - (at - DUR / 2)) / DUR;
  if (u <= 0 || u >= 1) return null;
  // передний край: от −300 до 1080+2600 (полоса шириной 2600 закрывает кадр в момент склейки)
  const lead = -300 + easeInOut(u) * (1380 + 2600);
  const w = 2600;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <g transform="rotate(-10 540 960)">
        <rect x={lead - w} y={-600} width={w} height={3120} fill={C.cream} />
        <rect x={lead - 70} y={-600} width={70} height={3120} fill={C.yellow} />
        <line x1={lead - 35} y1={-600} x2={lead - 35} y2={2520} stroke={C.bagTrim} strokeWidth={22} strokeDasharray="11 11" />
        <g transform={`translate(${lead - 35} ${960 + (u - 0.5) * 200})`}>
          <rect x={-40} y={-34} width={80} height={68} rx={18} fill={C.metal} stroke={C.bagTrim} strokeWidth={8} />
          <path d="M -26 30 L 26 30 L 18 130 Q 0 146 -18 130 Z" fill={C.yellow} stroke={C.bagTrim} strokeWidth={8} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};
