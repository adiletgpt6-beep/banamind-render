// BG-033 · Реквизит и графика (art/props.tsx)
// ===========================================================================
// Все компоненты рисуются в кадре 1080×1920 АБСОЛЮТНО (px кадра), без
// случайностей: движение задаётся только числами (props) и номером кадра f.
// Стиль: плоская заливка, мягкий контур C.ink (≈ 4 px, opacity 0.85),
// скруглённые соединения, одна тень-тон. Тексты — только из BG33_TEXT.
//
// ─── Сквозной предмет ──────────────────────────────────────────────────────
// <PaperCard x y w rot f note question square freeTag freeTagText choices
//            wallet noDuty squareDetach shadow />
//   Бумажная карточка мамы. По умолчанию x/y/w/rot = layout.CARD (крупный
//   план, стык сцен), высота = w * CARD_ASPECT. Поворот — вокруг центра.
//   Все «прогрессы» — числа 0…1 (0 — нет, 1 — полностью):
//   • note: { show, strike } — рукописное «Төлөйүнбү?» проявляется слева
//     направо (show) и зачёркивается одной линией (strike). Без note — нет.
//   • question: 0…1 — крупный рукописный вопрос «АЛГАЧ СЫНАП КӨРСӨ БОЛОБУ?»
//     (2 строки) проявляется слева направо, строка за строкой.
//   • square: { draw, sand?, glow? } — жёлтый квадрат. draw — прорисовка по
//     часовой от левого нижнего угла: левая сторона вверх (0…0.25), верх
//     вправо (…0.5), правая вниз (…0.75), низ влево (…1 — замкнут). sand —
//     песочные часы внутри (0 — весь песок сверху, 1 — весь внизу; струйка
//     сыплется по f). glow — мягкое свечение. По умолчанию { draw: 1 }.
//   • freeTag: 0…1 — маленький рукописный ярлык у квадрата с жёлтым
//     маркером; текст freeTagText (по умолчанию BG33_TEXT.rule.free
//     «акысыз»; длинный текст автоматически мельче).
//   • choices: 0…1 — два РАВНЫХ пустых квадрата «Улантам» / «Улантпайм»
//     рисуются от руки (0…0.5 — левый с подписью, 0.5…1 — правый).
//   • wallet: 0…1 — полупрозрачная иконка кошелька только у «Улантам».
//   • noDuty: 0…1 — мелко «милдет жок» только у «Улантпайм».
//   • squareDetach: 0…1 — квадрат на карточке гаснет, остаётся бледный след.
//     Для «отрыва» ставьте 1 в тот же кадр, когда сцена рисует свой
//     <SketchSquare {...cardSquareRect(card)} /> и уводит его.
//   • shadow: 0…1 (по умолчанию 1) — тень бумаги на столе.
//   Галочка не рисуется НИКОГДА.
//   Пример: <PaperCard f={f} note={{ show: 1, strike: 0 }} question={0}
//            square={{ draw: 1 }} />
//
// cardSquareRect(card?) → { x, y, size, cx, cy, rot } — квадрат карточки в
//   px кадра (для «нырка» камеры и отрыва). card = { x, y, w, rot }.
// cardPoint(card, name) → { x, y } — центр элемента карточки в px кадра;
//   name: "square" | "note" | "tag" | "question" | "yes" | "no" | "wallet"
//   | "noDuty" (например, куда навести кончик ручки).
// cardLocalToFrame(card, u, v) — точка в единицах карточки (ширина 880) → кадр.
//
// <SketchSquare x y size stroke? draw? sand? glow? f? opacity? />
//   Тот же рукописный квадрат отдельно (рамка FRAME_SQ, отрыв в финале).
//   Форма масштабируется пропорционально — совпадает с квадратом карточки.
// sketchSquareTip(x, y, size, draw) → { x, y } — где сейчас «перо» контура.
//
// ─── Руки и предметы ───────────────────────────────────────────────────────
// <Hand x y s rot side hold f open? thumb? lift? tremor? shadow?>{children}</Hand>
//   Макро-рука мамы (кожа C.skin, манжета голубого кардигана). s — масштаб
//   (1 ≈ ладонь 140 px), rot — градусы, side — "left" | "right" (левая —
//   зеркальная). Точка (x, y) зависит от hold:
//   • "pen"    — (x, y) = кончик ручки; ручка в щепоти, тянется вниз-вправо
//                (для левой — вниз-влево). tremor — дрожание кончика, px.
//   • "wallet" — (x, y) = середина края кошелька, за который держат
//                (левая рука держит левый край, кошелёк справа от руки).
//                open 0…1 — кошелёк закрыт/открыт (по умолчанию 1).
//                Половинка кошелька 180×136·s; открытый — 360×136·s.
//   • "phone"  — вид из-за плеча; (x, y) = правый нижний угол телефона для
//                side="right" (левый нижний для "left"); телефон 300×610·s.
//                Телефон передайте children — он ляжет между ладонью и
//                большим пальцем. thumb 0…1 — большой палец тянется вверх
//                (прокрутка). Подбор: handOnPhone(PHONE, "right").
//   • "none"   — расслабленная ладонь сверху; (x, y) = центр тыльной стороны.
//   lift 0…1 — рука приподнята (крупнее, тень дальше). shadow — тень на стол
//   (по умолчанию да, кроме "phone"). children рисуются между ладонью и
//   передними пальцами (для "phone" — сам телефон).
//   Пример: <Hand x={520} y={760} s={1.6} rot={-8} side="right" hold="pen"
//            f={f} tremor={1.2} />
//
// <Wallet x y s open rot /> — кожаный кошелёк (без денег, карт и цифр).
//   (x, y) = центр основной половинки (закрытый кошелёк центрирован тут),
//   открывается вправо. 180×136·s в закрытом виде.
// <Pen x y s rot f tremor? /> — тёмно-синяя ручка; (x, y) = кончик,
//   rot = 0 → ручка лежит вправо от кончика. Длина 250·s.
// <Phone x y w h rot? glow? >{экран}</Phone> — смартфон, светлый экран.
//   Содержимое экрана — children в области phoneScreen(w, h) (px от левого
//   верхнего угла корпуса). glow 0…1 — свечение экрана.
// <BalagoInfoCard w h scroll? underline? /> — нейтральная карточка BalaGo на
//   экране: логотип, BG33_TEXT.rule.siteTitle, абзац siteText дословно;
//   underline 0…1 — жёлтый маркер под «ар дайым акысыз»; scroll — px вверх.
//   Пример (телефон в руке, стык hook → rule):
//     const sc = phoneScreen(PHONE.w, PHONE.h);
//     <Hand {...handOnPhone(PHONE)} f={f} thumb={th}>
//       <Phone {...PHONE} glow={0.5}>
//         <BalagoInfoCard w={sc.w} h={sc.h} underline={u} scroll={px} />
//       </Phone>
//     </Hand>
//
// ─── Надписи и значки ──────────────────────────────────────────────────────
// <ExampleBadge x y opacity scale? /> — плашка «Шарттуу мисал», (x, y) = левый
//   верхний угол, высота ≈ 64 px.
// <Headline text x y w size sub? appear align? /> — крупная надпись сцены на
//   мягкой светлой подложке; (x, y) = левый верхний угол блока ширины w.
// <Chip text x y size tone appear align? icon? /> — плашка; tone: "yellow" |
//   "white" | "navy"; align — к какой стороне привязан x ("left" по умолч.).
// <YellowArrow from to bend? grow width? opacity? /> — жёлтая рукописная
//   стрелка растёт по пути (grow 0…1), bend — изгиб в px (+ влево от пути).
// <LinkIcon x y size /> <WhatsAppIcon x y size /> <Logo x y size /> —
//   значки; (x, y) = левый верхний угол, size — сторона квадрата.
// <SchoolBellIcon x y size ring? f? /> <SunIcon x y size f? />
// <ClockChip text x y size? appear? align? /> — плашка со стрелочными часами
//   (стрелки ставятся по тексту «07:30»).
//
// ─── Камера ────────────────────────────────────────────────────────────────
// <Camera zoom x y to? rot?>{слои кадра}</Camera>
//   Точка мира (x, y) (px кадра) показывается в точке экрана to (по
//   умолчанию центр 540,960) с увеличением zoom. zoom=1, x=540, y=960 —
//   кадр без изменений. Нырок в квадрат карточки:
//     const sq = cardSquareRect();
//     const cam = cameraBetween(CAM_IDENTITY,
//       { zoom: FRAME_SQ.size / sq.size, x: sq.cx, y: sq.cy, rot: -sq.rot,
//         to: { x: 540, y: FRAME_SQ.y + FRAME_SQ.size / 2 } }, t);
//     (при t = 1 квадрат карточки точно ложится в FRAME_SQ; толщину его
//     контура утончайте через square.stroke, затем подменяйте SketchSquare)
//     <Camera {...cam}>…</Camera>
// cameraBetween(a, b, t) — плавный переход камеры (масштаб — геометрически,
//   цель b скользит по экрану прямо в своё место). camToScreen(cam, p).
//
// Листы для проверки: PropsSheet (всё), CardSheet, HandSheet.
// ===========================================================================
import React, { useId } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { breathe, clamp, easeInOut, easeOut, hash01, lerp, span } from "../anim";
import { CARD, CARD_ASPECT } from "../layout";
import { C } from "../palette";
import { BG33_TEXT, BG33_VIDEO } from "../script";

// ---------------------------------------------------------------------------
// Общие помощники
// ---------------------------------------------------------------------------
type Pt = { readonly x: number; readonly y: number };
type XY = readonly [number, number];

const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (p: XY) => `${r2(p[0])} ${r2(p[1])}`;
const DEG = Math.PI / 180;

// Контур в стиле ролика.
const ol = (w: number) =>
  ({
    stroke: C.ink,
    strokeOpacity: 0.85,
    strokeWidth: w,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  }) as const;

