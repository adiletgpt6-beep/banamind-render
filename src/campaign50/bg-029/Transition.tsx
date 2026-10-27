// Стык сцен «через предмет»: в конце сцены камера уже наехала на
// предмет-переход (пряжка, бутылка, карточка), из его центра мягко
// раскрывается круг его цвета и закрывает кадр, а в новой сцене круг
// сжимается к тому же предмету уже в новом месте. 20 кадров, середина —
// на склейке; без вспышек, без затемнения.
import { useCurrentFrame } from "remotion";
import { easeInOut } from "./anim";

export const TRANSITION_FRAMES = 20;

export const Transition: React.FC<{
  readonly color: string;
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
}> = ({ color, from, to }) => {
  const f = useCurrentFrame();
  const half = TRANSITION_FRAMES / 2;
  const R = 2300;
  const grow = f < half;
  const r = grow ? easeInOut(f / half) * R : (1 - easeInOut((f - half) / half)) * R;
  const [cx, cy] = grow ? from : to;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <circle cx={cx} cy={cy} r={Math.max(0, r)} fill={color} />
    </svg>
  );
};
