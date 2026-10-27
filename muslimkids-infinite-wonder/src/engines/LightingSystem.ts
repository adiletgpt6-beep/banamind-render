// Свет и палитра «Infinite Wonder Design System».
// Одно солнце на весь фильм: в космосе оно справа, и в горной долине
// свет приходит под тем же углом к поверхности, что и на орбите.
import { Color, Vector3 } from "three";

export const PALETTE = {
  night: "#081526",
  sapphire: "#1B508B",
  sky: "#7AC5EA",
  turquoise: "#52D0CC",
  emerald: "#3AA67C",
  gold: "#EFC475",
  milk: "#F7F3E9",
  brown: "#93704F",
} as const;

export const col = (hex: string) => new Color(hex);

/** Направление НА солнце в космической сцене. */
export const SPACE_SUN = new Vector3(0.62, 0.28, 0.78).normalize();

/** Направление на солнце в горной долине (высота ~37°, справа-спереди). */
export const NATURE_SUN = new Vector3(0.62, 0.6, 0.5).normalize();

export const NATURE_LIGHT = {
  sunColor: new Color("#FFF1D6"),
  sunIntensity: 2.6,
  skyColor: new Color("#BFE3F5"),
  groundColor: new Color("#5E7A4A"),
  hemiIntensity: 1.05,
  fogColor: new Color("#CFE6F1"),
  fogDensity: 0.00017,
};

/** Свет «увеличенной модели»: мягкий, с холодным контровым. */
export const MODEL_LIGHT = {
  key: new Vector3(0.5, 0.8, 0.6).normalize(),
  rim: new Vector3(-0.7, 0.3, -0.6).normalize(),
};
