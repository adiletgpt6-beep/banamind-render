// Вставки сцены 4 (site): мама держит телефон двумя руками и всё делает
// САМА — (необязательно) ищет решение в обычном поиске без брендов
// поисковиков и нажимает первый результат BalaGo, затем
// заполняет страницу BalaGo (адрес, школа, время), нажимает кнопку
// «WhatsApp аркылуу жазуу», в чате видит уже подготовленное сообщение и
// сама нажимает «отправить». После отправки — одна серая галочка
// (отправлено, не прочитано и не подтверждено). MemoCard — нейтральная
// памятка «Ылайыктуу топ изделет» (поиск/ожидание, без зелёной галочки).
//
// Всё — полный кадр 1080×1920 с прозрачным фоном; движение детерминировано
// от времени t (с).
import { Easing, Img, interpolate, interpolateColors, staticFile } from "remotion";
import { fontFamily } from "../fonts";
import { INK_SOFT, NAVY, WHITE, YELLOW, YELLOW_DEEP } from "../palette";
import { backOut, clamp, ease, easeOut, prog } from "../scenes/common";
import { B48_TEXT, B48_VIDEO } from "../script";

export type PhoneFlowTimes = {
  // Этап поиска (экран 0) — только если заданы все три момента:
  // запрос набирается searchFrom…searchTo, первый результат нажимается в
  // tapResult, через 0,3 с — переход к странице BalaGo (fillFrom ≥ tapResult + 0,35).
  readonly searchFrom?: number;
  readonly searchTo?: number;
  readonly tapResult?: number;
  readonly fillFrom: number;
  readonly fillTo: number;
  readonly tapButton: number;
  readonly chatOpen: number;
  readonly tapSend: number;
  readonly sent: number;
  readonly exit: number;
};

// ---------- Цвета ----------
const SKIN = "#F2C9A4";
const SKIN_SHADE = "#DFA983";
const SKIN_LINE = "#CF936B";
const NAIL = "#F8DED0";
const CUFF = "#F4C430";
const CUFF_SHADE = "#D9A91E";
const CUFF_DEEP = "#C7961A";
const LABEL = "#6B7590";
const FIELD_LINE = "#E3E6EE";
const WA_HEADER = "#128C7E";
const WA_SEND = "#00A884";
const WA_GREEN = "#25D366";
const WA_BG = "#ECE5DD";
const WA_BUBBLE = "#DCF8C6";
const WA_TICK = "#8696A0";
const WA_TEXT = "#1F2A33";

// ---------- Геометрия (кадр 1080×1920) ----------
type Pt = { readonly x: number; readonly y: number };

const PH = { x: 240, y: 280, w: 600, h: 1200, r: 86 } as const;
const BEZEL = 18;
const SC = { x: PH.x + BEZEL, y: PH.y + BEZEL, w: PH.w - 2 * BEZEL, h: PH.h - 2 * BEZEL, r: 68 } as const;

// Экран 1 (координаты экрана 564 × 1164)
const HEAD_H = 318;
const CARD = { x: 22, y: 334, w: 520, h: 454 } as const;
const FIELD_TOP = 86;
const FIELD_STEP = 120;
const BTN = { x: 18, y: 1002, w: 528, h: 100 } as const;
const BTN_ICON = 72;
const BTN_ICON_C: Pt = { x: BTN.x + BTN.w - 14 - BTN_ICON / 2, y: BTN.y + BTN.h / 2 };
const ROUTE_Y = 862;

// Клавиатура (без надписей на клавишах)
const KB_H = 330;
const KB_TOP = SC.h - KB_H;
const KEY_W = 47.6;
const KEY_G = 8;
const KEY_H = 62;
const ROW_G = 10;
const KB_PAD = 12;
const KEY_STEP = KEY_W + KEY_G;

type Key = { readonly id: string; readonly x: number; readonly y: number; readonly w: number; readonly dark?: boolean };
const rowY = (r: number) => KB_PAD + r * (KEY_H + ROW_G);
const KEYS: readonly Key[] = [
  ...Array.from({ length: 10 }, (_, i) => ({ id: `0-${i}`, x: 8 + i * KEY_STEP, y: rowY(0), w: KEY_W })),
  ...Array.from({ length: 9 }, (_, i) => ({ id: `1-${i}`, x: 8 + KEY_STEP / 2 + i * KEY_STEP, y: rowY(1), w: KEY_W })),
  { id: "2-shift", x: 8, y: rowY(2), w: 70, dark: true },
  ...Array.from({ length: 7 }, (_, i) => ({ id: `2-${i}`, x: 91 + i * KEY_STEP, y: rowY(2), w: KEY_W })),
  { id: "2-back", x: 564 - 8 - 70, y: rowY(2), w: 70, dark: true },
  { id: "3-num", x: 8, y: rowY(3), w: 110, dark: true },
  { id: "3-space", x: 126, y: rowY(3), w: 312 },
  { id: "3-ret", x: 446, y: rowY(3), w: 110, dark: true },
];

// Центр клавиши в координатах кадра (клавиатура полностью поднята).
// Пробел — длинная клавиша: левый палец жмёт её левую часть, правый — правую.
const keyPoint = (id: string, left: boolean): Pt => {
  const k = KEYS.find((q) => q.id === id) ?? KEYS[0];
  const dx = id === "3-space" ? (left ? -80 : 80) : 0;
  return { x: SC.x + k.x + k.w / 2 + dx, y: SC.y + KB_TOP + k.y + KEY_H / 2 };
};

// Экран 2 (чат)
const CHAT_HEAD = 160;
const INPUT_BOTTOM = 54; // отступ поля ввода от низа экрана
const INPUT_LEFT = 14;
const INPUT_W = 430;
const TEXT_W = 390;
const SEND_R = 44;
const SEND_C: Pt = { x: 500, y: SC.h - INPUT_BOTTOM - SEND_R };
const BUBBLE_LEFT = SC.w - 16 - INPUT_W;
const BUBBLE_BOTTOM = INPUT_BOTTOM + 88 + 30;

const toFrame = (p: Pt): Pt => ({ x: SC.x + p.x, y: SC.y + p.y });

// Экран 0 (поиск, без логотипов и названий поисковиков)
type SearchTimes = { readonly from: number; readonly to: number; readonly tap: number };
const searchOf = (times: PhoneFlowTimes): SearchTimes | null =>
  times.searchFrom !== undefined && times.searchTo !== undefined && times.tapResult !== undefined
    ? { from: times.searchFrom, to: times.searchTo, tap: times.tapResult }
    : null;

const SRCH_BG = "#F2F4F8";
const SKEL = "#E1E6EE";
const SKEL_SOFT = "#ECEFF4";
const BAR = { x: 20, y: 76, w: 524 } as const;
const BAR_PAD_Y = 20;
const BAR_TEXT_X = 86; // текст запроса — правее лупы
const Q_FS = 40;
const Q_LH = 50;
const Q_MAX_CHARS = 18;

// Запрос переносится по словам заранее: строки не «прыгают» во время набора.
const wrapWords = (text: string, max: number): string[] => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && Array.from(next).length > max) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};
const Q_LINES = wrapWords(B48_TEXT.search.query, Q_MAX_CHARS);
// индекс первого символа строки в исходной строке (пробел переноса пропущен)
const Q_OFFSETS = Q_LINES.map((_, i) => Q_LINES.slice(0, i).reduce((a, l) => a + Array.from(l).length + 1, 0));
const Q_COUNT = Array.from(B48_TEXT.search.query).length;
const BAR_H_FULL = 2 * BAR_PAD_Y + Q_LH * Q_LINES.length;
const HEAD_BOTTOM = BAR.y + BAR_H_FULL + 26;
const SUGG_W = [300, 236, 330] as const; // ширина серых подсказок