// Уникальный id для clipPath (несколько экземпляров в одном кадре).
const useSvgId = (p: string) => `${p}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

// Замкнутая гладкая форма через точки (Catmull-Rom → Безье).
const blob = (pts: readonly XY[], k = 1) => {
  const n = pts.length;
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: XY = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: XY = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return `${d} Z`;
};

// «Сосиска» от (x1,y1) до (x2,y2) с радиусами r1 → r2 (палец, рукав).
const capsule = (x1: number, y1: number, x2: number, y2: number, ra: number, rb: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const a: XY = [x1 + nx * ra, y1 + ny * ra];
  const b: XY = [x2 + nx * rb, y2 + ny * rb];
  const c: XY = [x2 - nx * rb, y2 - ny * rb];
  const e: XY = [x1 - nx * ra, y1 - ny * ra];
  return `M${pt(a)} L${pt(b)} A${r2(rb)} ${r2(rb)} 0 0 0 ${pt(c)} L${pt(e)} A${r2(ra)} ${r2(ra)} 0 0 0 ${pt(a)} Z`;
};

// Ширина строки Nunito (advance-ширины глифов при weight 800, в 1/1000 em;
// измерены по public/fonts/Nunito-Variable.ttf) — для проявления текста и
// подложек без измерения DOM.
const GLYPHS =
  "0123456789абвгдеёжзийклмнопрстуфхцчшщъыьэюяүөңАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯҮӨҢabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,:;!?'-—–→•()";
const ADV = [
  600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 573, 604, 581, 470, 633, 564, 564, 852, 533, 616, 616,
  579, 610, 700, 620, 604, 617, 626, 494, 490, 549, 864, 575, 638, 587, 851, 884, 645, 803, 563, 523, 844,
  574, 540, 604, 653, 753, 681, 695, 569, 811, 605, 605, 1041, 632, 753, 753, 695, 758, 876, 780, 796, 772,
  664, 684, 632, 671, 908, 685, 824, 708, 1080, 1131, 816, 928, 681, 684, 1067, 699, 631, 797, 828, 557,
  610, 478, 610, 549, 382, 615, 595, 268, 273, 558, 333, 889, 595, 589, 610, 610, 412, 492, 404, 590, 534,
  861, 559, 533, 480, 753, 695, 684, 774, 605, 570, 742, 780, 297, 372, 688, 573, 876, 753, 796, 664, 796,
  696, 641, 632, 743, 727, 1120, 685, 631, 615, 279, 260, 260, 260, 260, 260, 468, 256, 440, 1000, 500,
  1000, 524, 382, 382,
];
const ADV_MAP = new Map(Array.from(GLYPHS).map((ch, i) => [ch, ADV[i]] as const));
const estW = (text: string, size: number, weight = 800) => {
  let w = 0;
  for (const ch of Array.from(text)) w += ADV_MAP.get(ch) ?? 600;
  return (w / 1000) * size * (weight >= 900 ? 1.014 : 1);
};

// Весь кадр как SVG (для компонентов-векторов).
const FrameSvg: React.FC<{
  readonly children: React.ReactNode;
  readonly opacity?: number;
}> = ({ children, opacity = 1 }) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      overflow: "visible",
      opacity,
      pointerEvents: "none",
    }}
  >
    {children}
  </svg>
);

// ---------------------------------------------------------------------------
// Почерк мамы: Nunito жирный, лёгкий наклон и неровность по буквам.
// ---------------------------------------------------------------------------
const HandText: React.FC<{
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly color?: string;
  readonly seed?: number;
  readonly weight?: number;
  readonly slant?: number;
}> = ({ text, x, y, size, color = C.navy, seed = 1, weight = 800, slant = -7 }) => {
  const chars = Array.from(text);
  const rot = chars.map((_, i) => r2((hash01(seed * 31 + i * 7) - 0.5) * 6)).join(" ");
  let prev = 0;
  const dy = chars
    .map((_, i) => {
      const v = (hash01(seed * 17 + i * 3) - 0.5) * size * 0.07;
      const d = v - prev;
      prev = v;
      return r2(d);
    })
    .join(" ");
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) skewX(${slant})`}>
      <text
        x={0}
        y={0}
        rotate={rot}
        dy={dy}
        fontFamily={fontFamily}
        fontWeight={weight}
        fontSize={size}
        fill={color}
        style={{ fontKerning: "normal" }}
      >
        {text}
      </text>
    </g>
  );
};

// Проявление рукописного текста слева направо (x — левый край или центр).
const HandWrite: React.FC<{
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly reveal?: number;
  readonly seed?: number;
  readonly color?: string;
  readonly anchor?: "start" | "middle";
  readonly weight?: number;
}> = ({ text, x, y, size, reveal = 1, seed = 1, color, anchor = "start", weight }) => {
  const id = useSvgId("hw");
  const w = estW(text, size, weight);
  const x0 = anchor === "middle" ? x - w / 2 : x;
  const r = clamp(reveal);
  if (r <= 0.001) return null;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect
            x={x0 - size * 0.4}
            y={y - size * 1.25}
            width={size * 0.4 + (w * 1.05 + size * 0.6) * r}
            height={size * 1.75}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <HandText text={text} x={x0} y={y} size={size} seed={seed} color={color} weight={weight} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// Рукописный жёлтый квадрат (сквозной мотив).
// Форма задана в долях стороны 0…1; 4 стороны = 4 кривые почти равной длины,
// поэтому доля draw ≈ доля периметра. Старт — левый нижний угол.
// ---------------------------------------------------------------------------
type Seg = readonly [XY, XY, XY, XY];
const SQ_SEGS: readonly Seg[] = [
  // левая сторона вверх
  [[0.012, 0.99], [0.0, 0.66], [-0.008, 0.34], [0.006, 0.012]],
  // верх вправо
  [[0.006, 0.012], [0.34, -0.006], [0.66, 0.008], [0.99, 0.002]],
  // правая вниз
  [[0.99, 0.002], [1.008, 0.34], [0.996, 0.67], [1.002, 0.99]],
  // низ влево (лёгкий нахлёст в конце — рука замыкает квадрат)
  [[1.002, 0.99], [0.67, 1.008], [0.33, 0.996], [-0.02, 1.004]],
];

const bez = (s: Seg, u: number): XY => {
  const v = 1 - u;
  const a = v * v * v;
  const b = 3 * v * v * u;
  const c = 3 * v * u * u;
  const d = u * u * u;
  return [
    a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0],
    a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1],
  ];
};

const sqPath = (x: number, y: number, size: number) => {
  const m = (p: XY): XY => [x + p[0] * size, y + p[1] * size];
  let d = `M${pt(m(SQ_SEGS[0][0]))}`;
  for (const s of SQ_SEGS) d += ` C${pt(m(s[1]))} ${pt(m(s[2]))} ${pt(m(s[3]))}`;
  return d;
};

export const sketchSquareTip = (x: number, y: number, size: number, draw: number): Pt => {
  const t = clamp(draw) * 4;
  const i = Math.min(3, Math.floor(t));
  const p = bez(SQ_SEGS[i], t - i);
  return { x: x + p[0] * size, y: y + p[1] * size };
};

const SAND = "#F6CF6E";
const SAND_SHADE = "#E8B443";

// Песочные часы внутри квадрата (доли стороны).
const sandShapes = (x: number, y: number, size: number, sand: number, f: number) => {
  const m = (px: number, py: number) => `${r2(x + px * size)} ${r2(y + py * size)}`;
  const s = clamp(sand);
  // полуширина колбы на высоте py
  const hw = (py: number) => 0.035 + 0.235 * Math.abs(py - 0.5) / 0.34;
  const lvl = lerp(0.25, 0.485, s); // поверхность верхнего песка
  const wl = hw(lvl) * 0.92;
  const top =
    s < 0.995
      ? `M${m(0.5 - wl, lvl)} Q${m(0.5, lvl + 0.05 * (1 - s))} ${m(0.5 + wl, lvl)} L${m(0.515, 0.49)} L${m(0.485, 0.49)} Z`
      : "";
  const h = lerp(0.025, 0.25, s); // высота горки внизу
  const ty = 0.83 - h;
  const wt = Math.max(0.03, hw(ty) * 0.55);
  const pile = `M${m(0.27, 0.83)} L${m(0.5 - wt, ty + 0.03)} Q${m(0.5, ty - 0.02)} ${m(0.5 + wt, ty + 0.03)} L${m(0.73, 0.83)} Z`;
  const glass = `M${m(0.26, 0.16)} L${m(0.74, 0.16)} C${m(0.74, 0.36)} ${m(0.53, 0.44)} ${m(0.52, 0.5)} C${m(0.53, 0.56)} ${m(0.74, 0.64)} ${m(0.74, 0.84)} L${m(0.26, 0.84)} C${m(0.26, 0.64)} ${m(0.47, 0.56)} ${m(0.48, 0.5)} C${m(0.47, 0.44)} ${m(0.26, 0.36)} ${m(0.26, 0.16)} Z`;
  const flowing = s > 0.001 && s < 0.995;
  const grains = [];
  if (flowing) {
    for (let k = 0; k < 6; k++) {
      const u = (f * 0.045 + k / 6) % 1;
      const gy = lerp(0.5, ty, u);
      grains.push(
        <circle
          key={k}
          cx={x + (0.5 + (hash01(k + Math.floor(f * 0.045 + k / 6) * 7) - 0.5) * 0.012) * size}
          cy={y + gy * size}
          r={size * 0.011}
          fill={SAND_SHADE}
        />,
      );
    }
  }
  return (
    <g>
      <path d={glass} fill="#FFFFFF" fillOpacity={0.55} stroke={C.yellowDeep} strokeOpacity={0.55} strokeWidth={size * 0.014} strokeLinejoin="round" />
      <path d={`M${m(0.22, 0.16)} L${m(0.78, 0.16)}`} stroke={C.yellowDeep} strokeOpacity={0.7} strokeWidth={size * 0.03} strokeLinecap="round" />
      <path d={`M${m(0.22, 0.84)} L${m(0.78, 0.84)}`} stroke={C.yellowDeep} strokeOpacity={0.7} strokeWidth={size * 0.03} strokeLinecap="round" />
      {top ? <path d={top} fill={SAND} /> : null}
      <path d={pile} fill={SAND} />
      <path d={`M${m(0.36, 0.83)} Q${m(0.5, ty + 0.06)} ${m(0.64, 0.83)}`} fill="none" stroke={SAND_SHADE} strokeWidth={size * 0.012} strokeOpacity={0.6} />
      {flowing ? (
        <path d={`M${m(0.5, 0.49)} L${m(0.5, ty + 0.02)}`} stroke={SAND_SHADE} strokeWidth={size * 0.01} strokeLinecap="round" />
      ) : null}
      {grains}
    </g>
  );
};

// Квадрат как набор SVG-элементов (в любых координатах).
const sketchSquareShapes = (o: {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly stroke: number;
  readonly draw: number;
  readonly sand?: number;
  readonly glow?: number;
  readonly f?: number;
  readonly opacity?: number;
}) => {
  const { x, y, size, stroke } = o;
  const draw = clamp(o.draw);
  const glow = clamp(o.glow ?? 0);
  const d = sqPath(x, y, size);
  const dash = { pathLength: 1, strokeDasharray: `${r2(draw * 1.002)} 3` };
  return (
    <g opacity={o.opacity ?? 1}>
      {glow > 0 ? (
        <>
          <rect x={x} y={y} width={size} height={size} fill={C.yellowSoft} opacity={glow * 0.6} />
          <path d={d} fill="none" stroke={C.yellow} strokeWidth={stroke * 3.2} strokeLinecap="round" strokeLinejoin="round" opacity={glow * 0.55} style={{ filter: `blur(${r2(stroke * 1.4)}px)` }} {...dash} />
        </>
      ) : null}
      {o.sand !== undefined && o.sand >= 0 ? sandShapes(x, y, size, o.sand, o.f ?? 0) : null}
      {draw > 0.002 ? (
        <>
          <path d={d} fill="none" stroke={C.yellowDeep} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...dash} />
          <path d={d} fill="none" stroke={C.yellow} strokeWidth={stroke * 0.62} strokeLinecap="round" strokeLinejoin="round" {...dash} />
        </>
      ) : null}
    </g>
  );
};

export const SketchSquare: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly stroke?: number;
  readonly draw?: number;
  readonly sand?: number;
  readonly glow?: number;
  readonly f?: number;
  readonly opacity?: number;
}> = ({ x, y, size, stroke = 16, draw = 1, sand, glow, f, opacity }) => (
  <FrameSvg>{sketchSquareShapes({ x, y, size, stroke, draw, sand, glow, f, opacity })}</FrameSvg>
);

