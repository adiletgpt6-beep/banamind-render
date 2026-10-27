// Рабочий календарь директора — один дизайн во всём фильме (сцены 1, 2, 3,
// 4, 5g, 8): белые скруглённые карточки, мягкая тень, тёмно-синий текст,
// мягко-жёлтая плашка загадочного пункта 13:20 (поле названия пустое,
// пунктир). Все анимации — параметрами 0…1 (или дробным номером дня), без
// собственного времени: сцена считает их от якорей реплик.
//
// Координаты: каждый компонент рисуется в «своих» px (номинальный размер
// ниже) от левого верхнего угла (x, y) родителя и масштабируется scale
// (transform-origin — левый верхний угол). Минимальный текст — 36 px
// номинала (≥ 30 px на экране при scale ≥ 0,85).
import { box } from "../kit";
import { clamp, easeInOut, easeOut, lerp, smoothstep } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

// ---------- Палитра интерфейса ----------
export const UI = {
  card: "#FFFFFF",
  cardLine: "#D6DEE9", // контур белой карточки (тёмный оттенок фона)
  ink: C.navy,
  sub: "#5B6B85",
  faint: "#EEF2F7",
  faintLine: "#DCE3EC",
  shadow: "0 22px 46px rgba(23,42,70,0.15), 0 4px 10px rgba(23,42,70,0.08)",
  plate: "#FFEFB0", // мягко-жёлтая плашка 13:20
  plateLine: "#E9BE3C",
  plateInk: "#B98A12",
  glow: C.yellow,
  client: C.orange,
  clientTint: "#FFF1E8",
  clientLine: "#F3B48C",
  ink2: "#2A4A9A", // «чернила» подписи «Уулум — мектеп»
} as const;

type Kind = "blue" | "teal" | "violet" | "coral";
const KIND: Record<Kind, { stripe: string; tint: string; line: string }> = {
  blue: { stripe: "#3F6FD8", tint: "#EAF0FD", line: "#C5D4F4" },
  teal: { stripe: "#2E9C8C", tint: "#E4F4F1", line: "#BCE0D9" },
  violet: { stripe: "#7B63CC", tint: "#F0ECFB", line: "#D5CCF2" },
  coral: { stripe: "#E0775C", tint: "#FCEEE9", line: "#F2CDBF" },
};

// ---------- Данные недели ----------
// Названия встреч — из M13_TEXT.calendar.meetings (дни 1–3); русские
// слова там заменяются кыргызскими по библии (если в script.ts их уже
// исправили — замена ничего не делает).
const KY: Record<string, string> = { "Планёрка": "Эртең мененки жыйын", "Отчёт: III чейрек": "Чейрек отчету" };
const ky = (s: string) => KY[s] ?? s;
const T = M13_TEXT.calendar;
const mt = (d: number, i: number) => ({ time: T.meetings[d][i][0], title: ky(T.meetings[d][i][1]) });

export type CalEntry = { readonly time: string; readonly title: string; readonly kind: Kind };
// Слоты дня: 0, 1 — утро; 2 — 13:20 (всегда, без названия); 3, 4 — после обеда.
export type CalDay = { readonly name: string; readonly short: string; readonly slots: readonly (CalEntry | null)[] };
const E = (e: { time: string; title: string }, kind: Kind): CalEntry => ({ ...e, kind });
export const CAL_DAYS: readonly CalDay[] = [
  { name: T.days[0], short: T.short[0], slots: [E(mt(0, 0), "blue"), E(mt(0, 1), "violet"), null, E(mt(0, 2), "teal"), null] },
  { name: T.days[1], short: T.short[1], slots: [E(mt(1, 0), "teal"), E(mt(1, 1), "blue"), null, E(mt(1, 2), "coral"), null] },
  { name: T.days[2], short: T.short[2], slots: [E(mt(2, 0), "coral"), E(mt(2, 1), "violet"), null, E(mt(2, 2), "blue"), null] },
  { name: T.days[3], short: T.short[3], slots: [E({ time: "09:30", title: "Долбоор тобу" }, "blue"), E({ time: "11:00", title: "Сатуу бөлүмү" }, "teal"), null, E({ time: "15:00", title: "Каржы" }, "violet"), null] },
  { name: T.days[4], short: T.short[4], slots: [E({ time: "10:00", title: "Жумалык жыйынтык" }, "blue"), E({ time: "11:30", title: "Кардарлар менен" }, "coral"), null, E({ time: "15:30", title: "Пландоо" }, "teal"), null] },
];
export const MOVED = { title: ky(T.moved.title), from: T.moved.from, to: T.moved.to } as const;

// ---------- Значки ----------
export const ClockIcon: React.FC<{ readonly size: number; readonly color?: string; readonly bg?: string; readonly time?: [number, number] }> = ({ size, color = UI.ink, bg = "#FFFFFF", time = [1, 20] }) => {
  const r = size / 2;
  const am = (time[1] / 60) * Math.PI * 2;
  const ah = (((time[0] % 12) + time[1] / 60) / 12) * Math.PI * 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", overflow: "visible" }}>
      <circle cx={r} cy={r} r={r - size * 0.06} fill={bg} stroke={color} strokeWidth={size * 0.1} />
      <line x1={r} y1={r} x2={r + Math.sin(ah) * r * 0.42} y2={r - Math.cos(ah) * r * 0.42} stroke={color} strokeWidth={size * 0.1} strokeLinecap="round" />
      <line x1={r} y1={r} x2={r + Math.sin(am) * r * 0.6} y2={r - Math.cos(am) * r * 0.6} stroke={color} strokeWidth={size * 0.08} strokeLinecap="round" />
      <circle cx={r} cy={r} r={size * 0.07} fill={color} />
    </svg>
  );
};

export const CameraIcon: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = UI.ink }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 40 28" style={{ display: "block" }}>
    <rect x={1.5} y={3} width={25} height={22} rx={6} fill={color} />
    <path d="M 28 11 L 38.5 5 L 38.5 23 L 28 17 Z" fill={color} />
  </svg>
);

const CalGlyph: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" style={{ display: "block" }}>
    <rect x={2} y={6} width={52} height={48} rx={12} fill={C.navy} />
    <path d="M 2 18 Q 2 6 14 6 L 42 6 Q 54 6 54 18 L 54 20 L 2 20 Z" fill={C.yellow} />
    <rect x={14} y={1} width={6} height={12} rx={3} fill={C.navy} />
    <rect x={36} y={1} width={6} height={12} rx={3} fill={C.navy} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={12 + c * 12} y={26 + r * 9} width={7} height={5} rx={2} fill={r === 1 && c === 1 ? C.yellow : "rgba(255,255,255,0.75)"} />))}
  </svg>
);

// Курсор мыши: кончик стрелки в (x, y); down 0…1 — нажатие (мягкое кольцо).
export const Cursor: React.FC<{ readonly x: number; readonly y: number; readonly down?: number; readonly size?: number }> = ({ x, y, down = 0, size = 54 }) => (
  <div style={box({ left: x, top: y, width: 0, height: 0 })}>
    {down > 0 ? <div style={box({ left: -size * 0.42, top: -size * 0.42, width: size * 0.84, height: size * 0.84, borderRadius: "50%", backgroundColor: `rgba(255,212,59,${0.45 * down})`, border: `3px solid rgba(233,190,60,${0.8 * down})`, transform: `scale(${0.8 + 0.2 * down})` })} /> : null}
    <svg width={size} height={size} viewBox="0 0 30 30" style={box({ left: -2, top: -2, overflow: "visible", filter: "drop-shadow(0 3px 3px rgba(20,30,50,0.3))" })}>
      <path d="M 2 2 L 2 24 L 8 18.5 L 12 27 L 16 25.2 L 12.2 17 L 20 16.5 Z" fill="#FFFFFF" stroke="#172A46" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  </div>
);

// Пошаговое «печатание» строки (корректно для ү, ө, ң).
const typedText = (s: string, t: number) => {
  const a = Array.from(s);
  return a.slice(0, Math.round(clamp(t) * a.length)).join("");
};

