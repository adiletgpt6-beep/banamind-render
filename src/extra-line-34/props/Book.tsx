// Книга «Кичинекей каарман» — одна на весь фильм (сц. 5–8, 10, 13–14):
// коралловая обложка с маленьким лисёнком, кремовая плашка с названием.
// Цвета — bookStyle.ts (BOOK). Все функции — чистые от пропсов (прогресс
// 0..1), сцены управляют ими по кадрам.
//   BookClosedArt — закрытая книга (SVG <g>, центр 0,0) для руки и полки;
//   BookCover     — подробная обложка с читаемым названием (крупные планы);
//   OpenBook      — раскрытая книга, вид спереди-сверху: изгиб страниц,
//                   толщина блока, перелистывание за правый нижний угол,
//                   жёлтая закладка; точки для руки — openBookCorner,
//                   openBookBookmarkTip;
//   PageArt       — страница разворота 1: лисёнок оборачивается к зайчонку,
//                   застрявшему у ручья (без текста), под картинкой —
//                   абстрактные серые строки;
//   BookCloseUp   — крупный план во весь кадр (сц. 7 и 14), CLOSEUP_BOOK;
//   PageGlow      — переход: страница светлеет до фона финала (#F7F5EF).
import { useId } from "react";
import { Backdrop, box, Svg } from "../kit";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { EL_TEXT } from "../script";
import { C, F } from "../theme";
import { BOOK } from "./bookStyle";

type P = { readonly x: number; readonly y: number };
const useUid = (prefix: string) => `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(t)))).join(",")})`;
};

// ---------- Персонажи книги ----------
const FOX = { body: BOOK.fox, shade: "#D46E2C", cream: "#FFF4E2", dark: "#5B3226", eye: "#2A2430", ear: "#8A4430", blush: "#F7A486" };
const BN = { body: "#F4F0EA", shade: "#DCD4CA", ear: "#F2B8B5", eye: "#2A2430", nose: "#D98C88" };

// Лисёнок сидит, вид спереди (обложка). Земля y = 0, высота ≈ 130.
const FoxFront: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 22 -6 C 58 0 86 -24 80 -58 C 77 -74 62 -82 52 -74 C 62 -54 52 -30 20 -28 Z" fill={FOX.body} />
    <path d="M 80 -58 C 77 -74 62 -82 52 -74 C 56 -68 58 -62 58 -54 C 66 -54 74 -55 80 -58 Z" fill={FOX.cream} />
    <path d="M -32 0 C -38 -32 -26 -62 0 -64 C 26 -62 38 -32 32 0 Z" fill={FOX.body} />
    <path d="M 16 -60 C 32 -50 38 -28 32 0 L 22 0 C 26 -24 24 -44 12 -58 Z" fill={FOX.shade} opacity={0.45} />
    <path d="M -15 -4 C -19 -30 -11 -54 0 -56 C 11 -54 19 -30 15 -4 Z" fill={FOX.cream} />
    <ellipse cx={-13} cy={-3} rx={10} ry={6.5} fill={FOX.dark} />
    <ellipse cx={13} cy={-3} rx={10} ry={6.5} fill={FOX.dark} />
    <path d="M -36 -90 L -44 -130 L -12 -106 Z" fill={FOX.body} stroke={FOX.body} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -33 -96 L -38 -121 L -20 -105 Z" fill={FOX.ear} />
    <path d="M 36 -90 L 44 -130 L 12 -106 Z" fill={FOX.body} stroke={FOX.body} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 33 -96 L 38 -121 L 20 -105 Z" fill={FOX.ear} />
    <path d="M -48 -86 C -48 -114 -26 -122 0 -122 C 26 -122 48 -114 48 -86 C 48 -68 26 -56 0 -52 C -26 -56 -48 -68 -48 -86 Z" fill={FOX.body} />
    <path d="M -46 -82 C -32 -80 -14 -74 0 -78 C 14 -74 32 -80 46 -82 C 42 -64 22 -54 0 -52 C -22 -54 -42 -64 -46 -82 Z" fill={FOX.cream} />
    <ellipse cx={-17} cy={-92} rx={5} ry={6.2} fill={FOX.eye} />
    <ellipse cx={17} cy={-92} rx={5} ry={6.2} fill={FOX.eye} />
    <circle cx={-15.4} cy={-94.2} r={1.9} fill="#FFFFFF" />
    <circle cx={18.6} cy={-94.2} r={1.9} fill="#FFFFFF" />
    <path d="M -7 -73 Q 0 -77 7 -73 Q 5 -67 0 -66 Q -5 -67 -7 -73 Z" fill={FOX.eye} />
    <path d="M -8 -62 Q 0 -57 8 -62" stroke={FOX.eye} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <circle cx={-30} cy={-76} r={6} fill={FOX.blush} opacity={0.55} />
    <circle cx={30} cy={-76} r={6} fill={FOX.blush} opacity={0.55} />
  </g>
);

