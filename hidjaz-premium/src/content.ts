// Содержание рекламы @hidjaz.premium. Всё, что видит и слышит зритель,
// задаётся здесь. Факты о товаре (названия, материалы, цены, способ заказа)
// попадают сюда только из подтверждённых материалов — см. INSTAGRAM_ANALYSIS.md.
//
// confirmed: false — содержание ещё не подтверждено (технический прогон):
// в кадре появляется пометка «ТЕХНИЧЕСКИЙ ПРОГОН», а сборка финала падает
// (tools/verify-content.mjs).

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 60;

export type Photo = {
  /** файл в hidjaz-premium/public/products/ (null — заглушка в техпрогоне) */
  readonly file: string | null;
  /** что изображено — из подписи владельца, а не догадка */
  readonly label: string;
  /** фокус кадра для обрезки, 0..1 */
  readonly focus?: readonly [number, number];
};

export type Line = {
  readonly id: string;
  /** текст субтитров (кыргызча, ң ө ү) */
  readonly text: string;
  /** текст для синтеза, если произношение нужно подсказать */
  readonly spoken?: string;
  /** слова, выделяемые цветом акцента */
  readonly accent?: readonly string[];
  /** секунда начала внутри ролика (якорь сцены) */
  readonly at: number;
};

export type Feature = { readonly title: string; readonly sub: string; readonly photo: number };

export const CONTENT = {
  confirmed: false,
  brand: {
    handle: "@hidjaz.premium",
    /** название бренда как на логотипе; null — показывается handle */
    name: null as string | null,
    /** файл логотипа в public/brand/ или null */
    logo: null as string | null,
    /** палитра бренда — заменить подтверждёнными цветами из профиля */
    palette: {
      bg: "#F5EFE6",
      bgDeep: "#E7DCCB",
      ink: "#1F1A17",
      accent: "#B8925A",
      accentSoft: "#E9D8B8",
      deep: "#23332E",
    },
  },
  /** реальные фото товара, порядок = порядок появления */
  photos: [
    { file: null, label: "Фото товара 1 (герой)" },
    { file: null, label: "Фото товара 2 (деталь)" },
    { file: null, label: "Фото товара 3" },
    { file: null, label: "Фото товара 4" },
    { file: null, label: "Фото товара 5" },
    { file: null, label: "Фото товара 6" },
  ] as readonly Photo[],
  hook: { kicker: "hidjaz.premium", title: ["Техникалык", "прогон"], accent: ["прогон"] },
  need: { title: ["Сценарий", "товар тастыктала", "элек"], accent: ["тастыктала"] },
  features: [
    { title: "Өзгөчөлүк 1", sub: "тастыкталган факт", photo: 1 },
    { title: "Өзгөчөлүк 2", sub: "тастыкталган факт", photo: 2 },
    { title: "Өзгөчөлүк 3", sub: "тастыкталган факт", photo: 3 },
  ] as readonly Feature[],
  showcase: { title: ["Сулуулук", "деталдарда"], accent: ["деталдарда"] },
  cta: {
    /** подтверждённый способ заказа — только из профиля */
    action: "Direct'ке жазыңыз",
    sub: "Профилдеги шилтеме аркылуу",
    /** дополнительная строка (город, доставка) — только подтверждённое */
    note: null as string | null,
  },
  /** реплики озвучки; при confirmed: false — пустые (без голоса) */
  lines: [] as readonly Line[],
} as const;

// Сцены: начало и длительность в секундах (структура брифа 0–5–15–35–50–60).
export const SCENES = {
  hook: { from: 0, dur: 5 },
  need: { from: 5, dur: 10 },
  features: { from: 15, dur: 20 },
  showcase: { from: 35, dur: 15 },
  cta: { from: 50, dur: 10 },
} as const;
export type SceneId = keyof typeof SCENES;
