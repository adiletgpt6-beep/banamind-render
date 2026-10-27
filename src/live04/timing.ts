// Константы и длительность BalaGoLive04Motion. Без импортов Remotion —
// файл читают и Node-тесты (scripts/live04/live04.test.mjs).
import { LIVE04_BRAND_LINE } from "./brand.ts";

export const LIVE04 = {
  id: "BalaGoLive04Motion",
  fps: 30,
  width: 1080,
  height: 1920,
  source: "live04/src/1000211283.mp4",
  voice: "live04/voice.wav",
  sourceDuration: 34.5,
  // склейки исходника (сек): план 1…7
  cuts: [4.03, 8.93, 14.3, 18.2, 21.7, 27.1] as const,
  // бренд-озвучка: через 0,8 с после последнего слова Адилета
  brandAt: 34.9,
  // минимум после последнего слова (AGENTS.md: ≥ 3 с), берём с запасом
  holdAfterLastWord: 3.6,
} as const;

export type BrandVoice = {
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words: readonly { readonly text: string; readonly start: number; readonly end: number }[];
};

// Длительность ролика: бренд-реплика + удержание финала ≥ 3 с после
// последнего слова. Без файла озвучки — по оценке (черновик).
export const live04Timing = (brand: BrandVoice | null) => {
  const speechEnd = LIVE04.brandAt + (brand ? brand.speechEnd : LIVE04_BRAND_LINE.estimateSec);
  const total = speechEnd + LIVE04.holdAfterLastWord;
  return { brandSpeechEnd: speechEnd, totalSec: total, frames: Math.ceil(total * LIVE04.fps) };
};