// Лисёнок вернулся и тянет лапу к зайчонку (вид сбоку, мордой влево).
const FoxReach: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={14} cy={1} rx={58} ry={5} fill="rgba(60,80,30,0.16)" />
    {/* хвост */}
    <path d="M 46 -42 C 80 -42 106 -64 104 -94 C 102 -108 88 -112 82 -102 C 88 -82 76 -62 44 -58 Z" fill={FOX.body} />
    <path d="M 104 -94 C 102 -108 88 -112 82 -102 C 86 -96 88 -90 88 -84 C 94 -86 100 -89 104 -94 Z" fill={FOX.cream} />
    {/* дальние лапы */}
    <path d="M 38 -30 L 42 -2 L 50 -2 L 48 -30 Z" fill={FOX.shade} />
    <ellipse cx={46} cy={-2} rx={6} ry={3.5} fill={FOX.dark} />
    <path d="M -4 -32 L -6 -2 L 2 -2 L 4 -32 Z" fill={FOX.shade} />
    <ellipse cx={-2} cy={-2} rx={6} ry={3.5} fill={FOX.dark} />
    {/* туловище */}
    <path d="M -22 -42 C -20 -64 30 -68 52 -52 C 62 -42 58 -26 42 -24 C 22 -21 0 -21 -10 -25 C -18 -29 -23 -34 -22 -42 Z" fill={FOX.body} />
    <path d="M -16 -31 C -4 -25 20 -23 40 -26 C 32 -19 6 -19 -8 -23 Z" fill={FOX.cream} />
    <path d="M 20 -64 C 38 -62 56 -54 56 -40 C 50 -50 36 -58 18 -60 Z" fill="#FFFFFF" opacity={0.18} />
    {/* ближние лапы */}
    <path d="M 24 -32 C 22 -20 22 -8 24 0 L 34 0 C 34 -10 36 -22 40 -32 Z" fill={FOX.body} />
    <ellipse cx={29} cy={-2} rx={7.5} ry={4} fill={FOX.dark} />
    <path d="M -14 -32 C -14 -20 -14 -10 -12 0 L -3 0 C -4 -10 -3 -20 -2 -32 Z" fill={FOX.body} />
    <ellipse cx={-8} cy={-2} rx={7.5} ry={4} fill={FOX.dark} />
    {/* передняя лапа тянется к зайчонку */}
    <path d="M -8 -44 C -24 -44 -44 -48 -58 -54 L -61 -45 C -46 -38 -28 -33 -10 -32 Z" fill={FOX.body} />
    <ellipse cx={-62} cy={-50} rx={7.5} ry={5.5} fill={FOX.dark} transform="rotate(-22 -62 -50)" />
    {/* шея и голова: смотрит назад-влево, на зайчонка */}
    <path d="M -2 -72 C 4 -60 0 -48 -10 -40 L -24 -44 C -22 -54 -20 -64 -16 -70 Z" fill={FOX.body} />
    <path d="M -4 -86 L -2 -116 L -20 -92 Z" fill={FOX.shade} />
    <path d="M -8 -72 C -6 -94 -28 -102 -42 -94 C -50 -88 -58 -82 -72 -74 C -70 -66 -56 -62 -42 -60 C -24 -58 -10 -62 -8 -72 Z" fill={FOX.body} />
    <path d="M -72 -74 C -62 -68 -48 -66 -34 -64 C -26 -63 -18 -64 -11 -68 C -15 -58 -36 -56 -52 -60 C -62 -62 -68 -66 -72 -74 Z" fill={FOX.cream} />
    <path d="M -22 -94 L -34 -124 L -44 -92 Z" fill={FOX.body} stroke={FOX.body} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -26 -96 L -34 -116 L -40 -96 Z" fill={FOX.ear} />
    <ellipse cx={-42} cy={-80} rx={4.2} ry={5.2} fill={FOX.eye} />
    <circle cx={-40.8} cy={-82} r={1.6} fill="#FFFFFF" />
    <circle cx={-74} cy={-73} r={4.2} fill={FOX.eye} />
    <path d="M -64 -66 Q -58 -63 -53 -65" stroke={FOX.eye} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    <circle cx={-30} cy={-70} r={5} fill={FOX.blush} opacity={0.5} />
  </g>
);

// Зайчонок сидит на камне (мордой вправо), одно ухо поникло, лапки к лисёнку.
const BunnyCub: React.FC<{ readonly x: number; readonly y: number; readonly s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -58 C -8 -84 -2 -100 5 -97 C 11 -92 10 -74 7 -58 Z" fill={BN.body} />
    <path d="M 1.5 -62 C -3 -82 0 -92 4.5 -90 C 7 -86 7 -74 5 -62 Z" fill={BN.ear} />
    <path d="M 12 -58 C 22 -78 34 -86 37 -80 C 38 -74 28 -64 17 -55 Z" fill={BN.body} />
    <path d="M 14 -59 C 22 -74 31 -80 33 -77 C 33 -73 26 -66 18 -58 Z" fill={BN.ear} />
    <ellipse cx={0} cy={-21} rx={21} ry={20} fill={BN.body} />
    <path d="M 12 -37 C 24 -26 22 -8 10 -2 C 17 -12 18 -26 12 -37 Z" fill={BN.shade} />
    <circle cx={-20} cy={-14} r={7} fill="#FFFFFF" />
    <ellipse cx={8} cy={-3} rx={13} ry={5} fill={BN.shade} />
    <circle cx={9} cy={-46} r={15.5} fill={BN.body} />
    <path d="M 0 -58 C 6 -62 14 -62 20 -58" stroke="#FFFFFF" strokeWidth={3} opacity={0.6} fill="none" strokeLinecap="round" />
    <circle cx={16} cy={-48} r={2.9} fill={BN.eye} />
    <circle cx={17} cy={-49.2} r={1} fill="#FFFFFF" />
    <path d="M 12.5 -54.5 Q 16 -56.5 19.5 -54" stroke={BN.eye} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    <ellipse cx={23.8} cy={-43} rx={2.4} ry={1.8} fill={BN.nose} />
    <circle cx={14} cy={-40} r={3.6} fill={FOX.blush} opacity={0.45} />
    <ellipse cx={20} cy={-27} rx={7.5} ry={4.4} fill={BN.body} stroke={BN.shade} strokeWidth={1.2} transform="rotate(-28 20 -27)" />
  </g>
);

