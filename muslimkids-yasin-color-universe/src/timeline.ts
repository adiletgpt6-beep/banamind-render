// Общий таймлайн ролика: девять сцен, один непрерывный пул точек.
import { scene01 } from "./scenes/Scene01YasinIntro";
import { scene02 } from "./scenes/Scene02SurahNumbers";
import { scene03 } from "./scenes/Scene03WiseQuran";
import { scene04 } from "./scenes/Scene04LivingEarth";
import { scene05 } from "./scenes/Scene05DayNight";
import { scene06 } from "./scenes/Scene06Orbits";
import { scene07 } from "./scenes/Scene07Actions";
import { scene08 } from "./scenes/Scene08Resurrection";
import { scene09 } from "./scenes/Scene09Finale";
import type { BgKey } from "./engines/ColorDotEngine";
import type { CamKey } from "./engines/CameraController";

export const FPS = 30;
export const DURATION_S = 80;
export const DURATION_FRAMES = FPS * DURATION_S; // 2400
export const DOT_POOL = 7000;

export const SCENES = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08, scene09];
export const KEYFRAMES = SCENES.flatMap((s) => s.keyframes);
export const TEXTS = SCENES.flatMap((s) => s.texts);
export const CUES = SCENES.flatMap((s) => s.cues ?? []);

// Фоны держатся долго и сменяются мягким наплывом (без стробоскопа).
export const BACKGROUNDS: BgKey[] = [
  { at: 0, dur: 0, top: "#081126", bottom: "#0D1A3F" }, // BG1 глубокий тёмно-синий
  { at: 6.5, dur: 0.8, top: "#F8FAFF", bottom: "#EEF2FF" }, // BG3 молочно-белый
  { at: 14.35, dur: 0.8, top: "#14143A", bottom: "#1C1650" }, // BG5 индиго
  { at: 23.6, dur: 0.9, top: "#171133", bottom: "#26124A" }, // BG2 фиолетово-синий
  { at: 34.2, dur: 0.8, top: "#EAF8FF", bottom: "#CDEBFF" }, // BG4 светло-голубой — день
  { at: 35.85, dur: 0.6, top: "#0A1130", bottom: "#17184A" }, // ночь
  { at: 45.2, dur: 0.9, top: "#0F2E86", bottom: "#3E1678" }, // BG6 градиент синий → фиолетовый
  { at: 55.5, dur: 0.8, top: "#F8FAFF", bottom: "#EEF2FF" }, // BG3
  { at: 64.4, dur: 0.9, top: "#1B0F42", bottom: "#2E0F58" }, // глубокий фиолетовый
  { at: 71.7, dur: 1.0, top: "#081126", bottom: "#1A1252" }, // BG1 → индиго
];

export const CAMERA: CamKey[] = [
  { at: 0, s: 1 },
  { at: 5.2, s: 1.04, ease: "inout" },
  { at: 7.0, s: 1, ease: "inout" },
  { at: 11.6, s: 1 },
  { at: 12.45, s: 1.09, cy: 1000, ease: "inout" }, // приближение к сетке 83
  { at: 13.3, s: 1, ease: "inout" },
  { at: 19.0, s: 1 },
  { at: 23.6, s: 1.03, ease: "inout" },
  { at: 25.0, s: 1, ease: "inout" },
  { at: 32.7, s: 1 },
  { at: 34.6, s: 1.05, cy: 1100, ease: "inout" },
  { at: 35.8, s: 1, ease: "inout" },
  { at: 50.4, s: 1 },
  { at: 54.6, s: 0.92, cy: 1090, ease: "inout" }, // камера отдаляется
  { at: 56.5, s: 1, ease: "inout" },
  { at: 71.9, s: 1 },
  { at: 73.0, s: 1.12, cy: 1000, ease: "inout" },
  { at: 75.7, s: 1, ease: "inout" }, // большая вселенная: отдаление
  { at: 80, s: 1.02, ease: "inout" },
];
