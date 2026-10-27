// Общие помощники сцен фильма №33: кадры реплик, рост на разной глубине,
// посадка, позы рук. Все сцены используют одни и те же константы — у
// персонажей одинаковые пропорции и размеры во всех планах.
import type { Place, PoseIn, WorldArm } from "../rig/Actor";
import { H } from "../rig/looks";
import { MOV_SCENES, MOV_VIDEO, sceneById, type MovSceneId } from "../script";
import type { MovCue } from "../timing";

export const FPS = MOV_VIDEO.fps;
export { H };

// Длина сцены в кадрах.
export const sceneLen = (id: MovSceneId) => {
  const s = sceneById(id);
  return Math.round(s.to * FPS) - Math.round(s.from * FPS);
};

// Начало и конец реплики в кадрах сцены (по фактической озвучке).
export const lineFrames = (cues: readonly MovCue[], id: string) => {
  const c = cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  const scene = MOV_SCENES.find((s) => c.from >= s.from && c.from < s.to)!;
  const start = Math.round(scene.from * FPS);
  return { from: Math.round(c.from * FPS) - start, to: Math.round(c.to * FPS) - start };
};

// Слово реплики (кадр сцены, когда оно начинается) — для акцентов.
export const wordFrame = (cues: readonly MovCue[], id: string, index: number) => {
  const c = cues.find((x) => x.id === id)!;
  const scene = MOV_SCENES.find((s) => c.from >= s.from && c.from < s.to)!;
  const w = c.words[Math.min(index, c.words.length - 1)];
  return Math.round((w ? w.start : c.from) * FPS) - Math.round(scene.from * FPS);
};

// Первое слово реплики, подходящее под образец (кадр сцены) — когда номер
// слова зависит от формулировки. Если слова нет — начало реплики.
export const wordFrameOf = (cues: readonly MovCue[], id: string, re: RegExp) => {
  const c = cues.find((x) => x.id === id)!;
  const i = c.words.findIndex((w) => re.test(w.text));
  return wordFrame(cues, id, i < 0 ? 0 : i);
};

// Масштаб глубины: ближе к камере (больше y) — крупнее (базовая линия y0).
export const depthAt = (y: number, y0: number, k = 0.0005) => 1 + (y - y0) * k;
export const placeAt = (x: number, y: number, h: number, y0 = 1500): Place => ({ x, y, h: h * depthAt(y, y0) });

// Высота сиденья (px от пола) для роста h: стул / диван.
export const chairSeat = (h: number) => (h < 650 ? 0.4 : 0.29) * h;
export const sofaSeat = (h: number) => (h < 650 ? 0.32 : 0.25) * h;

// Опущенная расслабленная рука.
export const hang: WorldArm = { target: null, shape: "relax" };

// Точка у тела (мировые px) по долям роста: dx вправо, dy вверх от ступней.
export const at = (p: Place, dx: number, dy: number) => ({ x: p.x + dx * p.h, y: p.y - dy * p.h });

// Посадка: корпус вперёд (вес на стопы), таз опускается, корпус выпрямляется.
// Вставание — в обратном порядке. t0 — начало движения.
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
export const sitDown = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.25 ? 0 : u >= 1 ? 1 : smooth((u - 0.25) / 0.75);
  const lean = u <= 0 ? 0 : u >= 1.25 ? 0 : u < 0.35 ? 16 * smooth(u / 0.35) : 16 - 14 * smooth((u - 0.35) / 0.9);
  return { sit, lean };
};
export const standUp = (t: number, t0: number, dur = 30) => {
  const u = (t - t0) / dur;
  const sit = u <= 0.3 ? 1 : u >= 1 ? 0 : 1 - smooth((u - 0.3) / 0.7);
  const lean = u <= 0 ? 0 : u >= 1.2 ? 0 : u < 0.35 ? 18 * smooth(u / 0.35) : 18 - 18 * smooth((u - 0.35) / 0.85);
  return { sit, lean };
};

// Говорит ли роль в кадре t (кадр сцены) — для мимики слушающих.
export const speakingAt = (cues: readonly MovCue[], role: MovCue["role"], sceneId: MovSceneId, t: number, pad = 0.15) => {
  const s = sceneById(sceneId).from;
  const sec = s + t / FPS;
  return cues.some((c) => c.role === role && sec >= c.from - pad && sec <= c.to + pad);
};

export type PoseFn = (t: number) => PoseIn;

// ---------- места в гостиной (одни и те же во всех сценах) ----------
// Сидящие на диване: ступни на полу перед диваном (y = 1510), сиденье —
// верх подушки (y ≈ 1282).
export const SOFA = { feetY: 1510, seatTopY: 1282, mom: 1650, dad: 1895, son: 1450 } as const;
export const sofaPlace = (who: "mom" | "dad" | "son"): Place => ({
  x: SOFA[who],
  y: SOFA.feetY,
  h: who === "dad" ? H.dad : who === "son" ? H.son : H.mom,
});
export const sofaSeatH = () => SOFA.feetY - SOFA.seatTopY;
// Сын рядом с мамой за столом (сцены 1, 4) и места танца (сцены 5, 12, 13).
export const LIVING_SPOTS = {
  sonByTable: { x: 1235, y: 1640 },
  momDance: { x: 950, y: 1600 },
  sonDance: { x: 1355, y: 1622 },
} as const;