// ---------- Иллюстрация разворота 1 (600 × 444, без текста) ----------
const ART = { w: 600, h: 444 } as const;
const ArtPicture: React.FC<{ readonly id: string }> = ({ id }) => {
  const prints: readonly P[] = [
    { x: 590, y: 318 },
    { x: 566, y: 334 },
    { x: 546, y: 346 },
    { x: 524, y: 360 },
    { x: 504, y: 372 },
  ];
  return (
    <g>
      <defs>
        <clipPath id={`${id}pc`}>
          <rect x={0} y={0} width={ART.w} height={ART.h} rx={24} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}pc)`}>
        <rect x={0} y={0} width={ART.w} height={ART.h} fill="#FFF2DC" />
        <circle cx={96} cy={78} r={92} fill="#FFE9B4" opacity={0.7} />
        <circle cx={96} cy={78} r={36} fill="#FFD983" />
        <path d="M 0 196 Q 140 128 300 172 Q 450 120 600 160 L 600 280 L 0 280 Z" fill="#D5E4BC" />
        <path d="M 0 232 Q 300 196 600 224 L 600 444 L 0 444 Z" fill="#BCD49C" />
        <path d="M 0 300 Q 120 284 170 300 L 150 444 L 0 444 Z" fill="#B2CC92" />
        {/* ручей */}
        <path d="M 118 222 C 190 256 108 300 158 346 C 194 380 168 412 188 444 L 344 444 C 322 410 350 376 314 338 C 264 290 332 252 252 216 Z" fill="#9FCDE2" />
        <path d="M 252 216 C 332 252 264 290 314 338 C 350 376 322 410 344 444 L 330 444 C 308 410 334 378 300 340 C 252 292 316 254 240 218 Z" fill="#88BFD8" />
        <path d="M 160 250 Q 176 244 192 250 M 150 300 Q 166 294 182 300 M 266 300 Q 282 294 298 300 M 196 420 Q 212 414 228 420 M 288 424 Q 304 418 320 424" stroke="#D6EDF6" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* камень и зайчонок */}
        <ellipse cx={240} cy={390} rx={78} ry={16} fill="none" stroke="#D6EDF6" strokeWidth={4} />
        <ellipse cx={240} cy={374} rx={54} ry={22} fill="#B7B0A6" />
        <ellipse cx={226} cy={365} rx={30} ry={9} fill="#CEC8BF" />
        <BunnyCub x={236} y={366} s={1.25} />
        {/* следы лисёнка: он шёл вправо и вернулся */}
        {prints.map((p, i) => (
          <g key={i} opacity={0.55 - i * 0.04} transform={`translate(${p.x} ${p.y}) rotate(-30)`}>
            <ellipse cx={0} cy={0} rx={5} ry={6.5} fill="#8DAA6E" />
            <circle cx={-5} cy={-8} r={2.2} fill="#8DAA6E" />
            <circle cx={1} cy={-10} r={2.2} fill="#8DAA6E" />
            <circle cx={6} cy={-6} r={2.2} fill="#8DAA6E" />
          </g>
        ))}
        <FoxReach x={420} y={392} s={1.35} />
        {/* камыш и цветы */}
        <path d="M 40 444 Q 44 380 36 330 M 58 444 Q 60 390 70 344 M 76 444 Q 80 400 92 366" stroke="#7FA068" strokeWidth={6} fill="none" strokeLinecap="round" />
        <ellipse cx={36} cy={334} rx={6} ry={16} fill="#A07650" />
        <ellipse cx={70} cy={348} rx={6} ry={15} fill="#A07650" />
        {[
          { x: 520, y: 412 },
          { x: 556, y: 396 },
          { x: 470, y: 428 },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={7} fill="#FFFFFF" />
            <circle cx={p.x} cy={p.y} r={3} fill={C.yellow} />
          </g>
        ))}
      </g>
    </g>
  );
};

// Раскладка страницы (в долях ширины страницы w; высота страницы 1.3 w).
const PAGE_ASPECT = 1.3;
const ART_BOX = { u: 0.08, t: 0.09, w: 0.84 };
const ART_LINES: readonly (readonly [number, number])[] = [
  [0.84, 0.84],
  [0.94, 0.78],
  [1.04, 0.84],
  [1.14, 0.52],
];
const LINE_TH = 0.034;
const LINE_C = "#DCD3C4";

// Страница разворота 1: картинка и 4 абстрактные строки. <g>, левый верхний
// угол страницы — (0, 0), ширина w, высота 1.3 w.
export const PageArt: React.FC<{ readonly w: number; readonly paper?: boolean }> = ({ w, paper = false }) => {
  const id = useUid("pa");
  const s = (ART_BOX.w * w) / ART.w;
  return (
    <g>
      {paper ? <rect x={0} y={0} width={w} height={w * PAGE_ASPECT} rx={w * 0.02} fill={BOOK.page} /> : null}
      <g transform={`translate(${ART_BOX.u * w} ${ART_BOX.t * w}) scale(${s})`}>
        <ArtPicture id={id} />
      </g>
      {ART_LINES.map(([t, len], i) => (
        <rect key={i} x={ART_BOX.u * w} y={(t - LINE_TH / 2) * w} width={len * w} height={LINE_TH * w} rx={(LINE_TH * w) / 2} fill={LINE_C} />
      ))}
    </g>
  );
};

// ---------- Обложка ----------
const TITLE_C = "#A94C36";
const CoverArt: React.FC<{ readonly w: number; readonly id: string; readonly title: boolean }> = ({ w, id, title }) => {
  const h = w * 1.3;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const r = w * 0.045;
  const sp = w * 0.09;
  const detail = w >= 110;
  const cx = x0 + sp + (w - sp) / 2;
  const words = EL_TEXT.book.title.split(" ");
  const band = { x: x0 + sp + w * 0.07, y: y0 + h * 0.07, w: w - sp - w * 0.14, h: h * 0.22 };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}cv`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.2} />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="1" stopColor="#7A3424" stopOpacity={0.14} />
        </linearGradient>
        <clipPath id={`${id}cc`}>
          <rect x={x0} y={y0} width={w} height={h} rx={r} />
        </clipPath>
      </defs>
      {/* блок страниц виден справа и снизу */}
      <rect x={x0 + w * 0.02} y={y0 + w * 0.028} width={w} height={h} rx={r} fill={BOOK.edge} />
      {detail ? <path d={`M ${x0 + w * 1.006} ${y0 + h * 0.06} L ${x0 + w * 1.006} ${y0 + h * 0.98} M ${x0 + w * 0.06} ${y0 + h + w * 0.014} L ${x0 + w * 0.97} ${y0 + h + w * 0.014}`} stroke="#E0D0B4" strokeWidth={Math.max(1, w * 0.004)} /> : null}
      <g clipPath={`url(#${id}cc)`}>
        <rect x={x0} y={y0} width={w} height={h} fill={BOOK.cover} />
        <circle cx={cx + w * 0.06} cy={y0 + h * 0.58} r={w * 0.31} fill="#F2A487" opacity={0.7} />
        <path d={`M ${x0} ${y0 + h * 0.8} Q ${cx} ${y0 + h * 0.69} ${x0 + w} ${y0 + h * 0.77} L ${x0 + w} ${y0 + h} L ${x0} ${y0 + h} Z`} fill="#F5B993" />
        <path d={`M ${x0} ${y0 + h * 0.9} Q ${cx + w * 0.2} ${y0 + h * 0.84} ${x0 + w} ${y0 + h * 0.9} L ${x0 + w} ${y0 + h} L ${x0} ${y0 + h} Z`} fill="#F0A983" opacity={0.7} />
        <FoxFront x={cx} y={y0 + h * 0.79} s={w * 0.0042} />
        {detail
          ? [
              [0.2, 0.42, 0.012],
              [0.86, 0.36, 0.01],
              [0.78, 0.6, 0.008],
              [0.24, 0.62, 0.008],
            ].map(([u, t, rr], i) => <circle key={i} cx={x0 + w * u} cy={y0 + h * t} r={w * rr} fill={BOOK.band} opacity={0.85} />)
          : null}
        <rect x={x0} y={y0} width={w} height={h} fill={`url(#${id}cv)`} />
        {/* корешок и бороздка */}
        <rect x={x0} y={y0} width={sp} height={h} fill={BOOK.spine} />
        <rect x={x0 + sp} y={y0} width={w * 0.014} height={h} fill={BOOK.coverShade} opacity={0.8} />
        <rect x={x0 + sp + w * 0.014} y={y0} width={w * 0.006} height={h} fill="#FFFFFF" opacity={0.22} />
        <rect x={x0 + w * 0.02} y={y0} width={w * 0.012} height={h} fill="#FFFFFF" opacity={0.14} />
      </g>
      {/* плашка с названием */}
      <rect x={band.x} y={band.y} width={band.w} height={band.h} rx={w * 0.045} fill={BOOK.band} />
      {title ? (
        words.map((wd, i) => (
          <text key={i} x={band.x + band.w / 2} y={band.y + band.h * (0.44 + i * 0.36)} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={w * 0.1} fill={TITLE_C} letterSpacing={w * 0.002}>
            {wd}
          </text>
        ))
      ) : (
        <>
          <rect x={band.x + band.w * 0.14} y={band.y + band.h * 0.26} width={band.w * 0.72} height={band.h * 0.17} rx={band.h * 0.085} fill={TITLE_C} opacity={0.75} />
          <rect x={band.x + band.w * 0.24} y={band.y + band.h * 0.6} width={band.w * 0.52} height={band.h * 0.17} rx={band.h * 0.085} fill={TITLE_C} opacity={0.75} />
        </>
      )}
    </g>
  );
};

