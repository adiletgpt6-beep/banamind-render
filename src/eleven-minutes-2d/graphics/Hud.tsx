// Графические панели истории: накопитель времени, журнал поездки, отсчёт
// до встречи, календарь, крупная цифра. Всё вычисляется по времени ролика.
import { interpolate } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeOut } from "../rig/motion";
import { EM2_STAGES, EM2_TEXT } from "../script";
import { meetingLeftAt, STAGE_AT } from "../story";
import { C } from "../theme";

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Панель: тёмная карточка с тонкой рамкой и подписью.
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; title?: string; children?: React.ReactNode; opacity?: number; accent?: string }> = ({ x, y, w, h, title, children, opacity = 1, accent }) => (
  <div style={box({ left: x, top: y, width: w, height: h, borderRadius: 28, backgroundColor: C.panel, border: `2px solid ${accent ?? C.line}`, overflow: "hidden", opacity, fontFamily })}>
    {children}
    {title ? <div style={box({ left: 24, top: 16, fontSize: 26, fontWeight: 800, color: C.dim, letterSpacing: 1 })}>{title}</div> : null}
  </div>
);

// Плавный счёт минут: от прежнего значения к новому за 0,7 с.
const countAt = (t: number) => {
  let prev = 0;
  let cur = 0;
  let since = -1;
  for (const s of EM2_STAGES) {
    if (t >= STAGE_AT[s.id]) {
      prev = cur;
      cur = s.total;
      since = STAGE_AT[s.id];
    }
  }
  if (since < 0) return 0;
  return Math.round(prev + (cur - prev) * easeOut((t - since) / 0.7));
};

// Накопитель «Жалпы: N мүнөт».
export const Accumulator: React.FC<{ t: number; x: number; y: number; scale?: number }> = ({ t, x, y, scale = 1 }) => {
  const n = countAt(t);
  const doneSt = EM2_STAGES.filter((s) => t >= STAGE_AT[s.id]);
  const last = doneSt[doneSt.length - 1];
  const pulse = last ? 1 - easeOut((t - STAGE_AT[last.id]) / 0.5) : 0;
  return (
    <div style={box({ left: x, top: y, transformOrigin: "100% 0%", scale: `${scale}`, padding: "14px 26px 16px", borderRadius: 22, backgroundColor: "rgba(8,12,19,0.92)", border: `2px solid ${pulse > 0.05 ? C.yellow : C.line}`, fontFamily, textAlign: "right", minWidth: 250 })}>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.dim }}>{EM2_TEXT.total}</div>
      <div style={{ fontSize: 86, fontWeight: 900, color: C.yellow, lineHeight: 1, scale: `${1 + 0.08 * pulse}`, transformOrigin: "100% 50%" }}>
        {n}
        <span style={{ fontSize: 36, color: C.text, marginLeft: 10 }}>{EM2_TEXT.min}</span>
      </div>
    </div>
  );
};

// Журнал поездки: последние записи (новая — сверху подсвечена).
export const Journal: React.FC<{ t: number; x: number; y: number; w: number; max?: number }> = ({ t, x, y, w, max = 3 }) => {
  const done = EM2_STAGES.filter((s) => t >= STAGE_AT[s.id]);
  const shown = done.slice(-max);
  if (!shown.length) return null;
  return (
    <div style={box({ left: x, top: y, width: w, fontFamily, display: "flex", flexDirection: "column", gap: 12 })}>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.dim, letterSpacing: 1 }}>{EM2_TEXT.journal}</div>
      {shown.map((s, i) => {
        const a = easeOut((t - STAGE_AT[s.id]) / 0.45);
        const isNew = i === shown.length - 1;
        const first = s.id === "drive";
        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 22px",
              borderRadius: 18,
              backgroundColor: isNew ? "rgba(17,26,38,0.98)" : "rgba(13,20,31,0.9)",
              border: `2px solid ${isNew ? (first ? C.yellow : C.coral) : C.lineSoft}`,
              opacity: a * (isNew ? 1 : 0.75),
              translate: `${(1 - a) * -30}px 0`,
            }}
          >
            <span style={{ fontSize: 38, fontWeight: 800, color: C.text }}>{s.label}</span>
            <span style={{ fontSize: 40, fontWeight: 900, color: first ? C.yellow : C.coral, whiteSpace: "nowrap", marginLeft: 16 }}>{first ? `${s.min} ${EM2_TEXT.min}` : `+${s.min} ${EM2_TEXT.min}`}</span>
          </div>
        );
      })}
    </div>
  );
};

