// Экраны фильма №35 (настоящий текст, крупно):
//   • семейное приложение папы «Үй-бүлөнүн күн тартиби» — небольшое, но
//     полезное: дни недели, 2–3 строки поездок, кто везёт; изменения
//     сохраняются успешно (без ошибок и сбоев);
//   • рабочий календарь (сетка часов, встречи), редактор кода, доска
//     проекта, сообщение школы, переписка с коллегой, недописанный отчёт;
//   • страница BalaGo (отдельный фирменный стиль, без выдуманного адреса),
//     форма предварительной заявки, семейный список дел.
import { Img, staticFile } from "remotion";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { PHT_TEXT, PHT_WEEK } from "../script";
import { abs, AppIcon, C, Check, EmptyBox, font } from "./kit";

const T = PHT_TEXT;

// ---------- Семейное приложение ----------
export type AppRow = {
  readonly time: string;
  readonly title: string;
  readonly who: string;
  readonly hi?: number; // выделение строки (жёлтая рамка) 0…1
  readonly done?: number; // галочка 0…1
  readonly whoNext?: string; // новый исполнитель
  readonly whoK?: number; // переход к whoNext 0…1
  readonly timeNext?: string; // новое время
  readonly timeK?: number;
  readonly k?: number; // появление строки
  readonly dy?: number; // смещение строки (перенос), px
};

const WhoChip: React.FC<{ readonly who: string; readonly s: number }> = ({ who, s }) => (
  <div
    style={{
      padding: `${s * 0.18}px ${s * 0.42}px`,
      borderRadius: s,
      backgroundColor: who === T.app.dad ? C.navy : "#DCE3EC",
      color: who === T.app.dad ? C.white : C.navy,
      fontWeight: 900,
      fontSize: s * 0.62,
      whiteSpace: "nowrap",
    }}
  >
    {who}
  </div>
);

// Плавная смена значения: старое уходит вверх, новое приходит снизу.
const Swap: React.FC<{ readonly a: React.ReactNode; readonly b: React.ReactNode; readonly k: number; readonly h: number }> = ({ a, b, k, h }) => {
  const e = easeInOut(k);
  return (
    <div style={{ position: "relative", height: h, overflow: "hidden" }}>
      <div style={{ transform: `translateY(${-e * h}px)`, opacity: 1 - e }}>{a}</div>
      <div style={abs({ left: 0, top: 0, transform: `translateY(${(1 - e) * h}px)`, opacity: e })}>{b}</div>
    </div>
  );
};

