// Реквизит фильма 80-1-11 «А если я ошибусь?» (px мира комнаты): дверь с
// видом в коридор, законченный плакат на доске, полочка с Кораном, низкий
// столик для ростка с поддоном, поднос, кувшин и чашка (вода в чашке всегда
// горизонтальна), струйка воды, сумка Амира, закрытая папка «Наши вопросы»,
// стопка чистых карточек, обычные книги (не зелёные — не путаются с
// Кораном) и тетрадь. Плоский вектор серии: мягкие тени, тонкие контуры,
// тёплая палитра. Всё детерминировано: анимация только через числовые props.
import { useId } from "react";
import { fontFamily } from "../../fonts";
import { CARD_UNITS } from "../film-1-8/card";
import { BookStand, CardContent, FlatSheet, QuranBook } from "../film-1-8/drawings";
import { DOOR, PLANT_TABLE, POSTER, QURAN_SHELF, type P } from "./layout";

const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";
const WOOD_LIGHT = "#B08358";
const WOOD_TOP = "#C19468";

const D2R = Math.PI / 180;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Уникальный id для clipPath/градиентов внутри одного экземпляра.
const useUid = (prefix: string) => `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

// Цвета: смешение #RRGGBB с другим цветом (тени и блики из основного тона).
const rgb = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: string, b: string, k: number) => {
  const A = rgb(a);
  const B = rgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const dark = (c: string, k: number) => mix(c, "#000000", k);
const light = (c: string, k: number) => mix(c, "#FFFFFF", k);

const f2 = (v: number) => v.toFixed(2);
const poly = (ps: readonly P[]) => `M ${ps.map((p) => `${f2(p.x)} ${f2(p.y)}`).join(" L ")} Z`;
const line = (ps: readonly P[]) => `M ${ps.map((p) => `${f2(p.x)} ${f2(p.y)}`).join(" L ")}`;

// Точка кубической кривой Безье.
const bez = (p: readonly P[], t: number): P => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x, y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y };
};
const bezPath = (p: readonly P[]) => `M ${p[0].x} ${p[0].y} C ${p[1].x} ${p[1].y} ${p[2].x} ${p[2].y} ${p[3].x} ${p[3].y}`;

// Локальная точка предмета (якорь — середина дна, y вниз) → мир: поворот на
// tilt градусов по часовой (как SVG rotate) и масштаб вокруг якоря.
const toWorld = (x: number, y: number, tilt: number, scale: number, l: P): P => {
  const a = tilt * D2R;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: x + scale * (c * l.x - s * l.y), y: y + scale * (s * l.x + c * l.y) };
};

// Обёртка: svg 1×1 в точке мира, начало координат — якорь предмета.
const At: React.FC<{ readonly x: number; readonly y: number; readonly children: React.ReactNode }> = ({ x, y, children }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    {children}
  </svg>
);

// ============================================================ дверь
// Проём DOOR (x…x+w, top…bottom = линия пола 1000). Все три слоя рисуются в
// координатах с началом в левом верхнем углу проёма. Рекомендуемый порядок:
// DoorOpening → персонаж в проёме → DoorCasing → DoorPanel (открытое полотно
// стоит в комнате, перед стеной и наличником).
const DW = DOOR.w;
const DH = DOOR.bottom - DOOR.top;

// Вид в открытый проём: светлый спокойный коридор (стена, полоса пола,
// мягкое пятно солнца), откос стены слева и снизу притолоки, порожек.
export const DoorOpening: React.FC = () => {
  const id = useUid("door-op");
  const fy = DH - 64; // низ стены коридора (дальше, чем стена комнаты)
  return (
    <svg width={DW} height={DH + 6} style={{ position: "absolute", left: DOOR.x, top: DOOR.top }}>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9DCC5" />
          <stop offset="0.45" stopColor="#F4EBDB" />
          <stop offset="1" stopColor="#F8F1E5" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3D2B5" />
          <stop offset="1" stopColor="#D3BD99" />
        </linearGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFDF5" stopOpacity="0" />
          <stop offset="0.35" stopColor="#FFFDF5" stopOpacity="0.6" />
          <stop offset="0.7" stopColor="#FFFDF5" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFDF5" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* стена коридора: верх чуть темнее, панель внизу и поручень */}
      <rect x={0} y={0} width={DW} height={fy} fill={`url(#${id}-wall)`} />
      <rect x={0} y={fy - 290} width={DW} height={290} fill="#EEE1CA" />
      <rect x={0} y={fy - 297} width={DW} height={9} rx={2} fill="#D6BF9B" />
      <rect x={0} y={fy - 297} width={DW} height={2} fill="#E9D9BE" />
      {/* вешалка для курток: планка с круглыми крючками (без одежды) */}
      <rect x={0} y={fy - 470} width={DW} height={12} rx={2} fill="#B88D62" />
      <rect x={0} y={fy - 470} width={DW} height={3} fill="#CFA77C" />
      {[46, 120, 194].map((px) => (
        <g key={px}>
          <ellipse cx={px + 2} cy={fy - 462} rx={6} ry={5} fill="#5A4026" opacity={0.12} />
          <circle cx={px} cy={fy - 464} r={5.5} fill="#8E6644" />
          <circle cx={px - 1.5} cy={fy - 465.5} r={1.8} fill="#C9A27A" />
        </g>
      ))}
      {/* мягкий косой луч солнца из окна коридора (справа) */}
      <path d={`M ${DW * 0.56} 190 L ${DW * 0.98} 150 L ${DW * 1.04} ${fy} L ${DW * 0.5} ${fy} Z`} fill={`url(#${id}-sun)`} opacity={0.75} />
      {/* плинтус и пол коридора */}
      <rect x={0} y={fy - 12} width={DW} height={12} fill="#D9C3A0" />
      <rect x={0} y={fy - 12} width={DW} height={2} fill="#E8D7BB" />
      <rect x={0} y={fy} width={DW} height={DH - fy} fill={`url(#${id}-floor)`} />
      <path d={`M 0 ${fy + 18} H ${DW} M 0 ${fy + 40} H ${DW}`} stroke="#B89B73" strokeWidth={1.2} opacity={0.45} />
      <path d={`M ${DW * 0.48} ${fy} L ${DW * 1.02} ${fy} L ${DW * 1.1} ${DH} L ${DW * 0.42} ${DH} Z`} fill="#FFF8E8" opacity={0.35} />
      {/* откосы: толщина стены слева (видна, т. к. камера правее) и снизу притолоки */}
      <path d={`M 0 0 L ${DW} 0 L ${DW} 10 L 16 10 Z`} fill="#E6D9C3" />
      <path d={`M 0 0 L 16 10 L 16 ${DH - 5} L 0 ${DH} Z`} fill="#E2D3BB" />
      <path d={`M 16 10 L 16 ${DH - 5}`} stroke="#D2C1A4" strokeWidth={1.5} />
      {/* порожек (под ногами того, кто стоит в проёме) */}
      <rect x={0} y={DH - 4} width={DW} height={4} fill="#C39A6E" />
      <rect x={0} y={DH} width={DW} height={5} fill={WOOD} />
      <rect x={0} y={DH - 4} width={DW} height={1.2} fill="#D8B48A" />
    </svg>
  );
};

