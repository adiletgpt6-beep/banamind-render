// SCENE 8 — ENDING (00:58–01:00)
// The quote fades out as a whole; the sand composition recedes from the
// camera and the typographic MUSLIM KIDS end card appears (no official logo
// is available in this project, so none is invented).
import type {BuildContext} from '../engines/SandUniverseEngine';

export const buildScene08 = (ctx: BuildContext) => {
	ctx.camera.add({t: 60, pos: [0, 1.6, 33.5], target: [0, 1.4, 0], fov: 35});
};