export const ScheduleApp: React.FC<{
  readonly w: number; // ширина экрана приложения
  readonly day?: number; // индекс выбранного дня (PHT_WEEK) или -1
  readonly dayLabel?: string; // подпись над строками («Эртең», «Бүгүн»…)
  readonly rows: readonly AppRow[];
  readonly footer?: React.ReactNode;
  readonly header?: boolean;
}> = ({ w, day = 0, dayLabel, rows, footer, header = true }) => {
  const s = w / 100; // 1 % ширины
  return (
    <div style={{ width: w, fontFamily: font, color: C.navy, padding: `${s * 4}px ${s * 5}px`, boxSizing: "border-box" }}>
      {header ? (
        <div style={{ display: "flex", alignItems: "center", gap: s * 3 }}>
          <AppIcon size={s * 11} />
          <div style={{ fontSize: s * 6.2, fontWeight: 900, lineHeight: 1.1 }}>{T.app.title}</div>
        </div>
      ) : null}
      {day >= 0 ? (
        <div style={{ display: "flex", gap: s * 1.6, marginTop: s * 5 }}>
          {PHT_WEEK.map((d, i) => (
            <div
              key={d.id}
              style={{
                flex: 1,
                textAlign: "center",
                padding: `${s * 2}px 0`,
                borderRadius: s * 3,
                backgroundColor: i === day ? C.yellow : C.white,
                border: `${s * 0.4}px solid ${i === day ? C.yellow : C.line}`,
                fontSize: s * 4.4,
                fontWeight: 900,
              }}
            >
              {d.short}
            </div>
          ))}
        </div>
      ) : null}
      {dayLabel ? <div style={{ marginTop: s * 4.5, fontSize: s * 4.6, fontWeight: 800, color: C.grey }}>{dayLabel}</div> : null}
      <div style={{ marginTop: s * 2.5, display: "flex", flexDirection: "column", gap: s * 3 }}>
        {rows.map((r, i) => {
          const k = r.k ?? 1;
          const hi = r.hi ?? 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: s * 3,
                padding: `${s * 3.6}px ${s * 4}px`,
                borderRadius: s * 4.5,
                backgroundColor: C.white,
                boxShadow: `0 ${s * 1}px ${s * 3}px rgba(20,36,59,0.10), 0 0 0 ${s * 0.9 * hi}px ${C.yellow}`,
                opacity: clamp(k * 1.5),
                transform: `translateY(${(1 - k) * s * 6 + (r.dy ?? 0)}px)`,
              }}
            >
              <div style={{ width: s * 21, fontSize: s * 7.4, fontWeight: 900, letterSpacing: -0.5 }}>
                {r.timeNext ? (
                  <Swap a={r.time} b={r.timeNext} k={r.timeK ?? 0} h={s * 9.4} />
                ) : (
                  r.time
                )}
              </div>
              <div style={{ flex: 1, fontSize: s * 5.2, fontWeight: 800, lineHeight: 1.15 }}>{r.title}</div>
              {r.whoNext ? (
                <Swap a={<WhoChip who={r.who} s={s * 8} />} b={<WhoChip who={r.whoNext} s={s * 8} />} k={r.whoK ?? 0} h={s * 8.6} />
              ) : (
                <WhoChip who={r.who} s={s * 8} />
              )}
              {r.done !== undefined ? <Check size={s * 8} k={r.done} /> : null}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
};

// Окно на ноутбуке/мониторе (рамка + заголовок окна).
export const Window: React.FC<{ readonly w: number; readonly h: number; readonly title?: string; readonly children?: React.ReactNode; readonly bar?: string }> = ({ w, h, title, children, bar = "#E9ECF1" }) => (
  <div style={{ width: w, height: h, borderRadius: 18, overflow: "hidden", backgroundColor: C.white, boxShadow: C.shadow, fontFamily: font, color: C.navy, position: "relative" }}>
    <div style={{ height: 52, backgroundColor: bar, display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
      {["#F27A6B", "#F5C451", "#6CC788"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: c }} />
      ))}
      <div style={{ marginLeft: 16, fontSize: 24, fontWeight: 800, color: C.ink2 }}>{title}</div>
    </div>
    <div style={{ position: "relative", height: h - 52 }}>{children}</div>
  </div>
);

// ---------- Рабочий календарь ----------
export type CalEvent = {
  readonly from: number; // часы (11.5 = 11:30)
  readonly to: number;
  readonly title: string;
  readonly color?: string;
  readonly k?: number; // появление
  readonly hi?: number;
  readonly icon?: "family" | "work";
  readonly half?: "L" | "R"; // два события в одно время — рядом
};

export const hhmm = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

export const WorkCalendar: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly startHour: number;
  readonly endHour: number;
  readonly events: readonly CalEvent[];
  readonly title?: string;
  readonly nowHour?: number;
}> = ({ w, h, startHour, endHour, events, title = T.work.calendar, nowHour }) => {
  const head = 92;
  const ph = (h - head - 20) / (endHour - startHour);
  const y = (hour: number) => head + (hour - startHour) * ph;
  const left = 132;
  return (
    <div style={{ position: "relative", width: w, height: h, fontFamily: font, color: C.navy, backgroundColor: C.white, borderRadius: 32, boxShadow: C.shadow, overflow: "hidden" }}>
      <div style={abs({ left: 34, top: 22, fontSize: 40, fontWeight: 900 })}>{title}</div>
      {Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i).map((hr) => (
        <div key={hr}>
          <div style={abs({ left: 30, top: y(hr) - 16, width: 90, fontSize: 28, fontWeight: 800, color: C.grey })}>{hhmm(hr)}</div>
          <div style={abs({ left, right: 24, top: y(hr), height: 2, backgroundColor: C.line })} />
        </div>
      ))}
      {events.map((e, i) => {
        const k = e.k ?? 1;
        const top = y(e.from) + 4;
        const height = Math.max(40, (e.to - e.from) * ph - 8);
        const span = w - left - 10 - 34;
        const x0 = left + 10 + (e.half === "R" ? span / 2 + 6 : 0);
        return (
          <div
            key={i}
            style={abs({
              left: x0,
              width: e.half ? span / 2 - 6 : span,
              top,
              height,
              borderRadius: 18,
              backgroundColor: e.color ?? "#DCE3EC",
              borderLeft: `12px solid ${e.icon === "family" ? C.yellow : C.navy}`,
              boxShadow: `0 6px 16px rgba(20,36,59,0.12), 0 0 0 ${6 * (e.hi ?? 0)}px ${C.yellow}`,
              padding: "10px 18px",
              boxSizing: "border-box",
              opacity: clamp(k * 1.5),
              transform: `scale(${0.9 + 0.1 * k})`,
              transformOrigin: "0 50%",
              overflow: "hidden",
            })}
          >
            <div style={{ fontSize: Math.min(38, height * 0.42), fontWeight: 900, lineHeight: 1.1 }}>{e.title}</div>
            {height > 90 ? <div style={{ fontSize: 28, fontWeight: 800, color: C.ink2, marginTop: 4 }}>{`${hhmm(e.from)}–${hhmm(e.to)}`}</div> : null}
          </div>
        );
      })}
      {nowHour !== undefined ? (
        <div style={abs({ left: left - 8, right: 24, top: y(nowHour) - 2, height: 4, backgroundColor: "#E2574C" })}>
          <div style={abs({ left: -8, top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: "#E2574C" })} />
        </div>
      ) : null}
    </div>
  );
};

