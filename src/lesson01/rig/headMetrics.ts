// Вертикали черт лица и точка крепления шеи (без React — для расчётов).
import type { Look } from "./looks.ts";

export const headMetrics = (look: Look) => {
  const b = look.body;
  const R = b.headW / 2;
  const chinY = b.headH - R;
  const c = b.child;
  // вертикали черт (от центра черепа вниз)
  const eyeY = R * (0.22 + 0.06 * c);
  const noseY = eyeY + R * (0.48 - 0.1 * c);
  const mouthY = noseY + R * (0.34 - 0.04 * c);
  return { R, chinY, eyeY, noseY, mouthY, neckY: chinY - R * 0.32 };
};
