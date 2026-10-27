// Вставка сверху: альбом с рисунком лежит на столике рядом с телефоном,
// на экране которого — календарь. Мама касается края альбома.
import { AbsoluteFill } from "remotion";
import { Album, CalendarScreen, Phone } from "../props";
import { WarmGrade } from "../sets/LivingRoom";

export const TableTop: React.FC<{ readonly k: number; readonly hand: number; readonly phoneDim?: number }> = ({ k, hand, phoneDim = 0 }) => (
  <AbsoluteFill style={{ background: "#C99A68" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M -20 ${i * 130 + 40} C 300 ${i * 130 + 10} 700 ${i * 130 + 80} 1100 ${i * 130 + 30}`} stroke="#B98A5C" strokeWidth={4} fill="none" opacity={0.5} />
      ))}
      <g transform={`translate(540 860) scale(${1 + k * 0.08}) translate(-540 -860)`}>
        <g transform="translate(150 1460) rotate(14) scale(0.62)">
          <Phone dark={phoneDim}>
            <CalendarScreen highlight={0} mark={1} />
          </Phone>
        </g>
        <g transform="translate(560 800) rotate(-5) scale(1.32)">
          <Album uid="album-top" glow={hand} />
        </g>
        {/* рука мамы (жёлтый рукав) тянется к краю альбома */}
        <g transform={`translate(${-260 + hand * 300} ${1240 - hand * 120}) rotate(-28)`}>
          <rect x={-400} y={-46} width={420} height={92} rx={46} fill="#F4C430" />
          <rect x={-30} y={-48} width={30} height={96} rx={14} fill="#D9A91E" />
          <ellipse cx={46} cy={0} rx={56} ry={44} fill="#F2C9A4" />
          {[-26, -8, 10, 28].map((y) => (
            <rect key={y} x={70} y={y - 8} width={52} height={17} rx={8.5} fill="#F2C9A4" />
          ))}
          <ellipse cx={40} cy={-44} rx={26} ry={13} fill="#F2C9A4" transform="rotate(-30 40 -44)" />
        </g>
      </g>
    </svg>
    <WarmGrade strength={0.7} />
  </AbsoluteFill>
);