// ---------- Редактор кода (крупно, несколько строк) ----------
const CODE: readonly (readonly [string, string][])[] = [
  [["#8190A3", "// Үй-бүлөнүн күн тартиби"]],
  [["#B05FD0", "const "], ["#14243B", "trips = ["]],
  [["#14243B", "  { time: "], ["#C77B1E", '"07:40"'], ["#14243B", ", who: "], ["#C77B1E", '"Ата"'], ["#14243B", " },"]],
  [["#14243B", "  { time: "], ["#C77B1E", '"13:20"'], ["#14243B", ", who: "], ["#C77B1E", '"Апа"'], ["#14243B", " },"]],
  [["#14243B", "];"]],
  [["#2E7DBA", "remind"], ["#14243B", "(trips);"]],
];

export const CodeCard: React.FC<{ readonly w: number; readonly typed?: number; readonly f?: number }> = ({ w, typed = 1, f = 0 }) => {
  const all = CODE.map((l) => l.map(([, t]) => t).join("")).join("\n");
  const shown = Math.round(all.length * clamp(typed));
  let left = shown;
  return (
    <Window w={w} h={w * 0.62} title={T.work.file} bar="#E7EAF0">
      <div style={{ padding: "26px 34px", fontFamily: "monospace", fontSize: w * 0.04, lineHeight: 1.55, fontWeight: 700 }}>
        {CODE.map((line, i) => {
          const parts = line.map(([c, t], j) => {
            const n = Math.max(0, Math.min(t.length, left));
            left -= t.length;
            return (
              <span key={j} style={{ color: c, fontFamily: "inherit" }}>
                {t.slice(0, n)}
              </span>
            );
          });
          left -= 1;
          return (
            <div key={i} style={{ display: "flex", whiteSpace: "pre", minHeight: w * 0.062 }}>
              <span style={{ width: w * 0.06, color: "#B7C0CD" }}>{i + 1}</span>
              {parts}
              {left < 0 && left > -2 - (line.length ? 0 : 0) && Math.floor(f / 15) % 2 === 0 ? <span style={{ width: 4, backgroundColor: C.navy }} /> : null}
            </div>
          );
        })}
      </div>
    </Window>
  );
};

