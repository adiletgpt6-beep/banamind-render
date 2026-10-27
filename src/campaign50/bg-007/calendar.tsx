// Бумажный календарь недели, который ведёт себя как 2D-тетрис.
// Работа — большие блоки «Жыйын», «Кардар», «Отчёт»; школьная дорога —
// маленькие жёлтые блоки «Мектеп» (утром 07:30 и после уроков 13:00)
// в каждый будний день. Блоки занимают одни и те же часы, поэтому
// «Мектеп» не помещается: встречи приходится выталкивать наверх,
// сдвигать внахлёст, одна карточка выпадает. Когда маршрут уходит на
// отдельную линию BalaGo, рабочие блоки возвращаются на свои места.
//
// Координаты — единицы листа (ширина 1000). Состояние листа считается
// по кадру сцены; одинаковые функции используются в общем и крупном
// планах, поэтому блоки не «прыгают» между планами.
import { spring } from "remotion";
import { fontFamily } from "../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { BG7_TEXT } from "./script";

export const BW = 1000;
const COLX0 = 118;
const CW = 168;
const RH = 86;
const ROWS = 11; // 07:00 … 18:00
const GRID_TOP = 236;
export const LANE_H = 196;
export const boardH = (laneH: number) => GRID_TOP + laneH + ROWS * RH + 34;

export const C = {
  paper: "#FFFDF7",
  line: "#DCE6F2",
  navy: "#14285A",
  ink: "#24365F",
  yellow: "#FFC90E",
  yellowSoft: "#FFF4C2",
  red: "#E5484D",
  green: "#3E9C6B",
} as const;

type Kind = "meeting" | "client" | "report" | "school";
const FILL: Record<Kind, readonly [string, string, string]> = {
  // основной цвет, светлая грань, тёмная грань
  meeting: ["#2E4377", "#4A62A0", "#1F2F59"],
  client: ["#4C7BD9", "#73A0F0", "#3560B5"],
  report: ["#7A8BB0", "#9DACCC", "#5F6F93"],
  school: [C.yellow, "#FFE07A", "#E0A800"],
};

type Spec = { readonly id: string; readonly kind: Kind; readonly col: number; readonly row: number; readonly rows: number };

// Неделя папы (до школьной дороги): плотная, но без накладок.
const W = (col: number, kind: Kind, row: number, rows: number): Spec => ({ id: `w${col}-${row}`, kind, col, row, rows });
export const WORK: readonly Spec[] = [
  W(0, "meeting", 0, 2), W(0, "client", 2, 3), W(0, "report", 6, 2), W(0, "meeting", 8, 2),
  W(1, "client", 0, 3), W(1, "meeting", 4, 2), W(1, "client", 6, 3), W(1, "report", 9, 2),
  W(2, "report", 0, 2), W(2, "meeting", 2, 2), W(2, "client", 5, 3), W(2, "meeting", 8, 2),
  W(3, "meeting", 1, 3), W(3, "report", 6, 2), W(3, "client", 8, 3), W(3, "meeting", 4, 1),
  W(4, "client", 0, 2), W(4, "report", 3, 2), W(4, "meeting", 6, 3), W(4, "client", 9, 2),
];
// Школьная дорога: утром 07:00–09:00 (выезд 07:30), после уроков 13:00.
export const SCHOOL: readonly Spec[] = [0, 1, 2, 3, 4].flatMap((d) => [
  { id: `am${d}`, kind: "school" as const, col: d, row: 0, rows: 2 },
  { id: `pm${d}`, kind: "school" as const, col: d, row: 6, rows: 1 },
]);

// Какие рабочие блоки мешают школьной дороге.
const hits = (w: Spec, row: number, rows: number) => w.row < row + rows && row < w.row + w.rows;
const amConflict = (d: number) => WORK.find((w) => w.col === d && hits(w, 0, 2))!;
const pmConflict = (d: number) => WORK.find((w) => w.col === d && hits(w, 6, 1))!;

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export const slot = (col: number, row: number, rows: number, laneH = 0): Rect => ({
  x: COLX0 + col * CW + 6,
  y: GRID_TOP + laneH + row * RH + 5,
  w: CW - 12,
  h: rows * RH - 10,
});
const home = (s: Spec, laneH = 0) => slot(s.col, s.row, s.rows, laneH);

