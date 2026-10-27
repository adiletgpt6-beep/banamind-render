// Фирменная палитра и шрифты Muslim Kids (общие для всех роликов серии).
export const MK = {
  black: "#08090D",
  white: "#FFFFFF",
  blue: "#2878FF",
  sky: "#8FC5FF",
  grey: "#8A8F9C",
} as const;

export const FONT = {
  // Inter — текст и инфографика, Unbounded — крупная кинетическая типографика,
  // Amiri — арабский текст Корана (только проверенные фразы).
  body: "MK Inter",
  display: "MK Unbounded",
  arabic: "MK Amiri",
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export type Rgb = readonly [number, number, number];
export const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const RGB = {
  black: hexToRgb(MK.black),
  white: hexToRgb(MK.white),
  blue: hexToRgb(MK.blue),
  sky: hexToRgb(MK.sky),
  grey: hexToRgb(MK.grey),
} as const;
