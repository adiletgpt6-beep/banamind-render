// Стык сцен — «загрузка уровня»: квадраты-пиксели (90 px) волной по
// диагонали закрывают кадр и тут же открывают следующий. 19 кадров,
// середина — на склейке. Без вспышек: квадраты растут/уменьшаются.
import { useCurrentFrame } from "remotion";
import { easeInOut } from "./anim";
import { C } from "./palette";

const S = 90;
const COLS = 12;
const ROWS = 22;
export const TRANSITION_FRAMES = 19;

export const Transition: React.FC = () => {
  const f = useCurrentFrame();
  const cells: React.ReactNode[] = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const o = (i + j) / (COLS + ROWS - 2);
      const grow = easeInOut((f - o * 4) / 4.5);
      const shrink = easeInOut((f - 10 - o * 4) / 4.5);
      const k = grow * (1 - shrink);
      if (k <= 0.001) continue;
      const size = S * k;
      const fill = (i * 7 + j * 3) % 9 === 0 ? C.navy : (i + j) % 2 ? C.yellow : C.yellowDeep;
      cells.push(<rect key={`${i}-${j}`} x={i * S + (S - size) / 2} y={j * S + (S - size) / 2} width={size + 0.5} height={size + 0.5} fill={fill} />);
    }
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 80 }} shapeRendering="crispEdges">
      {cells}
    </svg>
  );
};