export type Draw = Rect & {
  readonly id: string;
  readonly kind: Kind;
  readonly label: string;
  readonly sub?: string;
  readonly rot: number;
  readonly alpha: number;
  readonly warn: number; // красная обводка: накладка, «не помещается»
  readonly glow: number; // подсветка блока в руке
  readonly scale: number;
  readonly cells: number; // клетки тетриса внутри блока
};

const labelOf = (s: Spec) =>
  s.kind === "school" ? BG7_TEXT.blocks.school : BG7_TEXT.blocks[s.kind === "meeting" ? "meeting" : s.kind === "client" ? "client" : "report"];
const subOf = (s: Spec) => (s.kind === "school" ? (s.row === 0 ? BG7_TEXT.schoolTimes.am : BG7_TEXT.schoolTimes.pm) : undefined);
const draw = (s: Spec, r: Rect, o: Partial<Draw> = {}): Draw => ({
  id: s.id,
  kind: s.kind,
  label: labelOf(s),
  sub: subOf(s),
  ...r,
  rot: 0,
  alpha: 1,
  warn: 0,
  glow: 0,
  scale: 1,
  cells: s.rows,
  ...o,
});

const sp = (f: number, damping = 13, stiffness = 170) => (f <= 0 ? 0 : spring({ frame: f, fps: 30, config: { damping, stiffness, mass: 0.8 } }));
const mix = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
// дуга: подъём над прямой между точками
const arc = (a: Rect, b: Rect, t: number, lift: number): Rect => {
  const m = mix(a, b, t);
  return { ...m, y: m.y - Math.sin(Math.PI * clamp(t)) * lift };
};

// ---------- «Переполнение»: вытолкнутые утренние встречи наверху ----------
// Лежат друг на друге над сеткой (поперёк), как гора тетриса.
const PILE: readonly { x: number; y: number; rot: number }[] = [
  { x: 760, y: 92, rot: 84 }, // Жм — первым двигает папа
  { x: 200, y: 120, rot: -86 },
  { x: 420, y: 70, rot: 92 },
  { x: 600, y: 128, rot: -80 },
  { x: 880, y: 150, rot: 97 },
];
const pileOrder = [1, 2, 3, 4, 0]; // день → место в куче
const pileRect = (s: Spec, k: number): Rect => {
  const r = home(s);
  const p = PILE[k];
  return { ...r, x: p.x - r.w / 2, y: p.y - r.h / 2 };
};
// Сдвиг послеобеденных блоков внахлёст на соседний день.
const shoved = (s: Spec): Rect => {
  const r = home(s);
  return s.col === 4 ? { ...r, x: r.x - CW * 0.42, y: r.y + RH * 0.45 } : { ...r, x: r.x + CW * 0.44, y: r.y + RH * 0.4 };
};

// Ожидание «Мектеп» над сеткой (не помещается).
export const SPAWN_Y = GRID_TOP - 180;
const spawnRect = (col: number, rows = 2): Rect => ({ ...slot(col, 0, rows), y: SPAWN_Y });

export type BoardState = {
  readonly blocks: readonly Draw[];
  readonly laneH: number;
  readonly lane: number; // 0…1 подписи линии BalaGo
  readonly status: number; // плашка «Маршрут пландалууда»
  readonly pause: number; // значок паузы
  readonly noRoom: number; // надпись «Орун жок»
  readonly noRoomX: number;
  readonly sparkle: number; // вспышка «всё на своих местах»
  readonly shake: number;
};

const base = (): BoardState => ({ blocks: [], laneH: 0, lane: 0, status: 0, pause: 0, noRoom: 0, noRoomX: 0, sparkle: 0, shake: 0 });

