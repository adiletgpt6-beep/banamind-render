// InfiniteCameraEngine — one continuous "journey depth" J(t) for the whole film.
// J is a log2 magnification: +1 means the camera is twice as close. Keyframes live in
// content/timeline.json; a monotone cubic spline gives physically believable
// acceleration/deceleration (C1-continuous velocity, no overshoot, true holds).
import timeline from "../content/timeline.json";
import { monotoneSpline } from "./math";

export const FPS = timeline.fps;
export const W = 1080;
export const H = 1920;
export const CX = W / 2;
export const CY = H / 2;

const spline = monotoneSpline(timeline.camera as [number, number][]);

export const journeyDepth = (t: number) => spline(t);

/** Zoom speed in octaves per second — drives motion blur / sound intensity. */
export const journeySpeed = (t: number) => (spline(t + 1 / 60) - spline(t - 1 / 60)) * 30;