// Результаты: первый — BalaGo (логотип, название, серая строка и превью
// страницы), остальные — серые заглушки без текста. Превью делает первую
// карточку высокой, чтобы большой палец доставал до неё снизу.
const RES = { x: 20, w: 524, gap: 20 } as const;
const R1_TOP = HEAD_BOTTOM + 26;
const R1_LOGO = 88;
const R1_TITLE_Y = 24 + R1_LOGO + 16;
const R1_LINE_Y = R1_TITLE_Y + 2 * 48 + 14;
const PV = { x: 24, y: R1_LINE_Y + 16 + 22, w: RES.w - 48, h: 300 } as const;
const R1_H = PV.y + PV.h + 24;
const R_H = 150;
const RES_TOPS = [R1_TOP, R1_TOP + R1_H + RES.gap, R1_TOP + R1_H + RES.gap + R_H + RES.gap] as const;
// кнопка в превью и точка касания первого результата (координаты экрана)
const PV_BTN = { x: 20, y: 236, w: PV.w - 40, h: 44 } as const;
const RESULT_TAP: Pt = { x: RES.x + PV.x + PV_BTN.x + PV_BTN.w - 50, y: R1_TOP + PV.y + PV_BTN.y + PV_BTN.h / 2 };

// Основания больших пальцев (под «подушкой» ладони у нижних углов) и покой.
const BASE_L: Pt = { x: 252, y: 1484 };
const BASE_R: Pt = { x: 1080 - 252, y: 1484 };
const REST_L: Pt = { x: 230, y: 1300 };
const REST_R: Pt = { x: 1080 - 230, y: 1300 };

// ---------- Помощники ----------
// Короткий «удар» 0→1→0 вокруг момента at.
const bump = (t: number, at: number, up: number, down: number) => {
  if (t < at - up || t > at + down) return 0;
  return t <= at ? prog(t, at - up, at) : 1 - prog(t, at, at + down);
};

type KF = { readonly t: number; readonly x: number; readonly y: number; readonly p: number; readonly key?: string };
type ThumbState = { readonly x: number; readonly y: number; readonly p: number; readonly key?: string };

const push = (arr: KF[], k: KF) => {
  if (arr.length === 0 || k.t > arr[arr.length - 1].t + 0.001) arr.push(k);
};

const sampleKF = (kfs: readonly KF[], t: number): ThumbState => {
  if (t <= kfs[0].t) return kfs[0];
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (t <= b.t) {
      const u = ease((t - a.t) / (b.t - a.t));
      const p = a.p + (b.p - a.p) * u;
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, p, key: p > 0.4 ? (a.key ?? b.key) : undefined };
    }
  }
  return kfs[kfs.length - 1];
};

// Палец «над» целью: чуть приподнят в сторону основания.
const lifted = (target: Pt, base: Pt, d = 18): Pt => {
  const dx = base.x - target.x;
  const dy = base.y - target.y;
  const l = Math.max(1, Math.hypot(dx, dy));
  return { x: target.x + (dx / l) * d, y: target.y + (dy / l) * d };
};

const tap = (arr: KF[], at: number, target: Pt, base: Pt, key?: string, hover = 0.12, release = 0.12) => {
  const h = lifted(target, base);
  push(arr, { t: at - hover, ...h, p: 0, key });
  push(arr, { t: at, ...target, p: 1, key });
  push(arr, { t: at + release, ...h, p: 0, key });
};

const TYPE_STEP = 0.19;
const KEYS_L = ["2-1", "1-2", "2-2", "1-1", "2-0", "1-3", "3-space", "2-3", "1-0", "2-1"] as const;
const KEYS_R = ["2-5", "1-6", "2-4", "1-7", "2-6", "1-5", "3-space", "1-8", "2-3", "1-4"] as const;

const typingTaps = (from: number, to: number) => {
  const out: { at: number; left: boolean; key: string }[] = [];
  let j = 0;
  for (let at = from + 0.04; at <= to - 0.06; at += TYPE_STEP) {
    const left = j % 2 === 0;
    const n = Math.floor(j / 2);
    out.push({ at, left, key: left ? KEYS_L[n % KEYS_L.length] : KEYS_R[n % KEYS_R.length] });
    j++;
  }
  return out;
};

const thumbTracks = (times: PhoneFlowTimes) => {
  const L: KF[] = [];
  const R: KF[] = [];
  const taps = typingTaps(times.fillFrom, times.fillTo);
  push(L, { t: 0, ...REST_L, p: 0 });
  push(R, { t: 0, ...REST_R, p: 0 });

  // этап поиска: набор запроса двумя пальцами → правый палец жмёт первый результат
  const s = searchOf(times);
  if (s) {
    push(L, { t: s.from - 0.42, ...REST_L, p: 0 });
    push(R, { t: s.from - 0.42, ...REST_R, p: 0 });
    for (const k of typingTaps(s.from, s.to)) {
      if (k.left) tap(L, k.at, keyPoint(k.key, true), BASE_L, k.key, 0.08, 0.08);
      else tap(R, k.at, keyPoint(k.key, false), BASE_R, k.key, 0.08, 0.08);
    }
    push(L, { t: s.to + 0.4, ...REST_L, p: 0 });
    const res = toFrame(RESULT_TAP);
    const hover = s.tap - 0.18;
    // длинная пауза до нажатия — палец ждёт в покое; короткая — тянется сразу
    if (hover - 0.5 > s.to + 0.35) {
      push(R, { t: s.to + 0.35, ...REST_R, p: 0 });
      push(R, { t: hover - 0.5, ...REST_R, p: 0 });
    }
    tap(R, s.tap, res, BASE_R, undefined, 0.18, 0.14);
    push(R, { t: s.tap + 0.34, ...lifted(res, BASE_R, 40), p: 0 });
    // к покою, только если до набора на странице остаётся время
    const restAt = Math.max(times.fillFrom - 0.42, s.tap + 0.7);
    if (restAt < times.fillFrom - 0.15) push(R, { t: restAt, ...REST_R, p: 0 });
  }

  push(L, { t: times.fillFrom - 0.42, ...REST_L, p: 0 });
  if (!s) push(R, { t: times.fillFrom - 0.42, ...REST_R, p: 0 });
  for (const k of taps) {
    if (k.left) tap(L, k.at, keyPoint(k.key, true), BASE_L, k.key, 0.08, 0.08);
    else tap(R, k.at, keyPoint(k.key, false), BASE_R, k.key, 0.08, 0.08);
  }
  push(L, { t: times.fillTo + 0.45, ...REST_L, p: 0 });
  push(R, { t: times.fillTo + 0.45, ...REST_R, p: 0 });

  // кнопка «WhatsApp аркылуу жазуу»
  const icon = toFrame(BTN_ICON_C);
  push(R, { t: Math.max(times.fillTo + 0.6, times.tapButton - 0.85), ...REST_R, p: 0 });
  tap(R, times.tapButton, icon, BASE_R, undefined, 0.16, 0.14);
  push(R, { t: times.tapButton + 0.32, ...lifted(icon, BASE_R, 30), p: 0 });
  push(R, { t: Math.max(times.tapButton + 0.75, times.chatOpen + 0.35), ...REST_R, p: 0 });

  // круглая кнопка «отправить» в чате
  const send = toFrame(SEND_C);
  push(R, { t: Math.max(times.chatOpen + 0.6, times.tapSend - 0.8), ...REST_R, p: 0 });
  tap(R, times.tapSend, send, BASE_R, undefined, 0.16, 0.14);
  push(R, { t: Math.max(times.tapSend + 0.3, times.sent + 0.12), ...lifted(send, BASE_R, 34), p: 0 });
  push(R, { t: times.sent + 0.65, ...REST_R, p: 0 });
  push(L, { t: times.sent + 0.65, ...REST_L, p: 0 });
  return { L, R };
};

