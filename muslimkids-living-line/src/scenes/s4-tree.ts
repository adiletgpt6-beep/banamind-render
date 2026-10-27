// Scene 4 — "A small miracle" (00:23–00:33).
// The drop lands and becomes a ripple; the line dives into the soil, draws
// a seed, rises as a sprout and grows — branching — into a tree whose
// crown is closed by the main tip and its mirrored branch.

import { ease } from "../engines/LivingLineEngine.ts";
import type { JourneyBuilder } from "../engines/SceneTransitionEngine.ts";
import { scale, smoothPath } from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";
import { TREE_U } from "../episodes/ep001/world.ts";
import { dirUp, local, ripple } from "./s3-world.ts";

const U = TREE_U;

export const SEED: [number, number][] = [
  [U, -8.4], [U + 2.6, -9.2], [U + 4, -11], [U + 2.6, -12.8], [U, -13.4],
  [U - 2.6, -12.8], [U - 4, -11], [U - 2.6, -9.2], [U, -8.4],
];
export const TRUNK: [number, number][] = [
  [U, -8.4], [U - 0.5, -2], [U + 0.8, 6], [U - 1, 14], [U + 0.4, 24], [U - 0.6, 34], [U, 44], [U, 52],
];
export const LEAVES: [number, number][][] = [
  [[U + 0.7, 7], [U + 3.5, 10.5], [U + 7.5, 12.2], [U + 4.5, 8.4], [U + 0.7, 7]],
  [[U + 0.4, 9.5], [U - 3, 12.6], [U - 7, 13.6], [U - 3.8, 10.4], [U + 0.4, 9.5]],
];
export const BRANCHES: { pts: [number, number][]; at: number }[] = [
  { pts: [[U, 25], [U - 6, 31], [U - 11, 38], [U - 16, 46]], at: 800 },
  { pts: [[U, 29], [U + 6, 36], [U + 11, 43], [U + 16, 50]], at: 808 },
  { pts: [[U, 37], [U - 5, 44], [U - 9, 52], [U - 11, 60]], at: 818 },
  { pts: [[U, 40], [U + 4, 47], [U + 8, 55], [U + 9, 63]], at: 826 },
  { pts: [[U, 46], [U - 2, 56], [U - 3, 68]], at: 834 },
];
/** Right half of the crown, from the trunk top to the crown top. */
export const CROWN_R: [number, number][] = [
  [U, 52], [U + 13, 52.5], [U + 22, 57], [U + 27, 65], [U + 25, 73], [U + 21, 81],
  [U + 13, 87], [U + 6, 91.5], [U, 93],
];
export const CROWN_L: [number, number][] = CROWN_R.map(([u, h]) => [2 * U - u, h]);

export const buildScene4 = (j: JourneyBuilder) => {
  // 1. Ripples spread from the impact (the drop itself became the first ring).
  [0, 1].forEach((k) =>
    j.branch(
      `s4-ripple-${k}`,
      (f) => {
        const t = Math.min(1, Math.max(0, (f - 708 - k * 8) / 40));
        return smoothPath(ripple(6 + 26 * t, 1.8 + 1.6 * t), 1);
      },
      708 + k * 8,
      10,
      {
        width: 2.5,
        glow: 0.4,
        color: PALETTE.blue,
        opacity: (f) => Math.max(0, 1 - (f - 712 - k * 8) / 36),
      },
    ),
  );
  // 2. The line dives into the soil…
  const seed = local(SEED);
  j.travel("s4-dive", seed[0], 18, { at: 716, inDir: scale(dirUp(U), -1), bend: 0.6, width: 5, glow: 0.8 });
  // 3. …draws a seed…
  j.draw("s4-seed", smoothPath(seed, 1), 18, { ease: ease.draw, width: 4.5, glow: 0.8 });
  // 4. …and rises as a sprout that becomes a trunk.
  j.draw("s4-trunk", smoothPath(local(TRUNK), 1), 82, {
    at: 754,
    ease: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    width: 6,
    glow: 0.8,
  });
  LEAVES.forEach((l, i) =>
    j.branch(`s4-leaf-${i}`, smoothPath(local(l), 1), 772 + i * 6, 16, {
      width: 3,
      glow: 0.4,
      color: PALETTE.leafLight,
      opacity: (f) => 1 - Math.min(1, Math.max(0, (f - 846) / 24)),
    }),
  );
  // 5. The line splits into branches (gold — the important lines of the tree).
  BRANCHES.forEach((b, i) =>
    j.branch(`s4-branch-${i}`, smoothPath(local(b.pts), 1), b.at, 24, { width: 4, glow: 0.6, color: PALETTE.gold }),
  );
  // 6. The crown: the main tip draws one half, its mirror branch the other.
  j.draw("s4-crown", smoothPath(local(CROWN_R), 1), 40, { at: 838, ease: ease.flow, width: 5, glow: 0.7 });
  j.branch("s4-crown-l", smoothPath(local(CROWN_L), 1), 838, 40, { width: 5, glow: 0.7, color: PALETTE.gold, ease: ease.flow });
};
