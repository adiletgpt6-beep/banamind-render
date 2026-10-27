// Палитра фильма BM-024 «Бизнес с нуля» — «BanaMind Startup Lab / лаборатория гипотез».
// Светлая лаборатория: чертёжная сетка, стеклянные капсулы-гипотезы (бирюза), капли
// сигнала клиента (морская волна), воздушные шары «метрик тщеславия» (розово-коралловые,
// пустые), шестерни полезных метрик (янтарь), бумажный прототип (крем), курс-компас
// (фиолет). Кадр всегда светлый и контрастный; у каждой главы свой мягкий фон.
import type { ChapterId } from "./types";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const C = {
  ink: "#1d2740",
  inkSoft: "#4a5675",
  paper: "#fffdf6",
  grid: "#dbe6f5",
  // гипотеза, стекло лаборатории
  glass: "#bdeeff",
  cyan: "#27b4e6",
  cyanDeep: "#127fb0",
  cyanLight: "#d9f4ff",
  // сигнал клиента, проверенные данные
  teal: "#19b39a",
  tealDeep: "#0f8574",
  tealLight: "#cdf3ea",
  // полезные метрики, шестерни
  gold: "#f5b52e",
  goldDeep: "#c98612",
  goldLight: "#ffe39a",
  yellow: "#ffd23f",
  // метрики тщеславия: шары
  pink: "#ff7eb0",
  pinkLight: "#ffd6e7",
  coral: "#ff6b5e",
  coralDeep: "#d8433a",
  coralLight: "#ffd9d4",
  // курс, решения
  violet: "#7d5ce8",
  violetDeep: "#5a3cc0",
  violetLight: "#e6dcff",
  // прототип
  cream: "#fff3d6",
  kraft: "#e8c48f",
  sky: "#47a8f0",
  skyDeep: "#1f78c4",
  skyLight: "#d3ebff",
  mint: "#2fbf8f",
  mintDeep: "#1c8f69",
  mintLight: "#c9f2e2",
  orange: "#ff9f43",
  orangeLight: "#ffe6cc",
  grey: "#9aa3b5",
  greyLight: "#eef1f6",
  green: "#3fb67c",
  greenDeep: "#23895a",
  red: "#e5484d",
  white: "#ffffff",
};

// Фон каждой главы (верх → низ градиента)
export const CHAPTER_BG: Record<ChapterId, [string, string]> = {
  c00: ["#eefaff", "#cdeefc"], // вступление: стеклянная лаборатория
  c01: ["#fff6dc", "#ffe7a8"], // миф
  c02: ["#eef3ff", "#d6e1fb"], // стартап = эксперимент
  c03: ["#eafaf5", "#c9eee2"], // обучение
  c04: ["#f3eeff", "#ddd2fb"], // прыжки веры
  c05: ["#fff4e4", "#ffe2b8"], // MVP
  c06: ["#ecf8ff", "#cbe8fa"], // цикл
  c07: ["#fff0f5", "#fbd5e3"], // метрики
  c08: ["#f1efff", "#d9d2fb"], // вираж
  c09: ["#effaf0", "#d0efd3"], // партии
  c10: ["#fff7e6", "#ffe5b0"], // рост
  c11: ["#f2f5fa", "#dbe2ee"], // адаптация
  c12: ["#eefaf6", "#cdeee3"], // инновации и потери
  c13: ["#eefaff", "#d0eefc"], // итог
};

export const CHAPTERS: { id: ChapterId; label: string }[] = [
  { id: "c00", label: "Начало" },
  { id: "c01", label: "Миф о гениальном старте" },
  { id: "c02", label: "Стартап — это эксперимент" },
  { id: "c03", label: "Проверенное знание" },
  { id: "c04", label: "Прыжки веры" },
  { id: "c05", label: "Минимальный продукт" },
  { id: "c06", label: "Создать · оценить · научиться" },
  { id: "c07", label: "Честные метрики" },
  { id: "c08", label: "Сменить курс или продолжать?" },
  { id: "c09", label: "Малые партии" },
  { id: "c10", label: "Двигатели роста" },
  { id: "c11", label: "Адаптация и «пять почему»" },
  { id: "c12", label: "Инновации без потерь" },
  { id: "c13", label: "Итог" },
];

export const FONT = "Nunito, 'Segoe UI', sans-serif";
export const HEAVY = "Rubik, Nunito, sans-serif";
export const SERIF = "'PT Serif', Georgia, serif";
export const DISPLAY = "'Russo One', Rubik, sans-serif";
