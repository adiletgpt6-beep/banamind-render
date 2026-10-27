// Папин календарь (S07) в стиле референса: лист бумаги, приклеенный
// скотчем по углам, колонки «Атасы» и «Кесиптеш» с круглыми портретами,
// строки времени и пунктирные пустые места. Карточки встреч — с цветной
// полосой сверху (время) и подписью; при переносе карточка приподнимается
// (тень отходит и становится мягче), затем ложится. Карточки школьных
// поездок (Шш/Шр/Бш · «Мектеп») получают метку папы — маленький портрет и
// подпись «Атасы». Портреты — головы из рига (те же лица, что в фильме).
// Все надписи — настоящим текстом (Nunito с ү, ө, ң).
import { C } from "../theme";
import { FONT, roughRect } from "../kit";
import { clamp, easeOut, lerp } from "../rig/motion";
import { Head } from "../rig/Head";
import { CLOSED } from "../context";
import { EXPR, type Expression } from "../rig/pose";
import { LOOKS, type LookId } from "../rig/looks";
import { SchoolMark } from "./Calendar";
import { SD2_TEXT } from "../script";

const D = SD2_TEXT.dad;

export const CARD = {
  work: "#86A9CF", // рабочая встреча
  meet: "#E9A466", // встреча
  school: "#5FA79E", // школа (как рюкзак сына)
  dad: C.yellow, // метка папы
} as const;

// ---------- Портрет в круге ----------
export const Portrait: React.FC<{
  readonly uid: string;
  readonly look: LookId;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly ink: number;
  readonly ring?: string;
  readonly bg?: string;
  readonly turn?: number;
  readonly expr?: Expression;
}> = ({ uid, look: lookId, cx, cy, r, ink, ring = C.ink, bg = "#DCE7EE", turn = 0.1, expr = EXPR.softSmile }) => {
  const look = LOOKS[lookId];
  const b = look.build;
  const k = (r * 0.5) / b.headRy;
  const hy = cy - r * 0.08;
  const top = look.topColor;
  return (
    <g>
      <clipPath id={`${uid}-clip`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <g clipPath={`url(#${uid}-clip)`}>
        <path d={`M ${cx - r * 1.05} ${cy + r * 1.1} Q ${cx - r * 0.95} ${cy + r * 0.5} ${cx} ${cy + r * 0.5} Q ${cx + r * 0.95} ${cy + r * 0.5} ${cx + r * 1.05} ${cy + r * 1.1} Z`} fill={top} stroke={C.ink} strokeWidth={ink * 0.7} />
        <path d={`M ${cx - r * 0.16} ${cy + r * 0.5} L ${cx} ${cy + r * 0.66} L ${cx + r * 0.16} ${cy + r * 0.5} Z`} fill={look.inner} stroke={C.ink} strokeWidth={ink * 0.5} />
        <g transform={`translate(${cx} ${hy}) scale(${k})`}>
          <Head uid={`${uid}-hb`} look={look} cx={0} cy={0} turn={turn} lookX={0} lookY={0} nod={0} expr={expr} mouth={CLOSED} blink={0} hairSway={0} part="back" ink={(ink * 0.8) / k} />
          <Head uid={`${uid}-hf`} look={look} cx={0} cy={0} turn={turn} lookX={0} lookY={0} nod={0} expr={expr} mouth={CLOSED} blink={0} hairSway={0} part="front" ink={(ink * 0.8) / k} />
        </g>
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring} strokeWidth={ink * 1.6} />
      <circle cx={cx} cy={cy} r={r + ink * 0.8} fill="none" stroke={C.ink} strokeWidth={ink * 0.6} opacity={ring === C.ink ? 0 : 1} />
    </g>
  );
};