// ---------------------------------------------------------------------------
// Кошелёк (локальные координаты: центр основной половинки 0,0; 180×136)
// ---------------------------------------------------------------------------
const WAL = { w: 180, h: 136 } as const;
const LEATHER = "#C27B4B";
const LEATHER_SHADE = "#A1603A";
const LEATHER_IN = "#DDA477";
const LEATHER_POCKET = "#C9875A";
const STITCH = "#F6DDBA";

const walletShapes = (open: number, sw: number, silhouette = false) => {
  const W = WAL.w;
  const H = WAL.h;
  const o = clamp(open);
  const a = (1 - o) * Math.PI; // 0 — раскрыт, π — закрыт
  const cos = Math.cos(a);
  const sx = 90; // корешок
  const lift = Math.sin(a); // створка ближе к камере
  const hh = (H / 2) * (1 + 0.06 * lift);
  const fw = W * cos; // проекция створки
  const x0 = -W / 2;
  if (silhouette) {
    const left = Math.min(x0, sx + Math.min(0, fw));
    const right = Math.max(sx, sx + fw);
    return <rect x={left} y={-hh} width={right - left} height={hh * 2 + 8} rx={14} />;
  }
  const flapRect = (xa: number, xb: number) => `M${r2(xa)} ${r2(-hh)} L${r2(xb)} ${r2(-hh)} L${r2(xb)} ${r2(hh)} L${r2(xa)} ${r2(hh)} Z`;
  const showInside = cos > 0.02;
  const showOutside = cos < -0.02;
  return (
    <g>
      {/* толщина снизу */}
      <rect x={x0} y={-H / 2 + 8} width={W} height={H} rx={14} fill={LEATHER_SHADE} {...ol(sw)} />
      {/* внутренняя сторона основной половинки */}
      <rect x={x0} y={-H / 2} width={W} height={H} rx={14} fill={LEATHER_IN} {...ol(sw)} />
      <rect x={x0 + 14} y={-4} width={W - 28} height={H / 2 - 14} rx={8} fill={LEATHER_POCKET} />
      <path d={`M${x0 + 14} -4 Q${x0 + W / 2} 8 ${x0 + W - 14} -4`} fill="none" stroke={LEATHER_SHADE} strokeWidth={sw * 0.7} strokeLinecap="round" />
      <rect x={x0 + 9} y={-H / 2 + 9} width={W - 18} height={H - 18} rx={9} fill="none" stroke={STITCH} strokeWidth={sw * 0.55} strokeDasharray={`${sw * 2} ${sw * 1.6}`} />
      {showInside ? (
        <g>
          <path d={flapRect(sx, sx + fw)} fill={LEATHER_SHADE} transform="translate(0 8)" />
          <path d={flapRect(sx, sx + fw)} fill={LEATHER_IN} {...ol(sw)} />
          {/* кармашки для карт — пустые, без надписей и цифр */}
          {[0, 1, 2].map((i) => {
            const yy = -hh * 0.62 + i * hh * 0.42;
            return (
              <g key={i}>
                <path d={`M${r2(sx + fw * 0.1)} ${r2(yy)} L${r2(sx + fw * 0.9)} ${r2(yy)} L${r2(sx + fw * 0.9)} ${r2(yy + hh * 0.5)} L${r2(sx + fw * 0.1)} ${r2(yy + hh * 0.5)} Z`} fill={LEATHER_POCKET} opacity={0.75} />
                <path d={`M${r2(sx + fw * 0.1)} ${r2(yy)} Q${r2(sx + fw * 0.5)} ${r2(yy + 7)} ${r2(sx + fw * 0.9)} ${r2(yy)}`} fill="none" stroke={LEATHER_SHADE} strokeWidth={sw * 0.6} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      ) : null}
      {showOutside ? (
        <g>
          <path d={flapRect(sx + fw, sx)} fill={LEATHER} {...ol(sw)} />
          <path d={flapRect(sx + fw + 9, sx - 9)} fill="none" stroke={STITCH} strokeWidth={sw * 0.55} strokeDasharray={`${sw * 2} ${sw * 1.6}`} opacity={clamp(-cos * 1.5)} />
          <path d={`M${r2(sx + fw * 0.15)} ${r2(-hh + 10)} L${r2(sx + fw * 0.15)} ${r2(hh - 10)}`} stroke="#FFFFFF" strokeOpacity={0.18} strokeWidth={sw * 2} strokeLinecap="round" />
        </g>
      ) : null}
      {/* корешок */}
      <path d={`M${sx} ${r2(-hh)} L${sx} ${r2(hh)}`} stroke={LEATHER_SHADE} strokeWidth={sw * 1.4} strokeLinecap="round" />
    </g>
  );
};

// Пиктограмма кошелька (для карточки): центр 0,0, ≈ 130×110.
const walletIcon = (sw: number) => (
  <g>
    <path d="M-50 -38 L-42 -56 L38 -56 L48 -38 Z" fill={LEATHER_IN} {...ol(sw)} />
    <rect x={-64} y={-40} width={128} height={86} rx={16} fill={LEATHER} {...ol(sw)} />
    <rect x={-54} y={-30} width={108} height={66} rx={10} fill="none" stroke={STITCH} strokeWidth={sw * 0.5} strokeDasharray={`${sw * 1.6} ${sw * 1.3}`} />
    <rect x={18} y={-14} width={56} height={34} rx={13} fill={LEATHER_SHADE} {...ol(sw)} />
    <circle cx={56} cy={3} r={7} fill={STITCH} />
  </g>
);

export const Wallet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly open?: number;
  readonly rot?: number;
}> = ({ x, y, s = 1, open = 0, rot = 0 }) => {
  const sw = 4 / Math.sqrt(s);
  return (
    <FrameSvg>
      <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot}) scale(${s})`}>
        <g transform="translate(6 12)" fill="rgba(120,80,40,0.16)" style={{ filter: "blur(6px)" }}>
          {walletShapes(open, sw, true)}
        </g>
        {walletShapes(open, sw)}
      </g>
    </FrameSvg>
  );
};

// ---------------------------------------------------------------------------
// Ручка (локально: кончик в 0,0, корпус вправо по +x, длина 250)
// ---------------------------------------------------------------------------
const PEN_L = 250;
const penShapes = (sw: number, silhouette = false) => {
  if (silhouette) return <path d={`M0 0 L22 -9 L${PEN_L - 8} -11 Q${PEN_L} 0 ${PEN_L - 8} 11 L22 9 Z`} />;
  return (
    <g>
      {/* металлический наконечник */}
      <path d="M2 0 L24 -8 L24 8 Z" fill="#C9D0DB" {...ol(sw * 0.8)} />
      <circle cx={3} cy={0} r={2.6} fill={C.navy} />
      {/* резиновая часть */}
      <path d={`M24 -9 L78 -10.5 L78 10.5 L24 9 Z`} fill="#22386E" {...ol(sw)} />
      {[34, 44, 54, 64].map((gx) => (
        <path key={gx} d={`M${gx} -8 L${gx} 8`} stroke="#3D5A99" strokeWidth={sw * 0.6} strokeLinecap="round" />
      ))}
      {/* корпус */}
      <path d={`M78 -11 L${PEN_L - 10} -11 Q${PEN_L} -11 ${PEN_L} 0 Q${PEN_L} 11 ${PEN_L - 10} 11 L78 11 Z`} fill={C.navy} {...ol(sw)} />
      <path d={`M84 -5.5 L${PEN_L - 14} -5.5`} stroke="#3F5B9E" strokeWidth={4} strokeLinecap="round" />
      {/* жёлтое кольцо и клип */}
      <path d="M150 -11 L150 11" stroke={C.yellow} strokeWidth={7} />
      <path d={`M168 -2 L${PEN_L - 6} -2`} stroke="#D7DDE7" strokeWidth={6} strokeLinecap="round" {...{ strokeOpacity: 1 }} />
      <path d={`M168 -2 L${PEN_L - 6} -2`} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1.4} strokeLinecap="round" transform="translate(0 3.4)" />
    </g>
  );
};

const tremorAt = (f: number, amp: number): XY =>
  amp > 0
    ? [amp * (Math.sin(f * 0.9) * 0.6 + Math.sin(f * 2.3 + 1) * 0.4), amp * (Math.sin(f * 1.3 + 2) * 0.6 + Math.sin(f * 2.9) * 0.4)]
    : [0, 0];

export const Pen: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly rot?: number;
  readonly f?: number;
  readonly tremor?: number;
}> = ({ x, y, s = 1, rot = 0, f = 0, tremor = 0 }) => {
  const [tx, ty] = tremorAt(f, tremor);
  const sw = 4 / Math.sqrt(s);
  return (
    <FrameSvg>
      <g transform={`translate(${r2(x + tx)} ${r2(y + ty)}) rotate(${rot}) scale(${s})`}>
        <g transform="translate(8 12)" fill="rgba(120,80,40,0.16)" style={{ filter: "blur(4px)" }}>
          {penShapes(sw, true)}
        </g>
        {penShapes(sw)}
      </g>
    </FrameSvg>
  );
};

// ---------------------------------------------------------------------------
// Рука мамы (каноническая правая; левая — зеркально)
// ---------------------------------------------------------------------------
const SLEEVE = "#B5D0EE";
const SLEEVE_SHADE = "#97B8E0";
const RIB = "#86AAD6";
const NAIL = "#F9DECF";
const SHADOW_FILL = "#6E461E";

type Paint = {
  readonly skin: string;
  readonly shade: string;
  readonly sleeve: string;
  readonly sleeveShade: string;
  readonly sw: number;
  readonly sil: boolean; // силуэт для тени
};

const fill = (p: Paint, c: string) => (p.sil ? { fill: SHADOW_FILL } : { fill: c, ...ol(p.sw) });

// Слитная форма из нескольких контуров: общий внешний контур без швов
// (обводка двойной толщины, сверху — заливка без обводки).
const union = (p: Paint, ds: readonly string[], color: string) =>
  p.sil ? (
    <g fill={SHADOW_FILL}>
      {ds.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  ) : (
    <g>
      {ds.map((d, i) => (
        <path key={`o${i}`} d={d} fill={color} stroke={C.ink} strokeOpacity={0.85} strokeWidth={p.sw * 2} strokeLinejoin="round" />
      ))}
      {ds.map((d, i) => (
        <path key={`f${i}`} d={d} fill={color} />
      ))}
    </g>
  );

const chain = (pts: readonly XY[], rs: readonly number[]) => {
  const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i++)
    out.push(capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rs[i], rs[i + 1]));
  return out;
};

// Палец: 2–3 точки от основания к кончику, радиусы в этих точках.
// extra — дополнительные контуры, сливающиеся с пальцем (например, подушка
// большого пальца).
const finger = (p: Paint, pts: readonly XY[], rs: readonly number[], nail = true, extra: readonly string[] = []) => {
  const n = pts.length;
  const a = pts[n - 2];
  const b = pts[n - 1];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / L;
  const uy = (b[1] - a[1]) / L;
  const rb = rs[n - 1];
  const ang = Math.atan2(uy, ux) / DEG;
  const nc: XY = [b[0] - ux * rb * 0.42, b[1] - uy * rb * 0.42];
  return (
    <g>
      {union(p, [...extra, ...chain(pts, rs)], p.skin)}
      {!p.sil ? (
        <>
          {/* тень-тон вдоль одной стороны */}
          {chain(
            pts.map((q, i) => [q[0] + uy * rs[i] * 0.5, q[1] - ux * rs[i] * 0.5] as XY),
            rs.map((r) => r * 0.42),
          ).map((d, i) => (
            <path key={i} d={d} fill={p.shade} opacity={0.5} />
          ))}
          {/* сгибы суставов */}
          {pts.slice(1, n - 1).map((q, i) => {
            const r = rs[i + 1];
            return (
              <path
                key={`j${i}`}
                d={`M${pt([q[0] - uy * r * 0.55, q[1] + ux * r * 0.55])} Q${pt([q[0] + ux * 4, q[1] + uy * 4])} ${pt([q[0] + uy * r * 0.55, q[1] - ux * r * 0.55])}`}
                fill="none"
                stroke={C.ink}
                strokeOpacity={0.3}
                strokeWidth={p.sw * 0.6}
                strokeLinecap="round"
              />
            );
          })}
          {nail ? (
            <ellipse
              cx={nc[0]}
              cy={nc[1]}
              rx={rb * 0.6}
              ry={rb * 0.5}
              transform={`rotate(${r2(ang)} ${r2(nc[0])} ${r2(nc[1])})`}
              fill={NAIL}
              stroke={C.ink}
              strokeOpacity={0.3}
              strokeWidth={p.sw * 0.5}
            />
          ) : null}
        </>
      ) : null}
    </g>
  );
};

// Рукав кардигана с манжетой (cuff — 4 точки: верх-лево, верх-право,
// низ-право, низ-лево).
const sleeve = (p: Paint, pts: readonly XY[], cuff: readonly XY[], n = 8) => (
  <g>
    <path d={blob(pts)} {...fill(p, p.sleeve)} />
    {!p.sil ? (
      <>
        <path d={blob(cuff, 0.5)} fill={p.sleeveShade} {...ol(p.sw)} />
        {ribsBetween(cuff[0], cuff[1], cuff[2], cuff[3], n).map((r, i) => (
          <path key={i} d={`M${pt(r[0])} L${pt(r[1])}`} stroke={RIB} strokeWidth={p.sw * 0.8} strokeLinecap="round" />
        ))}
      </>
    ) : null}
  </g>
);

const ribsBetween = (a: XY, b: XY, c: XY, d: XY, n: number) => {
  // a→b — верхний край манжеты, d→c — нижний; n полос
  const out: (readonly [XY, XY])[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const top: XY = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    const bot: XY = [lerp(d[0], c[0], t), lerp(d[1], c[1], t)];
    out.push([
      [lerp(top[0], bot[0], 0.14), lerp(top[1], bot[1], 0.14)],
      [lerp(top[0], bot[0], 0.86), lerp(top[1], bot[1], 0.86)],
    ]);
  }
  return out;
};

type PoseParts = { back: React.ReactNode; item: React.ReactNode; front: React.ReactNode };

const knuckles = (p: Paint, ks: readonly XY[], ang = 0) =>
  p.sil
    ? null
    : ks.map(([kx, ky], i) => (
        <path
          key={i}
          d={`M${kx - 8} ${ky + 4} q8 -7 16 0`}
          transform={`rotate(${ang} ${kx} ${ky})`}
          fill="none"
          stroke={C.ink}
          strokeOpacity={0.28}
          strokeWidth={p.sw * 0.6}
          strokeLinecap="round"
        />
      ));

// Щепоть с ручкой. Начало координат — кончик ручки, ручка уходит вниз-вправо.
const PEN_ANG = 64;
const posePen = (p: Paint): PoseParts => ({
  back: (
    <g>
      {/* тыльная сторона ладони */}
      <path
        d={blob([[70, 160], [98, 140], [130, 142], [160, 154], [186, 176], [198, 216], [192, 262], [182, 330], [92, 336], [66, 286], [50, 236], [52, 192]])}
        {...fill(p, p.skin)}
      />
      {!p.sil ? (
        <path d={blob([[168, 172], [194, 200], [196, 262], [186, 330], [160, 332], [174, 262], [178, 210]])} fill={p.shade} opacity={0.55} />
      ) : null}
      {knuckles(p, [[98, 150], [128, 150], [156, 162]], 12)}
      {sleeve(p, [[84, 318], [188, 306], [216, 450], [234, 640], [72, 650], [62, 460]], [[80, 316], [190, 304], [198, 360], [76, 372]])}
      {/* согнутые пальцы: мизинец, безымянный, средний */}
      {finger(p, [[178, 190], [168, 162]], [16, 15], false)}
      {finger(p, [[156, 170], [140, 136]], [18, 17], false)}
      {finger(p, [[126, 158], [106, 118]], [19, 18], false)}
    </g>
  ),
  item: <g transform={`rotate(${PEN_ANG})`}>{penShapes(p.sw, p.sil)}</g>,
  front: (
    <g>
      {/* большой палец с подушкой — прижимает ручку слева */}
      {finger(p, [[60, 226], [42, 168], [42, 124]], [25, 21, 18], true, [blob([[52, 188], [70, 186], [84, 230], [78, 276], [56, 280], [42, 240]])])}
      {/* указательный — лежит на ручке */}
      {finger(p, [[96, 154], [72, 102], [38, 60]], [19, 16, 14])}
    </g>
  ),
});

// Держит кошелёк за край. Начало координат — середина края кошелька.
// Канонически (правая рука) кошелёк слева от руки.
const poseWallet = (p: Paint, open: number): PoseParts => ({
  back: (
    <g>
      {/* пальцы — под кошельком (не видны) */}
    </g>
  ),
  item: <g transform={`translate(${-WAL.w / 2} 0) scale(-1 1)`}>{walletShapes(open, p.sw, p.sil)}</g>,
  front: (
    <g>
      <path
        d={blob([[4, -64], [60, -72], [104, -48], [140, -10], [168, 40], [170, 100], [126, 112], [80, 92], [30, 74], [4, 40], [2, -20]])}
        {...fill(p, p.skin)}
      />
      {!p.sil ? <path d={blob([[30, 60], [80, 80], [130, 104], [168, 96], [150, 112], [96, 106], [40, 82]])} fill={p.shade} opacity={0.55} /> : null}
      {knuckles(p, [[18, -40], [20, -10], [20, 20], [16, 48]], -90)}
      {sleeve(p, [[177, 6], [316, 64], [455, 122], [385, 266], [254, 192], [123, 118]], [[177, 6], [222, 28], [168, 140], [123, 118]], 6)}
      {/* большой палец сверху на кошельке */}
      {finger(p, [[70, -46], [16, -40], [-28, -30]], [23, 19, 16], true, [blob([[40, -72], [96, -62], [104, -30], [56, -18]])])}
    </g>
  ),
});

// Держит телефон (вид из-за плеча). Начало — правый нижний угол телефона
// (300×610 при s=1). thumb 0…1 — палец тянется вверх по экрану.
const posePhone = (p: Paint, thumb: number): PoseParts => {
  const t = clamp(thumb);
  const tip: XY = [lerp(-78, -84, t), lerp(-118, -142, t)];
  const mid: XY = [lerp(-42, -44, t), lerp(-100, -112, t)];
  return {
    back: (
      <g>
        {/* ладонь за телефоном, запястье, рукав */}
        <path d={blob([[-160, -40], [-40, -130], [40, -100], [84, 30], [136, 196], [22, 222], [-40, 120], [-140, 40]])} {...fill(p, p.skin)} />
        {!p.sil ? <path d={blob([[50, -30], [86, 40], [130, 190], [100, 200], [70, 80], [36, 0]])} fill={p.shade} opacity={0.55} /> : null}
        {sleeve(p, [[10, 214], [140, 190], [230, 380], [270, 620], [70, 640], [20, 420]], [[8, 202], [142, 178], [166, 236], [28, 262]])}
      </g>
    ),
    item: null,
    front: (
      <g>
        {/* кончики пальцев обхватывают левый край корпуса */}
        {([[-238, 22, -2], [-290, 26, 2], [-346, 28, 4], [-404, 27, 2]] as const).map(([yy, r, dx], i) => (
          <g key={i}>{finger(p, [[-336 + dx, yy - 6], [-302 + dx, yy + 6]], [r, r * 0.9], false)}</g>
        ))}
        {/* подушка и большой палец над экраном */}
        {finger(p, [[-2, -66], mid, tip], [28, 24, 21], true, [blob([[-46, -10], [-20, -90], [30, -104], [62, -20], [40, 50], [-20, 40]])])}
      </g>
    ),
  };
};

// Расслабленная ладонь сверху. Начало — центр тыльной стороны.
const poseNone = (p: Paint): PoseParts => ({
  back: (
    <g>
      {finger(p, [[50, -30], [60, -98], [66, -140]], [17, 15, 13])}
      {finger(p, [[18, -40], [22, -126], [24, -180]], [19, 17, 15])}
      {finger(p, [[-16, -42], [-18, -134], [-19, -194]], [20, 18, 16])}
      {finger(p, [[-50, -36], [-58, -118], [-62, -174]], [20, 18, 16])}
      {finger(p, [[-50, 20], [-98, -22], [-122, -54]], [24, 20, 17], true, [blob([[-70, -24], [-36, -10], [-34, 46], [-66, 44]])])}
      <path d={blob([[-74, -62], [-26, -78], [26, -78], [70, -60], [74, 0], [54, 82], [-50, 84], [-76, 10]])} {...fill(p, p.skin)} />
      {!p.sil ? <path d={blob([[44, -52], [70, -50], [72, 4], [54, 80], [36, 80], [50, 20]])} fill={p.shade} opacity={0.55} /> : null}
      {knuckles(p, [[-48, -54], [-16, -64], [18, -62], [48, -50]])}
      {sleeve(p, [[-60, 84], [62, 84], [84, 260], [92, 440], [-88, 440], [-80, 260]], [[-60, 70], [62, 70], [68, 122], [-64, 122]])}
    </g>
  ),
  item: null,
  front: null,
});

export type HandHold = "pen" | "wallet" | "phone" | "none";

export const Hand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly rot?: number;
  readonly side?: "left" | "right";
  readonly hold?: HandHold;
  readonly f?: number;
  readonly open?: number;
  readonly thumb?: number;
  readonly lift?: number;
  readonly tremor?: number;
  readonly shadow?: boolean;
  readonly children?: React.ReactNode;
}> = ({ x, y, s = 1, rot = 0, side = "right", hold = "none", f = 0, open = 1, thumb = 0, lift = 0, tremor = 0, shadow, children }) => {
  const L = clamp(lift);
  const sc = s * (1 + 0.06 * L);
  const sw = 4 / Math.sqrt(sc);
  const mir = side === "left" ? -1 : 1;
  const [tx, ty] = tremorAt(f, tremor);
  const paint: Paint = { skin: C.skin, shade: C.skinShade, sleeve: SLEEVE, sleeveShade: SLEEVE_SHADE, sw, sil: false };
  const sil: Paint = { ...paint, sil: true };
  const make = (pp: Paint) =>
    hold === "pen" ? posePen(pp) : hold === "wallet" ? poseWallet(pp, open) : hold === "phone" ? posePhone(pp, thumb) : poseNone(pp);
  const main = make(paint);
  const useShadow = shadow ?? hold !== "phone";
  const tf = `translate(${r2(x + tx)} ${r2(y + ty)}) rotate(${rot}) scale(${r2(sc * mir)} ${r2(sc)})`;
  let shade: React.ReactNode = null;
  if (useShadow) {
    const sh = make(sil);
    const off = 10 + 16 * L;
    shade = (
      <g transform={`translate(${r2(x + tx + off * 0.7)} ${r2(y + ty + off)}) rotate(${rot}) scale(${r2(sc * mir)} ${r2(sc)})`} style={{ filter: `blur(${r2(5 + 7 * L)}px)` }} opacity={0.17 * (1 - 0.35 * L)}>
        {sh.back}
        {sh.item}
        {sh.front}
      </g>
    );
  }
  if (children) {
    return (
      <>
        <FrameSvg>
          {shade}
          <g transform={tf}>
            {main.back}
            {main.item}
          </g>
        </FrameSvg>
        {children}
        <FrameSvg>
          <g transform={tf}>{main.front}</g>
        </FrameSvg>
      </>
    );
  }
  return (
    <FrameSvg>
      {shade}
      <g transform={tf}>
        {main.back}
        {main.item}
        {main.front}
      </g>
    </FrameSvg>
  );
};

// Подбор Hand hold="phone" под прямоугольник телефона (например, PHONE).
export const handOnPhone = (
  ph: { readonly x: number; readonly y: number; readonly w: number; readonly h: number },
  side: "left" | "right" = "right",
) => ({
  x: side === "right" ? ph.x + ph.w : ph.x,
  y: ph.y + ph.h,
  s: ph.w / 300,
  side,
  hold: "phone" as const,
});

// ---------------------------------------------------------------------------
// Бумажная карточка мамы
// ---------------------------------------------------------------------------
const CW = 880;
const CH = CW * CARD_ASPECT;
const PAPER = "#FFF8EA";
const PAPER_SHADE = "#EEDDBC";
const C_SQ = { x: 58, y: 52, size: 168 } as const;
const C_NOTE = { x: 272, y: 128, size: 62 } as const;
const C_TAG = { x: 272, y: 214, size: 44, maxW: 560 } as const;
const C_Q = { x: 58, y1: 334, y2: 424, size: 80 } as const;
const C_CH = { size: 92, y: 462, yes: 236, no: 644, label: 606, labelSize: 50 } as const;

type CardGeom = { readonly x: number; readonly y: number; readonly w: number; readonly rot: number };

export const cardLocalToFrame = (card: CardGeom, u: number, v: number): Pt => {
  const k = card.w / CW;
  const cx0 = card.x + card.w / 2;
  const cy0 = card.y + (card.w * CARD_ASPECT) / 2;
  const lx = (u - CW / 2) * k;
  const ly = (v - CH / 2) * k;
  const a = card.rot * DEG;
  return { x: cx0 + lx * Math.cos(a) - ly * Math.sin(a), y: cy0 + lx * Math.sin(a) + ly * Math.cos(a) };
};

export const cardSquareRect = (card: CardGeom = CARD) => {
  const k = card.w / CW;
  const c = cardLocalToFrame(card, C_SQ.x + C_SQ.size / 2, C_SQ.y + C_SQ.size / 2);
  const size = C_SQ.size * k;
  return { x: c.x - size / 2, y: c.y - size / 2, size, cx: c.x, cy: c.y, rot: card.rot };
};

const splitTwo = (s: string): readonly [string, string] => {
  const w = s.split(" ");
  if (w.length < 2) return [s, ""];
  let best = 1;
  let score = Infinity;
  for (let i = 1; i < w.length; i++) {
    const sc = Math.max(w.slice(0, i).join(" ").length, w.slice(i).join(" ").length);
    if (sc < score) {
      score = sc;
      best = i;
    }
  }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
};

export type CardPart = "square" | "note" | "tag" | "question" | "yes" | "no" | "wallet" | "noDuty";
export const cardPoint = (card: CardGeom, name: CardPart): Pt => {
  const at: Record<CardPart, XY> = {
    square: [C_SQ.x + C_SQ.size / 2, C_SQ.y + C_SQ.size / 2],
    note: [C_NOTE.x + estW(BG33_TEXT.hook.note, C_NOTE.size) / 2, C_NOTE.y - C_NOTE.size * 0.35],
    tag: [C_TAG.x + 80, C_TAG.y - C_TAG.size * 0.35],
    question: [C_Q.x + 360, (C_Q.y1 + C_Q.y2) / 2 - C_Q.size * 0.35],
    yes: [C_CH.yes, C_CH.y + C_CH.size / 2],
    no: [C_CH.no, C_CH.y + C_CH.size / 2],
    wallet: [C_CH.yes, 664],
    noDuty: [C_CH.no, 668],
  };
  return cardLocalToFrame(card, at[name][0], at[name][1]);
};

export const PaperCard: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly rot?: number;
  readonly f?: number;
  readonly note?: { readonly show: number; readonly strike: number };
  readonly question?: number;
  readonly square?: { readonly draw: number; readonly sand?: number; readonly glow?: number; readonly stroke?: number };
  readonly freeTag?: number;
  readonly freeTagText?: string;
  readonly choices?: number;
  readonly wallet?: number;
  readonly noDuty?: number;
  readonly squareDetach?: number;
  readonly shadow?: number;
}> = ({
  x = CARD.x,
  y = CARD.y,
  w = CARD.w,
  rot = CARD.rot,
  f = 0,
  note,
  question = 0,
  square = { draw: 1 },
  freeTag = 0,
  freeTagText = BG33_TEXT.rule.free,
  choices = 0,
  wallet = 0,
  noDuty = 0,
  squareDetach = 0,
  shadow = 1,
}) => {
  const strikeId = useSvgId("st");
  const k = w / CW;
  const h = w * CARD_ASPECT;
  const sw = 3.6 / Math.sqrt(k) / Math.max(1, Math.sqrt(k));
  const tf = `translate(${r2(x + w / 2)} ${r2(y + h / 2)}) rotate(${rot}) scale(${r2(k)}) translate(${r2(-CW / 2)} ${r2(-CH / 2)})`;
  // заметка «Төлөйүнбү?»
  const nW = estW(BG33_TEXT.hook.note, C_NOTE.size);
  const show = clamp(note?.show ?? 0);
  const strike = clamp(note?.strike ?? 0);
  // вопрос (две строки)
  const [q1, q2] = splitTwo(BG33_TEXT.hook.question);
  const w1 = estW(q1, C_Q.size, 900);
  const w2 = estW(q2, C_Q.size, 900);
  const share = w1 / (w1 + w2);
  const q = clamp(question);
  // ярлык
  const tagSize = Math.min(C_TAG.size, C_TAG.maxW / (estW(freeTagText, 1) || 1));
  const tW = estW(freeTagText, tagSize) * 1.04;
  const ft = clamp(freeTag);
  // выбор
  const ch = clamp(choices);
  const det = clamp(squareDetach);
  const sq = square;
  return (
    <FrameSvg>
      <g transform={tf}>
        {/* тень на столе */}
        {shadow > 0 ? (
          <rect x={14} y={22} width={CW} height={CH} rx={20} fill="rgba(120,80,35,0.2)" opacity={shadow} style={{ filter: "blur(12px)" }} />
        ) : null}
        {/* бумага: толщина-тон, лист, контур */}
        <rect x={0} y={6} width={CW} height={CH} rx={18} fill={PAPER_SHADE} />
        <rect x={0} y={0} width={CW} height={CH - 4} rx={18} fill={PAPER} />
        <path d={`M${CW - 70} ${CH - 4} L${CW - 18} ${CH - 4} Q${CW} ${CH - 4} ${CW} ${CH - 22} L${CW} ${CH - 70} Z`} fill={PAPER_SHADE} opacity={0.5} />
        <rect x={0} y={0} width={CW} height={CH + 6} rx={18} fill="none" {...ol(sw)} />
        {/* квадрат */}
        {det > 0 ? (
          <rect x={C_SQ.x} y={C_SQ.y} width={C_SQ.size} height={C_SQ.size} rx={6} fill="none" stroke={C.yellowDeep} strokeOpacity={0.16 * det} strokeWidth={10} />
        ) : null}
        {sketchSquareShapes({
          x: C_SQ.x,
          y: C_SQ.y,
          size: C_SQ.size,
          stroke: sq.stroke ?? 15,
          draw: sq.draw,
          sand: sq.sand,
          glow: sq.glow,
          f,
          opacity: 1 - det,
        })}
        {/* «Төлөйүнбү?» + зачёркивание */}
        {note ? (
          <>
            <HandWrite text={BG33_TEXT.hook.note} x={C_NOTE.x} y={C_NOTE.y} size={C_NOTE.size} reveal={show} seed={3} />
            {strike > 0.002 ? (
              <path
                key={strikeId}
                d={`M${C_NOTE.x - 14} ${C_NOTE.y - 18} Q${C_NOTE.x + nW * 0.5} ${C_NOTE.y - 30} ${C_NOTE.x + nW + 18} ${C_NOTE.y - 26}`}
                fill="none"
                stroke={C.navy}
                strokeWidth={7}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${r2(strike)} 2`}
              />
            ) : null}
          </>
        ) : null}
        {/* ярлык «акысыз» с жёлтым маркером */}
        {ft > 0.002 ? (
          <g>
            <path
              d={`M${C_TAG.x - 10} ${C_TAG.y - tagSize * 0.5} L${C_TAG.x + (tW + 22) * easeOut(ft / 0.6) - 10} ${C_TAG.y - tagSize * 0.56} L${C_TAG.x + (tW + 22) * easeOut(ft / 0.6) - 10} ${C_TAG.y + tagSize * 0.16} L${C_TAG.x - 10} ${C_TAG.y + tagSize * 0.2} Z`}
              fill={C.yellow}
              opacity={0.7}
            />
            <HandWrite text={freeTagText} x={C_TAG.x} y={C_TAG.y} size={tagSize} reveal={span(ft, 0.25, 1)} seed={5} />
          </g>
        ) : null}
        {/* крупный вопрос */}
        {q > 0.002 ? (
          <>
            <HandWrite text={q1} x={C_Q.x} y={C_Q.y1} size={C_Q.size} reveal={q / share} seed={7} weight={900} />
            {q2 ? <HandWrite text={q2} x={C_Q.x} y={C_Q.y2} size={C_Q.size} reveal={(q - share) / (1 - share)} seed={11} weight={900} /> : null}
          </>
        ) : null}
        {/* два равных пустых квадрата */}
        {ch > 0.002 ? (
          <>
            {sketchSquareShapes({ x: C_CH.yes - C_CH.size / 2, y: C_CH.y, size: C_CH.size, stroke: 11, draw: ch / 0.34 })}
            <HandWrite text={BG33_TEXT.choice.yes} x={C_CH.yes} y={C_CH.label} size={C_CH.labelSize} anchor="middle" reveal={(ch - 0.32) / 0.16} seed={13} />
            {sketchSquareShapes({ x: C_CH.no - C_CH.size / 2, y: C_CH.y, size: C_CH.size, stroke: 11, draw: (ch - 0.5) / 0.34 })}
            <HandWrite text={BG33_TEXT.choice.no} x={C_CH.no} y={C_CH.label} size={C_CH.labelSize} anchor="middle" reveal={(ch - 0.82) / 0.18} seed={17} />
          </>
        ) : null}
        {/* полупрозрачный кошелёк — только у «Улантам» */}
        {wallet > 0.002 ? (
          <g transform={`translate(${C_CH.yes} 668) scale(${r2(0.46 * (0.85 + 0.15 * easeOut(wallet)))})`} opacity={0.6 * clamp(wallet)}>
            {walletIcon(7)}
          </g>
        ) : null}
        {/* «милдет жок» — только у «Улантпайм» */}
        {noDuty > 0.002 ? (
          <HandWrite text={BG33_TEXT.choice.noDuty} x={C_CH.no} y={676} size={34} anchor="middle" reveal={noDuty} seed={19} color={C.muted} />
        ) : null}
      </g>
    </FrameSvg>
  );
};

