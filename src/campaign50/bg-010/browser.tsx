// Экран ноутбука после решения папы (кадр 1080×1920, внутри EditorWindow):
//   PlanView   — рабочий план дня; строка «Мектеп» выделяется и уезжает
//                в отдельную вкладку;
//   SearchView — поиск «Бишкек балдар үчүн такси» и карточка BalaGo;
//   RouteView  — страница BalaGo: маршрут ҮЙ → МЕКТЕП → ҮЙ как план и три
//                шага (заявка → группа → бесплатная полная пробная поездка).
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { MONO } from "./editor";
import { clamp, easeOut } from "./rig/motion";
import { BG10_TEXT, BG10_VIDEO } from "./script";
import { NAVY, YELLOW } from "./sets/Office";

const PLAN_TOP = 470;
const ROW_H = 150;
export const planRowY = (i: number) => PLAN_TOP + 120 + i * ROW_H;

// Строка плана (центр по y = planRowY(i)).
export const PlanRow: React.FC<{ i: number; sel?: number; lift?: number; dx?: number; dy?: number; scale?: number; o?: number }> = ({ i, sel = 0, lift = 0, dx = 0, dy = 0, scale = 1, o = 1 }) => {
  const it = BG10_TEXT.plan.items[i];
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        top: planRowY(i) - 56,
        width: 860,
        height: 112,
        borderRadius: 22,
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        backgroundColor: lift > 0 ? "#FFFFFF" : "transparent",
        boxShadow: lift > 0 ? `0 ${20 * lift}px ${40 * lift}px rgba(31,45,85,${0.25 * lift})` : undefined,
        opacity: o,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, width: `${sel * 100}%`, height: "100%", backgroundColor: "rgba(255,199,39,0.55)" }} />
      <div style={{ position: "absolute", left: 24, top: 26, padding: "6px 16px", borderRadius: 12, backgroundColor: it.school ? YELLOW : "#EEF1F7", fontFamily: MONO, fontSize: 34, fontWeight: 700, color: NAVY }}>{it.time}</div>
      <div style={{ position: "absolute", left: 200, top: 28, fontFamily, fontSize: 44, fontWeight: it.school ? 900 : 700, color: NAVY, whiteSpace: "nowrap" }}>{it.text}</div>
    </div>
  );
};

export const PlanView: React.FC<{ hideSchool?: boolean; gap?: number }> = ({ hideSchool, gap = 0 }) => (
  <>
    <div style={{ position: "absolute", left: 130, top: PLAN_TOP - 40, fontFamily: MONO, fontSize: 30, color: "#8A93A8" }}># {BG10_TEXT.plan.file}</div>
    <div style={{ position: "absolute", left: 130, top: PLAN_TOP, fontFamily, fontSize: 60, fontWeight: 900, color: NAVY }}>{BG10_TEXT.plan.title}</div>
    {BG10_TEXT.plan.items.map((it, i) => (it.school && hideSchool ? null : <PlanRow key={i} i={i} dy={i > 2 ? -gap * ROW_H : 0} />))}
  </>
);