// ---------- Мелкие элементы ----------
const Arrow: React.FC<{ readonly w: number; readonly color: string; readonly sw?: number }> = ({ w, color, sw = 4 }) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 34 20" style={{ flexShrink: 0 }}>
    <path d="M 2 10 H 30 M 22 3 L 31 10 L 22 17" stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WaGlyph: React.FC<{ readonly size: number; readonly bg: string; readonly fg: string }> = ({ size, bg, fg }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={30} fill={bg} />
    <path d="M 16 50 L 19 40 A 16 16 0 1 1 25 46 Z" fill={fg} />
    <path d="M 26 24 q 1 -3 3 -2 l 2 4 q 0 2 -2 3 q 2 5 7 7 q 1 -2 3 -2 l 4 2 q 1 2 -2 3 q -6 2 -12 -4 q -6 -6 -3 -11 Z" fill={bg} />
  </svg>
);

const StatusIcons: React.FC<{ readonly color: string }> = ({ color }) => (
  <svg width={120} height={28} viewBox="0 0 120 28">
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={2 + i * 9} y={20 - i * 5} width={6} height={6 + i * 5} rx={1.5} fill={color} />
    ))}
    <path d="M 48 13 a 14 14 0 0 1 20 0 M 52 17 a 8 8 0 0 1 12 0" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
    <circle cx={58} cy={21} r={2.6} fill={color} />
    <rect x={78} y={6} width={34} height={17} rx={5} fill="none" stroke={color} strokeWidth={2.4} opacity={0.9} />
    <rect x={81} y={9} width={24} height={11} rx={2.5} fill={color} />
    <rect x={113.5} y={11} width={3} height={7} rx={1.5} fill={color} />
  </svg>
);

// Набираемое значение: «→» рисуется (в шрифте стрелка мелкая).
const Typed: React.FC<{ readonly text: string; readonly n: number; readonly caret: number; readonly size: number }> = ({ text, n, caret, size }) => {
  const chars = Array.from(text).slice(0, n);
  return (
    <div style={{ display: "flex", alignItems: "center", whiteSpace: "pre" }}>
      {chars.map((c, i) =>
        c === "→" ? (
          <span key={i} style={{ display: "inline-flex", margin: "0 2px" }}>
            <Arrow w={size * 0.9} color={NAVY} sw={4.2} />
          </span>
        ) : (
          <span key={i}>{c}</span>
        ),
      )}
      <div style={{ width: 3, height: size * 1.12, borderRadius: 2, background: NAVY, marginLeft: 3, opacity: caret }} />
    </div>
  );
};

// Мягкое мерцание каретки: сплошная во время набора, затем плавно 1 → 0,15.
const caretOpacity = (t: number, lastChange: number) => {
  const since = t - lastChange;
  if (since < 0.45) return 1;
  const c = 0.5 + 0.5 * Math.cos(((since - 0.45) * Math.PI * 2) / 1.1);
  return 0.15 + 0.85 * c;
};

// ---------- Экран 1: страница BalaGo ----------
type FieldTiming = { readonly start: number; readonly end: number; readonly n: number };

const fieldTimings = (times: PhoneFlowTimes): FieldTiming[] => {
  const F = B48_TEXT.site.fields;
  const counts = F.map((f) => Array.from(f.v).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const gap = 0.22;
  const span = Math.max(0.3, times.fillTo - times.fillFrom - gap * (F.length - 1));
  const dt = span / total;
  let cur = times.fillFrom;
  return counts.map((n) => {
    const r = { start: cur, end: cur + n * dt, n };
    cur = r.end + gap;
    return r;
  });
};

const PageScreen: React.FC<{ readonly t: number; readonly times: PhoneFlowTimes; readonly pressed: readonly string[] }> = ({ t, times, pressed }) => {
  const S = B48_TEXT.site;
  const ft = fieldTimings(times);
  const kbIn = prog(t, times.fillFrom - 0.45, times.fillFrom - 0.05, easeOut) * (1 - prog(t, times.fillTo + 0.2, times.fillTo + 0.6, ease));
  const press = bump(t, times.tapButton, 0.09, 0.22);
  const ripple = prog(t, times.tapButton - 0.02, times.tapButton + 0.6, easeOut);
  const rippleOn = t >= times.tapButton - 0.02 && t < times.tapButton + 0.6;
  // мягкое приглашение нажать: кнопка «дышит» после закрытия клавиатуры
  const invite = t > times.fillTo + 0.5 && t < times.tapButton ? 0.5 - 0.5 * Math.cos((t - times.fillTo - 0.5) * Math.PI * 2 * 0.9) : 0;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", fontFamily, color: NAVY }}>
      {/* шапка страницы */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: SC.w,
          height: HEAD_H,
          background: "linear-gradient(180deg, #FFEFB8 0%, #FFF7DE 100%)",
          borderBottomLeftRadius: 46,
          borderBottomRightRadius: 46,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: -60, top: 150, width: 200, height: 200, borderRadius: 100, background: "rgba(247,197,49,0.22)" }} />
        <div style={{ position: "absolute", right: -40, top: 40, width: 150, height: 150, borderRadius: 75, background: "rgba(247,197,49,0.18)" }} />
        <Img
          src={staticFile(B48_VIDEO.logo)}
          style={{ position: "absolute", left: (SC.w - 116) / 2, top: 62, width: 116, height: 116, borderRadius: 58, boxShadow: "0 8px 18px rgba(30,58,110,0.18)" }}
        />
        <div style={{ position: "absolute", left: 0, width: SC.w, top: 184, textAlign: "center", fontSize: 50, fontWeight: 1000, lineHeight: "56px" }}>{S.brand}</div>
        <div style={{ position: "absolute", left: 0, width: SC.w, top: 244, textAlign: "center", fontSize: 26, fontWeight: 800, lineHeight: "32px", color: INK_SOFT }}>
          {S.tagline}
        </div>
      </div>

      {/* форма */}
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          background: WHITE,
          borderRadius: 32,
          border: "2px solid #EDF0F6",
          boxShadow: "0 12px 30px rgba(30,58,110,0.12)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", left: 26, top: 26, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 9, height: 36, borderRadius: 5, background: YELLOW }} />
          <div style={{ fontSize: 36, fontWeight: 1000, lineHeight: "44px" }}>{S.form}</div>
        </div>
        {S.fields.map((f, i) => {
          const tm = ft[i];
          const dt = (tm.end - tm.start) / tm.n;
          const n = Math.max(0, Math.min(tm.n, Math.floor((t - tm.start) / dt + 1e-6)));
          const next = i < ft.length - 1 ? ft[i + 1].start : times.fillTo + 0.4;
          const active = prog(t, tm.start - 0.18, tm.start - 0.02) * (1 - prog(t, next - 0.18, next - 0.02));
          const lastChange = tm.start + Math.min(n, tm.n) * dt;
          const caret = active > 0.5 ? caretOpacity(t, lastChange) : 0;
          const top = FIELD_TOP + i * FIELD_STEP;
          return (
            <div key={f.k}>
              <div style={{ position: "absolute", left: 28, top, fontSize: 24, fontWeight: 800, lineHeight: "30px", color: LABEL }}>{f.k}</div>
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  top: top + 36,
                  width: CARD.w - 48,
                  height: 68,
                  borderRadius: 18,
                  boxSizing: "border-box",
                  border: `3px solid ${interpolateColors(active, [0, 1], [FIELD_LINE, YELLOW])}`,
                  background: interpolateColors(active, [0, 1], ["#F7F8FB", "#FFFBEA"]),
                  boxShadow: `0 0 0 ${5 * active}px rgba(247,197,49,0.22)`,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 20,
                  fontSize: 32,
                  fontWeight: 900,
                  color: NAVY,
                }}
              >
                <Typed text={f.v} n={n} caret={caret} size={32} />
              </div>
            </div>
          );
        })}
      </div>

      {/* маршрут одной полной поездки */}
      <div style={{ position: "absolute", left: 0, width: SC.w, top: ROUTE_Y - 30, height: 60, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        {B48_TEXT.example.route.map((r, i) => (
          <div key={r + i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {i > 0 ? <Arrow w={34} color={NAVY} /> : null}
            <div
              style={{
                padding: "0 22px",
                height: 54,
                borderRadius: 27,
                display: "flex",
                alignItems: "center",
                fontSize: 26,
                fontWeight: 1000,
                background: i === 1 ? YELLOW : "#EEF3FB",
              }}
            >
              {r}
            </div>
          </div>
        ))}
      </div>

      {/* кнопка WhatsApp */}
      <div
        style={{
          position: "absolute",
          left: BTN.x,
          top: BTN.y,
          width: BTN.w,
          height: BTN.h,
          borderRadius: BTN.h / 2,
          background: interpolateColors(press, [0, 1], [YELLOW, "#F2BB1C"]),
          boxShadow: `0 ${8 - 6 * press}px 0 ${YELLOW_DEEP}, 0 ${14 - 8 * press}px ${26 + 18 * invite}px rgba(224,169,26,${0.28 + 0.25 * invite})`,
          transform: `translateY(${6 * press}px) scale(${1 - 0.025 * press + 0.012 * invite})`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: BTN.w - BTN_ICON - 24,
            height: BTN.h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 10,
            boxSizing: "border-box",
            fontSize: 29,
            fontWeight: 1000,
            whiteSpace: "nowrap",
            color: NAVY,
          }}
        >
          {S.button}
        </div>
        <div
          style={{
            position: "absolute",
            left: BTN_ICON_C.x - BTN.x - BTN_ICON / 2,
            top: (BTN.h - BTN_ICON) / 2,
            width: BTN_ICON,
            height: BTN_ICON,
            borderRadius: BTN_ICON / 2,
            background: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 8px rgba(30,58,110,0.18)",
          }}
        >
          <WaGlyph size={56} bg={WA_GREEN} fg={WHITE} />
        </div>
        {rippleOn ? (
          <div
            style={{
              position: "absolute",
              left: BTN_ICON_C.x - BTN.x - 560 * ripple,
              top: BTN.h / 2 - 560 * ripple,
              width: 1120 * ripple,
              height: 1120 * ripple,
              borderRadius: "50%",
              background: `rgba(255,255,255,${0.5 * (1 - ripple)})`,
            }}
          />
        ) : null}
      </div>

      <Keyboard k={kbIn} pressed={pressed} />
    </div>
  );
};

// Клавиатура (без надписей на клавишах), k — насколько поднята.
const Keyboard: React.FC<{ readonly k: number; readonly pressed: readonly string[] }> = ({ k: kbIn, pressed }) =>
  kbIn > 0.001 ? (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: KB_TOP,
        width: SC.w,
        height: KB_H,
        background: "#D3D8E0",
        transform: `translateY(${(1 - kbIn) * (KB_H + 20)}px)`,
        boxShadow: "0 -6px 18px rgba(30,58,110,0.10)",
      }}
    >
      {KEYS.map((k) => {
        const down = pressed.indexOf(k.id) >= 0;
        return (
          <div
            key={k.id}
            style={{
              position: "absolute",
              left: k.x,
              top: k.y + (down ? 2 : 0),
              width: k.w,
              height: KEY_H,
              borderRadius: 10,
              background: down ? "#BAC1CD" : k.dark ? "#B4BBC7" : WHITE,
              boxShadow: down ? "0 0 0 rgba(0,0,0,0)" : "0 2px 0 #9DA4B1",
            }}
          />
        );
      })}
    </div>
  ) : null;

