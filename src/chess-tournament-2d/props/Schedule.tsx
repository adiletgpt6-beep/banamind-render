// Лист дополнительных занятий кружка (один и тот же экземпляр во всех
// планах): «Шахмат», «Кошумча машыгуу», дни и «Аяктоо: 15:00». Строки не
// меняются между планами. (0, 0) — центр листа; w — ширина, высота 1,36·w.
// detail = false — дальний план: строки обозначены полосами того же
// расположения. fold 0…1 — лист сложен пополам (нижняя половина уходит
// под верхнюю). mark 0…1 — жёлтая подсветка строки «15:00».
import { CH2_TEXT } from "../script";
import { C, F } from "../theme";

export const SCHEDULE_RATIO = 1.36;

// Строки листа: доля высоты от верхнего края.
export const SCHEDULE_ROWS = { title: 0.17, sub: 0.3, days: 0.5, end: 0.7 } as const;

export const ScheduleArt: React.FC<{ readonly w: number; readonly detail?: boolean; readonly fold?: number; readonly mark?: number }> = ({ w, detail = true, fold = 0, mark = 0 }) => {
  const h = w * SCHEDULE_RATIO;
  const T = CH2_TEXT.schedule;
  const y0 = -h / 2;
  // при складывании видна только верхняя половина; нижняя сжимается к сгибу
  const k = 1 - fold;
  const bottom = y0 + h / 2 + (h / 2) * k;
  const rowY = (r: number) => y0 + h * r;
  const clipId = `sch-${Math.round(w)}-${Math.round(fold * 100)}`;
  const lines = detail ? (
    <g fontFamily={F.text} fill={C.ink} textAnchor="middle">
      {/* маленький значок короля перед заголовком */}
      <g transform={`translate(${-w * 0.3} ${rowY(SCHEDULE_ROWS.title) - w * 0.06}) scale(${w / 520})`}>
        <rect x={-14} y={6} width={28} height={36} rx={6} fill={C.navy} />
        <rect x={-22} y={40} width={44} height={10} rx={4} fill={C.navy} />
        <rect x={-3} y={-14} width={6} height={20} fill={C.navy} />
        <rect x={-10} y={-8} width={20} height={6} fill={C.navy} />
      </g>
      <text x={w * 0.04} y={rowY(SCHEDULE_ROWS.title)} fontSize={w * 0.12} fontWeight={800} fill={C.navy}>
        {T.title}
      </text>
      <text x={0} y={rowY(SCHEDULE_ROWS.sub)} fontSize={w * 0.068} fontWeight={800} fill={C.inkSoft}>
        {T.sub}
      </text>
      <line x1={-w * 0.38} x2={w * 0.38} y1={rowY(0.38)} y2={rowY(0.38)} stroke="#D7D0C2" strokeWidth={w * 0.006} />
      <text x={0} y={rowY(SCHEDULE_ROWS.days)} fontSize={w * 0.058} fontWeight={500}>
        {T.days}
      </text>
      {mark > 0 ? <rect x={-w * 0.33} y={rowY(SCHEDULE_ROWS.end) - w * 0.085} width={w * 0.66 * mark} height={w * 0.11} rx={w * 0.02} fill={C.yellow} opacity={0.85} /> : null}
      <text x={0} y={rowY(SCHEDULE_ROWS.end)} fontSize={w * 0.075} fontWeight={800} fill={C.navy}>
        {T.end}
      </text>
    </g>
  ) : (
    <g>
      <rect x={-w * 0.24} y={rowY(SCHEDULE_ROWS.title) - w * 0.08} width={w * 0.5} height={w * 0.09} rx={w * 0.02} fill={C.navy} />
      <rect x={-w * 0.32} y={rowY(SCHEDULE_ROWS.sub) - w * 0.05} width={w * 0.64} height={w * 0.05} rx={w * 0.02} fill="#7C8BA3" />
      <rect x={-w * 0.38} y={rowY(SCHEDULE_ROWS.days) - w * 0.05} width={w * 0.76} height={w * 0.045} rx={w * 0.02} fill="#7C8BA3" />
      <rect x={-w * 0.3} y={rowY(SCHEDULE_ROWS.end) - w * 0.06} width={w * 0.6} height={w * 0.06} rx={w * 0.02} fill={C.navy} />
    </g>
  );
  return (
    <g>
      <rect x={-w / 2 + w * 0.02} y={y0 + w * 0.02} width={w} height={bottom - y0} fill="rgba(23,42,70,0.12)" rx={w * 0.01} />
      <clipPath id={clipId}>
        <rect x={-w / 2} y={y0} width={w} height={bottom - y0} />
      </clipPath>
      <rect x={-w / 2} y={y0} width={w} height={bottom - y0} fill="#FFFDF7" stroke="#D8D0C0" strokeWidth={Math.max(1.5, w * 0.006)} rx={w * 0.01} />
      <g clipPath={`url(#${clipId})`}>{lines}</g>
      {fold > 0.02 ? <line x1={-w / 2} x2={w / 2} y1={bottom} y2={bottom} stroke="#CFC6B4" strokeWidth={Math.max(2, w * 0.01)} /> : null}
    </g>
  );
};
