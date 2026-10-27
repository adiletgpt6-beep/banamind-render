// Раскладка кадра по времени ролика: размер основной панели (в сценах
// обнаружения записей, разговора, прослушивания и ужина — крупнее, место
// рассказчика отдаётся семье), присутствие рассказчика, метка дня и
// заголовок сцены. Без зависимостей от Remotion.
import { FU2_SCENES, FU2_TEXT, type Fu2SceneId } from "./script.ts";
import { LAYOUT } from "./theme.ts";

const BIG: ReadonlySet<Fu2SceneId> = new Set(["saturday", "why", "listen", "dinner", "contact"]);
const T = 0.5; // переход размеров панели, с

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

export const sceneOf = (t: number) => FU2_SCENES.find((s) => t >= s.from && t < s.to) ?? FU2_SCENES[FU2_SCENES.length - 1];

// 0 — обычная панель, 1 — крупная (плавно на границах сцен).
export const bigAt = (t: number) => {
  let v = 0;
  for (const s of FU2_SCENES) {
    if (!BIG.has(s.id)) continue;
    v = Math.max(v, Math.min(smooth((t - s.from + T / 2) / T), 1 - smooth((t - s.to + T / 2) / T)));
  }
  return v;
};

export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
export const panelAt = (t: number): Rect => {
  const p = LAYOUT.panel;
  return { x: p.x, y: p.y, w: p.w, h: p.h + (p.bigH - p.h) * bigAt(t) };
};

// Рассказчик виден, пока панель обычная (и не на контактной карточке).
export const narratorPresence = (t: number) => {
  const contact = FU2_SCENES.find((s) => s.id === "contact")!;
  return (1 - bigAt(t)) * (1 - smooth((t - contact.from + 0.3) / 0.4));
};

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
      return FU2_TEXT.voiceMemos;
    case "before":
      return FU2_TEXT.before;
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