// ---------------------------------------------------------------------------
// Телефон и экран
// ---------------------------------------------------------------------------
export const phoneScreen = (w: number, h: number) => {
  const b = w * 0.036;
  return { x: b, y: b, w: w - 2 * b, h: h - 2 * b };
};

export const Phone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly rot?: number;
  readonly glow?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, rot = 0, glow = 0, children }) => {
  const sc = phoneScreen(w, h);
  const R = w * 0.13;
  const g = clamp(glow);
  const lw = Math.max(2.5, w * 0.007);
  const u = w / 100;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rot}deg)`,
        borderRadius: R,
        background: "linear-gradient(135deg, #34456A 0%, #22314F 60%, #1B2843 100%)",
        boxShadow: `0 0 0 ${lw}px rgba(36,54,95,0.85), 0 ${3 * u}px ${8 * u}px rgba(20,40,90,0.22), 0 0 ${r2(30 * u * g)}px ${r2(6 * u * g)}px rgba(255,226,140,${r2(0.7 * g)})`,
      }}
    >
      {/* боковые кнопки */}
      <div style={{ position: "absolute", left: -lw - 0.8 * u, top: h * 0.2, width: 1.4 * u, height: h * 0.07, borderRadius: u, background: "#2B3A5C" }} />
      <div style={{ position: "absolute", left: -lw - 0.8 * u, top: h * 0.29, width: 1.4 * u, height: h * 0.07, borderRadius: u, background: "#2B3A5C" }} />
      <div style={{ position: "absolute", right: -lw - 0.8 * u, top: h * 0.24, width: 1.4 * u, height: h * 0.11, borderRadius: u, background: "#2B3A5C" }} />
      <div
        style={{
          position: "absolute",
          left: sc.x,
          top: sc.y,
          width: sc.w,
          height: sc.h,
          borderRadius: R - sc.x,
          overflow: "hidden",
          background: C.white,
        }}
      >
        {children}
        {/* строка состояния: сигнал и батарея (без времени) */}
        <svg width={sc.w} height={9 * u} viewBox={`0 0 ${sc.w} ${9 * u}`} style={{ position: "absolute", left: 0, top: 0 }}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={sc.w - 24 * u + i * 2.3 * u} y={5.6 * u - i * 0.9 * u} width={1.5 * u} height={1.4 * u + i * 0.9 * u} rx={0.4 * u} fill={C.navy} />
          ))}
          <rect x={sc.w - 13 * u} y={3 * u} width={6.4 * u} height={3.2 * u} rx={0.9 * u} fill="none" stroke={C.navy} strokeWidth={0.45 * u} />
          <rect x={sc.w - 12.3 * u} y={3.7 * u} width={4.4 * u} height={1.8 * u} rx={0.4 * u} fill={C.navy} />
          <rect x={sc.w - 6.3 * u} y={4 * u} width={0.7 * u} height={1.2 * u} rx={0.3 * u} fill={C.navy} />
        </svg>
        {/* лёгкий блик стекла */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(118deg, rgba(255,255,255,0) 52%, rgba(255,255,255,0.22) 60%, rgba(255,255,255,0) 70%)",
          }}
        />
        {g > 0 ? <div style={{ position: "absolute", inset: 0, background: "rgba(255,246,214,1)", opacity: 0.18 * g }} /> : null}
      </div>
      {/* фронтальная камера */}
      <div
        style={{
          position: "absolute",
          left: w / 2 - 12 * u,
          top: sc.y + 2.2 * u,
          width: 24 * u,
          height: 6 * u,
          borderRadius: 4 * u,
          background: "#141C2E",
        }}
      />
    </div>
  );
};

// Значки дом / школа для экрана.
const HouseGlyph: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M6 19 L20 7 L34 19" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 17 L10 33 L30 33 L30 17" fill={C.yellowSoft} stroke={color} strokeWidth={3.4} strokeLinejoin="round" />
    <rect x={17} y={23} width={6} height={10} rx={1} fill={C.yellow} stroke={color} strokeWidth={2.4} />
  </svg>
);
const SchoolGlyph: React.FC<{ readonly size: number; readonly color?: string }> = ({ size, color = C.navy }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M4 33 L36 33" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    <path d="M7 33 L7 15 L33 15 L33 33" fill={C.yellowSoft} stroke={color} strokeWidth={3.4} strokeLinejoin="round" />
    <path d="M5 16 L20 7 L35 16" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={11} y={19} width={5} height={5} rx={1} fill={C.window} stroke={color} strokeWidth={1.8} />
    <rect x={24} y={19} width={5} height={5} rx={1} fill={C.window} stroke={color} strokeWidth={1.8} />
    <rect x={17} y={25} width={6} height={8} rx={1} fill={C.yellow} stroke={color} strokeWidth={2.2} />
  </svg>
);

export const BalagoInfoCard: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly scroll?: number;
  readonly underline?: number;
}> = ({ w, h, scroll = 0, underline = 0 }) => {
  const u = w / 100;
  const t = BG33_TEXT.rule;
  const i = t.siteText.indexOf(t.underline);
  const before = i >= 0 ? t.siteText.slice(0, i) : t.siteText;
  const mid = i >= 0 ? t.underline : "";
  const after = i >= 0 ? t.siteText.slice(i + mid.length) : "";
  const ul = clamp(underline);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: w,
        height: h,
        overflow: "hidden",
        fontFamily,
        background: `linear-gradient(180deg, ${C.sky} 0%, #FFFFFF 34%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          boxSizing: "border-box",
          padding: `${14 * u}px ${7 * u}px ${8 * u}px`,
          transform: `translateY(${-scroll}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: 36 * u, height: 36 * u, borderRadius: "50%", overflow: "hidden", boxShadow: `0 ${u}px ${3 * u}px rgba(20,40,90,0.12)` }}>
          <Img src={staticFile(BG33_VIDEO.logo)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.02)" }} />
        </div>
        <div style={{ marginTop: 5 * u, fontSize: 8 * u, fontWeight: 900, color: C.navy, textAlign: "center", lineHeight: 1.15 }}>
          {t.siteTitle}
        </div>
        <div style={{ marginTop: 3 * u, width: 18 * u, height: 1.4 * u, borderRadius: u, background: C.yellow }} />
        <div
          style={{
            marginTop: 6 * u,
            boxSizing: "border-box",
            width: "100%",
            background: "#FFFFFF",
            borderRadius: 5 * u,
            padding: `${6 * u}px ${6.5 * u}px`,
            border: `${0.4 * u}px solid ${C.line}`,
            borderLeft: `${1.6 * u}px solid ${C.yellow}`,
            boxShadow: `0 ${1.2 * u}px ${4 * u}px rgba(20,40,90,0.10)`,
            fontSize: 6.3 * u,
            lineHeight: 1.45,
            fontWeight: 700,
            color: C.navy,
          }}
        >
          {before}
          <span
            style={{
              fontWeight: 900,
              backgroundImage: `linear-gradient(${C.yellow}, ${C.yellow})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${r2(ul * 100)}% 0.5em`,
              backgroundPosition: "0 90%",
            }}
          >
            {mid}
          </span>
          {after}
        </div>
        {/* дом → школа → дом (пиктограммы, без текста) */}
        <div style={{ marginTop: 7 * u, display: "flex", alignItems: "center", gap: 2.5 * u }}>
          <HouseGlyph size={13 * u} />
          <svg width={10 * u} height={6 * u} viewBox="0 0 30 18">
            <path d="M2 9 L24 9 M18 3 L25 9 L18 15" fill="none" stroke={C.yellowDeep} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <SchoolGlyph size={13 * u} />
          <svg width={10 * u} height={6 * u} viewBox="0 0 30 18">
            <path d="M2 9 L24 9 M18 3 L25 9 L18 15" fill="none" stroke={C.yellowDeep} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <HouseGlyph size={13 * u} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Надписи
// ---------------------------------------------------------------------------
export const ExampleBadge: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly opacity?: number;
  readonly scale?: number;
}> = ({ x, y, opacity = 1, scale = 1 }) => {
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
        display: "flex",
        alignItems: "center",
        height: 64,
        borderRadius: 32,
        background: C.white,
        boxShadow: `0 0 0 3px ${C.yellow}, 0 6px 16px rgba(20,40,90,0.14)`,
        overflow: "hidden",
        fontFamily,
      }}
    >
      <div style={{ width: 64, height: 64, background: C.yellow, display: "grid", placeItems: "center" }}>
        <svg width={34} height={34} viewBox="0 0 34 34">
          <circle cx={17} cy={17} r={14} fill="none" stroke={C.navy} strokeWidth={3.4} />
          <circle cx={17} cy={10.5} r={2.4} fill={C.navy} />
          <path d="M17 15.5 L17 25" stroke={C.navy} strokeWidth={3.6} strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ padding: "0 24px 0 16px", fontSize: 36, fontWeight: 800, color: C.navy, whiteSpace: "nowrap" }}>
        {BG33_TEXT.example}
      </div>
    </div>
  );
};

export const Headline: React.FC<{
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly size: number;
  readonly sub?: string;
  readonly appear?: number;
  readonly align?: "left" | "center" | "right";
}> = ({ text, x, y, w, size, sub, appear = 1, align = "center" }) => {
  const a = clamp(appear);
  if (a <= 0.001) return null;
  const e = easeOut(a);
  const ub = easeInOut(clamp((a - 0.35) / 0.65));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: clamp(a * 1.6),
        transform: `translateY(${r2((1 - e) * 26)}px)`,
        fontFamily,
        textAlign: align,
      }}
    >
      <div
        style={{
          display: "inline-block",
          maxWidth: w,
          boxSizing: "border-box",
          padding: `${size * 0.24}px ${size * 0.42}px ${size * 0.3}px`,
          borderRadius: size * 0.42,
          background: "rgba(255,253,247,0.92)",
          boxShadow: "0 10px 28px rgba(20,40,90,0.13)",
          transform: `scale(${r2(0.94 + 0.06 * e)})`,
          transformOrigin: align === "left" ? "0 50%" : align === "right" ? "100% 50%" : "50% 50%",
        }}
      >
        <div
          style={{
            fontSize: size,
            fontWeight: 900,
            color: C.navy,
            lineHeight: 1.12,
            textWrap: "balance",
          }}
        >
          <span
            style={{
              backgroundImage: `linear-gradient(${C.yellow}, ${C.yellow})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${r2(ub * 100)}% 0.22em`,
              backgroundPosition: "0 96%",
            }}
          >
            {text}
          </span>
        </div>
        {sub ? (
          <div style={{ marginTop: size * 0.16, fontSize: size * 0.56, fontWeight: 800, color: C.ink, opacity: 0.9, lineHeight: 1.2, textWrap: "balance" }}>
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const alignShift = (align: "left" | "center" | "right") =>
  align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";

export const Chip: React.FC<{
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly tone?: "yellow" | "white" | "navy";
  readonly appear?: number;
  readonly align?: "left" | "center" | "right";
  readonly icon?: React.ReactNode;
}> = ({ text, x, y, size = 40, tone = "white", appear = 1, align = "left", icon }) => {
  const a = clamp(appear);
  if (a <= 0.001) return null;
  const t = clamp(a);
  const sc = easeOut(t) + 0.08 * Math.sin(Math.PI * clamp((t - 0.5) / 0.5));
  const bg = tone === "yellow" ? C.yellow : tone === "navy" ? C.navy : C.white;
  const fg = tone === "navy" ? C.white : C.navy;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateX(${alignShift(align)}) scale(${r2(0.6 + 0.4 * sc)})`,
        transformOrigin: align === "center" ? "50% 50%" : align === "right" ? "100% 50%" : "0 50%",
        opacity: clamp(a * 2),
        display: "flex",
        alignItems: "center",
        gap: size * 0.3,
        padding: `${size * 0.26}px ${size * 0.62}px`,
        borderRadius: size,
        background: bg,
        boxShadow: `${tone === "white" ? `0 0 0 3px ${C.yellow}, ` : ""}0 6px 16px rgba(20,40,90,0.14)`,
        color: fg,
        fontFamily,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Жёлтая рукописная стрелка
// ---------------------------------------------------------------------------
export const YellowArrow: React.FC<{
  readonly from: Pt;
  readonly to: Pt;
  readonly bend?: number;
  readonly grow: number;
  readonly width?: number;
  readonly opacity?: number;
}> = ({ from, to, bend = 0, grow, width = 14, opacity = 1 }) => {
  const g = clamp(grow);
  if (g <= 0.002) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const L = Math.hypot(dx, dy) || 1;
  const nx = dy / L;
  const ny = -dx / L;
  const cx = (from.x + to.x) / 2 + nx * bend;
  const cy = (from.y + to.y) / 2 + ny * bend;
  // небольшая «рукописность»: смещение второй контрольной точки
  const c2x = lerp(cx, to.x, 0.5) + nx * L * 0.012;
  const c2y = lerp(cy, to.y, 0.5) + ny * L * 0.012;
  const c1x = lerp(from.x, cx, 0.66);
  const c1y = lerp(from.y, cy, 0.66);
  const d = `M${r2(from.x)} ${r2(from.y)} C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(to.x)} ${r2(to.y)}`;
  // точка и касательная на кончике (по кривой Безье)
  const B = (u: number): XY => {
    const v = 1 - u;
    return [
      v * v * v * from.x + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * to.x,
      v * v * v * from.y + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * to.y,
    ];
  };
  const tip = B(g);
  const back = B(Math.max(0, g - 0.03));
  const ang = Math.atan2(tip[1] - back[1], tip[0] - back[0]);
  const head = clamp((g - 0.78) / 0.22);
  const hl = width * 3.4 * easeOut(head);
  const wing = (s: number): XY => [tip[0] - Math.cos(ang + s * 0.55) * hl, tip[1] - Math.sin(ang + s * 0.55) * hl];
  const dash = { pathLength: 1, strokeDasharray: `${r2(g)} 2` };
  const hd = `M${pt(wing(1))} L${pt(tip)} L${pt(wing(-1))}`;
  return (
    <FrameSvg opacity={opacity}>
      <path d={d} fill="none" stroke={C.yellowDeep} strokeWidth={width + 6} strokeLinecap="round" {...dash} />
      <path d={d} fill="none" stroke={C.yellow} strokeWidth={width} strokeLinecap="round" {...dash} />
      {head > 0 ? (
        <>
          <path d={hd} fill="none" stroke={C.yellowDeep} strokeWidth={width + 6} strokeLinecap="round" strokeLinejoin="round" />
          <path d={hd} fill="none" stroke={C.yellow} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </FrameSvg>
  );
};

// ---------------------------------------------------------------------------
// Значки
// ---------------------------------------------------------------------------
type IconProps = { readonly x: number; readonly y: number; readonly size: number; readonly opacity?: number };

const IconBox: React.FC<IconProps & { readonly children: React.ReactNode; readonly vb?: number }> = ({ x, y, size, opacity = 1, children, vb = 100 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} style={{ position: "absolute", left: x, top: y, opacity, overflow: "visible" }}>
    {children}
  </svg>
);

export const LinkIcon: React.FC<IconProps> = (p) => (
  <IconBox {...p}>
    <circle cx={50} cy={50} r={47} fill={C.yellow} stroke={C.ink} strokeOpacity={0.85} strokeWidth={4} />
    <g transform="rotate(-45 50 50)" fill="none" stroke={C.navy} strokeWidth={8} strokeLinecap="round">
      <rect x={17} y={38} width={36} height={24} rx={12} />
      <rect x={47} y={38} width={36} height={24} rx={12} />
    </g>
  </IconBox>
);

export const WhatsAppIcon: React.FC<IconProps> = (p) => (
  <IconBox {...p}>
    {/* круглое облачко с хвостиком внизу слева */}
    <path d="M50 5 A45 45 0 1 1 27 89 L8 95 L14 76 A45 45 0 0 1 50 5 Z" fill="#25D366" stroke={C.ink} strokeOpacity={0.85} strokeWidth={4} strokeLinejoin="round" />
    <path d="M50 15 A35 35 0 1 1 30 79 L18 83 L22 71 A35 35 0 0 1 50 15 Z" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinejoin="round" />
    {/* трубка */}
    <path
      d="M37 31 C39 29 42 29 43 32 L46 39 C47 41 46 43 45 44 L42 47 C44 52 48 56 53 58 L56 55 C57 54 59 53 61 54 L68 57 C71 58 71 61 69 63 L66 66 C63 69 58 70 53 68 C43 64 36 57 32 47 C30 42 31 37 34 34 Z"
      fill="#FFFFFF"
    />
  </IconBox>
);

export const Logo: React.FC<IconProps> = ({ x, y, size, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", overflow: "hidden", opacity }}>
    <Img src={staticFile(BG33_VIDEO.logo)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.02)" }} />
  </div>
);

export const SchoolBellIcon: React.FC<IconProps & { readonly ring?: number; readonly f?: number }> = ({ ring = 0, f = 0, ...p }) => {
  const r = clamp(ring);
  const swing = r * 16 * Math.sin(f * 0.75);
  const wave = r > 0.01 ? 0.5 + 0.5 * Math.sin(f * 0.75) : 0;
  return (
    <IconBox {...p}>
      <g transform={`rotate(${r2(swing)} 50 14)`}>
        <circle cx={50} cy={12} r={6} fill={C.yellowDeep} stroke={C.ink} strokeOpacity={0.85} strokeWidth={3.5} />
        <circle cx={50 + swing * 0.5} cy={80} r={8} fill={C.navy} />
        <path d="M50 16 C30 16 26 34 26 50 C26 62 20 68 14 74 L86 74 C80 68 74 62 74 50 C74 34 70 16 50 16 Z" fill={C.yellow} stroke={C.ink} strokeOpacity={0.85} strokeWidth={4} strokeLinejoin="round" />
        <path d="M36 30 C33 38 33 48 33 56" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M12 74 L88 74" stroke={C.yellowDeep} strokeWidth={7} strokeLinecap="round" />
      </g>
      {r > 0.01
        ? [0, 1].map((i) => (
            <g key={i} opacity={r * (0.4 + 0.6 * wave)} fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round">
              <path d={`M${10 - i * 8} ${30 - i * 4} Q${2 - i * 8} ${46} ${10 - i * 8} ${62 + i * 4}`} />
              <path d={`M${90 + i * 8} ${30 - i * 4} Q${98 + i * 8} ${46} ${90 + i * 8} ${62 + i * 4}`} />
            </g>
          ))
        : null}
    </IconBox>
  );
};

export const SunIcon: React.FC<IconProps & { readonly f?: number }> = ({ f = 0, ...p }) => (
  <IconBox {...p}>
    <g transform={`rotate(${r2(f * 0.6)} 50 50)`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <path
          key={i}
          d="M50 4 L50 16"
          transform={`rotate(${i * 36} 50 50)`}
          stroke={C.yellowDeep}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.75 + 0.25 * Math.sin(f * 0.1 + i)}
        />
      ))}
    </g>
    <circle cx={50} cy={50} r={27} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={4} />
    <circle cx={42} cy={42} r={8} fill="#FFFFFF" opacity={0.45} />
  </IconBox>
);

export const ClockChip: React.FC<{
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly appear?: number;
  readonly align?: "left" | "center" | "right";
}> = ({ text, x, y, size = 40, appear = 1, align = "left" }) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text);
  const hh = m ? Number(m[1]) % 12 : 0;
  const mm = m ? Number(m[2]) : 0;
  const ha = (hh + mm / 60) * 30;
  const ma = mm * 6;
  const s = size * 1.1;
  return (
    <Chip
      text={text}
      x={x}
      y={y}
      size={size}
      tone="white"
      appear={appear}
      align={align}
      icon={
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={17} fill={C.yellowSoft} stroke={C.navy} strokeWidth={3.4} />
          <path d="M20 20 L20 9" transform={`rotate(${ma} 20 20)`} stroke={C.navy} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M20 20 L20 12.5" transform={`rotate(${ha} 20 20)`} stroke={C.navy} strokeWidth={3.6} strokeLinecap="round" />
          <circle cx={20} cy={20} r={2.2} fill={C.yellowDeep} />
        </svg>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// Камера
// ---------------------------------------------------------------------------
export type CamState = {
  readonly zoom: number;
  readonly x: number;
  readonly y: number;
  readonly to?: Pt;
  readonly rot?: number;
};
export const CAM_IDENTITY: CamState = { zoom: 1, x: 540, y: 960, to: { x: 540, y: 960 }, rot: 0 };
const CENTER: Pt = { x: 540, y: 960 };

export const camToScreen = (cam: CamState, p: Pt): Pt => {
  const to = cam.to ?? CENTER;
  const a = (cam.rot ?? 0) * DEG;
  const dx = (p.x - cam.x) * cam.zoom;
  const dy = (p.y - cam.y) * cam.zoom;
  return { x: to.x + dx * Math.cos(a) - dy * Math.sin(a), y: to.y + dx * Math.sin(a) + dy * Math.cos(a) };
};

export const cameraBetween = (a: CamState, b: CamState, t: number): CamState => {
  const u = clamp(t);
  const P: Pt = { x: b.x, y: b.y };
  const sa = camToScreen(a, P);
  const sb = b.to ?? CENTER;
  return {
    zoom: a.zoom * Math.pow(b.zoom / a.zoom, u),
    x: P.x,
    y: P.y,
    to: { x: lerp(sa.x, sb.x, u), y: lerp(sa.y, sb.y, u) },
    rot: lerp(a.rot ?? 0, b.rot ?? 0, u),
  };
};

export const Camera: React.FC<CamState & { readonly children: React.ReactNode }> = ({ zoom, x, y, to = CENTER, rot = 0, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: "0 0",
        transform: `translate(${r2(to.x)}px, ${r2(to.y)}px) rotate(${r2(rot)}deg) scale(${zoom}) translate(${r2(-x)}px, ${r2(-y)}px)`,
      }}
    >
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Листы предпросмотра
// ---------------------------------------------------------------------------
const Cap: React.FC<{ readonly x: number; readonly y: number; readonly children: React.ReactNode; readonly w?: number }> = ({ x, y, children, w = 300 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      fontFamily,
      fontSize: 20,
      fontWeight: 700,
      color: C.muted,
      lineHeight: 1.2,
    }}
  >
    {children}
  </div>
);

const TableBg: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number }> = ({ x, y, w, h }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: C.table, borderRadius: 24, boxShadow: `inset 0 -10px 0 ${C.tableEdge}` }} />
);

