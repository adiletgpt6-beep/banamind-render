// Контрольная композиция (папка Dev): оба ракурса одного состояния глобуса,
// угол φ идёт по кадру — для проверки направления вращения, света и метки.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { GlobeView } from "./globe/GlobeView";

export const GlobeCheck: React.FC = () => {
  const f = useCurrentFrame();
  const phi = 315 + f * 1.5;
  return (
    <AbsoluteFill style={{ backgroundColor: "#F1E7D6", fontFamily }}>
      <svg width={1920} height={1080}>
        <GlobeView uid="gc-side" cx={520} cy={520} r={330} phi={phi} view="side" lamp={1} />
        <GlobeView uid="gc-top" cx={1380} cy={520} r={330} phi={phi} view="top" lamp={1} pathHint />
        <text x={520} y={960} textAnchor="middle" fontSize={40} fill="#333">вид сбоку · φ = {phi.toFixed(0)}°</text>
        <text x={1380} y={960} textAnchor="middle" fontSize={40} fill="#333">вид сверху (Северный полюс) · лампа справа</text>
      </svg>
    </AbsoluteFill>
  );
};
