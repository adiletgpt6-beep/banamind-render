// Реестр сцен и пульт плёнки по времени ролика (общий для кадра и звука).
import { FPS, type SceneProps } from "./kit";
import type { Bg41SceneId } from "./script";
import { Cta, ctaHud } from "./shots/Cta";
import { Decision, decisionHud } from "./shots/Decision";
import { Evening, eveningHud } from "./shots/Evening";
import { Group, groupHud } from "./shots/Group";
import { Route, routeHud } from "./shots/Route";
import { Start, startHud } from "./shots/Start";
import type { HudState } from "./tape";
import type { Bg41Timeline } from "./timing";

export type SceneDef = {
  readonly C: React.FC<SceneProps>;
  // состояние пульта плёнки по кадру сцены; null — пульта нет
  readonly hud: (tl: Bg41Timeline, f: number) => HudState | null;
};

export const SCENES: Record<Bg41SceneId, SceneDef> = {
  evening: { C: Evening, hud: eveningHud },
  route: { C: Route, hud: routeHud },
  decision: { C: Decision, hud: decisionHud },
  group: { C: Group, hud: groupHud },
  start: { C: Start, hud: startHud },
  cta: { C: Cta, hud: ctaHud },
};

// Растворение на стыке сцен (уходящая сцена замирает на последнем кадре
// и растворяется поверх новой).
export const DISSOLVE = 0.3;

export const hudAt = (tl: Bg41Timeline, t: number): { s: HudState | null; rew: number } => {
  const sc = tl.scenes.find((x) => t >= x.from && t < x.to) ?? tl.scenes[tl.scenes.length - 1];
  const f = Math.round((t - sc.from) * FPS);
  const s = SCENES[sc.id].hud(tl, f);
  // мягкое включение/выключение примет перемотки (±4 кадра)
  let rew = 0;
  for (let k = -4; k <= 4; k++) {
    const tt = t + k / FPS;
    const sk = tl.scenes.find((x) => tt >= x.from && tt < x.to) ?? sc;
    const hk = SCENES[sk.id].hud(tl, Math.round((tt - sk.from) * FPS));
    rew += hk?.mode === "rew" ? 1 : 0;
  }
  return { s, rew: rew / 9 };
};


// Пульт в кадре ролика f (без сглаживания).
export const hudAtFrame = (tl: Bg41Timeline, frame: number): HudState | null => {
  const t = frame / FPS;
  const sc = tl.scenes.find((x) => t >= x.from && t < x.to) ?? tl.scenes[tl.scenes.length - 1];
  return SCENES[sc.id].hud(tl, Math.round((t - sc.from) * FPS));
};