// Деревянное полотно: петли слева, открывается внутрь комнаты к камере.
// open 0 — закрыто (ровно заполняет проём), 1 — открыто на 80°: видимая
// ширина ≈ cos, свободный край чуть выше и ниже (ближе к камере), полотно
// темнеет при повороте, виден торец двери.
export const DoorPanel: React.FC<{ readonly open: number }> = ({ open }) => {
  const k = clamp01(open);
  const th = k * 80 * D2R;
  const cw = DW * Math.cos(th);
  const sn = Math.sin(th);
  const rise = 6 * sn;
  const drop = 16 * sn;
  const edge = 9 * sn;
  // билинейная развёртка полотна: u — от петель к свободному краю, v — сверху вниз
  const Pt = (u: number, v: number): P => ({ x: u * cw, y: lerp(-rise * u, DH + drop * u, v) });
  const quad = (u0: number, v0: number, u1: number, v1: number) => poly([Pt(u0, v0), Pt(u1, v0), Pt(u1, v1), Pt(u0, v1)]);
  const du = 8 / DW;
  const dv = 8 / DH;
  const panel = (u0: number, v0: number, u1: number, v1: number) => (
    <g>
      <path d={quad(u0, v0, u1, v1)} fill="#7C5839" />
      {/* левая и нижняя фаски освещены, верх и правая — в тени */}
      <path d={poly([Pt(u0, v0), Pt(u0 + du, v0 + dv), Pt(u0 + du, v1 - dv), Pt(u0, v1)])} fill="#B48A62" />
      <path d={poly([Pt(u0, v1), Pt(u0 + du, v1 - dv), Pt(u1 - du, v1 - dv), Pt(u1, v1)])} fill="#B48A62" />
      <path d={quad(u0 + du, v0 + dv, u1 - du, v1 - dv)} fill="#A27752" />
    </g>
  );
  const hc = Pt(0.885, 0.475);
  const sx = Math.max(0.3, Math.cos(th));
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: DOOR.x, top: DOOR.top, overflow: "visible" }}>
      {/* тень полотна на полу */}
      {k > 0 ? <path d={poly([Pt(0, 1), Pt(1, 1), { x: cw + edge + 10, y: DH + drop + 5 }, { x: 6, y: DH + 4 }])} fill="#000000" opacity={0.1 * k} /> : null}
      <path d={quad(0, 0, 1, 1)} fill="#9C7150" />
      {/* лёгкие волокна на стойках */}
      <path d={`${line([Pt(0.07, 0.03), Pt(0.07, 0.97)])} ${line([Pt(0.93, 0.03), Pt(0.93, 0.97)])}`} stroke="#8E6545" strokeWidth={1.2} opacity={0.5} />
      {panel(0.165, 0.07, 0.835, 0.44)}
      {panel(0.165, 0.515, 0.835, 0.905)}
      {/* петли */}
      <path d={quad(0, 0.1, 0.022, 0.135)} fill="#77716A" />
      <path d={quad(0, 0.85, 0.022, 0.885)} fill="#77716A" />
      {/* ручка-рычаг с накладкой и замочная скважина (справа) */}
      <rect x={hc.x - 5 * sx} y={hc.y - 20} width={10 * sx} height={40} rx={3 * sx} fill="#A49E92" />
      <rect x={hc.x - 22 * sx} y={hc.y - 9} width={22 * sx} height={5.5} rx={2.6} fill="#CFC9BC" stroke="#8E887C" strokeWidth={0.8} />
      <ellipse cx={hc.x} cy={hc.y - 6.3} rx={5.4 * sx} ry={5.4} fill="#D8D2C6" stroke="#8E887C" strokeWidth={0.8} />
      <ellipse cx={hc.x + 1.2 * sx} cy={hc.y - 7.6} rx={1.8 * sx} ry={1.6} fill="#FFFFFF" opacity={0.7} />
      <ellipse cx={hc.x} cy={hc.y + 11} rx={1.6 * sx} ry={2.5} fill="#4A4540" />
      {/* полотно темнеет, отворачиваясь от света окна */}
      {k > 0 ? <path d={quad(0, 0, 1, 1)} fill="#24160B" opacity={0.26 * k} /> : null}
      {/* торец свободного края (освещён окном справа) */}
      {edge > 0.4 ? (
        <path d={poly([{ x: cw, y: -rise }, { x: cw + edge, y: -rise + 1.2 * sn }, { x: cw + edge, y: DH + drop - 1.2 * sn }, { x: cw, y: DH + drop }])} fill="#C49C72" />
      ) : null}
    </svg>
  );
};

// Наличник вокруг проёма (поверх коридора и персонажа в проёме): стойки,
// верхняя планка с карнизиком, базы-плинтусы внизу. Справа до рамы доски
// остаётся полоска стены.
export const DoorCasing: React.FC = () => {
  const t = 12;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: DOOR.x, top: DOOR.top, overflow: "visible" }}>
      {/* мягкая тень слева и под карнизом (свет из окна справа) */}
      <rect x={-t - 5} y={-18} width={5} height={DH + 18} fill="#5A4026" opacity={0.1} />
      <rect x={-t - 4} y={-16} width={DW + 2 * t + 8} height={4} fill="#5A4026" opacity={0.08} />
      {/* стойки */}
      <rect x={-t} y={-16} width={t} height={DH + 16} fill="#A07650" />
      <rect x={DW} y={-16} width={t} height={DH + 16} fill="#A07650" />
      <rect x={-3} y={0} width={3} height={DH} fill={WOOD} />
      <rect x={DW} y={0} width={3} height={DH} fill={WOOD} />
      <rect x={-t} y={-16} width={2} height={DH + 16} fill="#B9906A" />
      <rect x={DW + t - 2} y={-16} width={2} height={DH + 16} fill="#87613F" />
      {/* верхняя планка и карнизик */}
      <rect x={-t} y={-16} width={DW + 2 * t} height={16} fill="#A57B54" />
      <rect x={-3} y={-3} width={DW + 6} height={3} fill={WOOD} />
      <rect x={-t - 4} y={-23} width={DW + 2 * t + 8} height={8} rx={2} fill="#B58A60" />
      <rect x={-t - 4} y={-23} width={DW + 2 * t + 8} height={2} rx={1} fill="#CDA67C" />
      {/* базы внизу стоек */}
      <rect x={-t - 2} y={DH - 34} width={t + 3} height={36} rx={1.5} fill="#8E6644" />
      <rect x={DW - 1} y={DH - 34} width={t + 3} height={36} rx={1.5} fill="#8E6644" />
      <rect x={-t - 2} y={DH - 34} width={t + 3} height={2} fill="#B48A62" />
      <rect x={DW - 1} y={DH - 34} width={t + 3} height={2} fill="#B48A62" />
    </svg>
  );
};

// ============================================================ плакат
// Законченный бумажный плакат на доске (POSTER: левый верхний угол, w × h).
// Заголовок шрифтом Nunito, ниже — детские рисунки мелками: только творения
// (солнце без лица, облака, горы, дерево, речка, птица, цветы, росток).
// Ни людей, ни лиц, ни рук, ни «лучей с неба» — ничего, похожего на персонажа.
const PosterCrayon: React.FC<{ readonly d: string; readonly fill: string; readonly stroke: string; readonly wax: string; readonly w?: number }> = ({ d, fill, stroke, wax, w = 2.6 }) => (
  <g>
    <path d={d} fill={fill} />
    <path d={d} fill={`url(#${wax})`} />
    <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const cloudPath = (cx: number, cy: number, s: number) => {
  const p = (x: number, y: number) => `${f2(cx + x * s)} ${f2(cy + y * s)}`;
  return `M ${p(-40, 12)} A ${14 * s} ${14 * s} 0 0 1 ${p(-26, -8)} A ${20 * s} ${20 * s} 0 0 1 ${p(12, -14)} A ${19 * s} ${19 * s} 0 0 1 ${p(38, 12)} Z`;
};

const Flower: React.FC<{ readonly x: number; readonly y: number; readonly petal: string; readonly wax: string }> = ({ x, y, petal, wax }) => {
  const cy = y - 26;
  return (
    <g>
      <path d={`M ${x} ${y} Q ${x - 2} ${y - 12} ${x} ${cy}`} stroke="#5E9A4C" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <ellipse cx={x + 5} cy={y - 11} rx={5} ry={2.4} fill="#7DB868" transform={`rotate(-30 ${x + 5} ${y - 11})`} />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={x + Math.cos((a - 90) * D2R) * 6} cy={cy + Math.sin((a - 90) * D2R) * 6} r={4.8} fill={petal} />
      ))}
      <circle cx={x} cy={cy} r={11} fill={`url(#${wax})`} />
      <circle cx={x} cy={cy} r={3.6} fill="#F4C542" />
    </g>
  );
};

