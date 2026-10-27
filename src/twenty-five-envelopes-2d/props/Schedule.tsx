// Расписание уроков нынешней школы Аяна (один и тот же лист во всех
// планах): заголовок «Сабактардын жадыбалы», пять уроков и строка
// «Сабак бүтөт: 13:00». (0, 0) — центр листа; w — ширина, высота 1,36·w.
// detail = false — дальний план: строки обозначены полосами того же
// расположения. mark 0…1 — жёлтая подсветка строки «13:00» (палец мамы).
import { TE2_TEXT } from "../script";
import { C, F } from "../theme";

export const SCHEDULE_RATIO = 1.36;
// Строки: доля высоты от верхнего края.
export const SCHEDULE_ROWS = { title: 0.12, first: 0.25, step: 0.1, end: 0.82 } as const;

export const ScheduleArt: React.FC<{ readonly w: number; readonly detail?: boolean; readonly fold?: number; readonly mark?: number }> = ({ w, detail = true, mark = 0 }) => {
  const h = w * SCHEDULE_RATIO;
  const T = TE2_TEXT.schedule;
  const y0 = -h / 2;
  const rowY = (r: number) => y0 + h * r;
  const lines = detail ? (
    <g fontFamily={F.text} fill={C.ink}>
      <text x={0} y={rowY(SCHEDULE_ROWS.title)} fontSize={w * 0.075} fontWeight={800} fill={C.navy} textAnchor="middle">
        {T.title}
      </text>
      <line x1={-w * 0.4} x2={w * 0.4} y1={rowY(0.16)} y2={rowY(0.16)} stroke="#D7D0C2" strokeWidth={w * 0.006} />
      {T.row.map((r, i) => (
        <text key={r} x={-w * 0.36} y={rowY(SCHEDULE_ROWS.first + i * SCHEDULE_ROWS.step)} fontSize={w * 0.058} fontWeight={500}>
          {r}
        </text>
      ))}
      {mark > 0 ? <rect x={-w * 0.4} y={rowY(SCHEDULE_ROWS.end) - w * 0.08} width={w * 0.8 * mark} height={w * 0.11} rx={w * 0.02} fill={C.yellow} opacity={0.9} /> : null}
      <text x={0} y={rowY(SCHEDULE_ROWS.end)} fontSize={w * 0.07} fontWeight={800} fill={C.navy} textAnchor="middle">
        {T.end}
      </text>
    </g>
  ) : (
    <g>
      <rect x={-w * 0.3} y={rowY(SCHEDULE_ROWS.title) - w * 0.06} width={w * 0.6} height={w * 0.07} rx={w * 0.02} fill={C.navy} />
      {T.row.map((r, i) => (
        <rect key={r} x={-w * 0.36} y={rowY(SCHEDULE_ROWS.first + i * SCHEDULE_ROWS.step) - w * 0.045} width={w * (0.4 + (i % 3) * 0.08)} height={w * 0.045} rx={w * 0.02} fill="#7C8BA3" />
      ))}
      <rect x={-w * 0.32} y={rowY(SCHEDULE_ROWS.end) - w * 0.06} width={w * 0.64} height={w * 0.06} rx={w * 0.02} fill={C.navy} />
    </g>
  );
  return (
    <g>
      <rect x={-w / 2 + w * 0.02} y={y0 + w * 0.02} width={w} height={h} fill="rgba(23,42,70,0.12)" rx={w * 0.01} />
      <rect x={-w / 2} y={y0} width={w} height={h} fill="#FFFDF7" stroke="#D8D0C0" strokeWidth={Math.max(1.5, w * 0.006)} rx={w * 0.01} />
      {lines}
    </g>
  );
};