// Закрытая книга в SVG-координатах: центр (0, 0), ширина w, высота 1.3 w,
// обложкой к камере. Название читается от w ≥ 200 (меньше — полоски);
// title: true — название и на маленькой книге (крупный план камеры).
export const BookClosedArt: React.FC<{ readonly w: number; readonly tilt?: number; readonly title?: boolean }> = ({ w, tilt = 0, title }) => {
  const id = useUid("bc");
  return (
    <g transform={`rotate(${tilt})`}>
      <CoverArt w={w} id={id} title={title ?? w >= 200} />
    </g>
  );
};

// Подробная обложка с читаемым названием и мягкой тенью; (x, y) — центр.
export const BookCover: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly tilt?: number }> = ({ x, y, w, tilt = 0 }) => {
  const id = useUid("bv");
  const h = w * 1.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <defs>
        <filter id={`${id}sh`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={w * 0.03} />
        </filter>
      </defs>
      <rect x={-w / 2 + w * 0.05} y={-h / 2 + w * 0.08} width={w} height={h} rx={w * 0.05} fill="rgba(60,35,20,0.28)" filter={`url(#${id}sh)`} />
      <CoverArt w={w} id={id} title />
    </g>
  );
};

// ---------- Раскрытая книга ----------
// Геометрия: (x, y) — середина корешка, w — ширина разворота. Страница:
// PW = w/2, высота PH = 1.3 PW · FY (вид спереди-сверху). Поверхность
// страницы — профиль α(s) (подъём от корешка), подъём z проецируется
// вверх с коэффициентом LZ. Перелистывание: лист поворачивается вокруг
// корешка, угол ведёт правый нижний угол (за него берётся рука).
const FY = 0.86; // по умолчанию: вид спереди-сверху (≈ 60° над столом)
const A0 = 1.25; // наклон страницы у корешка, рад
const S0K = 0.075; // ширина подъёма от корешка (доля PW)
const B0 = 0.1; // мягкий спуск к внешнему краю

// FY — вертикальное сжатие страницы (sin угла взгляда), LZ — сколько подъём
// над столом поднимает точку в кадре (cos угла).
type Geo = { readonly PW: number; readonly PH: number; readonly S0: number; readonly FY: number; readonly LZ: number };
type Sheet = { readonly theta: number; readonly lead: number; readonly kappa: number };
const geo = (w: number, fy = FY): Geo => ({ PW: w / 2, PH: (w / 2) * PAGE_ASPECT * fy, S0: (w / 2) * S0K, FY: fy, LZ: Math.sqrt(1 - Math.min(0.98, fy) ** 2) });
const REST_R: Sheet = { theta: 0, lead: 0, kappa: 1 };
const REST_L: Sheet = { theta: Math.PI, lead: 0, kappa: -1 };

const alphaAt = (g: Geo, sh: Sheet, s: number, v: number) =>
  clamp(sh.theta + sh.lead * Math.pow(s / g.PW, 1.5) * (0.55 + 0.45 * (v / g.PH)), 0, Math.PI) + sh.kappa * (A0 * Math.exp(-s / g.S0) - B0 * Math.pow(s / g.PW, 1.2));

// Точка листа (s — от корешка по странице, v — от верхнего края) →
// локальные координаты (начало — середина корешка).
const sheetPoint = (g: Geo, sh: Sheet, s: number, v: number, zx = 0): P => {
  const n = Math.max(2, Math.ceil((s / g.PW) * 22));
  const ds = s / n;
  let x = 0;
  let z = 0;
  for (let i = 0; i < n; i++) {
    const a = alphaAt(g, sh, (i + 0.5) * ds, v);
    x += Math.cos(a) * ds;
    z += Math.sin(a) * ds;
  }
  return { x: x + z * zx, y: v - g.PH / 2 - z * g.LZ * (1 - zx * 0.6) };
};

const sheetRow = (g: Geo, sh: Sheet, v: number, n: number) => {
  const ds = g.PW / n;
  const pts: P[] = [{ x: 0, y: v - g.PH / 2 }];
  const zs: number[] = [0];
  const al: number[] = [];
  let x = 0;
  let z = 0;
  for (let i = 0; i < n; i++) {
    const a = alphaAt(g, sh, (i + 0.5) * ds, v);
    al.push(a);
    x += Math.cos(a) * ds;
    z += Math.sin(a) * ds;
    pts.push({ x, y: v - g.PH / 2 - z * g.LZ });
    zs.push(z);
  }
  return { pts, zs, al };
};

const dPoly = (pts: readonly P[]) => `${pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")} Z`;