// Карточка во всех состояниях (кадры 0…90).
export const CardSheet: React.FC = () => {
  const f = useCurrentFrame();
  const A = { x: 50, y: 120, w: 980, rot: CARD.rot };
  const B = { x: 60, y: 1040, w: 470, rot: -3 };
  const D = { x: 560, y: 1040, w: 470, rot: 2 };
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper }}>
      <TableBg x={20} y={90} w={1040} h={880} />
      <PaperCard
        {...A}
        f={f}
        note={{ show: span(f, 0, 14), strike: span(f, 16, 26) }}
        question={span(f, 26, 56)}
        freeTag={span(f, 10, 24)}
        choices={span(f, 56, 82)}
        wallet={span(f, 76, 86)}
        noDuty={span(f, 80, 90)}
      />
      <Cap x={40} y={40} w={1000}>PaperCard (CARD-размер): заметка → зачёркивание → вопрос → «акысыз» → выбор, кошелёк, «милдет жок»</Cap>
      <TableBg x={20} y={1010} w={1040} h={520} />
      <PaperCard {...B} f={f} note={{ show: 1, strike: 1 }} question={1} square={{ draw: 1, sand: (f % 90) / 90, glow: 0.3 + 0.5 * breathe(f, 60) }} freeTag={1} />
      <PaperCard {...D} f={f} note={{ show: 1, strike: 1 }} question={1} square={{ draw: (f % 90) / 80 }} freeTag={1} freeTagText={BG33_TEXT.trial.free} squareDetach={f > 80 ? 1 : 0} />
      <Cap x={60} y={1450} w={460}>песок 0…1 + свечение</Cap>
      <Cap x={560} y={1450} w={480}>draw 0…1 (маршрут по часовой) + длинный ярлык; f&gt;80 — квадрат «оторван»</Cap>
      <SketchSquare x={110} y={1560} size={260} draw={(f % 90) / 80} />
      <SketchSquare x={430} y={1560} size={260} draw={1} sand={(f % 90) / 90} f={f} glow={0.4} />
      {(() => {
        const r = cardSquareRect(B);
        return <div style={{ position: "absolute", left: r.x, top: r.y, width: r.size, height: r.size, border: "2px dashed #E2574C" }} />;
      })()}
      <Cap x={760} y={1580} w={300}>SketchSquare: прорисовка / песок; красный пунктир — cardSquareRect</Cap>
    </div>
  );
};

