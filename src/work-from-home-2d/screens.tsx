// Крупные вставки: экран ноутбука (документ «Айлык талдоо», календарь,
// переписка команды) с руками на клавиатуре, телефон (календари, поиск,
// страница BalaGo, предварительная заявка). Тексты — кыргызча, крупные,
// интерфейс меняется только вслед за действием.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../fonts";
import { clamp, easeInOut, easeOut } from "./rig/motion";
import { WFH_TEXT } from "./script";
import { box } from "./shots";

export const INK = "#172A46";
export const YELLOW = "#FFD43B";
const BLUE = "#3E7CC0";
const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);

// ---------- Документ «Айлык талдоо» ----------
export type DocState = {
  // заполнено строк из двух пустых (0…2, дробное — печатается)
  readonly filled: number;
  // курсор стоит в строке (индекс из rows), мигает
  readonly cursorRow?: number;
  // подсветка строки (выбор мышью)
  readonly highlightRow?: number;
  readonly saved?: number; // 0…1 — «Сакталды»
  readonly done?: number; // 0…1 — раздел отмечен завершённым
  readonly scrollUp?: number; // 0…1 — просмотр предыдущих строк
};

const Doc: React.FC<{ f: number; s: DocState; w: number; h: number }> = ({ f, s, w, h }) => {
  const d = WFH_TEXT.doc;
  const rows = d.rows.map((r, i) => {
    if (i < 2) return r;
    const k = i - 2;
    const fill = clamp(s.filled - k);
    if (fill <= 0) return r;
    const full = d.filled[k];
    // печать: значения появляются по символам
    const typed = (v: string, from: number) => v.slice(0, Math.round(clamp((fill - from) / 0.5) * v.length));
    return [full[0], full[1], typed(full[2], 0), typed(full[3], 0.5)];
  });
  const blink = Math.floor(f / 15) % 2 === 0;
  const colW = [0.34, 0.22, 0.22, 0.22];
  // график: столбики плана и факта; факт растёт по мере ввода
  const vals = rows.map((r) => (r[2] ? Number(r[2]) : 0));
  const plan = rows.map((r) => Number(r[1]));
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#FFFFFF", fontFamily, color: INK, overflow: "hidden" })}>
      {/* верхняя панель приложения */}
      <div style={box({ left: 0, top: 0, width: w, height: 70, backgroundColor: "#EEF3F9", borderBottom: "2px solid #DCE4EE" })}>
        <div style={box({ left: 24, top: 18, width: 34, height: 34, borderRadius: 8, backgroundColor: BLUE })} />
        <div style={box({ left: 74, top: 14, fontSize: 30, fontWeight: 900 })}>{d.title}</div>
        <div style={box({ right: 24, top: 18, fontSize: 22, fontWeight: 800, color: "#3C8C5A", opacity: s.saved ?? 0 })}>✓ {d.saved}</div>
      </div>
      <div style={box({ left: 0, top: 70, width: w, height: h - 70, transform: `translateY(${(s.scrollUp ?? 0) * 40}px)` })}>
        <div style={box({ left: 30, top: 22, fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 })}>
          {d.section}
          {(s.done ?? 0) > 0.01 ? (
            <span style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", backgroundColor: "#3C8C5A", borderRadius: 14, padding: "4px 12px", opacity: s.done, transform: `scale(${0.8 + 0.2 * (s.done ?? 0)})` }}>✓ {d.done}</span>
          ) : null}
        </div>
        {/* таблица */}
        <div style={box({ left: 30, top: 74, width: w * 0.56, height: 300 })}>
          {[d.columns as readonly string[], ...rows].map((r, i) => (
            <div key={i} style={box({ left: 0, top: i * 56, width: w * 0.56, height: 56, display: "flex", borderBottom: "2px solid #E4EAF2", backgroundColor: i === 0 ? "#F4F7FB" : s.highlightRow === i - 1 ? "rgba(255,212,59,0.35)" : "transparent" })}>
              {r.map((c, k) => (
                <div key={k} style={{ width: `${colW[k] * 100}%`, fontSize: i === 0 ? 19 : 22, fontWeight: i === 0 ? 900 : 700, lineHeight: "56px", paddingLeft: 8, color: k === 3 && c.startsWith("+") ? "#3C8C5A" : k === 3 && c.startsWith("−") ? "#C2533F" : INK, position: "relative" }}>
                  {c}
                  {s.cursorRow === i - 1 && k === 2 && blink && !c ? <span style={{ position: "absolute", left: 12, top: 12, width: 3, height: 32, backgroundColor: INK }} /> : null}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* простой график */}
        <div style={box({ left: w * 0.6, top: 74, width: w * 0.37, height: 170, borderRadius: 14, backgroundColor: "#F7F9FC", border: "2px solid #E4EAF2" })}>
          <div style={box({ left: 16, top: 10, fontSize: 20, fontWeight: 800, color: "#6B7A90" })}>{d.chart}</div>
          {plan.map((p, i) => {
            const bx = 22 + i * ((w * 0.37 - 44) / 4);
            const bw = (w * 0.37 - 60) / 8;
            return (
              <div key={i}>
                <div style={box({ left: bx, bottom: 20, width: bw, height: (p - 100) * 3, borderRadius: 4, backgroundColor: "#C9D6E6" })} />
                <div style={box({ left: bx + bw + 4, bottom: 20, width: bw, height: vals[i] ? (vals[i] - 100) * 3 : 0, borderRadius: 4, backgroundColor: YELLOW })} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Окно календаря (маленькое, справа сверху).
const CalendarCard: React.FC<{ a: number }> = ({ a }) => {
  const c = WFH_TEXT.calendar;
  return (
    <div style={box({ right: 16, top: 292, width: 270, padding: "8px 16px", borderRadius: 16, backgroundColor: "#FFFFFF", boxShadow: "0 10px 30px rgba(23,42,70,0.18)", fontFamily, color: INK, opacity: a, transform: `translateY(${(1 - a) * 16}px)` })}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#6B7A90" }}>{c.title}</div>
      <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 8, height: 54, borderRadius: 4, backgroundColor: BLUE }} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{c.meetingTime}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{c.meeting}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 21, fontWeight: 800, color: "#C2533F" }}>{c.deadline}</div>
    </div>
  );
};

// Переписка команды (панель справа): сообщения уже есть к моменту возврата.
const ChatPanel: React.FC<{ a: number; read: number }> = ({ a, read }) => {
  // ширина панели в логических px экрана
  const c = WFH_TEXT.chat;
  return (
    <div style={box({ right: 0, top: 70, bottom: 0, width: 400, backgroundColor: "#F4F7FB", borderLeft: "2px solid #DCE4EE", fontFamily, color: INK, transform: `translateX(${(1 - a) * 400}px)` })}>
      <div style={{ padding: "18px 22px", fontSize: 26, fontWeight: 900, borderBottom: "2px solid #DCE4EE" }}># {c.title}</div>
      {c.msgs.map((m, i) => (
        <div key={i} style={{ margin: "18px 18px 0", padding: "14px 16px", borderRadius: 14, backgroundColor: "#FFFFFF", boxShadow: "0 3px 10px rgba(23,42,70,0.08)", outline: read > i ? "none" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, fontWeight: 800, color: "#6B7A90" }}>
            <span>{m.who}</span>
            <span>{m.time}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, lineHeight: 1.25, backgroundColor: read > i && read < i + 1 ? "rgba(255,212,59,0.35)" : "transparent", borderRadius: 6 }}>{m.text}</div>
        </div>
      ))}
    </div>
  );
};

export type LaptopView = {
  readonly doc: DocState;
  readonly calendar?: number; // 0…1 окно календаря
  readonly chat?: number; // 0…1 панель переписки
  readonly chatRead?: number; // какое сообщение читается (0…2)
  readonly pointer?: { x: number; y: number; click?: number }; // курсор мыши (px экрана)
  readonly clock?: string; // время в углу экрана
};

// Экран ноутбука крупно, вид из-за плеча: экран (правильная сторона),
// клавиатура, две кисти на клавишах. typing — 0…1: пальцы нажимают
// клавиши короткими сериями; hands — руки видны (0 — убраны).
export const LaptopCloseup: React.FC<{ f: number; view: LaptopView; typing?: number; hands?: number; sleeve?: string; skin?: string; warm?: number }> = ({
  f,
  view,
  typing = 0,
  hands = 1,
  sleeve = "#5E9A93",
  skin = "#E6B590",
  warm = 0,
}) => {
  const SW = 1000;
  const SH = 640;
  const sx = 40;
  const sy = 380;
  const Z = 1.32;
  // нажатия: короткие серии по 6–8 кадров, между сериями пауза
  const tap = (k: number) => {
    if (typing <= 0) return 0;
    const cyc = (f + k * 3) % 9;
    return cyc < 3 ? typing * (1 - cyc / 3) : 0;
  };
  return (
    <div style={box({ inset: 0, background: warm ? "linear-gradient(180deg, #3B3550, #5A4A54)" : "linear-gradient(180deg, #DCE6F0, #C9D6E3)" })}>
      {/* корпус экрана */}
      <div style={box({ left: sx - 24, top: sy - 24, width: SW + 48, height: SH + 48, borderRadius: 30, backgroundColor: "#2A2F3A" })} />
      <div style={box({ left: sx, top: sy, width: SW, height: SH, borderRadius: 8, overflow: "hidden" })}>
        {/* содержимое экрана крупнее (масштаб Z), чтобы читалось с телефона */}
        <div style={box({ left: 0, top: 0, width: SW / Z, height: SH / Z, transform: `scale(${Z})`, transformOrigin: "0 0" })}>
          <Doc f={f} s={view.doc} w={SW / Z} h={SH / Z} />
          {view.calendar ? <CalendarCard a={view.calendar} /> : null}
          {view.chat ? <ChatPanel a={view.chat} read={view.chatRead ?? 0} /> : null}
          {view.clock ? <div style={box({ right: view.chat ? 420 : 24, bottom: 14, fontFamily, fontSize: 22, fontWeight: 900, color: "#6B7A90" })}>{view.clock}</div> : null}
        </div>
        {view.pointer ? (
          <svg width={40} height={46} viewBox="0 0 20 23" style={box({ left: view.pointer.x, top: view.pointer.y, transform: `scale(${1 - 0.15 * (view.pointer.click ?? 0)})` })}>
            <path d="M1 1 L1 18 L6 13 L10 21 L13 19.5 L9 12 L16 12 Z" fill="#FFFFFF" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      {/* основание и клавиатура (в перспективе) */}
      <div style={box({ left: 0, top: sy + SH + 24, width: 1080, height: 520, background: "linear-gradient(180deg, #C3CAD5, #AEB6C4)", clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" })} />
      {Array.from({ length: 4 }).map((_, r) => (
        <div key={r} style={box({ left: 90 - r * 18, top: sy + SH + 60 + r * 62, width: 900 + r * 36, height: 50, display: "flex", gap: 8 })}>
          {Array.from({ length: 12 }).map((__, k) => (
            <div key={k} style={{ flex: 1, borderRadius: 8, backgroundColor: "#E9EDF2", boxShadow: "0 4px 0 #8F98A6" }} />
          ))}
        </div>
      ))}
      {/* тачпад */}
      <div style={box({ left: 400, top: sy + SH + 330, width: 280, height: 150, borderRadius: 14, backgroundColor: "#B9C0CC" })} />
      {/* кисти на клавишах: пальцы касаются клавиш */}
      {hands > 0.01
        ? ([-1, 1] as const).map((side) => {
            const hx = side < 0 ? 300 : 700;
            const hy = sy + SH + 120 + (1 - hands) * 400;
            return (
              <div key={side} style={box({ left: hx - 130, top: hy, width: 260, height: 600 })}>
                {/* рукав и предплечье снизу */}
                <div style={box({ left: 70 + side * 30, top: 150, width: 130, height: 500, borderRadius: 60, backgroundColor: sleeve, rotate: `${side * -14}deg`, transformOrigin: "50% 0" })} />
                <div style={box({ left: 70, top: 60, width: 120, height: 150, borderRadius: "50px 50px 40px 40px", backgroundColor: skin })} />
                {[0, 1, 2, 3].map((k) => {
                  const fx = 62 + k * 34 + (side > 0 ? 0 : 0);
                  const press = tap(k + (side > 0 ? 4 : 0));
                  return <div key={k} style={box({ left: fx, top: 14 + press * 10 + Math.abs(k - 1.5) * 8, width: 28, height: 80, borderRadius: 14, backgroundColor: skin, boxShadow: "0 4px 6px rgba(23,42,70,0.18)" })} />;
                })}
                <div style={box({ left: side < 0 ? 172 : 40, top: 110, width: 40, height: 70, borderRadius: 20, backgroundColor: skin, rotate: `${side * 30}deg` })} />
              </div>
            );
          })
        : null}
    </div>
  );
};

// ---------- Часы крупно (цифровые на экране) ----------
export const BigClock: React.FC<{ time: string; a?: number; dark?: boolean; label?: string }> = ({ time, a = 1, dark, label }) => (
  <div style={box({ inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: dark ? "#1E2A44" : "#F7F4EE", fontFamily, color: dark ? "#FFFFFF" : INK })}>
    <div style={{ fontSize: 260, fontWeight: 900, letterSpacing: 6, opacity: a, transform: `scale(${0.94 + 0.06 * a})` }}>{time}</div>
    {label ? <div style={{ fontSize: 46, fontWeight: 800, opacity: a * 0.8 }}>{label}</div> : null}
  </div>
);

// ---------- Телефон ----------
const PZ = 1.22;
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily, color: INK })}>
        {/* содержимое крупнее, чтобы читалось с телефона */}
        <div style={{ position: "absolute", left: 0, top: 0, width: `${100 / PZ}%`, height: `${100 / PZ}%`, transform: `scale(${PZ})`, transformOrigin: "0 0" }}>{children}</div>
      </div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Рука, держащая телефон снизу: ладонь за корпусом, пальцы на краях.
export const HoldingHand: React.FC<{ x: number; y: number; w: number; sleeve: string; skin: string; side?: 1 | -1 }> = ({ x, y, w, sleeve, skin, side = 1 }) => {
  const h = w * 2.05;
  return (
    <>
      <div style={box({ left: side > 0 ? x + w * 0.5 : x - w * 0.15, top: y + h * 0.8, width: w * 0.62, height: h * 0.7, borderRadius: w * 0.2, backgroundColor: sleeve, rotate: `${side * -16}deg`, transformOrigin: "50% 0%" })} />
      <div style={box({ left: side > 0 ? x + w * 0.62 : x - w * 0.1, top: y + h * 0.6, width: w * 0.46, height: w * 0.66, borderRadius: w * 0.2, backgroundColor: skin, rotate: `${side * -12}deg` })} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: side > 0 ? x - w * 0.075 : x + w * 0.985, top: y + h * (0.6 + i * 0.08), width: w * 0.09, height: w * 0.12, borderRadius: w * 0.05, backgroundColor: skin })} />
      ))}
    </>
  );
};