// Подпись-плашка (скруглённая) с текстом по центру.
export const Pill: React.FC<{ readonly cx: number; readonly cy: number; readonly text: string; readonly size: number; readonly ink: number; readonly fill?: string; readonly color?: string }> = ({ cx, cy, text, size, ink, fill = C.yellow, color = C.ink }) => {
  const w = text.length * size * 0.62 + size * 1.1;
  const h = size * 1.45;
  return (
    <g>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={C.ink} strokeWidth={ink} />
      <text x={cx} y={cy + size * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

// ---------- Лист календаря папы ----------
// Геометрия листа (мировые px вставки): колонки, строки, места карточек.
export const DAD_BOARD = {
  x: 80,
  y: 150,
  w: 920,
  h: 880,
  titleY: 232,
  headY: 340, // центр строки заголовков колонок
  timeX: 168, // центр колонки времени
  cols: [
    { x: 262, w: 330 }, // «Атасы»
    { x: 636, w: 330 }, // «Кесиптеш»
  ],
  rows: [
    { cy: 500, time: D.m2new }, // 10:00
    { cy: 668, time: D.m1.time }, // 12:30
    { cy: 836, time: D.m2.time }, // 13:00
  ],
  slotH: 128,
} as const;

// Место карточки (левый верхний угол) в колонке col, строке row.
export const slotAt = (col: number, row: number) => {
  const c = DAD_BOARD.cols[col];
  const r = DAD_BOARD.rows[row];
  return { x: c.x + 14, y: r.cy - DAD_BOARD.slotH / 2, w: c.w - 28, h: DAD_BOARD.slotH };
};

const Tape: React.FC<{ readonly x: number; readonly y: number; readonly rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-46} y={-16} width={92} height={32} rx={3} fill="#EFE6D2" opacity={0.85} stroke="rgba(36,50,74,0.35)" strokeWidth={2} />
  </g>
);

const DashedSlot: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly ink: number }> = ({ x, y, w, h, ink }) => (
  <rect x={x} y={y} width={w} height={h} rx={12} fill="none" stroke={C.inkSoft} strokeWidth={ink * 0.6} strokeDasharray={`${ink * 3} ${ink * 3}`} opacity={0.55} />
);

// Лист: бумага со скотчем, заголовок, колонки с портретами, время, пустые
// места. Карточки сцена рисует поверх.
export const DadCalendar: React.FC<{ readonly ink: number; readonly uid: string }> = ({ ink, uid }) => {
  const B = DAD_BOARD;
  const bottom = B.y + B.h;
  return (
    <g>
      <rect x={B.x + 10} y={B.y + 14} width={B.w} height={B.h} rx={8} fill={C.shadow} />
      <path d={roughRect(B.x, B.y, B.w, B.h, 8, 201, ink * 0.5)} fill={C.paper} stroke={C.ink} strokeWidth={ink} />
      <Tape x={B.x + 6} y={B.y + 4} rot={-38} />
      <Tape x={B.x + B.w - 6} y={B.y + 4} rot={38} />
      <Tape x={B.x + 6} y={bottom - 4} rot={38} />
      <Tape x={B.x + B.w - 6} y={bottom - 4} rot={-38} />
      <text x={B.x + B.w / 2} y={B.titleY} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={C.ink}>
        {D.title}
      </text>
      <path d={`M ${B.x + 40} ${B.titleY + 34} L ${B.x + B.w - 40} ${B.titleY + 34}`} stroke={C.ink} strokeWidth={ink * 0.8} />
      {/* заголовки колонок: портрет и подпись */}
      <Portrait uid={`${uid}-pd`} look="dadHome" cx={B.cols[0].x + 58} cy={B.headY} r={44} ink={ink} ring={C.yellowDeep} />
      <text x={B.cols[0].x + 116} y={B.headY + 15} fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink}>
        {D.tag}
      </text>
      <Portrait uid={`${uid}-pc`} look="colleague" cx={B.cols[1].x + 58} cy={B.headY} r={44} ink={ink} ring={C.inkSoft} bg="#E4E9E2" turn={-0.1} />
      <text x={B.cols[1].x + 116} y={B.headY + 15} fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink}>
        {D.colleague}
      </text>
      <path d={`M ${B.x + 40} ${B.headY + 64} L ${B.x + B.w - 40} ${B.headY + 64}`} stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.7} />
      {/* разделители колонок */}
      {[B.cols[0].x - 8, B.cols[1].x - 12].map((x) => (
        <path key={x} d={`M ${x} ${B.titleY + 50} L ${x} ${bottom - 40}`} stroke={C.ink} strokeWidth={ink * 0.6} opacity={0.75} />
      ))}
      {/* строки времени и пустые места */}
      {B.rows.map((r, i) => (
        <g key={i}>
          <text x={B.timeX} y={r.cy + 15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.inkSoft}>
            {r.time}
          </text>
          {[0, 1].map((c) => {
            const s = slotAt(c, i);
            return <DashedSlot key={c} x={s.x} y={s.y} w={s.w} h={s.h} ink={ink} />;
          })}
        </g>
      ))}
    </g>
  );
};

