// Руль сбоку (немного в три четверти): обод-эллипс, ступица, рулевая колонка.
import { INK, type Pt } from "./core";

export const SteeringWheel: React.FC<{ readonly c: Pt; readonly tilt: number; readonly r: number; readonly steer?: number }> = ({ c, tilt, r, steer = 0 }) => (
  <g transform={`translate(${c.x} ${c.y}) rotate(${tilt})`}>
    {/* колонка к панели */}
    <line x1={0} y1={0} x2={r * 1.25} y2={r * 0.25} stroke={INK} strokeWidth={17} strokeLinecap="round" />
    <line x1={0} y1={0} x2={r * 1.25} y2={r * 0.25} stroke="#56607A" strokeWidth={11} strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={r * 0.3} ry={r} fill="none" stroke={INK} strokeWidth={15} />
    <ellipse cx={0} cy={0} rx={r * 0.3} ry={r} fill="none" stroke="#3D4660" strokeWidth={9} />
    <g transform={`rotate(${steer * 0.4})`}>
      <line x1={0} y1={-r * 0.92} x2={0} y2={r * 0.92} stroke="#3D4660" strokeWidth={6} />
    </g>
    <ellipse cx={2} cy={0} rx={r * 0.16} ry={r * 0.3} fill="#56607A" stroke={INK} strokeWidth={3} />
    <ellipse cx={-1} cy={-r * 0.55} rx={r * 0.1} ry={r * 0.22} fill="#FFFFFF" opacity={0.25} />
  </g>
);
