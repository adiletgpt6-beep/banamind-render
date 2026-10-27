// Календарь предлагаемой роли (постановочный пример для ясности сюжета):
// график будущей рабочей недели («Келерки аптанын графиги», выбран
// понедельник — так же каждый будний день). Две колонки — Айжан и муж — и
// линия «14:30 · Сабак бүтөт» (дочь нужно забрать). Внимание по одному:
// её встреча 14:00–15:00 → линия окончания уроков пересекает её встречу →
// колонка мужа и его встреча 14:00–15:30 → жёлтый акцент пересечения обеих.
// Второстепенных мелких строк нет.
// shift — попытка переставить встречи: блоки уходят вниз и возвращаются
// на занятые места (сцена вариантов).
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../rig/motion";
import { UL2_CAL } from "../script";
import { C } from "../theme";
import { Icon } from "./Icons";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
export const CAL_PURPLE = "#B79CF2";
const MOM_FILL = "#EDE5FD";
const MOM_LINE = "#9B7BE6";
const DAD_FILL = "#E3EDFB";
const DAD_LINE = "#6E9BE0";

export type CalendarView = {
  readonly momHL: number; // 0…1 подсветка её встречи
  readonly dadShow: number; // 0…1 колонка мужа
  readonly dadHL: number;
  readonly schoolShow: number; // 0…1 линия окончания уроков
  readonly schoolHL: number; // 0…1 жёлтый акцент пересечения
  readonly momDim?: number; // 0…1 её встреча приглушена (внимание на другом)
  readonly shift?: number; // 0…1 блоки сдвинуты (попытка переставить)
  readonly f: number;
};

// Геометрия сетки (проектные px карточки 940 × ≈1060).
const TOP = 360;
const HOUR = 190;
export const calY = (h: number) => TOP + (h - UL2_CAL.hours[0]) * HOUR;
export const CAL_COL = [
  { x: 150, w: 360 },
  { x: 540, w: 370 },
] as const;

const Block: React.FC<{ x: number; w: number; from: number; to: number; fill: string; line: string; label: string; time: string; hl: number; dy: number; a: number }> = ({ x, w, from, to, fill, line, label, time, hl, dy, a }) => (
  <div
    style={box({
      left: x,
      top: calY(from) + 5 + dy,
      width: w,
      height: calY(to) - calY(from) - 10,
      borderRadius: 24,
      backgroundColor: fill,
      border: `${4 + 2 * hl}px solid ${line}`,
      boxSizing: "border-box",
      padding: "10px 22px",
      opacity: a,
      boxShadow: hl > 0.05 ? `0 0 0 ${10 * hl}px ${line}33` : "none",
    })}
  >
    {/* время — сверху, название — у нижнего края (линия 14:30 проходит между ними) */}
    <div style={{ fontSize: 38, fontWeight: 900, color: C.ink, lineHeight: 1.1 }}>{time}</div>
    <div style={{ position: "absolute", left: 22, bottom: 10, fontSize: 36, fontWeight: 800, color: C.inkSoft, lineHeight: 1.1 }}>{label}</div>
  </div>
);

