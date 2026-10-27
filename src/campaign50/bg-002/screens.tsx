// Крупные вставки BG-002: телефон с уведомлением, календарь на мониторе
// (попытка передвинуть встречу, неделя, эскертме), планшет с BalaGo,
// условная схема маршрута ҮЙ → МЕКТЕП → ҮЙ, условия и заявка.
// Тексты кыргызча, крупные, на экране достаточно долго для чтения.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS, COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { CarTopView } from "../../components/CarTopView";
import { clamp, easeInOut, easeOut, keys, lerp } from "./rig/motion";
import { BG2_TEXT } from "./script";
import { box } from "./shots";

export const INK = "#1E2235";
export const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const StatusBar: React.FC<{ time: string; dark?: boolean; size?: number }> = ({ time, dark, size = 28 }) => (
  <div style={box({ left: 44, right: 44, top: 22, display: "flex", justifyContent: "space-between", fontSize: size, fontWeight: 800, color: dark ? "#FFFFFF" : INK })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// Корпус телефона; дети — содержимое экрана.
export const PhoneFrame: React.FC<{ x: number; y: number; w: number; tilt?: number; shake?: number; children: React.ReactNode }> = ({ x, y, w, tilt = 0, shake = 0, children }) => {
  const h = w * 2.05;
  return (
    <div style={box({ left: x + shake, top: y, width: w, height: h, borderRadius: w * 0.11, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
      <div style={box({ left: w * 0.035, top: w * 0.035, right: w * 0.035, bottom: w * 0.035, borderRadius: w * 0.085, overflow: "hidden", backgroundColor: "#F4F6FA", fontFamily })}>{children}</div>
      <div style={box({ left: w * 0.38, top: w * 0.05, width: w * 0.24, height: w * 0.05, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Корпус планшета (портрет).
export const TabletFrame: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode; tilt?: number }> = ({ x, y, w, h, children, tilt = 0 }) => (
  <div style={box({ left: x, top: y, width: w, height: h, borderRadius: 54, backgroundColor: INK, rotate: `${tilt}deg`, boxShadow: "0 40px 80px rgba(20,30,60,0.35)" })}>
    <div style={box({ left: 24, top: 24, right: 24, bottom: 24, borderRadius: 32, overflow: "hidden", backgroundColor: "#FFFFFF", fontFamily })}>{children}</div>
  </div>
);

// Кончик пальца (касание экрана).
export const Finger: React.FC<{ x: number; y: number; skin: string; sleeve: string; press?: number; rot?: number }> = ({ x, y, skin, sleeve, press = 0, rot = 24 }) => (
  <div style={box({ left: 0, top: 0, rotate: `${rot}deg`, transformOrigin: `${x}px ${y}px` })}>
    <div style={box({ left: x - 70, top: y + 120, width: 150, height: 600, borderRadius: 70, backgroundColor: sleeve })} />
    <div style={box({ left: x - 56, top: y + 40, width: 116, height: 170, borderRadius: 54, backgroundColor: skin })} />
    <div style={box({ left: x - 20, top: y - 6 + press * 6, width: 40, height: 110, borderRadius: 20, backgroundColor: skin, boxShadow: "3px 4px 10px rgba(20,30,60,0.22)" })} />
  </div>
);

// Уведомление на экране телефона: «Уулум: Сабактан кийин ким алып кетет?»
export const NotifyScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const n = BG2_TEXT.notify;
  const a = appear(f, at, 12);
  return (
    <div style={box({ inset: 0, background: "linear-gradient(180deg, #2F4A7A, #14285A)" })}>
      <StatusBar time={n.time} dark />
      <div style={box({ left: 0, right: 0, top: 150, textAlign: "center", color: "#FFFFFF", fontSize: 150, fontWeight: 300 })}>{n.time}</div>
      <div style={box({ left: 34, right: 34, top: 420 + (1 - a) * -80, opacity: a, padding: "30px 34px", borderRadius: 40, backgroundColor: "rgba(255,255,255,0.96)", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 82, height: 82, borderRadius: 41, backgroundColor: "#3E9C6B", color: "#FFFFFF", fontSize: 44, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.from[0]}</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: INK }}>{n.from}</div>
        </div>
        <div style={{ marginTop: 18, fontSize: 52, fontWeight: 800, color: INK, lineHeight: 1.18 }}>{n.text}</div>
      </div>
    </div>
  );
};

// ---------- Календарь ----------
// Шкала часов 13:00–17:00. y часа h (в px внутри рабочей области).
const HOUR_PX = 210;
const hourY = (h: number) => 120 + (h - 13) * HOUR_PX;

const Block: React.FC<{ from: number; to: number; title: string; color: string; ink?: string; x?: number; w?: number; dy?: number; ring?: string; scale?: number; opacity?: number; sub?: string }> = ({ from, to, title, color, ink = "#FFFFFF", x = 180, w = 760, dy = 0, ring, scale = 1, opacity = 1, sub }) => (
  <div
    style={box({
      left: x,
      top: hourY(from) + 6 + dy,
      width: w,
      height: (to - from) * HOUR_PX - 12,
      borderRadius: 22,
      backgroundColor: color,
      color: ink,
      padding: "18px 26px",
      boxSizing: "border-box",
      fontSize: 44,
      fontWeight: 900,
      lineHeight: 1.1,
      boxShadow: ring ? `0 0 0 8px ${ring}, 0 14px 30px rgba(20,30,60,0.25)` : "0 8px 18px rgba(20,30,60,0.15)",
      scale: `${scale}`,
      opacity,
    })}
  >
    {title}
    {sub ? <div style={{ fontSize: 32, fontWeight: 800, opacity: 0.85, marginTop: 6 }}>{sub}</div> : null}
  </div>
);

// Курсор мыши.
export const Cursor: React.FC<{ x: number; y: number; grab?: boolean }> = ({ x, y, grab }) => (
  <svg width={64} height={80} viewBox="0 0 24 30" style={box({ left: x - 6, top: y - 4, overflow: "visible", filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.3))" })}>
    {grab ? <circle cx={4} cy={4} r={7} fill="rgba(255,201,14,0.5)" /> : null}
    <path d="M 1 1 L 1 22 L 6.5 17 L 10 26 L 13.5 24.5 L 10 16 L 17 16 Z" fill="#FFFFFF" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

// День: «Маанилүү жыйын» 14–15, линия «Сабак бүтөт» 15:00, «Кардар менен
// жолугушуу» 15–16. Папа тянет встречу на 16:00 — там «Отчёт талкуулоо»,
// «Бул убакыт бош эмес», встреча возвращается на место.
export const CAL = { grab: 24, drop: 62, back: 108, week: 128, note: 196 } as const;

export const CalendarScreen: React.FC<{ f: number; typeTo: number }> = ({ f, typeTo }) => {
  const c = BG2_TEXT.calendar;
  // перетаскивание встречи: вниз на час и обратно
  const drag = keys(f, [[CAL.grab, 0], [CAL.drop, 1], [CAL.back, 1], [CAL.back + 16, 0]]);
  const conflict = f >= CAL.drop - 2 && f < CAL.back + 10 ? 1 : 0;
  const otherIn = appear(f, CAL.drop - 4, 8);
  const shake = conflict ? Math.sin(f * 1.9) * 7 * clamp((CAL.drop + 20 - f) / 20) : 0;
  const week = easeInOut((f - CAL.week) / 18);
  const cx = keys(f, [[0, 980], [CAL.grab - 6, 560], [CAL.drop, 560], [CAL.back + 16, 560], [CAL.week, 880], [CAL.note - 20, 900], [CAL.note - 4, 820]]);
  const cy = keys(f, [[0, 1100], [CAL.grab - 6, hourY(15) + 90], [CAL.drop, hourY(16) + 90], [CAL.back, hourY(16) + 90], [CAL.back + 16, hourY(15) + 90], [CAL.week, 900], [CAL.note - 20, 1180], [CAL.note - 4, 1120]]);
  const noteIn = appear(f, CAL.note, 12);
  const typed = clamp((f - CAL.note - 10) / Math.max(1, typeTo - CAL.note - 10));
  const noteText = BG2_TEXT.note.text.slice(0, Math.round(BG2_TEXT.note.text.length * typed));
  return (
    <div style={box({ inset: 0, backgroundColor: "#F6F8FB", fontFamily, overflow: "hidden" })}>
      <div style={box({ left: 0, right: 0, top: 0, height: 100, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 46, fontWeight: 900, display: "flex", alignItems: "center", padding: "0 40px" })}>
        {week < 0.5 ? c.title : c.week}
      </div>
      {/* день */}
      <div style={box({ left: 0, top: 0, right: 0, bottom: 0, opacity: 1 - week, translate: `${-week * 200}px 0` })}>
        {[13, 14, 15, 16, 17].map((h) => (
          <div key={h}>
            <div style={box({ left: 30, top: hourY(h) - 22, fontSize: 38, fontWeight: 800, color: "#7A869A" })}>{`${h}:00`}</div>
            <div style={box({ left: 170, right: 30, top: hourY(h), height: 3, backgroundColor: "#DCE3EE" })} />
          </div>
        ))}
        <Block from={14} to={15} title={c.meeting} color={COLORS.navy} />
        <div style={{ opacity: otherIn }}>
          <Block from={16} to={17} title={c.other} color="#7A6BC4" x={180 + shake} ring={conflict ? "#E2554B" : undefined} />
        </div>
        <Block from={15} to={16} title={c.client} color="#3E7CC4" dy={drag * HOUR_PX} x={180 + drag * 40} w={760 - drag * 40} scale={1 + 0.03 * Math.min(1, drag * 4) * (f < CAL.back + 16 ? 1 : 0)} ring={drag > 0.05 ? (conflict ? "#E2554B" : COLORS.yellow) : undefined} opacity={0.96} />
        {/* линия «Сабак бүтөт» */}
        <div style={box({ left: 150, right: 30, top: hourY(15) - 4, height: 8, backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.yellow} 0 26px, transparent 26px 40px)` })} />
        <div style={box({ right: 40, top: hourY(15) - 34, padding: "6px 20px", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 34, fontWeight: 900 })}>{`15:00 ${c.school}`}</div>
        <div style={box({ left: 220, right: 60, top: hourY(17) + 30, padding: "18px 26px", borderRadius: 22, backgroundColor: "#FDECEB", border: "4px solid #E2554B", color: "#B23A32", fontSize: 42, fontWeight: 900, textAlign: "center", opacity: conflict * appear(f, CAL.drop, 6) })}>{c.busy}</div>
      </div>
      {/* неделя: встречи каждый день в разное время */}
      <div style={box({ left: 0, top: 0, right: 0, bottom: 0, opacity: week, translate: `${(1 - week) * 200}px 0` })}>
        {c.days.map((d, i) => {
          const x = 140 + i * 160;
          const blocks = [
            [[13.5, 15.2], [16, 17]],
            [[14.6, 16]],
            [[13, 14], [14.8, 15.8]],
            [[15, 16.5]],
            [[13.2, 14.4], [14.9, 15.6], [16.2, 17]],
          ][i];
          return (
            <div key={d}>
              <div style={box({ left: x, top: 116, width: 150, textAlign: "center", fontSize: 38, fontWeight: 900, color: i === 1 ? COLORS.navy : "#7A869A" })}>{d}</div>
              {blocks.map(([a, b], k) => {
                const hit = a < 15.25 && b > 14.75;
                const at = CAL.week + 10 + i * 5 + k * 3;
                return (
                  <div
                    key={k}
                    style={box({
                      left: x + 8,
                      top: hourY(a) + 60,
                      width: 134,
                      height: (b - a) * HOUR_PX - 10,
                      borderRadius: 16,
                      backgroundColor: ["#3E7CC4", "#7A6BC4", COLORS.navy][(i + k) % 3],
                      opacity: appear(f, at, 8),
                      boxShadow: hit && f > CAL.week + 40 ? "0 0 0 6px #E2554B" : "none",
                    })}
                  />
                );
              })}
            </div>
          );
        })}
        {[13, 14, 15, 16, 17].map((h) => (
          <div key={h} style={box({ left: 26, top: hourY(h) + 40, fontSize: 32, fontWeight: 800, color: "#7A869A" })}>{`${h}:00`}</div>
        ))}
        <div style={box({ left: 140, right: 20, top: hourY(15) + 56, height: 8, backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.yellow} 0 26px, transparent 26px 40px)` })} />
        {/* эскертме — решение героя */}
        <div style={box({ left: 110, right: 110, top: 900, padding: "24px 30px", borderRadius: 26, backgroundColor: "#FFF4C2", border: `5px solid ${COLORS.yellow}`, boxShadow: "0 22px 44px rgba(20,30,60,0.25)", opacity: noteIn, scale: `${0.9 + 0.1 * noteIn}`, rotate: "-1.5deg" })}>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#8A6A00" }}>{BG2_TEXT.note.title}</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: INK, lineHeight: 1.15, minHeight: 120, marginTop: 6 }}>
            {noteText}
            {typed < 1 && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: COLORS.navy }}>|</span> : null}
          </div>
        </div>
      </div>
      <Cursor x={cx} y={cy} grab={f >= CAL.grab && f < CAL.back + 16} />
    </div>
  );
};

// ---------- Приложение BalaGo (условная иллюстрация, без URL) ----------
export const AppHome: React.FC<{ f: number; tapAt: number }> = ({ f, tapAt }) => {
  const a = BG2_TEXT.app;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.96, 1], CL);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
      <StatusBar time="13:59" />
      <div style={box({ left: 0, right: 0, top: 110, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: "cover", opacity: appear(f, 0, 10) }} />
        <div style={{ fontSize: 86, fontWeight: 900, color: COLORS.navy, opacity: appear(f, 3, 10) }}>{a.brand}</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: "#3A4F80", opacity: appear(f, 6, 10) }}>{a.tagline}</div>
      </div>
      <div style={box({ left: 50, right: 50, top: 620, padding: "40px 40px", borderRadius: 36, backgroundColor: COLORS.yellowSoft, border: `4px solid ${COLORS.yellow}`, scale: `${press}`, opacity: appear(f, 10, 12) })}>
        <div style={{ fontSize: 58, fontWeight: 900, color: INK }}>{a.card}</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: "#3A4F80", marginTop: 10 }}>{a.cardSub}</div>
        <div style={{ marginTop: 30, padding: "22px 0", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 44, fontWeight: 900, color: COLORS.navy, textAlign: "center" }}>{a.open}</div>
      </div>
    </div>
  );
};