// ---------- Экран 0: поиск ----------
const Magnifier: React.FC<{ readonly size: number; readonly color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
    <circle cx={18.5} cy={18.5} r={12.5} fill="none" stroke={color} strokeWidth={4.6} />
    <path d="M 28 28 L 38 38" stroke={color} strokeWidth={5.4} strokeLinecap="round" />
  </svg>
);

// Серая полоска-заглушка (без текста).
const Skel: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h?: number; readonly c?: string }> = ({ x, y, w, h = 16, c = SKEL }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: h / 2, background: c }} />
);

// Превью страницы в первом результате: те же жёлтая шапка, форма и
// кнопка, что на странице BalaGo (без надписей).
const PagePreview: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: PV.x,
      top: PV.y,
      width: PV.w,
      height: PV.h,
      borderRadius: 24,
      overflow: "hidden",
      background: WHITE,
      border: "2px solid #EDF0F6",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: PV.w,
        height: 118,
        background: "linear-gradient(180deg, #FFEFB8 0%, #FFF7DE 100%)",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: -40, top: 50, width: 120, height: 120, borderRadius: 60, background: "rgba(247,197,49,0.22)" }} />
      <div style={{ position: "absolute", right: -26, top: 10, width: 96, height: 96, borderRadius: 48, background: "rgba(247,197,49,0.18)" }} />
      <div style={{ position: "absolute", left: (PV.w - 54) / 2, top: 14, width: 54, height: 54, borderRadius: 27, background: WHITE, boxShadow: "0 3px 8px rgba(30,58,110,0.14)" }} />
      <Skel x={(PV.w - 150) / 2} y={78} w={150} h={14} c="rgba(30,58,110,0.28)" />
    </div>
    <div
      style={{
        position: "absolute",
        left: 20,
        top: 102,
        width: PV.w - 40,
        height: 120,
        borderRadius: 18,
        background: WHITE,
        border: "2px solid #EDF0F6",
        boxShadow: "0 6px 14px rgba(30,58,110,0.10)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", left: 16, top: 14, width: 6, height: 20, borderRadius: 3, background: YELLOW }} />
      <Skel x={30} y={17} w={150} h={14} c="rgba(30,58,110,0.30)" />
      <div style={{ position: "absolute", left: 14, top: 46, width: PV.w - 72, height: 26, borderRadius: 9, background: "#F7F8FB", border: `2px solid ${FIELD_LINE}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 14, top: 80, width: PV.w - 72, height: 26, borderRadius: 9, background: "#F7F8FB", border: `2px solid ${FIELD_LINE}`, boxSizing: "border-box" }} />
    </div>
    <div
      style={{
        position: "absolute",
        left: PV_BTN.x,
        top: PV_BTN.y,
        width: PV_BTN.w,
        height: PV_BTN.h,
        borderRadius: PV_BTN.h / 2,
        background: YELLOW,
        boxShadow: `0 4px 0 ${YELLOW_DEEP}`,
      }}
    >
      <Skel x={(PV_BTN.w - 60 - 170) / 2} y={(PV_BTN.h - 12) / 2} w={170} h={12} c="rgba(30,58,110,0.45)" />
      <div style={{ position: "absolute", right: 6, top: 5, width: 34, height: 34, borderRadius: 17, background: WHITE }} />
    </div>
  </div>
);

const SearchScreen: React.FC<{ readonly t: number; readonly s: SearchTimes; readonly pressed: readonly string[] }> = ({ t, s, pressed }) => {
  const dt = (s.to - s.from) / Math.max(1, Q_COUNT);
  const n = Math.max(0, Math.min(Q_COUNT, Math.floor((t - s.from) / dt + 1e-6)));
  // поле в фокусе, пока открыта клавиатура
  const focus = 1 - prog(t, s.to + 0.1, s.to + 0.4, ease);
  const kbIn = 1 - prog(t, s.to + 0.06, s.to + 0.42, ease);
  const caret = caretOpacity(t, n > 0 ? s.from + n * dt : 0) * focus;
  // строка, на которой каретка (после пробела переноса — уже на следующей)
  const caretLine = Q_OFFSETS.reduce((acc, o, i) => (i > 0 && n >= o ? i : acc), 0);
  // поле плавно растёт, когда запрос переходит на новую строку
  const grow = Q_OFFSETS.slice(1).reduce((acc, o) => {
    const at = s.from + o * dt;
    return acc + prog(t, at - 0.03, at + 0.12, easeOut);
  }, 0);
  const barH = 2 * BAR_PAD_Y + Q_LH * (1 + grow);
  // тонкая полоса загрузки после ввода
  const load = prog(t, s.to + 0.04, s.to + 0.38, Easing.linear);
  const loadOn = t > s.to + 0.02 && t < s.to + 0.46;
  const cardIn = (i: number) => {
    const u = prog(t, s.to + 0.12 + 0.08 * i, s.to + 0.44 + 0.08 * i, easeOut);
    return { opacity: u, transform: `translateY(${(1 - u) * 26}px)` };
  };
  const press = bump(t, s.tap, 0.08, 0.24);
  const ripple = prog(t, s.tap - 0.02, s.tap + 0.6, easeOut);
  const rippleOn = t >= s.tap - 0.02 && t < s.tap + 0.6;
  const title = B48_TEXT.search.result;

  return (
    <div style={{ position: "absolute", inset: 0, background: interpolateColors(focus, [0, 1], [SRCH_BG, WHITE]), fontFamily, color: NAVY }}>
      {/* подсказки во время набора — серые строки без текста */}
      {SUGG_W.map((w, i) => {
        const u = prog(t, s.from + 0.12 + 0.22 * i, s.from + 0.36 + 0.22 * i, easeOut) * (1 - prog(t, s.to + 0.02, s.to + 0.2));
        if (u <= 0.001) return null;
        const top = BAR.y + barH + 26 + 14 + i * 78;
        return (
          <div key={w} style={{ position: "absolute", left: 0, top, width: SC.w, height: 78, opacity: u, transform: `translateY(${(1 - u) * -10}px)` }}>
            <div style={{ position: "absolute", left: 36, top: 22 }}>
              <Magnifier size={32} color="#B7C0D0" />
            </div>
            <Skel x={88} y={30} w={w} h={18} />
            <div style={{ position: "absolute", left: 88, right: 24, bottom: 0, height: 2, background: "#E6EAF1" }} />
          </div>
        );
      })}

      {/* шапка с полем поиска */}
      <div style={{ position: "absolute", left: 0, top: 0, width: SC.w, height: BAR.y + barH + 26, background: WHITE, boxShadow: "0 4px 16px rgba(30,58,110,0.07)" }}>
        <div
          style={{
            position: "absolute",
            left: BAR.x,
            top: BAR.y,
            width: BAR.w,
            height: barH,
            boxSizing: "border-box",
            borderRadius: 45 - 10 * Math.min(1, grow),
            background: interpolateColors(focus, [0, 1], ["#F1F3F7", WHITE]),
            border: `3px solid ${interpolateColors(focus, [0, 1], [SKEL, "#AFC0DD"])}`,
            boxShadow: `0 0 0 ${6 * focus}px rgba(30,58,110,0.07), 0 4px 12px rgba(30,58,110,0.08)`,
          }}
        >
          <div style={{ position: "absolute", left: 26, top: BAR_PAD_Y - 3 + (Q_LH - 44) / 2 }}>
            <Magnifier size={44} color={LABEL} />
          </div>
          {Q_LINES.map((line, i) => {
            const shown = Math.max(0, Math.min(Array.from(line).length, n - Q_OFFSETS[i]));
            if (i > 0 && n < Q_OFFSETS[i]) return null;
            return (
              <div
                key={line}
                style={{
                  position: "absolute",
                  left: BAR_TEXT_X,
                  top: BAR_PAD_Y - 3 + i * Q_LH,
                  height: Q_LH,
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "pre",
                  fontSize: Q_FS,
                  fontWeight: 900,
                  lineHeight: `${Q_LH}px`,
                }}
              >
                {Array.from(line).slice(0, shown).join("")}
                <div style={{ width: 3.5, height: Q_FS * 1.1, borderRadius: 2, background: NAVY, marginLeft: 3, opacity: i === caretLine ? caret : 0 }} />
              </div>
            );
          })}
        </div>
        {loadOn ? (
          <div style={{ position: "absolute", left: 0, bottom: 0, width: SC.w, height: 5, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: `${-40 + 140 * load}%`, top: 0, width: "40%", height: 5, borderRadius: 3, background: "rgba(30,58,110,0.35)" }} />
          </div>
        ) : null}
      </div>

      {/* первый результат: BalaGo */}
      <div
        style={{
          position: "absolute",
          left: RES.x,
          top: RES_TOPS[0],
          width: RES.w,
          height: R1_H,
          ...cardIn(0),
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            overflow: "hidden",
            background: interpolateColors(press, [0, 1], [WHITE, "#EEF2F9"]),
            border: "2px solid #E6EAF1",
            boxShadow: `0 ${10 - 6 * press}px ${26 - 10 * press}px rgba(30,58,110,0.12)`,
            transform: `scale(${1 - 0.02 * press})`,
          }}
        >
          <Img
            src={staticFile(B48_VIDEO.logo)}
            style={{ position: "absolute", left: 24, top: 24, width: R1_LOGO, height: R1_LOGO, borderRadius: R1_LOGO / 2, boxShadow: "0 4px 12px rgba(30,58,110,0.16)" }}
          />
          <Skel x={24 + R1_LOGO + 20} y={46} w={190} h={18} />
          <Skel x={24 + R1_LOGO + 20} y={78} w={130} h={14} c={SKEL_SOFT} />
          <div style={{ position: "absolute", left: 24, top: R1_TITLE_Y, width: RES.w - 48, fontSize: 40, fontWeight: 1000, lineHeight: "48px", color: NAVY }}>{title}</div>
          <Skel x={24} y={R1_LINE_Y} w={230} h={16} />
          <PagePreview />
          {rippleOn ? (
            <div
              style={{
                position: "absolute",
                left: RESULT_TAP.x - RES.x - 620 * ripple,
                top: RESULT_TAP.y - RES_TOPS[0] - 620 * ripple,
                width: 1240 * ripple,
                height: 1240 * ripple,
                borderRadius: "50%",
                background: `rgba(30,58,110,${0.12 * (1 - ripple)})`,
              }}
            />
          ) : null}
        </div>
      </div>

      {/* остальные результаты — нейтральные серые заглушки */}
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: RES.x,
            top: RES_TOPS[i],
            width: RES.w,
            height: R_H,
            borderRadius: 30,
            background: WHITE,
            border: "2px solid #E6EAF1",
            boxShadow: "0 6px 18px rgba(30,58,110,0.07)",
            ...cardIn(i),
          }}
        >
          <div style={{ position: "absolute", left: 24, top: 26, width: 64, height: 64, borderRadius: 32, background: SKEL_SOFT }} />
          <Skel x={110} y={34} w={i === 1 ? 300 : 260} h={20} />
          <Skel x={110} y={70} w={i === 1 ? 190 : 220} h={14} c={SKEL_SOFT} />
          <Skel x={24} y={108} w={i === 1 ? 400 : 360} h={14} c={SKEL_SOFT} />
        </div>
      ))}

      <Keyboard k={kbIn} pressed={pressed} />
    </div>
  );
};

// ---------- Экран 2: чат WhatsApp ----------
const Doodles: React.FC = () => (
  <svg width={SC.w} height={SC.h} viewBox={`0 0 ${SC.w} ${SC.h}`} style={{ position: "absolute", left: 0, top: 0 }}>
    {Array.from({ length: 42 }, (_, i) => {
      const x = 24 + ((i * 139 + (i % 4) * 37) % 520);
      const y = CHAT_HEAD + 20 + ((i * 89 + (i % 3) * 53) % 900);
      const kind = i % 4;
      const rot = (i * 47) % 360;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} stroke="#D3C8B8" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.75}>
          {kind === 0 ? <circle r={9} /> : null}
          {kind === 1 ? <path d="M -9 0 H 9 M 0 -9 V 9" /> : null}
          {kind === 2 ? <path d="M -12 4 Q -6 -8 0 4 T 12 4" /> : null}
          {kind === 3 ? <path d="M -10 6 L 0 -10 L 10 6 Z" /> : null}
        </g>
      );
    })}
  </svg>
);

const SingleTick: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 20 15">
    <path d="M 2 8 L 7 13 L 18 2" stroke={WA_TICK} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatScreen: React.FC<{ readonly t: number; readonly times: PhoneFlowTimes }> = ({ t, times }) => {
  const C = B48_TEXT.chat;
  const fly = prog(t, times.sent, times.sent + 0.45, easeOut);
  const tick = interpolate(t, [times.sent + 0.38, times.sent + 0.68], [0, 1], { ...clamp, easing: backOut });
  const press = bump(t, times.tapSend, 0.08, 0.2);
  const ring = prog(t, times.tapSend - 0.02, times.tapSend + 0.5, easeOut);
  const ringOn = t >= times.tapSend - 0.02 && t < times.tapSend + 0.5;
  const caret = t < times.tapSend ? caretOpacity(t, times.chatOpen + 0.2) : 0;

  return (
    <div style={{ position: "absolute", inset: 0, background: WA_BG, fontFamily, overflow: "hidden" }}>
      <Doodles />
      {/* шапка чата */}
      <div style={{ position: "absolute", left: 0, top: 0, width: SC.w, height: CHAT_HEAD, background: WA_HEADER, boxShadow: "0 3px 10px rgba(0,0,0,0.15)" }}>
        <svg width={SC.w} height={CHAT_HEAD} viewBox={`0 0 ${SC.w} ${CHAT_HEAD}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M 34 92 L 20 107 L 34 122" stroke={WHITE} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* видео */}
          <rect x={392} y={95} width={30} height={24} rx={6} fill={WHITE} />
          <path d="M 424 104 L 436 96 V 118 L 424 110 Z" fill={WHITE} />
          {/* звонок */}
          <path
            d="M 470 96 q 3 -3 6 0 l 4 6 q 1 3 -1 5 l -3 2 q 3 7 10 10 l 2 -3 q 2 -2 5 -1 l 6 4 q 3 3 0 6 l -3 3 q -5 4 -16 -3 q -11 -8 -13 -19 q -1 -6 3 -10 Z"
            fill={WHITE}
          />
          {[98, 107, 116].map((y) => (
            <circle key={y} cx={538} cy={y} r={3.4} fill={WHITE} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: 50, top: 75, width: 64, height: 64, borderRadius: 32, background: WHITE, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}>
          <Img src={staticFile(B48_VIDEO.logo)} style={{ width: 64, height: 64 }} />
        </div>
        <div style={{ position: "absolute", left: 130, top: 84, fontSize: 36, fontWeight: 900, color: WHITE, lineHeight: "44px" }}>{C.title}</div>
      </div>

      {/* пустое поле ввода (после отправки) */}
      <div
        style={{
          position: "absolute",
          left: INPUT_LEFT,
          bottom: INPUT_BOTTOM,
          width: INPUT_W,
          height: 88,
          borderRadius: 44,
          background: WHITE,
          boxShadow: "0 2px 4px rgba(0,0,0,0.10)",
        }}
      >
        <svg width={44} height={44} viewBox="0 0 44 44" style={{ position: "absolute", left: 22, top: 22 }}>
          <circle cx={22} cy={22} r={18} fill="none" stroke={WA_TICK} strokeWidth={3.2} />
          <circle cx={15.5} cy={18} r={2.6} fill={WA_TICK} />
          <circle cx={28.5} cy={18} r={2.6} fill={WA_TICK} />
          <path d="M 13 26 Q 22 34 31 26" stroke={WA_TICK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* подготовленное сообщение: в поле ввода → улетает в чат пузырём */}
      <div
        style={{
          position: "absolute",
          left: INPUT_LEFT + (BUBBLE_LEFT - INPUT_LEFT) * fly,
          bottom: INPUT_BOTTOM + (BUBBLE_BOTTOM - INPUT_BOTTOM) * fly,
          width: INPUT_W,
          boxSizing: "border-box",
          padding: `18px 20px ${18 + 22 * fly}px 20px`,
          borderRadius: 40 - 20 * fly,
          borderTopRightRadius: 40 - 36 * fly,
          background: interpolateColors(fly, [0, 1], [WHITE, WA_BUBBLE]),
          boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
          transform: `scale(${1 - 0.04 * Math.sin(fly * Math.PI)})`,
          transformOrigin: "100% 100%",
        }}
      >
        <div style={{ width: TEXT_W, fontSize: 30, fontWeight: 700, lineHeight: "40px", color: WA_TEXT }}>
          {C.draft}
          <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 3, verticalAlign: "-6px", borderRadius: 2, background: WA_SEND, opacity: caret }} />
        </div>
        {/* хвостик пузыря */}
        <svg width={22} height={20} viewBox="0 0 22 20" style={{ position: "absolute", right: -14, top: 0, opacity: fly }}>
          <path d="M 0 0 H 22 L 0 18 Z" fill={WA_BUBBLE} />
        </svg>
        {/* одна серая галочка: отправлено (не «прочитано», не «подтверждено») */}
        <div style={{ position: "absolute", right: 18, bottom: 10, opacity: Math.min(1, tick * 1.2), transform: `scale(${0.4 + 0.6 * tick})`, transformOrigin: "50% 60%" }}>
          <SingleTick size={34} />
        </div>
      </div>

      {/* кнопка отправки */}
      {ringOn ? (
        <div
          style={{
            position: "absolute",
            left: SEND_C.x - SEND_R - 40 * ring,
            top: SEND_C.y - SEND_R - 40 * ring,
            width: 2 * (SEND_R + 40 * ring),
            height: 2 * (SEND_R + 40 * ring),
            borderRadius: "50%",
            border: `5px solid rgba(0,168,132,${0.55 * (1 - ring)})`,
            boxSizing: "border-box",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: SEND_C.x - SEND_R,
          top: SEND_C.y - SEND_R,
          width: SEND_R * 2,
          height: SEND_R * 2,
          borderRadius: SEND_R,
          background: interpolateColors(press, [0, 1], [WA_SEND, "#008F70"]),
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
          transform: `scale(${1 - 0.1 * press})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={46} height={46} viewBox="0 0 46 46">
          <path d="M 9 9 L 40 23 L 9 37 L 13 25.5 L 28 23 L 13 20.5 Z" fill={WHITE} />
        </svg>
      </div>
    </div>
  );
};

// ---------- Руки мамы ----------
// Левая рука (правая — зеркально): ладонь за телефоном, рукав жёлтого
// кардигана с манжетой уходит вниз за кадр.
const HandBack: React.FC = () => (
  <g>
    {/* рукав */}
    <path d="M 120 1640 C 160 1628 300 1634 352 1660 L 336 1960 L 30 1960 C 60 1860 92 1740 120 1640 Z" fill={CUFF} />
    <path d="M 120 1640 C 98 1730 70 1840 42 1960 L 92 1960 C 112 1850 132 1740 150 1650 Z" fill={CUFF_SHADE} opacity={0.75} />
    {/* ладонь (видна слева от телефона и под ним) */}
    <path
      d="M 300 1290 L 238 1286 C 204 1290 190 1316 194 1352 C 197 1382 186 1402 184 1432 C 182 1470 176 1508 168 1548 C 160 1590 148 1624 140 1660 L 344 1676 C 346 1626 352 1574 362 1520 L 362 1300 Z"
      fill={SKIN}
    />
    <path d="M 194 1352 C 197 1382 186 1402 184 1432 C 182 1470 176 1508 168 1548 C 160 1590 148 1624 140 1660 L 166 1662 C 176 1600 190 1530 196 1470 C 200 1420 208 1390 206 1356 Z" fill={SKIN_SHADE} opacity={0.6} />
    {/* костяшки пальцев, обхвативших телефон сзади */}
    <path d="M 238 1300 C 214 1302 204 1318 206 1338" stroke={SKIN_LINE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
    <path d="M 236 1392 C 214 1394 200 1410 200 1430" stroke={SKIN_LINE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55} />
    {/* манжета */}
    <g transform="rotate(3 240 1660)">
      <rect x={116} y={1622} width={248} height={74} rx={30} fill={CUFF} />
      <rect x={116} y={1622} width={248} height={74} rx={30} fill="none" stroke={CUFF_DEEP} strokeWidth={3} opacity={0.6} />
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M ${140 + i * 20} 1632 V 1686`} stroke={CUFF_SHADE} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      ))}
    </g>
  </g>
);

// Большой палец вместе с «подушкой» ладони (тенаром), лежащей поверх
// нижнего угла телефона: base — основание, tip — точка касания (центр
// подушечки пальца). flip — правая рука (тень и блик зеркально).
const Thumb: React.FC<{ readonly base: Pt; readonly tip: Pt; readonly p: number; readonly flip: boolean; readonly uid: string }> = ({ base, tip, p, flip, uid }) => {
  const dx = tip.x - base.x;
  const dy = tip.y - base.y;
  const len = Math.max(60, Math.hypot(dx, dy));
  const ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const hb = 46;
  const r = 38 * (1 + 0.04 * p);
  const yT = -len;
  const shaft = `M ${-hb} 40 L ${-hb} 0 C ${-hb - 2} ${yT * 0.4} ${-r - 5} ${yT * 0.78} ${-r} ${yT} A ${r} ${r} 0 0 1 ${r} ${yT} C ${r + 5} ${yT * 0.78} ${hb + 2} ${yT * 0.4} ${hb} 0 L ${hb} 40 Z`;
  const gid = `bg48-phoneflow-thumb-${uid}`;
  const fid = `bg48-phoneflow-thumbshadow-${uid}`;
  const sx = (flip ? -1 : 1) * (12 - 8 * p);
  const sy = 16 - 11 * p;
  const inner = flip ? -1 : 1; // сторона к центру телефона
  const body = (fill: string) => (
    <>
      <ellipse cx={0} cy={40} rx={66} ry={84} fill={fill} />
      <path d={shaft} fill={fill} />
    </>
  );
  return (
    <g>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={-hb} y1={0} x2={hb} y2={0}>
          <stop offset={0} stopColor={flip ? SKIN : SKIN_SHADE} />
          <stop offset={flip ? 0.6 : 0.4} stopColor={SKIN} />
          <stop offset={1} stopColor={SKIN} />
        </linearGradient>
        <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={8 - 4 * p} />
        </filter>
      </defs>
      <g transform={`translate(${base.x + sx} ${base.y + sy}) rotate(${ang})`} opacity={0.24 - 0.06 * p} filter={`url(#${fid})`}>
        {body("#4A2A12")}
      </g>
      <g transform={`translate(${base.x} ${base.y}) rotate(${ang})`}>
        {body(`url(#${gid})`)}
        {/* складка между пальцем и ладонью */}
        <path d={`M ${inner * (hb - 2)} -30 Q ${inner * (hb + 8)} -4 ${inner * (hb + 24)} 8`} stroke={SKIN_LINE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.45} />
        {/* сгиб сустава */}
        <path d={`M ${-r * 0.6} ${yT + r + 36} Q 0 ${yT + r + 27} ${r * 0.6} ${yT + r + 36}`} stroke={SKIN_LINE} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5} />
        <path d={`M ${-r * 0.38} ${yT + r + 46} Q 0 ${yT + r + 40} ${r * 0.38} ${yT + r + 46}`} stroke={SKIN_LINE} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.35} />
        {/* ноготь */}
        <rect x={-r * 0.62} y={yT - r * 0.84} width={r * 1.24} height={r * 1.5} rx={r * 0.56} fill={interpolateColors(p, [0, 1], [NAIL, "#FBEBE2"])} />
        <rect x={-r * 0.62} y={yT - r * 0.84} width={r * 1.24} height={r * 1.5} rx={r * 0.56} fill="none" stroke={SKIN_LINE} strokeWidth={2} opacity={0.35} />
        <path d={`M ${inner * -r * 0.3} ${yT - r * 0.55} Q ${inner * -r * 0.36} ${yT - r * 0.1} ${inner * -r * 0.3} ${yT + r * 0.3}`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
    </g>
  );
};

