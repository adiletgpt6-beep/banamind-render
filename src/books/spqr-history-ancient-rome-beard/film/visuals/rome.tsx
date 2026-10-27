// Сцены «Мастерской городских ворот» BM-040: ворота из цветных точек, стол с
// четырьмя предметами, карточка со сменой статуса «легенда / свидетельство /
// вывод», лента эпох (подписи дат, не таймер), условные векторные карты по
// картам издания, круги принадлежности, таблица «кто что может», слова власти,
// речь на форуме, письма наместника и императора, жизнь неэлитных людей.
// Всё — собственные схемы фильма, не реконструкции и не иллюстрации издания.
// Каждая деталь зависит только от времени сцены (без случайного шума).
import React from "react";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { Appear, area, Arrow, at, Check, Cross, Drift, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Particles, rnd } from "./particles";
import { Figure, Label, OL } from "./props";
import { clamp01 } from "./kit";

type P = { host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const A = <T = string,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);
// перенос длинной подписи на две строки по ближайшему к середине пробелу
export const wrap = (t: string, max = 18) => {
  if (t.includes("\n") || t.length <= max) return t;
  const mid = t.length / 2;
  let best = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? t : `${t.slice(0, best)}\n${t.slice(best + 1)}`;
};
// ширина плашки Label (та же формула, что в props.tsx) и сдвиг внутрь области кадра
const labelW = (t: string, size: number) => Math.max(...t.split("\n").map((l) => l.length)) * size * 0.56 + size * 1.3;
const fitX = (x: number, t: string, size: number, x0: number, x1: number) => {
  const h = labelW(t, size) / 2 + 8;
  return Math.max(x0 + h, Math.min(x1 - h, x));
};
const BG: Record<string, string> = { teal: C.tealSoft, coral: C.coralSoft, amber: C.amberSoft, plum: C.plumSoft, sage: C.sageSoft, sky: C.skySoft, white: C.white, yellow: C.yellow };
const FG: Record<string, string> = { teal: C.teal, coral: C.coral, amber: C.amber, plum: C.plum, sage: C.sage, sky: C.sky, ink: C.inkSoft, steel: C.steel };

// ───────────── Ворота: граница города → граница участия → принадлежность ─────────────
// p.sign: [[текст, beat]] — надпись над аркой меняется; p.openBeat — створки
// раскрываются; p.inside/outside — фигуры по обе стороны; p.joinBeat — часть
// внешних фигур проходит внутрь; p.labels — подписи по бокам.
export const Gate: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx + N(p.dx, 0);
  const signs = A<[string, number]>(p.sign);
  const openK = p.openBeat !== undefined ? ramp(t, at(ctx, N(p.openBeat, 1)), 1.6) : N(p.open, 0);
  const joinK = p.joinBeat !== undefined ? ramp(t, at(ctx, N(p.joinBeat, 2)), 2.4) : 0;
  const nIn = N(p.inside, 0);
  const nOut = N(p.outside, 0);
  const joinN = N(p.join, Math.ceil(nOut / 2));
  const cols = [C.teal, C.amber, C.coral, C.sage, C.plum, C.sky];
  // текущая надпись: последняя начавшаяся
  let si = -1;
  signs.forEach(([, b], i) => {
    if (t >= at(ctx, b)) si = i;
  });
  const gy = 470;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.035}>
      {/* земля и дорога сквозь ворота */}
      <path d={`M ${cx - 760} ${gy + 300} L ${cx + 760} ${gy + 300}`} stroke={C.stoneDeep} strokeWidth={6} opacity={0.5} />
      <path d={`M ${cx - 110} ${gy + 300} L ${cx - 330} ${gy + 420} L ${cx + 330} ${gy + 420} L ${cx + 110} ${gy + 300} Z`} fill={C.stone} opacity={0.6} />
      <Particles shape="gate" t={t} at={0.15} dur={2.2} x={cx} y={gy} s={N(p.s, 0.82)} r={5.4} step={14} spread={900} />
      {/* створки раскрываются поверх точечного проёма */}
      {openK > 0 && (
        <g transform={`translate(${cx} ${gy}) scale(${N(p.s, 0.82)})`}>
          <rect x={-120} y={-160} width={240} height={430} fill="#fff7e2" opacity={openK} />
          <g transform={`translate(-120 0) scale(${1 - 0.8 * openK} 1)`}>
            <rect x={0} y={-10} width={118} height={280} fill={C.amber} stroke={OL} strokeWidth={4} opacity={0.95} />
          </g>
          <g transform={`translate(120 0) scale(${-(1 - 0.8 * openK)} 1)`}>
            <rect x={0} y={-10} width={118} height={280} fill={C.amber} stroke={OL} strokeWidth={4} opacity={0.95} />
          </g>
        </g>
      )}
      {/* надпись над аркой — смысл ворот меняется */}
      {si >= 0 && (
        <g key={si} transform={`translate(${cx} ${gy - 330}) scale(${0.85 + 0.15 * pop(t, at(ctx, signs[si][1]))})`}>
          <Label x={0} y={0} text={signs[si][0]} size={40} bg={[C.white, C.amberSoft, C.tealSoft, C.yellow][si % 4]} />
        </g>
      )}
      {/* фигуры: внутри (за воротами) и снаружи */}
      {Array.from({ length: nIn }).map((_, i) => (
        <Figure key={`in${i}`} x={cx + 200 + i * 95} y={gy + 330 + (i % 2) * 22} s={0.36} color={cols[i % cols.length]} k={ramp(t, 0.8 + i * 0.15, 0.5)} bob={wob(t, i, 2)} />
      ))}
      {Array.from({ length: nOut }).map((_, i) => {
        const joining = i < joinN ? joinK : 0;
        const x0 = cx - 230 - i * 95;
        const x1 = cx + 200 + (nIn + i) * 85;
        return <Figure key={`out${i}`} x={x0 + (x1 - x0) * joining} y={gy + 340 + (i % 2) * 22 - Math.sin(joining * Math.PI) * 30} s={0.36} color={cols[(i + 3) % cols.length]} k={ramp(t, 1 + i * 0.15, 0.5)} bob={wob(t, i + 9, 2)} />;
      })}
      {A<[string, number, string?]>(p.labels).map(([text, b, side], i) => (
        <Appear key={i} t={t} at={at(ctx, b)} x={side === "left" ? cx - 520 : cx + 520} y={gy - 120 + (i % 2) * 90}>
          <Label x={0} y={0} text={text} size={32} bg={side === "left" ? C.coralSoft : C.tealSoft} />
        </Appear>
      ))}
    </Drift>
  );
};

