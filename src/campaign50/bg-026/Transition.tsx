// Стык сцен: большой светлый стикер с рабочего стола отца мягко проходит
// через кадр по диагонали (20 кадров, середина — на склейке). Без вспышек
// и резких скачков масштаба; цвет чередуется (жёлтый / голубой).
import { useCurrentFrame } from "remotion";
import { easeInOut } from "./anim";
import { C } from "./palette";

export const Transition: React.FC<{ readonly variant?: number }> = ({ variant = 0 }) => {
  const f = useCurrentFrame();
  const p = easeInOut(f / 19);
  const dir = variant % 2 ? -1 : 1;
  const x = dir * (-2300 + p * 4600);
  const fill = variant % 2 ? C.sky : C.yellowSoft;
  const edge = variant % 2 ? "#CFE0F3" : C.yellow;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <g transform={`translate(${540 + x} 960) rotate(${dir * -8})`}>
        <rect x={-1100} y={-1350} width={2200} height={2700} rx={60} fill="rgba(20,40,90,0.08)" transform="translate(26 30)" />
        <rect x={-1100} y={-1350} width={2200} height={2700} rx={60} fill={fill} />
        <rect x={-1100} y={-1350} width={2200} height={110} rx={50} fill={edge} opacity={0.6} />
      </g>
    </svg>
  );
};
