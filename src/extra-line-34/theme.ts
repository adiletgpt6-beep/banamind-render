// Цвета, шрифт и безопасные поля BalaGo34ExtraLine (№34).
// Светлый тёплый фон (#F7F5EF) с очень слабой фактурой, белые карточки с
// мягкими тенями, тёмно-синий текст (#17263D), фирменный жёлтый BalaGo
// (#FFD447). Проблемная строка объявления — мягкий янтарь (без красного).
// Дом — спокойные серо-голубые, бежевые и приглушённые зелёные тона.
export const C = {
  bg: "#F7F5EF",
  bgDeep: "#EFEBE1",
  card: "#FFFFFF",
  ink: "#17263D",
  inkSoft: "#55627A",
  inkMute: "#8A94A6",
  line: "#E4E0D6",
  yellow: "#FFD447",
  yellowDeep: "#F2B92B",
  yellowSoft: "#FFF1BF",
  amber: "#F4B451",
  amberSoft: "#FFEBC4",
  amberLine: "#E8A23A",
  select: "rgba(102,150,220,0.28)",
  caret: "#2F6FD0",
  check: "#3F9A6E",
  checkSoft: "#E1F1E8",
  dash: "#A3ACBB",
  // дом
  wall: "#EDE6D8",
  wallShade: "#E3DACA",
  wallEvening: "#E6D2B4",
  floor: "#D6C3A3",
  floorEvening: "#C2A47D",
  wood: "#C59A6C",
  woodDark: "#9C7550",
  sofa: "#8FA6B6",
  sofaShade: "#7790A2",
  sofaEvening: "#7F93A0",
  armchair: "#A9B98F",
  armchairShade: "#93A579",
  rug: "#D9C7A6",
  rugBorder: "#C2A57B",
  green: "#86A97C",
  greenDark: "#6C8F63",
  greyBlue: "#9EB0C2",
  beige: "#E6D8BF",
  glass: "#CFE0EC",
  sky: "#DCE9F2",
  night: "#2A3552",
  lampGlow: "rgba(255,206,140,0.40)",
  // офис
  office: "#E8EDF2",
  officeShade: "#D7DFE8",
  white: "#FFFFFF",
} as const;

// Шрифт: Nunito (OFL, public/fonts/Nunito-Variable.ttf) — есть Ү ү, Ө ө,
// Ң ң (проверено по cmap). Стрелки маршрута рисуются SVG: глифа «→» в
// Nunito нет.
export const F = { text: "Nunito" } as const;

// Безопасные поля кадра 1080×1920 (интерфейс Reels): критичное — в
// x = 96…936, y = 150…1560. Субтитры — над нижней границей 1560.
export const SAFE = { left: 96, right: 936, top: 150, bottom: 1560 } as const;
export const SUB = { x: 96, w: 840, bottomY: 1548, topY: 170 } as const;

// Мягкие тени карточек (единый язык: радиусы 28/20, свет сверху-слева).
export const SHADOW = {
  card: "0 30px 60px rgba(23,38,61,0.12), 0 8px 18px rgba(23,38,61,0.08)",
  soft: "0 14px 30px rgba(23,38,61,0.10), 0 3px 8px rgba(23,38,61,0.06)",
  lift: "0 40px 80px rgba(23,38,61,0.16), 0 10px 24px rgba(23,38,61,0.10)",
} as const;
export const RADIUS = { card: 28, inner: 20, chip: 999 } as const;