// ---------- Плашка загадочного пункта 13:20 ----------
// w × h — размер плашки; glow 0…1 — мягкое жёлтое свечение; meaning 0…1 —
// «рукописная» подпись «Уулум — мектеп» в поле названия (только после
// раскрытия, сцена 5g); frame 0…1 — рамка пункта (значок часов, контур,
// пунктир, тень): 0 — только плашка и цифры (макро начала фильма).
export const PLATE = { h: 124, timeX: 60, timeSize: 52, slotX: 214 } as const;
export const MysteryPlate: React.FC<{
  readonly w: number;
  readonly h?: number;
  readonly glow?: number;
  readonly meaning?: number;
  readonly frame?: number;
  readonly hover?: number;
  readonly overlap?: number; // 0…1 — спокойная оранжевая отметка совпадения с 13:30
}> = ({ w, h = PLATE.h, glow = 0, meaning = 0, frame = 1, hover = 0, overlap = 0 }) => {
  const g = clamp(glow);
  const fr = clamp(frame);
  const slotW = w - PLATE.slotX - 22;
  const m = clamp(meaning);
  const dash = 1 - clamp(m * 2.2);
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h })}>
      {/* свечение */}
      {g > 0 ? <div style={box({ left: -26, top: -26, width: w + 52, height: h + 52, borderRadius: 48, background: `radial-gradient(closest-side, rgba(255,212,59,${0.55 * g}), rgba(255,212,59,0))`, filter: "blur(6px)" })} /> : null}
      <div
        style={box({
          left: 0,
          top: 0,
          width: w,
          height: h,
          borderRadius: 26,
          background: `linear-gradient(180deg, #FFF4C6, ${UI.plate})`,
          boxSizing: "border-box",
          border: `${3 + 2 * g}px solid rgba(${g > 0 ? "242,183,5" : "233,190,60"},${fr * (0.85 + 0.15 * g)})`,
          boxShadow: `0 ${10 * fr}px ${24 * fr}px rgba(185,138,18,${0.18 * fr}), 0 0 0 ${overlap * 6}px rgba(242,106,33,${0.28 * overlap})${hover > 0 ? `, 0 0 0 ${4 * hover}px rgba(23,42,70,${0.35 * hover})` : ""}`,
        })}
      />
      <div style={box({ left: 16, top: (h - 44) / 2, opacity: fr })}>
        <ClockIcon size={44} color={UI.ink} bg="#FFF8DA" />
      </div>
      <div style={box({ left: PLATE.timeX + 8, top: 0, height: h, display: "flex", alignItems: "center", fontFamily: F.display, fontWeight: 900, fontSize: PLATE.timeSize, letterSpacing: -1, color: UI.ink, lineHeight: 1 })}>{T.mystery}</div>
      {/* поле названия: пусто, пунктир */}
      <div style={box({ left: PLATE.slotX, top: 18, width: slotW, height: h - 36, borderRadius: 16, boxSizing: "border-box", border: `3px dashed rgba(185,138,18,${0.55 * fr * dash})`, backgroundColor: `rgba(255,255,255,${0.45 * fr * (0.4 + 0.6 * dash)})` })} />
      {m > 0 ? (
        <div style={box({ left: PLATE.slotX + 20, top: 0, height: h, width: slotW - 24, display: "flex", alignItems: "center" })}>
          <div style={{ position: "relative", fontFamily: F.kid, fontWeight: 800, fontStyle: "italic", fontSize: 50, color: UI.ink2, whiteSpace: "nowrap", transform: "rotate(-2deg)", clipPath: `inset(-20px ${100 - 100 * easeInOut(clamp(m * 1.08))}% -20px -10px)` }}>
            {T.meaning}
          </div>
          {m < 0.93 ? <div style={box({ left: (slotW - 60) * easeInOut(clamp(m * 1.08)) + 4, top: h / 2 - 2, width: 10, height: 10, borderRadius: 5, backgroundColor: UI.ink2, opacity: 0.8 })} /> : null}
        </div>
      ) : null}
    </div>
  );
};

// Обычная запись дня: значок-точка, время, цветная карточка с названием.
const ROW = { h: 124, gap: 18, timeX: 60, chipX: 214 } as const;
const DayRow: React.FC<{ readonly e: CalEntry; readonly w: number; readonly online?: number }> = ({ e, w, online = 0 }) => {
  const k = KIND[e.kind];
  return (
    <div style={box({ left: 0, top: 0, width: w, height: ROW.h })}>
      <div style={box({ left: 28, top: ROW.h / 2 - 9, width: 18, height: 18, borderRadius: 9, backgroundColor: k.stripe })} />
      <div style={box({ left: ROW.timeX + 8, top: 0, height: ROW.h, display: "flex", alignItems: "center", fontFamily: F.text, fontWeight: 800, fontSize: 42, color: UI.ink })}>{e.time}</div>
      <div style={box({ left: ROW.chipX, top: 8, width: w - ROW.chipX, height: ROW.h - 16, borderRadius: 20, backgroundColor: k.tint, boxSizing: "border-box", border: `3px solid ${k.line}`, overflow: "hidden" })}>
        <div style={box({ left: 0, top: 0, width: 10, height: "100%", backgroundColor: k.stripe })} />
        <div style={box({ left: 34, top: 0, height: ROW.h - 22, display: "flex", alignItems: "center", fontFamily: F.text, fontWeight: 800, fontSize: 38, color: UI.ink, whiteSpace: "nowrap" })}>{e.title}</div>
        {online > 0 ? (
          <div style={box({ right: 16, top: (ROW.h - 22) / 2 - 18, opacity: online })}>
            <CameraIcon size={44} color={k.stripe} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ---------- Название фильма ----------
// «13:20дагы жолугушуу» в две строки; «13:20» — жёлтым с тёмно-синим
// контуром. x, y — левый верхний угол блока шириной w (текст по центру).
export const FILM_TITLE_H = 250;
export const FilmTitle: React.FC<{ readonly x?: number; readonly y?: number; readonly w?: number; readonly size?: number; readonly appear?: number }> = ({ x = 0, y = 0, w = 800, size = 118, appear = 1 }) => {
  if (appear <= 0) return null;
  const a = easeOut(clamp(appear));
  const head = T.mystery;
  const rest = M13_TEXT.title.slice(head.length);
  const [l1, l2] = rest.split(" ");
  const line = (k: number): React.CSSProperties => ({
    opacity: clamp(appear * 2 - k * 0.5),
    transform: `translateY(${(1 - easeOut(clamp(appear * 1.6 - k * 0.4))) * 40}px)`,
  });
  return (
    <div style={box({ left: x, top: y, width: w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: size, lineHeight: 0.98, letterSpacing: -size * 0.025, color: UI.ink, opacity: lerp(0.4, 1, a) })}>
      <div style={line(0)}>
        <span style={{ color: C.yellow, WebkitTextStroke: `${size * 0.075}px ${C.navy}`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.06}px 0 rgba(23,42,70,0.18)` }}>{head}</span>
        <span>{l1}</span>
      </div>
      <div style={line(1)}>{l2}</div>
    </div>
  );
};

// ---------- Карточка дня ----------
// Номинал DAY.w × DAY.h. Колонки записей: слоты 0, 1, 2 (13:20), 3.
export const DAY = {
  w: 780,
  pad: 36,
  rowsY: 344,
  h: 344 + 4 * ROW.h + 3 * ROW.gap + 36,
} as const;
const rowY = (i: number) => DAY.rowsY + i * (ROW.h + ROW.gap);
// Плашка 13:20 в координатах карточки (не двигается при смене дня).
export const DAY_CHIP: Rect = { x: DAY.pad - 8, y: rowY(2), w: DAY.w - 2 * DAY.pad + 16, h: ROW.h };
// Центр цифр «13:20» в координатах карточки (точка наезда макро-плана).
export const DAY_DIGITS = { x: DAY_CHIP.x + PLATE.timeX + 8 + 70, y: DAY_CHIP.y + ROW.h / 2 } as const;
// Карточка деталей (раскрытый пункт) в координатах карточки дня.
export const DAY_DETAIL: Rect = { x: -10, y: DAY_CHIP.y - 250, w: DAY.w + 20, h: 650 };
// Плашка 13:20 в координатах родителя карточки, стоящей в (x, y) с scale.
export const dayChipRect = (x: number, y: number, scale = 1): Rect => ({ x: x + DAY_CHIP.x * scale, y: y + DAY_CHIP.y * scale, w: DAY_CHIP.w * scale, h: DAY_CHIP.h * scale });

// Переворот строки при смене дня: u 0…1 → угол; до 90° видна старая
// строка, после — новая (снизу вверх, как лист настольного календаря).
const Flip: React.FC<{ readonly u: number; readonly a: React.ReactNode; readonly b: React.ReactNode; readonly w: number; readonly h: number }> = ({ u, a, b, w, h }) => {
  const e = easeInOut(u);
  const ang = e * 180;
  const front = ang < 90;
  const face = front ? a : b;
  const rot = front ? ang : ang - 180;
  const shade = Math.abs(Math.sin((ang * Math.PI) / 180));
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, perspective: 900 })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, transform: `rotateX(${-rot}deg)`, transformOrigin: "50% 50%", opacity: 1 - 0.35 * shade })}>{face}</div>
    </div>
  );
};

export type CalendarDayProps = {
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  // Номер дня 0…4 (Дүйшөмбү…Жума). Дробная часть — переворот k → k+1:
  // меняются день и записи, плашка 13:20 стоит неподвижно.
  readonly day: number;
  readonly glow?: number; // мягкая подсветка 13:20
  readonly meaning?: number; // «Уулум — мектеп» пишется в поле названия (только после раскрытия)
  readonly title?: number; // название фильма над карточкой (0…1 — появление)
  readonly chipFrame?: number; // рамка пункта 13:20 (для макро; 1 — обычный вид)
  readonly card?: number; // 0…1 — проявление белой карточки вокруг (0 — бумага)
  readonly dim?: number; // 0…1 — приглушить остальные записи
  readonly others?: number; // 0…1 — видимость всего, кроме плашки 13:20 (макро: 0)
  readonly detail?: { readonly open: number; readonly fields: readonly number[] }; // раскрытие 13:20 в карточку деталей
};

export const CalendarDay: React.FC<CalendarDayProps> = ({ x = 0, y = 0, scale = 1, day, glow = 0, meaning = 0, title = 0, chipFrame = 1, card = 1, dim = 0, others = 1, detail }) => {
  const k0 = clamp(Math.floor(day), 0, CAL_DAYS.length - 1);
  const k1 = clamp(k0 + 1, 0, CAL_DAYS.length - 1);
  const u = day - Math.floor(day);
  const D0 = CAL_DAYS[k0];
  const D1 = CAL_DAYS[k1];
  const cw = DAY.w - 2 * DAY.pad;
  const stag = (i: number) => clamp((u - i * 0.11) / 0.56);
  const cardA = clamp(card);
  const rest = clamp(others) * (1 - 0.72 * clamp(dim + (detail ? clamp(detail.open * 1.5) : 0)));
  // активная «пилюля» дня
  const pillW = 128;
  const pillGap = 12;
  const pillX = (i: number) => i * (pillW + pillGap);
  const activeX = lerp(pillX(k0), pillX(k1), easeInOut(clamp((u - 0.05) / 0.7)));
  const dayName = (d: CalDay) => (
    <div style={box({ left: 0, top: 0, width: cw, height: 84, display: "flex", alignItems: "center", gap: 22 })}>
      <svg width={26} height={40} viewBox="0 0 26 40"><path d="M 20 5 L 6 20 L 20 35" stroke={UI.sub} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 66, letterSpacing: -1.5, color: UI.ink, lineHeight: 1 }}>{d.name}</div>
      <svg width={26} height={40} viewBox="0 0 26 40"><path d="M 6 5 L 20 20 L 6 35" stroke={UI.sub} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
  const rowOf = (d: CalDay, i: number) => {
    const e = d.slots[i];
    return e ? <DayRow e={e} w={cw} /> : <div />;
  };
  return (
    <div style={box({ left: x, top: y, width: DAY.w, height: DAY.h, transform: `scale(${scale})`, transformOrigin: "0 0" })}>
      {title > 0 ? <FilmTitle x={0} y={-FILM_TITLE_H - 40} w={DAY.w} appear={title} /> : null}
      {/* карточка */}
      <div style={box({ left: 0, top: 0, width: DAY.w, height: DAY.h, borderRadius: 40, backgroundColor: UI.card, boxSizing: "border-box", border: `3px solid ${UI.cardLine}`, boxShadow: UI.shadow, opacity: cardA })} />
      <div style={box({ left: DAY.pad, top: DAY.pad, width: cw, height: 64, display: "flex", alignItems: "center", gap: 20, opacity: rest })}>
        <CalGlyph size={60} />
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 40, color: UI.ink, whiteSpace: "nowrap" }}>{T.owner}</div>
      </div>
      <div style={box({ left: DAY.pad, top: DAY.pad + 84, width: cw, height: 3, backgroundColor: UI.faintLine, opacity: rest })} />
      {/* день недели и «пилюли» Дш…Жм */}
      <div style={box({ left: DAY.pad, top: 146, width: cw, height: 84, opacity: rest })}>
        <Flip u={stag(0)} a={dayName(D0)} b={dayName(D1)} w={cw} h={84} />
      </div>
      <div style={box({ left: DAY.pad + (cw - (5 * pillW + 4 * pillGap)) / 2, top: 244, width: 5 * pillW + 4 * pillGap, height: 62, opacity: rest })}>
        <div style={box({ left: activeX, top: 0, width: pillW, height: 62, borderRadius: 31, backgroundColor: C.navy })} />
        {CAL_DAYS.map((d, i) => {
          const on = clamp(1 - Math.abs(activeX - pillX(i)) / (pillW + pillGap));
          return (
            <div key={d.short} style={box({ left: pillX(i), top: 0, width: pillW, height: 62, borderRadius: 31, boxSizing: "border-box", border: `3px solid rgba(214,222,233,${1 - on})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.text, fontWeight: 800, fontSize: 36, color: on > 0.5 ? "#FFFFFF" : UI.sub })}>
              {d.short}
            </div>
          );
        })}
      </div>
      {/* записи: 0, 1, (13:20), 3 */}
      {[0, 1, 3].map((i, n) => (
        <div key={i} style={box({ left: DAY.pad, top: rowY(i), width: cw, height: ROW.h, opacity: rest })}>
          <Flip u={stag(n + 1)} a={rowOf(D0, i)} b={rowOf(D1, i)} w={cw} h={ROW.h} />
        </div>
      ))}
      <div style={box({ left: DAY_CHIP.x, top: DAY_CHIP.y, width: DAY_CHIP.w, height: DAY_CHIP.h })}>
        <MysteryPlate w={DAY_CHIP.w} glow={glow} meaning={meaning} frame={chipFrame} />
      </div>
      {detail && detail.open > 0 ? <MysteryDetail from={DAY_CHIP} to={DAY_DETAIL} open={detail.open} fields={detail.fields} glow={glow} /> : null}
    </div>
  );
};

