// Сцены 2–4: одна непрерывная электронная таблица «Убакыт эсеби».
//   2. Таблица одного дня: строки «Мектепке баруу», «Күтүү», «Кайра жумушка
//      жетүү» печатаются на словах диктора, в графе «Убакыт» растут полоски
//      (иллюстрация, без выдуманных часов и денег), итог «1 күн».
//   3. Курсор родителя тянет маркер заполнения: строки копируются на дни
//      недели (календарь Дүй…Жум). «Бир жолку» зачёркивается, курсор
//      выделяет «күн сайын», итог растёт до «Бир апта».
//   4. Курсор выделяет школьный маршрут и переносит его в новую графу
//      «Алдын ала уюштуруу»; в строке формул =АЛДЫН_АЛА(ҮЙ → МЕКТЕП → ҮЙ),
//      из формулы появляется карточка BalaGo как пример такого сервиса.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  ArrowText,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  clamp01,
  easeInOut,
  easeOut,
  HourglassIcon,
  NAVY,
  NAVY_SOFT,
  ParentCursor,
  popScale,
  prog,
  SchoolBagIcon,
  TimeBar,
  YELLOW,
  YELLOW_SOFT,
} from "../art";
import type { Bg04Beats } from "../beats";
import { BG04_TEXT } from "../script";

const S = BG04_TEXT.sheet;
const P = BG04_TEXT.plan;

// окно таблицы (координаты кадра)
const WIN = { left: 40, top: 150, width: 1000, height: 1250 };
const ROWNUM = 56;
const LETTERS_Y = 146;
const HEAD_Y = 196;
const HEAD_H = 80;
const ROW_H = 130;
const rowY = (r: number) => HEAD_Y + HEAD_H + r * ROW_H; // r = 0…2 строки, 3 — итог
const DAY_W = 122;
const COLORS = ["#FFC928", "#FF9F43", "#5B8DEF"];
// условные доли полосок (иллюстрация, не статистика)
const SHARE = [0.55, 0.8, 0.62];
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// ключевые точки пути курсора: [время, x, y] (координаты окна)
type Key = readonly [number, number, number];
const path = (keys: readonly Key[], t: number) => {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, x1, y1] = keys[i];
    const [t0, x0, y0] = keys[i - 1];
    if (t <= t1) {
      const u = easeInOut((t - t0) / Math.max(0.001, t1 - t0));
      return { x: lerp(x0, x1, u), y: lerp(y0, y1, u) };
    }
  }
  const last = keys[keys.length - 1];
  return { x: last[1], y: last[2] };
};

const clickPulse = (t: number, at: number) => {
  const u = prog(t, at, 0.35);
  return u > 0 && u < 1 ? u : 0;
};

const RowIcon: React.FC<{ readonly r: number; readonly t: number }> = ({ r, t }) =>
  r === 0 ? <SchoolBagIcon size={58} /> : r === 1 ? <HourglassIcon size={58} fill={(t * 0.35) % 1} /> : <BriefcaseIcon size={58} />;

