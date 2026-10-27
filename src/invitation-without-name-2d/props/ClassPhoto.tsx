// Фотография из класса (сцена 15, затем — над столом Эмира в сцене 18):
// папа и Эмир у демонстрационного стола, на столе — тот же бумажный мост
// (сложенный лист на двух стопках книг) и та же жёлтая машинка. Персонажи
// нарисованы тем же ригом (Figure) в той же одежде. Один ассет во всех
// кадрах. PhotoArt: (0, 0) — центр, ширина w, высота w · PHOTO_RATIO.
import { Figure } from "../rig/Figure";
import { LOOKS } from "../rig/looks";
import { stillPose } from "../rig/pose";
import { C } from "../theme";
import { BridgeSide } from "./Bridge";

export const PHOTO_RATIO = 0.78;

export const PhotoArt: React.FC<{ readonly w: number; readonly uid: string }> = ({ w, uid }) => {
  const u = w / 100;
  const h = 78;
  const id = `ph-${uid}`;
  return (
    <g transform={`translate(${-w / 2} ${(-h / 2) * u}) scale(${u})`}>
      <rect x={0.8} y={1.2} width={100} height={h} fill="rgba(23,23,23,0.14)" />
      <rect x={0} y={0} width={100} height={h} fill={C.white} stroke="#DAD6CC" strokeWidth={0.3} />
      <defs>
        <clipPath id={id}>
          <rect x={4} y={4} width={92} height={h - 14} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={4} y={4} width={92} height={h - 14} fill="#EFEDE4" />
        {/* доска на дальней стене */}
        <rect x={10} y={4} width={64} height={22} fill="#22354F" />
        <rect x={20} y={10} width={44} height={2.6} fill="#F4F1E8" opacity={0.85} />
        <rect x={30} y={15} width={24} height={1} fill={C.yellow} opacity={0.8} />
        {/* окно справа */}
        <rect x={80} y={8} width={14} height={26} fill="#D4E5F2" stroke={C.white} strokeWidth={1.2} />
        <g transform="translate(31 82) scale(0.083)">
          <Figure uid={`${id}-dad`} look={LOOKS.azamat} pose={stillPose({ bodyTurn: 0.12, headTurn: 0.1, expr: { browIn: 2, browOut: 3, lid: 0.15, smile: 0.85 } })} />
        </g>
        <g transform="translate(64 82) scale(0.07)">
          <Figure uid={`${id}-son`} look={LOOKS.emir} pose={stillPose({ bodyTurn: -0.12, headTurn: -0.08, expr: { browIn: 2, browOut: 3, lid: 0.1, smile: 0.95 } })} />
        </g>
        {/* демонстрационный стол и мост */}
        <rect x={4} y={54} width={92} height={2.6} fill={C.wood} />
        <rect x={6} y={56.6} width={88} height={12} fill={C.navy} />
        <g transform="translate(0 0)">
          <BridgeSide g={{ cx: 48, tableY: 54, span: 18, bookW: 7, stackH: 6.4 }} mode="folded" sag={0} carX={48} carLen={9} />
        </g>
      </g>
    </g>
  );
};