// Значки полей карточки деталей: 0 — здание (компания), 1 — человек,
// 2 — дверь (комната).
const FieldIcon: React.FC<{ readonly kind: number; readonly size: number; readonly color?: string }> = ({ kind, size, color = UI.sub }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block" }}>
    {kind === 0 ? (
      <g fill="none" stroke={color} strokeWidth={3.4} strokeLinejoin="round">
        <rect x={7} y={6} width={18} height={29} rx={2} />
        <path d="M 25 16 L 33 16 L 33 35 L 25 35" />
        <path d="M 12 12 h 3 M 18 12 h 2 M 12 18 h 3 M 18 18 h 2 M 12 24 h 3 M 18 24 h 2" strokeLinecap="round" />
        <path d="M 4 35 L 36 35" strokeLinecap="round" />
      </g>
    ) : kind === 1 ? (
      <g fill={color}>
        <circle cx={20} cy={13} r={7.5} />
        <path d="M 6 35 Q 6 23 20 23 Q 34 23 34 35 Z" />
      </g>
    ) : (
      <g fill="none" stroke={color} strokeWidth={3.4} strokeLinejoin="round">
        <rect x={10} y={5} width={20} height={30} rx={2} />
        <path d="M 5 35 L 35 35" strokeLinecap="round" />
        <circle cx={24.5} cy={21} r={1.8} fill={color} stroke="none" />
      </g>
    )}
  </svg>
);

// ---------- Карточка деталей 13:20 ----------
// Пункт 13:20 раскрывается: from — прямоугольник плашки (open = 0, совпадает
// с ней), to — карточка деталей (open = 1); оба — в координатах родителя.
// Поля «Компания», «Аты-жөнү», «Бөлмө» — каждое своим параметром fields[i]
// 0…1: сначала подпись, затем прочерк «—».
export const MysteryDetail: React.FC<{
  readonly from?: Rect;
  readonly to: Rect;
  readonly open?: number;
  readonly fields: readonly number[];
  readonly glow?: number;
}> = ({ from, to, open = 1, fields, glow = 0 }) => {
  const e = easeInOut(clamp(open));
  const r = from ? lerpRect(from, to, e) : to;
  const inset = lerp(0, 26, e);
  const plateW = r.w - 2 * inset;
  const bodyA = clamp((open - 0.35) / 0.4);
  const fy = PLATE.h + inset + 30;
  const fh = (to.h - PLATE.h - 26 - 30 - 26) / 3;
  return (
    <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h })}>
      <div style={box({ left: 0, top: 0, width: r.w, height: r.h, borderRadius: lerp(26, 42, e), backgroundColor: UI.card, boxSizing: "border-box", border: `3px solid ${UI.cardLine}`, boxShadow: "0 30px 60px rgba(23,42,70,0.22), 0 6px 14px rgba(23,42,70,0.1)", opacity: clamp(open * 3) })} />
      <div style={box({ left: inset, top: inset, width: plateW, height: PLATE.h })}>
        <MysteryPlate w={plateW} glow={glow} />
      </div>
      <div style={box({ left: 0, top: fy, width: r.w, height: 3 * fh, opacity: bodyA, overflow: "hidden" })}>
        {T.fields.map((label, i) => {
          const p = clamp(fields[i] ?? 0);
          const la = easeOut(clamp(p * 2));
          const dash = easeOut(clamp((p - 0.35) / 0.5));
          return (
            <div key={label} style={box({ left: 0, top: i * fh, width: r.w, height: fh })}>
              {i > 0 ? <div style={box({ left: 44, top: 0, width: r.w - 88, height: 3, backgroundColor: UI.faintLine })} /> : null}
              <div style={box({ left: 48, top: fh / 2 - 34, width: 68, height: 68, borderRadius: 20, backgroundColor: UI.faint, opacity: la, display: "flex", alignItems: "center", justifyContent: "center" })}>
                <FieldIcon kind={i} size={40} />
              </div>
              <div style={box({ left: 140, top: 0, height: fh, display: "flex", alignItems: "center", fontFamily: F.text, fontWeight: 500, fontSize: 46, color: UI.sub, opacity: la, transform: `translateX(${(1 - la) * -30}px)` })}>{`${label}:`}</div>
              <div style={box({ left: 470, top: 0, height: fh, display: "flex", alignItems: "center", fontFamily: F.display, fontWeight: 900, fontSize: 76, color: UI.ink, opacity: dash, transform: `translateX(${(1 - dash) * 24}px)` })}>—</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Фон предметных планов календаря ----------
// Светлый стол (тёплая бумага), мягкий свет сверху; по углам — край
// блокнота и ручка (вне безопасной зоны, слегка размыты).
// props: true/1 — предметы видны, 0…1 — проступают; zoom — общий масштаб
// фона от центра кадра (параллакс при отъезде камеры).
export const CalendarBackdrop: React.FC<{ readonly props?: boolean | number; readonly warm?: number; readonly zoom?: number }> = ({ props = true, warm = 0, zoom = 1 }) => {
  const pa = typeof props === "number" ? clamp(props) : props ? 1 : 0;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: `radial-gradient(ellipse 80% 60% at 45% 35%, #FBF9F5, ${C.paper} 55%, #E9E3D9)` })} />
      {pa > 0 ? (
        <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: pa, transform: `scale(${zoom})`, transformOrigin: "540px 960px" })}>
        <div style={box({ left: -120, top: 1640, width: 520, height: 420, borderRadius: 26, backgroundColor: "#2E4A72", transform: "rotate(-8deg)", boxShadow: "0 16px 30px rgba(23,42,70,0.18)", filter: "blur(2px)" })} />
        <div style={box({ left: -100, top: 1660, width: 480, height: 380, borderRadius: 18, backgroundColor: "#F4F1EA", transform: "rotate(-8deg)", filter: "blur(2px)" })} />
        <div style={box({ left: 860, top: 110, width: 300, height: 22, borderRadius: 11, backgroundColor: "#2B3A5C", transform: "rotate(28deg)", boxShadow: "0 10px 16px rgba(23,42,70,0.18)", filter: "blur(2px)" })} />
        <div style={box({ left: 860, top: 110, width: 60, height: 22, borderRadius: 11, backgroundColor: C.yellowDeep, transform: "rotate(28deg)", transformOrigin: "150px 11px", filter: "blur(2px)" })} />
        </div>
      ) : null}
      {warm > 0 ? <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: `rgba(255,190,110,${0.14 * warm})` })} /> : null}
    </div>
  );
};