export const Poster: React.FC = () => {
  const id = useUid("poster");
  const wax = `${id}-wax`;
  const { w, h } = POSTER;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: POSTER.x, top: POSTER.y, overflow: "visible" }}>
      <defs>
        <filter id={`${id}-sh`} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        {/* штрихи воскового мелка поверх заливок */}
        <pattern id={wax} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <rect x={0} y={0} width={7} height={2.2} fill="#FFFFFF" opacity={0.3} />
        </pattern>
      </defs>
      {/* тень и бумага */}
      <rect x={3} y={6} width={w} height={h} rx={4} fill="#1E140A" opacity={0.3} filter={`url(#${id}-sh)`} />
      <rect x={0} y={0} width={w} height={h} rx={4} fill="#FBF5E6" />
      <rect x={6} y={6} width={w - 12} height={h - 12} rx={3} fill="none" stroke="#EFE4CC" strokeWidth={2} />
      {/* заголовок */}
      <text x={w / 2} y={64} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={42} fill="#2E3A46">
        Аллах — наш Создатель
      </text>
      <path d={`M ${w / 2 - 150} 86 Q ${w / 2 - 75} 80 ${w / 2} 86 T ${w / 2 + 150} 86`} stroke="#EDA94A" strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* солнце без лица */}
      <PosterCrayon d="M 67 150 A 25 25 0 1 1 117 150 A 25 25 0 1 1 67 150 Z" fill="#F7D04B" stroke="#E0B22C" wax={wax} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * 36 + 8) * D2R;
        return <line key={i} x1={92 + Math.cos(a) * 33} y1={150 + Math.sin(a) * 33} x2={92 + Math.cos(a) * 44} y2={150 + Math.sin(a) * 44} stroke="#E8B830" strokeWidth={3.2} strokeLinecap="round" />;
      })}
      {/* облака */}
      <PosterCrayon d={cloudPath(238, 134, 1)} fill="#FFFFFF" stroke="#AFC8DD" wax={wax} />
      <PosterCrayon d={cloudPath(472, 150, 0.82)} fill="#FFFFFF" stroke="#AFC8DD" wax={wax} />
      {/* птица в полёте — две дуги крыльев */}
      <path d="M 338 172 Q 347 160 356 170 Q 365 160 374 172" stroke="#4A5566" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* горы */}
      <PosterCrayon d="M 150 300 L 262 186 Q 300 152 338 186 L 452 300 Z" fill="#7DB36A" stroke="#5E9150" wax={wax} />
      <path d="M 300 171 Q 322 176 338 186 L 452 300 L 340 300 Z" fill="#5E9150" opacity={0.28} />
      <PosterCrayon d="M 52 300 L 150 214 Q 178 192 206 214 L 300 300 Z" fill="#93C47B" stroke="#6EA25C" wax={wax} />
      <PosterCrayon d="M 380 300 L 470 222 Q 494 204 518 222 L 590 300 Z" fill="#86BB72" stroke="#66994F" wax={wax} />
      {/* луг */}
      <PosterCrayon d="M 24 297 Q 160 286 308 297 T 594 294 L 594 340 Q 594 352 580 352 L 38 352 Q 24 352 24 340 Z" fill="#AED48F" stroke="#88B76E" wax={wax} />
      {/* речка с гор */}
      <PosterCrayon d="M 292 297 C 300 312 262 318 270 332 C 276 342 246 346 232 352 L 318 352 C 324 344 344 336 332 322 C 322 310 324 304 314 297 Z" fill="#8EC8EA" stroke="#62A6D2" wax={wax} />
      <path d="M 280 338 q 6 -4 12 0 M 296 326 q 5 -3 10 0 M 262 346 q 6 -4 12 0" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.9} />
      {/* дерево */}
      <PosterCrayon d="M 531 340 L 534 262 L 546 262 L 549 340 Z" fill="#9A6A44" stroke="#7A5034" wax={wax} />
      <PosterCrayon d="M 512 268 A 20 20 0 0 1 510 232 A 30 30 0 0 1 570 232 A 20 20 0 0 1 568 268 Z" fill="#6FAF58" stroke="#4F8A3C" wax={wax} />
      <circle cx={527} cy={242} r={4.2} fill="#E06A55" />
      <circle cx={553} cy={229} r={4.2} fill="#E06A55" />
      <circle cx={556} cy={256} r={4.2} fill="#E06A55" />
      {/* цветы */}
      <Flower x={74} y={336} petal="#EE8A9A" wax={wax} />
      <Flower x={110} y={344} petal="#F3B447" wax={wax} />
      <Flower x={444} y={340} petal="#B892DA" wax={wax} />
      <Flower x={478} y={332} petal="#EE8A9A" wax={wax} />
      {/* росток */}
      <path d="M 184 346 Q 196 337 208 346 Z" fill="#9A6A44" />
      <path d="M 196 343 Q 194 332 197 321" stroke="#4F8A3C" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <ellipse cx={189} cy={331} rx={7.5} ry={3.8} fill="#6FAF58" transform="rotate(-28 189 331)" />
      <ellipse cx={204.5} cy={324} rx={8.5} ry={4.2} fill="#7FBF66" transform="rotate(24 204.5 324)" />
      {/* малярный скотч по углам */}
      {[
        [14, 11, -38],
        [w - 14, 11, 38],
        [14, h - 11, 38],
        [w - 14, h - 11, -38],
      ].map(([tx, ty, a], i) => (
        <g key={i} transform={`translate(${tx} ${ty}) rotate(${a})`}>
          <path d="M -26 -8 L 26 -8 L 24.5 -4 L 26.5 0 L 24.5 4 L 26 8 L -26 8 L -24.5 4 L -26.5 0 L -24.5 -4 Z" fill="#EADFC0" opacity={0.92} />
          <path d="M -24 -5 L 24 -5" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.45} />
        </g>
      ))}
    </svg>
  );
};

// ============================================================ полочка с Кораном
// QURAN_SHELF: x — центр, y — верх полочки. Небольшая деревянная полочка на
// двух кронштейнах; на ней рехаль (BookStand) и закрытый Коран (QuranBook,
// стоит обложкой к зрителю). Никаких букв и псевдоарабских строк.
export const QuranShelf: React.FC = () => {
  const id = useUid("qshelf");
  const s = QURAN_SHELF;
  const hw = s.w / 2;
  return (
    <>
      <At x={s.x} y={s.y}>
        <defs>
          <filter id={`${id}-blur`} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {/* мягкая тень на стене под доской и кронштейнами */}
        <rect x={-hw + 2} y={9} width={s.w - 6} height={10} rx={5} fill="#4A3220" opacity={0.2} filter={`url(#${id}-blur)`} />
        {[-1, 1].map((sd) => {
          const bx = sd * 46;
          return (
            <g key={sd}>
              <path d={`M ${bx - 9} 14 L ${bx + 2} 14 L ${bx - 1} 46 Z`} fill="#4A3220" opacity={0.16} filter={`url(#${id}-blur)`} />
              <path d={`M ${bx - 6} 12 L ${bx + 6} 12 L ${bx + 3} 45 Q ${bx} 50 ${bx - 3} 45 Z`} fill={WOOD_DARK} />
              <path d={`M ${bx + 2} 13 L ${bx + 6} 13 L ${bx + 3} 44 Z`} fill="#87613F" />
            </g>
          );
        })}
      </At>
      <BookStand x={s.x} y={s.y} w={60} />
      {/* доска полочки поверх подставки: её ножки стоят на верхней плоскости */}
      <At x={s.x} y={s.y}>
        <rect x={-hw} y={0} width={s.w} height={13} rx={3} fill={WOOD} />
        <rect x={-hw} y={0} width={s.w} height={4} rx={2} fill={WOOD_LIGHT} />
        <rect x={-hw + 2} y={11} width={s.w - 4} height={2} fill={WOOD_DARK} opacity={0.6} />
      </At>
      <QuranBook x={s.x} y={s.y - 35} w={86} tilt={1} />
    </>
  );
};

// ============================================================ столик для ростка и поддон
// PLANT_TABLE: столешница — полоса 20 px от top, сверху видна узкая
// плоскость; передние ножки — до floorY, задние (в тени) — на depth выше.
export const PlantTable: React.FC = () => {
  const id = useUid("ptable");
  const t = PLANT_TABLE;
  const W = t.x2 - t.x1;
  const H = t.floorY - t.top;
  const d = t.depth;
  const slab = 20;
  const front = [16, W - 16 - 24];
  const back = [16 + 34, W - 16 - 20 - 34];
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: t.x1, top: t.top, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={WOOD_LIGHT} />
          <stop offset="1" stopColor={WOOD} />
        </linearGradient>
        <filter id={`${id}-blur`} x="-5%" y="-50%" width="110%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* тени: на стене под столешницей и на полу под столиком */}
      <rect x={14} y={slab} width={W - 28} height={18} fill="#4A3220" opacity={0.16} filter={`url(#${id}-blur)`} />
      <path d={`M 6 ${H - d} L ${W - 6} ${H - d} L ${W + 8} ${H + 3} L -8 ${H + 3} Z`} fill="#3A2614" opacity={0.1} />
      {/* задние ножки и нижняя перекладина */}
      {back.map((lx) => (
        <rect key={lx} x={lx} y={slab} width={20} height={H - d - slab} rx={3} fill="#5E412A" />
      ))}
      <rect x={back[0]} y={H - d - 52} width={back[1] - back[0] + 20} height={10} rx={2} fill="#5E412A" />
      {/* передние ножки с подсвеченной правой гранью */}
      {front.map((lx) => (
        <g key={lx}>
          <ellipse cx={lx + 12} cy={H + 1} rx={17} ry={3.5} fill="#000000" opacity={0.18} />
          <rect x={lx} y={slab} width={24} height={H - slab} rx={3} fill={WOOD_DARK} />
          <rect x={lx + 17} y={slab} width={5} height={H - slab - 2} rx={2} fill={WOOD} />
        </g>
      ))}
      {/* царга под столешницей */}
      <rect x={10} y={slab - 2} width={W - 20} height={14} fill="#7A5537" />
      {/* верхняя плоскость (видна сверху) и передняя кромка столешницы */}
      <path d={`M 7 ${-d * 0.4} L ${W - 7} ${-d * 0.4} L ${W} 0 L 0 0 Z`} fill="#CCA37A" />
      <path d={`M 7 ${-d * 0.4} L ${W - 7} ${-d * 0.4}`} stroke="#B48A62" strokeWidth={1.2} />
      <rect x={0} y={0} width={W} height={slab} rx={4} fill={`url(#${id}-front)`} />
      <rect x={0} y={0} width={W} height={4} rx={2} fill={WOOD_TOP} />
      <rect x={2} y={slab - 2} width={W - 4} height={2} fill={WOOD_DARK} opacity={0.5} />
    </svg>
  );
};