// Условная схема: дома (группа детей) → школа и обратно; белая машина.
// morning 0…1 — путь утром (дома → школа), after 0…1 — после уроков.
const HOMES = [
  { x: 150, y: 1010 },
  { x: 420, y: 1120 },
  { x: 640, y: 960 },
] as const;
const SCHOOL = { x: 560, y: 470 } as const;
const PATH = [HOMES[0], { x: 280, y: 1060 }, HOMES[1], { x: 560, y: 1060 }, HOMES[2], { x: 640, y: 760 }, { x: 560, y: 600 }, SCHOOL] as const;
const segLen = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(b.x - a.x, b.y - a.y);
const TOTAL = PATH.slice(1).reduce((s, p, i) => s + segLen(PATH[i], p), 0);
const along = (u: number) => {
  let d = clamp(u) * TOTAL;
  for (let i = 1; i < PATH.length; i++) {
    const l = segLen(PATH[i - 1], PATH[i]);
    if (d <= l || i === PATH.length - 1) {
      const t = l ? Math.min(1, d / l) : 0;
      return { x: lerp(PATH[i - 1].x, PATH[i].x, t), y: lerp(PATH[i - 1].y, PATH[i].y, t), ang: (Math.atan2(PATH[i].y - PATH[i - 1].y, PATH[i].x - PATH[i - 1].x) * 180) / Math.PI + 90 };
    }
    d -= l;
  }
  return { x: SCHOOL.x, y: SCHOOL.y, ang: 0 };
};

