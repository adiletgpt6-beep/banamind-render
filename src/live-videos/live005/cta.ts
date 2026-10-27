// Геометрия CTA LIVE-005 (без импортов Remotion — проверяется тестом).
// Пузырь WhatsApp — ниже рук (раскрытые ладони 30,8–31,4 с доходят до y ≈ 1200).
export const WA_BUBBLE = { left: 170, top: 1215, width: 740, height: 136 } as const;
// Стрелка шапки Instagram начинается у поднятого пальца, но всегда левее лица:
// автор в 28,1–28,7 с смещается влево, поэтому начало стрелки следует за треком лица.
import { faceAt } from "./face.ts";
import { GESTURE } from "./timing.ts";

export const IG_CARD = { left: 120, top: 246, width: 720, height: 214 } as const;
// Строка ссылки в карточке: значок ≈ 314–352, слово «шилтеме» ≈ 362–520 px.
export const IG_LINK = { x: 440, y: IG_CARD.top + IG_CARD.height } as const;
// Стрелка приходит снизу под середину «шилтеме» и указывает вверх на ссылку.
export const IG_ARROW_END = { x: IG_LINK.x, y: IG_LINK.y + 12 } as const;
export const IG_ARROW_CTRL = { x: 300, y: 560 } as const;

export const igArrowStart = (t: number) => {
  const f = faceAt(t);
  const tip = GESTURE.pointUp.tip;
  return { x: Math.min(tip.x - 34, f.cx - f.w * 0.62 - 30), y: tip.y - 30 };
};

// Точка квадратичной кривой стрелки (u = 0 — у пальца, 1 — у ссылки).
export const igArrowPoint = (t: number, u: number) => {
  const a = igArrowStart(t);
  const c = IG_ARROW_CTRL;
  const b = IG_ARROW_END;
  return { x: (1 - u) ** 2 * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) ** 2 * a.y + 2 * (1 - u) * u * c.y + u * u * b.y };
};