// Глиняный поддон под горшком (≈120 px): якорь — середина дна. Горшок
// (Sprout) ставится на 6 px выше якоря (POT.base) и рисуется после поддона —
// перед ним остаётся видна полоска дна поддона.
export const Saucer: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => {
  const id = useUid("saucer");
  return (
    <At x={x} y={y}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C98660" />
          <stop offset="1" stopColor="#A5634A" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={0.6} rx={56} ry={3.4} fill="#000000" opacity={0.16} />
      <ellipse cx={0} cy={-9} rx={60} ry={5} fill="#D9A07A" />
      <ellipse cx={0} cy={-8.6} rx={55.5} ry={4.1} fill="#A9664A" />
      <ellipse cx={0} cy={-7.8} rx={50} ry={3} fill="#B57154" />
      <path d="M -60 -9 Q 0 1 60 -9 L 50 -0.9 Q 0 2.2 -50 -0.9 Z" fill={`url(#${id}-g)`} />
      <path d="M -59 -8.4 Q 0 1.2 59 -8.4" stroke="#E2AE88" strokeWidth={1} fill="none" opacity={0.8} />
    </At>
  );
};

// ============================================================ поднос
// Деревянный поднос на столике/подоконнике: якорь — середина низа, предметы
// на подносе ставятся на 5 px выше якоря (верх передней кромки).
export const Tray: React.FC<{ readonly x: number; readonly y: number; readonly w: number }> = ({ x, y, w }) => {
  const id = useUid("tray");
  const hw = w / 2;
  // передний бортик: низкий посередине, плавно приподнят к ручкам на концах
  const front = `M ${-hw + 2} 0 Q ${-hw} 0 ${-hw} -2 L ${-hw} -8 Q ${-hw} -9.6 ${-hw + 2} -9.4 Q ${-hw + 9} -8.6 ${-hw + 14} -5 L ${hw - 14} -5 Q ${hw - 9} -8.6 ${hw - 2} -9.4 Q ${hw} -9.6 ${hw} -8 L ${hw} -2 Q ${hw} 0 ${hw - 2} 0 Z`;
  return (
    <At x={x} y={y}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B88D60" />
          <stop offset="1" stopColor="#94694A" />
        </linearGradient>
      </defs>
      <rect x={-hw + 2} y={-1.4} width={w - 4} height={3.4} rx={1.7} fill="#2A1A0E" opacity={0.16} />
      {/* дно (видно сверху), задний и боковые бортики */}
      <path d={`M ${-hw + 8} -11.4 L ${hw - 8} -11.4 L ${hw - 2} -5 L ${-hw + 2} -5 Z`} fill="#CDA478" />
      <path d={`M ${-hw + 16} -8.4 L ${hw - 34} -8.4 M ${-hw + 30} -6.6 L ${hw - 18} -6.6`} stroke="#B78C60" strokeWidth={0.7} opacity={0.6} />
      <rect x={-hw + 7} y={-13.6} width={w - 14} height={2.8} rx={1} fill="#A57A50" />
      <rect x={-hw + 7} y={-13.6} width={w - 14} height={0.9} fill="#D2AE84" />
      <path d={`M ${-hw + 0.6} -8.6 L ${-hw + 7.4} -13.4 L ${-hw + 9} -11.6 L ${-hw + 3} -7.8 Z`} fill="#AE845A" />
      <path d={`M ${hw - 0.6} -8.6 L ${hw - 7.4} -13.4 L ${hw - 9} -11.6 L ${hw - 3} -7.8 Z`} fill="#AE845A" />
      {/* передний бортик с прорезями-ручками на концах */}
      <path d={front} fill={`url(#${id}-g)`} />
      <path d={`M ${-hw + 0.6} -8.4 Q ${-hw + 0.8} -9.3 ${-hw + 2.4} -9.2 Q ${-hw + 9} -8.4 ${-hw + 14} -4.8 L ${hw - 14} -4.8 Q ${hw - 9} -8.4 ${hw - 2.4} -9.2 Q ${hw - 0.8} -9.3 ${hw - 0.6} -8.4`} stroke="#DDB98F" strokeWidth={1} fill="none" strokeLinecap="round" />
      <rect x={-hw + 2} y={-1.2} width={w - 4} height={1.2} fill="#6E4C31" opacity={0.45} />
      <rect x={-hw + 2.6} y={-6.6} width={6} height={2.2} rx={1.1} fill="#6E4C31" opacity={0.75} />
      <rect x={hw - 8.6} y={-6.6} width={6} height={2.2} rx={1.1} fill="#6E4C31" opacity={0.75} />
    </At>
  );
};

// ============================================================ чашка
// Керамическая кружка (масштаб 1: высота 46, корпус ≈ 40). Якорь (x, y) —
// середина дна в вертикальном положении. tilt — градусы, поворот вокруг
// якоря; tilt > 0 — по часовой: ПРАВЫЙ край устья опускается, вода льётся
// ВПРАВО. Ручка — слева (держат левее горшка, льют вправо).
// fill 0…1 — уровень воды. Поверхность воды — горизонтальная плоскость мира:
// в осях чашки «вниз мира» = (sin tilt, cos tilt); видна та часть поверхности,
// что попадает в устье (с наклоном вода собирается у носика-края).
const CUP = { h: 46, rt: 20, rb: 17.2, ri: 18.4, ey: 0.3, dv: 10 } as const;
const CUP_HANDLE: readonly P[] = [
  { x: -19.5, y: -37.5 },
  { x: -32, y: -39 },
  { x: -33.5, y: -13.5 },
  { x: -18.5, y: -12.5 },
];
const CUP_BODY = `M -20 -46 L 20 -46 L 17.2 -4 Q 16.9 -1.3 14 -1.2 Q 0 1.4 -14 -1.2 Q -16.9 -1.3 -17.2 -4 Z`;
const cupHalfW = (ly: number) => CUP.rt + (CUP.rb - CUP.rt) * Math.max(0, Math.min(1, (ly + CUP.h) / (CUP.h - 4)));

type Pose = { readonly x: number; readonly y: number; readonly tilt: number; readonly scale: number };

// Носик-край устья (ПРАВЫЙ край обода), откуда при tilt > 0 течёт вода.
export const cupLip = ({ x, y, tilt, scale }: Pose): P => toWorld(x, y, tilt, scale, { x: CUP.rt, y: -CUP.h });
// Середина ручки (слева) — точка хвата.
export const cupHandle = ({ x, y, tilt, scale }: Pose): P => toWorld(x, y, tilt, scale, bez(CUP_HANDLE, 0.5));
// Точка на наружной стенке корпуса на половине высоты: side −1 — слева, +1 — справа.
export const cupSide = ({ x, y, tilt, scale, side }: Pose & { readonly side: -1 | 1 }): P => {
  const ly = -CUP.h / 2;
  return toWorld(x, y, tilt, scale, { x: side * cupHalfW(ly), y: ly });
};

// Видимая часть воды в устье (локальные оси чашки). Модель: «видимый колодец»
// под ободом глубиной dv (условная глубина, чтобы вода читалась и при малом
// уровне), объём сохраняется; плоскость воды горизонтальна в мире.
const cupWater = (tilt: number, fill: number) => {
  const fv = Math.pow(clamp01(fill), 0.7);
  if (fv <= 0.002) return null;
  const { h, ri, ey, dv } = CUP;
  const a = Math.max(-85, Math.min(85, tilt)) * D2R;
  const tg = Math.tan(a);
  const N = 48;
  const xs = Array.from({ length: N + 1 }, (_, i) => -ri + (2 * ri * i) / N);
  const zs = xs.map((x) => Math.sqrt(Math.max(0, ri * ri - x * x)));
  // поверхность в оси чашки: y(x) = y0 − tg·x (вода — ниже по «вниз мира»)
  const vol = (y0: number) => xs.reduce((s, x, i) => s + zs[i] * Math.min(dv, Math.max(0, -h + dv - Math.max(y0 - tg * x, -h))), 0);
  const target = fv * zs.reduce((s, z) => s + z * dv, 0);
  let lo = -h - ri * Math.abs(tg) - 2;
  let hi = -h + dv + ri * Math.abs(tg) + 2;
  for (let it = 0; it < 44; it++) {
    const mid = (lo + hi) / 2;
    if (vol(mid) > target) lo = mid;
    else hi = mid;
  }
  const y0 = (lo + hi) / 2;
  const top: P[] = [];
  const bot: P[] = [];
  xs.forEach((x, i) => {
    const ys = y0 - tg * x;
    const q = zs[i] * ey;
    const yt = Math.max(ys, -h) - q;
    const yb = -h + q;
    if (ys < -h + dv && yt < yb - 0.05) {
      top.push({ x, y: yt });
      bot.push({ x, y: yb });
    }
  });
  if (top.length < 2) return null;
  return { area: poly([...top, ...bot.reverse()]), surface: line(top) };
};

