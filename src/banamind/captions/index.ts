// Анимированные титры BanaMind: стиль, расчёт по таймкодам озвучки, компонент.
export { CAPTION_STYLE, type CaptionStyle } from "./style.ts";
export { buildCaptionCues, timeWords, wrapRows, type CaptionBook, type CaptionCue, type CaptionWord, type SpokenLine } from "./build.ts";
export { BanaMindAnimatedCaptions } from "./BanaMindAnimatedCaptions.tsx";
