// Раскладка кадра по времени ролика: основная панель (одна, крупная — на
// всё время ролика), метка дня и заголовок сцены. Без зависимостей от
// Remotion.
import { FU2_SCENES, FU2_TEXT, type Fu2SceneId } from "./script.ts";
import { LAYOUT } from "./theme.ts";

export const sceneOf = (t: number) => FU2_SCENES.find((s) => t >= s.from && t < s.to) ?? FU2_SCENES[FU2_SCENES.length - 1];

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export const panelAt = (): Rect => LAYOUT.panel;

// Сцена «Беш күн»: моменты сохранения записи каждого дня (с от начала
// сцены). Метка дня меняется чуть раньше — когда начинается новый день.
export const WEEK_SAVE = [1.3, 2.75, 4.2, 5.65, 7.1] as const;
export const WEEK_DAY_FROM = [0, 1.75, 3.2, 4.65, 6.1] as const;
const weekDayAt = (local: number) => WEEK_DAY_FROM.filter((x) => local >= x).length - 1;

// Метка дня в строке метаданных.
const DAYS = ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума"] as const;
export const dayLabelAt = (t: number): string => {
  const s = sceneOf(t);
  switch (s.id) {
    case "intro":
    case "before":
      return "";
    case "gate":
    case "car":
      return DAYS[0];
    case "week":
      return DAYS[Math.max(0, Math.min(4, weekDayAt(t - s.from)))];
    case "dinner":
      return FU2_TEXT.nextMonday;
    case "contact":
      return "";
    default:
      return FU2_TEXT.saturday;
  }
};

export const titleOf = (id: Fu2SceneId): readonly [string, string] | null =>
  (FU2_TEXT.titles as Partial<Record<Fu2SceneId, readonly [string, string]>>)[id] ?? null;