// Обрезка области листа (чтобы позы не перекрывали друг друга).
const Clip: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: "absolute", inset: 0, clipPath: `inset(${y}px ${1080 - x - w}px ${1920 - y - h}px ${x}px round 24px)` }}>{children}</div>
);

// Руки во всех позах.
export const HandSheet: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f % 90) / 90;
  const sc = phoneScreen(300, 610);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden" }}>
      <Clip x={10} y={20} w={525} h={900}>
        <TableBg x={10} y={20} w={525} h={900} />
        <PaperCard x={30} y={90} w={480} rot={-2} f={f} note={{ show: 1, strike: 0 }} />
        <Hand x={250 + 6 * Math.sin(f * 0.05)} y={170 - 30 * span(f, 30, 50)} s={1.35} rot={-6} side="right" hold="pen" f={f} tremor={1.2} lift={span(f, 30, 50)} />
      </Clip>
      <Clip x={545} y={20} w={525} h={900}>
        <TableBg x={545} y={20} w={525} h={900} />
        <Hand x={810} y={330} s={1.0} rot={-8} side="right" hold="none" f={f} />
        <Hand x={700} y={560} s={0.9} rot={-14} side="left" hold="pen" f={f} />
      </Clip>
      <Cap x={20} y={925} w={1000}>pen (щепоть, дрожание, подъём lift) · none · левая с ручкой</Cap>
      <Clip x={10} y={960} w={525} h={920}>
        <Hand {...handOnPhone({ x: 90, y: 1000, w: 300, h: 610 })} f={f} thumb={breathe(f, 45)}>
          <Phone x={90} y={1000} w={300} h={610} glow={0.4}>
            <BalagoInfoCard w={sc.w} h={sc.h} underline={t} />
          </Phone>
        </Hand>
      </Clip>
      <Clip x={545} y={960} w={525} h={920}>
        <TableBg x={545} y={960} w={525} h={920} />
        <Hand x={700} y={1180} s={1.1} rot={-12} side="left" hold="wallet" f={f} open={1 - span(f, 20, 50)} />
        <Hand x={1000} y={1600} s={0.8} rot={10} side="right" hold="wallet" open={t} f={f} />
      </Clip>
      <Cap x={20} y={1885} w={1040}>phone (вид из-за плеча, thumb 0…1) · wallet левая (закрывает) · wallet правая</Cap>
    </div>
  );
};

