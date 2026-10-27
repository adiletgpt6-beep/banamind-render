// Общие кадры (камеры) и время на часах офиса — чтобы стыки сцен совпадали.
import type { Cam } from "../Camera";
import { MONITOR_SCREEN, MUG_SCREEN, OFFICE } from "../sets/Office";

const cx = (r: { x: number; w: number }) => r.x + r.w / 2;
const cy = (r: { y: number; h: number }) => r.y + r.h / 2;

/** Офис: мама и монитор вместе (средний план). */
export const OFFICE_WIDE: Cam = { x: 690, y: 930, zoom: 1.38 };
/** Крупно: кружка-подставка с экраном (хук и отъезд в сцене 5). */
export const MUG_CLOSE: Cam = { x: cx(MUG_SCREEN), y: cy(MUG_SCREEN) + 16, zoom: 5.6 };
/** Мама рядом с кружкой (касание «телевизора»). */
export const MOM_MUG_CAM: Cam = { x: 330, y: 1010, zoom: 2.0 };
/** Экран монитора на весь кадр по ширине (поиск). */
export const MONITOR_CLOSE: Cam = { x: cx(MONITOR_SCREEN), y: cy(MONITOR_SCREEN), zoom: 2.45 };
/** Последний кадр сцены 5 = первый кадр финала: мама у монитора со страницей BalaGo. */
export const TRIAL_END_CAM: Cam = { x: 640, y: 950, zoom: 1.5 };

/** Стык сцен 4→5 (студия): камера на последнем кадре «rules» и первом «trial». */
export const RULES_TRIAL_CAM: Cam = { x: 540, y: 960, zoom: 1.03 };

/** Время на часах офиса (минуты от полуночи) по секунде ролика: 15:42 → … */
export const officeMinutes = (absSec: number) => 15 * 60 + 42 + absSec * 0.15;

/** Кадрирование студии внутри маленького экрана: центр и видимая ширина мира. */
export const STUDIO_IN_SCREEN = { px: 540, py: 1030, cropW: 920 } as const;

export { OFFICE };