// ---------- Макро «13:20» (начало фильма) ----------
// Полный кадр 1080×1920: карточка дня в DAY_POS. macro 1 — огромные цифры
// «13:20» на мягко-жёлтой плашке во весь кадр; 0 — обычный план карточки
// (то же, что CalendarDay в DAY_POS, scale 1 — склейка без скачка).
// frame 0…1 — проступает рамка пункта (значок часов, контур, тень) и
// белая карточка вокруг (из цвета бумаги, без вспышки).
export const DAY_POS = { x: 150, y: 470 } as const;
export const MACRO_ZOOM = 6.2;
export const MacroTime: React.FC<{ readonly macro: number; readonly frame?: number } & Omit<CalendarDayProps, "x" | "y" | "scale" | "chipFrame" | "card">> = ({ macro, frame = 1, ...day }) => {
  const m = clamp(macro);
  const z = Math.pow(MACRO_ZOOM, m);
  // точка фокуса: центр цифр → центр кадра; путь без «уплывания»
  const P = { x: DAY_POS.x + DAY_DIGITS.x, y: DAY_POS.y + DAY_DIGITS.y };
  const w = (1 - 1 / z) / (1 - 1 / MACRO_ZOOM);
  const cx = lerp(540, P.x, w);
  const cy = lerp(960, P.y, w);
  const fr = clamp(frame);
  // карточка и соседние записи проступают на отъезде (без вспышки: из бумаги)
  const out = smoothstep((0.82 - m) / 0.5);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" })}>
      <CalendarBackdrop props={out} zoom={1 + (z - 1) * 0.12} />
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` })}>
        <CalendarDay {...day} x={DAY_POS.x} y={DAY_POS.y} chipFrame={fr} card={out} others={out} />
      </div>
    </div>
  );
};

// ---------- Неделя (монитор помощницы, планшет) ----------
// Сетка времени, как в настоящем календаре: колонки Дш…Жм, слева шкала
// часов 09…17, встреча — блок от начала на 1 час. Пункт 13:20 стоит на
// одной высоте во всех днях. В блоке — время и штрихи названия (без
// мелкого текста); подпись — только у встречи в фокусе («Чейрек отчету»
// при перетаскивании, «Онлайн»).
// Номинал WEEK.w × weekHeight(hourH); x, y — левый верхний угол, scale —
// масштаб (transform-origin — левый верхний угол).
export const WEEK = {
  w: 940,
  pad: 28,
  dayY: 112, // строка дней
  dayH: 76,
  gridY: 204, // линия 09:00
  axisW: 70, // шкала часов
  colGap: 10,
  hourH: 112, // высота часа (по умолчанию)
  h0: 9,
  h1: 17,
  colW: (940 - 2 * 28 - 70 - 4 * 10) / 5,
} as const;
export const weekHeight = (hourH: number = WEEK.hourH) => WEEK.gridY + (WEEK.h1 - WEEK.h0) * hourH + 26;
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const MYSTERY_MIN = toMin(T.mystery); // 13:20
// Колонка дня c: левый край и ширина; y времени (минуты от полуночи).
export const weekColX = (c: number) => WEEK.pad + WEEK.axisW + c * (WEEK.colW + WEEK.colGap);
export const weekTimeY = (min: number, hourH: number = WEEK.hourH) => WEEK.gridY + (min / 60 - WEEK.h0) * hourH;
// Блок встречи (номинальные px недели).
export const weekBlock = (c: number, min: number, dur = 60, hourH: number = WEEK.hourH): Rect => ({ x: weekColX(c), y: weekTimeY(min, hourH) + 3, w: WEEK.colW, h: (dur / 60) * hourH - 6 });
// Точка в колонке c на времени min (середина колонки) — для курсора.
export const weekPoint = (c: number, min: number, hourH: number = WEEK.hourH) => ({ x: weekColX(c) + WEEK.colW / 2, y: weekTimeY(min, hourH) });

// Что где происходит в неделе (сцены 2c, 2d, 8):
export const WEEK_EVENTS = {
  drag: { col: 0, from: toMin(T.moved.from), to: toMin(T.moved.to) }, // «Чейрек отчету» 11:00 → 16:00
  online: { col: 1, min: toMin(CAL_DAYS[1].slots[1]!.time) }, // значок «Онлайн» (Шш 11:30)
  client: { col: 2, min: toMin(T.client.time) }, // 13:30 рядом с 13:20
} as const;
// Кончик курсора, который ведёт перетаскиваемую встречу (drag 0…1).
export const weekDragCursor = (drag: number, hourH: number = WEEK.hourH) => {
  const e = easeInOut(clamp(drag));
  const D = WEEK_EVENTS.drag;
  return { x: weekColX(D.col) + WEEK.colW * 0.62, y: weekTimeY(lerp(D.from, D.to, e), hourH) + hourH * 0.55 };
};

type WeekItem = { readonly e: CalEntry; readonly min: number; readonly slot: number };
const dayItems = (d: CalDay): WeekItem[] => d.slots.flatMap((e, slot) => (e ? [{ e, min: toMin(e.time), slot }] : []));

const Stripes: React.FC<{ readonly color: string; readonly w: number; readonly top: number }> = ({ color, w, top }) => (
  <>
    <div style={box({ left: 20, top, width: w * 0.74, height: 11, borderRadius: 6, backgroundColor: color, opacity: 0.34 })} />
    <div style={box({ left: 20, top: top + 20, width: w * 0.46, height: 11, borderRadius: 6, backgroundColor: color, opacity: 0.22 })} />
  </>
);

const WeekBlock: React.FC<{ readonly e: CalEntry; readonly r: Rect; readonly time?: string; readonly lifted?: number; readonly online?: number; readonly ghost?: boolean }> = ({ e, r, time, lifted = 0, online = 0, ghost = false }) => {
  const k = KIND[e.kind];
  if (ghost) return <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 16, boxSizing: "border-box", border: `3px dashed ${k.line}` })} />;
  return (
    <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 16, backgroundColor: k.tint, boxSizing: "border-box", border: `3px solid ${lifted > 0 ? k.stripe : k.line}`, overflow: "hidden", boxShadow: lifted > 0 ? `0 ${18 * lifted}px ${30 * lifted}px rgba(23,42,70,${0.25 * lifted})` : "none" })}>
      <div style={box({ left: 0, top: 0, width: 8, height: "100%", backgroundColor: k.stripe })} />
      <div style={box({ left: 18, top: 12, fontFamily: F.display, fontWeight: 900, fontSize: 38, letterSpacing: -0.5, color: UI.ink, lineHeight: 1 })}>{time ?? e.time}</div>
      {r.h > 90 ? <Stripes color={k.stripe} w={r.w - 36} top={62} /> : null}
      {online > 0 ? (
        <div style={box({ right: 8, top: r.h - 54, opacity: online, transform: `scale(${0.6 + 0.4 * easeOut(online)})`, transformOrigin: "100% 100%" })}>
          <div style={{ width: 50, height: 42, borderRadius: 12, backgroundColor: k.stripe, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CameraIcon size={30} color="#FFFFFF" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Пункт 13:20 в неделе: жёлтый блок, время и пустое поле (пунктир).
const WeekMystery: React.FC<{ readonly r: Rect; readonly glow?: number; readonly hover?: number; readonly overlap?: number }> = ({ r, glow = 0, hover = 0, overlap = 0 }) => {
  const g = clamp(glow);
  return (
    <div style={box({ left: r.x, top: r.y, width: r.w, height: r.h })}>
      {g > 0 ? <div style={box({ left: -24, top: -24, width: r.w + 48, height: r.h + 48, borderRadius: 40, background: `radial-gradient(closest-side, rgba(255,212,59,${0.75 * g}), rgba(255,212,59,0))`, filter: "blur(4px)" })} /> : null}
      <div
        style={box({
          left: 0,
          top: 0,
          width: r.w,
          height: r.h,
          borderRadius: 16,
          background: `linear-gradient(180deg, #FFF4C6, ${UI.plate})`,
          boxSizing: "border-box",
          border: `${3 + 2 * g}px solid ${g > 0.3 ? C.yellowDeep : UI.plateLine}`,
          boxShadow: `0 6px 14px rgba(185,138,18,${0.16 + 0.2 * g}), 0 0 0 ${overlap * 6}px rgba(242,106,33,${0.32 * overlap})${hover > 0 ? `, 0 0 0 ${5 * hover}px rgba(23,42,70,${0.5 * hover})` : ""}`,
        })}
      />
      <div style={box({ left: 16, top: 12, fontFamily: F.display, fontWeight: 900, fontSize: 38, letterSpacing: -0.5, color: UI.ink, lineHeight: 1 })}>{T.mystery}</div>
      {r.h > 90 ? <div style={box({ left: 14, top: 60, width: r.w - 28, height: Math.min(38, r.h - 72), borderRadius: 10, boxSizing: "border-box", border: "3px dashed rgba(185,138,18,0.55)", backgroundColor: "rgba(255,255,255,0.45)" })} /> : null}
    </div>
  );
};

