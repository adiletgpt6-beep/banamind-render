import data from "./timeline.json";
import type { Range } from "../utils/math";

// Единый таймлайн: тот же JSON читает scripts/build_audio.py для озвучки и звуков.
export type TurnSpec = [number, number, number];
export type SheetSpec = {
  id: string;
  thickness: number;
  front: string;
  back: string;
  turns: TurnSpec[];
};

export const TL = data as unknown as {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  durationSec: number;
  scenes: { id: string; name: string; start: number; end: number }[];
  narration: { id: string; scene: string; start: number; text: string }[];
  book: {
    coverOpen: Range;
    coverClose: Range;
    sheets: SheetSpec[];
    baseTop: string;
    totalPages: number;
  };
  popups: {
    earth: {
      fold: Range;
      rise: Range;
      expand: Range;
      stand: Range;
      orbits: Range;
      sun: Range;
      beam: Range;
      spinStart: number;
      collapse: Range;
    };
    mountains: { rise: Range; hills: Range; clouds: Range; river: Range; collapse: Range };
    tree: { seed: Range; cloud: Range; rain: Range; sprout: Range; grow: Range; collapse: Range };
    universe: {
      arch: Range;
      sun: Range;
      orbits: Range;
      earth: Range;
      planets: Range;
      stars: Range;
      collapse: Range;
    };
    frame: { rise: Range; collapse: Range };
  };
  overlays: Record<"day" | "night" | "reflect" | "ayah" | "question" | "brand", Range>;
};

export const FPS = TL.fps;
export const DURATION_FRAMES = Math.round(TL.durationSec * TL.fps);