// Главный лист: весь реквизит (кадры 0…90).
export const PropsSheet: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f % 90) / 90;
  const sc = phoneScreen(250, 508);
  const card = { x: 40, y: 80, w: 540, rot: -1.5 };
  const sqc = cardPoint(card, "square");
  const cam = cameraBetween(CAM_IDENTITY, { zoom: 2.6, x: 900, y: 1745, to: { x: 860, y: 1745 } }, breathe(f, 90));
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden" }}>
      <Cap x={30} y={14} w={1000}>BG-033 · реквизит (props.tsx) · кадр {f}</Cap>
      {/* ряд 1: карточка, рука с ручкой, рука с кошельком */}
      <Clip x={20} y={50} w={1040} h={560}>
        <TableBg x={20} y={50} w={1040} h={560} />
        <PaperCard
          {...card}
          f={f}
          note={{ show: span(f, 0, 12), strike: span(f, 14, 24) }}
          question={span(f, 24, 50)}
          freeTag={span(f, 8, 20)}
          square={{ draw: 1, sand: t, glow: 0.25 * breathe(f, 45) }}
          choices={span(f, 50, 76)}
          wallet={span(f, 74, 84)}
          noDuty={span(f, 78, 88)}
        />
        <Hand x={sqc.x + 120} y={sqc.y + 40 - 24 * span(f, 40, 55)} s={0.85} rot={-4} side="right" hold="pen" f={f} tremor={1} lift={span(f, 40, 55)} />
        <Hand x={700} y={250} s={0.9} rot={-10} side="left" hold="wallet" open={1 - span(f, 20, 50)} f={f} />
        <Hand x={960} y={470} s={0.55} rot={6} side="right" hold="none" f={f} />
      </Clip>
      <Cap x={30} y={615} w={1000}>PaperCard (все состояния) · Hand pen / wallet / none</Cap>
      {/* ряд 2: предметы */}
      <Wallet x={110} y={720} s={0.6} open={0} />
      <Wallet x={290} y={720} s={0.6} open={t} />
      <Wallet x={570} y={720} s={0.6} open={1} />
      <Pen x={790} y={745} s={0.85} rot={-12} f={f} tremor={1} />
      <Cap x={30} y={790} w={1000}>Wallet open 0 / 0…1 / 1 · Pen</Cap>
      {/* ряд 3: телефон и плашки */}
      <Clip x={20} y={830} w={380} h={580}>
        <Hand {...handOnPhone({ x: 90, y: 850, w: 250, h: 508 })} f={f} thumb={breathe(f, 45)}>
          <Phone x={90} y={850} w={250} h={508} glow={0.3}>
            <BalagoInfoCard w={sc.w} h={sc.h} underline={span(f, 10, 50)} scroll={8 * breathe(f, 90)} />
          </Phone>
        </Hand>
      </Clip>
      <ExampleBadge x={430} y={850} opacity={1} />
      <Chip text={BG33_TEXT.wait.notNow} x={430} y={935} size={34} tone="yellow" appear={span(f, 0, 14)} />
      <Chip text={BG33_TEXT.trial.route} x={430} y={1010} size={34} tone="white" appear={span(f, 6, 20)} />
      <Chip text={BG33_TEXT.trial.school} x={430} y={1085} size={34} tone="navy" appear={span(f, 12, 26)} />
      <ClockChip text={BG33_TEXT.trial.times.am} x={660} y={1085} size={34} appear={span(f, 16, 30)} />
      <ClockChip text={BG33_TEXT.trial.times.pm} x={860} y={1085} size={34} appear={span(f, 20, 34)} />
      <Headline text={BG33_TEXT.rule.headline} sub={BG33_TEXT.rule.condition} x={420} y={1160} w={630} size={48} appear={span(f, 0, 24)} />
      <Cap x={30} y={1415} w={1040}>Phone + Hand(phone) + BalagoInfoCard · ExampleBadge · Chip · ClockChip · Headline</Cap>
      {/* ряд 4: стрелка и значки */}
      <YellowArrow from={{ x: 60, y: 1560 }} to={{ x: 400, y: 1490 }} bend={70} grow={span(f, 0, 40)} />
      <LinkIcon x={440} y={1470} size={90} />
      <WhatsAppIcon x={550} y={1470} size={90} />
      <Logo x={660} y={1460} size={110} />
      <SchoolBellIcon x={800} y={1470} size={90} ring={1} f={f} />
      <SunIcon x={930} y={1470} size={90} f={f} />
      <Cap x={30} y={1585} w={1040}>YellowArrow · LinkIcon · WhatsAppIcon · Logo · SchoolBellIcon · SunIcon</Cap>
      {/* ряд 5: квадрат и камера */}
      <SketchSquare x={50} y={1640} size={170} stroke={14} draw={t * 1.1} />
      <SketchSquare x={250} y={1640} size={170} stroke={14} draw={1} glow={breathe(f, 45)} />
      <SketchSquare x={450} y={1640} size={170} stroke={14} draw={1} sand={t} f={f} />
      <Clip x={660} y={1630} w={400} h={230}>
        <div style={{ position: "absolute", left: 660, top: 1630, width: 400, height: 230, background: C.sky }} />
        <Camera {...cam}>
          <SketchSquare x={870} y={1715} size={60} stroke={7} draw={1} sand={t} f={f} />
        </Camera>
      </Clip>
      <Cap x={30} y={1870} w={1040}>SketchSquare: прорисовка / свечение / песок · справа — Camera (наезд cameraBetween)</Cap>
    </div>
  );
};
