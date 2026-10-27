// Мягкие переходы на нескольких стыках сцен (остальные связки — прямые
// склейки или по форме/движению предметов внутри сцен): короткое тёплое
// растворение ≈ 0,5 с, без вспышки белым.
//   день → вечер в офисе (сц. 7 → 8), офис → вечер дома (сц. 8 → 9),
//   человеческий финал → бренд (сц. 10 → 11).
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import type { M13SceneId } from "./script";

const SOFT: readonly M13SceneId[] = ["evening", "home", "brand"];
const HALF = 8;

export const Transitions: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  let o = 0;
  for (const id of SOFT) {
    const at = tl.scenes.find((s) => s.id === id)!.from;
    const d = Math.abs(f - at);
    if (d < HALF) o = Math.max(o, 1 - d / HALF);
  }
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, backgroundColor: "#F6EBDD", opacity: 0.7 * o }} />;
};