const sheetOutline = (g: Geo, sh: Sheet): P[] => {
  const n = 22;
  const top = sheetRow(g, sh, 0, n).pts;
  const bot = sheetRow(g, sh, g.PH, n).pts;
  const side: P[] = [];
  for (let j = 1; j < 6; j++) side.push(sheetPoint(g, sh, g.PW, (g.PH * j) / 6));
  return [...top, ...side, ...bot.slice().reverse()];
};

// ---------- Содержимое страниц (доли ширины страницы: u 0..1, t 0..1.3) ----------
type Prim =
  | { readonly k: "line"; readonly u0: number; readonly u1: number; readonly t: number; readonly th?: number; readonly c?: string }
  | { readonly k: "rrect"; readonly u0: number; readonly u1: number; readonly t0: number; readonly t1: number; readonly r: number; readonly c: string }
  | { readonly k: "disc"; readonly u: number; readonly t: number; readonly r: number; readonly c: string }
  | { readonly k: "poly"; readonly pts: readonly (readonly [number, number])[]; readonly c: string };

const arc = (cu: number, ct: number, r: number, a0: number, a1: number, n = 5) => Array.from({ length: n + 1 }, (_, i) => [cu + r * Math.cos(a0 + ((a1 - a0) * i) / n), ct + r * Math.sin(a0 + ((a1 - a0) * i) / n)] as const);
const H = Math.PI / 2;
const primOutline = (p: Prim): (readonly [number, number])[] => {
  if (p.k === "line") {
    const r = (p.th ?? LINE_TH) / 2;
    return [...arc(p.u1 - r, p.t, r, -H, H), ...arc(p.u0 + r, p.t, r, H, 3 * H)];
  }
  if (p.k === "rrect") {
    const { u0, u1, t0, t1, r } = p;
    const edge = (a: readonly [number, number], b: readonly [number, number]) => Array.from({ length: 5 }, (_, i) => [lerp(a[0], b[0], i / 5), lerp(a[1], b[1], i / 5)] as const);
    return [
      ...edge([u0 + r, t0], [u1 - r, t0]),
      ...arc(u1 - r, t0 + r, r, -H, 0),
      ...edge([u1, t0 + r], [u1, t1 - r]),
      ...arc(u1 - r, t1 - r, r, 0, H),
      ...edge([u1 - r, t1], [u0 + r, t1]),
      ...arc(u0 + r, t1 - r, r, H, 2 * H),
      ...edge([u0, t1 - r], [u0, t0 + r]),
      ...arc(u0 + r, t0 + r, r, 2 * H, 3 * H),
    ];
  }
  if (p.k === "disc") return arc(p.u, p.t, p.r, 0, 4 * H, 16);
  const out: (readonly [number, number])[] = [];
  p.pts.forEach((a, i) => {
    const b = p.pts[(i + 1) % p.pts.length];
    for (let k = 0; k < 4; k++) out.push([lerp(a[0], b[0], k / 4), lerp(a[1], b[1], k / 4)]);
  });
  return out;
};
const primColor = (p: Prim) => (p.k === "line" ? (p.c ?? LINE_C) : p.c);

const lines = (t0: number, step: number, lens: readonly number[], u0 = 0.09): Prim[] => lens.map((len, i) => ({ k: "line", u0, u1: u0 + len, t: t0 + i * step }));

// Разворот 0, правая страница (лицевая сторона перелистываемого листа):
// картинка-заставка (лисёнок идёт по тропинке) и строки.
const S0_RIGHT: readonly Prim[] = [
  { k: "rrect", u0: 0.09, u1: 0.91, t0: 0.1, t1: 0.6, r: 0.04, c: "#FDEBD3" },
  { k: "disc", u: 0.24, t: 0.22, r: 0.06, c: "#FFDB8C" },
  { k: "poly", pts: [[0.09, 0.47], [0.3, 0.41], [0.55, 0.45], [0.91, 0.39], [0.91, 0.56], [0.87, 0.6], [0.13, 0.6], [0.09, 0.56]], c: "#C7DAA9" },
  { k: "line", u0: 0.2, u1: 0.84, t: 0.53, th: 0.02, c: "#E8D3A8" },
  { k: "disc", u: 0.6, t: 0.46, r: 0.034, c: FOX.body },
  { k: "disc", u: 0.645, t: 0.425, r: 0.026, c: FOX.body },
  { k: "poly", pts: [[0.635, 0.405], [0.645, 0.37], [0.66, 0.405]], c: FOX.body },
  { k: "disc", u: 0.548, t: 0.44, r: 0.022, c: FOX.body },
  { k: "disc", u: 0.533, t: 0.43, r: 0.012, c: FOX.cream },
  ...lines(0.72, 0.085, [0.82, 0.76, 0.82, 0.8, 0.46]),
];

// Разворот 1, левая страница (оборот листа): строки с буквицей и виньетка.
const S1_LEFT: readonly Prim[] = [
  { k: "rrect", u0: 0.09, u1: 0.2, t0: 0.1, t1: 0.235, r: 0.02, c: "#F2B79E" },
  ...lines(0.12, 0.09, [0.58, 0.58], 0.24),
  ...lines(0.3, 0.09, [0.82, 0.78, 0.82, 0.6, 0.82, 0.8, 0.4]),
  { k: "disc", u: 0.42, t: 1.02, r: 0.014, c: "#EDB49A" },
  { k: "disc", u: 0.5, t: 1.02, r: 0.014, c: "#EDB49A" },
  { k: "disc", u: 0.58, t: 1.02, r: 0.014, c: "#EDB49A" },
];

// Разворот 1, правая страница: строки под картинкой (картинка — PageArt).
const S1_RIGHT_LINES: readonly Prim[] = ART_LINES.map(([t, len]) => ({ k: "line", u0: ART_BOX.u, u1: ART_BOX.u + len, t }));

// Отрисовка примитивов через поверхность листа. side "r" — страница справа
// от корешка (u = 0 у корешка), "l" — слева (u = 0 у внешнего края).
const Warped: React.FC<{ readonly g: Geo; readonly sh: Sheet; readonly side: "r" | "l"; readonly prims: readonly Prim[] }> = ({ g, sh, side, prims }) => (
  <g>
    {prims.map((p, i) => {
      const pts = primOutline(p).map(([u, t]) => sheetPoint(g, sh, (side === "r" ? u : 1 - u) * g.PW, t * g.PW * g.FY));
      return <path key={i} d={dPoly(pts)} fill={primColor(p)} />;
    })}
  </g>
);

