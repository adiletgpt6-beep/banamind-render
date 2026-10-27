// Календарь предлагаемой роли (постановочный пример для ясности сюжета):
// две соседние колонки — Айжан и муж — и школьная отметка 14:30 между
// ними. Сначала подсвечивается её встреча 14:00–15:00, затем его
// 14:00–15:30, затем «Мектеп — 14:30» (мягкий жёлтый акцент пересечения).
// Ниже — другие дни: «Өнөктөштөр менен жолугушуу», «Башка кеңсеге баруу».
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
  readonly schoolShow: number; // 0…1 школьная отметка
  readonly schoolHL: number; // 0…1 жёлтый акцент пересечения
  readonly others?: number; // 0…1 другие дни
  readonly shift?: number; // 0…1 блоки сдвинуты (попытка переставить)
  readonly f: number;
};

// Геометрия сетки (px карточки 940 × 860).
const TOP = 230;
const HOUR = 180;
const yOf = (h: number) => TOP + (h - UL2_CAL.hours[0]) * HOUR;
const COL = [
  { x: 140, w: 360 },
  { x: 530, w: 370 },
] as const;

const Block: React.FC<{ x: number; w: number; from: number; to: number; fill: string; line: string; label: string; time: string; hl: number; dy: number; a: number }> = ({ x, w, from, to, fill, line, label, time, hl, dy, a }) => (
  <div
    style={box({
      left: x,
      top: yOf(from) + 4 + dy,
      width: w,
      height: yOf(to) - yOf(from) - 8,
      borderRadius: 20,
      backgroundColor: fill,
      border: `${3 + 2 * hl}px solid ${line}`,
      boxSizing: "border-box",
      padding: "10px 20px",
      opacity: a,
      boxShadow: hl > 0.05 ? `0 0 0 ${8 * hl}px ${line}33` : "none",
    })}
  >
    {/* время — сверху, название — у нижнего края (линия 14:30 проходит между ними) */}
    <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, lineHeight: 1.1 }}>{time}</div>
    <div style={{ position: "absolute", left: 20, bottom: 10, fontSize: 30, fontWeight: 800, color: C.inkSoft, lineHeight: 1.1 }}>{label}</div>
  </div>
);

export const CalendarCard: React.FC<{ readonly v: CalendarView }> = ({ v }) => {
  const sy = yOf(UL2_CAL.schoolAt);
  const shift = clamp(v.shift ?? 0);
  const dy = shift * 1.15 * HOUR;
  const others = clamp(v.others ?? 1);
  return (
    <div style={box({ inset: 0, backgroundColor: C.card, fontFamily, color: C.ink })}>
      {/* шапка: «Жаңы команда» и неделя */}
      <div style={box({ left: 34, top: 28, display: "flex", alignItems: "center", gap: 16 })}>
        <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: CAL_PURPLE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon id="calendar" size={36} color={C.ink} stroke={4} />
        </div>
        <div style={{ fontSize: 42, fontWeight: 900 }}>{UL2_CAL.title}</div>
      </div>
      <div style={box({ right: 30, top: 34, display: "flex", gap: 8 })}>
        {UL2_CAL.week.map((d, i) => (
          <div key={d} style={{ width: 62, height: 50, borderRadius: 14, backgroundColor: i === 0 ? CAL_PURPLE : "#EEF2F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: i === 0 ? C.ink : C.inkSoft }}>
            {d}
          </div>
        ))}
      </div>
      {/* заголовки колонок */}
      {[UL2_CAL.mom.who, UL2_CAL.dad.who].map((who, i) => (
        <div key={who} style={box({ left: COL[i].x, top: 132, width: COL[i].w, display: "flex", alignItems: "center", gap: 12, fontSize: 34, fontWeight: 900, opacity: i ? v.dadShow : 1 })}>
          <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: i ? DAD_LINE : MOM_LINE }} />
          {who}
        </div>
      ))}
      {/* часы и линии сетки */}
      {UL2_CAL.hours.map((h) => (
        <div key={h}>
          <div style={box({ left: 30, top: yOf(h) - 18, width: 96, fontSize: 28, fontWeight: 800, color: C.inkSoft })}>{`${h}:00`}</div>
          <div style={box({ left: 130, right: 30, top: yOf(h), height: 2, backgroundColor: C.cardLine })} />
        </div>
      ))}
      {/* её встреча 14:00–15:00 */}
      <Block x={COL[0].x} w={COL[0].w} from={UL2_CAL.mom.from} to={UL2_CAL.mom.to} fill={MOM_FILL} line={MOM_LINE} label={UL2_CAL.mom.label} time={UL2_CAL.mom.time} hl={v.momHL} dy={dy} a={1} />
      {/* его встреча 14:00–15:30 */}
      <Block x={COL[1].x} w={COL[1].w} from={UL2_CAL.dad.from} to={UL2_CAL.dad.to} fill={DAD_FILL} line={DAD_LINE} label={UL2_CAL.dad.label} time={UL2_CAL.dad.time} hl={v.dadHL} dy={dy * 0.9} a={v.dadShow} />
      {/* школьная отметка 14:30 через обе колонки */}
      <div style={box({ left: 124, right: 22, top: sy - 3, height: 6, borderRadius: 3, backgroundColor: v.schoolHL > 0.3 ? C.yellow : "#E7B93A", opacity: v.schoolShow, transformOrigin: "0 50%", scale: `${0.2 + 0.8 * easeOut(v.schoolShow)} 1` })} />
      {[COL[0].x + COL[0].w / 2, COL[1].x + COL[1].w / 2].map((x, i) => (
        <div key={i} style={box({ left: x - 17, top: sy - 17, width: 34, height: 34, borderRadius: 17, backgroundColor: C.yellow, border: "4px solid #FFFFFF", boxShadow: `0 0 0 ${10 * v.schoolHL}px rgba(255,211,61,0.35)`, opacity: v.schoolShow * (i ? v.dadShow : 1) })} />
      ))}
      <div style={box({ left: COL[0].x + 12, top: sy - 31, height: 62, padding: "0 22px", borderRadius: 999, backgroundColor: C.yellow, display: "flex", alignItems: "center", gap: 10, fontSize: 32, fontWeight: 900, color: C.ink, opacity: v.schoolShow, scale: `${0.9 + 0.1 * v.schoolShow + 0.06 * v.schoolHL}`, boxShadow: "0 6px 18px rgba(200,150,20,0.35)", whiteSpace: "nowrap" })}>
        <Icon id="school" size={34} color={C.ink} stroke={4} />
        {UL2_CAL.school}
      </div>
      {/* другие дни после обеда */}
      <div style={box({ left: 30, right: 30, top: 746, display: "flex", flexDirection: "column", gap: 8, opacity: others })}>
        {[
          [UL2_CAL.week[1], "14:00", UL2_CAL.partners],
          [UL2_CAL.week[3], "15:00", UL2_CAL.otherOffice],
        ].map(([d, time, label]) => (
          <div key={label} style={{ height: 48, borderRadius: 14, backgroundColor: "#F1EDFB", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", fontSize: 28, fontWeight: 800, color: C.ink }}>
            <span style={{ fontWeight: 900, color: MOM_LINE, width: 48 }}>{d}</span>
            <span style={{ color: C.inkSoft, width: 84 }}>{time}</span>
            <span style={{ whiteSpace: "nowrap" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