// Поле поиска с набираемым текстом (typed — доля текста).
export const SearchBox: React.FC<{ typed: number; f: number; y?: number }> = ({ typed, f, y = 560 }) => {
  const q = BG10_TEXT.plan.search;
  const n = Math.round(q.length * clamp(typed));
  return (
    <div style={{ position: "absolute", left: 100, top: y, width: 880, height: 120, borderRadius: 60, backgroundColor: "#F3F5FA", border: `4px solid ${typed > 0 ? YELLOW : "#E1E6EF"}`, boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 34px", gap: 22 }}>
      <svg width={46} height={46} viewBox="0 0 46 46">
        <circle cx={19} cy={19} r={14} stroke={NAVY} strokeWidth={6} fill="none" />
        <path d="M 30 30 L 42 42" stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
      </svg>
      <div style={{ fontFamily, fontSize: 44, fontWeight: 800, color: NAVY, whiteSpace: "nowrap" }}>
        {q.slice(0, n)}
        <span style={{ display: "inline-block", width: 4, height: 46, marginLeft: 4, verticalAlign: "middle", backgroundColor: NAVY, opacity: typed < 1 || Math.floor(f / 15) % 2 === 0 ? 1 : 0 }} />
      </div>
    </div>
  );
};

// Карточка результата поиска BalaGo (k — появление, press — нажатие).
export const ResultCard: React.FC<{ k: number; press?: number; y?: number }> = ({ k, press = 0, y = 760 }) => {
  if (k <= 0) return null;
  const r = BG10_TEXT.result;
  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top: y + (1 - k) * 40,
        width: 880,
        height: 250,
        borderRadius: 34,
        backgroundColor: "#FFFFFF",
        border: `5px solid ${YELLOW}`,
        boxSizing: "border-box",
        boxShadow: `0 ${24 - 14 * press}px 50px rgba(31,45,85,0.16)`,
        opacity: k,
        transform: `scale(${1 - 0.03 * press})`,
        display: "flex",
        alignItems: "center",
        gap: 34,
        padding: "0 40px",
        fontFamily,
        color: NAVY,
      }}
    >
      <Img src={staticFile(BG10_VIDEO.logo)} style={{ width: 150, height: 150, borderRadius: 75, objectFit: "cover" }} />
      <div>
        <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1 }}>{r.brand}</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#3A4F80", marginTop: 10 }}>{r.tagline}</div>
      </div>
    </div>
  );
};

// ---------- Страница BalaGo: маршрут и шаги ----------
const HouseIcon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <path d="M 8 32 L 32 12 L 56 32" stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x={16} y={30} width={32} height={24} rx={3} fill={NAVY} />
    <rect x={28} y={40} width={9} height={14} fill="#FFFFFF" />
  </svg>
);
const SchoolGlyph: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <path d="M 6 28 L 32 12 L 58 28 Z" fill={NAVY} />
    <rect x={12} y={28} width={40} height={26} fill={NAVY} />
    <rect x={28} y={38} width={8} height={16} fill="#FFFFFF" />
    <rect x={17} y={33} width={7} height={7} fill="#FFFFFF" />
    <rect x={40} y={33} width={7} height={7} fill="#FFFFFF" />
    <path d="M 32 12 L 32 2 L 42 5 L 32 8" fill={YELLOW} />
  </svg>
);

// Белая машина-значок (схема, не конкретная модель).
export const CarGlyph: React.FC<{ w: number; dir?: 1 | -1 }> = ({ w, dir = 1 }) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 120 60" style={{ transform: `scaleX(${dir})`, overflow: "visible" }}>
    <path d="M 8 40 L 14 26 Q 18 20 26 19 L 44 18 L 58 8 Q 62 6 70 6 L 88 7 Q 96 8 100 16 L 106 24 Q 114 26 114 34 L 114 42 Q 114 46 110 46 L 12 46 Q 8 46 8 42 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 52 19 L 62 11 L 72 11 L 72 19 Z M 78 11 L 90 11 Q 94 12 96 19 L 78 19 Z" fill="#CFE3F5" />
    <rect x={16} y={30} width={98} height={5} fill={YELLOW} />
    <circle cx={34} cy={46} r={10} fill={NAVY} />
    <circle cx={92} cy={46} r={10} fill={NAVY} />
    <circle cx={34} cy={46} r={4} fill="#DDE3EE" />
    <circle cx={92} cy={46} r={4} fill="#DDE3EE" />
  </svg>
);

const NODE_Y = 690;
const NODES = [190, 540, 890] as const;