export const Cup: React.FC<{ readonly x: number; readonly y: number; readonly tilt?: number; readonly fill?: number; readonly scale?: number; readonly shadow?: number }> = ({
  x,
  y,
  tilt = 0,
  fill = 0,
  scale = 1,
  shadow = 1,
}) => {
  const id = useUid("cup");
  const water = cupWater(tilt, fill);
  const { h, rt, ri, ey } = CUP;
  return (
    <At x={x} y={y}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E0D5C2" />
          <stop offset="0.3" stopColor="#F0E9DD" />
          <stop offset="0.68" stopColor="#FBF8F2" />
          <stop offset="0.9" stopColor="#F5F0E7" />
          <stop offset="1" stopColor="#E4DACA" />
        </linearGradient>
        <linearGradient id={`${id}-in`} x1="0" y1={-h - ri * ey} x2="0" y2={-h + ri * ey} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#EDE6DA" />
          <stop offset="1" stopColor="#CDC1AE" />
        </linearGradient>
        <linearGradient id={`${id}-w`} x1="0" y1={-h - ri * ey} x2="0" y2={-h + ri * ey} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D2ECF8" />
          <stop offset="1" stopColor="#8DC2E0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={CUP_BODY} />
        </clipPath>
        <clipPath id={`${id}-mouth`}>
          <ellipse cx={0} cy={-h} rx={ri} ry={ri * ey} />
        </clipPath>
      </defs>
      {shadow > 0 ? <ellipse cx={0} cy={0.6} rx={21 * scale} ry={3 * scale} fill="#000000" opacity={0.17 * shadow} /> : null}
      <g transform={`rotate(${tilt}) scale(${scale})`}>
        {/* ручка слева */}
        <path d={bezPath(CUP_HANDLE)} stroke="#C9BBA4" strokeWidth={6.6} fill="none" strokeLinecap="round" />
        <path d={bezPath(CUP_HANDLE)} stroke="#EFE8DC" strokeWidth={4.4} fill="none" strokeLinecap="round" />
        {/* корпус: глазурь, голубой поясок, блик */}
        <path d={CUP_BODY} fill={`url(#${id}-body)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <path d="M -21 -37.5 Q 0 -25.5 21 -37.5" stroke="#5B8DB8" strokeWidth={3.2} fill="none" />
          <path d="M -21 -33 Q 0 -21 21 -33" stroke="#9DBEDB" strokeWidth={1} fill="none" />
        </g>
        <rect x={10.2} y={-30} width={2.6} height={22} rx={1.3} fill="#FFFFFF" opacity={0.6} />
        <path d={CUP_BODY} fill="none" stroke="#C9BBA4" strokeWidth={1} />
        {/* обод и устье с водой */}
        <ellipse cx={0} cy={-h} rx={rt} ry={rt * ey} fill="#FCFAF5" stroke="#C9BBA4" strokeWidth={0.9} />
        <ellipse cx={0} cy={-h} rx={ri} ry={ri * ey} fill={`url(#${id}-in)`} />
        {water ? (
          <g clipPath={`url(#${id}-mouth)`}>
            <path d={water.area} fill={`url(#${id}-w)`} />
            <path d={water.surface} stroke="#EEF9FE" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.9} />
          </g>
        ) : null}
      </g>
    </At>
  );
};

// ============================================================ кувшин
// Небольшой керамический кувшин (бело-голубая глазурь), высота 78 при
// scale 1. Носик — СЛЕВА, ручка — справа. Якорь — середина дна; tilt —
// градусы вокруг якоря; tilt < 0 (против часовой) — носик уходит вниз-влево,
// вода льётся ВЛЕВО. fill — только намёк на воду в горлышке.
const JUG_HANDLE: readonly P[] = [
  { x: 16, y: -66 },
  { x: 41, y: -71 },
  { x: 41, y: -34 },
  { x: 23.5, y: -24 },
];
const JUG_SPOUT: P = { x: -29.4, y: -84.3 };
const JUG_BODY = [
  "M 0 0.8 Q 12 0.8 17 -1 Q 20 -2.5 20.3 -6",
  "C 23.5 -14 27 -21 26.6 -30 C 26.2 -42 20.5 -51 15.2 -59 C 13.6 -63 14.4 -70 17.6 -76 L 17.6 -78.4",
  "L -14.6 -78.4 C -19.5 -79.4 -24.5 -81.5 -29.4 -84.3 C -26.5 -80.5 -20 -74 -15.6 -66",
  "C -14.4 -63 -14.2 -61 -15.2 -59 C -20.5 -51 -26.2 -42 -26.6 -30 C -27 -21 -23.5 -14 -20.3 -6",
  "Q -20 -2.5 -17 -1 Q -12 0.8 0 0.8 Z",
].join(" ");

// Кончик носика (откуда течёт струйка).
export const jugSpout = ({ x, y, tilt, scale }: Pose): P => toWorld(x, y, tilt, scale, JUG_SPOUT);
// Середина ручки (справа) — точка хвата.
export const jugHandle = ({ x, y, tilt, scale }: Pose): P => toWorld(x, y, tilt, scale, bez(JUG_HANDLE, 0.5));

export const Jug: React.FC<{ readonly x: number; readonly y: number; readonly tilt?: number; readonly fill?: number; readonly scale?: number; readonly shadow?: number }> = ({
  x,
  y,
  tilt = 0,
  fill = 0.7,
  scale = 1,
  shadow = 1,
}) => {
  const id = useUid("jug");
  const wf = clamp01(fill);
  return (
    <At x={x} y={y}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C0D4E1" />
          <stop offset="0.3" stopColor="#DCE9F1" />
          <stop offset="0.66" stopColor="#F3F8FB" />
          <stop offset="0.88" stopColor="#E8F0F5" />
          <stop offset="1" stopColor="#CBDCE7" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={JUG_BODY} />
        </clipPath>
        <clipPath id={`${id}-mouth`}>
          <ellipse cx={1.5} cy={-78.4} rx={16} ry={3.6} />
        </clipPath>
      </defs>
      {shadow > 0 ? <ellipse cx={0} cy={0.6} rx={27 * scale} ry={3.4 * scale} fill="#000000" opacity={0.17 * shadow} /> : null}
      <g transform={`rotate(${tilt}) scale(${scale})`}>
        {/* ручка справа */}
        <path d={bezPath(JUG_HANDLE)} stroke="#A3BBCB" strokeWidth={8.6} fill="none" strokeLinecap="round" />
        <path d={bezPath(JUG_HANDLE)} stroke="#E2EDF3" strokeWidth={6.4} fill="none" strokeLinecap="round" />
        <path d="M 22 -67.5 C 36 -68 37.5 -48 35 -40" stroke="#FFFFFF" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* корпус с поясками */}
        <path d={JUG_BODY} fill={`url(#${id}-body)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <path d="M -28 -36 Q 0 -22 28 -36" stroke="#7FA6C4" strokeWidth={2.8} fill="none" />
          <path d="M -28 -30.5 Q 0 -16.5 28 -30.5" stroke="#A9C6DC" strokeWidth={1.2} fill="none" />
          <path d="M -17 -64 Q 0 -57 17 -64" stroke="#7FA6C4" strokeWidth={1.6} fill="none" />
        </g>
        <path d="M 18.5 -49 C 22 -41 23 -29 21 -16" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.6} />
        <path d={JUG_BODY} fill="none" stroke="#A3BBCB" strokeWidth={1.1} strokeLinejoin="round" />
        {/* горлышко: обод, тёмное нутро, намёк на воду, жёлобок носика */}
        <ellipse cx={1.5} cy={-78.4} rx={17.4} ry={4.2} fill="#F4F9FC" stroke="#A3BBCB" strokeWidth={0.8} />
        <ellipse cx={1.5} cy={-78.4} rx={16} ry={3.6} fill="#7590A3" />
        {wf > 0.05 ? (
          <g clipPath={`url(#${id}-mouth)`}>
            <ellipse cx={1.5} cy={-76.6 + (1 - wf) * 2} rx={13 * (0.55 + 0.45 * wf)} ry={2.6} fill="#A6D1EA" opacity={0.9} />
          </g>
        ) : null}
        <path d="M -14.2 -79.4 C -20 -80.4 -24.6 -82.2 -28.4 -84 C -24 -81.4 -19 -79.4 -14 -77.6 Z" fill="#8AA4B6" />
      </g>
    </At>
  );
};