// ---------- Телефон с руками ----------
export const PhoneFlow: React.FC<{ readonly t: number; readonly times: PhoneFlowTimes }> = ({ t, times }) => {
  if (t > times.exit + 0.55) return null;
  const enter = prog(t, 0, 0.55, easeOut);
  const leave = prog(t, times.exit, times.exit + 0.5, Easing.bezier(0.5, 0, 0.75, 0.4));
  const sway = Math.sin(t * 0.9) * 0.45;
  const bob = Math.sin(t * 1.3 + 0.6) * 4;
  const s = searchOf(times);
  const dip = 5 * (bump(t, times.tapButton, 0.08, 0.24) + bump(t, times.tapSend, 0.08, 0.24) + (s ? bump(t, s.tap, 0.08, 0.24) : 0));
  const ty = (1 - enter) * 1700 + leave * 1750 + bob + dip;
  const rot = (1 - enter) * -5 + sway + leave * 4;
  const sc = 1 - leave * 0.08;

  const tracks = thumbTracks(times);
  const tl = sampleKF(tracks.L, t);
  const tr = sampleKF(tracks.R, t);
  const pressed = [tl.key, tr.key].filter((k): k is string => Boolean(k));

  // поиск → страница BalaGo (без поиска страница видна сразу)
  const slide0 = s ? prog(t, s.tap + 0.3, s.tap + 0.78, ease) : 1;
  const showPage = slide0 > 0;
  const slide = prog(t, times.chatOpen, times.chatOpen + 0.48, ease);
  const showChat = t >= times.chatOpen;
  const statusColor = interpolateColors(slide, [0, 1], [NAVY, WHITE]);

  // кольцо касания на экране (контакт пальца)
  const touches = [
    ...(s ? [{ at: s.tap, p: toFrame(RESULT_TAP), c: "#7F93B8" }] : []),
    { at: times.tapButton, p: toFrame(BTN_ICON_C), c: WHITE },
    { at: times.tapSend, p: toFrame(SEND_C), c: WHITE },
  ];

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transform: `translateY(${ty}px) rotate(${rot}deg) scale(${sc})`,
          transformOrigin: "540px 1500px",
        }}
      >
        {/* руки сзади */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
          <HandBack />
          <g transform="translate(1080 0) scale(-1 1)">
            <HandBack />
          </g>
        </svg>

        {/* корпус */}
        <div
          style={{
            position: "absolute",
            left: PH.x,
            top: PH.y,
            width: PH.w,
            height: PH.h,
            borderRadius: PH.r,
            background: "linear-gradient(160deg, #3A3E4C 0%, #20232D 45%, #171920 100%)",
            boxShadow: "0 40px 90px rgba(60,32,10,0.35), inset 0 0 0 3px rgba(255,255,255,0.10)",
          }}
        />
        {/* боковые кнопки */}
        <div style={{ position: "absolute", left: PH.x - 6, top: PH.y + 230, width: 8, height: 90, borderRadius: 4, background: "#2B2F3A" }} />
        <div style={{ position: "absolute", left: PH.x + PH.w - 2, top: PH.y + 300, width: 8, height: 140, borderRadius: 4, background: "#2B2F3A" }} />

        {/* экран */}
        <div style={{ position: "absolute", left: SC.x, top: SC.y, width: SC.w, height: SC.h, borderRadius: SC.r, overflow: "hidden", background: WHITE, clipPath: `inset(0 round ${SC.r}px)`, isolation: "isolate" }}>
          {s && slide0 < 1 ? (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-slide0 * 34}%)` }}>
              <SearchScreen t={t} s={s} pressed={pressed} />
              <div style={{ position: "absolute", inset: 0, background: "#0B1A33", opacity: slide0 * 0.22 }} />
            </div>
          ) : null}
          {showPage ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateX(${(1 - slide0) * 100 - slide * 34}%)`,
                boxShadow: slide0 < 1 ? "-12px 0 30px rgba(0,0,0,0.18)" : undefined,
              }}
            >
              <PageScreen t={t} times={times} pressed={pressed} />
              <div style={{ position: "absolute", inset: 0, background: "#0B1A33", opacity: slide * 0.22 }} />
            </div>
          ) : null}
          {showChat ? (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - slide) * 100}%)`, boxShadow: "-12px 0 30px rgba(0,0,0,0.18)" }}>
              <ChatScreen t={t} times={times} />
            </div>
          ) : null}
          {/* статус-бар и «островок» */}
          <div style={{ position: "absolute", right: 30, top: 16 }}>
            <StatusIcons color={statusColor} />
          </div>
          <div style={{ position: "absolute", left: (SC.w - 132) / 2, top: 14, width: 132, height: 38, borderRadius: 19, background: "#101218" }} />
          {/* полоска «домой» */}
          <div
            style={{
              position: "absolute",
              left: (SC.w - 170) / 2,
              bottom: 12,
              width: 170,
              height: 7,
              borderRadius: 4,
              background: interpolateColors(slide, [0, 1], ["#1E3A6E", "#5B6670"]),
              opacity: 0.55,
            }}
          />
          {/* мягкий блик стекла */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%)" }} />
        </div>

        {/* большие пальцы поверх экрана */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
          {touches.map(({ at, p, c }) => {
            const u = prog(t, at - 0.02, at + 0.42, easeOut);
            if (t < at - 0.02 || t > at + 0.42) return null;
            return <circle key={at} cx={p.x} cy={p.y} r={30 + 70 * u} fill="none" stroke={c} strokeWidth={6} opacity={0.7 * (1 - u)} />;
          })}
          <Thumb base={BASE_L} tip={tl} p={tl.p} flip={false} uid="l" />
          <Thumb base={BASE_R} tip={tr} p={tr.p} flip uid="r" />
        </svg>
      </div>
    </div>
  );
};

// ---------- Памятка «Ылайыктуу топ изделет» ----------
// Нейтральная информация (лупа + песочные часы), не подтверждение.
const SearchIcon: React.FC<{ readonly t: number; readonly sand: number }> = ({ t, sand }) => {
  const a = t * ((Math.PI * 2) / 2.4);
  const mx = 6 * Math.cos(a);
  const my = 5 * Math.sin(a);
  const top = 1 - sand;
  return (
    <svg width={150} height={150} viewBox="0 0 150 150">
      <defs>
        <clipPath id="bg48-memo-glass-top">
          <path d="M 30 32 H 80 C 80 56 62 66 56 74 H 54 C 48 66 30 56 30 32 Z" />
        </clipPath>
        <clipPath id="bg48-memo-glass-bottom">
          <path d="M 54 76 H 56 C 62 84 80 94 80 118 H 30 C 30 94 48 84 54 76 Z" />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={150} height={150} rx={40} fill="#FFF3CC" />
      {/* песочные часы */}
      <g>
        <path d="M 30 32 H 80 C 80 56 62 66 56 75 C 62 84 80 94 80 118 H 30 C 30 94 48 84 54 75 C 48 66 30 56 30 32 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" />
        <rect x={30} y={32 + (74 - 32) * (1 - top) + 6} width={50} height={60} fill={YELLOW} clipPath="url(#bg48-memo-glass-top)" />
        <rect x={30} y={118 - 40 * (0.25 + 0.75 * sand)} width={50} height={60} fill={YELLOW} clipPath="url(#bg48-memo-glass-bottom)" />
        <path d="M 55 76 V 112" stroke={YELLOW_DEEP} strokeWidth={3} strokeDasharray="5 5" strokeDashoffset={-t * 30} opacity={0.9} />
        <rect x={22} y={22} width={66} height={12} rx={6} fill={NAVY} />
        <rect x={22} y={116} width={66} height={12} rx={6} fill={NAVY} />
      </g>
      {/* лупа */}
      <g transform={`translate(${mx} ${my}) rotate(${4 * Math.sin(a)} 98 86)`}>
        <path d="M 116 104 L 136 126" stroke={NAVY} strokeWidth={14} strokeLinecap="round" />
        <circle cx={98} cy={86} r={27} fill="rgba(255,255,255,0.88)" stroke={NAVY} strokeWidth={8} />
        <path d="M 84 76 Q 90 66 102 66" stroke="#9CC9F0" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

const CalendarIcon: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 46 46" style={{ flexShrink: 0 }}>
    <rect x={4} y={8} width={38} height={34} rx={8} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
    <path d="M 4 18 H 42" stroke={NAVY} strokeWidth={4} />
    <path d="M 14 4 V 12 M 32 4 V 12" stroke={NAVY} strokeWidth={4} strokeLinecap="round" />
    <rect x={11} y={24} width={7} height={6} rx={2} fill={YELLOW_DEEP} />
    <rect x={21} y={24} width={7} height={6} rx={2} fill={YELLOW_DEEP} />
    <rect x={11} y={33} width={7} height={5} rx={2} fill={YELLOW_DEEP} opacity={0.6} />
  </svg>
);

export const MemoCard: React.FC<{ readonly t: number; readonly at: number; readonly x: number; readonly y: number; readonly width?: number }> = ({
  t,
  at,
  x,
  y,
  width = 860,
}) => {
  if (t < at) return null;
  const M = B48_TEXT.memo;
  const pop = interpolate(t, [at, at + 0.5], [0, 1], { ...clamp, easing: backOut });
  const o = prog(t, at, at + 0.22);
  const item = (d: number) => {
    const u = prog(t, at + d, at + d + 0.35, easeOut);
    return { opacity: u, transform: `translateY(${(1 - u) * 18}px)` };
  };
  const sand = prog(t, at + 0.3, at + 8, Easing.linear);
  const dash = M.search.indexOf(" — ");
  const searchHead = dash >= 0 ? M.search.slice(0, dash + 3) : M.search;
  const searchTail = dash >= 0 ? M.search.slice(dash + 3) : "";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        boxSizing: "border-box",
        padding: "34px 40px 34px 40px",
        borderRadius: 44,
        background: WHITE,
        border: `5px solid ${YELLOW}`,
        boxShadow: "0 26px 60px rgba(30,40,80,0.26), 0 6px 14px rgba(30,40,80,0.10)",
        fontFamily,
        color: NAVY,
        opacity: o,
        transform: `translateY(${(1 - pop) * 40}px) scale(${0.86 + 0.14 * pop})`,
        transformOrigin: "50% 30%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ flexShrink: 0 }}>
          <SearchIcon t={t - at} sand={sand} />
        </div>
        <div style={{ fontSize: 60, fontWeight: 1000, lineHeight: "64px", ...item(0.08) }}>{M.title}</div>
      </div>
      <div style={{ height: 0, borderTop: "3px dashed #E2E6EF", margin: "26px 0 22px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 38, fontWeight: 900, lineHeight: "48px", ...item(0.25) }}>
        <CalendarIcon />
        <div>
          {searchHead}
          {searchTail ? (
            <span style={{ background: "linear-gradient(180deg, rgba(247,197,49,0) 52%, rgba(247,197,49,0.75) 52%, rgba(247,197,49,0.75) 92%, rgba(247,197,49,0) 92%)", padding: "0 4px" }}>
              {searchTail}
            </span>
          ) : null}
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 22px",
          borderRadius: 26,
          background: "#EEF2FA",
          fontSize: 34,
          fontWeight: 800,
          lineHeight: "42px",
          color: INK_SOFT,
          ...item(0.4),
        }}
      >
        <svg width={42} height={42} viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
          <circle cx={21} cy={21} r={19} fill={NAVY} />
          <circle cx={21} cy={12.5} r={3} fill={WHITE} />
          <rect x={18.2} y={18} width={5.6} height={14} rx={2.8} fill={WHITE} />
        </svg>
        {M.note}
      </div>
    </div>
  );
};
