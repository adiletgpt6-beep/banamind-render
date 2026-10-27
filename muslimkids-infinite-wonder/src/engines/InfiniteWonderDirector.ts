// InfiniteWonderDirector — единый дирижёр фильма.
// По номеру кадра детерминированно вычисляет всё состояние мира:
// ось масштаба, позу камеры, краску, вращение Земли, облачную завесу,
// раскрытие листа, подписи, цитату и финал. Компоненты только рисуют.
import timeline from "../timeline.json";
import { windowed, smoothstep } from "./CameraTransitionEngine";
import {
  RETURN_START,
  WORLD_SWITCH,
  cameraPose,
  earthLift,
  earthSpin,
  journeyS,
} from "./InfiniteJourneyEngine";
import { paintState } from "./PaintToLifeEngine";
import { discoveryState } from "./LayerDiscoveryEngine";

export const FPS = timeline.fps;
export const DURATION_FRAMES = timeline.fps * timeline.durationSec;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type CameraMode = "discovery" | "understanding";

export function directorState(frame: number) {
  const t = frame / FPS;
  const s = journeyS(t);
  const world = s < WORLD_SWITCH ? "space" : "nature";
  const pose = cameraPose(t, s);
  const paint = paintState(t, s);
  const discovery = discoveryState(s, t);
  const forward = t < RETURN_START;

  // Облачная завеса: пик ровно на смене миров.
  const veil = smoothstep(4.42, 4.97, s) * (1 - smoothstep(5.03, 5.62, s));

  // Режим камеры: «открытие» (полёт) или «понимание» (рассматриваем).
  const ds = Math.abs(journeyS(t + 0.1) - journeyS(t - 0.1)) / 0.2;
  const mode: CameraMode = ds > 0.35 ? "discovery" : "understanding";

  const q = timeline.quran;
  const quran = windowed(t, q.in, q.in + 0.9, q.out - 0.7, q.out);
  const ending = smoothstep(timeline.ending.in, timeline.ending.in + 0.8, t);

  const labels = {
    dayNight: forward ? windowed(t, 9.0, 9.7, 13.0, 13.7) : 0,
    axis: forward ? windowed(t, 8.7, 9.6, 13.2, 14.0) : 0,
    schema: forward ? windowed(t, 27.9, 28.5, 35.7, 36.2) : 0,
    layers: forward ? windowed(t, 30.4, 31.2, 35.3, 35.9) : 0,
    model: forward ? windowed(t, 36.1, 36.7, 42.6, 43.3) : 0,
    cell: forward ? windowed(t, 38.5, 39.3, 42.4, 43.0) : 0,
  };

  return {
    t,
    s,
    world,
    pose,
    mode,
    forward,
    paint,
    discovery,
    earth: { lift: earthLift(s), spin: earthSpin(t) },
    veil,
    labels,
    quran,
    ending,
  };
}

export type DirectorState = ReturnType<typeof directorState>;
