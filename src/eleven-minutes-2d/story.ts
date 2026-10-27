// Повествовательные данные графики: карта (узлы, маршруты) и моменты, когда
// открываются этапы поездки и меняется отсчёт до встречи. Время — секунды
// ролика; сцены задают его относительно своего начала, поэтому при сдвиге
// границ сцен события едут вместе с ними.
import { EM2_MEETING_LEFT, EM2_SCENES, EM2_STAGES, type Em2SceneId } from "./script";
import type { Poly } from "./graphics/geom";

const at = (scene: Em2SceneId, dt: number) => EM2_SCENES.find((s) => s.id === scene)!.from + dt;

// Карта (координаты карты 0…1000 × 0…1100).
export const NODE = {
  office: { x: 250, y: 190 },
  school: { x: 650, y: 560 },
  gate: { x: 650, y: 610 },
  park: { x: 850, y: 760 }, // свободное место дальше от школы
  home: { x: 430, y: 960 },
} as const;
// Занятые места у входа.
export const BUSY_SPOTS = [
  { x: 585, y: 680 },
  { x: 650, y: 680 },
  { x: 715, y: 680 },
] as const;

export const ROUTE: Record<string, Poly> = {
  drive: [NODE.office, { x: 250, y: 320 }, { x: 460, y: 320 }, { x: 460, y: 500 }, { x: 650, y: 500 }, NODE.gate],
  park: [NODE.gate, { x: 650, y: 650 }, { x: 760, y: 650 }, { x: 850, y: 650 }, NODE.park],
  walk: [NODE.park, { x: 850, y: 650 }, { x: 650, y: 650 }, NODE.gate],
  kit: [NODE.gate, { x: 650, y: 540 }, { x: 610, y: 520 }, { x: 650, y: 540 }, NODE.gate],
  back: [NODE.gate, { x: 650, y: 650 }, { x: 850, y: 650 }, NODE.park],
  home: [NODE.park, { x: 850, y: 860 }, { x: 640, y: 860 }, { x: 640, y: 1030 }, { x: 430, y: 1030 }, NODE.home],
  office: [NODE.home, { x: 430, y: 860 }, { x: 250, y: 860 }, { x: 250, y: 500 }, { x: 250, y: 320 }, NODE.office],
};
// Пунктир — пешком.
export const ON_FOOT = new Set(["walk", "kit", "back"]);

// Когда этап «закрывается» (запись в журнале, накопитель растёт).
export const STAGE_AT: Record<string, number> = {
  drive: at("leave", 5.6),
  park: at("parking", 3.4),
  walk: at("parking", 6.2),
  wait: at("waiting", 4.6),
  kit: at("form", 6.0),
  back: at("form", 7.6),
  home: at("road", 5.2),
  granny: at("grandma", 4.8),
  office: at("same11", 2.0),
};
// Анимация маршрута этапа: [начало, конец] движения маркера, с.
export const STAGE_MOVE: Record<string, readonly [number, number]> = {
  drive: [at("leave", 2.2), STAGE_AT.drive],
  park: [at("parking", 0.6), STAGE_AT.park],
  walk: [STAGE_AT.park + 0.4, STAGE_AT.walk],
  kit: [at("form", 4.8), STAGE_AT.kit],
  back: [STAGE_AT.kit + 0.2, STAGE_AT.back],
  home: [at("road", 0.4), STAGE_AT.home],
  office: [at("same11", 0.1), STAGE_AT.office],
};

// Сколько минут уже набралось к моменту t (секунды ролика).
export const totalAt = (t: number) => {
  let total = 0;
  for (const s of EM2_STAGES) if (t >= STAGE_AT[s.id]) total = s.total;
  return total;
};
export const stagesAt = (t: number) => EM2_STAGES.filter((s) => t >= STAGE_AT[s.id]);

// Отсчёт до встречи: появляется на реплике «жыйырма мүнөт», затем
// уменьшается вместе с этапами (20 → 12 → 8 → 1).
export const MEETING_SHOW = at("car", 6.4);
export const meetingLeftAt = (t: number): number | null => {
  if (t < MEETING_SHOW) return null;
  let left: number | null = null;
  for (const [id, v] of Object.entries(EM2_MEETING_LEFT)) if (t >= Math.max(STAGE_AT[id], id === "back" ? MEETING_SHOW : 0)) left = v;
  return left;
};

export { at as sceneAt };
