// Рисунок глобуса (SVG) по общей модели состояния (model.ts): ракурс задаёт
// камера, всё остальное — один угол φ и фиксированный свет. Ночная половина
// затемнена, но не проваливается в чёрное: контуры и метка остаются
// различимы (слабый рассеянный свет комнаты). Метка на дальней стороне
// не видна сквозь шар. Стиль — мягкая 2D-иллюстрация, без фотореализма.
import {
  CAM_SIDE,
  CAM_TOP,
  CONTINENTS,
  SOUTH_CAP,
  latitudeCircle,
  markState,
  nightPolygon,
  pole,
  subsolar,
  surfacePolygon,
  type Camera,
  type P2,
} from "./model";

export type GlobeViewProps = {
  readonly uid: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly phi: number; // градусы (непрерывный угол)
  readonly view: "side" | "top";
  readonly lamp: number; // 0 — выключена (ровный свет комнаты), 1 — включена
  readonly stand?: boolean; // подставка (вид сбоку)
  readonly pathHint?: boolean; // пунктирный круг широты метки (вид сверху)
  readonly markScale?: number;
};

const OCEAN = "#8FC3DF";
const LAND = "#9CCB7A";
const LAND_EDGE = "#78AA5C";
const ICE = "#EAF3F5";
const NIGHT = "#1B2A4A";
const MARK = "#E8553D";
const MARK_RING = "#F8F3EC";

const toPath = (pts: readonly P2[], cx: number, cy: number, r: number) =>
  pts.length < 3 ? "" : `M ${pts.map((p) => `${(cx + p.x * r).toFixed(2)} ${(cy + p.y * r).toFixed(2)}`).join(" L ")} Z`;

