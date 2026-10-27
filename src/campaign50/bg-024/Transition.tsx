// Стык сцен: крупная светлая деталь пазла мягко проходит через кадр
// (18 кадров, середина — на склейке), без вспышек и скачков масштаба.
import { useCurrentFrame } from "remotion";
import { easeInOut } from "./anim";
import { C } from "./palette";
import { piecePath } from "./parts";

export const Transition: React.FC = () => {
  const f = useCurrentFrame();
  const p = easeInOut(f / 17);
  const x = -2000 + p * 3400;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <g transform={`translate(${x} -60) rotate(-6)`}>
        <path d={piecePath(1800, 2100)} fill={C.yellowSoft} />
        <path d={piecePath(1800, 2100)} fill="none" stroke={C.yellow} strokeWidth={24} />
      </g>
    </svg>
  );
};