// ───────────── Стол мастерской: четыре предмета ─────────────
const ITEMS = [
  { shape: "scroll", label: "запись\nо происхождении" },
  { shape: "ballot", label: "решение\nсобрания" },
  { shape: "badge", label: "знак\nвоенной службы" },
  { shape: "diploma", label: "документ\nгражданства" },
];
export const Workshop: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const focus = N(p.focus, -1);
  const fAt = at(ctx, N(p.focusBeat, 1));
  const fk = focus >= 0 ? ramp(t, fAt, 0.9) : 0;
  const w = Math.min(1500, Ar.x1 - Ar.x0 - 40);
  const x0 = Ar.cx - w / 2;
  const tableY = 720;
  const shown = N(p.shown, 4);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* стол */}
      <Appear t={t} at={0.1} x={0} y={0} dy={20}>
        <rect x={x0 - 30} y={tableY} width={w + 60} height={40} rx={18} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
        <rect x={x0 + 20} y={tableY + 40} width={30} height={140} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
        <rect x={x0 + w - 50} y={tableY + 40} width={30} height={140} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
      </Appear>
      {ITEMS.slice(0, shown).map((it, i) => {
        const slot = x0 + (w / 4) * (i + 0.5);
        const isF = i === focus;
        const bx = isF ? slot + (Ar.cx - slot) * fk : slot;
        const by = isF ? 560 - 120 * fk : 560;
        const sc = isF ? 0.42 + 0.26 * fk : 0.42 * (focus >= 0 ? 1 - 0.25 * fk : 1);
        const op = focus >= 0 && !isF ? 1 - 0.55 * fk : 1;
        const a0 = 0.3 + i * N(p.stagger, 0.5);
        return (
          <g key={i} opacity={op}>
            <Particles shape={it.shape} t={t} at={a0} dur={1.6} x={bx} y={by} s={sc} r={7} step={17} spread={500} />
            <Appear t={t} at={a0 + 1.2} x={bx} y={isF ? by + 290 * sc + 30 : tableY + 80}>
              <Label x={0} y={0} text={wrap(S(A(p.labels)[i], it.label), 14)} size={isF ? 34 : 27} bg={isF ? C.yellow : C.white} />
            </Appear>
          </g>
        );
      })}
      {S(p.title) && (
        <Appear t={t} at={0.2} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.title)} size={40} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── Карточка утверждения со сменой статуса ─────────────