// ============================================================ струйка воды
// Тонкая струйка от носика/края (from) до точки падения (to): парабола с
// небольшой начальной скоростью в сторону налива, полупрозрачная бело-голубая
// лента с бликом; amount 0…1 — толщина и прозрачность (0 — не рисуется);
// t — номер кадра для едва заметного мерцания (детерминированно, синусы).
// В точке падения — маленькое мягкое пятно впитывания, без больших брызг.
export const Stream: React.FC<{ readonly from: P; readonly to: P; readonly width?: number; readonly amount?: number; readonly t?: number }> = ({ from, to, width = 4, amount = 1, t = 0 }) => {
  const id = useUid("stream");
  const a = clamp01(amount);
  if (a <= 0.01) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const c: P = { x: from.x + dx * 0.5, y: from.y + dy * 0.1 };
  const at = (u: number): P => ({ x: (1 - u) * (1 - u) * from.x + 2 * (1 - u) * u * c.x + u * u * to.x, y: (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * c.y + u * u * to.y });
  const N = 28;
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = at(u);
    const tx = 2 * (1 - u) * (c.x - from.x) + 2 * u * (to.x - c.x);
    const ty = 2 * (1 - u) * (c.y - from.y) + 2 * u * (to.y - c.y);
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    const hw = (width / 2) * (0.3 + 0.7 * a) * (1 - 0.38 * u) * (1 + 0.07 * Math.sin(t * 0.7 + u * 11));
    left.push({ x: p.x + nx * hw, y: p.y + ny * hw });
    right.push({ x: p.x - nx * hw, y: p.y - ny * hw });
  }
  const op = 0.85 * (0.35 + 0.65 * a);
  const ring = 3.6 + 2.2 * (0.5 + 0.5 * Math.sin(t * 0.55));
  const core = Array.from({ length: N + 1 }, (_, i) => at(i / N));
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-g`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#B9DDF1" />
          <stop offset="1" stopColor="#D6EDF8" />
        </linearGradient>
      </defs>
      {/* пятно впитывания и мягкое кольцо */}
      <ellipse cx={to.x} cy={to.y} rx={5 + 3 * a} ry={1.6 + 0.6 * a} fill="#2E4A60" opacity={0.2 * a} />
      <ellipse cx={to.x} cy={to.y - 0.3} rx={ring} ry={ring * 0.3} fill="none" stroke="#E6F5FC" strokeWidth={0.8} opacity={0.65 * a} />
      <path d={poly([...left, ...right.reverse()])} fill={`url(#${id}-g)`} opacity={op} />
      <path d={line(core)} stroke="#FFFFFF" strokeWidth={Math.max(0.6, width * 0.22 * (0.4 + 0.6 * a))} fill="none" strokeLinecap="round" strokeDasharray="10 7" strokeDashoffset={-t * 2.4} opacity={0.32 * a} />
      <circle cx={to.x - 4} cy={to.y - 2.2 - 0.8 * Math.sin(t * 0.9)} r={0.9} fill="#E6F5FC" opacity={0.6 * a} />
      <circle cx={to.x + 4.5} cy={to.y - 1.8 - 0.8 * Math.cos(t * 0.8)} r={0.8} fill="#E6F5FC" opacity={0.6 * a} />
    </svg>
  );
};

// ============================================================ сумка Амира
// Небольшая тканевая сумка (серо-голубая ткань, клапан с пуговицей, две
// короткие ручки), ≈70 px. "carried": (x, y) — точка, где кисть держит ручки,
// сумка висит ниже; swing — покачивание (градусы вокруг точки хвата).
// "down": лежит на ковре, чуть примята; (x, y) — середина низа на полу.
const FAB = "#7F92A8";
const FAB_D = "#66788E";
const FAB_L = "#91A3B8";
const STRAP = "#56667A";

export const Bag: React.FC<{ readonly x: number; readonly y: number; readonly state: "carried" | "down"; readonly swing?: number }> = ({ x, y, state, swing = 0 }) => {
  const id = useUid("bag");
  const grad = (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={FAB_D} />
        <stop offset="0.35" stopColor={FAB} />
        <stop offset="1" stopColor={light(FAB, 0.06)} />
      </linearGradient>
    </defs>
  );
  if (state === "carried") {
    return (
      <At x={x} y={y}>
        {grad}
        <g transform={`rotate(${swing})`}>
          <path d="M -11 25 C -9 9 -3 1 1 0 C 5 1 10 9 12 25" fill="none" stroke={dark(STRAP, 0.2)} strokeWidth={4} strokeLinecap="round" />
          <path d="M -29 22 L 29 22 L 35 70 Q 36 80 26 80 L -26 80 Q -36 80 -35 70 Z" fill={`url(#${id}-g)`} />
          <path d="M -34.5 72 Q 0 77 34.5 72" stroke={FAB_D} strokeWidth={1.6} fill="none" opacity={0.8} />
          {/* клапан */}
          <path d="M -30 22.5 L 30 22.5 L 31.5 46 Q 31.5 54 22 55 Q 0 58 -22 55 Q -31.5 54 -31.5 46 Z" fill={FAB_L} />
          <path d="M -27 25.5 L 27 25.5 L 28.4 45.5 Q 28.4 51.2 21 52 Q 0 54.8 -21 52 Q -28.4 51.2 -28.4 45.5 Z" fill="none" stroke="#C3D0DE" strokeWidth={0.9} strokeDasharray="2.4 2.2" />
          <circle cx={0} cy={52.5} r={3.6} fill="#E2B85A" stroke="#B48A3A" strokeWidth={0.9} />
          {/* петли-крепления и передняя ручка */}
          <rect x={-19} y={19.5} width={7} height={6} rx={1.5} fill={STRAP} />
          <rect x={12} y={19.5} width={7} height={6} rx={1.5} fill={STRAP} />
          <path d="M -15.5 22 C -15 8 -4 -1 0 0 C 4 -1 15 8 15.5 22" stroke={STRAP} strokeWidth={4.4} fill="none" strokeLinecap="round" />
        </g>
      </At>
    );
  }
  return (
    <At x={x} y={y}>
      {grad}
      <ellipse cx={2} cy={0.5} rx={47} ry={5.5} fill="#000000" opacity={0.2} />
      <path d="M -17 -37 C -13 -45 9 -47 17 -38.5" stroke={dark(STRAP, 0.2)} strokeWidth={3.8} fill="none" strokeLinecap="round" />
      <path d="M -38 -2 Q -40 -30 -30 -36 Q 0 -42 30 -36 Q 40 -30 38 -2 Q 0 2 -38 -2 Z" fill={`url(#${id}-g)`} />
      <path d="M -37 -5 Q 0 -1 37 -5" stroke={FAB_D} strokeWidth={1.6} fill="none" opacity={0.8} />
      <path d="M -31 -35 Q 0 -41 31 -35 Q 35 -24 26 -15.5 Q 0 -12 -26 -15.5 Q -35 -24 -31 -35 Z" fill={FAB_L} />
      <path d="M -27.5 -32.5 Q 0 -38 27.5 -32.5 Q 31 -24 23.5 -18 Q 0 -15 -23.5 -18 Q -31 -24 -27.5 -32.5 Z" fill="none" stroke="#C3D0DE" strokeWidth={0.9} strokeDasharray="2.4 2.2" />
      <circle cx={0} cy={-15.5} r={3.4} fill="#E2B85A" stroke="#B48A3A" strokeWidth={0.9} />
      {/* ручки легли: задняя — на верх, передняя свесилась на бок */}
      <path d="M 3 -38.5 C 15 -44 35 -40 39 -27 C 41 -19 40.5 -11 38.6 -5" stroke={STRAP} strokeWidth={4.2} fill="none" strokeLinecap="round" />
    </At>
  );
};

// ============================================================ папка и карточки
// Закрытая папка «Наши вопросы» лежит на столе (перспектива как в 80-1-8):
// (x, y) — центр, w — ширина в мире. Обложка и надпись — как у FolderContent.
const FOLDER_UNITS = { w: 210, h: 300 } as const;

