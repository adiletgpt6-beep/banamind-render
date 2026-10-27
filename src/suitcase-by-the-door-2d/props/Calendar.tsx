// Школьный календарь-расписание сына: один и тот же лист в S01 (стоит на
// столе «домиком»), S03 (крупно, три дня поездки выделяются жёлтым), S06
// (мама поворачивает его к папе). Будни Дш–Жм, строка «Сабак бүтөт 12:30»,
// маленькие школьные отметки (рюкзак) в каждом дне. Надписи — настоящим
// текстом (шрифт Nunito с ү, ө, ң).
import { C } from "../theme";
import { FONT, roughRect } from "../kit";
import { clamp } from "../rig/motion";
import { SD2_TEXT } from "../script";

const T = SD2_TEXT.school;

// Маленький рюкзак — школьная отметка дня.
export const SchoolMark: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly ink: number; readonly color?: string }> = ({ x, y, s, ink, color = "#4F9A92" }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-s * 0.22} ${-s * 0.42} Q 0 ${-s * 0.62} ${s * 0.22} ${-s * 0.42}`} fill="none" stroke={C.ink} strokeWidth={ink * 0.8} />
    <rect x={-s * 0.36} y={-s * 0.45} width={s * 0.72} height={s * 0.9} rx={s * 0.2} fill={color} stroke={C.ink} strokeWidth={ink * 0.8} />
    <rect x={-s * 0.24} y={s * 0.05} width={s * 0.48} height={s * 0.28} rx={s * 0.08} fill="#3F7F78" stroke={C.ink} strokeWidth={ink * 0.6} />
  </g>
);

// Лист расписания (плоский, вид прямо): x, y — левый верхний угол.
// hi[i] — 0…1 жёлтое выделение столбца i (дни поездки), marks — показать
// школьные отметки; dad[i] — 0…1 метка папы на отметке.
export const ScheduleSheet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly ink: number;
  readonly hi?: readonly number[];
  readonly marks?: boolean;
  readonly title?: boolean;
  readonly seed?: number;
}> = ({ x, y, w, h, ink, hi = [0, 0, 0, 0, 0], marks = true, title = true, seed = 41 }) => {
  const top = title ? h * 0.2 : h * 0.06;
  const colW = (w - w * 0.08) / 5;
  const gx = x + w * 0.04;
  const gy = y + top;
  const gh = h - top - h * 0.06;
  const fs = Math.max(14, colW * 0.3);
  return (
    <g>
      <path d={roughRect(x, y, w, h, 10, seed, ink * 0.5)} fill={C.paper} stroke={C.ink} strokeWidth={ink} />
      {title ? (
        <text x={x + w / 2} y={y + h * 0.13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(h * 0.09, w * 0.075)} fill={C.ink}>
          {T.title}
        </text>
      ) : null}
      {T.week.map((d, i) => {
        const cx = gx + colW * i;
        const k = clamp(hi[i] ?? 0);
        return (
          <g key={d}>
            {k > 0 ? <rect x={cx + 3} y={gy + 3} width={(colW - 6)} height={(gh - 6) * k} rx={8} fill={C.yellowSoft} opacity={0.95} /> : null}
            <rect x={cx} y={gy} width={colW} height={gh} fill="none" stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.75} />
            <text x={cx + colW / 2} y={gy + gh * 0.16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={C.ink}>
              {d}
            </text>
            {marks ? <SchoolMark x={cx + colW / 2} y={gy + gh * 0.45} s={colW * 0.42} ink={ink} /> : null}
            <text x={cx + colW / 2} y={gy + gh * 0.8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={fs * 0.82} fill={C.inkSoft}>
              {T.end}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// Календарь «домиком» на столе (вид спереди чуть сверху): x — левый край,
// y — поверхность стола. Лист расписания на лицевой стороне.
export const TentCalendar: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly ink: number; readonly hi?: readonly number[] }> = ({ x, y, w, ink, hi }) => {
  const h = w * 0.72;
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + 3} rx={w * 0.55} ry={8} fill={C.shadow} />
      {/* задняя опора */}
      <path d={`M ${x + 6} ${y} L ${x + 18} ${y - h} L ${x + w - 18} ${y - h} L ${x + w - 6} ${y}`} fill="#D9CDB4" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <ScheduleSheet x={x} y={y - h} w={w} h={h} ink={ink * 0.9} hi={hi} title={false} />
      {/* пружина сверху */}
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={x + w * (0.15 + i * 0.117)} cy={y - h} r={w * 0.022} fill="none" stroke={C.ink} strokeWidth={ink * 0.7} />
      ))}
    </g>
  );
};