// ---------- Доска проекта (мама) ----------
export const ProjectBoard: React.FC<{ readonly w: number; readonly moved?: number }> = ({ w, moved = 0 }) => {
  const cols = ["Пландар", "Иште", "Даяр"];
  const notes = [
    [0, 0, "#FFE59A"],
    [0, 1, "#CFE3F5"],
    [1, 0, "#D5EDD9"],
    [2, 0, "#FFE59A"],
  ] as const;
  const cw = (w - 80) / 3;
  return (
    <Window w={w} h={w * 0.66} title={T.work.project}>
      <div style={{ display: "flex", gap: 16, padding: 24 }}>
        {cols.map((c) => (
          <div key={c} style={{ width: cw - 6, height: w * 0.48, backgroundColor: "#F3F4F7", borderRadius: 18, padding: 14, boxSizing: "border-box" }}>
            <div style={{ fontSize: w * 0.042, fontWeight: 900, color: C.ink2, marginBottom: 12 }}>{c}</div>
          </div>
        ))}
      </div>
      {notes.map(([col, row, color], i) => {
        const move = i === 1 ? easeInOut(moved) : 0;
        const x = 24 + 14 + lerp(col, 1, move) * (cw + 10);
        const y = 24 + w * 0.08 + lerp(row, 1, move) * (w * 0.15);
        return (
          <div key={i} style={abs({ left: x, top: y, width: cw - 34, height: w * 0.12, borderRadius: 12, backgroundColor: color, boxShadow: "0 6px 12px rgba(20,36,59,0.14)", rotate: `${(i % 2 ? 1 : -1) * 2}deg` })}>
            <div style={abs({ left: 14, top: 16, width: "62%", height: 10, borderRadius: 5, backgroundColor: "rgba(20,36,59,0.35)" })} />
            <div style={abs({ left: 14, top: 36, width: "44%", height: 10, borderRadius: 5, backgroundColor: "rgba(20,36,59,0.22)" })} />
          </div>
        );
      })}
    </Window>
  );
};

// ---------- Сообщение школы ----------
export const SchoolMessage: React.FC<{ readonly w: number; readonly k?: number; readonly from: string; readonly to: string; readonly arrowK?: number }> = ({ w, k = 1, from, to, arrowK = 1 }) => (
  <div style={{ width: w, padding: w * 0.06, boxSizing: "border-box", borderRadius: w * 0.06, backgroundColor: C.white, boxShadow: C.shadow, fontFamily: font, color: C.navy, opacity: clamp(k * 1.4), transform: `translateY(${(1 - k) * 40}px)` }}>
    <div style={{ display: "flex", alignItems: "center", gap: w * 0.03 }}>
      <svg width={w * 0.11} height={w * 0.11} viewBox="0 0 100 100">
        <rect width={100} height={100} rx={24} fill="#2F4A7A" />
        <path d="M 18 46 L 50 24 L 82 46 Z" fill="#FFFFFF" />
        <rect x={26} y={46} width={48} height={32} fill="#FFFFFF" />
        <rect x={44} y={58} width={12} height={20} fill={C.yellow} />
      </svg>
      <div style={{ fontSize: w * 0.05, fontWeight: 900, color: C.grey }}>{T.school.from}</div>
    </div>
    <div style={{ fontSize: w * 0.085, fontWeight: 900, marginTop: w * 0.04, lineHeight: 1.1 }}>{T.school.title}</div>
    <div style={{ display: "flex", alignItems: "center", gap: w * 0.04, marginTop: w * 0.05, fontSize: w * 0.11, fontWeight: 900 }}>
      <span style={{ color: C.grey, textDecoration: arrowK > 0.5 ? "line-through" : "none" }}>{from}</span>
      <span style={{ opacity: clamp(arrowK * 2) }}>→</span>
      <span style={{ backgroundColor: C.yellow, borderRadius: w * 0.03, padding: `0 ${w * 0.03}px`, opacity: clamp(arrowK * 2 - 0.5) }}>{to}</span>
    </div>
  </div>
);

