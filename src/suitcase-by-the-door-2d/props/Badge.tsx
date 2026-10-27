// Бейдж мамы: светлая карточка «Айжан · Спикер» на синем шнурке. Карточка
// и шнурок — отдельные части: шнурок провисает между точками подвеса и
// карточкой и мягко успокаивается после движения (sag/swing задаёт сцена,
// без непрерывного вращения). Текст — настоящий (Nunito, кириллица).
//  • BadgeCard — карточка: (cx, cy) — центр, w — ширина (высота = 1,32·w),
//    rot — наклон (°). Отверстие для шнурка — сверху по центру.
//  • Lanyard — шнурок от точек a и b (например, пальцы или шея) к верхнему
//    краю карточки; sag — провис (px мира).
//  • BadgeOnChest — маленький бейдж на груди (средние и общие планы).
import { C } from "../theme";
import { FONT, roughRect } from "../kit";
import { SD2_TEXT } from "../script";
import type { Vec } from "../rig/motion";

export const BADGE_RATIO = 1.32;

export const BadgeCard: React.FC<{ readonly cx: number; readonly cy: number; readonly w: number; readonly rot?: number; readonly ink: number; readonly seed?: number }> = ({ cx, cy, w, rot = 0, ink, seed = 61 }) => {
  const h = w * BADGE_RATIO;
  const x = -w / 2;
  const y = -h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <rect x={x + 5} y={y + 7} width={w} height={h} rx={w * 0.06} fill={C.shadow} />
      <path d={roughRect(x, y, w, h, w * 0.06, seed, ink * 0.5)} fill={C.badge} stroke={C.ink} strokeWidth={ink} />
      {/* синяя полоса сверху с отверстием */}
      <path d={`M ${x + ink} ${y + h * 0.2} L ${x + w - ink} ${y + h * 0.2} L ${x + w - ink} ${y + w * 0.06} Q ${x + w - ink} ${y + ink} ${x + w - w * 0.06} ${y + ink} L ${x + w * 0.06} ${y + ink} Q ${x + ink} ${y + ink} ${x + ink} ${y + w * 0.06} Z`} fill={C.lanyard} />
      <rect x={-w * 0.12} y={y + h * 0.06} width={w * 0.24} height={h * 0.05} rx={h * 0.025} fill={C.badge} stroke={C.ink} strokeWidth={ink * 0.6} />
      {/* условный значок встречи: три линии-«волны» в круге */}
      <circle cx={0} cy={y + h * 0.38} r={w * 0.12} fill="none" stroke={C.lanyard} strokeWidth={ink * 1.1} />
      <path d={`M ${-w * 0.06} ${y + h * 0.38} L ${w * 0.06} ${y + h * 0.38} M ${0} ${y + h * 0.33} L ${0} ${y + h * 0.43}`} stroke={C.lanyard} strokeWidth={ink * 1.1} strokeLinecap="round" />
      <text x={0} y={y + h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={w * 0.2} fill={C.ink}>
        {SD2_TEXT.badge.name}
      </text>
      <rect x={-w * 0.34} y={y + h * 0.74} width={w * 0.68} height={h * 0.14} rx={h * 0.07} fill={C.yellow} stroke={C.ink} strokeWidth={ink * 0.6} />
      <text x={0} y={y + h * 0.845} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={w * 0.13} fill={C.ink}>
        {SD2_TEXT.badge.role}
      </text>
    </g>
  );
};

// Точка крепления шнурка на карточке (мировые координаты) для центра и наклона.
export const badgeHole = (cx: number, cy: number, w: number, rot = 0): Vec => {
  const h = w * BADGE_RATIO;
  const r = (rot * Math.PI) / 180;
  const dy = -h / 2 + h * 0.085;
  return { x: cx - Math.sin(r) * dy, y: cy + Math.cos(r) * dy };
};

// Шнурок: две ветви от a и b к отверстию карточки hole с провисом sag.
export const Lanyard: React.FC<{ readonly a: Vec; readonly b: Vec; readonly hole: Vec; readonly sag?: number; readonly width: number; readonly ink: number }> = ({ a, b, hole, sag = 20, width, ink }) => {
  const branch = (p: Vec) => {
    const mx = (p.x + hole.x) / 2;
    const my = (p.y + hole.y) / 2 + sag;
    return `M ${p.x} ${p.y} Q ${mx} ${my} ${hole.x} ${hole.y}`;
  };
  return (
    <g fill="none" strokeLinecap="round">
      {[a, b].map((p, i) => (
        <g key={i}>
          <path d={branch(p)} stroke={C.ink} strokeWidth={width + ink * 2} />
          <path d={branch(p)} stroke={C.lanyard} strokeWidth={width} />
        </g>
      ))}
      <circle cx={hole.x} cy={hole.y} r={width * 0.7} fill="#B9BEC8" stroke={C.ink} strokeWidth={ink * 0.6} />
    </g>
  );
};

// Маленький бейдж на груди: шнурок от плеч к карточке на уровне груди.
// (neckL, neckR) — точки у основания шеи; card — центр карточки.
export const BadgeOnChest: React.FC<{ readonly neckL: Vec; readonly neckR: Vec; readonly card: Vec; readonly w: number; readonly ink: number; readonly rot?: number }> = ({ neckL, neckR, card, w, ink, rot = 0 }) => {
  const hole = badgeHole(card.x, card.y, w, rot);
  return (
    <g>
      <Lanyard a={neckL} b={neckR} hole={hole} sag={4} width={Math.max(3, w * 0.09)} ink={ink * 0.7} />
      <BadgeCard cx={card.x} cy={card.y} w={w} rot={rot} ink={ink * 0.8} />
    </g>
  );
};