// ---------- Сцена 1: календарь собирается, «Мектеп» ищет место ----------
export const HOOK = { spawn: 50, step1: 64, step2: 74, drop: 86, bump: 92, rotate: 116, unrotate: 136 };
export const hookState = (f: number): BoardState => {
  const order = [...WORK].sort((a, b) => a.row - b.row || a.col - b.col);
  const blocks: Draw[] = order.map((s, i) => {
    const t0 = -6 + i * 1.8;
    const r = home(s);
    const k = sp(f - t0, 12, 190);
    return draw(s, { ...r, y: r.y - 700 * (1 - k) }, { alpha: f >= t0 ? 1 : 0, warn: s.id === "w0-0" ? bumpWarn(f) : 0 });
  });
  const am0 = SCHOOL[0];
  const col = f < HOOK.step1 ? 2 : f < HOOK.step2 ? lerp(2, 1, easeOut((f - HOOK.step1) / 5)) : lerp(1, 0, easeOut((f - HOOK.step2) / 5));
  const r = spawnRect(0);
  const x = COLX0 + col * CW + 6;
  // попытка опуститься: упирается в «Жыйын» и отскакивает
  const dy = f < HOOK.drop ? 0 : f < HOOK.bump ? 26 * easeOut((f - HOOK.drop) / 6) : 26 * (1 - easeOut((f - HOOK.bump) / 8));
  const rot = f < HOOK.rotate ? 0 : f < HOOK.unrotate ? 90 * easeOut((f - HOOK.rotate) / 7) : 90 * (1 - easeOut((f - HOOK.unrotate) / 7));
  const hover = f > 150 ? Math.sin(f / 7) * 3 : 0;
  blocks.push(
    draw(am0, { ...r, x, y: r.y + dy + hover }, { alpha: f >= HOOK.spawn ? 1 : 0, scale: 0.6 + 0.4 * sp(f - HOOK.spawn, 9, 200), warn: bumpWarn(f), rot }),
  );
  const nr = f < HOOK.bump ? 0 : clamp((f - HOOK.bump) / 6);
  return { ...base(), blocks, noRoom: nr, noRoomX: x + r.w / 2, shake: f >= HOOK.bump && f < HOOK.bump + 10 ? Math.sin(f * 2.6) * 4 * (1 - (f - HOOK.bump) / 10) : 0 };
};
function bumpWarn(f: number) {
  const a = f >= HOOK.bump - 2 ? clamp((f - HOOK.bump + 2) / 4) : 0;
  const b = f >= HOOK.rotate + 6 && f < HOOK.unrotate + 10 ? 1 : 0;
  return Math.max(a, b) * (0.75 + 0.25 * Math.sin(f / 3));
}

// ---------- Сцена 2: папа двигает встречи ----------
// Сначала вручную (пятница: «Жыйын» тянет наверх, утренний «Мектеп»
// встаёт на его место; после обеда «Мектеп» выбивает встречу, та
// выпадает), затем остальные дни — быстрее.
export const SHUFFLE = {
  grab: 16,
  lift: 50, // «Жыйын» Жм в куче
  am4: 52,
  pm4: 70,
  fall: 76,
  close: 112, // крупный план
  dayStep: 26,
  wide: 236,
};
const dayAt = (d: number) => SHUFFLE.close + 8 + d * SHUFFLE.dayStep; // дни 0…3
export const dragPath = (f: number): Rect => {
  const s = amConflict(4);
  const u = easeInOut((f - SHUFFLE.grab - 6) / (SHUFFLE.lift - SHUFFLE.grab - 6));
  return arc(home(s), pileRect(s, 0), u, 60);
};
const fallenAt = (f: number, s: Spec, t0: number): Partial<Draw> & Rect => {
  const r = home(s);
  const u = Math.max(0, f - t0);
  return { ...r, x: r.x + 3.2 * u, y: r.y + 0.9 * u * u, rot: u * 2.2, alpha: clamp(1 - (u - 36) / 8) };
};

