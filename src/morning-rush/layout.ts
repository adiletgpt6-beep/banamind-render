import { SAFE } from "../config";

// Положение карточек «Жумуш / Мектеп / Жол»: в сцене busy они разбросаны
// (суета), в сцене launch складываются в ровный ряд-маршрут.
export const BUSY_CARDS = [
  { x: 90, y: SAFE.top + 180, w: 500, h: 150, rotate: -3 },
  { x: 110, y: SAFE.top + 360, w: 500, h: 150, rotate: 2.5 },
  { x: 90, y: SAFE.top + 540, w: 500, h: 150, rotate: -2 },
] as const;

// Ряд из трёх карточек по центру кадра (сцена launch).
export const ROW_CARD = { w: 236, h: 200, gap: 36, y: SAFE.top + 470 } as const;
export const rowX = (i: number) => {
  const total = 3 * ROW_CARD.w + 2 * ROW_CARD.gap;
  return (1080 - total) / 2 + i * (ROW_CARD.w + ROW_CARD.gap);
};