export const ClosedFolder: React.FC<{ readonly x: number; readonly y: number; readonly w: number }> = ({ x, y, w }) => {
  const h = FOLDER_UNITS.h * (w / FOLDER_UNITS.w) * 0.26;
  return (
    <>
      <At x={x} y={y}>
        {/* толщина: обложка, листы внутри, задняя обложка */}
        <rect x={-w / 2 + 1} y={h / 2 - 1.5} width={w - 1} height={4.4} rx={1.5} fill="#A9895F" />
        <rect x={-w / 2 + 3} y={h / 2 - 0.2} width={w - 6} height={1.4} fill="#F3ECDD" />
      </At>
      <FlatSheet x={x} y={y} w={w} units={FOLDER_UNITS} flat={1}>
        <rect x={6} y={6} width={204} height={294} rx={8} fill="#B8966A" />
        <rect x={0} y={0} width={204} height={294} rx={8} fill="#C9A87C" stroke="#A9895F" strokeWidth={3} />
        <rect x={23} y={88} width={158} height={118} rx={10} fill="#FBF6EA" stroke="#A9895F" strokeWidth={2} />
        <text x={102} y={136} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill="#4B3A2A">
          Наши
        </text>
        <text x={102} y={180} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill="#4B3A2A">
          вопросы
        </text>
      </FlatSheet>
    </>
  );
};

// Стопка чистых карточек (1–4) на столе: (x, y) — центр, w — ширина карточки.
// Карточки — та же модель, что CardContent серии (пустая).
const STACK_JIT = [
  [0, 0],
  [1.6, -2.2],
  [-1.2, 1.4],
  [0.8, -0.8],
] as const;
export const CardStack: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly count: number }> = ({ x, y, w, count }) => {
  const id = useUid("cards");
  const n = Math.max(0, Math.min(4, Math.round(count)));
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <FlatSheet key={i} x={x + STACK_JIT[i][0]} y={y - i * 1.7} w={w} units={CARD_UNITS} flat={1} rot={STACK_JIT[i][1]}>
          <CardContent progress={0} uid={`${id}-${i}`} />
        </FlatSheet>
      ))}
    </>
  );
};

// ============================================================ книги и тетрадь
// Обычная книга в руках, вид снаружи (читающий — по ту сторону). w — ширина
// одной обложки; (x, y) — центр; angle — поворот. open 1 — раскрытая книга:
// две обложки неглубокой «галочкой», корешок посередине к зрителю, сверху
// видны обрезы страниц; open 0 — закрытая книга. Цвет — не зелёный.
export const HeldBook: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly open: number; readonly angle?: number; readonly color?: string }> = ({
  x,
  y,
  w,
  open,
  angle = 0,
  color = "#6B4E8C",
}) => {
  const k = clamp01(open);
  const h = w * 1.36;
  const aOpen = 26 * D2R;
  const phF = k * aOpen; // правая обложка
  const phR = k * (Math.PI - aOpen); // левая: из-за правой уходит налево
  const sw = w * 0.13 * k; // корешок, обращённый к зрителю
  const xs = -(w / 2) * (1 - k);
  const xF0 = xs + sw / 2;
  const xR0 = xs - sw / 2;
  const xF1 = xF0 + w * Math.cos(phF);
  const xR1 = xR0 + w * Math.cos(phR);
  const hF = h * (1 - 0.07 * Math.sin(phF));
  const hR = h * (1 - 0.07 * Math.sin(phR));
  // развёртка обложки: u — от корешка к обрезу, v — сверху вниз
  const map = (x0: number, h0: number, x1: number, h1: number) => (u: number, v: number): P => ({ x: lerp(x0, x1, u), y: lerp(-lerp(h0, h1, u) / 2, lerp(h0, h1, u) / 2, v) });
  const cover = (m: (u: number, v: number) => P, fill: string, deco: string) => (
    <g>
      <path d={poly([m(0, 0), m(1, 0), m(1, 1), m(0, 1)])} fill={fill} />
      <path d={poly([m(0.12, 0.07), m(0.9, 0.07), m(0.9, 0.93), m(0.12, 0.93)])} fill="none" stroke={deco} strokeWidth={1.2} />
      <path d={poly([m(0.12, 0.2), m(0.9, 0.2), m(0.9, 0.27), m(0.12, 0.27)])} fill={deco} opacity={0.7} />
      <path d={line([m(0, 0), m(1, 0)])} stroke={light(fill.startsWith("#") ? fill : color, 0.25)} strokeWidth={1} />
    </g>
  );
  const mF = map(xF0, h, xF1, hF);
  const mR = map(xR0, h, xR1, hR);
  const lift = 3.6 * k;
  return (
    <At x={x} y={y}>
      <g transform={`rotate(${angle})`}>
        {/* обрезы страниц сверху (между обложками) */}
        {k > 0.15 ? (
          <g opacity={clamp01((k - 0.15) / 0.3)}>
            <path
              d={poly([
                { x: xR1 + 3, y: -hR / 2 - lift * 0.7 },
                { x: xs, y: -h / 2 - lift },
                { x: xF1 - 3, y: -hF / 2 - lift * 0.7 },
                { x: xF1 - 3, y: -hF / 2 + 2 },
                { x: xs, y: -h / 2 + 2 },
                { x: xR1 + 3, y: -hR / 2 + 2 },
              ])}
              fill="#F4ECDA"
            />
            <path d={line([{ x: xR1 + 5, y: -hR / 2 - lift * 0.3 }, { x: xs, y: -h / 2 - lift * 0.5 }, { x: xF1 - 5, y: -hF / 2 - lift * 0.3 }])} stroke="#D8CCB3" strokeWidth={0.8} fill="none" />
          </g>
        ) : null}
        {cover(mR, dark(color, 0.2), light(color, 0.18))}
        {sw > 0.5 ? (
          <g>
            <rect x={xR0} y={-h / 2} width={sw} height={h} fill={dark(color, 0.3)} />
            <rect x={xR0} y={-h / 2 + h * 0.08} width={sw} height={1.4} fill={light(color, 0.25)} />
            <rect x={xR0} y={h / 2 - h * 0.08} width={sw} height={1.4} fill={light(color, 0.25)} />
          </g>
        ) : null}
        {cover(mF, light(color, 0.05 * k), light(color, 0.3))}
      </g>
    </At>
  );
};

// Та же обычная книга, закрытая, лежит на столе (например, TEACHER_BOOK).
export const LyingBook: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly color?: string }> = ({ x, y, w, color = "#6B4E8C" }) => {
  const d = w * 1.36 * 0.27;
  const th = 6;
  return (
    <At x={x} y={y}>
      <ellipse cx={0} cy={d / 2 + th - 0.5} rx={w * 0.56} ry={3} fill="#000000" opacity={0.16} />
      <rect x={-w / 2} y={d / 2 + th - 2} width={w} height={2} rx={1} fill={dark(color, 0.3)} />
      <rect x={-w / 2 + 3} y={d / 2 - 1} width={w - 5} height={th} fill="#F1E9D6" />
      <path d={`M ${-w / 2 + 4} ${d / 2 + 1.2} H ${w / 2 - 3} M ${-w / 2 + 4} ${d / 2 + 3} H ${w / 2 - 3}`} stroke="#D6CAB0" strokeWidth={0.6} />
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={2} fill={color} />
      <rect x={-w / 2} y={-d / 2} width={6} height={d + th - 0.5} rx={2} fill={dark(color, 0.22)} />
      <rect x={-w / 2 + 12} y={-d / 2 + 3} width={w - 20} height={d - 6} rx={1.5} fill="none" stroke={light(color, 0.3)} strokeWidth={1} />
      <rect x={-w / 2} y={-d / 2} width={w} height={1.2} fill={light(color, 0.25)} />
    </At>
  );
};

// Раскрытая книга лежит плоско (на коленях или на ковре), вид спереди-сверху:
// (x, y) — центр, w — ширина разворота. flip 0…1 — одна страница
// переворачивается справа налево (сужается к корешку и ложится слева).
const OB_LINES_L = [0.92, 0.86, 0.95, 0.7] as const;
const OB_LINES_R = [0.9, 0.95, 0.82, 0.93, 0.88, 0.55] as const;