// Отсчёт до следующей встречи.
export const MeetingChip: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const left = meetingLeftAt(t);
  if (left === null) return null;
  return (
    <div style={box({ left: x, top: y, padding: "14px 24px", borderRadius: 999, backgroundColor: "rgba(8,12,19,0.92)", border: `2px solid ${left <= 8 ? C.coral : C.yellow}`, fontFamily, fontSize: 38, fontWeight: 900, color: C.text, display: "flex", alignItems: "center", gap: 14 })}>
      <svg width={34} height={34} viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={10} fill="none" stroke={left <= 8 ? C.coral : C.yellow} strokeWidth={2.4} />
        <path d="M12 7 V12 L15.5 14" stroke={C.text} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </svg>
      {EM2_TEXT.meetingLeft(left)}
    </div>
  );
};

// Календарь дня (12:00–15:00). mode "mom": длинный блок «Мектеп» с
// вопросом; "dad": встречи и блок «Мектепке баруу» длиной schoolMin.
export const Calendar: React.FC<{
  w: number;
  h: number;
  mode: "mom" | "dad";
  schoolMin?: number; // длина блока «Мектепке баруу», мин
  appear?: number; // 0…1 появление блока школы
  question?: number; // 0…1 знак вопроса на блоке мамы
  highlight?: number; // 0…1 подсветка блока школы
}> = ({ w, h, mode, schoolMin = 11, appear = 1, question = 0, highlight = 0 }) => {
  const top = 90;
  const ppm = (h - top - 30) / 180; // px на минуту: 12:00–15:00
  const y = (min: number) => top + min * ppm; // минуты от 12:00
  const block = (from: number, to: number, label: string, color: string, fill: string, extra?: React.CSSProperties, children?: React.ReactNode) => (
    <div style={box({ left: 150, right: 30, top: y(from) + 3, height: Math.max(8, (to - from) * ppm - 6), borderRadius: 16, backgroundColor: fill, borderLeft: `8px solid ${color}`, padding: "10px 18px", boxSizing: "border-box", overflow: "hidden", ...extra })}>
      <div style={{ fontSize: 32, fontWeight: 900, color: C.text, whiteSpace: "nowrap" }}>{label}</div>
      {children}
    </div>
  );
  const t = EM2_TEXT.calendar;
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, fontFamily })}>
      <div style={box({ left: 30, top: 24, fontSize: 30, fontWeight: 900, color: C.text })}>
        {t.title} <span style={{ color: C.dim, fontWeight: 700 }}>· {t.today}</span>
      </div>
      {t.times.map((label, i) => (
        <div key={label}>
          <div style={box({ left: 30, top: y(i * 60) - 16, fontSize: 28, fontWeight: 700, color: C.dim })}>{label}</div>
          <div style={box({ left: 140, right: 20, top: y(i * 60), height: 2, backgroundColor: C.lineSoft })} />
        </div>
      ))}
      {mode === "mom" ? (
        block(
          45,
          120,
          t.momSchool,
          C.yellow,
          "rgba(255,211,61,0.16)",
          {},
          question > 0 ? (
            <div style={{ position: "absolute", right: 26, top: "50%", translate: "0 -50%", fontSize: 110, fontWeight: 900, color: C.yellow, opacity: question, scale: `${0.8 + 0.2 * question}` }}>?</div>
          ) : null,
        )
      ) : (
        <>
          {block(0, 55, t.meetingA, "#6E8BFF", "rgba(110,139,255,0.16)")}
          {block(120, 180, t.meetingB, "#6E8BFF", "rgba(110,139,255,0.16)")}
          {appear > 0
            ? block(58, 58 + schoolMin, t.school, C.yellow, `rgba(255,211,61,${0.16 + 0.14 * highlight})`, { opacity: appear, boxShadow: highlight > 0 ? `0 0 ${30 * highlight}px rgba(255,211,61,0.35)` : undefined }, (
                <div style={{ fontSize: 28, fontWeight: 800, color: C.yellow }}>{`${Math.round(schoolMin)} ${EM2_TEXT.min}`}</div>
              ))
            : null}
        </>
      )}
    </div>
  );
};

// Крупная цифра (например, «11 мүнөт») с появлением.
export const BigFigure: React.FC<{ text: string; sub?: string; a: number; color?: string; size?: number }> = ({ text, sub, a, color = C.yellow, size = 170 }) => (
  <div style={{ fontFamily, textAlign: "center", opacity: a, scale: `${0.85 + 0.15 * a}` }}>
    <div style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>{text}</div>
    {sub ? <div style={{ fontSize: size * 0.3, fontWeight: 800, color: C.text, marginTop: 10 }}>{sub}</div> : null}
  </div>
);

export const fadeIn = (t: number, at: number, d = 0.4) => interpolate(t, [at, at + d], [0, 1], CL);
export const fadeOut = (t: number, at: number, d = 0.4) => interpolate(t, [at, at + d], [1, 0], CL);
export { clamp };
