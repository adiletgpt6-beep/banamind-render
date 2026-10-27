// Общие параметры образовательной серии LESSON-80: горизонтальное видео
// 1920×1080, 30 кадров/с. Файл без зависимостей от Remotion — его читают и
// Node-скрипты озвучки, проверки и тесты.
export const L80_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const FPS = L80_VIDEO.fps;
export const sec = (s: number) => Math.round(s * FPS);
