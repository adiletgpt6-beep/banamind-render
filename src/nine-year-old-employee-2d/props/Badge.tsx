// Б. Шуточный бейдж «Бектур / Жардамчы» — один и тот же предмет во всех
// сценах: белая карточка с синей полосой, рисунок-солнышко, металлическая
// клипса сверху.
// BadgeArt рисуется в своей системе: (0, 0) — центр карточки, ширина w,
// клипса над верхним краем (точка захвата — CLIP_Y · w).
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";

export const BADGE_RATIO = 0.7; // высота / ширина карточки
export const CLIP_Y = -0.5; // верх клипсы относительно центра (в долях w)

export const BadgeArt: React.FC<{ readonly w: number; readonly detail?: boolean }> = ({ w, detail = true }) => {
  const h = w * BADGE_RATIO;
  const r = w * 0.06;
  return (
    <g>
      {/* клипса: металлическая скоба и петля */}
      <rect x={-w * 0.1} y={-h / 2 - w * 0.16} width={w * 0.2} height={w * 0.2} rx={w * 0.04} fill="#B8BEC8" />
      <rect x={-w * 0.06} y={-h / 2 - w * 0.12} width={w * 0.12} height={w * 0.07} rx={w * 0.02} fill="#8A919C" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={C.white} stroke={C.ink} strokeWidth={Math.max(1.2, w * 0.018)} />
      {/* синяя полоса сверху */}
      <path d={`M ${-w / 2 + r} ${-h / 2} L ${w / 2 - r} ${-h / 2} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + r} L ${w / 2} ${-h / 2 + h * 0.24} L ${-w / 2} ${-h / 2 + h * 0.24} L ${-w / 2} ${-h / 2 + r} Q ${-w / 2} ${-h / 2} ${-w / 2 + r} ${-h / 2} Z`} fill={C.blue} />
      {/* простой рисунок: солнышко */}
      <circle cx={-w * 0.3} cy={h * 0.12} r={w * 0.1} fill={C.yellow} stroke={C.ink} strokeWidth={Math.max(0.8, w * 0.01)} />
      {detail
        ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i * Math.PI) / 4;
            return <line key={i} x1={-w * 0.3 + Math.cos(a) * w * 0.13} y1={h * 0.12 + Math.sin(a) * w * 0.13} x2={-w * 0.3 + Math.cos(a) * w * 0.17} y2={h * 0.12 + Math.sin(a) * w * 0.17} stroke={C.orange} strokeWidth={w * 0.018} strokeLinecap="round" />;
          })
        : null}
      {detail ? (
        <>
          <text x={-w * 0.12} y={h * 0.08} fontFamily={F.display} fontWeight={900} fontSize={w * 0.15} fill={C.ink}>
            {NY2_TEXT.badge.name}
          </text>
          <text x={-w * 0.12} y={h * 0.3} fontFamily={F.text} fontWeight={800} fontSize={w * 0.1} fill={C.blue}>
            {NY2_TEXT.badge.role}
          </text>
        </>
      ) : (
        <>
          <rect x={-w * 0.12} y={-h * 0.02} width={w * 0.5} height={h * 0.1} rx={h * 0.05} fill={C.ink} />
          <rect x={-w * 0.12} y={h * 0.18} width={w * 0.4} height={h * 0.08} rx={h * 0.04} fill={C.blue} />
        </>
      )}
    </g>
  );
};
