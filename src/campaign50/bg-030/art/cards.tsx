// Карточки мамы «Үй», «Мектеп», «Сабактын убактысы»: белые, с жёлтой
// полосой и тёмно-синей иконкой (без схемы-пазла и без карты).
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { ClockIcon, HomeIcon, SchoolIcon } from "./city";

export type CardKind = "home" | "school" | "time";

export const PlanCard: React.FC<{
  readonly kind: CardKind;
  readonly label: string;
  readonly x: number; // центр
  readonly y: number;
  readonly w: number;
  readonly rot?: number;
  readonly lift?: number; // 0…1 — карточку подняли (тень больше)
  readonly glow?: number;
}> = ({ kind, label, x, y, w, rot = 0, lift = 0, glow = 0 }) => {
  const h = w * 0.66;
  const fs = label.length > 10 ? w * 0.105 : w * 0.15;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2 + 8 + lift * 14} y={-h / 2 + 12 + lift * 22} width={w} height={h} rx={w * 0.06} fill="#000" opacity={0.12 + lift * 0.06} />
      {glow > 0 ? <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={w * 0.08} fill="none" stroke={C.yellow} strokeWidth={w * 0.03} opacity={glow} /> : null}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.06} fill={C.card} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.16} rx={w * 0.06} fill={C.yellow} />
      <rect x={-w / 2} y={-h / 2 + h * 0.08} width={w} height={h * 0.08} fill={C.yellow} />
      <g transform={`translate(0 ${-h * 0.05}) scale(${w / 190})`}>
        {kind === "home" ? <HomeIcon s={1} /> : kind === "school" ? <SchoolIcon s={1} /> : <ClockIcon s={1} h={8} />}
      </g>
      <text x={0} y={h * 0.33} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={fs} fill={C.navy}>
        {label}
      </text>
    </g>
  );
};