export const shuffleState = (f: number): BoardState => {
  const blocks: Draw[] = [];
  let warnAny = 0;
  for (const s of WORK) {
    const d = s.col;
    const am = amConflict(d) === s;
    const pm = pmConflict(d) === s;
    const tAm = d === 4 ? SHUFFLE.grab : dayAt(d);
    const tPm = d === 4 ? SHUFFLE.pm4 : dayAt(d) + 12;
    if (am) {
      if (d === 4) {
        const r = f < SHUFFLE.grab ? home(s) : dragPath(f);
        const settle = f > SHUFFLE.lift ? sp(f - SHUFFLE.lift) : 0;
        blocks.push(draw(s, r, { rot: PILE[0].rot * easeInOut((f - SHUFFLE.grab - 10) / 30) + settle * Math.sin(f / 9) * 2, glow: f >= SHUFFLE.grab && f < SHUFFLE.lift + 4 ? 1 : 0, warn: f > SHUFFLE.lift ? 0.8 : 0 }));
      } else {
        const k = pileOrder[d];
        const u = easeInOut((f - tAm) / 14);
        const r = arc(home(s), pileRect(s, k), u, 120);
        blocks.push(draw(s, r, { rot: PILE[k].rot * u + (u >= 1 ? Math.sin(f / 9 + d) * 2 : 0), warn: u > 0.6 ? 0.8 : 0 }));
      }
    } else if (pm) {
      if (d === 0 || d === 4) {
        // понедельник и пятница: блок выпадает с листа
        const t0 = d === 4 ? SHUFFLE.fall : dayAt(0) + 14;
        if (f < t0) blocks.push(draw(s, home(s)));
        else {
          const fa = fallenAt(f, s, t0);
          blocks.push(draw(s, fa, { rot: fa.rot, alpha: fa.alpha, warn: 0.6 }));
        }
      } else {
        const u = easeOut((f - tPm - 2) / 8);
        const r = mix(home(s), shoved(s), u);
        warnAny = Math.max(warnAny, u);
        blocks.push(draw(s, r, { rot: u * (d % 2 ? 4 : -4), warn: u * (0.7 + 0.3 * Math.sin(f / 4)) }));
      }
    } else blocks.push(draw(s, home(s)));
  }
  // школьные блоки: появляются над своим местом и встают в сетку
  for (const s of SCHOOL) {
    const d = s.col;
    const isAm = s.row === 0;
    let t0: number;
    if (d === 4) t0 = isAm ? SHUFFLE.am4 : SHUFFLE.pm4;
    else t0 = dayAt(d) + (isAm ? 4 : 12);
    if (s.id === "am0") {
      // ожидал над сеткой с первой сцены (со стороны понедельника)
      const k = sp(f - (dayAt(0) + 10), 14, 160);
      blocks.push(draw(s, mix(spawnRect(0), home(s), k), { warn: (1 - k) * 0.7 * clamp(1 - f / 12) }));
      continue;
    }
    if (f < t0 - 6) continue;
    const k = sp(f - t0, 12, 200);
    const from = isAm ? { ...home(s), y: home(s).y - 260 } : { ...home(s), y: home(s).y - 40 };
    blocks.push(draw(s, mix(from, home(s), k), { alpha: clamp((f - t0 + 6) / 6), scale: isAm ? 1 : 1.18 - 0.18 * k }));
  }
  return { ...base(), blocks, shake: shakeAt(f) };
};
const shakeAt = (f: number) => {
  const hitsAt = [SHUFFLE.am4 + 6, SHUFFLE.pm4 + 6, ...[0, 1, 2, 3].flatMap((d) => [dayAt(d) + 10, dayAt(d) + 18])];
  let v = 0;
  for (const h of hitsAt) if (f >= h && f < h + 8) v = Math.sin((f - h) * 2.4) * 3 * (1 - (f - h) / 8);
  return v;
};
// Итог сцены 2 (дальше — пауза).
export const SHUFFLE_END = 300;

// ---------- Сцена 3: пауза ----------
export const pauseState = (f: number): BoardState => ({ ...shuffleState(SHUFFLE_END), pause: clamp(sp(f - 10, 14, 150)) });

// ---------- Сцена 4: отдельная линия BalaGo ----------
// t — кадр от начала показа листа в сцене.
export const LANE = { open: 4, fly: 14, back: 44, status: 90, sparkle: 104 };
export const laneState = (t: number): BoardState => {
  const start = shuffleState(SHUFFLE_END);
  const laneH = LANE_H * easeInOut((t - LANE.open) / 20);
  const blocks: Draw[] = [];
  for (const b of start.blocks) {
    const sch = SCHOOL.find((s) => s.id === b.id);
    if (sch) {
      const d = sch.col;
      const isAm = sch.row === 0;
      const t0 = LANE.fly + d * 5 + (isAm ? 0 : 3);
      const u = easeInOut((t - t0) / 18);
      const target = laneChip(d, isAm);
      const from = { ...home(sch, laneH) };
      const r = arc(from, target, u, 70);
      blocks.push({ ...b, ...r, cells: 1, warn: 0, glow: u > 0 && u < 1 ? 1 : 0, scale: 1, rot: 0 });
      continue;
    }
    const w = WORK.find((s) => s.id === b.id)!;
    const t0 = LANE.back + (w.col * 3 + w.row) % 14;
    const k = sp(t - t0, 14, 150);
    const shifted = { x: b.x, y: b.y + laneH, w: b.w, h: b.h };
    // выпавшие блоки возвращаются снизу
    const gone = b.alpha < 0.5;
    const from = gone ? { ...home(w, laneH), y: home(w, laneH).y + 900 } : shifted;
    const r = mix(from, home(w, laneH), k);
    blocks.push({ ...b, ...r, rot: b.rot * (1 - k), warn: b.warn * (1 - clamp(k * 1.5)), alpha: gone ? (t >= t0 ? 1 : 0) : 1 });
  }
  return {
    ...base(),
    blocks,
    laneH,
    lane: clamp((t - LANE.open - 10) / 12),
    status: clamp(sp(t - LANE.status, 14, 150)),
    pause: 1 - clamp((t - 0) / 8),
    sparkle: t >= LANE.sparkle ? clamp((t - LANE.sparkle) / 10) * (1 - clamp((t - LANE.sparkle - 14) / 16)) : 0,
  };
};
// Место школьного блока на линии BalaGo (над сеткой, в своём дне).
export const laneChip = (d: number, am: boolean): Rect => ({ x: COLX0 + d * CW + 10, y: GRID_TOP + 70 + (am ? 0 : 60), w: CW - 20, h: 52 });