export type CalendarWeekProps = {
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly hourH?: number; // высота часа (112 — монитор, 100 — планшет)
  readonly title?: string; // заголовок (по умолчанию «Директордун күн тартиби»)
  readonly drag?: number; // 0…1 — «Чейрек отчету» 11:00 → 16:00
  readonly grab?: number; // 0…1 — встреча взята (приподнята, подпись)
  readonly online?: number; // 0…1 — значок «Онлайн» у встречи
  readonly hover?: number; // 0…1 — курсор над 13:20: полоса 13:20 через всю неделю
  readonly hoverCol?: number; // колонка под курсором (обводка блока)
  readonly client?: number; // 0…1 — слот 13:30 рядом с 13:20 (спокойная отметка совпадения)
  readonly clientCol?: number;
  readonly glowAll?: number; // 0…1 — все пять 13:20 светятся (по очереди слева направо)
  readonly tomorrow?: number; // колонка «Эртең» (отметка), −1 — нет
  readonly tomorrowOn?: number; // 0…1 — появление отметки «Эртең»
  readonly cursor?: { readonly x: number; readonly y: number; readonly down?: number } | null; // кончик курсора в координатах недели
  readonly card?: boolean; // белая карточка с тенью (false — внутри экрана)
};

export const CalendarWeek: React.FC<CalendarWeekProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  hourH = WEEK.hourH,
  title = T.owner,
  drag = 0,
  grab = 0,
  online = 0,
  hover = 0,
  hoverCol = -1,
  client = 0,
  clientCol = WEEK_EVENTS.client.col,
  glowAll = 0,
  tomorrow = -1,
  tomorrowOn = 1,
  cursor = null,
  card = true,
}) => {
  const ev = WEEK_EVENTS;
  const H = weekHeight(hourH);
  const gridH = (WEEK.h1 - WEEK.h0) * hourH;
  const moved = CAL_DAYS[ev.drag.col].slots[1] as CalEntry;
  const dragE = easeInOut(clamp(drag));
  const lifted = clamp(grab);
  const dragR = weekBlock(ev.drag.col, lerp(ev.drag.from, ev.drag.to, dragE), 60, hourH);
  const tm = clamp(tomorrowOn);
  const myR = (c: number) => weekBlock(c, MYSTERY_MIN, 60, hourH);
  return (
    <div style={box({ left: x, top: y, width: WEEK.w, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" })}>
      {card ? <div style={box({ left: 0, top: 0, width: WEEK.w, height: H, borderRadius: 36, backgroundColor: UI.card, boxSizing: "border-box", border: `3px solid ${UI.cardLine}`, boxShadow: UI.shadow })} /> : null}
      <div style={box({ left: WEEK.pad, top: 22, width: WEEK.w - 2 * WEEK.pad, height: 64, display: "flex", alignItems: "center", gap: 18 })}>
        <CalGlyph size={58} />
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 42, color: UI.ink, whiteSpace: "nowrap" }}>{title}</div>
      </div>
      <div style={box({ left: WEEK.pad, top: 98, width: WEEK.w - 2 * WEEK.pad, height: 3, backgroundColor: UI.faintLine })} />
      {/* колонка «Эртең» */}
      {tomorrow >= 0 && tm > 0 ? <div style={box({ left: weekColX(tomorrow) - 6, top: WEEK.dayY - 4, width: WEEK.colW + 12, height: WEEK.gridY - WEEK.dayY + gridH + 10, borderRadius: 22, backgroundColor: `rgba(63,111,216,${0.09 * tm})`, border: `3px solid rgba(63,111,216,${0.42 * tm})`, boxSizing: "border-box" })} /> : null}
      {/* дни */}
      {CAL_DAYS.map((d, c) => {
        const isTm = c === tomorrow;
        const pill = isTm ? tm : 0;
        return (
          <div key={d.short} style={box({ left: weekColX(c), top: WEEK.dayY, width: WEEK.colW, height: WEEK.dayH })}>
            <div style={box({ left: 0, top: 0, width: WEEK.colW, height: WEEK.dayH, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.text, fontWeight: 800, fontSize: 40, color: UI.ink, opacity: 1 - pill })}>{d.short}</div>
            {pill > 0 ? (
              <div style={box({ left: 6, top: 10, width: WEEK.colW - 12, height: WEEK.dayH - 20, borderRadius: 28, backgroundColor: KIND.blue.stripe, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.text, fontWeight: 800, fontSize: 34, opacity: pill, transform: `scale(${0.85 + 0.15 * easeOut(pill)})` })}>{M13_TEXT.week.tomorrow}</div>
            ) : null}
          </div>
        );
      })}
      {/* шкала часов и линии */}
      {Array.from({ length: WEEK.h1 - WEEK.h0 + 1 }).map((_, i) => {
        const yy = WEEK.gridY + i * hourH;
        return (
          <div key={i}>
            <div style={box({ left: WEEK.pad + WEEK.axisW - 8, top: yy - 1, width: WEEK.w - 2 * WEEK.pad - WEEK.axisW + 8, height: 2, backgroundColor: UI.faintLine })} />
            {i < WEEK.h1 - WEEK.h0 ? <div style={box({ left: WEEK.pad, top: yy - 4, width: WEEK.axisW - 16, textAlign: "right", fontFamily: F.text, fontWeight: 500, fontSize: 30, lineHeight: 1, color: UI.sub })}>{String(WEEK.h0 + i).padStart(2, "0")}</div> : null}
          </div>
        );
      })}
      {/* полоса 13:20 через всю неделю (курсор над пунктом) */}
      {hover > 0 ? <div style={box({ left: weekColX(0) - 10, top: weekTimeY(MYSTERY_MIN, hourH) - 8, width: 5 * WEEK.colW + 4 * WEEK.colGap + 20, height: hourH + 10, borderRadius: 24, backgroundColor: `rgba(255,212,59,${0.26 * hover})` })} /> : null}
      {/* встречи */}
      {CAL_DAYS.map((d, c) =>
        dayItems(d).map((it) => {
          const isDrag = c === ev.drag.col && it.slot === 1;
          if (isDrag) return dragE > 0 ? <WeekBlock key={`${c}-${it.slot}`} e={it.e} r={weekBlock(c, it.min, 60, hourH)} ghost /> : null;
          const isOnline = c === ev.online.col && it.min === ev.online.min;
          return <WeekBlock key={`${c}-${it.slot}`} e={it.e} r={weekBlock(c, it.min, 60, hourH)} online={isOnline ? online : 0} />;
        }),
      )}
      {/* 13:20 — каждый день на одной высоте */}
      {CAL_DAYS.map((d, c) => (
        <WeekMystery key={`m-${d.short}`} r={myR(c)} glow={clamp(glowAll * 1.7 - c * 0.17)} hover={c === hoverCol ? hover : 0} overlap={c === clientCol ? client : 0} />
      ))}
      {/* «Онлайн» — плашка под встречей */}
      {online > 0
        ? (() => {
            const r = weekBlock(ev.online.col, ev.online.min, 60, hourH);
            const k = easeOut(clamp(online));
            const bw = 210;
            return (
              <div style={box({ left: r.x + r.w / 2 - bw / 2, top: r.y + r.h + 14, width: bw, height: 60, opacity: clamp(online * 2), transform: `translateY(${(1 - k) * -14}px) scale(${0.85 + 0.15 * k})`, zIndex: 2 })}>
                <div style={box({ left: bw / 2 - 10, top: -9, width: 20, height: 20, backgroundColor: KIND.blue.stripe, transform: "rotate(45deg)" })} />
                <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: 60, borderRadius: 30, backgroundColor: KIND.blue.stripe, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: F.text, fontWeight: 800, fontSize: 36, boxShadow: "0 8px 16px rgba(23,42,70,0.18)" }}>
                  <CameraIcon size={36} color="#FFFFFF" />
                  {T.online}
                </div>
              </div>
            );
          })()
        : null}
      {/* 13:30 кардар — ложится на 13:20 (спокойная оранжевая отметка) */}
      {client > 0
        ? (() => {
            const r = weekBlock(clientCol, ev.client.min, 60, hourH);
            const k = easeOut(clamp(client));
            return (
              <div style={box({ left: r.x + 12, top: r.y + 40, width: r.w - 4, height: r.h, opacity: clamp(client * 2), transform: `translateY(${(1 - k) * 30}px)`, zIndex: 2 })}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 16, backgroundColor: UI.clientTint, border: `3px solid ${UI.client}`, boxSizing: "border-box", boxShadow: "0 12px 22px rgba(242,106,33,0.22)", overflow: "hidden" }}>
                  <div style={box({ left: 0, top: 0, width: 8, height: "100%", backgroundColor: UI.client })} />
                  <div style={box({ left: 18, top: 12, fontFamily: F.display, fontWeight: 900, fontSize: 38, color: "#B4460F", letterSpacing: -0.5, lineHeight: 1 })}>{T.client.time}</div>
                  <Stripes color={UI.client} w={r.w - 40} top={62} />
                </div>
              </div>
            );
          })()
        : null}
      {/* перетаскиваемая встреча */}
      {drag < 1 || dragE > 0 ? (
        <div style={box({ left: dragR.x + 6 * lifted, top: dragR.y - 6 * lifted, width: dragR.w, height: dragR.h, transform: `rotate(${-2 * lifted}deg) scale(${1 + 0.05 * lifted})`, zIndex: 3 })}>
          <WeekBlock e={moved} r={{ x: 0, y: 0, w: dragR.w, h: dragR.h }} time={dragE > 0.98 ? MOVED.to : MOVED.from} lifted={lifted} />
        </div>
      ) : null}
      {lifted > 0 ? (
        <div style={box({ left: dragR.x + dragR.w + 14, top: dragR.y + 20, opacity: lifted, transform: `translateX(${(1 - easeOut(lifted)) * -20}px)`, zIndex: 4 })}>
          <div style={{ backgroundColor: C.navy, color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 38, padding: "12px 24px 14px", borderRadius: 18, whiteSpace: "nowrap", boxShadow: "0 10px 20px rgba(23,42,70,0.25)" }}>{`${MOVED.title} → ${MOVED.to}`}</div>
        </div>
      ) : null}
      {cursor ? (
        <div style={box({ left: 0, top: 0, zIndex: 5 })}>
          <Cursor x={cursor.x} y={cursor.y} down={cursor.down ?? 0} />
        </div>
      ) : null}
    </div>
  );
};

