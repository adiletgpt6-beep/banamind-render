// Тайминг ролика (секунды). Ключевые моменты привязаны к словам озвучки
// (AudioSyncSystem.word), остальное — к границам сцен.
import { word } from "./systems/AudioSyncSystem";

export const FPS = 30;
export const DURATION = 60;

export const T = {
  // Сцена 1 — один треугольник → розетка
  firstTri: 0.35,
  fan: 1.75, // появляются 2…6-й треугольники центра
  unfold: 2.75, // волны раскрытия рядов
  unfoldInterval: 0.14,
  unfoldDur: 0.36,
  breathe: 4.9, // узор «дышит» и вращается
  // Сцена 2 — рождение Земли
  fold: [6.3, 9.3] as const,
  grow: [7.3, 10.0] as const,
  colors: [8.7, word("s2", "земля", "e") + 0.05] as const,
  smooth: [10.2, 11.9] as const,
  space: [10.6, 12.6] as const,
  // Сцена 3 — день и ночь
  spin: [12.2, 23.4] as const,
  sunLight: [12.4, 14.6] as const,
  day: word("s3", "день"),
  night: word("s3", "ночь"),
  arrows: [word("s3", "вращается") - 0.2, 21.4] as const,
  dive: [21.6, 24.0] as const,
  // Сцена 4 — горы и лес
  landIn: [23.55, 24.05] as const,
  rise: [24.3, word("s4", "горы", "e") + 0.6] as const,
  snow: [26.6, 28.4] as const,
  trees: [word("s4", "а") - 0.2, 30.9] as const,
  flower: [30.6, 33.0] as const,
  // Сцена 5 — соты
  combIn: [33.35, 33.95] as const,
  cell1: word("s5", "пчелы"),
  cell2: word("s5", "строят"),
  cell3: word("s5", "ячейки"),
  combGrow: [word("s5", "ячейки") + 0.45, 38.4] as const,
  repeat: [word("s5", "видишь"), 40.2] as const,
  combToPattern: [40.4, 43.2] as const,
  // Сцена 6 — знамения в творении
  ornamentIn: [42.9, 43.5] as const,
  ornamentBloom: [43.3, 46.4] as const,
  sky: word("s6", "небе"),
  earth: word("s6", "земле"),
  dayNight: word("s6", "дня"),
  reflectText: [48.5, 52.9] as const,
  // Сцена 7 — главная мысль
  open: [52.6, 53.9] as const,
  quote: [53.45, 57.25] as const,
  logo: [57.1, 58.5] as const,
} as const;
