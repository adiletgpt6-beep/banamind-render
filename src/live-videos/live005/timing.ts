// LIVE-005: размеры, пути и склейки исходника. Без импортов Remotion.
import { FACE_CUTS } from "./face-data.ts";
import { LIVE005_WORDS } from "./transcript.ts";

export const LIVE005 = {
  fps: 30,
  width: 1080,
  height: 1920,
  // Исходник из приватного R2 (live-videos.yml → prepare); в Git не хранится.
  source: "live-videos/live005/source.mp4",
  // Оригинальный голос (scripts/live-videos/prepare-voice.mjs).
  voice: "live-videos/live005/voice.wav",
  music: "audio/live/live005/music.mp3",
  sourceSec: 32.32,
} as const;

// Ролик заканчивается вместе с живой записью — естественный финал.
export const LIVE005_FRAMES = Math.floor(LIVE005.sourceSec * LIVE005.fps);
export const LIVE005_END = LIVE005_FRAMES / LIVE005.fps;

// Склейки внутри исходника (автор монтировал в телефоне; ffmpeg scene).
export const CUTS = FACE_CUTS;

// Момент слова по индексу (секунды исходника).
export const at = (i: number) => LIVE005_WORDS[i].start;
export const end = (i: number) => LIVE005_WORDS[i].end;

// Реальные жесты автора (покадрово по копии исходника, кадр 1080×1920).
export const GESTURE = {
  shrug: { from: 2.55, to: 3.6 }, // «калсачы?» — ладони раскрыты
  palmLeft: { from: 7.85, to: 9.3, palm: { x: 90, y: 1110 } }, // «жумушту таштап…» — ладонь влево
  palmRight: { from: 9.3, to: 10.45, palm: { x: 990, y: 1110 } }, // «же башка бирөөдөн…» — вторая ладонь
  fingerOne: { from: 21.15, to: 21.6 }, // «уюштуруп коюу» — палец вверх
  pointUp: { from: 27.55, to: 28.65, tip: { x: 507, y: 672 } }, // «профилдеги шилтемеге»
  pointDown: { from: 28.8, to: 29.85, tip: { x: 532, y: 952 } }, // «төмөнкү WhatsApp'ка»
  openHands: { from: 30.8, to: 31.45 }, // «Биз дайыма кызматтабыз»
} as const;