// ---------- Рисование ----------
const Block: React.FC<{ readonly b: Draw }> = ({ b }) => {
  if (b.alpha <= 0) return null;
  const [fill, light, dark] = FILL[b.kind];
  const school = b.kind === "school";
  const small = b.h < 90;
  const tiny = b.h < 60;
  const txt = school ? C.navy : "#FFFFFF";
  const cellH = b.h / Math.max(1, b.cells);
  return (
    <div
      style={{
        position: "absolute",
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        opacity: b.alpha,
        transform: `rotate(${b.rot}deg) scale(${b.scale})`,
        borderRadius: 10,
        backgroundColor: fill,
        boxShadow: `inset 6px 6px 0 ${light}, inset -6px -6px 0 ${dark}, 0 ${b.glow ? 18 : 6}px ${b.glow ? 26 : 10}px rgba(20,40,90,${b.glow ? 0.35 : 0.2})`,
        outline: b.warn > 0.02 ? `${Math.round(4 + 4 * b.warn)}px solid rgba(229,72,77,${clamp(b.warn)})` : "none",
        outlineOffset: 2,
        overflow: "hidden",
      }}
    >
      {/* клетки тетриса */}
      {Array.from({ length: Math.max(0, b.cells - 1) }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 6, right: 6, top: cellH * (i + 1) - 2, height: 4, backgroundColor: dark, opacity: 0.45 }} />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: tiny ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: tiny ? 8 : 2,
          fontFamily,
          color: txt,
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        <div style={{ fontSize: tiny ? 22 : small ? 28 : 31, fontWeight: 900 }}>{tiny && school ? b.sub : b.label}</div>
        {b.sub && !tiny ? <div style={{ fontSize: small ? 24 : 28, fontWeight: 800, opacity: 0.85 }}>{b.sub}</div> : null}
      </div>
    </div>
  );
};