// ---------- Карточка встречи ----------
// (x, y) — левый верхний угол; lift 0…1 — приподнята (тень отходит);
// time2/swap — новое время (плавная смена подписи времени).
export const MeetCard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly time: string;
  readonly label: string;
  readonly band: string;
  readonly ink: number;
  readonly lift?: number;
  readonly rot?: number;
  readonly seed?: number;
  readonly time2?: string;
  readonly swap?: number;
}> = ({ x, y, w, h, time, label, band, ink, lift = 0, rot = 0, seed = 211, time2, swap = 0 }) => {
  const up = lift * 10;
  const s = 1 + lift * 0.035;
  const bh = h * 0.36;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const sw = clamp(swap);
  return (
    <g>
      {/* тень: при подъёме отходит вниз-вправо и бледнеет */}
      <rect x={x + 6 + lift * 10} y={y + 8 + lift * 16} width={w} height={h} rx={12} fill={C.shadow} opacity={0.9 - lift * 0.35} />
      <g transform={`translate(${cx} ${cy - up}) rotate(${rot}) scale(${s}) translate(${-cx} ${-cy})`}>
        <path d={roughRect(x, y, w, h, 12, seed, ink * 0.5)} fill="#FFF8E8" stroke={C.ink} strokeWidth={ink} />
        <path d={`M ${x + ink * 0.5} ${y + bh} L ${x + w - ink * 0.5} ${y + bh} L ${x + w - ink * 0.5} ${y + 12} Q ${x + w - ink * 0.5} ${y + ink * 0.5} ${x + w - 12} ${y + ink * 0.5} L ${x + 12} ${y + ink * 0.5} Q ${x + ink * 0.5} ${y + ink * 0.5} ${x + ink * 0.5} ${y + 12} Z`} fill={band} />
        <path d={`M ${x} ${y + bh} L ${x + w} ${y + bh}`} stroke={C.ink} strokeWidth={ink * 0.7} />
        <text x={x + 22} y={y + bh * 0.74} fontFamily={FONT} fontWeight={900} fontSize={bh * 0.7} fill={C.ink} opacity={1 - sw}>
          {time}
        </text>
        {time2 ? (
          <text x={x + 22} y={y + bh * 0.74} fontFamily={FONT} fontWeight={900} fontSize={bh * 0.7} fill={C.ink} opacity={sw}>
            {time2}
          </text>
        ) : null}
        <text x={x + 22} y={y + bh + (h - bh) * 0.6} fontFamily={FONT} fontWeight={900} fontSize={Math.min(40, (h - bh) * 0.46)} fill={C.ink}>
          {label}
        </text>
      </g>
    </g>
  );
};