// ---------- Календарь «одним взглядом» (маленькие экраны) ----------
// Для экрана, который в кадре мелкий (ноутбук в обратном плане, планшет
// издалека): без мелкого текста — только крупная плашка 13:20 и цветные
// полосы соседних встреч. Номинал GLANCE.w × GLANCE.h; текст «13:20» —
// 83 px номинала (≥ 30 px на экране при масштабе ≥ 0,36).
export const GLANCE = { w: 1000, h: 640 } as const;
export const CalendarGlance: React.FC<{ readonly glow?: number; readonly meaning?: number; readonly warm?: number }> = ({ glow = 0, meaning = 0, warm = 0 }) => {
  const k = 1.6;
  const pw = (GLANCE.w - 80) / k;
  const bar = (y: number, kind: Kind, w: number) => (
    <div style={box({ left: 40, top: y, width: GLANCE.w - 80, height: 92, borderRadius: 22, backgroundColor: KIND[kind].tint, border: `4px solid ${KIND[kind].line}`, boxSizing: "border-box", overflow: "hidden" })}>
      <div style={box({ left: 0, top: 0, width: 14, height: "100%", backgroundColor: KIND[kind].stripe })} />
      <div style={box({ left: 44, top: 26, width: 150, height: 32, borderRadius: 16, backgroundColor: KIND[kind].stripe, opacity: 0.55 })} />
      <div style={box({ left: 230, top: 30, width: w, height: 24, borderRadius: 12, backgroundColor: KIND[kind].stripe, opacity: 0.3 })} />
    </div>
  );
  return (
    <div style={box({ left: 0, top: 0, width: GLANCE.w, height: GLANCE.h, backgroundColor: warm > 0 ? `rgb(${245 + 4 * warm},${247 - 6 * warm},${250 - 18 * warm})` : "#F5F7FA" })}>
      <div style={box({ left: 0, top: 0, width: GLANCE.w, height: 96, backgroundColor: UI.card, borderBottom: `4px solid ${UI.faintLine}` })} />
      <div style={box({ left: 40, top: 20 })}>
        <CalGlyph size={56} />
      </div>
      <div style={box({ left: 120, top: 34, width: 380, height: 28, borderRadius: 14, backgroundColor: UI.ink, opacity: 0.75 })} />
      {bar(122, "blue", 420)}
      {bar(230, "violet", 360)}
      <div style={box({ left: 40, top: 342, width: pw, height: PLATE.h, transform: `scale(${k})`, transformOrigin: "0 0" })}>
        <MysteryPlate w={pw} glow={glow} meaning={meaning} />
      </div>
      {bar(342 + PLATE.h * k + 22, "teal", 380)}
    </div>
  );
};

// ---------- Экран крупно (монитор помощницы, ноутбук директора) ----------
// Полный кадр 1080×1920: часть большого экрана — рамка устройства по краям
// кадра, окно приложения с календарём внутри (тот же дизайн). device:
// "monitor" — монитор помощницы (неделя, сцена 2c; внизу — нижняя рамка и
// край стола); "laptop" — ноутбук директора (день, сцена 3b; внизу —
// клавиатура). push 0…1 — медленный наезд (до 6 %), tilt — лёгкий наклон
// (градусы), warm 0…1 — тёплый вечерний свет. children — содержимое окна
// в его координатах: левый верхний угол окна — экранная точка
// (SCREEN_CONTENT.x, SCREEN_CONTENT.y), ширина SCREEN_CONTENT.w, высота
// SCREEN_CONTENT.h. Неделя: <CalendarWeek x={0} y={30} scale={0.82}
// hourH={150} card={false} /> заполняет окно (x 126…897 кадра).
export const SCREEN_CONTENT = { x: 126, y: 150, w: 1000, h: 1420 } as const;
export const ScreenInsert: React.FC<{ readonly device: "monitor" | "laptop"; readonly push?: number; readonly tilt?: number; readonly warm?: number; readonly children: React.ReactNode }> = ({ device, push = 0, tilt = 0, warm = 0, children }) => {
  const z = 1 + 0.06 * easeInOut(clamp(push));
  const laptop = device === "laptop";
  const bezel = laptop ? "#1E2128" : "#262A33";
  const sc = { x: 40, y: 116, w: 1120, h: 1500 };
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", backgroundColor: laptop ? "#B9BFC9" : "#D9DEE5" })}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${z}) rotate(${tilt}deg)`, transformOrigin: "540px 860px" })}>
        {laptop ? null : (
          <>
            {/* край стола и ножка монитора (низ кадра) */}
            <div style={box({ left: -100, top: 1700, width: 1300, height: 400, background: "linear-gradient(180deg, #EDEFF2, #DADFE6)" })} />
            <div style={box({ left: 380, top: 1660, width: 320, height: 120, borderRadius: "0 0 30px 30px", background: "linear-gradient(90deg, #9AA3B0, #B9C0CA 45%, #8D96A3)" })} />
            <div style={box({ left: 300, top: 1770, width: 480, height: 40, borderRadius: 20, backgroundColor: "#A9B1BC", boxShadow: "0 16px 26px rgba(23,42,70,0.18)" })} />
          </>
        )}
        {/* корпус: рамка вокруг экрана */}
        <div style={box({ left: sc.x - 40, top: sc.y - (laptop ? 62 : 44), width: sc.w + 80, height: sc.h + (laptop ? 62 : 44) + (laptop ? 18 : 64), borderRadius: 44, backgroundColor: bezel, boxShadow: "0 30px 60px rgba(20,24,40,0.25)" })} />
        {laptop ? <div style={box({ left: 532, top: sc.y - 38, width: 16, height: 16, borderRadius: 8, backgroundColor: "#3A3F4A" })} /> : null}
        {/* экран */}
        <div style={box({ left: sc.x, top: sc.y, width: sc.w, height: sc.h, borderRadius: 14, overflow: "hidden", backgroundColor: "#EEF2F7" })}>
          {/* боковая панель приложения */}
          <div style={box({ left: 0, top: 0, width: 66, height: "100%", backgroundColor: "#E2E8F0" })} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={box({ left: 17, top: 40 + i * 74, width: 32, height: 32, borderRadius: 9, backgroundColor: i === 0 ? C.navy : "#C3CCD8" })} />
          ))}
          <div style={box({ left: SCREEN_CONTENT.x - sc.x, top: SCREEN_CONTENT.y - sc.y, width: SCREEN_CONTENT.w, height: SCREEN_CONTENT.h })}>{children}</div>
          {/* блик стекла */}
          <div style={box({ left: 0, top: 0, width: "100%", height: "100%", background: "linear-gradient(118deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.08) 100%)" })} />
        </div>
        {laptop ? (
          <>
            {/* шарнир и клавиатура внизу кадра */}
            <div style={box({ left: -60, top: sc.y + sc.h + 18, width: 1200, height: 34, background: "linear-gradient(180deg, #6F7682, #8E949E)" })} />
            <div style={box({ left: -60, top: sc.y + sc.h + 52, width: 1200, height: 400, background: "linear-gradient(180deg, #C9CED6, #B3B9C3)" })} />
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 12 }).map((__, c) => <div key={`${r}-${c}`} style={box({ left: -40 + c * 100 - r * 16, top: sc.y + sc.h + 78 + r * 78, width: 86, height: 62, borderRadius: 12, backgroundColor: "#5B616C", boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.25)" })} />),
            )}
          </>
        ) : null}
      </div>
      {warm > 0 ? <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: `rgba(255,190,110,${0.12 * warm})` })} /> : null}
    </div>
  );
};