const PauseBadge: React.FC<{ readonly a: number }> = ({ a }) =>
  a <= 0 ? null : (
    <div style={{ position: "absolute", left: BW / 2 - 90, top: GRID_TOP + 360, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(20,40,90,0.88)", display: "flex", alignItems: "center", justifyContent: "center", gap: 26, opacity: a, transform: `scale(${0.7 + 0.3 * a})`, boxShadow: "0 16px 40px rgba(20,40,90,0.35)" }}>
      <div style={{ width: 28, height: 84, borderRadius: 8, backgroundColor: "#FFFFFF" }} />
      <div style={{ width: 28, height: 84, borderRadius: 8, backgroundColor: "#FFFFFF" }} />
    </div>
  );

// Лист календаря. Размер: BW × boardH(laneH) единиц.
export const Board: React.FC<{ readonly s: BoardState }> = ({ s }) => {
  const H = boardH(s.laneH);
  const t = BG7_TEXT.calendar;
  const gridTop = GRID_TOP + s.laneH;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: BW, height: H, fontFamily, transform: `translateX(${s.shake}px)` }}>
      {/* лист */}
      <div style={{ position: "absolute", left: 10, top: 18, width: BW - 20, height: H - 18, borderRadius: 18, backgroundColor: "rgba(20,40,90,0.12)", transform: "translate(8px, 12px)" }} />
      <div style={{ position: "absolute", left: 10, top: 18, width: BW - 20, height: H - 18, borderRadius: 18, backgroundColor: C.paper, border: "3px solid #E7DFCC" }} />
      {/* пружина */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 70 + i * 78, top: 0, width: 22, height: 50, borderRadius: 11, border: "6px solid #8A93A8", backgroundColor: "transparent" }} />
      ))}
      {/* заголовок */}
      <div style={{ position: "absolute", left: 44, top: 70, fontSize: 52, fontWeight: 900, color: C.navy, opacity: 1 - s.status }}>{t.title}</div>
      <div style={{ position: "absolute", right: 44, top: 82, display: "flex", gap: 14, alignItems: "center", opacity: 1 - s.status }}>
        {(["meeting", "client", "report"] as const).map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 24, fontWeight: 800, color: "#5A6B8C" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: FILL[k][0] }} />
            {BG7_TEXT.blocks[k]}
          </div>
        ))}
      </div>
      {/* дни */}
      {t.days.map((d, i) => (
        <div key={d} style={{ position: "absolute", left: COLX0 + i * CW, top: 160, width: CW, height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: C.ink, borderBottom: "4px solid #C9D6E8" }}>
          {d}
        </div>
      ))}
      {/* линия BalaGo: маршрут отдельно от рабочего дня */}
      {s.laneH > 1 ? (
        <div style={{ position: "absolute", left: 24, top: GRID_TOP - 4, width: BW - 48, height: s.laneH - 8, borderRadius: 18, backgroundColor: C.yellowSoft, border: `4px dashed rgba(224,168,0,${0.4 + 0.6 * s.lane})`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 18, top: 12, right: 18, display: "flex", alignItems: "center", gap: 14, opacity: s.lane, fontSize: 32, fontWeight: 900, color: C.navy, whiteSpace: "nowrap" }}>
            <span>{BG7_TEXT.lane.title}</span>
            <span style={{ padding: "2px 16px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 28 }}>{BG7_TEXT.lane.route}</span>
          </div>
        </div>
      ) : null}
      {/* часы и сетка */}
      {Array.from({ length: ROWS + 1 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: COLX0 - 8, top: gridTop + i * RH, width: CW * 5 + 16, height: 2, backgroundColor: C.line }} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: COLX0 + i * CW - 1, top: gridTop, width: 2, height: ROWS * RH, backgroundColor: C.line }} />
      ))}
      {Array.from({ length: ROWS }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 18, top: gridTop + i * RH + 6, width: 86, textAlign: "right", fontSize: 26, fontWeight: 800, color: "#8090B0" }}>
          {String(7 + i).padStart(2, "0")}:00
        </div>
      ))}
      {/* вспышка: все встречи на своих местах */}
      {s.sparkle > 0 ? (
        <div style={{ position: "absolute", left: COLX0, top: gridTop, width: CW * 5, height: ROWS * RH, borderRadius: 12, backgroundColor: `rgba(255,255,255,${0.55 * s.sparkle})`, boxShadow: `0 0 0 ${6 * s.sparkle}px rgba(62,156,107,${0.6 * s.sparkle})` }} />
      ) : null}
      {s.blocks.map((b) => (
        <Block key={b.id} b={b} />
      ))}
      {s.noRoom > 0 ? (
        <div style={{ position: "absolute", left: s.noRoomX - 120, top: SPAWN_Y - 74, width: 240, padding: "6px 0", borderRadius: 999, backgroundColor: C.red, color: "#FFFFFF", fontSize: 34, fontWeight: 900, textAlign: "center", opacity: s.noRoom, transform: `scale(${0.8 + 0.2 * s.noRoom})` }}>
          {t.noRoom}
        </div>
      ) : null}
      {s.status > 0 ? (
        <div style={{ position: "absolute", left: BW / 2 - 250, top: 58, width: 500, padding: "14px 0", borderRadius: 999, backgroundColor: "#FFFFFF", border: `4px dashed ${C.navy}`, color: C.navy, fontSize: 36, fontWeight: 900, textAlign: "center", opacity: s.status, transform: `scale(${0.85 + 0.15 * s.status})`, boxShadow: "0 10px 24px rgba(20,40,90,0.18)" }}>
          ⏳ {BG7_TEXT.lane.status}
        </div>
      ) : null}
      <PauseBadge a={s.pause} />
    </div>
  );
};

// Лист в кадре: левый верхний угол (x, y) и масштаб.
export const BoardAt: React.FC<{ readonly s: BoardState; readonly x: number; readonly y: number; readonly scale: number }> = ({ s, x, y, scale }) => (
  <div style={{ position: "absolute", left: x, top: y, width: BW, height: boardH(s.laneH), transform: `scale(${scale})`, transformOrigin: "0 0" }}>
    <Board s={s} />
  </div>
);
// Точка листа в координатах того, кто рисует лист в (x, y) с масштабом scale.
export const boardPoint = (bx: number, by: number, x: number, y: number, scale: number) => ({ x: x + bx * scale, y: y + by * scale });