// ---------- Переписка с коллегой ----------
export const ChatCard: React.FC<{ readonly w: number; readonly sentK: number; readonly replyK: number; readonly typed?: number }> = ({ w, sentK, replyK, typed = 1 }) => {
  const ask = T.work.colleagueAsk;
  return (
    <div style={{ width: w, padding: w * 0.05, boxSizing: "border-box", borderRadius: w * 0.06, backgroundColor: C.white, boxShadow: C.shadow, fontFamily: font, color: C.navy }}>
      <div style={{ display: "flex", alignItems: "center", gap: w * 0.03, paddingBottom: w * 0.03, borderBottom: `2px solid ${C.line}` }}>
        <div style={{ width: w * 0.1, height: w * 0.1, borderRadius: w * 0.05, backgroundColor: "#B98B6E", color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: w * 0.05 }}>К</div>
        <div style={{ fontSize: w * 0.055, fontWeight: 900 }}>{T.work.colleague}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: w * 0.05, opacity: clamp(sentK * 1.5), transform: `translateY(${(1 - sentK) * 20}px)` }}>
        <div style={{ maxWidth: "82%", padding: `${w * 0.035}px ${w * 0.045}px`, borderRadius: `${w * 0.05}px ${w * 0.05}px ${w * 0.01}px ${w * 0.05}px`, backgroundColor: C.navy, color: C.white, fontSize: w * 0.058, fontWeight: 800, lineHeight: 1.2 }}>
          {ask.slice(0, Math.round(ask.length * clamp(typed)))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: w * 0.035, opacity: clamp(replyK * 1.5), transform: `translateY(${(1 - replyK) * 20}px)` }}>
        <div style={{ padding: `${w * 0.035}px ${w * 0.05}px`, borderRadius: `${w * 0.05}px ${w * 0.05}px ${w * 0.05}px ${w * 0.01}px`, backgroundColor: "#ECEFF4", fontSize: w * 0.065, fontWeight: 900 }}>
          {T.work.colleagueOk} 👍
        </div>
      </div>
    </div>
  );
};

// ---------- Недописанный отчёт (повторяющийся мотив) ----------
export const ReportDoc: React.FC<{ readonly w: number; readonly f: number; readonly typed?: number; readonly evening?: boolean }> = ({ w, f, typed = 0, evening }) => {
  const line = "Жыйынтыгында, долбоордун";
  const more = " экинчи этабы";
  const shown = line + more.slice(0, Math.round(more.length * clamp(typed)));
  return (
    <Window w={w} h={w * 0.7} title={T.work.report} bar={evening ? "#D9DDE6" : "#E9ECF1"}>
      <div style={{ padding: "30px 40px", fontFamily: font, color: C.navy }}>
        <div style={{ fontSize: w * 0.06, fontWeight: 900 }}>{T.work.report}</div>
        <div style={{ fontSize: w * 0.042, fontWeight: 800, color: C.grey, marginTop: 10 }}>{T.work.reportLine}</div>
        {[0.9, 0.8, 0.86].map((k, i) => (
          <div key={i} style={{ width: `${k * 100}%`, height: w * 0.022, borderRadius: 6, backgroundColor: "#DDE2EA", marginTop: w * 0.032 }} />
        ))}
        <div style={{ fontSize: w * 0.046, fontWeight: 700, marginTop: w * 0.04, lineHeight: 1.25 }}>
          {shown}
          <span style={{ display: "inline-block", width: 4, height: w * 0.055, marginLeft: 4, verticalAlign: "middle", backgroundColor: C.navy, opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0 }} />
        </div>
      </div>
    </Window>
  );
};