const HouseIcon: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <svg width={110} height={110} viewBox="0 0 24 24" style={box({ left: x - 55, top: y - 70, overflow: "visible" })}>
    <circle cx={12} cy={12} r={13} fill={on > 0.5 ? COLORS.yellow : "#FFFFFF"} stroke={COLORS.navy} strokeWidth={1.4} />
    <path d="M 6 12 L 12 6.5 L 18 12 M 7.8 11 L 7.8 17.5 L 16.2 17.5 L 16.2 11" stroke={COLORS.navy} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
  </svg>
);

export const RouteMap: React.FC<{ morning: number; after: number; reveal: number }> = ({ morning, after, reveal }) => {
  const a = BG2_TEXT.app;
  const back = after > 0;
  const u = back ? 1 - after : morning;
  const car = along(u);
  const pts = PATH.map((p) => `${p.x},${p.y}`).join(" ");
  // дома «загораются», когда машина проезжает мимо
  const lit = (i: number) => {
    const d = [0, 0.33, 0.62][i];
    return back ? (after >= 1 - d - 0.02 ? 1 : 0) : morning >= d - 0.02 && morning > 0 ? 1 : 0;
  };
  const seg = back ? 1 : 0;
  return (
    <div style={box({ left: 0, top: 0, width: 792, height: 1352, overflow: "hidden", backgroundColor: "#EEF3F7", opacity: reveal })}>
      {/* кварталы и улицы */}
      <div style={box({ inset: 0, backgroundImage: "repeating-linear-gradient(0deg, #FFFFFF 0 22px, transparent 22px 200px), repeating-linear-gradient(90deg, #FFFFFF 0 22px, transparent 22px 180px)" })} />
      <div style={box({ left: 0, right: 0, top: 0, height: 150, background: "linear-gradient(180deg, #C9D6E6, rgba(201,214,230,0))" })} />
      <div style={box({ left: 40, top: 1250, padding: "8px 20px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.9)", fontSize: 32, fontWeight: 800, color: "#5A6B8C" })}>{a.example}</div>
      <svg width={792} height={1352} viewBox="0 0 792 1352" style={box({ left: 0, top: 0 })}>
        <polyline points={pts} fill="none" stroke="#B9C6D8" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke={COLORS.yellow} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${TOTAL}`} strokeDashoffset={TOTAL * (1 - (back ? 1 : morning))} />
      </svg>
      {HOMES.map((h, i) => (
        <HouseIcon key={i} x={h.x} y={h.y} on={lit(i)} />
      ))}
      <div style={box({ left: HOMES[1].x - 60, top: HOMES[1].y + 50, fontSize: 40, fontWeight: 900, color: COLORS.navy })}>{a.home}</div>
      {/* школа */}
      <div style={box({ left: SCHOOL.x - 120, top: SCHOOL.y - 150, width: 240, height: 150, borderRadius: 18, backgroundColor: "#FFFFFF", border: `5px solid ${COLORS.navy}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: COLORS.navy })}>{a.school}</div>
      <div style={box({ left: SCHOOL.x - 20, top: SCHOOL.y - 200, width: 40, height: 50, backgroundColor: COLORS.yellow, clipPath: "polygon(0 0, 100% 30%, 0 60%)" })} />
      {/* машина */}
      <div style={box({ left: car.x - 34, top: car.y - 60, rotate: `${car.ang}deg`, transformOrigin: "34px 60px" })}>
        <CarTopView size={120} />
      </div>
      {/* метка этапа: крупно вверху */}
      <div style={box({ left: 40, right: 40, top: 70, display: "flex", justifyContent: "center" })}>
        <div style={{ padding: "18px 32px", borderRadius: 26, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 46, fontWeight: 900, textAlign: "center", lineHeight: 1.15 }}>
          <div style={{ fontSize: 34, color: COLORS.yellow }}>{seg ? a.afterSchool : a.morning}</div>
          {seg ? `${a.school} → ${a.home}` : `${a.home} → ${a.school}`}
        </div>
      </div>
    </div>
  );
};