export const OpenBook: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly flip?: number; readonly color?: string }> = ({ x, y, w, flip = 0, color = "#3F6E9E" }) => {
  const id = useUid("obook");
  const pw = w / 2 - 2;
  const ph = w * 0.3;
  const yt = -ph / 2;
  const yb = ph / 2;
  const fl = clamp01(flip);
  const ang = fl * Math.PI;
  const se = Math.sin(ang);
  const qb = (a: P, c: P, b: P, u: number): P => ({ x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * b.y });
  // Развёртка страницы: u — от корешка к обрезу, v — сверху вниз. Край
  // страницы — на xe, приподнят на ly; bend — изгиб листа при перевороте.
  // Лежащие страницы — та же развёртка с ly = 0, поэтому перевёрнутая
  // страница ложится ровно на место левой.
  const pageMap = (xe: number, ly: number, bend: number) => {
    const sT: P = { x: 0, y: yt + 2.5 };
    const sB: P = { x: 0, y: yb + 1.5 };
    const eT: P = { x: xe, y: yt + ly };
    const eB: P = { x: xe, y: yb + ly };
    const cT: P = { x: xe * 0.35 + bend, y: yt - 2.5 + ly * 0.55 };
    const cB: P = { x: xe * 0.35 + bend, y: yb - 1.5 + ly * 0.55 };
    const m = (u: number, v: number): P => {
      const p0 = qb(sT, cT, eT, u);
      const p1 = qb(sB, cB, eB, u);
      return { x: lerp(p0.x, p1.x, v), y: lerp(p0.y, p1.y, v) };
    };
    const outline = `M ${f2(sT.x)} ${f2(sT.y)} Q ${f2(cT.x)} ${f2(cT.y)} ${f2(eT.x)} ${f2(eT.y)} L ${f2(eB.x)} ${f2(eB.y)} Q ${f2(cB.x)} ${f2(cB.y)} ${f2(sB.x)} ${f2(sB.y)} Z`;
    return { m, outline };
  };
  const rows = (n: number) => Array.from({ length: n }, (_, i) => 0.16 + i * ((0.84 - 0.16) / Math.max(1, n - 1)));
  const rowsL = rows(OB_LINES_L.length + 2);
  const rowsR = rows(OB_LINES_R.length);
  const textLines = (m: (u: number, v: number) => P, lens: readonly number[], vs: readonly number[], op: number, key: string) =>
    lens.map((len, i) => {
      const u0 = 6 / pw;
      const u1 = (6 + (pw - 12) * len) / pw;
      const pts = Array.from({ length: 7 }, (_, j) => m(lerp(u0, u1, j / 6), vs[i]));
      return <path key={`${key}${i}`} d={line(pts)} stroke="#9C9A94" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={op} />;
    });
  const left = pageMap(-pw, 0, 0);
  const right = pageMap(pw, 0, 0);
  const turn = pageMap(pw * Math.cos(ang), -pw * 0.5 * se, -pw * 0.22 * se);
  const backSide = ang > Math.PI / 2;
  const PAGE_L = "#FBF8F0";
  const PAGE_R = "#FDFBF5";
  const pic = (u: number, v: number) => left.m(u, v);
  return (
    <At x={x} y={y}>
      <defs>
        <linearGradient id={`${id}-gut`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#000000" stopOpacity="0.16" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={yb + 6} rx={w * 0.56} ry={3.2} fill="#000000" opacity={0.16} />
      {/* обложка (видна каймой) и толщина блока спереди */}
      <rect x={-w / 2 - 3} y={yt - 3} width={w + 6} height={ph + 9} rx={3} fill={dark(color, 0.1)} />
      <rect x={-w / 2 - 3} y={yb + 4} width={w + 6} height={2.4} rx={1.2} fill={dark(color, 0.32)} />
      <path d={`M ${-pw} ${yb} L 0 ${yb + 1.5} L ${pw} ${yb} L ${pw} ${yb + 3.4} L 0 ${yb + 4.6} L ${-pw} ${yb + 3.4} Z`} fill="#EDE4D0" />
      {/* страницы с серыми строками; на левой — маленькая картинка */}
      <path d={left.outline} fill={PAGE_L} />
      <path d={right.outline} fill={PAGE_R} />
      {textLines(left.m, OB_LINES_L, rowsL, 0.55, "l")}
      <path d={poly([pic(0.12, 0.7), pic(0.52, 0.7), pic(0.52, 0.92), pic(0.12, 0.92)])} fill="#CFE6F3" />
      <path d={`M ${f2(pic(0.12, 0.92).x)} ${f2(pic(0.12, 0.92).y)} Q ${f2(pic(0.32, 0.72).x)} ${f2(pic(0.32, 0.72).y)} ${f2(pic(0.52, 0.92).x)} ${f2(pic(0.52, 0.92).y)} Z`} fill="#8DC774" />
      <circle cx={pic(0.42, 0.77).x} cy={pic(0.42, 0.77).y} r={1.6} fill="#F2C744" />
      {textLines(right.m, OB_LINES_R, rowsR, 0.55, "r")}
      <rect x={-7} y={yt} width={14} height={ph + 1.5} fill={`url(#${id}-gut)`} />
      {/* переворачиваемая страница и её мягкая тень */}
      {fl > 0.001 ? (
        <g>
          <path d={`M 0 ${yt + 2.5} L ${pw * Math.cos(ang) * 0.9} ${yt + 2} L ${pw * Math.cos(ang) * 0.9} ${yb} L 0 ${yb + 1.5} Z`} fill="#000000" opacity={0.07 * se} />
          <path d={turn.outline} fill={backSide ? mix(PAGE_L, "#E6DDCB", se) : mix(PAGE_R, "#EFE8DA", se * 0.6)} stroke="#E3DACA" strokeWidth={0.6 * se} />
          {backSide ? textLines(turn.m, OB_LINES_L, rowsL, 0.55 * (1 - 0.6 * se), "t") : textLines(turn.m, OB_LINES_R, rowsR, 0.55 * (1 - 0.6 * se), "t")}
        </g>
      ) : null}
    </At>
  );
};

// Тетрадь на спирали лежит плоско (вид спереди-сверху): (x, y) — центр,
// w — ширина. progress 0…1 — рисунок карандашом и мелками проявляется
// штрих за штрихом (росток в горшке, солнце, «строчки»).
const NB = { w: 300, h: 380 } as const;
const NB_STROKES: readonly { readonly d: string; readonly c: string; readonly w: number; readonly from: number; readonly to: number }[] = [
  { d: "M 70 92 q 10 -12 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0", c: "#4A4A55", w: 4, from: 0, to: 0.14 },
  { d: "M 70 120 q 10 -12 20 0 t 20 0 t 20 0 t 20 0", c: "#4A4A55", w: 4, from: 0.14, to: 0.26 },
  { d: "M 112 296 L 188 296 L 178 350 L 122 350 Z M 106 296 L 194 296", c: "#A0603F", w: 5, from: 0.26, to: 0.46 },
  { d: "M 150 296 C 148 262 152 236 150 206", c: "#4F8A3C", w: 5, from: 0.46, to: 0.58 },
  { d: "M 150 256 C 128 240 112 248 106 260 C 122 268 140 264 150 256 M 150 230 C 172 210 190 216 196 228 C 180 240 162 238 150 230", c: "#5E9E4C", w: 5, from: 0.58, to: 0.8 },
  {
    d: "M 222 110 A 20 20 0 1 1 262 110 A 20 20 0 1 1 222 110 M 242 76 L 242 66 M 242 144 L 242 154 M 208 110 L 198 110 M 276 110 L 286 110 M 218 86 L 211 79 M 266 86 L 273 79 M 218 134 L 211 141 M 266 134 L 273 141",
    c: "#E0B22C",
    w: 5,
    from: 0.8,
    to: 1,
  },
];

export const Notebook: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly progress: number; readonly color?: string }> = ({ x, y, w, progress, color = "#E0A33A" }) => {
  const id = useUid("nbook");
  const k = w / NB.w;
  const fy = 0.42;
  const p = clamp01(progress);
  return (
    <At x={x} y={y}>
      <defs>
        <filter id={`${id}-sh`} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g transform={`scale(${k} ${k * fy}) translate(${-NB.w / 2} ${-NB.h / 2})`}>
        <rect x={0} y={14} width={NB.w + 8} height={NB.h + 10} rx={10} fill="#000000" opacity={0.22} filter={`url(#${id}-sh)`} />
        {/* обложка (кайма) и страница */}
        <rect x={-7} y={-4} width={NB.w + 14} height={NB.h + 14} rx={10} fill={color} />
        <rect x={-7} y={NB.h + 2} width={NB.w + 14} height={8} rx={4} fill={dark(color, 0.25)} />
        <rect x={0} y={0} width={NB.w} height={NB.h} rx={6} fill="#FDFBF5" />
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M 8 ${66 + i * 28} H ${NB.w - 8}`} stroke="#BFD8EE" strokeWidth={2} />
        ))}
        <path d={`M 44 30 V ${NB.h - 6}`} stroke="#F0B3B3" strokeWidth={2} />
        {/* спираль */}
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <ellipse cx={24 + i * 21.5} cy={14} rx={4} ry={6} fill="#EDE6D8" />
            <path d={`M ${20 + i * 21.5} 18 C ${18 + i * 21.5} 2 ${30 + i * 21.5} -2 ${29 + i * 21.5} 12`} stroke="#6E6E78" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* рисунок проявляется штрихами */}
        {NB_STROKES.map((s, i) => {
          const lp = clamp01((p - s.from) / (s.to - s.from));
          if (lp <= 0.001) return null;
          return <path key={i} d={s.d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lp} stroke={s.c} strokeWidth={s.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </g>
    </At>
  );
};