// Аффинная укладка картинок (без деформации) на плоскую часть страницы:
// местные координаты страницы (ax от левого края, ay сверху, ширина PW)
// → локальные координаты книги; наклон k повторяет спуск страницы.
const flatMatrix = (g: Geo, side: "r" | "l") => {
  const s1 = g.PW * 0.12;
  const s2 = g.PW * 0.9;
  const p1 = sheetPoint(g, REST_R, s1, 0);
  const p2 = sheetPoint(g, REST_R, s2, 0);
  const k = (p2.y - p1.y) / (s2 - s1);
  const dx = (p1.x - s1 + p2.x - s2) / 2;
  const y0 = p1.y - k * s1;
  return side === "r" ? `matrix(1 ${k} 0 ${g.FY} ${dx} ${y0})` : `matrix(1 ${-k} 0 ${g.FY} ${-g.PW - dx} ${y0 + k * g.PW})`;
};

// Титульная страница (разворот 0, слева): лисёнок и название.
const TitlePage: React.FC<{ readonly g: Geo }> = ({ g }) => {
  const words = EL_TEXT.book.title.split(" ");
  const pw = g.PW;
  return (
    <g transform={flatMatrix(g, "l")}>
      <circle cx={pw * 0.5} cy={pw * 0.42} r={pw * 0.25} fill="#FCE3D2" />
      <FoxFront x={pw * 0.5} y={pw * 0.62} s={pw * 0.0032} />
      <path d={`M ${pw * 0.24} ${pw * 0.62} Q ${pw * 0.5} ${pw * 0.58} ${pw * 0.76} ${pw * 0.62}`} stroke="#E9C9AE" strokeWidth={pw * 0.012} fill="none" strokeLinecap="round" />
      {words.map((wd, i) => (
        <text key={i} x={pw * 0.5} y={pw * (0.84 + i * 0.13)} textAnchor="middle" fontFamily={F.text} fontWeight={900} fontSize={pw * 0.105} fill={TITLE_C}>
          {wd}
        </text>
      ))}
      <rect x={pw * 0.42} y={pw * 1.09} width={pw * 0.16} height={pw * 0.018} rx={pw * 0.009} fill={LINE_C} />
    </g>
  );
};

// Картинка разворота 1 (справа) без деформации.
const ArtPlaced: React.FC<{ readonly g: Geo }> = ({ g }) => {
  const id = useUid("ap");
  const s = (ART_BOX.w * g.PW) / ART.w;
  return (
    <g transform={flatMatrix(g, "r")}>
      <g transform={`translate(${ART_BOX.u * g.PW} ${ART_BOX.t * g.PW}) scale(${s})`}>
        <ArtPicture id={id} />
      </g>
    </g>
  );
};

const turnSheet = (turn: number): Sheet => {
  const t = clamp(turn);
  const peel = easeInOut(t / 0.2);
  const u = easeInOut((t - 0.2) / 0.8);
  const theta = lerp(0.1 * peel, Math.PI, u);
  const lead = 0.95 * peel * (1 - u * u * (3 - 2 * u));
  return { theta, lead, kappa: Math.cos(theta) };
};

const rotP = (p: P, deg: number): P => {
  const a = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
};

export type OpenBookGeom = { readonly x: number; readonly y: number; readonly w: number; readonly tilt?: number; readonly fy?: number };

// Правый нижний угол перелистываемого листа (мировые координаты) — сюда
// сцена ставит пальцы. turn = 0 — угол правой страницы.
export const openBookCorner = (b: OpenBookGeom, turn: number): P => {
  const g = geo(b.w, b.fy);
  const p = rotP(sheetPoint(g, turnSheet(turn), g.PW, g.PH), b.tilt ?? 0);
  return { x: b.x + p.x, y: b.y + p.y };
};

// Закладка: полоска у корешка, торчит над верхним краем страниц.
const bookmarkRect = (g: Geo, bookmark: number) => {
  const k = easeOut(clamp(bookmark));
  const w = g.PW * 0.075;
  const top = -g.PH / 2 - g.PH * 0.2 - (1 - k) * g.PH * 0.55;
  return { x: g.PW * 0.022 - w / 2, y: top, w, h: g.PH * 0.82, rot: (1 - k) * -7, opacity: clamp(bookmark / 0.12) };
};

// Верхний конец закладки (мировые координаты) — сюда сцена ставит пальцы.
export const openBookBookmarkTip = (b: OpenBookGeom, bookmark = 1): P => {
  const g = geo(b.w, b.fy);
  const r = bookmarkRect(g, bookmark);
  const c = { x: r.x + r.w / 2, y: r.y + r.w * 0.6 };
  const rr = rotP(c, r.rot);
  const p = rotP({ x: rr.x, y: rr.y }, b.tilt ?? 0);
  return { x: b.x + p.x, y: b.y + p.y };
};

