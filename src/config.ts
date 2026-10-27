// Единая конфигурация ролика BalaGoPromo.
// Здесь собраны тексты, цвета, пути к материалам и тайминги —
// для правок обычно достаточно менять только этот файл.
// Файл намеренно без импортов: его читает и scripts/render-stills.mjs.

export const VIDEO = {
  id: "BalaGoPromo",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 25 * 30, // 25 секунд
} as const;

// Отступы под интерфейс Instagram Reels / Stories (в пикселях кадра 1080×1920).
// Сверху — профиль и кнопки, снизу — подпись и поле комментария,
// справа — колонка лайков/комментариев/репостов.
export const SAFE = {
  top: 250,
  bottom: 400,
  left: 90,
  right: 150,
} as const;

export const COLORS = {
  background: "#FFFFFF",
  yellow: "#FFC90E",
  yellowSoft: "#FFF4C2",
  navy: "#14285A",
  navySoft: "#3A4F80",
  sky: "#EAF3FC",
  street: "#FFFFFF",
  block: "#DCE8F5",
  shadow: "rgba(20, 40, 90, 0.18)",
  white: "#FFFFFF",
} as const;

// Пути относительно папки public/ (используются через staticFile()).
export const ASSETS = {
  logo: "assets/logo.png",
  portrait: "assets/portrait.jpg",
  carExterior: "assets/car-exterior.jpg",
  carInterior: "assets/car-interior.png",
} as const;

// Кадрирование фотографий: точка фокуса (в % по ширине/высоте исходника)
// и плавное приближение zoomFrom → zoomTo за время сцены.
export const PHOTO_CROP = {
  portrait: { focusX: 50, focusY: 42, zoomFrom: 1.02, zoomTo: 1.1 },
  carExterior: { focusX: 46, focusY: 54, zoomFrom: 1.12, zoomTo: 1.22 },
  carInterior: { focusX: 50, focusY: 52, zoomFrom: 1.05, zoomTo: 1.15 },
} as const;

// Озвучка. Положите файл, например, в public/audio/voiceover.mp3
// и укажите путь: src: "audio/voiceover.mp3". null — ролик без звука.
export const AUDIO: { src: string | null; volume: number } = {
  src: null,
  volume: 1,
};

// Все надписи в кадре — на кыргызском.
export const TEXT = {
  hook: {
    question: "Балаңызды мектепке жеткирүүгө убакыт жетпей жатабы?",
    // Слово из вопроса, которое подсвечивается жёлтым маркером.
    highlight: "убакыт",
    brand: "BalaGo",
    tagline: "Балдар үчүн такси",
  },
  route: {
    stops: ["ҮЙ", "МЕКТЕП", "ҮЙ"],
    homeLabel: "ҮЙ",
    schoolLabel: "МЕКТЕП",
  },
  driver: {
    tripsNumber: 5000,
    tripsSuffix: "+",
    tripsCaption: "сапар тажрыйбасы",
    kidsExperience: "Балдар менен иштөө тажрыйбасы",
  },
  car: {
    features: ["Таза салон", "Ыңгайлуу сапар", "Камкор мамиле"],
  },
  cta: {
    title: "BalaGo менен жолго чыгалы!",
    subtitle: "Баланы каттоо үчүн профилдеги шилтемеге өтүңүз",
    button: "Баланы каттоо",
  },
} as const;

// Длительность сцен в кадрах (30 кадров = 1 секунда).
// Между сценами — плавный переход TRANSITION_FRAMES, который «съедает»
// длительность: сумма сцен − переходы × 4 должна быть равна 750 кадрам.
export const TRANSITION_FRAMES = 15;

export const SCENES = {
  hook: 165, // 0–5 с
  route: 165, // 5–10 с
  driver: 165, // 10–15 с
  car: 165, // 15–20 с
  cta: 150, // 20–25 с
} as const;

export const TOTAL_FRAMES =
  SCENES.hook +
  SCENES.route +
  SCENES.driver +
  SCENES.car +
  SCENES.cta -
  TRANSITION_FRAMES * 4;

// Кадры для контрольных скриншотов (scripts/render-stills.mjs).
export const CHECK_FRAMES: { name: string; frame: number }[] = [
  { name: "01-hook-question", frame: 60 },
  { name: "02-hook-brand", frame: 140 },
  { name: "03-route", frame: 255 },
  { name: "04-driver", frame: 420 },
  { name: "05-car", frame: 570 },
  { name: "06-cta", frame: 720 },
];