// Указательный палец, касающийся экрана в точке (x, y): касание press 0…1.
export const TapFinger: React.FC<{ x: number; y: number; press: number; skin: string; sleeve: string; a?: number }> = ({ x, y, press, skin, sleeve, a = 1 }) => (
  <div style={box({ left: x - 30, top: y - 6 + (1 - press) * 26, width: 60, height: 700, opacity: a })}>
    <div style={box({ left: 6, top: 0, width: 48, height: 150, borderRadius: 24, backgroundColor: skin, boxShadow: "0 8px 14px rgba(20,30,60,0.25)" })} />
    <div style={box({ left: -30, top: 120, width: 140, height: 190, borderRadius: 60, backgroundColor: skin })} />
    <div style={box({ left: -40, top: 280, width: 170, height: 420, borderRadius: 60, backgroundColor: sleeve })} />
  </div>
);

export const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div style={box({ left: 40, right: 40, top: 22, display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800 })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Календарь одного родителя на два дня (папа): встреча и свободное окно.
// mark — мама отмечает время окончания уроков (0…1).
export const TwoDays: React.FC<{ f: number; mark: number; w: number }> = ({ mark, w }) => {
  const p = WFH_TEXT.plan;
  return (
    <div style={box({ inset: 0, padding: 0 })}>
      <StatusBar time="20:05" />
      <div style={box({ left: 30, top: 80, fontSize: 34, fontWeight: 900 })}>{WFH_TEXT.dadCal.title}</div>
      {p.days.map((d, i) => {
        const busy = d.busy === p.meeting;
        return (
          <div key={d.day} style={box({ left: 24, right: 24, top: 160 + i * 330, height: 300, borderRadius: 22, backgroundColor: "#FFFFFF", boxShadow: "0 4px 14px rgba(23,42,70,0.08)" })}>
            <div style={box({ left: 24, top: 18, fontSize: 32, fontWeight: 900 })}>{d.day}</div>
            {/* шкала времени 12:00–15:00 */}
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={box({ left: 24, top: 80 + k * 52, width: w - 100, height: 2, backgroundColor: "#E4EAF2" })}>
                <div style={box({ left: 0, top: -14, fontSize: 18, fontWeight: 700, color: "#8A97AA" })}>{12 + k}:00</div>
              </div>
            ))}
            <div style={box({ left: 100, top: 108, width: w - 190, height: 92, borderRadius: 14, backgroundColor: busy ? "#DCE7F6" : "#E6F4EA", borderLeft: `8px solid ${busy ? BLUE : "#3C8C5A"}`, fontSize: 28, fontWeight: 900, lineHeight: "92px", paddingLeft: 20, boxSizing: "border-box", color: busy ? INK : "#2E6E46" })}>
              {d.busy}
            </div>
            {/* мама отмечает окончание уроков: 13:00 */}
            <div style={box({ left: 90, top: 132, width: (w - 170) * easeInOut(mark), height: 6, borderRadius: 3, backgroundColor: YELLOW })} />
            <div style={box({ right: 30, top: 150, fontSize: 22, fontWeight: 900, color: INK, backgroundColor: YELLOW, borderRadius: 12, padding: "4px 10px", opacity: clamp(mark * 2 - 1) })}>
              {p.school} {p.schoolTime}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Поиск → выдача → страница BalaGo → заявка → отправлено. step — фаза
// интерфейса (меняется после касаний в сцене).
export type PhoneStep = "search" | "results" | "page" | "form" | "sent";
export const SearchFlow: React.FC<{ f: number; step: PhoneStep; typed: number; stepAt: number; pressSend?: number }> = ({ f, step, typed, stepAt, pressSend = 0 }) => {
  const s = WFH_TEXT.search;
  const fm = WFH_TEXT.form;
  const a = appear(f, stepAt, 10);
  const query = s.query.slice(0, Math.round(clamp(typed) * s.query.length));
  const searchBar = (
    <div style={box({ left: 24, right: 24, top: 86, height: 84, borderRadius: 42, backgroundColor: "#FFFFFF", boxShadow: "0 4px 14px rgba(23,42,70,0.12)", display: "flex", alignItems: "center", paddingLeft: 30, gap: 14, fontSize: 28, fontWeight: 800 })}>
      <svg width={32} height={32} viewBox="0 0 24 24">
        <circle cx={10} cy={10} r={7} stroke="#6B7A90" strokeWidth={3} fill="none" />
        <path d="M15 15 L21 21" stroke="#6B7A90" strokeWidth={3} strokeLinecap="round" />
      </svg>
      <span>
        {query}
        {step === "search" && Math.floor(f / 15) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${INK}`, marginLeft: 2 }} /> : null}
      </span>
    </div>
  );
  if (step === "search" || step === "results") {
    return (
      <div style={box({ inset: 0 })}>
        <StatusBar time="20:12" />
        {searchBar}
        {step === "results" ? (
          <div style={box({ left: 24, right: 24, top: 200, opacity: a })}>
            <div style={{ padding: "26px 26px", borderRadius: 22, backgroundColor: "#FFFFFF", boxShadow: "0 6px 18px rgba(23,42,70,0.1)", border: `4px solid ${YELLOW}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <BrandMark size={64} />
                <div>
                  <div style={{ fontSize: 40, fontWeight: 900 }}>{s.resultTitle}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#6B7A90" }}>{s.resultTag}</div>
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 26, fontWeight: 700, lineHeight: 1.3 }}>{s.resultText}</div>
            </div>
            {[0, 1].map((i) => (
              <div key={i} style={{ marginTop: 22, padding: "22px 26px", borderRadius: 22, backgroundColor: "#FFFFFF", opacity: 0.55 }}>
                <div style={{ width: 280 - i * 60, height: 22, borderRadius: 11, backgroundColor: "#D7DEE8" }} />
                <div style={{ marginTop: 14, width: 380, height: 16, borderRadius: 8, backgroundColor: "#E4EAF2" }} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  if (step === "page") {
    return (
      <div style={box({ inset: 0, opacity: a })}>
        <StatusBar time="20:13" />
        <div style={box({ left: 0, right: 0, top: 70, height: 260, backgroundColor: YELLOW, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 })}>
          <BrandMark size={90} />
          <div style={{ fontSize: 46, fontWeight: 900 }}>BalaGo</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{s.resultTag}</div>
        </div>
        <div style={box({ left: 30, right: 30, top: 370 })}>
          {s.page.map((t, i) => (
            <div key={t} style={{ marginTop: 18, padding: "20px 22px", borderRadius: 18, backgroundColor: i === 2 ? INK : "#FFFFFF", color: i === 2 ? "#FFFFFF" : INK, fontSize: 28, fontWeight: 800, textAlign: i === 2 ? "center" : "left", boxShadow: "0 4px 12px rgba(23,42,70,0.08)" }}>
              {i < 2 ? "• " : ""}
              {t}
            </div>
          ))}
        </div>
      </div>
    );
  }
  // заявка
  const sent = step === "sent";
  return (
    <div style={box({ inset: 0 })}>
      <StatusBar time="20:15" />
      <div style={box({ left: 30, right: 30, top: 90, fontSize: 40, fontWeight: 900 })}>{fm.title}</div>
      <div style={box({ left: 30, right: 30, top: 160 })}>
        {fm.fields.map(([k, v], i) => (
          <div key={k} style={{ marginTop: 16, padding: "14px 20px", borderRadius: 16, backgroundColor: "#FFFFFF", boxShadow: "0 3px 10px rgba(23,42,70,0.08)", opacity: step === "form" ? appear(f, stepAt + i * 8, 10) : 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#6B7A90" }}>{k}</div>
            <div style={{ fontSize: 30, fontWeight: 900 }}>{v}</div>
          </div>
        ))}
      </div>
      {sent ? (
        <div style={box({ left: 30, right: 30, top: 640, padding: "26px 20px", borderRadius: 20, backgroundColor: "#E6F4EA", color: "#2E6E46", fontSize: 34, fontWeight: 900, textAlign: "center", opacity: a, transform: `scale(${0.92 + 0.08 * a})` })}>
          ✓ {fm.sent}
        </div>
      ) : (
        <div style={box({ left: 60, right: 60, top: 660, height: 100, borderRadius: 50, backgroundColor: YELLOW, fontSize: 38, fontWeight: 900, lineHeight: "100px", textAlign: "center", transform: `scale(${1 - 0.06 * pressSend})` })}>{fm.send}</div>
      )}
    </div>
  );
};

// Логотип BalaGo (public/assets/logo.png, круглый).
export const BrandMark: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile("assets/logo.png")} style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }} />
);