// ---------- Метка папы ----------
// Маленький портрет папы и подпись «Атасы»; t — кадры от начала
// наклеивания (метка опускается на карточку, без отскока).
export const DadTag: React.FC<{ readonly uid: string; readonly cx: number; readonly cy: number; readonly r: number; readonly ink: number; readonly t: number }> = ({ uid, cx, cy, r, ink, t }) => {
  if (t < 0) return null;
  const p = easeOut(t / 9);
  const s = lerp(1.22, 1, p);
  const lift = 1 - p;
  return (
    <g opacity={clamp(t / 4)}>
      <ellipse cx={cx + r * 0.9 + lift * 10} cy={cy + r * 0.2 + lift * 14} rx={r * 2.1} ry={r * 1.05} fill={C.shadow} opacity={0.6 - lift * 0.3} />
      <g transform={`translate(${cx} ${cy - lift * 12}) scale(${s}) translate(${-cx} ${-cy})`}>
        <rect x={cx - r * 0.2} y={cy - r * 0.58} width={r * 3.6} height={r * 1.16} rx={r * 0.58} fill={CARD.dad} stroke={C.ink} strokeWidth={ink * 0.9} />
        <text x={cx + r * 1.0} y={cy + r * 0.26} fontFamily={FONT} fontWeight={900} fontSize={r * 0.74} fill={C.ink}>
          {D.tag}
        </text>
        <Portrait uid={uid} look="dadHome" cx={cx} cy={cy} r={r} ink={ink * 0.9} ring={C.yellowDeep} />
      </g>
    </g>
  );
};

// ---------- Карточка школьной поездки ----------
// (x, y) — левый верхний угол; dadT — кадры от начала наклеивания метки папы.
export const TripCard: React.FC<{ readonly uid: string; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly day: string; readonly ink: number; readonly dadT?: number; readonly seed?: number }> = ({
  uid,
  x,
  y,
  w,
  h,
  day,
  ink,
  dadT = -1,
  seed = 231,
}) => {
  const bh = h * 0.2;
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x + 6} y={y + 8} width={w} height={h} rx={12} fill={C.shadow} />
      <path d={roughRect(x, y, w, h, 12, seed, ink * 0.5)} fill="#FFF8E8" stroke={C.ink} strokeWidth={ink} />
      <path d={`M ${x + ink * 0.5} ${y + bh} L ${x + w - ink * 0.5} ${y + bh} L ${x + w - ink * 0.5} ${y + 12} Q ${x + w - ink * 0.5} ${y + ink * 0.5} ${x + w - 12} ${y + ink * 0.5} L ${x + 12} ${y + ink * 0.5} Q ${x + ink * 0.5} ${y + ink * 0.5} ${x + ink * 0.5} ${y + 12} Z`} fill={CARD.school} />
      <path d={`M ${x} ${y + bh} L ${x + w} ${y + bh}`} stroke={C.ink} strokeWidth={ink * 0.7} />
      <text x={cx} y={y + bh * 0.72} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={bh * 0.62} fill={C.paper}>
        {day}
      </text>
      <SchoolMark x={cx - w * 0.2} y={y + bh + h * 0.17} s={h * 0.17} ink={ink} />
      <text x={cx - w * 0.04} y={y + bh + h * 0.2} fontFamily={FONT} fontWeight={900} fontSize={h * 0.085} fill={C.inkSoft}>
        {SD2_TEXT.school.end}
      </text>
      <text x={cx} y={y + bh + h * 0.43} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={h * 0.11} fill={C.ink}>
        {D.trip}
      </text>
      {/* место для метки */}
      {dadT < 0 ? <rect x={x + w * 0.1} y={y + h * 0.72} width={w * 0.8} height={h * 0.18} rx={h * 0.09} fill="none" stroke={C.inkSoft} strokeWidth={ink * 0.6} strokeDasharray={`${ink * 3} ${ink * 3}`} opacity={0.5} /> : null}
      <DadTag uid={`${uid}-tag`} cx={x + w * 0.2} cy={y + h * 0.81} r={h * 0.105} ink={ink} t={dadT} />
    </g>
  );
};
