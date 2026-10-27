// Общее для сцен: лист календаря крупным планом (в координатах кадра),
// перевод точек листа в мир кабинета, размеры персонажей.
import { BoardAt, type BoardState } from "../calendar";
import { easeInOut, lerp } from "../rig/motion";
import { STUDY } from "../sets/Study";

// Рост персонажей (px мира) на полу кабинета.
export const H = { dad: 1040, son: 720 } as const;

// Точка листа (единицы листа) → мир кабинета.
export const onBoard = (bx: number, by: number) => ({ x: STUDY.board.x + bx * STUDY.board.scale, y: STUDY.board.y + by * STUDY.board.scale });

// Крупный план листа: светлая стена, мягкая тень, медленное приближение.
export const BoardClose: React.FC<{
  readonly s: BoardState;
  readonly f: number;
  readonly len: number;
  readonly scale?: number;
  readonly x?: number;
  readonly y?: number;
  readonly push?: number;
}> = ({ s, f, len, scale = 0.86, x = 80, y = 300, push = 0.04 }) => {
  const k = lerp(1, 1 + push, easeInOut(f / Math.max(1, len)));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #F3E9D8 0%, #E6D3B8 75%)" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 60px, transparent 60px 120px)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "540px 820px" }}>
        <BoardAt s={s} x={x} y={y} scale={scale} />
      </div>
    </div>
  );
};