// p.text — утверждение; p.stamps: [[ярлык, beat, цвет]] — штамп меняется,
// подпись рамки «статус» не исчезает; p.notes: [[текст, beat]] — пояснения ниже.
export const Status: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const lines = S(p.text).split("\n");
  const stamps = A<[string, number, string]>(p.stamps);
  let si = -1;
  stamps.forEach(([, b], i) => {
    if (t >= at(ctx, b)) si = i;
  });
  const w = Math.min(1180, Ar.x1 - Ar.x0 - 60);
  const h = lines.length * 70 + 120;
  const k = ramp(t, 0.2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      <g opacity={k} transform={`translate(${Ar.cx} ${330 + (1 - k) * 30})`}>
        <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={30} fill="#24324a" opacity={0.1} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={C.cream} stroke={OL} strokeWidth={4} />
        <text fontFamily={SERIF} fontWeight={700} fontSize={52} fill={C.ink} textAnchor="middle">
          {lines.map((l, i) => (
            <tspan key={i} x={0} y={-h / 2 + 95 + i * 70}>
              {l}
            </tspan>
          ))}
        </text>
      </g>
      {/* статус: старые штампы остаются зачёркнутыми, новый ставится поверх */}
      <g transform={`translate(${Ar.cx} ${330 + h / 2 + 90})`}>
        <Txt x={0} y={-6} size={28} color={C.inkSoft} weight={800}>
          {si >= 0 ? "статус утверждения" : ""}
        </Txt>
        {(() => {
          // ширина штампа по тексту; если ряд не помещается — уменьшаем шрифт
          const avail = Ar.x1 - Ar.x0 - 40;
          let fs = 40;
          const widths = () => stamps.map(([l]) => l.length * fs * 0.66 + 70);
          while (fs > 26 && widths().reduce((a, w) => a + w + 36, -36) > avail) fs -= 2;
          const ws = widths();
          const total = ws.reduce((a, w) => a + w + 36, -36);
          let acc = -total / 2;
          return stamps.map(([label, b, col], i) => {
            const w = ws[i];
            const x = acc + w / 2;
            acc += w + 36;
            if (i > si) return null;
            const old = i < si;
            const kk = pop(t, at(ctx, b));
            const c = FG[col] ?? C.plum;
            return (
              <g key={i} transform={`translate(${x} 70) rotate(${old ? -2 : -4}) scale(${0.6 + 0.4 * kk})`} opacity={old ? 0.5 : 1}>
                <rect x={-w / 2} y={-fs * 1.1} width={w} height={fs * 2.2} rx={16} fill={C.white} stroke={c} strokeWidth={7} />
                <text y={fs * 0.38} fontFamily={HEAVY} fontWeight={900} fontSize={fs} fill={c} textAnchor="middle">
                  {label}
                </text>
                {old && <line x1={-w / 2 + 16} y1={0} x2={w / 2 - 16} y2={0} stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />}
              </g>
            );
          });
        })()}
      </g>
      {A<[string, number]>(p.notes).map(([text, b], i) => (
        <Appear key={i} t={t} at={at(ctx, b)} x={Ar.cx} y={330 + h / 2 + 250 + i * 80}>
          <Label x={0} y={0} text={text} size={32} bg={i % 2 ? C.tealSoft : C.amberSoft} />
        </Appear>
      ))}
    </Drift>
  );
};