export const OpenBook: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly turn?: number; // 0..1: лист переворачивается с разворота 0 на разворот 1
  readonly spread?: 0 | 1; // какой разворот лежит открытым (при turn = 0)
  readonly bookmark?: number; // 0..1: закладка входит сверху между страницами
  readonly tilt?: number; // градусы
  readonly shadow?: boolean;
  readonly fy?: number; // 0.6…0.98: сжатие по вертикали (больше — вид сверху)
}> = ({ x, y, w, turn = 0, spread = 0, bookmark = 0, tilt = 0, shadow = true, fy = FY }) => {
  const id = useUid("ob");
  const g = geo(w, fy);
  const { PW, PH } = g;
  const turning = turn > 0 && turn < 1;
  const shown: 0 | 1 = turn >= 1 ? 1 : turn > 0 ? 0 : spread;
  const rightShown: 0 | 1 = turning ? 1 : shown;
  const rim = PW * 0.022;

  const outR = sheetOutline(g, REST_R);
  const outL = sheetOutline(g, REST_L);
  const botR = sheetRow(g, REST_R, PH, 22);
  const botL = sheetRow(g, REST_L, PH, 22);
  const band = (b: ReturnType<typeof sheetRow>) => {
    const base = b.pts.map((p) => ({ x: p.x, y: PH / 2 }));
    const mid = (k: number) => b.pts.map((p) => ({ x: p.x, y: lerp(p.y, PH / 2, k) }));
    return { poly: [...b.pts, ...base.slice().reverse()], l1: mid(0.35), l2: mid(0.7) };
  };
  const bandR = band(botR);
  const bandL = band(botL);
  const dLine = (pts: readonly P[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // перелистываемый лист: сетка четырёхугольников, лицо/оборот по углу
  let sheetEls: React.ReactNode = null;
  let shadowEl: React.ReactNode = null;
  if (turning) {
    const sh = turnSheet(turn);
    const NS = 16;
    const NV = 6;
    const rows = Array.from({ length: NV + 1 }, (_, j) => sheetRow(g, sh, (PH * j) / NV, NS));
    let front = "";
    let back = "";
    const quads: React.ReactNode[] = [];
    for (let j = 0; j < NV; j++) {
      for (let i = 0; i < NS; i++) {
        const q = [rows[j].pts[i], rows[j].pts[i + 1], rows[j + 1].pts[i + 1], rows[j + 1].pts[i]];
        const a = (rows[j].al[i] + rows[j + 1].al[i]) / 2;
        const isFront = a < Math.PI / 2;
        const I = isFront ? 0.55 * Math.sin(a) + 0.83 * Math.cos(a) : -0.55 * Math.sin(a) - 0.83 * Math.cos(a);
        const col = mix(BOOK.page, "#D3C5AC", clamp((0.83 - I) / 1.25));
        const d = dPoly(q);
        if (isFront) front += d;
        else back += d;
        quads.push(<path key={`${i}-${j}`} d={d} fill={col} stroke={col} strokeWidth={0.7} />);
      }
    }
    const outline = sheetOutline(g, sh);
    sheetEls = (
      <g>
        <defs>
          <clipPath id={`${id}f`}>
            <path d={front || "M 0 0 Z"} />
          </clipPath>
          <clipPath id={`${id}b`}>
            <path d={back || "M 0 0 Z"} />
          </clipPath>
        </defs>
        <path d={dPoly(outline)} fill={mix(BOOK.page, "#D3C5AC", 0.15)} />
        {quads}
        <g clipPath={`url(#${id}f)`}>
          <Warped g={g} sh={sh} side="r" prims={S0_RIGHT} />
        </g>
        <g clipPath={`url(#${id}b)`} opacity={0.9}>
          <Warped g={g} sh={sh} side="l" prims={S1_LEFT} />
        </g>
        <path d={dPoly(outline)} fill="none" stroke="#E2D6C2" strokeWidth={1.6} strokeLinejoin="round" />
      </g>
    );
    const k = Math.sin(sh.theta) * 0.9 + 0.1 * sh.lead;
    const foot: P[] = [];
    for (let i = 0; i <= 12; i++) foot.push(sheetPoint(g, sh, (PW * i) / 12, 0, 0.5));
    for (let j = 1; j < 4; j++) foot.push(sheetPoint(g, sh, PW, (PH * j) / 4, 0.5));
    for (let i = 12; i >= 0; i--) foot.push(sheetPoint(g, sh, (PW * i) / 12, PH, 0.5));
    shadowEl = (
      <g clipPath={`url(#${id}pages)`}>
        <path d={dPoly(foot)} fill="rgba(90,60,30,0.9)" opacity={0.2 * clamp(k)} filter={`url(#${id}blur)`} />
      </g>
    );
  }

  const bm = bookmarkRect(g, bookmark);
  const gutterW = PW * 0.2;

  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <defs>
        <filter id={`${id}blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={PW * 0.025} />
        </filter>
        <filter id={`${id}sh`} x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation={PW * 0.04} />
        </filter>
        <linearGradient id={`${id}gr`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={gutterW} y2={0}>
          <stop offset="0" stopColor="#7A5A3A" stopOpacity={0.3} />
          <stop offset="0.35" stopColor="#7A5A3A" stopOpacity={0.1} />
          <stop offset="1" stopColor="#7A5A3A" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}gl`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={-gutterW} y2={0}>
          <stop offset="0" stopColor="#7A5A3A" stopOpacity={0.3} />
          <stop offset="0.35" stopColor="#7A5A3A" stopOpacity={0.1} />
          <stop offset="1" stopColor="#7A5A3A" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}lt`} gradientUnits="userSpaceOnUse" x1={-PW} y1={-PH / 2} x2={PW} y2={PH / 2}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="1" stopColor="#8A6A44" stopOpacity={0.1} />
        </linearGradient>
        <clipPath id={`${id}pages`}>
          <path d={`${dPoly(outR)} ${dPoly(outL)}`} />
        </clipPath>
      </defs>

      {shadow ? <rect x={-PW - rim} y={-PH / 2} width={(PW + rim) * 2} height={PH + rim * 3} rx={rim * 2} fill="rgba(50,30,15,0.35)" transform={`translate(${PW * 0.04} ${PW * 0.06})`} filter={`url(#${id}sh)`} /> : null}

      {/* обложка (снизу, чуть шире блока) */}
      <rect x={-PW - rim} y={-PH / 2 - rim * 0.6} width={(PW + rim) * 2} height={PH + rim * 2.2} rx={rim * 1.2} fill={BOOK.coverShade} />
      <rect x={-PW - rim} y={-PH / 2 - rim * 0.6} width={(PW + rim) * 2} height={PH + rim * 1.6} rx={rim * 1.2} fill={BOOK.cover} />
      <rect x={-rim * 0.9} y={PH / 2 - rim} width={rim * 1.8} height={rim * 2.6} rx={rim * 0.6} fill={BOOK.spine} />

      {/* толщина блока страниц */}
      {[bandR, bandL].map((b, i) => (
        <g key={i}>
          <path d={dPoly(b.poly)} fill={BOOK.edge} />
          <path d={`${dLine(b.l1)} ${dLine(b.l2)}`} stroke="#E0D0B4" strokeWidth={1.4} fill="none" />
        </g>
      ))}

      {/* страницы */}
      <path d={dPoly(outL)} fill={BOOK.page} />
      <path d={dPoly(outR)} fill={BOOK.page} />
      {shown === 0 ? <TitlePage g={g} /> : <Warped g={g} sh={REST_L} side="l" prims={S1_LEFT} />}
      {rightShown === 0 ? (
        <Warped g={g} sh={REST_R} side="r" prims={S0_RIGHT} />
      ) : (
        <>
          <ArtPlaced g={g} />
          <Warped g={g} sh={REST_R} side="r" prims={S1_RIGHT_LINES} />
        </>
      )}

      {/* закладка: жёлтая бумажная полоска */}
      {bookmark > 0 ? (
        <g opacity={bm.opacity} transform={`rotate(${bm.rot} ${bm.x + bm.w / 2} ${bm.y})`}>
          <rect x={bm.x + bm.w * 0.25} y={bm.y + bm.w * 0.3} width={bm.w} height={bm.h} rx={bm.w * 0.12} fill="rgba(90,60,30,0.22)" filter={`url(#${id}blur)`} />
          <rect x={bm.x} y={bm.y} width={bm.w} height={bm.h} rx={bm.w * 0.1} fill={BOOK.bookmark} />
          <rect x={bm.x + bm.w * 0.78} y={bm.y} width={bm.w * 0.22} height={bm.h} rx={bm.w * 0.08} fill="#E9B83A" opacity={0.6} />
          <rect x={bm.x + bm.w * 0.12} y={bm.y + bm.w * 0.15} width={bm.w * 0.14} height={bm.h * 0.9} rx={bm.w * 0.07} fill="#FFFFFF" opacity={0.35} />
        </g>
      ) : null}

      {/* корешок: тень в сгибе, свет сверху-слева */}
      <g clipPath={`url(#${id}pages)`}>
        <rect x={0} y={-PH} width={gutterW} height={PH * 2} fill={`url(#${id}gr)`} />
        <rect x={-gutterW} y={-PH} width={gutterW} height={PH * 2} fill={`url(#${id}gl)`} />
        <rect x={-PW * 1.1} y={-PH} width={PW * 2.2} height={PH * 2} fill={`url(#${id}lt)`} />
      </g>
      <path d={`M 0 ${-PH / 2} L 0 ${PH / 2}`} stroke="rgba(110,80,50,0.4)" strokeWidth={Math.max(1.5, PW * 0.004)} />

      {shadowEl}
      {sheetEls}
    </g>
  );
};

// ---------- Крупный план книги во весь кадр (сц. 7, 14) ----------
// Разворот крупно: правая страница целиком в кадре, левая уходит за край.
export const CLOSEUP_BOOK = { x: 252, y: 990, w: 1640, tilt: -2, fy: 0.95 } as const;
export const closeUpCorner = (turn: number) => openBookCorner(CLOSEUP_BOOK, turn);
export const closeUpBookmarkTip = (bookmark = 1) => openBookBookmarkTip(CLOSEUP_BOOK, bookmark);
// Центр правой страницы (для PageGlow и камеры).
export const CLOSEUP_PAGE_CENTER = { x: CLOSEUP_BOOK.x + CLOSEUP_BOOK.w * 0.25, y: CLOSEUP_BOOK.y - 20 } as const;

export const BookCloseUp: React.FC<{
  readonly turn?: number;
  readonly bookmark?: number;
  readonly warm?: number; // 0 — день, 1 — вечер (тёплая лампа)
  readonly spread?: 0 | 1;
  readonly surface?: string; // цвет ткани под книгой (по умолчанию тёмная юбка воспитателя)
}> = ({ turn = 0, bookmark = 0, warm = 0, spread = 1, surface = "#3D3F4F" }) => {
  const b = CLOSEUP_BOOK;
  const wm = clamp(warm);
  return (
    <div style={box({ inset: 0, overflow: "hidden" })}>
      <div style={box({ inset: 0, backgroundColor: surface })} />
      <div style={box({ inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.12) 60%, rgba(255,255,255,0.05) 75%, rgba(0,0,0,0.16) 100%)" })} />
      <div style={box({ inset: 0, background: "radial-gradient(ellipse 75% 22% at 50% 0%, rgba(142,106,126,0.85), rgba(142,106,126,0) 100%)" })} />
      <div style={box({ inset: 0, background: "radial-gradient(ellipse 70% 45% at 55% 50%, rgba(255,240,215,0.16), rgba(0,0,0,0) 70%)" })} />
      <Svg>
        <OpenBook x={b.x} y={b.y} w={b.w} tilt={b.tilt} fy={b.fy} turn={turn} spread={spread} bookmark={bookmark} />
      </Svg>
      {/* мягкий свет сверху-слева; вечером — тёплая лампа */}
      <div style={box({ inset: 0, background: `radial-gradient(circle at 16% 10%, rgba(255,${lerp(248, 214, wm)},${lerp(225, 150, wm)},${0.3 + 0.16 * wm}), rgba(255,220,170,0) ${lerp(60, 72, wm)}%)` })} />
      {wm > 0 ? <div style={box({ inset: 0, backgroundColor: `rgba(255,178,100,${0.05 * wm})`, mixBlendMode: "multiply" })} /> : null}
      <div style={box({ inset: 0, background: "radial-gradient(ellipse 80% 60% at 55% 52%, rgba(0,0,0,0) 55%, rgba(20,15,10,0.32) 100%)" })} />
    </div>
  );
};

// ---------- Переход: страница светлеет до фона финала ----------
// t 0..1: сначала мягкое свечение страницы, затем светлый фон финала
// (тот же Backdrop, что у CtaScreen) раскрывается из центра страницы и
// к t = 1 закрывает кадр целиком. Накладывается поверх крупного плана.
export const PageGlow: React.FC<{ readonly t: number; readonly x?: number; readonly y?: number }> = ({ t, x = CLOSEUP_PAGE_CENTER.x, y = CLOSEUP_PAGE_CENTER.y }) => {
  const k = clamp(t);
  if (k <= 0) return null;
  const glow = easeInOut(clamp(k / 0.55));
  const open = easeInOut(clamp((k - 0.3) / 0.7));
  const r0 = lerp(0, 2300, open);
  const mask = `radial-gradient(circle at ${x}px ${y}px, #000 ${r0}px, rgba(0,0,0,0) ${r0 + 420 * (1 - open) + 1}px)`;
  return (
    <div style={box({ inset: 0, pointerEvents: "none" })}>
      <div style={box({ inset: 0, backgroundColor: `rgba(247,245,239,${0.42 * glow})` })} />
      <div style={box({ inset: 0, background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,253,245,${0.85 * glow}) ${lerp(120, 520, glow)}px, rgba(255,250,236,0) ${lerp(420, 1300, glow)}px)` })} />
      {open > 0 ? (
        <div style={box({ inset: 0, WebkitMaskImage: mask, maskImage: mask, opacity: clamp(open * 3) })}>
          <div style={box({ inset: 0, backgroundColor: C.bg })} />
          <Backdrop />
        </div>
      ) : null}
    </div>
  );
};
