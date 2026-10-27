// Мягкие переходы на нескольких стыках сцен (остальные связки — внутри
// сцен, по форме предметов): тёплая вспышка-растворение 0,5 с.
//   офис → дом (сц. 7 → 8): «раньше обычного», без лозунгов;
//   вход в воспоминание о прошлой среде и выход из него (сц. 10 → 11 → 12).
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import type { Su2SceneId } from "./script";

const SOFT: readonly Su2SceneId[] = ["dinner", "memory", "search"];
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
  return <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFF4E2", opacity: 0.85 * o }} />;
};