// ---------- Уведомление «Кардар» (сцена 2d) ----------
// Номинал NOTIFY.w × NOTIFY.h; appear 0…1 — выезжает сверху и садится.
export const NOTIFY = { w: 820, h: 470 } as const;
export const NotifyCard: React.FC<{ readonly x?: number; readonly y?: number; readonly scale?: number; readonly appear?: number }> = ({ x = 0, y = 0, scale = 1, appear = 1 }) => {
  const a = clamp(appear);
  if (a <= 0) return null;
  const k = easeOut(a);
  const over = 0.03 * Math.sin(Math.PI * clamp((a - 0.55) / 0.45)) * (1 - a);
  return (
    <div style={box({ left: x, top: y, width: NOTIFY.w, height: NOTIFY.h, transform: `translateY(${(1 - k - over) * -140}px) scale(${scale})`, transformOrigin: "0 0", opacity: clamp(a * 2.5) })}>
      <div style={box({ left: 0, top: 0, width: NOTIFY.w, height: NOTIFY.h, borderRadius: 44, backgroundColor: UI.card, boxSizing: "border-box", border: `3px solid ${UI.cardLine}`, boxShadow: "0 30px 60px rgba(23,42,70,0.22), 0 6px 14px rgba(23,42,70,0.1)" })} />
      <div style={box({ left: 0, top: 0, width: 14, height: NOTIFY.h, borderRadius: "44px 0 0 44px", backgroundColor: UI.client })} />
      <div style={box({ left: 52, top: 40, display: "flex", alignItems: "center", gap: 22 })}>
        <div style={{ width: 76, height: 76, borderRadius: 22, backgroundColor: UI.client, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={44} height={44} viewBox="0 0 44 44">
            <circle cx={22} cy={15} r={9} fill="#FFFFFF" />
            <path d="M 6 40 Q 6 26 22 26 Q 38 26 38 40 Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 52, color: UI.ink }}>{T.client.label}</div>
      </div>
      <div style={box({ left: 52, top: 140, fontFamily: F.display, fontWeight: 900, fontSize: 176, lineHeight: 1, letterSpacing: -4, color: UI.ink })}>{T.client.time}</div>
      <div style={box({ left: 56, top: 344, fontFamily: F.text, fontWeight: 500, fontSize: 46, color: UI.sub })}>{T.client.note}</div>
      <div style={box({ left: NOTIFY.w - 160, top: 54, width: 100, height: 100, opacity: 0.9 })}>
        <ClockIcon size={100} color={UI.client} bg={UI.clientTint} time={[1, 30]} />
      </div>
    </div>
  );
};

// ---------- Планшет помощницы ----------
// Номинал экрана TABLET.sw × TABLET.sh, корпус шире на bezel с каждой
// стороны. x, y — левый верхний угол корпуса; tilt — наклон (градусы).
// view: "proposal" — «Кардарга сунуш» и «14:30» печатаются (typed 0…1,
// сначала подпись, затем время), done 0…1 — галочка «готово»; "week" —
// неделя «Ушул жума», колонка «Эртең» отмечена, все 13:20 светятся
// (glowAll), внизу — пункт 13:20 на завтра.
export const TABLET = { sw: 940, sh: 1290, bezel: 34 } as const;
export const TABLET_W = TABLET.sw + 2 * TABLET.bezel;
const TABLET_HOUR = 100;
export const TABLET_H = TABLET.sh + 2 * TABLET.bezel;

export const ProposalCard: React.FC<{ readonly typed: number; readonly done?: number; readonly caret?: boolean; readonly w?: number; readonly h?: number }> = ({ typed, done = 0, caret = true, w = TABLET.sw, h = TABLET.sh }) => {
  const P = T.proposal;
  const tLabel = clamp(typed / 0.55);
  const tTime = clamp((typed - 0.6) / 0.4);
  const label = typedText(P.label, tLabel);
  const time = typedText(P.time, tTime);
  const caretOn = caret && done < 0.5;
  const caretEl = (size: number) => <span style={{ display: "inline-block", width: size * 0.07, height: size * 0.95, marginLeft: size * 0.06, backgroundColor: KIND.blue.stripe, verticalAlign: "middle", borderRadius: 3 }} />;
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: "#F5F7FA" })}>
      <div style={box({ left: 0, top: 0, width: w, height: 150, backgroundColor: UI.card, borderBottom: `3px solid ${UI.faintLine}` })} />
      <div style={box({ left: 48, top: 44, display: "flex", alignItems: "center", gap: 18 })}>
        <CalGlyph size={60} />
        <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 42, color: UI.ink }}>{T.app}</div>
      </div>
      {/* карточка предложения */}
      <div style={box({ left: 40, top: 220, width: w - 80, height: 820, borderRadius: 40, backgroundColor: UI.card, boxSizing: "border-box", border: `3px solid ${UI.cardLine}`, boxShadow: UI.shadow })} />
      <div style={box({ left: 40, top: 220, width: 14, height: 820, borderRadius: "40px 0 0 40px", backgroundColor: UI.client })} />
      <div style={box({ left: 100, top: 290, height: 90, display: "flex", alignItems: "center", fontFamily: F.text, fontWeight: 800, fontSize: 66, color: UI.ink, whiteSpace: "nowrap" })}>
        {label}
        {caretOn && tLabel < 1 ? caretEl(66) : null}
      </div>
      <div style={box({ left: 100, top: 410, width: w - 200, height: 3, backgroundColor: UI.faintLine })} />
      <div style={box({ left: 100, top: 470, width: w - 200, height: 330, borderRadius: 30, backgroundColor: "#FFF8DD", boxSizing: "border-box", border: `3px solid ${tTime > 0 ? UI.plateLine : UI.faintLine}` })} />
      <div style={box({ left: 140, top: 470, height: 330, display: "flex", alignItems: "center", fontFamily: F.display, fontWeight: 900, fontSize: 230, letterSpacing: -6, color: UI.ink, lineHeight: 1 })}>
        {time}
        {caretOn && tLabel >= 1 ? caretEl(200) : null}
      </div>
      <div style={box({ left: w - 230, top: 870, width: 130, height: 130, opacity: clamp(done * 2), transform: `scale(${0.6 + 0.4 * easeOut(clamp(done))})` })}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={65} cy={65} r={60} fill="#3FAE6A" />
          <path d="M 36 66 L 56 86 L 96 44" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={110} strokeDashoffset={110 * (1 - clamp(done * 1.6 - 0.3))} />
        </svg>
      </div>
    </div>
  );
};