export const GlobeView: React.FC<GlobeViewProps> = ({ uid, cx, cy, r, phi, view, lamp, stand = true, pathHint = false, markScale = 1 }) => {
  const cam: Camera = view === "top" ? CAM_TOP : CAM_SIDE;
  const clip = `${uid}-clip`;
  const lands = CONTINENTS.map((poly) => toPath(surfacePolygon(cam, phi, poly), cx, cy, r)).filter(Boolean);
  const cap = toPath(surfacePolygon(cam, phi, SOUTH_CAP), cx, cy, r);
  const night = toPath(nightPolygon(cam), cx, cy, r);
  const mark = markState(cam, phi);
  const sun = subsolar(cam);
  const np = pole(cam, true);
  const sp = pole(cam, false);
  const mr = r * 0.055 * markScale;
  const hint = pathHint ? latitudeCircle(cam, phi) : [];
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <radialGradient id={`${uid}-sun`} cx={cx + sun.x * r} cy={cy + sun.y * r} r={r * 1.4} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.32} />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.12} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-vol`} cx={cx - r * 0.25} cy={cy - r * 0.3} r={r * 1.25} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.14} />
          <stop offset="0.7" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#1F2E4F" stopOpacity={0.25} />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={Math.max(0.8, r * 0.012)} />
        </filter>
      </defs>
      {stand && view === "side" ? <Stand cx={cx} cy={cy} r={r} np={np} sp={sp} back /> : null}
      <g clipPath={`url(#${clip})`}>
        <circle cx={cx} cy={cy} r={r} fill={OCEAN} />
        {/* лёгкая глубина океана к краям */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-vol)`} />
        {lands.map((d, i) => (
          <path key={i} d={d} fill={LAND} stroke={LAND_EDGE} strokeWidth={Math.max(1, r * 0.012)} strokeLinejoin="round" />
        ))}
        {cap ? <path d={cap} fill={ICE} stroke="#D5E3E6" strokeWidth={Math.max(1, r * 0.01)} /> : null}
        {/* слабая сетка: экватор и несколько меридианов — читается как глобус */}
        <Grid cam={cam} phi={phi} cx={cx} cy={cy} r={r} />
        {/* путь метки (подсказка в виде сверху) */}
        {hint.length > 2 ? (
          <path d={`M ${hint.map((p) => `${(cx + p.x * r).toFixed(1)} ${(cy + p.y * r).toFixed(1)}`).join(" L ")}`} fill="none" stroke="#2F3E5C" strokeOpacity={0.35} strokeWidth={Math.max(1, r * 0.01)} strokeDasharray={`${r * 0.05} ${r * 0.04}`} />
        ) : null}
        {/* метка города: простая круглая наклейка с нейтральным контуром */}
        {mark.visible ? (
          <g>
            <circle cx={cx + mark.screen.x * r} cy={cy + mark.screen.y * r} r={mr * 1.35} fill={MARK_RING} />
            <circle cx={cx + mark.screen.x * r} cy={cy + mark.screen.y * r} r={mr} fill={MARK} stroke="#3A2A24" strokeWidth={Math.max(1, mr * 0.28)} />
          </g>
        ) : null}
        {/* свет лампы: светлое пятно у подсолнечной точки и ночная область */}
        {lamp > 0 ? (
          <g opacity={lamp}>
            <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-sun)`} />
            <path d={night} fill={NIGHT} opacity={0.62} filter={`url(#${uid}-soft)`} />
          </g>
        ) : null}
        {/* объём шара */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-vol)`} opacity={0.6} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3E4A66" strokeWidth={Math.max(1.2, r * 0.016)} opacity={0.85} />
      {stand && view === "side" ? <Stand cx={cx} cy={cy} r={r} np={np} sp={sp} /> : null}
      {view === "top" ? <circle cx={cx + np.x * r} cy={cy + np.y * r} r={r * 0.035} fill="#8C8F99" stroke="#3E4A66" strokeWidth={1.5} /> : null}
    </g>
  );
};

// Экватор и меридианы (только видимые дуги), очень тонко.
const Grid: React.FC<{ cam: Camera; phi: number; cx: number; cy: number; r: number }> = ({ cam, phi, cx, cy, r }) => {
  const eq = latitudeCircle(cam, phi, 0, 90);
  const d = eq.length > 2 ? `M ${eq.map((p) => `${(cx + p.x * r).toFixed(1)} ${(cy + p.y * r).toFixed(1)}`).join(" L ")}` : "";
  return d ? <path d={d} fill="none" stroke="#2F3E5C" strokeOpacity={0.14} strokeWidth={Math.max(0.8, r * 0.008)} /> : null;
};

// Подставка: полукольцо-меридиан за шаром, штифт на полюсе, ножка и
// основание. Ось наклонена, подставка не вращается вместе с шаром.
const Stand: React.FC<{ cx: number; cy: number; r: number; np: P2; sp: P2; back?: boolean }> = ({ cx, cy, r, np, sp, back }) => {
  const nx = cx + np.x * r;
  const ny = cy + np.y * r;
  const sx = cx + sp.x * r;
  const sy = cy + sp.y * r;
  const metal = "#8C8F99";
  const metalDark = "#5B5E68";
  const wood = "#7A5536";
  if (back) {
    // дужка-меридиан слева за шаром: от южного полюса к северному
    const d = `M ${sx} ${sy + r * 0.05} C ${cx - r * 1.32} ${cy + r * 0.9} ${cx - r * 1.32} ${cy - r * 0.95} ${nx} ${ny - r * 0.06}`;
    return (
      <g>
        <path d={d} fill="none" stroke={metalDark} strokeWidth={Math.max(3, r * 0.05)} strokeLinecap="round" />
        <path d={d} fill="none" stroke={metal} strokeWidth={Math.max(1.5, r * 0.028)} strokeLinecap="round" />
      </g>
    );
  }
  const baseY = cy + r * 1.3;
  return (
    <g>
      {/* штифт оси у северного полюса */}
      <circle cx={nx} cy={ny} r={Math.max(2, r * 0.045)} fill={metal} stroke={metalDark} strokeWidth={1.5} />
      {/* ножка от южного полюса к основанию */}
      <path d={`M ${sx} ${sy} L ${sx} ${baseY - r * 0.12}`} stroke={metalDark} strokeWidth={Math.max(4, r * 0.07)} strokeLinecap="round" />
      <ellipse cx={cx} cy={baseY} rx={r * 0.62} ry={r * 0.17} fill={wood} />
      <ellipse cx={cx} cy={baseY - r * 0.06} rx={r * 0.62} ry={r * 0.17} fill="#9A6D48" />
      <ellipse cx={cx} cy={baseY - r * 0.06} rx={r * 0.52} ry={r * 0.12} fill="#8A5F3E" />
    </g>
  );
};