export const CalendarCard: React.FC<{ readonly v: CalendarView }> = ({ v }) => {
  const sy = calY(UL2_CAL.schoolAt);
  const shift = clamp(v.shift ?? 0);
  const dy = shift * 1.15 * HOUR;
  const momA = 1 - 0.5 * clamp(v.momDim ?? 0);
  return (
    <div style={box({ inset: 0, backgroundColor: C.card, fontFamily, color: C.ink })}>
      {/* шапка: «Жаңы команда», «Келерки аптанын графиги», неделя */}
      <div style={box({ left: 34, top: 30, display: "flex", alignItems: "center", gap: 18 })}>
        <div style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: CAL_PURPLE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon id="calendar" size={44} color={C.ink} stroke={4} />
        </div>
        <div>
          <div style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.05 }}>{UL2_CAL.title}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.inkSoft }}>{UL2_CAL.subtitle}</div>
        </div>
      </div>
      <div style={box({ left: 34, right: 34, top: 152, display: "flex", gap: 12 })}>
        {UL2_CAL.week.map((d, i) => (
          <div key={d} style={{ flex: 1, height: 64, borderRadius: 18, backgroundColor: i === 0 ? CAL_PURPLE : "#EEF2F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, color: i === 0 ? C.ink : C.inkSoft }}>
            {d}
          </div>
        ))}
      </div>
      {/* заголовки колонок */}
      {[UL2_CAL.mom.who, UL2_CAL.dad.who].map((who, i) => (
        <div key={who} style={box({ left: CAL_COL[i].x, top: 262, width: CAL_COL[i].w, display: "flex", alignItems: "center", gap: 12, fontSize: 40, fontWeight: 900, opacity: i ? v.dadShow : momA })}>
          <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: i ? DAD_LINE : MOM_LINE }} />
          {who}
        </div>
      ))}
      {/* часы и линии сетки */}
      {UL2_CAL.hours.map((h) => (
        <div key={h}>
          <div style={box({ left: 30, top: calY(h) - 20, width: 110, fontSize: 32, fontWeight: 800, color: C.inkSoft })}>{`${h}:00`}</div>
          <div style={box({ left: 140, right: 30, top: calY(h), height: 2, backgroundColor: C.cardLine })} />
        </div>
      ))}
      {/* её встреча 14:00–15:00 */}
      <Block x={CAL_COL[0].x} w={CAL_COL[0].w} from={UL2_CAL.mom.from} to={UL2_CAL.mom.to} fill={MOM_FILL} line={MOM_LINE} label={UL2_CAL.mom.label} time={UL2_CAL.mom.time} hl={v.momHL} dy={dy} a={momA} />
      {/* его встреча 14:00–15:30 */}
      <Block x={CAL_COL[1].x} w={CAL_COL[1].w} from={UL2_CAL.dad.from} to={UL2_CAL.dad.to} fill={DAD_FILL} line={DAD_LINE} label={UL2_CAL.dad.label} time={UL2_CAL.dad.time} hl={v.dadHL} dy={dy * 0.9} a={v.dadShow} />
      {/* линия окончания уроков 14:30 через обе колонки */}
      <div style={box({ left: 134, right: 22, top: sy - 4, height: 8, borderRadius: 4, backgroundColor: v.schoolHL > 0.3 ? C.yellow : "#E7B93A", opacity: v.schoolShow, transformOrigin: "0 50%", scale: `${0.2 + 0.8 * easeOut(v.schoolShow)} 1` })} />
      {[CAL_COL[0].x + 26, CAL_COL[1].x + CAL_COL[1].w - 26].map((x, i) => (
        <div key={i} style={box({ left: x - 20, top: sy - 20, width: 40, height: 40, borderRadius: 20, backgroundColor: C.yellow, border: "5px solid #FFFFFF", boxShadow: `0 0 0 ${12 * v.schoolHL}px rgba(255,211,61,0.35)`, opacity: v.schoolShow * (i ? v.dadShow : 1) })} />
      ))}
      <div style={box({ left: 0, right: 0, top: sy - 36, display: "flex", justifyContent: "center", paddingLeft: 100, opacity: v.schoolShow })}>
        <div style={{ height: 72, padding: "0 26px", borderRadius: 999, backgroundColor: C.yellow, display: "flex", alignItems: "center", gap: 12, fontSize: 38, fontWeight: 900, color: C.ink, scale: `${0.9 + 0.1 * v.schoolShow + 0.06 * v.schoolHL}`, boxShadow: "0 6px 18px rgba(200,150,20,0.35)", whiteSpace: "nowrap" }}>
          <Icon id="school" size={40} color={C.ink} stroke={4} />
          {UL2_CAL.school}
        </div>
      </div>
    </div>
  );
};