export type TabletProps = {
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly tilt?: number;
  readonly view: "proposal" | "week";
  readonly typed?: number;
  readonly done?: number;
  readonly glowAll?: number;
  readonly tomorrow?: number;
  readonly tomorrowOn?: number;
};
export const TabletScreen: React.FC<TabletProps> = ({ x = 0, y = 0, scale = 1, tilt = 0, view, typed = 1, done = 0, glowAll = 0, tomorrow = 1, tomorrowOn = 1 }) => {
  const B = TABLET.bezel;
  return (
    <div style={box({ left: x, top: y, width: TABLET_W, height: TABLET_H, transform: `scale(${scale}) rotate(${tilt}deg)`, transformOrigin: "0 0" })}>
      {/* корпус: контур — тёмный оттенок графита, мягкая тень */}
      <div style={box({ left: 0, top: 0, width: TABLET_W, height: TABLET_H, borderRadius: 74, background: "linear-gradient(160deg, #3B4250, #262B35)", boxSizing: "border-box", border: "4px solid #1A1E26", boxShadow: "0 40px 70px rgba(20,24,40,0.28), 0 8px 16px rgba(20,24,40,0.16)" })} />
      <div style={box({ left: TABLET_W / 2 - 8, top: 13, width: 16, height: 16, borderRadius: 8, backgroundColor: "#4A5160" })} />
      <div style={box({ left: B, top: B, width: TABLET.sw, height: TABLET.sh, borderRadius: 42, overflow: "hidden", backgroundColor: "#F5F7FA" })}>
        {view === "proposal" ? (
          <ProposalCard typed={typed} done={done} />
        ) : (
          <>
            <CalendarWeek x={0} y={6} hourH={TABLET_HOUR} title={M13_TEXT.week.title} glowAll={glowAll} tomorrow={tomorrow} tomorrowOn={tomorrowOn} card={false} />
            <div style={box({ left: 0, top: weekHeight(TABLET_HOUR) + 14, width: TABLET.sw, height: 3, backgroundColor: UI.faintLine })} />
            <div style={box({ left: 40, top: weekHeight(TABLET_HOUR) + 30, height: 56, padding: "0 28px", borderRadius: 28, backgroundColor: KIND.blue.stripe, color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 36, display: "flex", alignItems: "center", opacity: clamp(tomorrowOn * 1.5) })}>{M13_TEXT.week.tomorrow}</div>
            <div style={box({ left: 40, top: weekHeight(TABLET_HOUR) + 100, width: TABLET.sw - 80, height: PLATE.h, opacity: clamp(tomorrowOn * 1.5) })}>
              <MysteryPlate w={TABLET.sw - 80} glow={clamp(glowAll * 1.3 - 0.3)} />
            </div>
          </>
        )}
        {/* лёгкий блик стекла */}
        <div style={box({ left: 0, top: 0, width: TABLET.sw, height: TABLET.sh, background: "linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.06) 100%)" })} />
      </div>
    </div>
  );
};

// ---------- Цифровые часы 13:19 → 13:20 (сцена 4a) ----------
// Настольные перекидные часы в стиле календаря: белые карточки, тёмно-синие
// цифры; минутная карточка перекидывается (flip 0…1), новое время коротко
// подсвечивается жёлтым. x, y — левый верхний угол корпуса; номинал
// CLOCK.w × CLOCK.h.
export const CLOCK = { w: 640, h: 380 } as const;
const FlapHalf: React.FC<{ readonly text: string; readonly half: "top" | "bottom"; readonly w: number; readonly h: number; readonly size: number; readonly hi?: number }> = ({ text, half, w, h, size, hi = 0 }) => (
  <div style={box({ left: 0, top: half === "top" ? 0 : h / 2, width: w, height: h / 2, overflow: "hidden", borderRadius: half === "top" ? "22px 22px 0 0" : "0 0 22px 22px", background: half === "top" ? "linear-gradient(180deg, #FFFFFF, #F1F4F8)" : "linear-gradient(180deg, #F6F8FB, #FFFFFF)" })}>
    <div style={box({ left: 0, top: half === "top" ? 0 : -h / 2, width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.03, color: UI.ink, lineHeight: 1 })}>{text}</div>
    {hi > 0 ? <div style={box({ left: 0, top: 0, width: w, height: h / 2, backgroundColor: `rgba(255,212,59,${0.22 * hi})` })} /> : null}
  </div>
);
const FlapCard: React.FC<{ readonly a: string; readonly b: string; readonly flip: number; readonly w: number; readonly h: number; readonly size: number; readonly hi?: number }> = ({ a, b, flip, w, h, size, hi = 0 }) => {
  const u = easeInOut(clamp(flip));
  const first = u < 0.5;
  const s = first ? Math.cos(u * Math.PI) : -Math.cos(u * Math.PI);
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, borderRadius: 22, boxShadow: "0 8px 14px rgba(23,42,70,0.18)" })}>
      {/* неподвижные половины: сверху уже открывается новое, снизу — старое до конца переворота */}
      <FlapHalf text={u > 0.001 ? b : a} half="top" w={w} h={h} size={size} hi={u > 0.001 ? hi : 0} />
      <FlapHalf text={u >= 0.999 ? b : a} half="bottom" w={w} h={h} size={size} hi={u >= 0.999 ? hi : 0} />
      {u > 0.001 && u < 0.999 ? (
        first ? (
          <div style={box({ left: 0, top: 0, width: w, height: h / 2, transformOrigin: "50% 100%", transform: `scaleY(${Math.max(0.001, s)})`, filter: `brightness(${1 - 0.25 * (1 - s)})` })}>
            <FlapHalf text={a} half="top" w={w} h={h} size={size} />
          </div>
        ) : (
          <div style={box({ left: 0, top: h / 2, width: w, height: h / 2, transformOrigin: "50% 0%", transform: `scaleY(${Math.max(0.001, s)})`, filter: `brightness(${1 - 0.2 * (1 - s)})` })}>
            <div style={box({ left: 0, top: -h / 2, width: w, height: h })}>
              <FlapHalf text={b} half="bottom" w={w} h={h} size={size} hi={hi} />
            </div>
          </div>
        )
      ) : null}
      <div style={box({ left: 0, top: h / 2 - 2, width: w, height: 4, backgroundColor: "rgba(23,42,70,0.28)" })} />
      <div style={box({ left: -4, top: h / 2 - 9, width: 10, height: 18, borderRadius: 3, backgroundColor: "#8E99AB" })} />
      <div style={box({ left: w - 6, top: h / 2 - 9, width: 10, height: 18, borderRadius: 3, backgroundColor: "#8E99AB" })} />
    </div>
  );
};

export const DigitalClock: React.FC<{ readonly x?: number; readonly y?: number; readonly scale?: number; readonly flip: number; readonly from?: string; readonly to?: string; readonly glow?: number }> = ({ x = 0, y = 0, scale = 1, flip, from = "13:19", to = M13_TEXT.clock, glow }) => {
  const [h0, m0] = from.split(":");
  const [h1, m1] = to.split(":");
  const g = glow ?? clamp((flip - 0.85) / 0.15);
  const cw = 236;
  const ch = 272;
  return (
    <div style={box({ left: x, top: y, width: CLOCK.w, height: CLOCK.h, transform: `scale(${scale})`, transformOrigin: "0 0" })}>
      {/* контактная тень и ножки */}
      <div style={box({ left: 40, top: CLOCK.h - 18, width: CLOCK.w - 80, height: 40, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,30,50,0.28), rgba(20,30,50,0))" })} />
      <div style={box({ left: 90, top: CLOCK.h - 26, width: 70, height: 26, borderRadius: 10, backgroundColor: "#9AA6B8" })} />
      <div style={box({ left: CLOCK.w - 160, top: CLOCK.h - 26, width: 70, height: 26, borderRadius: 10, backgroundColor: "#9AA6B8" })} />
      {/* корпус */}
      <div style={box({ left: 0, top: 0, width: CLOCK.w, height: CLOCK.h - 20, borderRadius: 52, background: "linear-gradient(180deg, #E4EAF2, #C9D3E0)", boxSizing: "border-box", border: "4px solid #AEBBCC", boxShadow: "inset 0 6px 0 rgba(255,255,255,0.7)" })} />
      {g > 0 ? <div style={box({ left: 300, top: 10, width: 330, height: 340, borderRadius: 60, background: `radial-gradient(closest-side, rgba(255,212,59,${0.55 * g}), rgba(255,212,59,0))` })} /> : null}
      <div style={box({ left: 52, top: 40, width: cw, height: ch })}>
        <FlapCard a={h0} b={h1} flip={h0 === h1 ? 0 : flip} w={cw} h={ch} size={170} />
      </div>
      <div style={box({ left: CLOCK.w / 2 - 10, top: 40 + ch / 2 - 46, width: 20, height: 20, borderRadius: 10, backgroundColor: C.navy })} />
      <div style={box({ left: CLOCK.w / 2 - 10, top: 40 + ch / 2 + 26, width: 20, height: 20, borderRadius: 10, backgroundColor: C.navy })} />
      <div style={box({ left: CLOCK.w - 52 - cw, top: 40, width: cw, height: ch })}>
        <FlapCard a={m0} b={m1} flip={flip} w={cw} h={ch} size={170} hi={g} />
      </div>
    </div>
  );
};