// ---------- Страница BalaGo ----------
// Фирменный стиль BalaGo (жёлтый, тёмно-синий, логотип), визуально
// отделён от семейного приложения. Адрес сайта не показывается.
export const BalaGoPage: React.FC<{ readonly w: number; readonly f: number; readonly from?: number; readonly scroll?: number }> = ({ w, f, from = 0, scroll = 0 }) => {
  const k = (i: number) => clamp((f - from - i * 6) / 8);
  const s = w / 100;
  return (
    <div style={{ width: w, fontFamily: font, color: C.navy, backgroundColor: C.white, transform: `translateY(${-scroll}px)` }}>
      <div style={{ backgroundColor: C.yellow, padding: `${s * 5}px ${s * 6}px ${s * 7}px`, borderRadius: `0 0 ${s * 7}px ${s * 7}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: s * 4, opacity: k(0) }}>
          <div style={{ width: s * 20, height: s * 20, borderRadius: s * 10, overflow: "hidden", backgroundColor: C.white, boxShadow: C.shadowSm, flexShrink: 0 }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: s * 11, fontWeight: 900, lineHeight: 1 }}>{T.page.brand}</div>
            <div style={{ fontSize: s * 5.6, fontWeight: 800, marginTop: s * 1.5 }}>{T.page.tagline}</div>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: s * 1.5, marginTop: s * 5, padding: `${s * 1.4}px ${s * 3.4}px`, borderRadius: s * 4, backgroundColor: C.navy, color: C.white, fontSize: s * 4.6, fontWeight: 900, opacity: k(1) }}>
          <svg width={s * 4} height={s * 5} viewBox="0 0 20 26">
            <path d="M 10 1 C 4 1 1 5.5 1 10 C 1 16 10 25 10 25 C 10 25 19 16 19 10 C 19 5.5 16 1 10 1 Z" fill={C.yellow} />
            <circle cx={10} cy={10} r={3.6} fill={C.navy} />
          </svg>
          {T.page.city}
        </div>
      </div>
      <div style={{ padding: `${s * 6}px ${s * 6}px`, opacity: k(2) }}>
        <div style={{ fontSize: s * 5.4, fontWeight: 800, color: C.ink2, lineHeight: 1.25 }}>{T.page.lead}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: s * 6, padding: `${s * 5}px ${s * 4}px`, borderRadius: s * 5, backgroundColor: C.bg }}>
          {T.page.route.map((r, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i > 0 ? <div style={{ fontSize: s * 7, fontWeight: 900, color: C.grey, opacity: k(3 + i) }}>→</div> : null}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s * 1.5, opacity: k(3 + i) }}>
                <RouteIcon kind={r === "МЕКТЕП" ? "school" : "home"} size={s * 13} />
                <div style={{ fontSize: s * 5, fontWeight: 900 }}>{r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RouteIcon: React.FC<{ readonly kind: "home" | "school"; readonly size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={48} fill={kind === "home" ? C.yellow : C.navy} />
    {kind === "home" ? (
      <g>
        <path d="M 24 50 L 50 28 L 76 50" fill="none" stroke={C.navy} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 32 47 L 32 74 L 68 74 L 68 47" fill="none" stroke={C.navy} strokeWidth={7} strokeLinejoin="round" />
        <rect x={45} y={56} width={10} height={18} fill={C.navy} />
      </g>
    ) : (
      <g>
        <path d="M 22 44 L 50 26 L 78 44 Z" fill={C.white} />
        <rect x={28} y={44} width={44} height={30} fill={C.white} />
        <rect x={44} y={56} width={12} height={18} fill={C.yellow} />
        <rect x={33} y={50} width={8} height={8} fill={C.navy} />
        <rect x={59} y={50} width={8} height={8} fill={C.navy} />
      </g>
    )}
  </svg>
);

// ---------- Форма предварительной заявки ----------
// fills — кадры, когда заполняется поле; hiAt — выделение по очереди.
export const RequestForm: React.FC<{ readonly w: number; readonly f: number; readonly fills: readonly number[]; readonly tapAt: number; readonly sentAt: number }> = ({ w, f, fills, tapAt, sentAt }) => {
  const s = w / 100;
  // сначала уходит форма (6 кадров), затем появляется подтверждение
  const gone = clamp((f - sentAt) / 6);
  const sent = clamp((f - sentAt - 5) / 8);
  const press = f >= tapAt && f < tapAt + 6 ? 1 : 0;
  const values = [null, null, T.form.time] as const;
  return (
    <div style={{ width: w, fontFamily: font, color: C.navy, padding: `${s * 6}px`, boxSizing: "border-box", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: s * 3 }}>
        <div style={{ width: s * 12, height: s * 12, borderRadius: s * 6, overflow: "hidden", backgroundColor: C.white, boxShadow: C.shadowSm }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: s * 7.4, fontWeight: 900 }}>{T.form.title}</div>
      </div>
      <div style={{ opacity: 1 - gone, marginTop: s * 6 }}>
        {T.form.fields.map((label, i) => {
          const fill = clamp((f - fills[i]) / 10);
          const active = f >= fills[i] - 4 && (i === fills.length - 1 ? f < tapAt : f < fills[i + 1] - 4);
          const v = values[i];
          return (
            <div key={label} style={{ marginBottom: s * 4.5 }}>
              <div style={{ fontSize: s * 5.2, fontWeight: 900, marginBottom: s * 1.6 }}>{label}</div>
              <div style={{ height: s * 13, borderRadius: s * 3.4, border: `${s * 0.7}px solid ${active ? C.yellow : C.line}`, backgroundColor: active ? "#FFFBEA" : C.white, display: "flex", alignItems: "center", padding: `0 ${s * 4}px`, boxSizing: "border-box" }}>
                {v ? (
                  <span style={{ fontSize: s * 6.4, fontWeight: 900 }}>{v.slice(0, Math.round(v.length * fill))}</span>
                ) : (
                  // условные данные (без реальных адресов): заполненная полоса
                  <div style={{ display: "flex", gap: s * 1.6 }}>
                    {[22, 14, 18].map((ww, j) => (
                      <div key={j} style={{ width: s * ww * clamp(fill * 3 - j), height: s * 3.4, borderRadius: s * 1.7, backgroundColor: "#AAB5C6" }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: s * 6, height: s * 15, borderRadius: s * 7.5, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 6.6, fontWeight: 900, transform: `scale(${1 - press * 0.04})`, boxShadow: C.shadowSm }}>
          {T.form.send}
        </div>
      </div>
      {sent > 0 ? (
        <div style={abs({ left: s * 6, right: s * 6, top: s * 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: sent, transform: `translateY(${(1 - sent) * 30}px)` })}>
          <Check size={s * 26} k={clamp((f - sentAt - 5) / 14)} />
          <div style={{ fontSize: s * 8.4, fontWeight: 900, marginTop: s * 5 }}>{T.form.sent}</div>
          <div style={{ fontSize: s * 6, fontWeight: 800, color: C.ink2, marginTop: s * 3, opacity: clamp((f - sentAt - 16) / 8) }}>{T.form.next}</div>
        </div>
      ) : null}
    </div>
  );
};

// ---------- Семейный список дел ----------
export const TaskList: React.FC<{ readonly w: number; readonly f: number; readonly typeFrom: number; readonly typeTo: number }> = ({ w, f, typeFrom, typeTo }) => {
  const s = w / 100;
  const item = T.tasks.item;
  const n = Math.round(item.length * clamp((f - typeFrom) / Math.max(1, typeTo - typeFrom)));
  const typing = f >= typeFrom - 6;
  return (
    <div style={{ width: w, fontFamily: font, color: C.navy, padding: `${s * 5}px`, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: s * 3 }}>
        <AppIcon size={s * 11} />
        <div style={{ fontSize: s * 7, fontWeight: 900 }}>{T.tasks.title}</div>
      </div>
      {[["Нан, сүт алуу", true]].map(([t, d], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: s * 3.5, marginTop: s * 4.5, padding: `${s * 3}px ${s * 4}px`, borderRadius: s * 4, backgroundColor: C.white, boxShadow: "0 4px 12px rgba(20,36,59,0.08)", color: C.grey }}>
          {d ? <Check size={s * 7.5} fill="#DCE3EC" color={C.grey} /> : <EmptyBox size={s * 7.5} />}
          <div style={{ fontSize: s * 5.2, fontWeight: 800, textDecoration: "line-through" }}>{t as string}</div>
        </div>
      ))}
      {typing ? (
        <div style={{ display: "flex", alignItems: "center", gap: s * 3.5, marginTop: s * 4.5, padding: `${s * 3.6}px ${s * 4}px`, borderRadius: s * 4, backgroundColor: C.white, boxShadow: `0 4px 12px rgba(20,36,59,0.1), 0 0 0 ${s * 0.8}px ${C.yellow}` }}>
          <EmptyBox size={s * 8} />
          <div style={{ fontSize: s * 6.2, fontWeight: 900, lineHeight: 1.15 }}>
            {item.slice(0, n)}
            <span style={{ display: "inline-block", width: 4, height: s * 6.6, marginLeft: 3, verticalAlign: "middle", backgroundColor: C.navy, opacity: n < item.length || Math.floor(f / 15) % 2 === 0 ? 1 : 0 }} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