// Три условия по мере дикторских фраз (shown[i] — кадр появления), ниже —
// открытая, но не отправленная заявка (formAt): «Сапар азырынча
// тастыктала элек», кнопка «Арыз калтыруу» не нажата.
export const StepsScreen: React.FC<{ f: number; shown: readonly number[]; formAt: number }> = ({ f, shown, formAt }) => {
  const form = appear(f, formAt, 14);
  const t = BG2_TEXT.form;
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", padding: "44px 44px", boxSizing: "border-box" })}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 84, height: 84, borderRadius: 42, objectFit: "cover" }} />
        <div style={{ fontSize: 52, fontWeight: 900, color: COLORS.navy }}>{BG2_TEXT.app.brand}</div>
      </div>
      {BG2_TEXT.steps.map((s, i) => {
        const a = appear(f, shown[i], 12);
        const active = f >= shown[i] && (i === BG2_TEXT.steps.length - 1 ? f < formAt : f < shown[i + 1]);
        return (
          <div key={s.title} style={{ marginTop: i === 0 ? 34 : 24, display: "flex", gap: 22, alignItems: "flex-start", opacity: 0.12 + 0.88 * a, translate: `${(1 - a) * 40}px 0` }}>
            <div style={{ flex: "0 0 84px", height: 84, borderRadius: 42, backgroundColor: active ? COLORS.yellow : COLORS.yellowSoft, color: COLORS.navy, fontSize: 48, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 46, fontWeight: 900, color: INK, lineHeight: 1.1 }}>{s.title}</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#3A4F80", marginTop: 6 }}>{s.note}</div>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 34, padding: "24px 28px", borderRadius: 28, backgroundColor: "#F4F6FA", border: `4px solid ${form > 0.5 ? COLORS.navy : "#DCE3EE"}`, opacity: 0.25 + 0.75 * form, scale: `${0.97 + 0.03 * form}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.navy }}>{t.title}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#3A4F80" }}>{t.fields.map(([, v]) => v).join(" • ")}</div>
        </div>
        <div style={{ marginTop: 16, padding: "16px 20px", borderRadius: 18, backgroundColor: "#EAF3FC", fontSize: 38, fontWeight: 900, color: COLORS.navy, textAlign: "center" }}>{t.status}</div>
        <div style={{ marginTop: 16, padding: "18px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 40, fontWeight: 900, textAlign: "center" }}>{t.send}</div>
      </div>
    </div>
  );
};

// Заявка открыта, но не отправлена: статус «Сапар азырынча тастыктала элек».
export const FormScreen: React.FC<{ f: number }> = ({ f }) => {
  const t = BG2_TEXT.form;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA", padding: "50px 50px", boxSizing: "border-box" })}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 96, height: 96, borderRadius: 48, objectFit: "cover" }} />
        <div style={{ fontSize: 62, fontWeight: 900, color: COLORS.navy }}>{t.title}</div>
      </div>
      {t.fields.map(([label, value], i) => (
        <div key={label} style={{ marginTop: 34, opacity: appear(f, i * 4, 10) }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
          <div style={{ marginTop: 8, height: 100, borderRadius: 22, backgroundColor: "#FFFFFF", border: "3px solid #DCE3EE", display: "flex", alignItems: "center", padding: "0 26px", fontSize: 46, fontWeight: 800, color: INK }}>{value}</div>
        </div>
      ))}
      <div style={{ marginTop: 40, padding: "24px 26px", borderRadius: 24, backgroundColor: "#EAF3FC", border: "3px solid #9DB2CC", fontSize: 40, fontWeight: 900, color: COLORS.navy, textAlign: "center", opacity: appear(f, 8, 10) }}>{t.status}</div>
      <div style={{ marginTop: 30, padding: "26px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 46, fontWeight: 900, textAlign: "center", opacity: appear(f, 12, 10) }}>{t.send}</div>
    </div>
  );
};