// ───────────── Лента эпох: подписи исторических дат (не таймер) ─────────────
// Ось без нулевого года: «до н. э.» слева, «н. э.» справа, между 1 г. до н. э.
// и 1 г. н. э. — разделитель эр. p.marks: [[подпись, год (минус = до н. э.), beat]];
// p.spans: [[от, до, подпись, beat, цвет]]; p.range: [мин, макс].
export const Era: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const [lo, hi] = A<number>(p.range).length === 2 ? A<number>(p.range) : [-800, 250];
  const x0 = Ar.x0 + 60;
  const x1 = Ar.x1 - 60;
  const X = (y: number) => x0 + ((y - lo) / (hi - lo)) * (x1 - x0);
  const axisY = 560;
  const k = ramp(t, 0.15, 0.9);
  const fmt = (y: number) => (y < 0 ? `${-y} г. до н. э.` : `${y} г. н. э.`);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.02}>
      <line x1={x0} y1={axisY} x2={x0 + (x1 - x0) * k} y2={axisY} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      {lo < 0 && hi > 0 && k > 0.9 && (
        <g transform={`translate(${X(0)} ${axisY})`}>
          <line y1={-60} y2={60} stroke={C.coral} strokeWidth={5} strokeDasharray="10 8" />
          <Txt x={-16} y={100} size={26} anchor="end" color={C.inkSoft}>
            до н. э.
          </Txt>
          <Txt x={16} y={100} size={26} anchor="start" color={C.inkSoft}>
            н. э.
          </Txt>
        </g>
      )}
      {A<[number, number, string, number, string?]>(p.spans).map(([a, b, label, beat, col], i) => {
        const kk = ramp(t, at(ctx, beat), 0.8);
        if (kk <= 0) return null;
        const c = FG[col ?? "teal"] ?? C.teal;
        const y = axisY - 70 - (i % 2) * 70;
        return (
          <g key={i} opacity={clamp01(kk * 1.4)}>
            <rect x={X(a)} y={y - 18} width={(X(b) - X(a)) * kk} height={36} rx={18} fill={c} opacity={0.85} />
            <Txt x={(X(a) + X(b)) / 2} y={y - 34} size={30} color={C.ink}>
              {label}
            </Txt>
          </g>
        );
      })}
      {A<[string, number, number]>(p.marks).map(([label, year, beat], i) => {
        const a = at(ctx, beat);
        const kk = pop(t, a);
        if (kk <= 0.01) return null;
        const below = i % 2 === 0;
        const x = X(year);
        return (
          <g key={i} opacity={clamp01(kk * 1.4)}>
            <circle cx={x} cy={axisY} r={14 * kk} fill={C.amber} stroke={OL} strokeWidth={4} />
            <line x1={x} y1={axisY + (below ? 20 : -20)} x2={x} y2={axisY + (below ? 120 : -120)} stroke={C.inkSoft} strokeWidth={3} />
            <Label x={fitX(x, `${label}\n${fmt(year)}`, 28, Ar.x0, Ar.x1)} y={axisY + (below ? 170 : -170)} text={`${label}\n${fmt(year)}`} size={28} bg={C.white} />
          </g>
        );
      })}
      {S(p.title) && (
        <Appear t={t} at={0.2} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.title)} size={38} bg={C.white} />
        </Appear>
      )}
      {S(p.note) && (
        <Appear t={t} at={at(ctx, N(p.noteBeat, 1))} x={Ar.cx} y={830}>
          <Label x={0} y={0} text={S(p.note)} size={30} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── Условные карты (упрощённо по картам издания) ─────────────
type MapDef = { land: [number, number][][]; sea?: [number, number][][]; river?: [number, number][]; pts: Record<string, [number, number]>; bg: "land" | "sea"; tf: (x: number, y: number) => [number, number] };
const T = (sx: number, ox: number, oy: number) => (x: number, y: number): [number, number] => [x * sx + ox, y * sx + oy];
// Лаций и соседи (по карте 1 издания): море — слева снизу.
const LATIUM: MapDef = {
  bg: "land",
  tf: T(1.15, 660, 40),
  land: [],
  sea: [[[0, 290], [50, 320], [100, 370], [140, 420], [180, 480], [195, 520], [230, 570], [270, 600], [300, 630], [340, 660], [400, 690], [500, 698], [0, 698]]],
  river: [[210, 30], [230, 150], [220, 260], [260, 330], [250, 420], [245, 457], [200, 500], [185, 505]],
  pts: { Рим: [245, 457], Вейи: [215, 405], "Альба-Лонга": [215, 497], Лавиниум: [200, 540], Остия: [185, 505], Тускул: [295, 490], Пренеста: [355, 470], Тибур: [290, 428], Габии: [320, 445], Этрурия: [70, 260], Сабины: [380, 370], Лациум: [250, 565], Вольски: [440, 610], Эквы: [420, 450] },
};
// Италия (по карте 3 издания).
const ITALY: MapDef = {
  bg: "sea",
  tf: T(1.0, 650, 90),
  land: [
    [[110, 200], [150, 225], [200, 250], [230, 300], [253, 322], [270, 345], [300, 365], [345, 390], [360, 410], [380, 430], [400, 455], [420, 480], [440, 520], [460, 560], [470, 600], [470, 640], [485, 650], [500, 620], [500, 560], [495, 500], [500, 440], [507, 400], [560, 420], [615, 410], [605, 370], [560, 345], [520, 320], [470, 290], [440, 270], [400, 250], [370, 215], [345, 185], [320, 150], [300, 110], [285, 80], [260, 55], [200, 40], [130, 45], [70, 80], [40, 120], [55, 160], [80, 190]],
    [[370, 640], [460, 620], [470, 650], [440, 700], [380, 705], [350, 670]],
    [[40, 400], [80, 390], [85, 520], [50, 540], [30, 470]],
    [[60, 290], [80, 280], [85, 360], [65, 370]],
  ],
  pts: { Рим: [253, 322], Арпин: [330, 345], Капуя: [362, 384], Помпеи: [382, 405], Канны: [470, 355], Сентинум: [275, 200], Фрегеллы: [318, 352], Тарент: [507, 397], Брундизий: [601, 370], Остия: [240, 333], Неаполь: [372, 398] },
};
// Средиземноморье (по карте 5 издания), обобщённая береговая линия.
const MED: MapDef = {
  bg: "land",
  tf: T(1.0, 410, 85),
  land: [
    [[250, 60], [290, 50], [300, 150], [262, 192], [205, 185], [232, 120]],
    [[150, 100], [185, 95], [190, 150], [150, 160]],
  ],
  sea: [
    [[0, 0], [215, 0], [215, 190], [250, 230], [235, 300], [205, 350], [90, 370], [40, 385], [25, 560], [80, 580], [80, 700], [0, 700]],
    [[80, 580], [130, 560], [200, 540], [250, 490], [255, 440], [300, 410], [350, 398], [400, 390], [440, 380], [470, 420], [500, 455], [540, 490], [570, 520], [600, 560], [610, 590], [630, 560], [650, 530], [620, 500], [590, 470], [550, 430], [520, 390], [505, 345], [520, 330], [540, 360], [580, 400], [620, 440], [650, 480], [680, 500], [690, 520], [700, 560], [720, 600], [760, 610], [780, 580], [800, 560], [790, 520], [800, 470], [830, 440], [865, 432], [870, 452], [850, 480], [860, 520], [880, 560], [920, 580], [980, 580], [1030, 562], [1050, 585], [1052, 625], [1060, 660], [1050, 690], [1000, 692], [960, 690], [900, 680], [830, 700], [760, 712], [700, 692], [640, 662], [560, 620], [500, 600], [450, 585], [420, 600], [370, 612], [300, 620], [200, 622], [120, 612]],
    [[830, 300], [900, 280], [1000, 270], [1100, 290], [1120, 340], [1060, 380], [960, 390], [880, 400], [840, 360]],
  ],
  pts: {
    Рим: [497, 450], "Вал Адриана": [248, 58], Британия: [262, 140], Галлия: [300, 300], Испания: [110, 470], Карфаген: [450, 578], Египет: [960, 740], Александрия: [930, 690], Иудея: [1070, 620], Афины: [745, 522], Афродисиас: [885, 495], Вифиния: [920, 405], Дакия: [700, 285], Сирия: [1050, 520], Германия: [420, 160],
  },
};
// острова поверх моря (Средиземноморье)
const MED_ISLANDS: [number, number][][] = [
  [[560, 582], [622, 576], [604, 622], [552, 612]],
  [[455, 465], [476, 463], [478, 532], [455, 532]],
  [[462, 425], [473, 420], [475, 460], [462, 460]],
  [[760, 625], [830, 624], [832, 640], [760, 641]],
  [[960, 596], [1010, 590], [1002, 606], [960, 606]],
];
const MAPS: Record<string, MapDef> = { latium: LATIUM, italy: ITALY, med: MED };
const poly = (pts: [number, number][], tf: MapDef["tf"]) => pts.map(([x, y]) => tf(x, y).join(" ")).join(" ");

export const MapScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const fw = Math.min(1620, Ar.x1 - Ar.x0 - 20);
  const shift = Ar.cx - 960;
  const m0 = MAPS[S(p.map, "italy")];
  // карта рисуется в своих координатах (центр 960) и сдвигается в свободную часть кадра
  const m: MapDef = { ...m0, tf: (x, y) => { const [a, b] = m0.tf(x, y); return [a + shift, b]; } };
  const k = ramp(t, 0.1, 0.8);
  const pts = A<[string, number, string?]>(p.points);
  const links = A<[string, number, string?]>(p.links);
  const hub = S(p.hub, "Рим");
  const [hx, hy] = m.tf(...(m.pts[hub] ?? [0, 0]));
  const landCol = C.earthSoft;
  const seaCol = C.skySoft;
  return (
    <Drift t={t} dur={dur} cx={N(p.zx, Ar.cx)} cy={N(p.zy, 520)} amount={N(p.zoom, 0.05)}>
      <g opacity={k}>
        {/* рамка карты */}
        <rect x={Ar.cx - fw / 2} y={95} width={fw} height={800} rx={36} fill={m.bg === "land" ? landCol : seaCol} stroke={OL} strokeWidth={4} />
        <clipPath id={`clip-${S(p.map)}`}>
          <rect x={Ar.cx - fw / 2} y={95} width={fw} height={800} rx={36} />
        </clipPath>
        <g clipPath={`url(#clip-${S(p.map)})`}>
          {(m.sea ?? []).map((s, i) => (
            <polygon key={`s${i}`} points={poly(s, m.tf)} fill={seaCol} stroke={C.sky} strokeWidth={3} />
          ))}
          {m.land.map((l, i) => (
            <polygon key={`l${i}`} points={poly(l, m.tf)} fill={landCol} stroke={C.stoneDeep} strokeWidth={3} />
          ))}
          {S(p.map) === "med" && MED_ISLANDS.map((l, i) => <polygon key={`i${i}`} points={poly(l, m.tf)} fill={landCol} stroke={C.stoneDeep} strokeWidth={3} />)}
          {m.river && <polyline points={poly(m.river, m.tf)} fill="none" stroke={C.sky} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      </g>
      {/* связи от центра к точкам: тонкие стрелки, не границы владений */}
      {links.map(([name, b, col], i) => {
        const q = m.pts[name];
        if (!q) return null;
        const [x, y] = m.tf(...q);
        return <Arrow key={i} x1={hx} y1={hy} x2={x} y2={y} k={ramp(t, at(ctx, b), 1)} color={FG[col ?? "amber"] ?? C.amber} w={6} bend={0.12} />;
      })}
      {pts.map(([name, b, kind], i) => {
        const q = m.pts[name];
        if (!q) return null;
        const [x, y] = m.tf(...q);
        const kk = pop(t, at(ctx, b));
        if (kk <= 0.01) return null;
        const region = kind === "region";
        return (
          <g key={i} opacity={clamp01(kk * 1.4)}>
            {!region && <circle cx={x} cy={y} r={(name === hub ? 18 : 12) * kk} fill={name === hub ? C.coral : C.teal} stroke={OL} strokeWidth={4} />}
            <Txt x={x} y={region ? y : y - 26} size={region ? 34 : name === hub ? 36 : 28} color={region ? C.inkSoft : C.ink} weight={region ? 900 : 800}>
              {region ? name.toUpperCase() : name}
            </Txt>
          </g>
        );
      })}
      {/* подпись эпохи и честная пометка «схема» */}
      <Appear t={t} at={0.5} x={Ar.cx} y={140}>
        <Label x={0} y={0} text={S(p.era, "условная схема")} size={34} bg={C.white} />
      </Appear>
      <Appear t={t} at={0.9} x={Ar.cx + fw / 2 - 230} y={858}>
        <Label x={0} y={0} text="упрощённая схема, не точная граница" size={22} bg={C.cream} color={C.inkSoft} />
      </Appear>
    </Drift>
  );
};

// ───────────── Круги принадлежности ─────────────
// p.rings: [[подпись, beat, цвет]] от центра наружу; p.moves: [[из кольца, в кольцо, beat, n]]
// — точки-люди переходят внутрь; p.center — подпись центра.
export const Rings: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const rings = A<[string, number, string?]>(p.rings);
  const cy = 500;
  const R = (i: number) => 120 + i * 105;
  const moves = A<[number, number, number, number]>(p.moves);
  const dots: React.ReactNode[] = [];
  rings.forEach((_, ri) => {
    const n = 10 + ri * 8;
    for (let j = 0; j < n; j++) {
      const id = ri * 100 + j;
      const ang = (j / n) * Math.PI * 2 + ri * 0.4;
      let r = R(ri) - 52 + rnd(id, 1) * 30;
      let col = FG[rings[ri][2] ?? "teal"] ?? C.teal;
      for (const [from, to, b, cnt] of moves) {
        if (from !== ri || j >= cnt * (n / 10)) continue;
        const mk = ramp(t, at(ctx, b) + rnd(id, 2) * 0.8, 1.4);
        if (mk > 0) {
          r = r + (R(to) - 52 + rnd(id, 3) * 30 - r) * mk;
          if (mk > 0.6) col = FG[rings[to][2] ?? "teal"] ?? col;
        }
      }
      const kk = ramp(t, at(ctx, rings[ri][1]) + 0.2 + rnd(id, 4) * 0.5, 0.5);
      if (kk <= 0) continue;
      dots.push(<circle key={id} cx={Ar.cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r * 0.78} r={9} fill={col} stroke={OL} strokeWidth={2} opacity={kk} />);
    }
  });
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {[...rings].reverse().map(([, b, col], rr) => {
        const i = rings.length - 1 - rr;
        const kk = ramp(t, at(ctx, b), 0.7);
        if (kk <= 0) return null;
        const c = FG[col ?? "teal"] ?? C.teal;
        return (
          <g key={i} opacity={kk}>
            <ellipse cx={Ar.cx} cy={cy} rx={R(i) * (0.9 + 0.1 * kk)} ry={R(i) * 0.78 * (0.9 + 0.1 * kk)} fill={BG[col ?? "teal"] ?? C.tealSoft} stroke={c} strokeWidth={5} opacity={0.9} />
          </g>
        );
      })}
      {dots}
      {rings.map(([label, b, col], i) => (
        <Appear key={i} t={t} at={at(ctx, b) + 0.3} x={i === 0 ? Ar.cx : fitX(Ar.cx + (i % 2 ? 1 : -1) * (R(i) - 30), label, 28, Ar.x0, Ar.x1)} y={i === 0 ? cy : cy - R(i) * 0.55 + (i % 2 ? 0 : 40)}>
          <Label x={0} y={0} text={label} size={i === 0 ? 32 : 28} bg={i === 0 ? C.yellow : BG[col ?? "white"] ?? C.white} />
        </Appear>
      ))}
      {S(p.note) && (
        <Appear t={t} at={at(ctx, N(p.noteBeat, 1))} x={Ar.cx} y={110}>
          <Label x={0} y={0} text={S(p.note)} size={30} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── Таблица «кто что может» ─────────────
// p.cols: заголовки; p.rows: [[группа, beat, [метки ячеек: ok|no|part|q|""]]]
export const Matrix: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cols = A(p.cols);
  const rows = A<[string, number, string[]]>(p.rows);
  const w = Math.min(1500, Ar.x1 - Ar.x0 - 40);
  const firstW = 420;
  const cw = (w - firstW) / Math.max(1, cols.length);
  const x0 = Ar.cx - w / 2;
  const y0 = 250;
  const rh = Math.min(108, 560 / Math.max(1, rows.length));
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.02}>
      <Appear t={t} at={0.15} x={0} y={0}>
        <Panel x={x0 - 20} y={y0 - 90} w={w + 40} h={rows.length * rh + 130} fill={C.white} r={30} />
        {cols.map((c, i) => (
          <Txt key={i} x={x0 + firstW + cw * (i + 0.5)} y={y0 - (wrap(c, 14).includes("\n") ? 36 : 4)} size={27} color={C.inkSoft} weight={900}>
            {wrap(c, 14)}
          </Txt>
        ))}
      </Appear>
      {rows.map(([label, b, cells], ri) => {
        const a = at(ctx, b);
        const y = y0 + 40 + ri * rh + rh / 2;
        return (
          <Appear key={ri} t={t} at={a} x={0} y={0} dy={14}>
            <rect x={x0} y={y - rh / 2 + 6} width={w} height={rh - 12} rx={18} fill={ri % 2 ? C.cream : C.paper} />
            <Txt x={x0 + 24} y={y + 11} size={32} anchor="start" weight={900}>
              {label}
            </Txt>
            {cells.map((m, ci) => {
              const cx = x0 + firstW + cw * (ci + 0.5);
              const kk = ramp(t, a + 0.35 + ci * 0.25, 0.4);
              if (m === "ok") return <Check key={ci} x={cx} y={y} s={34} k={kk} />;
              if (m === "no") return <Cross key={ci} x={cx} y={y} s={44} k={kk} />;
              if (m === "part")
                return (
                  <g key={ci} opacity={kk}>
                    <circle cx={cx} cy={y} r={24} fill="none" stroke={C.amber} strokeWidth={7} />
                    <path d={`M ${cx} ${y - 24} A 24 24 0 0 1 ${cx} ${y + 24} Z`} fill={C.amber} />
                  </g>
                );
              if (m === "q")
                return (
                  <text key={ci} x={cx} y={y + 16} fontFamily={HEAVY} fontWeight={900} fontSize={48} fill={C.plum} textAnchor="middle" opacity={kk}>
                    ?
                  </text>
                );
              return null;
            })}
          </Appear>
        );
      })}
      {S(p.title) && (
        <Appear t={t} at={0.1} x={Ar.cx} y={118}>
          <Label x={0} y={0} text={S(p.title)} size={34} bg={C.yellow} />
        </Appear>
      )}
      {S(p.legend) && (
        <Appear t={t} at={0.8} x={Ar.cx} y={y0 + 40 + rows.length * rh + 60}>
          <Label x={0} y={0} text={S(p.legend)} size={24} bg={C.cream} color={C.inkSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── Слова власти: вывеска остаётся, устройство под ней меняется ─────────────
// p.words — старые слова сверху; p.blocks: [[подпись, beat, вес 0…1, цвет]] — колонны
// (сенат, собрания, магистраты, один правитель); вес меняется по p.shift: [[номер, beat, новый вес]].
export const Power: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const words = A(p.words);
  const blocks = A<[string, number, number, string]>(p.blocks);
  const shifts = A<[number, number, number]>(p.shift);
  const w = Math.min(1300, Ar.x1 - Ar.x0 - 80);
  const x0 = Ar.cx - w / 2;
  const baseY = 830;
  const bw = w / Math.max(1, blocks.length);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {/* фронтон со старыми словами */}
      <Appear t={t} at={0.15} x={0} y={0}>
        <polygon points={`${x0 - 30},300 ${Ar.cx},170 ${x0 + w + 30},300`} fill={C.stone} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <rect x={x0 - 30} y={300} width={w + 60} height={46} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
        <Txt x={Ar.cx} y={278} size={40} weight={900} color={C.ink}>
          {words.join(" · ")}
        </Txt>
      </Appear>
      <rect x={x0 - 30} y={baseY} width={w + 60} height={30} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
      {blocks.map(([label, b, weight, col], i) => {
        let wgt = weight;
        for (const [n, sb, nw] of shifts) if (n === i) wgt = wgt + (nw - wgt) * ramp(t, at(ctx, sb), 1.4);
        const kk = ramp(t, at(ctx, b), 0.7);
        const h = (baseY - 360) * clamp01(wgt) * kk;
        const cx = x0 + bw * (i + 0.5);
        const c = FG[col] ?? C.teal;
        return (
          <g key={i}>
            {h > 2 && <rect x={cx - bw * 0.28} y={baseY - h} width={bw * 0.56} height={h} rx={14} fill={c} stroke={OL} strokeWidth={4} />}
            {kk > 0 && (
              <Txt x={cx} y={baseY + 76} size={30} weight={900} opacity={kk}>
                {label}
              </Txt>
            )}
          </g>
        );
      })}
      {S(p.note) && (
        <Appear t={t} at={at(ctx, N(p.noteBeat, 1))} x={Ar.cx} y={130}>
          <Label x={0} y={0} text={S(p.note)} size={32} bg={C.amberSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ───────────── Речь на форуме: обвинение, проверенное и спорное ─────────────
// p.speaker — подпись оратора; p.bubbles: [[текст, beat, сторона left|right, цвет]].
export const Speech: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx;
  const crowd = N(p.crowd, 7);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.03}>
      {/* трибуна */}
      <Appear t={t} at={0.1} x={cx} y={0} dy={20}>
        <rect x={-190} y={560} width={380} height={160} rx={16} fill={C.stone} stroke={OL} strokeWidth={5} />
        <rect x={-220} y={540} width={440} height={34} rx={10} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
      </Appear>
      <Figure x={cx} y={560} s={0.62} color={C.cream} arm={-60 + wob(t, 1, 8)} k={ramp(t, 0.3, 0.6)} tag={S(p.speaker) || undefined} tagColor={C.white} />
      {Array.from({ length: crowd }).map((_, i) => (
        <Figure key={i} x={cx - 640 + i * (1280 / Math.max(1, crowd - 1))} y={960} s={0.32} color={[C.teal, C.amber, C.sage, C.coral, C.plum, C.sky][i % 6]} k={ramp(t, 0.6 + i * 0.1, 0.5)} bob={wob(t, i, 2)} />
      ))}
      {A<[string, number, string, string?]>(p.bubbles).map(([text, b, side, col], i) => {
        const kk = pop(t, at(ctx, b));
        if (kk <= 0.01) return null;
        const x0 = side === "left" ? cx - 420 : side === "right" ? cx + 420 : cx;
        const x = fitX(x0, text, 34, Ar.x0, Ar.x1);
        const y = side === "center" ? 130 : 330;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${kk})`}>
            <Label x={0} y={0} text={text} size={34} bg={BG[col ?? "white"] ?? C.white} />
          </g>
        );
      })}
    </Drift>
  );
};

// ───────────── Письма: наместник ↔ император ─────────────
// p.left / p.right — подписи сторон; p.letters: [[текст, beat, направление ">"|"<"]].
export const Letters: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const L = Ar.x0 + 220;
  const R = Ar.x1 - 220;
  const letters = A<[string, number, string]>(p.letters);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.025}>
      {[
        { x: L, label: S(p.left, "наместник"), col: C.teal },
        { x: R, label: S(p.right, "император"), col: C.amber },
      ].map((s, i) => (
        <Appear key={i} t={t} at={0.2 + i * 0.4} x={s.x} y={720}>
          <rect x={-190} y={0} width={380} height={34} rx={10} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
          <Figure x={0} y={0} s={0.85} color={s.col} />
          <Label x={0} y={100} text={s.label} size={34} bg={C.white} />
        </Appear>
      ))}
      {letters.map(([text, b, dir], i) => {
        const a = at(ctx, b);
        const fly = ramp(t, a, 1.3);
        if (fly <= 0) return null;
        const from = dir === "<" ? R : L;
        const to = dir === "<" ? L : R;
        const x = from + (to - from) * fly;
        const y = 380 - Math.sin(fly * Math.PI) * 140;
        const land = fly >= 1;
        const yy = land ? 190 + i * 120 : y;
        const xx = land ? Ar.cx : x;
        return (
          <g key={i} transform={`translate(${xx} ${yy})`}>
            {!land && <rect x={-50} y={-34} width={100} height={68} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />}
            {!land && <path d="M -50 -34 L 0 6 L 50 -34" fill="none" stroke={OL} strokeWidth={4} />}
            {land && <Label x={0} y={0} text={`${dir === "<" ? "ответ: " : "вопрос: "}${text}`} size={36} bg={dir === "<" ? C.amberSoft : C.tealSoft} />}
          </g>
        );
      })}
    </Drift>
  );
};

// ───────────── Жизнь вне элиты: карточки свидетельств и «белые пятна» ─────────────
// p.cards: [[подпись, beat, образ точек, цвет]]; p.unknown: [[подпись, beat]] — пустые рамки.
export const Lives: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cards = A<[string, number, string, string?]>(p.cards);
  const unk = A<[string, number]>(p.unknown);
  const all = cards.length + unk.length;
  const w = Math.min(1600, Ar.x1 - Ar.x0 - 40);
  const cw = w / Math.max(1, all);
  const x0 = Ar.cx - w / 2;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {cards.map(([label, b, shape, col], i) => {
        const a = at(ctx, b);
        const cx = x0 + cw * (i + 0.5);
        return (
          <g key={i}>
            <Appear t={t} at={a} x={cx} y={500}>
              <rect x={-cw / 2 + 14} y={-260} width={cw - 28} height={460} rx={28} fill={BG[col ?? "white"] ?? C.white} stroke={OL} strokeWidth={4} />
            </Appear>
            <Particles shape={shape} t={t} at={a + 0.2} dur={1.4} x={cx} y={430} s={Math.min(0.4, (cw - 70) / 600)} r={7} step={17} spread={300} />
            <Appear t={t} at={a + 0.9} x={cx} y={622}>
              <Txt x={0} y={0} size={cw > 380 ? 32 : 28} weight={900}>
                {wrap(label, cw > 380 ? 22 : 15)}
              </Txt>
            </Appear>
          </g>
        );
      })}
      {unk.map(([label, b], j) => {
        const i = cards.length + j;
        const cx = x0 + cw * (i + 0.5);
        return (
          <Appear key={`u${j}`} t={t} at={at(ctx, b)} x={cx} y={500}>
            <rect x={-cw / 2 + 14} y={-260} width={cw - 28} height={460} rx={28} fill="none" stroke={C.inkSoft} strokeWidth={5} strokeDasharray="18 14" />
            <text y={-40} fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={C.plum} textAnchor="middle" opacity={0.75}>
              ?
            </text>
            <Txt x={0} y={130} size={cw > 380 ? 30 : 28} weight={900} color={C.inkSoft}>
              {wrap(label, cw > 380 ? 22 : 15)}
            </Txt>
          </Appear>
        );
      })}
      {S(p.title) && (
        <Appear t={t} at={0.15} x={Ar.cx} y={150}>
          <Label x={0} y={0} text={S(p.title)} size={38} bg={C.white} />
        </Appear>
      )}
    </Drift>
  );
};

export { FONT };