export const Sheet: React.FC<{ readonly t: number; readonly b: Bg04Beats }> = ({ t, b }) => {
  const { rows, week, plan } = b;
  const enter = easeOut(prog(t, rows.from - 0.3, 0.55));
  const exit = easeInOut(prog(t, plan.to - 0.55, 0.5));
  // раскладка: 0 — один день (2 графы), 1 — неделя (5 дней)
  const w = easeInOut(prog(t, week.from, 0.7));
  const colAW = lerp(470, 330, w);
  const day0W = lerp(WIN.width - ROWNUM - 470, DAY_W, w);
  const dayX = (d: number) => (d === 0 ? ROWNUM + colAW : ROWNUM + 330 + d * DAY_W);
  const dayW = (d: number) => (d === 0 ? day0W : DAY_W);

  // маркер заполнения: курсор тянет от правого края «Дүй» до «Жум»
  const fillU = easeInOut(prog(t, week.fillFrom + 0.5, week.fillTo - week.fillFrom - 0.5));
  const fillX = lerp(dayX(0) + DAY_W, dayX(4) + DAY_W, fillU);
  const dayShown = (d: number) => (d === 0 ? 1 : fillU <= 0 ? 0 : easeOut(clamp01((fillX - dayX(d) - 30) / 70)));

  // перенос маршрута (сцена 4)
  const sel = easeInOut(prog(t, plan.select, plan.grab - plan.select - 0.1));
  const lift = easeInOut(prog(t, plan.grab, plan.drop - plan.grab));
  const dropped = easeOut(prog(t, plan.drop, 0.45));
  const panelIn = easeOut(prog(t, plan.grab - 0.3, 0.5));
  const brand = prog(t, plan.brand, 0.6);
  const offer = easeOut(prog(t, plan.offer, 0.45));
  const back = easeOut(prog(t, plan.back, 0.45));

  // строка формул
  const typed = (at: number, text: string, dur = 0.5) => text.slice(0, Math.round(text.length * prog(t, at, dur)));
  let formula = "";
  if (t >= plan.formula) formula = typed(plan.formula, P.formula, 0.9);
  else if (t >= plan.select) formula = `${S.rows[0]} … ${S.rows[2]}`;
  else if (t >= week.fillFrom) formula = `=КҮН_САЙЫН(${S.days[0]} : ${S.days[4]})`;
  else if (t >= rows.sum) formula = typed(rows.sum, `=ЖАЛПЫ(${S.colTime})`, 0.5);
  else {
    for (let r = 2; r >= 0; r--) {
      if (t >= rows.typed[r]) {
        formula = typed(rows.typed[r], S.rows[r], 0.45);
        break;
      }
    }
  }

  // курсор родителя
  const cursorKeys: Key[] = [
    [rows.from, 700, 1150],
    [rows.typed[0] - 0.05, 300, rowY(0) + 70],
    [rows.typed[1] - 0.05, 300, rowY(1) + 70],
    [rows.typed[2] - 0.05, 300, rowY(2) + 70],
    [rows.sum - 0.05, 300, rowY(3) + 70],
    [week.from + 0.2, 560, rowY(3) + 40],
    [week.fillFrom + 0.5, dayX(0) + DAY_W - 8, rowY(3) - 8],
    [week.fillTo, dayX(4) + DAY_W - 8, rowY(3) - 8],
    [week.daily - 0.1, 700, 952],
    [plan.from + 0.1, 640, 980],
    [plan.select, ROWNUM + 14, rowY(0) + 10],
    [plan.grab - 0.1, 980, rowY(3) - 12],
    [plan.drop, 520, 975],
    [plan.drop + 0.7, 860, 1160],
  ];
  const cur = path(cursorKeys, t);
  const grabbing = (t >= week.fillFrom + 0.4 && t < week.fillTo + 0.1) || (t >= plan.grab - 0.05 && t < plan.drop);
  const press = Math.max(
    ...rows.typed.map((at) => clickPulse(t, at)),
    clickPulse(t, rows.sum),
    clickPulse(t, week.daily),
    clickPulse(t, plan.select),
    clickPulse(t, plan.drop),
  );

  // активная ячейка (рамка) — где сейчас «пишет» родитель
  let active: { x: number; y: number; w: number; h: number } | null = null;
  if (t >= rows.typed[0] && t < week.from) {
    let r = 0;
    for (let i = 0; i < 3; i++) if (t >= rows.typed[i]) r = i;
    if (t >= rows.sum) r = 3;
    active = { x: ROWNUM, y: rowY(r), w: colAW, h: ROW_H };
  }

  const dailyOn = easeOut(prog(t, week.daily, 0.35));
  const onceIn = easeOut(prog(t, week.once - 0.1, 0.35));
  const strike = easeInOut(prog(t, week.onceStrike, 0.35));
  const calIn = easeOut(prog(t, week.calendar, 0.4));
  const total = easeInOut(prog(t, week.total, 0.9));
  const chipsOut = 1 - easeInOut(prog(t, plan.grab - 0.5, 0.4));

  // полоски в ячейках
  const barIn = (r: number) => easeInOut(prog(t, rows.bars[r], 0.8));
  const dayTotal = easeInOut(prog(t, rows.sum, 0.8));

  return (
    <div
      style={{
        position: "absolute",
        left: WIN.left,
        top: WIN.top,
        width: WIN.width,
        height: WIN.height,
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 40 - exit * 160}px) scale(${0.94 + 0.06 * enter})`,
        transformOrigin: "50% 30%",
        fontFamily,
      }}
    >
      {/* окно */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 34, backgroundColor: "#FFFFFF", boxShadow: "0 30px 70px rgba(20,40,75,0.22)", overflow: "hidden", border: "3px solid #DCE3EE" }}>
        {/* заголовок окна */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 76, backgroundColor: NAVY, display: "flex", alignItems: "center", padding: "0 26px", gap: 14 }}>
          {["#FF6B5E", "#FFC928", "#3CC46B"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c }} />
          ))}
          <div style={{ marginLeft: 18, width: 38, height: 38, borderRadius: 8, backgroundColor: "#3CC46B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={26} height={26} viewBox="0 0 24 24">
              <path d="M 4 4 L 20 4 L 20 20 L 4 20 Z M 4 10 L 20 10 M 4 15 L 20 15 M 11 4 L 11 20" fill="none" stroke="#FFFFFF" strokeWidth={2.2} />
            </svg>
          </div>
          <div style={{ fontSize: 36, fontWeight: 1000, color: "#FFFFFF" }}>{S.file}</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)" }}>
            <ClockIcon size={34} turn={t * 90} color="#FFFFFF" />
          </div>
        </div>
        {/* строка формул */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 76, height: 70, borderBottom: "3px solid #DCE3EE", display: "flex", alignItems: "center", backgroundColor: "#F7F9FC" }}>
          <div style={{ width: 90, textAlign: "center", fontSize: 34, fontWeight: 900, fontStyle: "italic", color: NAVY_SOFT, borderRight: "3px solid #DCE3EE" }}>fx</div>
          <div style={{ marginLeft: 22, fontSize: 38, fontWeight: 900, color: t >= plan.formula ? "#1E7A44" : NAVY, whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
            {formula.includes("→") ? <ArrowText text={formula} size={38} /> : formula}
            {Math.floor(t * 2.4) % 2 === 0 ? <span style={{ color: NAVY_SOFT, fontWeight: 400 }}>|</span> : null}
          </div>
        </div>
        {/* буквы граф и номера строк */}
        <div style={{ position: "absolute", left: 0, right: 0, top: LETTERS_Y, height: HEAD_Y - LETTERS_Y, backgroundColor: "#EEF2F8", borderBottom: "2px solid #DCE3EE" }} />
        <div style={{ position: "absolute", left: 0, top: LETTERS_Y, width: ROWNUM, bottom: 0, backgroundColor: "#EEF2F8", borderRight: "2px solid #DCE3EE" }} />
        {[["A", ROWNUM, colAW, 1] as const, ...[0, 1, 2, 3, 4].map((d) => [String.fromCharCode(66 + d), dayX(d), dayW(d), dayShown(d)] as const)].map(([l, x, cw, o]) => (
          <div key={l} style={{ position: "absolute", left: x, top: LETTERS_Y, width: cw, height: HEAD_Y - LETTERS_Y, opacity: o, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: NAVY_SOFT, borderRight: "2px solid #DCE3EE" }}>
            {l}
          </div>
        ))}
        {[0, 1, 2, 3, 4].map((r) => (
          <div key={r} style={{ position: "absolute", left: 0, top: r === 0 ? HEAD_Y : rowY(r - 1), width: ROWNUM, height: r === 0 ? HEAD_H : ROW_H, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: NAVY_SOFT, borderBottom: "2px solid #DCE3EE" }}>
            {r + 1}
          </div>
        ))}
        {/* заголовки граф */}
        <div style={{ position: "absolute", left: ROWNUM, top: HEAD_Y, width: colAW, height: HEAD_H, display: "flex", alignItems: "center", padding: "0 26px", boxSizing: "border-box", fontSize: 38, fontWeight: 1000, color: NAVY, backgroundColor: YELLOW_SOFT, borderRight: "2px solid #DCE3EE", borderBottom: "3px solid #DCE3EE" }}>
          {S.colTask}
        </div>
        {[0, 1, 2, 3, 4].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              left: dayX(d),
              top: HEAD_Y,
              width: dayW(d),
              height: HEAD_H,
              opacity: dayShown(d),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: w > 0.5 ? 34 : 38,
              fontWeight: 1000,
              color: NAVY,
              backgroundColor: dailyOn > 0 ? `rgba(255,201,40,${0.25 + 0.5 * dailyOn})` : YELLOW_SOFT,
              borderRight: "2px solid #DCE3EE",
              borderBottom: "3px solid #DCE3EE",
            }}
          >
            {w < 0.5 ? (
              <>
                <ClockIcon size={40} turn={t * 120} />
                {S.colTime}
              </>
            ) : (
              S.days[d]
            )}
          </div>
        ))}
        {/* строки дня */}
        {[0, 1, 2].map((r) => {
          const shown = prog(t, rows.typed[r], 0.45);
          const label = S.rows[r].slice(0, Math.round(S.rows[r].length * shown));
          const moved = 1 - 0.65 * dropped;
          return (
            <div key={r}>
              <div
                style={{
                  position: "absolute",
                  left: ROWNUM,
                  top: rowY(r),
                  width: colAW,
                  height: ROW_H,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "0 22px",
                  boxSizing: "border-box",
                  borderRight: "2px solid #DCE3EE",
                  borderBottom: "2px solid #DCE3EE",
                  opacity: moved,
                }}
              >
                <div style={{ transform: `scale(${popScale(prog(t, rows.typed[r], 0.35))})`, opacity: shown > 0 ? 1 : 0 }}>
                  <RowIcon r={r} t={t} />
                </div>
                <div style={{ fontSize: w > 0.5 ? 34 : 42, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>{label}</div>
              </div>
              {[0, 1, 2, 3, 4].map((d) => {
                const cw = dayW(d);
                const o = dayShown(d);
                return (
                  <div
                    key={d}
                    style={{
                      position: "absolute",
                      left: dayX(d),
                      top: rowY(r),
                      width: cw,
                      height: ROW_H,
                      opacity: o * moved,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 14px",
                      boxSizing: "border-box",
                      borderRight: "2px solid #DCE3EE",
                      borderBottom: "2px solid #DCE3EE",
                      backgroundColor: dailyOn > 0 ? `rgba(255,243,196,${0.7 * dailyOn})` : undefined,
                      transform: d > 0 ? `scale(${0.85 + 0.15 * o})` : undefined,
                    }}
                  >
                    <TimeBar width={cw - 28} u={(d === 0 ? barIn(r) : 1) * SHARE[r]} color={COLORS[r]} height={w > 0.5 ? 26 : 34} />
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* итог: 1 күн → Бир апта */}
        <div style={{ position: "absolute", left: ROWNUM, top: rowY(3), width: colAW, height: ROW_H, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", boxSizing: "border-box", backgroundColor: "#F3F6FB", borderRight: "2px solid #DCE3EE", borderBottom: "3px solid #DCE3EE", opacity: dayTotal }}>
          <div style={{ fontSize: 46, fontWeight: 1000, color: NAVY }}>Σ</div>
          <div style={{ fontSize: w > 0.5 ? 36 : 42, fontWeight: 1000, color: NAVY }}>{total > 0.02 ? S.week : S.day}</div>
        </div>
        <div style={{ position: "absolute", left: dayX(0), top: rowY(3), width: WIN.width - dayX(0), height: ROW_H, display: "flex", alignItems: "center", padding: "0 14px", boxSizing: "border-box", backgroundColor: "#F3F6FB", borderBottom: "3px solid #DCE3EE", opacity: dayTotal }}>
          {/* итог дня — сумма трёх полосок; итог недели — пять таких сумм */}
          <div style={{ display: "flex", height: 40, width: "100%", borderRadius: 20, overflow: "hidden", backgroundColor: "#E3E8F0" }}>
            {Array.from({ length: 5 }, (_, d) => {
              const share = d === 0 ? 1 - 0.8 * w : 0.2 * total;
              const dayFill = d === 0 ? dayTotal : clamp01(total * 5 - d + 1);
              if (d > 0 && total <= 0) return null;
              return (
                <div key={d} style={{ display: "flex", width: `${share * 100}%`, height: "100%", borderRight: d < 4 && total > 0 ? "3px solid #FFFFFF" : undefined }}>
                  {[0, 1, 2].map((r) => (
                    <div key={r} style={{ width: `${(SHARE[r] / (SHARE[0] + SHARE[1] + SHARE[2])) * 100 * dayFill}%`, height: "100%", backgroundColor: COLORS[r] }} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        {/* активная ячейка */}
        {active ? <div style={{ position: "absolute", left: active.x - 2, top: active.y - 2, width: active.w, height: active.h, border: "5px solid #1E7A44", borderRadius: 4, boxSizing: "border-box" }} /> : null}
        {/* выделение «күн сайын» — графы всех дней */}
        {dailyOn > 0 && t < plan.select ? (
          <div style={{ position: "absolute", left: dayX(0) - 3, top: HEAD_Y - 3, width: 5 * DAY_W + 6, height: HEAD_H + 3 * ROW_H + 6, border: `6px solid ${YELLOW}`, borderRadius: 8, boxSizing: "border-box", opacity: dailyOn, boxShadow: `0 0 0 ${8 * (1 - dailyOn)}px rgba(255,201,40,0.4)` }} />
        ) : null}
        {/* «Бир жолку» → «күн сайын» + календарь */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 860, height: 190, display: "flex", alignItems: "center", justifyContent: "center", gap: 28, opacity: chipsOut }}>
          <div style={{ position: "relative", padding: "20px 30px", borderRadius: 26, backgroundColor: "#F3F6FB", border: "4px solid #DCE3EE", fontSize: 48, fontWeight: 1000, color: NAVY_SOFT, opacity: onceIn * (1 - 0.45 * strike), transform: `scale(${popScale(onceIn)})` }}>
            {S.once}
            <div style={{ position: "absolute", left: 18, top: "50%", height: 8, width: `${strike * 86}%`, backgroundColor: "#E8463A", borderRadius: 4, transform: "rotate(-6deg)" }} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 32px",
              borderRadius: 26,
              backgroundColor: dailyOn > 0 ? YELLOW : "#FFFFFF",
              border: `4px solid ${dailyOn > 0 ? "#E5A800" : "#DCE3EE"}`,
              fontSize: 54,
              fontWeight: 1000,
              color: NAVY,
              opacity: easeOut(prog(t, week.onceStrike, 0.35)),
              transform: `scale(${popScale(easeOut(prog(t, week.onceStrike, 0.4))) * (1 + 0.06 * Math.sin(dailyOn * Math.PI))})`,
              boxShadow: dailyOn > 0 ? "0 10px 26px rgba(229,168,0,0.35)" : undefined,
            }}
          >
            <div style={{ transform: `scale(${popScale(calIn)})`, opacity: Math.max(0.35, calIn) }}>
              <CalendarIcon size={66} />
            </div>
            {S.daily}
          </div>
        </div>
        {/* выделенный школьный маршрут (сцена 4) */}
        {sel > 0 && t < plan.drop + 0.5 ? (
          <div
            style={{
              position: "absolute",
              left: lerp(ROWNUM, 140, lift),
              top: lerp(rowY(0), 900, lift),
              width: lerp(sel * (WIN.width - ROWNUM), WIN.width - 280, lift),
              height: lerp(sel * 3 * ROW_H, 150, lift),
              border: `5px solid ${lift > 0 ? NAVY : "#2F6FE0"}`,
              backgroundColor: lift > 0 ? "rgba(255,255,255,0.96)" : "rgba(47,111,224,0.12)",
              borderRadius: lerp(4, 28, lift),
              boxShadow: lift > 0 ? `0 ${20 * Math.sin(lift * Math.PI)}px 40px rgba(20,40,75,0.28)` : undefined,
              opacity: 1 - dropped,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              overflow: "hidden",
            }}
          >
            {lift > 0.3
              ? [0, 1, 2].map((r) => (
                  <div key={r} style={{ opacity: (lift - 0.3) / 0.7 }}>
                    <RowIcon r={r} t={t} />
                  </div>
                ))
              : null}
          </div>
        ) : null}
        {/* новая графа «Алдын ала уюштуруу» */}
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 830,
            height: 340,
            borderRadius: 32,
            border: `5px ${dropped > 0 ? "solid" : "dashed"} ${dropped > 0 ? "#1E7A44" : "#9DB0CC"}`,
            backgroundColor: dropped > 0 ? "#EAF7EE" : "#F7F9FC",
            opacity: panelIn,
            transform: `translateY(${(1 - panelIn) * 50}px)`,
            boxSizing: "border-box",
            padding: "24px 30px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 44, fontWeight: 1000, color: NAVY }}>
            <div style={{ padding: "6px 16px", borderRadius: 12, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 30 }}>G</div>
            {P.column}
          </div>
          <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 18, opacity: dropped, transform: `scale(${popScale(dropped)})`, transformOrigin: "0 50%" }}>
            <CheckIcon size={58} color="#1E7A44" />
            <div style={{ fontSize: 50, fontWeight: 1000, color: NAVY, display: "flex", alignItems: "center" }}>
              <ArrowText text={P.route} size={46} />
            </div>
          </div>
          <div style={{ marginTop: 14, marginLeft: 76, display: "flex", alignItems: "center", gap: 14, fontSize: 40, fontWeight: 900, color: NAVY_SOFT, opacity: dropped }}>
            <CalendarIcon size={46} />
            {P.daily}
          </div>
        </div>
        {/* карточка BalaGo появляется из строки формул */}
        {brand > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 110,
              right: 110,
              top: lerp(90, 250, easeOut(brand)),
              height: 500,
              borderRadius: 40,
              backgroundColor: "#FFFFFF",
              border: `6px solid ${YELLOW}`,
              boxShadow: "0 30px 70px rgba(20,40,75,0.3)",
              transform: `scale(${popScale(brand)})`,
              transformOrigin: "50% 0%",
              opacity: Math.min(1, brand * 2),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 30,
              boxSizing: "border-box",
            }}
          >
            <div style={{ padding: "6px 22px", borderRadius: 20, backgroundColor: "#EEF2F8", fontSize: 32, fontWeight: 900, color: NAVY_SOFT }}>{P.example}</div>
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 22 }}>
              <Img src={staticFile("assets/logo.png")} style={{ width: 130, height: 130, borderRadius: 65, boxShadow: "0 10px 24px rgba(20,40,90,0.18)" }} />
              <div style={{ fontSize: 100, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{P.brand}</div>
            </div>
            <div style={{ marginTop: 20, padding: "10px 30px", borderRadius: 40, backgroundColor: YELLOW, fontSize: 46, fontWeight: 1000, color: NAVY }}>{P.city}</div>
            <div style={{ marginTop: 22, fontSize: 40, fontWeight: 900, color: NAVY, opacity: offer, transform: `translateY(${(1 - offer) * 16}px)`, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
              {P.offer}
              <span style={{ display: "inline-block", transform: `scale(${popScale(back)})`, opacity: back }}>
                <CheckIcon size={44} color="#1E7A44" />
              </span>
            </div>
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontSize: 30, fontWeight: 800, color: "#7A88A3", opacity: dayTotal * (1 - panelIn) }}>{S.note}</div>
      </div>
      <ParentCursor x={cur.x} y={cur.y} press={press} grab={grabbing} opacity={easeOut(prog(t, rows.from + 0.1, 0.4))} />
      {/* маркер заполнения во время протягивания */}
      {t >= week.fillFrom && t < week.fillTo + 0.3 ? (
        <div style={{ position: "absolute", left: dayX(0) - 2, top: rowY(0) - 2, width: fillX - dayX(0) + 4, height: 3 * ROW_H + 4, border: "4px dashed #1E7A44", borderRadius: 6, boxSizing: "border-box", opacity: 1 - prog(t, week.fillTo, 0.3) }} />
      ) : null}
    </div>
  );
};