// draw — прорисовка линии маршрута 0…1; car — появление значка белой
// машины у дома (стоит: это план, не поездка); status — плашка «пландалат».
export const RouteView: React.FC<{ head: number; draw: number; car: number; status: number; steps: readonly number[]; badge: number; dots: number }> = ({ head, draw, car, status, steps, badge, dots }) => {
  const R = BG10_TEXT.route;
  const S = BG10_TEXT.steps.items;
  const lineW = NODES[2] - NODES[0];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: NAVY }}>
      {/* шапка */}
      <div style={{ position: "absolute", left: 90, top: 330, display: "flex", alignItems: "center", gap: 24, opacity: head, transform: `translateY(${(1 - head) * 20}px)` }}>
        <Img src={staticFile(BG10_VIDEO.logo)} style={{ width: 110, height: 110, borderRadius: 55, objectFit: "cover" }} />
        <div>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{BG10_TEXT.result.brand}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#3A4F80" }}>{BG10_TEXT.result.tagline}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 500, fontSize: 44, fontWeight: 900, opacity: head }}>{R.title}</div>
      {/* линия маршрута ҮЙ → МЕКТЕП → ҮЙ */}
      <div style={{ position: "absolute", left: NODES[0], top: NODE_Y - 9, width: lineW * clamp(draw), height: 18, borderRadius: 9, backgroundColor: YELLOW }} />
      {NODES.map((x, i) => {
        const k = easeOut((draw - i * 0.45) / 0.15);
        return (
          <div key={i} style={{ position: "absolute", left: x - 70, top: NODE_Y - 70, width: 140, height: 140, borderRadius: 70, backgroundColor: "#FFFFFF", border: `6px solid ${NAVY}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
            {i === 1 ? <SchoolGlyph s={76} /> : <HouseIcon s={70} />}
          </div>
        );
      })}
      {NODES.map((x, i) => (
        <div key={`l${i}`} style={{ position: "absolute", left: x - 120, width: 240, top: NODE_Y + 84, textAlign: "center", fontSize: 40, fontWeight: 900, opacity: easeOut((draw - i * 0.45) / 0.15) }}>
          {R.stops[i]}
        </div>
      ))}
      {R.legs.map((t, i) => (
        <div key={t} style={{ position: "absolute", left: NODES[i] + 40, width: NODES[i + 1] - NODES[i] - 80, top: NODE_Y - 130, textAlign: "center", fontSize: 28, fontWeight: 800, color: "#5A6B92", opacity: easeOut((draw - 0.3 - i * 0.45) / 0.2) }}>
          {t}
        </div>
      ))}
      {/* белая машина — значок плана у дома (стоит, а не едет) */}
      {car > 0 ? (
        <div style={{ position: "absolute", left: 780, top: 488, opacity: car, transform: `translateY(${(1 - easeOut(car)) * 20}px)` }}>
          <CarGlyph w={120} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 300, width: 480, top: NODE_Y + 150, height: 64, borderRadius: 32, backgroundColor: "#EAF3FC", border: "3px solid #C8DDF2", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 32, fontWeight: 800, color: "#2F5A8F", opacity: status }}>
        <svg width={30} height={30} viewBox="0 0 30 30">
          <circle cx={15} cy={15} r={12} fill="none" stroke="#2F5A8F" strokeWidth={4} />
          <path d="M 15 8 L 15 15 L 20 18" stroke="#2F5A8F" strokeWidth={4} fill="none" strokeLinecap="round" />
        </svg>
        {R.status}
      </div>
      {/* шаги */}
      {S.map((s, i) => {
        const k = easeOut(steps[i] ?? 0);
        const y = 960 + i * 112;
        return (
          <div key={s.title} style={{ position: "absolute", left: 90, width: 900, top: y, height: 96, display: "flex", alignItems: "center", gap: 24, opacity: k, transform: `translateX(${(1 - k) * 40}px)` }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: i === 2 ? YELLOW : NAVY, color: i === 2 ? NAVY : "#FFFFFF", fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: i === 2 ? 36 : 40, fontWeight: 900, lineHeight: 1.05 }}>{s.title}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#5A6B92" }}>{s.note}</div>
            </div>
            {i === 1 ? (
              <div style={{ display: "flex", gap: 6, marginRight: 6 }}>
                {[0, 1, 2, 3].map((d) => {
                  const dk = easeOut((dots - d * 0.22) / 0.2);
                  return <div key={d} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: d === 3 ? "#C9D6EA" : ["#5E9A93", "#E2874C", "#4C7BD9"][d], border: d === 3 ? "3px dashed #8FA3C4" : undefined, boxSizing: "border-box", opacity: dk, transform: `scale(${0.5 + 0.5 * dk})` }} />;
                })}
              </div>
            ) : null}
            {"badge" in s && s.badge ? (
              <div style={{ padding: "10px 22px", borderRadius: 999, backgroundColor: "#E8F6EC", border: "3px solid #3CC37A", color: "#1F7A45", fontSize: 34, fontWeight: 900, opacity: badge, transform: `scale(${0.7 + 0.3 * easeOut(badge)})` }}>{s.badge}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
